import { Fragment, useEffect, useRef, useState, type TouchEvent } from 'react'
import {
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
import { autoSortRoster, displayRoster, getState, moveRosterRow, personLabel, setPersLabel } from '../state/store'
import { BidPicker, DecisionSheet, RaptorSheet } from './BidPicker'
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
  const { people, period, grid, states, requirements, role, viewer, eventDefs, openings, ledger, wars, figureOrder, focusDate, focusSeq } = getState()
  const dates = period.days.map(d => d.date)
  const verdicts = evaluatePeriod(people, grid, states, requirements, dates)

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
  const [eventEdit, setEventEdit] = useState<{ line: 0 | 1; date: string } | null>(null)
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
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      const from = dragId.current
      const to = dragOverRef.current
      dragId.current = null
      dragOverRef.current = null
      setDraggingId(null)
      setDragOver(null)
      if (from && to && from !== to) moveRosterRow(from, to)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }
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
    setInView(monthInView(spans, wr.left + frozenWidth(wrap), wr.right))
  }

  // Measured synchronously on scroll rather than deferred to a frame: thirteen
  // rectangle reads is small beside what scrolling a 9,200-node table already
  // costs, and a deferred reading is a reading of where the grid used to be.
  // Re-measured when the war changes too, since that rebuilds every column.
  useEffect(() => {
    measureInView()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period.id, dates.length])

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
              the edit-mode drag handles. A member sees neither — the roster is
              management's to order (the figureOrder rule). */}
          {role === 'admin' && (
            <div className="rostertools">
              <button
                className={`rtbtn${arranging ? ' on' : ''}`}
                data-testid="roster-arrange"
                aria-pressed={arranging}
                title="Drag rows to rearrange the roster by hand"
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
            </div>
          )}
          {/* One button per month the war covers, so the strip fits a
              quarter and a year alike without being told which it is. */}
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
        </div>
        <div
          className="mx-wrap"
          ref={wrapRef}
          onScroll={measureInView}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <table className="mx">
            <thead>
              <tr>
                <th className="who">Callsign</th>
                {/* The counter selector lives in the column header, which is
                    the only place a 40px-wide column has room for a control.
                    Arrows are the guaranteed path on every device; the
                    column is frozen alongside the callsign so the figure
                    stays beside the name however far the grid scrolls. */}
                {/* The WHOLE header is the control. It was two 13px arrows
                    either side of the label, and the owner's verdict from a
                    phone was that they are too small to hit — which they
                    were: a glyph in a 44px column is not a tap target.

                    Tapping anywhere on the header opens a sheet listing every
                    counter at full width, which is the guaranteed path on any
                    device. Swiping across the column is the fast one, and is
                    handled on `.mx-wrap` below. The arrows are gone rather
                    than kept alongside: leaving a control that is known to be
                    too small to hit is worse than having one way in. */}
                <th className="bal" data-testid="counter-head">
                  <button
                    className="cpick"
                    data-testid="counter-pick"
                    aria-label={`Showing ${shown.label}. Choose what this column shows`}
                    onClick={() => setPicking(true)}
                  >
                    <span className="cname" data-testid="counter-name">{shown.label}</span>
                    <span className="cdots" aria-hidden="true">
                      {figures.map((f, i) => (
                        <span key={f.id} className={`cdot${i === shownIx ? ' on' : ''}`} />
                      ))}
                    </span>
                  </button>
                </th>
                {period.days.map(d => {
                  const mon = monthLabel(d.date)
                  return (
                    <th
                      key={d.date}
                      data-testid={`head-${d.date}`}
                      className={`day${d.blocked ? ' blocked' : ''}${isWeekend(d.date) ? ' weekend' : ''}${evKind.has(d.date) ? ` ${evKind.get(d.date)}` : ''}${lockedDate(d.date) ? ' locked' : ''}${d.date === focusDate ? ' focus' : ''}`}
                      title={[d.blocked ? d.blockedReason : '', d.events.filter(Boolean).join(' / ')]
                        .filter(Boolean)
                        .join(' — ')}
                    >
                      {mon && <span className="mon">{mon}</span>}
                      {/* The day of the week, on every column. A year of
                          columns numbered 01…31 twelve times over gives the
                          eye nothing to hold on to: the weekend banding says
                          where a week ENDS but not which day any given
                          column is, and "which Tuesday" is the question
                          somebody bidding actually asks. Owner's request,
                          10 Aug 26. */}
                      <span className="dow">{dayName(d.date)}</span>
                      {d.date.slice(8)}
                    </th>
                  )
                })}
              </tr>
            </thead>
            {/* Above the counts, because an event is the REASON a day is
                thin — reading the cause before the effect is the order a
                scheduler works in. */}
            <EventRows
              days={period.days}
              bands={period.bands}
              defs={eventDefs}
              editable={role === 'admin'}
              onEdit={(line, date) => setEventEdit({ line, date })}
            />
            <CountRows verdicts={verdicts} dates={dates} />
            <tbody>
              {(() => {
                // The roster in DISPLAY order (owner, 18 Aug 26): the admin's
                // hand-order, or the categorised default. A group heading is
                // emitted at every top-level boundary, and a CAT sub-heading
                // inside an ops group — the sub-heading is desktop-only in CSS,
                // per the owner ("if it takes up too much space on mobile…").
                const roster = displayRoster()
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
                    // never actionable: bidding leave for a man who has been
                    // posted out is a data-entry accident, not a bid.
                    const actionable = here && openable(p.id, d.date)
                    return (
                      <td
                        key={d.date}
                        data-testid={`cell-${p.id}-${d.date}`}
                        className={`${cls}${actionable ? ' act' : ''}`}
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
      {open && !raptorOwns(states, open.id, open.date)
        && canEditCell(period, role, open.date)
        && !(deciding && isBiddable(grid[open.id]?.[open.date])) && (
        <BidPicker
          key={`${open.id}-${open.date}`}
          callsign={open.callsign}
          personId={open.id}
          date={open.date}
          current={grid[open.id]?.[open.date] ?? ''}
          dates={dates}
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
