/* DOES THE PICK STILL STAND (the blind read's R6, its pick half — the reshape plan §19b; dormant until P1/P3): the
   squadron picked is one the signed-in person can read that day — his home, a View or Plan that holds, or a master
   admin's anywhere. The tests pick with switchUnit directly, as page-unit.test.ts does. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, signOut, PID, ACCT, on } from '../test-support/msq-world'
import { pickStandsOn } from './perms'
import { switchUnit, setEntryTrigger } from './store'
import { setGrant, todayIso } from './units'

useMsqWorld()
/* SETUP ONLY (the reshape plan §9.2), phase 3: with the midnight swap switched on, the very next notify re-enters his own
   squadron when the pick has no right behind it (state/store.ts — R6's pick half, which reads this function), so a pick
   with none would be gone before it is read. The reader is tested here with the page held where it is picked. */
setEntryTrigger(false)

describe('pickStandsOn', () => {
  it('his own squadron stands; another squadron with no right behind it does not', () => {
    signInAs('ranger')
    expect(pickStandsOn(todayIso())).toBe(true)
    switchUnit('u149')
    expect(pickStandsOn(todayIso())).toBe(false)
  })
  it('a master admin\'s pick stands anywhere', () => {
    signInAs('saber'); switchUnit('u149')
    expect(pickStandsOn(todayIso())).toBe(true)
  })
  it('a View or a Plan that holds that day stands (D2191, D2201)', () => {
    on(14)
    signInAs('saber')
    setGrant(ACCT.ranger, 'u149', 'view', PID.ranger)
    setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter)
    signInAs('ranger'); switchUnit('u149')
    expect(pickStandsOn(todayIso())).toBe(true)
    signInAs('hunter'); switchUnit('u149')
    expect(pickStandsOn(todayIso())).toBe(true)
  })
  it('nobody signed in: the boot unit only', () => {
    signOut()
    expect(pickStandsOn(todayIso())).toBe(true)
  })
})
