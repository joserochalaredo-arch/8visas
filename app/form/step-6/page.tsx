'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useDS160Store } from '@/store/ds160-store'
import { FormWrapper } from '@/components/form-wrapper'
import { Input } from '@/components/ui/input'
import { TextArea } from '@/components/ui/textarea'
import { RadioGroup, RadioOption } from '@/components/ui/radio-group'
import { useState, useEffect } from 'react'

interface Step6FormData {
  nombrePadre?: string
  fechaNacimientoPadre?: string
  nombreMadre?: string
  fechaNacimientoMadre?: string
  
  nombreConyuge?: string
  fechaNacimientoConyuge?: string
  ciudadNacimientoConyuge?: string
  fechaMatrimonio?: string
  domicilioConyuge?: string
  
  numeroMatrimoniosAnteriores?: string
  nombreCompletoExConyuge?: string
  domicilioExConyuge?: string
  fechaNacimientoExConyuge?: string
  fechaMatrimonioAnterior?: string
  fechaDivorcio?: string
  terminosDivorcio?: string
}

export default function Step6() {
  const router = useRouter()
  const { formData, updateFormData, setCurrentStep } = useDS160Store()
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<Step6FormData>({
    defaultValues: {
      nombrePadre: formData.nombrePadre,
      fechaNacimientoPadre: formData.fechaNacimientoPadre,
      nombreMadre: formData.nombreMadre,
      fechaNacimientoMadre: formData.fechaNacimientoMadre,
      nombreConyuge: formData.nombreConyuge,
      fechaNacimientoConyuge: formData.fechaNacimientoConyuge,
      ciudadNacimientoConyuge: formData.ciudadNacimientoConyuge,
      fechaMatrimonio: formData.fechaMatrimonio,
      domicilioConyuge: formData.domicilioConyuge,
      numeroMatrimoniosAnteriores: formData.numeroMatrimoniosAnteriores,
      nombreCompletoExConyuge: formData.nombreCompletoExConyuge,
      domicilioExConyuge: formData.domicilioExConyuge,
      fechaNacimientoExConyuge: formData.fechaNacimientoExConyuge,
      fechaMatrimonioAnterior: formData.fechaMatrimonioAnterior,
      fechaDivorcio: formData.fechaDivorcio,
      terminosDivorcio: formData.terminosDivorcio,
    },
    mode: 'onChange'
  })

  const estadoCivil = formData.estadoCivil

  useEffect(() => {
    setCurrentStep(6)
  }, [setCurrentStep])

  const onSubmit = (data: Step6FormData) => {
    updateFormData(data)
    router.push('/form/step-7')
  }

  const onSave = () => {
    const data = watch()
    updateFormData(data)
    alert('✅ Borrador guardado exitosamente')
  }

  return (
    <FormWrapper
      title="Información Familiar"
      description="Datos de padres, cónyuge y matrimonios (si aplica)"
      onNext={() => handleSubmit(onSubmit)()}
      onSave={onSave}
      isValid={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Sección: Información de los Padres */}
        <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">
            Información de los Padres
          </h3>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                {...register('nombrePadre')}
                label="Apellido y Nombre del Padre"
                placeholder="Nombre completo del padre"
                helperText="Si ha fallecido o no lo conoce, indíquelo"
                error={errors.nombrePadre?.message}
              />
              <Input
                {...register('fechaNacimientoPadre')}
                type="date"
                label="Fecha de Nacimiento del Padre"
                helperText="Si no conoce la fecha exacta, aproximada"
                error={errors.fechaNacimientoPadre?.message}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                {...register('nombreMadre')}
                label="Apellido y Nombre de la Madre"
                placeholder="Nombre completo de la madre"
                helperText="Si ha fallecido o no la conoce, indíquelo"
                error={errors.nombreMadre?.message}
              />
              <Input
                {...register('fechaNacimientoMadre')}
                type="date"
                label="Fecha de Nacimiento de la Madre"
                helperText="Si no conoce la fecha exacta, aproximada"
                error={errors.fechaNacimientoMadre?.message}
              />
            </div>
          </div>
        </div>

        {/* Sección: Datos del Cónyuge (si está casado) */}
        {estadoCivil === 'CASADO' && (
          <div className="bg-secondary-50 rounded-lg p-6 border border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Datos del Cónyuge Actual
            </h3>
            
            <div className="space-y-4">
              <Input
                {...register('nombreConyuge')}
                label="Nombre del Cónyuge Actual"
                placeholder="Nombre completo de su esposo(a)"
                error={errors.nombreConyuge?.message}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  {...register('fechaNacimientoConyuge')}
                  type="date"
                  label="Fecha de Nac. del Cónyuge"
                  error={errors.fechaNacimientoConyuge?.message}
                />
                <Input
                  {...register('ciudadNacimientoConyuge')}
                  label="Ciudad de Nac. del Cónyuge"
                  placeholder="Ciudad, Estado, País"
                  error={errors.ciudadNacimientoConyuge?.message}
                />
              </div>

              <Input
                {...register('fechaMatrimonio')}
                type="date"
                label="Fecha de Matrimonio"
                error={errors.fechaMatrimonio?.message}
              />

              <TextArea
                {...register('domicilioConyuge')}
                label="Domicilio del Cónyuge"
                placeholder="En caso de ser distinto al suyo"
                rows={2}
                helperText="Complete solo si viven en direcciones diferentes"
                error={errors.domicilioConyuge?.message}
              />
            </div>
          </div>
        )}

        {/* Sección: Matrimonios Anteriores (si es viudo o divorciado) */}
        {(estadoCivil === 'DIVORCIADO' || estadoCivil === 'VIUDO') && (
          <div className="bg-warning-50 rounded-lg p-6 border border-warning-200">
            <h3 className="text-lg font-semibold text-warning-900 mb-4">
              Matrimonios Anteriores
            </h3>
            
            <div className="space-y-4">
              <Input
                {...register('numeroMatrimoniosAnteriores')}
                label="Número de matrimonios anteriores"
                placeholder="Ejemplo: 1, 2, 3..."
                helperText="¿Cuántas veces ha estado casado(a) anteriormente?"
                error={errors.numeroMatrimoniosAnteriores?.message}
              />

              <Input
                {...register('nombreCompletoExConyuge')}
                label="Nombre Completo del Ex-Cónyuge"
                placeholder="Nombre completo de su ex-esposo(a)"
                error={errors.nombreCompletoExConyuge?.message}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  {...register('fechaNacimientoExConyuge')}
                  type="date"
                  label="Fecha de Nacimiento del Ex-Cónyuge"
                  error={errors.fechaNacimientoExConyuge?.message}
                />
                <Input
                  {...register('fechaMatrimonioAnterior')}
                  type="date"
                  label="Fecha de Matrimonio Anterior"
                  error={errors.fechaMatrimonioAnterior?.message}
                />
              </div>

              <TextArea
                {...register('domicilioExConyuge')}
                label="Domicilio del Ex-Cónyuge"
                placeholder="Dirección actual de su ex-cónyuge (si la conoce)"
                rows={2}
                error={errors.domicilioExConyuge?.message}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  {...register('fechaDivorcio')}
                  type="date"
                  label="Fecha y Lugar de Nacimiento del Ex-Cónyuge / Fecha de Matrimonio"
                  helperText="Si es viudo(a), fecha de fallecimiento"
                  error={errors.fechaDivorcio?.message}
                />
                <TextArea
                  {...register('terminosDivorcio')}
                  label="Términos del Divorcio / Defunción del cónyuge"
                  placeholder="Breve descripción de cómo terminó el matrimonio"
                  rows={2}
                  error={errors.terminosDivorcio?.message}
                />
              </div>
            </div>
          </div>
        )}

        {/* Si es soltero */}
        {estadoCivil === 'SOLTERO' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-gray-600 mr-3">ℹ️</div>
              <div>
                <h4 className="font-semibold text-gray-800">Estado Civil: Soltero(a)</h4>
                <p className="text-sm text-gray-700">
                  Como su estado civil es soltero(a), no necesita completar la información de cónyuge o matrimonios anteriores.
                  Solo la información de sus padres es necesaria.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-gray-600 mr-3 mt-0.5">💡</div>
            <div>
              <h4 className="font-semibold text-gray-800">Información Importante</h4>
              <ul className="text-sm text-gray-700 mt-1 space-y-1">
                <li>• Si alguno de sus padres ha fallecido, puede indicarlo en el campo del nombre</li>
                <li>• Las fechas pueden ser aproximadas si no recuerda la fecha exacta</li>
                <li>• Para matrimonios anteriores, proporcione toda la información disponible</li>
                <li>• Si no conoce la dirección actual de un ex-cónyuge, indique "DESCONOZCO"</li>
              </ul>
            </div>
          </div>
        </div>

      </form>
    </FormWrapper>
  )
}