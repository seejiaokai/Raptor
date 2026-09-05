/* Drag & drop — the reference's whole DnD block (mouse HTML5 drag + the
   touch-pointer state machine that reuses it), bodies verbatim. The ONE
   mutation path is applyDrop(): mouse drop and touch lift both call it, so
   the two input methods can never drift apart. Repaint is the store's
   notify(), folded into applyDrop's done(). */
import { PEOPLE } from '../engine/people'
import { slotVal, setSlotVal, fillSlot } from '../engine/slots'
import { slotBar } from '../engine/avail'
import { WARN } from '../engine/validate'
import { keyDay } from '../engine/keys'
import { HOOKS } from '../engine/hooks'
import * as view from '../state/view'
import { notify } from '../state/store'
import { flagDrop } from '../state/dropflag'
import { canEditSched } from '../state/auth'
import { reassignInput } from './inputedit'
import { DBG, initDragDbg } from './dragdbg'

const editMode = () => HOOKS.editMode()

const toast = (...a: any[]) => HOOKS.toast(...a)
const isPhone = () => HOOKS.isPhone()

export let DRAG: any = null                     // {kind:'slot',key} | {kind:'roster',id}
/* probes and tests need to place a drag in flight from outside the module
   (the reference's DRAG was a window global, assignable from anywhere) */
export function setDrag(v: any) { DRAG = v }

/* [data-inpseat] (an Unavailable row's person cell) is a drop target too —
   see applyDrop's own branch for why it is handled apart from the seat/fill
   cases just below it rather than folded in: it is a data edit to an INPUT,
   never a schedule seat, so it must not run through setSlotVal/fillSlot. */
const DROP_SEL = '.sb-slot,.seat[data-slot],[data-fill],[data-inpseat]'
const BIN_SEL = '.sb-roster,.eroster,.availpuck'

/* On a phone the aircrew drawer covers half the screen, so a name picked up
   INSIDE it would have almost nothing to land on. Picking one up parks the
   drawer back against its tab for the duration of the drag — the tab is still
   part of .eroster, so dropping there is still "put them back" — and the drawer
   slides out again when the drag ends. */
let ROS_REOPEN = false
/* the mouse drag's ghost — built in setDragImage below, moved by moveDragImage
   on every dragover, dropped by dndOff so EVERY end of a drag clears it: a
   drop repaints the palette, which detaches the source before its dragend can
   bubble to the document. DRAGOX/OY is where inside the puck the cursor
   grabbed, so the ghost stays pinned to that spot rather than jumping to the
   pointer's corner. */
let DRAGIMG: HTMLElement | null = null
let DRAGOX = 0, DRAGOY = 0
function dropDragImage() { if (DRAGIMG && DRAGIMG.parentNode) DRAGIMG.parentNode.removeChild(DRAGIMG); DRAGIMG = null }
function moveDragImage(x: number, y: number) {
  if (!DRAGIMG) return
  DRAGIMG.style.transform = ghostXf(x - DRAGOX, y - DRAGOY, false)
}
/* A ghost's position is ONE transform, never left/top (6 Sep 26, traced at
   4× CPU: a fixed element moved by left/top made the browser lay out and
   REPAINT the whole page on every pointer move; on its own compositor layer —
   .dragimg/.tdghost carry will-change:transform and left/top:0 — a translate()
   paints nothing). What it does NOT buy, measured and recorded so nobody
   chases it again: the browser still re-LAYERISES the page on every move
   (~50ms at 4×), because this page carries ~230 compositor layers (the
   filtered/faded roster pucks and everything overlapping them) and a moving
   layer re-opens those overlap decisions; no ghost variant changes that (2D
   or 3D transform, translate3d, contain, backface, no decorations, not
   hit-testable — all measured equal). Fewer layers on the page is the only
   lever left there. The finger's ghost is centred under the touch, so its
   translate carries the -50% centring that used to live in the stylesheet. */
function ghostXf(x: number, y: number, centred: boolean) {
  return `translate(${x}px, ${y}px)${centred ? ' translate(-50%, -50%)' : ''}`
}
/* the image the BROWSER carries is a blank 1×1 pixel — see setDragImage.
   Decoded once at module load: Chromium falls back to its own snapshot when
   the image handed to setDragImage has not finished loading by dragstart. */
const BLANK_IMG: HTMLImageElement | null = typeof Image === 'function'
  ? (() => { const i = new Image(1, 1); i.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; return i })()
  : null
