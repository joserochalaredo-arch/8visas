'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Download, Loader2 } from 'lucide-react'
import { ClientData } from '@/store/admin-store'
import jsPDF from 'jspdf'

interface PDFGeneratorProps {
  client: ClientData
  onGenerated?: (pdfUrl: string) => void
  autoDownload?: boolean
  iconOnly?: boolean
}

export function PDFGenerator({ client, onGenerated, autoDownload = false, iconOnly = false }: PDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)

    try {
      const pdf = new jsPDF()
      const pageWidth = pdf.internal.pageSize.width
      const pageHeight = pdf.internal.pageSize.height
      const margin = 20
      const lineHeight = 7
      let yPosition = margin

      // Función helper para agregar texto con salto de línea automático
      const addText = (text: string, fontSize = 12, isBold = false) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage()
          yPosition = margin
        }

        if (isBold) {
          pdf.setFont('helvetica', 'bold')
        } else {
          pdf.setFont('helvetica', 'normal')
        }
        
        pdf.setFontSize(fontSize)
        
        // Dividir texto en líneas que quepan en la página
        const splitText = pdf.splitTextToSize(text, pageWidth - 2 * margin)
        pdf.text(splitText, margin, yPosition)
        yPosition += lineHeight * splitText.length + 3
      }

      const addSection = (title: string, content: string) => {
        addText(title, 14, true)
        addText(content, 12, false)
        yPosition += 5
      }

      // Header del documento
      pdf.setFillColor(59, 130, 246) // bg-blue-600
      pdf.rect(0, 0, pageWidth, 30, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(20)
      pdf.text('FORMULARIO DS-160', pageWidth / 2, 20, { align: 'center' })
      
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(12)
      pdf.text('A8Visas - Sistema de Gestión', pageWidth / 2, 27, { align: 'center' })

      // Resetear color y posición
      pdf.setTextColor(0, 0, 0)
      yPosition = 45

      // Información del cliente
      addSection('INFORMACIÓN DEL CLIENTE', '')
      addText(`Nombre: ${client.clientName}`, 12, false)
      addText(`Email: ${client.clientEmail}`, 12, false)
      addText(`Teléfono: ${client.clientPhone || 'No proporcionado'}`, 12, false)
      addText(`Token: ${client.token}`, 12, false)
      addText(`Fecha de creación: ${new Date(client.createdAt).toLocaleDateString('es-ES')}`, 12, false)
      yPosition += 10

      // Estado del formulario
      addSection('ESTADO DEL FORMULARIO', '')
      addText(`Progreso: ${client.formProgress}%`, 12, false)
      addText(`Estado: ${client.formStatus || 'En progreso'}`, 12, false)
      addText(`Estado del pago: ${getPaymentStatusText(client.paymentStatus)}`, 12, false)
      addText(`Última actividad: ${new Date(client.lastActivity).toLocaleString('es-ES')}`, 12, false)
      yPosition += 10

      // Datos del formulario DS-160 organizados por secciones
      if (client.formData && Object.keys(client.formData).length > 0) {
        addSection('DATOS DEL FORMULARIO DS-160', '')
        
        // SECCIÓN 1: Información Personal y Consulado
        const seccion1Fields = [
          'nombreCompleto', 'fechaNacimiento', 'ciudadEstadoPaisNacimiento', 
          'otraNacionalidad', 'especificarNacionalidad', 'consuladoDeseado', 'oficinaCAS'
        ]
        if (seccion1Fields.some(field => client.formData[field])) {
          addText('SECCIÓN 1: INFORMACIÓN PERSONAL Y CONSULADO', 13, true)
          seccion1Fields.forEach(field => {
            if (client.formData[field] && client.formData[field] !== '') {
              addText(`• ${getFieldDisplayName(field)}: ${client.formData[field]}`, 11, false)
            }
          })
          yPosition += 5
        }

        // SECCIÓN 2: Pasaporte y Contacto
        const seccion2Fields = [
          'numeroPasaporte', 'fechaExpedicion', 'fechaVencimiento', 'ciudadExpedicion',
          'domicilioCasa', 'telefonoCasa', 'celular', 'correoElectronico',
          'haUtilizadoOtrosNumeros', 'listaOtrosNumeros', 'correosAdicionales', 
          'redesSociales', 'plataformasAdicionales', 'listaPlataformasAdicionales',
          'idiomas', 'estadoCivil'
        ]
        if (seccion2Fields.some(field => client.formData[field])) {
          addText('SECCIÓN 2: INFORMACIÓN DE PASAPORTE Y CONTACTO', 13, true)
          seccion2Fields.forEach(field => {
            if (client.formData[field] && client.formData[field] !== '') {
              addText(`• ${getFieldDisplayName(field)}: ${client.formData[field]}`, 11, false)
            }
          })
          yPosition += 5
        }

        // SECCIÓN 3: Información Laboral
        const seccion3Fields = [
          'fechaInicioTrabajo', 'fechaFinTrabajo', 'nombreEmpresa', 'nombrePatron',
          'domicilioEmpresa', 'telefonoEmpresa', 'puestoDesempenado', 'salarioMensualAproximado'
        ]
        if (seccion3Fields.some(field => client.formData[field])) {
          addText('SECCIÓN 3: INFORMACIÓN LABORAL', 13, true)
          seccion3Fields.forEach(field => {
            if (client.formData[field] && client.formData[field] !== '') {
              addText(`• ${getFieldDisplayName(field)}: ${client.formData[field]}`, 11, false)
            }
          })
          yPosition += 5
        }

        // SECCIÓN 4: Viaje a Estados Unidos
        const seccion4Fields = [
          'fechaLlegadaUSA', 'duracionEstanciaUSA', 'hotelDomicilio', 'telefonoHotel',
          'viajaConFamiliar', 'nombreFamiliar', 'parentescoFamiliar', 'estatusFamiliar',
          'domicilioFamiliar', 'telefonoFamiliar'
        ]
        if (seccion4Fields.some(field => client.formData[field])) {
          addText('SECCIÓN 4: INFORMACIÓN DE VIAJE A ESTADOS UNIDOS', 13, true)
          seccion4Fields.forEach(field => {
            if (client.formData[field] && client.formData[field] !== '') {
              addText(`• ${getFieldDisplayName(field)}: ${client.formData[field]}`, 11, false)
            }
          })
          yPosition += 5
        }

        // SECCIÓN 5: Información Educativa
        const seccion5Fields = [
          'fechaInicioEstudios', 'fechaTerminoEstudios', 'nombreEscuela', 'gradoCarreraEstudiada',
          'domicilioEscuela', 'telefonoEscuela', 'ciudadEscuela'
        ]
        if (seccion5Fields.some(field => client.formData[field])) {
          addText('SECCIÓN 5: INFORMACIÓN EDUCATIVA', 13, true)
          seccion5Fields.forEach(field => {
            if (client.formData[field] && client.formData[field] !== '') {
              addText(`• ${getFieldDisplayName(field)}: ${client.formData[field]}`, 11, false)
            }
          })
          yPosition += 5
        }

        // SECCIÓN 6: Visas Anteriores y Viajes
        const seccion6Fields = [
          'ciudadExpedicionVisaAnterior', 'fechaExpedicionVisaAnterior', 'fechaVencimientoVisaAnterior',
          'fechaEntrada1USA', 'duracionEstancia1', 'fechaEntrada2USA', 'duracionEstancia2',
          'fechaEntrada3USA', 'duracionEstancia3', 'paisesVisitados5Anos', 'parientesInmediatosUSA'
        ]
        if (seccion6Fields.some(field => client.formData[field])) {
          addText('SECCIÓN 6: VISAS ANTERIORES Y VIAJES', 13, true)
          seccion6Fields.forEach(field => {
            if (client.formData[field] && client.formData[field] !== '') {
              addText(`• ${getFieldDisplayName(field)}: ${client.formData[field]}`, 11, false)
            }
          })
          yPosition += 5
        }

        // SECCIÓN 7: Información Familiar
        const seccion7Fields = [
          'apellidoNombrePadre', 'fechaNacimientoPadre', 'apellidoNombreMadre', 'fechaNacimientoMadre',
          'nombreConyugeActual', 'fechaNacimientoConyugeActual', 'ciudadNacimientoConyugeActual',
          'fechaMatrimonio', 'domicilioConyugeActual', 'esViudoDivorciado', 'numeroMatrimoniosAnteriores',
          'nombreConyugeAnterior', 'domicilioConyugeAnterior', 'fechaNacimientoConyugeAnterior',
          'fechaMatrimonioAnterior', 'fechaDivorcio', 'terminosDivorcio'
        ]
        if (seccion7Fields.some(field => client.formData[field])) {
          addText('SECCIÓN 7: INFORMACIÓN FAMILIAR', 13, true)
          seccion7Fields.forEach(field => {
            if (client.formData[field] && client.formData[field] !== '') {
              addText(`• ${getFieldDisplayName(field)}: ${client.formData[field]}`, 11, false)
            }
          })
          yPosition += 5
        }

        // SECCIÓN 8: Preguntas de Seguridad y Antecedentes
        const seccion8Fields = [
          'haVisitadoUSA', 'fechasVisitasAnteriores', 'visasAnteriores', 'arrestosCrimenes', 'detallesArrestos',
          'haExtraviadoVisa', 'leHanNegadoVisa', 'haExtraviadoPasaporte', 'enfermedadesContagiosas', 
          'detallesEnfermedadesContagiosas', 'trastornoMentalFisico', 'detallesTrastornoMentalFisico',
          'abusoAdiccionDrogas', 'detallesAbusoAdiccionDrogas', 'historialCriminal', 'detallesHistorialCriminal',
          'sustanciasControladas', 'detallesSustanciasControladas', 'prostitucionTrafico', 'detallesProstitucionTrafico',
          'inmigracionIrregular', 'detallesInmigracionIrregular'
        ]
        if (seccion8Fields.some(field => client.formData[field])) {
          addText('SECCIÓN 8: PREGUNTAS DE SEGURIDAD Y ANTECEDENTES', 13, true)
          seccion8Fields.forEach(field => {
            if (client.formData[field] && client.formData[field] !== '') {
              addText(`• ${getFieldDisplayName(field)}: ${client.formData[field]}`, 11, false)
            }
          })
          yPosition += 5
        }
      }

      // Comentarios del administrador
      if (client.adminComments && client.adminComments.length > 0) {
        addSection('COMENTARIOS DEL ADMINISTRADOR', '')
        client.adminComments.forEach((comment, index) => {
          addText(`${index + 1}. ${comment}`, 11, false)
        })
        yPosition += 10
      }

      // Footer
      const currentDate = new Date().toLocaleString('es-ES')
      pdf.setFontSize(10)
      pdf.setTextColor(128, 128, 128)
      pdf.text(
        `Documento generado el ${currentDate} por A8Visas`, 
        pageWidth / 2, 
        pageHeight - 10, 
        { align: 'center' }
      )

      // Generar y descargar el PDF
      const fileName = `DS160_${client.clientName.replace(/\s+/g, '_')}_${client.token}.pdf`
      pdf.save(fileName)

      // Notificar que se generó el PDF
      if (onGenerated) {
        onGenerated(fileName)
      }

    } catch (error) {
      console.error('Error generando PDF:', error)
      alert('Error al generar el PDF. Intente nuevamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Función helper para obtener nombres legibles de los campos
  const getFieldDisplayName = (key: string): string => {
    const fieldNames: Record<string, string> = {
      // SECCIÓN 1: Información Personal y Consulado
      nombreCompleto: 'Nombre Completo',
      fechaNacimiento: 'Fecha de Nacimiento',
      ciudadEstadoPaisNacimiento: 'Ciudad, Estado, País de Nacimiento',
      otraNacionalidad: '¿Tiene Otra Nacionalidad?',
      especificarNacionalidad: 'Especificar Nacionalidad',
      consuladoDeseado: 'Consulado Deseado',
      oficinaCAS: 'Oficina CAS',
      
      // SECCIÓN 2: Pasaporte y Contacto
      numeroPasaporte: 'Número de Pasaporte',
      fechaExpedicion: 'Fecha de Expedición',
      fechaVencimiento: 'Fecha de Vencimiento',
      ciudadExpedicion: 'Ciudad de Expedición',
      domicilioCasa: 'Domicilio de Casa',
      telefonoCasa: 'Teléfono de Casa',
      celular: 'Celular',
      correoElectronico: 'Correo Electrónico',
      haUtilizadoOtrosNumeros: '¿Ha Utilizado Otros Números?',
      listaOtrosNumeros: 'Lista de Otros Números',
      correosAdicionales: 'Correos Adicionales',
      redesSociales: 'Redes Sociales',
      plataformasAdicionales: '¿Utiliza Plataformas Adicionales?',
      listaPlataformasAdicionales: 'Lista de Plataformas Adicionales',
      idiomas: 'Idiomas',
      estadoCivil: 'Estado Civil',
      
      // SECCIÓN 3: Información Laboral
      fechaInicioTrabajo: 'Fecha de Inicio de Trabajo',
      fechaFinTrabajo: 'Fecha de Fin de Trabajo',
      nombreEmpresa: 'Nombre de la Empresa',
      nombrePatron: 'Nombre del Patrón',
      domicilioEmpresa: 'Domicilio de la Empresa',
      telefonoEmpresa: 'Teléfono de la Empresa',
      puestoDesempenado: 'Puesto Desempeñado',
      salarioMensualAproximado: 'Salario Mensual Aproximado',
      
      // SECCIÓN 4: Viaje a Estados Unidos
      fechaLlegadaUSA: 'Fecha de Llegada a USA',
      duracionEstanciaUSA: 'Duración de Estancia en USA',
      hotelDomicilio: 'Hotel/Domicilio en USA',
      telefonoHotel: 'Teléfono del Hotel',
      viajaConFamiliar: '¿Viaja con Familiar?',
      nombreFamiliar: 'Nombre del Familiar',
      parentescoFamiliar: 'Parentesco con el Familiar',
      estatusFamiliar: 'Estatus del Familiar',
      domicilioFamiliar: 'Domicilio del Familiar',
      telefonoFamiliar: 'Teléfono del Familiar',
      
      // SECCIÓN 5: Información Educativa
      fechaInicioEstudios: 'Fecha de Inicio de Estudios',
      fechaTerminoEstudios: 'Fecha de Término de Estudios',
      nombreEscuela: 'Nombre de la Escuela',
      gradoCarreraEstudiada: 'Grado/Carrera Estudiada',
      domicilioEscuela: 'Domicilio de la Escuela',
      telefonoEscuela: 'Teléfono de la Escuela',
      ciudadEscuela: 'Ciudad de la Escuela',
      
      // SECCIÓN 6: Visas Anteriores y Viajes
      ciudadExpedicionVisaAnterior: 'Ciudad de Expedición de Visa Anterior',
      fechaExpedicionVisaAnterior: 'Fecha de Expedición de Visa Anterior',
      fechaVencimientoVisaAnterior: 'Fecha de Vencimiento de Visa Anterior',
      fechaEntrada1USA: 'Fecha de Primera Entrada a USA',
      duracionEstancia1: 'Duración de Primera Estancia',
      fechaEntrada2USA: 'Fecha de Segunda Entrada a USA',
      duracionEstancia2: 'Duración de Segunda Estancia',
      fechaEntrada3USA: 'Fecha de Tercera Entrada a USA',
      duracionEstancia3: 'Duración de Tercera Estancia',
      paisesVisitados5Anos: 'Países Visitados en los Últimos 5 Años',
      parientesInmediatosUSA: 'Parientes Inmediatos en USA',
      
      // SECCIÓN 7: Información Familiar
      apellidoNombrePadre: 'Apellido y Nombre del Padre',
      fechaNacimientoPadre: 'Fecha de Nacimiento del Padre',
      apellidoNombreMadre: 'Apellido y Nombre de la Madre',
      fechaNacimientoMadre: 'Fecha de Nacimiento de la Madre',
      nombreConyugeActual: 'Nombre del Cónyuge Actual',
      fechaNacimientoConyugeActual: 'Fecha de Nacimiento del Cónyuge Actual',
      ciudadNacimientoConyugeActual: 'Ciudad de Nacimiento del Cónyuge Actual',
      fechaMatrimonio: 'Fecha de Matrimonio',
      domicilioConyugeActual: 'Domicilio del Cónyuge Actual',
      esViudoDivorciado: '¿Es Viudo o Divorciado?',
      numeroMatrimoniosAnteriores: 'Número de Matrimonios Anteriores',
      nombreConyugeAnterior: 'Nombre del Cónyuge Anterior',
      domicilioConyugeAnterior: 'Domicilio del Cónyuge Anterior',
      fechaNacimientoConyugeAnterior: 'Fecha de Nacimiento del Cónyuge Anterior',
      fechaMatrimonioAnterior: 'Fecha de Matrimonio Anterior',
      fechaDivorcio: 'Fecha de Divorcio',
      terminosDivorcio: 'Términos del Divorcio',
      
      // SECCIÓN 8: Preguntas de Seguridad
      haVisitadoUSA: '¿Ha Visitado USA Anteriormente?',
      fechasVisitasAnteriores: 'Fechas de Visitas Anteriores',
      visasAnteriores: 'Visas Anteriores',
      arrestosCrimenes: '¿Ha Sido Arrestado por Crímenes?',
      detallesArrestos: 'Detalles de Arrestos',
      haExtraviadoVisa: '¿Ha Extraviado una Visa?',
      leHanNegadoVisa: '¿Le Han Negado una Visa?',
      haExtraviadoPasaporte: '¿Ha Extraviado un Pasaporte?',
      enfermedadesContagiosas: '¿Tiene Enfermedades Contagiosas?',
      detallesEnfermedadesContagiosas: 'Detalles de Enfermedades Contagiosas',
      trastornoMentalFisico: '¿Tiene Trastorno Mental o Físico?',
      detallesTrastornoMentalFisico: 'Detalles de Trastorno Mental o Físico',
      abusoAdiccionDrogas: '¿Tiene Abuso o Adicción a Drogas?',
      detallesAbusoAdiccionDrogas: 'Detalles de Abuso o Adicción a Drogas',
      historialCriminal: '¿Tiene Historial Criminal?',
      detallesHistorialCriminal: 'Detalles del Historial Criminal',
      sustanciasControladas: '¿Ha Usado Sustancias Controladas?',
      detallesSustanciasControladas: 'Detalles de Sustancias Controladas',
      prostitucionTrafico: '¿Ha Participado en Prostitución o Tráfico?',
      detallesProstitucionTrafico: 'Detalles de Prostitución o Tráfico',
      inmigracionIrregular: '¿Ha Tenido Inmigración Irregular?',
      detallesInmigracionIrregular: 'Detalles de Inmigración Irregular',
      
      // Campos adicionales
      ciudadCita: 'Ciudad de la Cita',
      domicilio: 'Domicilio',
    }
    return fieldNames[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

  // Función helper para obtener texto del estado de pago
  const getPaymentStatusText = (status?: string): string => {
    switch (status) {
      case 'paid': return 'Pagado'
      case 'pending': return 'Pendiente'
      case 'partial': return 'Pago Parcial'
      case 'cancelled': return 'Cancelado'
      default: return 'Sin definir'
    }
  }

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating}
      size="sm"
      variant="outline"
      className={iconOnly 
        ? "text-green-600 border-green-200 hover:bg-green-50 p-2" 
        : "bg-green-600 hover:bg-green-700 text-white"
      }
      title={isGenerating ? "Generando PDF..." : "Descargar Info en PDF"}
    >
      {isGenerating ? (
        iconOnly ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generando PDF...
          </>
        )
      ) : (
        iconOnly ? (
          <Download className="h-4 w-4" />
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            📄 Descargar Info en PDF
          </>
        )
      )}
    </Button>
  )
}