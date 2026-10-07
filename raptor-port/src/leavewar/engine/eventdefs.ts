// The squadron's EVENT TYPES — the small library that gives a day-event word a
// meaning (owner, Aug 26).
//
// An event on a day is open text: a scheduler types "PH", "SC", "No Leave",
// "Range closure" — anything. This library is what turns some of those words
// into a CLASSIFICATION the sheet can colour by:
//
//   off  — a public holiday. The whole day column reads light green, and
//          work on it earns OIL (sync.ts isNonWorkingISO).
//   free — an Off day GIVEN by management for everyone (owner, 2 Sep 26:
//          "off is never credited to individuals, it is only declared OFF
//          to a period or a day … given by the management for free"). The
//          column reads light grey. Work on it earns NOTHING — only a
//          weekend or a PH does. This replaced the old `OFF` leave code.
//   nolv — leave is discouraged that day. The column reads orange. It never
//          blocks a bid — urgent leave still goes through; the colour is a
//          heads-up, not a gate.
//   work — a working commitment (SC and the like). The word itself reads red;
//          the column colour is left alone.
//
// The classification is INVISIBLE in the cell — typing "PH" shows "PH", never
// "PH (off)". The kind lives here and surfaces only as colour. This is also
// where a future manning rule will read "is this an off day" from, which is
// why it is structured state and not a colour baked into the text.
//
// Squadron-wide config, not per-war (a public holiday is a holiday in every
// war), so it lives in the store's top-level state beside `requirements`, not
// on a Period. The store owns persistence and the admin gate; this module is
// the pure vocabulary — the seed, the lookup, the untrusted-load reader, and
// the small edit helpers, each returning a NEW array or an error sentence so
// the store can stay a thin admin-checked wrapper.

import type { DayInfo } from './period'
import type { EventBand } from './period'
import { isWeekend } from './period'
import { derivedShort, normShort, SHORT_RULE } from './eventshort'
export { derivedShort, normShort, SHORT_RULE } from './eventshort'

export type EventKind = 'off' | 'free' | 'nolv' | 'work'

export interface EventDef {
  /** The word as typed on a day, e.g. `PH`. Matched case- and spacing-folded
   *  (see `defKey`), so `ph`, `PH` and ` PH ` are one type. */
  name: string
  kind: EventKind
  /** What the grid prints for an event of this name — one to three letters or digits (engine/eventshort.ts; owner
   *  D645: every preset carries its own). Absent on a library stored before short forms, and on a preset whose box was
   *  left empty: its events then print the form derived from the name (`shortOf`). */
  short?: string
}

export const EVENT_KINDS: readonly EventKind[] = ['off', 'free', 'nolv', 'work']

export const MAX_EVENTDEFS = 40, MAX_DEFNAME = 24

/* The four seeded types, in the order the sheet lists them: the public
   holiday, the management Off day (2 Sep 26), the no-leave day, then the
   working commitment. A squadron edits this list; these are only the
   starting point. */
export const EVENTDEF_STD: readonly EventDef[] = Object.freeze([
  { name: 'PH', kind: 'off', short: 'PH' },
  { name: 'Off day', kind: 'free', short: 'OFF' },
  { name: 'No Leave', kind: 'nolv', short: 'NL' },
  { name: 'SC', kind: 'work', short: 'SC' },
] as EventDef[])

export function seedEventDefs(): EventDef[] {
  return EVENTDEF_STD.map(d => ({ ...d }))
}

/** The fold two words match on: trimmed, inner runs of whitespace collapsed to
 *  one space, lower-cased. So `No  Leave` and `no leave` are the same type,
 *  which is what a human typing the word twice would expect. */
export function defKey(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase()
}

/** The kind of a typed event word, or `null` when no type matches (which is
 *  ordinary open text, and reads with no colour). */
export function classifyEvent(defs: EventDef[], text: string): EventKind | null {
  const k = defKey(text)
  if (!k) return null
  const hit = defs.find(d => defKey(d.name) === k)
  return hit ? hit.kind : null
}

/** WHAT THE GRID PRINTS for an event (the build plan §3.12) — the one answer every screen asks: the event's OWN short
 *  form; else the short form of the preset whose NAME matches its text (the same fold `classifyEvent` matches a kind
 *  on); else one derived from the text. A short form that breaks the rule is passed over, never shown. So an event
 *  saved before short forms existed prints short at once, with nothing converted (D56) — "No Leave" typed last month
 *  prints NL. An OLD event whose name holds no letter or digit prints a dot (a new one cannot be saved without a short
 *  form typed — the Event sheet asks). '' for no event. */
