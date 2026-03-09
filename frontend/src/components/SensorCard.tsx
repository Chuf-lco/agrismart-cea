interface Props {
  label: string
  value: number | null
  unit: string
  icon: string
  min: number
  max: number
}

const status = (v: number, min: number, max: number) => {
  if (v >= min && v <= max) return "good"
  const buffer = (max - min) * 0.15
  if (v >= min - buffer && v <= max + buffer) return "warn"
  return "bad"
}

const colors = {
  good: "border-green-700 bg-green-950",
  warn: "border-amber-600 bg-amber-950",
  bad:  "border-red-700 bg-red-950",
}

const badges = {
  good: "text-green-400",
  warn: "text-amber-400",
  bad:  "text-red-400",
}

export default function SensorCard({ label, value, unit, icon, min, max }: Props) {
  const s = value !== null ? status(value, min, max) : "warn"

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${colors[s]}`}>
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-xs">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className={`text-2xl font-bold ${badges[s]}`}>
        {value !== null ? `${value}` : "—"}
        <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
      </div>
      <div className="text-xs text-gray-500">
        Optimal: {min}–{max} {unit}
      </div>
    </div>
  )
}