'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import { useEffect, useMemo, useState } from 'react'

type RateMap = Record<string, number | undefined>

const divisas = [
  { id: 1, name: 'Dolares' },
  { id: 2, name: 'Pesos' },
  { id: 3, name: 'Bolivares' },
  { id: 4, name: 'Euros' },
]

// Targets we want to show (keys we will use internally)
const TARGETS = [
  { key: 'VES_BCV', label: 'Bolivares (bcv)', code: 'VES' },
  { key: 'VES_BINANCE', label: 'Bolivares (binance)', code: 'VES' },
  { key: 'COP', label: 'Pesos', code: 'COP' },
  { key: 'USD', label: 'Dolares', code: 'USD' },
  { key: 'EUR', label: 'Euros', code: 'EUR' },
]

// Defaults (safe fallbacks if API is unreachable)
const DEFAULT_RATES: RateMap = {
  USD: 1,
  VES_BCV: 321.03,
  VES_BINANCE: 719,
  COP: 3722.47,
  EUR: 0.86,
}

// Mapeo simple de la moneda base seleccionada a la "key" que usamos internamente
const baseNameToKey = {
  Dolares: 'USD',
  Pesos: 'COP',
  Bolivares: 'VES_BCV', // Por defecto al seleccionar "Bolivares" tomamos BCV; usuario puede usar target binance como destino
  Euros: 'EUR',
}

