import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

import SidebarTotal from '@/components/SidebarTotal'
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

        <SidebarTotal />
      </ReactQueryProvider>
    </div>
  )
}
