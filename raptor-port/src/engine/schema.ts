/* THE SCHEDULER'S RECORD SHAPES, DECLARED (Part C of the schema-hardening
   design, docs/superpowers/specs/2026-09-09-schema-hardening-design.md).

   Every record this file describes is typed `any` where it lives (PEOPLE,
   INPUTS, DAYS, SCHED, the snapshots) and that stays so: the engine bodies
   are verbatim ports and a `:any` there is load-bearing. What was missing was
   ONE place that says what a Person, an Input, a Day actually carry — the
   prose is in docs/data-schema.md, but prose cannot fail a build. These types
   are that place, and schema.test.ts walks the live seed data against the
   same shapes at runtime, so a field added to a seed without being declared
   here goes red rather than drifting.

   Declarations only. The few `const` literal lists are here because the
   union types are derived from them and the conformance test reads the same
   lists — one spelling, not two.

   STYLE: this file is NEW, not a port, so it uses ordinary TS style (2-space,
   no semicolons, single quotes) rather than the compressed one-line style the
   ported engine bodies keep. Every field comment says what the field means,
   its unit or format, and who writes it: `seed` (the authored literal),
   `engine` (src/engine at boot or on an action), `screen` (a page in src/ui
   or src/state). Types already declared elsewhere are re-exported, never
   duplicated. */

import type { WaveKind, WaveTpl, WaveTplLine } from './wavetpl'
import type { DutyWave, DutyTpl, DutyTplRow } from './dutytpl'
import type { DayTpl, DayTplBlob } from './daytpl'
import type { QualCol } from './qualcols'
import type { Lookahead } from './lookahead'
import type { ELogRow } from './editlog'

export type { WaveKind, WaveTpl, WaveTplLine, DutyWave, DutyTpl, DutyTplRow, DayTpl, DayTplBlob, QualCol, Lookahead, ELogRow }

/* ---------------------------------------------------------------------------
   People — PEOPLE[id], src/engine/people.ts
   --------------------------------------------------------------------------- */

/** Cockpit seat: front (pilot), rear (WSO), or ground crew. */
export const SEATS = ['FCP', 'RCP', 'GND'] as const
export type Seat = (typeof SEATS)[number]

/** The CAT ladder lowest to highest (people.ts QORDER), plus '' for ground crew who hold no CAT. */
export const QLEVELS = ['OCU', 'D', 'C', 'B', 'A', 'IW', 'IP', 'IR', 'FI', ''] as const
export type QLevel = (typeof QLEVELS)[number]

/** A currency tick that can also be an instructor mark — 'I' outranks true (AAR only). */
export type IFlag = boolean | 'I'

/** The derived LoX qualification flags, `deriveQuals` (people.ts). Ground crew hold `{}`, so every key is optional. */
export type Quals = {
  /** SXO-qualified — engine, `!!p.sxo`. */
  sxo?: boolean
  /** Instrument-met current — engine, CAT above OCU. */
  imc?: boolean
  /** NVG current — engine, CAT above OCU. */
  nvg?: boolean
  /** Terrain following — engine mirrors `p.tf`, then screen (Quals page) ticks it. */
  tf?: boolean
  /** SANS member — engine mirrors `p.san`. */
  san?: boolean
  /** Scheduler appointment (feeds the sign-off drop-downs) — engine boot pass, then screen. */
  sched?: boolean
  /** SC day currency — engine boot pass, then screen. */
  scDay?: boolean
  /** SC night currency; demoted when day is absent — engine boot pass, then screen. */
  scNight?: boolean
  /** Day AAR, front seat only; 'I' = may instruct it — engine boot pass, screen promotes. */
  daar?: IFlag
  /** Night AAR, demoted when day is absent — engine boot pass, screen promotes. */
  naar?: IFlag
  /** Any admin-added LoX column (qualcols.ts `k`) is ticked straight into this object by the Quals page. */
  [custom: string]: IFlag | undefined
}

