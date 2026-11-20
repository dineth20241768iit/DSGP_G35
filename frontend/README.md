# AutoPulse – Frontend (Group 35, CM2603 DSGP)

Shock-aware used car price website for Sri Lanka. React + Vite, animations with Framer Motion.
Layout inspired by pricemart.lk, with our own style and our **Contribution to Domain** features.

> All numbers are **sample data** (`src/data/sample.js`). Replace them with the model / API output.

## Run it

```bash
npm install
npm run dev      # opens http://localhost:5173
npm run build    # production files in dist/
```

## Pages

| Route | Page | What it shows |
|---|---|---|
| `#/` | Home | Animated hero with rotating headline, working quick price check, live-listing ticker, market pulse sparklines, the 3 contribution cards (3D tilt), scroll-drawn shock timeline, FAQ, CTA |
| `#/price-check` | Price Check | Fair price + range, attribute-only vs shock-aware comparison, SHAP-style factor bars, similar listings. "Edit details" changes the result live |
| `#/price-index` | **Contribution 1 – Shock-Aware Price Index** | Monthly index 2021–2026 with import ban / 2022 crisis / reopening bands, segment filter, nominal vs inflation-adjusted toggle, hover tooltip, 6-month forecast (Kasar et al., 2025), CSV export |
| `#/segment-map` | **Contribution 2 – Segment Exposure Map** | Clickable heatmap (segments × shocks), detail panel, ranking that re-sorts per shock, time-window selector |
| `#/policy-insights` | **Contribution 3 – Empirical Policy Insights** | Policy event cards, event-study chart for the Feb 2025 reopening (per segment), key findings, method note |
| `#/fair-deal` | **Is this advert fair?** | Paste an advert or type the asking price; animated gauge gives Good deal / Fair / A bit high / Overpriced, suggested offer, reasons and negotiation tips |
| `#/compare` | **Compare two cars** | Two cars side by side: fair price, range, head-to-head bars, change since cars reopened, 24-month trend + 6-month forecast |
| `#/model-performance` | **Model performance** | Attribute-only vs shock-aware model: MAPE/MAE/RMSE/R², error over time across the reopening, error by period, SHAP feature importance, drift check (PSI), model card |

**Light / dark theme:** light is the default. The moon/sun button in the top bar or sidebar switches to dark, and the choice is remembered. Colours are CSS variables at the top of `src/styles.css` (`:root` = light, `[data-theme="dark"]` = dark).

**Intro animation:** `src/components/Intro.jsx` plays a ~4 second animated intro the first time Home opens in a browser session (Skip button, Esc/Enter also skip; turned off for "reduce motion"). To see it again, open the site in a new tab or window.

**Languages:** English, Sinhala and Tamil (switch in the top bar / sidebar). Translations live in `src/i18n.jsx`; call `t('key', 'English text')` and add the Sinhala/Tamil text to the `SI` and `TA` lists. Any text without a translation shows in English.

## Project structure

```
src/
  main.jsx              entry (HashRouter – works on any static host)
  App.jsx               routes
  styles.css            theme tokens (dark premium), keyframe animations, responsive rules
  data/sample.js        ALL sample data + a simple stand-in price function (estimatePrice)
  components/
    ui.jsx              icons, logo, car illustration, Reveal, Counter, Sparkline, ProgressBar
    Layout.jsx          top navbar, footer, dashboard sidebar layout, page header
    Charts.jsx          price index chart, event-study chart, mini previews, heatmap colours
  pages/                Home, PriceCheck, PriceIndex, SegmentMap, PolicyInsights
```

## Connecting the real model later

Replace `estimatePrice()` in `src/data/sample.js` with a `fetch()` call to the backend
(e.g. `POST /api/predict`) and swap the arrays (`indexSeries`, `EXPOSURE`, `EVENT_STUDY`, …) for API responses.
