# Scripts de Base de Datos DS-160

## 📋 **Archivos Disponibles**

### **1. MySQL (`ds160_schema.sql`)**
- ✅ **Uso**: Para bases de datos MySQL 5.7+ o MariaDB
- ✅ **Características**: 
  - Tipos ENUM nativos
  - AUTO_INCREMENT
  - Procedimientos almacenados con DELIMITER
  - Funciones JSON nativas

### **2. PostgreSQL (`ds160_schema_postgresql.sql`)**
- ✅ **Uso**: Para PostgreSQL 12+ 
- ✅ **Características**:
  - Tipos ENUM personalizados
  - SERIAL para auto-incremento
  - Funciones plpgsql
  - JSONB para mejor rendimiento
  - Triggers automáticos para updated_at

## 🎯 **¿Cuál Usar?**

### **Para Supabase (PostgreSQL)**
```sql
-- Usar este archivo:
database/ds160_schema_postgresql.sql
```

### **Para MySQL/MariaDB local o en la nube**
```sql
-- Usar este archivo:
database/ds160_schema.sql
```

## 📊 **Campos Agregados en Ambos Scripts**

### **Nueva Sección: Preguntas de Seguridad**
1. `enfermedades_contagiosas_final` + `detalles_enfermedades_contagiosas`
2. `trastorno_mental_fisico` + `detalles_trastorno_mental_fisico`
3. `abuso_adiccion_drogas` + `detalles_abuso_adiccion_drogas`
4. `historial_criminal` + `detalles_historial_criminal`
5. `sustancias_controladas` + `detalles_sustancias_controladas`
6. `prostitucion_trafico` + `detalles_prostitucion_trafico`
7. `inmigracion_irregular` + `detalles_inmigracion_irregular`

## 🚀 **Implementación**

### **Paso 1: Ejecutar el Script**
```bash
# Para PostgreSQL/Supabase
psql -h [host] -U [usuario] -d [database] -f database/ds160_schema_postgresql.sql

# Para MySQL
mysql -h [host] -u [usuario] -p [database] < database/ds160_schema.sql
```

### **Paso 2: Verificar las Tablas**
```sql
-- Ver tablas creadas
SHOW TABLES; -- MySQL
\dt -- PostgreSQL

-- Ver estructura
DESCRIBE ds160_forms; -- MySQL
\d ds160_forms -- PostgreSQL
```

## 🔧 **Diferencias Principales**

| Característica | MySQL | PostgreSQL |
|----------------|-------|------------|
| **Auto-incremento** | `AUTO_INCREMENT` | `SERIAL` |
| **JSON** | `JSON` | `JSONB` (mejor rendimiento) |
| **ENUM** | `ENUM('SI','NO')` | Tipos personalizados `yes_no` |
| **IP Address** | `VARCHAR(45)` | `INET` (tipo nativo) |
| **Funciones** | Procedimientos con `DELIMITER` | Funciones `plpgsql` |
| **Triggers** | Manual con `ON UPDATE` | Automático con funciones |

## ⚠️ **Importante**

- ✅ **Ambos scripts son compatibles** con el formulario DS-160
- ✅ **Mismos campos y estructura** en ambas versiones
- ✅ **API funciona igual** independientemente de la base de datos
- ✅ **Todos los nuevos campos** de seguridad incluidos

## 📝 **Recomendación**

**Para tu proyecto A8Visas**, recomiendo usar **PostgreSQL (Supabase)** porque:
- ✅ Mejor rendimiento con JSONB
- ✅ Más funcionalidades avanzadas
- ✅ Mejor soporte para aplicaciones web modernas
- ✅ Hosting gratuito con Supabase