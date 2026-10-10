/* WHICH GROUND ROWS OF A DAY ARE DRAWN AS ONE (`[GROUP-INPUT-ONE-ROW]`; owner D661 — "on the schedule a group input is
   ONE row holding everyone — not a row for each man", D735 — "the row never splits or joins by itself"; the plan
   docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md §3, §4.1).

   The bet of that plan: a shared input stays one record a man AND one ground row a man — the warnings, crew rest, each
   man's OIL claim, the amendment's stored diff and the sign-offs go on reading one man's row — and the ONE row is made
   where a person meets it: where it is drawn, where a hand writes to it, and where a published day counts it. This is
   the one answer all three ask.

   Two rows are the same one row when both came from a request (`src`), neither is a dead `kept` row (D363), they carry
   the same non-empty `srcg` (the entry's own identity — engine/inputentry.ts entryIdOf, written by the request on its
   row), and the marks only a scheduler makes are alike: CX and its reason, the red box, information only. Rows that
   are not alike are honestly drawn apart, never papered over.

   READ OFF THE ROWS, NEVER THE LIVE INPUT (the rowKindTag precedent, ui/html.ts): an issued face, the next-week peek
   and another week's read need no input lookup, and draw what their own rows say.

   Returns one answer PER ROW INDEX: `lead` — the member that stands first in the day's own display order (order.ts
   groundOrder: by start time, or by hand where the list is hand-ordered), where the one row is drawn; `members` —
   every row of it, in that same order, the lead first. A row on its own is its own lead and only member. */
import { groundOrder } from './order'

export type RowGroup = { lead: number; members: number[] }

const alike = (r: any): string => JSON.stringify([!!r.cx, String(r.cxr || ''), !!r.flag, !!r.info])

export function groundGroups(d: any): RowGroup[] {
  const rows: any[] = (d && d.ground) || []
  const out: RowGroup[] = new Array(rows.length)
  const byKey = new Map<string, RowGroup>()
  for (const { row, ri } of groundOrder(rows, d && d.gman) as Array<{ row: any; ri: number }>) {
    const one = !row || !row.src || row.kept || !row.srcg
    const k = one ? '' : `${row.srcg}\u0000${alike(row)}`
    let g = one ? undefined : byKey.get(k)
    if (!g) { g = { lead: ri, members: [] }; if (!one) byKey.set(k, g) }
    g.members.push(ri)
    out[ri] = g
  }
  return out
}
