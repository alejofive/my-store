'use client'

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
const data = [
  { mes: 'Ene', ventas: 1200 },
  { mes: 'Feb', ventas: 1800 },
  { mes: 'Mar', ventas: 900 },
  { mes: 'Abr', ventas: 2200 },
  { mes: 'May', ventas: 2700 },
  { mes: 'Jun', ventas: 3100 },
]

export default function SalesChart() {
  return (
    <div className='bg-white rounded-xl shadow-sm p-6 border border-slate-200'>
      <h2 className='text-lg font-semibold mb-4 text-slate-900'>Ventas Mensuales</h2>

      <div className='w-full h-64'>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='mes' />
            <YAxis />
            <Tooltip />
            <Line type='monotone' dataKey='ventas' stroke='#0f172a' strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
