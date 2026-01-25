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

export function EditCustomersModal({ onAdd, onClose, open, person }: { onAdd: (data: any) => void; open: boolean; onClose: () => void; person?: Person | null }) {
    const [name, setName] = useState('')
    const [concept, setConcept] = useState('')
    const [amount, setAmount] = useState('')
    const [typeMony, setTypeMony] = useState<'COP' | 'USD'>('COP')

    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])

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

    // Effect to load person data if editing
    useEffect(() => {
        if (open && products.length > 0) {
            if (person) {
                setName(person.name)
                setTypeMony(person.typeMony)

                // Consolidate products from all movements
                const existingProductsMap = new Map<string, SelectedProduct>()
                let lastConcept = ''

                person.movements.forEach(m => {
                    if (m.products && m.products.length > 0) {
                        lastConcept = m.concept // Keep the last relevant concept
                        m.products.forEach(p => {
                            const pid = p.id.toString()
                            const current = existingProductsMap.get(pid)
                            const quantity = p.quantity + (current?.quantity || 0)

                            // Find info from catalog to get image and latest price if needed
                            const catalogProduct = products.find(cp => cp.id.toString() === pid)

                            existingProductsMap.set(pid, {
                                id: pid,
                                name: p.name,
                                price: p.price, // Keep original price or update? Usually we keep history, but for a "current active debt" editing, maybe keep it. Let's keep p.price from movement for now, or catalogProduct.price if we want to update to current prices. User said "monto viejo se sume", implying value preservation.
                                quantity: quantity,
                                PrecioTotal: p.price * quantity,
                                image: catalogProduct?.image || catalogProduct?.urlImage || ''
                            })
                        })
                    }
                })

                setSelectedProducts(Array.from(existingProductsMap.values()))
                setConcept(lastConcept)
                setAmount('') // Amount is calculated from selectedProducts
            } else {
                setName('')
                setConcept('')
                setAmount('')
                setSelectedProducts([])
            }
        }
    }, [open, person, products]) // Added products as dependency to ensure images load

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



    const createPerson = async (personData: Person) => {
        const res = await fetch('http://localhost:3000/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(personData),
        })
        if (!res.ok) throw new Error('Error creando el cliente')
        return res.json()
    }

    const updatePerson = async (id: string, name: string, movements: any[]) => {
        const res = await fetch(`http://localhost:3000/customers/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                movements: movements
            }),
        })
        if (!res.ok) throw new Error('Error actualizando el cliente')
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
        const date = new Date().toISOString()
        const movementId = crypto.randomUUID()

        const consolidatedMovement = {
            id: movementId,
            date: date,
            concept: concept || 'Deuda acumulada',
            amount: finalAmount,
            products: selectedProducts.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                quantity: p.quantity,
            }))
        }

        if (person) {
            // Edit Mode: Consolidate
            const oldNonProductMovements = person.movements.filter(m => !m.products || m.products.length === 0)
            const newMovements = [...oldNonProductMovements, consolidatedMovement]

            await updatePerson(person.id, name, newMovements)
            onAdd({ ...person, name, movements: newMovements })
        } else {
            // Create Mode
            const newPerson: Person = {
                id: crypto.randomUUID(),
                name,
                typeMony: typeMony,
                movements: [
                    { ...consolidatedMovement, concept: concept || 'Deuda inicial' }
                ],
            }
            await createPerson(newPerson)
            onAdd(newPerson)
        }

        queryClient.invalidateQueries({ queryKey: ['persons'] })

        resetForm()
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
