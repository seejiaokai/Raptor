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
/** Retry — send what failed again now */
export const retrySaves = (): void => { void source?.flush() }
