import { createContext, useContext, useEffect, useState } from 'react'

/*
  Simple language support: English, Sinhala and Tamil.
  Use:  const { t } = useLang();  t('nav.priceCheck', 'Price Check')
  If a word has no Sinhala/Tamil translation yet, the English text is shown.
  Translations are drafts – please ask a native speaker to check them.
*/

const SI = {
  'nav.priceCheck': 'මිල පරීක්ෂාව', 'nav.fair': 'දැන්වීම සාධාරණද?', 'nav.compare': 'වාහන සසඳන්න', 'nav.index': 'මිල දර්ශකය',
  'nav.segment': 'කාණ්ඩ සිතියම', 'nav.policy': 'ප්‍රතිපත්ති විශ්ලේෂණ', 'nav.model': 'ආකෘති කාර්යසාධනය', 'nav.methodology': 'ක්‍රමවේදය',
  'nav.research': 'පර්යේෂණ', 'nav.overview': 'මුල් පිටුව', 'nav.tools': 'මෙවලම්', 'nav.home': 'මුල් පිටුව',
  'btn.openDashboard': 'පුවරුව විවෘත කරන්න', 'badge.sample': 'නියැදි දත්ත', 'btn.save': 'වාර්තාව සුරකින්න',
  'hero.live': 'සජීවී කම්පන-සංවේදී මිලකරණය · ශ්‍රී ලංකාව',
  'hero.title': 'සාධාරණ මිල දැනගන්න,',
  'hero.rot': ['ආනයන තහනම තිබුණත්.', 'රුපියල වැටුණත්.', 'ආනයන නැවත ඇරුණත්.', 'උද්ධමනය ඉහළ ගියත්.'],
  'hero.sub': 'අනෙක් මෙවලම් වාහනය ගැන පමණක් බලයි. AutoPulse රටේ තත්ත්වයත් සලකා බලයි: ආනයන තහනම සහ නැවත විවෘත කිරීම, ඩොලර්/රුපියල් අනුපාතය, උද්ධමනය සහ පොලී අනුපාත.',
  'hero.cta1': 'සාධාරණ මිල බලන්න', 'hero.cta2': 'මිල දර්ශකය බලන්න',
  'qc.title': 'ඉක්මන් මිල පරීක්ෂාව', 'qc.sub': 'තත්පර 10ක් පමණ ගතවේ', 'qc.go': 'සාධාරණ මිල පරාසය ලබාගන්න', 'qc.loading': 'වෙළඳපොළ කියවමින්…',
  'f.make': 'සමාගම', 'f.model': 'මාදිලිය', 'f.year': 'වර්ෂය', 'f.mileage': 'ධාවන දුර', 'f.fuel': 'ඉන්ධන වර්ගය', 'f.trans': 'ගියර් පද්ධතිය', 'f.asking': 'ඉල්ලන මිල',
  'phase.now': 'වර්තමාන වෙළඳපොළ අවධිය', 'phase.post': 'නැවත විවෘත කිරීමෙන් පසු', 'phase.month': 'වාහන ආනයනය ඇරී මාස 21යි',
  'pc.title': 'මිල පරීක්ෂාව', 'pi.title': 'කම්පන-සංවේදී මිල දර්ශකය', 'sm.title': 'කාණ්ඩ නිරාවරණ සිතියම', 'pol.title': 'ප්‍රතිපත්ති විශ්ලේෂණ',
  'fd.title': 'මෙම දැන්වීම සාධාරණද?', 'fd.sub': 'දැන්වීමේ ඉල්ලන මිල ඇතුළත් කර එය හොඳ ගනුදෙනුවක්ද, සාධාරණද, නැතහොත් අධික මිලක්ද කියා බලන්න.',
  'fd.paste': 'දැන්වීම මෙහි අලවන්න (අමතර)', 'fd.read': 'දැන්වීම කියවන්න', 'fd.example': 'උදාහරණයක්', 'fd.check': 'මිල පරීක්ෂා කරන්න',
  'v.good': 'හොඳ ගනුදෙනුවක්', 'v.fair': 'සාධාරණ මිලක්', 'v.high': 'මඳක් වැඩියි', 'v.over': 'අධික මිලක්',
  'fd.offer': 'යෝජිත ඉල්ලීම', 'fd.why': 'මෙම තීරණයට හේතු', 'fd.tips': 'සාකච්ඡා උපදෙස්',
  'cmp.title': 'වාහන දෙකක් සසඳන්න', 'cmp.sub': 'වාහන දෙකක සාධාරණ මිල සහ වෙළඳපොළ කම්පනවලට ඒවා ප්‍රතිචාර දක්වන ආකාරය එකට බලන්න.',
  'cmp.carA': 'වාහනය A', 'cmp.carB': 'වාහනය B', 'cmp.swap': 'මාරු කරන්න', 'cmp.h2h': 'මුහුණට මුහුණ', 'cmp.outlook': 'මිල ප්‍රවණතාව සහ අනාවැකිය',
  'mp.title': 'ආකෘති කාර්යසාධනය', 'mp.sub': 'කම්පන-සංවේදී ආකෘතිය කොතරම් හොඳද? මාසයෙන් මාසයට rolling-origin වලංගුකරණයෙන් පරීක්ෂා කර ඇත.',
  'mp.baseline': 'ගුණාංග-පමණක් ආකෘතිය', 'mp.ours': 'කම්පන-සංවේදී ආකෘතිය (අපගේ)', 'mp.overTime': 'කාලයත් සමඟ දෝෂය', 'mp.periods': 'නැවත විවෘත කිරීමට පෙර සහ පසු දෝෂය',
  'mp.features': 'වැදගත්ම සාධක', 'mp.drift': 'දත්ත විචලන පරීක්ෂාව (Drift)',
  'home.tools': 'නව මෙවලම්', 'home.toolsTitle': 'මිලදී ගැනීමට පෙර අවශ්‍ය සියල්ල',
  'intro.tag': 'කම්පන-සංවේදී පාවිච්චි කළ වාහන මිල · ශ්‍රී ලංකාව', 'intro.fair': 'සාධාරණ මිල', 'intro.skip': 'මඟ හරින්න',
  'ft.tools': 'මෙවලම්', 'ft.research': 'පර්යේෂණ', 'ft.about': 'අප ගැන',
}

