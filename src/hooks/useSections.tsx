import { useState } from 'react';

interface Section {
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

interface CreateSectionData {
  categoryId: string;
  sectionName: string;
  description: string;
  countries: string[];
}

export function useSections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const fetchSectionsByCategory = async (categoryId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📥 Obteniendo secciones para categoría:', categoryId);
      
      // Usar proxy con path parameter
      const endpoint = `/api/proxy?path=Section/by-category/${categoryId}`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Secciones obtenidas:', result);
        
        // La API devuelve { status, message, data }
        const sectionsData = result.data || [];
        setSections(sectionsData);
        return sectionsData;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error al cargar secciones:', errorData);
        setError(errorData.message || 'Error al cargar secciones');
        return [];
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setError('Error de conexión');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createSection = async (sectionData: CreateSectionData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Creando sección:', sectionData);
      
      // Usar proxy en desarrollo y producción
      const endpoint = `/api/proxy?path=Section/create`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sectionData)
      });

      if (response.ok) {
        console.log('✅ Sección creada exitosamente');
        // Recargar secciones de la categoría
        await fetchSectionsByCategory(sectionData.categoryId);
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error al crear sección:', errorData);
        setError(errorData.message || 'Error al crear sección');
        return false;
      }
    } catch (error) {
      console.error('Error creating section:', error);
      setError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSection = async (sectionId: string, sectionData: Omit<CreateSectionData, 'categoryId'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Actualizando sección:', sectionId, sectionData);
      
      // ⚠️ IMPORTANTE: El ID va en la URL como path parameter
      // Endpoint: /api/Section/update/{id}
      const endpoint = `/api/proxy?path=Section/update/${sectionId}`;
      
      console.log('📡 Endpoint UPDATE:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(sectionData)
      });

      if (response.ok) {
        console.log('✅ Sección actualizada exitosamente');
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error al actualizar sección:', errorData);
        setError(errorData.message || 'Error al actualizar sección');
        return false;
      }
    } catch (error) {
      console.error('Error updating section:', error);
      setError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSection = async (sectionId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🗑️ Eliminando sección:', sectionId);
      
      // ⚠️ IMPORTANTE: El ID va en la URL como path parameter
      // Endpoint: /api/Section/delete/{id}
      const endpoint = `/api/proxy?path=Section/delete/${sectionId}`;
      
      console.log('📡 Endpoint DELETE:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        console.log('✅ Sección eliminada exitosamente');
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error al eliminar sección:', errorData);
        setError(errorData.message || errorData.error || 'Error al eliminar sección');
        return false;
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      setError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sections,
    isLoading,
    error,
    fetchSectionsByCategory,
    createSection,
    updateSection,
    deleteSection
  };
}
