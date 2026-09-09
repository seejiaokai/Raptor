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

   Keys keep their historical `ocu:` prefix, so a browser that used the
   standalone Tracker on the same origin keeps its data. THIS IS THE RECORD
   (9 Sep 26): the owner's .json file was the authoritative copy and this layer
   its cache until the storage seam made the store durable; the file is now a
   format the File menu reads in (Restore / Import) or writes out (Export),
   never a second source of truth — app/core.js, the File-menu note. */
const LP = 'ocu:'

/* A store that cannot be read (Safari private mode, a locked-down browser)
   degrades to "forgets on reload" rather than breaking the boot: core.js's own
   `mem` fallback keeps the session working. */
function ls() {
  try { return typeof localStorage !== 'undefined' ? localStorage : null } catch (_) { return null }
}

/* THE PLUGGABLE TARGET (8 Sep 26, the storage seam). Raptor's main.tsx
   plugs the whiteboard in through useStorageImpl; with no target (the
   standalone smoke, a test that never boots main) every verb keeps its
   localStorage path under `ocu:` exactly as before. Return shapes are
   identical either way — core.js cannot tell which is behind it. */
let target = null   // { get(k), set(k, v), remove(k), keys() } — sync, unprefixed
export function useStorageImpl(t) { target = t }

export const storage = {
  async get(k) {
    if (target) { const v = target.get(k); return v == null ? null : { key: k, value: v } }
    const s = ls(); if (!s) return null; const v = s.getItem(LP + k); return v == null ? null : { key: k, value: v }
  },
  async set(k, v) {
    if (target) { target.set(k, v); return { key: k, value: v } }
    const s = ls(); if (!s) throw new Error('no storage'); s.setItem(LP + k, v); return { key: k, value: v }
  },
  async delete(k) {
    if (target) { target.remove(k); return { key: k, deleted: true } }
    const s = ls(); if (s) s.removeItem(LP + k); return { key: k, deleted: true }
  },
  async list(prefix) {
    let keys = []
    if (target) keys = target.keys()
    else { const s = ls(); if (s) for (let i = 0; i < s.length; i++) { const k = s.key(i); if (k && k.startsWith(LP)) keys.push(k.slice(LP.length)) } }
    return { keys: prefix ? keys.filter(x => x.startsWith(prefix)) : keys }
  },
}

/* The two sync verbs the app still calls around a syllabus write. Every write
   above lands synchronously, so there is nothing to flush and nothing newer to
   pull — kept as no-ops so the call sites in core.js stay byte-identical for
   the day a real backend gives them work to do. */
export const flushNow = async () => {}
export const loadLatest = async () => {}
