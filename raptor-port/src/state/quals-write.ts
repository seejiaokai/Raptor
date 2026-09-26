/* THE QUALS PAGE'S ONE WRITE FUNCTION ([ACCOUNTS] / D149, 26 Sep 26).

   Owner, D149 (24 Sep 26): "actually i want members to automatically update their
   qualifications, so member can only edit their own row and SXO and scheduler also does
   no harm. so they can edit anything in their own row." — a member edits HIS OWN row,
   every column of it (callsign, CAT, initials, flight, remarks, SXO, SCHEDULER, SANS and
   every qualification); an admin edits any row. Adding, archiving and restoring a person,
   and the LoX column list, stay the admin's.

   The page used to change PEOPLE in place inside its click and change handlers and then
   persist, with no own-row check anywhere (the gate was only "Enable editing"). Now every
   row edit is ONE CLOSED OPERATION through here (Astra R2-4 / R2-6, Fable R2-5):
   1. the permission is asked FIRST — perms.ts mayEditQualsOf; refused, nothing moves;
   2. the change, its derived fields (deriveQuals; the SANS / SXO wiring; the DAAR→NAAR
      and SC DAY→SC NIGHT cascades) and the re-validation run inside ONE people command
      that names its row (meta.owner) — the command gate checks the owner again, and the
      commit gate's ownership invariant (perms.ts ownershipViolation) rolls back any
      command in which a member changed a row other than his own;
   3. a callsign goes through renameCallsign (the uniqueness rule and the callsign index —
      Astra R3-5), never a bare assignment.
   The behaviour of each op is moved unchanged from QualsPage.tsx (its toasts included). */
import { PEOPLE, deriveQuals, isInstrPilot } from '../engine/people'
import { renameCallsign } from '../engine/slots'
import { validate } from '../engine/validate'
import { HOOKS } from '../engine/hooks'
import { mayEditQualsOf, mayRenameCallsign } from './perms'
import { commitPeopleEdit } from './people-settings-commit'

export type QualsOp =
  | { tick: string }
  | { cat: string }
  | { initials: string }
  | { flight: string }
  | { remarks: string }
  | { callsign: string }

const AAR_I_KEYS = ['daar', 'naar']
/* the AAR instructor rung (owner, 10 Aug 26): blank → ✓ → I → blank on an instructor
   pilot's DAAR / NAAR — offered only where legal, so the cycle never strands */
export const qualI = (p: any, k: string) => !!(p && AAR_I_KEYS.indexOf(k) >= 0 && p.seat === 'FCP' && isInstrPilot(p.q))

export const OWN_ROW_ONLY = 'You can only edit your own row'
export const RENAME_ADMIN_ONLY = 'Only an admin can change a callsign'

/* returns null when done, or the refusal (already toasted) */
export function updatePersonField(pid: string, op: QualsOp): string | null {
  const p = (PEOPLE as any)[pid]
  if (!p) return 'That person is not on the roster'
  if (!mayEditQualsOf(pid)) { HOOKS.toast(OWN_ROW_ONLY, 'warn'); return OWN_ROW_ONLY }
  if ('callsign' in op && !mayRenameCallsign()) { HOOKS.toast(RENAME_ADMIN_ONLY, 'warn'); return RENAME_ADMIN_ONLY }   // D218
  let refused: string | null = null
  const r: any = commitPeopleEdit(() => {
    if ('tick' in op) {
      const k = op.tick
      const cur = p.quals[k]
      const canI = qualI(p, k) && (k === 'daar' || p.quals.daar === 'I')
      const next = canI ? (!cur ? true : cur === true ? 'I' : false) : !cur
      /* night AAR is signed off after day AAR, never before it */
      if (k === 'naar' && next && !p.quals.daar) { refused = `${p.cs} needs DAAR before NAAR can be ticked`; return }
      /* and say WHY the I was not offered — the click still unticks */
      if (k === 'naar' && qualI(p, k) && cur === true && p.quals.daar !== 'I') HOOKS.toast(`${p.cs} needs the DAAR instructor mark before NAAR can carry it — the tick comes off instead`)
      /* SC night is signed off after SC day, exactly as NAAR is after DAAR */
      if (k === 'scNight' && next && !p.quals.scDay) { refused = `${p.cs} needs SC DAY before SC NIGHT can be ticked`; return }
      p.quals[k] = next
      /* SANS and SXO are read off the RAW flags (deriveQuals copies one way) — wire the
         tick through (15 Aug / 18 Aug 26) */
      if (k === 'san') { p.san = !!next; if (next) p.sanQ = p.sanQ || { flown: 0, carry: 0, missedQtrs: 0 } }
      if (k === 'sxo') p.sxo = !!next
      if (k === 'daar' && !next && p.quals.naar) { p.quals.naar = false; HOOKS.toast(`${p.cs} — NAAR removed too, it cannot stand without DAAR`) }
      if (k === 'daar' && next === true && p.quals.naar === 'I') { p.quals.naar = true; HOOKS.toast(`${p.cs} — NAAR instructor mark removed too, it cannot stand without DAAR's`) }
      if (k === 'scDay' && !next && p.quals.scNight) { p.quals.scNight = false; HOOKS.toast(`${p.cs} — SC NIGHT removed too, it cannot stand without SC DAY`) }
      validate()
    } else if ('cat' in op) {
      p.q = op.cat; deriveQuals(p); validate()
    } else if ('initials' in op) {
      p.initials = String(op.initials).trim().toUpperCase()
    } else if ('flight' in op) {
      p.flight = String(op.flight).trim().toUpperCase()
    } else if ('remarks' in op) {
      p.remarks = String(op.remarks).trim()
    } else if ('callsign' in op) {
      const was = p.cs, want = String(op.callsign).trim()
      if (!renameCallsign(pid, want)) { refused = want && want !== was ? `${want} is already taken — callsigns must be unique` : ''; return }
      validate()
    }
  }, { owner: pid })
  if (refused != null) { if (refused) HOOKS.toast(refused); return refused || 'unchanged' }
  if (r && r.ok === false) {
    /* "your own row" only when that IS the reason — the gate, or the one-person-writes-
       his-own check; any other rollback says plainly that it did not save (Fable's
       scenario read, 26 Sep 26: an admin's edit refused for another reason was told
       "You can only edit your own row") */
    const own = r.reason === 'unauthorized' || (r.reason === 'invalid' && /^member-writes-own:/.test(String(r.message || '')))
    const msg = own ? OWN_ROW_ONLY : 'That did not save'
    HOOKS.toast(msg, 'warn')
    return msg
  }
  return null
}
