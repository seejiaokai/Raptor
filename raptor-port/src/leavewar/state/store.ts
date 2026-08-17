// The store. `setCell` is the ONLY path that writes a cell: it updates the
// grid AND that cell's bid state, persists through the backend, bumps the
// version and notifies. A write that skips it is invisible to the interface
// and is never saved.

import {
  addDays,
  canEditCell,
  inSquadron,
  isBiddable,
  isMedical,
  windowFits,
  canReopen,
  nextStage,
  previousStage,
  raptorOwns,
  COUNTERS,
  DEFAULT_FIGURE_ORDER,
  orderedFigures,
  makeWar,
  overlapping,
  seedLedger,
  seedOpenings,
  seedEventDefs,
  seedPeople,
  seedPeriod,
  seedRequirements,
  seedWars,
  readEventDefs,
  bandOverlaps,
  warHolding,
  STAGE_ORDER,
  type BidRecord,
  type BidSource,
  type BidState,
  type CounterName,
  type DayInfo,
  type EventBand,
  type EventDef,
  type EventKind,
  addEventDef,
  updateEventDef,
  removeEventDef,
  type Grid,
  type LeaveWar,
  type Ledger,
  type Openings,
  type Period,
  type Person,
  type Requirements,
  type Role,
  type Stage,
  type States,
} from '../engine'
import { localBackend, memoryBackend, type StorageBackend } from './storage'

interface State {
  people: Person[]
  requirements: Requirements
  /** The squadron's EVENT TYPES — the small library that gives a day-event
   *  word its off/no-leave/work meaning (engine/eventdefs.ts). Squadron-wide,
   *  not per-war, and persisted under its own `eventdefs` key. */
  eventDefs: EventDef[]
  /** Every leave war, in the order they were created. Never empty. */
  wars: LeaveWar[]
  /** Which one is on screen. */
  currentId: string

  // ---- derived from `wars` + `currentId`, never assigned directly ----
  //
  // The current war's three parts, republished at the top level by
  // `withCurrent()` on every change. They exist so that the matrix and the
  // chrome can go on reading `period`, `grid` and `states` exactly as they
  // did when there was only one war: multiplicity is the store's problem,
  // not the interface's.
  period: Period
  grid: Grid
  states: States
  /** Where each counter started. A balance is this plus the ledger less what
   *  the grid has drawn — never a stored figure, which would be a second
   *  version of a truth the grid already holds. */
  openings: Openings
  ledger: Ledger
  /** Who the person at the keyboard says they are. Nothing verifies it —
   *  there is no login — so this decides which controls appear, not who is
   *  allowed to use them. See `docs/known-gaps.md`. */
  role: Role

  /** The counter column's figure order — the ids of `FIGURES`, in the order
   *  the picker lists them and the column cycles them. A DISPLAY preference,
   *  not squadron policy, so it is persisted (under `figorder`) but ungated,
   *  the way the counter *selection* is ungated. Read leniently: unknown or
   *  missing ids are healed by `orderedFigures`, never rejected. */
  figureOrder: string[]

  /** The day the matrix has been asked to bring into view, or null. */
  focusDate: string | null
  /** Bumped on every request, including a repeat of the same date. The matrix
   *  jumps on a change to THIS, not to `focusDate`: a year is 365 columns, so
   *  the grid is almost never still where it was left, and asking again for
   *  the day you are notionally already on must snap you back to it. A date
   *  alone cannot say "asked again". */
  focusSeq: number
}

let backend: StorageBackend = memoryBackend()
let state: State = blank()
let version = 0
const listeners = new Set<() => void>()

/** Republish the current war's parts at the top level. Every assignment to
 *  `state` goes through this, so the three derived fields cannot fall out of
 *  step with the war they came from. */
function withCurrent(s: Omit<State, 'period' | 'grid' | 'states'>): State {
  // Falling back to the first war rather than throwing: a `currentId`
  // naming a war that no longer exists is recoverable, and a blank screen
  // is not. `wars` is never empty — `blank()` seeds it and nothing removes.
  const war = s.wars.find(w => w.period.id === s.currentId) ?? s.wars[0]
  return { ...s, period: war.period, grid: war.grid, states: war.states }
}

function blank(): State {
  const wars = seedWars()
  return withCurrent({
    people: seedPeople(),
    requirements: seedRequirements(),
    eventDefs: seedEventDefs(),
    wars,
    currentId: wars[0].period.id,
    openings: seedOpenings(),
    ledger: seedLedger(),
    figureOrder: [...DEFAULT_FIGURE_ORDER],
    // The squadron is the common case, so the app opens as one. An admin
    // says so deliberately rather than arriving with the locks already off.
    role: 'member',
    focusDate: null,
    focusSeq: 0,
  })
}

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === 'object' && !Array.isArray(x)
}

// A grid is a plain object of plain objects of strings: personId -> date ->
// code. Checking only the top level lets a shape like `{"ramp":{"...":123}}`
// through, which then crashes on boot inside codeOf (which expects a
// string). The guard's job is to degrade to the seed instead, same as every
// other malformed shape.
function isValidGrid(x: unknown): x is Grid {
  if (!isPlainObject(x)) return false
  for (const row of Object.values(x)) {
    if (!isPlainObject(row)) return false
    for (const code of Object.values(row)) {
      if (typeof code !== 'string') return false
    }
  }
  return true
}

// `acknowledged` joined these on 10 Aug 26. A blob written before that date
// cannot contain it, and one written after cannot contain anything else — so
// the set only ever grows and no migration is needed either way.
const BID_STATES = new Set(['pending', 'acknowledged', 'approved', 'refused'])
const BID_SOURCES = new Set(['bid', 'raptor'])

/**
 * Read one stored leaf into a `BidRecord`, or `null` if it is not one.
 *
 * Two shapes are accepted. The record is what is written today. A bare
 * string is what earlier builds wrote, and it is MIGRATED rather than
 * rejected: bids already sitting in someone's browser predate sources
 * entirely, and degrading them to the seed would silently throw away real
 * decisions to gain nothing. A string could only ever have meant a bid the
 * squadron placed here, so `source: 'bid'` is a fact, not a guess.
 */
