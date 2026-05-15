import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, CheckCircle2, Clock, Circle } from 'lucide-react'
import { useSessionIndex } from '@/utils/useSessionData'
import { useProgressStore } from '@/stores/progressStore'
import { PageHeader } from '@/components/ui/PageHeader'
import type { SessionMeta, ProvType, Season, Section } from '@/types'

const ALL_SECTIONS: Section[] = ['ORD', 'LÄS', 'MEK', 'ELF', 'XYZ', 'KVA', 'NOG', 'DTK']
const VERBAL_SECTIONS = new Set<Section>(['ORD', 'LÄS', 'MEK', 'ELF'])

type StatusFilter = 'all' | 'done' | 'in-progress' | 'new'

export default function Library() {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  const { data: index, loading, error } = useSessionIndex()
  const { sessions } = useProgressStore()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ProvType | 'all'>('all')
  const [seasonFilter, setSeasonFilter] = useState<Season | 'all'>('all')
  const [sectionFilter, setSectionFilter] = useState<Section | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  function getStatus(meta: SessionMeta): StatusFilter {
    const p = sessions[meta.id]
    if (!p) return 'new'
    if (p.completedAt) return 'done'
    return 'in-progress'
  }

  const filtered = useMemo(() => {
    if (!index) return []
    return index.filter(meta => {
      if (typeFilter !== 'all' && meta.type !== typeFilter) return false
      if (seasonFilter !== 'all' && meta.season !== seasonFilter) return false
      if (statusFilter !== 'all' && getStatus(meta) !== statusFilter) return false
      if (sectionFilter !== 'all') {
        const needsVerbal = VERBAL_SECTIONS.has(sectionFilter)
        if (meta.type !== (needsVerbal ? 'verbal' : 'kvantitativ')) return false
      }
      if (search && !meta.id.includes(search.toLowerCase()) && !String(meta.year).includes(search)) return false
      return true
    })
  }, [index, typeFilter, seasonFilter, statusFilter, sectionFilter, search, sessions])

  const years = useMemo(() => {
    if (!index) return []
    return [...new Set(index.map(m => m.year))].sort((a, b) => b - a)
  }, [index])

  const grouped = useMemo(() => {
    const g: Record<number, SessionMeta[]> = {}
    for (const m of filtered) {
      if (!g[m.year]) g[m.year] = []
      g[m.year].push(m)
    }
    return g
  }, [filtered])

  if (loading) return <div className="p-8 text-gray-400">Laddar provbibliotek...</div>
  if (error) return <div className="p-8 text-red-500">Fel: {error}</div>

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Provbibliotek"
        subtitle={`${index?.length ?? 0} provtillfällen · Höst 2013 – Vår 2026`}
      />

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ki-blue/30"
            placeholder="Sök på år eller provid..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Filter size={14} className="text-gray-400 self-center" />

          {(['all', 'verbal', 'kvantitativ'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === t ? 'bg-ki-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === 'all' ? 'Alla typer' : t === 'verbal' ? 'Verbalt' : 'Kvantitativt'}
            </button>
          ))}

          <div className="w-px bg-gray-200 mx-1 self-stretch" />

          {(['all', 'vår', 'höst'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSeasonFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                seasonFilter === s ? 'bg-ki-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'Alla säsonger' : s === 'vår' ? 'Vår' : 'Höst'}
            </button>
          ))}

          <div className="w-px bg-gray-200 mx-1 self-stretch" />

          {(['all', 'done', 'in-progress', 'new'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === st ? 'bg-ki-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'all' ? 'Alla status' : st === 'done' ? 'Klara' : st === 'in-progress' ? 'Pågående' : 'Ej påbörjat'}
            </button>
          ))}
        </div>
      </div>

      {/* Session grid grouped by year */}
      <div className="space-y-8">
        {years.filter(y => grouped[y]?.length).map(year => (
          <div key={year}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{year}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <AnimatePresence>
                {grouped[year]?.map(meta => {
                  const status = getStatus(meta)
                  const progress = sessions[meta.id]
                  const acc = progress
                    ? Math.round((progress.score / Math.max(1, progress.total)) * 100)
                    : null

                  return (
                    <motion.button
                      key={meta.id}
                      layout
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      onClick={() => navigate(`/exam/${meta.id}`)}
                      className={`text-left p-4 rounded-2xl border transition-all hover:shadow-md ${
                        sessionId === meta.id
                          ? 'border-ki-blue bg-ki-blue/5'
                          : 'border-gray-100 bg-white hover:border-ki-blue/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm capitalize">
                            {meta.season} {meta.year}
                          </p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {meta.type === 'verbal' ? 'Verbalt' : 'Kvantitativt'} · Del {meta.variant}
                          </p>
                        </div>
                        {status === 'done' ? (
                          <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                        ) : status === 'in-progress' ? (
                          <Clock size={18} className="text-ki-gold shrink-0" />
                        ) : (
                          <Circle size={18} className="text-gray-300 shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                          meta.type === 'verbal'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-orange-50 text-orange-600'
                        }`}>
                          {meta.questionCount} frågor
                        </span>
                        {acc !== null && (
                          <span className={`text-xs font-bold ${
                            acc >= 80 ? 'text-green-600' : acc >= 60 ? 'text-yellow-600' : 'text-red-500'
                          }`}>
                            {acc}%
                          </span>
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p>Inga prov matchar dina filter</p>
          </div>
        )}
      </div>

      {/* Section filter pills at bottom */}
      <div className="mt-8 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-400 font-medium">Filtrera delområde:</span>
        {(['all', ...ALL_SECTIONS] as const).map(s => (
          <button
            key={s}
            onClick={() => setSectionFilter(s as typeof sectionFilter)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              sectionFilter === s ? 'bg-ki-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'all' ? 'Alla' : s}
          </button>
        ))}
      </div>
    </div>
  )
}
