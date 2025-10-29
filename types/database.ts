/**
 * Tipos TypeScript para Base de Datos Supabase
 * A8Visas DS-160 System
 * 
 * Este archivo contiene todas las definiciones de tipos para:
 * - Esquema de base de datos
 * - Tablas y sus columnas
 * - Relaciones entre tablas
 * - Vistas y funciones
 * 
 * @generated Basado en supabase-schema.sql
 * @version 2.1.0
 * @updated Octubre 2025
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // ========================================================================
      // TABLA: clients
      // ========================================================================
      clients: {
        Row: {
          id: string
          token: string
          client_name: string
          client_email: string
          client_phone: string | null
          created_at: string
          updated_at: string
          is_active: boolean
          last_activity: string
          notes: string | null
          status: string
          created_by: string | null
        }
        Insert: {
          id?: string
          token: string
          client_name: string
          client_email: string
          client_phone?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          last_activity?: string
          notes?: string | null
          status?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          token?: string
          client_name?: string
          client_email?: string
          client_phone?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          last_activity?: string
          notes?: string | null
          status?: string
          created_by?: string | null
        }
        Relationships: []
      }
      
      // ========================================================================
      // TABLA: forms
      // ========================================================================
      forms: {
        Row: {
          id: string
          client_id: string
          status: string
          progress: number
          current_step: number
          started_at: string
          completed_at: string | null
          submitted_at: string | null
          updated_at: string
          form_data: Json
          version: number
          filled_by: string
          admin_notes: string | null
        }
        Insert: {
          id?: string
          client_id: string
          status?: string
          progress?: number
          current_step?: number
          started_at?: string
          completed_at?: string | null
          submitted_at?: string | null
          updated_at?: string
          form_data?: Json
          version?: number
          filled_by?: string
          admin_notes?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          status?: string
          progress?: number
          current_step?: number
          started_at?: string
          completed_at?: string | null
          submitted_at?: string | null
          updated_at?: string
          form_data?: Json
          version?: number
          filled_by?: string
          admin_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forms_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // ========================================================================
      // TABLA: ds160_forms - Nueva tabla para formularios DS-160
      // ========================================================================
      ds160_forms: {
        Row: {
          id: number
          form_token: string
          client_name: string
          client_email: string | null
          client_phone: string | null
          status: string
          current_step: number
          completed_at: string | null
          progress_percentage: number
          payment_status: string
          admin_comments: string[] | null
          created_at: string
          updated_at: string
          // Información personal
          apellidos: string | null
          nombres: string | null
          nombre_completo: string | null
          fecha_nacimiento: string | null
          ciudad_nacimiento: string | null
          estado_nacimiento: string | null
          pais_nacimiento: string | null
          nacionalidad: string | null
          otra_nacionalidad: string | null
          consulado_deseado: string | null
          oficina_cas: string | null
          // Información del pasaporte
          numero_pasaporte: string | null
          fecha_expedicion: string | null
          fecha_vencimiento: string | null
          // Información de contacto
          domicilio_casa: string | null
          telefono_casa: string | null
          celular: string | null
          correo_electronico: string | null
          estado_civil: string | null
          // Información laboral
          ocupacion_actual: string | null
          empleador: string | null
          salario_mensual: number | null
          direccion_trabajo: string | null
          telefono_trabajo: string | null
          // Información de viaje
          proposito_viaje: string | null
          fecha_llegada: string | null
          fecha_salida: string | null
          duracion_estancia: string | null
          direccion_usa: string | null
          nombre_patrocinador: string | null
          telefono_patrocinador: string | null
          domicilio_patrocinador: string | null
          parentesco: string | null
          quien_paga_viaje: string | null
          personas_que_viajan: string | null
          // Antecedentes
          ha_visitado_usa: string | null
          fechas_visitas_anteriores: string | null
          ha_sido_deportado: string | null
          detalles_deportacion: string | null
          le_han_negado_visa: string | null
          detalles_negacion_visa: string | null
          visas_anteriores: string | null
          // Familia
          nombre_padre: string | null
          fecha_nacimiento_padre: string | null
          nombre_madre: string | null
          fecha_nacimiento_madre: string | null
          familiares_en_usa: string | null
          detalles_familiares_usa: string | null
          tiene_hijos: string | null
          // Seguridad
          enfermedades_contagiosas: string | null
          detalles_enfermedades_contagiosas: string | null
          trastorno_mental_fisico: string | null
          detalles_trastorno_mental_fisico: string | null
          abuso_adiccion_drogas: string | null
          detalles_abuso_adiccion_drogas: string | null
          arrestos_crimenes: string | null
          detalles_arrestos: string | null
          sustancias_controladas: string | null
          detalles_sustancias_controladas: string | null
          prostitucion_trafico: string | null
          detalles_prostitucion_trafico: string | null
          actividades_terroristas: string | null
          detalles_actividades_terroristas: string | null
          actividades_espionaje: string | null
          detalles_actividades_espionaje: string | null
          genocidio_crimenes_guerra: string | null
          detalles_genocidio_crimenes_guerra: string | null
          inmigracion_irregular: string | null
          detalles_inmigracion_irregular: string | null
          // Adicionales
          observaciones_adicionales: string | null
          ha_extraviado_visa: string | null
          ha_extraviado_pasaporte: string | null
          detalles_adicionales: string | null
          cita_cas: string | null
          ciudad_cita: string | null
          trabajos_anteriores: Json | null
          informacion_hijos: Json | null
          documentos_adjuntos: string[] | null
        }
        Insert: {
          id?: number
          form_token: string
          client_name: string
          client_email?: string | null
          client_phone?: string | null
          status?: string
          current_step?: number
          completed_at?: string | null
          progress_percentage?: number
          payment_status?: string
          admin_comments?: string[] | null
          created_at?: string
          updated_at?: string
          // Todos los demás campos opcionales...
          apellidos?: string | null
          nombres?: string | null
          nombre_completo?: string | null
          fecha_nacimiento?: string | null
          ciudad_nacimiento?: string | null
          estado_nacimiento?: string | null
          pais_nacimiento?: string | null
          nacionalidad?: string | null
          otra_nacionalidad?: string | null
          consulado_deseado?: string | null
          oficina_cas?: string | null
          numero_pasaporte?: string | null
          fecha_expedicion?: string | null
          fecha_vencimiento?: string | null
          domicilio_casa?: string | null
          telefono_casa?: string | null
          celular?: string | null
          correo_electronico?: string | null
          estado_civil?: string | null
          ocupacion_actual?: string | null
          empleador?: string | null
          salario_mensual?: number | null
          direccion_trabajo?: string | null
          telefono_trabajo?: string | null
          proposito_viaje?: string | null
          fecha_llegada?: string | null
          fecha_salida?: string | null
          duracion_estancia?: string | null
          direccion_usa?: string | null
          nombre_patrocinador?: string | null
          telefono_patrocinador?: string | null
          domicilio_patrocinador?: string | null
          parentesco?: string | null
          quien_paga_viaje?: string | null
          personas_que_viajan?: string | null
          ha_visitado_usa?: string | null
          fechas_visitas_anteriores?: string | null
          ha_sido_deportado?: string | null
          detalles_deportacion?: string | null
          le_han_negado_visa?: string | null
          detalles_negacion_visa?: string | null
          visas_anteriores?: string | null
          nombre_padre?: string | null
          fecha_nacimiento_padre?: string | null
          nombre_madre?: string | null
          fecha_nacimiento_madre?: string | null
          familiares_en_usa?: string | null
          detalles_familiares_usa?: string | null
          tiene_hijos?: string | null
          enfermedades_contagiosas?: string | null
          detalles_enfermedades_contagiosas?: string | null
          trastorno_mental_fisico?: string | null
          detalles_trastorno_mental_fisico?: string | null
          abuso_adiccion_drogas?: string | null
          detalles_abuso_adiccion_drogas?: string | null
          arrestos_crimenes?: string | null
          detalles_arrestos?: string | null
          sustancias_controladas?: string | null
          detalles_sustancias_controladas?: string | null
          prostitucion_trafico?: string | null
          detalles_prostitucion_trafico?: string | null
          actividades_terroristas?: string | null
          detalles_actividades_terroristas?: string | null
          actividades_espionaje?: string | null
          detalles_actividades_espionaje?: string | null
          genocidio_crimenes_guerra?: string | null
          detalles_genocidio_crimenes_guerra?: string | null
          inmigracion_irregular?: string | null
          detalles_inmigracion_irregular?: string | null
          observaciones_adicionales?: string | null
          ha_extraviado_visa?: string | null
          ha_extraviado_pasaporte?: string | null
          detalles_adicionales?: string | null
          cita_cas?: string | null
          ciudad_cita?: string | null
          trabajos_anteriores?: Json | null
          informacion_hijos?: Json | null
          documentos_adjuntos?: string[] | null
        }
        Update: {
          id?: number
          form_token?: string
          client_name?: string
          client_email?: string | null
          client_phone?: string | null
          status?: string
          current_step?: number
          completed_at?: string | null
          progress_percentage?: number
          payment_status?: string
          admin_comments?: string[] | null
          created_at?: string
          updated_at?: string
          // Todos los demás campos opcionales para actualización...
          apellidos?: string | null
          nombres?: string | null
          nombre_completo?: string | null
          fecha_nacimiento?: string | null
          ciudad_nacimiento?: string | null
          estado_nacimiento?: string | null
          pais_nacimiento?: string | null
          nacionalidad?: string | null
          otra_nacionalidad?: string | null
          consulado_deseado?: string | null
          oficina_cas?: string | null
          numero_pasaporte?: string | null
          fecha_expedicion?: string | null
          fecha_vencimiento?: string | null
          domicilio_casa?: string | null
          telefono_casa?: string | null
          celular?: string | null
          correo_electronico?: string | null
          estado_civil?: string | null
          ocupacion_actual?: string | null
          empleador?: string | null
          salario_mensual?: number | null
          direccion_trabajo?: string | null
          telefono_trabajo?: string | null
          proposito_viaje?: string | null
          fecha_llegada?: string | null
          fecha_salida?: string | null
          duracion_estancia?: string | null
          direccion_usa?: string | null
          nombre_patrocinador?: string | null
          telefono_patrocinador?: string | null
          domicilio_patrocinador?: string | null
          parentesco?: string | null
          quien_paga_viaje?: string | null
          personas_que_viajan?: string | null
          ha_visitado_usa?: string | null
          fechas_visitas_anteriores?: string | null
          ha_sido_deportado?: string | null
          detalles_deportacion?: string | null
          le_han_negado_visa?: string | null
          detalles_negacion_visa?: string | null
          visas_anteriores?: string | null
          nombre_padre?: string | null
          fecha_nacimiento_padre?: string | null
          nombre_madre?: string | null
          fecha_nacimiento_madre?: string | null
          familiares_en_usa?: string | null
          detalles_familiares_usa?: string | null
          tiene_hijos?: string | null
          enfermedades_contagiosas?: string | null
          detalles_enfermedades_contagiosas?: string | null
          trastorno_mental_fisico?: string | null
          detalles_trastorno_mental_fisico?: string | null
          abuso_adiccion_drogas?: string | null
          detalles_abuso_adiccion_drogas?: string | null
          arrestos_crimenes?: string | null
          detalles_arrestos?: string | null
          sustancias_controladas?: string | null
          detalles_sustancias_controladas?: string | null
          prostitucion_trafico?: string | null
          detalles_prostitucion_trafico?: string | null
          actividades_terroristas?: string | null
          detalles_actividades_terroristas?: string | null
          actividades_espionaje?: string | null
          detalles_actividades_espionaje?: string | null
          genocidio_crimenes_guerra?: string | null
          detalles_genocidio_crimenes_guerra?: string | null
          inmigracion_irregular?: string | null
          detalles_inmigracion_irregular?: string | null
          observaciones_adicionales?: string | null
          ha_extraviado_visa?: string | null
          ha_extraviado_pasaporte?: string | null
          detalles_adicionales?: string | null
          cita_cas?: string | null
          ciudad_cita?: string | null
          trabajos_anteriores?: Json | null
          informacion_hijos?: Json | null
          documentos_adjuntos?: string[] | null
        }
        Relationships: []
      }
      
      // ========================================================================
      // TABLA: ds160_step_progress - Progreso por pasos
      // ========================================================================
      ds160_step_progress: {
        Row: {
          id: number
          form_id: number
          step_number: number
          step_name: string | null
          completed_at: string
          step_data: Json | null
        }
        Insert: {
          id?: number
          form_id: number
          step_number: number
          step_name?: string | null
          completed_at?: string
          step_data?: Json | null
        }
        Update: {
          id?: number
          form_id?: number
          step_number?: number
          step_name?: string | null
          completed_at?: string
          step_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ds160_step_progress_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "ds160_forms"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // ========================================================================
      // TABLA: ds160_form_logs - Logs de actividad
      // ========================================================================
      ds160_form_logs: {
        Row: {
          id: number
          form_id: number
          action: string
          step_number: number | null
          old_data: Json | null
          new_data: Json | null
          created_at: string
        }
        Insert: {
          id?: number
          form_id: number
          action: string
          step_number?: number | null
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: number
          form_id?: number
          action?: string
          step_number?: number | null
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ds160_form_logs_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "ds160_forms"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // ========================================================================
      // TABLA: form_comments
      // ========================================================================
      form_comments: {
        Row: {
          id: string
          form_id: string
          client_id: string
          comment: string
          comment_type: string
          created_at: string
          created_by: string
          step_number: number | null
          is_important: boolean
          is_resolved: boolean
        }
        Insert: {
          id?: string
          form_id: string
          client_id: string
          comment: string
          comment_type?: string
          created_at?: string
          created_by: string
          step_number?: number | null
          is_important?: boolean
          is_resolved?: boolean
        }
        Update: {
          id?: string
          form_id?: string
          client_id?: string
          comment?: string
          comment_type?: string
          created_at?: string
          created_by?: string
          step_number?: number | null
          is_important?: boolean
          is_resolved?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "form_comments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_comments_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // ========================================================================
      // TABLA: payments
      // ========================================================================
      payments: {
        Row: {
          id: string
          client_id: string
          form_id: string | null
          payment_status: string
          payment_method: string | null
          amount: number | null
          currency: string
          payment_date: string | null
          due_date: string | null
          created_at: string
          updated_at: string
          payment_notes: string | null
          receipt_number: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          client_id: string
          form_id?: string | null
          payment_status?: string
          payment_method?: string | null
          amount?: number | null
          currency?: string
          payment_date?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
          payment_notes?: string | null
          receipt_number?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          form_id?: string | null
          payment_status?: string
          payment_method?: string | null
          amount?: number | null
          currency?: string
          payment_date?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
          payment_notes?: string | null
          receipt_number?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // ========================================================================
      // TABLA: form_history
      // ========================================================================
      form_history: {
        Row: {
          id: string
          form_id: string
          client_id: string
          action: string
          step_number: number | null
          old_data: Json | null
          new_data: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          ip_address: string | null
        }
        Insert: {
          id?: string
          form_id: string
          client_id: string
          action: string
          step_number?: number | null
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ip_address?: string | null
        }
        Update: {
          id?: string
          form_id?: string
          client_id?: string
          action?: string
          step_number?: number | null
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ip_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_history_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // ========================================================================
      // TABLA: pdf_documents
      // ========================================================================
      pdf_documents: {
        Row: {
          id: string
          form_id: string
          client_id: string
          document_type: string
          file_name: string
          file_path: string | null
          file_size: number | null
          status: string
          generated_at: string
          downloaded_at: string | null
          expires_at: string | null
          generated_by: string | null
          download_count: number
        }
        Insert: {
          id?: string
          form_id: string
          client_id: string
          document_type?: string
          file_name: string
          file_path?: string | null
          file_size?: number | null
          status?: string
          generated_at?: string
          downloaded_at?: string | null
          expires_at?: string | null
          generated_by?: string | null
          download_count?: number
        }
        Update: {
          id?: string
          form_id?: string
          client_id?: string
          document_type?: string
          file_name?: string
          file_path?: string | null
          file_size?: number | null
          status?: string
          generated_at?: string
          downloaded_at?: string | null
          expires_at?: string | null
          generated_by?: string | null
          download_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "pdf_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdf_documents_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    
    // ==========================================================================
    // VISTAS (Views)
    // ==========================================================================
    Views: {
      client_dashboard: {
        Row: {
          id: string | null
          token: string | null
          client_name: string | null
          client_email: string | null
          client_phone: string | null
          created_at: string | null
          client_status: string | null
          last_activity: string | null
          client_notes: string | null
          form_id: string | null
          form_status: string | null
          progress: number | null
          current_step: number | null
          form_started_at: string | null
          completed_at: string | null
          form_notes: string | null
          filled_by: string | null
          payment_status: string | null
          amount: number | null
          currency: string | null
          payment_date: string | null
          due_date: string | null
          comment_count: number | null
          document_count: number | null
        }
        Relationships: []
      }
      
      dashboard_stats: {
        Row: {
          active_clients: number | null
          completed_forms: number | null
          in_progress_forms: number | null
          paid_clients: number | null
          pending_payments: number | null
          active_last_24h: number | null
          comments_last_24h: number | null
        }
        Relationships: []
      }
      
      ds160_active_forms: {
        Row: {
          id: number | null
          form_token: string | null
          client_name: string | null
          client_email: string | null
          client_phone: string | null
          status: string | null
          payment_status: string | null
          current_step: number | null
          progress_percentage: number | null
          created_at: string | null
          updated_at: string | null
          completed_at: string | null
          days_since_created: number | null
          days_since_updated: number | null
          status_display: string | null
        }
        Relationships: []
      }
    }
    
    // ==========================================================================
    // FUNCIONES (Functions)
    // ==========================================================================
    Functions: {
      update_updated_at_column: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      log_form_changes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    
    // ==========================================================================
    // ENUMS
    // ==========================================================================
    Enums: {
      client_status: 'active' | 'inactive' | 'completed' | 'cancelled'
      form_status: 'in_progress' | 'completed' | 'cancelled' | 'submitted'
      payment_status: 'pending' | 'paid' | 'partial' | 'cancelled' | 'refunded'
      comment_type: 'general' | 'progress' | 'issue' | 'reminder' | 'completion'
      document_type: 'ds160_form' | 'summary' | 'receipt'
      document_status: 'generated' | 'downloaded' | 'expired'
      history_action: 'created' | 'updated' | 'completed' | 'step_completed' | 'commented'
    }
    
    // ==========================================================================
    // COMPOSITE TYPES
    // ==========================================================================
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ============================================================================
// TIPOS AUXILIARES Y DE CONVENIENCIA
// ============================================================================

// Tipos para las filas de las tablas
export type ClientRow = Database['public']['Tables']['clients']['Row']
export type FormRow = Database['public']['Tables']['forms']['Row']
export type FormCommentRow = Database['public']['Tables']['form_comments']['Row']
export type PaymentRow = Database['public']['Tables']['payments']['Row']
export type FormHistoryRow = Database['public']['Tables']['form_history']['Row']
export type PDFDocumentRow = Database['public']['Tables']['pdf_documents']['Row']

// Tipos para insertar datos
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type FormInsert = Database['public']['Tables']['forms']['Insert']
export type FormCommentInsert = Database['public']['Tables']['form_comments']['Insert']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type FormHistoryInsert = Database['public']['Tables']['form_history']['Insert']
export type PDFDocumentInsert = Database['public']['Tables']['pdf_documents']['Insert']

// Tipos para actualizar datos
export type ClientUpdate = Database['public']['Tables']['clients']['Update']
export type FormUpdate = Database['public']['Tables']['forms']['Update']
export type FormCommentUpdate = Database['public']['Tables']['form_comments']['Update']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']
export type FormHistoryUpdate = Database['public']['Tables']['form_history']['Update']
export type PDFDocumentUpdate = Database['public']['Tables']['pdf_documents']['Update']

// Tipos para las vistas
export type ClientDashboardView = Database['public']['Views']['client_dashboard']['Row']
export type DashboardStatsView = Database['public']['Views']['dashboard_stats']['Row']

// Tipos para los enums
export type ClientStatus = Database['public']['Enums']['client_status']
export type FormStatus = Database['public']['Enums']['form_status']
export type PaymentStatus = Database['public']['Enums']['payment_status']
export type CommentType = Database['public']['Enums']['comment_type']
export type DocumentType = Database['public']['Enums']['document_type']
export type DocumentStatus = Database['public']['Enums']['document_status']
export type HistoryAction = Database['public']['Enums']['history_action']

// ============================================================================
// TIPOS ESPECÍFICOS DEL DOMINIO
// ============================================================================

/**
 * Estructura de datos del formulario DS-160 almacenada en JSON
 */
