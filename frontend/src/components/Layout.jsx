import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Blobs, Icon, Logo, SampleBadge } from './ui.jsx'
import { aboutIndexModal, useModal } from './Modal.jsx'
import { LangSwitch, useLang } from '../i18n.jsx'
import { ThemeToggle } from '../theme.jsx'

export const TOOLS = [
  { to: '/price-check', k: 'nav.priceCheck', label: 'Price Check', icon: 'gauge' },
  { to: '/fair-deal', k: 'nav.fair', label: 'Is this ad fair?', icon: 'tag' },
  { to: '/compare', k: 'nav.compare', label: 'Compare cars', icon: 'compare' },
  { to: '/price-index', k: 'nav.index', label: 'Price Index', icon: 'chart' },
]
export const RESEARCH = [
  { to: '/segment-map', k: 'nav.segment', label: 'Segment Map', icon: 'grid' },
  { to: '/policy-insights', k: 'nav.policy', label: 'Policy Insights', icon: 'doc' },
  { to: '/model-performance', k: 'nav.model', label: 'Model Performance', icon: 'target' },
]
export const NAV = [...TOOLS, ...RESEARCH]

/* ── Top navigation (landing page) ─────────────────────── */
export function Navbar() {
  const modal = useModal()
  const { t } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [drop, setDrop] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  const pill = { fontSize: 14, fontWeight: 600, color: 'var(--muted)', padding: '9px 15px', borderRadius: 999, whiteSpace: 'nowrap' }
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? 'var(--nav-bg)' : 'transparent',
        backdropFilter: scrolled ? 'blur(18px)' : 'none', WebkitBackdropFilter: scrolled ? 'blur(18px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--line)' : 'transparent'}`, transition: 'all .35s',
      }}>
      <div className="container row" style={{ height: scrolled ? 70 : 88, alignItems: 'center', justifyContent: 'space-between', transition: 'height .35s', gap: 16 }}>
        <Link to="/"><Logo /></Link>
        <nav className="row glass hide-md" style={{ gap: 2, padding: 5, borderRadius: 999 }}>
          {TOOLS.map((n) => (
            <NavLink key={n.to} to={n.to} className="nav-pill" style={pill}>{t(n.k, n.label)}</NavLink>
          ))}
          <div style={{ position: 'relative' }} onMouseEnter={() => setDrop(true)} onMouseLeave={() => setDrop(false)}>
            <button className="nav-pill row" style={{ ...pill, alignItems: 'center', gap: 4 }} onClick={() => setDrop(!drop)} aria-expanded={drop}>
              {t('nav.research', 'Research')}
              <motion.span animate={{ rotate: drop ? 180 : 0 }} style={{ display: 'flex' }}><Icon name="chev" size={16} /></motion.span>
            </button>
            <AnimatePresence>
              {drop && (
                <motion.div className="nav-drop" initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.18 }}>
                  {RESEARCH.map((n) => <Link key={n.to} to={n.to}><Icon name={n.icon} color="var(--teal)" size={18} />{t(n.k, n.label)}</Link>)}
                  <button onClick={() => { setDrop(false); modal.open(aboutIndexModal()) }}><Icon name="info" color="var(--teal)" size={18} />{t('nav.methodology', 'Methodology')}</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
        <div className="row" style={{ gap: 12, alignItems: 'center' }}>
          <span className="hide-sm"><LangSwitch /></span>
          <ThemeToggle />
          <span className="hide-xl"><SampleBadge /></span>
          <Link to="/price-index" className="btn btn-primary hide-sm hide-xl" style={{ height: 44, whiteSpace: 'nowrap' }}>{t('btn.openDashboard', 'Open dashboard')} <Icon name="arrow" color="#04121A" size={18} className="arrow" /></Link>
          <button className="btn btn-ghost" style={{ display: 'none', width: 44, padding: 0 }} id="menu-btn" onClick={() => setOpen(!open)} aria-label="Menu">
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', background: 'var(--nav-solid)', borderBottom: '1px solid var(--line)' }}>
            <div className="container col" style={{ padding: '12px 0 20px', gap: 4 }}>
              <div className="row" style={{ padding: '6px 0 10px', gap: 10, alignItems: 'center' }}><LangSwitch /></div>
              {NAV.map((n) => <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="row" style={{ padding: '12px 4px', fontWeight: 600, gap: 12, alignItems: 'center' }}><Icon name={n.icon} color="var(--teal)" size={18} />{t(n.k, n.label)}</Link>)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`.nav-pill{transition:all .2s}.nav-pill:hover,.nav-pill.active{color:var(--ink)!important;background:rgba(255,255,255,.06)}@media(max-width:1100px){#menu-btn{display:inline-flex!important}}`}</style>
    </motion.header>
  )
}

