-- =============================================================
-- Verificación de objetos DS-160 (PostgreSQL / Supabase)
-- Ejecuta este script en el SQL Editor de Supabase
-- =============================================================

-- Tablas requeridas
SELECT 'ciudades_consulados' AS object, EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'ciudades_consulados'
) AS exists;

SELECT 'ds160_form_data' AS object, EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'ds160_form_data'
) AS exists;

-- Vista
SELECT 'v_ds160_completo' AS object, EXISTS (
  SELECT 1 FROM information_schema.views 
  WHERE table_schema = 'public' AND table_name = 'v_ds160_completo'
) AS exists;

-- Triggers sobre ds160_form_data
SELECT 'triggers_ds160_form_data' AS object,
       COUNT(*) > 0 AS exists,
       json_agg(event_object_table || ':' || trigger_name || ':' || action_timing) AS details
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'ds160_form_data';

-- Funciones auxiliares esperadas (si usaste el script postgres)
SELECT 'fn_set_fecha_completado' AS function,
       EXISTS (
         SELECT 1 FROM pg_proc p
         JOIN pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname = 'public' AND p.proname = 'fn_set_fecha_completado'
       ) AS exists;

SELECT 'limpiar_formularios_antiguos' AS function,
       EXISTS (
         SELECT 1 FROM pg_proc p
         JOIN pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname = 'public' AND p.proname = 'limpiar_formularios_antiguos'
       ) AS exists;

-- Indices clave
SELECT 'idx_ciudad_cita on ds160_form_data' AS index_name,
       EXISTS (
         SELECT 1 FROM pg_class c
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE c.relkind = 'i'
           AND n.nspname = 'public'
           AND c.relname = 'idx_ciudad_cita'
       ) AS exists;
