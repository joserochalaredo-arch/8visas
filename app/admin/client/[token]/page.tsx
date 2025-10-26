'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAdminStore, ClientData } from '@/store/admin-store'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon, UserIcon, MailIcon, PhoneIcon, CalendarIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'

export default function ClientDetail() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  
  const { isAdminAuthenticated, getClientByToken, getAllClients } = useAdminStore()
  const [client, setClient] = useState<ClientData | null>(null)
  
  useEffect(() => {
    if (!isAdminAuthenticated) {
      router.push('/admin')
      return
    }
    
    // Buscar cliente en todos los clientes (activos e inactivos)
    const allClients = getAllClients()
    const foundClient = allClients.find(c => c.token === token)
    setClient(foundClient || null)
  }, [isAdminAuthenticated, token, getAllClients, router])

  if (!isAdminAuthenticated) {
    return null
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Cliente no encontrado</h2>
          <p className="text-gray-600 mb-4">El token especificado no existe</p>
          <Button onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getProgressSteps = () => {
    const totalSteps = 7
    const currentStep = Math.ceil((client.formProgress / 100) * totalSteps)
    
    return Array.from({ length: totalSteps }, (_, index) => ({
      step: index + 1,
      completed: index + 1 <= currentStep,
      current: index + 1 === currentStep && client.formProgress > 0 && client.formProgress < 100
    }))
  }

  const steps = getProgressSteps()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin/dashboard')}
                className="mr-4"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Detalle del Cliente</h1>
                <p className="text-gray-600">Información y progreso del formulario</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              client.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {client.isActive ? 'Activo' : 'Inactivo'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información del Cliente */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Información del Cliente</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium text-gray-900">{client.clientName}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MailIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{client.clientEmail}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium text-gray-900">{client.clientPhone}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Fecha de Creación</p>
                  <p className="font-medium text-gray-900">{formatDate(client.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Token */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-500 mb-2">Token de Acceso</p>
              <div className="bg-gray-100 rounded-lg p-3">
                <code className="text-lg font-mono text-gray-900">{client.token}</code>
              </div>
            </div>
          </div>

          {/* Progreso del Formulario */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Progreso del Formulario DS-160</h2>
            
            {/* Barra de progreso general */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Progreso General</span>
                <span className="text-sm font-semibold text-gray-900">{client.formProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    client.formProgress === 0 ? 'bg-gray-300' :
                    client.formProgress < 30 ? 'bg-red-500' :
                    client.formProgress < 70 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${client.formProgress}%` }}
                />
              </div>
            </div>

            {/* Pasos del formulario */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 mb-4">Pasos Completados</p>
              {steps.map((step) => (
                <div key={step.step} className="flex items-center">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : step.current
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step.completed ? (
                      <CheckCircleIcon className="h-4 w-4" />
                    ) : (
                      step.step
                    )}
                  </div>
                  <span className={`ml-3 text-sm ${
                    step.completed 
                      ? 'text-gray-900 font-medium' 
                      : step.current
                      ? 'text-yellow-600 font-medium'
                      : 'text-gray-500'
                  }`}>
                    Paso {step.step}: {getStepName(step.step)}
                  </span>
                </div>
              ))}
            </div>

            {/* Última actividad */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-500">Última Actividad</p>
              <p className="font-medium text-gray-900">{formatDate(client.lastActivity)}</p>
            </div>
          </div>
        </div>

        {/* Datos del formulario (si existen) */}
        {client.formData && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Datos del Formulario</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(client.formData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getStepName(step: number): string {
  const stepNames: Record<number, string> = {
    1: 'Información Personal',
    2: 'Dirección y Información de Contacto',
    3: 'Pasaporte',
    4: 'Viaje',
    5: 'Compañía de Viaje',
    6: 'Educación y Trabajo',
    7: 'Familia'
  }
  return stepNames[step] || `Paso ${step}`
}