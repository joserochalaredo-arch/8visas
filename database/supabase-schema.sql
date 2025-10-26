-- ============================================================================
-- ESQUEMA COMPLETO PARA SUPABASE - A8VISAS DS-160 SYSTEM
-- Sistema de Gestión de Formularios DS-160 para Trámites de Visa USA
-- 
-- ACTUALIZADO: Octubre 2025  
-- VERSIÓN: 2.2 - Versión final optimizada para producción
-- 
-- ⚠️  INSTRUCCIONES CRÍTICAS DE INSTALACIÓN:
-- 1. Crear proyecto en Supabase (https://supabase.com)
-- 2. Ir a SQL Editor en tu dashboard de Supabase  
-- 3. Copiar y pegar COMPLETO este script (todo el archivo)
-- 4. Ejecutar el script con el botón "Run" (toma 1-2 minutos)
-- 5. Verificar que aparezcan 6 tablas en "Table Editor"
-- 6. Crear bucket "documents" en Storage
-- 7. Configurar variables de entorno en .env.local
-- 
-- 🎯 RESULTADO ESPERADO: "Success. No rows returned"
-- ============================================================================

-- ============================================================================
-- TABLA: clients (Información de Clientes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(20) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    -- Campos adicionales para gestión
    notes TEXT, -- Notas generales del cliente
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, completed, cancelled
    
    -- Metadatos
    created_by VARCHAR(100), -- Usuario que creó el cliente
    
    CONSTRAINT clients_email_check CHECK (client_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ============================================================================
-- TABLA: forms (Formularios DS-160)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    
    -- Estado del formulario
    status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, completed, cancelled, submitted
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    current_step INTEGER DEFAULT 1 CHECK (current_step >= 1 AND current_step <= 7),
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Datos del formulario DS-160 (JSON)
    form_data JSONB DEFAULT '{}',
    
    -- Control de versiones
    version INTEGER DEFAULT 1,
    
    -- Metadatos
    filled_by VARCHAR(50) DEFAULT 'admin', -- admin, client
    admin_notes TEXT, -- Notas del administrador sobre este formulario
    
    UNIQUE(client_id) -- Un cliente solo puede tener un formulario activo
);

-- ============================================================================
-- TABLA: form_comments (Comentarios del Administrador)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.form_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    
    -- Contenido del comentario
    comment TEXT NOT NULL,
    comment_type VARCHAR(50) DEFAULT 'general', -- general, progress, issue, reminder, completion
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by VARCHAR(100) NOT NULL, -- Usuario que creó el comentario
    
    -- Organización
    step_number INTEGER, -- Paso específico al que se refiere el comentario (opcional)
    is_important BOOLEAN DEFAULT false, -- Marcar comentarios importantes
    is_resolved BOOLEAN DEFAULT false -- Para comentarios que requieren seguimiento
);

-- ============================================================================
-- TABLA: payments (Estado de Pagos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE,
    
    -- Estado del pago
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, partial, cancelled, refunded
    payment_method VARCHAR(100), -- efectivo, transferencia, tarjeta, etc.
    
    -- Montos
    amount DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Fechas
    payment_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Información adicional
    payment_notes TEXT,
    receipt_number VARCHAR(100),
    
    -- Metadatos
    updated_by VARCHAR(100) -- Usuario que actualizó el estado del pago
);

-- ============================================================================
-- TABLA: form_history (Historial de Cambios)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.form_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    
    -- Información del cambio
    action VARCHAR(50) NOT NULL, -- created, updated, completed, step_completed, commented
    step_number INTEGER,
    old_data JSONB,
    new_data JSONB,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by VARCHAR(100),
    
    -- Descripción del cambio
    description TEXT,
    ip_address INET
);

-- ============================================================================
-- TABLA: pdf_documents (Documentos PDF Generados)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pdf_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    
    -- Información del documento
    document_type VARCHAR(50) DEFAULT 'ds160_form', -- ds160_form, summary, receipt
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT, -- Ruta en el storage
    file_size INTEGER,
    
    -- Estado del documento
    status VARCHAR(50) DEFAULT 'generated', -- generated, downloaded, expired
    
    -- Timestamps
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    downloaded_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadatos
    generated_by VARCHAR(100),
    download_count INTEGER DEFAULT 0
);

-- ============================================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================================================

