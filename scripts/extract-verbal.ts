/**
 * Extracts verbal questions from a verbal section PDF.
 *
 * Each verbal pass (verb1 and verb2) contains all four verbal sections:
 *   ORD 1–10, LÄS 11–20, MEK 21–30, ELF 31–40
 *
 * Strategy (hybrid):
 *   - ORD: clean text extraction (word + 5 options) — powers the flashcards.
 *   - LÄS / MEK / ELF: rendered as images (passages/sentences are hard to
 *     reconstruct reliably as text; LÄS/ELF reading passages are stitched in).
 */
import fs from 'fs'
import path from 'path'
import type { SectionAnswers, AnswerKey } from './parse-facit.js'
import { renderQuestionImages } from './render-images.js'
import { getPdfTextColumns } from './pdf-text.js'

export interface RawQuestion {
  id: number
  question: string
  options: Record<AnswerKey, string>
  correct: AnswerKey
  image?: string
}

export interface VerbalSections {
  ORD: RawQuestion[]
  LÄS: RawQuestion[]
  MEK: RawQuestion[]
  ELF: RawQuestion[]
}

const ALL_OPTS: AnswerKey[] = ['A', 'B', 'C', 'D', 'E']

function detectSection(num: number): keyof VerbalSections {
  if (num <= 10) return 'ORD'
  if (num <= 20) return 'LÄS'
  if (num <= 30) return 'MEK'
  return 'ELF'
}

/**
 * Parse ORD questions (1–10) from the PDF text. Each block is:
 *   "N. word"  then five lines "A option" … "E option"
 */
function parseOrd(text: string, answers: SectionAnswers): RawQuestion[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const out: RawQuestion[] = []

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\d{1,2})[.)]\s*[\t ]*(.+)$/)
    if (!m) continue
    const num = parseInt(m[1])
    if (num < 1 || num > 10) continue
    const word = m[2].replace(/\s+/g, ' ').trim()
    // Word should be a single token (ORD tests one word). Skip false matches.
    if (!word || word.length > 40 || /\s/.test(word)) continue

    // Collect the next five "LETTER option" lines
    const opts: Partial<Record<AnswerKey, string>> = {}
    let j = i + 1
    let found = 0
    while (j < lines.length && found < 5) {
      const om = lines[j].match(/^([A-E])[.)]?\s+(.+)$/)
      if (om) {
        opts[om[1] as AnswerKey] = om[2].replace(/\s+/g, ' ').trim()
        found++
        j++
      } else {
        break
      }
    }

    const correct = answers[num]
    if (found >= 4 && correct && !out.some(q => q.id === num)) {
      out.push({
        id: num,
        question: word,
        options: {
          A: opts.A ?? '', B: opts.B ?? '', C: opts.C ?? '',
          D: opts.D ?? '', E: opts.E ?? '',
        },
        correct,
      })
    }
  }

  return out.sort((a, b) => a.id - b.id)
}

export async function extractVerbal(
  pdfSlug: string,
  pdfSection: 'verb1' | 'verb2',
  answers: SectionAnswers,
): Promise<Map<keyof VerbalSections, RawQuestion[]>> {
  const result = new Map<keyof VerbalSections, RawQuestion[]>([
    ['ORD', []], ['LÄS', []], ['MEK', []], ['ELF', []],
  ])

  const pdfPath = path.resolve('scripts/pdfs', pdfSlug, `${pdfSection}.pdf`)
  if (!fs.existsSync(pdfPath)) {
    console.warn(`  PDF saknas: ${pdfPath}`)
    return result
  }

  // ORD as text (column-aware: ORD is laid out in two columns)
  const text = await getPdfTextColumns(pdfPath)
  result.set('ORD', parseOrd(text, answers))

  // LÄS / MEK / ELF as images. LÄS (11–20) and ELF (31–40) reference reading
  // passages → stitch the preceding passage page. MEK (21–30) is self-contained.
  const images = await renderQuestionImages(pdfSlug, pdfSection, n => (n >= 11 && n <= 20) || (n >= 31 && n <= 40))

  for (let num = 11; num <= 40; num++) {
    const correct = answers[num]
    const image = images.get(num)
    if (!correct || !image) continue
    const section = detectSection(num)
    result.get(section)!.push({
      id: num,
      question: '',
      image,
      options: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' },
      correct,
    })
  }

  return result
}

export { ALL_OPTS }
