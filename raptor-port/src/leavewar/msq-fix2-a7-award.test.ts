// @vitest-environment jsdom
/* opus3: A7's own comment — a day now another squadron's takes "no bid, no award, no absence, no credit" in the old war */
import { describe, expect, it } from 'vitest'
import { worldUnit, setDayAward, grantOilDays, awardsOnDay } from './state/store'
import { setHome, homeOn } from '../state/units'
import { useMsqWorld, signInAs } from '../test-support/msq-world'

useMsqWorld()
const FRI = '2026-07-17'

describe('opus3 — an OIL award on a day now 149’s, in 142’s war', () => {
  it('Saber, 142 loaded, Ranger moving to 149 from Thu 16 Jul: an award on Fri 17 Jul is refused', () => {
    signInAs('saber'); expect(worldUnit()).toBe('u142')
    expect(setHome('bane', 'u149').ok).toBe(true)
    expect(homeOn('bane', FRI)).toBe('u149')
    const r = setDayAward('bane', FRI, 1, { note: 'worked Sat' })
    expect(awardsOnDay('bane', FRI).length, 'no award lands in 142’s war on his 149 day').toBe(0)
  })
  it('the same through the drag grant', () => {
    signInAs('saber')
    expect(setHome('bane', 'u149').ok).toBe(true)
    const r = grantOilDays([{ personId: 'bane', date: FRI }], 1, { note: 'x' })
    expect(awardsOnDay('bane', FRI).length).toBe(0)
  })
})
