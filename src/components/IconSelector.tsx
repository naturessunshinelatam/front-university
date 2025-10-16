import React, { useState } from 'react';
import { Search, X, Package } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import * as ReactIcons from 'react-icons/all';

// Iconos más populares de Lucide React organizados por categorías
const LUCIDE_ICONS = {
  'Negocios': [
    'Package', 'Building', 'Briefcase', 'TrendingUp', 'BarChart3', 'PieChart',
    'Target', 'Award', 'Trophy', 'Star', 'Crown', 'Gem'
  ],
  'Educación': [
    'GraduationCap', 'BookOpen', 'Book', 'Library', 'School', 'Users',
    'UserCheck', 'Brain', 'Lightbulb', 'Zap'
  ],
  'Salud': [
    'Heart', 'Activity', 'Stethoscope', 'Pill', 'Shield', 'ShieldCheck',
    'Leaf', 'Flower', 'Sun', 'Moon'
  ],
  'Tecnología': [
    'Smartphone', 'Monitor', 'Laptop', 'Tablet', 'Wifi', 'Globe',
    'Database', 'Server', 'Cloud', 'Settings'
  ],
  'Comunicación': [
    'MessageCircle', 'Mail', 'Phone', 'Video', 'Mic', 'Speaker',
    'Headphones', 'Radio', 'Tv', 'Camera'
  ],
  'Transporte': [
    'Car', 'Truck', 'Plane', 'Ship', 'Train', 'Bike',
    'Bus', 'Taxi', 'Rocket', 'MapPin'
  ],
  'Comida': [
    'Coffee', 'Pizza', 'Apple', 'Cherry', 'Grape', 'Banana',
    'Carrot', 'Fish', 'Beef', 'Egg'
  ],
  'Herramientas': [
    'Wrench', 'Hammer', 'Screwdriver', 'Scissors', 'Ruler', 'Compass',
    'Calculator', 'Clipboard', 'FileText', 'Folder'
  ]
};

interface IconSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string) => void;
  selectedIcon?: string;
}

export default function IconSelector({ isOpen, onClose, onSelectIcon, selectedIcon }: IconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Negocios');

  if (!isOpen) return null;

  // Filtrar iconos por búsqueda
  const getFilteredIcons = () => {
    const categoryIcons = LUCIDE_ICONS[selectedCategory as keyof typeof LUCIDE_ICONS] || [];
    
    if (!searchTerm) return categoryIcons;
    
    return categoryIcons.filter(iconName => 
      iconName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredIcons = getFilteredIcons();

  // Renderizar icono dinámicamente
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return null;
    
    return <IconComponent className="w-6 h-6" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#124C45] to-[#023D4F] text-white p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-3 h-3 sm:w-5 sm:h-5" />
              </div>
              <h2 className="text-base sm:text-xl font-bold truncate">Seleccionar Icono</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row h-[500px] sm:h-[600px]">
          {/* Sidebar - Categorías */}
          <div className="w-full sm:w-48 bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-200 overflow-y-auto max-h-[120px] sm:max-h-none">
            <div className="p-2 sm:p-4">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Categorías</h3>
              <div className="flex flex-wrap sm:flex-col gap-1 sm:space-y-1 sm:gap-0">
                {Object.keys(LUCIDE_ICONS).map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap sm:w-full sm:text-left ${
                      selectedCategory === category
                        ? 'bg-[#124C45] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Search */}
            <div className="p-2 sm:p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar iconos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent"
                />
              </div>
            </div>

            {/* Icons Grid */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3">
                {filteredIcons.map(iconName => (
                  <button
                    key={iconName}
                    onClick={() => onSelectIcon(iconName)}
                    className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md group ${
                      selectedIcon === iconName
                        ? 'border-[#124C45] bg-[#124C45]/10'
                        : 'border-gray-200 hover:border-[#124C45]/50'
                    }`}
                    title={iconName}
                  >
                    <div className={`flex items-center justify-center ${
                      selectedIcon === iconName ? 'text-[#124C45]' : 'text-gray-600 group-hover:text-[#124C45]'
                    }`}>
                      {renderIcon(iconName)}
                    </div>
                  </button>
                ))}
              </div>

              {filteredIcons.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No se encontraron iconos</h3>
                  <p className="text-sm sm:text-base text-gray-500">Intenta con otro término de búsqueda</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs sm:text-sm text-gray-500 flex-1 min-w-0">
              {selectedIcon && (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span>Seleccionado:</span>
                  <div className="flex items-center space-x-1 px-2 py-1 bg-white rounded border max-w-[120px] sm:max-w-none">
                    {renderIcon(selectedIcon)}
                    <span className="font-medium text-xs sm:text-sm truncate">{selectedIcon}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex space-x-2 sm:space-x-3 flex-shrink-0">
              <button
                onClick={onClose}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (selectedIcon) {
                    onSelectIcon(selectedIcon);
                  }
                  onClose();
                }}
                disabled={!selectedIcon}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-[#124C45] text-white rounded-lg hover:bg-[#0f3d37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Seleccionar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}