-- =============================================================
-- Verificación de objetos DS-160 (MySQL/MariaDB)
-- Ejecuta este script en tu cliente MySQL
-- =============================================================

-- Tablas requeridas
SELECT 'ciudades_consulados' AS object,
       EXISTS (
         SELECT 1 FROM information_schema.tables 
         WHERE table_schema = DATABASE() AND table_name = 'ciudades_consulados'
       ) AS `exists`;

SELECT 'ds160_form_data' AS object,
       EXISTS (
         SELECT 1 FROM information_schema.tables 
         WHERE table_schema = DATABASE() AND table_name = 'ds160_form_data'
       ) AS `exists`;

-- Vista
SELECT 'v_ds160_completo' AS object,
       EXISTS (
         SELECT 1 FROM information_schema.views 
         WHERE table_schema = DATABASE() AND table_name = 'v_ds160_completo'
       ) AS `exists`;

-- Triggers sobre ds160_form_data
SELECT 'triggers_ds160_form_data' AS object,
       COUNT(*) > 0 AS `exists`,
       GROUP_CONCAT(CONCAT(TRIGGER_NAME, ':', ACTION_TIMING, ':', EVENT_MANIPULATION) SEPARATOR ', ') AS details
FROM information_schema.triggers
WHERE trigger_schema = DATABASE()
  AND event_object_table = 'ds160_form_data';

-- Procedimientos (si usaste el script MySQL)
SELECT 'GetEstadisticasFormulario' AS routine,
       EXISTS (
         SELECT 1 FROM information_schema.routines
         WHERE routine_schema = DATABASE()
           AND routine_name = 'GetEstadisticasFormulario'
           AND routine_type = 'PROCEDURE'
       ) AS `exists`;

SELECT 'LimpiarFormulariosAntiguos' AS routine,
       EXISTS (
         SELECT 1 FROM information_schema.routines
         WHERE routine_schema = DATABASE()
           AND routine_name = 'LimpiarFormulariosAntiguos'
           AND routine_type = 'PROCEDURE'
       ) AS `exists`;

-- Índices clave
SELECT 'idx_ciudad_cita on ds160_form_data' AS index_name,
       EXISTS (
         SELECT 1 FROM information_schema.statistics
         WHERE table_schema = DATABASE()
           AND table_name = 'ds160_form_data'
           AND index_name = 'idx_ciudad_cita'
       ) AS `exists`;
