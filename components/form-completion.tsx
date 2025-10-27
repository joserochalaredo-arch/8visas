'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth-store'
import { useAdminStore } from '@/store/admin-store'
import { useDS160Store } from '@/store/ds160-store'
import { PDFGenerator } from '@/components/pdf-generator'
import { 
  CheckCircle2, 
  FileText, 
  Calendar, 
  User, 
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react'

interface FormCompletionProps {
  onComplete?: () => void
}

export function FormCompletion({ onComplete }: FormCompletionProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  
  const { userToken } = useAuthStore()
  const { markFormAsCompleted, getClientByToken, updateFormStatus } = useAdminStore()
  const { formData, getStepProgress } = useDS160Store()
  
  const client = userToken ? getClientByToken(userToken) : null
  const progress = getStepProgress()

  const handleCompleteForm = async () => {
    if (!userToken || !client) return

    setIsCompleting(true)

    try {
      // Marcar como completado en el store
      markFormAsCompleted(userToken)
      updateFormStatus(userToken, 'completed')
      
      // Simular un delay para mejor UX
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setIsCompleted(true)
      
      if (onComplete) {
        onComplete()
      }
      
    } catch (error) {
      console.error('Error completando el formulario:', error)
      alert('Hubo un error al completar el formulario. Intente nuevamente.')
    } finally {
      setIsCompleting(false)
    }
  }

  if (!client) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Error: No se pudo cargar la información del cliente.</p>
        </CardContent>
      </Card>
    )
  }

  if (isCompleted) {
    return (
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <Award className="h-10 w-10 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            ¡Formulario Completado Exitosamente!
          </h2>
          
          <p className="text-green-700 mb-6 text-lg">
            El formulario DS-160 para <strong>{client.clientName}</strong> ha sido completado al 100%.
          </p>
          
          <div className="bg-white rounded-lg p-4 mb-6 border border-green-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <User className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-gray-700">Cliente: {client.clientName}</span>
              </div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-gray-700">Token: {client.token}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-gray-700">Completado: {new Date().toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-gray-700">Progreso: 100%</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PDFGenerator 
              client={client}
              onGenerated={() => console.log('PDF generado exitosamente')}
            />
            
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-blue-800 mb-2">
            ¡Felicidades! Formulario Casi Completo
          </h2>
          
          <p className="text-blue-700 mb-4">
            Ha completado todos los pasos del formulario DS-160 exitosamente.
          </p>
        </div>

        {/* Resumen del cliente */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">Resumen del Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center">
              <User className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-gray-700">Nombre: {client.clientName}</span>
            </div>
            <div className="flex items-center">
              <FileText className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-gray-700">Token: {client.token}</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-gray-700">Progreso: {progress.toFixed(0)}%</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-gray-700">Iniciado: {new Date(client.createdAt).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        </div>

        {/* Mensaje informativo */}
        <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>Siguiente paso:</strong> Haga clic en &quot;Marcar como Completado&quot; para finalizar oficialmente el proceso 
            y generar los documentos correspondientes.
          </p>
        </div>

        {/* Botón de completar */}
        <div className="text-center">
          <Button
            onClick={handleCompleteForm}
            disabled={isCompleting}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
          >
            {isCompleting ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2 animate-spin" />
                Completando Formulario...
              </>
            ) : (
              <>
                <Award className="h-5 w-5 mr-2" />
                Marcar como Completado
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}