import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { PageHeader, Stagger, item } from '../components/Layout.jsx'
import { aboutIndexModal, useModal } from '../components/Modal.jsx'
import CarForm, { DEFAULT_CAR } from '../components/CarForm.jsx'
import { CarSvg, Counter, Icon, fmtM } from '../components/ui.jsx'
import { useLang } from '../i18n.jsx'
import { EXPOSURE, MODEL_SEGMENT, MONTHS, SEGMENT_LISTINGS, estimatePrice, forecast, indexSeries } from '../data/sample.js'

const COLORS = { a: { c: '#2DD4BF', soft: 'var(--teal-soft)', line: 'var(--teal-line)' }, b: { c: '#A78BFA', soft: 'var(--violet-soft)', line: 'var(--violet-line)' } }

function profile(car) {
  const r = estimatePrice(car)
  const seg = MODEL_SEGMENT[car.model] || { seg: 'Sedan', exp: 2, series: 'All cars' }
  const idx = indexSeries(seg.series)
  const last = idx[idx.length - 1]
  const past = idx.slice(-24).map((v) => +(r.mid * (v / last)).toFixed(2))
  const fc = forecast(idx).map((f) => +(r.mid * (f.mid / last)).toFixed(2))
  return {
    car, r, seg,
    reopen: +(EXPOSURE[seg.exp][5] * 20).toFixed(1), // % change in segment prices after cars reopened
    fx: EXPOSURE[seg.exp][1],
    listings: SEGMENT_LISTINGS[seg.exp],
    past, fc,
  }
}

