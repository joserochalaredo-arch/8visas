'use client'

import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDS160Store } from '@/store/ds160-store'
import { useClientProgress } from '@/hooks/use-client-progress'
import { useAuthStore } from '@/store/auth-store'
import { FormWrapper } from '@/components/form-wrapper'
import { ClientInfoPanel } from '@/components/client-info-panel'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioOption } from '@/components/ui/radio-group'
import { useState, useEffect } from 'react'

interface Step1FormData {
  ciudadCita: 'TIJUANA' | 'NOGALES' | 'CIUDAD_JUAREZ' | 'NUEVO_LAREDO' | 'MONTERREY' | 'MATAMOROS' | 'GUADALAJARA' | 'HERMOSILLO' | 'CIUDAD_DE_MEXICO' | 'MERIDA' | ''
  citaCAS: 'TIJUANA' | 'NOGALES' | 'CIUDAD_JUAREZ' | 'NUEVO_LAREDO' | 'MONTERREY' | 'MATAMOROS' | 'GUADALAJARA' | 'HERMOSILLO' | 'CIUDAD_DE_MEXICO' | 'MERIDA' | ''
  nombreCompleto: string
  fechaNacimiento: string
  ciudadNacimiento: string
  estadoNacimiento: string
  paisNacimiento: string
  otraNacionalidad: 'SI' | 'NO' | ''
  especificarNacionalidad?: string
}

