import { useState, useEffect, useCallback, useRef } from "react";

// Interfaz para el contenido completo de la API
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

// Interfaz para categoría extraída
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

// Interfaz para sección extraída
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

// Interfaz para la respuesta de la API
interface ApiResponse {
  success: boolean;
  message: string;
  data: ContentItem[];
}

// Interfaz para el estado del hook
interface UsePublicContentAllReturn {
  content: ContentItem[];
  categories: Category[];
  sections: Section[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  getCategoryById: (categoryId: string) => Category | undefined;
  getSectionById: (sectionId: string) => Section | undefined;
  getContentByCategory: (categoryId: string) => ContentItem[];
  getContentByCategoryFiltered: (categoryId: string) => ContentItem[];
  getContentBySection: (categoryId: string, sectionId: string) => ContentItem[];
  getSectionsByCategory: (categoryId: string) => Section[];
  getCategoriesWithContent: () => Category[];
  getCategoriesWithContentFiltered: () => Category[];
}

/**
 * Hook para consumir la API pública completa (categorías, secciones y contenido)
 * SIN CACHE - Siempre trae datos en tiempo real de la API
 * @param countryCode - Código del país (ej: 'CO', 'MX')
 * @returns Contenido completo, categorías, secciones y funciones helper
 */
export function usePublicContentAll(
  countryCode: string,
): UsePublicContentAllReturn {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const contentCache = useRef<{ [countryCode: string]: ContentItem[] }>({});

  /**
   * Verifica si el contenido está activo según fechas de publicación y expiración
   */
  const isContentActive = useCallback((item: ContentItem): boolean => {
    const now = new Date();
    const publishDate = new Date(item.publishedAt);
    const expirationDate = item.expiresAt ? new Date(item.expiresAt) : null;

    // Verificar si ya se puede mostrar
    if (publishDate > now) {
      return false;
    }

    // Verificar si ya expiró
    if (expirationDate && expirationDate < now) {
      return false;
    }

    return true;
  }, []);

  /**
   * Extrae categorías únicas del contenido
   */
  const extractCategories = useCallback((items: ContentItem[]): Category[] => {
    const categoryMap = new Map<string, Category>();

    items.forEach((item) => {
      if (item.section == null) return; // Ignorar contenido de categoría existente pero sin sección asignada
      if (!categoryMap.has(item.category.id)) {
        categoryMap.set(item.category.id, item.category);
      }
    });

    return Array.from(categoryMap.values());
  }, []);

  /**
   * Extrae secciones únicas del contenido
   */
  const extractSections = useCallback((items: ContentItem[]): Section[] => {
    const sectionMap = new Map<string, Section>();

    items.forEach((item) => {
      // console.log("each section: ", item.section);
      if (item.section == null) return;
      if (!sectionMap.has(item.section.id)) {
        sectionMap.set(item.section.id, item.section);
      }
    });

    return Array.from(sectionMap.values());
  }, []);

  /**
   * Fetch del contenido completo desde la API - SIEMPRE EN TIEMPO REAL
   */
  const fetchContent = useCallback(async () => {
    if (contentCache.current[countryCode]) {
      console.log(
        `⚡ Usando contenido en TIEMPO REAL desde cache para ${countryCode}:`,
        contentCache.current[countryCode].length,
        "items",
      );
      setContent(contentCache.current[countryCode]);
      setCategories(extractCategories(contentCache.current[countryCode]));
      setSections(extractSections(contentCache.current[countryCode]));
      setLoading(false);
      return;
    } else {
      if (!countryCode) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // console.log(
        //   `🌍 Fetching contenido COMPLETO en TIEMPO REAL para país: ${countryCode}`
        // );

        // SIEMPRE usar el endpoint de Vercel (funciona tanto en local como en producción)
        // Vercel servirá /api/public-content.js automáticamente como serverless function
        const endpoint = `/api/public-content?countryCode=${countryCode}`;

        // console.log(`📡 Endpoint: ${endpoint}`);

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Error al obtener contenido");
        }

        // Filtrar solo contenido publicado y activo
        const activeContent = (data.data || []).filter((item) => {
          const isPublished = item.status === "Published";
          const isActive = isContentActive(item);
          return isPublished && isActive;
        });

        console.log(
          `✅ Contenido COMPLETO cargado en TIEMPO REAL para ${countryCode}:`,
          activeContent.length,
          "items",
        );
        console.log("Active content: ", activeContent);
        // Extraer categorías y secciones únicas
        const extractedCategories = extractCategories(activeContent);
        console.log(`📂 Categorías extraídas:`, extractedCategories.length);

        const extractedSections = extractSections(activeContent);

        console.log(`📋 Secciones extraídas:`, extractedSections.length);

        // Guardar en cache para este país (en tiempo real, sin expiración)
        contentCache.current[countryCode] = activeContent;
        setContent(activeContent);
        setCategories(extractedCategories);
        setSections(extractedSections);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        console.error(
          `❌ Error al cargar contenido para ${countryCode}:`,
          errorMessage,
        );

        // Si es un 404, significa que no hay contenido para este país (no es un error crítico)
        if (errorMessage.includes("404")) {
          console.log(`ℹ️ No hay contenido disponible para ${countryCode}`);
          setError(null); // No mostrar como error
          setContent([]);
          setCategories([]);
          setSections([]);
        } else {
          setError(errorMessage);
          setContent([]);
          setCategories([]);
          setSections([]);
        }
      } finally {
        setLoading(false);
      }
    }
  }, [countryCode, isContentActive, extractCategories, extractSections]);

  /**
   * Efecto para cargar contenido cuando cambia el país
   */
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  /**
   * Función para refrescar el contenido manualmente
   */
  const refetch = useCallback(() => {
    fetchContent();
  }, [fetchContent]);

  /**
   * Obtiene una categoría por ID
   */
  const getCategoryById = useCallback(
    (categoryId: string): Category | undefined => {
      return categories.find((cat) => cat.id === categoryId);
    },
    [categories],
  );

  /**
   * Obtiene una sección por ID
   */
  const getSectionById = useCallback(
    (sectionId: string): Section | undefined => {
      return sections.find((sec) => sec.id === sectionId);
    },
    [sections],
  );

  /**
   * Obtiene contenido filtrado por categoría
   * NOTA: Esta función NO filtra por secciones públicas del país
   */
  const getContentByCategory = useCallback(
    (categoryId: string): ContentItem[] => {
      return content.filter((item) => item.category.id === categoryId);
    },
    [content],
  );

  /**
   * Obtiene contenido filtrado por categoría Y por secciones públicas del país actual
   * Solo retorna contenido de secciones que están disponibles para el país
   */
  const getContentByCategoryFiltered = useCallback(
    (categoryId: string): ContentItem[] => {
      // Primero obtener las secciones públicas de esta categoría para el país actual
      const publicSections = sections.filter(
        (section) =>
          section.categoryId === categoryId &&
          section.countries.includes(countryCode),
      );

      // Crear un Set con los IDs de secciones públicas para búsqueda rápida
      const publicSectionIds = new Set(publicSections.map((s) => s.id));

      // Filtrar contenido que pertenece a secciones públicas
      return content.filter(
        (item) =>
          item.category.id === categoryId &&
          item.section != null &&
          publicSectionIds.has(item.section.id),
      );
    },
    [content, sections, countryCode],
  );

  /**
   * Obtiene contenido filtrado por categoría y sección
   */
  const getContentBySection = useCallback(
    (categoryId: string, sectionId: string): ContentItem[] => {
      return content
        .filter(
          (item) =>
            item.section != null &&
            item.category.id === categoryId &&
            item.section.id === sectionId,
        )
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex); // Ordenar por OrderIndex
    },
    [content],
  );

  /**
   * Obtiene secciones de una categoría específica
   * FILTRADAS por país actual - Solo muestra secciones disponibles para este país
   */
  const getSectionsByCategory = useCallback(
    (categoryId: string): Section[] => {
      return sections.filter(
        (section) =>
          section.categoryId === categoryId &&
          section.countries.includes(countryCode),
      );
    },
    [sections, countryCode],
  );

  /**
   * Obtiene solo las categorías que tienen contenido
   * NOTA: Esta función NO filtra por secciones públicas del país
   */
  const getCategoriesWithContent = useCallback((): Category[] => {
    return categories.filter((category) => {
      const categoryContent = getContentByCategory(category.id);
      return categoryContent.length > 0;
    });
  }, [categories, getContentByCategory]);

  /**
   * Obtiene solo las categorías que tienen contenido en secciones públicas del país actual
   * Solo retorna categorías con contenido realmente accesible
   */
  const getCategoriesWithContentFiltered = useCallback((): Category[] => {
    return categories.filter((category) => {
      const categoryContent = getContentByCategoryFiltered(category.id);
      return categoryContent.length > 0;
    });
  }, [categories, getContentByCategoryFiltered]);

  return {
    content,
    categories,
    sections,
    loading,
    error,
    refetch,
    getCategoryById,
    getSectionById,
    getContentByCategory,
    getContentByCategoryFiltered,
    getContentBySection,
    getSectionsByCategory,
    getCategoriesWithContent,
    getCategoriesWithContentFiltered,
  };
}