function readRecord(leaf: unknown): BidRecord | null {
  if (typeof leaf === 'string') {
    return BID_STATES.has(leaf) ? { state: leaf as BidState, source: 'bid' } : null
  }
  if (!isPlainObject(leaf)) return null
  const { state, source, shiftedFrom } = leaf
  if (typeof state !== 'string' || !BID_STATES.has(state)) return null
  if (typeof source !== 'string' || !BID_SOURCES.has(source)) return null
  if (shiftedFrom !== undefined && typeof shiftedFrom !== 'string') return null
  const out: BidRecord = { state: state as BidState, source: source as BidSource }
  if (shiftedFrom !== undefined) out.shiftedFrom = shiftedFrom
  return out
}

// Same shape as a grid, but each leaf is a record rather than free text. A
// state nobody defined is not a state — it would flow straight into
// `removesAvailability`, where anything that is not exactly 'refused'
// silently removes a person.
//
// Unlike the grid guard this one CONVERTS as it validates, because the
// migration above has to happen somewhere and doing it here means every
// caller downstream sees one shape.
function readStates(x: unknown): States | null {
  if (!isPlainObject(x)) return null
  const out: States = {}
  for (const [id, row] of Object.entries(x)) {
    if (!isPlainObject(row)) return null
    const kept: Record<string, BidRecord> = {}
    for (const [date, leaf] of Object.entries(row)) {
      const record = readRecord(leaf)
      if (!record) return null
      kept[date] = record
    }
    out[id] = kept
  }
  return out
}

const COUNTER_NAMES = new Set<string>(COUNTERS)

// Openings are `personId -> counter -> number`. A non-finite figure is the
// dangerous shape here rather than merely a wrong one: NaN propagates
// silently through every sum it touches, so a single bad leaf would turn a
// whole column of balances into "NaN" with nothing to say why.
//
// (`readPeople` stood here until the sync wires: a stored roster is no
// longer read at all — see initStore — so its validator went with it.)

function readOpenings(x: unknown): Openings | null {
  if (!isPlainObject(x)) return null
  const out: Openings = {}
  for (const [id, row] of Object.entries(x)) {
    if (!isPlainObject(row)) return null
    const kept: Partial<Record<CounterName, number>> = {}
    for (const [counter, amount] of Object.entries(row)) {
      if (!COUNTER_NAMES.has(counter)) return null
      if (typeof amount !== 'number' || !Number.isFinite(amount)) return null
      kept[counter as CounterName] = amount
    }
    out[id] = kept
  }
  return out
}

function readLedger(x: unknown): Ledger | null {
  if (!Array.isArray(x)) return null
  const out: Ledger = []
  for (const e of x) {
    if (!isPlainObject(e)) return null
    const { id, personId, counter, amount, date, reason, approvedBy } = e
    if (typeof id !== 'string' || typeof personId !== 'string') return null
    if (typeof counter !== 'string' || !COUNTER_NAMES.has(counter)) return null
    if (typeof amount !== 'number' || !Number.isFinite(amount)) return null
    if (typeof date !== 'string') return null
    // A grant with no reason and no approver is the untraceable free text
    // the ledger exists to replace, so it is not a grant.
    if (typeof reason !== 'string' || typeof approvedBy !== 'string') return null
    out.push({ id, personId, counter: counter as CounterName, amount, date, reason, approvedBy })
  }
  return out
}

// The figure order is just a list of ids. Validated only as "an array of
// strings" and no more: `orderedFigures` already heals an unknown id (skip) or
// a missing one (append), so tightening it to "known ids only" here would buy
// nothing and would reject a blob written by a build that had a figure this
// one has since renamed. A non-array or a non-string leaf IS rejected — that
// is corruption, and the caller falls back to the default order.
function readFigureOrder(x: unknown): string[] | null {
  if (!Array.isArray(x)) return null
  if (x.some(id => typeof id !== 'string')) return null
  return x as string[]
}

// A stored war is its period plus its grid and states. `days` is stored in
// full rather than rebuilt from start/end, because a day carries events, a
// blocked flag and its reason — facts the range cannot regenerate and a
// scheduler would lose on every reload.
function readWar(x: unknown): LeaveWar | null {
  if (!isPlainObject(x)) return null
  const { period, grid, states } = x
  if (!isPlainObject(period)) return null
  const { id, name, start, end, stage, bidFrom, bidTo, days, bands } = period
  if (typeof id !== 'string' || typeof name !== 'string') return null
  if (typeof start !== 'string' || typeof end !== 'string' || end < start) return null
  if (typeof stage !== 'string' || !STAGE_ORDER.includes(stage as Stage)) return null
  if (!Array.isArray(days)) return null

  // The window is READ LENIENTLY, unlike everything else here, and the
  // asymmetry is deliberate. A war stored before the window existed has
  // neither key, and `undefined` there means "the whole period is open" —
  // which is exactly how that war behaved. Rejecting it would throw away a
  // squadron's grid over a field that did not exist when it was written.
  // A window that is present but not a string, or backwards, or outside the
  // period, IS rejected: that is corruption rather than an older shape.
  const from = bidFrom == null ? null : bidFrom
  const to = bidTo == null ? null : bidTo
  if (from !== null && typeof from !== 'string') return null
  if (to !== null && typeof to !== 'string') return null
  if (from !== null && (from < start || from > end)) return null
  if (to !== null && (to < start || to > end)) return null
  if (from !== null && to !== null && to < from) return null

  const readDays: DayInfo[] = []
  for (const d of days) {
    if (!isPlainObject(d)) return null
    const { date, events, blocked, blockedReason, ph } = d
    if (typeof date !== 'string') return null
    if (!Array.isArray(events) || events.length !== 2) return null
    if (events.some(e => typeof e !== 'string')) return null
    if (typeof blocked !== 'boolean' || typeof ph !== 'boolean') return null
    if (typeof blockedReason !== 'string') return null
    readDays.push({ date, events: [events[0], events[1]], blocked, blockedReason, ph })
  }

  // Bands are READ LENIENTLY, like the window above: a war stored before
  // merged events existed has no `bands` key, and `undefined` there means "no
  // merged labels", which is exactly how that war behaved. A key that is
  // present but not an array, or holds a malformed band, IS rejected — that is
  // corruption, not an older shape. A band whose dates fall outside the period,
  // are backwards, or sit on neither event line is dropped rather than failing
  // the whole war.
  const readBands: EventBand[] = []
  if (bands !== undefined) {
    if (!Array.isArray(bands)) return null
    for (const b of bands) {
      if (!isPlainObject(b)) return null
      const { line, from: bf, to: bt, text } = b
      if (line !== 0 && line !== 1) continue
      if (typeof bf !== 'string' || typeof bt !== 'string' || typeof text !== 'string') continue
      if (bt < bf || bf < start || bt > end) continue
      if (bandOverlaps(readBands, line, bf, bt)) continue
      readBands.push({ line, from: bf, to: bt, text })
    }
  }

  if (!isValidGrid(grid)) return null
  const readStatesOrNull = readStates(states)
  if (!readStatesOrNull) return null

  return {
    period: {
      id, name, start, end, stage: stage as Stage,
      bidFrom: from as string | null, bidTo: to as string | null,
      days: readDays,
      bands: readBands,
    },
    grid,
    // Same reconciliation the single-war store did: a state whose cell no
    // longer holds a bid is dropped rather than left to colour it wrong.
    states: reconcile(grid, readStatesOrNull),
  }
}

