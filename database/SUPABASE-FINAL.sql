-- ============================================================================
-- 🚀 A8VISAS DS-160 SYSTEM - SCRIPT SQL COMPLETO PARA SUPABASE 
-- ============================================================================
-- 
-- 📋 INSTRUCCIONES DE EJECUCIÓN:
-- 1. Abrir Supabase Dashboard → SQL Editor → New Query
-- 2. Copiar y pegar TODO este código
-- 3. Hacer clic en "Run" (botón verde)  
-- 4. Esperar mensaje: "Success. No rows returned"
-- 5. Verificar en Table Editor que se crearon las 6 tablas
-- 
-- 🕒 Tiempo estimado: 1-2 minutos
-- 📊 Tablas a crear: 6 tablas principales + 2 vistas + funciones
-- 
-- ============================================================================

-- PASO 1: HABILITAR EXTENSIONES NECESARIAS
-- ============================================================================

-- Habilitar extensión UUID para generar IDs únicos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar extensión para políticas de seguridad avanzadas
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- PASO 2: CREAR TABLAS PRINCIPALES
-- ============================================================================

-- TABLA 1: CLIENTES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
    -- Identificadores
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(20) UNIQUE NOT NULL,
    
    -- Información personal
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    -- Estado y control
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'active',
    
    -- Información adicional
    notes TEXT,
    created_by VARCHAR(100),
    
    -- Restricciones
    CONSTRAINT clients_email_check CHECK (client_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT clients_status_check CHECK (status IN ('active', 'inactive', 'completed', 'cancelled'))
);

-- TABLA 2: FORMULARIOS DS-160  
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.forms (
    -- Identificadores
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    
    -- Estado del formulario
    status VARCHAR(50) DEFAULT 'in_progress',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    current_step INTEGER DEFAULT 1 CHECK (current_step >= 1 AND current_step <= 7),
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Datos del formulario (JSON flexible)
    form_data JSONB DEFAULT '{}',
    
    -- Control de versiones y metadatos
    version INTEGER DEFAULT 1,
    filled_by VARCHAR(50) DEFAULT 'admin',
    admin_notes TEXT,
    
    -- Restricciones
    UNIQUE(client_id),
    CONSTRAINT forms_status_check CHECK (status IN ('in_progress', 'completed', 'cancelled', 'submitted'))
);

-- TABLA 3: COMENTARIOS DE FORMULARIOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.form_comments (
    -- Identificadores
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    
    -- Contenido del comentario
    comment TEXT NOT NULL,
    comment_type VARCHAR(50) DEFAULT 'general',
    
    -- Timestamps y autoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by VARCHAR(100) NOT NULL,
    
    -- Organización y prioridad
    step_number INTEGER CHECK (step_number >= 1 AND step_number <= 7),
    is_important BOOLEAN DEFAULT false,
    is_resolved BOOLEAN DEFAULT false,
    
    -- Restricciones
    CONSTRAINT comments_type_check CHECK (comment_type IN ('general', 'progress', 'issue', 'reminder', 'completion'))
);

-- TABLA 4: PAGOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    -- Identificadores
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE,
    
    -- Estado del pago
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(100),
    
    -- Información financiera
    amount DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Timestamps
    payment_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Información adicional
    payment_notes TEXT,
    receipt_number VARCHAR(100),
    updated_by VARCHAR(100),
    
    -- Restricciones
    CONSTRAINT payments_status_check CHECK (payment_status IN ('pending', 'paid', 'partial', 'cancelled', 'refunded')),
    CONSTRAINT payments_amount_check CHECK (amount >= 0)
);

-- TABLA 5: HISTORIAL DE CAMBIOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.form_history (
    -- Identificadores
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    
    -- Información del cambio
    action VARCHAR(50) NOT NULL,
    step_number INTEGER CHECK (step_number >= 1 AND step_number <= 7),
    old_data JSONB,
    new_data JSONB,
    
    -- Timestamps y autoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by VARCHAR(100),
    
    -- Detalles adicionales
    description TEXT,
    ip_address INET,
    
    -- Restricciones
    CONSTRAINT history_action_check CHECK (action IN ('created', 'updated', 'completed', 'step_completed', 'commented'))
);

-- TABLA 6: DOCUMENTOS PDF
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pdf_documents (
    -- Identificadores
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    
    -- Información del documento
    document_type VARCHAR(50) DEFAULT 'ds160_form',
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT,
    file_size INTEGER,
    
    -- Estado del documento
    status VARCHAR(50) DEFAULT 'generated',
    
    -- Timestamps
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    downloaded_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadatos
    generated_by VARCHAR(100),
    download_count INTEGER DEFAULT 0,
    
    -- Restricciones
    CONSTRAINT documents_type_check CHECK (document_type IN ('ds160_form', 'summary', 'receipt')),
    CONSTRAINT documents_status_check CHECK (status IN ('generated', 'downloaded', 'expired')),
    CONSTRAINT documents_size_check CHECK (file_size >= 0)
);

