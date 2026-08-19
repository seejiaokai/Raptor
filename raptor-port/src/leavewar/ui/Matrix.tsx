import { Fragment, useEffect, useLayoutEffect, useRef, useState, type TouchEvent } from 'react'
import {
  addDays,
  balanceOf,
  canDecide,
  canEditCell,
  catClass,
  catText,
  codeOf,
  columnKindFor,
  displayCell,
  evaluatePeriod,
  groupOf,
  GROUP_LABEL,
  inSquadron,
  isBiddable,
  isDuty,
  opsCatOf,
  orderedFigures,
  DEFAULT_FIGURE_ID,
  dayName,
  isWeekend,
  monthsIn,
  parseCell,
  raptorOwns,
  shiftedFrom,
  stateOf,
  type Group,
  type Person,
} from '../engine'
import { addEventRow, autoSortRoster, DEFAULT_EVENT_ROWS, displayRoster, getState, MAX_EVENT_ROWS, moveRosterRow, orderedManningIds, personLabel, removeEventRow, setPersLabel, setPostOut, setShowSans } from '../state/store'
import { BidPicker, DecisionSheet, PostOutSheet, RaptorSheet } from './BidPicker'
import { CounterSheet, FigureBreakdownSheet, PersonFiguresSheet } from './CounterSheet'
import { PersonSheet } from './PersonSheet'
import { CountRows } from './CountRows'
import { EventRows } from './EventRows'
import { EventSheet } from './EventSheet'
import { monthInView } from './monthview'
import { useVersion } from './useStore'
import './matrix.css'

/** Rounds for display only — 4.5 stays 4.5, 4 does not become "4.0". The
 *  same rule the count rows use; nothing in this engine rounds a real
 *  figure. */
const show = (n: number) => String(Math.round(n * 10) / 10)

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

/** A ground-crew body's free-text label — read-only text, or an edit box while
 *  the roster is being rearranged. Uncontrolled (defaultValue + commit on blur)
 *  so typing does not repaint the grid on every keystroke. */