function readWars(x: unknown): LeaveWar[] | null {
  if (!Array.isArray(x) || x.length === 0) return null
  const out: LeaveWar[] = []
  for (const w of x) {
    const war = readWar(w)
    if (!war) return null
    out.push(war)
  }
  // Two wars claiming the same day is the one shape nothing downstream can
  // resolve — `warHolding` would answer with whichever came first and the
  // manning counts would double-count the man. Reject the whole blob.
  for (let i = 0; i < out.length; i++) {
    for (let j = i + 1; j < out.length; j++) {
      if (overlapping(out[i].period, out[j].period)) return null
    }
  }
  if (new Set(out.map(w => w.period.id)).size !== out.length) return null
  return out
}

/** What the backend holds under `key`, or `null` if there is nothing usable
 *  there. `null` covers both "never written" and "written but unreadable" —
 *  the caller's answer to each is the same, which is to fall back. */
function read<T>(key: string, valid: (x: unknown) => x is T): T | null {
  return readStored(key, x => (valid(x) ? x : null))
}

/** As `read`, but the reader may CONVERT rather than merely accept — which
 *  is what the states migration needs. Returning `null` from `parse` means
 *  the stored value is unusable and the caller should fall back. */
function readStored<T>(key: string, parse: (x: unknown) => T | null): T | null {
  const raw = backend.read(key)
  if (!raw) return null
  try {
    return parse(JSON.parse(raw))
  } catch {
    return null
  }
}

// The parallel map's one real weakness is drift, and load is the one place
// drift can arrive from outside `setCell` — hand-edited storage, or data
// written by a build that predates bid states. So every stored state is
// checked against the cell it names and dropped if that cell no longer
// holds a code that legitimately carries one: a bid code (any record), or a
// medical cell's raptor OWNERSHIP record — that one is what keeps a synced
// medical cell read-only and reverse-clearable across a reload, and dropping
// it here would let the outbound pass re-mint an input for a row Raptor
// itself wrote (the loop the source model exists to prevent). A BID-sourced
// record on a medical cell stays drift — `setCell` never writes one — and an
// 'approved' left on a cell that no longer holds any such code would colour
// it wrong, so both are still dropped.
function reconcile(grid: Grid, states: States): States {
  const out: States = {}
  for (const [id, row] of Object.entries(states)) {
    const kept: Record<string, BidRecord> = {}
    for (const [date, record] of Object.entries(row)) {
      const code = grid[id]?.[date]
      if (isBiddable(code) || (isMedical(code) && record.source === 'raptor')) kept[date] = record
    }
    if (Object.keys(kept).length > 0) out[id] = kept
  }
  return out
}

export function initStore(b?: StorageBackend): void {
  backend = b ?? localBackend()
  state = blank()

  const wars = readStored('wars', readWars) ?? migrateSingleWar() ?? seedWars()
  const storedCurrent = backend.read('current')
  const currentId = wars.some(w => w.period.id === storedCurrent)
    ? (storedCurrent as string)
    : wars[0].period.id

  const openings = readStored('openings', readOpenings) ?? seedOpenings()
  const ledger = readStored('ledger', readLedger) ?? seedLedger()
  const eventDefs = readStored('eventdefs', readEventDefs) ?? seedEventDefs()
  const figureOrder = readStored('figorder', readFigureOrder) ?? [...DEFAULT_FIGURE_ORDER]

  /* The role is neither read nor persisted since the Raptor merge: it is
     derived from the Raptor login on every session change (resetSession in
     ../../state/store.ts calls setRole), so a stored copy could only ever
     disagree with the session that is actually looking at the page. Boot
     leaves the default ('member'); the login that follows sets it. */
  /* PEOPLE are neither read nor persisted since the sync wires, for the same
     reason as the role: the roster is a PROJECTION of Raptor's own PEOPLE
     (state/raptorRoster.ts), installed by main.tsx via setPeople on every
     boot, so a stored copy could only ever disagree with the roster Raptor
     is actually flying. Boot leaves the seed — the vendored unit suite reads
     it pristine — and the projection that follows replaces it. */
  state = withCurrent({ ...state, wars, currentId, openings, ledger, eventDefs, figureOrder })

  version = 0
  listeners.clear()
}

/**
 * Rebuild one war from the keys written before wars were a list.
 *
 * Those browsers hold `grid`, `states` and `stage` and no `wars`, and all of
 * it belonged to the only period that existed — the seeded one. Rebuilding
 * rather than discarding follows the same rule as the bid-record migration:
 * a squadron's real leave is not worth throwing away to save a branch.
 *
 * Returns `null` when there is nothing of the old shape to migrate, so a
 * genuinely fresh boot still falls through to the seed.
 */
