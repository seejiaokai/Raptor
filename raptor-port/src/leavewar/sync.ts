// Wires 1 + 2 of the Leave War ⇄ Raptor sync
// (docs/superpowers/specs/leavewar-sync.md): approved leave crosses to the
// schedule as a personal input, and leave filed on the Inputs page crosses
// back as an approved, Raptor-owned cell. Since 17 Aug 26 the four MEDICAL
// markers ride the same two wires (owner: "these will be connected to the
// inputs") — an ATT B / ATT C / HL / OML input lands as a raptor-owned
// medical cell (half days per medRowPortion's six-hour rule), and a marker
// the admin writes on the grid lands as an lw-tagged input, no approval
// step because medical is assigned, not bid.
//
// Both directions are DERIVED RECONCILIATION, not queues: each pass computes
// the desired state from the source of truth, diffs it against what the
// other side holds, and writes only the difference. A queue would be a
// second record of a fact the grid / INPUTS already hold, and two records of
// one fact disagree. Idempotence follows for free — a second pass over an
// unchanged world finds an empty diff and touches nothing, history included.
//
// The loop cannot run away, by construction rather than by counter:
//   - outbound skips Raptor-owned cells (outboundToRaptor's documented rule),
//   - inbound skips lw-tagged inputs (the rows outbound itself wrote),
// so each direction is blind to the other's writes, and one full pass
// reaches a fixed point. A SYNCING flag guards re-entrancy on top — every
// store write notifies subscribers synchronously, and this module is one.

import { INPUTS, DATES, baseYear, dateOrd, inpId, inpWin, isAway, isDownchit, isLeave, oilAsks, withRemarksTail } from '../engine/inputs'
import { ME } from '../state/auth'
import { docFields, rowDocIds } from '../state/docs'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { dayApproved, dayCurVer, dayCurVerIn, daySnapIn, daySnapOf } from '../engine/publish'
import { dayOilSpans, inputOilAmt, envMin, uniformOil } from '../engine/oil'
import { stashKeys, stashGet } from '../engine/weekstash'
import { CURWEEK } from '../engine/waves'
import { validate } from '../engine/validate'
import { notify as raptorNotify, subscribe as raptorSubscribe, writeInputsBatch } from '../state/store'
import {
  addDays,
  columnKindFor,
  inSquadron,
  isWeekend,
  outboundToRaptor,
  parseCell,
  raptorOwns,
  warHolding,
  type Portion,
} from './engine'
import {
  clearRaptorCell,
  getState,
  ingestDutyCredit,
  ingestFromRaptor,
  setPeople,
  setPostOut,
  setQualCatalog,
  setViewer,
  subscribe as lwSubscribe,
  withdrawLeaveCell,
} from './state/store'
import { projectPeople, qualCatalogue } from './state/raptorRoster'

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

/* 'Feb 11' -> '2026-02-11', through dateOrd so the two directions cannot
   disagree about what a label means. Null for anything unreadable. `yr` is
   the ROW'S anchor year (engine/inputs.ts, 24 Aug 26) — a bare label on an
   input belongs to the year the row was created under, not to whatever week
   Raptor happens to have loaded when the sync runs. */
function labelToISO(lbl: unknown, yr?: unknown): string | null {
  const ord = dateOrd(lbl, yr)
  if (ord == null) return null
  const p = (n: number) => String(n).padStart(2, '0')
  return `${Math.floor(ord / 10000)}-${p(Math.floor(ord / 100) % 100)}-${p(ord % 100)}`
}

/* Which portion of the day an input row covers. allday and the two half
   presets are exact; a CUSTOM window rounds OUT to the halves it touches
   (a 10:00–14:00 leave covers both, so it reads as the full day) — rounding
   out never under-reports an absence, and the schedule keeps the exact
   window. The half minutes are HALF_AM/HALF_PM's own: [0,720] / [721,1439].
   A thin row with neither flag nor times fails closed to the whole day,
   the same call inpWin itself makes. */
function rowPortion(row: any): Portion {
  if (row.allday) return 'full'
  if (row.half === 'am') return 'am'
  if (row.half === 'pm') return 'pm'
  if (row.s != null && row.e != null) {
    const w = inpWin(row)
    if (w) {
      if (w[1] <= 720) return 'am'
      if (w[0] >= 721) return 'pm'
    }
  }
  return 'full'
}

/* A MEDICAL row's portion runs on the owner's own rule instead (17 Aug 26):
   AM/PM are the halves, and a CUSTOM window — "which they should not" file,
   but the form allows — counts as a half day at six hours or less ("6 hours
   or less as half day"; exactly six is a half) and a full day past that.
   Which half: the side of noon the window sits on, its midpoint deciding a
   straddler. Leave keeps its round-OUT rule above untouched — the owner
   stated this one for the medical types. */
