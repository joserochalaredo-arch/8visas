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
  // Campos de familia
  family_group_id?: string | null
  family_group_name?: string | null
  family_role?: 'main' | 'spouse' | 'child' | 'parent' | 'other' | null
  // Campos adicionales para compatibilidad con el dashboard existente
  token: string
  clientName: string
  clientEmail: string
  isActive: boolean
  formProgress: number
  lastActivity: string
  admin_comments?: string[]
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
        .select('*, admin_comments')
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
          
          // Extraer información de familia del campo observaciones_adicionales
          let familyInfo = null
          if (client.observaciones_adicionales && client.observaciones_adicionales.startsWith('FAMILIA:')) {
            try {
              const familyJson = client.observaciones_adicionales.replace('FAMILIA:', '')
              familyInfo = JSON.parse(familyJson)
            } catch (e) {
              console.warn('⚠️ Error parseando info de familia:', e)
            }
          }
          
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
            // Campos de familia
            family_group_id: familyInfo?.family_group_id || null,
            family_group_name: familyInfo?.family_group_name || null,
            family_role: familyInfo?.family_role || null,
            // Campos mapeados para compatibilidad
            token: client.form_token || '',
            clientName: client.client_name || '',
            clientEmail: client.client_email || '',
            isActive: client.status !== 'cancelled',
            formProgress: client.progress_percentage || 0,
            lastActivity: client.updated_at || client.created_at || new Date().toISOString(),
            // Comentarios de administrador
            admin_comments: client.admin_comments || []
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
  const generateClientToken = async (
    clientName: string, 
    clientEmail: string, 
    clientPhone: string, 
    familyOptions?: {
      familyGroupId?: string,
      familyGroupName?: string,
      familyRole?: 'main' | 'spouse' | 'child' | 'parent' | 'other'
    }
  ): Promise<string> => {
    const token = Math.random().toString(36).substring(2, 10).toUpperCase()
    
    try {
      const insertData: any = {
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
      }

      // Agregar información de familia si se proporciona
      if (familyOptions) {
        if (familyOptions.familyGroupId) {
          insertData.family_group_id = familyOptions.familyGroupId
        }
        if (familyOptions.familyGroupName) {
          insertData.family_group_name = familyOptions.familyGroupName
        }
        if (familyOptions.familyRole) {
          insertData.family_role = familyOptions.familyRole
        }
      }

      const { data, error } = await supabase
        .from('ds160_forms')
        .insert(insertData)
        .select('id')
        .single()

      if (error) {
        console.error('Error creando cliente:', error)
        throw error
      }

      console.log('✅ Cliente creado en Supabase:', token, familyOptions ? 'con familia' : 'sin familia')
      
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

  // Función para agregar comentario a cliente
  const addClientComment = async (token: string, comment: string, commentType: string = 'general') => {
    try {
      // Primero obtenemos los comentarios actuales
      const { data: currentData, error: fetchError } = await supabase
        .from('ds160_forms')
        .select('admin_comments')
        .eq('form_token', token)
        .single()

      if (fetchError) {
        console.error('Error obteniendo comentarios actuales:', fetchError)
        throw fetchError
      }

      // Crear nuevo comentario con fecha
      const timestamp = new Date().toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      const newComment = `${timestamp} - ${comment}`
      const currentComments = currentData?.admin_comments || []
      const updatedComments = [...currentComments, newComment]

      // Actualizar con el nuevo comentario
      const { error } = await supabase
        .from('ds160_forms')
        .update({ 
          admin_comments: updatedComments,
          updated_at: new Date().toISOString()
        })
        .eq('form_token', token)

      if (error) {
        console.error('Error agregando comentario:', error)
        throw error
      }

      console.log('✅ Comentario agregado:', token, comment)
      
      // Recargar clientes
      await loadClients()
    } catch (error) {
      console.error('Error en addClientComment:', error)
      throw error
    }
  }

  // Función para obtener comentarios de cliente
  const getClientComments = async (token: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('ds160_forms')
        .select('admin_comments')
        .eq('form_token', token)
        .single()

      if (error) {
        console.error('Error obteniendo comentarios:', error)
        return []
      }

      if (!data?.admin_comments || !Array.isArray(data.admin_comments)) {
        return []
      }

      // Retornar comentarios en orden inverso (más recientes primero)
      return [...data.admin_comments].reverse()
    } catch (error) {
      console.error('Error en getClientComments:', error)
      return []
    }
  }

  // Función para crear un grupo familiar
  const createFamilyGroup = (familyName: string): string => {
    return `FAMILY_${familyName.replace(/\s+/g, '_').toUpperCase()}_${Date.now().toString().slice(-6)}`
  }

  // Función para crear formulario DS-160 independiente para familiar
  const createFamilyMemberRecord = async (familyGroupId: string, familyGroupName: string, memberName: string, memberRole: 'spouse' | 'child' | 'parent' | 'other') => {
    console.log('👥 createFamilyMemberRecord - Creando formulario DS-160 independiente para:', { familyGroupId, familyGroupName, memberName, memberRole })
    
    try {
      // Crear un token DS-160 REAL y único para cada familiar
      const memberToken = Math.random().toString(36).substring(2, 10).toUpperCase()
      
      const familyInfo = {
        family_group_id: familyGroupId,
        family_group_name: familyGroupName,
        family_role: memberRole
      }
      
      const { data, error } = await supabase
        .from('ds160_forms')
        .insert({
          form_token: memberToken,
          client_name: memberName,
          client_email: '', // Se puede llenar después individualmente
          client_phone: '', // Se puede llenar después individualmente
          status: 'draft',
          current_step: 1, // Formulario real listo para completar
          progress_percentage: 0,
          payment_status: 'pending',
          observaciones_adicionales: `FAMILIA: ${JSON.stringify(familyInfo)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()

      if (error) {
        console.error('❌ Error en Supabase al crear formulario DS-160 para familiar:', error)
        throw error
      }

      console.log('✅ Formulario DS-160 independiente creado para familiar:', { memberName, memberToken, data })
      return memberToken
      
    } catch (error) {
      console.error('💥 Error en createFamilyMemberRecord:', error)
      throw error
    }
  }

  // Función para obtener miembros de una familia
  const getFamilyMembers = async (familyGroupId: string): Promise<DS160ClientData[]> => {
    try {
      const familyMembers = clients.filter(client => client.family_group_id === familyGroupId)
      return familyMembers
    } catch (error) {
      console.error('Error obteniendo miembros de familia:', error)
      return []
    }
  }

  // Función para agregar miembro a familia existente
  const addClientToFamily = async (token: string, familyGroupId: string, familyRole: 'main' | 'spouse' | 'child' | 'parent' | 'other', familyGroupName?: string) => {
    console.log('🏠 addClientToFamily - Iniciando:', { token, familyGroupId, familyRole, familyGroupName })
    
    try {
      // Obtener información del grupo familiar
      const familyData = clients.find(c => c.family_group_id === familyGroupId)
      const finalFamilyGroupName = familyGroupName || familyData?.family_group_name || 'Familia'
      
      console.log('📋 Datos para actualizar:', {
        family_group_id: familyGroupId,
        family_group_name: finalFamilyGroupName,
        family_role: familyRole
      })

      // Usar observaciones_adicionales como campo temporal para familia
      const familyInfo = {
        family_group_id: familyGroupId,
        family_group_name: finalFamilyGroupName,
        family_role: familyRole
      }
      
      const { data, error } = await supabase
        .from('ds160_forms')
        .update({ 
          observaciones_adicionales: `FAMILIA: ${JSON.stringify(familyInfo)}`,
          updated_at: new Date().toISOString()
        })
        .eq('form_token', token)
        .select()

      if (error) {
        console.error('❌ Error en Supabase al agregar cliente a familia:', error)
        throw error
      }

      console.log('✅ Cliente agregado a familia exitosamente:', { token, familyGroupId, data })
      
      // Recargar clientes
      await loadClients()
    } catch (error) {
      console.error('💥 Error en addClientToFamily:', error)
      throw error
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

    // Funciones de comentarios
    addClientComment,
    getClientComments,

    // Funciones de familia
    createFamilyGroup,
    getFamilyMembers,
    addClientToFamily,
    createFamilyMemberRecord,

    // Función de utilidad para obtener todos los clientes (compatibilidad)
    getAllClients: () => clients
  }
}