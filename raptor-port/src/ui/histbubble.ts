import { HOOKS } from '../engine/hooks'
import { elogFor, elogAllFor, elogWhen } from '../engine/editlog'
import type { ELogRow } from '../engine/editlog'
import { HISTMODE, esc } from '../state/view'

/* THE HISTORY BUBBLE (owner, 11 Aug 26) — with History on, one detail tells
   you what it was, who changed it and when.

   Two gestures, deliberately different, because the two devices are:
     DESKTOP  hover. A pointer can rest on a thing without committing to it,
              so the bubble costs nothing and the click still belongs to
              editing.
     PHONE    tap — AND THE EDIT STILL HAPPENS. A finger has only one
              gesture, so making the bubble take the tap would mean History
              turned the board read-only, which is the opposite of a view
              mode. The bubble is `pointer-events:none` and this listener
              never calls preventDefault or stopPropagation: the same tap
              arms the seat or focuses the field exactly as it would with
              History off, and the bubble simply appears alongside.

   ONE element, at body level, reused. Not one per cell: the board's DOM
   ceiling (probes/perf-port.cjs) counts every node under #sbBoard, and a
   bubble per cell would be a hundred-odd nodes to say something that can
   only ever be true of the one detail under the pointer. Body level also
   keeps it clear of the panels' string-diff repaints, which would otherwise
   throw the bubble away mid-hover. */

let bub: HTMLDivElement | null = null
let anchor: HTMLElement | null = null
let hideT: any = null
/* EXPANDED — every change to this detail, not just the newest (owner, 11 Aug
   26). PINNED — it stays until something puts it down, rather than following
   the pointer out or timing out. The two are separate because they arrive
   separately: a phone taps the bubble's own "more" control to expand, while a
   row clicked in the changes list arrives already expanded AND pinned. */
let expanded = false
let pinned = false
export function histBubExpanded() { return expanded }
export function histBubPinned() { return pinned }

/* the native tooltip of the cell we are currently covering, parked while the
   bubble is up. alAttr() puts a title="Edited — not published yet" on exactly
   the cells that carry history, and the browser would pop it a second later,
   over the top of ours, saying less. Parked rather than removed for good: it
   is the only thing that tells a keyboard or screen-reader user the same
   fact, and History is a mode you switch off. */
function parkTitle(el: HTMLElement) {
  if (el.title) { el.dataset.histT = el.title; el.title = '' }
}
function restoreTitle(el: HTMLElement) {
  if (el.dataset.histT != null) { el.title = el.dataset.histT; delete el.dataset.histT }
}

function box() {
  if (bub && bub.isConnected) return bub
  bub = document.createElement('div')
  bub.className = 'histbub'
  bub.setAttribute('role', 'status')
  document.body.appendChild(bub)
  return bub
}

export function hideHistBub() {
  clearTimeout(hideT)
  if (anchor) { restoreTitle(anchor); anchor = null }
  if (bub && bub.isConnected) bub.remove()
  bub = null
  expanded = false; pinned = false
}

/* Every addressable cell on the board, and the slot key each one stands for.
   Most carry their key outright (data-bfld for a typed field, data-slot for a
   seat); five older ones predate that grammar and carry only the address, so
   the prefix is put back here. Nothing new is added to the builders for this
   — a data-histkey on every cell would be several hundred extra attributes on
   a surface with a measured DOM ceiling, to repeat an address already there. */
const CELL_SEL = '[data-bfld],[data-slot],[data-store],[data-bombs],[data-area],[data-atime],[data-intimes],[data-txt]'
function cellOf(t: EventTarget | null) {
  const el = (t as HTMLElement | null)
  if (!el || !el.closest) return null
  return el.closest(CELL_SEL) as HTMLElement | null
}
/* THE REVERSE OF keyOf — which cell on screen stands for this key. Used by the
   changes list to jump to the detail a row names (interactions.ts's
   jumpToChange). A linear scan of the addressable cells rather than a
   `[data-…="…"]` selector per family, deliberately: it runs keyOf itself, so
   the two directions cannot drift apart, and the five older attributes whose
   prefixes are put back by hand have exactly one implementation. ~250 cells on
   the widest board, once per click on a list row. */
export function findHistCell(root: ParentNode, key: string): HTMLElement | null {
  const k = String(key)
  const cells = [...root.querySelectorAll(CELL_SEL)] as HTMLElement[]
  return cells.find(e => keyOf(e) === k) || null
}
function keyOf(el: HTMLElement) {
  const d = el.dataset
  if (d.bfld) return d.bfld
  if (d.slot) return d.slot
  if (d.txt) return d.txt
  /* a store chip's address ends in the store's own key (`…ai.tpod`); the
     amendment mark, and so the log, is on the AIRCRAFT (`st:di.gi.li.ai`) —
     every store on one jet is one edit, which is how the chips render */
  if (d.store) return 'st:' + d.store.split('.').slice(0, 4).join('.')
  if (d.bombs) return 'st:' + d.bombs
  if (d.area) return 'ar:' + d.area
  if (d.atime) return 'at:' + d.atime
  if (d.intimes) return 'it:' + d.intimes.replace('|', '.')
  return ''
}

