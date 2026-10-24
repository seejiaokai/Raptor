/* THE INPUT KIND "UNA" — UNAVAILABLE, AN UNFORESEEN ABSENCE (owner D1303, D1324, D1325, 24 Oct 26 — round 2,
   [LW-FILE-OD-CRS]; the design note docs/superpowers/specs/2026-10-24-lw-file-od-cse-una.md).

   His words: "I want the ability to add in things that are unforeseen … to indicate that this person is not part of the
   manning … is there another way to name it to not confuse it" (D1303 — named apart from the Inputs page's "Other",
   which leaves a man in the manning); "UNA can use the same as OD" (D1324).

   So UNA is one more row of the ONE table (engine/inputs.ts INPUT_META) with the overseas duty's flags to the letter, and
   every rule follows from the table — out of reach, under Unavailable, asks the OIL question on a weekend, takes a
   title. ONE exception, by his own reason for the medical kinds: the LATE mark skips it, as it skips a downchit — an
   unforeseen absence cannot be filed before a deadline. */
import { afterEach, describe, expect, it } from 'vitest'
import {
  INPUT_META, INPUT_TYPES, canSpare, inputRuleText, isLateInput, isPersonal, isUnavail, oilAsks, restsInput, titledKind, typeGroup,
} from './inputs'
import { INPUT_TYPES as SCHEMA_TYPES } from './schema'
import { rulesReset } from './rules'
import { storeBackend } from './hooks'

afterEach(() => { rulesReset(); storeBackend.impl = null })

describe('D1303 / D1324 — UNA is a kind, the overseas duty’s twin', () => {
  it('is in the one table, straight after OD, with OD’s flags to the letter, named "unavailable"', () => {
    expect(INPUT_TYPES).toContain('UNA')
    expect(INPUT_TYPES.indexOf('UNA')).toBe(INPUT_TYPES.indexOf('OD') + 1)
    const { name, ...flags } = INPUT_META['UNA']
    const { name: _o, ...od } = INPUT_META['OD']
    expect(flags).toEqual(od)
    expect(name).toBe('unavailable')
    expect(SCHEMA_TYPES, 'the declared record types carry it too').toContain('UNA')
  })
  it('follows OD in every rule: out of reach, under Unavailable, the OIL question, a title, the same sentence', () => {
    for (const ask of [isUnavail, isPersonal, canSpare, restsInput, oilAsks, titledKind, typeGroup, inputRuleText] as Array<(t: string) => unknown>)
      expect(ask('UNA'), ask.name).toEqual(ask('OD'))
    expect(isUnavail('UNA')).toBe(true)
    expect(canSpare('UNA'), 'not even an SC SPARE').toBe(false)
    expect(typeGroup('UNA'), 'listed under "Duty & other commitments"').toBe('other')
  })
  it('the LATE mark skips it, as it skips a downchit — where the same OD filed as late is marked', () => {
    const late = (type: string) => ({ person: 'yeti', date: 'Jul 14', type, allday: true, mod: '2026-06-30' })
    expect(isLateInput(late('OD')), 'OD, filed after the cut-off').toBe(true)
    expect(isLateInput(late('UNA')), 'UNA, the same day and stamp').toBe(false)
  })
})
