// THE LEAVE WAR ⇄ RAPTOR SEAM ([ARCH-STACK] step 4, 20 Sep 26 — replaces the
// 17 Aug two-way copy of approved leave, wires 1 + 2, which is DELETED).
//
// An absence — leave, medical, course, overseas duty — is ONE record: the Raptor
// Input. This module:
//   - READS the Inputs into the war's absence index (`refreshAbsences`), from
//     which the war derives what each day shows (state/merge.ts, engine/dayview.ts);
//   - installs the ABSENCE DOOR on the war store: approving, un-approving,
//     removing and moving approved leave write the Input inside the war's own
//     command (`doorApprove` … `doorMoveApproved`);
//   - installs the owner's clash rules at the inputs door (inputgate.ts) and the
//     publish door (`publishReplacesBids`);
//   - derives the clash strip from the day views;
//   - keeps wire 0 (the roster projection) and wire 4 (OIL credits from the
//     published schedule and acknowledged duty claims, `runOilPass`) and the
//     posting-out archive pass.
// The derived passes are reconciliation, not queues: compute the desired state,
// diff, write only the difference; a SYNCING flag guards re-entrancy.

import { INPUTS, DATES, baseYear, dateOrd, inpId, inpWin, isAway, isLeave, isPersonal, canWork, oilAsks, withRemarksTail, inputCoversDate, nowStamp } from '../engine/inputs'
import { dayEngaged, personBusy } from '../engine/avail'
import { inputProtected, protectedDates } from '../engine/quarantine'
import { mayManageRoster, viewerId, me } from '../state/perms'
import { SESSION } from '../state/auth'
/* [ARCH-STACK] phase 3: the command-routed persistPeople (the cross-seam roster
   writers — PO-archive, restore — emit a people change too). */
import { persistPeopleProjection, commitPeopleEdit } from '../state/people-settings-commit'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { SCHED, dayApproved, dayCurVer, dayCurVerIn, daySnapIn, daySnapOf, amFormatOf } from '../engine/publish'
import { blindDesks, dayOilBlind, dayOilWork, inputOilAmt, envMin, uniformOil, oilWorkWhy, type OilWork } from '../engine/oil'
import { oilEarnedWork, type OilEvidence } from '../engine/oilev'
import { stashKeys, stashGet, isPreservedWeek } from '../engine/weekstash'
import { CURWEEK } from '../engine/waves'
import { validate } from '../engine/validate'
import { notify as raptorNotify, subscribe as raptorSubscribe, writeInputsBatch } from '../state/store'
import { lwSyncTurn } from './state/store'
import {
  addDays,
  oilLedgerOf,
  inSquadron,
  isNonWorkingDay,
  localToday,
  weekday,
  parseCell,
  warHolding,
  recsAt,
  recContribs,
  requestWin,
  barsWrite,
  forbiddenPair,
  liveRequestsOn,
  portionOfCode,
  portionOf,
  overlaps,
  newRecId,
  type Contrib,
  type RequestRec,
  type RequestState,
  type WarRec,
} from './engine'
import {
  absencesChanged,
  getVersion,
  setRefusalHook,
  clearRaptorCell,
  createWar,
  figureCtxOf,
  getState,
  ingestDutyCredit,
  lwEditLists,
  rawState,
  setAbsenceDoor,
  setPeople,
  setPostOut,
  setQualCatalog,
  setViewer,
  setViewerCallsign,
  subscribe as lwSubscribe,
} from './state/store'
import { HOOKS } from '../engine/hooks'
import { deferEffect as cmdDeferEffect } from '../command'
import { setPublishGate } from '../state/inputgate-hook'
import { absencesAt, setAbsenceRows } from './state/merge'
import { cs, dm, installInputGate } from './inputgate'
import { projectPeople, qualCatalogue } from './state/raptorRoster'
import {
  labelToISO, warVisible, absenceSignature, buildAbsenceIndex, inputDates, inputRowFor, isoToInputDate,
  type AbsenceIndex,
} from './absences'

/* Re-entrancy: ingest persists-and-notifies per cell, and writeInputsBatch's
   epilogue notifies too, so each reconciler fires the other's subscription
   mid-write. One flag over both means those nested calls return at the door;
   the wiring below re-runs the counterpart pass once the writer finishes. */
let SYNCING = false

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/* '2026-02-11' -> 'Feb 11', year-suffixed outside baseYear()'s year — the
   exact convention engine/inputs.ts documents and dateOrd reads back. */
function isoToLabel(iso: string): string {
  const y = +iso.slice(0, 4)
  const lbl = `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}`
  return y === baseYear() ? lbl : `${lbl} ${y}`
}

/* labelToISO / rowPortion / medRowPortion live in ./absences ([ARCH-STACK]
   step 4) — the one absence layer reads them too. */

/* ---- THE ABSENCE LAYER ([ARCH-STACK] step 4, design §1–§4) ----------------
   An absence is ONE record — the Input. The war stores none: it READS the
   Inputs through a per-person index (absences.ts) and the store's merge. This
   replaces the two sync wires and their loop-breaker (runInbound /
   runOutbound / retractLwRow, all deleted): nothing is copied either way, so
   there is nothing to reconcile and nothing to disagree.

   Kept current by a per-person SIGNATURE over the war-visible Inputs, checked
   on every Raptor notify (design §4.1 — phase 8's notify always runs, command
   or not): a changed signature rebuilds that person's rows and repaints the
   war (no persist, no envelope). Unchanged persons keep their row objects, so
   the merge re-does only them. */
const SIGS = new Map<string, string>()
let INDEX: AbsenceIndex = new Map()

/** Rebuild the index for every person whose war-visible Inputs changed. True
 *  when anything did (the caller then repaints). */
export function refreshAbsences(force = false): boolean {
  const byPerson = new Map<string, any[]>()
  for (const row of INPUTS) {
    if (!row || !warVisible(row.type) || !row.person) continue
    const p = String(row.person)
    const list = byPerson.get(p)
    if (list) list.push(row)
    else byPerson.set(p, [row])
  }
  const next: AbsenceIndex = new Map()
  let changed = force
  for (const [p, rows] of byPerson) {
    const sig = rows.map(absenceSignature).join('\n')
    const prev = INDEX.get(p)
    if (!force && prev && SIGS.get(p) === sig) { next.set(p, prev); continue }
    const one = buildAbsenceIndex(rows).get(p) ?? new Map()
    next.set(p, one)
    SIGS.set(p, sig)
    changed = true
  }
  for (const p of INDEX.keys()) if (!byPerson.has(p)) { SIGS.delete(p); changed = true }
  if (!changed) return false
  INDEX = next
  setAbsenceRows(INDEX)
  publishLeaveClashes()
  return true
}

/** Re-read the Inputs AND repaint the war when anything changed. Every door
 *  and the inputs gate refresh inside their command; the repaint must come
 *  from them, because the Raptor lane that runs afterwards then finds the index
 *  already current and would not bump the war (Fable inspection #1, 20 Sep 26).
 *  Deferred to the command's release when inside one, so no subscriber runs on
 *  a half-applied world. */
export function refreshAbsencesAndRepaint(): void {
  if (!refreshAbsences()) return
  /* one repaint per command: if the war notified on its own after this point
     (a door that also rewrote its records), that repaint already reads the
     fresh index — skip a second one */
  const at = getVersion()
  if (!cmdDeferEffect(() => { if (getVersion() === at) absencesChanged() })) absencesChanged()
}

/** Install the absence door (wireLeaveWarSync does; tests call it alone). */
export function installAbsenceDoor(): void {
  setAbsenceDoor({ approve: doorApprove, decideApproved: doorDecideApproved, removeApproved: doorRemoveApproved, moveApproved: doorMoveApproved })
  /* a refused war gesture rolled INPUTS back; the absence index was refreshed
     inside it, so re-read it before the repaint (Codex AS4-R2-001) */
  setRefusalHook(() => { refreshAbsences(true) })
  installInputGate()
  setPublishGate(publishFlagsBids)
  /* WHICH DAYS CAN EARN OIL AT ALL — the schedule's blind-desk warning asks
     this before it speaks, and only Leave War can answer for a public holiday
     (the engine covers Saturday and Sunday from the day's own name). One
     predicate, the same `isNonWorkingISO` the credit itself is drawn from, so
     the warning and the OIL can never disagree about which days count. */
  HOOKS.oilEarningDay = (di: number) => {
    const iso = labelToISO(DATES[di])
    return !!iso && isNonWorkingISO(iso)
  }
  /* the other two facts the OIL evidence block needs from out here: the day's
     real date, and who an ALL / ALL AVAIL puck stands for ([ALL-AVAIL-REDEF]).
     Same seam, same reason — the engine cannot ask a war anything. */
  HOOKS.oilDayISO = (di: number) => labelToISO(DATES[di]) || ''
  HOOKS.oilSentinel = (iso: string, win: [number, number], day: any) => availableFor(iso, win, day)
  /* WHICH YEAR'S PERIOD IS MISSING (owner's ruling D19, 22 Sep 26). A weekend
     COUNTS as a day that earns whether or not a war holds it — that is the
     calendar, and the predicate above says so. But the credit can only be
     written into a war that DOES hold the date (`creditFrom`'s own first
     line), so a day outside every period promised a full day of OIL that
     nobody could ever be paid, and said nothing about it. The year is the
     war's fact, not the engine's, so it is handed over already named. */
  HOOKS.oilNoPeriod = (di: number) => {
    const iso = labelToISO(DATES[di])
    if (!iso || !isNonWorkingISO(iso)) return ''
    return warHolding(getState().wars, iso) ? '' : iso.slice(0, 4)
  }
}

/** CREATE THE MISSING PERIOD, from the schedule — the way out the day offers
 *  beside the reason (owner's ruling D19, 22 Sep 26: "indicate that the leave
 *  war period doesn't exist, create it").
 *
 *  A whole calendar year, named for it, and left in DRAFT: a period carries
 *  bidding dates and a stage, and opening it for bidding is the admin's own
 *  act taken when the schedule firms up — so it is never made open from a
 *  schedule screen. The scheduler is handed to the Leave War afterwards to set
 *  the window, which is his half of the job.
 *
 *  Refusals come straight back from the store, which is where they belong: a
 *  member gets 'forbidden', and a year another war already reaches gets
 *  'overlap' rather than a second war over the same dates — a date in two wars
 *  would let one man hold leave on it twice. */
