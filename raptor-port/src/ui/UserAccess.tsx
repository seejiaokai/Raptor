/* ADMIN → USERS — A PERSON'S ACCESS ON HIS OPENED ROW (batch 1's second half §4 items 3–5; his D2303 — design B, pictures
   R1–R5, docs/mock/2026-11-22-msq-b1-screens/img/rB1–rB4; D2305 the Role box's short words; D2306 "Plan is for admins
   only."; D2336 "Only an admin of 149 can give access to 149."; D2320 no sign-in, no access; D2211 Plan's line).
   - The Role box: Member, Admin, Master admin — "Master admin" greyed for anyone but a master admin.
   - Under the Sign-in and Role fields, one line per squadron in the store, by number, the number in the field labels'
     look: his home "142 Home squadron"; every other "149 None · View · Plan" (the editor's own segmented buttons); for a
     master admin (or Master admin picked) "Full access", no buttons (R4). A line's buttons greyed, with one grey line
     under them, where it is not his to change: no sign-in (D2320); not an admin of that squadron (D2336); Plan only a
     master admin's to give (picture rB2), and only on an admin (D2306). Plan picked: what it gives (D2211).
   - "· also plans 149" at the end of a Plan holder's grey line (pictures p2a, p2b).
   The row's Save sends every change of these at once through the one door, state/accounts.ts saveAccess — one command,
   one Undo step; the door and the commit gate judge each part again. */
import { ACCOUNTS_LIST, levelAcct, type Account, type AccountRole, type AccessLine } from '../state/accounts'
import { units, unitById, grantOfOn, homeOn, todayIso } from '../state/units'
import { adminOfUnit } from '../state/perms'
import { SESSION } from '../state/auth'

export type RolePick = AccountRole | 'master'
const numOf = (u: string): string => String(unitById(u)?.num ?? u)
const byNum = (a: string, b: string) => numOf(a).localeCompare(numOf(b), undefined, { numeric: true })
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

export function RoleBox(p: { id: string; value: RolePick; disabled?: boolean; masterOff?: boolean; onChange: (v: RolePick) => void }) {
  return (
    <select id={p.id} value={p.value} disabled={p.disabled} aria-label="Role" onChange={e => p.onChange(e.target.value as RolePick)}>
      <option value="main">Member</option>
      <option value="admin">Admin</option>
      <option value="master" disabled={p.masterOff}>Master admin</option>
    </select>
  )
}

const WORD: Record<AccessLine, string> = { none: 'None', view: 'View', plan: 'Plan' }
/* the squadron lines under Sign-in and Role */
export function SquadronLines(p: {
  pid: string; hasSignIn: boolean; rolePick: RolePick; now: Record<string, AccessLine>; pick: Record<string, AccessLine>
  onPick: (unit: string, v: AccessLine) => void
}) {
  const home = homeOn(p.pid, todayIso())
  const all = units().map(u => u.id).sort(byNum)
  return (
    <div className="acc-sq" data-testid="acc-sq">
      {all.map(u => {
        const n = numOf(u)
        if (u === home) return <SqLine key={u} n={n} unit={u}><div className="acc-sq-home">Home squadron</div></SqLine>
        if (p.rolePick === 'master') return <SqLine key={u} n={n} unit={u}><div className="acc-sq-home">Full access</div></SqLine>
        const pick = p.pick[u] ?? 'none'
        const st = lineState({ hasSignIn: p.hasSignIn, unit: u, now: p.now[u] ?? 'none', pick, rolePick: p.rolePick })
        return (
          <SqLine key={u} n={n} unit={u} note={st.note}>
            <div className="acc-acts acc-mode" role="group" aria-label={`Access to ${n}`}>
              {(['none', 'view', 'plan'] as const).map(v => (
                <button key={v} type="button" className={'abtn' + (pick === v ? ' primary' : '')} aria-pressed={pick === v}
                  data-line={v} disabled={st.locked || (v === 'plan' && st.planOff)} onClick={() => p.onPick(u, v)}>{WORD[v]}</button>
              ))}
            </div>
          </SqLine>
        )
      })}
    </div>
  )
}
function SqLine(p: { n: string; unit: string; note?: string | null; children: React.ReactNode }) {
  return <>
    <span className="acc-sq-n" data-unit={p.unit}>{p.n}</span>
    {p.children}
    {p.note && <p className="adm-note acc-sq-note" data-note-unit={p.unit}>{p.note}</p>}
  </>
}
