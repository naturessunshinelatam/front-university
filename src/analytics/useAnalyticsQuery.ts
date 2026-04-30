import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Ga4RunReportHttpRequest, Ga4RunReportHttpResponse } from "./types";
import { runGa4Report } from "./api";
import { useAnalyticsCache } from "./AnalyticsProvider";

type UseAnalyticsQueryOptions = {
  enabled?: boolean;
  ttlMs?: number;
  cacheKey?: string;
  baseUrl?: string;
  force?: boolean;
};

function stableKey(propertyId: string, body: Ga4RunReportHttpRequest) {
  return `ga4:${propertyId}:${JSON.stringify(body)}`;
}

export function useAnalyticsQuery(
  body: Ga4RunReportHttpRequest,
  opts: UseAnalyticsQueryOptions = {},
) {
  const cache = useAnalyticsCache();
  const enabled = opts.enabled ?? true;
  const ttlMs = opts.ttlMs ?? 5 * 60_000; // 5 minutes
  const cacheKey = useMemo(
    () => opts.cacheKey ?? stableKey("", body),
    [opts.cacheKey, body],
  );

  const [data, setData] = useState<Ga4RunReportHttpResponse | null>(
    () => cache.get(cacheKey) ?? null,
  );
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchNow = useCallback(
    async (params?: { force?: boolean }) => {
      const force = params?.force ?? opts.force ?? false;
      if (!force) {
        const cached = cache.get<Ga4RunReportHttpResponse>(cacheKey);
        if (cached) {
          setData(cached);
          return;
        }
      }

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setLoading(true);
      setError(null);

      try {
        const resp = await runGa4Report(body, {
          baseUrl: opts.baseUrl,
          signal: ac.signal,
        });
        cache.set(cacheKey, resp, ttlMs);
        setData(resp);
        return resp;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") {
          return;
        }
        const err = e instanceof Error ? e : new Error("Unknown error");
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [opts.force, opts.baseUrl, cache, cacheKey, body, ttlMs],
  );

  const invalidate = useCallback(() => {
    cache.delete(cacheKey);
  }, [cache, cacheKey]);

  useEffect(() => {
    if (!enabled) return;
    void fetchNow().catch(() => {});
    return () => {
      abortRef.current?.abort();
    };
  }, [enabled, fetchNow]);

  return {
    data,
    error,
    loading,
    fetchNow,
    invalidate,
    cacheKey,
  };
}
