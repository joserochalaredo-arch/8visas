'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useDS160Store } from '@/store/ds160-store'
import { useClientProgress } from '@/hooks/use-client-progress'
import { FormWrapper } from '@/components/form-wrapper'
import { ClientInfoPanel } from '@/components/client-info-panel'
import { Input } from '@/components/ui/input'
import { TextArea } from '@/components/ui/textarea'
import { RadioGroup, RadioOption } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Download, FileText, CheckCircle } from 'lucide-react'

interface Step7FormData {
  ciudadExpedicionVisaAnterior?: string
  fechaExpedicionVisaAnterior?: string
  fechaVencimientoVisaAnterior?: string
  fechaUltimaEntradaUSA?: string
  duracionUltimaEstancia?: string
  haExtraviadoVisa: 'SI' | 'NO' | ''
  explicacionExtravioVisa?: string
  leHanNegadoVisa: 'SI' | 'NO' | ''
  explicacionNegacionVisa?: string
  haExtraviadoPasaporte: 'SI' | 'NO' | ''
  paisesVisitados?: string
  parientesInmediatosUSA?: string
}

export default function Step7() {
  const router = useRouter()
  const { formData, updateFormData, setCurrentStep, markStepCompleted } = useDS160Store()
  const { updateProgress } = useClientProgress()
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<Step7FormData>({
    defaultValues: {
      ciudadExpedicionVisaAnterior: formData.ciudadExpedicionVisaAnterior,
      fechaExpedicionVisaAnterior: formData.fechaExpedicionVisaAnterior,
      fechaVencimientoVisaAnterior: formData.fechaVencimientoVisaAnterior,
      fechaUltimaEntradaUSA: formData.fechaUltimaEntradaUSA,
      duracionUltimaEstancia: formData.duracionUltimaEstancia,
      haExtraviadoVisa: formData.haExtraviadoVisa,
      explicacionExtravioVisa: formData.explicacionExtravioVisa,
      leHanNegadoVisa: formData.leHanNegadoVisa,
      explicacionNegacionVisa: formData.explicacionNegacionVisa,
      haExtraviadoPasaporte: formData.haExtraviadoPasaporte,
      paisesVisitados: formData.paisesVisitados,
      parientesInmediatosUSA: formData.parientesInmediatosUSA,
    },
    mode: 'onChange'
  })

  const watchHaExtraviadoVisa = watch('haExtraviadoVisa')
  const watchLeHanNegadoVisa = watch('leHanNegadoVisa')
  const [showSummary, setShowSummary] = useState(false)

  useEffect(() => {
    setCurrentStep(7)
  }, [setCurrentStep])

  const onSubmit = (data: Step7FormData) => {
    updateFormData(data)
    markStepCompleted(7)
    updateProgress(7, { step7: data }) // Actualizar progreso al 100%
    
    // Redirigir a la página de finalización en lugar de mostrar el resumen
    router.push('/form/complete')
  }

  const onSave = () => {
    const data = watch()
    updateFormData(data)
    alert('✅ Borrador guardado exitosamente')
  }

  const exportData = () => {
    const allData = { ...formData, ...watch() }
    
    let content = '='.repeat(80) + '\n'
    content += 'FORMULARIO DS-160 - INFORMACIÓN PARA VISA AMERICANA\n'
    content += '='.repeat(80) + '\n\n'
    
    content += 'INFORMACIÓN PERSONAL\n'
    content += '-'.repeat(40) + '\n'
    content += `Nombre Completo: ${allData.nombreCompleto || 'N/A'}\n`
    content += `Fecha de Nacimiento: ${allData.fechaNacimiento || 'N/A'}\n`
    content += `Lugar de Nacimiento: ${allData.ciudadNacimiento}, ${allData.estadoNacimiento}, ${allData.paisNacimiento}\n`
    content += `Otra Nacionalidad: ${allData.otraNacionalidad === 'SI' ? allData.especificarNacionalidad : 'No'}\n\n`
    
    content += 'INFORMACIÓN DEL PASAPORTE\n'
    content += '-'.repeat(40) + '\n'
    content += `Número de Pasaporte: ${allData.numeroPasaporte || 'N/A'}\n`
    content += `Fecha de Expedición: ${allData.fechaExpedicion || 'N/A'}\n`
    content += `Fecha de Vencimiento: ${allData.fechaVencimiento || 'N/A'}\n`
    content += `Ciudad de Expedición: ${allData.ciudadExpedicion || 'N/A'}\n\n`
    
    content += 'CONTACTO\n'
    content += '-'.repeat(40) + '\n'
    content += `Domicilio: ${allData.domicilio || 'N/A'}\n`
    content += `Teléfono Casa: ${allData.telefonoCasa || 'No tiene'}\n`
    content += `Celular: ${allData.celular || 'N/A'}\n`
    content += `Email: ${allData.correoElectronico || 'N/A'}\n`
    content += `Redes Sociales: ${allData.redesSociales || 'N/A'}\n\n`
    
    content += `Fecha de generación: ${new Date().toLocaleString('es-MX')}\n`
    content += '='.repeat(80)
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `DS160_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const hasRequiredFields = () => {
    const data = watch()
    return !!(data.haExtraviadoVisa && data.leHanNegadoVisa && data.haExtraviadoPasaporte)
  }

  if (showSummary) {
    return (
      <FormWrapper
        title="¡Formulario Completado!"
        description="Su formulario DS-160 ha sido completado exitosamente"
        showSave={false}
      >
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-success-600" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900">
            ¡Excelente! Su formulario está completo
          </h3>
          
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ha completado exitosamente todos los pasos del formulario DS-160. 
            Ahora puede exportar su información y utilizarla para completar el formulario oficial.
          </p>
          
          <div className="bg-success-50 border border-success-200 rounded-lg p-6">
            <h4 className="font-semibold text-success-800 mb-2">¿Qué sigue?</h4>
            <ol className="text-sm text-success-700 text-left space-y-1">
              <li>1. Exporte sus datos usando el botón de abajo</li>
              <li>2. Visite ceac.state.gov/genniv para el DS-160 oficial</li>
              <li>3. Use la información recopilada para completar el formulario</li>
              <li>4. Programe su cita consular</li>
              <li>5. ¡Prepare sus documentos para la entrevista!</li>
            </ol>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={exportData}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar Datos Completos
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="flex items-center"
            >
              <FileText className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 mt-8">
            <p>
              * Es indispensable contestar todas las preguntas y haber realizado el pago en efectivo,
              depósito, transferencia para poder agendar la cita.
            </p>
          </div>
        </div>
      </FormWrapper>
    )
  }

  return (
    <FormWrapper
      title="Historial de Viajes y Visas"
      description="Información sobre visas anteriores y viajes a Estados Unidos"
      onNext={() => handleSubmit(onSubmit)()}
      onSave={onSave}
      isValid={hasRequiredFields()}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Sección: Visa Anterior */}
        <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">
            Visa Anterior
          </h3>
          <p className="text-sm text-primary-700 mb-4">
            En la visa láser viene mes/día/año
          </p>
          
          <div className="space-y-4">
            <Input
              {...register('ciudadExpedicionVisaAnterior')}
              label="Ciudad de Expedición"
              placeholder="Ejemplo: Caracas"
              helperText="Si nunca ha tenido visa, escriba 'PRIMERA VEZ'"
              error={errors.ciudadExpedicionVisaAnterior?.message}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                {...register('fechaExpedicionVisaAnterior')}
                type="date"
                label="Fecha de Expedición"
                error={errors.fechaExpedicionVisaAnterior?.message}
              />
              <Input
                {...register('fechaVencimientoVisaAnterior')}
                type="date"
                label="Fecha de Vencimiento"
                error={errors.fechaVencimientoVisaAnterior?.message}
              />
            </div>
          </div>
        </div>

        {/* Sección: Datos de las Últimas 3 Entradas a USA */}
        <div className="bg-secondary-50 rounded-lg p-6 border border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Datos de las Últimas 3 Entradas a USA
          </h3>
          <p className="text-sm text-secondary-700 mb-4">
            Si no las recuerda o no tiene sello poner fecha aproximada
          </p>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                {...register('fechaUltimaEntradaUSA')}
                type="date"
                label="Día / Mes / Año de última entrada"
                helperText="Si nunca ha viajado, escriba 'NUNCA'"
                error={errors.fechaUltimaEntradaUSA?.message}
              />
              <Input
                {...register('duracionUltimaEstancia')}
                label="Duración de la Estancia"
                placeholder="Ejemplo: 6 meses, 2 semanas"
                error={errors.duracionUltimaEstancia?.message}
              />
            </div>
          </div>
        </div>

        {/* Sección: Preguntas de Seguridad */}
        <div className="bg-warning-50 rounded-lg p-6 border border-warning-200">
          <h3 className="text-lg font-semibold text-warning-900 mb-4">
            Preguntas de Seguridad
          </h3>
          
          <div className="space-y-6">
            <RadioGroup 
              label="¿Ha extraviado su visa? - Año - explicar"
              error={errors.haExtraviadoVisa?.message}
            >
              <RadioOption
                {...register('haExtraviadoVisa', { required: 'Debe responder esta pregunta' })}
                value="SI"
                label="Sí"
              >
                {watchHaExtraviadoVisa === 'SI' && (
                  <TextArea
                    {...register('explicacionExtravioVisa', { 
                      required: watchHaExtraviadoVisa === 'SI' ? 'Explique las circunstancias' : false 
                    })}
                    placeholder="Explique cuándo y cómo extravió la visa"
                    rows={2}
                    error={errors.explicacionExtravioVisa?.message}
                  />
                )}
              </RadioOption>
              <RadioOption
                {...register('haExtraviadoVisa')}
                value="NO"
                label="No"
              />
            </RadioGroup>

            <RadioGroup 
              label="¿Le han negado la visa? - Año - explicar"
              error={errors.leHanNegadoVisa?.message}
            >
              <RadioOption
                {...register('leHanNegadoVisa', { required: 'Debe responder esta pregunta' })}
                value="SI"
                label="Sí"
              >
                {watchLeHanNegadoVisa === 'SI' && (
                  <TextArea
                    {...register('explicacionNegacionVisa', { 
                      required: watchLeHanNegadoVisa === 'SI' ? 'Explique las razones' : false 
                    })}
                    placeholder="Explique cuándo y por qué le negaron la visa"
                    rows={2}
                    error={errors.explicacionNegacionVisa?.message}
                  />
                )}
              </RadioOption>
              <RadioOption
                {...register('leHanNegadoVisa')}
                value="NO"
                label="No"
              />
            </RadioGroup>

            <RadioGroup 
              label="¿Ha extraviado su pasaporte? - Año"
              error={errors.haExtraviadoPasaporte?.message}
            >
              <RadioOption
                {...register('haExtraviadoPasaporte', { required: 'Debe responder esta pregunta' })}
                value="SI"
                label="Sí"
              />
              <RadioOption
                {...register('haExtraviadoPasaporte')}
                value="NO"
                label="No"
              />
            </RadioGroup>
          </div>
        </div>

        {/* Sección: Historial de Viajes */}
        <div className="bg-gray-50 rounded-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Historial de Viajes
          </h3>
          
          <div className="space-y-4">
            <TextArea
              {...register('paisesVisitados')}
              label="Países visitados en los últimos 5 años"
              placeholder="Ejemplo: México, Colombia, Nicaragua, España"
              rows={3}
              helperText="Liste todos los países que ha visitado en los últimos 5 años"
              error={errors.paisesVisitados?.message}
            />

            <TextArea
              {...register('parientesInmediatosUSA')}
              label="Parientes Inmediatos en USA"
              placeholder="Nombre, Apellido, Estatus - ciudadano o residente&#10;Parentesco - Padre, madre, hijos, hermanos..."
              rows={4}
              helperText="Liste familiares directos que viven en Estados Unidos"
              error={errors.parientesInmediatosUSA?.message}
            />
          </div>
        </div>

        {/* Información final */}
        <div className="bg-success-50 border border-success-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-success-600 mr-3 mt-0.5">🎉</div>
            <div>
              <h4 className="font-semibold text-success-800">¡Último Paso!</h4>
              <p className="text-sm text-success-700 mt-1">
                Está a punto de completar su formulario DS-160. Revise cuidadosamente toda la información 
                antes de enviar. Una vez completado, podrá exportar todos sus datos.
              </p>
            </div>
          </div>
        </div>

      </form>
    </FormWrapper>
  )
}