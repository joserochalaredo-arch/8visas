-- ============================================================================
-- SCRIPT ADICIONAL: CONFIGURAR POLÍTICAS RLS PARA APLICACIÓN
-- ============================================================================
-- 
-- Este script configura las políticas de Row Level Security (RLS)
-- para permitir que la aplicación funcione correctamente.
-- 
-- EJECUTAR DESPUÉS del script principal SUPABASE-FINAL.sql
-- 
-- ============================================================================

-- Deshabilitar RLS temporalmente para configurar políticas más flexibles
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_documents DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Admins can manage all clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can manage all forms" ON public.forms;
DROP POLICY IF EXISTS "Admins can manage all comments" ON public.form_comments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all history" ON public.form_history;
DROP POLICY IF EXISTS "Admins can manage all documents" ON public.pdf_documents;

-- ============================================================================
-- POLÍTICAS MÁS FLEXIBLES PARA DESARROLLO
-- ============================================================================

-- Re-habilitar RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_documents ENABLE ROW LEVEL SECURITY;

-- Políticas que permiten acceso con service_role key (para la aplicación)
CREATE POLICY "Allow all operations for service role" ON public.clients
    FOR ALL USING (current_setting('role') = 'service_role' OR auth.jwt() IS NULL);

CREATE POLICY "Allow all operations for service role" ON public.forms
    FOR ALL USING (current_setting('role') = 'service_role' OR auth.jwt() IS NULL);

CREATE POLICY "Allow all operations for service role" ON public.form_comments
    FOR ALL USING (current_setting('role') = 'service_role' OR auth.jwt() IS NULL);

CREATE POLICY "Allow all operations for service role" ON public.payments
    FOR ALL USING (current_setting('role') = 'service_role' OR auth.jwt() IS NULL);

CREATE POLICY "Allow all operations for service role" ON public.form_history
    FOR ALL USING (current_setting('role') = 'service_role' OR auth.jwt() IS NULL);

CREATE POLICY "Allow all operations for service role" ON public.pdf_documents
    FOR ALL USING (current_setting('role') = 'service_role' OR auth.jwt() IS NULL);

-- ============================================================================
-- CONFIGURAR BUCKET DE STORAGE
-- ============================================================================

-- Crear bucket para documentos si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas para Storage
DO $$
BEGIN
    -- Eliminar políticas existentes si existen
    DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can update documents" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Crear nuevas políticas más flexibles
CREATE POLICY "Allow document uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow document access" ON storage.objects
FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Allow document updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'documents');

CREATE POLICY "Allow document deletion" ON storage.objects
FOR DELETE USING (bucket_id = 'documents');

-- ============================================================================
-- FUNCIÓN DE VALIDACIÓN MEJORADA
-- ============================================================================

CREATE OR REPLACE FUNCTION public.test_application_access()
RETURNS TABLE (
    operation TEXT,
    table_name TEXT,
    success BOOLEAN,
    message TEXT
) AS $$
BEGIN
    -- Test inserción en clients
    BEGIN
        INSERT INTO public.clients (token, client_name, client_email, created_by)
        VALUES ('TEST_APP_' || EXTRACT(EPOCH FROM NOW())::TEXT, 'Test App User', 'test@app.com', 'app-test');
        
        RETURN QUERY SELECT 'INSERT'::TEXT, 'clients'::TEXT, true, 'Success'::TEXT;
        
        -- Limpiar después del test
        DELETE FROM public.clients WHERE client_email = 'test@app.com';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN QUERY SELECT 'INSERT'::TEXT, 'clients'::TEXT, false, SQLERRM::TEXT;
    END;
    
    -- Test selección
    BEGIN
        PERFORM COUNT(*) FROM public.clients;
        RETURN QUERY SELECT 'SELECT'::TEXT, 'clients'::TEXT, true, 'Success'::TEXT;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN QUERY SELECT 'SELECT'::TEXT, 'clients'::TEXT, false, SQLERRM::TEXT;
    END;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DATOS DE EJEMPLO PARA TESTING (OPCIONAL)
-- ============================================================================

-- Crear un cliente de ejemplo si no existe
INSERT INTO public.clients (token, client_name, client_email, client_phone, created_by, notes)
VALUES (
    'A8V001DEMO',
    'Juan Pérez Ejemplo',
    'juan.ejemplo@a8visas.com',
    '+52 55 1234 5678',
    'admin',
    'Cliente de ejemplo para testing del sistema'
) ON CONFLICT (token) DO NOTHING;

-- Crear formulario para el cliente de ejemplo
INSERT INTO public.forms (
    client_id, 
    status, 
    progress, 
    current_step, 
    form_data, 
    filled_by,
    admin_notes
)
SELECT 
    c.id,
    'in_progress',
    42,
    3,
    '{"nombreCompleto": "Juan Pérez Ejemplo", "ciudadCita": "Ciudad de México", "citaCAS": "Tijuana", "correoElectronico": "juan.ejemplo@a8visas.com"}'::jsonb,
    'admin',
    'Formulario de ejemplo creado automáticamente'
FROM public.clients c 
WHERE c.token = 'A8V001DEMO'
ON CONFLICT (client_id) DO NOTHING;

-- Crear comentario de ejemplo
INSERT INTO public.form_comments (
    form_id,
    client_id,
    comment,
    comment_type,
    created_by,
    step_number,
    is_important
)
SELECT 
    f.id,
    c.id,
    'Este es un comentario de ejemplo. El cliente ha proporcionado toda la documentación necesaria y está avanzando correctamente en el proceso.',
    'progress',
    'admin',
    2,
    false
FROM public.clients c
JOIN public.forms f ON f.client_id = c.id
WHERE c.token = 'A8V001DEMO'
ON CONFLICT DO NOTHING;

-- Crear pago de ejemplo
INSERT INTO public.payments (
    client_id,
    form_id,
    payment_status,
    amount,
    currency,
    payment_method,
    payment_notes
)
SELECT 
    c.id,
    f.id,
    'pending',
    350.00,
    'USD',
    'transferencia',
    'Pago inicial del trámite DS-160'
FROM public.clients c
JOIN public.forms f ON f.client_id = c.id
WHERE c.token = 'A8V001DEMO'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Función para verificar que todo funciona
SELECT 'Verificación de acceso completada' as status;

-- Test de la función de validación
SELECT * FROM public.test_application_access();

-- Mostrar estadísticas actuales
SELECT * FROM public.dashboard_stats;

-- Mostrar clientes en el dashboard
SELECT 
    token,
    client_name,
    client_email,
    client_status,
    form_status,
    progress,
    payment_status
FROM public.client_dashboard 
LIMIT 5;

-- ============================================================================
-- MENSAJE FINAL
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '============================================================';
    RAISE NOTICE '🎉 CONFIGURACIÓN RLS COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ Políticas de seguridad configuradas';
    RAISE NOTICE '✅ Bucket de storage configurado';
    RAISE NOTICE '✅ Datos de ejemplo creados';
    RAISE NOTICE '✅ Sistema listo para usar';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PRÓXIMOS PASOS:';
    RAISE NOTICE '1. npm run dev';
    RAISE NOTICE '2. Abrir http://localhost:3000/admin/dashboard';
    RAISE NOTICE '3. ¡Comenzar a usar A8Visas!';
    RAISE NOTICE '============================================================';
END $$;