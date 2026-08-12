import { applyMove } from '../engine/reorder'
import { canEditSched } from '../state/auth'
import * as view from '../state/view'
import { notify } from '../state/store'

/* ---- dragging a board row to reorder it (owner, 8 Aug 26) ------------------
   Its own little machine, deliberately: `drag.ts` stays scoped to pucks (owner,
   Aug 26) and a board row is not a puck. Same shape as the qual-heading drag in
   QualsPage.tsx, for the same three reasons:

   - Pointer events rather than HTML5 drag-and-drop, so a finger works.
   - The implicit pointer capture a touch gets is RELEASED on the way down,
     because without it every pointermove keeps reporting the row the drag began
     on and the row can never find a new home.
   - The carried row and the drop bar are written STRAIGHT ONTO THE DOM instead
     of through state: every board panel is an innerHTML string that a re-render
     rebuilds, and rebuilding it under a moving pointer would drop the drag.
     Only the drop itself changes state.

   Delegated on the board wrap and attached once, so it survives every panel
   repaint underneath it. */
export function wireRowDrag(el: HTMLElement) {
  let from = ''
  let carry: HTMLElement | null = null
  let over: HTMLElement | null = null

  const clear = () => {
    if (carry) carry.classList.remove('rowdrag')
    if (over) over.classList.remove('rowdrop')
    carry = null; over = null; from = ''
  }
  const rowOf = (t: EventTarget | null) =>
    (t as HTMLElement)?.closest?.('[data-move]') as HTMLElement | null

  const onDown = (e: any) => {
    if (!canEditSched()) return
    if (view.DPREV.has(view.SBDAY as any)) return
    /* the GRIP only — a press on the row itself is a click on a field, and a
       row full of inputs has almost no blank space to spare */
    const grip = (e.target as HTMLElement).closest?.('.sb-grip') as HTMLElement | null
    if (!grip) return
    const row = rowOf(grip); if (!row) return
    from = row.dataset.move!
    try { grip.releasePointerCapture?.(e.pointerId) } catch { /* mouse: nothing to release */ }
    carry = row; row.classList.add('rowdrag')
    e.preventDefault()
  }
  const onMove = (e: any) => {
    if (!from) return
    const row = rowOf(e.target)
    if (!row || row === carry || row.dataset.move === from) return
    if (row !== over) {
      if (over) over.classList.remove('rowdrop')
      over = row; row.classList.add('rowdrop')
    }
  }
  const onUp = () => {
    const to = over?.dataset.move
    const src = from
    /* mv: addresses are index-based and captured at pointerdown/-move; a
       panel repaint mid-drag (innerHTML swap — e.g. a sort confirmed by
       keyboard while a touch holds a row) detaches both elements but their
       dataset survives, so the drop would fire STALE indices at a re-sorted
       model and move a row nobody was holding (audit, 12 Aug 26). A detached
       carry or target means the board changed under the drag: refuse, same
       as REORDERED_DI does for an armed puck. */
    const stale = (carry && !carry.isConnected) || (over && !over.isConnected)
    clear()
    if (stale) return
    if (src && to && applyMove(src, to)) { view.afterSchedMutate(); notify() }
  }

  el.addEventListener('pointerdown', onDown)
  el.addEventListener('pointermove', onMove)
  /* on the document, not the container: a finger that lifts off the edge of the
     board must still end the drag rather than leave it armed */
  document.addEventListener('pointerup', onUp)
  document.addEventListener('pointercancel', onUp)
  return () => {
    el.removeEventListener('pointerdown', onDown)
    el.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerup', onUp)
    document.removeEventListener('pointercancel', onUp)
  }
}