export function createOilPeriodFor(year: string): string {
  const y = String(year || '').trim()
  if (!/^\d{4}$/.test(y)) return 'backwards'
  return createWar(y, `${y}-01-01`, `${y}-12-31`)
}
/** Re-read the Inputs into the war now and repaint — what a Raptor notify
 *  does in the app; tests that push INPUTS directly call it. */
export function syncAbsences(): void {
  refreshAbsences(true)
  absencesChanged()
}

/* The Raptor leave INPUT behind a war cell — what the published-stage remarks
   editor edits (owner, 27 Aug 26). The day view knows exactly which Inputs make
   the cell (their iids), so this is a lookup, not a guess: the tapped half's
   contributor when the code names one, else the main one. */
export function leaveInputAt(personId: string, iso: string, code?: string): any | null {
  const war = warHolding(getState().wars, iso)
  const v = war ? (war as any).views?.[personId]?.[iso] : null
  if (!v) return null
  const leaves = (v.all as Contrib[]).filter(c => c.kind === 'absence' && isLeave(INPUT_TYPE_FOR[c.code] ?? c.code))
  if (!leaves.length) return null
  const cell = code ? parseCell(code) : null
  const pick = (cell && leaves.find(c => c.code === cell.type && portionOf(c.win) === cell.portion))
    ?? (cell && leaves.find(c => c.code === cell.type))
    ?? (cell ? null : leaves[0])
  if (!pick) return null
  return INPUTS.find((r: any) => String(r.iid) === pick.id) ?? null
}
const INPUT_TYPE_FOR: Record<string, string> = { ATTB: 'ATT B', ATTC: 'ATT C' }

/* ---- THE ABSENCE DOOR: the war's changes to approved leave ---------------
   Every one runs INSIDE the war gesture that called it (store.ts `gesture` —
   one envelope, one undo step, all-or-nothing on save). Each writes the Input
   through the Raptor inputs door (writeInputsBatch, which joins the gesture)
   and the war's own records through the store, in the same command. */
const cmpISO = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

/* The war's own Input writes (approve / un-approve / remove / move) manage the
   requests they touch themselves, so the inputs door's bid replacement (H1)
   stands aside for them; the invariant (B7) still applies. */
let DOOR = 0
export const inDoor = (): boolean => DOOR > 0

/** The Input a war door may act on for one item — it must BE that person's
 *  war-approved LEAVE covering that date (Codex AS4-R2-002/003): a stale or
 *  mismatched id, or an lw-tagged row an admin retyped to a medical / course /
 *  duty, is never moved, un-approved or deleted from the war. */
function warLeaveRow(it: { personId: string; date: string; iid: string }): any | null {
  const row = INPUTS.find((r: any) => String(r.iid) === it.iid)
  if (!row || !row.lw || !isLeave(row.type)) return null
  if (String(row.person) !== it.personId || !inputDates(row).includes(it.date)) return null
  return row
}
function doorWrite(fn: () => void): boolean {
  DOOR++
  try { return writeInputsBatch(fn) } finally { DOOR-- }
}

/** approve: requests → Inputs (design §5.2 `lw.approve`, §18 OA3-002). Groups
 *  each person's selected requests into runs of consecutive days with the same
 *  code and the same carried remark; one Input per run; the requests go. */
function doorApprove(items: Array<{ personId: string; date: string; recId: string }>): { done: number; skipped: number; why: string[] } {
  const why: string[] = []
  const prot = new Set(protectedDates().map((d: any) => labelToISO(d)).filter(Boolean) as string[])
  type Pick = { personId: string; date: string; rec: RequestRec; warId: string }
  const picks: Pick[] = []
  let skipped = 0
  for (const it of items) {
    const war = warHolding(rawState().wars, it.date)
    const rec = war ? recsAt(war.recs, it.personId, it.date).find((r): r is RequestRec => r.kind === 'request' && r.id === it.recId) : undefined
    if (!war || !rec) { skipped++; continue }
    if (prot.has(it.date)) { skipped++; why.push(`${it.date} is on a locked week — not approved`); continue }
    /* preflight: the would-be absence against every absence already there
       (a different leave on the same time, a medical) — skipped and reported,
       nothing consumed */
    const c: Contrib = { id: 'new', kind: 'absence', code: parseCell(rec.code)!.type, win: requestWin(rec.code) }
    if (absencesAt(it.personId, it.date).some(o => barsWrite(c, o))) { skipped++; why.push(`${it.date} already holds leave or a medical at that time — not approved`); continue }
    /* a bid left standing when work was later credited. Owner Q5 and §26.3
       used to SKIP that day at approval; reversed 20 Sep 26 — the leave is
       granted and the day is flagged instead. */
    const credits = recContribs(recsAt(war.recs, it.personId, it.date)).filter(o => o.kind === 'credit')
    /* recorded work no longer stops an approval — the leave is granted, the
       day is flagged, and a human resolves it (owner, 20 Sep 26) */
    picks.push({ ...it, rec, warId: war.period.id })
  }
  if (!picks.length) return { done: 0, skipped, why }
  /* runs: same person, war, code, carried remark, consecutive dates */
  picks.sort((a, b) => cmpISO(a.personId, b.personId) || cmpISO(a.date, b.date))
  const runs: Pick[][] = []
  for (const p of picks) {
    const last = runs[runs.length - 1]
    const prev = last?.[last.length - 1]
    if (prev && prev.personId === p.personId && prev.warId === p.warId && prev.rec.code === p.rec.code &&
      (prev.rec.carried?.remarks ?? '') === (p.rec.carried?.remarks ?? '') && addDays(prev.date, 1) === p.date) last!.push(p)
    else runs.push([p])
  }
  const rows = runs.map(run => {
    const first = run[0]!, last = run[run.length - 1]!
    const moved: Record<string, string> = {}
    for (const p of run) {
      if (p.rec.shiftedFrom) moved[p.date] = p.rec.shiftedFrom
      for (const [d, f] of Object.entries(p.rec.carried?.lwMoved ?? {})) if (d === p.date) moved[d] = f
    }
    const row = inputRowFor({
      person: first.personId, code: first.rec.code, from: first.date, to: last.date, lw: first.warId,
      remarks: withRemarksTail(first.rec.carried?.remarks ?? '', first.date, last.date, 'on'),
      lwMoved: moved, mod: nowStamp(),
    })
    inpId(row)
    return row
  })
  let ok = false
  doorWrite(() => {
    for (const r of rows) {
      /* approving next to leave already approved in the same war, of the same
         type and part of the day, EXTENDS that Input (design §1: "creates (or
         extends) an Input") — a day-by-day approval stays one record */
      const start = labelToISO(r.date, r.yr)!, end = r.endDate ? labelToISO(r.endDate, r.yr)! : start
      /* …and only when the remark (without its date tail) matches, so an
         extension never swallows the run's own carried remark (Fable #7) */
      const body = (t: unknown) => withRemarksTail(t ?? '', null, null, 'none')
      const same = (x: any) => x !== r && x.person === r.person && x.lw === r.lw && x.type === r.type &&
        !!x.allday === !!r.allday && (x.half ?? '') === (r.half ?? '') && body(x.remarks) === body(r.remarks)
      const before = INPUTS.find((x: any) => same(x) && addDays(inputDates(x).slice(-1)[0] ?? '', 1) === start)
      const after = INPUTS.find((x: any) => same(x) && inputDates(x)[0] === addDays(end, 1))
      if (!before && !after) { INPUTS.push(r); continue }
      const from = before ? inputDates(before)[0]! : start
      const to = after ? inputDates(after).slice(-1)[0]! : end
      const keep = before ?? after
      const merged = sliceInput({ ...keep, lwMoved: { ...(before?.lwMoved ?? {}), ...(r.lwMoved ?? {}), ...(after?.lwMoved ?? {}) } }, from, to, true)
      merged.remarks = withRemarksTail(keep.remarks ?? '', from, to, 'on')
      merged.mod = nowStamp()
      INPUTS.splice(INPUTS.indexOf(keep), 1, merged)
      if (before && after) INPUTS.splice(INPUTS.indexOf(after), 1)
    }
    ok = true
  })
  if (!ok) return { done: 0, skipped: skipped + picks.length, why }
  lwEditLists(picks.map(p => ({ personId: p.personId, date: p.date, drop: [p.rec.id], add: [] })))
  refreshAbsencesAndRepaint()
  return { done: picks.length, skipped, why }
}

/* the dates an Input covers and a copy of it limited to [from, to] — the one
   split/shrink body (design §5.2 Splitting: the first part keeps the iid, a
   later part gets a fresh one carrying lw / remarks / docs / mod verbatim) */
export function sliceInput(row: any, from: string, to: string, keepIid: boolean): any {
  const out = { ...row }
  const { date, yr } = isoToInputDate(from)
  out.date = date
  out.yr = yr
  const endIso = to
  if (endIso > from) {
    const e = isoToInputDate(endIso)
    out.endDate = e.yr === yr ? e.date : `${e.date} ${e.yr}`
  } else delete out.endDate
  if (row.lwMoved) {
    const m: Record<string, string> = {}
    for (const [d, f] of Object.entries(row.lwMoved as Record<string, string>)) if (d >= from && d <= to) m[d] = f
    if (Object.keys(m).length) out.lwMoved = m
    else delete out.lwMoved
  }
  if (!keepIid) { delete out.iid; inpId(out) }
  return out
}

/** Remove the given dates from the given Inputs — shrink, split or delete —
 *  in ONE Raptor batch. Returns the per-Input result for the callers. */
function cutDates(cuts: Map<string, Set<string>>): boolean {
  let ok = false
  doorWrite(() => {
    for (const [iid, drop] of cuts) {
      const ix = INPUTS.findIndex((r: any) => String(r.iid) === iid)
      if (ix < 0) continue
      const row = INPUTS[ix]
      const dates = inputDates(row)
      const keep: string[][] = []
      for (const d of dates) {
        if (drop.has(d)) { keep.push([]); continue }
        if (!keep.length || !keep[keep.length - 1]!.length) keep.push([d])
        else keep[keep.length - 1]!.push(d)
      }
      const parts = keep.filter(k => k.length)
      if (!parts.length) { INPUTS.splice(ix, 1); continue }
      const pieces = parts.map((k, i) => sliceInput(row, k[0]!, k[k.length - 1]!, i === 0))
      INPUTS.splice(ix, 1, ...pieces)
    }
    ok = true
  })
  return ok
}

