'use client'

import { Products } from '@/interfaces/products'
import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function TopProductsChart() {
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

  console.log(products)
  const topSoldProducts = [...products]
    .sort((a, b) => (b.details?.sold ?? 0) - (a.details?.sold ?? 0))
    .slice(0, 5)
    .map(product => ({
      name: product.name,
      sold: product.details?.sold ?? 0,
    }))

  return (
    <div className='bg-white rounded-xl shadow-sm p-6 border border-slate-200'>
      <h2 className='text-lg font-semibold mb-4 text-slate-900'>Productos más vendidos</h2>

      <div className='w-full h-64'>
        <ResponsiveContainer>
          <BarChart data={topSoldProducts}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='name' />
            <YAxis />
            <Tooltip />
            <Bar dataKey='sold' fill='#16a34a' />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