/* ── Footer ────────────────────────────────────────────── */
export function Footer() {
  const modal = useModal()
  const { t } = useLang()
  const cols = [
    [t('ft.tools', 'Tools'), TOOLS.map((n) => [t(n.k, n.label), n.to])],
    [t('ft.research', 'Research'), [...RESEARCH.map((n) => [t(n.k, n.label), n.to]), [t('nav.methodology', 'Methodology'), 'modal']]],
    [t('ft.about', 'About'), [['Team', '/'], ['Data sources', 'modal'], ['Privacy', '/'], ['Terms', '/']]],
  ]
  return (
    <footer style={{ marginTop: 96, background: 'var(--bg2)', borderTop: '1px solid var(--line)', position: 'relative', zIndex: 1 }}>
      <div className="container" style={{ padding: '52px 0 34px' }}>
        <div className="row stack-md" style={{ justifyContent: 'space-between', gap: 40 }}>
          <div className="col" style={{ gap: 14, maxWidth: 420 }}>
            <Logo />
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.65 }}>A student research project by Group 35, Informatics Institute of Technology, in collaboration with Robert Gordon University.</p>
          </div>
          <div className="row" style={{ gap: 64, fontSize: 14, flexWrap: 'wrap' }}>
            {cols.map(([h, links]) => (
              <div key={h} className="col" style={{ gap: 11 }}>
                <b>{h}</b>
                {links.map(([l, to]) => to === 'modal'
                  ? <button key={l} onClick={() => modal.open(aboutIndexModal())} className="muted footer-link" style={{ textAlign: 'left' }}>{l}</button>
                  : <Link key={l} to={to} className="muted footer-link">{l}</Link>)}
              </div>
            ))}
          </div>
        </div>
        <p style={{ marginTop: 34, paddingTop: 20, borderTop: '1px solid var(--line)', fontSize: 13, lineHeight: 1.6, color: 'var(--faint)' }}>
          Prices are estimates based on asking prices in online adverts from ikman.lk and Riyasewana, not final sale prices. AutoPulse is not affiliated with these websites. Economic data: Central Bank of Sri Lanka. Effects of policy events are statistical estimates. © 2026 Group 35.
        </p>
      </div>
      <style>{`.footer-link{transition:color .2s}.footer-link:hover{color:var(--teal)}`}</style>
    </footer>
  )
}

