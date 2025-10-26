'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useAdminStore } from '@/store/admin-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TextArea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Phone, 
  MessageSquare, 
  Calendar,
  Clock,
  Save,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface ClientInfoPanelProps {
  showComments?: boolean
  showProgress?: boolean
  currentStep?: number
}

export function ClientInfoPanel({ 
  showComments = true, 
  showProgress = true,
  currentStep = 1 
}: ClientInfoPanelProps) {
  const { userToken } = useAuthStore()
  const { getClientByToken, updateClientProgress } = useAdminStore()
  
  const [client, setClient] = useState<any>(null)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<string[]>([])
  const [isAddingComment, setIsAddingComment] = useState(false)

  useEffect(() => {
    if (userToken) {
      const clientData = getClientByToken(userToken)
      setClient(clientData)
      
      // Cargar comentarios existentes desde localStorage
      const savedComments = localStorage.getItem(`comments_${userToken}`)
      if (savedComments) {
        setComments(JSON.parse(savedComments))
      }
    }
  }, [userToken, getClientByToken])

  const handleAddComment = () => {
    if (newComment.trim() && client) {
      const timestamp = new Date().toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      const commentWithTimestamp = `[${timestamp}] ${newComment.trim()}`
      const updatedComments = [...comments, commentWithTimestamp]
      
      setComments(updatedComments)
      localStorage.setItem(`comments_${userToken}`, JSON.stringify(updatedComments))
      setNewComment('')
      setIsAddingComment(false)
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500'
    if (progress >= 70) return 'bg-blue-500'
    if (progress >= 40) return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  const getStatusBadge = (progress: number) => {
    if (progress >= 100) return <Badge className="bg-green-100 text-green-800">Completado</Badge>
    if (progress >= 70) return <Badge className="bg-blue-100 text-blue-800">En progreso avanzado</Badge>
    if (progress >= 40) return <Badge className="bg-yellow-100 text-yellow-800">En progreso</Badge>
    if (progress > 0) return <Badge className="bg-orange-100 text-orange-800">Iniciado</Badge>
    return <Badge variant="outline">Pendiente</Badge>
  }

  if (!client) {
    return (
      <Card className="mb-6 border-l-4 border-l-primary-500">
        <CardContent className="p-4">
          <div className="flex items-center text-gray-500">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">Cargando información del cliente...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const progress = client.formProgress || 0

  return (
    <Card className="mb-6 border-l-4 border-l-primary-500 shadow-sm">
      <CardContent className="p-6">
        {/* Header del cliente */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{client.clientName}</h3>
              <p className="text-sm text-gray-500">Token: {client.token}</p>
            </div>
          </div>
          {showProgress && getStatusBadge(progress)}
        </div>

        {/* Información de contacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail className="h-4 w-4" />
            <span>{client.clientEmail}</span>
          </div>
          {client.clientPhone && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{client.clientPhone}</span>
            </div>
          )}
        </div>

        {/* Barra de progreso */}
        {showProgress && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progreso del formulario</span>
              <span className="text-sm text-gray-500">Paso {currentStep} de 7</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>{progress.toFixed(0)}%</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Creado: {new Date(client.createdAt).toLocaleDateString('es-ES')}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Última actividad: {new Date(client.lastActivity).toLocaleString('es-ES')}</span>
          </div>
        </div>

        {/* Sección de comentarios */}
        {showComments && (
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comentarios ({comments.length})
              </h4>
              {!isAddingComment && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIsAddingComment(true)}
                >
                  Agregar comentario
                </Button>
              )}
            </div>

            {/* Lista de comentarios */}
            {comments.length > 0 && (
              <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                {comments.map((comment, index) => (
                  <div key={index} className="text-sm bg-gray-50 rounded p-2 border-l-2 border-l-primary-200">
                    {comment}
                  </div>
                ))}
              </div>
            )}

            {/* Formulario para nuevo comentario */}
            {isAddingComment && (
              <div className="space-y-2">
                <TextArea
                  placeholder="Agregar comentario sobre este cliente o el progreso del formulario..."
                  value={newComment}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setIsAddingComment(false)
                      setNewComment('')
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Guardar
                  </Button>
                </div>
              </div>
            )}

            {comments.length === 0 && !isAddingComment && (
              <p className="text-sm text-gray-500 italic">No hay comentarios aún.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}