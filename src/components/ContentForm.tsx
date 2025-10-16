import React, { useState, useEffect } from 'react';
import { useCountry } from '../contexts/CountryContext';
import { useAlert } from './AlertSystem';
import { useContent } from '../hooks/useContent';
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  FileText, 
  Video, 
  Youtube,
  Save,
  Globe,
  Calendar,
  Clock,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';

interface ContentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingContent?: any;
  categories: any[];
}

export default function ContentForm({ isOpen, onClose, onSave, editingContent, categories }: ContentFormProps) {
  const { availableCountries } = useCountry();
  const { showAlert } = useAlert();
  const { createContent, updateContent, uploadFile, uploadProgress } = useContent();
  
  const [formData, setFormData] = useState({
    contentTitle: '',
    description: '',
    categoryId: '',
    sectionId: '',
    subsection: '',
    contentType: 'Video' as 'Video' | 'File' | 'Image',
    contentUrl: '',
    size: '',
    author: '',
    availableCountries: [] as string[],
    contentStatus: 'Draft' as 'Published' | 'Draft',
    publishedAt: new Date().toISOString(),
    expiresAt: ''
  });

  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingContent) {
      setFormData({
        contentTitle: editingContent.contentTitle || '',
        description: editingContent.description || '',
        categoryId: editingContent.categoryId || '',
        sectionId: editingContent.sectionId || '',
        subsection: editingContent.subsection || '',
        contentType: editingContent.contentType || 'Video',
        contentUrl: editingContent.contentUrl || '',
        size: editingContent.size || '',
        author: editingContent.author || '',
        availableCountries: editingContent.availableCountries || [],
        contentStatus: editingContent.status || 'Draft',
        publishedAt: editingContent.publishedAt || new Date().toISOString(),
        expiresAt: editingContent.expiresAt || ''
      });
      setUploadMode('url');
    } else {
      resetForm();
    }
  }, [editingContent, isOpen]);

  const resetForm = () => {
    const defaultCategory = categories[0]?.id || '';
    const defaultSection = categories[0]?.sections?.[0]?.id || '';
    
    setFormData({
      contentTitle: '',
      description: '',
      categoryId: defaultCategory,
      sectionId: defaultSection,
      subsection: '',
      contentType: 'Video',
      contentUrl: '',
      size: '',
      author: 'Universidad Sunshine', // Valor por defecto
      availableCountries: [],
      contentStatus: 'Draft',
      publishedAt: new Date().toISOString(),
      expiresAt: ''
    });
    setSelectedFile(null);
    setUploadMode('url');
  };

  const getCurrentSections = () => {
    const category = categories.find(cat => cat.id === formData.categoryId);
    return category ? category.sections : [];
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño del archivo (20MB máximo)
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB en bytes
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      showAlert({
        type: 'error',
        title: '❌ Archivo Demasiado Grande',
        message: `El archivo seleccionado (${fileSizeMB} MB) excede el límite máximo de 20 MB. Por favor, selecciona un archivo más pequeño.`
      });
      // Limpiar el input
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);

    try {
      let uploadType: 'image' | 'file' | 'video';
      if (formData.contentType === 'Image') {
        uploadType = 'image';
      } else if (formData.contentType === 'File') {
        uploadType = 'file';
      } else {
        uploadType = 'video';
      }

      const publicUrl = await uploadFile(file, uploadType);
      
      if (publicUrl) {
        setFormData(prev => ({ ...prev, contentUrl: publicUrl }));
        showAlert({
          type: 'success',
          title: '✅ Archivo Subido',
          message: 'El archivo se ha subido exitosamente a Hostinger.'
        });
      } else {
        showAlert({
          type: 'error',
          title: '❌ Error al Subir',
          message: 'No se pudo subir el archivo. Inténtalo de nuevo.'
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showAlert({
        type: 'error',
        title: '❌ Error',
        message: 'Ocurrió un error al subir el archivo.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCountryToggle = (countryCode: string) => {
    setFormData(prev => ({
      ...prev,
      availableCountries: prev.availableCountries.includes(countryCode)
        ? prev.availableCountries.filter(c => c !== countryCode)
        : [...prev.availableCountries, countryCode]
    }));
  };

  const handleSelectAllCountries = () => {
    setFormData(prev => ({
      ...prev,
      availableCountries: prev.availableCountries.length === availableCountries.length 
        ? [] 
        : availableCountries.map(c => c.code)
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.contentTitle.trim()) errors.push('El título es obligatorio');
    if (!formData.categoryId) errors.push('Debe seleccionar una categoría');
    if (!formData.sectionId) errors.push('Debe seleccionar una sección');
    if (!formData.contentUrl.trim()) errors.push('La URL del contenido es obligatoria');
    if (formData.availableCountries.length === 0) errors.push('Debe seleccionar al menos un país');
    
    if (formData.expiresAt) {
      const publishDate = new Date(formData.publishedAt);
      const expiresDate = new Date(formData.expiresAt);
      if (expiresDate <= publishDate) {
        errors.push('La fecha de expiración debe ser posterior a la fecha de publicación');
      }
    }
    
    if (errors.length > 0) {
      showAlert({
        type: 'error',
        title: 'Campos Requeridos Faltantes',
        message: errors.join('. ')
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let success = false;
      
      // Si no hay fecha de expiración, establecer una fecha muy lejana (100 años en el futuro)
      const dataToSend = {
        ...formData,
        expiresAt: formData.expiresAt || new Date(new Date().setFullYear(new Date().getFullYear() + 100)).toISOString()
      };
      
      if (editingContent) {
        success = await updateContent(editingContent.id, dataToSend);
      } else {
        success = await createContent(dataToSend);
      }

      if (success) {
        showAlert({
          type: 'success',
          title: editingContent ? '✅ Contenido Actualizado' : '✅ Contenido Creado',
          message: editingContent 
            ? 'El contenido ha sido actualizado exitosamente.'
            : 'El contenido ha sido creado exitosamente.'
        });
        onSave();
        onClose();
        if (!editingContent) resetForm();
      }
    } catch (error) {
      console.error('Error al guardar contenido:', error);
      showAlert({
        type: 'error',
        title: '❌ Error',
        message: 'Ocurrió un error al guardar el contenido.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#124C45] to-[#023D4F] text-white p-4 sm:p-6 rounded-t-lg sm:rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
              <h2 className="text-lg sm:text-xl font-bold">
                {editingContent ? 'Editar Contenido' : 'Agregar Nuevo Contenido'}
              </h2>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors" disabled={isSubmitting || isUploading}>
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Título del Contenido *</label>
              <input type="text" required value={formData.contentTitle} onChange={(e) => setFormData(prev => ({ ...prev, contentTitle: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent" placeholder="Ej: Guía Completa Desintoxicación" disabled={isSubmitting || isUploading} />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Autor</label>
              <input type="text" value={formData.author} onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent" placeholder="Ej: Dr. Ana Martínez" disabled={isSubmitting || isUploading} />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent resize-none" placeholder="Descripción del contenido..." disabled={isSubmitting || isUploading} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Categoría *</label>
              <select required value={formData.categoryId} onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value, sectionId: '' }))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent" disabled={isSubmitting || isUploading}>
                <option value="">Seleccionar categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Sección *</label>
              <select required value={formData.sectionId} onChange={(e) => setFormData(prev => ({ ...prev, sectionId: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent" disabled={isSubmitting || isUploading}>
                <option value="">Seleccionar sección</option>
                {getCurrentSections().map((section: any) => (
                  <option key={section.id} value={section.id}>{section.sectionName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Subsección (Opcional)</label>
              <input type="text" value={formData.subsection} onChange={(e) => setFormData(prev => ({ ...prev, subsection: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent" placeholder="Ej: Productos por País" disabled={isSubmitting || isUploading} />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">Tipo de Contenido *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              <button type="button" onClick={() => { setFormData(prev => ({ ...prev, contentType: 'Video' })); setUploadMode('url'); }} className={`flex items-center space-x-2 p-3 border rounded-lg transition-colors ${formData.contentType === 'Video' && uploadMode === 'url' ? 'border-[#124C45] bg-[#124C45] text-white' : 'border-gray-300 hover:border-[#124C45] hover:bg-gray-50'}`} disabled={isSubmitting || isUploading}>
                <Youtube className="w-4 h-4" />
                <span className="text-sm">YouTube</span>
              </button>
              <button type="button" onClick={() => { setFormData(prev => ({ ...prev, contentType: 'File' })); }} className={`flex items-center space-x-2 p-3 border rounded-lg transition-colors ${formData.contentType === 'File' ? 'border-[#124C45] bg-[#124C45] text-white' : 'border-gray-300 hover:border-[#124C45] hover:bg-gray-50'}`} disabled={isSubmitting || isUploading}>
                <FileText className="w-4 h-4" />
                <span className="text-sm">PDF</span>
              </button>
              <button type="button" onClick={() => { setFormData(prev => ({ ...prev, contentType: 'Image' })); }} className={`flex items-center space-x-2 p-3 border rounded-lg transition-colors ${formData.contentType === 'Image' ? 'border-[#124C45] bg-[#124C45] text-white' : 'border-gray-300 hover:border-[#124C45] hover:bg-gray-50'}`} disabled={isSubmitting || isUploading}>
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm">Imagen</span>
              </button>
            </div>
          </div>

          {formData.contentType !== 'Video' || uploadMode !== 'url' ? (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">Método de Carga</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => { setUploadMode('file'); setFormData(prev => ({ ...prev, contentUrl: '' })); setSelectedFile(null); }} className={`flex items-center justify-center space-x-2 p-3 border rounded-lg transition-colors ${uploadMode === 'file' ? 'border-[#124C45] bg-[#124C45] text-white' : 'border-gray-300 hover:border-[#124C45] hover:bg-gray-50'}`} disabled={isSubmitting || isUploading}>
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Subir Archivo</span>
                </button>
                <button type="button" onClick={() => { setUploadMode('url'); setFormData(prev => ({ ...prev, contentUrl: '' })); setSelectedFile(null); }} className={`flex items-center justify-center space-x-2 p-3 border rounded-lg transition-colors ${uploadMode === 'url' ? 'border-[#124C45] bg-[#124C45] text-white' : 'border-gray-300 hover:border-[#124C45] hover:bg-gray-50'}`} disabled={isSubmitting || isUploading}>
                  <LinkIcon className="w-4 h-4" />
                  <span className="text-sm">Enlace Externo</span>
                </button>
              </div>
            </div>
          ) : null}

          {uploadMode === 'file' ? (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Seleccionar Archivo *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#124C45] transition-colors">
                <input type="file" onChange={handleFileSelect} accept={formData.contentType === 'Image' ? 'image/*' : formData.contentType === 'File' ? '.pdf' : 'video/*'} className="hidden" id="file-upload" disabled={isSubmitting || isUploading} />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {isUploading ? (
                    <div className="space-y-2">
                      <Loader2 className="w-12 h-12 mx-auto text-[#124C45] animate-spin" />
                      <p className="text-sm text-gray-600">Subiendo archivo... {uploadProgress}%</p>
                    </div>
                  ) : selectedFile ? (
                    <div className="space-y-2">
                      <FileText className="w-12 h-12 mx-auto text-green-600" />
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <p className="text-xs text-gray-500">Click para cambiar archivo</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-600">Click para seleccionar archivo</p>
                      <p className="text-xs text-gray-500">{formData.contentType === 'Image' ? 'PNG, JPG, GIF' : formData.contentType === 'File' ? 'PDF' : 'MP4, AVI, MOV'}</p>
                      <p className="text-xs text-blue-600 font-medium mt-1">Tamaño máximo: 20 MB</p>
                    </div>
                  )}
                </label>
              </div>
              {formData.contentUrl && (
                <p className="text-xs text-green-600 mt-2">✅ Archivo subido: {formData.contentUrl}</p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">URL del Contenido *</label>
              <input type="url" required value={formData.contentUrl} onChange={(e) => setFormData(prev => ({ ...prev, contentUrl: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent" placeholder={formData.contentType === 'Video' ? 'https://youtube.com/watch?v=...' : formData.contentType === 'File' ? 'https://ejemplo.com/archivo.pdf' : 'https://ejemplo.com/imagen.jpg'} disabled={isSubmitting || isUploading} />
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">{formData.contentType === 'Video' ? 'Duración' : 'Tamaño'}</label>
            <input type="text" value={formData.size} onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent" placeholder={formData.contentType === 'Video' ? '12:30' : '2.4 MB'} disabled={isSubmitting || isUploading} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                Fecha de Publicación *
              </label>
              <input 
                type="datetime-local" 
                required 
                value={formData.publishedAt.slice(0, 16)} 
                onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: new Date(e.target.value).toISOString() }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent" 
                disabled={isSubmitting || isUploading}
              />
              <p className="text-xs text-gray-500 mt-1">Selecciona fecha, hora y minutos. Toca fuera para cerrar.</p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                Fecha de Expiración (Opcional)
              </label>
              <input 
                type="datetime-local" 
                value={formData.expiresAt ? formData.expiresAt.slice(0, 16) : ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent" 
                disabled={isSubmitting || isUploading}
              />
              <p className="text-xs text-gray-500 mt-1">Opcional - Deja vacío para que no expire. Toca fuera para cerrar.</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                Países donde se mostrará *
              </label>
              <button type="button" onClick={handleSelectAllCountries} className="text-xs sm:text-sm text-[#124C45] hover:text-[#0f3d37] font-medium" disabled={isSubmitting || isUploading}>
                {formData.availableCountries.length === availableCountries.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg bg-gray-50">
              {availableCountries.map(country => (
                <label key={country.code} className="flex items-center space-x-1 sm:space-x-2 cursor-pointer">
                  <input type="checkbox" checked={formData.availableCountries.includes(country.code)} onChange={() => handleCountryToggle(country.code)} className="rounded border-gray-300 text-[#124C45] focus:ring-[#124C45]" disabled={isSubmitting || isUploading} />
                  <span className="text-xs sm:text-sm flex items-center space-x-1">
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </span>
                </label>
              ))}
            </div>
            {formData.availableCountries.length === 0 && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">Debe seleccionar al menos un país</p>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Estado de Publicación</label>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="contentStatus" value="Draft" checked={formData.contentStatus === 'Draft'} onChange={(e) => setFormData(prev => ({ ...prev, contentStatus: e.target.value as 'Draft' }))} className="text-[#124C45] focus:ring-[#124C45]" disabled={isSubmitting || isUploading} />
                <span className="text-sm">Borrador</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="contentStatus" value="Published" checked={formData.contentStatus === 'Published'} onChange={(e) => setFormData(prev => ({ ...prev, contentStatus: e.target.value as 'Published' }))} className="text-[#124C45] focus:ring-[#124C45]" disabled={isSubmitting || isUploading} />
                <span className="text-sm">Publicado</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 sm:pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
              <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{formData.availableCountries.length} países seleccionados</span>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button type="button" onClick={onClose} className="px-4 sm:px-6 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" disabled={isSubmitting || isUploading}>
                Cancelar
              </button>
              <button type="submit" disabled={formData.availableCountries.length === 0 || isSubmitting || isUploading} className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 text-sm bg-[#124C45] text-white rounded-lg hover:bg-[#0f3d37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{editingContent ? 'Actualizar' : 'Guardar'} Contenido</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
