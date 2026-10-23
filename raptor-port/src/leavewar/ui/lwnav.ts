/* THE TOP ROW ASKS THE GRID FOR ITS WINDOWS (the overhaul's M2 — D1254, D1141).
   The Leave War's top row (Chrome.tsx `Topbar`: the tabs, ⚙ and My leave) and the grid (Matrix.tsx) are siblings, and the
   windows those buttons open — the OIL tracker, ⚙ Settings, the person window — are the grid's state, as they were when
   their buttons sat on the grid card's bar. So a press up here is an ASK, taken once by the grid, the same footing as
   `warask.ts` (the Holidays list's ask for a new period): an ask is not a fact about the war, so it lives outside the
   war's store — it is not saved, not undone, and repaints no grid. The grid answers back one fact the tabs need: whether
   the OIL tracker is up, so the OIL tab reads as the one chosen while it is. */

export type LwAsk =
  | { kind: 'grid' }
  | { kind: 'oil' }
  | { kind: 'settings' }
  | { kind: 'person'; id: string }

let ask: LwAsk | null = null
let oilUp = false
let seq = 0
const subs = new Set<() => void>()
const ping = () => { seq++; subs.forEach(f => f()) }

/** Ask the grid to open (or, for 'grid', to close the OIL tracker and show the grid). */
export function askLw(a: LwAsk) { ask = a; ping() }
/** The grid takes the ask once. */
export function takeLwAsk(): LwAsk | null { const a = ask; ask = null; return a }
/** The grid says whether the OIL tracker is up (the OIL tab's lit state). */
export function setOilUp(v: boolean) { if (oilUp !== v) { oilUp = v; ping() } }
export const isOilUp = () => oilUp
export const lwNavVersion = () => seq
export function subscribeLwNav(f: () => void) { subs.add(f); return () => { subs.delete(f) } }
