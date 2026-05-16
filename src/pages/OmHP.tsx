import { NavLink } from 'react-router-dom'
import { SectionBadge } from '@/components/ui/SectionBadge'
import type { Section } from '@/types'

const SECTIONS_INFO: { code: Section; name: string; count: number; desc: string }[] = [
  { code: 'ORD', name: 'Ordförståelse', count: 20, desc: 'Välj det ord som bäst stämmer överens med ett understruket ord.' },
  { code: 'LÄS', name: 'Läsförståelse', count: 20, desc: 'Besvara frågor om innehållet i svenska textavsnitt.' },
  { code: 'MEK', name: 'Meningskomplettering', count: 20, desc: 'Välj ord/uttryck som passar in i en ofullständig text.' },
  { code: 'ELF', name: 'Engelsk läsförståelse', count: 20, desc: 'Besvara frågor om engelska textavsnitt.' },
  { code: 'XYZ', name: 'Matematisk problemlösning', count: 20, desc: 'Lös matematikuppgifter med fokus på problemlösning.' },
  { code: 'KVA', name: 'Kvantitativa jämförelser', count: 20, desc: 'Jämför två kvantiteter och avgör vilket som är störst.' },
  { code: 'NOG', name: 'Kvantitativa resonemang', count: 20, desc: 'Avgör om en uppgift kan lösas med givna upplysningar.' },
  { code: 'DTK', name: 'Diagram, tabeller & kartor', count: 20, desc: 'Tolka information ur diagram, tabeller och kartor.' },
]

const PROV_DATES = [
  { year: '2026', vår: '28 mars', höst: '18 oktober' },
  { year: '2027', vår: 'Mars (datum ej fastställt)', höst: 'Oktober (datum ej fastställt)' },
]

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="py-12 border-b border-gray-100 last:border-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      {children}
    </section>
  )
}