/** un-approve approved leave back into a request of `to` (design §5.2
 *  `lw.decideApproved`, §24): the Input shrinks / splits / goes on those dates,
 *  and a request carrying its remark and moved marks takes its place. Refused
 *  per date where a different request already sits on that time (§24.1). */
function doorDecideApproved(items: Array<{ personId: string; date: string; iid: string }>, to: RequestState): { done: number; skipped: number; why: string[] } {
  const why: string[] = []
  let skipped = 0
  const cuts = new Map<string, Set<string>>()
  const adds: Array<{ personId: string; date: string; drop: string[]; add: WarRec[] }> = []
  const prot = new Set(protectedDates().map((d: any) => labelToISO(d)).filter(Boolean) as string[])
  for (const it of items) {
    const row = warLeaveRow(it)
    if (!row) { skipped++; continue }
    if (prot.has(it.date) || inputProtected(row)) { skipped++; why.push(`${it.date} is on a locked week — not changed`); continue }
    const contrib = absencesAt(it.personId, it.date).find(c => c.id === it.iid)
    if (!contrib) { skipped++; continue }
    const code = notationOf(contrib.code, contrib.win)
    const war = warHolding(rawState().wars, it.date)
    if (!war) { skipped++; continue }
    const list = recsAt(war.recs, it.personId, it.date)
    /* design §24.1 (Codex AS4-002): un-approving never overwrites or sits
       beside a request already stored on that time — pending, acknowledged OR a
       refused one kept as history — for every destination state */
    const blocking = list.filter((r): r is RequestRec => r.kind === 'request' && overlaps(requestWin(r.code), contrib.win))
    if (blocking.length) { skipped++; why.push(`${blocking[0]!.code} request on ${it.date} — decide or clear it before changing the ${contrib.code}`); continue }
    const rec: RequestRec = {
      id: newRecId(), kind: 'request', code, state: to,
      ...(row.lwMoved?.[it.date] ? { shiftedFrom: row.lwMoved[it.date] } : {}),
      carried: { ...(row.remarks ? { remarks: String(row.remarks) } : {}), ...(row.lwMoved?.[it.date] ? { lwMoved: { [it.date]: row.lwMoved[it.date] } } : {}) },
    }
    if (!rec.carried!.remarks && !rec.carried!.lwMoved) delete rec.carried
    adds.push({ personId: it.personId, date: it.date, drop: [], add: [rec] })
    const set = cuts.get(it.iid) ?? new Set<string>()
    set.add(it.date)
    cuts.set(it.iid, set)
  }
  if (!adds.length) return { done: 0, skipped, why }
  if (!cutDates(cuts)) return { done: 0, skipped: skipped + adds.length, why }
  lwEditLists(adds)
  refreshAbsencesAndRepaint()
  return { done: adds.length, skipped, why }
}

/** delete approved leave days (design §5.2 `lw.removeApproved` — a deliberate
 *  delete propagates and sticks, owner decision 2, 13 Sep 26). */
function doorRemoveApproved(items: Array<{ personId: string; date: string; iid: string }>): { done: number; skipped: number; why: string[] } {
  const cuts = new Map<string, Set<string>>()
  const why: string[] = []
  const prot = new Set(protectedDates().map((d: any) => labelToISO(d)).filter(Boolean) as string[])
  let skipped = 0
  for (const it of items) {
    const row = warLeaveRow(it)
    if (!row) { skipped++; continue }
    if (prot.has(it.date) || inputProtected(row)) { skipped++; why.push(`${it.date} is on a locked week — not deleted`); continue }
    const set = cuts.get(it.iid) ?? new Set<string>()
    set.add(it.date)
    cuts.set(it.iid, set)
  }
  const n = items.length - skipped
  if (!n) return { done: 0, skipped, why }
  if (!cutDates(cuts)) return { done: 0, skipped: items.length, why }
  refreshAbsencesAndRepaint()
  return { done: n, skipped, why }
}

/** slide approved leave days by `delta` (design §5.2 `lw.moveApproved`, §17
 *  FB3-01). `check` = validate only (the store's moveProblem). The moved days
 *  are cut from their Input and re-filed as a new Input over the landing
 *  dates, carrying lw / remarks / docs / mod and — once bidding is closed —
 *  the moved-from marks. */
function doorMoveApproved(items: Array<{ personId: string; date: string; iid: string }>, delta: number, tracked: boolean, check: boolean): { reason: 'occupied' | 'window' | 'nothing'; at?: string } | null {
  const leaving = new Set(items.map(i => `${i.iid}|${i.date}`))
  const prot = new Set(protectedDates().map((d: any) => labelToISO(d)).filter(Boolean) as string[])
  for (const it of items) {
    const row = warLeaveRow(it)
    if (!row) return { reason: 'nothing', at: it.date }
    const to = addDays(it.date, delta)
    if (!warHolding(rawState().wars, to)) return { reason: 'window', at: to }
    /* a locked week at either end refuses before anything moves (AS4-R2-001) */
    if (prot.has(it.date) || prot.has(to) || inputProtected(row)) return { reason: 'window', at: prot.has(to) ? to : it.date }
    const contrib = absencesAt(it.personId, it.date).find(c => c.id === it.iid)
    if (!contrib) return { reason: 'nothing', at: it.date }
    const here = absencesAt(it.personId, to).filter(c => !leaving.has(`${c.id}|${to}`))
    const war = warHolding(rawState().wars, to)!
    const reqs = recContribs(recsAt(war.recs, it.personId, to))
    if ([...here, ...reqs].some(o => barsWrite({ ...contrib, id: 'moving' }, o))) return { reason: 'occupied', at: to }
    if (liveRequestsOn(recsAt(war.recs, it.personId, to), portionOf(contrib.win)).length) return { reason: 'occupied', at: to }
  }
  if (check) return null
  /* group per Input: cut the moved dates, re-file them shifted */
  const byIid = new Map<string, string[]>()
  for (const it of items) byIid.set(it.iid, [...(byIid.get(it.iid) ?? []), it.date])
  const cuts = new Map<string, Set<string>>()
  const refile: any[] = []
  for (const [iid, dates] of byIid) {
    const row = INPUTS.find((r: any) => String(r.iid) === iid)!
    cuts.set(iid, new Set(dates))
    const sorted = [...dates].sort()
    let run: string[] = []
    const flush = () => {
      if (!run.length) return
      const from = addDays(run[0]!, delta), to = addDays(run[run.length - 1]!, delta)
      const moved: Record<string, string> = {}
      for (const d of run) {
        const origin = row.lwMoved?.[d] ?? d
        if (tracked) moved[addDays(d, delta)] = origin
      }
      const piece = sliceInput({ ...row, lwMoved: undefined }, from, to, false)
      if (Object.keys(moved).length) piece.lwMoved = moved
      else delete piece.lwMoved
      refile.push(piece)
      run = []
    }
    for (const d of sorted) { if (run.length && addDays(run[run.length - 1]!, 1) !== d) flush(); run.push(d) }
    flush()
  }
  let ok = false
  doorWrite(() => {
    /* cut first (same body as remove), then file the landings */
    for (const [iid, drop] of cuts) {
      const ix = INPUTS.findIndex((r: any) => String(r.iid) === iid)
      if (ix < 0) continue
      const row = INPUTS[ix]
      const parts: string[][] = []
      for (const d of inputDates(row)) {
        if (drop.has(d)) { parts.push([]); continue }
        if (!parts.length || !parts[parts.length - 1]!.length) parts.push([d])
        else parts[parts.length - 1]!.push(d)
      }
      const keep = parts.filter(k => k.length)
      INPUTS.splice(ix, 1, ...keep.map((k, i) => sliceInput(row, k[0]!, k[k.length - 1]!, i === 0)))
    }
    for (const r of refile) INPUTS.push(r)
    ok = true
  })
  if (ok) refreshAbsencesAndRepaint()
  return ok ? null : { reason: 'window' }
}

function notationOf(code: string, win: readonly [number, number]): string {
  const p = portionOf(win)
  return p === 'am' ? `*${code}` : p === 'pm' ? `${code}*` : code
}

/* ---- the clash strip: DERIVED from the day views, never stored ------------
   (design §3.1, §19 OA4-003): every forbidden pair on any day of any war — a
   request over an absence, leave over worked time, two overlapping leaves, a
   medical on worked time — republished whenever the war's records or the
   index change, behind an equality guard so an unchanged list notifies
   nothing. */
function publishLeaveClashes(): void {
  const out: SyncClash[] = []
  for (const war of getState().wars as any[]) {
    for (const [person, row] of Object.entries(war.views ?? {}) as Array<[string, Record<string, any>]>) {
      for (const [date, v] of Object.entries(row)) {
        for (const pair of v.conflicts as Array<[Contrib, Contrib]>) {
          /* the sentence reads "work earns X but the day holds Y", so when one
             side is a CREDIT it has to be the X — and which side that is
             depends only on the order the records happen to sit in on the day
             (state/merge.ts puts the war's own records before the absences).
             Order the pair here rather than letting the wording flip. */
          const [a, b] = pair[1].kind === 'credit' && pair[0].kind !== 'credit' ? [pair[1], pair[0]] : pair
          out.push({ person, date, inputCode: notationOf(a.code, a.win), bidCode: notationOf(b.code, b.win), ...(a.kind === 'credit' || b.kind === 'credit' ? { kind: 'duty' as const } : {}) })
        }
      }
    }
  }
  LEAVE_CLASHES = out
  publishClashes()
}

/* ---- the clash list's shape and its subscribers --------------------------- */

/** A leave input asking for a date the squadron already bid differently on.
 *  The system never overwrites a bid — it raises the clash and a human
 *  decides (Leave War's rule); this list is that surface's data. */
export interface SyncClash {
  person: string
  date: string
  /** What the Raptor input asks for, in Leave War notation. */
  inputCode: string
  /** What the squadron already bid. */
  bidCode: string
  /** Absent for a leave clash; 'duty' when a published weekend/PH duty's OIL
   *  credit (wire 4) found the date already holding something else. */
  kind?: 'duty'
}

/* Re-derived on every pass, never persisted — a clash list is a view of two
   live records, and storing it would let it outlive either. Two passes
   contribute (inbound's leave clashes, the OIL pass's duty clashes), each
   replacing only its own half, so one pass running cannot blank the other's
   findings between its runs. */
