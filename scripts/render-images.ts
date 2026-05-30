/**
 * Renders per-question images from a quantitative (or verbal-fallback) PDF.
 *
 * Quantitative HP questions contain math notation and diagrams that cannot be
 * extracted reliably as text, so we render the PDF and crop a band per question.
 * Handles single- and two-column layouts by clustering question-number markers
 * by x-position.
 *
 * Output: public/data/images/{slug}/{pdfSection}/{n}.png
 * Returns: Map<questionNumber, publicPath>
 */
import fs from 'fs'
import path from 'path'
import * as napi from '@napi-rs/canvas'
const { createCanvas } = napi

// pdfjs renders into a browser-like canvas; provide the globals it expects in Node
const g = globalThis as Record<string, unknown>
g.Path2D ??= napi.Path2D
g.DOMMatrix ??= napi.DOMMatrix
g.ImageData ??= napi.ImageData
if (napi.Image) g.Image ??= napi.Image

// pdfjs legacy build works in Node without a browser worker
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createRequire } from 'module'
import { pathToFileURL } from 'url'

// Pin the worker to our own pdfjs build (file:// URL required on Windows)
const _require = createRequire(import.meta.url)
try {
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(
    _require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs'),
  ).href
} catch { /* worker path optional */ }

const SCALE = 2.0 // ~144 DPI
const PUBLIC_IMG_ROOT = path.resolve('public/data/images')

interface Marker {
  num: number
  x: number      // PDF points, origin bottom-left
  yTop: number   // PDF points, top of the marker text
}

/** Minimal canvas factory pdfjs uses for intermediate buffers in Node. */
class NodeCanvasFactory {
  create(width: number, height: number) {
    const canvas = createCanvas(Math.ceil(width), Math.ceil(height))
    return { canvas, context: canvas.getContext('2d') }
  }
  reset(cc: { canvas: { width: number; height: number } }, width: number, height: number) {
    cc.canvas.width = Math.ceil(width)
    cc.canvas.height = Math.ceil(height)
  }
  destroy(cc: { canvas: { width: number; height: number } }) {
    cc.canvas.width = 0
    cc.canvas.height = 0
  }
}

function isQuestionMarker(str: string): number | null {
  // Question markers are "N." (number followed by a period), e.g. "1." "12."
  // Plain numbers without a period are answer values/options, not markers.
  const m = str.trim().match(/^(\d{1,2})\.(\s|$)/)
  if (!m) return null
  const n = parseInt(m[1])
  return n >= 1 && n <= 40 ? n : null
}

