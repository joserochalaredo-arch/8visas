'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

export function WhatsappFloat() {
  const [isOpen, setIsOpen] = useState(false)
  
  const whatsappNumber = "+528671433987"
  const message = "¡Tienes dudas? ¡Contáctanos! Necesito ayuda con mi formulario DS-160"
  
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }
  
  return (
    <div className="fixed right-6 bottom-6 z-50">
      {/* Botón principal de WhatsApp */}
      <button
        onClick={handleWhatsAppClick}
        className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
        
        {/* Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          ¿Tienes dudas? ¡Contáctanos!
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
        </div>
      </button>
      
      {/* Pulso animado */}
      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
    </div>
  )
}