/**
 * Parses the facit (answer key) PDF for a given session slug.
 * Returns answer maps for verb1, verb2, kvant1, kvant2.
 */
import fs from 'fs'
import path from 'path'

// pdf-parse is a CommonJS module — use createRequire for ESM compatibility
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

export type AnswerKey = 'A' | 'B' | 'C' | 'D' | 'E'
export type SectionAnswers = Record<number, AnswerKey>  // question number → answer

export interface FacitResult {
  verb1: SectionAnswers
  verb2: SectionAnswers
  kvant1: SectionAnswers
  kvant2: SectionAnswers
}

const VALID_ANSWERS = new Set(['A', 'B', 'C', 'D', 'E'])

function parseModern(text: string): FacitResult | null {
  // Modern 4-column format:  N A  N B  N C  N D  (one row per question number)
  const rows: string[][] = []
  const lineRe = /(\d+)\s+([A-E])\s+(\d+)\s+([A-E])\s+(\d+)\s+([A-E])\s+(\d+)\s+([A-E])/g
  let m: RegExpExecArray | null
  while ((m = lineRe.exec(text)) !== null) {
    rows.push([m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8]])
  }
  if (rows.length < 20) return null

  // Columns: [verb1, kvant1, verb2, kvant2]
  const sections: SectionAnswers[] = [{}, {}, {}, {}]
  for (const row of rows) {
    for (let col = 0; col < 4; col++) {
      const num = parseInt(row[col * 2])
      const ans = row[col * 2 + 1] as AnswerKey
      if (!isNaN(num) && VALID_ANSWERS.has(ans)) {
        sections[col][num] = ans
      }
    }
  }
  return { verb1: sections[0], kvant1: sections[1], verb2: sections[2], kvant2: sections[3] }
}

function parseFallback(text: string): FacitResult {
  // Sequential parsing: look for section headers then extract Q→A pairs
  const result: FacitResult = { verb1: {}, verb2: {}, kvant1: {}, kvant2: {} }
  const sectionOrder: (keyof FacitResult)[] = ['verb1', 'verb2', 'kvant1', 'kvant2']
  let currentIdx = 0

  const lines = text.split('\n')
  const pairRe = /\b(\d{1,2})\s+([A-E])\b/g
  for (const line of lines) {
    const lower = line.toLowerCase()
    if (/verbal.*del\s*1|verb(al)?\s*1|provpass\s*1/i.test(lower)) { currentIdx = 0; continue }
    if (/verbal.*del\s*2|verb(al)?\s*2|provpass\s*2/i.test(lower)) { currentIdx = 1; continue }
    if (/kvant.*del\s*1|kvant\s*1|provpass\s*3/i.test(lower)) { currentIdx = 2; continue }
    if (/kvant.*del\s*2|kvant\s*2|provpass\s*4/i.test(lower)) { currentIdx = 3; continue }

    let m: RegExpExecArray | null
    pairRe.lastIndex = 0
    while ((m = pairRe.exec(line)) !== null) {
      const num = parseInt(m[1])
      const ans = m[2] as AnswerKey
      if (num >= 1 && num <= 40 && VALID_ANSWERS.has(ans)) {
        result[sectionOrder[currentIdx]][num] = ans
      }
    }
  }
  return result
}

export async function parseFacit(pdfSlug: string): Promise<FacitResult> {
  const pdfPath = path.resolve('scripts/pdfs', pdfSlug, 'facit.pdf')
  if (!fs.existsSync(pdfPath)) throw new Error(`Facit saknas: ${pdfPath}`)

  const buffer = fs.readFileSync(pdfPath)
  const data = await pdfParse(buffer)
  const text: string = data.text

  const modern = parseModern(text)
  if (modern) return modern
  return parseFallback(text)
}
