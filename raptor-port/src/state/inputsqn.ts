/* AN INPUT'S OWN SQUADRON — part F of the guard rail (the plan docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md
   §5; his D2621: "a squadron's inputs are seen and changed only on that squadron"; D2729 Q8). Step K9 (§10 step 7) builds
   what is here: the doors' one answer (`inputSqn`), the table of the doors into an input's window (`INPUT_DOORS`), and the
   Inputs page's list rule (`listReach`, `pageIsHome`). Step K10 (§10 step 8) adds the root's own answer — `letOpenOn`, the
   one squadron a window may stand live on that is not the input's (§5.2) — which no door asks, ever (§11 risk 19).

   THE DOORS AND THE ROOT NEVER SHARE AN ANSWER (§16, finding 2): a door asks `inputSqn`, which has NO clause for who is
   named in the input, and never gains one. */
import { inputSquadrons, inputUnitOf, inputSpanIso, holds } from '../engine/inputs'
import { me, pageUnit, myUnit, ownPageMayBe } from './perms'
import { todayIso, homeOn, homeChangesOn } from './units'

/** THE INPUT'S OWN SQUADRON (§5.2), for every door that brings it into view before its window opens. A new input: the
 *  squadron its page shows (it has no other). A saved input: the page's squadron where the input touches it (an input
 *  naming men of both is listed, and opened, on either), else the squadron of its first day (engine/inputs.ts
 *  inputUnitOf — never its first-named man's squadron today, which would carry Hunter to 149 for an input that touches his
 *  own page: round 1, Fable 3b). */
export function inputSqn(r: any, pageSqn: string): string {
  if (!r || r._new) return pageSqn
  if (inputSquadrons(r).includes(pageSqn)) return pageSqn
  return inputUnitOf(r) ?? pageSqn
}

/** THE ROOT'S ALONE (§5.2 — step K10): the squadron the Input window may stand live on although it is not the input's own
 *  (`inputSqn`), worked out ONCE, when the window's note is taken (ui/InputWindow.tsx) — never on a later draw, or his own
 *  move at midnight would read the new page and bring a held window back live (§15, finding 13; F12). Null for every
 *  other window, which is then held from the moment it opens wherever the page is not the input's own.
 *  NO DOOR ASKS THIS, EVER (§11 risk 19; §16 finding 2): a door asks `inputSqn`, which has no clause for who is named.
 *  Two cases, each named, each needing the input to name him (`holds`) — an input he only filed for others is never let:
 *  - HIS PAGES MAY NEVER BE THE INPUT'S SQUADRON (his D2621, [ruled]): the moved man's old input, live where he is, so that
 *    he can answer it — Ranger moved 142 → 149 with no right in 142, his old 142 duty on his 149 page;
 *  - THE PAGE IS HIS OWN HOME ON THE DAY THE WINDOW OPENS (K0's settlement of §5.5's home-page row — the orchestrator's
 *    call; nothing he sees changes: F18): Saber, home 142 with a move to 149 saved for 1 Dec, opens on his 142 page the
 *    leave he filed there for 5 Dec — 149's on its day, and his own; live there as it always was. This is K9's
 *    `pageIsHome` asked of the page the window stands on (on his own pages the same question; the schedule's page is the
 *    squadron in view). Never wider: not an input that only touches his home, not a page that is his home on another day.
 *  (An input he filed for others in a squadron he has since lost his right in — N9 — needs no case: no bell line can
 *  open it, state/notices.ts rightHolds; F19.) */
export function letOpenOn(r: any, pageSqn: string, pid: string | null): string | null {
  if (!r || r._new || !pageSqn || !pid || !holds(r, pid)) return null
  const own = inputSqn(r, pageSqn)
  if (own === pageSqn) return null                                     // the page's own: nothing to let
  const neverMine = !ownPageMayBe(own)
  if (neverMine) return pageSqn
  const homeToday = pageSqn === myUnit(todayIso())
  if (homeToday) return pageSqn
  return null
}

/** EVERY DOOR INTO AN INPUT'S WINDOW THAT OPENS A SAVED INPUT (§5.5), and whether it brings the input's own squadron into
 *  view first (`home`). Every row is settled (§5.3); the table stays so that a door added later must say which it is —
 *  ui/msq-guard-input-sqn.test.tsx holds that each `home` row's file asks `enterForLine`, and that every file asking it of
 *  `inputSqn` is a `home` row's; ui/msq-guard-rollcall.test.ts R5 (a) lists each `enterForLine` caller. A `home: false` row is a door whose input is, by
 *  the list's rule (§5.1, `listReach`), the page's own — or a moved man's old one, live where he is (D2621). */
