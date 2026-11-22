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
   The reads behind it — each line's state and words, his lines today, "also plans" — are ui/useraccess-model.ts.
   The row's Save sends every change of these at once through the one door, state/accounts.ts saveAccess — one command,
   one Undo step; the door and the commit gate judge each part again. */
import type { AccessLine } from '../state/accounts'
import { units, homeOn, todayIso } from '../state/units'
import { numOf, byNum, lineState, type RolePick } from './useraccess-model'

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
