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
   "posted out from today" on the Leave War, his past kept. The add form makes a NEW person only (a man already on
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
import { SrchIcon } from './icons'
import { useEffect, useRef, useState } from 'react'
import { PEOPLE, nameToId, archivedHolders } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { elogWhen } from '../engine/editlog'
import {
  accountOfPid, linkablePeople, addAccount, updateAccount, waitingHere, unseenRequests,
  approveRequest, approveRequestNew, addPersonAndAccount, declineRequest, saveAccess,
  requestSummary, accessAlert, markRequestsSeen, MAX_SIGNIN, isAdminAccount, type Account, type AccountRole, type AccessRequest,
  type AccessSave, type AccessLine,
} from '../state/accounts'
import { RoleBox, SquadronLines, RolesFold } from './UserAccess'
import { accessLinesOf, alsoPlansOf, rolePickOf, actorIsMaster, type RolePick } from './useraccess-model'
import {
  SEATS, catsFor, MAX_CS, MAX_INITIALS, CALLSIGN_LABEL, CS_TOO_LONG, callsignProblem, nextFreeCallsign, type NewPerson,
} from '../state/roster-add'
import { SESSION } from '../state/auth'
import { me, pageUnit, adminOfUnit } from '../state/perms'
import { todayIso, homeOn, unitById } from '../state/units'
import { usersView, NO_FILTER, type UsersFilter, type UsersView } from './usersfilter-model'
import { UsersFilterBox, ShowingLine, FILTER_ESC } from './UsersFilter'
import { useEscRow, escCloses, escToTop, keysBack } from './sheetfocus'
import { notify } from '../state/store'
import { deletePerson, effectiveToday } from '../state/person-delete'
import { updatePersonField } from '../state/quals-write'
import { markBack } from '../state/view'
import {
  postingHeldNote, postingPendingTag, archivedLine, archivePerson, restoreArchivedPerson, restoreArchivedAs, restoreProblem,
} from '../leavewar/sync'
import './postout.css'
import { DateBox } from './DateBox'
import { useGuardWork } from './guard'

const P = (pid: string): any => (PEOPLE as any)[pid]
const cs = (pid: string) => (P(pid) ? String(P(pid).cs) : '')
/* `unit` — whose men are offered: the page's squadron by default; a request's own squadron when approving it (§5) */
function PuckSelect(p: { id: string; value: string; keep?: string; unit?: string; onChange: (v: string) => void }) {
  const opts = linkablePeople(p.keep, p.unit)
  return (
    <select id={p.id} value={p.value} aria-label="The callsign or name this account belongs to" onChange={e => p.onChange(e.target.value)}>
      <option value="">Pick a callsign or name…</option>
      {opts.map(id => <option key={id} value={id}>{cs(id)}</option>)}
    </select>
  )
}
/* the Role box of a new person's sign-in (the add form, a request's approval): Member or Admin, the short words of D2305 */
function RoleSelect(p: { id: string; value: AccountRole; onChange: (v: AccountRole) => void }) {
  return (
    <select id={p.id} value={p.value} aria-label="Member or admin" onChange={e => p.onChange(e.target.value as AccountRole)}>
      <option value="main">Member</option>
      <option value="admin">Admin</option>
    </select>
  )
}
const done = (bad: string | null, ok: string) => { if (bad) HOOKS.toast(bad, 'warn'); else HOOKS.toast(ok); notify(); return !bad }
/* the post-in date box (D308): opens on today; the account works at once, the Leave War counts him from the date */
function PostInField(p: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mfield"><label htmlFor={p.id}>Post in</label>
      <DateBox id={p.id} label="Post in" value={p.value} onChange={p.onChange} /></div>
  )
}

