import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { PageHeader, Stagger, item } from '../components/Layout.jsx'
import { aboutIndexModal, useModal } from '../components/Modal.jsx'
import CarForm, { DEFAULT_CAR } from '../components/CarForm.jsx'
import { Icon, IconBox, fmtM } from '../components/ui.jsx'
import { useLang } from '../i18n.jsx'
import { AD_EXAMPLE, SIMILAR, estimatePrice, parseAdvert, parsePrice, verdict } from '../data/sample.js'

/* Semi-circle gauge: −25% … +25% compared with the fair price */
const MIN = -25, MAX = 25
const ang = (p) => Math.PI * (1 - (Math.min(MAX, Math.max(MIN, p)) - MIN) / (MAX - MIN))
function arc(cx, cy, R, p1, p2) {
  const a1 = ang(p1), a2 = ang(p2)
  return `M${cx + R * Math.cos(a1)} ${cy - R * Math.sin(a1)} A${R} ${R} 0 0 1 ${cx + R * Math.cos(a2)} ${cy - R * Math.sin(a2)}`
}

function Gauge({ pct, zones, color }) {
  const cx = 160, cy = 160, R = 128
  const deg = 90 - (ang(pct) * 180) / Math.PI // 0 = straight up
  return (
    <svg viewBox="0 0 320 190" style={{ width: '100%', maxWidth: 380 }} aria-hidden="true">
      <path d={arc(cx, cy, R, MIN, MAX)} stroke="var(--track)" strokeWidth="26" fill="none" strokeLinecap="round" />
      {zones.map((z, k) => (
        <motion.path key={z.c} d={arc(cx, cy, R, z.from, z.to)} stroke={z.c} strokeWidth="26" fill="none" opacity=".9"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.15 * k }} />
      ))}
      {[-20, -10, 0, 10, 20].map((p) => {
        const a = ang(p)
        return <text key={p} x={cx + (R - 34) * Math.cos(a)} y={cy - (R - 34) * Math.sin(a) + 4} textAnchor="middle" fontSize="11" fill="var(--faint)" fontWeight="700">{p > 0 ? '+' : ''}{p}%</text>
      })}
      <motion.g style={{ originX: `${cx}px`, originY: `${cy}px` }} initial={{ rotate: -90 }} animate={{ rotate: deg }} transition={{ type: 'spring', stiffness: 60, damping: 11 }}>
        <path d={`M${cx - 6} ${cy} L${cx} ${cy - R + 6} L${cx + 6} ${cy} Z`} fill={color} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      </motion.g>
      <circle cx={cx} cy={cy} r="14" fill="var(--bg)" stroke={color} strokeWidth="4" />
    </svg>
  )
}