export function shortOf(defs: readonly EventDef[], text: string, short?: string | null): string {
  const k = defKey(text ?? '')
  if (!k) return ''
  const own = normShort(short)
  if (own) return own
  const preset = defs.find(d => defKey(d.name) === k)
  return (preset && normShort(preset.short)) || derivedShort(text) || '•'
}

/** The colour a whole day COLUMN takes, from every event on it — both event
 *  lines and any band covering the date. `off` wins over `free` wins over
 *  `nolv` (a holiday is more than a given Off day, which is more than a
 *  discouraged day — and a PH on a declared Off day still earns OIL);
 *  `work` never colours the column, only its own word. `null` means no
 *  colour. */
export function columnKindFor(defs: EventDef[], day: DayInfo, bands: EventBand[]): EventKind | null {
  // Every event row this day carries, not just the first two — an admin can
  // add rows now (18 Aug 26), and a tag on any of them tints the column.
  // Each event reads its own INSTANCE tag first (owner, 18 Aug 26 — a tag
  // saved on the event itself, not minted into the library), falling back to
  // the library word match; an untagged non-library word stays colourless.
  const kinds: (EventKind | null)[] = day.events.map(
    (t, i) => (t ? (day.eventKinds?.[i] ?? classifyEvent(defs, t)) : null),
  )
  for (const b of bands) {
    if (b.from <= day.date && day.date <= b.to) kinds.push(b.kind ?? classifyEvent(defs, b.text))
  }
  let sawFree = false, sawNolv = false
  for (const k of kinds) {
    if (k === 'off') return 'off'
    if (k === 'free') sawFree = true
    else if (k === 'nolv') sawNolv = true
  }
  return sawFree ? 'free' : sawNolv ? 'nolv' : null
}

/** THE HOLIDAY ON A DAY, WITH ITS NAME — what the calendars and the Holidays list show of it (the build plan
 *  docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.1, §3.4; owner D627, D631). A public holiday
 *  (`off`) or a management Off day (`free`); null for anything else — No Leave and a working event are not holidays.
 *
 *  It reads the KIND exactly as `columnKindFor` does — each event's own tag first, else its word's type in the
 *  library; a public holiday wins over an Off day — so the tag on a calendar date can never disagree with the column's
 *  colour on the Leave War. The name is the text of the first event of the winning kind, the day's own lines before
 *  any band. A day carrying only the seeded holiday flag (`ph`, no event) is a public holiday named "PH" — the same
 *  day `isNonWorkingDay` already counts as one. `line` and `band` say where the record is, for the list's writers. */
export interface HolidayAt {
  kind: 'off' | 'free'; name: string; line: number | null; band: EventBand | null
  /** the event's OWN short form, null where it has none — a reader asks `shortOf(defs, name, short)` for what prints */
  short: string | null
}
export function holidayAt(defs: readonly EventDef[], day: DayInfo, bands: readonly EventBand[]): HolidayAt | null {
  let free: HolidayAt | null = null
  for (let i = 0; i < day.events.length; i++) {
    const t = day.events[i]
    if (!t) continue
    const k = day.eventKinds?.[i] ?? classifyEvent(defs as EventDef[], t)
    if (k === 'off') return { kind: 'off', name: t, line: i, band: null, short: normShort(day.eventShorts?.[i]) }
    if (k === 'free' && !free) free = { kind: 'free', name: t, line: i, band: null, short: normShort(day.eventShorts?.[i]) }
  }
  for (const b of bands) {
    if (b.from > day.date || day.date > b.to) continue
    const k = b.kind ?? classifyEvent(defs as EventDef[], b.text)
    if (k === 'off') return { kind: 'off', name: b.text, line: b.line, band: b, short: normShort(b.short) }
    if (k === 'free' && !free) free = { kind: 'free', name: b.text, line: b.line, band: b, short: normShort(b.short) }
  }
  if (day.ph) return { kind: 'off', name: 'PH', line: null, band: null, short: null }
  return free
}

/**
 * Whether Leave War calls this date NON-WORKING: a weekend, or a public
 * holiday. A holiday is whatever the war holding the date says — its `ph`
 * flag, or an event word on it whose type is tagged `off` (the admin's own
 * input path for holidays, seeded as `PH`). A date no war holds (`day`
 * undefined) can still be a weekend, but never a holiday: there was nowhere
 * to file one. The management Off day (`free`) is NOT non-working here —
 * work on it earns nothing and leave on it still charges.
 *
 * ONE body for every reader (3 Sep 26): the OIL credit pass and the input
 * ask-flow (`sync.ts:isNonWorkingISO`) and the leave-charging rule
 * (`charge.ts`) all call this, so "is this day a holiday" cannot fork.
 */