function dndOn(from: any) {
  document.body.classList.add('dnd')
  if (isPhone() && document.body.classList.contains('ros-open') && from && from.closest && from.closest('.eroster')) {
    ROS_REOPEN = true; document.body.classList.remove('ros-open')
  }
}
function dndOff() {
  document.body.classList.remove('dnd')
  dropDragImage()
  document.querySelectorAll('.dragover').forEach(x => x.classList.remove('dragover'))
  if (ROS_REOPEN) { ROS_REOPEN = false; document.body.classList.add('ros-open') }
}
/* what a drag STARTS from — shared by the pointer machine and the synthetic
   native path. The drag-source marker is `data-drag="1"`, NEVER the HTML
   `draggable` attribute — see the note above onDragStart for why. */
export function dragFrom(el: any) {
  if (!el || !el.closest) return null
  /* preview markup emits no drag sources, but a drag must never start from a
     stale pre-preview element either — its key addresses the live model */
  if (el.closest('.preview,.pv-frozen')) return null
  const slot = el.closest('.seat[data-slot][data-drag]')
  if (slot) return { kind: 'slot', key: slot.dataset.slot }
  const rp = el.closest('[data-person][data-drag]')
  if (rp) return { kind: 'roster', id: rp.dataset.person }
  return null
}
/* what a drag ENDS on. The ONE mutation path — mouse drop and touch lift both
   call this, so the two input methods can never drift apart. */
/* "directly over a puck" gets a few pixels of slack, so a near-miss on a phone
   still swaps instead of quietly adding an extra body to the row */
const SWAP_SLOP = 7
export function nearSeat(cell: any, x: any, y: any) {
  if (!cell || x == null || y == null) return null
  let best: any = null, bd = SWAP_SLOP
  cell.querySelectorAll('.seat[data-slot]').forEach((sEl: any) => {
    const r = sEl.getBoundingClientRect(); if (!r.width) return
    const dx = x < r.left ? r.left - x : (x > r.right ? x - r.right : 0)
    const dy = y < r.top ? r.top - y : (y > r.bottom ? y - r.bottom : 0)
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d <= bd) { bd = d; best = sEl }
  })
  return best
}
/* The picker hides crew who are not qualified for the position. Drag & drop had
   no such gate, so an SC NIGHT shift could quietly be filled with SC DAY crew
   and the only sign was a red Qual chip afterwards. Dropping is still allowed —
   the schedule sometimes has to be built before the currency catches up — but it
   now says what is wrong at the moment it happens. Returns true when it warned.
   RUNS AFTER THE EPILOGUE'S validate() (5 Sep 26) — it used to revalidate
   here itself, because EVD still held the pre-drop picture and a man moved
   between two seats of one SC shift was warned about the seat he had just
   vacated. That made every drop validate twice (three for a swap). done()
   now validates once through afterSchedMutate and asks afterwards, so the
   answer is the same and the second pass is gone. It is the FALLBACK voice:
   the drop delta (state/dropflag.ts) speaks first, in the validator's own
   words, and this only sounds when the delta found nothing new. */