export async function renderQuestionImages(
  pdfSlug: string,
  pdfSection: 'kvant1' | 'kvant2' | 'verb1' | 'verb2',
  /** Questions whose answer depends on a shared figure (e.g. DTK) get the full
   *  page rendered instead of a vertical band, so charts/tables are included. */
  fullPageForNum: (n: number) => boolean = () => false,
): Promise<Map<number, string>> {
  const pdfPath = path.resolve('scripts/pdfs', pdfSlug, `${pdfSection}.pdf`)
  const result = new Map<number, string>()
  if (!fs.existsSync(pdfPath)) {
    console.warn(`  PDF saknas för rendering: ${pdfPath}`)
    return result
  }

  const outDir = path.join(PUBLIC_IMG_ROOT, pdfSlug, pdfSection)
  fs.mkdirSync(outDir, { recursive: true })

  const data = new Uint8Array(fs.readFileSync(pdfPath))
  const canvasFactory = new NodeCanvasFactory()
  const doc = await pdfjs.getDocument({
    data,
    canvasFactory,
    useSystemFonts: true,
    isEvalSupported: false,
  }).promise

  const captured = new Set<number>()
  let seenFirstMarker = false
  // A "figure page" (chart/table/map for DTK) has no question markers but holds
  // shared material referenced by following questions. We keep the most recent
  // one so DTK questions can be stitched together with their figure.
  let lastFigureCanvas: ReturnType<typeof createCanvas> | null = null

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum)
    const viewport = page.getViewport({ scale: SCALE })
    const pageWidthPts = viewport.width / SCALE
    const pageHeightPts = viewport.height / SCALE

    // Collect candidate question-number markers (number + period) first
    const textContent = await page.getTextContent()
    const candidates: Marker[] = []
    for (const item of textContent.items as Array<{ str: string; transform: number[]; height: number }>) {
      const num = isQuestionMarker(item.str)
      if (num === null) continue
      const x = item.transform[4]
      const yBaseline = item.transform[5]
      const h = item.height || 11
      candidates.push({ num, x, yTop: yBaseline + h })
    }

    // Render the full page to a canvas
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    // @ts-expect-error napi-rs context is compatible with pdfjs render target
    await page.render({ canvasContext: ctx, viewport, canvasFactory }).promise

    if (candidates.length === 0) {
      // Pages before the first question (cover/instructions) are not figures.
      // Once questions have started, a marker-less page is a shared figure page.
      if (seenFirstMarker) lastFigureCanvas = canvas
      continue
    }
    seenFirstMarker = true

    // Markers sit at the column's left margin. Find the left edge (min x).
    const leftEdge = Math.min(...candidates.map(c => c.x))
    const mid = pageWidthPts / 2

    // Two-column only when there is STRONG evidence: ≥3 markers clearly in the
    // right half. HP quant papers here are single-column (2 questions/page), so
    // a stray period-number past the middle must not cap the question width.
    const rightMarkers = candidates.filter(c => c.x > mid + 20 && c.x < pageWidthPts * 0.62)
    const twoCol = rightMarkers.length >= 3
    const columns: { x0: number; x1: number }[] = twoCol
      ? [{ x0: leftEdge - 6, x1: mid }, { x0: Math.min(...rightMarkers.map(c => c.x)) - 6, x1: pageWidthPts }]
      : [{ x0: leftEdge - 6, x1: pageWidthPts }]

    for (const col of columns) {
      const colMarkers = candidates
        .filter(m => m.x >= col.x0 && m.x < (twoCol ? col.x1 : leftEdge + 20))
        .sort((a, b) => b.yTop - a.yTop) // top → bottom (PDF y descends)

      for (let i = 0; i < colMarkers.length; i++) {
        const m = colMarkers[i]
        if (captured.has(m.num)) continue

        // Vertical band for this question
        const topPts = m.yTop + 6 // headroom above the number
        const bottomPts = i + 1 < colMarkers.length
          ? colMarkers[i + 1].yTop + 6
          : 36 // bottom margin → capture figures below the last question on the page
        const colRight = twoCol ? col.x1 : pageWidthPts
        const sx = Math.max(0, Math.floor(col.x0 * SCALE) - 6)
        const sw = Math.min(canvas.width - sx, Math.ceil((colRight - col.x0) * SCALE) + 12)
        const sy = Math.max(0, Math.floor((pageHeightPts - topPts) * SCALE))
        const sh = Math.min(canvas.height - sy, Math.ceil((topPts - bottomPts) * SCALE))
        if (sh < 30 || sw < 30) continue

        // DTK questions reference a shared figure on a preceding page → stitch
        // that figure above the question band so the question is answerable.
        const fig = fullPageForNum(m.num) ? lastFigureCanvas : null

        let crop: ReturnType<typeof createCanvas>
        if (fig) {
          const figW = fig.width, figH = fig.height
          const outW = Math.max(figW, sw)
          const gap = 16
          crop = createCanvas(outW, figH + gap + sh)
          const cctx = crop.getContext('2d')
          cctx.fillStyle = '#ffffff'
          cctx.fillRect(0, 0, crop.width, crop.height)
          cctx.drawImage(fig, 0, 0)                                   // figure on top
          cctx.drawImage(canvas, sx, sy, sw, sh, 0, figH + gap, sw, sh) // question below
        } else {
          crop = createCanvas(sw, sh)
          const cctx = crop.getContext('2d')
          cctx.fillStyle = '#ffffff'
          cctx.fillRect(0, 0, sw, sh)
          cctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh)
        }

        const outPath = path.join(outDir, `${m.num}.png`)
        fs.writeFileSync(outPath, crop.toBuffer('image/png'))
        result.set(m.num, `/data/images/${pdfSlug}/${pdfSection}/${m.num}.png`)
        captured.add(m.num)
      }
    }
  }

  return result
}

// Allow running standalone for validation: tsx scripts/render-images.ts <slug> <section>
const isMain = process.argv[1] && process.argv[1].endsWith('render-images.ts')
if (isMain) {
  const slug = process.argv[2] ?? 'var-2025'
  const section = (process.argv[3] ?? 'kvant1') as 'kvant1' | 'kvant2' | 'verb1' | 'verb2'
  // DTK = questions 29–40 in each quant pass → full-page render
  renderQuestionImages(slug, section, n => n >= 29 && n <= 40)
    .then(map => {
      console.log(`Renderade ${map.size} bilder för ${slug}/${section}:`)
      for (const [num, p] of [...map.entries()].sort((a, b) => a[0] - b[0])) {
        console.log(`  Q${num} → ${p}`)
      }
    })
    .catch(console.error)
}
