'use client'

import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDS160Store } from '@/store/ds160-store'
import { useAdminStore } from '@/store/admin-store'
import { useStepNavigation } from '@/hooks/useStepNavigation'
import { useFormPersistence } from '@/hooks/use-form-persistence'
import { Input } from '@/components/ui/input'
import { TextArea } from '@/components/ui/textarea'
import { RadioGroup, RadioOption } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { useNotificationModal } from '@/components/notification-modal'
import { PDFGenerator } from '@/components/pdf-generator'
import { useEffect, useState } from 'react'

// Interface completa para todo el formulario DS-160
interface CompleteDS160FormData {
  // SECCIÓN 1: Información Personal
  nombreCompleto: string
  fechaNacimiento: string
  ciudadEstadoPaisNacimiento: string
  otraNacionalidad: 'SI' | 'NO' | ''
  especificarNacionalidad?: string
  consuladoDeseado: string
  oficinaCAS: string

  // SECCIÓN 2: Pasaporte y Contacto
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

  // SECCIÓN 3: Información Laboral
  fechaInicioTrabajo: string
  fechaFinTrabajo: string
  nombreEmpresa: string
  nombrePatron: string
  domicilioEmpresa: string
  telefonoEmpresa: string
  puestoDesempenado: string
  salarioMensualAproximado: string

  // SECCIÓN 4: Viaje a Estados Unidos
  fechaLlegadaUSA: string
  duracionEstanciaUSA: string
  hotelDomicilio: string
  telefonoHotel: string
  viajaConFamiliar: 'SI' | 'NO' | ''
  nombreFamiliar?: string
  parentescoFamiliar?: string
  estatusFamiliar?: string
  domicilioFamiliar?: string
  telefonoFamiliar?: string

  // SECCIÓN 5: Estudios (mayores de 7 años)
  fechaInicioEstudios: string
  fechaTerminoEstudios: string
  nombreEscuela: string
  gradoCarreraEstudiada: string
  domicilioEscuela: string
  telefonoEscuela: string
  ciudadEscuela: string

  // SECCIÓN 6: Visa Anterior y Viajes
  ciudadExpedicionVisaAnterior: string
  fechaExpedicionVisaAnterior: string
  fechaVencimientoVisaAnterior: string
  fechaEntrada1USA: string
  duracionEstancia1: string
  fechaEntrada2USA: string
  duracionEstancia2: string
  fechaEntrada3USA: string
  duracionEstancia3: string
  paisesVisitados5Anos: string
  parientesInmediatosUSA: string

  // SECCIÓN 7: Información Familiar
  apellidoNombrePadre: string
  fechaNacimientoPadre: string
  apellidoNombreMadre: string
  fechaNacimientoMadre: string
  nombreConyugeActual?: string
  fechaNacimientoConyugeActual?: string
  ciudadNacimientoConyugeActual?: string
  fechaMatrimonio?: string
  domicilioConyugeActual?: string
  esViudoDivorciado: 'SI' | 'NO' | ''
  numeroMatrimoniosAnteriores?: string
  nombreConyugeAnterior?: string
  domicilioConyugeAnterior?: string
  fechaNacimientoConyugeAnterior?: string
  fechaMatrimonioAnterior?: string
  fechaDivorcio?: string
  terminosDivorcio?: string

  // SECCIÓN 5: Antecedentes de Viaje (placeholder)
  haVisitadoUSA: 'SI' | 'NO' | ''
  fechasVisitasAnteriores: string
  visasAnteriores: string

  // SECCIÓN 6: Antecedentes Legales (placeholder)
  arrestosCrimenes: 'SI' | 'NO' | ''
  detallesArrestos: string

  // SECCIÓN 7: Información Adicional (placeholder)
  haExtraviadoVisa: 'SI' | 'NO' | ''
  leHanNegadoVisa: 'SI' | 'NO' | ''
  haExtraviadoPasaporte: 'SI' | 'NO' | ''

  // SECCIÓN FINAL: Preguntas de Seguridad y Antecedentes
  enfermedadesContagiosas: 'SI' | 'NO' | ''
  detallesEnfermedadesContagiosas?: string
  trastornoMentalFisico: 'SI' | 'NO' | ''
  detallesTrastornoMentalFisico?: string
  abusoAdiccionDrogas: 'SI' | 'NO' | ''
  detallesAbusoAdiccionDrogas?: string
  historialCriminal: 'SI' | 'NO' | ''
  detallesHistorialCriminal?: string
  sustanciasControladas: 'SI' | 'NO' | ''
  detallesSustanciasControladas?: string
  prostitucionTrafico: 'SI' | 'NO' | ''
  detallesProstitucionTrafico?: string
  inmigracionIrregular: 'SI' | 'NO' | ''
  detallesInmigracionIrregular?: string
}