export function barDrop(id: any, key: any) {
  if (!id || !key) return false
  let why = ''; try { why = slotBar(id, String(key).replace(/\.\+$/, '')) } catch (_) { return false }
  if (!why) return false
  toast(`${(PEOPLE[id] || {}).cs || id} — ${why}`, 'warn')
  return true
}
export function applyDrop(el: any, x: any, y: any) {
  /* editMode() checked too, not just the role (reviewer-found gap, 9 Aug
     26): the comment below used to claim "editMode() hides draggable='true'
     for a non-admin session" as if that made a write-path check here
     redundant, but the check itself only ever tested canEditSched() — the
     role, not the mode. On a read-only board (Edit Schedule, a session
     that may not edit it) the duty/sim/ground seats and fill targets still carried
     draggable/data-slot/data-fill (a separate render-gate gap, fixed
     alongside this one), so an admin whose session never changed could
     drag a name onto a duty row and have it write straight into the model.
     applyDrop is the ONE mutation path shared by the mouse and touch input
     methods, so one check here — rather than one in each of
     onDrop/onPointerUp — closes both, the same reason the role check was
     already centralised here rather than at each call site. A drag already
     picked up before a role OR page change lands underneath it (logout
     mid-drag, a nav away from Edit Schedule mid-drag, or a stale DRAG left by
     an earlier session on a shared browser) still reaches here with live
     DRAG state — this is what actually stops it, not the render gate that
     started the drag. */
  if (!canEditSched() || !editMode()) { DRAG = null; dndOff(); return false }
  if (!DRAG || !el || !el.closest) { DRAG = null; dndOff(); return false }
  /* WARN as it stands before anything is written — the drop delta's baseline
     (state/dropflag.ts). validate() reassigns WARN, so this is a snapshot by
     identity, not a copy. */
  const warnBefore = WARN
  /* An Unavailable row's seat, dropped on from either a roster puck or an
     already-planted one — checked BEFORE slotEl/cell below, which only know
     the schedule's data-slot/data-fill grammar and would otherwise treat this
     drop as "landed nowhere" and fall through to whatever the source seat's
     own empty-drop rule is. No eligibility bar and no seat vacated on the
     source end: reassignInput is a DATA EDIT to the input record, not a move
     of a schedule assignment, so a name dragged off a flying seat stays in
     that seat AND becomes unavailable — the two are independent facts. */
  const inpEl = el.closest('[data-inpseat]')
  if (inpEl) {
    const iid = (inpEl as HTMLElement).dataset.inpseat!
    const pid = DRAG.kind === 'roster' ? DRAG.id : slotVal(DRAG.key)
    if (!pid || !PEOPLE[pid]) { DRAG = null; dndOff(); return false }
    reassignInput(iid, pid)
    /* mirrors done()'s own arm put-down and drawer-park below, without ALSO
       calling afterSchedMutate() — reassignInput's commitInputEdit already
       ran the input funnel's full epilogue (validate, notify, ONE history
       step) and a second call here would push a second step for the one drop. */
    if (view.armedKey() === `iu:${iid}`) view.disarmSlot()
    ROS_REOPEN = false
    DRAG = null; dndOff(); notify(); return true
  }
  let slotEl = el.closest('.sb-slot,.seat[data-slot]')
  /* A PALETTE drop anywhere on a list row means THAT ROW. The .ppl cell is only a
     third of a row tall on a phone, so better than eight in ten pixels of a duty /
     sim / ground / programme row used to swallow the drop without a word. A SEAT
     puck is stricter: it only lands on a seat or a crew cell — a drop on the row's
     title / timings / remarks falls through and takes it off the seat instead. */
  const cell = el.closest('[data-fill]')
    || (DRAG.kind === 'roster' ? (() => {
      const row = el.closest('.pl-row,.ah-row,.sb-arow')
      return row ? row.querySelector('[data-fill]') : null
    })() : null)
  /* Landed in the cell but within a hair of one of its pucks → treat it as that
     puck, i.e. swap. Landed BELOW a puck → add, even inside the slop: on a 15px
     puck the natural "nudge it down to add a second body" gesture used to resolve
     back onto the puck being dragged and do nothing at all. */
  if (!slotEl && cell) {
    const n = nearSeat(cell, x, y)
    if (n && !(DRAG.kind === 'slot' && n.dataset.slot === DRAG.key)
      && y <= n.getBoundingClientRect().bottom) slotEl = n
  }
  /* a jet line is two seats — FCP and RCP. A palette drop below them adds
     nothing; a seat puck falls through and comes off instead. */
  if (!slotEl && !cell && DRAG.kind === 'roster' && el.closest('.acrow')) {
    toast('A jet line carries two — FCP and RCP')
    DRAG = null; dndOff(); return false
  }
  /* a drop that lands ON the armed target puts the arm down — it just did the
     arm's job. Left armed, the ring outlived the row it was waiting on (and
     the next palette tap would plant a second body into a row the user had
     already filled by hand). Drops elsewhere leave the arm alone. */
  /* `asks` are the (id, key) pairs barDrop judges once the write is in —
     AFTER the one validate() inside afterSchedMutate, never before it (see
     barDrop). The drop delta speaks first; barDrop is its fallback. */
  const done = (served?: any, asks?: any[][]) => {
    if (served && view.armedKey() === served) view.disarmSlot()
    /* a drop that LANDED parks the drawer (owner, 8 Aug 26) — clear the
       reopen latch before dndOff() re-adds ros-open. Failed drops never
       reach done(), so an aborted drag still gets its drawer back. */
    ROS_REOPEN = false
    DRAG = null; dndOff(); view.afterSchedMutate()
    if (!flagDrop(warnBefore, served ? keyDay(served) : null)) (asks || []).some(([id, key]) => barDrop(id, key))
    notify(); return true
  }
  if (slotEl) {
    const targetKey = slotEl.dataset.slot || (slotEl.querySelector('[data-slot]') && slotEl.querySelector('[data-slot]').dataset.slot)
    if (!targetKey) { DRAG = null; dndOff(); return false }
    let asks: any[][]
    if (DRAG.kind === 'roster') { setSlotVal(targetKey, DRAG.id); asks = [[DRAG.id, targetKey]] }
    else if (DRAG.key !== targetKey) {
      const a = slotVal(DRAG.key), b = slotVal(targetKey); setSlotVal(targetKey, a); setSlotVal(DRAG.key, b)
      asks = [[a, targetKey], [b, DRAG.key]]
    }
    /* dropped back where he started — say so rather than reporting nothing */
    else { DRAG = null; dndOff(); toast('Already in that seat'); return false }
    return done(targetKey, asks)
  }
  if (cell) {                                     // dropped on an empty / shared people cell
    let asks: any[][]
    if (DRAG.kind === 'roster') { fillSlot(cell.dataset.fill, DRAG.id); asks = [[DRAG.id, cell.dataset.fill]] }
    else { const id = slotVal(DRAG.key); setSlotVal(DRAG.key, ''); fillSlot(cell.dataset.fill, id); asks = [[id, cell.dataset.fill]] }
    return done(cell.dataset.fill, asks)
  }
  /* a seat puck let go anywhere else — the roster, blank page space, the
     chrome — comes off its seat; the name reappears in the palette. Rows
     above already caught their own drops, and el == null (finger lifted
     off-window) never reaches here, so leaving the window never deletes. */
  if (DRAG.kind === 'slot') { setSlotVal(DRAG.key, ''); return done() }
  DRAG = null; dndOff(); return false
}

