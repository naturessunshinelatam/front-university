import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCountry } from '../contexts/CountryContext';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Globe,
  TrendingUp,
  Eye,
  Edit,
  Plus,
  Calendar,
  FolderPlus
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { selectedCountry } = useCountry();
  const navigate = useNavigate();

  const stats = [
    {
      icon: FileText,
      title: 'Contenido Publicado',
      value: '156',
      change: '+12% este mes',
      color: 'from-[#124C45] to-[#0f3d37]'
    },
    {
      icon: Eye,
      title: 'Visualizaciones',
      value: '12,450',
      change: '+18% esta semana',
      color: 'from-[#023D4F] to-[#01303e]'
    },
    {
      icon: Users,
      title: 'Usuarios Activos',
      value: '3,200',
      change: '+5% este mes',
      color: 'from-[#124C45] to-[#023D4F]'
    },
    {
      icon: Globe,
      title: 'Países Activos',
      value: '7',
      change: 'Cobertura completa',
      color: 'from-[#023D4F] to-[#124C45]'
    }
  ];

  const recentActivity = [
    {
      action: 'Nuevo contenido publicado',
      item: 'Video "Power Start - Día 1"',
      time: '2 horas ago',
      country: 'MX'
    },
    {
      action: 'Contenido actualizado',
      item: 'PDF "Plan de Compensación 2024"',
      time: '4 horas ago',
      country: 'CO'
    },
    {
      action: 'Nuevo entrenamiento',
      item: 'Quantum 2.0 - Módulo 3',
      time: '1 día ago',
      country: 'PE'
    },
    {
      action: 'Testimonial agregado',
      item: 'Historia de éxito - María García',
      time: '2 días ago',
      country: 'EC'
    }
  ];

  const quickActions = [
    {
      icon: Plus,
      title: 'Gestionar Contenido',
      description: 'Editar y asignar contenido por países',
      color: 'bg-[#124C45] hover:bg-[#0f3d37]',
      action: 'content'
    },
    {
      icon: FolderPlus,
      title: 'Categorías y Secciones',
      description: 'Gestionar estructura de contenido',
      color: 'bg-[#023D4F] hover:bg-[#01303e]',
      action: 'categories'
    },
    {
      icon: BarChart3,
      title: 'Estadísticas',
      description: 'Métricas de visualización por país',
      color: 'bg-gradient-to-r from-[#124C45] to-[#023D4F]',
      action: 'analytics'
    },
    {
      icon: Users,
      title: 'Administrar Accesos',
      description: 'Gestionar usuarios administrativos',
      color: 'bg-gradient-to-r from-[#023D4F] to-[#124C45]',
      action: 'users'
    }
  ];

  const handleQuickAction = (action: any) => {
    navigate('/admin', { state: { activeTab: action } });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bienvenido, {user?.name}
              </h1>
              <p className="text-gray-600 mt-2">
                Panel de control - {selectedCountry.flag} {selectedCountry.name}
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
              <p className="text-xs text-green-600 font-medium">{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.action)}
                    className={`${action.color} text-white p-6 rounded-xl text-left transition-all duration-300 transform hover:scale-105 hover:shadow-lg block`}
                  >
                    <action.icon className="w-8 h-8 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Actividad Reciente</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-[#124C45] rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600 truncate">{activity.item}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">{activity.time}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {activity.country}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Role-specific Features */}
        {user?.role === 'admin' && (
          <div className="mt-8 bg-gradient-to-r from-[#124C45] to-[#023D4F] rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Panel de Administración</h3>
                <p className="opacity-90">
                  Gestiona usuarios, contenido global y configuraciones del sistema
                </p>
              </div>
              <button 
                onClick={() => navigate('/admin')}
                className="bg-white text-[#124C45] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Acceder
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}