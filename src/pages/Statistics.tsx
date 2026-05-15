import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts'
import { useProgressStore } from '@/stores/progressStore'
import { useSessionIndex } from '@/utils/useSessionData'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionBadge } from '@/components/ui/SectionBadge'
import { accuracyToStanine, KI_TARGET_STANINE } from '@/utils/scoring'
import type { Section } from '@/types'

const SECTIONS: Section[] = ['ORD', 'LÄS', 'MEK', 'ELF', 'XYZ', 'KVA', 'NOG', 'DTK']

const SECTION_COLORS: Record<string, string> = {
  ORD: '#7c3aed', LÄS: '#2563eb', MEK: '#4f46e5', ELF: '#0891b2',
  XYZ: '#ea580c', KVA: '#d97706', NOG: '#dc2626', DTK: '#16a34a',
}

export default function Statistics() {
  const { sessions, getAccuracyBySection } = useProgressStore()
  const { data: index } = useSessionIndex()

  const sectionAcc = getAccuracyBySection()

  // Score trend over time
  const scoreTrend = useMemo(() => {
    return Object.values(sessions)
      .filter(s => s.completedAt)
      .sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0))
      .map(s => {
        const meta = index?.find(m => m.id === s.sessionId)
        const acc = s.total > 0 ? s.score / s.total : 0
        return {
          label: meta ? `${meta.season.slice(0, 1).toUpperCase()} ${meta.year}` : s.sessionId,
          accuracy: Math.round(acc * 100),
          stanine: accuracyToStanine(acc),
          date: s.completedAt,
        }
      })
  }, [sessions, index])

  // Per-section bar data
  const sectionData = SECTIONS.map(sec => ({
    section: sec,
    accuracy: sectionAcc[sec] && sectionAcc[sec].total > 0
      ? Math.round((sectionAcc[sec].correct / sectionAcc[sec].total) * 100)
      : 0,
    total: sectionAcc[sec]?.total ?? 0,
  }))

  const totalAnswered = Object.values(sectionAcc).reduce((n, r) => n + r.total, 0)
  const totalCorrect = Object.values(sectionAcc).reduce((n, r) => n + r.correct, 0)
  const overallAcc = totalAnswered > 0 ? totalCorrect / totalAnswered : 0
  const estimatedStanine = accuracyToStanine(overallAcc)

  const weakest = [...sectionData].filter(s => s.total > 0).sort((a, b) => a.accuracy - b.accuracy).slice(0, 3)

  // KI historical cutoffs for comparison table
  const kiHistory = [
    { term: 'HT 2024', cutoff: 2.0 },
    { term: 'VT 2024', cutoff: 2.0 },
    { term: 'HT 2023', cutoff: 1.8 },
    { term: 'VT 2023', cutoff: 1.9 },
    { term: 'HT 2022', cutoff: 1.8 },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader title="Statistik & Analys" subtitle="Din poängutveckling och delområdesanalys" />

      {/* KI stanine gauge */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="sm:col-span-1 bg-ki-blue rounded-2xl p-5 text-white">
          <p className="text-white/60 text-sm mb-1">Estimerat stanine</p>
          <p className="text-5xl font-bold text-ki-gold">{estimatedStanine.toFixed(1)}</p>
          <p className="text-white/50 text-xs mt-1">Mål: {KI_TARGET_STANINE}</p>
          <div className="mt-3 bg-white/20 rounded-full h-2">
            <div
              className="h-2 bg-ki-gold rounded-full transition-all"
              style={{ width: `${Math.min(100, (estimatedStanine / KI_TARGET_STANINE) * 100)}%` }}
            />
          </div>
        </div>

        <div className="sm:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">KI Läkarprogrammet – historiska antagningspoäng</p>
          <div className="space-y-2">
            {kiHistory.map(row => (
              <div key={row.term} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16 shrink-0">{row.term}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${estimatedStanine >= row.cutoff ? 'bg-green-500' : 'bg-red-400'}`}
                    style={{ width: `${Math.min(100, (row.cutoff / 2.5) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-700 w-8 text-right">{row.cutoff}</span>
                {estimatedStanine >= row.cutoff
                  ? <span className="text-xs text-green-600">✓</span>
                  : <span className="text-xs text-red-400">✗</span>
                }
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Score trend line chart */}
      {scoreTrend.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Poängutveckling över tid</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={scoreTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, 'Träffsäkerhet']} />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#1a3a6b"
                strokeWidth={2.5}
                dot={{ fill: '#1a3a6b', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Section accuracy bar chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Träffsäkerhet per delområde</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={sectionData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="section" tick={{ fontSize: 12, fontWeight: 600 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
            <Tooltip formatter={(v, _name, props) => [`${v}% (${(props as { payload: { total: number; section: string } }).payload.total} frågor)`, (props as { payload: { total: number; section: string } }).payload.section]} />
            <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
              {sectionData.map(entry => (
                <Cell key={entry.section} fill={SECTION_COLORS[entry.section] ?? '#1a3a6b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap / focus areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Detaljerat per delområde</h2>
          <div className="space-y-3">
            {sectionData.map(({ section, accuracy, total }) => (
              <div key={section} className="flex items-center gap-3">
                <SectionBadge section={section} />
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{total} frågor</span>
                    <span className="font-semibold">{accuracy}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${accuracy}%`,
                        backgroundColor: SECTION_COLORS[section] ?? '#1a3a6b',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Rekommenderade fokusområden</h2>
          {weakest.length > 0 ? (
            <div className="space-y-3">
              {weakest.map(({ section, accuracy, total }) => (
                <div key={section} className="p-3 rounded-xl bg-red-50 border border-red-100">
                  <div className="flex items-center gap-2 mb-1">
                    <SectionBadge section={section} />
                    <span className="text-xs font-bold text-red-600">{accuracy}% rätt</span>
                  </div>
                  <p className="text-xs text-red-700">
                    {total} frågor besvarade — fortsätt öva!
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm py-4">Besvara fler frågor för att se fokusområden</p>
          )}
        </div>
      </div>
    </div>
  )
}
