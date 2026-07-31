import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/scheduler.css'
import { initStore } from './state/store'
import { storeBackend } from './engine/hooks'
import { App } from './ui/App'

/* the engine's rule persistence gets the real localStorage in a browser */
try { storeBackend.impl = window.localStorage } catch (e) { /* headless */ }

initStore()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
