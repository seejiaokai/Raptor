/* THE TRACKER'S UNDO, REACHABLE FROM RAPTOR'S TOP BAR WITHOUT LOADING THE TRACKER ([UNDO-TOPBAR], owner D349 (2),
   28 Sep 26 — "the Tracker's own Undo and Redo move to the top bar too", still taking back the Tracker's own changes).
   The same no-import shape as role.js and people.js: Raptor's top bar reads this file, and core.js registers its undo
   functions here at the end of its init, so the Tracker's ~280 KB chart engine stays out of every Raptor visit
   (tracker.test.tsx guards that Raptor never imports core.js).

   `hosted` — set by Raptor's page seam (TrackerPage.tsx): the Tracker is drawn inside Raptor, whose top bar carries its
   pair. The STANDALONE Tracker (it will be exported back out on its own — the Tracker's §Architecture) never sets it, so
   its own header keeps drawing its ↶ ↷, as the "+ Add with no roster" feature degrades (Fable's red team 3). */
let API = null
let VERSION = 0
let HOSTED = false
const subs = new Set()
export function setTrackerUndo(api) { API = api; pingTrackerUndo() }
export function trackerUndoApi() { return API }
export function pingTrackerUndo() { VERSION++; subs.forEach(f => { try { f() } catch (_) { /* a listener's fault stays its own */ } }) }
export function onTrackerUndo(f) { subs.add(f); return () => { subs.delete(f) } }
export function trackerUndoVersion() { return VERSION }
export function setTrackerHosted(v) { HOSTED = !!v }
export function trackerHosted() { return HOSTED }
