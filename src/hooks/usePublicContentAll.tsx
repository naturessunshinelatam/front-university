import { useCallback, useEffect } from "react";
import { usePublicContentCache } from "../contexts/PublicContentCacheContext";
import type {
  Category,
  ContentItem,
  Section,
  UsePublicContentAllReturn,
} from "../interfaces";

export type { ContentItem, Category, Section } from "../interfaces";

export function usePublicContentAll(
  countryCode: string,
): UsePublicContentAllReturn {
  const {
    getCountryEntry,
    ensureCountryLoaded,
    refetchCountry,
    invalidateCountry,
  } = usePublicContentCache();

  const normalizedCountryCode = (countryCode ?? "").trim().toUpperCase();
  const entry = normalizedCountryCode
    ? getCountryEntry(normalizedCountryCode)
    : undefined;

  useEffect(() => {
    if (!normalizedCountryCode) {
      return;
    }

    void ensureCountryLoaded(normalizedCountryCode);
  }, [ensureCountryLoaded, normalizedCountryCode]);

  const content = entry?.data?.content ?? [];
  const categories = entry?.data?.categories ?? [];
  const sections = entry?.data?.sections ?? [];
  const loading = Boolean(
    normalizedCountryCode &&
    (entry?.status === "loading" ||
      (!entry?.data && entry?.status !== "error")),
  );
  const error = entry?.data ? null : (entry?.error?.message ?? null);
  const isCached = Boolean(entry?.data);
  const isStale = Boolean(
    entry?.meta?.expiresAt != null && entry?.meta?.expiresAt < Date.now(),
  );
  const fetchedAt = entry?.meta?.fetchedAt ?? null;
  const status = entry?.status ?? (normalizedCountryCode ? "loading" : "idle");

  const getCategoryById = useCallback(
    (categoryId: string): Category | undefined => {
      return categories.find((category) => category.id === categoryId);
    },
    [categories],
  );

  const getSectionById = useCallback(
    (sectionId: string): Section | undefined => {
      return sections.find((section) => section.id === sectionId);
    },
    [sections],
  );

  const getContentByCategory = useCallback(
    (categoryId: string): ContentItem[] => {
      return content.filter((item) => item.category.id === categoryId);
    },
    [content],
  );

  const getContentByCategoryFiltered = useCallback(
    (categoryId: string): ContentItem[] => {
      const publicSections = sections.filter(
        (section) =>
          section.categoryId === categoryId &&
          section.countries.includes(normalizedCountryCode),
      );

      const publicSectionIds = new Set(
        publicSections.map((section) => section.id),
      );

      return content.filter(
        (item) =>
          item.section != null &&
          item.category.id === categoryId &&
          publicSectionIds.has(item.section.id),
      );
    },
    [content, sections, normalizedCountryCode],
  );

  const getContentBySection = useCallback(
    (categoryId: string, sectionId: string): ContentItem[] => {
      return content
        .filter(
          (item) =>
            item.section != null &&
            item.category.id === categoryId &&
            item.section.id === sectionId,
        )
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex);
    },
    [content],
  );

  const getSectionsByCategory = useCallback(
    (categoryId: string): Section[] => {
      return sections.filter(
        (section) =>
          section.categoryId === categoryId &&
          section.countries.includes(normalizedCountryCode),
      );
    },
    [sections, normalizedCountryCode],
  );

  const getCategoriesWithContent = useCallback((): Category[] => {
    return categories.filter((category) => {
      const categoryContent = getContentByCategory(category.id);
      return categoryContent.length > 0;
    });
  }, [categories, getContentByCategory]);

  const getCategoriesWithContentFiltered = useCallback((): Category[] => {
    return categories.filter((category) => {
      const categoryContent = getContentByCategoryFiltered(category.id);
      return categoryContent.length > 0;
    });
  }, [categories, getContentByCategoryFiltered]);

  const refetch = useCallback(async () => {
    if (!normalizedCountryCode) {
      return;
    }

    await refetchCountry(normalizedCountryCode);
  }, [normalizedCountryCode, refetchCountry]);

  const invalidateActiveCountry = useCallback(() => {
    if (!normalizedCountryCode) {
      return;
    }

    invalidateCountry(normalizedCountryCode);
  }, [invalidateCountry, normalizedCountryCode]);

  return {
    content,
    categories,
    sections,
    loading,
    error,
    status,
    isCached,
    isStale,
    fetchedAt,
    refetch,
    invalidateCountry: invalidateActiveCountry,
    getCategoryById,
    getSectionById,
    getContentByCategory,
    getContentByCategoryFiltered,
    getContentBySection,
    getSectionsByCategory,
    getCategoriesWithContent,
    getCategoriesWithContentFiltered,
  };
}
