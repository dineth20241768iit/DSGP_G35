import { useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { currentTheme } from '../theme.jsx'
import { CRISIS, EXPOSURE, MONTHS, PHASES, forecast, indexSeries } from '../data/sample.js'

/* Diverging colour for the heatmap: teal = prices fell, coral = prices rose */
export function heatColor(v) {
  const a = currentTheme() === 'dark' ? [26, 37, 64] : [241, 244, 249]
  const b = v >= 0 ? [242, 97, 107] : [45, 212, 191]
  const t = Math.min(1, Math.abs(v)) ** 0.85
  return `rgb(${a.map((x, k) => Math.round(x + (b[k] - x) * t)).join(',')})`
}

/* ── Main asking-price index chart ─────────────────────── */
// start   – first month shown (date-range filter)
// show    – { main, second, forecast } legend toggles
// onPhase – click on a phase band label (opens the "Market phases" dialog)
export function IndexChart({ nominal, real, mode = 'Nominal', height = 420, start = 0, show = { main: true, second: true, forecast: true }, onPhase, onForecast }) {
  const id = useId().replace(/:/g, '')
  const wrap = useRef(null)
  const [hover, setHover] = useState(null)
  const W = 1046, H = height, pl = 56, pr = 24, pt = 24, pb = 48
  const last = 75
  const cw = W - pl - pr, ch = H - pt - pb
  const main = mode === 'Nominal' ? nominal : real
  const second = mode === 'Nominal' ? real : nominal
  const fc = useMemo(() => forecast(main), [main])
  const vis = (arr) => arr.slice(start)
  const all = [...(show.main ? vis(main) : []), ...(show.second ? vis(second) : []), ...(show.forecast ? fc.flatMap((f) => [f.hi, f.lo]) : []), ...vis(main)]
  const vmin = Math.floor((Math.min(...all) - 8) / 10) * 10
  const vmax = Math.ceil((Math.max(...all) + 8) / 10) * 10
  const X = (i) => pl + (cw * (i - start)) / (last - start)
  const Y = (v) => pt + ch * (1 - (v - vmin) / (vmax - vmin))
  const path = (arr) => arr.map((v, i) => [i, v]).filter(([i]) => i >= start).map(([i, v], k) => `${k ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')
  const span = vmax - vmin
  const step = span > 120 ? 40 : span > 60 ? 30 : span > 30 ? 10 : 5
  const ticks = []
  for (let v = Math.ceil(vmin / step) * step; v <= vmax; v += step) ticks.push(v)
  const years = Array.from({ length: 7 }, (_, k) => k * 12).filter((i) => i >= start)
  const cMain = mode === 'Nominal' ? '#2DD4BF' : '#F5A524'
  const cSecond = mode === 'Nominal' ? '#F5A524' : '#2DD4BF'

  const onMove = (e) => {
    const r = wrap.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    const i = Math.round(start + ((x - pl) / cw) * (last - start))
    setHover(i >= start && i < 70 ? i : null)
  }
  const key = `${mode}${nominal[69]}${start}`
  const bands = PHASES.map((p) => ({ ...p, from: Math.max(p.from, start), to: Math.min(p.to, last) })).filter((p) => p.to > p.from)
  const crisis = { from: Math.max(CRISIS.from, start), to: CRISIS.to }

  return (
    <div ref={wrap} style={{ position: 'relative', width: '100%' }} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id={`a${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={cMain} stopOpacity=".38" /><stop offset="1" stopColor={cMain} stopOpacity="0" /></linearGradient>
          <linearGradient id={`l${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2DD4BF" /><stop offset="1" stopColor="#38BDF8" /></linearGradient>
        </defs>
        {bands.map((p) => (
          <g key={p.label} onClick={() => onPhase?.()} style={{ cursor: onPhase ? 'pointer' : 'default' }}>
            <rect x={X(p.from)} y={pt} width={X(p.to) - X(p.from)} height={ch} fill={p.color} />
            {X(p.to) - X(p.from) > 110 && <text x={X(p.from) + 10} y={pt + 20} fontSize="12" fontWeight="700" fill="var(--muted)">{p.label.toUpperCase()}</text>}
          </g>
        ))}
        {crisis.to > crisis.from && (
          <g onClick={() => onPhase?.()} style={{ cursor: onPhase ? 'pointer' : 'default' }}>
            <rect x={X(crisis.from)} y={pt} width={X(crisis.to) - X(crisis.from)} height={ch} fill="#F5A524" opacity=".13" />
            <text x={X(crisis.from) + 10} y={pt + 40} fontSize="12" fontWeight="700" fill="#F5A524">2022 CRISIS</text>
          </g>
        )}
        {ticks.map((v) => (
          <g key={v}>
            <line x1={pl} x2={W - pr} y1={Y(v)} y2={Y(v)} stroke="var(--line2)" strokeDasharray="3 5" />
            <text x={pl - 12} y={Y(v) + 4} fontSize="12" fill="var(--faint)" textAnchor="end">{v}</text>
          </g>
        ))}
        {years.map((i) => <text key={i} x={X(i)} y={H - 18} fontSize="12" fill="var(--faint)" textAnchor="middle">{2021 + i / 12}</text>)}
        {start % 12 !== 0 && <text x={X(start)} y={H - 18} fontSize="12" fill="var(--faint)" textAnchor="start">{MONTHS[start].label}</text>}
        {[45, 47, 49].filter((i) => i >= start).map((i) => <line key={i} x1={X(i)} x2={X(i)} y1={pt} y2={pt + ch} stroke="#2DD4BF" strokeWidth="1.2" strokeDasharray="4 4" opacity=".7" />)}

        {show.main && (
          <motion.path key={'a' + key} d={`${path(main)} L${X(69)},${pt + ch} L${X(start)},${pt + ch} Z`} fill={`url(#a${id})`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.8 }} />
        )}
        {show.second && (
          <motion.path key={'s' + key} d={path(second)} fill="none" stroke={cSecond} strokeWidth="2" strokeLinejoin="round" opacity=".85"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: 'easeInOut' }} />
        )}
        {show.main && (
          <motion.path key={'m' + key} d={path(main)} fill="none" stroke={mode === 'Nominal' ? `url(#l${id})` : cMain} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, ease: 'easeInOut' }} />
        )}

        {show.forecast && (
          <motion.g key={'f' + key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7, duration: 0.6 }}
            onClick={() => onForecast?.()} style={{ cursor: onForecast ? 'pointer' : 'default' }}>
            <path d={`M${fc.map((f, k) => `${X(69 + k)},${Y(f.hi)}`).join(' L')} L${[...fc].reverse().map((f, k) => `${X(75 - k)},${Y(f.lo)}`).join(' L')} Z`} fill="#38BDF8" opacity=".2" />
            <path d={`M${fc.map((f, k) => `${X(69 + k)},${Y(f.mid)}`).join(' L')}`} fill="none" stroke="#38BDF8" strokeWidth="2.6" strokeDasharray="6 5" />
            <rect x={X(70) - 30} y={Y(fc[3].hi) - 40} width="74" height="24" rx="12" fill="var(--blue-soft)" stroke="#38BDF8" strokeOpacity=".5" />
            <text x={X(70) + 7} y={Y(fc[3].hi) - 24} fontSize="12" fontWeight="700" fill="#38BDF8" textAnchor="middle">Forecast</text>
          </motion.g>
        )}
        {show.main && (
          <g>
            <circle cx={X(69)} cy={Y(main[69])} r="10" fill={cMain} opacity=".25"><animate attributeName="r" values="6;14;6" dur="2s" repeatCount="indefinite" /></circle>
            <circle cx={X(69)} cy={Y(main[69])} r="4.5" fill={cMain} stroke="var(--bg)" strokeWidth="2" />
          </g>
        )}

        {hover !== null && (
          <g>
            <line x1={X(hover)} x2={X(hover)} y1={pt} y2={pt + ch} stroke="var(--ink)" strokeOpacity=".35" />
            {show.main && <circle cx={X(hover)} cy={Y(main[hover])} r="5" fill={cMain} stroke="var(--bg)" strokeWidth="2" />}
            {show.second && <circle cx={X(hover)} cy={Y(second[hover])} r="4" fill={cSecond} stroke="var(--bg)" strokeWidth="2" />}
          </g>
        )}
      </svg>
      <AnimatePresence>
        {hover !== null && (show.main || show.second) && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="glass" style={{
              position: 'absolute', top: 30, left: `calc(${(X(hover) / W) * 100}% + ${(hover - start) / (70 - start) > 0.7 ? -190 : 14}px)`,
              padding: '12px 14px', borderRadius: 12, minWidth: 170, pointerEvents: 'none', background: 'var(--pop)',
            }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{MONTHS[hover].label}</div>
            {show.main && <div className="row" style={{ justifyContent: 'space-between', fontSize: 13, gap: 12 }}><span className="muted">{mode}</span><b style={{ color: cMain }}>{main[hover].toFixed(1)}</b></div>}
            {show.second && <div className="row" style={{ justifyContent: 'space-between', fontSize: 13, gap: 12 }}><span className="muted">{mode === 'Nominal' ? 'Inflation-adj.' : 'Nominal'}</span><b style={{ color: cSecond }}>{second[hover].toFixed(1)}</b></div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Event study chart (policy insights) ───────────────── */
export function EventStudyChart({ effects }) {
  const id = useId().replace(/:/g, '')
  const W = 700, H = 320, pl = 50, pb = 52, pt = 20
  const xs = Array.from({ length: 19 }, (_, i) => i - 6)
  const X = (k) => pl + ((W - pl - 20) * (k + 6)) / 18
  const Y = (v) => pt + ((H - pt - pb) * (4 - v)) / 20
  const up = xs.map((k, i) => `${X(k)},${Y(effects[i] + 1 + Math.abs(k) * 0.12)}`)
  const lo = xs.map((k, i) => `${X(k)},${Y(effects[i] - 1 - Math.abs(k) * 0.12)}`).reverse()
  const line = xs.map((k, i) => `${i ? 'L' : 'M'}${X(k)},${Y(effects[i])}`).join(' ')
  const key = effects.join(',')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs><linearGradient id={id} x1="0" x2="1"><stop offset="0" stopColor="#2DD4BF" /><stop offset="1" stopColor="#38BDF8" /></linearGradient></defs>
      <rect x={X(0)} y={pt} width={X(12) - X(0)} height={H - pt - pb} fill="var(--phase3)" />
      {[4, 0, -4, -8, -12, -16].map((v) => (
        <g key={v}><line x1={pl} x2={W - 20} y1={Y(v)} y2={Y(v)} stroke="var(--line2)" strokeDasharray="3 5" />
          <text x={pl - 10} y={Y(v) + 4} fontSize="12" textAnchor="end" fill="var(--faint)">{v}%</text></g>
      ))}
      <motion.polygon key={'b' + key} points={[...up, ...lo].join(' ')} fill="#2DD4BF" initial={{ opacity: 0 }} animate={{ opacity: 0.18 }} transition={{ delay: 0.8, duration: 0.6 }} />
      <motion.path key={'l' + key} d={line} fill="none" stroke={`url(#${id})`} strokeWidth="3.2" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: 'easeInOut' }} />
      {xs.map((k, i) => (
        <motion.circle key={key + k} cx={X(k)} cy={Y(effects[i])} r="4.2" fill="var(--bg)" stroke="#2DD4BF" strokeWidth="2.2"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.07 * i, type: 'spring', stiffness: 400 }} />
      ))}
      <line x1={X(0)} x2={X(0)} y1={pt} y2={H - pb} stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="5 4" />
      <rect x={X(0) + 8} y={pt + 2} width="196" height="24" rx="12" fill="var(--surface)" stroke="var(--line2)" />
      <text x={X(0) + 106} y={pt + 18} fontSize="12" fontWeight="700" fill="var(--ink)" textAnchor="middle">Cars reopened (1 Feb 2025)</text>
      {[-6, -3, 0, 3, 6, 9, 12].map((k) => <text key={k} x={X(k)} y={H - 28} fontSize="12" textAnchor="middle" fill="var(--faint)">{k > 0 ? '+' : ''}{k}</text>)}
      <text x={W / 2} y={H - 4} fontSize="12" textAnchor="middle" fill="var(--muted)">Months relative to reopening</text>
    </svg>
  )
}

