/* THE SIGN-OFF BOX'S WRITE, AND THE OIL QUESTION IT ASKS FIRST ([FABLE-READ-FAULTS], OIL F2 — Fable's OIL read, 22 Nov 26:
   a weekend whose only work is an input nobody answered the OIL question for published in silence, the man on it earning
   nothing and no screen saying so — his D81 asks that a worked weekend that earns nobody "says so, on the day and at
   publish").

   His rulings: D2294 — "how about B but u ask when any sign off is selected": the day's open OIL list opens at the first
   press of any of the day's four sign-off boxes, BEFORE the name is recorded (an OIL answer given after signing changes
   the day and clears the sign-offs already given, so asking afterwards would undo the signing); Later asks no more that
   day. D2296, D2297, D2299 — the list as drawn (docs/mock/2026-11-22-oil-unanswered-publish/draw-f3.mjs, round 6): the
   pressed box itself at its top, the name held in it; the list's close button or Escape signs nothing, and the next press
   on any of the four boxes asks again. The publish note's half is leavewar/sync.ts publishFlagsBids.

   ONE DOOR: the sign-off boxes of the Scheduler Board and of Edit Schedule's week are one delegated handler
   (ui/Shell.tsx), which calls signPick. The list (ui/OilDayList.tsx) calls holdSave / holdLater; its close throws the
   hold away with the list (ui/pops.ts OILLIST.hold), so nothing is signed.

   "LATER ASKS NO MORE THAT DAY" IS KEPT BY WHICH INPUTS WERE LEFT (the agent's reading, told to him): the day remembers
   the inputs that stood unanswered when Later was pressed, for as long as he is signed in (ui/pops.ts OILSIGN_LATER,
   cleared with the session). The other three boxes then sign at once. An input filed on the day AFTERWARDS has never been
   put to anyone, so the next press asks once more, the list showing what is open. */
import { DAYS } from '../engine/data'
import { curDraftId } from '../engine/drafts'
import { logAction } from '../engine/editlog'
import { HOOKS } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { setSign, signShown, daySigned, dayApproved, dayHasChanges, SIGN_ROLES } from '../engine/publish'
import { UNIT } from '../engine/unitview'
import { dayIso } from '../engine/verid'
import { CURWEEK } from '../engine/waves'
import { schedWrite, SCHED_TYPES } from '../state/sched-commit'
import { oilOpenOn, unitDayFacts, holidayOwnNameOf } from '../leavewar/sync'
import { adminOfList, saveOilDay, type OilPick } from './oilday'
import { OILSIGN_LATER, setOilList } from './pops'

export type SignHold = { di: number; role: string; who: string; plan?: string }

/** the sign-off's write — the body the boxes' handler has always run (ui/Shell.tsx), moved here whole so the list's Save
 *  and Later write the held name by the very same path */
export function writeSign(di: number, role: string, who: string): void {
  const wasSigned = daySigned(di)             // capture BEFORE, so the note fires only on COMPLETING the set (kept OUTSIDE the command, R2-11)
  /* [ARCH-STACK] follow-up #1 (row D): route the sign write through a
     sched.sign command. setSign mutates SCHED.sign/signBind and histPush
     persists — both inside so the command captures the change and the legacy
     persist still runs (latched, phase 8). The daySigned reads and reflow
     stay outside (they read, they don't write). */
  schedWrite(SCHED_TYPES.sign, () => {
    setSign(di, role, who)   // AM-06: binds the signature to the content it signed
    HOOKS.histPush()
    /* the change history's line for a sign-off, inside the command so a refused one leaves none ([DRAFT-PENDING] —
       Fable F3 / Astra DP-07: signing is an official act on the day, and every member reads who did it, D169) */
    const label = (SIGN_ROLES.find((r: any) => r[0] === role) || [])[1] || 'Sign-off'
    logAction(di, who ? `Signed · ${label} · ${(PEOPLE as any)[who]?.cs || who}` : `Sign-off cleared · ${label}`, { sect: 'day' })
  })
  /* R2 (owner, 15 Sep 26): completing the four sign-offs on an ALREADY-published
     day with nothing pending correctly shows NO publish button — which reads like
     a bug ("I signed everything, where's publish?"). Say so, once, only on the
     transition INTO fully-signed (not when re-picking a name on an already-signed
     day — Codex PSF-004). Not on an unpublished day: there, signing IS what
     unlocks the first publish, so the button appears and there is no confusion.
     dayHasChanges is the one publish-eligibility authority (same one the status
     line reads). */
  if (!wasSigned && daySigned(di) && dayApproved(di) && !dayHasChanges(di))
    HOOKS.toast('All signed — no changes to publish right now')
}

/** A NAME PICKED IN A SIGN-OFF BOX. 'signed' — written; 'held' — the day's OIL list is up first and nothing is written. */
export function signPick(di: number, role: string, who: string): 'held' | 'signed' {
  const ask = who ? signAsks(di) : null     // a name taken OUT of a box signs nothing, so it asks nothing
  if (!ask) { writeSign(di, role, who); return 'signed' }
  /* the list for that one day, as a put-back opens it (ui/oilputback.ts): a holiday named by its own name, a plain
     weekend saying nothing of a holiday; never the "is now a public holiday" lead — nothing was just declared */
  const ph = unitDayFacts(ask.unit, ask.iso).kind === 'ph'
  setOilList({ from: ask.iso, to: ask.iso, name: ph ? holidayOwnNameOf(ask.unit, ask.iso) : '', fresh: false, plain: !ph, unit: ask.unit, hold: { di, role, who, ...(planOf(di) ? { plan: planOf(di) } : {}) } })
  return 'held'
}

