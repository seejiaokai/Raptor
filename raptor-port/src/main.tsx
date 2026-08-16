import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/scheduler.css'
import { initStore, setToast } from './state/store'
import { storeBackend } from './engine/hooks'
import { toast } from './ui/toast'
import { App } from './ui/App'
import { initStore as lwInitStore } from './leavewar/state/store'
import { installProbeBridge } from './probe-bridge'

/* the engine's rule persistence gets the real localStorage in a browser,
   and the engine's toasts get the real toast */
try { storeBackend.impl = window.localStorage } catch (e) { /* headless */ }
setToast(toast)

initStore()
/* Leave War's store boots ONCE here, beside Raptor's own, never from the
   page component: its initStore clears every store subscriber, and the
   Leave War section unmounts/remounts on each tab switch. It must also be
   up before the first login — resetSession derives the Leave War role from
   the Raptor session on every login/logout. */
lwInitStore()
installProbeBridge()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
