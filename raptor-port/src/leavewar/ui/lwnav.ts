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

/* APPROVALS (the overhaul's M4, 8.1 and 8.5 — D1254, D1420, D1231). An admin's tab whose page takes the grid card's place.
   'page' — its page is up; 'bar' — he tapped a request's dates, so the Grid is up with the slim "Back to Approvals" bar at
   its foot, and the page waits behind it exactly as he left it (its lit lines, its dots, the dates picked, its scroll);
   'off' — he has LEFT Approvals: another tab, the slim bar's ✕, another page, or the member view. Leaving ends the visit
   (D1421: the lit lines and the dots go). View state only — not saved, not undone, repaints no grid. */
export type ApprMode = 'off' | 'page' | 'bar'
let appr: ApprMode = 'off'
export const apprMode = (): ApprMode => appr
export function setApprMode(m: ApprMode) { if (appr !== m) { appr = m; ping() } }

/* A DAY ASKED FOR FROM OUTSIDE THE PAGE (M4 9.6 — the bell's Leave War line): the page is not on screen yet, so the ask
   waits here and the page's landing takes it INSTEAD of its own first-visit landing (LeaveWarPage.tsx). */
let ringAsk: { personId: string; date: string } | null = null
export function askRing(a: { personId: string; date: string } | null) { ringAsk = a }
export function takeRingAsk(): { personId: string; date: string } | null { const a = ringAsk; ringAsk = null; return a }
