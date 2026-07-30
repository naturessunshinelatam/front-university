export interface CountryCacheMeta {
  countryCode: string;
  fetchedAt: number;
  expiresAt: number | null;
  lastAccessAt: number;
  source: "network" | "memory";
  version: number;
}
