interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
  icon?: React.ReactNode
}

export function StatCard({ label, value, sub, accent, icon }: StatCardProps) {
  return (
    <div
      className={`rounded-2xl p-4 flex flex-col gap-1 ${
        accent
          ? 'bg-ki-blue text-white'
          : 'bg-white border border-gray-100 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <p className={`text-xs font-medium ${accent ? 'text-white/60' : 'text-gray-500'}`}>
          {label}
        </p>
        {icon && <span className={accent ? 'text-ki-gold' : 'text-ki-blue'}>{icon}</span>}
      </div>
      <p className={`text-2xl font-bold ${accent ? 'text-white' : 'text-ki-blue'}`}>{value}</p>
      {sub && <p className={`text-xs ${accent ? 'text-white/50' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  )
}
