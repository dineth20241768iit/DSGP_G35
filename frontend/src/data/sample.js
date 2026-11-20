// ─────────────────────────────────────────────────────────────
// SAMPLE DATA ONLY – replace with the model / API output later.
// Every number here is made up for the UI prototype.
// ─────────────────────────────────────────────────────────────

const MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// 70 months: Jan 2021 → Oct 2026
export const MONTHS = Array.from({ length: 70 }, (_, i) => ({
  year: 2021 + Math.floor(i / 12),
  month: (i % 12) + 1,
  label: `${MN[i % 12]} ${2021 + Math.floor(i / 12)}`,
}))

function baseIndex(t) {
  let v
  if (t <= 15) v = 100 + t * 1.6 // ban, slow rise
  else if (t <= 23) v = 124 + (t - 15) * 5.2 // 2022 crisis
  else if (t <= 44) v = 166 + (t - 23) * 1.9 // ban continues
  else if (t <= 48) v = 206 - (t - 44) * 4.0 // staged reopening
  else v = 190 - (t - 48) * 0.85 // after cars reopened
  return v + Math.sin(t * 1.3) * 1.8
}

// Segment multipliers for how strongly each segment follows the shocks
export const SEGMENT_SERIES = {
  'All cars': { up: 1.0, down: 1.0 },
  Economy: { up: 1.08, down: 1.1 },
  Hybrid: { up: 1.15, down: 1.35 },
  SUV: { up: 0.95, down: 0.7 },
  Luxury: { up: 0.85, down: 0.55 },
}

export function indexSeries(segment = 'All cars') {
  const m = SEGMENT_SERIES[segment] || SEGMENT_SERIES['All cars']
  const peak = baseIndex(44)
  return MONTHS.map((_, t) => {
    const b = baseIndex(t)
    if (t <= 44) return +(100 + (b - 100) * m.up).toFixed(1)
    const p = 100 + (peak - 100) * m.up
    return +(p - (peak - b) * m.down).toFixed(1)
  })
}

export function realSeries(nominal) {
  return nominal.map((v, i) => +(v / (i < 24 ? 1 + 0.012 * i : 1.288 + 0.004 * (i - 24))).toFixed(1))
}

export function forecast(series) {
  const last = series[series.length - 1]
  return Array.from({ length: 7 }, (_, k) => ({
    mid: +(last - 0.9 * k).toFixed(1),
    lo: +(last - 0.9 * k - 1.6 * k).toFixed(1),
    hi: +(last - 0.9 * k + 1.6 * k).toFixed(1),
  }))
}

// Phase bands on the index chart (month index ranges)
export const PHASES = [
  { from: 0, to: 44.5, label: 'Import ban', color: 'var(--phase1)', legend: 'var(--phase1-l)' },
  { from: 44.5, to: 48.5, label: 'Staged reopening', color: 'var(--phase2)', legend: 'var(--phase2-l)' },
  { from: 48.5, to: 75, label: 'After reopening', color: 'var(--phase3)', legend: 'var(--phase3-l)' },
]
export const CRISIS = { from: 15, to: 23 }

export const SHOCK_EVENTS = [
  { date: '19 Mar 2020', title: 'Import suspension', text: 'Most vehicle imports stopped', color: 'var(--red)' },
  { date: '2022', title: 'Economic crisis', text: 'Rupee falls, inflation peaks', color: 'var(--amber)' },
  { date: '1 Oct 2024', title: 'Stage 1 reopening', text: 'Public transport vehicles', color: 'var(--teal)' },
  { date: '1 Dec 2024', title: 'Stage 2 reopening', text: 'Commercial and goods vehicles', color: 'var(--teal)' },
  { date: '1 Feb 2025', title: 'Stage 3 reopening', text: 'Passenger cars', color: 'var(--blue)' },
]

