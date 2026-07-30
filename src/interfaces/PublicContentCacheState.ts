import type { CountryCacheData } from "./CountryCacheData";
import type { CountryCacheEntry } from "./CountryCacheEntry";
import type { PublicContentCacheConfig } from "./PublicContentCacheConfig";

export interface PublicContentCacheState {
  byCountry: Record<string, CountryCacheEntry>;
  inFlight: Record<string, Promise<CountryCacheData>>;
  config: PublicContentCacheConfig;
}
