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
import { PEOPLE, whoId } from './people'

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

/* THE PUCKS OF A DRAWN ROW — the one answer every builder reads (the week, the board, the next-week peek), so no two
   surfaces can draw the one row's people differently (the plan §4.3). For a row of several members: each member row's
   OWN MAN, in A-to-Z order of callsign (the order the Inputs list names a shared input's people in — D727), then each
   member row's extras, in member order. EVERY PUCK KEEPS ITS OWN ROW'S KEY (`g:di.ri`, `g:di.ri.xN`): its flag, its
   amendment mark, its OIL bar and switch, and a tap or a drag on it are that man's row's, exactly as before the rows
   were drawn as one. `ri` is the member row a puck stands on. A blank place is left out (a row draws nothing for it). */
export type DrawnPuck = { id: string; key: string; ri: number }
const callsign = (id: string): string => { const p = (PEOPLE as any)[id]; return p && p.cs ? String(p.cs) : String(id) }
export function drawnPeople(d: any, di: any, g: RowGroup): DrawnPuck[] {
  const rows: any[] = (d && d.ground) || []
  const own: DrawnPuck[] = [], more: DrawnPuck[] = []
  for (const ri of g.members) {
    const row = rows[ri]; if (!row) continue
    const id = whoId(row.who)
    if (id) own.push({ id: String(id), key: `g:${di}.${ri}`, ri })
    ;(row.more || []).forEach((v: any, i: number) => { const x = whoId(v); if (x) more.push({ id: String(x), key: `g:${di}.${ri}.x${i}`, ri }) })
  }
  if (g.members.length > 1) {
    const at = new Map(own.map((p, i) => [p, i] as const))
    own.sort((a, b) => callsign(a.id).localeCompare(callsign(b.id), undefined, { sensitivity: 'base' }) || (at.get(a)! - at.get(b)!))
  }
  return own.concat(more)
}
