// Wires 1 + 2 of the Leave War ⇄ Raptor sync
// (docs/superpowers/specs/leavewar-sync.md): approved leave crosses to the
// schedule as a personal input, and leave filed on the Inputs page crosses
// back as an approved, Raptor-owned cell.
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

import { INPUTS, baseYear, dateOrd, inpId, inpWin, isLeave } from '../engine/inputs'
import { subscribe as raptorSubscribe, writeInputsBatch } from '../state/store'
import {
  addDays,
  outboundToRaptor,
  parseCell,
  raptorOwns,
  warHolding,
  type Portion,
} from './engine'
import {
  clearRaptorCell,
  getState,
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

function rowSig(row: any): string | null {
  const start = labelToISO(row.date)
  if (!start) return null
  const end = row.endDate ? labelToISO(row.endDate) ?? start : start
  return `${row.person}|${String(row.type).trim().toUpperCase()}|${rowPortion(row)}|${start}|${end}`
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
          type: r.type,
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
}

/* Re-derived on every inbound pass, never persisted — a clash list is a view
   of two live records, and storing it would let it outlive either. */
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

function setClashes(next: SyncClash[]): void {
  /* A clash that did not change must not repaint the strip: inbound runs on
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

    /* The desired cells: every NON-lw leave input, one entry per covered
       day. person|isoDate -> code-with-portion. */
    const desired = new Map<string, string>()
    for (const row of INPUTS) {
      if (row.lw) continue // the loop-breaker: rows this module itself wrote
      if (!isLeave(row.type)) continue
      /* A person Leave War does not know (the seed's j_lee, say) would
         become an invisible grid row no matrix draws — skip rather than
         write a cell nobody can see or clear. */
      if (!known.has(row.person)) continue
      const start = labelToISO(row.date)
      if (!start) continue
      let end = row.endDate ? labelToISO(row.endDate) ?? start : start
      if (end < start) end = start
      const portion = rowPortion(row)
      const type = String(row.type).trim().toUpperCase()
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
       anything Leave War has taken back over). */
    for (const war of getState().wars) {
      for (const [person, row] of Object.entries(war.states)) {
        for (const [date, rec] of Object.entries(row)) {
          if (rec.source !== 'raptor') continue
          if (desired.has(`${person}|${date}`)) continue
          clearRaptorCell(person, date)
        }
      }
    }

    setClashes(clashes)
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
  runOutbound()
  raptorSubscribe(() => {
    runInbound()
    runOutbound()
  })
  lwSubscribe(() => {
    runOutbound()
    runInbound()
  })
}
