/* THE ONE LOGOUT — the top bar's button (Shell) and the phone drawer's both
   come here, so a question that must come first cannot be missed by one of
   them. The Tracker is asked first (owner, 23 Sep 26 — D129): unsaved chart
   edits get Save / Discard / Stay, over the Tracker tab, before the session
   ends. resetSession stays the one session-change path (state/store.ts).
   Resolves true when the person was logged out, false when they chose to stay. */
import { resetSession, notify, setPage } from '../state/store'
import { trackerMayLogOut } from '../tracker/role.js'

export async function logOut(): Promise<boolean> {
  const go = await trackerMayLogOut(() => { setPage('tracker'); notify() })
  if (!go) return false
  resetSession(null); notify()
  return true
}
