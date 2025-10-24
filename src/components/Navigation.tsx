import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCountry } from '../contexts/CountryContext';
import { usePublicContentAll } from '../hooks/usePublicContentAll';
import * as LucideIcons from 'lucide-react';
import CategoryOrderManager from './CategoryOrderManager';
import { 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  LogOut, 
  Settings, 
  BarChart3,
  MoreHorizontal,
  ArrowUpDown
} from 'lucide-react';

export default function Navigation() {
  const { user, logout } = useAuth();
  const { selectedCountry, availableCountries, setSelectedCountry } = useCountry();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isCategoryOrderOpen, setIsCategoryOrderOpen] = useState(false);

  // Usar hook de contenido completo (TODO desde API en tiempo real)
  const { 
    content,
    categories,
    getContentByCategory,
    getCategoriesWithContent
  } = usePublicContentAll(selectedCountry.code);

  // Obtener solo categorías que tienen contenido
  const categoriesWithContent = getCategoriesWithContent();
  
  // Mapear a formato esperado por la navegación
  const availableCategories = categoriesWithContent.map(category => ({
    id: category.id,
    name: category.categoryName,
    description: category.description,
    icon: category.categoryIcon
  }));

  console.log('🔍 Navigation - País:', selectedCountry.code);
  console.log('🔍 Navigation - Total contenidos API:', content.length);
  console.log('🔍 Navigation - Total categorías API:', categories.length);
  console.log('🔍 Navigation - Categorías con contenido:', availableCategories.length);

  /**
   * Convierte el nombre de la categoría en un slug amigable para URL
   */
  const createSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres especiales con guiones
      .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final
  };

  /**
   * Crea la URL de la categoría solo con el slug
   */
  const getCategoryUrl = (category: { id: string; name: string }): string => {
    const slug = createSlug(category.name);
    return `/content/${slug}`;
  };

  const getIconForCategory = (iconName: string) => {
    // Mapeo de iconos
    type IconComponent = React.ComponentType<{ className?: string }>;
    const iconMap: { [key: string]: IconComponent } = {
      'Package': LucideIcons.Package,
      'Wrench': LucideIcons.Wrench,
      'Briefcase': LucideIcons.Briefcase,
      'Tv': LucideIcons.Tv,
      'GraduationCap': LucideIcons.GraduationCap,
      'Building': LucideIcons.Building,
      'Zap': LucideIcons.Zap
    };
    return iconMap[iconName] || LucideIcons.Package;
  };

  // Usar las categorías disponibles directamente (ya filtradas por contenido)
  const orderedCategories = availableCategories;
  const visibleCategories = orderedCategories.slice(0, 4);
  const hiddenCategories = orderedCategories.slice(4);

  const handleCountryChange = (country: typeof availableCountries[0]) => {
    setSelectedCountry(country);
    setIsCountryOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserOpen(false);
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="w-full px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo Section - Far Left */}
            <div className="flex items-center flex-shrink-0 min-w-0">
              <Link to="/" className="flex items-center space-x-3">
                <img 
                  src="/Logo_Blanco.png"
                  alt="Universidad Sunshine"
                  className="h-6 sm:h-8 w-auto flex-shrink-0"
                />
                <span className="hidden lg:block text-lg xl:text-xl font-bold text-[#124C45] whitespace-nowrap">
                  Universidad Sunshine
                </span>
              </Link>
            </div>

            {/* Categories Section - Center (XL screens only) */}
            <div className="hidden xl:flex flex-1 justify-center mx-4">
              <div className="flex items-center space-x-1 max-w-4xl">
                {/* Home Link */}
                <div className="flex">
                  <Link
                    to="/"
                    className="flex items-center space-x-1 px-2 py-2 rounded-lg text-gray-700 hover:text-[#124C45] hover:bg-[#124C45]/5 transition-all duration-200 whitespace-nowrap text-sm"
                  >
                    <span className="text-base">🏠</span>
                    <span className="font-medium hidden 2xl:inline">Inicio</span>
                  </Link>
                </div>

                {/* Render first 4 categories */}
                {visibleCategories.slice(0, 4).map((category) => {
                  const IconComponent = getIconForCategory(category.icon);
                  return (
                    <div key={category.id} className="flex">
                      <Link
                        to={getCategoryUrl(category)}
                        className="flex items-center space-x-1 px-2 py-2 rounded-lg text-gray-700 hover:text-[#124C45] hover:bg-[#124C45]/5 transition-all duration-200 whitespace-nowrap text-sm"
                      >
                        <IconComponent className="w-3 h-3" />
                        <span className="font-medium hidden lg:inline">{category.name}</span>
                      </Link>
                    </div>
                  );
                })}
                
                {/* More Categories Dropdown */}
                {hiddenCategories.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                      className="flex items-center space-x-1 px-2 py-2 rounded-lg text-gray-700 hover:text-[#124C45] hover:bg-[#124C45]/5 transition-all duration-200 text-sm"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                      <span className="font-medium hidden lg:inline">Más</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isCategoriesOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                        {hiddenCategories.map(category => {
                          const IconComponent = getIconForCategory(category.icon);
                          return (
                            <Link
                              key={category.id}
                              to={getCategoryUrl(category)}
                              onClick={() => setIsCategoriesOpen(false)}
                              className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-[#124C45] hover:bg-[#124C45]/5 transition-colors text-sm"
                            >
                              <IconComponent className="w-3 h-3" />
                              <div>
                                <span className="font-medium">{category.name}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {/* Country Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsCountryOpen(!isCountryOpen)}
                  className="flex items-center justify-center px-2 sm:px-3 py-2 rounded-lg border border-gray-200 hover:border-[#124C45] hover:bg-[#124C45]/5 transition-all duration-200 w-[50px] sm:w-[55px] overflow-hidden flex-shrink-0"
                >
                  <span className="text-base sm:text-lg flex-shrink-0">{selectedCountry.flag}</span>
                  <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform duration-200 ${isCountryOpen ? 'rotate-180' : ''} flex-shrink-0`} />
                </button>

                {isCountryOpen && (
                  <div className="absolute right-0 mt-2 w-56 sm:w-64 max-w-[90vw] bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-xs sm:text-sm font-medium text-gray-900">Seleccionar País</p>
                    </div>
                    {availableCountries.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => handleCountryChange(country)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#124C45]/5 transition-colors overflow-hidden ${
                          selectedCountry.code === country.code ? 'bg-[#124C45]/10 text-[#124C45]' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <span className="text-base flex-shrink-0">{country.flag}</span>
                          <span className="font-medium text-sm truncate">{country.name}</span>
                        </div>
                        {selectedCountry.code === country.code && (
                          <span className="ml-auto text-[#124C45] flex-shrink-0">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserOpen(!isUserOpen)}
                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg border border-gray-200 hover:border-[#124C45] hover:bg-[#124C45]/5 transition-all duration-200 w-[90px] sm:w-[110px] md:w-[130px] lg:w-[140px] overflow-hidden flex-shrink-0"
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#124C45] to-[#023D4F] rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-700 text-xs sm:text-sm truncate overflow-hidden whitespace-nowrap flex-1 min-w-0">
                      <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                      <span className="sm:hidden">A</span>
                    </span>
                    <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform duration-200 ${isUserOpen ? 'rotate-180' : ''} flex-shrink-0`} />
                  </button>

                  {isUserOpen && (
                    <div className="absolute right-0 mt-2 w-56 sm:w-64 max-w-[90vw] bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          user.role === 'Admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'Admin' ? 'Administrador' : 'Admin Contenido'}
                        </span>
                      </div>
                      
                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-[#124C45]/5 hover:text-[#124C45] transition-colors text-sm"
                      >
                        <BarChart3 className="w-3 h-3" />
                        <span>Dashboard</span>
                      </Link>

                      {user.role === 'Admin' && (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setIsUserOpen(false)}
                            className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-[#124C45]/5 hover:text-[#124C45] transition-colors text-sm"
                          >
                            <Settings className="w-3 h-3" />
                            <span>Panel de Admin</span>
                          </Link>
                          
                          <button
                            onClick={() => {
                              setIsCategoryOrderOpen(true);
                              setIsUserOpen(false);
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-[#124C45]/5 hover:text-[#124C45] transition-colors text-sm"
                          >
                            <ArrowUpDown className="w-3 h-3" />
                            <span>Ordenar Categorías</span>
                          </button>
                        </>
                      )}

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-[#124C45] to-[#023D4F] text-white px-2 sm:px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
                >
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                  <span className="sm:hidden">Login</span>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="xl:hidden flex items-center justify-center px-2 sm:px-3 py-2 rounded-lg border border-gray-200 hover:border-[#124C45] hover:bg-[#124C45]/5 transition-all duration-200"
              >
                {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="xl:hidden border-t border-gray-200 py-2 sm:py-4">
              <div className="space-y-1 sm:space-y-2">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-[#124C45] hover:bg-[#124C45]/5 transition-colors text-sm group"
                >
                  <span className="text-base">🏠</span>
                  <div>
                    <div className="font-medium text-sm">Inicio</div>
                    <div className="text-xs text-gray-500">Página principal</div>
                  </div>
                </Link>
                {orderedCategories.map(category => {
                  const IconComponent = getIconForCategory(category.icon);
                  const categoryContent = getContentByCategory(category.id);
                  return (
                    <Link
                      key={category.id}
                      to={getCategoryUrl(category)}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-[#124C45] hover:bg-[#124C45]/5 transition-colors text-sm group"
                      title={category.name}
                    >
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium block truncate max-w-[180px] group-hover:text-[#124C45]">
                          {category.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          {category.description && (
                            <span className="text-xs text-gray-500 block truncate max-w-[120px]">
                              {category.description}
                            </span>
                          )}
                          <span className="text-xs text-[#124C45] font-medium whitespace-nowrap">
                            {categoryContent.length} contenido{categoryContent.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Category Order Manager Modal */}
      <CategoryOrderManager
        isOpen={isCategoryOrderOpen}
        onClose={() => setIsCategoryOrderOpen(false)}
      />
    </>
  );
}