'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFormStore } from '@/store/form-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserIcon, MailIcon, PhoneIcon, ArrowLeftIcon } from 'lucide-react'
import Image from 'next/image'

export default function ClientInfoPage() {
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { initializeForm } = useFormStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Inicializar el formulario con la información del cliente
    initializeForm({
      clientName,
      clientEmail, 
      clientPhone
    })

    // Simular un pequeño delay para mejor UX
    setTimeout(() => {
      router.push('/form/step-1')
    }, 1000)
  }

  const handleGoBack = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-gold-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src="/images/LOGO.png"
                alt="A8Visas Logo"
                width={48}
                height={48}
                className="w-12 h-12"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">A8Visas</h1>
                <p className="text-sm text-gray-600">Información del Cliente</p>
              </div>
            </div>
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Regresar
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg border p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <UserIcon className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Información del Cliente
            </h2>
            <p className="text-gray-600 text-lg">
              Para comenzar con el formulario DS-160, necesitamos algunos datos del cliente que está ayudando.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="clientName" className="text-sm font-medium text-gray-700 flex items-center">
                <UserIcon className="h-4 w-4 mr-2" />
                Nombre Completo del Cliente *
              </label>
              <Input
                id="clientName"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej: Juan Carlos Pérez López"
                required
                className="text-lg py-3"
              />
              <p className="text-xs text-gray-500">
                Ingrese el nombre completo tal como aparece en el pasaporte
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="clientEmail" className="text-sm font-medium text-gray-700 flex items-center">
                <MailIcon className="h-4 w-4 mr-2" />
                Correo Electrónico del Cliente *
              </label>
              <Input
                id="clientEmail"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                required
                className="text-lg py-3"
              />
              <p className="text-xs text-gray-500">
                Se utilizará para comunicaciones importantes sobre la visa
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="clientPhone" className="text-sm font-medium text-gray-700 flex items-center">
                <PhoneIcon className="h-4 w-4 mr-2" />
                Teléfono del Cliente
              </label>
              <Input
                id="clientPhone"
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+52 55 1234 5678"
                className="text-lg py-3"
              />
              <p className="text-xs text-gray-500">
                Número de contacto (opcional pero recomendado)
              </p>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-primary-800">Información Importante</h4>
                  <p className="text-sm text-primary-700 mt-1">
                    Esta información se utilizará únicamente para el proceso de llenado del formulario DS-160 
                    y seguimiento del progreso. Todos los datos se mantienen confidenciales.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Preparando formulario...
                </div>
              ) : (
                <>
                  🇺🇸 Comenzar Formulario DS-160
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              ¿Necesitas ayuda? Contacta con nuestro equipo de soporte
            </p>
            <p className="text-sm text-primary-600 font-medium mt-1">
              A8Visas - Hacemos tu trámite fácil
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}