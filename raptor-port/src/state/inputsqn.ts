/* AN INPUT'S OWN SQUADRON — part F of the guard rail (the plan docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md
   §5; his D2621: "a squadron's inputs are seen and changed only on that squadron"; D2729 Q8). Step K9 (§10 step 7) builds
   what is here: the doors' one answer (`inputSqn`), the table of the doors into an input's window (`INPUT_DOORS`), and the
   Inputs page's list rule (`listReach`, `pageIsHome`). Step K10 (§10 step 8) adds the root's own answers — `letOpenOn`, the
   one squadron a window may stand live on that is not the input's (§5.2), and `letReadOnly`, a window that opens read
   only where it is not the input's — which no door asks, ever (§11 risk 19).
   STEP K10 UNDER HIS D2834 (the K10 root plan, docs/superpowers/plans/2026-11-28-msq-s1-k10-root-plan.md — K10-a): a
   ONE-MAN record still open when its man moves squadron goes with him ("anything that's outstanding that is not closed will
   need to be transferred with the person"), and one closed before the move stays (D2846, D2847). `holderOf` is that
   answer: the squadron that holds such a record now, only where a move of his has carried it, else null.

   THE DOORS AND THE ROOT NEVER SHARE AN ANSWER (§16, finding 2 — restated by the K10 root plan §2.4, D2834): a door asks
   `inputSqn`, which gives the holder where a move of its one man has carried it (`holderOf`, D2834), else the page's where
   the record touches it, else its first day's. Neither reads anything of the person signed in or looking. Only the root
   asks `letOpenOn` and `letReadOnly`, the two functions that read who is looking. */
import { INPUTS, inputSquadrons, inputUnitOf, inputSpanIso, holds, onlyNamed, idsOf, leadOf, isDownchit, isUpchit } from '../engine/inputs'
import { medEpisode, medStartOrd, medEndOrd } from '../engine/medical'
import { me, isMe, pageUnit, myUnit, ownPageMayBe, mayEditInput, adminOfUnit } from './perms'
import { canEditOwn } from './auth'
import { dayOfAt } from './notices'
import { todayIso, homeOn, homeChangesOn } from './units'

/* ---- WHERE A ONE-MAN RECORD SETTLES (the K10 root plan §1, §2.1 — his D2834, D2845, D2846, D2847) ---- */

/** THE DAY A RECORD WAS FILED (the K10 root plan §1, "a filing day"): the date of its own saved-at moment (`at`, written
 *  once when it is placed — state/inputstamp.ts stampPlaced — on the same clock as the moves); a record stored without one
 *  is read by its `mod` stamp where that is a date, else its own first day (data already stored, D56). Null where none of
 *  the three can be read. */
export function filedOn(r: any): string | null {
  if (!r) return null
  if (typeof r.at === 'number' && Number.isFinite(r.at)) return dayOfAt(r.at)
  if (typeof r.mod === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.mod)) return r.mod
  const sp = inputSpanIso(r)
  return sp ? sp[0] : null
}
const minIso = (a: string, b: string): string => (a < b ? a : b)

/* A MEDICAL DOWNCHIT'S EPISODE, CLOSED, REPLACED OR STILL OPEN on `today` (the plan's §1 rows 1–1d; his D2845, D2846):
   - its OWN closing upchit (row 1d, the planner's reading R3 — Astra 5: an upchit for a later episode never closes or
     carries an earlier one): the earliest upchit of his dated on or after the episode's last end AND before the next
     separate episode of his begins, filed by `today` — closed, settled on that upchit's filing day (R1: D2846's "an
     upchit given by the old squadron" — the day it was filed decides, not the date written on it, so a backdated
     certificate 149 files closes it in 149, D2845);
   - none, and a separate later downchit of his stands (row 1c, R2 — the tab's own rule: a newer entry replaces the nag,
     engine/medical.ts pendingUpchits (b)): replaced — read by its days, never carried;
   - else open.
   (The episode is engine/medical.ts medEpisode's — overlapping or touching downchits, the closing upchit folded in.) */
