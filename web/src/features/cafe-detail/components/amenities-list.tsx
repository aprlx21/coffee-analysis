import type { ComponentType } from "react";
import {
  AirVent,
  Building,
  Car,
  CreditCard,
  Heart,
  Laptop,
  Leaf,
  Music,
  PawPrint,
  Plug,
  Smartphone,
  Sparkles,
  Sun,
  Users,
  Utensils,
  VolumeX,
  Wifi,
} from "lucide-react";

import type { Cafe } from "@/server/db/types";
import { cn } from "@/lib/utils";

interface AmenityConfig {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  isInferred?: boolean;
  isActive: (cafe: Cafe) => boolean;
}

const AMENITY_CONFIGS: AmenityConfig[] = [
  // Tiện ích từ Google Maps
  {
    key: "has_wifi",
    label: "Wi-Fi miễn phí",
    icon: Wifi,
    isActive: (c) => Boolean(c.hasWifi || c.flags.has_wifi),
  },
  {
    key: "laptop_friendly",
    label: "Bàn ghế hợp laptop",
    icon: Laptop,
    isActive: (c) => Boolean(c.laptopFriendly || c.flags.laptop_friendly),
  },
  {
    key: "outdoor_seating",
    label: "Chỗ ngồi ngoài trời",
    icon: Sun,
    isActive: (c) => Boolean(c.outdoorSeating || c.flags.outdoor_seating),
  },
  {
    key: "quiet",
    label: "Không gian yên tĩnh",
    icon: VolumeX,
    isActive: (c) => Boolean(c.quiet || c.flags.quiet),
  },
  {
    key: "cozy",
    label: "Không gian ấm cúng",
    icon: Heart,
    isActive: (c) => Boolean(c.flags.cozy),
  },
  {
    key: "pet_friendly",
    label: "Thân thiện thú cưng",
    icon: PawPrint,
    isActive: (c) => Boolean(c.petFriendly || c.flags.pet_friendly),
  },
  {
    key: "has_parking",
    label: "Có chỗ đỗ xe",
    icon: Car,
    isActive: (c) => Boolean(c.flags.has_parking),
  },
  {
    key: "accepts_card",
    label: "Thanh toán thẻ",
    icon: CreditCard,
    isActive: (c) => Boolean(c.flags.accepts_card),
  },
  {
    key: "accepts_nfc",
    label: "Thanh toán NFC / Apple Pay",
    icon: Smartphone,
    isActive: (c) => Boolean(c.flags.accepts_nfc),
  },
  {
    key: "accepts_reservations",
    label: "Nhận đặt chỗ trước",
    icon: Utensils,
    isActive: (c) => Boolean(c.flags.accepts_reservations),
  },
  {
    key: "rooftop",
    label: "Tầng thượng (Rooftop)",
    icon: Building,
    isActive: (c) => Boolean(c.flags.rooftop),
  },
  {
    key: "live_music",
    label: "Nhạc sống / Acoustic",
    icon: Music,
    isActive: (c) => Boolean(c.flags.live_music),
  },
  {
    key: "good_for_kids",
    label: "Phù hợp trẻ em & gia đình",
    icon: Users,
    isActive: (c) => Boolean(c.flags.good_for_kids),
  },
  {
    key: "vegetarian_options",
    label: "Có đồ uống / món chay",
    icon: Leaf,
    isActive: (c) => Boolean(c.flags.vegetarian_options || c.flags.vegan_options),
  },

  // Tiện ích suy luận từ reviews (BẮT BUỘC gắn nhãn "suy luận từ review")
  {
    key: "has_ac",
    label: "Điều hòa / Máy lạnh",
    icon: AirVent,
    isInferred: true,
    isActive: (c) => Boolean(c.hasAc || c.flags.has_ac),
  },
  {
    key: "has_outlets",
    label: "Ổ cắm điện",
    icon: Plug,
    isInferred: true,
    isActive: (c) => Boolean(c.hasOutlets || c.flags.has_outlets),
  },
];

interface AmenitiesListProps {
  cafe: Cafe;
  className?: string;
}

export function AmenitiesList({ cafe, className }: AmenitiesListProps) {
  const activeAmenities = AMENITY_CONFIGS.filter((cfg) => cfg.isActive(cafe));

  return (
    <div data-slot="amenities-card" className={cn("rounded-xl glass p-4 shadow-glass-card sm:p-6", className)}>
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <Sparkles className="size-5 stroke-[2.5] text-foreground" />
        <h2 className="font-heading text-lg font-bold text-foreground">
          Tiện ích & Cơ sở vật chất ({activeAmenities.length})
        </h2>
      </div>

      <div className="mt-4">
        {activeAmenities.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {activeAmenities.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-xs font-bold transition-transform hover:-translate-y-0.5 hover:shadow-glass-lg",
                    item.isInferred
                      ? "bg-secondary text-secondary-foreground shadow-glass-sm"
                      : "bg-surface text-foreground shadow-glass-sm",
                  )}
                >
                  <Icon className="size-4 shrink-0 stroke-[2.5]" />
                  <span>{item.label}</span>

                  {item.isInferred ? (
                    <span className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide text-muted-foreground uppercase">
                      suy luận từ review
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-2 text-center text-sm font-medium text-muted-foreground">
            Chưa có thông tin tiện ích chi tiết cho quán này.
          </p>
        )}
      </div>
    </div>
  );
}