/** A SANS member's quarter progress (people.ts) — demo data, engine-written. */
export type SanQ = {
  /** Sorties flown this quarter. */
  flown: number
  /** Shortfall carried in from last quarter (sorties). */
  carry: number
  /** Consecutive quarters proficiency was missed. */
  missedQtrs: number
}

/** One roster entry. The key of PEOPLE is the id every other record refers to. */
export type Person = {
  /** Callsign, the display name — seed; screen (Personnel rename, slots.ts). */
  cs: string
  /** Seat — seed. */
  seat: Seat
  /** CAT level, '' for ground crew — seed; screen (Quals page dropdown). */
  q: QLevel
  /** SXO-qualified — seed; screen (Quals page). */
  sxo?: boolean
  /** Initials — seed (ground crew); screen (the Quals page writes it for aircrew too). */
  initials?: string
  /** Flight — seed (ground crew); screen (the Quals page writes it for aircrew too). */
  flight?: string
  /** Free-text note, ground crew — seed; screen (Personnel table). */
  remarks?: string
  /** Ground personnel: a real body with no flying qualification — seed. */
  pers?: boolean
  /** Sentinel body (ALL, ALL AVAIL): fills slots, is not a person — seed. */
  special?: boolean
  /** Kept out of every roster and list — seed. */
  archived?: boolean
  /** SANS member — engine (SANS_IDS pass at module load). */
  san?: boolean
  /** Quarter progress, present only when `san` — engine. */
  sanQ?: SanQ
  /** Terrain-following mark, granted by hand — screen. */
  tf?: boolean
  /** Scheduler appointment, granted by hand — screen. */
  sched?: boolean
  /** SC day currency seed — screen. */
  scDay?: boolean
  /** SC night currency seed — screen. */
  scNight?: boolean
  /** Day AAR seed — screen. */
  daar?: IFlag
  /** Night AAR seed — screen. */
  naar?: IFlag
  /** DERIVED flags — engine (`deriveQuals` on every person at module load and on every Quals-page edit). Absent only inside the seed literal before that pass. */
  quals: Quals
}

/* ---------------------------------------------------------------------------
   Inputs — INPUTS[], src/engine/inputs.ts
   --------------------------------------------------------------------------- */

/** The catalogue codes (inputs.ts INPUT_META keys). schema.test.ts pins this list against the catalogue. */
export const INPUT_TYPES = [
  'LL', 'OL', 'OIL', 'CCL', 'PL', 'FCL', 'EL', 'CL',
  'HL', 'OML', 'ATT C', 'ATT B', 'Upchit',
  'Training', 'CSE', 'Meeting', 'Fly with', 'Personal', 'Appointment', 'Duty', 'OD', 'Other',
  'SANS Availability',
] as const
export type InputType = (typeof INPUT_TYPES)[number]

/** What happened to an activity input: landed on the Ground Programme, actioned to Unavailable, or removed by a scheduler (dormant). Absent = never landed. */
export type InputAcc = 'g' | 'u' | 'r'

/** Which SANS events a SANS Availability input offers: fly, OFT, AMT. */
export type SansOffer = { f?: true; o?: true; a?: true }

