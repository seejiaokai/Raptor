import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/scheduler.css'
import { setToast } from './state/store'
import { HOOKS } from './engine/hooks'
import { toast, toastBatch } from './ui/toast'
import { App } from './ui/App'
import { installProbeBridge, isLocalHost } from './probe-bridge'
import { chooseBackend, guardUnload } from './storage/boot'
import { StoreAheadError } from './storage/schema'
import { setSaveStatusSource } from './ui/SaveStatus'
import { bootApp, BootConfigError } from './boot'
import { bootPolicyFrom } from './bootpolicy'

/* THE COMPOSITION ROOT. It chooses the two things only a page can: the backend (storage/boot.ts chooseBackend) and
   the boot policy ([DB-READINESS] group A, phase 5 — src/bootpolicy.ts: the demo, or a shared store that nothing demo
   ever reaches, with its first admin), from the build's own settings. Everything the boot does with them is
   src/boot.ts, in the order it always ran; then the page's own wiring, the probe bridge and the render. */
async function boot(): Promise<void> {
  setToast(toast)
  HOOKS.toastBatch = toastBatch   // one press, one message — only the publish command opens one ([AMEND-SMALL-SEEN] 1)
  const { postman } = await bootApp(chooseBackend(), bootPolicyFrom(import.meta.env as any))

  /* the indicator and the unload guard hang off the postman */
  setSaveStatusSource(postman)
  guardUnload(postman)

  /* THE PROBE BRIDGE IS INSTALLED ON THIS PC ONLY ([ACCOUNTS], 26 Sep 26 — Astra R1-1,
     Fable R1-3): it puts the app's data and writers (PEOPLE, INPUTS, setSlotVal, the
     Leave War's role and viewer, publish…) on `window` for the e2e suite, the probes,
     the Tracker smoke and the hand-pass drivers, all of which run here. On any other
     host — the deployed app — none of it exists, so a person with the browser's
     console open cannot sidestep who they signed in as. Nothing in the app itself
     reads a bridge global (checked 26 Sep 26). */
  if (isLocalHost()) installProbeBridge()
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
  /* the saved data was written by a newer version of the app (storage/schema.ts): reloading fetches it */
  if (err instanceof StoreAheadError) {
    root.innerHTML =
      '<div class="bootfail" role="alert" style="max-width:520px;margin:20vh auto;padding:24px;font:14px system-ui,sans-serif;color:#eee">' +
      '<h1 style="font-size:18px;margin:0 0 8px">RAPTOR has been updated</h1>' +
      '<p style="margin:0 0 16px">Reload to get the latest version. Nothing was opened, so nothing can be lost.</p>' +
      '<button id="bootRetry" type="button" style="padding:8px 14px;border-radius:10px;border:1px solid #888;background:transparent;color:inherit;cursor:pointer">Reload</button></div>'
    document.getElementById('bootRetry')?.addEventListener('click', () => location.reload())
    return
  }
  /* a shared store that has never started, on a build whose first admin is missing or incomplete (src/boot.ts): nothing
     was written, and a reload cannot help — the setting is IT's to finish ([DB-READINESS] group A, phase 5) */
  if (err instanceof BootConfigError) {
    root.innerHTML =
      '<div class="bootfail" role="alert" style="max-width:520px;margin:20vh auto;padding:24px;font:14px system-ui,sans-serif;color:#eee">' +
      '<h1 style="font-size:18px;margin:0 0 8px">RAPTOR is not set up yet</h1>' +
      '<p style="margin:0 0 8px">Its first admin is not set up, so nobody could sign in. Nothing was saved.</p>' +
      `<p style="margin:0">Pass this to whoever set RAPTOR up: ${err.message.replace(/[<>&]/g, c => (c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;'))}</p></div>`
    return
  }
  root.innerHTML =
    '<div class="bootfail" role="alert" style="max-width:520px;margin:20vh auto;padding:24px;font:14px system-ui,sans-serif;color:#eee">' +
    '<h1 style="font-size:18px;margin:0 0 8px">RAPTOR could not load its data</h1>' +
    '<p style="margin:0 0 16px">Nothing was opened, so nothing can be lost. Check the connection and try again.</p>' +
    '<button id="bootRetry" type="button" style="padding:8px 14px;border-radius:10px;border:1px solid #888;background:transparent;color:inherit;cursor:pointer">Retry</button></div>'
  document.getElementById('bootRetry')?.addEventListener('click', () => location.reload())
})
