/* RULES-FIRST REVIEW, family 4 — availability, absences and inputs against a seat (W40–W53)
   ([ENGINE-RULES-REVIEW], D1983, 11 Nov 26). One test per worklist item, each led by the ruling's own words, on a small
   made-up day through the engine's own doors (validate, slotBar, personBusy, availableFor, the medical planners). Items
   whose ruled behaviour an existing test already holds whole are named in the review's results, not duplicated here.
   Harness: the same as rulesfirst-3-crew-rest.test.ts (every day emptied, the inputs cleared, the book reset). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, isAway, isLateInput } from './inputs'
import { SCHED } from './publish'
import { VCONF } from './rules'
import { PEOPLE } from './people'
import { validate } from './validate'
import { slotBar, personBusy, sansGate } from './avail'
import { makeStandalone } from './waves'
import { upchitTrimPlan, upchitDeletePlan } from './medical'
import { availableFor } from '../leavewar/sync'
import { initStore as lwInitStore, setPeople } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { projectPeople } from '../leavewar/state/raptorRoster'

const saved = { d: JSON.stringify(DAYS), i: JSON.stringify(INPUTS), book: JSON.stringify(SCHED), v: { ...VCONF } }
const h = (hh: number, mm = 0) => hh * 60 + mm
const MON = 0, TUE = 1, WED = 2
const DT = ['Jul 13', 'Jul 14', 'Jul 15', 'Jul 16', 'Jul 17', 'Jul 18', 'Jul 19']
const TUE_ISO = '2026-07-14'
const X = 'split'            // a pilot, not SANS
const day = (di: number): any => DAYS[di]
/* one flying line on `di`; answers its FCP key and the formation */
const line = (di: number, to: string, ld: string, p = X) => {
  const f: any = { cs: 'VL', msn: 'BFM', to, ld, br: '', rl: '', aircraft: [{ p, w: '', area: '', rmks: '', opts: {} }] }
  day(di).waves.push({ label: 'WAVE 1', night: false, intimes: [], traffic: [], formations: [f] })
  return { key: `${di}.${day(di).waves.length - 1}.0.0.p`, f }
}
const inp = (di: number, type: string, more: any = {}, person = X) => {
  const r: any = { person, date: DT[di], allday: false, type, remarks: '', mod: '', ...more }
  INPUTS.push(r); return r
}
const ABS = ['LEAVE_FLY', 'DNIF_FLY', 'INPUT_FLY', 'SHIFT_SOFT']
const warns = (di: number, id: string, codes: string[] | null = ABS) => validate().all.filter((x: any) => x.di === di
  && (x.who || []).includes(id) && (!codes || codes.includes(x.code)))
const codes = (di: number, id: string, cs: string[] | null = ABS) => warns(di, id, cs).map((x: any) => `${x.sev}:${x.code}`).sort()

beforeEach(() => {
  Object.assign(VCONF, { briefLead: 140, step: 60, dekit: 30, reportLead: 180, debrief: 120, openEnd: 60 })
  DAYS.forEach((d: any) => Object.assign(d, { waves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [], dutywaves: [] }))
  INPUTS.splice(0); Object.assign(SCHED, { orig: {}, cur: {}, als: [], pending: {}, changes: {}, dayOK: {}, sign: {} })
})
afterEach(() => {
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d)); INPUTS.splice(0, INPUTS.length, ...JSON.parse(saved.i))
  Object.keys(SCHED).forEach(k => delete SCHED[k]); Object.assign(SCHED, JSON.parse(saved.book)); Object.assign(VCONF, saved.v)
})

