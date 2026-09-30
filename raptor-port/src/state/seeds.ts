// src/state/seeds.ts
/* EVERY BOOT STARTS FROM THE SEED IT WAS GIVEN — the demo's, or none ([DB-READINESS] group A, phase 5.2 — plan §3
   phase 5.2; Fable F2-05 (a); Astra R2-09 fix 2).

   The scheduler's live data is a set of module arrays and objects the whole app holds by reference (INPUTS, PEOPLE,
   DAYS, DATES, SCHED, the planning calendar, the saved weeks), and the demo IS their initial content. A boot used to
   overlay the store on whatever those held — fine for one boot per page life, but a blank boot then emptied the demo out
   of the process for good, and a demo boot after a blank one had nothing to load. So every boot (src/boot.ts) calls this
   FIRST, before anything reads storage: each live array or object is reset IN PLACE — never replaced, every holder keeps
   its reference — from a frozen copy of the demo, or to blank:
   - the requests    ← `WEEK1_INPUTS_SNAP` (engine/inputs.ts — the week-1 literal, frozen as JSON at module load);
   - the roster      ← `PEOPLE_SEED_SNAP` (engine/people.ts — frozen after every load-time derivation); blank keeps the
                       two placeholder pucks, which are code, never data;
   - the loaded week ← the boot week (`BOOT_WEEK`), its days and dates from `WEEK1_DAYS_SNAP` / `WEEK1_DATES`, or a blank
                       week; the schedule book fresh; no saved week in memory;
   - the planning calendar, empty (its seed is empty);
   - the authored demo weeks on or off (engine/weeks-data.ts setAuthoredWeeks);
   - the accounts' seeded list on or off (state/accounts.ts setAccountSeeds).
   The Leave War builds its world from seed FACTORIES at its own init (leavewar/state/store.ts — fresh every call), and
   the Tracker reads the policy at its first mount (tracker/app/core.js). Then storage is read over the top as always. */
import { INPUTS, DATES, WEEK1_INPUTS_SNAP, WEEK1_DATES } from '../engine/inputs'
import { PEOPLE, PEOPLE_SEED_SNAP, indexCallsigns } from '../engine/people'
import { DAYS, WEEK1_DAYS_SNAP } from '../engine/data'
import { BOOT_WEEK, setCurWeek } from '../engine/waves'
import { resetSched } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { emptyWeek, setAuthoredWeeks } from '../engine/weeks-data'
import { PLANPUCKS, DAYRMK } from './plan'
import { setAccountSeeds } from './accounts'

/* the policy this page life booted with — read by the one part that boots LATER, at its first mount: the Tracker, through
   its page seam (tracker/TrackerPage.tsx), so no new crossing into it is made */
let SEED_DEMO = true
export const seedDemoNow = (): boolean => SEED_DEMO

export function resetSeedWorld(seedDemo: boolean): void {
  SEED_DEMO = seedDemo
  setAuthoredWeeks(seedDemo)
  setAccountSeeds(seedDemo)
  /* the week first — a blank week's date labels read the loaded week's year */
  setCurWeek(BOOT_WEEK)
  resetSched()
  stashClear()
  const week = seedDemo ? null : emptyWeek(BOOT_WEEK)
  DAYS.length = 0
  ;(week ? week.days : JSON.parse(WEEK1_DAYS_SNAP)).forEach((d: any) => DAYS.push(d))
  DATES.splice(0, DATES.length, ...(week ? week.dates : WEEK1_DATES))
  INPUTS.length = 0
  if (seedDemo) JSON.parse(WEEK1_INPUTS_SNAP).forEach((r: any) => INPUTS.push(r))
  const seed = JSON.parse(PEOPLE_SEED_SNAP)
  for (const id of Object.keys(PEOPLE)) delete (PEOPLE as any)[id]
  for (const id of Object.keys(seed)) if (seedDemo || seed[id].special) (PEOPLE as any)[id] = seed[id]
  indexCallsigns()
  PLANPUCKS.length = 0
  for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
}
