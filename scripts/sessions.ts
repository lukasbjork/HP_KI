// All 35 HP test sessions, matching hogskoleprovet.nu URL structure

export interface SessionDef {
  id: string
  year: number
  season: 'vår' | 'höst'
  type: 'verbal' | 'kvantitativ'
  variant: 1 | 2
  pdfSlug: string  // Used in URL: /hogskoleprov/{pdfSlug}/{section}.pdf
}

const BASE_URL = 'https://www.hogskoleprovet.nu/public/uploads/hogskoleprovet/hogskoleprov'

export const SESSIONS: SessionDef[] = [
  // 2026
  { id: 'hp-v2026-verb1',  year: 2026, season: 'vår',  type: 'verbal',        variant: 1, pdfSlug: 'var-2026' },
  { id: 'hp-v2026-verb2',  year: 2026, season: 'vår',  type: 'verbal',        variant: 2, pdfSlug: 'var-2026' },
  { id: 'hp-v2026-kvant1', year: 2026, season: 'vår',  type: 'kvantitativ',   variant: 1, pdfSlug: 'var-2026' },
  { id: 'hp-v2026-kvant2', year: 2026, season: 'vår',  type: 'kvantitativ',   variant: 2, pdfSlug: 'var-2026' },
  // 2025
  { id: 'hp-h2025-verb1',  year: 2025, season: 'höst', type: 'verbal',        variant: 1, pdfSlug: 'host-2025' },
  { id: 'hp-h2025-verb2',  year: 2025, season: 'höst', type: 'verbal',        variant: 2, pdfSlug: 'host-2025' },
  { id: 'hp-h2025-kvant1', year: 2025, season: 'höst', type: 'kvantitativ',   variant: 1, pdfSlug: 'host-2025' },
  { id: 'hp-h2025-kvant2', year: 2025, season: 'höst', type: 'kvantitativ',   variant: 2, pdfSlug: 'host-2025' },
  { id: 'hp-v2025-verb1',  year: 2025, season: 'vår',  type: 'verbal',        variant: 1, pdfSlug: 'var-2025' },
  { id: 'hp-v2025-verb2',  year: 2025, season: 'vår',  type: 'verbal',        variant: 2, pdfSlug: 'var-2025' },
  { id: 'hp-v2025-kvant1', year: 2025, season: 'vår',  type: 'kvantitativ',   variant: 1, pdfSlug: 'var-2025' },
  { id: 'hp-v2025-kvant2', year: 2025, season: 'vår',  type: 'kvantitativ',   variant: 2, pdfSlug: 'var-2025' },
  // 2024
  { id: 'hp-h2024-verb1',  year: 2024, season: 'höst', type: 'verbal',        variant: 1, pdfSlug: 'host-2024' },
  { id: 'hp-h2024-verb2',  year: 2024, season: 'höst', type: 'verbal',        variant: 2, pdfSlug: 'host-2024' },
  { id: 'hp-h2024-kvant1', year: 2024, season: 'höst', type: 'kvantitativ',   variant: 1, pdfSlug: 'host-2024' },
  { id: 'hp-h2024-kvant2', year: 2024, season: 'höst', type: 'kvantitativ',   variant: 2, pdfSlug: 'host-2024' },
  { id: 'hp-v2024-verb1',  year: 2024, season: 'vår',  type: 'verbal',        variant: 1, pdfSlug: 'var-2024' },
  { id: 'hp-v2024-verb2',  year: 2024, season: 'vår',  type: 'verbal',        variant: 2, pdfSlug: 'var-2024' },
  { id: 'hp-v2024-kvant1', year: 2024, season: 'vår',  type: 'kvantitativ',   variant: 1, pdfSlug: 'var-2024' },
  { id: 'hp-v2024-kvant2', year: 2024, season: 'vår',  type: 'kvantitativ',   variant: 2, pdfSlug: 'var-2024' },
  // 2023
  { id: 'hp-h2023-verb1',  year: 2023, season: 'höst', type: 'verbal',        variant: 1, pdfSlug: 'host-2023' },
  { id: 'hp-h2023-verb2',  year: 2023, season: 'höst', type: 'verbal',        variant: 2, pdfSlug: 'host-2023' },
  { id: 'hp-h2023-kvant1', year: 2023, season: 'höst', type: 'kvantitativ',   variant: 1, pdfSlug: 'host-2023' },
  { id: 'hp-h2023-kvant2', year: 2023, season: 'höst', type: 'kvantitativ',   variant: 2, pdfSlug: 'host-2023' },
  { id: 'hp-v2023-verb1',  year: 2023, season: 'vår',  type: 'verbal',        variant: 1, pdfSlug: 'var-2023' },
  { id: 'hp-v2023-verb2',  year: 2023, season: 'vår',  type: 'verbal',        variant: 2, pdfSlug: 'var-2023' },
  { id: 'hp-v2023-kvant1', year: 2023, season: 'vår',  type: 'kvantitativ',   variant: 1, pdfSlug: 'var-2023' },
  { id: 'hp-v2023-kvant2', year: 2023, season: 'vår',  type: 'kvantitativ',   variant: 2, pdfSlug: 'var-2023' },
  // 2022
  { id: 'hp-h2022-verb1',  year: 2022, season: 'höst', type: 'verbal',        variant: 1, pdfSlug: 'host-2022' },
  { id: 'hp-h2022-verb2',  year: 2022, season: 'höst', type: 'verbal',        variant: 2, pdfSlug: 'host-2022' },
  { id: 'hp-h2022-kvant1', year: 2022, season: 'höst', type: 'kvantitativ',   variant: 1, pdfSlug: 'host-2022' },
  { id: 'hp-h2022-kvant2', year: 2022, season: 'höst', type: 'kvantitativ',   variant: 2, pdfSlug: 'host-2022' },
  { id: 'hp-v2022-verb1',  year: 2022, season: 'vår',  type: 'verbal',        variant: 1, pdfSlug: 'var-2022' },
  { id: 'hp-v2022-verb2',  year: 2022, season: 'vår',  type: 'verbal',        variant: 2, pdfSlug: 'var-2022' },
  { id: 'hp-v2022-kvant1', year: 2022, season: 'vår',  type: 'kvantitativ',   variant: 1, pdfSlug: 'var-2022' },
  { id: 'hp-v2022-kvant2', year: 2022, season: 'vår',  type: 'kvantitativ',   variant: 2, pdfSlug: 'var-2022' },
  // 2021
  { id: 'hp-h2021-verb1',  year: 2021, season: 'höst', type: 'verbal',        variant: 1, pdfSlug: 'host-2021' },
  { id: 'hp-h2021-verb2',  year: 2021, season: 'höst', type: 'verbal',        variant: 2, pdfSlug: 'host-2021' },
  { id: 'hp-h2021-kvant1', year: 2021, season: 'höst', type: 'kvantitativ',   variant: 1, pdfSlug: 'host-2021' },
  { id: 'hp-h2021-kvant2', year: 2021, season: 'höst', type: 'kvantitativ',   variant: 2, pdfSlug: 'host-2021' },
  { id: 'hp-v2021-verb1',  year: 2021, season: 'vår',  type: 'verbal',        variant: 1, pdfSlug: 'var-2021' },
  { id: 'hp-v2021-verb2',  year: 2021, season: 'vår',  type: 'verbal',        variant: 2, pdfSlug: 'var-2021' },
  { id: 'hp-v2021-kvant1', year: 2021, season: 'vår',  type: 'kvantitativ',   variant: 1, pdfSlug: 'var-2021' },
  { id: 'hp-v2021-kvant2', year: 2021, season: 'vår',  type: 'kvantitativ',   variant: 2, pdfSlug: 'var-2021' },
  // 2020
  { id: 'hp-h2020-verb1',  year: 2020, season: 'höst', type: 'verbal',        variant: 1, pdfSlug: 'host-2020' },
  { id: 'hp-h2020-verb2',  year: 2020, season: 'höst', type: 'verbal',        variant: 2, pdfSlug: 'host-2020' },
  { id: 'hp-h2020-kvant1', year: 2020, season: 'höst', type: 'kvantitativ',   variant: 1, pdfSlug: 'host-2020' },
  { id: 'hp-h2020-kvant2', year: 2020, season: 'höst', type: 'kvantitativ',   variant: 2, pdfSlug: 'host-2020' },
  { id: 'hp-v2020-verb1',  year: 2020, season: 'vår',  type: 'verbal',        variant: 1, pdfSlug: 'var-2020' },
  { id: 'hp-v2020-verb2',  year: 2020, season: 'vår',  type: 'verbal',        variant: 2, pdfSlug: 'var-2020' },
  { id: 'hp-v2020-kvant1', year: 2020, season: 'vår',  type: 'kvantitativ',   variant: 1, pdfSlug: 'var-2020' },
  { id: 'hp-v2020-kvant2', year: 2020, season: 'vår',  type: 'kvantitativ',   variant: 2, pdfSlug: 'var-2020' },
  // 2019 (two versions of höst)
  { id: 'hp-h2019a-verb1',  year: 2019, season: 'höst', type: 'verbal',       variant: 1, pdfSlug: 'host-ver1-2019' },
  { id: 'hp-h2019a-verb2',  year: 2019, season: 'höst', type: 'verbal',       variant: 2, pdfSlug: 'host-ver1-2019' },
  { id: 'hp-h2019a-kvant1', year: 2019, season: 'höst', type: 'kvantitativ',  variant: 1, pdfSlug: 'host-ver1-2019' },
  { id: 'hp-h2019a-kvant2', year: 2019, season: 'höst', type: 'kvantitativ',  variant: 2, pdfSlug: 'host-ver1-2019' },
  { id: 'hp-h2019b-verb1',  year: 2019, season: 'höst', type: 'verbal',       variant: 1, pdfSlug: 'host-ver2-2019' },
  { id: 'hp-h2019b-verb2',  year: 2019, season: 'höst', type: 'verbal',       variant: 2, pdfSlug: 'host-ver2-2019' },
  { id: 'hp-h2019b-kvant1', year: 2019, season: 'höst', type: 'kvantitativ',  variant: 1, pdfSlug: 'host-ver2-2019' },
  { id: 'hp-h2019b-kvant2', year: 2019, season: 'höst', type: 'kvantitativ',  variant: 2, pdfSlug: 'host-ver2-2019' },
  { id: 'hp-v2019-verb1',  year: 2019, season: 'vår',  type: 'verbal',        variant: 1, pdfSlug: 'var-2019' },
  { id: 'hp-v2019-verb2',  year: 2019, season: 'vår',  type: 'verbal',        variant: 2, pdfSlug: 'var-2019' },
  { id: 'hp-v2019-kvant1', year: 2019, season: 'vår',  type: 'kvantitativ',   variant: 1, pdfSlug: 'var-2019' },
  { id: 'hp-v2019-kvant2', year: 2019, season: 'vår',  type: 'kvantitativ',   variant: 2, pdfSlug: 'var-2019' },
  // 2018–2013 (shorter form for brevity)
  ...(['2018','2017','2016','2015','2014','2013'] as const).flatMap(y => [
    { id: `hp-h${y}-verb1`,  year: +y, season: 'höst' as const, type: 'verbal' as const,       variant: 1 as const, pdfSlug: `host-${y}` },
    { id: `hp-h${y}-verb2`,  year: +y, season: 'höst' as const, type: 'verbal' as const,       variant: 2 as const, pdfSlug: `host-${y}` },
    { id: `hp-h${y}-kvant1`, year: +y, season: 'höst' as const, type: 'kvantitativ' as const,  variant: 1 as const, pdfSlug: `host-${y}` },
    { id: `hp-h${y}-kvant2`, year: +y, season: 'höst' as const, type: 'kvantitativ' as const,  variant: 2 as const, pdfSlug: `host-${y}` },
    { id: `hp-v${y}-verb1`,  year: +y, season: 'vår' as const,  type: 'verbal' as const,       variant: 1 as const, pdfSlug: `var-${y}` },
    { id: `hp-v${y}-verb2`,  year: +y, season: 'vår' as const,  type: 'verbal' as const,       variant: 2 as const, pdfSlug: `var-${y}` },
    { id: `hp-v${y}-kvant1`, year: +y, season: 'vår' as const,  type: 'kvantitativ' as const,  variant: 1 as const, pdfSlug: `var-${y}` },
    { id: `hp-v${y}-kvant2`, year: +y, season: 'vår' as const,  type: 'kvantitativ' as const,  variant: 2 as const, pdfSlug: `var-${y}` },
  ]),
]

export function getPdfUrl(pdfSlug: string, section: 'verb1' | 'verb2' | 'kvant1' | 'kvant2' | 'facit') {
  return `${BASE_URL}/${pdfSlug}/${section}.pdf`
}
