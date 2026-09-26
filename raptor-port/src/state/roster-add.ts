/* THE ONE ADD — the only place a person is created ([ACCOUNTS-NEW-PERSON], 26 Sep 26).

   Owner, D217: "ok 1" — a new person (a new callsign) is created ONLY on Admin → Users:
   the admin adds him (with his account, or with a blank sign-in for someone who will not
   use the app — a SANS man from another squadron), or approves his own sign-up. D214: the
   admin's form and the person's sign-up ask the SAME things — callsign/name, initials,
   pilot / WSO / personnel, CAT — through "the same add the Quals page uses (one callsign
   rule)". The Quals page's own form is retired (its "+ Add person" is a button to Admin →
   Users now), so its rules moved HERE, unchanged, and every door calls them:
   - the PID-01 guard (audit 12 Aug 26; hardened ARCH-STACK 1C, 14 Sep 26): a callsign that
     RESOLVES to anyone — by callsign OR by bare id (nameToId is id-tolerant), archived and
     the ALL / ALL AVAIL placeholders included — is refused, or the add would repoint
     ID_BY_CS and cross every row that stores that id;
   - personnel (ground crew) hold no CAT: pers:true and an empty q (26 Aug 26);
   - the record is the Quals add's, flight '-' until it is set on Quals.
   And the new rulings: D219 "Callsign/Name" (some people have no callsign — the one
   field is his puck's label), D220 "Pilot" / "WSO" / "Personnel (ground crew)", D222
   "Displayed callsign/name" on the sign-up card, D225 initials asked but never required,
   D226 the callsign/name stays at 14 letters and a longer one is REFUSED with its reason,
   never cut (the robustness doctrine: a refused value is never left looking saved).

   Writes: putNewPerson is the mutation alone and runs only INSIDE a command that enlisted
   the people store (the roster-only add below, or accounts.ts's person-and-account
   commands). It re-checks the problems there and refuses with CmdRefused — a silent,
   rolled-back refusal whose reason reaches the screen, never a thrown Error the command
   layer logs as a bug (Fable's plan read F3). The id is minted inside the command, so a
   rolled-back add leaves no id anywhere. */
import { PEOPLE, QCHIP, deriveQuals, indexCallsigns, callsignTakenBy } from '../engine/people'
import { newId } from '../engine/newid'
import { CmdRefused, isCommitting } from '../command'
import { mayManageRoster } from './perms'
import { commitPeopleIntent } from './people-settings-commit'

/* the ONE seat list every form reads (D220) — the stored value is the seat code */
export const SEATS: { v: 'FCP' | 'RCP' | 'GND'; l: string }[] = [
  { v: 'FCP', l: 'Pilot' },
  { v: 'RCP', l: 'WSO' },
  { v: 'GND', l: 'Personnel (ground crew)' },
]
export const seatLabel = (v: any): string => (SEATS.find(s => s.v === v)?.l ?? '')
/* the CATs a seat may hold — moved from the Quals page (its CAT box imports it back).
   Only a pilot and a WSO hold one: personnel, a blank seat and anything else get NONE
   (26 Aug 26). It used to treat every non-pilot as a WSO, so a CAT picked for a pilot
   rode through Personnel unseen and came back on WSO (Astra's code read #2) */
export const catsFor = (seat: any): string[] =>
  seat === 'FCP' ? Object.keys(QCHIP).filter(k => k !== 'IW')
    : seat === 'RCP' ? Object.keys(QCHIP).filter(k => k !== 'IP' && k !== 'IR')
      : []

/* the Quals boxes' limits: a callsign/name fits a puck; initials the Quals column */
export const MAX_CS = 14
export const MAX_INITIALS = 12
/* the D219 / D222 words, one constant each (a wording ruling gets ONE body — bug-check
   order §6), read by the sign-up, Admin → Users and the Quals head */
export const CALLSIGN_LABEL = 'Callsign/Name'
export const SIGNUP_CALLSIGN_LABEL = 'Displayed callsign/name'
export const CS_TOO_LONG = `A callsign or name is at most ${MAX_CS} letters — use a short form`