/* ---- the native path: HTML5 drag events ----
   NOTHING ON THE PAGE IS `draggable` ANY MORE (4th cut, 3 Sep 26). The story
   in one breath: the white box under a dragged puck on the MINDEF secured
   browser (Edge, "SIS") survived two drag-image fixes (#351 an off-screen
   clone, #353 a blank pixel + page-drawn ghost — that browser ignores
   setDragImage), then survived the third (#354: the mouse on the pointer
   machine below, this handler preventDefault-ing the native dragstart) AND
   that cut killed the drop there too. The photo after #354 said why: that
   browser starts its own drag of any `draggable="true"` element WITHOUT
   asking the page — our preventDefault never reaches whatever draws the box —
   and once its drag owns the pointer, the machine gets a pointercancel and
   nothing is left holding DRAG when the release comes. A drag the page cannot
   refuse must never be offered: the drag-source marker is `data-drag="1"`
   (html.ts / board-html.ts / palette-html.ts emit it exactly where they used
   to emit draggable="true", edit mode only), so no browser — remote,
   sandboxed or plain — has anything to pick up, and the pointer machine is
   the ONLY way a puck moves. These handlers are reachable only by synthetic
   events now (the suites' dnd() helper, probes) and keep #353's blank-pixel
   + ghost recipe for that use; the TD.mouse guard is belt-and-braces. */
function onDragStart(e: DragEvent) {
  DBG.nat(e.isTrusted)
  /* THE DOCUMENT-LEVEL BACKSTOP (4th cut, belt 1). Any REAL, browser-started
     drag is refused here whatever began it — a draggable element we missed, an
     <img>/<a>, a text-selection drag, or a secured browser starting one on its
     own. `e.isTrusted` is the whole test: a user/browser drag is trusted; the
     suites' and probes' synthetic `dispatchEvent` drags are not, so the native
     fallback path below (and its tests) still run untouched. The app owns no
     legitimate native drag — everything drags through the pointer machine — so
     cancelling every trusted one costs nothing on a normal browser (nothing is
     draggable, so none fire) and is the last line of defence on a browser that
     ignores setDragImage and our per-element measures. */
  if (e.isTrusted) { e.preventDefault(); return }
  if (TD && TD.mouse) { e.preventDefault(); return }
  const d = dragFrom(e.target); if (!d) return
  DRAG = d
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = d.kind === 'slot' ? 'move' : 'copy'
    try { e.dataTransfer.setData('text/plain', d.kind === 'slot' ? d.key : d.id) } catch (_) {}
  }
  /* Chromium aborts a native drag whose dragstart handler restyles the page
     before the drag image is captured — body.dnd reflows every drop cell
     ("drop here", the + add strips), so adding it synchronously killed every
     mouse drag ~7ms in: dragstart, then dragend, nothing in between, the puck
     just snapped back. One tick later the browser has its image and the same
     decoration is harmless. Guard on DRAG: a drag that already ended must not
     decorate the page after the fact. (The touch path keeps its synchronous
     dndOn — no native capture there.) */
  const from = e.target
  setTimeout(() => { if (DRAG === d) dndOn(from) }, 0)
  setDragImage(e)
}

