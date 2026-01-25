'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { fetchBinanceRate } from '@/hooks/useExchangeRates'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import { useEffect, useMemo, useState } from 'react'

type RateMap = Record<string, number | undefined>

const divisas = [
  { id: 1, name: 'Dolares' },
  { id: 2, name: 'Pesos' },
  { id: 3, name: 'Bolivares' },
  { id: 4, name: 'Euros' },
]

type TargetConfig = { key: string; label: string; code: string; sub?: string }

const ALL_TARGETS: Record<string, TargetConfig> = {
  VES_BCV: { key: 'VES_BCV', label: 'Bolivares', code: 'VES', sub: '(bcv)' },
  VES_BINANCE: { key: 'VES_BINANCE', label: 'Bolivares ', code: 'VES', sub: '(binance)' },
  COP: { key: 'COP', label: 'Pesos', code: 'COP' },
  COP_BCV: { key: 'COP', label: 'Pesos', code: 'COP', sub: '(bcv)' },
  COP_BINANCE: { key: 'COP_BINANCE', label: 'Pesos', code: 'COP', sub: '(binance)' },
  USD: { key: 'USD', label: 'Dolares', code: 'USD' },
  USD_BINANCE: { key: 'USD_BINANCE', label: 'Dolares', code: 'USD', sub: '(binance)' },
  EUR: { key: 'EUR', label: 'Euros', code: 'EUR' },
}

const DEFAULT_RATES: RateMap = {
  USD: 1,
  VES_BCV: 321.03,
  VES_BINANCE: 719,
  COP: 3722.47,
  EUR: 0.86,
}

const baseNameToKey = {
  Dolares: 'USD',
  Pesos: 'COP',
  Bolivares: 'VES_BCV',
  Euros: 'EUR',
}

const getApiCode = (name: string) => {
  switch (name) {
    case 'Dolares':
      return 'USD'
    case 'Pesos':
      return 'COP'
    case 'Bolivares':
      return 'VES'
    case 'Euros':
      return 'EUR'
    default:
      return 'USD'
  }
}

