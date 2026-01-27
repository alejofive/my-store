'use client'

import * as Dialog from '@radix-ui/react-dialog'
import SearchIcon from '@mui/icons-material/Search'
import { useQuery } from '@tanstack/react-query'
import { Person } from '@/interfaces/products'
import { useState } from 'react'

interface CustomerSearchModalProps {
  open: boolean
  onClose: () => void
  onSelectCustomer: (customer: Person) => void
  productList: any[]
}

export function CustomerSearchModal({ 
  open, 
  onClose, 
  onSelectCustomer,
  productList 
}: CustomerSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const {
    data: customers = [],
    isLoading,
    error,
  } = useQuery<Person[]>({
    queryKey: ['persons'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/customers')
      return res.json()
    },
    enabled: open,
  })

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const calculateBalance = (customer: Person) => {
    return customer.movements.reduce((sum, m) => sum + m.amount, 0)
  }

  const formatPrice = (value: any) => {
    return value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') ?? ''
  }

  const totalAmount = productList.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 1), 0)

  const handleSelectCustomer = (customer: Person) => {
    onSelectCustomer(customer)
    onClose()
    setSearchTerm('')
  }

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-50 w-[600px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
          <Dialog.Title className="text-2xl font-bold text-slate-900 mb-4">
            Buscar Cliente Existente
          </Dialog.Title>
          
          {/* Resumen de productos */}
          {productList.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Añadiendo <span className="font-semibold">{productList.length}</span> producto{productList.length !== 1 ? 's' : ''} 
                <span className="font-bold ml-2">${formatPrice(totalAmount)}</span>
              </p>
            </div>
          )}

          {/* Búsqueda */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Buscar cliente por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 px-4 pl-10 rounded-md border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <SearchIcon className="absolute left-3 top-[10px] text-slate-400" />
          </div>

          {/* Lista de clientes */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading && (
              <div className="text-center py-8 text-slate-500">
                Cargando clientes...
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-500">
                Error al cargar clientes
              </div>
            )}

            {!isLoading && !error && filteredCustomers.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                {searchTerm ? 'No se encontraron clientes con ese nombre' : 'No hay clientes registrados'}
              </div>
            )}

            {!isLoading && !error && filteredCustomers.map(customer => {
              const balance = calculateBalance(customer)
              return (
                <button
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {customer.name}
                      </div>
                      <div className="text-sm text-slate-600">
                        {customer.movements.length} movimiento{customer.movements.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        balance > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {balance > 0 ? 'Debe' : 'Saldo'}: ${formatPrice(Math.abs(balance))}
                      </div>
                      <div className="text-xs text-slate-500">
                        {customer.typeMony}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}