let LEAVE_CLASHES: SyncClash[] = []
let CLASHES: SyncClash[] = []
let clashVersion = 0
const clashListeners = new Set<() => void>()

export function getClashes(): SyncClash[] {
  return CLASHES
}
export function getClashVersion(): number {
  return clashVersion
}
export function subscribeClashes(fn: () => void): () => void {
  clashListeners.add(fn)
  return () => void clashListeners.delete(fn)
}

function publishClashes(): void {
  const next = [...LEAVE_CLASHES]
  /* A clash that did not change must not repaint the strip: the passes run on
     every Raptor notify, and the common case is "still the same clashes". */
  if (JSON.stringify(next) === JSON.stringify(CLASHES)) return
  CLASHES = next
  clashVersion += 1
  for (const fn of clashListeners) fn()
}

/* ---- wire 4: published weekend/PH duty -> OIL credit --------------------- */

/* Whether Leave War calls this date non-working. The weekend needs no war at
   all; a public holiday is whatever the war holding the date says — its PH
   flag, or an event word typed on it whose type is tagged "off day" (the
   owner's own input path for holidays, seeded as `PH`). A date no war holds
   can still be a weekend, but never a holiday: there is nowhere to have
   filed one. EXPORTED since 28 Aug 26 — the input ask-flow (oilAskPlan
   below, the OilConfirm sheet, the bell's pending scan) all read the SAME
   answer, so "is this day applicable" can never fork. */
export function isNonWorkingISO(date: string): boolean {
  // The body is the engine's `isNonWorkingDay` since 3 Sep 26 — the same
  // predicate the leave-charging rule (charge.ts) reads, so a PH earns OIL
  // and excuses a leave day by ONE definition.
  const war = warHolding(getState().wars, date)
  const day = war?.period.days.find(d => d.date === date)
  return isNonWorkingDay(date, day, getState().eventDefs, war?.period.bands ?? [])
}

/* THE INPUT ASK-FLOW'S PLAN (owner, 28 Aug 26): which of a duty-&-commitments
   input's covered days are non-working, and what the input's own hours would
   earn on each — the pure body BOTH the OilConfirm sheet and the save gate
   read, so what is asked and what is credited cannot disagree (the
   upchitEffects precedent). One entry per applicable day; the amount is the
   input's own standing (all-day = FO, else its length under oilFullMin) —
   the CELL finally posted may still upgrade when published schedule work on
   the same day stretches its envelope (desiredOilCells). Walks label→ISO exactly as
   inputDates does, same 400-day cap. */
export function oilAskPlan(row: { person?: any; date: string; endDate?: string; yr?: any; allday?: any; s?: any; e?: any }): { iso: string; amt: 0.5 | 1 }[] {
  const out: { iso: string; amt: 0.5 | 1 }[] = []
  const amt = inputOilAmt(row.allday, row.s, row.e)
  if (amt == null) return out
  const start = labelToISO(row.date, row.yr)
  if (!start) return out
  let end = row.endDate ? labelToISO(row.endDate, row.yr) ?? start : start
  if (end < start) end = start
  let n = 0
  for (let d = start; d <= end && n < 400; d = addDays(d, 1), n++) {
    if (isNonWorkingISO(d)) out.push({ iso: d, amt })
  }
  return out
}

/* THE BELL'S PENDING SCAN (owner, 28 Aug 26 — "it will notify the applicable
   user based on the notification tab to review if the input deserves an
   applicable HO or FO"): every duty-&-commitments input of this person with
   at least one applicable (non-working) covered day the owner has NOT
   answered yet — a missing key in row.oil; an explicit 0 IS an answer. A
   DERIVED predicate on purpose (the bugAlert shape): it self-heals — answer
   the days, or move the input, and the row stops matching with no clearing
   discipline — and it recomputes the moment Leave War marks a PH after the
   fact, which is the whole point. Dormant rows ask nothing: the scheduler
   removed that commitment. Returns the first pending day per row so the
   bell's tap can land the editor on the exact question (iid, never the row
   object — undo re-mints rows). */
export function oilPendingFor(personId: any): { iid: string; iso: string }[] {
  const out: { iid: string; iso: string }[] = []
  if (!personId) return out
  /* a protected (quarantined) day is never asked (P2-QREV-06/Fable-6): the OIL
     pass already treats it as "credit stands", and the answer write would be
     rolled back by the input funnel — so the bell would stay lit forever. Skip
     those days from the scan. */
  const prot = protectedDates()
  const isoProt = (iso: string) => prot.length > 0 && prot.some((dt: any) => inputCoversDate({ date: isoToLabel(iso), yr: baseYear() }, dt))
  for (const row of INPUTS) {
    if (row.person !== personId || !oilAsks(row.type) || row.acc === 'r') continue
    const answered = (row.oil ?? {}) as Record<string, number>
    const hit = oilAskPlan(row).find(p => answered[p.iso] == null && !isoProt(p.iso))
    if (hit && row.iid) out.push({ iid: row.iid, iso: hit.iso })
  }
  return out
}

/* WHO AN ALL / ALL AVAIL PUCK STANDS FOR ([ALL-AVAIL-REDEF], owner 21 Sep 26 —
   "ALL Avail and ALL pucks should not consist of ground crew by default. only
   SANS that are planned on the programmed on that day with us should be
   included. Like if they fly, then they should be counted as part of all
   avail/all. people on ATT B only should still be included. Those on Training,
   Course, Meeting, Appointment, Duty, Personal, Other, planned for anything on
   the schedule that conflicts in timing with the rest of the schedule is not
   part of All avail and ALL").

   ONE answer to "is this man available", which is the point: the board and the
   crew picker already knew who was busy on the programme (engine/avail.ts) and
   this expansion ignored the schedule entirely — two notions of available living
   in one app. It now asks the schedule's own body, on the day blob it is
   measuring, so a frozen snapshot resolves against the day it was issued with.

   The rule, in order:
   - never a sentinel, an archived body or ground-crew Personnel (unchanged);
   - a SANS man ONLY when he is planned on OUR programme that day — named
     anywhere on it (`dayEngaged`). He is otherwise another squadron's;
   - not posted in, or posted out, drops him (`inSquadron`, unchanged);
   - an away-making input — all leave, medical, overseas duty — that overlaps
     the event's window drops him, EXCEPT **ATT B**, the one type in the app
     that says "no flying, may still work" (`canWork`);
   - a COMMITMENT that overlaps the window drops him: Training, CSE, Meeting,
     Fly with, Personal, Appointment, Duty, Other. A commitment the scheduler
     took off the programme (`acc === 'r'`) is dormant and drops nothing;
   - anything he is NAMED for on the day's own schedule that overlaps the window
     drops him (`personBusy` — the same occupancy the validator and the picker
     read).

   A SENTINEL NEVER BLOCKS ANOTHER SENTINEL (ruled by the build, not the owner —
   raise it if reopened): only NAMED people count as "planned for something", so
   two overlapping ALL AVAIL rows cannot each empty the other. `personBusy`
   gives this for free — it matches a person by id, and a sentinel row names no
   one.

   The war grid needs no separate read: an approved war-side leave exists as an
   Input too, so INPUTS is the one absence record this consults. */
export function availableFor(iso: string, win: [number, number], day?: any): string[] {
  const out: string[] = []
  const isoOrd = +iso.replace(/-/g, '')
  /* the Leave War body, for the posting window (bug pass, 28 Aug 26): a
     person posted out WITHOUT the archive switch — or not yet posted in —
     still holds a Raptor body, and expanding them under an ALL puck would
     mint a credit the matrix hides behind its not-yet-arrived blank. The
     same inSquadron read the manning counts make. */
  const lwById = new Map(getState().people.map(p => [p.id, p]))
  /* computed ONCE for the whole walk, not per person: dayEngaged is a full pass
     over the day, and this loop runs sixty times per sentinel window. */
  const engaged = day ? dayEngaged(day) : null
  const covers = (inp: any) => {
    const a = dateOrd(inp.date, inp.yr)
    if (a == null) return false
    const b = inp.endDate ? dateOrd(inp.endDate, inp.yr) ?? a : a
    return isoOrd >= a && isoOrd <= b
  }
  const hits = (inp: any) => { const w = inpWin(inp); return !!w && w[0] < win[1] && win[0] < w[1] }
  for (const id of Object.keys(PEOPLE)) {
    const p: any = (PEOPLE as any)[id]
    if (!p || p.special || p.archived || p.pers) continue
    /* SANS are another squadron's men until they are on our programme for the
       day. With no day blob to read (a caller that cannot supply one) they stay
       out, which is the pre-[ALL-AVAIL-REDEF] answer — fail closed. */
    if (p.san && !(engaged && engaged.has(id))) continue
    const lw = lwById.get(id)
    if (lw && !inSquadron(lw, iso)) continue
    const blocked = INPUTS.some((inp: any) => {
      /* A REMOVED REQUEST IS SILENT EVERYWHERE (Astra, 21 Sep 26). The dormant
         test used to sit on the `commit` branch only, so a Training or Meeting
         the scheduler had turned down correctly stopped speaking — while a
         LEAVE, MEDICAL or OVERSEAS DUTY he had turned down still kept its man
         out of ALL AVAIL. He was then missing from the membership frozen into
         the issued day and earned nothing, with nothing on screen to say why.
         `inputDormant` has always defined every removed input as silent; this
         is the one reader that applied it to half the types. */
      if (inp.person !== id || inp.acc === 'r') return false
      const away = isAway(inp) && !canWork(inp.type)
      const commit = isPersonal(inp.type)
      if (!away && !commit) return false
      return covers(inp) && hits(inp)
    })
    if (blocked) continue
    if (engaged && personBusy(day, id).some((w: any) => w[0] < win[1] && win[0] < w[1])) continue
    out.push(id)
  }
  return out
}

/* The ISO date of day di in the week whose Monday is v (dd/mm/yyyy — the
   stash's own key). Pure calendar arithmetic on the key, so a stashed
   week's dates can never disagree with the key it is filed under. */
function weekDayISO(v: string, di: number): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v)
  if (!m) return null
  return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1] + di)).toISOString().slice(0, 10)
}

