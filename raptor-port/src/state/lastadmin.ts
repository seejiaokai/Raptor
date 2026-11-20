/* ONE LAST-ADMIN RULE (the reshape plan §5.2, Piece C — D2184 Q10, D2217 Q15, D2246). Six bodies used to answer "would
   this step leave a squadron with no admin?" each its own way — the doors on today alone, the gate on every date, the
   rights and "+ New squadron" not at all — so a correct refusal reached the screen as "That did not save" (B3) and a
   squadron could be made, or left, with no admin (B6). This is the one body: pure, over the rows and accounts a step
   leaves against the ones it found; every door (accounts.ts, units.ts) and the commit gate (perms.ts lastAdminViolation)
   ask it, so the door's words and the gate's verdict are the same answer. Words are the caller's (accounts.ts lockWords).

   - THE DATES: today, and every home row's and every right's `from` from today on, either side — a right ends only on a
     home change (units-model.ts grantOn), so no other day can change who counts.
   - WHO COUNTS: an account that can sign in — admin role, switched on, its man on the roster (never deleted, archived or a
     placeholder). A master admin counts as an admin AT HOME in his own squadron, never as a Plan holder (Opus L1).
   - THE RULE, per squadron and date: where the squadron has an admin at home before, it keeps one at home after; where it
     has none at home but a (non-master) Plan holder, it keeps an admin at home or a Plan holder (Opus L4 — the first admin
     moving into his new squadron passes). A Plan holder is one whose LEVEL there that day is admin by a right — read
     through levelFrom, so a Plan sign-in re-linked to a member counts as the member he is (Opus L5). A squadron NEW in
     this step needs one of either on every judged date (Opus M4, B6); a squadron the step removes whole is not judged (the
     Undo of "+ New squadron" — Fable F7, Opus M3); 'app' when the whole app is left with no admin who can sign in. */
import { homeUnitOn, homeChangesIn, levelFrom, unitIn, isAdminRole, type UnitRows, type LevelAccount } from './units-model'

export interface LockAccount { id: string; pid: unknown; pidFrom?: string; role: string; on?: boolean; master?: boolean }
export interface LockWorld {
  rowsB: UnitRows; rowsA: UnitRows
  acctB: readonly LockAccount[]; acctA: readonly LockAccount[]
  personB: (pid: string) => any; personA: (pid: string) => any
  today: string; fallback: string | null
}
/* the squadron left with none, the first date it is, the account the step took from it (an id — the account the step
   found), and, on a later date, the man whose saved move makes that the day (never the one taken) */
export interface LockHit { unit: string; date: string; gone: string | null; cause: { pid: string; to: string | null } | null }
export type LockBreach = 'app' | LockHit

const onRoster = (p: any): boolean => !!p && !p.special && !p.deleted && !p.archived
const asLevel = (x: LockAccount): LevelAccount => ({ id: x.id, pid: String(x.pid), pidFrom: x.pidFrom, role: x.role, master: x.master === true })

export function lastAdminBreach(w: LockWorld): LockBreach | null {
  const able = (l: readonly LockAccount[], person: (pid: string) => any) =>
    l.filter(x => isAdminRole(x) && x.on !== false && x.pid != null && onRoster(person(String(x.pid))))
  const ableB = able(w.acctB, w.personB), ableA = able(w.acctA, w.personA)
  if (ableB.length && !ableA.length) return 'app'
  const home = (x: LockAccount, u: string, d: string, r: UnitRows) => homeUnitOn(r, String(x.pid), d, w.fallback) === u
  const plan = (x: LockAccount, u: string, d: string, r: UnitRows) =>
    x.master !== true && !home(x, u, d, r) && levelFrom(asLevel(x), u, d, r, w.fallback) === 'admin'
  const dates = new Set<string>([w.today])
  for (const r of [w.rowsB, w.rowsA]) {
    for (const h of r.homes) if (typeof h.from === 'string' && h.from > w.today) dates.add(h.from)
    for (const g of r.grants) if (typeof g.from === 'string' && g.from > w.today) dates.add(g.from)
  }
  const days = [...dates].sort()
  for (let i = 0; i < days.length; i++) {
    const d = days[i]!
    for (const u of w.rowsA.units) {
      const made = !unitIn(w.rowsB, u.id)
      const homeB = made ? [] : ableB.filter(x => home(x, u.id, d, w.rowsB))
      const planB = made || homeB.length ? [] : ableB.filter(x => plan(x, u.id, d, w.rowsB))
      if (!made && !homeB.length && !planB.length) continue
      const homeA = ableA.filter(x => home(x, u.id, d, w.rowsA))
      if (homeA.length) continue
      if (!homeB.length && ableA.some(x => plan(x, u.id, d, w.rowsA))) continue
      /* left with none on `d`: who it was (one the step took), and — on a later date — whose move makes it that day */
      const counted = homeB.length ? homeB : planB
      const kept = (x: LockAccount) => ableA.some(y => y.id === x.id && (homeB.length ? home(y, u.id, d, w.rowsA) : home(y, u.id, d, w.rowsA) || plan(y, u.id, d, w.rowsA)))
      const gone = counted.find(x => !kept(x)) ?? null
      let cause: LockHit['cause'] = null
      if (i > 0) {
        const prev = days[i - 1]!
        const was = (y: LockAccount) => home(y, u.id, prev, w.rowsA) || (!homeB.length && plan(y, u.id, prev, w.rowsA))
        const mover = ableA.find(y => y.id !== gone?.id && String(y.pid) !== String(gone?.pid) && was(y)
          && homeChangesIn(w.rowsA, String(y.pid), prev, d, w.fallback).includes(d))
        if (mover) cause = { pid: String(mover.pid), to: homeUnitOn(w.rowsA, String(mover.pid), d, w.fallback) }
      }
      return { unit: u.id, date: d, gone: gone ? gone.id : null, cause }
    }
  }
  return null
}
