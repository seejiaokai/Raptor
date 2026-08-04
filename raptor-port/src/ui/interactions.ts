/* The delegated click routing — the reference's two document-level click
   handlers (puck select / arm, day-warning strips, warning items, clear,
   blank-space clear), with the state halves in src/state/view.ts and the
   repaint replaced by the store's notify() (the week re-renders and the
   highlight pass re-runs from ViewWeek's effect). */
import { slotVal } from '../engine/slots'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { dayApproved, setDayApproved, publishALDay, signClear, markEdit, nextAL, verLabel } from '../engine/publish'
import { restoreDayVersion } from '../engine/restore'
import { HOOKS } from '../engine/hooks'
import { canEditSched } from '../state/auth'
import * as view from '../state/view'
import { notify } from '../state/store'
import { scrollToWarnFocus } from './highlights'
import { setDayPop, setAirKey, setDrawer } from './pops'
import { openScheduler } from './board'
import { setCurWeek } from '../engine/waves'
import { WARN } from '../engine/validate'

export function routeClick(e: MouseEvent) {
  const t = e.target as HTMLElement
  if (!t || !t.closest) return

  /* the palette drawer tab and the arm-strip cancel */
  if (t.closest('.ros-tab')) { document.body.classList.toggle('ros-open'); e.stopPropagation(); return }
  if (t.closest('[data-disarm]')) { view.disarmSlot(); notify(); e.stopPropagation(); return }

  /* a tap on a palette name: plant it if something is armed, otherwise fall
     through to the ordinary select-this-person-in-blue behaviour */
  const rp = t.closest('.rpuck[data-person]') as HTMLElement | null
  if (rp && view.ARM) {
    e.stopPropagation()
    if (rp.classList.contains('no')) { HOOKS.toast(`${PEOPLE[rp.dataset.person!].cs} — ${rp.dataset.why || 'not eligible here'}`, 'warn'); return }
    view.placeArmed(rp.dataset.person)
    notify(); return
  }

  /* per-day publish toggle — edit page only; the view page renders .dbeak.ro
     which carries no data-beak at all */
  const beak = t.closest('button[data-beak]') as HTMLElement | null
  if (beak) {
    e.stopPropagation()
    if (!canEditSched() || view.CURPAGE !== 'editsched') return
    const di = +beak.dataset.beak!; setDayApproved(di, !dayApproved(di)); notify(); return
  }
  /* per-day AL publish — same gate */
  const alp = t.closest('button[data-alpub]') as HTMLElement | null
  if (alp) {
    e.stopPropagation()
    if (!canEditSched() || view.CURPAGE !== 'editsched') return
    publishALDay(+alp.dataset.alpub!); notify(); return
  }
  /* restore a previewed version — the revert is ordinary pending edits that go
     out as the next AL, never a rewrite of what was already issued */
  const rst = t.closest('button[data-restore]') as HTMLElement | null
  if (rst) {
    e.stopPropagation()
    if (!canEditSched() || !(view.CURPAGE === 'editsched' || view.SBDAY != null)) return
    const di = +rst.dataset.restore!
    const ver = rst.dataset.rver === 'orig' ? 'orig' : +rst.dataset.rver!
    if (view.ARM && view.ARM.di === di) view.disarmSlot()   // the restore may remove the armed row
    const n = restoreDayVersion(di, ver)
    view.setDayPreview(di, null)
    if (n === false) { HOOKS.toast('That version is no longer available', 'warn'); notify(); return }
    view.afterSchedMutate()
    HOOKS.toast(n === 0
      ? `${DAYS[di].dow} already matches ${verLabel(ver)} — nothing to publish`
      : `${DAYS[di].dow} restored to ${verLabel(ver)} — ${n} change${n === 1 ? '' : 's'} pending · publish as AL${nextAL()}`)
    notify(); return
  }

  /* clear a day's sign-off */
  const sc = t.closest('[data-signclear]') as HTMLElement | null
  if (sc) {
    e.stopPropagation()
    signClear(+sc.dataset.signclear!); HOOKS.histPush(); HOOKS.reflow(); return
  }

  /* an EMPTY slot arms itself in edit mode; a FILLED puck falls through to
     the ordinary selection below (reference 2522-2526). The ARMED element is
     let through the emptiness guard: arm an empty cell, then fill its row by
     drag instead of a palette tap, and the guard used to make the ring
     untouchable — armSlot's own tap-again-to-put-down could never run, and a
     phone (no Escape key, no blank space to tap) wore the ring forever. */
  const slot = t.closest('.seat[data-slot],[data-fill]') as HTMLElement | null
  if (slot && HOOKS.editMode() && !t.closest('.puck[data-person]')) {
    const key = slot.dataset.slot || slot.dataset.fill
    if (key && (view.armedKey() === key || !slotVal(String(key).replace(/\.\+$/, '')))) {
      view.armSlot(key, slot); notify(); e.stopPropagation(); return
    }
  }

  /* click a puck → select all same-name pucks (blue), open their issues */
  const pk = t.closest('.puck[data-person]') as HTMLElement | null
  if (pk) {
    view.selectPerson(pk.dataset.person, !!pk.closest('.week'))
    notify(); e.stopPropagation(); return
  }

  /* a week chip (the seg strips and the drawer share this) — the demo data is
     the Jul 20 week regardless; the chips re-render for feedback and the
     drawer closes, exactly as the reference's handler does */
  const wk = t.closest('[data-wk]') as HTMLElement | null
  if (wk) {
    view.DPREV.clear()   // day indices are only meaningful within the loaded week
    setCurWeek(wk.dataset.wk)
    const f = document.getElementById('dateVField') as HTMLInputElement | null
    if (f) f.value = wk.dataset.wk!
    setDrawer(false); notify(); return
  }

  /* the Traffic button on a wave → the airspace popup */
  const air = t.closest('[data-air]') as HTMLElement | null
  if (air) { setAirKey(air.dataset.air!); notify(); return }

  /* a day head on the EDIT week opens the scheduler board (edit-page gated) */
  const sbo = t.closest('.sb-open[data-sbday]') as HTMLElement | null
  if (sbo && canEditSched() && view.CURPAGE === 'editsched') { openScheduler(+sbo.dataset.sbday!); e.stopPropagation(); return }

  /* the ⓘ chip / day head → the read-only day-details panel */
  const dib = t.closest('[data-dayinfo]') as HTMLElement | null
  if (dib) { setDayPop(+dib.dataset.dayinfo!); notify(); e.stopPropagation(); return }

  /* an issue listed in the day-detail panel → open that day's issue box and
     snap to the guilty puck (the panel closes behind it) */
  const adv = t.closest('[data-adv]') as HTMLElement | null
  if (adv) {
    const a = String(adv.dataset.adv).split('.'), di = +a[0]!, ix = +a[1]!
    const g = WARN.byDay[di], w = g && g.warns && g.warns[ix]; if (!w) return
    setDayPop(null)
    view.DWOPEN.clear(); view.DWOPEN.add(di)
    view.setWarnFocus({ di, ix, ids: (w.who || []).slice(), sev: w.sev })
    view.clearOtherHL()
    notify(); setTimeout(scrollToWarnFocus, 0); e.stopPropagation(); return
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

  /* stores toggle (edit mode) — verbatim; NO return: in the reference this is
     its own listener, so the blank-space clear below still sees the click */
  const st = t.closest('[data-store]') as HTMLElement | null
  if (st && HOOKS.editMode()) {
    const [di, gi, li, ai, k] = st.dataset.store!.split('.')
    const a = DAYS[+di!].waves[+gi!].formations[+li!].aircraft[+ai!]
    a.opts = a.opts || {}; a.opts[k!] = !a.opts[k!]; markEdit(`st:${di}.${gi}.${li}.${ai}`)
    notify()
  }

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