/* A stashed week's model + publish state, parsed ONCE per stored blob —
   runOilPass runs on every notify and must not re-parse unchanged weeks
   each time. Cached by the blob string's own REFERENCE identity (stashPut
   replaces the string, so a hit is proof nothing changed; a generation
   counter would collide across the tests' stashClear, which resets GEN).
   The publish fields ride the snapshot under schedFields' short keys
   (state/history.ts): ok=dayOK, cv=cur, a=als, o=orig, dr=drafts — mapped
   here into the SCHED shape the parameterized publish readers take.
   null = nothing usable stashed. */
const STASH_OIL_CACHE = new Map<string, { src: string, wk: { days: any[], sc: any } | null }>()
function stashOilWeek(v: string): { days: any[], sc: any } | null {
  const src = stashGet(v)
  if (!src) return null
  const hit = STASH_OIL_CACHE.get(v)
  if (hit && hit.src === src) return hit.wk
  let wk: { days: any[], sc: any } | null = null
  try {
    const s = JSON.parse(src)
    if (s && Array.isArray(s.d))
      /* amV (s.am) is carried so the OIL wire can CLASSIFY the stashed book
         (P2-REREVIEW-05) — an unsupported/future-version book whose snapshots
         still resolve must not be treated as authoritative. */
      wk = { days: s.d, sc: { dayOK: s.ok, cur: s.cv, als: s.a, orig: s.o, drafts: s.dr, amV: s.am } }
  } catch (_e) { /* a bad blob reads as never stashed — never throw in a pass */ }
  STASH_OIL_CACHE.set(v, { src, wk })
  return wk
}

/** The credits a non-working day earns right now: person|isoDate -> FO/HO,
 *  ONE ≤6h/>6h test per person per day over the ENVELOPE of BOTH sources —
 *  first start to last end, gaps included (owner, 29 Aug 26: between two
 *  commitments "they are still in squadron"; this replaced the 28 Aug
 *  interval-union sum):
 *  - the PUBLISHED schedule, from the ISSUED snapshot — an issued day is the
 *    squadron's word that the work stood, so a draft edit after publish
 *    moves nothing until it is published too (the AL/reissue paths), which
 *    is also where reverse-and-replace naturally lives: the snapshot
 *    changes, the diff below follows it;
 *  - ACKNOWLEDGED duty-&-commitments claims, which since [OIL-AUTO-REMOVE]
 *    (owner, 21 Sep 26 — "we make it a point to publish everyday so that
 *    silently earn nothing wont happen") ALSO WAIT FOR PUBLICATION: the claim
 *    rides the day's frozen OIL evidence block, so an answer revised after the
 *    day went out moves no money until the day is published again. Before this
 *    an answer moved the credit at once and produced no amendment, and an
 *    overseas-duty answer could never produce one at all — OD has no row.
 *    A day that stops reading non-working still stops crediting (checked live
 *    below), and the reverse sweep collects the cell.
 *
 *  The schedule half reads EVERY week, not just the loaded one (owner,
 *  29 Aug 26 — "pull the full day schedule regardless of what's on
 *  screen"): the live DAYS/SCHED for the loaded week, and the per-week
 *  session stash (engine/weekstash.ts) for every other week the user has
 *  visited, whose snapshot carries the same publish state under
 *  schedFields' short keys. A never-visited week has published nothing, so
 *  live + stash IS the whole session. Before this, the reverse sweep
 *  quietly COLLECTED a published weekend's credits the moment the user
 *  navigated to another week — the recorded known-issue, now closed. */
/** What the sync wire wants a person's day to hold: the credit code and the
 *  WHY that becomes the tracker's reason (`FLT`, `SIM + Duty`, an input's
 *  type name — owner, 2 Sep 26). */
export interface DesiredOil {
  code: 'FO' | 'HO'
  why: string
  /** the published schedule, or a duty-and-commitments input the owner
   *  accepted — what the credit's giver reads as on screen (owner, 21 Sep 26) */
  via: 'schedule' | 'input'
  /** the actual work times on the day (not the gap-inclusive envelope) —
   *  what a leave or a medical must not overlap (clash check B4, §26.3) */
  spans: Array<[number, number]>
}

/* A date is PROTECTED when the schedule evidence behind it cannot be read as an
   ISSUED document — a pre-Phase-2 (unsupported) book, a stash filed under the
   wrong week, or an approved day whose snapshot was undone away. For such a date
   the OIL wire must neither DERIVE a credit from the live/stashed DRAFT (which
   may have dropped the duty) NOR DELETE a credit already landed by the build that
   issued it: the issued evidence is unavailable, so the standing credit is the
   best truth we have (P2-IMPL-01). Never substitute draft content for missing
   issued content, and never reverse-collect a protected date. */
/* WHAT ONE ISSUED DAY EARNS — the only door money comes through since
   [OIL-AUTO-REMOVE] (§7.1). The day's own frozen OIL EVIDENCE BLOCK answers
   everything: the scheduler's decisions, the duty-and-commitments claims
   projected at publication, and the people each ALL / ALL AVAIL puck stood for.
   Nothing live is consulted, so revising an answer or filing a leave cannot
   move an already-issued credit — that now costs a publication, like every
   other change to an issued day.

   A snapshot carrying NO block was issued by a build that did not store one. Its
   evidence cannot be reconstructed (rebuilding it from today's unapproved inputs
   is exactly what §7.5 forbids), so the date is PROTECTED rather than guessed
   at: the landed credit stands and nothing new is derived — the same rule the
   pass already applies to an unresolvable snapshot. Returns false to say so. */
function creditFrom(day: any, iso: string, add: (p: string, iso: string, sp: OilWork[], via?: 'schedule' | 'input') => void): boolean {
  const ev: OilEvidence | undefined = day && day.oilev
  /* the block's own date must be the date we are crediting. The evidence carries
     its ISO precisely so this binding can be checked, and a block that does not
     match the date it was found under is a misfiled document, not a licence to
     pay against it — so the date is PROTECTED, exactly like a missing block. */
  if (!ev || ev.iso !== iso) return false
  for (const [person, sp] of Object.entries(oilEarnedWork(day, ev))) {
    /* the two halves POOL into one envelope per person per date, and the credit
       reads as the SCHEDULE's when the schedule earned any of it — that is the
       stronger evidence, and it is what the reader would go and look at (owner,
       21 Sep 26). */
    add(person, iso, sp, sp.some(w => w.via !== 'input') ? 'schedule' : 'input')
  }
  return true
}

function desiredOilCells(): { desired: Map<string, DesiredOil>; protectedDates: Set<string> } {
  const protectedDates = new Set<string>()
  /* HIDING A MAN MUST NOT DESTROY HIS MONEY (owner, 21 Sep 26 — "There's no way
     to credit OIL to SANs even when they are hidden?"), and neither must
     ARCHIVING him (Astra, 21 Sep 26, confirmed by the owner as R-2).
     This guard used to consult the LIVE Leave War roster, which made the roster
     a second money authority sitting behind `creditFrom`: archive a man on the
     Monday and the reverse sweep deleted the day in lieu an ISSUED Saturday had
     already promised him — no amendment, no record, no way to see it happen.
     Who earned was decided when the day was published and frozen in its
     evidence; nothing the roster does afterwards may reopen that. A credit lives
     on the person and the date, not on a grid row, so it lands and waits: turn
     "Show SANS" on, or bring an archived man back, and his row arrives with
     everything he earned already in it.
     What the guard rejects now is the only thing that was never a person: a
     SENTINEL. A named GROUND-CREW body is deliberately creditable — they ride
     the Leave War roster (owner, 18 Aug 26) and a scheduler who names one on a
     weekend row means it (O-2, "leave it", 21 Sep 26). */
  const creditable = (id: string) => {
    const p: any = (PEOPLE as any)[id]
    return !!(p && !p.special)
  }
  /* person|iso -> that day's work spans; their ENVELOPE faces the threshold */
  const pool = new Map<string, OilWork[]>()
  /* which of those days the PUBLISHED SCHEDULE earned, as opposed to a duty
     input the owner accepted — what the credit's giver reads as on screen
     (owner, 21 Sep 26). A day backed by both is the schedule's: that is the
     stronger evidence, and it is what the reader would go and look at. */
  const fromSchedule = new Set<string>()
  const add = (person: string, iso: string, spans: OilWork[], via: 'schedule' | 'input' = 'schedule') => {
    /* The same unknown-person guard both leave directions carry: a row naming
       someone the war has no business crediting — ground crew, a sentinel —
       must not become a grid row no matrix draws. A SANS man the war is merely
       HIDING is not that case (see `creditable` above). */
    if (!creditable(person) || !spans.length) return
    const k = `${person}|${iso}`
    const arr = pool.get(k) ?? []
    arr.push(...spans)
    pool.set(k, arr)
    if (via === 'schedule') fromSchedule.add(k)
  }
  /* CLASSIFY the live book FIRST (P2-REREVIEW-05): an unsupported / wrong-week /
     future-version book must be quarantined even if its snapshots still resolve,
     so the whole loaded week's credit-bearing dates are protected up front. */
  /* a DAMAGED loaded week (P2-REV2-01) shows the seed as a placeholder, so
     amFormatOf(SCHED) would read 'current' — isPreservedWeek catches it so its
     credit-bearing dates are protected, never derived from the seed. */
  const liveUnsupported = amFormatOf(SCHED, CURWEEK) === 'unsupported' || isPreservedWeek(CURWEEK)
  for (let di = 0; di < DAYS.length; di++) {
    const iso = labelToISO(DATES[di])
    /* ONLY THE ISSUED SCHEDULE PAYS, BOTH DIRECTIONS (owner, 21 Sep 26 — R-1).
       This gate used to read the war's calendar LIVE, before the issued block
       was ever opened, and that made the two directions disagree: whether the
       day EARNS is frozen into the evidence, but whether it is a non-working day
       at all was answered by today's calendar. So taking a public holiday off a
       published day swept everybody's day in lieu on the next pass — silently,
       with no amendment and nothing on screen — while declaring one paid nobody.
       Now only an unreadable date skips before the snapshot is resolved, and the
       frozen `ev.earns` decides in both directions. A day that starts earning
       after it went out waits for a republication, and validateCore says so on
       the day (OIL_STALE_DAY). */
    if (!iso) continue
    if (liveUnsupported) { protectedDates.add(iso); continue }
    if (!dayApproved(di)) continue
    /* only ever credit from the RESOLVED ISSUED snapshot — never the live draft.
       No snapshot (an orphaned approved day) → protect it (P2-IMPL-01). */
    const snap = daySnapOf(di, dayCurVer(di))
    if (!snap || !snap.d) { protectedDates.add(iso); continue }
    if (!creditFrom(snap.d, iso, add)) protectedDates.add(iso)
  }
  /* every OTHER week, out of its stash entry — the loaded week is skipped
     (its stash is at best a stale copy of the live model read above) and a
     blob that fails to parse reads as never stashed, the stashDays rule.
     The ISO comes from the week key + day index directly (v is the Monday,
     dd/mm/yyyy) — no label parsing, no year-convention trap. */
  for (const v of stashKeys()) {
    if (String(v) === String(CURWEEK)) continue
    if (stashGet(String(v)) == null) continue
    const wk = stashOilWeek(String(v))
    /* CLASSIFY the stashed book (P2-REREVIEW-05): an UNREADABLE stash (wk null)
       or one whose book is unsupported / wrong-week / future-version must have
       ALL its credit-bearing dates PROTECTED — never derived from, never deleted
       — even though a future-version book's snapshots might still resolve. */
    const stashUnsupported = !wk || amFormatOf(wk.sc, String(v)) === 'unsupported'
    for (let di = 0; di < 7; di++) {
      const iso = weekDayISO(String(v), di)
      /* the same rule as the loaded week above (R-1): the frozen block decides,
         never today's calendar. */
      if (!iso) continue
      if (stashUnsupported) { protectedDates.add(iso); continue }
      if (!(wk!.sc.dayOK || {})[di]) continue
      /* the stash's OWN week key (v = its Monday, dd/mm/yyyy) is the trusted
         identity threaded into the resolver, so a book self-consistent but filed
         under the WRONG week is rejected here rather than credited to these dates
         (P2-R3-03). Credit ONLY from a resolved issued snapshot; no snapshot →
         protect the date, never fall back to its stashed draft (P2-IMPL-01). */
      const snap = daySnapIn(wk!.sc, di, dayCurVerIn(wk!.sc, di, String(v)), String(v))
      if (!snap || !snap.d) { protectedDates.add(iso); continue }
      if (!creditFrom(snap.d, iso, add)) protectedDates.add(iso)
    }
  }
  const out = new Map<string, DesiredOil>()
  for (const [k, spans] of pool) {
    if (protectedDates.has(k.slice(k.indexOf('|') + 1))) continue   // never desire a protected date (P2-IMPL-01)
    const amt = uniformOil(envMin(spans.map(w => [w.s, w.e] as [number, number])))
    if (amt) out.set(k, { code: amt === 1 ? 'FO' : 'HO', why: oilWorkWhy(spans), spans: workSpans(spans), via: fromSchedule.has(k) ? 'schedule' : 'input' })
  }
  return { desired: out, protectedDates }
}

