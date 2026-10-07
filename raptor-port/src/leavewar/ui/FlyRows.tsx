// THE FOUR ROWS UNDER THE EVENT ROWS — Required P, Required W, Available P, Available W (the Inputs / SANS redesign,
// plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.3; owner D617, D626, D637, D640).
//
// The SANS calendar's "still needed" is the required figure, less those the Leave War shows available, less the SANS
// committed to fly (D617) — and this is where the first two are SEEN and (for an admin, in the next piece) typed: the
// day's required pilots and WSOs, straight above the count of who the war has for each seat.
//
//   · A REQUIRED cell shows the one resolver's figure for the day (sync.ts flyMonth → state/flyplan-model.ts planFor):
//     the number, "NF" on a no-fly day, or a dash where no figure applies. The day a RUNNING figure starts wears a
//     small corner mark, its title saying "16 from Tue 6 Jan onward".
//   · An AVAILABLE cell shows the war's own count for the seat (engine/availrows.ts — never a SANS man), red where it
//     is under its Required. A tap opens the WORKING — required, available, SANS committed to fly, still needed —
//     read only, for everyone.
//   · A member sees all four rows, read only.
//
// TWO STORES, HEARD HERE. The figures are the scheduler's records and the counts are the war's, so this component
// subscribes ITSELF to both signals (`usePlanVersion`, `useWarFacts`) — Matrix and its memo firewall are not touched,
// and a figure typed on another screen repaints these rows with no reload. Each drawn month's cells are memoised on a
// signature of what they SHOW, built from the resolver's own answers: a running figure or a weekday rule that began
// months earlier moves those answers, so a month cannot miss a change dated outside it (both readers' finding 2).
//
// THE ROW CONTRACT, to the letter (performance.md §E — the owner's iPhone is the gate): every row carries `who`, `bal`,
// the two placeholders and ONE cell per drawn day, exactly as the Event rows above it do. The cells are
// `req-p-<iso>` / `req-w-<iso>` / `avail-p-<iso>` / `avail-w-<iso>` — never an `event-`, `cell-` or `count-` prefix:
// the grid's drag code hit-tests those.

import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefCallback } from 'react'
import { createPortal } from 'react-dom'
import type { DayInfo } from '../engine'
import {
  availRowNames, dayFacts, FLY_NAME_DEFAULTS, flyAnswer, flyMonth, getFlyNames, sansFly, usePlanVersion, useWarFacts,
  type DayAnswer,
} from '../sync'
import { dayLabel } from './dates'
import { popAt } from './popat'

type Seat = 'p' | 'w'
type RowId = 'req-p' | 'req-w' | 'avail-p' | 'avail-w'
const ROWS: readonly { id: RowId; seat: Seat; kind: 'req' | 'avail' }[] = [
  { id: 'req-p', seat: 'p', kind: 'req' },
  { id: 'req-w', seat: 'w', kind: 'req' },
  { id: 'avail-p', seat: 'p', kind: 'avail' },
  { id: 'avail-w', seat: 'w', kind: 'avail' },
]
/** each row's own testid, top to bottom — what the Figures drawer keys its matching empty boxes to (Matrix drawerRows) */
export const FLY_ROW_KEYS: readonly string[] = ROWS.map(r => `fly-row-${r.id}`)
/* a phone's short form of each row's name — shown only while the name is still the one it started with */
const AVAIL_DEFAULTS = { p: 'Available P', w: 'Available W' }
const SHORT: Record<RowId, string> = { 'req-p': 'Req P', 'req-w': 'Req W', 'avail-p': 'Avail P', 'avail-w': 'Avail W' }

/** Rounds for display only — 27.5 stays 27.5, 28 does not become "28.0" (the count rows' own rule). */
const show = (n: number) => String(Math.round(n * 10) / 10)

interface CellView { iso: string; text: string; cls: string; title?: string }

