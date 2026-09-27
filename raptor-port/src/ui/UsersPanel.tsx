/* ADMIN → USERS — ONE DOOR FOR A PERSON'S WHOLE STATE ([ONE-DOOR], 27 Sep 26).

   Owner, D309 / D310 ("one door as proposed, Quals loses archive"): Admin → Users shows every PERSON — not only the
   accounts — with a dot for Sign-in and one for Roster (green / red; grey = no sign-in), and carries every action on
   him: Active → Suspend · Archive · Delete; Suspended → Enable · Archive · Delete; no sign-in → Give sign-in · Archive ·
   Delete; Archived (a folded "▸ Archived · N" group) → Restore · Delete; Waiting → Give access · Refuse; a posting
   waiting for its date shown on his row. Archive also suspends the sign-in; Restore brings both back and asks the
   post-in date (D308); the man himself is then told to check his quals (D305). D322: the approved mock-up
   (docs/mock/one-door.html) is the design of record, with the agent's own calls on it — Archive one tap; Restore turns
   the sign-in on whatever suspended it; no Enable on an archived row; renaming a man ON the roster stays on Quals
   (D218), an archived man is renamed here (D295); A to Z with a search box; nothing reorders itself. D323: Archive is
   "posted out from today" on the Leave War, his past kept. The foot's form makes a NEW person only (a man already on
   the roster gets his sign-in on his own row), with his post-in date (D308).

   Before it ([ACCOUNTS], [ACCOUNTS-NEW-PERSON], 26 Sep 26): D166 (1) accounts — a sign-in name (which stands for the
   defence mail address), admin or member, the callsign it belongs to; D204 a new user joins either way — added here,
   or he asks and is given access here (a typed callsign never claims a puck by itself); D214 / D217 the one door for a
   new person, the same fields as the sign-up; D219 "Callsign/Name", D220 "Pilot" / "WSO" / "Personnel (ground crew)",
   D226 a name over 14 letters said never cut, D225 initials never required; the admins' bell (D216, D227) goes out for
   an admin once THIS list has been on his screen (`shown`, from the Admin page — on a phone, drilled in).

   Every write goes through state/accounts.ts, state/roster-add.ts, state/person-delete.ts or leavewar/sync.ts (Archive,
   Restore — they write the war too), each checking the permission itself and saying why when it refuses; this panel
   only asks and toasts. The words read as the database-era app will (25 Aug 26); the prototype truths live in
   state/accounts.ts, not on screen. */
import { useEffect, useRef, useState } from 'react'
import { PEOPLE, nameToId, archivedHolders } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { elogWhen } from '../engine/editlog'
import {
  ACCESS_REQS, GUESTVIEW, accountOfPid, linkablePeople, addAccount, updateAccount,
  approveRequest, approveRequestNew, addPersonAndAccount, declineRequest, setGuestView,
  requestSummary, accessAlert, markRequestsSeen, MAX_SIGNIN, type Account, type AccountRole, type AccessRequest,
} from '../state/accounts'
import {
  SEATS, catsFor, MAX_CS, MAX_INITIALS, CALLSIGN_LABEL, CS_TOO_LONG, callsignProblem, nextFreeCallsign, type NewPerson,
} from '../state/roster-add'
import { SESSION } from '../state/auth'
import { me } from '../state/perms'
import { notify } from '../state/store'
import { deletePerson, effectiveToday } from '../state/person-delete'
import { updatePersonField } from '../state/quals-write'
import { markBack } from '../state/view'
import {
  postingHeldNote, postingPendingTag, archivePerson, restoreArchivedPerson, restoreArchivedAs, restoreProblem,
} from '../leavewar/sync'
import './postout.css'

const P = (pid: string): any => (PEOPLE as any)[pid]
const cs = (pid: string) => (P(pid) ? String(P(pid).cs) : '')
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
/* the post-in date box (D308): opens on today; the account works at once, the Leave War counts him from the date */
function PostInField(p: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mfield"><label htmlFor={p.id}>Post in</label>
      <input type="date" id={p.id} value={p.value} onChange={e => p.onChange(e.target.value)} /></div>
  )
}

/* PERSON — "On the roster" | "New person" (the approved mock-up's segmented pair — Give access only now) */
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

