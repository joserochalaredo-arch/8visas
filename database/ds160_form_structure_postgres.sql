-- =====================================================================================
-- SCRIPT SQL (PostgreSQL) - FORMULARIO DS-160 A8VISAS
-- =====================================================================================
-- Fecha: Octubre 2025
-- Sistema: A8Visas - Formulario DS-160
-- Nota: Este script es compatible con PostgreSQL. El script original (con backticks,
--       ENUM MySQL, ENGINE, DELIMITER, etc.) es para MySQL/MariaDB.
--       Si estás usando Postgres y viste el error 42601 near "`", usa este archivo.
-- =====================================================================================

-- Recomendado: habilitar extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Eliminar objetos en orden (usamos CASCADE cuando aplica para simplificar dependencias)
DROP VIEW IF EXISTS v_ds160_completo;
DROP FUNCTION IF EXISTS fn_set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS fn_set_fecha_completado() CASCADE;
DROP FUNCTION IF EXISTS limpiar_formularios_antiguos() CASCADE;
DROP VIEW IF EXISTS v_estadisticas_formulario;
DROP TABLE IF EXISTS ds160_form_data CASCADE;
DROP TABLE IF EXISTS ciudades_consulados CASCADE;

-- =====================================================================================
-- TIPOS ENUM/CONSTRAINTS (equivalentes a ENUM de MySQL)
-- =====================================================================================
-- En Postgres, preferimos CHECK o tipos definidos por el usuario. Aquí combinamos ambos enfoques.

-- Tipo para tipo de oficina
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_oficina_enum') THEN
    CREATE TYPE tipo_oficina_enum AS ENUM ('CONSULADO','EMBAJADA','CAS');
  END IF;
END $$;

-- Tipo genérico SI/NO
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'si_no_enum') THEN
    CREATE TYPE si_no_enum AS ENUM ('SI','NO');
  END IF;
END $$;

-- Tipo para estado civil
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_civil_enum') THEN
    CREATE TYPE estado_civil_enum AS ENUM ('SOLTERO','CASADO','DIVORCIADO','VIUDO','SEPARADO');
  END IF;
END $$;

-- NOTA: Para ciudad_cita usaremos VARCHAR con CHECK y FK, para poder referenciar ciudades_consulados.codigo

