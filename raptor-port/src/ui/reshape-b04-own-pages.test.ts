// @vitest-environment jsdom
/* B4, ITS OWN-PAGE HALF (Fable 4 of the full review; the reshape plan §3.2 A-ii "Own-page settings"). The proof
   docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/b-b04-own-pages-follow-pick.test.ts.txt holds for the members'
   switch (its core half, state/memberfile-own-unit.test.ts, built in phase 1); these hold the same for the settings the
   own pages themselves read and write — Quals' column list, the Inputs page's look-ahead and the SANS calendar's three
   colours: once the "149 ▾" pick calls switchUnit, a 142 man who only VIEWS 149 still reads AND writes his own
   squadron's (D2132, D2197; Opus L6 — reads and writes, one key), while a master admin's pick moves them (D2197).
   Same world, same setup steps as the proof (test-support/msq-world.ts). Red on the pages as they were (each read the
   unit in view's, through the store's plain names), green once each reads and writes `pageUnit('own')`'s. */
import { afterEach, describe, expect, it } from 'vitest'
import { useMsqWorld as useWorld, signInAs } from '../test-support/msq-world'
import { switchUnit, forgetUnitPlans } from '../state/store'
import { setGrant } from '../state/units'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { unitSetting } from '../engine/hooks'
import { saveTones } from '../state/flyplan'
import { DEFAULT_TONES } from '../state/flyplan-model'
import { qualsPageCols, setQualsPageCols } from './QualsPage'
import { inputsLookahead, setInputsLookahead } from './InputsPage'
import { sansCalTones } from './SansCal'

useWorld()
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT); forgetUnitPlans() })

const keys = () => qualsPageCols().map((c: any) => c.k)
const storedKeys = (unit: string) => { const v = unitSetting(unit, 'qualcols', null); return Array.isArray(v) ? v.map((c: any) => c.k) : null }

describe("B4, own pages — a 142 man's own pages stay 142's whatever schedule he picks", () => {
  it("Quals' columns: 149 drops one; Hunter (142 admin, View of 149) picks 149 — he reads and edits 142's", () => {
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'view', 'prowler').ok).toBe(true)   // Hunter may see 149's schedule
    signInAs('ad9', 'a9')                                               // Kestrel, 149's admin
    const all = keys()
    expect(setQualsPageCols(qualsPageCols().slice(1))).toBe(true)        // 149's list loses its first column
    expect(storedKeys('u149')).toEqual(all.slice(1))
    signInAs('ad2', 'a2')                                               // Hunter, 142
    expect(UNIT).toBe('u142')
    expect(keys(), "142's columns").toEqual(all)
    switchUnit('u149')                                                  // the "149 ▾" pick
    expect(keys(), "still 142's columns — his Quals page is 142's").toEqual(all)
    expect(setQualsPageCols(qualsPageCols().slice(2))).toBe(true)        // he edits HIS page's list
    expect(storedKeys('u142'), "the edit is 142's").toEqual(all.slice(2))
    expect(storedKeys('u149'), "149's list untouched").toEqual(all.slice(1))
  })

  it("the Inputs look-ahead: 149 opens on 5 weeks; Ranger (142 member, View of 149) picks 149 — his page still opens on 142's", () => {
    signInAs('ad', 'a')
    expect(setGrant('acus', 'u149', 'view', 'bane').ok).toBe(true)
    signInAs('ad9', 'a9')
    expect(setInputsLookahead(5, false)).toBe(true)
    expect(unitSetting('u149', 'lookahead', null)).toEqual({ w: 5, s: false })
    signInAs('us', 'us')
    expect(inputsLookahead().weeks, "142's look-ahead").toBe(2)
    switchUnit('u149')
    expect(inputsLookahead().weeks, "still 142's look-ahead").toBe(2)
  })

  it("the Inputs look-ahead: Hunter (View of 149) picks 149 and sets 4 weeks — 142's is set, 149's left", () => {
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'view', 'prowler').ok).toBe(true)
    signInAs('ad9', 'a9')
    expect(setInputsLookahead(5, false)).toBe(true)
    signInAs('ad2', 'a2')
    switchUnit('u149')
    expect(setInputsLookahead(4, true)).toBe(true)
    expect(unitSetting('u142', 'lookahead', null), "142's look-ahead set").toEqual({ w: 4, s: true })
    expect(unitSetting('u149', 'lookahead', null), "149's untouched").toEqual({ w: 5, s: false })
    expect(inputsLookahead()).toEqual({ weeks: 4, toSunday: true })
  })

  it("the SANS calendar's colours: 149 sets its own; Ranger (View of 149) picks 149 — his calendar keeps 142's", () => {
    signInAs('ad', 'a')
    expect(setGrant('acus', 'u149', 'view', 'bane').ok).toBe(true)
    signInAs('ad9', 'a9')
    expect(saveTones({ yellowFrom: 2, amberFrom: 4, redFrom: 6 }).ok).toBe(true)
    signInAs('us', 'us')
    expect(sansCalTones(), "142's colours").toEqual(DEFAULT_TONES)
    switchUnit('u149')
    expect(sansCalTones(), "still 142's colours").toEqual(DEFAULT_TONES)
  })

  it('control — a master admin\'s pick moves his own pages (D2197): Saber picks 149 and reads 149\'s', () => {
    signInAs('ad9', 'a9')
    const all = keys()
    expect(setQualsPageCols(qualsPageCols().slice(1))).toBe(true)
    expect(setInputsLookahead(5, false)).toBe(true)
    signInAs('ad', 'a')                                                 // Saber, master admin, 142
    expect(keys()).toEqual(all)
    switchUnit('u149')
    expect(keys(), "149's columns").toEqual(all.slice(1))
    expect(inputsLookahead().weeks, "149's look-ahead").toBe(5)
  })
})
