import { create } from 'zustand'
import type { ExamState, ActiveExamSection, AnswerOption, Section, Question } from '@/types'

const SECTION_DURATION_MS = 55 * 60 * 1000

interface ExamActions {
  initExam: (sessionId: string, sections: ActiveExamSection[]) => void
  startExam: () => void
  answerQuestion: (sectionName: Section, questionId: number, answer: AnswerOption) => void
  toggleFlag: (sectionName: Section, questionId: number) => void
  nextQuestion: () => void
  prevQuestion: () => void
  nextSection: () => void
  pauseExam: () => void
  resumeExam: () => void
  tickTimer: (deltaMs: number) => void
  finishExam: () => void
  resetExam: () => void
  setPhase: (phase: ExamState['phase']) => void
  getCurrentQuestion: () => Question | null
  getCurrentSection: () => ActiveExamSection | null
  getAnswerKey: (sectionName: Section, questionId: number) => string
  isFlagged: (sectionName: Section, questionId: number) => boolean
}

type ExamStore = ExamState & ExamActions

const initial: ExamState = {
  sessionId: null,
  sections: [],
  currentSectionIndex: 0,
  currentQuestionIndex: 0,
  answers: {},
  flagged: new Set(),
  remainingMs: SECTION_DURATION_MS,
  timerRunning: false,
  phase: 'idle',
}

function answerKey(section: Section, questionId: number) {
  return `${section}-${questionId}`
}

export const useExamStore = create<ExamStore>((set, get) => ({
  ...initial,

  initExam(sessionId, sections) {
    set({ ...initial, sessionId, sections, phase: 'intro' })
  },

  startExam() {
    set({ phase: 'active', timerRunning: true, remainingMs: SECTION_DURATION_MS })
  },

  answerQuestion(sectionName, questionId, answer) {
    set(s => ({ answers: { ...s.answers, [answerKey(sectionName, questionId)]: answer } }))
  },

  toggleFlag(sectionName, questionId) {
    set(s => {
      const key = answerKey(sectionName, questionId)
      const next = new Set(s.flagged)
      next.has(key) ? next.delete(key) : next.add(key)
      return { flagged: next }
    })
  },

  nextQuestion() {
    set(s => {
      const section = s.sections[s.currentSectionIndex]
      if (!section) return s
      const next = s.currentQuestionIndex + 1
      if (next < section.questions.length) return { currentQuestionIndex: next }
      return s
    })
  },

  prevQuestion() {
    set(s => ({
      currentQuestionIndex: Math.max(0, s.currentQuestionIndex - 1),
    }))
  },

  nextSection() {
    set(s => {
      const next = s.currentSectionIndex + 1
      if (next >= s.sections.length) return { phase: 'complete', timerRunning: false }
      return {
        currentSectionIndex: next,
        currentQuestionIndex: 0,
        remainingMs: SECTION_DURATION_MS,
      }
    })
  },

  pauseExam() {
    set({ timerRunning: false, phase: 'paused' })
  },

  resumeExam() {
    set({ timerRunning: true, phase: 'active' })
  },

  tickTimer(deltaMs) {
    set(s => {
      if (!s.timerRunning) return s
      const remainingMs = Math.max(0, s.remainingMs - deltaMs)
      if (remainingMs === 0) return { remainingMs, timerRunning: false, phase: 'complete' }
      return { remainingMs }
    })
  },

  finishExam() {
    set({ phase: 'complete', timerRunning: false })
  },

  resetExam() {
    set(initial)
  },

  setPhase(phase) {
    set({ phase })
  },

  getCurrentQuestion() {
    const s = get()
    const section = s.sections[s.currentSectionIndex]
    return section?.questions[s.currentQuestionIndex] ?? null
  },

  getCurrentSection() {
    const s = get()
    return s.sections[s.currentSectionIndex] ?? null
  },

  getAnswerKey(sectionName, questionId) {
    return get().answers[answerKey(sectionName, questionId)] ?? ''
  },

  isFlagged(sectionName, questionId) {
    return get().flagged.has(answerKey(sectionName, questionId))
  },
}))
