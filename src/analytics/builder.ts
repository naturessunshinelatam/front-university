import type { Ga4RunReportHttpRequest } from "./types";

export function buildTopPagesAndViews(
  days = 7,
  limit = 10,
): Ga4RunReportHttpRequest {
  return {
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    dimensions: ["pagePath"],
    metrics: ["screenPageViews", "activeUsers"],
    limit,
    orderByMetric: "screenPageViews",
    orderDesc: true,
  };
}

export function buildEventCountByEventName(
  days = 7,
  limit = 20,
): Ga4RunReportHttpRequest {
  return {
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    dimensions: ["eventName"],
    metrics: ["eventCount"],
    limit,
    orderByMetric: "eventCount",
    orderDesc: true,
  };
}

export function buildUsersByCountry(
  days = 30,
  limit = 100,
): Ga4RunReportHttpRequest {
  return {
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    dimensions: ["country"],
    metrics: ["activeUsers"],
    limit,
    orderByMetric: "activeUsers",
    orderDesc: true,
  };
}

export function eventsByCountry(
  days = 30,
  limit = 100,
): Ga4RunReportHttpRequest {
  return {
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    dimensions: ["country", "eventName"],
    metrics: ["eventCount"],
    limit,
    orderByMetric: "eventCount",
    orderDesc: true,
  };
}
