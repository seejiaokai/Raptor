/* WHO PLACED AN ENTRY AND WHO DECIDED IT — what the day's records say, read for the bid windows' "Placed · Decided" line
   (ui/PlacedLine.tsx, which has the whole story) and the day's list (ui/DayList.tsx). Kept out of PlacedLine.tsx so that
   file exports only components (React Doctor's only-export-components, D1534). */
import { recordsAt, getState } from '../state/store'
import { leaveInputsAt, rosterCallsign } from '../sync'
import type { RequestRec } from '../engine'

const csOf = (id: unknown): string => {
  if (id == null || id === '') return ''
  const s = String(id)
  return getState().people.find(p => p.id === s)?.callsign || rosterCallsign(s) || ''
}

export interface PlacedFacts { key: string; placed?: { who: string; at: number }; decided?: { what: 'Approved' | 'Refused'; who: string; at?: number } }

/** what the day's entries say of who placed and decided them — nothing where nothing is known */
export function placedFacts(personId: string, date: string): PlacedFacts[] {
  const out: PlacedFacts[] = []
  for (const r of recordsAt(personId, date)) {
    if (r.kind !== 'request') continue
    const q = r as RequestRec
    const f: PlacedFacts = { key: q.id }
    if (typeof q.placedAt === 'number') f.placed = { who: csOf(q.placedBy), at: q.placedAt }
    if (q.state === 'refused' && q.decidedBy) f.decided = { what: 'Refused', who: csOf(q.decidedBy), ...(typeof q.decidedAt === 'number' ? { at: q.decidedAt } : {}) }
    if (f.placed || f.decided) out.push(f)
  }
  for (const row of leaveInputsAt(personId, date)) {
    if (!row || !row.lw) continue
    const f: PlacedFacts = { key: String(row.iid) }
    if (typeof row.lwAt === 'number') f.placed = { who: csOf(row.lwBy), at: row.lwAt }
    if (row.by != null) f.decided = { what: 'Approved', who: csOf(row.by), ...(typeof row.at === 'number' ? { at: row.at } : {}) }
    if (f.placed || f.decided) out.push(f)
  }
  return out
}
