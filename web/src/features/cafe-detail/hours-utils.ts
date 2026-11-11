import type { DaySchedule } from "./types";

export const VIETNAMESE_DAYS: Record<string, string> = {
  Monday: "Thứ Hai",
  Tuesday: "Thứ Ba",
  Wednesday: "Thứ Tư",
  Thursday: "Thứ Năm",
  Friday: "Thứ Sáu",
  Saturday: "Thứ Bảy",
  Sunday: "Chủ Nhật",
};

const DAYS_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface ParsedTime {
  h: number;
  m: number;
  meridiem: string | null;
}

function parseTimePart(str: string): ParsedTime | null {
  const trimmed = str.trim();
  const match = trimmed.match(/^(\d+)(?::(\d+))?\s*(AM|PM)?$/i);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3] ? match[3].toUpperCase() : null;
  return { h, m, meridiem };
}

export interface ParsedTimeRange {
  type: "open24" | "closed" | "range" | "unknown";
  startMin?: number;
  endMin?: number;
}

export function parseTimeRange(rangeStr: string): ParsedTimeRange {
  const norm = rangeStr.trim().toLowerCase();
  if (norm.includes("open 24") || norm === "open 24 hours") {
    return { type: "open24" };
  }
  if (norm.includes("closed")) {
    return { type: "closed" };
  }

  const parts = rangeStr.split("-");
  if (parts.length !== 2) return { type: "unknown" };

  const start = parseTimePart(parts[0]);
  const end = parseTimePart(parts[1]);
  if (!start || !end) return { type: "unknown" };

  if (!start.meridiem && end.meridiem) {
    if (start.h > end.h && end.meridiem === "PM") {
      start.meridiem = "AM";
    } else {
      start.meridiem = end.meridiem;
    }
  }

  function toMinutes(t: ParsedTime): number {
    let hour = t.h;
    if (t.meridiem === "PM" && hour !== 12) hour += 12;
    if (t.meridiem === "AM" && hour === 12) hour = 0;
    return hour * 60 + t.m;
  }

  const startMin = toMinutes(start);
  let endMin = toMinutes(end);
  if (end.meridiem === "AM" && end.h === 12 && startMin > 0) {
    endMin = 24 * 60;
  }

  return { type: "range", startMin, endMin };
}

export function getVietnamCurrentTime(): { dayName: string; currentMin: number } {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const weekdayPart = parts.find((p) => p.type === "weekday")?.value ?? "Monday";
  const hourPart = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const minutePart = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);

  return {
    dayName: weekdayPart,
    currentMin: hourPart * 60 + minutePart,
  };
}

export function parseHoursData(raw: unknown): DaySchedule[] {
  if (!Array.isArray(raw)) return [];
  const result: DaySchedule[] = [];
  for (const item of raw) {
    if (typeof item === "object" && item !== null && "day" in item && "times" in item) {
      const day = String((item as { day: unknown }).day);
      const timesRaw = (item as { times: unknown }).times;
      const times = Array.isArray(timesRaw) ? timesRaw.map(String) : [String(timesRaw)];
      result.push({ day, times });
    }
  }
  return result;
}

export interface OpenStatusResult {
  isOpen: boolean | null;
  todayScheduleText: string;
  todayDayName: string;
  isToday: (day: string) => boolean;
}

export function checkCafeOpenStatus(rawHours: unknown): OpenStatusResult {
  const schedules = parseHoursData(rawHours);
  const { dayName: currentDay, currentMin } = getVietnamCurrentTime();

  if (schedules.length === 0) {
    return {
      isOpen: null,
      todayScheduleText: "Chưa cập nhật giờ",
      todayDayName: currentDay,
      isToday: (day: string) => day.toLowerCase() === currentDay.toLowerCase(),
    };
  }

  const todayItem = schedules.find((s) => s.day.toLowerCase() === currentDay.toLowerCase());
  const todayTimes = todayItem?.times ?? [];
  const todayScheduleText = todayTimes.join(", ") || "Không có thông tin";

  // Check today's time slots
  let isOpenNow = false;
  for (const timeStr of todayTimes) {
    const parsed = parseTimeRange(timeStr);
    if (parsed.type === "open24") {
      isOpenNow = true;
      break;
    }
    if (parsed.type === "range" && parsed.startMin !== undefined && parsed.endMin !== undefined) {
      if (parsed.startMin <= parsed.endMin) {
        if (currentMin >= parsed.startMin && currentMin < parsed.endMin) {
          isOpenNow = true;
          break;
        }
      } else {
        // Spans past midnight (e.g. 16:00 to 01:00)
        if (currentMin >= parsed.startMin) {
          isOpenNow = true;
          break;
        }
      }
    }
  }

  // Also check if yesterday's slot crossed past midnight into early today
  if (!isOpenNow) {
    const curIdx = DAYS_ORDER.findIndex((d) => d.toLowerCase() === currentDay.toLowerCase());
    const prevDay = DAYS_ORDER[(curIdx + 6) % 7];
    const prevItem = schedules.find((s) => s.day.toLowerCase() === prevDay.toLowerCase());
    const prevTimes = prevItem?.times ?? [];

    for (const timeStr of prevTimes) {
      const parsed = parseTimeRange(timeStr);
      if (parsed.type === "range" && parsed.startMin !== undefined && parsed.endMin !== undefined) {
        if (parsed.startMin > parsed.endMin && currentMin < parsed.endMin) {
          isOpenNow = true;
          break;
        }
      }
    }
  }

  return {
    isOpen: isOpenNow,
    todayScheduleText,
    todayDayName: currentDay,
    isToday: (day: string) => day.toLowerCase() === currentDay.toLowerCase(),
  };
}
