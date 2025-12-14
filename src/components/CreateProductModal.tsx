'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

type ProductInput = {
  name: string
  price: number
  stock: number
  image: string
  urlImage: string
}

export default function CreateProductModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [image, setImage] = useState('')
  const [urlImage, setUrlImage] = useState('')
  const [errors, setErrors] = useState<{ name?: string; price?: string; stock?: string }>({})
  const queryClient = useQueryClient()

  // 🔥 API function
  const createProduct = async (product: ProductInput) => {
    const res = await fetch('http://localhost:3000/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    })

    if (!res.ok) {
      throw new Error('Error creando el producto')
    }

    return res.json()
  }

  // 🔥 useMutation correctamente tipado
  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      resetForm()
      onClose()
    },
  })

  const resetForm = () => {
    setName('')
    setPrice('')
    setStock('')
    setImage('')
    setUrlImage('')
    setErrors({})
  }

  const handleSubmit = () => {
    const newErrors: { name?: string; price?: string; stock?: string } = {}

    if (!name.trim()) newErrors.name = 'El nombre es requerido'
    if (price === '' || isNaN(Number(price))) newErrors.price = 'Debe ser un número válido'
    if (stock === '' || isNaN(Number(stock))) newErrors.stock = 'Debe ser un número válido'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    mutation.mutate({
      name,
      price: Number(price),
      stock: Number(stock),
      image,
      urlImage,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='bg-white'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold'>Crear Producto</DialogTitle>
        </DialogHeader>

        <div className='space-y-3'>
          {/* Upload zona */}
          <div className='flex items-center justify-center w-full'>
            <label className='flex flex-col items-center justify-center w-full h-64 bg-slate-200 border border-dashed border-default-strong rounded-md cursor-pointer hover:bg-neutral-tertiary-medium'>
              <div className='flex flex-col items-center justify-center text-body pt-5 pb-6'>
                <CloudUploadIcon className='mb-3 text-slate-900' style={{ fontSize: 48 }} />
                <p className='mb-2 text-sm text-slate-700'>
                  <span className='font-semibold text-slate-900'>Click to upload</span> or drag and drop
                </p>
                <p className='text-xs'>SVG, PNG, JPG (MAX. 800x400px)</p>
              </div>
              <input id='dropzone-file' type='file' className='hidden' />
            </label>
          </div>

          {/* Inputs */}
          <div>
            <input type='text' placeholder='Nombre del producto' className={`w-full border shadow rounded px-3 py-2 ${errors.name ? 'border-red-500' : 'border-slate-200'}`} value={name} onChange={e => setName(e.target.value)} />
            {errors.name && <p className='text-red-600 text-sm mt-1'>{errors.name}</p>}
          </div>

          <div>
            <input type='number' placeholder='Precio' className={`w-full border shadow rounded px-3 py-2 ${errors.price ? 'border-red-500' : 'border-slate-200'}`} value={price} onChange={e => setPrice(e.target.value)} />
            {errors.price && <p className='text-red-600 text-sm mt-1'>{errors.price}</p>}
          </div>

          <div>
            <input type='number' placeholder='Stock' className={`w-full border shadow rounded px-3 py-2 ${errors.stock ? 'border-red-500' : 'border-slate-200'}`} value={stock} onChange={e => setStock(e.target.value)} />
            {errors.stock && <p className='text-red-600 text-sm mt-1'>{errors.stock}</p>}
          </div>

          <input type='text' placeholder='URL de imagen' className='w-full border border-slate-200 shadow rounded px-3 py-2' value={urlImage} onChange={e => setUrlImage(e.target.value)} />
        </div>

        <DialogFooter>
          <button className='cursor-pointer bg-slate-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-slate-700' onClick={onClose}>
            Cancelar
          </button>

          <button disabled={mutation.isPending} className='cursor-pointer bg-slate-900 text-white font-semibold px-4 py-2 rounded-md hover:bg-slate-800 disabled:opacity-60' onClick={handleSubmit}>
            {mutation.isPending ? 'Guardando...' : 'Guardar'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
