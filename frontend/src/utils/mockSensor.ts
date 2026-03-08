import { logSensorReading, SensorPayload } from "../api"

// Realistic variance around a base value
const vary = (base: number, range: number) =>
  parseFloat((base + (Math.random() * range * 2 - range)).toFixed(1))

// Generate one realistic reading for a greenhouse
export const generateReading = (greenhouse_id: string): SensorPayload => ({
  greenhouse_id,
  temperature:   vary(25, 3),     // 22–28°C
  humidity:      vary(67, 7),     // 60–75% RH
  co2_ppm:       vary(1000, 200), // 800–1200 ppm
  light_lux:     vary(6000, 2000),// 4000–8000 lux
  soil_moisture: vary(62, 8),     // 54–70%
})

// Seed N readings for a greenhouse — call once from browser console
// Usage: import { seedReadings } from "../utils/mockSensor"; seedReadings("GH-001", 20)
export const seedReadings = async (greenhouse_id: string, count = 20) => {
  console.log(`Seeding ${count} readings for ${greenhouse_id}...`)
  for (let i = 0; i < count; i++) {
    await logSensorReading(generateReading(greenhouse_id))
  }
  console.log("✅ Done seeding sensor readings.")
}