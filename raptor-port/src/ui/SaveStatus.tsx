/* THE SAVED / SAVING / NOT SAVED INDICATOR — the postman's one visible
   surface (spec §indicator). Hidden while saved; "Saving…" while queued or
   in flight; "Not saved — Retry" when a letter has failed and is retrying. */
import { useSyncExternalStore } from 'react'
import type { Postman, SaveStatus as Status } from '../storage/postman'

let source: Postman | null = null
const subs = new Set<() => void>()
export function setSaveStatusSource(p: Postman): void {
  source = p
  p.onStatus(() => { for (const f of [...subs]) f() })
  for (const f of [...subs]) f()
}
const subscribe = (fn: () => void) => { subs.add(fn); return () => { subs.delete(fn) } }
const read = (): Status => (source ? source.status : 'saved')

export function SaveStatus() {
  const s = useSyncExternalStore(subscribe, read, read)
  if (s === 'saved') return null
  if (s === 'failed') {
    return (
      <span className="savestat failed" role="status">
        Not saved — <button type="button" onClick={() => { void source?.flush() }}>Retry</button>
      </span>
    )
  }
  return <span className="savestat" role="status">Saving…</span>
}
