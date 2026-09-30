/* A DELETE — a man who leaves flying for good ([POST-OUT-OUTCOMES], 27 Sep 26).

   Owner D287 (26 Sep 26), "I think B, truly delete him": his account AND his person go, from every list. D290 (27 Sep),
   "3. hidden mark": underneath, his row is KEPT, marked deleted and invisible everywhere — never erased (the data
   model's tombstone). D297 (27 Sep), "5. recommended yes": every day he already flew keeps his puck, published or not;
   days still to come lose him (on a published day that reads pending, as any change does). D299 (27 Sep), "yes approve":
   a delete takes him out of today and the future; the past keeps its record of him — the list in the approved mock-up's
   §5 (docs/mock/post-out.html). D298: the act is named "Delete".

   WHAT IT DOES, in ONE command over the people, settings, scheduler and week-stash stores (all or nothing — a refusal
   or a throw anywhere rolls every one back, command/commit.ts phase 6):
   1. marks him — `deleted`, `deletedFrom` (the cutoff), `archived` (so every roster filter that hides an archived man
      hides him with no change of its own), `archivedBy: 'del'` (never 'po', so the Post out's own undo never reads the
      delete's archive as its own — Fable F3) — and rebuilds the callsign index (his callsign is free — D297);
   2. removes his account (and a request waiting under its sign-in name) — accounts.ts dropAccountOfPid;
   3. takes him off every day ON OR AFTER THE CUTOFF: the week on screen (its seats, landed rows, sign-offs, parked plans
      and OIL-mode switches — worked out after the command, below; one change-history line per seat he held, as built),
      and the planning calendar's pucks (a GAP, never a splice). Every PUBLISHED version is a record and is
      never rewritten: on a published day to come the working copy then differs, so the day reads pending and its four
      fall (D45, D103, D297).
      SINCE [DB-READINESS] group A PHASE 6 (d) NO WEEK IS WRITTEN FOR IT (data-model.md §9 rule 9 — a delete never waits
      for a held day, D450): the loaded week's strip is in memory and in the undo records, and not saved (state/persist.ts
      DERIVED_DAY_TYPES); a saved week is NOT rewritten — every week, the loaded one on its next load included, reads
      without him from his cutoff (engine/overlay.ts overlayDeletedWeek, applied wherever a week's days come into
      memory); the day's holder saves it without him at his next change to it;
   4. deletes his inputs that start on or after the cutoff, and ends the day before it any that spans it (its "till"
      tail rewritten — the truth, D189; its documents stay stored — D299: how long medical records are kept is the
      organisation's rule, at the database step); a landed row on a day on or after the cutoff goes with it.
   Days BEFORE the cutoff are never touched. Taking a man off leaves no mark on the row (D91).

   THE CUTOFF — ONE clock (the plan's Round 2, Astra A2/round-2 1, Fable round-2 4): the later of the delete's own date
   and TODAY, and today is the CALENDAR date (localToday — the clock the Leave War and the posting pass already run on).
   So a day he already flew is never touched, and D299's "today and the future" includes today. (The scheduler draws its
   demo weeks around a notional today, ui/weeknav.ts TODAY — a delete made now leaves him on those July days, which are
   past by the calendar; on the owner's card, question 3.)

   THE PREFLIGHT (Astra A1): every stashed week with a day on or after the cutoff is read BEFORE the command; one that
   cannot be read, or is byte-preserved while holding him there, REFUSES the whole delete with its reason. Nothing is
   skipped silently.

   THE LEAVE WAR HALF (Part B): his war records from the cutoff go, his posting window closes the day before and he is
   marked `gone` (leavewar/sync.ts deletePersonOnWar — the seam); a deleted man earns no OIL from his cutoff and is read
   by date in the ALL AVAIL crowd (sync.ts creditable, availableFor). A posting's Delete runs the same mutation from the
   posting pass (sync.ts runPoOutcomes). */
