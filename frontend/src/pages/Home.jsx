import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { Footer, Navbar } from '../components/Layout.jsx'
import { Blobs, CarSvg, Counter, Icon, IconBox, Reveal, Sparkline } from '../components/ui.jsx'
import { MiniHeat, MiniIndex, MiniTimeline } from '../components/Charts.jsx'
import HeroScene from '../components/HeroScene.jsx'
import { useLang } from '../i18n.jsx'
import { FAQ, LIVE_LISTINGS, MAKES, POPULAR, PULSE, SHOCK_EVENTS, estimatePrice } from '../data/sample.js'

const ROTATING = ['the import ban hits.', 'the rupee falls.', 'imports reopen.', 'inflation spikes.']

export default function Home() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <Blobs items={[
        { x: '55%', y: -260, s: 640, c: 'var(--teal)', o: 0.22 },
        { x: -260, y: 260, s: 560, c: 'var(--violet)', o: 0.16 },
        { x: '78%', y: 420, s: 380, c: 'var(--sky)', o: 0.14 },
        { x: -200, y: 1600, s: 520, c: 'var(--teal)', o: 0.1 },
        { x: '75%', y: 2100, s: 480, c: 'var(--violet)', o: 0.1 },
      ]} />
      <Navbar />
      <Hero />
      <Ticker />
      <MarketPulse />
      <Contributions />
      <NewTools />
      <Timeline />
      <HowItWorks />
      <Faq />
      <Cta />
      <Footer />
    </div>
  )
}

/* ── Hero ──────────────────────────────────────────────── */
function Hero() {
  const { t, lang } = useLang()
  const rot = t('hero.rot', ROTATING)
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI((v) => (v + 1) % ROTATING.length), 2600); return () => clearInterval(t) }, [])
  const stats = [
    { to: 2, label: 'data sources', sub: 'ikman.lk + Riyasewana', c: 'var(--teal)' },
    { to: 70, label: 'months of prices', sub: 'Jan 2021 – Oct 2026', c: 'var(--sky)' },
    { to: 7, label: 'market shocks', sub: 'policy + economy', c: 'var(--violet)' },
  ]
  const fade = (d) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay: d, ease: [0.2, 0.8, 0.2, 1] } })
  return (
    <section className="hero-pad" style={{ position: 'relative', paddingTop: 140 }}>
      <div className="grid-bg" />
      <HeroScene />
      <div className="container row stack-md above" style={{ gap: 56, alignItems: 'center' }}>
        <div className="col" style={{ flex: 1, gap: 24, minWidth: 0 }}>
          <motion.span {...fade(0.1)} className="badge glass" style={{ alignSelf: 'flex-start', minHeight: 34, height: 'auto', padding: '6px 14px', fontSize: 13, borderRadius: 999, whiteSpace: 'normal', maxWidth: '100%' }}>
            <span className="dot-live" />{t('hero.live', 'Live shock-aware pricing · Sri Lanka')}
          </motion.span>
          <motion.h1 {...fade(0.2)} className="hero-h1" style={{ fontSize: 'clamp(40px, 5.2vw, 68px)', lineHeight: 1.04, fontWeight: 800, letterSpacing: '-.035em' }}>
            {t('hero.title', 'Know the fair price, even when')}
            <span className="rot-wrap" style={{ display: 'block', height: '1.08em', position: 'relative' }}>
              <AnimatePresence mode="wait">
                <motion.span key={lang + i} className="grad-text rot" style={{ position: 'absolute', left: 0, whiteSpace: 'nowrap' }}
                  initial={{ y: '60%', opacity: 0, filter: 'blur(6px)' }} animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: '-60%', opacity: 0, filter: 'blur(6px)' }} transition={{ duration: 0.5 }}>
                  {rot[i % rot.length]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>
          <motion.p {...fade(0.35)} className="muted" style={{ fontSize: 19, lineHeight: 1.6, maxWidth: 600 }}>
            {t('hero.sub', 'Other tools only look at the car. AutoPulse also reads the country: the import ban and reopening, the USD/LKR rate, inflation and interest rates.')}
          </motion.p>
          <motion.div {...fade(0.45)} className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
            <a href="#quick-check" className="btn btn-primary btn-lg">{t('hero.cta1', 'Check a fair price')} <Icon name="arrow" color="#04121A" size={18} className="arrow" /></a>
            <Link to="/price-index" className="btn btn-ghost btn-lg"><Icon name="chart" size={18} /> {t('hero.cta2', 'Explore the Price Index')}</Link>
          </motion.div>
          <motion.div {...fade(0.55)} className="row" style={{ gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            {stats.map((s) => (
              <div key={s.label} className="glass col hover-lift" style={{ flex: '1 1 150px', padding: '16px 18px', gap: 2, borderRadius: 16 }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: s.c, letterSpacing: '-.02em' }}><Counter to={s.to} /></span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{s.label}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{s.sub}</span>
              </div>
            ))}
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 40, rotateX: 8 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ flex: '0 1 600px', width: '100%', perspective: 1000 }}>
          <QuickCheck />
        </motion.div>
      </div>
    </section>
  )
}

