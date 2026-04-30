import { useContent } from "../../hooks/useContent";

type Sections = {
  categoryId?: string;
  countries?: string[];
  createAt?: string;
  createdBy?: string;
  id?: string;
  sectionDescription?: string;
  sectionName?: string;
  updatedAt?: string;
  updatedBy?: string;
};

type Category = {
  id: string;
  name: string;
  description?: string;
  categoryName?: string;
  assignedUsersCount?: number;
  categoryIcon?: string;
  createdAt?: string;
  createdBy?: string;
  sections?: Sections[];
  updatedAt?: string;
  updatedBy?: string;
};

type AnalyticsCategoryStatsProps = {
  categories: Category[];
};

export default function AnalyticsCategoryStats({
  categories,
}: AnalyticsCategoryStatsProps) {
  const { contents } = useContent();

  const contentByCategory = Object.values(contents).reduce(
    (acc, content) => {
      const categoryId = content.categoryId || "uncategorized";
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(content);
      return acc;
    },
    {} as Record<string, typeof contents>,
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Contenido por Categoría
      </h3>
      <div className="space-y-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
          >
            <div>
              <p className="font-medium text-gray-900">
                {category.categoryName}
              </p>
              {/* <p className="text-sm text-gray-500">{} vistas totales</p> */}
            </div>
            <div className="text-right">
              <p className="font-semibold text-[#023D4F]">
                {Object.values(
                  contentByCategory[category.id] || {},
                ).length.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">contenidos</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
