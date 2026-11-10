/* THE BOARD'S UNDO AND REDO BRING THE CHANGE ON SCREEN WHEN IT IS OUT OF VIEW ([BOARD-UNDO-SAME-DAY] — chat 61's
   reproduction, 10 Nov 26: a remark changed near the board's top, the board scrolled to its foot, Undo pressed — the
   remark went back 1989px above the screen and nothing on screen moved or said so).

   His rule (D672, 8 Oct 26): Undo and Redo, everywhere, leave the screen where it is when what they change is in view,
   and move to the change only when it is out of view. The week does it by day (highlights.ts bringDayIntoView), the
   Inputs list and Quals by row (onscreen.ts); the board only ever changed DAY (state/undo-wire.ts snapView).

   TWO HALVES, because the landing is asked BEFORE the step's writes are put back and the screen is right only after:
     · boardLandKeys — pure: which boxes the step changes on this day, as the addresses the board draws. Read from the
       step's own two images of the day by the one comparison the "To go out" list uses (engine/canonical.ts
       canonicalUnits), so a change is found here exactly where a tap on its line would land. The addresses are
       positions on the day AS IT WILL STAND once the step is applied — the image this direction restores.
     · bringBoardChangeOnScreen — once the board has repainted: the first of those boxes the board draws, brought just
       under the board's own bar (or up from under the screen's foot) by the least movement, and not moved at all when
       it is wholly in view. A step that leaves nothing to point at (a row it removes) moves nothing. */
import { canonicalUnits } from '../engine/canonical'
import type { UndoEntry } from '../undo/types'
import { dayKeyOf } from '../undo/derive'
import { findHistCell, findInputCell } from './histbubble'
import { scrollToShow } from './onscreen'

/** the boxes an Undo (or Redo) of `entry` changes on day `di`, in the order to try them — [] when it changes none there */
export function boardLandKeys(entry: UndoEntry, dir: 'undo' | 'redo', di: number): string[] {
  const keys: string[] = []
  for (const ch of entry.forward) {
    if (ch.collection === 'days') {
      const dk = dayKeyOf(ch.collection, ch.id)
      if (!dk || !dk.includes('#') || Number(dk.split('#')[1]) !== di) continue
      /* undo: the day goes from its `after` back to its `before`; redo: the other way */
      const from: any = dir === 'undo' ? ch.after : ch.before, to: any = dir === 'undo' ? ch.before : ch.after
      if (!from || !to || typeof from !== 'object' || typeof to !== 'object') continue
      try { for (const u of canonicalUnits(from, to, di)) for (const k of u.jump || []) if (k) keys.push(String(k)) } catch { /* an image the comparison cannot read: nothing to point at */ }
    } else if (ch.collection === 'inputs') {
      /* an input's row on the day (Personal Inputs, Unavailable) — found by its input, whoever it is addressed by */
      keys.push(`iu:${ch.id}`)
    }
  }
  return [...new Set(keys)]
}

/* what scrolls the board's list up and down: the first ancestor that does (the board's list on a desktop and an upright
   phone; the whole board on a phone on its side, D1780) — null when the page itself does */
function scrollerOf(el: HTMLElement): HTMLElement | null {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    if (p.scrollHeight > p.clientHeight + 1 && /^(auto|scroll|overlay)$/.test(getComputedStyle(p).overflowY)) return p
  }
  return null
}

/** bring the first of `keys` the board draws wholly on screen — under the board's bar, above the screen's foot — by the
 *  least movement; nothing moves when it already is, when the board draws none of them, or where nothing is laid out */
export function bringBoardChangeOnScreen(keys: string[]): void {
  if (!keys.length || typeof document === 'undefined') return
  const root = document.querySelector('.sb-boardwrap')
  if (!root) return
  let el: HTMLElement | null = null
  for (const k of keys) { el = findHistCell(root, k) || (k.startsWith('iu:') ? findInputCell(root, k) : null); if (el) break }
  if (!el) return
  const box = el.getBoundingClientRect()
  if (!(box.height > 0)) return
  const sc = scrollerOf(el)
  const view = sc ? sc.getBoundingClientRect() : null
  /* the board's own bar stays at the top over whatever scrolls under it: the visible list begins at its foot */
  const bar = document.querySelector('#schedBoard .sb-top')?.getBoundingClientRect()
  const top = Math.max(view ? view.top : 0, bar && bar.height > 0 && bar.top <= 1 ? bar.bottom : 0)
  const bottom = Math.min(view ? view.bottom : Infinity, window.innerHeight || document.documentElement.clientHeight)
  const dy = scrollToShow(box, top, bottom)
  if (!dy) return
  const target: any = sc || window
  if (typeof target.scrollBy === 'function') target.scrollBy({ top: dy, behavior: 'smooth' })
  else if (sc) sc.scrollTop += dy
}
