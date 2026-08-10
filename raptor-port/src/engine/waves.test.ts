/* Ported from reference/tfin.js — group S (standalone waves) and the
   scShiftKind halves of groups T and B34. */
import { describe, expect, it } from 'vitest'
import { makeStandalone, saExempt, isStandalone, dayCount, saDutyBlocks, saDutyIx } from './waves'
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

/* Owner, 10 Aug 26: an SC wave came up with no duty block at all while AVALON
   brought its four, and the difference was never intended. One block per SHIFT
   — SC hands over at 13:00, so the AM and PM desks are different people. */
describe('a standalone wave brings its own duty block(s)', () => {
  it('SC brings one block per shift, AM then PM, labelled by shift', () => {
    expect(saDutyBlocks('sc').map((b: any) => b.label)).toEqual(['SC AM', 'SC PM'])
    expect(saDutyBlocks('sc').map((b: any) => b.rows[0].str + '-' + b.rows[0].end))
      .toEqual(['0700-1300', '1300-1900'])
  })

  it('SC carries the same four roles as AVALON', () => {
    for (const b of saDutyBlocks('sc'))
      expect(b.rows.map((r: any) => r.role)).toEqual(['SXO', 'OPS-O', 'RUNNER', 'LOGCELL'])
  })

  it('every duty row comes up unmanned, for the scheduler to fill', () => {
    expect(saDutyBlocks('sc').every((b: any) => b.rows.every((r: any) => r.id === ''))).toBe(true)
  })

  /* the times are a starting point: the shift's own hours, in the same 4-digit
     form every other duty row on the board uses, so they type over cleanly */
  it('the block times are the shift times, colon-free like every duty row', () => {
    const sc = makeStandalone('sc')
    expect(saDutyBlocks('sc').map((b: any, i: number) =>
      b.rows[0].str + '-' + b.rows[0].end))
      .toEqual(sc.formations.map((f: any) => f.to.replace(':', '') + '-' + f.ld.replace(':', '')))
  })

  it('AVALON is unchanged — one shift, so one block, still labelled AVALON', () => {
    const b = saDutyBlocks('avalon')
    expect(b.length).toBe(1)
    expect(b[0].label).toBe('AVALON')
    expect(b[0].rows.map((r: any) => r.role)).toEqual(['SXO', 'OPS-O', 'RUNNER', 'LOGCELL'])
    expect(b[0].rows[0].str + '-' + b[0].rows[0].end).toBe('1900-0700')
  })

  it('BB brings none — its times are the scheduler’s to set', () => {
    expect(saDutyBlocks('bb')).toEqual([])
  })

  /* noconf mirrors the WAVE: AVALON is uncrosschecked whole, SC's mains are
     not, so an SC desk clashes like any other duty row */
  it('AVALON’s desk is exempt and SC’s is not', () => {
    expect(saDutyBlocks('avalon')[0].noconf).toBe(true)
    expect(saDutyBlocks('sc').every((b: any) => b.noconf === false)).toBe(true)
  })

  it('SC’s two blocks are both found for removal, highest index first', () => {
    const d: any = { dutywaves: [{ label: '1st wave' }, ...saDutyBlocks('sc'), { label: 'Duty' }] }
    expect(saDutyIx(d, makeStandalone('sc'))).toEqual([2, 1])
  })

  it('a RENAMED block is still removed with its wave', () => {
    const d: any = { dutywaves: saDutyBlocks('sc') }
    d.dutywaves[0].label = 'SC morning desk'
    expect(saDutyIx(d, makeStandalone('sc'))).toEqual([1, 0])
  })

  it('and one wave’s blocks are never mistaken for another’s', () => {
    const d: any = { dutywaves: [...saDutyBlocks('sc'), ...saDutyBlocks('avalon')] }
    expect(saDutyIx(d, makeStandalone('avalon'))).toEqual([2])
    expect(saDutyIx(d, makeStandalone('sc'))).toEqual([1, 0])
  })

  it('an ordinary wave owns no duty block', () => {
    const d: any = { dutywaves: saDutyBlocks('sc') }
    expect(saDutyIx(d, { label: 'WAVE 1' })).toEqual([])
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
