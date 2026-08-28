import { describe, expect, it } from 'vitest'
import {
  assignGroup,
  DEFAULT_GROUPS,
  groupLabel,
  matchesGroup,
  offerableGroups,
  orderedGroupIds,
  OTHER_ID,
  pruneGroups,
  qualGroupId,
  readGroupDefs,
  type GroupDef,
} from './groups'
import { groupOf, type Person } from './people'

const CATALOG = [
  { k: 'sxo', label: 'SXO' },
  { k: 'scDay', label: 'SC DAY' },
  { k: 'scNight', label: 'SC NIGHT' },
]

const person = (over: Partial<Person> = {}): Person => ({
  id: 'x', callsign: 'X', seat: 'pilot', band: 'ops', sxo: false,
  from: null, to: null, q: 'C', ...over,
} as Person)

describe('the default list reproduces the seven built-in groups exactly', () => {
  // The whole feature must be invisible until an admin uses it: an untouched
  // squadron sees the grouping it always had.
  it('assigns every kind of person the group groupOf would have', () => {
    const people = [
      person({ id: 'a', q: 'C', seat: 'pilot', band: 'ops' }),
      person({ id: 'b', q: 'IP', seat: 'pilot', band: 'instructor' }),
      person({ id: 'c', q: 'IW', seat: 'wso', band: 'instructor' }),
      person({ id: 'd', q: 'B', seat: 'wso', band: 'ops' }),
      person({ id: 'e', q: 'OCU', seat: 'pilot', band: 'ops' }),
      person({ id: 'f', seat: 'gnd', pers: true } as any),
      person({ id: 'g', sxo: true, q: 'IP', seat: 'pilot', band: 'instructor' }),
    ]
    const priority = DEFAULT_GROUPS.map(d => d.id)
    for (const p of people) {
      expect(assignGroup(p, DEFAULT_GROUPS, priority), p.id).toBe(groupOf(p))
    }
  })
})

describe('a qualification group, and the exactly-once rule', () => {
  const scDay: GroupDef = { id: qualGroupId('scDay'), kind: 'qual', k: 'scDay' }
  const catC: GroupDef = { id: 'OPSP', kind: 'cat', g: 'OPSP' }

  it('matches on a held qualification, however the person carries it', () => {
    // projected (xq) and the seed's own boolean both count — heldQuals unifies
    expect(matchesGroup(person({ xq: ['scDay'] } as any), scDay)).toBe(true)
    expect(matchesGroup(person({ scd: true } as any), scDay)).toBe(true)
    expect(matchesGroup(person({ xq: ['nvg'] } as any), scDay)).toBe(false)
  })

  // The owner's case: a CAT C pilot who is also SC Day shows under the
  // QUALIFICATION, not the CAT — decided purely by the priority order.
  it('gives a person matching both to whichever group ranks higher', () => {
    const p = person({ q: 'C', seat: 'pilot', band: 'ops', xq: ['scDay'] } as any)
    const defs = [catC, scDay]
    expect(assignGroup(p, defs, [scDay.id, catC.id])).toBe(scDay.id)
    expect(assignGroup(p, defs, [catC.id, scDay.id])).toBe(catC.id)
  })

  // The priority list is separate from the display order, so a stale or short
  // priority must not strand anyone: the display order finishes the job.
  it('falls back to the display order when priority does not name the group', () => {
    const p = person({ xq: ['scDay'] } as any)
    expect(assignGroup(p, [scDay], [])).toBe(scDay.id)
  })

  it('lands people no group claims in "Everyone else"', () => {
    const p = person({ q: 'C', seat: 'pilot', band: 'ops' })
    expect(assignGroup(p, [scDay], [scDay.id])).toBe(OTHER_ID)
  })
})

describe('the offerable list grows with the catalogue', () => {
  it('offers the seven built-ins plus one group per qualification', () => {
    const offered = offerableGroups(CATALOG)
    expect(offered.filter(d => d.kind === 'cat')).toHaveLength(DEFAULT_GROUPS.length)
    expect(offered.some(d => d.kind === 'qual' && d.k === 'scNight')).toBe(true)
    // a squadron-added column joins with no code change
    expect(offerableGroups([...CATALOG, { k: 'newthing', label: 'NEW' }])
      .some(d => d.kind === 'qual' && d.k === 'newthing')).toBe(true)
  })

  it('labels a qualification with the catalogue heading, or its key upper-cased', () => {
    expect(groupLabel({ id: 'q:scDay', kind: 'qual', k: 'scDay' }, CATALOG)).toBe('SC DAY')
    expect(groupLabel({ id: 'q:zz', kind: 'qual', k: 'zz' }, CATALOG)).toBe('ZZ')
    expect(groupLabel({ id: 'SXO', kind: 'cat', g: 'SXO' }, CATALOG)).toBe('SXO')
  })
})

describe('storage is untrusted, and a deleted qualification cannot strand a group', () => {
  it('prunes a group whose qualification has left the catalogue, keeping built-ins', () => {
    const defs: GroupDef[] = [
      { id: 'SXO', kind: 'cat', g: 'SXO' },
      { id: qualGroupId('scDay'), kind: 'qual', k: 'scDay' },
      { id: qualGroupId('gone'), kind: 'qual', k: 'gone' },
    ]
    const kept = pruneGroups(defs, CATALOG)
    expect(kept.map(d => d.id)).toEqual(['SXO', qualGroupId('scDay')])
  })

  it('reads only structurally sound entries, and de-dupes', () => {
    expect(readGroupDefs('nonsense')).toBeNull()
    const got = readGroupDefs([
      { kind: 'cat', g: 'SXO' },
      { kind: 'cat', g: 'NOPE' },        // not a built-in
      { kind: 'qual', k: 'scDay' },
      { kind: 'qual', k: 'scDay' },      // duplicate
      { kind: 'qual' },                  // no key
      null,
    ])
    expect(got!.map(d => d.id)).toEqual(['SXO', qualGroupId('scDay')])
  })

  it('heals a stored order: unknown ids dropped, unnamed groups appended', () => {
    const defs = DEFAULT_GROUPS
    const healed = orderedGroupIds(defs, ['PERS', 'ghost', 'SXO'])
    expect(healed.slice(0, 2)).toEqual(['PERS', 'SXO'])
    expect(healed).toHaveLength(defs.length)          // nothing lost
    expect(new Set(healed).size).toBe(defs.length)    // nothing duplicated
  })
})
