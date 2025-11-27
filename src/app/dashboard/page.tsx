import DashboardStats from '@/components/DashboardStats'
import ProdDashboard from '@/components/ProdDashboard'
import SalesChart from '@/components/SalesChart'
import TopProductsChart from '@/components/TopProductsChart'

const DashboardPage = () => {
  return (
    <div className='px-5 py-5'>
      <DashboardStats ventas={125} mesActual='Febrero' ganancia={1540.75} stock={340} />
      <div className='grid grid-cols-12 gap-6'>
        <div className='flex flex-col col-span-6 gap-8 mt-6'>
          <SalesChart />
          <TopProductsChart />
        </div>

        <div className='col-span-6 mt-6'>
          <ProdDashboard />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