/* the day's work spans clipped to the date and merged where they touch — the
   stored shape of an auto credit's times */
function workSpans(spans: OilWork[]): Array<[number, number]> {
  const clipped = spans.map(w => [Math.max(0, w.s), Math.min(1439, w.e)] as [number, number]).filter(([a, b]) => a <= b)
  clipped.sort((a, b) => a[0] - b[0])
  const out: Array<[number, number]> = []
  for (const [a, b] of clipped) {
    const last = out[out.length - 1]
    if (last && a <= last[1] + 1) last[1] = Math.max(last[1], b)
    else out.push([a, b])
  }
  return out
}

/* THE PUBLISH DOOR ([ARCH-STACK] step 4).
 *
 * PUBLISHING NO LONGER THROWS A BID AWAY — it FLAGS the day and says so
 * (owner, 20 Sep 26, answering the last of the three questions the
 * consolidation review left open). It used to replace the clashing part of
 * every undecided leave bid the published work overlapped, and leave a notice
 * saying the schedule had taken it. Meanwhile a bid placed AFTER the publish
 * was kept and the day flagged. The same two facts, opposite outcomes, decided
 * only by which came first — the exact thing the owner's own rule was meant to
 * kill:
 *
 *   "Two different facts fighting → let both in, and flag the day."
 *
 * Put to him with both ways out spelled out; he chose "keep the bid and flag
 * the day, both ways".
 *
 * This SETS ASIDE the SECOND half of clash check B5 — "publishing is the door
 * that replaces an undecided bid, so undo of the publish brings the bid back".
 * (Its first half, "a bid made after the publish is refused at the bid door",
 * was already set aside the same day by `barsWrite`.) With nothing removed
 * there is nothing for an undo to bring back, which is a simplification rather
 * than a loss.
 *
 * The amber costs no machinery: the OIL credit lands on the day regardless
 * (`ingestDutyCredit`, the owner's "the credit always lands" ruling), and a
 * credit overlapping an undecided bid is already a `forbiddenPair`, so the day
 * flags itself and the warning list already names it. All this door does now
 * is TELL the admin at the moment of publishing, because the one thing the old
 * behaviour got right was that he found out immediately.
 *
 * Weekend and public holidays only, as before — weekday work never reaches the
 * war at all. Reads the RESOLVED issued snapshot, the same evidence the OIL
 * pass credits from. */
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/* A WORKED DAY THAT EARNS NOBODY ANYTHING SAYS SO (owner, 20 Sep 26 — "Yes i
   want a warning … At the moment you publish").
 *
 * His own case: a man on the SDO desk for a Sunday, the day published, no OIL.
 * The desk had no start and no end, so it measured nothing and minted nothing.
 * Correct, and silent — a man's leave balance short with no screen admitting
 * it. This is the backstop for anyone who published past the day's own warning
 * strip, which is where the cheap fix is (a blank desk costs nothing to fill
 * before signing; after publishing it costs an amendment).
 *
 * Weekends and public holidays only, and only from the RESOLVED ISSUED
 * snapshot — the same evidence the credit itself is drawn from, so the warning
 * can never disagree with the OIL. */
function oilBlindLine(iso: string, day: any, spans: Record<string, OilWork[]>): string | null {
  const blind = dayOilBlind(day)
  if (!blind.length) return null
  const earners = Object.values(spans).filter(sp => workSpans(sp).length).length
  const when = `${WEEKDAY_NAMES[weekday(iso)]} ${dm(iso)}`
  const { list, verb, desk } = blindDesks(blind)
  /* "the SDO desk has", but "the ground programme has" — the wrapper only fits
     a duty desk's bare role name (Fable, 21 Sep 26). */
  const desks = desk ? `the ${list} desk${blind.length > 1 ? 's' : ''} ${verb}` : `${list} ${verb}`
  /* "no USABLE times", for the same reason as the day's own warning (the
     follow-up code read, G1): a nought-minute standalone shift is on this list
     and it HAS two times typed on it. */
  return earners
    ? `${when}: ${desks} no usable times, so nobody on ${blind.length > 1 ? 'them' : 'it'} earns OIL`
    : `${when} earned nobody any OIL — ${desks} no usable times`
}

export function publishFlagsBids(di: number): void {
  const iso = labelToISO(DATES[di])
  /* THE `warHolding` TEST USED TO BE HERE, AND IT MADE THE BRANCH BELOW DEAD
     (Codex M8, 21 Sep 26). Returning on "no war" several lines before the code
     that handles a day no war covers meant that code could never run, so any
     repair written against it would have shipped nothing. The war is resolved
     further down, where it is actually needed. */
  if (!iso || !isNonWorkingISO(iso) || !dayApproved(di)) return
  const snap = daySnapOf(di, dayCurVer(di))
  if (!snap || !snap.d) return
  /* THE WARNING MUST READ THE SAME BLOCK THE MONEY DOES (Fable, 21 Sep 26 — the
     one caller left resolving a sentinel its own way). It used to walk the raw
     schedule and expand ALL AVAIL through the LIVE roster, knowing nothing about
     the day blanket, the event switches or the per-man decisions. So it could
     tell a scheduler that a man's leave bid now sat on published work when he
     had been taken off that event and no credit would ever land — sending him
     looking for a clash that did not exist — and its "earned nobody" sentence
     could be wrong under a blanket, where everyone has hours and nobody earns.
     A block-less snapshot is PROTECTED, so there is nothing to warn about. */
  const ev: OilEvidence | undefined = snap.d.oilev
  if (!ev) return
  const spans = oilEarnedWork(snap.d, ev)
  /* ONE MESSAGE, BOTH FACTS (Astra, 21 Sep 26). The strip at the foot of the
     screen is a single element whose text is REPLACED, so speaking twice in the
     same breath showed only the second — and the one that got swallowed was the
     silent-OIL warning, the whole point of the ruling. Both lines are collected
     and delivered together. */
  const lines: string[] = []
  const blindLine = oilBlindLine(iso, snap.d, spans)
  if (blindLine) lines.push(blindLine)
  const war = warHolding(rawState().wars, iso)
  /* amber, like the Inputs page's twin (N18, 21 Sep 26): this is a warning,
     not the face the app says "Saved" in. Both exits, because the day with
     no war is exactly the one a reader is least expecting a clash on. */
  if (!war) {
    /* AND NOW IT HAS SOMETHING TO SAY (owner's ruling D19, 22 Sep 26).
       Publishing is exactly the moment the scheduler expects the money to move,
       so it is the moment to tell him it cannot: no period holds this date, so
       there is nowhere for the credit to be written. The day's own warning list
       says the same thing and carries the way out. */
    lines.push(`there is no leave war period for ${iso.slice(0, 4)}, so no OIL can be earned for this day — create the period on the Leave War`)
    HOOKS.toast(lines.join(' · '), 'warn'); return
  }
  const said: string[] = []
  for (const [person, sp] of Object.entries(spans)) {
    const wins = workSpans(sp)
    if (!wins.length) continue
    for (const r of recsAt(war.recs, person, iso)) {
      if (r.kind !== 'request' || r.state === 'refused') continue
      if (!wins.some(w => overlaps(w, requestWin(r.code)))) continue
      said.push(`${cs(person)}'s ${r.code.replace(/\*/g, '')} bid on ${dm(iso)}`)
    }
  }
  if (said.length) lines.push(`${said.join(', ')} now sits on published work — the day is flagged, the bid is still live`)
  if (lines.length) HOOKS.toast(lines.join(' · '), 'warn')
}