export default function Step1() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { formData, updateFormData, setCurrentStep } = useDS160Store()
  const { updateProgress } = useClientProgress()
  const { login } = useAuthStore()
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<Step1FormData>({
    defaultValues: {
      ciudadCita: formData.ciudadCita,
      citaCAS: formData.citaCAS,
      nombreCompleto: formData.nombreCompleto,
      fechaNacimiento: formData.fechaNacimiento,
      ciudadNacimiento: formData.ciudadNacimiento,
      estadoNacimiento: formData.estadoNacimiento,
      paisNacimiento: formData.paisNacimiento,
      otraNacionalidad: formData.otraNacionalidad,
      especificarNacionalidad: formData.especificarNacionalidad,
    },
    mode: 'onChange'
  })

  const watchCiudadCita = watch('ciudadCita')
  const watchCitaCAS = watch('citaCAS')
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
                // Prellenar el nombre del cliente en el formulario
                setValue('nombreCompleto', clientWithToken.name || '')
                return // Mantener en la página actual del DS-160
              }
            }
          } catch (error) {
            console.error('Error validating token:', error)
          }
        }
        // Si el token no es válido, redirigir
        router.push('/')
        return
      }
      
      // Si no hay token en URL, verificar autenticación normal
      const authData = localStorage.getItem('auth-storage')
      if (!authData) {
        router.push('/')
        return
      }
      
      try {
        const parsed = JSON.parse(authData)
        if (!parsed?.state?.isAuthenticated) {
          router.push('/')
        }
      } catch (error) {
        router.push('/')
      }
    }
    
    // Ejecutar la verificación con un pequeño retraso
    setTimeout(checkAuth, 100)
  }, [router, searchParams, login, setValue])

  const onSubmit = (data: Step1FormData) => {
    updateFormData(data)
    updateProgress(1, { step1: data }) // Actualizar progreso en admin
    router.push('/form/step-2')
  }

  const onSave = () => {
    const data = watch()
    updateFormData(data)
    alert('✅ Borrador guardado exitosamente')
  }

  return (
    <div>
      {/* Panel de información del cliente */}
      <ClientInfoPanel currentStep={1} />
      
      <FormWrapper
        title="Información Personal y Cita"
        description="Complete su información personal básica y seleccione la ciudad donde desea la cita"
        onNext={() => handleSubmit(onSubmit)()}
        onSave={onSave}
        isValid={isValid}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Sección: Ciudad de la Cita */}
        <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">
            Información de la Cita
          </h3>
          
          <RadioGroup 
            label="Ciudad en donde quiere la cita consular (marcar con X)"
            error={errors.ciudadCita?.message}
          >
            <RadioOption
              {...register('ciudadCita', { required: 'Debe seleccionar una ciudad' })}
              value="TIJUANA"
              label="Tijuana"
            />
            <RadioOption
              {...register('ciudadCita')}
              value="NOGALES"
              label="Nogales"
            />
            <RadioOption
              {...register('ciudadCita')}
              value="CIUDAD_JUAREZ"
              label="Ciudad Juárez"
            />
            <RadioOption
              {...register('ciudadCita')}
              value="NUEVO_LAREDO"
              label="Nuevo Laredo"
            />
            <RadioOption
              {...register('ciudadCita')}
              value="MONTERREY"
              label="Monterrey"
            />
            <RadioOption
              {...register('ciudadCita')}
              value="MATAMOROS"
              label="Matamoros"
            />
            <RadioOption
              {...register('ciudadCita')}
              value="GUADALAJARA"
              label="Guadalajara"
            />
            <RadioOption
              {...register('ciudadCita')}
              value="HERMOSILLO"
              label="Hermosillo"
            />
            <RadioOption
              {...register('ciudadCita')}
              value="CIUDAD_DE_MEXICO"
              label="Ciudad de México"
            />
            <RadioOption
              {...register('ciudadCita')}
              value="MERIDA"
              label="Mérida"
            />
          </RadioGroup>
          
          {/* Pregunta sobre cita CAS */}
          <div className="mt-6">
            <RadioGroup 
              label="Ciudad donde quiere la cita CAS (marcar con X)"
              error={errors.citaCAS?.message}
            >
              <RadioOption
                {...register('citaCAS', { required: 'Debe seleccionar una ciudad para CAS' })}
                value="TIJUANA"
                label="Tijuana"
              />
              <RadioOption
                {...register('citaCAS')}
                value="NOGALES"
                label="Nogales"
              />
              <RadioOption
                {...register('citaCAS')}
                value="CIUDAD_JUAREZ"
                label="Ciudad Juárez"
              />
              <RadioOption
                {...register('citaCAS')}
                value="NUEVO_LAREDO"
                label="Nuevo Laredo"
              />
              <RadioOption
                {...register('citaCAS')}
                value="MONTERREY"
                label="Monterrey"
              />
              <RadioOption
                {...register('citaCAS')}
                value="MATAMOROS"
                label="Matamoros"
              />
              <RadioOption
                {...register('citaCAS')}
                value="GUADALAJARA"
                label="Guadalajara"
              />
              <RadioOption
                {...register('citaCAS')}
                value="HERMOSILLO"
                label="Hermosillo"
              />
              <RadioOption
                {...register('citaCAS')}
                value="CIUDAD_DE_MEXICO"
                label="Ciudad de México"
              />
              <RadioOption
                {...register('citaCAS')}
                value="MERIDA"
                label="Mérida"
              />
            </RadioGroup>
          </div>
        </div>

        {/* Sección: Datos Personales */}
        <div className="bg-gray-50 rounded-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Datos Personales
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

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                {...register('fechaNacimiento', { required: 'La fecha de nacimiento es requerida' })}
                type="date"
                label="Fecha de Nacimiento"
                error={errors.fechaNacimiento?.message}
                required
              />
              <Input
                {...register('ciudadNacimiento', { required: 'La ciudad de nacimiento es requerida' })}
                label="Ciudad de Nacimiento"
                placeholder="Ciudad"
                error={errors.ciudadNacimiento?.message}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                {...register('estadoNacimiento', { required: 'El estado de nacimiento es requerido' })}
                label="Estado de Nacimiento"
                placeholder="Estado"
                error={errors.estadoNacimiento?.message}
                required
              />
              <Input
                {...register('paisNacimiento', { required: 'El país de nacimiento es requerido' })}
                label="País de Nacimiento"
                placeholder="País"
                error={errors.paisNacimiento?.message}
                required
              />
            </div>

            <RadioGroup 
              label="¿Tiene otra nacionalidad?"
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
                label="No"
              />
            </RadioGroup>
          </div>
        </div>

        </form>
      </FormWrapper>
    </div>
  )
}