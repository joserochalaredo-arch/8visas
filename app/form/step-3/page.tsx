'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useDS160Store } from '@/store/ds160-store'
import { FormWrapper } from '@/components/form-wrapper'
import { Input } from '@/components/ui/input'
import { TextArea } from '@/components/ui/textarea'
import { RadioGroup, RadioOption } from '@/components/ui/radio-group'
import { useState, useEffect } from 'react'

interface Step3FormData {
  idiomas: string
  estadoCivil: 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'SEPARADO' | ''
  nombrePatrocinador?: string
  telefonoPatrocinador?: string
  domicilioPatrocinador?: string
  parentesco?: string
}

export default function Step3() {
  const router = useRouter()
  const { formData, updateFormData, setCurrentStep } = useDS160Store()
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<Step3FormData>({
    defaultValues: {
      idiomas: formData.idiomas,
      estadoCivil: formData.estadoCivil,
      nombrePatrocinador: formData.nombrePatrocinador,
      telefonoPatrocinador: formData.telefonoPatrocinador,
      domicilioPatrocinador: formData.domicilioPatrocinador,
      parentesco: formData.parentesco,
    },
    mode: 'onChange'
  })

  const watchEstadoCivil = watch('estadoCivil')

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  const onSubmit = (data: Step3FormData) => {
    updateFormData(data)
    router.push('/form/step-4')
  }

  const onSave = () => {
    const data = watch()
    updateFormData(data)
    alert('✅ Borrador guardado exitosamente')
  }

  return (
    <FormWrapper
      title="Idiomas, Estado Civil y Patrocinador"
      description="Información sobre idiomas que habla, estado civil y quien patrocina su viaje"
      onNext={() => handleSubmit(onSubmit)()}
      onSave={onSave}
      isValid={isValid}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Sección: Idiomas */}
        <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">
            Idiomas
          </h3>
          
          <Input
            {...register('idiomas', { 
              required: 'Debe especificar los idiomas que habla',
              minLength: { value: 3, message: 'Debe especificar al menos un idioma' }
            })}
            label="Idiomas que habla"
            placeholder="Ejemplo: ESPAÑOL, INGLÉS"
            helperText="Separe múltiples idiomas con comas"
            error={errors.idiomas?.message}
            required
          />
        </div>

        {/* Sección: Estado Civil */}
        <div className="bg-secondary-50 rounded-lg p-6 border border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Estado Civil
          </h3>
          
          <RadioGroup 
            label="Estado Civil Actual"
            error={errors.estadoCivil?.message}
          >
            <RadioOption
              {...register('estadoCivil', { required: 'Debe seleccionar su estado civil' })}
              value="SOLTERO"
              label="Soltero(a)"
            />
            <RadioOption
              {...register('estadoCivil')}
              value="CASADO"
              label="Casado(a)"
            />
            <RadioOption
              {...register('estadoCivil')}
              value="DIVORCIADO"
              label="Divorciado(a)"
            />
            <RadioOption
              {...register('estadoCivil')}
              value="VIUDO"
              label="Viudo(a)"
            />
            <RadioOption
              {...register('estadoCivil')}
              value="SEPARADO"
              label="Separado(a)"
            />
          </RadioGroup>
        </div>

        {/* Sección: Patrocinador del Viaje */}
        <div className="bg-gray-50 rounded-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Información del Patrocinador
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Persona que paga por el viaje (Parentesco, teléfono y domicilio si es diferente al suyo)
          </p>
          
          <div className="space-y-4">
            <Input
              {...register('nombrePatrocinador')}
              label="Nombre de quien paga por el viaje"
              placeholder="Nombre completo del patrocinador"
              helperText="Si usted mismo paga, escriba su propio nombre"
              error={errors.nombrePatrocinador?.message}
            />

            <Input
              {...register('parentesco')}
              label="Parentesco"
              placeholder="Ejemplo: Padre, Madre, Esposo(a), Hijo(a), Propio"
              helperText="Relación con la persona que paga el viaje"
              error={errors.parentesco?.message}
            />

            <Input
              {...register('telefonoPatrocinador')}
              type="tel"
              label="Teléfono del Patrocinador"
              placeholder="+52 123 456 7890"
              helperText="Número de contacto del patrocinador"
              error={errors.telefonoPatrocinador?.message}
            />

            <TextArea
              {...register('domicilioPatrocinador')}
              label="Domicilio del Patrocinador"
              placeholder="Domicilio completo (solo si es diferente al suyo)"
              rows={3}
              helperText="Complete solo si el domicilio es diferente al que ya proporcionó"
              error={errors.domicilioPatrocinador?.message}
            />
          </div>
        </div>

        {/* Información adicional según estado civil */}
        {watchEstadoCivil && (watchEstadoCivil === 'CASADO' || watchEstadoCivil === 'DIVORCIADO' || watchEstadoCivil === 'VIUDO') && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-warning-600 mr-3 mt-0.5">ℹ️</div>
              <div>
                <h4 className="font-semibold text-warning-800">Información Adicional Requerida</h4>
                <p className="text-sm text-warning-700 mt-1">
                  {watchEstadoCivil === 'CASADO' && 'En el siguiente paso necesitará proporcionar información detallada de su cónyuge.'}
                  {watchEstadoCivil === 'DIVORCIADO' && 'En el siguiente paso necesitará proporcionar información sobre matrimonios anteriores y divorce.'}
                  {watchEstadoCivil === 'VIUDO' && 'En el siguiente paso necesitará proporcionar información sobre su cónyuge fallecido.'}
                </p>
              </div>
            </div>
          </div>
        )}

      </form>
    </FormWrapper>
  )
}