import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ClientInfo {
  clientName: string
  clientEmail: string
  clientPhone: string
}

interface FormStore {
  // Client information
  clientInfo: ClientInfo | null
  
  // Form state
  isFormInitialized: boolean
  startedAt: string | null
  lastSavedAt: string | null
  
  // Actions
  initializeForm: (clientInfo: ClientInfo) => void
  clearForm: () => void
  updateLastSaved: () => void
  getClientInfo: () => ClientInfo | null
}

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      clientInfo: null,
      isFormInitialized: false,
      startedAt: null,
      lastSavedAt: null,
      
      initializeForm: (clientInfo: ClientInfo) => {
        set({
          clientInfo,
          isFormInitialized: true,
          startedAt: new Date().toISOString(),
          lastSavedAt: new Date().toISOString()
        })
      },
      
      clearForm: () => {
        set({
          clientInfo: null,
          isFormInitialized: false,
          startedAt: null,
          lastSavedAt: null
        })
      },
      
      updateLastSaved: () => {
        set({ lastSavedAt: new Date().toISOString() })
      },
      
      getClientInfo: () => {
        return get().clientInfo
      }
    }),
    {
      name: 'form-storage',
    }
  )
)