export default function FairDeal() {
  const modal = useModal()
  const { t } = useLang()
  const { state } = useLocation()
  const [car, setCar] = useState(state?.car || { ...DEFAULT_CAR, mileage: 92000 })
  const [asking, setAsking] = useState(state?.asking ? String(state.asking) : '7,150,000')
  const [ad, setAd] = useState('')
  const [found, setFound] = useState(null)

  const r = useMemo(() => estimatePrice(car), [car])
  const price = parsePrice(asking)
  const v = price ? verdict(price, r) : null
  const pct = price ? ((price - r.mid) / r.mid) * 100 : 0
  const toPct = (x) => ((x - r.mid) / r.mid) * 100
  const zones = [
    { from: MIN, to: toPct(r.low), c: '#34D399' },
    { from: toPct(r.low), to: toPct(r.high), c: '#2DD4BF' },
    { from: toPct(r.high), to: toPct(r.high * 1.07), c: '#F5A524' },
    { from: toPct(r.high * 1.07), to: MAX, c: '#F2616B' },
  ]
  const offerLo = r.low, offerHi = Math.max(r.low, Math.min(price || r.mid, r.mid))
  const median = r.mid * (1 + [...SIMILAR.map((s) => s.delta)].sort((a, b) => a - b)[Math.floor(SIMILAR.length / 2)])

  const readAd = (text = ad) => {
    const p = parseAdvert(text)
    const next = { ...car }
    ;['make', 'model', 'year', 'mileage', 'fuel', 'transmission'].forEach((k) => { if (p[k] !== undefined) next[k] = p[k] })
    if (p.make && !p.model) next.model = car.make === p.make ? car.model : next.model
    setCar(next)
    if (p.price) setAsking((p.price * 1e6).toLocaleString())
    setFound(p)
  }

  const tips = {
    good: ['The price is below the fair range. Check why: accident history, repainted panels, or missing documents.', 'Ask for the service records and a mechanic inspection before paying.', 'If everything checks out, this is a strong offer – move quickly.'],
    fair: [`Start your offer around ${fmtM(offerLo)} and settle near ${fmtM(offerHi)}.`, 'Prices for this segment have eased since cars reopened, so there is room to negotiate a little.', 'Compare with 2–3 similar adverts before you decide.'],
    high: [`Offer ${fmtM(r.low)} – ${fmtM(r.mid)} and show the seller similar adverts.`, 'Many sellers still price on ban-era values. Point out that new imports have lowered prices.', 'Ask what is included (new tyres, battery, service) that might justify the price.'],
    over: [`This asking price is well above the fair range. A fair offer is ${fmtM(r.low)} – ${fmtM(r.mid)}.`, 'The seller may be using ban-era prices. Prices for this segment have fallen since February 2025.', 'Unless the car has rare extras, look at other adverts first.'],
  }

  return (
    <>
      <PageHeader onSample={() => modal.open(aboutIndexModal())} title={t('fd.title', 'Is this advert fair?')}
        sub={t('fd.sub', 'Enter the asking price from an advert and see if it is a good deal, a fair price, or overpriced.')} />

      <Stagger>
        <div className="row stack-md" style={{ gap: 24, alignItems: 'stretch' }}>
          {/* ── Inputs ── */}
          <motion.div variants={item} className="card col" style={{ flex: 1.1, padding: 26, gap: 18, minWidth: 0 }}>
            <div className="col" style={{ gap: 8 }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span className="label row" style={{ gap: 8, alignItems: 'center' }}><Icon name="paste" size={16} color="var(--teal)" />{t('fd.paste', 'Paste the advert text (optional)')}</span>
                <button className="chip-btn" onClick={() => { setAd(AD_EXAMPLE); readAd(AD_EXAMPLE) }}>{t('fd.example', 'Try an example')}</button>
              </div>
              <textarea className="ad-text" value={ad} onChange={(e) => setAd(e.target.value)} placeholder="e.g. Toyota Aqua 2015, hybrid, auto, 92,000 km, Rs. 7,150,000" />
              <div className="row" style={{ gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-ghost" style={{ height: 40 }} onClick={() => readAd()} disabled={!ad.trim()}>{t('fd.read', 'Read advert')}</button>
                <AnimatePresence>
                  {found && (
                    <motion.div className="row" style={{ gap: 6, flexWrap: 'wrap' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {Object.keys(found).length === 0
                        ? <span className="muted" style={{ fontSize: 13 }}>Nothing found – fill the fields below.</span>
                        : Object.entries(found).map(([k, val], j) => (
                          <motion.span key={k} className="badge" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: j * 0.06, type: 'spring' }}
                            style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}>
                            <Icon name="check" size={12} color="var(--teal)" />{k === 'price' ? fmtM(val) : k === 'mileage' ? `${val.toLocaleString()} km` : val}
                          </motion.span>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div style={{ height: 1, background: 'var(--line)' }} />
            <CarForm car={car} onChange={setCar} />
            <label className="field">
              <span className="label">{t('f.asking', 'Asking price')} (Rs.)</span>
              <input className="num-input" value={asking} onChange={(e) => setAsking(e.target.value)} placeholder="7,150,000 or 71.5 lakhs" inputMode="decimal" />
              <span style={{ fontSize: 12, color: 'var(--faint)' }}>You can type 7,150,000 · 71.5 lakhs · 7.15M</span>
            </label>
          </motion.div>

          {/* ── Verdict ── */}
          <motion.div variants={item} className="card col" style={{ flex: 1, padding: 26, gap: 14, alignItems: 'center', textAlign: 'center', minWidth: 0,
            background: v ? `radial-gradient(120% 80% at 50% 0%, ${v.soft} 0%, var(--surface) 60%)` : undefined, transition: 'background .5s' }}>
            {v ? (
              <>
                <Gauge pct={pct} zones={zones} color={v.color} />
                <AnimatePresence mode="wait">
                  <motion.div key={v.key} initial={{ opacity: 0, y: 12, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{ fontSize: 34, fontWeight: 800, color: v.color, marginTop: -8 }}>
                    {t('v.' + v.key, v.label)}
                  </motion.div>
                </AnimatePresence>
                <p style={{ fontSize: 15, lineHeight: 1.55 }}>
                  Asking <b>{fmtM(price)}</b> is <b style={{ color: v.color }}>{fmtM(Math.abs(price - r.mid))} ({Math.abs(pct).toFixed(1)}%) {price >= r.mid ? 'above' : 'below'}</b> our fair price of <b>{fmtM(r.mid)}</b>.
                </p>
                <div className="row" style={{ gap: 12, width: '100%', flexWrap: 'wrap' }}>
                  <div className="col" style={{ flex: 1, padding: '12px 14px', borderRadius: 14, background: 'var(--inset)', border: '1px solid var(--line)', gap: 2, minWidth: 140 }}>
                    <span className="label">Fair range</span><b style={{ fontSize: 17 }}>{fmtM(r.low)} – {fmtM(r.high)}</b>
                  </div>
                  <div className="col" style={{ flex: 1, padding: '12px 14px', borderRadius: 14, background: 'var(--teal-soft)', border: '1px solid var(--teal-line)', gap: 2, minWidth: 140 }}>
                    <span className="label" style={{ color: 'var(--teal)' }}>{t('fd.offer', 'Suggested offer')}</span><b style={{ fontSize: 17 }}>{v.key === 'good' || offerHi - offerLo < 0.05 ? fmtM(Math.min(price, offerHi)) : `${fmtM(offerLo)} – ${fmtM(offerHi)}`}</b>
                  </div>
                </div>
              </>
            ) : (
              <div className="col" style={{ gap: 10, alignItems: 'center', margin: 'auto' }}>
                <IconBox name="tag" color="var(--teal)" soft="var(--teal-soft)" size={56} icon={28} />
                <b>Enter the asking price</b><span className="muted" style={{ fontSize: 14 }}>The verdict appears here.</span>
              </div>
            )}
          </motion.div>
        </div>

        {v && (
          <>
            {/* price ruler */}
            <motion.div variants={item} className="card col" style={{ marginTop: 24, padding: 26, gap: 14 }}>
              <span style={{ fontSize: 19, fontWeight: 800 }}>Where the asking price sits</span>
              <PriceRuler r={r} price={price} median={median} color={v.color} />
            </motion.div>

            <div className="row stack-md" style={{ gap: 24, marginTop: 24, alignItems: 'stretch' }}>
              <motion.div variants={item} className="card col" style={{ flex: 1, padding: 26, gap: 12 }}>
                <span style={{ fontSize: 19, fontWeight: 800 }}>{t('fd.why', 'Why this verdict')}</span>
                {[
                  ['spark', 'var(--teal)', <>Our shock-aware fair price for this {car.make} {car.model} is <b>{fmtM(r.mid)}</b>, after a <b>{r.diffPct.toFixed(1).replace('-', '−')}%</b> market adjustment because car imports reopened.</>],
                  ['chart', 'var(--amber)', <>A model that only looks at the car would say <b>{fmtM(r.attrOnly)}</b>. Sellers who still use ban-era prices often ask this much.</>],
                  ['list', 'var(--sky)', <>Similar adverts right now have a median asking price of <b>{fmtM(median)}</b>.</>],
                ].map(([ic, c, txt], k) => (
                  <motion.div key={k} className="row" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + k * 0.1 }}
                    style={{ gap: 12, alignItems: 'flex-start', padding: 14, borderRadius: 14, background: 'var(--inset)', border: '1px solid var(--line)' }}>
                    <Icon name={ic} color={c} /><span style={{ fontSize: 14, lineHeight: 1.55 }}>{txt}</span>
                  </motion.div>
                ))}
              </motion.div>
              <motion.div variants={item} className="card col" style={{ flex: 1, padding: 26, gap: 12 }}>
                <span style={{ fontSize: 19, fontWeight: 800 }}>{t('fd.tips', 'Negotiation tips')}</span>
                <AnimatePresence mode="wait">
                  <motion.div key={v.key} className="col" style={{ gap: 10 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {tips[v.key].map((tip, k) => (
                      <motion.div key={k} className="row" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.08 }} style={{ gap: 12, alignItems: 'flex-start' }}>
                        <span style={{ width: 26, height: 26, borderRadius: 8, background: v.soft, color: v.color, fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{k + 1}</span>
                        <span style={{ fontSize: 14, lineHeight: 1.6 }}>{tip}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
                <p style={{ marginTop: 'auto', fontSize: 12, color: 'var(--faint)', lineHeight: 1.5 }}>Based on asking prices in online adverts, not final sale prices. Always inspect the car and check its documents.</p>
              </motion.div>
            </div>
          </>
        )}
      </Stagger>
    </>
  )
}

function PriceRuler({ r, price, median, color }) {
  const lo = Math.min(r.low, price, median) * 0.9, hi = Math.max(r.high, price, median) * 1.08
  const x = (v) => `${((v - lo) / (hi - lo)) * 100}%`
  const marks = [
    { v: median, label: 'Similar ads (median)', c: 'var(--sky)', top: true },
    { v: r.mid, label: 'Fair price', c: 'var(--teal)', top: false },
  ]
  return (
    <div style={{ position: 'relative', height: 120, margin: '0 10px' }}>
      <div style={{ position: 'absolute', top: 52, left: 0, right: 0, height: 10, borderRadius: 5, background: 'var(--track)' }} />
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8 }}
        style={{ position: 'absolute', top: 48, height: 18, left: x(r.low), width: `calc(${x(r.high)} - ${x(r.low)})`, borderRadius: 9, background: 'linear-gradient(90deg, rgba(45,212,191,.35), rgba(45,212,191,.75), rgba(45,212,191,.35))', transformOrigin: 'left' }} />
      <span style={{ position: 'absolute', top: 72, left: x(r.low), transform: 'translateX(-50%)', fontSize: 12, color: 'var(--muted)' }}>{fmtM(r.low)}</span>
      <span style={{ position: 'absolute', top: 72, left: x(r.high), transform: 'translateX(-50%)', fontSize: 12, color: 'var(--muted)' }}>{fmtM(r.high)}</span>
      {marks.map((m) => (
        <div key={m.label} style={{ position: 'absolute', left: x(m.v), top: m.top ? 6 : 44, transform: 'translateX(-50%)', textAlign: 'center' }}>
          {m.top && <span style={{ fontSize: 12, color: m.c, whiteSpace: 'nowrap', display: 'block', marginBottom: 4 }}>{m.label}</span>}
          <div style={{ width: 3, height: m.top ? 30 : 26, background: m.c, margin: '0 auto', borderRadius: 2 }} />
          {!m.top && <span style={{ fontSize: 12, color: m.c, whiteSpace: 'nowrap', display: 'block', marginTop: 24, fontWeight: 700 }}>{m.label}</span>}
        </div>
      ))}
      <motion.div initial={{ left: x(r.mid) }} animate={{ left: x(price) }} transition={{ type: 'spring', stiffness: 70, damping: 13 }}
        style={{ position: 'absolute', top: 30, transform: 'translateX(-50%)', textAlign: 'center' }}>
        <span className="badge" style={{ background: 'var(--bg)', color, border: `1px solid ${color}`, whiteSpace: 'nowrap', transform: 'translateY(-26px)' }}>Asking {fmtM(price)}</span>
        <div style={{ width: 16, height: 16, borderRadius: 8, margin: '-14px auto 0', background: color, boxShadow: `0 0 14px ${color}`, border: '3px solid var(--bg)' }} />
      </motion.div>
    </div>
  )
}