export interface NewPerson { cs: string; ini: string; seat: string; cat: string }
/* what a form typed, tidied the one way every door stores it */
export const tidyPerson = (np: NewPerson): NewPerson => ({
  cs: String(np.cs ?? '').trim(),
  ini: String(np.ini ?? '').trim().toUpperCase(),
  seat: String(np.seat ?? ''),
  cat: np.seat === 'GND' ? '' : String(np.cat ?? ''),
})

/* THE ONE CALLSIGN REFUSAL ([POST-OUT-OUTCOMES] — D226, D286, D295; Fable's plan read F11): every door that names a
   person asks it — the one add, approving, the Archived list's Rename, Restore's "give him another callsign". Blank and
   over 14 letters first (never cut — D226), then taken: by a man on the roster, a placeholder, or any person's id
   (engine/people.ts callsignTakenBy — PID-01). A callsign only an ARCHIVED man holds is free (D286), so it is never
   refused here; the approve note says who holds it (UsersPanel). `exceptId` — the man being renamed or restored. */
export function callsignProblem(csIn: any, exceptId?: string): string | null {
  const cs = String(csIn ?? '').trim()
  if (!cs) return 'Type the callsign or name'
  if (cs.length > MAX_CS) return CS_TOO_LONG                                           // D226
  if (callsignTakenBy(cs, exceptId)) return `${cs} is already taken — callsigns must be unique`
  return null
}

/* every refusal, in the app's words, first one found. `roster: false` — the sign-up: a
   person not yet let in may not read the roster (data-model §11: Person has no Pending
   read), so whether a callsign is taken is the admin's to see when he approves. */
export function newPersonProblem(npIn: NewPerson, opts: { roster?: boolean } = {}): string | null {
  const np = tidyPerson(npIn)
  if (!np.cs) return 'Type the callsign or name'
  if (np.cs.length > MAX_CS) return CS_TOO_LONG                                        // D226
  if (opts.roster !== false) {
    /* D286 (26 Sep 26): an archived man's callsign may go to a new person — the old
       "is archived — restore them on the Quals page instead" refusal gave way */
    const bad = callsignProblem(np.cs)
    if (bad) return bad
  }
  if (np.ini.length > MAX_INITIALS) return `Initials are at most ${MAX_INITIALS} letters`   // D225: blank is fine
  if (!SEATS.some(s => s.v === np.seat)) return 'Pick pilot, WSO or personnel'
  if (np.seat !== 'GND' && !catsFor(np.seat).includes(np.cat)) return 'Pick the CAT'
  return null
}

/* the mutation alone — INSIDE a command that enlisted the people store (see the header) */
export function putNewPerson(npIn: NewPerson): string {
  if (!isCommitting()) throw new Error('putNewPerson runs only inside a people command')
  const bad = newPersonProblem(npIn)
  if (bad) throw new CmdRefused(bad)
  const np = tidyPerson(npIn)
  const id = newId('p')
  ;(PEOPLE as any)[id] = np.seat === 'GND'
    ? { cs: np.cs, initials: np.ini, seat: 'GND', pers: true, q: '', flight: '-', remarks: '' }
    : { cs: np.cs, initials: np.ini, seat: np.seat, q: np.cat, flight: '-' }
  deriveQuals((PEOPLE as any)[id])
  indexCallsigns()
  return id
}

/* the command's outcome, in the app's words (the screen never shows the layer's own) */
export function saidOf(r: any): string | null {
  if (!r || r.ok !== false) return null
  if (r.reason === 'refused' && r.message) return String(r.message)
  if (r.reason === 'unauthorized') return 'You are not allowed to do that'
  return 'That did not save'
}

/* the admin's roster-only add — a blank sign-in on Admin → Users (D217) */
export function addRosterPerson(np: NewPerson): string | null {
  if (!mayManageRoster()) return 'Only an admin can add someone'
  const bad = newPersonProblem(np)
  if (bad) return bad
  return saidOf(commitPeopleIntent('person.add', null, () => { putNewPerson(np) }))
}
