/**
 * Funciones de Base de Datos para A8Visas DS-160 System
 * 
 * Este archivo contiene todas las funciones para interactuar con Supabase:
 * - CRUD operations para clientes
 * - Gestión de formularios DS-160
 * - Manejo de pagos y comentarios
 * - Generación de reportes y estadísticas
 * 
 * @version 2.1.0
 * @updated Octubre 2025
 */

import { supabase, supabaseAdmin } from '@/lib/supabase'
import { 
  ClientRow, 
  FormRow, 
  ClientInsert, 
  ClientUpdate, 
  FormInsert, 
  FormUpdate,
  FormCommentInsert,
  PaymentInsert,
  PaymentUpdate,
  ClientWithDetails,
  DashboardStatistics,
  ClientFilters,
  PaginatedResult,
  DatabaseResult,
  DS160FormData
} from '@/types/database'

// ============================================================================
// FUNCIONES DE CLIENTES
// ============================================================================

/**
 * Obtiene todos los clientes con paginación y filtros
 */
export async function getClients(
  filters: ClientFilters = {}
): Promise<DatabaseResult<PaginatedResult<ClientWithDetails>>> {
  try {
    const {
      status,
      formStatus,
      paymentStatus,
      dateFrom,
      dateTo,
      searchTerm,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = filters

    let query = supabase
      .from('client_dashboard')
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (status) {
      query = query.eq('client_status', status)
    }

    if (formStatus) {
      query = query.eq('form_status', formStatus)
    }

    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus)
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    if (searchTerm) {
      query = query.or(`client_name.ilike.%${searchTerm}%,client_email.ilike.%${searchTerm}%,token.ilike.%${searchTerm}%`)
    }

    // Ordenación
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Paginación
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Error obteniendo clientes:', error)
      return { data: null, error: error.message, success: false }
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return {
      data: {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      error: null,
      success: true
    }
  } catch (error) {
    console.error('Error en getClients:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Error desconocido', 
      success: false 
    }
  }
}

/**
 * Obtiene un cliente por su token
 */
export async function getClientByToken(token: string): Promise<DatabaseResult<ClientWithDetails | null>> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        forms (*),
        payments (*),
        form_comments (*),
        pdf_documents (*)
      `)
      .eq('token', token)
      .single()

    if (error) {
      console.error('Error obteniendo cliente por token:', error)
      return { data: null, error: error.message, success: false }
    }

    return { data, error: null, success: true }
  } catch (error) {
    console.error('Error en getClientByToken:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Error desconocido', 
      success: false 
    }
  }
}

/**
 * Crea un nuevo cliente
 */
export async function createClient(clientData: ClientInsert): Promise<DatabaseResult<ClientRow>> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single()

    if (error) {
      console.error('Error creando cliente:', error)
      return { data: null, error: error.message, success: false }
    }

    return { data, error: null, success: true }
  } catch (error) {
    console.error('Error en createClient:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Error desconocido', 
      success: false 
    }
  }
}

/**
 * Actualiza un cliente existente
 */
export async function updateClient(id: string, updates: ClientUpdate): Promise<DatabaseResult<ClientRow>> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error actualizando cliente:', error)
      return { data: null, error: error.message, success: false }
    }

    return { data, error: null, success: true }
  } catch (error) {
    console.error('Error en updateClient:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Error desconocido', 
      success: false 
    }
  }
}

/**
 * Elimina un cliente y todos sus datos relacionados
 */
export async function deleteClient(id: string): Promise<DatabaseResult<boolean>> {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error eliminando cliente:', error)
      return { data: false, error: error.message, success: false }
    }

    return { data: true, error: null, success: true }
  } catch (error) {
    console.error('Error en deleteClient:', error)
    return { 
      data: false, 
      error: error instanceof Error ? error.message : 'Error desconocido', 
      success: false 
    }
  }
}

/**
 * Genera un token único para un cliente
 */
export function generateClientToken(): string {
  const prefix = 'A8V'
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

// ============================================================================
// FUNCIONES DE FORMULARIOS
// ============================================================================

/**
 * Obtiene el formulario de un cliente
 */
export async function getFormByClientId(clientId: string): Promise<DatabaseResult<FormRow | null>> {
  try {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('client_id', clientId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
      console.error('Error obteniendo formulario:', error)
      return { data: null, error: error.message, success: false }
    }

    return { data: data || null, error: null, success: true }
  } catch (error) {
    console.error('Error en getFormByClientId:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Error desconocido', 
      success: false 
    }
  }
}

/**
 * Crea un nuevo formulario para un cliente
 */
export async function createForm(formData: FormInsert): Promise<DatabaseResult<FormRow>> {
  try {
    const { data, error } = await supabase
      .from('forms')
      .insert(formData)
      .select()
      .single()

    if (error) {
      console.error('Error creando formulario:', error)
      return { data: null, error: error.message, success: false }
    }

    return { data, error: null, success: true }
  } catch (error) {
    console.error('Error en createForm:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Error desconocido', 
      success: false 
    }
  }
}

/**
 * Actualiza un formulario existente
 */
export async function updateForm(id: string, updates: FormUpdate): Promise<DatabaseResult<FormRow>> {
  try {
    const { data, error } = await supabase
      .from('forms')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error actualizando formulario:', error)
      return { data: null, error: error.message, success: false }
    }

    return { data, error: null, success: true }
  } catch (error) {
    console.error('Error en updateForm:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Error desconocido', 
      success: false 
    }
  }
}

/**
 * Actualiza los datos del formulario DS-160
 */
export async function updateFormData(
  formId: string, 
  formData: Partial<DS160FormData>
): Promise<DatabaseResult<FormRow>> {
  try {
    // Obtener datos actuales
    const { data: currentForm, error: fetchError } = await supabase
      .from('forms')
      .select('form_data')
      .eq('id', formId)
      .single()

    if (fetchError) {
      return { data: null, error: fetchError.message, success: false }
    }

    // Combinar datos existentes con nuevos datos
    const existingData = (currentForm?.form_data as DS160FormData) || {}
    const updatedData = { ...existingData, ...formData }

    // Actualizar formulario
    const { data, error } = await supabase
      .from('forms')
      .update({ 
        form_data: updatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', formId)
      .select()
      .single()

    if (error) {
      console.error('Error actualizando datos del formulario:', error)
      return { data: null, error: error.message, success: false }
    }

    return { data, error: null, success: true }
  } catch (error) {
    console.error('Error en updateFormData:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Error desconocido', 
      success: false 
    }
  }
}

/**
 * Actualiza el progreso de un formulario
 */
export async function updateFormProgress(
  formId: string, 
  step: number, 
  progress: number
): Promise<DatabaseResult<FormRow>> {
  try {
    const updates: FormUpdate = {
      current_step: step,
      progress: Math.min(100, Math.max(0, progress)),
      updated_at: new Date().toISOString()
    }

    // Si el progreso es 100%, marcar como completado
    if (progress >= 100) {
      updates.status = 'completed'
      updates.completed_at = new Date().toISOString()
    }

    return await updateForm(formId, updates)
  } catch (error) {
    console.error('Error en updateFormProgress:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Error desconocido', 
      success: false 
    }
  }
}

// ============================================================================
// FUNCIONES DE COMENTARIOS
// ============================================================================

/**
 * Obtiene comentarios de un formulario
 */
export async function getFormComments(formId: string): Promise<DatabaseResult<any[]>> {
  try {
    const { data, error } = await supabase
      .from('form_comments')
      .select('*')
      .eq('form_id', formId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error obteniendo comentarios:', error)
      return { data: [], error: error.message, success: false }
    }

    return { data: data || [], error: null, success: true }
  } catch (error) {
    console.error('Error en getFormComments:', error)
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Error desconocido', 
      success: false 
    }
  }
}

/**
 * Agrega un comentario a un formulario
 */
export async function addFormComment(commentData: FormCommentInsert): Promise<DatabaseResult<any>> {
  try {
    const { data, error } = await supabase
      .from('form_comments')
      .insert(commentData)
      .select()
      .single()

    if (error) {
      console.error('Error agregando comentario:', error)
      return { data: null, error: error.message, success: false }
    }

    return { data, error: null, success: true }
  } catch (error) {
    console.error('Error en addFormComment:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Error desconocido', 
      success: false 
    }
  }
}

// ============================================================================
// FUNCIONES DE PAGOS
// ============================================================================

/**
 * Actualiza el estado de pago de un cliente
 */
export async function updatePaymentStatus(
  clientId: string, 
  paymentData: PaymentInsert | PaymentUpdate
): Promise<DatabaseResult<any>> {
  try {
    // Verificar si ya existe un registro de pago
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('client_id', clientId)
      .single()

    let result

    if (existingPayment) {
      // Actualizar pago existente
      const { data, error } = await supabase
        .from('payments')
        .update({ ...paymentData, updated_at: new Date().toISOString() })
        .eq('client_id', clientId)
        .select()
        .single()

      result = { data, error }
    } else {
      // Crear nuevo registro de pago
      const { data, error } = await supabase
        .from('payments')
        .insert({ ...paymentData, client_id: clientId })
        .select()
        .single()

      result = { data, error }
    }

    if (result.error) {
      console.error('Error actualizando estado de pago:', result.error)
      return { data: null, error: result.error.message, success: false }
    }

    return { data: result.data, error: null, success: true }
  } catch (error) {
    console.error('Error en updatePaymentStatus:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Error desconocido', 
      success: false 
    }
  }
}

// ============================================================================
// FUNCIONES DE ESTADÍSTICAS
// ============================================================================

/**
 * Obtiene estadísticas del dashboard
 */
export async function getDashboardStats(): Promise<DatabaseResult<DashboardStatistics>> {
  try {
    const { data, error } = await supabase
      .from('dashboard_stats')
      .select('*')
      .single()

    if (error) {
      console.error('Error obteniendo estadísticas:', error)
      return { 
        data: null, 
        error: error.message, 
        success: false 
      }
    }

    // Calcular estadísticas adicionales
    const { data: revenueData } = await supabase
      .from('payments')
      .select('amount')
      .eq('payment_status', 'paid')

    const totalRevenue = revenueData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

    const stats: DashboardStatistics = {
      totalClients: (data?.active_clients || 0) + (data?.completed_forms || 0),
      activeClients: data?.active_clients || 0,
      completedForms: data?.completed_forms || 0,
      inProgressForms: data?.in_progress_forms || 0,
      paidClients: data?.paid_clients || 0,
      pendingPayments: data?.pending_payments || 0,
      recentActivity: data?.active_last_24h || 0,
      recentComments: data?.comments_last_24h || 0,
      totalRevenue,
      averageCompletionTime: 0 // TODO: Calcular tiempo promedio de completación
    }

    return { data: stats, error: null, success: true }
  } catch (error) {
    console.error('Error en getDashboardStats:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Error desconocido', 
      success: false 
    }
  }
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Verifica si un token de cliente ya existe
 */
export async function tokenExists(token: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id')
      .eq('token', token)
      .single()

    return !error && !!data
  } catch {
    return false
  }
}

/**
 * Genera un token único que no existe en la base de datos
 */
export async function generateUniqueToken(): Promise<string> {
  let token: string
  let attempts = 0
  const maxAttempts = 10

  do {
    token = generateClientToken()
    attempts++
  } while (await tokenExists(token) && attempts < maxAttempts)

  if (attempts >= maxAttempts) {
    throw new Error('No se pudo generar un token único después de varios intentos')
  }

  return token
}

/**
 * Actualiza la última actividad de un cliente
 */
export async function updateClientActivity(clientId: string): Promise<void> {
  try {
    await supabase
      .from('clients')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', clientId)
  } catch (error) {
    console.error('Error actualizando actividad del cliente:', error)
  }
}

/**
 * Calcula el progreso de un formulario basado en los pasos completados
 */
export function calculateFormProgress(currentStep: number, totalSteps: number = 7): number {
  const baseProgress = Math.max(0, (currentStep - 1) / totalSteps * 100)
  return Math.min(100, Math.round(baseProgress))
}

/**
 * Valida los datos del formulario DS-160
 */
export function validateFormData(formData: Partial<DS160FormData>, step: number): string[] {
  const errors: string[] = []

  switch (step) {
    case 1:
      if (!formData.nombreCompleto) errors.push('Nombre completo es requerido')
      if (!formData.fechaNacimiento) errors.push('Fecha de nacimiento es requerida')
      if (!formData.ciudadCita) errors.push('Ciudad de cita consular es requerida')
      break
    case 2:
      if (!formData.correoElectronico) errors.push('Correo electrónico es requerido')
      break
    // Agregar más validaciones según sea necesario
  }

  return errors
}

// ============================================================================
// EXPORT ALL FUNCTIONS
// ============================================================================
export {
  // Funciones de clientes ya exportadas arriba
  // Funciones de formularios ya exportadas arriba  
  // Funciones de comentarios ya exportadas arriba
  // Funciones de pagos ya exportadas arriba
  // Funciones de estadísticas ya exportadas arriba
  // Funciones de utilidad ya exportadas arriba
}