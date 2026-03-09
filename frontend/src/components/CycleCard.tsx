import { useState } from "react"
import { differenceInDays, parseISO } from "date-fns"
import { updateCycle } from "../api"
import CycleTimeline from "./CycleTimeline"

interface Crop { id: number; name: string; variety?: string }

interface Cycle {
  id: number
  greenhouse_id: string
  crop_id: number
  start_date: string
  expected_end_date?: string
  actual_end_date?: string
  status: "active" | "completed" | "failed"
  notes?: string
  crop?: Crop
}

interface Props {
  cycle: Cycle
  onUpdate: () => void
  onClick: () => void
}

const statusStyles = {
  active:    "bg-green-900 text-green-300",
  completed: "bg-gray-700 text-gray-300",
  failed:    "bg-red-900 text-red-300",
}

export default function CycleCard({ cycle, onUpdate, onClick }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [notes, setNotes] = useState(cycle.notes ?? "")
  const [savingNotes, setSavingNotes] = useState(false)

  const handleSaveNotes = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setSavingNotes(true)
    await updateCycle(cycle.id, { notes })
    setSavingNotes(false)
    onUpdate()
  }

  const handleClick = () => {
    setExpanded(x => !x)
    onClick()
  }

  const start = parseISO(cycle.start_date)
  const today = new Date()
  const elapsed = differenceInDays(today, start)

  const total = cycle.expected_end_date
    ? differenceInDays(parseISO(cycle.expected_end_date), start)
    : null

  const pct = total ? Math.min(Math.round((elapsed / total) * 100), 100) : null
  const overdue = total ? elapsed > total : false

  const barColor = overdue
    ? "bg-red-500"
    : pct && pct > 80
    ? "bg-amber-500"
    : "bg-green-500"

  const handleStatus = async (status: "completed" | "failed", e: React.MouseEvent) => {
    e.stopPropagation()
    await updateCycle(cycle.id, {
      status,
      actual_end_date: new Date().toISOString().split("T")[0],
    })
    onUpdate()
  }

  return (
    <div
      onClick={handleClick}
      className="bg-gray-900 border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-gray-600 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-white font-semibold">
            {cycle.crop?.name ?? `Crop #${cycle.crop_id}`}
          </h2>
          <p className="text-gray-500 text-xs">{cycle.crop?.variety}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[cycle.status]}`}>
          {cycle.status}
        </span>
      </div>

      {/* Meta */}
      <div className="text-sm text-gray-400 space-y-1 mb-4">
        <p>📍 {cycle.greenhouse_id}</p>
        <p>📅 Started {cycle.start_date}</p>
        {cycle.expected_end_date && (
          <p>🏁 Expected {cycle.expected_end_date}
            {overdue && cycle.status === "active" && (
              <span className="text-red-400 ml-2">— overdue</span>
            )}
          </p>
        )}
        {total && <p>⏱ Day {elapsed} of {total}</p>}
      </div>

      {/* Progress bar */}
      {pct !== null && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Actions */}
      {cycle.status === "active" && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={e => handleStatus("completed", e)}
            className="flex-1 text-xs py-1.5 rounded-lg bg-green-800 hover:bg-green-700 text-green-200 transition-colors"
          >
            ✓ Mark Complete
          </button>
          <button
            onClick={e => handleStatus("failed", e)}
            className="flex-1 text-xs py-1.5 rounded-lg bg-red-900 hover:bg-red-800 text-red-300 transition-colors"
          >
            ✕ Mark Failed
          </button>
        </div>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div onClick={e => e.stopPropagation()}>
          <CycleTimeline cycle={cycle} />

          {/* Crop detail */}
          {cycle.crop && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Crop Info</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                {cycle.crop.variety && <p>🌿 {cycle.crop.variety}</p>}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Notes</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Add notes about this cycle..."
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-600 resize-none"
            />
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors disabled:opacity-50"
            >
              {savingNotes ? "Saving..." : "Save Notes"}
            </button>
          </div>
        </div>
      )}

      {/* Expand hint */}
      <div className="mt-3 text-center">
        <span className="text-xs text-gray-600">
          {expanded ? "▲ collapse" : "▼ expand"}
        </span>
      </div>
    </div>
  )
}