function medRowPortion(row: any): Portion {
  if (row.allday) return 'full'
  if (row.half === 'am') return 'am'
  if (row.half === 'pm') return 'pm'
  if (row.s != null && row.e != null) {
    const w = inpWin(row)
    if (w && w[1] - w[0] <= 360) {
      if (w[1] <= 720) return 'am'
      if (w[0] >= 721) return 'pm'
      return (w[0] + w[1]) / 2 <= 720 ? 'am' : 'pm'
    }
  }
  return 'full'
}

/* The type vocabulary bridge. Raptor's INPUT_META spells the markers as a
   person types them ('ATT B', 'ATT C', 'HL', 'OML'); Leave War stores them
   spaceless ('ATTB', 'ATTC') so parseCell's trim/upper round-trips. Leave
   types are spelled identically on both sides, so they map through
   untouched. */
const LW_FOR_INPUT: Record<string, string> = { 'ATT B': 'ATTB', 'ATT C': 'ATTC', HL: 'HL', OML: 'OML' }
const INPUT_FOR_LW: Record<string, string> = { ATTB: 'ATT B', ATTC: 'ATT C' }
const lwTypeOf = (rawType: unknown): string => {
  const t = String(rawType).trim().toUpperCase()
  return LW_FOR_INPUT[t] ?? t
}

/* ---- outbound: Leave War -> Raptor inputs -------------------------------- */

/** One Raptor input the sync wants to exist: a run of consecutive days with
 *  the same code and portion, for one person, inside one war. */
interface Run {
  person: string
  type: string
  portion: Portion
  start: string
  end: string
  warId: string
}

/* Every approved, biddable, non-Raptor-owned cell in every war — the
   question outboundToRaptor already answers per war, in stable person-then-
   date order — collapsed into spanned runs, matching how a human files
   leave. Runs never cross wars: the lw tag is the war's id. */
function desiredRuns(): Run[] {
  const runs: Run[] = []
  const { wars, people } = getState()
  const known = new Set(people.map(p => p.id))
  for (const war of wars) {
    for (const c of outboundToRaptor(war.grid, war.states)) {
      /* The mirror of inbound's unknown-person guard: a grid row keyed to
         someone the roster does not hold (a stored war from before the
         demo re-key, say) must not become an input for a person Raptor's
         own pages cannot name. */
      if (!known.has(c.personId)) continue
      const cell = parseCell(c.code)
      if (!cell) continue
      const last = runs[runs.length - 1]
      if (
        last && last.warId === war.period.id && last.person === c.personId &&
        last.type === cell.type && last.portion === cell.portion &&
        addDays(last.end, 1) === c.date
      ) {
        last.end = c.date
        continue
      }
      runs.push({
        person: c.personId, type: cell.type, portion: cell.portion,
        start: c.date, end: c.date, warId: war.period.id,
      })
    }
  }
  return runs
}

/* The canonical signature both sides reduce to. person|code|portion|start|end
   is the whole identity of a synced input — remarks, mod and iid are
   bookkeeping, and the warId cannot differ for the same dates because wars
   never overlap. */
const runSig = (r: Run) => `${r.person}|${r.type}|${r.portion}|${r.start}|${r.end}`

/* Signatures of lw rows whose war cells RAPTOR ITSELF withdrew (an edit or
   delete of the input ran retractLwRow). If a row with such a signature turns
   up lw-tagged and stale again, it did not sneak past the retraction — a
   HISTORY RESTORE (undo) brought it back, and the war, which has no history
   of its own, still lacks the cells. Splicing it again would turn Undo into a
   double delete on both sides (27 Aug 26 overnight find); it is DEMOTED to an
   ordinary Raptor-owned input instead. A fresh mint of the same signature
   clears the entry, so a later WAR-side revocation of the re-approved leave
   splices exactly as before. Session-only, like both stores. */
const RETRACTED = new Set<string>()
/* The member's own remark wording (and a medical row's document id), kept
   ACROSS passes keyed by the exact leave. The in-pass carry below handles a
   date change; this survives a refuse-then-re-approve, where the splice and
   the re-mint happen in different passes and the in-pass maps are empty. */
const RETAINED = new Map<string, { remarks: string; docIds?: string[] }>()

/* One dispatcher so every reader of a row's portion picks the right rule by
   the row's own type — a medical row must never be read with leave's
   round-OUT rule or the two sides of the diff would disagree about the same
   row. */
const portionOfRow = (row: any): Portion => (isDownchit(row.type) ? medRowPortion(row) : rowPortion(row))

