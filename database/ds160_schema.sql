-- Creación de la tabla DS160 para almacenar formularios DS-160
-- Fecha: 27 de octubre 2025
-- Sistema: A8Visas - Formulario DS-160
-- Compatible con: MySQL y PostgreSQL

-- 1. Tabla principal de formularios DS-160
CREATE TABLE IF NOT EXISTS ds160_forms (
    id SERIAL PRIMARY KEY, -- PostgreSQL: SERIAL, MySQL: INT AUTO_INCREMENT
    
    -- Metadata del formulario
    form_token VARCHAR(255) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    status ENUM('draft', 'in_progress', 'completed', 'submitted') DEFAULT 'draft',
    current_step INT DEFAULT 1,
    
    -- PASO 1: Información Personal
    nombre_completo VARCHAR(500),
    fecha_nacimiento DATE,
    ciudad_estado_pais_nacimiento TEXT,
    otra_nacionalidad ENUM('SI', 'NO') DEFAULT 'NO',
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
    ha_utilizado_otros_numeros ENUM('SI', 'NO') DEFAULT 'NO',
    lista_otros_numeros TEXT,
    correos_adicionales TEXT,
    redes_sociales TEXT,
    plataformas_adicionales ENUM('SI', 'NO') DEFAULT 'NO',
    lista_plataformas_adicionales TEXT,
    idiomas VARCHAR(500),
    estado_civil ENUM('SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'SEPARADO'),
    
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
    ha_visitado_usa ENUM('SI', 'NO') DEFAULT 'NO',
    fechas_visitas_anteriores TEXT,
    visas_anteriores TEXT,
    ha_sido_deportado ENUM('SI', 'NO') DEFAULT 'NO',
    detalles_deportacion TEXT,
    
    -- PASO 6: Antecedentes Legales
    arrestos_crimenes ENUM('SI', 'NO') DEFAULT 'NO',
    detalles_arrestos TEXT,
    enfermedades_contagiosas ENUM('SI', 'NO') DEFAULT 'NO',
    detalles_enfermedades TEXT,
    uso_drogas ENUM('SI', 'NO') DEFAULT 'NO',
    
    -- PASO 7: Información Adicional
    ha_extraviado_visa ENUM('SI', 'NO') DEFAULT 'NO',
    le_han_negado_visa ENUM('SI', 'NO') DEFAULT 'NO',
    ha_extraviado_pasaporte ENUM('SI', 'NO') DEFAULT 'NO',
    detalles_adicionales TEXT,
    
    -- SECCIÓN FINAL: Preguntas de Seguridad y Antecedentes
    enfermedades_contagiosas_final ENUM('SI', 'NO') DEFAULT 'NO',
    detalles_enfermedades_contagiosas TEXT,
    trastorno_mental_fisico ENUM('SI', 'NO') DEFAULT 'NO',
    detalles_trastorno_mental_fisico TEXT,
    abuso_adiccion_drogas ENUM('SI', 'NO') DEFAULT 'NO',
    detalles_abuso_adiccion_drogas TEXT,
    historial_criminal ENUM('SI', 'NO') DEFAULT 'NO',
    detalles_historial_criminal TEXT,
    sustancias_controladas ENUM('SI', 'NO') DEFAULT 'NO',
    detalles_sustancias_controladas TEXT,
    prostitucion_trafico ENUM('SI', 'NO') DEFAULT 'NO',
    detalles_prostitucion_trafico TEXT,
    inmigracion_irregular ENUM('SI', 'NO') DEFAULT 'NO',
    detalles_inmigracion_irregular TEXT,
    
    -- Campos de compatibilidad (mantener por ahora)
    ciudad_nacimiento VARCHAR(255),
    estado_nacimiento VARCHAR(255),
    pais_nacimiento VARCHAR(255),
    cita_cas VARCHAR(50),
    ciudad_cita VARCHAR(50),
    
    -- Índices para búsquedas rápidas
    INDEX idx_form_token (form_token),
    INDEX idx_client_name (client_name),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- MySQL AUTO_INCREMENT fix
ALTER TABLE ds160_forms MODIFY id INT AUTO_INCREMENT PRIMARY KEY;

-- 2. Tabla para el progreso de pasos completados
CREATE TABLE IF NOT EXISTS ds160_step_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    form_id INT NOT NULL,
    step_number INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    step_data JSON,
    
    FOREIGN KEY (form_id) REFERENCES ds160_forms(id) ON DELETE CASCADE,
    UNIQUE KEY unique_form_step (form_id, step_number)
);

-- 3. Tabla de logs para auditoría
CREATE TABLE IF NOT EXISTS ds160_form_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    form_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    step_number INT,
    old_data JSON,
    new_data JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (form_id) REFERENCES ds160_forms(id) ON DELETE CASCADE,
    INDEX idx_form_logs (form_id, created_at)
);

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
    DATEDIFF(NOW(), created_at) as days_since_created
