import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useLang } from '../i18n.jsx'
import { PageHeader, Stagger, item } from '../components/Layout.jsx'
import { aboutIndexModal, useModal } from '../components/Modal.jsx'
import { CarSvg, Counter, Icon } from '../components/ui.jsx'
import { MAKES, SIMILAR, estimatePrice } from '../data/sample.js'

export default function PriceCheck() {
  const modal = useModal()
  const { t } = useLang()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [f, setF] = useState(state || { make: 'Toyota', model: 'Aqua', year: 2015, mileage: 85000, fuel: 'Hybrid', transmission: 'Automatic' })
  const [showForm, setShowForm] = useState(false)
  const r = useMemo(() => estimatePrice(f), [f])
  const set = (k, v) => setF((p) => ({ ...p, [k]: v, ...(k === 'make' ? { model: MAKES[v][0] } : {}) }))
  const maxAbs = Math.max(...r.contributions.map((c) => Math.abs(c.value)))
  const pos = ((r.mid - r.low) / (r.high - r.low)) * 100

  return (
    <>
      <PageHeader onSample={() => modal.open(aboutIndexModal())} title={t('pc.title', 'Price Check')} sub={`${f.make} ${f.model} · ${f.year} · ${f.fuel} · ${f.transmission} · ${Number(f.mileage).toLocaleString()} km`}
        right={<div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/fair-deal', { state: { car: f } })}><Icon name="tag" size={18} /> {t('nav.fair', 'Is this ad fair?')}</button>
          <button className="btn btn-ghost" onClick={() => setShowForm(!showForm)}>{showForm ? 'Hide details' : 'Edit details'}</button>
          <button className="btn btn-primary" onClick={() => window.print()}><Icon name="download" color="#04121A" size={18} /> Save report</button>
        </div>} />

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div className="card row" style={{ padding: 22, gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
              {[
                ['make', 'Make', Object.keys(MAKES)], ['model', 'Model', MAKES[f.make]], ['year', 'Year', Array.from({ length: 12 }, (_, k) => 2010 + k)],
                ['mileage', 'Mileage', [20000, 40000, 60000, 85000, 110000, 140000]], ['fuel', 'Fuel', ['Hybrid', 'Petrol', 'Diesel', 'Electric']], ['transmission', 'Transmission', ['Automatic', 'Manual']],
              ].map(([k, l, opts]) => (
                <label key={k} className="field" style={{ flex: '1 1 150px' }}>
                  <span className="label">{l}</span>
                  <select className="select" value={f[k]} onChange={(e) => set(k, k === 'year' || k === 'mileage' ? +e.target.value : e.target.value)}>
                    {opts.map((o) => <option key={o} value={o}>{k === 'mileage' ? `${o.toLocaleString()} km` : o}</option>)}
                  </select>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Stagger>
        <div className="row stack-md" style={{ gap: 24, alignItems: 'stretch' }}>
          <motion.div variants={item} className="card col" style={{ flex: 1.25, padding: 30, gap: 18, background: 'linear-gradient(150deg, var(--teal-soft) 0%, var(--inset) 60%)', borderColor: 'var(--teal-line)', overflow: 'hidden' }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="label">Most likely fair price</span><CarSvg width={120} drive />
            </div>
            <div className="row" style={{ alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span key={r.mid} style={{ fontSize: 'clamp(40px,5vw,58px)', fontWeight: 800, letterSpacing: '-.03em' }}>Rs. <Counter to={r.mid} decimals={2} duration={1} />M</span>
              <span className="badge" style={{ background: 'var(--green-soft)', color: 'var(--green)', border: '1px solid var(--green-line)' }}><Icon name="check" color="var(--green)" size={14} />High confidence</span>
            </div>
            <div className="col" style={{ gap: 10 }}>
              <div style={{ position: 'relative', height: 26 }}>
                <div style={{ position: 'absolute', top: 6, left: 0, right: 0, height: 14, borderRadius: 7, background: 'linear-gradient(90deg, rgba(45,212,191,.15), #2DD4BF, rgba(56,189,248,.15))' }} />
                <motion.div initial={{ left: '0%' }} animate={{ left: `${pos}%` }} transition={{ type: 'spring', stiffness: 80, damping: 14 }}
                  style={{ position: 'absolute', top: 2, width: 22, height: 22, marginLeft: -11, borderRadius: 11, background: 'var(--bg)', border: '3px solid var(--teal)', boxShadow: '0 0 16px rgba(45,212,191,.7)' }} />
              </div>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 14 }}>
                <span className="muted">Rs. {r.low.toFixed(2)}M</span><b>Fair range</b><span className="muted">Rs. {r.high.toFixed(2)}M</span>
              </div>
            </div>
            <div className="row" style={{ gap: 12, padding: '14px 16px', borderRadius: 14, background: 'var(--blue-soft)', border: '1px solid var(--blue-line)', alignItems: 'center' }}>
              <Icon name="info" color="var(--blue)" />
              <span style={{ fontSize: 14, lineHeight: 1.5 }}><b>Market condition:</b> post-reopening, month 21. New car imports are adding supply, so prices for this model have eased since early 2025.</span>
            </div>
          </motion.div>

          <motion.div variants={item} className="card col" style={{ flex: 1, padding: 30, gap: 14 }}>
            <span style={{ fontSize: 19, fontWeight: 800 }}>Why market conditions matter</span>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', borderRadius: 14, background: 'var(--inset)', border: '1px solid var(--line)' }}>
              <span className="muted">Attribute-only model</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--muted)', textDecoration: 'line-through' }}>Rs. {r.attrOnly.toFixed(2)}M</span>
            </div>
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, type: 'spring' }}
              className="row" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', borderRadius: 14, background: 'var(--teal-soft)', border: '1px solid var(--teal-line)', boxShadow: '0 0 30px rgba(45,212,191,.15)' }}>
              <span style={{ fontWeight: 700 }}>Shock-aware model (ours)</span>
              <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--teal)' }}>Rs. {r.mid.toFixed(2)}M</span>
            </motion.div>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', padding: 4 }}>
              <span className="muted">Difference</span>
              <span className="badge" style={{ background: 'var(--red-soft)', color: 'var(--red)', height: 30, fontSize: 14 }}>Rs. {r.diff.toFixed(2)}M ({r.diffPct.toFixed(1).replace('-', '−')}%)</span>
            </div>
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.55 }}>A model trained on ban-era prices would overprice this car today.</p>
          </motion.div>
        </div>

        <motion.div variants={item} className="card col" style={{ marginTop: 24, padding: 28, gap: 6 }}>
          <div className="row stack-md" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 10 }}>
            <div className="col" style={{ gap: 4 }}>
              <span style={{ fontSize: 19, fontWeight: 800 }}>What raised or lowered the price</span>
              <span className="muted" style={{ fontSize: 13 }}>Contribution of each factor to this estimate (SHAP values)</span>
            </div>
            <div className="row" style={{ gap: 18, fontSize: 13, color: 'var(--muted)' }}>
              <span className="row" style={{ gap: 7, alignItems: 'center' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--amber)' }} />Raises price</span>
              <span className="row" style={{ gap: 7, alignItems: 'center' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--teal)' }} />Lowers price</span>
            </div>
          </div>
          {r.contributions.map((c, k) => {
            const w = `${(Math.abs(c.value) / maxAbs) * 100}%`
            const up = c.value > 0
            return (
              <div key={c.label} className="row" style={{ alignItems: 'center', height: 42, gap: 0 }}>
                <span style={{ width: '24%', fontSize: 14 }}>{c.label}</span>
                <div className="row" style={{ flex: 1, justifyContent: 'flex-end' }}>
                  {!up && <motion.div initial={{ width: 0 }} animate={{ width: w }} transition={{ duration: 0.9, delay: 0.3 + k * 0.08 }} style={{ height: 24, borderRadius: 6, background: 'linear-gradient(90deg, #2DD4BF, #13877C)' }} />}
                </div>
                <div style={{ width: 2, height: 42, background: 'var(--line2)' }} />
                <div className="row" style={{ flex: 1 }}>
                  {up && <motion.div initial={{ width: 0 }} animate={{ width: w }} transition={{ duration: 0.9, delay: 0.3 + k * 0.08 }} style={{ height: 24, borderRadius: 6, background: 'linear-gradient(90deg, #B8730F, #F5A524)' }} />}
                </div>
                <span style={{ width: 110, textAlign: 'right', fontSize: 14, fontWeight: 800, color: up ? 'var(--amber)' : 'var(--teal)' }}>{up ? '+' : '−'} Rs. {Math.abs(c.value).toFixed(2)}M</span>
              </div>
            )
          })}
        </motion.div>

        <motion.div variants={item} className="card" style={{ marginTop: 24, overflow: 'hidden' }}>
          <div className="row" style={{ padding: '22px 24px', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 19, fontWeight: 800 }}>Similar listings right now</span>
            <span className="muted hide-sm" style={{ fontSize: 14 }}>Compared with the fair price</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>Listing</th><th>District</th><th>Mileage</th><th>Asking price</th><th>vs fair price</th></tr></thead>
              <tbody>
                {SIMILAR.map((s, k) => {
                  const price = r.mid * (1 + s.delta)
                  const [c, bg] = s.delta > 0.05 ? ['var(--red)', 'var(--red-soft)'] : s.delta < -0.005 ? ['var(--green)', 'var(--green-soft)'] : ['var(--muted)', 'var(--line)']
                  return (
                    <motion.tr key={s.district} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + k * 0.07 }}>
                      <td style={{ fontWeight: 700 }}>{f.make} {f.model} {s.name}</td>
                      <td className="muted">{s.district}</td><td className="muted">{s.mileage}</td>
                      <td style={{ fontWeight: 800 }}>Rs. {price.toFixed(2)}M</td>
                      <td><span className="badge" style={{ background: bg, color: c }}>{s.delta > 0 ? '+' : '−'}{Math.abs(s.delta * 100).toFixed(1)}%</span></td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </Stagger>
    </>
  )
}