/* What one cell of a row shows on a day, from the resolver's answer and the war's count. */
function cellOf(row: (typeof ROWS)[number], iso: string, a: DayAnswer, admin: boolean): CellView {
  const s = row.seat
  if (row.kind === 'req') {
    const from = a.reqFrom[s]
    if (from === 'nf') return { iso, text: 'NF', cls: ' nf', title: 'A no-fly day needs nobody — change the day in Days' }
    const v = a.req[s]
    if (v === null) return { iso, text: '–', cls: ' none' + (admin ? ' editable' : '') }
    /* the day a running figure STARTS: the corner mark, and what it is in words */
    const starts = from === 'run' && a.runStart[s] === iso
    return {
      iso, text: show(v),
      cls: (from === 'run' ? ' run' : ' set') + (starts ? ' runstart' : '') + (admin ? ' editable' : ''),
      ...(starts ? { title: `${show(v)} from ${dayLabel(iso)} onward` } : {}),
    }
  }
  const f = dayFacts(iso)
  const avail = s === 'p' ? f.availP : f.availW
  if (avail === null) return { iso, text: '–', cls: ' none' }
  /* red where it is UNDER its Required (the design note: "the Available figure turns red when it is under Required,
     and the SANS calendar carries what is still needed") — a no-fly day requires nobody, so it is never red */
  const req = a.req[s]
  return { iso, text: show(avail), cls: req !== null && avail < req ? ' under' : '' }
}

/** One drawn month of one row's cells. Re-rendered only when what it SHOWS has changed (`sig`). */
const FlyCells = memo(function FlyCells({ row, cells, onTap }: {
  row: RowId
  /** what the cells show, as one string — the memo's whole test */
  sig: string
  cells: CellView[]
  onTap: (row: RowId, iso: string, el: HTMLElement) => void
}) {
  const avail = row.startsWith('avail')
  return (
    <>
      {cells.map(c => (
        <td
          key={c.iso}
          className={`fr ${avail ? 'avail tap' : 'req'}${c.cls}`}
          data-testid={`${row}-${c.iso}`}
          title={c.title}
          onClick={avail ? e => onTap(row, c.iso, e.currentTarget) : undefined}
        >
          {c.text}
        </td>
      ))}
    </>
  )
}, (a, b) => a.sig === b.sig && a.row === b.row && a.onTap === b.onTap)

