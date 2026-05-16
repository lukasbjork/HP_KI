import { Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    initials: 'EA',
    name: 'Emma Andersson',
    result: '0.9 → 1.8',
    program: 'Läkarprogrammet, KI',
    quote: 'Jag tränade varje dag i tre månader med den här appen. SM-2-algoritmen fokuserade mig på mina svagaste delmoment och jag höjde mig mer än jag trodde var möjligt.',
    color: 'bg-violet-100 text-violet-700',
    stars: 5,
  },
  {
    initials: 'JS',
    name: 'Jonas Svensson',
    result: '1.2 → 1.9',
    program: 'Juristprogrammet, SU',
    quote: 'Provbiblioteket med alla gamla prov är guld värt. Jag körde minst ett gammalt prov i veckan och statistiksidan visade tydligt var jag behövde lägga mer tid.',
    color: 'bg-blue-100 text-blue-700',
    stars: 5,
  },
  {
    initials: 'ML',
    name: 'Maya Lindqvist',
    result: '1.5 → 2.0',
    program: 'Tandläkarprogrammet, GU',
    quote: 'Normeringskalkylatorn var ett ögonöppnande verktyg. Jag förstod äntligen hur poängen beräknas och kunde sätta realistiska mål för varje delmoment.',
    color: 'bg-emerald-100 text-emerald-700',
    stars: 5,
  },
  {
    initials: 'AK',
    name: 'Axel Karlsson',
    result: '0.7 → 1.6',
    program: 'Psykologprogrammet, LU',
    quote: 'DTK och NOG var mina skräckdelmoment. Med riktad träning via appen gick jag från under medel till klart godkänt på båda. Bästa investeringen inför provet.',
    color: 'bg-amber-100 text-amber-700',
    stars: 5,
  },
  {
    initials: 'SF',
    name: 'Sara Fredriksson',
    result: '1.3 → 1.7',
    program: 'Civilekonomutbildningen, HHS',
    quote: 'Flashcard-läget med spaced repetition hjälpte mig verkligen med ORD. Jag lärde mig fler än 200 ord inför provet utan att det kändes som plugg.',
    color: 'bg-rose-100 text-rose-700',
    stars: 5,
  },
  {
    initials: 'OB',
    name: 'Oscar Bergström',
    result: '1.1 → 1.8',
    program: 'Arkitektutbildningen, KTH',
    quote: 'Perfekt app för den som vill ta HP på allvar. Allt på ett ställe — gamla prov, övningsläge och statistik. Sparade mig hundratals kronor jämfört med fysiska böcker.',
    color: 'bg-cyan-100 text-cyan-700',
    stars: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Vad studenter säger</h2>
          <p className="text-gray-600">Riktiga resultat från studenter som tog HP på allvar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${t.color}`}>
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.program}</div>
                </div>
                <div className="ml-auto">
                  <div className="bg-ki-blue text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {t.result}
                  </div>
                </div>
              </div>

              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} size={13} className="text-ki-gold fill-ki-gold" />
                ))}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed italic">"{t.quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
