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
   - Under the lines, "▸ What each role allows" — the roles table (D2302, D2305; `RolesFold`, its cells ui/rolestable.ts).
   The reads behind it — each line's state and words, his lines today, "also plans" — are ui/useraccess-model.ts.
   The row's Save sends every change of these at once through the one door, state/accounts.ts saveAccess — one command,
   one Undo step; the door and the commit gate judge each part again. */
import type { AccessLine } from '../state/accounts'
import { units, homeOn, todayIso } from '../state/units'
import { numOf, lineState, type RolePick } from './useraccess-model'
import { inSquadronOrder } from '../state/perms'
import { ROLES_TABLE, ROLES_LABEL, ROLES_KEY, ROLES_NOTES, TABLE_ROLES, ROLE_HEADS, MARK_WORD } from './rolestable'

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
/* the squadron lines under Sign-in and Role. `only` — the one squadron to draw: another squadron's man on this squadron's
   page shows this page's squadron's line alone (his D2625, D2655 D5 — UsersPanel's short row); each line's state is
   lineState's, unchanged */
export function SquadronLines(p: {
  pid: string; hasSignIn: boolean; rolePick: RolePick; now: Record<string, AccessLine>; pick: Record<string, AccessLine>
  onPick: (unit: string, v: AccessLine) => void; only?: string
}) {
  const home = homeOn(p.pid, todayIso())
  /* (the signed-in person's home first, then by number — the one order, his D2730 Q1; `home` above is the opened man's,
     which only marks his "Home squadron" line) */
  const all = p.only ? [p.only] : inSquadronOrder(units().map(u => u.id))
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
/* "▸ What each role allows" (D2302, D2305 — picture k2; the drawing draw-roles.mjs): under the squadron lines, closed, in
   the Logic page's "How it works" fold look (an accent ▸ summary, 12px lines); inside, the label, the grid of eight
   pages × five roles, the key and the five notes. Its cells and words are ui/rolestable.ts — one table, held to the app
   by ui/rolestable.test.tsx. A native <details>: it opens and closes from the keys (Enter, Space) by itself. */
export function RolesFold() {
  return (
    <details className="acc-roles" data-testid="acc-roles">
      <summary>What each role allows</summary>
      <p className="acc-rt-lab">{ROLES_LABEL}</p>
      <table className="acc-rt">
        <thead>
          <tr><td />{TABLE_ROLES.map(r => <th key={r} scope="col">{ROLE_HEADS[r]}</th>)}</tr>
        </thead>
        <tbody>
          {ROLES_TABLE.map(r => (
            <tr key={r.page} data-page={r.page}>
              <th scope="row">{r.name}</th>
              {TABLE_ROLES.map(k => {
                const cell = r.cells[k]
                return <td key={k} className={cell.mark === 'yes' ? 'y' : cell.mark === 'read' ? 'r' : 'n'} data-role={k}>
                  {MARK_WORD[cell.mark]}{cell.note && <sup>{cell.note}</sup>}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="acc-rt-key">{ROLES_KEY}</p>
      <ol className="acc-rt-notes">{ROLES_NOTES.map(t => <li key={t}>{t}</li>)}</ol>
    </details>
  )
}
function SqLine(p: { n: string; unit: string; note?: string | null; children: React.ReactNode }) {
  return <>
    <span className="acc-sq-n" data-unit={p.unit}>{p.n}</span>
    {p.children}
    {p.note && <p className="adm-note acc-sq-note" data-note-unit={p.unit}>{p.note}</p>}
  </>
}
