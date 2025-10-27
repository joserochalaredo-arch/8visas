'use client'

import { useRouter } from 'next/navigation'
import { useDS160Store } from '@/store/ds160-store'
import { useClientProgress } from '@/hooks/use-client-progress'

/**
 * Hook personalizado para manejar la navegación automática entre pasos del formulario
 */
export function useStepNavigation() {
  const router = useRouter()
  const { currentStep, markStepCompleted, setCurrentStep, updateFormData } = useDS160Store()
  const { updateProgress } = useClientProgress()

  /**
   * Navega automáticamente al siguiente paso después de completar el actual
   * @param stepNumber - Número del paso actual
   * @param formData - Datos del formulario a guardar
   * @param onComplete - Función opcional a ejecutar cuando se complete el formulario
   */
  const navigateToNextStep = async (stepNumber: number, formData: any, onComplete?: () => void) => {
    console.log(`🚀 Completando paso ${stepNumber} y navegando al siguiente...`)
    
    try {
      // Actualizar datos del formulario en Zustand
      updateFormData(formData)
      
      // Marcar paso como completado
      markStepCompleted(stepNumber)
      
      // Actualizar progreso para clientes
      updateProgress(stepNumber, { [`step${stepNumber}`]: formData })
      
      // Guardar en base de datos
      await saveToDatabase(stepNumber, formData)
      
      // Determinar la siguiente ruta
      const stepRoutes: { [key: number]: string } = {
        1: '/form/step-2',
        2: '/form/step-3', 
        3: '/form/step-4',
        4: '/form/step-5',
        5: '/form/step-6',
        6: '/form/step-7',
        7: '/form/complete'
      }
      
      const nextRoute = stepRoutes[stepNumber]
      
      if (nextRoute) {
        console.log(`📍 Navegando a: ${nextRoute}`)
        
        // Si es el último paso, ejecutar función de completado si existe
        if (stepNumber === 7 && onComplete) {
          onComplete()
        }
        
        // Actualizar step actual y navegar
        if (stepNumber < 7) {
          setCurrentStep(stepNumber + 1)
        }
        
        router.push(nextRoute)
      } else {
        console.error(`❌ No se encontró ruta para el paso ${stepNumber}`)
      }
    } catch (error) {
      console.error('❌ Error en navegación:', error)
      alert('Error al guardar los datos. Por favor, inténtalo de nuevo.')
    }
  }

  /**
   * Guarda los datos en la base de datos
   */
  const saveToDatabase = async (stepNumber: number, stepData: any) => {
    try {
      const { formData } = useDS160Store.getState()
      
      // Obtener información del cliente y token
      const authStorage = localStorage.getItem('auth-storage')
      const adminStorage = localStorage.getItem('admin-storage')
      
      let formToken = 'default-token'
      let clientName = 'Cliente'
      let clientEmail = ''
      
      // Intentar obtener token del URL
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const urlToken = urlParams.get('token')
        if (urlToken) {
          formToken = urlToken
          
          // Buscar información del cliente
          if (adminStorage) {
            try {
              const adminData = JSON.parse(adminStorage)
              const clients = adminData.state?.clients || []
              const client = clients.find((c: any) => c.token === urlToken && c.isActive)
              if (client) {
                clientName = client.clientName || 'Cliente'
                clientEmail = client.email || ''
              }
            } catch (error) {
              console.warn('Error obteniendo datos del cliente:', error)
            }
          }
        }
      }

      const requestData = {
        formToken,
        clientName,
        clientEmail,
        currentStep: stepNumber,
        stepData,
        formData: { ...formData, ...stepData }
      }

      console.log('💾 Guardando en base de datos:', requestData)

      const response = await fetch('/api/ds160', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Datos guardados exitosamente en BD')
      } else {
        console.error('❌ Error guardando en BD:', result.error)
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('❌ Error en saveToDatabase:', error)
      throw error
    }
  }

  /**
   * Navega al paso anterior
   * @param stepNumber - Número del paso actual
   */
  const navigateToPreviousStep = (stepNumber: number) => {
    if (stepNumber > 1) {
      const stepRoutes: { [key: number]: string } = {
        2: '/form/step-1',
        3: '/form/step-2',
        4: '/form/step-3', 
        5: '/form/step-4',
        6: '/form/step-5',
        7: '/form/step-6'
      }
      
      const previousRoute = stepRoutes[stepNumber]
      
      if (previousRoute) {
        console.log(`📍 Navegando atrás a: ${previousRoute}`)
        setCurrentStep(stepNumber - 1)
        router.push(previousRoute)
      }
    }
  }

  /**
   * Guarda el borrador del paso actual
   * @param stepNumber - Número del paso actual
   * @param formData - Datos del formulario a guardar
   */
  const saveDraft = async (stepNumber: number, formData: any) => {
    try {
      console.log(`💾 Guardando borrador del paso ${stepNumber}...`)
      
      // Actualizar en Zustand
      updateFormData(formData)
      updateProgress(stepNumber, { [`step${stepNumber}`]: formData })
      
      // Guardar en base de datos
      await saveToDatabase(stepNumber, formData)
      
      return true
    } catch (error) {
      console.error('❌ Error guardando borrador:', error)
      return false
    }
  }

  return {
    navigateToNextStep,
    navigateToPreviousStep,
    saveDraft,
    currentStep
  }
}