/* "from → to" with the arrow only when there is a before worth naming; a
   detail typed into an empty box reads "set to X", not "— → X" */
function chgHTML(r: ELogRow) {
  return r.from === '—'
    ? `set to <b>${esc(r.to)}</b>`
    : `<b>${esc(r.from)}</b> <i class="hbar">→</i> <b>${esc(r.to)}</b>`
}

function show(el: HTMLElement) {
  const key = keyOf(el)
  if (!key) return hideHistBub()
  const row = elogFor(key)
  if (!row) return hideHistBub()          // never edited here — nothing to say
  if (anchor && anchor !== el) restoreTitle(anchor)
  anchor = el
  parkTitle(el)
  paint(key, row)
}

/* The body, either state. Split out of show() because three callers repaint
   the SAME anchor without re-deciding it: expanding, collapsing, and the
   re-anchor on scroll. */
function paint(key: string, row: ELogRow) {
  const b = box()
  const all = elogAllFor(key)
  b.className = 'histbub' + (expanded ? ' open' : '')
  if (expanded) {
    /* oldest first — this is the story of how the detail got here, so the
       last line is what it says now (elogAllFor's own comment) */
    b.innerHTML = `<div class="hb-what">${esc(row.lbl)}</div>`
      + `<ol class="hb-all">` + all.map(r =>
        `<li><span class="hb-chg">${chgHTML(r)}</span>`
        + `<span class="hb-who">${esc(r.who)} · ${esc(elogWhen(r.t))}</span></li>`).join('') + `</ol>`
  } else {
    b.innerHTML = `<div class="hb-what">${esc(row.lbl)}</div>`
      + `<div class="hb-chg">${chgHTML(row)}</div>`
      + `<div class="hb-who">${esc(row.who)} · ${esc(elogWhen(row.t))}</div>`
    /* THE ONE TAPPABLE THING ON A PHONE (owner, 11 Aug 26 — "I change the
       option to click on the bubble to expand the history"). It is a child
       with pointer-events:auto inside a bubble that keeps pointer-events:none,
       and that is the whole design: the bubble must never take the tap that
       raised it, or History turns the board read-only (the contract in
       docs/ui-contracts.md, pinned by the geometry gate). A 24px control the
       finger has to aim at is a different thing from a 290px sheet lying over
       the board. Only where there IS more history to show, and only on a
       phone — a desktop pointer can rest on the cell, so the chevron would be
       a control asking to be clicked for something hovering already gives. */
    if (all.length > 1 && HOOKS.isPhone())
      b.innerHTML += `<button class="hb-more" data-histmore aria-label="Show every change to this detail">`
        + `⌄ ${all.length} changes</button>`
  }
  if (anchor) place(b, anchor)
}

/* expand/collapse in place, keeping the anchor. Pins on the way open: a phone
   has no pointer to leave, and a list that timed out mid-read would be worse
   than not offering it. */
export function toggleHistBubExpand() {
  if (!anchor || !bub) return false
  const key = keyOf(anchor); if (!key) return false
  const row = elogFor(key); if (!row) return false
  expanded = !expanded
  if (expanded) { pinned = true; clearTimeout(hideT) }
  paint(key, row)
  return true
}

/* Raised from the changes list rather than from a gesture on the cell — it
   arrives expanded and pinned, and it is the caller that has already put the
   right day on screen and scrolled the cell into view. Returns false when the
   cell is not on this board (a key whose row has since been deleted), so the
   caller can say so instead of silently doing nothing. */
export function pinHistBubAt(el: HTMLElement) {
  const key = keyOf(el); if (!key) return false
  const row = elogFor(key); if (!row) return false
  clearTimeout(hideT)
  if (anchor && anchor !== el) restoreTitle(anchor)
  anchor = el
  parkTitle(el)
  expanded = true; pinned = true
  paint(key, row)
  return true
}

/* Anchored above the cell where there is room, below where there is not —
   on a phone a tap also opens the keyboard, and a bubble drawn below a field
   near the bottom of the screen would be behind it. Clamped to the viewport
   on both axes so a cell at the far right of a wide board still reads. */
function place(b: HTMLDivElement, el: HTMLElement) {
  b.style.left = '0px'; b.style.top = '0px'      // measure unclamped first
  const r = el.getBoundingClientRect(), w = b.offsetWidth, h = b.offsetHeight
  const above = r.top - h - 8
  b.style.left = Math.max(6, Math.min(window.innerWidth - w - 6, Math.round(r.left))) + 'px'
  b.style.top = Math.round(above >= 6 ? above : Math.min(window.innerHeight - h - 6, r.bottom + 8)) + 'px'
}

