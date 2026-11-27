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
  requestSummary, accessAlert, markRequestsSeen, MAX_SIGNIN, isAdminAccount, signedInAccount, levelIn, sessionLapsed, mayGivePlanNow,
  type Account, type AccountRole, type AccessRequest, type AccessSave, type AccessLine,
} from '../state/accounts'
import { RoleBox, RoleNote, SquadronLines, RolesFold } from './UserAccess'
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
/* the Role box of a new person's sign-in (the add form, a request's approval): Member or Admin, the short words of D2305.
   `unit` — the squadron the man will be an admin of: "+ Add a person"'s the page's (pageUnit('own') — where the door puts
   his home), Give access's the request's own. "Admin" is greyed, with the one grey line under the box, where the signed-in
   person may not make an admin of it (his D2730 Q8, D2806) — read afresh from his right on every draw
   (state/accounts.ts mayGivePlanNow), never held by the form: no field of the open work's record carries it (the U2
   brief's §6), and the door judges the press again whatever the box showed. */
function RoleSelect(p: { id: string; value: AccountRole; unit: string; onChange: (v: AccountRole) => void }) {
  const adminOff = mayGivePlanNow(p.unit) ? null : p.unit
  return <>
    <select id={p.id} value={p.value} aria-label="Member or admin" aria-describedby={adminOff ? `${p.id}Note` : undefined}
      onChange={e => p.onChange(e.target.value as AccountRole)}>
      <option value="main">Member</option>
      <option value="admin" disabled={!!adminOff}>Admin</option>
    </select>
    {adminOff && <RoleNote id={`${p.id}Note`} unit={adminOff} />}
  </>
}
const done = (bad: string | null, ok: string) => { if (bad) HOOKS.toast(bad, 'warn'); else HOOKS.toast(ok); notify(); return !bad }
/* the post-in date box (D308): opens on today; the account works at once, the Leave War counts him from the date.
   `onSelect` — every pick, the day already shown included (ui/DateBox.tsx): the archived row's and Give access's boxes
   mark the date his by it (the plan's §1.3) */
