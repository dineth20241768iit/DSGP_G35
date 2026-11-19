import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader, Stagger, item } from '../components/Layout.jsx'
import { Paras, aboutIndexModal, useModal } from '../components/Modal.jsx'
import { Counter, Icon, ProgressBar } from '../components/ui.jsx'
import { useLang } from '../i18n.jsx'
import { DRIFT, ERROR_SERIES, FEATURE_IMPORTANCE, MODEL_METRICS, PERF_MONTHS, PERIOD_ERRORS, REOPEN_MARKS } from '../data/sample.js'

const BASE = '#F5A524', OURS = '#2DD4BF'

export default function ModelPerformance() {
  const modal = useModal()
  const { t } = useLang()
  const driftInfo = () => modal.open({
    title: 'What is a drift check?',
    body: <Paras>
      <p>A model learns from past adverts. When the market changes (for example, when imports reopened), new data can look different from the training data. This is called data drift or concept drift (Lu et al., 2019).</p>
      <p>We compare each month of new data with the training data using the Population Stability Index (PSI). Below 0.10 is stable, 0.10–0.25 needs watching, and above 0.25 means the data has drifted and the model should be retrained.</p>
    </Paras>,
  })

  return (
    <>
      <PageHeader onSample={() => modal.open(aboutIndexModal())} title={t('mp.title', 'Model Performance')}
        sub={t('mp.sub', 'How much better is the shock-aware model? Tested month by month with rolling-origin validation.')} />

      <Stagger className="grid-4">
        {MODEL_METRICS.map((m) => {
          const better = m.lowerBetter ? (m.base - m.ours) / m.base : (m.ours - m.base) / m.base
          const fmt = (v) => (m.unit === 'M' ? `${v.toFixed(2)}M` : m.unit === '%' ? `${v.toFixed(1)}%` : v.toFixed(2))
          return (
            <motion.div variants={item} key={m.key} className="card col hover-lift" style={{ padding: 22, gap: 10 }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="label">{m.label}</span>
                <span className="badge" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>{m.lowerBetter ? '−' : '+'}{Math.round(better * 100)}%</span>
              </div>
              <div className="row" style={{ alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 34, fontWeight: 800, color: OURS, letterSpacing: '-.02em' }}>
                  <Counter to={m.ours} decimals={m.unit === '%' ? 1 : 2} />{m.unit === 'M' ? 'M' : m.unit}
                </span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--faint)', textDecoration: 'line-through' }}>{fmt(m.base)}</span>
              </div>
              <span className="muted" style={{ fontSize: 13, lineHeight: 1.45 }}>{m.note}</span>
            </motion.div>
          )
        })}
      </Stagger>

      <Stagger>
        <motion.div variants={item} className="card col" style={{ marginTop: 24, padding: 26, gap: 10 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div className="col" style={{ gap: 4 }}>
              <span style={{ fontSize: 19, fontWeight: 800 }}>{t('mp.overTime', 'Error over time')} (MAPE)</span>
              <span className="muted" style={{ fontSize: 13 }}>Each month the models are trained on all earlier months and tested on the next one (rolling origin).</span>
            </div>
            <div className="row" style={{ gap: 16, fontSize: 13, flexWrap: 'wrap' }}>
              <span className="row" style={{ gap: 7, alignItems: 'center' }}><span style={{ width: 14, height: 3, borderRadius: 2, background: BASE }} />{t('mp.baseline', 'Attribute-only model')}</span>
              <span className="row" style={{ gap: 7, alignItems: 'center' }}><span style={{ width: 14, height: 3, borderRadius: 2, background: OURS }} />{t('mp.ours', 'Shock-aware model (ours)')}</span>
            </div>
          </div>
          <ErrorChart />
        </motion.div>

        <div className="row stack-md" style={{ gap: 24, marginTop: 24, alignItems: 'stretch' }}>
          <motion.div variants={item} className="card col" style={{ flex: 1, padding: 26, gap: 16, minWidth: 0 }}>
            <span style={{ fontSize: 19, fontWeight: 800 }}>{t('mp.periods', 'Error before and after the reopening')}</span>
            <PeriodBars />
            <div className="row" style={{ gap: 12, padding: '14px 16px', borderRadius: 14, background: 'var(--teal-soft)', border: '1px solid var(--teal-line)', alignItems: 'flex-start' }}>
              <Icon name="spark" color="var(--teal)" />
              <span style={{ fontSize: 14, lineHeight: 1.55 }}>After cars reopened, the attribute-only model's error almost <b>doubled</b>. The shock-aware model stayed close to its ban-era accuracy.</span>
            </div>
          </motion.div>

          <motion.div variants={item} className="card col" style={{ flex: 1, padding: 26, gap: 8, minWidth: 0 }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <div className="col" style={{ gap: 4 }}>
                <span style={{ fontSize: 19, fontWeight: 800 }}>{t('mp.features', 'Most important factors')}</span>
                <span className="muted" style={{ fontSize: 13 }}>Mean |SHAP| value in the shock-aware model</span>
              </div>
              <div className="row" style={{ gap: 14, fontSize: 12 }}>
                <span className="row" style={{ gap: 6, alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--sky)' }} />Car detail</span>
                <span className="row" style={{ gap: 6, alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--violet)' }} />Shock variable</span>
              </div>
            </div>
            {FEATURE_IMPORTANCE.map((f, k) => (
              <div key={f.label} className="row" style={{ alignItems: 'center', gap: 12, height: 30 }}>
                <span style={{ width: 170, fontSize: 13, flex: 'none', fontWeight: f.shock ? 700 : 500, color: f.shock ? 'var(--violet)' : 'var(--ink)' }}>{f.label}</span>
                <div style={{ flex: 1 }}>
                  <ProgressBar value={f.v} max={1} height={12} delay={0.2 + k * 0.05} from={f.shock ? '#6d5bd0' : '#1e6fa8'} to={f.shock ? 'var(--violet)' : 'var(--sky)'} />
                </div>
                <span style={{ width: 34, fontSize: 13, textAlign: 'right', color: 'var(--muted)' }}>{f.v.toFixed(2)}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="row stack-md" style={{ gap: 24, marginTop: 24, alignItems: 'stretch' }}>
          <motion.div variants={item} className="card" style={{ flex: 1.3, overflow: 'hidden', minWidth: 0 }}>
            <div className="row" style={{ padding: '22px 24px', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div className="col" style={{ gap: 4 }}>
                <span style={{ fontSize: 19, fontWeight: 800 }}>{t('mp.drift', 'Drift check')}</span>
                <span className="muted" style={{ fontSize: 13 }}>Oct 2026 data vs training data · Population Stability Index</span>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <span className="badge" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>Retrain recommended</span>
                <button className="chip-btn" onClick={driftInfo}>What is this?</button>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Feature</th><th>PSI</th><th style={{ width: '38%' }}></th><th>Status</th></tr></thead>
                <tbody>
                  {DRIFT.map((d, k) => {
                    const [label, c, bg] = d.psi > 0.25 ? ['Drift', 'var(--red)', 'var(--red-soft)'] : d.psi > 0.1 ? ['Watch', 'var(--amber)', 'var(--amber-soft)'] : ['Stable', 'var(--green)', 'var(--green-soft)']
                    return (
                      <motion.tr key={d.feature} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + k * 0.06 }}>
                        <td style={{ fontWeight: 700 }}>{d.feature}</td>
                        <td>{d.psi.toFixed(2)}</td>
                        <td><ProgressBar value={d.psi} max={0.5} height={8} delay={0.4 + k * 0.06} from={c} to={c} /></td>
                        <td><span className="badge" style={{ background: bg, color: c }}>{label}</span></td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div variants={item} className="card col" style={{ flex: 1, padding: 26, gap: 12, minWidth: 0 }}>
            <span style={{ fontSize: 19, fontWeight: 800 }}>Model card</span>
            {[
              ['Algorithm', 'XGBoost (LightGBM tested)'],
              ['Baseline', 'Same model, car details only'],
              ['Shock variables', 'import_reopened, months_since_reopening, usd_lkr_rate, inflation'],
              ['Validation', 'Rolling origin, 1-month-ahead'],
              ['Training data', 'ikman.lk + Riyasewana adverts, Jan 2021 – Oct 2026'],
              ['Target', 'Asking price (log), not final sale price'],
            ].map(([k, v]) => (
              <div key={k} className="row" style={{ justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: 14 }}>
                <span className="muted" style={{ flex: 'none' }}>{k}</span><b style={{ textAlign: 'right' }}>{v}</b>
              </div>
            ))}
            <p style={{ fontSize: 12, color: 'var(--faint)', lineHeight: 1.5, marginTop: 'auto' }}>All numbers on this page are sample values for the prototype. They will be replaced with the real test results.</p>
          </motion.div>
        </div>
      </Stagger>
    </>
  )
}

function ErrorChart() {
  const [hover, setHover] = useState(null)
  const W = 1000, H = 320, P = { l: 48, r: 20, t: 30, b: 34 }
  const n = ERROR_SERIES.length, top = 32
  const x = (i) => P.l + (i / (n - 1)) * (W - P.l - P.r)
  const y = (v) => P.t + (1 - v / top) * (H - P.t - P.b)
  const path = (k) => ERROR_SERIES.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(d[k]).toFixed(1)}`).join(' ')
  const gap = ERROR_SERIES.map((d, i) => `${i ? 'L' : 'M'}${x(i)} ${y(d.base)}`).join(' ') + ' ' + [...ERROR_SERIES].reverse().map((d, j) => `L${x(n - 1 - j)} ${y(d.ours)}`).join(' ') + ' Z'
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}
        onMouseMove={(e) => { const b = e.currentTarget.getBoundingClientRect(); const i = Math.round((((e.clientX - b.left) / b.width) * W - P.l) / ((W - P.l - P.r) / (n - 1))); setHover(i >= 0 && i < n ? i : null) }}
        onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="gapfill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={BASE} stopOpacity=".22" /><stop offset="1" stopColor={BASE} stopOpacity=".02" /></linearGradient>
        </defs>
        <rect x={x(REOPEN_MARKS[2].t)} y={P.t} width={x(n - 1) - x(REOPEN_MARKS[2].t)} height={H - P.t - P.b} fill="rgba(96,165,250,.05)" />
        {[0, 8, 16, 24, 32].map((v) => <g key={v}><line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke="var(--line)" /><text x={P.l - 8} y={y(v) + 4} fontSize="12" fill="var(--faint)" textAnchor="end">{v}%</text></g>)}
        {REOPEN_MARKS.map((m, k) => (
          <g key={m.label}>
            <line x1={x(m.t)} x2={x(m.t)} y1={P.t} y2={H - P.b} stroke="#60A5FA" strokeDasharray="4 5" opacity=".6" />
            <circle cx={x(m.t)} cy={P.t} r="9" fill="var(--blue-soft)" stroke="#60A5FA" />
            <text x={x(m.t)} y={P.t + 4} fontSize="11" fill="#60A5FA" fontWeight="800" textAnchor="middle">{k + 1}</text>
          </g>
        ))}
        {PERF_MONTHS.map((m, i) => (i % 6 === 0 ? <text key={i} x={x(i)} y={H - 10} fontSize="12" fill="var(--faint)" textAnchor="middle">{m.label}</text> : null))}
        <motion.path d={gap} fill="url(#gapfill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }} />
        <motion.path d={path('base')} stroke={BASE} strokeWidth="3" fill="none" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: 'easeInOut' }} />
        <motion.path d={path('ours')} stroke={OURS} strokeWidth="3" fill="none" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, delay: 0.25, ease: 'easeInOut' }} style={{ filter: 'drop-shadow(0 0 6px rgba(45,212,191,.5))' }} />
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={H - P.b} stroke="var(--line2)" />
            <circle cx={x(hover)} cy={y(ERROR_SERIES[hover].base)} r="5" fill={BASE} />
            <circle cx={x(hover)} cy={y(ERROR_SERIES[hover].ours)} r="5" fill={OURS} />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div style={{ position: 'absolute', top: 30, left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > n / 2 ? '-110%' : '10%'})`, padding: '10px 12px', borderRadius: 12, background: 'var(--pop)', border: '1px solid var(--line2)', fontSize: 13, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          <b>{PERF_MONTHS[hover].label}</b>
          <div style={{ color: BASE }}>Attribute-only: {ERROR_SERIES[hover].base}%</div>
          <div style={{ color: OURS }}>Shock-aware: {ERROR_SERIES[hover].ours}%</div>
        </div>
      )}
      <div className="row" style={{ gap: 18, flexWrap: 'wrap', fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
        <span style={{ color: '#60A5FA', fontWeight: 700 }}>Reopening stages:</span>
        <span>1 · Public transport (Oct 2024)</span><span>2 · Commercial vehicles (Dec 2024)</span><span>3 · Cars (Feb 2025)</span>
      </div>
    </div>
  )
}

function PeriodBars() {
  const max = 20
  return (
    <div className="row" style={{ gap: 18, alignItems: 'flex-end', height: 230, padding: '0 6px' }}>
      {PERIOD_ERRORS.map((p, k) => (
        <div key={p.label} className="col" style={{ flex: 1, alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
          <div className="row" style={{ gap: 8, alignItems: 'flex-end', height: 170 }}>
            {[[p.base, BASE], [p.ours, OURS]].map(([v, c], j) => (
              <div key={c} className="col" style={{ alignItems: 'center', gap: 4, justifyContent: 'flex-end', height: '100%' }}>
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + k * 0.15 }} style={{ fontSize: 12, fontWeight: 800, color: c }}>{v}%</motion.span>
                <motion.div initial={{ height: 0 }} animate={{ height: `${(v / max) * 140}px` }} transition={{ duration: 0.8, delay: 0.2 + k * 0.15 + j * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
                  style={{ width: 34, borderRadius: '8px 8px 3px 3px', background: `linear-gradient(180deg, ${c}, ${c}55)` }} />
              </div>
            ))}
          </div>
          <b style={{ fontSize: 13, textAlign: 'center' }}>{p.label}</b>
          <span style={{ fontSize: 11, color: 'var(--faint)', textAlign: 'center' }}>{p.sub}</span>
        </div>
      ))}
    </div>
  )
}