// ── Segment Exposure Map ───────────────────────────────────
export const SEGMENTS = ['Economy / K-car', 'Small hybrid', 'Sedan', 'SUV', 'Van / pickup', 'Luxury', 'Electric']
export const SHOCKS = [
  'Import ban (Mar 2020)',
  'USD/LKR fall (2022)',
  'Policy rate rise',
  'Reopen: transport (Oct 24)',
  'Reopen: commercial (Dec 24)',
  'Reopen: cars (Feb 25)',
  'Fuel price rise',
]
export const EXPOSURE = [
  [0.78, 0.62, -0.3, -0.04, -0.08, -0.55, 0.2],
  [0.85, 0.7, -0.25, -0.02, -0.05, -0.68, 0.45],
  [0.6, 0.58, -0.35, -0.03, -0.06, -0.4, 0.05],
  [0.52, 0.66, -0.42, -0.05, -0.18, -0.35, -0.25],
  [0.48, 0.4, -0.28, -0.1, -0.62, -0.12, -0.15],
  [0.35, 0.74, -0.48, -0.01, -0.03, -0.22, -0.08],
  [0.4, 0.55, -0.2, -0.02, -0.02, -0.6, 0.62],
]
export const SEGMENT_LISTINGS = [24110, 18340, 21560, 15220, 9870, 4310, 2140]
export const SEGMENT_NOTES = {
  'Small hybrid': 'Small hybrids like the Aqua and Vitz were the most exposed to the February 2025 car reopening, because new imports competed directly with them.',
  'Economy / K-car': 'K-cars such as the Wagon R and Alto rose sharply during the ban, as they were the cheapest way into car ownership.',
  Sedan: 'Sedans followed the overall market closely, with moderate rises during the ban and moderate falls after reopening.',
  SUV: 'SUVs held their value best after the reopening, as fewer new SUVs were imported because of high taxes.',
  'Van / pickup': 'Vans and pickups reacted most to the December 2024 commercial reopening, not the car reopening.',
  Luxury: 'Luxury cars were most sensitive to the rupee, because their prices are linked to import costs.',
  Electric: 'Electric cars rose with fuel prices and fell sharply once new EV imports arrived in 2025.',
}

// ── Policy insights ────────────────────────────────────────
export const POLICY_EVENTS = [
  { icon: 'ship', date: '19 Mar 2020', title: 'Import suspension', value: '+38%', note: 'average asking price, 24 months after', color: 'var(--red)', soft: 'var(--red-soft)' },
  { icon: 'dollar', date: '2022', title: 'Rupee depreciation', value: '+0.7%', note: 'per 1% fall in the rupee (pass-through)', color: 'var(--amber)', soft: 'var(--amber-soft)' },
  { icon: 'compare', date: '1 Dec 2024', title: 'Commercial reopening', value: '−11%', note: 'vans and pickups, 6 months after', color: 'var(--teal)', soft: 'var(--teal-soft)' },
  { icon: 'gauge', date: '1 Feb 2025', title: 'Passenger car reopening', value: '−12%', note: 'all cars, 12 months after', color: 'var(--blue)', soft: 'var(--blue-soft)' },
]

const BASE_EFFECT = [0.5, -0.3, 0.4, 0.1, -0.2, 0, 0, -2.5, -4.8, -6.9, -8.4, -9.6, -10.5, -11.2, -11.6, -11.9, -12.1, -12.2, -12.3]
export const EVENT_STUDY = {
  'All cars': BASE_EFFECT,
  'Small hybrid': BASE_EFFECT.map((v, i) => +(i < 7 ? v : v * 1.35).toFixed(1)),
  SUV: BASE_EFFECT.map((v, i) => +(i < 7 ? v : v * 0.6).toFixed(1)),
  Luxury: BASE_EFFECT.map((v, i) => +(i < 7 ? v : v * 0.45).toFixed(1)),
}

export const FINDINGS = [
  'Supply shocks moved prices more than any single economic indicator.',
  'After the car reopening, small hybrids fell fastest; SUVs and luxury cars fell least.',
  'Exchange-rate changes reached used car prices within about two to three months.',
  'Models trained only on ban-era data overpriced cars by about 9% after the reopening.',
]

// ── Price check ────────────────────────────────────────────
export const MAKES = {
  Toyota: ['Aqua', 'Axio', 'Prius', 'Vitz', 'CHR'],
  Honda: ['Vezel', 'Fit', 'Grace', 'Civic'],
  Suzuki: ['Wagon R', 'Alto', 'Swift'],
  Nissan: ['Leaf', 'X-Trail', 'Sunny'],
}
const BASE_PRICE = { Aqua: 6.9, Axio: 8.4, Prius: 10.2, Vitz: 6.1, CHR: 11.8, Vezel: 10.6, Fit: 6.5, Grace: 7.6, Civic: 12.4, 'Wagon R': 4.7, Alto: 3.6, Swift: 5.9, Leaf: 6.3, 'X-Trail': 13.5, Sunny: 4.9 }