/** One filed input (leave / away / medical / activity). */
export type Input = {
  /** Stable address, minted `'i' + n` at creation — engine (`mintInpIds` at boot, `inpId` on add). Absent only inside a seed literal before boot. */
  iid?: string
  /** A PEOPLE id — seed; screen. */
  person: string
  /** First day, display form 'Jul 13'; carries a trailing year ('Jan 3 2027') when outside the anchor year — seed; screen. */
  date: string
  /** Last day of a span, same format — seed; screen. */
  endDate?: string
  /** The row's own anchor year for bare labels — engine (boot) and screen (on create/edit). */
  yr?: number
  /** All day, or a window — seed; screen. */
  allday: boolean
  /** Window start, minutes from midnight; present with `e` when not all-day — seed; screen. */
  s?: number
  /** Window end, minutes from midnight; may be below `s` when the window crosses midnight — seed; screen. */
  e?: number
  /** Half-day marker — screen. */
  half?: 'am' | 'pm'
  /** Catalogue code — seed; screen. */
  type: InputType
  /** Free text, may be ''; absent on the demo SANS seed rows — seed; screen. */
  remarks?: string
  /** Last-modified stamp for the lateness mark: ISO 'yyyy-mm-dd', or the literal 'now' the Inputs page writes — seed; screen. */
  mod: string
  /** Landing state — engine (slots.ts acceptInput / unacceptInput). */
  acc?: InputAcc
  /** The Leave War's loop-breaker: the id of the war this leave came from (never a boolean) — screen (src/leavewar/sync.ts). */
  lw?: string
  /** Attachment id — screen (state/docs.ts). */
  docId?: string
  /** Every attachment id when there is more than one — screen. */
  docIds?: string[]
  /** Per-day OIL credit decision, ISO date → 0 / 0.5 / 1 — screen (ui/inputedit.tsx). */
  oil?: Record<string, 0 | 0.5 | 1>
  /** SANS Availability only: which events are offered — screen. */
  sans?: SansOffer
}

/* ---------------------------------------------------------------------------
   A schedule day — DAYS[0..6], src/engine/data.ts (+ week2.ts)
   --------------------------------------------------------------------------- */

/** The cancel / red-box flag family every crewed row can carry — engine (board.ts cxCommit) and screen. */
export type RowFlags = {
  /** Cancelled — engine/screen. */
  cx?: boolean
  /** Cancel reason (from the cancel-reasons list), only with `cx` — engine/screen. */
  cxr?: string
  /** Red-box flag — screen. */
  flag?: boolean
}

/** A Common Programme item (day.allhands[i]). `who` may be a PEOPLE id, a callsign (after a rename), free text such as 'EXT SQN', or a list. */
export type AllhandsRow = RowFlags & {
  /** Item name — seed; screen. */
  prog: string
  /** Start, 'HHMM' (or 'HH:MM'), may be '' — seed; screen. */
  str: string
  /** End, same format, may be '' — seed; screen. */
  end: string
  /** Who runs it: one id or free text, or an array when more than one — seed; engine (`whoSet`). */
  who?: string | string[]
  /** Overflow crew beyond `who` — engine (slots.ts). */
  more?: string[]
  /** Info-only, not checked — screen. */
  info?: boolean
  /** Stable row id — engine (rowids.ts); minted before the first baseline, never printed, optional only in a seed literal. */
  rid?: string
}

/** A Ground Programme row (day.ground[i]); same family as AllhandsRow plus the input it was promoted from. */
export type GroundRow = AllhandsRow & {
  /** The submitter's input remarks, carried into the row when landed — engine (acceptInput). */
  rmks?: string
  /** Back-reference to the INPUTS content key (`inpKey`) it was landed from — engine (acceptInput). */
  src?: string
}

/** A standalone wave kind: SC, AVALON, BB (a flying wave has none). */
export type SaKind = Exclude<DutyWave, ''>

/** A per-jet store / config toggle; keys are the STORE_CFG keys plus `bombs`, whose value is text. */
export type AircraftOpts = Record<string, boolean | string>

/** One seat pair on a formation line (formation.aircraft[i]). */
export type AircraftSeat = RowFlags & {
  /** FCP, a PEOPLE id or '' — seed; screen. */
  p: string
  /** RCP, a PEOPLE id or '' — seed; screen. */
  w: string
  /** Operating area, may be '' — seed; screen. */
  area: string
  /** Remarks; AAR / seat-segment text lives here — seed; screen. */
  rmks: string
  /** Store toggles — seed; screen. */
  opts: AircraftOpts
  /** Standalone crew row: this is a SPARE line — engine (`saCrewRow`), screen flips it. */
  spare?: boolean
  /** Mirrors `spare` as the row label — engine/screen. */
  role?: 'MAIN' | 'SPARE'
  /** Stable row id — engine (rowids.ts); minted before the first baseline, never printed, optional only in a seed literal. */
  rid?: string
}
export type Aircraft = AircraftSeat

