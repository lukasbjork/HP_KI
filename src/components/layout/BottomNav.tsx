import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Dumbbell,
  BarChart2,
} from 'lucide-react'

const nav = [
  { to: '/', label: 'Start', icon: LayoutDashboard },
  { to: '/library', label: 'Prov', icon: BookOpen },
  { to: '/exam', label: 'Provläge', icon: ClipboardList },
  { to: '/drill', label: 'Öva', icon: Dumbbell },
  { to: '/stats', label: 'Stats', icon: BarChart2 },
]

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="flex">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                isActive ? 'text-ki-blue' : 'text-gray-400'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
