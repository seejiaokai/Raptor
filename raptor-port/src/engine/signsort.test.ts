/* [AMEND-SMALL-SEEN] 9 (28 Sep 26) — "SORT" CHANGES NOTHING HE CAN SEE, SO IT MUST NOT TAKE THE FOUR SIGN-OFFS DOWN.
   The ground programme is always SHOWN in time order (order.ts groundOrder) whatever order its rows are stored in; the
   change count is worked out in that shown order, so Sort read "no changes to publish". But the signature bound the rows
   by their STORED positions, so re-ordering the array took all four down — a false re-sign (the amendment re-test's final
   read, Fable #1's mirror). D103: any change that SHOWS takes them down — and so one that does not, must not. The digest
   now binds a copy of the day with its ground rows as shown (publish.ts currentBindNow). What still clears them is pinned
   beside it: a real re-order on screen (a hand order), a time change that moves a row, and the other sections' Sort (they
   are shown in stored order, so their Sort IS a change on screen). */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { SCHED, setSign, signShown, SIGN_ROLES, signOf, setDayApproved, dayDelta } from './publish'
import { sortGround, sortProg } from './reorder'
import { ensureRowIds } from './rowids'

const DSNAP = JSON.stringify(DAYS)
const WHO: Record<string, string> = { cur: 'ignite', sked: 'bane', plan: 'stiff', appr: 'pump' }
const D = 4                                    // Friday — never published in the seed
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
})
const signAll = () => SIGN_ROLES.forEach((r: any) => setSign(D, r[0], WHO[r[0]]))
const shown = () => SIGN_ROLES.map((r: any) => signShown(D)[r[0]])
const allSigned = () => shown().every((w: string, i: number) => w === WHO[SIGN_ROLES[i][0]])
/* rows STORED out of time order: 10:00 first, then 08:00 (the screen shows 08:00, 10:00) */
function outOfOrder(extra: any[] = []) {
  DAYS[D].ground = [
    { prog: 'LATE ROW', str: '10:00', end: '11:00', who: '', rmks: '' },
    { prog: 'EARLY ROW', str: '08:00', end: '09:00', who: '', rmks: '' },
    ...extra,
  ]
  DAYS[D].gman = false
  ensureRowIds(DAYS)
}

describe('Sort on a ground programme stored out of time order', () => {
  it('keeps all four sign-offs — nothing on screen moved', () => {
    outOfOrder()
    signAll()
    expect(allSigned(), 'signed').toBe(true)
    expect(sortGround(D), 'Sort re-ordered the stored rows').toBeTruthy()
    expect(DAYS[D].ground.map((r: any) => r.prog), 'stored in time order now').toEqual(['EARLY ROW', 'LATE ROW'])
    expect(shown(), 'the four still stand').toEqual(SIGN_ROLES.map((r: any) => WHO[r[0]]))
  })
  it('the same with two rows at the SAME start (a tie keeps its order both ways) and a row with no start (it sinks)', () => {
    outOfOrder([{ prog: 'NO TIME', str: '', end: '', who: '', rmks: '' }, { prog: 'TIE', str: '08:00', end: '08:30', who: '', rmks: '' }])
    signAll()
    sortGround(D)
    expect(allSigned(), 'ties and a time-less row sort as they are shown — the four stand').toBe(true)
  })
})

describe('what still takes them down — a change he can see', () => {
  it('a hand order that moves a row on screen clears them; putting it back restores them', () => {
    outOfOrder(); sortGround(D)                  // stored = shown: EARLY, LATE
    signAll()
    DAYS[D].gman = true                          // the hand order freezes the array as the order on screen…
    DAYS[D].ground.reverse()                     // …and a row is dragged: LATE is now shown first
    expect(allSigned(), 'a real re-order on screen clears the four').toBe(false)
    DAYS[D].ground.reverse()                     // dragged back
    expect(allSigned(), 'put back exactly: they come back').toBe(true)
  })
  it('a time change that moves a row on screen clears them', () => {
    outOfOrder(); signAll()
    DAYS[D].ground[0].str = '07:00'              // LATE ROW now sorts first on screen
    expect(allSigned()).toBe(false)
  })
  it('the Common Programme is shown in STORED order, so its Sort IS a change on screen — it clears them', () => {
    DAYS[D].allhands = [
      { prog: 'LATER', str: '15:00', end: '16:00', who: [] },
      { prog: 'EARLIER', str: '09:00', end: '10:00', who: [] },
    ]
    ensureRowIds(DAYS)
    signAll()
    expect(allSigned()).toBe(true)
    expect(sortProg(D)).toBeTruthy()
    expect(allSigned(), 'the programme re-ordered on screen — sign again').toBe(false)
  })
})

/* ON A PUBLISHED DAY WITH CHANGES WAITING (found by the walk, scripts/handpass/sf/sf-d9-sort.mjs, 28 Sep 26). There the
   signature also binds the pending comparison (D103, `pd`), which names an added ground row by its STORED position — so
   "Sort" renamed the waiting rows and the four fell although nothing on screen moved and "2 pending" held. The pending
   key now names a current ground row by its id; the issued day's own positions (a delete, a removed extra) never move. */
describe('Sort on a PUBLISHED day with ground rows waiting to go out', () => {
  const P = 1                                   // Tuesday
  const signP = () => SIGN_ROLES.forEach((r: any) => setSign(P, r[0], WHO[r[0]]))
  const shownP = () => SIGN_ROLES.map((r: any) => signShown(P)[r[0]])
  const heldP = () => shownP().every((w: string, i: number) => w === WHO[SIGN_ROLES[i][0]])
  const publishP = () => { ensureRowIds(DAYS); const g = signOf(P); Object.assign(g, WHO); setDayApproved(P, true) }
  it('two rows added in the wrong order: Sort keeps the four (nothing shown moved, the count holds)', () => {
    publishP()
    DAYS[P].ground.push({ prog: 'SF LATE ROW', str: '10:00', end: '', who: '', rmks: '' })
    DAYS[P].ground.push({ prog: 'SF EARLY ROW', str: '08:00', end: '', who: '', rmks: '' })
    DAYS[P].gman = false; ensureRowIds(DAYS)
    const pending = dayDelta(P).length
    signP()
    expect(heldP(), 'signed over the two waiting rows').toBe(true)
    expect(sortGround(P), 'Sort re-ordered the stored rows').toBeTruthy()
    expect(dayDelta(P).length, 'the count holds').toBe(pending)
    expect(heldP(), 'and so do the four').toBe(true)
  })
  it('an extra taken off a ground row (a line naming the ISSUED row): Sort keeps the four', () => {
    const i = DAYS[P].ground.findIndex((r: any) => r && r.str)
    DAYS[P].ground[i].more = ['bane']
    publishP()
    DAYS[P].ground[i].more = []                  // the extra comes off — a line in the comparison
    DAYS[P].ground.push({ prog: 'SF EARLY ROW', str: '00:30', end: '', who: '', rmks: '' })   // a row stored last, shown first
    DAYS[P].gman = false; ensureRowIds(DAYS)
    signP()
    expect(heldP()).toBe(true)
    sortGround(P)
    expect(heldP(), 'the removed extra is named by its issued place, which Sort cannot move').toBe(true)
  })
  it('THE CONTROL — a change made after signing still clears them', () => {
    publishP()
    DAYS[P].ground.push({ prog: 'SF ROW', str: '10:00', end: '', who: '', rmks: '' }); ensureRowIds(DAYS)
    signP()
    DAYS[P].ground[DAYS[P].ground.length - 1].prog = 'SF ROW RENAMED'
    expect(heldP()).toBe(false)
  })
})
