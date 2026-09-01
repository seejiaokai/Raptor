import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type TouchEvent } from 'react'
import {
  addDays,
  balanceOf,
  biddingClosed,
  canDecide,
  canEditCell,
  canEditRow,
  catClass,
  catText,
  codeOf,
  columnKindFor,
  displayCell,
  evaluatePeriod,
  groupOf,
  assignGroup,
  groupLabel,
  OTHER_ID,
  OTHER_LABEL,
  inSquadron,
  isBiddable,
  isDuty,
  opsCatOf,
  orderedFigures,
  DEFAULT_FIGURE_ID,
  dayName,
  inBidWindow,
  isWeekend,
  monthsIn,
  parseCell,
  raptorOwns,
  shiftedFrom,
  stateOf,
  type Group,
  type Person,
} from '../engine'
import { groupsInOrder, groupPriorityIds, lwHistEpoch, moveGroupTo, moveGroupPriorityTo, addEventRow, autoSortRoster, DEFAULT_EVENT_ROWS, displayRoster, eventRowUsed, getState, MAX_EVENT_ROWS, moveCells, movableCells, moveManningRowTo, moveProblem, moveEvent, moveEventProblem, moveRosterRow, orderedManningIds, removeEventRow, resetManningRules, setPostOut, setShowSans, type MoveResult, type EventMoveResult } from '../state/store'
import { BidPicker, DecisionSheet, PostOutSheet, RaptorSheet } from './BidPicker'
import { CounterSheet, FigureBreakdownSheet, PersonFiguresSheet } from './CounterSheet'
import { PersonSheet } from './PersonSheet'
import { CountRows } from './CountRows'
import { CounterForm } from './CounterForm'
import { ManningSheet } from './ManningSheet'
import { EventRows } from './EventRows'
import { EventSheet } from './EventSheet'
import { monthInView } from './monthview'
import { wireSelect, wireMove, daysBetween, paintLanding, clearLanding, paintEventLanding, eventMoveDateAt, earliestDate, type Cell, type Selection, type SelectCtx } from './select'
import { GroupSheet } from './GroupSheet'
import { SelectSheet } from './SelectSheet'
import { RemarksSheet } from './RemarksSheet'
import { leaveInputAt } from '../sync'
import { useVersion } from './useStore'
import './matrix.css'

/** Rounds for display only — 4.5 stays 4.5, 4 does not become "4.0". The
 *  same rule the count rows use; nothing in this engine rounds a real
 *  figure. */
const show = (n: number) => String(Math.round(n * 10) / 10)