const laterKey = (unit: string, iso: string) => `${unit}|${iso}`
/** MUST THIS DAY'S SIGN-OFF ASK FIRST? — the day in view's date and squadron where it must, else null. It asks where the
 *  day's list would list anything he has not already left for Later (above), and only of someone the list is for: the
 *  list's own gate (ui/oilday.ts adminOfList) would otherwise close it at once and the press would do nothing at all. */
function signAsks(di: number): { iso: string; unit: string } | null {
  if (!DAYS[di]) return null
  const iso = dayIso(String(CURWEEK), di), unit = UNIT
  if (!iso || !adminOfList(unit)) return null
  const left = OILSIGN_LATER.get(laterKey(unit, iso))
  return oilOpenOn(iso, iso, unit).some(o => !left || !left.has(o.iid)) ? { iso, unit } : null
}

/** IS THE HELD SIGN-OFF STILL THE DAY'S? — the list stays up while he works behind it (D641), so the week or the squadron
 *  in view can change under it: a hold whose day is no longer the list's date and squadron is not written anywhere. */
/*  …NOR IS ONE WHOSE SAVED PLAN IS NO LONGER THE DAY'S LIVE ONE (Astra's scenario read, F01 — 22 Nov 26): each plan of a
 *  day owns its own four signatures (engine/drafts.ts), so a name picked on plan A and written after a switch to plan B
 *  would sign content nobody picked it for. Such a hold is dropped as the list's close drops it: nothing is signed,
 *  Later marks nothing asked, and the next press on the plan now live asks again. */
const planOf = (di: number): string => String(curDraftId(di) ?? '')
export const holdStands = (hold: SignHold, iso: string, unit: string): boolean =>
  unit === UNIT && !!DAYS[hold.di] && dayIso(String(CURWEEK), hold.di) === iso && (hold.plan ?? '') === planOf(hold.di)

/** LATER, with a sign-off held: the name is written, with no answer — nobody on those inputs earns OIL, and the publish
 *  note says so (leavewar/sync.ts publishFlagsBids) — and the day asks no more of what stood open. */
/* what stands unanswered on the day now is marked as left: no later box asks about it again */
function leaveOpen(iso: string, unit: string): void {
  const key = laterKey(unit, iso), left = OILSIGN_LATER.get(key) || new Set<string>()
  for (const o of oilOpenOn(iso, iso, unit)) left.add(o.iid)
  OILSIGN_LATER.set(key, left)
}
export function holdLater(hold: SignHold, iso: string, unit: string): void {
  if (!holdStands(hold, iso, unit)) return
  leaveOpen(iso, unit)
  writeSign(hold.di, hold.role, hold.who)
  HOOKS.reflow()      // the box is drawn by the schedule's own builders: it reads the name on their next draw
}

/** SAVE, with a sign-off held: THE ANSWERS FIRST, THEN THE NAME (D2294) — an answer changes the day the signatures are
 *  bound to, so a name written before it would be cleared by it. Two steps of Undo, the name's first (the agent's reading,
 *  told to him: the answer is a change to the inputs, the name a change to the schedule's own record). False where the
 *  answers were refused: nothing is signed, and the list stays up. */
export function holdSave(hold: SignHold, iso: string, unit: string, picks: Readonly<Record<string, OilPick | undefined>>): boolean {
  if (saveOilDay(iso, iso, picks, unit) < 0) return false
  /* WHAT THIS SAVE LEFT UNPICKED IS LEFT AS LATER LEAVES IT (the fresh Opus read of the finished code, finding 1 — 22 Nov
     26): with two inputs listed and one answered, the next box asked again for the other, and that answer changed what
     the name just written was bound to and cleared it — the list's own path to the thing D2294 asks first to avoid. He
     saw the row and left it: no later box asks, and the publish note names it (the agent's reading, told to him). */
  if (holdStands(hold, iso, unit)) { leaveOpen(iso, unit); writeSign(hold.di, hold.role, hold.who); HOOKS.reflow() }
  return true
}

/** the held box's own words, as the board's box reads them: its role ("CUR CK"), whether it is an appointed scheduler's
 *  (the ✦ the board's box wears) and the name held in it */
export function holdSaid(hold: SignHold): { label: string; sch: boolean; cs: string } {
  const r = SIGN_ROLES.find((x: any) => x[0] === hold.role) || []
  return { label: String(r[1] || 'Sign-off'), sch: !!r[2], cs: String((PEOPLE as any)[hold.who]?.cs || hold.who) }
}

/** what the box shows now — the handler puts a held pick's `<select>` back to it, so the box never reads a name not written.
 *  Read through signShown, never signOf: signOf CREATES the day's sign record where there is none, a write to the schedule
 *  outside any command that the next unrelated command and its Undo step would carry off (engine/publish.ts signAt, R2-01 —
 *  the fresh Opus read, finding 2); and signShown is what the box itself draws, a name the content has moved under included. */
export const signNow = (di: number, role: string): string => String(signShown(di)[role] || '')

/** the tests' reset (the session's own is ui/pops.ts POPS_RESET) */
export function resetOilSign(): void { OILSIGN_LATER.clear() }