/** A "Go" (wave.formations[i]). */
export type Formation = {
  /** Callsign, may be '' — seed; screen. */
  cs: string
  /** Mission, may be '' — seed; screen. */
  msn: string
  /** Standalone-only shift label ('AM', 'PM', 'NIGHT', 'SHIFT') — engine (`makeStandalone`). */
  shift?: string
  /** Take-off 'HH:MM', may be '' — seed; screen. */
  to: string
  /** Land 'HH:MM', may be '' — seed; screen. */
  ld: string
  /** Typed SC in-time 'HH:MM' — screen (board SC B-box editor). */
  br?: string
  /** A typed-over AREA strip for the whole formation (the derived per-seat areas otherwise) — screen (ui/textedit.ts). */
  area?: string
  /** A typed-over area-TIME strip for the whole formation ('0800-0900' form) — screen (ui/textedit.ts). */
  atime?: string
  /** The seat pairs — seed; engine. */
  aircraft: AircraftSeat[]
  /** Whole-line cancel — engine (cxCommit / rollCx). */
  cx?: boolean
  /** Cancel reason — engine. */
  cxr?: string
  /** Stable row id — engine (rowids.ts); minted before the first baseline, never printed, optional only in a seed literal. */
  rid?: string
}

/** A wave (day.waves[i]). */
export type Wave = {
  /** Display label — seed; engine (`makeStandalone`). */
  label: string
  /** Night wave — seed; engine. */
  night: boolean
  /** In-time lines, may be [] — seed; screen. */
  intimes: string[]
  /** Traffic lines, may be [] — seed; screen. */
  traffic: string[]
  /** The Goes — seed; engine. */
  formations: Formation[]
  /** SC / AVALON / BB wave — engine (`makeStandalone`). */
  standalone?: boolean
  /** Which standalone kind, only on standalone waves — engine. */
  kind?: SaKind
  /** Whole wave exempt from cross-checks (AVALON / BB) — engine. */
  noconf?: boolean
  /** Stable row id — engine (rowids.ts); minted before the first baseline, never printed, optional only in a seed literal. */
  rid?: string
}

/** A sim row (day.sims.amt[i] / day.sims.oft[i]); crewed as {p,w}, or {pax}, or {who}. */
export type SimRow = RowFlags & {
  /** Row label — seed; screen. */
  label: string
  /** Start 'HHMM', may be '' — seed; screen. */
  str: string
  /** End 'HHMM', may be '' — seed; screen. */
  end: string
  /** Remarks — seed; screen. */
  rmks?: string
  /** FCP id (two-seat form) — seed; screen. */
  p?: string
  /** RCP id (two-seat form) — seed; screen. */
  w?: string
  /** Any-size crew list of ids (box form) — seed; screen. */
  pax?: string[]
  /** Free text ('EXT SQN') or an id — seed; screen. */
  who?: string
  /** Overflow crew — engine (slots.ts). */
  more?: string[]
  /** Stable row id — engine (rowids.ts); minted before the first baseline, never printed, optional only in a seed literal. */
  rid?: string
}

/** A duty row (block.rows[i]). */
export type DutyRow = RowFlags & {
  /** Desk / role name, may be '' — seed; engine (`blockFromTpl`). */
  role: string
  /** The crewed PEOPLE id, may be '' — seed; screen. */
  id: string
  /** Start 'HHMM', may be '' — seed; screen. */
  str: string
  /** End 'HHMM', may be '' — seed; screen. */
  end: string
  /** Overflow crew — engine (slots.ts). */
  more?: string[]
  /** Stable row id — engine (rowids.ts); minted before the first baseline, never printed, optional only in a seed literal. */
  rid?: string
}