/** A move refusal, in plain words for the move banner. */
function moveReason(r: Exclude<MoveResult, 'moved'>): string {
  switch (r.reason) {
    case 'occupied': return `That lands on ${r.at} which is already booked — pick another day.`
    case 'raptor': return 'One of those is filed on the Inputs page and cannot be moved here.'
    case 'window': return 'That lands outside what you can edit — pick another day.'
    default: return 'Nothing to move.'
  }
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/** The month abbreviation for a date, but only on that month's first day —
 *  `null` every other day. The header renders it above the day number so a
 *  quarter running 01…31 twice says which "01" is which. */
function monthLabel(date: string): string | null {
  if (date.slice(8, 10) !== '01') return null
  return MONTHS[Number(date.slice(5, 7)) - 1]
}

/** Whether a person's row rides the roster for a visible month window
 *  ('yyyy-mm|yyyy-mm', or '' meaning no measurement → everyone). A
 *  posted-out person rides every month up to and including the one holding
 *  their last day and drops off after it (owner, 19 Aug 26 — "once I hit the
 *  next month… the row disappears"); a late joiner mirrors it at the other
 *  end. Month granularity on purpose: scrolling inside a month never
 *  reshuffles the rows, only crossing a boundary does. */
function rowInWindow(p: Person, win: string): boolean {
  if (!win) return true
  const [first, last] = win.split('|')
  if (p.to !== null && p.to.slice(0, 7) < first!) return false
  if (p.from !== null && p.from.slice(0, 7) > last!) return false
  return true
}

/* The ground-crew free-text role-label editor (`PersLabel`) was REMOVED
   (owner, 28 Aug 26 — "i can edit personnel, dont need to show that, just leave
   it as the callsign/name"). In Rearrange, a ground-crew row used to turn its
   name column into a "Maint / Line" edit box; the owner does not want that
   editing, so the row now shows the same callsign + category chip as every
   other row, in both modes. The stored labels and the store's
   `personLabel`/`setPersLabel` seam are untouched (roster.test.ts still covers
   them) — only the on-grid editor is gone. */

/* The two kinds of row the one drag machine (startRowDrag) can reorder. */
type RowDragCfg = {
  /** querySelector for a draggable row (and for the ordered list at drop). */
  sel: string
  /** read a row element's id (null if it isn't one). */
  idOf: (el: Element) => string | null
  /** commit: move `from` to sit before `beforeId` (end when null). */
  move: (from: string, beforeId: string | null) => void
}
const ROSTER_DRAG: RowDragCfg = {
  sel: '[data-testid^="row-"]',
  idOf: el => el.getAttribute('data-testid')?.slice(4) ?? null,
  move: moveRosterRow,
}
const MANNING_DRAG: RowDragCfg = {
  sel: '[data-mrow]',
  idOf: el => el.getAttribute('data-mrow'),
  move: moveManningRowTo,
}
/* The group editor's two lists reorder with the SAME machine — display order
   and the separate who-wins priority (owner, 28 Aug 26). */
const GROUP_DRAG: RowDragCfg = {
  sel: '[data-grow]',
  idOf: el => el.getAttribute('data-grow'),
  move: moveGroupTo,
}
const GROUP_PRIO_DRAG: RowDragCfg = {
  sel: '[data-gprio]',
  idOf: el => el.getAttribute('data-gprio'),
  move: moveGroupPriorityTo,
}

export function Matrix() {
  /* kept in a name (not just subscribed) so store-reading memos below can
     re-derive on every store change — `movers` reads live grid state, and a
     memo keyed only on the selection went stale when a sync pass changed a
     selected cell under an armed move */
  const version = useVersion()
  const { people, period, grid, states, requirements, role, viewer, eventDefs, openings, ledger, wars, figureOrder, manningHidden, eventRows, showSans, focusDate, focusSeq, qualCatalog } = getState()
  const dates = period.days.map(d => d.date)
  // Memoized on the store objects (the store replaces what it writes, so
  // identity IS change): rules-as-data made a day's evaluation walk every
  // rule's own filter, and paying that for all 365 days again on every
  // VIEW-state render (a sheet opening, Rearrange toggling) is waste the old
  // fixed-kind lookup merely tolerated.
  const verdicts = useMemo(
    () => evaluatePeriod(people, grid, states, requirements, dates),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [people, grid, states, requirements, period],
  )
  // Whether the LAST event row still carries any text or band — the remove
  // control is disabled while it does, so nothing is dropped unseen (owner,
  // 18 Aug 26; the store refuses it too).
  /* across EVERY war, not just the open one — eventRows is squadron-wide, so
     the button must stay disabled while any year's war still uses the line
     (review fix, 19 Aug 26; the store's removeEventRow guard is the same
     check, this only keeps the button honest about it) */
  const lastEventRowUsed = eventRowUsed(eventRows - 1)

  // The colour a whole day column takes from its events: light green for an
  // off day (a PH), orange for a no-leave day. Computed once per day and read
  // into both the header and the body cells, so a tag colours the whole
  // column, not just the event rows — finding a holiday in 90 columns should
  // not need reading the top two rows. `work` never colours the column (its
  // own word goes red instead), so it maps to no class here.
  const evKind = new Map<string, string>()
  for (const d of period.days) {
    const k = columnKindFor(eventDefs, d, period.bands)
    if (k === 'off') evKind.set(d.date, 'evoff')
    else if (k === 'nolv') evKind.set(d.date, 'evnolv')
  }

  // Which cell is open, not which sheet is open: what the sheet OFFERS is
  // derived from the stage and the role, so a period that moves on — or a
  // role that changes — while a sheet is open cannot leave the wrong
  // controls on screen.
  const [open, setOpen] = useState<{ id: string; callsign: string; date: string } | null>(null)
  const close = () => setOpen(null)
  // The DRAG-SELECTION (owner, 27 Aug 26): the rectangle the last drag left,
  // and the sheet it opens. `moveSel` is the selection currently being MOVED
  // (Task E) — sheet closed, waiting for a drop. Both cleared on a stage/war
  // change so a stale block cannot act on the wrong screen.
  const [sel, setSel] = useState<Selection | null>(null)
  const [moveSel, setMoveSel] = useState<Selection | null>(null)
  const [moveErr, setMoveErr] = useState('')
  // Phone move-mode: the day a tap has STAGED, awaiting a Confirm (there is no
  // undo, so a phone drop is a two-step — preview then commit, owner 27 Aug 26).
  // Desktop lands on the click and never sets this.
  const [movePreview, setMovePreview] = useState<string | null>(null)
  // The EVENT counterpart of moveSel (owner, 31 Aug 26 — "drag an existing event
  // to move it"): the event span being moved (its own line + from/to), waiting
  // for a drop onto a day. Same phone stage/desktop-commit split, same
  // clear-on-stage-change guard below.
  const [eventMoveSel, setEventMoveSel] = useState<{ line: number; from: string; to: string } | null>(null)
  const [eventMoveErr, setEventMoveErr] = useState('')
  const [eventMovePreview, setEventMovePreview] = useState<string | null>(null)
  // Whether the open cell is a POSTED-OUT day (admin tapped a greyed cell to
  // undo it, owner 18 Aug 26). A day before the person joined is blank, not a
  // post-out, so it is excluded — there is nothing to undo there.
  const openPerson = open ? people.find(p => p.id === open.id) : undefined
  const openPostedOut =
    !!open && !!openPerson && !inSquadron(openPerson, open.date) &&
    !(openPerson.from !== null && open.date < openPerson.from)
  // ONE selected figure, shared by every row, tracked by its stable ID so a
  // reorder keeps the SAME figure on screen rather than whatever now sits in
  // its old slot. Giving each row its own would let them desync — row 1
  // showing LVE BAL while row 2 shows MED USED — worse than no column at all.
  const figures = orderedFigures(figureOrder)
  const [shownId, setShownId] = useState(DEFAULT_FIGURE_ID)
  const [picking, setPicking] = useState(false)
  // Whose counter was tapped, and WHICH figure to break down (owner, 17 Aug
  // 26). A counter-cell tap opens the column's shown figure; a row tapped
  // inside the person-figures sheet names its own.
  const [balOpen, setBalOpen] = useState<{ person: string; figureId: string } | null>(null)
  // Whose CALLSIGN was tapped — the all-figures sheet, for every role
  // (owner, same day: "everyone should be able to click on that person's
  // name and see these logics").
  const [whoOpen, setWhoOpen] = useState<string | null>(null)
  const [editingWho, setEditing] = useState<string | null>(null)
  // Which event cell the admin has tapped to edit, or null. Keyed by line +
  // day; the Event sheet reads the current text or band off the store.
  // `to` is set only when a DRAG selected a span (owner, 27 Aug 26) — the sheet
  // then opens pre-set to that range; a single click leaves it undefined.
  const [eventEdit, setEventEdit] = useState<{ line: number; date: string; to?: string } | null>(null)
  // Which manning count row's explainer is open (owner, 19 Aug 26 — a tap on
  // the row's name says what it counts and where its colours turn on).
  const [manningInfo, setManningInfo] = useState<string | null>(null)
  // The counter form (owner, 19 Aug 26): `false` closed, `null` building a
  // NEW counter, an id editing that one. Reached from + Counter in the
  // Rearrange tools and from the explainer sheet's Edit counter… button.
  const [counterEdit, setCounterEdit] = useState<string | null | false>(false)
  // The admin group editor (owner, 28 Aug 26) — opened from the corner cell
  // above CS/Name.
  const [groupEdit, setGroupEdit] = useState(false)
  // Edit-mode roster rearranging (owner, 18 Aug 26). Admin-only view state: it
  // turns the drag handles on, so an admin reading the grid does not nudge a
  // row by accident. Auto-sort stays available without it.
  const [arranging, setArranging] = useState(false)
  // "Reset counters" arms rather than firing (it discards custom counters);
  // disarmed whenever Rearrange closes so it never sits armed unseen.
  const [armCounterReset, setArmCounterReset] = useState(false)
  useEffect(() => { if (!arranging) setArmCounterReset(false) }, [arranging])
  // Pointer-based drag (owner, 18 Aug 26 — the roster rearranges on a phone
  // too, where HTML5 drag-and-drop does nothing). `dragId`/`dragOverRef` are
  // refs because they change many times a second during a drag and must not
  // repaint the grid; the two bits of STATE mirror them only for the row
  // highlight. One window pointermove/pointerup pair is attached for the life
  // of a drag and torn down on release.
  const dragId = useRef<string | null>(null)
  /* `after` says which HALF of the hovered row the pointer is in (review fix,
     19 Aug 26). Insert-before-only had two dead spots: dropping a row on the
     row directly beneath it re-inserted it exactly where it was (a silent
     no-op), and the last position of the roster was unreachable — the store's
     move-to-end path (beforeId null) had no gesture that produced it. The
     lower half of a row now means "after this row", so both work. */
  const dragOverRef = useRef<{ id: string, after: boolean } | null>(null)
  // The teardown for a drag in flight, so an unmount (role change, war switch)
  // can end it — otherwise its window listeners leak and the row stays stuck
  // in the .dragging highlight.
  const dragCleanup = useRef<(() => void) | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [dragAfter, setDragAfter] = useState(false)

  /* ONE drag machine, two kinds of row (owner, 28 Aug 26 — "the drag and drop
     rows function is already designed on other areas of the app"). The roster
     rows and the manning count rows now reorder by the SAME pointer drag; a
     `cfg` says which DOM rows to hit-test, how to read a row's id, and which
     store move to commit. Manning rows are hit-tested by `data-mrow` rather
     than a `data-testid` prefix, because their day CELLS are `count-<id>-<date>`
     and a `[data-testid^="count-"]` closest() would catch a cell, not the row. */
  function startRowDrag(e: React.PointerEvent, id: string, cfg: RowDragCfg) {
    if (e.button != null && e.button !== 0) return // primary pointer only
    e.preventDefault()
    dragId.current = id
    setDraggingId(id)
    const move = (ev: PointerEvent) => {
      const el = document.elementFromPoint(ev.clientX, ev.clientY)
      const row = el && (el as Element).closest ? (el as Element).closest(cfg.sel) : null
      const overId = row ? cfg.idOf(row) : null
      /* which half decides before/after; a zero-height rect (jsdom) reads as
         "before", keeping the old semantics where layout cannot answer */
      let after = false
      if (row) {
        const r = (row as HTMLElement).getBoundingClientRect()
        after = r.height > 0 && ev.clientY > r.top + r.height / 2
      }
      const cur = dragOverRef.current
      if (overId !== (cur?.id ?? null) || after !== (cur?.after ?? false)) {
        dragOverRef.current = overId ? { id: overId, after } : null
        setDragOver(overId); setDragAfter(after)
      }
    }
    // `commit` is false for a cancel (a system gesture, multi-touch, or the
    // grid unmounting mid-drag): tear down without moving anything. Without a
    // pointercancel path the pointerup never comes and the listeners — and the
    // stuck highlight — leak, most likely on the phone drag this was built for.
    const end = (commit: boolean) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
      dragCleanup.current = null
      const from = dragId.current
      const over = dragOverRef.current
      dragId.current = null
      dragOverRef.current = null
      setDraggingId(null)
      setDragOver(null)
      setDragAfter(false)
      if (commit && from && over && over.id !== from) {
        /* "after row X" resolves to "before the row that follows X" in the
           RENDERED order — the DOM is what the user is looking at, and the
           hit-test above already trusts it. No follower means the true end
           of the roster, the store's beforeId:null path (unreachable from
           this gesture before the rework). Resolving to `from` itself means
           the drop lands exactly where the row already is — skip, or the
           store's before-itself guard would have to save us. */
        let beforeId: string | null = over.id
        if (over.after) {
          const rows = [...document.querySelectorAll(cfg.sel)]
            .map(el => cfg.idOf(el)).filter((x): x is string => x != null)
          const ix = rows.indexOf(over.id)
          beforeId = ix >= 0 ? (rows[ix + 1] ?? null) : over.id
        }
        if (beforeId !== from) {
          cfg.move(from, beforeId)
          /* A manning reorder shuffles the rows of the frozen LEFT column, whose
             grip/eye tools live in a `position: sticky` cell. iOS Safari does not
             reliably repaint a sticky column after that DOM churn, so the just
             -moved rows can sit drawn WITHOUT their tools until something forces a
             redraw (owner, 30 Aug 26 — "sometimes I see these showing, sometimes I
             do not … after I tried to drag and drop multiple times"). A one-frame
             self-assignment of the scroller's own scrollLeft re-solves every sticky
             offset in the scrollport and repaints them; it moves nothing, and —
             unlike a transform on the sticky cell itself — cannot break the
             stickiness. Manning kind only; the roster/group drags don't touch this
             column. */
          if (cfg === MANNING_DRAG) {
            const w = wrapRef.current
            if (w) requestAnimationFrame(() => { w.scrollLeft = w.scrollLeft })
          }
        }
      }
    }
    const up = () => end(true)
    const cancel = () => end(false)
    dragCleanup.current = () => end(false)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
  }

  // A drag in flight must not outlive the grid, and rearrange mode is the
  // admin's alone: end any drag and drop out of arrange mode the moment the
  // component unmounts or the role stops being admin (a logout mid-arrange).
  useEffect(() => () => { dragCleanup.current?.() }, [])
  useEffect(() => { if (role !== 'admin' && arranging) setArranging(false) }, [role, arranging])
  const shownIx = Math.max(0, figures.findIndex(f => f.id === shownId))
  const shown = figures[shownIx]
  // Everything a figure needs to read a person's number. `wars` is LeaveWar[],
  // which satisfies LeaveSource[] structurally, so it passes straight in.
  const figureCtx = { openings, ledger, sources: wars }
  const cycle = (by: number) => setShownId(figures[(shownIx + by + figures.length) % figures.length].id)

  // Swipe across the counter column to cycle it — the fast path, beside the
  // sheet's guaranteed one. Bound on the wrapper rather than on each cell so
  // one pair of listeners covers a column of twenty-odd, and filtered to
  // touches that START on a `.bal` cell so a swipe anywhere else still
  // scrolls the grid, which is what a horizontal drag must go on doing.
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const onTouchStart = (e: TouchEvent) => {
    const on = (e.target as HTMLElement).closest?.('.bal')
    swipe.current = on ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null
  }
  const onTouchEnd = (e: TouchEvent) => {
    const from = swipe.current
    swipe.current = null
    if (!from) return
    const dx = e.changedTouches[0].clientX - from.x
    const dy = e.changedTouches[0].clientY - from.y
    // Horizontal, and decisively so: 40px across and more sideways than up,
    // or every scroll of the rows would flip the counter under the thumb.
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return
    cycle(dx < 0 ? 1 : -1)
  }

  // Jumping to a month is how a year-long war is navigable at all: 365
  // columns is roughly 13,600px, and nobody finds September by dragging.
  const wrapRef = useRef<HTMLDivElement>(null)
  // Drag-select wiring: ONE delegated pointer listener on `.mx-wrap` (never
  // per-cell — the grid is ~28k nodes), reading live state through a ref so
  // the gesture always sees the current roster/dates/mode without re-binding.
  // Assigned just before the return, where rosterSequence and the mode flags
  // are in scope.
  const selCtxRef = useRef<SelectCtx | null>(null)
  useEffect(() => {
    const w = wrapRef.current
    if (!w) return
    return wireSelect(w, {
      order: () => selCtxRef.current?.order() ?? [],
      dates: () => selCtxRef.current?.dates() ?? [],
      enabled: () => selCtxRef.current?.enabled() ?? false,
      onSelect: s => selCtxRef.current?.onSelect(s),
      eventsEnabled: () => selCtxRef.current?.eventsEnabled?.() ?? false,
      onEventSelect: s => selCtxRef.current?.onEventSelect?.(s),
    })
  }, [])
  // A stage or war change drops any open selection or in-flight move, so a
  // block picked on one screen can never act on another. An UNDO/REDO does the
  // same (lwHistEpoch, bumped on every restore): a restore can clear the very
  // cells a move or an open sheet was acting on, and leaving that gesture live
  // stranded the grid in move mode — the next drag read as a landing and no
  // sheet opened (bug test, 30 Aug 26). moveErr goes too, so no stale banner
  // message lingers.
  const histEpoch = lwHistEpoch()
  useEffect(() => { setSel(null); setMoveSel(null); setMovePreview(null); setMoveErr(''); setEventMoveSel(null); setEventMovePreview(null); setEventMoveErr('') }, [period.stage, period.id, histEpoch])
  // MOVE MODE is wired further down, after the `phone` breakpoint state it
  // reads to choose commit-on-click (desktop) vs preview-then-Confirm (phone).
  // The frozen-column overlay's own anchors (see the .mxband block below and
  // in matrix.css). `mxOuterRef` is the page-flow box the overlay is absolutely
  // placed inside; `rosterBodyRef` is the one row group it must line up with.
  const mxOuterRef = useRef<HTMLDivElement>(null)
  const bandRef = useRef<HTMLDivElement>(null)
  const rosterBodyRef = useRef<HTMLTableSectionElement>(null)
  const [phone, setPhone] = useState(false)
  const [bandTop, setBandTop] = useState<number | null>(null)

  // MOVE MODE (owner, 27 Aug 26). The picked block is dropped onto a new day.
  // `movers` are the inputs PRESENT in the selection — the empty cells the user
  // swept up are dropped, so a loose box no longer refuses as "nothing"; the
  // earliest of them (`moveAnchor`) is the block's first input, and it lands on
  // the day tapped, the rest shifting with it (gaps between inputs kept). The
  // landing is previewed live on desktop (hover) and staged before a Confirm on
  // phone (no undo). `daysBetween(moveAnchor, target)` is the shared delta.
  const movers = useMemo<Cell[]>(() => (moveSel ? movableCells(moveSel.cells) : []), [moveSel, version])
  const moveAnchor = useMemo(() => earliestDate(movers), [movers])
  const landingFor = (targetDate: string): Cell[] =>
    moveAnchor === null ? [] : movers.map(c => ({ personId: c.personId, date: addDays(c.date, daysBetween(moveAnchor, targetDate)) }))
  /* Paint the landing ONLY when the atomic commit would accept it —
     `moveProblem` is the validation half of `moveCells` itself, so the
     preview cannot show half a landing (the off-grid cells simply not
     painting) that the commit then wholly refuses. A refused hover/stage
     clears the paint and says why in the banner instead. */
  const previewAt = (targetDate: string): boolean => {
    const w = wrapRef.current
    if (!w || moveAnchor === null) return false
    const delta = daysBetween(moveAnchor, targetDate)
    if (delta === 0) { setMoveErr(''); paintLanding(w, landingFor(targetDate)); return true }
    const problem = moveProblem(movers, delta)
    if (problem) { clearLanding(w); setMoveErr(moveReason(problem)); return false }
    setMoveErr('')
    paintLanding(w, landingFor(targetDate))
    return true
  }
  const commitMove = (targetDate: string) => {
    const w = wrapRef.current
    if (moveAnchor === null) { setMoveSel(null); setMovePreview(null); return }
    const r = moveCells(movers, daysBetween(moveAnchor, targetDate))
    if (w) clearLanding(w)
    if (r === 'moved') { setMoveSel(null); setMovePreview(null); setMoveErr('') }
    else { setMoveErr(moveReason(r)); setMovePreview(null) }   // keep the mode, say why
  }
  useEffect(() => {
    const w = wrapRef.current
    if (!moveSel || !w) return
    setMoveErr(''); setMovePreview(null)
    const cleanup = wireMove(w, {
      count: movers.length,
      onHover: date => previewAt(date),                     // desktop live preview
      onPick: date => {
        // Desktop lands on the click (the hover WAS the preview); a phone has no
        // hover, so a tap stages the landing and waits for Confirm — but only a
        // landing the store would accept stages (a refused one shows its reason
        // where the Confirm button would be, never a Confirm under an error).
        if (phone) setMovePreview(previewAt(date) ? date : null)
        else commitMove(date)
      },
      onCancel: () => { clearLanding(w); setMoveSel(null); setMovePreview(null) },
    })
    return () => { clearLanding(w); cleanup() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveSel])

  // ---- EVENT move mode (owner, 31 Aug 26 — "drag an existing event to move it,
  // like LL") — the event-line twin of the roster move above. `wireMove` is
  // shared; only the target-date resolver (`eventMoveDateAt`, which reads the
  // event line's own cells) and the landing painter (`paintEventLanding`)
  // differ. The event's own start (`from`) is the anchor, so the day tapped
  // becomes the new start and the whole band/day slides with it. Previewed live
  // on desktop, staged before a Confirm on a phone — exactly like the roster.
  const eventMoveReason = (r: Exclude<EventMoveResult, 'moved'>): string =>
    r.reason === 'outside' ? 'That would run off this leave war.'
      : r.reason === 'overlap' ? 'Those days already carry an event on this line.'
        : 'Nothing to move.'
  const eventSpanDates = (from: string, to: string): string[] => {
    const out: string[] = []
    for (let d = from; d <= to; d = addDays(d, 1)) out.push(d)
    return out
  }
  const previewEventAt = (targetDate: string): boolean => {
    const w = wrapRef.current
    if (!w || !eventMoveSel) return false
    const { line, from, to } = eventMoveSel
    const delta = daysBetween(from, targetDate)
    if (delta === 0) { setEventMoveErr(''); paintEventLanding(w, line, eventSpanDates(from, to)); return true }
    const problem = moveEventProblem(line, from, to, delta)
    if (problem) { clearLanding(w); setEventMoveErr(eventMoveReason(problem)); return false }
    setEventMoveErr('')
    paintEventLanding(w, line, eventSpanDates(from, to).map(d => addDays(d, delta)))
    return true
  }
  const commitEventMove = (targetDate: string) => {
    const w = wrapRef.current
    if (!eventMoveSel) return
    const { line, from, to } = eventMoveSel
    const r = moveEvent(line, from, to, daysBetween(from, targetDate))
    if (w) clearLanding(w)
    if (r === 'moved') { setEventMoveSel(null); setEventMovePreview(null); setEventMoveErr('') }
    else { setEventMoveErr(eventMoveReason(r)); setEventMovePreview(null) }   // keep the mode, say why
  }
  useEffect(() => {
    const w = wrapRef.current
    if (!eventMoveSel || !w) return
    setEventMoveErr(''); setEventMovePreview(null)
    const cleanup = wireMove(w, {
      count: 1,
      dateAt: eventMoveDateAt,
      onHover: date => previewEventAt(date),
      onPick: date => { if (phone) setEventMovePreview(previewEventAt(date) ? date : null); else commitEventMove(date) },
      onCancel: () => { clearLanding(w); setEventMoveSel(null); setEventMovePreview(null) },
    })
    return () => { clearLanding(w); cleanup() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventMoveSel])

  const months = monthsIn(period.start, period.end)

  // The month BRACKET above the dates (owner, 18 Aug 26 — "draw a line at the
  // top of the dates that bracket the month u are looking at"): one spanning
  // cell per month, derived from the loaded days so a partial first or last
  // month brackets exactly the days it actually has on screen.
  const brackets = (() => {
    const out: { key: string; label: string; count: number }[] = []
    for (const d of dates) {
      const key = d.slice(0, 7)
      const last = out[out.length - 1]
      if (last && last.key === key) last.count++
      else out.push({ key, label: MONTHS[Number(d.slice(5, 7)) - 1]!, count: 1 })
    }
    return out
  })()

  // Measured live rather than read off the CSS custom properties: the two
  // frozen columns change width at the phone breakpoint, and a hard-coded
  // offset would be wrong on one of the two devices. Shared by the jump and
  // by the in-view readout, which both need to know where the day columns
  // actually begin.
  const frozenWidth = (wrap: HTMLElement): number =>
    ['.who', '.bal']
      .map(sel => wrap.querySelector<HTMLElement>(sel)?.getBoundingClientRect().width ?? 0)
      .reduce((a, b) => a + b, 0)

  const jumpTo = (date: string) => {
    const wrap = wrapRef.current
    const cell = wrap?.querySelector<HTMLElement>(`[data-testid="head-${date}"]`)
    if (!wrap || !cell) return
    // Mark this as a jump so the anchor correction below re-centres it even on
    // touch (see jumpAtRef): a jump can cross many month boundaries at once,
    // hiding rows and shrinking columns enough to leave the target far off the
    // frozen edge if the re-centre is skipped.
    jumpAtRef.current = Date.now()
    // Scrolling BY a delta rather than TO an absolute keeps this correct
    // wherever the grid happens to be scrolled already.
    wrap.scrollLeft += cell.getBoundingClientRect().left - wrap.getBoundingClientRect().left - frozenWidth(wrap)
  }

  // Which month the grid is showing, so the strip says where you ARE and not
  // only where you can go. Held as state rather than derived during render
  // because it is a fact about scroll position, which no render sees.
  // WHICH MONTH IS SHOWING — held in a ref and painted onto the buttons by
  // hand, NOT in React state (20 Aug 26). It was `useState`, and because this
  // component renders the whole ~25,000-node grid, every month boundary a
  // scroll crossed re-rendered all of it to move one highlight. Measured over
  // five paired 120-frame drags across the year, alternating in one browser
  // session to cancel machine drift: with the setState, 1437ms of main-thread
  // blocking, 18 long tasks, worst frozen frame 120ms; without it, 581ms, 6
  // tasks, 64ms — no overlap between the two sets of five. That re-render is
  // the "stuttery, lags the grid" sideways scroll the owner has now reported
  // three times, and it is why the previous two fixes did not land: the rAF
  // pump added on 19 Aug 26 was being starved by this, not running too slowly.
  //
  // Twelve class toggles cost nothing and touch no React tree, so the readout
  // stays live on every scroll event as it must ("the strip has to say where
  // you ARE while you move"). The ref is still the source of truth the render
  // below reads, so a re-render from any OTHER cause repaints the right
  // button rather than dropping the highlight.
  const inViewRef = useRef<string | null>(null)
  const monthsRef = useRef<HTMLDivElement>(null)
  const paintInView = (v: string | null) => {
    if (v === inViewRef.current) return
    inViewRef.current = v
    const box = monthsRef.current
    if (!box) return
    // `.months` holds month buttons and nothing else — the zoom control is
    // deliberately outside it (see the comment at that markup).
    const kids = box.children
    for (let i = 0; i < kids.length && i < months.length; i++) {
      const el = kids[i] as HTMLElement
      const on = months[i]!.label === v
      el.classList.toggle('on', on)
      if (on) el.setAttribute('aria-current', 'true')
      else el.removeAttribute('aria-current')
    }
  }

  // The visible month WINDOW — 'yyyy-mm|yyyy-mm', first and last months with
  // any day column on screen (owner, 19 Aug 26: a posted-out person's row
  // disappears "once I hit the next month"). '' means "no measurement" —
  // jsdom, or not laid out yet — and the row filter shows everyone then,
  // which is also what keeps every unit test honest about the full roster.
  // The state is only WRITTEN when the visible ROW SET actually changes
  // (visSigRef below): a drag across the whole year crosses eleven month
  // boundaries, and eleven full repaints of a ~28k-node table is what the
  // scroll-responsiveness gate exists to refuse.
  const [visWindow, setVisWindow] = useState('')
  const visSigRef = useRef<string | null>(null)
  // Where a named day column sat the instant the row set changed, so the
  // repaint can put it back. Removing (or restoring) a row lets the table's
  // auto layout re-narrow every column that row's chips had widened — all of
  // them UPSTREAM of the view — which otherwise yanks the grid sideways under
  // the reader and lands a month jump short (measured 165px off at SEP, from
  // the demo's one posted-out man leaving the roster).
  const anchorRef = useRef<{ date: string; left: number } | null>(null)
  // When the last scrollLeft move was a programmatic month/day JUMP, not a
  // finger flick. The anchor correction below is skipped on touch to protect a
  // fling's momentum, but a jump has no fling to protect and MUST re-centre or
  // it lands the wrong column at the frozen edge once posted-out rows hide. A
  // timestamp, not a boolean, so it auto-expires: a jump fires one or two
  // reflows within a fraction of a second, and a later flick can never be
  // mistaken for the jump once the window has passed.
  const jumpAtRef = useRef(0)

  // The phone ZOOM (owner, 18 Aug 26 — "a zoom function for mobile leave
  // war"). Stepped +/− buttons rather than pinch: pinch fights the browser's
  // own page zoom and the frozen columns, and a button cannot half-work.
  // `zoom` (not transform) so layout, scroll width and the sticky offsets all
  // scale together. View state, session-only, like the counter choice.
  const ZOOMS = [0.6, 0.8, 1, 1.2, 1.4]
  const [zoom, setZoom] = useState(1)
  const zoomStep = (by: number) => {
    const i = ZOOMS.indexOf(zoom)
    setZoom(ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, i + by))]!)
  }

  // The manning counts block (CREW SETS … SXO) collapses on a tap, for EITHER
  // role (owner, 19 Aug 26 — "allow both admin and norm user to hide it when
  // viewing, click to open or close"). A view preference, session-only like the
  // zoom above; forced open while an admin is Rearranging so the row reorder /
  // hide controls stay reachable.
  const [countsOpen, setCountsOpen] = useState(true)

  /* WHICH CATEGORY GROUPS ARE FOLDED AWAY (owner, 28 Aug 26 — "allow me to
     minimise categories on leave war"). Same doctrine as the manning collapse
     above: a VIEW preference, session-only and open to EITHER role — it hides
     nothing anyone is entitled to see, it just gets a group's rows out of the
     way while reading another. Nothing is folded by default, so the grid opens
     exactly as it always did. The fold is applied in `rosterSequence` (below),
     the one place both the real grid and the frozen overlay read. */
  const [folded, setFolded] = useState<Set<string>>(() => new Set())
  const toggleFold = (g: string) => setFolded(prev => {
    const next = new Set(prev)
    next.has(g) ? next.delete(g) : next.add(g)
    return next
  })

  /* THE CONFIGURED GROUPS (owner, 28 Aug 26 — the admin group editor). With the
     default list these answer exactly as the old `groupOf` / `GROUP_LABEL` did,
     so an untouched squadron is unchanged. Read once per render and shared by
     both the real grid and the frozen overlay, so the two cannot disagree about
     who sits where. */
  const groupDefs = groupsInOrder()
  const groupPriority = groupPriorityIds()
  const homeOf = (p: Person) => assignGroup(p, groupDefs, groupPriority)
  const labelOfGroup = (id: string) =>
    id === OTHER_ID ? OTHER_LABEL : (() => {
      const d = groupDefs.find(x => x.id === id)
      return d ? groupLabel(d, qualCatalog) : id
    })()
  /* The per-group swatch class. Built-in ids give back the same `g-sxo`,
     `g-ip`… classes the stylesheet already paints; a qualification id is
     slugged so a colon or space can never break the class. */
  const groupClass = (id: string) => `g-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

  // The month strip's buttons are ABSOLUTELY positioned (they must not widen
  // the frozen columns — see matrix.css), so the sticky cell they sit in has to
  // RESERVE their height by hand. That height was a hardcoded 72px (two wrapped
  // rows), but a phone wraps them to three and a higher zoom to more, so the
  // last months (NOV/DEC) spilled out of the cell and collided with the bracket
  // bar below (owner, 19 Aug 26). Measure the strip's real height and reserve
  // exactly that instead — dividing the table's CSS `zoom` back out, since the
  // cell lives inside it, so the value we set is layout px not doubled by zoom.
  const mstrowRef = useRef<HTMLDivElement>(null)
  const mstickRef = useRef<HTMLTableCellElement>(null)
  const [stripH, setStripH] = useState<number | null>(null)

  // ---- the frozen header on a phone (owner, 18 Aug 26: "when the callsign
  // row almost reaches outside the phone view, it will freeze at the top") --
  //
  // The page's one-vertical-scroll rule (10 Aug 26, the .mx-wrap comment in
  // matrix.css) stands: the wrapper still scrolls horizontally only and the
  // page still carries the vertical axis, so CSS sticky cannot pin the header
  // — its scrollport never moves vertically. Instead a fixed MIRROR of the
  // bracket + header rows appears once the real rows pass under the top bar,
  // and disappears the moment they come back. The mirror is its own tiny
  // horizontal scroller kept in lockstep with the grid's, which is what lets
  // the same `.who`/`.bal` sticky-left CSS freeze its lead columns for free.
  // Its column widths are MEASURED off the live header (the events row is
  // what widens a column, and only layout knows by how much) and pinned via
  // a fixed-layout colgroup. On DESKTOP too now (owner, 27 Aug 26 — "freeze top
  // panel for leave war on desktop … when I scroll down the top bar that has the
  // dates goes out of view, the top bar will freeze just like how the mobile
  // does it"): the app top bar stays pinned at the top (sticky, z-index 60), so
  // the mirror freezes just below it (its lower edge) the moment the real header
  // would slide under, at every width. No width gate any more.
  const headRef = useRef<HTMLTableSectionElement>(null)
  const mirrorRef = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState<{ top: number; left: number; width: number; cols: number[] } | null>(null)

  // Can this browser drive the frozen bar's horizontal follow on the COMPOSITOR
  // via a CSS scroll-driven animation (owner, 28 Aug 26 — "the top bar not
  // catching up to the horizontal scroll … glue it, keep the feel")? When yes,
  // the bar's day columns are TRANSLATED by the grid's own scroll timeline, so
  // they stay locked to the grid during a fling instead of the main-thread JS
  // follow lagging a frame or two behind (which is what he saw). When no (older
  // browsers, and jsdom — where CSS.supports is absent/false), we fall back to
  // the JS mirror below, unchanged. Detected once: support does not change mid
  // session. `scroll-timeline` + `timeline-scope` together are the two features
  // the approach needs (a named timeline on the scroller, hoisted into scope for
  // the fixed bar, which is not a descendant of the scroller).
  const [sdaActive] = useState(() => {
    try {
      return typeof CSS !== 'undefined' && typeof CSS.supports === 'function' &&
        CSS.supports('scroll-timeline: --x x') && CSS.supports('timeline-scope: --x')
    } catch { return false }
  })

  // ---- the desktop horizontal scrollbar, pinned to the foot of the SCREEN
  // (owner, 22 Aug 26: "on desktop the horizontal scroll is not tagged to the
  // screen. I need to scroll all the way down to scroll") ---------------------
  //
  // `.mx-wrap` scrolls sideways with NO height cap (the one-vertical-scroll
  // rule at the top of matrix.css), so its own horizontal scrollbar rides the
  // FOOT of a year-tall grid — unreachable until the whole page is scrolled
  // down. This is a proxy for it (the Raptor `hsSet`/`hsSync` idiom): a fixed
  // slim strip at the bottom of the viewport, as wide as the grid, whose inner
  // spacer is as wide as the grid's CONTENT so the browser sizes its thumb for
  // free. It drives `.mx-wrap.scrollLeft` and is driven back by it, both writes
  // compare-guarded so the pair settles instead of ping-ponging. Shown only
  // while the grid's own scrollbar is BELOW the fold, so the two never stack.
  // Desktop only — a phone finger-scrolls the grid and carries its own frozen
  // header; and never in jsdom, which has no layout to measure.
  const hbarRef = useRef<HTMLDivElement>(null)
  const [hbar, setHbar] = useState<{ left: number; width: number; scrollW: number } | null>(null)

  useEffect(() => {
    setStuck(null)
    // jsdom has no layout — the mirror is a browser-only creature, and a
    // 0-height header (jsdom, or not yet laid out) never activates.
    if (typeof window.matchMedia !== 'function') return
    // `force` re-measures the pinned widths even while already stuck. A plain
    // scroll keeps them (cheap, and the widths don't change as you scroll), but a
    // rotate/resize changes EVERY column width — and without a fresh measurement
    // the mirror kept the old orientation's widths until a scroll un-stuck and
    // re-pinned it (owner, 30 Aug 26 — "flip my screen horizontally … the top bar
    // is cut off to what the vertical view was … I need to scroll up then back
    // down to reset the frozen bar").
    const pin = (force: boolean) => {
      const head = headRef.current
      if (!head) { setStuck(prev => (prev ? null : prev)); return }
      const r = head.getBoundingClientRect()
      if (r.height === 0) return // jsdom, or not laid out yet — never activate
      // The app top bar stays pinned (sticky, both widths), so "the top" is its
      // LOWER edge: the mirror freezes there the instant the real header would
      // slide under it. Both phone and desktop now (owner, 27 Aug 26).
      const topEdge = document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0
      if (r.top >= topEdge) { setStuck(prev => (prev ? null : prev)); return }
      setStuck(prev => {
        if (prev && !force) return prev
        const wrap = wrapRef.current
        if (!wrap) return prev
        const wr = wrap.getBoundingClientRect()
        const cells = Array.from(head.querySelectorAll('tr:last-child > th')) as HTMLElement[]
        const cols = cells.map(c => c.getBoundingClientRect().width)
        if (cols.length === 0 || cols.some(w => !w)) return prev
        return { top: topEdge, left: wr.left, width: wr.width, cols }
      })
    }
    const onScroll = () => pin(false)
    // A rotate/resize fires BEFORE iOS has settled the new viewport, so an
    // immediate read would take the OLD geometry — re-measure on the next two
    // frames AND once more after a beat, forcing fresh widths each time.
    let raf = 0
    let t: ReturnType<typeof setTimeout> | undefined
    const remeasure = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => requestAnimationFrame(() => pin(true)))
      clearTimeout(t); t = setTimeout(() => pin(true), 300)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', remeasure)
    window.addEventListener('orientationchange', remeasure)
    window.visualViewport?.addEventListener('resize', remeasure)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', remeasure)
      window.removeEventListener('orientationchange', remeasure)
      window.visualViewport?.removeEventListener('resize', remeasure)
      cancelAnimationFrame(raf); clearTimeout(t)
    }
    // `zoom` is a dep because it changes every measured width the mirror pins.
    // `visWindow` too (19 Aug 26): a row-set change lets auto layout re-narrow
    // the columns a removed row's chips had widened, and a stuck mirror
    // pinning the OLD widths would sit misaligned over the new ones.
    // `folded` (28 Aug 26) is the same kind of row-set change — minimising a
    // category takes its rows (and their chips) out of the table.
  }, [period.id, dates.length, zoom, visWindow, folded])

  // The mirror starts life at the grid's current horizontal position, and the
  // two scrollers keep each other in lockstep from then on. Assigning an
  // unchanged scrollLeft fires no event, so the pair settles instead of
  // ping-ponging.
  useEffect(() => {
    if (stuck && mirrorRef.current && wrapRef.current) {
      const w = wrapRef.current
      if (sdaActive) {
        // Scroll-driven path: the track must NOT be scrolled (the inner table is
        // translated instead — a scrollLeft here would double the travel). Just
        // make sure the bar knows the grid's travel the instant it appears, so
        // its very first painted frame is already in step; a stale or zero
        // --lwx-max would pin the day columns at the left until the next layout.
        mxOuterRef.current?.style.setProperty('--lwx-max', String(Math.max(0, (w.scrollWidth - w.clientWidth) / zoom)))
      } else {
        // JS-mirror fallback: start the mirror at the grid's position.
        mirrorRef.current.scrollLeft = w.scrollLeft
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stuck])

  // The bottom scrollbar starts at the grid's current position the moment it
  // appears, so its thumb is never a frame out of step on show.
  useEffect(() => { if (hbar) syncHbar() }, [hbar])

  // Show / hide / size the bottom scrollbar on vertical page scroll and on
  // resize. Re-bound on the layout signals that change the grid's scroll width
  // or its box (a zoom step, a row-set reflow, a war swap, the counts block
  // folding, and the phone/desktop switch) so the measured spacer stays right.
  useEffect(() => {
    measureHbar()
    window.addEventListener('scroll', measureHbar, { passive: true })
    window.addEventListener('resize', measureHbar)
    return () => {
      window.removeEventListener('scroll', measureHbar)
      window.removeEventListener('resize', measureHbar)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, zoom, visWindow, period.id, dates.length, countsOpen, folded])
  // The mirror FOLLOWS the grid and never drives it (owner, 20 Aug 26 — the
  // sixth report, and the one that found it: "when the top bar freezes the
  // sideways scroll can only move a bit and halts quickly"). It used to be a
  // two-way sync — the mirror's own `scroll` event wrote its position back onto
  // the grid. On iOS that is fatal to a fling: the grid flings on the
  // compositor, the mirror lags it by a frame, and its scroll handler then
  // writes that STALE position back onto the grid, snapping it back and killing
  // the fling — which is exactly the "moves a bit then halts". So the write-back
  // is gone, and `.mxfixed-scroll` is `overflow-x: hidden` (matrix.css) so the
  // header cannot be dragged out of step with the grid either. `syncMirror`
  // (grid → mirror) is all that remains, and setting the mirror's own scrollLeft
  // never touches the grid.
  const syncMirror = () => {
    // In the scroll-driven path the bar's inner table is TRANSLATED by the grid's
    // scroll timeline (compositor). Writing the track's scrollLeft here too would
    // move it a SECOND time — the day columns would travel double and shoot off
    // the left. The animation owns the follow; there is nothing to sync.
    if (sdaActive) return
    const m = mirrorRef.current, w = wrapRef.current
    if (m && w && m.scrollLeft !== w.scrollLeft) m.scrollLeft = w.scrollLeft
  }

  // The bottom scrollbar follows the grid; the compare stops the two writing
  // to each other forever (an unchanged scrollLeft fires no event).
  const syncHbar = () => {
    const h = hbarRef.current, w = wrapRef.current
    if (h && w && h.scrollLeft !== w.scrollLeft) h.scrollLeft = w.scrollLeft
  }
  // ...and the grid follows the bottom scrollbar when THAT is the one dragged.
  // Writing wrap.scrollLeft fires the wrap's own onScroll, which calls
  // syncHbar — equal by then, so it no-ops and the pair rests.
  const onHbarScroll = () => {
    const h = hbarRef.current, w = wrapRef.current
    if (h && w && w.scrollLeft !== h.scrollLeft) w.scrollLeft = h.scrollLeft
  }
  // Only write state when the bar's presence or dimensions actually change:
  // measureHbar runs on every vertical page scroll, and this component renders
  // a ~25,000-node grid — a setState per wheel-tick is exactly the cost the
  // rest of this file bends over backwards to avoid.
  const applyHbar = (next: { left: number; width: number; scrollW: number } | null) =>
    setHbar(prev => {
      if (!prev && !next) return prev
      if (prev && next && prev.left === next.left && prev.width === next.width && prev.scrollW === next.scrollW) return prev
      return next
    })
  // Decide whether the proxy is wanted, and at what size. Cheap reads only (one
  // rect + scrollWidth). It is NOT wanted when: this is a phone (its own
  // scroll); the grid does not overflow sideways; there is no layout yet (jsdom
  // 0×0); the grid's own scrollbar is already on screen (its bottom is at or
  // above the fold — showing both would stack two bars); or the grid has been
  // scrolled entirely out of view.
  const measureHbar = () => {
    const w = wrapRef.current
    if (!w || phone) { applyHbar(null); return }
    const overflow = w.scrollWidth - w.clientWidth
    const r = w.getBoundingClientRect()
    if (overflow <= 1 || r.width === 0 || r.bottom <= window.innerHeight || r.bottom <= 0 || r.top >= window.innerHeight) {
      applyHbar(null); return
    }
    applyHbar({ left: r.left, width: r.width, scrollW: w.scrollWidth })
  }

  // The frozen header tracks the grid on a requestAnimationFrame LOOP, not
  // straight off the scroll event (owner, 19 Aug 26 — a sideways scroll felt
  // stuttery and the header lagged the grid, "trying to catch up"). A touch
  // scroll moves `.mx-wrap` on the compositor at full frame rate, but its
  // `scroll` event fires on the main thread COALESCED — often fewer than once
  // a frame during a fling — so copying the mirror's position from the event
  // alone always lands a frame or more behind, which reads as the header
  // chasing the grid. Sampling `wrap.scrollLeft` inside rAF instead writes the
  // match in the same frame the grid paints, so the two move as one. The loop
  // runs ONLY while a scroll is in flight — each scroll event re-arms a short
  // stop timer — so an idle page still idles rather than spinning rAF forever.
  const rafRef = useRef<number | null>(null)
  const pumpStopRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stopPump = () => {
    if (rafRef.current != null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    if (pumpStopRef.current) { clearTimeout(pumpStopRef.current); pumpStopRef.current = null }
  }
  const pump = () => {
    syncMirror()
    rafRef.current = requestAnimationFrame(pump)
  }
  const startPump = () => {
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(pump)
    if (pumpStopRef.current) clearTimeout(pumpStopRef.current)
    // Outlive the scroll-rest window the row reflow uses, so the last few
    // settling frames are still tracked before the loop lets go.
    pumpStopRef.current = setTimeout(stopPump, 200)
  }
  // The mirror only exists while stuck; stop the loop the moment it thaws so
  // it never runs with nothing to drive.
  useEffect(() => { if (!stuck) stopPump() }, [stuck])

  // The bracket row and the header row, rendered once in the grid and again
  // inside the phone mirror. The mirror copy carries no test ids — two nodes
  // answering one id would break every query that expects the real one.
  const bracketRow = (testids: boolean) => (
    <tr className="mbrak" data-testid={testids ? 'month-bracket' : undefined}>
      {/* The corner cell above CS/Name was empty (owner circled it, 28 Aug 26).
          It now carries the admin's GROUP EDITOR opener — the control belongs
          beside the column it configures, and this is the only spare space in
          the frozen pair. Admin only; the store refuses a member's write
          anyway, and a control that does nothing is worse than none. The
          mirror copy carries no testid, like every other mirrored cell. */}
      <th className="brakhd" colSpan={2}>
        {role === 'admin' && (
          <button
            className="grpedit"
            data-testid={testids ? 'group-edit' : undefined}
            tabIndex={testids ? 0 : -1}
            title="Choose which groups the left column shows"
            aria-label="Choose which groups the left column shows"
            onClick={() => setGroupEdit(true)}
          >⚙ Groups</button>
        )}
      </th>
      {brackets.map(b => (
        <th key={b.key} className="brakm" data-testid={testids ? `bracket-${b.key}` : undefined} colSpan={b.count}>
          <div className="brakin">
            <span className="brakl">{b.label}</span>
          </div>
        </th>
      ))}
    </tr>
  )

  const headerRow = (testids: boolean) => (
    <tr>
      {/* CS/Name (owner, 26 Aug 26): the column holds aircrew callsigns AND
          ground-crew names, and the short form fits the phone's 76px frozen
          column; the Quals page's Personnel view says the long form
          (Callsign/Name) where there is room. */}
      <th className="who">CS/Name</th>
      {/* The counter selector lives in the column header, which is the only
          place a 40px-wide column has room for a control. The WHOLE header is
          the control (the two 13px arrows were too small to hit from a
          phone): tapping anywhere on it opens the full-width counter sheet,
          and swiping across the column (handled on `.mx-wrap`) is the fast
          path. The column is frozen beside the callsign so the figure stays
          on screen however far the grid scrolls. */}
      <th className="bal" data-testid={testids ? 'counter-head' : undefined}>
        <button
          className="cpick"
          data-testid={testids ? 'counter-pick' : undefined}
          aria-label={`Showing ${shown.label}. Choose what this column shows`}
          onClick={() => setPicking(true)}
        >
          <span className="cname" data-testid={testids ? 'counter-name' : undefined}>{shown.label}</span>
          <span className="cdots" aria-hidden="true">
            {figures.map((f, i) => (
              <span key={f.id} className={`cdot${i === shownIx ? ' on' : ''}`} />
            ))}
          </span>
          {/* A tap hint (owner, 18 Aug 26): the whole header has been the
              control since the arrows were pulled, but on a phone nothing
              SAID so; this little finger does. aria-hidden — the button's own
              label already tells a screen reader it is tappable. */}
          <span className="ctap" aria-hidden="true">
            <svg viewBox="0 0 20 20" width="12" height="12" fill="none"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7.5 9V4.4a1.5 1.5 0 0 1 3 0V8.5" />
              <path d="M10.5 8.6V7.2a1.4 1.4 0 0 1 2.8 0v3.9c0 2.7-1.8 4.4-4.3 4.4-1.7 0-3-.8-3.8-2.2L4 11.1a1.25 1.25 0 0 1 2.1-1.3l1 1.4" />
            </svg>
          </span>
        </button>
      </th>
      {period.days.map(d => {
        const mon = monthLabel(d.date)
        return (
          <th
            key={d.date}
            data-testid={testids ? `head-${d.date}` : undefined}
            className={`day${d.blocked ? ' blocked' : ''}${isWeekend(d.date) ? ' weekend' : ''}${evKind.has(d.date) ? ` ${evKind.get(d.date)}` : ''}${lockedDate(d.date) ? ' locked' : ''}${d.date === focusDate ? ' focus' : ''}`}
            title={[d.blocked ? d.blockedReason : '', d.events.filter(Boolean).join(' / ')]
              .filter(Boolean)
              .join(' — ')}
          >
            {mon && <span className="mon">{mon}</span>}
            {/* The day of the week, on every column: "which Tuesday" is the
                question somebody bidding actually asks. Owner, 10 Aug 26. */}
            <span className="dow">{dayName(d.date)}</span>
            {d.date.slice(8)}
          </th>
        )
      })}
    </tr>
  )

  // The month spans + the visible view bounds — the thirteen rect reads both
  // the strip readout and the row window are computed from. One rect per month
  // plus the last column, not one per day: thirteen reads on a year rather than
  // 365, which is what makes measuring this on every scroll event affordable.
  const readSpans = () => {
    const wrap = wrapRef.current
    if (!wrap || months.length === 0 || dates.length === 0) return null
    const headLeft = (date: string) =>
      wrap.querySelector<HTMLElement>(`[data-testid="head-${date}"]`)?.getBoundingClientRect().left
    const lastHead = wrap.querySelector<HTMLElement>(`[data-testid="head-${dates[dates.length - 1]}"]`)
    if (!lastHead) return null
    const edges = months.map(m => headLeft(m.first))
    if (edges.some(e => e === undefined)) return null
    const end = lastHead.getBoundingClientRect().right
    const spans = months.map((m, i) => ({
      label: m.label,
      left: edges[i]!,
      // A month runs up to where the next one starts; the last runs to the
      // right edge of the final column.
      right: i + 1 < edges.length ? edges[i + 1]! : end,
    }))
    const wr = wrap.getBoundingClientRect()
    // The visible strip starts where the day columns do — the frozen columns
    // sit ON TOP of them, so counting from the wrapper's own left edge would
    // credit whichever month is hidden underneath the callsigns.
    const viewL = wr.left + frozenWidth(wrap)
    const viewR = wr.right
    return { wrap, spans, end, viewL, viewR }
  }

  // ---- the month-strip readout, and why it is CACHED (20 Aug 26) ----------
  //
  // This runs on every scroll event, and until now it called readSpans() each
  // time — 15 `querySelector` searches across a 25,000-node grid plus 16
  // `getBoundingClientRect` reads, every one of which forces a synchronous
  // layout flush. It was described here as "cheap". It was not: measured with
  // the strip readout switched off and back on again over an identical
  // 120-frame drag across the year, it accounted for 82% of ALL main-thread
  // blocking during a scroll — 2932ms of blocking down to 519ms, 27 long
  // tasks down to 5, and the worst single frozen frame 503ms down to 65ms.
  // That is the "stuttery, laggy" sideways scroll the owner reported three
  // times; the rAF pump added on 19 Aug 26 could not fix it, because the
  // pump was being starved by this, not running too slowly.
  //
  // The fix is that NONE of that measuring has to happen while scrolling. A
  // month's edges move only when the COLUMNS change — a different war, a zoom
  // step, a row-set reflow, a resize. Their offsets within the scroller's
  // content are otherwise constant, and scrolling just slides the window over
  // them. So the geometry is measured once per layout change into
  // `stripGeoRef`, in CONTENT space (offsets from the start of the scrollable
  // content, not from the viewport), and a scroll event then only has to read
  // `scrollLeft` and do arithmetic. monthInView is documented as working in
  // "whatever one coordinate space the caller is using", which is what makes
  // content space a drop-in.
  //
  // measureWindow below is deliberately NOT converted: it runs at scroll REST,
  // where its cost is invisible, and its anchor correction works in viewport
  // coordinates that would have to be converted in lockstep with it.
  const stripGeoRef = useRef<{ spans: { label: string; left: number; right: number }[]; frozen: number; client: number } | null>(null)

  const measureStripGeo = () => {
    const wrap = wrapRef.current
    if (!wrap || months.length === 0 || dates.length === 0) { stripGeoRef.current = null; return }
    // The scroll-driven frozen bar (sdaActive) translates its day columns from 0
    // to -(--lwx-max)px across the grid's whole scroll range, so --lwx-max must
    // equal the grid's max scrollLeft — divided back out of the mirror table's
    // own zoom, since the transform lands in that table's zoomed local space
    // (mirror render below). It only shifts on a real layout change (resize,
    // zoom, row-window, war), which is exactly when this runs; never per frame.
    if (sdaActive) {
      mxOuterRef.current?.style.setProperty('--lwx-max', String(Math.max(0, (wrap.scrollWidth - wrap.clientWidth) / zoom)))
    }
    const wr = wrap.getBoundingClientRect()
    const sl = wrap.scrollLeft
    // viewport px -> content px: constant across any scroll position
    const contentL = (el: HTMLElement) => el.getBoundingClientRect().left - wr.left + sl
    const head = (d: string) => wrap.querySelector<HTMLElement>(`[data-testid="head-${d}"]`)
    const firsts = months.map(m => head(m.first))
    const lastHead = head(dates[dates.length - 1]!)
    if (!lastHead || firsts.some(e => !e)) { stripGeoRef.current = null; return }
    const edges = firsts.map(e => contentL(e!))
    const end = lastHead.getBoundingClientRect().right - wr.left + sl
    // jsdom reports every rect 0x0; a zero-width geometry would make every
    // month's overlap 0 and the readout permanently null, so leave the cache
    // empty and let measureStrip no-op exactly as it did before.
    if (end <= edges[0]!) { stripGeoRef.current = null; return }
    stripGeoRef.current = {
      spans: months.map((m, i) => ({
        label: m.label,
        left: edges[i]!,
        right: i + 1 < edges.length ? edges[i + 1]! : end,
      })),
      frozen: frozenWidth(wrap),
      // the wrapper's own rect, not clientWidth: every other edge above is
      // measured from a rect, and mixing the two invites an off-by-a-scrollbar
      client: wr.width,
    }
  }

  // The hot path: no DOM search, no rect read, no forced layout — one
  // scrollLeft read and a walk over twelve cached numbers. React still bails
  // when the answer is unchanged, so a scroll inside one month re-renders
  // nothing at all.
  const measureStrip = () => {
    const wrap = wrapRef.current
    if (!wrap) return
    // SELF-HEALING. The cache is normally filled by the layout effects below,
    // but those run at mount, and a grid that has no layout yet at that moment
    // (webfonts still loading, the tab opened in the background) would leave
    // the cache empty and the readout dead until the next zoom, resize or war
    // change. Filling it on first use costs one measurement in that case and
    // nothing at all in the normal one, where the effects got there first.
    if (!stripGeoRef.current) measureStripGeo()
    const g = stripGeoRef.current
    if (!g) return
    const sl = wrap.scrollLeft
    paintInView(monthInView(g.spans, sl + g.frozen, sl + g.client))
  }

  // The row WINDOW for the roster filter — the expensive half. Changing it
  // repaints the whole ~28k-node grid AND fires the anchor correction below
  // (`scrollLeft +=`), which writes scrollLeft and so KILLS a touch fling's
  // momentum dead: the scroll visibly stops at the month a posted-out row
  // leaves. So this is NEVER run mid-scroll — the wrap's onScroll defers it to
  // scroll REST (idleRef below), where the grid is still and moving scrollLeft
  // is invisible. Only from a real layout: jsdom reports every rect 0×0, the
  // spans have no width, and a zero-width "window" must leave visWindow at ''
  // (show everyone) rather than hide the whole roster.
  const measureWindow = () => {
    const m = readSpans()
    if (!m) return
    const { wrap, spans, end, viewL, viewR } = m
    if (end > spans[0]!.left && viewR > viewL) {
      // >2px of overlap, not >0: a month jump aligns the next month's first
      // column to the frozen edge by integer scrollLeft, and a sub-pixel
      // sliver of the month being LEFT must not count as still viewing it.
      const vis = spans
        .map((s, i) => ({ s, key: months[i]!.first.slice(0, 7) }))
        .filter(x => Math.min(x.s.right, viewR) - Math.max(x.s.left, viewL) > 2)
      if (vis.length) {
        const win = `${vis[0]!.key}|${vis[vis.length - 1]!.key}`
        const sig = people.filter(p => rowInWindow(p, win)).map(p => p.id).join(',')
        if (sig !== visSigRef.current) {
          // Capture where the FIRST VISIBLE DAY column sits NOW; the layout
          // effect below puts it back after the repaint (see anchorRef). It
          // has to be the day at the view's left edge, not the month's first
          // day: a hidden row's chips widened columns on BOTH sides of any
          // other anchor, and compensating an off-screen one leaves the
          // residual on screen. Binary search — column lefts are monotonic —
          // so this is ~9 rect reads, and only on a row-set change.
          const at = (i: number) =>
            wrap.querySelector<HTMLElement>(`[data-testid="head-${dates[i]}"]`)?.getBoundingClientRect().left ?? 0
          let lo = 0, hi = dates.length - 1, best = 0
          while (lo <= hi) {
            const mid = (lo + hi) >> 1
            if (at(mid) >= viewL - 1) { best = mid; hi = mid - 1 } else lo = mid + 1
          }
          anchorRef.current = { date: dates[best]!, left: at(best) }
          visSigRef.current = sig
          setVisWindow(win)
        }
      }
    }
  }

  // The scroll-settle debounce. iOS/Android inertia keeps firing scroll events
  // frame by frame until the fling stops, then goes silent, so "no scroll for
  // SCROLL_REST_MS" is what "at rest" means across browsers (scrollend is
  // still patchy on Safari). While the events keep coming the timer keeps
  // resetting, so the heavy row-window work fires exactly once, the instant
  // the scroll comes to rest — never under a moving finger.
  const SCROLL_REST_MS = 120
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onWrapScroll = () => {
    // The frozen-column overlay sits ON TOP of the real columns. At rest
    // (scrollLeft 0) it must let a tap fall THROUGH to the real cell beneath —
    // that cell still carries the handler, the testid and the focus seat — so
    // it is `pointer-events: none` until the year has actually scrolled the
    // real cell away, at which point the overlay is the only copy left to tap
    // and must catch it. Written straight onto the node's inline style (never
    // React state — a setState here would re-render the whole ~25k-node grid
    // on every scroll, the very cost this overlay exists to remove). It has to
    // be the INLINE style, not a toggled class: React owns `.mx-outer`'s
    // className and would wipe an imperatively-added class on its next render,
    // but it never sets `pointer-events`, so this property is left alone.
    if (bandRef.current) bandRef.current.style.pointerEvents = (wrapRef.current?.scrollLeft ?? 0) > 0 ? 'auto' : 'none'
    measureStrip()
    // Match this frame straight away, then keep matching every frame on the
    // rAF loop until the scroll rests — the immediate write covers the case
    // where the loop has not spun up yet, the loop covers the frames the
    // coalesced scroll event skips.
    syncMirror()
    // Keep the desktop bottom scrollbar's thumb in step with the grid (no-op
    // when it is not shown — the ref is null then).
    syncHbar()
    startPump()
    if (idleRef.current) clearTimeout(idleRef.current)
    idleRef.current = setTimeout(() => { idleRef.current = null; measureWindow() }, SCROLL_REST_MS)
  }
  useEffect(() => () => { if (idleRef.current) clearTimeout(idleRef.current); stopPump() }, [])

  // Both halves measured when the war changes, since that rebuilds every
  // column — and NOT mid-fling, so the window half runs directly here.
  useEffect(() => {
    measureStripGeo()
    measureStrip()
    measureWindow()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period.id, dates.length])

  // Everything else that moves a column edge, and so invalidates the cached
  // strip geometry: a zoom step (every width changes), a row-set reflow (the
  // hidden rows' chips were widening columns — the very thing anchorRef exists
  // to compensate), and a viewport resize (the wrapper's own width and the
  // frozen columns both change). Layout effect so the re-measure lands in the
  // same frame as the change that caused it, before any scroll can read a
  // stale cache. The strip is re-read straight after, so the readout is right
  // immediately rather than at the next scroll event.
  useLayoutEffect(() => {
    const remeasure = () => { measureStripGeo(); measureStrip() }
    remeasure()
    window.addEventListener('resize', remeasure)
    return () => window.removeEventListener('resize', remeasure)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, visWindow, period.id, dates.length])

  // Put the anchored column back after a row-set repaint (see anchorRef).
  // Layout effect, not effect: the correction must land in the same frame as
  // the narrowed columns or the reader sees the grid jump and snap back. The
  // scroll it makes re-fires the strip/window measure; the signature compare
  // then finds the same row set and stops — no loop.
  //
  // BUT NOT DURING A FINGER FLICK (owner, 30 Aug 26 — "the nudge restarts every
  // time I scroll horizontally"; his own diagnosis, confirmed). When a person
  // posts out and their roster row disappears crossing into a new month, that
  // row's leave content was widening some day columns, so they shrink and this
  // WRITES `wrap.scrollLeft` to keep the same column in place. On iOS (all
  // iPhone browsers are WebKit) ANY programmatic scrollLeft write kills the
  // inertial fling stone dead — even one meant for "scroll rest", because the
  // coalesced coast leaves a lull the 120ms idle mistakes for a stop. So on a
  // coarse pointer, when the reflow was triggered by a FLICK, we skip the
  // re-centre and let the coast run: the row still hides (the feature and the
  // manning counts are unchanged — only the visual re-centre is dropped), and
  // the worst case is a small one-time shift as a post-out boundary passes,
  // far better than the scroll dying on every flick.
  //
  // A programmatic JUMP is the exception (jumpAtRef): it has no fling to
  // protect and MUST re-centre, or a month button that crosses several post-out
  // boundaries lands its target well off the frozen edge. The two are
  // indistinguishable here — both arrive at scroll-rest — so jumpTo timestamps
  // itself and we treat a reflow inside that short window as a jump. A
  // mouse/trackpad (fine pointer, no touch inertia to protect) always
  // re-centres, so desktop is unchanged.
  useLayoutEffect(() => {
    const a = anchorRef.current
    anchorRef.current = null
    if (!a) return
    const wrap = wrapRef.current
    const cell = wrap?.querySelector<HTMLElement>(`[data-testid="head-${a.date}"]`)
    if (!wrap || !cell) return
    const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
    // The window has to hold the programmatic scroll, the 120ms rest debounce
    // and the grid's repaint; 1200ms is comfortably clear of all three and
    // still far shorter than the gap before a deliberate follow-up flick.
    const fromJump = Date.now() - jumpAtRef.current < 1200
    if (coarse && !fromJump) return
    const shift = cell.getBoundingClientRect().left - a.left
    if (Math.abs(shift) > 1) wrap.scrollLeft += shift
  }, [visWindow])

  // Reserve exactly the month strip's own height on its sticky cell, so the
  // wrapped rows (three on a phone, more at a high zoom) never overflow into
  // the bracket bar below (see mstrowRef above). Layout effect so the cell is
  // sized before paint — no flash of the collided state. Re-measures on the
  // zoom (which re-wraps the buttons), the war change, and a viewport resize.
  useLayoutEffect(() => {
    const measure = () => {
      const strow = mstrowRef.current, cell = mstickRef.current
      if (!strow || !cell) return
      const sr = strow.getBoundingClientRect()
      const cr = cell.getBoundingClientRect()
      if (sr.height === 0) return // jsdom / not laid out — leave the CSS floor
      // Screen px from the cell's top to the strip's bottom, + a little
      // breathing room, divided back out of the table zoom the cell sits in.
      // Floored at the desktop one-row height so a single-row strip never
      // shrinks the cell below what it was.
      setStripH(Math.max(44, (sr.bottom - cr.top + 6) / (zoom || 1)))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [zoom, period.id, dates.length])

  // ---- the OPEN-BIDDING box (owner, 1 Sep 26) -----------------------------
  // A glowing dark-green rectangle around the columns open for bidding, so it
  // is obvious at a glance which dates the squadron may bid on. Shown ONLY
  // while bidding is OPEN (stage 'open'); a draft / closed / published war
  // shows none — the box means "open right NOW". The span is the period's
  // bidFrom..bidTo (null bounds = the whole war open, so the box wraps every
  // column). The owner chose the deeper, more faded green over a brighter one.
  //
  // ONE absolutely-positioned overlay inside `.mx-wrap` (which is
  // position:relative), NOT per-cell borders: a single element gives the clean
  // continuous glow the owner approved, and — being part of the scroller's
  // own content — it tracks the horizontal scroll for FREE, so there is no
  // scroll handler and none of the fling-killing scrollLeft writes the rest of
  // this file guards against. Its z-index (1, matrix.css) sits it ABOVE the
  // day cells but BELOW the frozen callsign/counter columns (z 2/3) and the
  // scrolled-in band overlay (z 4), so its left edge hides behind them exactly
  // as a day cell does when the year scrolls under the frozen columns.
  // Measured in the same layout signals as the month strip; jsdom (every rect
  // 0×0) leaves it null, which also keeps every geometry-free test honest.
  const [bidBox, setBidBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const measureBidBox = () => {
    const wrap = wrapRef.current, head = headRef.current
    if (!wrap || !head) return
    if (period.stage !== 'open') { setBidBox(prev => (prev ? null : prev)); return }
    const open = period.days.filter(d => inBidWindow(period, d.date))
    if (open.length === 0) { setBidBox(prev => (prev ? null : prev)); return }
    const fh = wrap.querySelector<HTMLElement>(`[data-testid="head-${open[0]!.date}"]`)
    const lh = wrap.querySelector<HTMLElement>(`[data-testid="head-${open[open.length - 1]!.date}"]`)
    const table = wrap.querySelector<HTMLElement>('table.mx')
    if (!fh || !lh || !table) return
    const wr = wrap.getBoundingClientRect()
    if (wr.width === 0) return // jsdom / not laid out — leave it null
    const fr = fh.getBoundingClientRect(), lr = lh.getBoundingClientRect()
    if (fr.width === 0) return
    const hr = head.getBoundingClientRect(), tr = table.getBoundingClientRect()
    // Content coordinates (add scrollLeft so the value is stable wherever the
    // grid is scrolled — the browser re-offsets the absolute child as it
    // scrolls). The header tbody top is the month-bracket row; the box runs
    // from there to the foot of the roster.
    const left = fr.left - wr.left + wrap.scrollLeft
    const right = lr.right - wr.left + wrap.scrollLeft
    const top = hr.top - wr.top
    const next = { left, top, width: right - left, height: tr.bottom - hr.top }
    setBidBox(prev => (prev && prev.left === next.left && prev.top === next.top && prev.width === next.width && prev.height === next.height ? prev : next))
  }
  useLayoutEffect(() => {
    measureBidBox()
    window.addEventListener('resize', measureBidBox)
    return () => window.removeEventListener('resize', measureBidBox)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period.id, period.stage, period.bidFrom, period.bidTo, zoom, visWindow, dates.length, countsOpen, folded])

  // ---- the frozen roster columns, drawn ONCE (owner, 20 Aug 26 — the third
  // look at the sideways stutter) --------------------------------------------
  //
  // The callsign and counter columns were `position: sticky` on every one of
  // ~80 rows, and a sideways drag made the browser re-solve all ~160 of those
  // pins every frame — measured as the bulk of the per-frame cost the stutter
  // was made of. Instead the two columns are drawn a SECOND time, ONCE, in an
  // overlay that lives OUTSIDE `.mx-wrap` (the sideways scroller): a sideways
  // scroll never moves it and never re-solves anything, and the real columns
  // underneath are set free to scroll away. Because the overlay is a sibling of
  // the grid in the same page-flow box, it rides the page's own vertical scroll
  // with the grid for free — so the ONLY thing it must be told is where the
  // roster begins, one number, never read on scroll.
  //
  // Phone only, like the frozen header: the sideways stutter lives on the phone
  // and the desktop keeps its untouched sticky path. Suspended while ARRANGING
  // — that mode adds per-row drag handles the overlay does not carry, and it is
  // an admin edit, not the scroll-perf path.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(max-width: 700px)')
    const on = () => setPhone(mq.matches)
    on()
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])

  const bandActive = phone && !arranging

  // ...and how TALL each of the overlay's rows must be. `bandTop` alone lines
  // its FIRST row up with the roster's; every row below that only stays in
  // step if the two tables agree on every height above it — and they do not.
  // A person row carrying a code chip in ANY of its 365 day cells is 23px
  // where an empty one is 22 (the chip's line box runs a pixel taller than the
  // balance cell's bare text), and the overlay draws no day cells at all, so
  // it cannot grow with it. The error is CUMULATIVE: measured on this
  // container's Chromium it reached 14px — most of a row — by the bottom of
  // the demo roster, which is the owner's 20 Aug 26 report of the names
  // sitting beside the wrong rows.
  //
  // So the overlay never GUESSES a row height, and this is deliberately not
  // fixed by making the grid's own rows uniform: that would be a bet on one
  // engine's line-box arithmetic, and the reverted column virtualisation
  // (HANDOFF) is this repo's standing lesson that two independently laid out
  // tables agree on nothing you have not measured. It copies the height the
  // real row actually took, on whatever engine is rendering — the same
  // discipline as the frozen header's measured colgroup above.
  //
  // `height` on a <tr> is a MINIMUM, which is all this needs: the overlay
  // draws a strict subset of the real row's content (the same two cells, minus
  // the personnel label, which is `display:none` on a phone anyway), so its
  // natural height is never the taller of the two.
  //
  // Written straight onto the nodes, never through state — a setState here
  // would re-render the ~25,000-node grid, the very cost this overlay exists
  // to remove. Every read is taken before any write, so one layout settles the
  // lot instead of thrashing row by row. Heights come back as VISUAL pixels,
  // so the table's `zoom` is divided out on the way in, exactly as the
  // mirror's measured column widths are.
  const syncBandHeights = () => {
    const band = bandRef.current, body = rosterBodyRef.current
    if (!band || !body) return
    const rows = Array.from(band.querySelectorAll<HTMLTableRowElement>('tbody > tr'))
    const want = rows.map(tr => {
      const key = tr.getAttribute('data-band-key')
      const real = key ? body.querySelector<HTMLElement>(`[data-testid="${key}"]`) : null
      return real ? real.getBoundingClientRect().height : 0
    })
    // jsdom reports every rect 0x0, and a row the window has filtered out has
    // no real twin at all; a 0 written here would collapse the overlay rather
    // than align it, so an unmeasurable row is left exactly as it was.
    rows.forEach((tr, i) => { if (want[i]! > 0) tr.style.height = `${want[i]! / zoom}px` })
  }

  useLayoutEffect(() => {
    if (!bandActive) { setBandTop(null); return }
    const measure = () => {
      const outer = mxOuterRef.current, body = rosterBodyRef.current
      if (!outer || !body) return
      const br = body.getBoundingClientRect()
      if (br.height === 0) { setBandTop(null); return } // jsdom / not laid out
      setBandTop(br.top - outer.getBoundingClientRect().top)
      // A resize re-wraps nothing here, but it does change the day columns'
      // widths and so which rows carry a chip on screen at all; re-read the
      // heights on the same signal rather than waiting for a render that a
      // resize alone does not cause.
      syncBandHeights()
    }
    measure()
    // A row ABOVE the roster changing height (an event edited, the manning
    // block collapsed, the strip re-wrapped) moves the roster's top — catch it
    // without listing every cause. Never fires on a sideways scroll: that moves
    // no edge the observer watches.
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null
    if (ro && mxOuterRef.current) ro.observe(mxOuterRef.current)
    window.addEventListener('resize', measure)
    return () => { ro?.disconnect(); window.removeEventListener('resize', measure) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bandActive, zoom, visWindow, period.id, dates.length, countsOpen, folded])

  // Re-pinned on EVERY render, not on a dependency list: a bid placed, a
  // decision made or a figure switched can put a chip into a day cell or take
  // one out, which moves that row's height by the pixel above — and there is
  // no cheap signal for "some cell's content changed". It is affordable
  // precisely because this component does NOT re-render on scroll (the reason
  // the overlay exists), so this runs on real edits, not on frames. Layout
  // effect, so the heights land in the same frame as the rows they answer.
  useLayoutEffect(() => { if (bandActive) syncBandHeights() })

  // The roster's row SEQUENCE — group headings, CAT sub-headings and people, in
  // display order — computed so the real grid and the frozen overlay draw the
  // SAME rows in the SAME order. The overlay must not invent its own order or
  // it would sit a row out of step with the grid; the frozencols order test
  // pins the two together. This mirrors the inline logic in the roster <tbody>
  // render below on purpose — change one and the test catches the other.
  type RSeq =
    | { kind: 'group'; g: string; label: string; n: number }
    | { kind: 'catsub'; g: string; cat: string }
    | { kind: 'person'; p: Person }
  const rosterSequence = (): RSeq[] => {
    const roster = displayRoster().filter(p => rowInWindow(p, visWindow))
    const out: RSeq[] = []
    let prevG: string | null = null
    let prevCat = ''
    for (const p of roster) {
      const g = homeOf(p)
      if (g !== prevG) {
        out.push({ kind: 'group', g, label: labelOfGroup(g), n: roster.filter(x => homeOf(x) === g).length })
        prevG = g
        prevCat = ''
      }
      /* A FOLDED group keeps its heading and drops everything under it (owner,
         28 Aug 26 — "allow me to minimise categories on leave war"). The filter
         lives HERE, in the one sequence both the real grid and the frozen
         overlay read, so the two cannot fold out of step — the failure the
         frozen-column order test exists to catch. The heading's `· N` count is
         built from the unfiltered roster above, so a folded group still says
         how many people it is hiding. */
      if (folded.has(g)) continue
      /* CAT sub-headings belong to the two built-in OPS groups only — a person
         drawn under a QUALIFICATION group is not "in CAT B" for display
         purposes, and a CAT rule inside a qual heading would read as a claim
         about the qualification. */
      const cat = (g === 'OPSP' || g === 'OPSW') ? opsCatOf(p) : ''
      if (cat && cat !== prevCat) { out.push({ kind: 'catsub', g, cat }); prevCat = cat }
      out.push({ kind: 'person', p })
    }
    return out
  }

  // The under-manned list asks for a day the same way the month strip asks
  // for a month, through the one `jumpTo` above — so a target lands clear of
  // both frozen columns without that measurement existing twice.
  //
  // Keyed on `focusSeq` rather than `focusDate`: choosing the same day again
  // has to snap back to it after the grid has been dragged away, and a date
  // alone cannot express that. jsdom reports every rect as 0, which makes the
  // jump a harmless no-op there; the browser gate is what proves it moves.
  useEffect(() => {
    if (focusDate) jumpTo(focusDate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSeq, focusDate])

  // Every "may this be written" question now goes through `canEditCell`,
  // which folds the stage, the role and the bidding window into one answer
  // for one date. `canEdit` is what the stage strip and the role toggle ask —
  // "is the sheet writable at all" — and has no date to narrow itself with.
  const deciding = canDecide(period.stage, role)

  // The dotted-orange "moved" mark is only meaningful once bidding has CLOSED
  // (owner, 27 Aug 26). While a war is still open for bidding, people shuffle
  // their own bids around freely — a moved mark on every re-placed bid is just
  // noise. It becomes worth showing only after close, when a shift is the
  // admin deliberately moving someone's input off the date they bid. This gates
  // the DISPLAY; the store gates the RECORD (an open move stores no shiftedFrom
  // at all, so a bid moved while open stays clean even after the war closes) —
  // one `biddingClosed` body behind both so the two cannot disagree.
  const movedShown = biddingClosed(period.stage)

  // Published-stage remarks editor (owner, 27 Aug 26 — "after the leave war is
  // published … click on their inputs … and edit the remarks. but the admin
  // can also … the same for all"). A click on an approved leave at PUBLISHED
  // opens the note editor for the run's OWN person (a member editing their own
  // leave) or for an admin (anyone). `viewer` is the war's mirror of Raptor's
  // "view as" — the member's own person. It takes precedence over the
  // read-only Raptor sheet and the bid/decision sheets below, and exists only
  // at published; `leaveInputAt` runs once per open cell, never per grid cell.
  const remarkRow = open && period.stage === 'published'
    ? leaveInputAt(open.id, open.date, grid[open.id]?.[open.date])
    : null
  const canRemark = !!remarkRow && (role === 'admin' || (!!open && open.id === viewer))

  // Which sheet a click opens follows from three things: the stage, the role,
  // and what the cell already holds.
  //
  // A cell Raptor owns always opens, at every stage and for either role, but
  // only ever onto the read-only sheet — a member who cannot edit anything
  // still deserves to be told why that particular cell is green and why
  // nothing here will change it.
  //
  // Deciding needs an existing bid to decide: a course, a sick day and an
  // empty cell are all things nobody asked for.
  const openable = (personId: string, date: string): boolean =>
    raptorOwns(states, personId, date) ||
    // A member may open a cell to EDIT only on their own row (the person they
    // are viewing as); an admin, any row. Without the row half a member could
    // tap an empty cell on anyone's row and bid it (owner, 27 Aug 26). The
    // date/window half is `canEditCell`; both must pass.
    (canEditCell(period, role, date) && canEditRow(role, viewer, personId)) ||
    (deciding && isBiddable(grid[personId]?.[date])) ||
    // Published remarks editor (owner, 27 Aug 26): the viewer's own APPROVED
    // leave is tappable to edit its note (an admin's every cell is already
    // openable through the canEditCell branch above). Kept CHEAP — code and
    // state truthiness, never leaveInputAt, because this runs for every drawn
    // cell; the precise "is there a backing leave input" test is `canRemark`,
    // computed once when a cell is opened. Approved-only on purpose: a
    // member's refused or pending bid at published opens NOTHING (no editor,
    // no decision sheet), and the first cut still painted it tappable — a
    // dead-feeling tap exactly where the stakes are highest, a refusal.
    (period.stage === 'published' && personId === viewer
      && isBiddable(grid[personId]?.[date])
      && states[personId]?.[date]?.state === 'approved')

  // A day the squadron may not bid on, drawn as such. Without this the window
  // is invisible: a member taps an October cell, nothing happens, and the app
  // reads as broken rather than as closed. Admin sees no lock — the window
  // does not bind them, so drawing one would be a lie about their own screen.
  const lockedDate = (date: string): boolean => !canEditCell(period, role, date)

  // Feed the drag-select controller live state. A member may DRAG only while
  // the war is OPEN (batch fill). The published remarks editor is a SINGLE
  // click, not a drag — a block of runs has no one note to edit — so a member
  // still cannot drag at published. An admin may drag at every stage.
  selCtxRef.current = {
    // A member drags only WITHIN their own row: the rectangle's rows come from
    // this list, so limiting it to the viewer keeps a member's drag on their
    // own row (a date range still selects freely along it) while an admin
    // drags across everyone (owner, 27 Aug 26). The write path refuses other
    // rows regardless; this is what keeps the SELECTION itself from spanning
    // rows a member could never fill, so no confusing "skipped" appears.
    order: () => rosterSequence()
      .filter(r => r.kind === 'person')
      .map(r => (r as { p: Person }).p.id)
      .filter(id => canEditRow(role, viewer, id)),
    dates: () => dates,
    enabled: () => !arranging && !moveSel && !eventMoveSel && (role === 'admin' || period.stage === 'open'),
    onSelect: s => setSel(s),
    // Events are the admin's (the store refuses a member write anyway); a drag
    // along one event line opens the event sheet pre-set to that date span
    // (owner, 27 Aug 26). from === to (a one-cell drag) opens on the single day.
    eventsEnabled: () => role === 'admin' && !arranging && !moveSel && !eventMoveSel,
    onEventSelect: s => setEventEdit({ line: s.line, date: s.from, to: s.from === s.to ? undefined : s.to }),
  }
  const csOf = (id: string): string => displayRoster().find(p => p.id === id)?.callsign ?? id

  return (
    <div className="stage">
      <div className="card">
        <div className="card-hd">
          <span className="t">{period.name} · {dates.length} days · {people.length} people</span>
          {/* Collapse the manning counts block — EITHER role (owner, 19 Aug 26).
              A plain view toggle, in the header so it is reachable above the
              scroll and does not ride the grid it hides. */}
          <button
            className="rtbtn countstoggle"
            data-testid="counts-toggle"
            aria-expanded={countsOpen}
            title={countsOpen ? 'Hide the manning counts' : 'Show the manning counts'}
            onClick={() => setCountsOpen(o => !o)}
          >
            {countsOpen ? '▾' : '▸'} Manning
          </button>
          {/* Roster arrangement (owner, 18 Aug 26), admin only: Auto-sort
              re-groups everyone into the categorised order; Rearrange turns on
              the edit-mode drag handles AND the manning rows' reorder/hide
              controls (owner, 18 Aug 26 — one edit mode for both). A member
              sees neither — the arrangement is management's (the figureOrder
              rule). */}
          {role === 'admin' && (
            <div className="rostertools">
              <button
                className={`rtbtn${arranging ? ' on' : ''}`}
                data-testid="roster-arrange"
                aria-pressed={arranging}
                title="Rearrange or hide the roster and the count rows"
                onClick={() => setArranging(a => !a)}
              >
                ⠿ {arranging ? 'Done' : 'Rearrange'}
              </button>
              <button
                className="rtbtn pri"
                data-testid="roster-autosort"
                title="Group everyone into SXO, IP, OPS P, IWSO, OPS W, OCU, Personnel"
                onClick={autoSortRoster}
              >
                ⇅ Auto-sort
              </button>
              {/* Add / remove EVENT rows — only in Rearrange (edit) mode, so
                  the normal view stays clean (owner, 18 Aug 26: "in edit mode
                  for admin I should have the option to add more event rows").
                  Remove is disabled while the last row still carries anything,
                  so nothing is dropped unseen (the store refuses it anyway). */}
              {arranging && (
                <>
                  <button
                    className="rtbtn"
                    data-testid="event-add"
                    disabled={eventRows >= MAX_EVENT_ROWS}
                    title={eventRows >= MAX_EVENT_ROWS ? `At most ${MAX_EVENT_ROWS} event rows` : 'Add another event row'}
                    onClick={() => addEventRow()}
                  >
                    ＋ Event row
                  </button>
                  {eventRows > DEFAULT_EVENT_ROWS && (
                    <button
                      className="rtbtn"
                      data-testid="event-remove"
                      disabled={lastEventRowUsed}
                      title={lastEventRowUsed ? 'Clear the last event row before removing it' : 'Remove the last event row'}
                      onClick={() => removeEventRow()}
                    >
                      － Event row
                    </button>
                  )}
                  {/* THE SANS ENABLE FUNCTION (owner, 18 Aug 26): SANS aircrew
                      are off the roster by default; this puts them on (and
                      takes them off again). Lives in Rearrange with the other
                      roster-shape controls, admin by the same gate. */}
                  <button
                    className={`rtbtn${showSans ? ' on' : ''}`}
                    data-testid="sans-toggle"
                    aria-pressed={showSans}
                    title={showSans ? 'Take SANS aircrew off the leave war roster' : 'Put SANS aircrew on the leave war roster'}
                    onClick={() => setShowSans(!showSans)}
                  >
                    {showSans ? '✓ SANS shown' : 'Show SANS'}
                  </button>
                  {/* Build a counting rule from scratch (owner, 19 Aug 26 —
                      the counters are fully customisable). Lives with the
                      other manning-shape controls, same admin gate. */}
                  <button
                    className="rtbtn"
                    data-testid="counter-add"
                    title="Add a manning counter — pick who it counts and when it turns amber or red"
                    onClick={() => setCounterEdit(null)}
                  >
                    ＋ Counter
                  </button>
                  {/* The road back after deleting or mangling a built-in row:
                      the seeded counter set, whole. It DISCARDS custom
                      counters, so it arms — first tap asks, second does it
                      (the counter form's own delete idiom). */}
                  <button
                    className={`rtbtn${armCounterReset ? ' arm' : ''}`}
                    data-testid="counter-reset-all"
                    title="Put the built-in counters back — counters you built are discarded"
                    onClick={() => {
                      if (!armCounterReset) { setArmCounterReset(true); return }
                      setArmCounterReset(false)
                      resetManningRules()
                    }}
                  >
                    {armCounterReset ? 'Really reset?' : 'Reset counters'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <div
          className={`mx-outer${bandActive && bandTop != null ? ' mx-banded' : ''}${sdaActive ? ' lw-sda' : ''}`}
          ref={mxOuterRef}
        >
        <div
          className="mx-wrap"
          ref={wrapRef}
          onScroll={onWrapScroll}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <table className="mx" style={zoom !== 1 ? { zoom } : undefined}>
            {/* THE ROW ORDER IS THE OWNER'S (18 Aug 26, arrows on a
                screenshot): counts first, then the month buttons, then the
                callsign + dates header, then the event rows, then the roster.
                The header row is a tbody (`.mxhead`), not a thead — CSS
                paints a thead at the TOP of the table wherever it sits in
                the DOM, which would undo this whole arrangement. */}
            {/* Collapsed away on the view toggle, but always shown while an
                admin is Rearranging — that is where the per-row reorder / hide
                controls live, and hiding the block would hide them too. */}
            {(countsOpen || (arranging && role === 'admin')) && (
              <CountRows
                verdicts={verdicts}
                dates={dates}
                order={orderedManningIds()}
                hidden={manningHidden}
                arranging={arranging}
                admin={role === 'admin'}
                onInfo={setManningInfo}
                onRowDragStart={(e, ruleId) => startRowDrag(e, ruleId, MANNING_DRAG)}
                draggingId={draggingId}
                dragOver={dragOver}
                dragAfter={dragAfter}
              />
            )}
            {/* The month strip, now a row of the grid so it sits between the
                counts and the header (owner's arrows). The buttons live in a
                sticky two-column cell and overflow visibly across the fill
                cell — the grphd technique — so they stay pinned to the left
                edge while the year scrolls under them. */}
            <tbody className="mstripe">
              <tr>
                <td className="mstick" colSpan={2} ref={mstickRef} style={stripH ? { height: stripH } : undefined}>
                  <div className="mstrow" ref={mstrowRef}>
                    <div className="months" data-testid="month-strip" ref={monthsRef}>
                      {months.map(m => (
                        <button
                          key={m.first}
                          className={`mjump${m.label === inViewRef.current ? ' on' : ''}`}
                          data-testid={`month-${m.label.replace(' ', '-')}`}
                          aria-current={m.label === inViewRef.current ? 'true' : undefined}
                          title={`Jump to ${m.label}`}
                          onClick={() => jumpTo(m.first)}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                    {/* The phone zoom, riding the same pinned cell as the
                        months so it never scrolls out of reach sideways —
                        but OUTSIDE the strip: it is not a month, and the
                        strip's tests and readers treat every button there as
                        one. Hidden above 700px in CSS — a desktop has room. */}
                    <span className="lwzoom" data-testid="lw-zoom">
                      <button
                        className="mjump"
                        data-testid="lw-zoom-out"
                        aria-label="Zoom out"
                        disabled={zoom === ZOOMS[0]}
                        onClick={() => zoomStep(-1)}
                      >−</button>
                      <button
                        className="mjump"
                        data-testid="lw-zoom-in"
                        aria-label="Zoom in"
                        disabled={zoom === ZOOMS[ZOOMS.length - 1]}
                        onClick={() => zoomStep(1)}
                      >＋</button>
                    </span>
                  </div>
                </td>
                <td className="mfill" colSpan={dates.length} />
              </tr>
            </tbody>
            <tbody className="mxhead" ref={headRef}>
              {bracketRow(true)}
              {headerRow(true)}
            </tbody>
            {/* Above the roster, below the header — an event is the REASON a
                day is thin, so it reads right under the date it explains. */}
            <EventRows
              days={period.days}
              bands={period.bands}
              defs={eventDefs}
              rows={eventRows}
              editable={role === 'admin'}
              onEdit={(line, date) => setEventEdit({ line, date })}
            />
            <tbody className="mxbody" ref={rosterBodyRef}>
              {(() => {
                // The roster in DISPLAY order (owner, 18 Aug 26): the admin's
                // hand-order, or the categorised default. A group heading is
                // emitted at every top-level boundary, and a CAT sub-heading
                // inside an ops group — the sub-heading is desktop-only in CSS,
                // per the owner ("if it takes up too much space on mobile…").
                //
                // FILTERED to the visible month window (owner, 19 Aug 26 —
                // rowInWindow above): the heads/counts below derive from the
                // filtered list, so an emptied group takes its heading with
                // it. visWindow '' (jsdom, first paint) shows everyone.
                const roster = displayRoster().filter(p => rowInWindow(p, visWindow))
                const span = 2 + dates.length
                let prevG: string | null = null
                let prevCat = ''
                return roster.map(p => {
                  const g = homeOf(p)
                  const heads: any[] = []
                  if (g !== prevG) {
                    const n = roster.filter(x => homeOf(x) === g).length
                    heads.push(
                      <tr key={`grp-${g}`} className={`grp ${groupClass(g)}${folded.has(g) ? ' folded' : ''}`} data-testid={`group-${g}`}>
                        {/* The label sits in a sticky td spanning only the two
                            frozen columns — the SAME technique .who/.bal use —
                            so it stays pinned to the left as the year scrolls;
                            its text overflows visibly over the empty fill cell
                            beside it. (A sticky div inside a full-width colSpan
                            td does not stick — it rides off to the right.)

                            The TD is the fold target, not the div inside it:
                            `.grphd-in` is deliberately `width: 0` (it must add
                            no min-width, or the frozen callsign column grows to
                            fit "Personnel · N"), and a zero-width control cannot
                            be tapped. Same reasoning as the balance cell, where
                            the td is the target so a nested button cannot cost
                            the column its number. */}
                        <td
                          className="grphd"
                          colSpan={2}
                          data-testid={`groupfold-${g}`}
                          role="button"
                          tabIndex={0}
                          aria-expanded={!folded.has(g)}
                          aria-label={`${labelOfGroup(g)} — ${folded.has(g) ? 'show' : 'hide'} these rows`}
                          title={folded.has(g) ? `Show the ${labelOfGroup(g)} rows` : `Hide the ${labelOfGroup(g)} rows`}
                          onClick={() => toggleFold(g)}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFold(g) } }}
                        >
                          <div className="grphd-in">
                            <span className="gsw" aria-hidden="true" />
                            <span className="gcar" aria-hidden="true">{folded.has(g) ? '▸' : '▾'}</span>
                            <span className="gname">{labelOfGroup(g)}</span>
                            <span className="gcount">· {n}</span>
                          </div>
                        </td>
                        <td className="grpfill" colSpan={span - 2} />
                      </tr>,
                    )
                    prevG = g
                    prevCat = ''
                  }
                  /* Folded: the heading stands alone and everything under it is
                     dropped (owner, 28 Aug 26). The first person of the group
                     still emits the heading collected above; the rest emit
                     nothing. `rosterSequence` applies the identical filter, so
                     the frozen overlay folds in lockstep. */
                  if (folded.has(g)) {
                    return heads.length ? <Fragment key={p.id}>{heads}</Fragment> : null
                  }
                  const cat = (g === 'OPSP' || g === 'OPSW') ? opsCatOf(p) : ''
                  if (cat && cat !== prevCat) {
                    heads.push(
                      <tr key={`sub-${g}-${cat}`} className="catsub" data-testid={`subcat-${g}-${cat}`}>
                        <td className="catsub-in" colSpan={2}>CAT {cat}</td>
                        <td className="catsub-fill" colSpan={span - 2} />
                      </tr>,
                    )
                    prevCat = cat
                  }
                  return (
                    <Fragment key={p.id}>
                      {heads}
                      {/* `me` lights the VIEWER's own row (owner, 17 Aug 26).
                          While arranging the row is a drop target the pointer
                          drag reads by hit-test; the drag SOURCE is the handle
                          alone, so a tap on the personnel label box types
                          rather than starting a drag. */}
                      <tr
                        data-testid={`row-${p.id}`}
                        className={[
                          p.id === viewer ? 'me' : '',
                          arranging ? 'arrange' : '',
                          draggingId === p.id ? 'dragging' : '',
                          draggingId && dragOver === p.id && draggingId !== p.id ? (dragAfter ? 'dragover after' : 'dragover') : '',
                        ].filter(Boolean).join(' ') || undefined}
                      >
                        <td className="who">
                          <div className="whorow">
                            {arranging && (
                              <span
                                className="drag"
                                data-testid={`drag-${p.id}`}
                                title="Drag to move this row"
                                style={{ touchAction: 'none' }}
                                onPointerDown={e => startRowDrag(e, p.id, ROSTER_DRAG)}
                              >⠿</span>
                            )}
                            {/* The callsign opens the person's all-figures
                                sheet, for everyone (owner, 17 Aug 26). The CAT
                                chip carries the person's colour, reused from
                                Raptor's Quals palette, and an SXO sits under
                                the SXO heading rather than wearing a second
                                column. */}
                            <button
                              className="whoedit"
                              data-testid={`person-${p.id}`}
                              title={`${p.callsign} — every figure`}
                              onClick={() => setWhoOpen(p.id)}
                            >
                              <span className="cs">{p.callsign}</span>
                              <span className={`catchip ${catClass(p)}`} data-testid={`cat-${p.id}`}>{catText(p) || 'GND'}</span>
                            </button>
                            {/* The free-text role-label edit box is GONE (owner,
                                28 Aug 26 — "i can edit personnel, dont need to
                                show that, just leave it as the callsign/name").
                                A ground-crew row now shows the same callsign +
                                chip as every other row, in Rearrange too. */}
                          </div>
                        </td>
                  {/* The selected figure's value for this person, derived on
                      every render rather than cached: it has to move the
                      instant a bid is placed, because a pending bid has been
                      asked for and cannot be asked for twice. A balance can go
                      negative (shown red, never refused — the squadron's
                      balances already run negative, §Counters); a consumed
                      figure never does. Every figure counts across EVERY war,
                      not the one on screen — leave bid in Jan–Mar still spends
                      against Apr–Jun. */}
                  {(() => {
                    const v = shown.value(figureCtx, p.id)
                    const suffix = shown.kind === 'bal' ? 'remaining, pending bids included' : 'taken'
                    return (
                      <td
                        className={`bal act${v < 0 ? ' neg' : ''}`}
                        data-testid={`bal-${p.id}`}
                        title={`${p.callsign}: ${show(v)} ${shown.label} — ${suffix}. Tap for the breakdown`}
                        /* A tap opens the person's breakdown of the shown
                           figure — the owner's "click the individual
                           personnel counter" (17 Aug 26). The td is the
                           target, like every grid cell here: a nested button
                           would cost the 44px column its number. */
                        onClick={() => setBalOpen({ person: p.id, figureId: shown.id })}
                      >
                        {show(v)}
                      </td>
                    )
                  })()}
                  {period.days.map(d => {
                    const code = grid[p.id]?.[d.date] ?? ''
                    const here = inSquadron(p, d.date)
                    // `here` is false on both sides of the roster window. Before
                    // `from` the person has not arrived yet — that is not the
                    // same fact as having been posted out, and must not read as
                    // one. Only the "after `to`" direction is a genuine PO.
                    const notYetArrived = !here && p.from !== null && d.date < p.from
                    const cls = [
                      here ? '' : 'gone',
                      here && isDuty(code) ? 'duty' : '',
                      // The band runs the whole column, not just the header —
                      // finding a Tuesday in 90 columns should not need
                      // counting. `.gone`'s hatch is declared after the
                      // weekend rule so a posted-out weekend still reads as
                      // posted out.
                      isWeekend(d.date) ? 'weekend' : '',
                      // The event column colour (off = green, no-leave =
                      // orange), declared after the weekend so a holiday
                      // Saturday reads as the holiday, not the weekend.
                      evKind.get(d.date) ?? '',
                      // Outside the bidding window, for this role. Declared
                      // after the event colour so a locked, tinted day still
                      // reads as locked — the same cascade care the
                      // .blocked/.weekend pair needs, and for the same reason.
                      lockedDate(d.date) ? 'locked' : '',
                    ].filter(Boolean).join(' ')
                    // The stored notation, printed through the one display
                    // mapping — the ATT markers read as the owner's bare
                    // B / C on the grid while everything else prints as
                    // stored (displayCell is identity for it).
                    const text = here ? displayCell(code) : notYetArrived ? '' : 'PO'
                    // Duty first for the reader — FO/HO are work, not a bid.
                    // (They carry `bid: false`, so they could not reach a
                    // bid branch anyway; the order is legibility, not a
                    // guard.) Then the bid state, but only where the code is
                    // one a person bids for. Everything else is plain
                    // information:
                    // medical, a course, overseas duty. A bare "PO" chip on
                    // a posted-out cell carries no state class at all.
                    //
                    // A bid with NO decision recorded reads as pending, and
                    // PENDING IS PLAIN — no colour class at all, so the chip
                    // renders as text on the ordinary cell background.
                    //
                    // It was purple until 10 Aug 26, when the owner pointed
                    // out what that cost: an input nobody had looked at and
                    // one already in management's hands were the same colour,
                    // so the sheet could not distinguish them. Purple now
                    // means acknowledged — somebody has seen this — and the
                    // absence of colour means the absence of news.
                    const bid = stateOf(states, p.id, d.date)
                    const chipState = !here || !code
                      ? ''
                      : isDuty(code) ? 'sc'
                      : !isBiddable(code) ? 'info'
                      : bid === 'approved' ? 'appr'
                      : bid === 'refused' ? 'ref'
                      : bid === 'acknowledged' ? 'tbc'
                      : ''
                    // The half-day fill is read off the stored string via
                    // `parseCell`, never kept as its own bit of state and
                    // never guessed by matching an asterisk here in the
                    // component. The asterisk in `text` stays the one source
                    // of truth; this is only a derived echo of it, so the
                    // two can never disagree.
                    const portion = here && code ? parseCell(code)?.portion : undefined
                    const portionClass = portion === 'am' || portion === 'pm' ? ` ${portion}` : ''
                    // Two marks on top of the state colour, never instead of
                    // it: the squadron reads green as approved and magenta as
                    // pending, and that stays true here. `raptor` says the
                    // approval happened elsewhere and nothing on this screen
                    // will change it; `moved` says management shifted this
                    // bid off another date.
                    const marks = [
                      here && code && raptorOwns(states, p.id, d.date) ? 'raptor' : '',
                      movedShown && here && code && shiftedFrom(states, p.id, d.date) ? 'moved' : '',
                    ].filter(Boolean).join(' ')
                    // A cell outside the person's time in the squadron is
                    // never actionable FOR A BID: bidding leave for a man who
                    // has been posted out is a data-entry accident, not a bid.
                    // But an ADMIN can still tap a posted-out day to UNDO the
                    // post-out (owner, 18 Aug 26 — "tap a struck day to undo");
                    // `notYetArrived` is excluded — a day before someone joins
                    // is blank, not a post-out, and nothing there to undo.
                    const actionable =
                      (here && openable(p.id, d.date)) || (role === 'admin' && !here && !notYetArrived)
                    // Their LAST day in the squadron wears a small PO tag
                    // (owner, 19 Aug 26 — chosen over nothing after the edge
                    // case was put to him): someone posting out on the 1st has
                    // a final month that otherwise looks completely normal,
                    // and the next month their row is gone — so without this,
                    // a reader jumping month to month never sees the PO at
                    // all. The tag rides the corner of the cell so a leave
                    // code on the same day still prints.
                    const lastIn = p.to !== null && d.date === p.to
                    return (
                      <td
                        key={d.date}
                        data-testid={`cell-${p.id}-${d.date}`}
                        className={`${cls}${actionable ? ' act' : ''}${lastIn ? ' pofin' : ''}`}
                        onClick={actionable
                          ? () => setOpen({ id: p.id, callsign: p.callsign, date: d.date })
                          : undefined}
                      >
                        {text && (
                          <span
                            className={`c${chipState ? ` ${chipState}` : ''}${portionClass}${marks ? ` ${marks}` : ''}`}
                          >
                            {text}
                          </span>
                        )}
                        {lastIn && (
                          <span
                            className="polast"
                            data-testid={`polast-${p.id}`}
                            title={`${p.callsign} posts out ${addDays(p.to!, 1)} — this is their last day in the squadron`}
                          >
                            PO
                          </span>
                        )}
                      </td>
                    )
                  })}
                      </tr>
                    </Fragment>
                  )
                })
              })()}
            </tbody>
          </table>
          {/* The open-bidding box (see measureBidBox). A sibling of the table
              inside `.mx-wrap`, so it scrolls sideways with the grid; null
              unless bidding is open and laid out. */}
          {bidBox && (
            <div
              className="lw-bidbox"
              data-testid="bid-box"
              aria-hidden="true"
              style={{ left: bidBox.left, top: bidBox.top, width: bidBox.width, height: bidBox.height }}
            />
          )}
        </div>
        {/* The phone's frozen header — the fixed mirror described above the
            sticky machinery. Sits under the top bar (z 55 < the bar's 60 and
            the sheets' 79/80) and never renders in jsdom, where nothing has
            a height to scroll past. */}
        {stuck && ((s: { top: number; left: number; width: number; cols: number[] }) => {
          // The measured widths are visual px (they include the zoom), and the
          // mirror table wears the same zoom so its text sizes match — so its
          // layout widths are the measurements divided back out, or the zoom
          // would apply twice.
          const totalW = s.cols.reduce((a, b) => a + b, 0) / zoom
          const table = (extra: string) => (
            <table
              className={`mx${extra ? ' ' + extra : ''}`}
              style={{ tableLayout: 'fixed', width: totalW, ...(zoom !== 1 ? { zoom } : null) }}
            >
              <colgroup>
                {s.cols.map((w, i) => (
                  <col key={i} style={{ width: w / zoom }} />
                ))}
              </colgroup>
              <tbody className="mxhead">
                {bracketRow(false)}
                {headerRow(false)}
              </tbody>
            </table>
          )
          return (
            <div
              className="mxfixed"
              data-testid="sticky-head"
              style={{ top: s.top, left: s.left, width: s.width }}
            >
              {/* The scrolling layer. In the JS-mirror fallback this is a real
                  horizontal scroller (matrix.css) and `syncMirror` writes its
                  scrollLeft. In the scroll-driven path (`.lw-sda`) it does not
                  scroll — the `.mxfixed-anim` table inside is TRANSLATED by the
                  grid's scroll timeline on the compositor, so it stays glued to
                  the grid during a fling with no main-thread follow. */}
              <div className={`mxfixed-scroll${sdaActive ? ' mxfixed-track' : ''}`} ref={mirrorRef}>
                {table(sdaActive ? 'mxfixed-anim' : '')}
              </div>
              {/* The bar's frozen LEFT columns, in the scroll-driven path only.
                  A translated table cannot keep `position: sticky`, so the
                  callsign + counter columns are drawn as a static copy pinned
                  over the left and clipped to their own width; the day columns
                  translate UNDER it. It is the tappable/opaque copy (the counter
                  picker still works while scrolled); the scrolling layer's own
                  who/bal are made pointer-events:none in matrix.css so taps land
                  here, and this copy is aria-hidden so the scrolling layer stays
                  the single accessible one. */}
              {sdaActive && (
                <div
                  className="mxfixed-frozen"
                  aria-hidden="true"
                  style={{ width: (s.cols[0] || 0) / zoom + (s.cols[1] || 0) / zoom }}
                >
                  {table('')}
                </div>
              )}
            </div>
          )
        })(stuck)}
        {/* The frozen roster columns, drawn once. Sibling of `.mx-wrap`, not a
            child — a child would ride the sideways scroll it exists to sit out.
            aria-hidden and its buttons out of the tab order: the REAL columns
            underneath (scrolled off to the left, still in the DOM) keep the
            testids, focus order and screen-reader seat; this copy only has to
            be tappable where the year has scrolled the real ones away. */}
        {bandActive && (
          <div
            className="mxband"
            ref={bandRef}
            aria-hidden="true"
            data-testid="frozen-cols"
            style={{ top: bandTop ?? 0, ...(bandTop == null ? { visibility: 'hidden' as const } : null) }}
          >
            <table className="mx" style={zoom !== 1 ? { zoom } : undefined}>
              <tbody className="mxbody">
                {rosterSequence().map(item => {
                  if (item.kind === 'group') return (
                    /* The overlay's own copy of the heading, and it carries the
                       fold handler too: once the year has scrolled sideways the
                       overlay is `pointer-events: auto` and is the copy the
                       reader can actually tap (the real heading has slid away
                       under it). No role/tabIndex here — the whole band is
                       aria-hidden and the real heading above is the accessible
                       control. */
                    <tr key={`b-grp-${item.g}`} data-band-key={`group-${item.g}`} className={`grp ${groupClass(item.g)}${folded.has(item.g) ? ' folded' : ''}`}>
                      <td className="grphd" colSpan={2} onClick={() => toggleFold(item.g)}>
                        <div className="grphd-in">
                          <span className="gsw" />
                          <span className="gcar">{folded.has(item.g) ? '▸' : '▾'}</span>
                          <span className="gname">{item.label}</span>
                          <span className="gcount">· {item.n}</span>
                        </div>
                      </td>
                    </tr>
                  )
                  if (item.kind === 'catsub') return (
                    <tr key={`b-sub-${item.g}-${item.cat}`} data-band-key={`subcat-${item.g}-${item.cat}`} className="catsub">
                      <td className="catsub-in" colSpan={2}>CAT {item.cat}</td>
                    </tr>
                  )
                  const p = item.p
                  const v = shown.value(figureCtx, p.id)
                  return (
                    // `data-band-id`, NOT a testid: the real row keeps `row-…`
                    // and `bal-…`, and two nodes answering one testid would
                    // break every query that expects the one real match. e2e
                    // still needs to find a given person in the overlay to prove
                    // it lines up with — and stays put over — the real row.
                    <tr key={`b-${p.id}`} data-band-id={p.id} data-band-key={`row-${p.id}`} className={p.id === viewer ? 'me' : undefined}>
                      <td className="who">
                        <div className="whorow">
                          <button className="whoedit" tabIndex={-1} onClick={() => setWhoOpen(p.id)}>
                            <span className="cs">{p.callsign}</span>
                            <span className={`catchip ${catClass(p)}`}>{catText(p) || 'GND'}</span>
                          </button>
                        </div>
                      </td>
                      <td
                        className={`bal act${v < 0 ? ' neg' : ''}`}
                        onClick={() => setBalOpen({ person: p.id, figureId: shown.id })}
                      >
                        {show(v)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>

      {/* The desktop horizontal scrollbar, fixed to the foot of the SCREEN
          (owner, 22 Aug 26). A proxy for `.mx-wrap`'s own scrollbar, which
          rides the bottom of a year-tall grid out of reach; its `left`/`width`
          overlay the grid and the inner spacer is as wide as the grid content
          so the browser sizes the thumb. Shown only while the real scrollbar
          is below the fold. Never in jsdom or on a phone — Matrix mounts it
          off a live desktop measurement. */}
      {hbar && (
        <div
          className="mx-hbar"
          data-testid="hscroll"
          ref={hbarRef}
          style={{ left: hbar.left, width: hbar.width }}
          onScroll={onHbarScroll}
        >
          <div className="mx-hbar-in" style={{ width: hbar.scrollW }} />
        </div>
      )}

      {/* Rendered outside `.mx-wrap` on purpose: that wrapper scrolls, and a
          sheet inside it would be clipped by its own scroller. Keyed by the
          cell so opening a second one remounts rather than carrying the
          first's portion choice across. */}
      {/* The published-stage remarks editor wins FIRST where it applies (an
          approved leave, the viewer's own or an admin's any) — even over the
          Raptor sheet, because on a published war editing the note is the
          point, and the note lives on the same Raptor row the read-only sheet
          would only point at. */}
      {open && canRemark && (
        <RemarksSheet
          key={`rmk-${open.id}-${open.date}`}
          callsign={open.callsign}
          row={remarkRow}
          code={grid[open.id]?.[open.date] ?? ''}
          onClose={close}
        />
      )}
      {/* Raptor's ownership is checked next and short-circuits both other
          sheets. That cell is approved elsewhere: offering a picker or a
          decision on it would offer an action the store will refuse, which
          is worse than offering nothing. */}
      {open && !canRemark && raptorOwns(states, open.id, open.date) && (
        <RaptorSheet
          callsign={open.callsign}
          date={open.date}
          code={grid[open.id]?.[open.date] ?? ''}
          onClose={close}
        />
      )}
      {/* The drag-selection sheet — batched fill / decide / delete / move over
          the whole rectangle (owner, 27 Aug 26). Independent of the single-cell
          `open`; a drag never sets `open`. */}
      {sel && (
        <SelectSheet
          sel={sel}
          people={csOf}
          role={role}
          canDecide={canDecide(period.stage, role)}
          medical={role === 'admin'}
          onPostOut={role === 'admin' ? (pid, from, archive) => setPostOut(pid, from, archive) : undefined}
          onMove={s => setMoveSel(s)}
          /* a PARTIAL write keeps the sheet up (keepOpen) so its "N written,
             M skipped" note is actually read — closing here killed the note
             in the same tap that set it (27 Aug 26 overnight find) */
          onDone={(_changed, keepOpen) => { if (!keepOpen) setSel(null) }}
          onClose={() => setSel(null)}
        />
      )}
      {/* Move mode: a slim banner. On desktop a ghost follows the mouse (from
          wireMove) and a CLICK lands the block at once; on phone a TAP stages
          the landing (`movePreview`) and the banner turns into Confirm/Cancel,
          since there is no hover to preview with and no undo. A refusal shows
          here and keeps the mode. The count is `movers` — the inputs present,
          not the raw rectangle. */}
      {moveSel && (
        <div className="mv-banner" data-testid="move-banner">
          <span className="mv-msg">
            {moveErr
              ? moveErr
              : movePreview
                ? `Move ${movers.length} ${movers.length === 1 ? 'entry' : 'entries'} here?`
                : `Tap a day to move ${movers.length} ${movers.length === 1 ? 'entry' : 'entries'}`}
          </span>
          {movePreview && (
            <button className="dchip confirm" data-testid="move-confirm" onClick={() => commitMove(movePreview)}>Confirm</button>
          )}
          <button
            className="dchip"
            data-testid="move-cancel"
            onClick={() => { const w = wrapRef.current; if (w) clearLanding(w); setMoveSel(null); setMovePreview(null) }}
          >Cancel</button>
        </div>
      )}
      {/* The EVENT move banner (owner, 31 Aug 26) — the same slim bar as the
          roster move, for the event picked up from its sheet's "Move…" button. */}
      {eventMoveSel && (
        <div className="mv-banner" data-testid="event-move-banner">
          <span className="mv-msg">
            {eventMoveErr
              ? eventMoveErr
              : eventMovePreview
                ? 'Move this event here?'
                : 'Tap a day to move this event'}
          </span>
          {eventMovePreview && (
            <button className="dchip confirm" data-testid="event-move-confirm" onClick={() => commitEventMove(eventMovePreview)}>Confirm</button>
          )}
          <button
            className="dchip"
            data-testid="event-move-cancel"
            onClick={() => { const w = wrapRef.current; if (w) clearLanding(w); setEventMoveSel(null); setEventMovePreview(null) }}
          >Cancel</button>
        </div>
      )}
      {/* A posted-out cell an admin tapped: the ONE control it offers is Undo,
          and it short-circuits every bid/decision sheet below (owner, 18 Aug
          26). */}
      {open && !canRemark && openPostedOut && role === 'admin' && (
        <PostOutSheet
          callsign={open.callsign}
          date={open.date}
          /* openPostedOut already proves `to` is set — a greyed day is a day
             AFTER it. The sheet talks in the PO date (first day gone), which
             is the day after the stored last-day-in. */
          poFrom={addDays(openPerson!.to!, 1)}
          archive={openPerson!.poArchive === true}
          onChange={(from, archive) => setPostOut(open.id, from, archive)}
          onUndo={() => { setPostOut(open.id, null); close() }}
          onClose={close}
        />
      )}
      {/* An admin at `closed` can BOTH edit and decide, so the two are not
          mutually exclusive and the order between them matters. Deciding
          wins on a cell that holds a bid, because that is what the stage is
          for; the picker still opens on an empty one, so an admin can add
          leave to a closed sheet without a second control. */}
      {picking && (
        <CounterSheet shownId={shownId} onPick={setShownId} onClose={() => setPicking(false)} />
      )}
      {/* The tapped person's breakdown of one figure — the column's shown
          one from a counter-cell tap, or whichever row was tapped in the
          person-figures sheet. Guarded on the person still existing — an
          admin can delete a row while any sheet is up, the same guard
          PersonSheet carries; an unknown figure id (a stale saved order)
          falls back to the shown one. */}
      {balOpen && people.some(p => p.id === balOpen.person) && (
        <FigureBreakdownSheet
          figure={figures.find(f => f.id === balOpen.figureId) ?? shown}
          person={people.find(p => p.id === balOpen.person)!}
          onClose={() => setBalOpen(null)}
        />
      )}
      {/* The tapped person's ALL-FIGURES sheet — every role's way in from a
          callsign. A figure row hands over to the breakdown above; the
          admin's Edit person button hands over to the editor below. */}
      {whoOpen && people.some(p => p.id === whoOpen) && (
        <PersonFiguresSheet
          person={people.find(p => p.id === whoOpen)!}
          onOpenFigure={figureId => { setBalOpen({ person: whoOpen, figureId }); setWhoOpen(null) }}
          onEdit={role === 'admin' ? () => { setEditing(whoOpen); setWhoOpen(null) } : undefined}
          onClose={() => setWhoOpen(null)}
        />
      )}
      {editingWho && people.some(p => p.id === editingWho) && (
        <PersonSheet
          person={people.find(p => p.id === editingWho)!}
          onClose={() => setEditing(null)}
        />
      )}
      {eventEdit && role === 'admin' && (
        <EventSheet
          key={`${eventEdit.line}-${eventEdit.date}-${eventEdit.to ?? ''}`}
          line={eventEdit.line}
          date={eventEdit.date}
          to={eventEdit.to}
          onClose={() => setEventEdit(null)}
          onMove={m => { setEventEdit(null); setEventMoveSel(m) }}
        />
      )}
      {/* A manning row's explainer — every role's way in from the row's name;
          what it OFFERS (the amber/red fields) is derived from the role
          inside, so a role change while it is open cannot leave the fields
          on a member's screen. Keyed so switching rows resets the drafts. */}
      {manningInfo && (
        <ManningSheet
          key={manningInfo}
          ruleId={manningInfo}
          onClose={() => setManningInfo(null)}
          onEdit={id => { setManningInfo(null); setCounterEdit(id) }}
        />
      )}
      {/* The counter form — new counter (null) or a rework of one row's rule.
          Keyed so switching counters resets every draft field. */}
      {counterEdit !== false && (
        <CounterForm key={counterEdit ?? 'new'} ruleId={counterEdit} onClose={() => setCounterEdit(false)} />
      )}
      {/* The group editor. Admin only at the affordance AND at every store
          writer it calls — the standing role doctrine. */}
      {groupEdit && role === 'admin' && (
        <GroupSheet
          onClose={() => setGroupEdit(false)}
          onRowDragStart={(e, id) => startRowDrag(e, id, GROUP_DRAG)}
          onPriorityDragStart={(e, id) => startRowDrag(e, id, GROUP_PRIO_DRAG)}
          draggingId={draggingId}
          dragOver={dragOver}
        />
      )}
      {open && !canRemark && !openPostedOut && !raptorOwns(states, open.id, open.date)
        && canEditCell(period, role, open.date) && canEditRow(role, viewer, open.id)
        && !(deciding && isBiddable(grid[open.id]?.[open.date])) && (
        <BidPicker
          key={`${open.id}-${open.date}`}
          callsign={open.callsign}
          personId={open.id}
          date={open.date}
          current={grid[open.id]?.[open.date] ?? ''}
          dates={dates}
          /* Admin-only: post this person out (owner, 18 Aug 26; any date and
             the archive switch, 19 Aug 26). The store sets their posting-out
             date; the greyed boxes and the manpower exclusion follow from it,
             and sync.ts's auto-archive pass reads the switch. */
          onPostOut={role === 'admin'
            ? (from, archive) => { setPostOut(open.id, from, archive); close() }
            : undefined}
          /* Medical is assigned, not bid: only management marks it here.
             Members file theirs on Raptor's Inputs page, which is also the
             normal path once bidding has closed. */
          medical={role === 'admin'}
          /* The column follows the leave just entered — ask for OIL and it
             snaps to OIL USED. The owner's ask, and it makes the figure answer
             the question the bidder is holding in their head at that moment.
             Each leave type's figure id is just its code lower-cased (LL→'ll',
             OIL→'oil'…), so the map is the string itself — a type without a
             figure (EL) simply does not snap. ATT C and HL have no figure of
             their own but do feed MED USED, so they snap there; ATT B feeds
             nothing (the owner's sum leaves it out) and does not snap. */
          onWrote={code => {
            const cell = parseCell(code)
            if (!cell) return
            const id = cell.type.toLowerCase()
            if (figures.some(f => f.id === id)) setShownId(id)
            else if (cell.type === 'ATTC' || cell.type === 'HL') setShownId('med')
          }}
          /* What the balance would read AFTER this write, so the sheet can
             ask before taking someone negative. Computed here because this
             is where the wars, openings and ledger already are. */
          wouldLeave={(code, days) => {
            const spends = codeOf(code)?.spends
            if (!spends) return null
            const left = balanceOf(openings, ledger, wars, open.id, spends.counter)
            return { counter: spends.counter, after: left - spends.amount * days }
          }}
          onClose={close}
        />
      )}
      {/* `!openPostedOut` for the same reason BidPicker carries it: the PO
          sheet's comment promises it short-circuits every bid/decision sheet,
          and without the term here BOTH mounted on a posted-out day that
          still held a bid — the decision sheet painting on top of the Undo
          the admin actually tapped for. One `open`, one sheet. */}
      {open && !canRemark && !openPostedOut && !raptorOwns(states, open.id, open.date) && deciding
        && isBiddable(grid[open.id]?.[open.date]) && (
        <DecisionSheet
          key={`${open.id}-${open.date}`}
          callsign={open.callsign}
          personId={open.id}
          date={open.date}
          code={grid[open.id][open.date]}
          state={stateOf(states, open.id, open.date)}
          movedFrom={shiftedFrom(states, open.id, open.date)}
          dates={dates}
          onClose={close}
        />
      )}
    </div>
  )
}
