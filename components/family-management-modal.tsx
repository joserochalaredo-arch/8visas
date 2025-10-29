'use client'

import React, { useState } from 'react'
import { X, Users, Plus, UserPlus, Copy, Check } from 'lucide-react'

interface FamilyMember {
  name: string
  role: 'spouse' | 'child' | 'parent' | 'other'
  token?: string
}

interface FamilyManagementModalProps {
  isOpen: boolean
  onClose: () => void
  clientName: string
  clientToken: string
  onCreateFamily: (familyName: string, members: Omit<FamilyMember, 'token'>[]) => Promise<FamilyMember[]>
}

const roleLabels = {
  spouse: 'Cónyuge',
  child: 'Hijo/a',
  parent: 'Padre/Madre',
  other: 'Otro familiar'
}

export default function FamilyManagementModal({
  isOpen,
  onClose,
  clientName,
  clientToken,
  onCreateFamily
}: FamilyManagementModalProps) {
  const [step, setStep] = useState<'ask' | 'create' | 'success'>('ask')
  const [familyName, setFamilyName] = useState('')
  const [familyMembers, setFamilyMembers] = useState<Omit<FamilyMember, 'token'>[]>([])
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberRole, setNewMemberRole] = useState<'spouse' | 'child' | 'parent' | 'other'>('spouse')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generatedMembers, setGeneratedMembers] = useState<FamilyMember[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleAddMember = () => {
    if (!newMemberName.trim()) return

    const newMember = {
      name: newMemberName.trim(),
      role: newMemberRole
    }

    setFamilyMembers([...familyMembers, newMember])
    setNewMemberName('')
    setNewMemberRole('spouse')
  }

  const handleRemoveMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index))
  }

  const handleCreateFamily = async () => {
    if (!familyName.trim() || familyMembers.length === 0) return

    setIsSubmitting(true)
    try {
      const createdMembers = await onCreateFamily(familyName.trim(), familyMembers)
      
      // Guardar los miembros creados con sus tokens
      setGeneratedMembers(createdMembers)
      setStep('success')
    } catch (error) {
      console.error('Error creando familia:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (error) {
      console.error('Error copiando al portapapeles:', error)
    }
  }

  const handleClose = () => {
    setStep('ask')
    setFamilyName('')
    setFamilyMembers([])
    setNewMemberName('')
    setNewMemberRole('spouse')
    setGeneratedMembers([])
    setCopiedIndex(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Gestión Familiar
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'ask' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>{clientName}</strong> ha sido registrado exitosamente.
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  ¿Desea agregar familiares que también necesiten visa?
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  No, solo este cliente
                </button>
                <button
                  onClick={() => setStep('create')}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Sí, agregar familiares
                </button>
              </div>
            </div>
          )}

          {step === 'create' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Grupo Familiar
                </label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Ej: Familia González"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Familiares a agregar</h3>
                
                <div className="space-y-3 mb-4">
                  {familyMembers.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{member.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({roleLabels[member.role]})</span>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del familiar
                      </label>
                      <input
                        type="text"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="Nombre completo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parentesco
                      </label>
                      <select
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="spouse">Cónyuge</option>
                        <option value="child">Hijo/a</option>
                        <option value="parent">Padre/Madre</option>
                        <option value="other">Otro familiar</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleAddMember}
                    disabled={!newMemberName.trim()}
                    className="w-full px-3 py-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Familiar
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateFamily}
                  disabled={!familyName.trim() || familyMembers.length === 0 || isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>Creando...</>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      Crear Grupo Familiar
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2">¡Grupo familiar creado exitosamente!</h3>
                <p className="text-sm text-green-700">
                  Los familiares han sido registrados en el sistema y aparecerán agrupados en el dashboard.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-3">Enlaces individuales para formularios DS-160:</h4>
                <div className="space-y-3">
                  {generatedMembers.map((member, index) => (
                    <div key={index} className="bg-white rounded border p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-600">{roleLabels[member.role]}</p>
                          <p className="text-xs text-gray-500 font-mono">Token: {member.token}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(`${window.location.origin}/form/single-page?token=${member.token}`, index)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
                        >
                          {copiedIndex === index ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedIndex === index ? 'Copiado' : 'Copiar enlace'}
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-600 break-all">
                          {window.location.origin}/form/single-page?token={member.token}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>✅ Formularios Individuales:</strong> Cada familiar tiene su propio formulario DS-160 independiente 
                  con su token único. No habrá información compartida o autocompletada entre familiares.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                >
                  Finalizar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}