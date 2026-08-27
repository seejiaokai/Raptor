/* DRAG-TO-SELECT on the Leave War grid (owner, 27 Aug 26 — "all users … can
   left click, to drag to select whatever items … like a row of LL").

   Two halves, split the way `caldrag.ts` splits: a PURE geometry core
   (`rectCells`) that turns an anchor + focus cell into the rectangle of cells
   between them, DOM-free and unit-tested; and a POINTER CONTROLLER
   (`wireSelect`) that lives on the one `.mx-wrap` scroller — never per-cell,
   the grid is ~28k nodes and every perf note in Matrix.tsx forbids that — and
   hit-tests with `elementFromPoint().closest('[data-testid^="cell-"]')`, the
   same shape `startRowDrag` already uses here.

   The grid's sideways scroll is sacred (the owner reported it broken three
   times), so the gesture ARMS before it claims anything: a mouse arms at a
   4px move; a finger must HOLD 180ms, and a slide past 26px before that cedes
   to the native scroll. Only after arming is `touch-action` suppressed. An
   un-armed press is an ordinary click — every existing cell test (plain
   `fireEvent.click`) still opens its single-cell sheet untouched.

   Feel constants are caldrag's verbatim, for one muscle memory across the app. */

export type Cell = { personId: string; date: string }
export type Selection = { people: string[]; from: string; to: string; cells: Cell[] }
// An EVENT selection (owner, 27 Aug 26) — a date span on ONE event line. Events
// live one row each, so there is no people axis; a drag never crosses lines.
export type EventCell = { line: number; date: string }
export type EventSelection = { line: number; from: string; to: string; dates: string[] }

/* caldrag.ts's own numbers */
const HOLD = 180        // ms a finger must dwell before a drag arms
const SLOWARM = 140     // ms down after which a slide past the slop arms a
                        // SELECT instead of ceding — a slow, deliberate drag,
                        // never a quick scroll flick (owner, 27 Aug 26)
const SLOP = 8          // wobble tolerated while dwelling (touch)
const GIVEUP = 26       // a pre-arm slide past this is a scroll, not a select
const MOUSE_SLOP = 4    // a mouse arms on this move, no dwell
const EDGE = 36         // px from a wrap edge that auto-scrolls during a drag
const EDGE_STEP = 18    // px per frame of edge auto-scroll

/* testid is `cell-<person>-<YYYY-MM-DD>`; the date is always the last 10
   chars, so a person id may hold anything and this still splits cleanly */
export function parseCellId(testid: string | null | undefined): Cell | null {
  if (!testid || !testid.startsWith('cell-')) return null
  const rest = testid.slice(5)
  if (rest.length < 12) return null
  const date = rest.slice(-10)
  const personId = rest.slice(0, -11) // drop the '-' before the date too
  if (!personId) return null
  return { personId, date }
}

/** The rectangle of cells between anchor and focus, in the grid's own row and
 *  column order. `null` if either endpoint is off the given order/date lists
 *  (a stale hit-test), so the caller paints nothing rather than guessing. */
export function rectCells(order: string[], dates: string[], a: Cell, f: Cell): Selection | null {
  const ai = order.indexOf(a.personId), fi = order.indexOf(f.personId)
  const ad = dates.indexOf(a.date), fd = dates.indexOf(f.date)
  if (ai < 0 || fi < 0 || ad < 0 || fd < 0) return null
  const r0 = Math.min(ai, fi), r1 = Math.max(ai, fi)
  const c0 = Math.min(ad, fd), c1 = Math.max(ad, fd)
  const people = order.slice(r0, r1 + 1)
  const days = dates.slice(c0, c1 + 1)
  const cells: Cell[] = []
  for (const personId of people) for (const date of days) cells.push({ personId, date })
  return { people, from: days[0], to: days[days.length - 1], cells }
}

/* An event DAY cell is `event-<line>-<YYYY-MM-DD>`. The band (`event-band-…`),
   blocked (`event-blocked-…`) and row (`event-row-…`) testids share the prefix
   but are not per-day cells, so this matches ONLY the plain day cell. */
export function parseEventCell(testid: string | null | undefined): EventCell | null {
  const m = /^event-(\d+)-(\d{4}-\d{2}-\d{2})$/.exec(testid ?? '')
  return m ? { line: Number(m[1]), date: m[2] } : null
}