export default function OmHP() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Om Högskoleprovet</h1>
        <p className="text-lg text-gray-600">
          Allt du behöver veta om HP — hur det fungerar, hur det bedöms och hur du förbereder dig bäst.
        </p>
      </div>

      {/* Quick nav */}
      <nav className="flex flex-wrap gap-2 mb-10 p-4 bg-gray-50 rounded-xl">
        {[
          { href: '#vad-ar-hp', label: 'Vad är HP?' },
          { href: '#provpassen', label: 'Provpassens struktur' },
          { href: '#normering', label: 'Normering' },
          { href: '#anmalan', label: 'Anmälan' },
          { href: '#provdagen', label: 'Provdagen' },
        ].map(l => (
          <a key={l.href} href={l.href}
            className="text-sm font-medium text-ki-blue bg-white border border-ki-blue/20 px-3 py-1.5 rounded-lg hover:bg-ki-blue hover:text-white transition-colors">
            {l.label}
          </a>
        ))}
      </nav>

      <Section id="vad-ar-hp" title="Vad är Högskoleprovet?">
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            Högskoleprovet (HP) är ett nationellt urvalsprov för antagning till högskoleutbildningar i Sverige.
            Provet ger en kompletterande möjlighet till gymnasiebetyg för att få en plats på en utbildning — du kan använda
            det bästa av dina resultat.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Provet arrangeras av Universitets- och högskolerådet (UHR) och ges normalt två gånger per år:
            en gång på våren (mars) och en gång på hösten (oktober).
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            {[
              { label: 'Delmoment', value: '8', sub: '4 verbala + 4 kvantitativa' },
              { label: 'Frågor totalt', value: '160', sub: '20 frågor per delmoment' },
              { label: 'Provtid', value: '5h', sub: '55 min per pass + pauser' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                <div className="text-3xl font-bold text-ki-blue mb-1">{s.value}</div>
                <div className="text-sm font-semibold text-gray-700">{s.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="provpassen" title="Provpassens struktur">
        <p className="text-gray-700 leading-relaxed mb-6">
          Provet är uppdelat i ett <strong>verbalt provpass</strong> och ett <strong>kvantitativt provpass</strong>,
          vart och ett med 55 minuters provtid och 80 frågor.
        </p>
        <div className="grid gap-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Verbalt pass</div>
          {SECTIONS_INFO.slice(0, 4).map(s => (
            <div key={s.code} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <SectionBadge section={s.code} />
              <div>
                <div className="font-semibold text-gray-900">{s.name}</div>
                <div className="text-sm text-gray-500">{s.desc}</div>
              </div>
              <div className="ml-auto text-right shrink-0">
                <div className="text-sm font-bold text-gray-700">{s.count}</div>
                <div className="text-xs text-gray-400">frågor</div>
              </div>
            </div>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mt-3">Kvantitativt pass</div>
          {SECTIONS_INFO.slice(4).map(s => (
            <div key={s.code} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <SectionBadge section={s.code} />
              <div>
                <div className="font-semibold text-gray-900">{s.name}</div>
                <div className="text-sm text-gray-500">{s.desc}</div>
              </div>
              <div className="ml-auto text-right shrink-0">
                <div className="text-sm font-bold text-gray-700">{s.count}</div>
                <div className="text-xs text-gray-400">frågor</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="normering" title="Normering — hur bedöms provet?">
        <p className="text-gray-700 leading-relaxed mb-4">
          HP bedöms på en <strong>staninskala från 0.0 till 2.0</strong>, med en decimals noggrannhet.
          Resultatet normeras mot övriga provdeltagare — det är alltså inte ett absolut poängresultat som räknas,
          utan var du hamnar relativt alla andra som skriver samma prov.
        </p>
        <p className="text-gray-700 leading-relaxed mb-6">
          Det verbala och kvantitativa passet vägs samman till ett slutresultat. Om du inte skriver ett av passen
          får du inget stanineresultat.
        </p>
        <div className="bg-ki-blue/5 border border-ki-blue/20 rounded-xl p-5 mb-6">
          <div className="font-semibold text-ki-blue mb-2">Vill du beräkna ditt stanine?</div>
          <p className="text-sm text-gray-600 mb-3">
            Använd vår interaktiva normeringskalkylator för att se vad ditt antal rätta svar motsvarar i stanine.
          </p>
          <NavLink to="/normering"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-ki-blue px-4 py-2 rounded-lg hover:bg-ki-blue-dark transition-colors">
            Öppna normeringskalkylatorn →
          </NavLink>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 border border-gray-200 font-semibold text-gray-700">Stanine</th>
                <th className="text-left p-3 border border-gray-200 font-semibold text-gray-700">Andel av provdeltagare</th>
                <th className="text-left p-3 border border-gray-200 font-semibold text-gray-700">Beskrivning</th>
              </tr>
            </thead>
            <tbody>
              {[
                { stanine: '2.0', pct: 'Topp ~4%', desc: 'Excellent (KI-nivå)' },
                { stanine: '1.7–1.9', pct: 'Topp 10–20%', desc: 'Mycket bra' },
                { stanine: '1.3–1.6', pct: 'Topp 20–50%', desc: 'Bra' },
                { stanine: '0.7–1.2', pct: 'Under medel', desc: 'Genomsnittlig' },
                { stanine: '0.0–0.6', pct: 'Botten ~10%', desc: 'Låg' },
              ].map(r => (
                <tr key={r.stanine} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 border border-gray-200 font-bold text-ki-blue">{r.stanine}</td>
                  <td className="p-3 border border-gray-200 text-gray-600">{r.pct}</td>
                  <td className="p-3 border border-gray-200 text-gray-600">{r.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="anmalan" title="Anmälan till Högskoleprovet">
        <p className="text-gray-700 leading-relaxed mb-4">
          Du anmäler dig till Högskoleprovet via <strong>studera.nu</strong> (UHR:s officiella webbplats).
          Anmälan är avgiftsbelagd — anmälningsavgiften är 450 kr per provtillfälle.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Vårprovet 2026</div>
            <div className="font-bold text-gray-900">28 mars 2026</div>
            <div className="text-sm text-gray-500 mt-1">Anmälan öppnar ca 4 veckor före provet</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Höstprovet 2026</div>
            <div className="font-bold text-gray-900">18 oktober 2026</div>
            <div className="text-sm text-gray-500 mt-1">Anmälan öppnar ca 4 veckor före provet</div>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800">
            <strong>Obs!</strong> Antalet platser är begränsat och fylls upp snabbt — anmäl dig så snart anmälan öppnar.
            Du kan anmäla dig till max tre provtillfällen per kalenderår.
          </p>
        </div>
      </Section>

      <Section id="provdagen" title="Provdagen — vad gäller?">
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {[
            { title: 'Ta med dig', items: ['Giltig legitimation (obligatoriskt)', 'Anmälningsbekräftelse/kallelse', 'Pennor (HB eller mjukare)', 'Suddgummi', 'Linjal (för DTK)', 'Vattenflaska och mellanmål'] },
            { title: 'Lämna hemma', items: ['Mobiltelefon (måste stängas av)', 'Miniräknare (inte tillåten)', 'Smarta klockor och hörlurar', 'Anteckningsblock', 'Annan elektronik'] },
          ].map(col => (
            <div key={col.title} className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="font-semibold text-gray-900 mb-3">{col.title}</div>
              <ul className="space-y-1.5">
                {col.items.map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-ki-blue shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
          <div className="font-semibold text-gray-900 mb-3">Provets tidplan</div>
          <div className="space-y-2 text-sm">
            {[
              { tid: '08:10', aktivitet: 'Provet börjar (höstprovets starttid)' },
              { tid: '08:10–09:05', aktivitet: 'Verbalt pass 1 (55 min)' },
              { tid: '09:05–09:20', aktivitet: 'Paus (15 min)' },
              { tid: '09:20–10:15', aktivitet: 'Kvantitativt pass 1 (55 min)' },
              { tid: '10:15–10:45', aktivitet: 'Rast (30 min)' },
              { tid: '10:45–11:40', aktivitet: 'Verbalt pass 2 (55 min)' },
              { tid: '11:40–11:55', aktivitet: 'Paus (15 min)' },
              { tid: '11:55–12:50', aktivitet: 'Kvantitativt pass 2 (55 min)' },
            ].map(r => (
              <div key={r.tid} className="flex gap-4 items-center">
                <span className="text-ki-blue font-mono font-semibold w-28 shrink-0">{r.tid}</span>
                <span className="text-gray-600">{r.aktivitet}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="font-semibold text-gray-900 mb-3">Provdatum 2026–2027</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border border-gray-200 font-semibold text-gray-700">År</th>
                  <th className="text-left p-3 border border-gray-200 font-semibold text-gray-700">Vårprov</th>
                  <th className="text-left p-3 border border-gray-200 font-semibold text-gray-700">Höstprov</th>
                </tr>
              </thead>
              <tbody>
                {PROV_DATES.map(r => (
                  <tr key={r.year} className="border-b border-gray-100">
                    <td className="p-3 border border-gray-200 font-bold text-gray-900">{r.year}</td>
                    <td className="p-3 border border-gray-200 text-gray-600">{r.vår}</td>
                    <td className="p-3 border border-gray-200 text-gray-600">{r.höst}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>
    </div>
  )
}
