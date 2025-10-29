-- ================================================================
-- SCRIPT DE VERIFICACIÓN - DEBUGGING SUPABASE
-- Ejecutar en la consola SQL de Supabase para verificar el estado
-- ================================================================

-- PASO 1: Verificar que las tablas existan
SELECT 
    table_name,
    COUNT(*) as column_count,
    'Existe ✅' as status
FROM information_schema.columns 
WHERE table_name IN ('ds160_forms', 'ds160_step_progress', 'ds160_form_logs')
  AND table_schema = 'public'
GROUP BY table_name
ORDER BY table_name;

-- PASO 2: Verificar estructura de la tabla principal
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ds160_forms'
  AND table_schema = 'public'
ORDER BY ordinal_position
LIMIT 20;

-- PASO 3: Verificar datos existentes
SELECT 
    COUNT(*) as total_formularios,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as borradores,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completados,
    MAX(created_at) as ultimo_creado
FROM ds160_forms;

-- PASO 4: Ver los últimos 5 registros
SELECT 
    id,
    form_token,
    client_name,
    status,
    current_step,
    created_at
FROM ds160_forms 
ORDER BY created_at DESC 
LIMIT 5;

-- PASO 5: Probar inserción manual
INSERT INTO ds160_forms (
    form_token,
    client_name,
    client_email,
    nombre_completo,
    status,
    current_step,
    progress_percentage,
    created_at,
    updated_at
) VALUES (
    'MANUAL_TEST_' || EXTRACT(EPOCH FROM NOW()),
    'Cliente Manual Test',
    'manual@test.com',
    'MANUAL, CLIENTE TEST',
    'draft',
    1,
    14.3,
    NOW(),
    NOW()
) RETURNING id, form_token, client_name;

-- PASO 6: Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    'Configurado' as status
FROM pg_tables 
WHERE tablename IN ('ds160_forms', 'ds160_step_progress', 'ds160_form_logs')
  AND schemaname = 'public';

-- PASO 7: Verificar la vista
SELECT 
    COUNT(*) as registros_en_vista,
    'Vista funcionando ✅' as status
FROM ds160_active_forms;

-- RESULTADO ESPERADO:
-- Si todo está bien configurado, deberías ver:
-- ✅ Las 3 tablas principales existen
-- ✅ Estructura completa de ds160_forms
-- ✅ Inserción manual funciona
-- ✅ Vista ds160_active_forms funciona
-- ✅ RLS está habilitado

SELECT '🎉 VERIFICACIÓN COMPLETADA 🎉' as mensaje;