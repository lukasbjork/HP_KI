import { Outlet } from 'react-router-dom'
import { TopNav } from './TopNav'
import { SiteFooter } from './SiteFooter'
import { useTheme } from '@/hooks/useTheme'

export function PublicShell() {
  useTheme()
  return (
    <div className="min-h-screen bg-white dark:bg-surface-dark flex flex-col">
      <TopNav />
      <main className="pt-16 flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
