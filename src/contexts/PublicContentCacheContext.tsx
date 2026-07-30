import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ApiResponse,
  Category,
  ContentItem,
  CountryCacheData,
  CountryCacheEntry,
  CountryCacheMeta,
  CountryCachedKey,
  CountryIndexMaps,
  PublicContentCacheConfig,
  PublicContentCacheState,
  Section,
} from "../interfaces";

interface EnsureCountryLoadedOptions {
  forceRefresh?: boolean;
  staleWhileRevalidate?: boolean;
}

interface PublicContentCacheContextValue {
  getCountryEntry: (countryCode: string) => CountryCacheEntry | undefined;
  ensureCountryLoaded: (
    countryCode: string,
    options?: EnsureCountryLoadedOptions,
  ) => Promise<CountryCacheData>;
  refetchCountry: (countryCode: string) => Promise<CountryCacheData>;
  invalidateCountry: (countryCode: string) => void;
  config: PublicContentCacheConfig;
}

const DEFAULT_CONFIG: PublicContentCacheConfig = {
  ttlMs: null,
  staleWhileRevalidate: true,
  maxCountriesInMemory: null,
};

const emptyIndexes = (): CountryIndexMaps => ({
  contentById: {},
  categoryById: {},
  sectionById: {},
  contentByCategoryId: {},
  contentByCategorySectionId: {},
  sectionsByCategoryId: {},
});

const emptyCountryData = (): CountryCacheData => ({
  content: [],
  categories: [],
  sections: [],
  indexes: emptyIndexes(),
});

const normalizeCountryCode = (countryCode: string): string =>
  countryCode.trim().toUpperCase();

const makeCountryKey = (countryCode: string): CountryCachedKey =>
  `PUBLIC_CONTENT::COUNTRY::${normalizeCountryCode(countryCode)}`;

const isContentActive = (item: ContentItem): boolean => {
  const now = new Date();
  const publishDate = new Date(item.publishedAt);
  const expirationDate = item.expiresAt ? new Date(item.expiresAt) : null;

  if (publishDate > now) {
    return false;
  }

  if (expirationDate && expirationDate < now) {
    return false;
  }

  return true;
};

const buildCountryData = (items: ContentItem[]): CountryCacheData => {
  const indexes = emptyIndexes();

  for (const item of items) {
    indexes.contentById[item.id] = item;
    indexes.categoryById[item.category.id] = item.category;

    if (item.section) {
      indexes.sectionById[item.section.id] = item.section;
    }

    if (!indexes.contentByCategoryId[item.category.id]) {
      indexes.contentByCategoryId[item.category.id] = [];
    }
    indexes.contentByCategoryId[item.category.id].push(item.id);

    if (item.section) {
      if (!indexes.contentByCategorySectionId[item.category.id]) {
        indexes.contentByCategorySectionId[item.category.id] = {};
      }

      if (
        !indexes.contentByCategorySectionId[item.category.id][item.section.id]
      ) {
        indexes.contentByCategorySectionId[item.category.id][item.section.id] =
          [];
      }
      indexes.contentByCategorySectionId[item.category.id][
        item.section.id
      ].push(item.id);

      if (!indexes.sectionsByCategoryId[item.category.id]) {
        indexes.sectionsByCategoryId[item.category.id] = [];
      }
      if (
        !indexes.sectionsByCategoryId[item.category.id].includes(
          item.section.id,
        )
      ) {
        indexes.sectionsByCategoryId[item.category.id].push(item.section.id);
      }
    }
  }

  const categoryMap = new Map<string, Category>();
  const sectionMap = new Map<string, Section>();

  for (const item of items) {
    if (item.section != null && !categoryMap.has(item.category.id)) {
      categoryMap.set(item.category.id, item.category);
    }
    if (item.section != null && !sectionMap.has(item.section.id)) {
      sectionMap.set(item.section.id, item.section);
    }
  }

  return {
    content: items,
    categories: Array.from(categoryMap.values()),
    sections: Array.from(sectionMap.values()),
    indexes: {
      ...indexes,
    },
  };
};

const createCacheEntry = (
  countryCode: string,
  data: CountryCacheData | null,
  status: CountryCacheEntry["status"],
  error: CountryCacheEntry["error"],
  source: CountryCacheMeta["source"],
  fetchedAt: number,
  expiresAt: number | null,
  version: number,
): CountryCacheEntry => ({
  status,
  data,
  error,
  meta: {
    countryCode: normalizeCountryCode(countryCode),
    fetchedAt,
    expiresAt,
    lastAccessAt: fetchedAt,
    source,
    version,
  },
});

const PublicContentCacheContext = createContext<
  PublicContentCacheContextValue | undefined
>(undefined);

