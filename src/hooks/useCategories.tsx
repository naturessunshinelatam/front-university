import { useState, useEffect } from 'react';

interface Category {
  id: string;
  categoryName: string;
  name: string; // Alias para compatibilidad
  description: string;
  categoryIcon: string;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  assignedUsersCount: number;
  sections: any[]; // Para compatibilidad con AdminPanel
}

interface CreateCategoryData {
  categoryName: string;
  categoryDescription: string;
  categoryIcon: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
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

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      console.log('🔑 Token desde localStorage:', token ? `${token.substring(0, 50)}...` : 'No token');
      
      const headers = getAuthHeaders();
      console.log('📤 Headers enviados:', headers);
      
      // Usar proxy en desarrollo y producción
      const endpoint = `/api/proxy?path=Categories/all`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: headers
      });

      console.log('📡 Status de respuesta:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Categorías obtenidas:', data);
        
        let categoriesData: any[] = [];
        
        // La API devuelve { status, message, response } donde response es el array de categorías
        if (data.status === 'success' && Array.isArray(data.response)) {
          categoriesData = data.response;
        } else if (Array.isArray(data)) {
          categoriesData = data;
        } else {
          console.log('⚠️ Estructura de respuesta inesperada:', data);
          setCategories([]);
          return;
        }
        
        // Cargar secciones para cada categoría
        const categoriesWithSections = await Promise.all(
          categoriesData.map(async (cat) => {
            try {
              // Obtener secciones de esta categoría
              const sectionsEndpoint = `/api/proxy?path=Section/by-category/${cat.id}`;
              const sectionsResponse = await fetch(sectionsEndpoint, {
                method: 'GET',
                headers: headers
              });
              
              let sections = [];
              if (sectionsResponse.ok) {
                const sectionsResult = await sectionsResponse.json();
                sections = sectionsResult.data || [];
              }
              
              return {
                ...cat,
                name: cat.categoryName,
                sections: sections
              };
            } catch (error) {
              console.error(`Error al cargar secciones para categoría ${cat.id}:`, error);
              return {
                ...cat,
                name: cat.categoryName,
                sections: []
              };
            }
          })
        );
        
        console.log('✅ Categorías con secciones:', categoriesWithSections);
        setCategories(categoriesWithSections);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error al cargar categorías:', response.status, errorData);
        console.error('❌ Detalles del error:', errorData);
        setError(`Error al cargar categorías: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const createCategory = async (categoryData: CreateCategoryData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Creando categoría:', categoryData);
      
      // Usar proxy en desarrollo y producción
      const endpoint = `/api/proxy?path=Categories/create`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData)
      });

      if (response.ok) {
        console.log('✅ Categoría creada exitosamente');
        await fetchCategories(); // Recargar lista
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Error al crear categoría');
        return false;
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (categoryId: string, categoryData: CreateCategoryData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Actualizando categoría:', categoryId, categoryData);
      
      // ⚠️ IMPORTANTE: El ID va en la URL como path parameter, NO en el body
      const updateData = {
        categoryName: categoryData.categoryName,
        categoryDescription: categoryData.categoryDescription,
        categoryIcon: categoryData.categoryIcon
      };
      
      console.log('📤 Datos a enviar en el body:', updateData);
      
      // Usar proxy en desarrollo y producción
      // El ID va en la URL: /api/Categories/update/{id}
      const endpoint = `/api/proxy?path=Categories/update/${categoryId}`;
      
      console.log('📡 Endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        console.log('✅ Categoría actualizada exitosamente');
        await fetchCategories(); // Recargar lista
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error al actualizar categoría:', errorData);
        setError(errorData.error || 'Error al actualizar categoría');
        return false;
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🗑️ Eliminando categoría:', categoryId);
      
      // Usar proxy en desarrollo y producción
      // Para query parameters, codificar el path completo incluyendo el query string
      const endpoint = `/api/proxy?path=${encodeURIComponent(`Categories?categoryId=${categoryId}`)}`;
      
      console.log('📡 Endpoint DELETE:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        console.log('✅ Categoría eliminada exitosamente');
        await fetchCategories(); // Recargar lista
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error al eliminar categoría:', errorData);
        setError(errorData.error || errorData.message || 'Error al eliminar categoría');
        return false;
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
}
