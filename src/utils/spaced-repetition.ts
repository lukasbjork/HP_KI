import type { SRSCard, Section } from '@/types'

export function createSRSCard(sessionId: string, section: Section, questionId: number): SRSCard {
  return {
    questionId,
    sessionId,
    section,
    interval: 0,
    ef: 2.5,
    repetitions: 0,
    nextReview: Date.now(),
  }
}

export function isDue(card: SRSCard): boolean {
  return card.nextReview <= Date.now()
}

export function daysUntilDue(card: SRSCard): number {
  return Math.ceil((card.nextReview - Date.now()) / (24 * 60 * 60 * 1000))
}

/** Weighted shuffle – questions with lower accuracy in history appear earlier */
export function weightedShuffle<T>(
  items: T[],
  weightFn: (item: T) => number
): T[] {
  return [...items]
    .map(item => ({ item, sort: Math.random() * weightFn(item) }))
    .sort((a, b) => b.sort - a.sort)
    .map(({ item }) => item)
}

/** Calculate a difficulty weight 0–1 for a question based on attempt history */
export function difficultyWeight(
  sessionId: string,
  questionId: number,
  attempts: { sessionId: string; questionId: number; correct: boolean }[]
): number {
  const relevant = attempts.filter(
    a => a.sessionId === sessionId && a.questionId === questionId
  )
  if (relevant.length === 0) return 0.5  // unknown → medium weight
  const wrongCount = relevant.filter(a => !a.correct).length
  return wrongCount / relevant.length
}
