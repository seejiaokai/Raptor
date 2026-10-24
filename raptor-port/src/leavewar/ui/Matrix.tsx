import { Fragment, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type RefCallback, type TouchEvent } from 'react'
import { dayLabel, shortDate, shortSpan } from './dates'
import { addDays, boxText, canDecide, canEditRow, focusDateOf, memberToday, openFrom, catClass, catText, codeOf, columnKindFor, evaluatePeriod, groupOf, assignGroup, groupLabel, matchesGroup, OTHER_ID, OTHER_LABEL, SANS_GROUP_ID, inSquadron, postingSheetFor, isBiddable, opsCatOf, orderedFigures, DEFAULT_FIGURE_ID, FIGURES, figureForLeave, figureLines, dayName, isWeekend, monthsIn, parseCell, raptorOwns, shiftedFrom, stateOf, type Person, type Period, type DayInfo, type Grid } from '../engine'
import { actCount, filedSince, awardsOnDay, balanceAfterFill, canBidOn, ownPendingOnClosedDay, clearRecordById, figureCtxOf, oilOnDay, setBalance, setDayAward, groupsInOrder, groupPriorityIds, lwHistEpoch, displayRoster, getState, takeFocusOpen, movableRecords, moveRecords, moveRecordsProblem, stayingIn, moveEvent, moveEventProblem, manningBlockOrder, setPostIn, postingProblem, visibleFigures, hasAccount, postingBlocked, postingLocked, type MoveResult, type MoveRec, type EventMoveResult } from '../state/store'
import { AwardSheet, BidPicker, PostInSheet, PostOutSheet, RaptorSheet } from './BidPicker'
import { FigureBreakdownSheet, PersonFiguresSheet } from './CounterSheet'
import { FigureCell, show } from './FigureCell'
import { FiguresDrawer, FigureTitle, figClass, type DrawerRow } from './FiguresDrawer'
import { OilTracker } from './OilTracker'
import { CountRows } from './CountRows'
import { CounterForm } from './CounterForm'
import { ManningSheet } from './ManningSheet'
import { EventRows } from './EventRows'
import { FlyRows, type FlyPickApi } from './FlyRows'
import { EventSheet } from './EventSheet'
import { monthInView } from './monthview'
import { popAt } from './popat'
import { clampWin, leftGrowAbsorbable, rollingTarget, stepAllowedInMotion, stepToward, visibleSpan, windowAround, WINDOW_FROM_MONTHS, type ColWin } from './colwindow'
import type { PostOutcome } from '../engine'
import { outcomeOf, bandAt, classifyEvent, dayEvent, dayEventKind, EVENT_KIND_WORDS } from '../engine'
import { isLwOnScreen, subLwScreen } from '../state/screen'
import type { RecordSpans } from '../state/merge'
import { creditGiver } from '../engine/warrecs'
import { msSinceInput } from '../../state/idle'
import { boxOf, frameLift, frameLand, landOn } from '../../ui/lift'
import { edgeAutoScroll } from '../../ui/edgescroll'
import { wirePinch } from '../../ui/pinchzoom'
import { flushSync } from 'react-dom'
import { LW_ZOOM_MAX, lwMonthFitZoom, roundZoom } from './lwzoom'
import { wireSelect, wireMove, wireFigureSelect, daysBetween, paintLanding, clearLanding, paintEventLanding, eventMoveDateAt, earliestDate, type Cell, type Selection, type SelectCtx, type FigureSelectCtx, type FigureSelection } from './select'
import { selectableFigure } from '../engine/counters'
import { SettingsSheet } from './SettingsSheet'
import { StageBar } from './Chrome'
import { askLw, setOilUp, subscribeLwNav, takeLwAsk, lwNavVersion } from './lwnav'
import { usePhone } from './phone'
import { groupColorOf, inkFor } from './groupColor'
import { SelectSheet } from './SelectSheet'
import { BalanceBar } from './BalanceBar'
import { RemarksSheet } from './RemarksSheet'
import { ClosedNoteSheet } from './ClosedNoteSheet'

import { availRowNames, availVerdictAt, bidDayLine, dayFacts, docGet, flyMonth, leaveInputAt, rowDocIds, openDays, postOut, postOutProblem, undoPostOut, undoPostOutProblem, type DayAnswer } from '../sync'
import { DayPanelHost, openDayPanel } from './DayPanel'
import { columnInView } from './inview'
import { useVersion } from './useStore'
import { DayListSheet } from './DayList'
import { GROUP_DRAG, GROUP_PRIO_DRAG, MANNING_DRAG, NO_QUALS, PersonRow, type QualPill, type RowApi, type RowDragCfg, freeHalfBeside, ownAwardAlone, setPhWidth } from './MatrixRows'
import './matrix.css'

/** A posting through the store, or the sentence saying why it was refused (the absence-record re-test, AB5, 26 Sep
 *  26): every posting door — the bid sheet's PI / PO, the two posting sheets, the drag-selection's PO — shows it and
 *  stays open, where each used to close (or snap back) with nothing said. */
function postOutOr(id: string, from: string, archive?: boolean | PostOutcome): string | undefined {
  /* never Delete oneself (the posting door's own refusal — sync.ts postOutProblem) */
  const self = postOutProblem(id, typeof archive === 'string' ? archive : (archive === false ? 'none' : 'overseas'))
  if (self) return self
  /* through the bridge, so a Post out's own archive follows the new date and switch (Astra's final read, finding 2) */
  return postOut(id, from, archive) ? undefined : (postingProblem(id, 'out', from) || 'That posting date was not taken.')
}
function postInOr(id: string, from: string): string | undefined {
  return setPostIn(id, from) ? undefined : (postingProblem(id, 'in', from) || 'That posting date was not taken.')
}

/** A move refusal, in plain words for the move banner. */
function moveReason(r: Exclude<MoveResult, 'moved'>): string {
  switch (r.reason) {
    case 'occupied': return `That lands on ${r.at ? shortDate(r.at) : 'a day'} which is already booked — pick another day.`
    case 'raptor': return 'One of those is filed on the Inputs page and cannot be moved here.'
    case 'window': return 'That lands outside what you can edit — pick another day.'
    /* a member's landing on a day closed for him (M3 §4 (4) — the agent's words, shown at his look, his to change) */
    case 'closed': return 'That day is closed for bidding. Pick an open day.'
    default: return 'Nothing to move.'
  }
}

/** WHAT A MOVE LEAVES BEHIND, in the banner's words (the mock-up's reading, uncorrected — D331: "in a block what can
 *  move goes; what can't stays, and the banner says what stays"). " · 1 OIL award stays", " · 2 OIL awards and 1 bid
 *  stay". Only what a person put there and might expect to travel (`stayingIn`); nothing when everything moves. */
