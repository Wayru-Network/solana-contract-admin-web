import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { Buffer } from 'buffer'
import 'process'

window.global = window
window.Buffer = Buffer
window.process = process

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
