/* IS A SAVE STILL WAITING? (the fresh code read of 4 Nov 26, on Retry for a failed page download — ui/pageload.tsx).
   A reload with a save not yet landed asks the browser's own "Leave site?" (storage/boot.ts guardUnload) — and Safari on an
   iPhone never asks, so there the save would be lost unasked. Retry therefore does not reload while one waits; the save
   band already tells him why. The postman is handed over once, at the app's start (main.tsx), beside the unload guard. */
import type { Postman } from './postman'

let postman: Pick<Postman, 'status'> | null = null
export function watchSaves(p: Pick<Postman, 'status'> | null): void { postman = p }
/** A save failed, or written and not yet sent. A save in flight ('saving') is on its way, as the unload guard reads it. */
export function saveWaiting(): boolean {
  const s = postman?.status
  return s === 'failed' || s === 'unsaved'
}
