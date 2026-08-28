// The day-code catalogue. Every code carries four facts so that availability,
// balances and bidding all read from one place rather than each re-deciding
// what a piece of text in a cell means.
//
// The spreadsheet this replaces had no such table: its availability counts
// tested for an EMPTY cell, so a half day removed a whole person and so did
// SC duty, which is someone at work. `removes` and `duty` exist to end both
// of those.
//
// A cell is a LEAVE TYPE plus a PORTION, or a NON-LEAVE MARKER. `AM` and `PM`
// were never codes of their own — treating them as if they were is exactly
// the bug this rework fixes: a portion is something ANY leave type can
// carry, not a leave type in itself. The owner's own notation says where the
// portion goes: `OIL` is a whole day, `*OIL` is the morning, `OIL*` is the
// afternoon. The asterisk sits where the time sits, and that notation — not
// an abbreviation like the old `HO` — is what is stored, typed and read back
// from a CSV.

export type CounterName = 'annual' | 'oil' | 'ccl' | 'fcl' | 'pl' | 'el'

export type Portion = 'full' | 'am' | 'pm'

/** A parsed cell: what the person is doing, and how much of the day it takes. */
export interface Cell {
  type: string
  portion: Portion
}

export interface LeaveType {
  type: string
  label: string
  /**
   * The counter this draws down, or `null` for leave that costs nothing.
   *
   * `OFF` is the only free one (owner, 10 Aug 26): "free leave that doesn't
   * consume any leave, but it will count that manpower as gone too". It is
   * still LEAVE — the person asks for it and management answers, because it
   * takes a man out of the manning picture exactly as annual leave does — so
   * it is here rather than among the non-leave markers, which nobody bids
   * for. What it is not is an entitlement, so it has no balance to draw.
   */
  counter: CounterName | null
}

// The seven leave types. All are biddable and all spend a counter — that is
// what makes them leave rather than a marker. Exported so the bid picker can
// list them without duplicating this table.
//
// `FCL` and `PCL` were BOTH here until 10 Aug 26, because this author could
// not tell them apart and guessed there were two. There is one. The owner
// settled it that afternoon: **there is no parentcare leave; the code is
// FCL, family care leave.** `PCL` was the invention and is gone; `FCL` is
// back with the expansion it never had. `PL` is unrelated — paternity leave,
// which is a real and separate entitlement.
//
// So the earlier note here, that FCL "was a code nobody could explain", had
// it precisely backwards: FCL is the one that could be explained.
export const LEAVE_TYPES: LeaveType[] = [
  { type: 'LL', label: 'local leave', counter: 'annual' },
  { type: 'OL', label: 'overseas leave', counter: 'annual' },
  { type: 'OIL', label: 'off in lieu', counter: 'oil' },
  { type: 'CCL', label: 'child care leave', counter: 'ccl' },
  { type: 'FCL', label: 'family care leave', counter: 'fcl' },
  { type: 'PL', label: 'paternity leave', counter: 'pl' },
  { type: 'EL', label: 'embarkation leave', counter: 'el' },
  { type: 'OFF', label: 'off — free leave, no entitlement spent', counter: null },
]

const LEAVE_TYPE_BY_CODE: Record<string, LeaveType> = Object.fromEntries(
  LEAVE_TYPES.map(t => [t.type, t]),
)

