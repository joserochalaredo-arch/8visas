'use client'

import { ArrowLeftIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function PrivacyPolicyPage() {
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
                <p className="text-sm text-gray-600">Aviso de Privacidad</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Aviso de Privacidad</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              Su privacidad y confianza son muy importantes para nosotros. Por ello, queremos asegurarnos de que conozca cómo salvaguardamos la integridad, privacidad y protección de sus Datos Personales.
            </p>

            <p className="mb-6">
              Consideramos que, por ser una empresa socialmente responsable, tenemos la obligación legal y social de cumplir con las medidas legales y de seguridad suficientes para proteger aquellos Datos Personales que se hayan recabado para las finalidades que se describen en el presente aviso de privacidad.
            </p>

            <p className="mb-8">
              En cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, su Reglamento y demás normativas aplicables en la materia, se emite el presente Aviso de Privacidad Integral bajo los siguientes términos:
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">I. Identidad y domicilio del responsable</h2>
            <p className="mb-6">
              A8Visas (en adelante, &quot;el Responsable&quot;), empresa dedicada a servicios de asesoría y gestión de trámites de visa, con sede en México, es el responsable del tratamiento, uso y protección de sus datos personales.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">II. Finalidades del tratamiento</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Finalidades primarias</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Identificación y validación de identidad del solicitante</li>
              <li>Gestión de servicios de asesoría para trámites de visa</li>
              <li>Llenado y preparación de formularios DS-160</li>
              <li>Programación y seguimiento de citas consulares</li>
              <li>Comunicación y atención al cliente</li>
              <li>Emisión de comprobantes y control administrativo</li>
              <li>Celebración de contratos de servicios</li>
              <li>Gestión de cuentas por cobrar</li>
              <li>Elaboración de estadísticas internas</li>
              <li>Cumplimiento de obligaciones legales, fiscales y contractuales</li>
              <li>Atención de requerimientos de autoridades administrativas o judiciales</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Finalidades secundarias</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Envío de comunicaciones promocionales sobre servicios relacionados</li>
              <li>Invitaciones a eventos informativos sobre procesos de visa</li>
              <li>Estudios de mercado y encuestas de satisfacción</li>
              <li>Mejora de procesos internos y servicios</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">III. Datos personales tratados</h2>
            <p className="mb-4">Los datos personales que recabamos incluyen:</p>
            <ul className="list-disc pl-6 mb-6 space-y-1">
              <li>Datos de identificación (nombre, apellidos, nacionalidad, país de origen)</li>
              <li>Datos de contacto (teléfono, correo electrónico, domicilio)</li>
              <li>Datos académicos y laborales</li>
              <li>Información de pasaporte y documentos de viaje</li>
              <li>Datos familiares relevantes para el proceso de visa</li>
              <li>Información financiera necesaria para el trámite</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">IV. Transferencias de datos</h2>
            <p className="mb-6">
              Sus datos personales pueden ser transferidos únicamente a autoridades consulares de Estados Unidos y otras entidades gubernamentales cuando sea necesario para completar su trámite de visa, así como a prestadores de servicios que nos auxilian en la prestación de nuestros servicios.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">V. Derechos ARCO</h2>
            <p className="mb-4">
              Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales (Derechos ARCO), así como a revocar el consentimiento otorgado para el tratamiento de los mismos.
            </p>
            <p className="mb-6">
              Para ejercer estos derechos, puede contactarnos a través de WhatsApp o los medios de contacto disponibles en nuestro sitio web.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">VI. Medidas de seguridad</h2>
            <p className="mb-6">
              Implementamos medidas de seguridad administrativas, técnicas y físicas para proteger sus datos personales contra daño, pérdida, alteración, destrucción o uso no autorizado.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">VII. Modificaciones al aviso de privacidad</h2>
            <p className="mb-6">
              Nos reservamos el derecho de modificar el presente aviso de privacidad. Las modificaciones serán comunicadas a través de nuestro sitio web.
            </p>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-primary-800 mb-2">Contacto</h3>
              <p className="text-primary-700">
                Para cualquier duda sobre este aviso de privacidad o el ejercicio de sus derechos ARCO, 
                puede contactarnos a través de WhatsApp o los canales de comunicación disponibles en nuestro sitio web.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}