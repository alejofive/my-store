'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

type ProductInput = {
  name: string
  price: number
  stock: number
  urlImage: string
  image: string
  details: {
    packages: string
    unitPackages: string
    packageCost: string
    basePrice: number
    profitPerUnit: number
    sold: number
    totalProfit: number
    totalCost: number
    currency: 'COP' | 'USD'
  }
}

export default function CreateProductModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [urlImage, setUrlImage] = useState('')

  const [packages, setPackages] = useState('')
  const [unitsPerPackage, setUnitsPerPackage] = useState('')
  const [packageCost, setPackageCost] = useState('')
  const [profit, setProfit] = useState('')

  const [unitPrice, setUnitPrice] = useState(0)
  const [totalStock, setTotalStock] = useState(0)
  const [totalCost, setTotalCost] = useState(0)

  const [currency, setCurrency] = useState<'COP' | 'USD'>('COP')
  const [errors, setErrors] = useState<{ name?: string; price?: string; stock?: string }>({})
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

  const normalizeNumber = (value: string) => {
    if (!value) return 0

    if (currency === 'COP') {
      // 20.500 → 20500
      return Number(value.replace(/\./g, ''))
    }

    // USD → normal decimal
    return Number(value)
  }

  useEffect(() => {
    const p = normalizeNumber(packages)
    const u = normalizeNumber(unitsPerPackage)
    const c = normalizeNumber(packageCost)

    if (p > 0 && u > 0 && c > 0) {
      const priceUnit = c / u
      setUnitPrice(priceUnit)

      const stockUnits = p * u
      setTotalStock(stockUnits)

      setTotalCost(p * c)
    }
  }, [packages, unitsPerPackage, packageCost])

  const formatCurrency = (value: number) => {
    if (value === null || value === undefined || Number.isNaN(value)) return ''

    if (currency === 'COP') {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 2,
      }).format(value)
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    if (value === null || value === undefined || Number.isNaN(value)) return ''
    return new Intl.NumberFormat(currency === 'COP' ? 'es-CO' : 'en-US').format(value)
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
    setStock('')
    setProfit('')
    setImage(null)
    setUrlImage('')
    setErrors({})
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)

    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    const inputValue = normalizeNumber(profit)

    // We treat the input as the final product price.
    // If user did not enter a final price (0/empty), use unitPrice as final price.
    const finalPrice = inputValue > 0 ? inputValue : unitPrice
    const profitValue = finalPrice - unitPrice

    mutation.mutate({
      name,
      price: finalPrice,
      stock: totalStock,
      image: image ? URL.createObjectURL(image) : '',
      urlImage,

      details: {
        packages: packages,
        unitPackages: unitsPerPackage,
        packageCost: packageCost,
        basePrice: unitPrice,
        profitPerUnit: profitValue,
        sold: 0,
        totalProfit: 0,
        totalCost: totalCost,
        currency: currency,
      },
    })
  }

  const formatThousands = (value: string) => {
    // Remove all non-digits
    const numeric = value.replace(/\D/g, '')

    if (!numeric) return ''

    // Format with points as thousands separator
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='bg-white'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold'>Crear Producto</DialogTitle>
        </DialogHeader>

        <div className='space-y-3'>
          {/* Upload zona */}
          {/* <div className='flex items-center justify-center w-full'>
            <label className='flex flex-col items-center justify-center w-full h-64 bg-slate-200 border border-dashed border-default-strong rounded-md cursor-pointer hover:bg-neutral-tertiary-medium'>
              <div className='flex flex-col items-center justify-center text-body pt-5 pb-6'>
                <CloudUploadIcon className='mb-3 text-slate-900' style={{ fontSize: 48 }} />
                <p className='mb-2 text-sm text-slate-700'>
                  <span className='font-semibold text-slate-900'>Click to upload</span> or drag and drop
                </p>
                <p className='text-xs'>SVG, PNG, JPG (MAX. 800x400px)</p>
              </div>
              <input ref={fileInputRef} id='dropzone-file' type='file' className='hidden' onChange={handleUploadImage} />
            </label>
          </div> */}

          {/* Inputs */}
          <div>
            <label className='text-xs font-semibold text-slate-500'>Nombre del Producto</label>
            <input type='text' placeholder='Nombre del producto' className={`w-full border shadow rounded px-3 py-2 ${errors.name ? 'border-red-500' : 'border-slate-300'}`} value={name} onChange={e => setName(e.target.value)} />
            {errors.name && <p className='text-red-600 text-sm mt-1'>{errors.name}</p>}
          </div>
          {/*
          <div>
            <input type='number' placeholder='Stock' className={`w-full border shadow rounded px-3 py-2 ${errors.stock ? 'border-red-500' : 'border-slate-200'}`} value={stock} onChange={e => setStock(e.target.value)} />
            {errors.stock && <p className='text-red-600 text-sm mt-1'>{errors.stock}</p>}
          </div> */}
          <div>
            <label className='text-xs font-semibold text-slate-500'>URL de la Imagen</label>
            <input type='text' placeholder='URL de imagen' className='w-full border border-slate-200 shadow rounded px-3 py-2' value={urlImage} onChange={e => setUrlImage(e.target.value)} />
          </div>

          <div className='grid grid-cols-2 gap-2'>
            <div>
              <label className='text-xs font-semibold text-slate-500'>Paquetes Totales</label>
              <input type='number' placeholder='Cantidad de paquetes comprados' value={packages} onChange={e => setPackages(formatThousands(e.target.value))} className='w-full border shadow rounded border-slate-300 px-3 py-2' />
            </div>

            <div>
              <label className='text-xs font-semibold text-slate-500'>Unidades por Paquete</label>
              <input type='number' placeholder='Unidades por paquete' value={unitsPerPackage} onChange={e => setUnitsPerPackage(formatThousands(e.target.value))} className='w-full border shadow rounded border-slate-300 px-3 py-2' />
            </div>
          </div>

          <div>
            <input type='number' placeholder='Costo del paquete' value={packageCost} onChange={e => setPackageCost(formatThousands(e.target.value))} className='w-full border shadow rounded border-slate-300 px-3 py-2' />
          </div>

          <div className='grid grid-cols-9 gap-2'>
            <div className='rounded-md p-4 border border-slate-300 col-span-3'>
              <p className='text-xs font-semibold text-slate-800'>Precio por unidad (costo real)</p>
              <strong className='font-bold text-2xl text-slate-900'>{formatCurrency(unitPrice)}</strong>
            </div>

            <div className='rounded-md p-4 border border-slate-300 col-span-3'>
              <p className='text-xs font-semibold text-slate-800'>Stock Actual:</p>
              <div className='flex items-center gap-2'>
                <strong className='font-bold text-2xl text-slate-900'>{formatNumber(totalStock)}</strong>
                {/* {normalizeNumber(addedPackages) > 0 && (
                  <div className='text-green-600 font-semibold text-2xl'>
                    (+{formatNumber(normalizeNumber(addedPackages) * normalizeNumber(unitPackages))}): <strong>{formatNumber(totalStock + normalizeNumber(addedPackages) * normalizeNumber(unitPackages))}</strong>
                  </div>
                )} */}
              </div>
            </div>

            <div className='rounded-md p-4 border border-slate-300 col-span-3'>
              <p className='text-xs font-semibold text-slate-800'>Costo total de compra:</p>
              <strong className='font-bold text-2xl text-slate-900'>{formatCurrency(totalCost)}</strong>
            </div>
          </div>

          <div>
            <input type='number' placeholder='Precio final del producto' value={profit} onChange={e => setProfit(formatThousands(e.target.value))} className='w-full border shadow rounded border-slate-300 px-3 py-2' />

            {profit !== '' &&
              (() => {
                const inputValue = normalizeNumber(profit)
                const finalPrice = inputValue > 0 ? inputValue : unitPrice
                const effectiveProfit = finalPrice - unitPrice
                return (
                  <p className='text-sm text-slate-700 mt-2'>
                    Ganancia por unidad: <strong className='font-bold text-sm text-green-600 '>{formatCurrency(effectiveProfit)}</strong>
                    <span className='ml-2 text-xs text-slate-500'> (Precio final: {formatCurrency(finalPrice)})</span>
                  </p>
                )
              })()}
          </div>
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
