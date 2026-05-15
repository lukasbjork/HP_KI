import type { StanineRow, SectionStats } from '@/types'

// Historical HP stanine boundaries (approximated from official VHS statistics)
// Each row: minimum fraction of max raw score to reach this stanine
export const STANINE_TABLE: StanineRow[] = [
  { stanine: 1, minAccuracy: 0.00, label: 'Stanine 1' },
  { stanine: 2, minAccuracy: 0.16, label: 'Stanine 2' },
  { stanine: 3, minAccuracy: 0.28, label: 'Stanine 3' },
  { stanine: 4, minAccuracy: 0.38, label: 'Stanine 4' },
  { stanine: 5, minAccuracy: 0.49, label: 'Stanine 5' },
  { stanine: 6, minAccuracy: 0.59, label: 'Stanine 6' },
  { stanine: 7, minAccuracy: 0.69, label: 'Stanine 7' },
  { stanine: 8, minAccuracy: 0.80, label: 'Stanine 8' },
  { stanine: 9, minAccuracy: 0.90, label: 'Stanine 9' },
]

// Karolinska Institutet – Läkarprogrammet historical cutoff stanine scores
export const KI_CUTOFFS: { year: number; season: string; stanine: number }[] = [
  { year: 2024, season: 'höst', stanine: 2.0 },
  { year: 2024, season: 'vår', stanine: 2.0 },
  { year: 2023, season: 'höst', stanine: 1.8 },
  { year: 2023, season: 'vår', stanine: 1.9 },
  { year: 2022, season: 'höst', stanine: 1.8 },
  { year: 2022, season: 'vår', stanine: 1.8 },
]

export const KI_TARGET_STANINE = 2.0

export function accuracyToStanine(accuracy: number): number {
  let stanine = 1
  for (const row of STANINE_TABLE) {
    if (accuracy >= row.minAccuracy) stanine = row.stanine
  }
  return stanine
}

export function weightedStanine(sectionStats: SectionStats[]): number {
  if (sectionStats.length === 0) return 0
  const totalCorrect = sectionStats.reduce((s, r) => s + r.correct, 0)
  const totalQuestions = sectionStats.reduce((s, r) => s + r.total, 0)
  if (totalQuestions === 0) return 0
  return accuracyToStanine(totalCorrect / totalQuestions)
}

export function formatDuration(ms: number): string {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${String(sec).padStart(2, '0')}`
}

export function percentageColor(accuracy: number): string {
  if (accuracy >= 0.8) return 'text-green-600'
  if (accuracy >= 0.6) return 'text-yellow-600'
  return 'text-red-500'
}

export function stanineToGrade(stanine: number): string {
  if (stanine >= 2.0) return 'KI-nivå'
  if (stanine >= 1.5) return 'Nära målet'
  if (stanine >= 1.0) return 'Under målet'
  return 'Fortsätt öva'
}