// Very simple stand-in for the real model so the UI can react to inputs.
export function estimatePrice({ make, model, year, mileage, fuel, transmission }) {
  const base = BASE_PRICE[model] ?? 6
  const yearAdj = (year - 2015) * 0.045
  const mileAdj = -((mileage - 60000) / 10000) * 0.012
  const fuelAdj = fuel === 'Hybrid' ? 0.04 : fuel === 'Electric' ? -0.03 : fuel === 'Diesel' ? 0.01 : 0
  const transAdj = transmission === 'Manual' ? -0.05 : 0
  const attrOnly = base * (1 + yearAdj + mileAdj + fuelAdj + transAdj)
  const shock = -0.092 // post-reopening market adjustment
  const mid = attrOnly * (1 + shock)
  const contributions = [
    { label: `Model year ${year}`, value: +(base * yearAdj + 0.31).toFixed(2) },
    { label: `${fuel} fuel type`, value: +(base * fuelAdj + 0.15).toFixed(2) },
    { label: 'USD/LKR this month', value: 0.1 },
    { label: `Mileage ${Number(mileage).toLocaleString()} km`, value: +(base * mileAdj - 0.1).toFixed(2) },
    { label: 'Imports reopened (month 21)', value: -0.23 },
    { label: 'Listing district', value: -0.04 },
  ]
  return {
    make, model,
    mid: +mid.toFixed(2),
    low: +(mid * 0.946).toFixed(2),
    high: +(mid * 1.054).toFixed(2),
    attrOnly: +attrOnly.toFixed(2),
    diff: +(attrOnly - mid).toFixed(2),
    diffPct: +(shock * 100).toFixed(1),
    contributions,
  }
}

export const SIMILAR = [
  { name: 'G 2015', district: 'Colombo', mileage: '85,000–95,000 km', delta: 0.078 },
  { name: 'S 2015', district: 'Gampaha', mileage: '80,000–90,000 km', delta: -0.008 },
  { name: 'G 2015', district: 'Kandy', mileage: '85,000–95,000 km', delta: -0.031 },
  { name: '2015 Crossover', district: 'Kurunegala', mileage: '75,000–85,000 km', delta: 0.132 },
  { name: 'S 2015', district: 'Galle', mileage: '90,000–100,000 km', delta: 0.016 },
]

// ── Home ───────────────────────────────────────────────────
export const PULSE = [
  { icon: 'dollar', label: 'USD / LKR', value: 'Rs. 302.4', sub: '+0.6% this month', subColor: 'var(--red)', color: '#38BDF8', soft: 'var(--blue-soft)', spark: [296, 298, 297, 299, 301, 300, 302.4] },
  { icon: 'fire', label: 'CCPI inflation', value: '4.1%', sub: 'year on year', color: '#F5A524', soft: 'var(--amber-soft)', spark: [5.2, 4.9, 4.4, 4.6, 4.2, 4.0, 4.1] },
  { icon: 'ship', label: 'Cars reopened', value: '21 months', sub: 'since 1 Feb 2025', color: '#2DD4BF', soft: 'var(--teal-soft)', spark: [1, 2, 3, 4, 5, 6, 7] },
  { icon: 'list', label: 'Listings tracked', value: '148,620', sub: 'updated daily', subColor: 'var(--green)', color: '#A78BFA', soft: 'var(--violet-soft)', spark: [120, 126, 131, 135, 140, 144, 148.6] },
]

export const POPULAR = ['Toyota Aqua', 'Honda Vezel', 'Suzuki Wagon R', 'Toyota Prius', 'Honda Fit', 'Toyota Axio', 'Nissan Leaf', 'Suzuki Alto', 'Toyota Vitz', 'Honda Grace', 'Toyota CHR', 'Suzuki Swift']

export const LIVE_LISTINGS = [
  { car: 'Toyota Aqua 2015', price: 'Rs. 6.55M', place: 'Galle', tag: 'Fair' },
  { car: 'Honda Vezel 2016', price: 'Rs. 10.9M', place: 'Colombo', tag: 'Above fair' },
  { car: 'Suzuki Wagon R 2018', price: 'Rs. 5.1M', place: 'Kandy', tag: 'Fair' },
  { car: 'Toyota Prius 2014', price: 'Rs. 9.4M', place: 'Gampaha', tag: 'Below fair' },
  { car: 'Honda Fit 2014', price: 'Rs. 6.2M', place: 'Matara', tag: 'Fair' },
  { car: 'Nissan Leaf 2017', price: 'Rs. 6.0M', place: 'Kurunegala', tag: 'Below fair' },
  { car: 'Toyota Axio 2016', price: 'Rs. 8.7M', place: 'Negombo', tag: 'Above fair' },
]

