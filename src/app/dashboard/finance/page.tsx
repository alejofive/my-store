'use client'

import DailySalesCard from '@/components/DailySalesCard'
import DashboardStats from '@/components/DashboardStats'
import MonyWithdrawal from '@/components/MonyWithdrawal'

const page = () => {

  return (
    <div className='px-5 py-5 flex flex-col gap-6'>
      <DashboardStats />
      <div className='grid grid-cols-6 gap-6'>
        <div className='bg-white shadow-sm rounded-xl p-5 border border-gray-200 col-span-4'>
          <h3 className='text-sm text-gray-500'>historial</h3>
        </div>

        <div className='col-span-2'>
          <DailySalesCard />
        </div>

        <div className='col-span-3'>
          <MonyWithdrawal />
        </div>
        <div className='col-span-3'>
          <div>hds</div>
        </div>
      </div>
    </div>
  )
}

export default page