/* [GLOBAL-UNDO] §6.6 — the Unpublish button's warn. Unpublishing a loaded-week day
   withdraws that day's weekend/holiday OIL credits on the Leave War (desiredOilCells
   skips an unapproved day); republish re-credits, so the gap is momentary. But if a
   person the day credits has already SPENT enough OIL that losing this credit would
   put their balance negative, a bid placed against it surfaces as a clash in the gap.
   True when withdrawing di's credit would push any credited person's OIL balance
   below zero — the "credits already bid against" case the button warns on. Read-only:
   safe to call from the click handler before running the forward unpublish. */
export function oilCreditBidAgainst(di: number): boolean {
  const iso = labelToISO(DATES[di])
  if (!iso) return false
  const { desired } = desiredOilCells()
  for (const [key, d] of desired) {
    const bar = key.indexOf('|')
    if (key.slice(bar + 1) !== iso) continue
    const person = key.slice(0, bar)
    /* [GLOBAL-UNDO] Fable#5 / Codex GU-P2-009 — only a credit that ACTUALLY LANDED as
       a Raptor-owned FO/HO cell can be withdrawn. A desired credit blocked by an
       existing manual cell (runOilPass returns a clash) never landed and is not in the
       balance, so counting it would falsely warn for anyone at a low balance. */
    const landed = rawState().wars.some(w => recsAt(w.recs, person, iso).some(r => r.kind === 'credit' && r.oil === 'auto' && r.code === d.code))
    if (!landed) continue
    /* ASK THE TRACKER'S OWN QUESTION, ON THE TRACKER'S OWN DATE (both
       reviewers, 21 Sep 26).
       It first asked `balanceOf`, which sums what every day earns and knows
       nothing about EXPIRY, while the tracker applies the squadron's policy —
       so the warning stayed silent while the tracker read zero. The first fix
       swapped the formula but measured AS OF THE DAY BEING UNPUBLISHED, which
       reports every credit that was alive back then as alive now, and left the
       same hole open a different way.
       And subtracting the credit's worth was never the right sum: expiry and
       FIFO are not linear. A credit that expired unused is worth nothing to
       take away, and removing a live one can strand a LATER debit that had
       drawn on it. So the ledger is rebuilt with that credit left out — the
       actual counterfactual — as of today, through the same `figureCtxOf()`
       the tracker reads, so the two cannot diverge on the figure OR the date.
       Only the SCHEDULE'S credit goes; an award on the same day stays in the
       balance and is none of this button's business (N16). */
    const without = oilLedgerOf(figureCtxOf(), person, c => c.date === iso && c.source === 'auto' && !c.manual)
    if (without.balance < 0) return true
  }
  return false
}

export function runOilPass(): void {
  if (SYNCING) return
  SYNCING = true
  try {
    const { desired, protectedDates } = desiredOilCells()

    /* Forward: land what the published schedule earns, with its work times.
       An unchanged credit writes nothing (ingestDutyCredit answers
       'confirmed'). A credit whose TIMES overlap leave, a medical or an
       undecided bid on that day is the clash — never placed (clash check B4;
       a credit beside a non-overlapping absence lands, so a worked Saturday
       morning + afternoon leave keeps its OIL). */
    for (const [key, { code, why, spans, via }] of desired) {
      const at = key.indexOf('|')
      const person = key.slice(0, at)
      const date = key.slice(at + 1)
      if (!warHolding(rawState().wars, date)) continue
      ingestDutyCredit(person, date, code, why, spans, via)
    }

    /* Reverse: a GENERATED credit no published work still earns goes. Only
       `auto` credits — a hand-typed one is the admin's (design §18 OA3-003). */
    for (const war of rawState().wars) {
      for (const [person, row] of Object.entries(war.recs)) {
        for (const [date, list] of Object.entries(row)) {
          if (!list.some(r => r.kind === 'credit' && r.oil === 'auto')) continue
          if (protectedDates.has(date)) continue          // issued evidence unavailable → the landed credit stands (P2-IMPL-01)
          if (desired.has(`${person}|${date}`)) continue
          clearRaptorCell(person, date)
        }
      }
    }

    /* The strip is DERIVED from the day views, and only from them (20 Sep 26).
       Since the owner's ruling the credit always lands, so a credit that
       overlaps an absence IS a conflict on the day and `publishLeaveClashes`
       finds it — with the record it actually clashes with. The second list
       this pass used to keep alongside it read the day's BOX instead, which
       after the credit landed said the day held … the credit, giving the strip
       "earns FO but 18 Jul holds FO". One list, derived, no duplicate.
       It must run AFTER the credits are written, or it re-derives the world as
       it was before this pass. */
    publishLeaveClashes()
  } finally {
    SYNCING = false
  }
}

/* ---- wire 0 upkeep: the roster stays a live projection ------------------- */

/* A stable signature of the roster, so a re-projection that changed nothing
   does not churn a re-render. Every projected field is in it; the order is
   `projectPeople`'s own, which is deterministic. */
/**
 * Re-project Raptor's PEOPLE onto the Leave War roster (owner, 18 Aug 26 —
 * "when I add personnel through quals, the new personnel will appear on leave
 * war too"). The roster is a boot-time projection; without this a body added
 * on the Quals page mid-session never reached Leave War, and reload no longer
 * helps now the app is session-only. (A person is added on Admin → Users since
 * [ACCOUNTS-NEW-PERSON], 26 Sep 26 — D217; the projection is the same.)
 *
 * ADDITIONS AND REMOVALS ONLY. A body Quals gains is appended; a body it loses
 * is dropped; every EXISTING person's record is left exactly as it is. This is
 * deliberate: it lands the owner's ask (a new person shows up) without the
 * reconciler overwriting an in-session edit an admin made through Leave War's
 * own person sheet (`setPerson` — seat / band / SXO) or the demo overlay's
 * posting dates, which a wholesale re-projection silently reverted on the next
 * Raptor notify. A field change to an EXISTING person on the Quals page
 * therefore reaches Leave War on the next reload rather than live — the rare
 * case, and the safe direction to err. Writes only when the set of ids
 * actually changed, so an ordinary leave edit does not repaint the grid; the
 * hand-order and personnel labels are keyed by id, so they reconcile for free.
 */
function reprojectRoster(): void {
  const st = getState()
  // showSans is the owner's SANS enable switch (store.ts:setShowSans): the
  // projection drops SANS aircrew unless it is on.
  const projected = projectPeople(st.showSans)
  const curById = new Map(st.people.map(p => [p.id, p]))
  const edits = st.personEdits
  // Raptor owns identity (store.ts §setPeople), so take each person fresh from
  // the projection — that is what carries a Quals change (a new SXO mark, a CAT
  // move, a seat swap, a re-callsign) through to Leave War on the next notify,
  // which the old additions/removals-only pass never did (owner, 18 Aug 26 —
  // an SXO marked in Quals did not show here). Then lay back the two things
  // Leave War owns locally: the posting-out window (from/to), and any
  // deliberate setPerson override an admin made in this session. A person Raptor
  // no longer has drops out — they are simply absent from `projected`.
  const next: any[] = projected.map(pp => {
    const ex = curById.get(pp.id)
    const merged: any = { ...pp, ...(edits[pp.id] || {}) }
    if (ex) { merged.from = ex.from; merged.to = ex.to; merged.poArchive = ex.poArchive }
    return merged
  })
  // A POSTED-OUT person stays on the war after their Raptor body is archived
  // (owner, 19 Aug 26 — "their data will still be kept on the previous
  // schedules… nothing will be altered"): the auto-archive pass below (and
  // the Quals ✕) takes them out of the projection, but their leave history is
  // still what the past months show, and the month-window row filter is what
  // hides them from the months after they left. So an existing person with a
  // posting-out window who dropped out of `projected` is KEPT, identity
  // frozen as last projected. A body archived WITHOUT a posting-out window
  // still leaves at once — that ✕ means "should never have been here", and
  // the old exclusion behaviour stands for it.
  const nextIds = new Set(next.map(p => p.id))
  for (const p of st.people) {
    if (!nextIds.has(p.id) && p.to !== null) next.push(p)
  }
  // Write only when a roster-visible field actually changed, so an ordinary
  // Raptor notify (a schedule edit touching no roster field) stays a cheap
  // no-op instead of thrashing the matrix on every keystroke.
  // scd/scn ride the signature so a Quals-page SC DAY / SC NIGHT tick — a
  // change no other field carries — still writes the roster and recounts the
  // SC team rows (owner, 19 Aug 26: quals edits must update the leave war).
  // The qualification catalogue rides the same reprojection (owner, 19 Aug
  // 26 — the counter form's chips must show a qualification the moment the
  // squadron adds one). Its own change guard, before the roster's early
  // return: the catalogue is derived from the same PEOPLE, but guarded
  // separately so neither write depends on the other having changed.
  const catalog = qualCatalogue()
  if (JSON.stringify(catalog) !== JSON.stringify(st.qualCatalog)) setQualCatalog(catalog)
  // xq is sorted at projection, so an unchanged qual set compares equal here.
  const sig = (p: any) =>
    `${p.callsign}|${p.seat}|${p.band}|${p.sxo ? 1 : 0}|${p.q || ''}|${p.scd ? 1 : 0}|${p.scn ? 1 : 0}|${p.pers ? 1 : 0}|${p.label || ''}|${p.from || ''}|${p.to || ''}|${p.poArchive === undefined ? '' : p.poArchive ? 1 : 0}|${(p.xq || []).join(',')}`
  const before = new Map(st.people.map(p => [p.id, sig(p)]))
  const unchanged = before.size === next.length && next.every(p => before.get(p.id) === sig(p))
  if (unchanged) return
  setPeople(next)
}

/* ---- post-out auto-archive (owner, 19 Aug 26) ---------------------------- */

/**
 * Archive the Raptor body of anyone whose posting-out date has ARRIVED
 * (owner, 19 Aug 26 — "on that live date itself… under quals, they will go
 * into an archive section"). Keys on THREE things, each deliberate:
 *
 * - `to !== null` and today past it — `to` is the last day IN, so the PO date
 *   itself (to + 1) is the first day this fires.
 * - `poArchive === true` — the sheet's "Archive on PO date" switch, stored
 *   explicitly by setPostOut. A custom PO with the switch off never archives,
 *   and a `to` that predates the switch (the demo overlay's windows) is left
 *   alone rather than read as consent.
 * - the Raptor body exists and is not already archived — which is also what
 *   makes the second pass over an unchanged world a no-op, the same
 *   fixed-point property every reconciler here has.
 *
 * Archiving ONLY sets the flag: pucks on published and past schedules render
 * from the slot values and PEOPLE[id] is still there, so nothing a scheduler
 * issued changes — the body just leaves every roster surface, and the Quals
 * page's Archived section is where it lands. The person STAYS on the leave
 * war (reprojectRoster's keep rule) so the months before they left still
 * show their history.
 */
