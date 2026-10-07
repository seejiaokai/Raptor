// TYPING ONE REQUIRED FIGURE — straight into its cell (the Inputs / SANS redesign, plan
// docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.3 "Typing one cell"; owner D636, D637).
//
// He asked for the required pilots and WSOs to be typed where they are read — "no sheet to open" (D636). So an admin's
// click on a Required cell puts ONE box over that cell, and FlyRows holds at most one of these at a time: an input in
// every cell of a year would be 730 inputs in a grid whose phone budget is counted in nodes (performance.md §E).
//
//   ON A DESKTOP the box is a real input. Enter saves and goes to the next FLYING day (a weekend, a holiday, an Off
//   day and a no-fly day are passed over — he clicks one of those to type it); Tab saves and goes to the other seat;
//   Shift with either goes back; Esc leaves the cell as it was; an empty box and Enter clears the date's typed figure.
//   A press anywhere else saves what was typed and closes the box, as a text box does everywhere in this app.
//
//   ON A TOUCH SCREEN there is NO input at all — the app shows its own number pad. An 11px input inside a grid cell
//   makes iOS zoom the whole page on focus, and a bar fixed above the phone's own keyboard is unreliable there (the
//   plan's words). So the box over the cell is a plain element showing what the pad has typed, and the phone's
//   keyboard is never called up. Which of the two a click gets is decided by the POINTER that made it (FlyRows keeps
//   the last press's kind) — a laptop with a touch screen gets the pad for a finger and the input for its mouse.
//
// THE STRIP names the row and the day and carries the one choice a single cell has: "This day" (a figure for the date
// itself) or "From <date> on" (a figure that RUNS from it — D637: until a different one is typed later, skipping
// weekends, public holidays, Off days and no-fly days). The choice goes back to "This day" at every cell: a run is
// chosen each time, never carried along by Enter. It is not offered on a weekend, a holiday or an Off day — a run
// never shows there, so the cell would look as if nothing had been saved.
//
// NOTHING CHANGED, NOTHING WRITTEN. Enter over a cell he did not touch is how he walks along the row; were that to
// save, every running figure he passed over would become a figure typed for its date and stop following its run.
//
// Each save is ONE command (state/flyplan.ts setFlyDays / setFlyRun / dropFlyRun, reached through sync.ts) — one Undo
// step. A save the app refuses says why in the strip and keeps the box with what was typed.

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { dropFlyRun, flyAnswer, getFlyPlan, setFlyDays, setFlyRun, usePlanVersion, type FlySave } from '../sync'
import { dayLabel } from './dates'

export type ReqRow = 'req-p' | 'req-w'
export interface FlyEditAt { row: ReqRow; iso: string; touch: boolean }
type Seat = 'p' | 'w'

/** The Required rows' names — FIXED (D668, 8 Oct 26: "1 as recommended"); the short form is a phone's. */
export const REQ_NAME: Record<ReqRow, string> = { 'req-p': 'Required P', 'req-w': 'Required W' }
export const REQ_SHORT: Record<ReqRow, string> = { 'req-p': 'Req P', 'req-w': 'Req W' }
const MAX_DIGITS = 3
const digits = (v: string) => v.replace(/\D/g, '').slice(0, MAX_DIGITS)
/** "Tue 6 Jan" → "6 Jan" */
const dm = (iso: string) => dayLabel(iso).split(' ').slice(1).join(' ')

/** A day a figure is typed along: day or night flying, on no holiday or Off day. Enter and the pad's ‹ › stop only
 *  on these; any other day is typed by pressing its own cell. */
export function isFlyingDay(iso: string): boolean {
  const a = flyAnswer(iso)
  return !a.kind && (a.cls === 'day' || a.cls === 'night')
}
/** the next (dir 1) or previous (dir -1) flying day among the DRAWN dates; null at the end of what is drawn */
export function stepFlyingDay(dates: readonly string[], iso: string, dir: 1 | -1): string | null {
  for (let i = dates.indexOf(iso) + dir; i >= 0 && i < dates.length; i += dir) if (isFlyingDay(dates[i]!)) return dates[i]!
  return null
}

