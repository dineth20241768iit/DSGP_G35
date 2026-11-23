import { useEffect, useState } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { CarSvg } from './ui.jsx'
import { useLang } from '../i18n.jsx'

/*
  Animated intro shown when the site opens (once per browser session).
  Timeline (~4 s): pulse line draws → logo + name appear → car drives in →
  shock chips pop up → fair price counts up → intro fades away into the Home page.
*/
const DURATION = 4200
const CHIPS = [
  { text: 'Import ban', c: '#F2616B', x: '-30vw', y: '-20vh', mx: '-22vw', my: '-31vh', d: 1.5 },
  { text: 'USD/LKR 302.4', c: '#F5A524', x: '26vw', y: '-24vh', mx: '20vw', my: '-25vh', d: 1.7 },
  { text: 'Imports reopened', c: '#38BDF8', x: '-26vw', y: '17vh', mx: '-18vw', my: '29vh', d: 1.9 },
  { text: 'Inflation 4.1%', c: '#A78BFA', x: '28vw', y: '15vh', mx: '20vw', my: '35vh', d: 2.1 },
]
const LETTERS = 'AutoPulse'.split('')

export function shouldShowIntro() {
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false
    return sessionStorage.getItem('autopulse-intro') !== 'seen'
  } catch { return true }
}
function markSeen() { try { sessionStorage.setItem('autopulse-intro', 'seen') } catch { /* ignore */ } }

export default function Intro({ onDone }) {
  const { t } = useLang()
  const reduce = useReducedMotion()
  const [leaving, setLeaving] = useState(false)
  const small = typeof window !== 'undefined' && window.innerWidth < 640
  const price = useMotionValue(0)
  const priceText = useTransform(price, (v) => `Rs. ${v.toFixed(2)}M`)
  const progress = useMotionValue(0)
  const barWidth = useTransform(progress, (v) => `${v * 100}%`)

  const finish = () => { if (!leaving) { markSeen(); setLeaving(true); setTimeout(onDone, 650) } }

  useEffect(() => {
    if (reduce) { markSeen(); onDone(); return }
    document.body.style.overflow = 'hidden'
    const a1 = animate(progress, 1, { duration: DURATION / 1000, ease: 'linear' })
    const a2 = animate(price, 6.33, { duration: 1.3, delay: 2.0, ease: [0.2, 0.8, 0.2, 1] })
    const timer = setTimeout(finish, DURATION)
    const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish() }
    window.addEventListener('keydown', onKey)
    return () => { a1.stop(); a2.stop(); clearTimeout(timer); window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div className="intro" role="dialog" aria-label="AutoPulse intro"
      initial={{ opacity: 1 }} animate={leaving ? { opacity: 0, scale: 1.04, filter: 'blur(6px)' } : { opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}>
      <div className="intro-glow" />
      <div className="grid-bg" style={{ opacity: 0.8 }} />

      {/* pulse line across the screen */}
      <svg className="intro-pulse" viewBox="0 0 1600 200" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="intro-g" x1="0" x2="1"><stop offset="0" stopColor="#2DD4BF" stopOpacity="0" /><stop offset=".25" stopColor="#2DD4BF" /><stop offset=".75" stopColor="#38BDF8" /><stop offset="1" stopColor="#38BDF8" stopOpacity="0" /></linearGradient>
          <filter id="intro-glow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <motion.path d="M0 110 H180 L198 92 L216 110 L236 110 L258 30 L282 186 L310 10 L336 160 L356 110 L400 110 L418 98 L436 110 H1170 L1188 92 L1206 110 L1226 110 L1248 30 L1272 186 L1300 10 L1326 160 L1346 110 L1390 110 L1408 98 L1426 110 H1600"
          fill="none" stroke="url(#intro-g)" strokeWidth="4" strokeLinejoin="round" filter="url(#intro-glow)"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0, 1, 1, 0.35] }} transition={{ duration: 1.4, ease: 'easeInOut', opacity: { duration: 3, times: [0, 0.1, 0.5, 1] } }} />
      </svg>

      <div className="intro-center">
        {/* logo */}
        <motion.div className="intro-logo" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.5 }}>
          <svg width="44" height="44" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 16a8 8 0 0 1 16 0" fill="none" stroke="#04121A" strokeWidth="2.4" strokeLinecap="round" />
            <motion.path d="M12 16l4-5" stroke="#04121A" strokeWidth="2.4" strokeLinecap="round" style={{ originX: '12px', originY: '16px' }}
              initial={{ rotate: -100 }} animate={{ rotate: 0 }} transition={{ type: 'spring', stiffness: 90, damping: 8, delay: 0.9 }} />
          </svg>
        </motion.div>

        <h1 className="intro-name" aria-label="AutoPulse">
          {LETTERS.map((ch, i) => (
            <motion.span key={i} className={i >= 4 ? 'grad-text' : undefined} style={{ display: 'inline-block' }}
              initial={{ y: 40, opacity: 0, filter: 'blur(8px)' }} animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{ delay: 0.75 + i * 0.05, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}>{ch}</motion.span>
          ))}
        </h1>
        <motion.p className="intro-tag" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.6 }}>
          {t('intro.tag', 'Shock-aware used car prices · Sri Lanka')}
        </motion.p>

        {/* car drives in on a road and stops */}
        <div className="intro-road">
          <motion.div className="intro-lane" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} />
          <motion.div style={{ position: 'absolute', bottom: 8, left: '50%' }}
            initial={{ x: '-80vw' }} animate={leaving ? { x: '70vw' } : { x: '-50%' }}
            transition={leaving ? { duration: 0.6, ease: [0.5, 0, 0.9, 0.4] } : { delay: 1.3, duration: 1.1, ease: [0.15, 0.85, 0.25, 1] }}>
            <CarSvg width={170} drive />
          </motion.div>
        </div>

        {/* price result */}
        <motion.div className="intro-price" initial={{ opacity: 0, y: 16, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 2.0, type: 'spring', stiffness: 220, damping: 18 }}>
          <span className="intro-price-label">{t('intro.fair', 'Fair price')} · Toyota Aqua 2015</span>
          <motion.span className="intro-price-value">{priceText}</motion.span>
        </motion.div>
      </div>

      {/* shock chips around the centre */}
      {CHIPS.map((c) => (
        <motion.span key={c.text} className="intro-chip" style={{ color: c.c, borderColor: `${c.c}66`, left: `calc(50% + ${small ? c.mx : c.x})`, top: `calc(50% + ${small ? c.my : c.y})` }}
          initial={{ opacity: 0, scale: 0.4, x: '-50%', y: '-50%' }} animate={{ opacity: [0, 1, 1, 0.7], scale: 1, x: '-50%', y: ['-50%', '-62%', '-50%'] }}
          transition={{ delay: c.d, duration: 2.4, opacity: { delay: c.d, duration: 2.4, times: [0, 0.15, 0.8, 1] }, y: { delay: c.d, duration: 2.4, ease: 'easeInOut' }, scale: { delay: c.d, type: 'spring', stiffness: 260, damping: 16 } }}>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: c.c, boxShadow: `0 0 10px ${c.c}` }} />{c.text}
        </motion.span>
      ))}

      <button className="intro-skip" onClick={finish}>{t('intro.skip', 'Skip')} →</button>
      <div className="intro-bar"><motion.div style={{ width: barWidth }} /></div>
    </motion.div>
  )
}
