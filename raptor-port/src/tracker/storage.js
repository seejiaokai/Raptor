/* THE TRACKER'S STORAGE DOORWAY (7 Sep 26, the Tracker merge).

   The standalone app reached its data through two stacked layers —
   sync/cloud.js (Dataverse / Firebase) over sync/local.js (a SharePoint file,
   falling back to localStorage). Neither ever switched on outside the hosts it
   was written for, and inside Raptor the SharePoint probes would have been two
   404s on every load for nothing. So this ONE small module is what the app now
   talks to, with the exact async get/set/delete/list shape core.js already
   expected — and it is the seam the shared database replaces when it arrives
   (owner, 7 Sep 26: "I'll add the database eventually"), the same role
   leavewar/state/storage.ts and HOOKS.storeBackend play for the other two
   stores. Nothing above this line knows where a key actually lives.

   Inside Raptor every key lands on the whiteboard's `tracker` records (`raptor:tracker/*` on the built site). A
   browser that used the standalone Tracker, or this tab before the storage seam, kept its records under the old
   `ocu:` prefix: the browser backend brings those in once (storage/browser.ts), never this doorway. THIS IS THE RECORD
   (9 Sep 26): the owner's .json file was the authoritative copy and this layer
   its cache until the storage seam made the store durable; the file is now a
   format the File menu reads in (Import) or writes out (Export),
   never a second source of truth — app/core.js, the File-menu note. */

/* THE PLUGGABLE TARGET (8 Sep 26, the storage seam). Raptor's one boot (src/boot.ts — the one main.tsx runs, on every
   backend: the browser's, and memory for dev, tests and ?fresh=1) plugs the whiteboard in through setStorageImpl before
   anything else, and main.tsx draws the app only after that boot — so the running app always has its target
   (storage.test.ts pins both).
   With nothing plugged in — only a unit test that never runs the boot — the records are kept in memory for the life of
   the page, as the app's own memory store keeps them, and nothing is read from or written to the browser's storage.
   Until [TRK-STANDALONE-LEFTOVERS] (5 Nov 26) that case wrote the browser's storage under `ocu:`, the standalone app's
   way; the Tracker is never exported again (owner D1538), so only the memory is left. Unplugging (setStorageImpl(null))
   starts an empty memory. Return shapes are the same either way — core.js cannot tell which is behind it. */
function memoryTarget() {
  const m = new Map()
  return { get: k => (m.has(k) ? m.get(k) : null), set: (k, v) => { m.set(k, v) }, remove: k => { m.delete(k) }, keys: () => [...m.keys()] }
}
let target = memoryTarget()   // { get(k), set(k, v), remove(k), keys() } — sync, unprefixed
export function setStorageImpl(t) { target = t || memoryTarget(); boundUnit = null; held = false }

/* ONE SQUADRON'S TRACKER (multi-squadron batch 1, step 4 — the plan §3.4 "The Leave War and the Tracker — each a whole
   world per unit"). Each squadron keeps a Tracker of its own — its courses, its chart catalogue, each chart's
   definition, layout and ball details, its flex settings, its marks — never one Tracker filtered. Raptor's boot hands
   this doorway a MAKER of each unit's door (storage/adapters.ts trackerTarget(wb, unit): every key stored under its unit,
   `u149@v3:master:syls`) and a way to ask whose squadron is signed in, and the doorway binds the squadron of his own
   pages (state/perms.ts pageUnit('own') — his home, or a master admin's or Plan holder's pick: D2197, D2395) at the moment
   the Tracker first loads (core.js init → markStorageLoaded) — never as the page's code downloads, which a desktop does
   in the background before anyone signs in. Nothing above
   this line knows a squadron exists: it reads and writes `v3:master:syls` as it always has, so a deleted ball, an
   imported chart, a flex setting or a course sweep of 142's can never reach 149's records.
   ONCE LOADED THE DOOR MOVES ONLY THROUGH core.js (his D2395, 23 Nov 26: the Tracker follows the squadron picked, no
   sign-out). The records in memory are one squadron's, and writing them through another's door would copy one squadron's
   Tracker into the other's, so core.js empties its memory first (its followUnit) and a bare bind to another unit once
   loaded is still refused. */
let maker = null      // unit => target — Raptor's boot
let unitNow = null    // () => the signed-in person's own unit — Raptor's boot
let boundUnit = null  // the unit whose door `target` is, once bound
let loaded = false    // core.init has begun reading through the door
export function setStorageMaker(m, whose) { maker = typeof m === 'function' ? m : null; unitNow = typeof whose === 'function' ? whose : null }
/** bind the doorway to `unit`'s Tracker — true when it now is; false (nothing changed) where the Tracker already
 *  loaded another unit's, or no maker was handed over (a unit test that plugs one target in itself) */
export function bindStorageUnit(unit) {
  if (!maker || !unit) return false
  if (boundUnit === unit) return true
  if (loaded && boundUnit != null) return false
  target = maker(unit); boundUnit = unit
  return true
}
/* THE TRACKER FOLLOWS THE PAGE'S SQUADRON (the reshape plan §3.2 A-iv — state/store.ts enterSquadron's third step; his
   D2395, replacing D2318's "keeps the squadron it opened with until sign-out"). Before the Tracker has loaded, nothing of
   any squadron's Tracker is in memory, so the doorway simply follows: a unit already bound is re-bound to `unit`
   ('bound'), and with none bound the first load binds the page's squadron itself through the whose reader
   (markStorageLoaded — 'later'). ONCE LOADED it asks core.js, which holds the records (`mem`, the course, chart and student
   lists, the flex settings, its Undo): 'moved' — core.js is leaving this squadron and loading `unit`'s, the door moving only
   once everything still running on this one has finished; 'held' — chart work is open that can only be answered on this
   squadron (`mayHold`: his own move at midnight with the chart editor or unsaved edits, D2243; the member view over his
   unsaved edits), so the door waits and core.js moves it the moment that work is gone. 'none' — no maker (a unit test
   that plugs one target in itself) or no unit; 'kept' — loaded with no core.js registered (a test of this file alone). */
