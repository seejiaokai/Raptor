/* WHICH DOCUMENT VERSION the seed reads are resolving right now (published-schedule
   flagging, spec §5.3). A neutral one-value module so validate.ts (which sets it
   around the OFFICIAL run) and weekctx.ts (which reads it to resolve neighbour
   weeks' issued snapshots) share the flag WITHOUT importing each other — validate
   already imports weekctx, so the flag can't live in either without a cycle.

   'working' — the live desk copy (the default; every ordinary validate() pass).
   'official' — each day at its issued/signed version (set only inside
   withIssuedWeek, restored in its finally, never left flipped). */
import { dateOrd } from './inputs'

export type World = 'working' | 'official'
let CURWORLD: World = 'working'
export function getWorld(): World { return CURWORLD }
export function setWorld(w: World) { CURWORLD = w }

/* THE FROZEN FILING (published-schedule flagging, §14.3). Filing — an input's `acc`
   state — is a fourth publication axis that day CONTENT does not carry: filing an
   input changes INPUTS.acc, not DAYS. During the OFFICIAL run, an approved date's
   inputs must read the acc they had when the day was SIGNED (its snapshot.fil), so
   marking an input 'r' on the working copy cannot clear a signed warning, and a
   post-publish-ADDED input cannot leak into the signed view, until it is published.
   Keyed by date string → input id → acc. Null (and inert) except inside
   withIssuedWeek's official pass. */
let FILING: Record<string, Record<string, string>> | null = null
/* keyed by the CANONICAL date ordinal (dateOrd — the same key inputCoversDate
   matches on), never the raw label: a frozen snapshot's dt and a re-labelled stash
   dt are different STRINGS for the same day, so a raw-string key would silently
   miss. Callers pass raw date strings; setFiling and fileAcc both fold through
   dateOrd, so the two sides always agree. */
export function setFiling(map: any) {
  if (!map) { FILING = null; return }
  const out: any = {}
  for (const dt of Object.keys(map)) { const k = dateOrd(dt); if (k != null) out[k] = map[dt] }
  FILING = out
}
export function clearFiling() { FILING = null }
/* is a frozen filing installed right now (i.e. are we inside the official pass)?
   Lets the hot read sites keep their exact prior path (inputDormant, no id mint)
   off the official run, and only fold through fileAcc when it can matter. */
export function filingActive() { return FILING != null }
/* the effective acc for one input on one date. Off the official run (or on a date
   that was never signed) → the LIVE acc, unchanged. On a signed date: the frozen
   acc when the input was present at sign time, else 'r' (dormant) — an input that
   did not cover this date when it was signed is treated as ABSENT from the signed
   view, never shown off its live acc, so a post-publish add cannot leak in. */
export function fileAcc(dt: any, iid: any, live: any) {
  if (!FILING) return live
  const k = dateOrd(dt); if (k == null) return live
  const day = FILING[k]
  if (!day) return live
  return Object.prototype.hasOwnProperty.call(day, iid) ? day[iid] : 'r'
}
