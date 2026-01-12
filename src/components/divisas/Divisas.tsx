'use client'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import { useState } from 'react'
import { ModalDivisas } from './ModalDivisas'
const Divisas = () => {
  const [openModal, setOpenModal] = useState(false)
  return (
    <>
      <button onClick={() => setOpenModal(true)} className='cursor-pointer rounded-md hover:bg-slate-200 transition-colors px-2 py-1 text-slate-900 border border-slate-300 duration-200 mr-4  flex items-center gap-2 text-sm font-bold'>
        <AttachMoneyIcon fontSize='small' />
        Divisas
      </button>

      <ModalDivisas open={openModal} onClose={() => setOpenModal(false)} />
    </>
  )
}

export default Divisas
