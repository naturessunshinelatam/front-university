import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../components/AlertSystem';
import { useContentData } from '../hooks/useContentData';
import { useContent } from '../hooks/useContent';
import { useUsers } from '../hooks/useUsers';
import { useCategories } from '../hooks/useCategories';
import { useSections } from '../hooks/useSections';
import ContentForm from '../components/ContentForm';
import CategoryForm from '../components/CategoryForm';
import UserForm from '../components/UserForm';
import SectionForm from '../components/SectionForm';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { 
  Users, 
  FileText, 
  Settings, 
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Shield,
  Search,
  FolderPlus,
  UserPlus,
  Youtube,
  ExternalLink
} from 'lucide-react';

import { useLocation } from 'react-router-dom';

export default function AdminPanel() {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'content');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [isContentFormOpen, setIsContentFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isSectionFormOpen, setIsSectionFormOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(undefined);
  const [editingUser, setEditingUser] = useState<any>(undefined);
  const [editingSection, setEditingSection] = useState<any>(undefined);
  const [editingSectionCategoryId, setEditingSectionCategoryId] = useState('');
  const [userToDelete, setUserToDelete] = useState<{ email: string; name: string } | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  
  // Mantener el hook de datos mock para Analytics y Settings
  const { 
    contentItems, 
    systemConfig,
    setContentItems,
    updateSystemConfig,
    getContentStats
  } = useContentData();

  // Usar el hook de contenido real para operaciones CRUD
  const { contents, fetchAllContent, deleteContent: deleteContentAPI, isLoading: isLoadingContent } = useContent();

  // Usar el hook de categorías real
  const { categories, fetchCategories, deleteCategory } = useCategories();

  // Usar el hook de usuarios real
  const { users, fetchUsers, deleteUser } = useUsers();

  // Usar el hook de secciones
  const { deleteSection } = useSections();

  // Solo los usuarios con rol "Admin" pueden ver la sección de usuarios
  const tabs = user?.role === 'Admin' ? [
    { id: 'content', label: 'Gestión de Contenido', icon: FileText },
    { id: 'categories', label: 'Categorías y Secciones', icon: FolderPlus },
    { id: 'users', label: 'Usuarios y Permisos', icon: Users },
    { id: 'analytics', label: 'Analíticas', icon: BarChart3 },
    { id: 'settings', label: 'Configuración General', icon: Settings }
  ] : [
    { id: 'content', label: 'Gestión de Contenido', icon: FileText },
    { id: 'categories', label: 'Categorías y Secciones', icon: FolderPlus },
    { id: 'analytics', label: 'Mis Estadísticas', icon: BarChart3 }
  ];

  const handleSaveContent = async () => {
    // La lógica de guardado ahora está en el ContentForm usando el hook useContent
    // Refrescar la lista de contenidos reales
    await fetchAllContent();
    
    // NO mostrar alerta aquí porque ContentForm ya lo hace
    setEditingContent(null);
  };

  const handleSaveCategory = async () => {
    // La lógica de guardado ahora está en el CategoryForm usando el hook useCategories
    // Refrescar la lista de categorías para que estén disponibles en UserForm
    await fetchCategories();
    
    // Mostrar alerta de éxito
    showAlert({
      type: 'success',
      title: editingCategory ? '✅ Categoría Actualizada' : '✅ Categoría Creada',
      message: editingCategory 
        ? `La categoría ha sido actualizada exitosamente.`
        : `La categoría ha sido creada exitosamente y ya está disponible.`
    });
    
    setEditingCategory(null);
  };

  const handleSaveUser = async () => {
    // La lógica de guardado ahora está en el UserForm usando el hook useUsers
    // Refrescar la lista de usuarios para ver los cambios
    await fetchUsers();
    
    // Mostrar alerta de éxito
    showAlert({
      type: 'success',
      title: editingUser ? '✅ Usuario Actualizado' : '✅ Usuario Creado',
      message: editingUser 
        ? `El usuario ha sido actualizado exitosamente.`
        : `El usuario ha sido creado exitosamente y ya tiene acceso al sistema.`
    });
    
    setEditingUser(null);
  };

  // Función para manejar guardado de secciones
  const handleSaveSection = async () => {
    await fetchCategories();
    showAlert({
      type: 'success',
      title: editingSection ? '✅ Sección Actualizada' : '✅ Sección Creada',
      message: editingSection 
        ? `La sección ha sido actualizada exitosamente.`
        : `La sección ha sido creada exitosamente y ya está disponible.`
    });
    setEditingSection(null);
    setEditingSectionCategoryId('');
  };

  const handleEditContent = (content: any) => {
    // Mapear los datos del contenido de la API al formato del formulario
    const contentForEdit = {
      id: content.id,
      contentTitle: content.title,
      author: content.author,
      description: content.description,
      categoryId: content.category,
      sectionId: content.section,
      subsection: content.subsection,
      contentType: content.type === 'video' ? 'Video' : content.type === 'file' ? 'File' : 'Image',
      contentUrl: content.url,
      size: content.size,
      availableCountries: content.countries,
      status: content.status === 'publicado' ? 'Published' : 'Draft',
      publishedAt: content.publishDate,
      expiresAt: content.expirationDate
    };
    
    setEditingContent(contentForEdit);
    setIsContentFormOpen(true);
  };

  const handleEditCategory = (category: any) => {
    // Aquí cargo los datos de la categoría a editar en el formulario
    setEditingCategory(category);
    setIsCategoryFormOpen(true);
  };

  const handleEditUser = (user: any) => {
    console.log('🔍 handleEditUser called with user:', user);
    console.log('🔍 handleEditUser - user.accesibleCategories:', user.accesibleCategories);
    console.log('🔍 handleEditUser - user.accesibleCategories type:', typeof user.accesibleCategories);
    console.log('🔍 handleEditUser - user.accesibleCategories isArray:', Array.isArray(user.accesibleCategories));
    console.log('🔍 handleEditUser - categories available:', categories);
    console.log('🔍 handleEditUser - categories length:', categories.length);
    
    // Aquí cargo los datos del usuario a editar en el formulario
    setEditingUser(user);
    setIsUserFormOpen(true);
  };

  const handleEditSection = (categoryId: string, section: any) => {
    setEditingSection(section);
    setEditingSectionCategoryId(categoryId);
    setIsSectionFormOpen(true);
  };

  const handleDeleteContent = async (contentId: string) => {
    // Buscar el contenido en los datos reales de la API, no en contentItems (mock)
    const content = contents.find(item => item.id === contentId);
    if (content) {
      showAlert({
        type: 'warning',
        title: '¿Confirmar eliminación?',
        message: `¿Estás seguro de que deseas eliminar "${content.contentTitle}"? Esta acción no se puede deshacer.`,
        duration: 0,
        onConfirm: async () => {
          try {
            const success = await deleteContentAPI(contentId);
            if (success) {
              showAlert({
                type: 'success',
                title: '✅ Contenido Eliminado',
                message: `El contenido "${content.contentTitle}" ha sido eliminado exitosamente.`
              });
            } else {
              showAlert({
                type: 'error',
                title: '❌ Error al Eliminar',
                message: 'No se pudo eliminar el contenido. Por favor, inténtalo de nuevo.'
              });
            }
          } catch (error) {
            console.error('Error deleting content:', error);
            showAlert({
              type: 'error',
              title: '❌ Error de Conexión',
              message: 'Ocurrió un error al conectar con el servidor. Por favor, inténtalo más tarde.'
            });
          }
        }
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      showAlert({
        type: 'warning',
        title: '¿Confirmar eliminación?',
        message: `¿Estás seguro de que deseas eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`,
        duration: 0,
        onConfirm: async () => {
          try {
            const success = await deleteCategory(categoryId);
            if (success) {
              showAlert({
                type: 'success',
                title: 'Categoría Eliminada',
                message: `La categoría "${category.name}" ha sido eliminada exitosamente.`
              });
            } else {
              showAlert({
                type: 'error',
                title: 'Error al eliminar',
                message: 'No se pudo eliminar la categoría. Inténtalo de nuevo.'
              });
            }
          } catch (error) {
            console.error('Error deleting category:', error);
            showAlert({
              type: 'error',
              title: 'Error de conexión',
              message: 'Error al conectar con el servidor. Inténtalo de nuevo.'
            });
          }
        }
      });
    }
  };

  const handleDeleteUser = (userEmail: string) => {
    const user = users.find(u => u.email === userEmail);
    if (!user) {
      showAlert({
        type: 'error',
        title: 'Usuario no encontrado',
        message: 'No se pudo encontrar el usuario a eliminar.'
      });
      return;
    }

    // Abrir modal de confirmación
    setUserToDelete({
      email: user.email,
      name: user.usernames
    });
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeletingUser(true);
    try {
      const success = await deleteUser(userToDelete.email);
      if (success) {
        showAlert({
          type: 'success',
          title: '✅ Usuario Eliminado',
          message: `El usuario "${userToDelete.name}" ha sido eliminado exitosamente del sistema.`
        });
        setUserToDelete(null);
      } else {
        showAlert({
          type: 'error',
          title: '❌ Error al Eliminar',
          message: 'No se pudo eliminar el usuario. Por favor, verifica los permisos e inténtalo de nuevo.'
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showAlert({
        type: 'error',
        title: '❌ Error de Conexión',
        message: 'Ocurrió un error al conectar con el servidor. Por favor, inténtalo más tarde.'
      });
    } finally {
      setIsDeletingUser(false);
    }
  };


  const handleAddSection = (categoryId: string) => {
    setEditingSection(null);
    setEditingSectionCategoryId(categoryId);
    setIsSectionFormOpen(true);
  };

  const handleDeleteSection = async (sectionId: string, sectionName: string) => {
    showAlert({
      type: 'warning',
      title: '¿Confirmar eliminación?',
      message: `¿Estás seguro de que deseas eliminar la sección "${sectionName}"? Esta acción no se puede deshacer.`,
      duration: 0,
      onConfirm: async () => {
        try {
          const success = await deleteSection(sectionId);
          if (success) {
            // Recargar categorías para actualizar la lista de secciones
            await fetchCategories();
            showAlert({
              type: 'success',
              title: '✅ Sección Eliminada',
              message: `La sección "${sectionName}" ha sido eliminada exitosamente.`
            });
          } else {
            showAlert({
              type: 'error',
              title: '❌ Error al Eliminar',
              message: 'No se pudo eliminar la sección. Por favor, inténtalo de nuevo.'
            });
          }
        } catch (error) {
          console.error('Error deleting section:', error);
          showAlert({
            type: 'error',
            title: '❌ Error de Conexión',
            message: 'Ocurrió un error al conectar con el servidor. Por favor, inténtalo más tarde.'
          });
        }
      }
    });
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  // Función para obtener el nombre de una categoría por ID
  const getCategoryNameById = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.categoryName || category.name : categoryId;
  };

  const renderContentManagement = () => {
    // Usar contenidos reales de la API
    const realContents = contents.map(content => ({
      id: content.id,
      title: content.contentTitle,
      description: content.description,
      category: content.categoryId,
      section: content.sectionId,
      subsection: content.subsection,
      type: content.contentType.toLowerCase(),
      url: content.contentUrl,
      size: content.size,
      author: content.author,
      countries: content.availableCountries,
      status: content.status === 'Published' ? 'publicado' : 'borrador',
      publishDate: content.publishedAt,
      expirationDate: content.expiresAt,
      lastModified: content.updatedAt || content.createdAt,
      views: 0, // TODO: Agregar cuando el API lo soporte
      created_at: content.createdAt,
      updated_at: content.updatedAt
    }));

    // Filtrar contenido basado en búsqueda
    const filteredContent = realContents.filter(item => {
      // Filtro de búsqueda
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (
          item.title.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.author?.toLowerCase().includes(searchLower) ||
          getCategoryName(item.category || '').toLowerCase().includes(searchLower) ||
          item.type.toLowerCase().includes(searchLower)
        );
        if (!matchesSearch) return false;
      }
      
      // Filtro de estado
      if (filterStatus !== 'all' && item.status !== filterStatus) {
        return false;
      }
      
      // Filtro de país
      if (filterCountry !== 'all' && !item.countries.includes(filterCountry)) {
        return false;
      }
      
      return true;
    });

    return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar contenido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent"
            />
          </div>
          
          {/* Filtros */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="publicado">Publicado</option>
            <option value="borrador">Borrador</option>
          </select>
          
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent"
          >
            <option value="all">Todos los países</option>
            {systemConfig.availableCountries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#124C45]">{realContents.length}</div>
            <div className="text-sm text-gray-600">Total Contenidos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{realContents.filter(item => item.status === 'publicado').length}</div>
            <div className="text-sm text-gray-600">Publicados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{realContents.filter(item => item.status === 'borrador').length}</div>
            <div className="text-sm text-gray-600">Borradores</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredContent.length}</div>
            <div className="text-sm text-gray-600">Filtrados</div>
          </div>
        </div>
        
        <button
          onClick={() => setIsContentFormOpen(true)}
          className="flex items-center space-x-2 bg-[#124C45] text-white px-4 py-2 rounded-lg hover:bg-[#0f3d37] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Contenido</span>
        </button>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-900 min-w-[200px]">Título</th>
                <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-900 min-w-[120px]">Categoría</th>
                <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-900 min-w-[80px]">Tipo</th>
                <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-900 min-w-[100px] hidden lg:table-cell">Autor</th>
                <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-900 min-w-[100px] hidden xl:table-cell">Países</th>
                <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-900 min-w-[80px]">Estado</th>
                <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-900 min-w-[70px] hidden lg:table-cell">Vistas</th>
                <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-900 min-w-[120px] sticky right-0 bg-gray-50">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredContent.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 sm:px-4">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      {item.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 max-w-[180px]">{item.description}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Modificado: {new Date(item.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm">{getCategoryName(item.category || '')}</td>
                  <td className="py-3 px-2 sm:px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full uppercase">
                      {item.type === 'youtube' ? 'YouTube' : item.type}
                    </span>
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm hidden lg:table-cell">
                    {item.author || '-'}
                  </td>
                  <td className="py-3 px-2 sm:px-4 hidden xl:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {item.countries.map((country) => (
                        <span key={country} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {country}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-2 sm:px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.status === 'publicado' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status === 'publicado' ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-gray-600 hidden lg:table-cell">{item.views.toLocaleString()}</td>
                  <td className="py-3 px-2 sm:px-4 sticky right-0 bg-white">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-[#124C45] transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditContent(item)}
                        className="p-1 text-gray-400 hover:text-[#023D4F] transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteContent(item.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 p-3">
          {filteredContent.map((item) => (
            <div key={item.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{getCategoryName(item.category || '')}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ml-2 ${
                  item.status === 'publicado' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.status === 'publicado' ? 'Publicado' : 'Borrador'}
                </span>
              </div>
              
              {/* Información adicional en móvil */}
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Autor:</span> {item.author || 'No especificado'}</p>
                <p><span className="font-medium">Vistas:</span> {item.views.toLocaleString()}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {item.type === 'youtube' ? 'YouTube' : item.type}
                </span>
                {item.countries.slice(0, 2).map((country) => (
                  <span key={country} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {country}
                  </span>
                ))}
                {item.countries.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    +{item.countries.length - 2}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200">
                <button className="p-2 text-gray-400 hover:text-[#124C45] transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleEditContent(item)}
                  className="p-2 text-gray-400 hover:text-[#023D4F] transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteContent(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {filteredContent.length === 0 && searchTerm && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron contenidos que coincidan con "{searchTerm}"
            </div>
          )}
          
          {realContents.length === 0 && !searchTerm && isLoadingContent && (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#124C45] mx-auto"></div>
              <p className="mt-2">Cargando contenidos...</p>
            </div>
          )}
          
          {realContents.length === 0 && !searchTerm && !isLoadingContent && (
            <div className="text-center py-8 text-gray-500">No hay contenido disponible</div>
          )}
        </div>
      </div>
    </div>
    );
  };

  const renderCategoryManagement = () => (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="space-y-4">
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-semibold text-gray-900">Gestión de Categorías y Secciones</h2>
          <p className="text-gray-600">Administra la estructura de contenido de Universidad Sunshine</p>
        </div>
        <button 
          onClick={() => setIsCategoryFormOpen(true)}
          className="flex items-center space-x-2 bg-[#124C45] text-white px-4 py-2 rounded-lg hover:bg-[#0f3d37] transition-colors"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleEditCategory(category)}
                    className="p-2 text-gray-400 hover:text-[#023D4F] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Secciones ({category.sections.length})</h4>
                <button 
                  onClick={() => handleAddSection(category.id)}
                  className="flex items-center space-x-1 text-[#124C45] hover:text-[#0f3d37] text-sm px-2 py-1 rounded hover:bg-[#124C45]/5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Agregar</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {category.sections.map((section) => (
                  <div key={section.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{section.sectionName}</p>
                      <p className="text-xs text-gray-600 mt-1">{section.sectionDescription}</p>
                      <div className="space-y-1 mt-2">
                        {/* Mostrar contenido real de la sección desde la API */}
                        {contents
                          .filter(item => item.categoryId === category.id && item.sectionId === section.id)
                          .slice(0, 3)
                          .map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-xs text-gray-500">
                              <div className={`w-2 h-2 rounded-full ${
                                item.contentType === 'File' ? 'bg-red-500' : 
                                item.contentType === 'Video' ? 'bg-red-600' : 
                                'bg-blue-500'
                              }`}></div>
                              <span className="truncate">{item.contentTitle}</span>
                            </div>
                          ))}
                        
                        {/* Mostrar más contenidos si hay más de 3 */}
                        {contents.filter(item => item.categoryId === category.id && item.sectionId === section.id).length > 3 && (
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            <span>+{contents.filter(item => item.categoryId === category.id && item.sectionId === section.id).length - 3} más...</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {contents.filter(item => item.categoryId === category.id && item.sectionId === section.id).length} Contenidos
                      </div>
                      {section.countries && section.countries.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {section.countries.map((countryCode: string) => (
                            <span key={countryCode} className="px-1 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                              {countryCode}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 self-end sm:self-auto">
                      <button 
                        onClick={() => handleEditSection(category.id, section)}
                        className="p-1 text-gray-400 hover:text-[#023D4F] transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSection(section.id, section.sectionName)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUserManagement = () => {
    // Debug: ver qué categorías y usuarios tenemos
    console.log('🔍 Categories available:', categories);
    console.log('🔍 Categories IDs:', categories.map(c => ({ id: c.id, type: typeof c.id, name: c.categoryName || c.name })));
    console.log('🔍 Users:', users);
    console.log('🔍 Users accesibleCategories:', users.map(u => ({ 
      email: u.email, 
      categories: u.accesibleCategories,
      categoryTypes: u.accesibleCategories?.map(id => typeof id)
    })));
    
    return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4 overflow-x-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent"
            />
          </div>
        </div>
        <button 
          onClick={() => setIsUserFormOpen(true)}
          className="flex items-center space-x-2 bg-[#124C45] text-white px-4 py-2 rounded-lg hover:bg-[#0f3d37] transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Usuario</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Rol</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Permisos</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Países</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Estado</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Último Acceso</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{user.usernames}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.roles.includes('Admin') 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.roles.includes('Admin') ? 'Administrador' : 'Admin Contenido'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {(user.accesibleCategories || []).length === 0 ? (
                        <span className="text-xs text-gray-400 italic">Sin categorías asignadas</span>
                      ) : (
                        (user.accesibleCategories || []).map((categoryName) => {
                          // user.accesibleCategories contiene NOMBRES, no IDs
                          return (
                            <span key={categoryName} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                              {categoryName}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {(user.countries || []).map((country) => (
                        <span key={country} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {country}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="p-1 text-gray-400 hover:text-[#023D4F] transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.email)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Card View for Users */}
        <div className="lg:hidden space-y-4 p-4">
          {users.map((user) => (
            <div key={user.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900">{user.usernames}</h3>
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                    user.roles.includes('Admin') 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.roles.includes('Admin') ? 'Administrador' : 'Admin Contenido'}
                  </span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Categorías:</p>
                <div className="flex flex-wrap gap-1">
                  {(user.accesibleCategories || []).length === 0 ? (
                    <span className="text-xs text-gray-400 italic">Sin categorías asignadas</span>
                  ) : (
                    <>
                      {(user.accesibleCategories || []).slice(0, 3).map((categoryName) => {
                        // user.accesibleCategories contiene NOMBRES, no IDs
                        return (
                          <span key={categoryName} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            {categoryName}
                          </span>
                        );
                      })}
                      {(user.accesibleCategories || []).length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{(user.accesibleCategories || []).length - 3}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Países:</p>
                <div className="flex flex-wrap gap-1">
                  {(user.countries || []).slice(0, 4).map((country) => (
                    <span key={country} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {country}
                    </span>
                  ))}
                  {(user.countries || []).length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      +{(user.countries || []).length - 4}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-200">
                <span>Último acceso: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca'}</span>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleEditUser(user)}
                    className="p-2 text-gray-400 hover:text-[#023D4F] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user.email)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Eliminar usuario"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    );
  };

  const renderAnalytics = () => {
    const stats = getContentStats('MX'); // Ejemplo con México
    const topContent = [...contentItems]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10);

    return (
      <div className="space-y-6">
        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contenidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalContent}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.videoContent}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Youtube className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">PDFs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pdfContent}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enlaces</p>
                <p className="text-2xl font-bold text-gray-900">{stats.linkContent}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Contenido Más Visto */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contenido Más Visto</h3>
            <div className="space-y-4">
              {topContent.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#124C45] text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">{getCategoryName(item.category || '')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#124C45]">{(item.views || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">vistas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estadísticas por Categoría */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contenido por Categoría</h3>
            <div className="space-y-4">
              {stats.categoryStats.map((category) => (
                <div key={category.categoryId} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{category.categoryName}</p>
                    <p className="text-sm text-gray-500">{category.totalViews.toLocaleString()} vistas totales</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#023D4F]">{category.contentCount}</p>
                    <p className="text-sm text-gray-500">contenidos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actividad por País */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad por País</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemConfig.availableCountries.map((country) => {
              const countryStats = getContentStats(country);
              const countryFlags: { [key: string]: string } = {
                'MX': '🇲🇽', 'CO': '🇨🇴', 'EC': '🇪🇨', 'SV': '🇸🇻',
                'GT': '🇬🇹', 'HN': '🇭🇳', 'DO': '🇩🇴', 'PA': '🇵🇦'
              };
              const countryNames: { [key: string]: string } = {
                'MX': 'México', 'CO': 'Colombia', 'EC': 'Ecuador', 'SV': 'El Salvador',
                'GT': 'Guatemala', 'HN': 'Honduras', 'DO': 'Rep. Dominicana', 'PA': 'Panamá'
              };
              
              return (
                <div key={country} className="p-4 border border-gray-100 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">{countryFlags[country]}</span>
                    <span className="font-medium text-sm">{countryNames[country]}</span>
                  </div>
                  <div className="text-2xl font-bold text-[#124C45]">{countryStats.totalContent}</div>
                  <div className="text-xs text-gray-500">contenidos disponibles</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    const handleConfigChange = (key: string, value: any) => {
      updateSystemConfig({ [key]: value });
      showAlert({
        type: 'success',
        title: 'Configuración Actualizada',
        message: `La configuración "${key}" ha sido actualizada exitosamente.`
      });
    };

    return (
      <div className="space-y-6">
        {/* Configuración General */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración General</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Plataforma
              </label>
              <input
                type="text"
                value={systemConfig.platformName}
                onChange={(e) => handleConfigChange('platformName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máximo de Contenidos por Sección
              </label>
              <input
                type="number"
                value={systemConfig.maxContentPerSection}
                onChange={(e) => handleConfigChange('maxContentPerSection', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent"
                min="1"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Países Disponibles */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Países Disponibles</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['MX', 'CO', 'EC', 'SV', 'GT', 'HN', 'DO', 'PA'].map((country) => {
              const isEnabled = systemConfig.availableCountries.includes(country);
              return (
                <label key={country} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                  <input 
                    type="checkbox" 
                    checked={isEnabled}
                    onChange={(e) => {
                      const newCountries = e.target.checked 
                        ? [...systemConfig.availableCountries, country]
                        : systemConfig.availableCountries.filter(c => c !== country);
                      handleConfigChange('availableCountries', newCountries);
                    }}
                    className="rounded text-[#124C45] focus:ring-[#124C45]" 
                  />
                  <span className="text-sm font-medium">{country}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Configuración de Contenido */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Contenido</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={systemConfig.publicContent}
                  onChange={(e) => handleConfigChange('publicContent', e.target.checked)}
                  className="rounded text-[#124C45] focus:ring-[#124C45]" 
                />
                <span className="text-sm">Contenido público sin restricciones</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={systemConfig.notifyUpdates}
                  onChange={(e) => handleConfigChange('notifyUpdates', e.target.checked)}
                  className="rounded text-[#124C45] focus:ring-[#124C45]" 
                />
                <span className="text-sm">Notificar actualizaciones a administradores</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={systemConfig.showStats}
                  onChange={(e) => handleConfigChange('showStats', e.target.checked)}
                  className="rounded text-[#124C45] focus:ring-[#124C45]" 
                />
                <span className="text-sm">Mostrar estadísticas de visualización</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={systemConfig.autoPublish}
                  onChange={(e) => handleConfigChange('autoPublish', e.target.checked)}
                  className="rounded text-[#124C45] focus:ring-[#124C45]" 
                />
                <span className="text-sm">Auto-publicar contenido nuevo</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={systemConfig.maintenanceMode}
                  onChange={(e) => handleConfigChange('maintenanceMode', e.target.checked)}
                  className="rounded text-[#124C45] focus:ring-[#124C45]" 
                />
                <span className="text-sm text-red-600">Modo de mantenimiento (oculta el sitio público)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'content':
        return renderContentManagement();
      case 'categories':
        return renderCategoryManagement();
      case 'users':
        return renderUserManagement();
      case 'analytics':
        return renderAnalytics();
      case 'settings':
        return renderSettings();
      default:
        return renderContentManagement();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Content Form Modal */}
        <ContentForm
          isOpen={isContentFormOpen}
          onClose={() => {
            setIsContentFormOpen(false);
            setEditingContent(null);
          }}
          onSave={handleSaveContent}
          editingContent={editingContent}
          categories={categories}
        />

        {/* Category Form Modal */}
        <CategoryForm
          isOpen={isCategoryFormOpen}
          onClose={() => {
            setIsCategoryFormOpen(false);
            setEditingCategory(undefined);
          }}
          onSave={handleSaveCategory}
          editingCategory={editingCategory}
        />

        {/* User Form Modal */}
        <UserForm
          isOpen={isUserFormOpen}
          onClose={() => {
            setIsUserFormOpen(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
          editingUser={editingUser}
          categories={categories}
        />

        {/* Section Form Modal */}
        <SectionForm
          isOpen={isSectionFormOpen}
          onClose={() => {
            setIsSectionFormOpen(false);
            setEditingSection(null);
            setEditingSectionCategoryId('');
          }}
          onSave={handleSaveSection}
          editingSection={editingSection}
          categoryId={editingSectionCategoryId}
        />

        {/* Confirm Delete User Modal */}
        <ConfirmDeleteModal
          isOpen={userToDelete !== null}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleConfirmDelete}
          userName={userToDelete?.name || ''}
          userEmail={userToDelete?.email || ''}
          isLoading={isDeletingUser}
        />

        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Universidad Sunshine - Gestión de contenido por países
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-4 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 sm:space-x-2 py-2 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#124C45] text-[#124C45]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}