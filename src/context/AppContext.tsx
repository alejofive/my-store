'use client'

import { createContext, ReactNode, useState } from 'react'

// Definir el tipo de datos del contexto
interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  activeTotal: boolean
  setActiveTotal: (active: boolean) => void
  selectedProductId: string | number | null
  setSelectedProductId: (id: string | number | null) => void
}

// Crear el contexto con un valor inicial undefined
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Provider que envuelve la aplicación
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const [activeTotal, setActiveTotal] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | number | null>(null)

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme, activeTotal, setActiveTotal, selectedProductId, setSelectedProductId }}>{children}</ThemeContext.Provider>
}