type MedState = { closedOn: string } | 'replaced' | 'open' | null
function medState(r: any, pid: string, today: string): MedState {
  const downs = medEpisode(r).filter((x: any) => isDownchit(x.type))
  let end: number | null = null
  for (const x of downs) { const b = medEndOrd(x); if (b != null && (end == null || b > end)) end = b }
  if (end == null) return null
  const ep = new Set<any>(downs)
  let next: number | null = null
  for (const x of INPUTS) {
    if (!x || ep.has(x) || !isDownchit(x.type) || !holds(x, pid)) continue
    const a = medStartOrd(x)
    if (a != null && a > end && (next == null || a < next)) next = a
  }
  let closer: { o: number; f: string } | null = null
  for (const u of INPUTS) {
    if (!u || !isUpchit(u.type) || !holds(u, pid)) continue
    const o = medStartOrd(u), f = filedOn(u)
    if (o == null || f == null || o < end || (next != null && o >= next) || f > today) continue
    if (!closer || o < closer.o || (o === closer.o && f < closer.f)) closer = { o, f }
  }
  if (closer) return { closedOn: closer.f }
  return next != null ? 'replaced' : 'open'
}

/* THE ONE BODY OF `holderOf`, `isOpenMedical` and `lifeOf` (the plan §2.1): for a record naming ONE man alone
   (engine/inputs.ts onlyNamed — an input of several people, or a placeholder's, is never carried: R8), begun by `today`,
   whose man has a home — his id, the squadron of its first day (`first`, inputUnitOf), and the day `d` its holder is read
   on: the earlier of today and its settle day (an open downchit: today; a closed one: its upchit's filing day; an upchit:
   its own day, never carried — D2846; any other record: its last day, so finished leave kept by the squadron it was carried
   into stays there after later moves — D2847, Astra 4). A replaced downchit, and every other record, answers null. */
type Settle = { pid: string; first: string; d: string; open: boolean; span: [string, string] }
function settleOf(r: any, today: string): Settle | null {
  if (!r || r._new) return null
  const p = onlyNamed(r)
  if (p == null) return null
  const span = inputSpanIso(r)
  if (!span || span[0] > today) return null
  const first = inputUnitOf(r)
  if (!first) return null
  const pid = String(p)
  if (isUpchit(r.type)) return { pid, first, d: span[0], open: false, span }
  if (isDownchit(r.type)) {
    const m = medState(r, pid, today)
    if (m == null || m === 'replaced') return null
    if (m === 'open') return { pid, first, d: today, open: true, span }
    return { pid, first, d: minIso(today, m.closedOn), open: false, span }
  }
  return { pid, first, d: minIso(today, span[1]), open: false, span }
}

/** THE SQUADRON THAT HOLDS A ONE-MAN RECORD NOW, ONLY WHERE A MOVE OF HIS HAS CARRIED IT (his D2834; the K10 root plan
 *  §2.1), else null. His squadron on the record's settle day (`settleOf`), returned only where it differs from the squadron
 *  of its first day: Nasty's OML of 6–9 Jul, still pending, he moved 142 → 149 on 16 Jul — 149's from the 16th, and 150's
 *  if he moves on while it is open; closed by an upchit 149 filed on the 18th — 149's for good; closed by one filed before
 *  the move — null (it stays 142's). A move saved ahead carries nothing until its day.
 *  It reads the record and its man's homes, NOTHING OF WHO IS SIGNED IN OR LOOKING (§2.4; H2 holds it with a loop). Asked
 *  at a press and when a window's note is taken — never per row of a list (it reads the man's medical rows). */
export function holderOf(r: any, today: string = todayIso()): string | null {
  const s = settleOf(r, today)
  if (!s) return null
  const h = homeOn(s.pid, s.d)
  return h && h !== s.first ? h : null
}

/** IS THIS A MEDICAL DOWNCHIT STILL OPEN ON `today` (the plan §1 row 1 — the "open" column; H4 holds that it agrees, record
 *  by record, with the Medical tab's Medically Down and Pending Upchit sections): one man's, begun, its episode neither
 *  closed by its own upchit nor replaced. */
export function isOpenMedical(r: any, today: string = todayIso()): boolean {
  return !!r && isDownchit(r.type) && settleOf(r, today)?.open === true
}

