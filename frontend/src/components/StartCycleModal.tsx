import { useEffect, useState } from "react"
import { getCrops, startCycle } from "../api"

interface Crop { id: number; name: string; variety?: string; growth_duration_days?: number }

interface Props {
  onClose: () => void
  onCreated: () => void
}

export default function StartCycleModal({ onClose, onCreated }: Props) {
  const [crops, setCrops] = useState<Crop[]>([])
  const [form, setForm] = useState({
    greenhouse_id: "GH-001",
    crop_id: "",
    start_date: new Date().toISOString().split("T")[0],
    expected_end_date: "",
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    getCrops().then(setCrops)
  }, [])

  // Auto-fill expected end date when crop is selected
  const handleCropChange = (id: string) => {
    const crop = crops.find(c => c.id === Number(id))
    if (crop?.growth_duration_days && form.start_date) {
      const end = new Date(form.start_date)
      end.setDate(end.getDate() + crop.growth_duration_days)
      setForm(f => ({ ...f, crop_id: id, expected_end_date: end.toISOString().split("T")[0] }))
    } else {
      setForm(f => ({ ...f, crop_id: id }))
    }
  }

  const handleSubmit = async () => {
    if (!form.crop_id || !form.greenhouse_id || !form.start_date) {
      setError("Greenhouse, crop, and start date are required.")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      await startCycle({
        greenhouse_id: form.greenhouse_id,
        crop_id: Number(form.crop_id),
        start_date: form.start_date,
        expected_end_date: form.expected_end_date || undefined,
        notes: form.notes || undefined,
      })
      onCreated()
      onClose()
    } catch {
      setError("Failed to start cycle. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">Start New Cycle</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Greenhouse */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Greenhouse</label>
            <select
              value={form.greenhouse_id}
              onChange={e => set("greenhouse_id", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
            >
              {["GH-001", "GH-002", "GH-003"].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Crop */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Crop</label>
            <select
              value={form.crop_id}
              onChange={e => handleCropChange(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
            >
              <option value="">Select a crop...</option>
              {crops.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.variety ? `(${c.variety})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Start date */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Start Date</label>
            <input
              type="date"
              value={form.start_date}
              onChange={e => set("start_date", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
            />
          </div>

          {/* Expected end date */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">
              Expected End Date
              <span className="text-gray-600 ml-1">(auto-filled from crop duration)</span>
            </label>
            <input
              type="date"
              value={form.expected_end_date}
              onChange={e => set("expected_end_date", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              rows={2}
              placeholder="e.g. First batch of Roma tomatoes in GH-001"
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-600 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2 rounded-lg bg-green-700 hover:bg-green-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {submitting ? "Starting..." : "Start Cycle"}
          </button>
        </div>
      </div>
    </div>
  )
}