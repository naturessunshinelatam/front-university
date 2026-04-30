import React, { createContext, useContext, useMemo, useRef } from "react";
import { MemoryCache } from "./cache";

type AnalyticsContexValue = {
  cache: MemoryCache;
};

const AnalyticsContext = createContext<AnalyticsContexValue | null>(null);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const cacheRef = useRef(new MemoryCache());

  const value = useMemo<AnalyticsContexValue>(() => {
    return {
      cache: cacheRef.current,
    };
  }, []);

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsCache() {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    throw new Error(
      "useAnalyticsCache must be used within an AnalyticsProvider",
    );
  }
  return ctx.cache;
}
