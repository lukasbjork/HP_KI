import { useSettingsStore } from '@/stores/settingsStore'
import { useProgressStore } from '@/stores/progressStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { Moon, Sun, Monitor, Bell, Timer, Eye, Download, Trash2 } from 'lucide-react'
import type { UserSettings } from '@/types'

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-colors shrink-0 relative ${value ? 'bg-ki-blue' : 'bg-gray-300'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-1'}`} />
    </button>
  )
}

export default function Settings() {
  const { theme, notifications, examTimerEnabled, showExplanationsImmediately,
    setTheme, setNotifications, setExamTimer, setShowExplanations } = useSettingsStore()
  const { sessions, srsCards } = useProgressStore()

  function exportCSV() {
    const rows: string[] = ['SessionID,Sektion,FrageID,Svar,Rätt,Tidstämpel']
    for (const session of Object.values(sessions)) {
      for (const attempt of session.attempts) {
        rows.push([
          attempt.sessionId,
          attempt.section,
          attempt.questionId,
          attempt.chosen,
          attempt.correct ? 'Ja' : 'Nej',
          new Date(attempt.timestamp).toISOString(),
        ].join(','))
      }
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hp-statistik.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function clearData() {
    if (!confirm('Är du säker? All din studiedata raderas permanent.')) return
    localStorage.removeItem('hp-ki-progress')
    localStorage.removeItem('hp-ki-settings')
    window.location.reload()
  }

  const totalAttempts = Object.values(sessions).reduce((n, s) => n + s.attempts.length, 0)
  const totalSRSCards = Object.values(srsCards).length

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader title="Inställningar" subtitle="Anpassa HP-portalen" />

      {/* Theme */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <h2 className="font-semibold text-gray-800 mb-4">Utseende</h2>
        <div className="flex gap-3">
          {([
            { value: 'light', label: 'Ljust', icon: Sun },
            { value: 'dark', label: 'Mörkt', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor },
          ] as { value: UserSettings['theme']; label: string; icon: React.ElementType }[]).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-colors ${
                theme === value ? 'border-ki-blue bg-ki-blue/5 text-ki-blue' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Study settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4 space-y-4">
        <h2 className="font-semibold text-gray-800">Studieinställningar</h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Timer size={18} className="text-ki-blue" />
            <div>
              <p className="text-sm font-medium text-gray-700">Provtimer</p>
              <p className="text-xs text-gray-400">55-minuterstimer i provläge</p>
            </div>
          </div>
          <Toggle value={examTimerEnabled} onChange={setExamTimer} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye size={18} className="text-ki-blue" />
            <div>
              <p className="text-sm font-medium text-gray-700">Visa svar direkt</p>
              <p className="text-xs text-gray-400">I övningsläge efter varje svar</p>
            </div>
          </div>
          <Toggle value={showExplanationsImmediately} onChange={setShowExplanations} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-ki-blue" />
            <div>
              <p className="text-sm font-medium text-gray-700">Påminnelsenotiser</p>
              <p className="text-xs text-gray-400">Daglig studienotis (kräver webbläsartillstånd)</p>
            </div>
          </div>
          <Toggle
            value={notifications}
            onChange={async (v) => {
              if (v && 'Notification' in window) {
                const perm = await Notification.requestPermission()
                setNotifications(perm === 'granted')
              } else {
                setNotifications(false)
              }
            }}
          />
        </div>
      </div>

      {/* Data */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <h2 className="font-semibold text-gray-800 mb-4">Din data</h2>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-ki-blue">{totalAttempts}</p>
            <p className="text-xs text-gray-500">Besvarade frågor</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-ki-blue">{totalSRSCards}</p>
            <p className="text-xs text-gray-500">SRS-kort spårade</p>
          </div>
        </div>

        <button
          onClick={exportCSV}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-ki-blue text-ki-blue rounded-xl text-sm font-medium hover:bg-ki-blue/5 transition-colors mb-3"
        >
          <Download size={16} />
          Exportera statistik (CSV)
        </button>

        <button
          onClick={clearData}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
        >
          <Trash2 size={16} />
          Rensa all data
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        HP-portalen · All data sparas lokalt i din webbläsare
      </p>
    </div>
  )
}
