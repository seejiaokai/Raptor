/* ADMIN → USERS — the accounts ([ACCOUNTS], 26 Sep 26). Replaces the old "Manage users"
   list, which drove nothing (the two logins were hard-coded).

   Owner, D166 (1): the Admin tab creates and manages accounts — a sign-in name (which
   stands for the defence mail address), admin or member, and the CALLSIGN it belongs to;
   an admin creates new admins and members. D204: a new user joins either way — added
   here first, or he asks and is approved here (a typed callsign never claims a puck by
   itself: the admin picks it); the admin changes the role or the puck, or switches the
   account off, later; and an admin switch, OFF by default, lets people waiting see the
   programme read-only as a guest.

   Four blocks: WAITING FOR ACCESS (each request, Approve → pick the puck and the role /
   Decline), ACCOUNTS (every account; tap one to change it — never your own), ADD AN
   ACCOUNT, and GUEST VIEW. Every write goes through state/accounts.ts, which checks
   the permission itself and says why when it refuses; this panel only asks and toasts.
   The words read as the database-era app will (25 Aug 26); the prototype truths — the
   sign-in name only STANDS FOR the defence mail address, and IT ties the real address
   at the database step (D165) — live in state/accounts.ts, not on screen. */
import { useState } from 'react'
import { PEOPLE } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { elogWhen } from '../engine/editlog'
import {
  ACCOUNTS_LIST, ACCESS_REQS, GUESTVIEW, accountCallsign, linkablePeople, addAccount, updateAccount,
  approveRequest, declineRequest, setGuestView, isAdminAccount, MAX_SIGNIN, type Account, type AccountRole,
} from '../state/accounts'
import { SESSION } from '../state/auth'
import { me } from '../state/perms'
import { notify } from '../state/store'

const cs = (pid: string) => ((PEOPLE as any)[pid] ? String((PEOPLE as any)[pid].cs) : '')
function PuckSelect(p: { id: string; value: string; keep?: string; onChange: (v: string) => void }) {
  const opts = linkablePeople(p.keep)
  return (
    <select id={p.id} value={p.value} aria-label="The callsign this account belongs to" onChange={e => p.onChange(e.target.value)}>
      <option value="">Pick a callsign…</option>
      {opts.map(id => <option key={id} value={id}>{cs(id)}</option>)}
    </select>
  )
}
function RoleSelect(p: { id: string; value: AccountRole; onChange: (v: AccountRole) => void }) {
  return (
    <select id={p.id} value={p.value} aria-label="Member or admin" onChange={e => p.onChange(e.target.value as AccountRole)}>
      <option value="main">Member — own inputs, quals and bids</option>
      <option value="admin">Admin — schedules and manages</option>
    </select>
  )
}
const done = (bad: string | null, ok: string) => { if (bad) HOOKS.toast(bad, 'warn'); else HOOKS.toast(ok); notify(); return !bad }

function Waiting() {
  const [open, setOpen] = useState<string | null>(null)
  const [pid, setPid] = useState('')
  const [role, setRole] = useState<AccountRole>('main')
  if (!ACCESS_REQS.length) return <p className="adm-note" id="admNoWaiting">Nobody is waiting for access.</p>
  return (
    <div className="acc-list" id="admWaiting">
      {ACCESS_REQS.map(r => (
        <div className="acc-row req" key={r.id} data-req={r.id}>
          <div className="acc-main">
            <span className="acc-name">{r.name}</span>
            <span className="acc-sub">asked as <b>{r.cs}</b> · {r.full} · {elogWhen(r.at)}</span>
          </div>
          {open !== r.id
            ? <div className="acc-acts">
                <button className="abtn primary" data-approve={r.id} onClick={() => { setOpen(r.id); setPid(''); setRole('main') }}>Approve</button>
                <button className="abtn" data-decline={r.id} onClick={() => done(declineRequest(r.id), `Declined ${r.name}`)}>Decline</button>
              </div>
            : <div className="acc-edit" data-approving={r.id}>
                <div className="mfield"><label htmlFor="apvPid">Callsign</label>
                  <PuckSelect id="apvPid" value={pid} onChange={setPid} /></div>
                <p className="adm-note">They typed “{r.cs}”. Not on the roster? Add them on the Quals page first.</p>
                <div className="mfield"><label htmlFor="apvRole">Role</label>
                  <RoleSelect id="apvRole" value={role} onChange={setRole} /></div>
                <div className="acc-acts">
                  <button className="abtn primary" id="apvGo" onClick={() => { if (done(approveRequest(r.id, pid, role), `${r.name} can sign in now`)) setOpen(null) }}>Give access</button>
                  <button className="abtn" id="apvCancel" onClick={() => setOpen(null)}>Cancel</button>
                </div>
              </div>}
        </div>
      ))}
    </div>
  )
}

