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
const SLOWARM = 140     // ms down after which a slide past GIVEUP arms a
                        // SELECT instead of ceding — a slow, deliberate drag,
                        // never a quick scroll flick (owner, 27 Aug 26)
const GIVEUP = 26       // a pre-arm slide past this is a scroll, not a select
                        // (any smaller wobble during the dwell is simply
                        // tolerated — there is no second, tighter threshold)
const MOUSE_SLOP = 4    // a mouse arms on this move, no dwell
const EDGE = 36         // px from an edge that auto-scrolls during a MOUSE drag
const EDGE_STEP = 18    // px per frame of a mouse edge auto-scroll (constant)
const TOUCH_EDGE = 48   // wider edge band for a finger, which is a fatter target
const TOUCH_STEP_MAX = 15 // px per frame at the very edge; RAMPED down to 0 across
                        // the band so the finger throttles the speed by how far it
                        // pushes — the fix for the 27 Aug "columns slid away" feel

/* The grid scrolls SIDEWAYS inside `.mx-wrap` (its `overflow-x`) but UP/DOWN
   with the page — `.mx-wrap` has no height cap, so its vertical overflow lives
   on an ancestor or the document (matrix.css). So a sideways edge-scroll moves
   `wrap.scrollLeft`, but a vertical one moves whatever actually scrolls the
   rows: the nearest scrollable ancestor, else the document. Resolved once per
   armed drag (the DOM doesn't restructure mid-gesture). */
type VScroll = { el: Element; isDoc: boolean }
const findVScroll = (wrap: HTMLElement): VScroll => {
  for (let n = wrap.parentElement; n && n !== document.body; n = n.parentElement) {
    const oy = getComputedStyle(n).overflowY
    if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight + 1) return { el: n, isDoc: false }
  }
  return { el: document.scrollingElement || document.documentElement, isDoc: true }
}

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

/* ---- THE GESTURE CORE ------------------------------------------------------
   Everything about ARMING a drag — the mouse slop, the finger's hold, the
   slow-drag-arms rule, pointer capture, the non-passive touchmove scroll lock,
   the context-menu swallow, edge auto-scroll and the one-shot click swallow on
   release — lives here once, parameterised by WHAT is being selected. The grid
   (`wireSelect`: people × days cells, or a date span on an event line) and the
   OIL tracker (`wireRowSelect`: a run of people rows — owner, 2 Sep 26, "use
   the same mechanics as the leave war grid") are two callers of the same
   machine, so the phone learns one rhythm for both. */
interface GestureSpec<A, P> {
  enabled: () => boolean
  /** The thing under the pointer on pointerdown, or null when the press is
   *  not on something selectable (an ordinary click, then). */
  hit: (target: HTMLElement) => A | null
  /** The selection for the anchor with the pointer at (x, y): the ids to
   *  paint and the payload to hand off on release. The caller holds its own
   *  "last thing the finger was over" so a gap or an edge-scroll never
   *  collapses the selection. `null` paints nothing. */
  current: (anchor: A, x: number, y: number) => { ids: string[]; payload: P } | null
  /** The node an id paints on, inside `wrap`. */
  node: (id: string) => Element | null
  /** The class a painted node wears. */
  cls: string
  onSelect: (payload: P) => void
  /** Called on every teardown so the caller can drop its held focus. */
  reset?: () => void
  /** The element that scrolls the rows VERTICALLY. The grid resolves the
   *  nearest scrolling ancestor (its wrap has no height cap); a modal whose
   *  wrap scrolls both ways passes itself. */
  vscroll?: (wrap: HTMLElement) => VScroll
}

