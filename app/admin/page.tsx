'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminSupabase } from '@/hooks/use-admin-supabase'

export default function AdminPage() {
  const router = useRouter()
  const { isAdminAuthenticated } = useAdminSupabase()
  
  console.log('🔄 AdminPage - Redirigiendo. Estado auth:', { isAdminAuthenticated })

  useEffect(() => {
    // Si ya está autenticado, ir al dashboard
    if (isAdminAuthenticated) {
      console.log('✅ Ya autenticado, redirigiendo a dashboard...')
      router.push('/admin/dashboard')
    } else {
      // Si no está autenticado, redirigir al home donde está el modal
      console.log('❌ No autenticado, redirigiendo a home para usar modal...')
      router.push('/')
    }
  }, [isAdminAuthenticated, router])

  // Mostrar loading mientras redirecciona
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="mt-4 text-gray-600">Redirigiendo...</p>
        <p className="mt-2 text-sm text-gray-500">
          El login de admin ahora se realiza desde el modal en la página principal
        </p>
      </div>
    </div>
  )
}