'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Person } from '@/interfaces/products'
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function PayCustomersModal({ onAdd, onClose, open, person }: { onAdd: (data: any) => void; open: boolean; onClose: () => void; person: Person | null }) {
  const [concept, setConcept] = useState('Abono')
  const [amount, setAmount] = useState<number>(0)
  const [error, setError] = useState('')
  const [currency, setCurrency] = useState<'COP' | 'USD'>('COP')
  const [currentBalance, setCurrentBalance] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const queryClient = useQueryClient()

  // Calcular saldo actual cuando cambia la persona
  useEffect(() => {
    if (person) {
      const balance = (person.movements || []).reduce((s, m) => s + m.amount, 0)
      setCurrentBalance(balance)
    } else {
      setCurrentBalance(0)
    }
  }, [person])

  const validateAmount = (value: number) => {
    const numValue = Number(value)

    if (isNaN(numValue)) {
      setError('Ingrese un número válido')
      return false
    }

    if (numValue <= 0) {
      setError('El monto debe ser mayor a cero')
      return false
    }

    if (numValue > currentBalance) {
      setError(`No puede abonar más de $${currentBalance.toFixed(2)}`)
      return false
    }

    setError('')
    return true
  }

  const [displayValue, setDisplayValue] = useState('')

  useEffect(() => {
    // Reset display value when amount is reset externally (e.g. after pay)
    if (amount === 0 && displayValue !== '') {
      setDisplayValue('')
    }
  }, [amount])

  const formatCurrency = (value: string) => {
    // Eliminar todo lo que no sea número o coma
    let cleanValue = value.replace(/[^0-9,]/g, '')

    // Asegurar solo una coma
    const parts = cleanValue.split(',')
    if (parts.length > 2) {
      cleanValue = parts[0] + ',' + parts.slice(1).join('')
    }

    if (cleanValue === '') return ''

    // Separar parte entera y decimal
    const [integerPart, decimalPart] = cleanValue.split(',')

    // Formatear parte entera con puntos de mil
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

    // Retornar resultado
    return decimalPart !== undefined ? `${formattedInteger},${decimalPart}` : formattedInteger
  }

  const parseCurrency = (value: string): number => {
    if (!value) return 0
    // Reemplazar puntos por nada y coma por punto para convertir a número JS
    const cleanValue = value.replace(/\./g, '').replace(',', '.')
    return parseFloat(cleanValue)
  }

  const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Validar caracteres permitidos (números y coma)
    if (!/^[\d.,]*$/.test(inputValue)) return

    // Prevenir más de una coma
    if ((inputValue.match(/,/g) || []).length > 1) return

    // Permitir borrar todo
    if (inputValue === '') {
      setDisplayValue('')
      setAmount(0)
      setError('')
      return
    }

    // Manejar el input crudo para permitir escribir la coma libremente
    // Solo formateamos visualmente si no termina en coma para no interrumpir la escritura
    const rawValue = inputValue.replace(/\./g, '') // Eliminar puntos existentes para reformatear
    const formatted = formatCurrency(rawValue)

    setDisplayValue(formatted)

    const numericValue = parseCurrency(formatted)
    setAmount(numericValue)
    validateAmount(numericValue)
  }

  const formatNumber = (value: number) => {
    if (value === null || value === undefined || Number.isNaN(value)) return ''
    return new Intl.NumberFormat(currency === 'COP' ? 'es-CO' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value)
  }

  // Si no hay persona, no mostrar el modal
  if (!person) return null

  const handlePay = async () => {
    if (!person) return
    if (!validateAmount(amount)) return

    const paymentAmount = -Math.abs(amount) // pago como valor negativo
    const newMovement = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      concept,
      amount: paymentAmount,
    }

    const updatedMovements = [...(person.movements || []), newMovement]

    try {
      setIsSubmitting(true)
      const res = await fetch(`http://localhost:3000/customers/${person.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movements: updatedMovements }),
      })

      if (!res.ok) {
        throw new Error('Error al actualizar el cliente en el servidor')
      }

      // invalidar cache para que TableCustomers vuelva a pedir los datos actualizados
      await queryClient.invalidateQueries({ queryKey: ['persons'] })

      // opcional: ejecutar callback pasado desde el padre
      try {
        onAdd && onAdd(newMovement)
      } catch (e) {
        // ignore
      }

      // reset y cerrar
      setAmount(0)
      setConcept('Abono')
      setError('')
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Error al procesar el pago')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='bg-white'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold'>Abonar a Deuda</DialogTitle>
          <p className='text-sm text-gray-600 mt-1'>
            Cliente: <span className='font-semibold'>{person.name}</span>
          </p>
          <p className={`text-lg font-bold ${currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>Saldo actual: ${formatNumber(currentBalance)}</p>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Monto a abonar</label>
            <div className='relative'>
              <span className='absolute left-3 top-2 text-gray-500'>$</span>
              <input type='text' placeholder='0' value={displayValue} onChange={handleDisplayChange} className='w-full border p-2 pl-8 rounded-md' disabled={isSubmitting} />
            </div>
            {error && <p className='text-red-600 text-sm mt-1'>{error}</p>}
            <p className='text-sm text-gray-500 mt-1'>Máximo permitido: ${formatNumber(currentBalance)}</p>
          </div>

          {amount && !error && (
            <div className='bg-blue-50 p-3 rounded-md'>
              <p className='text-sm'>
                <span className='font-semibold'>Nuevo saldo:</span>
                <span className={`ml-2 font-bold ${currentBalance - Number(amount) > 0 ? 'text-red-600' : 'text-green-600'}`}>${(currentBalance - Number(amount)).toFixed(2)}</span>
              </p>
              {Math.abs(currentBalance - Number(amount)) < 0.0001 && <p className='text-green-600 font-semibold text-sm mt-1'>✓ La deuda quedará completamente saldada</p>}
            </div>
          )}
        </div>

        <DialogFooter>
          <button className='cursor-pointer bg-slate-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-slate-700' onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button className='w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-700' onClick={handlePay} disabled={isSubmitting || amount <= 0 || amount > currentBalance}>
            {isSubmitting ? 'Procesando...' : 'Pagar deuda'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
