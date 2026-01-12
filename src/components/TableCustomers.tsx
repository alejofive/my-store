import { Movement, Person } from '@/interfaces/products'
import AddIcon from '@mui/icons-material/Add'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PaidIcon from '@mui/icons-material/Paid'
import SearchIcon from '@mui/icons-material/Search'
import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { CreateCustomersModal } from './customers/createCustomers'
import { PayCustomersModal } from './customers/payCustomers'

const TableCustomers = () => {
  const [openPersonId, setOpenPersonId] = useState<string | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [openModalPay, setOpenModalPay] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)

  const togglePerson = (id: string) => {
    setOpenPersonId(prev => (prev === id ? null : id))
  }

  const {
    data: people = [],
    isLoading,
    error,
  } = useQuery<Person[]>({
    queryKey: ['persons'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/customers')
      return res.json()
    },
  })

  console.log(people)

  const getTotals = (movements: Movement[]) => {
    const totalDebe = movements.filter(m => m.amount > 0).reduce((s, m) => s + m.amount, 0)
    const totalAbono = movements.filter(m => m.amount < 0).reduce((s, m) => s + Math.abs(m.amount), 0)
    const saldo = movements.reduce((s, m) => s + m.amount, 0)

    return { totalDebe, totalAbono, saldo }
  }

  const handleOpenPayModal = (person: Person) => {
    setSelectedPerson(person)
    setOpenModalPay(true)
  }

  const handleClosePayModal = () => {
    setOpenModalPay(false)
    setSelectedPerson(null)
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

        <button onClick={() => setOpenModal(true)} className='cursor-pointer bg-slate-900 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 hover:bg-slate-800 transition'>
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
            {people.map(person => {
              const { totalDebe, totalAbono, saldo } = getTotals(person.movements)
              const isOpen = openPersonId === person.id
              const isPaidOff = saldo === 0 // Determinar si está pagado completamente
              const isPartiallyPaid = saldo > 0 && saldo < totalDebe // Pagado parcialmente

              return (
                <React.Fragment key={person.id}>
                  {/* ROW PERSONA */}
                  <tr className='border-t hover:bg-slate-50 border-slate-300'>
                    <td onClick={() => togglePerson(person.id)} className='text-center text-slate-500 cursor-pointer'>
                      {isOpen ? <ArrowDropDownIcon fontSize='large' /> : <ArrowRightIcon fontSize='large' />}
                    </td>
                    <td className='p-3 font-medium text-slate-900'>{person.name}</td>
                    <td className='p-3 text-right'>${totalDebe.toFixed(2)}</td>
                    <td className='p-3 text-right'>${totalAbono.toFixed(2)}</td>
                    <td className={`p-3 text-right font-semibold ${saldo > 0 ? 'text-red-600' : saldo === 0 ? 'text-green-600' : 'text-blue-600'}`}>${saldo.toFixed(2)}</td>
                    <td className='p-3 flex items-center justify-end gap-2'>
                      <button className='cursor-pointer' onClick={() => handleOpenPayModal(person)} disabled={isPaidOff}>
                        <PaidIcon className='text-green-700' />
                      </button>
                      <button className='cursor-pointer'>
                        <CheckCircleIcon className='text-green-700' />
                      </button>
                    </td>
                  </tr>

                  {/* HISTORIAL */}
                  {isOpen && (
                    <tr className='bg-slate-50 border-t border-slate-300'>
                      <td colSpan={6} className='p-4'>
                        <table className='w-full text-sm'>
                          <thead className='text-slate-500'>
                            <tr>
                              <th className='text-left pb-2'>Fecha</th>
                              <th className='text-left pb-2'>Concepto</th>
                              <th className='text-right pb-2'>+ Debe</th>
                              <th className='text-right pb-2'>- Paga</th>
                            </tr>
                          </thead>
                          <tbody>
                            {person.movements.map(m => (
                              <tr key={m.id} className='border-t border-slate-300'>
                                <td className='py-2'>{m.date}</td>
                                <td className='py-2'>{m.concept}</td>
                                <td className='py-2 text-right text-red-600'>{m.amount > 0 ? `$${m.amount}` : '—'}</td>
                                <td className='py-2 text-right text-green-600'>{m.amount < 0 ? `$${Math.abs(m.amount)}` : '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <CreateCustomersModal onAdd={() => {}} open={openModal} onClose={() => setOpenModal(false)} />
      <PayCustomersModal onAdd={() => {}} open={openModalPay} onClose={handleClosePayModal} person={selectedPerson} />
    </div>
  )
}

export default TableCustomers
