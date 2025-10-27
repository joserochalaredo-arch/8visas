'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react'

interface PaymentStatusSelectorProps {
  currentStatus: 'pending' | 'paid' | 'partial' | 'cancelled'
  onStatusChange: (status: 'pending' | 'paid' | 'partial' | 'cancelled') => void
  disabled?: boolean
}

export function PaymentStatusSelector({ 
  currentStatus, 
  onStatusChange, 
  disabled = false 
}: PaymentStatusSelectorProps) {
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'partial':
        return <DollarSign className="h-4 w-4 text-blue-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Pagado</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'partial':
        return <Badge className="bg-blue-100 text-blue-800">Parcial</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      default:
        return <Badge variant="outline">Sin estado</Badge>
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pagado'
      case 'pending':
        return 'Pendiente'
      case 'partial':
        return 'Parcial'
      case 'cancelled':
        return 'Cancelado'
      default:
        return 'Sin estado'
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {disabled ? (
        // Modo solo lectura
        <div className="flex items-center space-x-2">
          {getStatusIcon(currentStatus)}
          {getStatusBadge(currentStatus)}
        </div>
      ) : (
        // Modo editable
        <>
          <Select value={currentStatus} onValueChange={(value) => onStatusChange(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Estado de pago">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(currentStatus)}
                  <span className="text-sm">{getStatusLabel(currentStatus)}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span>Pendiente</span>
                </div>
              </SelectItem>
              <SelectItem value="paid">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Pagado</span>
                </div>
              </SelectItem>
              <SelectItem value="partial">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span>Parcial</span>
                </div>
              </SelectItem>
              <SelectItem value="cancelled">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Cancelado</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  )
}