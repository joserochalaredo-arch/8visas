/**
 * Script de Validación de Conexión Supabase
 * A8Visas DS-160 System
 * 
 * Este script verifica:
 * - Conexión a Supabase
 * - Existencia de tablas
 * - Configuración de variables de entorno
 * - Estado del proyecto
 */

import { createClient } from '@supabase/supabase-js'

// Configurar colores para terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

const log = {
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg: string) => console.log(`${colors.bold}${colors.blue}🚀 ${msg}${colors.reset}`)
}

async function validateSupabaseConnection() {
  log.title('Iniciando validación de conexión Supabase...')
  console.log('============================================================')

  // 1. Verificar variables de entorno
  log.info('Paso 1: Verificando variables de entorno...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    log.error('NEXT_PUBLIC_SUPABASE_URL no está definida')
    return false
  }

  if (!supabaseAnonKey) {
    log.error('NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida')
    return false
  }

  if (!supabaseServiceKey) {
    log.warning('SUPABASE_SERVICE_ROLE_KEY no está definida (opcional)')
  }

  log.success('Variables de entorno configuradas correctamente')
  console.log(`   📍 URL: ${supabaseUrl}`)
  console.log(`   🔑 Anon Key: ${supabaseAnonKey.substring(0, 20)}...`)
  
  // 2. Crear cliente Supabase
  log.info('Paso 2: Creando cliente Supabase...')
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  log.success('Cliente Supabase creado exitosamente')

  // 3. Probar conexión básica
  log.info('Paso 3: Probando conexión básica...')
  
  try {
    const { data, error } = await supabase.from('clients').select('count').limit(1)
    
    if (error) {
      log.error(`Error de conexión: ${error.message}`)
      if (error.message.includes('relation "public.clients" does not exist')) {
        log.warning('La tabla "clients" no existe. ¿Ejecutaste el script SQL?')
      }
      return false
    }
    
    log.success('Conexión básica exitosa')
  } catch (err) {
    log.error(`Error inesperado: ${err}`)
    return false
  }

  // 4. Verificar existencia de tablas
  log.info('Paso 4: Verificando estructura de base de datos...')
  
  const expectedTables = ['clients', 'forms', 'form_comments', 'payments', 'form_history', 'pdf_documents']
  const tablesStatus = []

  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase.from(tableName).select('count').limit(1)
      
      if (error) {
        log.error(`❌ Tabla "${tableName}": ${error.message}`)
        tablesStatus.push({ table: tableName, exists: false, error: error.message })
      } else {
        log.success(`✅ Tabla "${tableName}": OK`)
        tablesStatus.push({ table: tableName, exists: true })
      }
    } catch (err) {
      log.error(`❌ Tabla "${tableName}": Error inesperado`)
      tablesStatus.push({ table: tableName, exists: false, error: 'Error inesperado' })
    }
  }

  const existingTables = tablesStatus.filter(t => t.exists).length
  const totalTables = expectedTables.length

  console.log(`\n📊 Resumen de tablas: ${existingTables}/${totalTables} encontradas`)

  if (existingTables === 0) {
    log.error('¡NINGUNA tabla encontrada! Debes ejecutar el script SQL.')
    log.info('📝 Ir a Supabase → SQL Editor → Ejecutar database/SUPABASE-FINAL.sql')
    return false
  }

  if (existingTables < totalTables) {
    log.warning(`Solo ${existingTables} de ${totalTables} tablas encontradas`)
    log.info('📝 Considera re-ejecutar el script SQL completo')
  }

  // 5. Probar funcionalidad específica
  log.info('Paso 5: Probando funcionalidades específicas...')

  // Probar inserción y eliminación (sin afectar datos reales)
  try {
    const testToken = `TEST_${Date.now()}`
    
    // Crear cliente de prueba
    const { data: newClient, error: insertError } = await supabase
      .from('clients')
      .insert({
        token: testToken,
        client_name: 'Cliente de Prueba',
        client_email: 'test@ejemplo.com',
        created_by: 'validation-script'
      })
      .select()
      .single()

    if (insertError) {
      log.error(`Error insertando cliente de prueba: ${insertError.message}`)
    } else {
      log.success('✅ Inserción de datos: OK')

      // Eliminar cliente de prueba
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', newClient.id)

      if (deleteError) {
        log.warning(`Advertencia eliminando cliente de prueba: ${deleteError.message}`)
      } else {
        log.success('✅ Eliminación de datos: OK')
      }
    }
  } catch (err) {
    log.error(`Error en prueba de funcionalidad: ${err}`)
  }

  // 6. Verificar vistas del dashboard
  log.info('Paso 6: Verificando vistas del dashboard...')
  
  try {
    const { data, error } = await supabase.from('client_dashboard').select('*').limit(1)
    
    if (error) {
      log.warning(`Vista client_dashboard: ${error.message}`)
    } else {
      log.success('✅ Vista client_dashboard: OK')
    }
  } catch (err) {
    log.warning('Vista client_dashboard no disponible')
  }

  try {
    const { data, error } = await supabase.from('dashboard_stats').select('*').limit(1)
    
    if (error) {
      log.warning(`Vista dashboard_stats: ${error.message}`)
    } else {
      log.success('✅ Vista dashboard_stats: OK')
    }
  } catch (err) {
    log.warning('Vista dashboard_stats no disponible')
  }

  // 7. Resumen final
  console.log('\n============================================================')
  log.title('Resumen de Validación')
  console.log('============================================================')

  if (existingTables === totalTables) {
    log.success('🎉 ¡Conexión a Supabase completamente funcional!')
    log.success('✅ Todas las tablas están creadas')
    log.success('✅ La base de datos está lista para usar')
    log.info('💡 Puedes iniciar el servidor: npm run dev')
    return true
  } else {
    log.warning('⚠️ Conexión parcialmente funcional')
    log.info('📝 Ejecutar el script SQL para crear tablas faltantes')
    log.info('📖 Ver: database/SUPABASE-FINAL.sql')
    return false
  }
}

// Ejecutar validación si se ejecuta directamente
if (require.main === module) {
  validateSupabaseConnection()
    .then((success) => {
      process.exit(success ? 0 : 1)
    })
    .catch((error) => {
      log.error(`Error crítico: ${error}`)
      process.exit(1)
    })
}

export default validateSupabaseConnection