export default function CompleteDS160Form() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const { formData, setCurrentStep } = useDS160Store()
  const { getClientByToken } = useAdminStore()
  const { saveDraft } = useStepNavigation()
  const { isLoading: formLoading, isLoaded } = useFormPersistence(token)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormSubmitted, setIsFormSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState<CompleteDS160FormData | null>(null)
  const [isClientAccess, setIsClientAccess] = useState(false)
  const [currentFormStep, setCurrentFormStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  
  // Definición de pasos del formulario
  const formSteps = [
    {
      id: 1,
      title: "Información Personal",
      description: "Datos básicos y selección de consulado",
      icon: "👤",
      requiredFields: ['nombreCompleto', 'fechaNacimiento', 'ciudadEstadoPaisNacimiento', 'otraNacionalidad', 'consuladoDeseado', 'oficinaCAS']
    },
    {
      id: 2, 
      title: "Pasaporte y Contacto",
      description: "Información de pasaporte y datos de contacto",
      icon: "🛂",
      requiredFields: ['numeroPasaporte', 'fechaExpedicion', 'fechaVencimiento', 'ciudadExpedicion', 'domicilioCasa', 'celular', 'correoElectronico', 'haUtilizadoOtrosNumeros', 'redesSociales', 'idiomas', 'estadoCivil']
    },
    {
      id: 3,
      title: "Información Laboral", 
      description: "Detalles de empleo actual o anterior",
      icon: "💼",
      requiredFields: ['fechaInicioTrabajo', 'fechaFinTrabajo', 'nombreEmpresa', 'nombrePatron', 'domicilioEmpresa', 'telefonoEmpresa', 'puestoDesempenado', 'salarioMensualAproximado']
    },
    {
      id: 4,
      title: "Viaje a Estados Unidos",
      description: "Información del viaje planeado", 
      icon: "✈️",
      requiredFields: ['fechaLlegadaUSA', 'duracionEstanciaUSA', 'hotelDomicilio', 'telefonoHotel', 'viajaConFamiliar']
    },
    {
      id: 5,
      title: "Información Educativa",
      description: "Datos de estudios y educación",
      icon: "📚", 
      requiredFields: ['fechaInicioEstudios', 'fechaTerminoEstudios', 'nombreEscuela', 'gradoCarreraEstudiada', 'domicilioEscuela', 'telefonoEscuela', 'ciudadEscuela']
    },
    {
      id: 6,
      title: "Visas y Viajes Anteriores",
      description: "Historial de visas y viajes previos",
      icon: "🌍",
      requiredFields: ['ciudadExpedicionVisaAnterior', 'fechaExpedicionVisaAnterior', 'fechaVencimientoVisaAnterior', 'paisesVisitados5Anos', 'parientesInmediatosUSA']
    },
    {
      id: 7,
      title: "Información Familiar", 
      description: "Datos de padres y cónyuge",
      icon: "👨‍👩‍👧‍👦",
      requiredFields: ['apellidoNombrePadre', 'fechaNacimientoPadre', 'apellidoNombreMadre', 'fechaNacimientoMadre', 'esViudoDivorciado']
    },
    {
      id: 8,
      title: "Preguntas de Seguridad",
      description: "Antecedentes y preguntas importantes",
      icon: "⚠️", 
      requiredFields: ['enfermedadesContagiosas', 'trastornoMentalFisico', 'abusoAdiccionDrogas', 'historialCriminal', 'sustanciasControladas', 'prostitucionTrafico', 'inmigracionIrregular']
    }
  ]
  
  // Hook de notificaciones
  const { 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo, 
    NotificationModal 
  } = useNotificationModal()
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<CompleteDS160FormData>({
    defaultValues: {
      // SECCIÓN 1
      nombreCompleto: formData.nombreCompleto || '',
      fechaNacimiento: formData.fechaNacimiento || '',
      ciudadEstadoPaisNacimiento: formData.ciudadEstadoPaisNacimiento || '',
      otraNacionalidad: formData.otraNacionalidad || '',
      especificarNacionalidad: formData.especificarNacionalidad || '',
      consuladoDeseado: (formData as any).consuladoDeseado || '',
      oficinaCAS: (formData as any).oficinaCAS || '',

      // SECCIÓN 2
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
      estadoCivil: formData.estadoCivil || '',

      // SECCIÓN 3: Información Laboral
      fechaInicioTrabajo: '',
      fechaFinTrabajo: '',
      nombreEmpresa: '',
      nombrePatron: '',
      domicilioEmpresa: '',
      telefonoEmpresa: '',
      puestoDesempenado: '',
      salarioMensualAproximado: '',

      // SECCIÓN 4: Viaje a Estados Unidos
      fechaLlegadaUSA: '',
      duracionEstanciaUSA: '',
      hotelDomicilio: '',
      telefonoHotel: '',
      viajaConFamiliar: '',
      nombreFamiliar: '',
      parentescoFamiliar: '',
      estatusFamiliar: '',
      domicilioFamiliar: '',
      telefonoFamiliar: '',

      // SECCIÓN 5: Estudios
      fechaInicioEstudios: '',
      fechaTerminoEstudios: '',
      nombreEscuela: '',
      gradoCarreraEstudiada: '',
      domicilioEscuela: '',
      telefonoEscuela: '',
      ciudadEscuela: '',

      // SECCIÓN 6: Visa Anterior y Viajes
      ciudadExpedicionVisaAnterior: '',
      fechaExpedicionVisaAnterior: '',
      fechaVencimientoVisaAnterior: '',
      fechaEntrada1USA: '',
      duracionEstancia1: '',
      fechaEntrada2USA: '',
      duracionEstancia2: '',
      fechaEntrada3USA: '',
      duracionEstancia3: '',
      paisesVisitados5Anos: '',
      parientesInmediatosUSA: '',

      // SECCIÓN 7: Información Familiar
      apellidoNombrePadre: '',
      fechaNacimientoPadre: '',
      apellidoNombreMadre: '',
      fechaNacimientoMadre: '',
      nombreConyugeActual: '',
      fechaNacimientoConyugeActual: '',
      ciudadNacimientoConyugeActual: '',
      fechaMatrimonio: '',
      domicilioConyugeActual: '',
      esViudoDivorciado: '',
      numeroMatrimoniosAnteriores: '',
      nombreConyugeAnterior: '',
      domicilioConyugeAnterior: '',
      fechaNacimientoConyugeAnterior: '',
      fechaMatrimonioAnterior: '',
      fechaDivorcio: '',
      terminosDivorcio: '',
      haVisitadoUSA: '',
      fechasVisitasAnteriores: '',
      visasAnteriores: '',
      arrestosCrimenes: '',
      detallesArrestos: '',
      haExtraviadoVisa: '',
      leHanNegadoVisa: '',
      haExtraviadoPasaporte: '',

      // SECCIÓN FINAL: Preguntas de Seguridad
      enfermedadesContagiosas: '',
      detallesEnfermedadesContagiosas: '',
      trastornoMentalFisico: '',
      detallesTrastornoMentalFisico: '',
      abusoAdiccionDrogas: '',
      detallesAbusoAdiccionDrogas: '',
      historialCriminal: '',
      detallesHistorialCriminal: '',
      sustanciasControladas: '',
      detallesSustanciasControladas: '',
      prostitucionTrafico: '',
      detallesProstitucionTrafico: '',
      inmigracionIrregular: '',
      detallesInmigracionIrregular: ''
    },
    mode: 'onChange'
  })

  const watchNombreCompleto = watch('nombreCompleto')
  const watchOtraNacionalidad = watch('otraNacionalidad')
  const watchHaUtilizadoOtrosNumeros = watch('haUtilizadoOtrosNumeros')
  const watchPlataformasAdicionales = watch('plataformasAdicionales')
  const watchFechaVencimiento = watch('fechaVencimiento')
  const watchHaVisitadoUSA = watch('haVisitadoUSA')
  const watchArrestosCrimenes = watch('arrestosCrimenes')
  
  // Watch para nuevas secciones
  const watchViajaConFamiliar = watch('viajaConFamiliar')
  const watchEsViudoDivorciado = watch('esViudoDivorciado')
  
  // Watch para nuevas preguntas de seguridad
  const watchEnfermedadesContagiosas = watch('enfermedadesContagiosas')
  const watchTrastornoMentalFisico = watch('trastornoMentalFisico')
  const watchAbusoAdiccionDrogas = watch('abusoAdiccionDrogas')
  const watchHistorialCriminal = watch('historialCriminal')
  const watchSustanciasControladas = watch('sustanciasControladas')
  const watchProstitucionTrafico = watch('prostitucionTrafico')
  const watchInmigracionIrregular = watch('inmigracionIrregular')

  useEffect(() => {
    setCurrentStep(1)
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
          'El pasaporte debe tener una vigencia mínima de 6 meses a partir de la fecha actual. Por favor, verifique la fecha de vencimiento.'
        )
      }
    }
  }, [watchFechaVencimiento])

  const onSubmit = async (data: CompleteDS160FormData) => {
    setIsSubmitting(true)
    try {
      console.log('🚀 Enviando formulario DS-160 completo:', data)
      
      // Guardar todos los datos
      await saveDraft(7, data) // Marcar como paso 7 (completado)
      
      // Marcar formulario como enviado y guardar datos
      setIsFormSubmitted(true)
      setSubmittedData(data)
      
      // Mostrar mensaje de éxito
      const successMessage = isClientAccess 
        ? `Ha completado todo el formulario DS-160 correctamente.

✅ Sus datos han sido guardados de forma segura
📋 El formulario está listo para generar el PDF
📞 Nos pondremos en contacto con usted para continuar con el proceso

¡Gracias por usar A8Visas!`
        : `Ha completado todo el formulario DS-160 correctamente.

✅ Sus datos han sido guardados de forma segura
📋 El formulario está listo para generar el PDF
📧 Puede descargar su documento desde el panel principal

¡Gracias por usar A8Visas!`

      showSuccess(
        '🎉 ¡FORMULARIO COMPLETADO EXITOSAMENTE!',
        successMessage
      )
    } catch (error) {
      console.error('❌ Error enviando formulario:', error)
      showError(
        '❌ Error al enviar el formulario',
        `Ocurrió un problema al guardar sus datos.
Por favor, inténtalo de nuevo o contacte al soporte técnico.

Detalles: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSave = async () => {
    try {
      const data = watch()
      const saved = await saveDraft(1, data) // Guardar como borrador
      if (saved) {
        showSuccess(
          '💾 Borrador guardado exitosamente',
          `✅ Todos sus datos han sido guardados de forma segura
🔄 Puede continuar llenando el formulario más tarde
📋 Su progreso se mantiene guardado automáticamente

Puede cerrar esta página y regresar cuando guste para continuar.`
        )
      } else {
        showError(
          '❌ Error al guardar el borrador',
          `No se pudieron guardar los datos. 
Por favor, verifique su conexión a internet e inténtelo de nuevo.`
        )
      }
    } catch (error) {
      console.error('❌ Error guardando:', error)
      showError(
        '❌ Error al guardar el borrador',
        `Detalles técnicos: ${error instanceof Error ? error.message : 'Error desconocido'}
      
Por favor, contacte al soporte técnico si el problema persiste.`
      )
    }
  }

  const handleBackToMenu = () => {
    router.push('/admin/dashboard')
  }

  // Funciones de navegación por pasos
  const goToNextStep = () => {
    if (currentFormStep < formSteps.length && isStepComplete(currentFormStep)) {
      setCurrentFormStep(currentFormStep + 1)
      
      // Marcar el paso actual como completado
      if (!completedSteps.includes(currentFormStep)) {
        setCompletedSteps([...completedSteps, currentFormStep])
      }
      
      // Scroll al top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPreviousStep = () => {
    if (currentFormStep > 1) {
      setCurrentFormStep(currentFormStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToStep = (stepId: number) => {
    // Solo permitir ir a pasos completados o al siguiente paso inmediato
    if (stepId <= currentFormStep || completedSteps.includes(stepId - 1)) {
      setCurrentFormStep(stepId)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Función para verificar si un paso está completo
  const isStepComplete = (stepId: number): boolean => {
    const step = formSteps.find(s => s.id === stepId)
    if (!step) return false

    const formValues = watch()
    
    // Verificar campos requeridos
    return step.requiredFields.every(field => {
      const value = formValues[field as keyof CompleteDS160FormData]
      return value !== undefined && value !== '' && value !== null
    })
  }

  // Función para verificar si el botón siguiente debe estar habilitado
  const canProceedToNext = (): boolean => {
    return isStepComplete(currentFormStep)
  }





  // Obtener información del cliente desde el admin store
  const clientInfo = token ? getClientByToken(token) : null
  
  // Verificar si es acceso de cliente (con token) o admin (sin token)
  useEffect(() => {
    setIsClientAccess(!!token)
  }, [token])

  // Efecto para detectar si el formulario ya está completado al cargar
  useEffect(() => {
    if (isLoaded && token) {
      // Verificar el estado del formulario en la API
      fetch(`/api/ds160?token=${token}`)
        .then(response => response.json())
        .then(result => {
          if (result.success && result.data) {
            const status = result.data.status
            const completedAt = result.data.completed_at
            
            // Si el formulario está completado, preservar ese estado
            if (status === 'completed' && completedAt) {
              setIsFormSubmitted(true)
              setSubmittedData(formData as unknown as CompleteDS160FormData)
              console.log('✅ Formulario previamente completado detectado')
            }
          }
        })
        .catch(error => {
          console.error('Error verificando estado del formulario:', error)
        })
    }
  }, [isLoaded, token, formData])

  // Efecto para guardar automáticamente cuando el formulario está listo para envío
  useEffect(() => {
    // Solo ejecutar si el formulario está cargado y no está siendo enviado
    if (!isLoaded || isSubmitting || isFormSubmitted) return

    // Verificar si estamos en el paso final y todo está válido para envío
    const isReadyForSubmission = currentFormStep === 8 && isValid && canProceedToNext()
    
    if (isReadyForSubmission && token) {
      console.log('💾 Formulario completo detectado - Guardando automáticamente como respaldo de seguridad...')
      
      // Guardar silenciosamente sin mostrar notificaciones al usuario
      const currentData = watch()
      saveDraft(8, currentData)
        .then(() => {
          console.log('✅ Respaldo de seguridad guardado exitosamente')
        })
        .catch(error => {
          console.error('⚠️ Error en respaldo de seguridad:', error)
          // No mostrar error al usuario ya que es un guardado silencioso
        })
    }
  }, [currentFormStep, isValid, isLoaded, isSubmitting, isFormSubmitted, token, watch, canProceedToNext, saveDraft])

  // Mostrar loading mientras se cargan los datos
  if (formLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando formulario DS-160</h2>
          <p className="text-gray-600">Recuperando sus datos guardados...</p>
          {token && (
            <p className="text-sm text-gray-500 mt-2">Token: {token}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Fijo */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex-shrink-0">
                <div>
                  <h1 className="text-2xl font-bold text-primary-900">
                    {isClientAccess ? 'Formulario DS-160 - Visa Americana' : 'A8Visas - Formulario DS-160 Completo'}
                  </h1>
                  {clientInfo && clientInfo.clientName && clientInfo.clientName.trim() && (
                    <div className="mt-2 p-3 bg-gradient-to-r from-blue-100 to-indigo-100 border-l-4 border-blue-500 rounded-r-lg">
                      <p className="text-lg font-bold text-blue-900">
                        📋 FORMULARIO PARA: {clientInfo.clientName.toUpperCase()}
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Este formulario DS-160 corresponde a la persona mencionada arriba
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {isClientAccess 
                    ? 'Complete todos los campos del formulario para su trámite de visa'
                    : 'Complete todo el formulario scrolleando hacia abajo'
                  }
                </p>
                {isLoaded && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Datos anteriores cargados correctamente
                  </p>
                )}
              </div>

              {/* Mensaje personalizado con nombre del cliente */}
              {clientInfo && clientInfo.clientName && clientInfo.clientName.trim() && (
                <div className="flex-1 mx-8 text-center">
                  <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-xl px-6 py-4 shadow-lg">
                    <p className="text-xl font-bold text-blue-900 mb-1">
                      🌟 ESTIMADO {clientInfo.clientName.toUpperCase()} 🌟
                    </p>
                    <p className="text-lg font-semibold text-blue-700">
                      AGRADECEMOS SU CONFIANZA
                    </p>
                    <p className="text-sm text-blue-600 mt-2 font-medium">
                      ESTAMOS PARA SERVIRLE • A8VISAS
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4 flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSave}
                  className="flex items-center"
                >
                  💾 Guardar Borrador
                </Button>
                {!isClientAccess && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToMenu}
                    className="flex items-center"
                  >
                    ← Menú Principal
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de Progreso por Pasos */}
      <div className="bg-white border-b sticky top-[88px] z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Información del Paso Actual */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">{formSteps[currentFormStep - 1]?.icon}</span>
                Paso {currentFormStep} de {formSteps.length}: {formSteps[currentFormStep - 1]?.title}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {formSteps[currentFormStep - 1]?.description}
              </p>
            </div>
            
            {/* Indicador de completado */}
            <div className="flex items-center gap-2">
              {isStepComplete(currentFormStep) ? (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Completo</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Pendiente</span>
                </div>
              )}
            </div>
          </div>

          {/* Barra de Progreso */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progreso General</span>
              <span>{Math.round(((completedSteps.length + (isStepComplete(currentFormStep) ? 1 : 0)) / formSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((completedSteps.length + (isStepComplete(currentFormStep) ? 1 : 0)) / formSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Mini navegador de pasos */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            {formSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                disabled={step.id > currentFormStep && !completedSteps.includes(step.id - 1)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                  currentFormStep === step.id
                    ? 'bg-blue-600 text-white'
                    : completedSteps.includes(step.id)
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : step.id < currentFormStep || completedSteps.includes(step.id - 1)
                    ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {completedSteps.includes(step.id) ? '✓' : step.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
          
          {/* Alerta importante sobre vigencia del pasaporte */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-3">⚠️</div>
              <div>
                <h4 className="font-semibold text-yellow-800">IMPORTANTE:</h4>
                <p className="text-sm text-yellow-700">
                  Su pasaporte debe tener una vigencia mínima de 6 meses posterior a la fecha en que va a viajar.
                </p>
              </div>
            </div>
          </div>

          {/* ====================================================================== */}
          {/* PASO 1: INFORMACIÓN PERSONAL Y SELECCIÓN DE CONSULADO */}
          {/* ====================================================================== */}
          {currentFormStep === 1 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">
                📋 SECCIÓN 1: INFORMACIÓN PERSONAL
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Datos personales básicos y selección de consulado/CAS
              </p>
            </div>
            
            <div className="px-6 py-6 space-y-8">
              {/* Selección de Consulado y CAS */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🏛️ Selección de Consulado y Oficina CAS
                </h3>

                <div className="space-y-6">
                  {/* Consulado Deseado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consulado Deseado (9 consulados + embajada CDMX) *
                    </label>
                    <select
                      {...register('consuladoDeseado', { required: 'Debe seleccionar un consulado' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccione un consulado</option>
                      <option value="EMBAJADA_CDMX">Embajada - Ciudad de México</option>
                      <option value="GDL">Consulado Guadalajara, Jalisco</option>
                      <option value="MTY">Consulado Monterrey, Nuevo León</option>
                      <option value="TIJ">Consulado Tijuana, Baja California</option>
                      <option value="JUA">Consulado Ciudad Juárez, Chihuahua</option>
                      <option value="NOG">Consulado Nogales, Sonora</option>
                      <option value="NLD">Consulado Nuevo Laredo, Tamaulipas</option>
                      <option value="MAT">Consulado Matamoros, Tamaulipas</option>
                      <option value="HER">Consulado Hermosillo, Sonora</option>
                      <option value="MER">Consulado Mérida, Yucatán</option>
                    </select>
                    {errors.consuladoDeseado && (
                      <p className="text-red-500 text-sm mt-1">{errors.consuladoDeseado.message}</p>
                    )}
                  </div>

                  {/* Oficina CAS */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Oficina CAS (10 oficinas disponibles) *
                    </label>
                    <select
                      {...register('oficinaCAS', { required: 'Debe seleccionar una oficina CAS' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccione una oficina CAS</option>
                      <option value="CAS_GDL">CAS Guadalajara, Jalisco</option>
                      <option value="CAS_MTY">CAS Monterrey, Nuevo León</option>
                      <option value="CAS_MEX">CAS Ciudad de México</option>
                      <option value="CAS_TIJ">CAS Tijuana, Baja California</option>
                      <option value="CAS_JUA">CAS Ciudad Juárez, Chihuahua</option>
                      <option value="CAS_NOG">CAS Nogales, Sonora</option>
                      <option value="CAS_NLD">CAS Nuevo Laredo, Tamaulipas</option>
                      <option value="CAS_MAT">CAS Matamoros, Tamaulipas</option>
                      <option value="CAS_HER">CAS Hermosillo, Sonora</option>
                      <option value="CAS_MER">CAS Mérida, Yucatán</option>
                    </select>
                    {errors.oficinaCAS && (
                      <p className="text-red-500 text-sm mt-1">{errors.oficinaCAS.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Datos Personales */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  👤 Datos Personales
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
                    placeholder="Ejemplo: Guadalajara, Jalisco, México"
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
            </div>
          </div>
          )}

          {/* ====================================================================== */}
          {/* PASO 2: PASAPORTE Y CONTACTO */}
          {/* ====================================================================== */}
          {currentFormStep === 2 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">
                🛂 SECCIÓN 2: PASAPORTE Y CONTACTO
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Información del pasaporte, domicilio y datos de contacto
              </p>
            </div>
            
            <div className="px-6 py-6 space-y-8">
              {/* Información del Pasaporte */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🛂 Información del Pasaporte
                </h3>
                
                <div className="space-y-4">
                  <Input
                    {...register('numeroPasaporte', { 
                      required: 'El número de pasaporte es requerido',
                      minLength: { value: 6, message: 'Número de pasaporte muy corto' }
                    })}
                    label="NÚMERO DE PASAPORTE"
                    placeholder="Ejemplo: G12345678"
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
                    placeholder="Ejemplo: GUADALAJARA"
                    error={errors.ciudadExpedicion?.message}
                    required
                  />
                </div>
              </div>

              {/* Domicilio */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🏠 Domicilio de Casa
                </h3>
                
                <div className="space-y-4">
                  <TextArea
                    {...register('domicilioCasa', { required: 'El domicilio de casa es requerido' })}
                    label="DOMICILIO DE CASA con colonia y código postal"
                    placeholder="Ejemplo: COL. AMERICANA, CALLE MORELOS 123, GUADALAJARA, JALISCO, C.P. 44160"
                    rows={3}
                    helperText="Incluya: colonia, calle y número, ciudad, estado, código postal"
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
                      placeholder="Ejemplo: +52 33 1234 5678"
                      error={errors.celular?.message}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                    placeholder="Ejemplo: juan.perez@gmail.com"
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
                    placeholder="Ejemplo: juan.trabajo@empresa.com"
                    helperText="Opcional - Solo si ha utilizado otros correos"
                    error={errors.correosAdicionales?.message}
                  />
                </div>
              </div>

              {/* Redes Sociales */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📱 Redes Sociales
                </h3>
                
                <div className="space-y-4">
                  <TextArea
                    {...register('redesSociales', { required: 'Debe listar sus redes sociales' })}
                    label="NOMBRE DE REDES SOCIALES QUE MANEJA Y NOMBRE DE USUARIO (SIN CONTRASEÑA)"
                    placeholder="Ejemplo:&#10;INSTAGRAM: juanperez123&#10;FACEBOOK: Juan Pérez&#10;LINKEDIN: juan-perez-mx"
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

              {/* Información Personal Adicional */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  👤 Información Personal Adicional
                </h3>
                
                <div className="space-y-4">
                  <Input
                    {...register('idiomas', { 
                      required: 'Debe indicar los idiomas que habla' 
                    })}
                    label="IDIOMAS QUE HABLA"
                    placeholder="Ejemplo: ESPAÑOL/INGLÉS"
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
            </div>
          </div>
          )}

          {/* ====================================================================== */}
          {/* PASO 3: INFORMACIÓN LABORAL */}
          {/* ====================================================================== */}
          {currentFormStep === 3 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">
                � SECCIÓN 3: INFORMACIÓN LABORAL
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Detalles de empleo, incluso si es negocio propio, de los últimos 5 años
              </p>
            </div>
            
            <div className="px-6 py-6 space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-yellow-600 mr-3">💼</div>
                  <div>
                    <h4 className="font-semibold text-yellow-800">IMPORTANTE:</h4>
                    <p className="text-sm text-yellow-700">
                      Si no ha trabajado, o está jubilado, por favor proporcione los datos de su último empleo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  {...register('fechaInicioTrabajo')}
                  label="Fecha de Inicio (AÑO - MES)"
                  placeholder="Ejemplo: 2020-01"
                  type="month"
                  error={errors.fechaInicioTrabajo?.message}
                />
                <Input
                  {...register('fechaFinTrabajo')}
                  label="Fecha de Fin (AÑO - MES)"
                  placeholder="Ejemplo: 2025-10 o ACTUAL"
                  error={errors.fechaFinTrabajo?.message}
                />
              </div>

              <div className="space-y-4">
                <Input
                  {...register('nombreEmpresa')}
                  label="Nombre de la Empresa"
                  placeholder="Ejemplo: COCA-COLA FEMSA S.A.B. DE C.V."
                  error={errors.nombreEmpresa?.message}
                />
                
                <Input
                  {...register('nombrePatron')}
                  label="Nombre del Patrón"
                  placeholder="Ejemplo: JOSÉ ANTONIO FERNÁNDEZ CARBAJAL"
                  error={errors.nombrePatron?.message}
                />

                <TextArea
                  {...register('domicilioEmpresa')}
                  label="Domicilio de la Empresa con CP"
                  placeholder="Ejemplo: AV. INSURGENTES SUR 1602, COL. CRÉDITO CONSTRUCTOR, BENITO JUÁREZ, CDMX, C.P. 03940"
                  rows={2}
                  error={errors.domicilioEmpresa?.message}
                />

                <Input
                  {...register('telefonoEmpresa')}
                  type="tel"
                  label="Teléfono de la Empresa"
                  placeholder="Ejemplo: +52 55 1234 5678"
                  error={errors.telefonoEmpresa?.message}
                />

                <TextArea
                  {...register('puestoDesempenado')}
                  label="Puesto Desempeñado - Descripción"
                  placeholder="Ejemplo: GERENTE DE VENTAS - Responsable de la gestión comercial de la zona centro, supervisión de equipo de 15 vendedores, cumplimiento de objetivos de ventas mensuales."
                  rows={3}
                  error={errors.puestoDesempenado?.message}
                />

                <Input
                  {...register('salarioMensualAproximado')}
                  label="Salario Mensual Aproximado"
                  placeholder="$ 25,000 MXN"
                  error={errors.salarioMensualAproximado?.message}
                />
              </div>
            </div>
          </div>
          )}

          {/* ====================================================================== */}
          {/* PASO 4: VIAJE A ESTADOS UNIDOS */}
          {/* ====================================================================== */}
          {currentFormStep === 4 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">
                ✈️ SECCIÓN 4: VIAJE A ESTADOS UNIDOS
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Si no tiene un viaje contemplado puede ser información tentativa, pero se deben llenar todos estos datos
              </p>
            </div>
            
            <div className="px-6 py-6 space-y-8">
              {/* Información del Viaje */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📅 Información del Viaje
                </h3>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      {...register('fechaLlegadaUSA')}
                      type="date"
                      label="Fecha de Llegada"
                      error={errors.fechaLlegadaUSA?.message}
                    />
                    <Input
                      {...register('duracionEstanciaUSA')}
                      label="Duración de la Estancia"
                      placeholder="Ejemplo: 15 días"
                      error={errors.duracionEstanciaUSA?.message}
                    />
                  </div>

                  <TextArea
                    {...register('hotelDomicilio')}
                    label="Hotel (domicilio completo con código postal)"
                    placeholder="Ejemplo: MARRIOTT MARQUIS HOUSTON, 1777 WALKER ST, HOUSTON, TX 77010"
                    rows={2}
                    error={errors.hotelDomicilio?.message}
                  />

                  <Input
                    {...register('telefonoHotel')}
                    type="tel"
                    label="Teléfono del Hotel"
                    placeholder="Ejemplo: +1 713 654 1777"
                    error={errors.telefonoHotel?.message}
                  />
                </div>
              </div>

              {/* Acompañantes */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <RadioGroup 
                  label="¿Va a viajar con un familiar?"
                  error={errors.viajaConFamiliar?.message}
                >
                  <RadioOption
                    {...register('viajaConFamiliar')}
                    value="SI"
                    label="Sí"
                  >
                    {watchViajaConFamiliar === 'SI' && (
                      <div className="space-y-4 mt-4">
                        <Input
                          {...register('nombreFamiliar')}
                          label="Nombre del Familiar"
                          placeholder="Ejemplo: MARÍA ELENA GONZÁLEZ PÉREZ"
                          error={errors.nombreFamiliar?.message}
                        />
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <Input
                            {...register('parentescoFamiliar')}
                            label="Parentesco"
                            placeholder="Ejemplo: ESPOSA"
                            error={errors.parentescoFamiliar?.message}
                          />
                          <Input
                            {...register('estatusFamiliar')}
                            label="Estatus (ciudadano o residente)"
                            placeholder="Ejemplo: CIUDADANO"
                            error={errors.estatusFamiliar?.message}
                          />
                        </div>

                        <TextArea
                          {...register('domicilioFamiliar')}
                          label="Domicilio (completo con código postal)"
                          placeholder="Ejemplo: COL. AMERICANA, CALLE MORELOS 123, GUADALAJARA, JALISCO, C.P. 44160"
                          rows={2}
                          error={errors.domicilioFamiliar?.message}
                        />

                        <Input
                          {...register('telefonoFamiliar')}
                          type="tel"
                          label="Teléfono del Familiar"
                          placeholder="Ejemplo: +52 33 1234 5678"
                          error={errors.telefonoFamiliar?.message}
                        />
                      </div>
                    )}
                  </RadioOption>
                  <RadioOption
                    {...register('viajaConFamiliar')}
                    value="NO"
                    label="No, viajo solo"
                  />
                </RadioGroup>
              </div>
            </div>
          </div>
          )}

          {/* ====================================================================== */}
          {/* PASO 5: ESTUDIOS PARA MAYORES DE 7 AÑOS */}
          {/* ====================================================================== */}
          {currentFormStep === 5 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">
                📚 SECCIÓN 5: ESTUDIOS PARA MAYORES DE 7 AÑOS
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Favor de llenarlo de manera obligatoria si tiene estudios Universitarios. Si no, del último grado de estudios.
              </p>
            </div>
            
            <div className="px-6 py-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  {...register('fechaInicioEstudios')}
                  type="date"
                  label="Fecha de Inicio (DD/MM/AAAA)"
                  error={errors.fechaInicioEstudios?.message}
                />
                <Input
                  {...register('fechaTerminoEstudios')}
                  type="date"
                  label="Fecha de Término (DD/MM/AAAA)"
                  error={errors.fechaTerminoEstudios?.message}
                />
              </div>

              <div className="space-y-4">
                <Input
                  {...register('nombreEscuela')}
                  label="Nombre de Escuela"
                  placeholder="Ejemplo: UNIVERSIDAD DE GUADALAJARA"
                  error={errors.nombreEscuela?.message}
                />

                <Input
                  {...register('gradoCarreraEstudiada')}
                  label="Grado que Cursa o Carrera Estudiada"
                  placeholder="Ejemplo: LICENCIATURA EN ADMINISTRACIÓN DE EMPRESAS"
                  error={errors.gradoCarreraEstudiada?.message}
                />

                <TextArea
                  {...register('domicilioEscuela')}
                  label="Domicilio Completo con CP"
                  placeholder="Ejemplo: AV. JUÁREZ 976, COL. CENTRO, GUADALAJARA, JALISCO, C.P. 44100"
                  rows={2}
                  error={errors.domicilioEscuela?.message}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    {...register('telefonoEscuela')}
                    type="tel"
                    label="Teléfono"
                    placeholder="Ejemplo: +52 33 1378 5900"
                    error={errors.telefonoEscuela?.message}
                  />
                  <Input
                    {...register('ciudadEscuela')}
                    label="Ciudad"
                    placeholder="Ejemplo: GUADALAJARA"
                    error={errors.ciudadEscuela?.message}
                  />
                </div>
              </div>
            </div>
          </div>
          )}

          {/* ====================================================================== */}
          {/* PASO 6: VISA ANTERIOR Y ANTECEDENTES DE VIAJE */}
          {/* ====================================================================== */}
          {currentFormStep === 6 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">
                🛂 SECCIÓN 6: VISA ANTERIOR Y ANTECEDENTES DE VIAJE
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Información sobre visas anteriores y historial de viajes
              </p>
            </div>
            
            <div className="px-6 py-6 space-y-8">
              {/* Visa Anterior */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📄 Visa Anterior
                </h3>
                <p className="text-sm text-gray-600 mb-4">En la visa láser viene mes/día/año</p>
                
                <div className="space-y-4">
                  <Input
                    {...register('ciudadExpedicionVisaAnterior')}
                    label="Ciudad de Expedición"
                    placeholder="Ejemplo: GUADALAJARA"
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

              {/* Últimas 3 Entradas a USA */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🇺🇸 Datos de las Últimas 3 Entradas a USA
                </h3>
                <p className="text-sm text-gray-600 mb-4">Si no las recuerda o no tiene sello, poner fecha aproximada</p>
                
                <div className="space-y-6">
                  {/* Entrada 1 */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      {...register('fechaEntrada1USA')}
                      type="date"
                      label="1ra Entrada - Día/Mes/Año"
                      error={errors.fechaEntrada1USA?.message}
                    />
                    <Input
                      {...register('duracionEstancia1')}
                      label="Duración de la Estancia"
                      placeholder="Ejemplo: 6 MESES"
                      error={errors.duracionEstancia1?.message}
                    />
                  </div>

                  {/* Entrada 2 */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      {...register('fechaEntrada2USA')}
                      type="date"
                      label="2da Entrada - Día/Mes/Año"
                      error={errors.fechaEntrada2USA?.message}
                    />
                    <Input
                      {...register('duracionEstancia2')}
                      label="Duración de la Estancia"
                      placeholder="Ejemplo: 3 MESES"
                      error={errors.duracionEstancia2?.message}
                    />
                  </div>

                  {/* Entrada 3 */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      {...register('fechaEntrada3USA')}
                      type="date"
                      label="3ra Entrada - Día/Mes/Año"
                      error={errors.fechaEntrada3USA?.message}
                    />
                    <Input
                      {...register('duracionEstancia3')}
                      label="Duración de la Estancia"
                      placeholder="Ejemplo: 1 MES"
                      error={errors.duracionEstancia3?.message}
                    />
                  </div>
                </div>
              </div>

              {/* Información Adicional */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🌍 Información Adicional de Viajes
                </h3>
                
                <div className="space-y-4">
                  <TextArea
                    {...register('paisesVisitados5Anos')}
                    label="Países Visitados en los Últimos 5 Años"
                    placeholder="Ejemplo: MÉXICO, COLOMBIA, NICARAGUA, ESPAÑA, FRANCIA"
                    rows={2}
                    error={errors.paisesVisitados5Anos?.message}
                  />

                  <TextArea
                    {...register('parientesInmediatosUSA')}
                    label="Parientes Inmediatos en USA"
                    placeholder="Nombre, Apellido, Estatus (ciudadano, residente...), Parentesco (Padre, madre, hijos, hermanos...)"
                    rows={3}
                    helperText="Incluya: Nombre completo, estatus migratorio y parentesco"
                    error={errors.parientesInmediatosUSA?.message}
                  />
                </div>
              </div>
            </div>
          </div>
          )}

          {/* ====================================================================== */}
          {/* PASO 7: INFORMACIÓN FAMILIAR */}
          {/* ====================================================================== */}
          {currentFormStep === 7 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">
                👨‍👩‍👧‍👦 SECCIÓN 7: INFORMACIÓN FAMILIAR
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Datos de los padres y información del cónyuge (si aplica)
              </p>
            </div>
            
            <div className="px-6 py-6 space-y-8">
              {/* Información de los Padres */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  👨‍👩 Información de los Padres
                </h3>
                
                <div className="space-y-6">
                  {/* Padre */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-700">Datos del Padre</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        {...register('apellidoNombrePadre')}
                        label="Apellido y Nombre del Padre"
                        placeholder="Ejemplo: PÉREZ GONZÁLEZ, JOSÉ ANTONIO"
                        error={errors.apellidoNombrePadre?.message}
                      />
                      <Input
                        {...register('fechaNacimientoPadre')}
                        type="date"
                        label="Fecha de Nacimiento del Padre"
                        error={errors.fechaNacimientoPadre?.message}
                      />
                    </div>
                  </div>

                  {/* Madre */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-700">Datos de la Madre</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        {...register('apellidoNombreMadre')}
                        label="Apellido y Nombre de la Madre"
                        placeholder="Ejemplo: GONZÁLEZ SÁNCHEZ, MARÍA ELENA"
                        error={errors.apellidoNombreMadre?.message}
                      />
                      <Input
                        {...register('fechaNacimientoMadre')}
                        type="date"
                        label="Fecha de Nacimiento de la Madre"
                        error={errors.fechaNacimientoMadre?.message}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del Cónyuge Actual */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  💑 Datos del Cónyuge Actual
                </h3>
                
                <div className="space-y-4">
                  <Input
                    {...register('nombreConyugeActual')}
                    label="Nombre del Cónyuge Actual"
                    placeholder="Ejemplo: ANA GABRIELA HOYO LABRADOR"
                    error={errors.nombreConyugeActual?.message}
                  />

                  <div className="grid md:grid-cols-3 gap-4">
                    <Input
                      {...register('fechaNacimientoConyugeActual')}
                      type="date"
                      label="Fecha de Nacimiento del Cónyuge"
                      error={errors.fechaNacimientoConyugeActual?.message}
                    />
                    <Input
                      {...register('ciudadNacimientoConyugeActual')}
                      label="Ciudad de Nacimiento del Cónyuge"
                      placeholder="Ejemplo: GUADALAJARA, JALISCO, MÉXICO"
                      error={errors.ciudadNacimientoConyugeActual?.message}
                    />
                    <Input
                      {...register('fechaMatrimonio')}
                      type="date"
                      label="Fecha de Matrimonio"
                      error={errors.fechaMatrimonio?.message}
                    />
                  </div>

                  <TextArea
                    {...register('domicilioConyugeActual')}
                    label="Domicilio del Cónyuge (en caso de ser distinto al suyo)"
                    placeholder="Si viven juntos, puede dejar en blanco o escribir 'MISMO DOMICILIO'"
                    rows={2}
                    error={errors.domicilioConyugeActual?.message}
                  />
                </div>
              </div>

              {/* Matrimonios Anteriores */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <RadioGroup 
                  label="¿Es viudo o divorciado?"
                  error={errors.esViudoDivorciado?.message}
                >
                  <RadioOption
                    {...register('esViudoDivorciado')}
                    value="SI"
                    label="Sí"
                  >
                    {watchEsViudoDivorciado === 'SI' && (
                      <div className="space-y-4 mt-4">
                        <Input
                          {...register('numeroMatrimoniosAnteriores')}
                          label="Número de Matrimonios Anteriores"
                          placeholder="Ejemplo: 1"
                          error={errors.numeroMatrimoniosAnteriores?.message}
                        />

                        <Input
                          {...register('nombreConyugeAnterior')}
                          label="Nombre Completo del Cónyuge Anterior"
                          placeholder="Ejemplo: MARÍA FERNANDA LÓPEZ RIVERA"
                          error={errors.nombreConyugeAnterior?.message}
                        />

                        <TextArea
                          {...register('domicilioConyugeAnterior')}
                          label="Domicilio del Cónyuge Anterior"
                          placeholder="Dirección completa actual del ex-cónyuge"
                          rows={2}
                          error={errors.domicilioConyugeAnterior?.message}
                        />

                        <div className="grid md:grid-cols-2 gap-4">
                          <Input
                            {...register('fechaNacimientoConyugeAnterior')}
                            type="date"
                            label="Fecha y Lugar de Nacimiento"
                            error={errors.fechaNacimientoConyugeAnterior?.message}
                          />
                          <Input
                            {...register('fechaMatrimonioAnterior')}
                            type="date"
                            label="Fecha de Matrimonio"
                            error={errors.fechaMatrimonioAnterior?.message}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <Input
                            {...register('fechaDivorcio')}
                            type="date"
                            label="Fecha de Divorcio / o defunción del cónyuge"
                            error={errors.fechaDivorcio?.message}
                          />
                          <Input
                            {...register('terminosDivorcio')}
                            label="Términos del Divorcio"
                            placeholder="Ejemplo: DIVORCIO NECESARIO"
                            error={errors.terminosDivorcio?.message}
                          />
                        </div>
                      </div>
                    )}
                  </RadioOption>
                  <RadioOption
                    {...register('esViudoDivorciado')}
                    value="NO"
                    label="No Aplica"
                  />
                </RadioGroup>
              </div>
            </div>
          </div>
          )}

          {/* ====================================================================== */}
          {/* PASO 8: PREGUNTAS DE SEGURIDAD Y ANTECEDENTES */}
          {/* ====================================================================== */}
          {currentFormStep === 8 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">
                ⚠️ SECCIÓN FINAL: PREGUNTAS DE SEGURIDAD Y ANTECEDENTES
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Preguntas importantes sobre salud, historial criminal y antecedentes
              </p>
            </div>
            
            <div className="px-6 py-6 space-y-8">
              
              {/* Enfermedades Contagiosas */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <RadioGroup 
                  label="¿Tiene enfermedades contagiosas? (Chancroide, Gonorrea, Lepra, Sífilis Infecciosa, Tuberculosis Activa)"
                  error={errors.enfermedadesContagiosas?.message}
                >
                  <RadioOption
                    {...register('enfermedadesContagiosas', { required: 'Debe responder esta pregunta' })}
                    value="SI"
                    label="Sí"
                  >
                    {watchEnfermedadesContagiosas === 'SI' && (
                      <TextArea
                        {...register('detallesEnfermedadesContagiosas', { 
                          required: watchEnfermedadesContagiosas === 'SI' ? 'Proporcione detalles sobre las enfermedades' : false 
                        })}
                        placeholder="Detalle las enfermedades contagiosas y cualquier diagnóstico médico reciente. Incluya documentación de tratamiento si es vital que tenga la documentación."
                        rows={3}
                        error={errors.detallesEnfermedadesContagiosas?.message}
                      />
                    )}
                  </RadioOption>
                  <RadioOption
                    {...register('enfermedadesContagiosas')}
                    value="NO"
                    label="No"
                  />
                </RadioGroup>
              </div>

              {/* Trastorno Mental o Físico */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <RadioGroup 
                  label="¿Tiene trastorno mental o físico que represente amenaza a la seguridad/bienestar?"
                  error={errors.trastornoMentalFisico?.message}
                >
                  <RadioOption
                    {...register('trastornoMentalFisico', { required: 'Debe responder esta pregunta' })}
                    value="SI"
                    label="Sí"
                  >
                    {watchTrastornoMentalFisico === 'SI' && (
                      <TextArea
                        {...register('detallesTrastornoMentalFisico', { 
                          required: watchTrastornoMentalFisico === 'SI' ? 'Proporcione detalles sobre el trastorno' : false 
                        })}
                        placeholder="Céntrese en el aspecto de amenaza a la seguridad/bienestar. Pregunte si alguna vez ha sido hospitalizado o ha tenido incidentes donde su condición haya puesto en peligro a otros o a sí mismo."
                        rows={3}
                        error={errors.detallesTrastornoMentalFisico?.message}
                      />
                    )}
                  </RadioOption>
                  <RadioOption
                    {...register('trastornoMentalFisico')}
                    value="NO"
                    label="No"
                  />
                </RadioGroup>
              </div>

              {/* Abuso/Adicción a Drogas */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <RadioGroup 
                  label="¿Tiene historial de dependencia o abuso de drogas?"
                  error={errors.abusoAdiccionDrogas?.message}
                >
                  <RadioOption
                    {...register('abusoAdiccionDrogas', { required: 'Debe responder esta pregunta' })}
                    value="SI"
                    label="Sí"
                  >
                    {watchAbusoAdiccionDrogas === 'SI' && (
                      <TextArea
                        {...register('detallesAbusoAdiccionDrogas', { 
                          required: watchAbusoAdiccionDrogas === 'SI' ? 'Proporcione detalles sobre el historial de drogas' : false 
                        })}
                        placeholder="Pregunte sobre historial de dependencia o abuso, no de simple uso recreativo pasado, a menos que haya habido un arresto o condena. La clave es si un médico les ha diagnosticado un trastorno relacionado con sustancias."
                        rows={3}
                        error={errors.detallesAbusoAdiccionDrogas?.message}
                      />
                    )}
                  </RadioOption>
                  <RadioOption
                    {...register('abusoAdiccionDrogas')}
                    value="NO"
                    label="No"
                  />
                </RadioGroup>
              </div>

              {/* Historial Criminal */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-semibold">⚠️ ¡Esta es la más crítica!</p>
                  <p className="text-red-700 text-sm mt-1">
                    Necesitará documentación oficial (registro policial, sentencia judicial, etc.) para cualquier respuesta "Sí".
                  </p>
                </div>
                <RadioGroup 
                  label="¿Tiene historial criminal completo? (Arrestos/Condenas/Delitos)"
                  error={errors.historialCriminal?.message}
                >
                  <RadioOption
                    {...register('historialCriminal', { required: 'Debe responder esta pregunta' })}
                    value="SI"
                    label="Sí"
                  >
                    {watchHistorialCriminal === 'SI' && (
                      <TextArea
                        {...register('detallesHistorialCriminal', { 
                          required: watchHistorialCriminal === 'SI' ? 'Proporcione el historial criminal completo' : false 
                        })}
                        placeholder="Pida el historial completo, incluso si el cargo fue desestimado, hubo un indulto o fue un delito menor (misdemeanor)."
                        rows={4}
                        error={errors.detallesHistorialCriminal?.message}
                      />
                    )}
                  </RadioOption>
                  <RadioOption
                    {...register('historialCriminal')}
                    value="NO"
                    label="No"
                  />
                </RadioGroup>
              </div>

              {/* Sustancias Controladas */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <RadioGroup 
                  label="¿Ha estado involucrado con sustancias controladas?"
                  error={errors.sustanciasControladas?.message}
                >
                  <RadioOption
                    {...register('sustanciasControladas', { required: 'Debe responder esta pregunta' })}
                    value="SI"
                    label="Sí"
                  >
                    {watchSustanciasControladas === 'SI' && (
                      <TextArea
                        {...register('detallesSustanciasControladas', { 
                          required: watchSustanciasControladas === 'SI' ? 'Proporcione detalles sobre sustancias controladas' : false 
                        })}
                        placeholder="Aclárele que esto incluye todas las drogas ilegales (marihuana, cocaína, etc.) según las leyes federales de EE.UU., incluso si son legales en su país pasado."
                        rows={3}
                        error={errors.detallesSustanciasControladas?.message}
                      />
                    )}
                  </RadioOption>
                  <RadioOption
                    {...register('sustanciasControladas')}
                    value="NO"
                    label="No"
                  />
                </RadioGroup>
              </div>

              {/* Prostitución / Tráfico */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <RadioGroup 
                  label="¿Ha participado en prostitución, tráfico de personas, lavado de dinero, terrorismo, genocidio, etc.?"
                  error={errors.prostitucionTrafico?.message}
                >
                  <RadioOption
                    {...register('prostitucionTrafico', { required: 'Debe responder esta pregunta' })}
                    value="SI"
                    label="Sí"
                  >
                    {watchProstitucionTrafico === 'SI' && (
                      <TextArea
                        {...register('detallesProstitucionTrafico', { 
                          required: watchProstitucionTrafico === 'SI' ? 'Proporcione detalles sobre estas actividades' : false 
                        })}
                        placeholder="Son preguntas muy específicas sobre actividades criminales graves. Simplemente pregunte directamente si alguna vez han participado, instigado o ayudado en dichas actividades."
                        rows={3}
                        error={errors.detallesProstitucionTrafico?.message}
                      />
                    )}
                  </RadioOption>
                  <RadioOption
                    {...register('prostitucionTrafico')}
                    value="NO"
                    label="No"
                  />
                </RadioGroup>
              </div>

              {/* Inmigración Irregular */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <RadioGroup 
                  label="¿Ha tenido problemas de inmigración? (Deportación, estadia excesiva, fraude, mentiras)"
                  error={errors.inmigracionIrregular?.message}
                >
                  <RadioOption
                    {...register('inmigracionIrregular', { required: 'Debe responder esta pregunta' })}
                    value="SI"
                    label="Sí"
                  >
                    {watchInmigracionIrregular === 'SI' && (
                      <TextArea
                        {...register('detallesInmigracionIrregular', { 
                          required: watchInmigracionIrregular === 'SI' ? 'Proporcione detalles sobre problemas migratorios' : false 
                        })}
                        placeholder="Pregunte en detalle sobre visitas anteriores a EE.UU. (fechas exactas de entrada/salida), si alguna vez han sido detenidos por inmigración o si han usado documentos falsos o han mentido en solicitudes previas."
                        rows={4}
                        error={errors.detallesInmigracionIrregular?.message}
                      />
                    )}
                  </RadioOption>
                  <RadioOption
                    {...register('inmigracionIrregular')}
                    value="NO"
                    label="No"
                  />
                </RadioGroup>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-yellow-600 mr-3">⚠️</div>
                  <div>
                    <h4 className="font-semibold text-yellow-800">IMPORTANTE:</h4>
                    <p className="text-sm text-yellow-700">
                      Todas las respuestas "SÍ" en esta sección requieren documentación oficial y pueden afectar significativamente la aprobación de la visa.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
          )}

          {/* Botón de Envío o Estado Completado */}
          {currentFormStep === 8 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-8 text-center space-y-4">
              {isFormSubmitted ? (
                // Estado post-envío: formulario completado
                <>
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-green-800">
                    ✅ DS160 - CONCLUIDO
                  </h3>
                  <p className="text-green-700">
                    Su formulario DS-160 ha sido completado y enviado exitosamente.
                  </p>
                  
                  <div className="flex justify-center space-x-4 mt-6">
                    {submittedData && (
                      <PDFGenerator 
                        client={{
                          token: token || 'COMPLETED',
                          clientName: submittedData.nombreCompleto || 'Cliente',
                          clientEmail: submittedData.correoElectronico || '',
                          clientPhone: submittedData.celular || '',
                          formData: submittedData,
                          formProgress: 100,
                          formStatus: 'completed',
                          paymentStatus: 'pending',
                          lastActivity: new Date().toISOString(),
                          createdAt: new Date().toISOString(),
                          isActive: true,
                          adminComments: []
                        }}
                        onGenerated={(fileName) => {
                          console.log('PDF generado:', fileName)
                        }}
                      />
                    )}
                    
                    {!isClientAccess && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/admin/dashboard')}
                        className="flex items-center"
                      >
                        ← Dashboard Admin
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                // Estado pre-envío: botones normales
                <>
                  <h3 className="text-lg font-semibold text-gray-900">
                    ✅ ¿Está listo para enviar su formulario DS-160?
                  </h3>
                  <p className="text-gray-600">
                    Revise toda la información antes de enviar. Una vez enviado, no podrá realizar cambios.
                  </p>
                  
                  <div className="flex justify-center space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onSave}
                      className="flex items-center"
                      disabled={isSubmitting}
                    >
                      💾 Guardar Borrador
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={!isValid || isSubmitting}
                      className="flex items-center bg-success-600 hover:bg-success-700 text-white px-8 py-3"
                    >
                      {isSubmitting ? '📤 Enviando...' : '📤 ENVIAR FORMULARIO DS-160'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
          )}

          {/* Botones de Navegación por Pasos */}
          <div className="bg-white rounded-lg shadow-sm border mt-8">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between">
                {/* Botón Anterior */}
                <div>
                  {currentFormStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goToPreviousStep}
                      className="flex items-center gap-2 px-6 py-3"
                    >
                      ← Paso Anterior
                    </Button>
                  ) : (
                    <div></div>
                  )}
                </div>

                {/* Información del Paso */}
                <div className="text-center">
                  <div className="text-sm text-gray-600">
                    Paso {currentFormStep} de {formSteps.length}
                  </div>
                  {!canProceedToNext() && currentFormStep < formSteps.length && (
                    <div className="text-xs text-red-600 mt-1">
                      Complete todos los campos requeridos para continuar
                    </div>
                  )}
                </div>

                {/* Botón Siguiente */}
                <div>
                  {currentFormStep < formSteps.length ? (
                    <Button
                      type="button"
                      onClick={goToNextStep}
                      disabled={!canProceedToNext()}
                      className={`flex items-center gap-2 px-6 py-3 ${
                        canProceedToNext()
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Siguiente Paso →
                    </Button>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </form>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>© 2025 - A8Visas | Hacemos tu trámite fácil | Todos los derechos reservados</p>
            <p className="mt-1">
              Este es un formulario de recopilación de información. Los datos serán utilizados exclusivamente para completar el formulario DS-160 oficial.
            </p>
          </div>
        </div>
      </footer>

      {/* Modal de Notificaciones */}
      <NotificationModal />
    </div>
  )
}