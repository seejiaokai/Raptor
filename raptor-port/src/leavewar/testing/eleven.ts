/* THE ELEVEN COUNTERS THE LEAVE WAR USED TO START WITH — kept for the TESTS, and only for them.

   Until D669 (owner, 8 Oct 26 — "should there be a default counter? I think there shouldn't be and the user can create
   what they want") the Manning block opened with these eleven count rows, built into the app (`engine/seed.ts
   seedRequirements`). It now opens with NONE: a squadron makes the counters it wants with "+ Counter".

   A great many tests are ABOUT counters — what a row counts, when it goes amber or red, which days read
   "under-manned", the Manning sheet, the counter form, dragging rows in Rearrange — and were written against these
   eleven. They are not kept alive as a hidden default: the app those tests run starts empty, exactly as it ships, and
   a test that needs counters MAKES them, through the same writer the "+ Counter" form saves with
   (`state/store.ts saveManningRule` — `testkit.ts elevenCounters()` for the unit suites, `e2e/app.ts elevenCounters()`
   for the browser tests, each of which says so where it calls it).

   Pure data, no imports beyond a type: the browser tests read it in Node and hand it to the page. Nothing in the app
   imports this file — it is not in the bundle. The definitions are the seed's own, word for word, as they stood on
   8 Oct 26 (D138): the SC rows lean on nothing but the counter form's own vocabulary (a team of slots, each a seat and
   a qualification), so a squadron can make them like any other. */
import type { ManningRule } from '../engine'

/* The instructor rungs of the CAT ladder, and the flight-lead rungs (CAT B and above, instructors included). */
const INSTR_CATS = ['FI', 'IR', 'IP', 'IW']
const LEAD_CATS = ['FI', 'IR', 'IP', 'A', 'B']

// One team of SC cover, spelt out for the tap-a-row sheet. The wording is the
// owner's own combination (19 Aug 26): "2 pilot SC day qualified and 2 WSO sc
// day qualified. And a SXO. And any crew, not including ground crew."
const SC_TEAM = (kind: string) =>
  `One team is 2 SC ${kind} qualified pilots + 2 SC ${kind} qualified WSOs + 1 SXO + 1 more crew (pilot or WSO, any CAT) — six different people, ground crew never counted. The day's number is how many complete teams can still be manned; someone standing SC duty still counts, they are at work.`

// The SC cover recipe as team slots (owner, 19 Aug 26): presence counts —
// someone standing SC duty is at work, not a gap — and the day's number is
// complete teams.
const SC_SLOTS = (qual: string) => [
  { count: 2, filter: { seats: ['pilot' as const], quals: [qual] } },
  { count: 2, filter: { seats: ['wso' as const], quals: [qual] } },
  { count: 1, filter: { quals: ['sxo'] } },
  { count: 1, filter: {} },
]

export const ELEVEN_COUNTERS: readonly ManningRule[] = [
  { id: 'sets', label: 'Crew sets', count: { kind: 'team', slots: [{ count: 1, filter: { seats: ['pilot'] } }, { count: 1, filter: { seats: ['wso'] } }] }, threshold: { amber: 5, red: 4.5 }, desc: 'One set is one pilot plus one WSO — a jet you can crew. The day\'s number is whichever seat runs out first.' },
  { id: 'ip', label: 'IP', count: { kind: 'people', filter: { seats: ['pilot'], cats: INSTR_CATS } }, threshold: { amber: 3, red: 2 }, desc: 'Instructor pilots available.' },
  { id: 'iwso', label: 'IWSO', count: { kind: 'people', filter: { seats: ['wso'], cats: INSTR_CATS } }, threshold: { amber: 3, red: 2 }, desc: 'Instructor WSOs available.' },
  { id: 'instr', label: 'IP + IWSO', count: { kind: 'people', filter: { cats: INSTR_CATS } }, threshold: { amber: 5, red: 4 }, desc: 'Instructor pilots and instructor WSOs together.' },
  { id: 'opsp', label: 'OPSP', count: { kind: 'people', filter: { seats: ['pilot'], notCats: INSTR_CATS } }, threshold: { amber: 4, red: 3 }, desc: 'Ops pilots (CAT A–D, OCU included) available.' },
  { id: 'opsw', label: 'OPSW', count: { kind: 'people', filter: { seats: ['wso'], notCats: INSTR_CATS } }, threshold: { amber: 4, red: 3 }, desc: 'Ops WSOs (CAT A–D, OCU included) available.' },
  { id: 'flp', label: 'FL P', count: { kind: 'people', filter: { seats: ['pilot'], cats: LEAD_CATS } }, threshold: { amber: 0, red: 0 }, desc: 'Flight-lead pilots — CAT B and above, instructors included.' },
  { id: 'wmp', label: 'WM P', count: { kind: 'people', filter: { seats: ['pilot'], notCats: LEAD_CATS } }, threshold: { amber: 0, red: 0 }, desc: 'Wingman pilots — CAT C and below.' },
  { id: 'sxo', label: 'SXO', count: { kind: 'people', filter: { quals: ['sxo'] } }, threshold: { amber: 1, red: 1 }, desc: 'SXO-qualified crew available, counted on top of their own category.' },
  { id: 'scd', label: 'SC D', count: { kind: 'team', slots: SC_SLOTS('scDay'), presence: true }, threshold: { amber: 1, red: 1 }, desc: SC_TEAM('Day') },
  { id: 'scn', label: 'SC N', count: { kind: 'team', slots: SC_SLOTS('scNight'), presence: true }, threshold: { amber: 1, red: 1 }, desc: `${SC_TEAM('Night')} SC Night is the AVALON cover.` },
]
