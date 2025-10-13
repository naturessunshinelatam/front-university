import React, { useState, useEffect } from 'react';
import IconSelector from './IconSelector';
import { 
  X, 
  FolderPlus, 
  Save,
  Plus,
  Trash2,
  Edit,
  Package
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: any) => void;
  editingCategory?: any;
}

export default function CategoryForm({ isOpen, onClose, onSave, editingCategory }: CategoryFormProps) {
  // Aquí inicializo el formulario con los datos existentes si estoy editando
  const [formData, setFormData] = useState({
    name: editingCategory?.name || '',
    description: editingCategory?.description || '',
    sections: editingCategory?.sections || [],
    icon: editingCategory?.icon || 'Package'
  });

  // Aquí actualizo el formulario cuando cambia la categoría a editar
  useEffect(() => {
    if (editingCategory) {
      // Si estoy editando, cargo todos los datos existentes
      setFormData({
        name: editingCategory.name || '',
        description: editingCategory.description || '',
        sections: editingCategory.sections || [],
        icon: editingCategory.icon || 'Package'
      });
    } else {
      // Si estoy creando nueva categoría, limpio el formulario
      setFormData({
        name: '',
        description: '',
        sections: [],
        icon: 'Package'
      });
    }
  }, [editingCategory]);
  const [newSection, setNewSection] = useState({ name: '', description: '' });
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí envío los datos del formulario al componente padre
    const categoryId = editingCategory?.id || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    onSave({
      ...formData,
      id: categoryId,
      sections: formData.sections.length > 0 ? formData.sections : []
    });
    onClose();
  };

  // Renderizar icono dinámicamente
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return <Package className="w-5 h-5" />;
    return <IconComponent className="w-5 h-5" />;
  };
  const handleAddSection = () => {
    if (newSection.name.trim()) {
      // Aquí agrego una nueva sección a la categoría
      setFormData(prev => ({
        ...prev,
        sections: [...prev.sections, {
          id: newSection.name.toLowerCase().replace(/\s+/g, '-'),
          name: newSection.name,
          description: newSection.description
        }]
      }));
      // Aquí limpio el formulario de nueva sección
      setNewSection({ name: '', description: '' });
    }
  };

  const handleEditSection = (index: number) => {
    setEditingSection(index);
    const section = formData.sections[index];
    setNewSection({ name: section.name, description: section.description });
  };

  const handleUpdateSection = () => {
    if (editingSection !== null && newSection.name.trim()) {
      setFormData(prev => ({
        ...prev,
        sections: prev.sections.map((section, index) => 
          index === editingSection 
            ? {
                ...section,
                name: newSection.name,
                description: newSection.description
              }
            : section
        )
      }));
      setEditingSection(null);
      setNewSection({ name: '', description: '' });
    }
  };

  const handleDeleteSection = (index: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta sección?')) {
      setFormData(prev => ({
        ...prev,
        sections: prev.sections.filter((_, i) => i !== index)
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#124C45] to-[#023D4F] text-white p-4 sm:p-6 rounded-t-lg sm:rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <FolderPlus className="w-5 h-5 sm:w-6 sm:h-6" />
              <h2 className="text-lg sm:text-xl font-bold">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Nombre de la Categoría *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent"
                placeholder="Ej: Productos Especiales"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent"
                placeholder="Descripción de la categoría"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Icono de la Categoría
              </label>
              <button
                type="button"
                onClick={() => setIsIconSelectorOpen(true)}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:border-[#124C45] focus:ring-2 focus:ring-[#124C45] focus:border-transparent transition-colors"
              >
                {renderIcon(formData.icon)}
                <span className="text-sm text-gray-700">{formData.icon}</span>
              </button>
            </div>
          </div>

          {/* Sections Management */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Secciones de la Categoría</h3>
            
            {/* Add/Edit Section Form */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Sección
                  </label>
                  <input
                    type="text"
                    value={newSection.name}
                    onChange={(e) => setNewSection(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent"
                    placeholder="Ej: Línea Premium"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Descripción de la Sección
                  </label>
                  <input
                    type="text"
                    value={newSection.description}
                    onChange={(e) => setNewSection(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent"
                    placeholder="Descripción de la sección"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                {editingSection !== null ? (
                  <>
                    <button
                      type="button"
                      onClick={handleUpdateSection}
                      className="flex items-center justify-center space-x-2 bg-[#023D4F] text-white px-4 py-2 text-sm rounded-lg hover:bg-[#01303e] transition-colors"
                    >
                      <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Actualizar Sección</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSection(null);
                        setNewSection({ name: '', description: '' });
                      }}
                      className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="flex items-center justify-center space-x-2 bg-[#124C45] text-white px-4 py-2 text-sm rounded-lg hover:bg-[#0f3d37] transition-colors"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Agregar Sección</span>
                  </button>
                )}
              </div>
            </div>

            {/* Existing Sections */}
            <div className="space-y-2 sm:space-y-3">
              {formData.sections.map((section, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-white border border-gray-200 rounded-lg space-y-2 sm:space-y-0">
                  <div>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">{section.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{section.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleEditSection(index)}
                      className="p-1 text-gray-400 hover:text-[#023D4F] transition-colors"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(index)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 sm:pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
            <div className="text-xs sm:text-sm text-gray-500">
              {formData.sections.length} secciones configuradas
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 sm:px-6 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 text-sm bg-[#124C45] text-white rounded-lg hover:bg-[#0f3d37] transition-colors"
              >
                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{editingCategory ? 'Actualizar' : 'Crear'} Categoría</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Icon Selector Modal */}
      <IconSelector
        isOpen={isIconSelectorOpen}
        onClose={() => setIsIconSelectorOpen(false)}
        onSelectIcon={(iconName) => {
          setFormData(prev => ({ ...prev, icon: iconName }));
          setIsIconSelectorOpen(false);
        }}
        selectedIcon={formData.icon}
      />
    </div>
  );
}