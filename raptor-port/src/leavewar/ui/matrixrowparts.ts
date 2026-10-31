/* THE ROWS' OWN HELPERS, MOVED WHOLE out of MatrixRows.tsx on 31 Oct 26 (React Doctor's only-export-components, D1534):
   the row-drag configurations, the row-only predicates, the figures beside a name, where a box sits and the joined bar,
   a placeholder's width. A move, not a rewrite — every line as it stood there; the components that draw the rows
   (`PersonRow`, `PersonMonth`) and their memo compares stay in MatrixRows.tsx (`docs/performance.md` §E). */
import { addDays, canEditRow, isBiddable, legacyViews, lockedOnWar, type Period, type Grid, type States, type Role, type FigureLines } from '../engine'
import { leaveFiguresOf, leaveWorldOf, moveGroupTo, moveGroupPriorityTo, moveManningRowTo, moveRosterRow, reqRunKey } from '../state/store'
import { annualUsedIn, type PersonFigures } from '../engine/leaveyear'
import type { RequestRec, WarRec } from '../engine/warrecs'
import { isCommitCode, portionOf, touchesAM, touchesPM, winsOf, type Contrib, type DayView } from '../engine/dayview'
import type { Portion } from '../engine'

/* The two kinds of row the one drag machine (startRowDrag) can reorder. */
export type RowDragCfg = {
  /** querySelector for a draggable row (and for the ordered list at drop). */
  sel: string
  /** read a row element's id (null if it isn't one). */
  idOf: (el: Element) => string | null
  /** commit: move `from` to sit before `beforeId` (end when null). */
  move: (from: string, beforeId: string | null) => void
  /** the moved thing after the store has re-rendered — where the landing flash goes */
  landSel: (id: string) => string
}
export const ROSTER_DRAG: RowDragCfg = {
  sel: '[data-testid^="row-"]',
  idOf: el => el.getAttribute('data-testid')?.slice(4) ?? null,
  move: moveRosterRow,
  landSel: id => `[data-testid="row-${id}"]`,
}
export const MANNING_DRAG: RowDragCfg = {
  sel: '[data-mrow]',
  idOf: el => el.getAttribute('data-mrow'),
  move: moveManningRowTo,
  landSel: id => `[data-mrow="${id}"]`,
}
/* The group editor's two lists reorder with the SAME machine — display order
   and the separate who-wins priority (owner, 28 Aug 26). */
export const GROUP_DRAG: RowDragCfg = {
  sel: '[data-grow]',
  idOf: el => el.getAttribute('data-grow'),
  move: moveGroupTo,
  landSel: id => `[data-grow="${id}"]`,
}
export const GROUP_PRIO_DRAG: RowDragCfg = {
  sel: '[data-gprio]',
  idOf: el => el.getAttribute('data-gprio'),
  move: moveGroupPriorityTo,
  landSel: id => `[data-gprio="${id}"]`,
}

export type QualPill = { label: string; color: string }
export const NO_QUALS: QualPill[] = []

/**
 * The half of a day that is FREE beside a record locked to the Inputs page
 * (CURRENT-STATE item D), or null when there is no such half.
 *
 * The read-only sheet speaks for the WHOLE day whenever the main record is
 * filed on the Inputs page — so a morning LL filed on the form made the
 * afternoon unbiddable too, with nothing on screen to say why. Most leave
 * arrives through the form, so this is the normal case, not a corner.
 *
 * Deliberately narrow, which is the constraint both reviewers put on it: it
 * finds a free half, it does NOT make the filed leave editable here. The filed
 * record keeps its lock, the store's own occupancy rule still has the last
 * word on any write, and a day held on BOTH halves (or on neither) returns
 * null and behaves exactly as before.
 *
 * A credit is not a blocker: since the owner's 20 Sep 26 ruling, recorded work
 * never bars a write — it flags the day. A refused bid never blocked anything.
 */
