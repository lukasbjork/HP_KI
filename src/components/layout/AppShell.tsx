import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { useSettingsStore } from '@/stores/settingsStore'
import { useEffect } from 'react'

export function AppShell() {
  const theme = useSettingsStore(s => s.theme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') { root.classList.add('dark'); return }
    if (theme === 'light') { root.classList.remove('dark'); return }
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = (dark: boolean) => dark ? root.classList.add('dark') : root.classList.remove('dark')
    apply(mq.matches)
    const handler = (e: MediaQueryListEvent) => apply(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  return (
    <div className="flex min-h-screen bg-surface dark:bg-surface-dark">
      <Sidebar />
      <main className="flex-1 overflow-auto pb-16 lg:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
