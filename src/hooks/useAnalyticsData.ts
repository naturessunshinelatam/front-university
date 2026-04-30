import { useMemo } from "react";
import {
  buildEventCountByEventName,
  buildTopPagesAndViews,
  buildUsersByCountry,
  eventsByCountry,
} from "../analytics/builder";
import { useAnalyticsQuery } from "../analytics/useAnalyticsQuery";

export function useTopPagesAndViews(days = 7, limit = 10) {
  const body = useMemo(() => buildTopPagesAndViews(days, limit), [days, limit]);
  return useAnalyticsQuery(body, { enabled: true, ttlMs: 5 * 60_000 }); // 5 minutes
}

export function useEventCount(days = 7, limit = 20) {
  const body = useMemo(
    () => buildEventCountByEventName(days, limit),
    [days, limit],
  );
  return useAnalyticsQuery(body, {
    enabled: true,
    ttlMs: 5 * 60_000, // 5 minutes
  });
}

export function useUserByCountry(days = 30, limit = 100) {
  const body = useMemo(() => buildUsersByCountry(days, limit), [days, limit]);
  return useAnalyticsQuery(body, {
    enabled: true,
    ttlMs: 5 * 60_000, // 5 minutes
  });
}

export function useEventsByCountry(days = 30, limit = 100) {
  const body = useMemo(() => buildUsersByCountry(days, limit), [days, limit]);
  return useAnalyticsQuery(body, {
    enabled: true,
    ttlMs: 5 * 60_000, // 5 minutes
  });
}

export function useViewsByCountry(days = 30, limit = 100) {
  const body = useMemo(() => eventsByCountry(days, limit), [days, limit]);
  return useAnalyticsQuery(body, {
    enabled: true,
    ttlMs: 5 * 60_000, // 5 minutes
  });
}