function AccountRow(p: { a: Account; editing: boolean; onEdit: () => void; onClose: () => void }) {
  const { a } = p
  const person = (PEOPLE as any)[a.pid]
  const own = (SESSION && SESSION.user === a.id) || (me() != null && a.pid === me())
  const [name, setName] = useState(a.name)
  const [pid, setPid] = useState(a.pid)
  const [role, setRole] = useState<AccountRole>(a.role)
  const save = () => {
    const patch: any = {}
    if (name !== a.name) patch.name = name
    if (pid !== a.pid) patch.pid = pid
    if (role !== a.role) patch.role = role
    if (!Object.keys(patch).length) return p.onClose()
    if (done(updateAccount(a.id, patch), 'Account saved')) p.onClose()
  }
  return (
    <div className={'acc-row' + (a.on ? '' : ' off')} data-acct={a.id}>
      <button className="acc-main acc-tap" disabled={own} onClick={p.onEdit}
        title={own ? 'Your own account — another admin can change it' : 'Change this account'}>
        <span className="acc-name">{a.name}</span>
        <span className="acc-sub">
          <b>{accountCallsign(a) || 'no callsign'}</b>
          {person && person.archived && <span className="acc-tag" title="This callsign has been archived — switch the account off if they have left">archived callsign</span>}
          {!a.on && <span className="acc-tag">switched off</span>}
          {own && <span className="acc-tag you">you</span>}
        </span>
      </button>
      <span className={'ub ' + a.role}>{isAdminAccount(a) ? 'Admin' : 'Member'}</span>
      {p.editing && !own && <div className="acc-edit" data-editing={a.id}>
        <div className="mfield"><label htmlFor="accEdName">Sign-in (defence mail)</label>
          <input id="accEdName" value={name} maxLength={MAX_SIGNIN} onChange={e => setName(e.target.value)} /></div>
        <div className="mfield"><label htmlFor="accEdPid">Callsign</label>
          <PuckSelect id="accEdPid" value={pid} keep={a.pid} onChange={setPid} /></div>
        <div className="mfield"><label htmlFor="accEdRole">Role</label>
          <RoleSelect id="accEdRole" value={role} onChange={setRole} /></div>
        <div className="acc-acts">
          <button className="abtn primary" id="accEdSave" onClick={save}>Save</button>
          <button className="abtn" id="accEdOnOff" onClick={() => { if (done(updateAccount(a.id, { on: !a.on }), a.on ? `${a.name} switched off` : `${a.name} switched on`)) p.onClose() }}>{a.on ? 'Switch off' : 'Switch on'}</button>
          <button className="abtn" id="accEdCancel" onClick={p.onClose}>Cancel</button>
        </div>
      </div>}
    </div>
  )
}

export function UsersPanel() {
  const [editing, setEditing] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [pid, setPid] = useState('')
  const [role, setRole] = useState<AccountRole>('main')
  const add = () => {
    if (done(addAccount(name, pid, role), `${name.trim().toLowerCase()} can sign in now`)) { setName(''); setPid(''); setRole('main') }
  }
  const list = ACCOUNTS_LIST.slice().sort((x, y) => accountCallsign(x).localeCompare(accountCallsign(y)))
  return (
    <>
      <h4 className="adm-sub">Waiting for access</h4>
      <Waiting />
      <hr className="adm-sep" />
      <h4 className="adm-sub">Accounts</h4>
      <div className="acc-list" id="accList">
        {list.map(a => <AccountRow key={a.id + (editing === a.id ? ':e' : '')} a={a} editing={editing === a.id}
          onEdit={() => setEditing(editing === a.id ? null : a.id)} onClose={() => setEditing(null)} />)}
      </div>
      <hr className="adm-sep" />
      <h4 className="adm-sub">Add an account</h4>
      <div className="mfield"><label htmlFor="accAddName">Sign-in (defence mail)</label>
        <input id="accAddName" placeholder="name@mail" maxLength={MAX_SIGNIN} value={name} onChange={e => setName(e.target.value)} /></div>
      <div className="mfield"><label htmlFor="accAddPid">Callsign</label>
        <PuckSelect id="accAddPid" value={pid} onChange={setPid} /></div>
      <div className="mfield"><label htmlFor="accAddRole">Role</label>
        <RoleSelect id="accAddRole" value={role} onChange={setRole} /></div>
      <button className="abtn primary" id="accAdd" style={{ width: '100%' }} onClick={add}>Add account</button>
      <p className="adm-note">Each person has one account, tied to their callsign. They sign in with their defence mail.</p>
      <hr className="adm-sep" />
      <h4 className="adm-sub">Guest view</h4>
      <label className="acc-switch">
        <input type="checkbox" id="admGuestView" checked={GUESTVIEW}
          onChange={e => done(setGuestView(e.target.checked), e.target.checked ? 'People waiting can now view the schedule' : 'Guest view is off')} />
        <span>Let people waiting for access view the schedule (read only)</span>
      </label>
    </>
  )
}
