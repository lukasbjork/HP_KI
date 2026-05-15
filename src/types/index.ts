// ──────────────────────────────────────────────────
// Core domain types
// ──────────────────────────────────────────────────

export type Season = 'vår' | 'höst'
export type ProvType = 'verbal' | 'kvantitativ'
export type VerbalSection = 'ORD' | 'LÄS' | 'MEK' | 'ELF'
export type QuantSection = 'XYZ' | 'KVA' | 'NOG' | 'DTK'
export type Section = VerbalSection | QuantSection

export type AnswerOption = 'A' | 'B' | 'C' | 'D' | 'E'

export interface Question {
  id: number
  question: string
  /** Optional image URL relative to /public */
  image?: string
  options: Record<AnswerOption, string>
  correct: AnswerOption
  explanation?: string
}

export type SectionMap<T extends Section> = T extends VerbalSection
  ? Partial<Record<VerbalSection, Question[]>>
  : Partial<Record<QuantSection, Question[]>>

export interface Session {
  id: string         // e.g. "hp-h2023-v1"
  year: number
  season: Season
  type: ProvType
  variant: number    // 1 or 2 (del 1 / del 2)
  sections: Partial<Record<Section, Question[]>>
}

/** Minimal metadata in index.json (avoids loading full question data) */
export interface SessionMeta {
  id: string
  year: number
  season: Season
  type: ProvType
  variant: number
  questionCount: number
}

// ──────────────────────────────────────────────────
// User progress
// ──────────────────────────────────────────────────

export interface QuestionAttempt {
  questionId: number
  sessionId: string
  section: Section
  chosen: AnswerOption
  correct: boolean
  timeMs: number
  timestamp: number
}

export interface SessionProgress {
  sessionId: string
  startedAt: number
  completedAt?: number
  /** Paused exam state (null when not paused) */
  pausedState?: PausedExamState | null
  attempts: QuestionAttempt[]
  score: number        // correct count
  total: number        // total questions
}

export interface PausedExamState {
  currentQuestionIndex: number
  sectionIndex: number
  remainingMs: number
  flagged: number[]
  answers: Record<number, AnswerOption>
}

// ──────────────────────────────────────────────────
// Exam state (not persisted between sessions)
// ──────────────────────────────────────────────────

export interface ActiveExamSection {
  sectionName: Section
  questions: Question[]
}

export interface ExamState {
  sessionId: string | null
  sections: ActiveExamSection[]
  currentSectionIndex: number
  currentQuestionIndex: number
  answers: Record<string, AnswerOption>   // key: `${sectionName}-${questionId}`
  flagged: Set<string>
  remainingMs: number
  timerRunning: boolean
  phase: 'idle' | 'intro' | 'active' | 'paused' | 'review' | 'complete'
}

// ──────────────────────────────────────────────────
// Spaced repetition (SRS / flashcards)
// ──────────────────────────────────────────────────

export type SRSRating = 'kan' | 'osäker' | 'kan inte'

export interface SRSCard {
  questionId: number
  sessionId: string
  section: Section
  /** SM-2 interval in days */
  interval: number
  /** SM-2 easiness factor */
  ef: number
  /** SM-2 repetition count */
  repetitions: number
  /** Unix timestamp for next review */
  nextReview: number
  lastRating?: SRSRating
}

// ──────────────────────────────────────────────────
// Settings
// ──────────────────────────────────────────────────

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
  examTimerEnabled: boolean
  showExplanationsImmediately: boolean
}

// ──────────────────────────────────────────────────
// Statistics helpers
// ──────────────────────────────────────────────────

export interface SectionStats {
  section: Section
  correct: number
  total: number
  accuracy: number  // 0–1
}

export interface ScoreDataPoint {
  sessionId: string
  year: number
  season: Season
  type: ProvType
  completedAt: number
  score: number
  total: number
  accuracy: number
}

// ──────────────────────────────────────────────────
// Stanine table (historical HP data)
// ──────────────────────────────────────────────────

export interface StanineRow {
  stanine: number
  minAccuracy: number  // 0–1, fraction of max raw score needed
  label: string
}
