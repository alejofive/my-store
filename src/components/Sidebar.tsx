'use client'

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import DashboardIcon from '@mui/icons-material/Dashboard'
import GroupIcon from '@mui/icons-material/Group'
import InventoryIcon from '@mui/icons-material/Inventory'
import SavingsIcon from '@mui/icons-material/Savings'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const menuItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, href: '/dashboard' },
  { label: 'Productos', icon: <InventoryIcon />, href: '/dashboard/products' },
  { label: 'Customers', icon: <GroupIcon />, href: '/dashboard/customers' },
  { label: 'Finance', icon: <SavingsIcon />, href: '/dashboard/finance' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300
      ${collapsed ? 'w-20' : 'w-56'}
    `}
    >
      {/* Header */}
      <div className='p-6 flex items-center justify-between'>
        {!collapsed && <h1 className='text-2xl font-bold text-slate-900 transition-opacity duration-300'>MyStore</h1>}

        <button onClick={() => setCollapsed(!collapsed)} className='cursor-pointer p-1 rounded hover:bg-gray-100 transition'>
          {collapsed ? <ArrowForwardIosIcon fontSize='small' /> : <ArrowBackIosIcon fontSize='small' />}
        </button>
      </div>

      {/* Menu */}
      <nav className='flex flex-col mt-4'>
        {menuItems.map(item => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition
                ${isActive ? 'bg-slate-50 text-slate-800 border-r-4 border-slate-900' : 'text-slate-500 hover:bg-gray-100'}
              `}
            >
              {/* Icon */}
              {item.icon}

              {/* Label (se oculta si está colapsado) */}
              {!collapsed && <span className='transition-opacity duration-300'>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
