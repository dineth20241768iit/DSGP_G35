import { useEffect, useId, useRef, useState } from 'react'
import { animate, motion, useInView } from 'framer-motion'
import { useLang } from '../i18n.jsx'

/* ── Icons ─────────────────────────────────────────────── */
const PATHS = {
  gauge: (c) => (<><path d="M4 16a8 8 0 0 1 16 0" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" /><path d="M12 16l4-5" stroke={c} strokeWidth="2" strokeLinecap="round" /></>),
  chart: (c) => <path d="M4 18l5-6 4 3 7-9" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  grid: (c) => (<><rect x="4" y="4" width="6" height="6" rx="1.5" fill={c} /><rect x="14" y="4" width="6" height="6" rx="1.5" fill={c} opacity=".5" /><rect x="4" y="14" width="6" height="6" rx="1.5" fill={c} opacity=".5" /><rect x="14" y="14" width="6" height="6" rx="1.5" fill={c} /></>),
  doc: (c) => (<><path d="M7 3h7l4 4v14H7z" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" /><path d="M10 12h5M10 16h5" stroke={c} strokeWidth="2" strokeLinecap="round" /></>),
  compare: (c) => <path d="M8 4v16M16 4v16M4 8h8M12 16h8" stroke={c} strokeWidth="2" strokeLinecap="round" />,
  home: (c) => <path d="M4 11l8-7 8 7v9H4z" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" />,
  info: (c) => (<><circle cx="12" cy="12" r="8" fill="none" stroke={c} strokeWidth="2" /><path d="M12 11v5M12 8v.5" stroke={c} strokeWidth="2" strokeLinecap="round" /></>),
  arrow: (c) => <path d="M5 12h13M13 7l5 5-5 5" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />,
  chev: (c) => <path d="M7 10l5 5 5-5" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  download: (c) => <path d="M12 4v11M7 10l5 5 5-5M5 20h14" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  dollar: (c) => <path d="M12 3v18M16.5 7.5c-.8-1.3-2.5-2-4.5-2-2.5 0-4.2 1.3-4.2 3.1 0 4.4 9 2.3 9 6.8 0 1.9-1.9 3.2-4.6 3.2-2.2 0-4-.8-4.9-2.3" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" />,
  fire: (c) => <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.4 1.2-3.8 2.4-5 .3 1.6 1 2.6 2 3 0-3.2-.4-5.6.6-8z" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" />,
  ship: (c) => <path d="M3 15l2 5h14l2-5zM6 15V9h12v6M12 4v5" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />,
  list: (c) => (<><path d="M8 6h12M8 12h12M8 18h12" stroke={c} strokeWidth="2" strokeLinecap="round" /><circle cx="4" cy="6" r="1.4" fill={c} /><circle cx="4" cy="12" r="1.4" fill={c} /><circle cx="4" cy="18" r="1.4" fill={c} /></>),
  spark: (c) => <path d="M12 3l2.2 6.3L20.5 12l-6.3 2.2L12 20.5l-2.2-6.3L3.5 12l6.3-2.7z" fill={c} />,
  check: (c) => <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />,
  plus: (c) => <path d="M12 5v14M5 12h14" stroke={c} strokeWidth="2.2" strokeLinecap="round" />,
  menu: (c) => <path d="M4 7h16M4 12h16M4 17h16" stroke={c} strokeWidth="2" strokeLinecap="round" />,
  close: (c) => <path d="M6 6l12 12M18 6L6 18" stroke={c} strokeWidth="2" strokeLinecap="round" />,
  tag: (c) => (<><path d="M3 12V4h8l10 10-8 8z" fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" /><circle cx="7.5" cy="8.5" r="1.6" fill={c} /></>),
  target: (c) => (<><circle cx="12" cy="12" r="8" fill="none" stroke={c} strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke={c} strokeWidth="2" /><circle cx="12" cy="12" r="1.3" fill={c} /></>),
  swap: (c) => <path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  paste: (c) => (<><rect x="5" y="5" width="14" height="16" rx="2" fill="none" stroke={c} strokeWidth="2" /><path d="M9 3h6v4H9zM9 12h6M9 16h4" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" /></>),
  pin: (c) => (<><path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z" fill="none" stroke={c} strokeWidth="2" /><circle cx="12" cy="10" r="2.2" fill={c} /></>),
}

export function Icon({ name, color = 'currentColor', size = 20, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: 'none' }} className={className} aria-hidden="true">
      {PATHS[name]?.(color)}
    </svg>
  )
}

export function IconBox({ name, color, soft, size = 44, icon = 22, radius = 12 }) {
  return (
    <div className="icobox" style={{ width: size, height: size, borderRadius: radius, background: soft, border: `1px solid color-mix(in srgb, ${color} 25%, transparent)` }}>
      <Icon name={name} color={color} size={icon} />
    </div>
  )
}

/* ── Brand ─────────────────────────────────────────────── */
export function Logo({ sub = true }) {
  const id = useId().replace(/:/g, '')
  return (
    <div className="row" style={{ alignItems: 'center', gap: 11 }}>
      <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
        <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2DD4BF" /><stop offset="1" stopColor="#38BDF8" /></linearGradient></defs>
        <rect width="32" height="32" rx="9" fill={`url(#${id})`} />
        <path d="M7 21a9 9 0 0 1 18 0" fill="none" stroke="#04121A" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M16 21l5-6" stroke="#04121A" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="16" cy="21" r="2.4" fill="#04121A" />
      </svg>
      <div className="col">
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.01em' }}>AutoPulse</span>
        {sub && <span style={{ fontSize: 11, color: 'var(--muted)' }}>Shock-aware used car prices</span>}
      </div>
    </div>
  )
}

export function SampleBadge() {
  const { t } = useLang()
  return <span className="badge badge-sample" title="All numbers are sample data for the prototype">{t('badge.sample', 'Sample data')}</span>
}

/* ── Car illustration (wheels spin) ─────────────────────── */
export function CarSvg({ width = 150, drive = false }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={width} height={width * 0.4} viewBox="0 0 150 60" className={drive ? 'car-drive' : undefined} aria-hidden="true" style={{ flex: 'none', overflow: 'visible' }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2DD4BF" /><stop offset="1" stopColor="#38BDF8" /></linearGradient></defs>
      <path d="M10 42 L10 34 Q11 29 18 27 L38 24 Q50 12 64 10 L92 10 Q104 10 114 22 L128 25 Q140 27 141 35 L141 42 Z" fill="var(--car-body)" stroke={`url(#${id})`} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M46 24 Q55 15 66 14 L78 14 L78 24 Z M84 14 L92 14 Q101 14 108 23 L84 24 Z" fill="var(--car-glass)" stroke={`url(#${id})`} strokeWidth="1.6" strokeLinejoin="round" />
      {[38, 113].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="43" r="9.5" fill="var(--bg)" stroke={`url(#${id})`} strokeWidth="2.4" />
          <g className={drive ? 'wheel' : undefined}>
            <circle cx={cx} cy="43" r="3.5" fill="#2DD4BF" />
            <path d={`M${cx - 6} 43h12M${cx} 37v12`} stroke="#2DD4BF" strokeWidth="1.2" opacity=".6" />
          </g>
        </g>
      ))}
      <path d="M131 31 L139 32" stroke="#F5A524" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 32 L18 31" stroke="#F2616B" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/* ── Animated helpers ──────────────────────────────────── */
export function Reveal({ children, delay = 0, y = 28, className, style }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function Counter({ to, decimals = 0, prefix = '', suffix = '', duration = 1.6 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, to, { duration, ease: [0.2, 0.8, 0.2, 1], onUpdate: setVal })
    return () => c.stop()
  }, [inView, to, duration])
  const txt = val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return <span ref={ref}>{prefix}{txt}{suffix}</span>
}

export function Sparkline({ values, color, width = 110, height = 38 }) {
  const id = useId().replace(/:/g, '')
  const lo = Math.min(...values), hi = Math.max(...values)
  const X = (i) => 2 + ((width - 4) * i) / (values.length - 1)
  const Y = (v) => 4 + (height - 8) * (1 - (v - lo) / (hi - lo || 1))
  const pts = values.map((v, i) => `${X(i)},${Y(v)}`).join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ flex: 'none' }} aria-hidden="true">
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".35" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <motion.polygon points={`${X(0)},${height} ${pts} ${X(values.length - 1)},${height}`} fill={`url(#${id})`}
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6, duration: 0.8 }} />
      <motion.polyline points={pts} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: 'easeInOut' }} />
      <circle cx={X(values.length - 1)} cy={Y(values[values.length - 1])} r="3.2" fill={color} />
    </svg>
  )
}

