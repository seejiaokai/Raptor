// THE MANNING BLOCK'S ONE ORDER — the squadron's counters AND the four fixed rows (owner, D674, 8 Oct 26 — "Can
// rearrange allow newly created counter rows be allowed to moved to anywhere in between the fixed blue dot rows? Even
// to below the 4 as well."). It narrows D665: the four (Required P and W, Available P and W) are no longer always the
// block's last rows — a counter may stand above them, between any two of them, or below all four.
//
// HOW THE PLACES ARE KEPT. The saved order (`manningorder`, the list a counter's place has always been kept in) may
// now hold four more entries, one for each fixed row — a TOKEN, not a rule id: the two Required rows are not rules at
// all, and the two Available rows' rule ids (`availp` / `availw`, availrows.ts) stay what the calendars find them by,
// wherever they are drawn. A token starts with "@", which no counter's id can (a counter's id is made of a–z, 0–9 and
// dashes — ui/CounterForm.tsx mintId), so the two can never be mistaken for each other.
//
// WHAT A SAVED LIST MEANS (`blockOrder`) — the rules, each pinned in fixedrows.test.ts:
//   · the four keep THEIR OWN order whatever the list says: only counters move (his D674, reading 1);
//   · a list that names none of the four — every list saved before D674, and every squadron that has never put a
//     counter among them — reads as "its counters, then the four": what the block showed before (reading 4, and D56:
//     nothing stored is converted);
//   · a counter the list does not name (made since it was saved) appears just above Required P — where a new counter
//     has always appeared, at the foot of the counters above the four;
//   · an id that is no counter any more is dropped; nothing is ever drawn twice.
//
// Pure — no store, no dates — so the store, the screen and the tests all read one body.

/** the four fixed rows' tokens in the saved order, top to bottom — the order they always keep among themselves */
export const FIXED_ROWS = ['@req-p', '@req-w', '@avail-p', '@avail-w'] as const
export type FixedRow = (typeof FIXED_ROWS)[number]
export const isFixedRow = (id: string): id is FixedRow => (FIXED_ROWS as readonly string[]).includes(id)

/** The block's rows in the order they are drawn: every counter of `counters` and each of the four, once.
 *  `saved` — the stored order, read leniently; `counters` — the counters that exist, in the order they were made. */
export function blockOrder(saved: readonly string[], counters: readonly string[]): string[] {
  const known = new Set<string>([...counters, ...FIXED_ROWS])
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of saved) if (known.has(id) && !seen.has(id)) { out.push(id); seen.add(id) }
  /* any of the four the list does not name stand at the foot … */
  for (const f of FIXED_ROWS) if (!seen.has(f)) { out.push(f); seen.add(f) }
  /* … and the four keep their own order: the places they hold are refilled top to bottom */
  let k = 0
  for (let i = 0; i < out.length; i++) if (isFixedRow(out[i]!)) out[i] = FIXED_ROWS[k++]!
  /* a counter the list does not name: just above Required P */
  const fresh = counters.filter(id => !seen.has(id))
  if (fresh.length) out.splice(out.indexOf(FIXED_ROWS[0]), 0, ...fresh)
  return out
}

/* ---- THE REQUIRED ROWS' NAMES (D1193, 21 Oct 26, narrowing D668): an admin may rename Required P and Required W —
   the name only; their figures stay typed in their cells. A seat with no name of its own reads the one it started with,
   and only then does a phone show the short form ("Req P"). */

/** the names the two Required rows start with */
export const REQ_NAMES_ORIGINAL = Object.freeze({ p: 'Required P', w: 'Required W' })
/** the longest name kept — the counter form's own limit for a row's name */
export const REQ_NAME_MAX = 80
/** an admin's names for the two Required rows, a seat present only where it has been renamed */
export interface ReqNames { p?: string; w?: string }

/** One name as it will be kept: trimmed, at most REQ_NAME_MAX long — or null for "the original" (blank, or the
 *  original itself, so a name typed back to how it started is stored as no name at all). */
export function reqNameToKeep(seat: 'p' | 'w', name: unknown): string | null {
  if (typeof name !== 'string') return null
  const t = name.trim().slice(0, REQ_NAME_MAX)
  return !t || t === REQ_NAMES_ORIGINAL[seat] ? null : t
}
/** a stored pair, read leniently: a seat that is not a name is left out (it reads the original) */
export function readReqNames(x: unknown): ReqNames | null {
  if (!x || typeof x !== 'object' || Array.isArray(x)) return null
  const o = x as Record<string, unknown>
  const out: ReqNames = {}
  for (const s of ['p', 'w'] as const) { const n = reqNameToKeep(s, o[s]); if (n !== null) out[s] = n }
  return out
}
/** the two rows' names as they stand */
export function reqNamesOf(names: ReqNames): { p: string; w: string } {
  return { p: names.p ?? REQ_NAMES_ORIGINAL.p, w: names.w ?? REQ_NAMES_ORIGINAL.w }
}

/** What is SAVED for an order: the four at the foot in their own order is what a list without them already means, so
 *  they are left out — a squadron that never puts a counter among or below the four saves exactly what it always
 *  saved. Any other order is saved whole. */
export function orderToSave(order: readonly string[]): string[] {
  const n = FIXED_ROWS.length
  const foot = order.slice(-n)
  return order.length >= n && FIXED_ROWS.every((f, i) => foot[i] === f) ? order.slice(0, -n) : [...order]
}
