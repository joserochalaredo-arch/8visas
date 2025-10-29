'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useDS160Store } from '@/store/ds160-store'
import { FormWrapper } from '@/components/form-wrapper'
import { useStepNavigation } from '@/hooks/useStepNavigation'
import { useEffect } from 'react'

interface Step6FormData {
  // Campos por definir
}

export default function Step6() {
  const router = useRouter()
  const { setCurrentStep } = useDS160Store()
  const { saveDraft } = useStepNavigation()
  
  const { handleSubmit, getValues, formState: { isValid } } = useForm<Step6FormData>({
    defaultValues: {},
    mode: 'onChange'
  })

  useEffect(() => {
    setCurrentStep(6)
  }, [setCurrentStep])

  const onSubmit = (data: Step6FormData) => {
    console.log('Step 6 data:', data)
    router.push('/form/step-7')
  }

  const onSave = async () => {
    const data = getValues()
    const saved = await saveDraft(6, data)
    if (saved) {
      alert('✅ Borrador guardado exitosamente')
    } else {
      alert('❌ Error al guardar borrador')
    }
  }

  return (
    <FormWrapper
      title="Paso 6"
      description="Por definir"
      onNext={() => handleSubmit(onSubmit)()}
      onSave={onSave}
      isValid={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Contenido del formulario por definir */}
        <div className="bg-gray-50 rounded-lg p-6 border text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Paso 6 - Campos por Definir
          </h3>
          <p className="text-gray-600">
            Las preguntas de este paso se agregarán según las especificaciones
          </p>
        </div>

      </form>
    </FormWrapper>
  )
}
