import { NavLink } from 'react-router-dom'

const SECTIONS = ['ORD', 'LÄS', 'MEK', 'ELF', 'XYZ', 'KVA', 'NOG', 'DTK']

export function SiteFooter() {
  return (
    <footer className="bg-ki-blue text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-ki-gold flex items-center justify-center">
                <span className="text-ki-blue font-bold text-sm">HP</span>
              </div>
              <span className="font-bold text-lg">HP med KI</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              Den smartaste vägen till höga HP-poäng. Träna med riktiga provfrågor och SM-2-algoritm.
            </p>
          </div>

          {/* Träna */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-blue-300 mb-4">Träna</h3>
            <ul className="space-y-2">
              {SECTIONS.map(s => (
                <li key={s}>
                  <a href={`/drill?section=${s}`}
                    className="text-sm text-blue-200 hover:text-white transition-colors">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Om HP */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-blue-300 mb-4">Om HP</h3>
            <ul className="space-y-2">
              {[
                { label: 'Vad är HP?', href: '/om-hp#vad-ar-hp' },
                { label: 'Provpassens struktur', href: '/om-hp#provpassen' },
                { label: 'Normering', href: '/om-hp#normering' },
                { label: 'Anmälan', href: '/om-hp#anmalan' },
                { label: 'Provdagen', href: '/om-hp#provdagen' },
              ].map(l => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-blue-200 hover:text-white transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Verktyg */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-blue-300 mb-4">Verktyg</h3>
            <ul className="space-y-2">
              <li><NavLink to="/normering" className="text-sm text-blue-200 hover:text-white transition-colors">Normeringskalkylator</NavLink></li>
              <li><NavLink to="/dashboard" className="text-sm text-blue-200 hover:text-white transition-colors">Min dashboard</NavLink></li>
              <li><NavLink to="/library" className="text-sm text-blue-200 hover:text-white transition-colors">Provbibliotek</NavLink></li>
              <li><NavLink to="/stats" className="text-sm text-blue-200 hover:text-white transition-colors">Statistik</NavLink></li>
              <li><NavLink to="/flashcards" className="text-sm text-blue-200 hover:text-white transition-colors">Flashcards</NavLink></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-blue-300">
            © {new Date().getFullYear()} HP med KI. Alla rättigheter förbehållna.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-blue-300 hover:text-white transition-colors">Användaravtal</a>
            <a href="#" className="text-sm text-blue-300 hover:text-white transition-colors">Integritetspolicy</a>
            <a href="#" className="text-sm text-blue-300 hover:text-white transition-colors">Kontakt</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
