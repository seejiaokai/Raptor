/* The delegated click routing — the reference's two document-level click
   handlers (puck select / arm, day-warning strips, warning items, clear,
   blank-space clear), with the state halves in src/state/view.ts and the
   repaint replaced by the store's notify() (the week re-renders and the
   highlight pass re-runs from ViewWeek's effect). */
import { slotVal, inpKey, acceptInput, unacceptInput, txtSet } from '../engine/slots'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { PEOPLE, isSpecial } from '../engine/people'
import { dayApproved, setDayApproved, publishALDay, signClear, markEdit, dayCurVer, dayPendCount, verLabel } from '../engine/publish'
import { restoreDayVersion } from '../engine/restore'
import { HOOKS } from '../engine/hooks'
import { canEditSched } from '../state/auth'
import * as view from '../state/view'
import { notify } from '../state/store'
import { scrollToWarnFocus, queueHold, warnWeekId } from './highlights'
import { STORE_CFG, addStore, delStore, renameStore, moveStore, storesSave, storesText } from '../engine'
import { logAction } from '../engine/editlog'
import { esc } from '../state/view'
import { setDayPop, setAirKey, setDrawer, setInpEdit, setHistList, closeHistList } from './pops'
import { reassignInput } from './inputedit'
import { openScheduler, toggleSbwarn, boardTab } from './board'
import { hideHistBub, pinHistBubAt, findHistCell } from './histbubble'
import { setCurWeek } from '../engine/waves'
import { WARN } from '../engine/validate'

/* Focus a warning clicked from somewhere that is NOT an already-open day box —
   the board's issue list, or a chip on a puck. Both have to open the box
   themselves: html.ts renders the "✕ Clear focus" button only inside an open
   box, so a focus set with DWOPEN empty would leave the user glowing pucks and
   no way to clear them short of hunting for blank space. This mirrors the
   day-detail panel's [data-adv] branch, which had the same problem to solve. */
function jumpToWarn(di: number, ix: number) {
  const g = WARN.byDay[di], w = g && g.warns && g.warns[ix]
  if (!w) return                       // a stale index — validate() rebuilds WARN wholesale
  view.DWOPEN.clear(); view.DWOPEN.add(di)
  /* code/prevDi/leaveBy ride along exactly as focusWarn sets them — the
     previous-day trace must not depend on WHICH surface opened the warning */
  view.setWarnFocus({ di, ix, ids: (w.who || []).slice(), sev: w.sev, key: w.key, code: w.code, prevDi: w.prevDi, leaveBy: w.leaveBy })
  view.clearOtherHL()
  notify(); setTimeout(scrollToWarnFocus, 0)
}

/* THE CHANGES LIST JUMPS TO THE DETAIL IT NAMES (owner, 11 Aug 26 — "if i
   click on the changes on the list, my view will snap to that specific change
   and show all the history of that specific change on the bubble until i click
   away"). The warning list's jumpToWarn above is the same shape and the same
   three steps, which is why this sits beside it: change what is on screen,
   notify, then act on the repainted DOM one task later.

   The list CLOSES first. On a desktop it is a centred modal over the board, so
   a jump behind it would move something the user cannot see; the owner chose
   this over keeping it open. Structural entries carry no key and no cell, so
   the row is not clickable at all rather than clickable-and-inert.

   `boardTab` before `notify` because the day may not be the open one — a
   change made on Thursday, read from the whole-week list on Monday's board. */
