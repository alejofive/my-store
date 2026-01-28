'use client'

import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface TodayStats {
  totalSales: number
  totalRevenue: number
  totalProfit: number
  transactionCount: number
}

export default function DailySalesCard() {
  const {
    data: todayStats = {
      totalSales: 0,
      totalRevenue: 0,
      totalProfit: 0,
      transactionCount: 0
    },
    isLoading,
    error
  } = useQuery<TodayStats>({
    queryKey: ['today-sales'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/api/sales?type=today')
      if (!res.ok) throw new Error('Failed to fetch today sales')
      return res.json()
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  if (isLoading) {
    return (
      <div className='bg-white rounded-xl shadow-sm p-6 border border-slate-200'>
        <h3 className='text-lg font-semibold mb-4 text-slate-900'>Ventas de Hoy</h3>
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

  if (error) {
    return (
      <div className='bg-white rounded-xl shadow-sm p-6 border border-slate-200'>
        <h3 className='text-lg font-semibold mb-4 text-slate-900'>Ventas de Hoy</h3>
        <div className='text-red-500'>Error al cargar datos</div>
      </div>
    )
  }

  const stats = [
    {
      title: 'Unidades Vendidas',
      value: todayStats.totalSales,
      icon: <TrendingUp className='w-5 h-5' />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Ingresos del Día',
      value: `$${todayStats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className='w-5 h-5' />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Ganancias del Día',
      value: `$${todayStats.totalProfit.toLocaleString()}`,
      icon: <TrendingUp className='w-5 h-5' />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Transacciones',
      value: todayStats.transactionCount,
      icon: <TrendingDown className='w-5 h-5' />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <div className='bg-white rounded-xl shadow-sm p-6 border border-slate-200'>
      <h3 className='text-lg font-semibold mb-4 text-slate-900'>Ventas de Hoy</h3>
      
      <div className='space-y-4'>
        {stats.map((stat, index) => (
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

      {todayStats.totalSales === 0 && (
        <div className='mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg'>
          <p className='text-sm text-amber-800'>
            No hay ventas registradas hoy. ¡Empieza a vender! 🚀
          </p>
        </div>
      )}
    </div>
  )
}