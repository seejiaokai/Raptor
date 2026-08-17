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

import { INPUTS, DATES, baseYear, dateOrd, inpId, inpWin, isDownchit, isLeave } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { dayApproved, dayCurVer, daySnapOf } from '../engine/publish'
import { dayOilCredits } from '../engine/oil'
import { subscribe as raptorSubscribe, writeInputsBatch } from '../state/store'
import {
  addDays,
  columnKindFor,
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
  subscribe as lwSubscribe,
} from './state/store'

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
   disagree about what a label means. Null for anything unreadable. */
function labelToISO(lbl: unknown): string | null {
  const ord = dateOrd(lbl)
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

/* One dispatcher so every reader of a row's portion picks the right rule by
   the row's own type — a medical row must never be read with leave's
   round-OUT rule or the two sides of the diff would disagree about the same
   row. */
const portionOfRow = (row: any): Portion => (isDownchit(row.type) ? medRowPortion(row) : rowPortion(row))

function rowSig(row: any): string | null {
  const start = labelToISO(row.date)
  if (!start) return null
  const end = row.endDate ? labelToISO(row.endDate) ?? start : start
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
      for (const row of stale) {
        const ix = INPUTS.indexOf(row)
        if (ix >= 0) INPUTS.splice(ix, 1)
      }
      for (const r of missing) {
        const row: any = {
          person: r.person,
          /* Back to Raptor's own spelling — an 'ATTB' run lands as an
             'ATT B' input, the type the Inputs page and INPUT_META know. */
          type: INPUT_FOR_LW[r.type] ?? r.type,
          date: isoToLabel(r.start),
          remarks: 'Leave War',
          mod: 'now',
          /* The ownership tag: which war this row is derived from. Inbound
             skips lw-tagged rows (the loop-breaker), and reconciliation
             removes exactly these when their cell is no longer approved.
             An extra field on the row — inpKey does not include it and
             nothing downstream reads fields it does not know. */
          lw: r.warId,
        }
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
    const desired = new Map<string, string>()
    for (const row of INPUTS) {
      if (row.lw) continue // the loop-breaker: rows this module itself wrote
      if (!isLeave(row.type) && !isDownchit(row.type)) continue
      /* A person Leave War does not know (the seed's j_lee, say) would
         become an invisible grid row no matrix draws — skip rather than
         write a cell nobody can see or clear. */
      if (!known.has(row.person)) continue
      const start = labelToISO(row.date)
      if (!start) continue
      let end = row.endDate ? labelToISO(row.endDate) ?? start : start
      if (end < start) end = start
      const portion = portionOfRow(row)
      const type = lwTypeOf(row.type)
      const notation = portion === 'am' ? `*${type}` : portion === 'pm' ? `${type}*` : type
      /* Capped walk: a malformed span cannot spin the boot. 400 covers any
         legitimate year-crossing leave. */
      let n = 0
      for (let d = start; d <= end && n < 400; d = addDays(d, 1), n++) {
        /* Only dates inside some war are syncable — a war might simply not
           exist for that year. Skipped silently, per the spec. */
        if (!warHolding(wars, d)) continue
        const key = `${row.person}|${d}`
        if (!desired.has(key)) desired.set(key, notation)
      }
    }

    /* Forward: land what Raptor holds. Already-synced cells are skipped so
       an unchanged world writes nothing (ingest would persist-and-notify). */
    const clashes: SyncClash[] = []
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
       anything Leave War has taken back over). An owned FS/HS cell is NOT
       ours to garbage-collect: the OIL pass wrote it from a published duty,
       not from an input, so no input covering it is its normal state — the
       ownership marker is shared, the vocabulary is the partition. */
    for (const war of getState().wars) {
      for (const [person, row] of Object.entries(war.states)) {
        for (const [date, rec] of Object.entries(row)) {
          if (rec.source !== 'raptor') continue
          const code = war.grid[person]?.[date]
          if (code === 'FS' || code === 'HS') continue
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
   filed one. */
function isNonWorkingISO(date: string): boolean {
  if (isWeekend(date)) return true
  const war = warHolding(getState().wars, date)
  if (!war) return false
  const day = war.period.days.find(d => d.date === date)
  if (!day) return false
  if (day.ph) return true
  return columnKindFor(getState().eventDefs, day, war.period.bands ?? []) === 'off'
}

/** The credits a published, non-working day earns right now: person|isoDate
 *  -> FS/HS. Computed from the ISSUED snapshot, not the live day — an issued
 *  day is the squadron's word that the duty stood, so a draft edit after
 *  publish moves nothing until it is published too (the AL/reissue paths),
 *  which is also where reverse-and-replace naturally lives: the snapshot
 *  changes, the diff below follows it. */
function desiredOilCells(): Map<string, 'FS' | 'HS'> {
  const out = new Map<string, 'FS' | 'HS'>()
  const { people, wars } = getState()
  const known = new Set(people.map(p => p.id))
  for (let di = 0; di < DAYS.length; di++) {
    if (!dayApproved(di)) continue
    const iso = labelToISO(DATES[di])
    if (!iso || !warHolding(wars, iso)) continue
    if (!isNonWorkingISO(iso)) continue
    const snap = daySnapOf(di, dayCurVer(di))
    const credits = dayOilCredits(snap ? snap.d : DAYS[di])
    for (const [person, amt] of Object.entries(credits)) {
      /* The same unknown-person guard both leave directions carry: a duty row
         naming someone the roster does not hold (ground crew, a sentinel)
         must not become a grid row no matrix draws. */
      if (!known.has(person)) continue
      out.set(`${person}|${iso}`, amt === 1 ? 'FS' : 'HS')
    }
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

    /* Reverse-and-replace: an owned FS/HS cell no published duty still earns
       — the day was reopened, the man came off the roster, the times shrank,
       an AL moved him — goes, and the forward half above has already written
       whatever replaces it. Only FS/HS: the leave cells under the same
       ownership marker are inbound's, the mirror of its skip. */
    for (const war of getState().wars) {
      for (const [person, row] of Object.entries(war.states)) {
        for (const [date, rec] of Object.entries(row)) {
          if (rec.source !== 'raptor') continue
          const code = war.grid[person]?.[date]
          if (code !== 'FS' && code !== 'HS') continue
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
  runInbound()
  runOilPass()
  runOutbound()
  raptorSubscribe(() => {
    runInbound()
    runOilPass()
    runOutbound()
  })
  lwSubscribe(() => {
    runOutbound()
    runInbound()
    /* The OIL pass reads Leave War too — a PH flag set, an event word tagged
       "off day", a war created over the loaded week — so a Leave War change
       can change what a published Saturday earns. */
    runOilPass()
  })
}
