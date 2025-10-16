import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase para modo producción
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar si las variables de entorno están configuradas
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseAnonKey !== 'your-anon-public-key-here';

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Tipos de datos
export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  section: string;
  subsection?: string;
  type: 'video' | 'pdf' | 'youtube' | 'link';
  url: string;
  duration?: string;
  size?: string;
  author?: string;
  countries: string[];
  status: 'borrador' | 'publicado';
  views: number;
  publish_start_date: string;
  publish_end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: Section[];
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  name: string;
  description: string;
  category_id: string;
  countries: string[];
  created_at: string;
  updated_at: string;
}

// Función para crear las tablas automáticamente
export const initializeDatabase = async () => {
  if (!supabase) {
    console.warn('Supabase no está configurado');
    return false;
  }

  console.log('🚀 Base de datos Universidad Sunshine - Configuración requerida');
  console.log('📋 Para que la aplicación funcione correctamente, necesitas crear las siguientes tablas en tu Supabase SQL Editor:');
  console.log('🔗 Ve a: https://kjasljwnrsoofzcwhrni.supabase.co/project/default/sql');
  console.log('');
  console.log('📝 Ejecuta este SQL:');
  console.log(`
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id TEXT NOT NULL,
  countries TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  section TEXT NOT NULL,
  subsection TEXT,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  duration TEXT,
  size TEXT,
  author TEXT,
  countries TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'borrador',
  views INTEGER DEFAULT 0,
  publish_start_date TIMESTAMPTZ NOT NULL,
  publish_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
  `);
  console.log('✅ Una vez ejecutado el SQL, recarga la página para usar la base de datos real');
  return true;
};

// Funciones de base de datos para contenidos
export const contentService = {
  // Crear nuevo contenido con validación anti-duplicados
  async create(content: Omit<ContentItem, 'id' | 'created_at' | 'updated_at' | 'views'>) {
    try {
      if (!supabase) {
        throw new Error('Supabase no está configurado');
      }

      // Verificar duplicados antes de crear
      const isDuplicate = await this.checkDuplicate(content.title, content.category, content.section);
      if (isDuplicate) {
        throw new Error('Ya existe un contenido con el mismo título en esta categoría y sección');
      }

      // Validar fechas
      if (content.publish_end_date && content.publish_start_date) {
        const startDate = new Date(content.publish_start_date);
        const endDate = new Date(content.publish_end_date);
        if (endDate <= startDate) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
      }

      const contentData = {
        ...content,
        views: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('content_items')
        .insert([contentData])
        .select()
        .single();

      if (error) {
        console.error('Error creating content:', error);
        throw new Error(`Error al crear contenido: ${error.message}`);
      }

      console.log('✅ Contenido creado exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error in contentService.create:', error);
      throw error;
    }
  },

  // Obtener todos los contenidos con filtros y búsqueda
  async getAll(filters?: {
    search?: string;
    category?: string;
    status?: string;
    country?: string;
  }) {
    try {
      if (!supabase) {
        throw new Error('Supabase no está configurado');
      }

      let query = supabase
        .from('content_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.search && filters.search.trim()) {
        const searchTerm = filters.search.trim();
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.country) {
        query = query.contains('countries', [filters.country]);
      }

      const { data, error } = await query;

      if (error) {
        // Si la tabla no existe, retornar array vacío en lugar de error
        if (error.code === 'PGRST205' || error.message.includes('Could not find the table') || error.message.includes('schema cache')) {
          console.warn('⚠️ Tabla content_items no existe en Supabase. Retornando datos vacíos.');
          return [];
        }
        console.error('Error fetching content:', error);
        throw new Error(`Error al obtener contenidos: ${error.message}`);
      }

      console.log(`📋 Contenidos obtenidos: ${(data || []).length} elementos`);
      return data || [];
    } catch (error) {
      // Si es un error de tabla no encontrada, retornar array vacío
      if (error instanceof Error && error.message.includes('Could not find the table')) {
        console.warn('⚠️ Tabla content_items no existe. Usando datos por defecto.');
        return [];
      }
      console.error('Error in contentService.getAll:', error);
      throw error;
    }
  },

  // Actualizar contenido
  async update(id: string, updates: Partial<ContentItem>) {
    try {
      if (!supabase) {
        throw new Error('Supabase no está configurado');
      }

      // Validar fechas si se están actualizando
      if (updates.publish_end_date && updates.publish_start_date) {
        const startDate = new Date(updates.publish_start_date);
        const endDate = new Date(updates.publish_end_date);
        if (endDate <= startDate) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
      }

      // Verificar duplicados si se está cambiando el título
      if (updates.title) {
        const isDuplicate = await this.checkDuplicate(
          updates.title, 
          updates.category || '', 
          updates.section || '', 
          id
        );
        if (isDuplicate) {
          throw new Error('Ya existe un contenido con el mismo título en esta categoría y sección');
        }
      }

      const { data, error } = await supabase
        .from('content_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating content:', error);
        throw new Error(`Error al actualizar contenido: ${error.message}`);
      }

      console.log('✅ Contenido actualizado exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error in contentService.update:', error);
      throw error;
    }
  },

  // Eliminar contenido
  async delete(id: string) {
    try {
      if (!supabase) {
        throw new Error('Supabase no está configurado');
      }

      const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting content:', error);
        throw new Error(`Error al eliminar contenido: ${error.message}`);
      }

      console.log('✅ Contenido eliminado exitosamente');
      return true;
    } catch (error) {
      console.error('Error in contentService.delete:', error);
      throw error;
    }
  },

  // Verificar duplicados
  async checkDuplicate(title: string, category: string, section: string, excludeId?: string) {
    try {
      if (!supabase) {
        return false;
      }

      let query = supabase
        .from('content_items')
        .select('id')
        .eq('title', title)
        .eq('category', category)
        .eq('section', section);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error checking duplicate:', error);
        return false;
      }

      return (data || []).length > 0;
    } catch (error) {
      console.error('Error in contentService.checkDuplicate:', error);
      return false;
    }
  }
};

