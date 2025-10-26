import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  isAuthenticated: boolean
  userToken: string | null
  
  // Actions
  login: (token: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userToken: null,
      
      login: (token: string) => {
        // Verificar token con el admin store
        // Hacemos una verificación simple aquí, el middleware también verificará
        if (typeof window !== 'undefined') {
          const adminStorage = localStorage.getItem('admin-storage')
          if (adminStorage) {
            try {
              const adminData = JSON.parse(adminStorage)
              const clients = adminData.state?.clients || []
              const client = clients.find((c: any) => c.token === token && c.isActive)
              
              if (client) {
                set({ isAuthenticated: true, userToken: token })
                return true
              }
            } catch (error) {
              console.error('Error verifying token:', error)
            }
          }
        }
        return false
      },
      
      logout: () => 
        set({ 
          isAuthenticated: false, 
          userToken: null
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
)