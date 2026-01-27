'use client'

import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout'
import * as Dialog from '@radix-ui/react-dialog'

import { CustomerSearchModal } from './customers/CustomerSearchModal'
import { EditCustomersModal } from './customers/EditCustomers'
import { FiadoOptionsModal } from './customers/FiadoOptionsModal'
import { ResetDebtModal } from './customers/ResetDebtModal'

export function SelectPayModal({ onClose, open, showCustomerSearchModal, setSelectedCustomer, selectedCustomer, handleProcessTotal, handleFiado, productList, closeView, handleNewCustomer, handleExistingCustomer, handleResetCustomer, handleSelectCustomer, handleSelectResetCustomer, showModal, setShowModal, showFiadoOptionsModal, setShowFiadoOptionsModal, setShowCustomerSearchModal, showCreateCustomerModal, setShowCreateCustomerModal, showEditCustomerModal, setShowEditCustomerModal, showResetDebtModal, setShowResetDebtModal }: { onClose: () => void; open: boolean; handleProcessTotal: () => void; handleFiado: () => void; productList: any[]; closeView: () => void; handleNewCustomer: () => void; handleExistingCustomer: () => void; handleResetCustomer: () => void; handleSelectCustomer: (customer: any) => void; handleSelectResetCustomer: (customer: any) => void; showModal: boolean; setShowModal: (open: boolean) => void; showFiadoOptionsModal: boolean; setShowFiadoOptionsModal: (open: boolean) => void; setShowCustomerSearchModal: (open: boolean) => void; showCreateCustomerModal: boolean; setShowCreateCustomerModal: (open: boolean) => void; showEditCustomerModal: boolean; setShowEditCustomerModal: (open: boolean) => void; showResetDebtModal: boolean; setShowResetDebtModal: (open: boolean) => void; selectedCustomer: any; setSelectedCustomer: (customer: any) => void; showCustomerSearchModal: boolean }) {
  return (
    <>
      <Dialog.Root open={showModal} onOpenChange={setShowModal}>
        <Dialog.Portal>
          <Dialog.Overlay className='fixed inset-0 bg-black/50 backdrop-blur-sm z-40' />
          <Dialog.Content className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg p-6 z-50 w-[500px] max-w-[90vw]'>
            <Dialog.Title className='sr-only'>Seleccionar tipo de venta</Dialog.Title>

            <div className='flex gap-10'>
              <button onClick={handleProcessTotal} className='flex-1 border border-slate-300 bg-white text-slate-800 hover:bg-slate-200 h-[200px] font-semibold py-3 px-4 rounded-md transition-colors duration-200 cursor-pointer flex flex-col justify-center items-center'>
                <ShoppingCartCheckoutIcon className='mx-auto mb-4' fontSize='large' />
                Comprar
              </button>
              <button onClick={handleFiado} className='flex-1 border border-slate-300 bg-white text-slate-800 hover:bg-slate-200 h-[200px] font-semibold py-3 px-4 rounded-md transition-colors duration-200 cursor-pointer flex flex-col justify-center items-center'>
                <AttachMoneyIcon className='mx-auto mb-4' fontSize='large' />
                Fiado
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal de opciones de fiado */}
      <FiadoOptionsModal open={showFiadoOptionsModal} onClose={() => setShowFiadoOptionsModal(false)} productList={productList} onNewCustomer={handleNewCustomer} onExistingCustomer={handleExistingCustomer} onResetCustomer={handleResetCustomer} />

      {/* Modal para crear nueva deuda */}
      <EditCustomersModal
        onAdd={() => {
          closeView()
        }}
        open={showCreateCustomerModal}
        onClose={() => {
          setShowCreateCustomerModal(false)
          ;(window as any).preSelectedProducts = null
        }}
        person={null}
        preSelectedProducts={(window as any).preSelectedProducts || undefined}
      />

      {/* Modal para buscar cliente existente */}
      <CustomerSearchModal open={showCustomerSearchModal} onClose={() => setShowCustomerSearchModal(false)} onSelectCustomer={handleSelectCustomer} productList={productList} />

      {/* Modal para editar cliente existente */}
      <EditCustomersModal
        onAdd={() => {
          closeView()
        }}
        open={showEditCustomerModal}
        onClose={() => {
          setShowEditCustomerModal(false)
          setSelectedCustomer(null)
          ;(window as any).preSelectedProducts = null
        }}
        person={selectedCustomer}
        preSelectedProducts={(window as any).preSelectedProducts || undefined}
      />

      {/* Modal para reiniciar deuda */}
      <ResetDebtModal open={showResetDebtModal} onClose={() => setShowResetDebtModal(false)} onSelectCustomer={handleSelectResetCustomer} productList={productList} />
    </>
  )
}
