// @vitest-environment jsdom
/* THE LEAVE WAR'S FLYING PLAN AND QUALS COLUMNS ARE ITS OWN SQUADRON'S, WHATEVER SCHEDULE IS PICKED (the reshape plan,
   docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §3.2 A-ii "Own-page settings"; D2132, D2197).
   The war's Required rows, its day answers (flyAnswer / flyMonth), the SANS colours they carry, the re-exported plan
   writers and the Quals columns its groups read all follow the war's squadron (warUnit) — never the "149 ▾" pick, which
   only a master admin moves away from his own squadron's. Driven as the B4 proofs are (ui/reshape-b04-own-pages.test.ts):
   Saber, master admin, 142's war loaded, picks 149 with switchUnit. Written red first (helper "war", second pass): on
   2a01b1454 the answers read the pick's plan and tones and the catalogue the pick's columns. */
import { afterEach, describe, expect, it } from 'vitest'
import { useMsqWorld, signInAs } from '../test-support/msq-world'
import { switchUnit, forgetUnitPlans } from '../state/store'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { setFlyDays as setFlyDaysOf, saveTones, getFlyPlan as getFlyPlanOf } from '../state/flyplan'
import { DEFAULT_TONES } from '../state/flyplan-model'
import { qualColsOf } from '../engine/qualcols'
import { setQualsPageCols, qualsPageCols } from '../ui/QualsPage'
import { worldUnit } from './state/store'
import { qualCatalogue } from './state/raptorRoster'
import { flyAnswer, flyMonth, getTones, getFlyPlan, setFlyDays } from './sync'

useMsqWorld()
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT); forgetUnitPlans() })

const DAY = '2026-07-20'                                     // Mon 20 Jul 26
const setUp = () => {
  signInAs('ad9', 'a9')                                       // Kestrel, 149's admin: 149's own plan, colours and columns
  expect(UNIT).toBe('u149')
  expect(setFlyDaysOf([{ iso: DAY, cls: 'day', p: 9, w: 9 }]).ok).toBe(true)
  expect(saveTones({ yellowFrom: 2, amberFrom: 4, redFrom: 6 }).ok).toBe(true)
  expect(setQualsPageCols(qualsPageCols().slice(1))).toBe(true)
  signInAs('ad', 'a')                                         // Saber, master admin, 142's war loaded
  expect(UNIT).toBe('u142')
  expect(worldUnit()).toBe('u142')
  expect(setFlyDaysOf([{ iso: DAY, cls: 'day', p: 4, w: 3 }]).ok).toBe(true)
}
const own = () => ({
  answer: flyAnswer(DAY), month: flyMonth(2026, 7)[DAY], tones: getTones(), cat: qualCatalogue().map(q => q.k),
})

describe('the Leave War reads its own squadron’s flying plan and Quals columns', () => {
  it('(control) the pick is the war’s squadron: 142’s figures, colours and columns', () => {
    setUp()
    const o = own()
    expect(o.answer.req).toEqual({ p: 4, w: 3 })
    expect(o.month.req).toEqual({ p: 4, w: 3 })
    expect(o.tones).toEqual(DEFAULT_TONES)
    expect(o.cat.slice(0, qualColsOf('u142').length)).toEqual(qualColsOf('u142').map(c => c.k))
  })
  it('Saber picks 149 with 142’s war loaded: the war’s day answers, colours and columns stay 142’s', () => {
    setUp()
    const before = own()
    switchUnit('u149')
    expect(UNIT, 'the pick moved').toBe('u149')
    expect(worldUnit(), '142’s war still loaded').toBe('u142')
    const after = own()
    expect(after.answer.req, '142’s Required figures').toEqual({ p: 4, w: 3 })
    expect(after.month.req).toEqual({ p: 4, w: 3 })
    expect(after.answer, 'the whole answer, its colour included').toEqual(before.answer)
    expect(after.tones, '142’s SANS colours').toEqual(DEFAULT_TONES)
    expect(after.cat, '142’s Quals columns').toEqual(before.cat)
    expect(getFlyPlan().days[DAY], 'the re-exported plan read is 142’s').toEqual(getFlyPlanOf('u142').days[DAY])
  })
  it('Saber picks 149: a Required figure typed on 142’s war is written to 142’s plan, 149’s untouched', () => {
    setUp()
    switchUnit('u149')
    expect(setFlyDays([{ iso: DAY, p: 6 }]).ok).toBe(true)
    expect(getFlyPlanOf('u142').days[DAY]?.p, '142’s').toBe(6)
    expect(getFlyPlanOf('u149').days[DAY]?.p, '149’s left').toBe(9)
    expect(flyAnswer(DAY).req.p).toBe(6)
  })
})
