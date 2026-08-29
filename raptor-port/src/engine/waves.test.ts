/* Ported from reference/tfin.js — group S (standalone waves) and the
   scShiftKind halves of groups T and B34. */
import { describe, expect, it } from 'vitest'
import { makeStandalone, saExempt, isStandalone, dayCount, waveDutyBlock, saDutyIx, DUTY_PICK, SAWAVE } from './waves'
import { DUTY_ORDER } from './order'
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

  it('AVALON lines default to the short AV callsign, the wave keeps its full label', () => {
    const w2 = makeStandalone('avalon')            // owner, 25 Aug 26 — "AVALON" wrapped the CS box
    expect(w2.formations.every((f: any) => f.cs === 'AV')).toBe(true)
    expect(w2.label).toBe('AVALON')
    /* SC and BB were already short, so they still read as their labels */
    expect(makeStandalone('sc').formations[0].cs).toBe('SC')
    expect(makeStandalone('bb').formations[0].cs).toBe('BB')
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

/* THE DUTY BLOCK A WAVE BRINGS (owner, 10 Aug 26). Shipped that morning as
   "SC auto-creates its own blocks"; the owner moved it to the `+ Block`
   picker the same afternoon, so what is pinned here is the PICKER's shapes.
   AVALON is the one wave that still brings its desk up with itself. */
describe('the duty block a wave brings', () => {
  const roles = (w: any) => waveDutyBlock(w)!.rows.map((r: any) => r.role)

  it('an ordinary wave takes the standard desk, titled after itself', () => {
    const b = waveDutyBlock({ label: 'WAVE 1' })!
    expect(b.label).toBe('WAVE 1 duties')
    expect(b.rows.map((r: any) => r.role)).toEqual(['SDO', 'SXO', 'OPS O'])
  })

  /* SC hands over at 13:00, so one block carries both shifts with the shift
     in the role name — the owner spelled this set out by hand */
  it('SC names the shift in the role: SXO AM, OPS O AM, SXO PM, OPS O PM', () => {
    expect(roles(makeStandalone('sc'))).toEqual(['SXO AM', 'OPS O AM', 'SXO PM', 'OPS O PM'])
  })

  it('AVALON keeps its four, spelled the owner’s way', () => {
    expect(roles(makeStandalone('avalon'))).toEqual(['SXO', 'OPS O', 'RUNNER', 'LOG CELL'])
  })

  it('the spellings it emits are ones DUTY_ORDER already ranks', () => {
    for (const kind of ['sc', 'avalon', 'bb'])
      for (const r of roles(makeStandalone(kind)))
        expect(DUTY_ORDER[r.replace(/ (AM|PM)$/, '')], r).not.toBe(undefined)
    for (const r of DUTY_PICK) expect(DUTY_ORDER[r], r).not.toBe(undefined)
  })

  it('every row comes up unmanned, for the scheduler to fill', () => {
    expect(waveDutyBlock(makeStandalone('avalon'))!.rows.every((r: any) => r.id === '')).toBe(true)
  })

  /* times only where the wave HAS fixed hours to give */
  it('AVALON stamps its overnight hours, SC and an ordinary wave leave them blank', () => {
    const av = waveDutyBlock(makeStandalone('avalon'))!.rows[0]
    /* hh:mm since 30 Aug 26 — every time mints in the app's one colon form */
    expect(av.str + '-' + av.end).toBe('19:00-07:00')
    for (const w of [makeStandalone('sc'), { label: 'WAVE 1' }])
      expect(waveDutyBlock(w)!.rows.every((r: any) => r.str === '' && r.end === '')).toBe(true)
  })

  /* noconf mirrors the WAVE: AVALON/BB sit outside the conflict engine whole,
     so their desks do; an SC or ordinary desk is checked like any duty row */
  it('AVALON’s desk is exempt and SC’s is not', () => {
    expect(waveDutyBlock(makeStandalone('avalon'))!.noconf).toBe(true)
    expect(waveDutyBlock(makeStandalone('sc'))!.noconf).toBe(false)
    expect(waveDutyBlock({ label: 'WAVE 1' })!.noconf).toBe(false)
  })

  it('AVALON is the only wave that brings its desk up automatically', () => {
    expect(SAWAVE.avalon.autoDuty).toBe(true)
    expect(SAWAVE.sc.autoDuty).toBeFalsy()
    expect(SAWAVE.bb.autoDuty).toBeFalsy()
  })

  it('a wave with no label still produces a usable title', () => {
    expect(waveDutyBlock({})!.label).toBe('Wave duties')
    expect(waveDutyBlock(null)).toBe(null)
  })

  /* the delete path: a standalone wave's blocks go with it */
  it('a standalone wave’s block is found for removal, even renamed', () => {
    const av = makeStandalone('avalon')
    const d: any = { dutywaves: [{ label: '1st wave' }, waveDutyBlock(av)] }
    expect(saDutyIx(d, av)).toEqual([1])
    d.dutywaves[1].label = 'the overnight desk'
    expect(saDutyIx(d, av)).toEqual([1])
  })

  it('and one wave’s block is never mistaken for another’s', () => {
    const sc = makeStandalone('sc'), av = makeStandalone('avalon')
    const d: any = { dutywaves: [waveDutyBlock(sc), waveDutyBlock(av)] }
    expect(saDutyIx(d, av)).toEqual([1])
    expect(saDutyIx(d, sc)).toEqual([0])
  })

  it('an ordinary wave owns no block, so deleting it strands nothing', () => {
    const d: any = { dutywaves: [waveDutyBlock(makeStandalone('sc'))] }
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
