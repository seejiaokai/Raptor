/* ---------------------------------------------------------------------------
   CALENDAR CHIP DRAG — the Inputs month calendar's own pointer machine for
   dragging a chip (a real input's row, or a scheduler's plan puck) from the
   day cell it sits in to another one.

   ITS OWN MACHINE, DELIBERATELY. `drag.ts` stays scoped to seat pucks on the
   scheduling board — that is a standing decision (CLAUDE.md's "No
   drag-to-section": "don't add drop targets to drag.ts for it; that machine
   stays scoped to pucks"), and this calendar is a different surface
   entirely: a different DOM (month cells, not the board), a different drop
   vocabulary (a day, not a slot), and a different mutation (redate an input
   or a puck, not reassign a seat). This file COPIES drag.ts's touch-drag
   FEEL — its constants, its wobble rule, its click-eater — because those are
   hard-won lessons from real touch bugs on this app (see the comments below
   for exactly which lines they come from), not because the two machines
   should ever merge into one.

   Resolving an entry and committing its move are split on purpose:
   `commitChipMove` is pure decision logic with no DOM and no pointer state,
   so it is unit-testable on its own and reusable by anything that ever wants
   to redate a chip without a drag (a keyboard move, say).
   --------------------------------------------------------------------------- */
import { draftOf, commitInputEdit, fmtDay } from './inputedit'
import { movePlanPuck, PLANPUCKS } from '../state/plan'
import { writeInputs } from '../state/store'
import { canEditSched, ME } from '../state/auth'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'

/* drag.ts's own numbers, cited rather than re-derived (its tdArm/onPointerDown/
   onPointerMove, drag.ts ~240-338): 180ms of hold turns a touch into a
   deliberate pick-up instead of a tap; 8px is the wobble a hold can absorb
   without giving up; 26px beyond the start point means a deliberate pan and
   the gesture is abandoned so the page can scroll. Mouse gets none of that —
   a mouse button held down and moved is already unambiguous, so it arms off
   a much smaller, hold-free threshold of its own. */
const HOLD = 180, SLOP = 8, GIVEUP = 26, MOUSE_SLOP = 4

/* ===========================================================================
   THE COMMIT — pure, DOM-free, directly unit-testable.
   =========================================================================== */

/* yyyy-mm-dd, shifted by a signed day count, via UTC epoch millis so a
   calendar month/year rollover (day 32 of January, day 366 of a leap year)
   falls out of Date.UTC's own normalisation instead of a month-length table
   this file would have to get right itself. UTC throughout (not local) so a
   viewer's timezone can never shift a date-only value by a day. */
function shiftIso(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + days))
  const p2 = (n: number) => String(n).padStart(2, '0')
  return `${dt.getUTCFullYear()}-${p2(dt.getUTCMonth() + 1)}-${p2(dt.getUTCDate())}`
}

/* Redate whatever a calendar chip carries. `fromIso` is the CELL THE CHIP WAS
   GRABBED IN, not the record's own start date — the calendar can render a
   multi-day span's chip into any day it covers, and a drag that starts on
   day 3 of a 5-day span is not the same gesture as one starting on day 1.
   Returns whether it actually moved, so a caller (the drag machine) knows
   whether to run its own drop feedback. */
