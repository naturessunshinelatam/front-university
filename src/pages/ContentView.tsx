import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useCountry } from "../contexts/CountryContext";
import {
  usePublicContentAll,
  type ContentItem as ApiContentItem,
} from "../hooks/usePublicContentAll";
import VideoPlayer from "../components/VideoPlayer";
import {
  Play,
  FileText,
  ExternalLink,
  User,
  Youtube,
  Clock,
  BookOpen,
  X,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react";
import ImagePreviewModal from "../components/ImagePreviewModal";

interface ContentItem {
  id: string;
  title: string;
  type: "video" | "pdf" | "link" | "youtube" | "file" | "image";
  url: string;
  description?: string;
  duration?: string;
  size?: string;
  publishDate?: string;
  author?: string;
  countries: string[];
  views?: number;
}

interface ContentSection {
  id: string;
  title: string;
  description: string;
  items: ContentItem[];
  contentCount?: number;
}

export default function ContentView() {
  const { category: categorySlug } = useParams();
  const { selectedCountry } = useCountry();

  // Usar hook de contenido completo (TODO desde API en tiempo real)
  const {
    content,
    categories,
    sections,
    loading,
    error,
    getSectionsByCategory,
    getContentBySection,
  } = usePublicContentAll(selectedCountry.code);

  const [selectedVideo, setSelectedVideo] = useState<ContentItem | null>(null);
  const [downloadingImageId, setDownloadingImageId] = useState<string | null>(
    null,
  );
  const [previewImage, setPreviewImage] = useState<ContentItem | null>(null);
  const [downloadedImageId, setDownloadedImageId] = useState<string | null>(
    null,
  );

  // Estado para controlar secciones expandidas/contraídas
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );
  const [allCollapsed, setAllCollapsed] = useState(false);

  /**
   * Convierte un texto en slug (igual que en Navigation y Home)
   */
  const createSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  /**
   * Busca la categoría por slug (nombre convertido)
   */
  const findCategoryBySlug = (slug: string | undefined) => {
    if (!slug) return null;
    return categories.find((cat) => createSlug(cat.categoryName) === slug);
  };

  // Obtener información de la categoría desde API usando el slug
  const currentCategory = findCategoryBySlug(categorySlug);
  const category = currentCategory?.id || "";

  // Obtener secciones de esta categoría desde API
  const availableSections = getSectionsByCategory(category || "");

  console.log("🔍 ContentView - País:", selectedCountry.code);
  console.log("🔍 ContentView - Categoría:", category);
  console.log("🔍 ContentView - Total contenidos:", content.length);
  console.log("🔍 ContentView - Total categorías:", categories.length);
  console.log("🔍 ContentView - Total secciones:", sections.length);
  console.log(
    "🔍 ContentView - Secciones de esta categoría:",
    availableSections.length,
  );
  console.log(`Get SectionsbyCategory: ${{ availableSections }}`);

  /**
   * Construye los datos de contenido organizados por sección
   */
  const buildContentData = (): ContentSection[] => {
    if (!category) return [];

    return availableSections.map((section) => {
      // Obtener contenido de esta sección desde la API
      const sectionContent = getContentBySection(category, section.id);

      console.log(
        `📋 ContentView - Sección "${section.sectionName}" tiene ${sectionContent.length} contenidos`,
      );

      return {
        id: section.id,
        title: section.sectionName,
        description: section.sectionDescription,
        items: sectionContent.map((item: ApiContentItem) => ({
          id: item.id,
          title: item.contentTitle,
          type:
            item.contentType.toLowerCase() === "video"
              ? "youtube"
              : item.contentType.toLowerCase() === "file"
                ? "pdf"
                : item.contentType.toLowerCase() === "image"
                  ? "image"
                  : (item.contentType.toLowerCase() as
                      | "video"
                      | "pdf"
                      | "link"
                      | "youtube"
                      | "file"
                      | "image"),
          url: item.contentUrl,
          description: item.description,
          duration: item.size, // En la API, size puede ser duración para videos
          size: item.size,
          publishDate: item.publishedAt,
          author: item.author,
          countries: item.availableCountries,
          views: 0, // La API no retorna views
        })),
        contentCount: sectionContent.length,
      };
    });
  };

  const sectionsWithContent = buildContentData().filter(
    (section) => section.items.length > 0,
  );

  console.log(
    `📋 ContentView - Secciones con contenido: ${sectionsWithContent.length}`,
  );

  /**
   * Obtiene el icono según el tipo de contenido
   */
  const getIcon = (type: string) => {
    switch (type) {
      case "video":
        return Play;
      case "youtube":
        return Youtube;
      case "pdf":
        return FileText;
      case "file":
        return FileText;
      case "link":
        return ExternalLink;
      case "image":
        return ImageIcon;
      default:
        return FileText;
    }
  };

  /**
   * Obtiene el título de la categoría
   */
  const getCategoryTitle = () => {
    if (loading) return "Cargando...";
    return currentCategory?.categoryName || "Categoría";
  };

  /**
   * Obtiene el icono de la sección (decorativo)
   */
  const getSectionIcon = (sectionId: string) => {
    const iconMap: { [key: string]: string } = {
      desintoxicacion: "🌿",
      "power-line": "⚡",
      "health-pro": "🏥",
      "quienes-somos": "🏢",
      "plan-compensacion": "💰",
      liderazgo: "👑",
      testimonios: "⭐",
      "quantum-2": "🎯",
      entrenamientos: "📚",
      "power-start": "🚀",
      "tips-rapidos": "💡",
      "historias-exito": "🏆",
    };
    return iconMap[sectionId] || "📋";
  };

  const getImageFileIdFromUrl = (imageUrl: string): string | null => {
    if (!imageUrl) {
      return null;
    }

    const fileName = imageUrl.split("/").pop() || "";
    const cleanFileName = fileName.split("?")[0];

    const guidFileMatch = cleanFileName.match(/^(.+?)_file(?:\.[^.]+)?$/i);
    if (guidFileMatch?.[1]) {
      return guidFileMatch[1];
    }

    const fallback = cleanFileName.split("_")[0];
    return fallback || null;
  };

  /**
   * Maneja el click en un item de contenido
   */
  const handleContentClick = (item: ContentItem) => {
    if (item.type === "youtube" || item.type === "video") {
      setSelectedVideo(item);
    } else if (item.type === "image") {
      // Para imágenes, abrir el modal de previsualización
      setPreviewImage(item);
    } else {
      window.open(item.url, "_blank");
    }
  };

  /**
   * Alterna el estado de colapso de una sección individual
   */
  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  /**
   * Contrae o expande todas las secciones
   */
  const toggleAllSections = () => {
    if (allCollapsed) {
      // Expandir todas
      setCollapsedSections(new Set());
      setAllCollapsed(false);
    } else {
      // Contraer todas
      const allSectionIds = new Set(sectionsWithContent.map((s) => s.id));
      setCollapsedSections(allSectionIds);
      setAllCollapsed(true);
    }
  };

  /**
   * Verifica si una sección está contraída
   */
  const isSectionCollapsed = (sectionId: string) => {
    return collapsedSections.has(sectionId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-[#124C45] to-[#023D4F] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-sm sm:text-lg md:text-2xl">📚</span>
                  </div>
                  <div className="w-1 h-1 sm:w-2 sm:h-2 bg-[#124C45] rounded-full animate-pulse flex-shrink-0"></div>
                </div>
                {!loading && (
                  <div className="bg-white rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3 shadow-lg border border-gray-100 flex-shrink-0">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#124C45] text-center">
                      {sectionsWithContent.length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 text-center whitespace-nowrap">
                      secciones
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 mb-1 sm:mb-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight flex-1">
                  {getCategoryTitle()}
                </h1>

                {/* Botón "Contraer Todo" - Solo visible en móviles (< 768px) */}
                {!loading && sectionsWithContent.length > 0 && (
                  <button
                    onClick={toggleAllSections}
                    className="md:hidden flex items-center gap-1 px-3 py-1.5 bg-[#124C45] text-white text-xs font-medium rounded-lg hover:bg-[#0f3d37] transition-colors shadow-sm flex-shrink-0"
                  >
                    {allCollapsed ? (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        <span>Expandir</span>
                      </>
                    ) : (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        <span>Contraer</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <p className="text-sm sm:text-base md:text-lg text-gray-600 flex items-center space-x-1 sm:space-x-2 hidden sm:flex">
                <span className="text-base sm:text-lg md:text-xl flex-shrink-0">
                  {selectedCountry.flag}
                </span>
                <span className="break-words">
                  Contenido para {selectedCountry.name}
                </span>
              </p>
              {/* Versión móvil más compacta */}
              <p className="text-sm text-gray-600 flex items-center space-x-1 sm:hidden">
                <span className="text-base flex-shrink-0">
                  {selectedCountry.flag}
                </span>
                <span className="truncate">{selectedCountry.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-[#124C45] animate-spin mb-4" />
            <p className="text-gray-600 text-lg">Cargando contenido...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium mb-1">
                    Error al cargar contenido
                  </p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Grid */}
        {!loading && !error && sectionsWithContent.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {sectionsWithContent.map((contentSection) => (
              <div
                key={contentSection.id}
                className="bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-[#124C45]/20 overflow-hidden group w-full flex flex-col min-h-[300px] sm:min-h-[350px]"
              >
                {/* Card Header - Clickeable en móviles y tablets */}
                <div
                  className="p-3 sm:p-4 md:p-5 border-b border-gray-100 flex-shrink-0 lg:cursor-default cursor-pointer lg:hover:bg-transparent hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    // Solo funciona en móviles y tablets (< 1024px)
                    if (window.innerWidth < 1024) {
                      toggleSection(contentSection.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                      <span className="text-lg sm:text-xl">
                        {getSectionIcon(contentSection.id)}
                      </span>
                    </div>

                    {/* Botón de colapso - Solo visible en móviles y tablets (< 1024px) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection(contentSection.id);
                      }}
                      className="lg:hidden p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                      aria-label={
                        isSectionCollapsed(contentSection.id)
                          ? "Expandir sección"
                          : "Contraer sección"
                      }
                    >
                      {isSectionCollapsed(contentSection.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-[#124C45] transition-colors leading-tight line-clamp-2">
                    {contentSection.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                    {contentSection.description}
                  </p>

                  {/* Contador de contenidos cuando está contraído */}
                  {isSectionCollapsed(contentSection.id) && (
                    <div className="mt-2 text-xs text-gray-500 font-medium">
                      {contentSection.items.length} contenido
                      {contentSection.items.length !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>

                {/* Content List - Se oculta cuando está contraído */}
                {!isSectionCollapsed(contentSection.id) && (
                  <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col">
                    <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4 flex-1">
                      {contentSection.items.map((item) => {
                        const IconComponent = getIcon(item.type);
                        return (
                          <div
                            key={item.id}
                            className="w-full flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-md sm:rounded-lg hover:bg-gray-100 transition-colors group/item"
                          >
                            <button
                              onClick={() => handleContentClick(item)}
                              className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0 cursor-pointer text-left"
                            >
                              <div
                                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  item.type === "pdf" || item.type === "file"
                                    ? "bg-red-100 text-red-600"
                                    : item.type === "youtube" ||
                                        item.type === "video"
                                      ? "bg-red-100 text-red-600"
                                      : item.type === "image"
                                        ? "bg-purple-100 text-purple-600"
                                        : "bg-blue-100 text-blue-600"
                                }`}
                              >
                                <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-gray-900 group-hover/item:text-[#124C45] transition-colors leading-tight mb-1 line-clamp-2">
                                  {item.title}
                                </p>
                                <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500">
                                  {item.duration && (
                                    <div className="flex items-center space-x-1">
                                      <Clock className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0" />
                                      <span>{item.duration}</span>
                                    </div>
                                  )}
                                  {item.size &&
                                    item.type !== "video" &&
                                    item.type !== "youtube" && (
                                      <div className="flex items-center space-x-1">
                                        <FileText className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0" />
                                        <span>{item.size}</span>
                                      </div>
                                    )}
                                </div>
                              </div>
                            </button>

                            {/* Botones para imágenes */}
                            {item.type === "image" &&
                              (() => {
                                const fileId = getImageFileIdFromUrl(item.url);
                                const downloadUrl = fileId
                                  ? `/api/proxy?path=Hostinger/getImage/${fileId}`
                                  : null;
                                const isDownloading =
                                  downloadingImageId === item.id;

                                return (
                                  <div className="flex gap-1 flex-shrink-0">
                                    {/* Botón de Vista Previa */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPreviewImage(item);
                                      }}
                                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-gradient-to-r from-[#124C45] to-[#023D4F] hover:from-[#0f3d37] hover:to-[#012d3a] text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                                      title="Ver imagen"
                                    >
                                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>

                                    {/* Botón de Descarga */}
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        if (!downloadUrl) {
                                          return;
                                        }
                                        setDownloadingImageId(item.id);

                                        try {
                                          const token =
                                            localStorage.getItem("authToken");
                                          const response = await fetch(
                                            downloadUrl,
                                            {
                                              headers: {
                                                Authorization: token
                                                  ? `Bearer ${token}`
                                                  : "",
                                              },
                                            },
                                          );

                                          if (response.ok) {
                                            const blob = await response.blob();
                                            const url =
                                              window.URL.createObjectURL(blob);
                                            const link =
                                              document.createElement("a");
                                            link.href = url;
                                            link.download = `${item.title}.png`;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            window.URL.revokeObjectURL(url);

                                            setDownloadedImageId(item.id);
                                            setTimeout(() => {
                                              setDownloadedImageId(null);
                                            }, 3000);
                                          }
                                        } catch (error) {
                                          console.error(
                                            "Error al descargar:",
                                            error,
                                          );
                                        } finally {
                                          setDownloadingImageId(null);
                                        }
                                      }}
                                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-[#124C45] hover:bg-[#0f3d37] text-white flex items-center justify-center transition-colors shadow-sm hover:shadow-md relative"
                                      disabled={!downloadUrl || isDownloading}
                                      title={
                                        !downloadUrl
                                          ? "No se pudo obtener el ID de la imagen"
                                          : isDownloading
                                            ? "Descargando..."
                                            : downloadedImageId === item.id
                                              ? "¡Descargado!"
                                              : "Descargar imagen"
                                      }
                                    >
                                      {isDownloading ? (
                                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                      ) : downloadedImageId === item.id ? (
                                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 animate-in zoom-in duration-300" />
                                      ) : (
                                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                      )}
                                    </button>
                                  </div>
                                );
                              })()}
                          </div>
                        );
                      })}
                    </div>

                    {/* Card Footer */}
                    <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100 mt-auto">
                      <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500">
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>
                          {contentSection.items.length} Contenido
                          {contentSection.items.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && sectionsWithContent.length === 0 && (
          <div className="text-center py-8 sm:py-12 md:py-16 px-4">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
              Contenido no encontrado
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              No se encontró contenido disponible para {selectedCountry.name} en
              la categoría "{getCategoryTitle()}".
            </p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-4xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#124C45] to-[#023D4F] text-white p-2 sm:p-3 md:p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-2 sm:mr-3">
                <h3 className="text-xs sm:text-sm md:text-base font-semibold truncate">
                  {selectedVideo.title}
                </h3>
                <p className="text-xs sm:text-sm opacity-90 truncate">
                  {selectedVideo.author}
                </p>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* Video Player */}
            <div className="p-2 sm:p-3 md:p-4">
              <VideoPlayer
                url={selectedVideo.url}
                title={selectedVideo.title}
                type={selectedVideo.type as "youtube" | "video"}
                autoplay={true}
              />

              {/* Video Info */}
              {selectedVideo.description && (
                <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gray-50 rounded-md sm:rounded-lg">
                  <p className="text-gray-700 mb-1 sm:mb-2 text-xs sm:text-sm leading-relaxed line-clamp-3">
                    {selectedVideo.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500">
                    {selectedVideo.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>Duración: {selectedVideo.duration}</span>
                      </div>
                    )}
                    {selectedVideo.author && (
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3 flex-shrink-0" />
                        <span>{selectedVideo.author}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage &&
        (() => {
          const fileId = getImageFileIdFromUrl(previewImage.url);

          // Obtener todas las imágenes de la sección actual
          const currentSection = sectionsWithContent.find((section) =>
            section.items.some((item) => item.id === previewImage.id),
          );

          const imagesInSection =
            currentSection?.items.filter((item) => item.type === "image") || [];
          const currentImageIndex = imagesInSection.findIndex(
            (item) => item.id === previewImage.id,
          );
          const hasNext = currentImageIndex < imagesInSection.length - 1;
          const hasPrevious = currentImageIndex > 0;

          const handleNext = () => {
            if (hasNext) {
              setPreviewImage(imagesInSection[currentImageIndex + 1]);
            }
          };

          const handlePrevious = () => {
            if (hasPrevious) {
              setPreviewImage(imagesInSection[currentImageIndex - 1]);
            }
          };

          return (
            <ImagePreviewModal
              imageUrl={previewImage.url}
              imageTitle={previewImage.title}
              onClose={() => setPreviewImage(null)}
              onDownload={async () => {
                if (!fileId) {
                  return;
                }

                const downloadUrl = `/api/proxy?path=Hostinger/getImage/${fileId}`;
                try {
                  const token = localStorage.getItem("authToken");
                  const response = await fetch(downloadUrl, {
                    headers: {
                      Authorization: token ? `Bearer ${token}` : "",
                    },
                  });

                  if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `${previewImage.title}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  }
                } catch (error) {
                  console.error("Error al descargar:", error);
                }
              }}
              onNext={hasNext ? handleNext : undefined}
              onPrevious={hasPrevious ? handlePrevious : undefined}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              currentIndex={currentImageIndex}
              totalImages={imagesInSection.length}
            />
          );
        })()}
    </div>
  );
}
