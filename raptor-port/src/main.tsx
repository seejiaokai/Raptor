import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/scheduler.css'
import { initStore, setToast, histInit, weekStashSnap, weekDirty } from './state/store'
import { storeBackend } from './engine/hooks'
import { toast } from './ui/toast'
import { App } from './ui/App'
import { initStore as lwInitStore, lwHistInit } from './leavewar/state/store'
import { installDemoWorld } from './leavewar/state/demoworld'
import { wireLeaveWarSync } from './leavewar/sync'
import { installProbeBridge } from './probe-bridge'
import { bootStorage, chooseBackend, guardUnload } from './storage/boot'
import { settingsAdapter, leavewarAdapter, trackerTarget } from './storage/adapters'
import { useStorageImpl } from './tracker/storage.js'
import { hydrate, wirePersist } from './state/persist'
import { setSaveStatusSource } from './ui/SaveStatus'

/* THE BOOT (storage seam, 8 Sep 26 — docs/superpowers/specs/2026-09-08-
   storage-seam-design.md). The ONE place the app waits: fetch everything
   from the backend into the whiteboard, plug the three doors in, hydrate
   the live scheduler state, then run the boot sequence exactly as before
   the seam, then draw. Nothing below bootStorage ever waits on storage. */
async function boot(): Promise<void> {
  const { wb, postman } = await bootStorage(chooseBackend())

  /* the three doors (storage/adapters.ts): settings, Leave War, Tracker */
  storeBackend.impl = settingsAdapter(wb)
  useStorageImpl(trackerTarget(wb))
  setToast(toast)

  /* inputs / roster / plan layer / stashed weeks: whiteboard → singletons,
     BEFORE initStore so its seeds know to stand down (state/persist.ts) */
  hydrate(wb)
  initStore()

  /* Leave War boots on the whiteboard too. installDemoWorld's flag is now
     REAL: a world that came back from storage keeps its wars, its OIL story
     and its inputs; only a first-ever boot gets the demo overlay. */
  const hadStoredWars = wb.has('leavewar', 'wars')
  lwInitStore(leavewarAdapter(wb))
  installDemoWorld(hadStoredWars)

  /* same order as before the seam: the boot sync's writes are the world the
     session STARTS in, and both history baselines are taken after it */
  wireLeaveWarSync()
  histInit()
  lwHistInit()

  /* every history step, undo/redo and week swap now re-persists; the
     indicator and the unload guard hang off the postman */
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  setSaveStatusSource(postman)
  guardUnload(postman)

  installProbeBridge()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

boot().catch((err: unknown) => {
  console.error('RAPTOR could not load its data', err)
  const root = document.getElementById('root')
  if (!root) return
  root.innerHTML =
    '<div class="bootfail" role="alert" style="max-width:520px;margin:20vh auto;padding:24px;font:14px system-ui,sans-serif;color:#eee">' +
    '<h1 style="font-size:18px;margin:0 0 8px">RAPTOR could not load its data</h1>' +
    '<p style="margin:0 0 16px">Nothing was opened, so nothing can be lost. Check the connection and try again.</p>' +
    '<button id="bootRetry" type="button" style="padding:8px 14px;border-radius:10px;border:1px solid #888;background:transparent;color:inherit;cursor:pointer">Retry</button></div>'
  document.getElementById('bootRetry')?.addEventListener('click', () => location.reload())
})