import { PEOPLE, whoId, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { dayIso } from '../engine/verid'
import { slotVal, whoArr } from '../engine/slots'
import { logEdit } from '../engine/editlog'
import { SCHED } from '../engine/publish'
import { INPUTS, dateOrd, withRemarksTail, nowStamp } from '../engine/inputs'
import { ordShift, ordLabel } from '../engine/medical'
import { stashKeys, stashGet, stashWeekState } from '../engine/weekstash'
import { stripPersonFromDay, trimTail, overlayDeletedWeek, hisLanded } from '../engine/overlay'
import { validate } from '../engine/validate'
import { localToday } from '../leavewar/engine/period'
import { PLANPUCKS } from './plan'
import { commit, CmdRefused, isCommitting } from '../command'
import { peopleStore, settingsStore, finishPeopleWrite } from './people-settings-commit'
import { schedStore, schedApplyEnd, resyncSchedBaseline } from './sched-commit'
import { mayDeletePerson } from './perms'
import { deleteAccountProblem, dropAccountOfPid, accountsAfter } from './accounts'
import { saidOf } from './roster-add'
import { deletePersonOnWar, warIdentityIfHidden } from '../leavewar/sync'
import { HOOKS } from '../engine/hooks'
import { deferEffect as cmdDeferEffect } from '../command'

/* ---- the one clock and the cutoff ---- */
export const effectiveToday = (): string => localToday()
const ISO = /^\d{4}-\d{2}-\d{2}$/
export function deleteCutoff(dateIso?: string | null): string {
  const t = effectiveToday()
  const d = dateIso && ISO.test(String(dateIso)) ? String(dateIso) : t
  return d > t ? d : t
}
const isoOrd = (iso: string): number => +iso.replace(/-/g, '')
const ordIso = (o: number): string => `${Math.floor(o / 10000)}-${String(Math.floor(o / 100) % 100).padStart(2, '0')}-${String(o % 100).padStart(2, '0')}`

/* ---- where he sits on a LIVE day: every slot key that holds his id (the funnel's key grammar, engine/slots.ts).
   The roll-call of slot kinds (bug-check order §6) — each tested by name in person-delete.test.ts: a flying seat, a
   desk's holder and its extras, a sim's seats, passengers and extras, a ground row's name and extras (a row that came
   from an input goes with its input, never by its name), a Common Programme name and its extras. ---- */
export function personKeysOnDay(di: number, id: string): string[] {
  const d: any = (DAYS as any)[di]; const out: string[] = []
  if (!d || !id) return out
  ;(d.waves || []).forEach((w: any, gi: number) => (w && w.formations || []).forEach((f: any, li: number) =>
    (f && f.aircraft || []).forEach((a: any, ai: number) => { for (const seat of ['p', 'w']) if (a && a[seat] === id) out.push(`${di}.${gi}.${li}.${ai}.${seat}`) })))
  ;(d.dutywaves || []).forEach((dw: any, dwi: number) => (dw && dw.rows || []).forEach((r: any, ri: number) => {
    if (!r) return
    if (r.id === id) out.push(`d:${di}.${dwi}.${ri}`)
    ;(r.more || []).forEach((v: any, n: number) => { if (v === id) out.push(`d:${di}.${dwi}.${ri}.x${n}`) })
  }))
  Object.keys(d.sims || {}).forEach(kind => ((d.sims || {})[kind] || []).forEach((r: any, ri: number) => {
    if (!r) return
    if (Array.isArray(r.pax)) r.pax.forEach((v: any, n: number) => { if (v === id) out.push(`s:${di}.${kind}.${ri}.pax.${n}`) })
    for (const seat of ['p', 'w']) if (r[seat] === id) out.push(`s:${di}.${kind}.${ri}.${seat}`)
    ;(r.more || []).forEach((v: any, n: number) => { if (v === id) out.push(`s:${di}.${kind}.${ri}.x${n}`) })
  }))
  ;(d.ground || []).forEach((r: any, ri: number) => {
    if (!r) return
    if (!r.src && whoId(r.who) === id) out.push(`g:${di}.${ri}`)
    ;(r.more || []).forEach((v: any, n: number) => { if (v === id) out.push(`g:${di}.${ri}.x${n}`) })
  })
  ;(d.allhands || []).forEach((r: any, ri: number) => {
    if (!r) return
    whoArr(r).forEach((v: any, n: number) => { if (whoId(v) === id) out.push(`a:${di}.${ri}.${n}`) })
    ;(r.more || []).forEach((v: any, n: number) => { if (v === id) out.push(`a:${di}.${ri}.x${n}`) })
  })
  return out
}

/* ---- the same, on a day OBJECT that is not the loaded week (a parked plan, a day read from storage): stripPersonFromDay,
   stripOilSwitches, stripSign and trimTail moved, unchanged, to engine/overlay.ts ([DB-READINESS] group A, phase 6 (d)) —
   the read-time overlay that takes a deleted man off every day from his cutoff lives in the engine, which may not import
   state/. Re-exported here for the callers that knew them here. ---- */
export { stripPersonFromDay }

/* ---- the refusals, in the app's words, first one found ---- */
/* THE LOAD BELT (the plan's Round 2 — D297): a version loaded onto the working copy or a saved plan switched in is a
   whole-day replacement; on a day FROM a deleted man's cutoff it never brings him back. Strips every such man from the
   incoming day model `nd` (every kind of slot, his landed rows, his OIL switches — stripPersonFromDay) and returns their
   callsigns for the door's message. Installed on the engine's hook below (engine/drafts.ts calls it). */
export function stripDeletedFromDay(di: number, nd: any): string[] {
  if (!nd) return []
  const iso = dayIso(CURWEEK, +di)
  const out: string[] = []
  for (const id of Object.keys(PEOPLE)) {
    const p: any = (PEOPLE as any)[id]
    if (!p || !p.deleted || iso < String(p.deletedFrom || '')) continue
    /* his landed rows: a row landed from one of HIS requests — decided by the request's CURRENT holder, never the name
       the version's row carries (the one rule every read uses, engine/overlay.ts hisLanded — Fable's round-2 read of the
       phase-6 plan, F1: a request handed on since the version was issued is its new holder's row, and a version load
       must not take it with a deleted former holder) */
    if (stripPersonFromDay(nd, id, hisLanded(nd, id))) out.push(String(p.cs))
  }
  return out
}
HOOKS.stripDeleted = stripDeletedFromDay

export function deleteProblem(id: string): string | null {
  const p = (PEOPLE as any)[id]
  if (!p || p.special) return 'That is not a person'
  if (p.deleted) return `${p.cs} is already deleted`
  return deleteAccountProblem(id)
}
/* every stashed week (not the loaded one) with a day on or after the cutoff, read first: a week that cannot be read — or
   a byte-preserved one that holds him on such a day — refuses the whole delete (Astra A1). null = all clear. */
export function stashPreflight(id: string, cutoff: string): string | null {
  for (const v of stashKeys()) {
    if (v === CURWEEK) continue
    if (dayIso(v, 6) < cutoff) continue                         // the whole week is before the cutoff — untouched
    const st = stashWeekState(v)
    if (st === 'ok') continue
    if (st === 'unreadable') return `The week of ${v} can't be read — the delete was not made`
    /* preserved: refused only if he is on it on or after the cutoff */
    try {
      const p = JSON.parse(stashGet(v) || '{}'); const days = Array.isArray(p.d) ? p.d : []
      for (let di = 0; di < days.length; di++) if (dayIso(v, di) >= cutoff && JSON.stringify(days[di] || {}).includes(`"${id}"`))
        return `The week of ${v} can't be changed — the delete was not made`
    } catch (_e) { return `The week of ${v} can't be read — the delete was not made` }
  }
  return null
}

/* ---- THE MUTATION — inside a command that enlisted the people, settings, scheduler and week-stash stores ---- */
export function applyDelete(id: string, cutoff: string): void {
  /* only inside a command — its writes (the mark, the account, the inputs) have no other rollback (Fable's code read 5) */
  if (!isCommitting()) throw new Error('applyDelete runs only inside a command')
  const p = (PEOPLE as any)[id]
  if (!p || p.special || p.deleted) return
  /* the stored weeks, asked again INSIDE the command (every door asks before it; this catches a week that became
     unreadable in between): refused, the whole command rolls back — never a delete with a week still holding him
     (Astra's code read 1, 27 Sep 26) */
  const pre = stashPreflight(id, cutoff)
  if (pre) throw new CmdRefused(pre)
  const cut = isoOrd(cutoff)
  /* 1. the mark (and the callsign index follows — his callsign is free) */
  Object.assign(p, { deleted: true, deletedFrom: cutoff, archived: true, archivedBy: 'del' })
  indexCallsigns()
  /* 2. his account */
  dropAccountOfPid(id)
  /* 4a. his inputs — which go, which end the day before (decided before anything moves: a landed row is found by the
     input's own id, `src`) */
  const mine = INPUTS.filter((r: any) => r && r.person === id)
  const gone: any[] = [], ended: any[] = []
  for (const r of mine) {
    const a = dateOrd(r.date, r.yr); if (a == null) continue
    const b = r.endDate ? dateOrd(r.endDate, r.yr) : a
    if (a >= cut) gone.push(r)
    else if (b != null && b >= cut) ended.push(r)
  }
  /* 3. the loaded week, from the cutoff. NOT CHANGED INSIDE THE COMMAND ([DB-READINESS] group A, phase 6 (d) —
     data-model.md §9 rule 9; D450): in the database a day is saved only by the scheduler holding it, and a delete (or the
     posting pass that runs one, which can join another person's command) must never write — or wait for — a day. So the
     command changes his own records alone; the week on screen is worked out AFTER it (the deferred effect below: the same
     read-time overlay every week gets as it comes into memory — engine/overlay.ts), with the command layer's baseline
     moved on, so it is nobody's change and nothing saves it until the day's holder next changes that day. What the
     command DOES keep, as built (D337 — "everything the delete took away, one line each"): one change-history line per
     seat he held on the week on screen, the same line the funnel wrote when the delete emptied it. A landed row of a
     request that SPANS the cutoff leaves the day to come with the overlay; the kept part stays accepted — its filing is
     never parked "taken off" (Fable's code read 1, 27 Sep 26). */
  for (let di = 0; di < DAYS.length; di++) {
    if (dayIso(CURWEEK, di) < cutoff) continue
    for (const k of personKeysOnDay(di, id)) logEdit(k, slotVal(k), '')
  }
  cmdDeferEffect(() => {
    overlayDeletedWeek(String(CURWEEK), DAYS, { sign: SCHED.sign, signBind: SCHED.signBind, drafts: SCHED.drafts })
    resyncSchedBaseline()
    validate()
  })
  /* 4b. then the inputs themselves */
  for (const r of gone) { const ix = INPUTS.indexOf(r); if (ix >= 0) INPUTS.splice(ix, 1) }
  for (const r of ended) {
    const a = dateOrd(r.date, r.yr) as number
    const end = ordShift(cut, -1) as number
    if (end <= a) delete r.endDate
    else r.endDate = ordLabel(end, r.yr)
    r.remarks = withRemarksTail(r.remarks, ordIso(a), ordIso(end), 'till')
    r.mod = nowStamp()
  }
  /* 3b. every saved week — NOT rewritten since phase 6 (d): each reads without him from his cutoff when its days come
     into memory (engine/overlay.ts). */
  /* 3c. the planning calendar's pucks — a gap, never a splice (the surviving pucks keep their places) */
  for (const e of PLANPUCKS) {
    /* the row's day is its `date` (state/plan.ts) — this read `iso`, a field no calendar row carries, so a delete never took
       him off one ([DB-READINESS] group A, phase 2: found moving the calendar to one row each) */
    if (!e || e.kind !== 'pucks' || !Array.isArray(e.ids) || String(e.date || '') < cutoff) continue
    const ix = e.ids.indexOf(id)
    if (ix >= 0) { e.ids[ix] = ''; trimTail(e.ids) }
  }
  validate()
}

/* ---- UNDO AND REDO NEVER PUT HIM BACK (the plan's Round 1 and 2 — Fable F2, Astra A1 / round-2 2) ----
   A restore image that would put a DELETED man on a day (or its sign-offs, a parked plan, a stored week, an input, the
   planning calendar) ON OR AFTER his cutoff is refused — "Hex has been deleted — that change can't be undone" — never
   repaired silently. The undo timeline asks it when it CHOOSES the next step (undo/timeline.ts — a refused step is
   passed over, so the button never stalls behind it; it still guards older steps that share its records) and again just
   before it restores. The record names are the command layer's (state/sched-commit.ts decompose): `days` `<wk>#<di>`,
   `sched.book` `<wk>#<di>` (that day's `sg` sign-offs and `dr` parked plans), `inputs` `<iid>`, `plan` `pp:<id>`, `weekstash`
   `<wk>#<di>` (a saved week's day row — state/weekrows.ts; its other rows name no day he could be put back on). */
const holds = (v: any, id: string): boolean => { try { return JSON.stringify(v ?? null).includes(`"${id}"`) } catch (_e) { return false } }
export function deletedRestoreProblem(changes: any[]): string | null {
  const gone = Object.keys(PEOPLE).filter(id => (PEOPLE as any)[id] && (PEOPLE as any)[id].deleted)
  if (!gone.length) return null
  /* the accounts the step would leave — one row per account since [DB-READINESS] group A, phase 4.4: an account row put
     back that is his, or a step leaving NO account row, which the loader reads as the seeded list (accounts.ts
     accountsAfter; Fable's final read, F5) — would bring his sign-in back */
  const accts = accountsAfter(changes)
  if (accts) for (const id of gone) if (accts.some((a: any) => a && a.pid === id)) return `${(PEOPLE as any)[id].cs} has been deleted — that change can't be undone`
  for (const ch of changes || []) {
    if (!ch || ch.op !== 'put') continue
    const v = ch.after, rid = String(ch.id || '')
    for (const id of gone) {
      const cut = String((PEOPLE as any)[id].deletedFrom || '')
      let hit = false
      if (ch.collection === 'days') { const [wk, di] = rid.split('#'); hit = !!wk && dayIso(wk, +di) >= cut && holds(v, id) }
      else if (ch.collection === 'sched.book') { const [wk, di] = rid.split('#'); hit = !!wk && di != null && dayIso(wk, +di) >= cut && (holds(v && v.sg, id) || holds(v && v.dr, id)) }
      else if (ch.collection === 'weekstash') {
        const [wk, di] = rid.split('#')
        if (wk && di != null && /^[0-6]$/.test(di)) { try { const row = typeof v === 'string' ? JSON.parse(v) : v; hit = dayIso(wk, +di) >= cut && (holds(row && row.d, id) || holds(row && row.sg, id) || holds(row && row.dr, id)) } catch (_e) { hit = false } }
      }
      else if (ch.collection === 'inputs') { const a = v && v.person === id ? dateOrd(v.date, v.yr) : null; hit = a != null && a >= isoOrd(cut) }
      /* one calendar row per record since phase 2 (`plan/pp:<id>`); its day is its `date` */
      else if (ch.collection === 'plan') hit = !!v && v.kind === 'pucks' && String(v.date || '') >= cut && Array.isArray(v.ids) && v.ids.includes(id)
      /* B4 of the change-recording re-test (28 Sep 26): once the one Undo takes roster and settings steps, HIS OWN RECORD
         put back un-deleted, or an accounts list that still holds his account, would bring him back whole (D287 — a
         delete is final; a man the war does not hold leaves no posting record to keep the step dead — Fable's red team 10) */
      else if (ch.collection === 'people') hit = rid === id && !!v && !v.deleted
      if (hit) return `${(PEOPLE as any)[id].cs} has been deleted — that change can't be undone`
    }
  }
  return null
}

/* ---- THE DOOR — the admin's delete (Admin → Users' "Delete account", its second tap) ----
   A string back is the refusal, said on screen; null = done. `dateIso` — the delete's own date (a posting's; blank =
   today); the cutoff is the later of it and today. */
export function deletePerson(id: string, dateIso?: string | null): string | null {
  if (!mayDeletePerson()) return 'Only an admin can delete someone'
  const bad = deleteProblem(id)
  if (bad) return bad
  const cutoff = deleteCutoff(dateIso)
  const pre = stashPreflight(id, cutoff)
  if (pre) return pre
  return saidOf(commit({
    type: 'person.delete', scope: { module: 'people' }, meta: null,
    apply: (txn: any) => {
      /* the baseline to LIVE before enlisting (the input batch's own rule, sched-commit.ts commitInputsWith) */
      resyncSchedBaseline()
      txn.enlist(peopleStore); txn.enlist(settingsStore); txn.enlist(schedStore)   // no saved week is written (phase 6 (d))
      /* a man the war does not show (a SANS man with Show SANS off) is caught as the war would draw him BEFORE the mark
         takes him off every projection — so the months he was here keep his row (D299; Astra 3, Fable 3) */
      const frozen = warIdentityIfHidden(id)
      applyDelete(id, cutoff)
      /* the war half — his records from the cutoff, his window closed, `gone` (through the sync, the one seam) */
      deletePersonOnWar(txn, id, cutoff, frozen)
      finishPeopleWrite()
      schedApplyEnd()
      /* …and the schedule's own save step, as every schedule command ends (sched-commit.ts): validate + persist the
         live week at the transaction boundary. Without it the loaded week's emptied days were never filed — a reload
         put him back on every day to come of the week on screen (found by the walk, 27 Sep 26) */
      cmdDeferEffect(() => { HOOKS.reflow(); HOOKS.histPush() })
    },
  }))
}
