'use client'

import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

// Interfaces mirroring the structure of data.json
interface Product {
  id: string
  price: number
  details: {
    sold: number
    totalProfit: number
    // other fields omitted as they are not used yet
  }
}

interface Movement {
  concept: string
  products?: any[]
}

interface Customer {
  id: string
  movements: Movement[]
}

interface TodayStats {
  totalSales: number
  totalRevenue: number
  totalProfit: number
}

export default function DailySalesCard() {
  const {
    data: stats = {
      totalSales: 0,
      totalRevenue: 0,
      totalProfit: 0,
    },
    isLoading,
    error
  } = useQuery<TodayStats>({
    queryKey: ['daily-sales-stats'],
    queryFn: async () => {
      // Fetch products, customers and withdrawals in parallel
      const [productsRes, customersRes, withdrawalsRes] = await Promise.all([
        fetch('http://localhost:3000/products'),
        fetch('http://localhost:3000/customers'),
        fetch('http://localhost:3000/withdrawals')
      ])

      if (!productsRes.ok || !customersRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const products: Product[] = await productsRes.json()
      // const customers: Customer[] = await customersRes.json() // unused

      // Calculate total withdrawn
      let totalWithdrawn = 0
      if (withdrawalsRes.ok) {
        const withdrawalsData = await withdrawalsRes.json()
        if (Array.isArray(withdrawalsData)) {
          totalWithdrawn = withdrawalsData.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
        }
      }

      // Calculate stats based on "general sales" as requested
      const totalSales = products.reduce((sum, p) => sum + (Number(p.details.sold) || 0), 0)

      // Revenue = Price * Sold Units
      const totalRevenue = products.reduce((sum, p) => sum + (p.price * (Number(p.details.sold) || 0)), 0)

      const totalGrossProfit = products.reduce((sum, p) => sum + (Number(p.details.totalProfit) || 0), 0)
      const totalProfit = totalGrossProfit - totalWithdrawn

      return {
        totalSales,
        totalRevenue,
        totalProfit,
      }
    },
    refetchInterval: 30000,
  })

  // Loading state
  if (isLoading) {
    return (
      <div className='bg-white rounded-xl shadow-sm p-6 border border-slate-200'>
        <h3 className='text-lg font-semibold mb-4 text-slate-900'>Resumen General</h3>
        <div className='space-y-4'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='animate-pulse'>
              <div className='h-4 bg-slate-200 rounded w-24 mb-2'></div>
              <div className='h-8 bg-slate-200 rounded w-32'></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className='bg-white rounded-xl shadow-sm p-6 border border-slate-200'>
        <h3 className='text-lg font-semibold mb-4 text-slate-900'>Resumen General</h3>
        <div className='text-red-500'>Error al cargar datos</div>
      </div>
    )
  }

  const statItems = [
    {
      title: 'Unidades Vendidas',
      value: stats.totalSales,
      icon: <TrendingUp className='w-5 h-5' />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Ingresos Totales',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className='w-5 h-5' />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Ganancias Totales',
      value: `$${stats.totalProfit.toLocaleString()}`,
      icon: <TrendingUp className='w-5 h-5' />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
  ]

  return (
    <div className='bg-white rounded-xl shadow-sm p-6 border border-slate-200'>
      <h3 className='text-lg font-semibold mb-4 text-slate-900'>Resumen General</h3>

      <div className='space-y-4'>
        {statItems.map((stat, index) => (
          <div key={index} className='flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors'>
            <div className='flex items-center space-x-3'>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
              <span className='text-sm font-medium text-slate-600'>{stat.title}</span>
            </div>
            <span className='text-lg font-bold text-slate-900'>{stat.value}</span>
          </div>
        ))}
      </div>

      {stats.totalSales === 0 && (
        <div className='mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg'>
          <p className='text-sm text-amber-800'>
            No hay ventas registradas aún. ¡Empieza a vender! 🚀
          </p>
        </div>
      )}
    </div>
  )
}