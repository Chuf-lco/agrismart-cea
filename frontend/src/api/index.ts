import axios from "axios"

const http = axios.create({ baseURL: "http://localhost:8000" })

// ── Crops ─────────────────────────────────────
export const getCrops = () =>
  http.get("/crops").then(r => r.data)

export const getCrop = (id: number) =>
  http.get(`/crops/${id}`).then(r => r.data)

// ── Sensor Readings ───────────────────────────
export interface SensorPayload {
  greenhouse_id: string
  temperature?: number
  humidity?: number
  co2_ppm?: number
  light_lux?: number
  soil_moisture?: number
}

export const getSensorReadings = (greenhouse_id: string, limit = 20) =>
  http.get("/sensors/readings", { params: { greenhouse_id, limit } }).then(r => r.data)

export const getLatestReading = (greenhouse_id: string) =>
  http.get("/sensors/readings/latest", { params: { greenhouse_id } }).then(r => r.data)

export const logSensorReading = (data: SensorPayload) =>
  http.post("/sensors/readings", data).then(r => r.data)

// ── AI Advisor ────────────────────────────────
export interface AdvisorMessage {
  role: "user" | "assistant"
  content: string
}

export interface AdvisorPayload {
  greenhouse_id: string
  crop_id: number
  message: string
  history: AdvisorMessage[]
}

export const postAdvisorMessage = (data: AdvisorPayload) =>
  http.post("/advisor/ask", data).then(r => r.data)
export interface CyclePayload {
  greenhouse_id: string
  crop_id: number
  start_date: string        // ISO date string e.g. "2026-03-07"
  expected_end_date?: string
  notes?: string
}

export interface CycleUpdate {
  status?: "active" | "completed" | "failed"
  actual_end_date?: string
  notes?: string
}

export const getCycles = (greenhouse_id?: string, status?: string) =>
  http.get("/cycles", { params: { greenhouse_id, status } }).then(r => r.data)

export const startCycle = (data: CyclePayload) =>
  http.post("/cycles", data).then(r => r.data)

export const updateCycle = (id: number, data: CycleUpdate) =>
  http.patch(`/cycles/${id}`, data).then(r => r.data)