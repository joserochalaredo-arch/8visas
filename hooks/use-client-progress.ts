import { useAuthStore } from '@/store/auth-store'

// Hook para actualizar el progreso del cliente
export const useClientProgress = () => {
  const { userToken } = useAuthStore()
  
  const updateProgress = (step: number, formData?: any) => {
    if (!userToken) return
    
    // Calcular progreso basado en el paso (7 pasos total)
    const progress = Math.round((step / 7) * 100)
    
    // Actualizar en localStorage (admin-storage)
    if (typeof window !== 'undefined') {
      const adminStorage = localStorage.getItem('admin-storage')
      if (adminStorage) {
        try {
          const adminData = JSON.parse(adminStorage)
          const clients = adminData.state?.clients || []
          
          const updatedClients = clients.map((c: any) => 
            c.token === userToken 
              ? { 
                  ...c, 
                  formProgress: progress,
                  lastActivity: new Date().toISOString(),
                  formData: formData || c.formData
                }
              : c
          )
          
          const updatedAdminData = {
            ...adminData,
            state: {
              ...adminData.state,
              clients: updatedClients
            }
          }
          
          localStorage.setItem('admin-storage', JSON.stringify(updatedAdminData))
        } catch (error) {
          console.error('Error updating client progress:', error)
        }
      }
    }
  }
  
  return { updateProgress }
}