export interface DS160FormData {
  // Información personal (Step 1)
  nombreCompleto?: string
  fechaNacimiento?: string
  ciudadNacimiento?: string
  paisNacimiento?: string
  nacionalidad?: string
  otraNacionalidad?: string
  numeroIdentificacion?: string
  numeroPasaporte?: string
  libretaMilitar?: string
  
  // Información de citas (Step 1)
  ciudadCita?: 'Tijuana' | 'Nogales' | 'Ciudad Juárez' | 'Nuevo Laredo' | 'Monterrey' | 'Matamoros' | 'Guadalajara' | 'Hermosillo' | 'Ciudad de México' | 'Mérida'
  citaCAS?: 'Tijuana' | 'Nogales' | 'Ciudad Juárez' | 'Nuevo Laredo' | 'Monterrey' | 'Matamoros' | 'Guadalajara' | 'Hermosillo' | 'Ciudad de México' | 'Mérida'
  
  // Información de contacto (Step 2)
  domicilio?: string
  telefonoCasa?: string
  celular?: string
  correoElectronico?: string
  redesSociales?: string
  
  // Información de viaje (Steps 3-7)
  [key: string]: any // Para otros campos del formulario
}

/**
 * Cliente con información completa (incluye formulario y pago)
 */
export interface ClientWithDetails extends ClientRow {
  form?: FormRow
  payment?: PaymentRow
  comments?: FormCommentRow[]
  documents?: PDFDocumentRow[]
}

/**
 * Estadísticas del dashboard
 */
export interface DashboardStatistics {
  totalClients: number
  activeClients: number
  completedForms: number
  inProgressForms: number
  paidClients: number
  pendingPayments: number
  recentActivity: number
  recentComments: number
  totalRevenue: number
  averageCompletionTime: number
}

/**
 * Filtros para consultas de clientes
 */
export interface ClientFilters {
  status?: ClientStatus
  formStatus?: FormStatus
  paymentStatus?: PaymentStatus
  dateFrom?: string
  dateTo?: string
  searchTerm?: string
  page?: number
  limit?: number
  sortBy?: 'created_at' | 'last_activity' | 'client_name' | 'progress'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Resultado paginado de consultas
 */
export interface PaginatedResult<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Configuración de archivo subido
 */
export interface FileUploadConfig {
  bucket: string
  maxSize: number
  allowedTypes: string[]
  generateThumbnail?: boolean
  compress?: boolean
}

/**
 * Resultado de operación de base de datos
 */
export interface DatabaseResult<T> {
  data: T | null
  error: string | null
  success: boolean
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================
export default Database