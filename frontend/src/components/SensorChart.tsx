import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from "chart.js"

ChartJS.register(
  CategoryScale, LinearScale,
  PointElement, LineElement,
  Title, Tooltip, Legend, Filler
)

interface Reading {
  timestamp: string
  temperature?: number
  humidity?: number
  co2_ppm?: number
  light_lux?: number
  soil_moisture?: number
}

type Metric = "temperature" | "humidity" | "co2_ppm" | "light_lux" | "soil_moisture"

interface Props {
  readings: Reading[]
  metric: Metric
}

const metaMap: Record<Metric, { label: string; unit: string; color: string }> = {
  temperature:   { label: "Temperature", unit: "°C",  color: "#4ade80" },
  humidity:      { label: "Humidity",    unit: "% RH", color: "#60a5fa" },
  co2_ppm:       { label: "CO₂",         unit: "ppm", color: "#f59e0b" },
  light_lux:     { label: "Light",       unit: "lux", color: "#e879f9" },
  soil_moisture: { label: "Soil",        unit: "%",   color: "#a53333" },
}

export default function SensorChart({ readings, metric }: Props) {
  const meta = metaMap[metric]
  const sorted = [...readings].reverse()

  const data = {
    labels: sorted.map(r =>
      new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    ),
    datasets: [{
      label: `${meta.label} (${meta.unit})`,
      data: sorted.map(r => r[metric] ?? null),
      borderColor: meta.color,
      backgroundColor: meta.color + "22",
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.4,
      fill: true,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#9ca3af",
        bodyColor: "#f9fafb",
        borderColor: "#374151",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: "#6b7280", maxTicksLimit: 8 },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        ticks: { color: "#6b7280" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm text-gray-400 mb-4">
        {meta.label} over time
        <span className="text-gray-600 ml-2">(last {readings.length} readings)</span>
      </h3>
      <div style={{ height: 240 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  )
}