type AnalyticsTopItem = {
  id: string;
  title: string;
  subtitle: string;
  value: number;
  valueLabel: string;
};

type AnalyticsTopContentProps = {
  items: AnalyticsTopItem[];
  loading: boolean;
  error: string | null;
};

export default function AnalyticsTopContent({
  items,
  loading,
  error,
}: AnalyticsTopContentProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Contenido Más Visto
      </h3>

      {loading && (
        <div className="text-sm text-gray-500">Cargando analíticas...</div>
      )}

      {!loading && error && <div className="text-sm text-red-600">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="text-sm text-gray-500">
          No hay datos disponibles para este reporte.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#124C45] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500">{item.subtitle}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#124C45]">
                  {item.value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{item.valueLabel}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
