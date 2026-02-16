'use client'

import { useQuery } from "@tanstack/react-query"

interface Sale {
    name: string
    urlImage: string
    price: number
    id: string
    details: {
        sold: number
        profitPerUnit: number
        totalProfit: number
    }
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value)
}

export default function TodaySales() {
    const {
        data: products = [],
        isLoading,
        error
    } = useQuery<Sale[]>({
        queryKey: ['product'],
        queryFn: async () => {
            const response = await fetch('http://localhost:3000/products')
            if (!response.ok) {
                console.warn('No se encontraron ventas o error al cargar:', response.statusText)
                return []
            }
            const data = await response.json()
            return Array.isArray(data) ? data : []
        },
        refetchInterval: 30000,
    })

    const totalEarnings = products.reduce((sum, item) => sum + (item.details?.totalProfit || 0), 0)

    return (
        <div className='bg-white rounded-xl shadow-sm p-6 border border-slate-200'>
            <div className="flex items-center justify-between mb-4">
                <h2 className='text-lg font-semibold text-slate-900'>Ventas de Hoy</h2>
                <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Total ganado</p>
                    <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalEarnings)}</p>
                </div>
            </div>

            {error ? (
                <div className='text-red-500 p-4'>Error al cargar datos de ventas</div>
            ) : isLoading ? (
                <div className="animate-pulse space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-16 bg-slate-100 rounded-lg" />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-slate-400 text-center py-8">No hay ventas hoy</div>
            ) : (
                <div className="overflow-y-auto max-h-64 pr-1">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-white">
                            <tr className="border-b border-slate-200">
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Producto</th>
                                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Vendidos</th>
                                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Precio</th>
                                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Ganancia Und</th>
                                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-3">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={item.urlImage}
                                                alt={item.name}
                                                className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                                            />
                                            <span className="font-medium text-slate-900">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-right text-slate-600">
                                        {item.details?.sold || 0}
                                    </td>
                                    <td className="py-3 text-right text-slate-600">
                                        {formatCurrency(item.price)}
                                    </td>
                                    <td className="py-3 text-right text-emerald-600">
                                        {formatCurrency(item.details?.profitPerUnit || 0)}
                                    </td>
                                    <td className="py-3 text-right font-semibold text-emerald-700">
                                        {formatCurrency(item.details?.totalProfit || 0)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}