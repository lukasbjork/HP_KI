interface ProgressBarProps {
  value: number   // 0–1
  color?: string
  height?: string
  label?: string
  showPercent?: boolean
}

export function ProgressBar({
  value,
  color = 'bg-ki-blue',
  height = 'h-2',
  label,
  showPercent,
}: ProgressBarProps) {
  const pct = Math.round(value * 100)
  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          {label && <span>{label}</span>}
          {showPercent && <span>{pct}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${height} ${color} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  )
}
