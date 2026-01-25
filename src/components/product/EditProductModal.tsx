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

  const [addedPackages, setAddedPackages] = useState('')

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
      setAddedPackages('') // Reset added packages on open

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

  // Calculate unit price and total cost, but DO NOT overwrite totalStock automatically
  useEffect(() => {
    const p = normalizeNumber(packages)
    const u = normalizeNumber(unitPackages)
    const c = normalizeNumber(packageCost)

    if (p > 0 && u > 0 && c > 0) {
      const priceUnit = c / u
      setUnitPrice(priceUnit)

      // Removed setTotalStock(p * u) to prevent resetting stock on load
      // We only update cost calculations based on current config
      const currentTotalCost = p * c
      setTotalCost(currentTotalCost)
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
    setAddedPackages('')
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

    // stock validation is now less critical as we calculate it, but keeping basic check

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (!product) return

    // Compute final price (treat `profit` input as final price). If empty, keep unitPrice
    const inputValue = normalizeNumber(profit)
    const finalPrice = inputValue > 0 ? inputValue : unitPrice
    const profitValue = finalPrice - unitPrice

    // Calculate NEW stock and package counts
    const addedPkg = normalizeNumber(addedPackages)
    const units = normalizeNumber(unitPackages)
    const currentPkg = normalizeNumber(packages)

    // Logic: 
    // New Stock = Current Available Stock + (Added Packages * Units per Package)
    // New Total Packages = Current Total Packages + Added Packages

    const addedStock = addedPkg * units
    const newTotalStock = totalStock + addedStock
    const newTotalPackages = currentPkg + addedPkg

    // Recalculate Total Cost based on new total packages
    const costPerPkg = normalizeNumber(packageCost)
    const newTotalCost = newTotalPackages * costPerPkg

    mutation.mutate({
      id: product.id,
      name,
      price: finalPrice,
      stock: newTotalStock,
      urlImage,
      image: image ? URL.createObjectURL(image) : '',
      details: {
        packages: String(newTotalPackages),
        unitPackages,
        packageCost,

        basePrice: unitPrice,
        profitPerUnit: profitValue,
        sold: product.details?.sold ?? 0,
        totalProfit: product.details?.totalProfit ?? 0,
        totalCost: newTotalCost,
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



        <div className='space-y-3'>
          <div>
            <label className='text-xs font-semibold text-slate-500'>Nombre del Producto</label>
            <input type='text' placeholder='Nombre del producto' className={`w-full border ${errors.name ? 'border-red-500' : 'border-slate-200'} shadow rounded px-3 py-2`} value={name} onChange={e => setName(e.target.value)} />
            {errors.name && <p className='text-sm text-red-500 mt-1'>{errors.name}</p>}
          </div>

          <div>
            <label className='text-xs font-semibold text-slate-500'>URL de la Imagen</label>
            <input type='text' placeholder='URL de la imagen' className={`w-full border border-slate-200 shadow rounded px-3 py-2`} value={urlImage} onChange={e => setUrlImage(e.target.value)} />
          </div>

          <div className='grid grid-cols-2 gap-2'>
            <div>
              <label className='text-xs font-semibold text-slate-500'>Paquetes Totales</label>
              <input type='text' placeholder='Paquetes totales' className={`w-full border border-slate-200 shadow rounded px-3 py-2`} value={formatThousands(packages)} onChange={e => setPackages(formatThousands(e.target.value))} />
            </div>
            <div className='rounded-md'>
              <label className='text-xs font-bold text-green-700 uppercase'>+ Agregar Paquete</label>
              <input
                type='text'
                placeholder='0'
                value={formatThousands(addedPackages)}
                onChange={e => setAddedPackages(formatThousands(e.target.value))}
                className='w-full border border-green-300 shadow-sm rounded px-3 py-2 focus:ring-green-500 focus:border-green-500'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-2'>

            <div>
              <label className='text-xs font-semibold text-slate-500'>Unidades por Paquete</label>
              <input type='text' placeholder='Unidades por paquete' className={`w-full border border-slate-200 shadow rounded px-3 py-2`} value={formatThousands(unitPackages)} onChange={e => setUnitPackages(formatThousands(e.target.value))} />
            </div>
            <div>
              <label className='text-xs font-semibold text-slate-500'>Costo por Paquete</label>
              <input type='text' placeholder='Costo del paquete' className={`w-full border border-slate-200 shadow rounded px-3 py-2`} value={formatThousands(packageCost)} onChange={e => setPackageCost(formatThousands(e.target.value))} />
            </div>
          </div>

          <div className='grid grid-cols-9 gap-2'>
            <div className='rounded-md p-4 border border-slate-300 col-span-3'>
              <p className='text-xs font-semibold text-slate-800'>
                Precio por unidad (costo real)
              </p>
              <strong className='font-bold text-2xl text-slate-900'>{formatCurrency(unitPrice)}</strong>
            </div>

            <div className='rounded-md p-4 border border-slate-300 col-span-3'>
              <p className='text-xs font-semibold text-slate-800'>
                Stock Actual:
              </p>
              <div className='flex items-center gap-2'>
                <strong className='font-bold text-2xl text-slate-900'>{formatNumber(totalStock)}</strong>
                {normalizeNumber(addedPackages) > 0 && (
                  <div className='text-green-600 font-semibold text-2xl'>
                    (+{formatNumber(normalizeNumber(addedPackages) * normalizeNumber(unitPackages))}): <strong>{formatNumber(totalStock + (normalizeNumber(addedPackages) * normalizeNumber(unitPackages)))}</strong>
                  </div>
                )}
              </div>
            </div>

            <div className='rounded-md p-4 border border-slate-300 col-span-3'>
              <p className='text-xs font-semibold text-slate-800'>Costo total de compra:</p>
              <strong className='font-bold text-2xl text-slate-900'>{formatCurrency(totalCost)}</strong>
            </div>
          </div>

          <div>
            <label className='text-xs font-semibold text-slate-500'>Precio Final (Venta)</label>
            <input type='text' placeholder='Precio final del producto' className={`w-full border border-slate-200 shadow rounded px-3 py-2`} value={formatThousands(profit)} onChange={e => setProfit(formatThousands(e.target.value))} />

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

          {/* <div>
            <h3 className='text-xl font-semibold text-slate-500 mb-4'>Imagen del Producto</h3>
            <hr className='text-slate-300 mb-4' />
            <div className='flex items-center justify-center w-full'>
              <label className='flex flex-col items-center justify-center w-full h-56 bg-slate-200 border border-dashed border-default-strong rounded-md cursor-pointer hover:bg-neutral-tertiary-medium overflow-hidden'>
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
          </div> */}

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
