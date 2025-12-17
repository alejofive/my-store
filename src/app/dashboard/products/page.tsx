'use client'

import CreateProductModal from '@/components/product/CreateProductModal'
import EditProductModal from '@/components/product/EditProductModal'
import ProductCard from '@/components/product/ProductCard'
import { Products } from '@/interfaces/products'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import SearchIcon from '@mui/icons-material/Search'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

const page = () => {
  const [search, setSearch] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Products | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

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

    console.log(products)

    if (isLoading) return <p>Cargando productos...</p>
    if (error) return <p>Error al cargar productos</p>
    
  return (
    <div className='space-y-4'>
      {/* 🔎 Buscador */}
      <div className='mt-5 px-5 w-full flex justify-between'>
        <div className='w-32'></div>
        <div className='relative'>
          <input
            type='text'
            placeholder='Buscar productos...'
            className='w-2xs py-2 px-4 pl-10 rounded-md border border-slate-200 bg-white shadow-sm focus:outline-none'
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setCurrentPage(1) // Reset paginación al buscar
            }}
          />
          <SearchIcon className='absolute left-3 top-[10px] text-slate-400' />
        </div>

        <button onClick={() => setOpenModal(true)} className='cursor-pointer bg-slate-900 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 hover:bg-slate-800 transition'>
          Create product <AddIcon />
        </button>
      </div>

      {/* ✅ Modal */}
      <CreateProductModal open={openModal} onClose={() => setOpenModal(false)} />
      <EditProductModal
        open={openEditModal}
        onClose={() => {
          setOpenEditModal(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
      />

      {/* 🛍 Grid de productos */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 px-5'>
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

export default page
