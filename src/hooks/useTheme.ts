import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'

export function useTheme() {
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
}
