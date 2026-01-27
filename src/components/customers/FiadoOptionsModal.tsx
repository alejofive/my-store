'use client'

import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import * as Dialog from '@radix-ui/react-dialog'
// Importando el tipo Product del componente SidebarTotal para mantener consistencia
type Product = {
  id: string | number
  name?: string
  price?: number
  stock?: number
  image?: string
  urlImage?: string
  quantity?: number
  details?: any
}

interface FiadoOptionsModalProps {
  open: boolean
  onClose: () => void
  productList: Product[]
  onNewCustomer: () => void
  onExistingCustomer: () => void
  onResetCustomer: () => void
}

export function FiadoOptionsModal({ open, onClose, productList, onNewCustomer, onExistingCustomer, onResetCustomer }: FiadoOptionsModalProps) {
  const formatPrice = (value: any) => {
    return value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') ?? ''
  }

  const totalAmount = productList.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 1), 0)

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 bg-black/50 backdrop-blur-sm z-40' />
        <Dialog.Content className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-50 w-[500px] max-w-[90vw]'>
          <Dialog.Title className='text-2xl font-bold text-slate-900 mb-4'>Seleccionar tipo de fiado</Dialog.Title>

          {/* Resumen de productos */}
          {productList.length > 0 && (
            <div className='mb-6 p-4 bg-slate-50 rounded-lg'>
              <p className='text-sm text-slate-600 mb-2'>Resumen del fiado:</p>
              <div className='flex justify-between items-center'>
                <span className='text-sm'>
                  {productList.length} producto{productList.length !== 1 ? 's' : ''}
                </span>
                <span className='text-lg font-bold text-slate-900'>${formatPrice(totalAmount)}</span>
              </div>
            </div>
          )}

          <div className='space-y-3'>
            <button onClick={onNewCustomer} className='w-full flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 rounded-lg transition-colors duration-200 text-left'>
              <AddIcon className='text-green-600' />
              <div>
                <div className='font-semibold'>Crear nueva deuda</div>
                <div className='text-sm text-green-700'>Para un nuevo cliente</div>
              </div>
            </button>

            <button onClick={onExistingCustomer} className='w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg transition-colors duration-200 text-left'>
              <EditIcon className='text-blue-600' />
              <div>
                <div className='font-semibold'>Añadir a cliente existente</div>
                <div className='text-sm text-blue-700'>Agregar más productos a una deuda existente</div>
              </div>
            </button>

            <button onClick={onResetCustomer} className='w-full flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-lg transition-colors duration-200 text-left'>
              <RestartAltIcon className='text-orange-600' />
              <div>
                <div className='font-semibold'>Reiniciar deuda</div>
                <div className='text-sm text-orange-700'>Para un cliente que ya pagó</div>
              </div>
            </button>
          </div>

          <div className='mt-6 flex justify-end'>
            <button onClick={onClose} className='px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors'>
              Cancelar
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
