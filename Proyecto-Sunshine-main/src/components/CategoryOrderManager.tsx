import React, { useState } from 'react';
import { useContentData } from '../hooks/useContentData';
import { useAlert } from './AlertSystem';
import { 
  X, 
  Save,
  RotateCcw,
  Package,
  Building,
  GraduationCap,
  Zap,
} from 'lucide-react';

interface CategoryOrderManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryOrderManager({ isOpen, onClose }: CategoryOrderManagerProps) {
  const { categories, categoryOrder, updateCategoryOrder } = useContentData();
  const { showAlert } = useAlert();
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Initialize ordered categories
  const getOrderedCategories = () => {
    if (!categoryOrder || categoryOrder.length === 0) {
      return categories;
    }
    
    const ordered = [];
    categoryOrder.forEach(categoryId => {
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        ordered.push(category);
      }
    });
    
    // Add any remaining categories not in order
    categories.forEach(category => {
      if (!categoryOrder.includes(category.id)) {
        ordered.push(category);
      }
    });
    
    return ordered;
  };

  const [orderedCategories, setOrderedCategories] = useState(() => getOrderedCategories());

  // Update ordered categories when categories change
  React.useEffect(() => {
    setOrderedCategories(getOrderedCategories());
  }, [categories, categoryOrder]);

  const getIconForCategory = (categoryId: string) => {
    const iconMap: { [key: string]: any } = {
      productos: Package,
      compania: Building,
      escuela: GraduationCap,
      shorts: Zap
    };
    return iconMap[categoryId] || Package;
  };

  const handleDragStart = (e: React.DragEvent, category: any, index: number) => {
    setDraggedItem(category);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', category.id);
    
    // Add drag styling
    const target = e.target as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the container entirely
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    if (!draggedItem) {
      return;
    }

    const draggedIndex = orderedCategories.findIndex(cat => cat.id === draggedItem.id);
    
    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDraggedItem(null);
      return;
    }

    const newOrder = [...orderedCategories];
    const itemToMove = newOrder[draggedIndex];
    
    // Remove dragged item
    newOrder.splice(draggedIndex, 1);
    
    // Insert at new position
    const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newOrder.splice(adjustedDropIndex, 0, itemToMove);
    
    setOrderedCategories(newOrder);
    setDraggedItem(null);
    
    // Reset opacity
    const draggedElement = document.querySelector('[data-dragging="true"]') as HTMLElement;
    if (draggedElement) {
      draggedElement.style.opacity = '1';
      draggedElement.removeAttribute('data-dragging');
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
    
    // Reset all drag styling
    const draggedElements = document.querySelectorAll('[data-dragging="true"]');
    draggedElements.forEach(el => {
      (el as HTMLElement).style.opacity = '1';
      el.removeAttribute('data-dragging');
    });
  };

  const handleSave = () => {
    const newOrder = orderedCategories.map(cat => cat.id);
    updateCategoryOrder(newOrder);
    
    showAlert({
      type: 'success',
      title: 'Orden Actualizado',
      message: 'El orden de las categorías ha sido actualizado exitosamente. Los cambios son visibles inmediatamente en la navegación.'
    });
    
    onClose();
  };

  const handleReset = () => {
    const defaultOrder = categories.map(cat => cat.id);
    setOrderedCategories(categories);
    
    showAlert({
      type: 'info',
      title: 'Orden Restablecido',
      message: 'El orden de las categorías ha sido restablecido al orden por defecto.'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#124C45] to-[#023D4F] text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                <span className="text-sm font-bold">⋮⋮</span>
              </div>
              <h2 className="text-xl font-bold">Orden de Categorías</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-white/90 mt-2">
            <strong>Arrastra y suelta</strong> las categorías para cambiar su orden de aparición en la navegación. 
            Las primeras 4 se mostrarán directamente, el resto en el menú "Más".
          </p>
        </div>

        {/* Category List */}
        <div className="p-6">
          <div className="space-y-3">
            {orderedCategories.map((category, index) => {
              const IconComponent = getIconForCategory(category.id);
              const isVisible = index < 4;
              const isDragging = draggedItem?.id === category.id;
              const isDragOver = dragOverIndex === index;
              
              return (
                <div
                  key={category.id}
                  draggable
                  onDragStart={(e) => {
                    handleDragStart(e, category, index);
                    (e.target as HTMLElement).setAttribute('data-dragging', 'true');
                  }}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-all duration-200 cursor-grab active:cursor-grabbing ${
                    isVisible 
                      ? 'border-[#124C45] bg-[#124C45]/5' 
                      : 'border-gray-200 bg-gray-50'
                  } ${isDragging ? 'opacity-50 scale-95 rotate-2' : 'hover:shadow-md'} ${
                    isDragOver ? 'border-blue-400 bg-blue-50 scale-105' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 cursor-grab active:cursor-grabbing">
                      <div className="w-6 h-6 flex flex-col items-center justify-center space-y-0.5">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isVisible 
                        ? 'bg-gradient-to-r from-[#124C45] to-[#023D4F] text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        Posición {index + 1}
                      </div>
                      <div className={`text-xs ${
                        isVisible ? 'text-[#124C45] font-medium' : 'text-gray-500'
                      }`}>
                        {isVisible ? 'Visible' : 'En menú "Más"'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">ℹ️ Información sobre la visualización</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Las primeras <strong>4 categorías</strong> se muestran directamente en la navegación</li>
              <li>• Las categorías restantes aparecen en el menú desplegable <strong>"Más"</strong></li>
              <li>• <strong>🖱️ Arrastra y suelta</strong> las categorías para cambiar su orden</li>
              <li>• El orden se aplica inmediatamente al guardar los cambios</li>
              <li>• En dispositivos móviles, todas las categorías se muestran en el menú hamburguesa</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restablecer Orden</span>
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-2 bg-[#124C45] text-white rounded-lg hover:bg-[#0f3d37] transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Orden</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}