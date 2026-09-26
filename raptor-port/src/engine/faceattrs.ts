/* WHAT A PUBLISHED FACE DRAWS FROM THE ROSTER AND THE RULES, AS ISSUED ([LEAVE-LATE-PUBLISHED], owner D179, 25 Sep 26 —
   "freeze everything for now"; Astra's code read #2, 26 Sep 26). An issued version keeps the roster attributes of every
   man its face draws (`snap.pa` — CAT, seat, ground crew, SANS, SXO) and the rule value it prints (`snap.rv` — the blank
   brief's lead). While that face is drawn (ui/html.ts withDaySnap installs them beside the frozen inputs) the puck reads
   the man as issued and the blank brief prints the lead it went out with; a change on the Quals or Logic page moves the
   working copy and reads pending for the admin (publish.ts warnDelta), and the next AL takes it in.
   The callsign stays LIVE — a rename is a label (14 Sep 26). The rules themselves are NOT versioned (7 Aug 26): the
   validator and every working surface read today's; only what the issued DOCUMENT printed is kept with it.
   Synchronous, restored in finally; nothing inside may write. Outside an issued face everything reads live. */
import { PEOPLE, SEATRANK, QORDER } from './people'
import { VCONF } from './rules'

type Face = { pa?: any, rv?: any, ros?: any } | null
let FA: { pa: any, rv: any, ros: any } | null = null
export function withFaceAttrs<T>(face: Face, fn: () => T): T {
  if (!face || (!face.pa && !face.rv && !face.ros)) return fn()
  const outer = FA
  FA = { pa: face.pa || null, rv: face.rv || null, ros: Array.isArray(face.ros) ? face.ros : null }
  try { return fn() } finally { FA = outer }
}
/* the aircrew a day counts as its roster — every man not posted out and not ground crew — as the app stands today; the
   issued version keeps this list (publish.ts freezeWarn → `snap.ros`, Astra's second read #3) */
export function rosterIds(): string[] {
  return Object.keys(PEOPLE).filter((id: any) => { const p = (PEOPLE as any)[id]; return p && !p.archived && !p.pers }).sort()
}
/* the roster the face being drawn counts ("free all day" on the day panel): the day's own, as issued, when it kept one —
   a man since deleted from the roster outright has nothing to draw and drops — else today's */
export function rosterShown(): string[] {
  return FA && FA.ros ? FA.ros.filter((id: any) => !!(PEOPLE as any)[id]) : rosterIds()
}
/* the person as the face being drawn shows him: the issued attributes over today's record (callsign and all else live) */
export function personShown(id: any): any {
  const p = (PEOPLE as any)[id]
  if (!p || !FA || !FA.pa) return p
  const f = FA.pa[id]
  if (!f) return p
  return { ...p, q: f.q ?? undefined, seat: f.seat ?? undefined, pers: !!f.pers, san: !!f.san, sxo: !!f.sxo }
}
/* the crew order the app sorts men by (people.ts byCrew — seat, then CAT, then callsign), read as the face being drawn
   shows each man: the ALL AVAIL window's columns and order on an issued face (Fable's second read #2) */
export const seatShown = (id: any) => ((personShown(id) || {}) as any).seat
export const byCrewShown = (a: any, b: any) => {
  const A: any = personShown(a) || {}, B: any = personShown(b) || {}
  return (SEATRANK[A.seat] ?? 3) - (SEATRANK[B.seat] ?? 3) || (QORDER[B.q] ?? -1) - (QORDER[A.q] ?? -1) || String(A.cs || a).localeCompare(String(B.cs || b))
}
/* the brief lead a blank B prints on the face being drawn */
export function briefLeadShown(): number {
  return FA && FA.rv && FA.rv.briefLead != null ? +FA.rv.briefLead : (VCONF as any).briefLead
}
