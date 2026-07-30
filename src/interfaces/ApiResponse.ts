import type { ContentItem } from "./ContentItem";

export interface ApiResponse {
  success: boolean;
  message: string;
  data: ContentItem[];
}
