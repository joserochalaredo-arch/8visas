'use client'

import { useDS160Store } from '@/store/ds160-store'
import { cn } from '@/lib/utils'
import { CheckCircle2, Circle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface StepProgressProps {
  className?: string
}

const steps = [
  { id: 1, title: 'Información Personal', description: 'Datos personales y cita' },
  { id: 2, title: 'Pasaporte y Contacto', description: 'Documentos y comunicación' },
  { id: 3, title: 'Estado Civil', description: 'Idiomas, estado civil y patrocinador' },
  { id: 4, title: 'Viaje', description: 'Detalles del viaje y acompañantes' },
  { id: 5, title: 'Educación y Trabajo', description: 'Historial académico y laboral' },
  { id: 6, title: 'Información Familiar', description: 'Datos de familia y matrimonio' },
  { id: 7, title: 'Historial de Viajes', description: 'Visas anteriores y viajes a USA' },
]

export function StepProgress({ className }: StepProgressProps) {
  const { currentStep, isStepCompleted, getStepProgress } = useDS160Store()
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Evitar error de hidratación mostrando valor por defecto hasta que se hidrate
  const displayStep = isClient ? currentStep : 1
  const progress = isClient ? getStepProgress() : 0

  return (
    <div className={cn("w-full", className)}>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span>Progreso del formulario</span>
          <span>{Math.round(progress)}% completado</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <nav aria-label="Progreso del formulario">
        <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8 overflow-x-auto">
          {steps.map((step) => {
            const isCompleted = isClient ? isStepCompleted(step.id) : false
            const isCurrent = displayStep === step.id
            const isAccessible = step.id <= displayStep || isCompleted

            return (
              <li key={step.id} className="md:flex-1">
                <div
                  className={cn(
                    "group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                    {
                      "border-primary-600": isCurrent,
                      "border-success-600": isCompleted,
                      "border-gray-200": !isCurrent && !isCompleted
                    }
                  )}
                >
                  <span className="flex items-center text-sm font-medium">
                    {isCompleted ? (
                      <CheckCircle2 className="mr-2 h-5 w-5 text-success-600" />
                    ) : (
                      <Circle 
                        className={cn(
                          "mr-2 h-5 w-5",
                          isCurrent ? "text-primary-600" : "text-gray-400"
                        )} 
                      />
                    )}
                    <span
                      className={cn(
                        {
                          "text-primary-600": isCurrent,
                          "text-success-600": isCompleted,
                          "text-gray-500": !isCurrent && !isCompleted
                        }
                      )}
                    >
                      Paso {step.id}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "ml-7 mt-1 text-sm font-semibold",
                      {
                        "text-primary-600": isCurrent,
                        "text-success-600": isCompleted,
                        "text-gray-900": !isCurrent && !isCompleted
                      }
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="ml-7 mt-1 text-sm text-gray-500">
                    {step.description}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}