const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno faltantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addFamilyColumns() {
  console.log('🔧 Verificando y agregando columnas de familia...')
  
  try {
    // Intentar agregar las columnas (si ya existen, PostgreSQL las ignorará)
    const queries = [
      'ALTER TABLE ds160_forms ADD COLUMN IF NOT EXISTS family_group_id VARCHAR(255);',
      'ALTER TABLE ds160_forms ADD COLUMN IF NOT EXISTS family_group_name VARCHAR(255);',
      `ALTER TABLE ds160_forms ADD COLUMN IF NOT EXISTS family_role VARCHAR(50) CHECK (family_role IN ('main', 'spouse', 'child', 'parent', 'other'));`,
      'CREATE INDEX IF NOT EXISTS idx_ds160_family_group_id ON ds160_forms(family_group_id);',
      'CREATE INDEX IF NOT EXISTS idx_ds160_family_role ON ds160_forms(family_role);'
    ]
    
    for (const query of queries) {
      console.log('📝 Ejecutando:', query)
      const { error } = await supabase.rpc('exec_sql', { sql_query: query })
      if (error) {
        console.log('⚠️  Query falló (puede ser que la columna ya exista):', error.message)
      } else {
        console.log('✅ Query ejecutada exitosamente')
      }
    }
    
    // Verificar que las columnas existen
    console.log('\n🔍 Verificando estructura de la tabla...')
    const { data, error } = await supabase
      .from('ds160_forms')
      .select('id, family_group_id, family_group_name, family_role')
      .limit(1)
    
    if (error) {
      console.error('❌ Error verificando columnas:', error)
      return false
    }
    
    console.log('✅ Columnas de familia verificadas exitosamente')
    console.log('🏠 La funcionalidad de familias está lista para usar')
    return true
    
  } catch (error) {
    console.error('💥 Error configurando columnas de familia:', error)
    return false
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  addFamilyColumns().then(success => {
    process.exit(success ? 0 : 1)
  })
}

module.exports = { addFamilyColumns }