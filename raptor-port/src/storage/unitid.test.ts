/* THE UNIT-QUALIFIED RECORD ID round-trips (multi-squadron batch 1, step 2 — storage/unitid.ts). Every kind of id a
   unit's record carries today goes in and comes back whole: a week's dates with their slashes or hyphens, a day's `#n`,
   an issued version's `:` and `~`, a settings name, a planning row's `pp:` / `dm:` — and the unit is never mistaken for
   part of the date. */
import { describe, it, expect } from 'vitest'
import { qualify, split, unitOf, localOf, ensureUnit, isUnitId } from './unitid'
import { weekId, weekKey } from '../state/persist'
import { dayIso, parseVerId } from '../engine/verid'

const IDS = [
  '13/07/2026', '13-07-2026', '13/07/2026#2', '13-07-2026#6',
  '13/07/2026:13Jul26~0', '13-07-2026:is:13Jul26~1', '13-07-2026:rx:13Jul26~0',
  'rules', 'flyday:2026-07-14', 'pp:ppmwkx2k3r7l926i', 'dm:2026-07-14', 'stores',
]

describe('the one encoding: <unit>@<id>', () => {
  it('every id a unit record carries round-trips, for each unit', () => {
    for (const u of ['u142', 'u149', 'u1z9']) for (const id of IDS) {
      const q = qualify(u, id)
      expect(q).toBe(`${u}@${id}`)
      expect(split(q)).toEqual({ unit: u, local: id })
      expect(unitOf(q)).toBe(u)
      expect(localOf(q)).toBe(id)
    }
  })

  it('an id with no unit reads as itself, unit null — a community record or a bare week key', () => {
    for (const id of [...IDS, 'account:acad', 'accessreq:rq1', 'i57', '']) {
      expect(split(id)).toEqual({ unit: null, local: id })
      expect(localOf(id)).toBe(id)
    }
  })

  it('only a well-formed unit before the @ counts as one: an @ inside a sign-in name is not a unit', () => {
    expect(split('wren@mail')).toEqual({ unit: null, local: 'wren@mail' })
    expect(split('U142@rules').unit).toBeNull()          // capitals are not a unit id
    expect(split('u-142@rules').unit).toBeNull()         // nor a hyphen
    expect(split('@rules').unit).toBeNull()
  })

  it('a malformed unit is refused, and a record never carries two units', () => {
    expect(() => qualify('149', 'rules')).toThrow()
    expect(() => qualify('u14-9', 'rules')).toThrow()
    expect(() => qualify('u149', 'u142@rules')).toThrow()
    expect(ensureUnit('u149', 'u142@rules')).toBe('u142@rules')   // already named: kept as it is
    expect(ensureUnit('u149', 'rules')).toBe('u149@rules')
    expect(isUnitId('u142')).toBe(true); expect(isUnitId('x142')).toBe(false); expect(isUnitId(142)).toBe(false)
  })

  it('the date part is read only after the unit is split off', () => {
    // a stored week row id and the stream's week key turn into each other with the unit kept
    expect(weekId('u149@13/07/2026')).toBe('u149@13-07-2026')
    expect(weekKey('u149@13-07-2026#3')).toBe('u149@13/07/2026#3')
    // a day's date from a qualified week is the same as from the bare one
    for (let di = 0; di < 7; di++) expect(dayIso('u149@13/07/2026', di)).toBe(dayIso('13/07/2026', di))
    // a version id keeps its own grammar inside a qualified record id
    expect(parseVerId(localOf('u149@13Jul26~2').split(':').pop()!).iso).toBe(parseVerId('13Jul26~2').iso)
  })
})
