import { differenceInDays, parseISO, format } from "date-fns"

interface Cycle {
  id: number
  start_date: string
  expected_end_date?: string
  actual_end_date?: string
  status: "active" | "completed" | "failed"
}

interface Props { cycle: Cycle }

export default function CycleTimeline({ cycle }: Props) {
  const start = parseISO(cycle.start_date)
  const today = new Date()

  const end = cycle.actual_end_date
    ? parseISO(cycle.actual_end_date)
    : cycle.expected_end_date
    ? parseISO(cycle.expected_end_date)
    : null

  const total = end ? differenceInDays(end, start) : null
  const elapsed = differenceInDays(today, start)
  const pct = total ? Math.min((elapsed / total) * 100, 100) : null
  const overdue = total ? elapsed > total && cycle.status === "active" : false
  const daysLeft = total ? total - elapsed : null

  const barColor = cycle.status === "completed"
    ? "bg-green-500"
    : cycle.status === "failed"
    ? "bg-red-500"
    : overdue
    ? "bg-red-500"
    : pct && pct > 80
    ? "bg-amber-500"
    : "bg-green-500"

  const todayPct = total
    ? Math.min((elapsed / total) * 100, 100)
    : null

  return (
    <div className="mt-4 pt-4 border-t border-gray-800">
      <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">Timeline</p>

      {/* Bar */}
      <div className="relative h-3 bg-gray-800 rounded-full overflow-visible mb-2">
        {/* Fill */}
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct ?? 0}%` }}
        />
        {/* Today marker */}
        {todayPct !== null && cycle.status === "active" && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-green-500 rounded-full"
            style={{ left: `calc(${todayPct}% - 6px)` }}
          />
        )}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-500 mb-3">
        <span>▶ {format(start, "MMM d")}</span>
        {cycle.status === "active" && daysLeft !== null && (
          <span className={overdue ? "text-red-400" : "text-gray-400"}>
            {overdue
              ? `${Math.abs(daysLeft)}d overdue`
              : `${daysLeft}d remaining`}
          </span>
        )}
        {end && <span>🏁 {format(end, "MMM d")}</span>}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-800 rounded-lg p-2">
          <p className="text-white text-sm font-semibold">{elapsed}d</p>
          <p className="text-gray-500 text-xs">Elapsed</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-2">
          <p className="text-white text-sm font-semibold">{total ?? "—"}d</p>
          <p className="text-gray-500 text-xs">Total</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-2">
          <p className={`text-sm font-semibold ${overdue ? "text-red-400" : "text-white"}`}>
            {pct !== null ? `${Math.round(pct)}%` : "—"}
          </p>
          <p className="text-gray-500 text-xs">Progress</p>
        </div>
      </div>
    </div>
  )
}