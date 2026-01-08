// context/useTheme.ts
'use client'

import { useContext } from 'react'
import { ThemeContext } from './AppContext'

export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }

  return context
}
