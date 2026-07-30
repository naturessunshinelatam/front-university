export interface Section {
  id: string;
  categoryId: string;
  sectionName: string;
  sectionDescription: string;
  countries: string[];
  createAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
}
