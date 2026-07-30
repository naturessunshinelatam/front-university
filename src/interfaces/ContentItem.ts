export interface ContentItem {
  id: string;
  contentTitle: string;
  author: string;
  description: string;
  contentType: string;
  contentUrl: string;
  size: string;
  publishedAt: string;
  expiresAt: string;
  availableCountries: string[];
  status: string;
  category: {
    id: string;
    categoryName: string;
    description: string;
    categoryIcon: string;
    createdAt: string;
    updatedAt: string | null;
    createdBy: string;
    updatedBy: string | null;
    assignedUsersCount: number;
  };
  section: {
    id: string;
    categoryId: string;
    sectionName: string;
    sectionDescription: string;
    countries: string[];
    createAt: string;
    updatedAt: string | null;
    createdBy: string;
    updatedBy: string | null;
  };
  subsection: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  orderIndex: number;
}
