import type { Category } from "./Category";
import type { ContentItem } from "./ContentItem";
import type { Section } from "./Section";

export interface CountryIndexMaps {
  contentById: Record<string, ContentItem>;
  categoryById: Record<string, Category>;
  sectionById: Record<string, Section>;
  contentByCategoryId: Record<string, string[]>;
  contentByCategorySectionId: Record<string, Record<string, string[]>>;
  sectionsByCategoryId: Record<string, string[]>;
}
