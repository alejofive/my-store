'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useState } from 'react'
import SettingsIcon from '@mui/icons-material/Settings'
import Divisas from './divisas/Divisas'
import Calculator from './Calculator'
import CalculateIcon from '@mui/icons-material/Calculate'
import Mony from './Mony'

const Navbar = () => {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)

  return (
    <div className='flex justify-between w-full px-5 py-1 bg-white border-b border-slate-200 items-center'>
      <h1 className='text-slate-950 text-2xl font-semibold'>Name Store</h1>

      <nav className='flex items-center gap-2'>
        <Mony />
        <button className='flex items-center gap-2 text-slate-950 cursor-pointer hover:bg-slate-200 rounded-md p-1 border border-slate-300' onClick={() => setIsCalculatorOpen(true)}>
          <CalculateIcon fontSize='small' />
          <p className='text-sm font-bold'>Calculadora</p>
        </button>
        <Divisas />
        <Calculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />

        <Avatar>
          <AvatarImage src='https://github.com/shadcn.png' alt='@shadcn' />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <button className='text-slate-950 cursor-pointer'>
          <SettingsIcon fontSize='large' />
        </button>
      </nav>
    </div>
  )
}

export default Navbar
