'use client'

import { useTheme } from '@/context/useTheme'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import RemoveIcon from '@mui/icons-material/Remove'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { SelectPayModal } from './SelectPay'

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

export default function SidebarTotal() {
  const { activeTotal, setActiveTotal, selectedProductId } = useTheme()
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [showFiadoOptionsModal, setShowFiadoOptionsModal] = useState(false)
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false)
  const [showCustomerSearchModal, setShowCustomerSearchModal] = useState(false)
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false)
  const [showResetDebtModal, setShowResetDebtModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  const {
    data: product,
    isLoading,
    error,
  } = useQuery<Product>({
    queryKey: ['product', selectedProductId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3000/products/${selectedProductId}`)
      if (!res.ok) throw new Error('Error fetching product')
      return res.json()
    },
    enabled: !!selectedProductId && activeTotal,
  })

  const [productList, setProductList] = useState<Product[]>([])

  useEffect(() => {
    if (!product) return

    setProductList(prev => {
      const exists = prev.find(p => p.id === product.id)
      if (exists) return prev

      return [...prev, { ...product, quantity: 1 }]
    })
  }, [product])

  const closeView = () => {
    setProductList([])
    setActiveTotal(false)
  }

  useEffect(() => {
    if (!activeTotal) {
      setProductList([])
    }
  }, [activeTotal])

  const handleIncreaseQuantity = (productId: string | number) => {
    setProductList(prev => prev.map(p => (p.id === productId ? { ...p, quantity: (p.quantity || 1) + 1 } : p)))
  }

  const handleDecreaseQuantity = (productId: string | number) => {
    setProductList(prev => prev.map(p => (p.id === productId && (p.quantity || 1) > 1 ? { ...p, quantity: (p.quantity || 1) - 1 } : p)))
  }

  const handleRemoveProduct = (productId: string | number) => {
    setProductList(prev => prev.filter(p => p.id !== productId))
  }

  const calculateTotal = () => {
    return productList.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 1), 0)
  }
  const formatPrice = (value: any) => {
    return value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') ?? ''
  }

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const bodyPayload: any = {
        name: payload.name,
        price: payload.price,
        stock: payload.stock,
        image: payload.image,
        urlImage: payload.urlImage,
      }

      if (payload.details) bodyPayload.details = payload.details

      const res = await fetch(`http://localhost:3000/products/${payload.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      })

      if (!res.ok) throw new Error('Error actualizando el producto')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product'] })
    },
  })

  const handleProcessTotal = () => {
    if (productList.length === 0) return

    // Para cada producto en la lista, crear payload actualizado y mutar
    productList.forEach(p => {
      const qty = Number(p.quantity || 1)
      const currentStock = Number(p.stock ?? 0)
      const details = p.details ?? {}

      const newStock = Math.max(0, currentStock - qty)
      const currentSold = Number(details.sold ?? 0)
      const sold = currentSold + qty

      // profitPerUnit preferido en details.profitPerUnit, si no se calcula con price - basePrice
      const profitPerUnit = typeof details.profitPerUnit === 'number' ? details.profitPerUnit : Number(p.price ?? 0) - Number(details.basePrice ?? 0)

      const addedProfit = (profitPerUnit || 0) * qty
      const totalProfit = Number(details.totalProfit ?? 0) + addedProfit

      const payload: any = {
        id: p.id,
        name: p.name,
        price: p.price,
        stock: newStock,
        image: p.image,
        urlImage: p.urlImage,
        details: {
          ...details,
          sold,
          totalProfit,
        },
      }

      mutation.mutate(payload)
    })

    // Limpiar UI y cerrar
    setProductList([])
    setActiveTotal(false)
    setShowModal(false)
  }

  const handleFiado = () => {
    if (productList.length === 0) return
    setShowModal(false)
    setShowFiadoOptionsModal(true)
  }

  const handleNewCustomer = () => {
    setShowFiadoOptionsModal(false)
    // Convert productList to SelectedProduct format
    const selectedProducts = productList.map(p => ({
      id: p.id.toString(),
      name: p.name || '',
      price: p.price || 0,
      quantity: p.quantity || 1,
      PrecioTotal: (p.price || 0) * (p.quantity || 1),
      image: p.image || p.urlImage || '',
    }))

    // Store pre-selected products to pass to EditCustomersModal
    ;(window as any).preSelectedProducts = selectedProducts
    setShowCreateCustomerModal(true)
  }

  const handleExistingCustomer = () => {
    setShowFiadoOptionsModal(false)
    // Store products for the next modal
    const selectedProducts = productList.map(p => ({
      id: p.id.toString(),
      name: p.name || '',
      price: p.price || 0,
      quantity: p.quantity || 1,
      PrecioTotal: (p.price || 0) * (p.quantity || 1),
      image: p.image || p.urlImage || '',
    }))
    ;(window as any).preSelectedProducts = selectedProducts
    setShowCustomerSearchModal(true)
  }

  const handleSelectCustomer = (customer: any) => {
    console.log('handleSelectCustomer called with:', customer.name, 'movements:', customer.movements?.length)
    setSelectedCustomer(customer)
    setShowCustomerSearchModal(false)
    // Pequeño delay para asegurar que el estado se actualice
    setTimeout(() => {
      setShowEditCustomerModal(true)
    }, 100)
  }

  const handleResetCustomer = () => {
    setShowFiadoOptionsModal(false)
    // Store products for the next modal
    const selectedProducts = productList.map(p => ({
      id: p.id.toString(),
      name: p.name || '',
      price: p.price || 0,
      quantity: p.quantity || 1,
      PrecioTotal: (p.price || 0) * (p.quantity || 1),
      image: p.image || p.urlImage || '',
    }))
    ;(window as any).preSelectedProducts = selectedProducts
    setShowResetDebtModal(true)
  }

  const handleSelectResetCustomer = (customer: any) => {
    // Crear un cliente con movements vacío para simular reset
    const resetCustomer = {
      ...customer,
      movements: [],
    }
    console.log('handleSelectResetCustomer called with:', customer.name, 'creating resetCustomer')
    setSelectedCustomer(resetCustomer)
    setShowResetDebtModal(false)
    // Pequeño delay para asegurar que el estado se actualice
    setTimeout(() => {
      setShowEditCustomerModal(true)
    }, 100)
  }

  const handleOpenModal = () => {
    if (productList.length === 0) return
    setShowModal(true)
  }

  if (!activeTotal) return null

  return (
    <aside className={clsx('h-screen p-4 bg-white border-l border-slate-200 overflow-hidden transition-[width] duration-[300ms] ease-in-out', activeTotal ? 'w-80' : 'w-0')}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-slate-900'>Total</h1>
        <button aria-label='Cerrar' className='text-sm text-slate-600 hover:text-slate-800 cursor-pointer' onClick={() => closeView()}>
          <CloseIcon className='text-slate-950' fontSize='medium' />
        </button>
      </div>

      <div className='mt-7'>
        {isLoading && <div className='text-sm text-slate-500'>Cargando producto…</div>}

        {error && <div className='text-sm text-red-500'>{(error as Error).message}</div>}

        {!isLoading && !error && product && (
          <ul>
            {productList.map(product => (
              <li key={product.id} className='mb-4 w-full'>
                <div className='flex items-center justify-between gap-2 w-full'>
                  <div className='flex items-center  gap-2'>
                    {(product.image || product.urlImage) && <img className='w-12 h-12 bg-slate-200 rounded-md object-cover' src={product.image || product.urlImage} alt={product.name ?? 'Producto'} />}

                    <div>
                      <p className='text-sm text-slate-800 font-bold'>{product.name}</p>
                      <p className='text-sm text-slate-600'>Stock: {formatPrice(product.stock)}</p>
                    </div>
                  </div>
                  <button className='cursor-pointer text-slate-600 hover:text-red-500 transition-colors' onClick={() => handleRemoveProduct(product.id)}>
                    <CloseIcon />
                  </button>
                </div>

                <div className='flex items-center gap-5 justify-between'>
                  <div className='mt-2'>
                    <p className='text-sm text-slate-600'>Precio:</p>
                    <p className='text-lg font-bold'>{formatPrice(product.price)}</p>
                  </div>

                  <div className='flex items-center gap-2'>
                    <button onClick={() => handleDecreaseQuantity(product.id)} className='bg-slate-900 hover:bg-slate-700 w-6 h-6 cursor-pointer text-white flex justify-center items-center rounded-bl-lg rounded-tl-lg'>
                      <RemoveIcon />
                    </button>
                    <span>{product.quantity || 1}</span>
                    <button onClick={() => handleIncreaseQuantity(product.id)} className='bg-slate-900 hover:bg-slate-700 w-6 h-6 cursor-pointer text-white flex justify-center items-center rounded-br-lg rounded-tr-lg'>
                      <AddIcon />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && !error && !product && <div className='text-sm text-slate-500'>Selecciona un producto para ver el total.</div>}
      </div>

      <button onClick={handleOpenModal} disabled={mutation.isPending || productList.length === 0} className='mt-20 cursor-pointer w-full bg-slate-900 text-white py-2 px-4 rounded-md hover:bg-slate-700 transition-colors duration-200 text-xl disabled:opacity-60 disabled:cursor-not-allowed'>
        {mutation.isPending ? 'Procesando...' : `Total $${formatPrice(calculateTotal())}`}
      </button>

      {/* Modal de selección de tipo de venta */}
      <SelectPayModal onClose={() => setShowModal(false)} open={showModal} handleProcessTotal={handleProcessTotal} handleFiado={handleFiado} productList={productList} closeView={closeView} handleNewCustomer={handleNewCustomer} handleExistingCustomer={handleExistingCustomer} handleResetCustomer={handleResetCustomer} handleSelectCustomer={handleSelectCustomer} handleSelectResetCustomer={handleSelectResetCustomer} showModal={showModal} setShowModal={setShowModal} showFiadoOptionsModal={showFiadoOptionsModal} setShowFiadoOptionsModal={setShowFiadoOptionsModal} setShowCustomerSearchModal={setShowCustomerSearchModal} showCreateCustomerModal={showCreateCustomerModal} setShowCreateCustomerModal={setShowCreateCustomerModal} showEditCustomerModal={showEditCustomerModal} setShowEditCustomerModal={setShowEditCustomerModal} showResetDebtModal={showResetDebtModal} setShowResetDebtModal={setShowResetDebtModal} selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer} showCustomerSearchModal={showCustomerSearchModal} />
    </aside>
  )
}
