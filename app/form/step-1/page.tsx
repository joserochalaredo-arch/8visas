'use client'

import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDS160Store } from '@/store/ds160-store'
import { useClientProgress } from '@/hooks/use-client-progress'
import { useAuthStore } from '@/store/auth-store'
import { FormWrapper } from '@/components/form-wrapper'
import { ClientInfoPanel } from '@/components/client-info-panel'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioOption } from '@/components/ui/radio-group'
import { useState, useEffect, Suspense } from 'react'

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

function Step1Content() {
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

  // Registrar campos de Select para validación
  useEffect(() => {
    register('ciudadCita', { required: 'Debe seleccionar una ciudad para la cita consular' })
    register('citaCAS', { required: 'Debe seleccionar una ciudad para la cita CAS' })
  }, [register])

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

  const handleBackToMenu = () => {
    router.push('/admin/dashboard')
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
        onBackToMenu={handleBackToMenu}
        isValid={isValid}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Sección: Ciudad de la Cita */}
        <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">
            Información de la Cita
          </h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Ciudad en donde quiere la cita consular *
            </label>
            <Select
              value={watchCiudadCita}
              onValueChange={(value) => setValue('ciudadCita', value as any, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione una ciudad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TIJUANA">Tijuana</SelectItem>
                <SelectItem value="NOGALES">Nogales</SelectItem>
                <SelectItem value="CIUDAD_JUAREZ">Ciudad Juárez</SelectItem>
                <SelectItem value="NUEVO_LAREDO">Nuevo Laredo</SelectItem>
                <SelectItem value="MONTERREY">Monterrey</SelectItem>
                <SelectItem value="MATAMOROS">Matamoros</SelectItem>
                <SelectItem value="GUADALAJARA">Guadalajara</SelectItem>
                <SelectItem value="HERMOSILLO">Hermosillo</SelectItem>
                <SelectItem value="CIUDAD_DE_MEXICO">Ciudad de México</SelectItem>
                <SelectItem value="MERIDA">Mérida</SelectItem>
              </SelectContent>
            </Select>
            {errors.ciudadCita && (
              <p className="text-sm text-red-600">{errors.ciudadCita.message}</p>
            )}
          </div>
          
          {/* Pregunta sobre cita CAS */}
          <div className="mt-6 space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Ciudad donde quiere la cita CAS *
            </label>
            <Select
              value={watchCitaCAS}
              onValueChange={(value) => setValue('citaCAS', value as any, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione una ciudad para CAS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TIJUANA">Tijuana</SelectItem>
                <SelectItem value="NOGALES">Nogales</SelectItem>
                <SelectItem value="CIUDAD_JUAREZ">Ciudad Juárez</SelectItem>
                <SelectItem value="NUEVO_LAREDO">Nuevo Laredo</SelectItem>
                <SelectItem value="MONTERREY">Monterrey</SelectItem>
                <SelectItem value="MATAMOROS">Matamoros</SelectItem>
                <SelectItem value="GUADALAJARA">Guadalajara</SelectItem>
                <SelectItem value="HERMOSILLO">Hermosillo</SelectItem>
                <SelectItem value="CIUDAD_DE_MEXICO">Ciudad de México</SelectItem>
                <SelectItem value="MERIDA">Mérida</SelectItem>
              </SelectContent>
            </Select>
            {errors.citaCAS && (
              <p className="text-sm text-red-600">{errors.citaCAS.message}</p>
            )}
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

export default function Step1() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Step1Content />
    </Suspense>
  )
}