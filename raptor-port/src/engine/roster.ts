/* WHO IS A UNIT'S ON A DATE — the one answer every enumeration of the people asks (multi-squadron batch 1, step 3; plan
   docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md §3.4 "People").

   PEOPLE stays ONE list (the community's — storage/keyowner.ts), looked up by id as it always was. What changes is the
   loop: a surface that lists people lists ONE unit's people on one date — the schedule in view's (engine/unitview.ts
   UNIT, the day being drawn), or the signed-in person's own squadron (the Inputs page, Quals — state/perms.ts myUnit).
   rosterOf is that list. A loop over the whole of PEOPLE outside it is either on the guard test's allow-list with its
   reason (a look-up by callsign, which is unique in the community — D288; the deleted men, stripped from every unit's
   weeks; storage and the seed; Admin → Users, which lists everyone) or it fails engine/roster-readers.test.ts.

   A person's home unit on a date is state/units.ts homeOn — the Home rows (D2094, D2119). The engine does not import
   state/, so the answer arrives through a resolver state/units.ts installs at its load, the way HOOKS.oilEarningDay
   arrives. Unset (an engine-only test, the reference parity harness) every person is the boot unit's — exactly the
   demo's answer for a person with no home row (state/units.ts fallbackHome), so nothing headless changes meaning.

   The two placeholders (ALL AVAIL, ALL — `special`) are nobody's: a sentinel that stands for "whoever is free", the same
   two bodies on every unit's schedule, so they are in every unit's roster. */
import { PEOPLE } from './people'
import { BOOT_UNIT } from './unitview'

type HomeOf = (pid: string, iso: string) => string | null
let HOME_OF: HomeOf | null = null
/** installed by state/units.ts (homeOn); null puts the headless answer back (every person the boot unit's) */
export function setHomeResolver(fn: HomeOf | null): void { HOME_OF = fn }

/* today as the viewer's own date (yyyy-mm-dd) — the date a list with no day of its own is read on (a picker, a page) */
export const rosterToday = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** a person's home unit on a date (null: nowhere — a shared store's person with no home row) */
export const homeUnitOf = (pid: unknown, iso: string = rosterToday()): string | null =>
  HOME_OF ? HOME_OF(String(pid ?? ''), iso) : BOOT_UNIT

/** a placeholder body (ALL AVAIL, ALL) — on every unit's roster */
export const isSentinel = (id: unknown): boolean => {
  const k = String(id ?? '')
  return k === 'all' || k === 'allavail' || !!((PEOPLE as any)[k] && (PEOPLE as any)[k].special)
}

/** is `id` on unit `unit`'s roster on `iso` */
export const onRosterOf = (id: unknown, unit: string, iso: string = rosterToday()): boolean =>
  isSentinel(id) || homeUnitOf(id, iso) === unit

/** THE ONE ENUMERATION: every person (archived, deleted and the placeholders included — each caller filters as it did)
    whose home unit on `iso` is `unit`, in the list's own order */
export function rosterOf(unit: string, iso: string = rosterToday()): string[] {
  return Object.keys(PEOPLE).filter(id => onRosterOf(id, unit, iso))
}

/** the same roster as a people record (id → the person, the very objects PEOPLE holds) — for a model that takes a
    record to read (ui/sanscal-model.ts sansRoster, sansDayGroups) */
export function unitPeople(unit: string, iso: string = rosterToday()): Record<string, any> {
  const out: Record<string, any> = {}
  for (const id of rosterOf(unit, iso)) out[id] = (PEOPLE as any)[id]
  return out
}
