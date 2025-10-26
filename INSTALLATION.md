# 📋 GUÍA DE INSTALACIÓN COMPLETA - A8VISAS DS-160 SYSTEM

## 🚀 CONFIGURACIÓN SUPABASE Y BASE DE DATOS

### ✅ **PASO 1: Crear Proyecto en Supabase**

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta
2. Haz clic en **"New Project"**
3. Selecciona tu organización
4. Configuración del proyecto:
   - **Name**: `a8visas-ds160-system` 
   - **Database Password**: Genera una contraseña segura y **guárdala**
   - **Region**: Selecciona la más cercana (US East, US West, EU West, etc.)
   - **Pricing Plan**: Free (para desarrollo) o Pro (para producción)
5. Haz clic en **"Create new project"**
6. **Espera 2-3 minutos** mientras se crea el proyecto

### ✅ **PASO 2: Obtener Credenciales de API**

1. Una vez creado el proyecto, ve a **Settings** → **API**
2. Copia y guarda estos valores:
   ```
   Project URL: https://xxxxxxxxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   ⚠️ **IMPORTANTE**: Mantén la `service_role key` **privada** y **segura**

### ✅ **PASO 3: Ejecutar Script SQL**

1. En tu proyecto Supabase, ve a **SQL Editor** (en el menú lateral)
2. Haz clic en **"New query"**
3. Copia **TODO** el contenido del archivo `database/supabase-schema.sql`
4. Pega el código en el editor SQL
5. Haz clic en **"Run"** (botón verde)
6. ✅ Deberías ver el mensaje: **"Success. No rows returned"**

### ✅ **PASO 4: Verificar Instalación**

1. Ve a **Table Editor** (en el menú lateral)
2. Verifica que se crearon estas tablas:
   - ✅ `clients`
   - ✅ `forms` 
   - ✅ `form_comments`
   - ✅ `payments`
   - ✅ `form_history`
   - ✅ `pdf_documents`

### ✅ **PASO 5: Configurar Storage para PDFs**

1. Ve a **Storage** (en el menú lateral)
2. Haz clic en **"Create a new bucket"**
3. Configuración del bucket:
   - **Name**: `documents`
   - **Public bucket**: ❌ **NO marcar** (mantener privado)
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: `application/pdf,image/jpeg,image/png`
4. Haz clic en **"Create bucket"**

### ✅ **PASO 6: Configurar Políticas de Storage**

1. Ve al bucket **"documents"** que acabas de crear
2. Haz clic en **"Settings"** → **"Policies"**
3. Crea estas políticas (o ejecuta en SQL Editor):

```sql
-- Política para subir documentos
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'documents');

-- Política para ver documentos  
CREATE POLICY "Authenticated users can view documents" ON storage.objects
FOR SELECT USING (auth.role() = 'authenticated' AND bucket_id = 'documents');

-- Política para actualizar documentos
CREATE POLICY "Authenticated users can update documents" ON storage.objects
FOR UPDATE USING (auth.role() = 'authenticated' AND bucket_id = 'documents');

-- Política para eliminar documentos
CREATE POLICY "Authenticated users can delete documents" ON storage.objects
FOR DELETE USING (auth.role() = 'authenticated' AND bucket_id = 'documents');
```

---

## ⚙️ CONFIGURACIÓN DEL PROYECTO NEXT.JS

### ✅ **PASO 1: Instalar Dependencias**

Ejecuta en tu terminal:

```bash
cd /Users/ivanacuna/Documents/DESARROLLO\ DE\ PROYECTOS\ VSC/PROYECTO\ ALMA/VISAFORM

# Instalar dependencias de Supabase
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-nextjs

# Dependencias adicionales (opcionales)
npm install next-auth          # Para autenticación avanzada
npm install puppeteer          # Para generación de PDFs
npm install nodemailer         # Para envío de emails
```

### ✅ **PASO 2: Configurar Variables de Entorno**

El archivo `.env.local` ya está creado. Completa estos valores:

```bash
# 🔧 EDITAR: Reemplaza con tus valores de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# 🔧 EDITAR: Genera un secret seguro
NEXTAUTH_SECRET=tu_secret_super_seguro_de_32_caracteres_minimo

# 🔧 EDITAR: Define credenciales admin
ADMIN_PASSWORD=tu_password_admin_super_seguro

# ✅ Estas ya están configuradas correctamente
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_NAME=A8Visas DS-160 System
# ... resto de variables
```

### ✅ **PASO 3: Generar NEXTAUTH_SECRET**

Ejecuta uno de estos comandos:

```bash
# Opción 1: Con OpenSSL
openssl rand -base64 32

# Opción 2: Con Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Opción 3: Online
# Ve a: https://generate-secret.vercel.app/32
```

### ✅ **PASO 4: Verificar Configuración**

Ejecuta estos comandos para verificar:

```bash
# Compilar el proyecto
npm run build

# Si hay errores, ejecutar:
npm run dev

