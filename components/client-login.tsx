'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KeyIcon, ArrowRightIcon, AlertCircleIcon } from 'lucide-react'

interface ClientLoginProps {
  onClose: () => void
}

export default function ClientLogin({ onClose }: ClientLoginProps) {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const success = login(token.toUpperCase())
      
      if (success) {
        // Actualizar progreso del cliente (0% al inicio)
        if (typeof window !== 'undefined') {
          const adminStorage = localStorage.getItem('admin-storage')
          if (adminStorage) {
            const adminData = JSON.parse(adminStorage)
            const clients = adminData.state?.clients || []
            const updatedClients = clients.map((c: any) => 
              c.token === token.toUpperCase() 
                ? { ...c, lastActivity: new Date().toISOString() }
                : c
            )
            
            const updatedAdminData = {
              ...adminData,
              state: {
                ...adminData.state,
                clients: updatedClients
              }
            }
            localStorage.setItem('admin-storage', JSON.stringify(updatedAdminData))
          }
        }
        
        router.push('/form/step-1')
      } else {
        setError('Token inválido o inactivo. Contacta con tu asesor.')
      }
    } catch (err) {
      setError('Error al verificar el token. Intenta nuevamente.')
    }
    
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <KeyIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Acceso al Formulario</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Instrucciones de Acceso
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Ingresa el token que te proporcionó tu asesor</li>
            <li>• El token consta de 8 caracteres alfanuméricos</li>
            <li>• Este token te dará acceso al formulario DS-160</li>
          </ul>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
              Token de Acceso
            </label>
            <Input
              id="token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              placeholder="Ej: ABC12345"
              className="text-center text-lg font-mono tracking-wider"
              maxLength={8}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
              <AlertCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={loading || token.length < 6}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Verificando...
                </div>
              ) : (
                <div className="flex items-center">
                  Acceder
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </div>
              )}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            ¿No tienes un token? Contacta a tu asesor de visas para obtener uno
          </p>
        </div>
      </div>
    </div>
  )
}