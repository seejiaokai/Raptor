// The store. A war keeps only its OWN records (requests, OIL credits,
// replaced-bid notices — engine/warrecs.ts); approved and filed absences are
// Raptor Inputs, READ through the merge (state/merge.ts) and changed only
// through the absence door ([ARCH-STACK] step 4). `setCell` is the only path
// that writes a request; every write persists through the backend, bumps the
// version and notifies. A write that skips these is invisible and unsaved.

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
  SANS_GROUP,
  SANS_GROUP_ID,
  type GroupDef,
  inSquadron,
  isBiddable,
  isDuty,
  isMedical,
  windowFits,
  canReopen,
  nextStage,
  previousStage,
  COUNTERS,
  DEFAULT_FIGURE_ORDER,
  orderedFigures,
  type Figure,
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
  seatRank,
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
  pickDefaultPeriodId,
  defaultFocusDate,
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
  type Recs,
  type WarRec,
  type RequestRec,
  type CreditRec,
  type NoticeRec,
  type RequestState,
  type Contrib,
  readRecs,
  recsAt,
  withList,
  recContribs,
  newRecId,
  isCredit,
  liveRequestsOn,
  portionOfCode,
  requestWin,
  barsWrite,
  forbiddenPair,
  isSickCode,
  isLeaveCode,
  parseCell,
  FULL,
  MAX_REC_NOTE,
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
import { mergeWar, absencesAt, absenceVersion, type MergedWar, type Views } from './merge'
import { counterLabel } from '../engine/counters'
import { localBackend, memoryBackend, type StorageBackend } from './storage'
/* [ARCH-STACK] Step 2 phase 4 — the shared command layer (see the persist()
   router below). Imported here so a Leave War user edit joins the SAME change
   stream + auth gate every module funnels through. */
import {
  commit as cmdCommit, isCommitting as cmdIsCommitting, deferEffect as cmdDeferEffect,
  definePermission as cmdDefinePermission, anyone as cmdAnyone, registerRecord as cmdRegisterRecord,
  commitProjection as cmdCommitProjection, isInReducer as cmdIsInReducer,
  registerGuardedStore as cmdRegisterGuardedStore, registerEffectContext as cmdRegisterEffectContext,
  isQueued, isOk,
} from '../../command'
import type { EnlistableStore as CmdEnlistableStore, RecordEntry as CmdRecordEntry, Scope as CmdScope } from '../../command'

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
  // The current war's period, republished at the top level by `withCurrent()`
  // on every change. (Its grid/states/views are the MERGED read's —
  // `getState()` adds them; the raw state never holds them.)
  period: Period
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
  /** The figures an admin has hidden from the column's cycle and the drawer
   *  (owner, 6 Sep 26 — "admin should also be able to customise"). Persisted
   *  under `fighidden`, ADMIN-gated at the write path like `figureOrder`; read
   *  leniently (unknown ids are ignored by `visibleFigures`). At least one
   *  figure always stays visible — the column cannot show nothing. */
  figureHidden: string[]
  /** WHICH GROUPS the roster is drawn in, top to bottom (owner, 28 Aug 26 —
   *  the admin group editor). The seven built-ins by default; an admin may add
   *  a group per QUALIFICATION and drag the order. ADMIN-gated, same rule as
   *  `manningOrder`. Read leniently and pruned against the live qual catalogue,
   *  so a group pinned to a deleted Quals column cannot strand an empty
   *  heading. */
  groupDefs: GroupDef[]
  /** WHO CLAIMS someone matching several groups — a person shows exactly once,
   *  and this decides where. By DEFAULT it FOLLOWS the display order (owner,
   *  3 Sep 26 — "the priority order should also change by default in accordance
   *  with the category order"): the group higher on the page wins a tie, so
   *  dragging the page around reorders who-wins with it. Only meaningful once
   *  `groupPriorityCustom` is set — until then this list is ignored and the
   *  display order is used. */
  groupPriority: string[]
  /** Whether the admin has set a CUSTOM who-wins order, breaking the "follows the
   *  display order" default (owner, 3 Sep 26 — "only if the user is not satisfied
   *  then they change the priority order in the settings"). Set the first time the
   *  who-wins list is dragged; cleared by "Match the page order" and by
   *  `resetGroups`. Persisted (`grouppriocustom`), admin-gated like the orders. */
  groupPriorityCustom: boolean
  /** The COLOUR the admin picked for a qualification group (owner, 3 Sep 26 —
   *  "allow me to pick the colour i want"), by group id, `#rrggbb`. Only `q:`
   *  groups take one (the built-ins wear their CAT colours); a group with no
   *  entry falls back to a palette colour derived from its id (ui/groupColor.ts).
   *  Persisted (`groupcolors`), admin-gated, dropped with the group. */
  groupColors: Record<string, string>

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
   *  PERSISTED since the storage seam (8 Sep 26 bug pass): Raptor's PEOPLE
   *  persists now, so an override no longer goes stale against a reseeded
   *  roster, and an admin's seat/band/SXO flip survives a reload. Posting-out
   *  (`from`/`to`) is preserved separately (`postOuts`, `reprojectRoster`); it
   *  is not an identity field. */
  personEdits: Record<string, Partial<Pick<Person, 'seat' | 'band' | 'sxo'>>>

  /** The posting-out windows an admin set through `setPostOut`, keyed by
   *  person id, each holding the person AS LAST PROJECTED with the window on
   *  it. Persisted (8 Sep 26 bug pass — a PO date vanished on reload): on
   *  every `setPeople` the window is laid back onto the projected person, and
   *  someone the projection no longer has (archived once the date arrived) is
   *  put back from the frozen copy, so the months before they left keep
   *  showing their history — `reprojectRoster`'s keep rule, now surviving a
   *  reboot. An entry exists only while `to` is set; clearing the post-out
   *  removes it. The demo overlay's own `to` (no `poArchive`) is not one of
   *  these and still lasts a session. */
  postOuts: Record<string, Person>
}

/** What every screen reads: the raw state with each war MERGED — its own
 *  records together with the absences derived from the Inputs — and the
 *  current war's projections republished at the top level (design §4.2). */
export interface MergedState extends Omit<State, 'wars'> {
  wars: MergedWar[]
  grid: Grid
  states: States
  views: Views
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
function withCurrent(s: Omit<State, 'period'>): State {
  // Falling back to the first war rather than throwing: a `currentId`
  // naming a war that no longer exists is recoverable, and a blank screen
  // is not. `wars` is never empty — `blank()` seeds it and nothing removes.
  const war = s.wars.find(w => w.period.id === s.currentId) ?? s.wars[0]
  return { ...s, period: war.period }
}

function blank(): State {
  const wars = seedWars()
  return withCurrent({
    people: seedPeople(),
    requirements: seedRequirements(),
    qualCatalog: [...SEED_QUAL_CATALOG],
    eventDefs: seedEventDefs(),
    wars,
    // Open on the war that is OPEN for bidding — else closed, else published,
    // else draft (owner, 7 Sep 26). `pickDefaultPeriodId` is total but returns
    // '' on an empty list, which cannot happen here; the `||` is belt-and-braces
    // so a future change to `seedWars` can never blank the screen.
    currentId: pickDefaultPeriodId(wars.map(w => w.period)) || wars[0].period.id,
    openings: seedOpenings(),
    ledger: seedLedger(),
    oilPolicy: { ...DEFAULT_OIL_POLICY },
    figureOrder: [...DEFAULT_FIGURE_ORDER],
    rosterOrder: [],
    persLabels: {},
    manningOrder: [],
    manningHidden: [],
    figureHidden: [],
    groupDefs: [...DEFAULT_GROUPS],
    groupPriority: [],
    groupPriorityCustom: false,
    groupColors: {},
    eventRows: DEFAULT_EVENT_ROWS,
    showSans: false,
    // The squadron is the common case, so the app opens as one. An admin
    // says so deliberately rather than arriving with the locks already off.
    role: 'member',
    viewer: null,
    focusDate: null,
    focusSeq: 0,
    personEdits: {},
    postOuts: {},
  })
}

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === 'object' && !Array.isArray(x)
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
    // the ledger exists to replace, so it is not a grant. (A blank reason
    // is a plain-pool credit from the grid since 6 Sep 26 — `reasonRequired`
    // gates that at the write path, not here, so this reader is unchanged.)
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
/* Untrusted storage for the two roster-side records (8 Sep 26): an override
   keeps only fields with a legal value; a posting-out entry must be keyed by
   its own id, name a callsign and carry the `to` date it exists for. */
function readPersonEdits(x: unknown): State['personEdits'] | null {
  if (!isPlainObject(x)) return null
  const out: State['personEdits'] = {}
  for (const [id, v] of Object.entries(x)) {
    if (!isPlainObject(v)) continue
    const e: Partial<Pick<Person, 'seat' | 'band' | 'sxo'>> = {}
    if (v.seat === 'pilot' || v.seat === 'wso' || v.seat === 'gnd') e.seat = v.seat
    if (v.band === 'instructor' || v.band === 'ops') e.band = v.band
    if (typeof v.sxo === 'boolean') e.sxo = v.sxo
    if (Object.keys(e).length) out[id] = e
  }
  return out
}
function readPostOuts(x: unknown): Record<string, Person> | null {
  if (!isPlainObject(x)) return null
  const out: Record<string, Person> = {}
  for (const [id, v] of Object.entries(x)) {
    if (!isPlainObject(v) || v.id !== id || typeof v.callsign !== 'string' || typeof v.to !== 'string') continue
    out[id] = v as unknown as Person
  }
  return out
}
function readLabelMap(x: unknown): Record<string, string> | null {
  if (!isPlainObject(x)) return null
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(x)) if (typeof v === 'string') out[k] = v
  return out
}

/** The picked group colours: only `q:` ids, only `#rrggbb` values survive. */
function readColorMap(x: unknown): Record<string, string> | null {
  if (!isPlainObject(x)) return null
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(x)) {
    if (k.startsWith('q:') && typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)) out[k] = v
  }
  return out
}

