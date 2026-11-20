/* THE PAGE'S SQUADRON (the reshape plan §3.2 A-ii, §3.4; the Plan audit's PE1 as R5 rewrote it, PD1). Dormant until
   step 5's menu: the tests pick a squadron with switchUnit directly, as B4/B5 do. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT } from '../test-support/msq-world'
import { pageUnit, adminOfPage, maySchedEditPage, mayEditSched } from './perms'
import { switchUnit } from './store'
import { setGrant } from './units'
import { setEffectiveRole } from './auth'

useMsqWorld()

describe('pageUnit', () => {
  it('today everyone\'s pick is his home, so every page answers his own squadron', () => {
    signInAs('kestrel')
    expect([pageUnit('schedule'), pageUnit('own')]).toEqual(['u149', 'u149'])
    signInAs('ranger')
    expect([pageUnit('schedule'), pageUnit('own')]).toEqual(['u142', 'u142'])
  })
  it('a master admin\'s pick moves his own pages too (D2197)', () => {
    signInAs('saber'); switchUnit('u149')
    expect([pageUnit('schedule'), pageUnit('own')]).toEqual(['u149', 'u149'])
  })
  it('an admin holding Plan of the pick: his own pages follow it; a View holder\'s stay home (D2201, D2191)', () => {
    signInAs('saber')
    setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter)
    setGrant(ACCT.ranger, 'u149', 'view', PID.ranger)
    signInAs('hunter'); switchUnit('u149')
    expect(pageUnit('own')).toBe('u149')
    signInAs('ranger'); switchUnit('u149')
    expect([pageUnit('schedule'), pageUnit('own')]).toEqual(['u149', 'u142'])
  })
  it('an admin in the member view is a member: his own pages are his home (R5)', () => {
    signInAs('saber'); switchUnit('u149')
    setEffectiveRole('member')
    expect(pageUnit('own')).toBe('u142')
  })
})

describe('adminOfPage — the schedule pages\' edit question (PE1 as R5 rewrote it)', () => {
  it('O3 (guard): Saber, then Hunter holding Plan of 149, switched to the member view — no edit', () => {
    signInAs('saber')
    setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter)
    for (const who of ['saber', 'hunter'] as const) {
      signInAs(who); switchUnit('u149')
      expect(maySchedEditPage(), who).toBe(true)
      setEffectiveRole('member')
      expect([mayEditSched(), maySchedEditPage()], who).toEqual([false, false])
    }
  })
  it('a View holder who picks 149 is never offered its edit controls; an admin at home is', () => {
    signInAs('saber')
    setGrant(ACCT.hunter, 'u149', 'view', PID.hunter)
    signInAs('hunter'); switchUnit('u149')
    expect([mayEditSched(), adminOfPage('schedule'), maySchedEditPage()]).toEqual([true, false, false])
    switchUnit('u142')
    expect(maySchedEditPage()).toBe(true)
  })
})
