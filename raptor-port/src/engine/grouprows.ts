/* WHOSE PUCKS A GROUND ROW DRAWS, AND IN WHAT ORDER — the one answer every builder reads (the one-rule build, step 2 (b),
   12 Oct 26 — owner D755, D756: an input is ONE record and its row ONE ground row). Until step 6 of that build this file
   also said which rows of a day were "drawn as one" (`groundGroups` — a shared input was a row a man, tied by an entry
   mark, `[GROUP-INPUT-ONE-ROW]`, D661): nothing is drawn as one any more, and that answer, its callers and its entry
   mark went with the dead code. */
import { PEOPLE, whoId, isSpecial } from './people'

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
/** IS THIS AN INPUT'S ROW THAT HOLDS SEVERAL — the row every builder draws through rowPeopleDrawn (A to Z, then the
 *  placeholder) and, on a phone, with the one row's own layout (`gshared` — the approved picture 2, D743). A row of
 *  one person, a row nobody filed and a dead `kept` row are drawn as they always were. */
export const inputRowSeveral = (row: any): boolean =>
  !!row && !!row.src && !row.kept && [row.who, ...(row.more || [])].filter((v: any) => !!whoId(v)).length > 1
