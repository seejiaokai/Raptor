/* THE ROWS OF THE LEAVE WAR'S GRID — `PersonRow`, `PersonMonth`, their props and the row-only predicates, MOVED WHOLE
   out of Matrix.tsx on 13 Oct 26 (`[LW-ROWS-SPLIT]` — owner D493, D775; Astra's tidiness read §1). A move, not a
   rewrite: every line below is as it stood there, with `export` added to what the grid file still uses. Matrix.tsx
   keeps the controller — state, geometry, selection, the sheets; this file is the paint job of one person's row.
   Nothing on screen changed: `matrix-rows.test.tsx` recorded every row before the move and holds it after. The row
   memo and the per-month memo are these two components' own (`docs/performance.md` §E — "Day cells stay one memoised
   `PersonMonth` per month") — a prop added here is a repaint to argue for; `matrix-rows-memo.test.tsx` pins the row's. */
import { memo, useMemo, type MutableRefObject, type PointerEvent as ReactPointerEvent, type RefCallback } from 'react'
import { shortDate } from './dates'
import { addDays, canEditRow, catClass, catText, codeOf, displayCell, inSquadron, beforeFirstStint, lastDayIn, isBiddable, isDuty, figureLines, isWeekend, parseCell, raptorOwns, shiftedFrom, stateOf, type Person, type Period, type DayInfo, type Grid, type States, type Role, type Figure, type FigureCtx } from '../engine'
import { moveGroupTo, moveGroupPriorityTo, moveManningRowTo, moveRosterRow } from '../state/store'
import { FigureCell, show } from './FigureCell'
import { touchesAM, touchesPM, winsOf, type DayView } from '../engine/dayview'
import type { Portion } from '../engine'
import { outcomeOf } from '../engine'
import type { Views } from '../engine/dayview'

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
const ROSTER_DRAG: RowDragCfg = {
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

// ---- one roster row, memoised (3 Sep 26) ----------------------------------
//
// MEASURED before this existed (built bundle, CPU throttled 4x, ~18,000 cells):
// tapping a cell to open its sheet cost ~1.0s, of which ~0.6s was JS — the
// Matrix rebuilding every cell's JSX because a sheet is Matrix STATE. The
// first open paid the same rebuild ~3 times over as its mount-time
// measurements (strip height, bid box, row window) each stored a result.
// A memoised row repaints only when one of ITS inputs changes, so local UI
// state — a sheet, the quals popover, a drag hover on another row — costs the
// chrome, not the grid. Everything store-derived rides `version`: a bid, a
// decision, a war change, a roster re-projection bumps it and every row
// repaints exactly as before. So the contract is simple: a row is a pure
// function of its props, and every prop is either a primitive or an object
// whose identity changes only with the store version. Event-time callbacks
// go through ONE ref (`api`) so the row never receives a fresh function prop.
//
// The DOM this renders is byte-identical to the inline <tr> it replaced —
// every class, testid, title and handler position is unchanged, which is
// what keeps the geometry gate and the drag-select machinery (which finds
// cells by testid) honest.

export type QualPill = { label: string; color: string }
export const NO_QUALS: QualPill[] = []

export type RowApi = {
  startRowDrag: (e: ReactPointerEvent, id: string, cfg: RowDragCfg) => void
  setWhoOpen: (id: string) => void
  setBalOpen: (v: { person: string; figureId: string }) => void
  setOpen: (v: { id: string; callsign: string; date: string }) => void
  chipEnter: (id: string, el: HTMLElement) => void
  chipLeave: () => void
  chipClick: (p: Person, el: HTMLElement) => void
}

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
  return raptorOwns(states, personId, date) ||
    /* HIS OWN OIL AWARD, AT ANY TIME (owner, D261, 27 Sep 26 — "3 yes"): it opens read only (`ownAwardPresent`)
       where nothing else would — a day not open for him. Another man's award stays shut to a member. */
    ownAwardPresent(view, viewer, personId) ||
    // EVERY DAY OF A PERSON'S OWN ROW OPENS SOMETHING FOR HIM (D1177, D1176, D1225): an open day from today, the bid
    // window; any other day, the closed note (with Delete where his own pending bid stands); his approved leave, its
    // remarks (D418 narrowed). An admin, any row. Another man's row stays shut to a member (owner, 27 Aug 26). Kept
    // CHEAP — no date question here, because this runs for every drawn cell; which sheet opens is decided once, when
    // the cell is opened (Matrix).
    canEditRow(role, viewer, personId) ||
    (deciding && isBiddable(grid[personId]?.[date]))
}

