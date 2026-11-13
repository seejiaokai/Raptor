/* A QUESTION SHEET TAKES THE KEYBOARD WHEN IT OPENS — AND KEEPS IT (W12, the Codex stack check, 5–6 Oct 26).
   The confirmation sheets — the OIL question, the upchit one, "covers other days", "no medical document", and on the
   Scheduler Board the cancel-reason and Sort all dialogs — are drawn over whatever surface asked for them, and none
   took focus: the caret stayed where it was, behind the sheet. From the schedule's own text boxes that meant typed
   characters and Tab went on editing the schedule unseen (a weekend duty request's start time changed + Tab → the OIL
   question, the caret in the end-time box behind it).
   On opening, focus moves to the sheet's box (never a button: nothing is one key-press from being answered by
   accident), without scrolling; on closing it goes back to where it was, if that is still on the page and nothing
   else has taken it. The box carries tabIndex -1 and no outline of its own — it is a place for the keys to land, not
   a control.
   AND IT KEEPS THEM (RF2, 6 Oct 26 — Astra's and Sol's reads of the first fix): taking focus once was not enough —
   Shift+Tab from the sheet's first button walked back into the editor underneath, where typing changed the request
   behind an unanswered question. While a sheet is up, Tab and Shift+Tab go round inside it: past its last control
   to its first, before its first to its last, and a Tab pressed anywhere else on the page comes back into it. Only
   the topmost sheet answers (they open one over another); the listener is on the document, in the capture phase, so
   it runs before the schedule's own Tab route and before any page's handler — and is taken off with the last sheet.
   THE ✕ IS THE LAST STOP, NOT THE FIRST (the design look's L2 and K7, owner D830 — 13 Oct 26). The ✕ is written first in
   a sheet's head, so the first Tab landed on "Close" — the one control nobody opened the sheet to press — before any
   answer. It is drawn in the head's corner now (08-windows-tools.css) and the keys agree with the eye: Tab goes through
   the sheet's own controls first and reaches the ✕ last; Shift+Tab from the first control goes to it. Only the two
   steps around the ✕ are taken over — every other Tab is the browser's own, as before.
   ONE SHEET MAY NAME WHERE THE KEYS LAND (`first`): the OIL question puts them on its first answer (K7) — picking an
   answer answers nothing until the sheet's right-hand button is pressed, so nothing is one key-press from being done by
   accident. Every other sheet still lands on its box. */
import { useEffect, type RefObject } from 'react'
import { TIME_TXT } from '../engine/slots'

const sheets: HTMLElement[] = []
const STOPS = 'button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
function keepKeys(e: KeyboardEvent): void {
  if (e.key !== 'Tab' || e.ctrlKey || e.altKey || e.metaKey) return
  const el = sheets[sheets.length - 1]
  if (!el || !el.isConnected) return
  const stops = [...el.querySelectorAll<HTMLElement>(STOPS)].filter(n => !(n as HTMLButtonElement).disabled && !n.closest('[hidden]'))
  const at = document.activeElement as HTMLElement | null
  /* the order the keys go round in: the sheet's own, with the head's ✕ moved to the end */
  const x = stops.find(n => n.classList.contains('x') && !!n.closest('.airpop-head, .modal-head'))
  const order = x ? [...stops.filter(n => n !== x), x] : stops
  const first = order[0], last = order[order.length - 1]
  if (!first || !last) { e.preventDefault(); el.focus({ preventScroll: true }); return }
  const go = (n: HTMLElement) => { e.preventDefault(); n.focus({ preventScroll: true }) }
  if (!at || at === el || !el.contains(at)) { go(e.shiftKey ? last : first); return }
  if (e.shiftKey && at === first) { go(last); return }
  if (!e.shiftKey && at === last) { go(first); return }
  if (!x) return
  /* the browser's own next stop would be the ✕ where it stands in the page — step over it, or onto it, by `order` */
  const i = order.indexOf(at), j = stops.indexOf(at)
  if (i < 0 || j < 0) return
  const natural = stops[j + (e.shiftKey ? -1 : 1)], wanted = order[i + (e.shiftKey ? -1 : 1)]
  if (wanted && natural !== wanted) go(wanted)
}