function PostInField(p: { id: string; value: string; onChange: (v: string) => void; onSelect?: (v: string) => void }) {
  return (
    <div className="mfield"><label htmlFor={p.id}>Post in</label>
      <DateBox id={p.id} label="Post in" value={p.value} onChange={p.onChange} onSelect={p.onSelect} /></div>
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

/* GIVE ACCESS IS ONE PIECE OF OPEN WORK, HELD BY THE PAGE (U1's eighth round — the plan
   docs/superpowers/plans/2026-11-27-msq-s2-open-work-judge.md §1.1; lifted out of Waiting, which holds no state now).
   WHAT IT WAS STARTED ON (GiveOn): the page's squadron, the squadron in view and who is looking at the press; the request
   as the form shows, fills or sends it (`req` — its id, name, callsign, initials, seat, CAT, squadron and when, as stored
   at the press; NEVER `seenBy`, which every accounts reload rebuilds, perhaps in another order — holding it closed a
   changed form at an unrelated Undo); and the mode it opened on (`mode0` — On the roster where the request's callsign
   matched the roster at the press), held, never worked out again from the roster. It keeps NO copy of the roster-match
   note, the archived note or the picker's men: those are drawn live, and a pick they have made stale is refused by the
   door in its own words — nothing wrong is written.
   WHAT HE TYPED (GiveTyped), each field with its own "he set this" mark, cleared only when the form goes; the Post in
   box he never set shows today live, worked out in its own draw (Waiting). `callsign` — the one the request asked as,
   for the note. `drawn` — was the form on his screen at the last draw (Users shown), for the note. */
type GiveOn = StartedOn & { req: string; mode0: Mode }
type GiveTyped = {
  mode: Mode; np: NewPerson; pid: string; role: AccountRole; postIn: string
  set: { mode?: true; np?: true; pid?: true; role?: true; postIn?: true }
}
type Drawn = { onScreen: boolean }
type GiveWork = { id: string; on: GiveOn; typed: GiveTyped; callsign: string; drawn: Drawn }
/* the request as the form shows, fills or sends it — never `seenBy` (above) */
const reqKey = (r: AccessRequest): string =>
  JSON.stringify({ id: r.id, name: r.name, cs: r.cs, ini: r.ini, seat: r.seat, cat: r.cat, unit: r.unit, at: r.at })
/* a fresh form from the request (Cancel discards edits); switching On the roster ↔ New person keeps what each half
   holds; New person asks the post-in date (D308), showing today until he picks one */
function giveFrom(r: AccessRequest): { on: GiveOn; typed: GiveTyped; callsign: string } {
  const mode0: Mode = rosterMatch(r) ? 'roster' : 'new'
  return {
    on: { unit: pageUnit('own'), view: pageUnit('schedule'), actor: actorNow(), req: reqKey(r), mode0 },
    typed: { mode: mode0, np: { cs: r.cs, ini: r.ini, seat: r.seat, cat: r.cat }, pid: '', role: GIVE_ROLE0, postIn: '', set: {} },
    callsign: r.cs,
  }
}
/* DOES THE FORM HOLD A CHANGE — the guard's count (ui/guard.ts, D2598) and the note's: a field he SET whose value is not
   the one it opened on; the mode against the one it opened on (`mode0`), the New person fields against the request's
   own; a date he picked always (the plan's §1.2). A Role put back to Member, a callsign typed back, is not counted. */
/* (the Role the form opens on — one home for the value giveFrom starts the form with and giveDiffers compares against:
   a typed choice set back to where it opened is no change. It decides nothing about who may give access — that is the
   doors' and state/perms.ts's — so it is no authority read, D200's scan) */
const GIVE_ROLE0: AccountRole = 'main'
function giveDiffers(g: GiveWork): boolean {
  const t = g.typed, s = t.set
  if (s.mode && t.mode !== g.on.mode0) return true
  if (s.pid && t.pid !== '') return true
  if (s.role && t.role !== GIVE_ROLE0) return true
  if (s.postIn) return true
  if (!s.np) return false
  const r = JSON.parse(g.on.req) as AccessRequest
  return JSON.stringify(t.np) !== JSON.stringify({ cs: r.cs, ini: r.ini, seat: r.seat, cat: r.cat })
}
/* THE FORM'S PRESS ASKS FIRST (the eighth round — Give access had no such check): a started-on fact changed, or the New
   person Post in box he never set showed a day no longer today (`day`, the box's own draw's) → nothing is sent, the form
   closes, the note naming the request (his D2730 Q13 words). A request already gone is NOT judged here: the door is
   called and its own refusal stands ("That request is gone" — the press's caller). True when the press may go on.
   (Since the ninth round the note is not said here: `onClose(true)` hands the close to the page, which says it together
   with any other piece of open work no longer as it was started — the page's closeFound.) */
function giveAsked(g: GiveWork, day: string | undefined, onClose: (found?: true) => void): boolean {
  if (judgeGive(g, 'press', day) === 'ok') return true
  onClose(true)
  return false
}

/* THE WAITING LIST AND ITS ONE GIVE ACCESS FORM — drawn from what the page holds (`give`), holding no state of its own: a
   regrouping or the fold never remakes the form's work. The page judges the form on every draw (useOpenWorkJudged) and
   as it goes (useNoteAsPageGoes); its report to the guard is the page's too. */
function Waiting(p: {
  give: GiveWork | null; onTyped: (t: GiveTyped) => void; onOpen: (r: AccessRequest) => void; onClose: (found?: true) => void
  afterWrite: (write: () => void) => void
  /* (Refuse's write, with both pieces of open work judged in its batch — the page's addWrite, the eleventh round) */
  addWrite: (write: () => void) => void
}) {
  /* the page's squadron's requests only, those he is an admin of (§5 — accounts.ts waitingHere) */
  const reqs = waitingHere()
  if (!reqs.length) return <p className="adm-note" id="admNoWaiting">Nobody is waiting for access.</p>
  return (
    <div className="acc-list" id="admWaiting">
      {reqs.map(r => {
        const sum = requestSummary(r)
        const g = p.give && p.give.id === r.id ? p.give : null
        return (
          <div className="acc-row req" key={r.id} data-req={r.id}>
            <div className="acc-main">
              <span className="acc-name">{r.name}</span>
              <span className="acc-sub">asked as <b>{r.cs}</b>{sum ? ` · ${sum}` : ''} · {elogWhen(r.at)}</span>
            </div>
            {!g
              ? <div className="acc-acts">
                  {/* D309 / D310: "Give access · Refuse" (were Approve · Decline) */}
                  <button className="abtn primary" data-approve={r.id} onClick={() => p.onOpen(r)}>Give access</button>
                  <button className="abtn" data-decline={r.id} onClick={() => p.addWrite(() => { done(declineRequest(r.id), `Refused ${r.name}`) })}>Refuse</button>
                </div>
              : <GiveForm r={r} g={g} onTyped={p.onTyped} onClose={p.onClose} afterWrite={p.afterWrite} />}
          </div>
        )
      })}
    </div>
  )
}
/* ONE REQUEST'S OPEN GIVE ACCESS FORM. Every change sets its field's mark, inline. The New person Post in box shows the
   date he picked, or today live, worked out in this very draw (`day`); that day is the box's value AND the date "Add
   person and give access" sends.
   Its press's write runs through the page's afterWrite (the tenth round — opus1 F2/F3, opus2 F3 of the ninth read): the
   receipt, or the door's own words, then the note of the open row where this write left it no longer as it was opened —
   one batch, one line, so the row's note never replaces what this press said. */
function GiveForm(p: {
  r: AccessRequest; g: GiveWork; onTyped: (t: GiveTyped) => void; onClose: (found?: true) => void; afterWrite: (write: () => void) => void
}) {
  const { r, g } = p
  const a = g.typed
  const match = rosterMatch(r)
  const day = a.set.postIn ? a.postIn : effectiveToday()
  const go = () => {
    if (!giveAsked(g, a.mode === 'new' ? day : undefined, p.onClose)) return
    p.afterWrite(() => {
      const bad = a.mode === 'new' ? approveRequestNew(r.id, a.np, a.role, day) : approveRequest(r.id, a.pid, a.role)
      const who = a.mode === 'new' ? `${a.np.cs.trim()} added — ${r.name} can sign in now` : `${r.name} can sign in now`
      /* a request already gone (answered meanwhile, nothing redrawn): the door's own words stand, said by done, and the
         form goes with this press — it is drawn inside its request's row, so it cannot stay once the request is gone */
      if (done(bad, who) || !waitingHere().some(x => x.id === r.id)) p.onClose()
    })
  }
  return (
    <div className="acc-edit" data-approving={r.id}>
      <PersonChoice idp="apv" mode={a.mode} onChange={m => p.onTyped({ ...a, mode: m, set: { ...a.set, mode: true } })} />
      {a.mode === 'new'
        ? <>
            <PersonFields idp="apv" np={a.np} onChange={np => p.onTyped({ ...a, np, set: { ...a.set, np: true } })} />
            <p className="adm-note acc-note" id="apvNote">{archivedNote(r) ?? 'Filled from what he gave when he signed up — change anything before you give access.'}</p>
          </>
        : <>
            <div className="mfield"><label htmlFor="apvPid">{CALLSIGN_LABEL}</label>
              <PuckSelect id="apvPid" value={a.pid} unit={r.unit} onChange={v => p.onTyped({ ...a, pid: v, set: { ...a.set, pid: true } })} /></div>
            {match && <p className="adm-note acc-note" id="apvNote">{match.note}</p>}
          </>}
      <div className="adm-2col">
        {/* every pick in the calendar marks the date his, the day already shown included (onSelect); onChange, called
            after it for a day that differs, has nothing more to write — onSelect has written the same pick */}
        {a.mode === 'new' && <PostInField id="apvPostIn" value={day} onChange={() => {}}
          onSelect={v => p.onTyped({ ...a, postIn: v, set: { ...a.set, postIn: true } })} />}
        <div className="mfield"><label htmlFor="apvRole">Role</label>
          <RoleSelect id="apvRole" value={a.role} unit={r.unit} onChange={v => p.onTyped({ ...a, role: v, set: { ...a.set, role: true } })} /></div>
      </div>
      <div className="acc-acts">
        <button className="abtn primary" id="apvGo" onClick={go}>{a.mode === 'new' ? 'Add person and give access' : 'Give access'}</button>
        <button className="abtn" id="apvCancel" onClick={() => p.onClose()}>Cancel</button>
      </div>
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
   other change of the squadron in view: the one judge's step 2, below). Since the fourth round it holds THE COPY of everything
   the row shows and could write over (`shown` — below). Held by the page for every open row — the archived man's too —
   and handed WHOLE to whichever of the three editors the row draws: none of them rebuilds a part of it.
   (WHO IS LOOKING is REQUIRED at every judging since the fifth round — adminThere, below — and, since the eighth, also
   COMPARED: `actor`, the signed-in account at the press, part of what every piece of open work was started on.)
   ONE RECORD OF OPEN WORK (U1's eighth round — the plan docs/superpowers/plans/2026-11-27-msq-s2-open-work-judge.md §1):
   every piece of open work — this row, and Give access below — is held by the page with WHAT IT WAS STARTED ON
   (StartedOn: the page's squadron, the squadron in view, who is looking), a copy of the STORED facts it shows (never a
   value made from the clock) and what he typed, each field with its own "he set this" mark; and one judge reads every
   entry alike (judge, below). */
type StartedOn = {
  unit: string          // pageUnit('own') at the press that opened it — the page's squadron
  view: string          // pageUnit('schedule') at that press — the squadron in view
  actor: string | null  // who is looking: the signed-in account (a hand-made test session: null)
}
type OpenedOn = StartedOn & { short: boolean; home: string | null; arch: boolean; shown: Shown | null }
/* who is looking now, as `actor` holds it */
const actorNow = (): string | null => signedInAccount()?.id ?? null
/* THE COPY — THE ONE GUARD (U1's fourth round, chat 205; his D2404 — a guard rail before another patch). Three fix rounds
   each closed another stale-row case; they were one fault: an opened row worked from what it read when it opened, and
   only some of that was judged against the store as it is now. So an opened row keeps a copy of EVERYTHING it shows and
   could write over, taken at the press that opened it and held by the page with the four facts above:
   - whether he has a sign-in and which account it is (`acct`), its sign-in name, his role as the Role box shows it — the
     master admin mark first — and whether it is switched on;
   - each other squadron's line as the row shows it (`lines`), and his callsign;
   - on an archived man's row, what its callsign box opens on too: whether a man on the roster holds his callsign
     (`taken`) and the callsign its box opens on (his own, or the next free one). NOT the post-in date since the eighth
     round: it was the clock's value, never a stored fact, and holding it made "untouched" a guess from equal dates
     (the plan's §1.3) — a box he never set shows today live, in its own draw (ArchivedEditor).
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
   away, are followed live too while no pick is made (msq-s2-rejudge3.test.tsx §15 pins both); what it does not follow —
   which sign-in the admin's pick was made on — is held with the pick (Typed, below), and a pick whose sign-in is no
   longer his closes the row (pickCannotGo, below — the sixth round).
   WHAT THE ADMIN TYPES OR PICKS IS NEVER THE COPY: "changed" always means the STORE differs from the copy. */
type Shown = {
  acct: string | null; name: string; role: RolePick; on: boolean; lines: Record<string, AccessLine>; cs: string
  taken: boolean; box: string
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
    taken, box: !arch ? '' : taken ? nextFreeCallsign(callsign, pid) : callsign,
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
   A session with no account behind it (a hand-made test session) has no standing to lose.
   REQUIRED, NOT ONLY COMPARED — AND HIS SESSION MUST STILL STAND (the fifth round — the security reader's findings 1a and
   1b, Astra's finding 1). The fourth round asked only his LEVEL, answered "that admin" when his account was gone, and
   only compared the answer with what it was at the press. So (1a) the signed-in admin suspended, archived or deleted by
   another admin under his open row, nothing redrawn — a level does not ask whether his sign-in is on or his person
   still there — and Save, Suspend, Archive and Delete still wrote; (1b) made a member, nothing redrawn, and THEN he
   pressed a row open on the page still standing: it opened with "not that admin" as its baseline, the comparison never
   fired, and Save and Suspend wrote. Now it first asks the app's own question — does his session still stand
   (state/accounts.ts sessionLapsed: suspended, archived, deleted, his account gone, its role changed, put on another
   person; a hand-made session never lapses) — and an opened row REQUIRES the answer at every judging (rowChanged), and
   a press opens no row without it (UsersPanel's toggle). His own Logout and his own switch to the member view change
   neither answer: nobody signed in has no account to ask of, and the member view leaves his account as it was. */
const adminThere = (unit: string): boolean => {
  if (sessionLapsed()) return false
  const a = signedInAccount()
  return !a || levelIn(a.id, unit, todayIso()) === 'admin'
}
const judgedNow = (pid: string): OpenedOn => {
  const unit = pageUnit('own'), short = foreignHere(pid), arch = !!P(pid)?.archived
  return {
    unit, view: pageUnit('schedule'), actor: actorNow(),
    short, home: homeOn(pid, todayIso()), arch, shown: shownOf(pid, kindOf({ short, arch })),
  }
}
/* THE SHORT ROW'S PICK AND THE LINE HE HOLDS — ONE READER FOR ITS EDITOR AND FOR THE PAGE (the fifth round): what he
   holds, read from the store as it stands, and the admin's pick, where it was made on the sign-in he holds now (Typed,
   below). The short row's editor draws from it and its Save reads it once more; the page works the row's report to the
   leave-guard out from the same answer (shortUnsaved) — so the row's "not saved" mark and the guard's count cannot
   disagree. */
function shortHeld(pid: string, unit: string, t: Typed) {
  const a = accountOfPid(pid)
  const rolePick = rolePickOf(a, a && isAdminAccount(a) ? 'admin' : 'main')
  const picked = a && t.pick && t.pick.acct === a.id ? t.pick.line : null
  return { a, rolePick, picked, line: (accessLinesOf(a, pid)[unit] ?? 'none') as AccessLine }
}
/* its change not saved: a pick made, on the sign-in he holds, that is not the line he holds now (a master admin's row has
   no line to pick) */
const shortUnsaved = (h: ReturnType<typeof shortHeld>): boolean => !!h.a && h.rolePick !== 'master' && h.picked !== null && h.picked !== h.line
/* A PICK MADE THAT CAN NO LONGER BE SENT — his sign-in gone, put on another account, or he is by now a master admin (the
   fifth round — the security reader and the fresh Fable, by reading — for the master mark; the sixth round — the fresh
   Opus 1's and 2's finding 1, Astra's finding 1, found blind by all three — for the sign-in). A master admin has full
   access and no line; a pick made on a sign-in that is no longer his is never carried onto another. The fifth round
   asked only the master mark on a draw and caught the sign-in only at Save, so a page that redrew after his sign-in went
   dropped the pick without a word — the row fell back to "No sign-in…" with Cancel alone, or to the new sign-in's line
   untouched — and one person could do it: the admin's own Undo of giving the sign-in, his Redo then bringing the pick
   back "not saved" with no press. His row did change while it was open: on every draw as at Save, the row closes — with
   the note where it was on the page, silently where he had put it away (rowChanged, below; useOpenWorkJudged). A short row
   with NO pick still follows his sign-in live, given or taken (msq-s2-rejudge3.test.tsx §15). */
const pickCannotGo = (pid: string, t: Typed | null | undefined): boolean => {
  if (!t || !t.pick) return false
  const a = accountOfPid(pid)
  return !a || a.id !== t.pick.acct || a.master === true
}
/* THE ROW CHANGED UNDER IT (his D2730 Q13): ANY of the four facts no longer holds — the page's squadron is another;
   "another squadron's man here" flipped; his home is no longer the one the row opened on (a move from one other squadron
   to another leaves him another squadron's man here, yet ends what he held of this one and whose admin to ask — the
   Fable read 3, Astra 4); he was archived or restored under it (an open row is never carried from his roster row to his
   archived row or back — the Fable read 2, the security read) — OR the signed-in person is no longer an admin of the
   squadron it opened on, his session standing (adminThere — required, never compared), OR anything in the copy differs
   from the store (shownOf, as the row opened: whole or archived), OR HE WAS DELETED (the fifth round — the security
   reader's finding 2: an archived man with NO sign-in, deleted under his open archived row, changes nothing the copy
   holds — no account to lose, his callsign as it was — so "Save name" renamed the deleted man and said so; the page's
   draw rule tests "deleted" first and closes his row with no note, a press gives the usual note and writes nothing),
   OR — the short row — the pick the admin made can no longer be sent (`t`, where the caller holds what is typed:
   pickCannotGo). Asked by the page on every draw, by each editor on every draw of its own, and at the head of every
   action an editor takes. Since the eighth round it is the row half of the one judge (below), and the squadron in view
   IS part of it: no open work outlives a change of the squadron in view (the judge's step 2). */
const rowChanged = (pid: string, on: OpenedOn, t?: Typed | null): boolean => judgeRow(pid, on, t ?? null) !== 'ok'

/* ---- THE ONE JUDGE (U1's eighth round — the plan docs/superpowers/plans/2026-11-27-msq-s2-open-work-judge.md §2) ----
   Every piece of open work — the open row, and Give access — is judged by this one rule, on every draw of the page and
   of an editor, before every press and as the page goes; each started-on fact is COMPARED, never guessed. In this order:
   1. `gone` — a row whose man is deleted (first, as since the fifth round: the note ends "Open it again.", untrue of a
      man who is gone — D1625);
   2. `pick` — the squadron in view moved by his own pick or bell tap (state/typing-hold.ts enteredByPick, which
      state/store.ts enterSquadron sets at EVERY change of the squadron in view). This is no longer the old guess: since
      every entry closes at ANY change of the squadron in view (step 3), no entry outlives one, so the flag is read only
      on the draw right after the very change that set it. The core's K4 / K5 refuse a pick or the member-view switch
      while any entry differs, so a pick closes only unchanged work. (A bell tap that enters another squadron is not
      refused today — state/belltap.ts never asks the guard — so it closes changed work too, silently: not closed here,
      the plan's §3);
   3. `changed` — a started-on fact differs (the page's squadron, the squadron in view, who is looking, or he is no
      longer that squadron's admin — adminThere, required), or the kind's stored facts differ: a row's on a draw, at a
      press and as the page goes; Give access's — its request no longer waiting, or no longer as it was — on a draw and
      as the page goes only: at a press a request already gone is the door's to say (giveAsked);
   3a. at a press that relies on what a Post in box showed (`day`): the box he never set showed a day that is no longer
      today (dayGone) — `changed`;
   4. `ok` otherwise. */
type Why = 'ok' | 'gone' | 'pick' | 'changed'
type At = 'draw' | 'press' | 'leaving'
type Entry = ({ kind: 'row' } & RowWork) | ({ kind: 'give' } & GiveWork)
const startedOnChanged = (on: StartedOn): boolean =>
  pageUnit('own') !== on.unit || pageUnit('schedule') !== on.view || actorNow() !== on.actor || !adminThere(on.unit)
const byHisPick = (on: StartedOn): boolean => pageUnit('schedule') !== on.view && enteredByPick()
/* (a row's stored facts are judged alike on a draw, at a press and as the page goes) */
function judgeRow(pid: string, on: OpenedOn, t: Typed | null, day?: string): Why {
  if (P(pid)?.deleted) return 'gone'
  if (byHisPick(on)) return 'pick'
  if (startedOnChanged(on)) return 'changed'
  if (foreignHere(pid) !== on.short || homeOn(pid, todayIso()) !== on.home || !!P(pid)?.archived !== on.arch
    || !sameShown(shownOf(pid, kindOf(on)), on.shown) || (on.short && pickCannotGo(pid, t))) return 'changed'
  return dayGone(t, day) ? 'changed' : 'ok'
}
function judgeGive(g: GiveWork, at: At, day?: string): Why {
  if (byHisPick(g.on)) return 'pick'
  if (startedOnChanged(g.on)) return 'changed'
  if (at !== 'press') {
    const r = waitingHere().find(x => x.id === g.id)
    if (!r || reqKey(r) !== g.on.req) return 'changed'
  }
  return dayGone(g.typed, day) ? 'changed' : 'ok'
}
function judge(w: Entry, at: At, day?: string): Why {
  return w.kind === 'row' ? judgeRow(w.pid, w.on, w.typed, day) : judgeGive(w, at, day)
}
/* IS THE NOTE OWED for an entry closed on a draw or as the page goes — one rule, said once: it closed `changed`, it was
   on his screen at the last draw (`onScreen` — for a row the page's own record of its last draw, SeenAt), and it is a
   row or a Give access that holds a change. A row says it whether or not anything was typed (his D2730 Q13 as built since
   round 1); Give access only where it holds a change (the seventh round's pin). At a press the pressed entry always says
   it, and the other piece of open work by this same rule, all in one batch (closedAtPress — the ninth round). */
const noteOwed = (w: Entry, why: Why, onScreen: boolean): boolean =>
  why === 'changed' && onScreen && (w.kind === 'row' || giveDiffers(w))
/* the notes owed at one moment, said together — each sentence whole, in order, through the app's one note batch
   (ui/toast.ts toastBatch, installed at boot): the passing note is one element whose text each call replaces, so two
   calls would show only the second (Astra 3 of the plan's red team). One note: the same call, the same words as ever. */
function sayChanged(callsigns: string[]): void {
  HOOKS.toastBatch(() => { for (const c of callsigns) HOOKS.toast(changedWhileOpenWords(c), 'warn') })
}
/* WHAT THE ADMIN HAS TYPED OR PICKED IN THE OPEN ROW — HIS, NEVER THE COPY — HELD BY THE PAGE WITH THE OPEN ROW (the fourth
   round — Astra's finding 1 of the third read). Each group of the list draws under its own parent, so a man who moves
   from one group to another has his editor made anew; what the admin had picked or typed lived inside the editor and went
   with it, without a word — Saber's unsaved View for Hunter, when his own Undo moved Hunter from under 149's heading to
   under 150's. The page holds it: started from the copy at a fresh opening, cleared at close, handed to whichever editor
   the row draws. So a regrouping alone — and a row he hid by his own search and brought back — keeps his outstanding
   choice while the row stays open.
   `pick` — the short row's: the line he picked, WITH THE SIGN-IN IT WAS PICKED ON (the one thing the short row does not
   follow live): a pick counts only while that sign-in is still the man's, so it is never carried onto a sign-in given to
   him later.
   `box`, `postIn` — THE ARCHIVED ROW'S TWO BOXES, THE PAGE'S TOO (the fifth round — the fresh Opus 1, Astra 2, the fresh
   Fable 1; the backlog's [USERS-ARCH-FOLD-DRAFT], older than this step). The fourth round left them in the archived row's
   editor ("the Archived fold is one list, never regrouped") — which missed the fold itself: shutting it, a search or a
   Filter tick that hides the row makes the editor anew, and the row came back OPEN on his old callsign and today's date,
   what the admin had typed gone without a word. Started from the copy at each fresh opening, thrown away at close, as
   the rest is.
   `set` — HIS OWN "HE SET THIS" MARK ON EACH FIELD (the eighth round, the plan's §1.2): set by his own change in the
   editor, inline, and cleared only when the entry goes — Cancel, his own finishing press, any close. No value he types
   or picks clears a mark, whatever it equals: "untouched" is never read from equal values again. A field not set shows
   the copy — for the post-in date, today live (ArchivedEditor). The short row's `pick` is its own mark (null: not set). */
type Typed = {
  name: string; role: RolePick; lines: Record<string, AccessLine>; pick: { acct: string; line: AccessLine } | null
  box: string; postIn: string
  set: { name?: true; role?: true; lines?: true; box?: true; postIn?: true }
}
const typedFrom = (s: Shown | null): Typed => ({
  name: s ? s.name : '', role: s ? s.role : 'main', lines: s ? s.lines : {}, pick: null, box: s ? s.box : '', postIn: '', set: {},
})
/* THE BELT, AT THE HEAD OF EVERY WRITE AN OPENED ROW MAKES — one for all three editors: the whole row's Save, Suspend /
   Enable, Give sign-in, Archive and Delete; the short row's Save; the archived row's Restore, "Restore as", Save name and
   Delete (both of Delete's taps, the arming one too). The page closes a row whose judgement changed when it next draws,
   but his move landing as the date rolls past its day redraws nothing, so each press asks again first: where the row
   changed under it, nothing is sent, the row closes, and the passing note says so (his D2730 Q13 — the one note, the
   existing words). True when the press may go on. (`t` — what is typed, where the row's change can hang on it: the
   short row's pick.)
   `day` — THE DAY THE ARCHIVED ROW'S POST-IN BOX SHOWED in the draw whose press this is (the eighth round, the plan's
   §2.1 step 3a): a box he never set showed a day that is no longer today — his move or the clock past midnight with
   nothing redrawn — so a press on that screen is refused whatever it writes: Restore and "Restore as" would send that
   day, and Save name and Delete keep the same check (msq-s2-rejudge4.test.tsx §19 pins both since round 4).
   THE NOTE IS THE PAGE'S TO SAY (the ninth round — Astra 1, the fresh Opus 1's and 2's F1 of the eighth read): the press
   said its note straight to the passing note and the close redrew the page, whose judging then said the OTHER piece of
   open work's note — one element, so the second replaced the first. `onClose(true)` — "closed, found changed" — hands it
   to the page, which closes every piece of open work no longer as it was started and says all their notes in one batch,
   this row's first (UsersPanel's closeFound). A deleted man's row pressed still says its note (the judge's `gone` is
   silent only on a draw and as the page goes).
   `listed` — IS HE STILL ON THE PAGE'S LIST, as the page stands at this press: his search, his ticks and his fold as they
   were drawn, the store as it is now (the tenth round — the security reader's F1 = Astra 1 of the ninth read). The draw
   closes a row whose man left the list by no act of his (useOpenWorkJudged's `left`), but the judge never asked it, so
   with nothing redrawn a press still wrote: Saber, on 149, had picked View on Hunter's short row (listed only for his
   Plan of 149) and Kestrel took the Plan — Save gave Hunter View; a Role or CAT tick no longer keeping the man let a
   whole row's Save write the same way. A page function, never a value of the man (UsersPanel's listedNow): an editor
   only asks it. Not listed → nothing is sent, the row closes, the note, as the draw would. */
function askAgain(pid: string, on: OpenedOn, onClose: (found?: true) => void, listed: (pid: string) => boolean, t?: Typed, day?: string): boolean {
  if (judgeRow(pid, on, t ?? null, day) === 'ok' && listed(pid)) return true
  onClose(true)
  return false
}
/* a press that sends, or stands on, the day a box showed: the box he never set showed a day that is no longer today */
const dayGone = (t: { set: { postIn?: true } } | null | undefined, day: string | undefined): boolean =>
  day !== undefined && !t?.set.postIn && day !== effectiveToday()
/* AN EDITOR JUDGES ITSELF ON ITS OWN DRAWS TOO (Astra 2): typing in an opened row redraws its editor alone — a draw the
   page does not judge — so after his move landed with nothing redrawn, the first key drew the whole editor again for a man
   by then another squadron's. Each editor asks on every draw; where the row changed it draws nothing (the caller returns
   null on `true`) and, once that draw is committed and before it is painted, asks the page to draw again — the page's own
   judging then closes the row and raises the note by its one rule (useOpenWorkJudged). So the note has one home: never
   twice with the page's own, and once where a draw runs twice (React's strict mode — asking the page twice draws it
   twice, and the second finds the row already closed). */
function useJudgedOnDraw(pid: string, on: OpenedOn, onStale: () => void, t?: Typed): boolean {
  const stale = rowChanged(pid, on, t)
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
   saved is marked on the row (`data-unsaved`): picked, and not the line he holds now — and that very test is the row's
   report to the leave-guard, worked out by the page as the whole row's and the archived row's are (shortUnsaved, above;
   UsersPanel's useRowReports — the fifth round: the short row reported nothing). Save reads the line he holds once more
   (a press with nothing redrawn) and sends only a pick that differs from it. The row stays open across such a change —
   he is still another squadron's man on the same page — never closed for it, WHILE HE STAYS ON THE PAGE'S LIST: a Plan
   holder listed only for his Plan leaves the list when it goes, and the page then closes the row with the note
   (useOpenWorkJudged — the third round, the Fable read 3).
   A PICK PUT BACK BY HAND IS LET GO (the third round — the security read 1): a press of the very line he holds was kept as
   a pick, so View pressed and then None pressed again left a row reading as untouched yet holding "None"; when another
   admin then gave him View, the row turned, with no press, into a change back to None, and its Save undid the other
   admin's act — at worst gave back a Plan lowered on purpose. Pressing the line the row shows him holding lets the pick
   go, so the row is the untouched row it reads as.
   THE PICK IS HELD BY THE PAGE, WITH THE SIGN-IN IT WAS MADE ON (the fourth round — Astra's finding 1; Typed, above): it
   was this editor's own, so a regrouping of the list, which makes the editor anew, dropped it without a word. And it
   counts only while that sign-in is still his: where his sign-in was put on another man and he was later given a new
   one, the row shows the new sign-in's line untouched.
   A PICK THAT CAN NO LONGER BE SENT IS NEVER DROPPED WITHOUT A WORD (the fifth round — the security reader and the fresh
   Fable, by reading): a pick made, then the man made a master admin by another admin — or his sign-in put on another
   man — and Save closed the row with nothing sent and nothing said. Made a master admin, or his sign-in gone or put on
   another account, the row counts as changed: it closes with the note on the draw where a draw comes, and at Save where
   none does (rowChanged's pickCannotGo — the sixth round brought the sign-in into the draw; before it a draw fell back to
   "No sign-in…", the pick gone without a word). With no pick made, his sign-in given or taken is followed live, as the
   third round built and pinned it.
   A PICK MADE EQUAL TO HIS LINE BY ANY ROUTE IS LET GO (the sixth round — the fresh Opus 1's finding 2): another admin's
   change that makes the line he holds equal to the pick left the row reading untouched yet still holding it, and when
   that admin later changed the line again the row turned, with no press, into a change — its Save undoing his latest
   act, the very shape the hand put-back above closes. The page lets the pick go on the draw that finds it equal
   (useOpenWorkJudged), as the press here lets go a pick put back by hand. */
function ForeignEditor(p: {
  pid: string; on: OpenedOn; typed: Typed; onTyped: (t: Typed) => void; onClose: (found?: true) => void; onStale: () => void
  listed: (pid: string) => boolean; afterWrite: (write: () => void) => void
}) {
  const stale = useJudgedOnDraw(p.pid, p.on, p.onStale, p.typed)
  const unit = p.on.unit
  /* what he holds, read from the store as it stands — on every draw, and once more at Save — and the admin's pick, where
     it was made on the sign-in he holds now (shortHeld, above) */
  const { a, rolePick, picked, line: lineNow } = shortHeld(p.pid, unit, p.typed)
  const line = picked ?? lineNow
  const unsaved = shortUnsaved({ a, rolePick, picked, line: lineNow })
  const save = () => {
    if (!askAgain(p.pid, p.on, p.onClose, p.listed, p.typed)) return
    const held = shortHeld(p.pid, unit, p.typed)
    /* (a pick made that is no longer on the sign-in he holds: his row changed while it was open) */
    if (p.typed.pick && held.picked === null) return p.onClose(true)
    if (!held.a || held.rolePick === 'master' || held.picked === null || held.picked === held.line) return p.onClose()
    const to = held.a.id, line = held.picked
    /* (the write and the other piece of open work judged with it, its note after this receipt — the page's afterWrite) */
    p.afterWrite(() => { if (done(saveAccess(to, { grants: { [unit]: line } }), 'Saved')) p.onClose() })
  }
  if (stale) return null
  return (
    <div className="acc-edit" data-editing={a ? a.id : p.pid} data-short="1" {...(unsaved ? { 'data-unsaved': 'true' } : {})}>
      {a
        ? <SquadronLines pid={p.pid} hasSignIn rolePick={rolePick} only={unit} now={{ [unit]: lineNow }} pick={{ [unit]: line }}
            onPick={(u, v) => {
              if (u !== unit) return
              /* THE PRESS IS JUDGED FIRST, AND COMPARED WITH THE LINE HE HOLDS AT THE PRESS (the ninth round — Astra 2 of
                 the eighth read): it compared with the line of the last draw, so where another admin had changed his line
                 with nothing redrawn — Saber took Ranger's View of 149 after Kestrel picked None — Kestrel's press of View
                 read as a put-back, the pick was let go, the row showed None and Save sent nothing: his deliberate View
                 dropped without a word. So: the row judged first, the pick held with it (where it changed under him the
                 page is asked to draw again, and its judging closes the row and says so); then the line he holds read
                 afresh, from the store; the pick let go only where the line pressed IS that fresh line, on the very
                 sign-in the screen showed (the hand put-back, round 3's security read); otherwise his choice is kept.
                 The pick is always made on the sign-in the screen showed (`a`), never on one read afresh: where his
                 sign-in was put on another man and he was given a new one with nothing redrawn, a press made on the old
                 screen must land on neither (the sixth read's security pin S1) — the pick made on a sign-in no longer
                 his closes the row with the note on the draw this press causes (pickCannotGo). (A pick the store has
                 since made equal is still let go on the next draw — pickNowHeld.)
                 STILL LISTED, AND NEVER A MASTER ADMIN'S PUT-BACK (the tenth round): a man who left the page's list
                 by another admin's change, nothing redrawn, is not picked for — the page is asked to draw again, and
                 its judging closes the row with the note (`left` — the security reader's F1); and a man made a master
                 admin unseen holds no line, yet the store reads 'none' for him, so a press of None was taken for a
                 put-back and let go without a word (opus2 F2 of the ninth read): his pick is held, and the draw it
                 causes closes the row with the note (pickCannotGo). */
              if (rowChanged(p.pid, p.on, p.typed) || !p.listed(p.pid)) { p.onStale(); return }
              const fresh = shortHeld(p.pid, unit, p.typed)
              const putBack = !!fresh.a && fresh.a.id === a.id && fresh.rolePick !== 'master' && v === fresh.line
              p.onTyped({ ...p.typed, pick: putBack ? null : { acct: a.id, line: v } })
            }} />
        : <p className="adm-note acc-note" id="accEdNoSignIn">{noSignInWords(otherSqnOf(p.pid) ?? '')}</p>}
      <div className="acc-acts">
        {a && <button className="abtn primary" id="accEdSave" onClick={save}>Save</button>}
        <button className="abtn" id="accEdCancel" onClick={() => p.onClose()}>Cancel</button>
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
   a fact of the man, so no part of the copy (`role` — his role as the COPY holds it, the master mark first: `s.role`).
   `adminOff` (U2, his D2730 Q8, D2806): his home that day — the squadron whose admin he would be — where "Admin" is
   greyed in his Role box, with its one grey line, because the signed-in person may not make an admin of it
   (state/accounts.ts mayGivePlanNow, the doors' own reader); else null. Judged on the copy's role, never on what is
   picked: a man already an admin ('admin' or 'master') is never greyed, so Member picked on an admin's row can be put
   back to Admin before Save. Not asked where the whole box is greyed (roleLocked) — one reason at a time — nor for a man
   with no home known: there is no squadron to name, and the door refuses that press in its own words. His home is one
   of the four judged facts of the open row (OpenedOn's `home`), so while the row stands this is that very squadron. */
function rowLocks(pid: string, role: RolePick): { rest: boolean; roleLocked: boolean; adminOff: string | null } {
  const home = homeOn(pid, todayIso())
  const rest = !home || adminOfUnit(home)
  const roleLocked = !rest || (role === 'master' && !actorIsMaster())
  const adminOff = !roleLocked && home && role !== 'admin' && role !== 'master' && !mayGivePlanNow(home) ? home : null
  return { rest, roleLocked, adminOff }
}

/* ONE ROW PER PERSON ON THE ROSTER (D309, D310). Tap it for his sign-in, his role and his state's buttons — never your
   own row (another admin changes it). A row with an account keeps `data-acct` (the account's id) beside `data-person`. */
/* (`listed`, `afterWrite` — the page's own two functions, handed on to the editor: is he still on the page's list at a
   press (askAgain), and run a write with the other piece of open work judged in its batch (UsersPanel's afterWrite)) */
// eslint-disable-next-line react-doctor/no-high-complexity-react-function -- one man's row, whole or short, drawn from one copy of open work and its locks; split, a part could read a field the copy does not hold and an open row stay open on stale facts (msq-s2-rejudge4 §20 pins what it may read); the per-squadron edit-rights branching; the split filed for the tidiness audit before the database step ([USERS-PANEL-SPLIT], D486)
function PersonRow(p: {
  pid: string; open: boolean; openOn?: OpenedOn | null; typed?: Typed | null; onTyped: (t: Typed) => void
  ringed?: boolean; onToggle: () => void; onClose: (found?: true) => void; onStale: () => void
  listed: (pid: string) => boolean; afterWrite: (write: () => void) => void
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
     closes it the moment that judgement changes (UsersPanel's useOpenWorkJudged — U1's fix, the two reads of chat 199), so
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
        ? <ForeignEditor pid={p.pid} on={openOn} typed={p.typed} onTyped={p.onTyped} onClose={p.onClose} onStale={p.onStale}
            listed={p.listed} afterWrite={p.afterWrite} />
        : !foreignHere(p.pid) && openOn.shown && <PersonEditor pid={p.pid} on={openOn} s={openOn.shown} typed={p.typed} onTyped={p.onTyped}
            onClose={p.onClose} onStale={p.onStale} listed={p.listed} afterWrite={p.afterWrite} />)}
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
   added to the copy. msq-s2-rejudge4.test.tsx §20 holds what a test of the file can: the names this function may use
   (a reader called by name in it fails), the props it is handed and reads (a value of the man handed in as a new prop
   fails), and the names its parts rowLocks, SquadronLines and lineState may use — its own comment says what that still
   does not prove.
   WHAT IS TYPED OR PICKED — the sign-in box, the Role box, the lines — is the admin's, held by the page with the open row
   (`typed`, started from the copy at each fresh opening), so the list regrouping under it never drops it. */
/* HAS THE ADMIN TYPED OR PICKED ANYTHING IN THE WHOLE ROW — the sign-in, the Role, a squadron's line: what is typed (the
   page's) against the copy the row opened on, never a second read of the man. The whole row's part of the open row's
   report to the leave-guard, which the page works out (rowWork, below — the fifth round moved the report out of the
   editor: a row he hid by his own search kept its typing, the page's, yet stopped counting when its editor went). */
/* (since the eighth round a field counts only where HE SET it — its mark — and its value is not the copy's: a value put
   back by hand is not counted, and equality never makes a mark — the plan's §1.2) */
const typedDiffers = (t: Typed, s: Shown): boolean =>
  (!!t.set.name && t.name !== s.name) || (!!t.set.role && t.role !== s.role)
  || (!!t.set.lines && JSON.stringify(t.lines) !== JSON.stringify(s.lines))
/* …AND IN THE ARCHIVED ROW'S TWO BOXES — the callsign read TRIMMED, as every other reading of it is (the fresh Fable's
   finding 5: a callsign typed with a space after it still counted after Save name had saved it) */
/* (the post-in date: his mark alone — a date he picked always counts, even the day the box opened on: the copy holds no
   date to compare with, the plan's §1.2) */
const boxesDiffer = (t: Typed, s: Shown): boolean => (!!t.set.box && t.box.trim() !== s.box) || !!t.set.postIn
/* THE OPEN ROW'S REPORT TO THE LEAVE-GUARD, FROM WHAT THE PAGE HOLDS (the fifth round — the fresh Opus 2 and 3, the fresh
   Fable 4, the security reader's note; agreed with the core's chat 204, whose guard it is): the open row, its copy and
   what is typed in it — never from an editor, which is drawn only while the row is on the list. So a row hidden by his
   own search, a Filter tick or the shut Archived fold still counts (the guard's doors do not need the row on screen),
   and the short row counts too. Which report: a man's roster row, whole or short ('user'), or an archived man's
   ('arch'); null — nothing open, or nothing typed that differs:
   - a WHOLE row: what is typed differs from its copy (typedDiffers);
   - a SHORT row: the pick differs from the line he holds now — the very test that marks it "not saved" (shortUnsaved);
   - an ARCHIVED row: its two boxes differ from its copy (boxesDiffer). */
function rowWork(pid: string | null, on: OpenedOn | null, t: Typed | null): 'user' | 'arch' | null {
  if (!pid || !on || !t) return null
  const kind = kindOf(on)
  if (kind === 'short') return shortUnsaved(shortHeld(pid, on.unit, t)) ? 'user' : null
  if (!on.shown) return null
  if (kind === 'arch') return boxesDiffer(t, on.shown) ? 'arch' : null
  return typedDiffers(t, on.shown) ? 'user' : null
}
/* (the two reports as the guard's rows name them — `userrow` a man's roster row, `archrow` an archived man's; each
   counts while it is so and leaves with the page, ui/guard.ts useGuardWork) */
function useRowReports(pid: string | null, on: OpenedOn | null, t: Typed | null): void {
  const work = rowWork(pid, on, t)
  useGuardWork('userrow', work === 'user')
  useGuardWork('archrow', work === 'arch')
}
function PersonEditor(p: {
  pid: string; on: OpenedOn; s: Shown; typed: Typed; onTyped: (t: Typed) => void; onClose: (found?: true) => void; onStale: () => void
  listed: (pid: string) => boolean; afterWrite: (write: () => void) => void
}) {
  const { s, typed } = p
  const { name, role, lines } = typed
  const has = s.acct !== null
  /* judged again on every draw of its own (useJudgedOnDraw), and at the head of every action this row takes — Save,
     Suspend / Enable, Give sign-in, Archive, Delete — by the judgement the page holds, whole, and whether he is still on
     the page's list (askAgain, the one belt); every write then runs through the page's afterWrite, so the other piece of
     open work it closes is named after this press's own receipt, never in its place (the tenth round) */
  const stale = useJudgedOnDraw(p.pid, p.on, p.onStale)
  const stillHis = (): boolean => askAgain(p.pid, p.on, p.onClose, p.listed)
  const { rest, roleLocked, adminOff } = rowLocks(p.pid, s.role)
  /* the delete's first tap arms it; Cancel, closing the editor or another row disarms it (the editor unmounts — a
     regrouping disarms it too: a delete is never left armed across a redraw of the list) */
  const [armDel, setArmDel] = useState(false)
  const save = () => {
    if (!s.acct || !stillHis()) return
    /* the role, the mark, every squadron's line AND his sign-in in ONE command (accounts.ts saveAccess — one Undo step;
       every part checked before anything is written — the final reads, R4: the rename ran after as a second command, so
       a refused rename left the access saved); a rename alone through its own door, one command as before */
    const want = accessWant(role, s.role, lines, s.lines)
    const renamed = name !== s.name
    if (!want && !renamed) return p.onClose()
    const acct = s.acct
    p.afterWrite(() => {
      const bad = want ? saveAccess(acct, renamed ? { ...want, name } : want) : updateAccount(acct, { name })
      if (done(bad, 'Saved')) p.onClose()
    })
  }
  const onOff = () => {
    if (!s.acct || !stillHis()) return
    const acct = s.acct, enabling = !s.on
    p.afterWrite(() => {
      if (done(updateAccount(acct, { on: enabling }), s.on ? `${s.cs} suspended` : `${s.cs} can sign in again`)) {
        /* D284, D307: enabling his account is one of the "he's back" acts — the Quals prompt to check his quals */
        if (enabling) { markBack(p.pid); notify() }
        p.onClose()
      }
    })
  }
  const archive = () => {
    if (!stillHis()) return
    p.afterWrite(() => {
      const r = archivePerson(p.pid)
      if (done(r.bad, r.said)) p.onClose()
    })
  }
  const del = () => {
    if (!stillHis()) return
    if (!armDel) { setArmDel(true); return }
    p.afterWrite(() => { if (done(deletePerson(p.pid), `${s.cs} deleted`)) p.onClose() })
  }
  if (stale) return null
  return (
    <div className="acc-edit" data-editing={s.acct ?? p.pid}>
      <div className="adm-2col">
        <div className="mfield"><label htmlFor={has ? 'accEdName' : 'accGiveName'}>Sign-in (defence mail)</label>
          <input id={has ? 'accEdName' : 'accGiveName'} value={name} maxLength={MAX_SIGNIN} placeholder="name@mail" disabled={!rest}
            onChange={e => p.onTyped({ ...typed, name: e.target.value, set: { ...typed.set, name: true } })} /></div>
        <div className="mfield"><label htmlFor={has ? 'accEdRole' : 'accGiveRole'}>Role</label>
          {/* (no sign-in yet: Member or Admin — the mark is given on an account, D2320) */}
          {/* ("Admin" greyed with its one line under the box where he may not make an admin of the man's squadron — D2806,
              the drawings q13-d-rec, q13-p-rec; rowLocks hands none to a box greyed whole) */}
          <RoleBox id={has ? 'accEdRole' : 'accGiveRole'} value={role} disabled={roleLocked} masterOff={!has || !actorIsMaster()}
            adminOff={adminOff} onChange={v => p.onTyped({ ...typed, role: v, set: { ...typed.set, role: true } })} /></div>
      </div>
      {/* every other squadron's line, as it stands (the copy's) and as picked (ui/UserAccess.tsx) */}
      <SquadronLines pid={p.pid} hasSignIn={has} rolePick={role} now={s.lines} pick={lines}
        onPick={(u, v) => p.onTyped({ ...typed, lines: { ...lines, [u]: v }, set: { ...typed.set, lines: true } })} />
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
              p.afterWrite(() => { if (done(addAccount(name, p.pid, role === 'master' ? 'admin' : role), `${s.cs} can sign in now`)) p.onClose() })
            }}>Give sign-in</button>}
        {/* D310, D322, D323: Archive — one tap; it also suspends his sign-in; on the war "posted out from today" */}
        <button className="abtn" id="accEdArchive" disabled={!rest} onClick={archive}>Archive</button>
        {/* D287, D298 "Delete": his account and his person (a hidden mark underneath, D290); asks twice, says what goes */}
        <button className={'abtn danger' + (armDel ? ' del-armed' : '')} id="accEdDel" disabled={!rest} onClick={del}>
          {armDel ? `Tap again to delete ${s.cs}` : 'Delete'}</button>
        <button className="abtn" id="accEdCancel" onClick={() => p.onClose()}>Cancel</button>
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
  pid: string; open: boolean; openOn?: OpenedOn | null; typed?: Typed | null; onTyped: (t: Typed) => void
  ringed?: boolean; onToggle: () => void; onClose: (found?: true) => void; onStale: () => void; onWrote: () => void
  listed: (pid: string) => boolean; afterWrite: (write: () => void) => void
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
      {p.open && p.openOn && p.openOn.shown && p.typed && <ArchivedEditor pid={p.pid} on={p.openOn} s={p.openOn.shown}
        typed={p.typed} onTyped={p.onTyped} onClose={p.onClose} onStale={p.onStale} onWrote={p.onWrote}
        listed={p.listed} afterWrite={p.afterWrite} />}
    </div>
  )
}

/* HIS OPEN ARCHIVED ROW'S EDITOR — the callsign box, the post-in date and the buttons. A piece of its own (React Doctor
   no-high-complexity-react-function, 8 Nov 26).
   WHAT IS TYPED IN ITS TWO BOXES IS THE PAGE'S (`typed` — the fifth round; Typed, above), as the whole row's typing is:
   started by the page from the copy at each fresh opening — his callsign (or the next free one) and today, as before —
   and thrown away when the row closes; so the fold shut, a search or a tick that hides the row never drops it. Only the
   refusal under the boxes (`err`) and the armed Delete stay this editor's own: a Delete is never left armed across a
   redraw of the list, as on the whole row.
   IT READS THE MAN ONLY THROUGH THE COPY, as the whole row's editor does (`s` — shownOf): whether he has a sign-in, his
   callsign, whether a man on the roster holds it, and what the two boxes open on. Where any of it changes under the
   open row — another admin renames him, a man on the roster takes his callsign — the row closes with the note, as every
   opened row does.
   THE POST-IN DATE IS NO PART OF THE COPY (the eighth round, the plan's §1.3): the box shows the date he picked — his
   mark set by every pick in the calendar, the day already shown included — or, where he never set it, TODAY, worked out
   in this very draw (`day`); that day is the box's value AND the date Restore and "Restore as" send, so a press sends
   exactly the day on screen. A press on a box he never set that shows a day no longer today (his move or the clock past
   midnight, nothing redrawn) is refused, the note said (askAgain's `day`). The clock alone never closes the row.
   Judged again on every draw of its own (useJudgedOnDraw), and at the head of Restore, "Restore as", Save name and both
   of Delete's taps (askAgain, the one belt) — by the judgement held at the press, whole, so another squadron's archived
   man opened under a master admin's Squadron tick (the as-built pins B1 and B2, until the step that retires the tick) is
   judged by what he was when pressed, not taken for the page's own.
   `onWrote` — Save name is the one action of any opened row that leaves it open, and it changes the very callsign the
   copy holds: the page is told the write was this row's own and takes a FRESH COPY after it (a row's own actions never
   trip the guard), and never reads his leaving the list — the search no longer matching — as a change made under the
   admin (useOpenWorkJudged — a row's own writes raise no note). What he typed stays as he typed it: the callsign box,
   now the saved name, and THE POST-IN DATE HE PICKED, which the next Restore still uses. */
function ArchivedEditor(p: {
  pid: string; on: OpenedOn; s: Shown; typed: Typed; onTyped: (t: Typed) => void; onClose: (found?: true) => void; onStale: () => void
  onWrote: () => void; listed: (pid: string) => boolean; afterWrite: (write: () => void) => void
}) {
  const { s, typed } = p
  const { box } = typed
  const has = s.acct !== null
  /* the day the post-in box shows in this draw — his, or today live (above) — and so the day its presses send */
  const day = typed.set.postIn ? typed.postIn : effectiveToday()
  const stale = useJudgedOnDraw(p.pid, p.on, p.onStale, typed)
  /* (still on the page's list too, and every write through the page's afterWrite — as the whole row's, the tenth round) */
  const stillHis = (): boolean => askAgain(p.pid, p.on, p.onClose, p.listed, typed, day)
  const callsign = s.cs
  const taken = s.taken
  const [err, setErr] = useState('')
  const [armDel, setArmDel] = useState(false)
  const want = box.trim()
  const renamed = want !== callsign
  const restore = () => {
    if (!stillHis()) return
    p.afterWrite(() => {
      const bad = renamed
        ? restoreArchivedAs(p.pid, want, day)
        : restoreProblem(p.pid, day) || callsignProblem(callsign, p.pid) || (restoreArchivedPerson(p.pid, day) ? null : 'That did not save')
      if (bad) { setErr(bad); return }
      HOOKS.toast(`${want} restored — ${has ? 'he can sign in, and ' : ''}he'll be asked to check his quals and CAT`); notify(); p.onClose()
    })
  }
  const saveName = () => {
    if (!stillHis()) return
    p.afterWrite(() => {
      const bad = callsignProblem(want, p.pid)
      if (bad) { setErr(bad); return }
      const r = updatePersonField(p.pid, { callsign: want })
      if (r && r !== 'unchanged') { setErr(r); return }
      HOOKS.toast(`Renamed ${want}`); p.onWrote(); notify()
    })
  }
  const del = () => {
    if (!stillHis()) return
    if (!armDel) { setArmDel(true); return }
    p.afterWrite(() => { if (done(deletePerson(p.pid), `${callsign} deleted`)) p.onClose() })
  }
  if (stale) return null
  return (
    <div className="acc-edit" data-restoring={p.pid}>
      <div className="adm-2col">
        <div className="mfield"><label htmlFor="accArCs">{CALLSIGN_LABEL}</label>
          <input id="accArCs" value={box} autoComplete="off" onChange={e => { p.onTyped({ ...typed, box: e.target.value, set: { ...typed.set, box: true } }); setErr('') }} /></div>
        {/* every pick in the calendar marks the date his, the day already shown included (onSelect); onChange, called
            after it for a day that differs, has nothing more to write — onSelect has written the same pick */}
        <PostInField id="accArPostIn" value={day} onChange={() => {}}
          onSelect={v => { p.onTyped({ ...typed, postIn: v, set: { ...typed.set, postIn: true } }); setErr('') }} />
      </div>
      {taken && <p className="od-err" id="accArTaken">{callsign} is taken on the roster — give him another callsign.</p>}
      {err && <p className="od-err" id="accArErr">{err}</p>}
      <p className="od-said">{has ? 'He can sign in at once; the Leave War counts him from the post-in date.' : 'The Leave War counts him from the post-in date.'}</p>
      <div className="acc-acts">
        <button className="abtn primary" id="accArRestore" onClick={restore}>{renamed ? `Restore as ${want || '…'}` : 'Restore'}</button>
        {renamed && <button className="abtn" id="accArSave" onClick={saveName}>Save name</button>}
        <button className={'abtn danger' + (armDel ? ' del-armed' : '')} id="accArDel" onClick={del}>
          {armDel ? `Tap again to delete ${callsign}` : 'Delete'}</button>
        <button className="abtn" id="accArCancel" onClick={() => p.onClose()}>Cancel</button>
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
   whose row is open leaves it open, and he is brought into view: where he is on the list only by the search (another
   squadron's man found by it — the seventh round, the fresh Opus 2's finding 1 of the sixth read), the search is KEPT,
   so his open row stays on the page, ringed — clearing it took him off the list and held his open row, and what he had
   picked in it, out of sight. Otherwise the search is cleared, as before. (`open` — whose row is open; `close` — the
   page's; `listedWithoutSearch` — would this man be on the list with the search empty, the page's ticks as they are.)
   …AND THAT CLOSE IS SILENT EVEN WHERE THE ROW HAD CHANGED UNSEEN (the fifth round — Astra's finding 3, the fresh Fable's
   6): the close only ASKS the page to let the row go — this draw still has the old row in hand — and the judging later in
   the same draw then found a row whose man's move had landed with nothing redrawn, and said the note about his own act.
   So the landing also answers `closedNow` for the draw it closed a row in, and the page hands the judging no open row
   for that draw (UsersPanel). A landing for the man whose row is open closes nothing and is judged as before.
   SINCE THE EIGHTH ROUND (the plan's §2.3, §2.6): the landing writes no open work itself — `closedNow` is handed to the
   page's one judging of the draw (useOpenWorkJudged), which closes the row there, silently, so no second writer can bring
   it back open; Give access is left as it is. And a landing on the man whose row is open brings him into view by the
   search: listed with the search empty → the search cleared (as before); else, where the search as it stands finds him
   (`foundNow`) → kept (the seventh round); else → the search reads his callsign, so it finds him (Astra-7 #2, opus2-7 #3).
   The Filter's ticks are never touched: where a tick hides him, his row stays held out of sight, as before (the plan's
   §3). */
type Ring = { seq: number; pid: string; on: boolean } | null | undefined
/* what a landing does to the search: '' clears it, null keeps it, else it reads his callsign (the comment above) */
const landingSearch = (open: string | null, pid: string, listed: (pid: string) => boolean, found: (pid: string) => boolean): string | null =>
  open !== pid || listed(pid) ? '' : found(pid) ? null : cs(pid)
function useRingLanding(
  ring: Ring, setFind: (v: string) => void, setArchOpen: (v: boolean | null) => void, open: string | null,
  listedWithoutSearch: (pid: string) => boolean, foundNow: (pid: string) => boolean,
): { ringPid: string | null; closedNow: boolean } {
  const [ringSeen, setRingSeen] = useState(0)
  let closedNow = false
  if (ring && ring.seq !== ringSeen) {
    setRingSeen(ring.seq)
    closedNow = !!open && open !== ring.pid
    const to = landingSearch(open, ring.pid, listedWithoutSearch, foundNow)
    if (to !== null) setFind(to)
    setArchOpen(P(ring.pid) && P(ring.pid).archived ? true : null)
  }
  const ringPid = ring && ring.on ? ring.pid : null
  const ringAt = ring && ring.on ? ring.seq : 0
  useEffect(() => {
    if (!ringPid) return
    const row = Array.from(document.querySelectorAll<HTMLElement>(`#page-admin .acc-row[data-person="${CSS.escape(ringPid)}"]`)).find(x => x.getBoundingClientRect().height > 0)
    row?.scrollIntoView?.({ block: 'center' })
  }, [ringPid, ringAt])
  return { ringPid, closedNow }
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
/* ALL OPEN WORK IS JUDGED AGAIN ON EVERY DRAW (U1's fix — the two reads of chat 199: a row opened whole stayed the whole
   editor across a pick or his move landing; a short row held across a pick showed the old squadron's line). Set while
   drawing, as useUsersFilter clears its ticks, so no frame draws the work as it was: where an entry's judgement now
   differs from the one it was started on (the one judge, above) the entry closes and nothing typed is carried over.
   Closed by his own pick or bell tap: no note, his own act. Closed any other way (a move landed, an Undo, another's
   change, his own move at midnight, a right of his ended): the passing note (his D2730 Q13), once, by the one rule
   (noteOwed) — raised after the draw, not in it, so a draw run twice (React's strict mode) never says it twice.
   THE NOTE IS OWED WHENEVER HE DID NOT PICK (the second round — the Opus read 1, Astra 3, the Fable read 5). "The page's
   squadron changed" once stood in for "he picked", so a Plan of his taken or lowered by another admin, or his own move
   at midnight, closed the row and dropped his typing in silence. His pick is read from the app's own record of one, on
   the draw right after the change it made (the judge's step 2). (The second round's re-hold of the squadron in view on
   every draw the row survived, and closedByHisPick with it, went with the eighth round: no entry outlives a change of the
   squadron in view, so no earlier pick is ever taken for the cause of a later close.) */

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
   screen, and a change of `shown` is his own act — the row is held, judged all the same, and closed without a word.
   A ROW HE PUT AWAY IS STILL ASKED WHETHER ITS MAN IS ON THE LIST (the fifth round — the fresh Fable's finding 2). "Left
   the list by no act of his" was asked only of a row drawn at the last draw; a row he had put away himself was never
   asked again, and a short row holds no copy, so nothing else closed it. Saber gave Mako Plan of 149, opened Mako's short
   row, picked View (to LOWER the Plan), typed something else in the search — or went to another Admin card — and pressed
   Undo: Mako was off 149's list. Found again by the search, the row was drawn OPEN with no press, View picked, "not
   saved" — and its Save GAVE View to a man who held nothing. So the page also remembers his search, his ticks and his
   fold AS THEY STOOD WHEN THE ROW WAS LAST ON THE PAGE (`at`, held with the picture and carried while the row is out of
   sight), and of a row that was out of sight at the last draw it asks, on every draw — the one that brings it back
   too: would he still be on the list as it stood then (`still` — stillListed, below)? Where not, the row closes, with
   no note: it was not on the page. A row its OWN write took off the list (the archived row's Save name, the search no
   longer matching his new callsign) is not asked: the list as it stood no longer says anything of him, so nothing is
   held of it until the row is on the page again (`at` null — UsersPanel's ownWrite), and the row stays held, as it was. */
type PageAt = { drawn: boolean; shown: boolean; q: string; filt: UsersFilter; arch: boolean | null; wrote: number; still: boolean }
type ListAt = { q: string; filt: UsersFilter; arch: boolean | null }
type SeenAt = PageAt & { pid: string; at: ListAt | null }
const hisOwnAsBefore = (was: PageAt, now: PageAt): boolean =>
  was.shown === now.shown && was.q === now.q && was.filt === now.filt && was.arch === now.arch && was.wrote === now.wrote
/* would the open row's man still be on the list, with his search, ticks and fold as they stood when his row was last on
   the page — asked only of a row that was out of sight at the last draw (true otherwise: a row that was on the page was
   on the list, and one that left it then is "left the list by no act of his", above) */
function stillListed(pid: string | null, seen: SeenAt | null, unit: string, today: string, master: boolean): boolean {
  if (!pid || !seen || seen.pid !== pid || seen.drawn || !seen.at) return true
  const v = usersView(unit, today, seen.at.q, seen.at.filt, master)
  return rowInView(v, pid, seen.at.arch ?? (!!seen.at.q && v.archived.length > 0))
}
/* A SHORT ROW'S PICK THAT NOW EQUALS THE LINE HE HOLDS — by another admin's change, or the admin's own Undo — let go on
   the draw that finds it so (the sixth round — the fresh Opus 1's finding 2; ForeignEditor's comment): the row is then
   the untouched row it reads as, and follows later changes. Asked only of a row the judging kept open — a pick whose
   sign-in is no longer his has closed it first (pickCannotGo). The pick read through shortHeld, as the row's own mark is. */
const pickNowHeld = (pid: string, on: OpenedOn, t: Typed | null): boolean => {
  if (!on.short || !t || !t.pick) return false
  const h = shortHeld(pid, on.unit, t)
  return h.picked !== null && h.picked === h.line
}
/* THE OPEN ROW AS THE PAGE HOLDS IT — whose row, what it was started on and the copy (`on`), what he typed (`typed`) —
   and ALL OPEN WORK (the one record — the plan's §1.1): the row and Give access, each slot one entry or none. */
type RowWork = { pid: string; on: OpenedOn; typed: Typed }
type OpenWork = { row: RowWork | null; give: GiveWork | null }
const NO_WORK: OpenWork = { row: null, give: null }
/* ONE WRITE OF THE OPEN WORK PER DRAW (the plan's §2.3 — the red team's opus1 F3): several things change it in one draw —
   a landing's close, the judge's closes, the short row's settle step, Give access's `drawn` re-held — and a second
   writer of `{ ...work, … }` would overwrite the first (a row closed by a landing brought back open, with his typing).
   So this one hook works the next record out once, from the record as it stands, and writes it once, only where it
   differs; every other write of it (the editors' typing, opening, closing, the row's own write) is a write that reads
   the record as React holds it at that moment (`setWork(w => …)`).
   - THE ROW: closed silently by a landing for another man (`closedNow` — his own act, useRingLanding); else judged — gone
     (silent), his pick (silent), changed (the note, where it was on the page at the last draw: `wasDrawn`); and, judged
     unchanged, the list around it as today (`left` — it left the list by no act of his: the note; `lost` — a row he had
     put away whose man is off the list as it stood then: silent); kept, the short row's pick now held let go
     (pickNowHeld) and the page around it held again (`see`).
   - GIVE ACCESS: judged — closed where not ok, the note by the one rule (noteOwed: changed, on his screen at the last
     draw, holding a change); kept, whether it is on his screen held again (`shown`).
   The notes owed are said together (sayChanged), after the draw, by one effect keyed on one page state set in the
   idempotent shape (never an updater), so React's strict mode says them once. */
// eslint-disable-next-line react-doctor/no-high-complexity-react-function -- the one judge: every piece of open work judged in one pass on one draw, its notes said once; split, two judges could disagree on one draw (plans/2026-11-27-msq-s2-open-work-judge.md); the per-squadron edit-rights branching; the split filed for the tidiness audit before the database step ([USERS-PANEL-SPLIT], D486)
function useOpenWorkJudged(
  work: OpenWork, setWork: (w: OpenWork) => void, see: (s: SeenAt) => void,
  j: { closedNow: boolean; seen: SeenAt | null; now: PageAt; shown: boolean },
): void {
  const [note, setNote] = useState<{ seq: number; callsigns: string[] } | null>(null)
  let next = work
  const owed: string[] = []
  const r = work.row
  if (r && j.closedNow) next = { ...next, row: null }
  else if (r) {
    const { pid, on, typed: t } = r
    const was = j.seen && j.seen.pid === pid ? j.seen : null
    /* (a row with nothing held of its last draw was pressed a moment ago: it was on the page) */
    const wasDrawn = was ? was.drawn : true
    /* (DELETED UNDER IT — another admin's delete; the row's own Delete closes it in the same press: the judge's `gone`,
       closed with NO note. The note ends "Open it again.", untrue of a man who is gone, and new words are not written
       here — D1625. A delete marks him `deleted` and archived with it, state/person-delete.ts deletePerson, so the
       judge asks "deleted" first.) */
    const why = judge({ kind: 'row', ...r }, 'draw')
    const left = why === 'ok' && !!was && was.drawn && !j.now.drawn && hisOwnAsBefore(was, j.now)
    /* (a row he had put away, whose man is off the list as it stood when the row was last on the page: above — `still`
       is true for any row that was on the page at the last draw, so this is never said) */
    const lost = why === 'ok' && !j.now.still
    if (why !== 'ok' || left || lost) {
      next = { ...next, row: null }
      if (wasDrawn && (left || noteOwed({ kind: 'row', ...r }, why, true))) owed.push(cs(pid))
    } else {
      if (pickNowHeld(pid, on, t)) next = { ...next, row: { ...r, typed: { ...t, pick: null } } }
      /* (the list as it stood is taken afresh only on a draw the row is on the page; out of sight it is carried) */
      if (!was || was.drawn !== j.now.drawn || !hisOwnAsBefore(was, j.now))
        see({ pid, ...j.now, at: j.now.drawn || !was ? { q: j.now.q, filt: j.now.filt, arch: j.now.arch } : was.at })
    }
  }
  const g = work.give
  if (g) {
    const why = judge({ kind: 'give', ...g }, 'draw')
    if (why !== 'ok') {
      next = { ...next, give: null }
      if (noteOwed({ kind: 'give', ...g }, why, g.drawn.onScreen)) owed.push(g.callsign)
    } else if (g.drawn.onScreen !== j.shown) next = { ...next, give: { ...g, drawn: { onScreen: j.shown } } }
  }
  if (next !== work) setWork(next)
  if (owed.length) setNote({ seq: (note?.seq ?? 0) + 1, callsigns: owed })
  useEffect(() => {
    if (note) sayChanged(note.callsigns)
  }, [note])
}
/* THE NOTE WHEN THE APP ITSELF TAKES THE ADMIN PAGE AWAY (the third round — the Opus read 1, the Fable read 1). The list
   is drawn only while the app is on the Admin page (ui/Shell.tsx). A right of his lowered — his Plan of the squadron in
   view made a View — moves his own pages home and, in the same step, lands him on that squadron's View-only Sched (a
   squadron he only views offers no Admin page — state/store.ts, D2381): the list is taken off the page before it is drawn
   again, so the judging on a draw never ran and his open work and his typing went without a word. The page keeps the
   open work of its last draw in a ref (written after each draw, read only as the page goes) and judges each entry once
   more at that moment, by the same rule as a draw (noteOwed) — Give access as well as the row since the eighth round
   (Astra's finding 1 of the seventh read) — and says every note owed together (sayChanged).
   SILENT FOR EVERY WAY HE LEAVES (settled with the core's chat 204), each held by a test of the whole app:
   - another tab pressed: the Admin page is still his to open (`pageOffered`), so it was not taken from him — even where
     the work had changed under him with nothing redrawn, the leaving is his own;
   - Logout, and the switch to the member view: the role in force is no longer an admin's (`isAdmin`) — the member view
     moves his own pages home, which alone would read as a change. (Where another admin makes him a member under his
     open row the note IS said since the fourth round — on the draw before the page goes, never here: adminThere);
   - his own pick of a squadron he only views: the judge's `pick`, by the same rule as a draw;
   - work already closed, or put out of sight himself (not on his screen at the last draw): nothing was open to him;
   - a man deleted under it: no note, as on a draw (the judge's `gone`).
   Under React's strict mode the effect is set up, torn down and set up again only as the page first draws, when nothing
   is open — so it says nothing then, and once when the page really goes.
   (His own standing gone — his own move's day come, or another admin made him a member — needs nothing here: the page
   draws once more before the app makes his session again (ui/App.tsx), and that draw's judging closes the work with the
   note — adminThere, above.) */
type Leaving = { w: Entry; onScreen: boolean }
const takenAwayUnder = (o: Leaving): boolean =>
  isAdmin() && !pageOffered('admin') && noteOwed(o.w, judge(o.w, 'leaving'), o.onScreen)
/* (`rowOnScreen` — the open row on his screen at this draw: on the list and Users shown; Give access holds its own) */
function useNoteAsPageGoes(work: OpenWork, rowOnScreen: boolean): void {
  const last = useRef<Leaving[]>([])
  useEffect(() => {
    last.current = [
      ...(work.row ? [{ w: { kind: 'row' as const, ...work.row }, onScreen: rowOnScreen }] : []),
      ...(work.give ? [{ w: { kind: 'give' as const, ...work.give }, onScreen: work.give.drawn.onScreen }] : []),
    ]
  }, [work, rowOnScreen])
  useEffect(() => () => {
    const owed = last.current.filter(takenAwayUnder).map(o => (o.w.kind === 'row' ? cs(o.w.pid) : o.w.callsign))
    if (owed.length) sayChanged(owed)
  }, [])
}
/* A PRESS THAT FOUND ITS WORK CHANGED CLOSES EVERY PIECE NO LONGER AS IT WAS, AND NAMES THEM ALL AT ONCE (U1's ninth round
   — Astra 1, the fresh Opus 1's and 2's F1 of the eighth read). Hunter, 142's admin, had Ranger's whole row changed and
   Give access changed, both on his screen; his own move to 150 landed at midnight with nothing redrawn; he pressed
   Ranger's Save. The press said Ranger's note at once and closed the row; the close redrew the page, and its judging then
   found Give access changed too and said Newface's note — the passing note is one element, so Newface's replaced Ranger's
   and only one sentence was ever on his screen. Now the press decides for every piece at that one moment:
   - the pressed one closes and is named first — always, as a press that finds its work changed always says so (a deleted
     man's row too: the judge's `gone` is silent only on a draw and as the page goes);
   - the other piece is judged as the draw that follows would judge it ('draw' — the builder's reading: a request already
     gone is the door's to say only when ITS OWN form is pressed, so beside a press of the row the form is judged by its
     request too, and the draw after has nothing left to say over the row's note): where it is not ok it closes too, and
     it is named where the one rule says so (noteOwed — changed, on his screen at the last draw: a piece he had put out of
     sight, or an unchanged Give access, goes without a word).
   The page closes both in one write and says the names in one batch (sayChanged). `rowOnScreen` — the open row on his
   screen at the last draw; Give access holds its own.
   THE OTHER PIECE IS JUDGED AS THE DRAW JUDGES IT, ALL OF IT (the tenth round — opus2 F1 = Astra 2 of the ninth read): the
   one judge, and then, for a row the judge keeps, the draw's two checks of the list around it — `left` (it was on his
   screen at the last draw and is no longer on the list, by no act of his: closed, the note) and `lost` (a row he had put
   out of sight whose man is off the list as it stood then: closed, silently). Without them a refused Give access beside
   a short row whose man had lost his Plan unseen said the form's note, and the draw after said the row's in a batch of
   its own, replacing it. (`x` — the page at this press: the row on his screen at the last draw, is he listed now, would
   he be on the list as it stood when last on the page — UsersPanel's pressAt.) */
type PressAt = { rowOnScreen: boolean; listed: (pid: string) => boolean; still: (pid: string) => boolean }
const KEEP = { close: false, named: false }
function otherAtPress(e: Entry, x: PressAt): { close: boolean; named: boolean } {
  const why = judge(e, 'draw')
  if (e.kind === 'give') return why === 'ok' ? KEEP : { close: true, named: noteOwed(e, why, e.drawn.onScreen) }
  if (why !== 'ok') return { close: true, named: noteOwed(e, why, x.rowOnScreen) }
  if (x.rowOnScreen && !x.listed(e.pid)) return { close: true, named: true }
  return x.still(e.pid) ? KEEP : { close: true, named: false }
}
function closedAtPress(w: OpenWork, pressed: 'row' | 'give', x: PressAt): { row: boolean; give: boolean; said: string[] } {
  const said: string[] = []
  let row = false, give = false
  if (w.row) {
    const o = pressed === 'row' ? { close: true, named: true } : otherAtPress({ kind: 'row', ...w.row }, x)
    row = o.close
    if (o.named) said.push(cs(w.row.pid))
  }
  if (w.give) {
    const o = pressed === 'give' ? { close: true, named: true } : otherAtPress({ kind: 'give', ...w.give }, x)
    give = o.close
    if (o.named && pressed === 'give') said.unshift(w.give.callsign)
    else if (o.named) said.push(w.give.callsign)
  }
  return { row, give, said }
}
/* THE PAGE'S PRESS PATHS — a plain function of the page's record and setters, out of UsersPanel so the component stays
   within the code check's size (the tenth round; as addFormDiffers and useOpenRequest are).
   `x` — THE PAGE AT THIS PRESS (PressAt): the open row on his screen at the last draw (`rowOnScreen`); IS THIS MAN ON THE
   PAGE'S LIST NOW (`listed` — UsersPanel's listedNow: the list worked out again from the store as it is at the press,
   with his search, his ticks and his fold as the draw holds them — what the draw's `left` asks, asked at the press too:
   askAgain, the short row's line press, and the other piece of open work — otherAtPress; only a row drawn at the last
   draw can be pressed, so "not listed" means he left the list after that draw, by no act of the admin's — the security
   reader's F1 of the ninth read); and would he be on the list as it stood when his row was last on the page (`still`).
   CLOSING A PIECE OF OPEN WORK — Cancel, his own finishing press, Escape (`found` absent) — or, `found` true, a press that
   found it changed (askAgain, giveAsked, the short row's Save): then every piece of open work no longer as it was started
   closes at that one moment and their notes are said together, the pressed one's first (closedAtPress — the ninth
   round). The record is the one of the draw whose press this is, which is the one on his screen; the slots are let go by
   a write that reads the record as React holds it (`setWork(w => …)`), each only where it still holds the very work of
   that draw.
   A PRESS THAT WRITES KEEPS ITS OWN RECEIPT (`afterWrite` — the tenth round, opus1 F2/F3 = opus2 F3 of the ninth read).
   Hunter typed a sign-in on Drifter's row, then gave Newface access On the roster as Drifter: the write said "newface@mail
   can sign in now", and the redraw then found Drifter's row changed (he has a sign-in now) and said its note in a batch
   of its own — the passing note is one element, so the receipt was replaced by "nothing was saved", about his own act a
   moment ago; the same for the door's own words ("That request is gone") beside a row another admin had changed. Now
   every writing press of an open piece of work runs its write here, inside the app's one note batch: the write (its
   receipt, or the door's own words, and its own close), then the OTHER piece of open work judged at once as the next draw
   would judge it (otherAtPress — the draw's `left` and `lost` too), let go where it is not ok and its note said in the
   same batch where the one rule owes it — receipt first, then the note, one line. The draw that follows finds it already
   closed and says nothing.
   …AND A WRITING PRESS THAT IS NO PIECE OF OPEN WORK KEEPS ITS RECEIPT TOO (`addWrite` — the eleventh round, opus1 F1/F2,
   opus2 F1 and Astra F1 of the tenth read): "+ Add a person" and Refuse on the waiting list. Hunter had Give access open
   and changed on Newface's request and added a person with the sign-in newface@mail: the add answered the request, the
   redraw closed the form and said its note in a batch of its own, and "… can sign in now" was replaced; an add under an
   archived man's callsign did the same to his open row, and Refuse past midnight to a row whose man's move had landed
   unseen. The add form and the waiting list are in neither slot, so here BOTH pieces are the other: each present one
   judged at once after the write (otherAtPress), every one that closes let go in one write, the callsigns owed a note
   said after the receipt — the row's first, then the form's — in the same one batch. */
type SetOf<T> = (v: T | ((cur: T) => T)) => void
function pressPaths(work: OpenWork, setWork: SetOf<OpenWork>, setSeen: SetOf<SeenAt | null>, x: PressAt) {
  const dropWork = (c: { row: boolean; give: boolean }) => {
    const rowPid = work.row?.pid, giveId = work.give?.id
    setWork(cur => ({
      row: c.row && cur.row && cur.row.pid === rowPid ? null : cur.row,
      give: c.give && cur.give && cur.give.id === giveId ? null : cur.give,
    }))
    if (c.row) setSeen(null)
  }
  const closeFound = (pressed: 'row' | 'give') => {
    const c = closedAtPress(work, pressed, x)
    dropWork(c)
    if (c.said.length) sayChanged(c.said)
  }
  const afterWrite = (pressed: 'row' | 'give' | 'add', write: () => void): void => {
    HOOKS.toastBatch(() => {
      write()
      if (pressed === 'add') {
        const r = work.row ? otherAtPress({ kind: 'row', ...work.row }, x) : KEEP
        const g = work.give ? otherAtPress({ kind: 'give', ...work.give }, x) : KEEP
        if (r.close || g.close) dropWork({ row: r.close, give: g.close })
        const said = [...(work.row && r.named ? [cs(work.row.pid)] : []), ...(work.give && g.named ? [work.give.callsign] : [])]
        if (said.length) sayChanged(said)
        return
      }
      const other: Entry | null = pressed === 'row'
        ? (work.give ? { kind: 'give', ...work.give } : null)
        : (work.row ? { kind: 'row', ...work.row } : null)
      if (!other) return
      const o = otherAtPress(other, x)
      if (!o.close) return
      dropWork({ row: other.kind === 'row', give: other.kind === 'give' })
      if (o.named) sayChanged([other.kind === 'row' ? cs(other.pid) : other.callsign])
    })
  }
  return {
    closeRow: (found?: true) => {
      if (found === true) { closeFound('row'); return }
      setWork(w => (w.row ? { ...w, row: null } : w)); setSeen(null)
    },
    closeGive: (found?: true) => {
      if (found === true) { closeFound('give'); return }
      setWork(w => (w.give ? { ...w, give: null } : w))
    },
    rowWrite: (write: () => void) => afterWrite('row', write),
    giveWrite: (write: () => void) => afterWrite('give', write),
    addWrite: (write: () => void) => afterWrite('add', write),
  }
}

/* THE FORM'S REPORT TO THE GUARD (D2598, §18.3; ui/guard.ts's `addperson` row): counted while the form is open and
   anything in it differs from how a fresh form opens — each value the one resetAddForm and the first draw set, the
   post-in date the one it last opened fresh on (never today's, which moves at midnight under an untouched form).
   Folded counts nothing: only Cancel and Escape fold it, and both empty it first. (A plain function, out of
   UsersPanel, so the component's own control flow stays small — the code check, 26 Nov 26.) */
function addFormDiffers(name: string, np: NewPerson, role: AccountRole, postIn: string, postIn0: string): boolean {
  return name !== '' || JSON.stringify(np) !== JSON.stringify(BLANK) || role !== 'main' || postIn !== postIn0
}
/* A NEW REQUEST OPENS THE ADD FORM WHILE DRAWING (React's own pattern for state that follows a prop — the code check,
   26 Nov 26): a non-zero `openNew` not yet seen opens it, so the very render that draws the form is the one the page's
   focus effect runs after; a form Cancel folded stays folded until `openNew` changes again. The focus request is a
   ref, never written during a render, so it is set in an effect keyed on the request. (A hook of its own, out of
   UsersPanel, for the same reason addFormDiffers is.) */
function useOpenRequest(openNew: number | undefined, setAdding: (v: boolean) => void, wantFocus: React.MutableRefObject<number>): void {
  const [seen, setSeen] = useState(0)
  const req = openNew ?? 0
  if (req !== seen) {
    setSeen(req)
    if (req) setAdding(true)
  }
  useEffect(() => { if (openNew) wantFocus.current = openNew }, [openNew, wantFocus])
}
/* is this man's row on the list as it is drawn: not hidden by a tick or the search, his Archived fold open */
const rowInView = (v: UsersView, pid: string | null, archOpen: boolean): boolean =>
  !!pid && (v.groups.some(g => g.rows.includes(pid)) || (archOpen && v.archived.includes(pid)))

// eslint-disable-next-line react-doctor/no-high-complexity-react-function -- the page holds the one record of open work, its press paths and the bell's landing in one set of state; split, the order its hooks and effects run in would move under the security-read guard; the per-squadron edit-rights branching; the split filed for the tidiness audit before the database step ([USERS-PANEL-SPLIT], D486)
export function UsersPanel(p: { shown?: boolean; openNew?: number; ring?: Ring } = {}) {
  /* ALL OPEN WORK — the open row and Give access, each with what it was started on, its copy and what he typed (OpenWork,
     the plan's §1.1): the one record, judged on every draw by useOpenWorkJudged, which alone writes it in a draw */
  const [work, setWork] = useState<OpenWork>(NO_WORK)
  const editing = work.row?.pid ?? null, editOn = work.row?.on ?? null, typed = work.row?.typed ?? null
  /* …and the page around the open row as it stood at the last draw (PageAt, above) — set by `toggle`, held again by the
     judging on every draw the row survives; `wrote` counts the open row's own writes that left it open */
  const [seen, setSeen] = useState<SeenAt | null>(null)
  const [wrote, setWrote] = useState(0)
  /* THE OPEN ROW'S OWN WRITE THAT LEFT IT OPEN (the archived row's Save name): counted, so his leaving the list by it is
     never read as a change made under the admin — and A FRESH COPY taken, the store read after the write, so the row's
     own action never trips its guard (the press asked again first, so nothing else differs; the squadron in view is
     kept as held, and who is looking).
     (The seventh round's keeping of the copy's post-in date went with the eighth: the copy holds no date, and a date he
     picked keeps its own mark across Save name — the plan's §1.3.) */
  const ownWrite = useCallback((pid: string) => {
    const fresh = judgedNow(pid)
    setWrote(n => n + 1)
    setWork(w => (w.row && w.row.pid === pid ? { ...w, row: { ...w.row, on: { ...fresh, view: w.row.on.view, actor: w.row.on.actor } } } : w))
    /* (…and the list as it stood when the row was last on the page says nothing of him after his own rename: let go, and
       taken afresh at the next draw his row is on the page — SeenAt's `at`) */
    setSeen(s => (s ? { ...s, at: null } : s))
  }, [])
  const setRowTyped = (t: Typed) => setWork(w => (w.row ? { ...w, row: { ...w.row, typed: t } } : w))
  const setGiveTyped = (t: GiveTyped) => setWork(w => (w.give ? { ...w, give: { ...w.give, typed: t } } : w))
  /* OPENING WORK — THE ONE PLACE AN ENTRY IS PUT IN (the plan's §2.7): a row (`toggle`) or Give access (its button).
     NOTHING OPENS FOR A MAN WHO IS NOT, BY HIS ACCOUNT TODAY, AN ADMIN OF THE PAGE'S SQUADRON (the fifth round — the
     security reader's finding 1b; adminThere — and, since the eighth, for Give access too: opus2 F7 of the plan's red
     team): the page may still be standing after another admin made him a member, or suspended him, with nothing redrawn.
     Where his session no longer stands the app is asked to repaint, so it ends his session or makes it again at once
     (ui/App.tsx) — the press itself opens nothing and says nothing. Today it replaces what the slot holds without a word
     — refusing a second Give access, or another man's row, while one holds a change is his question, not built (C). */
  const openWork = (slot: 'row' | 'give', entry: RowWork | GiveWork): boolean => {
    if (!adminThere(pageUnit('own'))) { if (sessionLapsed()) notify(); return false }
    setWork(w => (slot === 'row' ? { ...w, row: entry as RowWork } : { ...w, give: entry as GiveWork }))
    return true
  }

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
  /* (useOpenRequest, above: declared before the focus effect, so its own effect runs first in the same commit) */
  useOpenRequest(p.openNew, setAdding, wantFocus)
  useEffect(() => {
    if (!wantFocus.current || !csRef.current) return
    wantFocus.current = 0
    addRef.current?.scrollIntoView?.({ block: 'nearest' })
    if (!HOOKS.isPhone()) csRef.current.focus()
  })

  /* a bell's posting line landing here ([POSTOUT-RUN-NOTICE]) — useRingLanding, above: a landing for another man closes
     the open row, and says so for this draw (`closedNow`), in which the row is no longer the page's to judge — the page's
     one judging closes it (useOpenWorkJudged) */
  const listedWithoutSearch = (pid: string): boolean =>
    rowInView(usersView(pageUnit('own'), todayIso(), '', filt, actorIsMaster()), pid, !!P(pid)?.archived)
  /* (…and whether the search as it stands finds him — his fold opened for him by the landing where he is archived) */
  const foundNow = (pid: string): boolean =>
    rowInView(usersView(pageUnit('own'), todayIso(), find.trim().toLowerCase(), filt, actorIsMaster()), pid, !!P(pid)?.archived)
  const { ringPid, closedNow } = useRingLanding(p.ring, setFind, setArchOpen, editing, listedWithoutSearch, foundNow)
  const openPid = closedNow ? null : editing, openOn = closedNow ? null : editOn

  const hasName = !!name.trim()
  const resetAddForm = () => { const t = effectiveToday(); setName(''); setNp(BLANK); setRole('main'); setPostIn0(t); setPostIn(t) }
  /* the form's report to the guard — addFormDiffers, above */
  useGuardWork('addperson', adding && addFormDiffers(name, np, role, postIn, postIn0))
  /* …AND WHETHER THIS SECTION IS IN SIGHT (the guard's note — his "save or cancel the open row on Users", D2627 A6, said
     while work of this section is held and another Admin section shows — the open row on Users, "Add a person" and
     "Give access", each of which the core's leave-guard counts): the Admin page's own `shown`, handed on as it is */
  useGuardSection('users', !!p.shown)
  const add = () => {
    const nm = name.trim().toLowerCase()
    const who = np.cs.trim()
    const ok = hasName ? `${who} added — ${nm} can sign in now` : `${who} added to the roster — set flight and quals on the Quals page`
    /* no home named: the door makes him the page's own squadron's — his home row and his first stint (accounts.ts
       addPersonAndAccount, PD1) — the squadron in view, always (D2729 Q1). Today's call otherwise, argument for argument. */
    addWrite(() => { if (done(addPersonAndAccount(name, np, role, postIn), ok)) resetAddForm() })
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
  /* is this man on the page's list at a press — PressAt's `listed`, above (the tenth round) */
  const listedNow = (pid: string): boolean =>
    rowInView(usersView(pageUnit('own'), todayIso(), q, filt, actorIsMaster()), pid, archOpenNow)
  /* ALL OPEN WORK IS JUDGED AGAIN ON THIS DRAW (useOpenWorkJudged) — here, once the list is worked out, because the
     judging asks whether the row is on it: by what each entry was started on, and the row by the page around it as it
     stood at the last draw. And once more as the page goes (useNoteAsPageGoes). */
  /* (drawn: on the list AND Users on his screen — a row is not on the page while another Admin card is, or, on a phone,
     the list of cards: PageAt, above) */
  const shown = !!p.shown
  const drawn = shown && rowInView(view, editing, archOpenNow)
  /* (…and, while it is out of sight, whether its man would still be on the list as it stood when his row was last on the
     page — stillListed, above) */
  const still = stillListed(editing, seen, unit, today, master)
  useOpenWorkJudged(work, setWork, setSeen, { closedNow, seen, now: { drawn, shown, q, filt, arch: archOpen, wrote, still }, shown })
  useNoteAsPageGoes(work, drawn)
  /* closing a piece of open work, and running a press's write — pressPaths, above (the page at this press: PressAt) */
  const { closeRow, closeGive, rowWrite, giveWrite, addWrite } = pressPaths(work, setWork, setSeen, {
    rowOnScreen: drawn, listed: listedNow, still: pid => stillListed(pid, seen, pageUnit('own'), todayIso(), actorIsMaster()),
  })
  /* THE OPEN ROW'S REPORT TO THE LEAVE-GUARD (D2595, D2598; ui/guard.ts's `userrow` and `archrow` rows) — from what the
     page holds, so a row out of sight still counts (useRowReports and rowWork, above) */
  useRowReports(openPid, openOn, typed)
  /* …AND GIVE ACCESS'S (ui/guard.ts's `giveaccess` row — D2598): counted while the form the page holds has a change
     (giveDiffers); the page drops a form whose request is gone in the same draw, before this is reported */
  useGuardWork('giveaccess', !!work.give && giveDiffers(work.give))
  /* (opening a row also holds how it is judged at this press — the page's squadron, short or whole, his home, archived or
     not, the squadron in view and the copy of all it shows: OpenedOn — the page around it: a row pressed is on the page,
     wherever Users is on his screen — and what will be typed in it, started from the copy) */
  const toggle = (pid: string) => {
    if (editing === pid) { closeRow(); return }
    /* (no row opens on a session that no longer stands — openWork, above) */
    const on = judgedNow(pid)
    if (!openWork('row', { pid, on, typed: typedFrom(on.shown) })) return
    setSeen({ pid, drawn: shown, shown, q, filt, arch: archOpen, wrote, still: true, at: { q, filt, arch: archOpen } })
  }
  /* Give access's button: a fresh form from the request, on his screen as it opens */
  const openGive = (r: AccessRequest) => { openWork('give', { id: r.id, ...giveFrom(r), drawn: { onScreen: shown } }) }
  /* ESCAPE CLOSES THE OPENED ROW AS ITS CANCEL DOES ((p), his D2396): nothing saved, no question, the keys back on the row;
     an open Filter panel answers first. Only while the row is on his screen: Users chosen, the row not hidden by a tick
     or the search. */
  useEscRow(drawn ? editing : null,
    pid => document.querySelector<HTMLElement>(`.acc-row[data-person="${CSS.escape(pid)}"]`),
    closeRow, FILTER_ESC)
  const row = (pid: string) => <PersonRow key={pid + (editing === pid ? ':e' : '')} pid={pid} open={editing === pid}
    openOn={editing === pid ? editOn : null} typed={editing === pid ? typed : null} onTyped={setRowTyped} ringed={ringPid === pid}
    onToggle={() => toggle(pid)} onClose={closeRow} onStale={judgeAgain} listed={listedNow} afterWrite={rowWrite} />
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
              <RoleSelect id="accAddRole" value={role} unit={unit} onChange={setRole} /></div>}
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
      <Waiting give={work.give} onTyped={setGiveTyped} onOpen={openGive} onClose={closeGive} afterWrite={giveWrite} addWrite={addWrite} />
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
                openOn={editing === pid ? editOn : null} typed={editing === pid ? typed : null} onTyped={setRowTyped} ringed={ringPid === pid}
                onToggle={() => toggle(pid)} onClose={closeRow} onStale={judgeAgain} onWrote={() => ownWrite(pid)}
                listed={listedNow} afterWrite={rowWrite} />)}
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
