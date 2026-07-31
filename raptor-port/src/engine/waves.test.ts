/* Ported from reference/tfin.js — group S (standalone waves) and the
   scShiftKind halves of groups T and B34. */
import { describe, expect, it } from 'vitest'
import { makeStandalone, saExempt, isStandalone, dayCount } from './waves'
import { scShiftKind } from './people'
import { DAYS } from './data'

describe('SC / AVALON / BB come up as 2 MAIN + 2 SPARE per shift (tfin S)', () => {
  for (const k of ['sc', 'avalon', 'bb']) {
    const K = k.toUpperCase()
    it(K + ' has four lines on every shift', () => {
      const w2 = makeStandalone(k)
      expect((w2.formations || []).every((f: any) => f.aircraft.length === 4),
        (w2.formations || []).map((f: any) => f.aircraft.length).join(',')).toBe(true)
    })
    it(K + ' is two MAIN then two SPARE', () => {
      const w2 = makeStandalone(k)
      expect((w2.formations || []).every((f: any) => f.aircraft.map((a: any) => a.role).join(',') === 'MAIN,MAIN,SPARE,SPARE')).toBe(true)
    })
    it(K + ' flags exactly the spares', () => {
      const w2 = makeStandalone(k)
      expect((w2.formations || []).every((f: any) => f.aircraft.filter((a: any) => a.spare).length === 2
        && f.aircraft.filter((a: any) => a.spare).every((a: any) => a.role === 'SPARE'))).toBe(true)
    })
    it(K + ' leaves remarks empty for real remarks', () => {
      const w2 = makeStandalone(k)
      expect((w2.formations || []).every((f: any) => f.aircraft.every((a: any) => !a.rmks))).toBe(true)
    })
  }

  it('SC keeps its AM and PM shifts', () => {
    const w2 = makeStandalone('sc')
    expect(w2.formations.map((f: any) => f.msn).join(',')).toBe('AM,PM')
    expect(w2.formations[0].to).toBe('07:00'); expect(w2.formations[0].ld).toBe('13:00')
    expect(w2.formations[1].to).toBe('13:00'); expect(w2.formations[1].ld).toBe('19:00')
  })

  it('AVALON runs overnight and no longer calls its shift MAIN', () => {
    const w2 = makeStandalone('avalon')
    expect(w2.formations.length).toBe(1)
    expect(w2.formations[0].msn).toBe('NIGHT')
    expect(w2.formations[0].to).toBe('19:00'); expect(w2.formations[0].ld).toBe('07:00')
  })

  it('BB still leaves its times blank', () => {
    const w2 = makeStandalone('bb')
    expect(w2.formations[0].to).toBe(''); expect(w2.formations[0].ld).toBe('')
  })

  it('SC main crews are still cross-checked', () => {
    const sc = makeStandalone('sc'), f = sc.formations[0]
    expect(f.aircraft.filter((a: any) => !a.spare).every((a: any) => saExempt(sc, f, a) === false)).toBe(true)
  })

  it('SC spare crews are not', () => {
    const sc = makeStandalone('sc'), f = sc.formations[0]
    expect(f.aircraft.filter((a: any) => a.spare).every((a: any) => saExempt(sc, f, a) === true)).toBe(true)
  })

  it('every AVALON line is exempt', () => {
    const av = makeStandalone('avalon'), f2 = av.formations[0]
    expect(f2.aircraft.every((a: any) => saExempt(av, f2, a) === true)).toBe(true)
    expect(isStandalone(av)).toBe(true)
  })

  it('the day count still counts mains only, once per shift', () => {
    const base = dayCount(DAYS[0])
    DAYS[0].waves.push(makeStandalone('sc'))
    expect(dayCount(DAYS[0])).toBe(base + ' / 2')
    DAYS[0].waves.pop()
  })
})

describe('SC DAY / SC NIGHT currency windows (tfin T, B34)', () => {
  it('a shift inside the window is a day shift', () => {
    expect(scShiftKind(7 * 60, 13 * 60)).toBe('day')
    expect(scShiftKind(13 * 60, 19 * 60)).toBe('day')
    expect(scShiftKind(7 * 60, 19 * 60)).toBe('day')
  })

  it('a shift reaching outside it is a night shift', () => {
    expect(scShiftKind(13 * 60, 21 * 60)).toBe('night')
    expect(scShiftKind(19 * 60, 31 * 60)).toBe('night')
    expect(scShiftKind(6 * 60, 12 * 60)).toBe('night')
    expect(scShiftKind(19 * 60, 23 * 60)).toBe('night')
    expect(scShiftKind(18 * 60, 20 * 60)).toBe('night')
  })

  it('the boundaries themselves are day', () => {
    expect(scShiftKind(7 * 60, 19 * 60)).toBe('day')
    expect(scShiftKind(6 * 60 + 59, 19 * 60)).toBe('night')
    expect(scShiftKind(7 * 60, 19 * 60 + 1)).toBe('night')
  })
})
