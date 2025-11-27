'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'

export default function CreateProductModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [image, setImage] = useState('')

  const handleSubmit = () => {
    const newProduct = { name, price, stock, image }
    console.log('✅ Nuevo producto:', newProduct)

    // Aquí iría la petición al backend
    // await fetch("/api/products", { method: "POST", body: JSON.stringify(newProduct) })

    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='bg-white'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold'>Crear Producto</DialogTitle>
        </DialogHeader>

        <div className='space-y-3'>
          <input type='text' placeholder='Nombre del producto' className='w-full border border-slate-200 shadow rounded px-3 py-2' value={name} onChange={e => setName(e.target.value)} />

          <input type='number' placeholder='Precio' className='w-full border border-slate-200 shadow rounded px-3 py-2' value={price} onChange={e => setPrice(e.target.value)} />

          <input type='number' placeholder='Stock' className='w-full border border-slate-200 shadow rounded px-3 py-2' value={stock} onChange={e => setStock(e.target.value)} />

          <input type='text' placeholder='URL de imagen' className='w-full border border-slate-200 shadow rounded px-3 py-2' value={image} onChange={e => setImage(e.target.value)} />
        </div>

        <DialogFooter>
          <button className='bg-slate-900 text-white font-semibold px-4 py-2 rounded-md hover:bg-slate-800' onClick={handleSubmit}>
            Guardar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
