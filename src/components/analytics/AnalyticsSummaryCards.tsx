import { FileText, Youtube, Image, Video } from "lucide-react";
import { useContent } from "../../hooks/useContent";

type AnalyticsSummaryCardsProps = {
  stats: {
    totalContent: number;
    videoContent: number;
    pdfContent: number;
    linkContent: number;
  };
};

export default function AnalyticsSummaryCards({
  stats,
}: AnalyticsSummaryCardsProps) {
  const { contents } = useContent();

  console.log("conttes ", contents);
  const totalContentType = Object.values(contents).reduce(
    (acc, content) => {
      const type = content.contentType || "other";
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type]++;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log("content types count", totalContentType);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Total Contenidos
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {(totalContentType.Video || 0) +
                (totalContentType.Image || 0) +
                (totalContentType.File || 0)}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Videos</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalContentType.Video || 0}
            </p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <Video className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">PDFs</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalContentType.File || 0}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Imagenes</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalContentType.Image || 0}
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Image className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