/** `open` — for a sheet that stays mounted and is shown and hidden (the board's two dialogs); a sheet that is mounted
    only while it is up leaves it at its default. */
export function useSheetFocus(box: RefObject<HTMLElement | null>, open = true, first?: (box: HTMLElement) => HTMLElement | null): void {
  useEffect(() => {
    const el = box.current
    if (!open || !el) return
    const before = document.activeElement as HTMLElement | null
    /* where the keys were, found again by its marks once a string redraw has replaced it ([WINDOWS-KEEP-KEYS]'s leftover,
       5 Nov 26): the answer to a question redraws the schedule behind it — the box or button the keys were on is a new
       one by the time the sheet closes, and they were given back to nothing */
    const was = before && before !== document.body && !el.contains(before) ? locate(before) : null
    const back = opener; opener = null
    if (!el.contains(before)) ((first && first(el)) || el).focus({ preventScroll: true })
    if (!sheets.length) document.addEventListener('keydown', keepKeys, true)
    sheets.push(el)
    return () => {
      const i = sheets.lastIndexOf(el)
      if (i >= 0) sheets.splice(i, 1)
      if (!sheets.length) document.removeEventListener('keydown', keepKeys, true)
      const now = document.activeElement
      /* where it came from — or, when that was a menu item the menu took away with it, the button that opened the menu */
      const to = (was && was()) || (back ? back() : null)
      if (!to) return
      if (now === document.body || now == null || el.contains(now)) to.focus({ preventScroll: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- on opening and closing only: `box` is the caller's ref, and re-arming on a new `first` would move the keyboard on a repaint
  }, [open])   // on opening and closing only — a repaint of the sheet never moves the keys
}

/* A WINDOW OPENED FROM A MENU GIVES THE KEYBOARD BACK TO THE MENU'S BUTTON ([BOARD-MODALS-ESCAPE], 24 Oct 26). The
   Duty templates, Day templates and Plans windows open from an item of a small menu ("+ Block", Templates, the plans
   selector) that is taken away as the window opens, so the window's "where it came from" is gone by the time it closes.
   The menu notes its own button just before it opens the window; the next sheet to take the keyboard takes the note
   (once), and gives the keyboard back to that button when it closes. The week and the board are redrawn from strings, so
   the button may be a new one by then: it is found again by its id, or else by its first data attribute — the one shown
   on screen where there are two. */
let opener: (() => HTMLElement | null) | null = null
export function noteOpener(el: HTMLElement | null): void {
  opener = el ? locate(el) : null
}
/* how to find a control again once a string redraw may have replaced it — the same node while it is still on the page,
   else by its id, else by its first data attribute (the one shown on screen where there are two); shared with the
   Scheduler Board's own way back (ui/boardescape.ts)
   NO LIST OF "ITEM MARKS" ([LOCATE-ITEM-MARKS], closed 14 Nov 26 with this reason). It is asked to find again: the control
   the keys were on when a sheet or window opened (useSheetFocus, useEscWindow, barfree.ts, the board's way out in
   SchedBoard.tsx) — in practice the control pressed to open it; and the button a small menu hangs from (menuEscape,
   menuKeys, board.ts popMenu, noteOpener: + Block, Templates, the plans selector, + Wave, a jet's stores, the duty role).
   React keeps its own nodes, so only the string-drawn week, board and crew panel ever reach the search. Of every
   control those draw (html.ts, board.ts, board-html.ts, palette-html.ts, oilmode.ts, pendlist.ts, mission-role-offer.ts…),
   the first mark names its day, its slot or its item — a day index, a slot key, an input's or a template's id — or the
   control is one of its kind where it stands (a menu's own items, the crew panel's day arrows, Manage, Show all), or it
   opens nothing and so is never looked for (the blue / red question's buttons). The one exception, the input's
   "→ Ground" / "→ Unavail" / "Reject", carries its input's mark (`data-acck`, html.ts accCtl draws every shape of it, and
   its own press reads it) and is matched on it below; oilkeysback.test.tsx proves it on the week's real buttons.
   A NEW CONTROL drawn into a day whose first mark names only a kind shared by several items carries the item's own mark
   too, and is added here beside `data-acck` — or, better, its first mark names the item. */
export function locate(el: HTMLElement): () => HTMLElement | null {
  const q = (v: string) => v.replace(/["\\]/g, '\\$&')
  const da = [...el.attributes].find(x => x.name.startsWith('data-'))
  /* …and, where its first mark names only a KIND (an input's "→ Ground" / "→ Unavail" / "Reject" — `data-acc` is g, u or x),
     by the mark that names WHICH ITEM it is too (`data-acck`, the input's key): another input's button of the same kind is
     never its twin (the round-2 read's H1, 5 Nov 26 — the keys landed on another input's "→ Ground", one Enter from putting
     it on the programme unseen). A control whose own kind changed (→ Ground become Reject) then has no twin: nowhere is
     better than the wrong one. */
  const own = el.getAttribute('data-acck')
  const sel = el.id ? `[id="${q(el.id)}"]` : da ? `${el.tagName.toLowerCase()}[${da.name}="${q(da.value)}"]${own != null && da.name !== 'data-acck' ? `[data-acck="${q(own)}"]` : ''}` : ''
  /* a control on the Scheduler Board is looked for again on the board: the week behind it draws the same buttons with the
     same marks (a wave's Traffic, a day's ⓘ), and the keys must not land on the week's copy, hidden under the board */
  const within: ParentNode = el.closest('#schedBoard') || document
  /* …and a control of a week's day on THAT day (the fresh read's F4, 5 Nov 26): an input covering Monday to Friday draws the
     same name button on each day, and the first one on the page was found — Monday's, perhaps scrolled out of sight — for a
     press made on Thursday's. The day is looked up afresh: the redraw may have replaced the day itself. */
  const dayEl = el.closest('.day[data-day]')
  const day = dayEl?.getAttribute('data-day') ?? null
  const weekId = (dayEl?.parentElement as HTMLElement | null)?.id || ''
  return () => {
    if (el.isConnected) return el
    if (!sel) return null
    const weekBox: ParentNode | null = weekId ? document.getElementById(weekId) : within
    const dayBox = day != null && weekBox ? weekBox.querySelector<HTMLElement>(`.day[data-day="${q(day)}"]`) : null
    /* …and where the day no longer draws it (the input moved to another day by its own window — the narrow read's G2), on the
       day it now stands on, in the same week; neither, nothing */
    const pick = (root: ParentNode | null) => {
      const all = root ? [...root.querySelectorAll<HTMLElement>(sel)] : []
      return all.find(n => n.getClientRects().length > 0) || all[0] || null
    }
    if (day != null) return pick(dayBox) || pick(weekBox)
    const all = [...within.querySelectorAll<HTMLElement>(sel)]
    return all.find(n => n.getClientRects().length > 0) || all[0] || null
  }
}

/* ESCAPE CLOSES WHAT DOES NOT HOLD THE KEYS ([VEILED-WINDOWS-BAR]'s Escape part, 3 Nov 26 — the design guide §2: Escape
   closes what opened last, and the keys go back to the button that opened it). The board's small menus (+ Block,
   Templates, the plans selector, a jet's stores, + Wave — board.ts popMenu, interactions.ts openStoresMenu), the Traffic
   window and the day-details window take no keyboard, so no sheet's own Escape reaches them, and with one up Escape did
   nothing at all (the Scheduler Board under it rightly waits for what is over it — boardescape.ts overBoard).
   Each joins this one list as it opens and leaves it as it closes; the newest answers. One listener on the document, in
   the capture phase — before the board's own Escape comes back up the tree, and before the page's own keys — taking the
   press so nothing under it closes too. A question sheet or a window that holds the keys (topSheet) stands over these and
   answers its own Escape first. A held key's repeats are not a press, as on the board.
   IN A BOX BEHIND IT, ESCAPE IS THE BOX'S (the fresh read of 3 Nov 26, finding 1): with the keys in a schedule box on the
   page behind — a callsign, a time, a remark, Tabbed to while a window or menu stays up — Escape puts the box's old words
   back (textedit.ts routeKeyDown, D1011) and the window waits for the next one, as the movable windows (FloatWindow.tsx)
   and the board (boardescape.ts) already leave it. Taking it there closed the window and left the words typed, saved on
   the box's blur. Not the box the entry hangs from (`from`): the duty role's pick-list hangs from the role box itself,
   so there the first Escape closes the list and the second puts the role back.
   ONLY THE SCHEDULE'S OWN BOXES (the narrow read of that fix, R1): exactly the boxes whose Escape textedit.ts
   routeKeyDown answers — the week's text cells, an input's cells on the week and the board, the board's wrapping boxes, its
   time boxes, the in-time lines, the stores, area and area-time cells. Any other box (a search box, a select, a checkbox,
   a Traffic line under a menu) does nothing with Escape, and stepping aside there left every Escape dead until the keys
   moved. */
type EscEntry = { box: () => HTMLElement | null; close: () => void; from: HTMLElement | null }
const OWN_ESC = '[data-txt],[data-inp],[data-ifld],textarea[data-bfld],[data-itline],[data-bombs],[data-area],[data-atime]'
function ownEscape(at: HTMLElement): boolean {
  if (at.closest(OWN_ESC)) return true
  /* the board's <input> boxes put the old value back on Escape only where they hold a time (D1011) */
  const b = at.closest<HTMLElement>('input[data-bfld]')
  return !!b && TIME_TXT.test(b.dataset.bfld || '')
}
const escs: EscEntry[] = []
function escTop(e: KeyboardEvent): void {
  if (e.key !== 'Escape' || e.defaultPrevented || e.repeat || e.isComposing) return
  /* a menu taken away by any other way (a click outside, a pick, another menu) leaves the list here */
  for (let i = escs.length - 1; i >= 0; i--) { const b = escs[i]!.box(); if (!b || !b.isConnected) escs.splice(i, 1) }
  const top = escs[escs.length - 1]
  if (!top) { document.removeEventListener('keydown', escTop, true); return }
  if (topSheet()) return
  const at = document.activeElement as HTMLElement | null
  if (at && at !== document.body && typeof at.closest === 'function' && ownEscape(at)) {
    const b = top.box()
    if (!(b && b.contains(at)) && !(top.from && top.from.contains(at))) return
  }
  e.stopPropagation(); e.preventDefault()
  top.close()
}
/** Escape closes this until the returned function is called (or `box` is off the page). `close` does the closing and
    gives the keys back. */
export function escCloses(box: () => HTMLElement | null, close: () => void, from: HTMLElement | null = null): () => void {
  const entry: EscEntry = { box, close, from }
  if (!escs.length) document.addEventListener('keydown', escTop, true)
  escs.push(entry)
  return () => {
    const i = escs.indexOf(entry)
    if (i >= 0) escs.splice(i, 1)
    if (!escs.length) document.removeEventListener('keydown', escTop, true)
  }
}
/** The keys back on `to`, if they are nowhere or inside what just closed — never taken from where they went meanwhile. */
export function keysBack(to: (() => HTMLElement | null) | null, from?: HTMLElement | null): void {
  const now = document.activeElement
  if (now && now !== document.body && !(from && from.contains(now)) && now.isConnected) return
  const el = to ? to() : null
  if (el && el.isConnected) el.focus({ preventScroll: true })
}

/* A window that does not hold the keys (the Traffic window, the day-details window — ui/Modals.tsx): Escape closes it, and
   only it, while it is up; what is being typed in one of its boxes is saved the ordinary way first, by that box's blur, as
   a press on its ✕ saves it; and when it closes, by any way out, the keys go back to where they were when it opened — its
   Traffic button or ⓘ — if they are nowhere or were inside it. `box` is the window's own element while it is up. */
export function useEscWindow(box: RefObject<HTMLElement | null>, open: boolean, close: () => void): void {
  useEffect(() => {
    if (!open) return
    const el = box.current
    const was = document.activeElement as HTMLElement | null
    const back = was && was !== document.body && was.isConnected && !(el && el.contains(was)) ? locate(was) : null
    const off = escCloses(() => el, () => {
      const a = document.activeElement as HTMLElement | null
      if (a && el && el.contains(a)) a.blur()
      close()
    }, was && was !== document.body ? was : null)
    return () => { off(); keysBack(back, el) }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- on opening and closing only: re-joining the list on a repaint would make this window the newest over a menu opened after it; `close` and `box` are the window's own, fixed for its life
  }, [open])
}

/* A small menu hung from a button (board.ts popMenu, interactions.ts openStoresMenu): Escape takes it away, unhooking its
   outside-click listener as every other way of removing it does, and the keys go back to its button */
export function menuEscape(box: HTMLElement, anchor: HTMLElement): void {
  const back = locate(anchor)
  const off = escCloses(() => box, () => {
    off()
    const out = (box as any)._offClick
    if (out) document.removeEventListener('click', out)
    box.remove()
    keysBack(back)
  }, anchor)
}

/* A SMALL MENU OPENED BY THE KEYS PUTS THEM ON ITS FIRST ITEM, AND THE ARROWS MOVE THROUGH IT (owner D1646, 5 Nov 26 —
   "Go" on the mock-up page's question 2, docs/mock/2026-11-05-keys-windows/img/2b-desktop-blockmenu-drawn.png;
   [BOARD-KEYS-LEFT]). The board's small menus — + Block, Templates, the plans selector, a jet's stores, + Wave, the duty
   role list (board.ts popMenu, interactions.ts openStoresMenu) — were added at the page's end with the keys left on their
   button: Enter opened one and nothing in it could be reached. Opened by Enter, Space or ↓ on its button (↓ in the duty
   role's box), the keys go onto its first item — the first of its picks (`.wm`), not the pencil in its corner; ↑ and ↓ move
   through every button in it, round from the last to the first; Enter (or Space) is the button's own press, its pick;
   Escape was already its own (menuEscape). The ring is the app's keyboard ring, for the keys only (:focus-visible,
   10-board-history.css) — a menu opened by a press of the mouse or a finger opens exactly as before, the keys where they
   were and no ring.
   HOW "BY THE KEYS" IS KNOWN: the last key pressed (Enter, Space or ↓) was pressed on the menu's button — the keydown that
   becomes the button's click — and no pointer was pressed since. Read and forgotten as a menu opens. */
let keyOn: EventTarget | null = null
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', e => { keyOn = e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' ? e.target : null }, true)
  document.addEventListener('pointerdown', () => { keyOn = null }, true)
  document.addEventListener('mousedown', () => { keyOn = null }, true)
}
/** a menu's pickable items, in order: its buttons, less a disabled or hidden one — the board's string-drawn menus and
 *  its ⋯ menu alike (SchedBoard.tsx moreItems, [BOARD-KEYS-LOOKS]'s tidy-up) */
export const menuItems = (box: HTMLElement) =>
  [...box.querySelectorAll<HTMLElement>('button')].filter(b => !(b as HTMLButtonElement).disabled && !b.closest('[hidden]'))
/** `box` hangs from `anchor`: the arrows move through its buttons, and opened by the keys the keys land on its first pick */
export function menuKeys(box: HTMLElement, anchor: HTMLElement): void {
  const back = locate(anchor)
  /* the button it hangs from, so ↓ on ANOTHER menu button never goes into this one (the two reads of 8 Nov 26 — Opus
     finding 2, Astra finding 2; interactions.ts routeMenuKey) */
  ;(box as any)._anchor = anchor
  box.addEventListener('keydown', e => {
    /* A HELD ENTER OPENS THE MENU AND PICKS NOTHING (the Opus read's question 2, 8 Nov 26): Enter presses a button as it goes
       down, so the first Enter opens the menu and puts the keys on its first pick — and the same key, still held, repeats
       on that pick and pressed it (+ Block added a desk nobody chose). A repeat is never a press here; a fresh Enter is. */
    if (e.key === 'Enter' && e.repeat) { e.preventDefault(); return }
    /* TAB OUT OF ITS END LEAVES THE MENU AS ESCAPE DOES (the fresh read's F3, 5 Nov 26): the menu stands at the page's end, so a
       Tab past its last item walked out of the page and then onto the top bar hidden under the Scheduler Board. Inside it Tab
       goes on as the browser's own (the stores menu's pencil turns it into a little form of names and buttons); past its last
       stop, or Shift+Tab before its first, it closes the menu, unhooking its outside-click listener as every other way out
       does, and the keys go back to its button — the next Tab is the board's. */
    if (e.key === 'Tab' && !e.altKey && !e.ctrlKey && !e.metaKey) {
      const at = document.activeElement as HTMLElement | null
      if (!at || !box.contains(at)) return
      const stops = [...box.querySelectorAll<HTMLElement>(STOPS)].filter(n => !(n as HTMLButtonElement).disabled && !n.closest('[hidden]'))
      if (stops.length && at !== (e.shiftKey ? stops[0] : stops[stops.length - 1])) return
      e.preventDefault()
      const out = (box as any)._offClick
      if (out) document.removeEventListener('click', out)
      box.remove()
      keysBack(back)
      return
    }
    if ((e.key !== 'ArrowDown' && e.key !== 'ArrowUp') || e.altKey || e.ctrlKey || e.metaKey || e.isComposing) return
    const at = document.activeElement as HTMLElement | null
    if (!at || at.tagName !== 'BUTTON' || !box.contains(at)) return
    const list = menuItems(box), i = list.indexOf(at)
    if (i < 0) return
    e.preventDefault()
    list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]!.focus({ preventScroll: true })
  })
  if (pressedByKeys(anchor)) menuFirst(box)?.focus({ preventScroll: true })
}
/** whether the press now landing on `el` came from the keys — Enter, Space or ↓ pressed on it, and no pointer since; read
 *  and forgotten. A menu drawn by React (the board's ⋯, SchedBoard.tsx) asks it as it opens, and as one of its items is
 *  picked, as menuKeys asks it for the string-drawn menus. */
export function pressedByKeys(el: HTMLElement): boolean {
  const by = !!keyOn && (keyOn === el || (keyOn instanceof Node && el.contains(keyOn)))
  keyOn = null
  return by
}
/** the item a menu opened by the keys puts them on: its first pick, else its first button */
export function menuFirst(box: HTMLElement): HTMLElement | null {
  const list = menuItems(box)
  return list.find(b => b.classList.contains('wm')) || list[0] || null
}

/* the topmost sheet holding the keyboard, if any — a window with its own Escape asks it before closing under one */
export function topSheet(): HTMLElement | null {
  const el = sheets[sheets.length - 1]
  return el && el.isConnected ? el : null
}

/* ESCAPE CLOSES THE WINDOW (the design guide §2 — Escape closes what opened last; [BOARD-MODALS-ESCAPE]). Heard on the
   document before the page's own keys (the Scheduler Board closes on Escape too, and must not go with it), and only while
   this window is the topmost sheet: a question sheet raised over it answers its own Escape first. */
export function useEscClose(box: RefObject<HTMLElement | null>, open: boolean, close: () => void): void {
  useEffect(() => {
    if (!open) return
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      const el = box.current
      if (!el || sheets[sheets.length - 1] !== el) return
      e.stopPropagation(); e.preventDefault()
      close()
    }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  })
}