/* ── Small previews for the home cards ─────────────────── */
export function MiniIndex() {
  const s = indexSeries()
  const W = 300, H = 150, n = 76
  const X = (i) => 6 + ((W - 12) * i) / (n - 1)
  const Y = (v) => 6 + (H - 12) * (1 - (v - 80) / 150)
  const d = s.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')
  const fc = forecast(s)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 300 }}>
      <defs><linearGradient id="mi-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2DD4BF" stopOpacity=".38" /><stop offset="1" stopColor="#2DD4BF" stopOpacity="0" /></linearGradient></defs>
      {PHASES.map((p) => <rect key={p.label} x={X(p.from)} y="6" width={X(Math.min(p.to, n - 1)) - X(p.from)} height={H - 12} fill={p.color} />)}
      <rect x={X(15)} y="6" width={X(23) - X(15)} height={H - 12} fill="#F5A524" opacity=".13" />
      <motion.path d={`${d} L${X(69)},${H - 6} L${X(0)},${H - 6} Z`} fill="url(#mi-a)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.9 }} />
      <motion.path d={d} fill="none" stroke="#2DD4BF" strokeWidth="2.4" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.6 }} />
      <motion.path d={`M${fc.map((f, k) => `${X(69 + k)},${Y(f.mid)}`).join(' L')}`} fill="none" stroke="#38BDF8" strokeWidth="2.4" strokeDasharray="5 4"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.6 }} />
    </svg>
  )
}

