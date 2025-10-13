import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

interface Alert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertContextType {
  showAlert: (alert: Omit<Alert, 'id'>) => void;
  removeAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const showAlert = (alert: Omit<Alert, 'id'>) => {
    const id = Date.now().toString();
    const newAlert = { ...alert, id };
    setAlerts(prev => [...prev, newAlert]);

    // Auto remove after duration (default 5 seconds) - unless it's a confirmation
    if (alert.duration !== 0) {
      setTimeout(() => {
        removeAlert(id);
      }, alert.duration || 5000);
    }
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ showAlert, removeAlert }}>
      {children}
      <AlertContainer alerts={alerts} onRemove={removeAlert} />
    </AlertContext.Provider>
  );
}

function AlertContainer({ alerts, onRemove }: { alerts: Alert[]; onRemove: (id: string) => void }) {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {alerts.map((alert) => (
        <AlertItem key={alert.id} alert={alert} onRemove={onRemove} />
      ))}
    </div>
  );
}

function AlertItem({ alert, onRemove }: { alert: Alert; onRemove: (id: string) => void }) {
  const getIcon = () => {
    switch (alert.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getColors = () => {
    switch (alert.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const handleConfirm = () => {
    if (alert.onConfirm) {
      alert.onConfirm();
    }
    onRemove(alert.id);
  };

  const handleCancel = () => {
    if (alert.onCancel) {
      alert.onCancel();
    }
    onRemove(alert.id);
  };

  return (
    <div className={`max-w-sm w-full border rounded-lg shadow-lg p-4 ${getColors()} animate-in slide-in-from-right duration-300`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{alert.title}</h3>
          <p className="text-sm mt-1 opacity-90">{alert.message}</p>
          
          {/* Confirmation buttons for warning alerts */}
          {alert.type === 'warning' && alert.onConfirm && (
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleConfirm}
                className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700 transition-colors"
              >
                Sí, eliminar
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs font-medium hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
        
        {/* Only show X button for non-confirmation alerts */}
        {!(alert.type === 'warning' && alert.onConfirm) && (
          <button
            onClick={() => onRemove(alert.id)}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}