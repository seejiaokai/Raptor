// src/storage/reset.ts
/* STORAGE SCHEMA RESET (13 Sep 26, ARCH-STACK step 1A — Astra SID-05/07).
   Some persisted record SHAPES changed in a way old data cannot be read as:
   day-notes became { rid, t } objects (were bare strings) and a ground row's
   `src` became the input's stable id (was its content key, so an accepted input
   whose landing was keyed the old way no longer resolves). Under the owner's
   dev-phase rule (pre-promulgation, demo data — reset, don't migrate), a
   returning browser's pre-1A blob is CLEARED so the seed reloads fresh, rather
   than migrated. The migration proper happens once, server-side, at the DB step. */
import type { Backend, Collection, Snapshot } from './backend'

/* bumped whenever a persisted shape changes incompatibly. 1 = step 1A.
   Pre-1A data is unstamped, which reads as 0. */
export const SCHEMA_VERSION = 1
const STAMP: [Collection, string] = ['settings', 'schema']

/* the collections carrying a 1A-incompatible shape: `weeks` holds the days
   (old note strings, content-key ground.src) AND the nested publish
   snapshots/drafts; `inputs` holds accept state whose landing lived on a week.
   Cleared together so an accepted input can never survive without its landing.
   people/settings/leavewar/tracker carry no 1A shape and are kept; day templates
   are coerced on load (daytpl.sanitiseBlob), so they need no reset. */
const RESET: Collection[] = ['inputs', 'weeks']

function storedVersion(snap: Snapshot): number {
  const v = snap[STAMP[0]] && snap[STAMP[0]][STAMP[1]]
  if (!v) return 0
  try { const n = Number(JSON.parse(v)); return Number.isFinite(n) ? n : 0 } catch { return 0 }
}

async function writeStamp(backend: Backend, snap: Snapshot): Promise<void> {
  const json = JSON.stringify(SCHEMA_VERSION)
  await backend.put(STAMP[0], STAMP[1], json)
  snap[STAMP[0]] = { ...(snap[STAMP[0]] || {}), [STAMP[1]]: json }
}

/* Reset any pre-1A persisted scheduler data BEFORE the whiteboard or hydration
   can see it, and stamp the new version LAST — only after the durable deletes are
   verified gone (SID-07). Runs against the real Backend, never the concurrent,
   failure-swallowing Postman queue.

   Restart-safe, and it never leaves the app half-reset (Astra SID-IR-02): a
   failed delete/verify/stamp is PROPAGATED, so bootStorage rejects and main.tsx
   shows its Retry screen — the app never proceeds to a write-enabled state on an
   unstamped store, where new (current-format) work the user then saved would be
   wiped by the next boot's retry. The in-memory snapshot is also cleared up front,
   so nothing pre-1A can hydrate even on the path to the throw. Mutates `snap`. */
export async function resetPreSchema(backend: Backend, snap: Snapshot): Promise<void> {
  if (storedVersion(snap) >= SCHEMA_VERSION) return
  const pending: Array<[Collection, string]> = []
  for (const c of RESET) { for (const id of Object.keys(snap[c] || {})) pending.push([c, id]); snap[c] = {} }
  // a fresh/empty store has nothing to clear: just stamp it so later boots skip.
  if (pending.length === 0) { await writeStamp(backend, snap); return }
  for (const [c, id] of pending) await backend.remove(c, id)   // awaited durable deletes
  const after = await backend.loadAll()                        // verify gone, THEN stamp
  if (!RESET.every(c => Object.keys(after[c] || {}).length === 0)) throw new Error('storage reset: cleanup not durable')
  await writeStamp(backend, snap)
}
