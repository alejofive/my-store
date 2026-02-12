'use client'

import { Products } from '@/interfaces/products'

import { useQuery } from '@tanstack/react-query'



export default function DashboardStats() {

  const {
    data: products = [],
    isLoading: isLoadingProducts,
    error: errorProducts,
  } = useQuery<Products[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/products')
      return res.json()
    },
  })

  const {
    data: withdrawals = [],
    isLoading: isLoadingWithdrawals,
  } = useQuery<{ amount: number }[]>({
    queryKey: ['withdrawals-list'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/withdrawals')
      if (!res.ok) return []
      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
  })

  // Ensure withdrawals is an array even if the default failed somehow or query state is mixed
  const safeWithdrawals = Array.isArray(withdrawals) ? withdrawals : []
  const totalWithdrawn = safeWithdrawals.reduce((acc, curr) => acc + (curr.amount || 0), 0)

  const totalStock = products.reduce((acc, product) => {
    return acc + (product.stock ?? 0)
  }, 0)

  // Ventas: suma de details.sold
  const totalVentas = products.reduce((acc, product) => {
    const sold = product.details?.sold ?? 0
    return acc + sold
  }, 0)

  // Ganancia: suma de details.totalProfit (si existe) o cálculo aproximado
  const grossProfit = products.reduce((acc, product) => {
    const totalProfit = product.details?.totalProfit
    if (typeof totalProfit === 'number') return acc + totalProfit

    // fallback: profitPerUnit * sold (si profitPerUnit y sold existen)
    const profitPerUnit = product.details?.profitPerUnit ?? product.price - (product.details?.basePrice ?? 0)
    const sold = product.details?.sold ?? 0
    return acc + (profitPerUnit ?? 0) * sold
  }, 0)

  const totalGanancia = grossProfit - totalWithdrawn

  console.log(totalWithdrawn)

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
      {/* Ventas */}
      <div className='relative group bg-white shadow-sm rounded-xl p-5 border border-gray-200'>
        <h3 className='text-sm text-gray-500'>Ventas</h3>
        <p className='text-2xl font-bold text-gray-900 mt-1'>{totalVentas}</p>

        {/* Hover info */}
        <div
          className='
          absolute left-1/2 -translate-x-1/2 top-full mt-3
          w-48 bg-gray-900 text-white text-sm rounded-lg px-4 py-2
          opacity-0 translate-y-2
          group-hover:opacity-100 group-hover:translate-y-0
          transition-all duration-300 ease-out
          pointer-events-none
        '
        >
          Ventas hoy: <span className='font-semibold'>12</span>
        </div>
      </div>



      {/* Mes */}
      <div className='bg-white shadow-sm rounded-xl p-5 border border-gray-200'>
        <h3 className='text-sm text-gray-500'>Mes</h3>
        <p className='text-2xl font-bold text-gray-900 mt-1'>enero</p>
      </div>

      {/* Ganancia */}
      <div className='relative group bg-white shadow-sm rounded-xl p-5 border border-gray-200'>
        <h3 className='text-sm text-gray-500'>Ganancia</h3>
        <p className='text-2xl font-bold text-green-600 mt-1'>
          $
          {new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(totalGanancia)}
        </p>

        {/* Hover info */}
        <div
          className='
          absolute left-1/2 -translate-x-1/2 top-full mt-3
          w-52 bg-gray-900 text-white text-sm rounded-lg px-4 py-2
          opacity-0 translate-y-2 z-30
          group-hover:opacity-100 group-hover:translate-y-0
          transition-all duration-300 ease-out
          pointer-events-none
        '
        >
          Ganancia hoy: <span className='font-semibold'>$35.00</span>
        </div>
      </div>

      {/* Stock */}
      <div className='bg-white shadow-sm rounded-xl p-5 border border-gray-200'>
        <h3 className='text-sm text-gray-500'>Stock</h3>
        <p className='text-2xl font-bold text-gray-900 mt-1'>{totalStock}</p>
      </div>
    </div>
  )
}