export function Blobs({ items }) {
  return items.map((b, i) => (
    <div key={i} className={`blob ${i % 2 ? 'float-b' : 'float-a'}`}
      style={{ left: b.x, top: b.y, width: b.s, height: b.s, background: b.c, opacity: `calc(${b.o} * var(--blob-o))` }} />
  ))
}

export function ProgressBar({ value, max = 1, from = '#13877c', to = 'var(--teal)', height = 10, delay = 0 }) {
  const width = `${Math.min(100, (Math.abs(value) / max) * 100)}%`
  return (
    <div style={{ height, borderRadius: height / 2, background: 'var(--inset)', overflow: 'hidden' }}>
      <motion.div
        style={{ height, borderRadius: height / 2, background: `linear-gradient(90deg, ${from} 0%, ${to} 100%)` }}
        initial={{ width: 0 }}
        animate={{ width }}
        transition={{ duration: 1, delay, ease: [0.2, 0.8, 0.2, 1] }}
      />
    </div>
  )
}

export function fmtM(v) { return `Rs. ${v.toFixed(2)}M` }
export function signed(v, d = 1, unit = '%') {
  const s = v > 0 ? '+' : v < 0 ? '−' : ''
  return `${s}${Math.abs(v).toFixed(d)}${unit}`
}
