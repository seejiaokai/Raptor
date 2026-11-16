/* OPENING THE ONE CHANGES WINDOW ([DRAFT-PENDING], 28 Sep 26) — from a day's chip (that day, on the tab the chip counts)
   or the admin's top-bar icon (the week, on New to you — D171). Its own small module so the doors (the click router,
   the top bar, the board) need not import the window, and the window need not import them back. An open window keeps
   where he put it — only what it shows changes (the ALL AVAIL window's rule). */
import { notify } from '../state/store'
import { CHGWIN, setChgWin, type ChgWin } from '../state/view'
import { isMember } from '../state/perms'
import { countOpen } from './floatwin'
import { forward, gone } from './winorder'

export function openChanges(day: string, tab: ChgWin['tab']) {
  if (!isMember()) return
  const was = CHGWIN
  setChgWin({ day, tab, group: was ? was.group : 'item' })   // Item first and the default (D345)
  countOpen('chg')
  forward('chg')   // in the window order as well as in front (the code reads of 17 Nov 26, C — availopen.ts)
  notify()
}
/* CLOSING IT — ONE BODY for its ✕, its Escape and the toggle (the code reads of 17 Nov 26, E — availopen.ts closeAvailWin) */
export function closeChanges(): void {
  setChgWin(null)
  gone('chg')
  notify()
}
/* the board's History button and the admin's icon toggle it */
export function toggleChanges(day: string, tab: ChgWin['tab']) {
  if (CHGWIN) { closeChanges(); return }
  openChanges(day, tab)
}