function migrateSingleWar(): LeaveWar[] | null {
  const grid = read('grid', isValidGrid)
  if (!grid) return null

  const period = seedPeriod()
  const storedStage = backend.read('stage') as Stage | null
  if (storedStage && STAGE_ORDER.includes(storedStage)) period.stage = storedStage

  return [{
    period,
    grid,
    states: reconcile(grid, readStored('states', readStates) ?? {}),
  }]
}

export function getState(): State {
  return state
}

export function getVersion(): number {
  return version
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => void listeners.delete(fn)
}

function notify(): void {
  version += 1
  for (const fn of listeners) fn()
}

// One writer for all three keys, so no write path can save a grid and forget
// the states that have to agree with it.
function persist(): void {
  backend.write('wars', JSON.stringify(state.wars))
  backend.write('current', state.currentId)
  backend.write('openings', JSON.stringify(state.openings))
  backend.write('ledger', JSON.stringify(state.ledger))
  backend.write('eventdefs', JSON.stringify(state.eventDefs))
  backend.write('figorder', JSON.stringify(state.figureOrder))
  /* `people` deliberately absent: the roster is a projection of Raptor's
     PEOPLE (see initStore) — persisting it would store a copy that can only
     disagree with the projection the next boot installs. */
}

/**
 * Set while a multi-day write is in flight, so `updateCurrent` builds the
 * state and skips the save and the notify. The caller releases it and does
 * both once.
 *
 * A module-level flag rather than a batching API, because there is exactly
 * one batching caller and JavaScript here is single-threaded: nothing can
 * interleave between setting it and clearing it. `setCellRange` clears it in
 * a `finally`, so a throw mid-range cannot leave the store permanently
 * silent — which is the one failure this shape could otherwise have.
 */
let quiet = false

/** Replace the war on screen, republish the derived fields, save and
 *  notify. Every write to a cell, a decision or a stage goes through here,
 *  so none of them can update a war without the interface following. */
function updateCurrent(fn: (war: LeaveWar) => LeaveWar): void {
  updateWar(state.currentId, fn)
}

/** As updateCurrent, but for a NAMED war — the Raptor ingest/clear pair
 *  writes into whichever war holds the input's date, which need not be the
 *  one on screen. Same save-and-notify epilogue, same `quiet` batching. */
function updateWar(id: string, fn: (war: LeaveWar) => LeaveWar): void {
  const wars = state.wars.map((w: LeaveWar) => (w.period.id === id ? fn(w) : w))
  state = withCurrent({ ...state, wars })
  if (quiet) return
  persist()
  notify()
}

/**
 * Change a person's seat, band or SXO qualification.
 *
 * Admin-only, and checked here rather than trusted to a hidden control, for
 * the same reason `createWar` re-checks it: the role switch is an affordance,
 * so the store is the only place it can mean anything.
 *
 * The CATEGORY is not settable and never will be — it is derived from seat
 * and band by `categoryOf`, which is what lets Raptor's roster replace this
 * one without a migration. A setter for it would create a second version of
 * a fact the two systems have to agree on.
 */
export function setPerson(id: string, patch: Partial<Pick<Person, 'seat' | 'band' | 'sxo'>>): boolean {
  if (state.role !== 'admin') return false
  const person = state.people.find(p => p.id === id)
  if (!person) return false
  state = withCurrent({
    ...state,
    people: state.people.map(p => (p.id === id ? { ...p, ...patch } : p)),
  })
  persist()
  notify()
  return true
}

/**
 * Install the roster. The one production caller is main.tsx's boot, which
 * hands in the projection of Raptor's PEOPLE (state/raptorRoster.ts, plus
 * the demo overlay in state/demoworld.ts).
 *
 * Deliberately NOT persisted, mirroring setRole: the projection is derived
 * from Raptor's roster on every boot, so a stored copy could only ever
 * disagree with it. In-session edits through setPerson stay session-only for
 * the same reason — Raptor's Quals page owns identity.
 */
export function setPeople(people: Person[]): void {
  state = withCurrent({ ...state, people })
  notify()
}

/**
 * Re-key every person-keyed record — each war's grid and states, the
 * openings, the ledger — through `map` (old id -> new id). Ids the map does
 * not name pass through unchanged.
 *
 * This exists for exactly one caller: the boot-time demo re-key
 * (state/demoworld.ts), which dresses the seeded demo world in Raptor's real
 * crew. It does not persist — boot must not write, and the result is
 * deterministic, so a fresh browser simply re-keys again next boot; the
 * first real user write persists the re-keyed wars like any other state.
 */
export function remapPersonKeys(map: Record<string, string>): void {
  const rekey = <T,>(rows: Record<string, T>): Record<string, T> => {
    const out: Record<string, T> = {}
    for (const [id, row] of Object.entries(rows)) out[map[id] ?? id] = row
    return out
  }
  const wars = state.wars.map(w => ({ ...w, grid: rekey(w.grid), states: rekey(w.states) }))
  const openings = rekey(state.openings)
  const ledger = state.ledger.map(e => ({ ...e, personId: map[e.personId] ?? e.personId }))
  state = withCurrent({ ...state, wars, openings, ledger })
  notify()
}

/** Set which role the interface is being used as. Since the Raptor merge the
 *  one production caller is resetSession (../../state/store.ts), which
 *  derives it from the Raptor login on every login and logout — the
 *  standalone app's on-screen toggle is gone. Still unguarded, and no longer
 *  persisted: the session is the authority, so a stored copy could only
 *  disagree with it. */
export function setRole(next: Role): void {
  if (next === state.role) return
  state = withCurrent({ ...state, role: next })
  notify()
}