describe('W40 — a whole-day absence flags a seat with no times; a part-day one stays silent (D605)', () => {
  it('a Mon–Wed leave flags a blank line on Tuesday; an overnight Mon 22:00–02:00 absence does not; edited to part-day or deleted after the seat was filled, the flag goes', () => {
    line(TUE, '', '')                                               // "+ Line": no take-off, no landing
    const lv = inp(MON, 'LL', { allday: true, endDate: 'Jul 15' })
    expect(codes(TUE, X), 'the middle day of a several-day leave is a whole day').toEqual(['hard:LEAVE_FLY'])
    INPUTS.splice(0)
    inp(MON, 'OL', { s: h(22), e: h(2) })                           // crosses into Tuesday: a part of Tuesday only
    expect(codes(TUE, X), '"never the day before\'s absence" — the tail is part-day, nothing to compare').toEqual([])
    INPUTS.splice(0)
    const r = inp(TUE, 'LL', { allday: true })
    expect(codes(TUE, X)).toEqual(['hard:LEAVE_FLY'])
    Object.assign(r, { allday: false, s: h(8), e: h(12) })          // edited after the seat was filled
    expect(codes(TUE, X), 'a part-day absence against a seat with no times stays silent').toEqual([])
    Object.assign(r, { s: 0, e: 1439 })                             // typed 00:00–23:59 counts as whole
    expect(codes(TUE, X)).toEqual(['hard:LEAVE_FLY'])
    INPUTS.splice(0)
    expect(codes(TUE, X), 'deleted: nothing left to flag').toEqual([])
  })
})

describe('W41 — availability is step to dekit, never widened to the report or the debrief (D36)', () => {
  it('his busy window on a sortie is exactly step→dekit; on a standby shift exactly its hours', () => {
    line(TUE, '12:00', '13:00')
    expect(personBusy(day(TUE), X)).toEqual([[h(11), h(13, 30)]])
    const w: any = makeStandalone('sc'); w.formations[0].aircraft[0].p = 'bane'; day(TUE).waves.push(w)
    expect(personBusy(day(TUE), 'bane'), 'a shift is not padded').toEqual([[h(7), h(13)]])
  })
})

describe('W42/W43 — ALL AVAIL is who has nothing else on the programme then, worked out live (D27, D37, D702; [ALL-AVAIL-REDEF])', () => {
  beforeEach(() => { lwInitStore(memoryBackend()); setPeople(projectPeople()) })
  const crowd = (w: [number, number]) => availableFor(TUE_ISO, w, day(TUE))

  it('W42: ATT B in, leave out, ground crew out, a SANS man out until planned with us, a time clash out — and the equal-time edge in', () => {
    const W: [number, number] = [h(14), h(15)]
    inp(TUE, 'ATT B', { allday: true }, 'bane')
    inp(TUE, 'LL', { allday: true }, 'freak')
    line(TUE, '15:30', '16:30', 'harpoon')                          // step 14:30 — inside the window
    line(TUE, '16:00', '17:00', X)                                  // step 15:00 — touches the window's end only
    const c = crowd(W)
    expect(c, 'ATT B: grounded, not absent').toContain('bane')
    expect(c, 'leave keeps him out').not.toContain('freak')
    expect(c, 'a time clash keeps him out').not.toContain('harpoon')
    expect(c, 'a step at the window\'s very end is no clash').toContain(X)
    expect(c, 'no ground crew').not.toContain('torque')
    expect(c, 'a SANS man not on our programme today').not.toContain('krait')
    expect(c.every(id => !(PEOPLE as any)[id].special), 'a placeholder is never a member of the crowd').toBe(true)
  })

  it('W43: an input filed FOR ALL AVAIL keeps nobody out, and its crowd changes as the day changes', () => {
    const W: [number, number] = [h(10), h(12)]
    inp(TUE, 'Training', { s: h(10), e: h(12) }, 'allavail')
    const before = crowd(W)
    expect(before, 'no line of its own, so nobody is kept out by it').toContain(X)
    line(TUE, '11:30', '12:30', X)                                  // he is tasked across it
    expect(crowd(W), 'worked out live: now he is out').not.toContain(X)
    day(TUE).waves.splice(0)
    expect(crowd(W), 'and back in when the task goes').toContain(X)
  })
})

describe('W44 — Event and Personal clash red across a standby shift, never Meeting\'s amber (D713, D714, D778)', () => {
  it('on an SC MAIN 07:00–13:00: Event red, Personal red ("the same as an Event"), Meeting amber', () => {
    const w: any = makeStandalone('sc'); w.formations[0].aircraft[0].p = X; day(TUE).waves.push(w)
    const r = inp(TUE, 'Event', { s: h(10), e: h(11) })
    expect(codes(TUE, X)).toEqual(['hard:INPUT_FLY'])
    r.type = 'Personal'
    expect(codes(TUE, X), 'D778: Personal is the same as an Event for everything about people').toEqual(['hard:INPUT_FLY'])
    r.type = 'Meeting'
    expect(codes(TUE, X), 'the one soft kind').toEqual(['adv:SHIFT_SOFT'])
  })
})

