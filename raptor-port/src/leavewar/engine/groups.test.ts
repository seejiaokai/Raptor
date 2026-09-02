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
  SANS_GROUP,
  SANS_GROUP_ID,
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

/* THE STANDARD CATEGORIES OVERLAP, AND THE PAGE ORDER SETTLES IT (owner, 3 Sep
   26 — "if person A is an IP and SXO, vs person B is IP only. If SXO is top
   priority, person A will go to the top. If IP is top priority, would both
   person go to IP instead?" — yes). A category is a FIT check now, not an
   exclusive partition; the first fit down the priority walk claims the person. */
describe('the standard categories overlap, and the higher one claims', () => {
  const SXO: GroupDef = { id: 'SXO', kind: 'cat', g: 'SXO' }
  const IP: GroupDef = { id: 'IP', kind: 'cat', g: 'IP' }
  const personA = person({ id: 'a', sxo: true, q: 'IP', seat: 'pilot', band: 'instructor' })
  const personB = person({ id: 'b', sxo: false, q: 'IP', seat: 'pilot', band: 'instructor' })

  it('an SXO IP fits both SXO and IP; an IP-only fits IP alone', () => {
    expect(matchesGroup(personA, SXO)).toBe(true)
    expect(matchesGroup(personA, IP)).toBe(true)
    expect(matchesGroup(personB, SXO)).toBe(false)
    expect(matchesGroup(personB, IP)).toBe(true)
  })

  it("the owner's example: SXO on top draws A under SXO; IP on top draws both under IP", () => {
    const defs = [SXO, IP]
    expect(assignGroup(personA, defs, ['SXO', 'IP'])).toBe('SXO')
    expect(assignGroup(personB, defs, ['SXO', 'IP'])).toBe('IP')
    expect(assignGroup(personA, defs, ['IP', 'SXO'])).toBe('IP')
    expect(assignGroup(personB, defs, ['IP', 'SXO'])).toBe('IP')
  })

  it('an OCU trainee fits OCU, never OPS P / OPS W — so the default page is unchanged', () => {
    const ocuP = person({ q: 'OCU', seat: 'pilot', band: 'ops' })
    const ocuW = person({ q: 'OCU', seat: 'wso', band: 'ops' })
    expect(matchesGroup(ocuP, { id: 'OCU', kind: 'cat', g: 'OCU' })).toBe(true)
    expect(matchesGroup(ocuP, { id: 'OPSP', kind: 'cat', g: 'OPSP' })).toBe(false)
    expect(matchesGroup(ocuW, { id: 'OPSW', kind: 'cat', g: 'OPSW' })).toBe(false)
  })

  it('ground crew fit Personnel and nothing else', () => {
    const gnd = person({ seat: 'gnd', pers: true, sxo: true } as any)
    for (const d of DEFAULT_GROUPS) expect(matchesGroup(gnd, d), d.id).toBe(d.id === 'PERS')
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

  /* A qualification that already IS a group by another name is not offered twice
     (owner, 3 Sep 26 — "remove that extra SXO, since its the same"): `sxo` is the
     SXO category, `san` the Show-SANS group. A stored one is pruned too. */
  it('never offers SXO or SANS as a qualification group, and prunes a stored one', () => {
    const offered = offerableGroups([...CATALOG, { k: 'san', label: 'SANS' }])
    expect(offered.some(d => d.kind === 'qual' && d.k === 'sxo')).toBe(false)
    expect(offered.some(d => d.kind === 'qual' && d.k === 'san')).toBe(false)
    expect(offered.filter(d => d.id === 'SXO')).toHaveLength(1)
    const kept = pruneGroups(
      [{ id: 'SXO', kind: 'cat', g: 'SXO' }, { id: qualGroupId('sxo'), kind: 'qual', k: 'sxo' }, { id: qualGroupId('scDay'), kind: 'qual', k: 'scDay' }],
      [...CATALOG, { k: 'san', label: 'SANS' }],
    )
    expect(kept.map(d => d.id)).toEqual(['SXO', qualGroupId('scDay')])
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

/* THE SANS GROUP (owner, 3 Sep 26 — SANS as their own category at the foot). A
   special kind matching the projected `san` flag, labelled SANS, and never
   dropped by a catalogue prune (it does not depend on a Quals column). The store
   auto-injects it while Show SANS is on; the engine only has to recognise it. */
describe('the SANS group', () => {
  it('matches a SANS body and nobody else', () => {
    expect(matchesGroup(person({ san: true } as any), SANS_GROUP)).toBe(true)
    expect(matchesGroup(person({ san: false } as any), SANS_GROUP)).toBe(false)
    expect(matchesGroup(person({} as any), SANS_GROUP)).toBe(false)
  })

  it('is labelled SANS, whatever the catalogue holds', () => {
    expect(groupLabel(SANS_GROUP, CATALOG)).toBe('SANS')
    expect(groupLabel(SANS_GROUP, [])).toBe('SANS')
  })

  it('survives a catalogue prune (it is not a qualification)', () => {
    const kept = pruneGroups([{ id: 'SXO', kind: 'cat', g: 'SXO' }, SANS_GROUP], [])
    expect(kept.map(d => d.id)).toEqual(['SXO', SANS_GROUP_ID])
  })

  it('wins a tie when ranked first, drawing a SANS pilot off their CAT', () => {
    const sansPilot = person({ san: true, q: 'C', seat: 'pilot', band: 'ops' } as any)
    const catC: GroupDef = { id: 'OPSP', kind: 'cat', g: 'OPSP' }
    const defs = [catC, SANS_GROUP]
    expect(assignGroup(sansPilot, defs, [SANS_GROUP_ID, catC.id])).toBe(SANS_GROUP_ID)
    expect(assignGroup(sansPilot, defs, [catC.id, SANS_GROUP_ID])).toBe('OPSP')
  })
})
