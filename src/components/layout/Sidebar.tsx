import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Dumbbell,
  BarChart2,
  FlipHorizontal2,
  Settings,
} from 'lucide-react'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/library', label: 'Provbibliotek', icon: BookOpen },
  { to: '/exam', label: 'Provläge', icon: ClipboardList },
  { to: '/drill', label: 'Övningsläge', icon: Dumbbell },
  { to: '/stats', label: 'Statistik', icon: BarChart2 },
  { to: '/flashcards', label: 'Flashcards', icon: FlipHorizontal2 },
  { to: '/settings', label: 'Inställningar', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-ki-blue text-white shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-ki-gold flex items-center justify-center shrink-0">
            <span className="text-ki-blue font-bold text-sm">HP</span>
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">HP-portalen</p>
            <p className="text-white/50 text-xs">KI Läkarprogrammet</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-white/30 text-xs">Mål: Karolinska Institutet</p>
        <p className="text-ki-gold text-xs font-semibold">Stanine ≥ 2.0</p>
      </div>
    </aside>
  )
}