// Funciones de base de datos para categorías
export const categoryService = {
  // Crear nueva categoría
  async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'sections'>) {
    try {
      if (!supabase) {
        throw new Error('Supabase no está configurado');
      }

      const categoryData = {
        ...category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        throw new Error(`Error al crear categoría: ${error.message}`);
      }

      console.log('✅ Categoría creada exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error in categoryService.create:', error);
      throw error;
    }
  },

  // Obtener todas las categorías con sus secciones
  async getAll() {
    try {
      if (!supabase) {
        throw new Error('Supabase no está configurado');
      }

      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (categoriesError) {
        // Si la tabla no existe, retornar array vacío en lugar de error
        if (categoriesError.code === 'PGRST205' || categoriesError.message.includes('Could not find the table')) {
          console.warn('⚠️ Tabla categories no existe en Supabase. Retornando datos vacíos.');
          return [];
        }
        console.error('Error fetching categories:', categoriesError);
        throw new Error(`Error al obtener categorías: ${categoriesError.message}`);
      }

      const { data: sections, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .order('created_at', { ascending: true });

      if (sectionsError) {
        // Si la tabla no existe, usar array vacío para secciones
        if (sectionsError.code === 'PGRST205' || sectionsError.message.includes('Could not find the table') || sectionsError.message.includes('schema cache')) {
          console.warn('⚠️ Tabla sections no existe en Supabase. Usando secciones vacías.');
          const categoriesWithSections = (categories || []).map(category => ({
            ...category,
            sections: []
          }));
          return categoriesWithSections;
        }
        console.error('Error fetching sections:', sectionsError);
        throw new Error(`Error al obtener secciones: ${sectionsError.message}`);
      }

      // Combinar categorías con sus secciones
      const categoriesWithSections = (categories || []).map(category => ({
        ...category,
        sections: (sections || []).filter(section => section.category_id === category.id)
      }));

      console.log(`📁 Categorías obtenidas: ${categoriesWithSections.length} elementos`);
      return categoriesWithSections;
    } catch (error) {
      // Si es un error de tabla no encontrada, retornar array vacío
      if (error instanceof Error && (error.message.includes('Could not find the table') || error.message.includes('schema cache'))) {
        console.warn('⚠️ Tablas no existen. Usando datos por defecto.');
        return [];
      }
      console.error('Error in categoryService.getAll:', error);
      throw error;
    }
  },

  // Actualizar categoría
  async update(id: string, updates: Partial<Category>) {
    try {
      if (!supabase) {
        throw new Error('Supabase no está configurado');
      }

      const { data, error } = await supabase
        .from('categories')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category:', error);
        throw new Error(`Error al actualizar categoría: ${error.message}`);
      }

      console.log('✅ Categoría actualizada exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error in categoryService.update:', error);
      throw error;
    }
  },

  // Eliminar categoría
  async delete(id: string) {
    try {
      if (!supabase) {
        throw new Error('Supabase no está configurado');
      }

      // Primero eliminar todas las secciones de la categoría
      await supabase
        .from('sections')
        .delete()
        .eq('category_id', id);

      // Luego eliminar todos los contenidos de la categoría
      await supabase
        .from('content_items')
        .delete()
        .eq('category', id);

      // Finalmente eliminar la categoría
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category:', error);
        throw new Error(`Error al eliminar categoría: ${error.message}`);
      }

      console.log('✅ Categoría eliminada exitosamente');
      return true;
    } catch (error) {
      console.error('Error in categoryService.delete:', error);
      throw error;
    }
  }
};

// Funciones de base de datos para secciones
export const sectionService = {
  // Crear nueva sección
  async create(section: Omit<Section, 'id' | 'created_at' | 'updated_at'>) {
    try {
      if (!supabase) {
        throw new Error('Supabase no está configurado');
      }

      const sectionData = {
        ...section,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('sections')
        .insert([sectionData])
        .select()
        .single();

      if (error) {
        console.error('Error creating section:', error);
        throw new Error(`Error al crear sección: ${error.message}`);
      }

      console.log('✅ Sección creada exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error in sectionService.create:', error);
      throw error;
    }
  },

  // Actualizar sección
  async update(id: string, updates: Partial<Section>) {
    try {
      if (!supabase) {
        throw new Error('Supabase no está configurado');
      }

      const { data, error } = await supabase
        .from('sections')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating section:', error);
        throw new Error(`Error al actualizar sección: ${error.message}`);
      }

      console.log('✅ Sección actualizada exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error in sectionService.update:', error);
      throw error;
    }
  },

  // Eliminar sección
  async delete(id: string) {
    try {
      if (!supabase) {
        throw new Error('Supabase no está configurado');
      }

      // Primero eliminar todos los contenidos de la sección
      await supabase
        .from('content_items')
        .delete()
        .eq('section', id);

      // Luego eliminar la sección
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting section:', error);
        throw new Error(`Error al eliminar sección: ${error.message}`);
      }

      console.log('✅ Sección eliminada exitosamente');
      return true;
    } catch (error) {
      console.error('Error in sectionService.delete:', error);
      throw error;
    }
  }
};