FROM ds160_forms 
WHERE status IN ('draft', 'in_progress');

-- 5. Procedimientos almacenados útiles

-- Crear o actualizar formulario
DELIMITER $$
CREATE PROCEDURE CreateOrUpdateDS160Form(
    IN p_form_token VARCHAR(255),
    IN p_client_name VARCHAR(255),
    IN p_client_email VARCHAR(255),
    IN p_step_data JSON,
    IN p_current_step INT
)
BEGIN
    DECLARE form_exists INT DEFAULT 0;
    
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
                WHEN p_current_step = 7 THEN 'completed'
                WHEN p_current_step > 1 THEN 'in_progress'
                ELSE 'draft'
            END
        WHERE form_token = p_form_token;
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
                WHEN p_current_step > 1 THEN 'in_progress'
                ELSE 'draft'
            END
        );
    END IF;
    
    -- Insertar o actualizar progreso del paso
    INSERT INTO ds160_step_progress (form_id, step_number, step_data)
    SELECT id, p_current_step, p_step_data 
    FROM ds160_forms 
    WHERE form_token = p_form_token
    ON DUPLICATE KEY UPDATE 
        step_data = p_step_data,
        completed_at = CURRENT_TIMESTAMP;
        
END$$
DELIMITER ;

-- Obtener datos completos del formulario
DELIMITER $$
CREATE PROCEDURE GetDS160FormData(
    IN p_form_token VARCHAR(255)
)
BEGIN
    SELECT 
        f.*,
        GROUP_CONCAT(
            CONCAT('step_', sp.step_number, ':', sp.step_data)
            ORDER BY sp.step_number
        ) as steps_data
    FROM ds160_forms f
    LEFT JOIN ds160_step_progress sp ON f.id = sp.form_id
    WHERE f.form_token = p_form_token
    GROUP BY f.id;
END$$
DELIMITER ;

-- 6. Datos de ejemplo para testing (opcional)
-- INSERT INTO ds160_forms (
--     form_token, 
--     client_name, 
--     client_email,
--     nombre_completo,
--     status
-- ) VALUES (
--     'test_token_123',
--     'Juan Pérez Test',
--     'juan.test@example.com',
--     'PÉREZ GONZÁLEZ, JUAN CARLOS',
--     'draft'
-- );

-- 7. Consultas útiles de mantenimiento

-- Ver estadísticas de formularios
-- SELECT 
--     status,
--     COUNT(*) as total_forms,
--     AVG(current_step) as avg_step
-- FROM ds160_forms 
-- GROUP BY status;

-- Ver formularios por completar en los últimos 30 días
-- SELECT 
--     client_name,
--     current_step,
--     DATEDIFF(NOW(), updated_at) as days_inactive
-- FROM ds160_forms 
-- WHERE status IN ('draft', 'in_progress') 
--   AND updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
-- ORDER BY updated_at DESC;