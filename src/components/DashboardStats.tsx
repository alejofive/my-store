'use client'

interface StatsProps {
  ventas: number
  mesActual: string
  ganancia: number
  stock: number
}

export default function DashboardStats({ ventas, mesActual, ganancia, stock }: StatsProps) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
      {/* Ventas */}
      <div className='bg-white shadow-sm rounded-xl p-5 border border-gray-200'>
        <h3 className='text-sm text-gray-500'>Ventas</h3>
        <p className='text-2xl font-bold text-gray-900 mt-1'>{ventas}</p>
      </div>

      {/* Mes */}
      <div className='bg-white shadow-sm rounded-xl p-5 border border-gray-200'>
        <h3 className='text-sm text-gray-500'>Mes</h3>
        <p className='text-2xl font-bold text-gray-900 mt-1'>{mesActual}</p>
      </div>

      {/* Ganancia */}
      <div className='bg-white shadow-sm rounded-xl p-5 border border-gray-200'>
        <h3 className='text-sm text-gray-500'>Ganancia</h3>
        <p className='text-2xl font-bold text-green-600 mt-1'>${ganancia.toFixed(2)}</p>
      </div>

      {/* Stock */}
      <div className='bg-white shadow-sm rounded-xl p-5 border border-gray-200'>
        <h3 className='text-sm text-gray-500'>Stock Disponible</h3>
        <p className='text-2xl font-bold text-gray-900 mt-1'>{stock}</p>
      </div>
    </div>
  )
}
