-- ===================================================================================================
-- SCRIPT SQL - FORMULARIO DS-160 A8VISAS
-- ===================================================================================================
-- Este script crea las tablas necesarias para el formulario DS-160 según la estructura actualizada
-- Fecha: Octubre 2025
-- Sistema: A8Visas - Formulario DS-160
-- IMPORTANTE: Este archivo usa sintaxis de MySQL/MariaDB (backticks ``, ENUM, ENGINE, DELIMITER).
-- Si estás usando PostgreSQL, ejecuta el archivo: database/ds160_form_structure_postgres.sql
-- ===================================================================================================

-- Eliminar tablas existentes si existen (en orden correcto para evitar problemas de FK)
DROP TABLE IF EXISTS `ds160_form_data`;
DROP TABLE IF EXISTS `ciudades_consulados`;
DROP TABLE IF EXISTS `ciudades_cas`;

-- ===================================================================================================
-- TABLA: ciudades_consulados
-- ===================================================================================================
-- Tabla de ciudades donde hay consulados o embajadas de Estados Unidos
CREATE TABLE `ciudades_consulados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(10) NOT NULL COMMENT 'Código de la ciudad (GDL, MTY, MEX, etc.)',
  `nombre_completo` varchar(100) NOT NULL COMMENT 'Nombre completo de la ciudad',
  `estado` varchar(50) NOT NULL COMMENT 'Estado o región',
  `pais` varchar(50) NOT NULL DEFAULT 'México' COMMENT 'País',
  `tipo_oficina` enum('CONSULADO','EMBAJADA','CAS') NOT NULL COMMENT 'Tipo de oficina consular',
  `direccion` text COMMENT 'Dirección completa del consulado/embajada',
  `telefono` varchar(20) COMMENT 'Teléfono de contacto',
  `activo` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Si está activo para selección',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_UNIQUE` (`codigo`),
  KEY `idx_activo` (`activo`),
  KEY `idx_tipo_oficina` (`tipo_oficina`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ciudades con consulados, embajadas y centros CAS';

-- ===================================================================================================
-- INSERTAR DATOS DE CIUDADES CONSULARES
-- ===================================================================================================
INSERT INTO `ciudades_consulados` (`codigo`, `nombre_completo`, `estado`, `tipo_oficina`, `direccion`, `telefono`) VALUES
-- Principales consulados
('GDL', 'Guadalajara', 'Jalisco', 'CONSULADO', 'Av. López Cotilla 1951, Col. Americana, 44160 Guadalajara, Jal.', '+52 33 3268-2100'),
('MTY', 'Monterrey', 'Nuevo León', 'CONSULADO', 'Av. Constitución 411 Pte., Centro, 64000 Monterrey, N.L.', '+52 81 8047-3100'),
('MEX', 'Ciudad de México', 'Ciudad de México', 'EMBAJADA', 'Paseo de la Reforma 305, Cuauhtémoc, 06500 Ciudad de México, CDMX', '+52 55 5080-2000'),
-- Otros consulados importantes
('TIJ', 'Tijuana', 'Baja California', 'CONSULADO', 'Paseo de las Culturas s/n, Mesa de Otay, 22427 Tijuana, B.C.', '+52 664 977-2000'),
('JUA', 'Ciudad Juárez', 'Chihuahua', 'CONSULADO', 'Paseo de la Victoria 3650, Partido Senecú, 32543 Cd Juárez, Chih.', '+52 656 227-3000'),
('NOG', 'Nogales', 'Sonora', 'CONSULADO', 'Calle San José s/n, Fracc. Los Alamos, 84065 Nogales, Son.', '+52 631 311-8150'),
('NLD', 'Nuevo Laredo', 'Tamaulipas', 'CONSULADO', 'Allende 3330, Col. Jardín, 88260 Nuevo Laredo, Tamps.', '+52 867 714-0512'),
('MAT', 'Matamoros', 'Tamaulipas', 'CONSULADO', 'Calle Primera 2002, 87330 Matamoros, Tamps.', '+52 868 812-4402'),
('HER', 'Hermosillo', 'Sonora', 'CONSULADO', 'Blvd. Luis Encinas Johnson 450, San Benito, 83190 Hermosillo, Son.', '+52 662 289-3500'),
('MER', 'Mérida', 'Yucatán', 'CONSULADO', 'Calle 60 No. 338-K x 29 y 31, Centro, 97000 Mérida, Yuc.', '+52 999 942-5700'),
-- Opción genérica
('OTRO', 'Otra Ciudad', 'Otro Estado', 'CONSULADO', 'Por especificar', NULL);

-- ===================================================================================================
-- TABLA PRINCIPAL: ds160_form_data  
-- ===================================================================================================
-- Tabla principal que almacena todos los datos del formulario DS-160
CREATE TABLE `ds160_form_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(36) NOT NULL COMMENT 'UUID único del formulario',
  
  -- ===============================
  -- PASO 1: INFORMACIÓN PERSONAL
  -- ===============================
  `nombre_completo` varchar(200) NOT NULL COMMENT 'Nombre completo como viene en el pasaporte',
  `fecha_nacimiento` date NOT NULL COMMENT 'Fecha de nacimiento DD/MM/AAAA',
  `ciudad_nacimiento` varchar(100) NOT NULL COMMENT 'Ciudad de nacimiento',
  `estado_nacimiento` varchar(100) NOT NULL COMMENT 'Estado de nacimiento',
  `pais_nacimiento` varchar(100) NOT NULL COMMENT 'País de nacimiento',
  `otra_nacionalidad` enum('SI','NO') NOT NULL COMMENT 'Tiene otra nacionalidad',
  `especificar_nacionalidad` varchar(100) NULL COMMENT 'Especificar otra nacionalidad si aplica',
  `idiomas` text NOT NULL COMMENT 'Idiomas que habla',

  -- ===============================
  -- PASO 2: PASAPORTE Y CONTACTO
  -- ===============================
    `ciudad_cita` varchar(10) NOT NULL COMMENT 'Ciudad donde quiere la cita (referencia a ciudades_consulados.codigo)',
  `numero_pasaporte` varchar(50) NOT NULL COMMENT 'Número de pasaporte',
  `fecha_expedicion` date NOT NULL COMMENT 'Fecha de expedición DD/MM/AAAA',
  `fecha_vencimiento` date NOT NULL COMMENT 'Fecha de vencimiento DD/MM/AAAA',
  `ciudad_expedicion` varchar(100) NOT NULL COMMENT 'Ciudad de expedición',
  `domicilio` text NOT NULL COMMENT 'Domicilio de casa con colonia y código postal',
  `telefono_casa` varchar(20) NULL COMMENT 'Teléfono de casa',
  `celular` varchar(20) NOT NULL COMMENT 'Número de celular',
  `correo_electronico` varchar(200) NOT NULL COMMENT 'Correo electrónico obligatorio',
  `otros_numeros_5anos` enum('SI','NO') NOT NULL COMMENT 'Ha utilizado otros números de teléfono en los últimos 5 años',
  `lista_numeros_anteriores` text NULL COMMENT 'Lista de números telefónicos anteriores',
  `correos_adicionales_5anos` text NULL COMMENT 'Direcciones de correos adicionales en los últimos 5 años',
  `redes_sociales` text NOT NULL COMMENT 'Nombre de redes sociales que maneja y nombre de usuario',
  `plataformas_adicionales_5anos` enum('SI','NO') NOT NULL COMMENT 'Utiliza plataformas de redes sociales adicionales en los últimos 5 años',
  `lista_plataformas_adicionales` text NULL COMMENT 'Lista de plataformas adicionales',

  -- ===============================
  -- PASO 3: ESTADO CIVIL
  -- ===============================
  `estado_civil` enum('SOLTERO','CASADO','DIVORCIADO','VIUDO','SEPARADO') NOT NULL COMMENT 'Estado civil actual',
  
  -- Datos del cónyuge actual (si está casado)
  `nombre_conyuge` varchar(200) NULL COMMENT 'Nombre del cónyuge actual',
  `fecha_nacimiento_conyuge` date NULL COMMENT 'Fecha de nacimiento del cónyuge',
  `ciudad_nacimiento_conyuge` varchar(200) NULL COMMENT 'Ciudad de nacimiento del cónyuge',
  `fecha_matrimonio` date NULL COMMENT 'Fecha de matrimonio',
  `domicilio_conyuge` text NULL COMMENT 'Domicilio del cónyuge si es distinto',
  
  -- Matrimonios anteriores (si es viudo o divorciado)
  `numero_matrimonios_anteriores` int(2) NULL COMMENT 'Número de matrimonios anteriores',
  `nombre_completo_ex_conyuge` varchar(200) NULL COMMENT 'Nombre completo del ex-cónyuge',
  `domicilio_ex_conyuge` text NULL COMMENT 'Domicilio del ex-cónyuge',
  `fecha_nacimiento_ex_conyuge` date NULL COMMENT 'Fecha de nacimiento del ex-cónyuge',
  `fecha_matrimonio_anterior` date NULL COMMENT 'Fecha de matrimonio anterior',
  `fecha_divorcio` date NULL COMMENT 'Fecha de divorcio o defunción',
  `terminos_divorcio` text NULL COMMENT 'Términos del divorcio o defunción del cónyuge',

  -- ===============================
  -- PASO 4: VIAJE
  -- ===============================
  `nombre_patrocinador` varchar(200) NOT NULL COMMENT 'Nombre de quien paga por el viaje',
  `parentesco_patrocinador` varchar(100) NOT NULL COMMENT 'Parentesco con el patrocinador',
  `telefono_patrocinador` varchar(20) NULL COMMENT 'Teléfono del patrocinador',
  `domicilio_patrocinador` text NULL COMMENT 'Domicilio del patrocinador si es diferente',
  `personas_viajan_con_usted` text NULL COMMENT 'Personas que viajan con usted - Con parentesco',
  
  -- Viaje a Estados Unidos
  `fecha_llegada_usa` date NULL COMMENT 'Fecha de llegada a Estados Unidos',
  `duracion_estancia` varchar(100) NULL COMMENT 'Duración de la estancia',
  `hotel_domicilio_completo` text NULL COMMENT 'Hotel domicilio completo con código postal',
  `telefono_hotel` varchar(20) NULL COMMENT 'Teléfono del hotel',
  `familiar_usa_nombre` varchar(200) NULL COMMENT 'En caso de ir con familiar - Nombre, parentesco y estatus',
  `familiar_usa_domicilio` text NULL COMMENT 'Domicilio completo del familiar en USA',
  `familiar_usa_telefono` varchar(20) NULL COMMENT 'Teléfono del familiar en USA',

  -- ===============================
  -- PASO 5: EDUCACIÓN Y TRABAJO
  -- ===============================
  -- Estudios (obligatorio para mayores de 7 años)
  `fecha_inicio_estudios` varchar(20) NULL COMMENT 'Fecha de inicio estudios DD/MM/AAAA',
  `fecha_termino_estudios` varchar(20) NULL COMMENT 'Fecha de término estudios DD/MM/AAAA',
  `nombre_escuela` varchar(200) NULL COMMENT 'Nombre de escuela',
  `grado_carrera_estudiada` varchar(200) NULL COMMENT 'Grado que cursa o carrera estudiada',
  `domicilio_escuela` text NULL COMMENT 'Domicilio completo de la escuela con CP',
  `telefono_escuela` varchar(20) NULL COMMENT 'Teléfono de la escuela',
  `ciudad_escuela` varchar(100) NULL COMMENT 'Ciudad donde está la escuela',
  
  -- Trabajo (últimos 5 años)
  `fecha_inicio_trabajo` varchar(20) NULL COMMENT 'Fecha de inicio trabajo AÑO-MES',
  `fecha_fin_trabajo` varchar(20) NULL COMMENT 'Fecha de fin trabajo AÑO-MES',
  `nombre_empresa` varchar(200) NULL COMMENT 'Nombre de la empresa',
  `nombre_patron` varchar(200) NULL COMMENT 'Nombre del patrón',
  `domicilio_empresa` text NULL COMMENT 'Domicilio de la empresa con CP',
  `telefono_empresa` varchar(20) NULL COMMENT 'Teléfono de la empresa',
  `puesto_desempenado` text NULL COMMENT 'Puesto desempeñado - descripción',
  `salario_mensual` decimal(10,2) NULL COMMENT 'Salario mensual aproximado',

  -- ===============================
  -- PASO 6: INFORMACIÓN FAMILIAR
  -- ===============================
  `apellido_nombre_padre` varchar(200) NULL COMMENT 'Apellido y nombre del padre',
  `fecha_nacimiento_padre` date NULL COMMENT 'Fecha de nacimiento del padre',
  `apellido_nombre_madre` varchar(200) NULL COMMENT 'Apellido y nombre de la madre',
  `fecha_nacimiento_madre` date NULL COMMENT 'Fecha de nacimiento de la madre',
  `parientes_inmediatos_usa` text NULL COMMENT 'Parientes inmediatos en USA: Nombre, Apellido, Estatus, Parentesco',

  -- ===============================
  -- PASO 7: HISTORIAL DE VIAJES
  -- ===============================
  -- Visa anterior
  `ciudad_expedicion_visa_anterior` varchar(100) NULL COMMENT 'Ciudad de expedición de visa anterior',
  `fecha_expedicion_visa_anterior` date NULL COMMENT 'Fecha de expedición de visa anterior',
  `fecha_vencimiento_visa_anterior` date NULL COMMENT 'Fecha de vencimiento de visa anterior',
  
  -- Últimas 3 entradas a USA
  `fecha_ultima_entrada_usa` date NULL COMMENT 'Día/Mes/Año de última entrada a USA',
  `duracion_ultima_estancia` varchar(100) NULL COMMENT 'Duración de la estancia',
  
  -- Preguntas de seguridad
  `ha_extraviado_visa` enum('SI','NO') NOT NULL COMMENT 'Ha extraviado su visa - Año - explicar',
  `explicacion_extravio_visa` text NULL COMMENT 'Explicación del extravío de visa',
  `le_han_negado_visa` enum('SI','NO') NOT NULL COMMENT 'Le han negado la visa - Año - explicar',
  `explicacion_negacion_visa` text NULL COMMENT 'Explicación de negación de visa',
  `ha_extraviado_pasaporte` enum('SI','NO') NOT NULL COMMENT 'Ha extraviado su pasaporte - Año',
  `paises_visitados_5anos` text NULL COMMENT 'Países visitados en los últimos 5 años',

  -- ===============================
  -- METADATOS DEL FORMULARIO
  -- ===============================
  `paso_actual` int(2) NOT NULL DEFAULT 1 COMMENT 'Paso actual del formulario (1-7)',
  `completado` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Si el formulario está completamente lleno',
  `fecha_inicio` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de inicio del llenado',
  `fecha_ultima_modificacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última modificación',
  `fecha_completado` timestamp NULL COMMENT 'Fecha de completado del formulario',
  `ip_address` varchar(45) NULL COMMENT 'Dirección IP del usuario',
  `user_agent` text NULL COMMENT 'User agent del navegador',
  
  -- Información del cliente (opcional)
  `cliente_nombre` varchar(200) NULL COMMENT 'Nombre del cliente si se registró',
  `cliente_email` varchar(200) NULL COMMENT 'Email del cliente si se registró',
  `cliente_telefono` varchar(20) NULL COMMENT 'Teléfono del cliente si se registró',

  -- ===============================
  -- ÍNDICES Y CONSTRAINTS
  -- ===============================
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid_UNIQUE` (`uuid`),
  KEY `idx_ciudad_cita` (`ciudad_cita`),
  KEY `idx_estado_civil` (`estado_civil`),
  KEY `idx_completado` (`completado`),
  KEY `idx_paso_actual` (`paso_actual`),
  KEY `idx_fecha_inicio` (`fecha_inicio`),
  KEY `idx_numero_pasaporte` (`numero_pasaporte`),
  KEY `idx_correo_electronico` (`correo_electronico`),
  
  -- Foreign Key a la tabla de ciudades consulares
  CONSTRAINT `fk_ciudad_cita` FOREIGN KEY (`ciudad_cita`) REFERENCES `ciudades_consulados` (`codigo`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla principal de datos del formulario DS-160';

-- ===================================================================================================
-- VISTA PARA REPORTES
-- ===================================================================================================
-- Vista que une los datos del formulario con información de la ciudad consular
CREATE VIEW `v_ds160_completo` AS
SELECT 
    f.*,
    c.nombre_completo AS ciudad_cita_nombre,
    c.estado AS ciudad_cita_estado,
    c.tipo_oficina AS ciudad_cita_tipo_oficina,
    c.direccion AS ciudad_cita_direccion,
    c.telefono AS ciudad_cita_telefono
FROM ds160_form_data f
LEFT JOIN ciudades_consulados c ON f.ciudad_cita = c.codigo;

-- ===================================================================================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- ===================================================================================================

-- Procedimiento para obtener estadísticas del formulario
DELIMITER //
CREATE PROCEDURE GetEstadisticasFormulario()
BEGIN
    SELECT 
        COUNT(*) as total_formularios,
        SUM(CASE WHEN completado = 1 THEN 1 ELSE 0 END) as formularios_completados,
        SUM(CASE WHEN completado = 0 THEN 1 ELSE 0 END) as formularios_en_proceso,
        AVG(paso_actual) as paso_promedio,
        ciudad_cita,
        COUNT(*) as formularios_por_ciudad
    FROM ds160_form_data 
    GROUP BY ciudad_cita WITH ROLLUP;
END //
DELIMITER ;

-- Procedimiento para limpiar formularios antiguos incompletos (más de 30 días)
DELIMITER //
CREATE PROCEDURE LimpiarFormulariosAntiguos()
BEGIN
    DELETE FROM ds160_form_data 
    WHERE completado = 0 
    AND fecha_inicio < DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    SELECT ROW_COUNT() as formularios_eliminados;
END //
DELIMITER ;

-- ===================================================================================================
-- TRIGGERS PARA AUDITORÍA
-- ===================================================================================================

-- Trigger para generar UUID automáticamente
DELIMITER //
CREATE TRIGGER ds160_before_insert 
BEFORE INSERT ON ds160_form_data
FOR EACH ROW
BEGIN
    IF NEW.uuid IS NULL OR NEW.uuid = '' THEN
        SET NEW.uuid = UUID();
    END IF;
END //
DELIMITER ;

-- Trigger para actualizar fecha de completado
DELIMITER //
CREATE TRIGGER ds160_before_update 
BEFORE UPDATE ON ds160_form_data
FOR EACH ROW
BEGIN
    IF NEW.completado = 1 AND OLD.completado = 0 THEN
        SET NEW.fecha_completado = NOW();
    END IF;
END //
DELIMITER ;

-- ===================================================================================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ===================================================================================================
ALTER TABLE ds160_form_data ADD INDEX idx_cliente_info (cliente_nombre, cliente_email);
ALTER TABLE ds160_form_data ADD INDEX idx_fechas (fecha_nacimiento, fecha_expedicion, fecha_vencimiento);
ALTER TABLE ds160_form_data ADD INDEX idx_busqueda_texto (nombre_completo, numero_pasaporte, correo_electronico);

-- ===================================================================================================
-- COMENTARIOS FINALES
-- ===================================================================================================
/*
NOTAS DE IMPLEMENTACIÓN:

1. Esta estructura sigue exactamente la especificación de los 7 pasos del formulario DS-160
2. Todos los campos obligatorios están marcados como NOT NULL
3. Los campos opcionales están marcados como NULL
4. Se incluyen índices para mejorar el performance de consultas
5. Se incluyen triggers para automatizar tareas comunes
6. Se incluye una vista para reportes completos
7. Se incluyen procedimientos almacenados para estadísticas y limpieza

CAMPOS PRINCIPALES POR PASO:
- Paso 1: Información personal básica e idiomas
- Paso 2: Ciudad de cita, pasaporte, domicilio, contacto y redes sociales  
- Paso 3: Estado civil y datos del cónyuge
- Paso 4: Patrocinador, acompañantes y detalles del viaje
- Paso 5: Educación y trabajo
- Paso 6: Información familiar y parientes en USA
- Paso 7: Historial de viajes y visas anteriores

SEGURIDAD:
- UUID único para cada formulario
- Campos de auditoría (fechas, IP, user agent)
- Triggers automáticos para integridad de datos
*/