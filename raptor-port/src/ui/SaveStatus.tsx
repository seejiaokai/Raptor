/* THE SAVED / SAVING / NOT SAVED INDICATOR — the postman's one visible
   surface (spec §indicator). Hidden while saved; "Saving…" while queued or
   in flight; "Not saved — keep this page open" with Retry when a letter has
   failed and is retrying.

   THE FAILED-SAVE WARNING HAS A BAND OF ITS OWN ([SAVE-NOTE-COVERS] — D586, D587, 5 Oct 26). It used to float under
   the bar's right end like "Saving…" does, over whatever each page keeps there: the name search box on both schedule
   pages (a phone tap on the box pressed Retry), the Tracker's ✓ Save changes (a click on it pressed Retry), Quals'
   filter, the Leave War's "+ New". Now the top bar grows by one line while a save has failed (`.topbar.save-failed`,
   set by Shell from `useSaveFailed`) and the warning fills that line, so the page moves down and nothing is covered.
   A full-screen surface that lies over the top bar — the scheduler board, the Inputs calendar, the Medical view —
   carries the same warning under its own bar (`SaveBand`), because there the bar's cannot be seen. A window, a sheet
   or the phone's menu is a short visit and has none: the bar's is there when it closes (D587).
   Pinned by e2e/save-note.spec.ts; the contract: docs/ui-contracts.md §The failed-save warning. */
import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react'
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
const readFailed = (): boolean => read() === 'failed'

/* ONE WARNING AT A TIME FOR A SCREEN READER AND THE KEYBOARD (Astra's read, F5). While a full-screen surface shows the
   warning under its own bar, the top bar's copy is still in the page beneath it — painted over, but a second
   `role="status"` and a second Retry to tab to. So each showing SaveBand counts itself in, and while any is counted the
   bar's copy is `inert` and hidden from readers; it keeps its room, so nothing moves when the surface closes. */
let covering = 0
const coverSubs = new Set<() => void>()
const subscribeCover = (fn: () => void) => { coverSubs.add(fn); return () => { coverSubs.delete(fn) } }
const readCover = (): boolean => covering > 0
const cover = (d: 1 | -1) => { covering += d; for (const f of [...coverSubs]) f() }

/** Has a save failed (and not yet landed)? Shell asks, to make room for the warning's band in the top bar. */
export function useSaveFailed(): boolean {
  return useSyncExternalStore(subscribe, readFailed, readFailed)
}

/* WHERE IT SITS IS MEASURED, because the bar is one line or two by page and width, and on a phone the bar is a sideways
   scroll box (so the note is `position:fixed`, or the box would clip it or carry it sideways):
   - "Saving…" floats just under the bar ([LW-FIGSEL-FLAKE], 28 Sep 26 — why: 17-save-status.css `.topbar > .savestat`):
     its top is the bar's bottom. Never above the screen's own top edge.
   - the failed-save band lies along the bar's own bottom line, inside the room `.topbar.save-failed` makes for it: its
     top is the bar's bottom less the band's height (and the bar's bottom border).
   Measured when it comes up, on a window resize, AND whenever the bar's own height changes — a page change takes the
   bar from one line to two with no resize, and the note used to stay at the old height, on top of the bar's second line
   (at 1366 wide: over the account button and Logout). */
function useFollowTheBar(el: { current: HTMLElement | null }, s: Status) {
  useLayoutEffect(() => {
    const n = el.current
    if (!n) return
    const bar = n.closest('.topbar') as HTMLElement | null
    if (!bar) return
    const place = () => {
      const bottom = Math.round(bar.getBoundingClientRect().bottom)
      n.style.top = s === 'failed'
        ? `${Math.max(0, bottom - n.offsetHeight - (parseFloat(getComputedStyle(bar).borderBottomWidth) || 0))}px`
        : `${Math.max(6, bottom + 6)}px`
    }
    place()
    window.addEventListener('resize', place)
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(place)
    ro?.observe(bar)
    return () => { window.removeEventListener('resize', place); ro?.disconnect() }
  }, [el, s])
}

/* the warning's words and its one button — the same in the top bar and under a full-screen surface's bar */
function Warning() {
  return (
    <>
      <span className="sv-msg"><span className="sv-ico" aria-hidden="true">⚠</span>Not saved — keep this page open</span>
      <button type="button" onClick={() => { void source?.flush() }}>Retry</button>
    </>
  )
}

export function SaveStatus() {
  const s = useSyncExternalStore(subscribe, read, read)
  const covered = useSyncExternalStore(subscribeCover, readCover, readCover)
  const ref = useRef<HTMLSpanElement>(null)
  useFollowTheBar(ref, s)
  if (s === 'saved') return null
  if (s === 'failed') return <span className="savestat failed" role="status" ref={ref} aria-hidden={covered || undefined} inert={covered || undefined}><Warning /></span>
  return <span className="savestat" role="status" ref={ref}>Saving…</span>
}

/** The same warning, IN THE FLOW of a full-screen surface, under that surface's own bar (D587). Nothing while saves work.
    `active` is false while its surface is closed but still drawn (the board stays in the page, hidden). */
export function SaveBand({ active = true }: { active?: boolean }) {
  const failed = useSaveFailed()
  useEffect(() => {
    if (!failed || !active) return
    cover(1)
    return () => cover(-1)
  }, [failed, active])
  if (!failed) return null
  return <div className="saveband" role="status"><Warning /></div>
}
