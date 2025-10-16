import React from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

export default function SessionExpiredModal({ isOpen, onConfirm }: SessionExpiredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Sesión Expirada
            </h3>
            <p className="text-sm text-gray-500">
              Tu sesión ha caducado por seguridad
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Por motivos de seguridad, tu sesión ha expirado automáticamente. 
            Necesitas iniciar sesión nuevamente para continuar.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">¿Por qué pasó esto?</p>
                <p>Las sesiones expiran automáticamente para proteger tu cuenta y los datos de la universidad.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onConfirm}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#124C45] text-white rounded-lg hover:bg-[#0f3d37] transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Ir al Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}