/* Exported so the Inputs-page editor can ask "does this edit change the leave
   itself, or only its remarks?" — a remarks-only edit leaves this signature
   unchanged, and commitInputEdit keeps such a row synced instead of retracting
   it (owner, 18 Aug 26: refining an OL's remarks must not seize the leave from
   Leave War, which does not show remarks anyway). */
export function rowSig(row: any): string | null {
  const start = labelToISO(row.date, row.yr)
  if (!start) return null
  const end = row.endDate ? labelToISO(row.endDate, row.yr) ?? start : start
  /* lwTypeOf, so an 'ATT C' row and the ATTC run it mirrors reduce to the
     same signature — the two vocabularies must meet in ONE for the diff to
     see them as the same fact. */
  return `${row.person}|${lwTypeOf(row.type)}|${portionOfRow(row)}|${start}|${end}`
}

export function runOutbound(): void {
  if (SYNCING) return
  SYNCING = true
  try {
    const want = new Map(desiredRuns().map(r => [runSig(r), r]))
    const have = new Set<string>()
    const stale: any[] = []
    for (const row of INPUTS) {
      if (!row.lw) continue
      const sig = rowSig(row)
      if (sig && want.has(sig) && !have.has(sig)) have.add(sig)
      else stale.push(row)
    }
    const missing = [...want].filter(([sig]) => !have.has(sig)).map(([, r]) => r)

    /* An empty diff must not touch anything — writeInputsBatch ends in a
       history push, and a no-op pass that left a snapshot behind would make
       every unrelated edit cost two Undos. */
    if (stale.length === 0 && missing.length === 0) return

    /* ONE batch, one history step, exactly like a human filing the same
       leave: the epilogue (re-render, reflow, snapshot) comes free. NOT
       acceptInput — leave is isUnavail and that path hard-refuses it by
       design; the input existing is what reaches every schedule surface. */
    writeInputsBatch(() => {
      /* When a leave's DATES change (an admin extends it in Leave War), its
         old row is stale and a new run is missing — a remove-then-mint. Carry
         the member's own remark detail across that gap keyed on the unchanging
         part of the leave (person|type|portion), so "till 13 Jul Bangkok"
         becomes "till 18 Jul Bangkok" rather than losing Bangkok (owner,
         18 Aug 26 — the same "the note remains, the date moves" rule the Inputs
         calendar now follows). withRemarksTail rewrites just the date token in
         whatever the member wrote. */
      const priorRemark = new Map<string, { remarks: string; docIds?: string[] }>()
      /* keyed WITHOUT the portion, as the fallback (review fix, 19 Aug 26):
         converting a full-day leave to a half day moves the exact key from
         'p|OL|full' to 'p|OL|am', so the lookup missed and the member's own
         detail ("Bangkok") was silently dropped — the very loss the date-change
         carry above exists to prevent. The exact key still wins where it
         matches, so two same-type leaves with different portions carry their
         own remarks; only an unmatched portion falls back to the person+type's
         first stale remark, which beats losing the words. */
      const priorLoose = new Map<string, { remarks: string; docIds?: string[] }>()
      for (const row of stale) {
        const sig = rowSig(row)
        /* the undo case — see RETRACTED above: Raptor retracted this row's
           cells itself, so its lw-tagged reappearance is a history restore.
           Demote, never re-splice: the tag drops, the row is an ordinary
           input again, and inbound re-lands it as Raptor-owned cells. */
        if (sig && RETRACTED.has(sig)) {
          RETRACTED.delete(sig)
          delete row.lw
          continue
        }
        const t = lwTypeOf(row.type)
        /* the document ids ride the carry with the remarks (27 Aug 26
           overnight find: a war-side date change on a synced medical row
           spliced the old row and minted afresh — certificate gone). The
           FULL list since 1 Sep 26 — an entry holds several files now, and
           a date change must not thin them to one. */
        const keptIds = rowDocIds(row)
        const kept = { remarks: String(row.remarks ?? ''), ...(keptIds.length ? { docIds: keptIds } : {}) }
        const key = `${row.person}|${t}|${portionOfRow(row)}`
        if (!priorRemark.has(key)) priorRemark.set(key, kept)
        const lk = `${row.person}|${t}`
        if (!priorLoose.has(lk)) priorLoose.set(lk, kept)
        if (sig) RETAINED.set(sig, kept)
        const ix = INPUTS.indexOf(row)
        if (ix >= 0) INPUTS.splice(ix, 1)
      }
      for (const r of missing) {
        const sig = runSig(r)
        const prior = priorRemark.get(`${r.person}|${r.type}|${r.portion}`)
          ?? priorLoose.get(`${r.person}|${r.type}`)
          ?? RETAINED.get(sig)
        /* a fresh mint supersedes whatever history the same leave had */
        RETAINED.delete(sig)
        RETRACTED.delete(sig)
        const row: any = {
          person: r.person,
          /* Back to Raptor's own spelling — an 'ATTB' run lands as an
             'ATT B' input, the type the Inputs page and INPUT_META know. */
          type: INPUT_FOR_LW[r.type] ?? r.type,
          date: isoToLabel(r.start),
          /* the anchor year every creation path stamps (engine/inputs.ts,
             24 Aug 26) — isoToLabel leaves baseYear()'s year implicit, and
             this is what reads it back once the loaded week moves on */
          yr: baseYear(),
          /* The remarks read "till 17 Jul" for a span, "on 15 Jul" for a
             single day — the same tail the Inputs-page calendar writes, so a
             synced leave says how long it runs wherever remarks are read, and
             the type column already carries LL/OL so nothing repeats it
             (owner, 18 Aug 26). A member then refines this on the Inputs page
             — "in Bali till 17 Jul" — and reconciliation preserves it: remarks
             are not in the signature, so an unchanged leave is matched, not
             re-minted; and when the DATES change, `prior` above carries the
             detail into the re-minted row with only the date token moved. */
          remarks: withRemarksTail(prior?.remarks ?? '', r.start, r.end, 'on'),
          mod: 'now',
          /* The ownership tag: which war this row is derived from. Inbound
             skips lw-tagged rows (the loop-breaker), and reconciliation
             removes exactly these when their cell is no longer approved.
             An extra field on the row — inpKey does not include it and
             nothing downstream reads fields it does not know. */
          lw: r.warId,
        }
        /* the carried documents follow their record (a leave's `prior`
           never carries the field) — through docFields, the one minter of
           the docId/docIds pair */
        if (prior?.docIds) Object.assign(row, docFields(prior.docIds))
        if (r.end !== r.start) row.endDate = isoToLabel(r.end)
        if (r.portion === 'full') row.allday = true
        else {
          row.allday = false
          row.half = r.portion
          row.s = r.portion === 'am' ? 0 : 721
          row.e = r.portion === 'am' ? 720 : 1439
        }
        /* Minted inside the write, so the very first history snapshot the
           row appears in already carries its address (the mintInpIds rule). */
        inpId(row)
        INPUTS.push(row)
      }
    })
  } finally {
    SYNCING = false
  }
}

