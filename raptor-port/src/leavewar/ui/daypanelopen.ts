/* THE DAY PANEL'S OPEN DAY (ui/DayPanel.tsx): its own small listener set, never a field of the store the grid's rows read
   — opening it, stepping it, or a bid placed with it open repaints no month of the grid (performance.md §E). Kept out of
   DayPanel.tsx so that file exports only components (React Doctor's only-export-components, D1534). */

let OPEN: string | null = null
const subs = new Set<() => void>()
const emit = () => { for (const f of subs) f() }
export function openDayPanel(iso: string): void { OPEN = iso; emit() }
export function closeDayPanel(): void { if (OPEN) { OPEN = null; emit() } }
export const dayPanelDate = (): string | null => OPEN
export const subscribeDayPanel = (f: () => void) => { subs.add(f); return () => { subs.delete(f) } }