/** The run of one event LINE between two dates, in the grid's own column order.
 *  Events are one row each, so a drag never spans lines — the anchor's line
 *  wins and only the date span matters. `null` if either date is off the given
 *  date list (a stale hit-test), so the caller paints nothing rather than guess. */
export function eventRange(dates: string[], line: number, a: string, f: string): EventSelection | null {
  const ai = dates.indexOf(a), fi = dates.indexOf(f)
  if (ai < 0 || fi < 0) return null
  const c0 = Math.min(ai, fi), c1 = Math.max(ai, fi)
  const span = dates.slice(c0, c1 + 1)
  return { line, from: span[0], to: span[span.length - 1], dates: span }
}

export interface SelectCtx {
  order: () => string[]     // visible person ids, top → bottom
  dates: () => string[]     // ordered day strings, left → right
  enabled: () => boolean    // selection allowed right now (not arranging, a sheet closed, …)
  onSelect: (sel: Selection) => void
  // Events (admin only): a drag along ONE event line selects a date span and
  // opens the event sheet for it (owner, 27 Aug 26). `eventsEnabled` absent or
  // false ⇒ event cells are not selectable (a member, or the rows are gone).
  eventsEnabled?: () => boolean
  onEventSelect?: (sel: EventSelection) => void
}
/* elementFromPoint works in client coords regardless of the table's CSS
   `zoom`, so the hit-test needs no un-scaling. */

const cellAt = (x: number, y: number): Cell | null =>
  parseCellId((document.elementFromPoint(x, y) as HTMLElement | null)?.closest('[data-testid^="cell-"]')?.getAttribute('data-testid'))
const eventAt = (x: number, y: number): EventCell | null =>
  parseEventCell((document.elementFromPoint(x, y) as HTMLElement | null)?.closest('[data-testid^="event-"]')?.getAttribute('data-testid'))

/** Attach the one selection listener to `.mx-wrap`. Returns a teardown. */
type Hit = { kind: 'roster'; cell: Cell } | { kind: 'event'; cell: EventCell }

