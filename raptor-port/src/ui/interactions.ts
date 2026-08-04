/* The delegated click routing — the reference's two document-level click
   handlers (puck select / arm, day-warning strips, warning items, clear,
   blank-space clear), with the state halves in src/state/view.ts and the
   repaint replaced by the store's notify() (the week re-renders and the
   highlight pass re-runs from ViewWeek's effect). */
import { slotVal, inpKey, acceptInput, unacceptInput } from '../engine/slots'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { dayApproved, setDayApproved, publishALDay, signClear, markEdit, dayCurVer, dayPendCount, verLabel } from '../engine/publish'
import { restoreDayVersion } from '../engine/restore'
import { HOOKS } from '../engine/hooks'
import { canEditSched } from '../state/auth'
import * as view from '../state/view'
import { notify } from '../state/store'
import { scrollToWarnFocus } from './highlights'
import { STORE_CFG } from './html'
import { setDayPop, setAirKey, setDrawer } from './pops'
import { openScheduler } from './board'
import { setCurWeek } from '../engine/waves'
import { WARN } from '../engine/validate'

/* The config picker — a body-level popup anchored to the "+" button, built the
   same way board.ts builds waveMenu: it lives outside the React tree, offers
   only the configs not yet on, adds the chosen one through the funnel
   (markEdit → pending → next AL) and removes itself on any outside click. */
function openStoresMenu(anchor: HTMLElement, key: string) {
  document.querySelectorAll('.stmenu').forEach(x => x.remove())
  const [di, gi, li, ai] = key.split('.')
  const a = DAYS[+di!].waves[+gi!].formations[+li!].aircraft[+ai!]
  a.opts = a.opts || {}
  const left = STORE_CFG.filter(([k]) => !a.opts[k])
  const box = document.createElement('div')
  box.className = 'stmenu wavemenu'
  box.innerHTML = `<h5>Add config</h5><div class="wm-row">`
    + (left.length
      ? left.map(([k, lab]) => `<button class="wm" data-cfg="${k}">${lab}</button>`).join('')
      : `<div class="wm-note">All configs added.</div>`)
    + `</div>`
  document.body.appendChild(box)
  const r = anchor.getBoundingClientRect()
  box.style.left = Math.max(8, Math.min(window.innerWidth - box.offsetWidth - 8, Math.round(r.left))) + 'px'
  box.style.top = Math.min(window.innerHeight - box.offsetHeight - 8, Math.round(r.bottom + 6)) + 'px'
  box.addEventListener('click', (ev: any) => {
    const b = ev.target.closest('[data-cfg]'); if (!b) return
    a.opts[b.dataset.cfg] = true; markEdit(`st:${di}.${gi}.${li}.${ai}`); box.remove(); notify(); ev.stopPropagation()
  })
  setTimeout(() => document.addEventListener('click', function off() { box.remove(); document.removeEventListener('click', off) }, { once: true }), 0)
}

export function routeClick(e: MouseEvent) {
  const t = e.target as HTMLElement
  if (!t || !t.closest) return

  /* accepting a personal input — the same control on the week and the board, so
     it is routed here rather than duplicated in board.ts. Promotes the input
     into the ground programme (or files it under Unavailable), through the
     mutation funnel so it lands in the next AL like any other edit. */
  const ab = t.closest('[data-acc]') as HTMLElement | null
  if (ab) {
    e.stopPropagation()
    if (!canEditSched()) { HOOKS.toast('Only a scheduler can accept inputs', 'warn'); return }
    const di = +ab.dataset.accd!, k = ab.dataset.acck!, dest = ab.dataset.acc!
    const inp = INPUTS.find((x: any) => inpKey(x) === k)
    if (!inp) { HOOKS.toast('That input is no longer there', 'warn'); return }
    const ok = dest === 'x' ? unacceptInput(di, inp) : acceptInput(di, inp, dest)
    if (ok) {
      HOOKS.toast(dest === 'x' ? 'Accept undone'
        : dest === 'u' ? `${inp.type} filed under Unavailable`
        : `${inp.type} added to the ground programme`, 'ok')
      view.afterSchedMutate()
    }
    return
  }

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
  /* restore a previewed version — a ROLLBACK: that version becomes the live
     document immediately, marks and all. Unpublished edits on the day are
     discarded (the toast says how many); later ALs keep their records. No
     confirm dialog — the app has none anywhere, and undo is one step. */
  const rst = t.closest('button[data-restore]') as HTMLElement | null
  if (rst) {
    e.stopPropagation()
    if (!canEditSched() || !(view.CURPAGE === 'editsched' || view.SBDAY != null)) return
    const di = +rst.dataset.restore!
    const ver = rst.dataset.rver === 'orig' ? 'orig' : +rst.dataset.rver!
    /* already the current version with nothing pending — close the preview
       without a history step */
    if (String(dayCurVer(di)) === String(ver) && dayPendCount(di) === 0) {
      view.setDayPreview(di, null)
      HOOKS.toast(`${DAYS[di].dow} is already at ${verLabel(ver)}`)
      notify(); return
    }
    if (view.ARM && view.ARM.di === di) view.disarmSlot()   // the rollback may remove the armed row
    const dropped = restoreDayVersion(di, ver)
    view.setDayPreview(di, null)
    if (dropped === false) { HOOKS.toast('That version is no longer available', 'warn'); notify(); return }
    view.afterSchedMutate()
    HOOKS.toast(`${DAYS[di].dow} rolled back to ${verLabel(ver)} — this is now the live schedule`
      + (dropped ? ` · ${dropped} unpublished edit${dropped === 1 ? '' : 's'} discarded` : ''))
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

  /* click a puck → select just THAT puck (blue), open that person's issues.
     The identifying key is the enclosing seat/cell's slot key, the same value
     the highlight pass matches on, so the blue lands only on the one clicked. */
  const pk = t.closest('.puck[data-person]') as HTMLElement | null
  if (pk) {
    const cell = pk.closest('[data-slot],[data-fill]') as HTMLElement | null
    const key = cell ? (cell.dataset.slot || cell.dataset.fill) : null
    view.selectPerson(pk.dataset.person, !!pk.closest('.week'), key)
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

  /* a stores chip click removes that config (edit mode) — chips only render
     when on now, so a click can only ever be a removal. NO return: the
     blank-space clear below still sees the click, as it always has. */
  const st = t.closest('[data-store]') as HTMLElement | null
  if (st && HOOKS.editMode()) {
    const [di, gi, li, ai, k] = st.dataset.store!.split('.')
    const a = DAYS[+di!].waves[+gi!].formations[+li!].aircraft[+ai!]
    a.opts = a.opts || {}; a.opts[k!] = !a.opts[k!]; markEdit(`st:${di}.${gi}.${li}.${ai}`)
    notify()
  }

  /* the "+" opens the config picker — a body-level popup mirroring waveMenu */
  const stAdd = t.closest('[data-stadd]') as HTMLElement | null
  if (stAdd && HOOKS.editMode()) { openStoresMenu(stAdd, stAdd.dataset.stadd!); e.stopPropagation(); return }

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
