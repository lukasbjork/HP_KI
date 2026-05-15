import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Flag, Pause, Play, SkipForward, ChevronLeft, ChevronRight, Timer, CheckCircle2, XCircle } from 'lucide-react'
import { useExamStore } from '@/stores/examStore'
import { useProgressStore } from '@/stores/progressStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSession } from '@/utils/useSessionData'
import { SectionBadge } from '@/components/ui/SectionBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatDuration } from '@/utils/scoring'
import type { AnswerOption, Question, Section } from '@/types'

const OPTIONS: AnswerOption[] = ['A', 'B', 'C', 'D', 'E']

function QuestionView({
  question,
  sectionName,
  onAnswer,
  selectedAnswer,
  isFlagged,
  onToggleFlag,
  showResult,
}: {
  question: Question
  sectionName: Section
  onAnswer: (a: AnswerOption) => void
  selectedAnswer?: AnswerOption
  isFlagged: boolean
  onToggleFlag: () => void
  showResult: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <SectionBadge section={sectionName} size="md" />
        <button
          onClick={onToggleFlag}
          className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isFlagged ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600'
          }`}
        >
          <Flag size={13} />
          {isFlagged ? 'Flaggad' : 'Flagga'}
        </button>
      </div>

      {question.image && (
        <img src={question.image} alt="" className="max-w-full rounded-xl border border-gray-200" />
      )}

      <p className="text-gray-800 text-base leading-relaxed font-medium">{question.question}</p>

      <div className="space-y-2">
        {OPTIONS.map(opt => {
          const isSelected = selectedAnswer === opt
          const isCorrect = question.correct === opt
          let cls = 'border-gray-200 bg-white text-gray-700 hover:border-ki-blue/40 hover:bg-ki-blue/5'
          if (showResult && isSelected && isCorrect) cls = 'border-green-500 bg-green-50 text-green-800'
          else if (showResult && isSelected && !isCorrect) cls = 'border-red-400 bg-red-50 text-red-800'
          else if (showResult && isCorrect) cls = 'border-green-400 bg-green-50 text-green-700'
          else if (isSelected) cls = 'border-ki-blue bg-ki-blue/5 text-ki-blue'

          return (
            <button
              key={opt}
              onClick={() => !showResult && onAnswer(opt)}
              disabled={showResult}
              className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all ${cls}`}
            >
              <span className="font-bold text-sm w-5 shrink-0">{opt}</span>
              <span className="text-sm flex-1">{question.options[opt]}</span>
              {showResult && isCorrect && <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />}
              {showResult && isSelected && !isCorrect && <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />}
            </button>
          )
        })}
      </div>

      {showResult && question.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 rounded-xl text-sm text-blue-800 border border-blue-100"
        >
          <strong>Förklaring:</strong> {question.explanation}
        </motion.div>
      )}
    </div>
  )
}

function ExamIntro({ sessionId, onStart }: { sessionId: string; onStart: () => void }) {
  const navigate = useNavigate()
  return (
    <div className="max-w-md mx-auto text-center py-16 px-6">
      <div className="w-16 h-16 bg-ki-blue rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Timer size={28} className="text-ki-gold" />
      </div>
      <h2 className="text-2xl font-bold text-ki-blue mb-2">Redo att starta?</h2>
      <p className="text-gray-500 text-sm mb-2">Prov: <strong>{sessionId}</strong></p>
      <p className="text-gray-400 text-sm mb-8">Du har <strong>55 minuter</strong> per delprovspass. Timern startar när du klickar nedan.</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => navigate('/library')}
          className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm"
        >
          Avbryt
        </button>
        <button
          onClick={onStart}
          className="px-6 py-2.5 rounded-xl bg-ki-blue text-white font-semibold hover:bg-ki-blue-light transition-colors text-sm"
        >
          Starta prov
        </button>
      </div>
    </div>
  )
}