/* PERSON — "On the roster" | "New person" (the approved mock-up's segmented pair — Give access only now) */
type Mode = 'roster' | 'new'
function PersonChoice(p: { idp: string; mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <>
      {/* the label's look on a plain line (React Doctor label-has-associated-control, 8 Nov 26): "Person" heads two
          buttons, not a box, and the group carries its own name for a screen reader; nothing drawn changes */}
      <div className="mfield"><span className="mfield-lbl">Person</span></div>
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
  /* a man of another squadron than the one he asked to join is nobody to link him to (§5 — linking offers that
     squadron's men only): New person opens, which says the callsign is taken */
  if (homeOn(hit, todayIso()) !== r.unit) return null
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
   saying so, and names the way it is HIM — since the one door (D310, D322) an archived row edits no sign-in, so it is
   Restore first, then his sign-in on his row, with or without an account (the final code read, Fable, 27 Sep 26: it
   said "change his account's sign-in instead", a door the archived row no longer has) */
function archivedNote(r: AccessRequest): string | null {
  const held = r.cs ? archivedHolders(r.cs) : []
  if (!held.length) return null
  return `An archived man is already ${r.cs.trim()} — this makes a new person. If it is him, restore him first (▸ Archived), then give him his sign-in on his row.`
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
  /* how "Give access" opened — the guard counts it once anything differs (ui/guard.ts, D2598) */
  const [opened, setOpened] = useState<Approving | null>(null)
  useGuardWork('giveaccess', !!open && JSON.stringify(open) !== JSON.stringify(opened))
  /* the page's squadron's requests only, those he is an admin of (§5 — accounts.ts waitingHere) */
  const reqs = waitingHere()
  if (!reqs.length) return <p className="adm-note" id="admNoWaiting">Nobody is waiting for access.</p>
  return (
    <div className="acc-list" id="admWaiting">
      {reqs.map(r => {
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
                  <button className="abtn primary" data-approve={r.id} onClick={() => { const s = startApprove(r); setOpen(s); setOpened(s) }}>Give access</button>
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
                          <PuckSelect id="apvPid" value={a.pid} unit={r.unit} onChange={v => setOpen({ ...a, pid: v })} /></div>
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

const roleWordOf = (a: Account | undefined) => (a ? (isAdminAccount(a) ? 'Admin' : 'Member') : '')
/* the line under his callsign on his roster row — his sign-in, role, seat and CAT, a posting waiting, "you". A piece of
   its own with the editor below (React Doctor no-high-complexity-react-function, 8 Nov 26); drawn exactly as before */
function PersonSub(p: { pid: string; a: Account | undefined; person: any; roleWord: string; own: boolean }) {
  const tag = postingPendingTag(p.pid)
  /* "· also plans 149" (pictures p2a, p2b — D2303's row): the same on his own squadron's list and on 149's */
  const plans = alsoPlansOf(p.a, p.pid)
  return (
    <span className="acc-sub">
      {p.a ? <b>{p.a.name}</b> : 'no sign-in'}
      {p.roleWord && <span className="od-rw"> · {p.roleWord}</span>}
      {' · '}{seatText(p.person)}
      {plans && <span className="od-plans" data-testid={`plans-${p.pid}`}> · {plans}</span>}
      {tag && <span className="od-po" data-testid={`po-tag-${p.pid}`}>{tag}</span>}
      {p.own && <span className="acc-tag you">you</span>}
    </span>
  )
}

/* a man of another squadron on this list (found by search, or a Plan holder of it): his squadron's number, for the grey
   badge by his name (picture rB2 — the badge approved for Ranger's row on 149's list); null for the page's own */
function otherSqnOf(pid: string): string | null {
  const home = homeOn(pid, todayIso())
  return !!home && home !== pageUnit('own') ? String(unitById(home)?.num ?? home) : null
}
/* THE ROW'S ONE SAVE (D2303): the role, the master mark and every squadron's line changed, as saveAccess takes them —
   Master admin picked, the lines are not sent (the door drops his rights with the mark, R-O10); null, nothing changed */
function accessWant(a: Account, role: RolePick, pickNow: RolePick, lines: Record<string, AccessLine>, linesNow: Record<string, AccessLine>): AccessSave | null {
  const want: AccessSave = {}
  if (role !== pickNow) {
    if (role === 'master') { want.role = 'admin'; want.master = true }
    else { want.role = role; if (a.master) want.master = false }
  }
  const changed = Object.keys(lines).filter(u => lines[u] !== linesNow[u])
  if (role !== 'master' && changed.length) want.grants = Object.fromEntries(changed.map(u => [u, lines[u]!]))
  return want.role !== undefined || want.master !== undefined || want.grants ? want : null
}
/* WHAT OF HIS ROW IS THE SIGNED-IN ADMIN'S TO CHANGE (D2191, R3, 5b — picture rB2): his sign-in, role, Suspend, Archive and
   Delete are an admin of his own squadron's (a man found by search, or a Plan holder from another squadron, shows only the
   lines of squadrons the admin may give access to live); a master admin's role a master admin's alone (setMaster) */
function rowLocks(pid: string, a: Account | undefined): { rest: boolean; roleLocked: boolean } {
  const home = homeOn(pid, todayIso())
  const rest = !home || adminOfUnit(home)
  return { rest, roleLocked: !rest || (a?.master === true && !actorIsMaster()) }
}

/* ONE ROW PER PERSON ON THE ROSTER (D309, D310). Tap it for his sign-in, his role and his state's buttons — never your
   own row (another admin changes it). A row with an account keeps `data-acct` (the account's id) beside `data-person`. */
function PersonRow(p: { pid: string; open: boolean; ringed?: boolean; onToggle: () => void; onClose: () => void }) {
  const person = P(p.pid)
  const a = accountOfPid(p.pid)
  const own = (a && isOwnAccount(a)) || (me() != null && p.pid === me())
  const callsign = cs(p.pid)
  /* his posting out has come and is waiting — why (the last admin; a stored week), on his row, his own included */
  const held = postingHeldNote(p.pid)
  const roleWord = roleWordOf(a)
  const other = otherSqnOf(p.pid)
  return (
    <div className={'acc-row od-row' + (p.open ? ' od-row-on' : '') + (p.ringed ? ' acc-ring' : '')} data-person={p.pid} {...(a ? { 'data-acct': a.id } : {})}>
      <button className="acc-main acc-tap" disabled={!!own} onClick={p.onToggle}
        title={own ? 'Your own account — another admin can change it' : `Change ${callsign}`}>
        <span className="acc-name">{callsign}{other && <span className="acc-sqn" data-testid={`sqn-${p.pid}`}>{other}</span>}</span>
        <PersonSub pid={p.pid} a={a} person={person} roleWord={roleWord} own={!!own} />
      </button>
      <Dots pid={p.pid} a={a} archived={false} />
      <span className="od-rc">{a && <span className={'ub ' + a.role}>{roleWord}</span>}</span>
      {held && <span className="acc-held" data-testid={`acc-held-${a ? a.id : p.pid}`}>{held}</span>}
      {p.open && !own && <PersonEditor pid={p.pid} a={a} callsign={callsign} onClose={p.onClose} />}
    </div>
  )
}

/* HIS OPEN ROW'S EDITOR — his sign-in, his role and his state's buttons. A piece of its own (React Doctor
   no-high-complexity-react-function, 8 Nov 26) holding what is typed: the row is drawn afresh each time it opens or
   closes (its key changes with the editor), so what is typed starts from his saved values every time, as before. */
function PersonEditor(p: { pid: string; a: Account | undefined; callsign: string; onClose: () => void }) {
  const { a, callsign } = p
  const [name, setName] = useState(a ? a.name : '')
  /* THE ROLE HIS ACCOUNT GIVES TODAY, as his row's badge reads it (roleWordOf — accounts.ts adminNow), never the stored
     role alone (the sign-in re-walk, 22 Nov 26): an admin who moved squadron is a member of the one he joined (K3, D2160)
     while his account still stores "admin", so the box opened on Admin beside a row reading MEMBER, and saving Admin
     changed nothing and said nothing. Picking Admin and saving now sends the role, and the account door records it for
     the squadron he is in today (accounts.ts updateAccount, adminRecFor). The master mark is the box's third choice
     (D2303). */
  const roleNow: AccountRole = a && isAdminAccount(a) ? 'admin' : 'main'
  const pickNow = rolePickOf(a, roleNow)
  const [role, setRole] = useState<RolePick>(pickNow)
  /* every other squadron's line, as it stands and as picked (ui/UserAccess.tsx) */
  const [linesNow] = useState(() => accessLinesOf(a, p.pid))
  const [lines, setLines] = useState(linesNow)
  const { rest, roleLocked } = rowLocks(p.pid, a)
  /* the delete's first tap arms it; Cancel, closing the editor or another row disarms it (the editor unmounts) */
  const [armDel, setArmDel] = useState(false)
  /* his row counts for the guard once anything differs from how it opened — the sign-in, the Role, a squadron's line
     (D2595, D2598; ui/guard.ts) */
  useGuardWork('userrow', name !== (a ? a.name : '') || role !== pickNow || JSON.stringify(lines) !== JSON.stringify(linesNow))
  const save = () => {
    if (!a) return
    /* the role, the mark, every squadron's line AND his sign-in in ONE command (accounts.ts saveAccess — one Undo step;
       every part checked before anything is written — the final reads, R4: the rename ran after as a second command, so
       a refused rename left the access saved); a rename alone through its own door, one command as before */
    const want = accessWant(a, role, pickNow, lines, linesNow)
    const renamed = name !== a.name
    if (!want && !renamed) return p.onClose()
    const bad = want ? saveAccess(a.id, renamed ? { ...want, name } : want) : updateAccount(a.id, { name })
    if (done(bad, 'Saved')) p.onClose()
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
    <div className="acc-edit" data-editing={a ? a.id : p.pid}>
      <div className="adm-2col">
        <div className="mfield"><label htmlFor={a ? 'accEdName' : 'accGiveName'}>Sign-in (defence mail)</label>
          <input id={a ? 'accEdName' : 'accGiveName'} value={name} maxLength={MAX_SIGNIN} placeholder="name@mail" disabled={!rest}
            onChange={e => setName(e.target.value)} /></div>
        <div className="mfield"><label htmlFor={a ? 'accEdRole' : 'accGiveRole'}>Role</label>
          {/* (no sign-in yet: Member or Admin — the mark is given on an account, D2320) */}
          <RoleBox id={a ? 'accEdRole' : 'accGiveRole'} value={role} disabled={roleLocked} masterOff={!a || !actorIsMaster()}
            onChange={setRole} /></div>
      </div>
      <SquadronLines pid={p.pid} hasSignIn={!!a} rolePick={role} now={linesNow} pick={lines}
        onPick={(u, v) => setLines({ ...lines, [u]: v })} />
      {/* what each role may see and do, under the lines where roles and access are given (D2302, D2305) */}
      <RolesFold />
      <div className="acc-acts">
        {a
          ? <>
              <button className="abtn primary" id="accEdSave" onClick={save}>Save</button>
              {/* D285: "Suspend" / "Enable" — a man away is suspended, and enabled when he is back */}
              <button className="abtn" id="accEdOnOff" disabled={!rest} onClick={() => {
                const enabling = !a.on
                if (done(updateAccount(a.id, { on: !a.on }), a.on ? `${callsign} suspended` : `${callsign} can sign in again`)) {
                  /* D284, D307: enabling his account is one of the "he's back" acts — the Quals prompt to check his quals */
                  if (enabling) { markBack(a.pid); notify() }
                  p.onClose()
                }
              }}>{a.on ? 'Suspend' : 'Enable'}</button>
            </>
          : <button className="abtn primary" id="accGive" onClick={() => {
              if (done(addAccount(name, p.pid, role === 'master' ? 'admin' : role), `${callsign} can sign in now`)) p.onClose()
            }}>Give sign-in</button>}
        {/* D310, D322, D323: Archive — one tap; it also suspends his sign-in; on the war "posted out from today" */}
        <button className="abtn" id="accEdArchive" disabled={!rest} onClick={archive}>Archive</button>
        {/* D287, D298 "Delete": his account and his person (a hidden mark underneath, D290); asks twice, says what goes */}
        <button className={'abtn danger' + (armDel ? ' del-armed' : '')} id="accEdDel" disabled={!rest} onClick={del}>
          {armDel ? `Tap again to delete ${callsign}` : 'Delete'}</button>
        <button className="abtn" id="accEdCancel" onClick={p.onClose}>Cancel</button>
      </div>
      {armDel && <p className="adm-note acc-note acc-del-note" id="accEdDelNote">{DELETE_GOES}</p>}
    </div>
  )
}

/* AN ARCHIVED MAN (D310 — moved here from Quals' Archived list with its Restore, "Restore as" and rename, D295): his
   callsign box (rename; and when a man ON the roster holds his callsign, it opens on the next free one — D286 (1)), the
   post-in date (D308, opening on today), Restore (or "Restore as <typed>"), Save name (a rename alone — D295), Delete
   (two taps). Restore brings his sign-in back with him (D322) and opens a new stint on the war (D320). */
function ArchivedRow(p: { pid: string; open: boolean; ringed?: boolean; onToggle: () => void; onClose: () => void }) {
  const person = P(p.pid)
  const a = accountOfPid(p.pid)
  const callsign = cs(p.pid)
  return (
    <div className={'acc-row od-row' + (p.open ? ' od-row-on' : '') + (p.ringed ? ' acc-ring' : '')} data-person={p.pid} data-archived="1" {...(a ? { 'data-acct': a.id } : {})}>
      <button className="acc-main acc-tap" onClick={p.onToggle} title={`Restore or delete ${callsign}`}>
        <span className="acc-name">{callsign}</span>
        <span className="acc-sub">{a ? <b>{a.name}</b> : 'no sign-in'}{' · '}{seatText(person)}</span>
        {/* D329: how and when he came to be archived — one line */}
        {archivedLine(p.pid) && <span className="acc-sub od-archline" data-testid={`arch-line-${p.pid}`}>{archivedLine(p.pid)}</span>}
      </button>
      <Dots pid={p.pid} a={a} archived />
      <span className="od-rc">{a && <span className={'ub ' + a.role}>{isAdminAccount(a) ? 'Admin' : 'Member'}</span>}</span>
      {p.open && <ArchivedEditor pid={p.pid} a={a} onClose={p.onClose} />}
    </div>
  )
}

/* HIS OPEN ARCHIVED ROW'S EDITOR — the callsign box, the post-in date and the buttons. A piece of its own (React Doctor
   no-high-complexity-react-function, 8 Nov 26) holding what is typed: the row is drawn afresh each time it opens or
   closes (its key changes with the editor), so the boxes open on his callsign (or the next free one) and today, as
   before. His callsign, and whether a man on the roster holds it, are read afresh on every draw, as they were. */
function ArchivedEditor(p: { pid: string; a: Account | undefined; onClose: () => void }) {
  const { a } = p
  const callsign = cs(p.pid)
  const taken = !!callsignProblem(callsign, p.pid)
  const [box0] = useState(() => (taken ? nextFreeCallsign(callsign, p.pid) : callsign))
  const [box, setBox] = useState(box0)
  const [postIn0] = useState(effectiveToday)
  const [postIn, setPostIn] = useState(postIn0)
  const [err, setErr] = useState('')
  const [armDel, setArmDel] = useState(false)
  /* counted for the guard once the callsign or the post-in date differs from how the row opened (D2598; ui/guard.ts) */
  useGuardWork('archrow', box !== box0 || postIn !== postIn0)
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
    <div className="acc-edit" data-restoring={p.pid}>
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
    </div>
  )
}

const BLANK: NewPerson = { cs: '', ini: '', seat: '', cat: '' }
/* the column heads over the two dots, drawn once over each list */
const Cols = () => (
  <div className="od-cols" aria-hidden="true"><span className="od-grow" /><span className="od-c">Sign-in</span><span className="od-c">Roster</span><span className="od-rc" /></div>
)

/* A BELL'S POSTING LINE LANDS HERE ([POSTOUT-RUN-NOTICE] — D1547: "a tap opening his row on Admin → Users"; the drawing
   of record docs/mock/2026-11-05-postout-bell/, pictures 3). Each new tap (its `seq`), worked out as the list draws — no
   effect, no second draw: the search cleared so it cannot hide him, the Archived fold opened for an archived man; what he
   has half-typed here (a new person, a row's change) is left as it is (the build's code read, 3 — the list was once drawn
   afresh for each tap and lost it). Once his row is drawn it is brought into view, wearing the app's one just-added mark
   (the board's plain blue ring, no glow — D860, D876) while the Admin page holds `ring.on`. Answers the man ringed now. */
type Ring = { seq: number; pid: string; on: boolean } | null | undefined
function useRingLanding(ring: Ring, setFind: (v: string) => void, setArchOpen: (v: boolean | null) => void): string | null {
  const [ringSeen, setRingSeen] = useState(0)
  if (ring && ring.seq !== ringSeen) {
    setRingSeen(ring.seq)
    setFind('')
    setArchOpen(P(ring.pid) && P(ring.pid).archived ? true : null)
  }
  const ringPid = ring && ring.on ? ring.pid : null
  const ringAt = ring && ring.on ? ring.seq : 0
  useEffect(() => {
    if (!ringPid) return
    const row = Array.from(document.querySelectorAll<HTMLElement>(`#page-admin .acc-row[data-person="${CSS.escape(ringPid)}"]`)).find(x => x.getBoundingClientRect().height > 0)
    row?.scrollIntoView?.({ block: 'center' })
  }, [ringPid, ringAt])
  return ringPid
}

/* `shown` — this list is on the admin's screen (the Admin page decides: Users chosen, and on a phone drilled in);
   `openNew` — a non-zero, changing value opens the add form with its callsign box ready (Quals'
   "+ Add person", through the Admin page — state/view.ts ADMINOPEN);
   `ring` — a man to bring into view, ringed while `on` (a bell's posting line — [POSTOUT-RUN-NOTICE]) */
/* THE FILTER'S TICKS. A PICK CLEARS THE SQUADRON TICKS ((j), his D2396): a pick means "show me this squadron", so the page
   must not need a second step to obey. Seat, CAT, Role and the search stay. Set while drawing, so no frame shows the old
   squadron's list. */
function useUsersFilter(unit: string): [UsersFilter, (f: UsersFilter) => void] {
  const [filt, setFilt] = useState<UsersFilter>(NO_FILTER)
  const [ticksOn, setTicksOn] = useState(unit)
  if (unit !== ticksOn) {
    setTicksOn(unit)
    if (filt.sqn.length) setFilt({ ...filt, sqn: [] })
  }
  return [filt, setFilt]
}
/* is this man's row on the list as it is drawn: not hidden by a tick or the search, his Archived fold open */
const rowInView = (v: UsersView, pid: string | null, archOpen: boolean): boolean =>
  !!pid && (v.groups.some(g => g.rows.includes(pid)) || (archOpen && v.archived.includes(pid)))

export function UsersPanel(p: { shown?: boolean; openNew?: number; ring?: Ring } = {}) {
  const [editing, setEditing] = useState<string | null>(null)
  const [find, setFind] = useState('')
  /* the Archived group's fold: his own tap, or — while he has not tapped since the search changed — open exactly when
     the search matches someone archived (the walk's design, Fable R7: the tap used to do nothing while a search matched) */
  const [archOpen, setArchOpen] = useState<boolean | null>(false)
  const [name, setName] = useState('')
  const [np, setNp] = useState<NewPerson>(BLANK)
  const [role, setRole] = useState<AccountRole>('main')
  /* the date the form last opened fresh on (its first draw, then each resetAddForm) — what its report compares with, so
     an untouched form left open past midnight never reads as changed (K2b) */
  const [postIn0, setPostIn0] = useState(effectiveToday)
  const [postIn, setPostIn] = useState(postIn0)
  /* (Add a person's Home squadron box is gone — his D2729 Q1, 26 Nov 26: a new man always joins the squadron in view, for
     every admin on every page; ui/usersfilter-model.ts addHomeChoices stays there, the Admin → Users section's to keep
     or remove) */
  /* ADD A PERSON OPENS IN PLACE, UNDER THE PAGE'S TOP ROW (his D2599, D2628, D2655, D2652 N13 i): folded until "+ Add a
     person" is pressed. While it is open the opener is NOT on the page — never two add buttons on screen at once (his
     D2726, D2729 Q10). Only Cancel or Escape folds it, and both empty it first (resetAddForm), so a fold never keeps
     typing a later step would have to count (the plan's Opus F-h); an add empties it and leaves it open for the next man. */
  const [adding, setAdding] = useState(false)
  /* the filter's ticks (D2335 — ui/usersfilter-model.ts); kept while the page is open, as the search is */
  const [filt, setFilt] = useUsersFilter(pageUnit('own'))
  const addRef = useRef<HTMLDivElement>(null)
  const csRef = useRef<HTMLInputElement>(null)
  const openRef = useRef<HTMLButtonElement>(null)

  /* D216, D227 — the list has been on this admin's screen: his bell goes out */
  useEffect(() => {
    /* (the requests SHOWN — the page's squadron's — never the whole list: another squadron's stays new, §5, R-O9) */
    const here = pageUnit('own')
    if (!p.shown || !unseenRequests().some(r => r.unit === here)) return
    const bad = markRequestsSeen()
    if (!bad) notify()
  })
  /* Quals' "+ Add person" (D217): the form in view, the callsign box ready — after the render that drew it (the walk,
     26 Sep 26: a focus asked on a timer landed before the real browser had drawn the box) */
  /* …the form opened for it at the top of the page (D2628 C11), so the scroll only brings the top into sight — no scroll
     to a foot. The opener's own press asks the same focus (-1: any value but 0). */
  const wantFocus = useRef(0)
  useEffect(() => { if (p.openNew) { wantFocus.current = p.openNew; setAdding(true) } }, [p.openNew])
  useEffect(() => {
    if (!wantFocus.current || !csRef.current) return
    wantFocus.current = 0
    addRef.current?.scrollIntoView?.({ block: 'nearest' })
    if (!HOOKS.isPhone()) csRef.current.focus()
  })

  /* a bell's posting line landing here ([POSTOUT-RUN-NOTICE]) — useRingLanding, above */
  const ringPid = useRingLanding(p.ring, setFind, setArchOpen)

  const hasName = !!name.trim()
  const resetAddForm = () => { const t = effectiveToday(); setName(''); setNp(BLANK); setRole('main'); setPostIn0(t); setPostIn(t) }
  /* THE FORM'S REPORT TO THE GUARD (D2598, §18.3; ui/guard.ts's `addperson` row): counted while the form is open and
     anything in it differs from how a fresh form opens — each value the one resetAddForm and the first draw set, the
     post-in date the one it last opened fresh on (never today's, which moves at midnight under an untouched form).
     Folded counts nothing: only Cancel and Escape fold it, and both empty it first. */
  useGuardWork('addperson', adding && (name !== '' || JSON.stringify(np) !== JSON.stringify(BLANK) || role !== 'main' || postIn !== postIn0))
  const add = () => {
    const nm = name.trim().toLowerCase()
    const who = np.cs.trim()
    const ok = hasName ? `${who} added — ${nm} can sign in now` : `${who} added to the roster — set flight and quals on the Quals page`
    /* no home named: the door makes him the page's own squadron's — his home row and his first stint (accounts.ts
       addPersonAndAccount, PD1) — the squadron in view, always (D2729 Q1). Today's call otherwise, argument for argument. */
    if (done(addPersonAndAccount(name, np, role, postIn), ok)) resetAddForm()
  }
  /* Cancel, and Escape as it leaves an opened row ((p), his D2396): the form emptied and folded, the opener back with the
     keys on it (the design guide §2 — the keys go back to the button that opened it) */
  const addShutting = useRef(false)
  const shutAdd = () => { resetAddForm(); setAdding(false); addShutting.current = true }
  useEffect(() => {
    /* only while it is on his screen (Users chosen), as the opened row's Escape; an open Filter panel answers first */
    if (!adding || !p.shown) return
    const off = escCloses(() => addRef.current, shutAdd, null, { id: 'accAddBlock' })
    escToTop(FILTER_ESC)
    return off
  // eslint-disable-next-line react-hooks/exhaustive-deps -- on the form's opening and closing only: shutAdd calls setters alone
  }, [adding, p.shown])
  useEffect(() => {
    if (adding || !addShutting.current) return
    addShutting.current = false
    keysBack(() => openRef.current)
  }, [adding])
  /* the search (the agent's call on the approved page): a callsign or a sign-in name, anywhere in it; the Archived
     group opens while it holds a match */
  const q = find.trim().toLowerCase()
  /* BY SQUADRON (batch 1's second half §4 item 1 — 7a, R-O4, 5b; O3): the page's squadron's people, its Plan holders and
     its archived men; a search also finds a man of another squadron (ui/userslist-model.ts). The heading counts the
     squadron's own people only. (How a Plan holder's or another squadron's row reads — "· also plans 149", his
     squadron, read only — is the screens' step, phase 3, drawn first.) */
  /* THE FILTER (D2335, D2307) AND A MASTER ADMIN'S SQUADRONS (D2270): the rows a tick keeps, A to Z, never reordered
     (D322); a master admin's Squadron ticks group the list under each squadron's heading (ui/usersfilter-model.ts) */
  const unit = pageUnit('own'), today = todayIso()
  const master = actorIsMaster()
  const view = usersView(unit, today, q, filt, master)
  const archShown = view.archived
  const archOpenNow = archOpen ?? (!!q && archShown.length > 0)
  const toggle = (pid: string) => setEditing(editing === pid ? null : pid)
  /* ESCAPE CLOSES THE OPENED ROW AS ITS CANCEL DOES ((p), his D2396): nothing saved, no question, the keys back on the row;
     an open Filter panel answers first. Only while the row is on his screen: Users chosen, the row not hidden by a tick
     or the search. */
  useEscRow(p.shown && rowInView(view, editing, archOpenNow) ? editing : null,
    pid => document.querySelector<HTMLElement>(`.acc-row[data-person="${CSS.escape(pid)}"]`),
    () => setEditing(null), FILTER_ESC)
  const row = (pid: string) => <PersonRow key={pid + (editing === pid ? ':e' : '')} pid={pid} open={editing === pid} ringed={ringPid === pid}
    onToggle={() => toggle(pid)} onClose={() => setEditing(null)} />
  const nobody = !view.groups.some(g => g.rows.length)
  return (
    <>
      {/* THE PAGE'S TOP ROW (his D2652 N13 i — the drawings s3-8-d-column, s2-10-p-waiting): the search, Filter and
          "+ Add a person" one row at the very top, above "Waiting for access", so an admin never scrolls down to add
          people (D2599); on a phone the search and Filter one row, the button full width under them (postout.css). The
          search still filters what it filtered beside "People" (the Admin → Users section makes it filter every group). */}
      <div className="od-top" id="accTop">
        {/* the search and, beside it, the Filter button and its panel (D2335 — picture nfa) */}
        <div className="od-findrow">
          {/* the app's line magnifier, as in every search box (owner D1127, 21 Oct 26 — never the coloured emoji) */}
          <div className="searchbox od-find"><SrchIcon /><input id="accFind" type="search" value={find} placeholder="Find a callsign or sign-in"
            aria-label="Find a callsign or sign-in" onChange={e => { setFind(e.target.value); setArchOpen(null) }} /></div>
          <UsersFilterBox f={filt} onChange={setFilt} unit={unit} master={master} cats={view.cats} />
        </div>
        {/* not on the page while the form is open — the search widens into its place (D2726, D2729 Q10) */}
        {!adding && <button type="button" className="abtn od-addbtn" id="accAddOpen" ref={openRef}
          onClick={() => { wantFocus.current = -1; setAdding(true) }}>+ Add a person</button>}
      </div>
      {adding && (
        <>
          <div id="accAddBlock" className="od-add" ref={addRef}>
            {/* "ADD A PERSON" — the page's own section heading (.adm-sub draws it in capitals), as "Waiting for access" */}
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
            {/* the note above the pair, as drawn (s1-add2-a); its words his (D2655 D1) */}
            <p className="adm-note acc-note" id="accAddNote">Makes his Quals row, and his sign-in if you give one. The Leave War counts him from the post-in date.</p>
            {/* ONE PAIR (D2644, lesson 103): the same row of buttons and the same two buttons as an opened row's Save and
                Cancel — so the same size and aligned by the app's own rules, never a width of its own */}
            <div className="acc-acts">
              <button className="abtn primary" id="accAdd" onClick={add}>{hasName ? 'Add person and sign-in' : 'Add person'}</button>
              <button className="abtn" id="accAddCancel" onClick={shutAdd}>Cancel</button>
            </div>
          </div>
          <hr className="adm-sep" />
        </>
      )}
      <h4 className="adm-sub">Waiting for access</h4>
      <Waiting />
      <hr className="adm-sep" />
      <div className="od-head">
        <h4 className="adm-sub">People · {view.people}</h4>
      </div>
      {view.line && <ShowingLine words={view.line} onClear={() => setFilt(NO_FILTER)} />}
      <div data-testid="acc-groups">
        {nobody
          ? <div className="acc-list od-list" id="accList"><Cols /><p className="adm-note" id="accNoMatch">Nobody matches.</p></div>
          : view.groups.map((g, i) => (
            <div key={g.unit}>
              {g.head && <h4 className={'adm-sub od-grphead' + (i ? ' next' : '')} data-unit-head={g.unit}>{g.head}</h4>}
              <div className="acc-list od-list" id={i === 0 ? 'accList' : undefined} data-unit={g.unit}>
                {i === 0 && <Cols />}
                {g.rows.map(row)}
              </div>
            </div>
          ))}
      </div>
      {view.archivedAll > 0 && (
        <div className="od-arch" id="accArchived">
          <button className="abtn" id="accArchToggle" aria-expanded={archOpenNow} onClick={() => setArchOpen(!archOpenNow)}>
            {archOpenNow ? '▾' : '▸'} Archived · {view.archivedAll}
          </button>
          {archOpenNow && (
            <div className="acc-list od-list" id="accArchList">
              <Cols />
              {archShown.map(pid => <ArchivedRow key={pid + (editing === pid ? ':e' : '')} pid={pid} open={editing === pid} ringed={ringPid === pid}
                onToggle={() => toggle(pid)} onClose={() => setEditing(null)} />)}
            </div>
          )}
        </div>
      )}
      {/* (the "Add a person" block that stood here, at the page's foot, now opens under the top row — D2652 N13 i) */}
      {/* (the "Guest view" switch that stood here, under its own rule, is removed with the guest view — his D2239,
          20 Nov 26: a person waiting sees only the waiting screen until an admin of his squadron approves him) */}
    </>
  )
}
