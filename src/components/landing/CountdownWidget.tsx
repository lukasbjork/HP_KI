import { useState, useEffect } from 'react'
import { Clock, BookOpen } from 'lucide-react'
import { getTodaysWord } from '@/data/dailyWords'

// Next HP date: October 18, 2026 at 08:10 Stockholm time (UTC+2 in October)
const NEXT_HP = new Date('2026-10-18T06:10:00Z')

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(): TimeLeft {
  const diff = NEXT_HP.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-ki-blue rounded-xl flex items-center justify-center shadow-md">
        <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-2 text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
  )
}

export function CountdownWidget() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft)
  const word = getTodaysWord()

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Countdown */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Clock size={20} className="text-ki-blue" />
              <h2 className="text-lg font-semibold text-gray-900">Nästa högskoleprov</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">18 oktober 2026 kl 08:10</p>
            <div className="flex items-center gap-3 sm:gap-4">
              <TimeBox value={timeLeft.days} label="Dagar" />
              <span className="text-2xl font-bold text-gray-300 mb-6">:</span>
              <TimeBox value={timeLeft.hours} label="Timmar" />
              <span className="text-2xl font-bold text-gray-300 mb-6">:</span>
              <TimeBox value={timeLeft.minutes} label="Minuter" />
              <span className="text-2xl font-bold text-gray-300 mb-6">:</span>
              <TimeBox value={timeLeft.seconds} label="Sekunder" />
            </div>
          </div>

          {/* Dagens ord */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={20} className="text-ki-purple" />
              <h2 className="text-lg font-semibold text-gray-900">Dagens ord</h2>
              <span className="ml-auto text-xs font-medium text-ki-purple bg-purple-50 px-2 py-0.5 rounded-full">ORD-träning</span>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-ki-blue tracking-wide">{word.word}</span>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">{word.definition}</p>
            <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-ki-purple">
              <p className="text-sm text-gray-600 italic">"{word.example}"</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
