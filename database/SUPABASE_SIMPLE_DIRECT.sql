-- ================================================================
-- A8VISAS - SCRIPT SIMPLE Y DIRECTO PARA SUPABASE
-- Fecha: 27 de octubre 2025
-- Versión: 3.0 - MÁXIMA COMPATIBILIDAD
-- Base de datos: PostgreSQL (Supabase)
-- ================================================================

-- ¡IMPORTANTE! Este script puede ejecutarse múltiples veces sin errores

-- ================================================================
-- LIMPIEZA COMPLETA (OPCIONAL)
-- ================================================================
-- Descomenta SOLO si quieres empezar completamente desde cero:

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
-- PASO 1: CREAR TIPOS ENUM (SAFE)
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
-- PASO 2: CREAR TABLA BÁSICA PRIMERO
-- ================================================================
CREATE TABLE IF NOT EXISTS ds160_forms (
    id SERIAL PRIMARY KEY,
    form_token VARCHAR(255) UNIQUE NOT NULL,
    client_name VARCHAR(500) NOT NULL,
    client_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status form_status DEFAULT 'draft'
);

-- ================================================================
-- PASO 3: AGREGAR COLUMNAS UNA POR UNA (SAFE)
-- ================================================================
DO $$
BEGIN
    -- Agregar columnas críticas una por una
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'client_phone') THEN
        ALTER TABLE ds160_forms ADD COLUMN client_phone VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'current_step') THEN
        ALTER TABLE ds160_forms ADD COLUMN current_step INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'completed_at') THEN
        ALTER TABLE ds160_forms ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'progress_percentage') THEN
        ALTER TABLE ds160_forms ADD COLUMN progress_percentage DECIMAL(5,2) DEFAULT 0.0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'payment_status') THEN
        ALTER TABLE ds160_forms ADD COLUMN payment_status payment_status DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'admin_comments') THEN
        ALTER TABLE ds160_forms ADD COLUMN admin_comments TEXT[];
    END IF;
END $$;

-- ================================================================
-- PASO 4: AGREGAR COLUMNAS DEL FORMULARIO DS-160
-- ================================================================
DO $$
BEGIN
    -- SECCIÓN 1: INFORMACIÓN PERSONAL
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'apellidos') THEN
        ALTER TABLE ds160_forms ADD COLUMN apellidos VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'nombres') THEN
        ALTER TABLE ds160_forms ADD COLUMN nombres VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'nombre_completo') THEN
        ALTER TABLE ds160_forms ADD COLUMN nombre_completo VARCHAR(500);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'fecha_nacimiento') THEN
        ALTER TABLE ds160_forms ADD COLUMN fecha_nacimiento DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'ciudad_nacimiento') THEN
        ALTER TABLE ds160_forms ADD COLUMN ciudad_nacimiento VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'estado_nacimiento') THEN
        ALTER TABLE ds160_forms ADD COLUMN estado_nacimiento VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'pais_nacimiento') THEN
        ALTER TABLE ds160_forms ADD COLUMN pais_nacimiento VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'nacionalidad') THEN
        ALTER TABLE ds160_forms ADD COLUMN nacionalidad VARCHAR(100) DEFAULT 'MEXICANA';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'otra_nacionalidad') THEN
        ALTER TABLE ds160_forms ADD COLUMN otra_nacionalidad yes_no DEFAULT 'NO';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'consulado_deseado') THEN
        ALTER TABLE ds160_forms ADD COLUMN consulado_deseado VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'oficina_cas') THEN
        ALTER TABLE ds160_forms ADD COLUMN oficina_cas VARCHAR(100);
    END IF;
    
    -- SECCIÓN 2: PASAPORTE Y CONTACTO
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'numero_pasaporte') THEN
        ALTER TABLE ds160_forms ADD COLUMN numero_pasaporte VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'fecha_expedicion') THEN
        ALTER TABLE ds160_forms ADD COLUMN fecha_expedicion DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'fecha_vencimiento') THEN
        ALTER TABLE ds160_forms ADD COLUMN fecha_vencimiento DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'domicilio_casa') THEN
        ALTER TABLE ds160_forms ADD COLUMN domicilio_casa TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'telefono_casa') THEN
        ALTER TABLE ds160_forms ADD COLUMN telefono_casa VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'celular') THEN
        ALTER TABLE ds160_forms ADD COLUMN celular VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'correo_electronico') THEN
        ALTER TABLE ds160_forms ADD COLUMN correo_electronico VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'estado_civil') THEN
        ALTER TABLE ds160_forms ADD COLUMN estado_civil marital_status;
    END IF;
    
    -- SECCIÓN 3: TRABAJO
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'ocupacion_actual') THEN
        ALTER TABLE ds160_forms ADD COLUMN ocupacion_actual VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'empleador') THEN
        ALTER TABLE ds160_forms ADD COLUMN empleador VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'salario_mensual') THEN
        ALTER TABLE ds160_forms ADD COLUMN salario_mensual DECIMAL(12,2);
    END IF;
    
    -- SECCIÓN 4: VIAJE
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'proposito_viaje') THEN
        ALTER TABLE ds160_forms ADD COLUMN proposito_viaje VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'fecha_llegada') THEN
        ALTER TABLE ds160_forms ADD COLUMN fecha_llegada DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'duracion_estancia') THEN
        ALTER TABLE ds160_forms ADD COLUMN duracion_estancia VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'direccion_usa') THEN
        ALTER TABLE ds160_forms ADD COLUMN direccion_usa TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'nombre_patrocinador') THEN
        ALTER TABLE ds160_forms ADD COLUMN nombre_patrocinador VARCHAR(255);
    END IF;
    
    -- SECCIÓN 5: ANTECEDENTES DE VIAJE
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'ha_visitado_usa') THEN
        ALTER TABLE ds160_forms ADD COLUMN ha_visitado_usa yes_no DEFAULT 'NO';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'ha_sido_deportado') THEN
        ALTER TABLE ds160_forms ADD COLUMN ha_sido_deportado yes_no DEFAULT 'NO';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'le_han_negado_visa') THEN
        ALTER TABLE ds160_forms ADD COLUMN le_han_negado_visa yes_no DEFAULT 'NO';
    END IF;
    
    -- SECCIÓN 6: INFORMACIÓN FAMILIAR
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'nombre_padre') THEN
        ALTER TABLE ds160_forms ADD COLUMN nombre_padre VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'nombre_madre') THEN
        ALTER TABLE ds160_forms ADD COLUMN nombre_madre VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'familiares_en_usa') THEN
        ALTER TABLE ds160_forms ADD COLUMN familiares_en_usa yes_no DEFAULT 'NO';
    END IF;
    
    -- SECCIÓN 7: PREGUNTAS DE SEGURIDAD
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'enfermedades_contagiosas') THEN
        ALTER TABLE ds160_forms ADD COLUMN enfermedades_contagiosas yes_no DEFAULT 'NO';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'arrestos_crimenes') THEN
        ALTER TABLE ds160_forms ADD COLUMN arrestos_crimenes yes_no DEFAULT 'NO';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'abuso_adiccion_drogas') THEN
        ALTER TABLE ds160_forms ADD COLUMN abuso_adiccion_drogas yes_no DEFAULT 'NO';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'actividades_terroristas') THEN
        ALTER TABLE ds160_forms ADD COLUMN actividades_terroristas yes_no DEFAULT 'NO';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'prostitucion_trafico') THEN
        ALTER TABLE ds160_forms ADD COLUMN prostitucion_trafico yes_no DEFAULT 'NO';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'inmigracion_irregular') THEN
        ALTER TABLE ds160_forms ADD COLUMN inmigracion_irregular yes_no DEFAULT 'NO';
    END IF;
    
    -- CAMPOS DE COMPATIBILIDAD
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'ha_extraviado_visa') THEN
        ALTER TABLE ds160_forms ADD COLUMN ha_extraviado_visa yes_no DEFAULT 'NO';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'detalles_adicionales') THEN
        ALTER TABLE ds160_forms ADD COLUMN detalles_adicionales TEXT;
    END IF;