export function freeHalfBeside(v: DayView | undefined): Portion | null {
  if (!v) return null
  const holding = v.all.filter(c => c.kind === 'absence' || (c.kind === 'request' && c.state !== 'refused'))
  if (!holding.length) return null
  /* by the REAL hours (the absence-record re-test, W5-F4, 26 Sep 26): a medical recorded 09:00–14:00 is drawn as a
     morning (the six-hour rule) but its hours run into the afternoon, and every clash is judged on real hours (§7) —
     so the afternoon was offered here and then refused by the door. winsOf is what the doors read. */
  const am = holding.some(c => winsOf(c).some(touchesAM))
  const pm = holding.some(c => winsOf(c).some(touchesPM))
  return am && !pm ? 'pm' : pm && !am ? 'am' : null
}

/** The day holds one of the viewer's OWN hand-given OIL awards (D261) — the record he may always read back, whatever
 *  the stage. ANY of the day's records counts, not only the one on top (Astra's plan read F02): a day holding his award
 *  beside anything else — the schedule's credit, a second award — opens the tap list, read only for him, which reads
 *  each award back; a day holding just the award opens its own sheet (`ownAwardAlone`). */
function ownAwardPresent(view: DayView | undefined, viewer: string | null, personId: string): boolean {
  return viewer !== null && personId === viewer && !!view && view.all.some(c => c.kind === 'credit' && !c.auto)
}
/** …and nothing else on the day — the award's own read-only sheet. */
export function ownAwardAlone(view: DayView | undefined, viewer: string | null, personId: string): boolean {
  return ownAwardPresent(view, viewer, personId) && !!view?.main && view.main.kind === 'credit' && !view.main.auto && !view.mark
}

/** Whether a tap on this cell opens SOMETHING — the one body Matrix and the
 *  row share. Where a tap goes (bid / decide / read-only / remarks) is decided
 *  in the sheet from the same facts; this only says "there is a sheet". */
export function cellOpenable(states: States, role: Role, viewer: string | null, deciding: boolean, grid: Grid, personId: string, date: string, view?: DayView): boolean {
  /* locked on the war, asked of the day's own entries ([LW-LOCKMARK]); a bare grid with no day views (the engine's own
     fixtures) is read as one entry a cell */
  return lockedOnWar(view ?? legacyViews(grid, states)[personId]?.[date]) ||
    /* HIS OWN OIL AWARD, AT ANY TIME (owner, D261, 27 Sep 26 — "3 yes"): it opens read only (`ownAwardPresent`)
       where nothing else would — a day not open for him. Another man's award stays shut to a member. */
    ownAwardPresent(view, viewer, personId) ||
    // EVERY DAY OF A PERSON'S OWN ROW OPENS SOMETHING FOR HIM (D1177, D1176, D1225): an open day from today, the bid
    // window; any other day, the closed note (with Delete where his own pending bid stands); his approved leave, its
    // remarks (D418 narrowed). An admin, any row. Another man's row stays shut to a member (owner, 27 Aug 26). Kept
    // CHEAP — no date question here, because this runs for every drawn cell; which sheet opens is decided once, when
    // the cell is opened (Matrix).
    canEditRow(role, viewer, personId) ||
    (deciding && isBiddable(grid[personId]?.[date])) ||
    /* A COMMITMENT UNDER UNAVAILABLE OPENS FOR EVERYONE (his D1356 — its remarks shown "on the Leave War alike", as UNA's
       were, D1338): another man's included, read only — it is changed on the Inputs page (D1365) */
    !!view?.all.some(c => c.kind === 'absence' && isCommitCode(c.code))
}

