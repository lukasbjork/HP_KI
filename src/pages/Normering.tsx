import { useState, useMemo } from 'react'
import { Calculator, Target, Info } from 'lucide-react'
import { accuracyToStanine, STANINE_TABLE, KI_CUTOFFS } from '@/utils/scoring'
import type { Section } from '@/types'

const SECTION_MAX: Record<Section, number> = {
  ORD: 20, LÄS: 20, MEK: 20, ELF: 20,
  XYZ: 20, KVA: 20, NOG: 20, DTK: 20,
}

const ALL_SECTIONS: Section[] = ['ORD', 'LÄS', 'MEK', 'ELF', 'XYZ', 'KVA', 'NOG', 'DTK']

const SECTION_LABELS: Record<Section, string> = {
  ORD: 'Ordförståelse',
  LÄS: 'Läsförståelse',
  MEK: 'Meningskomplettering',
  ELF: 'Engelsk läsförståelse',
  XYZ: 'Matematisk problemlösning',
  KVA: 'Kvantitativa jämförelser',
  NOG: 'Kvantitativa resonemang',
  DTK: 'Diagram, tabeller & kartor',
}

const STANINE_LABELS: Record<number, string> = {
  1: 'Mycket låg', 2: 'Låg', 3: 'Under medel', 4: 'Lite under medel',
  5: 'Medel', 6: 'Lite över medel', 7: 'Bra', 8: 'Mycket bra', 9: 'Utmärkt',
}

