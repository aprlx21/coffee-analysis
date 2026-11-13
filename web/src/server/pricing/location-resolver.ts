import "server-only";

import type { CafeSnapshotRow } from "@/server/db/queries/snapshot";

import type { ResolveLocationInput, ResolveLocationResult } from "./types";

/** Chuẩn hóa chuỗi tiếng Việt: bỏ dấu, ký tự đặc biệt, chuyển chữ thường */
function normalizeText(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Khớp theo ranh giới từ trên chuỗi đã chuẩn hoá: "an thuong 3" KHÔNG khớp trong "an thuong 34". */
function containsWords(haystack: string, needle: string): boolean {
  return needle.length > 0 && ` ${haystack} `.includes(` ${needle} `);
}

/** Bóc tách số nhà và tên đường từ địa chỉ quán trong database */
function parseShopAddress(rawAddress: string | null): { houseNumber: number | null; streetName: string } | null {
  if (!rawAddress) return null;
  const firstPart = rawAddress.split(",")[0].trim();
  const match = firstPart.match(/^(?:lô\s*\d+\s+)?(?:số\s+)?([A-Za-z]?\d+(?:\/\d+)?)\s+(.+)$/i);
  if (match) {
    const numMatch = match[1].match(/\d+/);
    return {
      houseNumber: numMatch ? parseInt(numMatch[0], 10) : null,
      streetName: match[2].trim(),
    };
  }
  return {
    houseNumber: null,
    streetName: firstPart,
  };
}

/** Tách số nhà người dùng nhập từ query sau khi đã loại bỏ tên đường */
function parseUserHouseNumber(query: string, matchedStreetNorm: string): number | null {
  const normQuery = normalizeText(query);
  const withoutStreet = normQuery.replace(matchedStreetNorm, " ").trim();
  const match = withoutStreet.match(/(?:so\s+)?(\d+)(?:\/\d+)*\b/);
  return match ? parseInt(match[1], 10) : null;
}

/** Bộ nhớ đệm trong tiến trình cho các truy vấn Nominatim thành công */
const nominatimCache = new Map<string, { lat: number; lng: number; displayName: string }>();

/**
 * Phân giải địa chỉ thành tọa độ (server-only).
 * Thứ tự ưu tiên:
 * 1. Tọa độ trực tiếp (lat/lng)
 * 2. Khớp quán hiện có trong snapshot (tên hoặc địa chỉ, không phân biệt hoa thường/dấu)
 * 3. Khớp đường offline (số nhà gần nhất hoặc trung vị tọa độ các quán trên đường)
 * 4. Fallback OpenStreetMap Nominatim (timeout 8s, User-Agent chuẩn, có cache)
 */
export async function resolveLocation(
  input: ResolveLocationInput,
  cafes: CafeSnapshotRow[],
): Promise<ResolveLocationResult> {
  const { address, placeName, lat, lng } = input;

  // 1. Tọa độ trực tiếp
  if (typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng)) {
    return {
      success: true,
      lat,
      lng,
      resolvedLabel: placeName || address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      source: "coordinates",
      approximate: false,
    };
  }

  // Có cả tên quán lẫn địa chỉ: thử tên quán trước, không ra thì dùng địa chỉ (tên quán mới chưa có trong dữ liệu).
  if (placeName?.trim() && address?.trim() && placeName.trim() !== address.trim()) {
    const byName = await resolveLocation({ placeName }, cafes);
    return byName.success ? byName : resolveLocation({ address }, cafes);
  }

  const query = (placeName || address || "").trim();
  // Sau chuẩn hoá phải còn tối thiểu 3 ký tự, nếu không mọi phép so khớp chuỗi đều khớp bừa.
  if (normalizeText(query).length < 3) {
    return {
      success: false,
      error: "MISSING_QUERY",
      message: "Vui lòng cung cấp tên quán hoặc địa chỉ để định giá đồ uống.",
    };
  }

  const normQuery = normalizeText(query);
  const usableCafes = cafes.filter(
    (c): c is CafeSnapshotRow & { lat: number; lng: number } => c.lat !== null && c.lng !== null,
  );

  // 2. Khớp quán hiện có trong snapshot (tên hoặc địa chỉ)
  // 2.1. Khớp tên quán tuyệt đối
  for (const c of usableCafes) {
    if (normalizeText(c.name) === normQuery) {
      return {
        success: true,
        lat: c.lat,
        lng: c.lng,
        resolvedLabel: `${c.name}${c.address ? ` (${c.address})` : ""}`,
        source: "shop-match",
        approximate: false,
      };
    }
  }

  // 2.2. Khớp tên quán tương đối (nếu query đủ dài >= 4 ký tự)
  if (normQuery.length >= 4) {
    const matched = usableCafes.find((c) => {
      const normName = normalizeText(c.name);
      return containsWords(normName, normQuery) || (normName.length >= 4 && containsWords(normQuery, normName));
    });
    if (matched) {
      return {
        success: true,
        lat: matched.lat,
        lng: matched.lng,
        resolvedLabel: `${matched.name}${matched.address ? ` (${matched.address})` : ""}`,
        source: "shop-match",
        approximate: false,
      };
    }
  }

  // 2.3. Khớp địa chỉ quán chính xác trong snapshot
  for (const c of usableCafes) {
    if (!c.address) continue;
    const normAddr = normalizeText(c.address);
    if (normAddr === normQuery || normAddr.startsWith(`${normQuery} `)) {
      return {
        success: true,
        lat: c.lat,
        lng: c.lng,
        resolvedLabel: `${c.name} (${c.address})`,
        source: "shop-match",
        approximate: false,
      };
    }
  }

  // 3. Khớp đường offline từ dữ liệu các quán trong khu vực
  const streetShopsMap = new Map<
    string,
    { originalName: string; shops: (CafeSnapshotRow & { lat: number; lng: number; houseNumber: number | null })[] }
  >();

  for (const c of usableCafes) {
    const parsed = parseShopAddress(c.address);
    if (!parsed) continue;
    const normStreet = normalizeText(parsed.streetName);
    if (normStreet.length < 3) continue;

    if (!streetShopsMap.has(normStreet)) {
      streetShopsMap.set(normStreet, { originalName: parsed.streetName, shops: [] });
    }
    streetShopsMap.get(normStreet)!.shops.push({
      ...c,
      houseNumber: parsed.houseNumber,
    });
  }

  // Sắp xếp tên đường theo độ dài giảm dần (để "an thuong 18" khớp trước "an thuong 1")
  const sortedStreets = [...streetShopsMap.keys()].sort((a, b) => b.length - a.length);
  let matchedStreetNorm: string | null = null;
  for (const s of sortedStreets) {
    if (containsWords(normQuery, s)) {
      matchedStreetNorm = s;
      break;
    }
  }

  if (matchedStreetNorm) {
    const streetEntry = streetShopsMap.get(matchedStreetNorm)!;
    const shopsOnStreet = streetEntry.shops;
    const userHouseNumber = parseUserHouseNumber(query, matchedStreetNorm);

    // Nếu tìm thấy số nhà người dùng: lấy quán có số nhà gần nhất
    if (userHouseNumber !== null) {
      const shopsWithNum = shopsOnStreet.filter((s) => typeof s.houseNumber === "number");
      if (shopsWithNum.length > 0) {
        shopsWithNum.sort(
          (a, b) => Math.abs(a.houseNumber! - userHouseNumber) - Math.abs(b.houseNumber! - userHouseNumber),
        );
        const nearest = shopsWithNum[0];
        return {
          success: true,
          lat: nearest.lat,
          lng: nearest.lng,
          resolvedLabel: `${query} (ước lượng theo số nhà gần nhất: ${nearest.houseNumber} - ${nearest.name})`,
          source: "street-estimate",
          approximate: true,
        };
      }
    }

    // Không có số nhà: lấy trung vị tọa độ các quán trên tuyến đường
    const lats = [...shopsOnStreet.map((s) => s.lat)].sort((a, b) => a - b);
    const lngs = [...shopsOnStreet.map((s) => s.lng)].sort((a, b) => a - b);
    const medianLat = lats[Math.floor(lats.length / 2)];
    const medianLng = lngs[Math.floor(lngs.length / 2)];

    return {
      success: true,
      lat: medianLat,
      lng: medianLng,
      resolvedLabel: `Đường ${streetEntry.originalName} (ước lượng theo trung vị ${shopsOnStreet.length} quán trên đường)`,
      source: "street-estimate",
      approximate: true,
    };
  }

  // 4. Fallback sang OpenStreetMap Nominatim
  const cacheKey = normQuery;
  const cached = nominatimCache.get(cacheKey);
  if (cached) {
    return {
      success: true,
      lat: cached.lat,
      lng: cached.lng,
      resolvedLabel: cached.displayName,
      source: "nominatim",
      approximate: true,
    };
  }

  try {
    const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
    nominatimUrl.searchParams.set("format", "jsonv2");
    nominatimUrl.searchParams.set("limit", "1");
    nominatimUrl.searchParams.set("countrycodes", "vn");
    // Viewbox khu vực An Thượng (kinh độ Tây, vĩ độ Bắc, kinh độ Đông, vĩ độ Nam)
    nominatimUrl.searchParams.set("viewbox", "108.235,16.065,108.255,16.035");
    nominatimUrl.searchParams.set("bounded", "1");
    nominatimUrl.searchParams.set("q", `${query}, Ngũ Hành Sơn, Đà Nẵng`);

    const res = await fetch(nominatimUrl.toString(), {
      headers: {
        "User-Agent": "CoffeeAnalysisDanang/1.0 (An Thuong F&B Pricing Assistant; non-commercial)",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const parsedLat = parseFloat(item.lat);
        const parsedLng = parseFloat(item.lon);

        if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) {
          // Giới hạn kích thước cache: bỏ phần tử cũ nhất khi đầy.
          if (nominatimCache.size >= 500) {
            const oldest = nominatimCache.keys().next().value;
            if (oldest !== undefined) nominatimCache.delete(oldest);
          }
          nominatimCache.set(cacheKey, {
            lat: parsedLat,
            lng: parsedLng,
            displayName: item.display_name,
          });

          return {
            success: true,
            lat: parsedLat,
            lng: parsedLng,
            resolvedLabel: item.display_name,
            source: "nominatim",
            approximate: true,
          };
        }
      }
    }
  } catch {
    // Không bao giờ throw ra ngoài — chuyển tiếp sang kết quả thất bại có cấu trúc
  }

  return {
    success: false,
    error: "LOCATION_NOT_FOUND",
    message:
      "Không xác định được vị trí từ thông tin bạn cung cấp. Vui lòng cung cấp số nhà, tên đường cụ thể hơn tại khu vực An Thượng hoặc chấm chọn trực tiếp mặt bằng trên trang /dinh-gia.",
  };
}
