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
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PEOPLE, nameToId, archivedHolders } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { elogWhen } from '../engine/editlog'
import {
  accountOfPid, linkablePeople, addAccount, updateAccount, waitingHere, unseenRequests,
  approveRequest, approveRequestNew, addPersonAndAccount, declineRequest, saveAccess,
  requestSummary, accessAlert, markRequestsSeen, MAX_SIGNIN, isAdminAccount, signedInAccount, levelIn,
  type Account, type AccountRole, type AccessRequest, type AccessSave, type AccessLine,
} from '../state/accounts'
import { RoleBox, SquadronLines, RolesFold } from './UserAccess'
import {
  accessLinesOf, alsoPlansOf, rolePickOf, actorIsMaster, shortRoleOf, holdsHereOf, noSignInWords, changedWhileOpenWords,
  type RolePick,
} from './useraccess-model'
import {
  SEATS, catsFor, MAX_CS, MAX_INITIALS, CALLSIGN_LABEL, CS_TOO_LONG, callsignProblem, nextFreeCallsign, type NewPerson,
} from '../state/roster-add'
import { SESSION } from '../state/auth'
import { me, pageUnit, adminOfUnit, isAdmin, pageOffered } from '../state/perms'
import { todayIso, homeOn, unitById } from '../state/units'
import { usersView, NO_FILTER, type UsersFilter, type UsersView } from './usersfilter-model'
import { UsersFilterBox, ShowingLine, FILTER_ESC } from './UsersFilter'
import { useEscRow, escCloses, escToTop, keysBack } from './sheetfocus'
import { notify } from '../state/store'
import { enteredByPick } from '../state/typing-hold'
import { deletePerson, effectiveToday } from '../state/person-delete'
import { updatePersonField } from '../state/quals-write'
import { markBack } from '../state/view'
import {
  postingHeldNote, postingPendingTag, archivedLine, archivePerson, restoreArchivedPerson, restoreArchivedAs, restoreProblem,
} from '../leavewar/sync'
import './postout.css'
import { DateBox } from './DateBox'
import { useGuardSection, useGuardWork } from './guard'

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
/* FOREIGN HERE (his D2625, D2652 N3 e, D2655 D5; the plan §19.1 with §21.2's step-0 block): his home that day is not the
   page's squadron. Every rule of the short row hangs on this one predicate and on nothing else — what his row shows,
   what it opens to, and the judging again at its Save. */
const foreignHere = (pid: string): boolean => otherSqnOf(pid) !== null
/* AN OPEN ROW, AS IT WAS JUDGED AT THE PRESS THAT OPENED IT (U1's fix — the Opus read's F1 and F2, the security read's A1–
   A7, chat 199; widened by its second round, the four reads of chat 205): the squadron whose page it opened on (`unit`),
   whether it opened short — another squadron's man there — or whole (`short`), HIS HOME SQUADRON THAT DAY (`home`),
   WHETHER HE WAS ARCHIVED (`arch`), and the squadron in view (`view` — what tells the signed-in person's own pick from any
   other change of the page's squadron: closedByHisPick, below). Since the fourth round it holds two more: WHO IS LOOKING
   (`admin` — adminThere, below) and THE COPY of everything the row shows and could write over (`shown` — below). Held by
   the page for every open row — the archived man's too — and handed WHOLE to whichever of the three editors the row
   draws: none of them rebuilds a part of it. */
type OpenedOn = { unit: string; short: boolean; home: string | null; arch: boolean; view: string; admin: boolean; shown: Shown | null }
/* THE COPY — THE ONE GUARD (U1's fourth round, chat 205; his D2404 — a guard rail before another patch). Three fix rounds
   each closed another stale-row case; they were one fault: an opened row worked from what it read when it opened, and
   only some of that was judged against the store as it is now. So an opened row keeps a copy of EVERYTHING it shows and
   could write over, taken at the press that opened it and held by the page with the four facts above:
   - whether he has a sign-in and which account it is (`acct`), its sign-in name, his role as the Role box shows it — the
     master admin mark first — and whether it is switched on;
   - each other squadron's line as the row shows it (`lines`), and his callsign;
   - on an archived man's row, what its two boxes open on too: whether a man on the roster holds his callsign (`taken`),
     the callsign its box opens on (his own, or the next free one) and the post-in date (today).
   ONE READER (shownOf) BUILDS IT AND THE EDITORS DRAW FROM IT AND FROM NOTHING ELSE OF HIS — the whole row's and the
   archived row's editors are handed the copy and read no account, no person and no line themselves, so a field one of
   them shows is in the copy by construction (ui/msq-s2-rejudge4.test.tsx §20 holds that: the names each editor may use,
   and every stored field of the man changed in turn under his open row). Compared whole with the store on every draw of
   the page, on every draw of the row's editor and at the head of every action the row takes (rowChanged): anything
   different → nothing is written, the row closes, the passing note (his D2730 Q13), once. That closes at once a sign-in
   given or taken under an open whole row (it turned "Give sign-in" into "Save" under the admin's hand, and that Save
   demoted and renamed the man another admin had just made — the fresh Opus's finding 1 of the third read); a role, a
   name or a line changed by another admin or by the signed-in admin's own Undo or Redo and then written back by the
   row's Save; and the whole row keeping the squadron lines it opened with.
   THE SHORT ROW HOLDS NO COPY (null): it follows the store on every draw, as the second round built it and two reads
   passed — his account, the line he holds and his home's number read afresh, his Save comparing the admin's pick with
   the store at that moment (ForeignEditor, below). A sign-in given under its open "No sign-in" words, and one taken
   away, are followed live too (msq-s2-rejudge3.test.tsx §15 pins both); what it does not follow — which sign-in the
   admin's pick was made on — is held with the pick (Typed, below).
   WHAT THE ADMIN TYPES OR PICKS IS NEVER THE COPY: "changed" always means the STORE differs from the copy. */
type Shown = {
  acct: string | null; name: string; role: RolePick; on: boolean; lines: Record<string, AccessLine>; cs: string
  taken: boolean; box: string; postIn: string
}
type RowKind = 'whole' | 'short' | 'arch'
/* (an archived man's row is the archived row whoever's man he is — a master admin's Squadron tick lists another
   squadron's archived men, the as-built pins B1 and B2) */
