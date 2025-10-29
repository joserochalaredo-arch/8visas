-- ================================================================
-- A8VISAS - AGREGAR COLUMNAS DE FAMILIA
-- Fecha: 29 de octubre 2025
-- Descripción: Agregar funcionalidad de grupos familiares
-- ================================================================

-- Agregar columnas para manejo de familias
ALTER TABLE ds160_forms 
ADD COLUMN IF NOT EXISTS family_group_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS family_group_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS family_role VARCHAR(50) CHECK (family_role IN ('main', 'spouse', 'child', 'parent', 'other'));

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_ds160_family_group_id ON ds160_forms(family_group_id);
CREATE INDEX IF NOT EXISTS idx_ds160_family_role ON ds160_forms(family_role);

-- Verificación
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    'Columna agregada ✅' as status
FROM information_schema.columns 
WHERE table_name = 'ds160_forms' 
AND column_name IN ('family_group_id', 'family_group_name', 'family_role')
ORDER BY column_name;

-- Consulta de prueba
SELECT 
    'Columnas de familia agregadas exitosamente' as mensaje,
    COUNT(*) as total_forms,
    COUNT(CASE WHEN family_group_id IS NOT NULL THEN 1 END) as forms_with_family
FROM ds160_forms;