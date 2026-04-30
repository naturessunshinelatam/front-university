import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

interface Content {
  id: string;
  contentTitle: string;
  author: string;
  description: string;
  categoryId: string;
  sectionId: string;
  subsection: string;
  contentType: "Video" | "File" | "Image";
  publishedAt: string;
  expiresAt: string;
  contentUrl: string;
  size: string;
  availableCountries: string[];
  status: "Published" | "Draft";
  createdBy: string;
  createdAt: string;
  updatedAt: string | null;
  updatedBy: string | null;
}

interface CreateContentData {
  contentTitle: string;
  author: string;
  description: string;
  categoryId: string;
  sectionId: string;
  subsection: string;
  contentType: "Video" | "File" | "Image";
  publishedAt: string;
  expiresAt: string;
  contentUrl: string;
  size: string;
  availableCountries: string[];
  contentStatus: "Published" | "Draft";
}

interface UploadResponse {
  status: string;
  success: boolean;
  data: {
    id: string;
    fileName: string;
    remotePath: string;
    publicUrl: string;
    uploadAt: string;
  };
}

export function useContent() {
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  // Función para subir archivos a Hostinger
  const uploadFile = async (
    file: File,
    fileType: "image" | "file" | "video",
  ): Promise<string | null> => {
    setUploadProgress(0);

    try {
      // console.log(
      //   "📤 Subiendo archivo a Hostinger:",
      //   file.name,
      //   "Tipo:",
      //   fileType,
      // );

      // Crear FormData con key "file" (minúscula) como requiere el API
      const formData = new FormData();
      formData.append("file", file);

      // Detectar si estamos en desarrollo o producción
      const isDevelopment = import.meta.env.DEV;

      // En desarrollo: usar la URL base configurada por el modo (.env.stage/.env.production)
      // En producción (cuando la app corre desplegada): usar la proxy interna `/api/upload`
      const uploadUrl = isDevelopment
        ? `${API_BASE_URL}/api/Hostinger/upload/image`
        : "/api/upload";

      // console.log("📡 Endpoint de upload:", uploadUrl);
      // console.log(
      //   "🌍 Entorno:",
      //   isDevelopment
      //     ? "Desarrollo (directo al backend)"
      //     : "Producción (via Vercel proxy)",
      // );
      // console.log('📦 FormData key: "file"');

      const token = localStorage.getItem("authToken");

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          // NO incluir Content-Type, el browser lo establece automáticamente con boundary
        },
        body: formData,
      });

      if (response.ok) {
        const result: UploadResponse = await response.json();
        // console.log("✅ Archivo subido exitosamente:", result);

        setUploadProgress(100);

        // Retornar la URL pública
        return result.data.publicUrl;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Error al subir archivo:", errorData);
        setError(errorData.message || "Error al subir archivo");
        return null;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Error de conexión al subir archivo");
      return null;
    } finally {
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Obtener todos los contenidos
  const fetchAllContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // console.log("📥 Obteniendo todos los contenidos...");

      const endpoint = `/api/proxy?path=Content/all`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const result = await response.json();
        // console.log("✅ Contenidos obtenidos:", result);

        // La API devuelve { success, message, data }
        const contentsData = result.data || [];
        setContents(contentsData);
        return contentsData;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Error al cargar contenidos:", errorData);
        setError(errorData.message || "Error al cargar contenidos");
        return [];
      }
    } catch (error) {
      console.error("Error fetching contents:", error);
      setError("Error de conexión");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Crear nuevo contenido
  const createContent = async (contentData: CreateContentData) => {
    setIsLoading(true);
    setError(null);

    try {
      // console.log("🔄 Creando contenido:", contentData);

      const endpoint = `/api/proxy?path=Content/create`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(contentData),
      });

      if (response.ok) {
        // console.log("✅ Contenido creado exitosamente");
        await fetchAllContent(); // Recargar lista
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        // console.error("❌ Error al crear contenido:", errorData);
        setError(errorData.message || "Error al crear contenido");
        return false;
      }
    } catch (error) {
      // console.error("Error creating content:", error);
      setError("Error de conexión");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar contenido existente
  const updateContent = async (
    contentId: string,
    contentData: CreateContentData,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔄 Actualizando contenido:", contentId, contentData);

      // ⚠️ IMPORTANTE: El ID va en la URL como path parameter
      const endpoint = `/api/proxy?path=Content/update/${contentId}`;

      console.log("📡 Endpoint UPDATE:", endpoint);

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(contentData),
      });

      if (response.ok) {
        console.log("✅ Contenido actualizado exitosamente");
        await fetchAllContent(); // Recargar lista
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Error al actualizar contenido:", errorData);
        setError(errorData.message || "Error al actualizar contenido");
        return false;
      }
    } catch (error) {
      console.error("Error updating content:", error);
      setError("Error de conexión");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar contenido
  const deleteContent = async (contentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🗑️ Eliminando contenido:", contentId);

      // ⚠️ IMPORTANTE: El ID va en la URL como path parameter
      const endpoint = `/api/proxy?path=Content/${contentId}`;

      console.log("📡 Endpoint DELETE:", endpoint);

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        console.log("✅ Contenido eliminado exitosamente");
        await fetchAllContent(); // Recargar lista
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Error al eliminar contenido:", errorData);
        setError(
          errorData.message || errorData.error || "Error al eliminar contenido",
        );
        return false;
      }
    } catch (error) {
      console.error("Error deleting content:", error);
      setError("Error de conexión");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar contenidos al montar el componente
  useEffect(() => {
    fetchAllContent();
  }, []);

  return {
    contents,
    isLoading,
    error,
    uploadProgress,
    fetchAllContent,
    createContent,
    updateContent,
    deleteContent,
    uploadFile,
  };
}
