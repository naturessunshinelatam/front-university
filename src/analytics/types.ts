export type Ga4DateRange = {
  startDate: string; // "7daysAgo"
  endDate: string; // "today"
};

export type Ga4RunReportHttpRequest = {
  dateRanges?: Ga4DateRange[];
  dimensions?: string[];
  metrics?: string[];
  limit?: number;
  orderByMetric?: string;
  orderDesc?: boolean;
};

export type Ga4Row = {
  dimensions: string[];
  metrics: string[];
};

export type Ga4RunReportHttpResponse = {
  dimensionHeaders: string[];
  metricHeaders: string[];
  rows: Ga4Row[];
};
