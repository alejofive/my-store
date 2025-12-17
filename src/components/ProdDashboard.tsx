'use client'

import { Products } from '@/interfaces/products'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import SearchIcon from '@mui/icons-material/Search'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import EditProductModal from './product/EditProductModal'
import ProductCard from './product/ProductCard'

export default function ProdDashboard() {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Products | null>(null)
  const itemsPerPage = 6

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery<Products[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/products')
      return res.json()
    },
  })

  if (isLoading) return <p>Cargando productos...</p>
  if (error) return <p>Error al cargar productos</p>

  // Filtrar productos
  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(search.toLowerCase()))

  // Calcular paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  return (
    <div className='space-y-4'>
      {/* 🔎 Buscador */}
      <div className='relative'>
        <input
          type='text'
          placeholder='Buscar productos...'
          className='w-full py-2 px-4 pl-10 rounded-md border border-slate-200 bg-white shadow-sm focus:outline-none'
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setCurrentPage(1) // Reset paginación al buscar
          }}
        />
        <SearchIcon className='absolute left-3 top-[10px] text-slate-400' />
      </div>

      <EditProductModal
        open={openEditModal}
        onClose={() => {
          setOpenEditModal(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
      />

      {/* 🛍 Grid de productos */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {currentProducts.map(product => (
          <ProductCard
            key={product.id}
            {...product}
            onEdit={p => {
              setSelectedProduct(p)
              setOpenEditModal(true)
            }}
          />
        ))}

        {filteredProducts.length === 0 && <p className='text-center text-slate-500 col-span-full'>No hay productos</p>}
      </div>

      {/* 📌 Paginación */}
      {totalPages > 1 && (
        <div className='flex justify-center items-center gap-4'>
          <button onClick={handlePrev} disabled={currentPage === 1} className=' disabled:opacity-40 cursor-pointer'>
            <ArrowBackIosIcon fontSize='small' />
          </button>

          <span className='text-sm text-slate-600'>
            Página {currentPage} de {totalPages}
          </span>

          <button onClick={handleNext} disabled={currentPage === totalPages} className=' disabled:opacity-40 cursor-pointer'>
            <ArrowForwardIosIcon fontSize='small' />
          </button>
        </div>
      )}
    </div>
  )
}
