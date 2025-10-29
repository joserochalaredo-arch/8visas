'use client'

import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDS160Store } from '@/store/ds160-store'
import { useStepNavigation } from '@/hooks/useStepNavigation'
import { useAuthStore } from '@/store/auth-store'
import { FormWrapper } from '@/components/form-wrapper'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioOption } from '@/components/ui/radio-group'
import { useNotificationModal } from '@/components/notification-modal'
import { useState, useEffect, Suspense } from 'react'

interface Step1FormData {
  nombreCompleto: string
  fechaNacimiento: string
  ciudadEstadoPaisNacimiento: string
  otraNacionalidad: 'SI' | 'NO' | ''
  especificarNacionalidad?: string
  consuladoDeseado: string
  oficinaCAS: string
}

function Step1Content() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { formData, setCurrentStep } = useDS160Store()
  const { navigateToNextStep, saveDraft } = useStepNavigation()
  const { login } = useAuthStore()
  
  // Hook de notificaciones
  const { showSuccess, showError, NotificationModal } = useNotificationModal()
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<Step1FormData>({
    defaultValues: {
      nombreCompleto: formData.nombreCompleto || '',
      fechaNacimiento: formData.fechaNacimiento || '',
      ciudadEstadoPaisNacimiento: formData.ciudadEstadoPaisNacimiento || '',
      otraNacionalidad: formData.otraNacionalidad || '',
      especificarNacionalidad: formData.especificarNacionalidad || '',
      consuladoDeseado: (formData as any).consuladoDeseado || '',
      oficinaCAS: (formData as any).oficinaCAS || ''
    },
    mode: 'onChange'
  })

  const watchOtraNacionalidad = watch('otraNacionalidad')

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  // Verificar autenticación o token de URL
  useEffect(() => {
    const checkAuth = () => {
      const urlToken = searchParams.get('token')
      
      if (urlToken) {
        // Verificar que el token sea válido en el admin store
        const adminStorage = localStorage.getItem('admin-storage')
        if (adminStorage) {
          try {
            const adminData = JSON.parse(adminStorage)
            const clients = adminData.state?.clients || []
            const clientWithToken = clients.find((c: any) => c.token === urlToken && c.isActive)
            
            if (clientWithToken) {
              // Autenticar automáticamente con el token
              const loginSuccess = login(urlToken)
              if (loginSuccess) {
                return // Mantener en la página actual del DS-160
              }
            }
          } catch (error) {
            console.error('Error validating token:', error)
          }
        }
        // Si el token no es válido, redirigir
        console.log('Token no válido, redirigiendo...')
        router.push('/')
        return
      }
      
      // Si no hay token en URL, verificar autenticación normal
      const authData = localStorage.getItem('auth-storage')
      if (!authData) {
        console.log('No hay datos de auth, redirigiendo...')
        router.push('/')
        return
      }
      
      try {
        const parsed = JSON.parse(authData)
        if (!parsed?.state?.isAuthenticated) {
          console.log('No autenticado, redirigiendo...')
          router.push('/')
        }
      } catch (error) {
        console.log('Error parsing auth data, redirigiendo...')
        router.push('/')
      }
    }
    
    // Ejecutar la verificación con un pequeño retraso
    setTimeout(checkAuth, 100)
  }, [router, searchParams, login])

  const onSubmit = async (data: Step1FormData) => {
    console.log('🚀 Form submitted with data:', data)
    console.log('🚀 Navegando automáticamente a step-2...')
    
    try {
      // Usar la navegación automática mejorada
      await navigateToNextStep(1, data)
    } catch (error) {
      console.error('❌ Error en submit:', error)
      showError(
        'Error al procesar el formulario',
        'No se pudo procesar la información del formulario. Por favor, verifica tus datos e inténtalo de nuevo.'
      )
    }
  }

  const onSave = async () => {
    try {
      const data = watch()
      const saved = await saveDraft(1, data)
      if (saved) {
        showSuccess(
          '✅ Borrador guardado',
          'Sus datos han sido guardados exitosamente. Puede continuar más tarde.'
        )
      } else {
        showError(
          '❌ Error al guardar',
          'No se pudo guardar el borrador. Verifique su conexión e inténtelo de nuevo.'
        )
      }
    } catch (error) {
      console.error('❌ Error guardando:', error)
      showError(
        '❌ Error al guardar',
        'Ocurrió un error inesperado al guardar el borrador. Inténtelo de nuevo.'
      )
    }
  }

  const handleBackToMenu = () => {
    router.push('/admin/dashboard')
  }

  return (
    <div>
      <FormWrapper
        title="Información Personal"
        description="Datos personales básicos y selección de consulado/CAS"
        onNext={() => handleSubmit(onSubmit)()}
        onSave={onSave}
        onBackToMenu={handleBackToMenu}
        isValid={isValid}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Sección: Selección de Consulado y CAS - AL PRINCIPIO */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              🏛️ Selección de Consulado y Oficina CAS
            </h3>

            <div className="space-y-6">
              {/* Consulado Deseado */}
              <div>
                <RadioGroup 
                  label="Consulado Deseado (9 consulados + embajada CDMX) *"
                  error={errors.consuladoDeseado?.message}
                >
                  <RadioOption
                    {...register('consuladoDeseado', { required: 'Debe seleccionar un consulado' })}
                    value="EMBAJADA_CDMX"
                    label="Embajada - Ciudad de México"
                  />
                  <RadioOption
                    {...register('consuladoDeseado')}
                    value="GDL"
                    label="Consulado Guadalajara, Jalisco"
                  />
                  <RadioOption
                    {...register('consuladoDeseado')}
                    value="MTY"
                    label="Consulado Monterrey, Nuevo León"
                  />
                  <RadioOption
                    {...register('consuladoDeseado')}
                    value="TIJ"
                    label="Consulado Tijuana, Baja California"
                  />
                  <RadioOption
                    {...register('consuladoDeseado')}
                    value="JUA"
                    label="Consulado Ciudad Juárez, Chihuahua"
                  />
                  <RadioOption
                    {...register('consuladoDeseado')}
                    value="NOG"
                    label="Consulado Nogales, Sonora"
                  />
                  <RadioOption
                    {...register('consuladoDeseado')}
                    value="NLD"
                    label="Consulado Nuevo Laredo, Tamaulipas"
                  />
                  <RadioOption
                    {...register('consuladoDeseado')}
                    value="MAT"
                    label="Consulado Matamoros, Tamaulipas"
                  />
                  <RadioOption
                    {...register('consuladoDeseado')}
                    value="HER"
                    label="Consulado Hermosillo, Sonora"
                  />
                  <RadioOption
                    {...register('consuladoDeseado')}
                    value="MER"
                    label="Consulado Mérida, Yucatán"
                  />
                </RadioGroup>
              </div>

              {/* Oficina CAS */}
              <div>
                <RadioGroup 
                  label="Oficina CAS (10 oficinas disponibles) *"
                  error={errors.oficinaCAS?.message}
                >
                  <RadioOption
                    {...register('oficinaCAS', { required: 'Debe seleccionar una oficina CAS' })}
                    value="CAS_GDL"
                    label="CAS Guadalajara, Jalisco"
                  />
                  <RadioOption
                    {...register('oficinaCAS')}
                    value="CAS_MTY"
                    label="CAS Monterrey, Nuevo León"
                  />
                  <RadioOption
                    {...register('oficinaCAS')}
                    value="CAS_MEX"
                    label="CAS Ciudad de México"
                  />
                  <RadioOption
                    {...register('oficinaCAS')}
                    value="CAS_TIJ"
                    label="CAS Tijuana, Baja California"
                  />
                  <RadioOption
                    {...register('oficinaCAS')}
                    value="CAS_JUA"
                    label="CAS Ciudad Juárez, Chihuahua"
                  />
                  <RadioOption
                    {...register('oficinaCAS')}
                    value="CAS_NOG"
                    label="CAS Nogales, Sonora"
                  />
                  <RadioOption
                    {...register('oficinaCAS')}
                    value="CAS_NLD"
                    label="CAS Nuevo Laredo, Tamaulipas"
                  />
                  <RadioOption
                    {...register('oficinaCAS')}
                    value="CAS_MAT"
                    label="CAS Matamoros, Tamaulipas"
                  />
                  <RadioOption
                    {...register('oficinaCAS')}
                    value="CAS_HER"
                    label="CAS Hermosillo, Sonora"
                  />
                  <RadioOption
                    {...register('oficinaCAS')}
                    value="CAS_MER"
                    label="CAS Mérida, Yucatán"
                  />
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Sección: Información Personal */}
          <div className="bg-gray-50 rounded-lg p-6 border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Datos Personales
            </h3>
            
            <div className="space-y-4">
              <Input
                {...register('nombreCompleto', { 
                  required: 'El nombre completo es requerido',
                  minLength: { value: 2, message: 'Nombre debe tener al menos 2 caracteres' }
                })}
                label="Nombre Completo (Como viene en el pasaporte)"
                placeholder="Apellidos y Nombres"
                helperText="Escriba exactamente como aparece en su pasaporte"
                error={errors.nombreCompleto?.message}
                required
              />

              <Input
                {...register('fechaNacimiento', { required: 'La fecha de nacimiento es requerida' })}
                type="date"
                label="Fecha de Nacimiento (DD/MM/AAAA)"
                error={errors.fechaNacimiento?.message}
                required
              />

              <Input
                {...register('ciudadEstadoPaisNacimiento', { required: 'La ciudad, estado, país de nacimiento es requerido' })}
                label="Ciudad, Estado, País - De Nacimiento"
                placeholder="Ejemplo: Yaracuy, Venezuela"
                error={errors.ciudadEstadoPaisNacimiento?.message}
                required
              />

              <RadioGroup 
                label="¿Tiene otra nacionalidad? (especificar)"
                error={errors.otraNacionalidad?.message}
              >
                <RadioOption
                  {...register('otraNacionalidad', { required: 'Debe indicar si tiene otra nacionalidad' })}
                  value="SI"
                  label="Sí"
                >
                  {watchOtraNacionalidad === 'SI' && (
                    <Input
                      {...register('especificarNacionalidad', { 
                        required: watchOtraNacionalidad === 'SI' ? 'Especifique la nacionalidad' : false 
                      })}
                      placeholder="Especificar nacionalidad"
                      error={errors.especificarNacionalidad?.message}
                    />
                  )}
                </RadioOption>
                <RadioOption
                  {...register('otraNacionalidad')}
                  value="NO"
                  label="No Aplica"
                />
              </RadioGroup>
            </div>
          </div>

        </form>
      </FormWrapper>

      {/* Modal de Notificaciones */}
      <NotificationModal />
    </div>
  )
}

export default function Step1() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Step1Content />
    </Suspense>
  )
}