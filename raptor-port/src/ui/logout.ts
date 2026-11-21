/* THE ONE LOGOUT — the top bar's button (Shell) and the phone drawer's both
   come here, so a question that must come first cannot be missed by one of
   them. The Tracker is asked first (owner, 23 Sep 26 — D129): unsaved chart
   edits get Save / Discard / Stay, over the Tracker tab, before the session
   ends. resetSession stays the one session-change path (state/store.ts).
   Resolves true when the person was logged out, false when they chose to stay.

   SIGN-OUT RELOADS THE PAGE (multi-squadron batch 1, step 2 — plan §3.4). With two units the memory holds more than one
   person's world: the unit in view's week and settings, the other units' saved weeks and planning calendars kept this
   session, every screen's own memory. resetSession puts the unit in view back to the boot unit and clears the session,
   but a reload is the one step that leaves nothing of the last person's units behind for the next one at this browser.
   The order stays as it was — the Tracker's question, then the session ended — and then every save still queued is
   sent, and only then the page reloads. While a save is still waiting (it failed, or the browser refused it) the page is
   NOT reloaded: on an iPhone a reload would lose it unasked (storage/savewait.ts), so the session is ended and the
   failed-save band stays up with its Retry, as it does anywhere else. The reload is a seam so the unit tests, which run
   with no page to reload, can see that it is called and in what order. */
import { resetSession, notify, setPage } from '../state/store'
import { trackerMayLogOut } from '../tracker/role.js'
import { flushSaves, saveWaiting, onSavesLanded } from '../storage/savewait'
import { SESSION } from '../state/auth'

let reloadPage: () => void = () => { window.location.reload() }
/** replace the page reload (tests); returns the one it replaced */
export function setReloadSeam(fn: () => void): () => void { const prev = reloadPage; reloadPage = fn; return prev }

export async function logOut(): Promise<boolean> {
  const go = await trackerMayLogOut(() => { setPage('tracker'); notify() })
  if (!go) return false
  resetSession(null); notify()
  await flushSaves()
  if (!saveWaiting()) { reloadPage(); return true }
  /* …and the reload is OWED, not dropped (the full check of multi-squadron batch 1, 18 Nov 26 — the blind reads found
     the next person, of the other squadron, signing in on this same page and getting the first squadron's Tracker, which
     keeps the squadron it first loaded for the life of the page, tracker/storage.js). The moment the waiting save lands
     — his Retry, or the saver getting through by itself — and nobody has signed in since, the page reloads: the sign-in
     screen comes back as it was, now with nothing of the last person's squadron in memory. Someone signed in before it
     landed keeps his session (a reload would sign him out unasked). */
  onSavesLanded(() => { if (!SESSION) reloadPage() })
  return true
}
