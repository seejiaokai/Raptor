/* ADMIN → USERS — A PERSON'S ACCESS, THE READS BEHIND HIS OPENED ROW (pure reads, no screen; ui/UserAccess.tsx draws them —
   his D2303 design B, D2306, D2320, D2336, D2211; pictures rB1–rB4, p2a, p2b). Kept apart from the screen file so it
   hands out screen parts alone (the code check's only-export-components). */
import { ACCOUNTS_LIST, levelAcct, type Account, type AccountRole, type AccessLine } from '../state/accounts'
import { units, unitById, grantOfOn, homeOn, todayIso } from '../state/units'
import { adminOfUnit } from '../state/perms'
import { SESSION } from '../state/auth'

export type RolePick = AccountRole | 'master'
export const numOf = (u: string): string => String(unitById(u)?.num ?? u)
export const byNum = (a: string, b: string) => numOf(a).localeCompare(numOf(b), undefined, { numeric: true })
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

/* "· also plans 149" — the squadrons other than his home that his account holds Plan of today, by number */
export function alsoPlansOf(a: Account | undefined, pid: string, iso: string = todayIso()): string | null {
  if (!a || a.master) return null
  const home = homeOn(pid, iso)
  const us = units().map(u => u.id).filter(u => u !== home && grantOfOn(levelAcct(a), u, iso)?.level === 'admin').sort(byNum)
  return us.length ? `also plans ${us.map(numOf).join(', ')}` : null
}

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
