import { useState } from "react"
import { Routes, Route, NavLink } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Crops from "./pages/Crops"
import Cycles from "./pages/Cycles"

const nav = [
  { to: "/", label: "Dashboard" },
  { to: "/crops", label: "Crops" },
  { to: "/cycles", label: "Cycles" },
]

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 py-3">
        <span className="text-green-400 font-bold">🌱 AgriSmart</span>
        <button onClick={() => setOpen(o => !o)} className="text-gray-400 hover:text-white text-xl">
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile nav overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/70" onClick={() => setOpen(false)}>
          <div className="w-56 h-full bg-gray-900 border-r border-gray-800 flex flex-col p-6 gap-2 pt-16">
            {nav.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive ? "bg-green-700 text-white font-medium" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-56 bg-gray-900 border-r border-gray-800 flex-col p-6 gap-2">
        <div className="mb-6">
          <span className="text-green-400 text-xl font-bold">🌱 AgriSmart</span>
          <p className="text-gray-500 text-xs mt-1">CEA Platform</p>
        </div>
        {nav.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? "bg-green-700 text-white font-medium" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </aside>

      {/* Main content */}
      <main className="md:ml-56 pt-16 md:pt-0 p-6 md:p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/crops" element={<Crops />} />
          <Route path="/cycles" element={<Cycles />} />
        </Routes>
      </main>
    </div>
  )
}