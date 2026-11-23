import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { ModalProvider } from './components/Modal.jsx'
import { LangProvider } from './i18n.jsx'
import { ThemeProvider } from './theme.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* HashRouter works on any static host (GitHub Pages, Netlify, a shared link) without server config */}
    <HashRouter>
      <ThemeProvider>
        {(theme) => (
          <LangProvider>
            <ModalProvider>
              {/* remount on theme change so charts and SVG scenes pick up the new colours */}
              <App key={theme} />
            </ModalProvider>
          </LangProvider>
        )}
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>,
)
