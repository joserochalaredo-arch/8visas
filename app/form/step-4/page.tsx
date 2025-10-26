'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useDS160Store } from '@/store/ds160-store'
import { FormWrapper } from '@/components/form-wrapper'
import { Input } from '@/components/ui/input'
import { TextArea } from '@/components/ui/textarea'
import { RadioGroup, RadioOption } from '@/components/ui/radio-group'
import { useState, useEffect } from 'react'

interface Step4FormData {
  fechaLlegada?: string
  duracionEstancia?: string
  hotel?: string
  telefonoHotel?: string
  familiarEnUSA?: string
  domicilioFamiliarUSA?: string
  telefonoFamiliarUSA?: string
  personasQueViajan?: string
}

export default function Step4() {
  const router = useRouter()
  const { formData, updateFormData, setCurrentStep } = useDS160Store()
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<Step4FormData>({
    defaultValues: {
      fechaLlegada: formData.fechaLlegada,
      duracionEstancia: formData.duracionEstancia,
      hotel: formData.hotel,
      telefonoHotel: formData.telefonoHotel,
      familiarEnUSA: formData.familiarEnUSA,
      domicilioFamiliarUSA: formData.domicilioFamiliarUSA,
      telefonoFamiliarUSA: formData.telefonoFamiliarUSA,
      personasQueViajan: formData.personasQueViajan,
    },
    mode: 'onChange'
  })

  useEffect(() => {
    setCurrentStep(4)
  }, [setCurrentStep])

  const onSubmit = (data: Step4FormData) => {
    updateFormData(data)
    router.push('/form/step-5')
  }

  const onSave = () => {
    const data = watch()
    updateFormData(data)
    alert('✅ Borrador guardado exitosamente')
  }

  const hasRequiredFields = () => {
    const data = watch()
    return !!(data.fechaLlegada && data.duracionEstancia)
  }

  return (
    <FormWrapper
      title="Detalles del Viaje"
      description="Información sobre su viaje planificado a Estados Unidos"
      onNext={() => handleSubmit(onSubmit)()}
      onSave={onSave}
      isValid={hasRequiredFields()}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Alerta informativa */}
        <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-secondary-600 mr-3">📅</div>
            <div>
              <h4 className="font-semibold text-secondary-800">Viaje a Estados Unidos</h4>
              <p className="text-sm text-secondary-700">
                Si no tiene un viaje contemplado puede ser información tentativa, pero se deben llenar todos estos datos.
              </p>
            </div>
          </div>
        </div>

        {/* Sección: Información del Viaje */}
        <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">
            Información del Viaje
          </h3>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                {...register('fechaLlegada', { required: 'La fecha de llegada es requerida' })}
                type="date"
                label="Fecha de Llegada"
                helperText="Fecha tentativa de llegada a Estados Unidos"
                error={errors.fechaLlegada?.message}
                required
              />
              <Input
                {...register('duracionEstancia', { required: 'La duración de estancia es requerida' })}
                label="Duración de la Estancia"
                placeholder="Ejemplo: 2 semanas, 1 mes, 6 meses"
                helperText="¿Cuánto tiempo planea quedarse?"
                error={errors.duracionEstancia?.message}
                required
              />
            </div>
          </div>
        </div>

        {/* Sección: Hospedaje */}
        <div className="bg-gray-50 rounded-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Información de Hospedaje
          </h3>
          
          <div className="space-y-4">
            <TextArea
              {...register('hotel')}
              label="Hotel (domicilio completo con código postal)"
              placeholder="Nombre del hotel y dirección completa&#10;Ejemplo: Marriott Hotel&#10;123 Main Street, New York, NY 10001"
              rows={3}
              helperText="Si no tiene hotel reservado, indique el área o ciudad donde se hospedará"
              error={errors.hotel?.message}
            />

            <Input
              {...register('telefonoHotel')}
              type="tel"
              label="Teléfono del Hotel"
              placeholder="+1 (555) 123-4567"
              helperText="Número de teléfono del hotel (si está disponible)"
              error={errors.telefonoHotel?.message}
            />
          </div>
        </div>

        {/* Sección: Contactos en USA */}
        <div className="bg-secondary-50 rounded-lg p-6 border border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Contactos en Estados Unidos
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            En caso de ir con un familiar - Nombre, parentesco y estatus (ciudadano o residente)
          </p>
          
          <div className="space-y-4">
            <Input
              {...register('familiarEnUSA')}
              label="Familiar o Contacto en USA"
              placeholder="Nombre, parentesco y estatus (ej: Juan Pérez, hermano, ciudadano)"
              helperText="Si no tiene familiares en USA, puede dejar en blanco"
              error={errors.familiarEnUSA?.message}
            />

            <TextArea
              {...register('domicilioFamiliarUSA')}
              label="Domicilio del Familiar/Contacto"
              placeholder="Dirección completa con código postal"
              rows={2}
              helperText="Dirección de su contacto en Estados Unidos"
              error={errors.domicilioFamiliarUSA?.message}
            />

            <Input
              {...register('telefonoFamiliarUSA')}
              type="tel"
              label="Teléfono del Familiar/Contacto"
              placeholder="+1 (555) 123-4567"
              helperText="Número de teléfono de su contacto en USA"
              error={errors.telefonoFamiliarUSA?.message}
            />
          </div>
        </div>

        {/* Sección: Personas que Viajan */}
        <div className="bg-gray-50 rounded-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Personas que Viajan con Usted
          </h3>
          
          <TextArea
            {...register('personasQueViajan')}
            label="Con parentesco"
            placeholder="Ejemplo:&#10;- María García (esposa)&#10;- Juan García (hijo, 15 años)&#10;&#10;Si viaja solo, escriba: VIAJO SOLO"
            rows={4}
            helperText="Liste todas las personas que viajarán con usted, indicando el parentesco y edad (si son menores)"
            error={errors.personasQueViajan?.message}
          />
        </div>

        {/* Información adicional */}
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-warning-600 mr-3 mt-0.5">💡</div>
            <div>
              <h4 className="font-semibold text-warning-800">Consejos Importantes</h4>
              <ul className="text-sm text-warning-700 mt-1 space-y-1">
                <li>• Las fechas pueden ser tentativas, pero deben ser realistas</li>
                <li>• Si no tiene hotel reservado, indique al menos la ciudad de destino</li>
                <li>• Tener contactos en USA puede fortalecer su solicitud</li>
                <li>• Si viaja con menores, asegúrese de tener todos los permisos necesarios</li>
              </ul>
            </div>
          </div>
        </div>

      </form>
    </FormWrapper>
  )
}