/* THE FIGURES BESIDE A NAME (the M5a build spec §1.4): his LVE War bal, and his LL and OL days in the View period —
   approved and pending, as the one charging rule charges them (engine/leaveyear.ts annualUsedIn). The War bal is the
   store's cached answer (`leaveFiguresOf`, kept until anything the engine reads changes, when it hands back a NEW
   object); the period's days are remembered against that very object, so they are worked out again exactly when his
   figures could have moved, and a row drawn again for any other reason reads both for nothing. Exported: the phone's
   frozen copy of the names (Matrix's band) must read the same two numbers. */
const USED_IN = new WeakMap<PersonFigures, Map<string, number>>()
export function nameFigures(pid: string, from: string, to: string): { war: number; used: number } {
  const f = leaveFiguresOf(pid)
  let byRange = USED_IN.get(f)
  if (!byRange) { byRange = new Map(); USED_IN.set(f, byRange) }
  const k = `${from}|${to}`
  let used = byRange.get(k)
  if (used === undefined) {
    const { world, days } = leaveWorldOf(pid)
    used = annualUsedIn(world, pid, days, from, to)
    byRange.set(k, used)
  }
  return { war: f.kinds.LVE.war, used }
}
/** The two lines as the box beside a name draws them — one reader for the row and the phone's frozen copy. */
export function nameLines(pid: string, period: Pick<Period, 'start' | 'end'>): FigureLines {
  const nf = nameFigures(pid, period.start, period.end)
  return { top: nf.war, used: [{ label: 'LL OL', tone: 'amber', value: nf.used }] }
}

/** Which half of the cell a record's box takes (D1160, D1164): an HO its half — the admin's pick for an award, the half
 *  its work started in for the app's own (`engine/warrecs.ts` gives its `win` AM or PM); an FO always the whole day,
 *  whatever hours the app's own one was worked; anything else the part of the day its window takes. */
export const placeOf = (c: Contrib): 'am' | 'pm' | 'full' =>
  c.kind === 'credit' ? (c.code === 'HO' ? portionOf(c.win) : 'full') : portionOf(c.win)
type Place = 'top' | 'bot' | 'whole' | 'left' | 'right' | 'right-am' | 'right-pm'
/** Where the two boxes of a two-entry day sit (D1146, D1167): [the main box's place, the second's], or null when the
 *  two cannot both be drawn (both in the same half) — then the day keeps one box and its "+1" corner. */
export function pairPlaces(mainPortion: string | undefined, second: Contrib): [Place, Place] | null {
  const a = mainPortion === 'am' || mainPortion === 'pm' ? mainPortion : 'full'
  const b = placeOf(second)
  if (a === 'full' && b === 'full') return ['left', 'right']
  if (a === 'full') return ['left', b === 'am' ? 'right-am' : 'right-pm']
  if (b === 'full') return [a === 'am' ? 'right-am' : 'right-pm', 'left']
  if (a === b) return null
  return a === 'am' ? ['top', 'bot'] : ['bot', 'top']
}
/* ONE ENTRY OVER SEVERAL DAYS READS AS ONE JOINED BAR (his D1359, 25 Oct 26 — "Joined bar (Recommended)"; drawn in
   docs/img/handpass/2026-10-25-lw-drawings/multi-day/, md5 and busy B / C). An entry is a leave, a course, an overseas duty
   or a commitment filed as ONE input (its iid), or a run of bids with one set of words (the store's own run, `reqRunKey`).
   Next-door boxes of one entry join where their places meet — whole or right on the earlier day with whole or left on the
   later; top with top, bottom with bottom — so the bar runs into the half of a first or last day that holds another entry;
   a day in the MIDDLE holding a second entry breaks the bar (busy B: that day exactly as today). The code shows once, at the
   start of each piece. Classes only, on the boxes already drawn — no element is added (D991, performance). */
type JoinBox = { key: string | null; where: string }
/** One man's war records by date — the current war's `recs[pid]` (periods never overlap, so it is the war that holds every
 *  date the grid draws). The joined bar reads a bid's run key from HERE, a prop, never from the store
 *  ([LW-MONTH-MEMO-UNPINNED], 30 Oct 26): what a month draws must arrive in what its memo compares. */
