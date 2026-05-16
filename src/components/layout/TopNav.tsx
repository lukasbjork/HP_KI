import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown, BookOpen, BarChart2 } from 'lucide-react'

const SECTIONS = [
  { code: 'ORD', name: 'Ordförståelse' },
  { code: 'LÄS', name: 'Läsförståelse' },
  { code: 'MEK', name: 'Meningskomplettering' },
  { code: 'ELF', name: 'Engelsk läsförståelse' },
  { code: 'XYZ', name: 'Matematisk problemlösning' },
  { code: 'KVA', name: 'Kvantitativa jämförelser' },
  { code: 'NOG', name: 'Kvantitativa resonemang' },
  { code: 'DTK', name: 'Diagram, tabeller & kartor' },
]

const OM_HP_LINKS = [
  { label: 'Vad är HP?', href: '/om-hp#vad-ar-hp' },
  { label: 'Provpassens struktur', href: '/om-hp#provpassen' },
  { label: 'Normering', href: '/om-hp#normering' },
  { label: 'Anmälan', href: '/om-hp#anmalan' },
  { label: 'Provdagen', href: '/om-hp#provdagen' },
]

export function TopNav() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [tranaOpen, setTranaOpen] = useState(false)
  const [omHpOpen, setOmHpOpen] = useState(false)
  const tranaRef = useRef<HTMLDivElement>(null)
  const omHpRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (tranaRef.current && !tranaRef.current.contains(e.target as Node)) setTranaOpen(false)
      if (omHpRef.current && !omHpRef.current.contains(e.target as Node)) setOmHpOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close mobile menu on navigation
  useEffect(() => { setMobileOpen(false) }, [])

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-ki-blue' : 'text-gray-700 hover:text-ki-blue'}`

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-8">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 shrink-0" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 rounded-lg bg-ki-blue flex items-center justify-center">
            <span className="text-white font-bold text-sm">HP</span>
          </div>
          <span className="font-bold text-gray-900 text-base">HP med KI</span>
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1 flex-1">
          <NavLink to="/" end className={navLinkClass} style={{ padding: '6px 12px' }}>
            Hem
          </NavLink>

          {/* Träna dropdown */}
          <div ref={tranaRef} className="relative">
            <button
              onClick={() => { setTranaOpen(o => !o); setOmHpOpen(false) }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-ki-blue transition-colors rounded-md hover:bg-gray-50"
            >
              Träna <ChevronDown size={14} className={`transition-transform ${tranaOpen ? 'rotate-180' : ''}`} />
            </button>
            {tranaOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Verbalt</div>
                {SECTIONS.slice(0, 4).map(s => (
                  <button key={s.code} onClick={() => { navigate(`/drill?section=${s.code}`); setTranaOpen(false) }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                    <span className="font-semibold text-ki-purple w-8">{s.code}</span>
                    <span className="text-gray-600">{s.name}</span>
                  </button>
                ))}
                <div className="border-t border-gray-100 my-1" />
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Kvantitativt</div>
                {SECTIONS.slice(4).map(s => (
                  <button key={s.code} onClick={() => { navigate(`/drill?section=${s.code}`); setTranaOpen(false) }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                    <span className="font-semibold text-ki-green w-8">{s.code}</span>
                    <span className="text-gray-600">{s.name}</span>
                  </button>
                ))}
                <div className="border-t border-gray-100 my-1" />
                <button onClick={() => { navigate('/library'); setTranaOpen(false) }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-ki-blue font-medium">
                  <BookOpen size={14} />
                  Hela provbiblioteket
                </button>
              </div>
            )}
          </div>

          {/* Om HP dropdown */}
          <div ref={omHpRef} className="relative">
            <button
              onClick={() => { setOmHpOpen(o => !o); setTranaOpen(false) }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-ki-blue transition-colors rounded-md hover:bg-gray-50"
            >
              Om HP <ChevronDown size={14} className={`transition-transform ${omHpOpen ? 'rotate-180' : ''}`} />
            </button>
            {omHpOpen && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                {OM_HP_LINKS.map(l => (
                  <a key={l.label} href={l.href} onClick={() => setOmHpOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-ki-blue">
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <NavLink to="/normering" className={navLinkClass} style={{ padding: '6px 12px' }}>
            Normeringskalkylator
          </NavLink>

          <NavLink to="/stats" className={({ isActive }) =>
            `flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-1.5 rounded-md ${isActive ? 'text-ki-blue' : 'text-gray-700 hover:text-ki-blue hover:bg-gray-50'}`}>
            <BarChart2 size={14} />
            Statistik
          </NavLink>
        </div>

        {/* Dashboard shortcut (desktop) */}
        <div className="hidden lg:flex items-center gap-2 ml-auto">
          <NavLink to="/dashboard"
            className="px-4 py-2 text-sm font-semibold text-white bg-ki-blue hover:bg-ki-blue-dark rounded-lg transition-colors shadow-sm border border-ki-blue-light">
            Min dashboard
          </NavLink>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="lg:hidden ml-auto p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Öppna meny"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            <NavLink to="/" end onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
              Hem
            </NavLink>

            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Träna — Verbalt</div>
            {SECTIONS.slice(0, 4).map(s => (
              <button key={s.code} onClick={() => { navigate(`/drill?section=${s.code}`); setMobileOpen(false) }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                <span className="font-semibold text-ki-purple w-8">{s.code}</span>
                {s.name}
              </button>
            ))}

            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Träna — Kvantitativt</div>
            {SECTIONS.slice(4).map(s => (
              <button key={s.code} onClick={() => { navigate(`/drill?section=${s.code}`); setMobileOpen(false) }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                <span className="font-semibold text-ki-green w-8">{s.code}</span>
                {s.name}
              </button>
            ))}

            <div className="border-t border-gray-100 my-2" />
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Om HP</div>
            {OM_HP_LINKS.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                {l.label}
              </a>
            ))}

            <div className="border-t border-gray-100 my-2" />
            <NavLink to="/normering" onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
              Normeringskalkylator
            </NavLink>
            <NavLink to="/stats" onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
              Statistik
            </NavLink>
            <NavLink to="/dashboard" onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
              Min dashboard
            </NavLink>

            <div className="border-t border-gray-100 my-2" />
            <div className="px-3 pb-2">
              <NavLink to="/dashboard" onClick={() => setMobileOpen(false)}
                className="block w-full text-center py-2.5 text-sm font-semibold text-white bg-ki-blue rounded-lg">
                Min dashboard
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