// A stored war is its period plus its grid and states. `days` is stored in
// full rather than rebuilt from start/end, because a day carries events, a
// blocked flag and its reason — facts the range cannot regenerate and a
// scheduler would lose on every reload.
function readWar(x: unknown): LeaveWar | null {
  if (!isPlainObject(x)) return null
  const { period, recs } = x
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

  /* The war's own records ([ARCH-STACK] step 4). An old-shape war (a grid
     and states pair, a source on a record, a stored "approved") is NOT read
     half-way: the whole blob is rejected and the demo re-seeds — reset, don't
     migrate (design §2.2, §9; the schema bump clears it first anyway). */
  const readRecsOrNull = readRecs(recs)
  if (!readRecsOrNull) return null

  return {
    period: {
      id, name, start, end, stage: stage as Stage,
      bidFrom: from as string | null, bidTo: to as string | null,
      days: readDays,
      bands: readBands,
    },
    recs: readRecsOrNull,
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

let INIT_HOOK: (() => void) | null = null
/** Test-only: run after every initStore (the Leave War suite's seed absences). */
export function _setInitHook(fn: (() => void) | null): void { INIT_HOOK = fn }

export function initStore(b?: StorageBackend): void {
  backend = b ?? localBackend()
  state = blank()

  const wars = readStored('wars', readWars) ?? seedWars()
  /* THE TAB ALWAYS OPENS ON THE WAR BEING WORKED (owner, 7 Sep 26, restated
     and reaffirmed 17 Sep 26): open for bidding first, else bidding-closed,
     else published, else draft. A remembered choice does NOT override it.

     This deliberately IGNORES the stored `current`. It used to win here, and
     that was a REGRESSION nobody made on purpose: before the storage seam
     (8 Sep 26) nothing was ever stored, so this stage pick ran on every load
     and the owner's rule held by accident. Once the Leave War persisted, the
     remembered war started winning from the second visit — so a squadron that
     had glanced at the DRAFT 2027 year would reopen there instead of on the
     year actually open for bidding. `current` is still RECORDED (below, at
     every switch) because it is the reader's last choice and the shared
     database may yet want it per user; it is simply not honoured at boot. */
  const currentId = pickDefaultPeriodId(wars.map(w => w.period)) || wars[0].period.id

  const openings = readStored('openings', readOpenings) ?? seedOpenings()
  const ledger = readStored('ledger', readLedger) ?? seedLedger()
  const eventDefs = readStored('eventdefs', readEventDefs) ?? seedEventDefs()
  const oilPolicy = readStored('oilpolicy', readOilPolicy) ?? { ...DEFAULT_OIL_POLICY }
  const figureOrder = readStored('figorder', readFigureOrder) ?? [...DEFAULT_FIGURE_ORDER]
  const rosterOrder = readStored('rosterorder', readIdList) ?? []
  const persLabels = readStored('perslabels', readLabelMap) ?? {}
  const manningOrder = readStored('manningorder', readIdList) ?? []
  const manningHidden = readStored('manninghidden', readIdList) ?? []
  const figureHidden = readStored('fighidden', readIdList) ?? []
  /* Untrusted storage: keep only structurally sound entries. NOT pruned against
     the catalogue here (bug hunt, 4 Sep 26): at boot the catalogue is still the
     seed's three keys, so pruning now threw away every saved TF / NVG / custom
     group — and its picked colour — before Raptor's real column list had a
     chance to land. The list is pruned where the catalogue is real: at every
     read (`groupsInOrder`) and when the catalogue arrives (`setQualCatalog`,
     which also persists the pruned list). */
  const groupDefs = readStored('groupdefs', readGroupDefs) ?? [...DEFAULT_GROUPS]
  const groupPriority = readStored('grouppriority', readIdList) ?? []
  const groupPriorityCustom = readStored('grouppriocustom', x => (typeof x === 'boolean' ? x : null)) ?? false
  const groupColors = readStored('groupcolors', readColorMap) ?? {}
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
  const personEdits = readStored('personedits', readPersonEdits) ?? {}
  const postOuts = readStored('postouts', readPostOuts) ?? {}

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
     it pristine — and the projection that follows replaces it. What IS read
     back are the two things Leave War owns about a person (8 Sep 26): the
     admin's identity overrides and the posting-out windows, laid onto the
     projection by setPeople. */
  state = withCurrent({ ...state, wars, currentId, openings, ledger, oilPolicy, eventDefs, figureOrder, rosterOrder, persLabels, manningOrder, manningHidden, figureHidden, groupDefs, groupPriority, groupPriorityCustom, groupColors: colorsFor(groupDefs, groupColors), requirements, eventRows, showSans, personEdits, postOuts })

  version = 0
  listeners.clear()
  MERGED = null
  // [ARCH-STACK] step 4 — the Leave War suite's setup files the seed's
  // approved leave as Inputs here (test-only; production files it through
  // installDemoWorld). Never set in the app.
  INIT_HOOK?.()
  // Baseline undo/redo to the freshly loaded world. main.tsx re-baselines once
  // more after the demo world and the first sync pass are in (so those boot
  // writes fold into the baseline rather than becoming undo steps); this keeps
  // the stack sane for the standalone unit suite, which boots the store alone.
  lwHistInit()
}

/* the merged read, cached on the raw state ref and the absence index version,
   so a view-only render pays nothing (design §4.2/§4.3) */
let MERGED: { raw: State; ver: number; out: MergedState } | null = null
export function getState(): MergedState {
  const ver = absenceVersion()
  if (MERGED && MERGED.raw === state && MERGED.ver === ver) return MERGED.out
  const wars = state.wars.map(mergeWar)
  const cur = wars.find(w => w.period.id === state.currentId) ?? wars[0]!
  const out: MergedState = { ...state, wars, grid: cur.grid, states: cur.states, views: cur.views }
  MERGED = { raw: state, ver, out }
  return out
}

/** The RAW state — the war's own records only. For writers, persistence, the
 *  command layer and tests of the stored shape; screens read getState(). */
export function rawState(): State {
  return state
}

/** A repaint after the absence index changed (sync.ts) — no persist, no
 *  envelope: nothing of the war's own changed (design §4.1). */
export function absencesChanged(): void {
  rawNotify()
}

export function getVersion(): number {
  return version
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => void listeners.delete(fn)
}

/* [CMDL-FINISH] §2.2 — the pure repaint primitive. The user/reconciler write
   paths repaint through persistNotify (which defers this into the command so the
   cross-side reconcile it wakes runs in phase 8 with the causal seq live); the
   view-only setters (setRole/setViewer/focusDay/setPeople/…) call the bare
   notify() alias below — a repaint with no durable write and no envelope. */
function rawNotify(): void {
  version += 1
  for (const fn of listeners) fn()
}
function notify(): void { rawNotify() }

// One writer for all three keys, so no write path can save a grid and forget
// the states that have to agree with it.
function rawPersist(): void {
  backend.write('wars', JSON.stringify(state.wars))
  // Recorded, but deliberately NOT read back at boot — initStore always opens
  // on the war being worked (owner, 17 Sep 26; see the stage-pick comment
  // there). Kept because it is the reader's last choice and the shared
  // database may want it per user. Do not "restore" it as the boot default.
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
  backend.write('fighidden', JSON.stringify(state.figureHidden))
  backend.write('groupdefs', JSON.stringify(state.groupDefs))
  backend.write('grouppriority', JSON.stringify(state.groupPriority))
  backend.write('grouppriocustom', JSON.stringify(state.groupPriorityCustom))
  backend.write('groupcolors', JSON.stringify(state.groupColors))
  backend.write('manningdefs', JSON.stringify(state.requirements.default.rules))
  backend.write('eventrows', JSON.stringify(state.eventRows))
  backend.write('showsans', JSON.stringify(state.showSans))
  backend.write('personedits', JSON.stringify(state.personEdits))
  backend.write('postouts', JSON.stringify(state.postOuts))
  /* `people` deliberately absent: the roster is a projection of Raptor's
     PEOPLE (see initStore) — persisting it would store a copy that can only
     disagree with the projection the next boot installs. The roster ORDER,
     the personnel LABELS, the identity OVERRIDES and the posting-out WINDOWS
     are kept instead: they are the admin's arrangement of that projection,
     keyed by id, so they survive a roster that gains or loses a body. */

  LW_SIG++   // [CMDL-FINISH] C9 — the durable version advanced
  // A save IS an undo step: record the durable snapshot now that the backend
  // holds it (the UNDO / REDO block below). Skipped while a restore or a
  // sync-driven write holds the lock, and a no-op when nothing durable moved.
  recordHistory()
}

/* =====================================================================
   [ARCH-STACK] Step 2 phase 4 — the Leave War COMMAND LAYER (ADDITIVE, §5.3)
   ---------------------------------------------------------------------
   Every durable LW write funnels through persist(). A STANDALONE USER edit now
   runs its identical body (rawPersist) inside commit(), emitting the record-level
   change stream — per-populated-cell `lw.cell` / `lw.bid` records plus the coarse
   ledger / balances / oilpolicy / postouts / current / config records (§3.1).

   Everything else runs RAW, exactly as today, so no delicate path changes:
   - LOCKED writes — the four sync reconcilers and undo/redo (historyApply) — the
     lock is the sync loop-breaker, and undo is NOT routed through commit at Step 2
     (§0);
   - a write NESTED in another command (a causal Raptor->LW write) — deferred JOIN;
   - boot/seed persists (before LW_READY, set at the end of the boot lwHistInit).

   The immutable `state` ref IS the snapshot (capture is O(1)); a rollback simply
   reassigns it. LW's snapshot undo stack is left running. lwStore is deliberately
   NOT a guarded store: a causal Raptor->LW write (locked) legitimately changes it
   outside any LW command, and the whole-world guard would wrongly flag that.

   DEFERRED (a documented follow-up; they need the owner's live-scenario sign-off
   on the delicate Raptor<->LW sync loop, which a headless run can't perform):
   sync-reconcilers-as-projection (commitAs) and the causal input-delete->bid-
   delete JOIN into the originating Raptor command's transaction. Until then those
   writes stay raw — additive and behaviour-identical to today.
   ===================================================================== */
let LW_BASELINE: State = state   // the last-persisted state ref — the record source
let LW_READY = false             // enabled after boot (lwHistInit), so seed persists stay raw
let LW_REGISTERED = false
/* [CMDL-FINISH] C9 — a monotonic DURABLE-version counter, bumped only where the
   backend actually changes (rawPersist / restore). signature() returns it so the
   whole-world guard asks "changed?" cheaply, instead of serialising the world
   every commit. Registered guarded at the END of P3 (once routing is complete). */
let LW_SIG = 0
/* [CMDL-FINISH] F1 (§2.2/§2.3) — the causal-envelope router state.
   - LW_RESTORING: the legacy LW undo/redo (historyApply) persists OFF-STREAM —
     it is not a new edit, so it must emit no projection and wake no reconcile as
     a command (C4). Checked FIRST in persistNotify.
   - LW_PROJ_PENDING: coalesces a multi-cell reconcile to ONE lw.sync projection
     per turn (N1/C5) — armed on the first cell, every later cell takes the raw
     branch and does NOT advance LW_BASELINE, so the one projection still diffs
     every cell against the pre-reconcile baseline.
   - LW_SYNC_TURN: F4-1 — an IDLE reconcile (week-nav loadWeek→runOilPass) is
     wrapped in lwSyncTurn, which arms LW_PROJ_PENDING and holds it across the
     turn; this counter stops the defensive idle reset from clearing the flag the
     wrapper just armed. */
let LW_RESTORING = false
let LW_PROJ_PENDING = false
let LW_SYNC_TURN = 0
/* did a DURABLE LW write actually go through the router during the current idle
   turn? lwSyncTurn's trailing projection fires ONLY if so — a view-only setter
   (setRole/setViewer/focusDay) that wakes the reconcilers but changes no cell
   must not trigger a spurious durable persist. */
let LW_TURN_WROTE = false

/* decompose a durable State into its logical records (design §3.1): one record
   per POPULATED grid cell / bid (sparse), plus the coarse side records. */
function lwDecompose(s: State): Map<string, CmdRecordEntry> {
  const m = new Map<string, CmdRecordEntry>()
  for (const w of s.wars) {
    const warId = w.period.id
    /* the war's own period record — id/name/stage/bidFrom/bidTo/days (events/PH/
       blocked). Without this a stage advance, bidding-window change, war rename or
       a brand-new (cell-less) war produces an empty diff and is dropped (Fable-2). */
    m.set(`lw.war/${warId}`, { collection: 'lw.war', id: warId, value: w.period })
    /* [ARCH-STACK] step 4 — ONE record per populated address: the war's own
       list there (requests / credits / notices). Same lw.cell collection and
       warId:pid:date id as before, so undo's war/date snapping reads it
       unchanged; the value is now the list. */
    const recs = (w.recs || {}) as Recs
    for (const pid of Object.keys(recs)) {
      const row = recs[pid] || {}
      for (const date of Object.keys(row)) {
        if (!row[date]?.length) continue
        const id = `${warId}:${pid}:${date}`
        m.set(`lw.cell/${id}`, { collection: 'lw.cell', id, value: row[date] })
      }
    }
  }
  m.set('lw.ledger/all', { collection: 'lw.ledger', id: 'all', value: s.ledger })
  m.set('lw.balances/all', { collection: 'lw.balances', id: 'all', value: s.openings })
  m.set('lw.oilpolicy/all', { collection: 'lw.oilpolicy', id: 'all', value: s.oilPolicy })
  m.set('lw.postouts/all', { collection: 'lw.postouts', id: 'all', value: s.postOuts })
  m.set('lw.current/all', { collection: 'lw.current', id: 'all', value: s.currentId })
  m.set('lw.config/all', {
    collection: 'lw.config', id: 'all', value: {
      eventDefs: s.eventDefs, figureOrder: s.figureOrder, rosterOrder: s.rosterOrder,
      persLabels: s.persLabels, manningOrder: s.manningOrder, manningHidden: s.manningHidden,
      figureHidden: s.figureHidden, groupDefs: s.groupDefs, groupPriority: s.groupPriority,
      groupPriorityCustom: s.groupPriorityCustom, groupColors: s.groupColors,
      requirements: s.requirements, eventRows: s.eventRows, showSans: s.showSans,
      personEdits: s.personEdits,
    },
  })
  return m
}

/* [CMDL-FINISH] §3 — apply ONE decomposed LW record onto a MUTABLE state clone
   (write() clones first, so mutating in place here never touches the captured
   baseline). Cell/bid ids are `${warId}:${pid}:${date}`; warId may itself carry
   colons, so the two trailing segments (pid, date) are split from the RIGHT. */
function applyLwRecord(s: State, e: CmdRecordEntry): void {
  const coll = e.collection
  if (coll === 'lw.war') {
    const ix = s.wars.findIndex(w => w.period.id === e.id)
    if (e.op === 'delete') { if (ix >= 0) s.wars.splice(ix, 1) }
    else if (ix >= 0) s.wars[ix].period = e.value as any
    else s.wars.push({ period: e.value as any, recs: {} } as any)
    return
  }
  if (coll === 'lw.cell') {
    const iDate = e.id.lastIndexOf(':'); const date = e.id.slice(iDate + 1)
    const rest = e.id.slice(0, iDate); const iPid = rest.lastIndexOf(':')
    const pid = rest.slice(iPid + 1); const warId = rest.slice(0, iPid)
    const war = s.wars.find(w => w.period.id === warId)
    if (!war) return
    war.recs = withList(war.recs, pid, date, e.op === 'delete' ? [] : (e.value as WarRec[]))
    return
  }
  switch (coll) {
    case 'lw.ledger': (s as any).ledger = e.value; return
    case 'lw.balances': (s as any).openings = e.value; return
    case 'lw.oilpolicy': (s as any).oilPolicy = e.value; return
    /* [CMDL-FINISH] CMDLF-002 — DEFERRED to [GLOBAL-UNDO]. Restoring postOuts sets
       the record, but the people posting-WINDOWS on the roster are a projection:
       reprojectRoster carries each window from the CURRENT person (ex.from/to), not
       from postOuts, so a postouts-only restore is invisible to it. Rebuilding them
       correctly means re-laying the restored postOuts over the CLEAN Raptor
       projection (setPeople(projectPeople)) — which crosses the LW↔Raptor projection
       boundary sync.ts owns and, fired at this write() boundary, re-enters the
       reconcilers. That orchestration belongs to the undo consumer (with the
       clean-projection context), not to a bare record apply. Latent: no production
       path restores postOuts at this step. */
    case 'lw.postouts': (s as any).postOuts = e.value; return
    case 'lw.current': (s as any).currentId = e.value; return
    case 'lw.config': {
      const v = e.value as any
      Object.assign(s as any, {
        eventDefs: v.eventDefs, figureOrder: v.figureOrder, rosterOrder: v.rosterOrder,
        persLabels: v.persLabels, manningOrder: v.manningOrder, manningHidden: v.manningHidden,
        figureHidden: v.figureHidden, groupDefs: v.groupDefs, groupPriority: v.groupPriority,
        groupPriorityCustom: v.groupPriorityCustom, groupColors: v.groupColors,
        requirements: v.requirements, eventRows: v.eventRows, showSans: v.showSans,
        personEdits: v.personEdits,
      })
      return
    }
  }
}

/* exported for the [CMDL-FINISH] write()-seam unit tests (the two-store round-trip
   Q2); production wiring uses it only through this module. */
export const lwStore: CmdEnlistableStore = {
  key: 'leavewar',
  capture: () => LW_BASELINE,                                  // the immutable ref IS the snapshot
  restore: (snap) => { state = snap as State; LW_BASELINE = snap as State; LW_SIG++ },
  records: () => lwDecompose(LW_BASELINE),
  signature: () => String(LW_SIG),                             // [CMDL-FINISH] C9
  /* [CMDL-FINISH] §3 (F8/GU-007) — batch, delete-aware record write for the undo
     seam. Clone the current state (preserving the NON-record fields the decompose
     omits — people/role/viewer/focus), apply every entry, republish the derived
     top-level fields (withCurrent), advance the baseline, then persist + notify at
     the transaction boundary under the lock (a restore must push NO LW undo step).
     Called only from a reducer that already enlisted lwStore. */
  write(entries: CmdRecordEntry[]): void {
    const next = JSON.parse(JSON.stringify(state)) as State   // fields are all JSON-durable (rawPersist proves it)
    /* [CMDL-FINISH] Fable#8 — apply lw.war entries FIRST: a cell/bid record whose
       war does not exist yet is dropped by applyLwRecord, so a restore set that
       lists a war and its cells in any order would lose the cells. Wars first
       guarantees the war exists before its cells land. */
    const ordered = entries.slice().sort((a, b) => (a.collection === 'lw.war' ? 0 : 1) - (b.collection === 'lw.war' ? 0 : 1))
    for (const e of ordered) {
      /* [CMDL-FINISH] Fable#7 — clone-on-write: an entry's value comes from the
         record set / an undo snapshot; installing an object BY REFERENCE would let
         a later in-place live edit corrupt that snapshot. Cell/bid values are
         strings (primitives, no aliasing), so clone only object values. */
      const val = e.value
      applyLwRecord(next, (val && typeof val === 'object') ? { ...e, value: JSON.parse(JSON.stringify(val)) } : e)
    }
    state = withCurrent(next)
    LW_BASELINE = state
    cmdDeferEffect(() => { locked(() => rawPersist()); notify() })
  },
}

/* [GLOBAL-UNDO] §13 phase 2 (Codex GU-P2-009) — the AUTHORITATIVE list of the
   nine collections lwStore owns. ONE exported source, used for BOTH the command-
   layer record registration below AND the undo-store registration (undo-wire.ts):
   an omitted collection would fail the restore reducer with "no restore target".
   `lw.current` is in the list (harmless — nav is never restored). */
export const LW_COLLS = ['lw.cell', 'lw.war', 'lw.ledger', 'lw.balances', 'lw.oilpolicy', 'lw.postouts', 'lw.current', 'lw.config'] as const

function lwRegisterCommands(): void {
  if (LW_REGISTERED) return
  LW_REGISTERED = true
  cmdDefinePermission('lw.edit', cmdAnyone)   // permissive at Step 2 (the real role gates are unchanged)
  /* [ARCH-STACK] step 4 — the war gestures. The role gates live in the writers
     (canDecide / canEditRow), exactly as lw.edit's do. */
  for (const t of ['lw.decide', 'lw.move', 'lw.ack', 'lw.approve', 'lw.decideApproved', 'lw.removeApproved', 'lw.moveApproved']) cmdDefinePermission(t, cmdAnyone)
  for (const c of LW_COLLS) cmdRegisterRecord({ key: `leavewar:${c}`, cls: 'record', collection: c, module: 'leavewar' })
  // [CMDL-FINISH] C9/P3-END — now that every LW write routes through the command
  // layer (the only post-boot raw path is LW_RESTORING, which runs at idle and is
  // never nested inside another command), lwStore is safe to guard. The guard
  // uses the cheap durable-version signature(), not a whole-state serialise.
  cmdRegisterGuardedStore(lwStore)
  // [CMDL-FINISH] §2.1(4)/CMDLF-002 — the LW HIST.lock is a DIFFERENT object than
  // the scheduler's 'HIST.lock'. A Raptor-driven LW reconcile enqueues an lw.sync
  // projection under LW's locked(); that lock unwinds before drainQueue runs the
  // projection's rawPersist→recordHistory, so without capturing THIS lock the
  // reconcile would record as a spurious LW undo step (and truncate redo). The
  // queued projection captures + re-installs it (commit.ts enqueue/drain).
  cmdRegisterEffectContext({
    key: 'lw.hist',
    capture: () => HIST.lock,
    install: (snap) => { const prev = HIST.lock; HIST.lock = snap as boolean; return () => { HIST.lock = prev } },
  })
}

/* [CMDL-FINISH] §2.3 (Rev 4 + F4-1) — the persist+notify ROUTER. Every durable LW
   write path (the ~48 former `persist(); notify()` sites) calls this. It replaces
   the old persist() (whose raw body is rawPersist) AND the following notify(), so
   a user edit's repaint DEFERS into the command (phase 8, causal seq live) and the
   cross-side reconciler it wakes chains to the edit instead of orphaning (C1). */
function persistNotify(): void {
  const scope = { module: 'lw', warId: state.currentId } as CmdScope
  if (!LW_READY)    { rawPersist(); LW_BASELINE = state; rawNotify(); return }   // boot/seed
  if (LW_RESTORING) { rawPersist(); LW_BASELINE = state; rawNotify(); return }   // legacy undo — off-stream (C4)
  // defensive: at idle with no turn armed, nothing is pending (M3 + F4-1: the
  // !LW_SYNC_TURN guard keeps lwSyncTurn's armed flag from being cleared here).
  if (!cmdIsCommitting() && !LW_SYNC_TURN) LW_PROJ_PENDING = false
  if (HIST.lock || cmdIsCommitting()) {                                          // reconciler OR nested causal
    if (cmdIsCommitting() && cmdIsInReducer()) {                                 // nested causal child (Gap 2) — JOINs the parent
      /* [ARCH-STACK-4] §5.2 FB2-05 — the durable write defers to phase 8 (run on
         success, discarded if the parent command is refused after its reducer) */
      cmdCommitProjection({ type: 'lw.sync', scope, apply: (t) => { t.enlist(lwStore); cmdDeferEffect(() => locked(() => rawPersist())); LW_BASELINE = state } })
    } else if (!LW_PROJ_PENDING) {                                               // first cell of a turn — ONE projection
      LW_PROJ_PENDING = true
      const r = cmdCommitProjection({ type: 'lw.sync', scope, apply: (t) => { LW_PROJ_PENDING = false; t.enlist(lwStore); rawPersist(); LW_BASELINE = state } })
      if (isQueued(r)) r.done.then(x => { if (!isOk(x)) rawNotify() })           // a rejected drained projection → re-read the grid (Q1)
    } else {
      rawPersist()                                                               // COALESCED — raw only, do NOT advance LW_BASELINE (N1)
      if (LW_SYNC_TURN) LW_TURN_WROTE = true                                     // this idle turn actually wrote — arm the trailing projection
    }
    rawNotify()                                                                  // inline (the SYNCING loop-breaker needs it firing now)
    return
  }
  // a standalone USER edit -> the identical durable body inside a command that
  // emits the change stream; the repaint defers to phase 8 (causal seq live).
  const r = cmdCommit({
    type: 'lw.edit', scope,
    /* [ARCH-STACK-4] §21.1c (FB5-03) — the backend write defers with the repaint */
    apply: (txn) => { txn.enlist(lwStore); cmdDeferEffect(rawPersist); LW_BASELINE = state; cmdDeferEffect(rawNotify) },
  })
  if ((r as any).ok === false) rawNotify()   // a rejected edit reverted the model; re-read the grid + toast idiom
}

/* [CMDL-FINISH] F4-1/M3 — coalesce an IDLE multi-cell reconcile (week-nav
   loadWeek→runOilPass crediting K cells, a view-only setter that wakes the
   reconcilers) into ONE lw.sync projection. Arm LW_PROJ_PENDING so every cell
   inside `fn` takes the coalesced raw branch (each rawPersists but does not
   advance LW_BASELINE), then emit ONE trailing projection UNDER THE LOCK — else
   recordHistory would push an LW undo step for an idle reconcile. A no-op when
   already committing (the phase-8 lane coalesces on its own). */
export function lwSyncTurn<T>(fn: () => T): T {
  // Already committing (phase-8 lane coalesces on its own) or already inside an
  // outer turn (the outermost turn emits the ONE projection) — just run fn.
  if (cmdIsCommitting() || LW_SYNC_TURN > 0) return fn()
  LW_SYNC_TURN++
  LW_TURN_WROTE = false
  LW_PROJ_PENDING = true
  try {
    return fn()
  } finally {
    LW_SYNC_TURN--
    // ONE trailing projection for the whole turn — but ONLY if a durable LW write
    // happened (else a view-only setter that woke the reconcilers would persist
    // spuriously). Under the lock so recordHistory pushes no undo step for a
    // reconcile. Its before-image is the pre-turn baseline (the coalesced cells
    // never advanced it), so the one envelope diffs every cell.
    if (LW_TURN_WROTE) {
      locked(() => {
        cmdCommitProjection({
          type: 'lw.sync', scope: { module: 'lw', warId: state.currentId } as CmdScope,
          apply: (t) => { LW_PROJ_PENDING = false; t.enlist(lwStore); rawPersist(); LW_BASELINE = state },
        })
      })
    }
    LW_PROJ_PENDING = false
  }
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

   Raptor-DRIVEN writes (the OIL pass's ingestDutyCredit / clearRaptorCell;
   since [ARCH-STACK] step 4 leave is never copied onto the war) run under `locked`, so
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
    manningOrder: s.manningOrder, manningHidden: s.manningHidden, figureHidden: s.figureHidden,
    groupDefs: s.groupDefs, groupPriority: s.groupPriority, groupPriorityCustom: s.groupPriorityCustom,
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
  /* [ARCH-STACK] phase 4: enable command routing now that the boot sequence
     (demo world + first sync pass) has finished its raw seed persists, and
     baseline the record source to the state on screen. Also called on selectWar
     (re-baseline), which harmlessly re-syncs the baseline to the switched war. */
  lwRegisterCommands()
  LW_BASELINE = state
  LW_READY = true
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
/* [GLOBAL-UNDO] §13 phase 2 (Fable N5) — bump the epoch from the GLOBAL restore
   path too. The legacy historyApply bumps it inside itself so the matrix drops an
   in-flight drag/select; a globalUndo/globalRedo restores LW through the write()
   seam, which does NOT run historyApply, so the undo consumer bumps it explicitly
   (in the restore epilogue) to get the same "drop the gesture" signal. */
export function bumpLwHistEpoch(): void { historyEpoch++ }

/** Restore snapshot `i`. Locked across the whole apply so neither the restore
 *  itself nor the sync reconcilers `notify()` wakes push a new step; the
 *  `notify()` inside the lock is what lets sync converge the Raptor side to the
 *  restored grid. */
function historyApply(i: number): void {
  if (i < 0 || i >= HIST.stack.length) return
  const snap = JSON.parse(HIST.stack[i]) as Pick<State,
    'wars' | 'openings' | 'ledger' | 'oilPolicy' | 'eventDefs' | 'figureOrder' | 'rosterOrder'
    | 'persLabels' | 'manningOrder' | 'manningHidden' | 'figureHidden' | 'groupDefs'
    | 'groupPriority' | 'groupPriorityCustom' | 'requirements' | 'eventRows' | 'showSans'>
  HIST.ix = i
  historyEpoch++   // signal the matrix to drop any in-flight gesture (see above)
  locked(() => {
    // withCurrent republishes period/grid/states from the restored wars and
    // the CURRENT currentId — the war on screen does not change, only its data.
    state = withCurrent({ ...state, ...snap })
    // [CMDL-FINISH] C4 — a legacy LW undo/redo is NOT a new edit: persist it
    // OFF-STREAM (rawPersist, no projection, wakes no reconcile as a command).
    // The reconcilers still converge the Raptor side via the rawNotify inside.
    const was = LW_RESTORING; LW_RESTORING = true
    try { persistNotify() } finally { LW_RESTORING = was }
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
  persistNotify()
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
  persistNotify()
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
  const people = state.people.map(p =>
    (p.id === id ? { ...p, to, poArchive: fromDate ? archive : undefined } : p))
  /* the persisted window (State.postOuts): the person as they stand now,
     window on; cleared with the post-out */
  const postOuts = { ...state.postOuts }
  if (fromDate) postOuts[id] = people.find(p => p.id === id)!
  else delete postOuts[id]
  state = withCurrent({ ...state, people, postOuts })
  persistNotify()
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
  /* Lay Leave War's own two records over the projection (State.postOuts,
     State.personEdits — both persisted since 8 Sep 26): a stored posting-out
     window goes back onto its person, an identity override too, and a person
     with a window whom the projection no longer has (archived when the date
     arrived) is put back from the frozen copy — reprojectRoster's keep rule,
     which used to hold only within a session. Empty records make this the
     plain install it always was. */
  const po = state.postOuts, edits = state.personEdits
  const next: Person[] = people.map(p => {
    const w = po[p.id]
    const merged: Person = { ...p, ...(edits[p.id] || {}) }
    return w ? { ...merged, to: w.to, poArchive: w.poArchive } : merged
  })
  const ids = new Set(next.map(p => p.id))
  for (const id of Object.keys(po)) if (!ids.has(id)) next.push(po[id])
  state = withCurrent({ ...state, people: next })
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
  const order = state.rosterOrder.length ? state.rosterOrder : liveAutoOrder()
  const pos = new Map(order.map((id, i) => [id, i]))
  const out: Person[] = []
  /* The groups the ADMIN configured, in their display order, and the priority
     order that decides who claims a person fitting several (owner, 28 Aug 26;
     following the page by default since 3 Sep 26). With the default list this is
     byte-identical to the old GROUP_ORDER walk — `groupOf` is that same walk. */
  const defs = groupsInOrder()
  const priority = groupPriorityIds()
  const home = new Map(state.people.map(p => [p.id, assignGroup(p, defs, priority)]))
  /* Within a block: every pilot above every WSO, ALWAYS (owner, 3 Sep 26 —
     "arrange all pilots at the top always and wso at the bottom of the same
     section"), and inside each seat the hand-order (or the ranked default). A
     drag that would carry a WSO up among the pilots lands them at the top of the
     WSOs instead — the seat split is not something a drag can undo. A body
     missing from the saved order (just arrived) sinks to the end of its seat
     rather than jumping to the top. */
  const within = (a: Person, b: Person) =>
    seatRank(a) - seatRank(b) || (pos.get(a.id) ?? Infinity) - (pos.get(b.id) ?? Infinity)
  for (const d of defs) {
    const members = state.people.filter(p => home.get(p.id) === d.id)
    members.sort(within)
    out.push(...members)
  }
  /* Anyone no configured group claims still gets a row — under "Everyone else",
     always last. Without this an admin whose list is all qualifications would
     drop people off the grid entirely. */
  const rest = state.people.filter(p => !defs.some(d => home.get(p.id) === d.id))
  rest.sort(within)
  out.push(...rest)
  return out
}

/** The configured group list, pruned to the live qual catalogue and in the
 *  admin's display order. One body, so every reader agrees.
 *
 *  While `showSans` is on, the SANS group is APPENDED at the foot (owner, 3 Sep
 *  26 — SANS as their own category at the bottom). It is auto-injected here, never
 *  stored, so it can never be dragged, removed or persisted like the rest — it
 *  appears and leaves with the Show SANS switch alone. */
export function groupsInOrder(): GroupDef[] {
  const defs = pruneGroups(state.groupDefs.length ? state.groupDefs : DEFAULT_GROUPS, state.qualCatalog)
  const ids = orderedGroupIds(defs, state.groupDefs.map(d => d.id))
  const ordered = ids.map(id => defs.find(d => d.id === id)!).filter(Boolean)
  return state.showSans ? [...ordered, SANS_GROUP] : ordered
}

/**
 * The tie-break order — who claims a person matching several groups.
 *
 * By DEFAULT it FOLLOWS the display order (owner, 3 Sep 26 — "the priority order
 * should also change by default in accordance with the category order"): the group
 * higher on the page wins. Only once the admin sets a CUSTOM order
 * (`groupPriorityCustom`) does the stored `groupPriority` take over, healed against
 * the groups that exist.
 *
 * SANS is forced to the FRONT whenever shown, independent of custom/auto: it sits
 * LAST on the page but must still CLAIM its own people, or a SANS body would be
 * drawn under its CAT instead of the SANS group at the foot.
 */
export function groupPriorityIds(): string[] {
  const groups = groupsInOrder()
  const base = state.groupPriorityCustom
    ? orderedGroupIds(groups, state.groupPriority)
    : groups.map(d => d.id)
  if (!state.showSans) return base
  return [SANS_GROUP_ID, ...base.filter(id => id !== SANS_GROUP_ID)]
}

/** Whether the admin has set a custom who-wins order (the settings sheet shows a
 *  "Match the page order" reset only then). */
export function isGroupPriorityCustom(): boolean {
  return state.groupPriorityCustom
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
  // SANS is auto-managed by the Show SANS switch — never let it into the stored
  // list, whatever a caller passes.
  const cleaned = defs.filter(d => d.id !== SANS_GROUP_ID)
  const groupDefs = pruneGroups(cleaned, state.qualCatalog)
  state = withCurrent({ ...state, groupDefs, groupColors: colorsFor(groupDefs, state.groupColors) })
  persistNotify()
}

/** A picked colour lives and dies with its group: keep only the entries whose
 *  group is still in the list, so a removed-then-re-added group starts fresh
 *  (its fallback colour) rather than resurrecting a pick nobody can see. */
function colorsFor(defs: readonly GroupDef[], colors: Record<string, string>): Record<string, string> {
  const keep: Record<string, string> = {}
  for (const d of defs) if (colors[d.id]) keep[d.id] = colors[d.id]
  return keep
}

/** Pick a qualification group's colour (owner, 3 Sep 26 — "allow me to pick the
 *  colour i want"). ADMIN-gated; only a group currently shown, only a `q:` group
 *  (the built-ins wear their CAT colours), only a `#rrggbb` value. */
export function setGroupColor(id: string, hex: string): void {
  if (state.role !== 'admin') return
  if (!id.startsWith('q:') || !/^#[0-9a-f]{6}$/i.test(hex)) return
  if (!groupsInOrder().some(d => d.id === id)) return
  if (state.groupColors[id] === hex) return
  state = withCurrent({ ...state, groupColors: { ...state.groupColors, [id]: hex } })
  persistNotify()
}

/**
 * Add a group to the roster, landing it just ABOVE the first category in the
 * DISPLAY order.
 *
 * Since who-wins now FOLLOWS the display order by default (owner, 3 Sep 26 —
 * "higher on the page wins"), placing a new qualification group above the
 * categories is what makes it actually CLAIM its people: a qual group below the
 * exhaustive built-ins would never draw anyone (they are all claimed first). Add
 * order is preserved — it lands above the cats but after any qual groups already
 * there — so adding SC Day then SC Night keeps SC Day higher.
 *
 * In CUSTOM who-wins mode the same "above the cats" insert is mirrored into the
 * stored priority, so a new group claims its people there too. The SANS group is
 * not addable here — it is the Show SANS switch.
 */
export function addGroup(d: GroupDef): void {
  if (state.role !== 'admin') return
  if (d.id === SANS_GROUP_ID) return
  const current = groupsInOrder().filter(x => x.id !== SANS_GROUP_ID)
  if (current.some(x => x.id === d.id)) return    // already shown
  const catAt = current.findIndex(x => x.kind === 'cat')
  const insertAt = catAt < 0 ? current.length : catAt
  const merged = pruneGroups([...current.slice(0, insertAt), d, ...current.slice(insertAt)], state.qualCatalog)
  if (!merged.some(x => x.id === d.id)) return    // a qual key the catalogue lost
  let priority = state.groupPriority
  if (state.groupPriorityCustom) {
    const byId = new Map(merged.map(x => [x.id, x]))
    const pr = groupPriorityIds().filter(id => id !== d.id && id !== SANS_GROUP_ID)
    const pAt = pr.findIndex(id => byId.get(id)?.kind === 'cat')
    priority = pAt < 0 ? [...pr, d.id] : [...pr.slice(0, pAt), d.id, ...pr.slice(pAt)]
  }
  state = withCurrent({ ...state, groupDefs: merged, groupPriority: priority })
  persistNotify()
}

/** Move one group before another in the DISPLAY order (the grid drag, in
 *  rearrange mode). Mirrors `moveRosterRow` / `moveManningRowTo`, guard included.
 *  ADMIN-gated. The auto-placed SANS group at the foot is never movable; dropping
 *  a group "before SANS" means to the end of the real groups. Because who-wins
 *  follows the page by default, this drag also reorders who-wins unless the admin
 *  has set a custom order. */
export function moveGroupTo(id: string, beforeId: string | null): void {
  if (state.role !== 'admin') return
  if (beforeId === id) return
  if (id === SANS_GROUP_ID) return
  const defs = groupsInOrder().filter(d => d.id !== SANS_GROUP_ID)
  const from = defs.findIndex(d => d.id === id)
  if (from < 0) return
  const [moved] = defs.splice(from, 1)
  const target = beforeId === SANS_GROUP_ID ? null : beforeId
  const at = target ? defs.findIndex(d => d.id === target) : defs.length
  defs.splice(at < 0 ? defs.length : at, 0, moved!)
  setGroupDefs(defs)
}

/** Move one group in the PRIORITY order — the separate who-wins list in ⚙. Doing
 *  so switches who-wins to CUSTOM (owner, 3 Sep 26 — the override), so it stops
 *  following the page order. Seeds from the effective order so the first drag
 *  starts from what the admin currently sees; SANS is never part of it (it is
 *  auto-forced first). ADMIN-gated. */
export function moveGroupPriorityTo(id: string, beforeId: string | null): void {
  if (state.role !== 'admin') return
  if (beforeId === id) return
  if (id === SANS_GROUP_ID) return
  const ids = groupPriorityIds().filter(x => x !== SANS_GROUP_ID)
  const from = ids.indexOf(id)
  if (from < 0) return
  ids.splice(from, 1)
  const target = beforeId === SANS_GROUP_ID ? null : beforeId
  const at = target ? ids.indexOf(target) : ids.length
  ids.splice(at < 0 ? ids.length : at, 0, id)
  state = withCurrent({ ...state, groupPriority: ids, groupPriorityCustom: true })
  persistNotify()
}

/** Drop a custom who-wins order and go back to following the page order (owner,
 *  3 Sep 26 — the "Match the page order" reset in ⚙). ADMIN-gated; a no-op when
 *  already following the page. */
export function clearGroupPriority(): void {
  if (state.role !== 'admin') return
  if (!state.groupPriorityCustom && state.groupPriority.length === 0) return
  state = withCurrent({ ...state, groupPriority: [], groupPriorityCustom: false })
  persistNotify()
}

/** Put the roster grouping back to the seven built-ins, following the page order.
 *  ADMIN-gated. */
export function resetGroups(): void {
  if (state.role !== 'admin') return
  state = withCurrent({ ...state, groupDefs: [...DEFAULT_GROUPS], groupPriority: [], groupPriorityCustom: false, groupColors: {} })
  persistNotify()
}

/** A ground-crew body's label: the admin's override if set, else the projected
 *  default (Raptor's `flight`). */
export function personLabel(p: Person): string {
  return state.persLabels[p.id] ?? p.label ?? ''
}

/**
 * Write the roster's row order. ADMIN-gated, the `figureOrder` rule: a member
 * does not rearrange the roster (the drag handles do not render for them). An empty array clears back to the categorised default.
 */
export function setRosterOrder(order: string[]): void {
  if (state.role !== 'admin') return
  state = withCurrent({ ...state, rosterOrder: order })
  persistNotify()
}

/** The categorised default order against the ADMIN's live grouping — each group
 *  in page order, ranked within. Same shape as the engine's `autoOrder`, but
 *  bucketed by `groupIdOf` rather than the fixed seven, so a person the page
 *  order re-homes (an SXO IP under a lifted IP block) ranks among their new
 *  block instead of carrying their old block's position (owner, 3 Sep 26). */
function liveAutoOrder(): string[] {
  return autoOrder(state.people, groupIdOf, groupsInOrder().map(d => d.id))
}

/** Re-group everyone into the categorised order. Was the Auto-sort button's
 *  action; the button went with the on-grid rearrange bar (owner, 6 Sep 26 —
 *  "Auto sort will be removed"), so nothing in the UI calls this now — kept as
 *  the store's one "back to the default order" write (tests, a future home). */
export function autoSortRoster(): void {
  setRosterOrder(liveAutoOrder())
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
  persistNotify()
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
  const wars = state.wars.map(w => ({ ...w, recs: rekey(w.recs) }))
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
export function installDemoOil(extra: { recs: Recs; ledger: Ledger }): void {
  const wars = state.wars.map(w => {
    let recs = w.recs
    for (const [person, row] of Object.entries(extra.recs)) {
      for (const [date, list] of Object.entries(row)) {
        if (warHolding(state.wars, date) !== w) continue
        recs = withList(recs, person, date, [...recsAt(recs, person, date), ...list])
      }
    }
    return { ...w, recs }
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

/* ---- THE WAR'S OWN RECORDS: requests and credits ([ARCH-STACK] step 4) -----
   A war stores only requests, OIL credits and replaced-bid notices (see
   engine/warrecs.ts). An APPROVED absence is a Raptor Input — the war reads it
   (merge.ts) and changes it only through the ABSENCE DOOR below, which sync.ts
   installs: approve a request, un-approve / remove / move an approved leave.
   Each writer here keeps the per-address rules (one undecided request per half,
   one credit) and never lets a new record land on a time it cannot share
   (`forbiddenPair` — leave over leave, leave over a medical, leave over worked
   time), which replaces the old "Raptor owns this cell" refusal. */

/** What the absence door does, installed by sync.ts (the one Raptor seam). Each
 *  runs INSIDE the caller's gesture (one envelope) and reports per item. */
export interface AbsenceDoor {
  /** turn requests into Inputs (design §5.2 `lw.approve`) */
  approve(items: Array<{ personId: string; date: string; recId: string }>): { done: number; skipped: number; why: string[] }
  /** un-approve approved leave back into a request of `to` (`lw.decideApproved`) */
  decideApproved(items: Array<{ personId: string; date: string; iid: string }>, to: RequestState): { done: number; skipped: number; why: string[] }
  /** delete approved leave days (`lw.removeApproved`) */
  removeApproved(items: Array<{ personId: string; date: string; iid: string }>): { done: number; skipped: number; why: string[] }
  /** slide approved leave days by `delta` (`lw.moveApproved`); null = clear, else the refusal */
  moveApproved(items: Array<{ personId: string; date: string; iid: string }>, delta: number, tracked: boolean, check: boolean): { reason: 'occupied' | 'window' | 'nothing'; at?: string } | null
}
let DOOR: AbsenceDoor | null = null
export function setAbsenceDoor(d: AbsenceDoor | null): void { DOOR = d }

/** Run a war gesture as ONE command — every cell it touches, requests and
 *  approved leave alike, lands in one envelope and one undo step (design §5.2
 *  OA-003). Inside an already-running command it simply joins. */
function gesture<T>(type: string, fn: () => T): T {
  if (cmdIsCommitting() || !LW_READY || LW_RESTORING) return fn()
  let out!: T
  const r = cmdCommit({
    type, scope: { module: 'lw', warId: state.currentId } as CmdScope,
    apply: (t) => {
      t.enlist(lwStore)
      out = fn()
      /* the per-cell persists inside ran as joined children (locked — no
         legacy undo step each); ONE unlocked persist at the seal records the
         whole gesture as one step on the legacy Leave War stack too */
      cmdDeferEffect(() => rawPersist())
    },
  })
  if ((r as any).ok === false) { REFUSED?.(); rawNotify() }
  return out
}
/* what a refused gesture must re-derive before its repaint (the absence index,
   installed by sync.ts — Codex AS4-R2-001) */
let REFUSED: (() => void) | null = null
export function setRefusalHook(fn: (() => void) | null): void { REFUSED = fn }

/** The war's own list at one address, in the war holding the date. */
function listAt(personId: string, date: string): readonly WarRec[] {
  const war = warHolding(state.wars, date)
  return war ? recsAt(war.recs, personId, date) : []
}
/** Replace the list at one address, in the war holding the date. */
function putList(personId: string, date: string, list: readonly WarRec[]): boolean {
  const war = warHolding(state.wars, date)
  if (!war) return false
  updateWar(war.period.id, w => ({ ...w, recs: withList(w.recs, personId, date, list) }))
  return true
}

/** The absence door's edit of the war's own records (sync.ts): per address,
 *  drop records by id and add new ones, as ONE write inside the caller's
 *  gesture. Not a user entry point — the door has already checked the rules. */
export function lwEditLists(edits: Array<{ personId: string; date: string; drop: string[]; add: WarRec[] }>): void {
  if (!edits.length) return
  const wasQuiet = quiet
  quiet = true
  try {
    for (const e of edits) {
      const list = listAt(e.personId, e.date).filter(r => !e.drop.includes(r.id))
      putList(e.personId, e.date, [...list, ...e.add])
    }
  } finally { quiet = wasQuiet }
  if (!quiet) persistNotify()
}

/** Would a new contribution share this address with something it may not
 *  (a filed absence, worked time, another request on the same time)?
 *  `ignore` leaves out records the write is about to replace. */
function occupiedFor(c: Contrib, personId: string, date: string, ignore: readonly WarRec[] = []): boolean {
  const staying = listAt(personId, date).filter(r => !ignore.includes(r))
  /* WORK ALWAYS LANDS; only a REQUEST is barred here.
     A CREDIT is work, and the owner ruled on 20 Sep 26 that work lands on a
     leave day and the day is flagged — so an admin typing FO/HO onto someone's
     leave must behave exactly as the published schedule does when it earns a
     credit on that day. It used to be refused, and refused SILENTLY, so the
     same two facts were kept or lost depending on which was entered first
     (Codex review, 20 Sep 26). Incoming credits are therefore never barred.

     NOR DOES IT BAR A BID ANY MORE. Clash-check B5 said "a bid made after the
     publish that overlaps published work is refused at the bid door". That was
     quoted to the owner on 20 Sep 26 with its consequence — the same Saturday's
     leave going through on the Inputs page form and refused on the grid — and
     overruled: flag it everywhere. B5's OTHER half, that publishing is the door
     which replaces an undecided bid, stands. `barsWrite` carries the rule for
     every door so the four cannot drift apart. */
  return [...recContribs(staying), ...absencesAt(personId, date)].some(o => barsWrite(c, o))
}

/** WHY a cell write would be refused, in the words the person needs — or null
 *  when it would go through. The picker asks this BEFORE writing, so a refusal
 *  is always explained: `setCell` answers only true/false, and the sheet used
 *  to close on a false as though it had worked, leaving no leave and no
 *  message ([S4-BUGHUNT], 20 Sep 26). Runs the same guards `setCell` runs,
 *  never a second copy of them — the `moveProblem` idiom. */
export function cellProblem(personId: string, date: string, code: string): string | null {
  if (!canEditCell(state.period, state.role, date)) return 'That day is not open for bidding — check the war and the bidding window.'
  if (!canEditRow(state.role, state.viewer, personId)) return 'You can only bid on your own row.'
  const clean = code.trim().toUpperCase()
  if (isMedical(clean)) return 'Medical is filed on the Inputs page, not here.'
  if (!clean) return null
  const list = listAt(personId, date)
  if (clean === 'FO' || clean === 'HO') {
    if (state.role !== 'admin') return 'Only an admin can enter OIL.'
    const had = list.find(isCredit)
    if (had && had.oil === 'auto') return 'That day already earns OIL from the published schedule.'
    /* nothing else stops a credit: work lands on a leave day and the day is
       flagged (owner, 20 Sep 26) */
    return null
  }
  if (!isBiddable(clean) || !parseCell(clean)) return 'That is not something you can bid here.'
  const portion = portionOfCode(clean)
  const replaced = liveRequestsOn(list, portion)
  if (replaced.length === 1 && replaced[0]!.code === clean) return null
  const c: Contrib = { id: 'new', kind: 'request', code: parseCell(clean)!.type, win: requestWin(clean), state: 'pending' }
  const staying = list.filter(r => !replaced.includes(r as RequestRec))
  const blocker = [...recContribs(staying), ...absencesAt(personId, date)].find(o => barsWrite(c, o))
  if (!blocker) return null
  if (isSickCode(blocker.code)) return `That day is already ${blocker.code === 'ATTC' ? 'ATT C' : blocker.code} — leave can't go over a medical.`
  return `That time is already taken by ${blocker.code} — clear it first.`
}

/** What the merged view shows on top at one address. */
function mainAt(personId: string, date: string): Contrib | null {
  const war = warHolding(getState().wars as MergedWar[], date) as MergedWar | undefined
  return war?.views[personId]?.[date]?.main ?? null
}

/** Write a bid (or, for an admin, a hand-typed FO/HO credit), or clear the
 *  cell with an empty code. Returns whether anything changed. The only path
 *  that writes a request; the same guards as ever — stage, window, row, and
 *  no medical from the war (owner, 13 Sep 26) — plus the step-4 occupancy
 *  rule: a bid may not land on a time a filed absence, worked time or
 *  another undecided bid already holds. */
export function setCell(personId: string, date: string, code: string): boolean {
  if (!canEditCell(state.period, state.role, date)) return false
  if (!canEditRow(state.role, state.viewer, personId)) return false
  const clean = code.trim().toUpperCase()
  if (isMedical(clean)) return false
  const list = listAt(personId, date)

  if (!clean) {
    /* clear: the requests at the address, and a hand-typed credit for an
       admin. A generated credit belongs to the schedule; a notice to its
       "OK, seen". */
    const next = list.filter(r => !(r.kind === 'request' || (r.kind === 'credit' && r.oil === 'manual' && state.role === 'admin')))
    if (next.length === list.length) return false
    return putList(personId, date, next)
  }

  if (clean === 'FO' || clean === 'HO') {
    if (state.role !== 'admin') return false
    const had = list.find(isCredit)
    if (had && had.oil === 'auto') return false
    if (had && had.code === clean) return false
    const c: Contrib = { id: 'new', kind: 'credit', code: clean, win: FULL }
    if (occupiedFor(c, personId, date, had ? [had] : [])) return false
    const rec: CreditRec = { id: had?.id ?? newRecId('c'), kind: 'credit', code: clean, oil: 'manual', ...(had?.note ? { note: had.note } : {}), ...(had?.spans ? { spans: had.spans } : {}) }
    return putList(personId, date, [...list.filter(r => r !== had), rec])
  }

  if (!isBiddable(clean) || !parseCell(clean)) return false
  const portion = portionOfCode(clean)
  const replaced = liveRequestsOn(list, portion)
  // re-typing the same bid keeps whatever decision it carries
  if (replaced.length === 1 && replaced[0]!.code === clean) return false
  const c: Contrib = { id: 'new', kind: 'request', code: parseCell(clean)!.type, win: requestWin(clean), state: 'pending' }
  if (occupiedFor(c, personId, date, replaced)) return false
  const rec: RequestRec = { id: newRecId(), kind: 'request', code: clean, state: 'pending' }
  return putList(personId, date, [...list.filter(r => !replaced.includes(r as RequestRec)), rec])
}

/** What a range write did. `skipped` counts days it was not allowed to touch,
 *  which is a fact the person deserves rather than a silent shortfall. */
export interface RangeWrite {
  written: number
  skipped: number
}

/** Write the same code across every day from `from` to `to`, inclusive (the
 *  owner's fortnight-in-one-go ask). PARTIAL BY DESIGN: a day it may not write
 *  (posted out, outside the window, already holding something the bid cannot
 *  share) is skipped and counted, the rest written. ONE gesture — one save,
 *  one undo step. */
export function setCellRange(personId: string, from: string, to: string, code: string): RangeWrite {
  if (to < from) return { written: 0, skipped: 0 }
  const person = state.people.find(p => p.id === personId)
  const dates: string[] = []
  for (let d = from; d <= to; d = addDays(d, 1)) dates.push(d)
  return writeMany(dates.map(date => ({ personId, date })), code, person ? () => person : undefined)
}

/* the shared body of the range and selection writers */
function writeMany(cells: { personId: string; date: string }[], code: string, who?: (id: string) => Person | undefined): RangeWrite {
  let written = 0, skipped = 0
  const find = who ?? ((id: string) => state.people.find(p => p.id === id))
  const clearing = !code.trim()
  gesture('lw.edit', () => {
    const wasQuiet = quiet
    quiet = true
    try {
      for (const { personId, date } of cells) {
        /* clearing an EMPTY cell is neither a write nor a refusal — a loose
           delete-box sweeps up empties around the bids */
        if (clearing && !listAt(personId, date).some(r => r.kind === 'request' || r.kind === 'credit')) continue
        const person = find(personId)
        if (person && !leaveDateOk(person, date)) { skipped++; continue }
        if (setCell(personId, date, code)) written++
        else skipped++
      }
    } finally {
      quiet = wasQuiet
    }
    if (written > 0 && !quiet) persistNotify()
  })
  return { written, skipped }
}

/** May leave be dated on this day for this person? Before they join and after
 *  they post out are both allowed (owner, 20 Sep 26 answer C) — the day must
 *  simply be in the war. A separate question from `inSquadron`, which still
 *  keeps them out of manning. */
function leaveDateOk(_p: Person, date: string): boolean {
  return !!warHolding(state.wars, date)
}

/** Write one code across a hand-picked set of cells. `{written, skipped}` in
 *  the `setCellRange` shape. */
export function setCells(cells: { personId: string; date: string }[], code: string): RangeWrite {
  return writeMany(cells, code)
}

/** Clear a set of cells — the empty-code path of `setCells`, named so the
 *  caller (and the tests) read as delete, not "write nothing". Approved leave
 *  in the selection is REMOVED through the absence door (design §5.2
 *  `lw.removeApproved` — deliberate delete propagates and sticks), in the same
 *  gesture. */
export function clearCells(cells: { personId: string; date: string }[]): RangeWrite {
  let written = 0, skipped = 0
  gesture('lw.edit', () => {
    const approved: Array<{ personId: string; date: string; iid: string }> = []
    const rest: { personId: string; date: string }[] = []
    for (const c of cells) {
      const m = mainAt(c.personId, c.date)
      if (m && m.kind === 'absence') {
        if (state.role === 'admin' && canDecide(state.period.stage, state.role) && warEditable(c.personId, c.date)) approved.push({ ...c, iid: m.id })
        else skipped++
      } else rest.push(c)
    }
    const r = writeMany(rest, '')
    written += r.written; skipped += r.skipped
    if (approved.length) {
      const d = DOOR ? DOOR.removeApproved(approved) : { done: 0, skipped: approved.length }
      written += d.done; skipped += d.skipped
    }
  })
  return { written, skipped }
}

/** An approved absence the war may change: every absence on the address was
 *  approved on the war, none is medical / course / OD, and it is not a cell
 *  holding two absences (those are changed one at a time from the list —
 *  design §23.3). */
function warEditable(personId: string, date: string): boolean {
  const war = warHolding(getState().wars as MergedWar[], date) as MergedWar | undefined
  const v = war?.views[personId]?.[date]
  if (!v || !v.main || v.main.kind !== 'absence') return false
  const abs = v.all.filter(c => c.kind === 'absence')
  return abs.length === 1 && !!abs[0]!.lw && isLeaveCode(abs[0]!.code)
}

/** Decide a set of cells at once — ADMIN ONLY, once bidding is no longer open
 *  (`canDecide`). Each cell acts on what it DISPLAYS (design §18 OA3-001): a
 *  shown request is decided (approving turns it into an Input through the
 *  door), a shown war-approved leave is un-approved back into a request. One
 *  gesture, one envelope; a cell with nothing decidable is skipped. */
export function setBidStates(cells: { personId: string; date: string }[], bid: BidState): { decided: number; skipped: number } {
  if (!canDecide(state.period.stage, state.role)) return { decided: 0, skipped: cells.length }
  let decided = 0, skipped = 0
  gesture('lw.decide', () => {
    const toApprove: Array<{ personId: string; date: string; recId: string }> = []
    const toUnapprove: Array<{ personId: string; date: string; iid: string }> = []
    const wasQuiet = quiet
    quiet = true
    let wrote = false
    try {
      for (const { personId, date } of cells) {
        const m = mainAt(personId, date)
        /* A DAY MAY HOLD BOTH: a filed afternoon leave shows on top of a
           morning bid nobody has decided (the ladder puts an absence above a
           request). Decide the UNDECIDED BID first — it is what a decision is
           for — instead of reading the day as "already approved" and reporting
           a decision that never happened (probe, 20 Sep 26). The tap list
           already acts per record; this is the drag / bulk path. */
        const live = liveRequestsOn(listAt(personId, date), 'full')
        if (live.length && (m?.kind !== 'request' || live.length > 1)) {
          for (const r of live) {
            if (bid === 'approved') { toApprove.push({ personId, date, recId: r.id }); continue }
            if (decideRequest(personId, date, r.id, bid)) { decided++; wrote = true } else skipped++
          }
          continue
        }
        if (m && m.kind === 'request') {
          if (bid === 'approved') { toApprove.push({ personId, date, recId: m.id }); continue }
          if (decideRequest(personId, date, m.id, bid)) { decided++; wrote = true } else skipped++
        } else if (m && m.kind === 'absence' && warEditable(personId, date)) {
          if (bid === 'approved') { decided++; continue }            // already approved: nothing to do
          toUnapprove.push({ personId, date, iid: m.id })
        } else skipped++
      }
    } finally {
      quiet = wasQuiet
    }
    if (wrote && !quiet) persistNotify()
    if (toApprove.length) {
      const r = DOOR ? DOOR.approve(toApprove) : { done: 0, skipped: toApprove.length }
      decided += r.done; skipped += r.skipped
    }
    if (toUnapprove.length) {
      const r = DOOR ? DOOR.decideApproved(toUnapprove, bid as RequestState) : { done: 0, skipped: toUnapprove.length }
      decided += r.done; skipped += r.skipped
    }
  })
  return { decided, skipped }
}

/** Record a decision on one cell — the single-cell sibling of `setBidStates`,
 *  with the same gate and the same "act on what is shown" rule. */
export function setBidState(personId: string, date: string, bid: BidState): void {
  setBidStates([{ personId, date }], bid)
}

/** Set the state of ONE request by its id (the tap list acts per record).
 *  Approving goes through the door; the rest is a plain edit. */
export function decideRequestById(personId: string, date: string, recId: string, bid: BidState): boolean {
  if (!canDecide(state.period.stage, state.role)) return false
  if (bid === 'approved') {
    return gesture('lw.decide', () => (DOOR ? DOOR.approve([{ personId, date, recId }]).done > 0 : false))
  }
  return gesture('lw.decide', () => decideRequest(personId, date, recId, bid))
}

/* ---- the tap list's per-record actions ([ARCH-STACK] step 4 — design §25
   OA10-001: a day holding several records lists EVERY one, each with its own
   permission-checked actions, so no record can hide under another) ---------- */

/** The war's own records at one address (requests, credits, notices). */
export function recordsAt(personId: string, date: string): readonly WarRec[] {
  return listAt(personId, date)
}

/** Clear ONE war record: a request (whoever may edit that cell today) or a
 *  hand-typed credit (an admin). A generated credit belongs to the schedule and
 *  a notice to its "OK, seen", so neither clears here. */
export function clearRecordById(personId: string, date: string, recId: string): boolean {
  const list = listAt(personId, date)
  const r = list.find(x => x.id === recId)
  if (!r) return false
  if (r.kind === 'request') {
    if (!canEditCell(state.period, state.role, date) || !canEditRow(state.role, state.viewer, personId)) return false
  } else if (r.kind === 'credit') {
    if (state.role !== 'admin' || r.oil !== 'manual') return false
  } else return false
  return gesture('lw.edit', () => putList(personId, date, list.filter(x => x !== r)))
}

/** Change ONE approved-on-the-war absence by its Input id: back to a request
 *  (`pending` / `acknowledged` / `refused`) or `removed` altogether. An admin
 *  at a deciding stage; the door refuses leave filed on the Inputs page and
 *  says why when a request already sits on that time (§24). Returns null when
 *  done, else the reason in the sheet's own words. */
export function changeAbsenceById(personId: string, date: string, iid: string, to: RequestState | 'removed'): string | null {
  if (state.role !== 'admin' || !canDecide(state.period.stage, state.role)) return 'Only an admin can change approved leave now'
  if (!DOOR) return 'Not available'
  const item = [{ personId, date, iid }]
  const r = gesture(to === 'removed' ? 'lw.edit' : 'lw.decide', () => (to === 'removed' ? DOOR!.removeApproved(item) : DOOR!.decideApproved(item, to)))
  /* a refusal inside the command (a locked week) rolls the gesture back and
     leaves `r` unset — report it rather than read through it (Fable #3) */
  if (!r) return 'Couldn’t change that — the week is locked, or something else refused it'
  if (r.done > 0) return null
  return r.why[0] ?? 'That leave was filed on the Inputs page — change it there'
}

/* the plain request-state edit: pending / acknowledged / refused. A refusal
   replaces an older refusal on the same half (one refused request per half). */
function decideRequest(personId: string, date: string, recId: string, bid: BidState): boolean {
  if (bid === 'approved') return false
  const list = listAt(personId, date)
  const r = list.find((x): x is RequestRec => x.kind === 'request' && x.id === recId)
  if (!r || r.state === bid) return false
  const next: RequestRec = { ...r, state: bid }
  let rest = list.filter(x => x !== r)
  if (bid === 'refused') {
    const halves = portionOfCode(r.code)
    const older = rest.filter((x): x is RequestRec => x.kind === 'request' && x.state === 'refused' &&
      (halves === 'full' || portionOfCode(x.code) === 'full' || portionOfCode(x.code) === halves))
    rest = rest.filter(x => !older.includes(x as RequestRec))
  } else if (r.state === 'refused') {
    /* reconsidering a refusal: it becomes undecided again, so it must not share
       a half with another undecided request */
    const clash = liveRequestsOn(rest, portionOfCode(r.code))
    if (clash.length) return false
    if (occupiedFor({ id: r.id, kind: 'request', code: parseCell(r.code)!.type, win: requestWin(r.code), state: bid as RequestState }, personId, date, [r])) return false
  }
  return putList(personId, date, [...rest, next])
}

/** "OK, seen" on a replaced-bid notice — the person or an admin. Clears every
 *  notice the same command made (one tap for a five-day replacement). */
export function ackReplacement(personId: string, noticeId: string): number {
  if (state.role !== 'admin' && state.viewer !== personId) return 0
  let seq: number | null = null
  for (const w of state.wars) for (const list of Object.values(w.recs[personId] ?? {})) {
    const n = list.find(r => r.kind === 'notice' && r.id === noticeId) as NoticeRec | undefined
    if (n) seq = n.seq
  }
  if (seq === null) return 0
  let cleared = 0
  gesture('lw.ack', () => {
    const wasQuiet = quiet
    quiet = true
    try {
      for (const w of state.wars) for (const [date, list] of Object.entries(w.recs[personId] ?? {})) {
        const keep = list.filter(r => !(r.kind === 'notice' && r.seq === seq))
        if (keep.length !== list.length) { cleared += list.length - keep.length; putList(personId, date, keep) }
      }
    } finally { quiet = wasQuiet }
    if (cleared && !quiet) persistNotify()
  })
  return cleared
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
  persistNotify()
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
  persistNotify()
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
  persistNotify()
  return 'removed'
}

/* THE EVENT-TYPE LIBRARY writers. Admin-only, squadron-wide, persisted under
   the `eventdefs` key. Each wraps a pure helper from engine/eventdefs.ts and
   returns its error sentence unchanged so the sheet can show it; a successful
   edit republishes state, saves and notifies like every other write. */

function commitEventDefs(result: EventDef[] | string): string | null {
  if (typeof result === 'string') return result
  state = withCurrent({ ...state, eventDefs: result })
  persistNotify()
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
  persistNotify()
  return true
}

export function resetEventTypes(): void {
  if (state.role !== 'admin') return
  state = withCurrent({ ...state, eventDefs: seedEventDefs() })
  persistNotify()
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
  // `eventDefs` and `people` feed the weekend/PH charging rule (charge.ts,
  // 3 Sep 26): which typed words are a holiday, and who is a pilot.
  // the MERGED wars (design §4.2 FB2-01): approved leave lives in the Inputs now
  return { openings: state.openings, ledger: state.ledger, sources: getState().wars, oilPolicy: state.oilPolicy, asOf: localToday(), eventDefs: state.eventDefs, people: state.people }
}

export function setOilPolicy(patch: Partial<OilPolicy>): boolean {
  if (state.role !== 'admin') return false
  // Through the untrusted reader on purpose: it is the one place the bounds
  // live, so a sheet cannot store a policy the next boot would throw away.
  const next = readOilPolicy({ ...state.oilPolicy, ...patch })
  if (!next) return false
  state = withCurrent({ ...state, oilPolicy: next })
  persistNotify()
  return true
}

/** Days come in HALVES — a half day (HO) is the smallest thing the grid ever
 *  charges, so a credit of 0.3 could never be drawn against. One rule for every
 *  pool, the tracker's included (owner, 6 Sep 26). */
const isHalfStep = (n: number) => Math.abs(n * 2 - Math.round(n * 2)) < 1e-9
export const HALF_STEP_MSG = 'Days come in halves — 1, 1.5, 2 …'

/** Which pools NEED a reason on a credit. OIL keeps the tracker's rule — a
 *  credit with no reason is the untraceable free text the ledger replaced;
 *  the other pools take a bare number from the grid (owner, 6 Sep 26 —
 *  "reason only for OIL"). ONE predicate: the writer, the edit path and the
 *  credit form all read it. */
export const reasonRequired = (counter: CounterName): boolean => counter === 'oil'

/** The sentence that stops a bad ledger write, or null. Stricter than the
 *  boot reader (which tolerates any string date and a zero amount, so an
 *  older stored ledger still loads): a NEW entry with no date or nothing in
 *  it is a mistake worth telling the admin about. */
function ledgerProblem(counter: CounterName, amount: number, date: string, reason: string, givenBy = ''): string | null {
  if (!Number.isFinite(amount) || amount === 0) return 'The amount must be a number other than 0'
  if (!isHalfStep(amount)) return HALF_STEP_MSG
  if (!ISO_DAY.test(date)) return 'Pick a date'
  const clean = reason.trim()
  if (!clean && reasonRequired(counter)) return 'Give a reason'
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
 * Credit a pool to one or many people at once — the tracker's "credit N
 * people" (owner: "drag and select all WSOs to put OIL, date and reason"),
 * and since 6 Sep 26 the figures bar's "+2 for everyone I dragged" on ANY
 * balance. A NEGATIVE amount is a correction, not a second mechanism
 * (§Counters). Returns the error sentence for the form, or null on success.
 * One state write for the whole batch → one persist, one undo step.
 */
export function grantTo(personIds: string[], counter: CounterName, amount: number, date: string, reason: string, givenBy = ''): string | null {
  if (state.role !== 'admin') return `Only an admin can credit ${counterLabel(counter)}`
  const ids = [...new Set(personIds)].filter(id => state.people.some(p => p.id === id))
  if (!ids.length) return 'Pick at least one person'
  const problem = ledgerProblem(counter, amount, date, reason, givenBy)
  if (problem) return problem
  const approvedBy = approverName()
  const by = givenBy.trim()
  let n = ledgerSeq()
  const entries: Ledger = ids.map(personId => ({
    id: `ol-${++n}`, personId, counter, amount, date, reason: reason.trim(), approvedBy,
    ...(by ? { givenBy: by } : {}),
  }))
  state = withCurrent({ ...state, ledger: [...state.ledger, ...entries] })
  persistNotify()
  return null
}

/** The OIL case of `grantTo` — kept so the tracker and its tests read as they
 *  always did. */
export function grantOil(personIds: string[], amount: number, date: string, reason: string, givenBy = ''): string | null {
  return grantTo(personIds, 'oil', amount, date, reason, givenBy)
}

/** Edit a grant in place — amount, date or reason. The approver stays who it
 *  was; the edit is visible in undo, which is the audit trail here. */
export function updateLedgerEntry(id: string, patch: { amount?: number; date?: string; reason?: string; givenBy?: string }): string | null {
  // The ENTRY first, then the role — so the refusal can name the pool it is
  // about (review, 6 Sep 26). This said "Only an admin can edit OIL" whatever
  // the entry was, from the day the ledger stopped being OIL's alone; a member
  // editing a CCL credit was told about a pool they had not touched. An id that
  // names nothing still answers "That entry is gone" first, which is true for a
  // member and an admin alike and gives away nothing either way.
  const cur = state.ledger.find(e => e.id === id)
  if (!cur) return 'That entry is gone'
  if (state.role !== 'admin') return `Only an admin can edit ${counterLabel(cur.counter)}`
  const amount = patch.amount ?? cur.amount
  const date = patch.date ?? cur.date
  const reason = patch.reason ?? cur.reason
  const givenBy = (patch.givenBy ?? cur.givenBy ?? '').trim()
  const problem = ledgerProblem(cur.counter, amount, date, reason, givenBy)
  if (problem) return problem
  state = withCurrent({
    ...state,
    ledger: state.ledger.map(e => {
      if (e.id !== id) return e
      const { givenBy: _g, ...rest } = e
      return { ...rest, amount, date, reason: reason.trim(), ...(givenBy ? { givenBy } : {}) }
    }),
  })
  persistNotify()
  return null
}

export function removeLedgerEntry(id: string): boolean {
  if (state.role !== 'admin') return false
  if (!state.ledger.some(e => e.id === id)) return false
  state = withCurrent({ ...state, ledger: state.ledger.filter(e => e.id !== id) })
  persistNotify()
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
  // Through the same ctx the column reads, or "set to 20" would land on a
  // different number than the figure shows once a holiday excuses a day.
  const opening = target - grantedTo(state.ledger, personId, counter) + drawnFrom(getState().wars, personId, counter, figureCtxOf())
  state = withCurrent({
    ...state,
    openings: { ...state.openings, [personId]: { ...state.openings[personId], [counter]: Math.round(opening * 1e6) / 1e6 || 0 } },
  })
  persistNotify()
  return true
}

/* THE COUNTER-COLUMN FIGURE ORDER AND VISIBILITY writers. ADMIN-GATED (owner,
   17 Aug 26: "normal user should not have authority to change the leave war
   column arrangement"; extended 6 Sep 26 — "admin should also be able to
   customise" which figures show at all) — the enforcement is in each writer
   below, mirroring the event-type library. (The counter SELECTION — which
   figure the column shows right now — stays ungated view state; only the
   ORDER and the HIDDEN set are management's.) Persisted under `figorder` and
   `fighidden`. The order is normalised through `orderedFigures` on every
   move, so a stored blob missing a new figure (or naming a dead one) is
   healed the first time it is touched rather than carried forward malformed;
   `visibleFigures` applies the hidden set on top of that healed order, so a
   hidden id that no longer exists just never appears in it. */

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
  persistNotify()
  return true
}

/** Put the column's figures back in their catalogue order, and unhide every
 *  one — a reset is the admin's way back to the factory arrangement, and a
 *  figure they hid and forgot about should not survive it. */
export function resetFigureOrder(): void {
  // Same gate as moveFigure — a reset rewrites the arrangement too.
  if (state.role !== 'admin') return
  state = withCurrent({ ...state, figureOrder: [...DEFAULT_FIGURE_ORDER], figureHidden: [] })
  persistNotify()
}

/** The figures the column cycles and the drawer shows: the admin's order,
 *  less the hidden ones. Every surface that lists figures reads this, so a
 *  hidden figure disappears from all of them at once. */
export function visibleFigures(): Figure[] {
  const hidden = new Set(state.figureHidden)
  const shown = orderedFigures(state.figureOrder).filter(f => !hidden.has(f.id))
  // A stale hidden list naming every figure would leave nothing to show —
  // fall back to the whole order rather than an empty column.
  return shown.length ? shown : orderedFigures(state.figureOrder)
}

/** Hide or show one figure. ADMIN-gated, and the last visible figure cannot
 *  be hidden — returns whether anything changed. */
export function toggleFigure(id: string): boolean {
  if (state.role !== 'admin') return false
  // Mirrors moveFigure's unknown-id no-op: an id that names no real figure
  // (a typo, a stale saved order) must not be recorded as hidden forever —
  // `orderedFigures` is the same "does this name a real figure" check the
  // rest of this block already leans on.
  if (!orderedFigures(state.figureOrder).some(f => f.id === id)) return false
  const hidden = new Set(state.figureHidden)
  if (hidden.has(id)) hidden.delete(id)
  else {
    if (visibleFigures().length <= 1) return false
    hidden.add(id)
  }
  state = withCurrent({ ...state, figureHidden: [...hidden] })
  persistNotify()
  return true
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
  persistNotify()
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
  persistNotify()
}

/** Hide or show one manning row. ADMIN-gated. */
export function toggleManningRow(id: string): void {
  if (state.role !== 'admin') return
  const hidden = new Set(state.manningHidden)
  hidden.has(id) ? hidden.delete(id) : hidden.add(id)
  state = withCurrent({ ...state, manningHidden: [...hidden] })
  persistNotify()
}

/** Put every manning row back — natural order, nothing hidden. ADMIN-gated. */
export function resetManning(): void {
  if (state.role !== 'admin') return
  state = withCurrent({ ...state, manningOrder: [], manningHidden: [] })
  persistNotify()
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
  persistNotify()
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
  persistNotify()
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
  persistNotify()
  return true
}

/** Put the BUILT-IN counter set back — the recovery path when a seeded row
 *  was deleted or reworked beyond recognition. Counters the admin created
 *  are discarded with everything else, which is what "reset" says; the
 *  toolbar arms the button so one stray tap cannot do it. ADMIN-gated. */
export function resetManningRules(): void {
  if (state.role !== 'admin') return
  state = withCurrent({ ...state, requirements: seedRequirements(), manningOrder: [], manningHidden: [] })
  persistNotify()
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
  // A pruned group takes its picked colour with it, as a removed one does.
  state = withCurrent({ ...state, qualCatalog: catalog, ...(changed ? { groupDefs, groupColors: colorsFor(groupDefs, state.groupColors) } : {}) })
  // a durable group prune persists+notifies; a pure catalogue reprojection just
  // repaints (qualCatalog is a projection, not a persisted field).
  if (changed) persistNotify(); else notify()
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
 * Post an OIL credit earned on the schedule — sync wire 4's writer.
 *
 * Only `FO` and `HO` come through here, from published weekend/PH work or an
 * acknowledged duty claim (`engine/oil.ts`). The credit is an `auto` record the
 * pass may take away again; `spans` are the actual work times (clash check B4,
 * B8). It lands BESIDE whatever else is on the day — ALWAYS, since the owner's
 * 20 Sep 26 ruling: work overlapping leave, a medical or an undecided bid is
 * reported as a clash and the day goes amber, but the credit is still banked
 * and stays until a human resolves it by removing one side or the other. A
 * hand-typed credit already there is the squadron having recorded the same
 * fact first: taken over in place.
 */
export function ingestDutyCredit(personId: string, date: string, code: 'FO' | 'HO', why?: string, spans?: Array<[number, number]>): IngestResult {
  // Locked — a sync-driven credit is not an undo step.
  return locked(() => ingestDutyCreditImpl(personId, date, code, why, spans))
}
function ingestDutyCreditImpl(personId: string, date: string, code: 'FO' | 'HO', why?: string, spans?: Array<[number, number]>): IngestResult {
  if (code !== 'FO' && code !== 'HO') return 'ignored'
  if (!warHolding(state.wars, date)) return 'ignored'
  const list = listAt(personId, date)
  const had = list.find(isCredit)
  const note = (why ?? '').trim().slice(0, MAX_REC_NOTE)
  const clean = spans?.filter(s => Array.isArray(s) && s[0] <= s[1] && s[0] >= 0 && s[1] <= 1439)
  const rec: CreditRec = { id: had?.id ?? newRecId('c'), kind: 'credit', code, oil: 'auto', ...(note ? { note } : {}), ...(clean && clean.length ? { spans: clean } : {}) }
  const probe = recContribs([rec]).map(c => ({ ...c, id: 'new' }))
  const staying = list.filter(r => r !== had)
  const others = [...recContribs(staying), ...absencesAt(personId, date)]
  /* THE CREDIT LANDS EVEN WHEN IT OVERLAPS AN ABSENCE (owner, 20 Sep 26 —
     "if someone is working, even tho they have leave on that day, it should
     still bank the OIL credit … until that thing is resolved — which means
     that if work is removed, then no OIL credit. If leave is removed then OIL
     still credits").
     This SETS ASIDE clash-check B4's "Overlap → no credit" half. B4's time
     test itself stands, in `forbiddenPair`, and is exactly what turns the day
     amber. Refusing to place the credit was the older reading and it cost more
     than it saved: the forward pass wrote nothing, the reverse pass skipped
     the address because the address was still wanted, and a credit already
     sitting there under evidence that had since changed went on claiming hours
     the person no longer worked. Writing unconditionally fixes that by
     overwriting, and the resolution the owner describes falls out of machinery
     that already exists — `dayView` derives the amber from the very pair we no
     longer refuse, the strip is derived from the same conflicts, and the
     reverse pass already removes an auto credit once the work is gone. */
  const clash = probe.some(p => others.some(o => forbiddenPair(p, o)))
  if (had && had.oil === 'auto' && had.code === code && JSON.stringify(had) === JSON.stringify(rec)) return clash ? 'clash' : 'confirmed'
  /* TAKEN OVER IN PLACE, BUT NEVER DESTROYED. The squadron recorded this fact
     first; the schedule now backs it, so the credit becomes the schedule's and
     shows as such. What it must NOT do is forget where it came from: the
     reverse pass may clear an `auto` credit, so an unpublish used to delete
     the admin's own record outright — a hand-entered call-out vanished because
     the schedule later happened to earn a credit on the same day (Codex
     review, 20 Sep 26), against design §18 OA3-003. It now carries
     `wasManual`, the admin's own reason is kept in preference to the
     schedule's words, and an unpublish returns it to `manual` rather than
     removing it. */
  /* Idempotent on purpose: the pass runs on EVERY change, so a second run
     must recognise a credit it has already taken over and carry the snapshot
     forward untouched. Testing `oil === 'manual'` alone lost it on the very
     next pass, which put the deletion-on-unpublish straight back. */
  const snap: CreditRec['manual'] | undefined = had
    ? had.manual ?? (had.oil === 'manual'
      ? { code: had.code, ...(had.note ? { note: had.note } : {}), ...(had.spans ? { spans: had.spans } : {}) }
      : undefined)
    : undefined
  const kept: CreditRec = snap ? { ...rec, manual: snap } : rec
  putList(personId, date, [...staying, kept])
  /* 'clash' still REPORTS — the day needs a human — but it no longer means
     "nothing was written". The credit is on the day either way. */
  return clash ? 'clash' : snap ? 'confirmed' : 'written'
}

/**
 * The REASON on a hand-entered FO/HO credit (owner, 2 Sep 26). Admin only; the
 * day must hold a credit. An empty note clears it.
 */
export function setCellNote(personId: string, date: string, note: string): string | null {
  if (state.role !== 'admin') return 'Only an admin can edit OIL'
  if (!warHolding(state.wars, date)) return 'That day is in no war'
  const list = listAt(personId, date)
  const had = list.find(isCredit)
  if (!had) return 'Only an FO or HO credit takes a reason'
  const clean = note.trim()
  if (clean.length > MAX_REC_NOTE) return `A reason is at most ${MAX_REC_NOTE} characters`
  const { note: _old, ...rest } = had
  const next: CreditRec = clean ? { ...rest, note: clean } : rest
  putList(personId, date, list.map(r => (r === had ? next : r)))
  return null
}

/**
 * Remove a GENERATED credit the schedule no longer earns — the OIL pass's
 * clean-up, and nothing else's. A hand-typed credit is never touched (design
 * §18 OA3-003). Ignores stage, role and window: the schedule's word arrives
 * already decided.
 */
export function clearRaptorCell(personId: string, date: string): boolean {
  // Locked: a sync-driven delete is not a Leave War undo step.
  return locked(() => {
    const list = listAt(personId, date)
    const had = list.find(r => r.kind === 'credit' && r.oil === 'auto') as CreditRec | undefined
    if (!had) return false
    /* the squadron's OWN record, taken over in place when the schedule agreed
       with it: give back EXACTLY what the admin typed rather than deleting it,
       and rather than handing back the schedule's credit wearing a manual
       label (design §18 OA3-003) */
    if (had.manual) {
      const back: CreditRec = { id: had.id, kind: 'credit', oil: 'manual', code: had.manual.code,
        ...(had.manual.note ? { note: had.manual.note } : {}),
        ...(had.manual.spans ? { spans: had.manual.spans } : {}) }
      return putList(personId, date, list.map(r => (r === had ? back : r)))
    }
    return putList(personId, date, list.filter(r => r !== had))
  })
}

/** What a shift did, or why it did nothing. `window` covers every "not an
 *  editable day" refusal: outside the stage/window this role may write, off
 *  the war's own calendar, or not a day leave may be dated for this person. */
export type ShiftResult = 'shifted' | 'occupied' | 'raptor' | 'nothing' | 'window'

/**
 * Move a bid to a different date — lands PENDING (a move is a proposal), and
 * keeps the date it came from once bidding is closed (the dotted mark, owner
 * 27 Aug 26). Acts on the request the day SHOWS; an approved leave shown there
 * moves through the absence door instead. Never overwrites: a landing that
 * cannot share the day refuses.
 */
export function shiftBid(personId: string, from: string, to: string): ShiftResult {
  const m = mainAt(personId, from)
  if (!m) return 'nothing'
  if (m.kind === 'absence') {
    if (!warEditable(personId, from)) return 'raptor'
    const r = moveCells([{ personId, date: from }], dayDiff(from, to))
    return r === 'moved' ? 'shifted' : r.reason === 'occupied' ? 'occupied' : r.reason === 'raptor' ? 'raptor' : r.reason === 'window' ? 'window' : 'nothing'
  }
  if (m.kind !== 'request' || !isBiddable(m.code)) return 'nothing'
  if (!canEditRow(state.role, state.viewer, personId)) return 'nothing'
  if (!canEditCell(state.period, state.role, from)) return 'window'
  if (!canEditCell(state.period, state.role, to)) return 'window'
  if (!state.period.days.some((d: any) => d.date === to)) return 'window'
  if (from === to) return 'occupied'
  const src = listAt(personId, from).find((r): r is RequestRec => r.kind === 'request' && r.id === m.id)
  if (!src) return 'nothing'
  const c: Contrib = { id: src.id, kind: 'request', code: m.code, win: requestWin(src.code), state: 'pending' }
  if (occupiedFor(c, personId, to) || liveRequestsOn(listAt(personId, to), portionOfCode(src.code)).length) return 'occupied'
  const tracked = biddingClosed(state.period.stage)
  const landed: RequestRec = {
    id: src.id, kind: 'request', code: src.code, state: 'pending',
    ...(tracked ? { shiftedFrom: src.shiftedFrom ?? from } : {}),
    ...(src.carried ? { carried: src.carried } : {}),
  }
  gesture('lw.edit', () => {
    const wasQuiet = quiet
    quiet = true
    try {
      putList(personId, from, listAt(personId, from).filter(r => r !== src))
      putList(personId, to, [...listAt(personId, to), landed])
    } finally { quiet = wasQuiet }
    if (!quiet) persistNotify()
  })
  return 'shifted'
}

function dayDiff(a: string, b: string): number {
  const t = (s: string) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10))
  return Math.round((t(b) - t(a)) / 86400000)
}

/** Does this cell hold something THIS role may move? A request on a row this
 *  role owns, in an editable day — or, for an admin at the deciding stages, a
 *  war-approved leave (design §17 FB3-01). One body for the sheet, the anchor
 *  and the mover. */
function isMovableSource(personId: string, date: string): boolean {
  if (!canEditRow(state.role, state.viewer, personId)) return false
  const m = mainAt(personId, date)
  if (!m) return false
  if (m.kind === 'request') return isBiddable(m.code) && canEditCell(state.period, state.role, date)
  if (m.kind === 'absence') return canDecide(state.period.stage, state.role) && warEditable(personId, date)
  return false
}

/** Move ONE war-approved leave, by its Input id, to another date — the tap
 *  list's per-record Move (design §23.3; Codex AS4-006): on a day holding
 *  several records the grid's drag cannot tell which one to take, so the list
 *  moves exactly the one tapped. Same law as a drag: an admin at a deciding
 *  stage, both days in the war, the landing free (the door's own check), the
 *  dotted mark once bidding is closed. Null when moved, else why not. */
export function moveAbsenceById(personId: string, date: string, iid: string, to: string): string | null {
  if (state.role !== 'admin' || !canDecide(state.period.stage, state.role)) return 'Only an admin can move approved leave now'
  if (!DOOR) return 'Not available'
  const delta = Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) / 86_400_000)
  if (!delta) return 'Pick a different day'
  const dayset = new Set(state.period.days.map((d: any) => d.date))
  if (!dayset.has(to)) return 'That day is not in this war'
  const item = [{ personId, date, iid }]
  const tracked = biddingClosed(state.period.stage)
  const why = (p: { reason: string; at?: string }) => p.reason === 'occupied' ? `${p.at ?? to} already has something on that time` : p.reason === 'window' ? 'That day is outside the war or on a locked week' : 'That leave was filed on the Inputs page — change it there'
  const p = DOOR.moveApproved(item, delta, tracked, true)
  if (p) return why(p)
  /* report what the COMMAND did, not what the preflight hoped (AS4-R2-001) */
  const done = gesture('lw.edit', () => DOOR!.moveApproved(item, delta, tracked, false))
  if (done === undefined) return 'Couldn’t move that — the week is locked, or something else refused it'
  return done ? why(done) : null
}

/** The cells of a selection that actually hold something movable (owner,
 *  27 Aug 26 — the drag-move acts on the inputs PRESENT in the box). */
export function movableCells(cells: { personId: string; date: string }[]): { personId: string; date: string }[] {
  return cells.filter(c => isMovableSource(c.personId, c.date))
}

export type MoveResult = 'moved' | { reason: 'nothing' | 'raptor' | 'occupied' | 'window'; at?: string }

/** The validation half of `moveCells`, held apart so the grid's landing
 *  preview asks the SAME rule the commit applies. Null when clear. */
export function moveProblem(cells: { personId: string; date: string }[], dayDelta: number): Exclude<MoveResult, 'moved'> | null {
  if (!dayDelta || cells.length === 0) return { reason: 'nothing' }
  const dayset = new Set(state.period.days.map((d: any) => d.date))
  const reqs: Array<{ personId: string; date: string; rec: RequestRec }> = []
  const abs: Array<{ personId: string; date: string; iid: string }> = []
  for (const c of cells) {
    if (!canEditRow(state.role, state.viewer, c.personId)) return { reason: 'nothing', at: c.date }
    const m = mainAt(c.personId, c.date)
    if (!m) return { reason: 'nothing', at: c.date }
    if (m.kind === 'absence') {
      if (!canDecide(state.period.stage, state.role) || !warEditable(c.personId, c.date)) return { reason: 'raptor', at: c.date }
      abs.push({ ...c, iid: m.id })
      continue
    }
    if (m.kind !== 'request' || !isBiddable(m.code)) return { reason: 'nothing', at: c.date }
    if (!canEditCell(state.period, state.role, c.date)) return { reason: 'window', at: c.date }
    const rec = listAt(c.personId, c.date).find((r): r is RequestRec => r.kind === 'request' && r.id === m.id)
    if (!rec) return { reason: 'nothing', at: c.date }
    reqs.push({ ...c, rec })
  }
  const moving = new Set(reqs.map(r => r.rec))
  for (const r of reqs) {
    const to = addDays(r.date, dayDelta)
    if (!dayset.has(to)) return { reason: 'window', at: to }
    if (!canEditCell(state.period, state.role, to)) return { reason: 'window', at: to }
    const landing = listAt(r.personId, to).filter(x => !moving.has(x as RequestRec))
    const c: Contrib = { id: r.rec.id, kind: 'request', code: parseCell(r.rec.code)!.type, win: requestWin(r.rec.code), state: 'pending' }
    /* the selection's own approved leave sliding away frees its landing too */
    const absHere = absencesAt(r.personId, to).filter(a => !abs.some(x => x.iid === a.id && x.personId === r.personId))
    if ([...recContribs(landing), ...absHere].some(o => barsWrite(c, o))) return { reason: 'occupied', at: to }
    if (liveRequestsOn(landing, portionOfCode(r.rec.code)).length) return { reason: 'occupied', at: to }
  }
  if (abs.length) {
    for (const a of abs) if (!dayset.has(addDays(a.date, dayDelta))) return { reason: 'window', at: addDays(a.date, dayDelta) }
    const p = DOOR ? DOOR.moveApproved(abs, dayDelta, biddingClosed(state.period.stage), true) : { reason: 'nothing' as const }
    if (p) return p
  }
  return null
}

/** Move a whole SELECTION by a day-delta — the drag-select "Move" (owner,
 *  27 Aug 26). ATOMIC: validated first, then ONE gesture — requests re-placed
 *  pending (with the moved-from trail once bidding is closed), approved leave
 *  slid through the absence door — one envelope, one undo step. */
export function moveCells(cells: { personId: string; date: string }[], dayDelta: number): MoveResult {
  const problem = moveProblem(cells, dayDelta)
  if (problem) return problem
  const tracked = biddingClosed(state.period.stage)
  gesture('lw.move', () => {
    const reqs: Array<{ personId: string; from: string; to: string; rec: RequestRec }> = []
    const abs: Array<{ personId: string; date: string; iid: string }> = []
    for (const c of cells) {
      const m = mainAt(c.personId, c.date)
      if (m?.kind === 'absence') { abs.push({ ...c, iid: m.id }); continue }
      const rec = listAt(c.personId, c.date).find((r): r is RequestRec => r.kind === 'request' && r.id === m?.id)
      if (rec) reqs.push({ personId: c.personId, from: c.date, to: addDays(c.date, dayDelta), rec })
    }
    const wasQuiet = quiet
    quiet = true
    try {
      // every source out before any landing, so a block sliding over itself
      // never deletes a day it has just filled
      for (const r of reqs) putList(r.personId, r.from, listAt(r.personId, r.from).filter(x => x !== r.rec))
      for (const r of reqs) {
        const landed: RequestRec = {
          id: r.rec.id, kind: 'request', code: r.rec.code, state: 'pending',
          ...(tracked ? { shiftedFrom: r.rec.shiftedFrom ?? r.from } : {}),
          ...(r.rec.carried ? { carried: r.rec.carried } : {}),
        }
        putList(r.personId, r.to, [...listAt(r.personId, r.to), landed])
      }
    } finally { quiet = wasQuiet }
    if (reqs.length && !quiet) persistNotify()
    if (abs.length && DOOR) DOOR.moveApproved(abs, dayDelta, tracked, false)
  })
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
  const picked = state.wars.find(w => w.period.id === id)
  if (!picked) return
  // Land on the START of the new war's bidding window (owner, 7 Sep 26 — the
  // same rule as opening the tab). The old focus pointed into the war just
  // left, and since wars do not overlap that date names no column in the new
  // grid — so it had to go; but rather than drop it to nothing, we point it at
  // the new war's own bid-start, a real column here and where the reader wants
  // to be. `focusSeq` bumps so the matrix re-runs its jump even when the two
  // wars happen to share a start date.
  state = withCurrent({
    ...state,
    currentId: id,
    focusDate: defaultFocusDate(picked.period),
    focusSeq: state.focusSeq + 1,
  })
  persistNotify()
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
 * Its one caller is the e2e probe bridge. The under-manned fixtures — which used
 * to inject a red-day war by writing `leavewar:wars` into localStorage before
 * boot — cannot reach the store that way, so they boot the app and then push the
 * same war object in through here. Not a production path.
 * CORRECTED 17 Sep 26: the old reason given was "Leave War is session-only now (a
 * memory backend)". It is not — Leave War persists on a built site; the memory
 * backend is the dev/test path, which is what the e2e run uses. The bridge is
 * still the right seam because it does not depend on which backend is mounted.
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
  persistNotify()
  return 'created'
}
