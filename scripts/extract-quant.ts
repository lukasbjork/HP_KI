/**
 * Extracts quantitative questions (XYZ, KVA, NOG, DTK) from a kvant PDF.
 * Quantitative PDFs often contain diagrams/images. This script uses pdf-parse
 * for text-based questions and marks image-heavy questions as placeholders.
 */
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

import type { SectionAnswers, AnswerKey } from './parse-facit.js'
import type { RawQuestion } from './extract-verbal.js'

const OPTIONS: AnswerKey[] = ['A', 'B', 'C', 'D', 'E']

// kvant1: XYZ=1-12, KVA=13-22, NOG=23-28, DTK not present (or NOG extends further)
// kvant2: XYZ=1-12, KVA=13-22, DTK=23-40
// These ranges come from the actual HP test structure:
// XYZ: 12 q, KVA: 10 q, NOG: 6 q (kvant1 only), DTK: 12 q (kvant2 only)
type QuantSection = 'XYZ' | 'KVA' | 'NOG' | 'DTK'

function detectQuantSection(num: number, pdfSection: 'kvant1' | 'kvant2'): QuantSection {
  if (num <= 12) return 'XYZ'
  if (num <= 22) return 'KVA'
  if (pdfSection === 'kvant1') return 'NOG'
  return 'DTK'
}

function buildPlaceholder(num: number, correct: AnswerKey): RawQuestion {
  return {
    id: num,
    question: `[Fråga ${num} — matematisk uppgift, se original-PDF]`,
    options: {
      A: '[alternativ A]',
      B: '[alternativ B]',
      C: '[alternativ C]',
      D: '[alternativ D]',
      E: '[alternativ E]',
    },
    correct,
  }
}

function parseQuantText(
  text: string,
  answers: SectionAnswers,
  pdfSection: 'kvant1' | 'kvant2'
): Map<QuantSection, RawQuestion[]> {
  const result = new Map<QuantSection, RawQuestion[]>([
    ['XYZ', []], ['KVA', []], ['NOG', []], ['DTK', []]
  ])

  const lines = text.split('\n')
  const questionBlocks: { num: number; text: string }[] = []
  let currentBlock: { num: number; lines: string[] } | null = null

  for (const line of lines) {
    const m = line.match(/^(\d{1,2})[.)]\s+(.*)/)
    if (m) {
      const num = parseInt(m[1])
      if (num >= 1 && num <= 40) {
        if (currentBlock) questionBlocks.push({ num: currentBlock.num, text: currentBlock.lines.join(' ') })
        currentBlock = { num, lines: [m[2]] }
        continue
      }
    }
    if (currentBlock) currentBlock.lines.push(line)
  }
  if (currentBlock) questionBlocks.push({ num: currentBlock.num, text: currentBlock.lines.join(' ') })

  // Fill from parsed blocks
  const parsed = new Map<number, string>()
  for (const block of questionBlocks) parsed.set(block.num, block.text)

  // For every expected question number, build a question
  const maxQ = pdfSection === 'kvant1' ? 28 : 34  // XYZ(12) + KVA(10) + NOG(6) or DTK(12)
  for (let num = 1; num <= maxQ; num++) {
    const correct = answers[num]
    if (!correct) continue

    const section = detectQuantSection(num, pdfSection)
    const blockText = parsed.get(num)

    let q: RawQuestion
    if (blockText && blockText.length > 20) {
      const optionTexts: Partial<Record<AnswerKey, string>> = {}
      let questionText = blockText
      for (const opt of OPTIONS) {
        const re = new RegExp(`${opt}[.):]\\s*([^A-E]{2,60})`)
        const m = re.exec(blockText)
        if (m) {
          optionTexts[opt] = m[1].trim()
          questionText = questionText.replace(m[0], '')
        }
      }
      q = {
        id: num,
        question: questionText.trim().slice(0, 400) || `[Fråga ${num}]`,
        options: {
          A: optionTexts.A ?? '[alternativ A]',
          B: optionTexts.B ?? '[alternativ B]',
          C: optionTexts.C ?? '[alternativ C]',
          D: optionTexts.D ?? '[alternativ D]',
          E: optionTexts.E ?? '[alternativ E]',
        },
        correct,
      }
    } else {
      q = buildPlaceholder(num, correct)
    }

    result.get(section)!.push(q)
  }

  return result
}

export async function extractQuant(
  pdfSlug: string,
  pdfSection: 'kvant1' | 'kvant2',
  answers: SectionAnswers
): Promise<Map<QuantSection, RawQuestion[]>> {
  const pdfPath = path.resolve('scripts/pdfs', pdfSlug, `${pdfSection}.pdf`)
  if (!fs.existsSync(pdfPath)) {
    console.warn(`  PDF saknas: ${pdfPath}`)
    return new Map([['XYZ', []], ['KVA', []], ['NOG', []], ['DTK', []]])
  }

  const buffer = fs.readFileSync(pdfPath)
  const data = await pdfParse(buffer)
  return parseQuantText(data.text, answers, pdfSection)
}