const kindOf = (on: { short: boolean; arch: boolean }): RowKind => (on.arch ? 'arch' : on.short ? 'short' : 'whole')
function shownOf(pid: string, kind: RowKind): Shown | null {
  if (kind === 'short') return null
  const a = accountOfPid(pid)
  const callsign = cs(pid)
  /* THE ROLE HIS ACCOUNT GIVES TODAY, as his row's badge reads it (roleWordOf — accounts.ts adminNow), never the stored
     role alone (the sign-in re-walk, 22 Nov 26): an admin who moved squadron is a member of the one he joined (K3, D2160)
     while his account still stores "admin", so the box opened on Admin beside a row reading MEMBER, and saving Admin
     changed nothing and said nothing. Picking Admin and saving now sends the role, and the account door records it for
     the squadron he is in today (accounts.ts updateAccount, adminRecFor). The master mark is the box's third choice
     (D2303). */
  const role = rolePickOf(a, a && isAdminAccount(a) ? 'admin' : 'main')
  const arch = kind === 'arch'
  const taken = arch && !!callsignProblem(callsign, pid)
  return {
    acct: a ? a.id : null, name: a ? a.name : '', role, on: !!a && a.on, lines: accessLinesOf(a, pid), cs: callsign,
    taken, box: !arch ? '' : taken ? nextFreeCallsign(callsign, pid) : callsign, postIn: arch ? effectiveToday() : '',
  }
}
const sameShown = (x: Shown | null, y: Shown | null): boolean => JSON.stringify(x) === JSON.stringify(y)
/* WHO IS LOOKING (the fourth round — the security reader's finding 1 and the fresh Fable's finding 1 of the third read,
   found blind by both): whether the signed-in person's ACCOUNT, as it stands in the store today, still makes him an admin
   of the squadron the row opened on — its own admin, a Plan holder of it, or a master admin. Hunter, working 149 by his
   Plan with a 149 man's row open, moved to 149 at midnight: none of the row's own facts changed — the page still 149's,
   the man still 149's own — yet the move made him a member there (K3), the Admin page went, and his row and his typing
   went with it without a word. The same when another admin makes him a member under his open row (his home does not
   change then, so this asks about his standing, never only his home). A master admin who moves stays an admin of every
   squadron and keeps his row. Read from the store, not from the session: the session still says "admin" until the app
   makes it again after the next draw (ui/App.tsx), and with nothing redrawn a press must ask the same. It decides only
   whether an open row closes — it offers no control and lets no write through (the doors judge every write themselves).
   A session with no account behind it (a hand-made test session) has no standing to lose. */
const adminThere = (unit: string): boolean => {
  const a = signedInAccount()
  return !a || levelIn(a.id, unit, todayIso()) === 'admin'
}
const judgedNow = (pid: string): OpenedOn => {
  const unit = pageUnit('own'), short = foreignHere(pid), arch = !!P(pid)?.archived
  return {
    unit, short, home: homeOn(pid, todayIso()), arch, view: pageUnit('schedule'),
    admin: adminThere(unit), shown: shownOf(pid, kindOf({ short, arch })),
  }
}
/* THE ROW CHANGED UNDER IT (his D2730 Q13): ANY of the four facts no longer holds — the page's squadron is another;
   "another squadron's man here" flipped; his home is no longer the one the row opened on (a move from one other squadron
   to another leaves him another squadron's man here, yet ends what he held of this one and whose admin to ask — the
   Fable read 3, Astra 4); he was archived or restored under it (an open row is never carried from his roster row to his
   archived row or back — the Fable read 2, the security read) — OR the signed-in person's standing went (adminThere),
   OR anything in the copy differs from the store (shownOf, as the row opened: whole or archived). The squadron in view
   is no part of it: a pick that leaves the page's own squadron as it was (a View holder's) leaves the row open. Asked by
   the page on every draw, by each editor on every draw of its own, and at the head of every action an editor takes. */
const rowChanged = (pid: string, on: OpenedOn): boolean =>
  pageUnit('own') !== on.unit || foreignHere(pid) !== on.short || homeOn(pid, todayIso()) !== on.home || !!P(pid)?.archived !== on.arch
  || adminThere(on.unit) !== on.admin || !sameShown(shownOf(pid, kindOf(on)), on.shown)
/* WHAT THE ADMIN HAS TYPED OR PICKED IN THE OPEN ROW — HIS, NEVER THE COPY — HELD BY THE PAGE WITH THE OPEN ROW (the fourth
   round — Astra's finding 1 of the third read). Each group of the list draws under its own parent, so a man who moves
   from one group to another has his editor made anew; what the admin had picked or typed lived inside the editor and went
   with it, without a word — Saber's unsaved View for Hunter, when his own Undo moved Hunter from under 149's heading to
   under 150's. The page holds it: started from the copy at a fresh opening, cleared at close, handed to whichever editor
   the row draws. So a regrouping alone — and a row he hid by his own search and brought back — keeps his outstanding
   choice while the row stays open.
   `pick` — the short row's: the line he picked, WITH THE SIGN-IN IT WAS PICKED ON (the one thing the short row does not
   follow live): a pick counts only while that sign-in is still the man's, so it is never carried onto a sign-in given to
   him later. The archived row's two boxes stay its editor's own: the Archived fold is one list, never regrouped. */
type Typed = { name: string; role: RolePick; lines: Record<string, AccessLine>; pick: { acct: string; line: AccessLine } | null }
const typedFrom = (s: Shown | null): Typed => ({ name: s ? s.name : '', role: s ? s.role : 'main', lines: s ? s.lines : {}, pick: null })
/* THE BELT, AT THE HEAD OF EVERY WRITE AN OPENED ROW MAKES — one for all three editors: the whole row's Save, Suspend /
   Enable, Give sign-in, Archive and Delete; the short row's Save; the archived row's Restore, "Restore as", Save name and
   Delete (both of Delete's taps, the arming one too). The page closes a row whose judgement changed when it next draws,
   but his move landing as the date rolls past its day redraws nothing, so each press asks again first: where the row
   changed under it, nothing is sent, the row closes, and the passing note says so (his D2730 Q13 — the one note, the
   existing words). True when the press may go on. */
function askAgain(pid: string, on: OpenedOn, onClose: () => void): boolean {
  if (!rowChanged(pid, on)) return true
  HOOKS.toast(changedWhileOpenWords(cs(pid)), 'warn'); onClose()
  return false
}
/* AN EDITOR JUDGES ITSELF ON ITS OWN DRAWS TOO (Astra 2): typing in an opened row redraws its editor alone — a draw the
   page does not judge — so after his move landed with nothing redrawn, the first key drew the whole editor again for a man
   by then another squadron's. Each editor asks on every draw; where the row changed it draws nothing (the caller returns
   null on `true`) and, once that draw is committed and before it is painted, asks the page to draw again — the page's own
   judging then closes the row and raises the note by its one rule (useOpenRowJudged). So the note has one home: never
   twice with the page's own, and once where a draw runs twice (React's strict mode — asking the page twice draws it
   twice, and the second finds the row already closed). */
function useJudgedOnDraw(pid: string, on: OpenedOn, onStale: () => void): boolean {
  const stale = rowChanged(pid, on)
  useLayoutEffect(() => { if (stale) onStale() }, [stale, onStale])
  return stale
}

/* THE SHORT ROW'S SECOND LINE — seat and CAT, his role in words, what he already holds of the page's squadron, "you" on
   the signed-in admin's own (ui/useraccess-model.ts shortRoleOf, holdsHereOf). No sign-in name, no posting tag, no held
   note: those are his own squadron's (D2625 — only what identifies him and this squadron's line). */
