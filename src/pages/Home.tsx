import React from 'react';
import { Link } from 'react-router-dom';
import { useCountry } from '../contexts/CountryContext';
import { usePublicContentAll } from '../hooks/usePublicContentAll';
import { 
  ArrowRight, 
  Package, 
  Wrench,
  Briefcase,
  Tv,
  Building,
  Shield,
  Loader2
} from 'lucide-react';

export default function Home() {
  const { selectedCountry } = useCountry();
  
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
  const getCategoryUrl = (categoryId: string, categoryName: string): string => {
    const slug = createSlug(categoryName);
    return `/content/${slug}`;
  };
  
  // Usar hook de contenido completo (TODO desde API en tiempo real)
  const { 
    content,
    categories,
    sections,
    loading,
    error,
    getContentByCategoryFiltered,
    getCategoriesWithContentFiltered
  } = usePublicContentAll(selectedCountry.code);

  // Obtener solo categorías que tienen contenido en secciones públicas del país
  const availableCategories = getCategoriesWithContentFiltered();
  
  console.log('🏠 Home - País:', selectedCountry.code);
  console.log('🏠 Home - Total contenidos de API:', content.length);
  console.log('🏠 Home - Total categorías de API:', categories.length);
  console.log('🏠 Home - Total secciones de API:', sections.length);
  console.log('🏠 Home - Categorías con contenido:', availableCategories.length);

  // Calcular estadísticas
  const videoContent = content.filter(item => item.contentType.toLowerCase() === 'video').length;
  const fileContent = content.filter(item => item.contentType.toLowerCase() === 'file').length;

  /**
   * Mapea el icono de la categoría al componente de Lucide React
   */
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      'Package': Package,
      'Wrench': Wrench,
      'Briefcase': Briefcase,
      'Tv': Tv,
      'Building': Building
    };
    return iconMap[iconName] || Package;
  };


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#124C45] via-[#023D4F] to-[#124C45] text-white overflow-hidden min-h-screen flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/Fondo_Universidad_S.webp")'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#124C45]/90 via-[#023D4F]/85 to-[#124C45]/90"></div>
        
        {/* Floating particles animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-2 h-2 bg-white/20 rounded-full animate-ping"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-yellow-300/30 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-white/30 rounded-full animate-ping delay-500"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-yellow-200/20 rounded-full animate-pulse delay-2000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-32">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8 animate-fade-in">
              <img 
                src="/Logo_Blanco.png"
                alt="Universidad Sunshine Logo"
                className="h-12 sm:h-16 w-auto mr-2 sm:mr-4 drop-shadow-lg"
              />
              <span className="text-lg sm:text-2xl font-semibold tracking-wide">
                {selectedCountry.flag} Contenido para {selectedCountry.name}
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 sm:mb-8 leading-tight animate-slide-up">
              Bienvenido a
              <span className="block bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 bg-clip-text text-transparent drop-shadow-2xl">
                Universidad Sunshine
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-white/95 mb-8 sm:mb-16 max-w-4xl mx-auto leading-relaxed drop-shadow-lg font-light animate-fade-in-delay">
              Espacio virtual de auto aprendizaje para desarrollar tus habilidades y fortalecer tu conocimiento.
              {loading ? (
                <span className="block mt-4 text-base sm:text-lg opacity-90">
                  <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                  Cargando contenido...
                </span>
              ) : error ? (
                <span className="block mt-4 text-base sm:text-lg opacity-90 text-yellow-200">
                  ⚠️ Error al cargar contenido
                </span>
              ) : (
                <span className="block mt-4 text-base sm:text-lg opacity-90">
                  {content.length} contenidos disponibles • {videoContent} videos • {fileContent} documentos
                </span>
              )}
            </p>
            
            {/* Category Buttons */}
            {!loading && availableCategories.length > 0 && (
              <div className="mt-8 sm:mt-16 animate-fade-in-slow">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto px-4">
                  {availableCategories.slice(0, 4).map((category) => {
                    const IconComponent = getIconComponent(category.categoryIcon);
                    const categoryContent = getContentByCategoryFiltered(category.id);
                    
                    return (
                      <Link
                        key={category.id}
                        to={getCategoryUrl(category.id, category.categoryName)}
                        className="group glass border border-white/30 text-white px-3 sm:px-4 py-4 sm:py-5 rounded-xl font-bold text-sm sm:text-base hover:bg-white hover:text-[#124C45] hover:shadow-2xl hover:border-white/50 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 shadow-xl relative overflow-hidden"
                      >
                        <span className="relative flex flex-col items-center justify-center space-y-1 sm:space-y-2">
                          <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                          <span className="text-center leading-tight drop-shadow-md transition-colors duration-300">{category.categoryName}</span>
                          <span className="text-xs opacity-75 group-hover:opacity-100 transition-opacity duration-300">
                            {categoryContent.length} contenidos
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quality Standards Section */}
      <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-16 sm:h-32 bg-gradient-to-b from-gray-50/50 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-8 leading-tight">
              Más De 50 Años Cumpliendo<br />
              Estándares Internacionales De Calidad
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                title: "CALIDAD RESPALDADA",
                description: "Garantía de calidad en el producto",
                image: "https://mx.naturessunshinelatam.com//configuracion/images/seccion1_1.jpeg"
              },
              {
                title: "COMPROMISO SOSTENIBLE",
                description: "Planta de producción 100% solar",
                image: "https://mx.naturessunshinelatam.com//configuracion/images/seccion1_2.jpeg"
              },
              {
                title: "RIGOR CIENTÍFICO",
                description: "Más de 600 pruebas en la creación de cada producto",
                image: "https://mx.naturessunshinelatam.com//configuracion/images/seccion1_3.jpeg"
              },
              {
                title: "OPORTUNIDAD ÚNICA",
                description: "Crea tu propio negocio compartiendo salud natural",
                image: "https://mx.naturessunshinelatam.com//configuracion/images/seccion1_4.jpeg"
              }
            ].map((item, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-[#124C45]/20"
              >
                <div className="h-48 bg-gray-100 overflow-hidden">
                  <img 
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback en caso de que la imagen no cargue
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-[#124C45]/10 to-[#023D4F]/10 flex items-center justify-center">
                            <div class="w-16 h-16 bg-gradient-to-r from-[#124C45] to-[#023D4F] rounded-full flex items-center justify-center">
                              <span class="text-2xl text-white">
                                ${index === 0 ? '🏆' : index === 1 ? '🌱' : index === 2 ? '🔬' : '💼'}
                              </span>
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-[#124C45] mb-2 sm:mb-3 group-hover:text-[#0f3d37] transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-[#023D4F] to-[#124C45] rounded-full mb-4 sm:mb-6 shadow-lg">
              <img 
                src="/Logo_Blanco.png"
                alt="Universidad Sunshine"
                className="w-8 sm:w-10 h-8 sm:h-10 object-contain"
              />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
              Explora Nuestro Contenido
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light px-4 mb-8">
              Selecciona una categoría para explorar todo el contenido disponible
            </p>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-[#124C45] animate-spin mb-4" />
              <p className="text-gray-600 text-lg">Cargando contenido para {selectedCountry.name}...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                <p className="text-red-800 text-center">
                  ⚠️ Error al cargar contenido: {error}
                </p>
              </div>
            </div>
          )}

          {/* No Content State */}
          {!loading && !error && availableCategories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
                <p className="text-yellow-800 text-center">
                  No hay contenido disponible para {selectedCountry.name} en este momento.
                </p>
              </div>
            </div>
          )}

          {/* Grid de Categorías */}
          {!loading && !error && availableCategories.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {availableCategories.map((category) => {
                const IconComponent = getIconComponent(category.categoryIcon);
                const categoryContent = getContentByCategoryFiltered(category.id);
                
                return (
                  <div
                    key={category.id}
                    className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-[#124C45]/30 overflow-hidden relative min-h-[280px] flex flex-col"
                  >
                  {/* Background decorativo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#124C45]/5 via-transparent to-[#023D4F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Icono flotante */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-r from-[#124C45]/10 to-[#023D4F]/10 rounded-full opacity-20 group-hover:scale-125 transition-transform duration-500"></div>
                  
                  {/* Contenido de la tarjeta */}
                  <div className="relative flex flex-col h-full">
                    {/* Icono principal */}
                    <div className="w-16 h-16 bg-gradient-to-r from-[#124C45] to-[#023D4F] rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg mb-4">
                      <IconComponent className="w-8 h-8 text-white" />
                      
                      {/* Efecto glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#124C45] to-[#023D4F] rounded-xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300"></div>
                    </div>
                    
                    {/* Título y descripción */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#124C45] transition-colors duration-300 line-clamp-2">
                        {category.categoryName}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {category.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {categoryContent.length} contenido{categoryContent.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    {/* Botón de acción */}
                    <Link
                      to={getCategoryUrl(category.id, category.categoryName)}
                      className="mt-auto inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-[#124C45] to-[#023D4F] text-white text-sm font-medium rounded-lg hover:from-[#0f3d37] hover:to-[#01303e] transition-all duration-300 group-hover:shadow-lg"
                    >
                      <span>Explorar</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-32 sm:w-64 h-32 sm:h-64 bg-[#124C45]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-48 sm:w-96 h-48 sm:h-96 bg-[#023D4F]/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-[#124C45] to-[#023D4F] rounded-full mb-6 sm:mb-8 shadow-xl">
            <img 
              src="/Logo_Blanco.png"
              alt="Universidad Sunshine"
              className="w-10 sm:w-12 h-10 sm:h-12 object-contain"
            />
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
            ¿Listo para Aprender?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-12 sm:mb-16 leading-relaxed font-light px-4">
            Accede al conocimiento y recursos educativos de Nature's Sunshine diseñados especialmente para afiliados en {selectedCountry.name}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 justify-center px-4 max-w-6xl mx-auto">
            {/* Acceso Administrativo - Botón destacado */}
            <div className="flex justify-center">
              <Link
                to="/login"
                className="group bg-[#124C45] text-white px-8 py-6 rounded-3xl font-semibold text-lg hover:bg-[#0f3d37] hover:shadow-2xl transition-all duration-300 transform hover:scale-105 min-w-[200px] flex flex-col items-center space-y-2"
              >
                <Shield className="w-5 h-5" />
                <span className="text-center leading-tight">
                  Acceso<br />Administrativo
                </span>
              </Link>
            </div>
            
            {/* Categorías - Botones con borde */}
            {!loading && availableCategories.slice(0, 4).map((category) => {
              const IconComponent = getIconComponent(category.categoryIcon);
              const categoryContent = getContentByCategoryFiltered(category.id);
              
              return (
                <div key={category.id} className="flex justify-center">
                  <Link
                    to={getCategoryUrl(category.id, category.categoryName)}
                    className="group bg-white border-2 border-gray-200 text-[#124C45] px-8 py-6 rounded-3xl font-semibold text-lg hover:border-[#124C45] hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[200px] flex flex-col items-center space-y-2"
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-center leading-tight text-[#124C45] group-hover:text-[#0f3d37]">
                      {category.categoryName === 'Herramientas comerciales' ? (
                        <>Herramientas<br />comerciales</>
                      ) : (
                        category.categoryName
                      )}
                    </span>
                    <span className="text-xs opacity-75 group-hover:opacity-100 transition-opacity duration-300">
                      {categoryContent.length} contenidos
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}