export function ModalDivisas({ onClose, open }: { open: boolean; onClose: () => void }) {
  const [divisaSeleccionada, setDivisaSeleccionada] = useState('Dolares')
  const [rawMonto, setRawMonto] = useState('') // valor sin formato para preservar caret
  const [isFocused, setIsFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiRates, setApiRates] = useState<RateMap>({})
  const [manualOverrides, setManualOverrides] = useState<Record<string, string>>({}) // strings para permitir edición amable
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const API_URL = 'https://v6.exchangerate-api.com/v6/d4681459046c8a1d0a417cb1/latest/USD'

  // Obtener tasas desde la API cada vez que se abre el modal
  useEffect(() => {
    if (!open) return
    let mounted = true
    setLoading(true)
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        if (!mounted) return
        const conv = data?.conversion_rates || {}
        // Extraemos las que nos interesan
        setApiRates({
          USD: conv['USD'],
          COP: conv['COP'],
          EUR: conv['EUR'],
          VES: conv['VES'], // el API solo trae una VES; la usaremos como referencia
        })
      })
      .catch(() => {
        // keep defaults if error
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [open])

  // Combina API + defaults + overrides en un mapa utilizable por la lógica
  const combinedRates = useMemo<RateMap>(() => {
    const rates: RateMap = { ...DEFAULT_RATES }

    if (apiRates.USD) rates.USD = apiRates.USD
    if (apiRates.COP) rates.COP = apiRates.COP
    if (apiRates.EUR) rates.EUR = apiRates.EUR
    // Para VES: usamos la tasa del API si existe como BCV por defecto
    if (apiRates.VES) rates.VES_BCV = apiRates.VES

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
  }, [apiRates, manualOverrides])

  // UTIL: parsea valor ingresado (acepta coma o punto como decimal, elimina separadores de miles)
  function parseUserNumber(value: string) {
    if (typeof value !== 'string') return NaN
    // Reemplazar comas por punto y eliminar todo lo que no sea dígito ni punto
    const cleaned = value
      .replace(/\s/g, '')
      .replace(/,/g, '.')
      .replace(/[^0-9.]/g, '')
    // evitar múltiples puntos
    const parts = cleaned.split('.')
    const normalized = parts.length <= 1 ? cleaned : parts[0] + '.' + parts.slice(1).join('')
    return parseFloat(normalized)
  }

  // Formateo para display con Intl, dependiendo del código (decimales variables)
  function formatNumberForDisplay(value: number | string, code: string) {
    const n = typeof value === 'number' ? value : parseUserNumber(String(value))
    if (isNaN(n)) return '-'
    const digits = code === 'USD' || code === 'EUR' ? 2 : n >= 1000 ? 0 : 2
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: digits,
      maximumFractionDigits: 3,
    }).format(n)
  }

  // Normalizar input visible: cuando focus mostramos raw, cuando blur mostramos formateado
  const displayMonto = () => {
    if (rawMonto === '') return ''
    if (isFocused) return rawMonto
    const n = parseUserNumber(rawMonto)
    if (isNaN(n)) return rawMonto
    // formatear sin convertir a currency, solo con separadores
    return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(n)
  }

  // Manejo de input: permitimos escribir números, comas, puntos y separadores. Guardamos raw.
  const manejarCambioMonto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    // permitir solo caracteres válidos (dígitos, espacio, punto, coma)
    if (/^[0-9\s.,]*$/.test(v)) {
      setRawMonto(v)
    }
  }

  // Calcula resultado para cada target. Convierte todo primero a USD.
  const calcularConversion = (targetKey: string) => {
    const montoNumerico = parseUserNumber(rawMonto)
    if (isNaN(montoNumerico) || montoNumerico <= 0) return '-'

    // determinar clave de la moneda base en nuestro mapa
    const baseKey = baseNameToKey[divisaSeleccionada as keyof typeof baseNameToKey] || 'USD'
    const rateBase = combinedRates[baseKey] ?? DEFAULT_RATES[baseKey]
    if (!rateBase || rateBase === 0) return '-'

    // Convertir base -> USD
    const montoEnDolares = montoNumerico / rateBase

    // Encontrar tasa destino
    const destRate = combinedRates[targetKey]
    if (destRate == null) return '-'

    const resultado = montoEnDolares * destRate
    // elegir formato según código
    const code = TARGETS.find(t => t.key === targetKey)?.code ?? 'USD'
    return formatNumberForDisplay(resultado, code)
  }

  const obtenerCodigoMoneda = (targetKey: string) => {
    return TARGETS.find(t => t.key === targetKey)?.code.toLowerCase() ?? ''
  }

  // Handler para editar tasa manualmente
  const manejarCambioTasa = (key: string, value: string) => {
    // aceptar solo números, comas, puntos y espacios
    if (/^[0-9\s.,]*$/.test(value) || value === '') {
      setManualOverrides(prev => ({ ...prev, [key]: value }))
    }
  }

  const resetRates = () => {
    setManualOverrides({})
  }

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1500)
    } catch {
      // fallback
      alert('No fue posible copiar')
    }
  }

  // Render targets pero excluyendo la moneda base (ej: si base es USD, no mostrar USD target)
  const visibleTargets = TARGETS.filter(t => {
    const baseKey = baseNameToKey[divisaSeleccionada as keyof typeof baseNameToKey] || 'USD'
    // Si baseKey === 'VES_BCV' y target is VES_BCV -> hide, but still show VES_BINANCE
    return t.key !== baseKey
  })

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
            <input type='text' placeholder='Ej: 1000.50' value={displayMonto()} onChange={manejarCambioMonto} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} className='w-full border border-slate-200 shadow rounded-md px-4 py-1' />
            <AttachMoneyIcon className='absolute top-1 right-0 text-slate-400' />
          </div>
          <p className='text-xs text-slate-500 mt-1'>Formato: separadores de miles visibles al salir del campo. Usa coma o punto como decimal.</p>
        </div>

        {loading && <p className='text-sm text-slate-500'>Obteniendo tasas...</p>}

        <div className='w-full flex flex-wrap gap-2'>
          {visibleTargets.map(tasa => (
            <div key={tasa.key} className='flex justify-between w-[300px] rounded-md border border-slate-200 shadow p-2'>
              <div className='flex gap-2 '>
                <img className='w-16 rounded-md' src={tasa.code === 'VES' ? '/Venezuela.png' : tasa.code === 'COP' ? '/Colombia.png' : tasa.code === 'EUR' ? '/Europe.png' : '/UnitedStates.png'} alt='' />
                <div>
                  <div className='flex items-center gap-1'>
                    <h3 className='text-sm text-slate-900 font-semibold'>{tasa.label} </h3>
                    <p className='text-xs text-slate-500'>{tasa.code === 'VES' && tasa.key === 'VES_BCV' ? '(bcv)' : tasa.code === 'VES' && tasa.key === 'VES_BINANCE' ? '(binance)' : ''}</p>
                  </div>
                  <p className='text-slate-600 font-semibold'>
                    {calcularConversion(tasa.key)} <span className='text-xs'>{obtenerCodigoMoneda(tasa.key)}</span>
                  </p>
                </div>
              </div>

              <div className='flex flex-col items-end'>
                <div className='text-xs text-slate-700 font-bold mb-1'>Tasa</div>
                <div className='flex flex-col items-end'>
                  <input className='text-right w-[120px] border border-slate-100 rounded px-2 py-1 text-sm' value={manualOverrides[tasa.key] ?? String(combinedRates[tasa.key] ?? '')} onChange={e => manejarCambioTasa(tasa.key, e.target.value)} placeholder={String(combinedRates[tasa.key] ?? '')} />
                  <span className='text-slate-950 font-bold text-sm mt-1'>{formatNumberForDisplay(Number(combinedRates[tasa.key] ?? 0), tasa.code)}</span>
                </div>

                <div className='mt-2 flex gap-1'>
                  <button
                    onClick={() => {
                      const val = calcularConversion(tasa.key)
                      if (val !== '-') copyToClipboard(val, tasa.key)
                    }}
                    className='text-xs px-2 py-1 bg-slate-200 rounded hover:bg-slate-300'
                  >
                    {copiedKey === tasa.key ? 'Copiado' : 'Copiar'}
                  </button>
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