type PersonRowProps = {
  p: Person
  version: number
  period: Period
  /** The DRAWN days — the column window's slice of `period.days` (colwindow.ts)
   *  — as one array per month, each keeping its identity while the war's days
   *  do (Matrix `drawnMonthDays`), so `PersonMonth` can bail out per month. */
  monthDays: DayInfo[][]
  grid: Grid
  states: States
  views: Views
  role: Role
  viewer: string | null
  deciding: boolean
  movedShown: boolean
  shown: Figure
  figureCtx: FigureCtx
  /** The figure this row's counter box is SELECTED on, or null (Matrix
   *  `figSel`, 6 Sep 26 — a drag down one figure column). A primitive, so the
   *  memo only repaints the rows whose own value flips as the run grows. */
  figSel: string | null
  evKind: Map<string, string>
  lockedCols: Set<string>
  quals: QualPill[]
  me: boolean
  arranging: boolean
  dragging: boolean
  over: '' | 'dragover' | 'dragover after'
  api: MutableRefObject<RowApi>
  /** The column window's PLACEHOLDER cells (colwindow.ts, 5 Sep 26): one empty
   *  cell before / after the drawn days standing in for the undrawn months, so
   *  every row keeps the same column count as the header. Sized by Matrix,
   *  never here: `phL`/`phR` are its stable mount hooks that write the width
   *  straight onto the cell (see `applyPlaceholders`). */
  padL: boolean
  padR: boolean
  phL: RefCallback<HTMLTableCellElement>
  phR: RefCallback<HTMLTableCellElement>
}

type PersonMonthProps = {
  p: Person
  version: number
  period: Period
  /** ONE month's days (a `drawnMonthDays` slice — identity is the memo key). */
  days: DayInfo[]
  grid: Grid
  states: States
  /** the day views ([ARCH-STACK] step 4) — the corner mark and leave dated
   *  outside the person's time in the squadron read them */
  views: Views
  role: Role
  viewer: string | null
  deciding: boolean
  movedShown: boolean
  evKind: Map<string, string>
  lockedCols: Set<string>
  api: MutableRefObject<RowApi>
}

// A placeholder cell's width, all three properties so auto table layout can
// neither widen nor narrow it (Matrix `applyPlaceholders`).
export const setPhWidth = (el: HTMLElement, w: string) => {
  const s = el.style
  s.width = w; s.minWidth = w; s.maxWidth = w
}

