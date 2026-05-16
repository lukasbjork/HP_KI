import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, ChevronRight } from 'lucide-react'

const ROTATING_WORDS = ['läkare', 'jurist', 'ekonom', 'psykolog', 'arkitekt', 'tandläkare']

export function HeroSection() {
  const navigate = useNavigate()
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setWordIndex(i => (i + 1) % ROTATING_WORDS.length), 2500)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-ki-blue via-ki-blue to-ki-blue-dark">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-ki-gold blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-3 py-1.5 rounded-full mb-6 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-ki-gold animate-pulse" />
              Nästa prov: 18 oktober 2026
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              Besegra<br />
              <span className="text-ki-gold">Högskoleprovet</span>
            </h1>

            <p className="text-lg text-blue-100 mb-4 leading-relaxed">
              Träna smarter med AI-drivna övningar anpassade efter dig.
            </p>

            <div className="flex items-center gap-2 text-blue-200 text-base mb-8 h-8">
              <span>Bli</span>
              <span className="relative w-28 inline-block">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="absolute left-0 font-bold text-ki-gold"
                  >
                    {ROTATING_WORDS[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </div>

            <div className="flex flex-wrap gap-3 mb-10">
              <button
                onClick={() => navigate('/drill')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-ki-gold hover:bg-ki-gold-dark text-ki-blue font-semibold rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                Börja träna
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/library')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/25 transition-all"
              >
                <BookOpen size={16} />
                Se provbiblioteket
              </button>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6">
              {[
                { label: 'Delmoment', value: '8' },
                { label: 'Frågor per prov', value: '160' },
                { label: 'Provår tillgängliga', value: '13+' },
                { label: 'SM-2 algoritm', value: '✓' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-2">
                  <span className="text-xl font-bold text-ki-gold">{stat.value}</span>
                  <span className="text-sm text-blue-200">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — decorative score card */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-white font-semibold">Din framgång</span>
                  <span className="text-xs text-blue-300 bg-white/10 px-2 py-1 rounded-full">Live</span>
                </div>
                <div className="space-y-4">
                  {[
                    { section: 'ORD', score: 87, color: 'bg-violet-400' },
                    { section: 'LÄS', score: 74, color: 'bg-blue-400' },
                    { section: 'XYZ', score: 91, color: 'bg-emerald-400' },
                    { section: 'KVA', score: 65, color: 'bg-amber-400' },
                    { section: 'DTK', score: 79, color: 'bg-green-400' },
                  ].map(({ section, score, color }) => (
                    <div key={section}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-white font-medium">{section}</span>
                        <span className="text-blue-200">{score}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-white">1.8</div>
                    <div className="text-xs text-blue-300">Stanine</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-ki-gold flex items-center gap-1">
                      Nära KI-gränsen <ChevronRight size={14} />
                    </div>
                    <div className="text-xs text-blue-300">Mål: 2.0</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
