import { Person } from '@/interfaces/products'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { EditCustomersModal } from './customers/EditCustomers'
import { PayCustomersModal } from './customers/payCustomers'
import { CustomerRow } from './CustomerRow'

const TableCustomers = () => {
  const queryClient = useQueryClient()
  const [openPersonId, setOpenPersonId] = useState<string | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [openModalPay, setOpenModalPay] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)

  // State for editing (reusing logic: if null -> create mode, if person -> edit mode)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)

  const togglePerson = (id: string) => {
    setOpenPersonId(prev => (prev === id ? null : id))
  }

  const {
    data: people = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Person[]>({
    queryKey: ['persons'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/customers')
      return res.json()
    },
  })

  const handleOpenPayModal = (person: Person) => {
    setSelectedPerson(person)
    setOpenModalPay(true)
  }

  const handleClosePayModal = () => {
    setOpenModalPay(false)
    setSelectedPerson(null)
  }

  const handleCreate = () => {
    setEditingPerson(null)
    setOpenModal(true)
  }

  const handleEdit = (person: Person) => {
    setEditingPerson(person)
    setOpenModal(true)
  }

  const handleReset = (person: Person) => {
    // Open modal with person data but NO movements (start fresh)
    const resetPerson = { ...person, movements: [] }
    setEditingPerson(resetPerson)
    setOpenModal(true)
  }

  const handlePayAll = async (person: Person) => {
    // Calculate saldo
    const movements = person.movements
    const saldo = movements.reduce((s, m) => s + m.amount, 0)

    if (saldo <= 0) return

    // Process products from movements to update stock and profits
    for (const movement of movements) {
      if (movement.amount > 0 && movement.products) {
        for (const product of movement.products) {
          try {
            // Get current product data
            const productRes = await fetch(`http://localhost:3000/products/${product.id}`)
            if (!productRes.ok) continue
            
            const currentProduct = await productRes.json()
            const details = currentProduct.details ?? {}
            
            const qty = Number(product.quantity || 1)
            const currentStock = Number(currentProduct.stock ?? 0)
            const newStock = Math.max(0, currentStock - qty)
            const currentSold = Number(details.sold ?? 0)
            const sold = currentSold + qty

            // Calculate profit per unit
            const profitPerUnit = typeof details.profitPerUnit === 'number' 
              ? details.profitPerUnit 
              : Number(currentProduct.price ?? 0) - Number(details.basePrice ?? 0)

            const addedProfit = (profitPerUnit || 0) * qty
            const totalProfit = Number(details.totalProfit ?? 0) + addedProfit

            const payload = {
              name: currentProduct.name,
              price: currentProduct.price,
              stock: newStock,
              image: currentProduct.image,
              urlImage: currentProduct.urlImage,
              details: {
                ...details,
                sold,
                totalProfit,
              },
            }

            // Update product with new profit and sold data
            await fetch(`http://localhost:3000/products/${product.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
          } catch (error) {
            console.error('Error updating product:', error)
          }
        }
      }
    }

    // Invalidate products queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['product'] })

    const updatedMovements = [
      ...person.movements,
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        concept: 'Pago total',
        amount: -saldo
      }
    ]

    try {
      const res = await fetch(`http://localhost:3000/customers/${person.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: person.name,
          movements: updatedMovements
        }),
      })

      if (!res.ok) throw new Error('Error pagando deuda')

      refetch()
    } catch (error) {
      console.error(error)
      alert('Error al pagar la deuda completa')
    }
  }

  if (isLoading) return <p>Cargando personas...</p>
  if (error) return <p>Error al cargar personas</p>

  return (
    <div>
      <div className='mt-5 px-5 w-full flex justify-between'>
        <div className=''></div>
        <div className='relative'>
          <input type='text' placeholder='Buscar productos...' className='w-2xs py-2 px-4 pl-10 rounded-md border border-slate-200 bg-white shadow-sm focus:outline-none' />
          <SearchIcon className='absolute left-3 top-[10px] text-slate-400' />
        </div>

        <button onClick={handleCreate} className='cursor-pointer bg-slate-900 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 hover:bg-slate-800 transition'>
          Create <AddIcon />
        </button>
      </div>

      <div className='max-w-4xl mx-auto mt-10 bg-white rounded-md border border-slate-200'>
        <table className='w-full border-collapse'>
          <thead className='bg-slate-100 text-slate-700 text-sm'>
            <tr>
              <th className='w-10'></th>
              <th className='text-left p-3'>Persona</th>
              <th className='text-right p-3'>Debe</th>
              <th className='text-right p-3'>Abonado</th>
              <th className='text-right p-3'>Saldo</th>
              <th className='text-right p-3'>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {people.map(person => (
              <CustomerRow
                key={person.id}
                person={person}
                isOpen={openPersonId === person.id}
                togglePerson={togglePerson}
                onPay={handleOpenPayModal}
                onUpdate={() => refetch()}
                onEdit={handleEdit}
                onReset={handleReset}
                onPayAll={handlePayAll}
              />
            ))}
          </tbody>
        </table>
      </div>

      <EditCustomersModal
        onAdd={() => { }}
        open={openModal}
        onClose={() => setOpenModal(false)}
        person={editingPerson}
      />
      <PayCustomersModal onAdd={() => { }} open={openModalPay} onClose={handleClosePayModal} person={selectedPerson} />
    </div>
  )
}

export default TableCustomers
