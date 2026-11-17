/* THE UNIT IN VIEW — which squadron's schedule the scheduler's singletons hold (multi-squadron batch 1, step 2; plan
   docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md §3.4 "The schedule in view is swapped").

   The schedule's module singletons (DAYS, SCHED, DATES, CURWEEK, PLANPUCKS, DAYRMK, VCONF, the templates — the UNIT
   list in storage/keyowner.ts) hold ONE unit's schedule, as they hold one week. This is that unit, beside CURWEEK
   (engine/waves.ts), and like CURWEEK it is changed by one path only: state/store.ts switchUnit, which stashes the week
   being left under the unit being left, sets this, and reloads every one of those singletons by the path a week load
   uses. Every unit-qualified record id the schedule writes (storage/unitid.ts) is qualified with this.

   It starts as the demo's home squadron. Signing in moves it to the person's home unit (state/store.ts resetSession);
   headless and on the demo with no one signed in it stays at u142. Engine-side and import-free but for the pure codec,
   so the engine's own readers (the week stash, weekBundle) can ask it without importing state/. */
import { qualify } from '../storage/unitid'

export const BOOT_UNIT = 'u142'
/* the unit whose authored demo weeks engine/weeks-data.ts holds — only its schedule seeds them (step 6 seeds 149's own) */
export const DEMO_SEED_UNIT = 'u142'

export let UNIT = BOOT_UNIT
/** set the unit in view — ONLY state/store.ts switchUnit (and the test reset) calls this; nothing else may move it */
export function setUnitInView(u: string): void { UNIT = u }
/** a schedule-local id (a week key `dd/mm/yyyy`, `<wk>#<di>`, `pp:<id>`, `rules`) qualified with the unit in view */
export const inView = (id: string): string => qualify(UNIT, id)
