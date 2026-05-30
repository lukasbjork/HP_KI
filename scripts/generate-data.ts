/**
 * Main orchestrator. Reads downloaded PDFs → generates JSON + images in public/data/.
 *
 * Usage: npm run generate-data
 *   Optional scope: HP_SLUGS="var-2026,host-2025" npm run generate-data
 *
 * Output:
 *   public/data/index.json       — SessionMeta[] (only sessions with questions)
 *   public/data/sessions/*.json  — one Session JSON per session ID
 *   public/data/images/...       — rendered question images (quant + LÄS/MEK/ELF)
 */
import fs from 'fs'
import path from 'path'
import { SESSIONS } from './sessions.js'
import { parseFacit } from './parse-facit.js'
import { extractVerbal } from './extract-verbal.js'
import { extractQuant } from './extract-quant.js'

const OUT_DIR = path.resolve('public/data')
const SESSIONS_DIR = path.join(OUT_DIR, 'sessions')

const SLUG_FILTER = (process.env.HP_SLUGS ?? '')
  .split(',').map(s => s.trim()).filter(Boolean)

interface Question {
  id: number
  question: string
  image?: string
  options: Record<string, string>
  correct: string
  explanation?: string
}

type Sections = Record<string, Question[]>

interface SessionMeta {
  id: string; year: number; season: string; type: string; variant: number; questionCount: number
}

function mapToSections(m: Map<string, { id: number; question: string; options: Record<string, string>; correct: string; image?: string }[]>): Sections {
  const out: Sections = {}
  for (const [sec, qs] of m.entries()) out[sec] = qs as Question[]
  return out
}

/** Process all four PDF sections for a slug, keyed by pdf section name. */
async function processSlug(pdfSlug: string): Promise<Map<string, Sections>> {
  let facit
  try {
    facit = await parseFacit(pdfSlug)
  } catch (e) {
    console.warn(`  Facit saknas för ${pdfSlug}:`, (e as Error).message)
    return new Map()
  }

  const result = new Map<string, Sections>()
  result.set('verb1', mapToSections(await extractVerbal(pdfSlug, 'verb1', facit.verb1)))
  result.set('verb2', mapToSections(await extractVerbal(pdfSlug, 'verb2', facit.verb2)))
  result.set('kvant1', mapToSections(await extractQuant(pdfSlug, 'kvant1', facit.kvant1)))
  result.set('kvant2', mapToSections(await extractQuant(pdfSlug, 'kvant2', facit.kvant2)))
  return result
}

function pdfSectionForSession(session: typeof SESSIONS[0]): 'verb1' | 'verb2' | 'kvant1' | 'kvant2' {
  if (session.type === 'verbal') return session.variant === 1 ? 'verb1' : 'verb2'
  return session.variant === 1 ? 'kvant1' : 'kvant2'
}

/** Preserve hand-written explanations from any existing session JSON. */
function mergeExplanations(sessionId: string, sections: Sections): void {
  const existingPath = path.join(SESSIONS_DIR, `${sessionId}.json`)
  if (!fs.existsSync(existingPath)) return
  try {
    const prev = JSON.parse(fs.readFileSync(existingPath, 'utf-8'))
    const expl = new Map<string, string>()
    for (const [sec, qs] of Object.entries(prev.sections ?? {})) {
      for (const q of qs as Question[]) {
        if (q.explanation) expl.set(`${sec}::${q.id}`, q.explanation)
      }
    }
    for (const [sec, qs] of Object.entries(sections)) {
      for (const q of qs) {
        const e = expl.get(`${sec}::${q.id}`)
        if (e && !q.explanation) q.explanation = e
      }
    }
  } catch { /* ignore malformed previous file */ }
}

async function main() {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true })

  const slugCache = new Map<string, Map<string, Sections>>()
  const index: SessionMeta[] = []

  for (const session of SESSIONS) {
    if (SLUG_FILTER.length && !SLUG_FILTER.includes(session.pdfSlug)) continue

    // Skip sessions whose PDFs were not downloaded
    const facitPath = path.resolve('scripts/pdfs', session.pdfSlug, 'facit.pdf')
    if (!fs.existsSync(facitPath)) continue

    process.stdout.write(`Bearbetar ${session.id} ... `)

    if (!slugCache.has(session.pdfSlug)) {
      slugCache.set(session.pdfSlug, await processSlug(session.pdfSlug))
    }

    const slugData = slugCache.get(session.pdfSlug)!
    const pdfSec = pdfSectionForSession(session)
    const sections = slugData.get(pdfSec) ?? {}

    const questionCount = Object.values(sections).reduce((n, qs) => n + qs.length, 0)
    if (questionCount === 0) {
      console.log('0 frågor — hoppar över')
      continue
    }

    mergeExplanations(session.id, sections)

    const sessionJSON = {
      id: session.id, year: session.year, season: session.season,
      type: session.type, variant: session.variant, sections,
    }
    fs.writeFileSync(path.join(SESSIONS_DIR, `${session.id}.json`), JSON.stringify(sessionJSON, null, 2), 'utf-8')

    index.push({
      id: session.id, year: session.year, season: session.season,
      type: session.type, variant: session.variant, questionCount,
    })
    console.log(`${questionCount} frågor`)
  }

  index.sort((a, b) => b.year - a.year || a.season.localeCompare(b.season) || a.id.localeCompare(b.id))
  fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(index, null, 2), 'utf-8')
  console.log(`\nFärdigt! ${index.length} sessioner skrivna till index.json.`)
}

main().catch(console.error)
