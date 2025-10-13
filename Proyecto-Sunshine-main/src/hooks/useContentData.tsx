import { useState, useEffect } from 'react';

// Hook personalizado para manejar todos los datos de contenido con sincronización completa
export function useContentData() {
  // Estado para forzar re-renderizado cuando hay cambios
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Category order management
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);

  // Configuración general del sistema
  const [systemConfig, setSystemConfig] = useState({
    platformName: 'Universidad Sunshine',
    availableCountries: ['MX', 'CO', 'EC', 'SV', 'GT', 'HN', 'DO', 'PA'],
    publicContent: false,
    notifyUpdates: true,
    showStats: true,
    maintenanceMode: false,
    maxContentPerSection: 50,
    autoPublish: false
  });

  // Categorías iniciales con sus secciones
  const [categories, setCategories] = useState([
    {
      id: 'productos',
      name: 'Productos',
      description: 'Información relevante sobre los beneficios de los productos Sunshine',
      icon: 'Package',
      sections: [
        { 
          id: 'desintoxicacion', 
          name: 'Desintoxicación 90 días', 
          description: 'Programa completo de desintoxicación corporal',
          countries: ['PA', 'CO', 'EC', 'MX'],
          created_at: '2024-01-15T00:00:00.000Z',
          updated_at: '2024-01-15T00:00:00.000Z'
        },
        { 
          id: 'power-line', 
          name: 'Power Line', 
          description: 'Línea de productos energéticos premium',
          countries: ['MX', 'CO', 'EC'],
          created_at: '2024-01-15T00:00:00.000Z',
          updated_at: '2024-01-15T00:00:00.000Z'
        },
        { 
          id: 'health-pro', 
          name: 'Health Pro', 
          description: 'Productos profesionales de salud',
          countries: ['PA', 'CO', 'EC'],
          created_at: '2024-01-15T00:00:00.000Z',
          updated_at: '2024-01-15T00:00:00.000Z'
        }
      ],
      created_at: '2024-01-15T00:00:00.000Z',
      updated_at: '2024-01-15T00:00:00.000Z'
    },
    {
      id: 'compania',
      name: 'Compañía',
      description: 'Conócenos, más de 50 años nos respaldan, avalados por un Centro de Investigación y Desarrollo propio.',
      icon: 'Building',
      sections: [
        { 
          id: 'quienes-somos', 
          name: 'Quiénes Somos', 
          description: 'Historia y misión de nuestra empresa',
          countries: ['PA', 'CO', 'EC', 'MX', 'SV', 'GT', 'HN', 'DO'],
          created_at: '2024-01-15T00:00:00.000Z',
          updated_at: '2024-01-15T00:00:00.000Z'
        },
        { 
          id: 'plan-compensacion', 
          name: 'Plan de Compensación', 
          description: 'Estructura de compensaciones y beneficios',
          countries: ['PA', 'CO', 'EC', 'MX', 'SV', 'GT', 'HN', 'DO'],
          created_at: '2024-01-15T00:00:00.000Z',
          updated_at: '2024-01-15T00:00:00.000Z'
        },
        { 
          id: 'liderazgo', 
          name: 'Liderazgo', 
          description: 'Equipo directivo y líderes',
          countries: ['PA', 'CO', 'EC', 'MX', 'SV', 'GT'],
          created_at: '2024-01-15T00:00:00.000Z',
          updated_at: '2024-01-15T00:00:00.000Z'
        },
        { 
          id: 'testimonios', 
          name: 'Testimonios', 
          description: 'Historias de éxito de afiliados',
          countries: ['CO', 'EC', 'PA'],
          created_at: '2024-01-15T00:00:00.000Z',
          updated_at: '2024-01-15T00:00:00.000Z'
        }
      ],
      created_at: '2024-01-15T00:00:00.000Z',
      updated_at: '2024-01-15T00:00:00.000Z'
    },
    {
      id: 'herramientas-comerciales',
      name: 'Herramientas comerciales',
      description: 'Estrategias, ideas, testimonios que te llevarán al éxito en tu negocio.',
      icon: 'GraduationCap',
      sections: [
        { 
          id: 'quantum-2', 
          name: 'Quantum 2.0 por Alexander Farías', 
          description: 'Sistema de entrenamiento empresarial de élite',
          countries: ['PA', 'CO', 'EC'],
          created_at: '2024-01-15T00:00:00.000Z',
          updated_at: '2024-01-15T00:00:00.000Z'
        },
        { 
          id: 'entrenamientos', 
          name: 'Entrenamientos Grabados', 
          description: 'Biblioteca de entrenamientos especializados',
          countries: ['MX', 'SV', 'GT', 'HN', 'DO'],
          created_at: '2024-01-15T00:00:00.000Z',
          updated_at: '2024-01-15T00:00:00.000Z'
        }
      ],
      created_at: '2024-01-15T00:00:00.000Z',
      updated_at: '2024-01-15T00:00:00.000Z'
    },
    {
      id: 'shorts',
      name: 'Shorts',
      description: 'Videos cortos para conocer más de la marca y lo que todos están hablando.',
      icon: 'Zap',
      sections: [
        { 
          id: 'power-start', 
          name: 'Power Start', 
          description: 'Videos motivacionales diarios para afiliados',
          countries: ['PA', 'CO', 'EC', 'MX', 'SV', 'GT', 'HN', 'DO'],
          created_at: '2024-01-15T00:00:00.000Z',
          updated_at: '2024-01-15T00:00:00.000Z'
        },
        { 
          id: 'tips-rapidos', 
          name: 'Tips Rápidos', 
          description: 'Consejos rápidos sobre productos naturales',
          countries: ['PA', 'CO', 'EC', 'MX', 'SV', 'GT', 'HN', 'DO'],
          created_at: '2024-01-15T00:00:00.000Z',
          updated_at: '2024-01-15T00:00:00.000Z'
        },
        { 
          id: 'historias-exito', 
          name: 'Historias de Éxito', 
          description: 'Testimonios cortos de afiliados exitosos',
          countries: ['PA', 'CO', 'EC', 'MX', 'SV', 'GT', 'HN', 'DO'],
          created_at: '2024-01-15T00:00:00.000Z',
          updated_at: '2024-01-15T00:00:00.000Z'
        }
      ],
      created_at: '2024-01-15T00:00:00.000Z',
      updated_at: '2024-01-15T00:00:00.000Z'
    }
  ]);

  // Contenido inicial con ejemplos realistas
  const [contentItems, setInternalContentItems] = useState([
    // PRODUCTOS - Desintoxicación 90 días
    {
      id: '1',
      title: 'Manual Completo Desintoxicación 90 Días',
      category: 'productos',
      section: 'desintoxicacion',
      type: 'pdf',
      countries: ['PA', 'CO', 'EC', 'MX'],
      status: 'publicado',
      views: 1250,
      lastModified: '2024-01-15',
      publish_start_date: '2024-01-15T00:00:00.000Z',
      publish_end_date: null,
      author: 'Dr. Ana Martínez',
      url: 'https://example.com/desintoxicacion-90-dias.pdf',
      description: 'Guía paso a paso del programa de desintoxicación corporal completo de 90 días con productos Natures Sunshine',
      size: '2.4 MB',
      created_at: '2024-01-15T00:00:00.000Z',
      updated_at: '2024-01-15T00:00:00.000Z'
    },
    {
      id: '1b',
      title: 'Video: Cómo Iniciar tu Desintoxicación',
      category: 'productos',
      section: 'desintoxicacion',
      type: 'youtube',
      countries: ['PA', 'CO', 'EC', 'MX'],
      status: 'publicado',
      views: 890,
      lastModified: '2024-01-15',
      publish_start_date: '2024-01-15T00:00:00.000Z',
      publish_end_date: null,
      author: 'Dr. Ana Martínez',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      description: 'Tutorial paso a paso para comenzar tu programa de desintoxicación de 90 días',
      duration: '12:30',
      created_at: '2024-01-15T00:00:00.000Z',
      updated_at: '2024-01-15T00:00:00.000Z'
    },
    {
      id: '1c',
      title: 'Video: Resultados y Testimonios',
      category: 'productos',
      section: 'desintoxicacion',
      type: 'youtube',
      countries: ['PA', 'CO', 'EC', 'MX'],
      status: 'publicado',
      views: 750,
      lastModified: '2024-01-15',
      publish_start_date: '2024-01-15T00:00:00.000Z',
      publish_end_date: null,
      author: 'Usuarios Reales',
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      description: 'Testimonios reales de personas que completaron el programa de desintoxicación',
      duration: '8:45',
      created_at: '2024-01-15T00:00:00.000Z',
      updated_at: '2024-01-15T00:00:00.000Z'
    },

    // PRODUCTOS - Power Line
    {
      id: 'powerline-video-1',
      title: 'Power Line - Video 1',
      category: 'productos',
      section: 'power-line',
      type: 'youtube',
      countries: ['MX'],
      status: 'publicado',
      views: 0,
      lastModified: '2024-01-15',
      publish_start_date: '2024-01-15T00:00:00.000Z',
      publish_end_date: null,
      author: 'Nature\'s Sunshine',
      url: 'https://www.youtube.com/watch?v=nw10CHXfVBk',
      description: 'Video informativo sobre productos Power Line de Nature\'s Sunshine',
      duration: '10:30',
      created_at: '2024-01-15T00:00:00.000Z',
      updated_at: '2024-01-15T00:00:00.000Z'
    },
    {
      id: 'powerline-video-2',
      title: 'Power Line - Video 2',
      category: 'productos',
      section: 'power-line',
      type: 'youtube',
      countries: ['MX'],
      status: 'publicado',
      views: 0,
      lastModified: '2024-01-15',
      publish_start_date: '2024-01-15T00:00:00.000Z',
      publish_end_date: null,
      author: 'Nature\'s Sunshine',
      url: 'https://www.youtube.com/watch?v=nw10CHXfVBk',
      description: 'Segundo video sobre productos Power Line de Nature\'s Sunshine',
      duration: '8:15',
      created_at: '2024-01-15T00:00:00.000Z',
      updated_at: '2024-01-15T00:00:00.000Z'
    },

    // COMPAÑÍA - Quiénes Somos
    {
      id: '4',
      title: 'Manual Corporativo Natures Sunshine',
      category: 'compania',
      section: 'quienes-somos',
      type: 'pdf',
      countries: ['PA', 'CO', 'EC', 'MX', 'SV', 'GT', 'HN', 'DO'],
      status: 'publicado',
      views: 1800,
      lastModified: '2024-01-11',
      publish_start_date: '2024-01-11T00:00:00.000Z',
      publish_end_date: null,
      author: 'Departamento Corporativo',
      url: 'https://example.com/manual-corporativo.pdf',
      description: 'Manual completo sobre la historia, misión y valores de Natures Sunshine',
      size: '4.2 MB',
      created_at: '2024-01-11T00:00:00.000Z',
      updated_at: '2024-01-11T00:00:00.000Z'
    },
    {
      id: '4b',
      title: 'Video: Historia de Natures Sunshine',
      category: 'compania',
      section: 'quienes-somos',
      type: 'youtube',
      countries: ['PA', 'CO', 'EC', 'MX', 'SV', 'GT', 'HN', 'DO'],
      status: 'publicado',
      views: 1200,
      lastModified: '2024-01-11',
      publish_start_date: '2024-01-11T00:00:00.000Z',
      publish_end_date: null,
      author: 'Departamento Corporativo',
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      description: 'Historia completa de Natures Sunshine desde sus inicios',
      duration: '12:45',
      created_at: '2024-01-11T00:00:00.000Z',
      updated_at: '2024-01-11T00:00:00.000Z'
    },
    {
      id: '4c',
      title: 'Video: Misión y Valores',
      category: 'compania',
      section: 'quienes-somos',
      type: 'youtube',
      countries: ['PA', 'CO', 'EC', 'MX', 'SV', 'GT', 'HN', 'DO'],
      status: 'publicado',
      views: 950,
      lastModified: '2024-01-11',
      publish_start_date: '2024-01-11T00:00:00.000Z',
      publish_end_date: null,
      author: 'Departamento Corporativo',
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      description: 'Conoce la misión, visión y valores que nos guían',
      duration: '9:30',
      created_at: '2024-01-11T00:00:00.000Z',
      updated_at: '2024-01-11T00:00:00.000Z'
    },
    {
      id: '4d',
      title: 'Informe Anual de Sostenibilidad',
      category: 'compania',
      section: 'quienes-somos',
      type: 'pdf',
      countries: ['PA', 'CO', 'EC', 'MX', 'SV', 'GT', 'HN', 'DO'],
      status: 'publicado',
      views: 650,
      lastModified: '2024-01-11',
      publish_start_date: '2024-01-11T00:00:00.000Z',
      publish_end_date: null,
      author: 'Departamento de Sostenibilidad',
      url: 'https://example.com/informe-sostenibilidad.pdf',
      description: 'Reporte anual sobre nuestras iniciativas de sostenibilidad y responsabilidad social',
      size: '6.8 MB',
      created_at: '2024-01-11T00:00:00.000Z',
      updated_at: '2024-01-11T00:00:00.000Z'
    },
    {
      id: '4e',
      title: 'Video: Instalaciones y Procesos de Calidad',
      category: 'compania',
      section: 'quienes-somos',
      type: 'youtube',
      countries: ['PA', 'CO', 'EC', 'MX', 'SV', 'GT', 'HN', 'DO'],
      status: 'publicado',
      views: 1100,
      lastModified: '2024-01-11',
      publish_start_date: '2024-01-11T00:00:00.000Z',
      publish_end_date: null,
      author: 'Departamento de Calidad',
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      description: 'Tour por nuestras instalaciones y procesos de control de calidad',
      duration: '16:30',
      created_at: '2024-01-11T00:00:00.000Z',
      updated_at: '2024-01-11T00:00:00.000Z'
    },

    // COMPAÑÍA - Plan de Compensación
    {
      id: '5a',
      title: 'Plan de Compensación 2024 - Guía Completa',
      category: 'compania',
      section: 'plan-compensacion',
      type: 'pdf',
      countries: ['PA', 'CO', 'EC', 'MX', 'SV', 'GT', 'HN', 'DO'],
      status: 'publicado',
      views: 2100,
      lastModified: '2024-01-12',
      publish_start_date: '2024-01-12T00:00:00.000Z',
      publish_end_date: null,
      author: 'Departamento de Compensaciones',
      url: 'https://example.com/plan-compensacion-2024.pdf',
      description: 'Guía completa del plan de compensación actualizado para 2024',
      size: '1.8 MB',
      created_at: '2024-01-12T00:00:00.000Z',
      updated_at: '2024-01-12T00:00:00.000Z'
    },
    {
      id: '5b',
      title: 'Video: Explicación del Plan de Compensación',
      category: 'compania',
      section: 'plan-compensacion',
      type: 'youtube',
      countries: ['PA', 'CO', 'EC', 'MX', 'SV', 'GT', 'HN', 'DO'],
      status: 'publicado',
      views: 1850,
      lastModified: '2024-01-12',
      publish_start_date: '2024-01-12T00:00:00.000Z',
      publish_end_date: null,
      author: 'Director de Compensaciones',
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      description: 'Explicación detallada de cómo funciona nuestro plan de compensación',
      duration: '25:15',
      created_at: '2024-01-12T00:00:00.000Z',
      updated_at: '2024-01-12T00:00:00.000Z'
    },
    {
      id: '5c',
      title: 'Video: Casos de Éxito Financiero',
      category: 'compania',
      section: 'plan-compensacion',
      type: 'youtube',
      countries: ['PA', 'CO', 'EC', 'MX', 'SV', 'GT', 'HN', 'DO'],
      status: 'publicado',
      views: 1650,
      lastModified: '2024-01-12',
      publish_start_date: '2024-01-12T00:00:00.000Z',
      publish_end_date: null,
      author: 'Afiliados Exitosos',
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      description: 'Testimonios de afiliados que han alcanzado el éxito financiero',
      duration: '16:40',
      created_at: '2024-01-12T00:00:00.000Z',
      updated_at: '2024-01-12T00:00:00.000Z'
    },
    {
      id: '5d',
      title: 'Calculadora de Bonificaciones',
      category: 'compania',
      section: 'plan-compensacion',
      type: 'pdf',
      countries: ['PA', 'CO', 'EC', 'MX', 'SV', 'GT', 'HN', 'DO'],
      status: 'publicado',
      views: 1200,
      lastModified: '2024-01-12',
      publish_start_date: '2024-01-12T00:00:00.000Z',
      publish_end_date: null,
      author: 'Departamento Financiero',
      url: 'https://example.com/calculadora-bonificaciones.pdf',
      description: 'Herramienta para calcular tus bonificaciones potenciales',
      size: '2.1 MB',
      created_at: '2024-01-12T00:00:00.000Z',
      updated_at: '2024-01-12T00:00:00.000Z'
    },
    {
      id: '5e',
      title: 'Video: Estrategias para Maximizar Ingresos',
      category: 'compania',
      section: 'plan-compensacion',
      type: 'youtube',
      countries: ['PA', 'CO', 'EC', 'MX', 'SV', 'GT', 'HN', 'DO'],
      status: 'publicado',
      views: 1950,
      lastModified: '2024-01-12',
      publish_start_date: '2024-01-12T00:00:00.000Z',
      publish_end_date: null,
      author: 'Expertos en Compensación',
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      description: 'Estrategias probadas para maximizar tus ingresos con el plan de compensación',
      duration: '19:25',
      created_at: '2024-01-12T00:00:00.000Z',
      updated_at: '2024-01-12T00:00:00.000Z'
    },

    // Contenido específico para países SV, GT, HN, DO
    {
      id: 'sv-entrenamientos-1',
      title: 'Entrenamiento Especializado El Salvador',
      category: 'herramientas-comerciales',
      section: 'entrenamientos',
      type: 'youtube',
      countries: ['SV'],
      status: 'publicado',
      views: 450,
      lastModified: '2024-01-14',
      publish_start_date: '2024-01-14T00:00:00.000Z',
      publish_end_date: null,
      author: 'Equipo El Salvador',
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      description: 'Entrenamiento especializado para el mercado de El Salvador',
      duration: '15:20',
      created_at: '2024-01-14T00:00:00.000Z',
      updated_at: '2024-01-14T00:00:00.000Z'
    },
    {
      id: 'gt-entrenamientos-1',
      title: 'Entrenamiento Especializado Guatemala',
      category: 'herramientas-comerciales',
      section: 'entrenamientos',
      type: 'youtube',
      countries: ['GT'],
      status: 'publicado',
      views: 380,
      lastModified: '2024-01-14',
      publish_start_date: '2024-01-14T00:00:00.000Z',
      publish_end_date: null,
      author: 'Equipo Guatemala',
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      description: 'Entrenamiento especializado para el mercado de Guatemala',
      duration: '18:45',
      created_at: '2024-01-14T00:00:00.000Z',
      updated_at: '2024-01-14T00:00:00.000Z'
    },
    {
      id: 'hn-entrenamientos-1',
      title: 'Entrenamiento Especializado Honduras',
      category: 'herramientas-comerciales',
      section: 'entrenamientos',
      type: 'youtube',
      countries: ['HN'],
      status: 'publicado',
      views: 320,
      lastModified: '2024-01-14',
      publish_start_date: '2024-01-14T00:00:00.000Z',
      publish_end_date: null,
      author: 'Equipo Honduras',
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      description: 'Entrenamiento especializado para el mercado de Honduras',
      duration: '14:30',
      created_at: '2024-01-14T00:00:00.000Z',
      updated_at: '2024-01-14T00:00:00.000Z'
    },
    {
      id: 'do-entrenamientos-1',
      title: 'Entrenamiento Especializado República Dominicana',
      category: 'herramientas-comerciales',
      section: 'entrenamientos',
      type: 'youtube',
      countries: ['DO'],
      status: 'publicado',
      views: 280,
      lastModified: '2024-01-14',
      publish_start_date: '2024-01-14T00:00:00.000Z',
      publish_end_date: null,
      author: 'Equipo República Dominicana',
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      description: 'Entrenamiento especializado para el mercado de República Dominicana',
      duration: '16:15',
      created_at: '2024-01-14T00:00:00.000Z',
      updated_at: '2024-01-14T00:00:00.000Z'
    },

    // SHORTS - Power Start
    {
      id: '10b',
      title: 'Video: Power Start - Día 1',
      category: 'shorts',
      section: 'power-start',
      type: 'youtube',
      countries: ['PA', 'CO', 'EC', 'MX', 'SV', 'GT', 'HN', 'DO'],
      status: 'publicado',
      views: 3420,
      lastModified: '2024-01-13',
      publish_start_date: '2024-01-13T00:00:00.000Z',
      publish_end_date: null,
      author: 'Equipo Natures Sunshine',
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      description: 'Video motivacional diario para desarrollar mentalidad de éxito en afiliados',
      duration: '1:30',
      created_at: '2024-01-13T00:00:00.000Z',
      updated_at: '2024-01-13T00:00:00.000Z'
    }
  ]);

  // Función para verificar si el contenido está activo según fechas
  const isContentActive = (item: any) => {
    const now = new Date();
    const publishDate = new Date(item.publish_start_date || item.publishDate || item.created_at);
    const expirationDate = item.publish_end_date || item.expirationDate ? new Date(item.publish_end_date || item.expirationDate) : null;

    // Verificar si ya se puede mostrar
    if (publishDate > now) {
      return false; // Aún no se publica
    }

    // Verificar si ya expiró
    if (expirationDate && expirationDate < now) {
      return false; // Ya expiró
    }

    return true; // Está activo
  };

  // Función para obtener contenido filtrado por país
  const getContentForCountry = (countryCode: string) => {
    const filtered = contentItems.filter(item => {
      // Verificar si está publicado
      if (item.status !== 'publicado') {
        return false;
      }

      // Verificar si está disponible para el país
      if (!item.countries.includes(countryCode) && !item.countries.includes('all')) {
        return false;
      }

      // Verificar fechas de publicación/expiración
      return isContentActive(item);
    });

    console.log(`🌍 Contenido para ${countryCode}:`, filtered.length, 'elementos');
    return filtered;
  };

  // Función para obtener categorías filtradas por país
  const getCategoriesForCountry = (countryCode: string) => {
    const filtered = categories.filter(category => {
      // Verificar si la categoría tiene al menos una sección disponible para este país
      const availableSections = category.sections.filter(section => 
        section.countries.includes(countryCode) || section.countries.includes('all')
      );
      return availableSections.length > 0;
    }).map(category => ({
      ...category,
      // Solo incluir secciones disponibles para este país
      sections: category.sections.filter(section => 
        section.countries.includes(countryCode) || section.countries.includes('all')
      )
    }));

    console.log(`📁 Categorías para ${countryCode}:`, filtered.length, 'elementos');
    return filtered;
  };

  // Función para obtener secciones filtradas por país
  const getSectionsForCountry = (countryCode: string, categoryId?: string) => {
    let sectionsToFilter = [];
    
    if (categoryId) {
      const category = categories.find(cat => cat.id === categoryId);
      sectionsToFilter = category ? category.sections : [];
    } else {
      // Obtener todas las secciones de todas las categorías
      sectionsToFilter = categories.flatMap(cat => cat.sections);
    }
    
    const filtered = sectionsToFilter.filter(section => 
      section.countries.includes(countryCode) || section.countries.includes('all')
    );

    console.log(`📋 Secciones para ${countryCode}${categoryId ? ` en ${categoryId}` : ''}:`, filtered.length, 'elementos');
    return filtered;
  };

  // Función para obtener estadísticas por país
  const getContentStats = (countryCode: string) => {
    const availableCategories = getCategoriesForCountry(countryCode);
    const activeContent = getContentForCountry(countryCode);
    
    const totalContent = activeContent.length;
    const videoContent = activeContent.filter(item => item.type === 'youtube' || item.type === 'video').length;
    const pdfContent = activeContent.filter(item => item.type === 'pdf').length;
    const linkContent = activeContent.filter(item => item.type === 'link').length;
    
    // Estadísticas por categoría
    const categoryStats = availableCategories.map(category => {
      const categoryContent = activeContent.filter(item => item.category === category.id);
      return {
        categoryId: category.id,
        categoryName: category.name,
        contentCount: categoryContent.length,
        totalViews: categoryContent.reduce((sum, item) => sum + (item.views || 0), 0)
      };
    });

    // Estadísticas por sección
    const sectionStats = [];
    availableCategories.forEach(category => {
      category.sections.forEach(section => {
        const sectionContent = activeContent.filter(item => 
          item.category === category.id && item.section === section.id
        );
        if (sectionContent.length > 0) {
          sectionStats.push({
            categoryId: category.id,
            categoryName: category.name,
            sectionId: section.id,
            sectionName: section.name,
            contentCount: sectionContent.length,
            totalViews: sectionContent.reduce((sum, item) => sum + (item.views || 0), 0)
          });
        }
      });
    });

    return { 
      totalContent, 
      videoContent, 
      pdfContent, 
      linkContent,
      categoryStats,
      sectionStats,
      availableCategories: availableCategories.length
    };
  };

  // Función para obtener contenido por categoría
  const getContentByCategory = (categoryId: string, countryCode: string) => {
    const filtered = getContentForCountry(countryCode).filter(item => item.category === categoryId);
    console.log(`📁 Contenido categoría ${categoryId} para ${countryCode}:`, filtered.length);
    return filtered;
  };

  // Función para obtener contenido por sección
  const getContentBySection = (categoryId: string, sectionId: string, countryCode: string) => {
    const filtered = getContentForCountry(countryCode).filter(item => 
      item.category === categoryId && item.section === sectionId
    );
    console.log(`📋 Contenido sección ${sectionId} para ${countryCode}:`, filtered.length);
    return filtered;
  };

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const storedCategories = localStorage.getItem('universidadSunshine_categories');
    const storedContent = localStorage.getItem('universidadSunshine_content');
    const storedCategoryOrder = localStorage.getItem('universidadSunshine_categoryOrder');
    const storedSystemConfig = localStorage.getItem('universidadSunshine_systemConfig');
    
    if (storedCategories && storedCategories !== 'undefined') {
      try {
        const parsedCategories = JSON.parse(storedCategories);
        if (Array.isArray(parsedCategories)) {
          setCategories(parsedCategories);
          console.log('📁 Categorías cargadas desde localStorage:', parsedCategories.length);
        }
      } catch (error) {
        console.warn('Error parsing stored categories, using defaults');
      }
    }
    
    if (storedContent && storedContent !== 'undefined') {
      try {
        const parsedContent = JSON.parse(storedContent);
        if (Array.isArray(parsedContent)) {
          setInternalContentItems(parsedContent);
          console.log('📋 Contenido cargado desde localStorage:', parsedContent.length);
        }
      } catch (error) {
        console.warn('Error parsing stored content, using defaults');
      }
    }
    
    if (storedCategoryOrder && storedCategoryOrder !== 'undefined') {
      try {
        const parsedOrder = JSON.parse(storedCategoryOrder);
        if (Array.isArray(parsedOrder)) {
          setCategoryOrder(parsedOrder);
        }
      } catch (error) {
        console.warn('Error parsing stored category order, using defaults');
      }
    }

    if (storedSystemConfig && storedSystemConfig !== 'undefined') {
      try {
        const parsedConfig = JSON.parse(storedSystemConfig);
        if (typeof parsedConfig === 'object') {
          setSystemConfig(prev => ({ ...prev, ...parsedConfig }));
        }
      } catch (error) {
        console.warn('Error parsing stored system config, using defaults');
      }
    }
  }, []);

  // Función para actualizar categorías
  const updateCategories = (newCategories: any[]) => {
    if (!Array.isArray(newCategories)) {
      console.error('updateCategories expects an array');
      return;
    }

    setCategories(newCategories);
    localStorage.setItem('universidadSunshine_categories', JSON.stringify(newCategories));
    window.dispatchEvent(new CustomEvent('contentDataChanged', { 
      detail: { type: 'categories', data: newCategories } 
    }));
    setRefreshTrigger(prev => prev + 1);
    console.log('📁 Categorías actualizadas:', newCategories.length);
  };

  // Función para actualizar contenido
  const updateContentItems = (newContent: any[]) => {
    if (!Array.isArray(newContent)) {
      console.error('updateContentItems expects an array');
      return;
    }

    const sortedContent = [...newContent].sort((a, b) => {
      const dateA = new Date(a.created_at || a.lastModified || '2024-01-01');
      const dateB = new Date(b.created_at || b.lastModified || '2024-01-01');
      return dateB.getTime() - dateA.getTime();
    });
    
    setInternalContentItems(sortedContent);
    localStorage.setItem('universidadSunshine_content', JSON.stringify(sortedContent));
    window.dispatchEvent(new CustomEvent('contentDataChanged', { 
      detail: { type: 'content', data: sortedContent } 
    }));
    setRefreshTrigger(prev => prev + 1);
    console.log('📋 Contenido actualizado:', sortedContent.length);
  };

  // Función para actualizar orden de categorías
  const updateCategoryOrder = (newOrder: string[]) => {
    if (!Array.isArray(newOrder)) {
      console.error('updateCategoryOrder expects an array');
      return;
    }

    setCategoryOrder(newOrder);
    localStorage.setItem('universidadSunshine_categoryOrder', JSON.stringify(newOrder));
    window.dispatchEvent(new CustomEvent('contentDataChanged', { 
      detail: { type: 'categoryOrder', data: newOrder } 
    }));
    setRefreshTrigger(prev => prev + 1);
  };

  // Función para actualizar configuración del sistema
  const updateSystemConfig = (newConfig: any) => {
    if (typeof newConfig !== 'object') {
      console.error('updateSystemConfig expects an object');
      return;
    }

    const updatedConfig = { ...systemConfig, ...newConfig };
    setSystemConfig(updatedConfig);
    localStorage.setItem('universidadSunshine_systemConfig', JSON.stringify(updatedConfig));
    window.dispatchEvent(new CustomEvent('contentDataChanged', { 
      detail: { type: 'systemConfig', data: updatedConfig } 
    }));
    setRefreshTrigger(prev => prev + 1);
    console.log('⚙️ Configuración actualizada:', updatedConfig);
  };

  // Listener para cambios en tiempo real
  useEffect(() => {
    const handleContentChange = (event: any) => {
      const { type, data } = event.detail;
      
      if (type === 'categories' && Array.isArray(data)) {
        setCategories(data);
      } else if (type === 'content' && Array.isArray(data)) {
        setInternalContentItems(data);
      } else if (type === 'categoryOrder' && Array.isArray(data)) {
        setCategoryOrder(data);
      } else if (type === 'systemConfig' && typeof data === 'object') {
        setSystemConfig(prev => ({ ...prev, ...data }));
      }
      
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('contentDataChanged', handleContentChange);

    return () => {
      window.removeEventListener('contentDataChanged', handleContentChange);
    };
  }, []);

  // Listener para cambios en localStorage (múltiples pestañas)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'universidadSunshine_categories' && event.newValue) {
        try {
          const newCategories = JSON.parse(event.newValue);
          if (Array.isArray(newCategories)) {
            setCategories(newCategories);
            setRefreshTrigger(prev => prev + 1);
          }
        } catch (error) {
          console.warn('Error parsing categories from storage change');
        }
      } else if (event.key === 'universidadSunshine_content' && event.newValue) {
        try {
          const newContent = JSON.parse(event.newValue);
          if (Array.isArray(newContent)) {
            setInternalContentItems(newContent);
            setRefreshTrigger(prev => prev + 1);
          }
        } catch (error) {
          console.warn('Error parsing content from storage change');
        }
      } else if (event.key === 'universidadSunshine_categoryOrder' && event.newValue) {
        try {
          const newOrder = JSON.parse(event.newValue);
          if (Array.isArray(newOrder)) {
            setCategoryOrder(newOrder);
            setRefreshTrigger(prev => prev + 1);
          }
        } catch (error) {
          console.warn('Error parsing category order from storage change');
        }
      } else if (event.key === 'universidadSunshine_systemConfig' && event.newValue) {
        try {
          const newConfig = JSON.parse(event.newValue);
          if (typeof newConfig === 'object') {
            setSystemConfig(prev => ({ ...prev, ...newConfig }));
            setRefreshTrigger(prev => prev + 1);
          }
        } catch (error) {
          console.warn('Error parsing system config from storage change');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('🔄 useContentData - Estado actualizado:', {
      categorias: categories.length,
      contenidos: contentItems.length,
      refreshTrigger
    });
  }, [refreshTrigger, categories, contentItems]);

  return {
    categories,
    contentItems,
    categoryOrder,
    systemConfig,
    setCategories: updateCategories,
    setContentItems: updateContentItems,
    updateCategoryOrder,
    updateSystemConfig,
    refreshTrigger,
    getContentForCountry,
    getCategoriesForCountry,
    getSectionsForCountry,
    getContentStats,
    getContentByCategory,
    getContentBySection,
    isContentActive
  };
}