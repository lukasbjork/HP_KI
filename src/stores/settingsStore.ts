import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserSettings } from '@/types'

interface SettingsState extends UserSettings {
  setTheme: (theme: UserSettings['theme']) => void
  setNotifications: (v: boolean) => void
  setExamTimer: (v: boolean) => void
  setShowExplanations: (v: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      theme: 'system',
      notifications: false,
      examTimerEnabled: true,
      showExplanationsImmediately: false,

      setTheme: theme => set({ theme }),
      setNotifications: notifications => set({ notifications }),
      setExamTimer: examTimerEnabled => set({ examTimerEnabled }),
      setShowExplanations: showExplanationsImmediately => set({ showExplanationsImmediately }),
    }),
    { name: 'hp-ki-settings' }
  )
)
