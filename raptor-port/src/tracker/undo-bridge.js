/* THE TRACKER'S UNDO, REACHABLE FROM RAPTOR'S TOP BAR WITHOUT LOADING THE TRACKER ([UNDO-TOPBAR], owner D349 (2),
   28 Sep 26 — "the Tracker's own Undo and Redo move to the top bar too", still taking back the Tracker's own changes).
   The same no-import shape as role.js and people.js: Raptor's top bar reads this file, and core.js registers its undo
   functions here at the end of its init, so the Tracker's ~280 KB chart engine stays out of every Raptor visit
   (tracker.test.tsx guards that Raptor never imports core.js).

   The Tracker's own header draws no pair: the top bar is the only place it is drawn. Until [TRK-STANDALONE-LEFTOVERS]
   (5 Nov 26) a `hosted` flag here, set by the page seam, told the header to leave its own pair out — the standalone
   Tracker, never hosted, kept it; D1538 retired the standalone Tracker, and the flag and that pair went. */
let API = null
let VERSION = 0
const subs = new Set()
export function setTrackerUndo(api) { API = api; pingTrackerUndo() }
export function trackerUndoApi() { return API }
export function pingTrackerUndo() { VERSION++; subs.forEach(f => { try { f() } catch (_) { /* a listener's fault stays its own */ } }) }
export function onTrackerUndo(f) { subs.add(f); return () => { subs.delete(f) } }
export function trackerUndoVersion() { return VERSION }