/**
 * Withdraw the war cells an lw-tagged input derives from — what makes an
 * EDIT or DELETE of that row on the Inputs page carry back into Leave War
 * (owner, 17 Aug 26: "make sure both leave war and input, edits or deletes
 * are sync"; full two-way, members included, chosen over blocking).
 *
 * Called by `commitInputEdit` / `removeInput` (ui/inputedit.tsx) BEFORE the
 * row is mutated or spliced, while it still says what the war granted. Each
 * covered day's cell is cleared through `withdrawLeaveCell`, which touches
 * only a cell still holding exactly this row's notation and never one
 * Raptor owns — so a cell the squadron has since rebid, and every
 * Raptor-owned cell, are left for the ordinary reconcile to judge.
 *
 * The reconcilers then finish the job on their own: a DELETED row leaves
 * nothing behind on either side (the cells are gone, so outbound re-mints
 * nothing); an EDITED row has its lw tag dropped by the caller and becomes
 * an ordinary input, which inbound lands as Raptor-owned cells — the same
 * path a leave filed on the Inputs page has always taken, keeping "Raptor
 * owns what Raptor last wrote" true.
 *
 * SYNCING is held across the walk because withdrawLeaveCell persists-and-
 * notifies per cell, and each notify would otherwise run a reconcile pass
 * against a half-withdrawn span. The caller's own write epilogue triggers
 * the full converging pass once everything is settled.
 */
export function retractLwRow(row: any): void {
  if (!row?.lw) return
  const start = labelToISO(row.date, row.yr)
  if (!start) return
  /* Remember that RAPTOR withdrew this leave's cells — the mark that lets a
     history restore of this row read as an undo (demoted) rather than as a
     war-side revocation (spliced). See RETRACTED at the top. */
  const sig = rowSig(row)
  if (sig) RETRACTED.add(sig)
  let end = row.endDate ? labelToISO(row.endDate, row.yr) ?? start : start
  if (end < start) end = start
  const type = lwTypeOf(row.type)
  const portion = portionOfRow(row)
  const notation = portion === 'am' ? `*${type}` : portion === 'pm' ? `${type}*` : type
  const was = SYNCING
  SYNCING = true
  try {
    /* Capped walk, the runInbound precedent: a malformed span cannot spin. */
    let n = 0
    for (let d = start; d <= end && n < 400; d = addDays(d, 1), n++) {
      withdrawLeaveCell(row.person, d, notation)
    }
  } finally {
    SYNCING = was
  }
}

