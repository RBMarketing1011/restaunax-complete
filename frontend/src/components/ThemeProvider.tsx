'use client'

import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { ReactNode } from 'react'
import EmotionCacheProvider from './EmotionCacheProvider'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ff6b35', // Orange
    },
    secondary: {
      main: '#000000', // Black
    },
    background: {
      default: '#ffffff', // White
      paper: '#ffffff',
    },
    text: {
      primary: '#000000', // Black text
      secondary: '#666666', // Gray text
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), Arial, sans-serif',
  },
})

interface ThemeProviderProps
{
  children: ReactNode
}

export function ThemeProvider ({ children }: ThemeProviderProps)
{
  return (
    <EmotionCacheProvider>
      <MUIThemeProvider theme={ theme }>
        <CssBaseline />
        { children }
      </MUIThemeProvider>
    </EmotionCacheProvider>
  )
}
