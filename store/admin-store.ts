import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ClientData {
  token: string
  clientName: string
  clientEmail: string
  clientPhone: string
  createdAt: string
  isActive: boolean
  formProgress: number // 0-100
  lastActivity: string
  formData?: any // Datos del formulario DS-160
  
  // Nuevos campos para gestión avanzada
  paymentStatus?: 'pending' | 'paid' | 'partial' | 'cancelled'
  formStatus?: 'not-started' | 'in-progress' | 'completed' | 'submitted'
  adminComments?: string[]
  isFormCompleted?: boolean
}

interface AdminStore {
  clients: ClientData[]
  isAdminAuthenticated: boolean
  adminPassword: string
  
  // Actions
  adminLogin: (password: string) => boolean
  adminLogout: () => void
  generateClientToken: (clientName: string, clientEmail: string, clientPhone: string) => string
  deactivateToken: (token: string) => void
  activateToken: (token: string) => void
  updateClientProgress: (token: string, progress: number, formData?: any) => void
  getClientByToken: (token: string) => ClientData | undefined
  getAllClients: () => ClientData[]
  deleteClient: (token: string) => void
  
  // Nuevas funciones
  updatePaymentStatus: (token: string, status: 'pending' | 'paid' | 'partial' | 'cancelled') => void
  markFormAsCompleted: (token: string) => void
  addClientComment: (token: string, comment: string) => void
  updateFormStatus: (token: string, status: 'not-started' | 'in-progress' | 'completed' | 'submitted') => void
}

// Password para admin (en producción esto debería estar en variables de entorno)
const ADMIN_PASSWORD = "admin123"

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      clients: [],
      isAdminAuthenticated: false,
      adminPassword: ADMIN_PASSWORD,
      
      adminLogin: (password: string) => {
        console.log('Intentando login con password:', password)
        console.log('Password esperado:', ADMIN_PASSWORD)
        if (password === ADMIN_PASSWORD) {
          console.log('Login exitoso, actualizando estado')
          set({ isAdminAuthenticated: true })
          // Forzar persistencia inmediata
          setTimeout(() => {
            console.log('Estado actual después del login:', get())
          }, 100)
          return true
        }
        console.log('Login fallido')
        return false
      },
      
      adminLogout: () => set({ isAdminAuthenticated: false }),
      
      generateClientToken: (clientName: string, clientEmail: string, clientPhone: string) => {
        const token = Math.random().toString(36).substring(2, 10).toUpperCase()
        const newClient: ClientData = {
          token,
          clientName,
          clientEmail,
          clientPhone,
          createdAt: new Date().toISOString(),
          isActive: true,
          formProgress: 0,
          lastActivity: new Date().toISOString(),
          
          // Inicializar nuevos campos
          paymentStatus: 'pending',
          formStatus: 'not-started',
          adminComments: [],
          isFormCompleted: false
        }
        
        set(state => ({
          clients: [...state.clients, newClient]
        }))
        
        return token
      },
      
      deactivateToken: (token: string) => {
        set(state => ({
          clients: state.clients.map(client => 
            client.token === token 
              ? { ...client, isActive: false }
              : client
          )
        }))
      },
      
      activateToken: (token: string) => {
        set(state => ({
          clients: state.clients.map(client => 
            client.token === token 
              ? { ...client, isActive: true }
              : client
          )
        }))
      },
      
      updateClientProgress: (token: string, progress: number, formData?: any) => {
        set(state => ({
          clients: state.clients.map(client => 
            client.token === token 
              ? { 
                  ...client, 
                  formProgress: progress,
                  lastActivity: new Date().toISOString(),
                  formData: formData || client.formData
                }
              : client
          )
        }))
      },
      
      getClientByToken: (token: string) => {
        const { clients } = get()
        return clients.find(client => client.token === token && client.isActive)
      },
      
      getAllClients: () => {
        const { clients } = get()
        return clients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      },
      
      deleteClient: (token: string) => {
        set(state => ({
          clients: state.clients.filter(client => client.token !== token)
        }))
      },

      // Nuevas funciones implementadas
      updatePaymentStatus: (token: string, status: 'pending' | 'paid' | 'partial' | 'cancelled') => {
        set(state => ({
          clients: state.clients.map(client => 
            client.token === token 
              ? { 
                  ...client, 
                  paymentStatus: status,
                  lastActivity: new Date().toISOString()
                }
              : client
          )
        }))
      },

      markFormAsCompleted: (token: string) => {
        set(state => ({
          clients: state.clients.map(client => 
            client.token === token 
              ? { 
                  ...client, 
                  isFormCompleted: true,
                  formStatus: 'completed' as const,
                  formProgress: 100,
                  lastActivity: new Date().toISOString()
                }
              : client
          )
        }))
      },

      addClientComment: (token: string, comment: string) => {
        set(state => ({
          clients: state.clients.map(client => 
            client.token === token 
              ? { 
                  ...client, 
                  adminComments: [...(client.adminComments || []), comment],
                  lastActivity: new Date().toISOString()
                }
              : client
          )
        }))
      },

      updateFormStatus: (token: string, status: 'not-started' | 'in-progress' | 'completed' | 'submitted') => {
        set(state => ({
          clients: state.clients.map(client => 
            client.token === token 
              ? { 
                  ...client, 
                  formStatus: status,
                  lastActivity: new Date().toISOString()
                }
              : client
          )
        }))
      }
    }),
    {
      name: 'admin-storage',
    }
  )
)