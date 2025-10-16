import React, { useState } from 'react';
import { useCountry } from '../contexts/CountryContext';
import { Globe, AlertCircle } from 'lucide-react';

export default function UnsupportedCountryModal() {
  const { 
    showUnsupportedCountryModal, 
    detectedCountry,
    availableCountries,
    selectCountryFromModal
  } = useCountry();

  const [selectedCountry, setSelectedCountry] = useState<string>('');

  if (!showUnsupportedCountryModal) {
    return null;
  }

  const handleContinue = () => {
    const country = availableCountries.find(c => c.code === selectedCountry);
    if (country) {
      selectCountryFromModal(country);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#124C45] to-[#023D4F] text-white p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">País No Disponible</h3>
              <p className="text-sm text-white/90 mt-1">
                Tu ubicación: {detectedCountry.flag} {detectedCountry.name}
              </p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-800 font-medium mb-1">
                  Tu país no está disponible actualmente
                </p>
                <p className="text-gray-600 text-sm">
                  Por favor selecciona uno de los siguientes países para continuar navegando en Universidad Sunshine.
                </p>
              </div>
            </div>
          </div>

          {/* Country Selection Grid */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Selecciona un país:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => setSelectedCountry(country.code)}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200
                    flex flex-col items-center justify-center space-y-2
                    hover:shadow-md
                    ${selectedCountry === country.code
                      ? 'border-[#124C45] bg-[#124C45]/5 shadow-md'
                      : 'border-gray-200 hover:border-[#124C45]/50'
                    }
                  `}
                >
                  <span className="text-3xl">{country.flag}</span>
                  <span className={`
                    text-xs font-medium text-center leading-tight
                    ${selectedCountry === country.code ? 'text-[#124C45]' : 'text-gray-700'}
                  `}>
                    {country.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Info Message */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                <span className="font-medium">Nota:</span> Podrás cambiar de país en cualquier momento desde el selector de países en la parte superior de la página.
              </p>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!selectedCountry}
            className={`
              w-full py-4 px-6 rounded-xl font-semibold text-lg
              transition-all duration-200 flex items-center justify-center space-x-2
              ${selectedCountry
                ? 'bg-gradient-to-r from-[#124C45] to-[#023D4F] text-white hover:shadow-lg hover:scale-[1.02]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <span>Continuar con {selectedCountry && availableCountries.find(c => c.code === selectedCountry)?.name}</span>
          </button>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Al continuar, aceptas ver contenido específico del país seleccionado
          </p>
        </div>
      </div>
    </div>
  );
}
