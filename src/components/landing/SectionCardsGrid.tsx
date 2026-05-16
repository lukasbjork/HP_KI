import { useNavigate } from 'react-router-dom'
import { Type, BookOpen, MessageSquare, Globe, Calculator, Scale, FileText, BarChart2, ArrowRight } from 'lucide-react'

const SECTIONS = [
  {
    code: 'ORD',
    name: 'Ordförståelse',
    desc: 'Välj det ord som bäst stämmer överens med det understrukna ordet.',
    icon: Type,
    color: 'bg-violet-50 border-violet-200 hover:border-violet-400',
    iconColor: 'text-violet-600 bg-violet-100',
    badgeColor: 'bg-violet-100 text-violet-700',
    type: 'verbal',
  },
  {
    code: 'LÄS',
    name: 'Läsförståelse',
    desc: 'Svara på frågor om innehållet i ett längre textavsnitt.',
    icon: BookOpen,
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    iconColor: 'text-blue-600 bg-blue-100',
    badgeColor: 'bg-blue-100 text-blue-700',
    type: 'verbal',
  },
  {
    code: 'MEK',
    name: 'Meningskomplettering',
    desc: 'Välj det ord eller uttryck som bäst passar in i texten.',
    icon: MessageSquare,
    color: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
    iconColor: 'text-indigo-600 bg-indigo-100',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    type: 'verbal',
  },
  {
    code: 'ELF',
    name: 'Engelsk läsförståelse',
    desc: 'Läsförståelse av engelska texter — snabbt och exakt.',
    icon: Globe,
    color: 'bg-cyan-50 border-cyan-200 hover:border-cyan-400',
    iconColor: 'text-cyan-600 bg-cyan-100',
    badgeColor: 'bg-cyan-100 text-cyan-700',
    type: 'verbal',
  },
  {
    code: 'XYZ',
    name: 'Matematisk problemlösning',
    desc: 'Lös matematiska problem inom aritmetik, algebra och geometri.',
    icon: Calculator,
    color: 'bg-orange-50 border-orange-200 hover:border-orange-400',
    iconColor: 'text-orange-600 bg-orange-100',
    badgeColor: 'bg-orange-100 text-orange-700',
    type: 'kvantitativt',
  },
  {
    code: 'KVA',
    name: 'Kvantitativa jämförelser',
    desc: 'Jämför de angivna kvantiteterna och avgör vilket som är störst.',
    icon: Scale,
    color: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    iconColor: 'text-amber-600 bg-amber-100',
    badgeColor: 'bg-amber-100 text-amber-700',
    type: 'kvantitativt',
  },
  {
    code: 'NOG',
    name: 'Kvantitativa resonemang',
    desc: 'Avgör om uppgiften kan lösas med de givna upplysningarna.',
    icon: FileText,
    color: 'bg-red-50 border-red-200 hover:border-red-400',
    iconColor: 'text-red-600 bg-red-100',
    badgeColor: 'bg-red-100 text-red-700',
    type: 'kvantitativt',
  },
  {
    code: 'DTK',
    name: 'Diagram, tabeller & kartor',
    desc: 'Besvara frågor om information presenterad i diagram, tabeller och kartor.',
    icon: BarChart2,
    color: 'bg-green-50 border-green-200 hover:border-green-400',
    iconColor: 'text-green-600 bg-green-100',
    badgeColor: 'bg-green-100 text-green-700',
    type: 'kvantitativt',
  },
]

export function SectionCardsGrid() {
  const navigate = useNavigate()

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Alla 8 delmoment</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Högskoleprovet är uppdelat i ett verbalt och ett kvantitativt pass.
            Träna det du behöver mest.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SECTIONS.map(s => {
            const Icon = s.icon
            return (
              <button
                key={s.code}
                onClick={() => navigate(`/drill?section=${s.code}`)}
                className={`group text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${s.color}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconColor}`}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.badgeColor}`}>
                    {s.type}
                  </span>
                </div>
                <div className="mb-1">
                  <span className="font-bold text-gray-900 text-base">{s.code}</span>
                  <span className="text-gray-500 text-sm ml-2">—</span>
                  <span className="text-gray-500 text-sm ml-1">{s.name}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">{s.desc}</p>
                <div className="flex items-center gap-1 text-xs font-semibold text-ki-blue group-hover:gap-2 transition-all">
                  Träna nu <ArrowRight size={12} />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
