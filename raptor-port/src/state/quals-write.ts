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
import { PEOPLE, deriveQuals, isInstrPilot, sansStart, sansStop } from '../engine/people'
import { renameCallsign } from '../engine/slots'
import { validate } from '../engine/validate'
import { HOOKS } from '../engine/hooks'
import { mayEditQualsOf, mayRenameCallsign, mayTickManagement, mayTickScheduler } from './perms'
import { MGMT_KEY, SCHED_KEY } from '../engine/qualcols'
import { commitPeopleEdit } from './people-settings-commit'
import { otherSquadronPersonProblem, masterChangeProblem } from './accounts'
import { homeOn, todayIso } from './units'

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
export const MGMT_ADMIN_ONLY = 'Only an admin can tick Management'
export const SCHED_ADMIN_ONLY = 'Only an admin can appoint a scheduler'

/* returns null when done, or the refusal (already toasted) */
export function updatePersonField(pid: string, op: QualsOp): string | null {
  const p = (PEOPLE as any)[pid]
  if (!p) return 'That person is not on the roster'
  /* an admin on another squadron's man is told whose he is, never "your own row" (the fix read, 18 Nov 26 — Opus 4) */
  const other = otherSquadronPersonProblem(pid)
  if (other) { HOOKS.toast(other, 'warn'); return other }
  if (!mayEditQualsOf(pid)) { HOOKS.toast(OWN_ROW_ONLY, 'warn'); return OWN_ROW_ONLY }
  if ('callsign' in op && !mayRenameCallsign()) { HOOKS.toast(RENAME_ADMIN_ONLY, 'warn'); return RENAME_ADMIN_ONLY }   // D218
  /* a master's callsign is his account's name on every line: a master's alone (D2205, Fable's plan H4) */
  if ('callsign' in op) { const m = masterChangeProblem(pid); if (m) { HOOKS.toast(m, 'warn'); return m } }
  if ('tick' in op && op.tick === MGMT_KEY && !mayTickManagement()) { HOOKS.toast(MGMT_ADMIN_ONLY, 'warn'); return MGMT_ADMIN_ONLY }   // D1510
  if ('tick' in op && op.tick === SCHED_KEY && !mayTickScheduler()) { HOOKS.toast(SCHED_ADMIN_ONLY, 'warn'); return SCHED_ADMIN_ONLY }   // D1651
  let refused: string | null = null
  const r: any = commitPeopleEdit(() => {
    if ('tick' in op) {
      const k = op.tick
      const cur = p.quals[k]
      const canI = qualI(p, k) && (k === 'daar' || p.quals.daar === 'I')
      const next = canI ? (!cur ? true : cur === true ? 'I' : false) : !cur
      /* night AAR is signed off after day AAR, never before it */
      if (k === 'naar' && next && !p.quals.daar) { refused = `${p.cs} needs DAAR before NAAR can be ticked`; return }
      /* and say WHY the I was not offered — the click still unticks (the words: owner D838 + D839, 14 Oct 26 — N28;
         "carry it … the tick" left a reader unable to tell what "it" was, or which tick) */
      if (k === 'naar' && qualI(p, k) && cur === true && p.quals.daar !== 'I') HOOKS.toast(`${p.cs} needs the DAAR instructor mark before NAAR can carry one, so the NAAR tick comes off instead`)
      /* SC night is signed off after SC day, exactly as NAAR is after DAAR */
      if (k === 'scNight' && next && !p.quals.scDay) { refused = `${p.cs} needs SC DAY before SC NIGHT can be ticked`; return }
      p.quals[k] = next
      /* SANS and SXO are read off the RAW flags (deriveQuals copies one way) — wire the
         tick through (15 Aug / 18 Aug 26) */
      /* a hand SANS tick is the admin's own: it drops the posting's mark (`sanBy: 'po'`), so no take-back of a SANS
         posting ever undoes it ([POST-OUT-OUTCOMES], the plan's Round 1, Astra A5 — found missing by Fable's scenarios) */
      /* …AND IT COUNTS FROM THE DAY IT IS MADE (owner D2313, 22 Nov 26): the days before a tick put on stay a regular's,
         the days before one taken off stay SANS — so a published day's ALL AVAIL crowd, its sign-offs and its OIL are not
         moved by a tick made later (engine/people.ts sansOn). Put back on a man a SANS posting made SANS, the posting's
         days are still his — the untick kept them as an ended stretch (D2313 (b)) — and the re-tick counts from its own
         day like any other: handed the posting's date instead, it folded every regular day since the untick back into
         his SANS, and a day published in that gap read pending (the blind Opus read, 22 Nov 26, #1). */
      if (k === 'san') {
        if (next) sansStart(p, todayIso()); else sansStop(p, todayIso())
        delete p.sanBy
      }
      if (k === 'sxo') p.sxo = !!next
      /* the Scheduler tick is kept with the squadron and day it was given in (core line 4, 22 Nov 26 — his D2160: the
         tick ends in the old squadron on a move's date, so the squadron he joins ticks him anew —
         units-model.ts schedTickHolds reads the record; unticked, it goes) */
      if (k === SCHED_KEY) {
        const today = todayIso(), home = next ? homeOn(pid, today) : null
        if (home) { p.schedOf = home; p.schedFrom = today } else { delete p.schedOf; delete p.schedFrom }
      }
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
