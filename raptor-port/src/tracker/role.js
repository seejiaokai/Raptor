/* THE TRACKER'S LOGIN SEAM, on its own so Raptor can reach it without loading
   the Tracker (7 Sep 26). Raptor's resetSession calls it at every login and
   logout — long before (and whether or not) the Tracker tab is ever opened.
   Importing core.js for that would drag the whole chart engine and its
   syllabus data (~280 KB) into Raptor's first download, which is exactly what
   the tab's lazy chunk exists to avoid. So it lives here, a few lines with no
   imports; core.js subscribes when it eventually loads.

   It carried a FILE LOCK from 7 Sep 26 (the owner's second word: everyone
   edits, "except the file portion which is admin only"), written from the
   login and the admin's view-as flip. SUPERSEDED 23 Sep 26 — D121: "For the
   tracker, admin and member should have the same access authority." The lock
   is gone; the Tracker reads no role, and the File menu is everyone's.

   What stays is the login SESSION. Undo is per login session and never
   reaches another user (owner, 13 Sep 26), so core.js ends its session on
   this signal — the history, the open windows and the modes the last person
   left. The [HUMAN-RETEST] walk (23 Sep 26, F10) found a member undoing the
   admin's mark through a history that had survived the logout. The file name
   is kept so the seam's one import path does not move. */
const sessionSubs = new Set()
export function endTrackerSession() { sessionSubs.forEach(f => { try { f() } catch (_) {} }) }
export function onTrackerSessionEnd(f) { sessionSubs.add(f); return () => sessionSubs.delete(f) }

/* ASK BEFORE A LOGOUT (owner, 23 Sep 26 — D129): logging out with unsaved chart
   edits asks Save / Discard / Stay first, so the next person on the browser
   never lands on someone else's half-done chart (the F10 fix had kept it waiting
   behind ✓ Save changes for whoever signed in next). Raptor's Logout awaits this
   BEFORE resetSession; core.js answers once it has loaded (a Tracker never
   opened has nothing unsaved). `show` brings the Tracker tab to the front first,
   so the question is asked over the chart it is about, whatever page the person
   pressed Logout on. Resolves true to log out, false to stay. */
let beforeLogout = null
export function onBeforeTrackerLogout(f) { beforeLogout = f }
export async function trackerMayLogOut(show) {
  if (!beforeLogout) return true
  try { return (await beforeLogout(show)) !== false } catch (_) { return true }
}