/* The Raptor leave INPUT a war cell derives from — the row whose remarks the
   published-stage editor edits (owner, 27 Aug 26). Covers both a leave FILED
   on the Inputs page (raptor-owned in the war) and one BID in the war (the
   lw-tagged row outbound mints at publish): both are ordinary INPUTS rows and
   both carry the remark. Same date arithmetic as `inputCoversDate`, on the
   war cell's ISO date. Leaves only — medical is management's, filed and read
   on the Inputs page.

   `code` is the CELL'S OWN notation, when the caller has it: a leave clash
   keeps two inputs alive over one day (an approved LL minted lw-tagged plus
   an OL filed on the Inputs page), and the plain first-covering-row walk
   returned whichever sat earlier in INPUTS — the editor then opened, and
   SAVED, the wrong record under the tapped cell's header. With the code the
   match is the row that actually derives the cell: same leave type, exact
   portion when one matches, and the lw-tagged row (the one the war minted)
   outranking a plain one. A code that is not a leave at all (an FO/HO duty
   credit) matches nothing — that cell has no note to edit. Callers without
   a cell in hand keep the date-only walk. */
export function leaveInputAt(personId: string, iso: string, code?: string): any | null {
  const t = dateOrd(isoToLabel(iso))
  if (t == null) return null
  const covering: any[] = []
  for (const row of INPUTS) {
    if (row.person !== personId || !isLeave(row.type)) continue
    const a = dateOrd(row.date, row.yr)
    if (a == null) continue
    const b = row.endDate ? dateOrd(row.endDate, row.yr) : a
    if (b == null) continue
    if (t >= a && t <= b) covering.push(row)
  }
  if (covering.length === 0) return null
  const cell = code ? parseCell(code) : null
  if (!cell) return covering[0]
  const typed = covering.filter(r => lwTypeOf(r.type) === cell.type)
  if (typed.length === 0) return null
  const exact = typed.filter(r => portionOfRow(r) === cell.portion)
  const pool = exact.length ? exact : typed
  return pool.find(r => r.lw) ?? pool[0]
}

/* ---- inbound: Raptor inputs -> Leave War cells --------------------------- */

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
let OIL_CLASHES: SyncClash[] = []
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
  const next = [...LEAVE_CLASHES, ...OIL_CLASHES]
  /* A clash that did not change must not repaint the strip: the passes run on
     every Raptor notify, and the common case is "still the same clashes". */
  if (JSON.stringify(next) === JSON.stringify(CLASHES)) return
  CLASHES = next
  clashVersion += 1
  for (const fn of clashListeners) fn()
}

