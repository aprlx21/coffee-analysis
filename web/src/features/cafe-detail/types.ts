export interface ReviewKeyword {
  keyword: string;
  count: number;
}

export interface FeaturedReview {
  name: string;
  rating: number;
  review_text: string;
  published_at: string;
}

export interface DaySchedule {
  day: string;
  times: string[];
}

export interface PriceComparison {
  status: "cheaper" | "higher" | "equal";
  diffPct: number;
  median: number;
  label: string;
}

export interface AmenityItem {
  key: string;
  label: string;
  isInferred?: boolean;
  source?: string | null;
  iconName: string;
}
