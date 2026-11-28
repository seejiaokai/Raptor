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
import { pageOffered } from '../state/perms'
import { noteKeptName } from './signinhold'

let reloadPage: () => void = () => { window.location.reload() }
/** replace the page reload (tests); returns the one it replaced */
export function setReloadSeam(fn: () => void): () => void { const prev = reloadPage; reloadPage = fn; return prev }

export async function logOut(): Promise<boolean> {
  /* the Tracker tab comes forward for its question only where it is offered: in the member view over a draft held on
     another squadron, opening it would count as opening one of his own pages and move the Tracker off that draft
     (state/store.ts landOnOfferedPage); the question is then asked over the page he is on (core.js) */
  const go = await trackerMayLogOut(() => { if (pageOffered('tracker')) { setPage('tracker'); notify() } })
  if (!go) return false
  resetSession(null); notify()
  await flushSaves()
  if (!saveWaiting()) { reloadPage(); return true }
  /* …and the reload is OWED, not dropped (the full check of multi-squadron batch 1, 18 Nov 26 — the blind reads found
     the next person, of the other squadron, signing in on this same page and getting the first squadron's Tracker, as it
     then was; since his D2395 the Tracker follows his pages, tracker/storage.js). The moment the waiting save lands
     — his Retry, or the saver getting through by itself — and nobody has signed in since, the page reloads: the sign-in
     screen comes back as it was, now with nothing of the last person's squadron in memory. Someone signed in before it
     landed keeps his session (a reload would sign him out unasked). */
  /* (since step G — batch 1's second half §8, his D2322: a sign-in pressed meanwhile is HELD until the save lands
     (ui/Login.tsx), so nobody can sign in on this page before it; the name he typed rides the reload — ui/signinhold.ts —
     and the card after it says "Saved. Press Sign in again.") */
  OWED = true
  onSavesLanded(() => {
    if (SESSION) { OWED = false; return }
    if (KEPT) noteKeptName(KEPT)
    reloadPage()
  })
  return true
}

/* THE OWED RELOAD, AS THE HELD SIGN-IN READS IT (step G): set when a sign-out left a save waiting; it stays set once the
   reload is asked (the page is going — the held sign-in's own listener may run after this one), and clears where
   someone signs in on this page after all (a reload held back, or a session already there when the save landed) */
let OWED = false
/** a sign-out on this page owes it a reload once the waiting save lands — the held sign-in then waits for it, never signs in */
export const reloadOwed = (): boolean => OWED
/** someone signed in on this page (ui/Login.tsx): no reload is owed to it any more */
export function signedInHere(): void { OWED = false; KEPT = '' }
/* the name typed into a held sign-in, kept for the card after the owed reload — never the password */
let KEPT = ''
export function keepNameForReload(name: string): void { KEPT = name }