// The medical markers. ATT C, HL and OML replaced the single `M` marker
// (owner, Aug 26 — "remove M, it's MED CON, which is ATT C, HL AND OML"); they
// are the three things that make up a person's MED USED tally, the days-consumed
// figure the counter column shows. `ATTB` joined 17 Aug 26 ("for the leave war
// grids u can indicate, B (att b), C (att c), OML, HL") — it is on the grid but
// deliberately NOT in MED USED, because the owner's sum names the other three
// only. Medical is assigned, not applied for, so like every other marker none
// is biddable and none carries a balance — only OML was ever floated as an
// entitlement, and the owner settled it as a consumed figure too ("just change
// to OML CON, not OML BAL"). `ATTC`/`ATTB` are stored spaceless so `parseCell`'s
// trim/upper round-trips them cleanly; the display label carries the space the
// owner writes, and the GRID shows the one-letter short forms below.
//
// Since 17 Aug 26 medical markers TAKE PORTIONS (`*OML` a morning, `HL*` an
// afternoon) — the owner's medical inputs come in halves ("count half day as
// AM or PM"), which retired the older rule that only leave could carry an
// asterisk. Courses, overseas duty and SC duty still cannot.
const MEDICAL_LABELS: Record<string, string> = {
  ATTB: 'medical — ATT B, no flying but may still work',
  ATTC: 'medical — ATT C',
  HL: 'medical — hospitalisation leave',
  OML: 'medical — outpatient medical leave',
}

// The owner's own grid shorthand: a cell reads `B` / `C`, stored canonically
// as ATTB/ATTC. The alias is accepted on the way in (a CSV typed the short
// way still parses) and the short form is what `displayCell` shows.
const MEDICAL_ALIAS: Record<string, string> = { B: 'ATTB', C: 'ATTC' }
const MEDICAL_SHORT: Record<string, string> = { ATTB: 'B', ATTC: 'C' }

/** The four markers in the owner's own order — "B (att b), C (att c), OML,
 *  HL" — for the admin's grid picker. Nobody bids these; the picker shows
 *  them to management only. Frozen like every exported list here. */
export const MEDICAL_TYPES: readonly { type: string; label: string }[] = Object.freeze(
  ['ATTB', 'ATTC', 'OML', 'HL'].map(type => ({ type, label: MEDICAL_LABELS[type] })),
)

// Non-leave markers beyond medical: remove the whole day, spend nothing,
// never portioned — they are not bid for, so there is no counter to draw.
const NON_LEAVE_LABELS: Record<string, string> = {
  CSE: 'course',
  OD: 'overseas duty',
}

// SC duty: at work, but off the flying programme. This is a different axis
// from leave entirely — the codes arrive from Raptor's schedule rather than
// being typed here — so they stay literal two-letter markers rather than
// being folded into the type-plus-portion model. They never carry a
// portion; `earnsOil` is the only place "half" appears for these two.
const SC_DUTY_LABELS: Record<string, string> = {
  FS: 'full day SC duty',
  HS: 'half day SC duty',
}
const SC_DUTY_EARNS: Record<string, 0.5 | 1> = { FS: 1, HS: 0.5 }

/** full costs a whole day, am/pm cost half — the only two amounts a cell ever removes. */
export function portionAmount(portion: Portion): number {
  return portion === 'full' ? 1 : 0.5
}

/**
 * Parse the stored notation into a `Cell`, or `null` if it is not one.
 *
 * Two shapes are rejected on purpose, both because letting them through
 * would corrupt a leave balance silently instead of failing loudly on
 * screen:
 * - an asterisk on BOTH sides (`*LL*`) — the notation only ever carries one
 *   time marker, so this is not "a valid portion", it is malformed input.
 * - an asterisk on a course, overseas-duty or SC-duty marker (`CSE*`, `*FS`)
 *   — those do not come in halves in this squadron's vocabulary. Medical
 *   USED to be in this list; the owner's half-day medical inputs (17 Aug 26)
 *   moved it to the portioned side.
 */
export function parseCell(raw: string | undefined | null): Cell | null {
  if (!raw) return null
  const trimmed = raw.trim().toUpperCase()
  if (!trimmed) return null

  const leadingStar = trimmed.startsWith('*')
  const trailingStar = trimmed.endsWith('*')
  if (leadingStar && trailingStar) return null

  const portion: Portion = leadingStar ? 'am' : trailingStar ? 'pm' : 'full'
  const typed = trimmed.slice(leadingStar ? 1 : 0, trailingStar ? -1 : undefined)
  if (!typed) return null
  // Canonical before lookup, so `B`/`*C` read as the medical marker they
  // abbreviate rather than as unknown codes.
  const type = MEDICAL_ALIAS[typed] ?? typed

  if (portion !== 'full') {
    return LEAVE_TYPE_BY_CODE[type] || MEDICAL_LABELS[type] ? { type, portion } : null
  }

  const known = LEAVE_TYPE_BY_CODE[type] || MEDICAL_LABELS[type] || NON_LEAVE_LABELS[type] || SC_DUTY_LABELS[type]
  return known ? { type, portion: 'full' } : null
}