END $$;

-- ================================================================
-- PASO 5: CREAR TABLAS AUXILIARES
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
-- PASO 6: CREAR ÍNDICES
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_ds160_form_token ON ds160_forms(form_token);
CREATE INDEX IF NOT EXISTS idx_ds160_client_name ON ds160_forms(client_name);
CREATE INDEX IF NOT EXISTS idx_ds160_status ON ds160_forms(status);
CREATE INDEX IF NOT EXISTS idx_ds160_created_at ON ds160_forms(created_at);

-- ================================================================
-- PASO 7: CREAR VISTA SIMPLE (SEGURA)
-- ================================================================
DROP VIEW IF EXISTS ds160_active_forms;

CREATE VIEW ds160_active_forms AS 
SELECT 
    id,
    form_token,
    client_name,
    client_email,
    client_phone,
    status,
    payment_status,
    current_step,
    progress_percentage,
    created_at,
    updated_at,
    completed_at,
    CASE 
        WHEN status = 'completed' THEN '✅ Completado'
        WHEN current_step >= 6 THEN '🟡 Casi terminado'
        WHEN current_step >= 3 THEN '🔄 En progreso'
        ELSE '🔵 Iniciado'
    END as status_display
FROM ds160_forms 
WHERE status IN ('draft', 'in_progress', 'completed')
ORDER BY updated_at DESC;

-- ================================================================
-- PASO 8: CREAR FUNCIÓN Y TRIGGER BÁSICOS
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    
    -- Actualizar progreso si existe la columna
    IF NEW.current_step IS NOT NULL THEN
        NEW.progress_percentage = ROUND((NEW.current_step::DECIMAL / 7.0) * 100, 2);
    END IF;
    
    -- Marcar como completado si llegó al paso 7
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
-- PASO 9: CONFIGURAR RLS BÁSICO
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
-- VERIFICACIÓN FINAL
-- ================================================================
SELECT 
    '🎉 A8VISAS DATABASE SETUP COMPLETO 🎉' as mensaje,
    (SELECT COUNT(*) FROM ds160_forms) as total_formularios,
    (SELECT COUNT(*) FROM ds160_step_progress) as total_progreso,
    (SELECT COUNT(*) FROM ds160_form_logs) as total_logs,
    '✅ Sistema listo para usar' as estado;