export function jumpToChange(key: string, di: any) {
  if (!key) return
  closeHistList()
  hideHistBub()
  if (di != null && view.SBDAY !== +di) boardTab(+di)
  notify()
  setTimeout(() => {
    const wrap = document.querySelector('.sb-boardwrap')
    const el = wrap && findHistCell(wrap, key)
    /* the row it addressed can have been deleted since — say so rather than
       doing nothing, which reads as the click not registering */
    if (!el) { HOOKS.toast('That detail is no longer on this day', 'warn'); return }
    pinHistBubAt(el)
    /* the bubble is already up, so the smooth scroll's own events re-anchor it
       the whole way in (histbubble's document-level scroll listener).
       GUARDED because jsdom does not implement scrollIntoView at all — it has
       no scrolling to implement it with. Unguarded it threw out of this
       deferred callback, where no test could catch it: every assertion still
       passed and the run failed on two unhandled errors, which is a shape
       worth recognising. Where the scroll is REAL it is measured in
       e2e/geometry.spec.ts, which is the only place it can be. */
    if (typeof el.scrollIntoView === 'function')
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, 0)
}

/* HOLD THE SCREEN STILL ON SELECTION (owner, 7 Aug 26 — "it should just turn
   blue"). Selecting a man also opens his issue boxes, and a box opens ABOVE
   the schedule inside its day column — so the very puck just clicked leapt
   ~220px down the page, which read as the view panning. The click's only
   visible change should be the lighting: capture where the puck sat, and at
   the end of the render's own highlight pass (queueHold — the same task as
   the day-markup swap, BEFORE the browser paints it, which is what keeps the
   correction invisible) scroll the PAGE
   by however far it moved, so it stays put under the pointer. The swap
   replaces the element itself, so it is re-found by week, day, name and
   position, never by identity. Off the week (board, palettes) nothing above
   the puck changes, the delta is zero and this is a no-op. jsdom reports
   every rect at 0×0, so vitest sees a zero delta by construction — the hold
   is measured where it is real, in e2e/geometry.spec.ts. */
function holdPuckStill(pk: HTMLElement) {
  const week = pk.closest('.week') as HTMLElement | null
  const day = pk.closest('.day[data-day]') as HTMLElement | null
  if (!week || !day) return () => {}
  const id = pk.dataset.person!, di = day.dataset.day!, wk = week.id
  const ix = [...day.querySelectorAll(`.puck[data-person="${id}"]`)].indexOf(pk)
  const top = pk.getBoundingClientRect().top
  return () => {
    const d = document.querySelector(`#${wk} .day[data-day="${di}"]`)
    const again = d && (d.querySelectorAll(`.puck[data-person="${id}"]`)[ix] as HTMLElement)
    if (!again) return
    const delta = again.getBoundingClientRect().top - top
    if (Math.abs(delta) > 1) window.scrollBy(0, delta)
  }
}

/* HOLD THE SCREEN STILL WHEN A BLANK TAP COLLAPSES AN OPEN BOX. A blank-space
   click drops the selection and every expanded day-warning box at once. When a
   box sits ABOVE the viewport — you clicked a warning, the view snapped DOWN to
   the guilty puck, then you tapped blank to dismiss it — collapsing it takes
   its height out of the page above what you are reading, and because the day is
   repainted by an outerHTML swap the browser's own scroll anchoring cannot
   survive the replaced node, so the whole view leaps up to some unrelated part
   of the day (measured: −1103px on a phone, the focused puck flung clean off
   the top). This is the same jump holdPuckStill fixes for selection, and the
   same cure: anchor on a puck the reader is looking at and undo the shift at
   the end of the render's highlight pass (queueHold — the same task as the
   swap, before the browser paints, so the leap is never shown).
   The anchor is picked from the days whose box is actually collapsing (DWOPEN
   at capture time — selection fills it with the person's flagged days too), and
   only among pucks fully on screen: a puck in a day scrolled off to the SIDE
   has a valid vertical top but never moves when THIS day shortens, so anchoring
   it would measure a zero shift and leave the real jump uncorrected — which is
   exactly the bug the phone showed. Nothing on screen from those days (or an
   empty set) yields a no-op, which is every blank tap that moves no layout. */
function holdViewStill(days: any[]) {
  const week = document.getElementById(warnWeekId())
  if (!week) return () => {}
  let anchor: HTMLElement | null = null, bestTop = Infinity
  for (const di of days) {
    const day = week.querySelector(`.day[data-day="${di}"]`)
    if (!day) continue
    day.querySelectorAll('.puck[data-person]').forEach((p: any) => {
      const r = p.getBoundingClientRect()
      const onScreen = r.top >= 0 && r.top < window.innerHeight && r.left < window.innerWidth && r.right > 0
      if (onScreen && r.top < bestTop) { bestTop = r.top; anchor = p }
    })
  }
  return anchor ? holdPuckStill(anchor) : () => {}
}

/* The stores popup — a body-level box anchored to the C button, built the
   way board.ts builds waveMenu: outside the React tree, removing itself on
   any outside click. It lists EVERY store, lit where the jet carries it, so
   the box is self-contained — the board has no inline chips to read.
   Toggling goes through the funnel (markEdit → pending → next AL). The pen
   (✎) switches the SAME box into an editor for the squadron's list itself —
   reorder, rename, add, remove — and that is a settings change, not a
   schedule edit, so nothing in the pen branch ever calls markEdit. */
function openStoresMenu(anchor: HTMLElement, key: string) {
  /* _offClick: see the comment on `off` below — board.ts's waveMenu clears
     '.wavemenu' too (this box carries that class as well, for its look), so
     this clears both classes right back at it: opening "+ Wave" then C used
     to leave the wave chooser on screen underneath the stores box, since
     this used to clear only its own class. Symmetric with waveMenu's own
     clearing, and matching '.stmenu, .wavemenu' catches this box's own
     stale instances exactly once (querySelectorAll never double-reports an
     element that matches both halves of the selector list). */
  document.querySelectorAll('.stmenu, .wavemenu').forEach(x => {
    const off = (x as any)._offClick
    if (off) document.removeEventListener('click', off)
    x.remove()
  })
  const [di, gi, li, ai] = key.split('.')
  const a = DAYS[+di!].waves[+gi!].formations[+li!].aircraft[+ai!]
  a.opts = a.opts || {}
  const box = document.createElement('div')
  box.className = 'stmenu wavemenu'
  /* ANCHOR TO THE SURFACE THE BUTTON WAS ACTUALLY PRESSED ON (regression —
     final review, 8 Aug 26). `#eWeek` and `#schedBoard` both render
     `data-stcfg="<same key>"` for the same jet when the board is open over
     the week — `<Shell/>` (the week) precedes `<SchedBoard/>` in App.tsx,
     so an unscoped `document.querySelector('[data-stcfg="..."]')` in place()
     always finds the WEEK's button, even when the board's was the one
     clicked. Measured on the built app before this fix: board button at
     x=731,y=275, popup opened at x=435,y=594 — the week's button position,
     ~300px away, floating over unrelated board content, wrong from the
     very first paint. Capture the pressed button's own surface root here,
     once, and scope EVERY re-query (initial place() and the re-placement
     after a toggle/rename/pen action) to it, so the board and the week can
     never cross-anchor even though they share the same data-stcfg value. */
  const root: ParentNode = anchor.closest('#schedBoard') || document
  let pen = false
  /* set by the rename handler on success — see its comment — and drained
     at the top of the click handler below, never anywhere else. */
  let needPlace = false
  const paint = () => {
    box.innerHTML = `<h5>Stores configuration`
      + `<button class="st-pen${pen ? ' on' : ''}" title="${pen ? 'Done editing the list' : 'Edit the list'}">✎</button></h5>`
      + (pen
        ? `<div class="st-elist">`
          + STORE_CFG.map(([k, lab], i) =>
            `<div class="st-erow" data-k="${k}">`
            + `<input class="st-lab" value="${esc(lab)}" maxlength="16" aria-label="Name for ${esc(lab)}">`
            + `<button class="st-up" ${i === 0 ? 'disabled' : ''} title="Move up">↑</button>`
            + `<button class="st-dn" ${i === STORE_CFG.length - 1 ? 'disabled' : ''} title="Move down">↓</button>`
            + `<button class="st-del" title="Remove ${esc(lab)} from the list">✕</button></div>`).join('')
          + `</div><div class="st-addrow">`
          + `<input class="st-new" placeholder="e.g. LGB" maxlength="16" aria-label="New store name">`
          + `<button class="st-add">Add</button></div>`
          + `<div class="wm-note">The list is the squadron's, not this jet's — it survives a reload. Removing one keeps every jet that carries it.</div>`
        : `<div class="wm-row">`
          + STORE_CFG.map(([k, lab]) =>
            `<button class="wm${a.opts[k] ? ' on' : ''}" data-cfg="${k}">${esc(lab)}</button>`).join('')
          + `</div>`)
  }
  /* notify() rebuilds the remarks cell, so the captured `anchor` node may be
     detached AND the live button moves as chips appear or wrap before it in the
     inline-flex row — measure the live one, and leave the box put when there is
     nothing to measure (a detached node, or jsdom, both report 0x0). */
  const place = () => {
    const live = root.querySelector(`[data-stcfg="${key}"]`) as HTMLElement | null
    const r = (live || anchor).getBoundingClientRect()
    if (!r.width && !r.height) return
    /* PINCH-ZOOMED (phone — owner, from the deployed site, 8 Aug 26): the C
       button is small, so on a phone the natural gesture is zoom in, press it,
       and everything below places in LAYOUT-viewport coordinates — the box
       landed in the part of the page the zoom had pushed off screen, and the
       user had to zoom back out to find it. When the pinch is real (scale
       comfortably past 1 — the guard tolerates the sub-pixel scales some
       browsers report unzoomed), centre the box in the VISUAL viewport — the
       slice of page actually on screen — and cap it to fit, so it opens under
       the user's eyes at any zoom. position:fixed anchors to the layout
       viewport, which is why the visual viewport's own offset is added in.
       Ordinary un-zoomed placement below is untouched. */
    const vv = window.visualViewport
    if (vv && vv.scale > 1.05) {
      /* minWidth too: .wavemenu's min-width (250px) outranks any max-width,
         so without zeroing it the cap below is a no-op and the box still
         overflows a visual viewport narrower than that — measured, not
         theorised, on the built bundle at 2.5×. The chips row flex-wraps,
         so a narrow box grows down, and the height cap + scroll catch it. */
      box.style.minWidth = '0'
      box.style.maxWidth = (vv.width - 16) + 'px'
      box.style.maxHeight = (vv.height - 16) + 'px'
      box.style.overflowY = 'auto'
      box.style.left = Math.round(vv.offsetLeft + Math.max(8, (vv.width - box.offsetWidth) / 2)) + 'px'
      box.style.top = Math.round(vv.offsetTop + Math.max(8, (vv.height - box.offsetHeight) / 2)) + 'px'
      return
    }
    /* zoomed out again since: hand the caps back to the stylesheet */
    box.style.minWidth = box.style.maxWidth = box.style.maxHeight = box.style.overflowY = ''
    box.style.left = Math.max(8, Math.min(window.innerWidth - box.offsetWidth - 8, Math.round(r.left))) + 'px'
    box.style.top = Math.min(window.innerHeight - box.offsetHeight - 8, Math.round(r.bottom + 6)) + 'px'
  }
  paint()
  document.body.appendChild(box)
  place()
  box.addEventListener('click', (ev: any) => {
    ev.stopPropagation()
    /* this click began AND ended inside the box, and stopPropagation keeps
       it from ever reaching `off` (below) — reset the press-origin note here
       or it would swallow the NEXT outside click for nothing */
    pressIn = false
    /* drain first, unconditionally — see the rename handler's comment for
       why this is the safe place to do it: THIS click has already been
       dispatched and its target already resolved by the time any handler
       runs, so re-anchoring here cannot affect it, only whatever happens
       after. */
    if (needPlace) { needPlace = false; place() }
    const T = ev.target as HTMLElement

    /* opening/closing the pen changes the box's HEIGHT dramatically — six
       chips become six input rows plus an add-row and a note — and nothing
       downstream of this branch calls notify(), so nothing else will ever
       re-run place() for it. Call it directly, right here, rather than
       through queueHold: queueHold only drains off the week's own repaint
       (EditWeek's effect, on a version bump), and this branch causes none. */
    if (T.closest('.st-pen')) { pen = !pen; paint(); place(); return }

    if (pen) {
      const row = T.closest('.st-erow') as HTMLElement | null
      const k = row?.dataset.k
      if (k && T.closest('.st-del')) {
        const lab = STORE_CFG.find(([x]) => x === k)?.[1] || k
        delStore(k); storesSave(); paint(); place()
        HOOKS.toast(`${lab} removed from the list — every jet carrying it keeps it. Add it back and the chips return.`)
        /* queueHold too: if this jet carries the removed store its own
           on-chip vanishes from the remarks cell, shifting the C button
           that place() just anchored to — re-run it once the week repaints. */
        queueHold(place)
        notify()
        return
      }
      if (k && (T.closest('.st-up') || T.closest('.st-dn'))) {
        const i = STORE_CFG.findIndex(([x]) => x === k)
        if (moveStore(i, i + (T.closest('.st-up') ? -1 : 1))) { storesSave(); paint(); queueHold(place); notify() }
        return
      }
      if (T.closest('.st-add')) {
        const box2 = box.querySelector('.st-new') as HTMLInputElement
        const why = addStore(box2.value)
        if (why) return HOOKS.toast(why)
        storesSave(); paint(); place(); queueHold(place); notify()
        return
      }
      return
    }

    const b = T.closest('[data-cfg]') as HTMLElement | null; if (!b) return
    const key2 = b.dataset.cfg!
    /* the load either side of the toggle, so History can say what this jet was
       carrying and what it carries now — one row per jet, matching the single
       amendment mark the `st:` key stands for (stores.ts's storesText) */
    const stWas = storesText(a.opts)
    a.opts[key2] = !a.opts[key2]
    markEdit(`st:${di}.${gi}.${li}.${ai}`, stWas, storesText(a.opts))
    paint()
    /* queueHold, not setTimeout: the week repaints via EditWeek's effect,
       which calls refreshHighlights() once the DOM swap is done — draining
       the held callback right there, in the same task as the swap, exactly
       the ordering holdPuckStill needs for the same reason. A raw timer has
       no guarantee it fires after that effect. */
    queueHold(place)
    notify()
  })

  /* rename commits on change, so a click away inside the box is enough. No
     markEdit here either — see the function comment.

     NEITHER outcome (success or rejected) calls paint(). A <button> takes
     focus on mousedown in Chromium, before mouseup — so typing a rename
     (accepted or not — this handler fires either way) and then clicking
     ✕/↑/Add on the SAME row fires this handler (change fires on blur,
     ahead of the click) synchronously inside that same mousedown. paint()
     replaces the row's whole subtree via innerHTML, detaching the very
     button the mousedown just landed on; the mouseup that follows can't
     complete a click on a node that's no longer there, so it lands on the
     box itself instead, where nothing matches, and the click is silently
     dropped — a scheduler has to click twice. A deferred paint() on a
     timer does not fix it either: the timer drains before mouseup, same
     as a synchronous one. So both outcomes patch just the one row in
     place instead of rebuilding it.

     The SUCCESS path used to also call queueHold(place) here, like every
     other branch in this box — measured, not assumed, that this is wrong
     in exactly the same way. If the jet this popup is CONFIGURING carries
     the store being renamed, its own on-chip's TEXT changes — and .stores
     is display:inline-flex;flex-wrap:wrap, so the C button's x is a
     function of that chip's WIDTH, not the chip count. Roughly 5px per
     character, so up to ~70px at MAX_LABEL (16), possibly wrapping the
     chip row onto another line. This is not a rare case: it is exactly
     the case this popup exists to serve (configuring what THIS jet
     carries), so it is the common case, not the edge one. queueHold(place)
     drains SYNCHRONOUSLY inside this same mousedown — notify() bumps the
     version, EditWeek's effect runs, refreshHighlights drains the held
     place() — all before the pending click's mouseup lands. Measured: 15px
     of drift for a 3-character delta, moving the box out from under the
     pointer and swallowing the click exactly the way paint() did. A
     deferred call is no safer, for the same reason the deferred paint()
     above isn't: checked, a setTimeout(0) queued from inside a mousedown
     handler fires before Playwright's next CDP command (the mouseup)
     arrives — and there is no guarantee a real user's press is any slower.

     So: set needPlace instead, and let the box's own click handler drain
     it at its very top — see the comment there. By the time that runs,
     THIS click (whichever one follows the rename) has already been
     dispatched and its target already resolved; 'click' fires strictly
     after 'mouseup', and the browser decides a click's target before any
     JS sees it, so re-anchoring there cannot unwind the click that is
     currently landing. It only means the box is correctly placed before
     that click's own action runs, and before the next one.

     What makes the gap in between — from the moment a rename commits to
     the moment SOME click into this box drains needPlace — actually SAFE,
     not just cheaper than the alternative: `.st-lab` exists only in pen
     state, and the only way out of pen state is the ✎ button, which calls
     place() itself, draining needPlace on the way in — so a drifted box
     can never be seen in the chip view or at dismissal. Every other pen
     action (✕, ↑/↓, Add) re-places too, on top of draining needPlace
     first. And a rename never changes the box's own HEIGHT, so place()'s
     viewport clamp is never invalidated by it — the box can drift
     sideways but can never end up hanging off-screen for it. */
  box.addEventListener('change', (ev: any) => {
    const inp = (ev.target as HTMLElement).closest('.st-lab') as HTMLInputElement | null
    if (!inp) return
    const row = inp.closest('.st-erow') as HTMLElement
    const k = row.dataset.k!
    const why = renameStore(k, inp.value)
    if (why) {
      const lab = STORE_CFG.find(([x]) => x === k)?.[1] || k
      inp.value = lab
      inp.setAttribute('aria-label', `Name for ${lab}`)
      HOOKS.toast(why)
      return
    }
    storesSave()
    const lab = STORE_CFG.find(([x]) => x === k)?.[1] || inp.value
    inp.value = lab
    inp.setAttribute('aria-label', `Name for ${lab}`)
    const del = row.querySelector('.st-del') as HTMLElement | null
    if (del) del.setAttribute('title', `Remove ${lab} from the list`)
    needPlace = true
    notify()
  })

  /* The box removes itself on an outside click — the pen included (owner,
     8 Aug 26: it used to stay put while the pen was open, and a scheduler
     who was done editing had no way out but the ✎). What that suspension
     was protecting against is real, though, and keeps its guard: a press
     that STARTS inside the box and ends outside it — selecting a rename
     field's text and overshooting the edge — dispatches its click on the
     common ancestor, outside the box, and must not kill it mid-edit. So
     the box notes every press that begins on it (pointerdown, so touch
     counts too) and `off` swallows exactly that one click; a click whose
     press also began outside still closes the box, pen open or not. An
     in-progress rename is not lost to the close: pressing outside blurs
     the field first, and change (the commit) fires on blur, ahead of the
     click. Not {once:true}, since a click `off` declines to act on must
     not deregister it — so the box records its own handler on itself, as
     `_offClick`, and ANY code that removes this box by other means has to
     check for it and unhook it first, or it leaks a listener attached to
     document (the "replace with a fresh popup" branch above, and board.ts's
     waveMenu, both clear by class — and a press-began-inside click would
     sail past a detached box's guards to nothing). */
  let pressIn = false
  box.addEventListener('pointerdown', () => { pressIn = true })
  const off = (ev: any) => {
    if (box.contains(ev.target)) return
    if (pressIn) { pressIn = false; return }
    box.remove(); document.removeEventListener('click', off)
  }
  ;(box as any)._offClick = off
  setTimeout(() => document.addEventListener('click', off), 0)
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
      /* SAID ONCE, to the scheduler and to the log, in the same words — the
         same shape as board.ts's act(). Accepting to the ground programme adds
         a real row to the day, which the board's own "+ Item" has always
         logged; this path reaches markEdit with no key (there is no "before"
         for a row that did not exist), so it needs the sentence instead or the
         row appears in the schedule and nowhere in the changes list. */
      /* the callsign rides along with the type — "an LL" says what happened,
         "Bane's LL" says who it happened to, which is the thing the changes
         list is actually for */
      const cs = PEOPLE[inp.person] ? PEOPLE[inp.person].cs : inp.person
      const said = dest === 'x' ? 'Accept undone'
        : dest === 'u' ? `${cs}'s ${inp.type} filed under Unavailable`
        : `${cs}'s ${inp.type} added to the ground programme`
      logAction(di, said)
      HOOKS.toast(said, 'ok')
      view.afterSchedMutate()
    }
    return
  }

  /* an input's own label, pressed — the week's and the board's are the same
     control, so it routes here beside Accept above. It only OPENS the dialog;
     ui/inputedit.tsx owns the write, which is the same commit the Inputs page
     runs. The row object is resolved here and handed over, because the content
     key it is addressed by is built from the very fields the dialog changes. */
  const ib = t.closest('[data-inpedit]') as HTMLElement | null
  if (ib) {
    e.stopPropagation()
    if (!canEditSched()) { HOOKS.toast('Only a scheduler can edit inputs from here', 'warn'); return }
    const inp = INPUTS.find((x: any) => inpKey(x) === ib.dataset.inpedit!)
    if (!inp) { HOOKS.toast('That input is no longer there', 'warn'); return }
    setInpEdit(inp)
    notify()
    return
  }

  /* accepting the suggested B (owner spec, 6 Aug 26). A blank formation offers
     the calculated take-off-minus-briefLead time as a ghost above the box —
     see html.ts's .bto and board.ts's .sb-bcell, both emit .bsug — and a
     click there is a deliberate "yes, that's the brief", written through the
     funnel exactly like typing it would be, rather than landing as an
     invisible default nobody chose. */
  const bacc = t.closest('[data-bacc]') as HTMLElement | null
  if (bacc) {
    e.stopPropagation()
    if (!canEditSched()) { HOOKS.toast('Only a scheduler can set the brief time', 'warn'); return }
    const key = bacc.dataset.bacc!, val = bacc.dataset.bval || ''
    /* txtSet is the mutation funnel (noteChange → pending); markEdit() below
       carries NO key because txtSet already marked this one — the same
       convention textedit.ts's routeFocusOut uses after a successful txtSet. */
    if (txtSet(key, val)) { markEdit(); view.afterSchedMutate() }
    notify()
    return
  }

  /* the palette drawer tab and the arm-strip cancel */
  if (t.closest('.ros-tab')) { document.body.classList.toggle('ros-open'); e.stopPropagation(); return }
  if (t.closest('[data-disarm]')) { view.disarmSlot(); notify(); e.stopPropagation(); return }

  /* a tap on a palette name: plant it if something is armed, otherwise fall
     through to the ordinary select-this-person-in-blue behaviour. A darkened
     name plants too (owner, 13 Aug 26): its reason is printed on the list
     before the tap, and placeArmed repeats it as the warn toast after.

     An 'iu:' key is the Unavailable-reassign arm, not a schedule slot —
     placeArmed's fillSlot/setSlotVal would not know what to do with it (and
     would apply the seat-eligibility bar the owner explicitly said this edit
     must NOT carry). reassignInput is commitInputEdit's relink under a new
     name (inputedit.tsx), so it does its own disarm/notify — see reassignInput's
     own doc comment for why afterSchedMutate is not called again here: that
     would push a second history step onto the SAME action. */
  const rp = t.closest('.rpuck[data-person]') as HTMLElement | null
  if (rp && view.ARM) {
    e.stopPropagation()
    const armKey = view.ARM.key
    if (String(armKey).indexOf('iu:') === 0) {
      const iid = String(armKey).slice(3)
      view.disarmSlot()
      reassignInput(iid, rp.dataset.person)
      notify(); return
    }
    view.placeArmed(rp.dataset.person)
    notify(); return
  }

  /* the Available-crew panel folds and unfolds per day (owner, 13 Aug 26 —
     collapsed one-liner is the default). Edit page only, like the panel. */
  const avt = t.closest('[data-avtog]') as HTMLElement | null
  if (avt) {
    e.stopPropagation()
    if (!canEditSched() || view.CURPAGE !== 'editsched') return
    view.toggleAvail(+avt.dataset.avtog!); notify(); return
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
    /* the biggest single change on the board, and it used to leave no trace at
       all: restoreDayVersion swaps the whole day object, so not one key passes
       through the funnel and the value-diff path has nothing to compare. The
       sentence is the record, exactly as it is for a removed line. */
    const said = `${DAYS[di].dow} rolled back to ${verLabel(ver)} — this is now the live schedule`
      + (dropped ? ` · ${dropped} unpublished edit${dropped === 1 ? '' : 's'} discarded` : '')
    logAction(di, said)
    HOOKS.toast(said)
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
     phone (no Escape key, no blank space to tap) wore the ring forever.
     A PLACEHOLDER-filled slot arms exactly like an empty one (owner, 13 Aug
     26): a placeholder means "someone still needed here", so tapping it goes
     straight to finding that someone — the palette tap then replaces the
     placeholder. Only a REAL person's puck falls through to selection.

     An Unavailable row's seat (data-inpseat) is the one exception to "a real
     puck blocks arming": it is ALWAYS occupied — that is the whole point of
     the row — so waiting for it to go empty would mean it could never arm at
     all, and "even down to changing the puck" (owner, 14 Aug 26) needs it to.
     Its key is 'iu:<iid>' (engine/keys.ts's keyDay still parses a day out of
     it — there is none, so it reads -1, same as any other dayless text key)
     rather than the funnel grammar slotVal/isSpecial understand, so it skips
     both of those reads and always offers to arm. */
  const slot = t.closest('.seat[data-slot],[data-fill],[data-inpseat]') as HTMLElement | null
  const slotPuck = t.closest('.puck[data-person]') as HTMLElement | null
  const inpSeat = slot?.dataset.inpseat
  if (slot && HOOKS.editMode() && (inpSeat || !slotPuck || isSpecial(slotPuck.dataset.person))) {
    const key = inpSeat ? `iu:${inpSeat}` : (slot.dataset.slot || slot.dataset.fill)
    const base = String(key).replace(/\.\+$/, '')
    if (key && (inpSeat || view.armedKey() === key || !slotVal(base) || isSpecial(slotVal(base)))) {
      view.armSlot(key, slot); notify(); e.stopPropagation(); return
    }
  }

  /* A warning clicked from the board's issue list. It has to sit AFTER the
     arm-and-plant branch above — a board puck's chip is inside a palette-armed
     flow's line of fire — and it deliberately does not use focusWarn: that
     toggles, which is right for a list you are already looking at and wrong
     here, and it leaves DWOPEN alone. See jumpToWarn. */
  /* the phone board's Live checks header folds/unfolds its list (owner,
     8 Aug 26) — phone only: on desktop the side panel is always open and
     the header is inert */
  if (t.closest('[data-sbwtog]') && HOOKS.isPhone()) { toggleSbwarn(); notify(); e.stopPropagation(); return }

  /* the changes list, opened from the last line of that same checks panel
     while History is on (board.ts's boardWarnHTML). It sits ABOVE the
     .wln[data-wdi] branch below because it is a .wln too and carries no
     data-wdi — matched by its own attribute rather than by elimination, so a
     future warning row without an index cannot fall into it. Opens on the
     whole week; the dialog's own filter narrows it to a day. */
  /* hideHistBub first: on a phone the bubble is still up from the tap that
     raised it (it times out, it does not wait for a pointer to leave), and a
     bubble hanging over the board behind the list it just opened is clutter
     even now that it can no longer cover it. The COVERING was the original
     reason for this line and is no longer what stops it — `.histbub` sits
     below `.modal` in the stack since the stacking fix (scheduler.css), which
     is what covers the other seven boxes this one call site never did. */
  if (t.closest('[data-histopen]')) { hideHistBub(); setHistList('all'); notify(); e.stopPropagation(); return }

  const wl = t.closest('.wln[data-wdi]') as HTMLElement | null
  if (wl) { jumpToWarn(+wl.dataset.wdi!, +wl.dataset.wix!); e.stopPropagation(); return }

  /* The flag chip is NOT a navigation surface (owner, 7 Aug 26 — it used to
     jump to the person's worst warning, so the chip and the puck body gave
     two different views of the same problem). It falls through to the puck
     branch below and selects the person, whose flagged days open narrowed to
     him anyway — the chip, like the ring, is part of the puck. The surfaces
     that still navigate to a single warning are the lists: the week's issue
     rows, the day-detail panel and the board's Live checks. */

  /* click a puck → select that person: every copy of the name lights blue,
     and their issue boxes open */
  const pk = t.closest('.puck[data-person]') as HTMLElement | null
  if (pk) {
    /* queueHold, NOT setTimeout (owner, 7 Aug 26: "the page jitters") — a
       timeout runs after the browser has painted the shifted layout, so one
       frame showed the leap before the scroll snapped it back. The queue is
       drained by refreshHighlights at the end of the same task that swaps
       the day markup, so the displaced frame is never painted at all. */
    queueHold(holdPuckStill(pk))
    view.selectPerson(pk.dataset.person, !!pk.closest('.week'))
    notify()
    e.stopPropagation(); return
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
    /* code/prevDi/leaveBy ride along exactly as focusWarn sets them — the
       previous-day trace must not depend on WHICH surface opened the warning */
    view.setWarnFocus({ di, ix, ids: (w.who || []).slice(), sev: w.sev, key: w.key, code: w.code, prevDi: w.prevDi, leaveBy: w.leaveBy })
    view.clearOtherHL()
    notify(); setTimeout(scrollToWarnFocus, 0); e.stopPropagation(); return
  }

  /* day strip → expand / collapse in place */
  const s = t.closest('[data-daywarn]') as HTMLElement | null
  if (s) { view.toggleDayWarn(s.dataset.daywarn); notify(); e.stopPropagation(); return }

  /* one warning → focus + snap to the guilty puck */
  const it = t.closest('.witem[data-wdi]') as HTMLElement | null
  if (it) {
    const di = +it.dataset.wdi!, ix = +it.dataset.wix!
    view.focusWarn(it.dataset.wdi, it.dataset.wix)
    /* Only snap if the focus really landed on what was clicked. focusWarn
       bails when the index no longer resolves — WARN is reassigned wholesale by
       every validate(), so a row rendered before an edit can outlive its
       warning — and scrolling anyway would fly the week off to whatever was
       focused BEFORE. The toggle-off case needs no guard: WFOCUS is null and
       scrollToWarnFocus returns on its own. */
    const landed = view.WFOCUS && view.WFOCUS.di === di && view.WFOCUS.ix === ix
    /* The cross-day crew-rest row is the one issue row whose warning lives on
       a DIFFERENT day than the row itself. It focuses that warning like any
       other — the breach is what is selected, and his pucks over there light —
       but the view stays where it was clicked and lands on the line that caused
       it (html.ts:dayTraceHTML). Patched onto the focus BEFORE notify() so one
       render covers it; the guard above already excludes the toggle-off and
       stale-index cases, which must not carry a pan of their own. */
    if (landed && it.dataset.wpk) view.setWarnFocus({ ...view.WFOCUS, panDi: +it.dataset.wpd!, panKey: it.dataset.wpk })
    notify()
    if (landed) setTimeout(scrollToWarnFocus, 0)
    e.stopPropagation(); return
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
    a.opts = a.opts || {}
    const stWas = storesText(a.opts)                  // before the toggle — see the popup's own branch
    a.opts[k!] = !a.opts[k!]; markEdit(`st:${di}.${gi}.${li}.${ai}`, stWas, storesText(a.opts))
    notify()
  }

  /* C opens the stores popup — a body-level box mirroring waveMenu */
  const stCfg = t.closest('[data-stcfg]') as HTMLElement | null
  if (stCfg && HOOKS.editMode()) { openStoresMenu(stCfg, stCfg.dataset.stcfg!); e.stopPropagation(); return }

  /* Clicking any blank part of a schedule surface un-clicks everything —
     the exclusion list is the reference's, verbatim */
  const pg = t.closest('#page-viewsched,#page-editsched,#schedBoard')
  if (pg && !t.closest('a,button,input,select,textarea,[contenteditable="true"],'
    + '.fchip,.puck,.seat,.rpuck,.ros-tab,.ros-arm,.sb-slot,[data-fill],[data-slot],'
    + '.dwbox,.pillbtn,.day-head,.sb-open,.dinfobtn,.airpop,.schedbanner,.alpanel,'
    + '.sb-top,.sb-sign,.signoff,.hscroll,.week-nav')) {
    let any = false
    if (view.ARM) { view.disarmSlot(); any = true }
    if (view.SELID || view.WFOCUS || view.PFOCUS || view.DWOPEN.size) {
      /* an expanded warning box (DWOPEN) or a selection's issue boxes (SELID)
         is about to close above the reader — hold the view before it does.
         Not on the board: its warning list scrolls in its own capped panel, so
         nothing above the viewport moves, and the week behind the overlay must
         not be scrolled from under it. */
      if (view.DWOPEN.size && !t.closest('#schedBoard')) queueHold(holdViewStill([...view.DWOPEN]))
      view.selDrop(); any = true
    }
    /* ...and the HIGHLIGHT chips and the search with them (owner, 10 Aug 26 —
       "every puck should be deselected"). These light pucks exactly as a
       selection does, but they used to survive a blank click, so a man could
       clear the board and still be looking at a lit week with no idea what was
       holding it. The search box is an UNCONTROLLED input, so its DOM value
       has to be wiped by hand — clearing only the state would leave a box
       reading "bane" with nothing lit, which is worse than not clearing at
       all. The chips redraw themselves from HLSET on the notify below. */
    if (view.HLSET.size || view.SEARCH) {
      view.clearOtherHL()
      document.querySelectorAll('#searchV,#searchE').forEach((el: any) => { el.value = '' })
      any = true
    }
    if (any) notify()
  }
}