/**
 * The canonical notation for a cell — the asterisk sits where the time sits.
 *
 * Mirrors `parseCell`'s strictness rather than only its happy path: that
 * parser refuses to read `*FS` back as a portioned non-leave marker, so a
 * caller that hands `formatCell` a non-'full' portion on a non-leave type is
 * not writing a rare cell, it is holding a `Cell` that could never have come
 * from `parseCell` in the first place. Emitting `'*FS'` for it would be a
 * string that looks legitimate right up until it round-trips through
 * `parseCell` and silently vanishes to `null` — a corrupt leave balance
 * discovered nowhere near the bug that caused it. Throwing at the point the
 * bad `Cell` was formatted turns that into a stack trace instead.
 */
export function formatCell(cell: Cell): string {
  if (cell.portion !== 'full' && !LEAVE_TYPE_BY_CODE[cell.type] && !MEDICAL_LABELS[cell.type]) {
    throw new Error(`formatCell: '${cell.type}' cannot carry a portion — only leave and medical come in halves`)
  }
  if (cell.portion === 'am') return `*${cell.type}`
  if (cell.portion === 'pm') return `${cell.type}*`
  return cell.type
}

/** Whether this cell is one of the four medical markers, whatever portion it
 *  carries. The sync wire and the picker both ask; neither should re-own the
 *  list. */
export function isMedical(code: string | undefined | null): boolean {
  const cell = parseCell(code)
  return !!cell && !!MEDICAL_LABELS[cell.type]
}

/**
 * What a grid cell PRINTS. Identical to the stored notation for everything
 * except the two ATT markers, whose stored `ATTB`/`ATTC` would drown a 30px
 * column — the owner's own shorthand is a bare `B` / `C`, and the asterisk
 * keeps its side. Display only: nothing stores or parses what this returns
 * without going back through `parseCell`, which accepts the short form too.
 */
export function displayCell(raw: string): string {
  const cell = parseCell(raw)
  if (!cell) return raw
  const short = MEDICAL_SHORT[cell.type]
  if (!short) return raw
  if (cell.portion === 'am') return `*${short}`
  if (cell.portion === 'pm') return `${short}*`
  return short
}

export interface DayCode {
  code: string
  label: string
  /** How much of the day the person is unavailable for. */
  removes: 0 | 0.5 | 1
  /** Which counter this draws down, and by how much. */
  spends: { counter: CounterName; amount: number } | null
  /** OIL credited by working this day. */
  earnsOil: 0 | 0.5 | 1
  /** Whether a person bids for this. Medical, courses and duty are not bid. */
  bid: boolean
  /** At work, but off the flying programme — excluded from flying counts. */
  duty: boolean
}

