#!/bin/bash

# ============================================================================
# SCRIPT DE INSTALACIÓN AUTOMÁTICA - A8VISAS DS-160 SYSTEM
# ============================================================================
# Este script automatiza la instalación de dependencias y configuración básica
# 
# USO:
#   chmod +x install-dependencies.sh
#   ./install-dependencies.sh
# 
# O desde el directorio del proyecto:
#   bash install-dependencies.sh
# ============================================================================

echo "🚀 Iniciando instalación de A8Visas DS-160 System..."
echo "============================================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log_error "No se encontró package.json. Ejecuta este script desde el directorio raíz del proyecto."
    exit 1
fi

log_info "Verificando directorio del proyecto..."
log_success "Directorio correcto detectado: $(pwd)"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js no está instalado. Por favor instala Node.js 18+ desde https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
log_success "Node.js detectado: $NODE_VERSION"

# Verificar npm
if ! command -v npm &> /dev/null; then
    log_error "npm no está instalado. Por favor instala npm"
    exit 1
fi

NPM_VERSION=$(npm -v)
log_success "npm detectado: $NPM_VERSION"

echo ""
echo "============================================================================"
log_info "PASO 1: Limpiando instalación previa..."
echo "============================================================================"

# Limpiar node_modules y .next si existen
if [ -d "node_modules" ]; then
    log_info "Eliminando node_modules existente..."
    rm -rf node_modules
    log_success "node_modules eliminado"
fi

if [ -d ".next" ]; then
    log_info "Eliminando .next existente..."
    rm -rf .next
    log_success ".next eliminado"
fi

if [ -f "package-lock.json" ]; then
    log_info "Eliminando package-lock.json existente..."
    rm -f package-lock.json
    log_success "package-lock.json eliminado"
fi

echo ""
echo "============================================================================"
log_info "PASO 2: Instalando dependencias principales..."
echo "============================================================================"

# Instalar dependencias base
log_info "Instalando dependencias base del proyecto..."
if npm install; then
    log_success "Dependencias base instaladas correctamente"
else
    log_error "Error instalando dependencias base"
    exit 1
fi

echo ""
echo "============================================================================"
log_info "PASO 3: Instalando dependencias de Supabase..."
echo "============================================================================"

# Instalar Supabase
log_info "Instalando @supabase/supabase-js..."
if npm install @supabase/supabase-js; then
    log_success "@supabase/supabase-js instalado"
else
    log_error "Error instalando @supabase/supabase-js"
    exit 1
fi

log_info "Instalando @supabase/auth-helpers-nextjs..."
if npm install @supabase/auth-helpers-nextjs; then
    log_success "@supabase/auth-helpers-nextjs instalado"
else
    log_warning "Error instalando @supabase/auth-helpers-nextjs (continuando...)"
fi

echo ""
echo "============================================================================"
log_info "PASO 4: Instalando dependencias adicionales (opcional)..."
echo "============================================================================"

# Dependencias adicionales
log_info "Instalando next-auth para autenticación avanzada..."
if npm install next-auth; then
    log_success "next-auth instalado"
else
    log_warning "Error instalando next-auth (opcional)"
fi

log_info "Instalando puppeteer para generación de PDFs..."
if npm install puppeteer; then
    log_success "puppeteer instalado"
else
    log_warning "Error instalando puppeteer (opcional)"
fi

log_info "Instalando nodemailer para envío de emails..."
if npm install nodemailer @types/nodemailer; then
    log_success "nodemailer instalado"
else
    log_warning "Error instalando nodemailer (opcional)"
fi

log_info "Instalando uuid para generación de IDs únicos..."
if npm install uuid @types/uuid; then
    log_success "uuid instalado"
else
    log_warning "Error instalando uuid (opcional)"
fi

echo ""
echo "============================================================================"
log_info "PASO 5: Verificando instalación..."
echo "============================================================================"

# Verificar que las dependencias críticas estén instaladas
REQUIRED_DEPS=("@supabase/supabase-js" "next" "react" "typescript")
MISSING_DEPS=()

for dep in "${REQUIRED_DEPS[@]}"; do
    if npm list "$dep" &> /dev/null; then
        log_success "$dep ✓"
    else
        log_error "$dep ✗"
        MISSING_DEPS+=("$dep")
    fi
done

if [ ${#MISSING_DEPS[@]} -ne 0 ]; then
    log_error "Las siguientes dependencias críticas faltan: ${MISSING_DEPS[*]}"
    log_info "Intentando reinstalar..."
    npm install "${MISSING_DEPS[@]}"
fi

echo ""
echo "============================================================================"
log_info "PASO 6: Configurando archivos..."
echo "============================================================================"

# Verificar que existan los archivos críticos
REQUIRED_FILES=(
    ".env.local"
    "lib/supabase.ts"
    "types/database.ts"
    "database/supabase-schema.sql"
    "INSTALLATION.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_success "$file ✓"
    else
        log_warning "$file no encontrado"
    fi
done

# Crear directorio .next si no existe
if [ ! -d ".next" ]; then
    mkdir .next
    log_success "Directorio .next creado"
fi

echo ""
echo "============================================================================"
log_info "PASO 7: Compilación de prueba..."
echo "============================================================================"

log_info "Intentando compilar el proyecto..."
if npm run build; then
    log_success "¡Proyecto compilado exitosamente!"
else
    log_warning "Error en la compilación. Revisar errores arriba."
    log_info "Esto puede ser normal si aún no has configurado las variables de entorno."
fi

echo ""
echo "============================================================================"
log_success "🎉 INSTALACIÓN COMPLETADA"
echo "============================================================================"

echo ""
log_success "Dependencias instaladas correctamente!"
echo ""
log_info "PRÓXIMOS PASOS:"
echo ""
echo "1️⃣  Configurar Supabase:"
echo "   - Crear proyecto en https://supabase.com"
echo "   - Ejecutar el script SQL en database/supabase-schema.sql"
echo "   - Copiar las credenciales API"
echo ""
echo "2️⃣  Configurar variables de entorno:"
echo "   - Editar el archivo .env.local"
echo "   - Completar con tus valores de Supabase"
echo "   - Generar NEXTAUTH_SECRET: openssl rand -base64 32"
echo ""
echo "3️⃣  Iniciar el servidor de desarrollo:"
echo "   npm run dev"
echo ""
echo "4️⃣  Abrir en navegador:"
echo "   http://localhost:3000"
echo ""
log_info "📖 Ver guía completa en: INSTALLATION.md"
echo ""
log_success "¡Tu sistema A8Visas está listo para configuración final!"
echo "============================================================================"

# Mostrar información del sistema
echo ""
log_info "INFORMACIÓN DEL SISTEMA:"
echo "Node.js: $NODE_VERSION"
echo "npm: $NPM_VERSION"
echo "Directorio: $(pwd)"
echo "Fecha: $(date)"
echo ""

exit 0