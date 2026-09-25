/* WHAT A PUBLISHED FACE DRAWS FROM THE ROSTER AND THE RULES, AS ISSUED ([LEAVE-LATE-PUBLISHED], owner D179, 25 Sep 26 —
   "freeze everything for now"; Astra's code read #2, 26 Sep 26). An issued version keeps the roster attributes of every
   man its face draws (`snap.pa` — CAT, seat, ground crew, SANS, SXO) and the rule value it prints (`snap.rv` — the blank
   brief's lead). While that face is drawn (ui/html.ts withDaySnap installs them beside the frozen inputs) the puck reads
   the man as issued and the blank brief prints the lead it went out with; a change on the Quals or Logic page moves the
   working copy and reads pending for the admin (publish.ts warnDelta), and the next AL takes it in.
   The callsign stays LIVE — a rename is a label (14 Sep 26). The rules themselves are NOT versioned (7 Aug 26): the
   validator and every working surface read today's; only what the issued DOCUMENT printed is kept with it.
   Synchronous, restored in finally; nothing inside may write. Outside an issued face everything reads live. */
import { PEOPLE } from './people'
import { VCONF } from './rules'

let FA: { pa: any, rv: any } | null = null
export function withFaceAttrs<T>(pa: any, rv: any, fn: () => T): T {
  if (!pa && !rv) return fn()
  const outer = FA
  FA = { pa: pa || null, rv: rv || null }
  try { return fn() } finally { FA = outer }
}
/* the person as the face being drawn shows him: the issued attributes over today's record (callsign and all else live) */
export function personShown(id: any): any {
  const p = (PEOPLE as any)[id]
  if (!p || !FA || !FA.pa) return p
  const f = FA.pa[id]
  if (!f) return p
  return { ...p, q: f.q ?? undefined, seat: f.seat ?? undefined, pers: !!f.pers, san: !!f.san, sxo: !!f.sxo }
}
/* the brief lead a blank B prints on the face being drawn */
export function briefLeadShown(): number {
  return FA && FA.rv && FA.rv.briefLead != null ? +FA.rv.briefLead : (VCONF as any).briefLead
}