/** A duty block (day.dutywaves[i]). */
export type DutyBlock = {
  /** Block label — seed; engine (`blockFromTpl`). */
  label: string
  /** The desks — seed; engine. */
  rows: DutyRow[]
  /** Which standalone wave this desk serves — engine (`blockFromTpl`). */
  sa?: SaKind
  /** Mirrors the wave's cross-check exemption — engine. */
  noconf?: boolean
  /** Stable row id — engine (rowids.ts); minted before the first baseline, never printed, optional only in a seed literal. */
  rid?: string
}

/** One day of the loaded week. */
export type Day = {
  /** 'Monday'..'Sunday' — seed. */
  dow: string
  /** Display date 'Jul 13' — seed; engine re-labels on stash restore. */
  dt: string
  /** Flying-tally badge fallback text, e.g. '4 X 4 X 0' — seed. */
  wc: string
  /** Calendar today marker — seed; engine re-stamps on restore/draft. */
  today?: boolean
  /** Overall Notes lines, may be [] — seed; screen. */
  notes: string[]
  /** Common Programme — seed; screen. */
  allhands: AllhandsRow[]
  /** Flying and standalone waves — seed; screen. */
  waves: Wave[]
  /** Sim rows under the two fixed boxes — seed; screen. */
  sims: { amt: SimRow[]; oft: SimRow[] }
  /** Duty blocks — seed; screen. */
  dutywaves: DutyBlock[]
  /** Ground Programme — seed; engine (acceptInput); screen. */
  ground: GroundRow[]
  /** Sim section note — screen (board note editor). */
  simnotes?: string
  /** Programme section note — screen. */
  prognotes?: string
  /** Duty section note — screen. */
  dutynotes?: string
  /** Ground section note — screen. */
  grndnotes?: string
  /** Section display order override; absent = house default — engine (order.ts). */
  secOrder?: string[]
  /** Ground list frozen to hand order — engine (reorder.ts). */
  gman?: boolean
}

/* ---------------------------------------------------------------------------
   The publish book — SCHED, src/engine/publish.ts
   --------------------------------------------------------------------------- */

/** The four sign-off names for a day; each is a PEOPLE id ('' unsigned) on SCHED.sign, a callsign on an issued AL. */
export type SignSet = { cur: string; sked: string; plan: string; appr: string }

/** A frozen day plus the AL marks it carried — engine (`daySnap`). */
export type DaySnapshot = {
  /** Deep copy of the day. */
  d: Day
  /** Slot key → per-day sequence, for this day only. */
  c: Record<string, number>
  /** The filing fingerprint frozen at issue (inputId → 'u'|'g'|'r'|'') — Phase 2 (§3 axis 4). */
  fil?: Record<string, string>
  /** The Original snapshot (SCHED.orig[di]) carries its own verId (`iso#0`); AL snapshots do not (the record does). */
  id?: string
}

/** A per-day alternate draft blob — engine (drafts.ts). */
export type DayDraft = { id: string; name: string; d: Day }

/** One canonical delta entry in an AL's frozen `diff` — engine (canonical.ts `DeltaEntry`). */
export type AlDiffEntry = { addr: string; kind: 'add' | 'delete' | 'change' | 'move' | 'input'; from?: any; to?: any }

/** One published amendment (SCHED.als[i]) — engine (`alIssue`). Phase 2: SINGLE-DAY,
 *  identified by its immutable verId; `diff` replaces the old `keys` list. */
export type AlRecord = {
  /** Immutable version id — `verId(iso, seq)` (`iso#seq`), e.g. `2026-07-13#1`. */
  id: string
  /** Day index (0..6) — one record = one day. */
  di: number
  /** The day's full ISO date (`yyyy-mm-dd`, incl the year). */
  iso: string
  /** Per-day display sequence: 1 = AL1, 2 = AL2 … */
  seq: number
  /** The frozen day document + issued marks slice + filing fingerprint. */
  snap: DaySnapshot
  /** The canonical delta vs the prior issued version, frozen at issue (replaces `keys`). */
  diff: AlDiffEntry[]
  /** Signatures at issue, by day index (callsigns) — Phase 3 binds them. */
  sign: Record<number, SignSet>
}
export type Amendment = AlRecord

