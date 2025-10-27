'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuthStore } from '@/store/auth-store'
import { useDS160Store } from '@/store/ds160-store'
import { FormCompletion } from '@/components/form-completion'

export default function FormFinalStep() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { setCurrentStep } = useDS160Store()

  useEffect(() => {
    setCurrentStep(8) // Paso final
    
    // Verificar autenticación
    if (!isAuthenticated) {
      router.push('/')
      return
    }
  }, [isAuthenticated, router, setCurrentStep])

  const handleComplete = () => {
    // Redirigir al dashboard del admin o página inicial después de 3 segundos
    setTimeout(() => {
      router.push('/admin/dashboard')
    }, 3000)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-gold-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Image 
                src="/images/LOGOSOLO.png" 
                alt="A8Visas Logo" 
                width={32}
                height={32}
                className="h-8 w-8 mr-3"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">A8Visas</h1>
                <p className="text-sm text-gray-600">Sistema de Gestión DS-160</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Finalización del Formulario
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Componente de finalización */}
        <FormCompletion onComplete={handleComplete} />
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>© 2024 A8Visas. Sistema profesional de gestión de formularios DS-160.</p>
          </div>
        </div>
      </div>
    </div>
  )
}