import { API_CONFIG } from "@/constants/exchange"

export const fetchBinanceRate = async (fiat: string = 'VES'): Promise<number | null> => {
    try {
        const response = await fetch(API_CONFIG.BINANCE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                page: 1,
                rows: 1,
                payTypes: ['PagoMovil', 'SpecificBank', 'BANK'],
                asset: 'USDT',
                tradeType: 'SELL',
                fiat: fiat,
            }),
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        if (data?.data?.length > 0 && data.data[0]?.adv?.price) {
            const rate = parseFloat(parseFloat(data.data[0].adv.price).toFixed(API_CONFIG.DECIMAL_PLACES)) - 15
            return isNaN(rate) || rate <= 0 ? null : rate
        }
        return null
    } catch (error) {
        console.error('Error obteniendo tasa de Binance:', error)
        return null
    }
}