'use client'

import { useTheme } from '@/context/useTheme'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import RemoveIcon from '@mui/icons-material/Remove'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

type Product = {
  id: string | number
  name?: string
  price?: number
  stock?: number
  image?: string
  urlImage?: string
  quantity?: number
}

export default function SidebarTotal() {
  const { activeTotal, setActiveTotal, selectedProductId } = useTheme()

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

  if (!activeTotal) return null

  return (
    <aside className={clsx('h-screen p-4 bg-white border-l border-slate-200 overflow-hidden transition-[width] duration-[300ms] ease-in-out', activeTotal ? 'w-80' : 'w-0')}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-slate-900'>Total</h1>
        <button aria-label='Cerrar' className='text-sm text-slate-600 hover:text-slate-800' onClick={() => closeView()}>
          Cerrar
        </button>
      </div>

      <div className='mt-7'>
        {isLoading && <div className='text-sm text-slate-500'>Cargando producto…</div>}

        {error && <div className='text-sm text-red-500'>{(error as Error).message}</div>}

        {!isLoading && !error && product && (
          <ul>
            {productList.map(p => (
              <li key={p.id} className='mb-4 w-full'>
                <div className='flex items-center justify-between gap-2 w-full'>
                  <div className='flex items-center  gap-2'>
                    {(p.image || p.urlImage) && <img className='w-12 h-12 bg-slate-200 rounded-md object-cover' src={p.image || p.urlImage} alt={p.name ?? 'Producto'} />}

                    <div>
                      <p className='text-sm text-slate-800 font-bold'>{p.name}</p>
                      <p className='text-sm text-slate-600'>Stock: {p.stock}</p>
                    </div>
                  </div>
                  <button className='cursor-pointer text-slate-600 hover:text-red-500 transition-colors' onClick={() => handleRemoveProduct(p.id)}>
                    <CloseIcon />
                  </button>
                </div>

                <div className='flex items-center gap-5 justify-between'>
                  <div className='mt-2'>
                    <p className='text-sm text-slate-600'>Precio:</p>
                    <p className='text-lg font-bold'>{p.price}</p>
                  </div>

                  <div className='flex items-center gap-2'>
                    <button onClick={() => handleDecreaseQuantity(p.id)} className='bg-slate-900 hover:bg-slate-700 w-6 h-6 cursor-pointer text-white flex justify-center items-center rounded-bl-lg rounded-tl-lg'>
                      <RemoveIcon />
                    </button>
                    <span>{p.quantity || 1}</span>
                    <button onClick={() => handleIncreaseQuantity(p.id)} className='bg-slate-900 hover:bg-slate-700 w-6 h-6 cursor-pointer text-white flex justify-center items-center rounded-br-lg rounded-tr-lg'>
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

      <button className='mt-20 w-full bg-slate-900 text-white py-2 px-4 rounded-md hover:bg-slate-700 transition-colors duration-200 text-xl'>Total ${calculateTotal().toLocaleString('es-ES')}</button>
    </aside>
  )
}
