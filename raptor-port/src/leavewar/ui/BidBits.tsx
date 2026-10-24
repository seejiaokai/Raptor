/* ROUND 3 OF THE BID WINDOWS — the pieces the one-day window, the drag-selection window and the day's list share (his
   D1311 direction, D1332 / D1334 approved whole; drawn by scripts/handpass/lw-declutter-look.mjs and lw-twoday-look.mjs):

   · ApproveSwitch — "Approve what I enter" as the app's own switch (the Inputs window's "Several people" look, `.pp-sw`),
     in the title bar before ✕ (D1302 narrowing D1187's tick);
   · useApproveMemory — its choice REMEMBERED per admin on this device until he changes it (D1302): left off, it stays off
     in every bid window he opens; on by default (D1186). A view convenience in the browser's own storage, never a record:
     read and written inside a try, the window working as ruled without it (the Manning fold's way — Matrix, D1258);
   · MoreButton — the "⋯" in the fourth place of the CSE · OD · UNA row (D1326), the size of the buttons beside it,
     opening a small menu UPWARD over the window: Grant OIL in OIL given's green (D1320), Post out, Post in. Escape closes
     the menu first, then the window; a press outside closes it (the popup rule); the keyboard goes back to the ⋯;
   · EntryBox — an entry's code drawn as its coloured box, as the grid draws it, in the Legend's own frame (D1327, his
     lesson 25): the day's list leads each entry with it;
   · compactSpan — the drag window's dates in a shorter voice ("9–11 Nov", round 3's drawing). */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { boxText, kindOf } from '../engine'
import { getState } from '../state/store'

/** the key his choice is kept under — per person on the device (one admin's choice is never another's) */
const approveKey = (viewer: string | null | undefined) => `lw:approve:${viewer || '-'}`   // '-': an admin with no row of his own on the war (D1223's URHO) keeps it for the device

/** the admin's "Approve what I enter", as last left on this device (on where he never changed it — D1186) */
export function readApprove(viewer = getState().viewer): boolean {
  try { return localStorage.getItem(approveKey(viewer)) !== 'off' } catch { return true }
}

/** [on, set]: the window's switch, started from what he last left and written back on each change (D1302) */
export function useApproveMemory(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(() => readApprove())
  const set = (v: boolean) => {
    setOn(v)
    try {
      const k = approveKey(getState().viewer)
      if (v) localStorage.removeItem(k); else localStorage.setItem(k, 'off')
    } catch { /* no storage here: the switch still works for this window */ }
  }
  return [on, set]
}

/** "Approve what I enter" — the app's switch (role switch, its state in `aria-checked`) */
export function ApproveSwitch({ on, onChange, testid }: { on: boolean; onChange: (on: boolean) => void; testid: string }) {
  return (
    <button type="button" className={`pp-sw bp-sw${on ? ' on' : ''}`} role="switch" aria-checked={on} data-testid={testid}
      onClick={() => onChange(!on)}>
      <span className="pp-sw-dot" aria-hidden="true" />Approve what I enter
    </button>
  )
}

export interface MoreItem { key: string; label: string; testid: string; cls?: string; title?: string; onPick: () => void }

/** The ⋯ and its menu (D1326, D1320). Drawn only with something in it — a member has none of the three, so his row keeps
 *  the place empty. The menu opens upward over the window, its right edge on the ⋯'s. */
export function MoreButton({ items, testid, place = 'col4' }: { items: MoreItem[]; testid: string; place?: string }) {
  const [open, setOpen] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const close = (refocus: boolean) => { setOpen(false); if (refocus) btn.current?.focus() }
  useEffect(() => {
    if (!open) return
    /* Escape takes the menu first, then (a second press) the window: caught on the WINDOW in its capture phase, which runs
       before the window's own listener on the document (Sheet.tsx), and stopped there */
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); close(true) } }
    /* a press outside the menu and the ⋯ closes it (owner, 4 Sep 26 — the popup rule) — and ONLY closes it: the click that
       follows that press is caught here and goes no further, as a tap behind a window only closes the window (its scrim).
       Round 3's FULL check: with the menu open, a tap on LL beside it closed the menu AND placed a leave. Caught once, and
       let go after a moment, so a press that never became a click cannot swallow a later one. */
    const down = (e: PointerEvent) => {
      const t = e.target as Node | null
      if (t && (menu.current?.contains(t) || btn.current?.contains(t))) return
      const swallow = (c: MouseEvent) => { c.stopPropagation(); c.preventDefault(); document.removeEventListener('click', swallow, true) }
      document.addEventListener('click', swallow, true)
      window.setTimeout(() => document.removeEventListener('click', swallow, true), 700)
      close(false)
    }
    window.addEventListener('keydown', key, true)
    document.addEventListener('pointerdown', down, true)
    return () => { window.removeEventListener('keydown', key, true); document.removeEventListener('pointerdown', down, true) }
  }, [open])
  if (!items.length) return null
  return (
    <span className={`bp-more-wrap ${place}`}>
      <button ref={btn} type="button" className="tchip bp-more" data-testid={testid} aria-label="More" title="Grant OIL, Post out, Post in"
        aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>⋯</button>
      {open && (
        <div ref={menu} className="bp-menu" role="menu" data-testid={`${testid}-menu`}>
          {items.map(it => (
            <button key={it.key} type="button" role="menuitem" className={`dchip bp-menu-item${it.cls ? ` ${it.cls}` : ''}`}
              data-testid={it.testid} title={it.title} onClick={() => { setOpen(false); it.onPick() }}>{it.label}</button>
          ))}
        </div>
      )}
    </span>
  )
}

/** An entry's code drawn as the grid draws its box (look F — `c k-<kind> s-<fill> <place>`), in the Legend's frame. */
export function EntryBox({ code, fill, place, auto = false, marks = '' }: {
  code: string
  fill: 'a' | 'w' | 'r'
  place: 'whole' | 'top' | 'bot'
  /** the app's own OIL credit prints its star (D1306) */
  auto?: boolean
  /** the grid's edges on it — 'raptor' (filed on the Inputs page), 'moved' */
  marks?: string
}): ReactNode {
  const t = boxText(code, auto)
  return (
    <span className="leg-box dl-box" aria-hidden="true">
      <span className={`c k-${kindOf(code)} s-${fill} ${place}${t.replace('*', '').length > 2 ? ' wide' : ''}${marks ? ` ${marks}` : ''}`}>{t}</span>
    </span>
  )
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** "9–11 Nov" (one month), "30 Nov – 2 Dec" (one year), "30 Dec 26 – 2 Jan 27" (across a year's end, where only the year
 *  tells the span from its mirror); one day reads "9 Nov". The window's own title — the one-day window's "Tue 3 Nov"
 *  carries no year either. */
export function compactSpan(from: string, to: string): string {
  const d = (iso: string) => Number(iso.slice(8, 10))
  const m = (iso: string) => MONTHS[Number(iso.slice(5, 7)) - 1]
  if (from === to) return `${d(from)} ${m(from)}`
  if (from.slice(0, 4) !== to.slice(0, 4)) return `${d(from)} ${m(from)} ${from.slice(2, 4)} – ${d(to)} ${m(to)} ${to.slice(2, 4)}`
  if (from.slice(0, 7) === to.slice(0, 7)) return `${d(from)}–${d(to)} ${m(to)}`
  return `${d(from)} ${m(from)} – ${d(to)} ${m(to)}`
}