function ShortSub(p: { pid: string; a: Account | undefined; person: any; unit: string; own: boolean }) {
  const role = shortRoleOf(p.a)
  const holds = holdsHereOf(p.a, p.unit)
  const plans = !!holds && holds.startsWith('also plans')
  return (
    <span className="acc-sub">
      {seatText(p.person)}
      {role && <span className="od-rw"> · {role}</span>}
      {holds && <span className="od-plans" data-testid={`${plans ? 'plans' : 'views'}-${p.pid}`}> · {holds}</span>}
      {p.own && <span className="acc-tag you">you</span>}
    </span>
  )
}

/* THE SHORT ROW, OPENED — ONE LINE, THE PAGE'S SQUADRON'S, WITH SAVE AND CANCEL, AND NOTHING ELSE (D2625, D2655 D5): no
   sign-in box, no Role box, no other squadron's line, no Suspend, Archive or Delete — not greyed, not drawn. A man with no
   sign-in opens to words in place of the line, and Cancel alone (none of the whole row's give-a-sign-in branch).
   ITS OWN SAVE — WHAT KEEPS THE REST SAFE, NOT THE HIDING (Astra 2 of the plan's third read): it sends this squadron's
   line and nothing else — never the sign-in name, the role, the master mark or another squadron's line — and never goes
   through the whole row's accessWant / rename path. The whole row captures his name and role when it opens, so an Undo of
   a rename under it would be sent again with the line.
   JUDGED AGAIN ON EVERY DRAW AND AT ITS SAVE, AS EVERY OPENED ROW IS (U1's two fix rounds — rowChanged, above): the page
   closes it the moment the judgement it opened on no longer holds; its own draws ask too (useJudgedOnDraw); and its Save
   asks once more first (askAgain) — where the row changed, nothing is sent, the row closes, and the passing note says so
   (his D2730 Q13). The judgement is held by the page (UsersPanel's editOn) from the press that opened it and handed
   whole (`on`).
   IT SHOWS THE LINE HE HOLDS TODAY, AND HOLDS ONLY WHAT THE ADMIN PICKED (the Fable read 4, the Opus read 2 — it held his
   line from the press that opened it, so another admin's change of it, or the admin's own Undo, left the open row showing
   a line he no longer held beside its own second line saying the opposite, and its Save, comparing with the old line,
   sent nothing and said nothing): his account, his line and his home squadron's number are read afresh on every draw, so
   an untouched row always shows today's; `picked` is the admin's own choice, null until he makes one. Its change not
   saved is marked on the row (`data-unsaved`): picked, and not the line he holds now — the whole row has no such report
   yet (the guard's opened-row count is the core's K1, not landed on this branch). Save reads the line he holds once more
   (a press with nothing redrawn) and sends only a pick that differs from it. The row stays open across such a change —
   he is still another squadron's man on the same page — never closed for it, WHILE HE STAYS ON THE PAGE'S LIST: a Plan
   holder listed only for his Plan leaves the list when it goes, and the page then closes the row with the note
   (useOpenRowJudged — the third round, the Fable read 3).
   A PICK PUT BACK BY HAND IS LET GO (the third round — the security read 1): a press of the very line he holds was kept as
   a pick, so View pressed and then None pressed again left a row reading as untouched yet holding "None"; when another
   admin then gave him View, the row turned, with no press, into a change back to None, and its Save undid the other
   admin's act — at worst gave back a Plan lowered on purpose. Pressing the line the row shows him holding lets the pick
   go, so the row is the untouched row it reads as.
   THE PICK IS HELD BY THE PAGE, WITH THE SIGN-IN IT WAS MADE ON (the fourth round — Astra's finding 1; Typed, above): it
   was this editor's own, so a regrouping of the list, which makes the editor anew, dropped it without a word. And it
   counts only while that sign-in is still his: where his sign-in was put on another man and he was later given a new
   one, the row shows the new sign-in's line untouched. */
function ForeignEditor(p: {
  pid: string; on: OpenedOn; typed: Typed; onTyped: (t: Typed) => void; onClose: () => void; onStale: () => void
}) {
  const stale = useJudgedOnDraw(p.pid, p.on, p.onStale)
  const unit = p.on.unit
  /* what he holds, read from the store as it stands — on every draw, and once more at Save — and the admin's pick, where
     it was made on the sign-in he holds now */
  const heldNow = () => {
    const a = accountOfPid(p.pid)
    const rolePick = rolePickOf(a, a && isAdminAccount(a) ? 'admin' : 'main')
    const picked = a && p.typed.pick && p.typed.pick.acct === a.id ? p.typed.pick.line : null
    return { a, rolePick, picked, line: (accessLinesOf(a, p.pid)[unit] ?? 'none') as AccessLine }
  }
  const { a, rolePick, picked, line: lineNow } = heldNow()
  const line = picked ?? lineNow
  const unsaved = !!a && rolePick !== 'master' && picked !== null && picked !== lineNow
  const save = () => {
    if (!askAgain(p.pid, p.on, p.onClose)) return
    const held = heldNow()
    if (!held.a || held.rolePick === 'master' || held.picked === null || held.picked === held.line) return p.onClose()
    if (done(saveAccess(held.a.id, { grants: { [unit]: held.picked } }), 'Saved')) p.onClose()
  }
  if (stale) return null
  return (
    <div className="acc-edit" data-editing={a ? a.id : p.pid} data-short="1" {...(unsaved ? { 'data-unsaved': 'true' } : {})}>
      {a
        ? <SquadronLines pid={p.pid} hasSignIn rolePick={rolePick} only={unit} now={{ [unit]: lineNow }} pick={{ [unit]: line }}
            onPick={(u, v) => {
              if (u !== unit) return
              p.onTyped({ ...p.typed, pick: v === lineNow ? null : { acct: a.id, line: v } })
              /* (letting go where nothing was held changes nothing, so it draws nothing: the press itself asks, and where
                 the row changed under it the page is asked to draw again — its judging closes the row and says so) */
              if (rowChanged(p.pid, p.on)) p.onStale()
            }} />
        : <p className="adm-note acc-note" id="accEdNoSignIn">{noSignInWords(otherSqnOf(p.pid) ?? '')}</p>}
      <div className="acc-acts">
        {a && <button className="abtn primary" id="accEdSave" onClick={save}>Save</button>}
        <button className="abtn" id="accEdCancel" onClick={p.onClose}>Cancel</button>
      </div>
    </div>
  )
}
/* THE ROW'S ONE SAVE (D2303): the role, the master mark and every squadron's line changed, as saveAccess takes them —
   Master admin picked, the lines are not sent (the door drops his rights with the mark, R-O10); null, nothing changed */
