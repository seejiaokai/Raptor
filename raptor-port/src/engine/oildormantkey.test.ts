/* TWO OLDER FAULTS OF A PUBLISHED DAY'S COMPARISON, FOUND BY THE WALK OF THE ALL AVAIL / EVENT CHECK (walker C, 9 Oct 26 —
   docs/handpass/2026-10-09-all-avail-event-check.md §5.3). Neither is in code that job changed (both are on `main`);
   both make a published day read "1 pending" and take its four sign-offs down for nothing.

   1. A REQUEST TAKEN OFF ON A WEEKEND. Owner, D174 (25 Sep 26): "a request that was not there when the day was
      published, filed since and then taken off, is no pending change — the day reads 0"; D176: one taken off at
      publication and since deleted is none either. On a working day that held. On a day that EARNS it did not: the
      day's OIL comparison keyed every request covering the date, a dormant one included — which earns nobody anything
      — so its mere presence read "What this day earns changed". A dormant request is now in neither side's key.

   2. A MAN WHO WAS ONLY BEHIND A PLACEHOLDER, ARCHIVED SINCE. Owner, D327 (28 Sep 26): "an archived man stays in the ALL
      AVAIL crowd on every day before his archive — the crowd on a day already published stays as it went out, and
      nothing reads pending for it." The issued face keeps the roster details of every man it draws, the crowd's
      included, and compared "posted out" for all of them — so archiving a man who was merely FREE that day made the
      day read "Ranger · posted out: no → yes". For a man who is there only as one of a crowd, "posted out" is not
      kept and not compared; a man NAMED on the day still reads pending when he is archived (D321). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { PEOPLE } from './people'
import { HOOKS } from './hooks'
import { SCHED, dayPeopleAttrs, peopleAttrsNow } from './publish'
import { ensureRowIds } from './rowids'
import { oilEvidence, oilEvidenceKey, oilMovedInputsOnly } from './oilev'

const DSNAP = JSON.stringify(DAYS), ISNAP = JSON.stringify(INPUTS), PSNAP = JSON.stringify(PEOPLE)
const SAT = 5, SAT_ISO = '2026-07-18'
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, JSON.parse(PSNAP))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []; SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  Object.assign(DAYS[SAT] as any, { waves: [], dutywaves: [], sims: {}, ground: [], allhands: [], oild: undefined })
  ensureRowIds(DAYS)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => ['stiff', 'plasma']
})
afterEach(() => { HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel })

const claim = (r: any) => { INPUTS.unshift({ remarks: '', mod: 'now', yr: 2026, type: 'Duty', date: 'Jul 18', allday: false, s: 540, e: 720, oil: { [SAT_ISO]: 0.5 }, ...r }); return INPUTS[0] }
const key = () => oilEvidenceKey(oilEvidence(SAT), DAYS[SAT])

describe('D174, D176 — a request taken off the programme is no change to what an earning day earns', () => {
  for (const person of ['bane', 'allavail']) {
    it(`${person}: filed since publication and taken off — the day's OIL comparison is as it went out`, () => {
      const issued = key(), evWas = oilEvidence(SAT), dayWas = JSON.parse(JSON.stringify(DAYS[SAT]))
      claim({ iid: 'rq1', person, acc: 'r' })
      expect(key(), 'a dormant request earns nobody anything, and is in neither side of the comparison').toBe(issued)
      const moved = oilMovedInputsOnly(oilEvidence(SAT), DAYS[SAT], evWas, dayWas)
      expect(moved ? moved.iids : [], 'and it is not named as an input whose OIL moved (null = nothing moved at all)').toEqual([])
    })

    it(`${person}: taken off at publication and DELETED since — still as it went out`, () => {
      claim({ iid: 'rq1', person, acc: 'r' })
      const issued = key()
      INPUTS.shift()
      expect(key()).toBe(issued)
    })

    it(`${person}: THE CONTROL — a request that stands on the programme is a change, and taking a published one off is too`, () => {
      const empty = key()
      const r = claim({ iid: 'rq1', person, acc: 'g' })
      ;(DAYS[SAT] as any).ground = [{ prog: 'Duty', str: '0900', end: '1200', who: person, src: 'rq1' }]; ensureRowIds(DAYS)
      const landed = key()
      expect(landed, 'a landed request moves the key').not.toBe(empty)
      r.acc = 'r'; (DAYS[SAT] as any).ground = []
      expect(key(), 'taken off after it went out WITH it: a change (D114)').not.toBe(landed)
    })
  }
})

/* ASTRA'S READ OF THE CODE (9 Oct 26): the first repair above was incomplete. A scheduler's switch about ONE MAN on a
   request (`oild.people['<man>|i:<request>']`) is ignored on read while the request stands without its row, and counted
   again once the request is deleted — so deleting a taken-off request that had ever had a man switched read "1 pending"
   and broke the sign-offs, with nobody's OIL moved. A decision about a request that is not on the programme (dormant,
   or gone) is in neither side of the comparison; the decision itself is KEPT, for Undo and for putting the request back. */
