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
   3. takes him off every day ON OR AFTER THE CUTOFF, in every place a working day lives: the loaded week (through the
      funnel — setSlotVal / unacceptInput / setSign, so the edit log and the pending marks follow as for any edit), every
      stashed week (its days, its sign boxes and their bindings, its parked plans — engine/weekstash.ts stashEditWeek),
      the loaded week's parked plans, the OIL-mode switches naming him, and the planning calendar's pucks (a GAP, never a
      splice). Every PUBLISHED version is a record and is never rewritten: on a published day to come the working copy
      then differs, so the day reads pending and its four fall (D45, D103, D297);
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
import { setSlotVal, whoArr, unacceptInput } from '../engine/slots'
import { SCHED, setSign } from '../engine/publish'
import { INPUTS, dateOrd, withRemarksTail, nowStamp, inpId } from '../engine/inputs'
import { ordShift, ordLabel } from '../engine/medical'
import { stashKeys, stashGet, stashEditWeek, stashWeekState } from '../engine/weekstash'
import { validate } from '../engine/validate'
import { localToday } from '../leavewar/engine/period'
import { PLANPUCKS } from './plan'
import { commit } from '../command'
import { peopleStore, settingsStore, finishPeopleWrite } from './people-settings-commit'
import { schedStore, schedApplyEnd, resyncSchedBaseline } from './sched-commit'
import { weekstashStore } from './store'
import { mayDeletePerson } from './perms'
import { deleteAccountProblem, dropAccountOfPid } from './accounts'
import { saidOf } from './roster-add'
import { deletePersonOnWar } from '../leavewar/sync'

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
const ROLES = ['cur', 'sked', 'plan', 'appr'] as const

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

/* ---- the same, on a day OBJECT that is not the loaded week (a stashed day, a parked plan): blanked in place, holding
   every index as the funnel does (a list keeps its positions; only trailing blanks are trimmed), and a ground row that
   came from one of `srcs` (his inputs) removed with it. Returns true if anything changed. ---- */
const trimTail = (arr: any[]) => { while (arr.length && !arr[arr.length - 1]) arr.pop() }
export function stripPersonFromDay(d: any, id: string, srcs: Set<string>): boolean {
  if (!d || !id) return false
  let changed = false
  const blankList = (arr: any, match: (v: any) => boolean) => {
    if (!Array.isArray(arr)) return
    arr.forEach((v: any, n: number) => { if (match(v)) { arr[n] = ''; changed = true } })
    trimTail(arr)
  }
  const isHim = (v: any) => v === id
  ;(d.waves || []).forEach((w: any) => (w && w.formations || []).forEach((f: any) => (f && f.aircraft || []).forEach((a: any) => {
    for (const seat of ['p', 'w']) if (a && a[seat] === id) { a[seat] = ''; changed = true }
  })))
  ;(d.dutywaves || []).forEach((dw: any) => (dw && dw.rows || []).forEach((r: any) => {
    if (!r) return
    if (r.id === id) { r.id = ''; changed = true }
    blankList(r.more, isHim)
  }))
  Object.keys(d.sims || {}).forEach(kind => ((d.sims || {})[kind] || []).forEach((r: any) => {
    if (!r) return
    blankList(r.pax, isHim)
    for (const seat of ['p', 'w']) if (r[seat] === id) { r[seat] = ''; changed = true }
    blankList(r.more, isHim)
  }))
  if (Array.isArray(d.ground)) {
    const keep = d.ground.filter((r: any) => !(r && r.src && srcs.has(String(r.src))))
    if (keep.length !== d.ground.length) { d.ground = keep; changed = true }
    d.ground.forEach((r: any) => {
      if (!r) return
      if (!r.src && whoId(r.who) === id) { r.who = ''; changed = true }
      blankList(r.more, isHim)
    })
  }
  ;(d.allhands || []).forEach((r: any) => {
    if (!r) return
    const arr = whoArr(r); let hit = false
    arr.forEach((v: any, n: number) => { if (whoId(v) === id) { arr[n] = ''; hit = true } })
    if (hit) { trimTail(arr); r.who = arr.length > 1 ? arr : (arr[0] || ''); changed = true }
    blankList(r.more, isHim)
  })
  if (stripOilSwitches(d, id)) changed = true
  return changed
}
/* the OIL mode's per-man switches on a day (`oild.people`, keyed `<id>|<item>` — engine/oilev.ts) */
function stripOilSwitches(d: any, id: string): boolean {
  const pp = d && d.oild && d.oild.people
  if (!pp || typeof pp !== 'object') return false
  let changed = false
  for (const k of Object.keys(pp)) if (k.startsWith(`${id}|`)) { delete pp[k]; changed = true }
  return changed
}
/* a sign-off record ({cur, sked, plan, appr}) and its bindings: his name cleared, its binding with it */
function stripSign(sign: any, bind: any, id: string): boolean {
  if (!sign || typeof sign !== 'object') return false
  let changed = false
  for (const r of ROLES) if (sign[r] === id) { sign[r] = ''; if (bind && typeof bind === 'object') delete bind[r]; changed = true }
  return changed
}