function wireGesture<A, P>(wrap: HTMLElement, spec: GestureSpec<A, P>): () => void {
  let anchor: A | null = null
  let armed = false
  let pid = -1
  let sx = 0, sy = 0
  let holdTimer: any = null
  let slowTimer: any = null       // fires at SLOWARM; flips slowReady
  let slowReady = false           // the finger has been down long enough that a
                                  // slide now reads as a slow drag, not a flick
  let painted = new Set<string>()  // ids currently wearing spec.cls
  let raf = 0
  let lastX = 0, lastY = 0
  let touchGesture = false   // this drag started from a finger, not a mouse
  let vscroll: VScroll | null = null  // the vertical scroller, resolved in arm()

  const clearPaint = () => {
    for (const id of painted) spec.node(id)?.classList.remove(spec.cls)
    painted = new Set()
  }
  const paintIds = (ids: string[]) => {
    const want = new Set(ids)
    for (const id of painted) if (!want.has(id)) spec.node(id)?.classList.remove(spec.cls)
    for (const id of want) if (!painted.has(id)) spec.node(id)?.classList.add(spec.cls)
    painted = want
  }

  const current = () => (anchor === null ? null : spec.current(anchor, lastX, lastY))

  const repaint = () => {
    if (!armed || anchor === null) return
    const s = current()
    paintIds(s ? s.ids : [])
  }

  // Auto-scroll the grid when a drag reaches an edge, so a selection can run
  // PAST what the screen shows — SIDEWAYS onto more days, and UP/DOWN onto more
  // people (owner, 30 Aug 26 — "auto scroll to the edge to continue selecting
  // more grids … in case I want to put longer inputs" → "up down scroller too").
  // It runs ONLY during an armed drag-select, never during a normal scroll (that
  // scroll never arms), so the grid's sacred sideways fling is untouched.
  //   Touch was turned OFF here on 27 Aug 26 because the mouse's CONSTANT speed
  // made the day columns "slide away under the finger" — out of control on a
  // ~390px phone. It is back on for touch with a RAMP: the speed grows the
  // closer the finger is to the true edge and is zero at the band's inner lip,
  // so a light push creeps and a firm push at the very edge runs — the finger
  // throttles it, which is exactly what the constant speed lacked. The mouse
  // keeps its original constant step (desktop has the room and the precision).
  //   The horizontal axis moves `wrap.scrollLeft` against the wrap's own rect;
  // the vertical axis moves the resolved `vscroll` — the page for the grid,
  // whose rows scroll with the page and whose wrap is taller than the screen —
  // against the VIEWPORT (or the scroller's own rect). As the page scrolls
  // under a held finger, elementFromPoint at the same point returns the new
  // row, so the selection extends onto it.
  const ramp = (into: number) => TOUCH_STEP_MAX * Math.min(1, into / TOUCH_EDGE)
  const edgeScroll = () => {
    raf = 0
    if (!armed) return
    const r = wrap.getBoundingClientRect()
    let dx = 0, dy = 0
    // vertical bounds: the viewport for the page, else the scroller's own rect
    const vs = vscroll ?? (vscroll = (spec.vscroll ?? findVScroll)(wrap))
    const vTop = vs.isDoc ? 0 : vs.el.getBoundingClientRect().top
    const vBot = vs.isDoc ? (window.innerHeight || vs.el.clientHeight) : vs.el.getBoundingClientRect().bottom
    if (touchGesture) {
      const intoR = lastX - (r.right - TOUCH_EDGE), intoL = (r.left + TOUCH_EDGE) - lastX
      if (intoR > 0) dx = ramp(intoR); else if (intoL > 0) dx = -ramp(intoL)
      const intoB = lastY - (vBot - TOUCH_EDGE), intoT = (vTop + TOUCH_EDGE) - lastY
      if (intoB > 0) dy = ramp(intoB); else if (intoT > 0) dy = -ramp(intoT)
    } else {
      if (lastX > r.right - EDGE) dx = EDGE_STEP; else if (lastX < r.left + EDGE) dx = -EDGE_STEP
      if (lastY > vBot - EDGE) dy = EDGE_STEP; else if (lastY < vTop + EDGE) dy = -EDGE_STEP
    }
    if (dx) wrap.scrollLeft += dx
    if (dy) vs.el.scrollTop += dy
    if (dx || dy) repaint()
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
    document.addEventListener('contextmenu', onCtxMenu, true)
    repaint()
    // Edge auto-scroll runs for both a mouse and a finger now (owner, 30 Aug 26):
    // touch ramps its speed by finger depth (see edgeScroll). The rAF is stopped
    // in teardown(), so it can never outlive the armed drag.
    if (!raf) raf = requestAnimationFrame(edgeScroll)
  }

  const onMove = (e: PointerEvent) => {
    if (anchor === null) return
    // Only the gesture's OWN pointer moves it — a second finger brushing the
    // grid mid-drag must not steer (or, worse, disarm) the selection.
    if (e.pointerId !== pid) return
    lastX = e.clientX; lastY = e.clientY
    if (!armed) {
      const dx = Math.abs(e.clientX - sx), dy = Math.abs(e.clientY - sy)
      const moved = Math.max(dx, dy)
      if (e.pointerType === 'mouse') { if (moved >= MOUSE_SLOP) arm() }
      else if (moved > GIVEUP) {
        // A slide past GIVEUP before the still-hold armed. If the finger has
        // already been down past SLOWARM (slowReady), this is a SLOW, deliberate
        // drag the user began without pausing first — arm the select rather
        // than lose it (owner, 27 Aug 26 — "I can't select a range … stuck with
        // 1 input"). A quick scroll flick crosses GIVEUP long before SLOWARM,
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
    const s = commit && armed && anchor !== null ? current() : null
    teardown()
    if (s) {
      // swallow the click the browser fires on the anchor cell after this
      // pointerup, or its single-cell onClick would open the wrong sheet
      const swallow = (ev: Event) => { ev.stopPropagation(); ev.preventDefault() }
      document.addEventListener('click', swallow, { capture: true, once: true })
      setTimeout(() => document.removeEventListener('click', swallow, true), 0)
      spec.onSelect(s.payload)
    }
    clearPaint()
  }

  // Commit only on the gesture's own pointer, and only on the PRIMARY button
  // going up: a second finger lifting, or a right button pressed-and-released
  // mid-left-drag, used to commit the rectangle at wherever the cursor
  // happened to be.
  const onUp = (e: PointerEvent) => {
    if (e.pointerId !== pid) return
    if (e.button > 0) return
    finish(true)
  }
  // While a drag is ARMED, a right-click must not pop the browser menu over
  // the selection wash (move mode swallows its own; this covers the drag).
  const onCtxMenu = (e: Event) => { if (armed) e.preventDefault() }

  function teardown() {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null }
    if (slowTimer) { clearTimeout(slowTimer); slowTimer = null }
    slowReady = false
    if (raf) { cancelAnimationFrame(raf); raf = 0 }
    window.removeEventListener('pointermove', onMove, true)
    window.removeEventListener('pointerup', onUp, true)
    window.removeEventListener('pointercancel', onCancel, true)
    document.removeEventListener('contextmenu', onCtxMenu, true)
    if (pid >= 0) { try { wrap.releasePointerCapture(pid) } catch { /* not captured */ } }
    wrap.removeEventListener('touchmove', onTouchMove)
    wrap.style.touchAction = ''
    wrap.classList.remove('selecting')
    anchor = null; armed = false; pid = -1; vscroll = null   // re-resolve next drag
    spec.reset?.()
  }
  const onCancel = (e: PointerEvent) => {
    if (e.pointerId !== pid) return   // a second pointer's cancel is not ours
    teardown(); clearPaint()
  }

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
    if (!spec.enabled()) return
    if (e.button !== undefined && e.button !== 0) return   // left / primary only
    // One gesture at a time: a second finger landing mid-drag used to RESET
    // the state (anchor kept, armed dropped, pid re-aimed), so the armed
    // selection silently evaporated on lift. The first pointer owns the
    // gesture until it ends.
    if (anchor !== null) return
    const a = spec.hit(e.target as HTMLElement)
    if (a === null) return   // not a selectable thing (who / bal / handle / a band / events off)
    anchor = a
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

export function wireSelect(wrap: HTMLElement, ctx: SelectCtx): () => void {
  let lastFocus: Cell | null = null      // last roster cell the finger was over
  let lastFocusDate: string | null = null // last event date the finger was over
  type Payload = { roster?: Selection; event?: EventSelection }

  return wireGesture<Hit, Payload>(wrap, {
    enabled: ctx.enabled,
    cls: 'selcell',
    node: id => wrap.querySelector(`[data-testid="${id}"]`),
    reset: () => { lastFocus = null; lastFocusDate = null },
    hit: el => {
      const roster = parseCellId(el?.closest?.('[data-testid^="cell-"]')?.getAttribute('data-testid'))
      const event = roster ? null : parseEventCell(el?.closest?.('[data-testid^="event-"]')?.getAttribute('data-testid'))
      if (roster) return { kind: 'roster', cell: roster }
      if (event && (ctx.eventsEnabled?.() ?? false)) return { kind: 'event', cell: event }
      return null
    },
    // The selection under the current focus point, as the ids to paint plus the
    // typed payload to hand off on release. Roster and event anchors take separate
    // axes: a roster drag is a people×days rectangle; an event drag is a date span
    // on the anchor's own line (the focus supplies only the COLUMN — its row is
    // ignored, so a finger straying onto another row still extends the span).
    //   When the finger is NOT over a cell — a gap between rows, or the empty area
    // an edge auto-scroll runs the grid past — we HOLD the last cell it was over
    // rather than collapsing to the anchor. Without this a drag to the bottom edge
    // vanished the moment the auto-scroll ran the last row above the finger.
    current: (anchor, x, y) => {
      if (anchor.kind === 'roster') {
        const hit = cellAt(x, y)
        if (hit) lastFocus = hit
        const raw = hit ?? lastFocus ?? anchor.cell
        // The focus may land on a row OUTSIDE the selectable order — a scoped
        // member's drag straying onto another person (the row list is the viewer
        // alone), or a held focus (below) left pointing at a row the order no
        // longer carries. Clamp its PERSON to the anchor's row, keeping the DATE,
        // so the selection stays on a valid row and still spans the days dragged.
        // Without this the stray produced an empty rect (rectCells → null) and the
        // sheet never opened — a scoped member could not drag-fill at all.
        const f = ctx.order().includes(raw.personId) ? raw : { personId: anchor.cell.personId, date: raw.date }
        const sel = rectCells(ctx.order(), ctx.dates(), anchor.cell, f)
        return sel ? { ids: sel.cells.map(c => `cell-${c.personId}-${c.date}`), payload: { roster: sel } } : null
      }
      const hitDate = cellAt(x, y)?.date ?? eventAt(x, y)?.date
      if (hitDate) lastFocusDate = hitDate
      const fd = hitDate ?? lastFocusDate ?? anchor.cell.date
      const sel = eventRange(ctx.dates(), anchor.cell.line, anchor.cell.date, fd)
      return sel ? { ids: sel.dates.map(d => `event-${sel.line}-${d}`), payload: { event: sel } } : null
    },
    onSelect: p => {
      if (p.roster) ctx.onSelect(p.roster)
      else if (p.event) ctx.onEventSelect?.(p.event)
    },
  })
}

/* ---- ROW SELECT (the OIL tracker, owner 2 Sep 26) -------------------------
   A run of PEOPLE rows, one axis. The press must land on a row's PICK target
   (`[data-oilpick]` — the name cell), so the history strip beside it keeps
   its ordinary sideways scroll and never starts a selection; the drag then
   extends over any part of the rows below or above (`[data-oilrow]`). Same
   hold-then-drag on a finger, same slop on a mouse, same scroll lock. */
export interface RowSelectCtx {
  order: () => string[]     // selectable row ids, top → bottom
  enabled: () => boolean
  onSelect: (ids: string[]) => void
}

/** The run of rows between two ids in `order`; `null` off the list. */
export function rowRun(order: string[], a: string, f: string): string[] | null {
  const ai = order.indexOf(a), fi = order.indexOf(f)
  if (ai < 0 || fi < 0) return null
  return order.slice(Math.min(ai, fi), Math.max(ai, fi) + 1)
}

const rowAt = (x: number, y: number): string | null =>
  (document.elementFromPoint(x, y) as HTMLElement | null)?.closest('[data-oilrow]')?.getAttribute('data-oilrow') ?? null

export function wireRowSelect(wrap: HTMLElement, ctx: RowSelectCtx): () => void {
  let lastFocus: string | null = null
  return wireGesture<string, string[]>(wrap, {
    enabled: ctx.enabled,
    cls: 'selrow',
    node: id => wrap.querySelector(`[data-oilrow="${id}"]`),
    reset: () => { lastFocus = null },
    vscroll: w => ({ el: w, isDoc: false }),
    hit: el => {
      const pick = el?.closest?.('[data-oilpick]')?.closest('[data-oilrow]')?.getAttribute('data-oilrow') ?? null
      return pick && ctx.order().includes(pick) ? pick : null
    },
    current: (anchor, x, y) => {
      const hit = rowAt(x, y)
      if (hit && ctx.order().includes(hit)) lastFocus = hit
      const run = rowRun(ctx.order(), anchor, lastFocus ?? anchor)
      return run ? { ids: run, payload: run } : null
    },
    onSelect: ctx.onSelect,
  })
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
    // How to read the target DATE from the pointer's element. Defaults to the
    // roster cell parser (`cell-<person>-<date>`), unchanged; the EVENT move
    // (owner, 31 Aug 26 — "drag an existing event to move it") passes one that
    // also reads an `event-<line>-<date>` cell, so a tap on the event LINE lands
    // it. Only the date is ever used, so one resolver serves both axes.
    dateAt?: (t: EventTarget | null) => string | null
  },
): () => void {
  // The ghost is a HOVER decoration, so it exists only where hover exists: a
  // phone fires compatibility mousemove events around a tap, and those used to
  // unhide the chip at the tap point — a stranded copy of the banner that then
  // teleported tap to tap. `(hover: none)` is the device truth; when
  // matchMedia itself is absent (jsdom) the desktop path stands.
  const hasHover = (() => {
    try { return typeof window.matchMedia !== 'function' || !window.matchMedia('(hover: none)').matches }
    catch { return true }
  })()
  // Inline-styled on purpose: the ghost lives on document.body, OUTSIDE the
  // `#page-leavewar` section every matrix.css rule is scoped under, so a class
  // would not reach it. It is a transient cursor decoration, not chrome.
  const ghost = hasHover ? document.createElement('div') : null
  if (ghost) {
    ghost.setAttribute('data-testid', 'move-ghost')
    ghost.textContent = `Move ${opts.count} ${opts.count === 1 ? 'entry' : 'entries'}`
    Object.assign(ghost.style, {
      position: 'fixed', zIndex: '9999', pointerEvents: 'none', display: 'none',
      padding: '4px 10px', borderRadius: '8px', font: '600 12px/1.2 system-ui, sans-serif',
      color: '#E8F6FB', background: 'rgba(20, 40, 50, .92)',
      border: '1px solid rgba(59, 198, 232, .6)', boxShadow: '0 8px 24px rgba(0,0,0,.5)', opacity: '.9',
    } as Partial<CSSStyleDeclaration>)
    document.body.appendChild(ghost)
  }

  const cellAtTarget = (t: EventTarget | null): Cell | null =>
    parseCellId((t as HTMLElement)?.closest?.('[data-testid^="cell-"]')?.getAttribute('data-testid'))
  // Resolve the target DATE — the caller's own resolver (event move) or the
  // default roster-cell one (unchanged behaviour for the roster move).
  const dateAt = opts.dateAt ?? ((t: EventTarget | null) => cellAtTarget(t)?.date ?? null)

  // The hover preview re-fires only when the hovered DAY changes. Mousemove
  // arrives per pixel (~60-120/s), and the first cut repainted the landing —
  // full-grid querySelector scans — on every one of them; on the ~28k-node
  // grid that is exactly the per-frame work the perf notes forbid.
  let lastHover = ''
  const onMouseMove = (e: MouseEvent) => {
    if (ghost) {
      ghost.style.display = ''
      ghost.style.left = `${e.clientX + 14}px`
      ghost.style.top = `${e.clientY + 14}px`
    }
    if (!hasHover) return
    const date = dateAt(e.target)
    if (date && date !== lastHover) { lastHover = date; opts.onHover(date) }
  }
  const onClick = (e: MouseEvent) => {
    const date = dateAt(e.target)
    if (!date) return
    e.stopPropagation(); e.preventDefault()   // never open the cell's own sheet
    opts.onPick(date)
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
    ghost?.remove()
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

/** Paint the move-mode LANDING preview onto an EVENT line — the days the moved
 *  event will cover if dropped now (owner, 31 Aug 26). Shares the `.mvland`
 *  class and `clearLanding` with the roster painter, so a move is only ever one
 *  kind at a time and one clearer wipes either. */
export function paintEventLanding(wrap: HTMLElement, line: number, dates: string[]): void {
  clearLanding(wrap)
  for (const d of dates) wrap.querySelector(`[data-testid="event-${line}-${d}"]`)?.classList.add('mvland')
}

/** Read the target DATE for an EVENT move from a pointer element — the event
 *  line's own `event-<line>-<date>` cell, or a roster cell in the same column as
 *  a fallback (a tap just below the event row still lands on the day). A merged
 *  `event-band-…` cell resolves to null: you land on a free day, not on another
 *  band. Only the date matters for a move, so either precise cell resolves it. */
export function eventMoveDateAt(t: EventTarget | null): string | null {
  const el = (t as HTMLElement)?.closest?.('[data-testid^="event-"], [data-testid^="cell-"]')
  const id = el?.getAttribute('data-testid')
  return parseEventCell(id)?.date ?? parseCellId(id)?.date ?? null
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
