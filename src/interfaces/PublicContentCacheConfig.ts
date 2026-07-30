export interface PublicContentCacheConfig {
  ttlMs: number | null;
  staleWhileRevalidate: boolean;
  maxCountriesInMemory: number | null;
}