// A cell and its bid state are written together. Splitting them across two
// callers is how the two maps drift — a code with no state, or a state whose
// code has gone. This is the only function allowed to write either.
export function setCell(personId: string, date: string, code: string): void {
  // Raptor owns what Raptor last wrote. That cell is changed in Raptor's
  // input tab and syncs back here, so writing it here would leave the two
  // systems disagreeing — the single failure the source model exists to
  // prevent. Ignore rather than write, and do not notify: nothing changed.
  if (raptorOwns(state.states, personId, date)) return
  // Stage, role AND the bidding window, in the one place a cell is written.
  // Enforced here rather than only in the grid's click handler for the same
  // reason `createWar` re-checks the role: the interface hides what a person
  // may not do, but the store is what makes it true.
  if (!canEditCell(state.period, state.role, date)) return

  const clean = code.trim().toUpperCase()
  const previous = state.grid[personId]?.[date]
  const row = { ...(state.grid[personId] ?? {}) }
  const srow = { ...(state.states[personId] ?? {}) }

  if (clean) row[date] = clean
  else delete row[date]

  if (!clean || !isBiddable(clean)) delete srow[date]
  // A code rewritten as ITSELF keeps whatever decision it already carries —
  // re-typing LL over an approved LL must not quietly un-approve it. A code
  // rewritten as a DIFFERENT one is a different ask, so it goes back to
  // pending AND loses any record of having been shifted: that provenance
  // belonged to the bid that has just been replaced.
  else if (clean !== previous || srow[date] === undefined) srow[date] = { state: 'pending', source: 'bid' }

  updateCurrent(w => ({
    ...w,
    grid: { ...w.grid, [personId]: row },
    states: { ...w.states, [personId]: srow },
  }))
}

/** What a range write did. `skipped` counts days it was not allowed to touch,
 *  which is a fact the person deserves rather than a silent shortfall. */
export interface RangeWrite {
  written: number
  skipped: number
}

/**
 * Write the same code across every day from `from` to `to`, inclusive.
 *
 * The owner's ask, in their words: "instead of click a day 1 by 1 … So I
 * don't need to keep clicking a leave input like for 2 weeks continuous."
 *
 * It writes through `setCell` day by day rather than reimplementing it,
 * because `setCell` is the only function allowed to write a cell and its
 * state together — a second write path is exactly how the two maps drift.
 * The cost is one persist and one notify per day, which is why the whole run
 * is wrapped: subscribers see one change, not fourteen.
 *
 * PARTIAL BY DESIGN. A range crossing a Raptor-owned cell, a posted-out day
 * or the edge of the bidding window writes what it may and reports what it
 * did not. Refusing the whole range would make the common case — a fortnight
 * that happens to include one locked day — impossible to ask for at all.
 */
export function setCellRange(
  personId: string,
  from: string,
  to: string,
  code: string,
): RangeWrite {
  if (to < from) return { written: 0, skipped: 0 }

  let written = 0
  let skipped = 0
  const person = state.people.find(p => p.id === personId)

  // Suppressed for the run, then released once. Without this a fortnight is
  // fourteen persists and fourteen re-renders, and every subscriber sees the
  // range half-written thirteen times.
  quiet = true
  try {
    for (let d = from; d <= to; d = addDays(d, 1)) {
      const allowed =
        !raptorOwns(state.states, personId, d) &&
        canEditCell(state.period, state.role, d) &&
        (!person || inSquadron(person, d))
      if (!allowed) {
        skipped++
        continue
      }
      setCell(personId, d, code)
      written++
    }
  } finally {
    quiet = false
  }

  if (written > 0) {
    persist()
    notify()
  }
  return { written, skipped }
}

/** Record a decision on a bid. Deliberately not role-gated: there is no
 *  login in this prototype, so anyone can decide anything — see
 *  `docs/known-gaps.md`. */
export function setBidState(personId: string, date: string, bid: BidState): void {
  // A decision on a cell nobody bid for would be a state with no bid behind
  // it, which is exactly the drift `setCell` exists to prevent. Ignore it
  // rather than write it.
  if (!isBiddable(state.grid[personId]?.[date])) return
  // There is nothing to decide on a cell Raptor owns: the approval already
  // happened, verbally, before Leave War ever saw it. Refusing it here would
  // claim an authority this app does not have.
  if (raptorOwns(state.states, personId, date)) return
  // Deciding keeps the rest of the record — the source that wrote it, and
  // the date it was shifted from. Management approving a shifted bid is the
  // second half of that move, and losing the provenance at exactly the
  // moment the move completes would make the trail useless.
  const existing = state.states[personId]?.[date]
  const srow = {
    ...(state.states[personId] ?? {}),
    [date]: { ...(existing ?? { source: 'bid' as const }), state: bid },
  }
  updateCurrent(w => ({ ...w, states: { ...w.states, [personId]: srow } }))
}

/** Why a bidding window was refused. */
export type BidWindowResult = 'set' | 'outside' | 'backwards' | 'forbidden'

/**
 * Open bidding on a range of days inside the current war.
 *
 * This is what "the admin selects which period to open" means now that a war
 * is a whole year: the year stays on screen and the squadron may write to
 * this much of it. Admin-only, and checked here rather than trusted to a
 * hidden button, because the role switch is an affordance rather than a
 * permission — see `docs/known-gaps.md`.
 *
 * Refused rather than clamped when the range falls outside the war: an admin
 * who typed the wrong year has made a mistake worth being told about, and
 * silently sliding their dates to the period's edges would leave them
 * believing they had opened something else.
 */
export function setBidWindow(from: string, to: string): BidWindowResult {
  if (state.role !== 'admin') return 'forbidden'
  if (to < from) return 'backwards'
  if (!windowFits(state.period, from, to)) return 'outside'
  updateCurrent(w => ({ ...w, period: { ...w.period, bidFrom: from, bidTo: to } }))
  return 'set'
}

/** Open the whole war for bidding again — the state every war starts in and
 *  the one every war stored before windows existed reads as. */
export function clearBidWindow(): BidWindowResult {
  if (state.role !== 'admin') return 'forbidden'
  updateCurrent(w => ({ ...w, period: { ...w.period, bidFrom: null, bidTo: null } }))
  return 'set'
}

/**
 * Write one of a day's two event lines.
 *
 * Admin-only: these are the scheduler's facts about a day — an exercise, a
 * visit, a range closure — not something a bidder writes about themselves.
 * Checked in the store for the same reason every other write is: the role
 * switch is an affordance, so this is the only place it can bite.
 *
 * Days are stored in full rather than rebuilt from the period's range
 * precisely so these survive a reload; see `readWar`.
 */
