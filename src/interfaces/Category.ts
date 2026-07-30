export interface Category {
  id: string;
  categoryName: string;
  description: string;
  categoryIcon: string;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  assignedUsersCount: number;
}