/* Wired on the board WRAP, not on #sbBoard: the personal-inputs panel is its
   sibling, and both are re-hung by their own string diffs — a listener on
   either child would be thrown away with it. Same reason rowdrag.ts
   delegates here. */
export function wireHistBubble(el: HTMLElement) {
  /* PINNED beats every one of these. A bubble raised from the changes list, or
     expanded by hand, is there because someone asked for it and stays until
     something puts it down — routeClick's click-away, History off, or the
     board closing. Without this the desktop mouseout would bin it the moment
     the pointer left the cell it had just jumped to. */
  const over = (e: any) => {
    if (!HISTMODE || HOOKS.isPhone() || pinned) return
    const c = cellOf(e.target)
    if (!c) return hideHistBub()
    if (c !== anchor) show(c)
  }
  const out = (e: any) => {
    if (!HISTMODE || HOOKS.isPhone() || pinned) return
    /* moving between two children of the SAME cell is not leaving it — the
       naive version flickered once per character crossing an input's text */
    const to = cellOf(e.relatedTarget)
    if (to && to === anchor) return
    hideHistBub()
  }
  const tap = (e: any) => {
    if (!HISTMODE || !HOOKS.isPhone()) return
    const c = cellOf(e.target)
    if (!c) return hideHistBub()
    show(c)
    /* a phone bubble has no pointer to leave, so it times itself out. Long
       enough to read three short lines, short enough that it is gone before
       it is in the way of the next thing. Unless it has been pinned — see
       above — in which case the timer is the wrong tool entirely. */
    clearTimeout(hideT)
    if (!pinned) hideT = setTimeout(hideHistBub, 4000)
  }
  /* CAPTURE, not bubble — and this is the whole reason the phone path works.
     boardArmClick calls stopPropagation() the moment it arms a slot
     (board.ts), so a bubbling listener up here never sees the one tap the
     owner most wants explained: the tap on a seat. A capture listener runs on
     the way DOWN, before the board's own handlers, and nothing they do to the
     event can cancel it. It still touches neither preventDefault nor
     stopPropagation itself, so the arm goes through exactly as before —
     capture buys the bubble a hearing, it does not take the tap.
     Found by the test that pins it; the bubbling version passed every other
     case in this feature and failed only that one. */
  /* ON THE DOCUMENT, not the wrap — the bubble is a body-level element and is
     not inside `el`, so the wrap's own listeners can never see a tap on it.
     Capture, so it runs BEFORE the wrap's `tap` below: putting a pinned bubble
     down and raising the next one are then one gesture in the right order. */
  const docClick = (e: any) => {
    if (!bub || !bub.isConnected) return
    const t = e.target as HTMLElement | null
    if (!t || !t.closest) return
    if (t.closest('[data-histmore]')) {
      /* the tap belongs to the control, and only to it — the board underneath
         must not also act on it, which is the one place this feature takes an
         event at all */
      e.stopPropagation()
      toggleHistBubExpand()
      return
    }
    /* a pinned bubble is put down by the next click anywhere that is not it */
    if (pinned && !t.closest('.histbub')) hideHistBub()
  }
  document.addEventListener('click', docClick, true)
  el.addEventListener('mouseover', over, true)
  el.addEventListener('mouseout', out, true)
  el.addEventListener('click', tap, true)
  /* The board scrolls under a fixed bubble, so it has to be re-anchored — it
     is NOT thrown away. Hiding on scroll was the first version and it broke
     the desktop hover outright: bringing a cell into view scrolls the panel,
     and that scroll event lands AFTER the mouseover it caused, so the bubble
     was raised and then immediately binned. It looked like the hover simply
     did not work. Re-placing also happens to be the right behaviour — a
     bubble belongs over its own cell wherever that cell has got to — and
     where the pointer has genuinely left the cell, the mouseout that follows
     is what clears it. */
  const bail = () => {
    if (bub && bub.isConnected && anchor && anchor.isConnected) place(bub, anchor)
    else hideHistBub()
  }
  /* ON THE DOCUMENT, capture — scroll events do not bubble, but they DO run
     capture listeners from the window down, so this one sees EVERY scroller.
     It was on the wrap, which meant it only ever saw the board panels' own
     scrolls: `.sb-main` is the wrap's PARENT, so the phone's single scroller —
     the one that actually moves under a bubble on a phone — never reached it,
     and a jump from the changes list would have left the bubble behind. The
     per-event cost is a boolean on a variable that is null almost always, not
     the DOM walk HANDOFF flags on `onDotsScroll`. */
  document.addEventListener('scroll', bail, true)
  window.addEventListener('resize', bail)
  return () => {
    document.removeEventListener('click', docClick, true)
    el.removeEventListener('mouseover', over, true)
    el.removeEventListener('mouseout', out, true)
    el.removeEventListener('click', tap, true)
    document.removeEventListener('scroll', bail, true)
    window.removeEventListener('resize', bail)
    hideHistBub()
  }
}
