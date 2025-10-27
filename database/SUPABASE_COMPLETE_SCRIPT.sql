-- ================================================================
-- A8VISAS - FORMULARIO DS-160 - SCRIPT COMPLETO PARA SUPABASE
-- Fecha: 27 de octubre 2025
-- Versión: 2.0 - Actualizada y Optimizada
-- Base de datos: PostgreSQL (Supabase)
-- ================================================================

-- ================================================================
-- 1. ELIMINACIÓN DE OBJETOS EXISTENTES (OPCIONAL - DESCOMENTA SI NECESITAS RESET)
-- ================================================================
/*
DROP VIEW IF EXISTS ds160_active_forms CASCADE;
DROP TABLE IF EXISTS ds160_form_logs CASCADE;
DROP TABLE IF EXISTS ds160_step_progress CASCADE; 
DROP TABLE IF EXISTS ds160_forms CASCADE;
DROP TYPE IF EXISTS form_status CASCADE;
DROP TYPE IF EXISTS yes_no CASCADE;
DROP TYPE IF EXISTS marital_status CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS create_or_update_ds160_form(VARCHAR, VARCHAR, VARCHAR, JSONB, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_ds160_form_data(VARCHAR) CASCADE;
*/

-- ================================================================
-- 2. CREACIÓN DE TIPOS ENUM PERSONALIZADOS (CON VERIFICACIÓN)
-- ================================================================

-- Crear tipos solo si no existen
DO $$ 
BEGIN
    -- Verificar y crear form_status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'form_status') THEN
        CREATE TYPE form_status AS ENUM ('draft', 'in_progress', 'completed', 'submitted');
    END IF;
    
    -- Verificar y crear yes_no
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'yes_no') THEN
        CREATE TYPE yes_no AS ENUM ('SI', 'NO');
    END IF;
    
    -- Verificar y crear marital_status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'marital_status') THEN
        CREATE TYPE marital_status AS ENUM ('SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'SEPARADO', 'OTRO');
    END IF;
    
    -- Verificar y crear payment_status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'partial', 'cancelled');
    END IF;
END
$$;

-- ================================================================
-- 3. TABLA PRINCIPAL - FORMULARIOS DS-160
-- ================================================================

