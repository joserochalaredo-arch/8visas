# 🏆 A8VISAS DS-160 SYSTEM - CONFIGURACIÓN SUPABASE

## 🚀 CONFIGURACIÓN RÁPIDA (5 minutos)

### 1️⃣ **EJECUTAR SCRIPT DE INSTALACIÓN**
```bash
./install-dependencies.sh
```

### 2️⃣ **CREAR PROYECTO SUPABASE**
1. Ve a [https://supabase.com](https://supabase.com) → **New Project**
2. Nombre: `a8visas-ds160-system`
3. Guarda la **Database Password**
4. **Espera 2-3 minutos** hasta que esté listo

### 3️⃣ **EJECUTAR SQL**
1. En Supabase → **SQL Editor** → **New query**
2. Copia **TODO** el archivo `database/supabase-schema.sql`
3. **Run** (botón verde) → Debe mostrar "Success"

### 4️⃣ **CREAR BUCKET STORAGE**
1. Supabase → **Storage** → **Create bucket**
2. Nombre: `documents` (NO público)
3. Size limit: `10 MB`

### 5️⃣ **OBTENER CREDENCIALES**
1. Supabase → **Settings** → **API**
2. Copiar:
   - **Project URL**: `https://xxxxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIs...`
   - **service_role**: `eyJhbGciOiJIUzI1NiIs...`

### 6️⃣ **COMPLETAR .ENV.LOCAL**
```bash
# Reemplaza estos valores con los tuyos:
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Generar secret (ejecuta): openssl rand -base64 32
NEXTAUTH_SECRET=tu_secret_de_32_caracteres_aqui

# Define password admin
ADMIN_PASSWORD=tu_password_seguro_aqui
```

### 7️⃣ **INICIAR SERVIDOR**
```bash
npm run dev
```

### 8️⃣ **PROBAR SISTEMA**
- Abrir: [http://localhost:3000](http://localhost:3000)
- Dashboard: [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)

---

## 📁 **ARCHIVOS CLAVE**

| Archivo | Descripción |
|---------|-------------|
| `database/supabase-schema.sql` | 📊 Script SQL completo |
| `.env.local` | 🔐 Variables de entorno |
| `lib/supabase.ts` | 🔌 Cliente Supabase |
| `types/database.ts` | 📝 Tipos TypeScript |
| `INSTALLATION.md` | 📖 Guía completa |
| `install-dependencies.sh` | 🚀 Script instalación |

---

## ⚡ **COMANDOS ÚTILES**

```bash
# Instalar dependencias
./install-dependencies.sh

# Generar secret
openssl rand -base64 32

# Limpiar e instalar
rm -rf node_modules .next && npm install

# Iniciar desarrollo
npm run dev

# Compilar proyecto
npm run build

# Ver logs detallados
npm run dev 2>&1 | tee debug.log
```

---

## 🔧 **VARIABLES DE ENTORNO CRÍTICAS**

| Variable | ¿Dónde obtener? | Ejemplo |
|----------|-----------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → API | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API | `eyJhbGci...` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | `abc123xyz...` |
| `ADMIN_PASSWORD` | Define manualmente | `MiPassword123!` |

---

## ❌ **PROBLEMAS COMUNES**

| Error | Solución |
|-------|----------|
| **"Invalid API key"** | ✅ Verifica `SUPABASE_ANON_KEY` |
| **"Cannot connect to database"** | ✅ Ejecuta el script SQL completo |
| **"Bucket not found"** | ✅ Crea bucket `documents` |
| **"Authentication failed"** | ✅ Verifica `NEXTAUTH_SECRET` y `ADMIN_PASSWORD` |

---

## ✅ **CHECKLIST RÁPIDO**

- [ ] ✅ Script `./install-dependencies.sh` ejecutado
- [ ] ✅ Proyecto Supabase creado
- [ ] ✅ Script SQL ejecutado (6 tablas creadas)
- [ ] ✅ Bucket `documents` creado
- [ ] ✅ Credenciales copiadas a `.env.local`
- [ ] ✅ `NEXTAUTH_SECRET` generado
- [ ] ✅ `npm run dev` funciona
- [ ] ✅ Dashboard accesible

---

## 🎯 **FUNCIONALIDADES INCLUIDAS**

✅ **Dashboard Admin** con paginación  
✅ **Sistema de clientes** y tokens  
✅ **Formulario DS-160** completo (7 pasos)  
✅ **Ciudades consulares mexicanas**  
✅ **Sistema de comentarios**  
✅ **Gestión de pagos**  
✅ **Generación de PDFs**  
✅ **Historial de cambios**  
✅ **Estadísticas en tiempo real**  

---

## 📞 **SOPORTE**

📖 **Guía completa**: `INSTALLATION.md`  
🔗 **Documentación Supabase**: [supabase.com/docs](https://supabase.com/docs)  
🐛 **Reportar problemas**: Crear issue en el repositorio  

---

**¡Tu sistema A8Visas está listo en 5 minutos!** 🚀🇲🇽🇺🇸