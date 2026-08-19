import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/scheduler.css'
import { initStore, setToast, histInit } from './state/store'
import { storeBackend } from './engine/hooks'
import { toast } from './ui/toast'
import { App } from './ui/App'
import { initStore as lwInitStore } from './leavewar/state/store'
import { localBackend, memoryBackend, splitBackend } from './leavewar/state/storage'
import { installDemoWorld } from './leavewar/state/demoworld'
import { wireLeaveWarSync } from './leavewar/sync'
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
   the Raptor session on every login/logout.

   It boots on a MEMORY backend, so a leave war lasts for the session and
   resets on reload — deliberately matching Raptor's own INPUTS, which are
   session-only too. Before this, Leave War persisted to localStorage while
   Raptor did not, and that asymmetry showed on screen: a leave cell synced
   between the two apps would reverse-clear or reappear at the next boot,
   because one half remembered the world across a reload and the other had
   forgotten it. Making both forget keeps them in step. The storage seam
   (leavewar/state/storage.ts) is still where a shared database backend plugs
   in when real multi-device data arrives; until then, memory.

   The MANNING COUNTER keys are the one exception (owner, 19 Aug 26): the
   counter definitions and their arrangement are squadron settings, not leave
   data — a counter he built (or deleted) must not resurrect on reload — so
   those three keys route to localStorage while the war itself stays
   session-only. */
lwInitStore(splitBackend(memoryBackend(), localBackend(), ['manningdefs', 'manningorder', 'manninghidden']))
/* One roster (sync wire 0): Leave War's people become the projection of
   Raptor's PEOPLE, and the seeded demo world is re-keyed onto that real crew.
   Every boot is a FRESH one now (the memory backend above forgets the last
   session), so the re-key always runs — the first-visit path, taken every
   time. See leavewar/state/demoworld.ts. */
installDemoWorld(false)
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
