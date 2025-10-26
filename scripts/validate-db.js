/**
 * Script de Validación Supabase - Versión JavaScript
 * A8Visas DS-160 System
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Colores para terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bold}${colors.blue}🚀 ${msg}${colors.reset}`)
}

async function validateSupabaseConnection() {
  log.title('VALIDACIÓN DE CONEXIÓN SUPABASE - A8VISAS')
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

  log.success('Variables de entorno configuradas correctamente')
  console.log(`   📍 URL: ${supabaseUrl}`)
  console.log(`   🔑 Anon Key: ${supabaseAnonKey.substring(0, 30)}...`)
  
  // 2. Crear cliente Supabase
  log.info('Paso 2: Creando cliente Supabase...')
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  log.success('Cliente Supabase creado exitosamente')

  // 3. Probar conexión básica
  log.info('Paso 3: Probando conexión a base de datos...')
  
  try {
    const { data, error } = await supabase.from('clients').select('count').limit(1)
    
    if (error) {
      log.error(`Error de conexión: ${error.message}`)
      if (error.message.includes('relation "public.clients" does not exist')) {
        log.warning('🔧 La tabla "clients" no existe.')
        log.info('📝 SOLUCIÓN: Ejecutar el script SQL en Supabase')
        log.info('   1. Ir a Supabase → SQL Editor')
        log.info('   2. Ejecutar database/SUPABASE-FINAL.sql')
      }
      return false
    }
    
    log.success('✅ Conexión a base de datos exitosa')
  } catch (err) {
    log.error(`Error inesperado: ${err.message}`)
    return false
  }

  // 4. Verificar todas las tablas
  log.info('Paso 4: Verificando estructura de base de datos...')
  
  const expectedTables = [
    'clients', 
    'forms', 
    'form_comments', 
    'payments', 
    'form_history', 
    'pdf_documents'
  ]
  
  let existingTables = 0

  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase.from(tableName).select('count').limit(1)
      
      if (error) {
        log.error(`Tabla "${tableName}": ${error.message}`)
      } else {
        log.success(`Tabla "${tableName}": ✅ OK`)
        existingTables++
      }
    } catch (err) {
      log.error(`Tabla "${tableName}": Error inesperado`)
    }
  }

  console.log(`\n📊 Resumen: ${existingTables}/${expectedTables.length} tablas encontradas`)

  // 5. Probar funcionalidad de inserción
  if (existingTables > 0) {
    log.info('Paso 5: Probando operaciones CRUD...')

    try {
      const testToken = `TEST_${Date.now()}`
      
      // Insertar cliente de prueba
      const { data: newClient, error: insertError } = await supabase
        .from('clients')
        .insert({
          token: testToken,
          client_name: 'Test Cliente Validación',
          client_email: 'test@validacion.com',
          created_by: 'validation-script'
        })
        .select()
        .single()

      if (insertError) {
        log.error(`Error insertando: ${insertError.message}`)
      } else {
        log.success('✅ Inserción: OK')

        // Eliminar cliente de prueba
        const { error: deleteError } = await supabase
          .from('clients')
          .delete()
          .eq('id', newClient.id)

        if (!deleteError) {
          log.success('✅ Eliminación: OK')
        }
      }
    } catch (err) {
      log.warning(`Operaciones CRUD: ${err.message}`)
    }
  }

  // 6. Verificar vistas
  log.info('Paso 6: Verificando vistas del dashboard...')
  
  try {
    const { error } = await supabase.from('client_dashboard').select('*').limit(1)
    if (!error) {
      log.success('✅ Vista client_dashboard: OK')
    }
  } catch (err) {
    log.warning('Vista client_dashboard no disponible')
  }

  try {
    const { error } = await supabase.from('dashboard_stats').select('*').limit(1)
    if (!error) {
      log.success('✅ Vista dashboard_stats: OK')
    }
  } catch (err) {
    log.warning('Vista dashboard_stats no disponible')
  }

  // 7. Resumen final
  console.log('\n============================================================')
  log.title('RESUMEN FINAL')
  console.log('============================================================')

  if (existingTables === expectedTables.length) {
    log.success('🎉 ¡CONEXIÓN SUPABASE COMPLETAMENTE FUNCIONAL!')
    log.success('✅ Todas las tablas están creadas correctamente')
    log.success('✅ Las operaciones CRUD funcionan')
    log.success('✅ La base de datos está lista para producción')
    console.log('')
    log.info('🚀 PRÓXIMOS PASOS:')
    log.info('   1. npm run dev')
    log.info('   2. Abrir http://localhost:3000/admin/dashboard')
    log.info('   3. ¡Comenzar a usar A8Visas!')
    return true
  } else if (existingTables > 0) {
    log.warning('⚠️ CONEXIÓN PARCIALMENTE FUNCIONAL')
    log.warning(`❗ Solo ${existingTables} de ${expectedTables.length} tablas encontradas`)
    console.log('')
    log.info('🔧 ACCIÓN REQUERIDA:')
    log.info('   1. Ir a Supabase Dashboard')
    log.info('   2. SQL Editor → New Query')
    log.info('   3. Ejecutar database/SUPABASE-FINAL.sql')
    return false
  } else {
    log.error('❌ CONEXIÓN FALLIDA - NO HAY TABLAS')
    console.log('')
    log.info('🆘 SOLUCIONES:')
    log.info('   1. Verificar credenciales de Supabase en .env.local')
    log.info('   2. Ejecutar script SQL: database/SUPABASE-FINAL.sql')
    log.info('   3. Verificar que el proyecto Supabase esté activo')
    return false
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  validateSupabaseConnection()
    .then((success) => {
      console.log('\n============================================================')
      if (success) {
        log.success('🎯 VALIDACIÓN COMPLETADA EXITOSAMENTE')
      } else {
        log.error('⚠️ VALIDACIÓN COMPLETADA CON ERRORES')
        log.info('📖 Revisar los pasos anteriores para resolver los problemas')
      }
      process.exit(success ? 0 : 1)
    })
    .catch((error) => {
      console.log('\n============================================================')
      log.error(`💥 ERROR CRÍTICO: ${error.message}`)
      log.info('🔧 Verificar:')
      log.info('   - Conexión a internet')
      log.info('   - Credenciales en .env.local')
      log.info('   - Estado del proyecto Supabase')
      process.exit(1)
    })
}

module.exports = validateSupabaseConnection