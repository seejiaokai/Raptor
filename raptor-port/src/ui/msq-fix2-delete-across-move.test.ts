// @vitest-environment jsdom
/* Fable, share 1 — proof: the who-rule's refusal is said in his approved words (D2240) only at the window's Save and
   the calendar's drag. The Delete (ui/inputedit.tsx removeInput) of an input which runs across a man's move goes on to
   the gate and gets its bare words. (The reader's second case — the schedule's own ✕ on the old squadron's day — is
   his to decide, D2221, and is not carried here.) */
import { afterEach, describe, expect, it } from 'vitest'
import { useMsqWorld, signInAs, moveMan, PID } from '../test-support/msq-world'
import { HOOKS } from '../engine/hooks'
import { INPUTS } from '../engine/inputs'
import { writeInputs, switchUnit, forgetUnitPlans } from '../state/store'
import { stashClear } from '../engine/weekstash'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { removeInput } from './inputedit'

useMsqWorld()
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT); forgetUnitPlans(); stashClear() })

const WORDS = "Blocked: Ranger is 149's from Thu 16 Jul. Only Ranger or an admin of both 142 and 149 can change leave that runs across his move."
const said = () => (HOOKS.toast as any).mock.calls.map((c: any) => String(c[0]))

describe("Ranger's input across his move, at the Delete", () => {
  it("Hunter deletes Ranger's leave 14–17 Jul from 142's list: refused in the approved words", () => {
    signInAs('saber')
    moveMan(PID.ranger, 'u149')
    expect(writeInputs(() => { INPUTS.unshift({ person: PID.ranger, type: 'LL', allday: true, date: 'Jul 14', endDate: 'Jul 17', yr: 2026, remarks: 'f1 leave', iid: 'f1del' }) })).toBe(true)
    signInAs('hunter')
    const r = INPUTS.find((x: any) => x.iid === 'f1del')
    expect(removeInput(r), 'refused').toBe(false)
    expect(said()).toContain(WORDS)
  })
})
