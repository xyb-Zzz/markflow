import { useState, useEffect, useCallback } from 'react'

type Theme = 'light' | 'dark'

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme(): Theme | 'system' {
  const stored = localStorage.getItem('markflow-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return 'system'
}

export function useTheme() {
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>(getStoredTheme)

  const applyTheme = useCallback((theme: Theme) => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  const theme = themePreference === 'system' ? getSystemTheme() : themePreference

  useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  useEffect(() => {
    if (themePreference !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme(getSystemTheme())
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [themePreference, applyTheme])

  const setTheme = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    setThemePreference(newTheme)
    localStorage.setItem('markflow-theme', newTheme)
    if (newTheme !== 'system') {
      applyTheme(newTheme)
    }
  }, [applyTheme])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return { theme, themePreference, setTheme, toggleTheme }
}
