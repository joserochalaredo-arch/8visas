import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Función para mapear datos del formulario a la estructura de Supabase
function mapFormDataToSupabase(formData: any) {
  const mappedData: any = {}
  
  // Mapeo de campos del formulario a la tabla ds160_forms
  if (formData?.nombreCompleto) mappedData.nombre_completo = formData.nombreCompleto
  if (formData?.fechaNacimiento) mappedData.fecha_nacimiento = formData.fechaNacimiento
  if (formData?.ciudadEstadoPaisNacimiento) mappedData.ciudad_nacimiento = formData.ciudadEstadoPaisNacimiento
  if (formData?.otraNacionalidad) mappedData.otra_nacionalidad = formData.otraNacionalidad === 'SI' ? 'SI' : 'NO'
  if (formData?.consuladoDeseado) mappedData.consulado_deseado = formData.consuladoDeseado
  if (formData?.oficinaCAS) mappedData.oficina_cas = formData.oficinaCAS
  
  // Información del pasaporte
  if (formData?.numeroPasaporte) mappedData.numero_pasaporte = formData.numeroPasaporte
  if (formData?.fechaExpedicion) mappedData.fecha_expedicion = formData.fechaExpedicion
  if (formData?.fechaVencimiento) mappedData.fecha_vencimiento = formData.fechaVencimiento
  
  // Información de contacto
  if (formData?.domicilioCasa || formData?.domicilio) mappedData.domicilio_casa = formData.domicilioCasa || formData.domicilio
  if (formData?.telefonoCasa) mappedData.telefono_casa = formData.telefonoCasa
  if (formData?.celular) mappedData.celular = formData.celular
  if (formData?.correoElectronico) mappedData.correo_electronico = formData.correoElectronico
  if (formData?.estadoCivil) mappedData.estado_civil = formData.estadoCivil
  
  // Información laboral
  if (formData?.ocupacionActual || formData?.puestoDesempenado) {
    mappedData.ocupacion_actual = formData.ocupacionActual || formData.puestoDesempenado
  }
  if (formData?.nombreEmpresa || formData?.empleador) {
    mappedData.empleador = formData.nombreEmpresa || formData.empleador
  }
  if (formData?.salarioMensualAproximado) {
    const salario = formData.salarioMensualAproximado.replace(/[^\d.]/g, '')
    if (salario && !isNaN(parseFloat(salario))) {
      mappedData.salario_mensual = parseFloat(salario)
    }
  }
  if (formData?.domicilioEmpresa || formData?.direccionTrabajo) {
    mappedData.direccion_trabajo = formData.domicilioEmpresa || formData.direccionTrabajo
  }
  if (formData?.telefonoEmpresa || formData?.telefonoTrabajo) {
    mappedData.telefono_trabajo = formData.telefonoEmpresa || formData.telefonoTrabajo
  }
  
  // Información de viaje
  if (formData?.fechaLlegadaUSA || formData?.fechaLlegada) {
    mappedData.fecha_llegada = formData.fechaLlegadaUSA || formData.fechaLlegada
  }
  if (formData?.duracionEstanciaUSA || formData?.duracionEstancia) {
    mappedData.duracion_estancia = formData.duracionEstanciaUSA || formData.duracionEstancia
  }
  if (formData?.hotelDomicilio || formData?.direccionUSA) {
    mappedData.direccion_usa = formData.hotelDomicilio || formData.direccionUSA
  }
  
  // Información familiar
  if (formData?.apellidoNombrePadre || formData?.nombrePadre) {
    mappedData.nombre_padre = formData.apellidoNombrePadre || formData.nombrePadre
  }
  if (formData?.fechaNacimientoPadre) mappedData.fecha_nacimiento_padre = formData.fechaNacimientoPadre
  if (formData?.apellidoNombreMadre || formData?.nombreMadre) {
    mappedData.nombre_madre = formData.apellidoNombreMadre || formData.nombreMadre
  }
  if (formData?.fechaNacimientoMadre) mappedData.fecha_nacimiento_madre = formData.fechaNacimientoMadre
  
  // Información de viajes anteriores
  if (formData?.haVisitadoUSA) mappedData.ha_visitado_usa = formData.haVisitadoUSA === 'SI' ? 'SI' : 'NO'
  if (formData?.fechasVisitasAnteriores) mappedData.fechas_visitas_anteriores = formData.fechasVisitasAnteriores
  
  // Preguntas de seguridad
  if (formData?.arrestosCrimenes) mappedData.arrestos_crimenes = formData.arrestosCrimenes === 'SI' ? 'SI' : 'NO'
  if (formData?.detallesArrestos) mappedData.detalles_arrestos = formData.detallesArrestos
  if (formData?.leHanNegadoVisa) mappedData.le_han_negado_visa = formData.leHanNegadoVisa === 'SI' ? 'SI' : 'NO'
  if (formData?.haExtraviadoVisa) mappedData.ha_extraviado_visa = formData.haExtraviadoVisa === 'SI' ? 'SI' : 'NO'
  if (formData?.haExtraviadoPasaporte) mappedData.ha_extraviado_pasaporte = formData.haExtraviadoPasaporte === 'SI' ? 'SI' : 'NO'
  
  return mappedData
}

