'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Download, Loader2 } from 'lucide-react'
import { ClientData } from '@/store/admin-store'
import jsPDF from 'jspdf'

interface PDFGeneratorProps {
  client: ClientData
  onGenerated?: (pdfUrl: string) => void
}

export function PDFGenerator({ client, onGenerated }: PDFGeneratorProps) {
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

      // Datos del formulario DS-160 si existen
      if (client.formData && Object.keys(client.formData).length > 0) {
        addSection('DATOS DEL FORMULARIO DS-160', '')
        
        const formDataEntries = Object.entries(client.formData)
        formDataEntries.forEach(([key, value]) => {
          if (value && value !== '') {
            const fieldName = getFieldDisplayName(key)
            addText(`${fieldName}: ${value}`, 11, false)
          }
        })
        yPosition += 10
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
      ciudadCita: 'Ciudad de la Cita',
      nombreCompleto: 'Nombre Completo',
      fechaNacimiento: 'Fecha de Nacimiento',
      ciudadNacimiento: 'Ciudad de Nacimiento',
      estadoNacimiento: 'Estado de Nacimiento',
      paisNacimiento: 'País de Nacimiento',
      otraNacionalidad: 'Otra Nacionalidad',
      numeroPasaporte: 'Número de Pasaporte',
      fechaExpedicion: 'Fecha de Expedición',
      fechaVencimiento: 'Fecha de Vencimiento',
      domicilio: 'Domicilio',
      celular: 'Celular',
      correoElectronico: 'Correo Electrónico',
      estadoCivil: 'Estado Civil',
    }
    return fieldNames[key] || key
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
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generando PDF...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4 mr-2" />
          Generar PDF
        </>
      )}
    </Button>
  )
}