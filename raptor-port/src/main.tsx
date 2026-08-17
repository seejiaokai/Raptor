import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/scheduler.css'
import { initStore, setToast, histInit } from './state/store'
import { storeBackend } from './engine/hooks'
import { toast } from './ui/toast'
import { App } from './ui/App'
import { initStore as lwInitStore } from './leavewar/state/store'
import { installDemoWorld } from './leavewar/state/demoworld'
import { wireLeaveWarSync } from './leavewar/sync'
import { installProbeBridge } from './probe-bridge'

/* the engine's rule persistence gets the real localStorage in a browser,
   and the engine's toasts get the real toast */
try { storeBackend.impl = window.localStorage } catch (e) { /* headless */ }
setToast(toast)

initStore()
/* Whether this browser has ever held a leave war — read BEFORE lwInitStore
   runs, because a fresh boot is what licenses the demo re-key below, and
   only the raw storage can still tell the difference afterwards. A throwing
   localStorage reads as fresh: the store's own backend degrades to the seed
   in exactly that case. */
let hadWars = false
try { hadWars = window.localStorage.getItem('leavewar:wars') != null } catch (e) { /* headless */ }
/* Leave War's store boots ONCE here, beside Raptor's own, never from the
   page component: its initStore clears every store subscriber, and the
   Leave War section unmounts/remounts on each tab switch. It must also be
   up before the first login — resetSession derives the Leave War role from
   the Raptor session on every login/logout. */
lwInitStore()
/* One roster (sync wire 0): Leave War's people become the projection of
   Raptor's PEOPLE, and — on a fresh browser only — the seeded demo world is
   re-keyed onto that real crew. See leavewar/state/demoworld.ts. */
installDemoWorld(hadWars)
/* Wires 1+2: one reconciliation pass each way (inbound first), then both
   stores stay subscribed. After it, re-take the history baseline: the boot
   sync's writes are the world the session STARTS in, and Undo must not be
   able to peel them away as if a person had made them. */
wireLeaveWarSync()
histInit()
installProbeBridge()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
