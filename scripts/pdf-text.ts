/**
 * Plain-text extraction via the SAME pdfjs build used for rendering.
 * Avoids depending on pdf-parse (which bundles a different pdfjs version and
 * collides on the global worker). Reconstructs lines by grouping text items
 * by their y-position and ordering left-to-right.
 */
import fs from 'fs'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createRequire } from 'module'
import { pathToFileURL } from 'url'

const _require = createRequire(import.meta.url)
try {
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(
    _require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs'),
  ).href
} catch { /* optional */ }

interface Item { x: number; y: number; s: string }

function linesFromItems(items: Item[]): string[] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x)
  const out: string[] = []
  let lineY: number | null = null
  let current: Item[] = []
  const flush = () => {
    if (!current.length) return
    current.sort((a, b) => a.x - b.x)
    out.push(current.map(c => c.s).join(' ').replace(/\s+/g, ' ').trim())
    current = []
  }
  for (const it of sorted) {
    if (lineY === null || Math.abs(it.y - lineY) <= 3) {
      current.push(it)
      lineY = lineY === null ? it.y : lineY
    } else {
      flush(); current.push(it); lineY = it.y
    }
  }
  flush()
  return out
}

/**
 * Column-aware text: splits each page into left/right columns at the page
 * midpoint and emits the left column fully, then the right column. Needed for
 * sections laid out in two columns (e.g. ORD), where merging by y would glue
 * "1. basal" and "6. eskapader" onto one line.
 */
export async function getPdfTextColumns(pdfPath: string): Promise<string> {
  if (!fs.existsSync(pdfPath)) return ''
  const data = new Uint8Array(fs.readFileSync(pdfPath))
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true, isEvalSupported: false }).promise

  const allLines: string[] = []
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const vp = page.getViewport({ scale: 1 })
    const mid = vp.width / 2
    const tc = await page.getTextContent()
    const items: Item[] = (tc.items as Array<{ str: string; transform: number[] }>)
      .filter(it => it.str.trim().length > 0)
      .map(it => ({ x: it.transform[4], y: it.transform[5], s: it.str }))

    const left = items.filter(i => i.x < mid)
    const right = items.filter(i => i.x >= mid)
    // Only treat as two columns when the right side actually has content
    if (right.length > 3 && left.length > 3) {
      allLines.push(...linesFromItems(left), ...linesFromItems(right))
    } else {
      allLines.push(...linesFromItems(items))
    }
  }
  return allLines.join('\n')
}

export async function getPdfText(pdfPath: string): Promise<string> {
  if (!fs.existsSync(pdfPath)) return ''
  const data = new Uint8Array(fs.readFileSync(pdfPath))
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true, isEvalSupported: false }).promise

  const allLines: string[] = []
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const tc = await page.getTextContent()
    const items = (tc.items as Array<{ str: string; transform: number[] }>)
      .filter(it => it.str.trim().length > 0)
      .map(it => ({ x: it.transform[4], y: it.transform[5], s: it.str }))
      .sort((a, b) => b.y - a.y || a.x - b.x) // top→bottom, then left→right

    let lineY: number | null = null
    let current: { x: number; s: string }[] = []
    const flush = () => {
      if (current.length === 0) return
      current.sort((a, b) => a.x - b.x)
      allLines.push(current.map(c => c.s).join(' ').replace(/\s+/g, ' ').trim())
      current = []
    }
    for (const it of items) {
      if (lineY === null || Math.abs(it.y - lineY) <= 3) {
        current.push({ x: it.x, s: it.s })
        lineY = lineY === null ? it.y : lineY
      } else {
        flush()
        current.push({ x: it.x, s: it.s })
        lineY = it.y
      }
    }
    flush()
  }
  return allLines.join('\n')
}
