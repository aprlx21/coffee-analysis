import rawTrafficData from "./traffic-data.json";

export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export interface DayOption {
  key: DayOfWeek;
  label: string;
  shortLabel: string;
}

export const DAYS_OF_WEEK: DayOption[] = [
  { key: "Monday", label: "Thứ 2", shortLabel: "T2" },
  { key: "Tuesday", label: "Thứ 3", shortLabel: "T3" },
  { key: "Wednesday", label: "Thứ 4", shortLabel: "T4" },
  { key: "Thursday", label: "Thứ 5", shortLabel: "T5" },
  { key: "Friday", label: "Thứ 6", shortLabel: "T6" },
  { key: "Saturday", label: "Thứ 7", shortLabel: "T7" },
  { key: "Sunday", label: "Chủ Nhật", shortLabel: "CN" },
];

export interface TrafficHourlySlot {
  hour: number;
  label: string; // e.g. "08:00"
  percentage: number;
  isPeak: boolean;
  isQuiet: boolean;
}

export interface DayTrafficAnalysis {
  slots: TrafficHourlySlot[];
  peakHours: string[];
  quietHours: string[];
  busiestHour: { hour: number; label: string; percentage: number };
  averageBusyness: number;
}

interface RawDataShape {
  marketAverage: Record<string, number[]>;
  cafes: Record<string, Record<string, number[]>>;
}

const data = rawTrafficData as unknown as RawDataShape;

export function getCafeTraffic(placeId?: string): Record<string, number[]> {
  if (placeId && data.cafes[placeId]) {
    return data.cafes[placeId];
  }
  return data.marketAverage;
}

export function hasTrafficData(placeId: string): boolean {
  return Boolean(data.cafes[placeId]);
}

export function analyzeDayTraffic(hourlyValues: number[] = []): DayTrafficAnalysis {
  // Ensure 24 items
  const slots: TrafficHourlySlot[] = Array.from({ length: 24 }, (_, h) => {
    const val = hourlyValues[h] ?? 0;
    const label = `${String(h).padStart(2, "0")}:00`;
    return {
      hour: h,
      label,
      percentage: Math.round(val),
      isPeak: val >= 50,
      isQuiet: val > 0 && val < 25,
    };
  });

  const validSlots = slots.filter((s) => s.percentage > 0);
  const avg =
    validSlots.length > 0 ? Math.round(validSlots.reduce((acc, s) => acc + s.percentage, 0) / validSlots.length) : 0;

  // Find max slot
  let maxSlot = slots[0];
  for (const s of slots) {
    if (s.percentage > maxSlot.percentage) {
      maxSlot = s;
    }
  }

  // Peak ranges (percentage >= 50)
  const peakHours = slots.filter((s) => s.percentage >= 50).map((s) => `${s.hour}h`);

  // Quiet morning/afternoon work ranges (percentage > 0 && < 35, within 7h - 22h)
  const quietHours = slots
    .filter((s) => s.hour >= 7 && s.hour <= 22 && s.percentage > 0 && s.percentage <= 35)
    .map((s) => `${s.hour}h`);

  return {
    slots,
    peakHours,
    quietHours,
    busiestHour: {
      hour: maxSlot.hour,
      label: maxSlot.label,
      percentage: maxSlot.percentage,
    },
    averageBusyness: avg,
  };
}
