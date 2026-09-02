// The store. `setCell` is the ONLY path that writes a cell: it updates the
// grid AND that cell's bid state, persists through the backend, bumps the
// version and notifies. A write that skips it is invisible to the interface
// and is never saved.

import {
  addDays,
  assignGroup,
  biddingClosed,
  canDecide,
  canEditCell,
  canEditRow,
  DEFAULT_GROUPS,
  offerableGroups,
  orderedGroupIds,
  pruneGroups,
  readGroupDefs,
  type GroupDef,
  inSquadron,
  isBiddable,
  isDuty,
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
  MAX_TEAM_SLOTS,
  SEED_QUAL_CATALOG,
  type CrewFilter,
  type ManningRule,
  type QualDef,
  type RuleCount,
  type TeamSlot,
  autoOrder,
  groupOf,
  GROUP_ORDER,
  orderedPeople,
  readEventDefs,
  DEFAULT_OIL_POLICY,
  readOilPolicy,
  type OilPolicy,
  type FigureCtx,
  grantedTo,
  drawnFrom,
  localToday,
  bandOverlaps,
  warHolding,
  STAGE_ORDER,
  type BidRecord,
  MAX_CELL_NOTE,
  type BidSource,
  type BidState,
  type CounterName,
  type DayInfo,
  type EventBand,
  type EventDef,
  type EventKind,
  EVENT_KINDS,
  addEventDef,
  updateEventDef,
  removeEventDef,
  type Grid,
  type LeaveWar,
  type Ledger,
  type LedgerEntry,
  type Openings,
  type Period,
  type Person,
  type Requirements,
  type Role,
  type Threshold,
  type Stage,
  type States,
} from '../engine'
import { localBackend, memoryBackend, type StorageBackend } from './storage'

interface State {
  people: Person[]
  /** The manning rules ARE data now (owner, 19 Aug 26 — "instead of hard
   *  coding these permutations, make it editable… and these counters can
   *  also be deleted"): `requirements.default.rules` is the squadron's own
   *  set, persisted WHOLE under `manningdefs` and edited through
   *  `saveManningRule` / `deleteManningRule` / the threshold setters, all
   *  ADMIN-gated. The old numbers-only overlay (`manningthresh`) is still
   *  READ at boot so a squadron's tuned amber/red lines survive the upgrade,
   *  but never written again. This deliberately departs from the
   *  stores-list rule about code-owned definitions: the owner asked for the
   *  definitions themselves, and forward-compat lives in `readManningRules`
   *  dropping any stored rule a later build cannot understand (the seed
   *  fills the gap). */
  requirements: Requirements
  /** The qualification chips the counter form offers — Raptor's live Quals
   *  catalogue, installed by the projection (`setQualCatalog`) exactly like
   *  the roster; never persisted, and the seed's three keys stand in when
   *  the app runs standalone. */
  qualCatalog: QualDef[]
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
  /** The OIL TRACKER's policy (owner, 2 Sep 26): how long a credit lasts
   *  before it expires (or forever) and the history window the tracker opens
   *  on. Squadron-wide, ADMIN-gated, persisted under `oilpolicy`. Read by
   *  every OIL BAL figure through `figureCtxOf`, so a change here re-reads
   *  every balance at once (engine/oiltracker.ts). */
  oilPolicy: OilPolicy
  /** Who the person at the keyboard says they are. Nothing verifies it —
   *  there is no login — so this decides which controls appear, not who is
   *  allowed to use them. See `docs/known-gaps.md`. */
  role: Role
  /** WHICH PERSON is looking at the page — Raptor's "View as" identity,
   *  mirrored here so the matrix can light their row and the counter picker
   *  can answer with THEIR numbers (owner, 17 Aug 26). Like the role it is
   *  neither read nor persisted: Raptor's `setMe` is the one production
   *  writer (plus the boot in main.tsx), so a stored copy could only ever
   *  disagree with the person actually selected. May name someone this
   *  roster does not hold; consumers check membership. */
  viewer: string | null

  /** The counter column's figure order — the ids of `FIGURES`, in the order
   *  the picker lists them and the column cycles them. Persisted (under
   *  `figorder`) and — since the owner's word, 17 Aug 26 ("normal user
   *  should not have authority to change the leave war column arrangement")
   *  — ADMIN-gated at the write path, while the counter *selection* stays
   *  ungated view state. Read leniently: unknown or missing ids are healed
   *  by `orderedFigures`, never rejected. */
  figureOrder: string[]

  /** The roster's row order — person ids, in the order the matrix draws them
   *  (owner, 18 Aug 26). Empty means "categorised": the matrix falls back to
   *  `autoOrder`. The Auto-sort button writes the grouped order; an edit-mode
   *  drag writes a hand-chosen one. ADMIN-gated at the write path, the same
   *  rule as `figureOrder` — a member does not rearrange the roster. Read
   *  leniently: `orderedPeople` drops ids that have left and appends anyone
   *  the saved order predates. */
  rosterOrder: string[]
  /** An admin's free-text labels for ground-crew rows, keyed by person id —
   *  an override of the projected default (Raptor's `flight`). Ground-crew
   *  only; an aircrew id here is simply never read. */
  persLabels: Record<string, string>

  /** The manning COUNT rows' display order (owner, 18 Aug 26) — rule ids
   *  (`'sets'` plus each requirement rule's id), in the order the matrix draws
   *  them. Empty means the natural order the rules appear in. ADMIN-gated, the
   *  same rule as `figureOrder`/`rosterOrder`. Read leniently: unknown ids are
   *  dropped and any not named are appended in natural order. */
  manningOrder: string[]
  /** The manning count rows an admin has hidden (rule ids). A member never sees
   *  a hidden row at all; an admin sees it dimmed in Rearrange mode, so it can
   *  be brought back. ADMIN-gated at the write path. */
  manningHidden: string[]
  /** WHICH GROUPS the roster is drawn in, top to bottom (owner, 28 Aug 26 —
   *  the admin group editor). The seven built-ins by default; an admin may add
   *  a group per QUALIFICATION and drag the order. ADMIN-gated, same rule as
   *  `manningOrder`. Read leniently and pruned against the live qual catalogue,
   *  so a group pinned to a deleted Quals column cannot strand an empty
   *  heading. */
  groupDefs: GroupDef[]
  /** WHO CLAIMS someone matching several groups — a SEPARATE order from the
   *  display one above (the owner's explicit choice): a person shows exactly
   *  once, and this decides where. Empty means "use the display order". */
  groupPriority: string[]

  /** How many EVENT rows the matrix draws (owner, 18 Aug 26 — "add more event
   *  rows if needed"). Two by default; an admin can add up to `MAX_EVENT_ROWS`.
   *  Squadron-wide config (persisted `eventrows`), admin-gated. A day's
   *  `events` array grows on demand as rows are written; a row past a day's
   *  stored length reads '' (`dayEvent`). */
  eventRows: number

  /** Whether SANS aircrew ride the Leave War roster (owner, 18 Aug 26 — "we
   *  will not show the SANS in the leave war however there is a function to
   *  still enable this"). OFF by default: SANS offer availability rather than
   *  being planned as squadron manning, so they neither clutter the grid nor
   *  count in its manning rows. The switch is squadron-wide config (persisted
   *  `showsans`), ADMIN-gated at the write path like `eventRows`, and takes
   *  effect through the roster PROJECTION — sync.ts's reprojectRoster passes
   *  it to projectPeople on every notify, so flipping it re-projects at once. */
  showSans: boolean

  /** The day the matrix has been asked to bring into view, or null. */
  focusDate: string | null
  /** Bumped on every request, including a repeat of the same date. The matrix
   *  jumps on a change to THIS, not to `focusDate`: a year is 365 columns, so
   *  the grid is almost never still where it was left, and asking again for
   *  the day you are notionally already on must snap you back to it. A date
   *  alone cannot say "asked again". */
  focusSeq: number

  /** In-app identity overrides an admin made through `setPerson`, keyed by
   *  person id — the fields Leave War let them flip locally (seat / band / sxo).
   *  Raptor's Quals page OWNS identity (see `setPeople`), so the live
   *  re-projection refreshes every person's identity from Raptor by default;
   *  this registry is the exception, the deliberate local edits that survive it.
   *  Session-only and NOT persisted, exactly like `role`/`viewer` — a stored
   *  copy could only disagree with the roster Raptor is actually flying, and a
   *  reboot returns to Raptor's truth. Posting-out (`from`/`to`) is preserved
   *  separately in `reprojectRoster`; it is not an identity field. */
  personEdits: Record<string, Partial<Pick<Person, 'seat' | 'band' | 'sxo'>>>
}

/** The event-row count and its bounds (owner, 18 Aug 26). Two rows is the
 *  historic default; six is a soft cap so the header block cannot be grown
 *  without limit. */
export const DEFAULT_EVENT_ROWS = 2
export const MAX_EVENT_ROWS = 6

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
    qualCatalog: [...SEED_QUAL_CATALOG],
    eventDefs: seedEventDefs(),
    wars,
    currentId: wars[0].period.id,
    openings: seedOpenings(),
    ledger: seedLedger(),
    oilPolicy: { ...DEFAULT_OIL_POLICY },
    figureOrder: [...DEFAULT_FIGURE_ORDER],
    rosterOrder: [],
    persLabels: {},
    manningOrder: [],
    manningHidden: [],
    groupDefs: [...DEFAULT_GROUPS],
    groupPriority: [],
    eventRows: DEFAULT_EVENT_ROWS,
    showSans: false,
    // The squadron is the common case, so the app opens as one. An admin
    // says so deliberately rather than arriving with the locks already off.
    role: 'member',
    viewer: null,
    focusDate: null,
    focusSeq: 0,
    personEdits: {},
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
  const { state, source, shiftedFrom, note } = leaf
  if (typeof state !== 'string' || !BID_STATES.has(state)) return null
  if (typeof source !== 'string' || !BID_SOURCES.has(source)) return null
  if (shiftedFrom !== undefined && typeof shiftedFrom !== 'string') return null
  const out: BidRecord = { state: state as BidState, source: source as BidSource }
  if (shiftedFrom !== undefined) out.shiftedFrom = shiftedFrom
  // A note is decoration on the record, never the record: a bad one is
  // dropped and the cell's state survives.
  if (typeof note === 'string' && note.trim()) out.note = note.trim().slice(0, MAX_CELL_NOTE)
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
    const { id, personId, counter, amount, date, reason, approvedBy, givenBy } = e
    if (typeof id !== 'string' || typeof personId !== 'string') return null
    if (typeof counter !== 'string' || !COUNTER_NAMES.has(counter)) return null
    if (typeof amount !== 'number' || !Number.isFinite(amount)) return null
    if (typeof date !== 'string') return null
    // A grant with no reason and no approver is the untraceable free text
    // the ledger exists to replace, so it is not a grant.
    if (typeof reason !== 'string' || typeof approvedBy !== 'string') return null
    const entry: LedgerEntry = { id, personId, counter: counter as CounterName, amount, date, reason, approvedBy }
    // `givenBy` is optional decoration (2 Sep 26); a bad one is dropped.
    if (typeof givenBy === 'string' && givenBy.trim()) entry.givenBy = givenBy.trim().slice(0, MAX_GIVEN_BY)
    out.push(entry)
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

/** A stored id list (the roster order), same shape as the figure order. */
const readIdList = readFigureOrder

/** The stored amber/red overlay of the PRE-definitions build, read at boot
 *  only so an upgraded browser keeps its tuned lines (they migrate into the
 *  rules themselves and persist under `manningdefs` from then on). One bad
 *  entry is dropped rather than rejecting the whole blob (the label-map
 *  rule); an id no rule carries any more is harmless — `requirementsWith`
 *  only reads ids the seed still has. */