/* (`pickNow` — his role as the copy holds it, the master mark first: "master" there is the mark on his account) */
function accessWant(role: RolePick, pickNow: RolePick, lines: Record<string, AccessLine>, linesNow: Record<string, AccessLine>): AccessSave | null {
  const want: AccessSave = {}
  if (role !== pickNow) {
    if (role === 'master') { want.role = 'admin'; want.master = true }
    else { want.role = role; if (pickNow === 'master') want.master = false }
  }
  const changed = Object.keys(lines).filter(u => lines[u] !== linesNow[u])
  if (role !== 'master' && changed.length) want.grants = Object.fromEntries(changed.map(u => [u, lines[u]!]))
  return want.role !== undefined || want.master !== undefined || want.grants ? want : null
}
/* WHAT OF HIS ROW IS THE SIGNED-IN ADMIN'S TO CHANGE (D2191, R3, 5b — picture rB2): his sign-in, role, Suspend, Archive and
   Delete are an admin of his own squadron's (a man found by search, or a Plan holder from another squadron, shows only the
   lines of squadrons the admin may give access to live); a master admin's role a master admin's alone (setMaster).
   These are the SIGNED-IN admin's rights, read afresh on every draw and judged again by the doors at every write — never
   a fact of the man, so no part of the copy (`master` — the man holds the master mark, as the copy's role says). */
function rowLocks(pid: string, master: boolean): { rest: boolean; roleLocked: boolean } {
  const home = homeOn(pid, todayIso())
  const rest = !home || adminOfUnit(home)
  return { rest, roleLocked: !rest || (master && !actorIsMaster()) }
}

/* ONE ROW PER PERSON ON THE ROSTER (D309, D310). Tap it for his sign-in, his role and his state's buttons — never your
   own row (another admin changes it). A row with an account keeps `data-acct` (the account's id) beside `data-person`. */
function PersonRow(p: {
  pid: string; open: boolean; openOn?: OpenedOn | null; typed?: Typed | null; onTyped: (t: Typed) => void
  ringed?: boolean; onToggle: () => void; onClose: () => void; onStale: () => void
}) {
  const person = P(p.pid)
  const a = accountOfPid(p.pid)
  const own = (a && isOwnAccount(a)) || (me() != null && p.pid === me())
  const callsign = cs(p.pid)
  /* his posting out has come and is waiting — why (the last admin; a stored week), on his row, his own included */
  const held = postingHeldNote(p.pid)
  const roleWord = roleWordOf(a)
  const other = otherSqnOf(p.pid)
  /* ANOTHER SQUADRON'S MAN HERE: the short row (ForeignEditor, above). An OPENED row is drawn as it was judged at the
     press that opened it, held by the page with the squadron it opened on (`openOn` — UsersPanel's editOn; held there,
     not here, because a pick can draw this row afresh in another group). The page judges it again on every draw and
     closes it the moment that judgement changes (UsersPanel's useOpenRowJudged — U1's fix, the two reads of chat 199), so
     an open row is never swapped for the other kind and never carried onto another squadron's page; its editor judges
     itself on its own draws too (useJudgedOnDraw — the second round, chat 205). A closed row reads it afresh on every
     draw. */
  const openOn = p.open ? p.openOn ?? null : null
  const short = p.open ? !!openOn?.short : foreignHere(p.pid)
  return (
    <div className={'acc-row od-row' + (p.open ? ' od-row-on' : '') + (p.ringed ? ' acc-ring' : '')} data-person={p.pid} {...(a ? { 'data-acct': a.id } : {})}>
      <button className="acc-main acc-tap" disabled={!!own} onClick={p.onToggle}
        title={own ? 'Your own account — another admin can change it' : `Change ${callsign}`}>
        <span className="acc-name">{callsign}{other && <span className="acc-sqn" data-testid={`sqn-${p.pid}`}>{other}</span>}</span>
        {short
          ? <ShortSub pid={p.pid} a={a} person={person} unit={openOn?.unit ?? pageUnit('own')} own={!!own} />
          : <PersonSub pid={p.pid} a={a} person={person} roleWord={roleWord} own={!!own} />}
      </button>
      {/* (no dots and no role badge on the short row — D2654 E9g, D2655 D5) */}
      {!short && <Dots pid={p.pid} a={a} archived={false} />}
      {!short && <span className="od-rc">{a && <span className={'ub ' + a.role}>{roleWord}</span>}</span>}
      {!short && held && <span className="acc-held" data-testid={`acc-held-${a ? a.id : p.pid}`}>{held}</span>}
      {/* (never PersonEditor for another squadron's man here, by any route: the page closes a row whose judgement changed
          before it is drawn again, the second term holds it for this row's own draw, and the editor judges itself on a
          draw of its own, which neither the page nor this row sees) */}
      {p.open && !own && openOn && p.typed && (openOn.short
        ? <ForeignEditor pid={p.pid} on={openOn} typed={p.typed} onTyped={p.onTyped} onClose={p.onClose} onStale={p.onStale} />
        : !foreignHere(p.pid) && openOn.shown && <PersonEditor pid={p.pid} on={openOn} s={openOn.shown} typed={p.typed} onTyped={p.onTyped}
            onClose={p.onClose} onStale={p.onStale} />)}
    </div>
  )
}

/* HIS OPEN ROW'S EDITOR — his sign-in, his role and his state's buttons. A piece of its own (React Doctor
   no-high-complexity-react-function, 8 Nov 26).
   IT READS THE MAN ONLY THROUGH THE COPY (`s` — the page's, taken at the press that opened the row: shownOf). His account,
   his sign-in name, his role, whether it is switched on, every squadron's line and his callsign come from it and from
   nowhere else, and every write names his account by it. The row is judged against the store before every draw and at
   the head of every action (rowChanged), so while it stands the copy IS the store — and the moment they differ the row
   closes, with nothing written. No reader of his account or his person belongs in this function: a value it needs is
   added to the copy (msq-s2-rejudge4.test.tsx §20 lists what it may use, and fails on anything else).
   WHAT IS TYPED OR PICKED — the sign-in box, the Role box, the lines — is the admin's, held by the page with the open row
   (`typed`, started from the copy at each fresh opening), so the list regrouping under it never drops it. */
/* HAS THE ADMIN TYPED OR PICKED ANYTHING IN THE WHOLE ROW — the sign-in, the Role, a squadron's line: what is typed (the
   page's) against the copy the row opened on, never a second read of the man. The row's report to the leave-guard
   (useGuardWork('userrow'), below); a plain function of its own so the editor's own branching stays small (React
   Doctor no-high-complexity-react-function, pull request 826). */
const typedDiffers = (t: Typed, s: Shown): boolean =>
  t.name !== s.name || t.role !== s.role || JSON.stringify(t.lines) !== JSON.stringify(s.lines)
