'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import PaymentsIcon from '@mui/icons-material/Payments';

interface Product {
    details: {
        totalProfit: number
    }
}

interface Withdrawal {
    id: string
    amount: number
    date: string
}

export default function MonyWithdrawal() {
    const [withdrawAmount, setWithdrawAmount] = useState(0)
    const queryClient = useQueryClient()
    const [view, setView] = useState<'resumen' | 'historial'>('resumen')

    // GET query para obtener ganancias totales (Brutas)
    const {
        data: totalGrossProfit = 0,
        isLoading: isLoadingProducts,
        error: errorProducts
    } = useQuery<number>({
        queryKey: ['total-profit'],
        queryFn: async () => {
            const response = await fetch('http://localhost:3000/products')
            if (!response.ok) {
                throw new Error('Error al cargar productos')
            }
            const products: Product[] = await response.json()
            return products.reduce((sum: number, product: Product) =>
                sum + product.details.totalProfit, 0)
        },
        refetchInterval: 30000
    })

    // GET query para obtener el total retirado
    const {
        data: withdrawals = [],
        isLoading: isLoadingWithdrawals,
        error: errorWithdrawals
    } = useQuery<Withdrawal[]>({
        queryKey: ['withdrawals-list'],
        queryFn: async () => {
            const response = await fetch('http://localhost:3000/withdrawals')
            if (!response.ok) {
                // Si falla (por ejemplo, si no existe la colección aún), asumimos 0
                console.warn('No se encontraron retiros o error al cargar:', response.statusText)
                return []
            }
            const data = await response.json()
            return Array.isArray(data) ? data : []
        },
        refetchInterval: 30000,
    })

    const totalWithdrawn = withdrawals.reduce((sum, item) => sum + (item.amount || 0), 0)

    // Calcular ganancia neta disponible
    const availableProfit = totalGrossProfit - totalWithdrawn
    const isLoading = isLoadingProducts || isLoadingWithdrawals
    const error = errorProducts || errorWithdrawals

    // POST mutation para procesar retiro y disminuir ganancias
    const withdrawMutation = useMutation({
        mutationFn: async (amount: number) => {
            const res = await fetch('http://localhost:3000/withdrawals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    date: new Date().toISOString()
                }),
            })

            if (!res.ok) {
                throw new Error('Error al procesar el retiro')
            }

            return res.json()
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['total-profit'] })
            queryClient.invalidateQueries({ queryKey: ['withdrawals-list'] })
            queryClient.invalidateQueries({ queryKey: ['daily-sales-stats'] })

            toast.success(`Retiro de $${variables.toLocaleString('es-CO')} COP procesado exitosamente`)
            setWithdrawAmount(0)
        },
        onError: (error) => {
            toast.error('Error al procesar el retiro')
            console.error('Withdrawal error:', error)
        }
    })

    const handleSliderChange = (value: number) => {
        setWithdrawAmount(value)
    }

    const handleInputChange = (value: string) => {
        const numValue = parseInt(value) || 0
        if (numValue <= availableProfit) {
            setWithdrawAmount(numValue)
        } else {
            toast.error('El monto no puede exceder las ganancias disponibles')
        }
    }

    const handleConfirmWithdrawal = async () => {
        if (withdrawAmount <= 0) {
            toast.error('Ingrese un monto válido')
            return
        }

        if (withdrawAmount > availableProfit) {
            toast.error('El monto excede las ganancias disponibles')
            return
        }

        // Ejecutar la mutación de retiro
        withdrawMutation.mutate(withdrawAmount)
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount)
    }

    console.log(withdrawals);

    const formatDate = (date: string) => {
        const d = new Date(date)
        const day = d.getDate()
        const month = d.getMonth() + 1
        const year = d.getFullYear()

        return `${day}/${month}/${year}`
    }


    return (
        <div className='bg-white rounded-xl shadow-sm p-6 border border-slate-200'>


            <div className='grid grid-cols-2 gap-6'>

                <div className='col-span-1'>
                    <div className='flex items-center gap-2 mb-6'>
                        <PaymentsIcon className='text-slate-900' />
                        <h2 className='text-lg font-semibold text-slate-900'>Mis ganancias</h2>
                    </div>
                    {error ? (
                        <div className='text-red-500 p-4'>Error al cargar datos de ganancias</div>
                    ) : !isLoading && (
                        <div className='space-y-6'>
                            <div>
                                <div className='flex items-center gap-2 mb-2 justify-between'>
                                    <label className='text-sm font-medium text-slate-700'>
                                        Monto a retirar:
                                    </label>
                                    <span className='text-sm font-semibold text-slate-900'>{formatCurrency(withdrawAmount)}</span>
                                </div>
                                <input
                                    type='number'
                                    value={withdrawAmount.toString()}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.value)}
                                    min={0}
                                    max={availableProfit}
                                    placeholder='Ingrese el monto'
                                    className='w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-2'>
                                    Desliza para seleccionar el monto
                                </label>
                                <input
                                    type='range'
                                    value={withdrawAmount}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSliderChange(parseInt(e.target.value))}
                                    min={0}
                                    max={availableProfit}
                                    step={1000}
                                    className='w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer'
                                />
                                <div className='flex justify-between text-xs text-slate-500 mt-1'>
                                    <span>$0</span>
                                    <span>{formatCurrency(availableProfit)}</span>
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                <div className='col-span-1 flex flex-col gap-4 bg-slate-100  rounded-md p-4'>
                    <h3 className='text-lg font-semibold text-slate-900 flex gap-2'>
                        <button
                            onClick={() => setView('resumen')}
                            className={view === 'resumen' ? 'text-slate-900 cursor-pointer' : 'text-slate-500 text-sm cursor-pointer'}
                        >
                            Resumen
                        </button>

                        <span className='text-slate-400'>/</span>

                        <button
                            onClick={() => setView('historial')}
                            className={view === 'historial' ? 'text-slate-900 cursor-pointer' : 'text-slate-500 text-sm cursor-pointer'}
                        >
                            Historial
                        </button>
                    </h3>
                    {view === 'resumen' ? (
                        <><div className='flex flex-col gap-2'>
                            <div className='flex items-center gap-2 justify-between'>
                                <span className='text-sm text-slate-500'>Total ganancias</span>
                                <span className='text-sm font-semibold'>
                                    {error ? 'Error' : isLoading ? 'Cargando...' : formatCurrency(totalGrossProfit)}
                                </span>
                            </div>
                            <div className='flex items-center gap-2 justify-between'>
                                <span className='text-sm text-slate-500'>Disponible</span>
                                <span className='text-sm font-semibold'>
                                    {formatCurrency(availableProfit - withdrawAmount)}
                                </span>
                            </div>

                            <hr className='text-slate-300 shadow-sm' />
                            <div className='flex items-center gap-2 justify-between'>
                                <span className='text-sm text-slate-500'>Retiro</span>
                                <span className='text-sm font-semibold text-green-600'>
                                    {formatCurrency(withdrawAmount)}
                                </span>
                            </div>
                        </div>


                            <button
                                onClick={handleConfirmWithdrawal}
                                disabled={withdrawMutation.isPending || withdrawAmount <= 0 || withdrawAmount > availableProfit}
                                className='w-full bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed py-2 px-4 rounded-md font-medium'
                            >
                                {withdrawMutation.isPending ? 'Procesando...' : 'Confirmar Retiro'}
                            </button></>
                    ) : (<>
                        <div className='max-h-[150px] overflow-y-auto pr-1'>
                            {withdrawals.map((withdrawal) => (
                                <div className='bg-slate-100 border border-slate-300 rounded-md p-2 mb-2 flex justify-between' key={withdrawal.id}>
                                    <div className='flex items-center gap-2'>
                                        <p className='text-sm text-slate-500'>Retiro de dinero: </p>
                                        <p className='text-sm font-semibold'>{formatCurrency(withdrawal.amount)}</p>
                                    </div>
                                    <p className='text-sm text-slate-500'>Fecha: {formatDate(withdrawal.date)}</p>

                                </div>
                            ))}
                        </div>
                    </>)}
                </div>
            </div>
        </div>
    )
}
