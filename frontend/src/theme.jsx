import { createContext, useContext, useLayoutEffect, useState } from 'react'
import { motion } from 'framer-motion'

/* Light / dark theme. Light is the default; the choice is remembered in this browser. */
let current = 'light'
export const currentTheme = () => current

const Ctx = createContext({ theme: 'light', toggle: () => {} })

function readSaved() {
  try { return localStorage.getItem('autopulse-theme') === 'dark' ? 'dark' : 'light' } catch { return 'light' }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readSaved)
  current = theme
  useLayoutEffect(() => {
    if (theme === 'dark') document.documentElement.dataset.theme = 'dark'
    else delete document.documentElement.dataset.theme
  }, [theme])
  const toggle = () => setTheme((t) => {
    const next = t === 'dark' ? 'light' : 'dark'
    try { localStorage.setItem('autopulse-theme', next) } catch { /* private mode */ }
    return next
  })
  return <Ctx.Provider value={{ theme, toggle }}>{typeof children === 'function' ? children(theme) : children}</Ctx.Provider>
}

export const useTheme = () => useContext(Ctx)

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button className="theme-toggle" onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title={dark ? 'Light mode' : 'Dark mode'}>
      <motion.svg key={theme} width="18" height="18" viewBox="0 0 24 24" initial={{ rotate: -90, scale: 0.5, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
        {dark
          ? <><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <path key={a} d="M12 2.5v2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" transform={`rotate(${a} 12 12)`} />)}</>
          : <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />}
      </motion.svg>
    </button>
  )
}