// Everything below derives a `DayCode` from a parsed `Cell` rather than
// having one hand-written per row, which is what let `AM`/`PM`/`HO` sneak in
// as if they were codes of their own rather than a leave type's portion.
function dayCodeFor(cell: Cell): DayCode {
  const { type, portion } = cell

  const leave = LEAVE_TYPE_BY_CODE[type]
  if (leave) {
    const amount = portionAmount(portion)
    const suffix = portion === 'am' ? ' (morning)' : portion === 'pm' ? ' (afternoon)' : ''
    return {
      code: formatCell(cell),
      label: `${leave.label}${suffix}`,
      removes: amount as 0 | 0.5 | 1,
      // Free leave spends nothing, so it has no `spends` at all rather than a
      // zero-amount one: every counter reader tests for the absence, and a
      // zero would quietly appear in a balance's arithmetic as a real draw.
      spends: leave.counter === null ? null : { counter: leave.counter, amount },
      earnsOil: 0,
      bid: true,
      duty: false,
    }
  }

  const medicalLabel = MEDICAL_LABELS[type]
  if (medicalLabel) {
    const suffix = portion === 'am' ? ' (morning)' : portion === 'pm' ? ' (afternoon)' : ''
    return {
      code: formatCell(cell),
      label: `${medicalLabel}${suffix}`,
      // ATT B keeps the man AT WORK — Raptor's own catalogue says so
      // (`work:true`, "no flying, may still work") — so it removes nothing
      // from the manning picture here either; the other three take him out
      // for however much of the day they cover. Two apps, one meaning.
      removes: type === 'ATTB' ? 0 : (portionAmount(portion) as 0.5 | 1),
      spends: null,
      earnsOil: 0,
      bid: false,
      duty: false,
    }
  }

  const nonLeaveLabel = NON_LEAVE_LABELS[type]
  if (nonLeaveLabel) {
    return { code: type, label: nonLeaveLabel, removes: 1, spends: null, earnsOil: 0, bid: false, duty: false }
  }

  // Only FS/HS remain, guaranteed by parseCell already having rejected
  // anything else. SC duty removes nobody from flying by itself — `duty:
  // true` is what excludes them, on their own line, rather than `removes`
  // hiding them inside the leave shortfall the way the old sheet did.
  return {
    code: type,
    label: SC_DUTY_LABELS[type],
    removes: 0,
    spends: null,
    earnsOil: SC_DUTY_EARNS[type],
    bid: false,
    duty: true,
  }
}

export function codeOf(code: string | undefined | null): DayCode | undefined {
  const cell = parseCell(code)
  return cell ? dayCodeFor(cell) : undefined
}

export function isDuty(code: string | undefined | null): boolean {
  return codeOf(code)?.duty ?? false
}

// A plain-English key to the LETTERS the grid can show, grouped for the
// Legend pop-out (owner, 28 Aug 26 — "include what FS HS etc mean … things
// that reflect only on the leave war. Because it's not stated on inputs").
// Built straight from the label tables above so the legend can never name a
// code the catalogue doesn't, and never drift from what a cell parses to —
// the same one-source rule the swatch classes already follow.
//
// FS/HS lead, in their own group, because they are the ONLY codes that live
// here and are never typed on the Inputs page: they are credited
// automatically from a published weekend / public-holiday duty on the
// schedule (the OIL pass), so a reader who only knows the Inputs vocabulary
// has nowhere else to look them up. Everything else mirrors an Inputs entry
// and is here only so the grid's two-letter shorthand has a key.
export interface GlossaryRow { show: string; mean: string }
export interface GlossaryGroup { group: string; onlyHere?: boolean; rows: GlossaryRow[] }
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)
export const CODE_GLOSSARY: GlossaryGroup[] = [
  {
    group: 'Shown here only — not on the Inputs page',
    onlyHere: true,
    rows: [
      { show: 'FS', mean: cap(SC_DUTY_LABELS.FS) + ' — earns a full day off in lieu. Credited automatically from a weekend or public-holiday duty on the schedule, not typed here.' },
      { show: 'HS', mean: cap(SC_DUTY_LABELS.HS) + ' — earns half a day off in lieu, the same way.' },
    ],
  },
  {
    group: 'Medical',
    rows: MEDICAL_TYPES.map(m => ({ show: displayCell(m.type), mean: cap(m.label.replace(/^medical — /, '')) })),
  },
  {
    group: 'Leave',
    rows: LEAVE_TYPES.map(t => ({ show: t.type, mean: cap(t.label) })),
  },
  {
    group: 'Other duty',
    rows: Object.entries(NON_LEAVE_LABELS).map(([code, label]) => ({ show: code, mean: cap(label) })),
  },
]
