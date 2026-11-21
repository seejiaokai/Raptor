// @vitest-environment jsdom
/* B4 (Fable 4): a non-master's own-squadron pages read the PICKED squadron's settings. engine/hooks.ts storedKey turns
   every plain unit-setting name into the squadron in view's, so once the "149 ▾" pick calls switchUnit, a 142 member's
   Inputs rule "members may file for others" (perms.ts membersFileOn) becomes 149's. D2132 / D2197: for anyone but a
   master, only the schedule pages and Logic follow the pick — Inputs, Quals, the Leave War and the Tracker stay on his
   own squadron. Latent: today switchUnit's only caller is sign-in. */
import { afterEach, describe, expect, it } from 'vitest'
import { useMsqWorld as useWorld, signInAs } from '../test-support/msq-world'
import { setMembersFile } from './memberfile'
import { membersFileOn } from './perms'
import { switchUnit, forgetUnitPlans } from './store'
import { setGrant } from './units'
import { UNIT, BOOT_UNIT } from '../engine/unitview'

useWorld()
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT); forgetUnitPlans() })

describe("B4 — a 142 member's Inputs rule stays 142's whatever schedule he picks", () => {
  it('149 switches members filing for others off; Ranger (142, View of 149) picks 149: his own rule still on', () => {
    signInAs('ad', 'a')
    expect(setGrant('acus', 'u149', 'view', 'bane').ok).toBe(true)   // Ranger may see 149's schedule
    signInAs('ad9', 'a9')
    expect(setMembersFile(false).ok).toBe(true)                     // 149's switch off
    signInAs('us', 'us')                                            // Ranger, 142 member
    expect(UNIT).toBe('u142')
    expect(membersFileOn(), "142's switch, on").toBe(true)
    switchUnit('u149')                                              // the "149 ▾" pick
    expect(membersFileOn(), "still 142's switch — his Inputs page is 142's").toBe(true)
  })
})
