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
/* *(SINCE THE ONE-RULE BUILD, STEP 2 (b) — 12 Oct 26, owner D755, D756: an input is ONE record and its row ONE ground
   row, so nothing is drawn "as one" any more: `groundGroups` answers every row as its own lead and only member, and
   its callers are taken out with the dead code in step 6 of that build. What is left here that is live is the ONE
   answer to "whose pucks does a row draw, in what order" — rowPeopleDrawn.)* */
import { PEOPLE, whoId, isSpecial } from './people'

export type RowGroup = { lead: number; members: number[] }
export function groundGroups(d: any): RowGroup[] {
  return (((d && d.ground) || []) as any[]).map((_r, ri) => ({ lead: ri, members: [ri] }))
}

/* THE PUCKS OF A GROUND ROW — the one answer every builder reads (the week, the board, the next-week peek, print), so no
   two surfaces can draw a row's people differently (the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.3).
   A row that came from an input (`src`, not a dead `kept` row): its named people A to Z by callsign (the order the
   Inputs pages name an input's people in — D727), then its placeholder. Any other row: as stored — the name box, then
   what stands under it. EVERY PUCK KEEPS ITS POSITIONAL KEY (`g:di.ri`, `g:di.ri.xN`): its flag, its amendment mark,
   its OIL bar and switch, and a tap or a drag on it are that place's. A blank place is left out. */
export type DrawnPuck = { id: string; key: string; ri: number }
const callsign = (id: string): string => { const p = (PEOPLE as any)[id]; return p && p.cs ? String(p.cs) : String(id) }
export function rowPeopleDrawn(d: any, di: any, ri: number): DrawnPuck[] {
  const row = (((d && d.ground) || []) as any[])[ri]
  if (!row) return []
  const out: DrawnPuck[] = []
  const id = whoId(row.who)
  if (id) out.push({ id: String(id), key: `g:${di}.${ri}`, ri })
  ;(row.more || []).forEach((v: any, i: number) => { const x = whoId(v); if (x) out.push({ id: String(x), key: `g:${di}.${ri}.x${i}`, ri }) })
  if (!row.src || row.kept || out.length < 2) return out
  const at = new Map(out.map((p, i) => [p, i] as const))
  const ph = (p: DrawnPuck) => (isSpecial(p.id) ? 1 : 0)
  return out.sort((a, b) => ph(a) - ph(b) || (ph(a) ? 0 : callsign(a.id).localeCompare(callsign(b.id), undefined, { sensitivity: 'base' })) || (at.get(a)! - at.get(b)!))
}
export function drawnPeople(d: any, di: any, g: RowGroup): DrawnPuck[] { return rowPeopleDrawn(d, di, g.lead) }
