'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Person } from '@/interfaces/products'
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react'

export function CreateCustomersModal({ onAdd, onClose, open }: { onAdd: (data: any) => void; open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [concept, setConcept] = useState('')
  const [amount, setAmount] = useState('')
    const queryClient = useQueryClient()

  const createPerson = async (person: Person) => {
    const res = await fetch('http://localhost:3000/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(person),
    })

    if (!res.ok) throw new Error('Error creando el cliente')

    return res.json()
  }

  const submit = async () => {
    if (!name || !amount) return

    const newPerson: Person = {
      id: crypto.randomUUID(),
      name,
      movements: [
        {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          concept: concept || 'Deuda inicial',
          amount: Number(amount),
        },
      ],
    }

    await createPerson(newPerson)
    onAdd(newPerson)

      queryClient.invalidateQueries({ queryKey: ['persons'] })

    setName('')
    setConcept('')
    setAmount('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='bg-white'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold'>Crear Deuda</DialogTitle>
        </DialogHeader>
        <input placeholder='Persona' value={name} onChange={e => setName(e.target.value)} className='w-full border p-2 rounded' />

        <input placeholder='Concepto' value={concept} onChange={e => setConcept(e.target.value)} className='w-full border p-2 rounded' />

        <input placeholder='Monto' type='number' value={amount} onChange={e => setAmount(e.target.value)} className='w-full border p-2 rounded' />

        <DialogFooter>
          <button className='cursor-pointer bg-slate-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-slate-700' onClick={onClose}>
            Cancelar
          </button>
          <button onClick={submit} className='w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-700'>
            Guardar deuda
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
