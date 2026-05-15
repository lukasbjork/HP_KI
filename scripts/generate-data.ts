/**
 * Main orchestrator. Reads all PDFs → generates JSON files in public/data/.
 *
 * Usage: npm run generate-data
 *
 * Prerequisites: npm run download-pdfs (downloads PDFs first)
 *
 * Output:
 *   public/data/index.json       — SessionMeta[] list
 *   public/data/sessions/*.json  — one Session JSON per session ID
 */
import fs from 'fs'
import path from 'path'
import { SESSIONS } from './sessions.js'
import { parseFacit } from './parse-facit.js'
import { extractVerbal } from './extract-verbal.js'
import { extractQuant } from './extract-quant.js'

const OUT_DIR = path.resolve('public/data')
const SESSIONS_DIR = path.join(OUT_DIR, 'sessions')

interface SessionJSON {
  id: string
  year: number
  season: string
  type: string
  variant: number
  sections: Record<string, unknown[]>
}

interface SessionMeta {
  id: string
  year: number
  season: string
  type: string
  variant: number
  questionCount: number
}

async function processSlug(pdfSlug: string): Promise<Map<string, Record<string, unknown[]>>> {
  // Parse facit once per slug
  let facit
  try {
    facit = await parseFacit(pdfSlug)
  } catch (e) {
    console.warn(`  Facit saknas för ${pdfSlug}:`, (e as Error).message)
    return new Map()
  }

  const result = new Map<string, Record<string, unknown[]>>()

  // Verbal del 1
  const v1 = await extractVerbal(pdfSlug, 'verb1', facit.verb1)
  result.set('verb1', {
    ORD: v1.get('ORD') ?? [],
    LÄS: v1.get('LÄS') ?? [],
    MEK: [],
    ELF: [],
  })

  // Verbal del 2
  const v2 = await extractVerbal(pdfSlug, 'verb2', facit.verb2)
  result.set('verb2', {
    ORD: [],
    LÄS: v2.get('LÄS') ?? [],
    MEK: v2.get('MEK') ?? [],
    ELF: v2.get('ELF') ?? [],
  })

  // Kvant del 1
  const k1 = await extractQuant(pdfSlug, 'kvant1', facit.kvant1)
  result.set('kvant1', {
    XYZ: k1.get('XYZ') ?? [],
    KVA: k1.get('KVA') ?? [],
    NOG: k1.get('NOG') ?? [],
    DTK: [],
  })

  // Kvant del 2
  const k2 = await extractQuant(pdfSlug, 'kvant2', facit.kvant2)
  result.set('kvant2', {
    XYZ: k2.get('XYZ') ?? [],
    KVA: k2.get('KVA') ?? [],
    NOG: [],
    DTK: k2.get('DTK') ?? [],
  })

  return result
}

function pdfSectionForSession(session: typeof SESSIONS[0]): 'verb1' | 'verb2' | 'kvant1' | 'kvant2' {
  if (session.type === 'verbal') return session.variant === 1 ? 'verb1' : 'verb2'
  return session.variant === 1 ? 'kvant1' : 'kvant2'
}

async function main() {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true })

  const slugCache = new Map<string, Map<string, Record<string, unknown[]>>>()
  const index: SessionMeta[] = []

  for (const session of SESSIONS) {
    process.stdout.write(`Bearbetar ${session.id} ... `)

    // Process slug if not yet cached
    if (!slugCache.has(session.pdfSlug)) {
      slugCache.set(session.pdfSlug, await processSlug(session.pdfSlug))
    }

    const slugData = slugCache.get(session.pdfSlug)!
    const pdfSec = pdfSectionForSession(session)
    const sections = slugData.get(pdfSec) ?? {}

    // Count total questions
    const questionCount = Object.values(sections).reduce((n, qs) => n + (qs as unknown[]).length, 0)

    // Write session JSON
    const sessionJSON: SessionJSON = {
      id: session.id,
      year: session.year,
      season: session.season,
      type: session.type,
      variant: session.variant,
      sections,
    }

    const outPath = path.join(SESSIONS_DIR, `${session.id}.json`)
    fs.writeFileSync(outPath, JSON.stringify(sessionJSON, null, 2), 'utf-8')

    index.push({
      id: session.id,
      year: session.year,
      season: session.season,
      type: session.type,
      variant: session.variant,
      questionCount,
    })

    console.log(`${questionCount} frågor`)
  }

  // Write index
  fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(index, null, 2), 'utf-8')
  console.log(`\nFärdigt! ${index.length} sessioner, index.json uppdaterad.`)
}

main().catch(console.error)
