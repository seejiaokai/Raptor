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
/* THE TRACKER'S ONE ADMIN GATE (owner D1014, 18 Oct 26 — narrows D121): the flex settings — their figures and their
   on / off switch (D1006) — are an admin's alone to change; everything else in the Tracker stays everyone's. So the
   Tracker reads ONE answer about the signed-in person again, "is he an admin?", and only for that. It crosses here,
   with no imports, for the reason the rest of this file does (Raptor's logout and store read this file, and must not
   pull the Tracker's chart engine in with it): Raptor's side (peoplewire.ts) hands in a function that
   asks Raptor's one permissions module (state/perms.ts) each time — the session can change under an open tab (logout,
   the admin's member view). The page seam wires it as its chunk loads, before the Tracker is first drawn, so nobody
   wired is only a unit test that never loads the page: the answer is yes, the same answer Raptor's side gives the
   headless engine (peoplewire.ts trackerAdminForTracker) — the standalone Tracker's reason, its one user being everyone,
   went with D1538 ([TRK-STANDALONE-LEFTOVERS], 5 Nov 26). The command gate still refuses a member's write inside Raptor (perms.ts
   COMMAND_OPS 'trk.flex' — a Setting, the admin's), so this is the screen's answer, never the only lock. */
let adminFn = null
export function setTrackerAdmin(fn) { adminFn = typeof fn === 'function' ? fn : null }
export function trackerIsAdmin() { if (!adminFn) return true; try { return !!adminFn() } catch (_) { return false } }

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

/* ASK BEFORE A PICK TAKES THE TRACKER AWAY (multi-squadron batch 1's second half §16 D2′; his D2318 — the drawing f2d):
   the Tracker keeps the squadron it loaded until the next sign-in, so a pick in the Schedules menu (or a bell tap) that
   moves his own pages off it leaves it read only or hidden — and unsaved chart edits could no longer be saved. So the pick
   asks first, the sign-out's question with its own words: "Save them before switching to 142?", Save them / Discard them /
   Stay. Asked WHERE HE IS — never jumping to the Tracker page first (core.js raises it over any page). Raptor's pick
   (state/pick.ts, state/belltap.ts) calls trackerSwitchAsk: null — nothing to ask (no Tracker loaded, no unsaved edit),
   the pick goes on at once; else a promise, true to go on, false to stay. core.js registers { needs, ask }. */
let beforeSwitch = null
export function onBeforeTrackerSwitch(f) { beforeSwitch = f && typeof f.needs === 'function' && typeof f.ask === 'function' ? f : null }
export function trackerSwitchAsk(toNum) {
  if (!beforeSwitch) return null
  try {
    if (!beforeSwitch.needs()) return null
    return Promise.resolve(beforeSwitch.ask(String(toNum))).then(v => v !== false, () => true)
  } catch (_) { return null }
}
