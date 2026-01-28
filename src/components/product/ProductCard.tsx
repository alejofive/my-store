'use client'

import { useTheme } from '@/context/useTheme'
import { Products } from '@/interfaces/products'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import { useRef, useState } from 'react'

interface ProductCardProps extends Products {
  urlImage?: string
  onEdit?: (product: Products) => void
}

export default function ProductCard({ id, image, name, price, stock, urlImage, onEdit, details }: ProductCardProps) {
  const [quantity, setQuantity] = useState(0)
  const { setActiveTotal, setSelectedProductId, selectedProductId, selectedProductIds } = useTheme()
  const prevQuantity = useRef(0)

  const agotado = stock === 0
  const src = image && image.trim() ? image : urlImage && urlImage.trim() ? urlImage : null

  // Verificar si este producto está seleccionado
  const isSelected = selectedProductIds.includes(id)

  const formatPrice = (value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
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
            details: details,
          })
        }
        className='bg-white cursor-pointer border border-slate-200 rounded-md p-4 shadow-sm hover:shadow-md transition relative'
      >
        {/* Imagen */}
        <div className='w-full h-36 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden'>{src ? <img src={src} alt={name} className='object-cover w-full h-full' /> : <div className='text-sm text-slate-500'>Sin imagen</div>}</div>

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
      <div className='flex justify-center items-center mt-4'>
        <div className='flex items-center w-full'>
          <button
            className={`w-full h-8 cursor-pointer rounded-md text-sm transition bg-slate-900 hover:bg-slate-700 text-white`}
            onClick={e => {
              e.stopPropagation()
              // abrir el panel lateral y establecer el id seleccionado
              setSelectedProductId(id)
              setActiveTotal(true)
            }}
          >
            {isSelected ? <CheckIcon /> : <AddIcon />}
          </button>
        </div>
      </div>
    </div>
  )
}
