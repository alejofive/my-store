'use client'
import DashboardStats from '@/components/DashboardStats'
import ProdDashboard from '@/components/ProdDashboard'
import SalesChart from '@/components/SalesChart'
import TopProductsChart from '@/components/TopProductsChart'
import { Products } from '@/interfaces/products'

import { useQuery } from '@tanstack/react-query'

const DashboardPage = () => {


  return (
    <div className='px-5 py-5'>
      <DashboardStats />
      <div className='grid grid-cols-12 gap-6'>
        <div className='flex flex-col col-span-6 gap-8 mt-6'>
          <SalesChart />
          <TopProductsChart />
        </div>

        <div className='col-span-6 mt-6 gap-3 flex flex-col'>
          <ProdDashboard />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
