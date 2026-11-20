import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n.jsx'
import { PageHeader, Stagger, item } from '../components/Layout.jsx'
import { aboutIndexModal, useModal } from '../components/Modal.jsx'
import { EventStudyChart } from '../components/Charts.jsx'
import { Icon, IconBox } from '../components/ui.jsx'
import { EVENT_STUDY, FINDINGS, POLICY_EVENTS } from '../data/sample.js'

export default function PolicyInsights() {
  const modal = useModal()
  const { t } = useLang()
  const [seg, setSeg] = useState('All cars')
  const effects = EVENT_STUDY[seg]
  const last = effects[effects.length - 1]
  return (
    <>
      <PageHeader onSample={() => modal.open(aboutIndexModal())} title={t('pol.title', 'Empirical Policy Insights')} sub="Data-backed evidence on how import rules and economic shocks change used car prices in Sri Lanka."
        right={<button className="btn btn-primary" onClick={() => window.print()}><Icon name="download" color="#04121A" size={18} /> Policy brief (PDF)</button>} />

      <Stagger className="grid-4">
        {POLICY_EVENTS.map((e) => (
          <motion.div variants={item} key={e.title} className="card col hover-lift" style={{ padding: 22, gap: 10, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 20, right: 20, height: 3, borderRadius: 2, background: e.color, boxShadow: `0 0 14px ${e.color}` }} />
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <IconBox name={e.icon} color={e.color} soft={e.soft} size={38} icon={19} radius={11} />
              <span style={{ fontSize: 12, fontWeight: 800, color: e.color }}>{e.date}</span>
            </div>
            <span style={{ fontSize: 17, fontWeight: 800 }}>{e.title}</span>
            <motion.span initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, type: 'spring', stiffness: 260 }}
              style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.03em', color: e.color, transformOrigin: 'left' }}>{e.value}</motion.span>
            <span className="muted" style={{ fontSize: 13, lineHeight: 1.45 }}>{e.note}</span>
          </motion.div>
        ))}
      </Stagger>

      <Stagger>
        <div className="row stack-md" style={{ gap: 24, marginTop: 24, alignItems: 'stretch' }}>
          <motion.div variants={item} className="card col" style={{ flex: 1, padding: 24, gap: 12, minWidth: 0 }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 19, fontWeight: 800 }}>Event study: the February 2025 car reopening</span>
              <select className="select" style={{ height: 38, width: 160, fontSize: 14 }} value={seg} onChange={(e) => setSeg(e.target.value)}>
                {Object.keys(EVENT_STUDY).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <span className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>Estimated change in average asking price compared with the month before reopening (shaded band: 95% confidence interval).</span>
            <EventStudyChart effects={effects} />
            <motion.div key={seg} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="row" style={{ gap: 10, alignItems: 'center', fontSize: 14 }}>
              <span className="badge" style={{ background: 'var(--teal-soft)', color: 'var(--teal)', height: 30, fontSize: 14 }}>{last.toFixed(1).replace('-', '−')}%</span>
              <span className="muted">change for <b style={{ color: 'var(--ink)' }}>{seg.toLowerCase()}</b> 12 months after reopening</span>
            </motion.div>
          </motion.div>
          <motion.div variants={item} className="card col" style={{ width: 400, maxWidth: '100%', padding: 24, gap: 12, flex: 'none' }}>
            <span style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>Key findings</span>
            {FINDINGS.map((f, i) => (
              <motion.div key={i} className="row" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.12 }}
                whileHover={{ x: 4, borderColor: 'var(--teal-line)' }}
                style={{ gap: 14, alignItems: 'flex-start', padding: 14, borderRadius: 14, background: 'var(--inset)', border: '1px solid var(--line)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 9, background: 'var(--grad)', color: '#04121a', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{i + 1}</div>
                <span style={{ fontSize: 14, lineHeight: 1.55 }}>{f}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div variants={item} className="row" style={{ marginTop: 24, padding: '20px 24px', gap: 14, alignItems: 'flex-start', borderRadius: 18, background: 'var(--blue-soft)', border: '1px solid var(--blue-line)' }}>
          <Icon name="info" color="var(--blue)" />
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--muted)' }}><b style={{ color: 'var(--ink)' }}>How these are estimated:</b> staggered difference-in-differences and interrupted time-series models on monthly hedonic price indices, using asking prices from online adverts. The results are statistical estimates of association and should not be read as exact causal effects.</p>
        </motion.div>
      </Stagger>
    </>
  )
}