export function wireSelect(wrap: HTMLElement, ctx: SelectCtx): () => void {
  let anchor: Hit | null = null
  let armed = false
  let pid = -1
  let sx = 0, sy = 0
  let holdTimer: any = null
  let slowTimer: any = null       // fires at SLOWARM; flips slowReady
  let slowReady = false           // the finger has been down long enough that a
                                  // slide now reads as a slow drag, not a flick
  let painted = new Set<string>()  // testids currently wearing .selcell
  let raf = 0
  let lastX = 0, lastY = 0
  let touchGesture = false   // this drag started from a finger, not a mouse

  const clearPaint = () => {
    for (const id of painted) wrap.querySelector(`[data-testid="${id}"]`)?.classList.remove('selcell')
    painted = new Set()
  }
  const paintIds = (ids: string[]) => {
    const want = new Set(ids)
    for (const id of painted) if (!want.has(id)) wrap.querySelector(`[data-testid="${id}"]`)?.classList.remove('selcell')
    for (const id of want) if (!painted.has(id)) wrap.querySelector(`[data-testid="${id}"]`)?.classList.add('selcell')
    painted = want
  }

  // The selection under the current focus point, as the ids to paint plus the
  // typed payload to hand off on release. Roster and event anchors take separate
  // axes: a roster drag is a people×days rectangle; an event drag is a date span
  // on the anchor's own line (the focus supplies only the COLUMN — its row is
  // ignored, so a finger straying onto another row still extends the span).
  const current = (): { ids: string[]; roster?: Selection; event?: EventSelection } | null => {
    if (!anchor) return null
    if (anchor.kind === 'roster') {
      const f = cellAt(lastX, lastY) ?? anchor.cell
      const sel = rectCells(ctx.order(), ctx.dates(), anchor.cell, f)
      return sel ? { ids: sel.cells.map(c => `cell-${c.personId}-${c.date}`), roster: sel } : null
    }
    const fd = cellAt(lastX, lastY)?.date ?? eventAt(lastX, lastY)?.date ?? anchor.cell.date
    const sel = eventRange(ctx.dates(), anchor.cell.line, anchor.cell.date, fd)
    return sel ? { ids: sel.dates.map(d => `event-${sel.line}-${d}`), event: sel } : null
  }

  const repaint = () => {
    if (!armed || !anchor) return
    const s = current()
    paintIds(s ? s.ids : [])
  }

  // Auto-scroll the grid when a MOUSE drag reaches a wrap edge, so a desktop
  // selection can run past the visible columns. NOT on touch (owner, 27 Aug 26
  // — "the calendar also follows my drag … only for phone"): on a ~390px phone
  // the 36px edge band is a big slice of the screen and the finger occludes the
  // cells, so the day columns slid away under the drag and the selection felt
  // out of control. A phone selects exactly the days it can see; edge scroll is
  // never started for a touch gesture (see arm()).
  const edgeScroll = () => {
    raf = 0
    if (!armed) return
    const r = wrap.getBoundingClientRect()
    let dx = 0
    if (lastX > r.right - EDGE) dx = EDGE_STEP
    else if (lastX < r.left + EDGE) dx = -EDGE_STEP
    if (dx) { wrap.scrollLeft += dx; repaint() }
    if (armed) raf = requestAnimationFrame(edgeScroll)
  }

  const arm = () => {
    armed = true
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null }
    if (slowTimer) { clearTimeout(slowTimer); slowTimer = null }
    // Capture the pointer only now that a DRAG is real. Taking it on
    // pointerdown breaks a plain tap: Chromium retargets the click that
    // follows a captured pointerup to the capturing element (the wrap), so
    // the cell's own onClick — the single-cell input sheet — never fires.
    // The window-level move/up listeners already track the drag without it;
    // capture is just belt-and-braces for a fast touch drag.
    if (pid >= 0) { try { wrap.setPointerCapture(pid) } catch { /* jsdom / not capturable */ } }
    wrap.style.touchAction = 'none'
    // Say — loudly — that the select has GRABBED. A phone user needs to SEE the
    // long-press take before they drag, or they never learn the rhythm and the
    // drag reads as broken (owner, 27 Aug 26 — "I can't select a range … stuck
    // with 1 input"): `.selecting` makes the wash brighter and the ring thicker
    // than the resting highlight (matrix.css), and Android gets a short haptic.
    // iOS has no web vibrate, so the visual cue carries it there.
    wrap.classList.add('selecting')
    try { (navigator as { vibrate?: (ms: number) => void }).vibrate?.(12) } catch { /* unsupported */ }
    // Lock the scroll now, and ONLY now: the non-passive touchmove listener
    // exists for the life of an armed drag and nowhere else, so a normal
    // sideways scroll never runs JS per frame (that scroll is sacred). See the
    // onTouchMove note.
    wrap.addEventListener('touchmove', onTouchMove, { passive: false })
    repaint()
    // Edge auto-scroll is a desktop-only convenience — a phone drag keeps the
    // grid still (see edgeScroll).
    if (!touchGesture && !raf) raf = requestAnimationFrame(edgeScroll)
  }

  const onMove = (e: PointerEvent) => {
    if (!anchor) return
    lastX = e.clientX; lastY = e.clientY
    if (!armed) {
      const dx = Math.abs(e.clientX - sx), dy = Math.abs(e.clientY - sy)
      const moved = Math.max(dx, dy)
      if (e.pointerType === 'mouse') { if (moved >= MOUSE_SLOP) arm() }
      else if (moved > GIVEUP) {
        // A slide past the slop before the still-hold armed. If the finger has
        // already been down past SLOWARM (slowReady), this is a SLOW, deliberate
        // drag the user began without pausing first — arm the select rather
        // than lose it (owner, 27 Aug 26 — "I can't select a range … stuck with
        // 1 input"). A quick scroll flick crosses the slop long before SLOWARM,
        // so the grid's sacred sideways scroll still wins it: cede.
        if (slowReady) arm()
        else { teardown(); clearPaint() }
      }
      return
    }
    e.preventDefault()
    repaint()
  }

  const finish = (commit: boolean) => {
    // Read the selection BEFORE teardown nulls the anchor.
    const s = commit && armed && anchor ? current() : null
    teardown()
    if (s) {
      // swallow the click the browser fires on the anchor cell after this
      // pointerup, or its single-cell onClick would open the wrong sheet
      const swallow = (ev: Event) => { ev.stopPropagation(); ev.preventDefault() }
      document.addEventListener('click', swallow, { capture: true, once: true })
      setTimeout(() => document.removeEventListener('click', swallow, true), 0)
      if (s.roster) ctx.onSelect(s.roster)
      else if (s.event) ctx.onEventSelect?.(s.event)
    }
    clearPaint()
  }

  const onUp = () => finish(true)

  function teardown() {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null }
    if (slowTimer) { clearTimeout(slowTimer); slowTimer = null }
    slowReady = false
    if (raf) { cancelAnimationFrame(raf); raf = 0 }
    window.removeEventListener('pointermove', onMove, true)
    window.removeEventListener('pointerup', onUp, true)
    window.removeEventListener('pointercancel', onCancel, true)
    if (pid >= 0) { try { wrap.releasePointerCapture(pid) } catch { /* not captured */ } }
    wrap.removeEventListener('touchmove', onTouchMove)
    wrap.style.touchAction = ''
    wrap.classList.remove('selecting')
    anchor = null; armed = false; pid = -1
  }
  const onCancel = () => { teardown(); clearPaint() }

  // THE SCROLL LOCK (owner, 27 Aug 26 — "when I hold then drag … I can't
  // select a date range, I'm stuck with just adding 1 input"). On touch the
  // browser decides at touchstart whether the finger scrolls the grid, and a
  // pointermove's preventDefault does NOT change that — so once the drag
  // moved, the grid scrolled and the browser fired pointercancel, killing the
  // armed selection mid-drag. The only thing that stops the scroll is a
  // NON-PASSIVE touchmove preventDefault. This listener is added in arm() and
  // removed in teardown(), so it exists ONLY during an armed drag: the
  // long-press fires arm() before the finger has moved, so the very first move
  // is already caught and no scroll ever starts, while a quick drag that never
  // held never adds it at all — the grid's sideways scroll (sacred, reported
  // broken three times) keeps its fully-passive fast path.
  const onTouchMove = (e: TouchEvent) => { if (armed) e.preventDefault() }

  const onDown = (e: PointerEvent) => {
    if (!ctx.enabled()) return
    if (e.button !== undefined && e.button !== 0) return   // left / primary only
    const el = e.target as HTMLElement
    const roster = parseCellId(el?.closest?.('[data-testid^="cell-"]')?.getAttribute('data-testid'))
    const event = roster ? null : parseEventCell(el?.closest?.('[data-testid^="event-"]')?.getAttribute('data-testid'))
    if (roster) anchor = { kind: 'roster', cell: roster }
    else if (event && (ctx.eventsEnabled?.() ?? false)) anchor = { kind: 'event', cell: event }
    else return   // not a selectable cell (who / bal / handle / a band / events off)
    armed = false; pid = e.pointerId
    touchGesture = e.pointerType !== 'mouse'
    sx = e.clientX; sy = e.clientY; lastX = e.clientX; lastY = e.clientY
    // NB: pointer capture is taken in arm(), not here — see the note there.
    window.addEventListener('pointermove', onMove, true)
    window.addEventListener('pointerup', onUp, true)
    window.addEventListener('pointercancel', onCancel, true)
    if (e.pointerType !== 'mouse') {
      holdTimer = setTimeout(arm, HOLD)
      slowReady = false
      slowTimer = setTimeout(() => { slowReady = true }, SLOWARM)
    }
  }

  wrap.addEventListener('pointerdown', onDown)
  return () => { wrap.removeEventListener('pointerdown', onDown); teardown(); clearPaint() }
}

