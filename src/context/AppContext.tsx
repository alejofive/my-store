'use client'

import { createContext, Dispatch, ReactNode, SetStateAction, useState } from 'react'

// Definir el tipo de datos del contexto
interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  activeTotal: boolean
  setActiveTotal: Dispatch<SetStateAction<boolean>>
  selectedProductId: string | number | null
  setSelectedProductId: Dispatch<SetStateAction<string | number | null>>
  selectedProductIds: (string | number)[]
  setSelectedProductIds: Dispatch<SetStateAction<(string | number)[]>>
}

// Crear el contexto con un valor inicial undefined
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Provider que envuelve la aplicación
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const [activeTotal, setActiveTotal] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | number | null>(null)
  const [selectedProductIds, setSelectedProductIds] = useState<(string | number)[]>([])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme, activeTotal, setActiveTotal, selectedProductId, setSelectedProductId, selectedProductIds, setSelectedProductIds }}>{children}</ThemeContext.Provider>
}