/* The image that rides under the mouse is OURS, drawn by the PAGE — the
   browser is handed a blank pixel and composes nothing (owner, 3 Sep 26 — "a
   white box follows the puck" on a Windows laptop, on the edit week and the
   board alike; and again after the first fix, on Edge inside the MINDEF
   secured browser). The first cut still let the browser paint the image: it
   handed setDragImage an off-screen puck clone, on the theory that the
   app-wide `html{user-select:none}` (2 Sep 26) was what turned Chromium's
   automatic snapshot into a white card. That does nothing where the drag
   image is composed OUTSIDE the page — a remote-rendered or sandboxed
   browser (the secured-browser case) hands the OS a bitmap and the OS draws
   it without its transparency, so whatever we ask the browser to paint comes
   back as an opaque white card around the puck. The only image that cannot be
   spoiled that way is one the browser never draws: setDragImage gets a 1×1
   transparent pixel (BLANK_IMG), and the puck the user sees is a `.dragimg`
   clone of the PUCK alone (not the .seat shell, which a grid cell can stretch
   past the puck) appended to the body as a fixed, pointer-events:none ghost
   that moveDragImage pins under the cursor on every dragover — the same
   JS-positioned ghost the touch path has always used (`.tdghost`), which was
   never affected. Appending one fixed element does not reflow the drop cells,
   so this stays clear of the abort described above. The ghost goes with
   dndOff (drop, cancelled drag, dragend alike — see DRAGIMG above), and a
   fresh dragstart replaces a stale one. A dataTransfer with no setDragImage
   gets no ghost either — the browser then shows its own image, and a second
   one under it would double up. */
function setDragImage(e: DragEvent) {
  const dt: any = e.dataTransfer
  if (!dt || typeof dt.setDragImage !== 'function') return
  const src = (e.target as HTMLElement).closest ? (e.target as HTMLElement).closest('[data-drag]') as HTMLElement : null
  if (!src) return
  const pk = (src.querySelector('.puck') || src) as HTMLElement
  const r = pk.getBoundingClientRect()
  dropDragImage()
  const g = pk.cloneNode(true) as HTMLElement
  g.classList.add('dragimg')
  g.removeAttribute('data-drag'); g.removeAttribute('draggable'); g.removeAttribute('tabindex')
  g.style.width = r.width + 'px'; g.style.height = r.height + 'px'
  DRAGOX = e.clientX - r.left; DRAGOY = e.clientY - r.top
  document.body.appendChild(g)
  DRAGIMG = g
  moveDragImage(e.clientX, e.clientY)
  if (BLANK_IMG) dt.setDragImage(BLANK_IMG, 0, 0)
}
function onDragOver(e: DragEvent) {
  if (!DRAG) return
  /* the ghost rides the dragover stream, not the source's `drag` event —
     dragover on the document carries real client coordinates in every
     browser, where Firefox's `drag` reports zeros */
  moveDragImage(e.clientX, e.clientY)
  const drop = (e.target as HTMLElement).closest(DROP_SEL) || (e.target as HTMLElement).closest(BIN_SEL)
  if (!drop) {
    /* empty space is a valid landing for a seat puck (letting go removes it),
       and the browser only fires drop where dragover was preventDefault'd */
    if (DRAG.kind === 'slot') e.preventDefault()
    return
  }
  e.preventDefault()
  drop.classList.add('dragover')
}
function onDragLeave(e: DragEvent) { const t = (e.target as HTMLElement).closest('.dragover'); if (t) t.classList.remove('dragover') }
function onDrop(e: DragEvent) {
  if (!DRAG) return
  const t = e.target as HTMLElement
  if (DRAG.kind === 'slot' || (t.closest && (t.closest('.sb-slot,.seat[data-slot]') || t.closest('[data-fill]') || t.closest('[data-inpseat]')))) e.preventDefault()
  applyDrop(t, e.clientX, e.clientY)
}
function onDragEnd() { dndOff(); DRAG = null }

