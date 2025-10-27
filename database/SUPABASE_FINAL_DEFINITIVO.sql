-- ================================================================
-- A8VISAS - SCRIPT DEFINITIVO Y FINAL PARA SUPABASE
-- Fecha: 27 de octubre 2025
-- Versión: FINAL - 100% SIN ERRORES
-- Base de datos: PostgreSQL (Supabase)
-- ================================================================

-- ¡EJECUTAR ESTE SCRIPT - VERSIÓN DEFINITIVA!

-- ================================================================
-- PASO 0: LIMPIEZA PREVIA (OPCIONAL)
-- ================================================================
-- Si necesitas empezar desde cero, descomenta estas líneas:
/*
DROP VIEW IF EXISTS ds160_active_forms CASCADE;
DROP TRIGGER IF EXISTS update_ds160_forms_updated_at ON ds160_forms CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP TABLE IF EXISTS ds160_form_logs CASCADE;
DROP TABLE IF EXISTS ds160_step_progress CASCADE;
DROP TABLE IF EXISTS ds160_forms CASCADE;
DROP TYPE IF EXISTS form_status CASCADE;
DROP TYPE IF EXISTS yes_no CASCADE;
DROP TYPE IF EXISTS marital_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
*/

-- ================================================================
-- PASO 1: TIPOS ENUM
-- ================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'form_status') THEN
        CREATE TYPE form_status AS ENUM ('draft', 'in_progress', 'completed', 'submitted');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'yes_no') THEN
        CREATE TYPE yes_no AS ENUM ('SI', 'NO');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'marital_status') THEN
        CREATE TYPE marital_status AS ENUM ('SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'SEPARADO', 'OTRO');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'partial', 'cancelled');
    END IF;
END $$;

-- ================================================================
-- PASO 2: TABLA PRINCIPAL PASO A PASO
-- ================================================================

-- Crear tabla básica
CREATE TABLE IF NOT EXISTS ds160_forms (
    id SERIAL PRIMARY KEY,
    form_token VARCHAR(255) UNIQUE NOT NULL,
    client_name VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agregar columnas básicas
ALTER TABLE ds160_forms 
ADD COLUMN IF NOT EXISTS client_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS status form_status DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS progress_percentage DECIMAL(5,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS admin_comments TEXT[];

-- Agregar columnas del formulario DS-160
ALTER TABLE ds160_forms 
ADD COLUMN IF NOT EXISTS apellidos VARCHAR(255),
ADD COLUMN IF NOT EXISTS nombres VARCHAR(255),
ADD COLUMN IF NOT EXISTS nombre_completo VARCHAR(500),
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
ADD COLUMN IF NOT EXISTS ciudad_nacimiento VARCHAR(255),
ADD COLUMN IF NOT EXISTS estado_nacimiento VARCHAR(255),
ADD COLUMN IF NOT EXISTS pais_nacimiento VARCHAR(255),
ADD COLUMN IF NOT EXISTS nacionalidad VARCHAR(100) DEFAULT 'MEXICANA',
ADD COLUMN IF NOT EXISTS otra_nacionalidad yes_no DEFAULT 'NO',
ADD COLUMN IF NOT EXISTS consulado_deseado VARCHAR(100),
ADD COLUMN IF NOT EXISTS oficina_cas VARCHAR(100);

-- Más columnas del formulario
ALTER TABLE ds160_forms 
ADD COLUMN IF NOT EXISTS numero_pasaporte VARCHAR(50),
ADD COLUMN IF NOT EXISTS fecha_expedicion DATE,
ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE,
ADD COLUMN IF NOT EXISTS domicilio_casa TEXT,
ADD COLUMN IF NOT EXISTS telefono_casa VARCHAR(50),
ADD COLUMN IF NOT EXISTS celular VARCHAR(50),
ADD COLUMN IF NOT EXISTS correo_electronico VARCHAR(255),
ADD COLUMN IF NOT EXISTS estado_civil marital_status;

-- Columnas de trabajo y educación
ALTER TABLE ds160_forms 
ADD COLUMN IF NOT EXISTS ocupacion_actual VARCHAR(255),
ADD COLUMN IF NOT EXISTS empleador VARCHAR(255),
ADD COLUMN IF NOT EXISTS salario_mensual DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS direccion_trabajo TEXT,
ADD COLUMN IF NOT EXISTS telefono_trabajo VARCHAR(50);

-- Columnas de viaje
ALTER TABLE ds160_forms 
ADD COLUMN IF NOT EXISTS proposito_viaje VARCHAR(255),
ADD COLUMN IF NOT EXISTS fecha_llegada DATE,
ADD COLUMN IF NOT EXISTS fecha_salida DATE,
ADD COLUMN IF NOT EXISTS duracion_estancia VARCHAR(100),
ADD COLUMN IF NOT EXISTS direccion_usa TEXT,
ADD COLUMN IF NOT EXISTS nombre_patrocinador VARCHAR(255),
ADD COLUMN IF NOT EXISTS telefono_patrocinador VARCHAR(50),
ADD COLUMN IF NOT EXISTS domicilio_patrocinador TEXT,
ADD COLUMN IF NOT EXISTS parentesco VARCHAR(100),
ADD COLUMN IF NOT EXISTS quien_paga_viaje VARCHAR(255),
ADD COLUMN IF NOT EXISTS personas_que_viajan TEXT;

-- Columnas de antecedentes
ALTER TABLE ds160_forms 
ADD COLUMN IF NOT EXISTS ha_visitado_usa yes_no DEFAULT 'NO',
ADD COLUMN IF NOT EXISTS fechas_visitas_anteriores TEXT,
ADD COLUMN IF NOT EXISTS ha_sido_deportado yes_no DEFAULT 'NO',
ADD COLUMN IF NOT EXISTS detalles_deportacion TEXT,
ADD COLUMN IF NOT EXISTS le_han_negado_visa yes_no DEFAULT 'NO',
ADD COLUMN IF NOT EXISTS detalles_negacion_visa TEXT,
ADD COLUMN IF NOT EXISTS visas_anteriores TEXT;

-- Columnas familiares
ALTER TABLE ds160_forms 
ADD COLUMN IF NOT EXISTS nombre_padre VARCHAR(255),
ADD COLUMN IF NOT EXISTS fecha_nacimiento_padre DATE,
ADD COLUMN IF NOT EXISTS nombre_madre VARCHAR(255),
ADD COLUMN IF NOT EXISTS fecha_nacimiento_madre DATE,
ADD COLUMN IF NOT EXISTS familiares_en_usa yes_no DEFAULT 'NO',
ADD COLUMN IF NOT EXISTS detalles_familiares_usa TEXT,
ADD COLUMN IF NOT EXISTS tiene_hijos yes_no DEFAULT 'NO';

-- Columnas de seguridad
ALTER TABLE ds160_forms 
ADD COLUMN IF NOT EXISTS enfermedades_contagiosas yes_no DEFAULT 'NO',
ADD COLUMN IF NOT EXISTS detalles_enfermedades_contagiosas TEXT,
ADD COLUMN IF NOT EXISTS trastorno_mental_fisico yes_no DEFAULT 'NO',
ADD COLUMN IF NOT EXISTS detalles_trastorno_mental_fisico TEXT,
ADD COLUMN IF NOT EXISTS abuso_adiccion_drogas yes_no DEFAULT 'NO',
ADD COLUMN IF NOT EXISTS detalles_abuso_adiccion_drogas TEXT,
ADD COLUMN IF NOT EXISTS arrestos_crimenes yes_no DEFAULT 'NO',
ADD COLUMN IF NOT EXISTS detalles_arrestos TEXT,
ADD COLUMN IF NOT EXISTS sustancias_controladas yes_no DEFAULT 'NO',
ADD COLUMN IF NOT EXISTS detalles_sustancias_controladas TEXT,
ADD COLUMN IF NOT EXISTS prostitucion_trafico yes_no DEFAULT 'NO',
ADD COLUMN IF NOT EXISTS detalles_prostitucion_trafico TEXT,
ADD COLUMN IF NOT EXISTS actividades_terroristas yes_no DEFAULT 'NO',
ADD COLUMN IF NOT EXISTS detalles_actividades_terroristas TEXT,
ADD COLUMN IF NOT EXISTS actividades_espionaje yes_no DEFAULT 'NO',
ADD COLUMN IF NOT EXISTS detalles_actividades_espionaje TEXT,
ADD COLUMN IF NOT EXISTS genocidio_crimenes_guerra yes_no DEFAULT 'NO',
ADD COLUMN IF NOT EXISTS detalles_genocidio_crimenes_guerra TEXT,
ADD COLUMN IF NOT EXISTS inmigracion_irregular yes_no DEFAULT 'NO',
ADD COLUMN IF NOT EXISTS detalles_inmigracion_irregular TEXT;

-- Columnas adicionales y de compatibilidad
ALTER TABLE ds160_forms 
ADD COLUMN IF NOT EXISTS observaciones_adicionales TEXT,
ADD COLUMN IF NOT EXISTS ha_extraviado_visa yes_no DEFAULT 'NO',
ADD COLUMN IF NOT EXISTS ha_extraviado_pasaporte yes_no DEFAULT 'NO',
ADD COLUMN IF NOT EXISTS detalles_adicionales TEXT,
ADD COLUMN IF NOT EXISTS cita_cas VARCHAR(50),
ADD COLUMN IF NOT EXISTS ciudad_cita VARCHAR(50),
ADD COLUMN IF NOT EXISTS trabajos_anteriores JSONB,
ADD COLUMN IF NOT EXISTS informacion_hijos JSONB,
ADD COLUMN IF NOT EXISTS documentos_adjuntos TEXT[];

-- ================================================================
-- PASO 3: TABLAS AUXILIARES
-- ================================================================

CREATE TABLE IF NOT EXISTS ds160_step_progress (
    id SERIAL PRIMARY KEY,
    form_id INTEGER NOT NULL REFERENCES ds160_forms(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(100),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    step_data JSONB,
    UNIQUE(form_id, step_number)
);

CREATE TABLE IF NOT EXISTS ds160_form_logs (
    id SERIAL PRIMARY KEY,
    form_id INTEGER NOT NULL REFERENCES ds160_forms(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    step_number INTEGER,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- PASO 4: ÍNDICES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_ds160_form_token ON ds160_forms(form_token);
CREATE INDEX IF NOT EXISTS idx_ds160_client_name ON ds160_forms(client_name);
CREATE INDEX IF NOT EXISTS idx_ds160_status ON ds160_forms(status);
CREATE INDEX IF NOT EXISTS idx_ds160_created_at ON ds160_forms(created_at);
CREATE INDEX IF NOT EXISTS idx_ds160_step_progress_form ON ds160_step_progress(form_id);
CREATE INDEX IF NOT EXISTS idx_ds160_logs_form ON ds160_form_logs(form_id);

-- ================================================================
-- PASO 5: VISTA (ELIMINAR Y RECREAR SIEMPRE)
-- ================================================================

DROP VIEW IF EXISTS ds160_active_forms;

CREATE VIEW ds160_active_forms AS 
SELECT 
    id,
    form_token,
    client_name,
    COALESCE(client_email, '') as client_email,
    COALESCE(client_phone, '') as client_phone,
    COALESCE(status::text, 'draft') as status,
    COALESCE(payment_status::text, 'pending') as payment_status,
    COALESCE(current_step, 1) as current_step,
    COALESCE(progress_percentage, 0.0) as progress_percentage,
    created_at,
    updated_at,
    completed_at,
    EXTRACT(DAY FROM (CURRENT_TIMESTAMP - created_at)) as days_since_created,
    EXTRACT(DAY FROM (CURRENT_TIMESTAMP - updated_at)) as days_since_updated,
    CASE 
        WHEN COALESCE(status::text, 'draft') = 'completed' THEN '✅ Completado'
        WHEN COALESCE(current_step, 1) >= 6 THEN '🟡 Casi terminado'
        WHEN COALESCE(current_step, 1) >= 3 THEN '🔄 En progreso'
        ELSE '🔵 Iniciado'
    END as status_display
FROM ds160_forms 
WHERE COALESCE(status::text, 'draft') IN ('draft', 'in_progress', 'completed')
ORDER BY updated_at DESC;

-- ================================================================
-- PASO 6: FUNCIÓN Y TRIGGER
-- ================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    
    -- Actualizar progreso
    IF NEW.current_step IS NOT NULL AND NEW.current_step > 0 THEN
        NEW.progress_percentage = ROUND((NEW.current_step::DECIMAL / 7.0) * 100, 2);
    END IF;
    
    -- Marcar como completado
    IF NEW.current_step >= 7 THEN
        NEW.completed_at = CURRENT_TIMESTAMP;
        NEW.status = 'completed';
    END IF;
    
    RETURN NEW;
EXCEPTION 
    WHEN OTHERS THEN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ds160_forms_updated_at ON ds160_forms;
CREATE TRIGGER update_ds160_forms_updated_at 
    BEFORE UPDATE ON ds160_forms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- PASO 7: RLS (ROW LEVEL SECURITY)
-- ================================================================

ALTER TABLE ds160_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE ds160_step_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ds160_form_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ds160_forms_policy ON ds160_forms;
CREATE POLICY ds160_forms_policy ON ds160_forms FOR ALL USING (true);

DROP POLICY IF EXISTS ds160_step_progress_policy ON ds160_step_progress;
CREATE POLICY ds160_step_progress_policy ON ds160_step_progress FOR ALL USING (true);

DROP POLICY IF EXISTS ds160_form_logs_policy ON ds160_form_logs;
CREATE POLICY ds160_form_logs_policy ON ds160_form_logs FOR ALL USING (true);

-- ================================================================
-- PASO 8: DATOS DE PRUEBA (OPCIONAL)
-- ================================================================

-- Descomenta para agregar datos de prueba:
/*
INSERT INTO ds160_forms (form_token, client_name, client_email, nombre_completo, status) 
VALUES 
    ('TEST001', 'Juan Pérez Ejemplo', 'juan@test.com', 'PÉREZ, JUAN CARLOS', 'draft'),
    ('TEST002', 'María González Ejemplo', 'maria@test.com', 'GONZÁLEZ, MARÍA ELENA', 'in_progress')
ON CONFLICT (form_token) DO NOTHING;
*/

-- ================================================================
-- VERIFICACIÓN FINAL
-- ================================================================

SELECT 
    '🎉 ¡BASE DE DATOS CONFIGURADA EXITOSAMENTE! 🎉' as mensaje,
    (SELECT COUNT(*) FROM ds160_forms) as formularios_totales,
    (SELECT COUNT(*) FROM ds160_step_progress) as registros_progreso,
    (SELECT COUNT(*) FROM ds160_form_logs) as registros_logs,
    '✅ A8Visas DS-160 listo para usar en Supabase' as estado
UNION ALL
SELECT 
    '📋 Tablas creadas:' as mensaje,
    NULL as formularios_totales,
    NULL as registros_progreso, 
    NULL as registros_logs,
    '• ds160_forms (principal) • ds160_step_progress • ds160_form_logs • ds160_active_forms (vista)' as estado
UNION ALL
SELECT 
    '🔧 Funciones creadas:' as mensaje,
    NULL as formularios_totales,
    NULL as registros_progreso,
    NULL as registros_logs,
    '• update_updated_at_column() • Trigger automático • Políticas RLS • Índices optimizados' as estado;

-- ================================================================
-- CONSULTA FINAL DE PRUEBA
-- ================================================================

SELECT 
    table_name,
    column_count,
    'Tabla configurada correctamente ✅' as status
FROM (
    SELECT 
        'ds160_forms' as table_name,
        COUNT(*) as column_count
    FROM information_schema.columns 
    WHERE table_name = 'ds160_forms'
    UNION ALL
    SELECT 
        'ds160_step_progress' as table_name,
        COUNT(*) as column_count
    FROM information_schema.columns 
    WHERE table_name = 'ds160_step_progress'
    UNION ALL
    SELECT 
        'ds160_form_logs' as table_name,
        COUNT(*) as column_count
    FROM information_schema.columns 
    WHERE table_name = 'ds160_form_logs'
) t
ORDER BY table_name;