export const FAQ = [
  { q: 'What does "shock-aware" mean?', a: 'Normal price tools only use the car’s details. Our model also uses what is happening in the country – the import ban and reopening, the USD/LKR rate, inflation and interest rates – so the fair price changes when the market changes.' },
  { q: 'Where does the data come from?', a: 'Asking prices from online adverts on ikman.lk and Riyasewana, and economic data from the Central Bank of Sri Lanka. These are asking prices, not final sale prices.' },
  { q: 'Is the forecast guaranteed?', a: 'No. The 6-month forecast is a statistical estimate with an uncertainty band. Policy changes can move prices in ways no model can predict.' },
  { q: 'Who built AutoPulse?', a: 'It is a student research project by Group 35 at the Informatics Institute of Technology, in collaboration with Robert Gordon University.' },
]

// ── Segment of each model (used by Compare and Fair-deal pages) ──
// exp = row in SEGMENTS/EXPOSURE, series = key in SEGMENT_SERIES
export const MODEL_SEGMENT = {
  Aqua: { seg: 'Small hybrid', exp: 1, series: 'Hybrid' }, Prius: { seg: 'Small hybrid', exp: 1, series: 'Hybrid' },
  Axio: { seg: 'Sedan', exp: 2, series: 'All cars' }, Grace: { seg: 'Sedan', exp: 2, series: 'Hybrid' }, Civic: { seg: 'Sedan', exp: 2, series: 'All cars' }, Sunny: { seg: 'Sedan', exp: 2, series: 'Economy' },
  Vitz: { seg: 'Economy / K-car', exp: 0, series: 'Economy' }, Fit: { seg: 'Economy / K-car', exp: 0, series: 'Economy' }, Swift: { seg: 'Economy / K-car', exp: 0, series: 'Economy' },
  'Wagon R': { seg: 'Economy / K-car', exp: 0, series: 'Economy' }, Alto: { seg: 'Economy / K-car', exp: 0, series: 'Economy' },
  CHR: { seg: 'SUV', exp: 3, series: 'SUV' }, Vezel: { seg: 'SUV', exp: 3, series: 'SUV' }, 'X-Trail': { seg: 'SUV', exp: 3, series: 'SUV' },
  Leaf: { seg: 'Electric', exp: 6, series: 'Hybrid' },
}

// ── "Is this advert fair?" ──
export const AD_EXAMPLE = 'Toyota Aqua 2015 for sale. Hybrid, auto, 92,000 km, original paint, Colombo. Price Rs. 7,150,000 (negotiable).'

// Reads make/model/year/mileage/fuel/gear/price out of pasted advert text.
export function parseAdvert(text) {
  const s = text || ''
  const out = {}
  for (const [make, models] of Object.entries(MAKES)) {
    const m = models.find((md) => new RegExp(`\\b${md.replace('-', '[- ]?')}\\b`, 'i').test(s))
    if (m) { out.make = make; out.model = m; break }
    if (new RegExp(`\\b${make}\\b`, 'i').test(s)) out.make = make
  }
  const y = s.match(/\b(20[0-2]\d|19[89]\d)\b/); if (y) out.year = +y[1]
  const km = s.match(/(\d[\d,.]*)\s*(k\s*)?(km|kms|kilometers?)\b/i)
  if (km) { let v = parseFloat(km[1].replace(/,/g, '')); if (km[2] || v < 1000) v *= 1000; out.mileage = Math.round(v) }
  if (/hybrid/i.test(s)) out.fuel = 'Hybrid'; else if (/diesel/i.test(s)) out.fuel = 'Diesel'; else if (/electric|\bev\b/i.test(s)) out.fuel = 'Electric'; else if (/petrol/i.test(s)) out.fuel = 'Petrol'
  if (/manual/i.test(s)) out.transmission = 'Manual'; else if (/\bauto(matic)?\b/i.test(s)) out.transmission = 'Automatic'
  const price = parsePrice(s.match(/(rs\.?|lkr)\s*[\d,.]+\s*(m|mn|million|lakhs?|lks?)?|[\d,.]+\s*(million|mn|lakhs?)/i)?.[0] || '')
  if (price) out.price = price
  return out
}

