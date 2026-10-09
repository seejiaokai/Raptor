// THE REQUIRED PANEL — one number for a picked block of Required cells (the Inputs / SANS redesign, plan
// docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.3 "Picking several"; owner D636, D637, D622).
//
// He asked for several cells to be picked at once and given one number — "shift and drag on a desktop, a long press
// and drag on a phone" (D636) — and for a figure to be able to run "from a date on" (D637). A drag over the two
// Required rows (select.ts, the grid's third kind of pick) opens this: the number, "These days | From <date> on",
// Apply, Clear. Picked across both rows, pilots and WSOs take the one number (D622).
//
// NOT A BLOCKING WINDOW (D641 — "should be able to drag around and the background still works"): it is `Sheet`'s
// `modal={false}` form. No veil, a press outside does not close it, the grid behind works. A NEW drag over the rows
// while it is up is followed by this same panel (FlyRows hands it the new pick; the number typed stays); a plain
// click on a cell of the grid opens that cell's own thing and closes it (`useCloseOnCellClick`); ✕, Escape and Apply
// close it.
//
// WHICH CELLS TAKE THE NUMBER is `reqpick.ts planPick` — worked out from what each picked day is, and different for
// the two choices; the cells FlyRows keeps lit while the panel is up are that same answer, so what is lit is what
// Apply writes. Apply and Clear are ONE command each (state/flyplan.ts, through sync.ts) — one Undo step.

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { dropFlyRun, flyAnswer, getFlyPlan, setFlyDays, setFlyRun, usePlanVersion, useWarFacts, type FlyDayPatch, type FlySave } from '../sync'
import { dayLabel, shortSpan } from './dates'
import { liftAbove, REQ_NAME, REQ_SHORT } from './FlyEdit'
import { useCloseOnCellClick } from './gridclick'
import { planPick } from './reqpick'
import type { ReqSelection } from './select'
import { Sheet } from './Sheet'
import './bidpicker.css'

const MAX_DIGITS = 3
const digits = (v: string) => v.replace(/\D/g, '').slice(0, MAX_DIGITS)
const dm = (iso: string) => dayLabel(iso).split(' ').slice(1).join(' ')
const s = (n: number) => (n === 1 ? '' : 's')
/** a phone's span: "5 – 9 Jan", "30 Jan – 3 Feb" — the year and the second month only where they are needed */
function tightSpan(from: string, to: string): string {
  if (from === to) return dm(from)
  const sameMonth = from.slice(0, 7) === to.slice(0, 7)
  return `${sameMonth ? String(+from.slice(8, 10)) : dm(from)} – ${dm(to)}`
}

