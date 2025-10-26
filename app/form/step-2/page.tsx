'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useDS160Store } from '@/store/ds160-store'
import { FormWrapper } from '@/components/form-wrapper'
import { Input } from '@/components/ui/input'
import { TextArea } from '@/components/ui/textarea'
import { RadioGroup, RadioOption } from '@/components/ui/radio-group'
import { useState, useEffect } from 'react'

interface Step2FormData {
  numeroPasaporte: string
  fechaExpedicion: string
  fechaVencimiento: string
  ciudadExpedicion: string
  domicilio: string
  telefonoCasa?: string
  celular: string
  correoElectronico: string
  otrosNumeros: 'SI' | 'NO' | ''
  listaNumeros?: string
  correosAdicionales?: string
  redesSociales: string
  plataformasAdicionales: 'SI' | 'NO' | ''
  listaPlataformas?: string
}

export default function Step2() {
  const router = useRouter()
  const { formData, updateFormData, setCurrentStep } = useDS160Store()
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<Step2FormData>({
    defaultValues: {
      numeroPasaporte: formData.numeroPasaporte,
      fechaExpedicion: formData.fechaExpedicion,
      fechaVencimiento: formData.fechaVencimiento,
      ciudadExpedicion: formData.ciudadExpedicion,
      domicilio: formData.domicilio,
      telefonoCasa: formData.telefonoCasa,
      celular: formData.celular,
      correoElectronico: formData.correoElectronico,
      otrosNumeros: formData.otrosNumeros,
      listaNumeros: formData.listaNumeros,
      correosAdicionales: formData.correosAdicionales,
      redesSociales: formData.redesSociales,
      plataformasAdicionales: formData.plataformasAdicionales,
      listaPlataformas: formData.listaPlataformas,
    },
    mode: 'onChange'
  })

  const watchOtrosNumeros = watch('otrosNumeros')
  const watchPlataformasAdicionales = watch('plataformasAdicionales')
  const watchFechaVencimiento = watch('fechaVencimiento')

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  // Validación de 6 meses mínimos de vigencia del pasaporte
  useEffect(() => {
    if (watchFechaVencimiento) {
      const fechaVenc = new Date(watchFechaVencimiento)
      const fechaActual = new Date()
      const seisMeses = new Date()
      seisMeses.setMonth(seisMeses.getMonth() + 6)
      
      if (fechaVenc < seisMeses) {
        alert('⚠️ ADVERTENCIA: El pasaporte debe tener una vigencia mínima de 6 meses.')
      }
    }
  }, [watchFechaVencimiento])

  const onSubmit = (data: Step2FormData) => {
    updateFormData(data)
    router.push('/form/step-3')
  }

  const onSave = () => {
    const data = watch()
    updateFormData(data)
    alert('✅ Borrador guardado exitosamente')
  }

  return (
    <FormWrapper
      title="Pasaporte y Contacto"
      description="Información del pasaporte, domicilio y datos de contacto"
      onNext={() => handleSubmit(onSubmit)()}
      onSave={onSave}
      isValid={isValid}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Alerta importante */}
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-warning-600 mr-3">⚠️</div>
            <div>
              <h4 className="font-semibold text-warning-800">IMPORTANTE:</h4>
              <p className="text-sm text-warning-700">
                Su pasaporte debe tener una vigencia mínima de 6 meses posterior a la fecha en que va a viajar.
              </p>
            </div>
          </div>
        </div>

        {/* Sección: Información del Pasaporte */}
        <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">
            Información del Pasaporte
          </h3>
          
          <div className="space-y-4">
            <Input
              {...register('numeroPasaporte', { 
                required: 'El número de pasaporte es requerido',
                minLength: { value: 6, message: 'Número de pasaporte muy corto' }
              })}
              label="Número de Pasaporte"
              placeholder="Número de pasaporte"
              error={errors.numeroPasaporte?.message}
              required
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                {...register('fechaExpedicion', { required: 'La fecha de expedición es requerida' })}
                type="date"
                label="Fecha de Expedición"
                error={errors.fechaExpedicion?.message}
                required
              />
              <Input
                {...register('fechaVencimiento', { required: 'La fecha de vencimiento es requerida' })}
                type="date"
                label="Fecha de Vencimiento"
                error={errors.fechaVencimiento?.message}
                required
              />
            </div>

            <Input
              {...register('ciudadExpedicion', { required: 'La ciudad de expedición es requerida' })}
              label="Ciudad de Expedición"
              placeholder="Ciudad donde se expidió el pasaporte"
              error={errors.ciudadExpedicion?.message}
              required
            />
          </div>
        </div>

        {/* Sección: Domicilio */}
        <div className="bg-gray-50 rounded-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Domicilio de Casa
          </h3>
          
          <div className="space-y-4">
            <TextArea
              {...register('domicilio', { required: 'El domicilio completo es requerido' })}
              label="Domicilio completo con colonia y código postal"
              placeholder="Calle, número, colonia, código postal, municipio, estado"
              rows={3}
              helperText="Incluya: calle, número, colonia, código postal, municipio y estado"
              error={errors.domicilio?.message}
              required
            />

            <Input
              {...register('telefonoCasa')}
              type="tel"
              label="Teléfono de Casa"
              placeholder="Incluir código de área (ej: +52 33 1234 5678)"
              helperText="Opcional - Si no tiene, déjelo vacío"
              error={errors.telefonoCasa?.message}
            />

            <Input
              {...register('celular', { 
                required: 'El número de celular es requerido',
                pattern: {
                  value: /^[\+]?[0-9\s\-]{10,}$/,
                  message: 'Formato de teléfono inválido'
                }
              })}
              type="tel"
              label="Número de Celular"
              placeholder="+52 123 456 7890"
              error={errors.celular?.message}
              required
            />
          </div>
        </div>

        {/* Sección: Información de Contacto */}
        <div className="bg-secondary-50 rounded-lg p-6 border border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Información de Contacto
          </h3>
          
          <div className="space-y-4">
            <Input
              {...register('correoElectronico', { 
                required: 'El correo electrónico es requerido',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Formato de correo inválido'
                }
              })}
              type="email"
              label="Correo Electrónico (obligatorio)"
              placeholder="ejemplo@correo.com"
              error={errors.correoElectronico?.message}
              required
            />

            <RadioGroup 
              label="¿Ha utilizado otros números de teléfono en los últimos 5 años?"
              error={errors.otrosNumeros?.message}
            >
              <RadioOption
                {...register('otrosNumeros', { required: 'Debe responder esta pregunta' })}
                value="SI"
                label="Sí"
              >
                {watchOtrosNumeros === 'SI' && (
                  <TextArea
                    {...register('listaNumeros', { 
                      required: watchOtrosNumeros === 'SI' ? 'Liste los números anteriores' : false 
                    })}
                    placeholder="Liste los números telefónicos anteriores"
                    rows={2}
                    error={errors.listaNumeros?.message}
                  />
                )}
              </RadioOption>
              <RadioOption
                {...register('otrosNumeros')}
                value="NO"
                label="No"
              />
            </RadioGroup>

            <TextArea
              {...register('correosAdicionales')}
              label="Direcciones de correos adicionales en los últimos 5 años"
              placeholder="Liste correos electrónicos adicionales utilizados"
              rows={2}
              helperText="Opcional - Solo si ha utilizado otros correos"
              error={errors.correosAdicionales?.message}
            />
          </div>
        </div>

        {/* Sección: Redes Sociales */}
        <div className="bg-gray-50 rounded-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Redes Sociales
          </h3>
          
          <div className="space-y-4">
            <TextArea
              {...register('redesSociales', { required: 'Debe listar sus redes sociales' })}
              label="Nombre de redes sociales que maneja y nombre de usuario (sin contraseña)"
              placeholder="Ejemplo:&#10;INSTAGRAM: usuario123&#10;FACEBOOK: Nombre Apellido&#10;TWITTER: @usuario"
              rows={4}
              helperText="Incluya todas las plataformas: Facebook, Instagram, Twitter, LinkedIn, TikTok, etc."
              error={errors.redesSociales?.message}
              required
            />

            <RadioGroup 
              label="¿Utiliza plataformas de redes sociales adicionales en los últimos 5 años?"
              error={errors.plataformasAdicionales?.message}
            >
              <RadioOption
                {...register('plataformasAdicionales')}
                value="SI"
                label="Sí"
              >
                {watchPlataformasAdicionales === 'SI' && (
                  <TextArea
                    {...register('listaPlataformas')}
                    placeholder="Especifique plataformas y usuarios anteriores"
                    rows={2}
                    error={errors.listaPlataformas?.message}
                  />
                )}
              </RadioOption>
              <RadioOption
                {...register('plataformasAdicionales')}
                value="NO"
                label="No"
              />
            </RadioGroup>
          </div>
        </div>

      </form>
    </FormWrapper>
  )
}