-- Índices para clients
CREATE INDEX IF NOT EXISTS idx_clients_token ON public.clients(token);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(client_email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_last_activity ON public.clients(last_activity DESC);

-- Índices para forms
CREATE INDEX IF NOT EXISTS idx_forms_client_id ON public.forms(client_id);
CREATE INDEX IF NOT EXISTS idx_forms_status ON public.forms(status);
CREATE INDEX IF NOT EXISTS idx_forms_progress ON public.forms(progress);
CREATE INDEX IF NOT EXISTS idx_forms_started_at ON public.forms(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_forms_updated_at ON public.forms(updated_at DESC);

-- Índices para form_comments
CREATE INDEX IF NOT EXISTS idx_form_comments_form_id ON public.form_comments(form_id);
CREATE INDEX IF NOT EXISTS idx_form_comments_client_id ON public.form_comments(client_id);
CREATE INDEX IF NOT EXISTS idx_form_comments_created_at ON public.form_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_comments_type ON public.form_comments(comment_type);

-- Índices para payments
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON public.payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_form_id ON public.payments(form_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date DESC);

-- Índices para form_history
CREATE INDEX IF NOT EXISTS idx_form_history_form_id ON public.form_history(form_id);
CREATE INDEX IF NOT EXISTS idx_form_history_client_id ON public.form_history(client_id);
CREATE INDEX IF NOT EXISTS idx_form_history_created_at ON public.form_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_history_action ON public.form_history(action);

-- Índices para pdf_documents
CREATE INDEX IF NOT EXISTS idx_pdf_documents_form_id ON public.pdf_documents(form_id);
CREATE INDEX IF NOT EXISTS idx_pdf_documents_client_id ON public.pdf_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_pdf_documents_generated_at ON public.pdf_documents(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_pdf_documents_status ON public.pdf_documents(status);

-- ============================================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================================

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON public.clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at 
    BEFORE UPDATE ON public.forms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON public.payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para registrar cambios en el historial
CREATE OR REPLACE FUNCTION log_form_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo registrar si realmente cambió algo importante
    IF (TG_OP = 'UPDATE' AND (
        OLD.status != NEW.status OR 
        OLD.progress != NEW.progress OR 
        OLD.current_step != NEW.current_step OR
        OLD.form_data != NEW.form_data
    )) OR TG_OP = 'INSERT' THEN
        
        INSERT INTO public.form_history (
            form_id, 
            client_id, 
            action, 
            step_number,
            old_data, 
            new_data,
            created_by,
            description
        ) VALUES (
            COALESCE(NEW.id, OLD.id),
            COALESCE(NEW.client_id, OLD.client_id),
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'created'
                WHEN OLD.status != NEW.status AND NEW.status = 'completed' THEN 'completed'
                WHEN OLD.current_step != NEW.current_step THEN 'step_completed'
                ELSE 'updated'
            END,
            CASE 
                WHEN TG_OP = 'UPDATE' AND OLD.current_step != NEW.current_step THEN NEW.current_step
                ELSE NULL
            END,
            CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
            row_to_json(NEW),
            current_setting('app.current_user', true),
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'Formulario creado'
                WHEN OLD.status != NEW.status AND NEW.status = 'completed' THEN 'Formulario completado'
                WHEN OLD.current_step != NEW.current_step THEN 'Paso ' || NEW.current_step || ' completado'
                ELSE 'Formulario actualizado'
            END
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger para el historial de formularios
CREATE TRIGGER log_form_changes_trigger
    AFTER INSERT OR UPDATE ON public.forms
    FOR EACH ROW EXECUTE FUNCTION log_form_changes();

-- ============================================================================
-- VISTAS ÚTILES
-- ============================================================================

-- Vista para obtener información completa de clientes con sus formularios
CREATE OR REPLACE VIEW client_dashboard AS
SELECT 
    c.id,
    c.token,
    c.client_name,
    c.client_email,
    c.client_phone,
    c.created_at,
    c.status as client_status,
    c.last_activity,
    c.notes as client_notes,
    
    -- Información del formulario
    f.id as form_id,
    f.status as form_status,
    f.progress,
    f.current_step,
    f.started_at as form_started_at,
    f.completed_at,
    f.admin_notes as form_notes,
    f.filled_by,
    
    -- Información del pago
    p.payment_status,
    p.amount,
    p.currency,
    p.payment_date,
    p.due_date,
    
    -- Conteos útiles
    (SELECT COUNT(*) FROM public.form_comments WHERE client_id = c.id) as comment_count,
    (SELECT COUNT(*) FROM public.pdf_documents WHERE client_id = c.id) as document_count
    
FROM public.clients c
LEFT JOIN public.forms f ON c.id = f.client_id
LEFT JOIN public.payments p ON c.id = p.client_id
ORDER BY c.last_activity DESC;

-- Vista para estadísticas del dashboard
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    -- Totales
    (SELECT COUNT(*) FROM public.clients WHERE status = 'active') as active_clients,
    (SELECT COUNT(*) FROM public.forms WHERE status = 'completed') as completed_forms,
    (SELECT COUNT(*) FROM public.forms WHERE status = 'in_progress') as in_progress_forms,
    
    -- Pagos
    (SELECT COUNT(*) FROM public.payments WHERE payment_status = 'paid') as paid_clients,
    (SELECT COUNT(*) FROM public.payments WHERE payment_status = 'pending') as pending_payments,
    
    -- Actividad reciente (últimas 24 horas)
    (SELECT COUNT(*) FROM public.clients WHERE last_activity > NOW() - INTERVAL '24 hours') as active_last_24h,
    (SELECT COUNT(*) FROM public.form_comments WHERE created_at > NOW() - INTERVAL '24 hours') as comments_last_24h;

-- ============================================================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_documents ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acceso completo a usuarios autenticados (administradores)
CREATE POLICY "Admins can manage all clients" ON public.clients
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage all forms" ON public.forms
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage all comments" ON public.form_comments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage all payments" ON public.payments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can view all history" ON public.form_history
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage all documents" ON public.pdf_documents
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- DATOS DE EJEMPLO (OPCIONAL - DESCOMENTARY EJECUTAR SI SE DESEAN DATOS DE PRUEBA)
-- ============================================================================

/*
-- Cliente de ejemplo
INSERT INTO public.clients (token, client_name, client_email, client_phone, created_by) VALUES
('DEMO001', 'Juan Pérez López', 'juan.perez@email.com', '+52 55 1234 5678', 'admin');

-- Formulario de ejemplo
INSERT INTO public.forms (client_id, status, progress, current_step, form_data, filled_by) VALUES
((SELECT id FROM public.clients WHERE token = 'DEMO001'), 'in_progress', 30, 3, '{"ciudadCita": "Ciudad de México", "nombreCompleto": "Juan Pérez López"}', 'admin');

-- Comentario de ejemplo
INSERT INTO public.form_comments (form_id, client_id, comment, comment_type, created_by) VALUES
((SELECT id FROM public.forms WHERE client_id = (SELECT id FROM public.clients WHERE token = 'DEMO001')), 
 (SELECT id FROM public.clients WHERE token = 'DEMO001'),
 'Cliente muy colaborativo, proporcionó toda la documentación necesaria.',
 'progress',
 'admin');

-- Pago de ejemplo
INSERT INTO public.payments (client_id, form_id, payment_status, amount, currency, payment_method) VALUES
((SELECT id FROM public.clients WHERE token = 'DEMO001'),
 (SELECT id FROM public.forms WHERE client_id = (SELECT id FROM public.clients WHERE token = 'DEMO001')),
 'pending',
 350.00,
 'USD',
 'transferencia');
*/

-- ============================================================================
-- INSTRUCCIONES DE EJECUCIÓN
-- ============================================================================

-- ============================================================================
-- CONFIGURACIÓN POST-INSTALACIÓN SUPABASE
-- ============================================================================

-- 1. CREAR BUCKET PARA ALMACENAMIENTO DE DOCUMENTOS
-- Ejecutar en SQL Editor después de crear las tablas:
/*
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false);

-- Política para permitir acceso a documentos autenticados
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'documents');

CREATE POLICY "Authenticated users can view documents" ON storage.objects
FOR SELECT USING (auth.role() = 'authenticated' AND bucket_id = 'documents');

CREATE POLICY "Authenticated users can update documents" ON storage.objects
FOR UPDATE USING (auth.role() = 'authenticated' AND bucket_id = 'documents');

CREATE POLICY "Authenticated users can delete documents" ON storage.objects
FOR DELETE USING (auth.role() = 'authenticated' AND bucket_id = 'documents');
*/

-- ============================================================================
-- CONFIGURACIÓN DE ARCHIVOS NECESARIOS EN EL PROYECTO
-- ============================================================================

/*
ARCHIVOS A CREAR/CONFIGURAR:

1. .env.local (variables de entorno)
2. lib/supabase.ts (cliente Supabase)
3. lib/database.ts (funciones de base de datos)
4. types/database.ts (tipos TypeScript)

DEPENDENCIAS NPM A INSTALAR:
npm install @supabase/supabase-js

ESTRUCTURA RECOMENDADA:
/lib
  ├── supabase.ts          # Cliente de Supabase
  ├── database.ts          # Funciones de DB
  └── auth.ts              # Funciones de autenticación
/types
  ├── database.ts          # Tipos de base de datos
  └── supabase.ts          # Tipos de Supabase
/hooks
  ├── use-supabase.ts      # Hook personalizado
  └── use-database.ts      # Hook para operaciones DB

VARIABLES DE ENTORNO NECESARIAS EN .env.local:

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_publica
SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role_secreta

# App Configuration  
NEXTAUTH_SECRET=tu_secret_muy_seguro_aqui
NEXTAUTH_URL=http://localhost:3000

# Admin Authentication
ADMIN_EMAIL=admin@a8visas.com
ADMIN_PASSWORD=tu_password_admin_seguro

# Email Configuration (Opcional - para notificaciones)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_password_app_gmail

# PDF Generation (Opcional)
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Storage Configuration
NEXT_PUBLIC_STORAGE_BUCKET=documents
MAX_FILE_SIZE=10485760

# Application Settings
APP_NAME=A8Visas DS-160 System
APP_VERSION=2.1.0
ENVIRONMENT=development

INSTRUCCIONES DETALLADAS:

1. CONFIGURAR SUPABASE:
   - Crear cuenta en https://supabase.com
   - Crear nuevo proyecto
   - Ir a Settings > API para obtener las URLs y claves
   - Ejecutar este script SQL en SQL Editor
   - Crear bucket 'documents' en Storage

2. CONFIGURAR AUTENTICACIÓN:
   - En Supabase Dashboard > Authentication > Settings
   - Configurar Email templates si es necesario
   - Agregar dominio en Authorized redirect URLs: http://localhost:3000/**

3. CONFIGURAR STORAGE:
   - En Supabase Dashboard > Storage
   - Crear bucket llamado 'documents'
   - Configurar políticas de acceso (ver código arriba)

4. CONFIGURAR VARIABLES DE ENTORNO:
   - Copiar las variables de arriba a tu .env.local
   - Reemplazar los valores con tus datos reales de Supabase
   - Generar NEXTAUTH_SECRET: openssl rand -base64 32

5. CONFIGURAR CLIENTE SUPABASE:
   - Ver archivo lib/supabase.ts que se debe crear

COMANDOS PARA EJECUTAR DESPUÉS DE LA CONFIGURACIÓN:

npm install @supabase/supabase-js
npm install @supabase/auth-helpers-nextjs
npm install next-auth (opcional, para autenticación avanzada)

VERIFICACIÓN DE INSTALACIÓN:

1. Todas las tablas aparecen en Table Editor
2. El bucket 'documents' existe en Storage  
3. Las variables de entorno están configuradas
4. El proyecto compila sin errores: npm run build
5. El servidor se ejecuta correctamente: npm run dev

MANTENIMIENTO Y MONITOREO:

- Revisar logs en Supabase Dashboard regularmente
- Hacer backup de la base de datos mensualmente
- Monitorear uso del Storage (límites de plan)
- Actualizar índices según crecimiento de datos
- Revisar métricas de rendimiento en Dashboard

CONSIDERACIONES DE SEGURIDAD:

- Row Level Security (RLS) está habilitado
- Solo usuarios autenticados pueden acceder a datos
- Todas las claves sensibles están en variables de entorno
- Los archivos PDF tienen políticas de acceso restringido
- Se recomienda habilitar 2FA en cuenta de Supabase

SOPORTE Y DOCUMENTACIÓN:

- Documentación Supabase: https://supabase.com/docs
- Guías Next.js + Supabase: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Comunidad: https://github.com/supabase/supabase/discussions
*/