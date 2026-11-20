import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/* Overlay dialogs, matching the 560-px overlay frames in the Figma prototype. */

const ModalCtx = createContext({ open: () => {}, close: () => {} })
export const useModal = () => useContext(ModalCtx)

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null) // { title, body, actions }
  const open = useCallback((m) => setModal(m), [])
  const close = useCallback(() => setModal(null), [])
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])
  return (
    <ModalCtx.Provider value={{ open, close }}>
      {children}
      <AnimatePresence>
        {modal && (
          <motion.div key="backdrop" onClick={close}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(10,16,30,.5)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div role="dialog" aria-modal="true" aria-label={modal.title} onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              style={{ width: 560, maxWidth: '100%', maxHeight: '86vh', overflowY: 'auto', background: 'var(--pop)', border: '1px solid var(--line2)', borderRadius: 20, padding: 32, boxShadow: '0 30px 80px rgba(0,0,0,.5)' }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>{modal.title}</h2>
              <div style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--muted)' }}>{modal.body}</div>
              <div className="col" style={{ gap: 12, marginTop: 22 }}>
                {(modal.actions || [{ label: 'Close' }]).map((a, k) => (
                  <button key={a.label} autoFocus={k === 0}
                    onClick={() => { a.onClick?.(); if (a.keepOpen !== true) close() }}
                    className="modal-btn"
                    style={{
                      height: 44, borderRadius: 10, padding: '0 16px', textAlign: a.center ? 'center' : 'left', fontSize: 15, fontWeight: 700,
                      background: a.primary ? 'var(--teal)' : a.selected ? 'rgba(45,212,191,.16)' : 'var(--inset)',
                      color: a.primary ? '#04121a' : 'var(--ink)',
                      border: `1px solid ${a.selected ? 'var(--teal)' : 'transparent'}`,
                    }}>
                    {a.label}{a.selected ? '  ✓' : ''}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`.modal-btn{transition:background .2s,transform .15s}.modal-btn:hover{filter:brightness(1.15)}.modal-btn:active{transform:scale(.98)}.modal-btn:focus-visible{outline:2px solid var(--sky);outline-offset:2px}`}</style>
    </ModalCtx.Provider>
  )
}

/* Text block helper: keeps the paragraph spacing used in the Figma overlays */
export function Paras({ children }) {
  return <div className="col" style={{ gap: 14 }}>{children}</div>
}

/* "About this price index" – opened from Methodology links and Sample data badges */
export function aboutIndexModal() {
  return {
    title: 'About this price index',
    body: (
      <Paras>
        <p><b style={{ color: 'var(--ink)' }}>Sample data · Jan 2021 = 100</b></p>
        <p>Asking prices come from online adverts, not final sale prices.</p>
        <p>The hedonic index adjusts for car age, mileage, make and model, so changes reflect the market rather than a different mix of cars.</p>
        <p>Use the chart legend to show or hide series. Segment, brand and date controls change the view.</p>
      </Paras>
    ),
    actions: [{ label: 'Back to price index', primary: true }],
  }
}
