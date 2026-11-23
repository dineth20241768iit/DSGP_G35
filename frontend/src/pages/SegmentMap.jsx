import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useLang } from '../i18n.jsx'
import { PageHeader, Stagger, item } from '../components/Layout.jsx'
import { aboutIndexModal, useModal } from '../components/Modal.jsx'
import { heatColor } from '../components/Charts.jsx'
import { Counter, Icon, ProgressBar } from '../components/ui.jsx'
import { EXPOSURE, SEGMENTS, SEGMENT_LISTINGS, SEGMENT_NOTES, SHOCKS } from '../data/sample.js'

const SEG_TO_INDEX = { 'Economy / K-car': 'Economy', 'Small hybrid': 'Hybrid', SUV: 'SUV', Luxury: 'Luxury' }
const WINDOWS = { '3 months after': 0.7, '6 months after': 1, '12 months after': 1.18 }
const DRIVERS = {
  'Small hybrid': [['Model year', 0.9], ['Imports reopened', 0.68], ['USD/LKR', 0.45], ['Fuel price', 0.41]],
  default: [['Model year', 0.86], ['USD/LKR', 0.58], ['Imports reopened', 0.47], ['Mileage', 0.39]],
}

export default function SegmentMap() {
  const modal = useModal()
  const { t } = useLang()
  const [sel, setSel] = useState({ r: 1, c: 5 })
  const [win, setWin] = useState('6 months after')
  const [real, setReal] = useState(false)
  const mult = WINDOWS[win] * (real ? 0.82 : 1)
  const v = EXPOSURE[sel.r][sel.c] * mult
  const pct = v * 21.8
  const seg = SEGMENTS[sel.r]
  const shockShort = SHOCKS[sel.c].replace(/\s*\(.*\)/, '')
  const ranking = SEGMENTS.map((s, r) => ({ s, v: EXPOSURE[r][sel.c] * mult })).sort((a, b) => Math.abs(b.v) - Math.abs(a.v)).slice(0, 5)
  const drivers = DRIVERS[seg] || DRIVERS.default

  return (
    <>
      <PageHeader onSample={() => modal.open(aboutIndexModal())} title={t('sm.title', 'Segment Exposure Map')} sub="How each vehicle segment responds to macroeconomic shocks and policy changes. Click any cell." />
      <div className="row" style={{ gap: 10, alignItems: 'center', marginBottom: 22, flexWrap: 'wrap' }}>
        <span className="chip on">Heatmap</span>
        <button className={`chip ${real ? 'on' : ''}`} onClick={() => setReal(!real)}>{real ? 'Inflation-adjusted' : 'Nominal prices'}</button>
        <label className="row" style={{ marginLeft: 'auto', alignItems: 'center', gap: 10 }}>
          <span className="muted" style={{ fontSize: 13 }}>Window</span>
          <select className="select" style={{ height: 38, width: 190, fontSize: 14 }} value={win} onChange={(e) => setWin(e.target.value)}>
            {Object.keys(WINDOWS).map((w) => <option key={w}>{w}</option>)}
          </select>
        </label>
      </div>

      <Stagger>
        <div className="row stack-md" style={{ gap: 24, alignItems: 'stretch' }}>
          <motion.div variants={item} className="card col" style={{ flex: 1, padding: 24, gap: 18, minWidth: 0 }}>
            <div className="row stack-md" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 19, fontWeight: 800 }}>Exposure score by segment and shock</span>
              <div className="col" style={{ gap: 6, width: 300, maxWidth: '100%' }}>
                <div style={{ height: 12, borderRadius: 6, background: `linear-gradient(90deg, ${heatColor(-1)}, ${heatColor(0)}, ${heatColor(1)})` }} />
                <div className="row" style={{ justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}><span>Prices fell strongly</span><span>No effect</span><span>Prices rose strongly</span></div>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '136px repeat(7, minmax(72px, 1fr))', gap: 6, minWidth: 690 }}>
                <div />
                {SHOCKS.map((s, c) => (
                  <div key={s} style={{ fontSize: 12, fontWeight: 700, color: c === sel.c ? 'var(--teal)' : 'var(--muted)', textAlign: 'center', lineHeight: 1.35, alignSelf: 'end', paddingBottom: 6, transition: 'color .2s' }}>{s}</div>
                ))}
                {SEGMENTS.map((segName, r) => (
                  <Row key={segName} r={r} segName={segName} sel={sel} setSel={setSel} mult={mult} />
                ))}
              </div>
            </div>
            <p className="muted" style={{ fontSize: 13 }}>Score from −1 to +1: the estimated direction and strength of the price response, scaled within each shock.</p>
          </motion.div>

          <motion.div variants={item} className="glass col" style={{ width: 300, maxWidth: '100%', padding: 24, gap: 16, background: 'linear-gradient(170deg, rgba(45,212,191,.10) 0%, rgba(255,255,255,.03) 45%)', flex: 'none' }}>
            <AnimatePresence mode="wait">
              <motion.div key={`${sel.r}-${sel.c}-${win}-${real}`} className="col" style={{ gap: 16 }}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <span className="label" style={{ color: 'var(--teal)' }}>Selected cell</span>
                <span style={{ fontSize: 23, fontWeight: 800, lineHeight: 1.25 }}>{seg} × {shockShort}</span>
                <div className="row" style={{ gap: 10 }}>
                  <div className="col" style={{ flex: 1, padding: 14, borderRadius: 14, gap: 2, background: pct < 0 ? 'var(--teal-soft)' : 'var(--red-soft)', border: `1px solid ${pct < 0 ? 'var(--teal-line)' : '#5a1d2a'}` }}>
                    <span className="label">Change</span>
                    <span style={{ fontSize: 24, fontWeight: 800, color: pct < 0 ? 'var(--teal)' : 'var(--red)' }}>{pct < 0 ? '−' : '+'}<Counter to={Math.abs(pct)} decimals={1} duration={0.8} />%</span>
                    <span className="muted" style={{ fontSize: 12 }}>{win}</span>
                  </div>
                  <div className="col" style={{ flex: 1, padding: 14, borderRadius: 14, gap: 2, background: 'var(--inset)', border: '1px solid var(--line)' }}>
                    <span className="label">Listings</span>
                    <span style={{ fontSize: 24, fontWeight: 800 }}><Counter to={SEGMENT_LISTINGS[sel.r]} duration={0.8} /></span>
                    <span className="muted" style={{ fontSize: 12 }}>in segment</span>
                  </div>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--muted)' }}>{SEGMENT_NOTES[seg]}</p>
                <span style={{ fontSize: 15, fontWeight: 800 }}>Main price drivers</span>
                {drivers.map(([a, d], k) => (
                  <div key={a} className="col" style={{ gap: 7 }}>
                    <div className="row" style={{ justifyContent: 'space-between', fontSize: 14 }}><span className="muted">{a}</span><b>{d.toFixed(2)}</b></div>
                    <ProgressBar value={d} height={8} from="#2DD4BF" to="#38BDF8" delay={0.1 + k * 0.08} />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
            <Link to="/price-index" state={{ segment: SEG_TO_INDEX[seg] || 'All cars' }} className="btn btn-primary" style={{ marginTop: 'auto' }}>View segment index <Icon name="arrow" color="#04121A" size={16} className="arrow" /></Link>
          </motion.div>
        </div>

        <motion.div variants={item} className="card col" style={{ marginTop: 24, padding: 24, gap: 14 }}>
          <div className="row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 19, fontWeight: 800 }}>Most exposed to: {SHOCKS[sel.c]}</span>
            <span className="muted" style={{ fontSize: 14 }}>Exposure score</span>
          </div>
          {ranking.map((x, i) => (
            <motion.div layout key={x.s} className="row" style={{ alignItems: 'center', gap: 14 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? 'var(--teal-soft)' : 'var(--inset)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: i === 0 ? 'var(--teal)' : 'var(--muted)', flex: 'none' }}>{i + 1}</span>
              <span style={{ width: 150, fontSize: 15, flex: 'none' }}>{x.s}</span>
              <div style={{ flex: 1 }}><ProgressBar value={x.v} max={1} height={12} from={x.v < 0 ? '#13877C' : '#8F2F3A'} to={x.v < 0 ? '#2DD4BF' : '#F2616B'} /></div>
              <b style={{ width: 60, textAlign: 'right', color: x.v < 0 ? 'var(--teal)' : 'var(--red)' }}>{x.v < 0 ? '−' : '+'}{Math.abs(x.v).toFixed(2)}</b>
            </motion.div>
          ))}
        </motion.div>
      </Stagger>
    </>
  )
}

function Row({ r, segName, sel, setSel, mult }) {
  return (
    <>
      <div style={{ fontSize: 15, fontWeight: r === sel.r ? 800 : 500, color: r === sel.r ? 'var(--ink)' : 'var(--muted)', alignSelf: 'center', transition: 'color .2s' }}>{segName}</div>
      {EXPOSURE[r].map((raw, c) => {
        const v = Math.max(-1, Math.min(1, raw * mult))
        const on = sel.r === r && sel.c === c
        return (
          <motion.button key={c} onClick={() => setSel({ r, c })}
            initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: on ? 1.06 : 1, backgroundColor: heatColor(v) }}
            whileHover={{ scale: 1.1, zIndex: 2 }} whileTap={{ scale: 0.95 }}
            transition={{ delay: (r * 7 + c) * 0.012, duration: 0.35 }}
            style={{
              height: 52, borderRadius: 10, fontSize: 15, fontWeight: 800, position: 'relative',
              color: Math.abs(v) > 0.45 ? '#06101C' : 'var(--ink)',
              boxShadow: on ? '0 0 0 3px var(--ink), 0 0 26px rgba(45,212,191,.6)' : 'none',
            }}
            aria-label={`${segName} – ${SHOCKS[c]}: ${v.toFixed(2)}`}>
            {v > 0 ? '+' : v < 0 ? '−' : ''}{Math.abs(v).toFixed(2)}
          </motion.button>
        )
      })}
    </>
  )
}