-- =====================================================================================
-- TABLA: ciudades_consulados
-- =====================================================================================
CREATE TABLE ciudades_consulados (
  id                 SERIAL PRIMARY KEY,
  codigo             VARCHAR(10) NOT NULL UNIQUE,
  nombre_completo    VARCHAR(100) NOT NULL,
  estado             VARCHAR(50) NOT NULL,
  pais               VARCHAR(50) NOT NULL DEFAULT 'México',
  tipo_oficina       tipo_oficina_enum NOT NULL,
  direccion          TEXT,
  telefono           VARCHAR(20),
  activo             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consulados_activo ON ciudades_consulados (activo);
CREATE INDEX idx_consulados_tipo_oficina ON ciudades_consulados (tipo_oficina);

-- Trigger para updated_at en ciudades_consulados
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_consulados_updated
BEFORE UPDATE ON ciudades_consulados
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Datos de ciudades/consulados (idéntico a la versión MySQL)
INSERT INTO ciudades_consulados (codigo, nombre_completo, estado, tipo_oficina, direccion, telefono) VALUES
('GDL', 'Guadalajara', 'Jalisco', 'CONSULADO', 'Av. López Cotilla 1951, Col. Americana, 44160 Guadalajara, Jal.', '+52 33 3268-2100'),
('MTY', 'Monterrey', 'Nuevo León', 'CONSULADO', 'Av. Constitución 411 Pte., Centro, 64000 Monterrey, N.L.', '+52 81 8047-3100'),
('MEX', 'Ciudad de México', 'Ciudad de México', 'EMBAJADA', 'Paseo de la Reforma 305, Cuauhtémoc, 06500 Ciudad de México, CDMX', '+52 55 5080-2000'),
('TIJ', 'Tijuana', 'Baja California', 'CONSULADO', 'Paseo de las Culturas s/n, Mesa de Otay, 22427 Tijuana, B.C.', '+52 664 977-2000'),
('JUA', 'Ciudad Juárez', 'Chihuahua', 'CONSULADO', 'Paseo de la Victoria 3650, Partido Senecú, 32543 Cd Juárez, Chih.', '+52 656 227-3000'),
('NOG', 'Nogales', 'Sonora', 'CONSULADO', 'Calle San José s/n, Fracc. Los Alamos, 84065 Nogales, Son.', '+52 631 311-8150'),
('NLD', 'Nuevo Laredo', 'Tamaulipas', 'CONSULADO', 'Allende 3330, Col. Jardín, 88260 Nuevo Laredo, Tamps.', '+52 867 714-0512'),
('MAT', 'Matamoros', 'Tamaulipas', 'CONSULADO', 'Calle Primera 2002, 87330 Matamoros, Tamps.', '+52 868 812-4402'),
('HER', 'Hermosillo', 'Sonora', 'CONSULADO', 'Blvd. Luis Encinas Johnson 450, San Benito, 83190 Hermosillo, Son.', '+52 662 289-3500'),
('MER', 'Mérida', 'Yucatán', 'CONSULADO', 'Calle 60 No. 338-K x 29 y 31, Centro, 97000 Mérida, Yuc.', '+52 999 942-5700'),
('OTRO', 'Otra Ciudad', 'Otro Estado', 'CONSULADO', 'Por especificar', NULL);

-- =====================================================================================
-- TABLA PRINCIPAL: ds160_form_data
-- =====================================================================================
CREATE TABLE ds160_form_data (
  id                              SERIAL PRIMARY KEY,
  uuid                            UUID NOT NULL DEFAULT uuid_generate_v4(),

  -- PASO 1: INFORMACIÓN PERSONAL
  nombre_completo                 VARCHAR(200) NOT NULL,
  fecha_nacimiento                DATE NOT NULL,
  ciudad_nacimiento               VARCHAR(100) NOT NULL,
  estado_nacimiento               VARCHAR(100) NOT NULL,
  pais_nacimiento                 VARCHAR(100) NOT NULL,
  otra_nacionalidad               si_no_enum NOT NULL,
  especificar_nacionalidad        VARCHAR(100),
  idiomas                         TEXT NOT NULL,

  -- PASO 2: PASAPORTE Y CONTACTO
  ciudad_cita                     VARCHAR(10) NOT NULL,
  numero_pasaporte                VARCHAR(50) NOT NULL,
  fecha_expedicion                DATE NOT NULL,
  fecha_vencimiento               DATE NOT NULL,
  ciudad_expedicion               VARCHAR(100) NOT NULL,
  domicilio                       TEXT NOT NULL,
  telefono_casa                   VARCHAR(20),
  celular                         VARCHAR(20) NOT NULL,
  correo_electronico              VARCHAR(200) NOT NULL,
  otros_numeros_5anos             si_no_enum NOT NULL,
  lista_numeros_anteriores        TEXT,
  correos_adicionales_5anos       TEXT,
  redes_sociales                  TEXT NOT NULL,
  plataformas_adicionales_5anos   si_no_enum NOT NULL,
  lista_plataformas_adicionales   TEXT,

  -- PASO 3: ESTADO CIVIL
  estado_civil                    estado_civil_enum NOT NULL,
  nombre_conyuge                  VARCHAR(200),
  fecha_nacimiento_conyuge        DATE,
  ciudad_nacimiento_conyuge       VARCHAR(200),
  fecha_matrimonio                DATE,
  domicilio_conyuge               TEXT,

  numero_matrimonios_anteriores   SMALLINT,
  nombre_completo_ex_conyuge      VARCHAR(200),
  domicilio_ex_conyuge            TEXT,
  fecha_nacimiento_ex_conyuge     DATE,
  fecha_matrimonio_anterior       DATE,
  fecha_divorcio                  DATE,
  terminos_divorcio               TEXT,

  -- PASO 4: VIAJE
  nombre_patrocinador             VARCHAR(200) NOT NULL,
  parentesco_patrocinador         VARCHAR(100) NOT NULL,
  telefono_patrocinador           VARCHAR(20),
  domicilio_patrocinador          TEXT,
  personas_viajan_con_usted       TEXT,

  fecha_llegada_usa               DATE,
  duracion_estancia               VARCHAR(100),
  hotel_domicilio_completo        TEXT,
  telefono_hotel                  VARCHAR(20),
  familiar_usa_nombre             VARCHAR(200),
  familiar_usa_domicilio          TEXT,
  familiar_usa_telefono           VARCHAR(20),

  -- PASO 5: EDUCACIÓN Y TRABAJO
  fecha_inicio_estudios           VARCHAR(20),
  fecha_termino_estudios          VARCHAR(20),
  nombre_escuela                  VARCHAR(200),
  grado_carrera_estudiada         VARCHAR(200),
  domicilio_escuela               TEXT,
  telefono_escuela                VARCHAR(20),
  ciudad_escuela                  VARCHAR(100),

  fecha_inicio_trabajo            VARCHAR(20),
  fecha_fin_trabajo               VARCHAR(20),
  nombre_empresa                  VARCHAR(200),
  nombre_patron                   VARCHAR(200),
  domicilio_empresa               TEXT,
  telefono_empresa                VARCHAR(20),
  puesto_desempenado              TEXT,
  salario_mensual                 NUMERIC(10,2),

  -- PASO 6: INFORMACIÓN FAMILIAR
  apellido_nombre_padre           VARCHAR(200),
  fecha_nacimiento_padre          DATE,
  apellido_nombre_madre           VARCHAR(200),
  fecha_nacimiento_madre          DATE,
  parientes_inmediatos_usa        TEXT,

  -- PASO 7: HISTORIAL DE VIAJES
  ciudad_expedicion_visa_anterior VARCHAR(100),
  fecha_expedicion_visa_anterior  DATE,
  fecha_vencimiento_visa_anterior DATE,

  fecha_ultima_entrada_usa        DATE,
  duracion_ultima_estancia        VARCHAR(100),

  ha_extraviado_visa              si_no_enum NOT NULL,
  explicacion_extravio_visa       TEXT,
  le_han_negado_visa              si_no_enum NOT NULL,
  explicacion_negacion_visa       TEXT,
  ha_extraviado_pasaporte         si_no_enum NOT NULL,
  paises_visitados_5anos          TEXT,

  -- METADATOS DEL FORMULARIO
  paso_actual                     SMALLINT NOT NULL DEFAULT 1,
  completado                      BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_inicio                    TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_ultima_modificacion       TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_completado                TIMESTAMP,
  ip_address                      VARCHAR(45),
  user_agent                      TEXT,

  cliente_nombre                  VARCHAR(200),
  cliente_email                   VARCHAR(200),
  cliente_telefono                VARCHAR(20),

  CONSTRAINT chk_ciudad_cita_valida CHECK (ciudad_cita IN ('GDL','MTY','MEX','OTRO')),
  CONSTRAINT fk_ciudad_cita FOREIGN KEY (ciudad_cita) REFERENCES ciudades_consulados (codigo) ON UPDATE CASCADE
);

-- Índices
CREATE INDEX idx_ciudad_cita ON ds160_form_data (ciudad_cita);
CREATE INDEX idx_estado_civil ON ds160_form_data (estado_civil);
CREATE INDEX idx_completado ON ds160_form_data (completado);
CREATE INDEX idx_paso_actual ON ds160_form_data (paso_actual);
CREATE INDEX idx_fecha_inicio ON ds160_form_data (fecha_inicio);
CREATE INDEX idx_numero_pasaporte ON ds160_form_data (numero_pasaporte);
CREATE INDEX idx_correo_electronico ON ds160_form_data (correo_electronico);
CREATE INDEX idx_cliente_info ON ds160_form_data (cliente_nombre, cliente_email);
CREATE INDEX idx_fechas ON ds160_form_data (fecha_nacimiento, fecha_expedicion, fecha_vencimiento);
CREATE INDEX idx_busqueda_texto ON ds160_form_data (nombre_completo, numero_pasaporte, correo_electronico);

-- Trigger para actualizar fecha_ultima_modificacion y fecha_completado
CREATE OR REPLACE FUNCTION fn_set_fecha_completado()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_ultima_modificacion := NOW();
  IF NEW.completado = TRUE AND (OLD.completado IS DISTINCT FROM TRUE) THEN
    NEW.fecha_completado := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ds160_update
BEFORE UPDATE ON ds160_form_data
FOR EACH ROW EXECUTE FUNCTION fn_set_fecha_completado();

-- =====================================================================================
-- VISTAS Y REPORTES
-- =====================================================================================
CREATE OR REPLACE VIEW v_ds160_completo AS
SELECT 
  f.*,
  c.nombre_completo AS ciudad_cita_nombre,
  c.estado          AS ciudad_cita_estado,
  c.tipo_oficina    AS ciudad_cita_tipo_oficina,
  c.direccion       AS ciudad_cita_direccion,
  c.telefono        AS ciudad_cita_telefono
FROM ds160_form_data f
LEFT JOIN ciudades_consulados c ON f.ciudad_cita = c.codigo;

-- Vista de estadísticas (equivalente al procedimiento MySQL)
CREATE OR REPLACE VIEW v_estadisticas_formulario AS
SELECT 
  COUNT(*) AS total_formularios,
  SUM(CASE WHEN completado = TRUE THEN 1 ELSE 0 END) AS formularios_completados,
  SUM(CASE WHEN completado = FALSE THEN 1 ELSE 0 END) AS formularios_en_proceso,
  AVG(paso_actual)::numeric(10,2) AS paso_promedio,
  ciudad_cita,
  COUNT(*) AS formularios_por_ciudad
FROM ds160_form_data
GROUP BY ROLLUP (ciudad_cita);

-- =====================================================================================
-- FUNCIONES AUXILIARES (equivalentes a procedimientos MySQL)
-- =====================================================================================
-- Limpia formularios incompletos con más de 30 días y retorna la cantidad eliminada
CREATE OR REPLACE FUNCTION limpiar_formularios_antiguos()
RETURNS INTEGER AS $$
DECLARE
  v_eliminados INTEGER;
BEGIN
  DELETE FROM ds160_form_data 
  WHERE completado = FALSE
    AND fecha_inicio < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS v_eliminados = ROW_COUNT;
  RETURN v_eliminados;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================================
-- NOTAS
-- =====================================================================================
-- 1) Si usas MySQL, utiliza el archivo original ds160_form_structure.sql
-- 2) Si usas PostgreSQL, utiliza este archivo (ds160_form_structure_postgres.sql)
-- 3) Este script utiliza UUID nativo de Postgres (uuid-ossp) y triggers para campos updated_at
-- 4) Las "ENUM" de MySQL fueron convertidas a tipos ENUM o CHECK en Postgres
