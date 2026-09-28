/* THE SAVED / SAVING / NOT SAVED INDICATOR — the postman's one visible
   surface (spec §indicator). Hidden while saved; "Saving…" while queued or
   in flight; "Not saved — Retry" when a letter has failed and is retrying. */
import { useLayoutEffect, useRef, useSyncExternalStore } from 'react'
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

/* IT FLOATS JUST UNDER THE BAR ([LW-FIGSEL-FLAKE], 28 Sep 26 — why: scheduler.css `.topbar > .savestat`), so its top
   is the bar's bottom, measured each time it comes up and on a resize while it is up: the bar is one line or two by page
   and width. Never above the screen's own top edge. */
function useUnderTheBar(el: { current: HTMLElement | null }, s: Status) {
  useLayoutEffect(() => {
    const n = el.current
    if (!n) return
    const place = () => {
      const bar = n.closest('.topbar')
      if (bar) n.style.top = `${Math.max(6, Math.round(bar.getBoundingClientRect().bottom) + 6)}px`
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [el, s])
}

export function SaveStatus() {
  const s = useSyncExternalStore(subscribe, read, read)
  const ref = useRef<HTMLSpanElement>(null)
  useUnderTheBar(ref, s)
  if (s === 'saved') return null
  if (s === 'failed') {
    return (
      <span className="savestat failed" role="status" ref={ref}>
        Not saved — <button type="button" onClick={() => { void source?.flush() }}>Retry</button>
      </span>
    )
  }
  return <span className="savestat" role="status" ref={ref}>Saving…</span>
}