const TA = {
  'nav.priceCheck': 'விலை சரிபார்ப்பு', 'nav.fair': 'விளம்பரம் நியாயமா?', 'nav.compare': 'கார்களை ஒப்பிடுக', 'nav.index': 'விலைச் சுட்டெண்',
  'nav.segment': 'பிரிவு வரைபடம்', 'nav.policy': 'கொள்கை நுண்ணறிவுகள்', 'nav.model': 'மாதிரி செயல்திறன்', 'nav.methodology': 'வழிமுறை',
  'nav.research': 'ஆய்வு', 'nav.overview': 'முகப்பு', 'nav.tools': 'கருவிகள்', 'nav.home': 'முகப்பு',
  'btn.openDashboard': 'டாஷ்போர்டைத் திற', 'badge.sample': 'மாதிரித் தரவு', 'btn.save': 'அறிக்கையைச் சேமி',
  'hero.live': 'நேரடி அதிர்ச்சி-உணர் விலை நிர்ணயம் · இலங்கை',
  'hero.title': 'நியாயமான விலையை அறியுங்கள்,',
  'hero.rot': ['இறக்குமதித் தடை வந்தாலும்.', 'ரூபாய் வீழ்ந்தாலும்.', 'இறக்குமதி மீண்டும் திறந்தாலும்.', 'பணவீக்கம் உயர்ந்தாலும்.'],
  'hero.sub': 'மற்ற கருவிகள் காரை மட்டுமே பார்க்கின்றன. AutoPulse நாட்டின் நிலையையும் கருத்தில் கொள்கிறது: இறக்குமதித் தடையும் மீள்திறப்பும், USD/LKR மாற்று விகிதம், பணவீக்கம் மற்றும் வட்டி விகிதங்கள்.',
  'hero.cta1': 'நியாயமான விலையைப் பாருங்கள்', 'hero.cta2': 'விலைச் சுட்டெண்ணைப் பாருங்கள்',
  'qc.title': 'விரைவு விலை சரிபார்ப்பு', 'qc.sub': 'சுமார் 10 வினாடிகள் ஆகும்', 'qc.go': 'நியாயமான விலை வரம்பைப் பெறுக', 'qc.loading': 'சந்தையைப் படிக்கிறது…',
  'f.make': 'நிறுவனம்', 'f.model': 'மாடல்', 'f.year': 'ஆண்டு', 'f.mileage': 'ஓடிய தூரம்', 'f.fuel': 'எரிபொருள் வகை', 'f.trans': 'கியர் முறை', 'f.asking': 'கேட்கும் விலை',
  'phase.now': 'தற்போதைய சந்தைக் கட்டம்', 'phase.post': 'மீள்திறப்புக்குப் பின்', 'phase.month': 'கார் இறக்குமதி திறந்து 21வது மாதம்',
  'pc.title': 'விலை சரிபார்ப்பு', 'pi.title': 'அதிர்ச்சி-உணர் விலைச் சுட்டெண்', 'sm.title': 'பிரிவு வெளிப்பாட்டு வரைபடம்', 'pol.title': 'கொள்கை நுண்ணறிவுகள்',
  'fd.title': 'இந்த விளம்பரம் நியாயமா?', 'fd.sub': 'விளம்பரத்தின் கேட்கும் விலையை உள்ளிட்டு, அது நல்ல டீலா, நியாயமா அல்லது அதிக விலையா என்று பாருங்கள்.',
  'fd.paste': 'விளம்பரத்தை இங்கே ஒட்டவும் (விருப்பம்)', 'fd.read': 'விளம்பரத்தைப் படி', 'fd.example': 'ஒரு உதாரணம்', 'fd.check': 'விலையைச் சரிபார்',
  'v.good': 'நல்ல டீல்', 'v.fair': 'நியாயமான விலை', 'v.high': 'சற்று அதிகம்', 'v.over': 'அதிக விலை',
  'fd.offer': 'பரிந்துரைக்கப்படும் விலை', 'fd.why': 'இந்த முடிவுக்கான காரணங்கள்', 'fd.tips': 'பேரம் பேச உதவிக் குறிப்புகள்',
  'cmp.title': 'இரண்டு கார்களை ஒப்பிடுக', 'cmp.sub': 'இரண்டு கார்களின் நியாயமான விலையையும், சந்தை அதிர்ச்சிகளுக்கு அவை எப்படி மாறுகின்றன என்பதையும் அருகருகே பாருங்கள்.',
  'cmp.carA': 'கார் A', 'cmp.carB': 'கார் B', 'cmp.swap': 'மாற்று', 'cmp.h2h': 'நேருக்கு நேர்', 'cmp.outlook': 'விலைப் போக்கும் முன்னறிவிப்பும்',
  'mp.title': 'மாதிரி செயல்திறன்', 'mp.sub': 'அதிர்ச்சி-உணர் மாதிரி எவ்வளவு சிறந்தது? மாதந்தோறும் rolling-origin சரிபார்ப்பு மூலம் சோதிக்கப்பட்டது.',
  'mp.baseline': 'பண்புகள் மட்டும் மாதிரி', 'mp.ours': 'அதிர்ச்சி-உணர் மாதிரி (எங்களுடையது)', 'mp.overTime': 'காலப்போக்கில் பிழை', 'mp.periods': 'மீள்திறப்புக்கு முன்னும் பின்னும் பிழை',
  'mp.features': 'மிக முக்கியமான காரணிகள்', 'mp.drift': 'தரவு மாற்றச் சோதனை (Drift)',
  'home.tools': 'புதிய கருவிகள்', 'home.toolsTitle': 'கார் வாங்குவதற்கு முன் தேவையான அனைத்தும்',
  'intro.tag': 'அதிர்ச்சி-உணர் பழைய கார் விலைகள் · இலங்கை', 'intro.fair': 'நியாயமான விலை', 'intro.skip': 'தவிர்',
  'ft.tools': 'கருவிகள்', 'ft.research': 'ஆய்வு', 'ft.about': 'எங்களைப் பற்றி',
}

const DICT = { si: SI, ta: TA }
export const LANGS = [
  { code: 'en', short: 'EN', name: 'English' },
  { code: 'si', short: 'සිං', name: 'සිංහල' },
  { code: 'ta', short: 'தமி', name: 'தமிழ்' },
]

const Ctx = createContext({ lang: 'en', setLang: () => {}, t: (_k, en) => en })

function readSaved() {
  try { const v = localStorage.getItem('autopulse-lang'); return LANGS.some((l) => l.code === v) ? v : 'en' } catch { return 'en' }
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(readSaved)
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  const setLang = (l) => { setLangState(l); try { localStorage.setItem('autopulse-lang', l) } catch { /* private mode */ } }
  const t = (key, en) => (lang !== 'en' && DICT[lang][key] !== undefined ? DICT[lang][key] : en)
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)

/* EN | සිං | தமி switch */
export function LangSwitch({ compact = false }) {
  const { lang, setLang } = useLang()
  return (
    <div className="lang-switch" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button key={l.code} className={lang === l.code ? 'on' : ''} onClick={() => setLang(l.code)} title={l.name} aria-pressed={lang === l.code}
          style={compact ? { padding: '0 9px' } : undefined}>
          {l.short}
        </button>
      ))}
    </div>
  )
}