function PersonEditor(p: {
  pid: string; on: OpenedOn; s: Shown; typed: Typed; onTyped: (t: Typed) => void; onClose: () => void; onStale: () => void
}) {
  const { s, typed } = p
  const { name, role, lines } = typed
  const has = s.acct !== null
  /* judged again on every draw of its own (useJudgedOnDraw), and at the head of every action this row takes — Save,
     Suspend / Enable, Give sign-in, Archive, Delete — by the judgement the page holds, whole (askAgain, the one belt) */
  const stale = useJudgedOnDraw(p.pid, p.on, p.onStale)
  const stillHis = (): boolean => askAgain(p.pid, p.on, p.onClose)
  const { rest, roleLocked } = rowLocks(p.pid, s.role === 'master')
  /* the delete's first tap arms it; Cancel, closing the editor or another row disarms it (the editor unmounts — a
     regrouping disarms it too: a delete is never left armed across a redraw of the list) */
  const [armDel, setArmDel] = useState(false)
  /* his row counts for the guard once anything differs from how it opened (D2595, D2598; ui/guard.ts — typedDiffers) */
  useGuardWork('userrow', typedDiffers(typed, s))
  const save = () => {
    if (!s.acct || !stillHis()) return
    /* the role, the mark, every squadron's line AND his sign-in in ONE command (accounts.ts saveAccess — one Undo step;
       every part checked before anything is written — the final reads, R4: the rename ran after as a second command, so
       a refused rename left the access saved); a rename alone through its own door, one command as before */
    const want = accessWant(role, s.role, lines, s.lines)
    const renamed = name !== s.name
    if (!want && !renamed) return p.onClose()
    const bad = want ? saveAccess(s.acct, renamed ? { ...want, name } : want) : updateAccount(s.acct, { name })
    if (done(bad, 'Saved')) p.onClose()
  }
  const onOff = () => {
    if (!s.acct || !stillHis()) return
    const enabling = !s.on
    if (done(updateAccount(s.acct, { on: enabling }), s.on ? `${s.cs} suspended` : `${s.cs} can sign in again`)) {
      /* D284, D307: enabling his account is one of the "he's back" acts — the Quals prompt to check his quals */
      if (enabling) { markBack(p.pid); notify() }
      p.onClose()
    }
  }
  const archive = () => {
    if (!stillHis()) return
    const r = archivePerson(p.pid)
    if (done(r.bad, r.said)) p.onClose()
  }
  const del = () => {
    if (!stillHis()) return
    if (!armDel) { setArmDel(true); return }
    if (done(deletePerson(p.pid), `${s.cs} deleted`)) p.onClose()
  }
  if (stale) return null
  return (
    <div className="acc-edit" data-editing={s.acct ?? p.pid}>
      <div className="adm-2col">
        <div className="mfield"><label htmlFor={has ? 'accEdName' : 'accGiveName'}>Sign-in (defence mail)</label>
          <input id={has ? 'accEdName' : 'accGiveName'} value={name} maxLength={MAX_SIGNIN} placeholder="name@mail" disabled={!rest}
            onChange={e => p.onTyped({ ...typed, name: e.target.value })} /></div>
        <div className="mfield"><label htmlFor={has ? 'accEdRole' : 'accGiveRole'}>Role</label>
          {/* (no sign-in yet: Member or Admin — the mark is given on an account, D2320) */}
          <RoleBox id={has ? 'accEdRole' : 'accGiveRole'} value={role} disabled={roleLocked} masterOff={!has || !actorIsMaster()}
            onChange={v => p.onTyped({ ...typed, role: v })} /></div>
      </div>
      {/* every other squadron's line, as it stands (the copy's) and as picked (ui/UserAccess.tsx) */}
      <SquadronLines pid={p.pid} hasSignIn={has} rolePick={role} now={s.lines} pick={lines}
        onPick={(u, v) => p.onTyped({ ...typed, lines: { ...lines, [u]: v } })} />
      {/* what each role may see and do, under the lines where roles and access are given (D2302, D2305) */}
      <RolesFold />
      <div className="acc-acts">
        {has
          ? <>
              <button className="abtn primary" id="accEdSave" onClick={save}>Save</button>
              {/* D285: "Suspend" / "Enable" — a man away is suspended, and enabled when he is back */}
              <button className="abtn" id="accEdOnOff" disabled={!rest} onClick={onOff}>{s.on ? 'Suspend' : 'Enable'}</button>
            </>
          : <button className="abtn primary" id="accGive" onClick={() => {
              if (!stillHis()) return
              if (done(addAccount(name, p.pid, role === 'master' ? 'admin' : role), `${s.cs} can sign in now`)) p.onClose()
            }}>Give sign-in</button>}
        {/* D310, D322, D323: Archive — one tap; it also suspends his sign-in; on the war "posted out from today" */}
        <button className="abtn" id="accEdArchive" disabled={!rest} onClick={archive}>Archive</button>
        {/* D287, D298 "Delete": his account and his person (a hidden mark underneath, D290); asks twice, says what goes */}
        <button className={'abtn danger' + (armDel ? ' del-armed' : '')} id="accEdDel" disabled={!rest} onClick={del}>
          {armDel ? `Tap again to delete ${s.cs}` : 'Delete'}</button>
        <button className="abtn" id="accEdCancel" onClick={p.onClose}>Cancel</button>
      </div>
      {armDel && <p className="adm-note acc-note acc-del-note" id="accEdDelNote">{DELETE_GOES}</p>}
    </div>
  )
}

/* AN ARCHIVED MAN (D310 — moved here from Quals' Archived list with its Restore, "Restore as" and rename, D295): his
   callsign box (rename; and when a man ON the roster holds his callsign, it opens on the next free one — D286 (1)), the
   post-in date (D308, opening on today), Restore (or "Restore as <typed>"), Save name (a rename alone — D295), Delete
   (two taps). Restore brings his sign-in back with him (D322) and opens a new stint on the war (D320).
   OPENED, IT IS HELD AND JUDGED AS EVERY OPENED ROW IS (the second fix round — Astra 1, the Fable read 1 and 2, the security
   read 1): the page hands it the judgement of the press that opened it (`openOn`) and it draws its editor only with it —
   so an open roster row is never carried here when he is archived under it — and the editor's every write asks again
   first. An archived man can have a move waiting, and his row was the one place a write still landed unasked. */
function ArchivedRow(p: {
  pid: string; open: boolean; openOn?: OpenedOn | null; ringed?: boolean; onToggle: () => void; onClose: () => void; onStale: () => void
  onWrote: () => void
}) {
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
      {p.open && p.openOn && p.openOn.shown && <ArchivedEditor pid={p.pid} on={p.openOn} s={p.openOn.shown} onClose={p.onClose} onStale={p.onStale} onWrote={p.onWrote} />}
    </div>
  )
}

