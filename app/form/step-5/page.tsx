'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useDS160Store } from '@/store/ds160-store'
import { FormWrapper } from '@/components/form-wrapper'
import { useEffect } from 'react'

interface Step5FormData {
  // Campos por definir
}

export default function Step5() {
  const router = useRouter()
  const { setCurrentStep } = useDS160Store()
  
  const { handleSubmit, formState: { isValid } } = useForm<Step5FormData>({
    defaultValues: {},
    mode: 'onChange'
  })

  useEffect(() => {
    setCurrentStep(5)
  }, [setCurrentStep])

  const onSubmit = (data: Step5FormData) => {
    console.log('Step 5 data:', data)
    router.push('/form/step-6')
  }

  const onSave = () => {
    console.log('Save step 5 draft')
    alert('✅ Borrador guardado exitosamente')
  }

  return (
    <FormWrapper
      title="Paso 5"
      description="Por definir"
      onNext={() => handleSubmit(onSubmit)()}
      onSave={onSave}
      isValid={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Contenido del formulario por definir */}
        <div className="bg-gray-50 rounded-lg p-6 border text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Paso 5 - Campos por Definir
          </h3>
          <p className="text-gray-600">
            Las preguntas de este paso se agregarán según las especificaciones
          </p>
        </div>

      </form>
    </FormWrapper>
  )
}
