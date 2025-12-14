'use client'

import { Products } from '@/interfaces/products'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import RemoveIcon from '@mui/icons-material/Remove'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface ProductCardProps extends Products {
  urlImage?: string
  onEdit?: (product: Products) => void
}

export default function ProductCard({ id, image, name, price, stock, urlImage, onEdit, details }: ProductCardProps) {
  const [quantity, setQuantity] = useState(0)
  const [currentStock, setCurrentStock] = useState(stock)

  const agotado = stock === 0
  const src = image && image.trim() ? image : urlImage && urlImage.trim() ? urlImage : null

  const formatPrice = (value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handleAdd = () => {
    if (quantity < currentStock) {
      setQuantity(prev => prev + 1)
    }
  }

  const handleRemove = () => {
    if (quantity > 0) {
      setQuantity(prev => prev - 1)
    }
  }

  const handleConfirm = () => {
    if (quantity === 0) return

    const totalSale = quantity * price

    // 1️⃣ Actualizar stock
    setCurrentStock(prev => prev - quantity)

    // 2️⃣ Aquí llamarías a tu API
    /*
    await sellProduct({
      productId: id,
      quantity,
      total: totalSale,
      currency: details.currency
    })
  */

    toast.success(`Venta realizada: ${quantity} unidad(es) de ${name} por un total de ${details.currency === 'COP' ? 'COP ' : 'USD '}${formatPrice(totalSale)}`)

    // 3️⃣ Resetear contador
    setQuantity(0)
  }

  return (
    <div>
      <div
        onClick={() =>
          onEdit &&
          onEdit({
            id,
            name,
            price,
            stock,
            image: image ?? '',
            urlImage: urlImage ?? '',
            details: details, // necesitas pasar los detalles también
          })
        }
        className='bg-white cursor-pointer border border-slate-200 rounded-md p-4 shadow-sm hover:shadow-md transition relative'
      >
        {/* Imagen */}
        <div className='w-full h-36 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden'>{src ? <img src={src} alt={name} className='object-cover w-full h-full' /> : <div className='text-sm text-slate-500'>Sin imagen</div>}</div>

        {/* Info */}

        <h3 className='text-lg font-semibold mt-3 text-slate-900'>{name}</h3>

        <div className='flex items-center justify-between'>
          <p className='text-sm text-slate-500 mt-1'>
            Stock: <span className='font-medium'>{stock}</span>
          </p>
          <p className='text-lg font-bold text-slate-900 '>
            {details.currency === 'COP' ? 'COP ' : 'USD '}
            {formatPrice(price)}
          </p>
        </div>

        {/* Estado */}
        <span className={`mt-3 absolute top-0 right-3 inline-block text-xs px-2 py-1 rounded-full ${agotado ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{agotado ? 'Agotado' : 'Disponible'}</span>
      </div>
      {/* Botón */}
      <div className='flex justify-between items-center mt-4'>
        <div className='flex items-center '>
          <button onClick={() => handleRemove()} className='w-8 h-8 bg-slate-900 text-white  rounded-md text-sm hover:bg-slate-700 transition'>
            <RemoveIcon />
          </button>
          <div className='w-8 h-8 bg-slate-200 border border-slate-200 rounded-md flex justify-center items-center text-lg text-slate-900'>{quantity}</div>
          <button onClick={() => handleAdd()} className='w-8 h-8 bg-slate-900 text-white  rounded-md text-sm hover:bg-slate-700 transition'>
            <AddIcon />
          </button>
        </div>
        <div className='flex items-center gap-2'>
          <button className='w-8 h-8 rounded-md bg-red-500 hover:bg-red-700 cursor-pointer text-white'>
            <DeleteForeverIcon />
          </button>
          <button onClick={() => handleConfirm()} className='w-8 h-8 rounded-md bg-green-600 hover:bg-green-800 cursor-pointer text-white'>
            <CheckIcon />
          </button>
        </div>
      </div>
    </div>
  )
}