export function MiniHeat() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, width: '100%', maxWidth: 300 }}>
      {EXPOSURE.slice(0, 5).flat().map((v, i) => (
        <motion.div key={i} style={{ height: 25, borderRadius: 5, background: heatColor(v) }}
          initial={{ opacity: 0, scale: 0.4 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          transition={{ delay: (i % 7) * 0.05 + Math.floor(i / 7) * 0.06, duration: 0.4 }} />
      ))}
    </div>
  )
}

export function MiniTimeline() {
  const pts = [[20, '#F2616B', '2020'], [95, '#F5A524', '2022'], [190, '#2DD4BF', '2024'], [270, '#60A5FA', '2025']]
  return (
    <svg viewBox="0 0 300 150" width="100%" style={{ maxWidth: 300 }}>
      <defs><linearGradient id="mt-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#F2616B" /><stop offset=".4" stopColor="#F5A524" /><stop offset=".7" stopColor="#2DD4BF" /><stop offset="1" stopColor="#60A5FA" /></linearGradient></defs>
      <motion.rect x="14" y="83.5" height="3" rx="1.5" fill="url(#mt-g)" initial={{ width: 0 }} whileInView={{ width: 272 }} viewport={{ once: true }} transition={{ duration: 1.2 }} />
      {pts.map(([x, c, l], i) => (
        <motion.g key={l} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.25 }}>
          <circle cx={x} cy="85" r="13" fill={c} opacity=".22" />
          <circle cx={x} cy="85" r="7" fill={c} />
          <text x={x} y="117" fontSize="12" fontWeight="600" fill="var(--muted)" textAnchor="middle">{l}</text>
        </motion.g>
      ))}
      <motion.g initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.4, type: 'spring' }}>
        <rect x="140" y="14" width="146" height="32" rx="16" fill="var(--teal-soft)" stroke="#2DD4BF" strokeOpacity=".5" />
        <text x="213" y="35" fontSize="13" fontWeight="800" fill="#2DD4BF" textAnchor="middle">−12% after reopening</text>
      </motion.g>
    </svg>
  )
}