CREATE TABLE IF NOT EXISTS ds160_forms (
    id SERIAL PRIMARY KEY,
    
    -- ===== METADATA DEL FORMULARIO =====
    form_token VARCHAR(255) UNIQUE NOT NULL,
    client_name VARCHAR(500) NOT NULL,
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE NULL,
    status form_status DEFAULT 'draft',
    current_step INTEGER DEFAULT 1,
    progress_percentage DECIMAL(5,2) DEFAULT 0.0,
    payment_status payment_status DEFAULT 'pending',
    admin_comments TEXT[],
    
    -- ===== SECCIÓN 1: INFORMACIÓN PERSONAL =====
    apellidos VARCHAR(255),
    nombres VARCHAR(255),
    nombre_completo VARCHAR(500),
    otros_nombres_utilizados yes_no DEFAULT 'NO',
    lista_otros_nombres TEXT,
    fecha_nacimiento DATE,
    ciudad_nacimiento VARCHAR(255),
    estado_nacimiento VARCHAR(255),
    pais_nacimiento VARCHAR(255),
    ciudad_estado_pais_nacimiento TEXT,
    
    -- Nacionalidad
    nacionalidad VARCHAR(100) DEFAULT 'MEXICANA',
    otra_nacionalidad yes_no DEFAULT 'NO',
    especificar_nacionalidad VARCHAR(255),
    numero_identificacion_nacional VARCHAR(100),
    
    -- Selección de consulado y CAS
    consulado_deseado VARCHAR(100),
    oficina_cas VARCHAR(100),
    
    -- ===== SECCIÓN 2: INFORMACIÓN DE PASAPORTE Y CONTACTO =====
    numero_pasaporte VARCHAR(50),
    libro_pasaporte VARCHAR(50),
    fecha_expedicion DATE,
    fecha_vencimiento DATE,
    ciudad_expedicion VARCHAR(255),
    pais_expedicion VARCHAR(100) DEFAULT 'MEXICO',
    
    -- Domicilio
    domicilio_casa TEXT,
    ciudad_domicilio VARCHAR(255),
    estado_domicilio VARCHAR(255),
    codigo_postal VARCHAR(20),
    pais_domicilio VARCHAR(100) DEFAULT 'MEXICO',
    
    -- Contacto
    telefono_casa VARCHAR(50),
    celular VARCHAR(50),
    telefono_trabajo VARCHAR(50),
    correo_electronico VARCHAR(255),
    
    -- Información adicional de contacto
    ha_utilizado_otros_numeros yes_no DEFAULT 'NO',
    lista_otros_numeros TEXT,
    correos_adicionales TEXT,
    
    -- Redes sociales
    redes_sociales TEXT,
    plataformas_adicionales yes_no DEFAULT 'NO',
    lista_plataformas_adicionales TEXT,
    
    -- Idiomas y estado civil
    idiomas VARCHAR(500),
    estado_civil marital_status,
    nombre_conyuge VARCHAR(255),
    fecha_nacimiento_conyuge DATE,
    nacionalidad_conyuge VARCHAR(100),
    
    -- ===== SECCIÓN 3: INFORMACIÓN LABORAL/EDUCACIONAL =====
    ocupacion_actual VARCHAR(255),
    ocupacion_especifica TEXT,
    empleador VARCHAR(255),
    direccion_trabajo TEXT,
    ciudad_trabajo VARCHAR(255),
    estado_trabajo VARCHAR(255),
    pais_trabajo VARCHAR(100),
    telefono_trabajo_completo VARCHAR(50),
    salario_mensual DECIMAL(12,2),
    fecha_inicio_trabajo DATE,
    supervisor_nombre VARCHAR(255),
    
    -- Trabajos anteriores
    trabajos_anteriores JSONB,
    
    -- Educación
    educacion_nivel VARCHAR(100),
    institucion_educativa VARCHAR(255),
    direccion_institucion TEXT,
    curso_estudio VARCHAR(255),
    fecha_inicio_estudios DATE,
    fecha_fin_estudios DATE,
    
    -- ===== SECCIÓN 4: INFORMACIÓN DEL VIAJE =====
    proposito_viaje VARCHAR(255),
    proposito_especifico TEXT,
    fecha_llegada DATE,
    fecha_salida DATE,
    duracion_estancia VARCHAR(100),
    direccion_usa TEXT,
    ciudad_usa VARCHAR(255),
    estado_usa VARCHAR(100),
    
    -- Contacto en USA
    nombre_contacto_usa VARCHAR(255),
    telefono_contacto_usa VARCHAR(50),
    email_contacto_usa VARCHAR(255),
    relacion_contacto VARCHAR(100),
    
    -- Información del patrocinador
    nombre_patrocinador VARCHAR(255),
    telefono_patrocinador VARCHAR(50),
    domicilio_patrocinador TEXT,
    parentesco VARCHAR(100),
    quien_paga_viaje VARCHAR(255),
    
    -- Acompañantes
    personas_que_viajan TEXT,
    grupo_organizacion VARCHAR(255),
    
    -- ===== SECCIÓN 5: ANTECEDENTES DE VIAJE =====
    ha_visitado_usa yes_no DEFAULT 'NO',
    fechas_visitas_anteriores TEXT,
    tiempo_permanencia_anterior VARCHAR(255),
    
    -- Historial de visas
    visas_anteriores TEXT,
    visa_perdida_robada yes_no DEFAULT 'NO',
    detalles_visa_perdida TEXT,
    visa_cancelada yes_no DEFAULT 'NO',
    detalles_visa_cancelada TEXT,
    
    -- Deportación/Rechazo
    ha_sido_deportado yes_no DEFAULT 'NO',
    detalles_deportacion TEXT,
    le_han_negado_visa yes_no DEFAULT 'NO',
    detalles_negacion_visa TEXT,
    
    -- Otros países visitados
    otros_paises_visitados TEXT,
    
    -- ===== SECCIÓN 6: INFORMACIÓN FAMILIAR =====
    nombre_padre VARCHAR(255),
    fecha_nacimiento_padre DATE,
    nacionalidad_padre VARCHAR(100),
    en_usa_padre yes_no DEFAULT 'NO',
    
    nombre_madre VARCHAR(255),
    fecha_nacimiento_madre DATE,
    nacionalidad_madre VARCHAR(100),
    en_usa_madre yes_no DEFAULT 'NO',
    
    -- Familiares en USA
    familiares_en_usa yes_no DEFAULT 'NO',
    detalles_familiares_usa TEXT,
    
    -- Hijos
    tiene_hijos yes_no DEFAULT 'NO',
    informacion_hijos JSONB,
    
    -- ===== SECCIÓN 7: PREGUNTAS DE SEGURIDAD Y ANTECEDENTES =====
    
    -- Salud
    enfermedades_contagiosas yes_no DEFAULT 'NO',
    detalles_enfermedades_contagiosas TEXT,
    trastorno_mental_fisico yes_no DEFAULT 'NO',
    detalles_trastorno_mental_fisico TEXT,
    abuso_adiccion_drogas yes_no DEFAULT 'NO',
    detalles_abuso_adiccion_drogas TEXT,
    
    -- Antecedentes legales
    arrestos_crimenes yes_no DEFAULT 'NO',
    detalles_arrestos TEXT,
    sustancias_controladas yes_no DEFAULT 'NO',
    detalles_sustancias_controladas TEXT,
    
    -- Actividades ilegales
    prostitucion_trafico yes_no DEFAULT 'NO',
    detalles_prostitucion_trafico TEXT,
    lavado_dinero yes_no DEFAULT 'NO',
    detalles_lavado_dinero TEXT,
    
    -- Terrorismo y espionaje
    actividades_terroristas yes_no DEFAULT 'NO',
    detalles_actividades_terroristas TEXT,
    actividades_espionaje yes_no DEFAULT 'NO',
    detalles_actividades_espionaje TEXT,
    
    -- Genocidio y crímenes de guerra
    genocidio_crimenes_guerra yes_no DEFAULT 'NO',
    detalles_genocidio_crimenes_guerra TEXT,
    
    -- Niños secuestrados
    ninos_secuestrados yes_no DEFAULT 'NO',
    detalles_ninos_secuestrados TEXT,
    
    -- Violación de libertad religiosa
    violacion_libertad_religiosa yes_no DEFAULT 'NO',
    detalles_violacion_libertad_religiosa TEXT,
    
    -- Trasplante de órganos
    trasplante_organos_comercial yes_no DEFAULT 'NO',
    detalles_trasplante_organos TEXT,
    
    -- Inmigración
    inmigracion_irregular yes_no DEFAULT 'NO',
    detalles_inmigracion_irregular TEXT,
    trabajo_sin_autorizacion yes_no DEFAULT 'NO',
    detalles_trabajo_sin_autorizacion TEXT,
    
    -- Deportación de familiares
    familiar_deportado yes_no DEFAULT 'NO',
    detalles_familiar_deportado TEXT,
    
    -- Renuncia a inmunidad diplomática
    renuncia_inmunidad_diplomatica yes_no DEFAULT 'NO',
    detalles_renuncia_inmunidad TEXT,
    
    -- ===== CAMPOS ADICIONALES =====
    observaciones_adicionales TEXT,
    documentos_adjuntos TEXT[],
    
    -- ===== CAMPOS DE COMPATIBILIDAD =====
    ha_extraviado_visa yes_no DEFAULT 'NO',
    ha_extraviado_pasaporte yes_no DEFAULT 'NO',
    detalles_adicionales TEXT,
    cita_cas VARCHAR(50),
    ciudad_cita VARCHAR(50)
);

