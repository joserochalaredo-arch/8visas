import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'a8visas_ds160',
  port: parseInt(process.env.DB_PORT || '3306')
}

// Función para crear conexión a la base de datos
async function createConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig)
    return connection
  } catch (error) {
    console.error('Error conectando a la base de datos:', error)
    throw error
  }
}

// POST - Crear o actualizar formulario DS-160
export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null
  
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

    console.log('📝 Guardando formulario DS-160:', { formToken, clientName, currentStep })

    connection = await createConnection()

    // Verificar si el formulario existe
    const [existing] = await connection.execute(
      'SELECT id FROM ds160_forms WHERE form_token = ?',
      [formToken]
    )

    let formId: number

    if ((existing as any[]).length > 0) {
      // Actualizar formulario existente
      formId = (existing as any[])[0].id
      
      const updateFields = []
      const updateValues = []

      // Campos básicos
      updateFields.push('updated_at = CURRENT_TIMESTAMP')
      updateFields.push('current_step = ?')
      updateValues.push(currentStep)

      // Datos del Step 1
      if (formData?.nombreCompleto) {
        updateFields.push('nombre_completo = ?')
        updateValues.push(formData.nombreCompleto)
      }
      if (formData?.fechaNacimiento) {
        updateFields.push('fecha_nacimiento = ?')
        updateValues.push(formData.fechaNacimiento)
      }
      if (formData?.ciudadEstadoPaisNacimiento) {
        updateFields.push('ciudad_estado_pais_nacimiento = ?')
        updateValues.push(formData.ciudadEstadoPaisNacimiento)
      }
      if (formData?.otraNacionalidad) {
        updateFields.push('otra_nacionalidad = ?')
        updateValues.push(formData.otraNacionalidad)
      }
      if (formData?.especificarNacionalidad) {
        updateFields.push('especificar_nacionalidad = ?')
        updateValues.push(formData.especificarNacionalidad)
      }
      if (formData?.consuladoDeseado) {
        updateFields.push('consulado_deseado = ?')
        updateValues.push(formData.consuladoDeseado)
      }
      if (formData?.oficinaCAS) {
        updateFields.push('oficina_cas = ?')
        updateValues.push(formData.oficinaCAS)
      }

      // Datos del Step 2
      if (formData?.numeroPasaporte) {
        updateFields.push('numero_pasaporte = ?')
        updateValues.push(formData.numeroPasaporte)
      }
      if (formData?.fechaExpedicion) {
        updateFields.push('fecha_expedicion = ?')
        updateValues.push(formData.fechaExpedicion)
      }
      if (formData?.fechaVencimiento) {
        updateFields.push('fecha_vencimiento = ?')
        updateValues.push(formData.fechaVencimiento)
      }
      if (formData?.ciudadExpedicion) {
        updateFields.push('ciudad_expedicion = ?')
        updateValues.push(formData.ciudadExpedicion)
      }
      if (formData?.domicilio) {
        updateFields.push('domicilio_casa = ?')
        updateValues.push(formData.domicilio)
      }
      if (formData?.telefonoCasa) {
        updateFields.push('telefono_casa = ?')
        updateValues.push(formData.telefonoCasa)
      }
      if (formData?.celular) {
        updateFields.push('celular = ?')
        updateValues.push(formData.celular)
      }
      if (formData?.correoElectronico) {
        updateFields.push('correo_electronico = ?')
        updateValues.push(formData.correoElectronico)
      }
      if (formData?.otrosNumeros) {
        updateFields.push('ha_utilizado_otros_numeros = ?')
        updateValues.push(formData.otrosNumeros)
      }
      if (formData?.listaNumeros) {
        updateFields.push('lista_otros_numeros = ?')
        updateValues.push(formData.listaNumeros)
      }
      if (formData?.correosAdicionales) {
        updateFields.push('correos_adicionales = ?')
        updateValues.push(formData.correosAdicionales)
      }
      if (formData?.redesSociales) {
        updateFields.push('redes_sociales = ?')
        updateValues.push(formData.redesSociales)
      }
      if (formData?.plataformasAdicionales) {
        updateFields.push('plataformas_adicionales = ?')
        updateValues.push(formData.plataformasAdicionales)
      }
      if (formData?.listaPlataformas) {
        updateFields.push('lista_plataformas_adicionales = ?')
        updateValues.push(formData.listaPlataformas)
      }
      if (formData?.idiomas) {
        updateFields.push('idiomas = ?')
        updateValues.push(formData.idiomas)
      }
      if (formData?.estadoCivil) {
        updateFields.push('estado_civil = ?')
        updateValues.push(formData.estadoCivil)
      }

      // Status según el paso
      const status = currentStep === 7 ? 'completed' : 
                    currentStep > 1 ? 'in_progress' : 'draft'
      updateFields.push('status = ?')
      updateValues.push(status)

      updateValues.push(formToken) // Para el WHERE

      const updateQuery = `
        UPDATE ds160_forms 
        SET ${updateFields.join(', ')}
        WHERE form_token = ?
      `

      await connection.execute(updateQuery, updateValues)
      
    } else {
      // Crear nuevo formulario
      const insertQuery = `
        INSERT INTO ds160_forms (
          form_token, client_name, client_email, current_step, status,
          nombre_completo, fecha_nacimiento, ciudad_estado_pais_nacimiento,
          otra_nacionalidad, especificar_nacionalidad, consulado_deseado, oficina_cas
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      
      const status = currentStep > 1 ? 'in_progress' : 'draft'
      
      const [result] = await connection.execute(insertQuery, [
        formToken,
        clientName,
        clientEmail,
        currentStep,
        status,
        formData?.nombreCompleto || null,
        formData?.fechaNacimiento || null,
        formData?.ciudadEstadoPaisNacimiento || null,
        formData?.otraNacionalidad || 'NO',
        formData?.especificarNacionalidad || null,
        formData?.consuladoDeseado || null,
        formData?.oficinaCAS || null
      ])
      
      formId = (result as any).insertId
    }

    // Guardar progreso del paso específico
    if (stepData && currentStep) {
      await connection.execute(
        `INSERT INTO ds160_step_progress (form_id, step_number, step_data)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         step_data = VALUES(step_data),
         completed_at = CURRENT_TIMESTAMP`,
        [formId, currentStep, JSON.stringify(stepData)]
      )
    }

    console.log('✅ Formulario guardado exitosamente')

    return NextResponse.json({
      success: true,
      message: 'Formulario guardado exitosamente',
      formId
    })

  } catch (error) {
    console.error('❌ Error guardando formulario:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// GET - Obtener datos del formulario
export async function GET(request: NextRequest) {
  let connection: mysql.Connection | null = null
  
  try {
    const { searchParams } = new URL(request.url)
    const formToken = searchParams.get('token')

    if (!formToken) {
      return NextResponse.json({
        success: false,
        error: 'Token del formulario requerido'
      }, { status: 400 })
    }

    connection = await createConnection()

    // Obtener datos principales del formulario
    const [formRows] = await connection.execute(
      'SELECT * FROM ds160_forms WHERE form_token = ?',
      [formToken]
    )

    const forms = formRows as any[]
    if (forms.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Formulario no encontrado'
      }, { status: 404 })
    }

    const formData = forms[0]

    // Obtener progreso de pasos
    const [progressRows] = await connection.execute(
      `SELECT step_number, step_data, completed_at 
       FROM ds160_step_progress 
       WHERE form_id = ? 
       ORDER BY step_number`,
      [formData.id]
    )

    const stepProgress = progressRows as any[]

    return NextResponse.json({
      success: true,
      data: {
        ...formData,
        stepProgress
      }
    })

  } catch (error) {
    console.error('❌ Error obteniendo formulario:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}