import AnalyticsTab from "../components/analytics/AnalyticsTab";

export default function AnalyticsPreview() {
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Preview de Analítica
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Vista aislada para probar AnalyticsTab antes de montarlo en el
            panel.
          </p>
        </div>

        <AnalyticsTab />
      </div>
    </div>
  );
}