describe('D176 — a switch about a request that is off the programme, or gone, is no change either', () => {
  for (const [who, dec] of [['stiff', 'deny'], ['stiff', 'allow'], ['divot', 'deny']] as Array<[string, string]>) {
    it(`a ${dec} for ${who}: taken off, published, then DELETED — the comparison does not move`, () => {
      const r = claim({ iid: 'rq1', person: 'allavail', acc: 'g' })
      ;(DAYS[SAT] as any).ground = [{ prog: 'Duty', str: '0900', end: '1200', who: 'allavail', src: 'rq1', more: who === 'divot' ? ['divot'] : [] }]; ensureRowIds(DAYS)
      ;(DAYS[SAT] as any).oild = { people: { [`${who}|i:rq1`]: dec }, pa: { [`${who}|i:rq1`]: 0 } }
      const standing = key()
      r.acc = 'r'; (DAYS[SAT] as any).ground = []
      const takenOff = key()
      expect(takenOff, 'taking a standing request off IS a change (D114)').not.toBe(standing)
      INPUTS.shift()
      expect(key(), 'deleting it afterwards is none (D176)').toBe(takenOff)
      expect(((DAYS[SAT] as any).oild.people || {})[`${who}|i:rq1`], 'the decision itself is kept, for Undo').toBe(dec)
    })
  }

  it('THE CONTROL — a switch about a request that STANDS still moves the comparison, both ways', () => {
    claim({ iid: 'rq1', person: 'allavail', acc: 'g' })
    ;(DAYS[SAT] as any).ground = [{ prog: 'Duty', str: '0900', end: '1200', who: 'allavail', src: 'rq1' }]; ensureRowIds(DAYS)
    const none = key()
    ;(DAYS[SAT] as any).oild = { people: { 'stiff|i:rq1': 'deny' }, pa: { 'stiff|i:rq1': 0 } }
    expect(key()).not.toBe(none)
  })

  it('…and a switch on an ordinary ROW (not a request) is untouched by this', () => {
    ;(DAYS[SAT] as any).ground = [{ prog: 'BRIEF', str: '0900', end: '1200', who: 'stiff' }]; ensureRowIds(DAYS)
    const rid = (DAYS[SAT] as any).ground[0].rid
    const none = key()
    ;(DAYS[SAT] as any).oild = { people: { [`stiff|r:${rid}`]: 'deny' } }
    expect(key()).not.toBe(none)
  })
})

describe('D327 — archiving a man who was only behind a placeholder leaves the published day as it went out', () => {
  const day = (over: any = {}) => ({ ground: [{ prog: 'Duty', who: 'allavail', src: 'rq1' }], oilev: { sent: { 'i:rq1': ['stiff', 'plasma'] } }, ...over })
  const same = (pa: any) => JSON.stringify(peopleAttrsNow(pa)) === JSON.stringify(pa)

  it('a crowd-only man archived since: nothing differs', () => {
    const pa = dayPeopleAttrs(day())
    expect(Object.keys(pa).sort(), 'the crowd is kept — the window draws their pucks').toEqual(expect.arrayContaining(['plasma', 'stiff']))
    expect(same(pa)).toBe(true)
    ;(PEOPLE as any).plasma.archived = true
    expect(same(pa), 'he was only free that day: his posting is not this day\'s business').toBe(true)
  })

  it('…but his CAT changing still reads as a change — the window draws it (D186)', () => {
    const pa = dayPeopleAttrs(day())
    ;(PEOPLE as any).plasma.q = (PEOPLE as any).plasma.q === 'A' ? 'B' : 'A'
    expect(same(pa)).toBe(false)
  })
  it('…and so does his seat (Sol\'s read: the two were claimed together and only one was proved)', () => {
    const pa = dayPeopleAttrs(day())
    ;(PEOPLE as any).plasma.seat = (PEOPLE as any).plasma.seat === 'RCP' ? 'FCP' : 'RCP'
    expect(same(pa)).toBe(false)
  })

  it('a man NAMED on the day, archived since: it differs (D321) — in a seat, under a row, or as an input\'s own man', () => {
    for (const d of [day({ ground: [{ prog: 'Duty', who: 'allavail', src: 'rq1', more: ['plasma'] }] }), day({ dutywaves: [{ rows: [{ id: 'plasma', role: 'SDO' }] }] })]) {
      const pa = dayPeopleAttrs(d)
      ;(PEOPLE as any).plasma.archived = true
      expect(same(pa), 'named there: his puck on the published face would change').toBe(false)
      ;(PEOPLE as any).plasma.archived = false
    }
    const pa = dayPeopleAttrs(day(), { i1: { person: 'plasma', type: 'LL' } })
    ;(PEOPLE as any).plasma.archived = true
    expect(same(pa)).toBe(false)
  })
})
