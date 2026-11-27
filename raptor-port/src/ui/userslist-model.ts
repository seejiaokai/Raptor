/* ADMIN → USERS BY SQUADRON — WHO IS ON THE LIST (batch 1's second half, plan §4 item 1 — 7a, R-O4, R3, 5b; O3). Pure
   reads, no screen: Admin → Users (ui/UsersPanel.tsx) draws what this answers for the page's squadron
   (`pageUnit('own')` — his own, or the squadron picked for a master admin or a Plan holder of it).

   - `own` — the squadron's people on the roster that day (engine/roster.ts rosterOf — the one walk), A to Z; the
     heading counts these only;
   - `planners` — men of other squadrons holding Plan of it that day (6b's "· also plans 149"; the filter's "Plans 149"
     tick finds them — R-O4): a Plan holder's row opens as R3 does, only that squadron's line his to change;
   - `archived` — its archived men (the Archived group);
   - `found` — with a search only: men of other squadrons it matches, on the roster, not already listed (5b — to give
     him View), his row showing his squadron, the rest of it read only.
   A search (a callsign or a sign-in name, anywhere in it) narrows every group. The placeholders and the deleted are on
   no list. Every squadron's people are read through rosterOf, squadron by squadron, so no walk of the whole people
   list stands here (engine/roster-readers.test.ts). */
import { PEOPLE } from '../engine/people'
import { rosterOf } from '../engine/roster'
import { accountOfPid, levelAcct, ACCOUNTS_LIST } from '../state/accounts'
import { units, grantOfOn } from '../state/units'

export interface UsersList { own: string[]; planners: string[]; archived: string[]; found: string[]; count: number }

const P = (pid: string): any => (PEOPLE as any)[pid]
const listable = (pid: string): boolean => { const p = P(pid); return !!p && !p.special && !p.deleted }
const byCs = (x: string, y: string) => String(P(x).cs).localeCompare(String(P(y).cs))

export function usersListOf(unit: string, iso: string, query: string): UsersList {
  const q = String(query ?? '').trim().toLowerCase()
  const matches = (pid: string): boolean => {
    if (!q) return true
    const a = accountOfPid(pid)
    return String(P(pid).cs).toLowerCase().includes(q) || (!!a && a.name.includes(q))
  }
  const mine = rosterOf(unit, iso).filter(listable)
  const onRoster = mine.filter(pid => !P(pid).archived)
  const listed = new Set(mine)
  /* Plan of this squadron, holding that day — an account's own right (Plan is 'admin' in the rows), on a man of another
     squadron still on the roster */
  const planners = ACCOUNTS_LIST
    .filter(a => !listed.has(a.pid) && listable(a.pid) && !P(a.pid).archived && grantOfOn(levelAcct(a), unit, iso)?.level === 'admin')
    .map(a => a.pid)
  for (const pid of planners) listed.add(pid)
  const found = q
    ? units().filter(u => u.id !== unit).flatMap(u => rosterOf(u.id, iso))
      .filter(pid => !listed.has(pid) && listable(pid) && !P(pid).archived && matches(pid))
    : []
  return {
    own: onRoster.filter(matches).sort(byCs),
    planners: [...new Set(planners)].filter(matches).sort(byCs),
    archived: mine.filter(pid => P(pid).archived).filter(matches).sort(byCs),
    found: [...new Set(found)].sort(byCs),
    count: onRoster.length,
  }
}
/* DOES HE HAVE A ROW ON THIS SQUADRON'S ADMIN → USERS THAT DAY (U2 fix round 1, fix 7 — opus1 F3, opus2 F3, Astra 4): one
   of its own people (on the roster or archived), or a man of another squadron holding Plan of it — the panel's own list
   above, with no search, never a copy of its rule. A tap on a squadron's Plan line about a man with none opens nothing
   (ui/topstate.ts planLine — D1691's road). Until U3 and U5 add their folds, a View holder of it has no row. */
export function hasUsersRow(unit: string, iso: string, pid: string): boolean {
  const l = usersListOf(unit, iso, '')
  return l.own.includes(pid) || l.planners.includes(pid) || l.archived.includes(pid)
}
