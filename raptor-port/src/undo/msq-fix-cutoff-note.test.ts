// @vitest-environment jsdom
/* W1 (4) (the walk of 21 Nov 26, W1-05): the Undo note for the Inputs calendar's late cut-off read "Undid: a rule on the
   Logic page". The cut-off is one setting with two ways in (D639: behind each calendar's gear, and listed on the Logic
   page) and is saved as the `rules` record whichever way it was set (state/cutoff.ts), so the note named the Logic page
   for a change made on Inputs. It now names the setting by the heading its own window carries — "Late cut-off for
   inputs" (ui/InputsSettings.tsx), "Late cut-off for SANS commitments" (ui/SansSettings.tsx) — true on either page; any
   other rule, or a save that changes more than one cut-off, keeps "a rule on the Logic page". */
import { describe, it, expect, afterEach } from 'vitest'
import { useMsqWorld, signInAs } from '../test-support/msq-world'
import { getCut, saveCut } from '../state/cutoff'
import { RULE_SPEC, RULE_STD, VCONF, rulesSave } from '../engine/rules'
import { undoState } from './index'

useMsqWorld()
/* the rule values in memory go back to the standard after each test (the world empties the store, not this record) */
afterEach(() => { Object.assign(VCONF, RULE_STD.v) })

describe('the Undo note for a late cut-off names the setting, not the Logic page', () => {
  it('the Inputs calendar\'s cut-off', () => {
    signInAs('hunter')
    const c = getCut('inputs')
    expect(saveCut('inputs', { ...c, mode: 0, lead: c.lead === 10 ? 11 : 10 })).toMatchObject({ ok: true })
    expect(undoState().undoLabel).toBe('the late cut-off for inputs')
  })
  it('the SANS calendar\'s cut-off', () => {
    signInAs('hunter')
    const c = getCut('sans')
    expect(saveCut('sans', { ...c, mode: 0, lead: c.lead === 10 ? 11 : 10 })).toMatchObject({ ok: true })
    expect(undoState().undoLabel).toBe('the late cut-off for SANS commitments')
  })
  it('(control) another rule keeps the Logic page', () => {
    signInAs('hunter')
    const k = Object.keys(RULE_SPEC).find(x => !/^(input|sans)(Lead|Cut)/.test(x))!, spec = RULE_SPEC[k]
    VCONF[k] = VCONF[k] === spec.hi ? spec.lo : spec.hi; rulesSave()
    expect(undoState().undoLabel).toBe('a rule on the Logic page')
  })
})
