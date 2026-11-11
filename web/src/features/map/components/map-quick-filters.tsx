"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Laptop, Plug, Snowflake, Trees, Users, Wifi } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AmenityKey } from "@/features/cafes/schema";

interface QuickFilterOption {
  key: AmenityKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const QUICK_FILTERS: QuickFilterOption[] = [
  { key: "has_wifi", label: "Wi-Fi", icon: Wifi },
  { key: "laptop_friendly", label: "Làm việc", icon: Laptop },
  { key: "has_ac", label: "Máy lạnh", icon: Snowflake },
  { key: "has_outlets", label: "Ổ cắm", icon: Plug },
  { key: "outdoor_seating", label: "Ngoài trời", icon: Trees },
  { key: "pet_friendly", label: "Thú cưng", icon: Users },
];

export function MapQuickFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentAmenities = (searchParams.get("amenities") || "").split(",").filter(Boolean) as AmenityKey[];

  const toggleAmenity = (key: AmenityKey) => {
    const next = currentAmenities.includes(key)
      ? currentAmenities.filter((k) => k !== key)
      : [...currentAmenities, key];

    const params = new URLSearchParams(searchParams.toString());
    if (next.length > 0) {
      params.set("amenities", next.join(","));
    } else {
      params.delete("amenities");
    }
    // Reset page to 1 on filter change
    params.delete("page");

    startTransition(() => {
      router.push(`/ban-do?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-1">
      {QUICK_FILTERS.map((item) => {
        const Icon = item.icon;
        const isActive = currentAmenities.includes(item.key);

        return (
          <button
            key={item.key}
            type="button"
            disabled={isPending}
            onClick={() => toggleAmenity(item.key)}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-full border-2 border-border px-2.5 py-1 text-xs font-bold transition-all select-none",
              isActive
                ? "bg-primary text-primary-foreground shadow-hard-sm"
                : "bg-card text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-3 stroke-[2.5]" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