function readThreshMap(x: unknown): Record<string, Threshold> | null {
  if (!isPlainObject(x)) return null
  const out: Record<string, Threshold> = {}
  for (const [id, t] of Object.entries(x)) {
    if (!isPlainObject(t)) continue
    const { amber, red } = t as { amber?: unknown; red?: unknown }
    if (typeof amber !== 'number' || !Number.isFinite(amber) || amber < 0) continue
    if (typeof red !== 'number' || !Number.isFinite(red) || red < 0) continue
    out[id] = { amber, red }
  }
  return out
}

/** The seeded requirements with a legacy amber/red overlay laid on top — the
 *  migration path for a browser that customised its lines before the rules
 *  became data. The old overlay knew `sets` as its own key; it is an ordinary
 *  rule now, so the same map read covers it. */
function requirementsWith(overlay: Record<string, Threshold>): Requirements {
  const req = seedRequirements()
  req.default.rules = req.default.rules.map(r =>
    overlay[r.id] ? { ...r, threshold: { ...overlay[r.id] } } : r,
  )
  return req
}

// ---- The stored manning rules (owner, 19 Aug 26) ---------------------------
//
// Read with the label-map tolerance: one rule a later build cannot understand
// is dropped, the rest survive. A stored empty LIST is honoured (the admin
// deleted every counter — a decision, not damage); a non-empty list where
// nothing survived is corruption and falls back to the seed rather than to a
// blank manning block.

const isShortString = (x: unknown): x is string => typeof x === 'string' && x.length > 0 && x.length <= 80

function readStringList(x: unknown): string[] | null {
  if (!Array.isArray(x) || x.length > 24) return null
  return x.every(isShortString) ? [...x] : null
}

function readFilter(x: unknown): CrewFilter | null {
  if (!isPlainObject(x)) return null
  const out: CrewFilter = {}
  const lists: [keyof CrewFilter, unknown][] = [
    ['seats', x.seats], ['cats', x.cats], ['notCats', x.notCats], ['quals', x.quals], ['notQuals', x.notQuals],
  ]
  for (const [key, v] of lists) {
    if (v === undefined) continue
    const list = readStringList(v)
    if (!list) return null
    if (key === 'seats' && !list.every(s => s === 'pilot' || s === 'wso')) return null
    if (list.length) (out as Record<string, unknown>)[key] = list
  }
  return out
}

function readThreshold(x: unknown): Threshold | null {
  if (!isPlainObject(x)) return null
  const { amber, red } = x as { amber?: unknown; red?: unknown }
  if (typeof amber !== 'number' || !Number.isFinite(amber) || amber < 0) return null
  if (typeof red !== 'number' || !Number.isFinite(red) || red < 0) return null
  return { amber, red }
}

function readRuleCount(x: unknown): RuleCount | null {
  if (!isPlainObject(x)) return null
  if (x.kind === 'people') {
    const filter = readFilter(x.filter)
    return filter ? { kind: 'people', filter } : null
  }
  if (x.kind !== 'team' || !Array.isArray(x.slots)) return null
  if (x.slots.length < 1 || x.slots.length > MAX_TEAM_SLOTS) return null
  const slots: TeamSlot[] = []
  for (const s of x.slots) {
    if (!isPlainObject(s)) return null
    const { count } = s as { count?: unknown }
    if (typeof count !== 'number' || !Number.isInteger(count) || count < 1 || count > 9) return null
    const filter = readFilter(s.filter)
    if (!filter) return null
    slots.push({ count, filter })
  }
  const out: RuleCount = { kind: 'team', slots }
  if (x.show === 'people') out.show = 'people'
  if (x.presence === true) out.presence = true
  return out
}

/** One rule, or `null` when it is not usable. Shared by the storage read and
 *  the write path (`saveManningRule`), so nothing malformed can arrive by
 *  either door. */
function readManningRule(x: unknown): ManningRule | null {
  if (!isPlainObject(x)) return null
  if (!isShortString(x.id) || !isShortString(x.label)) return null
  const threshold = readThreshold(x.threshold)
  const count = readRuleCount(x.count)
  if (!threshold || !count) return null
  const out: ManningRule = { id: x.id, label: x.label, count, threshold }
  if (typeof x.desc === 'string' && x.desc.length <= 2000) out.desc = x.desc
  return out
}

function readManningRules(x: unknown): ManningRule[] | null {
  if (!Array.isArray(x) || x.length > 60) return null
  const out: ManningRule[] = []
  const seen = new Set<string>()
  for (const r of x) {
    const rule = readManningRule(r)
    if (!rule || seen.has(rule.id)) continue
    out.push(rule)
    seen.add(rule.id)
  }
  // A stored EMPTY list is a decision — the admin deleted every counter, and
  // a reload must not resurrect the seed. A non-empty list where every entry
  // was dropped is corruption, and falls back to the seed like any other
  // unreadable blob.
  return out.length || x.length === 0 ? out : null
}

/** A stored id→label map (personnel labels). Non-string values are dropped
 *  rather than rejecting the whole blob — one bad entry should not blank the
 *  admin's other labels. */
