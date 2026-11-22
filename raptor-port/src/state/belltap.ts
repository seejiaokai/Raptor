/* THE BELL'S TAP ACROSS SQUADRONS — what a tap on the bell or on one of its lines does when the thing it is about belongs
   to another squadron than the page's (batch 1's second half, the plan
   docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md §7 item 5 (R9), §15 D3, §16 D3′; his D2325 — picture
   f9's words). Read by ui/topstate.ts bellTap / openNotice and by the bar's lit bell (ui/Shell.tsx); held by
   ui/msq-bell-tap.test.ts.
   - THE ACCESS ALERT (§15 D3): the bell is lit by unseen requests of the squadrons switched on in HIS bell
     (state/bellsqn.ts bellShows — a master admin's other squadrons off by default, D2198); a request of a squadron he
     switched off waits on that squadron's Waiting list and its Admin badges (accounts.ts waitingCount, the page's
     squadron's), never lighting the bell. accounts.ts accessAlert / unseenRequests keep every squadron of his: the seen
     mark (markRequestsSeen) is about what was on screen, not about the switch.
   - THE TAP (§15 D3): the newest such request; its squadron entered when it is not the page's own (below), then Admin →
     Users, the toast "1 waiting for access to 149" — the count of that squadron's Waiting list, the one he lands on.
   - A LINE OF ANOTHER SQUADRON (R9): entered first, only where his own pages may be that squadron's (perms.ts
     ownPageMayBe — a Plan holder of it, a master admin, his home); where they may not, the caller opens nothing (the line
     is only read — never his own squadron's page at that line's day, which would show the wrong war or a row not there).
   ENTERING IS NAVIGATION, NOT A COMMAND: nothing saved, the Undo list untouched (D148), by the one entry sign-in and
   midnight take (state/store.ts enterSquadron), an open Leave War window holding the war's step (state/typing-hold.ts).
   Phase 3's squadron menu routes its pick through the same entry; the pick's own question for unsaved Tracker edits
   (§16 D2′) is asked here too (state/pick.ts askBeforeEntering — night job 2, 23 Nov 26), and an entry made here counts
   as his pick for the band of a window left open (state/typing-hold.ts enteredByPick).
   - THE GREY SQUADRON MARK on a line of a squadron other than his home (lineSqnMark, at the foot — night job 4, 23 Nov
     26): which squadron the line is from, read by the bell's list. */
import { unseenRequests, currentAdminAccountId, waitingCount, type AccessRequest } from './accounts'
import { bellShows } from './bellsqn'
import { me, pageUnit, ownPageMayBe } from './perms'
import { enterSquadron } from './store'
import { askBeforeEntering } from './pick'
import { holdNow } from './typing-hold'
import { unitById, homeOn, todayIso } from './units'
import { lineUnit, isAcctNotice, type Notice } from './notices'

/** the unseen requests that light HIS bell — those of the squadrons switched on in it */
export function bellRequests(): AccessRequest[] {
  const pid = me()
  if (!pid || !currentAdminAccountId()) return []
  return unseenRequests().filter(r => bellShows(String(pid), r.unit))
}
export const bellAccessAlert = (): boolean => bellRequests().length > 0
/** the request a tap on the bell opens: the newest of those (ties: the later in the list) */
export function newestBellRequest(): AccessRequest | null {
  let best: AccessRequest | null = null
  for (const r of bellRequests()) if (!best || r.at >= best.at) best = r
  return best
}

export type LineEntry = 'here' | 'entered' | 'no' | 'asked'
/** bring the page to squadron `u` for a line or request about it: 'here' — his own pages already are `u`'s (or the line
 *  names none, stored before — D56); 'entered' — `u` entered; 'no' — his own pages may not be `u`'s; 'asked' — the
 *  Tracker's question for unsaved chart edits is up first (state/pick.ts askBeforeEntering, §16 D2′ — the menu's own
 *  question): the caller stops, and `again` runs the tap once more after Save or Discard (nothing after Stay) */
export function enterForLine(u: string | null | undefined, again?: () => void): LineEntry {
  if (!u || u === pageUnit('own')) return 'here'
  if (!ownPageMayBe(u)) return 'no'
  const ask = askBeforeEntering(u)
  if (ask) { void ask.then(go => { if (go && again) again() }); return 'asked' }
  enterSquadron(u, holdNow() === 'war', true)
  return pageUnit('own') === u ? 'entered' : 'no'
}

/** the bell's tap on an access request: false when none lights his bell. The toast names the squadron landed on. */
export function openBellRequest(open: () => void, toast: (s: string) => void): boolean {
  const rq = newestBellRequest()
  if (!rq) return false
  if (enterForLine(rq.unit, () => { openBellRequest(open, toast) }) === 'asked') return true
  const here = pageUnit('own')
  const num = unitById(here)?.num ?? here
  open()
  toast(`${waitingCount()} waiting for access to ${num}`)
  return true
}

/** THE GREY SQUADRON MARK ON A BELL LINE (the plan §7 item 3, 8b; his D2202 "each line shows which squadron it is from";
 *  the approved picture p3b — the grey badge already approved for another squadron's line): the number of the line's
 *  squadron (notices.ts lineUnit — its stamp; a line stored before reads as his home, D56) where that is not his home
 *  today; none on his own account's lines (§15 D5, D2319: "no squadron mark"). Read by ui/topbits.tsx BellList. */
export function lineSqnMark(n: Notice, pid: string, iso: string = todayIso()): string | null {
  if (isAcctNotice(n)) return null
  const u = lineUnit(n)
  if (!u || u === homeOn(pid, iso)) return null
  return unitById(u)?.num ?? null
}
