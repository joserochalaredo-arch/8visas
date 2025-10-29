'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  type: NotificationType
  title: string
  message: string
  autoClose?: boolean
  autoCloseDelay?: number
  showIcon?: boolean
  className?: string
}

export function NotificationModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  autoClose = false,
  autoCloseDelay = 3000,
  showIcon = true,
  className = ''
}: NotificationModalProps) {
  
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose])

  if (!isOpen) return null

  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-600" />,
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        }
      case 'error':
        return {
          icon: <XCircle className="h-8 w-8 text-red-600" />,
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-yellow-600" />,
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
        }
      case 'info':
      default:
        return {
          icon: <Info className="h-8 w-8 text-blue-600" />,
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        }
    }
  }

  const { icon, bgColor, borderColor, titleColor, messageColor, buttonColor } = getIconAndColors()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div className={`bg-white rounded-lg max-w-md w-full mx-4 shadow-xl transform transition-all ${className}`}>
        {/* Header con icono y botón cerrar */}
        <div className="flex justify-between items-start p-6 pb-4">
          <div className="flex items-center space-x-3">
            {showIcon && (
              <div className={`flex-shrink-0 w-12 h-12 ${bgColor} ${borderColor} border rounded-full flex items-center justify-center`}>
                {icon}
              </div>
            )}
            <div>
              <h3 className={`text-lg font-semibold ${titleColor}`}>
                {title}
              </h3>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido del mensaje */}
        <div className="px-6 pb-4">
          <p className={`text-sm ${messageColor} whitespace-pre-line leading-relaxed`}>
            {message}
          </p>
        </div>

        {/* Botón de acción */}
        <div className="px-6 pb-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-white text-sm font-medium rounded-md ${buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors`}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook personalizado para facilitar el uso
export function useNotificationModal() {
  const [notification, setNotification] = useState<{
    isOpen: boolean
    type: NotificationType
    title: string
    message: string
    autoClose?: boolean
    autoCloseDelay?: number
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    autoClose: false,
    autoCloseDelay: 3000
  })

  const showNotification = (
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      autoClose?: boolean
      autoCloseDelay?: number
    }
  ) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message,
      autoClose: options?.autoClose || false,
      autoCloseDelay: options?.autoCloseDelay || 3000
    })
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }))
  }

  // Métodos de conveniencia
  const showSuccess = (title: string, message: string, autoClose = true) => {
    showNotification('success', title, message, { autoClose, autoCloseDelay: 2000 })
  }

  const showError = (title: string, message: string) => {
    showNotification('error', title, message, { autoClose: false })
  }

  const showWarning = (title: string, message: string) => {
    showNotification('warning', title, message, { autoClose: false })
  }

  const showInfo = (title: string, message: string, autoClose = false) => {
    showNotification('info', title, message, { autoClose })
  }

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    NotificationModal: () => (
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        autoClose={notification.autoClose}
        autoCloseDelay={notification.autoCloseDelay}
      />
    )
  }
}