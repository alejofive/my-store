'use client'

interface ProductCardProps {
  image: string
  name: string
  price: number
  stock: number
}

export default function ProductCard({ image, name, price, stock }: ProductCardProps) {
  const agotado = stock === 0

  return (
    <div className='bg-white border border-slate-200 rounded-md p-4 shadow-sm hover:shadow-md transition relative'>
      {/* Imagen */}
      <div className='w-full h-36 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden'>
        <img src={image} alt={name} className='object-cover w-full h-full' />
      </div>

      {/* Info */}

      <h3 className='text-lg font-semibold mt-3 text-slate-900'>{name}</h3>

      <div className='flex items-center justify-between'>
        <p className='text-sm text-slate-500 mt-1'>
          Stock: <span className='font-medium'>{stock}</span>
        </p>
        <p className='text-lg font-bold text-slate-900 '>${price.toFixed(2)}</p>
      </div>

      {/* Estado */}
      <span className={`mt-3 absolute top-0 right-3 inline-block text-xs px-2 py-1 rounded-full ${agotado ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{agotado ? 'Agotado' : 'Disponible'}</span>

      {/* Botón */}
      <button className='w-full mt-4 bg-slate-900 text-white py-2 rounded-lg text-sm hover:bg-slate-700 transition'>Editar</button>
    </div>
  )
}