/* ---- the refusals, in the app's words, first one found ---- */
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
  const p = (PEOPLE as any)[id]
  if (!p || p.special || p.deleted) return
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
  const srcs = new Set<string>([...gone, ...ended].map(r => String(inpId(r))))
  const bySrc = new Map<string, any>([...gone, ...ended].map(r => [String(inpId(r)), r]))
  /* 3. the loaded week, day by day from the cutoff, through the funnel */
  for (let di = 0; di < DAYS.length; di++) {
    if (dayIso(CURWEEK, di) < cutoff) continue
    const d: any = (DAYS as any)[di]; if (!d) continue
    /* a row that came from one of those inputs goes with it (the input's own un-landing) */
    for (const r of [...(d.ground || [])]) if (r && r.src && bySrc.has(String(r.src))) unacceptInput(di, bySrc.get(String(r.src)))
    for (const k of personKeysOnDay(di, id)) setSlotVal(k, '')
    for (const role of ROLES) if (((SCHED.sign || {})[di] || {})[role] === id) setSign(di, role, '')
    stripOilSwitches(d, id)
    for (const t of ((SCHED.drafts || {})[di] || [])) if (t) { stripPersonFromDay(t.d, id, srcs); stripSign(t.sign, t.signBind, id) }
  }
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
  /* 3b. every stashed week (never the loaded one — its live days are authoritative, weekstashStore's C7) */
  for (const v of stashKeys()) {
    if (v === CURWEEK || dayIso(v, 6) < cutoff) continue
    stashEditWeek(v, (blob: any) => {
      let changed = false
      const days = blob.d as any[]
      for (let di = 0; di < days.length; di++) {
        if (dayIso(v, di) < cutoff) continue
        if (stripPersonFromDay(days[di], id, srcs)) changed = true
        if (stripSign(blob.sg && blob.sg[di], blob.sb && blob.sb[di], id)) changed = true
        for (const t of ((blob.dr || {})[di] || [])) if (t) {
          if (stripPersonFromDay(t.d, id, srcs)) changed = true
          if (stripSign(t.sign, t.signBind, id)) changed = true
        }
      }
      return changed
    })
  }
  /* 3c. the planning calendar's pucks — a gap, never a splice (the surviving pucks keep their places) */
  for (const e of PLANPUCKS) {
    if (!e || e.kind !== 'pucks' || !Array.isArray(e.ids) || String(e.iso || '') < cutoff) continue
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
   `sched.book` `<wk>` (its `sg` sign-offs and `dr` parked plans), `inputs` `<iid>`, `plan` `all`, `weekstash` `<wk>`. */
const holds = (v: any, id: string): boolean => { try { return JSON.stringify(v ?? null).includes(`"${id}"`) } catch (_e) { return false } }
function weekHolds(wk: string, blob: any, id: string, cut: string): boolean {
  if (!blob || typeof blob !== 'object') return false
  const days = Array.isArray(blob.d) ? blob.d : []
  for (let di = 0; di < days.length; di++) if (dayIso(wk, di) >= cut && holds(days[di], id)) return true
  for (const di of Object.keys(blob.sg || {})) if (dayIso(wk, +di) >= cut && holds(blob.sg[di], id)) return true
  for (const di of Object.keys(blob.dr || {})) if (dayIso(wk, +di) >= cut && holds(blob.dr[di], id)) return true
  return false
}
export function deletedRestoreProblem(changes: any[]): string | null {
  const gone = Object.keys(PEOPLE).filter(id => (PEOPLE as any)[id] && (PEOPLE as any)[id].deleted)
  if (!gone.length) return null
  for (const ch of changes || []) {
    if (!ch || ch.op !== 'put') continue
    const v = ch.after, rid = String(ch.id || '')
    for (const id of gone) {
      const cut = String((PEOPLE as any)[id].deletedFrom || '')
      let hit = false
      if (ch.collection === 'days') { const [wk, di] = rid.split('#'); hit = !!wk && dayIso(wk, +di) >= cut && holds(v, id) }
      else if (ch.collection === 'sched.book') hit = weekHolds(rid, { sg: v && v.sg, dr: v && v.dr }, id, cut)
      else if (ch.collection === 'weekstash') { try { hit = weekHolds(rid, typeof v === 'string' ? JSON.parse(v) : v, id, cut) } catch (_e) { hit = false } }
      else if (ch.collection === 'inputs') { const a = v && v.person === id ? dateOrd(v.date, v.yr) : null; hit = a != null && a >= isoOrd(cut) }
      else if (ch.collection === 'plan') hit = ((v && v.pp) || []).some((e: any) => e && e.kind === 'pucks' && String(e.iso || '') >= cut && Array.isArray(e.ids) && e.ids.includes(id))
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
      txn.enlist(peopleStore); txn.enlist(settingsStore); txn.enlist(schedStore); txn.enlist(weekstashStore)
      applyDelete(id, cutoff)
      /* the war half — his records from the cutoff, his window closed, `gone` (through the sync, the one seam) */
      deletePersonOnWar(txn, id, cutoff)
      finishPeopleWrite()
      schedApplyEnd()
    },
  }))
}
