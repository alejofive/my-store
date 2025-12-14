import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

import ReactQueryProvider from '../providers/ReactQueryProvider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex'>
      <ReactQueryProvider>
        <Sidebar />
        <div className='w-full'>
          <Navbar />
          {children}

        </div>
      </ReactQueryProvider>
    </div>
  )
}
