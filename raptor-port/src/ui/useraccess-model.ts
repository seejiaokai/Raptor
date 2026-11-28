/* ADMIN → USERS — A PERSON'S ACCESS, THE READS BEHIND HIS OPENED ROW (pure reads, no screen; ui/UserAccess.tsx draws them —
   his D2303 design B, D2306, D2320, D2336, D2211; pictures rB1–rB4, p2a, p2b). Kept apart from the screen file so it
   hands out screen parts alone (the code check's only-export-components). */
import { ACCOUNTS_LIST, levelAcct, isAdminAccount, type Account, type AccountRole, type AccessLine } from '../state/accounts'
import { units, unitById, grantOfOn, homeOn, todayIso } from '../state/units'
import { adminOfUnit } from '../state/perms'
import { SESSION } from '../state/auth'
import { squadronOrder } from '../state/units-model'

export type RolePick = AccountRole | 'master'
export const numOf = (u: string): string => String(unitById(u)?.num ?? u)
const actor = (): Account | undefined => (SESSION ? ACCOUNTS_LIST.find(a => a.id === SESSION.user) : undefined)
export const actorIsMaster = (): boolean => actor()?.master === true

/* his role as the box shows it: the master mark first, then the role his account gives today (UsersPanel's roleNow) */
export const rolePickOf = (a: Account | undefined, roleNow: AccountRole): RolePick => (a?.master ? 'master' : roleNow)

/* each other squadron's line as it stands today: Plan ("plan"), View, or none */
export function accessLinesOf(a: Account | undefined, pid: string, iso: string = todayIso()): Record<string, AccessLine> {
  const out: Record<string, AccessLine> = {}
  const home = homeOn(pid, iso)
  for (const u of units()) {
    if (u.id === home) continue
    const g = a ? grantOfOn(levelAcct(a), u.id, iso) : undefined
    out[u.id] = g?.level === 'admin' ? 'plan' : g?.level === 'view' ? 'view' : 'none'
  }
  return out
}

/* "· also plans 149" — the squadrons other than his home that his account holds Plan of today, by number: numbers inside
   a sentence, kept by number as state/units.ts's sentence is — the one order with no home (units-model.ts squadronOrder),
   never a sort of its own */
export function alsoPlansOf(a: Account | undefined, pid: string, iso: string = todayIso()): string | null {
  if (!a || a.master) return null
  const home = homeOn(pid, iso)
  const us = squadronOrder(units().map(u => u.id).filter(u => u !== home && grantOfOn(levelAcct(a), u, iso)?.level === 'admin'), null, u => u, numOf)
  return us.length ? `also plans ${us.map(numOf).join(', ')}` : null
}

/* ANOTHER SQUADRON'S MAN ON THIS SQUADRON'S PAGE — HIS SHORT ROW'S SECOND LINE (his D2625, D2652 N3 e, D2655 D5; the plan
   §19.1 with §21.2's step-0 block; the drawings docs/mock/2026-11-25-msq-pick-guard-q3/drawn/u6-*-folded, s2-16, s2-17).
   The words are the reviewed drawings' own (scripts/handpass/n176/words-r6-users.mjs W6.roleAdmin, W6.roleMaster,
   W6.alsoPlans, W6.alsoViews; words.mjs noSignInOpened), never this file's.
   - his role in words after seat and CAT: "admin", or "master admin, full access"; a member adds nothing, and a man with
     no sign-in has no role;
   - what he already holds of the page's squadron: "also plans 149" (as built), "also views 149"; a master admin nothing
     more (his role already says full access). */
export function shortRoleOf(a: Account | undefined): string | null {
  if (!a) return null
  if (a.master) return 'master admin, full access'
  return isAdminAccount(a) ? 'admin' : null
}
export function holdsHereOf(a: Account | undefined, unit: string, iso: string = todayIso()): string | null {
  if (!a || a.master) return null
  const g = grantOfOn(levelAcct(a), unit, iso)
  const n = numOf(unit)
  return g?.level === 'admin' ? `also plans ${n}` : g?.level === 'view' ? `also views ${n}` : null
}
/* a man with no sign-in, his short row opened: these words in place of the line, Cancel alone ("142's admin" — his own
   squadron's) */
export const noSignInWords = (homeNum: string): string => `No sign-in. Ask ${homeNum}'s admin to give him one first.`
/* the passing note when the short row was judged again at Save and found changed (his D2730 Q13 — these words exactly,
   the callsign from the row) */
export const changedWhileOpenWords = (callsign: string): string =>
  `${callsign}’s row changed while it was open, so nothing was saved. Open it again.`

/* why a line's buttons (or its Plan alone) are greyed — the words under it — or the line Plan picked carries */
/* (`rolePick` — the role picked in his row's box, not yet saved: a form's value, never the signed-in person's authority) */
export function lineState(p: { hasSignIn: boolean; unit: string; now: AccessLine; pick: AccessLine; rolePick: RolePick }): {
  locked: boolean; planOff: boolean; note: string | null
} {
  const n = numOf(p.unit)
  if (!p.hasSignIn) return { locked: true, planOff: true, note: 'Give him a sign-in first to give access.' }
  if (!adminOfUnit(p.unit)) return { locked: true, planOff: true, note: `Only an admin of ${n} can give access to ${n}.` }
  const master = actorIsMaster()
  /* Plan is a master admin's to give, change or take (PA1): held today, a plain admin cannot move the line at all */
  if (!master && p.now === 'plan') return { locked: true, planOff: true, note: 'Only a master admin gives Plan.' }
  if (p.rolePick === 'main') return { locked: false, planOff: true, note: 'Plan is for admins only.' }
  if (!master) return { locked: false, planOff: true, note: 'Only a master admin gives Plan.' }
  if (p.pick === 'plan') return { locked: false, planOff: false, note: `Full access to ${n}, every page: its schedule and publishing, its settings, its people and their sign-ins.` }
  return { locked: false, planOff: false, note: null }
}
