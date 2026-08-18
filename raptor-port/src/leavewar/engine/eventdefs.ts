// The squadron's EVENT TYPES — the small library that gives a day-event word a
// meaning (owner, Aug 26).
//
// An event on a day is open text: a scheduler types "PH", "SC", "No Leave",
// "Range closure" — anything. This library is what turns some of those words
// into a CLASSIFICATION the sheet can colour by:
//
//   off  — an off day (a public holiday). The whole day column reads light
//          green.
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

export type EventKind = 'off' | 'nolv' | 'work'

export interface EventDef {
  /** The word as typed on a day, e.g. `PH`. Matched case- and spacing-folded
   *  (see `defKey`), so `ph`, `PH` and ` PH ` are one type. */
  name: string
  kind: EventKind
}

export const EVENT_KINDS: readonly EventKind[] = ['off', 'nolv', 'work']

export const MAX_EVENTDEFS = 40, MAX_DEFNAME = 24

/* The three the owner named, in the order the sheet lists them: the off day,
   the no-leave day, then the working commitment. A squadron edits this list;
   these are only the starting point. */
export const EVENTDEF_STD: readonly EventDef[] = Object.freeze([
  { name: 'PH', kind: 'off' },
  { name: 'No Leave', kind: 'nolv' },
  { name: 'SC', kind: 'work' },
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

/** The colour a whole day COLUMN takes, from every event on it — both event
 *  lines and any band covering the date. `off` wins over `nolv` (a holiday is
 *  more than a discouraged day); `work` never colours the column, only its own
 *  word. `null` means no colour. */
export function columnKindFor(defs: EventDef[], day: DayInfo, bands: EventBand[]): EventKind | null {
  // Every event row this day carries, not just the first two — an admin can
  // add rows now (18 Aug 26), and a tag on any of them tints the column.
  const texts = [...day.events]
  for (const b of bands) if (b.from <= day.date && day.date <= b.to) texts.push(b.text)
  let sawNolv = false
  for (const t of texts) {
    const k = classifyEvent(defs, t)
    if (k === 'off') return 'off'
    if (k === 'nolv') sawNolv = true
  }
  return sawNolv ? 'nolv' : null
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
    const { name, kind } = row as Record<string, unknown>
    if (typeof name !== 'string' || typeof kind !== 'string') continue
    if (!EVENT_KINDS.includes(kind as EventKind)) continue
    const clean = name.trim()
    if (!clean || clean.length > MAX_DEFNAME) continue
    const key = defKey(clean)
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ name: clean, kind: kind as EventKind })
  }
  return out
}

/* The edit helpers. Each takes the current list and returns a NEW list, or an
   error sentence for the sheet to show — none mutates in place, so the store
   can treat the result as it treats any other derived state. */

export function addEventDef(defs: EventDef[], name: string, kind: EventKind): EventDef[] | string {
  const clean = name.trim()
  if (!clean) return 'An event type needs a name'
  if (clean.length > MAX_DEFNAME) return `An event type name is at most ${MAX_DEFNAME} characters`
  if (defs.length >= MAX_EVENTDEFS) return `The list holds at most ${MAX_EVENTDEFS} event types`
  const key = defKey(clean)
  if (defs.some(d => defKey(d.name) === key)) return `${clean} is already an event type`
  return [...defs, { name: clean, kind }]
}

export function updateEventDef(
  defs: EventDef[],
  index: number,
  patch: { name?: string; kind?: EventKind },
): EventDef[] | string {
  if (index < 0 || index >= defs.length) return 'That event type is gone'
  const cur = defs[index]!
  const name = patch.name === undefined ? cur.name : patch.name.trim()
  const kind = patch.kind ?? cur.kind
  if (!name) return 'An event type needs a name'
  if (name.length > MAX_DEFNAME) return `An event type name is at most ${MAX_DEFNAME} characters`
  const key = defKey(name)
  if (defs.some((d, i) => i !== index && defKey(d.name) === key)) return `${name} is already an event type`
  return defs.map((d, i) => (i === index ? { name, kind } : d))
}

export function removeEventDef(defs: EventDef[], index: number): EventDef[] {
  if (index < 0 || index >= defs.length) return defs
  return defs.filter((_, i) => i !== index)
}
