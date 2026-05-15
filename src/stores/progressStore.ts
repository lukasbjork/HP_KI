import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SessionProgress, QuestionAttempt, SRSCard, SRSRating, Section } from '@/types'

interface ProgressState {
  sessions: Record<string, SessionProgress>
  srsCards: Record<string, SRSCard>   // key: `${sessionId}::${section}::${questionId}`
  streak: number
  lastStudiedDate: string | null       // ISO date "YYYY-MM-DD"

  // Session progress
  startSession: (sessionId: string, total: number) => void
  recordAttempt: (attempt: QuestionAttempt) => void
  completeSession: (sessionId: string) => void
  clearSession: (sessionId: string) => void

  // SRS
  updateSRSCard: (card: SRSCard, rating: SRSRating) => void
  getSRSDueCards: (section?: Section) => SRSCard[]

  // Streak
  touchStreak: () => void

  // Stats helpers
  getTotalAttempts: () => number
  getAccuracyBySection: () => Record<string, { correct: number; total: number }>
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function sm2(card: SRSCard, rating: SRSRating): SRSCard {
  // SM-2 quality: kan=5, osäker=3, kan inte=1
  const q = rating === 'kan' ? 5 : rating === 'osäker' ? 3 : 1

  let { ef, repetitions, interval } = card

  if (q >= 3) {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * ef)
    repetitions += 1
  } else {
    repetitions = 0
    interval = 1
  }

  ef = Math.max(1.3, ef + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))

  const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000

  return { ...card, ef, repetitions, interval, nextReview, lastRating: rating }
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      sessions: {},
      srsCards: {},
      streak: 0,
      lastStudiedDate: null,

      startSession(sessionId, total) {
        const existing = get().sessions[sessionId]
        if (existing?.completedAt) return  // already done
        set(s => ({
          sessions: {
            ...s.sessions,
            [sessionId]: existing ?? {
              sessionId,
              startedAt: Date.now(),
              attempts: [],
              score: 0,
              total,
            },
          },
        }))
      },

      recordAttempt(attempt) {
        set(s => {
          const session = s.sessions[attempt.sessionId]
          if (!session) return s
          const existing = session.attempts.find(
            a => a.questionId === attempt.questionId && a.section === attempt.section
          )
          const attempts = existing
            ? session.attempts.map(a =>
                a.questionId === attempt.questionId && a.section === attempt.section ? attempt : a
              )
            : [...session.attempts, attempt]
          const score = attempts.filter(a => a.correct).length
          return {
            sessions: {
              ...s.sessions,
              [attempt.sessionId]: { ...session, attempts, score },
            },
          }
        })
      },

      completeSession(sessionId) {
        set(s => {
          const session = s.sessions[sessionId]
          if (!session) return s
          return {
            sessions: {
              ...s.sessions,
              [sessionId]: { ...session, completedAt: Date.now() },
            },
          }
        })
        get().touchStreak()
      },

      clearSession(sessionId) {
        set(s => {
          const next = { ...s.sessions }
          delete next[sessionId]
          return { sessions: next }
        })
      },

      updateSRSCard(card, rating) {
        const updated = sm2(card, rating)
        const key = `${card.sessionId}::${card.section}::${card.questionId}`
        set(s => ({ srsCards: { ...s.srsCards, [key]: updated } }))
      },

      getSRSDueCards(section) {
        const now = Date.now()
        return Object.values(get().srsCards).filter(c => {
          if (section && c.section !== section) return false
          return c.nextReview <= now
        })
      },

      touchStreak() {
        const today = todayISO()
        set(s => {
          if (s.lastStudiedDate === today) return s
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const isConsecutive = s.lastStudiedDate === yesterday.toISOString().slice(0, 10)
          return {
            streak: isConsecutive ? s.streak + 1 : 1,
            lastStudiedDate: today,
          }
        })
      },

      getTotalAttempts() {
        return Object.values(get().sessions).reduce((n, s) => n + s.attempts.length, 0)
      },

      getAccuracyBySection() {
        const acc: Record<string, { correct: number; total: number }> = {}
        for (const session of Object.values(get().sessions)) {
          for (const attempt of session.attempts) {
            if (!acc[attempt.section]) acc[attempt.section] = { correct: 0, total: 0 }
            acc[attempt.section].total += 1
            if (attempt.correct) acc[attempt.section].correct += 1
          }
        }
        return acc
      },
    }),
    { name: 'hp-ki-progress' }
  )
)
