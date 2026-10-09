// "OPEN THE NEW-PERIOD SHEET ON THESE DATES" — an ask that waits for the war's top row to answer it (the build plan
// docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.4).
//
// The Holidays list in Days cannot write a holiday on a date no leave period holds; its way out is the war's OWN
// New-period sheet with the dates left out already picked (sync.ts `openNewPeriod`). The asker is the scheduler's
// window and the sheet belongs to the war's top row (`ui/Chrome.tsx Topbar`), which may not even be drawn yet — the
// Leave War page is mounted lazily. So the ask is held HERE, one at a time, until the top row takes it.
//
// Module state with its own tiny listener set — NOT the war's store: an ask is not a fact about the war, it must not be
// saved or undone, and putting it in the store would repaint the grid for a sheet opening (the firewall that keeps the
// grid's renders apart from the page's — LeaveWarPage.tsx).

export interface WarAsk { from: string; to: string }

let ASK: WarAsk | null = null
const subs = new Set<() => void>()
const emit = () => { for (const f of [...subs]) f() }

/** ask for the sheet on these dates — a second ask before the first is answered replaces it */
export function askNewWar(r: WarAsk): void { ASK = { from: r.from, to: r.to }; emit() }
/** the ask that is waiting, if any (a stable object until it changes — safe for useSyncExternalStore) */
export const peekNewWarAsk = (): WarAsk | null => ASK
/** the ask is spent — answered, or dropped */
export function clearNewWarAsk(): void { if (ASK) { ASK = null; emit() } }
export function subscribeNewWarAsk(f: () => void): () => void { subs.add(f); return () => { subs.delete(f) } }
