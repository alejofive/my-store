'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Products } from '@/interfaces/products'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  product: Products | null
}

export default function EditProductModal({ open, onClose, product }: Props) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [urlImage, setUrlImage] = useState('')
  const [packages, setPackages] = useState('')
  const [unitPackages, setUnitPackages] = useState('')
  const [packageCost, setPackageCost] = useState('')
  const [profit, setProfit] = useState('')
  const [errors, setErrors] = useState<{ name?: string; price?: string; stock?: string }>({})
  const [preview, setPreview] = useState<string | null>(null)
  const [unitPrice, setUnitPrice] = useState(0)
  const [totalStock, setTotalStock] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [currency, setCurrency] = useState<'COP' | 'USD'>('COP')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  console.log(product)

  const queryClient = useQueryClient()

  useEffect(() => {
    if (product) {
      setName(product.name ?? '')
      setStock(String(product.stock ?? ''))
      setUrlImage(product.urlImage ?? '')
      setPreview(product.image ?? null)
      setImage(null)
      setErrors({})

      if (product.details) {
        // Convertir strings del backend a números reales
        const pkg = Number(String(product.details.packages).replace(/\./g, '')) || 0
        const units = Number(String(product.details.unitPackages).replace(/\./g, '')) || 0
        const cost = Number(String(product.details.packageCost).replace(/\./g, '').replace(/,/g, '.')) || 0

        setPackages(String(pkg))
        setUnitPackages(String(units))
        setPackageCost(String(cost))

        setUnitPrice(product.details.basePrice ?? 0)
        setTotalCost(product.details.totalCost ?? 0)
        setTotalStock(product.stock ?? 0)
        setCurrency(product.details.currency ?? 'COP')
      }

      // Profit es el precio final
      setProfit(String(product.price ?? ''))
    }
  }, [product])

  const normalizeNumber = (value: string) => {
    if (!value) return 0

    // Remove dots and parse number
    return Number(value.replace(/\./g, ''))
  }

  useEffect(() => {
    const p = normalizeNumber(packages)
    const u = normalizeNumber(unitPackages)
    const c = normalizeNumber(packageCost)

    if (p > 0 && u > 0 && c > 0) {
      const priceUnit = c / u
      setUnitPrice(priceUnit)

      const stockUnits = p * u
      setTotalStock(stockUnits)

      setTotalCost(p * c)
    }
  }, [packages, unitPackages, packageCost])

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

  const resetForm = () => {
    setName('')
    setPrice('')
    setStock('')
    setPackages('')
    setUnitPackages('')
    setPackageCost('')
    setProfit('')
    setUnitPrice(0)
    setTotalStock(0)
    setTotalCost(0)
    setCurrency('COP')
    setImage(null)
    setUrlImage('')
    setErrors({})
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const bodyPayload: any = {
        name: payload.name,
        price: payload.price,
        stock: payload.stock,
        image: payload.image,
        urlImage: payload.urlImage,
      }

      if (payload.details) bodyPayload.details = payload.details

      const res = await fetch(`http://localhost:3000/products/${payload.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      })

      if (!res.ok) throw new Error('Error actualizando el producto')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      resetForm()
      onClose()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`http://localhost:3000/products/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Error eliminando el producto')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      resetForm()
      onClose()
    },
  })

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)

    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    const newErrors: { name?: string; price?: string; stock?: string } = {}
    if (!name.trim()) newErrors.name = 'El nombre es requerido'
    // price field is replaced by `profit` (final price). Validate if provided.
    if (profit !== '' && isNaN(normalizeNumber(profit))) newErrors.price = 'Debe ser un número válido'
    if (stock === '' || isNaN(Number(stock))) newErrors.stock = 'Debe ser un número válido'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (!product) return

    // Compute final price (treat `profit` input as final price). If empty, keep unitPrice
    const inputValue = normalizeNumber(profit)
    const finalPrice = inputValue > 0 ? inputValue : unitPrice
    const profitValue = finalPrice - unitPrice

    // For simplicity send JSON; image file upload not supported for edit here
    mutation.mutate({
      id: product.id,
      name,
      price: finalPrice,
      stock: totalStock,
      urlImage,
      image: image ? URL.createObjectURL(image) : '',
      details: {
        packages, // <-- string
        unitPackages, // <-- string
        packageCost, // <-- string

        basePrice: unitPrice,
        profitPerUnit: profitValue,
        sold: product.details?.sold ?? 0,
        totalProfit: product.details?.totalProfit ?? 0,
        totalCost,
        currency,
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

  const handleDelete = () => {
    if (!product) return
    deleteMutation.mutate(product.id)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={val => {
        if (!val) {
          resetForm()
          onClose()
        }
      }}
    >
      <DialogContent className='bg-white'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold'>Editar Producto</DialogTitle>
        </DialogHeader>

        <div className='flex items-center justify-center w-full'>
          <label className='flex flex-col items-center justify-center w-full h-64 bg-slate-200 border border-dashed border-default-strong rounded-md cursor-pointer hover:bg-neutral-tertiary-medium overflow-hidden'>
            {preview ? (
              <img src={preview} alt='Preview' className='object-cover w-full h-full' />
            ) : (
              <div className='flex flex-col items-center justify-center text-body pt-5 pb-6'>
                <CloudUploadIcon className='mb-3 text-slate-900' style={{ fontSize: 48 }} />
                <p className='mb-2 text-sm text-slate-700'>
                  <span className='font-semibold text-slate-900'>Click to upload</span> o arrastra una imagen
                </p>
                <p className='text-xs'>SVG, PNG, JPG (MAX. 800x400px)</p>
              </div>
            )}

            <input ref={fileInputRef} id='edit-dropzone-file' type='file' accept='image/*' className='hidden' onChange={handleUploadImage} />
          </label>
        </div>

        <div className='space-y-3'>
          <div>
            <input type='text' placeholder='Nombre del producto' className={`w-full border ${errors.name ? 'border-red-500' : 'border-slate-200'} shadow rounded px-3 py-2`} value={name} onChange={e => setName(e.target.value)} />
            {errors.name && <p className='text-sm text-red-500 mt-1'>{errors.name}</p>}
          </div>

          <input type='text' placeholder='URL de imagen' className='w-full border border-slate-200 shadow rounded px-3 py-2' value={urlImage} onChange={e => setUrlImage(e.target.value)} />

          <div>
            <select value={currency} onChange={e => setCurrency(e.target.value as 'COP' | 'USD')} className='w-full border shadow rounded px-3 py-2'>
              <option value='COP'>🇨🇴 COP - Pesos</option>
              <option value='USD'>🇺🇸 USD - Dólares</option>
            </select>
          </div>

          <div>
            <input type='number' placeholder='Cantidad de paquetes comprados' value={formatThousands(packages)} onChange={e => setPackages(formatThousands(e.target.value))} className='w-full border shadow rounded px-3 py-2' />
          </div>

          <div>
            <input type='number' placeholder='Unidades por paquete' value={formatThousands(unitPackages)} onChange={e => setUnitPackages(formatThousands(e.target.value))} className='w-full border shadow rounded px-3 py-2' />
          </div>

          <div>
            <input type='number' placeholder='Costo del paquete' value={formatThousands(packageCost)} onChange={e => setPackageCost(formatThousands(e.target.value))} className='w-full border shadow rounded px-3 py-2' />
          </div>

          <div>
            <input type='number' placeholder='Precio final del producto' value={formatThousands(profit)} onChange={e => setProfit(formatThousands(e.target.value))} className='w-full border shadow rounded px-3 py-2' />

            {profit !== '' &&
              (() => {
                const inputValue = normalizeNumber(profit)
                const finalPrice = inputValue > 0 ? inputValue : unitPrice
                const effectiveProfit = finalPrice - unitPrice
                return (
                  <p className='text-sm text-slate-700 mt-2'>
                    Ganancia por unidad: <strong>{formatCurrency(effectiveProfit)}</strong>
                    <span className='ml-2 text-xs text-slate-500'> (Precio final: {formatCurrency(finalPrice)})</span>
                  </p>
                )
              })()}
          </div>

          <div className='bg-slate-100 p-3 rounded'>
            <p>
              Precio por unidad (costo real): <strong>{formatCurrency(unitPrice)}</strong>
            </p>
            <p>
              Stock total (unidades): <strong>{formatNumber(totalStock)}</strong>
            </p>
            <p>
              Costo total de compra: <strong>{formatCurrency(totalCost)}</strong>
            </p>
          </div>
        </div>

        <DialogFooter>
          <button onClick={handleDelete} disabled={deleteMutation.isPending} className='cursor-pointer bg-red-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-60'>
            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </button>
          <button
            className='cursor-pointer bg-slate-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-slate-700'
            onClick={() => {
              resetForm()
              onClose()
            }}
          >
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
