'use client'

import { useEffect, useState } from 'react'
import { useDS160Store } from '@/store/ds160-store'

export function useFormPersistence(token: string | null) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const { updateFormData, setCurrentStep } = useDS160Store()

  useEffect(() => {
    if (!token || isLoaded) return

    const loadFormData = async () => {
      setIsLoading(true)
      try {
        console.log('🔄 Cargando datos del formulario desde Supabase:', token)

        const response = await fetch(`/api/ds160?token=${token}`)
        const result = await response.json()

        if (result.success && result.data) {
          const formData = result.data
          
          // Mapear datos de Supabase al formato del store
          const mappedFormData = {
            // Información personal
            nombreCompleto: formData.nombre_completo || '',
            fechaNacimiento: formData.fecha_nacimiento || '',
            ciudadEstadoPaisNacimiento: formData.ciudad_nacimiento || '',
            otraNacionalidad: formData.otra_nacionalidad || '',
            consuladoDeseado: formData.consulado_deseado || '',
            oficinaCAS: formData.oficina_cas || '',
            
            // Información del pasaporte
            numeroPasaporte: formData.numero_pasaporte || '',
            fechaExpedicion: formData.fecha_expedicion || '',
            fechaVencimiento: formData.fecha_vencimiento || '',
            
            // Información de contacto
            domicilio: formData.domicilio_casa || '',
            telefonoCasa: formData.telefono_casa || '',
            celular: formData.celular || '',
            correoElectronico: formData.correo_electronico || '',
            estadoCivil: formData.estado_civil || '',
            
            // Información laboral
            ocupacionActual: formData.ocupacion_actual || '',
            empleador: formData.empleador || '',
            salarioMensual: formData.salario_mensual || '',
            direccionTrabajo: formData.direccion_trabajo || '',
            telefonoTrabajo: formData.telefono_trabajo || '',
            
            // Información de viaje
            fechaLlegada: formData.fecha_llegada || '',
            duracionEstancia: formData.duracion_estancia || '',
            direccionUSA: formData.direccion_usa || '',
            
            // Información familiar
            nombrePadre: formData.nombre_padre || '',
            fechaNacimientoPadre: formData.fecha_nacimiento_padre || '',
            nombreMadre: formData.nombre_madre || '',
            fechaNacimientoMadre: formData.fecha_nacimiento_madre || '',
            
            // Antecedentes
            haVisitadoUSA: formData.ha_visitado_usa || '',
            fechasVisitasAnteriores: formData.fechas_visitas_anteriores || '',
            leHanNegadoVisa: formData.le_han_negado_visa || '',
            haExtraviadoVisa: formData.ha_extraviado_visa || '',
            haExtraviadoPasaporte: formData.ha_extraviado_pasaporte || '',
            arrestosCrimenes: formData.arrestos_crimenes || '',
            detallesArrestos: formData.detalles_arrestos || '',
          }

          // Actualizar el store con los datos cargados
          updateFormData(mappedFormData)
          setCurrentStep(formData.current_step || 1)

          console.log('✅ Datos del formulario cargados exitosamente')
          console.log('📊 Progreso actual:', formData.progress_percentage + '%')
          console.log('📋 Paso actual:', formData.current_step)

          setIsLoaded(true)
        } else {
          console.log('ℹ️ No se encontraron datos previos del formulario')
        }
      } catch (error) {
        console.error('❌ Error cargando datos del formulario:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFormData()
  }, [token, isLoaded, updateFormData, setCurrentStep])

  return { isLoading, isLoaded }
}