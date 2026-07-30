import type { CacheStatus } from "./CacheStatus";
import type { Category } from "./Category";
import type { ContentItem } from "./ContentItem";
import type { Section } from "./Section";

export interface UsePublicContentAllReturn {
  content: ContentItem[];
  categories: Category[];
  sections: Section[];
  loading: boolean;
  error: string | null;
  status: CacheStatus;
  isCached: boolean;
  isStale: boolean;
  fetchedAt: number | null;
  refetch: () => Promise<void>;
  invalidateCountry: () => void;
  getCategoryById: (categoryId: string) => Category | undefined;
  getSectionById: (sectionId: string) => Section | undefined;
  getContentByCategory: (categoryId: string) => ContentItem[];
  getContentByCategoryFiltered: (categoryId: string) => ContentItem[];
  getContentBySection: (categoryId: string, sectionId: string) => ContentItem[];
  getSectionsByCategory: (categoryId: string) => Section[];
  getCategoriesWithContent: () => Category[];
  getCategoriesWithContentFiltered: () => Category[];
}
