/* IS A SAVE STILL WAITING? (the fresh code read of 4 Nov 26, on Retry for a failed page download — ui/pageload.tsx).
   A reload with a save not yet landed asks the browser's own "Leave site?" (storage/boot.ts guardUnload) — and Safari on an
   iPhone never asks, so there the save would be lost unasked. Retry therefore does not reload while one waits; the save
   band already tells him why. The postman is handed over once, at the app's start (main.tsx), beside the unload guard. */
import type { Postman } from './postman'

type Watched = Pick<Postman, 'status'> & Partial<Pick<Postman, 'flush' | 'onStatus'>>
let postman: Watched | null = null
export function watchSaves(p: Watched | null): void { postman = p }
/** call `fn` once, the first time nothing waits any more (a Retry landed, or the saver got through by itself) — the
    sign-out's owed reload (ui/logout.ts). Returns the way to stop listening; with no saver to listen to, never fires. */
export function onSavesLanded(fn: () => void): () => void {
  const p = postman
  if (!p?.onStatus) return () => {}
  let off: (() => void) | null = null
  off = p.onStatus(() => {
    if (saveWaiting() || p.status === 'saving') return
    off?.(); off = null
    fn()
  })
  return () => { off?.(); off = null }
}
/** send every save still queued now — sign-out's last step before it reloads the page (ui/logout.ts, multi-squadron
    step 2); a refused save stays waiting, which saveWaiting then says */
export async function flushSaves(): Promise<void> {
  try { await postman?.flush?.() } catch { /* a refused save stays waiting: saveWaiting reads it */ }
}
/** A save failed, or written and not yet sent. A save in flight ('saving') is on its way, as the unload guard reads it. */
export function saveWaiting(): boolean {
  const s = postman?.status
  return s === 'failed' || s === 'unsaved'
}
/* THE SIGN-IN'S HOLD (batch 1's second half §8 — step G, his D2205 M2, D2322; ui/Login.tsx): a sign-in is held while the
   last change on this page has not landed — waiting, or still on its way — so it is saved under the last person's name,
   never the next one's; and its line says "not saved yet" once a save was refused */
/** a change on this page has not landed yet: waiting (above) or in flight */
export function saveSettling(): boolean { return saveWaiting() || postman?.status === 'saving' }
/** the last save was refused (the sign-in's line turns to "not saved yet — check the connection") */
export function saveRefused(): boolean { return postman?.status === 'failed' }
/** call `fn` on every change of the saver's state; returns the way to stop. No saver to listen to: never fires. */
export function onSaveStatus(fn: () => void): () => void {
  const p = postman
  return p?.onStatus ? p.onStatus(fn) : () => {}
}