export const PersonRow = memo(function PersonRow({ p, version, period, monthDays, grid, states, views, role, viewer, deciding, movedShown, shown, figureCtx, figSel, evKind, lockedCols, quals, me, arranging, dragging, over, api, padL, padR, phL, phR }: PersonRowProps) {
  const has = quals.length > 0
  // The selected figure's LINES for this person — the two-line box's own
  // number on top, the days taken from it stacked under (FigureCell, 6 Sep
  // 26). It has to move the instant a bid is placed, because a pending bid
  // has been asked for and cannot be asked for twice — and every store
  // change bumps `version`, so keying the memo on it keeps that true while a
  // window step (which re-renders the row for its new month but changes no
  // figure) no longer walks every war's ledger for all ~58 rows. A balance
  // can go negative (shown red, never refused — the squadron's balances
  // already run negative, §Counters); a total never does. Every figure
  // counts across EVERY war, not the one on screen — leave bid in Jan–Mar
  // still spends against Apr–Jun.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lines = useMemo(() => figureLines(shown, figureCtx, p.id), [shown, figureCtx, p.id, version])
  return (
    /* `me` lights the VIEWER's own row (owner, 17 Aug 26). While arranging the
       row is a drop target the pointer drag reads by hit-test; the drag SOURCE
       is the handle alone, so a tap on the personnel label box types rather
       than starting a drag. */
    <tr
      data-testid={`row-${p.id}`}
      className={[
        me ? 'me' : '',
        arranging ? 'arrange' : '',
        dragging ? 'dragging' : '',
        over,
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
              onPointerDown={e => api.current.startRowDrag(e, p.id, ROSTER_DRAG)}
            >⠿</span>
          )}
          {/* The callsign opens the person's all-figures sheet, for everyone
              (owner, 17 Aug 26). The CAT chip carries the person's colour,
              reused from Raptor's Quals palette, and an SXO sits under the SXO
              heading rather than wearing a second column. The chip: the
              person's CAT, coloured by CAT (an SXO keeps gold wherever they
              sit). When they hold a displayed qualification it becomes a live
              control — hover (desktop) or tap (phone) to list them; the click
              is swallowed so it never also opens the figures sheet the
              callsign owns. A second tap on the SAME chip closes it (the phone
              has no pointer to leave with); a tap on another chip moves it. */}
          <button
            className="whoedit"
            data-testid={`person-${p.id}`}
            title={`${p.callsign} — every figure`}
            onClick={() => api.current.setWhoOpen(p.id)}
          >
            <span className={`cs seat-${p.seat}`}>{p.callsign}</span>
            {/* D283 (the approved picture 4a): a SANS posting shown in his old place (Show SANS off) wears a SANS tag */}
            {p.to !== null && outcomeOf(p) === 'sans' && <span className="po-sans-tag" data-testid={`sans-tag-${p.id}`}>SANS</span>}
            <span
              className={`catchip ${catClass(p)}${has ? ' has-quals' : ''}`}
              data-testid={`cat-${p.id}`}
              aria-label={has ? `${p.callsign} qualifications: ${quals.map(q => q.label).join(', ')}` : undefined}
              onPointerEnter={has ? e => { if (e.pointerType === 'mouse') api.current.chipEnter(p.id, e.currentTarget) } : undefined}
              onPointerLeave={has ? e => { if (e.pointerType === 'mouse') api.current.chipLeave() } : undefined}
              onClick={has ? e => { e.stopPropagation(); api.current.chipClick(p, e.currentTarget) } : undefined}
            >{catText(p) || 'GND'}</span>
          </button>
          {/* The free-text role-label edit box is GONE (owner, 28 Aug 26 —
              "i can edit personnel, dont need to show that, just leave it as
              the callsign/name"). A ground-crew row now shows the same
              callsign + chip as every other row, in Rearrange too. */}
        </div>
      </td>
      {/* A tap opens the person's breakdown of the shown figure — the
          owner's "click the individual personnel counter" (17 Aug 26). The
          td is the target, like every grid cell here: a nested button would
          cost the 44px column its number.
          `dataFig`/`dataPerson` are what the figure DRAG addresses the box by
          (6 Sep 26) — the one vocabulary all three copies of a box share. */}
      <FigureCell
        figure={shown}
        lines={lines}
        personId={p.id}
        extraClass="bal act"
        testid={`bal-${p.id}`}
        dataFig={shown.id}
        dataPerson={p.id}
        selected={figSel === shown.id}
        title={`${p.callsign}: ${shown.label} ${show(lines.top)} ${shown.kind === 'bal' ? 'left' : 'taken'}. Tap for the breakdown`}
        onClick={() => api.current.setBalOpen({ person: p.id, figureId: shown.id })}
      />
      {padL && <td className="lwph lwph-l" ref={phL} />}
      {/* The day cells, one memoised block PER MONTH (6 Sep 26). A window step
          adds a month to every row; with the cells rendered inline, React
          re-reconciled all ~21,000 drawn cells and our per-cell logic re-ran
          for every one of them — profiled at ~⅔ of a month draw's JS on the
          slow laptop. Keyed by the month, not the position, so a month added
          on the LEFT still matches the blocks already drawn. */}
      {monthDays.map(md => (
        <PersonMonth
          key={md[0]!.date}
          p={p}
          version={version}
          period={period}
          days={md}
          grid={grid}
          states={states}
          views={views}
          role={role}
          viewer={viewer}
          deciding={deciding}
          movedShown={movedShown}
          evKind={evKind}
          lockedCols={lockedCols}
          api={api}
        />
      ))}
      {padR && <td className="lwph lwph-r" ref={phR} />}
    </tr>
  )
})