export function setDayEvent(date: string, line: 0 | 1, text: string): boolean {
  if (state.role !== 'admin') return false
  if (!state.period.days.some(d => d.date === date)) return false
  updateCurrent(w => ({
    ...w,
    period: {
      ...w.period,
      days: w.period.days.map(d => {
        if (d.date !== date) return d
        const events: [string, string] = [d.events[0], d.events[1]]
        events[line] = text
        return { ...d, events }
      }),
    },
  }))
  return true
}

/**
 * Write one event line across a RANGE of days — the "repeat" mode: the same
 * word lands in each covered day's own `events[line]` (e.g. "SC" on every day
 * of a tasking week). The merged-bar mode is `addEventBand` instead.
 *
 * Admin-only, same reason as `setDayEvent`. Any day already under a band on
 * this line keeps the band — the band is the merged label and per-day text
 * beneath it is suppressed anyway — so the repeat writes only the free days.
 * A backwards range is a no-op.
 */
export function setDayEventRange(from: string, to: string, line: 0 | 1, text: string): boolean {
  if (state.role !== 'admin') return false
  if (to < from) return false
  updateCurrent(w => ({
    ...w,
    period: {
      ...w.period,
      days: w.period.days.map(d => {
        if (d.date < from || d.date > to) return d
        if (bandCoversDate(w.period.bands, line, d.date)) return d
        const events: [string, string] = [d.events[0], d.events[1]]
        events[line] = text
        return { ...d, events }
      }),
    },
  }))
  return true
}

/** Why a merged band was refused. */
export type EventBandResult = 'set' | 'overlap' | 'backwards' | 'outside' | 'forbidden'

/**
 * Add a MERGED event label spanning a range on one event line.
 *
 * Admin-only. Refused rather than clamped when it overlaps an existing band on
 * the same line (two merged labels over one day has no single right answer) or
 * falls outside the war. On success the per-day text UNDER the band on that
 * line is cleared, so a merged label never hides stray words a later delete
 * would resurrect.
 */
export function addEventBand(line: 0 | 1, from: string, to: string, text: string): EventBandResult {
  if (state.role !== 'admin') return 'forbidden'
  if (to < from) return 'backwards'
  if (from < state.period.start || to > state.period.end) return 'outside'
  if (bandOverlaps(state.period.bands, line, from, to)) return 'overlap'
  updateCurrent(w => ({
    ...w,
    period: {
      ...w.period,
      bands: [...w.period.bands, { line, from, to, text }],
      days: w.period.days.map(d => {
        if (d.date < from || d.date > to || !d.events[line]) return d
        const events: [string, string] = [d.events[0], d.events[1]]
        events[line] = ''
        return { ...d, events }
      }),
    },
  }))
  return 'set'
}

/** Remove the merged band on `line` that covers `date`. Admin-only. A no-op
 *  when no band is there. The days it covered keep their (empty) per-day text —
 *  the band cleared them on the way in; a fresh edit refills them. */
export function removeEventBand(line: 0 | 1, date: string): boolean {
  if (state.role !== 'admin') return false
  const band = state.period.bands.find(b => b.line === line && b.from <= date && date <= b.to)
  if (!band) return false
  updateCurrent(w => ({
    ...w,
    period: { ...w.period, bands: w.period.bands.filter(b => b !== band) },
  }))
  return true
}

/** True where a band on `line` covers `date`. A module-local reader for the
 *  range writer above; the engine's `bandAt` is the exported one. */
function bandCoversDate(bands: EventBand[], line: 0 | 1, date: string): boolean {
  return bands.some(b => b.line === line && b.from <= date && date <= b.to)
}

/* THE EVENT-TYPE LIBRARY writers. Admin-only, squadron-wide, persisted under
   the `eventdefs` key. Each wraps a pure helper from engine/eventdefs.ts and
   returns its error sentence unchanged so the sheet can show it; a successful
   edit republishes state, saves and notifies like every other write. */

function commitEventDefs(result: EventDef[] | string): string | null {
  if (typeof result === 'string') return result
  state = withCurrent({ ...state, eventDefs: result })
  persist()
  notify()
  return null
}

export function addEventType(name: string, kind: EventKind): string | null {
  if (state.role !== 'admin') return 'Only an admin can edit event types'
  return commitEventDefs(addEventDef(state.eventDefs, name, kind))
}

export function updateEventType(index: number, patch: { name?: string; kind?: EventKind }): string | null {
  if (state.role !== 'admin') return 'Only an admin can edit event types'
  return commitEventDefs(updateEventDef(state.eventDefs, index, patch))
}

export function removeEventType(index: number): boolean {
  if (state.role !== 'admin') return false
  const next = removeEventDef(state.eventDefs, index)
  if (next === state.eventDefs) return false
  state = withCurrent({ ...state, eventDefs: next })
  persist()
  notify()
  return true
}

export function resetEventTypes(): void {
  if (state.role !== 'admin') return
  state = withCurrent({ ...state, eventDefs: seedEventDefs() })
  persist()
  notify()
}

/* THE COUNTER-COLUMN FIGURE ORDER writers. A display preference, so — unlike
   the event-type library above — they are NOT role-gated: a member reorders
   their own view exactly as they pick which counter it shows. Persisted under
   `figorder`. The order is normalised through `orderedFigures` on every move,
   so a stored blob missing a new figure (or naming a dead one) is healed the
   first time it is touched rather than carried forward malformed. */

/** Move a figure one place up (`-1`) or down (`+1`) the column's order.
 *  Clamped at the ends and a no-op for an unknown id — returns whether it
 *  moved so a caller can disable a control at the boundary. */
export function moveFigure(id: string, dir: -1 | 1): boolean {
  const ids = orderedFigures(state.figureOrder).map(f => f.id)
  const i = ids.indexOf(id)
  if (i < 0) return false
  const j = i + dir
  if (j < 0 || j >= ids.length) return false
  ;[ids[i], ids[j]] = [ids[j], ids[i]]
  state = withCurrent({ ...state, figureOrder: ids })
  persist()
  notify()
  return true
}

/** Put the column's figures back in their catalogue order. */
export function resetFigureOrder(): void {
  state = withCurrent({ ...state, figureOrder: [...DEFAULT_FIGURE_ORDER] })
  persist()
  notify()
}

/** Walk the period to its next stage. A no-op at the end of the cycle —
 *  `nextStage` owns which transitions exist. */