export type PersonRecs = Readonly<Record<string, readonly WarRec[]>> | undefined
function entryKey(date: string, c: Contrib, recs: PersonRecs): string | null {
  if (c.kind === 'absence') return `a:${c.id}`
  if (c.kind === 'request') {
    const r = (recs?.[date] ?? []).find(x => x.id === c.id && x.kind === 'request') as RequestRec | undefined
    return r ? `r:${reqRunKey(r)}` : null
  }
  return null
}
function dayBoxes(date: string, v: DayView | undefined, recs: PersonRecs): JoinBox[] {
  const es = v ? v.all.filter(c => c.kind !== 'notice') : []
  if (!es.length || es.length > 2) return []
  const p0 = portionOf(es[0]!.win)
  const main = p0 === 'am' ? 'top' : p0 === 'pm' ? 'bot' : 'whole'
  if (es.length === 1) return [{ key: entryKey(date, es[0]!, recs), where: main }]
  const two = pairPlaces(p0, es[1]!)
  if (!two) return [{ key: entryKey(date, es[0]!, recs), where: main }]
  return [{ key: entryKey(date, es[0]!, recs), where: two[0] }, { key: entryKey(date, es[1]!, recs), where: two[1] }]
}
const ROW = (w: string) => (w === 'top' ? 't' : w === 'bot' ? 'b' : w === 'whole' || w === 'left' || w === 'right' ? 'f' : '')
/** whether the box `a` (on a day) joins the box `b` on the next day — `aRunStarts` / `bRunEnds`: no box of the key the day
 *  before `a` / the day after `b` (a half box joins only at its run's own end) */
function meets(a: JoinBox, b: JoinBox, aRunStarts: boolean, bRunEnds: boolean): boolean {
  if (!a.key || a.key !== b.key || ROW(a.where) !== ROW(b.where) || !ROW(a.where)) return false
  if (ROW(a.where) === 'f') {
    if (a.where === 'left' || b.where === 'right') return false
    if (a.where === 'right' && !aRunStarts) return false
    if (b.where === 'left' && !bRunEnds) return false
  }
  return true
}
/** the join classes of each box of one day: ' jl' (joined to the day before), ' jr' (to the day after) */
/* A DAY'S JOIN READS ITS NEIGHBOURS — up to TWO days either side (`has` below), across a month's edge too — so a month's memo
   compares those days as well (`sameDays`, JOIN_REACH). */
export const JOIN_REACH = 2
export function joinClasses(date: string, views: Record<string, DayView> | undefined, recs: PersonRecs): string[] {
  const here = dayBoxes(date, views?.[date], recs)
  if (!here.length) return []
  const prevD = addDays(date, -1), nextD = addDays(date, 1)
  const prev = dayBoxes(prevD, views?.[prevD], recs), next = dayBoxes(nextD, views?.[nextD], recs)
  const has = (d: string, key: string | null) => !!key && dayBoxes(d, views?.[d], recs).some(x => x.key === key)
  return here.map(b => {
    const l = prev.some(x => meets(x, b, !has(addDays(prevD, -1), x.key), !has(nextD, b.key)))
    const r = next.some(x => meets(b, x, !has(prevD, b.key), !has(addDays(nextD, 1), x.key)))
    return `${l ? ' jl' : ''}${r ? ' jr' : ''}`
  })
}
/** The fill of a day's second entry, by the same rule as the first: a request pending or refused, anything else filed,
 *  credited or approved. */
export const entryFill = (c: Contrib) => c.kind === 'request' ? (c.state === 'refused' ? 'r' : 'w') : 'a'

// A placeholder cell's width, all three properties so auto table layout can
// neither widen nor narrow it (Matrix `applyPlaceholders`).
export const setPhWidth = (el: HTMLElement, w: string) => {
  const s = el.style
  s.width = w; s.minWidth = w; s.maxWidth = w
}
