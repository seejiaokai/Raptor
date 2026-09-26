/* ADMIN → USERS — the accounts ([ACCOUNTS], 26 Sep 26). Replaces the old "Manage users"
   list, which drove nothing (the two logins were hard-coded).

   Owner, D166 (1): the Admin tab creates and manages accounts — a sign-in name (which
   stands for the defence mail address), admin or member, and the CALLSIGN it belongs to;
   an admin creates new admins and members. D204: a new user joins either way — added
   here first, or he asks and is approved here (a typed callsign never claims a puck by
   itself: the admin picks it); the admin changes the role or the puck, or switches the
   account off, later; and an admin switch, OFF by default, lets people waiting see the
   programme read-only as a guest.

   [ACCOUNTS-NEW-PERSON] (26 Sep 26): THE ONE DOOR FOR A NEW PERSON (D217 — Quals' own form
   is retired; its "+ Add person" comes here). Adding and approving each offer PERSON —
   "On the roster" (link someone already on Quals) or "New person" (D214: callsign/name,
   initials, pilot / WSO / personnel, CAT — his Quals row and his account made together, in
   one step; a blank sign-in makes a roster-only person, someone who won't use the app).
   Approving with New person is filled from what he gave when he signed up. The words:
   "Callsign/Name" (D219), "Pilot" / "WSO" / "Personnel (ground crew)" (D220); a name over
   14 letters is said, never cut (D226); initials never required (D225). The admins' bell
   (D216, D227) goes out for an admin once THIS list has been on his screen (`shown`, from
   the Admin page — on a phone, drilled in).

   Four blocks: WAITING FOR ACCESS, ACCOUNTS (tap one to change it — never your own), ADD AN
   ACCOUNT, and GUEST VIEW. Every write goes through state/accounts.ts (and the one add,
   state/roster-add.ts), which checks the permission itself and says why when it refuses;
   this panel only asks and toasts. The words read as the database-era app will (25 Aug
   26); the prototype truths — the sign-in name only STANDS FOR the defence mail address,
   and IT ties the real address at the database step (D165) — live in state/accounts.ts,
   not on screen. */
import { useEffect, useRef, useState } from 'react'
import { PEOPLE, nameToId, archivedHolders } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { elogWhen } from '../engine/editlog'
import {
  ACCOUNTS_LIST, ACCESS_REQS, GUESTVIEW, accountCallsign, accountOfPid, linkablePeople, addAccount, updateAccount,
  approveRequest, approveRequestNew, addPersonAndAccount, declineRequest, setGuestView, isAdminAccount,
  requestSummary, accessAlert, markRequestsSeen, MAX_SIGNIN, type Account, type AccountRole, type AccessRequest,
} from '../state/accounts'
import { SEATS, catsFor, MAX_CS, MAX_INITIALS, CALLSIGN_LABEL, CS_TOO_LONG, type NewPerson } from '../state/roster-add'
import { SESSION } from '../state/auth'
import { me } from '../state/perms'
import { notify } from '../state/store'

