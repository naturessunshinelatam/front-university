import React from 'react';
import { useCountry } from '../contexts/CountryContext';
import { Globe, X } from 'lucide-react';

export default function CountryAlert() {
  const { 
    showCountryAlert, 
    detectedCountry, 
    selectedCountry, 
    setSelectedCountry, 
    dismissCountryAlert 
  } = useCountry();

  if (!showCountryAlert || detectedCountry.code === selectedCountry.code) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#124C45] to-[#023D4F] text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="w-6 h-6" />
              <h3 className="text-lg font-semibold truncate overflow-hidden whitespace-nowrap flex-1 min-w-0">Detección de Ubicación</h3>
            </div>
            <button
              onClick={dismissCountryAlert}
              className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          <p className="text-gray-700 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base overflow-hidden">
            Basado en tu IP, detectamos que te encuentras en{' '}
            <span className="font-semibold text-[#124C45] break-words">
              {detectedCountry.flag} {detectedCountry.name}
            </span>
            <span className="hidden sm:inline break-words">, sin embargo el sitio web que estás viendo es de{' '}
            <span className="font-semibold text-[#023D4F] break-words">
              {selectedCountry.flag} {selectedCountry.name}
            </span></span>
            <span className="sm:hidden break-words">. ¿Cambiar región?</span>
            <span className="hidden sm:inline break-words">. Podemos redirigirte al sitio de {detectedCountry.name} o puedes continuar 
            con el sitio de {selectedCountry.name}.</span>
          </p>
          
          <div className="flex flex-col gap-3 sm:gap-2">
            <button
              onClick={() => setSelectedCountry(detectedCountry)}
              className="w-full bg-[#124C45] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#0f3d37] transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base overflow-hidden"
            >
              <span className="flex-shrink-0">{detectedCountry.flag}</span>
              <span className="truncate overflow-hidden whitespace-nowrap flex-1 min-w-0">
                <span className="hidden sm:inline">Cambiar a </span>
                <span className="break-words">{detectedCountry.name}</span>
              </span>
            </button>
            
            <button
              onClick={dismissCountryAlert}
              className="w-full bg-[#023D4F] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#01303e] transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base overflow-hidden"
            >
              <span className="flex-shrink-0">{selectedCountry.flag}</span>
              <span className="truncate overflow-hidden whitespace-nowrap flex-1 min-w-0">
                <span className="hidden sm:inline">Continuar con </span>
                <span className="break-words">{selectedCountry.name}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}