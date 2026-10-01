/* THE GATE. The one place the app waits: loadAll, fill the whiteboard,
   start the postman, and only then may main.tsx run today's boot sequence
   and draw. A rejected loadAll boots nothing (main.tsx shows Retry). */
import type { Backend } from './backend'
import { Whiteboard } from './whiteboard'
import { Postman } from './postman'
import { MemoryBackend } from './memory'
import { BrowserBackend } from './browser'
import { RESET, wipeDue, resetPreSchema } from './reset'
import { refuseAhead, schemaOf } from './schema'
import { foldDue, runFold, targetFormat } from './fold'

export async function bootStorage(backend: Backend): Promise<{ wb: Whiteboard; postman: Postman }> {
  /* [ARCH-STACK-4] §22.2 — each step durable before the next.
     a. loadAll finishes an unfinished all-or-nothing group first; if it cannot,
        it overlays the group onto the snapshot and reports it as unfinished. */
  const snap = await backend.loadAll()
  /* [DB-READINESS] group A, phase 0 — a store written by a NEWER build is never touched: no wipe, no
     fold, no seed. The boot rejects and main.tsx asks for a reload (storage/schema.ts). */
  refuseAhead(schemaOf(snap), targetFormat())
  /* b. a version bump will wipe `inputs`/`weeks`/`leavewar`: FILTER the
        unfinished group to the collections the reset keeps and write that back
        as the journal BEFORE any reset removal runs — an interruption can then
        neither lose a preserved entry nor resurrect a reset one. A failed
        rewrite rejects the boot (the Retry screen), the old journal intact
        (§23.2). */
  const due = wipeDue(snap)
  const found = backend.unfinished()
  if (due && found) {
    const kept = found.filter(e => !RESET.includes(e.collection))
    if (kept.length !== found.length) await backend.writeJournal(kept.length ? kept : null)
  }
  /* clear any pre-1A persisted scheduler data and stamp the schema version BEFORE
     the whiteboard fills or the postman attaches (ARCH-STACK 1A, Astra SID-05/07):
     an incompatible shape must never reach hydration, and the durable cleanup must
     go through the real backend, not the postman's queued writes. */
  /* c. the reset removals, then the version stamp */
  await resetPreSchema(backend, snap)
  /* c2. [DB-READINESS] group A, phase 0 (plan §2.6) — THE FOLD: a format-5 store under a build that
        can convert EVERY old record is turned into one row per thing, one converter's durable group at
        a time (the started mark first, the stamp at 6 last — the group-A final read, Fable F3), before
        the whiteboard fills. Its first group carries every entry of an unfinished group no converter
        replaces, so nothing is left for the postman to retry. A store too full to take the largest
        group stops the boot with StoreFullError, nothing written (storage/fold.ts). */
  let unfinished = backend.unfinished()
  if (foldDue(snap)) { await runFold(backend, snap, unfinished); unfinished = null }
  const wb = new Whiteboard()
  wb.fill(snap)
  /* d. the (filtered) unfinished group becomes the postman's first, FAILED,
        group: the status reads "failed" until it lands, and every later write
        merges over it, so the next journal is always a superset of it (§21.2) */
  const postman = new Postman(backend, { initialFailed: unfinished })
  postman.attach(wb)
  return { wb, postman }
}

/* Which backend (spec §Backend choice): ?fresh=1 → Memory; tests or
   VITE_STORAGE=memory → Memory; `vite` dev → Memory unless
   VITE_STORAGE=browser; a built site → Browser, or Memory when browser
   storage cannot even be touched (locked-down / private browsing). */
export function chooseBackend(
  env: Record<string, any> = import.meta.env as any,
  search: string = typeof location !== 'undefined' ? location.search : '',
  ls?: Storage,
): Backend {
  if (/[?&]fresh=1(&|$)/.test(search)) return new MemoryBackend()
  if (env.MODE === 'test' || env.VITE_STORAGE === 'memory') return new MemoryBackend()
  if (env.DEV && env.VITE_STORAGE !== 'browser') return new MemoryBackend()
  try {
    const store = ls ?? localStorage
    void store.length
    return new BrowserBackend(store)
  } catch (e) {
    return new MemoryBackend()
  }
}

/* Leaving the page. FLUSH FIRST: the Browser backend writes inside put()
   before its first await, so every letter still in its 300 ms coalesce wait
   lands synchronously here and a reload right after an edit keeps the edit
   (8 Sep 26 bug pass: it was lost, and on a phone SILENTLY — iOS Safari never
   fires beforeunload; pagehide and a hidden visibilitychange are what it does
   fire, so they flush too). Then, only if letters are still unsent (a backend
   that has failed, or a genuinely asynchronous one), ask the browser's "are
   you sure?" — the only UI the postman has besides the indicator. A letter
   merely in flight after the flush is on its way and must not prompt. */
export function guardUnload(postman: Postman, win: Window = window): void {
  const flush = () => { void postman.flush() }
  win.addEventListener('pagehide', flush)
  win.addEventListener('visibilitychange', () => { if (win.document.visibilityState === 'hidden') flush() })
  win.addEventListener('beforeunload', e => {
    flush()
    const s = postman.status
    if (s !== 'failed' && s !== 'unsaved') return
    e.preventDefault()
    e.returnValue = ''
  })
}
