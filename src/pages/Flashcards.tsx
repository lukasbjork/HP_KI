import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FlipHorizontal2, CheckCircle2, HelpCircle, XCircle } from 'lucide-react'
import { useProgressStore } from '@/stores/progressStore'
import { useSessionIndex, fetchSession } from '@/utils/useSessionData'
import { createSRSCard } from '@/utils/spaced-repetition'
import type { SRSRating, Question } from '@/types'

interface FlashCard {
  question: Question
  sessionId: string
  cardKey: string
}

export default function Flashcards() {
  const navigate = useNavigate()
  const { data: index } = useSessionIndex()
  const { srsCards, updateSRSCard } = useProgressStore()

  const [cards, setCards] = useState<FlashCard[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState(false)

  const loadCards = useCallback(async () => {
    if (!index) return
    setLoading(true)
    const pool: FlashCard[] = []
    for (const meta of index) {
      try {
        const session = await fetchSession(meta.id)
        const ordQuestions = session.sections['ORD'] ?? []
        for (const q of ordQuestions) {
          const key = `${meta.id}::ORD::${q.id}`
          const card = srsCards[key]
          const isDue = !card || card.nextReview <= Date.now()
          if (isDue) {
            pool.push({ question: q, sessionId: meta.id, cardKey: key })
          }
        }
      } catch {
        // Skip unavailable sessions
      }
    }
    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]]
    }
    setCards(pool.slice(0, 50))
    setCurrentIdx(0)
    setFlipped(false)
    setDone(false)
    setLoading(false)
  }, [index, srsCards])

  // Initial load when the session index becomes available
  useEffect(() => {
    if (index) loadCards()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const handleRate = useCallback((rating: SRSRating) => {
    const card = cards[currentIdx]
    if (!card) return

    const existing = srsCards[card.cardKey] ?? createSRSCard(card.sessionId, 'ORD', card.question.id)
    updateSRSCard(existing, rating)

    if (currentIdx + 1 >= cards.length) {
      setDone(true)
    } else {
      setCurrentIdx(i => i + 1)
      setFlipped(false)
    }
  }, [cards, currentIdx, srsCards, updateSRSCard])

  // Keyboard: space/enter flips; 1/2/3 rates when flipped
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (loading || done || cards.length === 0) return
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlipped(f => !f); return }
      if (!flipped) return
      if (e.key === '1') handleRate('kan inte')
      else if (e.key === '2') handleRate('osäker')
      else if (e.key === '3') handleRate('kan')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [loading, done, cards.length, flipped, handleRate])

  const masteredCount = Object.values(srsCards).filter(c => c.section === 'ORD' && c.repetitions > 2).length
  const totalORDCards = Object.values(srsCards).filter(c => c.section === 'ORD').length

  if (loading) {
    return <div className="p-8 text-gray-400 text-center">Laddar flashcards...</div>
  }

  if (done || cards.length === 0) {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <div className="w-20 h-20 bg-ki-gold rounded-full flex items-center justify-center mx-auto mb-6">
            <FlipHorizontal2 size={32} className="text-ki-blue" />
          </div>
        </motion.div>
        <h2 className="text-2xl font-bold text-ki-blue mb-2">
          {cards.length === 0 ? 'Inga kort att repetera!' : 'Session klar!'}
        </h2>
        <p className="text-gray-500 mb-4">
          {cards.length === 0
            ? 'Alla ORD-kort är inlärda och inte redo för repetering än.'
            : `Du repeterade ${cards.length} ord.`}
        </p>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Inlärda ord:</span>
            <span className="font-bold text-ki-blue">{masteredCount}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Totalt spårade:</span>
            <span className="font-bold text-gray-700">{totalORDCards}</span>
          </div>
        </div>
        {cards.length === 0 ? (
          <button
            onClick={() => navigate('/drill?section=ORD')}
            className="px-6 py-2.5 bg-ki-blue text-white rounded-xl font-semibold hover:bg-ki-blue-light"
          >
            Öva ORD istället
          </button>
        ) : (
          <button
            onClick={() => loadCards()}
            className="px-6 py-2.5 bg-ki-blue text-white rounded-xl font-semibold hover:bg-ki-blue-light"
          >
            Hämta nya kort
          </button>
        )}
      </div>
    )
  }

  const current = cards[currentIdx]

  return (
    <div className="max-w-lg mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ki-blue">ORD Flashcards</h1>
          <p className="text-gray-500 text-sm">
            {currentIdx + 1}/{cards.length} kort · {masteredCount} inlärda
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Inlärda</p>
          <p className="text-2xl font-bold text-ki-blue">{masteredCount}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
        <div
          className="h-1.5 bg-ki-blue rounded-full transition-all"
          style={{ width: `${(currentIdx / cards.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div
        className="relative h-72 cursor-pointer"
        onClick={() => setFlipped(f => !f)}
        style={{ perspective: '1000px' }}
      >
        <AnimatePresence mode="wait">
          {!flipped ? (
            <motion.div
              key="front"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-ki-blue rounded-3xl flex flex-col items-center justify-center p-8 shadow-xl"
            >
              <p className="text-white/50 text-sm mb-4 uppercase tracking-wider">Vad betyder...?</p>
              <p className="text-white text-3xl font-bold text-center">{current.question.question}</p>
              <p className="text-white/40 text-sm mt-8">Tryck för att vända</p>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-white rounded-3xl border-2 border-ki-blue/20 flex flex-col justify-center p-8 shadow-xl"
            >
              <p className="text-gray-400 text-sm mb-3 uppercase tracking-wider">Svarsalternativ:</p>
              <div className="space-y-2">
                {Object.entries(current.question.options).map(([opt, text]) => (
                  <div
                    key={opt}
                    className={`flex items-start gap-2 p-2 rounded-lg ${
                      opt === current.question.correct ? 'bg-green-50 border border-green-200' : ''
                    }`}
                  >
                    <span className={`font-bold text-sm w-5 shrink-0 ${opt === current.question.correct ? 'text-green-700' : 'text-gray-400'}`}>
                      {opt}
                    </span>
                    <span className={`text-sm ${opt === current.question.correct ? 'text-green-800 font-semibold' : 'text-gray-600'}`}>
                      {text}
                    </span>
                    {opt === current.question.correct && <CheckCircle2 size={14} className="text-green-600 mt-0.5 shrink-0" />}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rating buttons */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 grid grid-cols-3 gap-3"
          >
            <button
              onClick={() => handleRate('kan inte')}
              className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <XCircle size={20} className="text-red-500" />
              <span className="text-xs font-semibold text-red-700">Kan inte</span>
            </button>
            <button
              onClick={() => handleRate('osäker')}
              className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <HelpCircle size={20} className="text-amber-500" />
              <span className="text-xs font-semibold text-amber-700">Osäker</span>
            </button>
            <button
              onClick={() => handleRate('kan')}
              className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
            >
              <CheckCircle2 size={20} className="text-green-500" />
              <span className="text-xs font-semibold text-green-700">Kan</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!flipped && (
        <p className="text-center text-gray-400 text-sm mt-6">
          Klicka på kortet eller tryck <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">mellanslag</kbd> för att se svaret
        </p>
      )}
      {flipped && (
        <p className="text-center text-gray-400 text-xs mt-3">
          Tangentbord: <kbd className="px-1 bg-gray-100 rounded">1</kbd> kan inte ·
          <kbd className="px-1 bg-gray-100 rounded ml-1">2</kbd> osäker ·
          <kbd className="px-1 bg-gray-100 rounded ml-1">3</kbd> kan
        </p>
      )}
    </div>
  )
}
