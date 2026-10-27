/* WHO PLACED AN ENTRY AND WHO DECIDED IT — the bid windows' "Placed · Decided" line (the Leave War overhaul's M4, 8.6;
   drawn full/r7-13-entry-desk, held back from M3; D629's precedent: every input shows who placed it and when).

   One line an entry on the day — a morning and an afternoon are two (his D1315: what the window shows about what a day
   holds, it shows for every entry): "Placed Ranger · Mon 5 Jan, 09:12 · Approved Saber · Thu 8 Jan, 08:40". Read off
   the records themselves:
   · a request — its own `placedBy` / `placedAt`; refused, its `decidedBy` / `decidedAt`;
   · leave the war approved — the Input, which keeps the request's placer as `lwBy` / `lwAt` and whose own `by` / `at`
     name the APPROVER (leavewar/sync.ts doorApprove).
   A request saved before M4 carries no stamp: the line says nothing it does not know (no dash in a window — Approvals
   prints one in its column). Drawn compact, round 3's way: no row label, small grey words, the names in ink. */
import { recordsAt, getState } from '../state/store'
import { leaveInputsAt, rosterCallsign } from '../sync'
import type { RequestRec } from '../engine'

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
/** "Mon 5 Jan, 09:12" — the moment, in the app's day-first voice */
export function whenWords(ms: number): string {
  const d = new Date(ms)
  return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
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

/** one entry's words — "Placed Ranger · Mon 5 Jan, 09:12 · Approved Saber · Thu 8 Jan, 08:40" */
export function PlacedOne({ f }: { f: PlacedFacts }) {
  return (
    <span className="bp-placedline">
      {f.placed && <>Placed <b>{f.placed.who || '—'}</b> · {whenWords(f.placed.at)}</>}
      {f.placed && f.decided && ' · '}
      {f.decided && <><span className={f.decided.what === 'Approved' ? 'bp-ok' : 'bp-no'}>{f.decided.what}</span> <b>{f.decided.who || '—'}</b>{f.decided.at !== undefined && <> · {whenWords(f.decided.at)}</>}</>}
    </span>
  )
}

export function PlacedLine({ personId, date }: { personId: string; date: string }) {
  const facts = placedFacts(personId, date)
  if (!facts.length) return null
  return (
    <div className="bidsheet-row bp-placed" data-testid="bid-placed">
      {facts.map(f => <PlacedOne key={f.key} f={f} />)}
    </div>
  )
}
