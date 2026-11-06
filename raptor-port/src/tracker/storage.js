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
export function setStorageImpl(t) { target = t || memoryTarget() }

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

/* The two sync verbs the app still calls around a syllabus write. Every write
   above lands synchronously, so there is nothing to flush and nothing newer to
   pull — kept as no-ops so the call sites in core.js stay byte-identical for
   the day a real backend gives them work to do. */
export const flushNow = async () => {}
export const loadLatest = async () => {}
