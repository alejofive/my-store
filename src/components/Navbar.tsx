import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import SettingsIcon from '@mui/icons-material/Settings'
import Divisas from './divisas/Divisas'

const Navbar = () => {
  return (
    <div className='flex justify-between w-full px-5 py-1 bg-white border-b border-slate-200 items-center'>
      <h1 className='text-slate-950 text-2xl font-semibold'>Name Store</h1>

      <nav className='flex items-center gap-2'>
        <Divisas />
        <Avatar>
          <AvatarImage src='https://github.com/shadcn.png' alt='@shadcn' />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <button className='text-slate-900 cursor-pointer'>
          <SettingsIcon fontSize='large' />
        </button>
      </nav>
    </div>
  )
}

export default Navbar