function PersLabel({ p, editable }: { p: Person; editable: boolean }) {
  const val = personLabel(p)
  if (!editable) {
    return val ? <span className="pers-lbl" data-testid={`perslabel-${p.id}`}>{val}</span> : null
  }
  return (
    <input
      key={val}
      className="pers-in"
      data-testid={`perslabel-in-${p.id}`}
      defaultValue={val}
      placeholder="label…"
      aria-label={`${p.callsign} — role label`}
      onBlur={e => setPersLabel(p.id, e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
    />
  )
}

export function Matrix() {
  useVersion()
  const { people, period, grid, states, requirements, role, viewer, eventDefs, openings, ledger, wars, figureOrder, manningHidden, eventRows, showSans, focusDate, focusSeq } = getState()
  const dates = period.days.map(d => d.date)
  const verdicts = evaluatePeriod(people, grid, states, requirements, dates)
  // Whether the LAST event row still carries any text or band — the remove
  // control is disabled while it does, so nothing is dropped unseen (owner,
  // 18 Aug 26; the store refuses it too).
  const lastEventRowUsed =
    period.days.some(d => (d.events[eventRows - 1] ?? '') !== '') ||
    period.bands.some(b => b.line === eventRows - 1)

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
  const [eventEdit, setEventEdit] = useState<{ line: number; date: string } | null>(null)
  // Edit-mode roster rearranging (owner, 18 Aug 26). Admin-only view state: it
  // turns the drag handles on, so an admin reading the grid does not nudge a
  // row by accident. Auto-sort stays available without it.
  const [arranging, setArranging] = useState(false)
  // Pointer-based drag (owner, 18 Aug 26 — the roster rearranges on a phone
  // too, where HTML5 drag-and-drop does nothing). `dragId`/`dragOverRef` are
  // refs because they change many times a second during a drag and must not
  // repaint the grid; the two bits of STATE mirror them only for the row
  // highlight. One window pointermove/pointerup pair is attached for the life
  // of a drag and torn down on release.
  const dragId = useRef<string | null>(null)
  const dragOverRef = useRef<string | null>(null)
  // The teardown for a drag in flight, so an unmount (role change, war switch)
  // can end it — otherwise its window listeners leak and the row stays stuck
  // in the .dragging highlight.
  const dragCleanup = useRef<(() => void) | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  function startRowDrag(e: React.PointerEvent, id: string) {
    if (e.button != null && e.button !== 0) return // primary pointer only
    e.preventDefault()
    dragId.current = id
    setDraggingId(id)
    const move = (ev: PointerEvent) => {
      const el = document.elementFromPoint(ev.clientX, ev.clientY)
      const row = el && (el as Element).closest ? (el as Element).closest('[data-testid^="row-"]') : null
      const overId = row?.getAttribute('data-testid')?.slice(4) ?? null
      if (overId !== dragOverRef.current) { dragOverRef.current = overId; setDragOver(overId) }
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
      const to = dragOverRef.current
      dragId.current = null
      dragOverRef.current = null
      setDraggingId(null)
      setDragOver(null)
      if (commit && from && to && from !== to) moveRosterRow(from, to)
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
    // Scrolling BY a delta rather than TO an absolute keeps this correct
    // wherever the grid happens to be scrolled already.
    wrap.scrollLeft += cell.getBoundingClientRect().left - wrap.getBoundingClientRect().left - frozenWidth(wrap)
  }

  // Which month the grid is showing, so the strip says where you ARE and not
  // only where you can go. Held as state rather than derived during render
  // because it is a fact about scroll position, which no render sees.
  const [inView, setInView] = useState<string | null>(null)

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
  // a fixed-layout colgroup. Phone only — a desktop window is tall enough
  // that the owner has not asked for it there.
  const headRef = useRef<HTMLTableSectionElement>(null)
  const mirrorRef = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState<{ top: number; left: number; width: number; cols: number[] } | null>(null)

  useEffect(() => {
    setStuck(null)
    // jsdom has neither matchMedia nor layout — the mirror is a browser-only
    // creature and the browser gate is what proves it.
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(max-width: 700px)')
    const onScroll = () => {
      const head = headRef.current
      if (!head || !mq.matches) { setStuck(null); return }
      const r = head.getBoundingClientRect()
      if (r.height === 0) return // jsdom, or not laid out yet — never activate
      // The Raptor top bar is sticky, so "the top" is its lower edge.
      const topEdge = document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0
      if (r.top >= topEdge) { setStuck(null); return }
      setStuck(prev => {
        if (prev) return prev
        const wrap = wrapRef.current
        if (!wrap) return prev
        const wr = wrap.getBoundingClientRect()
        const cells = Array.from(head.querySelectorAll('tr:last-child > th')) as HTMLElement[]
        const cols = cells.map(c => c.getBoundingClientRect().width)
        if (cols.length === 0 || cols.some(w => !w)) return prev
        return { top: topEdge, left: wr.left, width: wr.width, cols }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
    // `zoom` is a dep because it changes every measured width the mirror pins.
    // `visWindow` too (19 Aug 26): a row-set change lets auto layout re-narrow
    // the columns a removed row's chips had widened, and a stuck mirror
    // pinning the OLD widths would sit misaligned over the new ones.
  }, [period.id, dates.length, zoom, visWindow])

  // The mirror starts life at the grid's current horizontal position, and the
  // two scrollers keep each other in lockstep from then on. Assigning an
  // unchanged scrollLeft fires no event, so the pair settles instead of
  // ping-ponging.
  useEffect(() => {
    if (stuck && mirrorRef.current && wrapRef.current) {
      mirrorRef.current.scrollLeft = wrapRef.current.scrollLeft
    }
  }, [stuck])
  const syncMirror = () => {
    const m = mirrorRef.current, w = wrapRef.current
    if (m && w && m.scrollLeft !== w.scrollLeft) m.scrollLeft = w.scrollLeft
  }
  const syncFromMirror = () => {
    const m = mirrorRef.current, w = wrapRef.current
    if (m && w && w.scrollLeft !== m.scrollLeft) w.scrollLeft = m.scrollLeft
  }

  // The bracket row and the header row, rendered once in the grid and again
  // inside the phone mirror. The mirror copy carries no test ids — two nodes
  // answering one id would break every query that expects the real one.
  const bracketRow = (testids: boolean) => (
    <tr className="mbrak" data-testid={testids ? 'month-bracket' : undefined}>
      <th className="brakhd" colSpan={2} />
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
      <th className="who">Callsign</th>
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

  const measureInView = () => {
    const wrap = wrapRef.current
    if (!wrap || months.length === 0 || dates.length === 0) return
    const headLeft = (date: string) =>
      wrap.querySelector<HTMLElement>(`[data-testid="head-${date}"]`)?.getBoundingClientRect().left
    const lastHead = wrap.querySelector<HTMLElement>(`[data-testid="head-${dates[dates.length - 1]}"]`)
    if (!lastHead) return

    // One rect per month plus the last column, not one per day: thirteen
    // reads on a year rather than 365, which is what makes measuring this on
    // every scroll event affordable.
    const edges = months.map(m => headLeft(m.first))
    if (edges.some(e => e === undefined)) return
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
    setInView(monthInView(spans, viewL, viewR))
    // The visible WINDOW for the row filter. Only from a real layout: jsdom
    // reports every rect 0×0, the spans have no width, and a zero-width
    // "window" must leave visWindow at '' (show everyone) rather than hide
    // the whole roster.
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

  // Measured synchronously on scroll rather than deferred to a frame: thirteen
  // rectangle reads is small beside what scrolling a 9,200-node table already
  // costs, and a deferred reading is a reading of where the grid used to be.
  // Re-measured when the war changes too, since that rebuilds every column.
  useEffect(() => {
    measureInView()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period.id, dates.length])

  // Put the anchored column back after a row-set repaint (see anchorRef).
  // Layout effect, not effect: the correction must land in the same frame as
  // the narrowed columns or the reader sees the grid jump and snap back. The
  // scroll it makes re-fires measureInView, whose signature compare then
  // finds the same row set and stops — no loop.
  useLayoutEffect(() => {
    const a = anchorRef.current
    anchorRef.current = null
    if (!a) return
    const wrap = wrapRef.current
    const cell = wrap?.querySelector<HTMLElement>(`[data-testid="head-${a.date}"]`)
    if (!wrap || !cell) return
    const shift = cell.getBoundingClientRect().left - a.left
    if (Math.abs(shift) > 1) wrap.scrollLeft += shift
  }, [visWindow])

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
    canEditCell(period, role, date) ||
    (deciding && isBiddable(grid[personId]?.[date]))

  // A day the squadron may not bid on, drawn as such. Without this the window
  // is invisible: a member taps an October cell, nothing happens, and the app
  // reads as broken rather than as closed. Admin sees no lock — the window
  // does not bind them, so drawing one would be a lie about their own screen.
  const lockedDate = (date: string): boolean => !canEditCell(period, role, date)

  return (
    <div className="stage">
      <div className="card">
        <div className="card-hd">
          <span className="t">{period.name} · {dates.length} days · {people.length} people</span>
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
                </>
              )}
            </div>
          )}
        </div>
        <div
          className="mx-wrap"
          ref={wrapRef}
          onScroll={() => { measureInView(); syncMirror() }}
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
            <CountRows
              verdicts={verdicts}
              dates={dates}
              order={orderedManningIds()}
              hidden={manningHidden}
              arranging={arranging}
              admin={role === 'admin'}
            />
            {/* The month strip, now a row of the grid so it sits between the
                counts and the header (owner's arrows). The buttons live in a
                sticky two-column cell and overflow visibly across the fill
                cell — the grphd technique — so they stay pinned to the left
                edge while the year scrolls under them. */}
            <tbody className="mstripe">
              <tr>
                <td className="mstick" colSpan={2}>
                  <div className="mstrow">
                    <div className="months" data-testid="month-strip">
                      {months.map(m => (
                        <button
                          key={m.first}
                          className={`mjump${m.label === inView ? ' on' : ''}`}
                          data-testid={`month-${m.label.replace(' ', '-')}`}
                          aria-current={m.label === inView ? 'true' : undefined}
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
            <tbody>
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
                let prevG: Group | null = null
                let prevCat = ''
                return roster.map(p => {
                  const g = groupOf(p)
                  const heads: any[] = []
                  if (g !== prevG) {
                    const n = roster.filter(x => groupOf(x) === g).length
                    heads.push(
                      <tr key={`grp-${g}`} className={`grp g-${g.toLowerCase()}`} data-testid={`group-${g}`}>
                        {/* The label sits in a sticky td spanning only the two
                            frozen columns — the SAME technique .who/.bal use —
                            so it stays pinned to the left as the year scrolls;
                            its text overflows visibly over the empty fill cell
                            beside it. (A sticky div inside a full-width colSpan
                            td does not stick — it rides off to the right.) */}
                        <td className="grphd" colSpan={2}>
                          <div className="grphd-in">
                            <span className="gsw" aria-hidden="true" />
                            <span className="gname">{GROUP_LABEL[g]}</span>
                            <span className="gcount">· {n}</span>
                          </div>
                        </td>
                        <td className="grpfill" colSpan={span - 2} />
                      </tr>,
                    )
                    prevG = g
                    prevCat = ''
                  }
                  const cat = opsCatOf(p)
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
                          draggingId && dragOver === p.id && draggingId !== p.id ? 'dragover' : '',
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
                                onPointerDown={e => startRowDrag(e, p.id)}
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
                            {p.pers && <PersLabel p={p} editable={arranging} />}
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
                    // Duty first for the reader — FS/HS are work, not a bid.
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
                      here && code && shiftedFrom(states, p.id, d.date) ? 'moved' : '',
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
        </div>
        {/* The phone's frozen header — the fixed mirror described above the
            sticky machinery. Sits under the top bar (z 55 < the bar's 60 and
            the sheets' 79/80) and never renders in jsdom, where nothing has
            a height to scroll past. */}
        {stuck && (
          <div
            className="mxfixed"
            data-testid="sticky-head"
            style={{ top: stuck.top, left: stuck.left, width: stuck.width }}
          >
            <div className="mxfixed-scroll" ref={mirrorRef} onScroll={syncFromMirror}>
              {/* The measured widths are visual px (they include the zoom),
                  and the mirror table wears the same zoom so its text sizes
                  match — so its layout widths are the measurements divided
                  back out, or the zoom would apply twice. */}
              <table
                className="mx"
                style={{
                  tableLayout: 'fixed',
                  width: stuck.cols.reduce((a, b) => a + b, 0) / zoom,
                  ...(zoom !== 1 ? { zoom } : null),
                }}
              >
                <colgroup>
                  {stuck.cols.map((w, i) => (
                    <col key={i} style={{ width: w / zoom }} />
                  ))}
                </colgroup>
                <tbody className="mxhead">
                  {bracketRow(false)}
                  {headerRow(false)}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Rendered outside `.mx-wrap` on purpose: that wrapper scrolls, and a
          sheet inside it would be clipped by its own scroller. Keyed by the
          cell so opening a second one remounts rather than carrying the
          first's portion choice across. */}
      {/* Raptor's ownership is checked FIRST and short-circuits both other
          sheets. That cell is approved elsewhere: offering a picker or a
          decision on it would offer an action the store will refuse, which
          is worse than offering nothing. */}
      {open && raptorOwns(states, open.id, open.date) && (
        <RaptorSheet
          callsign={open.callsign}
          date={open.date}
          code={grid[open.id]?.[open.date] ?? ''}
          onClose={close}
        />
      )}
      {/* A posted-out cell an admin tapped: the ONE control it offers is Undo,
          and it short-circuits every bid/decision sheet below (owner, 18 Aug
          26). */}
      {open && openPostedOut && role === 'admin' && (
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
          key={`${eventEdit.line}-${eventEdit.date}`}
          line={eventEdit.line}
          date={eventEdit.date}
          onClose={() => setEventEdit(null)}
        />
      )}
      {open && !openPostedOut && !raptorOwns(states, open.id, open.date)
        && canEditCell(period, role, open.date)
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
      {open && !raptorOwns(states, open.id, open.date) && deciding
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
