import { useEffect, useState } from "react"
import { getCrops, getCycles } from "../api"
import CycleCard from "../components/CycleCard"
import StartCycleModal from "../components/StartCycleModal"

type Filter = "all" | "active" | "completed" | "failed"

const FILTERS: Filter[] = ["all", "active", "completed", "failed"]

export default function Cycles() {
  const [cycles, setCycles] = useState<any[]>([])
  const [crops, setCrops] = useState<any[]>([])
  const [filter, setFilter] = useState<Filter>("all")
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([getCycles(), getCrops()])
      .then(([c, cr]) => {
        setCycles(c)
        setCrops(cr)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // Attach crop data to each cycle
  const enriched = cycles.map(c => ({
    ...c,
    crop: crops.find(cr => cr.id === c.crop_id),
  }))

  const filtered = filter === "all"
    ? enriched
    : enriched.filter(c => c.status === filter)

  const counts = {
    all: enriched.length,
    active: enriched.filter(c => c.status === "active").length,
    completed: enriched.filter(c => c.status === "completed").length,
    failed: enriched.filter(c => c.status === "failed").length,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Crop Cycles</h1>
          <p className="text-gray-500 text-sm mt-1">Track planting to harvest</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-700 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Start New Cycle
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-sm capitalize transition-colors ${
              filter === f
                ? "bg-green-700 text-white font-medium"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {f}
            <span className="ml-1.5 text-xs opacity-60">({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Cycle list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-sm">
            {filter === "all"
              ? "No cycles yet — start your first cycle above."
              : `No ${filter} cycles.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => (
            <CycleCard
              key={c.id}
              cycle={c}
              onUpdate={load}
              onClick={() => setSelected(selected === c.id ? null : c.id)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <StartCycleModal
          onClose={() => setShowModal(false)}
          onCreated={load}
        />
      )}
    </div>
  )
}