/* ---- touch drag ---------------------------------------------------------
   HTML5 drag & drop is mouse-only: a touch pointer never fires dragstart, so
   on a phone or tablet every puck was inert — the roster palette, the swap,
   the bin, all of it. This runs the SAME DRAG state machine off pointer
   events. Press and hold ~180 ms on anything [data-drag] to pick it up
   (a move before that is a scroll, and cancels), a ghost follows the finger,
   whatever sits under it takes .dragover exactly as on desktop, and lifting
   off calls applyDrop() — the identical mutation path the mouse uses.
   THE MOUSE RIDES THIS SAME MACHINE since 3 Sep 26 (TD.mouse): a primary
   button pressed on a puck claims it here, a 3px move arms it (no hold — a
   mouse drag starts the moment it moves, as the native one did), and the
   ghost is the PUCK alone (`.dragimg`, anchored where the press landed inside
   it) rather than the finger's centred shell clone. Since the 4th cut the
   same day nothing on the page is `draggable`, so there is no native drag to
   race this machine — one machine, one applyDrop, no browser-drawn image
   anywhere; see the note above onDragStart for why.                        */
let TD: any = null
const TD_SLOP = 8, TD_GIVEUP = 26, TD_HOLD = 180, TD_EDGE = 52, TD_SPEED = 16, TD_MSLOP = 3
function tdClear() {
  if (!TD) return
  clearTimeout(TD.timer)
  if (TD.ghost && TD.ghost.parentNode) TD.ghost.parentNode.removeChild(TD.ghost)
  if (TD.armed) { document.body.classList.remove('tdrag', 'mdrag'); dndOff(); DRAG = null }
  TD = null
}
/* IS A FINGER ALREADY DRIVING A DRAG? Asked by the board's day-dot scrub
   (board.ts's wireDayDots), which must not start a day change underneath a
   puck someone is holding: a day change repaints the panels, which detaches
   TD.src, and the drop then resolves through elementFromPoint against the
   NEW day's markup — a plant on a day nobody aimed at. True from the moment
   a finger lands on a draggable, not just once the hold has armed, because
   the repaint hazard covers both windows. The reverse direction needs no
   guard: a finger landing on a puck mid-scrub is non-primary, and
   onPointerDown already refuses those. */
export function touchDragBusy() { return !!TD }
function tdScrollerFor(el: any) {
  let n = el
  while (n && n !== document.body && n !== document.documentElement) {
    const cs = getComputedStyle(n)
    if (/auto|scroll/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 4) return n
    n = n.parentElement
  }
  return document.scrollingElement || document.documentElement
}
function tdAutoScroll(y: any) {
  const el = TD.scroller; if (!el) return
  const top = (el === document.scrollingElement || el === document.documentElement) ? 0 : el.getBoundingClientRect().top
  const bot = (el === document.scrollingElement || el === document.documentElement) ? window.innerHeight : el.getBoundingClientRect().bottom
  if (y < top + TD_EDGE) el.scrollTop -= TD_SPEED
  else if (y > bot - TD_EDGE) el.scrollTop += TD_SPEED
}
/* the first element under the point that is not the ghost — one hit-test for
   the whole stack; the single-element fallback is for jsdom, which has no
   layout and no ghost to skip */