const cellOf = (at: { row: ReqRow; iso: string }) => document.querySelector<HTMLElement>(`[data-testid="${at.row}-${at.iso}"]`)

/* Bring the cell clear of the frozen columns (and of the number pad) before the box is laid over it. The grid scrolls
   sideways inside `.mx-wrap`; up and down it is the page that scrolls (ui-contracts §The Leave War grid scroller has
   no vertical axis). By a DELTA, so it is right wherever the grid already is — as Matrix's own month jump does. */
function bringIntoView(cell: HTMLElement, padTop: number | null) {
  const wrap = cell.closest<HTMLElement>('.mx-wrap')
  const row = cell.parentElement
  const r = cell.getBoundingClientRect()
  if (wrap && row) {
    const w = wrap.getBoundingClientRect()
    const frozen = row.querySelector<HTMLElement>('.bal')?.getBoundingClientRect().right ?? w.left
    if (r.left < frozen) wrap.scrollLeft -= frozen - r.left + r.width
    else if (r.right > w.right) wrap.scrollLeft += r.right - w.right + r.width
  }
  /* up and down: clear of the pad's top edge (or the screen's foot), and of the app's bar at the head. By the exact
     distance — "centre it" is not enough on a phone, where the pad takes half the screen (found by the browser gate:
     the centred cell sat 6px under the pad). */
  const floor = (padTop ?? window.innerHeight) - 14
  /* with the pad up, bring ALL FOUR rows above it where the screen allows: he types a Required figure against the
     Available one two rows below it */
  const foot = padTop === null ? r.bottom : Math.max(r.bottom, footOfRows() ?? r.bottom)
  const dy = foot > floor ? Math.min(foot - floor, r.top - 64) : r.top < 64 ? r.top - 64 : 0
  if (dy) scrollerOf(cell).scrollBy(0, dy)
}
const footOfRows = () => document.querySelector<HTMLElement>('[data-testid="fly-row-avail-w"]')?.getBoundingClientRect().bottom ?? null
/* what scrolls the grid up and down: the nearest ancestor that scrolls on that axis, else the page itself */
function scrollerOf(el: HTMLElement): { scrollBy: (x: number, y: number) => void } {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const oy = getComputedStyle(p).overflowY
    if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight + 1) return p
  }
  return window
}

