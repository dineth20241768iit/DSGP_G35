import { useLang } from '../i18n.jsx'
import { MAKES } from '../data/sample.js'

export const DEFAULT_CAR = { make: 'Toyota', model: 'Aqua', year: 2015, mileage: 85000, fuel: 'Hybrid', transmission: 'Automatic' }
const MILEAGES = [20000, 40000, 60000, 85000, 110000, 140000]

/* The six car fields used across the site. `onChange(nextCar)` gets the whole car. */
export default function CarForm({ car, onChange, cols = 3 }) {
  const { t } = useLang()
  const set = (k, v) => onChange({ ...car, [k]: v, ...(k === 'make' ? { model: MAKES[v][0] } : {}) })
  // keep a parsed mileage (e.g. 92,000) selectable even if it is not in the default list
  const miles = MILEAGES.includes(car.mileage) ? MILEAGES : [...MILEAGES, car.mileage].sort((a, b) => a - b)
  const fields = [
    ['make', t('f.make', 'Make'), Object.keys(MAKES)],
    ['model', t('f.model', 'Model'), MAKES[car.make]],
    ['year', t('f.year', 'Year'), Array.from({ length: 12 }, (_, k) => 2010 + k)],
    ['mileage', t('f.mileage', 'Mileage'), miles],
    ['fuel', t('f.fuel', 'Fuel type'), ['Hybrid', 'Petrol', 'Diesel', 'Electric']],
    ['transmission', t('f.trans', 'Transmission'), ['Automatic', 'Manual']],
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: 14 }} className="car-form">
      {fields.map(([k, l, opts]) => (
        <label key={k} className="field">
          <span className="label">{l}</span>
          <select className="select" value={car[k]} onChange={(e) => set(k, k === 'year' || k === 'mileage' ? +e.target.value : e.target.value)}>
            {opts.map((o) => <option key={o} value={o}>{k === 'mileage' ? `${o.toLocaleString()} km` : o}</option>)}
          </select>
        </label>
      ))}
      <style>{`@media(max-width:640px){.car-form{grid-template-columns:repeat(2,minmax(0,1fr))!important}}`}</style>
    </div>
  )
}