function underPoint(x: any, y: any, ghost: any) {
  const stack: any[] = typeof (document as any).elementsFromPoint === 'function' ? (document as any).elementsFromPoint(x, y) : [document.elementFromPoint(x, y)]
  return stack.find((n: any) => n && !(ghost && ghost.contains(n))) || null
}
function tdOver(x: any, y: any) {
  const g = TD.ghost
  /* TD.ox/oy is where the mouse press landed inside the puck, so its ghost
     stays pinned to that spot; a finger's ghost is centred (ox = oy = 0 with
     the .tdghost translate) */
  if (g) g.style.transform = ghostXf(x - TD.ox, y - TD.oy, !TD.mouse)
  /* The mouse ghost is hit-testable (it carries the grabbing cursor — see
     .dragimg in scheduler.css, the slow-computer cut), so the cell beneath is
     the first element under the point that is NOT the ghost. elementsFromPoint
     gives the whole stack in one hit-test; the single-element fallback is for
     jsdom, which has no layout and no ghost to skip. Measured 6 Sep 26 and NOT
     changed: this call is a few ms at 4× — the ~25ms of hit-testing a mouse
     move costs on the week is the browser's own hover update, not ours — and
     the tempting alternative (pointer-events off → elementFromPoint → back on)
     rewrites the ghost's hit-test data every move, which repaints the ghost
     and re-layerises the whole page: 22ms a move worse. Leave it. */
  const el = underPoint(x, y, g)
  const t = el && el.closest ? (el.closest(DROP_SEL) || el.closest(BIN_SEL)) : null
  if (t !== TD.over) {
    if (TD.over) TD.over.classList.remove('dragover')
    if (t) t.classList.add('dragover')
    TD.over = t
  }
  tdAutoScroll(y)
}
function tdArm() {
  if (!TD || TD.armed) return
  const d = dragFrom(TD.src); if (!d) { tdClear(); return }
  DRAG = d; TD.armed = true
  DBG.arm()
  TD.scroller = tdScrollerFor(TD.src)
  /* the mouse ghost is the PUCK alone (not the .seat shell a grid cell can
     stretch past it), pinned where the press landed inside it — clamped to
     the puck so a press on the shell's padding still reads as a corner grab;
     the finger's ghost is the shell clone centred under the touch */
  const pk = TD.mouse ? (TD.src.querySelector('.puck') || TD.src) : TD.src
  const r = pk.getBoundingClientRect()
  const g = pk.cloneNode(true)
  g.classList.add(TD.mouse ? 'dragimg' : 'tdghost')
  g.removeAttribute('data-drag'); g.removeAttribute('draggable'); g.removeAttribute('tabindex')
  g.style.width = r.width + 'px'; g.style.height = r.height + 'px'
  TD.ox = TD.mouse ? Math.min(Math.max(TD.x0 - r.left, 0), r.width) : 0
  TD.oy = TD.mouse ? Math.min(Math.max(TD.y0 - r.top, 0), r.height) : 0
  document.body.appendChild(g)
  TD.ghost = g
  document.body.classList.add('tdrag')
  if (TD.mouse) document.body.classList.add('mdrag')
  dndOn(TD.src)
  tdOver(TD.x, TD.y)
  if (!TD.mouse && navigator.vibrate) try { navigator.vibrate(12) } catch (_) {}
}
function onPointerDown(e: PointerEvent) {
  if (!e.isPrimary) return
  const src = (e.target as HTMLElement).closest && (e.target as HTMLElement).closest('[data-drag]')
  if (!src) return
  const mouse = e.pointerType === 'mouse'
  /* the mouse claims ONLY what dragFrom recognises — a puck on a seat or in
     the palette — and only on its primary button. Anything else (a stray
     draggable="true" some other surface might carry; none today — Leave War
     and the calendar run their own pointer machines) is left alone. */
  if (mouse && (e.button !== 0 || !dragFrom(src))) return
  tdClear()
  TD = { src, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, armed: false, ghost: null, over: null, id: e.pointerId, mouse, ox: 0, oy: 0 }
  DBG.pd(e.clientX, e.clientY, mouse ? 'mouse' : e.pointerType)
  if (!mouse) TD.timer = setTimeout(tdArm, TD_HOLD)
}
function onPointerMove(e: PointerEvent) {
  if (!TD || e.pointerId !== TD.id) return
  TD.x = e.clientX; TD.y = e.clientY
  DBG.mv()
  if (!TD.armed) {
    /* a mouse has no hold: the first move past a hair's slop IS the drag
       (the native drag's own threshold), a smaller wobble is still a click */
    if (TD.mouse) {
      if (Math.abs(e.clientX - TD.x0) > TD_MSLOP || Math.abs(e.clientY - TD.y0) > TD_MSLOP) tdArm()
      return
    }
    /* A finger settling on a 15px puck routinely travels more than 8px inside the
       180ms hold. That used to CANCEL the gesture outright — no ghost, no feedback,
       and holding still could not re-arm it. A small wobble now just restarts the
       hold clock from where the finger actually is; only a movement big enough to be
       a deliberate pan gives up and lets the page scroll. */
    const dx = Math.abs(e.clientX - TD.x0), dy = Math.abs(e.clientY - TD.y0)
    if (dx > TD_GIVEUP || dy > TD_GIVEUP) { tdClear(); return }
    if (dx > TD_SLOP || dy > TD_SLOP) {
      TD.x0 = e.clientX; TD.y0 = e.clientY
      clearTimeout(TD.timer); TD.timer = setTimeout(tdArm, TD_HOLD)
    }
    return
  }
  tdOver(e.clientX, e.clientY)
}
/* while a touch drag is armed the page must not scroll under the finger */
function onTouchMove(e: TouchEvent) { if (TD && TD.armed) e.preventDefault() }
function onPointerUp(e: PointerEvent) {
  if (!TD || e.pointerId !== TD.id) return
  const armed = TD.armed, x = e.clientX, y = e.clientY
  DBG.pu(x, y)
  if (armed) {
    /* HIT-TEST FIRST, with the ghost still up and skipped (the same stack read
       every move uses), THEN take the ghost down (the 6 Sep 26 drop round).
       The old order — ghost off, elementFromPoint, body.tdrag/.mdrag off,
       applyDrop — dirtied the page's style twice before applyDrop measured
       the cell's seats (nearSeat), so the drop paid two full forced
       style+layout passes on a 4× laptop (~55 ms) before the first line of
       real work. Now the hit-test pays the one pass the last move left
       dirty, the ghost's removal is a trivial re-layout, and the body
       markers come off in tdClear() below — AFTER applyDrop has repainted,
       so their restyle rides the same frame as the drop's own. Nothing reads
       those markers from script (css-invalidation.test.ts: they exist only as
       ancestors in a few hover rules), so applyDrop cannot tell the
       difference. */
    const el = underPoint(x, y, TD.ghost)
    DBG.efp(el as any)
    if (TD.ghost && TD.ghost.parentNode) TD.ghost.parentNode.removeChild(TD.ghost)
    TD.ghost = null
    DBG.drop(applyDrop(el, x, y) ? 'OK' : 'NONE')
    /* The tap that ends a drag must not also select the puck. But a real drag ends
       on a different element than it started on, so the browser fires NO click at
       all — {once:true} never self-removed and the eater sat there for 350ms
       swallowing the user's NEXT genuine tap (it is a capture listener on document,
       so arming a slot, planting a name and selecting a person all went dead).
       Retire it on the next pointerdown too: it can now only eat the click that
       belongs to the drag that installed it. */
    const eat = (ev: Event) => { ev.stopPropagation(); ev.preventDefault() }
    const dropEat = () => {
      document.removeEventListener('click', eat, { capture: true } as any)
      document.removeEventListener('pointerdown', dropEat, { capture: true } as any)
    }
    document.addEventListener('click', eat, { capture: true, once: true })
    document.addEventListener('pointerdown', dropEat, { capture: true, once: true })
    setTimeout(dropEat, 350)
  }
  /* tdClear, not TD=null — a quick tap left its 180 ms arm timer pending, and it
     would fire against the NEXT gesture and pick up a puck nobody grabbed */
  tdClear()
}
/* pointercancel and a window blur both abort a drag with no drop; they are
   split only so the readout can tell which one fired (they are the two ways a
   secured browser could silently kill a drop mid-gesture) */
