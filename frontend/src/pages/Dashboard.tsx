import { useEffect, useState } from "react"
import { getSensorReadings, getLatestReading } from "../api"
import SensorCard from "../components/SensorCard"
import SensorChart from "../components/SensorChart"

type Metric = "temperature" | "humidity" | "co2_ppm" | "light_lux" | "soil_moisture"

const GREENHOUSES = ["GH-001", "GH-002"]

const CARDS: {
  metric: Metric; label: string; unit: string; icon: string; min: number; max: number
}[] = [
  { metric: "temperature",   label: "Temperature", unit: "°C",  icon: "🌡️", min: 18, max: 28 },
  { metric: "humidity",      label: "Humidity",    unit: "%",   icon: "💧", min: 55, max: 75 },
  { metric: "co2_ppm",       label: "CO₂",         unit: "ppm", icon: "🌬️", min: 800, max: 1200 },
  { metric: "light_lux",     label: "Light",       unit: "lux", icon: "☀️", min: 4000, max: 8000 },
  { metric: "soil_moisture", label: "Soil",        unit: "%",   icon: "🪴", min: 55, max: 70 },
]

const TABS: { metric: Metric; label: string }[] = [
  { metric: "temperature",   label: "Temp" },
  { metric: "humidity",      label: "Humidity" },
  { metric: "co2_ppm",       label: "CO₂" },
  { metric: "light_lux",     label: "Light" },
  { metric: "soil_moisture", label: "Soil" },
]

export default function Dashboard() {
  const [gh, setGh] = useState("GH-001")
  const [latest, setLatest] = useState<any>(null)
  const [readings, setReadings] = useState<any[]>([])
  const [metric, setMetric] = useState<Metric>("temperature")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true)
    setError("")
    Promise.all([
      getLatestReading(gh).catch(() => null),
      getSensorReadings(gh, 20),
    ])
      .then(([lat, reads]) => {
        setLatest(lat)
        setReadings(reads)
      })
      .catch(() => setError("Could not load sensor data — is the backend running?"))
      .finally(() => setLoading(false))
  }, [gh])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Live greenhouse sensor data</p>
        </div>
        <select
          value={gh}
          onChange={e => setGh(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
        >
          {GREENHOUSES.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-950 border border-red-800 text-red-400 rounded-xl px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Sensor cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {CARDS.map(c => (
            <div key={c.metric} className="rounded-xl border border-gray-800 bg-gray-900 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {CARDS.map(c => (
            <SensorCard
              key={c.metric}
              label={c.label}
              value={latest?.[c.metric] ?? null}
              unit={c.unit}
              icon={c.icon}
              min={c.min}
              max={c.max}
            />
          ))}
        </div>
      )}

      {/* Chart tabs */}
      <div className="flex gap-2 mb-3">
        {TABS.map(t => (
          <button
            key={t.metric}
            onClick={() => setMetric(t.metric)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              metric === t.metric
                ? "bg-green-700 text-white font-medium"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {!loading && readings.length > 0 && (
        <SensorChart readings={readings} metric={metric} />
      )}

      {!loading && readings.length === 0 && !error && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500 text-sm">
          No sensor readings yet for {gh}.<br />
          Open the browser console and run: <code className="text-green-400">seedReadings("{gh}", 20)</code>
        </div>
      )}
    </div>
  )
}