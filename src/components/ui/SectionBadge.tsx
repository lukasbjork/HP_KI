import type { Section } from '@/types'

const COLORS: Record<string, string> = {
  ORD: 'bg-violet-100 text-violet-700',
  LÄS: 'bg-blue-100 text-blue-700',
  MEK: 'bg-indigo-100 text-indigo-700',
  ELF: 'bg-cyan-100 text-cyan-700',
  XYZ: 'bg-orange-100 text-orange-700',
  KVA: 'bg-amber-100 text-amber-700',
  NOG: 'bg-red-100 text-red-700',
  DTK: 'bg-green-100 text-green-700',
}

interface SectionBadgeProps {
  section: Section | string
  size?: 'sm' | 'md'
}

export function SectionBadge({ section, size = 'sm' }: SectionBadgeProps) {
  const cls = COLORS[section] ?? 'bg-gray-100 text-gray-600'
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md ${cls} ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
      }`}
    >
      {section}
    </span>
  )
}
