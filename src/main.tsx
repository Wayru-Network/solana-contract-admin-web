import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { Buffer } from 'buffer'
import process from 'process'

declare global {
  interface Window {
    global: typeof globalThis;
    Buffer: typeof Buffer;
    process: typeof process;
  }
}

// Assign the values with type assertions
window.global = window as typeof globalThis;
window.Buffer = Buffer;
window.process = process;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