export default function Compare() {
  const modal = useModal()
  const { t } = useLang()
  const navigate = useNavigate()
  const [a, setA] = useState(DEFAULT_CAR)
  const [b, setB] = useState({ make: 'Honda', model: 'Vezel', year: 2016, mileage: 60000, fuel: 'Hybrid', transmission: 'Automatic' })
  const [swapKey, setSwapKey] = useState(0)
  const A = useMemo(() => profile(a), [a])
  const B = useMemo(() => profile(b), [b])
  const swap = () => { setA(b); setB(a); setSwapKey((k) => k + 1) }
  const name = (p) => `${p.car.make} ${p.car.model} ${p.car.year}`
  const cheaper = A.r.mid <= B.r.mid ? A : B, dearer = cheaper === A ? B : A
  const holds = A.reopen >= B.reopen ? A : B

  const rows = [
    { label: 'Fair price', fmt: (p) => fmtM(p.r.mid), val: (p) => p.r.mid, better: 'low', note: 'lower is cheaper' },
    { label: 'Fair range width', fmt: (p) => fmtM(p.r.high - p.r.low), val: (p) => p.r.high - p.r.low, better: 'low', note: 'narrower = more certain' },
    { label: 'Attribute-only estimate', fmt: (p) => fmtM(p.r.attrOnly), val: (p) => p.r.attrOnly, better: null, note: 'what a ban-era model says' },
    { label: 'Price change since cars reopened', fmt: (p) => `${p.reopen > 0 ? '+' : '−'}${Math.abs(p.reopen).toFixed(1)}%`, val: (p) => Math.abs(p.reopen), better: 'low', note: 'smaller fall = holds value' },
    { label: 'Sensitivity to USD/LKR', fmt: (p) => `${p.fx > 0.65 ? 'High' : p.fx > 0.5 ? 'Medium' : 'Low'} (${p.fx.toFixed(2)})`, val: (p) => p.fx, better: 'low', note: 'how much a weaker rupee lifts prices' },
    { label: 'Adverts in this segment', fmt: (p) => p.listings.toLocaleString(), val: (p) => p.listings, better: 'high', note: 'more choice when buying' },
  ]

  return (
    <>
      <PageHeader onSample={() => modal.open(aboutIndexModal())} title={t('cmp.title', 'Compare two cars')}
        sub={t('cmp.sub', 'See the fair price of two cars side by side, and how each one reacts to market shocks.')}
        right={<button className="btn btn-ghost" onClick={swap}><motion.span key={swapKey} initial={{ rotate: 0 }} animate={{ rotate: 180 }} style={{ display: 'flex' }}><Icon name="swap" size={18} /></motion.span>{t('cmp.swap', 'Swap')}</button>} />

      <Stagger>
        <div className="cmp-grid">
          {[[A, setA, 'a', t('cmp.carA', 'Car A')], [B, setB, 'b', t('cmp.carB', 'Car B')]].map(([p, set, k, label]) => {
            const col = COLORS[k]
            return (
              <motion.div variants={item} key={k} className="card col" style={{ padding: 24, gap: 18, borderColor: col.line, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: col.c, boxShadow: `0 0 18px ${col.c}` }} />
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge" style={{ background: col.soft, color: col.c, height: 30, fontSize: 14 }}>{label}</span>
                  <motion.div key={p.car.model + swapKey} initial={{ x: k === 'a' ? -60 : 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 16 }}>
                    <CarSvg width={110} drive />
                  </motion.div>
                </div>
                <CarForm car={p.car} onChange={set} cols={3} />
                <div className="row" style={{ alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '16px 18px', borderRadius: 16, background: col.soft, border: `1px solid ${col.line}` }}>
                  <div className="col" style={{ gap: 2 }}>
                    <span className="label" style={{ color: col.c }}>Fair price</span>
                    <span key={p.r.mid} style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-.02em' }}>Rs. <Counter to={p.r.mid} decimals={2} duration={0.8} />M</span>
                  </div>
                  <div className="col" style={{ gap: 2, textAlign: 'right' }}>
                    <span className="muted" style={{ fontSize: 13 }}>{p.seg.seg}</span>
                    <b style={{ fontSize: 14 }}>{fmtM(p.r.low)} – {fmtM(p.r.high)}</b>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* summary */}
        <motion.div variants={item} className="row stack-md" style={{ marginTop: 24, gap: 16 }}>
          {[
            ['dollar', cheaper === A ? COLORS.a : COLORS.b, <><b>{name(cheaper)}</b> is <b>{fmtM(dearer.r.mid - cheaper.r.mid)}</b> cheaper ({(((dearer.r.mid - cheaper.r.mid) / dearer.r.mid) * 100).toFixed(0)}%).</>],
            ['ship', holds === A ? COLORS.a : COLORS.b, <><b>{name(holds)}</b> held its value better after imports reopened ({holds.reopen > 0 ? '+' : '−'}{Math.abs(holds.reopen).toFixed(1)}%).</>],
          ].map(([ic, col, txt], k) => (
            <AnimatePresence mode="wait" key={k}>
              <motion.div key={k + name(cheaper) + name(holds)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="row" style={{ flex: 1, gap: 14, alignItems: 'center', padding: '16px 20px', borderRadius: 16, background: col.soft, border: `1px solid ${col.line}` }}>
                <Icon name={ic} color={col.c} /><span style={{ fontSize: 15, lineHeight: 1.5 }}>{txt}</span>
              </motion.div>
            </AnimatePresence>
          ))}
        </motion.div>

        {/* head to head */}
        <motion.div variants={item} className="card col" style={{ marginTop: 24, padding: 26, gap: 6 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 19, fontWeight: 800 }}>{t('cmp.h2h', 'Head to head')}</span>
            <div className="row" style={{ gap: 16, fontSize: 13 }}>
              <span className="row" style={{ gap: 7, alignItems: 'center', color: COLORS.a.c }}><span style={{ width: 12, height: 12, borderRadius: 3, background: COLORS.a.c }} />{name(A)}</span>
              <span className="row" style={{ gap: 7, alignItems: 'center', color: COLORS.b.c }}><span style={{ width: 12, height: 12, borderRadius: 3, background: COLORS.b.c }} />{name(B)}</span>
            </div>
          </div>
          {rows.map((row, k) => {
            const va = row.val(A), vb = row.val(B), max = Math.max(va, vb) || 1
            const win = row.better === null || va === vb ? null : (row.better === 'low') === (va < vb) ? 'a' : 'b'
            return (
              <div key={row.label} className="h2h-row" style={{ display: 'grid', gridTemplateColumns: '1fr 220px 1fr', alignItems: 'center', gap: 14, padding: '10px 0', borderTop: k ? '1px solid var(--line)' : 'none' }}>
                <div className="row" style={{ justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
                  <b style={{ fontSize: 14, color: win === 'a' ? COLORS.a.c : 'var(--ink)' }}>{win === 'a' && '✓ '}{row.fmt(A)}</b>
                  <div style={{ width: '60%', display: 'flex', justifyContent: 'flex-end' }}>
                    <motion.div animate={{ width: `${(va / max) * 100}%` }} initial={{ width: 0 }} transition={{ duration: 0.8, delay: k * 0.06 }}
                      style={{ height: 14, borderRadius: 7, background: `linear-gradient(270deg, ${COLORS.a.c}, #13877c)`, opacity: win === 'b' ? 0.45 : 1 }} />
                  </div>
                </div>
                <div className="col" style={{ alignItems: 'center', textAlign: 'center', gap: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{row.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--faint)' }}>{row.note}</span>
                </div>
                <div className="row" style={{ alignItems: 'center', gap: 10 }}>
                  <div style={{ width: '60%' }}>
                    <motion.div animate={{ width: `${(vb / max) * 100}%` }} initial={{ width: 0 }} transition={{ duration: 0.8, delay: k * 0.06 }}
                      style={{ height: 14, borderRadius: 7, background: `linear-gradient(90deg, ${COLORS.b.c}, #6d5bd0)`, opacity: win === 'a' ? 0.45 : 1 }} />
                  </div>
                  <b style={{ fontSize: 14, color: win === 'b' ? COLORS.b.c : 'var(--ink)' }}>{row.fmt(B)}{win === 'b' && ' ✓'}</b>
                </div>
              </div>
            )
          })}
          <style>{`@media(max-width:700px){.h2h-row{grid-template-columns:1fr 1fr!important}.h2h-row>div:nth-child(2){grid-column:1/-1;order:-1}}`}</style>
        </motion.div>

        {/* outlook */}
        <motion.div variants={item} className="card col" style={{ marginTop: 24, padding: 26, gap: 10 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div className="col" style={{ gap: 4 }}>
              <span style={{ fontSize: 19, fontWeight: 800 }}>{t('cmp.outlook', 'Price trend and outlook')}</span>
              <span className="muted" style={{ fontSize: 13 }}>Last 24 months of the segment index, scaled to each car's fair price, plus a 6-month forecast (dashed).</span>
            </div>
            <button className="btn btn-ghost" style={{ height: 40 }} onClick={() => navigate('/fair-deal', { state: { car: a } })}>Check an advert for Car A <Icon name="arrow" size={16} /></button>
          </div>
          <OutlookChart A={A} B={B} />
        </motion.div>
      </Stagger>
    </>
  )
}

function OutlookChart({ A, B }) {
  const [hover, setHover] = useState(null)
  const W = 1000, H = 300, P = { l: 56, r: 20, t: 16, b: 34 }
  const n = 24 + 6
  const all = [...A.past, ...A.fc, ...B.past, ...B.fc]
  const lo = Math.min(...all) * 0.95, hi = Math.max(...all) * 1.04
  const x = (i) => P.l + (i / (n - 1)) * (W - P.l - P.r)
  const y = (v) => P.t + (1 - (v - lo) / (hi - lo)) * (H - P.t - P.b)
  const line = (arr, off = 0) => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i + off).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const labels = [...MONTHS.slice(-24).map((m) => m.label), 'Nov 2026', 'Dec 2026', 'Jan 2027', 'Feb 2027', 'Mar 2027', 'Apr 2027']
  const ticks = Array.from({ length: 5 }, (_, k) => lo + ((hi - lo) * k) / 4)
  const val = (p, i) => (i < 24 ? p.past[i] : p.fc[i - 23])
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}
        onMouseMove={(e) => { const b = e.currentTarget.getBoundingClientRect(); const i = Math.round((((e.clientX - b.left) / b.width) * W - P.l) / ((W - P.l - P.r) / (n - 1))); setHover(i >= 0 && i < n ? i : null) }}
        onMouseLeave={() => setHover(null)}>
        <rect x={x(23)} y={P.t} width={x(n - 1) - x(23)} height={H - P.t - P.b} fill="rgba(56,189,248,.05)" />
        <text x={x(23) + 8} y={P.t + 14} fontSize="12" fill="var(--faint)" fontWeight="700">FORECAST</text>
        {ticks.map((tk) => (
          <g key={tk}><line x1={P.l} x2={W - P.r} y1={y(tk)} y2={y(tk)} stroke="var(--line)" /><text x={P.l - 8} y={y(tk) + 4} fontSize="12" fill="var(--faint)" textAnchor="end">{tk.toFixed(1)}M</text></g>
        ))}
        {[0, 6, 12, 18, 24, 29].map((i) => <text key={i} x={x(i)} y={H - 10} fontSize="12" fill="var(--faint)" textAnchor={i === 29 ? 'end' : 'middle'}>{labels[i]}</text>)}
        {[[A, COLORS.a.c], [B, COLORS.b.c]].map(([p, c]) => (
          <g key={c}>
            <motion.path key={p.past.join()} d={line(p.past)} stroke={c} strokeWidth="3" fill="none" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1 }} />
            <path d={line([p.past[23], ...p.fc.slice(1)], 23)} stroke={c} strokeWidth="3" fill="none" strokeDasharray="6 6" opacity=".8" />
            <circle cx={x(23)} cy={y(p.past[23])} r="5" fill="var(--bg)" stroke={c} strokeWidth="3" />
          </g>
        ))}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={H - P.b} stroke="var(--line2)" />
            <circle cx={x(hover)} cy={y(val(A, hover))} r="5" fill={COLORS.a.c} />
            <circle cx={x(hover)} cy={y(val(B, hover))} r="5" fill={COLORS.b.c} />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div style={{ position: 'absolute', top: 10, left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > n / 2 ? '-110%' : '10%'})`, padding: '10px 12px', borderRadius: 12, background: 'var(--pop)', border: '1px solid var(--line2)', fontSize: 13, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          <b>{labels[hover]}</b>{hover > 23 && <span className="muted"> · forecast</span>}
          <div style={{ color: COLORS.a.c }}>Car A: {fmtM(val(A, hover))}</div>
          <div style={{ color: COLORS.b.c }}>Car B: {fmtM(val(B, hover))}</div>
        </div>
      )}
    </div>
  )
}