export function FlyEditor({ at, dates, onMove, onClose }: {
  at: FlyEditAt
  /** the DRAWN dates, in order — Enter walks these */
  dates: readonly string[]
  /** go to another cell; `from` is the cell this editor was opened for, so a late answer cannot move a newer editor */
  onMove: (from: FlyEditAt, row: ReqRow, iso: string) => void
  onClose: (from: FlyEditAt) => void
}) {
  const seat: Seat = at.row === 'req-p' ? 'p' : 'w'
  const planV = usePlanVersion()
  /* what the cell shows — the box opens holding it, selected, so the first key replaces it */
  const shown = () => { const v = flyAnswer(at.iso).req[seat]; return v === null ? '' : String(v) }
  const opened = useRef(shown())
  const [text, setText] = useState(opened.current)
  /* on the pad, the first digit REPLACES the figure that was there (what select-all does for the input) */
  const fresh = useRef(true)
  const [mode, setMode] = useState<'day' | 'run'>('day')
  const [err, setErr] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLElement | null>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const padRef = useRef<HTMLDivElement>(null)
  const a = flyAnswer(at.iso)
  /* a running figure never shows on a weekend, a public holiday or an Off day (D637) */
  const runOk = !a.weekend && !a.kind

  /* a figure changed under the open box (an Undo, another screen): while nothing has been typed, show the new one */
  useEffect(() => {
    const now = shown()
    if (now !== opened.current) { if (text === opened.current) setText(now); opened.current = now }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the plan's version is the only thing that can move it
  }, [planV])

  /* ---- where the box and the strip sit: over the cell; under the four rows ---- */
  const place = () => {
    const cell = cellOf(at), box = boxRef.current
    if (!cell || !box) return
    const r = cell.getBoundingClientRect()
    box.style.left = `${r.left}px`; box.style.top = `${r.top}px`
    box.style.width = `${r.width}px`; box.style.height = `${r.height}px`
    const strip = stripRef.current
    if (strip && !at.touch) {
      /* UNDER the four rows — never over the figures he types against — and to the RIGHT of the month buttons, which
         sit in the row just below: a strip lying over them would hide the very buttons D665 was ruled to keep clear
         (where the window is too narrow for both, the strip keeps on the screen and the months lose) */
      const foot = footOfRows() ?? r.bottom
      const months = [...document.querySelectorAll<HTMLElement>('[data-testid="month-strip"] button')].pop()?.getBoundingClientRect().right ?? 0
      const w = strip.offsetWidth || 420
      strip.style.left = `${Math.max(6, Math.min(Math.max(r.left - 40, months + 8), window.innerWidth - w - 6))}px`
      strip.style.top = `${foot + 6}px`
    }
  }
  useLayoutEffect(() => {
    const cell = cellOf(at)
    if (!cell) { onClose(at); return }
    bringIntoView(cell, at.touch ? padRef.current?.getBoundingClientRect().top ?? null : null)
    place()
    if (!at.touch) { inputRef.current?.focus(); inputRef.current?.select() }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, for the cell this editor was opened for (FlyRows remounts it per cell)
  }, [])
  useLayoutEffect(place)        // a figure saved under it can widen the column: follow on every paint
  useEffect(() => {
    let raf = 0
    const again = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; if (!cellOf(at)) onClose(at); else place() }) }
    window.addEventListener('scroll', again, true)
    window.addEventListener('resize', again)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', again, true); window.removeEventListener('resize', again) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---- the one save ---- */
  const save = (): FlySave | null => {
    const t = text.trim()
    const plan = getFlyPlan()
    if (mode === 'run') {
      if (t === '') return plan.runs[at.iso]?.[seat] !== undefined ? dropFlyRun(at.iso, [seat]) : null
      const now = flyAnswer(at.iso)
      if (now.reqFrom[seat] === 'run' && now.runStart[seat] === at.iso && now.req[seat] === +t) return null
      return setFlyRun(at.iso, { [seat]: +t }, { clearDay: true })
    }
    if (t === opened.current) return null                              // nothing changed: nothing written
    if (t === '') return plan.days[at.iso]?.[seat] !== undefined ? setFlyDays([{ iso: at.iso, [seat]: null }]) : null
    return setFlyDays([{ iso: at.iso, [seat]: +t }])
  }
  const saveThen = (then: () => void) => {
    const done = (r: FlySave) => { if (r.ok) then(); else setErr(r.message || 'This change could not be saved.') }
    const r = save()
    if (!r) { then(); return }
    if (r.pending) void r.pending.then(done); else done(r)
  }
  const step = (dir: 1 | -1) => saveThen(() => {
    const to = stepFlyingDay(dates, at.iso, dir)
    if (to) onMove(at, at.row, to); else onClose(at)
  })
  const otherSeat = () => saveThen(() => onMove(at, at.row === 'req-p' ? 'req-w' : 'req-p', at.iso))
  const finish = () => saveThen(() => onClose(at))

  /* latest handlers for the two document listeners below, which are bound once */
  const live = useRef({ finish, close: () => onClose(at) })
  live.current = { finish, close: () => onClose(at) }
  useEffect(() => {
    /* A PRESS ANYWHERE ELSE saves and closes. The box, the strip and the pad are "inside". Capture phase, so it has
       run before the press reaches a cell that opens its own editor. */
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null
      if (t && typeof t.closest === 'function' && t.closest('.flyedit, .flyedit-strip, .flypad')) return
      live.current.finish()
    }
    /* Esc leaves the cell as it was — and is swallowed, so it does not also close something behind the box */
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const pg = document.getElementById('page-leavewar')
      if (pg && !pg.classList.contains('on')) return
      e.stopPropagation()
      live.current.close()
    }
    document.addEventListener('pointerdown', onDown, true)
    window.addEventListener('keydown', onKey, true)
    return () => { document.removeEventListener('pointerdown', onDown, true); window.removeEventListener('keydown', onKey, true) }
  }, [])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); step(e.shiftKey ? -1 : 1) }
    else if (e.key === 'Tab') { e.preventDefault(); otherSeat() }
  }
  const press = (k: string) => {
    setErr('')
    const base = fresh.current ? '' : text
    fresh.current = false
    setText(k === 'back' ? base.slice(0, -1) : digits(base + k))
  }
  /* the choice keeps the typing: a button that took the focus would close the input's caret under him */
  const hold = (e: React.MouseEvent | React.PointerEvent) => e.preventDefault()
  const choice = (
    <span className="flyedit-mode" role="group" aria-label="Apply to">
      <button type="button" className={mode === 'day' ? 'on' : ''} aria-pressed={mode === 'day'} data-testid="fly-edit-day" onMouseDown={hold} onClick={() => setMode('day')}>This day</button>
      <button
        type="button" className={mode === 'run' ? 'on' : ''} aria-pressed={mode === 'run'} data-testid="fly-edit-run" disabled={!runOk}
        title={runOk ? `${REQ_NAME[at.row]} on every flying day from ${dayLabel(at.iso)}, until a different figure is typed on a later day` : 'A running figure skips weekends, public holidays and Off days'}
        onMouseDown={hold} onClick={() => setMode('run')}
      >From {dm(at.iso)} on</button>
    </span>
  )
  const label = `${REQ_NAME[at.row]}, ${dayLabel(at.iso)}`

  if (at.touch) {
    return (
      <>
        <div className="flyedit touch" ref={el => { boxRef.current = el }} data-testid="fly-edit-touch" aria-label={label}>{text}</div>
        <div className="flypad" ref={padRef} data-testid="fly-pad" role="group" aria-label={`Number pad — ${label}`}>
          <div className="flypad-hd flyedit-strip" data-testid="fly-edit-strip">
            <b>{REQ_SHORT[at.row]}</b><span className="flypad-day">{dayLabel(at.iso)}</span>
            <span className="flypad-nav">
              <button type="button" data-testid="fly-pad-prev" aria-label="Previous flying day" onClick={() => step(-1)}>‹</button>
              <button type="button" data-testid="fly-pad-next" aria-label="Next flying day" onClick={() => step(1)}>›</button>
              <button type="button" className="done" data-testid="fly-pad-done" onClick={finish}>Done</button>
            </span>
            <span className="flypad-apply">{choice}{err && <span className="flyedit-err" data-testid="fly-edit-err" role="alert">{err}</span>}</span>
          </div>
          <div className="flypad-keys">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(k => <button type="button" key={k} data-testid={`fly-pad-${k}`} onClick={() => press(k)}>{k}</button>)}
            <span />
            <button type="button" data-testid="fly-pad-0" onClick={() => press('0')}>0</button>
            <button type="button" className="back" data-testid="fly-pad-back" aria-label="Delete the last digit" onClick={() => press('back')}>⌫</button>
          </div>
        </div>
      </>
    )
  }
  return (
    <>
      <input
        ref={el => { inputRef.current = el; boxRef.current = el }}
        className="flyedit" data-testid="fly-edit-input" aria-label={label}
        type="text" inputMode="numeric" autoComplete="off" spellCheck={false} maxLength={MAX_DIGITS}
        value={text}
        onChange={e => { setErr(''); setText(digits(e.target.value)) }}
        onKeyDown={onKeyDown}
      />
      <div className="flyedit-strip desk" ref={stripRef} data-testid="fly-edit-strip">
        <b>{REQ_NAME[at.row]}</b><span className="flyedit-day">{dayLabel(at.iso)}</span>
        {choice}
        {err
          ? <span className="flyedit-err" data-testid="fly-edit-err" role="alert">{err}</span>
          : <span className="flyedit-keys"><kbd>Enter</kbd> next day <i>·</i> <kbd>Tab</kbd> the other seat <i>·</i> <kbd>Esc</kbd> leave it as it was</span>}
      </div>
    </>
  )
}
