/* "UNA" IS NOT AN INPUT KIND (his D1338, 24 Oct 26 — "Maybe put UNA instead? But nowhere else … Yes but members can read
   its remarks too and its admin input only"; replacing D1335–D1337, which had UNA leave for an "Other" with a manning
   question). Round 2 had made UNA a kind of input, the overseas duty's twin (D1303, D1324); it is now the LEAVE WAR's own
   record — an admin places it, everyone sees it and reads its remarks, it takes the man out of the war's manning — and
   NOWHERE ELSE: the Inputs page's list of kinds, the stored record types, the schedule's Unavailable list, the OIL
   question and the LATE mark never meet it. These pin the Inputs side shut; the war's record is pinned beside it
   (leavewar/una.test.ts). */
import { describe, expect, it } from 'vitest'
import { INPUT_META, INPUT_TYPES, canSpare, isUnavail, oilAsks, titledKind } from './inputs'
import { INPUT_TYPES as SCHEMA_TYPES } from './schema'
import { colourOf } from '../ui/inputscal-model'
import { warVisible } from '../leavewar/absences'

describe('D1338 — UNA is not a kind of input', () => {
  it('is not in the Inputs page’s kinds, nor in the stored record types', () => {
    expect(INPUT_TYPES).not.toContain('UNA')
    expect(Object.keys(INPUT_META)).not.toContain('UNA')
    expect(SCHEMA_TYPES, 'the declared record types').not.toContain('UNA')
  })
  it('an input typed "UNA" (a stored one, demo data — D56) is not read as the overseas duty’s twin', () => {
    expect(isUnavail('UNA'), 'not under the schedule’s Unavailable as a kind of its own').toBe(false)
    expect(titledKind('UNA')).toBe(false)
    expect(oilAsks('UNA')).toBe(oilAsks('a kind nobody knows'))
    expect(canSpare('UNA')).toBe(canSpare('a kind nobody knows'))
  })
  it('the Leave War does not read it off the Inputs, and the Inputs calendar gives it no colour of its own', () => {
    expect(warVisible('UNA')).toBe(false)
    expect(colourOf('UNA')).toBeNull()
  })
})
