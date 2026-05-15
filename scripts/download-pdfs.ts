/**
 * Downloads all HP PDFs from hogskoleprovet.nu into scripts/pdfs/
 * Run: npm run download-pdfs
 */
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { SESSIONS, getPdfUrl } from './sessions.js'

const PDF_DIR = path.resolve('scripts/pdfs')
const PDF_SECTIONS = ['verb1', 'verb2', 'kvant1', 'kvant2', 'facit'] as const
const DELAY_MS = 800

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function downloadFile(url: string, dest: string): Promise<boolean> {
  if (fs.existsSync(dest)) return true  // already downloaded
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 })
    fs.writeFileSync(dest, Buffer.from(res.data))
    return true
  } catch {
    return false
  }
}

async function main() {
  fs.mkdirSync(PDF_DIR, { recursive: true })

  const slugsSeen = new Set<string>()
  let downloaded = 0
  let skipped = 0
  let failed = 0

  for (const session of SESSIONS) {
    if (slugsSeen.has(session.pdfSlug)) continue
    slugsSeen.add(session.pdfSlug)

    const dir = path.join(PDF_DIR, session.pdfSlug)
    fs.mkdirSync(dir, { recursive: true })

    for (const section of PDF_SECTIONS) {
      const url = getPdfUrl(session.pdfSlug, section)
      const dest = path.join(dir, `${section}.pdf`)

      if (fs.existsSync(dest)) {
        skipped++
        continue
      }

      process.stdout.write(`  Hämtar ${session.pdfSlug}/${section}.pdf ... `)
      const ok = await downloadFile(url, dest)
      if (ok) {
        console.log('OK')
        downloaded++
      } else {
        console.log('MISSLYCKADES')
        failed++
      }
      await sleep(DELAY_MS)
    }
  }

  console.log(`\nKlart! Hämtade: ${downloaded}, Redan finns: ${skipped}, Misslyckades: ${failed}`)
}

main().catch(console.error)
