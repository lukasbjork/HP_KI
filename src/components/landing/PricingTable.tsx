import { Check, X, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const FEATURES = [
  { label: 'Övningsuppgifter', free: '500+', premium: 'Obegränsat' },
  { label: 'AI-förklaringar', free: '10/dag', premium: 'Obegränsat' },
  { label: 'Kunskapsanalys', free: 'Grundläggande', premium: 'Detaljerad' },
  { label: 'Stanine-kalkylator', free: true, premium: true },
  { label: 'Spaced repetition (SM-2)', free: true, premium: true },
  { label: 'Anpassat studieupplägg', free: false, premium: true },
  { label: 'Alla delmoment (ORD–DTK)', free: false, premium: true },
  { label: 'Prioriterat stöd', free: false, premium: true },
]

type FeatureValue = string | boolean

function Cell({ value }: { value: FeatureValue }) {
  if (typeof value === 'boolean') {
    return value
      ? <Check size={18} className="text-ki-green mx-auto" />
      : <X size={18} className="text-gray-300 mx-auto" />
  }
  return <span className="text-sm font-medium text-gray-700">{value}</span>
}

export function PricingTable() {
  const navigate = useNavigate()

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Gratis vs Premium</h2>
          <p className="text-gray-600">Börja gratis — uppgradera när du är redo att maximera ditt resultat.</p>
        </div>

        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
            <div className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wide">Funktion</div>
            <div className="p-5 text-center">
              <div className="text-base font-bold text-gray-900">Gratis</div>
              <div className="text-sm text-gray-500 mt-0.5">Kom igång nu</div>
            </div>
            <div className="p-5 text-center bg-ki-blue/5 border-l border-ki-blue/20">
              <div className="inline-flex items-center gap-1.5 bg-ki-gold text-ki-blue text-xs font-bold px-2.5 py-1 rounded-full mb-1">
                <Zap size={11} />
                PREMIUM
              </div>
              <div className="text-base font-bold text-gray-900">Premium</div>
              <div className="text-sm text-gray-500 mt-0.5">Kommer snart</div>
            </div>
          </div>

          {/* Rows */}
          {FEATURES.map((f, i) => (
            <div key={f.label}
              className={`grid grid-cols-3 border-b border-gray-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
              <div className="p-4 text-sm text-gray-700 flex items-center">{f.label}</div>
              <div className="p-4 flex items-center justify-center">
                <Cell value={f.free} />
              </div>
              <div className="p-4 flex items-center justify-center bg-ki-blue/3 border-l border-ki-blue/10">
                <Cell value={f.premium} />
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            onClick={() => navigate('/drill')}
            className="py-3.5 text-sm font-semibold text-ki-blue border-2 border-ki-blue rounded-xl hover:bg-ki-blue hover:text-white transition-colors"
          >
            Bli gratismedlem
          </button>
          <button
            disabled
            className="py-3.5 text-sm font-semibold text-ki-blue bg-ki-gold hover:bg-ki-gold-dark rounded-xl transition-colors cursor-not-allowed opacity-80 flex items-center justify-center gap-2"
          >
            <Zap size={15} />
            Bli Premium-medlem
            <span className="text-xs font-normal opacity-75">(snart)</span>
          </button>
        </div>
      </div>
    </section>
  )
}
