'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useDS160Store } from '@/store/ds160-store'
import { useFormStore } from '@/store/form-store'
import { useAdminStore } from '@/store/admin-store'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Save, Shield, LogOut } from 'lucide-react'
import { StepProgress } from '@/components/step-progress'
import Image from 'next/image'

// Componente para mostrar la información del cliente
function ClientDisplay() {
  const { getClientInfo } = useFormStore()
  const clientInfo = getClientInfo()
  
  if (!clientInfo) return null
  
  return (
    <div className="flex items-center text-xs text-gray-500 mt-1">
      <Shield className="h-3 w-3 mr-1" />
      <span>Cliente: {clientInfo.clientName}</span>
    </div>
  )
}

interface FormWrapperProps {
  children: ReactNode
  title: string
  description?: string
  onNext?: () => void
  onPrevious?: () => void
  onSave?: () => void
  onBackToMenu?: () => void
  isValid?: boolean
  showSave?: boolean
}

export function FormWrapper({
  children,
  title,
  description,
  onNext,
  onPrevious,
  onSave,
  onBackToMenu,
  isValid = false,
  showSave = true
}: FormWrapperProps) {
  const router = useRouter()
  const { adminLogout } = useAdminStore()
  const { currentStep, getTotalSteps, markStepCompleted, setCurrentStep } = useDS160Store()
  const totalSteps = getTotalSteps()
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  const handleLogout = () => {
    adminLogout()
    router.push('/')
  }

  const handleNext = () => {
    if (isValid && currentStep < totalSteps) {
      markStepCompleted(currentStep)
      setCurrentStep(currentStep + 1)
      onNext?.()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      onPrevious?.()
    }
  }

  const handleSave = () => {
    onSave?.()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Image
                  src="/images/LOGOSOLO.png"
                  alt="A8Visas Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12"
                />
                <div>
                  <h1 className="text-2xl font-bold text-primary-900">
                    A8Visas - Formulario DS-160
                  </h1>
                  <p className="text-sm text-gray-600">
                    Toda la información solicitada es necesaria para la forma DS160
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    Paso {currentStep} de {totalSteps}
                  </div>
                  <ClientDisplay />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
            <StepProgress />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Step Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>

          {/* Step Content */}
          <div className="px-6 py-6">
            {children}
          </div>

          {/* Step Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                {onBackToMenu && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBackToMenu}
                    className="flex items-center bg-gray-200 hover:bg-gray-300"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Menú Principal
                  </Button>
                )}
                {!isFirstStep && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex items-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Button>
                )}
                {showSave && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSave}
                    className="flex items-center"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Borrador
                  </Button>
                )}
              </div>

              <div className="flex space-x-3">
                {!isLastStep ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!isValid}
                    className="flex items-center"
                  >
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!isValid}
                    className="flex items-center bg-success-600 hover:bg-success-700"
                  >
                    Enviar Formulario
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>© 2025 - A8Visas | Hacemos tu trámite fácil | Todos los derechos reservados</p>
            <p className="mt-1">
              Este es un formulario de recopilación de información. Los datos serán utilizados exclusivamente para completar el formulario DS-160 oficial.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}