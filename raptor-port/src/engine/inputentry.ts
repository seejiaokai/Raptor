/* AN ENTRY'S OWN IDENTITY — what the records of one shared input say alike, and the one string that names the entry
   (`[GROUP-INPUT-ONE-ROW]`; owner D654, D655, D661; the plan
   docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md §4.1).

   A shared input is kept as ONE RECORD PER MAN tied by a group id (state/inputgroup.ts, which says why); an ENTRY is the
   live records that share a `grp` AND the same shared fields, worked out on read. `sharedKey` and `SHARED_FIELDS` stood
   in state/inputgroup.ts until 11 Oct 26 and are MOVED here unchanged — the engine may not import state/, and the
   schedule now needs the same test (a request's row carries its entry's identity: overlay.ts requestRowFields) — and
   are re-exported from where they were. ONE normaliser, so the Inputs pages and the schedule cannot disagree about who
   is in one entry. */
import { isUpchit, needsDoc } from './inputs'

/* what every record of an entry says alike; everything else on a record is the man's own (his id and place, his OIL
   answers, where his request is filed, his hand-overs, the late date, the Leave War's mark, who placed and changed it) */
/* …and its TITLE ([INPUT-OWN-TITLE], D715): one shared input has one name — a record of it titled differently is not
   part of the entry, exactly as one with a different remark is not */
export const SHARED_FIELDS = ['type', 'title', 'date', 'endDate', 'yr', 'allday', 's', 'e', 'half', 'remarks', 'sans'] as const

/* `sans` — which of Fly / OFT / AMT a SANS availability offers — is shared too: an admin files one availability for
   several SANS people (D658), and its ticks are what the one line says. Read as the set of boxes ticked. */
const ticks = (v: any): any => {
  if (v == null || typeof v !== 'object') return v == null || v === '' ? null : v
  const on = Object.keys(v).filter(k => v[k]).sort()
  return on.length ? on.join(',') : null
}
const norm = (f: string, v: any): any => f === 'allday' ? !!v : f === 'sans' ? ticks(v) : (v == null || v === '') ? null : v
/** The shared fields of a record as one comparable string — a blank end date, half or remark reads the same as none. */
export const sharedKey = (r: any): string => JSON.stringify(SHARED_FIELDS.map(f => norm(f, r && r[f])))

/** THE ENTRY A RECORD BELONGS TO, AS ONE SHORT STRING — '' for an ordinary input. The group's id and a short hash of
 *  `sharedKey`: EXACTLY what state/inputgroup.ts entriesOf groups by (a record with no `grp`, a medical entry and an
 *  upchit are never part of a group — D655 reading 4), so two records carry the same string when, and only when, the
 *  Inputs pages show them as one shared input. A request writes it on its row as `srcg` (overlay.ts): the rows of one
 *  entry are then known as ONE row from the rows alone — on an issued face, in another week, in the next-week peek —
 *  and a record changed alone (another last day, another remark) carries a different one and is honestly its own row
 *  again (D735: the row never splits or joins by itself; it follows the entry). */
export function entryIdOf(rec: any): string {
  if (!rec || rec.grp == null || rec.grp === '' || needsDoc(rec.type) || isUpchit(rec.type)) return ''
  const s = sharedKey(rec)
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) }
  return `${rec.grp}~${(h >>> 0).toString(36)}`
}