export function advanceStage(): void {
  const next = nextStage(state.period.stage)
  if (!next) return
  updateCurrent(w => ({ ...w, period: { ...w.period, stage: next } }))
}

/**
 * Step the period back one stage — how bidding is opened again after it has
 * been closed (owner, 10 Aug 26).
 *
 * Re-checks the role here rather than trusting the strip to have hidden the
 * control, for the same reason `setBidWindow` does: the role switch is an
 * affordance, not a permission, so the refusal has to live where the write
 * is. Returns whether it moved, so a caller can tell "not allowed" from
 * "already at the beginning".
 *
 * **Only the stage changes.** Bids and the decisions on them are untouched:
 * an approved bid is still approved after a reopen, and a refused one still
 * refused. Reopening changes what may happen NEXT, and rewrites nothing that
 * already happened — which is what keeps "why did this change after I bid"
 * answerable now that the cycle can run backwards.
 */
export function reopenStage(): boolean {
  if (!canReopen(state.period.stage, state.role)) return false
  const back = previousStage(state.period.stage)
  if (!back) return false
  updateCurrent(w => ({ ...w, period: { ...w.period, stage: back } }))
  return true
}

/** What an inbound Raptor input did here.
 *
 *  `clash` is the one a human has to see: Raptor is asking for a date the
 *  squadron already bid differently on, and the spec's rule is that the
 *  system never overwrites a bid — it raises it and a person decides. */
export type IngestResult = 'written' | 'confirmed' | 'clash' | 'ignored'

/**
 * Take leave entered directly in Raptor's input tab.
 *
 * Entering it there means the person sought approval **verbally and already
 * has it**, so this lands approved without anyone deciding anything here.
 * That state is written by this function alone and never trusted from a
 * caller — there is no path that produces a raptor record in any other
 * state, which is what makes `raptorOwns` safe to read as "approved
 * elsewhere".
 */
export function ingestFromRaptor(personId: string, date: string, code: string): IngestResult {
  const clean = code.trim().toUpperCase()
  // Raptor sends more than leave. Leave is bid for and medical is assigned
  // (owner, 17 Aug 26 — the four markers cross from the Inputs page too);
  // anything else nobody bids for is not this app's business and is dropped
  // rather than written as a cell with a state that would make no sense.
  // The 'approved' record a medical cell gets below is its OWNERSHIP marker
  // — raptorOwns and both reverse sweeps read the source; the grid draws a
  // non-biddable code as plain information whatever state rides it.
  if (!isBiddable(clean) && !isMedical(clean)) return 'ignored'

  // The war that OWNS the date, not the war on screen. The sync wire feeds
  // this whatever dates Raptor's inputs cover, whichever war is currently
  // selected — writing through updateCurrent would land a 2027 leave in the
  // 2026 grid the moment the admin happened to be looking at 2026. A date no
  // war holds is skipped silently: a war might simply not exist for that
  // year yet, and that is the caller's documented contract.
  const war = warHolding(state.wars, date)
  if (!war) return 'ignored'

  const existing = war.grid[personId]?.[date]
  const owned = raptorOwns(war.states, personId, date)

  // A DIFFERENT code already bid here is the clash. Write nothing.
  if (existing && existing !== clean && !owned) return 'clash'

  // The SAME code is not a clash — it is Raptor confirming what was already
  // asked for, so the cell is upgraded in place rather than left pending
  // forever, waiting on a decision that has in fact already been made.
  const confirming = existing === clean && !owned

  const row = { ...(war.grid[personId] ?? {}), [date]: clean }
  const srow = {
    ...(war.states[personId] ?? {}),
    [date]: { state: 'approved', source: 'raptor' } as BidRecord,
  }
  updateWar(war.period.id, w => ({
    ...w,
    grid: { ...w.grid, [personId]: row },
    states: { ...w.states, [personId]: srow },
  }))
  return confirming ? 'confirmed' : 'written'
}

/**
 * Post an OIL credit earned on the schedule — sync wire 4's writer, the
 * duty-shaped sibling of `ingestFromRaptor` above.
 *
 * Only `FS` and `HS` come through here: they are the two codes nobody bids
 * for that Raptor's schedule can mint (a published duty on a non-working
 * day, `engine/oil.ts`), which is exactly the gap ingest's `isBiddable`
 * gate exists to refuse. The ownership record is the same
 * `{approved, raptor}` shape, and deliberately so — every guard that keeps
 * a hand off a synced leave cell (setCell's refusal, outbound's skip,
 * `clearRaptorCell`'s narrowness) protects a credit identically, and the
 * schedule stays the only thing that can move it. A cell already holding
 * anything else — a leave bid, a course, a hand-typed marker — is the
 * clash: write nothing, a human decides (the wire surfaces it). A
 * hand-typed FS/HS matching the schedule's verdict is not a clash, it is
 * the squadron having recorded the same fact first — taken over in place,
 * exactly like ingest's confirming upgrade.
 */
export function ingestDutyCredit(personId: string, date: string, code: 'FS' | 'HS'): IngestResult {
  if (code !== 'FS' && code !== 'HS') return 'ignored'
  const war = warHolding(state.wars, date)
  if (!war) return 'ignored'

  const existing = war.grid[personId]?.[date]
  const owned = raptorOwns(war.states, personId, date)
  /* An owned cell is only this wire's to move while it holds this wire's own
     vocabulary (FS/HS — the hours changed, the credit follows). An owned cell
     holding a LEAVE code is wire 2's: overwriting it would set the two passes
     flipping one cell forever, so the man reading as on leave AND on duty is
     surfaced as the clash it is, and leave keeps the cell until a human moves
     one of the two records. */
  if (existing && existing !== code && !(owned && (existing === 'FS' || existing === 'HS'))) return 'clash'
  const confirming = existing === code && !owned

  const row = { ...(war.grid[personId] ?? {}), [date]: code }
  const srow = {
    ...(war.states[personId] ?? {}),
    [date]: { state: 'approved', source: 'raptor' } as BidRecord,
  }
  updateWar(war.period.id, w => ({
    ...w,
    grid: { ...w.grid, [personId]: row },
    states: { ...w.states, [personId]: srow },
  }))
  return confirming ? 'confirmed' : 'written'
}