/** Everything about the loaded week's publication state; all maps keyed by day index 0..6 except the slot-key maps. */
export type Sched = {
  /** Amendment counter — engine. */
  al: number
  /** Slot keys edited since the last publish — engine (`markEdit`). */
  pending: Record<string, 1>
  /** Slot key → the per-day sequence it was published under (drives the colour) — engine. */
  changes: Record<string, number>
  /** Structural adds not yet issued — engine (`markStructuralAdd`). */
  added: Record<string, 1>
  /** Every published amendment, newest last — engine. */
  als: AlRecord[]
  /** Days published (approved) individually — engine (`setDayApproved`). */
  dayOK: Record<number, 1>
  /** Sign-off names per day — engine (`signOf`); screen picks them. */
  sign: Record<number, SignSet>
  /** The day as first published (seq 0), carrying its own verId — engine. */
  orig: Record<number, DaySnapshot>
  /** Which version each day currently shows — a verId (`iso#seq`; Original = `iso#0`) — engine. */
  cur: Record<number, string>
  /** Per-day alternate drafts — engine (drafts.ts); absent until first used. */
  drafts?: Record<number, DayDraft[]>
  /** The live draft id per day — engine (drafts.ts). */
  curDraft?: Record<number, string>
  /** Addressing-by-rid book-format version — engine (rowids.ts `RID_BOOK_VERSION`). A live SCHED always carries it; a persisted snapshot WITHOUT it (`SchedFields.v` absent) is foundation-era and is migrated once at load. */
  ridV: number
  /** Phase-2 amendment-record format version — engine (`AMBOOK_VERSION`). A live SCHED always carries it; a persisted book WITHOUT it that still holds publication content is a PRE-Phase-2 book (`amFormatOf` → 'unsupported', read-only). */
  amV?: number
}

/* ---------------------------------------------------------------------------
   The planning layer — src/state/plan.ts
   --------------------------------------------------------------------------- */

/** A free-text note dropped on a calendar day; `kind` absent means note. */
export type PlanNote = {
  /** Minted 'pp' + n — screen. */
  id: string
  /** ISO 'yyyy-mm-dd' — screen. */
  date: string
  kind?: 'note'
  /** The note text — screen. */
  text: string
}
/** A pucks row on a calendar day. */
export type PuckRow = {
  /** Minted 'pp' + n — screen. */
  id: string
  /** ISO 'yyyy-mm-dd' — screen. */
  date: string
  kind: 'pucks'
  /** PEOPLE ids, '' for a gap — screen. */
  ids: string[]
}
export type PlanPuck = PlanNote | PuckRow

/** ISO 'yyyy-mm-dd' → the day's free-text title — screen. */
export type DayRmk = Record<string, string>

/* ---------------------------------------------------------------------------
   The week snapshots — histSnap() (state/history.ts) and weekStashSnap()
   (state/store.ts). Both are JSON strings of these objects.
   --------------------------------------------------------------------------- */

/** The SCHED fields under their short snapshot names — `schedFields()` (history.ts). `dr`/`cd` are absent until drafts are first used. */
export type SchedFields = {
  c: Sched['changes']
  p: Sched['pending']
  ad: Sched['added']
  a: Sched['als']
  al: Sched['al']
  ok: Sched['dayOK']
  sg: Sched['sign']
  o: Sched['orig']
  cv: Sched['cur']
  dr?: Sched['drafts']
  cd?: Sched['curDraft']
  /** Book-format version — absent on a foundation-era snapshot, which loads through migrateLegacyIds. */
  v?: Sched['ridV']
  /** Phase-2 amendment-record format version — absent on a PRE-Phase-2 snapshot (`amFormatOf` → 'unsupported'). */
  am?: Sched['amV']
}