// POST - Crear o actualizar formulario DS-160 en Supabase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      formToken, 
      clientName, 
      clientEmail, 
      stepData, 
      currentStep,
      formData 
    } = body

    console.log('📝 DEBUGGING API DS-160 - Datos recibidos:', { 
      formToken, 
      clientName, 
      clientEmail, 
      currentStep, 
      formData,
      stepData 
    })
    
    console.log('📝 Guardando formulario DS-160 en Supabase:', { formToken, clientName, currentStep })

    // Verificar si el formulario existe en Supabase
    console.log('🔍 Verificando si existe formulario con token:', formToken)
    const { data: existingForm, error: selectError } = await supabase
      .from('ds160_forms')
      .select('id')
      .eq('form_token', formToken)
      .single()

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = No rows found
      console.error('❌ Error verificando formulario existente:', selectError)
      throw selectError
    }

    console.log('📋 Formulario existente encontrado:', existingForm ? 'SÍ' : 'NO')

    // Mapear datos del formulario
    const mappedData = mapFormDataToSupabase(formData || {})
    
    // Determinar status según el paso
    const status = currentStep === 7 ? 'completed' : 
                  currentStep > 1 ? 'in_progress' : 'draft'
    
    // Calcular progreso
    const progress = currentStep ? Math.round((currentStep / 7) * 100) : 0

    let formId: string

    if (existingForm) {
      // Actualizar formulario existente
      formId = existingForm.id.toString()
      
      const updateData = {
        ...mappedData,
        current_step: currentStep,
        status: status,
        progress_percentage: progress,
        updated_at: new Date().toISOString(),
        ...(status === 'completed' && { completed_at: new Date().toISOString() })
      }

      console.log('🔄 Actualizando formulario existente con datos:', updateData)
      
      const { error: updateError } = await supabase
        .from('ds160_forms')
        .update(updateData)
        .eq('form_token', formToken)

      if (updateError) {
        console.error('❌ Error actualizando formulario:', updateError)
        throw updateError
      }

      console.log('✅ Formulario actualizado exitosamente en Supabase')
      
    } else {
      // Crear nuevo formulario
      const insertData = {
        form_token: formToken,
        client_name: clientName,
        client_email: clientEmail || null,
        current_step: currentStep || 1,
        status: status,
        progress_percentage: progress,
        payment_status: 'pending',
        ...mappedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(status === 'completed' && { completed_at: new Date().toISOString() })
      }

      console.log('🆕 Creando nuevo formulario con datos:', insertData)
      
      const { data: newForm, error: insertError } = await supabase
        .from('ds160_forms')
        .insert(insertData)
        .select('id')
        .single()

      if (insertError) {
        console.error('❌ Error creando formulario:', insertError)
        console.error('❌ Detalles del error:', insertError.message)
        throw insertError
      }

      formId = newForm.id.toString()
      console.log('✅ Nuevo formulario creado exitosamente en Supabase con ID:', formId)
    }

    // Guardar progreso del paso específico
    if (stepData && currentStep) {
      const { error: progressError } = await supabase
        .from('ds160_step_progress')
        .upsert({
          form_id: parseInt(formId),
          step_number: currentStep,
          step_data: stepData,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'form_id,step_number'
        })

      if (progressError) {
        console.warn('Error guardando progreso del paso:', progressError)
        // No lanzamos error aquí para no bloquear el guardado principal
      }
    }

    // Crear registro en logs
    try {
      await supabase
        .from('ds160_form_logs')
        .insert({
          form_id: parseInt(formId),
          action: existingForm ? 'updated' : 'created',
          step_number: currentStep,
          new_data: { step: currentStep, data: stepData },
          created_at: new Date().toISOString()
        })
    } catch (logError) {
      console.warn('Error creando log:', logError)
      // Los logs son opcionales, no bloqueamos por esto
    }

    return NextResponse.json({
      success: true,
      message: 'Formulario guardado exitosamente en Supabase',
      formId,
      progress,
      status
    })

  } catch (error) {
    console.error('❌ Error guardando formulario en Supabase:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

// GET - Obtener datos del formulario desde Supabase
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const formToken = searchParams.get('token')

    if (!formToken) {
      return NextResponse.json({
        success: false,
        error: 'Token del formulario requerido'
      }, { status: 400 })
    }

    console.log('🔍 Obteniendo formulario DS-160:', formToken)

    // Obtener datos principales del formulario desde Supabase
    const { data: formData, error: formError } = await supabase
      .from('ds160_forms')
      .select('*')
      .eq('form_token', formToken)
      .single()

    if (formError) {
      if (formError.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Formulario no encontrado'
        }, { status: 404 })
      }
      
      console.error('Error obteniendo formulario:', formError)
      throw formError
    }

    // Obtener progreso de pasos
    const { data: stepProgress, error: progressError } = await supabase
      .from('ds160_step_progress')
      .select('step_number, step_data, completed_at')
      .eq('form_id', formData.id)
      .order('step_number')

    if (progressError) {
      console.warn('Error obteniendo progreso de pasos:', progressError)
      // Continuamos sin el progreso de pasos si hay error
    }

    console.log('✅ Formulario obtenido exitosamente')

    return NextResponse.json({
      success: true,
      data: {
        ...formData,
        stepProgress: stepProgress || []
      }
    })

  } catch (error) {
    console.error('❌ Error obteniendo formulario desde Supabase:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}