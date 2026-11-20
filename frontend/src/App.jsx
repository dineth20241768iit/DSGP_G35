import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Intro, { shouldShowIntro } from './components/Intro.jsx'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import PriceCheck from './pages/PriceCheck.jsx'
import PriceIndex from './pages/PriceIndex.jsx'
import SegmentMap from './pages/SegmentMap.jsx'
import PolicyInsights from './pages/PolicyInsights.jsx'
import FairDeal from './pages/FairDeal.jsx'
import Compare from './pages/Compare.jsx'
import ModelPerformance from './pages/ModelPerformance.jsx'
import { DashboardLayout } from './components/Layout.jsx'

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  // Animated intro on first visit to the Home page (once per session)
  const [intro, setIntro] = useState(() => pathname === '/' && shouldShowIntro())
  return (
    <>
    {intro && <Intro onDone={() => setIntro(false)} />}
    <Routes>
      {/* Home remounts when the intro ends, so its entrance animations play as the intro fades */}
      <Route path="/" element={<Home key={intro ? 'behind-intro' : 'home'} />} />
      {/* Dashboard pages share the sidebar layout; the page content animates in on each change */}
      <Route element={<DashboardLayout />}>
        <Route path="/price-check" element={<PriceCheck />} />
        <Route path="/price-index" element={<PriceIndex />} />
        <Route path="/segment-map" element={<SegmentMap />} />
        <Route path="/policy-insights" element={<PolicyInsights />} />
        <Route path="/fair-deal" element={<FairDeal />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/model-performance" element={<ModelPerformance />} />
      </Route>
      <Route path="*" element={<Home />} />
    </Routes>
    </>
  )
}
