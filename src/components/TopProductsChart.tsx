'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const data = [
  { producto: 'Zapatos', ventas: 300 },
  { producto: 'Camisas', ventas: 180 },
  { producto: 'Gorras', ventas: 120 },
  { producto: 'Pantalones', ventas: 90 },
]

export default function TopProductsChart() {
  return (
    <div className='bg-white rounded-xl shadow-sm p-6 border border-slate-200'>
      <h2 className='text-lg font-semibold mb-4 text-slate-900'>Productos más vendidos</h2>

      <div className='w-full h-64'>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='producto' />
            <YAxis />
            <Tooltip />
            <Bar dataKey='ventas' fill='#16a34a' />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
