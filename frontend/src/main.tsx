// frontend/src/main.tsx
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import { seedReadings } from "./utils/mockSensor"
import "./index.css"

//Expose seeder on window for one-time use of the browser console: seedReadings("GH-001", 20)
;(window as any).seedReadings = seedReadings

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)