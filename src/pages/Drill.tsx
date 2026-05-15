import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import { useProgressStore } from '@/stores/progressStore'
import { useSessionIndex, fetchSession } from '@/utils/useSessionData'
import { SectionBadge } from '@/components/ui/SectionBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { difficultyWeight } from '@/utils/spaced-repetition'
import type { Section, Question, AnswerOption } from '@/types'

const SECTIONS: Section[] = ['ORD', 'LÄS', 'MEK', 'ELF', 'XYZ', 'KVA', 'NOG', 'DTK']
const OPTIONS: AnswerOption[] = ['A', 'B', 'C', 'D', 'E']

type DrillState = 'config' | 'active' | 'done'

interface DrillQuestion extends Question {
  sessionId: string
  section: Section
}

export default function Drill() {
  const { data: index } = useSessionIndex()
  const { sessions, recordAttempt } = useProgressStore()

  const [drillState, setDrillState] = useState<DrillState>('config')
  const [selectedSection, setSelectedSection] = useState<Section | 'all'>('all')
  const [questionCount, setQuestionCount] = useState(20)
  const [difficultOnly, setDifficultOnly] = useState(false)

  const [drillQuestions, setDrillQuestions] = useState<DrillQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerOption | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [results, setResults] = useState<{ correct: boolean }[]>([])
  const [loading, setLoading] = useState(false)

  const allAttempts = useMemo(
    () => Object.values(sessions).flatMap(s => s.attempts),
    [sessions]
  )

  async function startDrill() {
    if (!index) return
    setLoading(true)
    try {
      const pool: DrillQuestion[] = []
      for (const meta of index) {
        const session = await fetchSession(meta.id)
        for (const [secName, questions] of Object.entries(session.sections)) {
          const sec = secName as Section
          if (selectedSection !== 'all' && sec !== selectedSection) continue
          for (const q of questions ?? []) {
            pool.push({ ...q, sessionId: meta.id, section: sec })
          }
        }
      }

      let weighted = pool.map(q => ({
        q,
        weight: difficultOnly
          ? difficultyWeight(q.sessionId, q.id, allAttempts) + 0.01
          : Math.random(),
      }))

      if (difficultOnly) {
        weighted = weighted.filter(w => w.weight > 0.3)
      }

      const selected = weighted
        .sort((a, b) => b.weight - a.weight)
        .slice(0, questionCount)
        .map(w => w.q)

      // Shuffle
      for (let i = selected.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [selected[i], selected[j]] = [selected[j], selected[i]]
      }

      setDrillQuestions(selected)
      setCurrentIdx(0)
      setResults([])
      setSelectedAnswer(null)
      setShowResult(false)
      setDrillState('active')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = useCallback((answer: AnswerOption) => {
    if (showResult) return
    const q = drillQuestions[currentIdx]
    const correct = answer === q.correct
    setSelectedAnswer(answer)
    setShowResult(true)
    setResults(prev => [...prev, { correct }])
    recordAttempt({
      questionId: q.id,
      sessionId: q.sessionId,
      section: q.section,
      chosen: answer,
      correct,
      timeMs: 0,
      timestamp: Date.now(),
    })
  }, [drillQuestions, currentIdx, showResult, recordAttempt])

  function next() {
    if (currentIdx + 1 >= drillQuestions.length) {
      setDrillState('done')
    } else {
      setCurrentIdx(i => i + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  const correctCount = results.filter(r => r.correct).length
  const currentQ = drillQuestions[currentIdx]

  // Config view
  if (drillState === 'config') {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-ki-blue rounded-xl flex items-center justify-center">
            <Dumbbell size={20} className="text-ki-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ki-blue">Övningsläge</h1>
            <p className="text-gray-500 text-sm">Välj delområde och antal frågor</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          {/* Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Delområde</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSection('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedSection === 'all' ? 'bg-ki-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Alla
              </button>
              {SECTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSection(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedSection === s ? 'bg-ki-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Antal frågor</label>
            <div className="flex gap-2">
              {[10, 20, 50, 100].map(n => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    questionCount === n ? 'bg-ki-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Difficult only */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setDifficultOnly(v => !v)}
              className={`w-10 h-6 rounded-full transition-colors ${difficultOnly ? 'bg-ki-blue' : 'bg-gray-300'} relative`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${difficultOnly ? 'left-5' : 'left-1'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Fokus på svåra frågor</p>
              <p className="text-xs text-gray-400">Viktar mot frågor du missade tidigare</p>
            </div>
          </label>

          <button
            onClick={startDrill}
            disabled={loading}
            className="w-full py-3 bg-ki-blue text-white font-bold rounded-xl hover:bg-ki-blue-light transition-colors disabled:opacity-60"
          >
            {loading ? 'Laddar frågor...' : 'Starta övning'}
          </button>
        </div>
      </div>
    )
  }

  // Done view
  if (drillState === 'done') {
    const acc = results.length > 0 ? correctCount / results.length : 0
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <div className="w-20 h-20 bg-ki-gold rounded-full flex items-center justify-center mx-auto mb-6">
            <Dumbbell size={32} className="text-ki-blue" />
          </div>
        </motion.div>
        <h2 className="text-2xl font-bold text-ki-blue mb-1">Övning klar!</h2>
        <p className="text-3xl font-bold text-ki-gold my-4">{Math.round(acc * 100)}%</p>
        <p className="text-gray-500 mb-8">{correctCount} rätt av {results.length} frågor</p>
        <div className="flex gap-3">
          <button
            onClick={() => setDrillState('config')}
            className="flex-1 py-2.5 border border-ki-blue text-ki-blue rounded-xl text-sm font-medium hover:bg-ki-blue/5"
          >
            Ändra inställningar
          </button>
          <button
            onClick={startDrill}
            className="flex-1 py-2.5 bg-ki-blue text-white rounded-xl text-sm font-semibold hover:bg-ki-blue-light"
          >
            <RefreshCw size={14} className="inline mr-1" />
            Kör igen
          </button>
        </div>
      </div>
    )
  }

  // Active drill
  if (!currentQ) return null

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm text-gray-500 font-medium">{currentIdx + 1}/{drillQuestions.length}</span>
        <ProgressBar value={(currentIdx + 1) / drillQuestions.length} />
        <span className="text-sm font-bold text-green-600">{correctCount} ✓</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionBadge section={currentQ.section} size="md" />
            <p className="text-gray-800 font-medium mt-4 mb-5 leading-relaxed">{currentQ.question}</p>

            <div className="space-y-2">
              {OPTIONS.map(opt => {
                const isSelected = selectedAnswer === opt
                const isCorrect = currentQ.correct === opt
                let cls = 'border-gray-200 bg-white text-gray-700 hover:border-ki-blue/40'
                if (showResult && isSelected && isCorrect) cls = 'border-green-500 bg-green-50 text-green-800'
                else if (showResult && isSelected && !isCorrect) cls = 'border-red-400 bg-red-50 text-red-800'
                else if (showResult && isCorrect) cls = 'border-green-400 bg-green-50 text-green-700'
                else if (isSelected) cls = 'border-ki-blue bg-ki-blue/5 text-ki-blue'

                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    disabled={showResult}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${cls}`}
                  >
                    <span className="font-bold text-sm w-5 shrink-0">{opt}</span>
                    <span className="text-sm flex-1">{currentQ.options[opt]}</span>
                    {showResult && isCorrect && <CheckCircle2 size={15} className="text-green-600 shrink-0" />}
                    {showResult && isSelected && !isCorrect && <XCircle size={15} className="text-red-500 shrink-0" />}
                  </button>
                )
              })}
            </div>

            {showResult && currentQ.explanation && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-800">
                <strong>Förklaring:</strong> {currentQ.explanation}
              </motion.div>
            )}
          </div>

          {showResult && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={next}
              className="w-full mt-4 py-3 bg-ki-blue text-white font-bold rounded-xl hover:bg-ki-blue-light"
            >
              {currentIdx + 1 < drillQuestions.length ? 'Nästa fråga →' : 'Se resultat'}
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
