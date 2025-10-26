/**
 * Configuración del Cliente Supabase para A8Visas DS-160 System
 * 
 * Este archivo configura la conexión con Supabase para:
 * - Autenticación de administradores
 * - Operaciones de base de datos (CRUD)
 * - Almacenamiento de documentos PDF
 * - Gestión de sesiones
 * 
 * @version 2.1.0
 * @updated Octubre 2025
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Validar que las variables de entorno estén presentes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL no está definida en las variables de entorno')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida en las variables de entorno')
}

// ============================================================================
// CLIENTE PÚBLICO (Para uso en el frontend)
// ============================================================================
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'a8visas-ds160-system'
    }
  }
})

// ============================================================================
// CLIENTE ADMINISTRATIVO (Para uso en el backend/API routes)
// ============================================================================
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'a8visas-ds160-admin'
        }
      }
    })
  : null

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================
export type SupabaseClient = typeof supabase
export type SupabaseAdminClient = typeof supabaseAdmin

// Tipos para las tablas principales
export type Client = Database['public']['Tables']['clients']['Row']
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type ClientUpdate = Database['public']['Tables']['clients']['Update']

export type Form = Database['public']['Tables']['forms']['Row']
export type FormInsert = Database['public']['Tables']['forms']['Insert']
export type FormUpdate = Database['public']['Tables']['forms']['Update']

export type FormComment = Database['public']['Tables']['form_comments']['Row']
export type FormCommentInsert = Database['public']['Tables']['form_comments']['Insert']

export type Payment = Database['public']['Tables']['payments']['Row']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Verifica si el cliente de Supabase está correctamente configurado
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey)
}

/**
 * Verifica si el cliente administrativo está disponible
 */
export const isSupabaseAdminAvailable = (): boolean => {
  return !!(supabaseAdmin && supabaseServiceRoleKey)
}

/**
 * Obtiene la URL pública de un archivo en el storage
 */
export const getPublicUrl = (bucket: string, filePath: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
  return data.publicUrl
}

/**
 * Obtiene una URL firmada para descargar un archivo privado
 */
export const getSignedUrl = async (
  bucket: string, 
  filePath: string, 
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn)
    
    if (error) {
      console.error('Error creando URL firmada:', error)
      return null
    }
    
    return data.signedUrl
  } catch (error) {
    console.error('Error obteniendo URL firmada:', error)
    return null
  }
}

/**
 * Sube un archivo al storage de Supabase
 */
export const uploadFile = async (
  bucket: string,
  filePath: string,
  file: File | Blob,
  options?: {
    cacheControl?: string
    contentType?: string
    upsert?: boolean
  }
) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: options?.cacheControl || '3600',
        contentType: options?.contentType || file.type,
        upsert: options?.upsert || false
      })
    
    if (error) {
      console.error('Error subiendo archivo:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error en uploadFile:', error)
    return { data: null, error }
  }
}

/**
 * Elimina un archivo del storage
 */
export const deleteFile = async (bucket: string, filePaths: string[]) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(filePaths)
    
    if (error) {
      console.error('Error eliminando archivo:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error en deleteFile:', error)
    return { data: null, error }
  }
}

// ============================================================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================================================

/**
 * Autentica un usuario administrador
 */
export const signInAdmin = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('Error en autenticación:', error)
      return { user: null, session: null, error }
    }
    
    return { user: data.user, session: data.session, error: null }
  } catch (error) {
    console.error('Error en signInAdmin:', error)
    return { user: null, session: null, error }
  }
}

/**
 * Cierra la sesión del usuario actual
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Error cerrando sesión:', error)
      return { error }
    }
    
    return { error: null }
  } catch (error) {
    console.error('Error en signOut:', error)
    return { error }
  }
}

/**
 * Obtiene la sesión actual del usuario
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error obteniendo sesión:', error)
      return { session: null, error }
    }
    
    return { session: data.session, error: null }
  } catch (error) {
    console.error('Error en getCurrentSession:', error)
    return { session: null, error }
  }
}

/**
 * Obtiene el usuario actual
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error obteniendo usuario:', error)
      return { user: null, error }
    }
    
    return { user: data.user, error: null }
  } catch (error) {
    console.error('Error en getCurrentUser:', error)
    return { user: null, error }
  }
}

// ============================================================================
// LISTENER DE CAMBIOS DE AUTENTICACIÓN
// ============================================================================

/**
 * Configura un listener para cambios en el estado de autenticación
 */
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}

// ============================================================================
// CONFIGURACIÓN DE DESARROLLO
// ============================================================================

if (process.env.NODE_ENV === 'development') {
  // Habilitar logging detallado en desarrollo
  console.log('🔧 Supabase configurado:', {
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    hasServiceKey: !!supabaseServiceRoleKey,
    adminAvailable: isSupabaseAdminAvailable()
  })
}

// Exportar cliente por defecto
export default supabase