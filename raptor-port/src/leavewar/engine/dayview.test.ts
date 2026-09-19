// [ARCH-STACK] step 4 phase 1 — the day view: one box from several records.
// Each case is an owner rule (clash catalogue 19 Sep 26 + clash check 20 Sep 26).
import { describe, it, expect } from 'vitest'
import { dayView, AM, PM, FULL, type Contrib, type Win } from './dayview'

const hm = (h: number, m = 0) => h * 60 + m
const ab = (id: string, code: string, win: Win = FULL, extra: Partial<Contrib> = {}): Contrib => ({ id, kind: 'absence', code, win, ...extra })
const rq = (id: string, code: string, state: Contrib['state'] = 'pending', win: Win = FULL): Contrib => ({ id, kind: 'request', code, win, state })
const cr = (id: string, code: 'FO' | 'HO', win: Win = FULL): Contrib => ({ id, kind: 'credit', code, win })
const nt = (id: string, code: string): Contrib => ({ id, kind: 'notice', code, win: FULL })
const charged = (v: ReturnType<typeof dayView>) => Object.fromEntries(v.charges.map(c => [c.code, c.amount]))

describe('the main code (agreed ladder)', () => {
  it('an empty day is blank', () => {
    const v = dayView([])
    expect(v.code).toBeNull(); expect(v.mark).toBe(''); expect(v.away).toBe(0)
  })

  it('one full-day leave shows its code, approved, no mark', () => {
    const v = dayView([ab('i1', 'LL')])
    expect([v.code, v.state, v.mark]).toEqual(['LL', 'approved', ''])
  })

  it('morning LL + afternoon ATT C → *LL with grey +1 (leave over sick)', () => {
    const v = dayView([ab('m', 'ATTC', PM), ab('l', 'LL', AM)])
    expect(v.code).toBe('*LL'); expect(v.mark).toBe('+1'); expect(v.amber).toBe(false)
    expect(v.all.map(c => c.id)).toEqual(['l', 'm'])
  })

  it('the ladder: leave > sick > OIL credit > OD/CSE > ATT B > undecided bid > refused bid', () => {
    const all = [rq('r', 'OL', 'refused', PM), rq('p', 'LL', 'pending', PM), ab('b', 'ATTB', PM),
      ab('o', 'OD', PM), cr('c', 'HO', AM), ab('s', 'HL', PM), ab('l', 'LL', AM)]
    expect(dayView(all).all.map(c => c.id)).toEqual(['l', 's', 'c', 'o', 'b', 'p', 'r'])
  })

  it('a full day beats a half at the same level; between halves the morning shows', () => {
    expect(dayView([ab('a', 'OD', AM), ab('f', 'CSE', FULL)]).main!.id).toBe('f')
    expect(dayView([ab('p', 'LL', PM), ab('a', 'OL', AM)]).code).toBe('*OL')
  })

  it('two leaves in one morning: the earlier start shows (owner, 20 Sep 26)', () => {
    const v = dayView([ab('ol', 'OL', [hm(10, 30), hm(11, 30)]), ab('ll', 'LL', [hm(8), hm(10)])])
    expect(v.code).toBe('*LL'); expect(v.mark).toBe('+1')
  })

  it('leave during OD shows the leave, OD behind +1 (owner Q8)', () => {
    const v = dayView([ab('od', 'OD'), ab('ll', 'LL')])
    expect(v.code).toBe('LL'); expect(v.mark).toBe('+1'); expect(v.amber).toBe(false)
  })

  it('an undecided bid only shows when nothing else is there; its state is its colour', () => {
    expect(dayView([rq('p', 'LL', 'acknowledged')]).state).toBe('acknowledged')
    const v = dayView([rq('p', 'LL', 'pending', PM), ab('c', 'CSE', AM)])
    expect(v.code).toBe('CSE'); expect(v.state).toBe('approved')
  })
})

describe('the amber "!" — only for what an admin must resolve', () => {
  it('two leaves at overlapping times', () => {
    expect(dayView([ab('a', 'LL', [hm(8), hm(10)]), ab('b', 'OL', [hm(9, 30), hm(11)])]).mark).toBe('!')
  })
  it('two leaves in one morning at times that do NOT overlap stay grey', () => {
    expect(dayView([ab('a', 'LL', [hm(8), hm(10)]), ab('b', 'OL', [hm(10, 30), hm(11, 30)])]).mark).toBe('+1')
  })
  it('ATT C over a worked time (owner Q6); ATT B + work is fine', () => {
    expect(dayView([ab('c', 'ATTC', AM), cr('w', 'HO', [hm(8), hm(11, 30)])]).amber).toBe(true)
    expect(dayView([ab('b', 'ATTB', AM), cr('w', 'HO', [hm(8), hm(11, 30)])]).amber).toBe(false)
  })
  it('worked Saturday morning + afternoon leave is grey; leave over the work time is amber', () => {
    expect(dayView([cr('w', 'HO', [hm(8), hm(11)]), ab('l', 'LL', PM)]).mark).toBe('+1')
    expect(dayView([cr('w', 'HO', [hm(8), hm(11)]), ab('l', 'LL', AM)]).amber).toBe(true)
  })
  it('an end at 12:00 and a start at 12:01 do not overlap', () => {
    expect(dayView([ab('a', 'LL', [hm(8), hm(12)]), ab('b', 'OL', [hm(12, 1), hm(14)])]).amber).toBe(false)
  })
  it('a refused bid is history and clashes with nothing', () => {
    expect(dayView([rq('r', 'OL', 'refused'), ab('l', 'LL')]).mark).toBe('+1')
  })
  it('a replaced-bid notice turns the day amber until seen, but is never the main code', () => {
    const v = dayView([ab('c', 'ATTC'), nt('n', 'LL')])
    expect(v.code).toBe('ATTC'); expect(v.mark).toBe('!')
  })
  it('course or OD with leave is grey, never amber', () => {
    expect(dayView([ab('c', 'CSE'), ab('o', 'OD'), ab('l', 'LL')]).mark).toBe('+2')
  })
  it('an overnight tail from the day before counts for clashes but is not shown or charged', () => {
    const v = dayView([ab('prev', 'LL', [0, hm(2)], { spill: true }), ab('c', 'OL', AM)])
    expect(v.amber).toBe(true); expect(v.all.map(c => c.id)).toEqual(['c']); expect(charged(v)).toEqual({ OL: 0.5 })
  })
})