/**
 * Clear one cell Raptor owns — the sync wire's delete path, and nothing
 * else's.
 *
 * Every ordinary clearing path (setCell with an empty code, the bid sheet's
 * Clear) REFUSES a Raptor-owned cell, and rightly: the squadron does not
 * un-decide what was decided in Raptor. But when the input that put the cell
 * here is deleted on Raptor's Inputs page, the deletion IS Raptor speaking,
 * and the cell has to follow it out. Narrow on purpose — only a cell whose
 * source is still 'raptor' is touched, so a cell Leave War has since taken
 * back over is left alone (the spec's own deletion rule).
 *
 * Ignores stage, role and the bidding window for the same reason ingest
 * does: Raptor's word arrives already decided.
 */
export function clearRaptorCell(personId: string, date: string): boolean {
  const war = warHolding(state.wars, date)
  if (!war) return false
  if (!raptorOwns(war.states, personId, date)) return false
  const row = { ...(war.grid[personId] ?? {}) }
  delete row[date]
  const srow = { ...(war.states[personId] ?? {}) }
  delete srow[date]
  updateWar(war.period.id, w => ({
    ...w,
    grid: { ...w.grid, [personId]: row },
    states: { ...w.states, [personId]: srow },
  }))
  return true
}

/** What a shift did, or why it did nothing. */
export type ShiftResult = 'shifted' | 'occupied' | 'raptor' | 'nothing'

/**
 * Move a bid to a different date.
 *
 * This is what management does instead of refusing when a week goes red and
 * refusing outright is too blunt. It lands **pending**, not approved: moving
 * a bid is a proposal, and someone still has to approve the date it was
 * moved to. The date it came from is kept on the record, because a leave
 * date that changed with no trace is exactly the untraceable edit the OIL
 * ledger exists to end.
 *
 * Written here rather than as two `setCell` calls so the whole move is one
 * write, one persist and one notify — a half-applied shift would leave the
 * man booked twice or not at all.
 */
export function shiftBid(personId: string, from: string, to: string): ShiftResult {
  const code = state.grid[personId]?.[from]
  if (!isBiddable(code)) return 'nothing'
  if (raptorOwns(state.states, personId, from)) return 'raptor'
  // Never overwrite. Moving one man's leave onto a day he already has
  // something booked would destroy the second booking to save the first.
  // Shifting onto its own date lands here too, which is right: it is not a
  // move, and treating it as one would rewrite the record for nothing.
  if (state.grid[personId]?.[to]) return 'occupied'

  const row = { ...(state.grid[personId] ?? {}) }
  delete row[from]
  row[to] = code

  const srow = { ...(state.states[personId] ?? {}) }
  delete srow[from]
  srow[to] = { state: 'pending', source: 'bid', shiftedFrom: from }

  updateCurrent(w => ({
    ...w,
    grid: { ...w.grid, [personId]: row },
    states: { ...w.states, [personId]: srow },
  }))
  return 'shifted'
}

/**
 * Ask the matrix to bring one day into view.
 *
 * View state in the domain store, deliberately: the stage strip and the
 * matrix render independently of each other on purpose — neither takes props
 * from the other, so both stay renderable standalone in their own tests — and
 * the store is already the channel they share. It is not persisted; where
 * someone was last looking is not a fact about the leave war.
 */
export function focusDay(date: string): void {
  state = { ...state, focusDate: date, focusSeq: state.focusSeq + 1 }
  notify()
}

/** Put a different leave war on screen. Unknown ids are ignored rather than
 *  blanking the grid — a stale link is not worth an empty page. */
export function selectWar(id: string): void {
  if (id === state.currentId) return
  if (!state.wars.some(w => w.period.id === id)) return
  // The focus is dropped with the war it pointed into. Wars do not overlap,
  // so a date from the old one names no column in the new grid — carrying it
  // across would mark nothing and send the next jump nowhere.
  state = withCurrent({ ...state, currentId: id, focusDate: null })
  persist()
  notify()
}

/**
 * Which existing war already covers part of this span, if any.
 *
 * `createWar` returns a bare `'overlap'`, and "those dates overlap a leave
 * war that already exists" sends an admin hunting through the picker for
 * which one. The owner hit exactly that: they typed Apr–Aug 27, were told
 * "overlap", and reasonably concluded it was a bug because the dates plainly
 * did not touch 2026 — the war they clashed with was JAN - DEC 27, and
 * nothing on screen said so.
 *
 * A selector rather than a wider `CreateWarResult`, because the refusal
 * itself is a tested contract and this is a question about the sentence, not
 * about the rule.
 */
export function clashingWar(start: string, end: string): Period | null {
  return state.wars.find(w => overlapping(w.period, { start, end }))?.period ?? null
}

/** Why a war was not created. */
export type CreateWarResult = 'created' | 'overlap' | 'backwards' | 'unnamed' | 'forbidden'

/**
 * Create a leave war over any span the admin asks for, down to a single
 * month. A quarter is the common case, not a rule.
 *
 * It lands in DRAFT and does not take the screen: opening it is a separate
 * act taken when the schedule firms up, and switching to it would yank the
 * admin out of the war they were working in to look at an empty one.
 *
 * The overlap refusal is the load-bearing one. A date must belong to at most
 * one war, or a person could hold leave on it twice over — the manning
 * counts would count him away twice and his balance would be drawn twice,
 * with nothing downstream able to say which war was the real one.
 */
export function createWar(name: string, start: string, end: string): CreateWarResult {
  // Checked here rather than trusted to the hidden button: the role switch
  // is unguarded, so the store is the only place this can actually mean
  // anything. See `docs/known-gaps.md`.
  if (state.role !== 'admin') return 'forbidden'

  const clean = name.trim()
  if (!clean) return 'unnamed'
  if (end < start) return 'backwards'

  const war = makeWar(`war-${start}-${end}`, clean, start, end)
  if (state.wars.some(w => overlapping(w.period, war.period))) return 'overlap'

  state = withCurrent({ ...state, wars: [...state.wars, war] })
  persist()
  notify()
  return 'created'
}
