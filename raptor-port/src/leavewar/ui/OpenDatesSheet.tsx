// THE "OPEN FOR BIDDING" WINDOW (owner, D1177, D1168, D1169, D1172 — 21 Oct 26; drawn r7-17, r7-17b, r7-18 of the
// overhaul's page and approved with the build plan, D1250). The stages went: the admin opens the days the squadron
// may bid on, here, and nothing is open until he does.
//
//   · THE MONTH BUTTONS (D1168): the period's months, a tap opens a whole month first day to last, a second tap closes
//     it; a month open in part is lit with a dotted edge, and a tap opens it whole. Two rows of six on a phone, one
//     row on a desktop.
//   · A HOLD AND DRAG ACROSS THEM (D1169) opens every month from the first to the one under the finger, in CALENDAR
//     order — never only those the finger crossed (the red team's A7b: on a phone's two rows a finger from MAY to SEP
//     never touches JUL or AUG). A drag that starts on an open month closes instead. A phone arms the drag only once
//     the finger has been held, so a finger that moves at once scrolls the window and opens nothing; a quick tap stays
//     a tap. ONE command for the whole drag — one Undo, one repaint (the red team's B12).
//   · ONE LINE A STRETCH, its days counted, a calendar icon (never a pencil — D1172) that opens the calendar for exact
//     days; a tap on the line opens the same calendar. "+ Open more dates" opens it for a new stretch.
//   · NOTHING OPEN: "Nothing is open, so bidding is closed." and, once anything was closed, the last open stretch and
//     who closed it (D1177's reading — what a tap on "Bidding closed" shows).
//   · A MEMBER reads it: the same months and lines, lit as they are FOR HIM (from today — D1211), no controls.
//
// Every write is the store's (`openDates`, `closeDates`, `setStretch` — admin only, re-checked there).

import { useEffect, useRef, useState } from 'react'
import {
  memberToday, monthSpan, monthState, openFrom, periodMonths, stretchDays, stretchLabel, type OpenStretch,
} from '../engine'
import { closeDates, getState, openDates, setStretch, type OpenResult } from '../state/store'
import { CalIcon } from '../../ui/icons'
import { RangePicker, type Range } from './RangePicker'
import { Sheet } from './Sheet'
import { shortSpan } from './dates'
import { usePhone } from './phone'
import { useVersion } from './useStore'

const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
/** How long a finger must rest on a month before a drag across months arms (a phone) — the grid's own hold. */
const HOLD_MS = 180

