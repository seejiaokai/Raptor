// THE FOUR ROWS AT THE FOOT OF THE MANNING BLOCK — Required P, Required W, Available P, Available W (the Inputs / SANS
// redesign, plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.3; owner D617, D626, D637, D640).
//
// WHERE THEY SIT — D665 (8 Oct 26). His first answer was "Under the event rows" (D637), and they were built there;
// shown both placements side by side on the running build he chose the Manning block: the last rows of it, under the
// squadron's own counts and above the Archive bar. So they fold away with the Manning button, and in Rearrange they
// carry no grip and no eye — the SANS calendar reads them, so they are never dragged elsewhere or hidden. No day is
// judged by them (they are not Manning RULES: no amber, no red of their own, nothing towards "under-manned").
//
// AND A COUNTER MAY STAND AMONG THEM — D674 (8 Oct 26: "Can rearrange allow newly created counter rows be allowed to
// moved to anywhere in between the fixed blue dot rows? Even to below the 4 as well."). The four are no longer always
// the block's last rows: CountRows hands the squadron's counter rows over in five RUNS (`runs` — above Required P,
// under each of the four) and this component draws each run in its place. The four keep their own order and still
// carry no grip and no cross; while an admin rearranges, each is a place to DROP a counter (`data-mrow` = its token,
// engine/fixedrows.ts — what the grid's one row drag hit-tests) and wears the landing bar when a counter is held over
// it. Nothing that READS the four cares where they sit: the calendars find the Available rows by their rule ids.
//
// The SANS calendar's "still needed" is the required figure, less those the Leave War shows available, less the SANS
// committed to fly (D617) — and this is where the first two are SEEN and, for an admin, TYPED (FlyEdit.tsx — a click
// on a Required cell puts the one box over it): the day's required pilots and WSOs, straight above the count of who
// the war has for each seat.
//
//   · A REQUIRED cell shows the one resolver's figure for the day (sync.ts flyMonth → state/flyplan-model.ts planFor):
//     the number, "NF" on a no-fly day, or a dash where no figure applies. The day a RUNNING figure starts wears a
//     small corner mark, its title saying "16 from Tue 6 Jan onward".
//   · An AVAILABLE cell shows the war's own count for the seat (engine/availrows.ts — never a SANS man), red where it
//     is under its Required. A tap opens the WORKING — required, available, SANS committed to fly, still needed —
//     read only, for everyone.
//   · A member sees all four rows, read only.
//   · THE NAMES. Required P and Required W are FIXED (D668). Available P and Available W are the squadron's to rename
//     and re-define (D640): for an admin the name is a button that opens the counter form for that row, as a count
//     row's name opens its sheet (Matrix owns the form — `onEditAvail`).
//
// TWO STORES, HEARD HERE. The figures are the scheduler's records and the counts are the war's, so this component
// subscribes ITSELF to both signals (`usePlanVersion`, `useWarFacts`) — Matrix and its memo firewall are not touched,
// and a figure typed on another screen repaints these rows with no reload. Each drawn month's cells are memoised on a
// signature of what they SHOW, built from the resolver's own answers: a running figure or a weekday rule that began
// months earlier moves those answers, so a month cannot miss a change dated outside it (both readers' finding 2).
//
// THE ROW CONTRACT, to the letter (performance.md §E — the owner's iPhone is the gate): every row carries `who`, `bal`,
// the two placeholders and ONE cell per drawn day, exactly as the count rows above them do. The cells are
// `req-p-<iso>` / `req-w-<iso>` / `avail-p-<iso>` / `avail-w-<iso>` — never an `event-`, `cell-` or `count-` prefix:
// the grid's drag code hit-tests those.

import { Fragment, memo, useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode, type RefCallback } from 'react'
import { createPortal } from 'react-dom'
import { FIXED_ROWS, type DayInfo } from '../engine'
import {
  availRowNames, dayFacts, flyAnswer, flyMonth, sansFly, usePlanVersion, useWarFacts,
  type DayAnswer,
} from '../sync'
import { dayLabel } from './dates'
import { popAt } from './popat'
import { FlyEditor, REQ_NAME, type FlyEditAt, type ReqRow } from './FlyEdit'
import { ReqPanel } from './ReqPanel'
import { planPick } from './reqpick'
import type { ReqSelection } from './select'

/** What the grid's drag hands over, and how the grid tells these rows to let go: a drag over the Required rows calls
 *  `pick`; a pick of anything ELSE on the grid (people's days, an event line) calls `close`. A ref, not state in
 *  Matrix — a pick must not re-render the ~25,000-node grid. */
