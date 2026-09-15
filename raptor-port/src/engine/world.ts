/* WHICH DOCUMENT VERSION the seed reads are resolving right now (published-schedule
   flagging, spec §5.3). A neutral one-value module so validate.ts (which sets it
   around the OFFICIAL run) and weekctx.ts (which reads it to resolve neighbour
   weeks' issued snapshots) share the flag WITHOUT importing each other — validate
   already imports weekctx, so the flag can't live in either without a cycle.

   'working' — the live desk copy (the default; every ordinary validate() pass).
   'official' — each day at its issued/signed version (set only inside
   withIssuedWeek, restored in its finally, never left flipped). */
export type World = 'working' | 'official'
let CURWORLD: World = 'working'
export function getWorld(): World { return CURWORLD }
export function setWorld(w: World) { CURWORLD = w }
