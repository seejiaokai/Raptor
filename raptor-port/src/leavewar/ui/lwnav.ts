/* THE TOP ROW ASKS THE GRID FOR ITS WINDOWS (the overhaul's M2 — D1254, D1141).
   The Leave War's top row (Chrome.tsx `Topbar`: the tabs, ⚙ and My leave) and the grid (Matrix.tsx) are siblings, and the
   windows those buttons open — the OIL tracker, ⚙ Settings, the person window — are the grid's state, as they were when
   their buttons sat on the grid card's bar. So a press up here is an ASK, taken once by the grid, the same footing as
   `warask.ts` (the Holidays list's ask for a new period): an ask is not a fact about the war, so it lives outside the
   war's store — it is not saved, not undone, and repaints no grid. The grid answers back one fact the tabs need: whether
   the OIL tracker is up, so the OIL tab reads as the one chosen while it is. */

export type LwAsk =
  | { kind: 'grid' }
  /* `id`: opened on that person's row (the Balances page's "0 ›" — D1255); none opens it at the top */
  | { kind: 'oil'; id?: string }
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
/* Approvals coming up (its page, or its slim bar over the grid) takes the Balances page down: one page stands in the grid
   card's place at a time */
export function setApprMode(m: ApprMode) { if (appr !== m) { appr = m; if (m !== 'off') bal = false; ping() } }

/* THE PAGE IN THE GRID CARD'S PLACE, MADE GENERAL (the overhaul's M5a — D1254, D1483): the grid, Approvals' page or the
   Balances page. Approvals keeps its own three modes above (its slim bar, its visit); Balances is a page and nothing more —
   for everyone, a member included, since D1242 (the member guard in the tab row switches only Approvals off). Leaving the
   Leave War ends it as it ends Approvals' visit, so a return lands on the grid (LeaveWarPage.tsx). View state only — not
   saved, not undone, repaints no grid. */
export type LwPage = 'grid' | 'approvals' | 'balances'
let bal = false
export const balancesUp = () => bal
export function setBalancesUp(v: boolean) {
  if (bal === v) return
  bal = v
  if (v) appr = 'off'
  ping()
}
/** which page stands in the grid card's place now — Approvals' slim bar shows the grid */
export const lwPage = (): LwPage => (appr === 'page' ? 'approvals' : bal ? 'balances' : 'grid')

/* A DAY ASKED FOR FROM OUTSIDE THE PAGE (M4 9.6 — the bell's Leave War line): the page is not on screen yet, so the ask
   waits here and the page's landing takes it INSTEAD of its own first-visit landing (LeaveWarPage.tsx). */
let ringAsk: { personId: string; date: string } | null = null
export function askRing(a: { personId: string; date: string } | null) { ringAsk = a }
export function takeRingAsk(): { personId: string; date: string } | null { const a = ringAsk; ringAsk = null; return a }

/* A REQUEST TO RING ON THE APPROVALS PAGE (his D1542, 31 Oct 26 — [LW-CLASH-ROWLESS-TAP]): the clash note's "Decide it in
   Approvals ›" for a man with no row on the grid (a SANS man while SANS is off the war, an archived man) opens Approvals with
   his request on that day ringed — the grid cannot open a day on a row it does not draw. The page takes the ask once, rings
   the line holding that day and scrolls it into view (ApprovalsPage.tsx). View state only — not saved, not undone. */
/* `code`: the bid's own code, as the clash names it — two bids of his on one day are two lines, and the clash's is the one
   rung (the fresh read's F2, 31 Oct 26) */
export interface ApprRingAsk { personId: string; date: string; code?: string }
let apprRing: ApprRingAsk | null = null
export function askApprRing(a: ApprRingAsk) { apprRing = a; ping() }
/** whether a ring is waiting — read without taking it, so a render React throws away takes nothing */
export const apprRingAsked = (): ApprRingAsk | null => apprRing
export function takeApprRing(): ApprRingAsk | null { const a = apprRing; apprRing = null; return a }
