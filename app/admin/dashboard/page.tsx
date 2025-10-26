'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminStore } from '@/store/admin-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlusIcon, EyeIcon, TrashIcon, UserIcon, MailIcon, PhoneIcon, CalendarIcon, ActivityIcon, ArrowRightIcon, CheckCircleIcon, PlayIcon, PauseIcon, LogOutIcon } from 'lucide-react'
import { PaymentStatusSelector } from '@/components/payment-status-selector'
import { PDFGenerator } from '@/components/pdf-generator'
import Image from 'next/image'

export default function AdminDashboard() {
  const [newClientName, setNewClientName] = useState('')
  const [newClientEmail, setNewClientEmail] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [newClientComments, setNewClientComments] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showWhoFillsModal, setShowWhoFillsModal] = useState(false)
  const [pendingClientData, setPendingClientData] = useState({ name: '', email: '', phone: '', comments: '' })
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5) // Mostrar 5 clientes por página
  
  const { 
    isAdminAuthenticated, 
    adminLogout, 
    generateClientToken, 
    getAllClients, 
    deactivateToken, 
    activateToken, 
    deleteClient,
    updatePaymentStatus,
    markFormAsCompleted,
    updateFormStatus
  } = useAdminStore()
  
  const router = useRouter()
  const allClients = getAllClients()
  
  // Lógica de paginación
  const totalPages = Math.ceil(allClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const clients = allClients.slice(startIndex, endIndex)

  // Ya no verificamos autenticación adicional
  // El acceso está controlado por el modal del homepage

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault()
    // Guardar los datos del cliente y mostrar modal de selección
    setPendingClientData({
      name: newClientName,
      email: newClientEmail,
      phone: newClientPhone,
      comments: newClientComments
    })
    setShowWhoFillsModal(true)
    setShowCreateForm(false)
  }

  const handleAdminFillsForm = () => {
    // El admin llenará el formulario - generar token y abrir formulario
    const token = generateClientToken(pendingClientData.name, pendingClientData.email, pendingClientData.phone)
    setShowWhoFillsModal(false)
    // Limpiar formulario
    setNewClientName('')
    setNewClientEmail('')
    setNewClientPhone('')
    setNewClientComments('')
    setPendingClientData({ name: '', email: '', phone: '', comments: '' })
    // Redirigir al formulario con el token
    router.push(`/form/step-1?token=${token}`)
  }

  const handleClientFillsForm = () => {
    // El cliente llenará el formulario - generar token y mostrar link
    const token = generateClientToken(pendingClientData.name, pendingClientData.email, pendingClientData.phone)
    const clientLink = `${window.location.origin}/form/step-1?token=${token}`
    
    setShowWhoFillsModal(false)
    // Limpiar formulario
    setNewClientName('')
    setNewClientEmail('')
    setNewClientPhone('')
    setNewClientComments('')
    setPendingClientData({ name: '', email: '', phone: '', comments: '' })
    
    // Mostrar el link al admin
    alert(`Link generado para ${pendingClientData.name}:\n\n${clientLink}\n\nComparte este link con el cliente para que llene su formulario DS-160.`)
  }

  const handleLogout = () => {
    adminLogout()
    router.push('/')
  }

  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'bg-gray-200'
    if (progress < 30) return 'bg-red-500'
    if (progress < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">A8Visas - Panel de Administración</h1>
                <p className="text-gray-600">Gestiona tokens y monitorea el progreso de los clientes</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {allClients.length} cliente{allClients.length !== 1 ? 's' : ''} total
                {allClients.length > itemsPerPage && (
                  <span className="text-gray-400 ml-2">
                    (Mostrando {startIndex + 1}-{Math.min(endIndex, allClients.length)} de {allClients.length})
                  </span>
                )}
              </span>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Crear nuevo formulario */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Comenzar Formulario</h2>
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Comenzar Formulario
            </Button>
          </div>
          
          {showCreateForm && (
            <form onSubmit={handleCreateClient} className="space-y-4 mt-6 p-6 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Nombre completo"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  required
                />
                <Input
                  type="tel"
                  placeholder="Teléfono"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  required
                />
              </div>
              <div className="w-full">
                <Input
                  placeholder="Comentarios iniciales (opcional)"
                  value={newClientComments}
                  onChange={(e) => setNewClientComments(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="bg-green-600 hover:bg-green-700 px-8">
                  Comenzar Trámite
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Lista de clientes */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Clientes y Tokens</h2>
          </div>
          
          {allClients.length === 0 ? (
            <div className="p-12 text-center">
              <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clientes registrados</h3>
              <p className="text-gray-600">Genera el primer token para comenzar</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Token
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progreso
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado Pago
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado Form.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actividad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr key={client.token} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {client.clientName}
                            </span>
                          </div>
                          <div className="flex items-center mt-1">
                            <MailIcon className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-600 truncate max-w-[120px]">{client.clientEmail}</span>
                          </div>
                          {client.clientPhone && (
                            <div className="flex items-center mt-1">
                              <PhoneIcon className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-600">{client.clientPhone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {client.token}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(client.formProgress)}`}
                              style={{ width: `${client.formProgress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">
                            {client.formProgress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <PaymentStatusSelector
                          currentStatus={client.paymentStatus || 'pending'}
                          onStatusChange={(status) => updatePaymentStatus(client.token, status)}
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {client.formProgress >= 100 ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Completado
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            En progreso
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ActivityIcon className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-600">
                            {formatDate(client.lastActivity)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/admin/client/${client.token}`)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs px-2 py-1"
                            >
                              <EyeIcon className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                            
                            {client.formProgress > 0 && client.formProgress < 100 && (
                              <Button
                                size="sm"
                                onClick={() => router.push(`/form/step-1?token=${client.token}`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1"
                              >
                                <ArrowRightIcon className="h-3 w-3 mr-1" />
                                Continuar
                              </Button>
                            )}
                            
                            {client.formProgress >= 100 && (
                              <PDFGenerator 
                                client={client}
                                onGenerated={() => console.log('PDF generado para', client.clientName)}
                              />
                            )}
                          </div>
                          
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant={client.isActive ? "outline" : "secondary"}
                              onClick={() => client.isActive ? deactivateToken(client.token) : activateToken(client.token)}
                              className={`text-xs px-2 py-1 ${client.isActive 
                                ? "text-orange-600 border-orange-200 hover:bg-orange-50" 
                                : "text-green-600 border-green-200 hover:bg-green-50"
                              }`}
                            >
                              {client.isActive ? (
                                <>
                                  <PauseIcon className="h-3 w-3 mr-1" />
                                  Pausar
                                </>
                              ) : (
                                <>
                                  <PlayIcon className="h-3 w-3 mr-1" />
                                  Activar
                                </>
                              )}
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteClient(client.token)}
                              className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-2 py-1"
                            >
                              <TrashIcon className="h-3 w-3 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Controles de paginación */}
            {allClients.length > itemsPerPage && (
              <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-700">
                  Página {currentPage} de {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Anterior
                  </Button>
                  
                  {/* Números de página */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          variant={currentPage === pageNumber ? "primary" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </div>

      {/* Modal: ¿Quién llenará el formulario? */}
      {showWhoFillsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Quién llenará el formulario?</h2>
              <p className="text-gray-600">
                Cliente: <strong>{pendingClientData.name}</strong>
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Opción: Admin llena el formulario */}
              <div 
                onClick={handleAdminFillsForm}
                className="w-full p-6 border-2 border-blue-200 rounded-xl cursor-pointer transition-all duration-300 hover:border-blue-400 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-r from-blue-50 to-indigo-50 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 group-hover:text-blue-800">
                      Yo llenaré el formulario
                    </h3>
                    <p className="text-sm text-blue-700 mt-1 opacity-90">
                      Se abrirá el formulario para que lo completes inmediatamente
                    </p>
                  </div>
                  <div className="text-blue-400 group-hover:text-blue-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Opción: Cliente llena el formulario */}
              <div 
                onClick={handleClientFillsForm}
                className="w-full p-6 border-2 border-green-200 rounded-xl cursor-pointer transition-all duration-300 hover:border-green-400 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-r from-green-50 to-emerald-50 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center group-hover:bg-green-700 transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 group-hover:text-green-800">
                      El cliente llenará el formulario
                    </h3>
                    <p className="text-sm text-green-700 mt-1 opacity-90">
                      Se generará un link único para enviar al cliente
                    </p>
                  </div>
                  <div className="text-green-400 group-hover:text-green-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowWhoFillsModal(false)
                  setShowCreateForm(true)
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Regresar al formulario</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}