import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLang } from '../i18n.jsx'
import { PageHeader, Stagger, item } from '../components/Layout.jsx'
import { IndexChart } from '../components/Charts.jsx'
import { Paras, aboutIndexModal, useModal } from '../components/Modal.jsx'
import { Icon, IconBox, ProgressBar, Sparkline, signed } from '../components/ui.jsx'
import { MONTHS, PHASES, SEGMENT_SERIES, forecast, indexSeries, realSeries } from '../data/sample.js'

// Sample brand effect: how strongly each brand followed the market (1 = same as all cars)
const BRANDS = { All: 1, Toyota: 1.05, Honda: 0.96, Suzuki: 1.12, Nissan: 0.9 }
// Date-range presets → first month index (0 = Jan 2021)
const RANGES = { 'Jan 2021 – Oct 2026': 0, 'Jan 2025 – Oct 2026': 48, 'Jan 2026 – Oct 2026': 60 }
const LISTINGS = [6912, 7104, 6850, 7220, 412]

export default function PriceIndex() {
  const modal = useModal()
  const { t } = useLang()
  const { state } = useLocation()
  const [seg, setSeg] = useState(state?.segment || 'All cars')
  const [brand, setBrand] = useState('All')
  const [range, setRange] = useState('Jan 2021 – Oct 2026')
  const [mode, setMode] = useState('Nominal')
  const [show, setShow] = useState({ main: true, second: true, forecast: true })

  const nominal = useMemo(() => indexSeries(seg).map((v) => +(100 + (v - 100) * BRANDS[brand]).toFixed(1)), [seg, brand])
  const real = useMemo(() => realSeries(nominal), [nominal])
  const main = mode === 'Nominal' ? nominal : real
  const fc = forecast(main)
  const pk = main.indexOf(Math.max(...main.slice(0, 50)))
  const sinceReopen = (main[69] / main[49] - 1) * 100
  const next6 = (fc[6].mid / fc[0].mid - 1) * 100
  const phaseChange = (a, b) => (main[b] / main[a] - 1) * 100
  const phases = [
    { label: 'Import ban (2020–Sep 2024)', v: phaseChange(0, 44), c: '#F2616B', c2: '#8F2F3A' },
    { label: '2022 crisis (Apr–Dec)', v: phaseChange(15, 23), c: '#F5A524', c2: '#A3680D' },
    { label: 'Staged reopening (Oct 24–Jan 25)', v: phaseChange(44, 48), c: '#2DD4BF', c2: '#13877C' },
    { label: 'After reopening (Feb 25–now)', v: sinceReopen, c: '#38BDF8', c2: '#1F6C9A' },
  ]
  const maxPhase = Math.max(...phases.map((p) => Math.abs(p.v)))
  const monthChange = (i) => (main[i] / main[i - 1] - 1) * 100
  const segLabel = seg === 'All cars' ? 'all used cars' : `${seg.toLowerCase()} cars`

  /* ── dialogs (match the overlay frames in Figma) ── */
  const back = [{ label: 'Back to chart', primary: true }]
  const openPhases = () => modal.open({
    title: 'Market phases',
    body: <Paras>{phases.map((p) => <p key={p.label}><b style={{ color: 'var(--ink)' }}>{p.label.replace(' (', ' · ').replace(')', '')}:</b> <span style={{ color: p.c, fontWeight: 700 }}>{signed(p.v)}</span></p>)}<p>All values are sample data for {segLabel}.</p></Paras>,
    actions: back,
  })
  const openForecast = () => modal.open({
    title: 'Six-month forecast',
    body: <Paras><p><b style={{ color: 'var(--ink)', fontSize: 20 }}>{signed(next6)}</b> · uncertainty ±2.0%</p><p>The forecast continues the recent trend for the next six months (method based on Kasar et al., 2025). It is an estimate, not a guaranteed future price.</p></Paras>,
    actions: back,
  })
  const kpiModal = {
    'Index now': () => modal.open({ title: 'Current price index', actions: back,
      body: <Paras><p><b style={{ color: 'var(--ink)', fontSize: 20 }}>{main[69].toFixed(1)}</b> · October 2026</p><p>Baseline: Jan 2021 = 100.<br />{LISTINGS[0].toLocaleString()} listings · monthly change {signed(monthChange(69))}.</p></Paras> }),
    'Since cars reopened': () => modal.open({ title: 'Since cars reopened', actions: back,
      body: <Paras><p><b style={{ color: 'var(--ink)', fontSize: 20 }}>{signed(sinceReopen)}</b></p><p>February 2025 → October 2026, for {segLabel}. Passenger car imports reopened on 1 February 2025.</p></Paras> }),
    Peak: () => modal.open({ title: 'Market peak', actions: back,
      body: <Paras><p><b style={{ color: 'var(--ink)', fontSize: 20 }}>{main[pk].toFixed(1)}</b> · {MONTHS[pk].label}</p><p>The index peaked during the import ban, just before the staged reopening began.</p></Paras> }),
    'Next 6 months': openForecast,
  }
  const openLowSample = () => modal.open({
    title: 'Low sample size', actions: [{ label: 'Got it', primary: true }],
    body: <Paras><p>June 2026 has 412 listings in this sample, compared with thousands in the other displayed months.</p><p>Index: {main[65].toFixed(1)} · monthly change: {signed(monthChange(65))}. Interpret low-sample movements with care.</p></Paras>,
  })
  const csvRows = [69, 68, 67, 66, 65].map((i, j) => `${MONTHS[i].label}, ${main[i].toFixed(1)}, ${signed(monthChange(i))}, ${LISTINGS[j]}`)
  const downloadCsv = () => {
    const rows = ['month,index_nominal,index_inflation_adjusted', ...MONTHS.map((m, i) => `${m.label},${nominal[i]},${real[i]}`).slice(RANGES[range])]
    const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: `autopulse-index-${seg.replace(/\s/g, '-').toLowerCase()}.csv` })
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }
  const openExport = () => modal.open({
    title: 'Export CSV',
    body: <Paras><p>The file has every month in the selected range. These are the latest rows:</p>
      <pre style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 13, color: 'var(--ink)', background: 'var(--inset)', border: '1px solid var(--line)', borderRadius: 10, padding: 14, overflowX: 'auto' }}>{['Month, Index, Change, Listings', ...csvRows].join('\n')}</pre></Paras>,
    actions: [{ label: 'Download CSV', primary: true, onClick: downloadCsv }, { label: 'Done' }],
  })
  const openBrand = () => modal.open({
    title: 'Choose a brand',
    body: <p>Filter the index to one brand. The chart, cards and table update straight away.</p>,
    actions: [...Object.keys(BRANDS).map((b) => ({ label: b, selected: b === brand, onClick: () => setBrand(b) })), { label: 'Cancel' }],
  })
  const openRange = () => modal.open({
    title: 'Choose a date range',
    body: <p>Zoom the chart to a shorter period. The forecast is always shown after October 2026.</p>,
    actions: [...Object.keys(RANGES).map((r) => ({ label: r, selected: r === range, onClick: () => setRange(r) })), { label: 'Cancel' }],
  })

  const kpi = [
    { icon: 'chart', label: 'Index now', value: main[69].toFixed(1), sub: 'Jan 2021 = 100', c: '#2DD4BF', soft: 'var(--teal-soft)', spark: main.slice(50), plain: true },
    { icon: 'ship', label: 'Since cars reopened', value: signed(sinceReopen), sub: 'Feb 2025 → Oct 2026', c: '#38BDF8', soft: 'var(--blue-soft)', spark: main.slice(49) },
    { icon: 'fire', label: 'Peak', value: main[pk].toFixed(1), sub: `${MONTHS[pk].label}, during the ban`, c: '#F2616B', soft: 'var(--red-soft)', spark: main.slice(30, 46), plain: true },
    { icon: 'spark', label: 'Next 6 months', value: signed(next6), sub: 'forecast, ±2.0%', c: '#A78BFA', soft: 'var(--violet-soft)', spark: fc.map((f) => f.mid) },
  ]
  const toggle = (k) => setShow((s) => ({ ...s, [k]: !s[k] }))
  const legendItem = (k, label, color, dashed) => (
    <button onClick={() => toggle(k)} className="row legend-btn" aria-pressed={show[k]}
      style={{ gap: 6, alignItems: 'center', opacity: show[k] ? 1 : 0.4, color: 'var(--muted)', fontSize: 13 }}>
      <span style={{ width: 18, height: 0, borderTop: `3px ${dashed ? 'dashed' : 'solid'} ${color}`, borderRadius: 2 }} />
      <span style={{ textDecoration: show[k] ? 'none' : 'line-through' }}>{label}</span>
    </button>
  )

  return (
    <>
      <PageHeader title={t('pi.title', 'Shock-Aware Price Index')} onSample={() => modal.open(aboutIndexModal())}
        sub="Monthly asking-price trends from 2021 to 2026, with the shocks that moved them and a 6-month forecast."
        right={<button className="btn btn-ghost" onClick={openExport}><Icon name="download" size={18} /> Export CSV</button>} />

      <div className="row" style={{ gap: 10, alignItems: 'center', marginBottom: 22, flexWrap: 'wrap' }}>
        {Object.keys(SEGMENT_SERIES).map((s) => (
          <button key={s} className={`chip ${seg === s ? 'on' : ''}`} onClick={() => setSeg(s)}>{s}</button>
        ))}
        <button className="select row" onClick={openBrand} style={{ width: 160, height: 36, fontSize: 14, alignItems: 'center', textAlign: 'left' }}>Brand: {brand}</button>
        <div className="row" style={{ marginLeft: 'auto', gap: 10, flexWrap: 'wrap' }}>
          <div className="row" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 4 }}>
            {['Nominal', 'Inflation-adjusted'].map((m) => (
              <button key={m} onClick={() => setMode(m)} style={{ position: 'relative', padding: '7px 14px', fontSize: 13, fontWeight: 700, color: mode === m ? '#04121A' : 'var(--muted)' }}>
                {mode === m && <motion.span layoutId="mode-pill" style={{ position: 'absolute', inset: 0, borderRadius: 9, background: 'var(--grad)' }} transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                <span style={{ position: 'relative' }}>{m}</span>
              </button>
            ))}
          </div>
          <button className="select" onClick={openRange} style={{ width: 200, height: 36, fontSize: 14, textAlign: 'left' }}>{range}</button>
        </div>
      </div>

      <Stagger className="grid-4" key={seg + mode + brand}>
        {kpi.map((k) => (
          <motion.button variants={item} key={k.label} onClick={kpiModal[k.label]} className="card col hover-lift" style={{ padding: 20, gap: 12, textAlign: 'left', cursor: 'pointer' }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <IconBox name={k.icon} color={k.c} soft={k.soft} size={38} icon={19} radius={11} />
              <Sparkline values={k.spark} color={k.c} width={96} height={34} />
            </div>
            <div className="col" style={{ gap: 3 }}>
              <span className="label">{k.label}</span>
              <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-.02em', color: k.plain ? 'var(--ink)' : k.c }}>{k.value}</span>
              <span className="muted" style={{ fontSize: 13 }}>{k.sub}</span>
            </div>
          </motion.button>
        ))}
      </Stagger>

      <Stagger>
        <motion.div variants={item} className="card col" style={{ marginTop: 20, padding: '26px 24px 12px', gap: 12 }}>
          <div className="row stack-md" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 19, fontWeight: 800 }}>Asking-price index, {segLabel}{brand !== 'All' ? ` · ${brand}` : ''}</span>
            <div className="row" style={{ gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              {legendItem('main', mode, mode === 'Nominal' ? 'var(--teal)' : 'var(--amber)')}
              {legendItem('second', mode === 'Nominal' ? 'Inflation-adjusted' : 'Nominal', mode === 'Nominal' ? 'var(--amber)' : 'var(--teal)')}
              {legendItem('forecast', 'Forecast', 'var(--sky)', true)}
              {PHASES.map((p) => (
                <button key={p.label} onClick={openPhases} className="row legend-btn hide-sm" style={{ gap: 6, alignItems: 'center', color: 'var(--muted)', fontSize: 13 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: p.legend }} />{p.label}
                </button>
              ))}
            </div>
          </div>
          <IndexChart nominal={nominal} real={real} mode={mode} start={RANGES[range]} show={show} onPhase={openPhases} onForecast={openForecast} />
          <span style={{ fontSize: 12, color: 'var(--faint)', paddingBottom: 6 }}>
            Showing: {seg} · Brand: {brand} · {range}. Hover over the chart for each month; click a legend item to show or hide it.
          </span>
        </motion.div>

        <div className="row stack-md" style={{ gap: 24, marginTop: 24, alignItems: 'stretch' }}>
          <motion.div variants={item} className="card" style={{ flex: 1.3, overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px', fontSize: 19, fontWeight: 800 }}>Latest months</div>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Month</th><th>Index</th><th>Change</th><th>Listings</th><th>Note</th></tr></thead>
                <tbody>
                  {[69, 68, 67, 66, 65].map((i, j) => {
                    const chg = monthChange(i)
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 700 }}>{MONTHS[i].label}</td>
                        <td>{main[i].toFixed(1)}</td>
                        <td><span className="badge" style={{ background: chg < 0 ? 'var(--teal-soft)' : 'var(--red-soft)', color: chg < 0 ? 'var(--teal)' : 'var(--red)' }}>{signed(chg)}</span></td>
                        <td className="muted">{LISTINGS[j].toLocaleString()}</td>
                        <td>{LISTINGS[j] < 1000 && <button onClick={openLowSample} className="badge badge-sample" style={{ cursor: 'pointer' }}>Low sample</button>}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
          <motion.div variants={item} className="card col" style={{ flex: 1, padding: 24, gap: 18 }}>
            <span style={{ fontSize: 19, fontWeight: 800 }}>Price change by market phase</span>
            {phases.map((p, k) => (
              <button key={p.label} onClick={openPhases} className="col phase-row" style={{ gap: 8, textAlign: 'left', width: '100%' }}>
                <div className="row" style={{ justifyContent: 'space-between', fontSize: 14, width: '100%' }}><span>{p.label}</span><b style={{ color: p.c }}>{signed(p.v)}</b></div>
                <div style={{ width: '100%' }}><ProgressBar value={p.v} max={maxPhase} from={p.c2} to={p.c} delay={0.3 + k * 0.1} /></div>
              </button>
            ))}
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.55 }}>Hedonic index: prices are adjusted for car age, mileage, make and model, so changes reflect the market, not a different mix of cars.</p>
          </motion.div>
        </div>
      </Stagger>
      <style>{`.legend-btn{transition:opacity .2s}.legend-btn:hover{opacity:1!important;color:var(--ink)!important}.phase-row{border-radius:8px;transition:transform .2s}.phase-row:hover{transform:translateX(4px)}`}</style>
    </>
  )
}