/* HIS OPEN ARCHIVED ROW'S EDITOR — the callsign box, the post-in date and the buttons. A piece of its own (React Doctor
   no-high-complexity-react-function, 8 Nov 26) holding what is typed: the row is drawn afresh each time it opens or
   closes (its key changes with the editor), so the boxes open on his callsign (or the next free one) and today, as
   before.
   IT READS THE MAN ONLY THROUGH THE COPY, as the whole row's editor does (`s` — shownOf): whether he has a sign-in, his
   callsign, whether a man on the roster holds it, and what the two boxes open on. Where any of it changes under the
   open row — another admin renames him, a man on the roster takes his callsign, the date rolls so that "today" in the
   post-in box is yesterday — the row closes with the note, as every opened row does.
   Judged again on every draw of its own (useJudgedOnDraw), and at the head of Restore, "Restore as", Save name and both
   of Delete's taps (askAgain, the one belt) — by the judgement held at the press, whole, so another squadron's archived
   man opened under a master admin's Squadron tick (the as-built pins B1 and B2, until the step that retires the tick) is
   judged by what he was when pressed, not taken for the page's own.
   `onWrote` — Save name is the one action of any opened row that leaves it open, and it changes the very callsign the
   copy holds: the page is told the write was this row's own and takes a FRESH COPY after it (a row's own actions never
   trip the guard), and never reads his leaving the list — the search no longer matching — as a change made under the
   admin (useOpenRowJudged — a row's own writes raise no note). */
