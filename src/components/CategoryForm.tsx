import React, { useState, useEffect } from 'react';
import IconSelector from './IconSelector';
import { useCategories } from '../hooks/useCategories';
import { 
  X, 
  FolderPlus, 
  Save,
  Package
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface Category {
  id: string;
  categoryName: string;
  description: string;
  categoryIcon: string;
}

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingCategory?: Category;
}

export default function CategoryForm({ isOpen, onClose, onSave, editingCategory }: CategoryFormProps) {
  const { createCategory, updateCategory, isLoading } = useCategories();
  
  // Formulario simplificado sin secciones
  const [formData, setFormData] = useState({
    categoryName: '',
    categoryDescription: '',
    categoryIcon: 'Package'
  });

  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Actualizar formulario cuando cambia la categoría a editar
  useEffect(() => {
    if (editingCategory) {
      setFormData({
        categoryName: editingCategory.categoryName || '',
        categoryDescription: editingCategory.description || '',
        categoryIcon: editingCategory.categoryIcon || 'Package'
      });
    } else {
      setFormData({
        categoryName: '',
        categoryDescription: '',
        categoryIcon: 'Package'
      });
    }
    setValidationErrors({});
  }, [editingCategory, isOpen]);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.categoryName.trim()) {
      errors.categoryName = 'El nombre de la categoría es requerido';
    }

    if (!formData.categoryDescription.trim()) {
      errors.categoryDescription = 'La descripción es requerida';
    }

    if (!formData.categoryIcon.trim()) {
      errors.categoryIcon = 'El icono es requerido';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      let success = false;
      
      if (editingCategory) {
        // Actualizar categoría existente
        success = await updateCategory(editingCategory.id, formData);
      } else {
        // Crear nueva categoría
        success = await createCategory(formData);
      }
      
      if (success) {
        onSave();
        onClose();
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  // Renderizar icono dinámicamente
  const renderIcon = (iconName: string) => {
    try {
      const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
      if (!IconComponent) return <Package className="w-5 h-5" />;
      return <IconComponent className="w-5 h-5" />;
    } catch {
      return <Package className="w-5 h-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
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
              disabled={isLoading}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Nombre de la Categoría *
              </label>
              <input
                type="text"
                required
                value={formData.categoryName}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryName: e.target.value }))}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent ${
                  validationErrors.categoryName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: Productos Especiales"
                disabled={isLoading}
              />
              {validationErrors.categoryName && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.categoryName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                required
                value={formData.categoryDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryDescription: e.target.value }))}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent ${
                  validationErrors.categoryDescription ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Descripción de la categoría"
                rows={3}
                disabled={isLoading}
              />
              {validationErrors.categoryDescription && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.categoryDescription}</p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Icono de la Categoría *
              </label>
              <button
                type="button"
                onClick={() => setIsIconSelectorOpen(true)}
                className={`w-full flex items-center justify-center space-x-2 px-3 py-2 border rounded-lg hover:border-[#124C45] focus:ring-2 focus:ring-[#124C45] focus:border-transparent transition-colors ${
                  validationErrors.categoryIcon ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isLoading}
              >
                {renderIcon(formData.categoryIcon)}
                <span className="text-sm text-gray-700">{formData.categoryIcon}</span>
              </button>
              {validationErrors.categoryIcon && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.categoryIcon}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 sm:pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
            <div className="text-xs sm:text-sm text-gray-500">
              * Campos requeridos
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 sm:px-6 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 text-sm bg-[#124C45] text-white rounded-lg hover:bg-[#0f3d37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>
                  {isLoading ? 'Guardando...' : (editingCategory ? 'Actualizar' : 'Crear')} Categoría
                </span>
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
          setFormData(prev => ({ ...prev, categoryIcon: iconName }));
          setIsIconSelectorOpen(false);
        }}
        selectedIcon={formData.categoryIcon}
      />
    </div>
  );
}