describe('W45 — an overseas duty a scheduler rejects counts him in, on the crew list and the warning list alike (D1393, D1390, D1381)', () => {
  it('filed: away, refused by the picker, a red clash; rejected: in, the picker silent, no warning', () => {
    const { key } = line(TUE, '12:00', '13:00')
    const od = inp(TUE, 'OD', { allday: true, title: 'Exercise' })
    expect(isAway(od)).toBe(true)
    expect(slotBar(X, key), 'the crew list strikes him').not.toBe('')
    expect(codes(TUE, X), 'an overseas duty speaks as INPUT_FLY').toEqual(['hard:INPUT_FLY'])
    od.acc = 'r'
    expect(isAway(od), 'rejected: he counts in').toBe(false)
    expect(slotBar(X, key), 'the crew list counts him in').toBe('')
    expect(codes(TUE, X), 'and the warning list agrees — a rejected request is dormant').toEqual([])
  })
})

describe('W47 — a row with a start and no end is read over the Logic tab\'s one-hour default (D360, D361)', () => {
  it('as built: a NAMED man on a 10:00 row with no end is busy 10:00–11:00 — the same assumed hour the crowd is counted over; the setting moves both', () => {
    day(TUE).ground.push({ prog: 'DINNER WITH CMD', str: '1000', end: '', who: X })
    expect(personBusy(day(TUE), X)).toEqual([[h(10), h(11)]])
    line(TUE, '12:00', '13:00')                                     // step 11:00 — the equal-time edge
    expect(warns(TUE, X, null).filter((x: any) => x.sev === 'hard').map((x: any) => x.code), 'step at the assumed end: no clash').toEqual([])
    VCONF.openEnd = 90
    expect(personBusy(day(TUE), X).find((w: any) => w[0] === h(10))).toEqual([h(10), h(11, 30)])
    expect(warns(TUE, X, null).filter((x: any) => x.sev === 'hard').length, 'the setting widens the named man\'s row too').toBeGreaterThan(0)
  })
})

describe('W48 — the LATE mark is a mark, never a warning: unseen by the rules engine (D742, D739, D740)', () => {
  it('the same meeting filed late and on time raises exactly the same warnings and the same crew-list answer; a downchit never reads late', () => {
    const { key } = line(TUE, '12:00', '13:00')
    const r = inp(TUE, 'Meeting', { s: h(11), e: h(12), mod: '2026-07-14' })
    expect(isLateInput(r), 'filed on the day itself: late').toBe(true)
    const late = { w: codes(TUE, X, null), bar: slotBar(X, key) }
    r.mod = '2026-06-01'
    expect(isLateInput(r)).toBe(false)
    expect({ w: codes(TUE, X, null), bar: slotBar(X, key) }, 'late or not, the engine says the same').toEqual(late)
    expect(isLateInput({ ...r, type: 'HL', mod: '2026-07-14' }), 'a downchit never reads late').toBe(false)
  })
})

describe('W49 — an Attach under Unavailable clashes as a Meeting does, on its stated times only — no padding on any input (settled, Aug 26)', () => {
  it('Attach (Unavailable) and Meeting give the same warnings at the same hours; ending exactly at the step is no clash', () => {
    line(TUE, '12:00', '13:00')                                     // step 11:00
    const r = inp(TUE, 'Attach', { s: h(10), e: h(11), acc: 'u' })
    expect(isAway(r)).toBe(true)
    const atStep = codes(TUE, X, null)
    expect(atStep, 'ends at the step: no INPUT_FLY — nothing added to its stated hours').not.toContain('hard:INPUT_FLY')
    expect(atStep, 'it eats the brief window, as a Meeting does').toEqual(['adv:NO_BRIEF'])
    r.e = h(11, 1)
    const attach = codes(TUE, X, null)
    expect(attach).toContain('hard:INPUT_FLY')
    r.type = 'Meeting'; delete r.acc
    expect(codes(TUE, X, null), 'the same as a Meeting').toEqual(attach)
    r.e = h(11)
    expect(codes(TUE, X, null), 'and at the step, the same as a Meeting').toEqual(atStep)
  })
})

