import type { Category } from "./Category";
import type { ContentItem } from "./ContentItem";
import type { CountryIndexMaps } from "./CountryIndexMaps";
import type { Section } from "./Section";

export interface CountryCacheData {
  content: ContentItem[];
  categories: Category[];
  sections: Section[];
  indexes: CountryIndexMaps;
}
