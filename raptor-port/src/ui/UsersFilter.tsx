/* ADMIN → USERS — THE FILTER BUTTON, ITS PANEL AND THE LINE OVER THE LIST (his D2335, D2307: built as drawn on 22 Nov —
   docs/mock/2026-11-22-msq-b1-screens/redraw-pieces.mjs `filterBtn`, pictures nfa, nfb, nfc, nfd; f5c-p for eight
   squadrons; D2306 the Role tick "Plans 149"). What each tick keeps, the count and the line's words:
   ui/usersfilter-model.ts.
   - The button: the app's own .abtn with a line funnel in the search box's stroke, "Filter", as tall as the search box
     beside it, on or off; while anything is ticked it looks switched on, in the app's own recipe (.fchip.on, the Logic
     page's filter): pale blue, blue words and funnel, blue border, with its count ("Filter · 2") (his D2401, narrowing
     D2335's primary look, which read as a button to press; the drawing docs/mock/2026-11-24-msq-new-words/filter-look/).
   - The panel, under the button over the list: a group a row of tick chips in Edit Schedule's chip look (.fchip / .on,
     "✓ " on a ticked one) — Seat, CAT, Role, and Squadron for a master admin; "Clear all" at its foot.
   - A click-open popup closes on a press outside it (the standing rule, 4 Sep 26) and on Escape, the keys back on the
     button (the design guide §2); a tick keeps it open, so several can be set at once.
   - The line over the list: "Showing 1 of 61 · Clear" — Clear takes every tick off. */
import { useEffect, useRef, useState } from 'react'
import { units } from '../state/units'
import { escCloses } from './sheetfocus'
import {
  SEAT_TICKS, ROLE_TICKS, roleWord, filterCount, toggleTick, NO_FILTER, type UsersFilter, type FilterGroup,
} from './usersfilter-model'
import { numOf, byNum } from './useraccess-model'

/* the panel's name in the Escape list: an opened row on the page asks it to answer first ((p), his D2396) */
export const FILTER_ESC = 'accFilterPanel'
function Funnel() {
  return (
    <svg className="od-funnel" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18l-7 8v6l-4 2v-8z" /></svg>
  )
}
function Chips(p: { g: FilterGroup; label: string; opts: { v: string; l: string }[]; f: UsersFilter; onChange: (f: UsersFilter) => void }) {
  const ticked = new Set<string>(p.f[p.g])
  return (
    <div className="od-fgrp" data-fgroup={p.g} role="group" aria-label={p.label}>
      <span className="mfield-lbl">{p.label}</span>
      <div className="od-fchips">
        {p.opts.map(o => {
          const on = ticked.has(o.v)
          return (
            <button key={o.v} type="button" className={'fchip' + (on ? ' on' : '')} aria-pressed={on} data-ftick={`${p.g}:${o.v}`}
              onClick={() => p.onChange(toggleTick(p.f, p.g, o.v))}>{on ? '✓ ' : ''}{o.l}</button>
          )
        })}
      </div>
    </div>
  )
}

/* `unit` — the page's squadron ("Plans 149"); `master` — a master admin, the Squadron group his alone; `cats` — the CAT
   chips (the CATs held on the list) */
export function UsersFilterBox(p: { f: UsersFilter; onChange: (f: UsersFilter) => void; unit: string; master: boolean; cats: string[] }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null), btn = useRef<HTMLButtonElement>(null), panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const outside = (e: Event) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    const off = escCloses(() => panel.current, () => { setOpen(false); btn.current?.focus() }, btn.current, { id: FILTER_ESC })
    document.addEventListener('pointerdown', outside)
    return () => { document.removeEventListener('pointerdown', outside); off() }
  }, [open])
  const n = filterCount(p.f, p.master)
  const sqns = units().map(u => u.id).sort(byNum)
  return (
    <div className="od-fwrap" ref={wrap}>
      <button type="button" className={'abtn od-fbtn' + (n ? ' on' : '')} id="accFilter" ref={btn}
        aria-haspopup="true" aria-expanded={open} aria-controls="accFilterPanel" onClick={() => setOpen(o => !o)}>
        <Funnel />{n ? `Filter · ${n}` : 'Filter'}
      </button>
      {open && (
        <div className="od-fpanel" id="accFilterPanel" ref={panel} role="group" aria-label="Filter">
          <Chips g="seat" label="Seat" f={p.f} onChange={p.onChange} opts={SEAT_TICKS.map(v => ({ v, l: v }))} />
          <Chips g="cat" label="CAT" f={p.f} onChange={p.onChange} opts={p.cats.map(v => ({ v, l: v }))} />
          <Chips g="role" label="Role" f={p.f} onChange={p.onChange} opts={ROLE_TICKS.map(v => ({ v, l: roleWord(v, p.unit) }))} />
          {p.master && <Chips g="sqn" label="Squadron" f={p.f} onChange={p.onChange} opts={sqns.map(v => ({ v, l: numOf(v) }))} />}
          <div className="od-ffoot">
            <button type="button" className="abtn" id="accFilterClear" onClick={() => p.onChange(NO_FILTER)}>Clear all</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* "Showing 1 of 61 · Clear" — so a short list never looks like missing people (picture nfd) */
export function ShowingLine(p: { words: string; onClear: () => void }) {
  return (
    <p className="adm-note od-showing" id="accShowing">
      {p.words}{' · '}<button type="button" className="od-clear" id="accShowingClear" onClick={p.onClear}>Clear</button>
    </p>
  )
}