describe('what the day costs', () => {
  it('each half charges its own leave: AM LL + PM OIL = half annual + half OIL', () => {
    const v = dayView([ab('l', 'LL', AM), ab('o', 'OIL', PM)])
    expect(v.charges).toEqual(expect.arrayContaining([
      { counter: 'annual', amount: 0.5, code: 'LL', id: 'l' },
      { counter: 'oil', amount: 0.5, code: 'OIL', id: 'o' },
    ]))
  })
  it('a morning shared by LL 08–10 and OL 10:30–11:30 is charged ONCE — half a day (owner, 20 Sep 26)', () => {
    const v = dayView([ab('ll', 'LL', [hm(8), hm(10)]), ab('ol', 'OL', [hm(10, 30), hm(11, 30)])])
    expect(v.charges).toEqual([{ counter: 'annual', amount: 0.5, code: 'LL', id: 'll' }])
  })
  it('a shared half on different balances: the leave covering MORE time pays (answer D)', () => {
    const v = dayView([ab('oil', 'OIL', [hm(10, 30), hm(11, 30)]), ab('ll', 'LL', [hm(8), hm(10)])])
    expect(charged(v)).toEqual({ LL: 0.5 })
  })
  it('… a tie goes to the earlier one', () => {
    const v = dayView([ab('oil', 'OIL', [hm(10), hm(11)]), ab('ll', 'LL', [hm(8), hm(9)])])
    expect(charged(v)).toEqual({ LL: 0.5 })
  })
  it('a full-day leave charges one day to its own balance', () => {
    expect(dayView([ab('l', 'CCL')]).charges).toEqual([{ counter: 'ccl', amount: 1, code: 'CCL', id: 'l' }])
  })
  it('medical, course, OD and credits charge no leave', () => {
    expect(dayView([ab('c', 'ATTC', AM), ab('o', 'OD', PM), cr('w', 'FO')]).charges).toEqual([])
  })
  it('an undecided bid charges (the worst case); a refused one does not', () => {
    expect(charged(dayView([rq('p', 'LL', 'pending')]))).toEqual({ LL: 1 })
    expect(dayView([rq('r', 'LL', 'refused')]).charges).toEqual([])
  })
  it('credits earn OIL: FO a day, HO a half', () => {
    expect(dayView([cr('a', 'FO')]).earnsOil).toBe(1)
    expect(dayView([cr('a', 'HO', AM), ab('l', 'LL', PM)]).earnsOil).toBe(0.5)
  })
})

describe('who counts away for manning', () => {
  it('halves of every removing record, capped at a whole day', () => {
    expect(dayView([ab('l', 'LL', AM)]).away).toBe(0.5)
    expect(dayView([ab('l', 'LL', AM), ab('c', 'ATTC', PM)]).away).toBe(1)
    expect(dayView([ab('l', 'LL'), ab('o', 'OD')]).away).toBe(1)
  })
  it('ATT B and a refused bid remove nobody; an undecided bid does', () => {
    expect(dayView([ab('b', 'ATTB')]).away).toBe(0)
    expect(dayView([rq('r', 'LL', 'refused')]).away).toBe(0)
    expect(dayView([rq('p', 'LL', 'pending', PM)]).away).toBe(0.5)
  })
  it('a credit is duty: at work, off the flying programme', () => {
    expect(dayView([cr('w', 'FO')]).duty).toBe(true)
  })
})

describe('the pilots’ 15-day run reads annualFull (owner Q13, clash-check H4)', () => {
  it('full LL, or AM LL + PM OL, is a full annual day', () => {
    expect(dayView([ab('l', 'LL')]).annualFull).toBe(true)
    expect(dayView([ab('l', 'LL', AM), ab('o', 'OL', PM)]).annualFull).toBe(true)
  })
  it('a shared morning counts once, and a half-only day breaks it', () => {
    expect(dayView([ab('a', 'LL', [hm(8), hm(10)]), ab('b', 'OL', [hm(10, 30), hm(11)])]).annualFull).toBe(false)
    expect(dayView([ab('a', 'LL', [hm(8), hm(10)]), ab('b', 'OL', [hm(10, 30), hm(11)]), ab('c', 'LL', PM)]).annualFull).toBe(true)
  })
  it('any other leave type on the day breaks it', () => {
    expect(dayView([ab('l', 'LL', AM), ab('o', 'OIL', PM)]).annualFull).toBe(false)
    expect(dayView([ab('l', 'FCL')]).annualFull).toBe(false)
  })
})