export function OpenDatesSheet({ onClose }: { onClose: () => void }) {
  useVersion()
  const { period, role, people } = getState()
  const admin = role === 'admin'
  const phone = usePhone()
  /* what this person sees as open: everything for the admin; from today for a member (D1211 — he never bids before it) */
  const open: OpenStretch[] = admin ? period.open : openFrom(period, memberToday())
  const shown = { open }
  const months = periodMonths(period)
  const [editing, setEditing] = useState<OpenStretch | 'new' | null>(null)
  const [problem, setProblem] = useState('')
  const say = (r: OpenResult) => {
    if (r === 'set' || r === 'unchanged') { setProblem(''); return true }
    setProblem(r === 'outside' ? `Those dates leave ${period.name}, which runs ${shortSpan(period.start, period.end)}.`
      : r === 'backwards' ? 'The end date is before the start date.'
        : 'Only an admin can open or close dates.')
    return false
  }

  /* ---- the month buttons: a tap, or a held drag across them ---- */
  const drag = useRef<{ start: number; cur: number; closing: boolean; armed: boolean; moved: boolean; x: number; y: number; timer: number | null } | null>(null)
  const swallowClick = useRef(false)
  const [span, setSpan] = useState<{ lo: number; hi: number; closing: boolean } | null>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const idxAt = (x: number, y: number): number | null => {
    const el = document.elementFromPoint(x, y)?.closest('[data-month-ix]') as HTMLElement | null
    return el && stripRef.current?.contains(el) ? Number(el.dataset.monthIx) : null
  }
  const endDrag = () => {
    const d = drag.current
    if (d?.timer) window.clearTimeout(d.timer)
    drag.current = null
    setSpan(null)
  }
  /* an armed drag owns the finger: the page must not scroll under it (a listener that can cancel, so not React's) */
  useEffect(() => {
    const el = stripRef.current
    if (!el) return
    const stop = (e: TouchEvent) => { if (drag.current?.armed) e.preventDefault() }
    el.addEventListener('touchmove', stop, { passive: false })
    return () => el.removeEventListener('touchmove', stop)
  }, [])
  const onDown = (e: React.PointerEvent, ix: number) => {
    if (!admin || e.button !== 0) return
    const closing = monthState(shown, months[ix]!) === 'open'
    const touch = e.pointerType === 'touch'
    const d = { start: ix, cur: ix, closing, armed: !touch, moved: false, x: e.clientX, y: e.clientY, timer: null as number | null }
    if (touch) d.timer = window.setTimeout(() => { if (drag.current === d && !d.moved) { d.armed = true; setSpan({ lo: ix, hi: ix, closing }) } }, HOLD_MS)
    drag.current = d
    /* NO POINTER CAPTURE: captured, a mouse's click went to the strip and never reached the month pressed (the test
       helper's read, 22 Oct 26). The moves bubble to the strip; a release anywhere ends the drag. */
    const end = () => { window.removeEventListener('pointerup', end); if (drag.current === d) onUpRef.current() }
    window.addEventListener('pointerup', end)
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    if (!d.armed) {
      /* a phone's finger that moves before the hold is a scroll — let it go */
      if (Math.abs(e.clientX - d.x) > 8 || Math.abs(e.clientY - d.y) > 8) endDrag()
      return
    }
    const ix = idxAt(e.clientX, e.clientY)
    if (ix === null || ix === d.cur) return
    d.cur = ix
    d.moved = d.moved || ix !== d.start
    setSpan({ lo: Math.min(d.start, ix), hi: Math.max(d.start, ix), closing: d.closing })
  }
  const onUp = () => {
    const d = drag.current
    if (!d) return
    if (d.moved) {
      const s = monthSpan(months, d.start, d.cur)
      if (s) say(d.closing ? closeDates(s.from, s.to) : openDates(s.from, s.to))
      swallowClick.current = true          // the click that follows a drag is not a tap
    }
    endDrag()
  }
  const onUpRef = useRef(onUp)
  onUpRef.current = onUp
  const tap = (ix: number) => {
    if (swallowClick.current) { swallowClick.current = false; return }
    if (!admin) return
    const m = months[ix]!
    say(monthState(shown, m) === 'open' ? closeDates(m.from, m.to) : openDates(m.from, m.to))
  }

  /* ---- the calendar for exact days ----
     A picked run is a DRAFT until its button applies it: the calendar reports a one-day run on its first tap and the
     whole run on the second, so applying on every report made only one-day stretches (the test helper's read). */
  const [draft, setDraft] = useState<Range | null>(null)
  const startEdit = (e: OpenStretch | 'new' | null) => { setEditing(e); setDraft(e && e !== 'new' ? { ...e } : null); setProblem('') }
  const applyExact = () => {
    if (!draft) return
    if (editing === 'new') { if (say(openDates(draft.from, draft.to))) startEdit(null); return }
    if (editing && say(setStretch(editing, draft.from, draft.to))) startEdit(null)
  }
  /* ESCAPE PEELS ONE LAYER (M1's walk, A-F2): with the calendar for exact days open, Escape closes the calendar only,
     and the window stays. Listened on the WINDOW in its capture phase, so it runs before the Sheet's own Escape (on the
     document) and can stop it; only while the Leave War is the page showing, as the Sheet's. */
  const editingRef = useRef(editing)
  editingRef.current = editing
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !editingRef.current) return
      const pg = document.getElementById('page-leavewar')
      if (pg && !pg.classList.contains('on')) return
      /* the calendar's own month-and-year lists shut first (D1012): its listener takes this press (the re-walk, S20) */
      if (document.querySelector('[data-testid="open-dates"] .dcal-title[aria-expanded="true"]')) return
      e.stopPropagation()
      startEditRef.current(null)
    }
    window.addEventListener('keydown', esc, true)
    return () => window.removeEventListener('keydown', esc, true)
  }, [])
  const startEditRef = useRef(startEdit)
  startEditRef.current = startEdit
  const closeExact = () => { if (editing && editing !== 'new' && say(closeDates(editing.from, editing.to))) startEdit(null) }
  const exactFoot = (forNew: boolean) => (
    <div className="od-apply">
      <button type="button" className="dchip approve" data-testid="od-apply" disabled={!draft} onClick={applyExact}>
        {draft ? `${forNew ? 'Open' : 'Save'} ${stretchLabel(draft)}` : 'Pick the first and last day'}
      </button>
      {!forNew && <button type="button" className="dchip del" data-testid="od-close-stretch" onClick={closeExact}>Close these days</button>}
      <button type="button" className="dchip" data-testid="od-cancel" onClick={() => startEdit(null)}>Cancel</button>
    </div>
  )

  const yearOf = (key: string) => key.slice(2, 4)
  const multiYear = months.length > 0 && months[0]!.key.slice(0, 4) !== months[months.length - 1]!.key.slice(0, 4)
  const last = period.lastClosed
  const closedBy = last ? people.find(p => p.id === last.by)?.callsign ?? '' : ''

  return (
    <Sheet testid="open-dates" label="Open for bidding" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">Open for bidding</span>
        <span className="dt">{period.name}</span>
        <button className="x" data-testid="open-dates-close" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div
        ref={stripRef}
        className={`od-months${phone ? ' phone' : ''}`}
        data-testid="od-months"
        role="group"
        aria-label={admin ? 'Months — tap to open or close a month, hold and drag across months' : 'Months open for bidding'}
        onPointerMove={onMove}
        onPointerCancel={endDrag}
      >
        {months.map((m, i) => {
          const st = monthState(shown, m)
          const inSpan = span && i >= span.lo && i <= span.hi
          const word = `${MON[+m.key.slice(5, 7) - 1]}${multiYear ? ` ${yearOf(m.key)}` : ''}`
          return (
            <button
              key={m.key}
              type="button"
              className={`od-m ${st}${inSpan ? (span!.closing ? ' sweep-close' : ' sweep-open') : ''}`}
              data-month-ix={i}
              data-testid={`od-month-${m.key}`}
              data-state={st}
              disabled={!admin}
              aria-pressed={st === 'open'}
              aria-label={`${word} — ${st === 'open' ? 'open' : st === 'part' ? 'open in part' : 'closed'}`}
              onPointerDown={e => onDown(e, i)}
              onClick={() => tap(i)}
            >
              {word}
            </button>
          )
        })}
      </div>
      <div className="od-lines" data-testid="od-lines">
        {open.length === 0 && (
          <div className="od-none" data-testid="od-none">
            <span>Nothing is open, so bidding is closed.</span>
            {last && (
              <span className="od-last" data-testid="od-last">
                Last open {stretchLabel(last)}{closedBy ? ` · closed by ${closedBy}` : ''}
              </span>
            )}
          </div>
        )}
        {open.map(s => {
          const key = `${s.from}|${s.to}`
          const isEditing = editing !== null && editing !== 'new' && editing.from === s.from && editing.to === s.to
          return (
            <div key={key} className="od-line-wrap">
              <div className="od-line" data-testid={`od-line-${s.from}`}>
                {admin ? (
                  <button type="button" className="od-line-go" onClick={() => startEdit(isEditing ? null : s)}
                    aria-expanded={isEditing} aria-label={`${stretchLabel(s)}, ${stretchDays(s)} days — change its days`}>
                    <span className="od-span">{stretchLabel(s)}</span>
                    <span className="od-days">{stretchDays(s)} days</span>
                  </button>
                ) : (
                  <span className="od-line-go ro">
                    <span className="od-span">{stretchLabel(s)}</span>
                    <span className="od-days">{stretchDays(s)} days</span>
                  </span>
                )}
                {admin && (
                  <button type="button" className="od-cal" data-testid={`od-cal-${s.from}`} title="Exact days"
                    aria-label={`Exact days of ${stretchLabel(s)}`} aria-expanded={isEditing}
                    onClick={() => startEdit(isEditing ? null : s)}>
                    <CalIcon />
                  </button>
                )}
              </div>
              {isEditing && (
                <>
                  <RangePicker testid="od-range" min={period.start} max={period.end} value={draft} onChange={setDraft} />
                  {exactFoot(false)}
                </>
              )}
            </div>
          )
        })}
        {admin && (
          editing === 'new' ? (
            <>
              <RangePicker testid="od-new" min={period.start} max={period.end} anchor={open[open.length - 1]?.to ?? period.start} value={draft} onChange={setDraft} />
              {exactFoot(true)}
            </>
          ) : (
            <button type="button" className="od-more" data-testid="od-more" onClick={() => startEdit('new')}>
              + Open more dates
            </button>
          )
        )}
        {problem && <span className="note warn" data-testid="od-problem">{problem}</span>}
      </div>
    </Sheet>
  )
}
