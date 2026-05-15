# HP_KI — Studieportal för Högskoleprovet

Studieverktyg för Högskoleprovet med fokus på KI läkarprogrammets antagningskrav (stanine ≥ 2.0).

## Funktioner

- **Provläge** — 55-minuters nedräkningstimer, flaggning, frågenavigator, pause/fortsätt
- **Övningsläge** — SRS-viktat urval (svåra frågor prioriteras), direktfeedback per fråga
- **Statistik** — stanine-estimat, träffsäkerhet per delområde, poängutveckling över tid
- **Flashcards** — SM-2 spaced repetition för ORD-sektionen
- **Provbibliotek** — Höst 2013–Vår 2026, filtrera på år/säsong/typ/status
- **Mobilanpassad** — bottom-nav på mobil, desktop sidebar

## Tangentbordsgenvägar (Provläge & Övningsläge)

| Tangent | Funktion |
|---------|----------|
| `1`–`5` | Välj svarsalternativ A–E |
| `Enter` / `Space` | Nästa fråga (efter svar visats) |
| `→` | Nästa fråga / nästa del |
| `←` | Föregående fråga (Provläge) |

## Kom igång lokalt

```bash
npm install
npm run dev
```

## Fyll på med riktiga frågor (datapipeline)

Datapipelinen körs lokalt och kräver internet. Genererade JSON-filer committas till repot.

```bash
npm run download-pdfs   # laddar ner PDFs från hogskoleprovet.nu → scripts/pdfs/
npm run generate-data   # extraherar frågor → public/data/sessions/*.json
```

> Kvantitativa sektioner (XYZ/KVA/NOG/DTK) är bildbaserade — extract-quant.ts skapar platshållare.
> Verbala sektioner (ORD/LÄS/MEK) extraheras som text med pdf-parse.
> ELF togs bort från HP ~2010 och saknas i 2013–2026-sessionerna.

## Deploy

Projektet är konfigurerat för Netlify via `netlify.toml`.

```
Build command:  npm run build
Publish dir:    dist
```

Koppla GitHub-repot `lukasbjork/HP_KI` till Netlify (main-branch), eller dra-och-släpp `dist/`-mappen på netlify.com/drop.

## Projektstruktur

```
src/pages/       Dashboard, Library, Exam, Drill, Statistics, Flashcards, Settings
src/stores/      Zustand stores: progressStore (SM-2 + localStorage), examStore, settingsStore
src/utils/       scoring.ts, spaced-repetition.ts, useSessionData.ts
src/components/  layout/ (AppShell, Sidebar, BottomNav), ui/ (SectionBadge, ProgressBar, …)
scripts/         Datapipeline — download-pdfs, extract-verbal, extract-quant, generate-data
public/data/     index.json (116 sessionmetadataposter) + sessions/*.json (lazy-loaded)
```

## Stack

React 19 · Vite 6 · TypeScript 5 · Tailwind CSS 4 · Zustand 5 · React Router 7 · Framer Motion · Recharts · Lucide React