export function runInbound(): void {
  if (SYNCING) return
  SYNCING = true
  try {
    const { people, wars } = getState()
    const known = new Set(people.map(p => p.id))

    /* The desired cells: every NON-lw leave OR medical input, one entry per
       covered day. person|isoDate -> code-with-portion. Medical joined
       17 Aug 26 ("if I apply on inputs, it will auto populate on the leave
       war") — same wire, same ownership, only its portion rule differs
       (medRowPortion's six-hour half). */
    /* Per person|day, gather each covering input's contribution — the AM
       half, the PM half, a full day — so that TWO rows covering one day
       combine instead of the first silently winning (bug sweep, 18 Aug 26:
       an AM local-leave + a PM off-in-lieu used to land only the first, so a
       same-type split under-drew half a day and a different-type split lost a
       whole half with nothing flagged). A Leave War cell holds one code, so:
       two halves of the SAME type make a full day; a full day subsumes a
       matching half; a genuinely un-representable pair (two different half
       types, or a half whose type differs from a full day) lands the AM one
       and raises a CLASH rather than dropping the other in silence. */
    const parts = new Map<string, { am?: string; pm?: string; full?: string }>()
    for (const row of INPUTS) {
      if (row.lw) continue // the loop-breaker: rows this module itself wrote
      if (!isLeave(row.type) && !isDownchit(row.type)) continue
      /* A person Leave War does not know (the seed's j_lee, say) would
         become an invisible grid row no matrix draws — skip rather than
         write a cell nobody can see or clear. */
      if (!known.has(row.person)) continue
      const start = labelToISO(row.date, row.yr)
      if (!start) continue
      let end = row.endDate ? labelToISO(row.endDate, row.yr) ?? start : start
      if (end < start) end = start
      const portion = portionOfRow(row)
      const type = lwTypeOf(row.type)
      /* Capped walk: a malformed span cannot spin the boot. 400 covers any
         legitimate year-crossing leave. */
      let n = 0
      for (let d = start; d <= end && n < 400; d = addDays(d, 1), n++) {
        /* Only dates inside some war are syncable — a war might simply not
           exist for that year. Skipped silently, per the spec. */
        if (!warHolding(wars, d)) continue
        const key = `${row.person}|${d}`
        const slot = parts.get(key) ?? {}
        // First-of-its-kind wins its half, matching the old first-wins order
        // for a genuine duplicate; the combining is across DIFFERENT halves.
        if (portion === 'am') { if (slot.am === undefined) slot.am = type }
        else if (portion === 'pm') { if (slot.pm === undefined) slot.pm = type }
        else { if (slot.full === undefined) slot.full = type }
        parts.set(key, slot)
      }
    }

    const desired = new Map<string, string>()
    const splitClashes: SyncClash[] = []
    for (const [key, slot] of parts) {
      const at = key.indexOf('|')
      const person = key.slice(0, at)
      const date = key.slice(at + 1)
      if (slot.full !== undefined) {
        desired.set(key, slot.full)
        for (const h of [slot.am, slot.pm]) {
          if (h !== undefined && h !== slot.full) splitClashes.push({ person, date, inputCode: h, bidCode: slot.full })
        }
      } else if (slot.am !== undefined && slot.pm !== undefined) {
        if (slot.am === slot.pm) desired.set(key, slot.am) // two halves, one type → a full day
        else { desired.set(key, `*${slot.am}`); splitClashes.push({ person, date, inputCode: slot.pm, bidCode: slot.am }) }
      } else if (slot.am !== undefined) desired.set(key, `*${slot.am}`)
      else if (slot.pm !== undefined) desired.set(key, `${slot.pm}*`)
    }

    /* Forward: land what Raptor holds. Already-synced cells are skipped so
       an unchanged world writes nothing (ingest would persist-and-notify).
       The split-clashes (a same-day pair the one-code cell cannot show) join
       the ingest clashes below on the same strip. */
    const clashes: SyncClash[] = [...splitClashes]
    for (const [key, notation] of desired) {
      const at = key.indexOf('|')
      const person = key.slice(0, at)
      const date = key.slice(at + 1)
      const war = warHolding(getState().wars, date)
      if (!war) continue
      const existing = war.grid[person]?.[date]
      if (existing === notation && raptorOwns(war.states, person, date)) continue
      const result = ingestFromRaptor(person, date, notation)
      if (result === 'clash') {
        clashes.push({ person, date, inputCode: notation, bidCode: existing ?? '' })
      }
    }

    /* Reverse: a Raptor-owned cell no live input still covers was DELETED on
       the Inputs page — clear it (and only it: clearRaptorCell refuses
       anything Leave War has taken back over). An owned FO/HO cell is NOT
       ours to garbage-collect: the OIL pass wrote it from published work or
       an acknowledged input claim, not from a leave input, so no leave input
       covering it is its normal state — the ownership marker is shared, the
       vocabulary is the partition. */
    for (const war of getState().wars) {
      for (const [person, row] of Object.entries(war.states)) {
        for (const [date, rec] of Object.entries(row)) {
          if (rec.source !== 'raptor') continue
          const code = war.grid[person]?.[date]
          if (code === 'FO' || code === 'HO') continue
          if (desired.has(`${person}|${date}`)) continue
          clearRaptorCell(person, date)
        }
      }
    }

    LEAVE_CLASHES = clashes
    publishClashes()
  } finally {
    SYNCING = false
  }
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
  if (isWeekend(date)) return true
  const war = warHolding(getState().wars, date)
  if (!war) return false
  const day = war.period.days.find(d => d.date === date)
  if (!day) return false
  if (day.ph) return true
  return columnKindFor(getState().eventDefs, day, war.period.bands ?? []) === 'off'
}

/* THE INPUT ASK-FLOW'S PLAN (owner, 28 Aug 26): which of a duty-&-commitments
   input's covered days are non-working, and what the input's own hours would
   earn on each — the pure body BOTH the OilConfirm sheet and the save gate
   read, so what is asked and what is credited cannot disagree (the
   upchitEffects precedent). One entry per applicable day; the amount is the
   input's own standing (all-day = FO, else its length under oilFullMin) —
   the CELL finally posted may still upgrade when published schedule work on
   the same day stretches its envelope (desiredOilCells). Walks label→ISO exactly as
   runInbound does, same 400-day cap. */
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
  for (const row of INPUTS) {
    if (row.person !== personId || !oilAsks(row.type) || row.acc === 'r') continue
    const answered = (row.oil ?? {}) as Record<string, number>
    const hit = oilAskPlan(row).find(p => answered[p.iso] == null)
    if (hit && row.iid) out.push({ iid: row.iid, iso: hit.iso })
  }
  return out
}

