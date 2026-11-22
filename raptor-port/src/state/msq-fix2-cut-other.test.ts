// @vitest-environment jsdom
/* opus1 — another squadron's cut-off saved by one with no rights there: what does the door answer? */
import { describe, expect, it } from 'vitest'
import { useMsqWorld, signInAs } from '../test-support/msq-world'
import { saveCut, getCut } from './cutoff'
import { unitSetting } from '../engine/hooks'

useMsqWorld()

describe("opus1 — saveCut for a squadron he holds no rights in", () => {
  it("Hunter (142's plain admin) saving 149's inputs cut-off is told it was not saved, and nothing is stored", () => {
    signInAs('hunter')
    const before = JSON.stringify(unitSetting('u149', 'rules', null))
    let r: any, threw: any = null
    try { r = saveCut('inputs', { mode: 0, lead: 3, wd: 0, weeks: 1 }, 'u149') } catch (e) { threw = e }
    expect(JSON.stringify(unitSetting('u149', 'rules', null)), 'nothing stored in 149').toBe(before)
    expect(getCut('inputs', 'u149').lead, "149's lead unchanged").not.toBe(3)
    expect(threw, 'no throw').toBeNull()
    expect(r.ok, 'the door says it was not saved').toBe(false)
  })
})
