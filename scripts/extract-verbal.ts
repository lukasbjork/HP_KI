/**
 * Extracts verbal questions (ORD, LÄS, MEK, ELF) from a verbal section PDF.
 * Uses pdf-parse for text extraction. Verbal PDFs are text-based so OCR is not needed.
 */
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

import type { SectionAnswers, AnswerKey } from './parse-facit.js'

export interface RawQuestion {
  id: number
  question: string
  options: Record<AnswerKey, string>
  correct: AnswerKey
}

export interface VerbalSections {
  ORD: RawQuestion[]
  LÄS: RawQuestion[]
  MEK: RawQuestion[]
  ELF: RawQuestion[]
}

const OPTIONS: AnswerKey[] = ['A', 'B', 'C', 'D', 'E']

function cleanText(s: string) {
  return s.replace(/\s+/g, ' ').trim()
}

/**
 * Detects which section a question belongs to based on its number and PDF section.
 * verb1: ORD=1-10, LÄS=11-40
 * verb2: MEK=1-10, LÄS=11-40 (ELF is rare/historical, treated same as LÄS)
 */
function detectSection(questionNum: number, pdfSection: 'verb1' | 'verb2'): keyof VerbalSections {
  if (pdfSection === 'verb1') {
    return questionNum <= 10 ? 'ORD' : 'LÄS'
  }
  // verb2
  return questionNum <= 10 ? 'MEK' : 'ELF'
}

/**
 * Parse questions from raw PDF text.
 * Looks for numbered questions (1., 2., ... or "Fråga 1") followed by A–E options.
 */
function parseQuestionsFromText(
  text: string,
  answers: SectionAnswers,
  pdfSection: 'verb1' | 'verb2'
): Map<keyof VerbalSections, RawQuestion[]> {
  const result = new Map<keyof VerbalSections, RawQuestion[]>([
    ['ORD', []], ['LÄS', []], ['MEK', []], ['ELF', []]
  ])

  // Split into question blocks: lines starting with a question number
  const questionBlocks: { num: number; text: string }[] = []
  const lines = text.split('\n')
  let currentBlock: { num: number; lines: string[] } | null = null

  for (const line of lines) {
    const m = line.match(/^(\d{1,2})[.)]\s+(.+)/)
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

  for (const block of questionBlocks) {
    const correct = answers[block.num]
    if (!correct) continue  // no answer key → skip

    // Try to extract A–E options
    const optionTexts: Partial<Record<AnswerKey, string>> = {}
    let questionText = block.text

    for (const opt of OPTIONS) {
      const re = new RegExp(`${opt}[.):]\\s*([^A-E]{3,80})`, 'g')
      const m = re.exec(block.text)
      if (m) {
        optionTexts[opt] = cleanText(m[1])
        questionText = questionText.replace(m[0], '')
      }
    }

    // Only include if we have at least 2 options parsed
    const parsedOpts = OPTIONS.filter(o => optionTexts[o])
    if (parsedOpts.length < 2) {
      // Store with placeholder options
      OPTIONS.forEach(o => { if (!optionTexts[o]) optionTexts[o] = `[alternativ ${o}]` })
    }

    const q: RawQuestion = {
      id: block.num,
      question: cleanText(questionText.split(/[A-E][.):]/).shift() ?? block.text).slice(0, 400),
      options: {
        A: optionTexts.A ?? '[alternativ A]',
        B: optionTexts.B ?? '[alternativ B]',
        C: optionTexts.C ?? '[alternativ C]',
        D: optionTexts.D ?? '[alternativ D]',
        E: optionTexts.E ?? '[alternativ E]',
      },
      correct,
    }

    const section = detectSection(block.num, pdfSection)
    result.get(section)!.push(q)
  }

  return result
}

export async function extractVerbal(
  pdfSlug: string,
  pdfSection: 'verb1' | 'verb2',
  answers: SectionAnswers
): Promise<Map<keyof VerbalSections, RawQuestion[]>> {
  const pdfPath = path.resolve('scripts/pdfs', pdfSlug, `${pdfSection}.pdf`)
  if (!fs.existsSync(pdfPath)) {
    console.warn(`  PDF saknas: ${pdfPath}`)
    return new Map([['ORD', []], ['LÄS', []], ['MEK', []], ['ELF', []]])
  }

  const buffer = fs.readFileSync(pdfPath)
  const data = await pdfParse(buffer)
  return parseQuestionsFromText(data.text, answers, pdfSection)
}