export type InputDoor = { id: string; home: boolean; where: string; why: string }
export const INPUT_DOORS: readonly InputDoor[] = [
  { id: 'oilcard', home: true, where: 'ui/OilDayList.tsx', why: 'a card of the OIL list — D2403 names the list (§5.3)' },
  { id: 'belloil', home: true, where: 'ui/topstate.ts', why: 'the bell\'s own OIL tap — D2621: a bell line about such an input brings its squadron into view first' },
  { id: 'bellline', home: true, where: 'ui/topstate.ts', why: 'a bell line of an input — the line\'s own squadron entered first (D2325, §4.5)' },
  { id: 'inputsrow', home: false, where: 'ui/InputsPage.tsx', why: 'a row of the List and its "OIL" / "OIL?" button, the pinned just-saved row too — the page\'s own list (§5.1)' },
  { id: 'calcard', home: false, where: 'ui/InputsCal.tsx', why: 'a card of the calendar\'s day, and its own reveal — the same list (§5.1)' },
  { id: 'sansday', home: false, where: 'ui/SansDay.tsx', why: 'a card of a SANS day — the SANS calendar reads the page\'s squadron' },
  { id: 'schedoil', home: false, where: 'ui/inputedit.tsx', why: 'the OIL question raised after a save on the schedule — the input just saved, on the squadron in view' },
  { id: 'weekchip', home: false, where: 'ui/interactions.ts', why: 'a chip or puck on the week or the board — the week lists the squadron in view\'s people' },
  { id: 'docview', home: false, where: 'ui/DocViewer.tsx', why: '"Edit input" in the document viewer — as the list it was opened from' },
  { id: 'lwclash', home: false, where: 'leavewar/sync.ts', why: 'the Leave War\'s clash note — its window the page door\'s `then` (§5.4)' },
  { id: 'lwfiled', home: false, where: 'leavewar/sync.ts', why: 'the OIL question of what was just filed from the Leave War, in the war\'s own squadron' },
]

/** THE PAGE'S SQUADRON IS HIS OWN HOME THAT DAY — where it is not, his Inputs pages stand on another squadron (a master
 *  admin's or a Plan holder's, following his pick — D2197, D2201): its list leaves out his inputs of a squadron he can
 *  still open (§5.1), its "+ Input" offers that squadron's men alone (§18.6) and its "+ Commitment" that squadron's SANS
 *  aircrew alone (§18.7). */
export const pageIsHome = (iso: string = todayIso()): boolean => pageUnit('own', iso) === myUnit(iso)

/** A DAY OF THE INPUT, AFTER TODAY, ON WHICH HIS HOME IS `u` — a move saved ahead: he files for the squadron he is going
 *  to from the page he is on (F18, Fable 5 of the third read) */
function aheadAt(pid: string, u: string, r: any, today: string): boolean {
  const sp = inputSpanIso(r)
  if (!sp || sp[1] <= today) return false
  const from = sp[0] > today ? sp[0] : today
  return homeOn(pid, from) === u || homeChangesOn(pid, from, sp[1]).some(d => d > today && homeOn(pid, d) === u)
}

/** THE LIST'S REACH TEST (§5.1, his D2621; D2729 Q8), handed to engine/inputs.ts inputsListed by the Inputs page and its
 *  calendar: a squadron of an input that names him (and does not touch the page) whose page HIS could be — so the input
 *  is listed there, not here. ownPageMayBe reads the role in force (D2729 Q8: a moved master admin's old inputs follow the
 *  view he is in — on his old squadron's page in the admin view, on his own in the member view).
 *  ON HIS HOME PAGE A SQUADRON HE IS MOVING TO IS NOT COUNTED (F18 — Fable 5 of the third read): Saber, home 142, a move to
 *  149 saved for 1 Dec, files leave for 5 Dec on 142's page; it belongs to 149 on its day, but he filed it from here and it
 *  stays here. The plan wrote this as "the reach test handed in only where the page's squadron is not his home"; that
 *  would also keep a moved master admin's old inputs on his new home page in the admin view, which his D2729 Q8 rules
 *  against — so on the home page the test is handed in too, and leaves out only the squadrons he has left (the builder's
 *  reading, named in K9's report). Undefined where nobody is signed in: the list as it always was. */
export function listReach(): ((u: string, r: any) => boolean) | undefined {
  const m = me()
  if (!m) return undefined
  const today = todayIso()
  const home = pageIsHome(today)
  const may = new Map<string, boolean>()
  const reach = (u: string): boolean => { let v = may.get(u); if (v === undefined) { v = ownPageMayBe(u, today); may.set(u, v) } return v }
  return home ? (u, r) => reach(u) && !aheadAt(m, u, r, today) : u => reach(u)
}
