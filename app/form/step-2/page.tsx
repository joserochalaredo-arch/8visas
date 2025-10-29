'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useDS160Store } from '@/store/ds160-store'
import { useStepNavigation } from '@/hooks/useStepNavigation'
import { FormWrapper } from '@/components/form-wrapper'
import { Input } from '@/components/ui/input'
import { TextArea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioOption } from '@/components/ui/radio-group'
import { useNotificationModal } from '@/components/notification-modal'
import { useState, useEffect, Suspense } from 'react'

interface Step2FormData {
  numeroPasaporte: string
  fechaExpedicion: string
  fechaVencimiento: string
  ciudadExpedicion: string
  domicilioCasa: string
  telefonoCasa: string
  celular: string
  correoElectronico: string
  haUtilizadoOtrosNumeros: 'SI' | 'NO' | ''
  listaOtrosNumeros?: string
  correosAdicionales: string
  redesSociales: string
  plataformasAdicionales: 'SI' | 'NO' | ''
  listaPlataformasAdicionales?: string
  idiomas: string
  estadoCivil: 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'SEPARADO' | ''
}

export default function Step2() {
  const router = useRouter()
  const { formData, setCurrentStep } = useDS160Store()
  const { navigateToNextStep, saveDraft } = useStepNavigation()
  
  // Hook de notificaciones
  const { showSuccess, showError, showWarning, NotificationModal } = useNotificationModal()
  
  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<Step2FormData>({
    defaultValues: {
      numeroPasaporte: formData.numeroPasaporte || '',
      fechaExpedicion: formData.fechaExpedicion || '',
      fechaVencimiento: formData.fechaVencimiento || '',
      ciudadExpedicion: formData.ciudadExpedicion || '',
      domicilioCasa: formData.domicilio || '',
      telefonoCasa: formData.telefonoCasa || '',
      celular: formData.celular || '',
      correoElectronico: formData.correoElectronico || '',
      haUtilizadoOtrosNumeros: formData.otrosNumeros || '',
      listaOtrosNumeros: formData.listaNumeros || '',
      correosAdicionales: formData.correosAdicionales || '',
      redesSociales: formData.redesSociales || '',
      plataformasAdicionales: formData.plataformasAdicionales || '',
      listaPlataformasAdicionales: formData.listaPlataformas || '',
      idiomas: formData.idiomas || '',
      estadoCivil: formData.estadoCivil || ''
    },
    mode: 'onChange'
  })

  const watchHaUtilizadoOtrosNumeros = watch('haUtilizadoOtrosNumeros')
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
        showWarning(
          '⚠️ Advertencia sobre vigencia del pasaporte',
          'El pasaporte debe tener una vigencia mínima de 6 meses a partir de la fecha actual. Por favor, verifique la fecha de vencimiento antes de continuar.'
        )
      }
    }
  }, [watchFechaVencimiento])

  const onSubmit = async (data: Step2FormData) => {
    console.log('🚀 Step 2 data:', data)
    
    try {
      await navigateToNextStep(2, data)
    } catch (error) {
      console.error('❌ Error en submit Step 2:', error)
      showError(
        'Error al procesar el formulario',
        'No se pudo procesar la información del paso 2. Por favor, verifica tus datos e inténtalo de nuevo.'
      )
    }
  }

  const onSave = async () => {
    try {
      const data = watch()
      const saved = await saveDraft(2, data)
      if (saved) {
        showSuccess(
          '✅ Borrador guardado',
          'Sus datos del paso 2 han sido guardados exitosamente. Puede continuar más tarde.'
        )
      } else {
        showError(
          '❌ Error al guardar',
          'No se pudo guardar el borrador del paso 2. Verifique su conexión e inténtelo de nuevo.'
        )
      }
    } catch (error) {
      console.error('❌ Error guardando Step 2:', error)
      showError(
        '❌ Error al guardar',
        'Ocurrió un error inesperado al guardar el borrador del paso 2. Inténtelo de nuevo.'
      )
    }
  }

  return (
    <>
      <FormWrapper
        title="Pasaporte y Contacto"
        description="Información del pasaporte, domicilio y datos de contacto"
        onNext={() => handleSubmit(onSubmit)()}
        onSave={onSave}
        isValid={isValid}
        clientFullName={formData.nombreCompleto}
      >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Alerta importante sobre vigencia del pasaporte */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-yellow-600 mr-3">⚠️</div>
            <div>
              <h4 className="font-semibold text-yellow-800">IMPORTANTE:</h4>
              <p className="text-sm text-yellow-700">
                su Pasaporte debe tener una vigencia mínima de 6 meses posterior a la fecha en que va a viajar.
              </p>
            </div>
          </div>
        </div>

        {/* Sección: Información del Pasaporte */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            🛂 Información del Pasaporte
          </h3>
          
          <div className="space-y-4">
            <Input
              {...register('numeroPasaporte', { 
                required: 'El número de pasaporte es requerido',
                minLength: { value: 6, message: 'Número de pasaporte muy corto' }
              })}
              label="NÚMERO DE PASAPORTE"
              placeholder="Ejemplo: 166956432"
              error={errors.numeroPasaporte?.message}
              required
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                {...register('fechaExpedicion', { required: 'La fecha de expedición es requerida' })}
                type="date"
                label="FECHA DE EXPEDICIÓN (DD/MMM/AAAA)"
                error={errors.fechaExpedicion?.message}
                required
              />
              <Input
                {...register('fechaVencimiento', { required: 'La fecha de vencimiento es requerida' })}
                type="date"
                label="FECHA DE VENCIMIENTO (DD/MMM/AAAA)"
                error={errors.fechaVencimiento?.message}
                required
              />
            </div>

            <Input
              {...register('ciudadExpedicion', { required: 'La ciudad de expedición es requerida' })}
              label="CIUDAD DE EXPEDICIÓN"
              placeholder="Ejemplo: CARABOBO"
              error={errors.ciudadExpedicion?.message}
              required
            />
          </div>
        </div>

        {/* Sección: Domicilio */}
        <div className="bg-gray-50 rounded-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🏠 Domicilio de Casa
          </h3>
          
          <div className="space-y-4">
            <TextArea
              {...register('domicilioCasa', { required: 'El domicilio de casa es requerido' })}
              label="DOMICILIO DE CASA con colonia y código postal"
              placeholder="Ejemplo: URB. GUAYABAL, CONJUNTO J, CASA NRO 60, MUN. SAN JOAQUIN, EDO CARABOBO."
              rows={3}
              helperText="Incluya: urbanización, conjunto, casa/apartamento, municipio, estado"
              error={errors.domicilioCasa?.message}
              required
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                {...register('telefonoCasa')}
                type="tel"
                label="TELÉFONO DE CASA"
                placeholder="NO TENGO (si no tiene)"
                helperText="Escriba 'NO TENGO' si no tiene teléfono de casa"
                error={errors.telefonoCasa?.message}
              />
              <Input
                {...register('celular', { 
                  required: 'El número de celular es requerido'
                })}
                type="tel"
                label="CELULAR"
                placeholder="Ejemplo: +584244037938"
                error={errors.celular?.message}
                required
              />
            </div>
          </div>
        </div>

        {/* Sección: Información de Contacto */}
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            📧 Información de Contacto
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
              label="CORREO ELECTRÓNICO *obligatorio*"
              placeholder="Ejemplo: samgusmathias@gmail.COM"
              error={errors.correoElectronico?.message}
              required
            />

            <RadioGroup 
              label="HA UTILIZADO OTROS NUMERO DE TELEFONO EL LOS ULTIMOS 5 AÑOS (PONER LOS NUMEROS)"
              error={errors.haUtilizadoOtrosNumeros?.message}
            >
              <RadioOption
                {...register('haUtilizadoOtrosNumeros', { required: 'Debe responder esta pregunta' })}
                value="SI"
                label="Sí"
              >
                {watchHaUtilizadoOtrosNumeros === 'SI' && (
                  <TextArea
                    {...register('listaOtrosNumeros', { 
                      required: watchHaUtilizadoOtrosNumeros === 'SI' ? 'Liste los números anteriores' : false 
                    })}
                    placeholder="Liste los números telefónicos anteriores que ha utilizado"
                    rows={2}
                    error={errors.listaOtrosNumeros?.message}
                  />
                )}
              </RadioOption>
              <RadioOption
                {...register('haUtilizadoOtrosNumeros')}
                value="NO"
                label="No"
              />
            </RadioGroup>

            <Input
              {...register('correosAdicionales')}
              type="email"
              label="DIRECCIONES DE CORREOS ADICIONALES EN LOS ULTIMOS 5 AÑOS"
              placeholder="Ejemplo: SAMGUSALCEDO30@GMAIL.COM"
              helperText="Opcional - Solo si ha utilizado otros correos"
              error={errors.correosAdicionales?.message}
            />
          </div>
        </div>

        {/* Sección: Redes Sociales */}
        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-4">
            📱 Redes Sociales
          </h3>
          
          <div className="space-y-4">
            <TextArea
              {...register('redesSociales', { required: 'Debe listar sus redes sociales' })}
              label="NOMBRE DE REDES SOCIALES QUE MANEJA Y NOMBRE DE USUARIO (SIN CONTRASEÑA)"
              placeholder="Ejemplo:&#10;INSTAGRAM: GUSTAVOSALCEDO577&#10;FACEBOOK: GUSTAVO SALCEDO"
              rows={3}
              helperText="Incluya todas las plataformas: Instagram, Facebook, Twitter, LinkedIn, TikTok, etc."
              error={errors.redesSociales?.message}
              required
            />

            <RadioGroup 
              label="UTILIZA PLATAFORMA DE REDES SOCIALES ADICIONALES EN LOS ULTIMOS 5 AÑOS"
              error={errors.plataformasAdicionales?.message}
            >
              <RadioOption
                {...register('plataformasAdicionales')}
                value="SI"
                label="Sí"
              >
                {watchPlataformasAdicionales === 'SI' && (
                  <TextArea
                    {...register('listaPlataformasAdicionales')}
                    placeholder="Especifique plataformas y usuarios anteriores"
                    rows={2}
                    error={errors.listaPlataformasAdicionales?.message}
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

        {/* Sección: Información Personal Adicional */}
        <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
          <h3 className="text-lg font-semibold text-orange-900 mb-4">
            👤 Información Personal Adicional
          </h3>
          
          <div className="space-y-4">
            <Input
              {...register('idiomas', { 
                required: 'Debe indicar los idiomas que habla' 
              })}
              label="IDIOMAS QUE HABLA"
              placeholder="Ejemplo: ESPAÑOL/INGLES"
              error={errors.idiomas?.message}
              required
            />

            <RadioGroup 
              label="ESTADO CIVIL"
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
        </div>

      </form>
    </FormWrapper>
    
    {/* Modal de Notificaciones */}
    <NotificationModal />
    </>
  )
}