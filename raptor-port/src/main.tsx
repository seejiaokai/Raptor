import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/scheduler.css'
import { initStore, setToast } from './state/store'
import { storeBackend } from './engine/hooks'
import { toast } from './ui/toast'
import { App } from './ui/App'
import { installProbeBridge } from './probe-bridge'

/* the engine's rule persistence gets the real localStorage in a browser,
   and the engine's toasts get the real toast */
try { storeBackend.impl = window.localStorage } catch (e) { /* headless */ }
setToast(toast)

initStore()
installProbeBridge()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