// One month of a person's day cells. `version` is a memo input only: every
// store change still repaints every cell through it, exactly as the row did.
export const PersonMonth = memo(function PersonMonth({ p, period, days, grid, states, views, role, viewer, deciding, movedShown, evKind, lockedCols, api }: PersonMonthProps) {
  return (
    <>
      {days.map(d => {
        const code = grid[p.id]?.[d.date] ?? ''
        const here = inSquadron(p, d.date)
        // `here` is false on both sides of the roster window. Before `from`
        // the person has not arrived yet — that is not the same fact as
        // having been posted out, and must not read as one. Only the "after
        // `to`" direction is a genuine PO.
        /* D320 ([ONE-DOOR], 27 Sep 26): only a day before his FIRST stint is "not yet arrived"; a day in the gap
           between two stints he was here and left — it reads as away, PO with the hatch */
        const notYetArrived = !here && beforeFirstStint(p, d.date)
        /* [ARCH-STACK] step 4 — owner answer C (20 Sep 26): leave may be dated
           before someone posts in and after they post out (clearing leave). It
           SHOWS as the leave code — blank-looking before posting-in, with the
           small PO tag after posting-out — and never counts for manning (the
           hatch stays). */
        const view = views[p.id]?.[d.date]
        /* …and an OIL AWARD dated there too (Astra's final read, 3, 27 Sep 26): one may be given after a man posts out or
           before he posts in ("Place leave or OIL here instead…", N12), and the day drew a bare PO (or blank) that
           nobody could tap — his own award hidden from him, and from the admin's eye. It shows with the posting hatch,
           like the leave beside it, counts nobody (the hatch stays), and his own tap opens it read only (D261). */
        const outLeave = !here && !!code && !!view?.main && (codeOf(view.main.code)?.spends != null || view.main.kind === 'credit')
        const mark = view?.mark ?? ''
        const cls = [
          here ? '' : 'gone',
          outLeave ? 'outlv' : '',
          here && isDuty(code) ? 'duty' : '',
          // The band runs the whole column, not just the header — finding a
          // Tuesday in 90 columns should not need counting. `.gone`'s hatch
          // is declared after the weekend rule so a posted-out weekend still
          // reads as posted out.
          isWeekend(d.date) ? 'weekend' : '',
          // The event column colour (off = green, no-leave = orange),
          // declared after the weekend so a holiday Saturday reads as the
          // holiday, not the weekend.
          evKind.get(d.date) ?? '',
          // Not open for bidding, for this role (a member's closed days — D1177). Declared after the
          // event colour so a locked, tinted day still reads as locked — the
          // same cascade care the .blocked/.weekend pair needs, and for the
          // same reason.
          lockedCols.has(d.date) ? 'locked' : '',
        ].filter(Boolean).join(' ')
        // The stored notation, printed through the one display mapping — the
        // ATT markers read as the owner's bare B / C on the grid while
        // everything else prints as stored (displayCell is identity for it).
        /* `view.main.auto` is the fact the code string cannot carry: an OIL
           credit the APP worked out from the published schedule, rather than
           one a person granted. It prints as the trailing star (owner, 20 Sep
           26). */
        const text = here || outLeave ? displayCell(code, !!view?.main?.auto) : notYetArrived ? '' : 'PO'
        // Duty first for the reader — FO/HO are work, not a bid. (They carry
        // `bid: false`, so they could not reach a bid branch anyway; the
        // order is legibility, not a guard.) Then the bid state, but only
        // where the code is one a person bids for. Everything else is plain
        // information: medical, a course, overseas duty. A bare "PO" chip on
        // a posted-out cell carries no state class at all.
        //
        // A bid with NO decision recorded reads as pending, and PENDING IS
        // PLAIN — no colour class at all, so the chip renders as text on the
        // ordinary cell background. It was purple until 10 Aug 26, when the
        // owner pointed out what that cost: an input nobody had looked at and
        // one already in management's hands were the same colour, so the
        // sheet could not distinguish them. Purple now means acknowledged —
        // somebody has seen this — and the absence of colour means the
        // absence of news.
        const bid = stateOf(states, p.id, d.date)
        const chipState = (!here && !outLeave) || !code
          ? ''
          : isDuty(code) ? 'sc'
          : !isBiddable(code) ? 'info'
          : bid === 'approved' ? 'appr'
          : bid === 'refused' ? 'ref'
          : bid === 'acknowledged' ? 'tbc'
          : ''
        // The half-day fill is read off the stored string via `parseCell`,
        // never kept as its own bit of state and never guessed by matching an
        // asterisk here in the component. The asterisk in `text` stays the
        // one source of truth; this is only a derived echo of it, so the two
        // can never disagree.
        const portion = (here || outLeave) && code ? parseCell(code)?.portion : undefined
        const portionClass = portion === 'am' || portion === 'pm' ? ` ${portion}` : ''
        // Two marks on top of the state colour, never instead of it: the
        // squadron reads green as approved and magenta as pending, and that
        // stays true here. `raptor` says the approval happened elsewhere and
        // nothing on this screen will change it; `moved` says management
        // shifted this bid off another date.
        const marks = [
          (here || outLeave) && code && raptorOwns(states, p.id, d.date) ? 'raptor' : '',
          movedShown && (here || outLeave) && code && shiftedFrom(states, p.id, d.date) ? 'moved' : '',
        ].filter(Boolean).join(' ')
        /* BOTH ENDS of the squadron window are tappable (owner answer C, 20
           Sep 26 — leave outside the window may be "filed OR bid"; and the
           post-in ruling the same day). The old text here said a day before
           someone joins is "blank, not a post-out, and nothing there to undo",
           and `notYetArrived` barred it on both branches. That reading is
           DEAD: there is now a joining date to undo (before the post-in button
           no person had one, so no such day could exist), and answer C says
           leave may be bid there. So the split is now the same at both ends —
           an ADMIN's tap manages the POSTING (the post-out sheet after, the
           post-in sheet before), and the person's OWN tap places LEAVE. */
        const actionable =
          (here && cellOpenable(states, role, viewer, deciding, grid, p.id, d.date, view)) || (role === 'admin' && !here) ||
          // a marked day always opens its list; leave dated outside the
          // squadron window opens for an admin and for the person themself
          (!!mark && (here || outLeave)) || (outLeave && (role === 'admin' || viewer === p.id)) ||
          // …and the person may bid clearing leave after posting out, or leave dated before they post in — on an open day;
          // any other such day of his gives the closed note (D1176)
          (!here && role !== 'admin' && viewer === p.id)
        // Their LAST day in the squadron wears a small PO tag (owner, 19 Aug
        // 26 — chosen over nothing after the edge case was put to him):
        // someone posting out on the 1st has a final month that otherwise
        // looks completely normal, and the next month their row is gone — so
        // without this, a reader jumping month to month never sees the PO at
        // all. The tag rides the corner of the cell so a leave code on the
        // same day still prints.
        /* D320: every stint's last day wears the corner, an earlier one's too */
        const lastIn = lastDayIn(p, d.date)
        const lastCurrent = lastIn && d.date === p.to
        return (
          <td
            key={d.date}
            data-testid={`cell-${p.id}-${d.date}`}
            className={`${cls}${actionable ? ' act' : ''}${lastIn ? ' pofin' : ''}${mark ? ' mkd' : ''}`}
            onClick={actionable
              ? () => api.current.setOpen({ id: p.id, callsign: p.callsign, date: d.date })
              : undefined}
          >
            {text && (
              <span
                className={`c${chipState ? ` ${chipState}` : ''}${portionClass}${marks ? ` ${marks}` : ''}`}
              >
                {text}
              </span>
            )}
            {mark && (here || outLeave || notYetArrived) && (
              <span
                className={`mk ${view!.amber ? 'warn' : 'more'}`}
                data-testid={`mark-${p.id}-${d.date}`}
                /* Item A: on the reader's OWN row an amber day is not "someone
                   else has a job to do" — it is news about their own leave,
                   which is still live. Two audiences, two sentences. */
                title={!view!.amber
                  ? 'More on this day — tap to see'
                  : viewer === p.id
                    ? 'Your bid is still live — tap to see what else is on this day'
                    : 'Something on this day needs an admin — tap to see'}
              >
                {mark}
              </span>
            )}
            {outLeave && !notYetArrived && (
              <span className="potag" data-testid={`potag-${p.id}-${d.date}`}>PO</span>
            )}
            {lastIn && (
              <span
                className="polast"
                data-testid={lastCurrent ? `polast-${p.id}` : `polast-${p.id}-${d.date}`}
                title={lastCurrent
                  ? `${p.callsign} posts out ${shortDate(addDays(p.to!, 1))} — this is their last day in the squadron`
                  : `${p.callsign} was posted out ${shortDate(addDays(d.date, 1))} — the last day of an earlier stint`}
              >
                PO
              </span>
            )}
          </td>
        )
      })}
    </>
  )
})
