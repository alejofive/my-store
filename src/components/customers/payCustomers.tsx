'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Person } from '@/interfaces/products';

import { useEffect, useState } from 'react';

export function PayCustomersModal({ onAdd, onClose, open, person }: { onAdd: (data: any) => void; open: boolean; onClose: () => void; person: Person | null }) {
  const [concept, setConcept] = useState('Abono')
  const [amount, setAmount] = useState<number>(0)
  const [error, setError] = useState('')
  const [currency, setCurrency] = useState<'COP' | 'USD'>('COP')
  const [name, setName] = useState('')
  const [currentBalance, setCurrentBalance] = useState(0)

  // Calcular saldo actual cuando cambia la persona
  useEffect(() => {
    if (person) {
      const balance = person.movements.reduce((s, m) => s + m.amount, 0)
      setCurrentBalance(balance)
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)

    setAmount(value)

    if (!Number.isNaN(value)) {
      validateAmount(value)
    }
  }

  const formatNumber = (value: number) => {
    if (value === null || value === undefined || Number.isNaN(value)) return ''
    return new Intl.NumberFormat(currency === 'COP' ? 'es-CO' : 'en-US').format(value)
  }

  // Si no hay persona, no mostrar el modal
  if (!person) return null

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
              <input type='number' placeholder='0.00' value={formatNumber(amount)} onChange={handleAmountChange} className='w-full border p-2 pl-8 rounded-md' min='0' max={currentBalance} step='0.01' />
            </div>
            {error && <p className='text-red-600 text-sm mt-1'>{error}</p>}
            <p className='text-sm text-gray-500 mt-1'>Máximo permitido: ${formatNumber(currentBalance)}</p>
          </div>

          {amount && !error && (
            <div className='bg-blue-50 p-3 rounded-md'>
              <p className='text-sm'>
                <span className='font-semibold'>Nuevo saldo:</span>
                <span className={`ml-2 font-bold ${currentBalance - Number(formatNumber(amount)) > 0 ? 'text-red-600' : 'text-green-600'}`}>${(currentBalance - Number(amount)).toFixed(2)}</span>
              </p>
              {currentBalance - Number(amount) === 0 && <p className='text-green-600 font-semibold text-sm mt-1'>✓ La deuda quedará completamente saldada</p>}
            </div>
          )}
        </div>

        <DialogFooter>
          <button className='cursor-pointer bg-slate-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-slate-700' onClick={onClose}>
            Cancelar
          </button>
          <button className='w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-700'>Pagar deuda</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
