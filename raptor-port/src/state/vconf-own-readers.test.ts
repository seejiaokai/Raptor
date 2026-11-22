// @vitest-environment jsdom
/* THE SECOND INVENTORY — SETTINGS HELD IN MEMORY, READ FROM AN OWN PAGE (batch 1's second half, §15 D4 and §16 D4′; Fable's
   shape answer: the pick is a second meaning of "the squadron" laid over things that keep their own — the settings in
   memory, VCONF, are the schedule in view's). An input's OIL amount — what its own hours earn on a day off — is its own
   squadron's threshold ("Full-day OIL threshold", Logic), as its late mark is its own squadron's cut-off
   (engine/inputs.ts cutBackFor). So Hunter, 142's admin with View of 149, who picks 149 — whose threshold differs —
   is asked the same OIL question for his own Saturday input, and a remark edit made with 149 picked keeps the Yes his
   142 hours earned. Red first: the amount read VCONF, the squadron picked's. */
import { afterEach, describe, expect, it } from 'vitest'
import { useMsqWorld, signInAs, ACCT, PID } from '../test-support/msq-world'
import { enterSquadron, switchUnit } from './store'
import { setGrant } from './units'
import { store, unitSettingKey } from '../engine/hooks'
import { ruleNow } from '../engine/rules'
import { inputOilAmt, voidedOil, repricedOil } from '../engine/oil'
import { oilAskPlan } from '../leavewar/sync'
import { UNIT, BOOT_UNIT } from '../engine/unitview'

useMsqWorld()
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT) })

/* 09:00–14:00 — 300 worked minutes: a half day under 142's 361, a full day under 149's 240 */
const SAT = { person: PID.hunter, type: 'Duty', date: 'Jul 18', yr: 2026, allday: false, s: 540, e: 840 }

function setup() {
  signInAs('saber')
  expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter).ok).toBe(true)
  store.set(unitSettingKey('u149', 'rules'), { v: { oilFullMin: 240 }, s: {} })
  signInAs('hunter')
}

describe("an input's OIL amount is its own squadron's threshold, whichever squadron is picked", () => {
  it('the ask plan for his own Saturday input is the same with 149 picked as with 142', () => {
    setup()
    const at142 = oilAskPlan(SAT)
    expect(at142.length, 'control: Saturday asks').toBe(1)
    expect(at142[0]!.amt, '142: a half day').toBe(0.5)
    enterSquadron('u149')
    expect(ruleNow('oilFullMin'), "control: 149's threshold is loaded").toBe(240)
    expect(oilAskPlan(SAT), 'the same question').toEqual(at142)
  })
  it("the amount by the input's squadron, named", () => {
    setup()
    enterSquadron('u149')
    expect(inputOilAmt(false, 540, 840, 'u142')).toBe(0.5)
    expect(inputOilAmt(false, 540, 840, 'u149')).toBe(1)
  })
  it('a remark edit with 149 picked keeps the Yes his 142 hours earned (voidedOil, repricedOil)', () => {
    setup()
    const before = { ...SAT, oil: { '2026-07-18': 0.5 } }
    const after = { ...SAT, remarks: 'a remark' }
    expect(voidedOil(before, after), 'control, 142 picked').toEqual({ '2026-07-18': 0.5 })
    enterSquadron('u149')
    expect(voidedOil(before, after), 'kept, 149 picked').toEqual({ '2026-07-18': 0.5 })
    expect(repricedOil(before, after), 'repriced at his own squadron\'s 0.5').toEqual({ '2026-07-18': 0.5 })
  })
})