let follower = null   // { follow(unit, mayHold) → 'moved' | 'held', stay() } — core.js
export function onStorageFollow(f) { follower = f && typeof f.follow === 'function' && typeof f.stay === 'function' ? f : null }
export function rebindStorageUnit(unit, mayHold = false) {
  if (!maker || !unit) return 'none'
  if (boundUnit === unit) { if (follower) follower.stay(); return 'same' }
  if (loaded) return follower ? follower.follow(unit, !!mayHold) : 'kept'
  if (boundUnit == null) return 'later'
  target = maker(unit); boundUnit = unit
  return 'bound'
}
/* core.js's alone, at the one safe moment of a move: its memory of the old squadron is gone and nothing of the old
   squadron is still running. Whoever reads a squadron's roster from the door (tracker/peoplewire.ts) is told at once. */
const doorMoved = new Set()
export function onStorageDoorMoved(f) { doorMoved.add(f); return () => doorMoved.delete(f) }
export function moveStorageDoor(unit) {
  if (!maker || !unit || boundUnit === unit) return false
  target = maker(unit); boundUnit = unit
  for (const f of [...doorMoved]) { try { f() } catch (_) { /* a listener's fault stays its own */ } }
  return true
}
/* the door is waiting on chart work of its own squadron ('held', above): only then does a Tracker stand on a squadron that
   is not the page's own for longer than a move takes (state/store.ts publishBands) */
let held = false
export function setStorageHeld(on) { held = !!on }
export const storageHeld = () => held
/** the squadron the page's own pages are on now, as Raptor's boot answers it (null with none wired) — asked again when a
 *  hold ends, because what the hold waited for may no longer be where his pages are */
export function pageOwnUnit() { try { return unitNow ? unitNow() || null : null } catch (_) { return null } }
/** the unit whose Tracker the doorway reads (null — none bound: the target handed in whole) */
export const storageUnit = () => boundUnit
/** core.init calls this before its first read: the signed-in person's own pages' squadron is bound now (unless one
 *  already is), and from then on the door moves only through core.js (above) */
export function markStorageLoaded() {
  if (!loaded && boundUnit == null && unitNow) { try { bindStorageUnit(unitNow()) } catch (_) { /* no session reader: the target as handed in */ } }
  loaded = true
}

export const storage = {
  async get(k) { const v = target.get(k); return v == null ? null : { key: k, value: v } },
  async set(k, v) { target.set(k, v); return { key: k, value: v } },
  async delete(k) { target.remove(k); return { key: k, deleted: true } },
  async list(prefix) {
    const keys = target.keys()
    return { keys: prefix ? keys.filter(x => x.startsWith(prefix)) : keys }
  },
}

/* WHETHER WHAT WAS WRITTEN HAS REALLY BEEN SAVED ([TRK-SAVE-FAIL-SAYS-SAVED], 17 Oct 26). Every write above lands in
   Raptor's in-memory whiteboard at once, so it always "succeeds" here; the copy that survives a reload is written after,
   by Raptor's background saver, and when that fails Raptor's top bar says "Not saved — keep this page open". The
   Tracker never heard of it, and its corner said "● saved" beside that warning. So the page that plugs the storage in
   also hands over the saver's state (main.tsx — the saver itself, or anything with the same two members):
   'saved' | 'saving' | 'unsaved' | 'failed', and a way to hear when it changes. With none (only a unit
   test that never runs main.tsx) every write is saved when it lands, as before. Part of this doorway, not a seam of its
   own: it is the same storage, read for its outcome. */
let health = null   // { status, onStatus(fn) } — Raptor's postman
const healthSubs = new Set()
export function setSaveHealth(h) {
  health = h && typeof h === 'object' ? h : null
  if (health && typeof health.onStatus === 'function') health.onStatus(() => { for (const f of [...healthSubs]) { try { f() } catch (_) {} } })
  for (const f of [...healthSubs]) { try { f() } catch (_) {} }
}
export function saveHealth() {
  try { const s = health && health.status; return s === 'failed' || s === 'saving' || s === 'unsaved' ? s : 'saved' } catch (_) { return 'saved' }
}
export function onSaveHealth(f) { healthSubs.add(f); return () => healthSubs.delete(f) }

/* …AND WHETHER THE BROWSER KEEPS ANYTHING AT ALL (owner D1901, 8 Nov 26 — [TRK-NOSTORE-SAVED]). Where the browser refuses
   its storage, Raptor runs on memory alone: every write lands and "saves", yet a reload loses it, so the corner's
   "● saved" was untrue. main.tsx hands over the answer once (storage/boot.ts storageRefused); while it is false every
   page carries Raptor's "Not kept" band and the corner says nothing of saving (core.js saveWords). With none, the
   records are kept, as before. */
let kept = true
export function setStorageKept(k) { kept = k !== false }
export const storageKept = () => kept

/* The two sync verbs the app still calls around a syllabus write. Every write
   above lands synchronously, so there is nothing to flush and nothing newer to
   pull — kept as no-ops so the call sites in core.js stay byte-identical for
   the day a real backend gives them work to do. */
export const flushNow = async () => {}
export const loadLatest = async () => {}