function readLabelMap(x: unknown): Record<string, string> | null {
  if (!isPlainObject(x)) return null
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(x)) if (typeof v === 'string') out[k] = v
  return out
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
    const { date, events, eventKinds, blocked, blockedReason, ph } = d
    if (typeof date !== 'string') return null
    // At LEAST two event lines (the historic default), and any number beyond
    // that (an admin can add rows since 18 Aug 26). Every entry a string.
    if (!Array.isArray(events) || events.length < 2) return null
    if (events.some(e => typeof e !== 'string')) return null
    if (typeof blocked !== 'boolean' || typeof ph !== 'boolean') return null
    if (typeof blockedReason !== 'string') return null
    // Instance tags are READ LENIENTLY, like the window and the bands: absent
    // on every war stored before per-event tags (18 Aug 26) and that means
    // "untagged", which is exactly how those wars behaved. An entry that is
    // not a known kind reads as null rather than failing the day.
    const readKinds: (EventKind | null)[] = Array.isArray(eventKinds)
      ? eventKinds.map(k => (typeof k === 'string' && EVENT_KINDS.includes(k as EventKind) ? (k as EventKind) : null))
      : []
    readDays.push({ date, events: [...events], eventKinds: readKinds, blocked, blockedReason, ph })
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
      const { line, from: bf, to: bt, text, kind } = b
      // Any row an admin can have (variable event rows, 18 Aug 26) — the old
      // `0 | 1` check silently dropped a band on an added row at reload.
      if (typeof line !== 'number' || !Number.isInteger(line) || line < 0 || line >= MAX_EVENT_ROWS) continue
      if (typeof bf !== 'string' || typeof bt !== 'string' || typeof text !== 'string') continue
      if (bt < bf || bf < start || bt > end) continue
      if (bandOverlaps(readBands, line, bf, bt)) continue
      // The band's instance tag, read as leniently as the days' (null when
      // absent or unrecognised).
      const bk = typeof kind === 'string' && EVENT_KINDS.includes(kind as EventKind) ? (kind as EventKind) : null
      readBands.push({ line, from: bf, to: bt, text, kind: bk })
    }
  }

  /* LEGACY OIL-CREDIT MIGRATION (bug pass, 28 Aug 26): a war stored before
     the FS/HS → FO/HO rename holds the old letters, which parseCell no
     longer recognises — reconcile below would drop their ownership records
     and strand dead grid strings neither reverse sweep can collect, and
     `ingestDutyCredit` would clash on those dates forever. Renamed in place
     at the one load door (the seedGrid HO→*OIL migration precedent). No
     live path hits this today — main.tsx boots the memory backend — but the
     DB era makes this load path real, and the migration must already be
     standing when it does. */
  if (isPlainObject(grid)) {
    for (const row of Object.values(grid as Record<string, unknown>)) {
      if (!isPlainObject(row)) continue
      for (const [d, c] of Object.entries(row as Record<string, unknown>)) {
        if (c === 'FS') (row as Record<string, unknown>)[d] = 'FO'
        else if (c === 'HS') (row as Record<string, unknown>)[d] = 'HO'
      }
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
// medical OR OIL-credit cell's raptor OWNERSHIP record — those are what keep
// a synced cell read-only and reverse-clearable across a reload. Dropping a
// medical one here would let the outbound pass re-mint an input for a row
// Raptor itself wrote (the loop the source model exists to prevent);
// dropping an OIL one (FO/HO — a pre-existing gap, found and closed
// 28 Aug 26 while this store still boots on the memory backend) would
// orphan the credit — the reverse sweep clears only source:'raptor' cells,
// so a no-longer-earned credit would sit uncollectable forever once real
// persistence (the DB era) makes this load path live. A BID-sourced record
// on either stays drift — `setCell` never writes one — and an 'approved'
// left on a cell that no longer holds any such code would colour it wrong,
// so both are still dropped.
function reconcile(grid: Grid, states: States): States {
  const out: States = {}
  for (const [id, row] of Object.entries(states)) {
    const kept: Record<string, BidRecord> = {}
    for (const [date, record] of Object.entries(row)) {
      const code = grid[id]?.[date]
      // A duty cell keeps its record when Raptor owns it, or when an admin
      // wrote a reason on a hand-typed FO/HO (setCellNote, 2 Sep 26) — the
      // note is the record's whole reason to exist there.
      if (isBiddable(code) || ((isMedical(code) || isDuty(code)) && (record.source === 'raptor' || (isDuty(code) && !!record.note)))) kept[date] = record
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
  const oilPolicy = readStored('oilpolicy', readOilPolicy) ?? { ...DEFAULT_OIL_POLICY }
  const figureOrder = readStored('figorder', readFigureOrder) ?? [...DEFAULT_FIGURE_ORDER]
  const rosterOrder = readStored('rosterorder', readIdList) ?? []
  const persLabels = readStored('perslabels', readLabelMap) ?? {}
  const manningOrder = readStored('manningorder', readIdList) ?? []
  const manningHidden = readStored('manninghidden', readIdList) ?? []
  /* Untrusted storage: keep only structurally sound entries, then PRUNE against
     the catalogue we have at boot (the seed's three keys; the projection
     re-prunes as soon as Raptor's real catalogue lands — see setQualCatalog). */
  const groupDefs = pruneGroups(readStored('groupdefs', readGroupDefs) ?? [...DEFAULT_GROUPS], state.qualCatalog)
  const groupPriority = readStored('grouppriority', readIdList) ?? []
  // The squadron's own rule set, or — for a browser from before rules were
  // data — the seed with its old numbers-only overlay migrated in.
  const storedRules = readStored('manningdefs', readManningRules)
  const requirements: Requirements = storedRules
    ? { default: { rules: storedRules }, overrides: {} }
    : requirementsWith(readStored('manningthresh', readThreshMap) ?? {})
  const eventRows = readStored('eventrows', x =>
    typeof x === 'number' && Number.isInteger(x) && x >= DEFAULT_EVENT_ROWS && x <= MAX_EVENT_ROWS ? x : null,
  ) ?? DEFAULT_EVENT_ROWS
  const showSans = readStored('showsans', x => (typeof x === 'boolean' ? x : null)) ?? false

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
  state = withCurrent({ ...state, wars, currentId, openings, ledger, oilPolicy, eventDefs, figureOrder, rosterOrder, persLabels, manningOrder, manningHidden, groupDefs, groupPriority, requirements, eventRows, showSans })

  version = 0
  listeners.clear()
  // Baseline undo/redo to the freshly loaded world. main.tsx re-baselines once
  // more after the demo world and the first sync pass are in (so those boot
  // writes fold into the baseline rather than becoming undo steps); this keeps
  // the stack sane for the standalone unit suite, which boots the store alone.
  lwHistInit()
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
  backend.write('oilpolicy', JSON.stringify(state.oilPolicy))
  backend.write('eventdefs', JSON.stringify(state.eventDefs))
  backend.write('figorder', JSON.stringify(state.figureOrder))
  backend.write('rosterorder', JSON.stringify(state.rosterOrder))
  backend.write('perslabels', JSON.stringify(state.persLabels))
  backend.write('manningorder', JSON.stringify(state.manningOrder))
  backend.write('manninghidden', JSON.stringify(state.manningHidden))
  backend.write('groupdefs', JSON.stringify(state.groupDefs))
  backend.write('grouppriority', JSON.stringify(state.groupPriority))
  backend.write('manningdefs', JSON.stringify(state.requirements.default.rules))
  backend.write('eventrows', JSON.stringify(state.eventRows))
  backend.write('showsans', JSON.stringify(state.showSans))
  /* `people` deliberately absent: the roster is a projection of Raptor's
     PEOPLE (see initStore) — persisting it would store a copy that can only
     disagree with the projection the next boot installs. The roster ORDER and
     the personnel LABELS are kept instead: they are the admin's arrangement
     of that projection, keyed by id, so they survive a roster that gains or
     loses a body. */

  // A save IS an undo step: record the durable snapshot now that the backend
  // holds it (the UNDO / REDO block below). Skipped while a restore or a
  // sync-driven write holds the lock, and a no-op when nothing durable moved.
  recordHistory()
}

/* =====================================================================
   UNDO / REDO (owner, 30 Aug 26 — "Add undo and redo on leave war")
   ---------------------------------------------------------------------
   A snapshot stack over the DURABLE state — precisely the fields persist()
   writes. The push lives inside persist(), because in this store a save and a
   user edit are the same event: every path that changes the war ends in
   persist()+notify(), and the pure-view notifiers (setRole / setViewer /
   focusDay / setPeople) call notify() WITHOUT persist, so they make no step.

   NOT in the snapshot, on purpose:
   - currentId / focus / role / viewer — navigation and who-is-looking, not
     edits; an undo must not switch wars or change the viewer. Switching wars
     instead RE-BASELINES the stack (selectWar), so undo is scoped to the war
     on screen — the same rule the scheduler follows per week.
   - people / qualCatalog / personEdits — a live PROJECTION of Raptor's roster
     (sync.ts), owned by Raptor's Quals page; undo here must not fight it.

   Raptor-DRIVEN grid writes (the four sync writers: ingestFromRaptor,
   ingestDutyCredit, clearRaptorCell, withdrawLeaveCell) run under `locked`, so
   a change Raptor pushed never becomes a Leave War undo step — undoing a cell
   Raptor still holds an input for would only be re-applied by the next
   reconcile pass, growing the stack forever. A restore (historyApply) is
   locked for the same reason AND so the sync reconcilers it wakes — which
   converge the Raptor side to the restored grid, retracting or re-minting
   inputs exactly as sync.ts's wiring note anticipates ("an Undo that removes
   an lw-tagged row") — do not themselves push a step.
   ===================================================================== */
const HIST: { stack: string[]; ix: number; lock: boolean; cap: number } =
  { stack: [], ix: -1, lock: false, cap: 60 }

/** Run `fn` with history recording suppressed, re-entrancy safe: a nested
 *  lock restores to the OUTER value, so an inner `finally` can never unlock a
 *  restore (or an outer sync pass) that is still in flight. */
function locked<T>(fn: () => T): T {
  const was = HIST.lock
  HIST.lock = true
  try {
    return fn()
  } finally {
    HIST.lock = was
  }
}

/** The durable state, serialised — the same field set persist() writes, minus
 *  `current` (which war is on screen is navigation, not an edit). */
function historySnap(): string {
  const s = state
  return JSON.stringify({
    wars: s.wars, openings: s.openings, ledger: s.ledger, oilPolicy: s.oilPolicy, eventDefs: s.eventDefs,
    figureOrder: s.figureOrder, rosterOrder: s.rosterOrder, persLabels: s.persLabels,
    manningOrder: s.manningOrder, manningHidden: s.manningHidden,
    groupDefs: s.groupDefs, groupPriority: s.groupPriority,
    requirements: s.requirements, eventRows: s.eventRows, showSans: s.showSans,
  })
}

/** Push a snapshot after a durable change: drop the redo tail, cap the stack,
 *  and treat an identical snapshot (nothing durable moved — a same-value write,
 *  or a bare war-switch whose only change was `current`) as a no-op. */
function recordHistory(): void {
  if (HIST.lock) return
  const snap = historySnap()
  if (HIST.stack[HIST.ix] === snap) return
  HIST.stack.splice(HIST.ix + 1)
  HIST.stack.push(snap)
  if (HIST.stack.length > HIST.cap) HIST.stack.shift()
  HIST.ix = HIST.stack.length - 1
}

/** Baseline the stack to the state on screen — called once at boot (main.tsx,
 *  after the demo world and the first sync pass are installed) and again
 *  whenever a different war comes on screen (selectWar). */
export function lwHistInit(): void {
  HIST.stack = [historySnap()]
  HIST.ix = 0
  HIST.lock = false
}

export function lwCanUndo(): boolean {
  return HIST.ix > 0
}
export function lwCanRedo(): boolean {
  return HIST.ix < HIST.stack.length - 1
}

/** Bumped on every restore (undo OR redo). The matrix watches it to drop any
 *  transient gesture state a restore would otherwise strand — an in-progress
 *  MOVE, an open selection, a landing preview — the way the schedule's undo
 *  calls armDrop/prunePreviews. Without it, undoing mid-move left the grid in
 *  move mode with a selection whose cells the undo had just cleared, so the
 *  next drag was read as a move-landing and no sheet opened (bug test, 30 Aug
 *  26). A plain notify is too broad to key off — a sync pass mid-move would
 *  cancel it — so this fires for a restore and nothing else. */
let historyEpoch = 0
export function lwHistEpoch(): number {
  return historyEpoch
}

/** Restore snapshot `i`. Locked across the whole apply so neither the restore
 *  itself nor the sync reconcilers `notify()` wakes push a new step; the
 *  `notify()` inside the lock is what lets sync converge the Raptor side to the
 *  restored grid. */
function historyApply(i: number): void {
  if (i < 0 || i >= HIST.stack.length) return
  const snap = JSON.parse(HIST.stack[i]) as Pick<State,
    'wars' | 'openings' | 'ledger' | 'oilPolicy' | 'eventDefs' | 'figureOrder' | 'rosterOrder'
    | 'persLabels' | 'manningOrder' | 'manningHidden' | 'groupDefs'
    | 'groupPriority' | 'requirements' | 'eventRows' | 'showSans'>
  HIST.ix = i
  historyEpoch++   // signal the matrix to drop any in-flight gesture (see above)
  locked(() => {
    // withCurrent republishes period/grid/states from the restored wars and
    // the CURRENT currentId — the war on screen does not change, only its data.
    state = withCurrent({ ...state, ...snap })
    persist()
    notify()
  })
}

/** Step back / forward one edit. No-ops (not errors) at the ends, so the
 *  buttons may call them freely and read lwCanUndo / lwCanRedo for disabled. */
export function lwUndo(): void {
  if (lwCanUndo()) historyApply(HIST.ix - 1)
}
export function lwRedo(): void {
  if (lwCanRedo()) historyApply(HIST.ix + 1)
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
    // Record the override so the live re-projection keeps it. Raptor owns
    // identity and `reprojectRoster` refreshes every person from Raptor's
    // projection by default; without this entry the next Raptor notify would
    // snap this deliberate local edit straight back to the projected value.
    personEdits: { ...state.personEdits, [id]: { ...state.personEdits[id], ...patch } },
  })
  persist()
  notify()
  return true
}

/**
 * Post a person OUT from a date, or clear it (owner, 18 Aug 26 — "PO… they are
 * not counted in the manpower… grey with diagonal stripe through the boxes").
 *
 * `fromDate` is the first day they are GONE, so their last day in the squadron
 * is the day before — `to = fromDate − 1`. Everything from `fromDate` on then
 * reads as posted out: `inSquadron` is false there, which the grey `.gone`
 * hatch and the `PO` chip already key off, and which every manning count
 * (`countsFor` → `availabilityOf`) already treats as zero. `null` clears the
 * post-out (the undo). ADMIN-gated, checked here — the role switch is an
 * affordance, so the store is the only place it can mean anything.
 *
 * ANY date is legal, not just a day of the loaded war (owner, 19 Aug 26 —
 * "prior to this date to infinity… now till the future infinity… and also
 * custom dates"): a past date strikes the person's whole history from there,
 * a date beyond the war's end simply has nothing on screen to grey yet. Only
 * a malformed string is refused — same line as every guard rail: refuse
 * malformed data, never a decision.
 *
 * `archive` is the sheet's "Archive on PO date" switch (default ON): when the
 * date arrives, sync.ts's auto-archive pass moves the Raptor body into the
 * Quals archive. Stored explicitly true/false so a `to` that was NOT set
 * through this path (the demo overlay) stays untouched by that pass; clearing
 * the post-out clears the flag with it.
 *
 * Session-only like the rest of this store, and safe against the live
 * re-projection: `reprojectRoster` refreshes each person's identity from
 * Raptor's projection but preserves posting-out (`from`/`to`/`poArchive`)
 * explicitly, so this window survives every Raptor notify.
 */
export function setPostOut(id: string, fromDate: string | null, archive = true): boolean {
  if (state.role !== 'admin') return false
  if (fromDate !== null && !/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) return false
  const person = state.people.find(p => p.id === id)
  if (!person) return false
  const to = fromDate ? addDays(fromDate, -1) : null
  state = withCurrent({
    ...state,
    people: state.people.map(p =>
      (p.id === id ? { ...p, to, poArchive: fromDate ? archive : undefined } : p)),
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
 * The roster in display order (owner, 18 Aug 26). ALWAYS grouped: every group
 * in `GROUP_ORDER`, and WITHIN each group the members ordered by the admin's
 * hand-order (or the categorised default). Grouping the output — rather than
 * returning a flat hand-order — means the groups are always contiguous, so the
 * matrix draws exactly one heading per group; a cross-group drag reorders a
 * person within their own group (they cannot leave the category their CAT puts
 * them in) instead of stranding a row under a duplicated heading.
 */
export function displayRoster(): Person[] {
  const order = state.rosterOrder.length ? state.rosterOrder : autoOrder(state.people)
  const pos = new Map(order.map((id, i) => [id, i]))
  const out: Person[] = []
  /* The groups the ADMIN configured, in their display order, and the separate
     priority order that decides who claims a person matching several (owner,
     28 Aug 26). With the default list this is byte-identical to the old
     GROUP_ORDER walk — the built-ins are mutually exclusive and cover everyone. */
  const defs = groupsInOrder()
  const priority = groupPriorityIds()
  const home = new Map(state.people.map(p => [p.id, assignGroup(p, defs, priority)]))
  for (const d of defs) {
    const members = state.people.filter(p => home.get(p.id) === d.id)
    // A body missing from the saved order (just arrived) sinks to the end of
    // its group rather than jumping to the top.
    members.sort((a, b) => (pos.get(a.id) ?? Infinity) - (pos.get(b.id) ?? Infinity))
    out.push(...members)
  }
  /* Anyone no configured group claims still gets a row — under "Everyone else",
     always last. Without this an admin whose list is all qualifications would
     drop people off the grid entirely. */
  const rest = state.people.filter(p => !defs.some(d => home.get(p.id) === d.id))
  rest.sort((a, b) => (pos.get(a.id) ?? Infinity) - (pos.get(b.id) ?? Infinity))
  out.push(...rest)
  return out
}

/** The configured group list, pruned to the live qual catalogue and in the
 *  admin's display order. One body, so every reader agrees. */
export function groupsInOrder(): GroupDef[] {
  const defs = pruneGroups(state.groupDefs.length ? state.groupDefs : DEFAULT_GROUPS, state.qualCatalog)
  const ids = orderedGroupIds(defs, state.groupDefs.map(d => d.id))
  return ids.map(id => defs.find(d => d.id === id)!).filter(Boolean)
}

/** The tie-break order — the admin's priority list, healed against the groups
 *  that exist. Empty priority falls back to the display order. */
export function groupPriorityIds(): string[] {
  return orderedGroupIds(groupsInOrder(), state.groupPriority)
}

/** Which group a person is drawn under, for callers that need the answer
 *  without walking the whole roster (the group editor's counts, the matrix). */
export function groupIdOf(p: Person): string {
  return assignGroup(p, groupsInOrder(), groupPriorityIds())
}

/** Every group an admin can pick from — the seven built-ins plus one per
 *  qualification the squadron currently has. Grows on its own. */
export function offerableGroupList(): GroupDef[] {
  return offerableGroups(state.qualCatalog)
}

/** Replace the group list (add / remove / reorder). ADMIN-gated, like every
 *  other arrangement writer. Pruned on the way in so a stale qualification
 *  cannot be stored back. */
export function setGroupDefs(defs: GroupDef[]): void {
  if (state.role !== 'admin') return
  state = withCurrent({ ...state, groupDefs: pruneGroups(defs, state.qualCatalog) })
  persist()
  notify()
}

/**
 * Add a group to the roster AND rank it FIRST in the who-wins order.
 *
 * Appending it to the display list alone made the control dead (bug sweep, 28
 * Aug 26): `orderedGroupIds` puts an unranked id at the BOTTOM of the priority
 * list, and the seven built-ins are exhaustive — `groupOf` always returns one
 * of them — so every person was already claimed before the walk ever reached
 * the new group. Adding "SC Day" changed nothing on the grid at all, while the
 * editor beside it reported 44 people in it.
 *
 * So a new group is ranked ABOVE THE CATEGORIES — inserted just before the
 * first `cat` group in the priority order, not flatly at the front. Both halves
 * of that matter. Above the categories is the owner's own rule ("if theres a cat
 * c column, but there is also a SC D column. They should always show up in the
 * qualifications column instead of CAT"). Not at the front is what keeps ADD
 * ORDER intact: front-insertion would make each new group outrank the one added
 * before it, so adding SC Day then SC Night would silently demote SC Day.
 *
 * This sets the priority ONCE, at the moment of adding; the admin drags it
 * anywhere afterwards and nothing here touches it again. Removing a group and
 * adding it back is therefore not a no-op — it promotes it, which is the only
 * reading of "add" that does anything at all.
 */
export function addGroup(d: GroupDef): void {
  if (state.role !== 'admin') return
  const defs = pruneGroups([...groupsInOrder(), d], state.qualCatalog)
  if (!defs.some(x => x.id === d.id)) return    // a qual key the catalogue lost
  const byId = new Map(defs.map(x => [x.id, x]))
  const rest = groupPriorityIds().filter(id => id !== d.id)
  const at = rest.findIndex(id => byId.get(id)?.kind === 'cat')
  const priority = at < 0 ? [...rest, d.id] : [...rest.slice(0, at), d.id, ...rest.slice(at)]
  state = withCurrent({ ...state, groupDefs: defs, groupPriority: priority })
  persist()
  notify()
}

/** Move one group before another in the DISPLAY order (the drag). Mirrors
 *  `moveRosterRow` / `moveManningRowTo`, guard included. ADMIN-gated. */
export function moveGroupTo(id: string, beforeId: string | null): void {
  if (state.role !== 'admin') return
  if (beforeId === id) return
  const defs = groupsInOrder()
  const from = defs.findIndex(d => d.id === id)
  if (from < 0) return
  const [moved] = defs.splice(from, 1)
  const at = beforeId ? defs.findIndex(d => d.id === beforeId) : defs.length
  defs.splice(at < 0 ? defs.length : at, 0, moved!)
  setGroupDefs(defs)
}

/** Move one group in the PRIORITY order — the separate who-wins list. */
export function moveGroupPriorityTo(id: string, beforeId: string | null): void {
  if (state.role !== 'admin') return
  if (beforeId === id) return
  const ids = groupPriorityIds()
  const from = ids.indexOf(id)
  if (from < 0) return
  ids.splice(from, 1)
  const at = beforeId ? ids.indexOf(beforeId) : ids.length
  ids.splice(at < 0 ? ids.length : at, 0, id)
  state = withCurrent({ ...state, groupPriority: ids })
  persist()
  notify()
}

/** Put the roster grouping back to the seven built-ins. ADMIN-gated. */
export function resetGroups(): void {
  if (state.role !== 'admin') return
  state = withCurrent({ ...state, groupDefs: [...DEFAULT_GROUPS], groupPriority: [] })
  persist()
  notify()
}

/** A ground-crew body's label: the admin's override if set, else the projected
 *  default (Raptor's `flight`). */
export function personLabel(p: Person): string {
  return state.persLabels[p.id] ?? p.label ?? ''
}

/**
 * Write the roster's row order. ADMIN-gated, the `figureOrder` rule: a member
 * does not rearrange the roster (the drag handles and Auto-sort do not render
 * for them). An empty array clears back to the categorised default.
 */
export function setRosterOrder(order: string[]): void {
  if (state.role !== 'admin') return
  state = withCurrent({ ...state, rosterOrder: order })
  persist()
  notify()
}

/** Re-group everyone into the categorised order — the Auto-sort button. */
export function autoSortRoster(): void {
  setRosterOrder(autoOrder(state.people))
}

/**
 * Move one row to sit before `beforeId` (or to the end when null) — one
 * edit-mode drag. It materialises the CURRENT display order first (so the
 * first drag off the categorised default captures where every row actually
 * was) and writes the whole new order, keeping this the one write path the
 * admin gate covers.
 */
export function moveRosterRow(id: string, beforeId: string | null): void {
  if (state.role !== 'admin') return
  /* "before itself" is where it already is — and without this guard it was
     worse than a no-op: the splice below removes `id` first, so indexOf then
     misses and the row silently jumped to the END (review hardening, 19 Aug
     26, alongside the drag machine's insert-after rework) */
  if (beforeId === id) return
  const ids = displayRoster().map(p => p.id)
  const from = ids.indexOf(id)
  if (from < 0) return
  ids.splice(from, 1)
  const at = beforeId ? ids.indexOf(beforeId) : ids.length
  ids.splice(at < 0 ? ids.length : at, 0, id)
  setRosterOrder(ids)
}

/**
 * Set (or clear) a ground-crew body's free-text label. ADMIN-gated. An empty
 * string removes the override, so the row falls back to the projected default.
 */
export function setPersLabel(id: string, label: string): void {
  if (state.role !== 'admin') return
  const persLabels = { ...state.persLabels }
  const clean = label.trim()
  if (clean) persLabels[id] = clean
  else delete persLabels[id]
  state = withCurrent({ ...state, persLabels })
  persist()
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

/**
 * The demo OIL story (state/demoworld.ts), laid over the seed at boot — the
 * second boot-only writer beside `remapPersonKeys` and under the same
 * contract: no persist, no undo step, deterministic, and called BEFORE the
 * re-key so its seed-id keys are re-keyed with everything else. Each cell
 * lands in the war holding its date (a date no war holds is dropped — the
 * seed's wars cover 2026 and 2027 whole); states and ledger entries merge in.
 * The tests never see it — they build the store from the pristine seed.
 */
export function installDemoOil(extra: { grid: Grid; states: States; ledger: Ledger }): void {
  const wars = state.wars.map(w => {
    const grid: Grid = { ...w.grid }
    const states: States = { ...w.states }
    for (const [person, row] of Object.entries(extra.grid)) {
      for (const [date, code] of Object.entries(row)) {
        if (warHolding(state.wars, date) !== w) continue
        grid[person] = { ...(grid[person] ?? {}), [date]: code }
        const rec = extra.states[person]?.[date]
        if (rec) states[person] = { ...(states[person] ?? {}), [date]: rec }
      }
    }
    return { ...w, grid, states }
  })
  const have = new Set(state.ledger.map(e => e.id))
  const ledger = [...state.ledger, ...extra.ledger.filter(e => !have.has(e.id))]
  state = withCurrent({ ...state, wars, ledger })
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

/** The viewing person — Raptor's "View as" selection, mirrored on every
 *  change by `setMe` (state/auth.ts) and once at boot by main.tsx. Not
 *  persisted, same reasoning as the role above. */
export function setViewer(next: string | null): void {
  if (next === state.viewer) return
  state = withCurrent({ ...state, viewer: next })
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
  // ...and the ROW: a member writes only their own row (the person they are
  // viewing as), an admin any. The grid stops offering another row's cell, but
  // this is the backstop that makes it true — a stray write path can never
  // put one member's leave onto another man's row (owner, 27 Aug 26).
  if (!canEditRow(state.role, state.viewer, personId)) return

  const clean = code.trim().toUpperCase()
  // ...and the VOCABULARY: the medical markers are management's (owner,
  // 17 Aug 26 — "for management only"). Every sheet already offers them to
  // an admin alone, but until this line the store took an HL from anyone —
  // the one vocabulary the affordance gated that the write path did not.
  if (isMedical(clean) && state.role !== 'admin') return
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
  // the vocabulary gate setCell carries — evaluated once out here, and kept in
  // the predicate below so the count reports the refusal instead of silently
  // absorbing it
  const medBlocked = isMedical(code.trim().toUpperCase()) && state.role !== 'admin'

  // Suppressed for the run, then released once. Without this a fortnight is
  // fourteen persists and fourteen re-renders, and every subscriber sees the
  // range half-written thirteen times.
  quiet = true
  try {
    for (let d = from; d <= to; d = addDays(d, 1)) {
      const allowed =
        !raptorOwns(state.states, personId, d) &&
        canEditCell(state.period, state.role, d) &&
        canEditRow(state.role, state.viewer, personId) &&
        !medBlocked &&
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

/* ---- THE DRAG-SELECTION BATCH WRITERS (owner, 27 Aug 26) -----------------
   The grid gained a drag-to-select layer, so an action can now name MANY
   cells across many people at once. These wrap `setCell`/`setBidState` under
   the same `quiet` suppression `setCellRange` uses — one save-and-notify for
   the whole batch, not one per cell — and carry the SAME per-cell guards, so
   a batch can never write where a single cell could not: raptor-owned cells,
   locked dates and out-of-squadron days are skipped, never forced. Partial
   BY DESIGN, exactly like `setCellRange`: a fortnight that clips one blocked
   day writes the rest and reports the skip. `quiet` is saved and restored
   (not hard-cleared) so these stay safe if one is ever nested.
   The role gate is per-writer: fill/clear ride `canEditCell` (a member fills
   what they could fill one cell at a time); decide and move are admin's. */

/** Write one code across a hand-picked set of cells. `{written, skipped}` in
 *  the `setCellRange` shape. */
export function setCells(cells: { personId: string; date: string }[], code: string): RangeWrite {
  let written = 0
  let skipped = 0
  const wasQuiet = quiet
  // the vocabulary gate setCell carries, reported by the count rather than
  // silently absorbed (see setCellRange)
  const medBlocked = isMedical(code.trim().toUpperCase()) && state.role !== 'admin'
  quiet = true
  try {
    for (const { personId, date } of cells) {
      // Clearing an EMPTY cell is not a write and not a refusal — a loose
      // delete-box sweeps up empty cells around the bids, and counting them
      // as "deleted" made the sheet report deletions that never existed.
      // They simply don't count either way.
      if (!code && state.grid[personId]?.[date] === undefined) continue
      const person = state.people.find(p => p.id === personId)
      const allowed =
        !raptorOwns(state.states, personId, date) &&
        canEditCell(state.period, state.role, date) &&
        canEditRow(state.role, state.viewer, personId) &&
        !medBlocked &&
        (!person || inSquadron(person, date))
      if (!allowed) { skipped++; continue }
      setCell(personId, date, code)
      written++
    }
  } finally {
    quiet = wasQuiet
  }
  if (written > 0 && !quiet) { persist(); notify() }
  return { written, skipped }
}

/** Clear a set of cells — the empty-code path of `setCells`, named so the
 *  caller (and the tests) read as delete, not "write nothing". */
export function clearCells(cells: { personId: string; date: string }[]): RangeWrite {
  return setCells(cells, '')
}

/** Decide a set of bids at once — ADMIN ONLY (a decision is management's, the
 *  same as the single `setBidState` is only offered on the admin's closed
 *  sheet). Per cell it needs a biddable, non-Raptor cell, so a mixed
 *  selection decides the bids and skips the rest. */
export function setBidStates(cells: { personId: string; date: string }[], bid: BidState): { decided: number; skipped: number } {
  if (!canDecide(state.period.stage, state.role)) return { decided: 0, skipped: cells.length }
  let decided = 0
  let skipped = 0
  const wasQuiet = quiet
  quiet = true
  try {
    for (const { personId, date } of cells) {
      if (raptorOwns(state.states, personId, date) || !isBiddable(state.grid[personId]?.[date])) { skipped++; continue }
      setBidState(personId, date, bid)
      decided++
    }
  } finally {
    quiet = wasQuiet
  }
  if (decided > 0 && !quiet) { persist(); notify() }
  return { decided, skipped }
}

/** Record a decision on a bid — ADMIN ONLY, once bidding is no longer open
 *  (`canDecide`, the same body the sheet renders by). The old "deliberately
 *  not role-gated: there is no login" note pre-dated the Raptor merge; there
 *  IS a login now, the role rides it with a ceiling a member cannot climb,
 *  and this batch's own doctrine is that the store is what makes a rule true
 *  — the batch sibling `setBidStates` above was already gated, and a gate
 *  the single writer didn't share was a drift seam, not a decision. */
export function setBidState(personId: string, date: string, bid: BidState): void {
  if (!canDecide(state.period.stage, state.role)) return
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
export function setDayEvent(date: string, line: number, text: string, kind: EventKind | null = null): boolean {
  if (state.role !== 'admin') return false
  if (!state.period.days.some(d => d.date === date)) return false
  updateCurrent(w => ({
    ...w,
    period: {
      ...w.period,
      days: w.period.days.map(d => (d.date === date ? writeDayEvent(d, line, text, kind) : d)),
    },
  }))
  return true
}

/** Copy a day's event lines and write one, padding with '' so a row beyond the
 *  stored array's end (a just-added row) can be written into rather than
 *  silently dropped. The one place events are mutated. */
function writeEventLine(events: string[], line: number, text: string): string[] {
  const out = [...events]
  while (out.length <= line) out.push('')
  out[line] = text
  return out
}

/** A day with one event slot written — text AND its instance tag together
 *  (owner, 18 Aug 26: the tag rides the event, not the type library). Every
 *  write sets both: an edit that drops the tag must clear the stored one, or
 *  yesterday's tag would silently colour today's different word. */
function writeDayEvent(d: DayInfo, line: number, text: string, kind: EventKind | null): DayInfo {
  const kinds = [...(d.eventKinds ?? [])]
  while (kinds.length <= line) kinds.push(null)
  kinds[line] = text ? kind : null // a cleared event keeps no tag behind
  return { ...d, events: writeEventLine(d.events, line, text), eventKinds: kinds }
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
export function setDayEventRange(from: string, to: string, line: number, text: string, kind: EventKind | null = null): boolean {
  if (state.role !== 'admin') return false
  if (to < from) return false
  updateCurrent(w => ({
    ...w,
    period: {
      ...w.period,
      days: w.period.days.map(d => {
        if (d.date < from || d.date > to) return d
        if (bandCoversDate(w.period.bands, line, d.date)) return d
        return writeDayEvent(d, line, text, kind)
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
export function addEventBand(line: number, from: string, to: string, text: string, kind: EventKind | null = null): EventBandResult {
  if (state.role !== 'admin') return 'forbidden'
  if (to < from) return 'backwards'
  if (from < state.period.start || to > state.period.end) return 'outside'
  if (bandOverlaps(state.period.bands, line, from, to)) return 'overlap'
  updateCurrent(w => ({
    ...w,
    period: {
      ...w.period,
      bands: [...w.period.bands, { line, from, to, text, kind }],
      days: w.period.days.map(d =>
        d.date < from || d.date > to || !d.events[line] ? d : writeDayEvent(d, line, '', null)),
    },
  }))
  return 'set'
}

/** Remove the merged band on `line` that covers `date`. Admin-only. A no-op
 *  when no band is there. The days it covered keep their (empty) per-day text —
 *  the band cleared them on the way in; a fresh edit refills them. */
export function removeEventBand(line: number, date: string): boolean {
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
function bandCoversDate(bands: EventBand[], line: number, date: string): boolean {
  return bands.some(b => b.line === line && b.from <= date && date <= b.to)
}

/** Why an event move was refused. Mirrors `MoveResult` for the roster. */
export type EventMoveResult = 'moved' | { reason: 'nothing' | 'outside' | 'overlap' }

/** The validation half of `moveEvent`, held apart so the grid's landing preview
 *  can ask "would this move go?" BEFORE painting it — the same split (and the
 *  same drift-seam reason) `moveProblem`/`moveCells` keep for the roster.
 *  `from`/`to` are the event's own span: `from === to` for a plain single-day
 *  event, the band's two ends for a merged bar. Returns null when the move is
 *  clear, else the reason. Admin-only, like every event mutator. */
export function moveEventProblem(line: number, from: string, to: string, dayDelta: number): Exclude<EventMoveResult, 'moved'> | null {
  if (state.role !== 'admin') return { reason: 'nothing' }
  if (!dayDelta) return { reason: 'nothing' }
  const nFrom = addDays(from, dayDelta), nTo = addDays(to, dayDelta)
  if (nFrom < state.period.start || nTo > state.period.end) return { reason: 'outside' }
  const band = state.period.bands.find(b => b.line === line && b.from === from && b.to === to)
  if (band) {
    // the shifted span must not overlap ANOTHER band on this line (itself excluded)
    if (state.period.bands.some(b => b !== band && b.line === line && nFrom <= b.to && b.from <= nTo)) return { reason: 'overlap' }
  } else {
    // a plain single-day event: there must be one to move, and its one landing
    // day must be free of a band and of another day's event on this line
    const sday = state.period.days.find(d => d.date === from)
    if (!sday || !sday.events[line]) return { reason: 'nothing' }
    if (bandCoversDate(state.period.bands, line, nFrom)) return { reason: 'overlap' }
    const tday = state.period.days.find(d => d.date === nFrom)
    if (tday && tday.events[line]) return { reason: 'overlap' }
  }
  return null
}

/** Move a whole event — a merged band OR a single-day event — by a day-delta:
 *  the event-line counterpart of `moveCells` (owner, 31 Aug 26 — "drag an
 *  existing event to move it, just like LL"). ONE atomic write, so it is one
 *  undo step and never leaves a half-moved event; validated by
 *  `moveEventProblem` first, so a refused move changes nothing. A band keeps its
 *  text and instance tag; a single-day event carries its stored `eventKinds`
 *  tag along. Admin-only. */
export function moveEvent(line: number, from: string, to: string, dayDelta: number): EventMoveResult {
  const problem = moveEventProblem(line, from, to, dayDelta)
  if (problem) return problem
  const nFrom = addDays(from, dayDelta), nTo = addDays(to, dayDelta)
  const band = state.period.bands.find(b => b.line === line && b.from === from && b.to === to)
  if (band) {
    updateCurrent(w => ({
      ...w,
      period: {
        ...w.period,
        bands: [...w.period.bands.filter(b => b !== band), { line, from: nFrom, to: nTo, text: band.text, kind: band.kind ?? null }],
        // clear any stray per-day text under the new span, the same rule addEventBand applies
        days: w.period.days.map(d => (d.date >= nFrom && d.date <= nTo && d.events[line]) ? writeDayEvent(d, line, '', null) : d),
      },
    }))
  } else {
    const src = state.period.days.find(d => d.date === from)
    const text = src?.events[line]
    if (!text) return { reason: 'nothing' }
    const kind = (src?.eventKinds?.[line] ?? null) as EventKind | null
    updateCurrent(w => ({
      ...w,
      period: {
        ...w.period,
        days: w.period.days.map(d => {
          if (d.date === from) return writeDayEvent(d, line, '', null)   // clear the source
          if (d.date === nFrom) return writeDayEvent(d, line, text, kind) // land the target
          return d
        }),
      },
    }))
  }
  return 'moved'
}

/** Add one more EVENT row (owner, 18 Aug 26 — "add more event rows if needed"),
 *  up to `MAX_EVENT_ROWS`. ADMIN-gated; returns whether it grew so a control
 *  can disable at the cap. Nothing to migrate — a day's `events` array grows
 *  the first time the new row is written into (`writeEventLine`), and a row
 *  past a day's stored length reads '' until then. */
export function addEventRow(): boolean {
  if (state.role !== 'admin') return false
  if (state.eventRows >= MAX_EVENT_ROWS) return false
  state = withCurrent({ ...state, eventRows: state.eventRows + 1 })
  persist()
  notify()
  return true
}

/**
 * THE SANS ENABLE FUNCTION (owner, 18 Aug 26 — "we will not show the SANS in
 * the leave war however there is a function to still enable this"). SANS
 * aircrew are excluded from the roster PROJECTION by default; flipping this on
 * asks the next projection to include them. The switch itself changes no
 * roster — sync.ts's reprojectRoster reads it and re-projects on the notify
 * this write fires, so the rows appear (or leave) at once. ADMIN-gated like
 * every squadron-wide config; surfaced in the matrix's Rearrange toolbar.
 */
export function setShowSans(on: boolean): boolean {
  if (state.role !== 'admin') return false
  if (state.showSans === !!on) return true
  state = withCurrent({ ...state, showSans: !!on })
  persist()
  notify()
  return true
}

/** Why removing the last event row was refused. */
export type RemoveEventRowResult = 'removed' | 'min' | 'nonempty' | 'forbidden'

/** Remove the LAST event row. ADMIN-gated, never below the default two, and
 *  refused if that row still carries any text or band on the current war
 *  (`'nonempty'`) so nothing vanishes unseen — the admin clears it first. This
 *  guard is also what keeps `columnKindFor` honest: it scans every stored event
 *  line, so a row is only ever dropped from view once it is provably empty. */
/* Does ANY war hold text or a band on this event line? `eventRows` is
   squadron-wide across every war, so the remove guard below (and the button
   state in Matrix.tsx) must look at ALL of them (review fix, 19 Aug 26) —
   checking only the open war let an admin remove a row that still carried an
   "Exercise" in another year's war, leaving that text, its column tint and
   its OIL effects invisible with nothing left to see or clear them by. */
export function eventRowUsed(line: number): boolean {
  return state.wars.some(w =>
    w.period.days.some(d => (d.events[line] ?? '') !== '') ||
    w.period.bands.some(b => b.line === line))
}

export function removeEventRow(): RemoveEventRowResult {
  if (state.role !== 'admin') return 'forbidden'
  if (state.eventRows <= DEFAULT_EVENT_ROWS) return 'min'
  if (eventRowUsed(state.eventRows - 1)) return 'nonempty'
  state = withCurrent({ ...state, eventRows: state.eventRows - 1 })
  persist()
  notify()
  return 'removed'
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

/* THE OIL TRACKER writers (owner, 2 Sep 26 — "admin can only edit the list,
   members can only view it"). ADMIN-GATED at the write path like every other
   management surface. The tracker itself is DERIVED (engine/oiltracker.ts);
   what an admin writes is the LEDGER (a grant, a correction, an edit or a
   deletion of one — the first interface the ledger has ever had) and the
   POLICY (expiry, default history window). Earned FO/HO days are never
   written here: they are the publish wire's cells, read straight off the
   grid, and a ledger copy would be the two-records-of-one-fact counters.ts
   refuses. */

export const MAX_REASON = 120
/** The optional "given by" on a grant (owner, 2 Sep 26) — a name or a post. */
export const MAX_GIVEN_BY = 40
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

/** Everything a figure needs to read a person's number, from the live state
 *  — ONE builder so the column, the picker, the breakdown, the Cinch sheet,
 *  the bid-time warning and the tracker all read the same OIL policy and the
 *  same "today". Four hand-built literals used to do this; they could drift. */
export function figureCtxOf(): FigureCtx {
  return { openings: state.openings, ledger: state.ledger, sources: state.wars, oilPolicy: state.oilPolicy, asOf: localToday() }
}

export function setOilPolicy(patch: Partial<OilPolicy>): boolean {
  if (state.role !== 'admin') return false
  // Through the untrusted reader on purpose: it is the one place the bounds
  // live, so a sheet cannot store a policy the next boot would throw away.
  const next = readOilPolicy({ ...state.oilPolicy, ...patch })
  if (!next) return false
  state = withCurrent({ ...state, oilPolicy: next })
  persist()
  notify()
  return true
}

/** The sentence that stops a bad ledger write, or null. Stricter than the
 *  boot reader (which tolerates any string date and a zero amount, so an
 *  older stored ledger still loads): a NEW entry with no date or nothing in
 *  it is a mistake worth telling the admin about. */
function ledgerProblem(amount: number, date: string, reason: string, givenBy = ''): string | null {
  if (!Number.isFinite(amount) || amount === 0) return 'The amount must be a number other than 0'
  if (!ISO_DAY.test(date)) return 'Pick a date'
  const clean = reason.trim()
  if (!clean) return 'Give a reason'
  if (clean.length > MAX_REASON) return `A reason is at most ${MAX_REASON} characters`
  if (givenBy.trim().length > MAX_GIVEN_BY) return `Given by is at most ${MAX_GIVEN_BY} characters`
  return null
}

/** Ids are `ol-N`, N past the highest one stored — deterministic (no clock),
 *  so two grants in one batch, or one right after another, never collide. */
function ledgerSeq(): number {
  let max = 0
  for (const e of state.ledger) {
    const m = /^ol-(\d+)$/.exec(e.id)
    if (m) max = Math.max(max, Number(m[1]))
  }
  return max
}

/** The approver stamped on a grant: the CALLSIGN of whoever is viewing
 *  (`viewer` is a person id and would leak on screen), or "admin". */
function approverName(): string {
  return state.people.find(p => p.id === state.viewer)?.callsign ?? 'admin'
}

/**
 * Credit OIL to one or many people at once — the tracker's "credit N
 * people" (owner: "drag and select all WSOs to put OIL, date and reason").
 * A NEGATIVE amount is a correction, not a second mechanism (§Counters).
 * Returns the error sentence for the sheet, or null on success. One state
 * write for the whole batch → one persist, one undo step.
 */
export function grantOil(personIds: string[], amount: number, date: string, reason: string, givenBy = ''): string | null {
  if (state.role !== 'admin') return 'Only an admin can credit OIL'
  const ids = [...new Set(personIds)].filter(id => state.people.some(p => p.id === id))
  if (!ids.length) return 'Pick at least one person'
  const problem = ledgerProblem(amount, date, reason, givenBy)
  if (problem) return problem
  const approvedBy = approverName()
  const by = givenBy.trim()
  let n = ledgerSeq()
  const entries: Ledger = ids.map(personId => ({
    id: `ol-${++n}`, personId, counter: 'oil' as const, amount, date, reason: reason.trim(), approvedBy,
    ...(by ? { givenBy: by } : {}),
  }))
  state = withCurrent({ ...state, ledger: [...state.ledger, ...entries] })
  persist()
  notify()
  return null
}

/** Edit a grant in place — amount, date or reason. The approver stays who it
 *  was; the edit is visible in undo, which is the audit trail here. */
export function updateLedgerEntry(id: string, patch: { amount?: number; date?: string; reason?: string; givenBy?: string }): string | null {
  if (state.role !== 'admin') return 'Only an admin can edit OIL'
  const cur = state.ledger.find(e => e.id === id)
  if (!cur) return 'That entry is gone'
  const amount = patch.amount ?? cur.amount
  const date = patch.date ?? cur.date
  const reason = patch.reason ?? cur.reason
  const givenBy = (patch.givenBy ?? cur.givenBy ?? '').trim()
  const problem = ledgerProblem(amount, date, reason, givenBy)
  if (problem) return problem
  state = withCurrent({
    ...state,
    ledger: state.ledger.map(e => {
      if (e.id !== id) return e
      const { givenBy: _g, ...rest } = e
      return { ...rest, amount, date, reason: reason.trim(), ...(givenBy ? { givenBy } : {}) }
    }),
  })
  persist()
  notify()
  return null
}

export function removeLedgerEntry(id: string): boolean {
  if (state.role !== 'admin') return false
  if (!state.ledger.some(e => e.id === id)) return false
  state = withCurrent({ ...state, ledger: state.ledger.filter(e => e.id !== id) })
  persist()
  notify()
  return true
}

/**
 * Set a person's BALANCE of a counter to read exactly `target` now (owner,
 * 2 Sep 26 — "enable me to manually input and change LVE BAL … every time a
 * LL or OL is taken it deducts from it"). A balance is never stored
 * (counters.ts), so this moves the OPENING FIGURE by whatever makes
 * `opening + granted − drawn` equal the target; the leave already on the
 * grid stays counted and every LL/OL after this deducts as before. The
 * breakdown sheet shows the new opening, so the number is explained, not
 * hidden.
 */
export function setBalance(personId: string, counter: CounterName, target: number): boolean {
  if (state.role !== 'admin') return false
  if (!state.people.some(p => p.id === personId)) return false
  if (!Number.isFinite(target)) return false
  const opening = target - grantedTo(state.ledger, personId, counter) + drawnFrom(state.wars, personId, counter)
  state = withCurrent({
    ...state,
    openings: { ...state.openings, [personId]: { ...state.openings[personId], [counter]: Math.round(opening * 1e6) / 1e6 || 0 } },
  })
  persist()
  notify()
  return true
}

/* THE COUNTER-COLUMN FIGURE ORDER writers. ADMIN-GATED (owner, 17 Aug 26:
   "normal user should not have authority to change the leave war column
   arrangement") — the enforcement is in each writer below, mirroring the
   event-type library. (The counter SELECTION — which figure the column shows —
   stays ungated view state; only the ORDER is management's.) Persisted under
   `figorder`. The order is normalised through `orderedFigures` on every move,
   so a stored blob missing a new figure (or naming a dead one) is healed the
   first time it is touched rather than carried forward malformed. */

/** Move a figure one place up (`-1`) or down (`+1`) the column's order.
 *  Clamped at the ends and a no-op for an unknown id — returns whether it
 *  moved so a caller can disable a control at the boundary. */
export function moveFigure(id: string, dir: -1 | 1): boolean {
  // The column arrangement is management's (owner, 17 Aug 26: "normal user
  // should not have authority to change the leave war column arrangement").
  // Enforced here and not only in the sheet, for the same reason setCell
  // re-checks: the interface hides what a person may not do, the store is
  // what makes it true.
  if (state.role !== 'admin') return false
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
  // Same gate as moveFigure — a reset rewrites the arrangement too.
  if (state.role !== 'admin') return
  state = withCurrent({ ...state, figureOrder: [...DEFAULT_FIGURE_ORDER] })
  persist()
  notify()
}

/* THE MANNING COUNT ROWS' order and visibility (owner, 18 Aug 26: "allow me to
   rearrange or hide some rows that are not needed. Admin only."). Same shape and
   same admin gate as the figure order above; persisted under `manningorder` /
   `manninghidden`. The canonical row set is the DEFAULT requirement's rules
   (plus the set rule when there is one); a per-day override that adds a rule the
   default lacks is reconciled in the interface (CountRows), which is the only
   place that walks every day's actual results. */

/** The rule ids the manning block can draw, in their natural order — `'sets'`
 *  when a set rule exists, then each default rule's id. */
export function manningRowIds(): string[] {
  return state.requirements.default.rules.map(r => r.id)
}

/** The manning rows in DISPLAY order: the admin's hand-order first (unknown ids
 *  dropped), then any not named appended in natural order — the `orderedPeople`
 *  rule, so a rule added to the default after an order was saved still appears
 *  rather than vanishing. Hidden rows are still IN this list; hiding is applied
 *  at render, so Rearrange mode can show and un-hide them. */
export function orderedManningIds(): string[] {
  const all = manningRowIds()
  if (!state.manningOrder.length) return all
  const known = new Set(all)
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of state.manningOrder) if (known.has(id) && !seen.has(id)) { out.push(id); seen.add(id) }
  for (const id of all) if (!seen.has(id)) out.push(id)
  return out
}

/** Move one manning row up (`-1`) or down (`+1`). Clamped at the ends; returns
 *  whether it moved so a control can disable at the boundary. ADMIN-gated. */
export function moveManningRow(id: string, dir: -1 | 1): boolean {
  if (state.role !== 'admin') return false
  const ids = orderedManningIds()
  const i = ids.indexOf(id)
  if (i < 0) return false
  const j = i + dir
  if (j < 0 || j >= ids.length) return false
  ;[ids[i], ids[j]] = [ids[j], ids[i]]
  state = withCurrent({ ...state, manningOrder: ids })
  persist()
  notify()
  return true
}

/**
 * Move one manning row to sit before `beforeId` (or to the end when null) — the
 * drag-and-drop reorder (owner, 28 Aug 26, replacing the ▲▼ arrows with the
 * same drag the roster rows already use). Same shape as `moveRosterRow`:
 * materialise the current display order, splice `id` out, reinsert before the
 * target, write the whole order. ADMIN-gated. */
export function moveManningRowTo(id: string, beforeId: string | null): void {
  if (state.role !== 'admin') return
  // "before itself" is where it already is — and the splice removes `id` first,
  // so without this guard indexOf would miss and the row would jump to the end
  // (the same trap moveRosterRow guards).
  if (beforeId === id) return
  const ids = orderedManningIds()
  const from = ids.indexOf(id)
  if (from < 0) return
  ids.splice(from, 1)
  const at = beforeId ? ids.indexOf(beforeId) : ids.length
  ids.splice(at < 0 ? ids.length : at, 0, id)
  state = withCurrent({ ...state, manningOrder: ids })
  persist()
  notify()
}

/** Hide or show one manning row. ADMIN-gated. */
export function toggleManningRow(id: string): void {
  if (state.role !== 'admin') return
  const hidden = new Set(state.manningHidden)
  hidden.has(id) ? hidden.delete(id) : hidden.add(id)
  state = withCurrent({ ...state, manningHidden: [...hidden] })
  persist()
  notify()
}

/** Put every manning row back — natural order, nothing hidden. ADMIN-gated. */
export function resetManning(): void {
  if (state.role !== 'admin') return
  state = withCurrent({ ...state, manningOrder: [], manningHidden: [] })
  persist()
  notify()
}

/**
 * Set one manning row's amber/red lines (owner, 19 Aug 26 — "when does the
 * amber show or red show on the box… is customisable"). ADMIN-gated like the
 * row order; the guard-rails line applies — refuse MALFORMED (not a finite
 * non-negative number, or a row that does not exist), accept any decision:
 * amber below red simply means there is no amber band, the SXO seed's own
 * idiom, and refusing it would refuse the seed. Returns whether it wrote, so
 * the sheet can keep its fields on a refusal.
 */
export function setManningThreshold(id: string, amber: number, red: number): boolean {
  if (state.role !== 'admin') return false
  if (!Number.isFinite(amber) || amber < 0 || !Number.isFinite(red) || red < 0) return false
  const rules = state.requirements.default.rules
  if (!rules.some(r => r.id === id)) return false
  const next = rules.map(r => (r.id === id ? { ...r, threshold: { amber, red } } : r))
  state = withCurrent({ ...state, requirements: { ...state.requirements, default: { rules: next } } })
  persist()
  notify()
  return true
}

/** Put one row's amber/red lines back to the built-in default — only a row
 *  the seed still knows has one; a counter the admin built is its own
 *  default. ADMIN-gated. */
export function resetManningThreshold(id: string): void {
  if (state.role !== 'admin') return
  const seedT = seedRequirements().default.rules.find(r => r.id === id)?.threshold
  if (!seedT) return
  setManningThreshold(id, seedT.amber, seedT.red)
}

/**
 * Create or rework one counter (owner, 19 Aug 26). The rule is pushed through
 * the SAME validator the storage read uses, so the form cannot save a shape a
 * reload would drop. An existing id is replaced in place — the row keeps its
 * position and its hidden flag; a new id is appended and `orderedManningIds`'
 * tail rule shows it at the bottom. ADMIN-gated; returns whether it wrote.
 */
export function saveManningRule(rule: ManningRule): boolean {
  if (state.role !== 'admin') return false
  const clean = readManningRule(rule)
  if (!clean) return false
  const rules = state.requirements.default.rules
  const next = rules.some(r => r.id === clean.id)
    ? rules.map(r => (r.id === clean.id ? clean : r))
    : [...rules, clean]
  state = withCurrent({ ...state, requirements: { ...state.requirements, default: { rules: next } } })
  persist()
  notify()
  return true
}

/** Delete one counter outright (owner, 19 Aug 26 — "these counters can also
 *  be deleted"). Its order and hidden entries go with it, so nothing keeps a
 *  dead id alive; a SEEDED id deleted here stays deleted (the stored list is
 *  the whole truth), and `resetManningRules` is the road back. ADMIN-gated. */
export function deleteManningRule(id: string): boolean {
  if (state.role !== 'admin') return false
  const rules = state.requirements.default.rules
  if (!rules.some(r => r.id === id)) return false
  state = withCurrent({
    ...state,
    requirements: { ...state.requirements, default: { rules: rules.filter(r => r.id !== id) } },
    manningOrder: state.manningOrder.filter(x => x !== id),
    manningHidden: state.manningHidden.filter(x => x !== id),
  })
  persist()
  notify()
  return true
}

/** Put the BUILT-IN counter set back — the recovery path when a seeded row
 *  was deleted or reworked beyond recognition. Counters the admin created
 *  are discarded with everything else, which is what "reset" says; the
 *  toolbar arms the button so one stray tap cannot do it. ADMIN-gated. */
export function resetManningRules(): void {
  if (state.role !== 'admin') return
  state = withCurrent({ ...state, requirements: seedRequirements(), manningOrder: [], manningHidden: [] })
  persist()
  notify()
}

/** Install Raptor's live qualification catalogue for the counter form's
 *  chips — the projection's rider, change-guarded by the caller like the
 *  roster itself. Not persisted and not admin-gated: it is derived squadron
 *  vocabulary, not a decision. */
export function setQualCatalog(catalog: QualDef[]): void {
  /* A group pinned to a qualification the squadron has since deleted would
     draw an empty heading nobody could remove, so the group list is re-pruned
     whenever the catalogue moves (28 Aug 26). This is not an admin write — it
     is the catalogue's own consequence — so it carries no role gate; it only
     ever REMOVES a group whose qualification no longer exists. */
  const groupDefs = pruneGroups(state.groupDefs, catalog)
  const changed = groupDefs.length !== state.groupDefs.length
  state = withCurrent({ ...state, qualCatalog: catalog, ...(changed ? { groupDefs } : {}) })
  if (changed) persist()
  notify()
}

/** Walk the period to its next stage. A no-op at the end of the cycle —
 *  `nextStage` owns which transitions exist. ADMIN ONLY (owner, 27 Aug 26 —
 *  "for a member, i shouldnt be able to click on bidding closed or published,
 *  thats an admin function"): moving the cycle forward is a management act,
 *  the mirror of `reopenStage`'s existing admin-only step back. Re-checked at
 *  the write, not just hidden in the strip, the same reason `reopenStage`
 *  and `setBidWindow` re-check. Members otherwise bid exactly as before —
 *  this is the ONLY member-facing change to the war. */
export function advanceStage(): void {
  if (state.role !== 'admin') return
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
  // Held under `locked`: a Raptor-driven write is never a Leave War undo step
  // (see the UNDO / REDO block). The body is otherwise untouched.
  return locked(() => ingestFromRaptorImpl(personId, date, code))
}
function ingestFromRaptorImpl(personId: string, date: string, code: string): IngestResult {
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
 * Only `FO` and `HO` come through here: they are the two codes nobody bids
 * for that Raptor's schedule can mint (published work — or an acknowledged
 * duty-&-commitments input — on a non-working day, `engine/oil.ts`), which
 * is exactly the gap ingest's `isBiddable` gate exists to refuse. The
 * ownership record is the same `{approved, raptor}` shape, and deliberately
 * so — every guard that keeps a hand off a synced leave cell (setCell's
 * refusal, outbound's skip, `clearRaptorCell`'s narrowness) protects a
 * credit identically, and the schedule stays the only thing that can move
 * it. A cell already holding anything else — a leave bid, a course, a
 * hand-typed marker — is the clash: write nothing, a human decides (the
 * wire surfaces it). A hand-typed FO/HO matching the schedule's verdict is
 * not a clash, it is the squadron having recorded the same fact first —
 * taken over in place, exactly like ingest's confirming upgrade.
 */
export function ingestDutyCredit(personId: string, date: string, code: 'FO' | 'HO', why?: string): IngestResult {
  // Locked like ingestFromRaptor — a sync-driven credit is not an undo step.
  return locked(() => ingestDutyCreditImpl(personId, date, code, why))
}
function ingestDutyCreditImpl(personId: string, date: string, code: 'FO' | 'HO', why?: string): IngestResult {
  if (code !== 'FO' && code !== 'HO') return 'ignored'
  const war = warHolding(state.wars, date)
  if (!war) return 'ignored'

  const existing = war.grid[personId]?.[date]
  const owned = raptorOwns(war.states, personId, date)
  /* An owned cell is only this wire's to move while it holds this wire's own
     vocabulary (FO/HO — the hours changed, the credit follows). An owned cell
     holding a LEAVE code is wire 2's: overwriting it would set the two passes
     flipping one cell forever, so the man reading as on leave AND on duty is
     surfaced as the clash it is, and leave keeps the cell until a human moves
     one of the two records. */
  if (existing && existing !== code && !(owned && (existing === 'FO' || existing === 'HO'))) return 'clash'
  const confirming = existing === code && !owned

  const row = { ...(war.grid[personId] ?? {}), [date]: code }
  const note = (why ?? '').trim().slice(0, MAX_CELL_NOTE)
  const srow = {
    ...(war.states[personId] ?? {}),
    [date]: { state: 'approved', source: 'raptor', ...(note ? { note } : {}) } as BidRecord,
  }
  updateWar(war.period.id, w => ({
    ...w,
    grid: { ...w.grid, [personId]: row },
    states: { ...w.states, [personId]: srow },
  }))
  return confirming ? 'confirmed' : 'written'
}

/**
 * The REASON on a hand-entered FO/HO credit (owner, 2 Sep 26 — a manual OIL
 * credit typed on the grid "will bring me to the OIL tracker page to
 * include the reason"). Admin only; the cell must hold FO or HO. The note
 * rides on the cell's record, the same field the sync wire fills for an
 * earned credit, so the tracker reads both the same way. An empty note
 * clears it. Undo covers it because `states` is in the snapshot.
 */
export function setCellNote(personId: string, date: string, note: string): string | null {
  if (state.role !== 'admin') return 'Only an admin can edit OIL'
  const war = warHolding(state.wars, date)
  if (!war) return 'That day is in no war'
  const code = war.grid[personId]?.[date]
  if (code !== 'FO' && code !== 'HO') return 'Only an FO or HO credit takes a reason'
  const clean = note.trim()
  if (clean.length > MAX_CELL_NOTE) return `A reason is at most ${MAX_CELL_NOTE} characters`
  const cur = war.states[personId]?.[date] ?? ({ state: 'approved', source: 'bid' } as BidRecord)
  const { note: _old, ...rest } = cur
  const rec: BidRecord = clean ? { ...rest, note: clean } : rest
  updateWar(war.period.id, w => ({
    ...w,
    states: { ...w.states, [personId]: { ...(w.states[personId] ?? {}), [date]: rec } },
  }))
  return null
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
  // Locked: a sync-driven delete is not a Leave War undo step.
  return locked(() => clearRaptorCellImpl(personId, date))
}
function clearRaptorCellImpl(personId: string, date: string): boolean {
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

/**
 * Withdraw one cell of Leave-War-owned leave — the mirror of `clearRaptorCell`
 * for the OTHER ownership, and the piece that makes editing or deleting a
 * synced input on Raptor's Inputs page carry back here (owner, 17 Aug 26 —
 * "make sure both leave war and input, edits or deletes are sync").
 *
 * A synced input row derives from approved cells this store owns. When that
 * row is edited or deleted on the Inputs page, the change IS the squadron
 * speaking — leaving the cells behind would make the next reconcile re-mint
 * the very row that was just changed (the snap-back this closes). Narrow on
 * purpose, twice over: a Raptor-owned cell is wire 2's and is never touched
 * here (its input is its record), and the cell must still hold EXACTLY the
 * notation the row derived from — a cell the squadron has since rebid says
 * something newer than the row being retired, and the reconcile is the one
 * that sorts that disagreement out, not this.
 *
 * Ignores stage, role and the bidding window for the same reason ingest and
 * `clearRaptorCell` do: Raptor's word arrives already decided.
 */
export function withdrawLeaveCell(personId: string, date: string, code: string): boolean {
  // Locked: this fires only when a synced input is edited/deleted on Raptor's
  // Inputs page — a Raptor-driven change, not a Leave War undo step.
  return locked(() => withdrawLeaveCellImpl(personId, date, code))
}
function withdrawLeaveCellImpl(personId: string, date: string, code: string): boolean {
  const war = warHolding(state.wars, date)
  if (!war) return false
  if (raptorOwns(war.states, personId, date)) return false
  if (war.grid[personId]?.[date] !== code) return false
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

/** What a shift did, or why it did nothing. `window` covers every "not an
 *  editable day" refusal: outside the stage/window this role may write, off
 *  the war's own calendar (a typed date the war has no column for), or on a
 *  day the person has left the squadron. */
export type ShiftResult = 'shifted' | 'occupied' | 'raptor' | 'nothing' | 'window'

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
  // A member moves only their own row's bids (owner, 27 Aug 26). The sheet
  // that reaches here already only opens on the member's own row, but the
  // write path is what makes it true.
  if (!canEditRow(state.role, state.viewer, personId)) return 'nothing'
  if (raptorOwns(state.states, personId, from)) return 'raptor'
  // The same day law `moveCells` enforces per cell, which this single-cell
  // sibling was missing: both ends must be days this role may write (a member
  // cannot slide a bid once the war closes, nor outside the bid window), and
  // the LANDING day must exist on the war's own calendar and inside the
  // person's time in the squadron. Without the calendar check a typed date —
  // the Move field is a keyed input, and min/max on a date input are advisory
  // — could land a bid on a day no column renders: gone from every screen,
  // still draining the leave balance. That is `setBidWindow`'s wrong-year
  // typo, and the answer is the same: refuse, never absorb.
  if (!canEditCell(state.period, state.role, from)) return 'window'
  if (!canEditCell(state.period, state.role, to)) return 'window'
  if (!state.period.days.some((d: any) => d.date === to)) return 'window'
  const person = state.people.find(p => p.id === personId)
  if (person && !inSquadron(person, to)) return 'window'
  // Never overwrite. Moving one man's leave onto a day he already has
  // something booked would destroy the second booking to save the first.
  // Shifting onto its own date lands here too, which is right: it is not a
  // move, and treating it as one would rewrite the record for nothing.
  if (state.grid[personId]?.[to]) return 'occupied'

  const row = { ...(state.grid[personId] ?? {}) }
  delete row[from]
  row[to] = code

  const srow = { ...(state.states[personId] ?? {}) }
  // The ORIGIN survives a chain of moves: a bid moved 23 → 30 → Feb 6 was
  // still BID on the 23rd, and the trail exists so the ledger can answer
  // exactly that — "moved from the 30th" would trace to a date nobody asked
  // for. Read before the delete below takes the old record with it.
  const origin = srow[from]?.shiftedFrom ?? from
  delete srow[from]
  // Record the moved-from trace ONLY once bidding has closed — the same rule as
  // moveCells: a shift while the war is OPEN is ordinary shuffling and leaves no
  // stripe (owner, 27 Aug 26).
  srow[to] = biddingClosed(state.period.stage)
    ? { state: 'pending', source: 'bid', shiftedFrom: origin }
    : { state: 'pending', source: 'bid' }

  updateCurrent(w => ({
    ...w,
    grid: { ...w.grid, [personId]: row },
    states: { ...w.states, [personId]: srow },
  }))
  return 'shifted'
}

/** Does this cell hold a bid THIS role may move? The same conditions
 *  `moveCells` guards each source by (below): not Raptor-owned, a real
 *  biddable bid, editable in the current stage/window, and on a row this role
 *  owns (a member's own, an admin's any). Kept as one body so the sheet
 *  (whether to offer Move at all), the anchor (which day is the block's first
 *  input) and the mover all read the SAME rule — a second copy would be a
 *  drift seam. */
function isMovableSource(personId: string, date: string): boolean {
  return !raptorOwns(state.states, personId, date)
    && isBiddable(state.grid[personId]?.[date])
    && canEditCell(state.period, state.role, date)
    // A member slides only their OWN bids (owner, 27 Aug 26). Folding the row
    // rule in here carries it to every reader of this one body at once: the
    // sheet (whether to offer Move), the anchor and the mover's source guard.
    && canEditRow(state.role, state.viewer, personId)
}

/** The cells of a selection that actually hold a movable bid — the drag-move
 *  acts on the inputs PRESENT in the box and ignores the empty cells around
 *  them (owner, 27 Aug 26 — "move items … that are present … if I select more
 *  area than required it registers as nothing"). The caller filters with this
 *  before a move, both to skip the empties and to anchor the slide on the
 *  block's first input. */
export function movableCells(cells: { personId: string; date: string }[]): { personId: string; date: string }[] {
  return cells.filter(c => isMovableSource(c.personId, c.date))
}

export type MoveResult = 'moved' | { reason: 'nothing' | 'raptor' | 'occupied' | 'window'; at?: string }
/** Move a whole SELECTION by a day-delta — the drag-select "Move" (owner,
 *  27 Aug 26). ATOMIC on purpose: every source and every landing day is
 *  validated FIRST, and only an all-clear applies — a half-moved block is a
 *  worse state than a refused move, and there is no undo here. Each cell
 *  lands on its own row shifted by the same delta, `{state:'pending', source,
 *  shiftedFrom}` exactly as `shiftBid` lands one. A cell whose landing day is
 *  another SELECTED cell's source is fine (the block is sliding over itself),
 *  so the occupied check excludes the selection's own sources. Role-gated by
 *  `canEditCell` like `shiftBid` — a member may slide bids they could shift
 *  one at a time; medical/PO never reach here (not biddable / admin-only). */
/** The validation half of `moveCells`, held apart so the grid's landing
 *  preview can ask "would this move actually go?" BEFORE painting it — a
 *  preview that shows half a landing the atomic commit then wholly refuses is
 *  a lie, and a second copy of these guards in the UI would be the drift seam
 *  this store exists to prevent. Returns null when the move is clear, else
 *  the same `{reason, at}` the commit reports. */
export function moveProblem(cells: { personId: string; date: string }[], dayDelta: number): Exclude<MoveResult, 'moved'> | null {
  if (!dayDelta || cells.length === 0) return { reason: 'nothing' }
  const dayset = new Set(state.period.days.map((d: any) => d.date))
  const sources = new Set(cells.map(c => `${c.personId}|${c.date}`))
  // every source must be a movable bid this role may edit — the same guards
  // `isMovableSource` carries, kept inline here only to name a precise reason
  // per cell. A member may slide only their OWN row's bids: another row is
  // "nothing you may move" (owner, 27 Aug 26). The affordance already filters
  // through `movableCells`, so this is the backstop against a direct call.
  for (const c of cells) {
    if (!canEditRow(state.role, state.viewer, c.personId)) return { reason: 'nothing', at: c.date }
    if (raptorOwns(state.states, c.personId, c.date)) return { reason: 'raptor', at: c.date }
    if (!isBiddable(state.grid[c.personId]?.[c.date])) return { reason: 'nothing', at: c.date }
    if (!canEditCell(state.period, state.role, c.date)) return { reason: 'window', at: c.date }
  }
  // every landing day must be a real, editable, in-squadron day this role owns,
  // and empty of anything not itself sliding away
  for (const c of cells) {
    const to = addDays(c.date, dayDelta)
    if (!dayset.has(to)) return { reason: 'window', at: to }
    if (!canEditCell(state.period, state.role, to)) return { reason: 'window', at: to }
    const person = state.people.find(p => p.id === c.personId)
    if (person && !inSquadron(person, to)) return { reason: 'window', at: to }
    if (raptorOwns(state.states, c.personId, to)) return { reason: 'occupied', at: to }
    const occ = state.grid[c.personId]?.[to]
    if (occ && !sources.has(`${c.personId}|${to}`)) return { reason: 'occupied', at: to }
  }
  return null
}

export function moveCells(cells: { personId: string; date: string }[], dayDelta: number): MoveResult {
  const problem = moveProblem(cells, dayDelta)
  if (problem) return problem
  // apply as ONE write: clone the touched rows, drop every source, then land
  // every target (all deletes before any set, so a self-overlapping slide
  // never deletes a day it has just filled)
  const grid: Record<string, Record<string, string>> = {}
  const states: Record<string, any> = {}
  for (const pid of new Set(cells.map(c => c.personId))) {
    grid[pid] = { ...(state.grid[pid] ?? {}) }
    states[pid] = { ...(state.states[pid] ?? {}) }
  }
  // A move only leaves a "moved" trail (shiftedFrom) once bidding has CLOSED —
  // that is a management shift, the thing the mark and the OIL audit exist to
  // trace. While bidding is OPEN people shuffle their own bids freely, so an
  // open-bidding move is a clean re-place with NO provenance: without this the
  // trail was recorded on every open move and surfaced the moment the war
  // closed, painting an orange stripe on a bid the squadron had simply tidied
  // (owner, 27 Aug 26 — "I shouldn't see the stripes… only after bidding is
  // closed AND the input is moved"). Clearing shiftedFrom on the open re-place
  // also drops any stale trail a prior closed-era move had left.
  const tracked = biddingClosed(state.period.stage)
  // `origin` rather than `from`: the trail survives a CHAIN of moves — a bid
  // moved 23 → 30 → Feb 6 was still bid on the 23rd, and that is the date the
  // ledger exists to answer with (same rule as shiftBid). Read here, before
  // the delete loop takes the old records with it.
  const moves = cells.map(c => ({
    pid: c.personId, from: c.date, to: addDays(c.date, dayDelta),
    code: state.grid[c.personId][c.date],
    origin: state.states[c.personId]?.[c.date]?.shiftedFrom ?? c.date,
  }))
  for (const m of moves) { delete grid[m.pid][m.from]; delete states[m.pid][m.from] }
  for (const m of moves) {
    grid[m.pid][m.to] = m.code
    states[m.pid][m.to] = tracked
      ? { state: 'pending', source: 'bid', shiftedFrom: m.origin }
      : { state: 'pending', source: 'bid' }
  }
  updateCurrent(w => ({ ...w, grid: { ...w.grid, ...grid }, states: { ...w.states, ...states } }))
  return 'moved'
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
  // Undo is scoped to the war on screen: switching wars starts a fresh stack,
  // so an undo can never reach back and silently rewrite the war just left
  // (the same per-context re-baseline the scheduler does on loadWeek). The
  // persist() above made no step of its own — only `current` changed.
  lwHistInit()
}

/**
 * Install a full set of wars into the live store, replacing whatever is there,
 * and select `currentId` (falling back to the first war if that id is absent).
 *
 * The raw blob is validated through the SAME `readWars` path a stored blob
 * would have taken at boot, so its states reconcile against their grid exactly
 * as a persisted war did — returns false and changes nothing if it does not
 * pass. It does not persist: this is a live injection, not a save.
 *
 * Its one caller is the e2e probe bridge. Leave War is session-only now (a
 * memory backend, see main.tsx), so the under-manned fixtures — which used to
 * inject a red-day war by writing `leavewar:wars` into localStorage before
 * boot — can no longer reach the store that way. They boot the app, then push
 * the same war object in through here. Not a production path.
 */
export function loadWars(raw: unknown, currentId: string): boolean {
  const wars = readWars(raw)
  if (!wars) return false
  const id = wars.some(w => w.period.id === currentId) ? currentId : wars[0].period.id
  state = withCurrent({ ...state, wars, currentId: id })
  notify()
  // A wholesale world swap re-baselines undo — an undo must not reach back to
  // the world that was here before the injection (same rule as selectWar).
  lwHistInit()
  return true
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