-- ================================================================
-- 4. ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_ds160_form_token ON ds160_forms(form_token);
CREATE INDEX IF NOT EXISTS idx_ds160_client_name ON ds160_forms(client_name);
CREATE INDEX IF NOT EXISTS idx_ds160_status ON ds160_forms(status);
CREATE INDEX IF NOT EXISTS idx_ds160_payment_status ON ds160_forms(payment_status);
CREATE INDEX IF NOT EXISTS idx_ds160_created_at ON ds160_forms(created_at);
CREATE INDEX IF NOT EXISTS idx_ds160_updated_at ON ds160_forms(updated_at);
CREATE INDEX IF NOT EXISTS idx_ds160_progress ON ds160_forms(progress_percentage);

-- ================================================================
-- 5. TABLA DE PROGRESO POR PASOS
-- ================================================================

CREATE TABLE IF NOT EXISTS ds160_step_progress (
    id SERIAL PRIMARY KEY,
    form_id INTEGER NOT NULL REFERENCES ds160_forms(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(100),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    step_data JSONB,
    validation_errors JSONB,
    
    UNIQUE(form_id, step_number)
);

CREATE INDEX IF NOT EXISTS idx_step_progress_form ON ds160_step_progress(form_id);
CREATE INDEX IF NOT EXISTS idx_step_progress_step ON ds160_step_progress(step_number);

-- ================================================================
-- 6. TABLA DE LOGS DE AUDITORÍA
-- ================================================================

CREATE TABLE IF NOT EXISTS ds160_form_logs (
    id SERIAL PRIMARY KEY,
    form_id INTEGER NOT NULL REFERENCES ds160_forms(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    step_number INTEGER,
    field_name VARCHAR(255),
    old_value TEXT,
    new_value TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_form_logs_form ON ds160_form_logs(form_id, created_at);
CREATE INDEX IF NOT EXISTS idx_form_logs_action ON ds160_form_logs(action);

-- ================================================================
-- 7. VISTAS ÚTILES
-- ================================================================

-- Vista de formularios activos con estadísticas
CREATE OR REPLACE VIEW ds160_active_forms AS 
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
    EXTRACT(DAY FROM (CURRENT_TIMESTAMP - created_at)) as days_since_created,
    EXTRACT(DAY FROM (CURRENT_TIMESTAMP - updated_at)) as days_since_updated,
    CASE 
        WHEN status = 'completed' THEN '✅ Completado'
        WHEN current_step >= 6 THEN '🟡 Casi terminado'
        WHEN current_step >= 3 THEN '🔄 En progreso'
        ELSE '🔵 Iniciado'
    END as status_display
FROM ds160_forms 
WHERE status IN ('draft', 'in_progress', 'completed')
ORDER BY updated_at DESC;

-- Vista de estadísticas generales
CREATE OR REPLACE VIEW ds160_statistics AS
SELECT 
    COUNT(*) as total_forms,
    COUNT(*) FILTER (WHERE status = 'draft') as draft_forms,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_forms,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_forms,
    COUNT(*) FILTER (WHERE status = 'submitted') as submitted_forms,
    AVG(progress_percentage) as avg_progress,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as forms_last_week,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as forms_last_month
FROM ds160_forms;

-- ================================================================
-- 8. FUNCIONES Y TRIGGERS
-- ================================================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    
    -- Actualizar progress_percentage basado en current_step
    NEW.progress_percentage = ROUND((NEW.current_step::DECIMAL / 7.0) * 100, 2);
    
    -- Marcar como completado si llegó al paso 7
    IF NEW.current_step >= 7 AND OLD.current_step < 7 THEN
        NEW.completed_at = CURRENT_TIMESTAMP;
        NEW.status = 'completed';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar campos automáticamente
DROP TRIGGER IF EXISTS update_ds160_forms_updated_at ON ds160_forms;
CREATE TRIGGER update_ds160_forms_updated_at 
    BEFORE UPDATE ON ds160_forms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 9. FUNCIONES ALMACENADAS PRINCIPALES
-- ================================================================

-- Función para crear o actualizar formulario
CREATE OR REPLACE FUNCTION create_or_update_ds160_form(
    p_form_token VARCHAR(255),
    p_client_name VARCHAR(500),
    p_client_email VARCHAR(255) DEFAULT NULL,
    p_client_phone VARCHAR(50) DEFAULT NULL,
    p_step_data JSONB DEFAULT '{}',
    p_current_step INTEGER DEFAULT 1
) RETURNS TABLE(form_id INTEGER, created BOOLEAN) AS $$
DECLARE
    v_form_id INTEGER;
    v_created BOOLEAN := FALSE;
BEGIN
    -- Intentar insertar nuevo formulario
    INSERT INTO ds160_forms (
        form_token, 
        client_name, 
        client_email, 
        client_phone,
        current_step,
        status
    ) VALUES (
        p_form_token, 
        p_client_name, 
        p_client_email,
        p_client_phone,
        p_current_step,
        CASE 
            WHEN p_current_step >= 7 THEN 'completed'::form_status
            WHEN p_current_step > 1 THEN 'in_progress'::form_status
            ELSE 'draft'::form_status
        END
    ) 
    ON CONFLICT (form_token) 
    DO UPDATE SET 
        client_name = EXCLUDED.client_name,
        client_email = COALESCE(EXCLUDED.client_email, ds160_forms.client_email),
        client_phone = COALESCE(EXCLUDED.client_phone, ds160_forms.client_phone),
        current_step = GREATEST(ds160_forms.current_step, p_current_step),
        status = CASE 
            WHEN GREATEST(ds160_forms.current_step, p_current_step) >= 7 THEN 'completed'::form_status
            WHEN GREATEST(ds160_forms.current_step, p_current_step) > 1 THEN 'in_progress'::form_status
            ELSE ds160_forms.status
        END
    RETURNING id, (xmax = 0) INTO v_form_id, v_created;
    
    -- Registrar progreso del paso si se proporcionan datos
    IF p_step_data IS NOT NULL AND p_step_data != '{}' THEN
        INSERT INTO ds160_step_progress (form_id, step_number, step_name, step_data)
        VALUES (
            v_form_id, 
            p_current_step, 
            'Paso ' || p_current_step,
            p_step_data
        )
        ON CONFLICT (form_id, step_number) 
        DO UPDATE SET 
            step_data = p_step_data,
            completed_at = CURRENT_TIMESTAMP;
    END IF;
        
    RETURN QUERY SELECT v_form_id, v_created;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener datos completos del formulario
CREATE OR REPLACE FUNCTION get_ds160_form_data(p_form_token VARCHAR(255))
RETURNS TABLE(
    form_data JSONB,
    steps_data JSONB,
    progress_info JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        row_to_json(f.*)::JSONB as form_data,
        COALESCE(
            jsonb_object_agg(
                'step_' || sp.step_number, 
                jsonb_build_object(
                    'data', sp.step_data,
                    'completed_at', sp.completed_at,
                    'step_name', sp.step_name
                )
            ) FILTER (WHERE sp.step_number IS NOT NULL),
            '{}'::JSONB
        ) as steps_data,
        jsonb_build_object(
            'total_steps', 7,
            'current_step', f.current_step,
            'progress_percentage', f.progress_percentage,
            'status', f.status,
            'completed_steps', (
                SELECT COUNT(*) 
                FROM ds160_step_progress sp2 
                WHERE sp2.form_id = f.id
            )
        ) as progress_info
    FROM ds160_forms f
    LEFT JOIN ds160_step_progress sp ON f.id = sp.form_id
    WHERE f.form_token = p_form_token
    GROUP BY f.id;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar estado de pago
CREATE OR REPLACE FUNCTION update_payment_status(
    p_form_token VARCHAR(255),
    p_payment_status payment_status,
    p_admin_comment TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_updated BOOLEAN := FALSE;
BEGIN
    UPDATE ds160_forms 
    SET 
        payment_status = p_payment_status,
        admin_comments = CASE 
            WHEN p_admin_comment IS NOT NULL THEN 
                COALESCE(admin_comments, ARRAY[]::TEXT[]) || p_admin_comment
            ELSE admin_comments
        END
    WHERE form_token = p_form_token;
    
    GET DIAGNOSTICS v_updated = FOUND;
    RETURN v_updated;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 10. POLÍTICAS DE SEGURIDAD RLS (ROW LEVEL SECURITY)
-- ================================================================

-- Habilitar RLS en tablas principales
ALTER TABLE ds160_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE ds160_step_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ds160_form_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir acceso completo a usuarios autenticados
DROP POLICY IF EXISTS ds160_forms_policy ON ds160_forms;
CREATE POLICY ds160_forms_policy ON ds160_forms
    FOR ALL USING (true);

DROP POLICY IF EXISTS ds160_step_progress_policy ON ds160_step_progress;
CREATE POLICY ds160_step_progress_policy ON ds160_step_progress
    FOR ALL USING (true);

DROP POLICY IF EXISTS ds160_form_logs_policy ON ds160_form_logs;
CREATE POLICY ds160_form_logs_policy ON ds160_form_logs
    FOR ALL USING (true);

-- ================================================================
-- 11. DATOS DE PRUEBA (OPCIONAL - DESCOMENTA SI NECESITAS)
-- ================================================================

/*
-- Insertar formulario de prueba
SELECT create_or_update_ds160_form(
    'TEST_TOKEN_001',
    'Juan Carlos Pérez González',
    'juan.perez@example.com',
    '+52 55 1234 5678',
    '{"nombre_completo": "PÉREZ GONZÁLEZ, JUAN CARLOS", "nacionalidad": "MEXICANA"}'::JSONB,
    1
);

-- Insertar datos adicionales de prueba
INSERT INTO ds160_forms (
    form_token, client_name, client_email, nombre_completo, 
    pais_nacimiento, consulado_deseado, status
) VALUES 
    ('TEST_002', 'María Elena Rodríguez', 'maria@example.com', 'RODRÍGUEZ LÓPEZ, MARÍA ELENA', 'MEXICO', 'Ciudad de México', 'in_progress'),
    ('TEST_003', 'Carlos Antonio Méndez', 'carlos@example.com', 'MÉNDEZ SILVA, CARLOS ANTONIO', 'MEXICO', 'Guadalajara', 'completed');
*/

-- ================================================================
-- 12. CONSULTAS ÚTILES PARA MONITOREO
-- ================================================================

-- Ver todos los formularios activos
-- SELECT * FROM ds160_active_forms LIMIT 10;

-- Ver estadísticas generales  
-- SELECT * FROM ds160_statistics;

-- Ver formularios por completar
-- SELECT form_token, client_name, current_step, progress_percentage 
-- FROM ds160_forms 
-- WHERE status IN ('draft', 'in_progress')
-- ORDER BY updated_at DESC;

-- Ver progreso de un formulario específico
-- SELECT * FROM get_ds160_form_data('tu_token_aqui');

-- ================================================================
-- FIN DEL SCRIPT - A8VISAS DS-160 SUPABASE
-- ================================================================

-- Para ejecutar este script en Supabase:
-- 1. Ve al editor SQL de Supabase
-- 2. Copia y pega este script completo
-- 3. Ejecuta el script
-- 4. Verifica que todas las tablas y funciones se crearon correctamente

-- Consulta de verificación final:
SELECT 
    'ds160_forms' as table_name, 
    COUNT(*) as row_count 
FROM ds160_forms
UNION ALL
SELECT 
    'ds160_step_progress' as table_name, 
    COUNT(*) as row_count 
FROM ds160_step_progress
UNION ALL
SELECT 
    'ds160_form_logs' as table_name, 
    COUNT(*) as row_count 
FROM ds160_form_logs;