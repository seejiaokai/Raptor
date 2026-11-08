/* WHERE THE SAVED / SAVING / NOT SAVED INDICATOR READS FROM — the postman main.tsx hands it, and who is listening. Moved
   whole out of ui/SaveStatus.tsx (8 Nov 26, React Doctor's only-export-components: a file of screen parts exports only
   screen parts); SaveStatus.tsx draws from it. */
import type { Postman, SaveStatus as Status } from '../storage/postman'

let source: Postman | null = null
const subs = new Set<() => void>()
export function setSaveStatusSource(p: Postman): void {
  source = p
  p.onStatus(() => { for (const f of [...subs]) f() })
  for (const f of [...subs]) f()
}
export const subscribe = (fn: () => void) => { subs.add(fn); return () => { subs.delete(fn) } }
export const read = (): Status => (source ? source.status : 'saved')
export const readFailed = (): boolean => read() === 'failed'

/* WHETHER THIS BROWSER KEEPS ANYTHING (owner D1901, 8 Nov 26): false where it refuses its storage (storage/boot.ts
   storageRefused — main.tsx hands it over once, at the start). It never changes while the page is open. */
let kept = true
export function setStorageKept(k: boolean): void {
  kept = k
  for (const f of [...subs]) f()
}
/** Which band stands under the top bar: a failed save's "Not saved" (it can be retried, so it speaks first), else, in a
    browser that keeps nothing, "Not kept" (D1901), else none. Both take the same room, so every page, screen and window
    that makes room for the one makes it for the other. */
export type Band = 'failed' | 'nokeep' | null
export const readBand = (): Band => (readFailed() ? 'failed' : kept ? null : 'nokeep')
export const readBandUp = (): boolean => readBand() !== null
/** Retry — send what failed again now */
export const retrySaves = (): void => { void source?.flush() }