function onPointerCancel() { DBG.can(); tdClear() }
function onWindowBlur() { DBG.blur(); tdClear() }

/* attach the whole block to the document, exactly as the reference does;
   returns the detach for React's effect cleanup */
export function initDrag() {
  document.addEventListener('dragstart', onDragStart)
  document.addEventListener('dragover', onDragOver)
  document.addEventListener('dragleave', onDragLeave)
  document.addEventListener('drop', onDrop)
  document.addEventListener('dragend', onDragEnd)
  document.addEventListener('pointerdown', onPointerDown, { passive: true })
  document.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('touchmove', onTouchMove, { passive: false })
  document.addEventListener('pointerup', onPointerUp, { passive: true })
  document.addEventListener('pointercancel', onPointerCancel, { passive: true })
  /* a mouse released outside the window normally still reaches pointerup
     (Chromium holds the mouse for the page while a button is down), but a
     window that loses focus mid-drag — an alt-tab, a secured browser's own
     chrome stealing the pointer — must not leave a ghost riding the cursor */
  window.addEventListener('blur', onWindowBlur)
  /* the optional on-screen drag readout — inert and attaches nothing unless
     ?dragdbg=1 (or the five-tap corner) turns it on; see ui/dragdbg.ts */
  const detachDbg = initDragDbg()
  return () => {
    window.removeEventListener('blur', onWindowBlur)
    detachDbg()
    tdClear()
    document.removeEventListener('dragstart', onDragStart)
    document.removeEventListener('dragover', onDragOver)
    document.removeEventListener('dragleave', onDragLeave)
    document.removeEventListener('drop', onDrop)
    document.removeEventListener('dragend', onDragEnd)
    document.removeEventListener('pointerdown', onPointerDown)
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('touchmove', onTouchMove)
    document.removeEventListener('pointerup', onPointerUp)
    document.removeEventListener('pointercancel', onPointerCancel)
  }
}