-- ============================================================================
-- PASO 3: CREAR ÍNDICES PARA OPTIMIZAR RENDIMIENTO
-- ============================================================================

-- Índices para tabla clients
CREATE INDEX IF NOT EXISTS idx_clients_token ON public.clients(token);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(client_email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_last_activity ON public.clients(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_clients_active ON public.clients(is_active) WHERE is_active = true;

-- Índices para tabla forms
CREATE INDEX IF NOT EXISTS idx_forms_client_id ON public.forms(client_id);
CREATE INDEX IF NOT EXISTS idx_forms_status ON public.forms(status);
CREATE INDEX IF NOT EXISTS idx_forms_progress ON public.forms(progress);
CREATE INDEX IF NOT EXISTS idx_forms_step ON public.forms(current_step);
CREATE INDEX IF NOT EXISTS idx_forms_started_at ON public.forms(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_forms_updated_at ON public.forms(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_forms_data_gin ON public.forms USING GIN(form_data);

-- Índices para tabla form_comments
CREATE INDEX IF NOT EXISTS idx_form_comments_form_id ON public.form_comments(form_id);
CREATE INDEX IF NOT EXISTS idx_form_comments_client_id ON public.form_comments(client_id);
CREATE INDEX IF NOT EXISTS idx_form_comments_created_at ON public.form_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_comments_type ON public.form_comments(comment_type);
CREATE INDEX IF NOT EXISTS idx_form_comments_step ON public.form_comments(step_number);
CREATE INDEX IF NOT EXISTS idx_form_comments_important ON public.form_comments(is_important) WHERE is_important = true;

-- Índices para tabla payments
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON public.payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_form_id ON public.payments(form_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- Índices para tabla form_history
CREATE INDEX IF NOT EXISTS idx_form_history_form_id ON public.form_history(form_id);
CREATE INDEX IF NOT EXISTS idx_form_history_client_id ON public.form_history(client_id);
CREATE INDEX IF NOT EXISTS idx_form_history_created_at ON public.form_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_history_action ON public.form_history(action);

-- Índices para tabla pdf_documents
CREATE INDEX IF NOT EXISTS idx_pdf_documents_form_id ON public.pdf_documents(form_id);
CREATE INDEX IF NOT EXISTS idx_pdf_documents_client_id ON public.pdf_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_pdf_documents_generated_at ON public.pdf_documents(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_pdf_documents_status ON public.pdf_documents(status);
CREATE INDEX IF NOT EXISTS idx_pdf_documents_type ON public.pdf_documents(document_type);

-- ============================================================================
-- PASO 4: CREAR FUNCIONES Y TRIGGERS AUTOMÁTICOS
-- ============================================================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON public.clients 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forms_updated_at 
    BEFORE UPDATE ON public.forms 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON public.payments 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Función para registrar cambios en el historial automáticamente
CREATE OR REPLACE FUNCTION public.log_form_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo registrar cambios significativos
    IF (TG_OP = 'UPDATE' AND (
        OLD.status IS DISTINCT FROM NEW.status OR 
        OLD.progress IS DISTINCT FROM NEW.progress OR 
        OLD.current_step IS DISTINCT FROM NEW.current_step OR
        OLD.form_data IS DISTINCT FROM NEW.form_data
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
                WHEN OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed' THEN 'completed'
                WHEN OLD.current_step IS DISTINCT FROM NEW.current_step THEN 'step_completed'
                ELSE 'updated'
            END,
            CASE 
                WHEN TG_OP = 'UPDATE' AND OLD.current_step IS DISTINCT FROM NEW.current_step THEN NEW.current_step
                ELSE NULL
            END,
            CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
            row_to_json(NEW),
            current_setting('app.current_user', true),
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'Formulario creado'
                WHEN OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed' THEN 'Formulario completado'
                WHEN OLD.current_step IS DISTINCT FROM NEW.current_step THEN 'Paso ' || NEW.current_step || ' completado'
                ELSE 'Formulario actualizado'
            END
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE 'plpgsql';

-- Trigger para el historial de formularios
CREATE TRIGGER log_form_changes_trigger
    AFTER INSERT OR UPDATE ON public.forms
    FOR EACH ROW EXECUTE FUNCTION public.log_form_changes();

-- ============================================================================
-- PASO 5: CREAR VISTAS OPTIMIZADAS PARA EL DASHBOARD
-- ============================================================================

-- Vista completa del dashboard con información de clientes
CREATE OR REPLACE VIEW public.client_dashboard AS
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
    c.is_active,
    
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

-- Vista de estadísticas para el dashboard
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT 
    -- Totales generales
    (SELECT COUNT(*) FROM public.clients WHERE status = 'active') as active_clients,
    (SELECT COUNT(*) FROM public.forms WHERE status = 'completed') as completed_forms,
    (SELECT COUNT(*) FROM public.forms WHERE status = 'in_progress') as in_progress_forms,
    
    -- Información de pagos
    (SELECT COUNT(*) FROM public.payments WHERE payment_status = 'paid') as paid_clients,
    (SELECT COUNT(*) FROM public.payments WHERE payment_status = 'pending') as pending_payments,
    
    -- Actividad reciente (últimas 24 horas)
    (SELECT COUNT(*) FROM public.clients WHERE last_activity > NOW() - INTERVAL '24 hours') as active_last_24h,
    (SELECT COUNT(*) FROM public.form_comments WHERE created_at > NOW() - INTERVAL '24 hours') as comments_last_24h,
    
    -- Estadísticas adicionales
    (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE payment_status = 'paid') as total_revenue,
    (SELECT COUNT(*) FROM public.clients) as total_clients;

-- ============================================================================
-- PASO 6: CONFIGURAR SEGURIDAD (ROW LEVEL SECURITY)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_documents ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para usuarios autenticados (administradores)
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
-- PASO 7: INSERTAR DATOS DE EJEMPLO (OPCIONAL)
-- ============================================================================
-- Descomenta las siguientes líneas si quieres datos de prueba

/*
-- Cliente de ejemplo
INSERT INTO public.clients (token, client_name, client_email, client_phone, created_by) VALUES
('A8V001DEMO', 'Juan Pérez López', 'juan.perez@ejemplo.com', '+52 55 1234 5678', 'admin');

-- Formulario de ejemplo
INSERT INTO public.forms (client_id, status, progress, current_step, form_data, filled_by) VALUES
((SELECT id FROM public.clients WHERE token = 'A8V001DEMO'), 'in_progress', 30, 3, 
 '{"ciudadCita": "Ciudad de México", "nombreCompleto": "Juan Pérez López", "citaCAS": "Tijuana"}', 'admin');

-- Comentario de ejemplo
INSERT INTO public.form_comments (form_id, client_id, comment, comment_type, created_by) VALUES
((SELECT id FROM public.forms WHERE client_id = (SELECT id FROM public.clients WHERE token = 'A8V001DEMO')), 
 (SELECT id FROM public.clients WHERE token = 'A8V001DEMO'),
 'Cliente muy colaborativo, documentación completa.',
 'progress',
 'admin');

-- Pago de ejemplo
INSERT INTO public.payments (client_id, form_id, payment_status, amount, currency, payment_method) VALUES
((SELECT id FROM public.clients WHERE token = 'A8V001DEMO'),
 (SELECT id FROM public.forms WHERE client_id = (SELECT id FROM public.clients WHERE token = 'A8V001DEMO')),
 'pending',
 350.00,
 'USD',
 'transferencia');
*/

-- ============================================================================
-- FINALIZACIÓN Y VERIFICACIÓN
-- ============================================================================

-- Función para verificar instalación
CREATE OR REPLACE FUNCTION public.verify_installation()
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'clients'::TEXT,
        (SELECT COUNT(*) FROM public.clients),
        'OK'::TEXT
    UNION ALL
    SELECT 
        'forms'::TEXT,
        (SELECT COUNT(*) FROM public.forms),
        'OK'::TEXT
    UNION ALL
    SELECT 
        'form_comments'::TEXT,
        (SELECT COUNT(*) FROM public.form_comments),
        'OK'::TEXT
    UNION ALL
    SELECT 
        'payments'::TEXT,
        (SELECT COUNT(*) FROM public.payments),
        'OK'::TEXT
    UNION ALL
    SELECT 
        'form_history'::TEXT,
        (SELECT COUNT(*) FROM public.form_history),
        'OK'::TEXT
    UNION ALL
    SELECT 
        'pdf_documents'::TEXT,
        (SELECT COUNT(*) FROM public.pdf_documents),
        'OK'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 🎉 INSTALACIÓN COMPLETADA EXITOSAMENTE
-- ============================================================================
-- 
-- ✅ VERIFICACIÓN:
-- Ejecuta: SELECT * FROM verify_installation();
-- Deberías ver 6 tablas con status 'OK'
-- 
-- 📋 PRÓXIMOS PASOS:
-- 1. Crear bucket 'documents' en Storage
-- 2. Configurar .env.local con tus credenciales
-- 3. Ejecutar npm run dev
-- 4. Probar en http://localhost:3000/admin/dashboard
-- 
-- 🚀 ¡Tu sistema A8Visas está listo!
-- ============================================================================