/* ---- MOVE MODE (owner, 27 Aug 26) ----------------------------------------
   After "Move…", the sheet closes and the block waits to be dropped. On a
   desktop a faded ghost follows the mouse and a CLICK lands it; on a phone
   there is no hover, so a slim banner (drawn by the matrix) stands in and a
   TAP lands it — and a swipe must scroll, never drop, so only a click that
   is NOT the tail of a scroll commits. The commit click is swallowed in the
   capture phase so the cell's own single-click sheet never opens under it. */
export function wireMove(
  wrap: HTMLElement,
  opts: {
    count: number
    // Desktop only — the mouse hovering a day, so the matrix can paint the
    // landing preview live. A phone has no hover, so this never fires there.
    onHover: (targetDate: string) => void
    // A click (desktop) or tap (phone) ON a day. The matrix decides what it
    // means: a desktop click lands the block at once (the live hover was the
    // preview); a phone tap STAGES the landing and shows a Confirm bar, since
    // there is no undo and no hover to preview with (owner, 27 Aug 26).
    onPick: (targetDate: string) => void
    onCancel: () => void
  },
): () => void {
  // Inline-styled on purpose: the ghost lives on document.body, OUTSIDE the
  // `#page-leavewar` section every matrix.css rule is scoped under, so a class
  // would not reach it. It is a transient cursor decoration, not chrome.
  const ghost = document.createElement('div')
  ghost.setAttribute('data-testid', 'move-ghost')
  ghost.textContent = `Move ${opts.count} ${opts.count === 1 ? 'entry' : 'entries'}`
  Object.assign(ghost.style, {
    position: 'fixed', zIndex: '9999', pointerEvents: 'none', display: 'none',
    padding: '4px 10px', borderRadius: '8px', font: '600 12px/1.2 system-ui, sans-serif',
    color: '#E8F6FB', background: 'rgba(20, 40, 50, .92)',
    border: '1px solid rgba(59, 198, 232, .6)', boxShadow: '0 8px 24px rgba(0,0,0,.5)', opacity: '.9',
  } as Partial<CSSStyleDeclaration>)
  document.body.appendChild(ghost)

  const cellAtTarget = (t: EventTarget | null): Cell | null =>
    parseCellId((t as HTMLElement)?.closest?.('[data-testid^="cell-"]')?.getAttribute('data-testid'))

  const onMouseMove = (e: MouseEvent) => {
    ghost.style.display = ''
    ghost.style.left = `${e.clientX + 14}px`
    ghost.style.top = `${e.clientY + 14}px`
    const cell = cellAtTarget(e.target)
    if (cell) opts.onHover(cell.date)
  }
  const onClick = (e: MouseEvent) => {
    const cell = cellAtTarget(e.target)
    if (!cell) return
    e.stopPropagation(); e.preventDefault()   // never open the cell's own sheet
    opts.onPick(cell.date)
  }
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); opts.onCancel() } }
  // Right-click cancels the move on a desktop (owner, 27 Aug 26 — "if I want to
  // cancel, I can just right click to deselect what I selected"): swallow the
  // browser context menu and drop the block, the mouse equivalent of Escape.
  const onCtx = (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); opts.onCancel() }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('click', onClick, true)   // capture — beat React's cell onClick
  document.addEventListener('contextmenu', onCtx, true)
  document.addEventListener('keydown', onKey, true)
  return () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('click', onClick, true)
    document.removeEventListener('contextmenu', onCtx, true)
    document.removeEventListener('keydown', onKey, true)
    ghost.remove()
  }
}