function stanineColor(s: number): string {
  if (s >= 8) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
  if (s >= 6) return 'text-blue-600 bg-blue-50 border-blue-200'
  if (s >= 4) return 'text-amber-600 bg-amber-50 border-amber-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

export default function Normering() {
  const [inputs, setInputs] = useState<Record<Section, string>>(
    Object.fromEntries(ALL_SECTIONS.map(s => [s, ''])) as Record<Section, string>
  )

  const result = useMemo(() => {
    let totalCorrect = 0
    let totalMax = 0
    const sectionResults: { section: Section; correct: number; max: number; acc: number; stanine: number }[] = []

    for (const sec of ALL_SECTIONS) {
      const raw = inputs[sec]
      if (raw === '' || raw === undefined) continue
      const val = Math.min(parseInt(raw) || 0, SECTION_MAX[sec])
      const max = SECTION_MAX[sec]
      const acc = val / max
      sectionResults.push({ section: sec, correct: val, max, acc, stanine: accuracyToStanine(acc) })
      totalCorrect += val
      totalMax += max
    }

    if (sectionResults.length === 0) return null

    const overallAcc = totalCorrect / totalMax
    const overallStanine = accuracyToStanine(overallAcc)

    return { sectionResults, totalCorrect, totalMax, overallAcc, overallStanine }
  }, [inputs])

  function setInput(section: Section, value: string) {
    const max = SECTION_MAX[section]
    const num = parseInt(value)
    if (value === '' || value === undefined) {
      setInputs(prev => ({ ...prev, [section]: '' }))
      return
    }
    if (!isNaN(num)) {
      setInputs(prev => ({ ...prev, [section]: String(Math.min(Math.max(0, num), max)) }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Calculator size={28} className="text-ki-blue" />
          <h1 className="text-3xl font-bold text-gray-900">Normeringskalkylator</h1>
        </div>
        <p className="text-gray-600 max-w-2xl">
          Ange antalet rätta svar för varje delmoment för att se ett uppskattat stanine-resultat.
          Resultatet är en approximation baserad på historiska normeringsgränser.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input form */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
              <div className="grid grid-cols-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-2">Delmoment</div>
                <div className="text-center">Rätt</div>
                <div className="text-center">Max</div>
              </div>
            </div>

            {/* Verbal section */}
            <div className="px-4 py-2 bg-violet-50/50 border-b border-violet-100">
              <span className="text-xs font-semibold text-violet-600 uppercase tracking-wider">Verbalt pass</span>
            </div>
            {ALL_SECTIONS.slice(0, 4).map(sec => (
              <div key={sec} className="grid grid-cols-4 items-center px-5 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <div className="col-span-2">
                  <div className="text-sm font-semibold text-gray-900">{sec}</div>
                  <div className="text-xs text-gray-400">{SECTION_LABELS[sec]}</div>
                </div>
                <div className="flex justify-center">
                  <input
                    type="number"
                    min="0"
                    max={SECTION_MAX[sec]}
                    value={inputs[sec]}
                    onChange={e => setInput(sec, e.target.value)}
                    placeholder="—"
                    className="w-14 text-center text-sm font-semibold border border-gray-200 rounded-lg py-1.5 focus:outline-none focus:border-ki-blue focus:ring-1 focus:ring-ki-blue"
                  />
                </div>
                <div className="text-center text-sm text-gray-400 font-medium">{SECTION_MAX[sec]}</div>
              </div>
            ))}

            {/* Quant section */}
            <div className="px-4 py-2 bg-green-50/50 border-b border-green-100">
              <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Kvantitativt pass</span>
            </div>
            {ALL_SECTIONS.slice(4).map(sec => (
              <div key={sec} className="grid grid-cols-4 items-center px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="col-span-2">
                  <div className="text-sm font-semibold text-gray-900">{sec}</div>
                  <div className="text-xs text-gray-400">{SECTION_LABELS[sec]}</div>
                </div>
                <div className="flex justify-center">
                  <input
                    type="number"
                    min="0"
                    max={SECTION_MAX[sec]}
                    value={inputs[sec]}
                    onChange={e => setInput(sec, e.target.value)}
                    placeholder="—"
                    className="w-14 text-center text-sm font-semibold border border-gray-200 rounded-lg py-1.5 focus:outline-none focus:border-ki-blue focus:ring-1 focus:ring-ki-blue"
                  />
                </div>
                <div className="text-center text-sm text-gray-400 font-medium">{SECTION_MAX[sec]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Result panel */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {/* Overall stanine */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Uppskattat stanine</div>
                <div className={`text-6xl font-bold mb-1 ${result.overallStanine >= 7 ? 'text-emerald-600' : result.overallStanine >= 5 ? 'text-amber-500' : 'text-gray-700'}`}>
                  {result.overallStanine}
                </div>
                <div className="text-sm text-gray-500 mb-4">av 9</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${stanineColor(result.overallStanine)}`}>
                  {STANINE_LABELS[result.overallStanine]}
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  {result.totalCorrect} / {result.totalMax} rätt ({Math.round(result.overallAcc * 100)}%)
                </div>

                {/* Stanine bar */}
                <div className="mt-5">
                  <div className="flex gap-1">
                    {STANINE_TABLE.map(row => (
                      <div
                        key={row.stanine}
                        className={`flex-1 h-4 rounded-sm transition-colors ${
                          row.stanine <= result.overallStanine
                            ? row.stanine >= 7 ? 'bg-emerald-500' : row.stanine >= 5 ? 'bg-amber-400' : 'bg-red-400'
                            : 'bg-gray-100'
                        }`}
                        title={`Stanine ${row.stanine}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1</span>
                    <span>5</span>
                    <span>9</span>
                  </div>
                </div>
              </div>

              {/* Section breakdown */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="text-sm font-semibold text-gray-700 mb-3">Per delmoment</div>
                <div className="space-y-2">
                  {result.sectionResults.map(r => (
                    <div key={r.section} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 w-8">{r.section}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${r.acc >= 0.8 ? 'bg-emerald-400' : r.acc >= 0.5 ? 'bg-amber-400' : 'bg-red-400'}`}
                          style={{ width: `${r.acc * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-12 text-right">{r.correct}/{r.max}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* KI comparison */}
              <div className="bg-ki-blue/5 rounded-2xl border border-ki-blue/20 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={16} className="text-ki-blue" />
                  <span className="text-sm font-semibold text-ki-blue">KI-gränser (historiska)</span>
                </div>
                <div className="space-y-1.5">
                  {KI_CUTOFFS.slice(0, 4).map(c => (
                    <div key={`${c.year}-${c.season}`} className="flex justify-between text-xs">
                      <span className="text-gray-600">{c.year} {c.season}</span>
                      <span className="font-bold text-ki-blue">Stanine {c.stanine}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
              <Calculator size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Fyll i antal rätta svar för att se ditt stanine-resultat.</p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Resultatet är en approximation baserad på historiska normeringsgränser och kan avvika från det faktiska resultatet.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