export const FlyRows = memo(function FlyRows({ days, admin, padL, padR, phL, phR, onWiden }: {
  /** the DRAWN days — a window of the war (Matrix's column window), whole months at a time */
  days: DayInfo[]
  admin: boolean
  /** The column window's placeholder cells, as every row of the grid carries them (see EventRows). */
  padL?: boolean
  padR?: boolean
  phL?: RefCallback<HTMLTableCellElement>
  phR?: RefCallback<HTMLTableCellElement>
  /** Called after a change to what the rows show has been drawn: a figure can widen a day column, and the grid's
   *  measured geometry (the frozen header, the month strip, the placeholders) must follow — as the Archive rows ask. */
  onWiden?: () => void
}) {
  /* the two signals: the scheduler's (the plan's rows, the SANS commitments, the Required rows' names) and the war's
     (who is available, a holiday, the Available rows' own names) */
  const planV = usePlanVersion()
  const warV = useWarFacts()

  /* the drawn days, month by month, with each month's answers from the ONE resolver */
  const months = useMemo(() => {
    const out: { key: string; dates: string[]; answers: Record<string, DayAnswer> }[] = []
    for (const d of days) {
      const key = d.date.slice(0, 7)
      let m = out[out.length - 1]
      if (!m || m.key !== key) { m = { key, dates: [], answers: flyMonth(+key.slice(0, 4), +key.slice(5, 7)) }; out.push(m) }
      m.dates.push(d.date)
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the two versions ARE the dependencies: they stand for everything the resolver reads
  }, [days, planV, warV])

  const names = useMemo(() => {
    const req = getFlyNames(), av = availRowNames()
    return {
      'req-p': { name: req.p, std: req.p === FLY_NAME_DEFAULTS.p },
      'req-w': { name: req.w, std: req.w === FLY_NAME_DEFAULTS.w },
      'avail-p': { name: av.p, std: av.p === AVAIL_DEFAULTS.p },
      'avail-w': { name: av.w, std: av.w === AVAIL_DEFAULTS.w },
    } as Record<RowId, { name: string; std: boolean }>
    // eslint-disable-next-line react-hooks/exhaustive-deps -- as above
  }, [planV, warV])

  /* THE WORKING — the box a tap on an Available cell opens. Screen-fixed and portalled out of the table (a box cannot
     live inside a <tr>), a small menu like the event box: a press outside, Escape, a scroll or a resize closes it. */
  const [work, setWork] = useState<{ row: RowId; iso: string; tid: string; x: number; y: number } | null>(null)
  const tapRef = useRef((row: RowId, iso: string, el: HTMLElement) => {
    const tid = el.getAttribute('data-testid') ?? ''
    setWork(cur => (cur && cur.tid === tid ? null : { row, iso, tid, ...popAt(el.getBoundingClientRect(), 220, 132) }))
  })
  useEffect(() => {
    if (!work) return
    const close = () => setWork(null)
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null
      if (!t || t.closest('.flywork')) return
      if (t.closest(`[data-testid="${work.tid}"]`)) return   // its own cell: the click that follows toggles it
      setWork(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const pg = document.getElementById('page-leavewar')
      if (pg && !pg.classList.contains('on')) return
      e.stopPropagation()
      setWork(null)
    }
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    document.addEventListener('pointerdown', onDown, true)
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
      document.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('keydown', onKey, true)
    }
  }, [work])

  /* per row, per month: the cells and their signature */
  const model = ROWS.map(row => months.map(m => {
    const cells = m.dates.map(iso => cellOf(row, iso, m.answers[iso] ?? flyAnswer(iso), admin))
    return { key: m.key, cells, sig: cells.map(c => `${c.iso}${c.text}${c.cls}${c.title ?? ''}`).join('|') }
  }))

  /* a figure can widen a day column: tell the grid once what is drawn has changed (never on the first paint — the
     grid measures itself then) */
  const allSig = model.map(r => r.map(m => m.sig).join('/')).join('#')
  const first = useRef(true)
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return }
    onWiden?.()
  }, [allSig, onWiden])

  return (
    <>
      {ROWS.map((row, ri) => (
        <tr key={row.id} className={`flyrow ${row.kind}`} data-testid={`fly-row-${row.id}`}>
          <td className="who" title={names[row.id].name}>
            {names[row.id].std
              ? <><span className="frl-long">{names[row.id].name}</span><span className="frl-short">{SHORT[row.id]}</span></>
              : names[row.id].name}
          </td>
          <td className="bal" />
          {padL && <td className="lwph lwph-l" ref={phL} />}
          {model[ri]!.map(m => <FlyCells key={m.key} row={row.id} sig={m.sig} cells={m.cells} onTap={tapRef.current} />)}
          {padR && <td className="lwph lwph-r" ref={phR} />}
        </tr>
      ))}
      {work && createPortal(<Working row={work.row} iso={work.iso} x={work.x} y={work.y} />, document.getElementById('page-leavewar') ?? document.body)}
    </>
  )
})

/** The working for one seat on one day — the resolver's own numbers, so the box can never disagree with the rows or
 *  with the SANS calendar. Read on every paint; nothing in it can be pressed. */
function Working({ row, iso, x, y }: { row: RowId; iso: string; x: number; y: number }) {
  const s: Seat = row.endsWith('-p') ? 'p' : 'w'
  const a = flyAnswer(iso)
  const f = dayFacts(iso)
  const avail = s === 'p' ? f.availP : f.availW
  const dash = (n: number | null) => (n === null ? '–' : show(n))
  return (
    <div className="flywork" role="dialog" aria-label={`${s === 'p' ? 'Pilots' : 'WSOs'}, ${dayLabel(iso)}`} data-testid="fly-working" style={{ left: x, top: y }}>
      <div className="flywork-hd">{s === 'p' ? 'Pilots' : 'WSOs'} <span>{dayLabel(iso)}</span></div>
      <div className="flywork-ln" data-testid="fly-working-req"><span>Required</span><b>{a.reqFrom[s] === 'nf' ? 'NF' : dash(a.req[s])}</b></div>
      <div className="flywork-ln" data-testid="fly-working-avail"><span>Available</span><b>{dash(avail)}</b></div>
      <div className="flywork-ln" data-testid="fly-working-sans"><span>SANS committed to fly</span><b>{show(sansFly(iso)[s] || 0)}</b></div>
      <div className={`flywork-ln need${(a.need[s] ?? 0) > 0 ? ' short' : ''}`} data-testid="fly-working-need"><span>Still needed</span><b>{dash(a.need[s])}</b></div>
    </div>
  )
}