# Verificar que no hay errores en consola
```

---

## 🧪 PRUEBAS Y VERIFICACIÓN

### ✅ **PASO 1: Test de Conexión Básica**

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Abre: [http://localhost:3000](http://localhost:3000)
3. Ve al dashboard admin: [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)

### ✅ **PASO 2: Test de Funcionalidades**

1. **Crear Cliente**: 
   - Completa el formulario de "Comenzar Trámite"
   - Verifica que se cree en la base de datos

2. **Navegación del Formulario**:
   - Ve a Step 1: [http://localhost:3000/form/step-1](http://localhost:3000/form/step-1)
   - Completa los campos con ciudades mexicanas
   - Navega hasta Step 7 y página final

3. **Sistema de Paginación**:
   - Crea varios clientes de prueba
   - Verifica que la paginación funcione correctamente

### ✅ **PASO 3: Test de Base de Datos**

Ejecuta estas consultas en **SQL Editor** de Supabase para verificar:

```sql
-- Verificar que las tablas tienen datos
SELECT COUNT(*) FROM clients;
SELECT COUNT(*) FROM forms;

-- Ver clientes creados
SELECT token, client_name, client_email, created_at FROM clients ORDER BY created_at DESC LIMIT 5;

-- Verificar vista del dashboard
SELECT * FROM client_dashboard LIMIT 3;

-- Ver estadísticas
SELECT * FROM dashboard_stats;
```

---

## 🛠️ ARCHIVOS IMPORTANTES CREADOS

### 📁 **Estructura de Archivos**

```
VISAFORM/
├── .env.local                     ✅ Variables de entorno
├── database/
│   └── supabase-schema.sql        ✅ Script SQL completo
├── lib/
│   ├── supabase.ts               ✅ Cliente Supabase
│   └── database.ts               ✅ Funciones de BD
├── types/
│   └── database.ts               ✅ Tipos TypeScript
└── INSTALLATION.md               ✅ Esta guía
```

### 🔧 **Variables de Entorno Clave**

| Variable | Descripción | ¿Dónde obtener? |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto | Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública | Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada | Settings → API |
| `NEXTAUTH_SECRET` | Secret para auth | Generar con OpenSSL |
| `ADMIN_PASSWORD` | Password admin | Definir manualmente |

---

## 🚨 TROUBLESHOOTING

### ❌ **Error: "Invalid API key"**
- ✅ Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` sea correcta
- ✅ Verifica que el proyecto Supabase esté activo
- ✅ Reinicia el servidor: `npm run dev`

### ❌ **Error: "Cannot connect to database"**
- ✅ Verifica `NEXT_PUBLIC_SUPABASE_URL`
- ✅ Asegúrate de ejecutar el script SQL completo
- ✅ Verifica que las tablas existan en Table Editor

### ❌ **Error: "Authentication failed"**
- ✅ Verifica `NEXTAUTH_SECRET` (mínimo 32 caracteres)
- ✅ Verifica `ADMIN_PASSWORD`
- ✅ Limpia cookies del navegador

### ❌ **Error: "Storage bucket not found"**
- ✅ Crea el bucket "documents" en Supabase Storage
- ✅ Configura las políticas de acceso
- ✅ Verifica `NEXT_PUBLIC_STORAGE_BUCKET=documents`

### ❌ **Error de compilación TypeScript**
- ✅ Ejecuta: `npm install`
- ✅ Verifica que existan los archivos en `/types/` y `/lib/`
- ✅ Ejecuta: `npm run build` para ver errores específicos

---

## 📞 **COMANDOS ÚTILES**

```bash
# Reinstalar dependencias
rm -rf node_modules && npm install

# Limpiar caché de Next.js
rm -rf .next && npm run dev

# Ver logs de errores
npm run dev > debug.log 2>&1

# Generar tipos de Supabase (opcional)
npx supabase gen types typescript --project-id "TU_PROJECT_ID" --schema public > types/supabase-generated.ts

# Verificar variables de entorno
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

---

## ✅ **CHECKLIST FINAL**

- [ ] ✅ Proyecto Supabase creado y activo
- [ ] ✅ Script SQL ejecutado sin errores
- [ ] ✅ 6 tablas creadas en base de datos
- [ ] ✅ Bucket "documents" creado en Storage
- [ ] ✅ Políticas de Storage configuradas
- [ ] ✅ Variables de entorno completadas en `.env.local`
- [ ] ✅ `NEXTAUTH_SECRET` generado (32+ caracteres)
- [ ] ✅ Dependencias npm instaladas
- [ ] ✅ Proyecto compila sin errores (`npm run build`)
- [ ] ✅ Dashboard admin accesible en `/admin/dashboard`
- [ ] ✅ Formulario funciona desde Step 1 hasta página final
- [ ] ✅ Paginación de clientes funcionando
- [ ] ✅ Ciudades mexicanas configuradas correctamente

---

## 🎉 **¡INSTALACIÓN COMPLETA!**

Una vez completados todos los pasos anteriores, tu sistema A8Visas DS-160 estará completamente funcional con:

- ✅ **Base de datos Supabase** configurada y funcionando
- ✅ **Sistema de autenticación** para administradores
- ✅ **Gestión completa de clientes** y formularios DS-160
- ✅ **Paginación** y filtros en el dashboard
- ✅ **Ciudades consulares mexicanas** configuradas
- ✅ **Sistema de comentarios** y seguimiento
- ✅ **Almacenamiento de documentos PDF**
- ✅ **Historial de cambios** automático
- ✅ **Estadísticas y reportes** del dashboard

¡Tu sistema está listo para procesar trámites de visa estadounidense! 🇺🇸🇲🇽