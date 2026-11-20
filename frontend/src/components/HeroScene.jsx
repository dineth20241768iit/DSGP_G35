import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CarSvg } from './ui.jsx'
import { useTheme } from '../theme.jsx'

/*
  Animated hero background (like PriceMart's hero video, but built with SVG + CSS so it stays light):
  - two skyline layers moving at different speeds (parallax)
  - street lights and lane markings moving fast → the car looks like it is driving
  - our car with headlight beam, plus a car passing in the far lane
  - price tags that pop up above the car
  - the AutoPulse "pulse" line running across the sky
*/

// Seeded random so the skyline looks the same on every load
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647 }

function skyline(seed, width, minH, maxH, color, windowColor, windowChance) {
  const r = rng(seed)
  let x = 0
  const parts = []
  while (x < width) {
    const w = 40 + Math.floor(r() * 70)
    const h = minH + Math.floor(r() * (maxH - minH))
    parts.push(`<rect x="${x}" y="${maxH - h}" width="${w - 4}" height="${h}" fill="${color}"/>`)
    for (let wy = maxH - h + 10; wy < maxH - 8; wy += 14)
      for (let wx = x + 7; wx < x + w - 12; wx += 12)
        if (r() < windowChance) parts.push(`<rect x="${wx}" y="${wy}" width="4" height="6" fill="${windowColor}" opacity="${(0.35 + r() * 0.6).toFixed(2)}"/>`)
    x += w
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${maxH}" viewBox="0 0 ${width} ${maxH}">${parts.join('')}</svg>`
}
const toUrl = (svg) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
const SKY = {
  dark: { far: toUrl(skyline(7, 1600, 60, 150, '#1a2640', '#38BDF8', 0.1)), near: toUrl(skyline(19, 1600, 40, 110, '#131d35', '#F5A524', 0.14)) },
  light: { far: toUrl(skyline(7, 1600, 60, 150, '#dde5f0', '#8fc3e6', 0.12)), near: toUrl(skyline(19, 1600, 40, 110, '#cbd6e5', '#f0bd5e', 0.14)) },
}

const TAGS = [
  { text: 'Fair price · Rs. 6.45M', color: 'var(--teal)' },
  { text: 'Imports reopened · −12%', color: 'var(--sky)' },
  { text: 'USD/LKR 302.4', color: 'var(--amber)' },
  { text: 'Aqua 2015 · Fair deal ✓', color: 'var(--green)' },
]

export default function HeroScene() {
  const reduce = useReducedMotion()
  const { theme } = useTheme()
  const { far: FAR, near: NEAR } = SKY[theme]
  const [tag, setTag] = useState(0)
  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setTag((v) => (v + 1) % TAGS.length), 2600)
    return () => clearInterval(t)
  }, [reduce])

  return (
    <div className="hero-scene" aria-hidden="true">
      {/* pulse line across the sky */}
      <svg className="scene-pulse" viewBox="0 0 1600 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pulse-g" x1="0" x2="1"><stop offset="0" stopColor="#2DD4BF" stopOpacity="0" /><stop offset=".3" stopColor="#2DD4BF" /><stop offset=".7" stopColor="#38BDF8" /><stop offset="1" stopColor="#38BDF8" stopOpacity="0" /></linearGradient>
          <filter id="pulse-glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <path className="pulse-path" d="M0 70 H420 L440 70 L452 58 L464 70 L478 70 L492 20 L508 108 L526 6 L544 86 L558 70 L590 70 L604 62 L618 70 H1020 L1040 70 L1052 60 L1064 70 L1078 70 L1092 28 L1108 104 L1126 14 L1144 84 L1158 70 L1190 70 L1204 62 L1218 70 H1600"
          fill="none" stroke="url(#pulse-g)" strokeWidth="3" strokeLinejoin="round" filter="url(#pulse-glow)" />
      </svg>

      <div className="scene-layer far" style={{ backgroundImage: FAR }} />
      <div className="scene-layer near" style={{ backgroundImage: NEAR }} />

      <div className="scene-road">
        <div className="scene-lights" />
        <div className="scene-lane" />
        <div className="scene-lane2" />
      </div>

      {/* passing car in the far lane */}
      <div className="scene-passing"><div style={{ transform: 'scaleX(-1)' }}><CarSvg width={96} drive /></div></div>

      {/* our car */}
      <div className="scene-car">
        <div className="scene-beam" />
        <div className="scene-bob"><CarSvg width={210} drive /></div>
        <div className="scene-shadow" />
        <div className="scene-tag-wrap">
          <AnimatePresence mode="wait">
            <motion.span key={tag} className="scene-tag" style={{ color: TAGS[tag].color, borderColor: TAGS[tag].color }}
              initial={{ opacity: 0, y: 14, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -16, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
              {TAGS[tag].text}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      <div className="scene-fade" />
    </div>
  )
}
