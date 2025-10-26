# 🏢 Sistema de Gestión DS-160 con Panel de Administración

Sistema web profesional que permite a administradores generar tokens únicos para clientes y monitorear en tiempo real el progreso del llenado del formulario DS-160 de visa americana.

## 🎯 Concepto del Sistema

**Administrador** ➜ Genera tokens ➜ **Cliente** ➜ Completa formulario ➜ **Administrador** ➜ Monitorea progreso

### Flujo de Trabajo
1. **Admin**: Accede al panel y genera un token para el cliente
2. **Cliente**: Recibe el token y accede al formulario DS-160
3. **Sistema**: Registra cada paso y actualiza el progreso en tiempo real
4. **Admin**: Monitorea avance, revisa datos y gestiona clientes

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar servidor de desarrollo  
npm run dev

# 3. Abrir en navegador
http://localhost:3004
```

## 🔐 Accesos del Sistema

### Panel de Administración
- **URL**: `http://localhost:3004/admin`
- **Contraseña**: `admin123`
- **Función**: Generar tokens y monitorear clientes

### Acceso de Cliente
- **URL**: `http://localhost:3004` 
- **Token**: Generado por el administrador (8 caracteres)
- **Función**: Completar formulario DS-160

## 📊 Características del Panel de Admin

### 🎫 Gestión de Tokens
- **Generar Tokens Únicos**: 8 caracteres alfanuméricos (ej: ABC12345)
- **Datos del Cliente**: Nombre, email, teléfono al crear token
- **Estados**: Activar/Desactivar tokens según necesidad
- **Eliminación**: Remover clientes completamente del sistema

### 📈 Monitoreo en Tiempo Real
- **Progreso Visual**: Barra de progreso de 0% a 100%
- **Pasos Completados**: Indicador visual de qué pasos ha completado
- **Última Actividad**: Timestamp de cuando el cliente estuvo activo
- **Estado del Token**: Activo/Inactivo

### 👥 Dashboard de Clientes
```
┌─────────────────┬──────────┬──────────┬─────────────────┬─────────┐
│ Cliente         │ Token    │ Progreso │ Última Actividad│ Estado  │
├─────────────────┼──────────┼──────────┼─────────────────┼─────────┤
│ Juan Pérez      │ ABC12345 │ ████ 60% │ Hace 5 min     │ Activo  │
│ María García    │ XYZ98765 │ ██ 25%   │ Hace 2 horas   │ Activo  │
│ Carlos López    │ DEF45678 │ ██████100%│ Ayer           │ Inactivo│
└─────────────────┴──────────┴──────────┴─────────────────┴─────────┘
```

### 📋 Vista Detallada del Cliente
- **Información Personal**: Datos de contacto completos
- **Progreso Paso a Paso**: Qué secciones ha completado
- **Datos del Formulario**: Acceso a toda la información capturada
- **Historial de Actividad**: Registro de acciones del cliente

## 📝 Formulario DS-160 (7 Pasos)

### Paso 1: Información Personal
- Lugar de cita consular
- Nombre completo según pasaporte  
- Fecha y lugar de nacimiento
- Nacionalidades adicionales

### Paso 2: Dirección y Contacto
- Domicilio completo actual
- Información de contacto
- Teléfonos y email

### Paso 3: Información del Pasaporte
- Número de pasaporte
- Fechas de emisión y vencimiento
- País y lugar de emisión
- Validaciones de vigencia

### Paso 4: Información del Viaje
- Propósito del viaje
- Fechas planificadas
- Dirección en Estados Unidos
- Información del contacto

### Paso 5: Compañía de Viaje
- Acompañantes en el viaje
- Relación con acompañantes
- Organización del viaje

### Paso 6: Educación y Trabajo
- Historial educativo
- Información laboral actual
- Empleador y responsabilidades

### Paso 7: Información Familiar
- Datos de los padres
- Información del cónyuge
- Familiares en Estados Unidos

## 🛠️ Tecnologías Utilizadas

- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript para tipado estático
- **Estilos**: Tailwind CSS para diseño responsive
- **Estado**: Zustand para manejo de estado reactivo
- **Formularios**: React Hook Form con validaciones
- **Iconos**: Lucide React para UI moderna
- **Persistencia**: localStorage para datos del cliente

## 🔧 Configuración de Producción

### Variables de Entorno (Recomendado)
```bash
# .env.local
ADMIN_PASSWORD=tu_contraseña_segura
NEXTAUTH_SECRET=tu_clave_secreta
DATABASE_URL=tu_base_de_datos (opcional)
```

### Personalización
```typescript
// store/admin-store.ts
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"

// Para cambiar contraseña sin código:
localStorage.setItem('admin-password', 'nueva_contraseña')
```

## 📱 Uso Práctico

### Ejemplo de Flujo Completo

**1. Administrador crea cliente:**
```
Cliente: María García Rodríguez
Email: maria@email.com  
Teléfono: +52 33 1234-5678
Token generado: MRG78341
```

**2. Administrador comparte token:**
```
"Hola María, tu token de acceso es: MRG78341
Ingresa a: http://midominio.com
Completa el formulario paso a paso"
```

**3. Cliente accede y completa:**
- Ingresa token MRG78341
- Completa pasos 1-7 del formulario
- Progreso se actualiza automáticamente

**4. Administrador monitorea:**
- Ve progreso en tiempo real (0% → 100%)
- Revisa datos completados
- Puede descargar información final

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
# Conectar con GitHub y desplegar automáticamente
npm install -g vercel
vercel --prod
```

### Netlify
```bash
# Build command
npm run build

# Publish directory  
out/
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📞 Soporte

Sistema listo para uso en producción con:
- ✅ Validaciones completas
- ✅ Manejo de errores
- ✅ Diseño responsive  
- ✅ Persistencia de datos
- ✅ Panel administrativo completo

---

**Desarrollado para facilitar el proceso de solicitud de visa americana con un sistema profesional de gestión de clientes.**