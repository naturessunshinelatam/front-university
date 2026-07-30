import type { CacheStatus } from "./CacheStatus";
import type { CountryCacheData } from "./CountryCacheData";
import type { CountryCacheMeta } from "./CountryCacheMeta";

export interface CountryCacheError {
  message: string;
  code?: string;
  at: number;
}

export interface CountryCacheEntry {
  status: CacheStatus;
  data: CountryCacheData | null;
  meta: CountryCacheMeta | null;
  error: CountryCacheError | null;
}