function ExamComplete({ sessionId }: { sessionId: string }) {
  const navigate = useNavigate()
  const { sessions } = useProgressStore()
  const prog = sessions[sessionId]
  const examStore = useExamStore()

  const sectionScores: Record<string, { correct: number; total: number }> = {}
  if (prog) {
    for (const a of prog.attempts) {
      if (!sectionScores[a.section]) sectionScores[a.section] = { correct: 0, total: 0 }
      sectionScores[a.section].total++
      if (a.correct) sectionScores[a.section].correct++
    }
  }

  const totalCorrect = prog?.score ?? 0
  const totalTotal = prog?.total ?? 0
  const accuracy = totalTotal > 0 ? totalCorrect / totalTotal : 0

  const [reviewMode, setReviewMode] = useState(false)
  const [reviewSectionIdx, setReviewSectionIdx] = useState(0)
  const [reviewQIdx, setReviewQIdx] = useState(0)

  const sections = examStore.sections
  const currentSec = sections[reviewSectionIdx]
  const currentQ = currentSec?.questions[reviewQIdx]

  if (reviewMode && currentQ && currentSec) {
    const ansKey = `${currentSec.sectionName}-${currentQ.id}`
    const chosen = examStore.answers[ansKey] as AnswerOption | undefined
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setReviewMode(false)} className="text-ki-blue text-sm font-medium">
            ← Tillbaka till resultat
          </button>
          <span className="text-gray-400 text-sm ml-auto">
            {reviewSectionIdx + 1}/{sections.length} · Fråga {reviewQIdx + 1}/{currentSec.questions.length}
          </span>
        </div>
        <QuestionView
          question={currentQ}
          sectionName={currentSec.sectionName}
          onAnswer={() => {}}
          selectedAnswer={chosen}
          isFlagged={examStore.isFlagged(currentSec.sectionName, currentQ.id)}
          onToggleFlag={() => {}}
          showResult
        />
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              if (reviewQIdx > 0) setReviewQIdx(i => i - 1)
              else if (reviewSectionIdx > 0) {
                setReviewSectionIdx(i => i - 1)
                setReviewQIdx(sections[reviewSectionIdx - 1].questions.length - 1)
              }
            }}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            Föregående
          </button>
          <button
            onClick={() => {
              if (reviewQIdx < currentSec.questions.length - 1) setReviewQIdx(i => i + 1)
              else if (reviewSectionIdx < sections.length - 1) {
                setReviewSectionIdx(i => i + 1)
                setReviewQIdx(0)
              }
            }}
            className="px-4 py-2 rounded-xl bg-ki-blue text-white text-sm hover:bg-ki-blue-light"
          >
            Nästa
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-6 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-ki-gold rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={36} className="text-ki-blue" />
      </motion.div>
      <h2 className="text-2xl font-bold text-ki-blue mb-1">Prov klart!</h2>
      <p className="text-gray-500 text-sm mb-6">{sessionId}</p>

      <div className="bg-ki-blue rounded-2xl p-6 text-white mb-6">
        <p className="text-5xl font-bold text-ki-gold">{Math.round(accuracy * 100)}%</p>
        <p className="text-white/70 mt-1">{totalCorrect} rätt av {totalTotal} frågor</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 space-y-3">
        {Object.entries(sectionScores).map(([sec, { correct, total }]) => (
          <div key={sec} className="flex items-center gap-3">
            <SectionBadge section={sec as Section} />
            <ProgressBar value={total > 0 ? correct / total : 0} showPercent />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={() => setReviewMode(true)} className="flex-1 py-2.5 rounded-xl border border-ki-blue text-ki-blue text-sm font-medium hover:bg-ki-blue/5">
          Granska svar
        </button>
        <button onClick={() => navigate('/library')} className="flex-1 py-2.5 rounded-xl bg-ki-blue text-white text-sm font-semibold hover:bg-ki-blue-light">
          Provbibliotek
        </button>
      </div>
    </div>
  )
}

export default function Exam() {
  const { sessionId: paramId } = useParams()
  const navigate = useNavigate()
  const { data: sessionData, loading } = useSession(paramId)
  const settings = useSettingsStore()
  const examStore = useExamStore()
  const progressStore = useProgressStore()

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastTickRef = useRef(Date.now())

  // Initialize exam when session data loads
  useEffect(() => {
    if (!sessionData || !paramId) return
    if (examStore.sessionId === paramId && examStore.phase !== 'idle') return

    const activeSections = Object.entries(sessionData.sections).map(([name, questions]) => ({
      sectionName: name as Section,
      questions: questions ?? [],
    }))

    examStore.initExam(paramId, activeSections)
    progressStore.startSession(paramId, activeSections.reduce((n, s) => n + s.questions.length, 0))
  }, [sessionData, paramId])

  // Timer
  useEffect(() => {
    if (!settings.examTimerEnabled) return
    if (examStore.timerRunning) {
      lastTickRef.current = Date.now()
      timerRef.current = setInterval(() => {
        const now = Date.now()
        examStore.tickTimer(now - lastTickRef.current)
        lastTickRef.current = now
      }, 500)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [examStore.timerRunning, settings.examTimerEnabled])

  const handleAnswer = useCallback((answer: AnswerOption) => {
    const sec = examStore.getCurrentSection()
    const q = examStore.getCurrentQuestion()
    if (!sec || !q || !paramId) return
    examStore.answerQuestion(sec.sectionName, q.id, answer)
    progressStore.recordAttempt({
      questionId: q.id,
      sessionId: paramId,
      section: sec.sectionName,
      chosen: answer,
      correct: answer === q.correct,
      timeMs: 0,
      timestamp: Date.now(),
    })
  }, [examStore, progressStore, paramId])

  const handleComplete = useCallback(() => {
    if (paramId) progressStore.completeSession(paramId)
    examStore.finishExam()
  }, [examStore, progressStore, paramId])

  useEffect(() => {
    if (examStore.phase !== 'active') return
    const MAP: Record<string, AnswerOption> = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E' }
    function onKey(e: KeyboardEvent) {
      const ans = MAP[e.key]
      if (ans) { handleAnswer(ans); return }
      const st = useExamStore.getState()
      if (e.key === 'ArrowLeft') { st.prevQuestion(); return }
      if (e.key === 'ArrowRight') {
        const sec = st.sections[st.currentSectionIndex]
        if (st.currentQuestionIndex < (sec?.questions.length ?? 0) - 1) st.nextQuestion()
        else if (st.currentSectionIndex < st.sections.length - 1) st.nextSection()
        else handleComplete()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [examStore.phase, handleAnswer, handleComplete])

  if (!paramId) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">Välj ett prov från biblioteket</p>
        <button onClick={() => navigate('/library')} className="px-5 py-2.5 bg-ki-blue text-white rounded-xl text-sm font-semibold">
          Öppna bibliotek
        </button>
      </div>
    )
  }

  if (loading) return <div className="p-8 text-gray-400">Laddar prov...</div>
  if (!sessionData) return <div className="p-8 text-red-500">Provet hittades inte</div>

  const { phase, sections, currentSectionIndex, currentQuestionIndex, remainingMs } = examStore
  const currentSection = sections[currentSectionIndex]
  const currentQuestion = examStore.getCurrentQuestion()
  const totalQ = sections.reduce((n, s) => n + s.questions.length, 0)
  const answeredQ = Object.keys(examStore.answers).length
  const answerKey = currentSection && currentQuestion
    ? (examStore.answers[`${currentSection.sectionName}-${currentQuestion.id}`] as AnswerOption | undefined)
    : undefined

  if (phase === 'idle' || phase === 'intro') {
    return <ExamIntro sessionId={paramId} onStart={() => examStore.startExam()} />
  }

  if (phase === 'complete') {
    return <ExamComplete sessionId={paramId} />
  }

  return (
    <div className="flex flex-col h-screen lg:h-[calc(100vh-0px)] overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {currentSection && <SectionBadge section={currentSection.sectionName} />}
          <span className="text-gray-500 text-sm truncate">
            Fråga {currentQuestionIndex + 1}/{currentSection?.questions.length ?? 0}
          </span>
        </div>

        {settings.examTimerEnabled && (
          <div className={`flex items-center gap-1.5 font-mono font-bold text-sm ${remainingMs < 5 * 60 * 1000 ? 'text-red-600' : 'text-ki-blue'}`}>
            <Timer size={15} />
            {formatDuration(remainingMs)}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {phase === 'active' ? (
            <button onClick={() => examStore.pauseExam()} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <Pause size={16} />
            </button>
          ) : (
            <button onClick={() => examStore.resumeExam()} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <Play size={16} />
            </button>
          )}
          <button
            onClick={handleComplete}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            Avsluta
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100 shrink-0">
        <div className="h-1 bg-ki-blue transition-all" style={{ width: `${(answeredQ / Math.max(1, totalQ)) * 100}%` }} />
      </div>

      {/* Pause overlay */}
      <AnimatePresence>
        {phase === 'paused' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ki-blue/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="text-center text-white">
              <p className="text-2xl font-bold mb-4">Pausen är aktiv</p>
              <button onClick={() => examStore.resumeExam()} className="px-6 py-3 bg-ki-gold text-ki-blue font-bold rounded-xl hover:bg-ki-gold-light">
                Fortsätt
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6">
          <AnimatePresence mode="wait">
            {currentQuestion && currentSection && (
              <motion.div
                key={`${currentSection.sectionName}-${currentQuestion.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                <QuestionView
                  question={currentQuestion}
                  sectionName={currentSection.sectionName}
                  onAnswer={handleAnswer}
                  selectedAnswer={answerKey}
                  isFlagged={examStore.isFlagged(currentSection.sectionName, currentQuestion.id)}
                  onToggleFlag={() => examStore.toggleFlag(currentSection.sectionName, currentQuestion.id)}
                  showResult={false}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100 shrink-0">
        <button
          onClick={() => examStore.prevQuestion()}
          disabled={currentQuestionIndex === 0 && currentSectionIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          Föregående
        </button>

        {/* Question dots */}
        <div className="flex gap-1 overflow-x-auto max-w-xs">
          {currentSection?.questions.map((q, i) => {
            const answered = currentSection && examStore.answers[`${currentSection.sectionName}-${q.id}`]
            const flagged = currentSection && examStore.isFlagged(currentSection.sectionName, q.id)
            return (
              <button
                key={q.id}
                onClick={() => useExamStore.setState({ currentQuestionIndex: i })}
                className={`w-6 h-6 rounded-md text-xs font-medium shrink-0 transition-colors ${
                  i === currentQuestionIndex ? 'bg-ki-blue text-white'
                  : flagged ? 'bg-amber-200 text-amber-800'
                  : answered ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>

        {currentQuestionIndex < (currentSection?.questions.length ?? 0) - 1 ? (
          <button
            onClick={() => examStore.nextQuestion()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ki-blue text-white text-sm hover:bg-ki-blue-light"
          >
            Nästa
            <ChevronRight size={16} />
          </button>
        ) : currentSectionIndex < sections.length - 1 ? (
          <button
            onClick={() => examStore.nextSection()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ki-blue text-white text-sm hover:bg-ki-blue-light"
          >
            Nästa del
            <SkipForward size={16} />
          </button>
        ) : (
          <button
            onClick={handleComplete}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ki-gold text-ki-blue font-bold text-sm"
          >
            Lämna in
            <CheckCircle2 size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