function ArchivedEditor(p: {
  pid: string; on: OpenedOn; s: Shown; onClose: () => void; onStale: () => void; onWrote: () => void
}) {
  const { s } = p
  const has = s.acct !== null
  const stale = useJudgedOnDraw(p.pid, p.on, p.onStale)
  const stillHis = (): boolean => askAgain(p.pid, p.on, p.onClose)
  const callsign = s.cs
  const taken = s.taken
  const [box, setBox] = useState(s.box)
  const [postIn, setPostIn] = useState(s.postIn)
  const [err, setErr] = useState('')
  const [armDel, setArmDel] = useState(false)
  /* counted for the guard once the callsign or the post-in date differs from how the row opened (D2598; ui/guard.ts) —
     against the copy (after its own Save name, the fresh one) */
  useGuardWork('archrow', box !== s.box || postIn !== s.postIn)
  const want = box.trim()
  const renamed = want !== callsign
  const restore = () => {
    if (!stillHis()) return
    const bad = renamed
      ? restoreArchivedAs(p.pid, want, postIn)
      : restoreProblem(p.pid, postIn) || callsignProblem(callsign, p.pid) || (restoreArchivedPerson(p.pid, postIn) ? null : 'That did not save')
    if (bad) { setErr(bad); return }
    HOOKS.toast(`${want} restored — ${has ? 'he can sign in, and ' : ''}he'll be asked to check his quals and CAT`); notify(); p.onClose()
  }
  const saveName = () => {
    if (!stillHis()) return
    const bad = callsignProblem(want, p.pid)
    if (bad) { setErr(bad); return }
    const r = updatePersonField(p.pid, { callsign: want })
    if (r && r !== 'unchanged') { setErr(r); return }
    HOOKS.toast(`Renamed ${want}`); p.onWrote(); notify()
  }
  const del = () => {
    if (!stillHis()) return
    if (!armDel) { setArmDel(true); return }
    if (done(deletePerson(p.pid), `${callsign} deleted`)) p.onClose()
  }
  if (stale) return null
  return (
    <div className="acc-edit" data-restoring={p.pid}>
      <div className="adm-2col">
        <div className="mfield"><label htmlFor="accArCs">{CALLSIGN_LABEL}</label>
          <input id="accArCs" value={box} autoComplete="off" onChange={e => { setBox(e.target.value); setErr('') }} /></div>
        <PostInField id="accArPostIn" value={postIn} onChange={v => { setPostIn(v); setErr('') }} />
      </div>
      {taken && <p className="od-err" id="accArTaken">{callsign} is taken on the roster — give him another callsign.</p>}
      {err && <p className="od-err" id="accArErr">{err}</p>}
      <p className="od-said">{has ? 'He can sign in at once; the Leave War counts him from the post-in date.' : 'The Leave War counts him from the post-in date.'}</p>
      <div className="acc-acts">
        <button className="abtn primary" id="accArRestore" onClick={restore}>{renamed ? `Restore as ${want || '…'}` : 'Restore'}</button>
        {renamed && <button className="abtn" id="accArSave" onClick={saveName}>Save name</button>}
        <button className={'abtn danger' + (armDel ? ' del-armed' : '')} id="accArDel" onClick={del}>
          {armDel ? `Tap again to delete ${callsign}` : 'Delete'}</button>
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
   (the board's plain blue ring, no glow — D860, D876) while the Admin page holds `ring.on`. Answers the man ringed now.
   A LANDING FOR ANOTHER MAN CLOSES THE OPEN ROW, WITH NO NOTE (the fourth round — the fresh Opus's finding 2 of the third
   read): the landing clears the search and moves the Archived fold, and the third round's "did he put it away himself"
   then read that as his own putting-away — so an open row found by the search was held out of sight, the pick in it lost
   without a word, and it came back OPEN with no press when he searched again. A bell tap is his own act, as his pick of
   a squadron is: the open row closes in that draw, before the search and the fold change. A landing for the very man
   whose row is open leaves it open — he is brought into view. (`open` — whose row is open; `close` — the page's.) */
type Ring = { seq: number; pid: string; on: boolean } | null | undefined
function useRingLanding(
  ring: Ring, setFind: (v: string) => void, setArchOpen: (v: boolean | null) => void, open: string | null, close: () => void,
): string | null {
  const [ringSeen, setRingSeen] = useState(0)
  if (ring && ring.seq !== ringSeen) {
    setRingSeen(ring.seq)
    if (open && open !== ring.pid) close()
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
/* AN OPEN ROW IS JUDGED AGAIN ON EVERY DRAW (U1's fix — the two reads of chat 199: a row opened whole stayed the whole
   editor across a pick or his move landing; a short row held across a pick showed the old squadron's line). Set while
   drawing, as useUsersFilter clears its ticks, so no frame draws the row as it was: where the open row's judgement now
   differs from the one it opened with (rowChanged — the page's squadron, short or whole, his home, archived or not; and,
   since the fourth round, who is looking and the copy of everything the row shows and could write over) — the
   row closes and nothing typed is carried over (the page lets go what it held of it). Closed because the signed-in admin picked another
   squadron: no note, his own act. Closed any other way (a move landed, an Undo, another's change, his own move at
   midnight, a right of his ended): the short row's passing note (his D2730 Q13), once — raised after the draw, not in it,
   so a draw run twice (React's strict mode) never says it twice.
   THE NOTE IS OWED WHENEVER HE DID NOT PICK (the second round — the Opus read 1, Astra 3, the Fable read 5). "The page's
   squadron changed" once stood in for "he picked", so a Plan of his taken or lowered by another admin, or his own move
   at midnight, closed the row and dropped his typing in silence. His pick is read from the app's own record of one
   (closedByHisPick). The squadron in view is held again (`hold`) on every draw the row survives, so a pick that did not
   close the row — a View-only one — is never taken, later, for the cause of a close it did not make. */
/* DID HIS OWN PICK CLOSE IT: the page's squadron is no longer the row's, the squadron in view is no longer the one the row
   was last judged on, and the squadron in view was reached by his own pick or bell tap (state/typing-hold.ts
   enteredByPick — false for a sign-in, his own move at midnight, a right that ended). */
const closedByHisPick = (on: OpenedOn): boolean =>
  pageUnit('own') !== on.unit && pageUnit('schedule') !== on.view && enteredByPick()
/* THE PAGE AROUND THE OPEN ROW, AS IT STOOD AT A DRAW (the third round — the Fable read 2 and 3): whether the row was on
   the list as drawn (`drawn` — rowInView), and what of the page is the admin's own to change — his search (`q`), the
   Filter's ticks (`filt`), his tap on the Archived fold (`arch`: his tap, or null while the search decides it) — with the
   count of the open row's own writes that left it open (`wrote` — the archived row's Save name). Held by the page for the
   open row from the press that opened it (`SeenAt`, with whose row), and held again on every draw the row survives — a
   state value compared while drawing, as the squadron in view is held, never a ref read in a draw.
   IT ANSWERS TWO THINGS the held judgement cannot:
   - WAS THE ROW ON THE PAGE AT THE LAST DRAW. An open row the admin put out of sight himself — his search, a tick, the
     fold shut — stays "open" to the page (older than this step, left so). When it then changes under him it still closes,
     but nothing is said: the note about a row he put away, perhaps hours before, was said about nothing he could see.
   - DID IT LEAVE THE LIST BY NO ACT OF HIS. It was drawn at the last draw, is not drawn now, and his search, ticks and
     fold — and the row's own writes — are what they were: someone else's change, or his own Undo, took the man off the
     list (a Plan holder listed only for his Plan, when the Plan goes; a tick or the search no longer matching a man another
     admin changed). The row was simply not drawn while the page went on holding it — the admin's pick lost without a
     word, and a later search drawing his row OPEN with no press. It closes with the note. Where he put it away himself,
     it is held and nothing is said, as above.
   LEAVING ADMIN → USERS IS ONE MORE WAY HE PUTS A ROW AWAY (the fourth round — Astra's finding 2 of the third read): the
   Admin page keeps this list mounted while another of its cards is shown, and on a phone while its list of cards is, and
   says which through `shown`. That was not part of "was it drawn", so a row put away by pressing Admin → Data still said
   the note when the man's move landed at midnight. `shown` joins the picture: a row is drawn only while Users is on his
   screen, and a change of `shown` is his own act — the row is held, judged all the same, and closed without a word. */
type PageAt = { drawn: boolean; shown: boolean; q: string; filt: UsersFilter; arch: boolean | null; wrote: number }
type SeenAt = PageAt & { pid: string }
const hisOwnAsBefore = (was: PageAt, now: PageAt): boolean =>
  was.shown === now.shown && was.q === now.q && was.filt === now.filt && was.arch === now.arch && was.wrote === now.wrote
function useOpenRowJudged(
  editing: string | null, editOn: OpenedOn | null, seen: SeenAt | null, now: PageAt,
  close: () => void, hold: (on: OpenedOn) => void, see: (s: SeenAt) => void,
): void {
  const [note, setNote] = useState<{ seq: number; callsign: string } | null>(null)
  if (editing && editOn) {
    const was = seen && seen.pid === editing ? seen : null
    /* (a row with nothing held of its last draw was pressed a moment ago: it was on the page) */
    const wasDrawn = was ? was.drawn : true
    /* DELETED UNDER IT (another admin's delete — the row's own Delete closes it in the same press): the row closes, and NO
       note. The note ends "Open it again.", untrue of a man who is gone, and new words are not written here (D1625). A
       delete marks him `deleted` and archived with it (state/person-delete.ts deletePerson), so without this the
       widened judgement took it for "archived under the row" and said the note. Archived or restored keeps the note. */
    const gone = !!P(editing)?.deleted
    const changed = !gone && rowChanged(editing, editOn)
    const left = !gone && !changed && !!was && was.drawn && !now.drawn && hisOwnAsBefore(was, now)
    if (gone || changed || left) {
      close()
      if (!gone && wasDrawn && (left || !closedByHisPick(editOn))) setNote({ seq: (note?.seq ?? 0) + 1, callsign: cs(editing) })
    } else {
      if (pageUnit('schedule') !== editOn.view) hold({ ...editOn, view: pageUnit('schedule') })
      if (!was || was.drawn !== now.drawn || !hisOwnAsBefore(was, now)) see({ pid: editing, ...now })
    }
  }
  useEffect(() => {
    if (note) HOOKS.toast(changedWhileOpenWords(note.callsign), 'warn')
  }, [note])
}
/* THE NOTE WHEN THE APP ITSELF TAKES THE ADMIN PAGE AWAY (the third round — the Opus read 1, the Fable read 1). The list
   is drawn only while the app is on the Admin page (ui/Shell.tsx). A right of his lowered — his Plan of the squadron in
   view made a View — moves his own pages home and, in the same step, lands him on that squadron's View-only Sched (a
   squadron he only views offers no Admin page — state/store.ts, D2381): the list is taken off the page before it is drawn
   again, so the judging on a draw never ran and his open row and his typing went without a word. The page keeps the open
   row of its last draw in a ref (written after each draw, read only as the page goes) and judges it once more at that
   moment, by the same rule: the row changed, and he did not pick → the note.
   SILENT FOR EVERY WAY HE LEAVES (settled with the core's chat 204), each held by a test of the whole app:
   - another tab pressed: the Admin page is still his to open (`pageOffered`), so it was not taken from him — even where
     the row had changed under him with nothing redrawn, the leaving is his own;
   - Logout, and the switch to the member view: the role in force is no longer an admin's (`isAdmin`) — the member view
     moves his own pages home, which alone would read as a change. (Where another admin makes him a member under his
     open row the note IS said since the fourth round — on the draw before the page goes, never here: adminThere);
   - his own pick of a squadron he only views: the row did not change, or `leftByHisPick` (below);
   - a row already closed, or one he had put out of sight himself (not `drawn` at the last draw): nothing was open to him;
   - a man deleted under it: no note, as on a draw.
   Under React's strict mode the effect is set up, torn down and set up again only as the page first draws, when no row
   is open — so it says nothing then, and once when the page really goes.
   HIS OWN PICK, AS THE PAGE GOES, IS "THE SQUADRON IN VIEW MOVED BY HIS OWN PICK OR BELL TAP" (the fourth round — the
   security reader's finding 2 and the fresh Fable's finding 2 of the third read): the draw rule's closedByHisPick also
   asks that the page's squadron is no longer the row's, which is false for a pick of a squadron he only views made from
   his own squadron's page — so a row that had changed unseen said the note for his own pick. Here the page is already
   going; whose act it was is all that is asked. closedByHisPick stays as it is for the draw rule.
   (His own standing gone — his own move's day come, or another admin made him a member — needs nothing here: the page
   draws once more before the app makes his session again (ui/App.tsx), and that draw's judging closes the row with the
   note — adminThere, above.) */
type OpenAtDraw = { pid: string; on: OpenedOn; drawn: boolean }
const leftByHisPick = (on: OpenedOn): boolean => pageUnit('schedule') !== on.view && enteredByPick()
const takenAwayUnder = (o: OpenAtDraw): boolean =>
  o.drawn && isAdmin() && !pageOffered('admin') && !P(o.pid)?.deleted && rowChanged(o.pid, o.on) && !leftByHisPick(o.on)
function useNoteAsPageGoes(pid: string | null, on: OpenedOn | null, drawn: boolean): void {
  const last = useRef<OpenAtDraw | null>(null)
  useEffect(() => { last.current = pid && on ? { pid, on, drawn } : null }, [pid, on, drawn])
  useEffect(() => () => {
    const o = last.current
    if (o && takenAwayUnder(o)) HOOKS.toast(changedWhileOpenWords(cs(o.pid)), 'warn')
  }, [])
}
/* is this man's row on the list as it is drawn: not hidden by a tick or the search, his Archived fold open */
const rowInView = (v: UsersView, pid: string | null, archOpen: boolean): boolean =>
  !!pid && (v.groups.some(g => g.rows.includes(pid)) || (archOpen && v.archived.includes(pid)))

export function UsersPanel(p: { shown?: boolean; openNew?: number; ring?: Ring } = {}) {
  const [editing, setEditing] = useState<string | null>(null)
  /* the open row as it was judged at the press that opened it — set with `editing` by `toggle`, for every row, the
     archived men's too (useOpenRowJudged) */
  const [editOn, setEditOn] = useState<OpenedOn | null>(null)
  /* …and the page around it as it stood at the last draw (PageAt, above) — set with them by `toggle`, held again by the
     judging on every draw the row survives; `wrote` counts the open row's own writes that left it open */
  const [seen, setSeen] = useState<SeenAt | null>(null)
  const [wrote, setWrote] = useState(0)
  /* …and what the admin has typed or picked in it (Typed, above): started from the copy by `toggle`, cleared at close */
  const [typed, setTyped] = useState<Typed | null>(null)
  /* THE OPEN ROW'S OWN WRITE THAT LEFT IT OPEN (the archived row's Save name): counted, so his leaving the list by it is
     never read as a change made under the admin — and A FRESH COPY taken, the store read after the write, so the row's
     own action never trips its guard (the press asked again first, so nothing else differs; the squadron in view is
     kept as held). */
  const ownWrite = useCallback((pid: string) => {
    const fresh = judgedNow(pid)
    setWrote(n => n + 1)
    setEditOn(on => (on ? { ...fresh, view: on.view } : on))
  }, [])
  const closeRow = () => { setEditing(null); setEditOn(null); setSeen(null); setTyped(null) }
  /* an opened row's editor found, on a draw of its own, that the row changed under it (useJudgedOnDraw): the page draws
     again, and its judging (below, once the list is worked out) closes the row and says so. One name for the whole life
     of the page, so an editor's effect runs once for it. */
  const [, setJudgedAgain] = useState(0)
  const judgeAgain = useCallback(() => setJudgedAgain(n => n + 1), [])
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

  /* a bell's posting line landing here ([POSTOUT-RUN-NOTICE]) — useRingLanding, above: a landing for another man closes
     the open row */
  const ringPid = useRingLanding(p.ring, setFind, setArchOpen, editing, closeRow)

  const hasName = !!name.trim()
  const resetAddForm = () => { const t = effectiveToday(); setName(''); setNp(BLANK); setRole('main'); setPostIn0(t); setPostIn(t) }
  /* THE FORM'S REPORT TO THE GUARD (D2598, §18.3; ui/guard.ts's `addperson` row): counted while the form is open and
     anything in it differs from how a fresh form opens — each value the one resetAddForm and the first draw set, the
     post-in date the one it last opened fresh on (never today's, which moves at midnight under an untouched form).
     Folded counts nothing: only Cancel and Escape fold it, and both empty it first. */
  useGuardWork('addperson', adding && (name !== '' || JSON.stringify(np) !== JSON.stringify(BLANK) || role !== 'main' || postIn !== postIn0))
  /* …AND WHETHER THIS SECTION IS IN SIGHT (the guard's note — his "save or cancel the open row on Users", D2627 A6, said
     while a row here is open and another Admin section shows): the Admin page's own `shown`, handed on as it is */
  useGuardSection('users', !!p.shown)
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
  /* THE OPEN ROW IS JUDGED AGAIN ON THIS DRAW (useOpenRowJudged) — here, once the list is worked out, because the judging
     asks whether the row is on it: by the judgement held at the press (the page's squadron, short or whole, his home,
     archived or not), and by the page around it as it stood at the last draw. And once more as the page goes
     (useNoteAsPageGoes). */
  /* (drawn: on the list AND Users on his screen — a row is not on the page while another Admin card is, or, on a phone,
     the list of cards: PageAt, above) */
  const shown = !!p.shown
  const drawn = shown && rowInView(view, editing, archOpenNow)
  useOpenRowJudged(editing, editOn, seen, { drawn, shown, q, filt, arch: archOpen, wrote }, closeRow, setEditOn, setSeen)
  useNoteAsPageGoes(editing, editOn, drawn)
  /* (opening a row also holds how it is judged at this press — the page's squadron, short or whole, his home, archived or
     not, the squadron in view, who is looking and the copy of all it shows: OpenedOn — the page around it: a row pressed
     is on the page, wherever Users is on his screen — and what will be typed in it, started from the copy) */
  const toggle = (pid: string) => {
    if (editing === pid) { closeRow(); return }
    const on = judgedNow(pid)
    setEditing(pid)
    setEditOn(on)
    setTyped(typedFrom(on.shown))
    setSeen({ pid, drawn: shown, shown, q, filt, arch: archOpen, wrote })
  }
  /* ESCAPE CLOSES THE OPENED ROW AS ITS CANCEL DOES ((p), his D2396): nothing saved, no question, the keys back on the row;
     an open Filter panel answers first. Only while the row is on his screen: Users chosen, the row not hidden by a tick
     or the search. */
  useEscRow(drawn ? editing : null,
    pid => document.querySelector<HTMLElement>(`.acc-row[data-person="${CSS.escape(pid)}"]`),
    closeRow, FILTER_ESC)
  const row = (pid: string) => <PersonRow key={pid + (editing === pid ? ':e' : '')} pid={pid} open={editing === pid}
    openOn={editing === pid ? editOn : null} typed={editing === pid ? typed : null} onTyped={setTyped} ringed={ringPid === pid}
    onToggle={() => toggle(pid)} onClose={closeRow} onStale={judgeAgain} />
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
              {archShown.map(pid => <ArchivedRow key={pid + (editing === pid ? ':e' : '')} pid={pid} open={editing === pid}
                openOn={editing === pid ? editOn : null} ringed={ringPid === pid}
                onToggle={() => toggle(pid)} onClose={closeRow} onStale={judgeAgain} onWrote={() => ownWrite(pid)} />)}
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
