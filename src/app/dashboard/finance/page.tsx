'use client'

import DashboardStats from '@/components/DashboardStats'
import { Products } from '@/interfaces/products'
import { useQuery } from '@tanstack/react-query'

const page = () => {
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery<Products[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/products')
      return res.json()
    },
  })

  const totalStock = products.reduce((acc, product) => {
    return acc + (product.stock ?? 0)
  }, 0)

  // Ventas: suma de details.sold
  const totalVentas = products.reduce((acc, product) => {
    const sold = product.details?.sold ?? 0
    return acc + sold
  }, 0)

  // Ganancia: suma de details.totalProfit (si existe) o cálculo aproximado
  const totalGanancia = products.reduce((acc, product) => {
    const totalProfit = product.details?.totalProfit
    if (typeof totalProfit === 'number') return acc + totalProfit

    // fallback: profitPerUnit * sold (si profitPerUnit y sold existen)
    const profitPerUnit = product.details?.profitPerUnit ?? product.price - (product.details?.basePrice ?? 0)
    const sold = product.details?.sold ?? 0
    return acc + (profitPerUnit ?? 0) * sold
  }, 0)

  return (
    <div className='px-5 py-5'>
      <DashboardStats ventas={totalVentas} mesActual='Febrero' ganancia={totalGanancia} stock={totalStock} />
    </div>
  )
}

export default page
