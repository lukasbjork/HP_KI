/**
 * Extracts quantitative questions (XYZ, KVA, NOG, DTK) from a kvant PDF.
 *
 * Quantitative questions contain math notation and diagrams that cannot be
 * extracted reliably as text, so each question is rendered to an image
 * (see render-images.ts). The answer comes from the facit. DTK questions are
 * stitched together with their shared figure page.
 *
 * Modern HP quant structure (both kvant1 and kvant2, 40 questions each):
 *   XYZ 1–12, KVA 13–22, NOG 23–28, DTK 29–40
 */
import type { SectionAnswers, AnswerKey } from './parse-facit.js'
import type { RawQuestion } from './extract-verbal.js'
import { renderQuestionImages } from './render-images.js'

type QuantSection = 'XYZ' | 'KVA' | 'NOG' | 'DTK'

export interface QuantQuestion extends RawQuestion {
  image: string
}

function detectQuantSection(num: number): QuantSection {
  if (num <= 12) return 'XYZ'
  if (num <= 22) return 'KVA'
  if (num <= 28) return 'NOG'
  return 'DTK'
}

// Number of answer options per section (XYZ/KVA/DTK use A–D, NOG uses A–E)
function optionLetters(section: QuantSection): AnswerKey[] {
  return section === 'NOG'
    ? ['A', 'B', 'C', 'D', 'E']
    : ['A', 'B', 'C', 'D']
}

function letterOptions(section: QuantSection): Record<AnswerKey, string> {
  const opts = {} as Record<AnswerKey, string>
  for (const l of optionLetters(section)) opts[l] = l
  return opts
}

export async function extractQuant(
  pdfSlug: string,
  pdfSection: 'kvant1' | 'kvant2',
  answers: SectionAnswers,
): Promise<Map<QuantSection, QuantQuestion[]>> {
  const result = new Map<QuantSection, QuantQuestion[]>([
    ['XYZ', []], ['KVA', []], ['NOG', []], ['DTK', []],
  ])

  // Render per-question images (DTK = 29–40 gets its figure page stitched in)
  const images = await renderQuestionImages(pdfSlug, pdfSection, n => n >= 29 && n <= 40)

  for (let num = 1; num <= 40; num++) {
    const correct = answers[num]
    const image = images.get(num)
    // Need both an answer key and a rendered image to be usable
    if (!correct || !image) continue

    const section = detectQuantSection(num)
    result.get(section)!.push({
      id: num,
      question: '',
      image,
      options: letterOptions(section),
      correct,
    })
  }

  return result
}