// "Rs. 7,150,000" → 7.15 · "71.5 lakhs" → 7.15 · "7.2M" → 7.2  (result in millions)
export function parsePrice(str) {
  const m = String(str).replace(/rs\.?|lkr/ig, '').match(/([\d,.]+)\s*(m|mn|million|lakhs?|lks?)?/i)
  if (!m) return null
  let v = parseFloat(m[1].replace(/,/g, ''))
  if (!isFinite(v) || v <= 0) return null
  const u = (m[2] || '').toLowerCase()
  if (u.startsWith('l')) v = v / 10
  else if (!u && v > 1000) v = v / 1e6
  return +v.toFixed(2)
}

export function verdict(asking, r) {
  if (asking < r.low) return { key: 'good', label: 'Good deal', color: 'var(--green)', soft: 'var(--green-soft)' }
  if (asking <= r.high) return { key: 'fair', label: 'Fair price', color: 'var(--teal)', soft: 'var(--teal-soft)' }
  if (asking <= r.high * 1.07) return { key: 'high', label: 'A bit high', color: 'var(--amber)', soft: 'var(--amber-soft)' }
  return { key: 'over', label: 'Overpriced', color: 'var(--red)', soft: 'var(--red-soft)' }
}

// ── Model performance (rolling-origin test, Jan 2023 → Oct 2026) ──
export const PERF_MONTHS = MONTHS.slice(24)
const REOPEN_T = 49 - 24 // Feb 2025 inside PERF_MONTHS
export const REOPEN_MARKS = [{ t: 45 - 24, label: 'Transport' }, { t: 47 - 24, label: 'Commercial' }, { t: REOPEN_T, label: 'Cars' }]
export const ERROR_SERIES = PERF_MONTHS.map((_, t) => {
  const wob = Math.sin(t * 1.7) * 0.5 + Math.cos(t * 0.9) * 0.35
  let base, ours
  if (t < 21) { base = 8.8 + wob; ours = 8.1 + wob * 0.8 }
  else if (t < REOPEN_T) { base = 10.5 + (t - 21) * 1.1 + wob; ours = 8.6 + wob * 0.8 }
  else { const k = t - REOPEN_T; base = 22.5 * Math.exp(-k / 26) + 6.5 + wob; ours = 8.2 + 3.2 * Math.exp(-k / 3) + wob * 0.7 }
  return { base: +base.toFixed(1), ours: +ours.toFixed(1) }
})
export const MODEL_METRICS = [
  { key: 'MAPE', label: 'Mean % error (MAPE)', base: 14.8, ours: 8.6, unit: '%', lowerBetter: true, note: 'Average % gap between predicted and asking price' },
  { key: 'MAE', label: 'Mean absolute error', base: 0.96, ours: 0.55, unit: 'M', lowerBetter: true, note: 'Average error in Rs. millions' },
  { key: 'RMSE', label: 'RMSE', base: 1.42, ours: 0.81, unit: 'M', lowerBetter: true, note: 'Punishes large errors more' },
  { key: 'R2', label: 'R² score', base: 0.81, ours: 0.92, unit: '', lowerBetter: false, note: 'Share of price variation explained' },
]
export const PERIOD_ERRORS = [
  { label: 'Import ban', sub: 'Jan 2023 – Sep 2024', base: 9.1, ours: 8.3 },
  { label: 'Staged reopening', sub: 'Oct 2024 – Jan 2025', base: 13.4, ours: 9.0 },
  { label: 'After cars reopened', sub: 'Feb 2025 – Oct 2026', base: 17.6, ours: 8.7 },
]
export const FEATURE_IMPORTANCE = [
  { label: 'Model year', v: 0.92, shock: false }, { label: 'Make and model', v: 0.85, shock: false },
  { label: 'Months since reopening', v: 0.61, shock: true }, { label: 'Mileage', v: 0.55, shock: false },
  { label: 'USD/LKR rate', v: 0.42, shock: true }, { label: 'Engine capacity', v: 0.33, shock: false },
  { label: 'Fuel type', v: 0.27, shock: false }, { label: 'Inflation (CCPI)', v: 0.21, shock: true },
  { label: 'Import reopened (0/1)', v: 0.18, shock: true }, { label: 'District', v: 0.09, shock: false },
]
export const DRIFT = [
  { feature: 'Asking price', psi: 0.31 }, { feature: 'USD/LKR rate', psi: 0.42 }, { feature: 'Listings per month', psi: 0.27 },
  { feature: 'Model year', psi: 0.18 }, { feature: 'Fuel type mix', psi: 0.12 }, { feature: 'Mileage', psi: 0.07 },
]
