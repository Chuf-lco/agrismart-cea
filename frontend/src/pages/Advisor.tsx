import { useEffect, useRef, useState } from "react"
import { getCrops, postAdvisorMessage, AdvisorMessage } from "../api"
import ChatBubble from "../components/ChatBubble"

interface Crop { id: number; name: string; variety?: string }

const GREENHOUSES = ["GH-001", "GH-002", "GH-003"]

const SUGGESTIONS = [
  "Why are my leaves yellowing?",
  "Is my humidity too high?",
  "What should I check today?",
  "How do I increase yield?",
  "My crop is growing slower than expected.",
]

export default function Advisor() {
  const [crops, setCrops] = useState<Crop[]>([])
  const [gh, setGh] = useState("GH-001")
  const [cropId, setCropId] = useState<number | null>(null)
  const [history, setHistory] = useState<AdvisorMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [contextUsed, setContextUsed] = useState<any>(null)
  const [contextOpen, setContextOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getCrops().then(c => {
      setCrops(c)
      if (c.length > 0) setCropId(c[0].id)
    })
  }, [])

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history, loading])

  const send = async (msg?: string) => {
    const text = msg ?? input.trim()
    if (!text || !cropId || loading) return
    setInput("")
    setError("")

    const userMsg: AdvisorMessage = { role: "user", content: text }
    const newHistory = [...history, userMsg]
    setHistory(newHistory)
    setLoading(true)

    try {
      const res = await postAdvisorMessage({
        greenhouse_id: gh,
        crop_id: cropId,
        message: text,
        history: history, // send history before this message
      })
      setHistory([...newHistory, { role: "assistant", content: res.response }])
      setContextUsed(res.context_used)
    } catch {
      setError("Failed to reach the advisor. Is the backend running?")
      // Remove the user message if request failed
      setHistory(history)
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const clearChat = () => {
    setHistory([])
    setContextUsed(null)
    setError("")
  }

  const selectedCrop = crops.find(c => c.id === cropId)

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen max-h-screen">
      {/* Header */}
      <div className="shrink-0 pb-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">AI Crop Advisor</h1>
            <p className="text-gray-500 text-sm mt-1">Powered by Llama 3 · Context-aware agronomic advice</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearChat}
              className="text-xs text-gray-500 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              Clear chat
            </button>
          )}
        </div>

        {/* Selectors */}
        <div className="flex gap-3 flex-wrap">
          <select
            value={gh}
            onChange={e => setGh(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
          >
            {GREENHOUSES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select
            value={cropId ?? ""}
            onChange={e => setCropId(Number(e.target.value))}
            className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-600"
          >
            {crops.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Context panel */}
        {contextUsed && (
          <div className="mt-3">
            <button
              onClick={() => setContextOpen(o => !o)}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {contextOpen ? "▲" : "▼"} What context is the advisor using?
            </button>
            {contextOpen && (
              <div className="mt-2 bg-gray-900 border border-gray-800 rounded-xl p-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div><p className="text-gray-500">Crop</p><p className="text-white">{contextUsed.crop}</p></div>
                <div><p className="text-gray-500">Greenhouse</p><p className="text-white">{contextUsed.greenhouse_id}</p></div>
                <div><p className="text-gray-500">Temperature</p><p className="text-white">{contextUsed.temperature ?? "N/A"}°C</p></div>
                <div><p className="text-gray-500">Humidity</p><p className="text-white">{contextUsed.humidity ?? "N/A"}%</p></div>
                <div><p className="text-gray-500">CO₂</p><p className="text-white">{contextUsed.co2_ppm ?? "N/A"} ppm</p></div>
                <div><p className="text-gray-500">Active cycle</p><p className="text-white">{contextUsed.has_active_cycle ? `Day ${contextUsed.cycle_day}` : "None"}</p></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 min-h-0">
        {history.length === 0 && (
          <div className="text-center pt-8">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-white font-medium mb-1">AgriAdvisor is ready</p>
            <p className="text-gray-500 text-sm mb-6">
              Ask about {selectedCrop?.name ?? "your crop"} in {gh}
            </p>
            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-full border border-gray-700 hover:border-gray-500 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} content={msg.content} />
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm shrink-0">🌱</div>
            <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 pt-4 border-t border-gray-800">
        {/* Suggestion chips — show after first message */}
        {history.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {SUGGESTIONS.slice(0, 3).map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={loading}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-3 py-1.5 rounded-full border border-gray-700 transition-colors disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
            rows={2}
            placeholder={`Ask about your ${selectedCrop?.name ?? "crop"} in ${gh}... (Enter to send)`}
            className="flex-1 bg-gray-900 border border-gray-700 text-gray-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-green-600 resize-none disabled:opacity-50"
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed self-end"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  )
}