export interface FlyPickApi { pick: (sel: ReqSelection) => void; close: () => void }

type Seat = 'p' | 'w'
type RowId = 'req-p' | 'req-w' | 'avail-p' | 'avail-w'
const ROWS: readonly { id: RowId; seat: Seat; kind: 'req' | 'avail' }[] = [
  { id: 'req-p', seat: 'p', kind: 'req' },
  { id: 'req-w', seat: 'w', kind: 'req' },
  { id: 'avail-p', seat: 'p', kind: 'avail' },
  { id: 'avail-w', seat: 'w', kind: 'avail' },
]
/** each row's own testid, top to bottom */
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
          onClick={avail || c.cls.includes(' editable') ? e => onTap(row, c.iso, e.currentTarget) : undefined}
        >
          {c.text}
        </td>
      ))}
    </>
  )
}, (a, b) => a.sig === b.sig && a.row === b.row && a.onTap === b.onTap)

export const FlyRows = memo(function FlyRows({ days, admin, padL, padR, phL, phR, onWiden, pickApi, onEditAvail, runs, arranging, dragOver, dragAfter }: {
  /** The squadron's counter rows, in five runs: `runs[0]` is drawn above Required P and `runs[k]` just under the k-th
   *  of the four (D674). Absent = the four alone. They are new elements at every paint of the grid, so this component
   *  re-renders with it — which is why `model` below is memoised: a re-render then costs four rows of memoised cells. */
  runs?: ReactNode[][]
  /** an admin is rearranging: each of the four is a place to drop a counter (never a row to pick up) */
  arranging?: boolean
  /** the row a dragged counter is held over — a fixed row's token when it is one of these — and which half of it */
  dragOver?: string | null
  dragAfter?: boolean
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
  /** where the grid's drag hands a pick over the Required rows (Matrix wires it into `select.ts`) */
  pickApi?: MutableRefObject<FlyPickApi | null>
  /** open the counter form for one of the two Available rows (`availp` / `availw`) — an admin's tap on its name */
  onEditAvail?: (ruleId: 'availp' | 'availw') => void
}) {
  /* the two signals: the scheduler's (the plan's rows, the SANS commitments) and the war's
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
    const av = availRowNames()
    return {
      /* the Required rows' names are FIXED (D668): never read from a store */
      'req-p': { name: REQ_NAME['req-p'], std: true },
      'req-w': { name: REQ_NAME['req-w'], std: true },
      'avail-p': { name: av.p, std: av.p === AVAIL_DEFAULTS.p },
      'avail-w': { name: av.w, std: av.w === AVAIL_DEFAULTS.w },
    } as Record<RowId, { name: string; std: boolean }>
    // eslint-disable-next-line react-hooks/exhaustive-deps -- as above
  }, [planV, warV])

  /* THE WORKING — the box a tap on an Available cell opens. Screen-fixed and portalled out of the table (a box cannot
     live inside a <tr>), a small menu like the event box: a press outside, Escape, a scroll or a resize closes it. */
  const [work, setWork] = useState<{ row: RowId; iso: string; tid: string; x: number; y: number } | null>(null)
  /* THE ONE BOX — an admin's click on a Required cell types its figure in place (FlyEdit.tsx). At most one at a time;
     which form it takes — an input, or the app's own number pad — follows the POINTER that made the click, kept from
     the press before it (a click itself does not say). With no press seen (a keyboard, a test) the screen's own kind
     decides. */
  const [edit, setEdit] = useState<FlyEditAt | null>(null)
  const lastPtr = useRef('')
  const adminRef = useRef(admin)
  adminRef.current = admin
  useEffect(() => {
    if (!admin) { setEdit(null); return }
    const onDown = (e: PointerEvent) => { lastPtr.current = e.pointerType || 'mouse' }
    document.addEventListener('pointerdown', onDown, true)
    return () => document.removeEventListener('pointerdown', onDown, true)
  }, [admin])
  const dates = useMemo(() => days.map(d => d.date), [days])
  const same = (a: FlyEditAt | null, b: FlyEditAt) => !!a && a.row === b.row && a.iso === b.iso
  const moveEdit = useRef((from: FlyEditAt, row: ReqRow, iso: string) => setEdit(cur => (same(cur, from) ? { row, iso, touch: from.touch } : cur)))
  const closeEdit = useRef((from: FlyEditAt) => setEdit(cur => (same(cur, from) ? null : cur)))

  /* A PICKED BLOCK and its panel (ReqPanel.tsx; plan §3.3 "Picking several"). The cells that will take the number
     stay lit while the panel is up — through React, as a class in what each cell SHOWS, because the gesture wipes its
     own paint on release. `include` lives here for the same reason: it changes which cells are lit. A new pick while
     the panel is up replaces the block and the same panel follows it. */
  const [pick, setPick] = useState<{ sel: ReqSelection; include: boolean } | null>(null)
  useEffect(() => {
    if (!pickApi) return
    pickApi.current = admin
      ? { pick: sel => { setEdit(null); setPick({ sel, include: false }) }, close: () => setPick(null) }
      : { pick: () => {}, close: () => {} }
    if (!admin) setPick(null)
    return () => { pickApi.current = null }
  }, [pickApi, admin])
  const closePick = useRef(() => setPick(null))
  const setInclude = useRef((v: boolean) => setPick(cur => (cur ? { ...cur, include: v } : cur)))

  const tapRef = useRef((row: RowId, iso: string, el: HTMLElement) => {
    if (row === 'req-p' || row === 'req-w') {
      /* a no-fly day needs nobody: its cell is not typed (its title says where the day is changed) */
      if (!adminRef.current || flyAnswer(iso).reqFrom[row === 'req-p' ? 'p' : 'w'] === 'nf') return
      const touch = lastPtr.current
        ? lastPtr.current !== 'mouse'
        : typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
      setEdit({ row, iso, touch })
      return
    }
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

  /* per row, per month: the cells and their signature. Worked out once per change to what they can show — `months`
     is new whenever either store's signal moves — never once per paint of the grid (see `runs`). */
  const model = useMemo(() => {
    /* the cells of a picked block that will take the number — `reqpick.ts`, the same answer Apply writes from */
    const lit = new Set<string>()
    if (pick) for (const iso of planPick(pick.sel.dates, flyAnswer, pick.include).take) for (const r of pick.sel.rows) lit.add(`req-${r}-${iso}`)
    return ROWS.map(row => months.map(m => {
      const cells = m.dates.map(iso => {
        const c = cellOf(row, iso, m.answers[iso] ?? flyAnswer(iso), admin)
        return lit.has(`${row.id}-${iso}`) ? { ...c, cls: c.cls + ' pick' } : c
      })
      return { key: m.key, cells, sig: cells.map(c => `${c.iso}${c.text}${c.cls}${c.title ?? ''}`).join('|') }
    }))
  }, [months, admin, pick])

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
      {ROWS.map((row, ri) => {
        /* this row's place in the block's order (D674) — what a dragged counter is dropped before or after */
        const token = FIXED_ROWS[ri]!
        const over = arranging && dragOver === token ? (dragAfter ? ' dragover after' : ' dragover') : ''
        return (
        <Fragment key={row.id}>
        {runs?.[ri]}
        <tr className={`flyrow ${row.kind}${over}`} data-testid={`fly-row-${row.id}`} data-mrow={arranging ? token : undefined}>
          <td className="who" title={names[row.id].name}>
            {(() => {
              const text = names[row.id].std
                ? <><span className="frl-long">{names[row.id].name}</span><span className="frl-short">{SHORT[row.id]}</span></>
                : names[row.id].name
              /* an Available row's name is the way to its form, for an admin (D640); a Required row's never is (D668) */
              if (row.kind !== 'avail' || !admin || !onEditAvail) return text
              return (
                <button
                  type="button" className="flyname" data-testid={`fly-name-${row.id}`}
                  title={`Rename ${names[row.id].name}, or change who it counts`}
                  onClick={() => onEditAvail(row.id === 'avail-p' ? 'availp' : 'availw')}
                >{text}</button>
              )
            })()}
          </td>
          <td className="bal" />
          {padL && <td className="lwph lwph-l" ref={phL} />}
          {model[ri]!.map(m => <FlyCells key={m.key} row={row.id} sig={m.sig} cells={m.cells} onTap={tapRef.current} />)}
          {padR && <td className="lwph lwph-r" ref={phR} />}
        </tr>
        </Fragment>
        )
      })}
      {runs?.[ROWS.length]}
      {work && createPortal(<Working row={work.row} iso={work.iso} x={work.x} y={work.y} />, document.getElementById('page-leavewar') ?? document.body)}
      {edit && createPortal(
        <FlyEditor key={`${edit.row}-${edit.iso}`} at={edit} dates={dates} onMove={moveEdit.current} onClose={closeEdit.current} />,
        document.getElementById('page-leavewar') ?? document.body,
      )}
      {pick && createPortal(
        <ReqPanel pick={pick.sel} include={pick.include} onInclude={setInclude.current} onClose={closePick.current} />,
        document.getElementById('page-leavewar') ?? document.body,
      )}
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
