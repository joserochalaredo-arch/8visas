'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useDS160Store } from '@/store/ds160-store'
import { FormWrapper } from '@/components/form-wrapper'
import { Input } from '@/components/ui/input'
import { TextArea } from '@/components/ui/textarea'
import { useState, useEffect } from 'react'

interface Step5FormData {
  fechaInicioEstudios?: string
  fechaTerminoEstudios?: string
  nombreEscuela?: string
  gradoCarrera?: string
  domicilioEscuela?: string
  telefonoEscuela?: string
  ciudadEscuela?: string
  
  fechaInicioTrabajo?: string
  fechaFinTrabajo?: string
  nombreEmpresa?: string
  nombrePatron?: string
  domicilioEmpresa?: string
  telefonoEmpresa?: string
  puestoDesempenado?: string
  salarioMensual?: string
}

export default function Step5() {
  const router = useRouter()
  const { formData, updateFormData, setCurrentStep } = useDS160Store()
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<Step5FormData>({
    defaultValues: {
      fechaInicioEstudios: formData.fechaInicioEstudios,
      fechaTerminoEstudios: formData.fechaTerminoEstudios,
      nombreEscuela: formData.nombreEscuela,
      gradoCarrera: formData.gradoCarrera,
      domicilioEscuela: formData.domicilioEscuela,
      telefonoEscuela: formData.telefonoEscuela,
      ciudadEscuela: formData.ciudadEscuela,
      fechaInicioTrabajo: formData.fechaInicioTrabajo,
      fechaFinTrabajo: formData.fechaFinTrabajo,
      nombreEmpresa: formData.nombreEmpresa,
      nombrePatron: formData.nombrePatron,
      domicilioEmpresa: formData.domicilioEmpresa,
      telefonoEmpresa: formData.telefonoEmpresa,
      puestoDesempenado: formData.puestoDesempenado,
      salarioMensual: formData.salarioMensual,
    },
    mode: 'onChange'
  })

  useEffect(() => {
    setCurrentStep(5)
  }, [setCurrentStep])

  const onSubmit = (data: Step5FormData) => {
    updateFormData(data)
    router.push('/form/step-6')
  }

  const onSave = () => {
    const data = watch()
    updateFormData(data)
    alert('✅ Borrador guardado exitosamente')
  }

  return (
    <FormWrapper
      title="Educación y Trabajo"
      description="Historial académico y laboral (requerido para mayores de 7 años)"
      onNext={() => handleSubmit(onSubmit)()}
      onSave={onSave}
      isValid={true} // Este paso es principalmente informativo
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Alerta informativa */}
        <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-secondary-600 mr-3">🎓</div>
            <div>
              <h4 className="font-semibold text-secondary-800">Estudios para Mayores de 7 Años</h4>
              <p className="text-sm text-secondary-700">
                Favor de llenarlo de manera obligatoria si tiene estudios Universitarios Y si no del último grado de estudios
              </p>
            </div>
          </div>
        </div>

        {/* Sección: Educación */}
        <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">
            Información Educativa
          </h3>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                {...register('fechaInicioEstudios')}
                type="month"
                label="Fecha de Inicio (MM/AAAA)"
                helperText="Ejemplo: Julio 1998"
                error={errors.fechaInicioEstudios?.message}
              />
              <Input
                {...register('fechaTerminoEstudios')}
                type="month"
                label="Fecha de Término (MM/AAAA)"
                helperText="Ejemplo: Enero 2003"
                error={errors.fechaTerminoEstudios?.message}
              />
            </div>

            <Input
              {...register('nombreEscuela')}
              label="Nombre de Escuela"
              placeholder="Ejemplo: Universidad Autónoma de Guadalajara"
              error={errors.nombreEscuela?.message}
            />

            <Input
              {...register('gradoCarrera')}
              label="Grado que Cursa o Carrera Estudiada"
              placeholder="Ejemplo: Licenciatura en Ingeniería, Preparatoria, Primaria, etc."
              error={errors.gradoCarrera?.message}
            />

            <TextArea
              {...register('domicilioEscuela')}
              label="Domicilio completo con CP"
              placeholder="Dirección completa de la institución educativa"
              rows={2}
              error={errors.domicilioEscuela?.message}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                {...register('telefonoEscuela')}
                type="tel"
                label="Teléfono"
                placeholder="+52 33 1234 5678"
                error={errors.telefonoEscuela?.message}
              />
              <Input
                {...register('ciudadEscuela')}
                label="Ciudad"
                placeholder="Ciudad donde está la escuela"
                error={errors.ciudadEscuela?.message}
              />
            </div>
          </div>
        </div>

        {/* Sección: Trabajo */}
        <div className="bg-warning-50 rounded-lg p-6 border border-warning-200">
          <div className="flex items-start mb-4">
            <div className="text-warning-600 mr-3 mt-0.5">💼</div>
            <div>
              <h3 className="text-lg font-semibold text-warning-900">Trabajo</h3>
              <p className="text-sm text-warning-700">
                Detalles de empleo, incluso si es negocio propio, de los últimos 5 años.
                Si no ha trabajado, o está jubilado, por favor proporcione los datos de su último empleo.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                {...register('fechaInicioTrabajo')}
                type="month"
                label="Fecha de Inicio (AÑO - MES)"
                helperText="Fecha de inicio del empleo actual/último"
                error={errors.fechaInicioTrabajo?.message}
              />
              <Input
                {...register('fechaFinTrabajo')}
                type="month"
                label="Fecha de Fin (AÑO - MES)"
                helperText="Si trabaja actualmente, ponga fecha futura"
                error={errors.fechaFinTrabajo?.message}
              />
            </div>

            <Input
              {...register('nombreEmpresa')}
              label="Nombre de la Empresa"
              placeholder="Nombre completo de la empresa o negocio"
              error={errors.nombreEmpresa?.message}
            />

            <Input
              {...register('nombrePatron')}
              label="Nombre del Patrón"
              placeholder="Nombre del jefe directo o supervisor"
              error={errors.nombrePatron?.message}
            />

            <TextArea
              {...register('domicilioEmpresa')}
              label="Domicilio de la Empresa con CP"
              placeholder="Dirección completa del lugar de trabajo"
              rows={2}
              error={errors.domicilioEmpresa?.message}
            />

            <Input
              {...register('telefonoEmpresa')}
              type="tel"
              label="Teléfono de la Empresa"
              placeholder="+52 33 1234 5678"
              error={errors.telefonoEmpresa?.message}
            />

            <TextArea
              {...register('puestoDesempenado')}
              label="Puesto Desempeñado - descripción"
              placeholder="Describa brevemente sus responsabilidades y funciones"
              rows={3}
              helperText="Explique qué tipo de trabajo realiza o realizaba"
              error={errors.puestoDesempenado?.message}
            />

            <Input
              {...register('salarioMensual')}
              type="text"
              label="Salario Mensual Aproximado"
              placeholder="$"
              helperText="Indique su salario mensual en pesos mexicanos"
              error={errors.salarioMensual?.message}
            />
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-gray-600 mr-3 mt-0.5">💡</div>
            <div>
              <h4 className="font-semibold text-gray-800">Información Importante</h4>
              <ul className="text-sm text-gray-700 mt-1 space-y-1">
                <li>• Si es estudiante y no trabaja, proporcione información de empleos anteriores o trabajos de medio tiempo</li>
                <li>• Si tiene negocio propio, usted es tanto la empresa como el patrón</li>
                <li>• Si está jubilado(a), proporcione información de su último empleo</li>
                <li>• Si nunca ha trabajado, puede indicar "NUNCA HE TRABAJADO" en el campo de empresa</li>
                <li>• Los salarios deben ser aproximados, no necesitan ser exactos</li>
              </ul>
            </div>
          </div>
        </div>

      </form>
    </FormWrapper>
  )
}