export function isNonWorkingDay(date: string, day: DayInfo | undefined, defs: readonly EventDef[], bands: readonly EventBand[]): boolean {
  if (isWeekend(date)) return true
  if (!day) return false
  if (day.ph) return true
  return columnKindFor(defs as EventDef[], day, bands as EventBand[]) === 'off'
}

/** Read an untrusted stored list — hand-editable storage, so every field is
 *  checked and bad rows are dropped. Duplicates (by fold) collapse to the
 *  first; the list caps at `MAX_EVENTDEFS`. Returns `null` when the blob is not
 *  an array at all, so the caller falls back to the seed; an array that merely
 *  holds junk rows returns an empty (or partial) list rather than the seed,
 *  which is the same "what survived validation is the truth" rule the grid and
 *  stores loaders use. */
export function readEventDefs(x: unknown): EventDef[] | null {
  if (!Array.isArray(x)) return null
  const out: EventDef[] = []
  const seen = new Set<string>()
  for (const row of x) {
    if (out.length >= MAX_EVENTDEFS) break
    if (!row || typeof row !== 'object') continue
    const { name, kind, short } = row as Record<string, unknown>
    if (typeof name !== 'string' || typeof kind !== 'string') continue
    if (!EVENT_KINDS.includes(kind as EventKind)) continue
    const clean = name.trim()
    if (!clean || clean.length > MAX_DEFNAME) continue
    const key = defKey(clean)
    if (seen.has(key)) continue
    seen.add(key)
    /* its short form through the one rule: a bad one is dropped and the preset kept — its events print the derived form */
    const sh = normShort(short)
    out.push({ name: clean, kind: kind as EventKind, ...(sh ? { short: sh } : {}) })
  }
  return out
}

/* The edit helpers. Each takes the current list and returns a NEW list, or an
   error sentence for the sheet to show — none mutates in place, so the store
   can treat the result as it treats any other derived state. */

export function addEventDef(defs: EventDef[], name: string, kind: EventKind, short?: string): EventDef[] | string {
  const clean = name.trim()
  if (!clean) return 'An event type needs a name'
  if (clean.length > MAX_DEFNAME) return `An event type name is at most ${MAX_DEFNAME} characters`
  if (defs.length >= MAX_EVENTDEFS) return `The list holds at most ${MAX_EVENTDEFS} event types`
  const key = defKey(clean)
  if (defs.some(d => defKey(d.name) === key)) return `${clean} is already an event type`
  /* an empty box is "none typed" — its events print the form derived from the name; anything else must be a short form */
  const typed = short !== undefined && short.trim() !== ''
  const sh = typed ? normShort(short) : null
  if (typed && !sh) return SHORT_RULE
  return [...defs, { name: clean, kind, ...(sh ? { short: sh } : {}) }]
}

export function updateEventDef(
  defs: EventDef[],
  index: number,
  patch: { name?: string; kind?: EventKind; short?: string },
): EventDef[] | string {
  if (index < 0 || index >= defs.length) return 'That event type is gone'
  const cur = defs[index]!
  const name = patch.name === undefined ? cur.name : patch.name.trim()
  const kind = patch.kind ?? cur.kind
  if (!name) return 'An event type needs a name'
  if (name.length > MAX_DEFNAME) return `An event type name is at most ${MAX_DEFNAME} characters`
  const key = defKey(name)
  if (defs.some((d, i) => i !== index && defKey(d.name) === key)) return `${name} is already an event type`
  /* AN EDIT KEEPS WHAT IT DID NOT NAME (the plan §3.12, both readers' finding D): this rebuilt `{ name, kind }`, and a
     rename would have erased the preset's short form. Named and empty = cleared; named and not a short form = refused. */
  let short = normShort(cur.short)
  if (patch.short !== undefined) {
    short = patch.short.trim() === '' ? null : normShort(patch.short)
    if (patch.short.trim() !== '' && !short) return SHORT_RULE
  }
  return defs.map((d, i) => (i === index ? { name, kind, ...(short ? { short } : {}) } : d))
}

export function removeEventDef(defs: EventDef[], index: number): EventDef[] {
  if (index < 0 || index >= defs.length) return defs
  return defs.filter((_, i) => i !== index)
}