describe('W50 — a morning absence does not free a sortie that walks before noon: the picker and the warning list both pad to the step (settled, 10 Aug 26)', () => {
  it('absence 08:00–10:30 against a 11:00 take-off (step 10:00): both refuse; 08:00–10:00: both silent', () => {
    const { key } = line(TUE, '11:00', '12:00')
    const r = inp(TUE, 'OL', { s: h(8), e: h(10, 30) })
    expect(slotBar(X, key)).not.toBe('')
    expect(codes(TUE, X)).toEqual(['hard:LEAVE_FLY'])
    r.e = h(10)
    expect(slotBar(X, key)).toBe('')
    expect(codes(TUE, X)).toEqual([])
  })
})

describe('W51 — sansGate is the one judge; a flying seat is judged from its in-time front edge (settled, 14 Aug / 26 Aug 26)', () => {
  /* krait is SANS; he offers to fly 10:30–23:59. One sortie, take-off 12:00 (step 11:00), NO in-time published. */
  const offer = () => INPUTS.push({ person: 'krait', date: DT[TUE], allday: false, s: h(10, 30), e: h(23, 59), type: 'SANS Availability', sans: { f: true }, mod: 'now' } as any)
  it('no in-time published: the picker and the warning list judge the same window', () => {
    offer()
    const { key } = line(TUE, '12:00', '13:00', 'krait')
    const picker = slotBar('krait', key)
    const list = warns(TUE, 'krait', ['SANS_AVAIL']).map((x: any) => x.msg)
    expect({ picker: picker === '' ? 'clear' : 'barred', list: list.length ? 'advisory' : 'clear' }).toEqual({ picker: 'clear', list: 'clear' })
    expect(sansGate('krait', DT[TUE], 'fly', h(11), h(13, 30)).status, 'step→dekit inside the offer').toBe('ok')
  })
  it('an in-time published at 10:00 opens the window there, for both', () => {
    offer()
    const { key, f } = line(TUE, '12:00', '13:00', 'krait')
    day(TUE).waves[0].intimes = ['10:00 IN TIME']
    void f
    expect(slotBar('krait', key), 'the picker reads the in-time').not.toBe('')
    expect(warns(TUE, 'krait', ['SANS_AVAIL']).length, 'and so does the warning list').toBe(1)
  })
})

describe('W53 — the medical trim rules: an upchit on X marks him fit on X; moved later or deleted, it gives the days back (settled 27 Aug 26; D999, D1022)', () => {
  it('down 10–13 Jul, upchit 12 Jul → cut to 10–11 Jul; a downchit starting after X untouched; the cut row, its upchit deleted, grows back to its first end', () => {
    const dn: any = { person: X, date: 'Jul 10', endDate: 'Jul 13', yr: 2026, allday: true, type: 'HL', remarks: '', mod: '' }
    const later: any = { person: X, date: 'Jul 20', endDate: 'Jul 22', yr: 2026, allday: true, type: 'OML', remarks: '', mod: '' }
    INPUTS.push(dn, later)
    const plan = upchitTrimPlan(X, 20260712)
    expect(plan.map((p: any) => [p.row === dn, p.action, p.newEndOrd])).toEqual([[true, 'trim', 20260711]])
    expect(upchitTrimPlan(X, 20260710).map((p: any) => p.action), 'a row left covering only fit days is removed').toEqual(['delete'])
    Object.assign(dn, { endDate: 'Jul 11', firstEnd: '2026-07-13' })   // the cut, as applyMedPlan writes it
    const up: any = { person: X, date: 'Jul 12', yr: 2026, allday: true, type: 'Upchit', remarks: '', mod: '' }
    INPUTS.push(up)
    expect(upchitDeletePlan(up).map((p: any) => [p.row === dn, p.action, p.newEndOrd])).toEqual([[true, 'grow', 20260713]])
  })
})
