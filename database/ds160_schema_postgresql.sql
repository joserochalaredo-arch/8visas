-- Creación de la tabla DS160 para almacenar formularios DS-160
-- Fecha: 27 de octubre 2025
-- Sistema: A8Visas - Formulario DS-160
-- Base de datos: PostgreSQL

-- Tipos ENUM para PostgreSQL
CREATE TYPE form_status AS ENUM ('draft', 'in_progress', 'completed', 'submitted');
CREATE TYPE yes_no AS ENUM ('SI', 'NO');
CREATE TYPE marital_status AS ENUM ('SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'SEPARADO');

-- 1. Tabla principal de formularios DS-160
CREATE TABLE IF NOT EXISTS ds160_forms (
    id SERIAL PRIMARY KEY,
    
    -- Metadata del formulario
    form_token VARCHAR(255) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    status form_status DEFAULT 'draft',
    current_step INTEGER DEFAULT 1,
    
    -- PASO 1: Información Personal
    nombre_completo VARCHAR(500),
    fecha_nacimiento DATE,
    ciudad_estado_pais_nacimiento TEXT,
    otra_nacionalidad yes_no DEFAULT 'NO',
    especificar_nacionalidad VARCHAR(255),
    consulado_deseado VARCHAR(100),
    oficina_cas VARCHAR(100),
    
    -- PASO 2: Pasaporte y Contacto
    numero_pasaporte VARCHAR(50),
    fecha_expedicion DATE,
    fecha_vencimiento DATE,
    ciudad_expedicion VARCHAR(255),
    domicilio_casa TEXT,
    telefono_casa VARCHAR(50),
    celular VARCHAR(50),
    correo_electronico VARCHAR(255),
    ha_utilizado_otros_numeros yes_no DEFAULT 'NO',
    lista_otros_numeros TEXT,
    correos_adicionales TEXT,
    redes_sociales TEXT,
    plataformas_adicionales yes_no DEFAULT 'NO',
    lista_plataformas_adicionales TEXT,
    idiomas VARCHAR(500),
    estado_civil marital_status,
    
    -- PASO 3: Información Laboral (por definir)
    ocupacion_actual VARCHAR(255),
    empleador VARCHAR(255),
    direccion_trabajo TEXT,
    telefono_trabajo VARCHAR(50),
    salario_mensual DECIMAL(10,2),
    fecha_inicio_trabajo DATE,
    
    -- PASO 4: Viaje y Acompañantes
    nombre_patrocinador VARCHAR(255),
    telefono_patrocinador VARCHAR(50),
    domicilio_patrocinador TEXT,
    parentesco VARCHAR(100),
    fecha_llegada DATE,
    duracion_estancia VARCHAR(100),
    proposito_viaje VARCHAR(255),
    direccion_usa TEXT,
    quien_paga_viaje VARCHAR(255),
    personas_que_viajan TEXT,
    
    -- PASO 5: Antecedentes de Viaje
    ha_visitado_usa yes_no DEFAULT 'NO',
    fechas_visitas_anteriores TEXT,
    visas_anteriores TEXT,
    ha_sido_deportado yes_no DEFAULT 'NO',
    detalles_deportacion TEXT,
    
    -- PASO 6: Antecedentes Legales
    arrestos_crimenes yes_no DEFAULT 'NO',
    detalles_arrestos TEXT,
    enfermedades_contagiosas yes_no DEFAULT 'NO',
    detalles_enfermedades TEXT,
    uso_drogas yes_no DEFAULT 'NO',
    
    -- PASO 7: Información Adicional
    ha_extraviado_visa yes_no DEFAULT 'NO',
    le_han_negado_visa yes_no DEFAULT 'NO',
    ha_extraviado_pasaporte yes_no DEFAULT 'NO',
    detalles_adicionales TEXT,
    
    -- SECCIÓN FINAL: Preguntas de Seguridad y Antecedentes
    enfermedades_contagiosas_final yes_no DEFAULT 'NO',
    detalles_enfermedades_contagiosas TEXT,
    trastorno_mental_fisico yes_no DEFAULT 'NO',
    detalles_trastorno_mental_fisico TEXT,
    abuso_adiccion_drogas yes_no DEFAULT 'NO',
    detalles_abuso_adiccion_drogas TEXT,
    historial_criminal yes_no DEFAULT 'NO',
    detalles_historial_criminal TEXT,
    sustancias_controladas yes_no DEFAULT 'NO',
    detalles_sustancias_controladas TEXT,
    prostitucion_trafico yes_no DEFAULT 'NO',
    detalles_prostitucion_trafico TEXT,
    inmigracion_irregular yes_no DEFAULT 'NO',
    detalles_inmigracion_irregular TEXT,
    
    -- Campos de compatibilidad (mantener por ahora)
    ciudad_nacimiento VARCHAR(255),
    estado_nacimiento VARCHAR(255),
    pais_nacimiento VARCHAR(255),
    cita_cas VARCHAR(50),
    ciudad_cita VARCHAR(50)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_form_token ON ds160_forms(form_token);
CREATE INDEX IF NOT EXISTS idx_client_name ON ds160_forms(client_name);
CREATE INDEX IF NOT EXISTS idx_status ON ds160_forms(status);
CREATE INDEX IF NOT EXISTS idx_created_at ON ds160_forms(created_at);

-- 2. Tabla para el progreso de pasos completados
CREATE TABLE IF NOT EXISTS ds160_step_progress (
    id SERIAL PRIMARY KEY,
    form_id INTEGER NOT NULL REFERENCES ds160_forms(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    step_data JSONB,
    
    UNIQUE(form_id, step_number)
);

-- 3. Tabla de logs para auditoría
CREATE TABLE IF NOT EXISTS ds160_form_logs (
    id SERIAL PRIMARY KEY,
    form_id INTEGER NOT NULL REFERENCES ds160_forms(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    step_number INTEGER,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_form_logs ON ds160_form_logs(form_id, created_at);

-- 4. Vista para consultas rápidas de formularios activos
CREATE VIEW ds160_active_forms AS 
SELECT 
    id,
    form_token,
    client_name,
    client_email,
    status,
    current_step,
    ROUND((current_step / 7.0) * 100, 1) as progress_percentage,
    created_at,
    updated_at,
    EXTRACT(DAY FROM (NOW() - created_at)) as days_since_created
FROM ds160_forms 
WHERE status IN ('draft', 'in_progress');

-- 5. Función para actualizar timestamp (PostgreSQL)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_ds160_forms_updated_at 
    BEFORE UPDATE ON ds160_forms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Funciones almacenadas para PostgreSQL

-- Crear o actualizar formulario
CREATE OR REPLACE FUNCTION create_or_update_ds160_form(
    p_form_token VARCHAR(255),
    p_client_name VARCHAR(255),
    p_client_email VARCHAR(255),
    p_step_data JSONB,
    p_current_step INTEGER
) RETURNS INTEGER AS $$
DECLARE
    form_exists INTEGER := 0;
    form_id INTEGER;
BEGIN
    -- Verificar si existe el formulario
    SELECT COUNT(*) INTO form_exists 
    FROM ds160_forms 
    WHERE form_token = p_form_token;
    
    IF form_exists > 0 THEN
        -- Actualizar formulario existente
        UPDATE ds160_forms 
        SET 
            updated_at = CURRENT_TIMESTAMP,
            current_step = p_current_step,
            status = CASE 
                WHEN p_current_step = 7 THEN 'completed'::form_status
                WHEN p_current_step > 1 THEN 'in_progress'::form_status
                ELSE 'draft'::form_status
            END
        WHERE form_token = p_form_token
        RETURNING id INTO form_id;
    ELSE
        -- Crear nuevo formulario
        INSERT INTO ds160_forms (
            form_token, 
            client_name, 
            client_email, 
            current_step,
            status
        ) VALUES (
            p_form_token, 
            p_client_name, 
            p_client_email,
            p_current_step,
            CASE 
                WHEN p_current_step > 1 THEN 'in_progress'::form_status
                ELSE 'draft'::form_status
            END
        ) RETURNING id INTO form_id;
    END IF;
    
    -- Insertar o actualizar progreso del paso
    INSERT INTO ds160_step_progress (form_id, step_number, step_data)
    VALUES (form_id, p_current_step, p_step_data)
    ON CONFLICT (form_id, step_number) 
    DO UPDATE SET 
        step_data = p_step_data,
        completed_at = CURRENT_TIMESTAMP;
        
    RETURN form_id;
END;
$$ LANGUAGE plpgsql;

-- Obtener datos completos del formulario
CREATE OR REPLACE FUNCTION get_ds160_form_data(p_form_token VARCHAR(255))
RETURNS TABLE(
    form_data JSONB,
    steps_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        to_jsonb(f.*) as form_data,
        COALESCE(
            jsonb_object_agg(
                'step_' || sp.step_number, 
                sp.step_data
            ) FILTER (WHERE sp.step_number IS NOT NULL),
            '{}'::jsonb
        ) as steps_data
    FROM ds160_forms f
    LEFT JOIN ds160_step_progress sp ON f.id = sp.form_id
    WHERE f.form_token = p_form_token
    GROUP BY f.id;
END;
$$ LANGUAGE plpgsql;

-- 7. Datos de ejemplo para testing (opcional - comentado)
/*
INSERT INTO ds160_forms (
    form_token, 
    client_name, 
    client_email,
    nombre_completo,
    status
) VALUES (
    'test_token_123',
    'Juan Pérez Test',
    'juan.test@example.com',
    'PÉREZ GONZÁLEZ, JUAN CARLOS',
    'draft'
);
*/

-- 8. Consultas útiles de mantenimiento

-- Ver estadísticas de formularios
/*
SELECT 
    status,
    COUNT(*) as total_forms,
    AVG(current_step) as avg_step
FROM ds160_forms 
GROUP BY status;
*/

-- Ver formularios por completar en los últimos 30 días
/*
SELECT 
    client_name,
    current_step,
    EXTRACT(DAY FROM (NOW() - updated_at)) as days_inactive
FROM ds160_forms 
WHERE status IN ('draft', 'in_progress') 
  AND updated_at >= NOW() - INTERVAL '30 days'
ORDER BY updated_at DESC;
*/