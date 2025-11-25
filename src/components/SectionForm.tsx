import React, { useState, useEffect } from "react";
import { useSections } from "../hooks/useSections";
import { X, FolderPlus, Save, Globe } from "lucide-react";
import SectionContentsOrderModal from "./SectionContentsOrderModal";

interface Section {
  id: string;
  categoryId: string;
  sectionName: string;
  sectionDescription: string;
  countries: string[];
}

interface SectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingSection?: Section | null;
  categoryId: string;
}

const AVAILABLE_COUNTRIES = [
  { code: "MX", name: "México", flag: "🇲🇽" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "HN", name: "Honduras", flag: "🇭🇳" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "DO", name: "Rep. Dominicana", flag: "🇩🇴" },
  { code: "PA", name: "Panamá", flag: "🇵🇦" },
];

export default function SectionForm({
  isOpen,
  onClose,
  onSave,
  editingSection,
  categoryId,
}: SectionFormProps) {
  const { createSection, updateSection, isLoading } = useSections();

  const [formData, setFormData] = useState({
    sectionName: "",
    description: "",
    countries: [] as string[],
  });

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Actualizar formulario cuando cambia la sección a editar
  useEffect(() => {
    if (editingSection) {
      setFormData({
        sectionName: editingSection.sectionName || "",
        description: editingSection.sectionDescription || "",
        countries: editingSection.countries || [],
      });
    } else {
      setFormData({
        sectionName: "",
        description: "",
        countries: [],
      });
    }
    setValidationErrors({});
  }, [editingSection, isOpen]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.sectionName.trim()) {
      errors.sectionName = "El nombre de la sección es requerido";
    }

    if (!formData.description.trim()) {
      errors.description = "La descripción es requerida";
    }

    if (formData.countries.length === 0) {
      errors.countries = "Debe seleccionar al menos un país";
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

      if (editingSection) {
        // Actualizar sección existente
        success = await updateSection(editingSection.id, formData);
      } else {
        // Crear nueva sección
        success = await createSection({
          categoryId,
          ...formData,
        });
      }

      if (success) {
        onSave();
        onClose();
      }
    } catch (error) {
      console.error("Error al guardar sección:", error);
    }
  };

  const handleCountryToggle = (countryCode: string) => {
    setFormData((prev) => ({
      ...prev,
      countries: prev.countries.includes(countryCode)
        ? prev.countries.filter((c) => c !== countryCode)
        : [...prev.countries, countryCode],
    }));
  };

  const handleSelectAllCountries = () => {
    setFormData((prev) => ({
      ...prev,
      countries:
        prev.countries.length === AVAILABLE_COUNTRIES.length
          ? []
          : AVAILABLE_COUNTRIES.map((c) => c.code),
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#124C45] to-[#023D4F] text-white p-4 sm:p-6 rounded-t-lg sm:rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <FolderPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                <h2 className="text-lg sm:text-xl font-bold">
                  {editingSection ? "Editar Sección" : "Nueva Sección"}
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
          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 space-y-4 sm:space-y-6"
          >
            {/* Nombre de la Sección */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                <FolderPlus className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                Nombre de la Sección *
              </label>
              <input
                type="text"
                required
                value={formData.sectionName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sectionName: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent"
                placeholder="Ej: Entrenamientos Grabados"
                disabled={isLoading}
              />
              {validationErrors.sectionName && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.sectionName}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent resize-none"
                placeholder="Describe el contenido de esta sección..."
                disabled={isLoading}
              />
              {validationErrors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.description}
                </p>
              )}
            </div>

            {/* Países Disponibles */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                  Países Asignados *
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllCountries}
                  className="text-xs sm:text-sm text-[#124C45] hover:text-[#0f3d37] font-medium"
                  disabled={isLoading}
                >
                  {formData.countries.length === AVAILABLE_COUNTRIES.length
                    ? "Deseleccionar todos"
                    : "Seleccionar todos"}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg bg-gray-50">
                {AVAILABLE_COUNTRIES.map((country) => (
                  <label
                    key={country.code}
                    className="flex items-center space-x-1 sm:space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.countries.includes(country.code)}
                      onChange={() => handleCountryToggle(country.code)}
                      className="rounded border-gray-300 text-[#124C45] focus:ring-[#124C45]"
                      disabled={isLoading}
                    />
                    <span className="text-xs sm:text-sm flex items-center space-x-1">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </span>
                  </label>
                ))}
              </div>
              {formData.countries.length === 0 && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">
                  Debe seleccionar al menos un país
                </p>
              )}
              {/* Botón para reordenar contenidos: colocado debajo de Países y encima de las acciones */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(true)}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 text-sm bg-[#124C45] text-white rounded-lg hover:bg-[#0f3d37] transition-colors"
                  disabled={isLoading || !editingSection?.id}
                  title={
                    editingSection?.id
                      ? "Reordenar contenidos de esta sección"
                      : "Guardar la sección antes de reordenar contenidos"
                  }
                >
                  <span>Reordenar contenidos</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 sm:pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0">
                <div className="flex items-center space-x-1">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{formData.countries.length} países</span>
                </div>
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
                  disabled={isLoading || formData.countries.length === 0}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 text-sm bg-[#124C45] text-white rounded-lg hover:bg-[#0f3d37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>
                    {isLoading
                      ? "Guardando..."
                      : editingSection
                      ? "Actualizar"
                      : "Crear"}{" "}
                    Sección
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <SectionContentsOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        categoryId={categoryId}
        sectionId={editingSection?.id}
      />
    </>
  );
}
