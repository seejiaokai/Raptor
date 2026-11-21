// @vitest-environment jsdom
/* opus2 (blind read, share 2): the record of where a Scheduler tick was given (`schedOf` / `schedFrom`, core line 4 —
   D2160) — is it held at the save check as the admin role's record is (K3: "names the squadron he is in TODAY, from
   today"), or can the old squadron's admin plant a tick that counts in the squadron a man is about to join? */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, PID, moveMan } from '../test-support/msq-world'
import { schedTickIn, homeOn } from './units'
import { commitPeopleEdit } from './people-settings-commit'
import { PEOPLE } from '../engine/people'

useMsqWorld()

describe('opus2 — a Scheduler tick planted for the squadron he joins', () => {
  it('142\'s plain admin cannot write Ranger a tick that counts in 149 from his move day', () => {
    signInAs('hunter')
    expect(moveMan(PID.ranger, 'u149').ok).toBe(true)            // Hunter moves his own man, from tomorrow (K4)
    expect(homeOn(PID.ranger, '2026-07-16')).toBe('u149')
    expect(schedTickIn(PID.ranger, 'u149', '2026-07-17'), 'no tick in 149 to start with').toBe(false)
    /* a hand-made people write (no door writes this): the tick, recorded as given in 149 from his move day */
    const r: any = commitPeopleEdit(() => {
      const p: any = (PEOPLE as any)[PID.ranger]
      p.quals = { ...(p.quals || {}), sched: true }
      p.schedOf = 'u149'; p.schedFrom = '2026-07-16'
    })
    const tick149 = schedTickIn(PID.ranger, 'u149', '2026-07-17')
    expect({ saved: r?.ok !== false, tick149 }).toEqual({ saved: false, tick149: false })
  })
})
