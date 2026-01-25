import type { ExchangeRates } from '../types/exchange'

export const API_CONFIG = {
    EXCHANGE_RATE_API_KEY: process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY || '7210c10e3cabf59706f0ff76',
    BINANCE_API_URL: '/api/binance/bapi/c2c/v2/friendly/c2c/adv/search',
    EXCHANGE_RATE_API_BASE: 'https://v6.exchangerate-api.com/v6',
    DECIMAL_PLACES: 2,
} as const

export const FALLBACK_RATES: ExchangeRates = {
    usdToVesBinance: 0,
    usdToVesBcv: 0,
    usdToCop: 0,
    vesToCop: 0,
    usdToEur: 0,
}