export function ModalDivisas({ onClose, open }: { open: boolean; onClose: () => void }) {
  const [divisaSeleccionada, setDivisaSeleccionada] = useState('Dolares')
  const [rawMonto, setRawMonto] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiRates, setApiRates] = useState<RateMap>({})
  const [manualOverrides, setManualOverrides] = useState<Record<string, string>>({})
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [binanceRates, setBinanceRates] = useState<{ VES: number | null; COP: number | null }>({ VES: null, COP: null })

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const [ves, cop] = await Promise.all([fetchBinanceRate('VES'), fetchBinanceRate('COP')])
        setBinanceRates({ VES: ves, COP: cop })
      } catch (error) {
        console.error('Error fetching binance rates', error)
      }
    }
    fetchRates()
  }, [])

  useEffect(() => {
    if (!open) return

    const code = getApiCode(divisaSeleccionada)
    const url = `https://v6.exchangerate-api.com/v6/d4681459046c8a1d0a417cb1/latest/${code}`

    let mounted = true
    setLoading(true)
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!mounted) return
        const conv = data?.conversion_rates || {}
        // Extraemos las que nos interesan
        setApiRates({
          USD: conv['USD'],
          COP: conv['COP'],
          EUR: conv['EUR'],
          VES: conv['VES'],
        })
      })
      .catch(() => {
        // keep defaults if error
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [open, divisaSeleccionada])

  const combinedRates = useMemo<RateMap>(() => {
    const rates: RateMap = { ...DEFAULT_RATES }

    const currentBaseCode = getApiCode(divisaSeleccionada)

    let conversionFactor = 1
    if (currentBaseCode !== 'USD' && apiRates.USD) {
      conversionFactor = apiRates.USD
    }

    // Convert defaults
    for (const k of Object.keys(DEFAULT_RATES)) {
      const val = DEFAULT_RATES[k]
      if (typeof val === 'number') {
        rates[k] = val * conversionFactor
      }
    }

    if (apiRates.USD) rates.USD = apiRates.USD
    if (apiRates.COP) {
      rates.COP = apiRates.COP
      rates.COP_BCV = apiRates.COP // Alias for display logic
    }
    if (apiRates.EUR) rates.EUR = apiRates.EUR
    // Para VES: usamos la tasa del API si existe como BCV por defecto
    if (apiRates.VES) rates.VES_BCV = apiRates.VES

    // Binance rates
    if (binanceRates.VES) rates.VES_BINANCE = binanceRates.VES
    if (binanceRates.COP) rates.COP_BINANCE = binanceRates.COP

    // Calculated rates
    // USD_BINANCE (Inverse of VES_Binance or just 1? Context: usually USD price in VES context, but here it's a target)
    // If base is VES, Target USD_BINANCE usually means "How many USD do I get for X VES at binance rate?"
    // So current code 'calcularConversion' divides by base and multiplies by target.
    // If Base=VES (1), Target=USD_BINANCE (rate?).
    // Actually, everything in 'rates' is usually "How many VES/COP per 1 USD" (Price in local currency).
    // So VES_BINANCE = 700 means 1 USD = 700 VES.
    // COP_BINANCE = 4000 means 1 USD = 4000 COP.
    // USD_BINANCE... is 1 USD = 1 USD ? No, it's just USD.
    // Wait, if I am in Bolivares and I want to see "Dolares (binance)", what does that mean?
    // It means I am selling/buying Base(VES) to get Target(USD) at Binance rate.
    // Standard formula: Amount(USD) = Amount(VES) / Rate(VES/USD).
    // If I use "VES_BINANCE" rate, it works.

    // But we need a key "USD_BINANCE" to show in the list.
    // Let's say USD_BINANCE simply maps to 1 (same as USD) BUT we label it differently?
    // OR does it imply a different cross-rate? No, rates are USD-based.
    // The difference is WHICH rate we use to convert FROM the base.
    // If Base is VES, we use `rates[VES_BCV]` normally.
    // If we want "Dolares (binance)", we are converting VES -> USD using BINANCE rate.
    // BUT `calcularConversion` uses `rateBase`.
    // `rateBase` is determined by `divisaSeleccionada`.
    // If `divisaSeleccionada` is 'Bolivares', `rateBase` is `rates['VES_BCV']`.
    // If we want to show conversion using Binance rate, we have a problem:
    // The logic `montoEnDolares = montoNumerico / rateBase` locks us into ONE base rate.

    // However, if the TARGET is "USD_BINANCE", it implies we want the result of `VES / VES_BINANCE_RATE`.
    // My formula: `resultado = montoEnDolares * destRate`
    // `montoEnDolares = VES_AMOUNT / VES_BCV` (Current logic)
    // `resultado = (VES_AMOUNT / VES_BCV) * 1` = USD Amount at BCV rate.

    // To get USD Amount at Binance Rate: `VES_AMOUNT / VES_BINANCE`.
    // This equals `(VES_AMOUNT / VES_BCV) * (VES_BCV / VES_BINANCE)`.
    // So if `destRate` for USD_BINANCE is `VES_BCV / VES_BINANCE`, it works!

    if (binanceRates.VES && rates.VES_BCV) {
      rates.USD_BINANCE = rates.VES_BCV / binanceRates.VES
    }

    // Same for Pesos (binance) when base is Bolivares?
    // "Pesos (binance)" from Bolivares.
    // We want `VES -> COP` via Binance.
    // `VES -> USD` (via Binance) -> `USD -> COP` (via Binance).
    // Rate should be `COP_BINANCE`.
    // Math: `montoEnDolares = VES / VES_BCV`.
    // `Target = COP_BINANCE`.
    // `Result = (VES / VES_BCV) * COP_BINANCE`.
    // This mixes BCV and Binance. (VES->USD via BCV, USD->COP via Binance).
    // User probably wants consistent Binance path: `VES -> USD (Binance) -> COP (Binance)`.
    // i.e. `VES / VES_BINANCE * COP_BINANCE`.
    // To achieve this with `rateBase = VES_BCV`:
    // `destRate = COP_BINANCE * (VES_BCV / VES_BINANCE)`.

    if (binanceRates.COP && binanceRates.VES && rates.VES_BCV) {
      rates.COP_BINANCE = binanceRates.COP * (rates.VES_BCV / binanceRates.VES)
    } else if (binanceRates.COP) {
      rates.COP_BINANCE = binanceRates.COP // Fallback if regular USD base
    }

    // Special case for Pesos -> Bolivares Binance display
    // User wants to see the cross-rate (e.g., 6.3) in the rate column
    if (divisaSeleccionada === 'Pesos') {
      if (binanceRates.COP && binanceRates.VES) {
        rates.VES_BINANCE = binanceRates.COP / binanceRates.VES
      }
      // Invert USD and EUR specific rates for display (Show Pesos per USD/EUR)
      if (rates.USD) rates.USD = 1 / rates.USD
      if (rates.EUR) rates.EUR = 1 / rates.EUR
    }

    // Aplica overrides si el usuario las editó
    for (const k of Object.keys(manualOverrides)) {
      const val = manualOverrides[k]
      if (val == null || val === '') continue
      const numeric = parseUserNumber(val)
      if (!isNaN(numeric) && numeric > 0) {
        rates[k] = numeric
      }
    }

    return rates
  }, [apiRates, manualOverrides, divisaSeleccionada])

  function parseUserNumber(value: string) {
    if (!value || typeof value !== 'string') return 0
    const cleaned = value.replace(/\./g, '').replace(/,/g, '.')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  function formatNumberForDisplay(value: number | string, code: string) {
    const n = typeof value === 'number' ? value : parseUserNumber(String(value))
    if (isNaN(n)) return '-'
    const digits = code === 'USD' || code === 'EUR' ? 2 : n >= 1000 ? 0 : 2
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: digits,
      maximumFractionDigits: 3,
    }).format(n)
  }

  const formatCurrencyInput = (val: string) => {
    let v = val.replace(/[^0-9,]/g, '')

    const parts = v.split(',')
    if (parts.length > 2) {
      v = parts[0] + ',' + parts.slice(1).join('')
    }

    const [intPart, decPart] = v.split(',')

    let cleanInt = intPart.replace(/^0+(?=\d)/, '')
    if (cleanInt === '') cleanInt = ''

    const formattedInt = cleanInt.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

    if (v.includes(',')) {
      return `${formattedInt},${decPart ?? ''}`
    }
    return formattedInt
  }

  const displayMonto = () => {
    return rawMonto
  }

  const manejarCambioMonto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    const formatted = formatCurrencyInput(v)
    setRawMonto(formatted)
  }

  const calcularConversion = (targetKey: string) => {
    const montoNumerico = parseUserNumber(rawMonto)
    if (isNaN(montoNumerico) || montoNumerico <= 0) return '-'

    // Special case: Pesos -> VES_BINANCE
    // User wants to calculate using Binance rates for both: (COP / BinanceCOP) * BinanceVES
    if (divisaSeleccionada === 'Pesos' && targetKey === 'VES_BINANCE') {
      if (binanceRates.COP && binanceRates.VES) {
        // Convert Pesos -> USD (at Binance rate) -> VES (at Binance rate)
        // Formula: Input (COP) / COP_Binance_Rate * VES_Binance_Rate
        const montoEnDolaresBinance = montoNumerico / binanceRates.COP
        const resultado = montoEnDolaresBinance * binanceRates.VES
        const code = ALL_TARGETS[targetKey]?.code ?? 'VES'
        return formatNumberForDisplay(resultado, code)
      }
    }

    const baseKey = baseNameToKey[divisaSeleccionada as keyof typeof baseNameToKey] || 'USD'
    const rateBase = combinedRates[baseKey] ?? DEFAULT_RATES[baseKey]
    if (!rateBase || rateBase === 0) return '-'
    const montoEnDolares = montoNumerico / rateBase

    const destRate = combinedRates[targetKey]
    if (destRate == null) return '-'

    let resultado = 0
    if (divisaSeleccionada === 'Pesos' && (targetKey === 'USD' || targetKey === 'EUR')) {
      // Since we inverted the rate for display (Pesos per Unit), we must DIVIDE the amount (Pesos) by the rate
      // rateBase for Pesos is 1. montoEnDolares = Amount.
      // Result = Amount / Rate
      resultado = montoEnDolares / destRate
    } else {
      resultado = montoEnDolares * destRate
    }

    const code = ALL_TARGETS[targetKey]?.code ?? 'USD'
    return formatNumberForDisplay(resultado, code)
  }

  const obtenerCodigoMoneda = (targetKey: string) => {
    return ALL_TARGETS[targetKey]?.code.toLowerCase() ?? ''
  }

  const manejarCambioTasa = (key: string, value: string) => {
    if (/^[0-9\s.,]*$/.test(value) || value === '') {
      setManualOverrides(prev => ({ ...prev, [key]: value }))
    }
  }

  const resetRates = () => {
    setManualOverrides({})
  }

  const visibleTargets = useMemo(() => {
    switch (divisaSeleccionada) {
      case 'Dolares':
        return [ALL_TARGETS.VES_BCV, ALL_TARGETS.VES_BINANCE, ALL_TARGETS.COP, ALL_TARGETS.EUR]
      case 'Pesos':
        return [ALL_TARGETS.VES_BCV, ALL_TARGETS.VES_BINANCE, ALL_TARGETS.USD, ALL_TARGETS.EUR]
      case 'Bolivares':
        // For Bolivares case: Pesos(bcv), Pesos(binance), Dolares, Dolares(binance), Euros
        // Note: 'Pesos (bcv)' normally just refers to the standard relationship, so we map COP to it, or make a new key if we want explicit '(bcv)' label.
        // Let's use COP_BCV key which allows us to add the label.
        return [ALL_TARGETS.COP_BCV, ALL_TARGETS.COP_BINANCE, ALL_TARGETS.USD, ALL_TARGETS.USD_BINANCE, ALL_TARGETS.EUR]
      case 'Euros':
        return [ALL_TARGETS.VES_BCV, ALL_TARGETS.USD]
      default:
        return [ALL_TARGETS.VES_BCV, ALL_TARGETS.VES_BINANCE, ALL_TARGETS.COP, ALL_TARGETS.EUR]
    }
  }, [divisaSeleccionada])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='bg-white'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold text-slate-900'>Cambio de Divisas</DialogTitle>
        </DialogHeader>

        <div className='flex gap-2.5 mb-3'>
          {divisas.map(divisa => (
            <button
              key={divisa.id}
              onClick={() => {
                setDivisaSeleccionada(divisa.name)
                setRawMonto('')
              }}
              className={`border border-slate-200 shadow rounded-md px-3 py-1 font-bold cursor-pointer hover:bg-slate-300 transition-colors ${divisaSeleccionada === divisa.name ? 'bg-slate-700 text-white hover:bg-slate-800' : 'text-slate-900'}`}
            >
              {divisa.name}
            </button>
          ))}
        </div>

        <div className='mb-4'>
          <h3 className='text-sm text-slate-900 font-semibold'>Ingresa el monto a cambiar</h3>
          <div className='relative mt-2 w-[300px]'>
            <input type='text' placeholder='Ej: 1.000.50' value={displayMonto()} onChange={manejarCambioMonto} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} className='w-full border border-slate-200 shadow rounded-md px-4 py-1' />
            <AttachMoneyIcon className='absolute top-1 right-0 text-slate-400' />
          </div>
          <p className='text-xs text-slate-500 mt-1'>Formato: separadores de miles visibles al salir del campo. Usa coma o punto como decimal.</p>
        </div>

        {loading && <p className='text-sm text-slate-500'>Obteniendo tasas...</p>}

        <div className='w-full flex flex-wrap gap-2'>
          {visibleTargets.map(tasa => (
            <div key={tasa.key} className='flex justify-between w-[300px] rounded-md border border-slate-200 shadow p-2'>
              <div className='flex gap-2 '>
                <img className='w-16 object-cover rounded-md' src={tasa.code === 'VES' ? '/Venezuela.png' : tasa.code === 'COP' ? '/Colombia.png' : tasa.code === 'EUR' ? '/Europe.png' : '/UnitedStates.png'} alt='' />
                <div>
                  <div className='flex items-center gap-1'>
                    <h3 className='text-sm text-slate-900 font-semibold'>{tasa.label} </h3>
                    <p className='text-xs text-slate-500'>{tasa.sub}</p>
                  </div>
                  <p className='text-slate-900 font-semibold'>
                    {calcularConversion(tasa.key)} <span className='text-xs'>{obtenerCodigoMoneda(tasa.key)}</span>
                  </p>
                </div>
              </div>

              <div className='flex flex-col items-end'>
                <div className='text-xs text-slate-700 font-bold mb-1'>Tasa</div>
                <div className='flex flex-col items-end'>
                  {/* <input className='text-right w-[100px] border border-slate-100 rounded px-2 py-1 text-sm' value={manualOverrides[tasa.key] ?? String(combinedRates[tasa.key] ?? '')} onChange={e => manejarCambioTasa(tasa.key, e.target.value)} placeholder={String(combinedRates[tasa.key] ?? '')} /> */}
                  <span className='text-slate-950 font-bold text-sm mt-1'>{formatNumberForDisplay(Number(combinedRates[tasa.key] ?? 0), tasa.code)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-4 flex gap-2 items-center'>
          <button className='cursor-pointer bg-slate-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-slate-700' onClick={onClose}>
            Cancelar
          </button>
          <button className='cursor-pointer bg-slate-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-slate-800' onClick={resetRates}>
            Restablecer tasas
          </button>
        </div>

        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
