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

/* caldrag.ts's own numbers */
const HOLD = 180        // ms a finger must dwell before a drag arms
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

export interface SelectCtx {
  order: () => string[]     // visible person ids, top → bottom
  dates: () => string[]     // ordered day strings, left → right
  enabled: () => boolean    // selection allowed right now (not arranging, a sheet closed, …)
  onSelect: (sel: Selection) => void
}
/* elementFromPoint works in client coords regardless of the table's CSS
   `zoom`, so the hit-test needs no un-scaling. */

const cellAt = (x: number, y: number): Cell | null =>
  parseCellId((document.elementFromPoint(x, y) as HTMLElement | null)?.closest('[data-testid^="cell-"]')?.getAttribute('data-testid'))

/** Attach the one selection listener to `.mx-wrap`. Returns a teardown. */
export function wireSelect(wrap: HTMLElement, ctx: SelectCtx): () => void {
  let anchor: Cell | null = null
  let armed = false
  let pid = -1
  let sx = 0, sy = 0
  let holdTimer: any = null
  let painted = new Set<string>()  // testids currently wearing .selcell
  let raf = 0
  let lastX = 0, lastY = 0
  let touchGesture = false   // this drag started from a finger, not a mouse

  const clearPaint = () => {
    for (const id of painted) wrap.querySelector(`[data-testid="${id}"]`)?.classList.remove('selcell')
    painted = new Set()
  }
  const paint = (sel: Selection | null) => {
    const want = new Set((sel?.cells ?? []).map(c => `cell-${c.personId}-${c.date}`))
    for (const id of painted) if (!want.has(id)) wrap.querySelector(`[data-testid="${id}"]`)?.classList.remove('selcell')
    for (const id of want) if (!painted.has(id)) wrap.querySelector(`[data-testid="${id}"]`)?.classList.add('selcell')
    painted = want
  }

  const focusFrom = (clientX: number, clientY: number): Cell | null => cellAt(clientX, clientY)

  const repaint = () => {
    if (!armed || !anchor) return
    const f = focusFrom(lastX, lastY)
    if (f) paint(rectCells(ctx.order(), ctx.dates(), anchor, f))
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
    // Capture the pointer only now that a DRAG is real. Taking it on
    // pointerdown breaks a plain tap: Chromium retargets the click that
    // follows a captured pointerup to the capturing element (the wrap), so
    // the cell's own onClick — the single-cell input sheet — never fires.
    // The window-level move/up listeners already track the drag without it;
    // capture is just belt-and-braces for a fast touch drag.
    if (pid >= 0) { try { wrap.setPointerCapture(pid) } catch { /* jsdom / not capturable */ } }
    wrap.style.touchAction = 'none'
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
      else if (moved > GIVEUP) { teardown(); clearPaint() }  // a slide before the hold armed = a scroll; let it go
      return
    }
    e.preventDefault()
    repaint()
  }

  const finish = (commit: boolean) => {
    const a = anchor
    const wasArmed = armed
    teardown()
    if (commit && wasArmed && a) {
      const f = focusFrom(lastX, lastY) ?? a
      const sel = rectCells(ctx.order(), ctx.dates(), a, f)
      if (sel) {
        // swallow the click the browser fires on the anchor cell after this
        // pointerup, or its single-cell onClick would open the wrong sheet
        const swallow = (ev: Event) => { ev.stopPropagation(); ev.preventDefault() }
        document.addEventListener('click', swallow, { capture: true, once: true })
        setTimeout(() => document.removeEventListener('click', swallow, true), 0)
        ctx.onSelect(sel)
      }
    }
    clearPaint()
  }

  const onUp = () => finish(true)

  function teardown() {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null }
    if (raf) { cancelAnimationFrame(raf); raf = 0 }
    window.removeEventListener('pointermove', onMove, true)
    window.removeEventListener('pointerup', onUp, true)
    window.removeEventListener('pointercancel', onCancel, true)
    if (pid >= 0) { try { wrap.releasePointerCapture(pid) } catch { /* not captured */ } }
    wrap.removeEventListener('touchmove', onTouchMove)
    wrap.style.touchAction = ''
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
    const cell = parseCellId((e.target as HTMLElement)?.closest?.('[data-testid^="cell-"]')?.getAttribute('data-testid'))
    if (!cell) return                                       // not a day cell (who / bal / handle)
    anchor = cell; armed = false; pid = e.pointerId
    touchGesture = e.pointerType !== 'mouse'
    sx = e.clientX; sy = e.clientY; lastX = e.clientX; lastY = e.clientY
    // NB: pointer capture is taken in arm(), not here — see the note there.
    window.addEventListener('pointermove', onMove, true)
    window.addEventListener('pointerup', onUp, true)
    window.addEventListener('pointercancel', onCancel, true)
    if (e.pointerType !== 'mouse') holdTimer = setTimeout(arm, HOLD)
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
  opts: { count: number; onCommit: (targetDate: string) => void; onCancel: () => void },
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

  const onMouseMove = (e: MouseEvent) => {
    ghost.style.display = ''
    ghost.style.left = `${e.clientX + 14}px`
    ghost.style.top = `${e.clientY + 14}px`
  }
  const onClick = (e: MouseEvent) => {
    const cell = parseCellId((e.target as HTMLElement)?.closest?.('[data-testid^="cell-"]')?.getAttribute('data-testid'))
    if (!cell) return
    e.stopPropagation(); e.preventDefault()   // never open the cell's own sheet
    opts.onCommit(cell.date)
  }
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); opts.onCancel() } }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('click', onClick, true)   // capture — beat React's cell onClick
  document.addEventListener('keydown', onKey, true)
  return () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('click', onClick, true)
    document.removeEventListener('keydown', onKey, true)
    ghost.remove()
  }
}

/** Whole days between two YYYY-MM-DD dates (b − a), for the move delta. */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000)
}