const cs = (pid: string) => ((PEOPLE as any)[pid] ? String((PEOPLE as any)[pid].cs) : '')
function PuckSelect(p: { id: string; value: string; keep?: string; onChange: (v: string) => void }) {
  const opts = linkablePeople(p.keep)
  return (
    <select id={p.id} value={p.value} aria-label="The callsign or name this account belongs to" onChange={e => p.onChange(e.target.value)}>
      <option value="">Pick a callsign or name…</option>
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

/* PERSON — "On the roster" | "New person" (the approved mock-up's segmented pair) */
type Mode = 'roster' | 'new'
function PersonChoice(p: { idp: string; mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <>
      <div className="mfield"><label>Person</label></div>
      <div className="acc-acts acc-mode" role="group" aria-label="Someone on the roster, or a new person">
        <button type="button" id={`${p.idp}ModeRoster`} className={'abtn' + (p.mode === 'roster' ? ' primary' : '')}
          aria-pressed={p.mode === 'roster'} onClick={() => p.onChange('roster')}>On the roster</button>
        <button type="button" id={`${p.idp}ModeNew`} className={'abtn' + (p.mode === 'new' ? ' primary' : '')}
          aria-pressed={p.mode === 'new'} onClick={() => p.onChange('new')}>New person</button>
      </div>
    </>
  )
}
/* the four New person fields in two columns — the SAME fields the sign-up card asks (D214) */
function PersonFields(p: { idp: string; np: NewPerson; onChange: (np: NewPerson) => void; csRef?: React.Ref<HTMLInputElement> }) {
  const { np } = p
  const set = (patch: Partial<NewPerson>) => p.onChange({ ...np, ...patch })
  return (
    <>
      <div className="adm-2col">
        <div className="mfield"><label htmlFor={`${p.idp}Cs`}>{CALLSIGN_LABEL}</label>
          {/* no maxLength (D226): a longer name is said, never quietly cut */}
          <input id={`${p.idp}Cs`} ref={p.csRef} autoComplete="off" value={np.cs} onChange={e => set({ cs: e.target.value })} />
          {np.cs.trim().length > MAX_CS && <span className="cs-long" id={`${p.idp}CsLong`}>{CS_TOO_LONG}</span>}</div>
        <div className="mfield"><label htmlFor={`${p.idp}Ini`}>Initials</label>
          <input id={`${p.idp}Ini`} autoComplete="off" maxLength={MAX_INITIALS} value={np.ini} onChange={e => set({ ini: e.target.value })} /></div>
      </div>
      <div className="adm-2col">
        <div className="mfield"><label htmlFor={`${p.idp}Seat`}>Pilot, WSO or personnel</label>
          <select id={`${p.idp}Seat`} value={np.seat}
            onChange={e => { const v = e.target.value; set({ seat: v, cat: catsFor(v).includes(np.cat) ? np.cat : '' }) }}>
            <option value="">Pick…</option>
            {SEATS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select></div>
        {/* personnel hold no CAT (26 Aug 26) */}
        <div className="mfield"><label htmlFor={`${p.idp}Cat`}>CAT</label>
          {np.seat === 'GND'
            ? <select id={`${p.idp}Cat`} disabled value=""><option value="">None — personnel</option></select>
            : <select id={`${p.idp}Cat`} value={np.cat} onChange={e => set({ cat: e.target.value })}>
                <option value="">Pick…</option>
                {(np.seat ? catsFor(np.seat) : []).map(k => <option key={k} value={k}>{k}</option>)}
              </select>}</div>
      </div>
    </>
  )
}

/* what a request's typed callsign matches on the roster, for the approve form's default and
   its note — named by the matched person's CALLSIGN, never an id (Fable F14); a placeholder
   (ALL / ALL AVAIL) is nobody to link, so it opens New person, which refuses it as taken.
   A person who ALREADY HAS AN ACCOUNT is not in the picker (one account per person, D166),
   so the note says so instead of asking the admin to pick him (Fable's code read #1) — it
   does not claim the asker is someone else: it names both ways out (him on a new sign-in —
   renaming his account's sign-in answers this request, accounts.ts updateAccount — or
   someone else). The account is checked BEFORE archived: posting out archives a man and
   keeps his account, and "restore to link" could never end in a link (Fable's and Astra's
   fix checks #1 — restoring also wipes his posting-out window) */
const SOMEONE_ELSE = 'If it is someone else, choose New person and give them another callsign or name.'
/* the signed-in admin's OWN account — its row cannot be opened (another admin changes it) */
const isOwnAccount = (a: Account) => !!(SESSION && SESSION.user === a.id) || (me() != null && a.pid === me())
function rosterMatch(r: AccessRequest): { pid: string; note: string } | null {
  /* a typed callsign finds the man ON THE ROSTER only ([POST-OUT-OUTCOMES], D286 (2)) — an
     archived man's callsign is free, so a request under it opens on New person (archivedNote) */
  const hit = r.cs ? nameToId(r.cs) : undefined
  const p = hit && (PEOPLE as any)[hit]
  /* an archived man is reached only by a typed bare id (nameToId's id tolerance) — never picked here either */
  if (!hit || !p || p.special || p.archived) return null
  const same = String(p.cs).toLowerCase() === r.cs.trim().toLowerCase()
  const acct = accountOfPid(hit)
  if (acct) {
    /* the "it is him" door, said so it can be used: his OWN account's row is locked to him
       (Astra's second fix check) */
    const him = isOwnAccount(acct)
      ? "It is your own account: if it is you on a new sign-in, another admin must change its sign-in under Accounts — you can't change your own."
      : `If it is them on a new sign-in, change that account's sign-in under Accounts — that answers this request.`
    return { pid: hit, note: `He typed ${r.cs} — ${same ? `${p.cs} already has` : `that is ${p.cs}, who already has`} an account (${acct.name}), so they can't be picked here. ${him} ${SOMEONE_ELSE}` }
  }
  return { pid: hit, note: same ? `He typed ${r.cs} — ${p.cs} is on the roster. Pick them if this is them.`
    : `He typed ${r.cs} — that is ${p.cs}. Pick them if this is them.` }
}
/* D286 reading (5) (26 Sep 26), in D300's few words: a request whose callsign only an ARCHIVED man holds opens on New
   person, saying so — "An archived man is already Ace — this makes a new person." When that archived man has an account
   (an overseas man, suspended), the way it is HIM on a new sign-in is named too, so he is not made twice. */
function archivedNote(r: AccessRequest): string | null {
  const held = r.cs ? archivedHolders(r.cs) : []
  if (!held.length) return null
  const acct = held.map(id => accountOfPid(id)).find(Boolean)
  return `An archived man is already ${r.cs.trim()} — this makes a new person.`
    + (acct ? ` If it is him, change his account's sign-in (${acct.name}) instead.` : '')
}

/* one open approve form's state — started afresh from the request at every Approve (Cancel
   discards edits); switching On the roster ↔ New person keeps what each half holds */
interface Approving { id: string; mode: Mode; np: NewPerson; pid: string; role: AccountRole }
function startApprove(r: AccessRequest): Approving {
  return {
    id: r.id, mode: rosterMatch(r) ? 'roster' : 'new',
    np: { cs: r.cs, ini: r.ini, seat: r.seat, cat: r.cat }, pid: '', role: 'main',
  }
}

function Waiting() {
  const [open, setOpen] = useState<Approving | null>(null)
  if (!ACCESS_REQS.length) return <p className="adm-note" id="admNoWaiting">Nobody is waiting for access.</p>
  return (
    <div className="acc-list" id="admWaiting">
      {ACCESS_REQS.map(r => {
        const sum = requestSummary(r)
        const a = open && open.id === r.id ? open : null
        const match = rosterMatch(r)
        return (
          <div className="acc-row req" key={r.id} data-req={r.id}>
            <div className="acc-main">
              <span className="acc-name">{r.name}</span>
              <span className="acc-sub">asked as <b>{r.cs}</b>{sum ? ` · ${sum}` : ''} · {elogWhen(r.at)}</span>
            </div>
            {!a
              ? <div className="acc-acts">
                  <button className="abtn primary" data-approve={r.id} onClick={() => setOpen(startApprove(r))}>Approve</button>
                  <button className="abtn" data-decline={r.id} onClick={() => done(declineRequest(r.id), `Declined ${r.name}`)}>Decline</button>
                </div>
              : <div className="acc-edit" data-approving={r.id}>
                  <PersonChoice idp="apv" mode={a.mode} onChange={m => setOpen({ ...a, mode: m })} />
                  {a.mode === 'new'
                    ? <>
                        <PersonFields idp="apv" np={a.np} onChange={np => setOpen({ ...a, np })} />
                        <p className="adm-note acc-note" id="apvNote">{archivedNote(r) ?? 'Filled from what he gave when he signed up — change anything before you give access.'}</p>
                      </>
                    : <>
                        <div className="mfield"><label htmlFor="apvPid">{CALLSIGN_LABEL}</label>
                          <PuckSelect id="apvPid" value={a.pid} onChange={v => setOpen({ ...a, pid: v })} /></div>
                        {match && <p className="adm-note acc-note" id="apvNote">{match.note}</p>}
                      </>}
                  <div className="mfield"><label htmlFor="apvRole">Role</label>
                    <RoleSelect id="apvRole" value={a.role} onChange={v => setOpen({ ...a, role: v })} /></div>
                  <div className="acc-acts">
                    <button className="abtn primary" id="apvGo" onClick={() => {
                      const bad = a.mode === 'new' ? approveRequestNew(r.id, a.np, a.role) : approveRequest(r.id, a.pid, a.role)
                      const who = a.mode === 'new' ? `${a.np.cs.trim()} added — ${r.name} can sign in now` : `${r.name} can sign in now`
                      if (done(bad, who)) setOpen(null)
                    }}>{a.mode === 'new' ? 'Add person and give access' : 'Give access'}</button>
                    <button className="abtn" id="apvCancel" onClick={() => setOpen(null)}>Cancel</button>
                  </div>
                </div>}
          </div>
        )
      })}
    </div>
  )
}

function AccountRow(p: { a: Account; editing: boolean; onEdit: () => void; onClose: () => void }) {
  const { a } = p
  const person = (PEOPLE as any)[a.pid]
  const own = isOwnAccount(a)
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
          {person && person.archived && <span className="acc-tag" title="This callsign has been archived — suspend the account while he is away, delete it when he leaves flying">archived callsign</span>}
          {/* D285 (26 Sep 26): "suspended" — the act D280 named, today's "switched off" in his words */}
          {!a.on && <span className="acc-tag">suspended</span>}
          {own && <span className="acc-tag you">you</span>}
        </span>
      </button>
      <span className={'ub ' + a.role}>{isAdminAccount(a) ? 'Admin' : 'Member'}</span>
      {p.editing && !own && <div className="acc-edit" data-editing={a.id}>
        <div className="mfield"><label htmlFor="accEdName">Sign-in (defence mail)</label>
          <input id="accEdName" value={name} maxLength={MAX_SIGNIN} onChange={e => setName(e.target.value)} /></div>
        <div className="mfield"><label htmlFor="accEdPid">{CALLSIGN_LABEL}</label>
          <PuckSelect id="accEdPid" value={pid} keep={a.pid} onChange={setPid} /></div>
        <div className="mfield"><label htmlFor="accEdRole">Role</label>
          <RoleSelect id="accEdRole" value={role} onChange={setRole} /></div>
        <div className="acc-acts">
          <button className="abtn primary" id="accEdSave" onClick={save}>Save</button>
          {/* D285: "Suspend" / "Enable" (was "Switch off / on") — a man away is suspended, and enabled when he is back */}
          <button className="abtn" id="accEdOnOff" onClick={() => {
            const cs = accountCallsign(a) || a.name
            if (done(updateAccount(a.id, { on: !a.on }), a.on ? `${cs} suspended` : `${cs} can sign in again`)) p.onClose()
          }}>{a.on ? 'Suspend' : 'Enable'}</button>
          <button className="abtn" id="accEdCancel" onClick={p.onClose}>Cancel</button>
        </div>
      </div>}
    </div>
  )
}

const BLANK: NewPerson = { cs: '', ini: '', seat: '', cat: '' }

/* `shown` — this list is on the admin's screen (the Admin page decides: Users chosen, and on a
   phone drilled in); `openNew` — a non-zero, changing value opens the add form on New person
   (Quals' "+ Add person", through the Admin page — state/view.ts ADMINOPEN) */
export function UsersPanel(p: { shown?: boolean; openNew?: number } = {}) {
  const [editing, setEditing] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [mode, setMode] = useState<Mode>('roster')
  const [pid, setPid] = useState('')
  const [np, setNp] = useState<NewPerson>(BLANK)
  const [role, setRole] = useState<AccountRole>('main')
  const addRef = useRef<HTMLDivElement>(null)
  const csRef = useRef<HTMLInputElement>(null)

  /* D216, D227 — the list has been on this admin's screen: his bell goes out. After every
     render (a request arriving while he looks is seen at once); it writes only when
     something is new to him, and a refusal stops here rather than asking again */
  useEffect(() => {
    if (!p.shown || !accessAlert()) return
    const bad = markRequestsSeen()
    if (!bad && !accessAlert()) notify()
  })
  /* Quals' "+ Add person" (D217): New person chosen, the form in view, the box ready. Two
     steps, because the box does not exist until the New person fields are DRAWN: the first
     effect chooses the mode and remembers the ask; the second runs after the render that
     drew them. (The walk, 26 Sep 26: a focus asked on a timer beside the mode change
     landed before the real browser had drawn the box — pinned by the e2e "leaves the
     cursor"; jsdom draws at once, so no unit test could see it.) */
  const wantFocus = useRef(0)
  useEffect(() => {
    if (!p.openNew) return
    wantFocus.current = p.openNew
    setMode('new')
  }, [p.openNew])
  useEffect(() => {
    if (!wantFocus.current || mode !== 'new' || !csRef.current) return
    wantFocus.current = 0
    addRef.current?.scrollIntoView?.({ block: 'center' })
    if (!HOOKS.isPhone()) csRef.current.focus()
  })

  const hasName = !!name.trim()
  /* after an add, EVERY half is cleared — the one not in view too. Each success used to
     clear only its own half, so a roster pick made before a New person add was still
     chosen afterwards, and a half-typed New person came back after an On the roster add
     (Astra's code read #1) */
  const resetAddForm = () => { setName(''); setPid(''); setNp(BLANK); setRole('main'); setMode('roster') }
  const add = () => {
    const nm = name.trim().toLowerCase()
    if (mode === 'roster') {
      if (done(addAccount(name, pid, role), `${nm} can sign in now`)) resetAddForm()
      return
    }
    const who = np.cs.trim()
    const ok = hasName ? `${who} added — ${nm} can sign in now` : `${who} added to the roster — set flight and quals on the Quals page`
    if (done(addPersonAndAccount(name, np, role), ok)) resetAddForm()
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
      <div id="accAddBlock" ref={addRef}>
        <h4 className="adm-sub">Add an account</h4>
        <div className="mfield"><label htmlFor="accAddName">Sign-in (defence mail)</label>
          <input id="accAddName" maxLength={MAX_SIGNIN} value={name} onChange={e => setName(e.target.value)}
            placeholder={mode === 'new' ? "name@mail (blank for someone who won't sign in)" : 'name@mail'} /></div>
        <PersonChoice idp="acc" mode={mode} onChange={setMode} />
        {mode === 'new'
          ? <>
              <PersonFields idp="accAdd" np={np} onChange={setNp} csRef={csRef} />
              <p className="adm-note acc-note" id="accAddNote">Makes his row on Quals and his account together — the one place a new person is made. Leave the sign-in blank for someone who won't use the app (a SANS man). Flight and quals are set on Quals.</p>
            </>
          : <div className="mfield"><label htmlFor="accAddPid">{CALLSIGN_LABEL}</label>
              <PuckSelect id="accAddPid" value={pid} onChange={setPid} /></div>}
        {/* no account without a sign-in, so no role (the agent's call, on the look card) */}
        {(mode === 'roster' || hasName) && <div className="mfield"><label htmlFor="accAddRole">Role</label>
          <RoleSelect id="accAddRole" value={role} onChange={setRole} /></div>}
        <button className="abtn primary" id="accAdd" style={{ width: '100%' }} onClick={add}>
          {mode === 'roster' ? 'Add account' : hasName ? 'Add person and account' : 'Add person'}</button>
        <p className="adm-note">Each person has one account, tied to their callsign. They sign in with their defence mail.</p>
      </div>
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