/** The whole-state undo record — `histSnap()`. */
export type WeekSnapshot = SchedFields & {
  /** = DAYS. */
  d: Day[]
  /** = INPUTS (global, every week's). */
  i: Input[]
  /** Muted warning ids, from the WARNOFF set. */
  wo: string[]
  /** = PLANPUCKS. */
  pp: PlanPuck[]
  /** = DAYRMK. */
  dm: DayRmk
}

/** The per-week stash record — `weekStashSnap()`: no inputs or plan layer (those are global), plus the removed-input keys. */
export type WeekStashSnapshot = SchedFields & {
  /** = DAYS. */
  d: Day[]
  /** Muted warning ids. */
  wo: string[]
  /** Content keys (`inpKey`) of inputs a scheduler removed ('r') on this week, re-parked on restore. */
  un: string[]
}

/* ---------------------------------------------------------------------------
   Settings — the sqn142_* keys (docs/data-schema.md). Each key stores null
   while the squadron is on the shipped standard.
   --------------------------------------------------------------------------- */

/** The editable rule thresholds (rules.ts VCONF). schema.test.ts pins this list against VCONF. */
export const VCONF_KEYS = [
  'briefLead', 'dur', 'step', 'dekit', 'minTurn', 'tightTurn', 'crewRest', 'debrief', 'reportLead',
  'longDay', 'epBrief', 'simDebrief', 'amtDebrief', 'openEnd', 'maxRun', 'inputLead',
  'scDayFrom', 'scDayTo', 'simLen', 'oilFullMin',
] as const
export type VConfKey = (typeof VCONF_KEYS)[number]

/** The event kinds an SC shift may clash with (rules.ts SHIFT_HARD). Pinned by schema.test.ts. */
export const SHIFT_KINDS = ['fly', 'sim', 'duty', 'shift', 'ground', 'prog'] as const
export type ShiftKind = (typeof SHIFT_KINDS)[number]

/** The board's section keys in canonical order (order.ts SECTIONS). Pinned by schema.test.ts. */
export const SECTION_KEYS = ['notes', 'prog', 'waves', 'duty', 'sims', 'ground', 'inputs', 'avail', 'sans', 'unav'] as const
export type SectionKey = (typeof SECTION_KEYS)[number]

/** Overrides only — thresholds off the standard, and which kinds hard-clash a shift — engine (`rulesSave`). */
export type RuleOverrides = {
  v: Partial<Record<VConfKey, number>>
  s: Partial<Record<ShiftKind, boolean>>
}
/** The stores list, [key, label] pairs; keys are ^[a-z0-9]+$ — engine (stores.ts). */
export type StoresCfg = [string, string][]
/** The cancel-reason list — engine (cxreasons.ts). */
export type CxReasons = string[]
/** The house section order, a permutation of SECTION_KEYS — engine (order.ts). */
export type SecDefault = SectionKey[]
/** The house wave order, a subset of WaveKind in order; [] = unset — engine (reorder.ts). */
export type WaveDefault = WaveKind[]
/** Hidden wave-template ids / built-in keys — engine (wavetpl.ts). */
export type WaveHide = string[]
/** The look-ahead window as STORED (`lookaheadSave`): weeks, to-Sunday. In memory it is `Lookahead`. */
export type LookaheadStored = { w: number; s: boolean }

/** Every settings key and the record it stores (before the "null = standard" rule). */
export type SettingsRecord = {
  daytpl: DayTpl[]
  wavetpl: WaveTpl[]
  wavehide: WaveHide
  wavedefault: WaveDefault
  dutytpl: DutyTpl[]
  cxreasons: CxReasons
  lookahead: LookaheadStored
  secdefault: SecDefault
  stores: StoresCfg
  qualcols: QualCol[]
  rules: RuleOverrides
}
export type SettingsKey = keyof SettingsRecord
/** What the store actually holds under a key: the record, or null for "on the standard". */
export type SettingsValue<K extends SettingsKey> = SettingsRecord[K] | null