/** THE SQUADRONS OF A RECORD'S LIFE (the plan §2.2 — read by `letReadOnly` alone, the root's): the squadrons of its days
 *  (engine/inputs.ts inputSquadrons), its man's squadron on every day from its first day to the day its holder is read on,
 *  and — for an open medical record — his squadrons on the moves saved ahead after today. A page in a record's life that is
 *  not its own shows it as one of its squadrons (history, or one he is moving into): its window opens there read only. */
export function lifeOf(r: any, today: string = todayIso()): string[] {
  const out = new Set<string>(r ? inputSquadrons(r) : [])
  const s = settleOf(r, today)
  if (!s) return [...out]
  const add = (iso: string) => { const h = homeOn(s.pid, iso); if (h) out.add(h) }
  add(s.span[0])
  for (const d of homeChangesOn(s.pid, s.span[0], s.d)) add(d)
  if (s.open) for (const d of homeChangesOn(s.pid, today, '9999-12-31')) add(d)
  return [...out]
}

/** THE INPUT'S OWN SQUADRON (§5.2; under his D2834 — the K10 root plan §2.2), for every door that brings it into view
 *  before its window opens. A new input: the squadron its page shows (it has no other). A saved one-man record a move of
 *  his has carried: its holder (`holderOf`), on every page. Any other saved input: the page's squadron where the input
 *  touches it (an input naming men of both is listed, and opened, on either), else the squadron of its first day
 *  (engine/inputs.ts inputUnitOf — never its first-named man's squadron today, which would carry Hunter to 149 for an input
 *  that touches his own page: round 1, Fable 3b; the holder is only ever a moved man's own record's). */
export function inputSqn(r: any, pageSqn: string): string {
  if (!r || r._new) return pageSqn
  const carried = holderOf(r)
  if (carried) return carried
  if (inputSquadrons(r).includes(pageSqn)) return pageSqn
  return inputUnitOf(r) ?? pageSqn
}

/** THE ROOT'S ALONE (§5.2 — step K10): the squadron the Input window may stand live on although it is not the input's own
 *  (`inputSqn`), worked out ONCE, when the window's note is taken (ui/InputWindow.tsx) — never on a later draw, or his own
 *  move at midnight would read the new page and bring a held window back live (§15, finding 13; F12). Null for every
 *  other window, which is then held from the moment it opens wherever the page is not the input's own (or read only, by
 *  `letReadOnly`).
 *  NO DOOR ASKS THIS, EVER (§11 risk 19; §16 finding 2): a door asks `inputSqn`, which reads nothing of who is looking.
 *  Two cases, each named, each needing the input to name him (`holds`) — an input he only filed for others is never let:
 *  - HIS PAGES MAY NEVER BE THE INPUT'S SQUADRON (his D2621, [ruled]): the moved man's old input, live where he is, so that
 *    he can answer it — Ranger moved 142 → 149 with no right in 142, his old 142 duty on his 149 page;
 *  - THE PAGE IS HIS OWN HOME TODAY AND THE INPUT'S SQUADRON IS ONE HE MOVES TO ON A DAY OF IT AFTER TODAY (K0's
 *    settlement of §5.5's home-page row, NARROWED by the K10 root plan §4.3 to the list's width — K9's `aheadAt`, his D2729
 *    Q8): Saber, home 142 with a move to 149 saved for 1 Dec, opens on his 142 page the leave he filed there for 5 Dec —
 *    149's on its day, and his own; live there as it always was. Never wider: a moved master admin's old 142 duty on his
 *    new 149 home page is not let (the list never shows it there, D2729 Q8; H6).
 *  (An input he filed for others in a squadron he has since lost his right in — N9 — needs no case: no bell line can
 *  open it, state/notices.ts rightHolds; F19.) */
export function letOpenOn(r: any, pageSqn: string, pid: string | null): string | null {
  if (!r || r._new || !pageSqn || !pid || !holds(r, pid)) return null
  const own = inputSqn(r, pageSqn)
  if (own === pageSqn) return null                                     // the page's own: nothing to let
  const neverMine = !ownPageMayBe(own)
  if (neverMine) return pageSqn
  const today = todayIso()
  const homeToday = pageSqn === myUnit(today)
  if (homeToday && aheadAt(pid, own, r, today)) return pageSqn
  return null
}

