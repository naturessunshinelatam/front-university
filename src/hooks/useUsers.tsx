import { useState, useEffect } from 'react';

interface User {
  id?: string;
  usernames: string;
  email: string;
  roles: string[];
  countries: string[];
  accesibleCategories: string[];
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string;
  privilegies?: string[];
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
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

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Usar proxy en desarrollo y producción
      const endpoint = `/api/proxy?path=User`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        
        // ⚠️ IMPORTANTE: El backend devuelve "categories" pero necesitamos "accesibleCategories"
        const mappedUsers = Array.isArray(data) ? data.map((user: any) => ({
          ...user,
          accesibleCategories: user.categories || user.accesibleCategories || []
        })) : [];
        
        console.log('✅ Users fetched and mapped:', mappedUsers);
        setUsers(mappedUsers);
      } else {
        setError('Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'> & { password: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Usar proxy en desarrollo y producción
      const endpoint = `/api/proxy?path=User/create`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        await fetchUsers(); // Recargar lista
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Error al crear usuario');
        return false;
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Omit<User, 'createdAt' | 'lastLogin'> & { password?: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Usar proxy en desarrollo y producción
      const endpoint = `/api/proxy?path=User/update`;
      
      // Preparar datos según la estructura de la API
      const updatePayload = {
        usernames: userData.usernames,
        email: userData.email,
        isActive: userData.isActive,
        roles: userData.roles,
        countries: userData.countries,
        accesibleCategories: userData.accesibleCategories,
        // Solo incluir password si se proporcionó
        ...(userData.password && { password: userData.password })
      };
      
      console.log('🔄 Actualizando usuario:', updatePayload);
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatePayload)
      });

      if (response.ok) {
        console.log('✅ Usuario actualizado exitosamente');
        await fetchUsers(); // Recargar lista
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error al actualizar usuario:', errorData);
        setError(errorData.message || 'Error al actualizar usuario');
        return false;
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🗑️ Eliminando usuario:', email);
      
      // Usar proxy en desarrollo y producción
      // Para query parameters, codificar el path completo incluyendo el query string
      const endpoint = `/api/proxy?path=${encodeURIComponent(`User/delete?email=${email}`)}`;
      
      console.log('📡 Endpoint DELETE:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        console.log('✅ Usuario eliminado exitosamente');
        await fetchUsers(); // Recargar lista
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error al eliminar usuario:', errorData);
        setError(errorData.message || errorData.error || 'Error al eliminar usuario');
        return false;
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
}
