import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CountryProvider } from './contexts/CountryContext';
import { AlertProvider } from './components/AlertSystem';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContentView from './pages/ContentView';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import CountryAlert from './components/CountryAlert';
import UnsupportedCountryModal from './components/UnsupportedCountryModal';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import Navigation from './components/Navigation';

function App() {
  return (
    <AuthProvider>
      <CountryProvider>
        <AlertProvider>
          <div className="min-h-screen bg-white">
            {/* Modales en orden de prioridad */}
            {/* 1. Modal de país no soportado (prioridad máxima) */}
            <UnsupportedCountryModal />
            
            {/* 2. Modal de políticas de privacidad (si país soportado y requiere políticas) */}
            <PrivacyPolicyModal />
            
            {/* 3. Alerta de cambio de país (cambio manual) */}
            <CountryAlert />
            
            {/* Navegación y contenido */}
            <Navigation />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="Admin">
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              <Route path="/content/:category/:section?" element={<ContentView />} />
            </Routes>
          </div>
        </AlertProvider>
      </CountryProvider>
    </AuthProvider>
  );
}

export default App;
