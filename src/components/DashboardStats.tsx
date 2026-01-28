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
      <div className='relative group bg-white shadow-sm rounded-xl p-5 border border-gray-200'>
        <h3 className='text-sm text-gray-500'>Ventas</h3>
        <p className='text-2xl font-bold text-gray-900 mt-1'>{ventas}</p>

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
        <p className='text-2xl font-bold text-gray-900 mt-1'>{mesActual}</p>
      </div>

      {/* Ganancia */}
      <div className='relative group bg-white shadow-sm rounded-xl p-5 border border-gray-200'>
        <h3 className='text-sm text-gray-500'>Ganancia</h3>
        <p className='text-2xl font-bold text-green-600 mt-1'>
          $
          {new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(ganancia)}
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
        <p className='text-2xl font-bold text-gray-900 mt-1'>{stock}</p>
      </div>
    </div>
  )
}
