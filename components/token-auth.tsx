'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Shield, CheckCircle, Loader2, Copy, ArrowRight } from 'lucide-react'

interface TokenAuthProps {
  onSuccess: () => void
}

export function TokenAuth({ onSuccess }: TokenAuthProps) {
  const { generateToken, verifyPayment } = useAuthStore()
  const [step, setStep] = useState<'generate' | 'payment' | 'verify'>('generate')
  const [token, setToken] = useState('')
  const [inputToken, setInputToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerateToken = () => {
    const newToken = generateToken()
    setToken(newToken)
    setStep('payment')
  }

  const copyToken = async () => {
    await navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVerifyPayment = async () => {
    if (!inputToken.trim()) {
      setError('Por favor ingrese su número de token')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const isValid = await verifyPayment(inputToken.trim())
      
      if (isValid) {
        onSuccess()
      } else {
        setError('Token inválido o pago no verificado. Contacte al administrador.')
      }
    } catch (err) {
      setError('Error al verificar el pago. Intente nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const services = [
    'Llenado completo del formulario DS-160',
    'Revisión y validación de datos',
    'Formato de pago de visa',
    'Orientación para cita CAS y Embajada',
    'Soporte durante todo el proceso'
  ]

  if (step === 'generate') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-primary-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
              <Shield className="h-6 w-6 text-primary-600" />
            </div>
            <CardTitle className="text-2xl text-primary-900">
              Acceso Protegido al Formulario DS-160
            </CardTitle>
            <CardDescription className="text-lg">
              Para acceder al formulario, debe generar un token de pago y realizar la transferencia correspondiente
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
              <h3 className="font-semibold text-secondary-900 mb-3">¿Qué incluye nuestro servicio?</h3>
              <ul className="space-y-2">
                {services.map((service, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center">
              <div className="bg-primary-50 rounded-lg p-6 mb-4">
                <CreditCard className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <h4 className="font-semibold text-primary-900 mb-2">Costo del Servicio</h4>
                <div className="text-3xl font-bold text-primary-600 mb-1">$1,500 MXN</div>
                <p className="text-sm text-gray-600">Pago único por servicio completo</p>
              </div>
              
              <Button 
                onClick={handleGenerateToken}
                size="lg" 
                className="w-full"
              >
                Generar Token de Pago
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'payment') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-warning-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-warning-100">
              <CreditCard className="h-6 w-6 text-warning-600" />
            </div>
            <CardTitle className="text-2xl text-warning-900">
              Token Generado - Realizar Pago
            </CardTitle>
            <CardDescription className="text-lg">
              Su token ha sido generado. Realice la transferencia y use este token para acceder
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Su Token de Pago:
              </label>
              <div className="flex items-center justify-center space-x-2">
                <code className="bg-white px-4 py-2 rounded border text-2xl font-mono font-bold text-primary-600">
                  {token}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToken}
                  className="flex-shrink-0"
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {copied && (
                <p className="text-sm text-success-600 mt-1">¡Token copiado!</p>
              )}
            </div>

            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <h3 className="font-semibold text-warning-900 mb-3">Datos para Transferencia:</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Banco:</strong> BBVA Bancomer</div>
                <div><strong>Cuenta:</strong> 0123456789</div>
                <div><strong>CLABE:</strong> 012345678901234567</div>
                <div><strong>Beneficiario:</strong> Servicios de Visa Americana</div>
                <div><strong>Concepto:</strong> Token {token}</div>
                <div><strong>Monto:</strong> $1,500.00 MXN</div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Una vez realizada la transferencia, use su token para acceder al formulario
              </p>
              <Button 
                onClick={() => setStep('verify')}
                variant="outline"
                className="w-full"
              >
                Ya Realicé la Transferencia
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success-100">
            <CheckCircle className="h-6 w-6 text-success-600" />
          </div>
          <CardTitle className="text-xl">Verificar Pago</CardTitle>
          <CardDescription>
            Ingrese su token para acceder al formulario
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Input
            label="Número de Token"
            placeholder="Ingrese su token de 8 dígitos"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            maxLength={8}
            error={error}
            required
          />
          
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Para pruebas:</strong> Use el token "12345678" para acceso inmediato
          </div>

          <Button 
            onClick={handleVerifyPayment}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              'Verificar y Acceder'
            )}
          </Button>

          <Button 
            onClick={() => setStep('payment')}
            variant="outline"
            className="w-full"
          >
            Ver Datos de Transferencia
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Crear Card components básicos si no existen
const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
)

const CardTitle = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <h3 className={`font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
)

const CardDescription = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <p className={`text-sm text-gray-600 mt-1.5 ${className}`}>
    {children}
  </p>
)

const CardContent = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
)