function QuickCheck() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [f, setF] = useState({ make: 'Toyota', model: 'Aqua', year: 2015, mileage: 85000, fuel: 'Hybrid', transmission: 'Automatic' })
  const [state, setState] = useState('result') // idle | loading | result
  const [res, setRes] = useState(() => estimatePrice(f))
  const set = (k, v) => setF((p) => ({ ...p, [k]: v, ...(k === 'make' ? { model: MAKES[v][0] } : {}) }))
  const run = () => {
    setState('loading')
    setTimeout(() => { setRes(estimatePrice(f)); setState('result') }, 900)
  }
  const sel = (k, label, opts) => (
    <label className="field" style={{ flex: '1 1 45%' }}>
      <span className="label">{label}</span>
      <select className="select" value={f[k]} onChange={(e) => set(k, k === 'year' || k === 'mileage' ? +e.target.value : e.target.value)}>
        {opts.map((o) => <option key={o.v ?? o} value={o.v ?? o}>{o.l ?? o}</option>)}
      </select>
    </label>
  )
  return (
    <div id="quick-check" className="glass" style={{ padding: 30, borderRadius: 24, boxShadow: '0 30px 80px rgba(0,0,0,.45)', scrollMarginTop: 100 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, gap: 12, flexWrap: 'wrap' }}>
        <div className="row" style={{ gap: 12, alignItems: 'center' }}>
          <IconBox name="gauge" color="var(--teal)" soft="var(--teal-soft)" size={42} />
          <div className="col"><span style={{ fontSize: 20, fontWeight: 800 }}>{t('qc.title', 'Quick price check')}</span><span className="muted" style={{ fontSize: 13 }}>{t('qc.sub', 'Takes about 10 seconds')}</span></div>
        </div>
        <span className="badge" style={{ background: 'var(--teal-soft)', color: 'var(--teal)', border: '1px solid var(--teal-line)' }}><Icon name="spark" color="var(--teal)" size={12} />Shock-aware model</span>
      </div>
      <div className="row" style={{ flexWrap: 'wrap', gap: 16 }}>
        {sel('make', t('f.make', 'Make'), Object.keys(MAKES))}
        {sel('model', t('f.model', 'Model'), MAKES[f.make])}
        {sel('year', t('f.year', 'Year'), Array.from({ length: 12 }, (_, k) => 2010 + k))}
        {sel('mileage', t('f.mileage', 'Mileage'), [20000, 40000, 60000, 85000, 110000, 140000].map((v) => ({ v, l: `${v.toLocaleString()} km` })))}
        {sel('fuel', t('f.fuel', 'Fuel type'), ['Hybrid', 'Petrol', 'Diesel', 'Electric'])}
        {sel('transmission', t('f.trans', 'Transmission'), ['Automatic', 'Manual'])}
      </div>
      <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 22 }} onClick={run} disabled={state === 'loading'}>
        {state === 'loading' ? <><span style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid #04121A', borderTopColor: 'transparent', animation: 'spin .8s linear infinite' }} /> {t('qc.loading', 'Reading the market…')}</> : <>{t('qc.go', 'Get fair price range')} <Icon name="arrow" color="#04121A" size={18} className="arrow" /></>}
      </button>
      <div style={{ marginTop: 18, minHeight: 88 }}>
        <AnimatePresence mode="wait">
          {state === 'loading' ? (
            <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col" style={{ gap: 10, padding: 18 }}>
              <div className="skeleton" style={{ height: 14, width: '40%' }} />
              <div className="skeleton" style={{ height: 26, width: '70%' }} />
            </motion.div>
          ) : (
            <motion.div key={res.mid + res.model} initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
              className="row" style={{ padding: '18px 20px', borderRadius: 16, background: 'linear-gradient(135deg, rgba(45,212,191,.16) 0%, rgba(56,189,248,.06) 100%)', border: '1px solid var(--teal-line)', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div className="row" style={{ gap: 16, alignItems: 'center' }}>
                <span className="hide-sm"><CarSvg width={100} drive /></span>
                <div className="col" style={{ gap: 2 }}>
                  <span className="label">Fair price range</span>
                  <span style={{ fontSize: 24, fontWeight: 800 }}>Rs. {res.low.toFixed(1)}M – {res.high.toFixed(1)}M</span>
                </div>
              </div>
              <div className="col" style={{ alignItems: 'flex-end', gap: 2 }}>
                <span className="label">Most likely</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)' }}>Rs. {res.mid.toFixed(2)}M</span>
                <button onClick={() => navigate('/price-check', { state: f })} style={{ fontSize: 13, fontWeight: 700, color: 'var(--sky)' }}>Full report →</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── Scrolling ticker ──────────────────────────────────── */
function Ticker() {
  const tagColor = { Fair: ['var(--teal)', 'var(--teal-soft)'], 'Above fair': ['var(--red)', 'var(--red-soft)'], 'Below fair': ['var(--green)', 'var(--green-soft)'] }
  const listings = [...LIVE_LISTINGS, ...LIVE_LISTINGS]
  const models = [...POPULAR, ...POPULAR]
  return (
    <section className="above" style={{ paddingBottom: 72 }}>
      <div className="container row" style={{ alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span className="dot-live" /><span style={{ fontSize: 15, fontWeight: 700 }}>On the market right now</span>
        <span className="muted" style={{ fontSize: 14 }}>· compared with our fair price</span>
      </div>
      <div className="marquee">
        <div className="marquee-track">
          {listings.map((l, k) => (
            <div key={k} className="card row" style={{ padding: '14px 18px', gap: 14, alignItems: 'center', minWidth: 300, borderRadius: 16 }}>
              <IconBox name="pin" color="var(--sky)" soft="var(--blue-soft)" size={38} icon={18} radius={10} />
              <div className="col" style={{ gap: 2, flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{l.car}</span>
                <span className="muted" style={{ fontSize: 12 }}>{l.place} · {l.price}</span>
              </div>
              <span className="badge" style={{ background: tagColor[l.tag][1], color: tagColor[l.tag][0] }}>{l.tag}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="marquee" style={{ marginTop: 14 }}>
        <div className="marquee-track" style={{ animationDirection: 'reverse', animationDuration: '55s' }}>
          {models.map((m, k) => <Link key={k} to="/price-check" className="chip" style={{ color: 'var(--ink)' }}>{m}</Link>)}
        </div>
      </div>
    </section>
  )
}

/* ── Market pulse ──────────────────────────────────────── */
function MarketPulse() {
  return (
    <section className="container above">
      <Reveal><div className="row" style={{ alignItems: 'baseline', gap: 10, marginBottom: 18 }}><span className="eyebrow">Market pulse</span><span className="muted" style={{ fontSize: 14 }}>today’s conditions</span></div></Reveal>
      <div className="grid-4">
        {PULSE.map((p, k) => (
          <Reveal key={p.label} delay={k * 0.1}>
            <div className="card col hover-lift" style={{ padding: 22, gap: 14 }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <IconBox name={p.icon} color={p.color} soft={p.soft} size={40} icon={20} />
                <Sparkline values={p.spark} color={p.color} />
              </div>
              <div className="col" style={{ gap: 4 }}>
                <span className="label">{p.label}</span>
                <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.02em' }}>{p.value}</span>
                <span style={{ fontSize: 13, color: p.subColor || 'var(--muted)' }}>{p.sub}</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ── Contribution cards with 3D tilt ───────────────────── */
function TiltCard({ children, accent }) {
  const x = useMotionValue(0.5), y = useMotionValue(0.5)
  const rx = useSpring(useTransform(y, [0, 1], [7, -7]), { stiffness: 200, damping: 20 })
  const ry = useSpring(useTransform(x, [0, 1], [-7, 7]), { stiffness: 200, damping: 20 })
  const glowX = useTransform(x, (v) => `${v * 100}%`)
  const glowY = useTransform(y, (v) => `${v * 100}%`)
  const glow = useTransform([glowX, glowY], ([gx, gy]) => `radial-gradient(360px circle at ${gx} ${gy}, color-mix(in srgb, ${accent} 14%, transparent), transparent 60%)`)
  return (
    <motion.div
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left) / r.width); y.set((e.clientY - r.top) / r.height) }}
      onMouseLeave={() => { x.set(0.5); y.set(0.5) }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900, height: '100%' }}
      className="card col" whileHover={{ borderColor: accent }}
    >
      <motion.div style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
        background: glow,
      }} />
      <div style={{ position: 'absolute', top: 0, left: 24, right: 24, height: 2, background: accent, borderRadius: 2, boxShadow: `0 0 18px ${accent}` }} />
      {children}
    </motion.div>
  )
}

function Contributions() {
  const items = [
    { icon: 'chart', title: 'Shock-Aware Price Index', to: '/price-index', color: '#2DD4BF', soft: 'var(--teal-soft)', viz: <MiniIndex />,
      text: 'An interactive dashboard of monthly asking-price trends from 2021 to 2026, across the import ban, the economic crisis and the post-reopening phase, with future price trend predictions (Kasar et al., 2025).' },
    { icon: 'grid', title: 'Segment Exposure Map', to: '/segment-map', color: '#A78BFA', soft: 'var(--violet-soft)', viz: <MiniHeat />,
      text: 'See how economy cars, hybrids, SUVs, luxury cars and other segments react to each macroeconomic shock and policy change.' },
    { icon: 'doc', title: 'Empirical Policy Insights', to: '/policy-insights', color: '#F5A524', soft: 'var(--amber-soft)', viz: <MiniTimeline />,
      text: 'Data-backed evidence on how import rules, exchange-rate changes and trade restrictions move used car prices in Sri Lanka.' },
  ]
  return (
    <section className="container above" style={{ paddingTop: 110 }}>
      <Reveal className="col" style={{ gap: 12, maxWidth: 820, margin: '0 auto 36px', alignItems: 'center', textAlign: 'center' }}>
        <span className="eyebrow">Our contribution to the domain</span>
        <h2 style={{ fontSize: 'clamp(32px, 4vw, 46px)', fontWeight: 800, letterSpacing: '-.03em' }}>Three new ways to read the <span className="grad-text">market</span></h2>
        <p className="muted" style={{ fontSize: 17, lineHeight: 1.6 }}>Built on our research into how policy and economic shocks change used car prices in Sri Lanka.</p>
      </Reveal>
      <div className="grid-3">
        {items.map((c, k) => (
          <Reveal key={c.title} delay={k * 0.12} style={{ height: '100%' }}>
            <TiltCard accent={c.color}>
              <div className="col" style={{ padding: 26, gap: 18, height: '100%', position: 'relative' }}>
                <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <IconBox name={c.icon} color={c.color} soft={c.soft} size={46} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: c.color, letterSpacing: '.08em' }}>CONTRIBUTION 0{k + 1}</span>
                </div>
                <span style={{ fontSize: 22, fontWeight: 800 }}>{c.title}</span>
                <div style={{ borderRadius: 14, background: 'var(--inset)', border: '1px solid var(--line)', padding: 14, display: 'flex', justifyContent: 'center', minHeight: 170, alignItems: 'center' }}>{c.viz}</div>
                <p className="muted" style={{ fontSize: 15, lineHeight: 1.6 }}>{c.text}</p>
                <Link to={c.to} className="row" style={{ alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 700, color: c.color, marginTop: 'auto' }}>
                  Open dashboard <Icon name="arrow" color={c.color} size={18} />
                </Link>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ── New tools (fair deal, compare, model performance) ── */
function NewTools() {
  const { t } = useLang()
  const items = [
    { to: '/fair-deal', icon: 'tag', color: '#34D399', soft: 'var(--green-soft)', k: 'nav.fair', title: 'Is this ad fair?',
      text: 'Paste an ikman.lk or Riyasewana advert and see if the asking price is a good deal, fair, or too high, with a suggested offer.', demo: ['Good deal', 'Fair', 'A bit high', 'Overpriced'] },
    { to: '/compare', icon: 'compare', color: '#38BDF8', soft: 'var(--blue-soft)', k: 'nav.compare', title: 'Compare two cars',
      text: 'Put two cars side by side: fair price, range, how each segment reacted to the reopening, and where prices are heading.', demo: ['Aqua 2015', 'vs', 'Vezel 2016'] },
    { to: '/model-performance', icon: 'target', color: '#A78BFA', soft: 'var(--violet-soft)', k: 'nav.model', title: 'Model performance',
      text: 'See how much more accurate the shock-aware model is than an attribute-only model, before and after imports reopened.', demo: ['MAPE 14.8% → 8.6%'] },
  ]
  return (
    <section className="container above" style={{ paddingTop: 110 }}>
      <Reveal className="col" style={{ gap: 12, maxWidth: 820, margin: '0 auto 36px', alignItems: 'center', textAlign: 'center' }}>
        <span className="eyebrow">{t('home.tools', 'New tools')}</span>
        <h2 style={{ fontSize: 'clamp(32px, 4vw, 46px)', fontWeight: 800, letterSpacing: '-.03em' }}>{t('home.toolsTitle', 'Everything you need before you buy')}</h2>
      </Reveal>
      <div className="grid-3">
        {items.map((c, k) => (
          <Reveal key={c.to} delay={k * 0.12} style={{ height: '100%' }}>
            <Link to={c.to} className="card col hover-lift" style={{ padding: 26, gap: 16, height: '100%', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 24, right: 24, height: 3, borderRadius: 2, background: c.color, boxShadow: `0 0 16px ${c.color}` }} />
              <IconBox name={c.icon} color={c.color} soft={c.soft} size={46} />
              <span style={{ fontSize: 21, fontWeight: 800 }}>{t(c.k, c.title)}</span>
              <p className="muted" style={{ fontSize: 15, lineHeight: 1.6 }}>{c.text}</p>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 'auto' }}>
                {c.demo.map((d, j) => (
                  <motion.span key={d} className="badge" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + j * 0.1 }}
                    style={{ background: d === 'vs' ? 'transparent' : c.soft, color: c.color, border: d === 'vs' ? 'none' : `1px solid ${c.color}55` }}>{d}</motion.span>
                ))}
              </div>
              <span className="row" style={{ alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 700, color: c.color }}>Try it <Icon name="arrow" color={c.color} size={18} /></span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ── Timeline (line draws as you scroll) ───────────────── */
function Timeline() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'center 50%'] })
  const width = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  return (
    <section className="container above" style={{ paddingTop: 96 }}>
      <Reveal>
        <div ref={ref} className="card col" style={{ padding: 34, gap: 30 }}>
          <div className="row stack-md" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div className="col" style={{ gap: 6 }}><span className="eyebrow">Timeline</span><span style={{ fontSize: 26, fontWeight: 800 }}>The shocks our model tracks</span></div>
            <Link to="/policy-insights" className="btn btn-ghost">See Policy Insights <Icon name="arrow" size={16} className="arrow" /></Link>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 8, left: 9, right: 0, height: 2, background: 'var(--line2)' }} />
            <motion.div style={{ position: 'absolute', top: 8, left: 9, height: 2, width, background: 'linear-gradient(90deg,#F2616B,#F5A524,#2DD4BF,#60A5FA)', boxShadow: '0 0 12px rgba(45,212,191,.6)' }} />
            <div className="row stack-md" style={{ gap: 16, position: 'relative' }}>
              {SHOCK_EVENTS.map((e, k) => (
                <motion.div key={e.title} className="col" style={{ flex: 1, gap: 10 }}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + k * 0.15 }}>
                  <span style={{ width: 18, height: 18, borderRadius: 9, background: e.color, border: '4px solid var(--inset)', boxShadow: `0 0 0 2px ${e.color}, 0 0 16px ${e.color}` }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: e.color }}>{e.date}</span>
                  <span style={{ fontSize: 17, fontWeight: 700 }}>{e.title}</span>
                  <span className="muted" style={{ fontSize: 14 }}>{e.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

/* ── How it works ──────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    ['Enter your car', 'Make, model, year, mileage, fuel type and transmission.'],
    ['We add the market', 'The model adds this month’s exchange rate, inflation and import-policy phase.'],
    ['Get a fair range', 'See the most likely price, a fair range and what raised or lowered it.'],
  ]
  return (
    <section className="container above" style={{ paddingTop: 96 }}>
      <Reveal className="col" style={{ gap: 8, marginBottom: 26 }}>
        <span className="eyebrow">How it works</span>
        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-.02em' }}>A fair price in three steps</h2>
      </Reveal>
      <div className="grid-3">
        {steps.map(([t, d], k) => (
          <Reveal key={t} delay={k * 0.12}>
            <div className="card col hover-lift" style={{ padding: 26, gap: 14, height: '100%' }}>
              <motion.div whileHover={{ rotate: 8, scale: 1.08 }} style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--grad)', color: '#04121a', fontWeight: 800, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 22px rgba(45,212,191,.25)' }}>{k + 1}</motion.div>
              <span style={{ fontSize: 19, fontWeight: 800 }}>{t}</span>
              <span className="muted" style={{ fontSize: 15, lineHeight: 1.55 }}>{d}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ── FAQ accordion ─────────────────────────────────────── */
function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="container above" style={{ paddingTop: 96, maxWidth: 900, scrollMarginTop: 90 }}>
      <Reveal className="col" style={{ gap: 8, marginBottom: 24, alignItems: 'center', textAlign: 'center' }}>
        <span className="eyebrow">FAQ</span>
        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-.02em' }}>Questions people ask</h2>
      </Reveal>
      <div className="col" style={{ gap: 12 }}>
        {FAQ.map((f, k) => (
          <Reveal key={f.q} delay={k * 0.06}>
            <div className="card" style={{ overflow: 'hidden', borderColor: open === k ? 'var(--teal-line)' : undefined, transition: 'border-color .3s' }}>
              <button onClick={() => setOpen(open === k ? -1 : k)} className="row" style={{ width: '100%', padding: '20px 24px', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', gap: 16 }}>
                <span style={{ fontSize: 17, fontWeight: 700 }}>{f.q}</span>
                <motion.span animate={{ rotate: open === k ? 45 : 0 }} style={{ display: 'flex' }}><Icon name="plus" color="var(--teal)" /></motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === k && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                    <p className="muted" style={{ padding: '0 24px 22px', fontSize: 15, lineHeight: 1.65 }}>{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ── CTA ───────────────────────────────────────────────── */
function Cta() {
  return (
    <section className="container above" style={{ paddingTop: 96 }}>
      <Reveal>
        <div data-theme="dark" className="row stack-md" style={{ color: 'var(--ink)', padding: '44px 48px', borderRadius: 28, background: 'linear-gradient(120deg, #0E5C5A 0%, #1B3A7A 100%)', border: '1px solid #2B6F86', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden', position: 'relative', gap: 24 }}>
          <div className="blob float-a" style={{ right: 120, top: -160, width: 360, height: 360, background: 'var(--teal)', opacity: 0.35, filter: 'blur(80px)' }} />
          <div className="col" style={{ gap: 10, maxWidth: 640, position: 'relative' }}>
            <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-.02em' }}>Selling or buying a used car?</span>
            <span style={{ fontSize: 17, lineHeight: 1.55, color: '#d6eef4' }}>Check the fair price before you post an advert or make an offer. It is free for students and the public.</span>
          </div>
          <div className="row" style={{ gap: 20, alignItems: 'center', position: 'relative', flexWrap: 'wrap' }}>
            <span className="hide-sm"><CarSvg width={190} drive /></span>
            <Link to="/price-check" className="btn btn-lg" style={{ background: '#fff', color: '#04121a' }}>Start a price check <Icon name="arrow" color="#04121A" size={18} className="arrow" /></Link>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
