'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface DS160ClientData {
  id: number
  form_token: string
  client_name: string
  client_email?: string | null
  client_phone?: string | null
  status: string
  current_step: number
  completed_at?: string | null
  progress_percentage: number
  payment_status: string
  created_at: string
  updated_at: string
  // Campos adicionales para compatibilidad con el dashboard existente
  token: string
  clientName: string
  clientEmail: string
  isActive: boolean
  formProgress: number
  lastActivity: string
}

export interface AdminAuth {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
}

export function useAdminSupabase() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [clients, setClients] = useState<DS160ClientData[]>([])
  const [loading, setLoading] = useState(false)

  // Contraseña de administrador (en producción debería estar en variables de entorno)
  const ADMIN_PASSWORD = 'admin123'

  // Función de login
  const adminLogin = (password: string): boolean => {
    console.log('🔑 adminLogin llamado con contraseña:', password)
    console.log('🔑 Contraseña esperada:', ADMIN_PASSWORD)
    console.log('🔑 Comparación:', password === ADMIN_PASSWORD)
    
    if (password === ADMIN_PASSWORD) {
      console.log('✅ Contraseña correcta, autenticando...')
      setIsAuthenticated(true)
      // Guardar en localStorage para persistir la sesión
      localStorage.setItem('admin-authenticated', 'true')
      console.log('✅ Estado guardado en localStorage')
      return true
    }
    console.log('❌ Contraseña incorrecta')
    return false
  }

  // Función de logout
  const adminLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('admin-authenticated')
  }

  // Verificar autenticación al cargar
  useEffect(() => {
    console.log('🔍 Verificando autenticación almacenada...')
    const storedAuth = localStorage.getItem('admin-authenticated')
    console.log('🔍 Valor en localStorage:', storedAuth)
    const isAuth = storedAuth === 'true'
    console.log('🔍 Estado de autenticación:', isAuth)
    setIsAuthenticated(isAuth)
    setIsInitialized(true)
  }, [])

  // Función para cargar clientes desde Supabase
  const loadClients = async () => {
    setLoading(true)
    try {
      console.log('🔄 Cargando clientes desde Supabase...')
      
      // Leer directamente de la tabla principal (más confiable)
      const { data, error } = await supabase
        .from('ds160_forms')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('❌ Error cargando clientes:', error)
        console.error('❌ Detalles:', error.message)
        return
      }

      console.log('📋 Datos obtenidos de Supabase:', data?.length || 0, 'registros')

      // Mapear datos para compatibilidad con el dashboard existente
      const mappedClients: DS160ClientData[] = (data || [])
        .filter(client => client.id !== null)
        .map((client) => {
          console.log('🔄 Mapeando cliente:', client.id, client.client_name, client.form_token)
          return {
            id: client.id!,
            form_token: client.form_token || '',
            client_name: client.client_name || '',
            client_email: client.client_email || null,
            client_phone: client.client_phone || null,
            status: client.status || 'draft',
            current_step: client.current_step || 1,
            completed_at: client.completed_at || null,
            progress_percentage: client.progress_percentage || 0,
            payment_status: client.payment_status || 'pending',
            created_at: client.created_at || new Date().toISOString(),
            updated_at: client.updated_at || new Date().toISOString(),
            // Campos mapeados para compatibilidad
            token: client.form_token || '',
            clientName: client.client_name || '',
            clientEmail: client.client_email || '',
            isActive: client.status !== 'cancelled',
            formProgress: client.progress_percentage || 0,
            lastActivity: client.updated_at || client.created_at || new Date().toISOString()
          }
        })

      setClients(mappedClients)
      console.log('✅ Clientes cargados y mapeados:', mappedClients.length)
      console.log('📊 Primer cliente:', mappedClients[0])
    } catch (error) {
      console.error('Error en loadClients:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar clientes cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadClients()
    }
  }, [isAuthenticated])

  // Función para generar nuevo token de cliente
  const generateClientToken = async (clientName: string, clientEmail: string, clientPhone: string): Promise<string> => {
    const token = Math.random().toString(36).substring(2, 10).toUpperCase()
    
    try {
      const { data, error } = await supabase
        .from('ds160_forms')
        .insert({
          form_token: token,
          client_name: clientName,
          client_email: clientEmail || null,
          client_phone: clientPhone || null,
          status: 'draft',
          current_step: 1,
          progress_percentage: 0,
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error creando cliente:', error)
        throw error
      }

      console.log('✅ Cliente creado en Supabase:', token)
      
      // Recargar clientes
      await loadClients()
      
      return token
    } catch (error) {
      console.error('Error en generateClientToken:', error)
      throw error
    }
  }

  // Función para actualizar estado de pago
  const updatePaymentStatus = async (token: string, status: string) => {
    try {
      const { error } = await supabase
        .from('ds160_forms')
        .update({ 
          payment_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('form_token', token)

      if (error) {
        console.error('Error actualizando estado de pago:', error)
        throw error
      }

      console.log('✅ Estado de pago actualizado:', token, status)
      
      // Recargar clientes
      await loadClients()
    } catch (error) {
      console.error('Error en updatePaymentStatus:', error)
    }
  }

  // Función para activar token
  const activateToken = async (token: string) => {
    try {
      const { error } = await supabase
        .from('ds160_forms')
        .update({ 
          status: 'draft',
          updated_at: new Date().toISOString()
        })
        .eq('form_token', token)

      if (error) {
        console.error('Error activando token:', error)
        throw error
      }

      console.log('✅ Token activado:', token)
      
      // Recargar clientes
      await loadClients()
    } catch (error) {
      console.error('Error en activateToken:', error)
    }
  }

  // Función para desactivar token
  const deactivateToken = async (token: string) => {
    try {
      const { error } = await supabase
        .from('ds160_forms')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('form_token', token)

      if (error) {
        console.error('Error desactivando token:', error)
        throw error
      }

      console.log('✅ Token desactivado:', token)
      
      // Recargar clientes
      await loadClients()
    } catch (error) {
      console.error('Error en deactivateToken:', error)
    }
  }

  // Función para eliminar cliente
  const deleteClient = async (token: string) => {
    try {
      const { error } = await supabase
        .from('ds160_forms')
        .delete()
        .eq('form_token', token)

      if (error) {
        console.error('Error eliminando cliente:', error)
        throw error
      }

      console.log('✅ Cliente eliminado:', token)
      
      // Recargar clientes
      await loadClients()
    } catch (error) {
      console.error('Error en deleteClient:', error)
    }
  }

  // Función para obtener cliente por token
  const getClientByToken = (token: string): DS160ClientData | undefined => {
    return clients.find(client => client.form_token === token && client.isActive)
  }

  // Función para marcar formulario como completado
  const markFormAsCompleted = async (token: string) => {
    try {
      const { error } = await supabase
        .from('ds160_forms')
        .update({ 
          status: 'completed',
          progress_percentage: 100,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('form_token', token)

      if (error) {
        console.error('Error marcando formulario como completado:', error)
        throw error
      }

      console.log('✅ Formulario marcado como completado:', token)
      
      // Recargar clientes
      await loadClients()
    } catch (error) {
      console.error('Error en markFormAsCompleted:', error)
    }
  }

  return {
    // Estado de autenticación
    isAdminAuthenticated: isAuthenticated,
    isInitialized,
    adminLogin,
    adminLogout,

    // Estado de clientes
    clients,
    loading,
    loadClients,

    // Funciones de gestión de clientes
    generateClientToken,
    updatePaymentStatus,
    activateToken,
    deactivateToken,
    deleteClient,
    getClientByToken,
    markFormAsCompleted,

    // Función de utilidad para obtener todos los clientes (compatibilidad)
    getAllClients: () => clients
  }
}