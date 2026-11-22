// @vitest-environment jsdom
/* THE FLYING PLAN AND THE SANS COLOURS BY SQUADRON (the reshape plan §3.2 A-ii — the own pages' setting reads and writes;
   new forms, §9.4). Each reader and writer takes a squadron; left out, the loaded squadron's, as before. Another
   squadron's plan is read from its own stored rows and written to them, never through the loaded squadron's cache, so
   the plan the schedule pages and the Leave War draw is never filled with another's. Hunter (142's admin, given
   admin rights in 149 — a Plan holder) signs in to 142 and works 149's plan by name; Ranger, a member, is refused. */
import { describe, expect, it } from 'vitest'
import { useMsqWorld as useWorld, signInAs } from '../test-support/msq-world'
import { setGrant } from './units'
import { UNIT } from '../engine/unitview'
import { unitSetting } from '../engine/hooks'
import { getFlyPlan, getTones, setFlyDays, setFlyRule, removeFlyRule, setFlyRun, dropFlyRun, saveTones } from './flyplan'
import { DEFAULT_TONES } from './flyplan-model'

useWorld()

const hunterWith149 = () => {
  signInAs('ad', 'a')
  expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
  signInAs('ad2', 'a2')
  expect(UNIT).toBe('u142')
}

describe("the flying plan's squadron-taking forms", () => {
  it("a date's class, a run and a weekday rule written for 149 land in 149's rows; 142's plan and its cache untouched", () => {
    hunterWith149()
    const own0 = JSON.stringify(getFlyPlan())
    expect(setFlyDays([{ iso: '2026-07-21', cls: 'nf' }], 'u149').ok).toBe(true)
    expect(setFlyRun('2026-07-20', { p: 9 }, undefined, 'u149').ok).toBe(true)
    const rule = setFlyRule({ wd: 3, cls: 'nf', from: '2026-07-16' }, 'u149')
    expect(rule.ok).toBe(true)
    const p149 = getFlyPlan('u149')
    expect(p149.days['2026-07-21']).toEqual({ cls: 'nf' })
    expect(p149.runs['2026-07-20']).toEqual({ p: 9 })
    expect(p149.rules.map(r => r.id)).toEqual([rule.id])
    expect(unitSetting('u149', 'flyday:2026-07-21', null), "stored as 149's").toEqual({ cls: 'nf' })
    expect(unitSetting('u142', 'flyday:2026-07-21', null), 'never as 142\'s').toBeNull()
    expect(JSON.stringify(getFlyPlan()), "the loaded squadron's plan as it was").toBe(own0)
    expect(JSON.stringify(getFlyPlan('u142')), 'the same by name').toBe(own0)
    /* and back out again, by name */
    expect(dropFlyRun('2026-07-20', ['p'], 'u149').ok).toBe(true)
    expect(removeFlyRule(rule.id!, 'u149').ok).toBe(true)
    expect(getFlyPlan('u149').runs['2026-07-20']).toBeUndefined()
    expect(getFlyPlan('u149').rules).toEqual([])
  })

  it("the loaded squadron's plan, named or not, is the same plan; a write for it reaches the cache at once", () => {
    hunterWith149()
    expect(setFlyDays([{ iso: '2026-07-22', cls: 'night' }], 'u142').ok).toBe(true)
    expect(getFlyPlan().days['2026-07-22']).toEqual({ cls: 'night' })
    expect(getFlyPlan('u142')).toBe(getFlyPlan())
  })

  it("the three colours by squadron: 149's saved by name, 142's left at the standard", () => {
    hunterWith149()
    expect(saveTones({ yellowFrom: 2, amberFrom: 4, redFrom: 6 }, 'u149').ok).toBe(true)
    expect(getTones('u149')).toEqual({ yellowFrom: 2, amberFrom: 4, redFrom: 6 })
    expect(getTones()).toEqual(DEFAULT_TONES)
    expect(getTones('u142')).toEqual(DEFAULT_TONES)
  })

  it("a member writing 149's plan by name is refused, and nothing is stored", () => {
    signInAs('us', 'us')
    const r = setFlyDays([{ iso: '2026-07-21', cls: 'nf' }], 'u149')
    expect(r.ok).toBe(false)
    expect(unitSetting('u149', 'flyday:2026-07-21', null)).toBeNull()
  })
})