export function runPoArchive(): void {
  if (SYNCING) return
  const st = getState()
  const today = localToday()   // local calendar date (engine/period.ts) — never UTC: a PO dated "today" must archive on the squadron's today
  const due = st.people.filter(p =>
    p.to !== null && p.poArchive === true && today > p.to &&
    (PEOPLE as any)[p.id] && !(PEOPLE as any)[p.id].archived && !(PEOPLE as any)[p.id].special)
  if (!due.length) return
  SYNCING = true
  try {
    for (const p of due) (PEOPLE as any)[p.id].archived = true
    // A body leaving the roster can change what the warnings say about the
    // lines it was on — the same reason the Quals ✕ re-validates.
    validate()
    // [CMDL-FINISH] C10 — a RECONCILER write: a causally-chained projection, not a
    // stray user envelope (peopleStore's lagging baseline captures the flag flip
    // set just above when the projection advances it).
    persistPeopleProjection()
    raptorNotify()
  } finally {
    SYNCING = false
  }
}

/**
 * Put an archived body back on the roster — the Quals Archived section's
 * Restore (owner, 19 Aug 26: "in the future they post back into this sqn,
 * they can be re added easily"). Clears the Leave War posting-out FIRST:
 * restoring is "they are back", and a surviving window would hide their row
 * from every current month — and, with the archive switch on, re-archive
 * them on the very next pass. Quals, ticks and CAT were never touched by
 * archiving, so they come back exactly as they left.
 */
export function restoreArchivedPerson(id: string): boolean {
  /* Write-path role backstop (bug hunt, 31 Aug 26): roster membership —
     archive and restore alike — is the admin's (the Quals page renders
     Restore for an admin only, and now draws the archive ✕ the same way).
     The commitInputEdit idiom: a signed-in non-admin is refused here too,
     so a hand-made call cannot do what the page will not offer; a
     sessionless test/boot context is not a member and passes. */
  if (!mayManageRoster()) return false
  const body = (PEOPLE as any)[id]
  if (!body || !body.archived || body.special) return false
  // [CMDL-FINISH] C10 — ONE command for the whole cross-seam gesture: setPostOut
  // (an LW write that child-joins) + the archived flip + the people persist, so a
  // single click is a single envelope, not a stray lw.edit + a stray people.edit.
  commitPeopleEdit(() => {
    setPostOut(id, null)
    body.archived = false
    validate()
  })
  raptorNotify()
  return true
}

/* ---- wiring -------------------------------------------------------------- */

/**
 * Boot the sync: one full pass now (inbound first, so Raptor's inputs are on
 * the grid before the grid answers back), then both stores are subscribed.
 * Each notification runs the near pass first and the far pass after it, so
 * a change on either side converges in one turn — including the ones the
 * reconcilers cannot see coming, like an Undo that removes an lw-tagged row.
 * Both passes are cheap no-ops when nothing they read has changed.
 */
/* THE PROBE PIN — the developer's-PC bridge only (probe-bridge.ts w.lwSetViewer, which is
   never installed on a deployed host). The Leave War's MECHANICS e2e drive rows as nobody in
   particular (null: canEditRow imposes no row rule) or as a named person; since [ACCOUNTS]
   the mirror below re-derives the viewer from the signed-in person on EVERY Raptor notify,
   so a plain setViewer from the bridge was overwritten by the next repaint (53 e2e failures,
   26 Sep 26). A pin holds for the sign-in it was set in and no longer: it is keyed to the
   SESSION object, which resetSession replaces at every sign-in and sign-out, so no pin can
   outlive the person who set it. No production caller. */
let VIEWER_PIN: { v: string | null; s: unknown } | null = null
export function pinViewer(v: string | null): void { VIEWER_PIN = { v, s: SESSION }; setViewer(v) }
const mirroredViewer = (): string | null => (VIEWER_PIN && VIEWER_PIN.s === SESSION ? VIEWER_PIN.v : viewerId())
/* and the signed-in person's callsign beside it, read off Raptor's whole roster (the war's own
   roster may not hold him — a SANS or archived callsign): the approver stamp's fallback */
const mirrorCallsign = (): void => { const m = me(); setViewerCallsign(m && (PEOPLE as any)[m] ? (PEOPLE as any)[m].cs : null) }

export function wireLeaveWarSync(): void {
  /* The VIEWING PERSON rides this same wire (owner, 17 Aug 26 — the matrix
     lights the viewer's row and the counter picker answers with their
     numbers). Since [ACCOUNTS] (D166 (4), 26 Sep 26) it is the SIGNED-IN person —
     "View as" is retired — read through state/perms.ts viewerId(): his person, or ''
     (matches NO row) for a guest, a pending person or an account switched off, and
     null only with no session. Pushing it here — once at boot, again on every Raptor
     notify below — keeps the mirror converged without a new seam; setViewer no-ops on
     a same value. */
  setViewer(mirroredViewer()); mirrorCallsign()
  /* the absence door — the war's changes to approved leave (design §5.2) */
  installAbsenceDoor()
  runPoArchive()
  refreshAbsences(true)
  absencesChanged()
  runOilPass()
  lastOilDaySig = oilDaySig()
  raptorSubscribe(() => {
    setViewer(mirroredViewer()); mirrorCallsign()
    // Before the passes: a body added on the Quals page must be on the roster
    // before inbound tries to land any of its leave (owner, 18 Aug 26).
    reprojectRoster()
    // [CMDL-FINISH] M3 — coalesce an IDLE multi-cell reconcile (week-nav
    // loadWeek→runOilPass crediting K cells) into ONE lw.sync projection. A no-op
    // when this callback runs at phase 8 (the committing lane coalesces on its own).
    /* design §4.1 order: roster, then the absence index (fresh before the OIL
       pass reads the merged day), then the passes */
    if (refreshAbsences()) absencesChanged()
    lwSyncTurn(() => { runPoArchive(); runOilPass() })
    lastOilDaySig = oilDaySig()
  })
  lwSubscribe(() => {
    /* The showSans switch (store.ts:setShowSans) is a Leave War write, so the
       re-projection that makes it take effect must run on THIS lane too — the
       Raptor lane alone would leave the toggle dead until some unrelated
       schedule edit happened to notify. Safe against its own echo: the write
       it makes (setPeople) re-fires this callback, and the signature compare
       inside reprojectRoster then finds nothing changed and stops. */
    reprojectRoster()
    /* A post-out placed just now (setPostOut is a Leave War write) archives on
       this lane too, so a PO dated in the past takes effect the moment it is
       set rather than waiting for a Raptor edit to happen along.
       [CMDL-FINISH] M3 — coalesced into ONE lw.sync projection when this lane runs
       at idle (a view-only setter waking the reconcilers writes nothing and emits
       nothing; a setShowSans that changes OIL cells emits one envelope). */
    /* the war's own records changed (a bid, a refusal, a credit): the clash
       strip is derived from them too (design §19 OA4-003) */
    publishLeaveClashes()
    lwSyncTurn(() => {
      runPoArchive()
      /* The OIL pass reads Leave War too — a PH flag set, an event word tagged
         "off day", a war created over the loaded week — so a Leave War change
         can change what a published Saturday earns. */
      runOilPass()
    })
    /* And the same change can create a PENDING OIL QUESTION out of thin air
       (owner, 28 Aug 26): mark a PH after an input already covers that day
       and the applicable user must be told. Nothing on the RAPTOR side
       repaints on a Leave War write, so the bell would stay dark until an
       unrelated schedule edit happened along — the confirmed missing-notify
       gap. A raptor notify is fired ONLY when the pending picture actually
       changed (a signature over every person's pending iid|iso pairs, the
       reprojectRoster change-guard idiom), so this lane's own echo finds an
       unchanged signature and the loop terminates. */
    /* Skipped mid-pass (bug pass, 28 Aug 26): the reconcilers' own per-cell
       store notifies re-fire this callback while SYNCING holds — the passes
       above all return at the door, and recomputing the signature once per
       ingested cell of a long leave span is pure waste. The top-level
       notify that follows the writer's finish runs it exactly once. */
    if (SYNCING) return
    /* A WAR CHANGE THAT MOVES WHAT A DAY OF THE LOADED WEEK EARNS RE-CHECKS THE SCHEDULE
       ([HUMAN-RETEST] amendment re-test, walk W4-F1, 24 Sep 26; register AM47 — D2: a holiday
       declared after publication waits for a republication AND THE DAY SAYS SO). The saying
       is the schedule's own advisory (validate.ts: OIL_STALE_DAY / OIL_STALE_HOLIDAY /
       OIL_NO_PERIOD / OIL_UNPUBLISHED), and nothing re-ran the checks on a Leave War write — so
       the day read an unexplained "1 pending" until a reload. Guarded like the pending
       signature below: only when the war's answer for some loaded day actually changed, so
       this lane's own echo (the raptor notify → the passes → a war write) finds nothing new. */
    const ods = oilDaySig()
    if (ods !== lastOilDaySig) { lastOilDaySig = ods; validate(); raptorNotify() }
    const sig = INPUTS
      .filter((r: any) => oilAsks(r.type) && r.acc !== 'r' && r.iid)
      .flatMap((r: any) => {
        const answered = (r.oil ?? {}) as Record<string, number>
        return oilAskPlan(r).filter(p => answered[p.iso] == null).map(p => `${r.iid}|${p.iso}`)
      })
      .sort().join(';')
    if (sig !== lastPendingSig) { lastPendingSig = sig; raptorNotify() }
  })
}
/* the last pending-OIL signature the lw lane saw — module state, compared
   before the cross-lane notify above so it can never ping-pong */
let lastPendingSig: string | null = null
/* what the schedule's checks read from the war about the LOADED week: which days can earn
   (the weekend, a PH; an Off day does not) and which have no period to earn into — the facts
   behind the OIL advisories. One string per day, compared by the lw lane above. */
function oilDaySig(): string {
  return DAYS.map((_: any, di: number) => `${HOOKS.oilEarningDay(di) ? 1 : 0}:${HOOKS.oilNoPeriod(di) || ''}`).join('|')
}
let lastOilDaySig: string | null = null
