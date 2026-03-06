import { useEffect, useState } from "react"
import axios from "axios"

interface Crop {
  id: number
  name: string
  variety?: string
  origin_region?: string
  climate_resilience_score?: number
  growth_duration_days?: number
  water_requirement?: string
}

export default function Crops() {
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get("http://localhost:8000/crops")
      .then(r => setCrops(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-400">Loading crops...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Crops</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {crops.map(c => (
          <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-white font-semibold">{c.name}</h2>
                <p className="text-gray-500 text-xs">{c.variety}</p>
              </div>
              {c.climate_resilience_score && (
                <span className="bg-green-900 text-green-300 text-xs font-bold px-2 py-1 rounded-full">
                  {c.climate_resilience_score}/10
                </span>
              )}
            </div>
            <div className="text-sm text-gray-400 space-y-1 mt-3">
              {c.origin_region && <p>📍 {c.origin_region}</p>}
              {c.growth_duration_days && <p>⏱ {c.growth_duration_days} days</p>}
              {c.water_requirement && <p>💧 Water: {c.water_requirement}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