function stayWords(stays: ReadonlyArray<{ what: 'award' | 'filed' | 'approved' | 'bid' | 'refused' | 'una' }>): string {
  if (!stays.length) return ''
  const label: Record<string, [string, string]> = {
    award: ['OIL award', 'OIL awards'],
    approved: ['approved leave', 'approved leaves'],
    filed: ['leave filed on the Inputs page', 'leaves filed on the Inputs page'],
    bid: ['bid', 'bids'],
    refused: ['refused bid', 'refused bids'],
    una: ['UNA', 'UNA'],
  }
  const parts = (['award', 'una', 'approved', 'filed', 'bid', 'refused'] as const)
    .map(k => { const n = stays.filter(x => x.what === k).length; return n ? `${n} ${label[k]![n === 1 ? 0 : 1]}` : '' })
    .filter(Boolean)
  return ` · ${parts.join(' and ')} ${stays.length === 1 ? 'stays' : 'stay'}`
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
 *  ('yyyy-mm|yyyy-mm', or '' meaning no measurement → everyone).
 *
 *  A posted-out person rides every month up to and including the one holding
 *  their last day and drops off after it (owner, 19 Aug 26 — "once I hit the
 *  next month… the row disappears"); a late joiner mirrors it at the other
 *  end. Month granularity on purpose: scrolling inside a month never
 *  reshuffles the rows, only crossing a boundary does.
 *
 *  …AND the row stretches to reach anything the war shows for them outside
 *  those dates (owner, 20 Sep 26 — records may be dated before someone posts
 *  in and after they post out, "because those dates are official dates. But
 *  they can be for e.g still taking leave after or before they post in or
 *  out"). Without it a man posted out in January with clearing leave in
 *  September was charged for that leave and could not be seen — the money and
 *  the screen disagreed. `spans` is merge.ts's per-merge map, so this stays a
 *  lookup; it is a DISPLAY span only, and his own dates — which is what every
 *  manning count reads — are untouched. This narrows the 19 Aug rule above
 *  rather than reversing it: a row with nothing out there still disappears
 *  exactly as it did. */
function rowInWindow(p: Person, win: string, spans?: RecordSpans): boolean {
  if (!win) return true
  const [first, last] = win.split('|')
  const span = spans?.get(p.id)
  const endsAt = p.to === null ? null
    : span && span.last > p.to.slice(0, 7) ? span.last : p.to.slice(0, 7)
  const startsAt = p.from === null ? null
    : span && span.first < p.from.slice(0, 7) ? span.first : p.from.slice(0, 7)
  /* D320 ([ONE-DOOR], 27 Sep 26): an earlier stint shows his row too — a leave period that holds one of his stints
     shows him, one he was away for the whole of (and holding no record of his) does not */
  const inPast = !!p.past && p.past.some(s => s.to.slice(0, 7) >= first! && (s.from === null || s.from.slice(0, 7) <= last!))
  if (endsAt !== null && endsAt < first!) return inPast
  if (startsAt !== null && startsAt > last!) return inPast
  return true
}

/** Whether two frozen-header pins measured the same bar — its box and every
 *  column width, to a hundredth of a pixel. A re-pin that finds nothing moved
 *  keeps the old pin, so re-measuring after a change costs no re-render. */
function sameStuck(
  a: { top: number; left: number; width: number; cols: number[] },
  b: { top: number; left: number; width: number; cols: number[] },
): boolean {
  if (a.top !== b.top || a.left !== b.left || a.width !== b.width || a.cols.length !== b.cols.length) return false
  return a.cols.every((w, i) => Math.abs(w - b.cols[i]!) < 0.01)
}

/* The ground-crew free-text role-label editor (`PersLabel`) was REMOVED
   (owner, 28 Aug 26 — "i can edit personnel, dont need to show that, just leave
   it as the callsign/name"). In Rearrange, a ground-crew row used to turn its
   name column into a "Maint / Line" edit box; the owner does not want that
   editing, so the row now shows the same callsign + category chip as every
   other row, in both modes. The stored labels and the store's
   `personLabel`/`setPersLabel` seam are untouched (roster.test.ts still covers
   them) — only the on-grid editor is gone. */


/** The bid bubble's reading of the grid at one moment (D1227): each flagged row-day at its level (1 amber, 2 red) with its
 *  figure (`have` — D1345), the days drawn then — the two Available rows are read over the drawn days only — and the
 *  count of the war's gestures (`seq`, so the bubble can tell a filing made since from a bid — D1351). */
export type BubbleFlags = { m: Map<string, { label: string; lv: number; have?: number }>; drawn: Set<string>; seq?: number }
/** How a bid made a row worse: it TURNED it (to amber or red, or amber to red), or took it LOWER where it already stood
 *  at that level (D1345). */
export type Worse = { lv: 'amber' | 'red'; how: 'turns' | 'lower' }
/** The rows a bid made WORSE between two readings, each at its worst — a row-day turned amber or red, or amber to red; or
 *  (D1345, his report of 25 Oct 26) one already amber or red whose figure went lower. A row that turns on one day and
 *  only goes lower on another reads as turned; red outranks amber. Exported for its unit test (bidbubble.test.tsx). */
export function worsenedRows(before: BubbleFlags, now: BubbleFlags): Map<string, Worse> {
  const worst = new Map<string, Worse>()
  const rank = (w: Worse) => (w.lv === 'red' ? 2 : 0) + (w.how === 'turns' ? 1 : 0)
  for (const [k, { label, lv, have }] of now.m) {
    /* an Available row's day not drawn when the "before" was read has no "before" — a month drawn while a bid window was
       open (the page behind it scrolls) is never "turned" by the bid (the code read of 23 Oct 26) */
    if ((k.startsWith('availp|') || k.startsWith('availw|')) && !before.drawn.has(k.slice(7))) continue
    const was = before.m.get(k)
    let how: Worse['how'] | null = null
    if (lv > (was?.lv ?? 0)) how = 'turns'
    else if (was && have !== undefined && was.have !== undefined && have < was.have) how = 'lower'
    if (!how) continue
    const w: Worse = { lv: lv === 2 ? 'red' : 'amber', how }
    const had = worst.get(label)
    if (!had || rank(w) > rank(had)) worst.set(label, w)
  }
  return worst
}
/** THE BUBBLE'S WORDS (D1227, D1345, D1351): what was placed — "This bid", or after a filing "This overseas duty", "This
 *  course", "This UNA" — then the rows it turned ("turns FCP amber, IP red"), then the rows it took lower where they
 *  already stood ("takes Available P lower, still red"), the two parts joined by "and". Exported for its unit test. */
export function bubbleWords(worse: Map<string, Worse>, filed: 'CSE' | 'OD' | 'UNA' | null): string {
  const what = filed === 'OD' ? 'This overseas duty' : filed === 'CSE' ? 'This course' : filed === 'UNA' ? 'This UNA' : 'This bid'
  const turned = [...worse].filter(([, w]) => w.how === 'turns').map(([l, w]) => `${l} ${w.lv}`)
  const lowers = (['red', 'amber'] as const).map(lv => ({ lv, names: [...worse].filter(([, w]) => w.how === 'lower' && w.lv === lv).map(([l]) => l) })).filter(x => x.names.length)
  /* a list said as a person says it — "IP amber and Available P red" — where it is the sentence's only part; beside
     another part its items take commas, so "and" joins only the parts (as drawn, docs/img/handpass/2026-10-25-lw-drawings/bubble/) */
  const alone = (turned.length ? 1 : 0) + lowers.length === 1
  const list = (xs: string[]) => (alone && xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}` : xs.join(', '))
  const parts: string[] = []
  if (turned.length) parts.push(`turns ${list(turned)}`)
  for (const { lv, names } of lowers) parts.push(`takes ${list(names)} lower, still ${lv}`)
  return `${what} ${parts.join(' and ')}.`
}

export function Matrix() {
  /* kept in a name (not just subscribed) so store-reading memos below can
     re-derive on every store change — `movers` reads live grid state, and a
     memo keyed only on the selection went stale when a sync pass changed a
     selected cell under an armed move */
  const version = useVersion()
  const { people, period, grid, states, views, spans: rowSpans, requirements, role, viewer, eventDefs, openings, ledger, wars, figureOrder, eventRows, focusDate, focusSeq, focusSoft, focusQuiet, qualCatalog, groupColors } = getState()
  const dates = period.days.map(d => d.date)
  // Memoized on the store objects (the store replaces what it writes, so
  // identity IS change): rules-as-data made a day's evaluation walk every
  // rule's own filter, and paying that for all 365 days again on every
  // VIEW-state render (a sheet opening, Rearrange toggling) is waste the old
  // fixed-kind lookup merely tolerated.
  const verdicts = useMemo(
    () => evaluatePeriod(people, grid, states, requirements, dates, views),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [people, grid, states, views, requirements, period],
  )
  // The colour a whole day column takes from its events: light green for an
  // off day (a PH), orange for a no-leave day. Computed once per day and read
  // into both the header and the body cells, so a tag colours the whole
  // column, not just the event rows — finding a holiday in 90 columns should
  // not need reading the top two rows. `work` never colours the column (its
  // own word goes red instead), so it maps to no class here.
  // Memoised on the store version (3 Sep 26): the map is a row prop now, and
  // a fresh Map on every render would defeat the row memo (see PersonRow).
  // Keyed on `version`, not the period object, because store writes may
  // update in place — the version is the one signal that never lies.
  const evKind = useMemo(() => {
    const m = new Map<string, string>()
    for (const d of period.days) {
      const k = columnKindFor(eventDefs, d, period.bands)
      if (k === 'off') m.set(d.date, 'evoff')
      else if (k === 'free') m.set(d.date, 'evfree')
      else if (k === 'nolv') m.set(d.date, 'evnolv')
    }
    return m
    /* keyed on what it reads — the period and the event types — never on every store change: a bid leaves both the same
       objects, and a new Map each write made every month of every row draw again ([LW-MONTH-MEMO-UNPINNED], M3 §4) */
  }, [period, eventDefs])

  // Which cell is open, not which sheet is open: what the sheet OFFERS is
  // derived from the stage and the role, so a period that moves on — or a
  // role that changes — while a sheet is open cannot leave the wrong
  // controls on screen.
  /* `posting` — the posting sheet the tap opened, PINNED for as long as the sheet is up (the absence-record re-test,
     W3-F5, 26 Sep 26 — found by the war walker). The Post out sheet commits on change and stays up so the admin can
     see the grid move behind it; moving the date PAST the tapped day made that day an in-squadron day, and the grid
     re-chose the sheet from the day's new state, so a bid sheet appeared under his hands, one tap from placing leave.
     Read at the tap, from the day as it stood; unset for every other sheet, which follows the day live (a PO placed
     from the bid sheet closes that sheet — the next tap on the greyed day opens the Post out sheet). */
  const [open, setOpen] = useState<{ id: string; callsign: string; date: string; posting?: 'po' | 'pi' } | null>(null)
  const close = () => { setOpen(null); setPlaceAt(null) }
  // The DRAG-SELECTION (owner, 27 Aug 26): the rectangle the last drag left,
  // and the sheet it opens. `moveSel` is the selection currently being MOVED
  // (Task E) — sheet closed, waiting for a drop. Both cleared on a stage/war
  // change so a stale block cannot act on the wrong screen.
  const [sel, setSel] = useState<Selection | null>(null)
  /* the selection as it now stands, for the select machine wired once; and the drag window's way to keep its typed words
     when a NEW drag replaces it (the night's code read, R4) */
  const selRef = useRef<Selection | null>(null)
  selRef.current = sel
  const selFlushRef = useRef<(() => void) | null>(null)
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
  const openPostedOut = open?.posting
    ? open.posting === 'po' && !!openPerson && openPerson.to !== null
    : !!open && !!openPerson && postingSheetFor(openPerson, open.date) === 'po'   // D320: by stint
  // …and its mirror at the other end: a day BEFORE the person posted in
  // (owner, 20 Sep 26). For an ADMIN this opens the post-in sheet, exactly as
  // a posted-out day opens the post-out one; for a member it falls through to
  // the bid picker, which is answer C's "filed or bid" on a pre-joining day.
  const openNotYetArrived = open?.posting
    ? open.posting === 'pi' && !!openPerson && openPerson.from !== null
    : !!open && !!openPerson && postingSheetFor(openPerson, open.date) === 'pi'   // D320: by stint
  /* "Place leave or OIL here instead" (owner, 20 Sep 26 — "we should also allow
     putting inputs when we click on days that were posted out"). An admin's tap
     on a day outside someone's time in the squadron opens the POSTING sheet,
     which is right for the common case but left him no way to file the clearing
     leave that made him open the day. Everyone else could already: the man
     himself taps his own day and gets the bid sheet, and the Inputs page takes
     any date. This remembers the ONE cell he asked to place on, so the posting
     sheet stands aside for the bid sheet — for that cell only, until it closes.
     Keyed by CELL rather than a boolean, so opening a different day never
     arrives already switched. */
  const [placeAt, setPlaceAt] = useState<string | null>(null)
  const openKey = open ? `${open.id}|${open.date}` : ''
  const placing = !!open && placeAt === openKey
  // ONE selected figure, shared by every row, tracked by its stable ID so a
  // reorder keeps the SAME figure on screen rather than whatever now sits in
  // its old slot. Giving each row its own would let them desync — row 1
  // showing +LVE while row 2 shows −MED TOT — worse than no column at all.
  // `visibleFigures()` (the admin's order, minus anything hidden, 6 Sep 26) —
  // not `orderedFigures(figureOrder)` — so a hidden figure drops out of the
  // cycle, the picker and the dots at once, everywhere this column shows.
  // Memoised on the store's own version so the list is the SAME array between
  // store changes: the drawer's rows are memoised against it (FiguresDrawer),
  // and a fresh array every render would defeat them.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const figures = useMemo(() => visibleFigures(), [version])
  // The figures DRAWER (owner, 6 Sep 26): every figure at once, popped out
  // beside the names over the days. Open on a desktop, closed on a phone — a
  // view preference, session-only, either role. Decided once at mount from the
  // same width query the phone flag uses; jsdom (no matchMedia) opens closed so
  // the unit suite sees the grid it always saw.
  /* THE GRID'S BALANCES FOLD GOES (D1245, 22 Oct 26 — "n5 as recommended"; narrowing D1185): every balance column is to
     live on the Balances tab (the overhaul's M5) and on the grid each name keeps only its LVE figure, so no two things on
     the page share the name "Balances". Its switch stood in the month band row, which goes too (D1257). Until M5 a
     person's every figure is a tap on his name (his person window). The drawer's code stays switched off here — it goes
     whole with M5's Balances page, which replaces it ([LW-OVERHAUL] — the build plan's M5). */
  const [figuresOpen, setFiguresOpen] = useState(false)
  // Where the drawer sits and how wide it came out: the real header row's top
  // inside `.mx-outer`, the names column's right edge, the header row's height
  // and the drawer's own measured widths (its right edge and its columns feed
  // the stuck header's frozen copy). All MEASURED — never guessed — like
  // `bandTop`; null while closed or before the first layout (jsdom).
  const [drawerAt, setDrawerAt] = useState<{ top: number; left: number; headH: number; width: number; cols: number[] } | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  // Stable, for the same reason `figures` is: it is a memoised row's prop.
  const onDrawerBox = useCallback((person: string, figureId: string) => setBalOpen({ person, figureId }), [])
  // Whose counter was tapped, and WHICH figure to break down (owner, 17 Aug
  // 26). A counter-cell tap opens the column's shown figure; a row tapped
  // inside the person-figures sheet names its own.
  const [balOpen, setBalOpen] = useState<{ person: string; figureId: string } | null>(null)
  // Whose CALLSIGN was tapped — the all-figures sheet, for every role
  // (owner, same day: "everyone should be able to click on that person's
  // name and see these logics").
  const [whoOpen, setWhoOpen] = useState<string | null>(null)
  // The QUALIFICATIONS popover (owner, 3 Sep 26 — "hover the mouse over the
  // person to see the qualifications they hold"). A person wears only their CAT
  // chip; every other qualification (SC DAY, TF, NVG…) lives here, shown on a
  // desktop hover or a phone tap of the chip. Positioned in screen coordinates
  // so the frozen callsign column's overflow can never clip it. null = hidden.
  const [qualPop, setQualPop] = useState<{ id: string; x: number; y: number } | null>(null)
  // The OIL TRACKER (owner, 2 Sep 26): open on everyone (the toolbar button)
  // or on one person, scrolled to their row (the Cinch sheet's OIL BAL row).
  // null = closed. It carried a `focus` day as well until 6 Sep 26, for a grid
  // write to light the credit it had just made; the write-opens-the-tracker
  // route was reversed the same day, so both the field and the prop are gone.
  const [oilTracker, setOilTracker] = useState<{ person: string | null } | null>(null)
  /* THE TOP ROW'S ASKS (ui/lwnav.ts — D1254): its tabs, ⚙ and My leave open the windows this grid owns, as their buttons
     did when they sat on the grid card's bar. Taken once; the OIL tab reads as chosen while the tracker is up. */
  const navSeq = useSyncExternalStore(subscribeLwNav, lwNavVersion, lwNavVersion)
  useEffect(() => {
    const a = takeLwAsk()
    if (!a) return
    if (a.kind === 'grid') setOilTracker(null)
    else if (a.kind === 'oil') setOilTracker({ person: null })
    else if (a.kind === 'settings') setSettings(true)
    else if (a.kind === 'person') setWhoOpen(a.id)
  }, [navSeq])
  useEffect(() => { setOilUp(!!oilTracker) }, [oilTracker])
  // Which event cell the admin has tapped to edit, or null. Keyed by line +
  // day; the Event sheet reads the current text or band off the store.
  // `to` is set only when a DRAG selected a span (owner, 27 Aug 26) — the sheet
  // then opens pre-set to that range; a single click leaves it undefined.
  const [eventEdit, setEventEdit] = useState<{ line: number; date: string; to?: string } | null>(null)
  /* THE BOX A TAP ON A FILLED EVENT CELL OPENS (the Inputs / SANS redesign, plan §3.12; owner D643, D644): the grid
     prints an event's short form, and this is where its full name, its kind and its dates are read — by everyone; an
     admin's carries "Edit". A small menu, not a window (D641's reading 2): screen-fixed like the quals popover, closed
     by a press outside it, Escape, a scroll or a resize. `tid` is the cell it hangs from, so a second tap on that cell
     closes it rather than closing and re-opening it. */
  const [evPeek, setEvPeek] = useState<{ line: number; date: string; tid: string; x: number; y: number } | null>(null)
  // Which manning count row's explainer is open (owner, 19 Aug 26 — a tap on
  // the row's name says what it counts and where its colours turn on).
  const [manningInfo, setManningInfo] = useState<string | null>(null)
  // The counter form (owner, 19 Aug 26): `false` closed, `null` building a
  // NEW counter, an id editing that one. Reached from + Counter in the
  // Rearrange tools and from the explainer sheet's Edit counter… button.
  const [counterEdit, setCounterEdit] = useState<string | null | false>(false)
  /* the two Available rows' names open this same form (FlyRows.tsx — D640); stable, so the rows' memo holds */
  const editAvail = useCallback((id: 'availp' | 'availw') => setCounterEdit(id), [])
  // The ⚙ SETTINGS sheet (owner, 3 Sep 26) — all admin config (counters, event
  // rows, Show SANS, the roster groups), opened from the top-row ⚙.
  const [settings, setSettings] = useState(false)
  // Edit-mode roster rearranging (owner, 18 Aug 26). Admin-only view state: it
  // turns the drag handles on, so an admin reading the grid does not nudge a
  // row by accident. Started from the ⠿ in the grid corner (owner, 3 Sep 26).
  const [arranging, setArranging] = useState(false)
  // ("Reset counters" and its armed question lived here until D669, 8 Oct 26: with no built-in counters there is
  // nothing to go back to. A counter deleted by mistake comes back with Undo.)
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
  /* `el` is the hovered row's own element, so the drop can read the ordered
     list from ITS container (bug hunt, 4 Sep 26): the ⚙ groups list and the
     grid's category headings share one `data-grow` vocabulary, so a
     document-wide query while both were on screen (settings open in rearrange
     mode) mixed the two lists and could land a "drop after the last group"
     before the first. */
  const dragOverRef = useRef<{ id: string, after: boolean, el: Element } | null>(null)
  // The teardown for a drag in flight, so an unmount (role change, war switch)
  // can end it — otherwise its window listeners leak and the row stays stuck
  // in the .dragging highlight.
  const dragCleanup = useRef<(() => void) | null>(null)
  /* ONE LIFT, EVERY DRAG (owner, 6 Sep 26): the grid's overlay frame (rendered
     last in .mx-outer with a constant className, so React never writes to it
     again — this ref is its only writer) and the landing to play once the
     store's move has re-rendered the rows. Refs, not state: the frame must cost
     nothing per frame and nothing per render. */
  const liftRef = useRef<HTMLDivElement | null>(null)
  const landRef = useRef<{ sel: string; surface: 'grid' | 'list' } | null>(null)
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
    /* the frame goes up in the same tick as the grip's pointerdown — one
       measurement, then nothing until the drop. A GRID row (person, heading,
       manning) is composite, so it gets the frame; a Settings LIST row is one
       element and already wears the recipe through its prop-driven `dragging`
       class (matrix.css), so it needs nothing here. */
    const grip = e.currentTarget as Element
    const surface: 'grid' | 'list' = grip.closest('.mx-wrap') ? 'grid' : 'list'
    const rowEl = grip.closest(cfg.sel) as HTMLElement | null
    const outer = mxOuterRef.current, wrap = wrapRef.current
    if (surface === 'grid' && rowEl && outer && wrap) frameLift(liftRef.current, boxOf(outer, rowEl, wrap))
    /* The row under the pointer, read at a point — by a move, and again after an edge scroll has slid the rows
       under a pointer that has not moved (D892). */
    const hoverAt = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y)
      let row = el && (el as Element).closest ? (el as Element).closest(cfg.sel) : null
      let overId = row ? cfg.idOf(row) : null
      /* which half decides before/after; a zero-height rect (jsdom) reads as
         "before", keeping the old semantics where layout cannot answer */
      let after = false
      if (row) {
        const r = (row as HTMLElement).getBoundingClientRect()
        after = r.height > 0 && y > r.top + r.height / 2
      }
      /* ONE LINE A GAP (owner D890, 15 Oct 26 — "Shouldn't it be just 1 position when I try to move between rows?").
         The lower half of a row and the upper half of the row below it are ONE drop — the commit below resolves
         "after X" to "before the row that follows X" — but they drew two lines a few pixels apart: X's bottom edge,
         then the next row's top. So the hover names that following row straight away, and the line is drawn once,
         on its top edge — on the grid and on the ⚙ Settings lists (Groups, Who wins) alike (D891, "Yes fix them
         too"). Only the row that IS the follower is taken: the next sibling of the same kind, stepping over a
         sibling the page hides (a phone hides the CAT sub-headings). A heading or anything else a row cannot land
         on (a group's open colour palette) keeps "after X" — its bottom edge is then the only line in that gap. Not
         over the row being dragged: it shows no line over itself. */
      if (row && after && overId !== dragId.current) {
        let next = row.nextElementSibling
        while (next && !next.matches(cfg.sel) && getComputedStyle(next).display === 'none') next = next.nextElementSibling
        const nextId = next && next.matches(cfg.sel) ? cfg.idOf(next) : null
        if (next && nextId) { row = next; overId = nextId; after = false }
      }
      const cur = dragOverRef.current
      if (overId !== (cur?.id ?? null) || after !== (cur?.after ?? false)) {
        dragOverRef.current = overId && row ? { id: overId, after, el: row } : null
        setDragOver(overId); setDragAfter(after)
      }
    }
    /* CARRIED TO THE EDGE, THE VIEW FOLLOWS (owner D892, 15 Oct 26 — "when I drag the row of the puck down outside
       the screen, the screen doesn't pan"). Held near the top or foot of what scrolls the rows — the page for the
       grid, the sheet's own list for the ⚙ lists — the view runs that way at the war's own edge feel
       (`src/ui/edgescroll.ts`, the numbers the day-cell drag selection uses), and the row under the still pointer is
       read again after each step, so the landing line follows the rows sliding under it. */
    let px = e.clientX, py = e.clientY
    const auto = edgeAutoScroll({
      from: rowEl ?? grip, axis: 'y', touch: e.pointerType === 'touch', x: px, y: py,
      onScroll: () => hoverAt(px, py),
    })
    const move = (ev: PointerEvent) => {
      px = ev.clientX; py = ev.clientY
      auto.point(px, py)
      hoverAt(px, py)
    }
    // `commit` is false for a cancel (a system gesture, multi-touch, or the
    // grid unmounting mid-drag): tear down without moving anything. Without a
    // pointercancel path the pointerup never comes and the listeners — and the
    // stuck highlight — leak, most likely on the phone drag this was built for.
    const end = (commit: boolean) => {
      auto.stop()
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
      // The lift is over either way — a commit re-places the frame at the
      // landing below, a cancel simply leaves it hidden.
      frameLift(liftRef.current, null)
      if (commit && from && over) {
        if (over.id !== from) {
          /* "after row X" resolves to "before the row that follows X" in the
             RENDERED order — the DOM is what the user is looking at, and the
             hit-test above already trusts it. No follower means the true end
             of the roster, the store's beforeId:null path (unreachable from
             this gesture before the rework). Resolving to `from` itself means
             the drop lands exactly where the row already is — skip, or the
             store's before-itself guard would have to save us. */
          let beforeId: string | null = over.id
          if (over.after) {
            /* The follower comes from the hovered row's OWN list (its parent), not
               the whole document — see dragOverRef. */
            const scope: ParentNode = over.el.parentElement ?? document
            const rows = [...scope.querySelectorAll(cfg.sel)]
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
        /* EVERY committed drop flashes, including one that moved nothing — a row
           released on itself, or "after the row above it", which resolves to
           where it already is. The owner's ask is "once I drop the item, it
           should flash to show where the new item ended up", and in place IS
           where it ended up; the alternative is a drop that answers with
           nothing at all (review, 6 Sep 26). A CANCEL still shows nothing:
           pointercancel, an unmount, or a release over no row never reaches
           here (`over` is null).
             It is measured AFTER React commits: this listener is a native
           window handler, so the store's notify and the state clears above are
           batched into one commit that has not happened yet, and the layout
           effect below reads this ref there.
             AND IT IS SET AFTER cfg.move(), where every other surface marks
           BEFORE its write (rowdrag.ts, InputsCal.tsx, drag.ts) — safe here, and
           only here, for that same batching reason: those three hand their mark
           to a DOM that an innerHTML rebuild replaces during the very call that
           follows, so the mark has to exist first. This one is read by a layout
           effect of the commit that `cfg.move`'s notify schedules, and React
           batches a native listener's updates to the end of this handler, so
           nothing has re-rendered by the time this line runs. The order that
           matters is ref-before-RETURN, not ref-before-move; writing it here
           keeps it beside the `beforeId !== from` decision it depends on. */
        landRef.current = { sel: cfg.landSel(from), surface }
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
  /* the admin's editors close when the role in force stops being admin — the admin's switch to the member view (D292;
     Astra's code read 5, 27 Sep 26: Edit aircrew — gone since D461 — and the counter form stayed open with live controls), so switching back
     never reopens a stale draft either */
  useEffect(() => { if (role !== 'admin') setCounterEdit(false) }, [role])
  /* THE COLUMN BESIDE THE NAMES IS LVE ALONE (D1245, 22 Oct 26 — "each name keeps only its LVE figure beside it"; the
     M2 code read's F2). Every other balance lives on the Balances tab (D1242, M5) and in a person's window (a tap on his
     name). So the column no longer picks: no picker in its heading, no swipe across it, no jump to OIL or CCL after a
     write — and an admin's hidden-figures list, which orders the person window's figures, never takes LVE off it. */
  const shown = FIGURES.find(f => f.id === DEFAULT_FIGURE_ID)!
  // Everything a figure needs to read a person's number — the store's one
  // builder, so this column, the sheets and the tracker read the same OIL
  // policy and the same "today" (a hand-built literal here used to drift).
  // Once per store change, not per render — a row prop (see PersonRow).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const figureCtx = useMemo(() => figureCtxOf(), [version])
  /* WHAT A BALANCE WOULD READ AFTER A LEAVE FILL — one question for the two sheets that fill leave, so both ask the
     same thing with the same number before taking someone below zero: the one-day sheet (a day or a picked range) and
     the drag-selection sheet, which asks too since his ruling D418 (29 Sep 26 — "Drag asks too"). The store answers it
     (`balanceAfterFill`) from the balance column's own figure, read of the wars as the fill would leave them. */
  const balanceAfter = (personId: string, dates: readonly string[], code: string) => balanceAfterFill(personId, dates, code)


  // Jumping to a month is how a year-long war is navigable at all: 365
  // columns is roughly 13,600px, and nobody finds September by dragging.
  const wrapRef = useRef<HTMLDivElement>(null)
  // Drag-select wiring: ONE delegated pointer listener on `.mx-wrap` (never
  // per-cell — the grid is ~28k nodes), reading live state through a ref so
  // the gesture always sees the current roster/dates/mode without re-binding.
  // Assigned just before the return, where rosterSequence and the mode flags
  // are in scope.
  const selCtxRef = useRef<SelectCtx | null>(null)
  /* The Required rows own their picked block and its panel (FlyRows.tsx) — a pick there must not re-render this
     grid. This ref is the hand-over: the drag below calls `pick`, and a pick of anything else calls `close`, so the
     two non-blocking panels (D641, D642) are never up together. */
  const flyPickRef = useRef<FlyPickApi | null>(null)
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
      reqEnabled: () => selCtxRef.current?.reqEnabled?.() ?? false,
      onReqSelect: s => selCtxRef.current?.onReqSelect?.(s),
      leftEdge: () => selCtxRef.current?.leftEdge?.() ?? w.getBoundingClientRect().left,
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
  /* keyed on the OPEN DATES since the stages went (D1177): opening or closing days under an open panel ends it, as a stage
     move did — a panel built on days since closed must not act on them (the scenario designer's S29) */
  const openSig = period.open.map(s => `${s.from}~${s.to}`).join(',')
  useEffect(() => { setSel(null); setMoveSel(null); setMovePreview(null); setMoveErr(''); setEventMoveSel(null); setEventMovePreview(null); setEventMoveErr('') }, [openSig, period.id, histEpoch])
  /* ...and a WAR change closes the sheet open on the old war (the absence-record re-test, W5-F3, 26 Sep 26): left open,
     its controls still wrote to the day it was opened on — in the war no longer on screen. The Sheet now holds the
     keyboard too, so the switch cannot be reached from inside one; this is the second guard, for any other road to a
     switch (an undo that snaps the war, a reload of the picker). */
  useEffect(() => { setOpen(null); setPlaceAt(null); setEventEdit(null); setEvPeek(null) }, [period.id])   // the event sheet too (Fable F4)
  // MOVE MODE is wired further down, after the `phone` breakpoint state it
  // reads to choose commit-on-click (desktop) vs preview-then-Confirm (phone).
  // The frozen-column overlay's own anchors (see the .mxband block below and
  // in matrix.css). `mxOuterRef` is the page-flow box the overlay is absolutely
  // placed inside; `rosterBodyRef` is the one row group it must line up with.
  const mxOuterRef = useRef<HTMLDivElement>(null)
  const bandRef = useRef<HTMLDivElement>(null)
  const rosterBodyRef = useRef<HTMLTableSectionElement>(null)
  const [phone, setPhone] = useState(false)
  /* THE PHONE'S TWO-STEP FOLLOWS THE SCREEN AS IT IS NOW (Astra's final read, 4, 27 Sep 26): the move's tap handler is
     wired once, when the move begins, and read `phone` as it was then — a move begun at desktop width and carried on
     after the window narrowed landed at once, with no Confirm. It reads this ref at the tap instead; a change of width
     takes down a staged landing (the effect below). */
  const phoneRef = useRef(false)
  phoneRef.current = phone
  useEffect(() => {
    setMovePreview(null); setEventMovePreview(null)
    const w = wrapRef.current
    if (w) clearLanding(w)
  }, [phone])
  const [bandTop, setBandTop] = useState<number | null>(null)

  // FIGURE SELECT (owner, 6 Sep 26): a run of people down one figure column,
  // for the docked balance bar (BalanceBar). Bound on `.mx-outer` — the one
  // ancestor of the real column, the band's copy and the drawer — so a drag
  // works on whichever copy of a box the finger is on. Live state through a
  // ref, like the day grid's; the committed selection is React state so the
  // highlight survives the re-render Save causes. The bind sits here rather
  // than beside the day grid's because it needs `mxOuterRef` in scope; the
  // effect runs after mount either way.
  const [figSel, setFigSel] = useState<FigureSelection | null>(null)
  const figSelCtxRef = useRef<FigureSelectCtx | null>(null)
  useEffect(() => {
    const o = mxOuterRef.current
    if (!o) return
    return wireFigureSelect(o, {
      order: () => figSelCtxRef.current?.order() ?? [],
      selectable: id => figSelCtxRef.current?.selectable(id) ?? false,
      enabled: () => figSelCtxRef.current?.enabled() ?? false,
      onArm: () => {},
      onSelect: s => figSelCtxRef.current?.onSelect(s),
    })
  }, [])
  // A drawer toggle drops the selection too, and it needs its OWN effect: the
  // clear above must keep its own dependency list, or opening the figures
  // would also throw away a day-grid selection that has nothing to do with it.
  //   `role` is in here for the same reason (review, 6 Sep 26): the balance bar
  // is mounted only for an admin, so a "view as member" flip mid-selection took
  // the bar off the screen and left the run lit with nothing to act on it —
  // a highlight the reader could not clear or use.
  //   The VISIBLE FIGURES are in here too (review, 6 Sep 26). `toggleFigure`
  // bumps none of the others, so hiding the very figure a run was selected on
  // left the selection alive and unreachable — nothing on screen, and showing
  // the figure again brought the run back lit, as if it had been waiting. It is
  // the identity of the shown list, not its length: swapping one figure for
  // another is the same change to a live run.
  const figIds = figures.map(f => f.id).join('|')
  useEffect(() => { setFigSel(null) }, [openSig, period.id, histEpoch, figuresOpen, role, figIds])

  // A press outside the bar and the boxes drops the selection (the tracker's
  // own rule, owner 2 Sep 26 — no Deselect button); a press ON a box is the
  // next drag or a tap for the breakdown, and is left alone. Escape clears it
  // too, unless a sheet is up — the sheet's own Escape goes first.
  useEffect(() => {
    if (!figSel) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null
      if (t?.closest('[data-testid="balance-bar"]') || t?.closest('td.figbox[data-fig][data-person]')) return
      // The bar's own date calendar (the OIL credit's date — the app's date box since step two of the one date
      // calendar, D901) floats on the page, outside the bar: a press in it is the bar's (the walk, 15 Oct 26)
      if (t?.closest('.dcal-layer')) return
      // A sheet is up: it owns this press, exactly as Escape below yields to it
      // (review, 6 Sep 26 — the two disagreed, so a tap on a sheet's scrim
      // dropped a run that the same sheet's Escape would have left alone).
      if (document.querySelector('.bidsheet')) return
      setFigSel(null)
    }
    const onKey = (e: KeyboardEvent) => {
      // ...and its Escape is the calendar's, which closes first (ui/DateBox.tsx), the bar only on a second press
      if (e.key !== 'Escape' || document.querySelector('.bidsheet') || document.querySelector('.dcal-layer:not(.dcal-patch)')) return
      e.stopPropagation()
      setFigSel(null)
    }
    document.addEventListener('pointerdown', onDown, true)
    window.addEventListener('keydown', onKey, true)
    return () => { document.removeEventListener('pointerdown', onDown, true); window.removeEventListener('keydown', onKey, true) }
  }, [figSel])

  /* WHAT COUNTS AS THE GRID WHILE A MOVE IS ON (D262): the card — its counts, month buttons, header, the days and the
     figures drawer — plus the parts of it drawn fixed on top of the page (the floating date header, the desktop's
     scrollbar at the foot of the screen). The mouse's edge scroll runs only over it; a click on an empty spot of the
     page AROUND it ends the move. The days' left edge is the drag-select's own (past the frozen columns / drawer). */
  const cardRef = useRef<HTMLDivElement>(null)
  const inGrid = (t: Element): boolean =>
    !!cardRef.current?.contains(t) || !!t.closest('[data-testid="sticky-head"], [data-testid="hscroll"]')
  const moveLeftEdge = (): number => {
    const w = wrapRef.current
    return selCtxRef.current?.leftEdge?.() ?? (w ? w.getBoundingClientRect().left : -Infinity)
  }
  /* …and LEAVING THE LEAVE WAR ENDS IT (D262 — Fable's S9): the page is kept alive off screen, and a move left on
     carried its ghost onto the next page and kept its listeners on every click there. Leaving is the plainest
     "somewhere outside the grid". */
  useEffect(() => subLwScreen(() => {
    if (isLwOnScreen()) return
    setMoveSel(null); setMovePreview(null); setMoveErr('')
    setEventMoveSel(null); setEventMovePreview(null); setEventMoveErr('')
  }), [])

  // MOVE MODE (owner, 27 Aug 26). The picked block is dropped onto a new day.
  // `movers` are the inputs PRESENT in the selection — the empty cells the user
  // swept up are dropped, so a loose box no longer refuses as "nothing"; the
  // earliest of them (`moveAnchor`) is the block's first input, and it lands on
  // the day tapped, the rest shifting with it (gaps between inputs kept). The
  // landing is previewed live on desktop (hover) and staged before a Confirm on
  // phone (no undo). `daysBetween(moveAnchor, target)` is the shared delta.
  /* THE RECORDS, NOT THE DAYS (owner, D265 / D266, 27 Sep 26 — [LW-MOVE-STANDARD]): `movers` are the RECORDS the move
     carries — every record on the picked days this role may move (a block, the one-day sheet, a picked range), or the
     one the day's list picked by its id (`moveSel.only`). A bid beside an OIL award moves alone; the award stays, and
     `moveStays` names what stays for the banner. The count on the banner and the ghost is records ("2 entries" for a
     morning and an afternoon bid on one day). */
  const movers = useMemo<MoveRec[]>(() => (moveSel ? movableRecords(moveSel.cells, moveSel.only) : []), [moveSel, version])
  const moveStays = useMemo(() => (moveSel ? stayingIn(moveSel.cells, movers) : []), [moveSel, movers, version])
  const moveAnchor = useMemo(() => earliestDate(movers), [movers])
  /* THE LIVE RECORDS, NOT THE ONES OF THE MOMENT THE MOVE BEGAN (Astra's final read, 4; Fable's note, 27 Sep 26): the move
     machine (`wireMove`, wired once per `moveSel`) keeps its callbacks for the whole move, and they used to hold the
     records of the render that wired them — a record changed or gone under a move was still judged as it was. They
     read the records through this ref, which every render keeps current. */
  const moveLive = useRef({ movers, moveAnchor })
  moveLive.current = { movers, moveAnchor }
  const landingFor = (targetDate: string): Cell[] => {
    const { movers, moveAnchor } = moveLive.current
    if (moveAnchor === null) return []
    const seen = new Set<string>()
    const out: Cell[] = []
    for (const c of movers) {
      const cell = { personId: c.personId, date: addDays(c.date, daysBetween(moveAnchor, targetDate)) }
      const k = `${cell.personId}|${cell.date}`
      if (!seen.has(k)) { seen.add(k); out.push(cell) }
    }
    return out
  }
  /* Paint the landing ONLY when the atomic commit would accept it —
     `moveRecordsProblem` is the validation half of `moveRecords` itself, so the
     preview cannot show half a landing (the off-grid cells simply not
     painting) that the commit then wholly refuses. A refused hover/stage
     clears the paint and says why in the banner instead. */
  const previewAt = (targetDate: string): boolean => {
    const { movers, moveAnchor } = moveLive.current
    const w = wrapRef.current
    if (!w || moveAnchor === null) return false
    const delta = daysBetween(moveAnchor, targetDate)
    if (delta === 0) { setMoveErr(''); paintLanding(w, landingFor(targetDate)); return true }
    const problem = moveRecordsProblem(movers, delta)
    if (problem) { clearLanding(w); setMoveErr(moveReason(problem)); return false }
    setMoveErr('')
    paintLanding(w, landingFor(targetDate))
    return true
  }
  /* A DAY IT IS ALREADY ON (D262 — Fable's S6): the move machine's delta 0 read "Nothing to move." as if the chip had
     gone, and a phone staged a Confirm that then failed. It says where it is, and the move stays on. */
  const onItsOwnDay = (targetDate: string): boolean => { const { moveAnchor } = moveLive.current; return moveAnchor !== null && daysBetween(moveAnchor, targetDate) === 0 }
  const ownDayWords = () => `${moveLive.current.movers.length === 1 ? 'It is' : 'They are'} already on that day — pick another day.`
  const commitMove = (targetDate: string) => {
    const { movers, moveAnchor } = moveLive.current
    const w = wrapRef.current
    if (moveAnchor === null) { setMoveSel(null); setMovePreview(null); return }
    if (onItsOwnDay(targetDate)) { if (w) clearLanding(w); setMovePreview(null); setMoveErr(ownDayWords()); return }
    const before = flaggedRef.current()                     // D1274: the rows as they stood, for the bubble
    const r = moveRecords(movers, daysBetween(moveAnchor, targetDate))
    if (w) clearLanding(w)
    if (r === 'moved') { moveBeforeRef.current = before; setMoveSel(null); setMovePreview(null); setMoveErr('') }
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
        if (phoneRef.current && onItsOwnDay(date)) { clearLanding(w); setMovePreview(null); setMoveErr(ownDayWords()); return }
        if (phoneRef.current) setMovePreview(previewAt(date) ? date : null)
        else commitMove(date)
      },
      onCancel: () => { clearLanding(w); setMoveSel(null); setMovePreview(null); setMoveErr('') },
      onOff: () => { clearLanding(w); setMoveErr('') },
      leftEdge: moveLeftEdge,
      isGrid: inGrid,
    })
    return () => { clearLanding(w); cleanup() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveSel])
  /* WHAT WAS PICKED UP IS GONE (Astra's final read, 4): a record changed or removed under a move (a sync pass — Undo, a
     stage or war change and leaving the tab already end the move) left the banner reading "0 entries" and a tap ending
     the move with no word. It says so; the next tap (or Cancel) ends the move, landing nothing. */
  useEffect(() => {
    if (!moveSel || movers.length > 0) return
    const w = wrapRef.current
    if (w) clearLanding(w)
    setMovePreview(null)
    setMoveErr('That record changed or is no longer there — nothing to move.')
  }, [moveSel, movers.length])

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
      onPick: date => { if (phoneRef.current) setEventMovePreview(previewEventAt(date) ? date : null); else commitEventMove(date) },
      onCancel: () => { clearLanding(w); setEventMoveSel(null); setEventMovePreview(null); setEventMoveErr('') },
      onOff: () => { clearLanding(w); setEventMoveErr('') },
      leftEdge: moveLeftEdge,
      isGrid: inGrid,
    })
    return () => { clearLanding(w); cleanup() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventMoveSel])

  const months = monthsIn(period.start, period.end)

  // The month the grid should OPEN on — the start of this war's bidding window
  // (owner, 7 Sep 26). The column window below is built AROUND it, not around
  // January, so the months the reader is about to see are the ones drawn first
  // (the preload), and — on the desktop, where the fill then rebuilds the whole
  // year outward from here — the landing does not drift back to January as the
  // left months fill in (which it did when the window reset to month 0 and the
  // jump raced the fill). `LeaveWarPage`/`selectWar` do the actual scroll via
  // `focusDate`; this only decides which columns exist when they land.
  const defaultMonth = (() => {
    const k = focusDateOf(period, memberToday()).slice(0, 7)
    const i = months.findIndex(m => m.first.slice(0, 7) === k)
    return i < 0 ? 0 : i
  })()

  // ---- THE COLUMN WINDOW (Phase 2 of the speed work, 3 Sep 26) -------------
  // Which months are DRAWN. Arithmetic and the why in colwindow.ts; here is the
  // measuring and the scrolling. `null` = the whole war: a short war, or no
  // layout at all — jsdom reports every rect 0×0, so the lazy initialiser sees
  // no width and the unit suites keep seeing the full year exactly as before;
  // the browser gate is what proves the window. Everything that reads "the
  // columns" below reads `drawnDays` / `drawnDates` / `drawnMonths`; the full
  // `dates` stays for what is about the WAR, not the screen — the manning
  // verdicts, the lock set, the sheets' date spans, the "365 days" caption.
  const hasLayout = () => typeof document !== 'undefined' && document.documentElement.getBoundingClientRect().width > 0
  const [colWinRaw, setColWin] = useState<ColWin | null>(() => (hasLayout() ? windowAround(months.length, defaultMonth) : null))
  // The stored window is only ever read CLAMPED to the current war's months:
  // a war switch renders once with the old window against the new months
  // before the reset effect below lands, and a one-month war under a stale
  // {0,3} must draw whole, not index past its months (a real crash found by
  // the "creates a leave war" browser test — the grid vanished behind an
  // error, and the picker with it).
  const colWin = colWinRaw && months.length >= WINDOW_FROM_MONTHS ? clampWin(colWinRaw, months.length) : null
  const colWinRef = useRef(colWin)
  colWinRef.current = colWin
  // THE PLACEHOLDERS (owner, 5 Sep 26 — "do the placeholders + moving", picked
  // off a mockup of four scrolling styles). One empty cell before the first
  // drawn day and one after the last, in EVERY row, standing in for the undrawn
  // months at their widths — so the scroller spans the whole year from the
  // first paint, a flick never runs into a drawn edge, and months are drawn IN
  // PLACE while the scroll is still moving (the fill engine below). Which sides
  // exist is render knowledge (the window's edges); how WIDE they are is
  // written imperatively as two CSS variables (`applyPlaceholders`), because
  // those widths come from measurement and change as months draw, and a state
  // write would re-render the ~25k-node grid for a number two cells read.
  // Every row carries the same cells (header included) — the 20 Aug 26
  // column-virtualisation that misaligned on iOS gave SOME rows colSpan spacers
  // over the header's still-full columns, and WebKit reconciles rows of
  // differing cell counts differently from Blink; here no row differs.
  const padL = !!colWin && colWin.lo > 0
  const padR = !!colWin && colWin.hi < months.length - 1
  // The placeholder widths are written STRAIGHT ONTO THE CELLS as inline
  // styles, not as a CSS variable on an ancestor (traced 6 Sep 26): a custom
  // property changing on `.mx-outer` — any property, even an unused one —
  // makes Chrome re-style every element under it, ~7,000 on the full year,
  // ~0.4–0.8s on the slow laptop, and it was written on EVERY month draw. An
  // inline width on the ~130 placeholder cells costs ~5ms and re-styles nothing
  // else. Cells mount and unmount with the rows (row window, folds, the mirror
  // header), so each registers itself through these stable ref hooks, takes the
  // current width the moment it mounts, and `applyPlaceholders` rewrites the
  // registered set when a width changes.
  const phWRef = useRef<{ l: string; r: string }>({ l: '0px', r: '0px' })
  const phCellsRef = useRef<{ l: Set<HTMLElement>; r: Set<HTMLElement> }>({ l: new Set(), r: new Set() })
  const phHook = (side: 'l' | 'r'): RefCallback<HTMLTableCellElement> => el => {
    if (!el) return
    const set = phCellsRef.current[side]
    set.add(el)
    setPhWidth(el, phWRef.current[side])
    return () => { set.delete(el) }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const phL = useCallback(phHook('l'), [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const phR = useCallback(phHook('r'), [])
  // Each month's MEASURED width (layout px, zoom divided out) once it has been
  // drawn, by war+zoom: a pruned month's placeholder is then exactly as wide as
  // the month, so re-drawing it moves nothing — provided the grid's rows are
  // still the ones it was measured with, which is what `gen` records (see
  // `widthGen` below). A month never drawn falls back to an estimate (the
  // average day width × its days) — see colwindow.ts for why that estimate is
  // never swapped for the real month LEFT of the view while the scroll is moving
  // — unless the error can go to the left placeholder (`padErrRef` below).
  const monthPxRef = useRef<{ key: string; px: (number | null)[]; gen: (object | null)[] }>({ key: '', px: [], gen: [] })
  // WHAT THE LEFT PLACEHOLDER IS SHORT OF, OR OVER, ITS ESTIMATE (his video, 23 Oct 26 — a fling from December back to
  // January left the months striped until rest). A month drawn LEFT mid-fling over an estimated width lands at its real
  // width; the difference would push every column to its right — the ones on screen — so the same commit takes it off
  // the left placeholder instead (layout px, added up: a month drawn wider takes more off). The placeholder stands for
  // months nobody can see, so nothing visible moves. Squared when the war's first month is drawn (the placeholder is
  // gone then) and on a new war or zoom (every width is re-read). `absorbRef` is the drawn month the step is measured
  // against: its left edge before the step, in the scroller's content px.
  const padErrRef = useRef(0)
  const absorbRef = useRef<{ month: number; left: number } | null>(null)
  // Is the Leave War tab on screen right now? A ref, not React state, so the
  // fill loop below can read it every idle beat without a re-render, and
  // flipping it (state/screen.ts) never repaints the ~25k-node grid. Seeded from
  // the live signal so a first mount that is ALREADY the current page (a direct
  // visit) starts on-screen, and a hidden pre-warm mount starts off-screen.
  const onScreenRef = useRef(isLwOnScreen())
  // The first month the viewport currently overlaps (absolute index, drawn or
  // placeholder), tracked on every scroll event (`measureStrip`) — so when the
  // tab is left we can shrink the drawn window to a few months AROUND where the
  // reader was, not blindly.
  const viewMonthRef = useRef(0)
  // The visible months (absolute indices) for the phone's rolling target — the
  // window the prefetch keeps a runway ahead of, updated on every scroll event.
  const liveVisRef = useRef<{ lo: number; hi: number }>({ lo: 0, hi: 1 })
  // Restart the background fill loop after it has parked (the tab was shown, or a
  // scroll moved the phone's rolling target). Set by the fill effect each render.
  const kickFillRef = useRef<() => void>(() => {})
  const monthIndexOf = (date: string): number => {
    const k = date.slice(0, 7)
    const i = months.findIndex(m => m.first.slice(0, 7) === k)
    return i < 0 ? 0 : i
  }
  const drawnMonths = colWin ? months.slice(colWin.lo, colWin.hi + 1) : months
  const drawnDays = useMemo(() => {
    if (!colWin) return period.days
    const from = months[colWin.lo]!.first.slice(0, 7), to = months[colWin.hi]!.first.slice(0, 7)
    return period.days.filter(d => { const k = d.date.slice(0, 7); return k >= from && k <= to })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colWin?.lo, colWin?.hi, period])   // the period, not every store change ([LW-MONTH-MEMO-UNPINNED])
  const drawnDates = useMemo(() => drawnDays.map(d => d.date), [drawnDays])
  // The drawn days SLICED BY MONTH, each slice keeping its identity for as long
  // as the war's days do (the cache lives with `version`, like drawnDays):
  // PersonMonth is memoised on the slice, so a window step re-renders only the
  // month it adds and every other month's cells bail out at the memo.
  const monthDaysCache = useMemo(() => new Map<string, DayInfo[]>(), [period])   // lives with the war's days ([LW-MONTH-MEMO-UNPINNED])
  const drawnMonthDays = useMemo(() => {
    const keys: string[] = []
    for (const d of drawnDays) { const k = d.date.slice(0, 7); if (keys[keys.length - 1] !== k) keys.push(k) }
    return keys.map(k => {
      let s = monthDaysCache.get(k)
      if (!s) { s = period.days.filter(d => d.date.slice(0, 7) === k); monthDaysCache.set(k, s) }
      return s
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawnDays, monthDaysCache])
  // The day-column slots a full-width row spans: the drawn days plus the
  // placeholder cell on each side that exists.
  const dayCols = drawnDates.length + (padL ? 1 : 0) + (padR ? 1 : 0)
  // The LIVE columns for anything that runs off a timer or a listener — the
  // scroll-rest measure, the pre-grow, a resize. Those closures are minted
  // by an earlier render, and the window can change between the event and
  // the callback (the 250 ms pre-grow fires right after the first open; a
  // store change can land mid-scroll): measured against the closure's own,
  // by-then-stale column list, a month that IS drawn reads as absent and
  // the measure silently no-ops. Closed as a hazard while chasing a gate
  // failure that turned out to be the test's own year-wide assumption; kept
  // because the hazard is real. Every measure reads this ref, never its
  // closure.
  const liveRef = useRef({ drawnMonths, drawnDates, people, rowSpans })
  liveRef.current = { drawnMonths, drawnDates, people, rowSpans }
  const coarsePointer = () => typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
  // The war's month structure for the placeholders' width estimate (see
  // `monthPx`): days per month. Constant for the war and needs no layout, so a
  // memo, not a measurement.
  const yearMonths = useMemo(() => {
    const monthDays = months.map(() => 0)
    const idxOf = new Map(months.map((m, i) => [m.first.slice(0, 7), i]))
    for (const d of period.days) { const i = idxOf.get(d.date.slice(0, 7)); if (i != null) monthDays[i]++ }
    return { monthDays }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period.id])
  // A month-strip jump to an undrawn month: draw around it first, scroll once
  // those columns exist (the anchor layout effect below finishes it).
  const pendingJumpRef = useRef<string | null>(null)
  // A window change that moved columns LEFT of the viewport: the anchor
  // correction must run even on a coarse pointer (the fling is already dead —
  // the window only grows left there once the scroll sits at its bound).
  const colShiftRef = useRef(false)
  // A different war is a different set of months: start its window over.
  const warRef = useRef(period.id)
  useEffect(() => {
    if (warRef.current === period.id) return
    warRef.current = period.id
    const next = hasLayout() ? windowAround(months.length, defaultMonth) : null
    setColWin(prev => (prev && next && prev.lo === next.lo && prev.hi === next.hi ? prev : next))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period.id])

  // The month BRACKET above the dates (owner, 18 Aug 26 — "draw a line at the
  // top of the dates that bracket the month u are looking at"): one spanning
  // cell per month, derived from the loaded days so a partial first or last
  // month brackets exactly the days it actually has on screen.
  const brackets = (() => {
    const out: { key: string; label: string; count: number }[] = []
    for (const d of drawnDates) {
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
  // ---- header-cell lookups (3 Sep 26) -------------------------------------
  // Every geometry read below wants "the header cell for date X". Searching
  // for it from the grid WRAPPER walked all ~25,000 nodes per lookup, and the
  // mount sequence (strip geometry, the row window, the bid box, the anchor)
  // does thirty-odd of them — measured as the single largest frame of a 10s
  // first open at 4x. The header is its own tbody of ~370 cells, so the same
  // selector scoped there is a hundredth of the walk. Same nodes, same answer.
  const headRef = useRef<HTMLTableSectionElement>(null)
  const headCell = (date: string | undefined): HTMLElement | null =>
    date === undefined ? null : headRef.current?.querySelector<HTMLElement>(`[data-testid="head-${date}"]`) ?? null

  // Where the visible day strip BEGINS: the width of everything painted OVER
  // the day columns and frozen there. Normally the callsign + counter pair —
  // but while the FIGURES drawer is open (6 Sep 26) the frozen part is the
  // callsign column plus the DRAWER, which stands over the days from that
  // column's right edge out. Taken from the drawer's own box rather than by
  // adding eight column widths: one rect read either way, and the box is what
  // the reader actually sees.
  //
  // Every caller depends on this being honest — a month jump lands its month
  // just past this edge (`jumpTo`), the anchor correction holds the first
  // column past it across a redraw, and the month-strip readout credits the
  // month the reader is over rather than one hidden underneath. Left at the
  // closed pair, a jump put 1 September NINE columns under the drawer:
  // scrolled-to and invisible at the same time, the exact fault the jump's own
  // e2e was written to stop (measured 6 Sep 26; pinned by "a month jump lands
  // the month clear of the drawer, not under it").
  const frozenWidth = (wrap: HTMLElement): number => {
    const who = wrap.querySelector<HTMLElement>('.who')?.getBoundingClientRect().width ?? 0
    const drawer = figuresOpen ? (drawerRef.current?.getBoundingClientRect().width ?? 0) : 0
    if (drawer) return who + drawer
    return who + (wrap.querySelector<HTMLElement>('.bal')?.getBoundingClientRect().width ?? 0)
  }

  const jumpTo = (date: string) => {
    const wrap = wrapRef.current
    if (!wrap) return
    const win = colWinRef.current
    const mi = monthIndexOf(date)
    // Tell the fill engine where the view is ABOUT to be, before the scroll
    // event does: its first beat after the window change can land before that
    // event, and reading the stale pre-jump view it would see a window "nowhere
    // near the view" and replace it — undoing the jump. The scroll event then
    // confirms the same months.
    liveVisRef.current = { lo: mi, hi: mi }
    viewMonthRef.current = mi
    if (win && (mi < win.lo || mi > win.hi)) {
      // Not drawn yet. Draw a window around it; the anchor layout effect
      // scrolls to the cell in the same commit those columns appear.
      pendingJumpRef.current = date
      anchorRef.current = null
      setColWin(windowAround(months.length, mi))
      return
    }
    const cell = headCell(date)
    if (!cell) return
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
  /* THE MONTHS ACTUALLY ON SCREEN, always (the absence-record re-test, W5-F2, 26 Sep 26 — the re-walk found its real
     trigger). The state above is only written when the ROW SET changes, so SEP → JUL — the same people — left it at
     September; a man then posted out from a July date was asked "is he here in September?" and his July row, with
     everything on it, vanished until another month was pressed. The row filter reads THIS note, written at every
     measure without a repaint; the state stays the repaint trigger, so the scroll gate's saving is kept. */
  const visWinRef = useRef('')
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

  // The grid ZOOM (owner, 18 Aug 26 — "a zoom function for mobile leave
  // war"). `zoom` (not transform) so layout, scroll width and the sticky offsets
  // all scale together. View state, kept while the app is open, like the counter
  // choice. A PHONE OPENS ONE STEP OUT (owner, 6 Sep 26 — "can this be the default
  // zoom? Like zoom 1 click out"): 0.8 there, 1 on a desktop (D159), read once at
  // mount from the same 700px query the phone flag uses (no layout yet, so
  // this is the only place the initial value can come from; jsdom has no
  // matchMedia and stays at 1).
  //   PINCHED, NOT STEPPED (owner D1282–D1285, 23 Oct 26 — `[LW-PHONE-PINCH-ZOOM]`): the − / + went once the pinch
  // could carry the frozen date row with the grid (D1276). Two fingers anywhere on the Leave War zoom the grid — never
  // the page, whose zoom is what threw the frozen row off its columns in his recording — and Ctrl+scroll over the grid
  // does on a desktop (D1228); in to 1.4, out until a month fits a phone held upright (lwzoom.ts). The wiring is the
  // effect below `zoomStyle`.
  const [zoom, setZoom] = useState(() =>
    typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 700px)').matches ? 0.8 : 1)
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom
  // When a pinch last laid its zoom out: the scroll it writes straight after (the day under the fingers brought back
  // under them) is a JUMP, not a fling — see onWrapScroll and the pinch's wiring below.
  const pinchAtRef = useRef(0)
  // The grid tables' zoom, plus `--lwz` (6 Sep 26) so a control that must keep
  // a REAL tap size at any zoom can divide it back out (the counter picker's
  // `min-height: calc(40px / var(--lwz))`, matrix.css): a phone opens at 0.8
  // and the picker fell to 32px tall, under the 36px floor the owner's own
  // complaint set. On the TABLE, not an ancestor, and it changes only when the
  // zoom steps — a restyle the zoom itself already costs, never per frame.
  const zoomStyle = zoom !== 1 ? ({ zoom, '--lwz': zoom } as import('react').CSSProperties) : undefined

  /* PINCH TO ZOOM THE GRID (owner D1282, D1283, D1284, 23 Oct 26 — `[LW-PHONE-PINCH-ZOOM]`), the app's one pinch body
     (ui/pinchzoom.ts — the Scheduler Board's and Quals' too). While the fingers move the grid is stretched as a picture,
     nothing laid out again; at the lift the zoom is written once, through the same `zoom` the old − / + set — the path
     his iPhone showed keeps the frozen date row the grid's size and over its columns (his check, 23 Oct 26) — and the
     scrollers are moved so the day under his fingers stays under them.
       · WHERE IT STARTS: anywhere on the screen while the Leave War is in front (D1282 — the bars above the grid
         included), so the browser's own page zoom never runs here; the stylesheet holds it off on the page too
         (matrix.css `#page-leavewar`). Over a full-page window (the OIL tab, the "Open for bidding" page) the grid
         behind is not zoomed — the OIL tab has its own pinch (OilTracker.tsx) — but the page is still kept from zooming.
       · WHAT STRETCHES WITH IT while the fingers move: the frozen date row (its contents, from its own top, as Quals'
         pinned row), the phone's frozen names copy, the open-dates outline and the figures drawer (about the fingers,
         as one picture); the month buttons are held at their size (D1282 — they cancel the grid's zoom at rest too).
       · THE FROZEN ROW'S BROWSER FOLLOW is paused while the fingers move: the stretch widens the grid's scroll range
         while its scroll stands still, which would slide the row's timeline-driven follow off its columns (Quals' lesson).
       · WHAT IT CANCELS: a row held in Rearrange is let go (it moves nothing); a day held to select is let go by the
         selection itself the moment a second finger lands (select.ts — fix A7a), so a pinch never selects or opens a day.
     Ctrl+scroll over the grid zooms it the same way on a desktop, a trackpad's pinch included (D1228). */
  useEffect(() => {
    const outer = mxOuterRef.current
    if (!outer) return
    const fullPage = () => !!document.querySelector('.bidsheet.full, .bidsheet.fullpage')
    const anim = () => outer.querySelector<HTMLElement>('.mxfixed-anim')
    return wirePinch({
      surface: document.documentElement,
      wheel: outer,
      target: () => wrapRef.current?.querySelector<HTMLElement>(':scope > table.mx') ?? null,
      get: () => zoomRef.current,
      /* never above the zoom it starts at, so a pinch out never zooms in (a phone turned with the grid at its floor) */
      min: () => Math.min(zoomRef.current, lwMonthFitZoom(headRef.current, wrapRef.current, zoomRef.current)),
      max: LW_ZOOM_MAX,
      apply: z => {
        const v = roundZoom(z); zoomRef.current = v
        pinchAtRef.current = jumpAtRef.current = Date.now()   // the lift's scroll is a jump (onWrapScroll)
        flushSync(() => setZoom(v))
      },
      canStart: () => isLwOnScreen() && outer.isConnected && !fullPage(),
      blockTwo: () => isLwOnScreen(),
      /* the frozen row's box lets its stretched contents grow DOWN while the fingers move (matrix.css .lw-pinching):
         clipped at its old height, a pinch in cut the date numbers in half until the lift (the walk's picture) */
      onStart: () => {
        dragCleanup.current?.()
        /* the small pop-ups placed on the screen over a cell close, as a press outside them would (the fresh code read,
           F4 — a desktop's Ctrl+scroll presses nothing): the event peek, a chip's quals, and the Required / Available
           rows' boxes (FlyRows, FlyEdit — they hear `lw-zoomstart`) */
        setQualPop(null); setEvPeek(null)
        window.dispatchEvent(new Event('lw-zoomstart'))
        const a = anim(); if (a) a.style.animationPlayState = 'paused'
        outer.querySelector('.mxfixed')?.classList.add('lw-pinching')
        outer.classList.add('lw-pinching')
      },
      onEnd: () => {
        const a = anim(); if (a) a.style.animationPlayState = ''
        outer.querySelector('.mxfixed')?.classList.remove('lw-pinching')
        outer.classList.remove('lw-pinching')
      },
      /* WHILE THE FINGERS ARE DOWN THE PINNED PARTS STAY PINNED (owner D1287, 23 Oct 26 — his iPhone pictures mid-pinch:
         the names column and the corner had stood in from the grid's left edge with days on their left, the date row had
         grown up over the month buttons, and the month buttons' own cell — the names' width — had stood boxed behind
         JAN–MAR while the rest of its row moved away). Only the days stretch about the fingers:
         · the date row's cells follow the rows down the screen but never rise over the month buttons; the corner stays at
           the left edge with them; every other pinned name, counter and group heading keeps its place across (`pin`);
         · the phone's frozen names copy and the figures drawer stretch with the rows but from the grid's left edge, and
           are never drawn above the date row's foot (`alsoY`, `floor`); the frozen date row's copy of the corner grows
           from its own corner (`alsoTL`); the frozen date row's days and the open-dates outline stretch sideways about the
           fingers from their own top (`also`), as the date row does;
         · the month buttons keep their size and place (`keep`), and while the fingers are down their row is one band
           (matrix.css `.mx-outer.lw-pinching`), drawn over the date row, which is drawn over the rows. */
      pin: () => {
        const table = wrapRef.current?.querySelector<HTMLElement>(':scope > table.mx')
        if (!table) return []
        const out: { el: HTMLElement; x: boolean; y: boolean | 'up' }[] = []
        /* the date row scrolls with the page at rest, so it follows the rows down — never up over the month buttons */
        for (const th of table.querySelectorAll<HTMLElement>(':scope > tbody.mxhead th')) {
          out.push({ el: th, x: th.classList.contains('who') || th.classList.contains('bal'), y: 'up' })
        }
        /* every pinned one, not only those in sight: a pinch out draws in rows that were off the screen as it began */
        const rows = ':scope > tbody:not(.mxhead):not(.mstripe) > tr'
        for (const el of table.querySelectorAll<HTMLElement>(`${rows} > .who, ${rows} > .bal, ${rows} > td.grphd, ${rows} > td.catsub-in`)) {
          if (getComputedStyle(el).position !== 'sticky') continue   // the phone's roster: its frozen copy is the band
          out.push({ el, x: true, y: false })
        }
        return out
      },
      /* the pinned block's corner: the grid's left edge, and the date row's top */
      pinAt: () => ({
        x: wrapRef.current?.getBoundingClientRect().left ?? 0,
        y: wrapRef.current?.querySelector<HTMLElement>(':scope > table.mx > tbody.mxhead')?.getBoundingClientRect().top ?? 0,
      }),
      /* the frozen date row's days: where the row follows the grid by the browser (`lw-sda`) its days stretch inside the
         row's box, which keeps both edges of the screen; elsewhere the row's box stretches, as before */
      also: () => (outer.classList.contains('lw-sda') ? [] : [...outer.querySelectorAll<HTMLElement>(':scope > .mxfixed > .mxfixed-scroll')]),
      /* the open-dates outline runs from the date row's top: it goes where the date row goes (the fix read, finding 1) */
      alsoTop: () => [...(wrapRef.current?.querySelectorAll<HTMLElement>(':scope > .lw-bidbox') ?? [])],
      /* part-way down the page the page itself scrolls with the pinch, so no band opens above the date row (D1288) */
      scrollPage: true,
      alsoIn: () => (outer.classList.contains('lw-sda') ? [anim()] : []),
      alsoTL: () => [...outer.querySelectorAll<HTMLElement>(':scope > .mxfixed > .mxfixed-frozen')],
      alsoY: () => [bandRef.current, drawerRef.current],
      floor: () => wrapRef.current?.querySelector<HTMLElement>(':scope > table.mx > tbody.mxhead')?.getBoundingClientRect().bottom ?? -Infinity,
      keep: () => [mstickRef.current],
      edges: true,
      /* THE SPOT UNDER THE FINGERS IS A DAY AND A ROW (the walk, 23 Oct 26): across, the date column whose heading
         spans the fingers; down, the grid row that does. The element under the fingers would not do — a group's
         heading and the names are pinned to the left, so they never say where the year went, and on a phone the
         fingers often rest on the frozen names' copy, which is not the grid at all. */
      anchor: (x, y) => {
        const table = wrapRef.current?.querySelector<HTMLTableElement>(':scope > table.mx')
        if (!table) return null
        let ax: Element | null = null, ay: Element | null = null
        for (const c of headRef.current?.querySelectorAll<HTMLElement>('[data-testid^="head-"]') ?? []) {
          const q = c.getBoundingClientRect()
          if (x >= q.left && x < q.right) { ax = c; break }
        }
        for (const tr of table.rows) {
          const q = tr.getBoundingClientRect()
          if (y >= q.top && y < q.bottom) { ay = tr; break }
        }
        return { x: ax, y: ay }
      },
    })
  }, [])

  // The manning counts block (CREW SETS … SXO) collapses on a tap, for EITHER
  // role (owner, 19 Aug 26 — "allow both admin and norm user to hide it when
  // viewing, click to open or close"). A view preference, session-only like the
  // zoom above; forced open while an admin is Rearranging so the row reorder /
  // hide controls stay reachable.
  /* THE MANNING ROWS' FOLD (D1258, widening D1227): on a PHONE they open folded for everyone, admins too, and his choice is
     remembered — per person, on this device (a view convenience, never a record: `lw:manning:<viewer>` in the browser's
     own storage, read and written inside a try, the grid drawing as ruled without it); on a DESKTOP they open as today. A
     bid that turns a row amber or red still opens them (D1227's bubble). */
  const phoneNow = usePhone()
  /* read where it is used — the first draw can come before the person signed in is known, and a key with no person in it
     would be one memory for everyone on the device (the scenario designer's find, 23 Oct 26; D1258 "per person") */
  const manningKey = () => { const v = getState().viewer; return v ? `lw:manning:${v}` : null }
  const [countsOpen, setCountsOpen] = useState(() => {
    if (!phoneNow) return true
    try { const k = manningKey(); return !!k && localStorage.getItem(k) === 'open' } catch { return false }
  })
  /* D1227's BUBBLE (22 Oct 26 — "Only when the input reduces the counter to hit amber or red. The manning bar will appear
     and a bubble will notify the user that this input cause what"; on any phone since D1258). When a bid placed through a
     bid window turns a Manning row amber or red on a day where it was not, the Manning rows open by themselves and a short
     bubble under the Manning button names each row and how far it went; it is gone at his next tap. Read as the
     difference between the grid's verdicts when the window opened and when it closed — the window that placed the bid
     is the gesture, so a change made elsewhere (another device, a setting) never raises it. */
  const sheetUp = !!open || !!sel
  const beforeRef = useRef<BubbleFlags | null>(null)
  /* `foot`: the Manning button was out of view when it was raised, so the words sit at the foot of the screen (D1277) */
  /* `lv`: the worst level it names — the bubble wears that colour (his D1344: "the box is in amber can u make it red") */
  const [bubble, setBubble] = useState<{ text: string; foot: boolean; lv: 'amber' | 'red' } | null>(null)
  const flaggedNow = (): BubbleFlags => {
    /* each row-day at its level — 1 amber, 2 red — so a row that got BETTER (red to amber after a Refuse or a Delete) is
       never reported as turned amber (the scenario designer's find, 23 Oct 26); and its figure, so a row already amber or
       red that a bid takes lower is reported too (D1345) */
    const m = new Map<string, { label: string; lv: number; have?: number }>()
    for (const d of Object.keys(verdicts)) for (const r of verdicts[d]!.results) if (r.verdict !== 'ok') m.set(`${r.ruleId}|${d}`, { label: r.label, lv: r.verdict === 'red' ? 2 : 1, have: r.have })
    /* …and the two Available rows at their amber or red points (D1190, D1202 — the same verdict their cells wear,
       `sync.ts availVerdictAt`), over the days drawn: a bid is placed on a day in view */
    const names = availRowNames()
    /* the plan's answers read a MONTH at a time (`flyMonth`, as the red count does) — not one resolver call per drawn
       date and seat, ~730 on a desktop with the year drawn, on every opening and closing of a bid window (the M2 code
       read's F5) */
    const months = new Map<string, Record<string, DayAnswer>>()
    const answer = (iso: string): DayAnswer | undefined => {
      const k = iso.slice(0, 7)
      let mo = months.get(k)
      if (!mo) { mo = flyMonth(+k.slice(0, 4), +k.slice(5, 7)); months.set(k, mo) }
      return mo[iso]
    }
    for (const d of drawnDates) {
      const a = answer(d)
      let f: ReturnType<typeof dayFacts> | null = null
      for (const seat of ['p', 'w'] as const) {
        const v = availVerdictAt(d, seat, a)
        if (!v) continue
        f ??= dayFacts(d)
        /* a figure the day does not have (null) is left out — that row-day is then compared by its level alone */
        const have = seat === 'p' ? f.availP : f.availW
        m.set(`avail${seat}|${d}`, { label: names[seat], lv: v === 'red' ? 2 : 1, ...(typeof have === 'number' ? { have } : {}) })
      }
    }
    return { m, drawn: new Set(drawnDates), seq: actCount() }
  }
  /* the latest render's reading, for the move machine — wired once per move, its callbacks would otherwise read the
     verdicts of the render that wired them */
  const flaggedRef = useRef(flaggedNow)
  flaggedRef.current = flaggedNow
  /* compare a "before" with the grid as it is now; only a WORSENING raises the bubble (a row to amber or red, or amber
     to red, on a day — or, D1345, a row already amber or red taken lower) — one rule for a bid placed, a filing and a
     bid moved */
  const raiseIfWorse = (before: BubbleFlags) => {
    /* nothing placed since the "before" — a window opened and closed, a counter changed behind it — raises nothing: the
       bubble speaks for a bid, a filing or a move made here (D1227's "the window that placed the bid is the gesture") */
    if (before.seq !== undefined && actCount() <= before.seq) return
    const worst = worsenedRows(before, flaggedNow())
    if (!worst.size) return
    setCountsOpen(true)
    const lv = [...worst.values()].some(w => w.lv === 'red') ? 'red' : 'amber'
    setBubble({ text: bubbleWords(worst, filedSince(before.seq ?? 0)), foot: !manningInView(), lv })
  }
  /* IS THE MANNING BUTTON IN VIEW? (D1277 — "how does the notification look on a phone if the counters are out of view and
     the user scrolls down"; his "Yes to the bid note as recommended"). Decided once, when the bubble is raised: the
     button's box against the visible screen — the keyboard counted (the visual viewport) — and not under whatever is
     drawn on top of it there (the app's top bar, which stays as the page scrolls). A screen with no layout (the unit
     tests) counts as in view, so nothing changes there. */
  /* A WINDOW DRAWN OVER THE PAGE (the night's walk, F1 — a weekend filing opens the OIL question at once): it does not take
     the Manning button out of view, and a tap inside it is not his next tap on the page — the bubble waits under the
     button for the window to close (`.airpop` the app's pop-ups, `[role="dialog"]` its windows) */
  const overPage = (el: EventTarget | Element | null): boolean =>
    el instanceof Element && !!el.closest('.airpop, [role="dialog"]') && !el.closest('.lwday, .bidsheet.nonmodal')   // the war's own windows that leave the grid working are the page (the narrow read, N2)
  const manningInView = (): boolean => {
    const btn = cardRef.current?.querySelector('[data-testid="counts-toggle"]') as HTMLElement | null
    if (!btn) return false
    const r = btn.getBoundingClientRect()
    if (!r.width && !r.height) return true
    const vv = window.visualViewport
    const top = vv ? vv.offsetTop : 0, bottom = vv ? vv.offsetTop + vv.height : window.innerHeight
    if (r.bottom <= top || r.top >= bottom) return false
    if (typeof document.elementFromPoint !== 'function') return true
    const y = Math.min(Math.max(r.top + r.height / 2, top + 1), bottom - 1)
    const hit = document.elementFromPoint(r.left + r.width / 2, y)
    return !hit || btn.contains(hit) || overPage(hit)
  }
  /* Show: up to the Manning rows (opened when the bubble was raised), the keyboard on the Manning button, the note gone */
  const showManning = () => {
    setCountsOpen(true)
    const btn = cardRef.current?.querySelector('[data-testid="counts-toggle"]') as HTMLElement | null
    if (btn) {
      const still = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      btn.scrollIntoView({ block: 'center', behavior: still ? 'auto' : 'smooth' })
      btn.focus({ preventScroll: true })
    }
    setBubble(null)
    /* a second quick press lands where the note stood — on the grid — and opened that day's window (the night's walk, F2):
       the clicks of the next moment are swallowed, the press that moved him up being the one he meant */
    unswallowRef.current?.()
    /* only a pointer's click on the grid (the second touch of F2) — a key's click (detail 0) and a click on the top bar
       or a pop-up go through (the night's code read, R6) */
    const swallow = (e: Event) => {
      if (e instanceof MouseEvent && e.detail > 0 && e.target instanceof Element && e.target.closest('.mx')) { e.stopPropagation(); e.preventDefault() }
    }
    document.addEventListener('click', swallow, true)
    const t = window.setTimeout(() => unswallowRef.current?.(), 450)
    unswallowRef.current = () => { window.clearTimeout(t); document.removeEventListener('click', swallow, true); unswallowRef.current = null }
  }
  /* the guard ends with the grid, never outliving it */
  const unswallowRef = useRef<(() => void) | null>(null)
  useEffect(() => () => unswallowRef.current?.(), [])
  useEffect(() => {
    if (sheetUp) { if (!beforeRef.current) beforeRef.current = flaggedNow(); return }
    const before = beforeRef.current
    beforeRef.current = null
    if (before) raiseIfWorse(before)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetUp])
  /* A MOVED BID RAISES IT TOO (D1274, 23 Oct 26 — "Q2 yes"): the grid's move — the window's Move or a picked block's, then
     a tap or a Confirm on a day — lands in one place (`commitMove`), which takes the "before" just ahead of the move and
     leaves it here; the render that follows the landing compares, as a closed bid window does. A move refused, or onto
     its own day, leaves nothing. */
  const moveBeforeRef = useRef<BubbleFlags | null>(null)
  useEffect(() => {
    const before = moveBeforeRef.current
    if (!before) return
    moveBeforeRef.current = null
    raiseIfWorse(before)
  })
  /* gone at his next tap, anywhere */
  useEffect(() => {
    if (!bubble) return
    /* a press on the foot note's own Show is not "a tap elsewhere" (D1277) — Show's click does its work and ends it */
    const inNote = (e: Event) => e.target instanceof Element && !!e.target.closest('[data-testid="manning-bubble-foot"]')
    const onDown = (e: Event) => { if (!inNote(e) && !overPage(e.target)) setBubble(null) }
    /* …or his next key, so a keyboard user is not left with it (walker 3, scenario 60) — but Tab (and Shift with it), the
       way to Show, and a key pressed on Show itself leave it up */
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Tab' || e.key === 'Shift' || inNote(e) || overPage(e.target)) return; setBubble(null) }
    const t = window.setTimeout(() => { document.addEventListener('pointerdown', onDown); document.addEventListener('keydown', onKey) }, 0)
    return () => { window.clearTimeout(t); document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey) }
  }, [bubble])
  /* …and a change of WIDTH across the phone line after the page opened (a desktop window narrowed under 700, a phone
     turned on its side and back — the M2 code read's F6): the fold is decided again by the same rule, folded on a phone
     unless he opened it there, open on a desktop (D1258). Not on the first draw — the state's own start decided that. */
  const seenPhone = useRef(phoneNow)
  useEffect(() => {
    if (seenPhone.current === phoneNow) return
    seenPhone.current = phoneNow
    if (!phoneNow) { setCountsOpen(true); return }
    try { const k = manningKey(); setCountsOpen(!!k && localStorage.getItem(k) === 'open') } catch { setCountsOpen(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneNow])
  const viewerNow = getState().viewer
  const seenViewer = useRef(viewerNow)
  useEffect(() => {
    if (seenViewer.current === viewerNow) return
    seenViewer.current = viewerNow
    if (!phoneNow) return
    try { const k = manningKey(); setCountsOpen(!!k && localStorage.getItem(k) === 'open') } catch { setCountsOpen(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerNow])
  const toggleManning = () => setCountsOpen(o => {
    const next = !o
    const k = manningKey()
    if (phoneNow && k) { try { localStorage.setItem(k, next ? 'open' : 'shut') } catch { /* a view convenience only */ } }
    return next
  })

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

  // WHICH ROWS A MEASURED MONTH WIDTH IS TRUE FOR ([LW-MONTHJUMP-PHONE], 23 Sep
  // 26). A day column is as wide as the widest thing any DRAWN row puts in it
  // (auto table layout), so the same month is narrower once a row that widened
  // it has gone. Measured on the owner's PC: February, measured at the open
  // while a posted-out man's row (ignite) still showed, drew 20px narrower after
  // SEP had hidden him — and a MAR tap on a phone then slid 1 March under the
  // frozen name column, because the fill engine swapped February's placeholder
  // for the real month mid-scroll trusting the old width, with the touch-screen
  // re-anchor skipped. This token changes whenever anything that sets a column's
  // width can have changed — the store's data (bids, events, the roster), the
  // row window, a folded group, the manning rows — and every cached width is
  // stamped with the token it was measured under (`measureStripGeo`). An older
  // stamp is still the best number for the placeholder, so nothing moves when
  // the token changes; it is just no longer EXACT, and `widthExact` keeps the
  // fill engine from swapping it in under a moving scroll: that step waits for
  // rest, where the anchor correction absorbs the difference.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const widthGen = useMemo(() => ({}), [version, visWindow, folded, countsOpen, arranging])
  // The CURRENT token lives in a ref, because some inputs never reach a render:
  // the four Required / Available rows repaint themselves (FlyRows hears its own
  // two stores — a figure there can widen a day column), and until D669 the
  // manning Archive was CountRows' own state. Each replaces the token directly
  // (`onArchiveChange` — the name is the Archive's, kept; CountRows calls it now
  // when a count row goes in or out). A render only overwrites the ref when its
  // own inputs moved, never with a stale memo.
  const widthGenRef = useRef<object>(widthGen)
  const widthGenSeenRef = useRef(widthGen)
  if (widthGenSeenRef.current !== widthGen) { widthGenSeenRef.current = widthGen; widthGenRef.current = widthGen }
  // What a width change must refresh, published by the effects that own it: the
  // strip/cache/placeholder/bottom-bar geometry, and the frozen header's pinned
  // column widths (Astra LW-102 — both used to wait for a zoom, a resize or a
  // scroll, so a wider chip placed while the header was frozen left its dates
  // off the columns beneath). Called on every token change below.
  const remeasureRef = useRef<() => void>(() => {})
  const repinRef = useRef<() => void>(() => {})
  // ...and the open-bidding outline (Astra LW-103, pre-existing): the Archive's
  // rows sit ABOVE the dates, so opening it pushes the header and roster down,
  // and the outline — placed off the header — kept its old top until the next
  // store change or zoom. Its own effect never hears a change local to the block.
  const measureBidBoxRef = useRef<() => void>(() => {})
  const onArchiveChange = useCallback(() => {
    widthGenRef.current = {}
    remeasureRef.current()
    repinRef.current()
    measureBidBoxRef.current()
  }, [])

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

  /* What the quals popover lists for a person: ONLY the qualifications the
     admin has put on the page as groups (owner, 3 Sep 26 — "only the
     qualifications that were added to display will be shown when i hover"),
     in page order, each in the colour picked for that group; plus SXO in its
     gold whenever the SXO group is on the page (the owner counts SXO among
     their quals). A qualification held but not displayed is not listed, so the
     popover reads as the page's own legend. */
  const shownQuals = (p: Person): { label: string; color: string }[] => {
    const out: { label: string; color: string }[] = []
    // `groupDefs` is this render's one read of the page's groups (above) —
    // asked per row, twice (grid + frozen overlay), so not re-derived here.
    for (const d of groupDefs) {
      if (d.kind === 'qual' && matchesGroup(p, d)) {
        out.push({ label: labelOfGroup(d.id), color: groupColorOf(d.id, groupColors) ?? '#39424D' })
      } else if (d.kind === 'cat' && d.g === 'SXO' && p.sxo) {
        out.push({ label: 'SXO', color: '#E8B23B' })
      }
    }
    return out
  }
  /* Open the quals popover anchored to the chip just interacted with. Placed in
     fixed (screen) coordinates read from the chip's rect, clamped to stay on
     screen and flipped above the chip when it would fall off the bottom —
     `popAt` (popat.ts), shared with the drawer's title pop-up so the two
     screen-fixed popups cannot drift. 240 is `.qualpop`'s own max-width. */
  const openQualsAt = (id: string, el: HTMLElement) =>
    setQualPop({ id, ...popAt(el.getBoundingClientRect(), 240, 108) })
  // The chip's quals per person, once per store change (a row prop — a fresh
  // array per render would defeat the row memo, see PersonRow).
  const qualsOf = useMemo(() => {
    const m = new Map<string, QualPill[]>()
    for (const p of people) m.set(p.id, shownQuals(p))
    return m
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version])
  // The row's event-time callbacks, handed over as ONE stable ref so the memo
  // never sees a new function prop; the row reads `.current` at event time,
  // so every handler sees this render's live state (qualPop, the drag).
  const rowApi = useRef<RowApi>(null!)
  rowApi.current = {
    startRowDrag,
    setWhoOpen,
    setBalOpen,
    /* the tap pins the posting sheet it opens (W3-F5) — read off the day as it stands at the tap */
    setOpen: v => {
      const p = people.find(x => x.id === v.id)
      /* D320: by stint — an earlier stint's day is ordinary; only the gap before the current stint opens its Post in */
      const posting = !p ? undefined : postingSheetFor(p, v.date)
      setOpen(posting ? { ...v, posting } : v)
    },
    chipEnter: openQualsAt,
    chipLeave: () => setQualPop(null),
    chipClick: (p, el) => { if (qualPop?.id === p.id) setQualPop(null); else openQualsAt(p.id, el) },
  }
  /* The chip: the person's CAT, coloured by CAT (an SXO keeps gold wherever they
     sit). When they hold a displayed qualification it becomes a live control —
     hover (desktop) or tap (phone) to list them; the click is swallowed so it
     never also opens the figures sheet the callsign owns. */
  const catChip = (p: Person, testid?: string) => {
    const quals = shownQuals(p)
    const has = quals.length > 0
    return (
      <span
        className={`catchip ${catClass(p)}${has ? ' has-quals' : ''}`}
        data-testid={testid}
        aria-label={has ? `${p.callsign} qualifications: ${quals.map(q => q.label).join(', ')}` : undefined}
        onPointerEnter={has ? e => { if (e.pointerType === 'mouse') openQualsAt(p.id, e.currentTarget) } : undefined}
        onPointerLeave={has ? e => { if (e.pointerType === 'mouse') setQualPop(null) } : undefined}
        // A second tap on the SAME chip closes it (the phone has no pointer to
        // leave with); a tap on another chip moves it there.
        onClick={has ? e => { e.stopPropagation(); if (qualPop?.id === p.id) setQualPop(null); else openQualsAt(p.id, e.currentTarget) } : undefined}
      >{catText(p) || 'GND'}</span>
    )
  }
  /* THE EVENT BOX'S OWN WAYS TO CLOSE — the quals popover's, below, for the same reasons: it is anchored in screen
     coordinates, so a scroll or a resize strands it; a pointer-down anywhere but the box and the cell it hangs from
     dismisses it, by a listener and never a scrim, so the next tap and the next drag reach the grid untouched. */
  useEffect(() => {
    if (!evPeek) return
    const close = () => setEvPeek(null)
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null
      if (!t || t.closest('.evpeek')) return
      if (t.closest(`[data-testid="${evPeek.tid}"]`)) return   // its own cell: the click that follows toggles it
      setEvPeek(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const pg = document.getElementById('page-leavewar')
      if (pg && !pg.classList.contains('on')) return
      e.stopPropagation()
      setEvPeek(null)
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
  }, [evPeek])
  /* …and it never outlives what it was opened for: a sheet opening over the grid, either move mode starting. */
  useEffect(() => { if (eventEdit || moveSel || eventMoveSel) setEvPeek(null) }, [eventEdit, moveSel, eventMoveSel])

  /* While the popover is up: it is anchored in screen coordinates, so any scroll
     or resize leaves it stranded — close it. And a pointer-down anywhere that is
     not a chip or the popover itself dismisses it (the phone's tap-away, and the
     desktop's click-elsewhere) — done with a listener rather than a full-screen
     scrim, which would sit over the chip and swallow the very click that opens
     it, and block the grid while open. */
  useEffect(() => {
    if (!qualPop) return
    const close = () => setQualPop(null)
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null
      if (t && !t.closest('.qualpop') && !t.closest('.catchip')) setQualPop(null)
    }
    /* Escape peels the popover first, before any sheet's own Escape (Sheet.tsx
       listens on `document`; the window capture runs ahead of it). */
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // Kept-mounted guard (as Sheet.tsx): act only while Leave War is showing.
      const pg = document.getElementById('page-leavewar')
      if (pg && !pg.classList.contains('on')) return
      e.stopPropagation()
      setQualPop(null)
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
  }, [qualPop])

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
  // ---- THE YEAR-WIDE SCROLLBAR (owner, 4 Sep 26 — "the scroll bar at the
  // bottom keeps adjusting … make it linear … halfway I'm already at the edge")
  // The Phase-2 column window draws only ~2–4 months, so this proxy bar's spacer
  // — sized to the DRAWN content — spanned only those months: the thumb filled
  // most of the bar, "halfway" was the edge, and it RESIZED every time the
  // window grew. The bar became a YEAR-wide SCRUBBER over an ESTIMATED year
  // width, jumping the grid to the dragged-to day on release. Since the
  // PLACEHOLDERS (5 Sep 26) the grid's own scroller is year-wide, so the bar is
  // a plain proxy again — its spacer is the grid's scrollWidth and a drag SLIDES
  // the grid, the fill drawing the months under the view as it goes. Desktop
  // only (a phone finger-scrolls the grid and shows no proxy bar).
  const hbarUserTsRef = useRef(0)              // last time the bar itself was dragged
  const hbarWantRef = useRef<number | null>(null) // the follow-write we expect back as an echo
  // The measured average day-column width + the frozen-column width, cached by
  // war+zoom — the ESTIMATE a placeholder uses for a month never yet drawn (see
  // `applyPlaceholders`). Only a new war or a zoom step re-measures. Taken from
  // whatever is drawn at first measure; two months is plenty representative.
  // `zoom` is the zoom `avg` was measured at: `avg` is in screen px, so it is divided by THAT zoom, never the one on
  // screen now ([LW-PHONE-PINCH-ZOOM], the walk of 23 Oct 26 — see `monthPx`).
  const avgDayWRef = useRef<{ key: string; avg: number; frozen: number; zoom: number } | null>(null)

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
        const next = { top: topEdge, left: wr.left, width: wr.width, cols }
        // A forced re-pin that measured the same bar keeps the old object, so
        // re-measuring on every store change costs no re-render of this grid.
        return prev && sameStuck(prev, next) ? prev : next
      })
    }
    repinRef.current = () => pin(true)
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
      repinRef.current = () => {}
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
    // category takes its rows (and their chips) out of the table. The window's
    // EDGES (5 Sep 26): two windows a month apart can hold the same day count,
    // and the pinned widths would be the wrong months'. `arranging` (6 Sep 26):
    // Rearrange widens the frozen name column (`.mx-arranging`), so a stuck
    // mirror pinned at the old width would sit a grip's width off the grid.
    // `figuresOpen` (6 Sep 26): the header row grows for the drawer's titles, so
    // where it crosses under the top bar — and so whether the mirror is stuck at
    // all — moves with it.
  }, [period.id, drawnDates.length, colWin?.lo, colWin?.hi, zoom, visWindow, folded, arranging, figuresOpen])

  // ...and RE-PIN on any change that can widen a column while the bar is up
  // (Astra LW-102, 23 Sep 26): a wider chip or an event written by anyone, the
  // manning rows, the Archive (via `onArchiveChange`). Measured on the built
  // bundle: a half-day OIL chip ("*OIL") widens a narrow day column by ~10px,
  // and every frozen date to its right then sat that far off its column until
  // a scroll un-stuck the bar. A layout effect, so the fresh widths land in the
  // frame the change paints in; the value check in `pin` makes it free when
  // nothing moved. Pinned by "a column that widens while the dates are frozen
  // re-measures the frozen bar" (e2e/leavewar.spec.ts).
  useLayoutEffect(() => { repinRef.current() }, [widthGen])

  // The mirror starts life at the grid's current horizontal position, and the
  // two scrollers keep each other in lockstep from then on. Assigning an
  // unchanged scrollLeft fires no event, so the pair settles instead of
  // ping-ponging.
  //
  // A LAYOUT effect, so the position is set BEFORE the bar's first frame is
  // painted (owner's video, 23 Sep 26 — "the frozen bar scrolling rapidly
  // horizontally when they scroll the page down"). The bar mounts afresh every
  // time the page scrolls it into view, and as a plain effect this ran AFTER
  // that first paint: for one frame the day columns sat at the START of the
  // year, then jumped to where the grid was — 5,135px on a desktop parked in
  // August, measured on the built bundle, every time the page scrolled down.
  // Pinned by "the frozen bar is in step with the grid the moment it appears"
  // (e2e/leavewar.spec.ts).
  useLayoutEffect(() => {
    if (stuck && mirrorRef.current && wrapRef.current) {
      const w = wrapRef.current
      if (sdaActive) {
        // Scroll-driven path: the track must NOT be scrolled (the inner table is
        // translated instead — a scrollLeft here would double the travel). Just
        // make sure the bar knows the grid's travel before it appears, so its
        // very first painted frame is already in step; a stale or zero
        // --lwx-max would pin the day columns at the left until the next layout.
        // On the bar's own box, not `.mx-outer`: a custom property changing on
        // the grid's ancestor re-styles the whole grid (see applyPlaceholders).
        mirrorRef.current.style.setProperty('--lwx-max', String(Math.max(0, (w.scrollWidth - w.clientWidth) / zoom)))
        // ...AND hold the day columns where the grid is until the browser has
        // STARTED the scroll-linked animation. Knowing the travel was not
        // enough: a freshly created animation is not applied on the frame it is
        // created in (measured on the built bundle — the bar's first frame had
        // no transform at all with `--lwx-max` already set), so the year's first
        // columns still flashed. This inline translate is the same number the
        // animation will produce (its keyframe runs 0 → −travel across the
        // whole scroll range, so at scrollLeft s it sits at −s/zoom); once the
        // animation runs it outranks an inline style anyway, and the hold is
        // dropped then, so it can never go stale on a later scroll. The
        // keyframe's `from` is STATED for this (matrix.css `lwx-follow`): an
        // implicit one would start from this held value and blend with it.
        const anim = mirrorRef.current.querySelector<HTMLElement>('.mxfixed-anim')
        const run = anim?.getAnimations?.()[0]
        if (anim && run) {
          anim.style.transform = `translateX(${-w.scrollLeft / zoom}px)`
          run.ready.then(() => { anim.style.transform = '' }, () => { anim.style.transform = '' })
        }
      } else {
        // JS-mirror fallback: start the mirror at the grid's position.
        mirrorRef.current.scrollLeft = w.scrollLeft
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stuck])

  // The bottom scrollbar starts at the grid's current position the moment it
  // appears, so its thumb is never a frame out of step on show. A LAYOUT effect
  // for the reason the frozen header's is (above): the bar mounts afresh each
  // time the page scrolls it into view, and a plain effect placed the thumb one
  // painted frame late — at the start of the year, then a jump.
  useLayoutEffect(() => { if (hbar) syncHbar() }, [hbar])
  /* ON A PHONE THE TAPPED CELL STAYS IN SIGHT (red-team fix A5, the phone half — M3 5.7): a bid window opening over the
     cell tapped first scrolls the page so the cell sits just above the window's top edge. Only as it opens (Undo leaves
     the grid where it is — D672); a cell already clear of it does not move; the desktop's window blocks nothing (D641). */
  useLayoutEffect(() => {
    if (!open || !phone) return
    const cell = document.querySelector<HTMLElement>(`#page-leavewar [data-testid="cell-${open.id}-${open.date}"]`)
    const sheet = document.querySelector<HTMLElement>('[data-testid="bid-picker"]')
    if (!cell || !sheet) return
    const c = cell.getBoundingClientRect(), w = sheet.getBoundingClientRect()
    if (!c.height || !w.height || c.bottom <= w.top - 4) return
    window.scrollBy(0, c.bottom - w.top + 8)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open?.id, open?.date])

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
  }, [phone, zoom, visWindow, period.id, drawnDates.length, countsOpen, folded])
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

  // The year-wide scrubber FOLLOWS the grid. Since the placeholders (5 Sep 26)
  // the grid's own scroller IS year-wide — the bar's spacer is simply its
  // scrollWidth — so the follow is a straight copy of scrollLeft, no year-space
  // estimate needed. Suppressed for a beat after the bar itself is dragged
  // (`hbarUserTsRef`), so the grid never writes the thumb back out from under
  // the finger. No-op when the bar is not shown (ref is null).
  //
  // ...and ONE catch-up follow when that beat ends ([LW-HBAR-RESYNC], 23 Sep
  // 26). A follow asked for inside the beat used to be dropped, and nothing
  // asked again until the grid next scrolled — so a month button pressed
  // straight after a drag moved the grid to September and left the thumb at
  // January (forced 5 of 5; one run in four on the owner's fast PC). The
  // catch-up re-runs this, so a drag still going when it fires just waits
  // another beat. Pinned by the scrubber test in e2e/leavewar.spec.ts.
  const HBAR_HOLD_MS = 250
  const hbarCatchUpRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const syncHbar = () => {
    const h = hbarRef.current, wrap = wrapRef.current
    if (!h || !wrap) return
    const hold = HBAR_HOLD_MS - (Date.now() - hbarUserTsRef.current)
    if (hold > 0) {
      if (hbarCatchUpRef.current == null) {
        hbarCatchUpRef.current = setTimeout(() => { hbarCatchUpRef.current = null; syncHbar() }, hold + 10)
      }
      return
    }
    const v = Math.min(Math.max(0, h.scrollWidth - h.clientWidth), Math.max(0, wrap.scrollLeft))
    if (Math.abs(h.scrollLeft - v) <= 1) return
    hbarWantRef.current = v
    h.scrollLeft = v
  }
  // ...and dragging the scrubber SLIDES the grid: the bar's position maps
  // straight onto the grid's real scroll, and the grid's own scroll handler
  // lights the month strip and kicks the fill, which draws the months under the
  // moving view in place (the placeholders make every position real). It used
  // to JUMP on release while months were still filling in, because the scroller
  // only spanned the drawn months; that ration is gone with them.
  const onHbarScroll = () => {
    const h = hbarRef.current, wrap = wrapRef.current
    if (!h || !wrap) return
    // Our own follow-write (syncHbar) echoes back as a scroll event — ignore it.
    if (hbarWantRef.current != null && Math.abs(h.scrollLeft - hbarWantRef.current) <= 1) { hbarWantRef.current = null; return }
    hbarWantRef.current = null
    hbarUserTsRef.current = Date.now()
    const hMax = h.scrollWidth - h.clientWidth
    const wMax = wrap.scrollWidth - wrap.clientWidth
    wrap.scrollLeft = hMax > 0 ? Math.round((h.scrollLeft / hMax) * wMax) : 0
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
    // The spacer is the grid's own scroll width — year-wide since the
    // placeholders (5 Sep 26), so the thumb is year-proportional and only ever
    // shifts by the few pixels an estimated month gains or loses when drawn.
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
  //
  // `drawer` is the stuck mirror's FROZEN copy only (see the render below):
  // there the counter column is replaced by the drawer's own title columns, so
  // the frozen pair is one + however many figures show, and the brackets start
  // that many columns in. The real grid never takes it — the drawer is an
  // overlay, and every real row keeps identical cells.
  const bracketRow = (testids: boolean, drawer = false) => (
    <tr className="mbrak" data-testid={testids ? 'month-bracket' : undefined}>
      {/* The corner cell above CS/Name. The admin's ⠿ REARRANGE toggle moved UP
          to the card-header row (owner, 5 Sep 26 — "the rearrange button goes
          after [settings]"); it now carries the DRAWER's switch (owner, 6 Sep
          26) — the one empty frozen cell, sitting directly above the column it
          unfolds. The stuck mirror draws the same copy (no testid, one id one
          node) so the switch is reachable however far the roster has scrolled. */}
      <th className="brakhd" colSpan={drawer ? 1 + figures.length : 2}>
        <button
          className={`figbar${figuresOpen ? ' on' : ''}`}
          data-testid={testids ? 'figures-toggle' : undefined}
          aria-expanded={figuresOpen}
          title={figuresOpen ? 'Hide the figures' : 'Show every figure'}
          onClick={() => setFiguresOpen(o => !o)}
        >
          {figuresOpen ? '▾' : '▸'} FIGURES
        </button>
      </th>
      {padL && <th className="lwph lwph-l" ref={phL} />}
      {brackets.map(b => (
        <th key={b.key} className="brakm" data-testid={testids ? `bracket-${b.key}` : undefined} colSpan={b.count}>
          <div className="brakin">
            <span className="brakl">{b.label}</span>
          </div>
        </th>
      ))}
      {padR && <th className="lwph lwph-r" ref={phR} />}
    </tr>
  )

  /* A TAP ON A DATE'S HEADING OPENS THAT DAY (D1143; M3 6.1): one listener on the heading row — the grid's and the frozen
     copy's — the date read off the heading's `data-d`, never a button in each of 365 headings (performance.md §E). One
     heading takes the keyboard: today's where it is drawn, else the first; Enter opens it, and the panel's ‹ › step on. */
  /* THE DATE IS READ WHERE THE FINGER WENT DOWN (M3's re-walk, F1): a phone's browser aims a tap at the nearest element it
     thinks is pressable — the one heading that takes the keyboard (today's, else the first) — so a tap on 2 Jan's left part,
     or on the corner cell, reached 1 Jan. The press's own point (pointer events are not re-aimed) decides; the click's
     target only where no press was seen (a keyboard's Enter is handled below). */
  const headDown = useRef<{ x: number; y: number; t: number } | null>(null)
  const onHeadDown = (e: React.PointerEvent) => { headDown.current = { x: e.clientX, y: e.clientY, t: e.timeStamp } }
  const onHeadTap = (e: React.MouseEvent) => {
    const d = headDown.current
    headDown.current = null
    let th: HTMLElement | null = null
    if (d && e.timeStamp - d.t < 1500) {
      for (const el of document.elementsFromPoint(d.x, d.y)) { const h = (el as HTMLElement).closest?.('th.day[data-d]') as HTMLElement | null; if (h) { th = h; break } if ((el as HTMLElement).closest?.('th')) break }
      if (!th) return                       // the press was on no date (the corner, a placeholder): nothing opens
    } else th = (e.target as HTMLElement).closest<HTMLElement>('th.day[data-d]')
    if (th) openDayPanel(th.dataset.d!)
  }
  const onHeadKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    const th = (e.target as HTMLElement).closest<HTMLElement>('th.day[data-d]')
    if (th) { e.preventDefault(); openDayPanel(th.dataset.d!) }
  }
  const headTab = drawnDays.some(d => d.date === memberToday()) ? memberToday() : drawnDays[0]?.date
  const headerRow = (testids: boolean, drawer = false) => (
    <tr onPointerDown={onHeadDown} onClick={onHeadTap} onKeyDown={onHeadKey}>
      {/* CS/Name (owner, 26 Aug 26): the column holds aircrew callsigns AND
          ground-crew names, and the short form fits the phone's 76px frozen
          column; the Quals page's Personnel view says the long form
          (Callsign/Name) where there is room. */}
      <th className="who">CS/Name</th>
      {/* The stuck mirror's frozen copy, while the drawer is open: the drawer's
          own sideways titles in place of the one chip, so scrolling the page
          down does not take the legend with it. Read-only — the live titles are
          the drawer's own, a few pixels below. */}
      {drawer && figures.map(f => (
        <th key={f.id} className={figClass(figures, f.id)} data-fig={f.id}>
          <FigureTitle figure={f} />
        </th>
      ))}
      {/* The column's heading: LVE, the one figure it shows (D1245). Frozen beside the callsign, so the figure stays on
          screen however far the grid scrolls. */}
      {/* the spoken name on the heading CELL, which a screen reader honours (a plain span's aria-label may be skipped) */}
      {!drawer && <th className="bal" data-testid={testids ? 'counter-head' : undefined} aria-label={`${shown.label} balance`}>
        <span className="cpick">
          <span className="cname" data-testid={testids ? 'counter-name' : undefined}>{shown.title}</span>
        </span>
      </th>}
      {padL && <th className="lwph lwph-l" ref={phL} />}
      {drawnDays.map(d => {
        const mon = monthLabel(d.date)
        return (
          <th
            key={d.date}
            data-testid={testids ? `head-${d.date}` : undefined}
            data-d={d.date}
            tabIndex={testids && d.date === headTab ? 0 : undefined}
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
      {padR && <th className="lwph lwph-r" ref={phR} />}
    </tr>
  )

  // The month spans + the visible view bounds — the thirteen rect reads both
  // the strip readout and the row window are computed from. One rect per month
  // plus the last column, not one per day: thirteen reads on a year rather than
  // 365, which is what makes measuring this on every scroll event affordable.
  const readSpans = () => {
    const wrap = wrapRef.current
    const { drawnMonths, drawnDates } = liveRef.current
    if (!wrap || drawnMonths.length === 0 || drawnDates.length === 0) return null
    const headLeft = (date: string) =>
      headCell(date)?.getBoundingClientRect().left
    const lastHead = headCell(drawnDates[drawnDates.length - 1])
    if (!lastHead) return null
    const edges = drawnMonths.map(m => headLeft(m.first))
    if (edges.some(e => e === undefined)) return null
    const end = lastHead.getBoundingClientRect().right
    const spans = drawnMonths.map((m, i) => ({
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
    const { drawnMonths, drawnDates } = liveRef.current
    if (!wrap || drawnMonths.length === 0 || drawnDates.length === 0) { stripGeoRef.current = null; return }
    // The scroll-driven frozen bar (sdaActive) translates its day columns from 0
    // to -(--lwx-max)px across the grid's whole scroll range, so --lwx-max must
    // equal the grid's max scrollLeft — divided back out of the mirror table's
    // own zoom, since the transform lands in that table's zoomed local space
    // (mirror render below). It only shifts on a real layout change (resize,
    // zoom, row-window, war), which is exactly when this runs; never per frame.
    // Written on the bar's own box (null until the bar is stuck — the stuck
    // effect seeds it then), never on `.mx-outer`: a custom property changing on
    // the grid's ancestor re-styles the whole grid (see applyPlaceholders).
    if (sdaActive) {
      mirrorRef.current?.style.setProperty('--lwx-max', String(Math.max(0, (wrap.scrollWidth - wrap.clientWidth) / zoom)))
    }
    const wr = wrap.getBoundingClientRect()
    const sl = wrap.scrollLeft
    // viewport px -> content px: constant across any scroll position
    const contentL = (el: HTMLElement) => el.getBoundingClientRect().left - wr.left + sl
    const head = (d: string) => headCell(d)
    const firsts = drawnMonths.map(m => head(m.first))
    const lastHead = head(drawnDates[drawnDates.length - 1]!)
    if (!lastHead || firsts.some(e => !e)) { stripGeoRef.current = null; return }
    const edges = firsts.map(e => contentL(e!))
    const end = lastHead.getBoundingClientRect().right - wr.left + sl
    // jsdom reports every rect 0x0; a zero-width geometry would make every
    // month's overlap 0 and the readout permanently null, so leave the cache
    // empty and let measureStrip no-op exactly as it did before.
    if (end <= edges[0]!) { stripGeoRef.current = null; return }
    const drawn = drawnMonths.map((m, i) => ({
      label: m.label,
      left: edges[i]!,
      right: i + 1 < edges.length ? edges[i + 1]! : end,
    }))
    const frozen = frozenWidth(wrap)
    // The placeholders' day-width estimate rides this same measurement, and
    // the drawn months' real widths go into the cache the placeholders read.
    measureAvgDayW(drawn, frozen)
    const win = colWinRef.current
    const lo = win?.lo ?? 0
    const cache = monthPxCache()
    for (let i = 0; i < drawn.length; i++) {
      cache.px[lo + i] = (drawn[i]!.right - drawn[i]!.left) / zoom
      cache.gen[lo + i] = widthGenRef.current // measured under THESE rows (see widthGen)
    }
    // One span per month of the WAR, drawn or placeholder — the undrawn months
    // laid out at their placeholder widths on either side of the measured ones,
    // so the readout lights the month a placeholder stands for and the fill
    // engine knows which months the view is over before they exist.
    const spans: { label: string; left: number; right: number }[] = []
    let x = drawn[0]!.left
    for (let m = lo - 1; m >= 0; m--) x -= monthPx(m) * zoom
    for (let m = 0; m < lo; m++) { const w = monthPx(m) * zoom; spans.push({ label: months[m]!.label, left: x, right: x + w }); x += w }
    for (const s of drawn) spans.push(s)
    x = end
    for (let m = lo + drawn.length; m < months.length; m++) { const w = monthPx(m) * zoom; spans.push({ label: months[m]!.label, left: x, right: x + w }); x += w }
    stripGeoRef.current = {
      spans,
      frozen,
      // the wrapper's own rect, not clientWidth: every other edge above is
      // measured from a rect, and mixing the two invites an off-by-a-scrollbar
      client: wr.width,
    }
    // Newly cached widths can change a placeholder's width (a month that was
    // an estimate is now measured) — write them through before the next paint.
    applyPlaceholders()
  }

  // Lock in the average day-column width (and the frozen width) the first time
  // the strip geometry is measured for this war+zoom; reused thereafter so a
  // never-drawn month's estimate does not wander as the window grows.
  const measureAvgDayW = (drawn: { left: number; right: number }[], frozen: number) => {
    const n = liveRef.current.drawnDates.length
    if (drawn.length === 0 || n === 0) return
    const key = `${period.id}|${zoom}`
    if (avgDayWRef.current?.key === key) return
    const avg = (drawn[drawn.length - 1]!.right - drawn[0]!.left) / n
    if (avg > 0) avgDayWRef.current = { key, avg, frozen, zoom }
  }
  // The per-month width cache for this war+zoom (a zoom step changes every
  // width; a new war is a new set of months) — started fresh when the key moves.
  const monthPxCache = () => {
    const key = `${period.id}|${zoom}`
    if (monthPxRef.current.key !== key) { monthPxRef.current = { key, px: months.map(() => null), gen: months.map(() => null) }; padErrRef.current = 0 }
    return monthPxRef.current
  }
  // A month's width in LAYOUT px (the table's own space, zoom divided out — the
  // placeholder's `width` is set in that space): measured if it has ever been
  // drawn, else the average day width × its days, else a plain guess for the
  // beat before the first measurement. A width measured under different rows
  // is still used here — it is the best number there is, and changing the
  // placeholder under the reader would move the grid for nothing.
  const monthPx = (m: number): number => {
    const cached = monthPxCache().px[m]
    if (cached != null) return cached
    /* THE ESTIMATE IS IN THE GRID'S OWN PX AT ANY ZOOM ([LW-PHONE-PINCH-ZOOM], the walk of 23 Oct 26). Right after a zoom
       change the average still on hand is the old zoom's (it is re-measured for the new one within the same commit);
       it was divided by the NEW zoom, so every undrawn month's placeholder came out as wrong as the two zooms are
       apart — at 0.8 → 1.4 the months left of the view stood ~2,800 px too narrow, the lit month button then read
       DEC over October, and each old + / − step threw the view back a month or more. A day's width in the grid's own
       px barely moves with the zoom, so the measured one, divided by the zoom it was measured at, is the estimate. */
    const a = avgDayWRef.current
    return (a ? a.avg / a.zoom : 30) * (yearMonths.monthDays[m] ?? 30)
  }
  // Will drawing month `m` in place of its placeholder move nothing? Only when
  // its width was measured under the rows on screen NOW (`widthGen`) — the one
  // case where the placeholder is exactly as wide as the month it stands for.
  const widthExact = (m: number): boolean => {
    const c = monthPxCache()
    return c.px[m] != null && c.gen[m] === widthGenRef.current
  }
  // Size the placeholder cells: the sum of the undrawn months on each side,
  // written as an inline width on every registered placeholder cell (each
  // row's, and the mirror header's copy) — React never sets a style on these
  // cells, so the widths survive its renders, and a cell that mounts later
  // takes the current width through its ref hook (`phL`/`phR` above). Runs in
  // the layout effects below, in the same commit as the window change, so a
  // month swapping between placeholder and drawn never paints at two widths.
  // Skipped when nothing changed: the cells are the only thing touched, but a
  // no-op write still dirties their style.
  const applyPlaceholders = () => {
    const win = colWinRef.current
    let l = 0, r = 0
    if (win) {
      for (let m = 0; m < win.lo; m++) l += monthPx(m)
      for (let m = win.hi + 1; m < months.length; m++) r += monthPx(m)
      // the error a mid-fling left draw handed it (padErrRef); none once the first month is drawn — no placeholder is left
      if (win.lo === 0) padErrRef.current = 0
      l = Math.max(0, l - padErrRef.current)
    }
    const next = { l: `${l.toFixed(2)}px`, r: `${r.toFixed(2)}px` }
    const prev = phWRef.current
    phWRef.current = next
    if (next.l !== prev.l) for (const el of phCellsRef.current.l) setPhWidth(el, next.l)
    if (next.r !== prev.r) for (const el of phCellsRef.current.r) setPhWidth(el, next.r)
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
    // Which months (absolute indices, drawn or placeholder) the view is over —
    // what the fill engine's rolling target follows, and where the grid shrinks
    // to around when the tab is left. Same twelve numbers, no extra read.
    const vis = visibleSpan(g.spans, sl + g.frozen, sl + g.client)
    if (vis) {
      liveVisRef.current = { lo: vis.visLo, hi: vis.visHi }
      viewMonthRef.current = vis.visLo
    }
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
  // The first drawn column at or past the frozen edge, and where it sits —
  // what a column-set change (rows hidden, months added or dropped on the
  // left) puts back in the same place. Binary search — column lefts are
  // monotonic — so ~9 rect reads. Shared by the row window and the column
  // window so the two corrections cannot disagree.
  const anchorNow = (wrap: HTMLElement): { date: string; left: number } | null => {
    const { drawnDates } = liveRef.current
    if (drawnDates.length === 0) return null
    const viewL = wrap.getBoundingClientRect().left + frozenWidth(wrap)
    const at = (i: number) => headCell(drawnDates[i])?.getBoundingClientRect().left ?? 0
    let lo = 0, hi = drawnDates.length - 1, best = 0
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (at(mid) >= viewL - 1) { best = mid; hi = mid - 1 } else lo = mid + 1
    }
    return { date: drawnDates[best]!, left: at(best) }
  }

  const measureWindow = () => {
    const m = readSpans()
    if (!m) return
    const { wrap, spans, end, viewL, viewR } = m
    if (end > spans[0]!.left && viewR > viewL) {
      // >2px of overlap, not >0: a month jump aligns the next month's first
      // column to the frozen edge by integer scrollLeft, and a sub-pixel
      // sliver of the month being LEFT must not count as still viewing it.
      const { drawnMonths, people } = liveRef.current
      const vis = spans
        .map((s, i) => ({ s, key: drawnMonths[i]!.first.slice(0, 7) }))
        .filter(x => Math.min(x.s.right, viewR) - Math.max(x.s.left, viewL) > 2)
      if (vis.length) {
        const win = `${vis[0]!.key}|${vis[vis.length - 1]!.key}`
        visWinRef.current = win   // the true months, whether or not the rows change (W5-F2)
        const sig = people.filter(p => rowInWindow(p, win, liveRef.current.rowSpans)).map(p => p.id).join(',')
        if (sig !== visSigRef.current) {
          // Capture where the FIRST VISIBLE DAY column sits NOW; the layout
          // effect below puts it back after the repaint (see anchorRef and
          // anchorNow: the day at the view's left edge, not the month's first
          // day — a hidden row's chips widened columns on BOTH sides of any
          // other anchor, and compensating an off-screen one leaves the
          // residual on screen).
          anchorRef.current = anchorNow(wrap)
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
  /** how long after a pinch's lift a scroll is still the pinch's own (it is written in the same task; its event comes a
   *  frame later — no finger can start a fling that soon after two have lifted) */
  const PINCH_SCROLL_MS = 150
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // When the grid was last scrolled — the background fill waits for this to go
  // quiet before drawing a month, so a fill draw never lands under a moving
  // scroll (which is the very freeze this whole thing exists to avoid).
  const lastScrollTsRef = useRef(0)
  // How fast the grid is scrolling sideways (px a millisecond), smoothed over the last few scroll events — the fill
  // draws a month LEFT of the view mid-scroll only under DRAW_LEFT_MAX_SPEED (colwindow.ts). Pure arithmetic on the
  // event: no layout read, no render.
  const scrollSpeedRef = useRef({ v: 0, t: 0, sl: 0 })
  const onWrapScroll = () => {
    const now = Date.now()
    /* THE PINCH'S OWN SCROLL IS NOT A FLING ([LW-PHONE-PINCH-ZOOM], the walk of 23 Oct 26): at the lift the pinch scrolls
       the year — often thousands of pixels, the zoom having moved every column — to put the day under the fingers back
       under them. Counted as a scroll in motion, it let the fill draw the month left of the view "mid-fling" over a
       width guessed for the new zoom, and the year slid 1,600 px sideways a beat after the lift. Treated as a jump
       (jumpAtRef, set with it), the months drawn after it are anchored at rest like a month button's. */
    if (now - pinchAtRef.current < PINCH_SCROLL_MS) {
      /* ONE event only (the fresh code read, F3): the lift's scroll is written in one task, so it arrives as one; a finger
         left down after the other lifted may scroll on at once, and that scroll is a real one */
      pinchAtRef.current = 0
      const sp = scrollSpeedRef.current
      sp.v = 0; sp.t = now; sp.sl = wrapRef.current?.scrollLeft ?? 0
    } else {
      const sp = scrollSpeedRef.current, sl = wrapRef.current?.scrollLeft ?? 0
      const dt = now - sp.t
      const inst = dt > 0 && dt < 200 ? Math.abs(sl - sp.sl) / dt : 0
      sp.v = dt >= 200 ? inst : sp.v * 0.5 + inst * 0.5
      sp.t = now; sp.sl = sl
      lastScrollTsRef.current = now
    }
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
    // Draw WHILE MOVING (owner, 5 Sep 26): the view's months just moved
    // (measureStrip updated them), so wake the fill engine now — it draws the
    // next month in place if the drawn edge is within the runway, or parks again
    // at once if not (arithmetic, no DOM). The scroller is year-wide, so there is
    // always somewhere to scroll; this is what puts the columns under the finger
    // before it gets there.
    kickFillRef.current()
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
    idleRef.current = setTimeout(() => {
      idleRef.current = null
      measureWindow()
      // At rest the fill may also PRUNE the trailing months and draw an
      // estimated-width month on the left (the anchor makes that invisible now
      // the grid is still) — the steps it holds back while moving.
      kickFillRef.current()
    }, SCROLL_REST_MS)
  }
  useEffect(() => () => {
    if (idleRef.current) clearTimeout(idleRef.current)
    if (hbarCatchUpRef.current) clearTimeout(hbarCatchUpRef.current)
    stopPump()
  }, [])

  // The WINDOW half measured when the war changes (that rebuilds every column)
  // and when a month draw lands (the view may now sit over real columns where
  // it sat over a placeholder). A draw can land WHILE THE GRID IS STILL MOVING
  // (the in-motion fill kicked from every scroll event), and this must never
  // reflow the row set under a moving finger or write scrollLeft into a fling
  // — so while the rest debounce is pending the run is skipped: the rest
  // handler measures the window once the scroll settles, and a draw it kicks
  // lands at rest and runs here (bug-hunt fix, 6 Sep 26). The strip half is
  // NOT repeated: the layout effect below (same deps, plus zoom / visWindow)
  // has already measured it in this very commit, and doing it twice cost a
  // second set of header lookups and rect reads on every first open (3 Sep 26).
  useEffect(() => {
    if (idleRef.current) return
    measureWindow()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period.id, drawnDates.length])

  // How many months the drawn window holds while the tab is HIDDEN (a pre-warm
  // mount, or after the tab is left) — small, so the browser re-styles a few
  // months on reveal instead of the whole year (owner, 5 Sep 26, after
  // measurement showed the full-year reveal costs ~1.4s). The phone's rolling
  // runway: a few months AHEAD of the finger, one behind.
  const HIDDEN_MONTHS = 3
  const PHONE_BEFORE = 1
  const PHONE_AFTER = 3
  // The pre-warm draws only while the user has been hands-off this long, so a
  // draw never lands under a keystroke on the login-to-week path or a puck drag.
  const PREWARM_IDLE_MS = 2000

  // THE ONE DRAW-TOWARD-A-TARGET ENGINE (owner, 4–5 Sep 26 — "fill in the
  // background", then "shrink when I leave, rebuild on return", then the phone's
  // "load the next months as I approach the edge", then "do the placeholders +
  // moving"). One loop, one target per mode, one month per beat — colwindow.ts
  // `stepToward` is the arithmetic:
  //   · phone → a ROLLING window a few months ahead of the visible ones
  //     (`rollingTarget`), so a flick meets drawn columns, never a stuck edge,
  //     and the trailing months are pruned so the phone's DOM stays light;
  //   · desktop, tab ON screen → the WHOLE year, so scrolling runs end to end
  //     with nothing left to draw and the bottom scrollbar slides;
  //   · desktop, tab OFF screen (a pre-warm mount, or just left) → capped at a few
  //     months, and only drawn while the user is idle (`msSinceInput`) — this is
  //     the pre-warm that makes the first open instant, and the small window that
  //     makes the next return instant.
  // WHILE THE SCROLL IS MOVING the engine keeps drawing — that is the whole
  // point of the placeholders: the months under and ahead of the moving view
  // land in place, so the reader sees columns arrive rather than a stuck edge.
  // Each draw is still one synchronous month-build on the main thread (the
  // freeze the owner felt on the mockup and chose), so it is rationed to the
  // steps that cannot hop the content under the finger — `stepAllowedInMotion`:
  // growth only, and on the left only over a month whose width is already
  // measured. A prune, and a left grow over an estimated width, wait for rest,
  // where the anchor correction hides the shift. In motion the beat is a short
  // timeout (requestIdleCallback is starved by an active scroll); at rest it is
  // an idle callback, so a beat never competes with a paint. The loop PARKS when
  // the window matches its target and is resumed by `kickFillRef` — from every
  // scroll event (the view moved), from scroll rest (the held-back steps), and
  // from the on-screen effect (tab shown). jsdom lays nothing out, so colWin is
  // null (draw-whole) and this no-ops; the browser gate proves it.
  const fillIdleRef = useRef<{ id: number; idle: boolean } | null>(null)
  useEffect(() => {
    if (!colWin) return
    let live = true
    const moving = () => Date.now() - lastScrollTsRef.current < SCROLL_REST_MS + 40
    const rideIdle = (fn: () => void): { id: number; idle: boolean } =>
      typeof (window as { requestIdleCallback?: unknown }).requestIdleCallback === 'function'
        ? { id: (window as unknown as { requestIdleCallback: (cb: () => void, o: { timeout: number }) => number }).requestIdleCallback(fn, { timeout: 500 }), idle: true }
        : { id: window.setTimeout(fn, 48), idle: false }
    const rideSoon = (fn: () => void): { id: number; idle: boolean } => ({ id: window.setTimeout(fn, 16), idle: false })
    const drop = (h: { id: number; idle: boolean }) => {
      if (h.idle && typeof (window as { cancelIdleCallback?: unknown }).cancelIdleCallback === 'function') {
        (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(h.id)
      } else clearTimeout(h.id)
    }
    const schedule = () => { if (fillIdleRef.current == null) fillIdleRef.current = (moving() ? rideSoon : rideIdle)(tick) }
    const tick = () => {
      fillIdleRef.current = null
      if (!live) return
      // While the tab is hidden a draw must wait for the app to be genuinely
      // idle, so it never lands under a keystroke or a puck drag on another page.
      const idleOk = onScreenRef.current || msSinceInput() > PREWARM_IDLE_MS
      if (!idleOk) { schedule(); return }
      const win = colWinRef.current
      if (!win) return
      const last = months.length - 1
      const v = liveVisRef.current
      // THE VIEW COMES FIRST. The scroller is year-wide, so a scrubber drag or a
      // long fling can park the view over placeholders nowhere near the drawn
      // window; stepping toward it a month at a time would draw every unseen
      // month in between before the one on screen. So when the drawn window is
      // not even adjacent to the visible months, REPLACE it with them — the
      // months on screen land in one draw, and the steps below add the runway
      // (or the rest of the year) outward from there. No anchor: everything
      // left of the view keeps its width (drawn months become placeholders of
      // the same measured width), so the view's left edge holds still.
      if (onScreenRef.current && (v.lo > win.hi + 1 || v.hi < win.lo - 1)) {
        anchorRef.current = null
        colShiftRef.current = false
        setColWin(clampWin({ lo: v.lo, hi: v.hi }, months.length))
        return
      }
      let tLo: number, tHi: number
      if (phone) {
        const t = rollingTarget(months.length, v.lo, v.hi, PHONE_BEFORE, PHONE_AFTER)
        tLo = t.lo; tHi = t.hi
      } else if (onScreenRef.current) {
        tLo = 0; tHi = last                                   // the whole year
      } else {
        tLo = win.lo; tHi = Math.min(last, win.lo + HIDDEN_MONTHS - 1) // capped while hidden
      }
      const next = stepToward(win, months.length, tLo, tHi)
      if (next.lo === win.lo && next.hi === win.hi) return    // parked — kickFillRef resumes
      const inMotion = moving()
      // `widthExact`, not "measured once": a month measured while other rows
      // showed is not the width it will draw at now ([LW-MONTHJUMP-PHONE]).
      const sl = wrapRef.current?.scrollLeft ?? 1
      const speed = scrollSpeedRef.current.v
      if (inMotion && !stepAllowedInMotion(win, next, widthExact, m => leftGrowAbsorbable(m, sl, speed))) {
        // Not safe under a moving scroll: look again once the moving window has
        // passed. The scroll-rest kick itself lands INSIDE that window (it fires
        // 120 ms after the last scroll event, the window is 160), so it cannot be
        // the retry — without this the held-back prune / left grow would wait for
        // the next scroll, and a phone parked after a long fling kept all twelve
        // months (caught on the built bundle, 5 Sep 26).
        fillIdleRef.current = { id: window.setTimeout(tick, SCROLL_REST_MS), idle: false }
        return
      }
      // A month added or dropped on the LEFT shifts the content; keep the reader's
      // column in place with the same anchor the jump path uses. At rest that is
      // invisible. In motion the step only ever swaps a placeholder for a month
      // of the SAME width — `widthExact` above, measured under the rows on screen
      // now — so the shift is nil, and on a touch screen the anchor is skipped
      // altogether, because the `scrollLeft` write that would fix a stray pixel
      // is exactly what kills a fling (the 30 Aug history). A rightward step
      // writes none.
      // A left month over an ESTIMATED width drawn mid-fling hands its error to the left placeholder (padErrRef): measured
      // against the drawn month that was the window's left edge, in the commit that draws it. The war's first month has no
      // placeholder left of it and is drawn in motion only at the very start of the scroll, where nothing is anchored —
      // the reader is at January's first day and stays there.
      const absorbing = next.lo < win.lo && inMotion && !widthExact(next.lo)
      if (absorbing && next.lo > 0) {
        const g = stripGeoRef.current
        absorbRef.current = g && g.spans[win.lo] ? { month: win.lo, left: g.spans[win.lo]!.left } : null
      }
      if (next.lo !== win.lo && !(inMotion && coarsePointer()) && !absorbing) {
        const wrap = wrapRef.current
        if (wrap) { anchorRef.current = anchorNow(wrap); colShiftRef.current = true }
      }
      setColWin(next) // re-runs this effect, which schedules the next beat
    }
    kickFillRef.current = () => { if (live) schedule() }
    schedule()
    return () => {
      live = false
      kickFillRef.current = () => {}
      if (fillIdleRef.current != null) { drop(fillIdleRef.current); fillIdleRef.current = null }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, colWin?.lo, colWin?.hi, months.length])

  // SHRINK ON LEAVE, REBUILD ON RETURN (owner, 5 Sep 26). Desktop only — the
  // phone already windows. When the tab is LEFT, drop the drawn window back to a
  // few months around where the reader was, so the next reveal wakes a small
  // grid (the fill above then rebuilds the year once the tab is shown again, its
  // left-anchor keeping the reader's month in place as the earlier months fill in
  // behind them). Only on a real on→off / off→on transition, never on the first
  // mount (a fresh pre-warm mount is left to the fill's hidden cap; a direct
  // visit is left to fill the year). The signal is a listener set, not the store,
  // so none of this re-renders the grid (state/screen.ts).
  const prevOnRef = useRef(onScreenRef.current)
  useEffect(() => {
    const apply = () => {
      const on = isLwOnScreen()
      const prev = prevOnRef.current
      prevOnRef.current = on
      onScreenRef.current = on
      if (phone) return
      const win = colWinRef.current
      if (!win) return                       // short war drawn whole — nothing to window
      if (on) { if (!prev) kickFillRef.current(); return } // shown → resume filling the year
      if (!prev) return                      // already hidden at mount → the fill's cap handles it
      // on → off: shrink around the reader's month. The months dropped become
      // placeholders at their MEASURED widths, so nothing moves and the scroll
      // position is exactly where the reader left it on return — the fill then
      // re-expands from there.
      const last = months.length - 1
      const view = Math.max(0, Math.min(viewMonthRef.current, last))
      const small = clampWin({ lo: view, hi: view + HIDDEN_MONTHS - 1 }, months.length)
      if (small.lo !== win.lo || small.hi !== win.hi) {
        anchorRef.current = null
        colShiftRef.current = false
        setColWin(small)
      }
    }
    apply()
    return subLwScreen(apply)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, months.length])

  // Everything else that moves a column edge, and so invalidates the cached
  // strip geometry: a zoom step (every width changes), a row-set reflow (the
  // hidden rows' chips were widening columns — the very thing anchorRef exists
  // to compensate), and a viewport resize (the wrapper's own width and the
  // frozen columns both change). Layout effect so the re-measure lands in the
  // same frame as the change that caused it, before any scroll can read a
  // stale cache. The strip is re-read straight after, so the readout is right
  // immediately rather than at the next scroll event.
  useLayoutEffect(() => {
    // The placeholders FIRST, from the cache and the estimate, so the drawn
    // months are measured at their final positions (a left placeholder shifts
    // everything after it); measureStripGeo writes them again once it has cached
    // the widths it just measured. measureHbar/syncHbar too: the proxy spacer
    // tracks the grid's scroll width and the thumb its position.
    /* a first measure at a new war or zoom swaps estimates for measured widths, which can move the drawn months under
       the geometry it just took — taken once more then, so the month readout and the fill read where the months ARE */
    const remeasure = () => {
      applyPlaceholders()
      const k0 = avgDayWRef.current?.key
      measureStripGeo()
      if (avgDayWRef.current?.key !== k0) measureStripGeo()
      measureStrip(); measureHbar(); syncHbar()
    }
    remeasureRef.current = remeasure
    remeasure()
    // A left month drawn mid-fling over an estimate (padErrRef): how far it pushed the month that was the window's left
    // edge is taken off the left placeholder, and the strip re-read — all before this frame paints, so no column on
    // screen ever moved.
    const ab = absorbRef.current
    absorbRef.current = null
    const span = ab ? stripGeoRef.current?.spans[ab.month] : undefined
    if (ab && span) {
      const d = span.left - ab.left
      if (Math.abs(d) > 0.5) { padErrRef.current += d / zoom; remeasure() }
    }
    window.addEventListener('resize', remeasure)
    return () => window.removeEventListener('resize', remeasure)
    // The window's EDGES are deps, not only the drawn-day count: two windows a
    // month apart can hold the same number of days (Mar+Apr and May+Jun both
    // span 61), and the placeholders and spans would be a month off.
    // `arranging` (6 Sep 26): Rearrange widens the frozen name column, which
    // moves every day column's edge and the grid's scroll width.
    // `figuresOpen` AND `drawerAt?.width` (6 Sep 26, review): the FIGURES
    // drawer moves the frozen EDGE — `frozenWidth` reads the drawer while it is
    // open — and this effect is the only thing that re-measures it into
    // `stripGeoRef.current.frozen`, which `measureStrip` then reads on every
    // scroll event. Without a dep, the strip readout (and the `visibleSpan` the
    // fill engine's rolling target follows) goes on using the width it last
    // cached — the closed pair's, ~250px too far left on a desktop — until an
    // unrelated zoom, resize, war change or window edge happens to refresh it.
    // The self-heal in `measureStrip` cannot cover it: it only fires when the
    // cache is null, and here it is merely stale.
    //
    // `figuresOpen` alone was not enough, and the shape of the miss is the
    // lesson: it catches the drawer APPEARING but not the drawer CHANGING
    // WIDTH while it is out — an admin hiding a figure in the picker, or the
    // undo of that hide, takes a column off or puts one back and the cached
    // edge stays a column short. So the canonical signal is the measured width
    // itself: `drawerAt` is value-guarded (its own effect only publishes a new
    // object when a number really moved), so this dep fires on every real edge
    // move — including the ones nobody has thought of yet — and on none of the
    // renders in between. `figuresOpen` stays beside it because it is what
    // takes the width back to `undefined` on close.
    // `widthGen` (23 Sep 26, Astra LW-102): anything that can widen a drawn
    // column — a chip, an event, the manning rows — moves every month edge
    // after it, and this is the only thing that re-measures them (and stamps
    // the drawn months' widths as exact under the new rows). The Archive's
    // change never reaches a render, so `onArchiveChange` calls it directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, visWindow, period.id, drawnDates.length, colWin?.lo, colWin?.hi, arranging, figuresOpen, drawerAt?.width, widthGen])

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
    // A month-strip jump that had to draw its month first lands here, in the
    // commit that drew it: the scroll the jump could not make yet.
    const pj = pendingJumpRef.current
    if (pj) {
      pendingJumpRef.current = null
      anchorRef.current = null
      const wrap = wrapRef.current, cell = headCell(pj)
      if (wrap && cell) {
        jumpAtRef.current = Date.now()
        wrap.scrollLeft += cell.getBoundingClientRect().left - wrap.getBoundingClientRect().left - frozenWidth(wrap)
      }
      return
    }
    const a = anchorRef.current
    anchorRef.current = null
    const colShift = colShiftRef.current
    colShiftRef.current = false
    if (!a) return
    const wrap = wrapRef.current
    const cell = headCell(a.date)
    if (!wrap || !cell) return
    const coarse = coarsePointer()
    // The window has to hold the programmatic scroll, the 120ms rest debounce
    // and the grid's repaint; 1200ms is comfortably clear of all three and
    // still far shorter than the gap before a deliberate follow-up flick.
    const fromJump = Date.now() - jumpAtRef.current < 1200
    if (coarse && !fromJump && !colShift) return
    const shift = cell.getBoundingClientRect().left - a.left
    if (Math.abs(shift) > 1) wrap.scrollLeft += shift
  }, [visWindow, colWin?.lo, colWin?.hi])

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
      //   The floor is 44 of the grid's own px at normal size and below, as it always was — but zoomed IN it is 44 on
      // the SCREEN ([LW-PHONE-PINCH-ZOOM], the walk of 23 Oct 26): the strip cancels the grid's zoom, so a floor in the
      // grid's units grew with the zoom and left a tall empty band under the month buttons (62 px at 1.4, where the
      // buttons need 41) — reached by the old + too, everyday once the grid is pinched.
      const z = zoom || 1
      setStripH(Math.max(z > 1 ? 44 / z : 44, (sr.bottom - cr.top + 6) / z))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [zoom, period.id, drawnDates.length])

  // ---- the OPEN-DATES outline (owner, 1 Sep 26; D881 no glow; D1177 one per stretch) ----
  // A dark-green outline around the columns open for bidding, so it is obvious
  // at a glance which dates the squadron may bid on — ONE BOX PER OPEN STRETCH
  // since the stages went (D1177: "the open days keep today's green outline").
  // Nothing open, no box (empty means closed — the red team's B2). A member's
  // outline starts at today (D1211's reading): he never bids before it. The
  // owner chose the deeper, more faded green over a brighter one.
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
  type BidBox = { key: string; left: number; top: number; width: number; height: number; cutL: boolean; cutR: boolean }
  const [bidBoxes, setBidBoxes] = useState<BidBox[]>([])
  const measureBidBox = () => {
    const wrap = wrapRef.current, head = headRef.current
    if (!wrap || !head) return
    const none = () => setBidBoxes(prev => (prev.length ? [] : prev))
    /* only the open days from today, for the admin as for a member (owner D1269, 23 Oct 26 — D1268's rule on the grid):
       a stretch wholly past has no outline; the window still lists it, reading "past" */
    const stretches = openFrom(period, memberToday())
    if (stretches.length === 0 || drawnDates.length === 0) return none()
    // Only the drawn part is measurable. A bound outside the window cuts that
    // side of its box (matrix.css .cut-l / .cut-r) — no false edge at the seam.
    const first = drawnDates[0]!, last = drawnDates[drawnDates.length - 1]!
    const table = wrap.querySelector<HTMLElement>('table.mx')
    if (!table) return
    const wr = wrap.getBoundingClientRect()
    if (wr.width === 0) return // jsdom / not laid out — leave it empty
    const hr = head.getBoundingClientRect(), tr = table.getBoundingClientRect()
    const next: BidBox[] = []
    for (const s of stretches) {
      if (s.to < first || s.from > last) continue
      const a = s.from < first ? first : s.from, b = s.to > last ? last : s.to
      const fh = headCell(a), lh = headCell(b)
      if (!fh || !lh) continue
      const fr = fh.getBoundingClientRect(), lr = lh.getBoundingClientRect()
      if (fr.width === 0) continue
      // Content coordinates (add scrollLeft so the value is stable wherever the
      // grid is scrolled — the browser re-offsets the absolute child as it
      // scrolls). The header tbody top is the month-bracket row; each box runs
      // from there to the foot of the roster.
      const left = fr.left - wr.left + wrap.scrollLeft
      next.push({ key: s.from, left, top: hr.top - wr.top, width: lr.right - wr.left + wrap.scrollLeft - left, height: tr.bottom - hr.top, cutL: s.from < first, cutR: s.to > last })
    }
    /* bail when nothing moved — the effect below runs on every store commit, and an unchanged box must not repaint */
    setBidBoxes(prev => (prev.length === next.length && prev.every((p, i) => {
      const n = next[i]!
      return p.key === n.key && p.left === n.left && p.top === n.top && p.width === n.width && p.height === n.height && p.cutL === n.cutL && p.cutR === n.cutR
    }) ? prev : next))
  }
  measureBidBoxRef.current = measureBidBox // this render's, for `onArchiveChange`
  useLayoutEffect(() => {
    measureBidBox()
    window.addEventListener('resize', measureBidBox)
    return () => window.removeEventListener('resize', measureBidBox)
    // `version` is here because the box's HEIGHT is the whole table's: any
    // store change that adds or removes a ROW while a war is open — a counter
    // built or deleted, a member joining the roster, a CAT sub-heading
    // appearing — changes the table's height with every other dep unchanged,
    // and the box read one row short/long until the next zoom or resize
    // (bug-hunt fix, 1 Sep 26). Re-measuring on every store commit is four
    // rect reads against an identity-guarded setState — nothing next to the
    // repaint that same commit already paid for. The window's EDGES are deps
    // too, not only the drawn-day count (same reason as the strip effect
    // above: Mar+Apr and May+Jun both span 61 days, and the box is placed off
    // the first and last drawn day — bug-hunt fix, 6 Sep 26).
    // `figuresOpen` (6 Sep 26): the drawer grows the header row to 62px, so the
    // table is that much taller and the box would stand a header short.
    // `arranging` (7 Sep 26): Rearrange WIDENS the frozen name column
    // (`.mx-arranging` re-sets `--who-w`), pushing the day columns right — so
    // the box's LEFT edge, placed off the first day's header cell, must be
    // re-measured or it stays at its narrower-column position and hides behind
    // the now-wider frozen columns (z 2/3 paint over the box's z 1). The
    // owner saw exactly this: the left green border gone in Rearrange, the
    // right one fine (its edge is far from the frozen columns). Its two sibling
    // measure effects (the month strip, the frozen-mirror geometry) already
    // carry `arranging` for the same reason; this one had been missed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, period.id, openSig, role, zoom, visWindow, drawnDates.length, colWin?.lo, colWin?.hi, countsOpen, folded, figuresOpen, arranging])

  // iOS WebKit settles the frozen-column width change a FRAME LATER than the
  // synchronous layout-effect above reads it: on LEAVING Rearrange the column
  // shrinks back (`--who-w`), but WebKit still reported the wider geometry when
  // the effect measured, so the box kept its wider left and its edge sat
  // displaced INTO the grid until the next scroll (owner, 7 Sep 26 — "after I
  // close rearrange icon I get this green border displaced"). Re-measure on the
  // next two frames, when the reflow has landed. The identity guard inside
  // `measureBidBox` (setBidBox bails when nothing moved) makes this a no-op
  // wherever the synchronous read already settled — Chromium here measures the
  // final geometry at once, so this only ever CORRECTS a stale read, never adds
  // a render. Keyed on `arranging` so it costs two frames on the toggle only.
  // (No WebKit in this container — verified not to regress Chromium; the fix
  // rides the owner's iPhone check.)
  useEffect(() => {
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => { measureBidBox(); raf2 = requestAnimationFrame(measureBidBox) })
    return () => { cancelAnimationFrame(raf1); if (raf2) cancelAnimationFrame(raf2) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arranging])

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
  //
  // Two overlays need this now — the phone's frozen band and the figures
  // drawer (6 Sep 26) — so it takes the overlay, the box its twins live in and
  // the attribute naming each twin. The band's twins are the roster rows alone
  // (`rosterBodyRef`); the drawer also copies the EVENT rows, which sit in
  // their own tbody, so it hands over the whole table.
  const syncOverlayHeights = (overlay: HTMLElement | null, body: HTMLElement | null, keyAttr: string) => {
    if (!overlay || !body) return
    const rows = Array.from(overlay.querySelectorAll<HTMLTableRowElement>(`tbody.mxbody > tr[${keyAttr}]`))
    const want = rows.map(tr => {
      const key = tr.getAttribute(keyAttr)
      const real = key ? body.querySelector<HTMLElement>(`[data-testid="${key}"]`) : null
      return real ? real.getBoundingClientRect().height : 0
    })
    // jsdom reports every rect 0x0, and a row the window has filtered out has
    // no real twin at all; a 0 written here would collapse the overlay rather
    // than align it, so an unmeasurable row is left exactly as it was.
    rows.forEach((tr, i) => { if (want[i]! > 0) tr.style.height = `${want[i]! / zoom}px` })
  }
  const syncBandHeights = () => syncOverlayHeights(bandRef.current, rosterBodyRef.current, 'data-band-key')
  const syncDrawerHeights = () =>
    syncOverlayHeights(drawerRef.current, wrapRef.current?.querySelector<HTMLElement>('table.mx') ?? null, 'data-drawer-key')

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
  }, [bandActive, zoom, visWindow, period.id, drawnDates.length, countsOpen, folded])

  // ---- where the DRAWER sits (owner, 6 Sep 26) ------------------------------
  //
  // The same discipline as the band, one row higher: the drawer hangs off the
  // real HEADER row (not the roster), because it covers the header's day cells
  // with its own sideways titles. Four numbers, all measured: the header row's
  // top and the names column's right edge (where the closed counter column
  // begins, so the drawer's first column lands exactly on it and no box moves
  // when it opens), the header row's height (the real row GROWS to 62px for the
  // titles via `.mx-figures`, so the drawer is told what that came to rather
  // than repeating the arithmetic), and the drawer's own width and column
  // widths, which the stuck header's frozen copy needs to grow to match.
  //
  // The `.who` cell is read at whatever the sideways scroll has left it at —
  // it is sticky, so its right edge is the column's width wherever the year
  // sits. Heights come back as VISUAL pixels (the table wears the grid's
  // zoom), so `headH` divides it back out for a row inside the drawer's own
  // zoomed table, while `left`/`width` stay visual: the drawer's box is a plain
  // absolute div in `.mx-outer`, outside any zoom.
  useLayoutEffect(() => {
    if (!figuresOpen) { setDrawerAt(null); return }
    const measure = () => {
      const outer = mxOuterRef.current, head = headRef.current, drawer = drawerRef.current
      if (!outer || !head || !drawer) return
      const headRow = head.querySelector<HTMLElement>('tr:last-child')
      const who = headRow?.querySelector<HTMLElement>('th.who')
      if (!headRow || !who) return
      const hr = headRow.getBoundingClientRect(), o = outer.getBoundingClientRect()
      if (hr.height === 0) { setDrawerAt(null); return }   // jsdom / not laid out
      const next = {
        top: hr.top - o.top,
        left: who.getBoundingClientRect().right - o.left,
        headH: hr.height / zoom,
        width: drawer.getBoundingClientRect().width,
        cols: Array.from(drawer.querySelectorAll<HTMLElement>('th.fig')).map(th => th.getBoundingClientRect().width),
      }
      // Value-guarded: this runs from a ResizeObserver, and a fresh object every
      // time would re-render the grid on its own echo.
      setDrawerAt(prev => (prev && prev.top === next.top && prev.left === next.left && prev.headH === next.headH &&
        prev.width === next.width && prev.cols.length === next.cols.length && prev.cols.every((w, i) => w === next.cols[i])
        ? prev : next))
      syncDrawerHeights()
    }
    measure()
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null
    if (ro && mxOuterRef.current) ro.observe(mxOuterRef.current)
    window.addEventListener('resize', measure)
    return () => { ro?.disconnect(); window.removeEventListener('resize', measure) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [figuresOpen, zoom, visWindow, period.id, drawnDates.length, countsOpen, folded, figures.length, arranging])

  // How wide the drawer came out, in the GRID's own pixels, published to the
  // stylesheet as `--drawer-w` — read by the month-bracket LABEL, which sticks
  // "just clear of the frozen columns" and has to be told that the frozen part
  // is now the drawer (`.mx-figures` override of `.brakl`, matrix.css). Without
  // it the label kept the closed pair's offset: on a desktop, where the drawer
  // opens open, it sat over the drawer's own columns un-stuck and vanished
  // under the opaque frozen copy of the stuck bar (6 Sep 26 review).
  //
  // A custom property on `.mx-outer` restyles the whole grid, and the standing
  // rule (CLAUDE.md, the column window) is that one must never ride a FRAME.
  // This one rides a MODE: `drawerAt` is value-guarded, so this runs on
  // open/close, a zoom step and a resize — the same taps that already toggle
  // `mx-figures` on this very node. A per-frame value must never join it here.
  useLayoutEffect(() => {
    const outer = mxOuterRef.current
    if (!outer) return
    if (!figuresOpen || !drawerAt) { outer.style.removeProperty('--drawer-w'); return }
    // Visual px in, grid px out: `--who-w` and the label's `left` live inside
    // the zoomed table, and the drawer's own box does not.
    outer.style.setProperty('--drawer-w', `${drawerAt.width / zoom}px`)
  }, [figuresOpen, drawerAt, zoom])

  // Re-pinned on EVERY render, not on a dependency list: a bid placed, a
  // decision made or a figure switched can put a chip into a day cell or take
  // one out, which moves that row's height by the pixel above — and there is
  // no cheap signal for "some cell's content changed". It is affordable
  // precisely because this component does NOT re-render on scroll (the reason
  // the overlay exists), so this runs on real edits, not on frames. Layout
  // effect, so the heights land in the same frame as the rows they answer.
  useLayoutEffect(() => {
    if (bandActive) syncBandHeights()
    if (figuresOpen) syncDrawerHeights()
  })

  /* The landing flash, in the SAME commit as the reorder (a dep list would run
     a frame late, an rAF after cfg.move() is not ordered against React's
     scheduler). Grid: the moved <tr> — keyed rows MOVE, they do not remount —
     measured against the outer and the wrap's visible span, exactly as at arm.
     List: the Settings row, found OUTSIDE the wrap because the grid's heading
     shares its data-grow. */
  useLayoutEffect(() => {
    const land = landRef.current
    if (!land) return
    landRef.current = null
    const outer = mxOuterRef.current, wrap = wrapRef.current
    if (land.surface === 'grid') {
      const row = wrap?.querySelector<HTMLElement>(land.sel)
      if (row && outer && wrap) frameLand(liftRef.current, boxOf(outer, row, wrap))
      return
    }
    const el = [...document.querySelectorAll<HTMLElement>(land.sel)].find(n => !wrap || !wrap.contains(n))
    // landOn takes `lift` and `lift-land` off itself before re-adding, so there
    // is nothing to clear first (review, 6 Sep 26 — the liftOff here was dead).
    if (el) landOn(el)
  })

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
    const roster = displayRoster().filter(p => rowInWindow(p, visWinRef.current, rowSpans))
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

  // The DRAWER's rows, in the same grid order, each keyed to the real row's own
  // testid so its height can be copied across (`syncOverlayHeights`). The
  // drawer starts at the header row, so what it covers is the event lines and
  // then the roster — an event line and a heading show one empty box across the
  // block, since neither has a figure. Read from `rosterSequence` for the same
  // reason the band does: one order, so the two cannot fall out of step.
  const drawerRows = (): DrawerRow[] => [
    ...Array.from({ length: eventRows }, (_, line) => ({ kind: 'blank' as const, key: `event-row-${line}` })),
    /* (The four Required / Available rows — FlyRows.tsx — are NOT here: they sit at the foot of the Manning block
       (D665), above where the drawer starts. While they sat in the Events block, for a few hours on 8 Oct 26, each
       needed a box here or every roster row in the drawer stood four rows too high — a row added to that block does.) */
    /* Each row's Rearrange landing mark, by the SAME tests as its real row in the roster <tbody> below (the group
       heading's `dragOver === g`, the person row's `over`), so the line reads across the drawer too (owner D883). */
    ...rosterSequence().map((item): DrawerRow =>
      item.kind === 'group' ? {
        kind: 'group', key: `group-${item.g}`, folded: folded.has(item.g),
        over: dragOver === item.g && draggingId !== item.g ? (dragAfter ? 'dragover after' : 'dragover') : '',
      }
        : item.kind === 'catsub' ? { kind: 'catsub', key: `subcat-${item.g}-${item.cat}` }
          : {
            kind: 'person', key: `row-${item.p.id}`, p: item.p, me: item.p.id === viewer,
            over: draggingId && dragOver === item.p.id && draggingId !== item.p.id ? (dragAfter ? 'dragover after' : 'dragover') : '',
          }),
  ]

  // The under-manned list asks for a day the same way the month strip asks
  // for a month, through the one `jumpTo` above — so a target lands clear of
  // both frozen columns without that measurement existing twice.
  //
  // Keyed on `focusSeq` rather than `focusDate`: choosing the same day again
  // has to snap back to it after the grid has been dragged away, and a date
  // alone cannot express that. jsdom reports every rect as 0, which makes the
  // jump a harmless no-op there; the browser gate is what proves it moves.
  //
  // THE SOFT ASK (owner, D670, 8 Oct 26 — "if the change was already in view for the undo and redo, the screen should
  // just remain there … instead of snapping the change to the left of the screen"): an Undo or a Redo asks with
  // `focusSoft`, and the grid then moves only when the day's column is NOT wholly on screen (ui/inview.ts) — its month
  // not drawn, the column under the frozen names, or off either edge. Every plain ask still jumps.
  useEffect(() => {
    if (!focusDate) return
    /* the day clock's ask (D1266): the mark moves, the view stays — never a jump away from where he scrolled */
    if (focusQuiet) return
    if (focusSoft) {
      const wrap = wrapRef.current, cell = headCell(focusDate)
      if (wrap && cell && columnInView(cell.getBoundingClientRect(), wrap.getBoundingClientRect(), frozenWidth(wrap))) return
    }
    jumpTo(focusDate)
    /* …AND OPENED FOR ONE PERSON, where the ask said so — the clash note's tap (D827; state/store.ts takeFocusOpen).
       The very call a tap on his cell makes (`rowApi.setOpen`), so the sheet that opens — the bid's, the day's list,
       a posting's — is the one that tap would open, decided there and not here. Taken once: a later draw opens
       nothing. Someone no longer on the roster is jumped to and nothing more. */
    const who = takeFocusOpen(focusDate)
    const p = who ? people.find(x => x.id === who) : undefined
    if (p) rowApi.current.setOpen({ id: p.id, callsign: p.callsign, date: focusDate })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSeq, focusDate])

  // Every "may this be bid on" question goes through the store's `canBidOn` — the day open in the period holding it,
  // a member's today, his own row (D1177, D1211) — the same one body every write asks.
  const deciding = canDecide(role)

  // The dotted "moved" mark shows on ANY move of a leave already approved (D1177's reading — no longer only once
  // bidding closed). The store gates the RECORD: a bid that only waits stores no trail when it moves, so the mark
  // appears exactly where an approved leave was moved.
  const movedShown = true

  // THE REMARKS EDITOR — A MEMBER'S OWN APPROVED LEAVE, AT ANY TIME (D418 narrowed by D1177: "a member's approved leave
  // offers only its remarks, any time; the leave itself he changes on the Inputs page, D1166"). It was the published
  // stage's (owner, 27 Aug 26), and there it took an admin's tap too; with nothing frozen now an admin's tap on approved
  // leave opens the sheet that changes it (send back, move, delete — D1177: he decides at any time), not a remarks-only
  // editor that would hide those (the scenario designer's S6). `viewer` is the signed-in person; `leaveInputAt` runs
  // once per open cell, never per grid cell.
  const remarkRow = open && role !== 'admin' && open.id === viewer
    ? leaveInputAt(open.id, open.date, grid[open.id]?.[open.date])
    : null
  /* THE ADMIN'S APPROVED LEAVE (M1's code read, L6; his D1307): his tap opens the decide window, which shows the leave's
     Remarks and Document at once — the input they are saved onto (D418 narrowed by D1177) */
  const adminNoteRow = open && role === 'admin' && states[open.id]?.[open.date]?.state === 'approved'
    ? leaveInputAt(open.id, open.date, grid[open.id]?.[open.date])
    : null
  /* [ARCH-STACK] step 4 — a day holding more than one record (the corner
     mark), or leave dated outside the person's time in the squadron (owner
     answer C), opens THE TAP LIST: every record on its own line with its own
     actions (design §25 OA10-001). It comes before every single-record sheet
     below, which stay exactly as they were for a one-record day. */
  const openView = open ? views[open.id]?.[open.date] : undefined
  /* …AND A DAY HOLDING A UNA (D1338): everyone may read it — its half, who placed it, its remarks — and an admin takes it
     away there; the list is the one window that shows every entry of a day on its own line, so a UNA alone opens it too */
  const listOpen = !!open && !!openView && (openView.mark !== '' || openView.all.some(c => c.kind === 'una') ||
    (!!openPerson && !inSquadron(openPerson, open.date) && !!openView.main && codeOf(openView.main.code)?.spends != null))
  /* …but on a day OPEN for him, beside half a day of leave — filed on the Inputs page or approved on the war — the free
     half's bid comes first (the free-half rule, CURRENT-STATE item D — found by the screen-test helper, 22 Oct 26; for
     war-approved leave by M1's code read, M2: `main` opened the bid window there): remarks at any time must not hide the
     half he may still bid on. Its remarks are reached from the Inputs page then. */
  const canRemark = !listOpen && !!remarkRow
    && !(open && canBidOn(open.id, open.date) && freeHalfBeside(openView))
  /* THE FREE HALF BESIDE INPUTS-FILED LEAVE (CURRENT-STATE item D). When the
     cell is locked to the Inputs page but only HALF of it is actually spoken
     for, the tap opens the bid picker on the free half instead of the
     read-only sheet — with the locked half named on it, so nothing about the
     lock becomes invisible. Everything else about a Raptor-owned cell is
     unchanged: both halves held, or nobody who may edit, and the read-only
     sheet opens exactly as it did. */
  /* The OIL AWARD on the open cell, for the +OIL panel to name and change — when the day holds exactly ONE (a day
     holding several is changed from the day's list, one at a time; `openAwards` counts them). A credit the published
     schedule earned is the schedule's to change. Awards are ledger entries drawn on the day ([OIL-AWARD-IS-A-GRANT]). */
  const openAwards = open ? awardsOnDay(open.id, open.date) : []
  const openCredit = openAwards.length === 1 ? oilOnDay(open!.id, open!.date).find(c => c.award) : undefined
  /* EVERY credit on the open cell, schedule's first, then the awards — what the day window reads back on one click
     (owner, 21 Sep 26). The read-only schedule sheet reads the SCHEDULE's own (Fable's plan read N3). */
  const openOil = open ? oilOnDay(open.id, open.date) : []
  const openAnyCredit = openOil[0]
  /* A DAY THE SCHEDULE HAS ALREADY EARNED ON STILL TAKES AN AWARD (N16,
     21 Sep 26). The owner ruled the two add up and that the same two facts
     must not be kept or lost depending on which was entered first. The STORE
     obeys that — but the screen did not: a day holding only the schedule's
     credit reads as Raptor's, so the tap opened the read-only sheet, which
     has no +OIL control and no other door offers one. Award-then-publish
     worked; publish-then-award was unreachable, so half the ruling existed
     only in the tests. Found by review and confirmed in the running app.
     Admin only, and only when the day holds no LEAVE the Inputs page owns —
     that cell is still the Inputs page's to change. */
  const openWorkOnly = !!open && !!openView && role === 'admin'
    && openView.all.length > 0 && openView.all.every(c => c.kind === 'credit')
    && !openView.all.some(c => c.kind === 'credit' && !c.auto)
  const openFreeHalf = open && raptorOwns(states, open.id, open.date)
    && canBidOn(open.id, open.date)
    ? freeHalfBeside(openView)
    : null

  // Which sheet a click opens follows from three things: whether the day is open for this person, the role, and what
  // the cell already holds.
  //
  // A cell Raptor owns always opens, at every stage and for either role, but
  // only ever onto the read-only sheet — a member who cannot edit anything
  // still deserves to be told why that particular cell is green and why
  // nothing here will change it.
  //
  // Deciding needs an existing bid to decide: a course, a sick day and an
  // empty cell are all things nobody asked for.
  // "Does a tap here open something" lives in `cellOpenable` (module level, the
  // row's own body) — the comment block above is its rationale.

  // THE CLOSED DAYS DIM, WITH A SMALL LOCK ON THEIR DATE, WHILE ANYTHING IS OPEN (D1177's reading — "with nothing open
  // the grid shows as normal"). A member's view: the stretches from his today (D1211); nothing open for him — no dim.
  // A Set per store change rather than a predicate per cell (3 Sep 26): the
  // cells asked this ~18,000 times per build, once per person per day, when
  // the answer only varies by DAY — 365 answers. Also a stable row prop. The
  // role is a key too: the admin's member view changes the answer without a store change (the scenario designer's S34).
  const lockedCols = useMemo(() => {
    const out = new Set<string>()
    /* NOT FOR THE ADMIN — measured (22 Oct 26, M1's speed check): faded on his screen too, thousands of cells drawn at
       half strength slowed his tap on a cell about threefold on a desktop (0.77 s → 2.3 s, CPU 4×), and the open dates
       do not bind him; the green outline already shows him what is open. As before the open dates: a member's only. */
    if (role === 'admin') return out
    const visible = { open: openFrom(period, memberToday()) }
    if (!visible.open.length) return out
    for (const d of period.days) {
      let on = false
      for (const s of visible.open) if (s.from <= d.date && d.date <= s.to) { on = true; break }
      if (!on) out.add(d.date)
    }
    return out
    /* keyed on what it reads — the period (its open dates), the role and today (D1266: a new day replaces it) — never on
       every store change ([LW-MONTH-MEMO-UNPINNED], M3 §4) */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, role, memberToday()])
  const lockedDate = (date: string): boolean => lockedCols.has(date)

  // Feed the drag-select controller live state. A member drags on his own row at any time since the stages went
  // (D1177): a fill writes only his open days from today and counts the rest skipped; a Delete over days since closed
  // takes his own pending bids there (D1225). An admin drags anywhere.
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
    dates: () => drawnDates,
    enabled: () => !arranging && !moveSel && !eventMoveSel,
    onSelect: s => { flyPickRef.current?.close(); if (selRef.current) selFlushRef.current?.(); setSel(s) },
    // Events are the admin's (the store refuses a member write anyway); a drag
    // along one event line opens the event sheet pre-set to that date span
    // (owner, 27 Aug 26). from === to (a one-cell drag) opens on the single day.
    eventsEnabled: () => role === 'admin' && !arranging && !moveSel && !eventMoveSel,
    onEventSelect: s => { flyPickRef.current?.close(); setSel(null); setEventEdit({ line: s.line, date: s.from, to: s.from === s.to ? undefined : s.to }) },
    // The Required rows are the admin's to type (the scheduler's command gate refuses a member anyway); a drag over
    // them opens the Required panel for the picked block (owner, D636, D637), and closes the people's-days panel.
    reqEnabled: () => role === 'admin' && !arranging && !moveSel && !eventMoveSel,
    onReqSelect: s => { setSel(null); flyPickRef.current?.pick(s) },
    // The days begin past the frozen block — the name/counter pair, or the
    // drawer while it is open (frozenWidth is already drawer-aware).
    //   No wrap means nothing to measure, and `0` would be a LIE the band could
    // act on — a real client-x at the screen's left edge. `-Infinity` is the
    // only value that reads as "no left band", and the `??` at the wiring site
    // cannot rescue it for us: `0` is not nullish, so it would pass straight
    // through (review, 6 Sep 26).
    leftEdge: () => { const w = wrapRef.current; return w ? w.getBoundingClientRect().left + frozenWidth(w) : -Infinity },
  }

  // ...and the FIGURE drag the same way (owner, 6 Sep 26): a run of people down
  // one figure column, for the docked balance bar. The admin's alone — a member
  // never keys a balance — and never while another gesture holds the grid.
  figSelCtxRef.current = {
    order: () => rosterSequence().filter(r => r.kind === 'person').map(r => (r as { p: Person }).p.id),
    selectable: id => selectableFigure(figures.find(f => f.id === id)),
    enabled: () => role === 'admin' && !arranging && !moveSel && !eventMoveSel,
    // A second drag in the SAME pool adds to the selection; one in another pool
    // starts over (owner, 6 Sep 26 — one pool per drag).
    onSelect: s => setFigSel(prev => (prev && prev.fig === s.fig ? { fig: s.fig, ids: [...new Set([...prev.ids, ...s.ids])] } : s)),
  }
  // The selection in roster order, and its figure — consumed by the balance bar
  // (Task 3), which is where they are read; computed here because this is where
  // the roster order and the live figure list are. A figure hidden after the
  // drag, or a person gone from the roster, drops out.
  const figSelFigure = figSel ? figures.find(f => f.id === figSel.fig) : undefined
  const figSelIds = figSel ? figSelCtxRef.current.order().filter(id => figSel.ids.includes(id)) : []
  const csOf = (id: string): string => displayRoster().find(p => p.id === id)?.callsign ?? id

  return (
    <div className="stage">
      <div className="card" ref={cardRef}>
        {/* ONE compact row (owner, 5 Sep 26 — "all in 1 row to minimise row
            height space"): Manning · ⚙ · Rearrange on the left, OIL tracker on
            the right. The old "JAN – DEC 26 · 365 days · 50 people" line was
            dropped (owner, same day); the war's NAME still lives in the Period
            picker in the page chrome above, so nothing is stranded. */}
        {/* THE GRID'S OWN BAR (D1254 — the navigation as drawn in round 19): [▸ Manning | 1 red ›] · the open dates · … ·
            Legend, the same for everyone (`StageBar`, Chrome.tsx). ⚙ went up to the tab row's right end and OIL became a
            tab (Chrome.tsx `Topbar`); Rearrange moved into ⚙ (its "Done" rides this bar while it is on). The zoom pair
            went when pinch to zoom replaced it ([LW-PHONE-PINCH-ZOOM], D1228, D1276). */}
        {/* the day panel (M3 batch 6): its open day is its own (DayPanel.tsx) — this grid never repaints for it */}
        <DayPanelHost />
        <div className="card-hd">
          {bubble && !bubble.foot && <div className={`mn-bubble mnb-${bubble.lv}`} data-level={bubble.lv} role="status" data-testid="manning-bubble">{bubble.text}</div>}
          {/* D1277: the Manning button out of view when it was raised — the same words at the foot of the screen, with Show */}
          {bubble?.foot && (
            <div className={`mn-foot mnb-${bubble.lv}`} data-level={bubble.lv} role="status" data-testid="manning-bubble-foot">
              <span data-testid="manning-bubble-text">{bubble.text}</span>
              <button type="button" className="mn-show" data-testid="manning-bubble-show" onClick={showManning}>Show ›</button>
            </div>
          )}
          <StageBar
            manningOpen={countsOpen || (arranging && role === 'admin')}
            onManning={toggleManning}
            extra={
              <>
                {arranging && role === 'admin' && (
                  /* THE ONE WAY OUT OF REARRANGE (owner, 6 Sep 26 — the toggle is the way in and out; D1254 put the way in
                     inside ⚙): lit while the drag handles are on, a tap leaves */
                  <button
                    className="rtbtn on"
                    data-testid="roster-arrange"
                    aria-pressed="true"
                    aria-label="Finish rearranging the roster"
                    title="Finish rearranging — tap to leave"
                    onClick={() => setArranging(false)}
                  >
                    {/* "Done" in words at every width (D1275 — on a phone too, narrowing D1019's short words for this one
                        button): its own class, never the droppable `.rtlbl` the phone hides */}
                    ⇅<span className="rtword"> Done</span>
                  </button>
                )}
                {/* No − / + here any more: the grid is pinched (a desktop: Ctrl+scroll), owner D1276 / D1228 — they went
                    once the pinch carried the frozen date row with the grid. Should his iPhone look find the frozen row
                    off its columns after a pinch, they come back before merge (D1282's reading). */}
              </>
            }
          />
        </div>
        {/* The on-grid REARRANGE BAR (3 Sep 26: "⠿ Rearranging — drag people…",
            Auto-sort, Done) is GONE (owner, 6 Sep 26 — "delete this whole blue
            section when rearrange is selected. Auto sort will be removed"). The
            header toggle above is the way in and out; the store's
            `autoSortRoster` stays for the tests and a future home. Don't bring
            the strip back — it cost a row of height on a phone for a sentence.
            `mx-arranging` (admin Rearrange) widens the frozen NAME column by the
            grip's footprint so callsigns read whole beside the ⠿ (owner, same
            day — "the CS/name will not be causing the puck names to be
            shortened … same as before rearrange was selected"): a class on this
            wrapper, like `mx-banded`, which the same tap already toggles on a
            phone — one restyle per mode change, never per frame. */}
        <div
          /* `mx-figures` grows the real header row to the sideways titles'
             height while the drawer is open (matrix.css), so the drawer's rows
             and the day rows beside it stay level. One class toggled on
             open/close — the same "one restyle per mode change, never per
             frame" footing as `mx-banded` and `mx-arranging`. */
          className={`mx-outer${bandActive && bandTop != null ? ' mx-banded' : ''}${sdaActive ? ' lw-sda' : ''}${arranging && role === 'admin' ? ' mx-arranging' : ''}${figuresOpen ? ' mx-figures' : ''}`}
          ref={mxOuterRef}
        >
        <div
          className="mx-wrap"
          ref={wrapRef}
          onScroll={onWrapScroll}
        >
          <table className="mx" style={zoomStyle}>
            {/* THE ROW ORDER IS THE OWNER'S (18 Aug 26, arrows on a
                screenshot): counts first, then the month buttons, then the
                callsign + dates header, then the event rows, then the roster.
                The header row is a tbody (`.mxhead`), not a thead — CSS
                paints a thead at the TOP of the table wherever it sits in
                the DOM, which would undo this whole arrangement. */}
            {/* Collapsed away on the view toggle, but always shown while an
                admin is Rearranging — that is where the per-row reorder / delete
                controls live, and hiding the block would hide them too. */}
            {/* The month strip, now a row of the grid so it sits between the
                counts and the header (owner's arrows). The buttons live in a
                sticky two-column cell and overflow visibly across the fill
                cell — the grphd technique — so they stay pinned to the left
                edge while the year scrolls under them. */}
            <tbody className="mstripe">
              <tr>
                <td className="mstick" colSpan={2} ref={mstickRef} style={stripH ? { height: stripH } : undefined}>
                  {/* The strip cancels the grid's zoom (6 Sep 26): it is
                      navigation chrome, not grid content, and once a phone
                      opened one step out its 9px labels rendered at ~7px and
                      "MAR"/"NOV" clipped on a 360px phone. Nested `zoom`
                      multiplies, so 1/zoom here puts the strip back at natural
                      size at every step; `stripH` still divides by the grid's
                      zoom because the cell it sizes is in the grid's units. */}
                  <div className="mstrow" ref={mstrowRef} style={zoom !== 1 ? { zoom: 1 / zoom } : undefined}>
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
                    {/* The zoom pair used to ride the end of this strip
                        (phone-only); it moved to the counter block's top row
                        after OIL (owner, 6 Sep 26), which is what freed the
                        strip to hold all twelve months on ONE line on a phone. */}
                  </div>
                </td>
                <td className="mfill" colSpan={dayCols} />
              </tr>
            </tbody>
            <tbody className="mxhead" ref={headRef}>
              {headerRow(true)}
            </tbody>
            {/* THE MANNING ROWS STRAIGHT UNDER THE DATES (D1256, 22 Oct 26 — "G1 as recommended"): every Manning figure reads
                straight down from its date; the Event rows, then the people, follow. They stood above the month buttons until
                M2 (the owner's arrows of 18 Aug 26); D665's four rows stay at the block's foot. */}
            {(countsOpen || (arranging && role === 'admin')) && (
              <CountRows
                verdicts={verdicts}
                dates={drawnDates}
                order={manningBlockOrder()}
                arranging={arranging}
                admin={role === 'admin'}
                onInfo={setManningInfo}
                onRowDragStart={(e, ruleId) => startRowDrag(e, ruleId, MANNING_DRAG)}
                draggingId={draggingId}
                dragOver={dragOver}
                dragAfter={dragAfter}
                padL={padL}
                padR={padR}
                phL={phL}
                phR={phR}
                onRowsChange={onArchiveChange}
                /* THE FOUR FIXED ROWS OF THE MANNING BLOCK — Required P and W, Available P and W (the Inputs / SANS
                   redesign, plan §3.3; owner D665, 8 Oct 26: "I'm going with B"). They subscribe THEMSELVES to the
                   plan's and the war's signals; a figure that widens a day column asks for the same re-measure the
                   Archive rows did — which also re-places the Figures drawer and the open-bidding outline, both
                   measured off the dates BELOW this block (the two things he circled on the hand-drawn picture: the
                   gate e2e/leavewar.spec.ts checks both in a real browser).
                     AND THE COUNTERS STAND AMONG THEM WHERE THE ADMIN PUTS THEM (D674, 8 Oct 26): CountRows hands its
                   rows over in runs and FlyRows draws each run above, between or below its four. In Rearrange each of
                   the four is a place to drop (the same `data-mrow` the counters carry, so MANNING_DRAG hit-tests
                   them with no second machine) and shows the landing bar from the drag state below. */
                fixed={runs => (
                  <FlyRows
                    days={drawnDays} admin={role === 'admin'} padL={padL} padR={padR} phL={phL} phR={phR}
                    onWiden={onArchiveChange} pickApi={flyPickRef} onEditAvail={editAvail}
                    runs={runs} arranging={arranging && role === 'admin'} dragOver={draggingId ? dragOver : null} dragAfter={dragAfter}
                  />
                )}
              />
            )}
            {/* Above the roster, below the header — an event is the REASON a
                day is thin, so it reads right under the date it explains. */}
            <EventRows
              days={drawnDays}
              bands={period.bands}
              defs={eventDefs}
              rows={eventRows}
              editable={role === 'admin'}
              /* ONE MOVE AT A TIME (Astra's final read, 1, 27 Sep 26): with a chip picked up, a tap on an event row opened
                 its sheet, whose Move started a SECOND move — and one click then moved both. While any move is on, the
                 event rows open nothing. */
              onEdit={(line, date) => { if (moveSel || eventMoveSel) return; setEventEdit({ line, date }) }}
              /* a FILLED cell: the small box, for everyone — and nothing while a move is on (a landing opens neither a
                 box nor a sheet). 240 is `.evpeek`'s own width; a second tap on the same cell closes it. */
              onPeek={(line, date, el) => {
                if (moveSel || eventMoveSel) return
                const tid = el.getAttribute('data-testid') ?? ''
                setEvPeek(cur => (cur && cur.tid === tid ? null : { line, date, tid, ...popAt(el.getBoundingClientRect(), 240, 104) }))
              }}
              padL={padL}
              padR={padR}
              phL={phL}
              phR={phR}
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
                const roster = displayRoster().filter(p => rowInWindow(p, visWinRef.current, rowSpans))
                const span = 2 + dayCols
                let prevG: string | null = null
                let prevCat = ''
                return roster.map(p => {
                  const g = homeOf(p)
                  const heads: any[] = []
                  if (g !== prevG) {
                    const n = roster.filter(x => homeOf(x) === g).length
                    heads.push(
                      <tr key={`grp-${g}`} className={`grp ${groupClass(g)}${folded.has(g) ? ' folded' : ''}${draggingId === g ? ' dragging' : ''}${dragOver === g && draggingId !== g ? (dragAfter ? ' dragover after' : ' dragover') : ''}`} data-testid={`group-${g}`} data-grow={arranging && g !== OTHER_ID && g !== SANS_GROUP_ID ? g : undefined}>
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
                            {/* The category-heading drag grip (owner, 3 Sep 26 —
                                reorder the blocks on the grid). Only while
                                rearranging, and only for a movable group (not the
                                auto SANS group, not Everyone-else). Its pointerdown
                                starts the drag and its click is swallowed, so a tap
                                on the grip never folds the group. */}
                            {arranging && g !== OTHER_ID && g !== SANS_GROUP_ID && (
                              <span
                                className="ghd-grip"
                                data-testid={`gdrag-${g}`}
                                title={`Drag to move ${labelOfGroup(g)}`}
                                style={{ touchAction: 'none' }}
                                onPointerDown={e => { e.stopPropagation(); startRowDrag(e, g, GROUP_DRAG) }}
                                onClick={e => e.stopPropagation()}
                              >⠿</span>
                            )}
                            <span className="gsw" aria-hidden="true" style={groupColorOf(g, groupColors) ? { background: groupColorOf(g, groupColors) } : undefined} />
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
                      {/* The row itself is a memoised component (3 Sep 26):
                          opening a sheet, hovering a chip or dragging a row
                          used to rebuild all ~18,000 cells; now only a row
                          whose own inputs changed repaints. Every store
                          change still repaints every row via `version`. */}
                      <PersonRow
                        p={p}
                        version={version}
                        period={period}
                        monthDays={drawnMonthDays}
                        grid={grid}
                        states={states}
                        views={views}
                        role={role}
                        viewer={viewer}
                        deciding={deciding}
                        movedShown={movedShown}
                        shown={shown}
                        figureCtx={figureCtx}
                        figSel={figSel && figSel.fig === shown.id && figSel.ids.includes(p.id) ? shown.id : null}
                        evKind={evKind}
                        lockedCols={lockedCols}
                        quals={qualsOf.get(p.id) ?? NO_QUALS}
                        me={p.id === viewer}
                        arranging={arranging}
                        dragging={draggingId === p.id}
                        over={draggingId && dragOver === p.id && draggingId !== p.id ? (dragAfter ? 'dragover after' : 'dragover') : ''}
                        api={rowApi}
                        padL={padL}
                        padR={padR}
                        phL={phL}
                        phR={phR}
                      />
                    </Fragment>
                  )
                })
              })()}
            </tbody>
          </table>
          {/* The open-dates outline, one box per open stretch (see measureBidBox). Siblings of the table inside
              `.mx-wrap`, so they scroll sideways with the grid; none unless something is open and laid out. */}
          {bidBoxes.map(b => (
            <div
              key={b.key}
              className={`lw-bidbox${b.cutL ? ' cut-l' : ''}${b.cutR ? ' cut-r' : ''}`}
              data-testid="bid-box"
              data-from={b.key}
              aria-hidden="true"
              style={{ left: b.left, top: b.top, width: b.width, height: b.height }}
            />
          ))}
        </div>
        {/* The phone's frozen header — the fixed mirror described above the
            sticky machinery. Sits under the top bar (z 55 < the bar's 60 and
            the sheets' 79/80) and never renders in jsdom, where nothing has
            a height to scroll past. */}
        {stuck && ((s: { top: number; left: number; width: number; cols: number[] }) => {
          // The drawer's titles ride the FROZEN copy alone, never the scrolling
          // layer (6 Sep 26). The scrolling layer's day columns are glued to the
          // grid's own — by a translate on the compositor, or by a copied
          // scrollLeft — so its geometry has to stay the grid's: give it the
          // drawer's seven extra columns and every date in the bar would sit
          // that far right of the column it names. The frozen copy is clipped to
          // its own width and carries no day columns anyone can see, so it is
          // free to be as wide as the drawer.
          const mirrorDrawer = figuresOpen && !!drawerAt && drawerAt.cols.length === figures.length
          const colsFor = (drawer: boolean) =>
            drawer ? [s.cols[0] ?? 0, ...drawerAt!.cols, ...s.cols.slice(2)] : s.cols
          // The measured widths are visual px (they include the zoom), and the
          // mirror table wears the same zoom so its text sizes match — so its
          // layout widths are the measurements divided back out, or the zoom
          // would apply twice.
          const table = (extra: string, drawer = false) => {
            const cols = colsFor(drawer)
            return (
              <table
                className={`mx${extra ? ' ' + extra : ''}`}
                style={{ tableLayout: 'fixed', width: cols.reduce((a, b) => a + b, 0) / zoom, ...(zoomStyle ?? null) }}
              >
                <colgroup>
                  {cols.map((w, i) => (
                    <col key={i} style={{ width: w / zoom }} />
                  ))}
                </colgroup>
                <tbody className="mxhead">
                  {headerRow(false, drawer)}
                </tbody>
              </table>
            )
          }
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
              {/* The bar's frozen LEFT columns. Drawn in the scroll-driven path; in the JS-mirror path too since D1287 (the
                  fix read's finding 4), where its scroller keeps sticky corner cells of its own — this copy stands over them,
                  the same pixels at rest, and is what a pinch holds at the left edge while that scroller stretches.
                  A translated table cannot keep `position: sticky`, so the
                  callsign + counter columns are drawn as a static copy pinned
                  over the left and clipped to their own width; the day columns
                  translate UNDER it. It is the tappable/opaque copy (the counter
                  picker still works while scrolled); the scrolling layer's own
                  who/bal are made pointer-events:none in matrix.css so taps land
                  here, and this copy is aria-hidden so the scrolling layer stays
                  the single accessible one. */}
              {(
                <div
                  className="mxfixed-frozen"
                  aria-hidden="true"
                  /* VISUAL px, NOT divided by the zoom (owner's iPhone, 6 Sep 26 —
                     the stuck bar showed the hatched filler / "MON 27" / "JAN 01"
                     right after LVE BAL, out of step with the grid). This box is
                     a plain div beside the track, outside any zoomed table — only
                     the <col>s INSIDE it live in zoomed space and take the
                     division. Divided, it was 25% too wide at the phone's 0.8
                     (131px against the grid's 107) and revealed the copy's third
                     cell; at 1.2 it would clip the balance column. Latent since
                     the zoom shipped, surfaced by the one-step-out default.
                     While the DRAWER is open the frozen pair IS the drawer, so
                     the clip runs to the drawer's own right edge — measured in
                     the same visual pixels, off the same box. */
                  style={{ width: mirrorDrawer ? drawerAt!.left + drawerAt!.width : (s.cols[0] || 0) + (s.cols[1] || 0) }}
                >
                  {table('', mirrorDrawer)}
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
            <table className="mx" style={zoomStyle}>
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
                          <span className="gsw" style={groupColorOf(item.g, groupColors) ? { background: groupColorOf(item.g, groupColors) } : undefined} />
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
                  const lines = figureLines(shown, figureCtx, p.id)
                  return (
                    // `data-band-id`, NOT a testid: the real row keeps `row-…`
                    // and `bal-…`, and two nodes answering one testid would
                    // break every query that expects the one real match. e2e
                    // still needs to find a given person in the overlay to prove
                    // it lines up with — and stays put over — the real row.
                    // The SAME `<FigureCell>` as the real cell (no testid — the
                    // overlay never answers one) so the phone's frozen copy
                    // shows the two-line box too, and the two cannot drift.
                    <tr key={`b-${p.id}`} data-band-id={p.id} data-band-key={`row-${p.id}`} className={p.id === viewer ? 'me' : undefined}>
                      <td className="who">
                        <div className="whorow">
                          <button className="whoedit" tabIndex={-1} onClick={() => setWhoOpen(p.id)}>
                            <span className={`cs seat-${p.seat}`}>{p.callsign}</span>
                            {p.to !== null && outcomeOf(p) === 'sans' && <span className="po-sans-tag">SANS</span>}
                            {catChip(p)}
                          </button>
                        </div>
                      </td>
                      <FigureCell
                        figure={shown}
                        lines={lines}
                        personId={p.id}
                        extraClass="bal act"
                        dataFig={shown.id}
                        dataPerson={p.id}
                        selected={!!figSel && figSel.fig === shown.id && figSel.ids.includes(p.id)}
                        onClick={() => setBalOpen({ person: p.id, figureId: shown.id })}
                      />
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {/* THE FIGURES DRAWER (owner, 6 Sep 26) — the band's sibling and its
            mirror image: the band draws the two frozen columns over the LEFT of
            the days, the drawer draws every figure over the RIGHT of them. Both
            are overlays outside `.mx-wrap`, drawn once, placed from measured
            numbers and never from guessed ones. */}
        {figuresOpen && (
          <FiguresDrawer
            figures={figures}
            ctx={figureCtx}
            rows={drawerRows()}
            zoom={zoom}
            top={drawerAt?.top ?? null}
            left={drawerAt?.left ?? 0}
            headH={drawerAt?.headH ?? 40}
            rootRef={drawerRef}
            arranging={arranging && role === 'admin'}
            selFor={id => (figSel && figSel.ids.includes(id) ? figSel.fig : null)}
            onBox={onDrawerBox}
          />
        )}
        {/* THE LIFT FRAME (owner, 6 Sep 26): one box round a picked-up row, and
            the flash where it lands — src/ui/lift.ts. Last in the outer so it
            paints over the band and the drawer; a constant className, so React
            never touches it after mount. */}
        <div className="lift-frame" data-testid="lift-frame" aria-hidden="true" ref={liftRef} />
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
      {/* A member's remarks editor wins FIRST where it applies (his own approved leave, any day — D418 narrowed) — even
          over the Raptor sheet, because the note lives on the same Raptor row the read-only sheet would only point at. */}
      {open && listOpen && (
        <DayListSheet
          key={`dl-${open.id}-${open.date}`}
          personId={open.id}
          callsign={open.callsign}
          date={open.date}
          view={openView!}
          role={role}
          viewer={viewer}
          period={period}
          /* ONE RECORD, PICKED BY ITS ID (owner, D266 — "the same move modality and I can choose what to move"): the list
             closes and the grid's move mode carries exactly that record — no date box — by the same machine and landing
             rules as a single chip and a block (D262) */
          onMove={rec => {
            setSel(null)
            close()
            setEventMoveSel(null); setEventMovePreview(null)
            setMoveSel({ people: [rec.personId], from: rec.date, to: rec.date, cells: [{ personId: rec.personId, date: rec.date }], only: [rec] })
          }}
          onClose={close}
        />
      )}
      {open && canRemark && (
        <RemarksSheet
          key={`rmk-${open.id}-${open.date}`}
          callsign={open.callsign}
          personId={open.id}
          row={remarkRow}
          code={grid[open.id]?.[open.date] ?? ''}
          onClose={close}
        />
      )}
      {/* Raptor's ownership is checked next and short-circuits both other
          sheets. That cell is approved elsewhere: offering a picker or a
          decision on it would offer an action the store will refuse, which
          is worse than offering nothing. */}
      {open && !listOpen && !canRemark && raptorOwns(states, open.id, open.date) && !openFreeHalf && !openWorkOnly && (
        <RaptorSheet
          callsign={open.callsign}
          date={open.date}
          /* its documents, read only (M3 7.3 — D1150): changed on the Inputs page, where it was filed */
          docNames={rowDocIds(leaveInputAt(open.id, open.date, grid[open.id]?.[open.date])).map(id => docGet(id)?.name ?? 'document')}
          code={grid[open.id]?.[open.date] ?? ''}
          /* An OIL credit the app earned opens here too, and it is not leave
             from the Inputs page — the sheet says which it is, and reads the
             credit back in the same three lines as everywhere else. */
          creditShown={openAnyCredit && !openAnyCredit.award
            ? {
              code: openAnyCredit.code,
              days: openAnyCredit.days,
              note: openAnyCredit.note,
              giver: creditGiver({ auto: true, ...(openAnyCredit.via ? { via: openAnyCredit.via } : {}) }),
              spans: openAnyCredit.spans,
              via: openAnyCredit.via,
              ...(openAnyCredit.half ? { half: openAnyCredit.half } : {}),     // an HO's half (D1164)
            }
            : null}
          onClose={close}
        />
      )}
      {/* HIS OWN OIL AWARD, READ ONLY (owner, D261, 27 Sep 26), wherever the bid sheet will not open for him — a day not
          open for him. Where it does open its foot reads the award back already, so this stands aside. */}
      {open && !listOpen && !canRemark && openCredit && ownAwardAlone(openView, viewer, open.id)
        && !canBidOn(open.id, open.date) && (
        <AwardSheet
          callsign={open.callsign}
          date={open.date}
          award={{ code: openCredit.code, days: openCredit.days, note: openCredit.note, giver: openCredit.givenBy ?? '', entered: openCredit.enteredName, ...(openCredit.half ? { half: openCredit.half } : {}) }}
          onClose={close}
        />
      )}
      {/* A MEMBER'S TAP ON HIS OWN ROW, ON A DAY NOT OPEN FOR HIM (D1176, D1225; drawn r7-08, r7-09): the closed note — or,
          where his own pending bid stands, that note with its Delete. Never a dead tap, never a bid window that then
          refuses. Last in line: his remarks, a leave filed on the Inputs page, his own award and the day's list each
          answer first, as before. The posting days (before he joined, after he left) are his too. */}
      {open && !listOpen && !canRemark && role !== 'admin' && canEditRow(role, viewer, open.id)
        && !canBidOn(open.id, open.date)
        && !raptorOwns(states, open.id, open.date)
        && !(openCredit && ownAwardAlone(openView, viewer, open.id)) && (
        <ClosedNoteSheet
          key={`cn-${open.id}-${open.date}`}
          personId={open.id}
          callsign={open.callsign}
          date={open.date}
          pending={ownPendingOnClosedDay(open.id, open.date)}
          onClose={close}
        />
      )}
      {/* The drag-selection sheet — batched fill / decide / delete / move over
          the whole rectangle (owner, 27 Aug 26). Independent of the single-cell
          `open`; a drag never sets `open`. */}
      {sel && (
        <SelectSheet
          flushRef={selFlushRef}
          /* a NEW drag while the panel is up replaces what it acts on (D642) — and starts it afresh: a Delete armed
             for the old block, or a below-zero ask, must not carry over to the new one */
          key={`${sel.from}|${sel.to}|${sel.people.join(',')}`}
          sel={sel}
          people={csOf}
          /* the ask before a fill takes anyone below zero (D418) */
          wouldLeave={balanceAfter}
          dayLine={bidDayLine}
          role={role}
          canDecide={canDecide(role)}
          /* never on a deleted man (his posting is final — [POST-OUT-OUTCOMES], Fable F3) */
          onPostOut={role === 'admin' && !sel.people.some(id => people.find(p => p.id === id)?.gone || postingLocked(id)) ? (pid, from, outcome) => postOutOr(pid, from, outcome) : undefined}
          hasAccount={hasAccount}
          onMove={s => { setEventMoveSel(null); setEventMovePreview(null); setMoveSel(s) }}
          /* a PARTIAL write keeps the sheet up (keepOpen) so its "N written,
             M skipped" note is actually read — closing here killed the note
             in the same tap that set it (27 Aug 26 overnight find) */
          onDone={(_changed, keepOpen) => { if (!keepOpen) setSel(null) }}
          onClose={() => setSel(null)}
        />
      )}
      {/* The balance bar — a drag down one figure column, one number for the
          run (owner, 6 Sep 26). Up while the selection lives; Save writes ONE
          ledger batch (grantTo) and the changed boxes flash on their own. The
          role is read HERE, not only where the drag arms: an admin's "view as
          member" flip lands mid-selection and must take the write control off
          the screen with it (absent, not disabled — the house rule). */}
      {role === 'admin' && figSel && selectableFigure(figSelFigure) && figSelIds.length > 0 && (
        <BalanceBar figure={figSelFigure} ids={figSelIds} onDone={() => setFigSel(null)} onClose={() => setFigSel(null)} />
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
                : `Tap a day to move ${movers.length} ${movers.length === 1 ? 'entry' : 'entries'}${stayWords(moveStays)}`}
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
      {open && !listOpen && !canRemark && openPostedOut && role === 'admin' && !placing && !openPerson?.gone && (
        <PostOutSheet
          callsign={open.callsign}
          date={open.date}
          /* openPostedOut already proves `to` is set — a greyed day is a day
             AFTER it. The sheet talks in the PO date (first day gone), which
             is the day after the stored last-day-in. */
          poFrom={addDays(openPerson!.to!, 1)}
          outcome={outcomeOf(openPerson) ?? 'none'}
          hasAccount={hasAccount(open.id)}
          blockedFor={o => postingBlocked(open.id, o)}
          /* [ONE-DOOR] (Fable F1 / Astra 2): archived on Admin → Users — Restore there is the one way back; the store's
             lock, installed by the sync, as the account and block lookups are (the war never reads Raptor's people) */
          lockedWhy={postingLocked(open.id)}
          onChange={(from, outcome) => postOutOr(open.id, from, outcome)}
          /* the archive the Post out made goes too (W5-F1); refused, with where to go, when a man on the roster now holds
             his callsign (D286 (1) — Fable's scenario 2: it closed and did nothing) */
          onUndo={() => { const why = undoPostOutProblem(open.id); if (why) return why; undoPostOut(open.id); close() }}
          onPlace={() => setPlaceAt(openKey)}
          onClose={close}
        />
      )}
      {/* …and the mirror at the other end: a day BEFORE the person posted in,
          tapped by an admin. Same one-control shape as the post-out sheet,
          and it short-circuits the bid picker below exactly as that one does
          (owner, 20 Sep 26). A MEMBER tapping their own pre-joining day falls
          through to the picker instead, which is answer C's "filed or bid". */}
      {open && !listOpen && !canRemark && openNotYetArrived && role === 'admin' && !placing && !openPerson?.gone && (
        <PostInSheet
          callsign={open.callsign}
          date={open.date}
          /* openNotYetArrived already proves `from` is set. The sheet talks in
             the PI date itself — the first day they ARE here — where the
             post-out sheet has to add a day to the stored last-day-in. */
          piFrom={openPerson!.from!}
          /* D320: back from a posting — the day after his last earlier stint closed */
          backFrom={openPerson!.past && openPerson!.past.length ? addDays(openPerson!.past[openPerson!.past.length - 1].to, 1) : null}
          /* [ONE-DOOR] (the walk's design, Fable 4.2): archived on Admin → Users — read only, as the Post out sheet */
          lockedWhy={postingLocked(open.id)}
          onChange={from => postInOr(open.id, from)}
          onUndo={() => { setPostIn(open.id, null); close() }}
          onPlace={() => setPlaceAt(openKey)}
          onClose={close}
        />
      )}
      {/* An admin at `closed` can BOTH edit and decide, so the two are not
          mutually exclusive and the order between them matters. Deciding
          wins on a cell that holds a bid, because that is what the stage is
          for; the picker still opens on an empty one, so an admin can add
          leave to a closed sheet without a second control. */}
      {/* The tapped person's breakdown of one figure — the column's shown
          one from a counter-cell tap, or whichever row was tapped in the
          person-figures sheet. Guarded on the person still existing — an
          admin can delete a row while any sheet is up. Looked up in the FULL catalogue, not the
          column's `figures` (visible-only, 6 Sep 26): the figure this sheet
          was asked for was chosen before it opened, and an admin can hide a
          figure at any moment — including while this very sheet is up — so a
          lookup that depended on visibility would answer a stale id by
          silently substituting whatever the column happens to be showing. The
          reader would then be reading someone's MED TOT under a heading that
          says CCL, which is worse than showing a figure that has just left the
          picker. An unknown id (a stale saved order) falls back to the shown
          one. */}
      {balOpen && people.some(p => p.id === balOpen.person) && (
        <FigureBreakdownSheet
          figure={orderedFigures(figureOrder).find(f => f.id === balOpen.figureId) ?? shown}
          person={people.find(p => p.id === balOpen.person)!}
          onClose={() => setBalOpen(null)}
        />
      )}
      {/* The tapped person's ALL-FIGURES sheet — every role's way in from a
          callsign. A figure row hands over to the breakdown above. (Its
          admin's "Edit person" is gone — D460, D461: seat, band and SXO change
          only on Quals.) */}
      {whoOpen && people.some(p => p.id === whoOpen) && (
        <PersonFiguresSheet
          person={people.find(p => p.id === whoOpen)!}
          onOpenFigure={figureId => { setBalOpen({ person: whoOpen, figureId }); setWhoOpen(null) }}
          onOpenOil={() => { setOilTracker({ person: whoOpen }); setWhoOpen(null) }}
          onSetBalance={role === 'admin' ? (counter, target) => { setBalance(whoOpen, counter, target) } : undefined}
          onClose={() => setWhoOpen(null)}
        />
      )}
      {/* The qualifications popover (owner, 3 Sep 26). A person wears only their
          CAT chip; this is where every other qualification shows, on a desktop
          hover or a phone tap of the chip. It ignores pointer events (never eats
          a tap) and is dismissed by the outside-pointer listener above. */}
      {qualPop && people.some(p => p.id === qualPop.id) && (() => {
        const p = people.find(x => x.id === qualPop.id)!
        const quals = shownQuals(p)
        return (
          <div className="qualpop" role="tooltip" data-testid="qualpop" style={{ left: qualPop.x, top: qualPop.y }}>
            <div className="qualpop-hd">{p.callsign} · quals</div>
            {quals.length
              ? (
                <div className="qualpop-list">
                  {quals.map(q => (
                    <span className="qualpill" key={q.label} style={{ background: q.color, color: inkFor(q.color) }}>{q.label}</span>
                  ))}
                </div>
              )
              : <div className="qualpop-none">No qualifications recorded</div>}
          </div>
        )
      })()}
      {/* The event box (plan §3.12): the full name the grid's short form stands for, its kind in its colour, its date
          or — for a merged band — its dates. Read from the store on every paint, so it can never show an event that
          has since been changed, and it goes when its event does. */}
      {evPeek && (() => {
        const band = bandAt(period.bands, evPeek.line, evPeek.date)
        const day = period.days.find(d => d.date === evPeek.date)
        const text = band ? band.text : day ? dayEvent(day, evPeek.line) : ''
        if (!text) return null
        const kind = (band ? band.kind : day ? dayEventKind(day, evPeek.line) : null) ?? classifyEvent(eventDefs, text)
        return (
          <div className="evpeek" role="dialog" aria-label={text} data-testid="event-peek" style={{ left: evPeek.x, top: evPeek.y }}>
            <div className="evpeek-name">{text}</div>
            <div className="evpeek-meta">
              {kind && <span className={`evpeek-kind ${kind}`} data-testid="event-peek-kind">{EVENT_KIND_WORDS[kind]}</span>}
              <span className="evpeek-when">{band ? shortSpan(band.from, band.to) : `${dayLabel(evPeek.date)} ${evPeek.date.slice(2, 4)}`}</span>
            </div>
            {role === 'admin' && (
              <button
                className="evpeek-edit"
                data-testid="event-peek-edit"
                onClick={() => { const { line, date } = evPeek; setEvPeek(null); setEventEdit({ line, date }) }}
              >
                Edit
              </button>
            )}
          </div>
        )
      })()}
      {/* The OIL tracker — everyone's balances, or one person's ledger. The
          person guard matches the sheets above: a row can go while it is up. */}
      {oilTracker && (oilTracker.person === null || people.some(p => p.id === oilTracker.person)) && (
        <OilTracker
          key={oilTracker.person ?? '*'}
          person={oilTracker.person}
          onClose={() => setOilTracker(null)}
        />
      )}
      {eventEdit && role === 'admin' && (
        <EventSheet
          key={`${eventEdit.line}-${eventEdit.date}-${eventEdit.to ?? ''}`}
          line={eventEdit.line}
          date={eventEdit.date}
          to={eventEdit.to}
          onClose={() => setEventEdit(null)}
          onMove={m => { setEventEdit(null); setSel(null); setMoveSel(null); setMovePreview(null); setEventMoveSel(m) }}
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
      {counterEdit !== false && role === 'admin' && (
        <CounterForm key={counterEdit ?? 'new'} ruleId={counterEdit} onClose={() => setCounterEdit(false)} />
      )}
      {/* The ⚙ SETTINGS sheet — all admin config (counters, event rows, Show
          SANS, the roster groups). Admin only at the affordance AND at every
          store writer it calls — the standing role doctrine. The who-wins list
          reorders through the one drag machine (the display order is dragged on
          the grid instead, see the category headings below). */}
      {settings && role === 'admin' && (
        <SettingsSheet
          onClose={() => setSettings(false)}
          // + Counter opens the counter builder, a sheet of its own — close the
          // settings sheet so the two do not stack (both `.bidsheet`, same z-index,
          // so an open settings row would sit over the builder and eat its taps).
          onAddCounter={() => { setSettings(false); setCounterEdit(null) }}
          // Days… opens the scheduler's Days window on the month the grid is showing (the month strip's lit one),
          // through the war's one seam (sync.ts openDays); the sheet closes so it does not cover the window
          onRearrange={() => { setSettings(false); setArranging(true) }}
          onDays={() => {
            setSettings(false)
            const shown = months.find(m => m.label === inViewRef.current) || months[0]
            openDays(shown ? shown.first : period.start)
          }}
          onGroupDragStart={(e, id) => startRowDrag(e, id, GROUP_DRAG)}
          onPriorityDragStart={(e, id) => startRowDrag(e, id, GROUP_PRIO_DRAG)}
          draggingId={draggingId}
          dragOver={dragOver}
          dragAfter={dragAfter}
        />
      )}
      {/* a member may bid CLEARING leave after their own posting-out (owner
          answer C, 20 Sep 26) — the admin's tap there stays the PO sheet */}
      {open && !listOpen && !canRemark && (placing || ((!openPostedOut || role !== 'admin') && (!openNotYetArrived || role !== 'admin'))) && (!raptorOwns(states, open.id, open.date) || !!openFreeHalf || openWorkOnly)
        && canBidOn(open.id, open.date) && (
        <BidPicker
          key={`${open.id}-${open.date}`}
          /* the approved leave's Remarks and Document, shown at once (his D1307 — "Note" went) */
          /* never on the free half beside a leave filed on the Inputs page: its words are the NEW bid's, and that leave is
             changed on the Inputs page (the fresh read's R1, round 3's check) */
          approvedRow={openFreeHalf ? null : adminNoteRow}
          callsign={open.callsign}
          personId={open.id}
          date={open.date}
          current={grid[open.id]?.[open.date] ?? ''}
          dates={dates}
          /* Item D: only the free half is on offer, and the sheet says what
             holds the other one. */
          onlyPortion={openFreeHalf}
          heldBy={openFreeHalf ? boxText(grid[open.id]?.[open.date] ?? '') : undefined}   /* the box's own word, "LL" — the half said in words (round 3, D1331) */
          /* Admin-only: post this person out (owner, 18 Aug 26; any date and
             the archive switch, 19 Aug 26). The store sets their posting-out
             date; the greyed boxes and the manpower exclusion follow from it,
             and sync.ts's auto-archive pass reads the switch. */
          /* [ONE-DOOR]: not for a man archived on Admin → Users — his postings are read only there (the walk's pictures,
             27 Sep 26: the button could only be refused, and then said so twice); leave and OIL still place */
          onPostOut={role === 'admin' && !openPerson?.gone && !postingLocked(open.id)
            ? (from, outcome) => { const why = postOutOr(open.id, from, outcome); if (why) return why; close() }
            : undefined}
          hasAccount={hasAccount(open.id)}
          blockedFor={o => postingBlocked(open.id, o)}
          /* Admin-only, the mirror of the above (owner, 20 Sep 26): the first
             day they ARE in the squadron. */
          onPostIn={role === 'admin' && !openPerson?.gone && !postingLocked(open.id)
            ? from => { const why = postInOr(open.id, from); if (why) return why; close() }
            : undefined}
          /* Admin-only: record that he WORKED this day and earned OIL (owner,
             20 Sep 26). ANY day — the weekend/public-holiday rule belongs to
             the automatic pass that reads the published schedule, not to a
             credit the squadron types itself. Hours are read the way every
             other time box in the app is (`08:00`, `8:00`, `0800`, `800`);
             blank means the whole day. */
          credit={role === 'admin' && openCredit
            ? { code: openCredit.code, days: openCredit.days, note: openCredit.note, givenBy: openCredit.givenBy, ...(openCredit.half ? { half: openCredit.half } : {}) }
            : null}
          /* a day holding SEVERAL awards: the +OIL panel changes none of them — the day's list carries each */
          awardCount={role === 'admin' ? openAwards.length : 0}
          /* Read back on one click, for anyone who can see the day — a member
             reading his own OIL is entitled to know why it is there and who
             gave it, the same as an admin (owner, 21 Sep 26). */
          /* THE FOUR ANSWERS TO AN INPUT, IN EVERY STAGE (owner, 21 Sep 26).
             An admin, and a cell that actually holds a bid to answer — a
             course, a medical, an OIL credit and an empty day are not things
             anybody asked for. The admin decides at any time (D1177). */
          /* THE DAY'S BID STATE FOR EVERY ROLE (round 3's FULL check — the designer's S1, X1): the window lights the day's own
             leave, never a refused bid; it read that only from the admin's decide, so a member's own refused bid opened lit */
          dayState={isBiddable(grid[open.id]?.[open.date]) ? stateOf(states, open.id, open.date) : undefined}
          decide={canDecide(role) && !openFreeHalf && isBiddable(grid[open.id]?.[open.date])
            ? { state: stateOf(states, open.id, open.date), movedFrom: movedShown ? shiftedFrom(states, open.id, open.date) : undefined }
            : null}
          /* ONE CHIP, ONE MOVE (owner, D262, 27 Sep 26): the sheet's Move picks the chip up into the grid's own move
             mode — the drag-selection's, so a single chip and a block move by one machine and one set of landing
             rules (moveCells: refused whole with its reason, the dotted mark once bidding is closed, lands
             undecided). A day that holds nothing this screen may move says so on the sheet instead. */
          onMove={cells => {
            /* the day tapped, or every day of a picked range (D335) — the records on them this role may move (D265) */
            if (!movableRecords(cells).length) return 'There is nothing here that can be moved.'
            const dates = cells.map(c => c.date).sort()
            setSel(null)
            close()
            setEventMoveSel(null); setEventMovePreview(null)
            setMoveSel({ people: [open.id], from: dates[0]!, to: dates[dates.length - 1]!, cells })
          }}
          creditShown={openAnyCredit
            ? {
              code: openAnyCredit.code,
              days: openAnyCredit.days,
              note: openAnyCredit.note,
              giver: creditGiver({ auto: !openAnyCredit.award, ...(openAnyCredit.via ? { via: openAnyCredit.via } : {}), ...(openAnyCredit.givenBy ? { givenBy: openAnyCredit.givenBy } : {}) }),
              auto: !openAnyCredit.award,
              spans: openAnyCredit.spans,
              via: openAnyCredit.via,
              ...(openAnyCredit.award && openAnyCredit.enteredName ? { entered: openAnyCredit.enteredName } : {}),
              ...(openAnyCredit.half ? { half: openAnyCredit.half } : {}),     // an HO's half (D1164)
            }
            : null}
          onCreditClear={role === 'admin' && openCredit
            ? () => { clearRecordById(open.id, open.date, openCredit.id); close() }
            : undefined}
          onCredit={role === 'admin'
            ? (_code, days, note, givenBy, half) => {
              /* the AMOUNT is the award (FO / HO is only its label); a blank box is a day, as the panel shows; the half
                 the panel picked rides along and counts only on half a day (D1164) */
              const raw = days.trim()
              const n = raw ? Number(raw) : 1
              if (!Number.isFinite(n)) return 'Type how many days'
              return setDayAward(open.id, open.date, n, { note, givenBy, half })
            }
            : undefined}
          /* No medical here: medical is member-filed only (owner, 13 Sep 26).
             Everyone files a medical input with its certificate on Raptor's
             Inputs page; the war displays it read-only, never creates it. */
          /* What the balance would read AFTER this write, so the sheet can
             ask before taking someone negative — the shared body above. */
          wouldLeave={(code, dates) => balanceAfter(open.id, dates, code)}
          dayLine={(dates, code) => bidDayLine(open.id, dates, code)}
          onClose={close}
        />
      )}
      {/* THE SEPARATE DECISION SHEET IS GONE (owner, 21 Sep 26). It opened
          only once bidding had closed, so the same input answered to different
          controls depending on which day of the cycle you clicked it — and
          moving one man's one day needed a drag-select. Its three buttons now
          live on the ONE day window above, in every stage, and its Move is the
          grid's own move mode (D262, 27 Sep 26), which retired its date box;
          the unmounted `DecisionSheet` went with it. */}
    </div>
  )
}
