import { useMemo } from "react";
import {
  useEventsByCountry,
  useTopPagesAndViews,
} from "../../hooks/useAnalyticsData";
import { useContentData } from "../../hooks/useContentData";
import AnalyticsCategoryStats from "./AnalyticsCategoryStats";
import AnalyticsCountryActivity from "./AnalyticsCountryActivity";
import AnalyticsSummaryCards from "./AnalyticsSummaryCards";
import AnalyticsTopContent from "./AnalyticsTopContent";

type AnalyticsTopItem = {
  id: string;
  title: string;
  subtitle: string;
  value: number;
  valueLabel: string;
};

type AnalyticsRowValue =
  | string
  | {
      value?: string;
    };

type AnalyticsRowLike = {
  dimension?: string[];
  metric?: string[];
  dimensionValues?: AnalyticsRowValue[];
  metricValues?: AnalyticsRowValue[];
};

export default function AnalyticsTab({ categories = [] }) {
  const { contentItems, getContentStats } = useContentData();
  const topViews = useTopPagesAndViews(30, 10);
  const countryEvents = useEventsByCountry(7, 10);

  const stats = getContentStats("MX");

  const topItems = useMemo<AnalyticsTopItem[]>(() => {
    const rows = (topViews.data?.rows ?? []) as AnalyticsRowLike[];

    if (rows.length > 0) {
      const mappedRows = rows
        .map((row, index) => {
          const pagePath = row.dimension?.[0] || "";
          const screenPageViews = parseInt(row.metric?.[0] || "0", 10) || 0;
          const activeUsers = parseInt(row.metric?.[1] || "0", 10) || 0;

          return {
            id: `${pagePath || "page"}-${index}`,
            title: pagePath || "Sin ruta",
            subtitle: `${activeUsers.toLocaleString()} usuarios activos`,
            value: screenPageViews,
            valueLabel: "vistas",
          };
        })
        .filter((item) => item.title !== "Sin ruta" || item.value > 0);

      if (mappedRows.length > 0) {
        return mappedRows;
      }
    }

    return [...contentItems]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10)
      .map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.category || "Sin categoría",
        value: item.views || 0,
        valueLabel: "vistas",
      }));
  }, [contentItems, topViews.data?.rows]);

  return (
    <div className="space-y-6">
      <AnalyticsSummaryCards stats={stats} />

      <div className="grid lg:grid-cols-2 gap-6">
        <AnalyticsTopContent
          items={topItems}
          loading={topViews.loading}
          error={topViews.error?.message || null}
        />
        <AnalyticsCategoryStats categories={categories} />
      </div>

      <AnalyticsCountryActivity countries={countryEvents.data?.rows} />
    </div>
  );
}
