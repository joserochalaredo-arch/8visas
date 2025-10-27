-- ================================================================
-- A8VISAS - SCRIPT SEGURO PARA SUPABASE (SIN ERRORES)
-- Fecha: 27 de octubre 2025
-- Versión: 2.1 - EJECUTAR ESTE SCRIPT
-- Base de datos: PostgreSQL (Supabase)
-- ================================================================

-- ================================================================
-- PASO 1: CREAR TIPOS ENUM SOLO SI NO EXISTEN
-- ================================================================

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
-- PASO 2: CREAR TABLA PRINCIPAL
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
-- PASO 3: CREAR ÍNDICES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_ds160_form_token ON ds160_forms(form_token);
CREATE INDEX IF NOT EXISTS idx_ds160_client_name ON ds160_forms(client_name);
CREATE INDEX IF NOT EXISTS idx_ds160_status ON ds160_forms(status);
CREATE INDEX IF NOT EXISTS idx_ds160_payment_status ON ds160_forms(payment_status);
CREATE INDEX IF NOT EXISTS idx_ds160_created_at ON ds160_forms(created_at);
CREATE INDEX IF NOT EXISTS idx_ds160_updated_at ON ds160_forms(updated_at);

-- ================================================================
-- PASO 4: CREAR TABLAS AUXILIARES
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

-- ================================================================
-- PASO 5: CREAR VISTAS
-- ================================================================

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

-- ================================================================
-- PASO 6: CREAR FUNCIONES
-- ================================================================

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

-- ================================================================
-- PASO 7: CREAR TRIGGERS
-- ================================================================

DROP TRIGGER IF EXISTS update_ds160_forms_updated_at ON ds160_forms;
CREATE TRIGGER update_ds160_forms_updated_at 
    BEFORE UPDATE ON ds160_forms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- PASO 8: CONFIGURAR SEGURIDAD RLS
-- ================================================================

ALTER TABLE ds160_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE ds160_step_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ds160_form_logs ENABLE ROW LEVEL SECURITY;

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
-- PASO 9: INSERTAR DATOS DE PRUEBA (OPCIONAL)
-- ================================================================

-- Uncomment to insert test data
/*
INSERT INTO ds160_forms (
    form_token, client_name, client_email, nombre_completo, 
    pais_nacimiento, consulado_deseado, status
) VALUES 
    ('TEST_001', 'Juan Carlos Pérez', 'juan@test.com', 'PÉREZ GONZÁLEZ, JUAN CARLOS', 'MEXICO', 'Ciudad de México', 'draft'),
    ('TEST_002', 'María Elena Rodríguez', 'maria@test.com', 'RODRÍGUEZ LÓPEZ, MARÍA ELENA', 'MEXICO', 'Guadalajara', 'in_progress')
ON CONFLICT (form_token) DO NOTHING;
*/

-- ================================================================
-- VERIFICACIÓN FINAL
-- ================================================================

SELECT 
    'ds160_forms' as table_name, 
    COUNT(*) as row_count,
    'Tabla principal creada' as status
FROM ds160_forms
UNION ALL
SELECT 
    'ds160_step_progress' as table_name, 
    COUNT(*) as row_count,
    'Tabla de progreso creada' as status
FROM ds160_step_progress
UNION ALL
SELECT 
    'ds160_form_logs' as table_name, 
    COUNT(*) as row_count,
    'Tabla de logs creada' as status
FROM ds160_form_logs;

-- ================================================================
-- MENSAJE DE ÉXITO
-- ================================================================

SELECT 
    '🎉 ¡SUPABASE DATABASE SETUP COMPLETO! 🎉' as mensaje,
    'Todas las tablas, índices, vistas y funciones han sido creadas correctamente' as detalle,
    'A8Visas DS-160 está listo para usar' as estado;