/** Paint the move-mode LANDING preview onto the grid — where the picked block
 *  will sit if dropped now. Stateless (it clears by the `.mvland` class, not a
 *  tracked set) so the matrix can drive it from either the desktop hover or the
 *  phone's staged tap without threading a painter through. */
export function paintLanding(wrap: HTMLElement, cells: Cell[]): void {
  clearLanding(wrap)
  for (const c of cells) wrap.querySelector(`[data-testid="cell-${c.personId}-${c.date}"]`)?.classList.add('mvland')
}
export function clearLanding(wrap: HTMLElement): void {
  wrap.querySelectorAll('.mvland').forEach(el => el.classList.remove('mvland'))
}

/** The earliest day among a set of cells (min YYYY-MM-DD, which sorts as date
 *  order). The move anchors here so the block's FIRST input lands on the tapped
 *  day (owner, 27 Aug 26 — "drop the leave on the day you tap"); any empty
 *  margin the user swept up before it is simply dropped, and the gaps BETWEEN
 *  inputs ride along because every cell shifts by the same delta. `null` for an
 *  empty set. */
export function earliestDate(cells: Cell[]): string | null {
  let min: string | null = null
  for (const c of cells) if (min === null || c.date < min) min = c.date
  return min
}

/** Whole days between two YYYY-MM-DD dates (b − a), for the move delta. */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000)
}
