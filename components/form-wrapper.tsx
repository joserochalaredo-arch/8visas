'use client'

import { ReactNode, useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDS160Store } from '@/store/ds160-store'
import { useFormStore } from '@/store/form-store'
import { useAdminStore } from '@/store/admin-store'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Save, Shield, LogOut, Heart } from 'lucide-react'
import { StepProgress } from '@/components/step-progress'
import { WhatsappFloat } from '@/components/whatsapp-float'
import Image from 'next/image'

// Componente para mostrar la información del cliente (modo admin)
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



// Modal de confirmación para guardar borrador
function SaveDraftModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-sm w-full mx-4 p-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
            <Save className="h-6 w-6 text-green-600" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ¡Borrador Guardado!
          </h3>
          
          <p className="text-sm text-gray-600 mb-6">
            Tu progreso se ha guardado correctamente. Puedes continuar más tarde usando el mismo enlace.
          </p>
          
          <Button
            onClick={onClose}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
          >
            Entendido
          </Button>
        </div>
      </div>
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

function FormWrapperContent({
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
  const searchParams = useSearchParams()
  const { adminLogout } = useAdminStore()
  const { currentStep, getTotalSteps, markStepCompleted, setCurrentStep } = useDS160Store()
  const { clientInfo } = useFormStore()
  const [isClientView, setIsClientView] = useState(false)
  const [clientName, setClientName] = useState('')
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const totalSteps = getTotalSteps()
  const displayStep = isClient ? currentStep : 1
  const isFirstStep = displayStep === 1
  const isLastStep = displayStep === totalSteps

  // Detectar si es vista de cliente o admin
  useEffect(() => {
    const urlToken = searchParams.get('token')
    
    if (urlToken) {
      // Es vista de cliente
      setIsClientView(true)
      
      // Primero intentar obtener el nombre desde el form store
      if (clientInfo?.clientName) {
        setClientName(clientInfo.clientName)
      } else {
        // Fallback: buscar en admin storage y actualizar form store
        const adminStorage = localStorage.getItem('admin-storage')
        if (adminStorage) {
          try {
            const adminData = JSON.parse(adminStorage)
            const clients = adminData.state?.clients || []
            const clientWithToken = clients.find((c: any) => c.token === urlToken && c.isActive)
            
            if (clientWithToken) {
              // Usar clientName del objeto cliente
              const foundClientName = clientWithToken.clientName || 'Cliente'
              setClientName(foundClientName)
            } else {
              setClientName('Cliente')
            }
          } catch (error) {
            console.error('Error finding client:', error)
            setClientName('Cliente')
          }
        } else {
          setClientName('Cliente')
        }
      }
    } else {
      setIsClientView(false)
    }
  }, [searchParams, clientInfo])

  const handleLogout = () => {
    adminLogout()
    router.push('/')
  }

  const handleNext = () => {
    if (isValid) {
      // Llamar la función onNext del paso, que se encarga de todo el proceso
      onNext?.()
    }
  }

  const handlePrevious = () => {
    if (displayStep > 1) {
      // Llamar la función onPrevious del paso, que se encarga de la navegación
      onPrevious?.()
    }
  }

  const [showSaveModal, setShowSaveModal] = useState(false)

  const handleSave = () => {
    // Para clientes, mostrar modal de confirmación
    if (isClientView) {
      setShowSaveModal(true)
    } else {
      onSave?.()
    }
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
              
              {/* Vista diferente según tipo de usuario */}
              <div className="flex items-center justify-between">
                <div></div>
                
                <div className="flex items-center space-x-6">
                  {/* Mensaje de bienvenida compacto para clientes */}
                  {isClientView && (
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-red-500 mt-0.5" />
                      <div className="text-sm text-primary-600 text-right">
                        <div>¡Te damos la bienvenida!</div>
                        <div className="font-bold text-primary-900">{clientName}</div>
                        <div>Estamos para servirte</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Paso {displayStep} de {totalSteps}
                      </div>
                      {!isClientView && <ClientDisplay />}
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
                {/* Solo mostrar botón de menú para administradores */}
                {onBackToMenu && !isClientView && (
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
                {/* Mostrar guardar borrador para clientes y administradores */}
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
                    type="button"
                    onClick={handleNext}
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

      {/* WhatsApp flotante - solo para clientes */}
      {isClientView && <WhatsappFloat />}
      
      {/* Modal de guardado para clientes */}
      <SaveDraftModal 
        isOpen={showSaveModal} 
        onClose={() => setShowSaveModal(false)} 
      />
    </div>
  )
}

export function FormWrapper(props: FormWrapperProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    }>
      <FormWrapperContent {...props} />
    </Suspense>
  )
}