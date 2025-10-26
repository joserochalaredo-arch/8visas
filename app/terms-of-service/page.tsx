'use client'

import { ArrowLeftIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function TermsOfServicePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src="/images/LOGOSOLO.png"
                alt="A8Visas Logo"
                width={48}
                height={48}
                className="w-12 h-12"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">A8Visas</h1>
                <p className="text-sm text-gray-600">Términos de Servicio</p>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Regresar
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Términos de Servicio</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              Estos Términos de Servicio regulan el uso que usted hace de la plataforma y servicios de A8Visas en lo relativo al tratamiento de datos personales y la prestación de servicios de asesoría para trámites de visa.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceptación de Términos</h2>
            <p className="mb-6">
              Al utilizar nuestros servicios y plataforma, usted reconoce y acepta el Aviso de Privacidad vigente y autoriza el tratamiento de sus datos conforme a las finalidades ahí descritas.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Protección de Información</h2>
            <p className="mb-6">
              A8Visas implementa medidas de seguridad administrativas, técnicas y físicas para proteger la información, sin garantizar su invulnerabilidad absoluta ante casos fortuitos o de fuerza mayor.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Derechos del Usuario</h2>
            <p className="mb-6">
              Usted puede ejercer en todo momento sus derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO) a través de los canales indicados en el Aviso de Privacidad.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Confidencialidad</h2>
            <p className="mb-6">
              La información proporcionada y mostrada en nuestros servicios es de uso específico para el trámite de visa y puede estar sujeta a confidencialidad. Queda prohibida su divulgación no autorizada.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Servicios Prestados</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Asesoría para el llenado del formulario DS-160</li>
              <li>Orientación sobre procesos consulares</li>
              <li>Preparación para entrevistas de visa</li>
              <li>Seguimiento del proceso de solicitud</li>
              <li>Comunicación con el cliente durante el proceso</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitación de Responsabilidad</h2>
            <p className="mb-6">
              A8Visas actúa como asesor y facilitador en el proceso de solicitud de visa. La aprobación o negación de la visa es decisión exclusiva de las autoridades consulares correspondientes. Nuestros servicios no garantizan la aprobación de la visa.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Actualizaciones</h2>
            <p className="mb-6">
              A8Visas podrá actualizar estos términos y el Aviso de Privacidad; el uso continuado de nuestros servicios implica su aceptación de dichas actualizaciones.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Prevalencia</h2>
            <p className="mb-6">
              En caso de discrepancia entre estos términos y el Aviso de Privacidad, prevalecerá lo establecido en el Aviso de Privacidad.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Jurisdicción</h2>
            <p className="mb-6">
              Para la interpretación y cumplimiento de estos términos, las partes se someten a la jurisdicción de los tribunales competentes en México.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contacto</h2>
            <p className="mb-6">
              Para cualquier duda sobre estos términos de servicio, puede contactarnos a través de los medios disponibles en nuestro sitio web.
            </p>

            <div className="bg-accent-50 border border-accent-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-accent-800 mb-2">Importante</h3>
              <p className="text-accent-700">
                Estos términos entran en vigor desde el momento en que usted utiliza nuestros servicios. 
                Si no está de acuerdo con algún punto, le recomendamos no utilizar nuestros servicios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}