/* what a request's typed callsign matches on the roster, for the Give access form's default and its note — named by
   the matched person's CALLSIGN, never an id (Fable F14); a placeholder (ALL / ALL AVAIL) is nobody to link, so it opens
   New person, which refuses it as taken. A person who ALREADY HAS AN ACCOUNT is not in the picker (one account per
   person, D166), so the note says so instead of asking the admin to pick him (Fable's code read #1) — it names both
   ways out (him on a new sign-in — renaming his account's sign-in answers this request, accounts.ts updateAccount — or
   someone else). The account is checked BEFORE archived (Fable's and Astra's fix checks #1). */
const SOMEONE_ELSE = 'If it is someone else, choose New person and give them another callsign or name.'
/* the signed-in admin's OWN account — its row cannot be opened (another admin changes it) */
const isOwnAccount = (a: Account) => !!(SESSION && SESSION.user === a.id) || (me() != null && a.pid === me())
function rosterMatch(r: AccessRequest): { pid: string; note: string } | null {
  /* a typed callsign finds the man ON THE ROSTER only ([POST-OUT-OUTCOMES], D286 (2)) — an archived man's callsign is
     free, so a request under it opens on New person (archivedNote) */
  const hit = r.cs ? nameToId(r.cs) : undefined
  const p = hit && P(hit)
  if (!hit || !p || p.special || p.archived) return null
  const same = String(p.cs).toLowerCase() === r.cs.trim().toLowerCase()
  const acct = accountOfPid(hit)
  if (acct) {
    const him = isOwnAccount(acct)
      ? "It is your own account: if it is you on a new sign-in, another admin must change its sign-in on your row — you can't change your own."
      : `If it is them on a new sign-in, change the sign-in on ${p.cs}'s row — that answers this request.`
    return { pid: hit, note: `He typed ${r.cs} — ${same ? `${p.cs} already has` : `that is ${p.cs}, who already has`} an account (${acct.name}), so they can't be picked here. ${him} ${SOMEONE_ELSE}` }
  }
  return { pid: hit, note: same ? `He typed ${r.cs} — ${p.cs} is on the roster. Pick them if this is them.`
    : `He typed ${r.cs} — that is ${p.cs}. Pick them if this is them.` }
}
/* D286 reading (5), in D300's few words: a request whose callsign only an ARCHIVED man holds opens on New person,
   saying so; when that archived man has an account, the way it is HIM on a new sign-in is named too */
function archivedNote(r: AccessRequest): string | null {
  const held = r.cs ? archivedHolders(r.cs) : []
  if (!held.length) return null
  const acct = held.map(id => accountOfPid(id)).find(Boolean)
  return `An archived man is already ${r.cs.trim()} — this makes a new person.`
    + (acct ? ` If it is him, change his account's sign-in (${acct.name}) instead.` : '')
}

/* one open Give access form's state — started afresh from the request (Cancel discards edits); switching On the
   roster ↔ New person keeps what each half holds; New person asks the post-in date (D308), opening on today */
