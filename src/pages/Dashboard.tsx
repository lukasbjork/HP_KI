import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Target, BookOpen, TrendingUp, Trophy, ChevronRight } from 'lucide-react'
import { useProgressStore } from '@/stores/progressStore'
import { useSessionIndex } from '@/utils/useSessionData'
import { StatCard } from '@/components/ui/StatCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SectionBadge } from '@/components/ui/SectionBadge'
import { accuracyToStanine, KI_TARGET_STANINE } from '@/utils/scoring'
import type { Section } from '@/types'

const SECTIONS: Section[] = ['ORD', 'LÄS', 'MEK', 'ELF', 'XYZ', 'KVA', 'NOG', 'DTK']

export default function Dashboard() {
  const navigate = useNavigate()
  const { sessions, streak, getTotalAttempts, getAccuracyBySection } = useProgressStore()
  const { data: index } = useSessionIndex()

  const totalAttempts = getTotalAttempts()
  const sectionAcc = getAccuracyBySection()

  const allAccuracies = Object.values(sectionAcc)
  const totalCorrect = allAccuracies.reduce((s, r) => s + r.correct, 0)
  const totalTotal = allAccuracies.reduce((s, r) => s + r.total, 0)
  const overallAccuracy = totalTotal > 0 ? totalCorrect / totalTotal : 0
  const stanine = accuracyToStanine(overallAccuracy)
  const kiProgress = Math.min(1, stanine / KI_TARGET_STANINE)

  const completedSessions = Object.values(sessions).filter(s => s.completedAt).length
  const inProgressSessions = Object.values(sessions).filter(s => !s.completedAt && s.attempts.length > 0)

  const lastSession = inProgressSessions[0]
  const lastMeta = index?.find(m => m.id === lastSession?.sessionId)

  const weakSections = SECTIONS
    .map(s => ({ section: s, acc: sectionAcc[s] }))
    .filter(x => x.acc && x.acc.total >= 5)
    .sort((a, b) => (a.acc!.correct / a.acc!.total) - (b.acc!.correct / b.acc!.total))
    .slice(0, 3)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-ki-blue">God morgon!</h1>
        <p className="text-gray-500 mt-1">Ditt mål: Karolinska Institutet · Läkarprogrammet</p>
      </motion.div>

      {/* KI-o-meter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-ki-blue rounded-2xl p-6 text-white mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Target size={20} className="text-ki-gold" />
          <span className="font-semibold">KI-o-metern</span>
          <span className="ml-auto text-white/60 text-sm">Mål: stanine {KI_TARGET_STANINE}</span>
        </div>
        <div className="flex items-end gap-3 mb-3">
          <span className="text-4xl font-bold text-ki-gold">{stanine.toFixed(1)}</span>
          <span className="text-white/60 pb-1">/ {KI_TARGET_STANINE} stanine</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${kiProgress * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-3 bg-ki-gold rounded-full"
          />
        </div>
        <p className="text-white/50 text-xs mt-2">
          Baserat på {totalTotal} besvarade frågor
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Streak"
          value={`${streak} dagar`}
          icon={<Flame size={16} />}
          accent
        />
        <StatCard
          label="Frågor besvarade"
          value={totalAttempts}
          icon={<BookOpen size={16} />}
        />
        <StatCard
          label="Prov slutförda"
          value={completedSessions}
          sub={`av ${index?.length ?? '...'} tillgängliga`}
          icon={<Trophy size={16} />}
        />
        <StatCard
          label="Träffsäkerhet"
          value={`${Math.round(overallAccuracy * 100)}%`}
          icon={<TrendingUp size={16} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continue studying */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Fortsätt studera</h2>
          {lastSession && lastMeta ? (
            <button
              onClick={() => navigate(`/exam/${lastMeta.id}`)}
              className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-ki-blue/10 flex items-center justify-center shrink-0">
                <BookOpen size={18} className="text-ki-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">{lastMeta.id}</p>
                <p className="text-xs text-gray-400">
                  {lastSession.score}/{lastSession.total} frågor · {lastMeta.season} {lastMeta.year}
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-400 shrink-0" />
            </button>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm mb-3">Inget prov påbörjat ännu</p>
              <button
                onClick={() => navigate('/library')}
                className="px-4 py-2 bg-ki-blue text-white text-sm rounded-xl hover:bg-ki-blue-light transition-colors"
              >
                Välj ett prov
              </button>
            </div>
          )}
        </div>

        {/* Weak areas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Fokusområden</h2>
          {weakSections.length > 0 ? (
            <div className="space-y-3">
              {weakSections.map(({ section, acc }) => (
                <div key={section} className="flex items-center gap-3">
                  <SectionBadge section={section} />
                  <ProgressBar
                    value={acc ? acc.correct / acc.total : 0}
                    color="bg-ki-blue"
                    showPercent
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm py-4 text-center">
              Svara på fler frågor för att se dina fokusområden
            </p>
          )}
          {weakSections.length > 0 && (
            <button
              onClick={() => navigate('/drill')}
              className="mt-4 w-full py-2 text-ki-blue text-sm font-medium border border-ki-blue rounded-xl hover:bg-ki-blue/5 transition-colors"
            >
              Öva på svaga delar →
            </button>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Starta prov', to: '/library', color: 'bg-ki-blue text-white' },
          { label: 'Öva ORD', to: '/drill', color: 'bg-violet-500 text-white' },
          { label: 'Flashcards', to: '/flashcards', color: 'bg-ki-gold text-ki-blue' },
          { label: 'Statistik', to: '/stats', color: 'bg-gray-800 text-white' },
        ].map(({ label, to, color }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className={`${color} rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition-opacity`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
