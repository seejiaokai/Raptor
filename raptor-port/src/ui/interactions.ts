/* The delegated click routing — the reference's two document-level click
   handlers (puck select / arm, day-warning strips, warning items, clear,
   blank-space clear), with the state halves in src/state/view.ts and the
   repaint replaced by the store's notify() (the week re-renders and the
   highlight pass re-runs from ViewWeek's effect). */
import { slotVal } from '../engine/slots'
import { HOOKS } from '../engine/hooks'
import * as view from '../state/view'
import { notify } from '../state/store'
import { scrollToWarnFocus } from './highlights'

export function routeClick(e: MouseEvent) {
  const t = e.target as HTMLElement
  if (!t || !t.closest) return

  /* an EMPTY slot arms itself in edit mode; a FILLED puck falls through to
     the ordinary selection below (reference 2522-2526) */
  const slot = t.closest('.seat[data-slot],[data-fill]') as HTMLElement | null
  if (slot && HOOKS.editMode() && !t.closest('.puck[data-person]')) {
    const key = slot.dataset.slot || slot.dataset.fill
    if (key && !slotVal(String(key).replace(/\.\+$/, ''))) {
      view.armSlot(key, slot); notify(); e.stopPropagation(); return
    }
  }

  /* click a puck → select all same-name pucks (blue), open their issues */
  const pk = t.closest('.puck[data-person]') as HTMLElement | null
  if (pk) {
    view.selectPerson(pk.dataset.person, !!pk.closest('.week'))
    notify(); e.stopPropagation(); return
  }

  /* day strip → expand / collapse in place */
  const s = t.closest('[data-daywarn]') as HTMLElement | null
  if (s) { view.toggleDayWarn(s.dataset.daywarn); notify(); e.stopPropagation(); return }

  /* one warning → focus + snap to the guilty puck */
  const it = t.closest('.witem[data-wdi]') as HTMLElement | null
  if (it) {
    view.focusWarn(it.dataset.wdi, it.dataset.wix)
    notify(); setTimeout(scrollToWarnFocus, 0); e.stopPropagation(); return
  }

  /* step back one level: drop the warning focus, stay on the person */
  const c = t.closest('[data-dwclear]')
  if (c) { view.clearWarnFocus(); notify(); e.stopPropagation(); return }

  /* Clicking any blank part of a schedule surface un-clicks everything —
     the exclusion list is the reference's, verbatim */
  const pg = t.closest('#page-viewsched,#page-editsched,#schedBoard')
  if (pg && !t.closest('a,button,input,select,textarea,[contenteditable="true"],'
    + '.fchip,.puck,.seat,.rpuck,.ros-tab,.ros-arm,.sb-slot,[data-fill],[data-slot],'
    + '.dwbox,.pillbtn,.day-head,.sb-open,.dinfobtn,.airpop,.schedbanner,.alpanel,'
    + '.sb-top,.sb-sign,.signoff,.sb-grip,.hscroll,.week-nav')) {
    let any = false
    if (view.ARM) { view.disarmSlot(); any = true }
    if (view.SELID || view.WFOCUS || view.PFOCUS || view.DWOPEN.size) { view.selDrop(); any = true }
    if (any) notify()
  }
}
