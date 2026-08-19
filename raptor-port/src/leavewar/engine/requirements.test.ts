import { describe, expect, it } from 'vitest'
import { describeRule, requirementFor, type ManningRule, type Requirement, type Requirements } from './requirements'

const rule = (id: string, over: Partial<ManningRule> = {}): ManningRule => ({
  id,
  label: id.toUpperCase(),
  count: { kind: 'people', filter: {} },
  threshold: { amber: 2, red: 1 },
  ...over,
})

const base: Requirement = { rules: [rule('sets'), rule('ip'), rule('sxo')] }

const reqs: Requirements = { default: base, overrides: {} }

describe('requirementFor', () => {
  it('returns the period default for an ordinary day', () => {
    expect(requirementFor(reqs, '2026-01-07')).toBe(base)
  })

  it('returns the override for a day that has one', () => {
    const heavy: Requirement = { rules: [rule('sets', { threshold: { amber: 7, red: 6 } })] }
    const withOverride: Requirements = { default: base, overrides: { '2026-01-20': heavy } }
    expect(requirementFor(withOverride, '2026-01-20')).toBe(heavy)
    expect(requirementFor(withOverride, '2026-01-21')).toBe(base)
  })

  it('lets a day require no manning at all', () => {
    const none: Requirement = { rules: [] }
    const withOverride: Requirements = { default: base, overrides: { '2026-01-25': none } }
    expect(requirementFor(withOverride, '2026-01-25').rules).toEqual([])
  })
})

// The sheet's words are WRITTEN FROM the rule when it carries no hand `desc`,
// so what the admin built is what the squadron reads — pinned here because a
// description that lied about the rule would be worse than none.
describe('describeRule', () => {
  const qualLabel = (k: string) => ({ sxo: 'SXO', scDay: 'SC DAY', nvg: 'NVG' } as Record<string, string>)[k] ?? k.toUpperCase()

  it('says who a people rule counts, filters included', () => {
    const r = rule('x', { count: { kind: 'people', filter: { seats: ['pilot'], cats: ['A', 'B'], quals: ['nvg'] } } })
    expect(describeRule(r, qualLabel)).toBe(
      'Counts available pilots with CAT A or B holding NVG. Ground crew never counted; a half day of leave costs half a person.',
    )
  })

  it('speaks "everyone except" for a not-CAT filter and missing quals', () => {
    const r = rule('x', { count: { kind: 'people', filter: { notCats: ['OCU'], notQuals: ['sxo'] } } })
    expect(describeRule(r, qualLabel)).toContain('crew (pilot or WSO) not CAT OCU without SXO')
  })

  it('spells a team out slot by slot, with the size and the duty reading', () => {
    const r = rule('x', {
      count: {
        kind: 'team',
        slots: [
          { count: 2, filter: { seats: ['pilot'], quals: ['scDay'] } },
          { count: 1, filter: { quals: ['sxo'] } },
          { count: 1, filter: {} },
        ],
        presence: true,
      },
    })
    const words = describeRule(r, qualLabel)
    expect(words).toContain('One team is 2 pilots holding SC DAY + 1 crew (pilot or WSO) holding SXO + 1 crew (pilot or WSO) — 4 different people')
    expect(words).toContain('how many complete teams')
    expect(words).toContain('SC duty still counts')
  })

  it('says when the cell shows the people inside the teams instead', () => {
    const r = rule('x', {
      count: { kind: 'team', slots: [{ count: 1, filter: { seats: ['pilot'] } }, { count: 1, filter: { seats: ['wso'] } }], show: 'people' },
    })
    expect(describeRule(r, qualLabel)).toContain('how many people fill complete teams (teams × 2)')
  })
})
