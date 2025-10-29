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