interface Approving { id: string; mode: Mode; np: NewPerson; pid: string; role: AccountRole; postIn: string }
function startApprove(r: AccessRequest): Approving {
  return {
    id: r.id, mode: rosterMatch(r) ? 'roster' : 'new',
    np: { cs: r.cs, ini: r.ini, seat: r.seat, cat: r.cat }, pid: '', role: 'main', postIn: effectiveToday(),
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
                  {/* D309 / D310: "Give access · Refuse" (were Approve · Decline) */}
                  <button className="abtn primary" data-approve={r.id} onClick={() => setOpen(startApprove(r))}>Give access</button>
                  <button className="abtn" data-decline={r.id} onClick={() => done(declineRequest(r.id), `Refused ${r.name}`)}>Refuse</button>
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
                  <div className="adm-2col">
                    {a.mode === 'new' && <PostInField id="apvPostIn" value={a.postIn} onChange={v => setOpen({ ...a, postIn: v })} />}
                    <div className="mfield"><label htmlFor="apvRole">Role</label>
                      <RoleSelect id="apvRole" value={a.role} onChange={v => setOpen({ ...a, role: v })} /></div>
                  </div>
                  <div className="acc-acts">
                    <button className="abtn primary" id="apvGo" onClick={() => {
                      const bad = a.mode === 'new' ? approveRequestNew(r.id, a.np, a.role, a.postIn) : approveRequest(r.id, a.pid, a.role)
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

/* "Pilot · CAT C" / "WSO · CAT B" / "Personnel" — the seat and CAT under his callsign */
function seatText(p: any): string {
  if (!p) return ''
  if (p.pers || p.seat === 'GND') return 'Personnel'
  return `${p.seat === 'FCP' ? 'Pilot' : 'WSO'}${p.q ? ` · CAT ${p.q}` : ''}`
}
/* THE TWO DOTS (D309 "green or red dot for status, account and roster"): colour is never the only sign — each dot
   carries its state in words (title, aria-label) */
function Dot(p: { kind: 'on' | 'off' | 'none'; tip: string; testid: string }) {
  return (
    <span className="od-c" title={p.tip} aria-label={p.tip} role="img" data-testid={p.testid}>
      <i className={p.kind === 'on' ? 'g' : p.kind === 'off' ? 'r' : ''} />
    </span>
  )
}
function Dots(p: { pid: string; a: Account | undefined; archived: boolean }) {
  const sin: 'on' | 'off' | 'none' = !p.a ? 'none' : p.a.on ? 'on' : 'off'
  return (
    <>
      <Dot kind={sin} testid={`dot-signin-${p.pid}`} tip={sin === 'on' ? 'Can sign in' : sin === 'off' ? 'Sign-in suspended' : 'No sign-in'} />
      <Dot kind={p.archived ? 'off' : 'on'} testid={`dot-roster-${p.pid}`} tip={p.archived ? 'Archived' : 'On the roster'} />
    </>
  )
}
/* D287 / D298 / D300: the delete's second tap names what goes — once, in few words (the approved picture 2b) */
const DELETE_GOES = 'Goes: his account, his Quals row, every day still to come. Days he flew keep his puck. Can’t be undone.'

/* ONE ROW PER PERSON ON THE ROSTER (D309, D310). Tap it for his sign-in, his role and his state's buttons — never your
   own row (another admin changes it). A row with an account keeps `data-acct` (the account's id) beside `data-person`. */
function PersonRow(p: { pid: string; open: boolean; onToggle: () => void; onClose: () => void }) {
  const person = P(p.pid)
  const a = accountOfPid(p.pid)
  const own = (a && isOwnAccount(a)) || (me() != null && p.pid === me())
  const [name, setName] = useState(a ? a.name : '')
  const [role, setRole] = useState<AccountRole>(a ? a.role : 'main')
  /* the delete's first tap arms it; Cancel, closing the editor or another row disarms it (the editor unmounts) */
  const [armDel, setArmDel] = useState(false)
  const callsign = cs(p.pid)
  const tag = postingPendingTag(p.pid)
  /* his posting out has come and is waiting — why (the last admin; a stored week), on his row, his own included */
  const held = postingHeldNote(p.pid)
  const roleWord = a ? (a.role === 'admin' ? 'Admin' : 'Member') : ''
  const save = () => {
    if (!a) return
    const patch: any = {}
    if (name !== a.name) patch.name = name
    if (role !== a.role) patch.role = role
    if (!Object.keys(patch).length) return p.onClose()
    if (done(updateAccount(a.id, patch), 'Saved')) p.onClose()
  }
  const archive = () => {
    const r = archivePerson(p.pid)
    if (done(r.bad, r.said)) p.onClose()
  }
  const del = () => {
    if (!armDel) { setArmDel(true); return }
    if (done(deletePerson(p.pid), `${callsign} deleted`)) p.onClose()
  }
  return (
    <div className={'acc-row od-row' + (p.open ? ' od-row-on' : '')} data-person={p.pid} {...(a ? { 'data-acct': a.id } : {})}>
      <button className="acc-main acc-tap" disabled={!!own} onClick={p.onToggle}
        title={own ? 'Your own account — another admin can change it' : `Change ${callsign}`}>
        <span className="acc-name">{callsign}</span>
        <span className="acc-sub">
          {a ? <b>{a.name}</b> : 'no sign-in'}
          {roleWord && <span className="od-rw"> · {roleWord}</span>}
          {' · '}{seatText(person)}
          {tag && <span className="od-po" data-testid={`po-tag-${p.pid}`}>{tag}</span>}
          {own && <span className="acc-tag you">you</span>}
        </span>
      </button>
      <Dots pid={p.pid} a={a} archived={false} />
      <span className="od-rc">{a && <span className={'ub ' + a.role}>{roleWord}</span>}</span>
      {held && <span className="acc-held" data-testid={`acc-held-${a ? a.id : p.pid}`}>{held}</span>}
      {p.open && !own && <div className="acc-edit" data-editing={a ? a.id : p.pid}>
        <div className="adm-2col">
          <div className="mfield"><label htmlFor={a ? 'accEdName' : 'accGiveName'}>Sign-in (defence mail)</label>
            <input id={a ? 'accEdName' : 'accGiveName'} value={name} maxLength={MAX_SIGNIN} placeholder="name@mail"
              onChange={e => setName(e.target.value)} /></div>
          <div className="mfield"><label htmlFor={a ? 'accEdRole' : 'accGiveRole'}>Role</label>
            <RoleSelect id={a ? 'accEdRole' : 'accGiveRole'} value={role} onChange={setRole} /></div>
        </div>
        <div className="acc-acts">
          {a
            ? <>
                <button className="abtn primary" id="accEdSave" onClick={save}>Save</button>
                {/* D285: "Suspend" / "Enable" — a man away is suspended, and enabled when he is back */}
                <button className="abtn" id="accEdOnOff" onClick={() => {
                  const enabling = !a.on
                  if (done(updateAccount(a.id, { on: !a.on }), a.on ? `${callsign} suspended` : `${callsign} can sign in again`)) {
                    /* D284, D307: enabling his account is one of the "he's back" acts — the Quals prompt to check his quals */
                    if (enabling) { markBack(a.pid); notify() }
                    p.onClose()
                  }
                }}>{a.on ? 'Suspend' : 'Enable'}</button>
              </>
            : <button className="abtn primary" id="accGive" onClick={() => {
                if (done(addAccount(name, p.pid, role), `${callsign} can sign in now`)) p.onClose()
              }}>Give sign-in</button>}
          {/* D310, D322, D323: Archive — one tap; it also suspends his sign-in; on the war "posted out from today" */}
          <button className="abtn" id="accEdArchive" onClick={archive}>Archive</button>
          {/* D287, D298 "Delete": his account and his person (a hidden mark underneath, D290); asks twice, says what goes */}
          <button className={'abtn danger' + (armDel ? ' del-armed' : '')} id="accEdDel" onClick={del}>
            {armDel ? `Tap again to delete ${callsign}` : 'Delete'}</button>
          <button className="abtn" id="accEdCancel" onClick={p.onClose}>Cancel</button>
        </div>
        {armDel && <p className="adm-note acc-note acc-del-note" id="accEdDelNote">{DELETE_GOES}</p>}
      </div>}
    </div>
  )
}

/* AN ARCHIVED MAN (D310 — moved here from Quals' Archived list with its Restore, "Restore as" and rename, D295): his
   callsign box (rename; and when a man ON the roster holds his callsign, it opens on the next free one — D286 (1)), the
   post-in date (D308, opening on today), Restore (or "Restore as <typed>"), Save name (a rename alone — D295), Delete
   (two taps). Restore brings his sign-in back with him (D322) and opens a new stint on the war (D320). */
function ArchivedRow(p: { pid: string; open: boolean; onToggle: () => void; onClose: () => void }) {
  const person = P(p.pid)
  const a = accountOfPid(p.pid)
  const callsign = cs(p.pid)
  const taken = !!callsignProblem(callsign, p.pid)
  const [box, setBox] = useState(() => (taken ? nextFreeCallsign(callsign, p.pid) : callsign))
  const [postIn, setPostIn] = useState(effectiveToday)
  const [err, setErr] = useState('')
  const [armDel, setArmDel] = useState(false)
  const want = box.trim()
  const renamed = want !== callsign
  const restore = () => {
    const bad = renamed
      ? restoreArchivedAs(p.pid, want, postIn)
      : restoreProblem(p.pid, postIn) || callsignProblem(callsign, p.pid) || (restoreArchivedPerson(p.pid, postIn) ? null : 'That did not save')
    if (bad) { setErr(bad); return }
    HOOKS.toast(`${want} restored — ${a ? 'he can sign in, and ' : ''}he'll be asked to check his quals and CAT`); notify(); p.onClose()
  }
  const saveName = () => {
    const bad = callsignProblem(want, p.pid)
    if (bad) { setErr(bad); return }
    const r = updatePersonField(p.pid, { callsign: want })
    if (r && r !== 'unchanged') { setErr(r); return }
    HOOKS.toast(`Renamed ${want}`); notify()
  }
  return (
    <div className={'acc-row od-row' + (p.open ? ' od-row-on' : '')} data-person={p.pid} data-archived="1" {...(a ? { 'data-acct': a.id } : {})}>
      <button className="acc-main acc-tap" onClick={p.onToggle} title={`Restore or delete ${callsign}`}>
        <span className="acc-name">{callsign}</span>
        <span className="acc-sub">{a ? <b>{a.name}</b> : 'no sign-in'}{' · '}{seatText(person)}</span>
      </button>
      <Dots pid={p.pid} a={a} archived />
      <span className="od-rc">{a && <span className={'ub ' + a.role}>{a.role === 'admin' ? 'Admin' : 'Member'}</span>}</span>
      {p.open && <div className="acc-edit" data-restoring={p.pid}>
        <div className="adm-2col">
          <div className="mfield"><label htmlFor="accArCs">{CALLSIGN_LABEL}</label>
            <input id="accArCs" value={box} autoComplete="off" onChange={e => { setBox(e.target.value); setErr('') }} /></div>
          <PostInField id="accArPostIn" value={postIn} onChange={v => { setPostIn(v); setErr('') }} />
        </div>
        {taken && <p className="od-err" id="accArTaken">{callsign} is taken on the roster — give him another callsign.</p>}
        {err && <p className="od-err" id="accArErr">{err}</p>}
        <p className="od-said">{a ? 'He can sign in at once; the Leave War counts him from the post-in date.' : 'The Leave War counts him from the post-in date.'}</p>
        <div className="acc-acts">
          <button className="abtn primary" id="accArRestore" onClick={restore}>{renamed ? `Restore as ${want || '…'}` : 'Restore'}</button>
          {renamed && <button className="abtn" id="accArSave" onClick={saveName}>Save name</button>}
          <button className={'abtn danger' + (armDel ? ' del-armed' : '')} id="accArDel" onClick={() => {
            if (!armDel) { setArmDel(true); return }
            if (done(deletePerson(p.pid), `${callsign} deleted`)) p.onClose()
          }}>{armDel ? `Tap again to delete ${callsign}` : 'Delete'}</button>
          <button className="abtn" id="accArCancel" onClick={p.onClose}>Cancel</button>
        </div>
        {armDel && <p className="adm-note acc-note acc-del-note" id="accArDelNote">{DELETE_GOES}</p>}
      </div>}
    </div>
  )
}

const BLANK: NewPerson = { cs: '', ini: '', seat: '', cat: '' }
const byCs = (x: string, y: string) => cs(x).localeCompare(cs(y))
/* the column heads over the two dots, drawn once over each list */
const Cols = () => (
  <div className="od-cols" aria-hidden="true"><span className="od-grow" /><span className="od-c">Sign-in</span><span className="od-c">Roster</span><span className="od-rc" /></div>
)

/* `shown` — this list is on the admin's screen (the Admin page decides: Users chosen, and on a phone drilled in);
   `openNew` — a non-zero, changing value brings the add form into view with its callsign box ready (Quals'
   "+ Add person", through the Admin page — state/view.ts ADMINOPEN) */
export function UsersPanel(p: { shown?: boolean; openNew?: number } = {}) {
  const [editing, setEditing] = useState<string | null>(null)
  const [find, setFind] = useState('')
  /* the Archived group's fold: his own tap, or — while he has not tapped since the search changed — open exactly when
     the search matches someone archived (the walk's design, Fable R7: the tap used to do nothing while a search matched) */
  const [archOpen, setArchOpen] = useState<boolean | null>(false)
  const [name, setName] = useState('')
  const [np, setNp] = useState<NewPerson>(BLANK)
  const [role, setRole] = useState<AccountRole>('main')
  const [postIn, setPostIn] = useState(effectiveToday)
  const addRef = useRef<HTMLDivElement>(null)
  const csRef = useRef<HTMLInputElement>(null)

  /* D216, D227 — the list has been on this admin's screen: his bell goes out */
  useEffect(() => {
    if (!p.shown || !accessAlert()) return
    const bad = markRequestsSeen()
    if (!bad && !accessAlert()) notify()
  })
  /* Quals' "+ Add person" (D217): the form in view, the callsign box ready — after the render that drew it (the walk,
     26 Sep 26: a focus asked on a timer landed before the real browser had drawn the box) */
  const wantFocus = useRef(0)
  useEffect(() => { if (p.openNew) wantFocus.current = p.openNew }, [p.openNew])
  useEffect(() => {
    if (!wantFocus.current || !csRef.current) return
    wantFocus.current = 0
    addRef.current?.scrollIntoView?.({ block: 'center' })
    if (!HOOKS.isPhone()) csRef.current.focus()
  })

  const hasName = !!name.trim()
  const resetAddForm = () => { setName(''); setNp(BLANK); setRole('main'); setPostIn(effectiveToday()) }
  const add = () => {
    const nm = name.trim().toLowerCase()
    const who = np.cs.trim()
    const ok = hasName ? `${who} added — ${nm} can sign in now` : `${who} added to the roster — set flight and quals on the Quals page`
    if (done(addPersonAndAccount(name, np, role, postIn), ok)) resetAddForm()
  }
  /* the search (the agent's call on the approved page): a callsign or a sign-in name, anywhere in it; the Archived
     group opens while it holds a match */
  const q = find.trim().toLowerCase()
  const matches = (pid: string) => {
    if (!q) return true
    const a = accountOfPid(pid)
    return cs(pid).toLowerCase().includes(q) || (!!a && a.name.includes(q))
  }
  const everyone = Object.keys(PEOPLE).filter(id => P(id) && !P(id).special && !P(id).deleted)
  const onRoster = everyone.filter(id => !P(id).archived)
  const archived = everyone.filter(id => P(id).archived)
  const rosterShown = onRoster.filter(matches).sort(byCs)
  const archShown = archived.filter(matches).sort(byCs)
  const archOpenNow = archOpen ?? (!!q && archShown.length > 0)
  const toggle = (pid: string) => setEditing(editing === pid ? null : pid)
  return (
    <>
      <h4 className="adm-sub">Waiting for access</h4>
      <Waiting />
      <hr className="adm-sep" />
      <div className="od-head">
        <h4 className="adm-sub">People · {onRoster.length}</h4>
        <input className="od-find" id="accFind" type="search" value={find} placeholder="Find a callsign or sign-in"
          aria-label="Find a callsign or sign-in" onChange={e => { setFind(e.target.value); setArchOpen(null) }} />
      </div>
      <div className="acc-list od-list" id="accList">
        <Cols />
        {rosterShown.map(pid => <PersonRow key={pid + (editing === pid ? ':e' : '')} pid={pid} open={editing === pid}
          onToggle={() => toggle(pid)} onClose={() => setEditing(null)} />)}
        {!rosterShown.length && <p className="adm-note" id="accNoMatch">Nobody matches.</p>}
      </div>
      {archived.length > 0 && (
        <div className="od-arch" id="accArchived">
          <button className="abtn" id="accArchToggle" aria-expanded={archOpenNow} onClick={() => setArchOpen(!archOpenNow)}>
            {archOpenNow ? '▾' : '▸'} Archived · {archived.length}
          </button>
          {archOpenNow && (
            <div className="acc-list od-list" id="accArchList">
              <Cols />
              {archShown.map(pid => <ArchivedRow key={pid + (editing === pid ? ':e' : '')} pid={pid} open={editing === pid}
                onToggle={() => toggle(pid)} onClose={() => setEditing(null)} />)}
            </div>
          )}
        </div>
      )}
      <hr className="adm-sep" />
      <div id="accAddBlock" ref={addRef}>
        <h4 className="adm-sub">Add a person</h4>
        <PersonFields idp="accAdd" np={np} onChange={setNp} csRef={csRef} />
        <div className="adm-2col">
          <div className="mfield"><label htmlFor="accAddName">Sign-in (defence mail)</label>
            <input id="accAddName" maxLength={MAX_SIGNIN} value={name} onChange={e => setName(e.target.value)}
              placeholder="blank if he won't use the app" /></div>
          <PostInField id="accAddPostIn" value={postIn} onChange={setPostIn} />
        </div>
        {/* no account without a sign-in, so no role */}
        {hasName && <div className="mfield"><label htmlFor="accAddRole">Role</label>
          <RoleSelect id="accAddRole" value={role} onChange={setRole} /></div>}
        <button className="abtn primary" id="accAdd" style={{ width: '100%' }} onClick={add}>
          {hasName ? 'Add person and sign-in' : 'Add person'}</button>
        <p className="adm-note" id="accAddNote">Makes his Quals row, and his sign-in if you give one. The Leave War counts him from the post-in date.</p>
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
