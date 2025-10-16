import React, { useState, useEffect } from 'react';
import { useCountry } from '../contexts/CountryContext';
import { useUsers } from '../hooks/useUsers';
import { 
  X, 
  UserPlus, 
  Save,
  Shield,
  Globe,
  Mail,
  User,
  Lock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  categoryName?: string;
  description?: string;
}

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void | Promise<void>;
  editingUser?: {
    id?: string;
    usernames: string;
    email: string;
    roles: string[];
    countries: string[];
    accesibleCategories: string[];
    isActive: boolean;
  };
  categories: Category[];
}

export default function UserForm({ isOpen, onClose, onSave, editingUser, categories }: UserFormProps) {
  const { availableCountries } = useCountry();
  const { createUser, updateUser, isLoading, users } = useUsers();
  const [formData, setFormData] = useState({
    usernames: '',
    email: '',
    password: '',
    roles: ['Admin'], // Ahora por defecto es Admin
    countries: [] as string[],
    accesibleCategories: [] as string[],
    isActive: true
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    isValid: false
  });
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  useEffect(() => {
    if (editingUser) {
      console.log('🔍 useEffect - editingUser:', editingUser);
      console.log('🔍 useEffect - editingUser.accesibleCategories (nombres):', editingUser.accesibleCategories);
      console.log('🔍 useEffect - categories available:', categories);
      
      // El backend devuelve NOMBRES de categorías, pero necesitamos IDs para el formulario
      const userCategoryNames = Array.isArray(editingUser.accesibleCategories) 
        ? editingUser.accesibleCategories 
        : [];
      
      // Convertir nombres a IDs
      const userCategoryIds = userCategoryNames
        .map(name => {
          const category = categories.find(c => 
            (c.categoryName || c.name) === name
          );
          return category?.id;
        })
        .filter((id): id is string => id !== undefined);
      
      console.log('🔍 useEffect - userCategoryNames:', userCategoryNames);
      console.log('🔍 useEffect - userCategoryIds:', userCategoryIds);
      
      setFormData({
        usernames: editingUser.usernames || '',
        email: editingUser.email || '',
        password: '',
        roles: editingUser.roles || ['Admin'],
        countries: editingUser.countries || [],
        accesibleCategories: userCategoryIds,
        isActive: editingUser.isActive !== undefined ? editingUser.isActive : true
      });
      
      console.log('🔍 useEffect - formData set with accesibleCategories (IDs):', userCategoryIds);
    } else {
      setFormData({
        usernames: '',
        email: '',
        password: '',
        roles: ['Admin'],
        countries: [],
        accesibleCategories: [],
        isActive: true
      });
    }
  }, [editingUser, isOpen, categories]);

  // Validar fortaleza de contraseña en tiempo real
  useEffect(() => {
    if (formData.password) {
      const hasMinLength = formData.password.length >= 8;
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasLowerCase = /[a-z]/.test(formData.password);
      const hasNumber = /[0-9]/.test(formData.password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password);
      
      const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
      
      setPasswordStrength({
        hasMinLength,
        hasUpperCase,
        hasLowerCase,
        hasNumber,
        hasSpecialChar,
        isValid
      });
    } else {
      setPasswordStrength({
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
        isValid: false
      });
    }
  }, [formData.password]);

  // Validar email duplicado en tiempo real
  useEffect(() => {
    const checkEmailAvailability = async () => {
      if (!formData.email || formData.email.trim() === '') {
        setEmailStatus('idle');
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setEmailStatus('idle');
        return;
      }

      // Si estamos editando y el email no ha cambiado, no validar
      if (editingUser && formData.email === editingUser.email) {
        setEmailStatus('available');
        return;
      }

      setEmailStatus('checking');

      // Simular delay para evitar muchas validaciones mientras escribe
      const timeoutId = setTimeout(() => {
        const emailExists = users.some(u => 
          u.email.toLowerCase() === formData.email.toLowerCase() &&
          u.email !== editingUser?.email
        );

        setEmailStatus(emailExists ? 'taken' : 'available');
      }, 500);

      return () => clearTimeout(timeoutId);
    };

    checkEmailAvailability();
  }, [formData.email, users, editingUser]);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.usernames.trim()) {
      errors.usernames = 'El nombre es requerido';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Formato de correo electrónico inválido';
    } else if (emailStatus === 'taken') {
      errors.email = 'Este correo electrónico ya está registrado';
    }

    if (!editingUser && !formData.password.trim()) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password && !passwordStrength.isValid) {
      errors.password = 'La contraseña no cumple con los requisitos de seguridad';
    }

    if (formData.countries.length === 0) {
      errors.countries = 'Debe seleccionar al menos un país';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCountryToggle = (countryCode: string) => {
    console.log('🔍 handleCountryToggle - countryCode:', countryCode);
    console.log('🔍 handleCountryToggle - current countries:', formData.countries);
    
    setFormData(prev => {
      const newCountries = prev.countries.includes(countryCode)
        ? prev.countries.filter((c: string) => c !== countryCode)
        : [...prev.countries, countryCode];
      
      console.log('🔍 handleCountryToggle - new countries:', newCountries);
      
      return {
        ...prev,
        countries: newCountries
      };
    });
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      accesibleCategories: prev.accesibleCategories.includes(categoryId)
        ? prev.accesibleCategories.filter((c: string) => c !== categoryId)
        : [...prev.accesibleCategories, categoryId]
    }));
  };

  const handleSelectAllCountries = () => {
    console.log('🔍 handleSelectAllCountries called!');
    console.log('🔍 handleSelectAllCountries - current countries:', formData.countries);
    console.log('🔍 handleSelectAllCountries - availableCountries.length:', availableCountries.length);
    
    setFormData(prev => {
      const newCountries = prev.countries.length === availableCountries.length 
        ? [] 
        : availableCountries.map(c => c.code);
      
      console.log('🔍 handleSelectAllCountries - new countries:', newCountries);
      
      return {
        ...prev,
        countries: newCountries
      };
    });
  };

  const handleSelectAllCategories = () => {
    setFormData(prev => ({
      ...prev,
      accesibleCategories: prev.accesibleCategories.length === categories.length 
        ? [] 
        : categories.map((c: Category) => c.id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔍 handleSubmit - editingUser:', editingUser);
    console.log('🔍 handleSubmit - formData.accesibleCategories (IDs):', formData.accesibleCategories);
    
    // ⚠️ IMPORTANTE: El backend espera IDs, NO nombres
    // El formData ya tiene IDs, así que los enviamos directamente
    
    // Prepare submit data
    const submitData: {
      usernames: string;
      email: string;
      roles: string[];
      countries: string[];
      accesibleCategories: string[]; // ⚠️ IDs de categorías
      isActive: boolean;
      password?: string;
    } = { 
      ...formData
      // accesibleCategories ya contiene IDs
    };

    console.log('🔍 submitData with category IDs:', submitData);

    // On update, only include password if non-empty
    if (editingUser && (!formData.password || formData.password.trim() === '')) {
      // Crear nuevo objeto sin password para actualización
      delete submitData.password;
    }

    console.log('🔧 Final submitData:', submitData);

    if (!validateForm()) {
      return;
    }

    try {
      let success = false;
      
      if (editingUser) {
        console.log('✅ Calling UPDATE API');
        // Para actualización, necesitamos enviar el email original como identificador
        const updateData = {
          ...submitData,
          originalEmail: editingUser.email // Email original para identificar al usuario
        };
        console.log('📤 Update data with category IDs:', updateData);
        success = await updateUser(updateData);
      } else {
        console.log('✅ Calling CREATE API');
        // Para crear, asegurar que password esté presente
        const createData: {
          usernames: string;
          email: string;
          roles: string[];
          countries: string[];
          accesibleCategories: string[]; // IDs de categorías
          isActive: boolean;
          password: string;
        } = {
          ...submitData,
          password: submitData.password || ''
        };
        console.log('📤 Create data with category IDs:', createData);
        success = await createUser(createData);
      }

      if (success) {
        await onSave();
        onClose();
      }
    } catch (error) {
      console.error('Error saving user:', error);
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
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
              <h2 className="text-lg sm:text-xl font-bold">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario Administrativo'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                <User className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={formData.usernames}
                onChange={(e) => setFormData(prev => ({ ...prev, usernames: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent"
                placeholder="Ej: Ana Rodríguez"
              />
              {validationErrors.usernames && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.usernames}</p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                Correo Electrónico *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-3 py-2 pr-10 text-sm border rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent ${
                    emailStatus === 'taken' ? 'border-red-500' : 
                    emailStatus === 'available' ? 'border-green-500' : 
                    'border-gray-300'
                  }`}
                  placeholder="usuario@natures-sunshine.com"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {emailStatus === 'checking' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#124C45]"></div>
                  )}
                  {emailStatus === 'available' && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  {emailStatus === 'taken' && (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              {emailStatus === 'taken' && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Este correo electrónico ya está registrado
                </p>
              )}
              {emailStatus === 'available' && formData.email && (
                <p className="text-green-600 text-xs mt-1 flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Correo electrónico disponible
                </p>
              )}
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
              {editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
            </label>
            <input
              type="password"
              required={!editingUser}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#124C45] focus:border-transparent ${
                formData.password && !passwordStrength.isValid ? 'border-red-300' : 
                formData.password && passwordStrength.isValid ? 'border-green-300' : 
                'border-gray-300'
              }`}
              placeholder="••••••••"
            />
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">Requisitos de contraseña:</p>
                <div className="space-y-1">
                  <div className="flex items-center text-xs">
                    {passwordStrength.hasMinLength ? (
                      <CheckCircle2 className="w-3 h-3 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-3 h-3 text-gray-400 mr-2" />
                    )}
                    <span className={passwordStrength.hasMinLength ? 'text-green-700' : 'text-gray-600'}>
                      Mínimo 8 caracteres
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    {passwordStrength.hasUpperCase ? (
                      <CheckCircle2 className="w-3 h-3 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-3 h-3 text-gray-400 mr-2" />
                    )}
                    <span className={passwordStrength.hasUpperCase ? 'text-green-700' : 'text-gray-600'}>
                      Al menos una letra mayúscula (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    {passwordStrength.hasLowerCase ? (
                      <CheckCircle2 className="w-3 h-3 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-3 h-3 text-gray-400 mr-2" />
                    )}
                    <span className={passwordStrength.hasLowerCase ? 'text-green-700' : 'text-gray-600'}>
                      Al menos una letra minúscula (a-z)
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    {passwordStrength.hasNumber ? (
                      <CheckCircle2 className="w-3 h-3 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-3 h-3 text-gray-400 mr-2" />
                    )}
                    <span className={passwordStrength.hasNumber ? 'text-green-700' : 'text-gray-600'}>
                      Al menos un número (0-9)
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    {passwordStrength.hasSpecialChar ? (
                      <CheckCircle2 className="w-3 h-3 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-3 h-3 text-gray-400 mr-2" />
                    )}
                    <span className={passwordStrength.hasSpecialChar ? 'text-green-700' : 'text-gray-600'}>
                      Al menos un carácter especial (!@#$%^&*...)
                    </span>
                  </div>
                </div>
                {passwordStrength.isValid && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-green-700 font-medium flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      ¡Contraseña segura!
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {validationErrors.password && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
              Rol del Usuario *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-start p-3 sm:p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="roles"
                  value="Admin"
                  checked={formData.roles.includes('Admin')}
                  onChange={(e) => {
                    console.log('Role changed to:', e.target.value);
                    setFormData(prev => ({ ...prev, roles: [e.target.value] }));
                  }}
                  className="text-[#124C45] focus:ring-[#124C45] mr-2 sm:mr-3 mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Administrador General</p>
                  <p className="text-xs sm:text-sm text-gray-600">Control total del sistema, gestión de usuarios y contenido global</p>
                </div>
              </label>
              
              {/* COMENTADO: Ya no se usa ContentManager, solo Admin */}
              {/* <label className="flex items-start p-3 sm:p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="roles"
                  value="ContentManager"
                  checked={formData.roles.includes('ContentManager')}
                  onChange={(e) => {
                    console.log('Role changed to:', e.target.value);
                    setFormData(prev => ({ ...prev, roles: [e.target.value] }));
                  }}
                  className="text-[#124C45] focus:ring-[#124C45] mr-2 sm:mr-3 mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Administrador de Contenido</p>
                  <p className="text-xs sm:text-sm text-gray-600">Creación y edición de contenido con permisos específicos</p>
                </div>
              </label> */}
            </div>
          </div>

          {/* Country Assignment */}
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
              >
                {formData.countries.length === availableCountries.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg bg-gray-50">
              {availableCountries.map(country => (
                <label key={country.code} className="flex items-center space-x-1 sm:space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.countries.includes(country.code)}
                    onChange={() => handleCountryToggle(country.code)}
                    className="rounded border-gray-300 text-[#124C45] focus:ring-[#124C45]"
                  />
                  <span className="text-xs sm:text-sm flex items-center space-x-1">
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </span>
                </label>
              ))}
            </div>
            {formData.countries.length === 0 && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">Debe seleccionar al menos un país</p>
            )}
          </div>

          {/* Category Permissions - Ahora para todos los roles */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Categorías Asignadas *
              </label>
              <button
                type="button"
                onClick={handleSelectAllCategories}
                className="text-xs sm:text-sm text-[#124C45] hover:text-[#0f3d37] font-medium"
              >
                {formData.accesibleCategories.length === categories.length ? 'Quitar todas' : 'Seleccionar todas'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg bg-gray-50 max-h-60 overflow-y-auto">
              {categories.map(category => {
                const isChecked = formData.accesibleCategories.includes(category.id);
                console.log(`🔍 Category ${category.categoryName || category.name} (${category.id}):`, {
                  isChecked,
                  categoryId: category.id,
                  categoryIdType: typeof category.id,
                  formDataCategories: formData.accesibleCategories,
                  formDataCategoriesTypes: formData.accesibleCategories.map(id => typeof id)
                });
                
                return (
                  <label key={category.id} className="flex items-start space-x-2 sm:space-x-3 cursor-pointer p-2 sm:p-3 bg-white rounded-lg border border-gray-100 hover:border-[#124C45] transition-colors">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="rounded border-gray-300 text-[#124C45] focus:ring-[#124C45] mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{category.categoryName || category.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{category.description}</p>
                    </div>
                  </label>
                );
              })}
              {categories.length === 0 && (
                <p className="text-sm text-gray-500 col-span-2 text-center py-4">
                  No hay categorías disponibles. Crea una categoría primero.
                </p>
              )}
            </div>
            {formData.accesibleCategories.length === 0 && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">Debe seleccionar al menos una categoría</p>
            )}
            {validationErrors.accesibleCategories && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.accesibleCategories}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Estado del Usuario
            </label>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <label className="flex items-center space-x-1 sm:space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="isActive"
                  value="true"
                  checked={formData.isActive === true}
                  onChange={() => setFormData(prev => ({ ...prev, isActive: true }))}
                  className="text-[#124C45] focus:ring-[#124C45]"
                />
                <span className="text-xs sm:text-sm">Activo</span>
              </label>
              <label className="flex items-center space-x-1 sm:space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="isActive"
                  value="false"
                  checked={formData.isActive === false}
                  onChange={() => setFormData(prev => ({ ...prev, isActive: false }))}
                  className="text-[#124C45] focus:ring-[#124C45]"
                />
                <span className="text-xs sm:text-sm">Inactivo</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 sm:pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0">
              <div className="flex items-center space-x-1">
                <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{formData.countries.length} países</span>
              </div>
              {formData.roles.includes('ContentManager') && (
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{formData.accesibleCategories.length} categorías</span>
                </div>
              )}
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
                disabled={isLoading || formData.countries.length === 0 || (formData.roles.includes('ContentManager') && formData.accesibleCategories.length === 0)}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 text-sm bg-[#124C45] text-white rounded-lg hover:bg-[#0f3d37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>
                  {isLoading ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear')} Usuario
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}