/** AN ADMIN READS ANOTHER SQUADRON'S INPUT READ ONLY — the Input window's own `foreign` test (ui/InputWindow.tsx, step A
 *  of the second-half plan §2), COPIED BY NAME so the root's `letReadOnly` asks the very predicate the window shows
 *  (the K10 root plan §4.3 case 3). The window keeps its own copy until K10-d, whose patch's context holds the window's
 *  import lines; K10-d makes the window import this one. A saved input, an admin signed in, not his own one-man input,
 *  and he is an admin of none of its squadrons (its first day's and every squadron a man named in it is in on any of its
 *  days — engine/inputs.ts inputSquadrons, the gate's own reading). */
export function foreignInput(r: any): boolean {
  return !!r && !r._new && canEditOwn() && !(idsOf(r).length <= 1 && isMe(leadOf(r)))
    && (() => {
      const u = inputUnitOf(r)
      if (u == null) return false
      return ![u, ...inputSquadrons(r)].some(x => adminOfUnit(x))
    })()
}

/** THE ROOT'S ALONE TOO (the K10 root plan §4.3 — step K10-a builds it; the root, K10-d, asks it once, when the window's
 *  note is taken): does the Input window open READ ONLY on `pageSqn`, a page that is not the input's own (`inputSqn`)? A
 *  read-only window is never held at its birth and writes nothing. Two cases:
 *  - 3: HIS PAGES MAY NEVER BE THE RECORD'S SQUADRON, IT DOES NOT NAME HIM, AND HE COULD CHANGE NOTHING OF IT (the
 *    write path's perms.ts mayEditInput, or the window's own `foreign` test — `foreignInput`): Hunter (Plan of 149, View
 *    of 150) presses a 149-stamped bell line about Osprey's Training after Osprey moved to 150 — read only on 149, today's
 *    look (the planner's reading R12: D2835's View-only presser keeps it until his drawing);
 *  - 4: THE PAGE IS IN THE RECORD'S LIFE (`lifeOf`): Nasty's carried OML on 142's Medical tab as of a day before his move,
 *    on 149's between two moves, on 149's ahead of a saved move; Ranger's carried leave on 142's List (D2847: the old
 *    squadron's admin no longer may; D2834; D2621's mirror; its look is the K10 root plan's Q1).
 *  An input naming men of both squadrons is the page's own on either (F8): never read only by this. */
export function letReadOnly(r: any, pageSqn: string, pid: string | null): boolean {
  if (!r || r._new || !pageSqn) return false
  const own = inputSqn(r, pageSqn)
  if (own === pageSqn) return false
  if (pid && !holds(r, pid) && !ownPageMayBe(own) && (!mayEditInput(r) || foreignInput(r))) return true
  return lifeOf(r).includes(pageSqn)
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
  { id: 'docview', home: false, where: 'ui/DocViewer.tsx', why: '"Edit input" in the document viewer — as the list or the Medical tab it was opened from (the `medtab` row)' },
  { id: 'medtab', home: false, where: 'ui/MedicalView.tsx', why: 'a card of the Medical tab, and every page of its viewer\'s pager, then "Edit input" — a carried record is its holder\'s (holderOf, D2834); one standing on a page in its life that is not its own opens read only (letReadOnly, D2846, D2847); Upchit Complete lists an upchit by the roster on its filing day (D2846)' },
  { id: 'lwclash', home: false, where: 'leavewar/sync.ts', why: 'the Leave War\'s clash note — its window the page door\'s `then` (§5.4)' },
  { id: 'lwfiled', home: false, where: 'leavewar/sync.ts', why: 'the OIL question of what was just filed from the Leave War, in the war\'s own squadron' },
]

/** THE PAGE'S SQUADRON IS HIS OWN HOME THAT DAY — where it is not, his Inputs pages stand on another squadron (a master
 *  admin's or a Plan holder's, following his pick — D2197, D2201): its list leaves out his inputs of a squadron he can
 *  still open (§5.1), its "+ Input" offers that squadron's men alone (§18.6) and its "+ Commitment" that squadron's SANS
 *  aircrew alone (§18.7). */
export const pageIsHome = (iso: string = todayIso()): boolean => pageUnit('own', iso) === myUnit(iso)

/* A DAY OF THE INPUT, AFTER TODAY, ON WHICH HIS HOME IS `u` — a move saved ahead: he files for the squadron he is going
   to from the page he is on (F18, Fable 5 of the third read) */
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
