/* THE TRACKER'S ROLE FLAG, on its own so Raptor can set it without loading
   the Tracker (7 Sep 26). Raptor's resetSession/toggleRole write the flag at
   every login, logout and view-as flip — long before (and whether or not) the
   Tracker tab is ever opened. Importing core.js for that would drag the whole
   chart engine and its syllabus data (~280 KB) into Raptor's first download,
   which is exactly what the tab's lazy chunk exists to avoid. So the flag
   lives here, a few lines with no imports; core.js subscribes and mirrors it
   into its own `fileLocked` export when it eventually loads.

   WHAT IT GATES (owner, 7 Sep 26, second word — "make it allowed for both
   admin and member for all access, except the file portion which is admin
   only"): ONLY the file portion — ⇪ Import and ⤓ Export (the File menu since
   9 Sep 26). Marking, chart editing, students, courses, syllabi, dates, pace
   and lull periods are everyone's, exactly as in the standalone app. */
let locked = false
const subs = new Set()
export function isFileLocked() { return locked }
export function setFileLocked(v) {
  const next = !!v; if (next === locked) return
  locked = next
  subs.forEach(f => { try { f(locked) } catch (_) {} })
}
export function onFileLocked(f) { subs.add(f); return () => subs.delete(f) }

/* THE LOGIN SESSION, here for the same reason as the lock: Raptor's
   resetSession says "a session ended" at every login and logout without
   loading the Tracker. Undo is per login SESSION and never reaches another
   user (owner, 13 Sep 26), so core.js ends its session on this signal — the
   history, the open windows and the modes the last person left. The
   [HUMAN-RETEST] walk (23 Sep 26, F10) found a member undoing the admin's mark
   through a history that had survived the logout. */
const sessionSubs = new Set()
export function endTrackerSession() { sessionSubs.forEach(f => { try { f() } catch (_) {} }) }
export function onTrackerSessionEnd(f) { sessionSubs.add(f); return () => sessionSubs.delete(f) }