export function ReqPanel({ pick, include, onInclude, onClose }: {
  pick: ReqSelection
  /** whether the weekend / holiday days of a mixed pick are taken in — FlyRows holds it, because it lights the cells */
  include: boolean
  onInclude: (v: boolean) => void
  onClose: () => void
}) {
  /* what each picked day IS can change under the open panel (a day set to no-fly, a holiday added on the war) */
  usePlanVersion(); useWarFacts()
  const [num, setNum] = useState('')
  const [mode, setMode] = useState<'days' | 'run'>('days')
  const [err, setErr] = useState('')
  const numRef = useRef<HTMLInputElement>(null)
  /* a phone's width (the same 430px the four rows' own short names turn at): the head and the hint say it shorter, as
     the fifth mock-ups drew them — "Req P and W", "5 – 9 Jan · 4 days", "one number for all" — so nothing wraps */
  const [phone] = useState(() => typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 430px)').matches)
  useCloseOnCellClick(onClose)
  /* the box is ready to type in on a desktop; on a touch screen it waits for his tap, so the phone's keyboard does not
     jump up over the grid he has just picked on */
  useEffect(() => {
    const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
    if (!coarse) numRef.current?.focus()
  }, [])

  /* THE PANEL MUST NOT LIE OVER THE CELLS IT ACTS ON. It is docked at the foot of the screen; on a phone, with a
     squadron's own counters above them, the four rows start more than half-way down — and the panel opened straight
     over the block he had just picked (found by the browser gate; jsdom lays nothing out). So when it opens, and when
     a new pick is handed to it, the page is scrolled until the rows sit above the panel's top edge. Once: he may then
     drag the panel wherever he likes (D641). */
  useLayoutEffect(() => {
    const panel = document.querySelector<HTMLElement>('[data-testid="req-panel"]')
    const cell = document.querySelector<HTMLElement>(`[data-testid="req-${pick.rows[0]}-${pick.from}"]`)
    if (panel && cell) liftAbove(cell, panel.getBoundingClientRect().top)
  }, [pick])

  const plan = planPick(pick.dates, flyAnswer, include)
  const both = pick.rows.length === 2
  const one = pick.rows[0] === 'p' ? 'req-p' : 'req-w'
  const title = phone ? (both ? 'Req P and W' : REQ_SHORT[one]) : (both ? 'Required P and W' : REQ_NAME[one])
  const cells = plan.take.length * pick.rows.length
  const stored = getFlyPlan()
  const seatPatch = <T,>(v: T): { p?: T; w?: T } => ({ ...(pick.rows.includes('p') ? { p: v } : {}), ...(pick.rows.includes('w') ? { w: v } : {}) })
  /* Clear acts where there is something to take away: a figure typed on a day this panel is acting on, or — with
     "From … on" picked — a run that starts on that date for a picked seat */
  const runHere = pick.rows.filter(r => stored.runs[plan.runStart]?.[r] !== undefined)
  const typedHere = plan.take.some(iso => pick.rows.some(r => stored.days[iso]?.[r] !== undefined))
  const canClear = mode === 'run' ? runHere.length > 0 : typedHere
  const canApply = num !== '' && (mode === 'run' || plan.take.length > 0)

  const after = (r: FlySave) => {
    const done = (x: FlySave) => { if (x.ok) onClose(); else setErr(x.message || 'This change could not be saved.') }
    if (r.pending) void r.pending.then(done); else done(r)
  }
  const apply = () => {
    if (!canApply) return
    const n = +num
    after(mode === 'run'
      ? setFlyRun(plan.runStart, seatPatch(n), { clear: plan.runClear })
      : setFlyDays(plan.take.map(iso => ({ iso, ...seatPatch(n) }) as FlyDayPatch)))
  }
  const clear = () => {
    if (!canClear) return
    after(mode === 'run'
      ? dropFlyRun(plan.runStart, runHere)
      : setFlyDays(plan.take.map(iso => ({ iso, ...seatPatch(null) }) as FlyDayPatch)))
  }

  const fig = num === '' ? 'One figure' : both ? `${+num} and ${+num}` : String(+num)
  return (
    <Sheet testid="req-panel" label="Required figures for the picked days" onClose={onClose} modal={false}>
      <div className="bidsheet-hd">
        <span className="who" data-testid="req-panel-title">{title}</span>
        <span className="dt" data-testid="req-panel-span">
          {mode === 'run'
            ? `from ${dayLabel(plan.runStart)} onward`
            : `${phone ? tightSpan(pick.from, pick.to) : shortSpan(pick.from, pick.to)} · ${plan.take.length} day${s(plan.take.length)}`}
        </span>
        <button className="x" data-testid="req-panel-x" onClick={onClose} aria-label="Close">✕</button>
      </div>

      <div className="bidsheet-row reqp-num">
        <label className="lab" htmlFor="req-panel-num">Number</label>
        <input
          id="req-panel-num" ref={numRef} className="reqnum" data-testid="req-panel-num"
          type="text" inputMode="numeric" autoComplete="off" spellCheck={false} maxLength={MAX_DIGITS}
          value={num}
          onChange={e => { setErr(''); setNum(digits(e.target.value)) }}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); apply() } }}
        />
        <span className="note" data-testid="req-panel-count">
          {mode === 'run'
            ? (both ? 'one number for both seats' : 'one number, from that day on')
            : phone ? (cells === 1 ? 'for the one picked cell' : `one number for all ${cells}`) : `one number for the ${cells} picked cell${s(cells)}`}
        </span>
      </div>

      <div className="bidsheet-row reqp-apply">
        <span className="lab">Apply to</span>
        <button type="button" className={`pchip${mode === 'days' ? ' on' : ''}`} aria-pressed={mode === 'days'} data-testid="req-panel-days" onClick={() => { setMode('days'); setErr('') }}>These days</button>
        <button type="button" className={`pchip${mode === 'run' ? ' on' : ''}`} aria-pressed={mode === 'run'} data-testid="req-panel-run" onClick={() => { setMode('run'); setErr('') }}>From {dm(plan.runStart)} on</button>
        <span className="reqp-do">
          <button type="button" className="tchip clear" data-testid="req-panel-clear" disabled={!canClear} onClick={clear}
            title={mode === 'run' ? 'Take away the figure that starts running on this date' : 'Take the typed figures off these days'}>Clear</button>
          <button type="button" className="reqapply" data-testid="req-panel-apply" disabled={!canApply} onClick={apply}>Apply</button>
        </span>
      </div>

      {mode === 'run' && (
        <div className="bidsheet-row"><span className="note" data-testid="req-panel-runnote">
          {fig} on every flying day from {dayLabel(plan.runStart)}, until a different figure is typed on a later day. No-fly days, weekends, public holidays and Off days are left alone.
        </span></div>
      )}
      {mode === 'days' && plan.nf.length > 0 && (
        <div className="bidsheet-row"><span className="note" data-testid="req-panel-nf">
          {plan.nf.length === 1 ? `${dayLabel(plan.nf[0]!)} is a no-fly day — it is left alone.` : `${plan.nf.length} no-fly days are left alone.`}
        </span></div>
      )}
      {mode === 'days' && plan.special > 0 && (
        <div className="bidsheet-row"><span className="note" data-testid="req-panel-out">
          {plan.special} weekend or holiday day{s(plan.special)} {include ? 'included' : 'left out'}
          <button type="button" className="reqp-inc" data-testid="req-panel-include" onClick={() => onInclude(!include)}>{include ? 'Leave out' : 'Include'}</button>
        </span></div>
      )}
      {err && <div className="bidsheet-row"><span className="note warn" data-testid="req-panel-err" role="alert">{err}</span></div>}
    </Sheet>
  )
}
