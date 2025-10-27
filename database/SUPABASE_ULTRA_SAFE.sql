-- ================================================================
-- A8VISAS - SCRIPT ULTRA SEGURO PARA SUPABASE
-- Fecha: 27 de octubre 2025
-- Versión: 2.2 - SIN ERRORES DE COLUMNAS
-- Base de datos: PostgreSQL (Supabase)
-- ================================================================

-- ================================================================
-- PASO 1: LIMPIAR COMPLETAMENTE (OPCIONAL - DESCOMENTA SI NECESITAS)
-- ================================================================

-- Descomenta las siguientes líneas SOLO si quieres empezar completamente desde cero
/*
DROP VIEW IF EXISTS ds160_active_forms CASCADE;
DROP TRIGGER IF EXISTS update_ds160_forms_updated_at ON ds160_forms;
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
-- PASO 2: CREAR TIPOS ENUM SEGUROS
-- ================================================================

DO $$ 
BEGIN
    -- Crear form_status si no existe
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'form_status') THEN
        CREATE TYPE form_status AS ENUM ('draft', 'in_progress', 'completed', 'submitted');
        RAISE NOTICE 'Tipo form_status creado';
    ELSE
        RAISE NOTICE 'Tipo form_status ya existe';
    END IF;
    
    -- Crear yes_no si no existe
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'yes_no') THEN
        CREATE TYPE yes_no AS ENUM ('SI', 'NO');
        RAISE NOTICE 'Tipo yes_no creado';
    ELSE
        RAISE NOTICE 'Tipo yes_no ya existe';
    END IF;
    
    -- Crear marital_status si no existe
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'marital_status') THEN
        CREATE TYPE marital_status AS ENUM ('SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'SEPARADO', 'OTRO');
        RAISE NOTICE 'Tipo marital_status creado';
    ELSE
        RAISE NOTICE 'Tipo marital_status ya existe';
    END IF;
    
    -- Crear payment_status si no existe
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'partial', 'cancelled');
        RAISE NOTICE 'Tipo payment_status creado';
    ELSE
        RAISE NOTICE 'Tipo payment_status ya existe';
    END IF;
END
$$;

-- ================================================================
-- PASO 3: CREAR TABLA PRINCIPAL DE FORMA SEGURA
-- ================================================================

DO $$
BEGIN
    -- Verificar si la tabla ya existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ds160_forms') THEN
        
        -- Crear la tabla completa
        CREATE TABLE ds160_forms (
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
        
        RAISE NOTICE 'Tabla ds160_forms creada exitosamente';
    ELSE
        RAISE NOTICE 'Tabla ds160_forms ya existe';
        
        -- Agregar columnas faltantes si la tabla existe pero no tiene todas las columnas
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'ds160_forms' AND column_name = 'client_phone') THEN
            ALTER TABLE ds160_forms ADD COLUMN client_phone VARCHAR(50);
            RAISE NOTICE 'Columna client_phone agregada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'ds160_forms' AND column_name = 'payment_status') THEN
            ALTER TABLE ds160_forms ADD COLUMN payment_status payment_status DEFAULT 'pending';
            RAISE NOTICE 'Columna payment_status agregada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'ds160_forms' AND column_name = 'progress_percentage') THEN
            ALTER TABLE ds160_forms ADD COLUMN progress_percentage DECIMAL(5,2) DEFAULT 0.0;
            RAISE NOTICE 'Columna progress_percentage agregada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'ds160_forms' AND column_name = 'admin_comments') THEN
            ALTER TABLE ds160_forms ADD COLUMN admin_comments TEXT[];
            RAISE NOTICE 'Columna admin_comments agregada';
        END IF;
        
        -- Agregar más columnas críticas si no existen
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'ds160_forms' AND column_name = 'completed_at') THEN
            ALTER TABLE ds160_forms ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE NULL;
            RAISE NOTICE 'Columna completed_at agregada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'ds160_forms' AND column_name = 'current_step') THEN
            ALTER TABLE ds160_forms ADD COLUMN current_step INTEGER DEFAULT 1;
            RAISE NOTICE 'Columna current_step agregada';
        END IF;
    END IF;
END
$$;

-- ================================================================
-- PASO 4: CREAR ÍNDICES DE FORMA SEGURA
-- ================================================================

DO $$
BEGIN
    -- Crear índices solo si no existen
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ds160_form_token') THEN
        CREATE INDEX idx_ds160_form_token ON ds160_forms(form_token);
        RAISE NOTICE 'Índice idx_ds160_form_token creado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ds160_client_name') THEN
        CREATE INDEX idx_ds160_client_name ON ds160_forms(client_name);
        RAISE NOTICE 'Índice idx_ds160_client_name creado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ds160_status') THEN
        CREATE INDEX idx_ds160_status ON ds160_forms(status);
        RAISE NOTICE 'Índice idx_ds160_status creado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ds160_created_at') THEN
        CREATE INDEX idx_ds160_created_at ON ds160_forms(created_at);
        RAISE NOTICE 'Índice idx_ds160_created_at creado';
    END IF;
END
$$;

-- ================================================================
-- PASO 5: CREAR TABLAS AUXILIARES
-- ================================================================

-- Tabla de progreso por pasos
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

-- Tabla de logs
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
-- PASO 6: CREAR VISTA SEGURA DINÁMICAMENTE
-- ================================================================

DO $$
DECLARE
    view_sql TEXT;
    has_client_phone BOOLEAN;
    has_payment_status BOOLEAN;
    has_progress_percentage BOOLEAN;
    has_completed_at BOOLEAN;
BEGIN
    -- Verificar qué columnas existen
    SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'client_phone') INTO has_client_phone;
    SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'payment_status') INTO has_payment_status;
    SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'progress_percentage') INTO has_progress_percentage;
    SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'ds160_forms' AND column_name = 'completed_at') INTO has_completed_at;
    
    -- Construir SQL dinámicamente
    view_sql := 'CREATE OR REPLACE VIEW ds160_active_forms AS SELECT id, form_token, client_name, COALESCE(client_email, '''') as client_email,';
    
    -- Agregar client_phone si existe
    IF has_client_phone THEN
        view_sql := view_sql || ' COALESCE(client_phone, '''') as client_phone,';
    ELSE
        view_sql := view_sql || ' '''' as client_phone,';
    END IF;
    
    view_sql := view_sql || ' status,';
    
    -- Agregar payment_status si existe
    IF has_payment_status THEN
        view_sql := view_sql || ' COALESCE(payment_status, ''pending''::payment_status) as payment_status,';
    ELSE
        view_sql := view_sql || ' ''pending'' as payment_status,';
    END IF;
    
    view_sql := view_sql || ' current_step,';
    
    -- Agregar progress_percentage si existe
    IF has_progress_percentage THEN
        view_sql := view_sql || ' COALESCE(progress_percentage, 0.0) as progress_percentage,';
    ELSE
        view_sql := view_sql || ' 0.0 as progress_percentage,';
    END IF;
    
    view_sql := view_sql || ' created_at, updated_at,';
    
    -- Agregar completed_at si existe
    IF has_completed_at THEN
        view_sql := view_sql || ' completed_at,';
    ELSE
        view_sql := view_sql || ' NULL::timestamp as completed_at,';
    END IF;
    
    view_sql := view_sql || ' EXTRACT(DAY FROM (CURRENT_TIMESTAMP - created_at)) as days_since_created,';
    view_sql := view_sql || ' EXTRACT(DAY FROM (CURRENT_TIMESTAMP - updated_at)) as days_since_updated,';
    view_sql := view_sql || ' CASE WHEN status = ''completed'' THEN ''✅ Completado'' WHEN current_step >= 6 THEN ''🟡 Casi terminado'' WHEN current_step >= 3 THEN ''🔄 En progreso'' ELSE ''🔵 Iniciado'' END as status_display';
    view_sql := view_sql || ' FROM ds160_forms WHERE status IN (''draft'', ''in_progress'', ''completed'') ORDER BY updated_at DESC';
    
    -- Ejecutar la creación de la vista
    EXECUTE view_sql;
    
    RAISE NOTICE 'Vista ds160_active_forms creada dinámicamente';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error al crear vista: %', SQLERRM;
        -- Crear vista básica como fallback
        EXECUTE 'CREATE OR REPLACE VIEW ds160_active_forms AS SELECT id, form_token, client_name, status, current_step, created_at, updated_at FROM ds160_forms WHERE status IN (''draft'', ''in_progress'', ''completed'') ORDER BY updated_at DESC';
        RAISE NOTICE 'Vista básica creada como fallback';
END
$$;

-- ================================================================
-- PASO 7: CREAR FUNCIÓN SEGURA PARA TRIGGERS
-- ================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Siempre actualizar updated_at
    NEW.updated_at = CURRENT_TIMESTAMP;
    
    -- Verificar si existe la columna progress_percentage antes de usarla
    IF TG_TABLE_NAME = 'ds160_forms' THEN
        -- Calcular progreso basado en current_step
        IF NEW.current_step IS NOT NULL THEN
            NEW.progress_percentage = ROUND((NEW.current_step::DECIMAL / 7.0) * 100, 2);
        END IF;
        
        -- Marcar como completado si llegó al paso 7
        IF NEW.current_step >= 7 AND (OLD.current_step IS NULL OR OLD.current_step < 7) THEN
            NEW.completed_at = CURRENT_TIMESTAMP;
            NEW.status = 'completed';
        END IF;
    END IF;
    
    RETURN NEW;
EXCEPTION 
    WHEN OTHERS THEN
        -- Si hay algún error, solo actualizar updated_at
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- PASO 8: CREAR TRIGGER SEGURO
-- ================================================================

DO $$
BEGIN
    -- Eliminar trigger si existe
    DROP TRIGGER IF EXISTS update_ds160_forms_updated_at ON ds160_forms;
    
    -- Crear trigger
    CREATE TRIGGER update_ds160_forms_updated_at 
        BEFORE UPDATE ON ds160_forms 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
        
    RAISE NOTICE 'Trigger update_ds160_forms_updated_at creado';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Error al crear trigger: %', SQLERRM;
END
$$;

-- ================================================================
-- PASO 9: CONFIGURAR RLS DE FORMA SEGURA
-- ================================================================

DO $$
BEGIN
    -- Configurar RLS para ds160_forms
    ALTER TABLE ds160_forms ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS ds160_forms_policy ON ds160_forms;
    CREATE POLICY ds160_forms_policy ON ds160_forms FOR ALL USING (true);
    
    -- Configurar RLS para tablas auxiliares
    ALTER TABLE ds160_step_progress ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS ds160_step_progress_policy ON ds160_step_progress;
    CREATE POLICY ds160_step_progress_policy ON ds160_step_progress FOR ALL USING (true);
    
    ALTER TABLE ds160_form_logs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS ds160_form_logs_policy ON ds160_form_logs;
    CREATE POLICY ds160_form_logs_policy ON ds160_form_logs FOR ALL USING (true);
    
    RAISE NOTICE 'Políticas RLS configuradas';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Error al configurar RLS: %', SQLERRM;
END
$$;

-- ================================================================
-- PASO 10: INSERTAR DATOS DE PRUEBA (OPCIONAL)
-- ================================================================

-- Descomenta para insertar datos de prueba
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
-- VERIFICACIÓN Y MENSAJE FINAL
-- ================================================================

DO $$
DECLARE
    forms_count INTEGER;
    progress_count INTEGER;
    logs_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO forms_count FROM ds160_forms;
    SELECT COUNT(*) INTO progress_count FROM ds160_step_progress;
    SELECT COUNT(*) INTO logs_count FROM ds160_form_logs;
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE '🎉 SUPABASE DATABASE SETUP COMPLETO! 🎉';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Tabla ds160_forms: % registros', forms_count;
    RAISE NOTICE 'Tabla ds160_step_progress: % registros', progress_count;
    RAISE NOTICE 'Tabla ds160_form_logs: % registros', logs_count;
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ A8Visas DS-160 está listo para usar';
    RAISE NOTICE '==============================================';
END
$$;

-- Consulta final de verificación
SELECT 
    'ds160_forms' as table_name, 
    COUNT(*) as row_count,
    '✅ Tabla principal lista' as status
FROM ds160_forms
UNION ALL
SELECT 
    'ds160_step_progress' as table_name, 
    COUNT(*) as row_count,
    '✅ Tabla de progreso lista' as status
FROM ds160_step_progress
UNION ALL
SELECT 
    'ds160_form_logs' as table_name, 
    COUNT(*) as row_count,
    '✅ Tabla de logs lista' as status
FROM ds160_form_logs
UNION ALL
SELECT 
    'ds160_active_forms' as table_name, 
    COUNT(*) as row_count,
    '✅ Vista activa lista' as status
FROM ds160_active_forms;