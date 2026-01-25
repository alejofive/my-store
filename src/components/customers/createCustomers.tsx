'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Person, Products } from '@/interfaces/products'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useQuery } from '@tanstack/react-query'
import SearchIcon from '@mui/icons-material/Search'
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';

type SelectedProduct = {
  id: string
  name: string
  price: number
  quantity: number
  PrecioTotal: number
  image: string
}

export function CreateCustomersModal({ onAdd, onClose, open }: { onAdd: (data: any) => void; open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [concept, setConcept] = useState('')
  const [amount, setAmount] = useState('')
  const [typeMony, setTypeMony] = useState<'COP' | 'USD'>('COP')

  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])

  const totalAmount = selectedProducts.reduce((acc, curr) => acc + curr.price * curr.quantity, 0)

  const toggleProduct = (product: Products) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id.toString())
      if (exists) {
        return prev.filter(p => p.id !== product.id.toString())
      }
      return [...prev, {
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        quantity: 1,
        PrecioTotal: product.price,
        image: product.image || product.urlImage || ''
      }]
    })
  }

  const updateQuantity = (id: string, delta: number) => {
    setSelectedProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newQuantity = Math.max(1, p.quantity + delta)
        return {
          ...p,
          quantity: newQuantity,
          PrecioTotal: newQuantity * p.price
        }
      }
      return p
    }))
  }

  const [addProducts, setAddProducts] = useState<boolean>(false)

  const queryClient = useQueryClient()

  const formatPrice = (value: any) => {
    return value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') ?? ''
  }

  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Products[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/products')
      return res.json()
    },
  })

  const createPerson = async (person: Person) => {
    const res = await fetch('http://localhost:3000/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(person),
    })

    if (!res.ok) throw new Error('Error creando el cliente')

    return res.json()
  }

  useEffect(() => {
    if (selectedProducts.length > 0) {
      setAmount(totalAmount.toString())
    }
  }, [selectedProducts, totalAmount])


  const submit = async () => {
    if (!name || !amount) return


    const finalAmount = selectedProducts.length > 0 ? totalAmount : Number(amount)

    const newPerson: Person = {
      id: crypto.randomUUID(),
      name,
      typeMony: typeMony,
      movements: [
        {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          concept: concept || 'Deuda inicial',
          amount: finalAmount,
          products: selectedProducts.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            quantity: p.quantity,
          }))
        },
      ],
    }

    await createPerson(newPerson)
    onAdd(newPerson)

    queryClient.invalidateQueries({ queryKey: ['persons'] })

    setName('')
    setConcept('')
    setAmount('')
    setTypeMony('COP')
    onClose()
  }

  const removeProduct = (id: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== id))
  }

  const resetForm = () => {
    setName('')
    setConcept('')
    setAmount('')
    setTypeMony('COP')
    setSelectedProducts([])
    setAddProducts(false)
  }




  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='bg-white'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold'>Crear Deuda</DialogTitle>
        </DialogHeader>
        <div>
          <label htmlFor="" className='text-sm font-semibold text-slate-600'>Persona</label>
          <input placeholder='Persona' value={name} onChange={e => setName(e.target.value)} className='w-full border border-slate-300 p-2 rounded' />
        </div>

        <div>
          <label htmlFor="" className='text-sm font-semibold text-slate-600'>Concepto</label>
          <input placeholder='Concepto' value={concept} onChange={e => setConcept(e.target.value)} className='w-full border border-slate-300 p-2 rounded' />
        </div>

        <div className='w-full flex justify-center  p-2 border border-slate-300 rounded-md border-dashed h-[250px] overflow-y-scroll'>


          {addProducts ? (
            <div className='w-full flex flex-col gap-4'>
              <div className='flex justify-between items-start gap-2'>
                <button className='cursor-pointer hover:text-red-500' onClick={() => setAddProducts(false)}><CloseIcon fontSize='medium' /></button>
                <div className='flex gap-2'>
                  <button onClick={() => setAddProducts(false)} className='flex gap-2 items-center bg-slate-900 text-white px-4 py-1 rounded hover:bg-slate-700 cursor-pointer shadow-md'><BookmarkIcon /> Guardar</button>
                  <div className='relative'>
                    <input type='text' placeholder='Buscar productos...' className='w-2xs py-2 px-4 pl-10 rounded-md border border-slate-200 bg-white shadow-sm focus:outline-none' />
                    <SearchIcon className='absolute left-3 top-[10px] text-slate-400' />
                  </div>
                </div>
              </div>
              <div className='grid grid-cols-6 gap-2 h-[100px] w-full'>
                {products.map(product => (
                  <div key={product.id} className='col-span-3 h-[100px] flex justify-between w-full border border-slate-300 p-2 rounded-md'>
                    <div className='flex gap-2 items-center'>
                      {(product.image || product.urlImage) && <img className='w-12 h-12 bg-slate-300 rounded-md object-cover border border-slate-300' src={product.image || product.urlImage} alt={product.name ?? 'Producto'} />}
                      <div>
                        <label className='text-sm font-semibold text-slate-900 line-clamp-1'>{product.name}</label>
                        <p className='text-xs text-slate-600'>Stock: {formatPrice(product.stock)}</p>
                        <div>
                          <span className='text-xs text-slate-600 mr-1'>{product.details.currency}</span>
                          <span className='text-sm font-semibold text-slate-900'>{formatPrice(product.price)}</span>
                        </div>
                      </div>

                    </div>
                    <div className='flex flex-col gap-2 justify-center items-end'>
                      <input
                        type="checkbox"
                        checked={selectedProducts.some(p => p.id === product.id.toString())}
                        onChange={() => toggleProduct(product)}
                        className='cursor-pointer w-4 h-4'
                      />

                      {selectedProducts.some(p => p.id === product.id.toString()) && (
                        <div className='flex items-center gap-1'>
                          <button
                            onClick={() => updateQuantity(product.id.toString(), -1)}
                            className='bg-slate-900 hover:bg-slate-700 w-6 h-6 cursor-pointer text-white flex justify-center items-center rounded-l'
                          >
                            <RemoveIcon style={{ fontSize: 16 }} />
                          </button>
                          <span className='w-6 text-center text-sm font-semibold'>
                            {selectedProducts.find(p => p.id === product.id.toString())?.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id.toString(), 1)}
                            className='bg-slate-900 hover:bg-slate-700 w-6 h-6 cursor-pointer text-white flex justify-center items-center rounded-r'
                          >
                            <AddIcon style={{ fontSize: 16 }} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='w-full flex flex-col items-center gap-4 h-full relative'>
              {selectedProducts.length === 0 ? (
                <div className="flex h-full w-full items-center justify-center">
                  <button onClick={() => setAddProducts(true)} className='flex gap-2 items-center bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-700 cursor-pointer shadow-md'>
                    <AddIcon /> Añadir Productos
                  </button>
                </div>
              ) : (
                <>
                  <div className='flex justify-end w-full'>
                    <button onClick={() => setAddProducts(true)} className='flex gap-2 items-center bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-700 cursor-pointer shadow-md'>
                      <AddIcon /> Añadir Productos
                    </button>
                  </div>
                  <div className='grid grid-cols-6 gap-2 w-full'>
                    {selectedProducts.map(product => (
                      <div
                        onClick={() => removeProduct(product.id)}
                        key={product.id}
                        className="
                            group
                            col-span-3 h-[70px] flex justify-between items-center
                            w-full border border-slate-300 p-2 rounded-md
                            bg-slate-100
                            hover:bg-red-100
                            transition-all duration-200
                            cursor-pointer  
                          "
                      >
                        <div className='flex items-center gap-2'>
                          {(product.image) && <img className='w-12 h-12 bg-slate-300 rounded-md object-cover border border-slate-300' src={product.image} alt={product.name ?? 'Producto'} />}
                          <div>
                            <p className='font-semibold'>{product.name}</p>
                            <p className='text-sm text-gray-500'>
                              {product.quantity} x {formatPrice(product.price)}
                            </p>
                          </div>
                        </div>

                        <div className='flex items-center gap-2'>
                          <p className='font-bold group-hover:hidden'>
                            {formatPrice(product.PrecioTotal)}
                          </p>

                          <button

                            className="
                                hidden group-hover:flex
                                items-center justify-center
                                text-red-600
                                hover:text-red-800
                                transition
                                cursor-pointer
                              "
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </div>

                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className='flex gap-4'>
          <select name='type mony' id='' value={typeMony} onChange={e => setTypeMony(e.target.value as 'COP' | 'USD')} className='w-full border border-slate-300 p-2 rounded'>
            <option value='COP'>COP</option>
            <option value='USD'>USD</option>
          </select>

          <input
            placeholder='Monto'
            type='number'
            value={formatPrice(selectedProducts.length > 0 ? totalAmount : amount)}
            onChange={e => setAmount(e.target.value)}
            disabled={selectedProducts.length > 0}
            className={`w-full border border-slate-300 p-2 rounded ${selectedProducts.length > 0 ? 'bg-slate-100' : ''}`}
          />
        </div>



        <DialogFooter>
          <button className='cursor-pointer bg-slate-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-slate-700' onClick={() => {
            resetForm()
            onClose()
          }}>
            Cancelar
          </button>
          <button onClick={submit} className=' bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-700'>
            Guardar deuda
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}