/* Everyone an ALL / ALL AVAIL puck stands for on a non-working day's event
   (owner, 28 Aug 26 — "it will count everyone who is available for that
   event"): AIRCREW MINUS SANS, the owner's pick — no ground crew Personnel,
   no SANS aircrew, never a sentinel or an archived body — minus anyone an
   away-making input (leave, medical, OD — the palette's own isAway) takes
   out of the event's window. The war grid needs no separate read: an
   approved war-side leave exists as an outbound-minted input too, so INPUTS
   is the one absence record this consults. */
function availableFor(iso: string, win: [number, number]): string[] {
  const out: string[] = []
  const isoOrd = +iso.replace(/-/g, '')
  /* the Leave War body, for the posting window (bug pass, 28 Aug 26): a
     person posted out WITHOUT the archive switch — or not yet posted in —
     still holds a Raptor body, and expanding them under an ALL puck would
     mint a credit the matrix hides behind its not-yet-arrived blank. The
     same inSquadron read the manning counts make. */
  const lwById = new Map(getState().people.map(p => [p.id, p]))
  for (const id of Object.keys(PEOPLE)) {
    const p: any = (PEOPLE as any)[id]
    if (!p || p.special || p.archived || p.pers || p.san) continue
    const lw = lwById.get(id)
    if (lw && !inSquadron(lw, iso)) continue
    const away = INPUTS.some((inp: any) => {
      if (inp.person !== id || !isAway(inp)) return false
      const a = dateOrd(inp.date, inp.yr)
      if (a == null) return false
      const b = inp.endDate ? dateOrd(inp.endDate, inp.yr) ?? a : a
      if (isoOrd < a || isoOrd > b) return false
      const w = inpWin(inp)
      return !!w && w[0] < win[1] && win[0] < w[1]
    })
    if (!away) out.push(id)
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
      wk = { days: s.d, sc: { dayOK: s.ok, cur: s.cv, als: s.a, orig: s.o, drafts: s.dr } }
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
 *  - ACKNOWLEDGED duty-&-commitments inputs (row.oil — the ask-flow's
 *    answers). Publication does not gate these: the owner's acknowledgment
 *    is their gate. An answer only counts while its day is still covered by
 *    the row's dates AND still reads non-working — a moved input or a
 *    revoked PH leaves the old yes inert, and the reverse sweep collects
 *    the cell. Nothing acknowledged = nothing credited, structurally.
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
function desiredOilCells(): Map<string, 'FO' | 'HO'> {
  const { people, wars } = getState()
  const known = new Set(people.map(p => p.id))
  /* person|iso -> that day's work spans; their ENVELOPE faces the threshold */
  const pool = new Map<string, [number, number][]>()
  const add = (person: string, iso: string, spans: [number, number][]) => {
    /* The same unknown-person guard both leave directions carry: a row
       naming someone the roster does not hold (ground crew, a sentinel)
       must not become a grid row no matrix draws. */
    if (!known.has(person) || !spans.length) return
    const k = `${person}|${iso}`
    const arr = pool.get(k) ?? []
    arr.push(...spans)
    pool.set(k, arr)
  }
  for (let di = 0; di < DAYS.length; di++) {
    if (!dayApproved(di)) continue
    const iso = labelToISO(DATES[di])
    if (!iso || !warHolding(wars, iso)) continue
    if (!isNonWorkingISO(iso)) continue
    const snap = daySnapOf(di, dayCurVer(di))
    const spans = dayOilSpans(snap ? snap.d : DAYS[di], { expandAll: win => availableFor(iso, win) })
    for (const [person, sp] of Object.entries(spans)) add(person, iso, sp)
  }
  /* every OTHER week, out of its stash entry — the loaded week is skipped
     (its stash is at best a stale copy of the live model read above) and a
     blob that fails to parse reads as never stashed, the stashDays rule.
     The ISO comes from the week key + day index directly (v is the Monday,
     dd/mm/yyyy) — no label parsing, no year-convention trap. */
  for (const v of stashKeys()) {
    if (String(v) === String(CURWEEK)) continue
    const wk = stashOilWeek(String(v))
    if (!wk) continue
    for (let di = 0; di < 7; di++) {
      if (!(wk.sc.dayOK || {})[di]) continue
      const iso = weekDayISO(String(v), di)
      if (!iso || !warHolding(wars, iso)) continue
      if (!isNonWorkingISO(iso)) continue
      const snap = daySnapIn(wk.sc, di, dayCurVerIn(wk.sc, di))
      /* same fallback rule as the live loop: an approved day without a
         snapshot (legacy/session data) reads its stashed model */
      const d = snap ? snap.d : wk.days[di]
      if (!d) continue
      const spans = dayOilSpans(d, { expandAll: win => availableFor(iso, win) })
      for (const [person, sp] of Object.entries(spans)) add(person, iso, sp)
    }
  }
  for (const row of INPUTS) {
    if (!row.oil || !oilAsks(row.type) || row.acc === 'r') continue
    const a = dateOrd(row.date, row.yr)
    if (a == null) continue
    const b = row.endDate ? dateOrd(row.endDate, row.yr) ?? a : a
    /* the acknowledged window, one span per answered day: all-day is the
       whole day, a timed row its rolled length — the same reading the ask's
       own suggestion (inputOilAmt) priced */
    const win: [number, number] = row.allday || row.s == null || row.e == null
      ? [0, 1439]
      : [row.s, row.e < row.s ? row.e + 1440 : row.e]
    if (win[1] <= win[0]) continue
    for (const [iso, amt] of Object.entries(row.oil as Record<string, number>)) {
      if (!(typeof amt === 'number' && amt > 0)) continue
      const o = +String(iso).replace(/-/g, '')
      if (!(o >= a && o <= b)) continue                    // moved dates → stale yes is inert
      if (!warHolding(wars, iso)) continue
      if (!isNonWorkingISO(iso)) continue                  // a day that stopped being PH stops crediting
      add(row.person, iso, [win])
    }
  }
  const out = new Map<string, 'FO' | 'HO'>()
  for (const [k, spans] of pool) {
    const amt = uniformOil(envMin(spans))
    if (amt) out.set(k, amt === 1 ? 'FO' : 'HO')
  }
  return out
}

export function runOilPass(): void {
  if (SYNCING) return
  SYNCING = true
  try {
    const desired = desiredOilCells()

    /* Forward: land what the published schedule earns. Already-landed cells
       are skipped so an unchanged world writes nothing. */
    const clashes: SyncClash[] = []
    for (const [key, code] of desired) {
      const at = key.indexOf('|')
      const person = key.slice(0, at)
      const date = key.slice(at + 1)
      const war = warHolding(getState().wars, date)
      if (!war) continue
      const existing = war.grid[person]?.[date]
      if (existing === code && raptorOwns(war.states, person, date)) continue
      const result = ingestDutyCredit(person, date, code)
      if (result === 'clash') {
        clashes.push({ person, date, inputCode: code, bidCode: existing ?? '', kind: 'duty' })
      }
    }

    /* Reverse-and-replace: an owned FO/HO cell no published work still earns
       — the day was reopened, the man came off the roster, the times shrank,
       an AL moved him — goes, and the forward half above has already written
       whatever replaces it. Only FO/HO: the leave cells under the same
       ownership marker are inbound's, the mirror of its skip. */
    for (const war of getState().wars) {
      for (const [person, row] of Object.entries(war.states)) {
        for (const [date, rec] of Object.entries(row)) {
          if (rec.source !== 'raptor') continue
          const code = war.grid[person]?.[date]
          if (code !== 'FO' && code !== 'HO') continue
          if (desired.has(`${person}|${date}`)) continue
          clearRaptorCell(person, date)
        }
      }
    }

    OIL_CLASHES = clashes
    publishClashes()
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
 * helps now the app is session-only.
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

/* Local calendar date, the same convention engine/inputs.ts's 'now' uses —
   never UTC: a PO dated "today" must archive on the squadron's today. */
function localTodayISO(): string {
  const d = new Date()
  const p2 = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`
}

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
  const today = localTodayISO()
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
  const body = (PEOPLE as any)[id]
  if (!body || !body.archived || body.special) return false
  setPostOut(id, null)
  body.archived = false
  validate()
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
export function wireLeaveWarSync(): void {
  /* The VIEWING PERSON rides this same wire (owner, 17 Aug 26 — the matrix
     lights the viewer's row and the counter picker answers with their
     numbers). Raptor's "View as" (`ME`) notifies on every change, so pushing
     it here — once at boot, again on every Raptor notify below — keeps the
     mirror converged without a new seam; setViewer no-ops on a same value. */
  setViewer(ME)
  runPoArchive()
  runInbound()
  runOilPass()
  runOutbound()
  raptorSubscribe(() => {
    setViewer(ME)
    // Before the passes: a body added on the Quals page must be on the roster
    // before inbound tries to land any of its leave (owner, 18 Aug 26).
    reprojectRoster()
    runPoArchive()
    runInbound()
    runOilPass()
    runOutbound()
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
       set rather than waiting for a Raptor edit to happen along. */
    runPoArchive()
    runOutbound()
    runInbound()
    /* The OIL pass reads Leave War too — a PH flag set, an event word tagged
       "off day", a war created over the loaded week — so a Leave War change
       can change what a published Saturday earns. */
    runOilPass()
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