export function commitChipMove(entry: any, fromIso: string, toIso: string): boolean {
  /* Dropping a chip back on the cell it came from is not a mistake to flag —
     it is a cancelled thought, the same as closing a dialog with Cancel. A
     toast here would scold the user for changing their mind mid-gesture. */
  if (!toIso || toIso === fromIso) return false

  if (entry.kind === 'puck') {
    /* movePlanPuck carries its own canEditSched() gate; asking again here
       would just be a second copy of the same check that could one day
       disagree with the first. Read what it decided instead. The caption
       names the section's KIND (22 Aug 26) — a pucks row dragged to another
       day is not a "note", and this toast is the move's one visible word. */
    const kind = PLANPUCKS.find((p: any) => p.id === entry.pid)?.kind === 'pucks' ? 'Pucks row' : 'Note'
    let did = false
    writeInputs(() => { did = movePlanPuck(entry.pid, toIso) })
    if (did) HOOKS.toast(`${kind} moved`, 'ok')
    else if (!canEditSched()) HOOKS.toast('Only a scheduler can move planning sections', 'warn')
    return did
  }

  const r = INPUTS.find((x: any) => x.iid === entry.iid)
  if (!r) return false // the row was deleted mid-gesture — nothing to say, nothing to move

  /* Page-rights parity with every other write on the Inputs page: a member
     may move their OWN input (the same reach they already have to edit its
     times), a scheduler may move anyone's. */
  if (!canEditSched() && r.person !== ME) {
    HOOKS.toast("Only a scheduler can move someone else's input", 'warn')
    return false
  }

  /* THE DELTA MATH — the whole point of using `fromIso` rather than the
     record's own start. Computing "how many days did the drag travel" and
     applying that SAME delta to both start and end SLIDES the span by the
     drag distance; snapping the start to the drop cell instead would
     re-anchor a span grabbed by its middle onto a different length of days
     before the drop point than it had before — a silent reshaping, not a
     move. This is exactly the behaviour a drag on Google Calendar has, which
     is what the owner asked to match. */
  const parts = (s: string) => s.split('-').map(Number)
  const [fy, fm, fd] = parts(fromIso), [ty, tm, td] = parts(toIso)
  const days = (Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000

  const d = draftOf(r)
  d.start = shiftIso(d.start, days)
  /* an absent end stays absent by construction — there is no separate branch
     that could forget to check it, so the span's length (including "no end
     at all") can never drift across a move */
  if (d.end) d.end = shiftIso(d.end, days)

  const ok = commitInputEdit(r, d)
  /* commitInputEdit already toasts every refusal it can produce (a SANS
     clash, a backwards range, a row deleted underneath the edit) — adding a
     second toast on failure here would double up on the same news. Only the
     success case needs one, because "moved to <date>" is wording specific to
     a drag, which commitInputEdit has no way to know it was. */
  if (ok) HOOKS.toast('Moved to ' + fmtDay(d.start), 'ok')
  return !!ok
}

/* ===========================================================================
   THE GESTURE MACHINE.
   =========================================================================== */

type Entry = { kind: 'input' | 'puck', iid?: string, pid?: string, el: HTMLElement, fromIso: string }

/* Attaches to `root` (the calendar overlay), not `document` — the calendar
   owns this gesture the way the board owns drag.ts's, and a component-scoped
   listener is what lets several calendars mount and unmount in the same
   session (tests included) without leaking state into one another. Returns
   the detach fn for React's effect cleanup. */
export function initCalDrag(root: HTMLElement, opts: { onTap: (entry: any) => void }): () => void {
  let st: {
    entry: Entry, pointerId: number, mouse: boolean,
    x0: number, y0: number, armed: boolean,
    ghost: HTMLElement | null, over: HTMLElement | null, timer: any,
  } | null = null

  function moveGhost(x: number, y: number) {
    if (!st || !st.ghost) return
    st.ghost.style.left = x + 'px'
    st.ghost.style.top = y + 'px'
    const t = (document.elementFromPoint(x, y) as HTMLElement | null)?.closest('[data-icday]') as HTMLElement | null
    if (t !== st.over) {
      if (st.over) st.over.classList.remove('ic-over')
      if (t) t.classList.add('ic-over')
      st.over = t
    }
  }

  function arm() {
    if (!st || st.armed) return
    st.armed = true
    const r = st.entry.el.getBoundingClientRect()
    const g = st.entry.el.cloneNode(true) as HTMLElement
    g.classList.add('ic-ghost')
    g.removeAttribute('data-icdrag')
    g.style.width = r.width + 'px'
    g.style.height = r.height + 'px'
    document.body.appendChild(g)
    st.ghost = g
    document.body.classList.add('ic-dragging')
    /* best-effort haptic — absent on desktop and on plenty of phones, and
       throwing there must never abort the drag it is decorating */
    try { navigator.vibrate?.(12) } catch (_) { /* no-op */ }
    moveGhost(st.x0, st.y0) // paints the ghost at its start point immediately, and lights any cell already under it
  }

  function clearGesture() {
    if (!st) return
    clearTimeout(st.timer)
    if (st.ghost && st.ghost.parentNode) st.ghost.parentNode.removeChild(st.ghost)
    if (st.over) st.over.classList.remove('ic-over')
    if (st.armed) document.body.classList.remove('ic-dragging')
    st = null
  }

  /* The tap that ends a drag must not also open the chip it was dragging.
     Copied from drag.ts's onPointerUp/dropEat (~352-372) along with the
     lesson that shipped it: a plain {once:true} click listener can outlive
     the drag it belongs to and eat the user's NEXT genuine tap instead (a
     real drag usually ends over a different element than it started on, so
     the browser fires no click at all — the listener just sits there). So it
     is retired on the very next pointerdown too, not only on the click it is
     actually meant to eat, and a timeout backs both up in case neither
     happens. */
  function installClickEater() {
    const eat = (ev: Event) => { ev.stopPropagation(); ev.preventDefault() }
    const off = () => {
      document.removeEventListener('click', eat, { capture: true } as any)
      document.removeEventListener('pointerdown', off, { capture: true } as any)
    }
    document.addEventListener('click', eat, { capture: true, once: true })
    document.addEventListener('pointerdown', off, { capture: true, once: true })
    setTimeout(off, 350)
  }

  function onPointerDown(e: PointerEvent) {
    const chip = (e.target as HTMLElement)?.closest?.('[data-icdrag]') as HTMLElement | null
    if (!chip) return // no chip under the finger/cursor — an empty-cell gesture is the calendar's own business, not this machine's
    const cell = chip.closest('[data-icday]') as HTMLElement | null
    if (!cell) return
    /* mirrors drag.ts's own guard: a non-primary touch (a second finger
       landing mid-gesture) never starts a NEW gesture of its own */
    if (e.pointerType !== 'mouse' && !e.isPrimary) return
    clearGesture() // belt-and-braces — a stray second pointerdown restarts clean rather than stacking state
    const entry: Entry = {
      kind: chip.dataset.iid ? 'input' : 'puck',
      iid: chip.dataset.iid, pid: chip.dataset.pid,
      el: chip, fromIso: cell.dataset.icday!,
    }
    st = {
      entry, pointerId: e.pointerId, mouse: e.pointerType === 'mouse',
      x0: e.clientX, y0: e.clientY, armed: false, ghost: null, over: null, timer: 0,
    }
    if (!st.mouse) st.timer = setTimeout(arm, HOLD)
    // mouse arms purely off movement, in onPointerMove below — no hold timer at all
  }

  function onPointerMove(e: PointerEvent) {
    if (!st || e.pointerId !== st.pointerId) return
    if (!st.armed) {
      const dx = Math.abs(e.clientX - st.x0), dy = Math.abs(e.clientY - st.y0)
      if (st.mouse) {
        if (dx > MOUSE_SLOP || dy > MOUSE_SLOP) { st.x0 = e.clientX; st.y0 = e.clientY; arm() }
        return
      }
      /* touch/pen wobble rule, copied from drag.ts's onPointerMove
         (~326-338): a finger settling onto a small chip routinely drifts a
         few pixels inside the hold window. That used to cancel the whole
         gesture outright; now a small drift just restarts the hold clock
         from wherever the finger actually is, and only a movement big
         enough to read as a deliberate pan gives up and lets the page
         scroll under it. */
      if (dx > GIVEUP || dy > GIVEUP) { clearGesture(); return }
      if (dx > SLOP || dy > SLOP) {
        st.x0 = e.clientX; st.y0 = e.clientY
        clearTimeout(st.timer); st.timer = setTimeout(arm, HOLD)
      }
      return
    }
    moveGhost(e.clientX, e.clientY)
  }

  /* while armed the page must not scroll/pan under the finger — attached
     non-passive for the same reason drag.ts's own touchmove listener is
     (drag.ts's initDrag: `{ passive: false }`); a passive listener cannot
     preventDefault at all, and without this the browser starts scrolling
     the calendar out from under a held chip. */
  function onTouchMove(e: TouchEvent) { if (st && st.armed) e.preventDefault() }

  function onPointerUp(e: PointerEvent) {
    if (!st || e.pointerId !== st.pointerId) return
    const { entry, armed, x0, y0 } = st
    const x = e.clientX, y = e.clientY
    const target = armed
      ? ((document.elementFromPoint(x, y) as HTMLElement | null)?.closest('[data-icday]') as HTMLElement | null)
      : null
    clearGesture()
    if (armed) {
      if (target) commitChipMove(entry, entry.fromIso, target.dataset.icday!)
      installClickEater() // a real drag happened — its own release click must not fall through to the chip
    } else {
      const dx = Math.abs(x - x0), dy = Math.abs(y - y0)
      if (dx <= SLOP && dy <= SLOP) opts.onTap(entry) // never armed, barely moved — a tap, routed to the calendar's own edit
    }
  }

  function onPointerCancel(e: PointerEvent) {
    if (!st || e.pointerId !== st.pointerId) return
    clearGesture() // no commit — a cancelled gesture (an OS interruption, an unexpected second touch) leaves the model untouched
  }

  root.addEventListener('pointerdown', onPointerDown, { passive: true })
  root.addEventListener('pointermove', onPointerMove, { passive: true })
  root.addEventListener('touchmove', onTouchMove, { passive: false })
  root.addEventListener('pointerup', onPointerUp, { passive: true })
  root.addEventListener('pointercancel', onPointerCancel, { passive: true })
  return () => {
    clearGesture()
    root.removeEventListener('pointerdown', onPointerDown)
    root.removeEventListener('pointermove', onPointerMove)
    root.removeEventListener('touchmove', onTouchMove)
    root.removeEventListener('pointerup', onPointerUp)
    root.removeEventListener('pointercancel', onPointerCancel)
  }
}