export function PublicContentCacheProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [byCountry, setByCountry] = useState<
    PublicContentCacheState["byCountry"]
  >({});
  const inFlightRef = useRef<PublicContentCacheState["inFlight"]>({});
  const versionRef = useRef(0);
  const config = DEFAULT_CONFIG;

  const getCountryEntry = useCallback(
    (countryCode: string): CountryCacheEntry | undefined => {
      const key = makeCountryKey(countryCode);
      return byCountry[key];
    },
    [byCountry],
  );

  const isFresh = useCallback(
    (entry: CountryCacheEntry | undefined): boolean => {
      if (!entry?.meta) {
        return false;
      }

      if (entry.meta.expiresAt == null) {
        return entry.status === "success" && entry.data != null;
      }

      return (
        entry.meta.expiresAt > Date.now() &&
        entry.status === "success" &&
        entry.data != null
      );
    },
    [],
  );

  const loadCountry = useCallback(
    async (countryCode: string): Promise<CountryCacheData> => {
      const normalizedCountryCode = normalizeCountryCode(countryCode);
      const cacheKey = makeCountryKey(normalizedCountryCode);

      if (inFlightRef.current[cacheKey]) {
        return inFlightRef.current[cacheKey];
      }

      versionRef.current += 1;
      const version = versionRef.current;
      const startedAt = Date.now();

      setByCountry((current) => {
        const currentEntry = current[cacheKey];
        return {
          ...current,
          [cacheKey]: {
            status: "loading",
            data: currentEntry?.data ?? null,
            error: null,
            meta: {
              countryCode: normalizedCountryCode,
              fetchedAt: currentEntry?.meta?.fetchedAt ?? startedAt,
              expiresAt: currentEntry?.meta?.expiresAt ?? null,
              lastAccessAt: startedAt,
              source: currentEntry?.meta?.source ?? "network",
              version,
            },
          },
        };
      });

      const request = (async () => {
        try {
          const response = await fetch(
            `/api/public-content?countryCode=${normalizedCountryCode}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }

          const data: ApiResponse = await response.json();

          if (!data.success) {
            throw new Error(data.message || "Error al obtener contenido");
          }

          const activeContent = (data.data || []).filter(
            (item) => item.status === "Published" && isContentActive(item),
          );
          const normalizedData = buildCountryData(activeContent);
          const now = Date.now();
          const expiresAt = config.ttlMs != null ? now + config.ttlMs : null;

          setByCountry((current) => ({
            ...current,
            [cacheKey]: createCacheEntry(
              normalizedCountryCode,
              normalizedData,
              "success",
              null,
              "network",
              now,
              expiresAt,
              version,
            ),
          }));

          return normalizedData;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Error desconocido";
          const now = Date.now();
          const existingEntry = byCountry[cacheKey];

          if (existingEntry?.data) {
            setByCountry((current) => ({
              ...current,
              [cacheKey]: {
                ...existingEntry,
                status: "success",
                error: {
                  message: errorMessage,
                  at: now,
                },
                meta: existingEntry.meta
                  ? {
                      ...existingEntry.meta,
                      lastAccessAt: now,
                      source: "memory",
                    }
                  : {
                      countryCode: normalizedCountryCode,
                      fetchedAt: now,
                      expiresAt: null,
                      lastAccessAt: now,
                      source: "memory",
                      version,
                    },
              },
            }));

            return existingEntry.data;
          }

          setByCountry((current) => ({
            ...current,
            [cacheKey]: {
              status: "error",
              data: null,
              error: {
                message: errorMessage,
                at: now,
              },
              meta: {
                countryCode: normalizedCountryCode,
                fetchedAt: now,
                expiresAt: null,
                lastAccessAt: now,
                source: "network",
                version,
              },
            },
          }));

          throw error instanceof Error ? error : new Error(errorMessage);
        } finally {
          delete inFlightRef.current[cacheKey];
        }
      })();

      inFlightRef.current[cacheKey] = request;
      return request;
    },
    [byCountry, config.ttlMs],
  );

  const ensureCountryLoaded = useCallback(
    async (
      countryCode: string,
      options?: EnsureCountryLoadedOptions,
    ): Promise<CountryCacheData> => {
      const normalizedCountryCode = normalizeCountryCode(countryCode);
      const cacheKey = makeCountryKey(normalizedCountryCode);
      const entry = byCountry[cacheKey];
      const forceRefresh = options?.forceRefresh ?? false;
      const shouldUseSWR =
        options?.staleWhileRevalidate ?? config.staleWhileRevalidate;

      if (!normalizedCountryCode) {
        return emptyCountryData();
      }

      if (!forceRefresh && isFresh(entry) && entry.data) {
        return entry.data;
      }

      if (!forceRefresh && entry?.data && !isFresh(entry) && shouldUseSWR) {
        if (!inFlightRef.current[cacheKey]) {
          void loadCountry(normalizedCountryCode);
        }

        return entry.data;
      }

      if (inFlightRef.current[cacheKey]) {
        return inFlightRef.current[cacheKey];
      }

      return loadCountry(normalizedCountryCode);
    },
    [byCountry, config.staleWhileRevalidate, isFresh, loadCountry],
  );

  const refetchCountry = useCallback(
    (countryCode: string): Promise<CountryCacheData> => {
      return ensureCountryLoaded(countryCode, { forceRefresh: true });
    },
    [ensureCountryLoaded],
  );

  const invalidateCountry = useCallback((countryCode: string) => {
    const cacheKey = makeCountryKey(countryCode);
    delete inFlightRef.current[cacheKey];
    setByCountry((current) => {
      const next = { ...current };
      delete next[cacheKey];
      return next;
    });
  }, []);

  const value = useMemo<PublicContentCacheContextValue>(
    () => ({
      getCountryEntry,
      ensureCountryLoaded,
      refetchCountry,
      invalidateCountry,
      config,
    }),
    [
      config,
      ensureCountryLoaded,
      getCountryEntry,
      invalidateCountry,
      refetchCountry,
    ],
  );

  return (
    <PublicContentCacheContext.Provider value={value}>
      {children}
    </PublicContentCacheContext.Provider>
  );
}

export function usePublicContentCache() {
  const context = useContext(PublicContentCacheContext);

  if (!context) {
    throw new Error(
      "usePublicContentCache must be used within PublicContentCacheProvider",
    );
  }

  return context;
}