/* ── Dashboard shell with sidebar ──────────────────────── */
export function DashboardLayout() {
  const { pathname } = useLocation()
  const outlet = useOutlet()
  const modal = useModal()
  const { t } = useLang()
  const link = (n) => {
    const active = pathname === n.to
    return (
      <Link key={n.to + n.label} to={n.to} className={`side-link ${active ? 'active' : ''}`}>
        {active && (
          <motion.span layoutId="side-active" transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            style={{ position: 'absolute', inset: 0, borderRadius: 12, borderLeft: '3px solid var(--teal)', background: 'linear-gradient(90deg, rgba(45,212,191,.2) 0%, rgba(45,212,191,0) 100%)' }} />
        )}
        <span style={{ position: 'relative', display: 'flex', gap: 12, alignItems: 'center' }}>
          <Icon name={n.icon} color={active ? 'var(--teal)' : 'var(--faint)'} />{t(n.k, n.label)}
        </span>
      </Link>
    )
  }
  return (
    <div className="dash">
      <Blobs items={[{ x: '62%', y: -260, s: 520, c: 'var(--teal)', o: 0.16 }, { x: '82%', y: 560, s: 420, c: 'var(--violet)', o: 0.12 }]} />
      <aside className="sidebar">
        <Link to="/"><Logo /></Link>
        <div className="row" style={{ gap: 8, alignItems: 'center' }}><LangSwitch compact /><ThemeToggle /></div>
        <div className="col" style={{ gap: 2 }}>
          {link({ to: '/', k: 'nav.overview', label: 'Overview', icon: 'home' })}
          <span className="label side-group">{t('nav.tools', 'Tools')}</span>
          {TOOLS.map(link)}
          <span className="label side-group">{t('nav.research', 'Research')}</span>
          {RESEARCH.map(link)}
          <button onClick={() => modal.open(aboutIndexModal())} className="side-link" style={{ width: '100%' }}>
            <span style={{ position: 'relative', display: 'flex', gap: 12, alignItems: 'center' }}><Icon name="info" color="var(--faint)" />{t('nav.methodology', 'Methodology')}</span>
          </button>
        </div>
        <div className="glass col" style={{ marginTop: 'auto', padding: 18, gap: 10, borderRadius: 16 }}>
          <span className="label">{t('phase.now', 'Market phase now')}</span>
          <div className="row" style={{ alignItems: 'center', gap: 10 }}>
            <span className="dot-live" style={{ background: 'var(--blue)' }} />
            <span style={{ fontSize: 15, fontWeight: 700 }}>{t('phase.post', 'Post-reopening')}</span>
          </div>
          <span className="muted" style={{ fontSize: 13 }}>{t('phase.month', 'Month 21 since cars reopened')}</span>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--line)', overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: '72%' }} transition={{ duration: 1.4, delay: 0.3 }} style={{ height: 6, borderRadius: 3, background: 'var(--grad)' }} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--faint)', lineHeight: 1.5 }}>Asking prices from online adverts, not final sale prices.</span>
        </div>
      </aside>
      <main className="dash-main">
        <MobileDashNav pathname={pathname} />
        <motion.div key={pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}>
          {outlet}
        </motion.div>
      </main>
    </div>
  )
}

function MobileDashNav({ pathname }) {
  const { t } = useLang()
  return (
    <div className="row mobile-dash-nav" style={{ gap: 8, overflowX: 'auto', marginBottom: 20, display: 'none' }}>
      <LangSwitch compact />
      <ThemeToggle />
      <Link to="/" className="chip" style={{ whiteSpace: 'nowrap', flex: 'none' }}>{t('nav.home', 'Home')}</Link>
      {NAV.map((n) => <Link key={n.to} to={n.to} className={`chip ${pathname === n.to ? 'on' : ''}`} style={{ whiteSpace: 'nowrap', flex: 'none' }}>{t(n.k, n.label)}</Link>)}
      <style>{`@media(max-width:1100px){.mobile-dash-nav{display:flex!important}}`}</style>
    </div>
  )
}

export function PageHeader({ title, sub, right, onSample }) {
  return (
    <motion.div className="row stack-md" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, gap: 16 }}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="col" style={{ gap: 8 }}>
        <div className="row" style={{ gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.025em' }}>{title}</h1>
          {onSample ? <button onClick={onSample} aria-label="About the sample data" style={{ display: 'flex' }}><SampleBadge /></button> : <SampleBadge />}
        </div>
        <p className="muted" style={{ fontSize: 15 }}>{sub}</p>
      </div>
      {right}
    </motion.div>
  )
}

/* Stagger container for dashboard sections */
export function Stagger({ children, className, style, delay = 0.08 }) {
  return (
    <motion.div className={className} style={style} initial="hidden" animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: delay } } }}>
      {children}
    </motion.div>
  )
}
export const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] } },
}
