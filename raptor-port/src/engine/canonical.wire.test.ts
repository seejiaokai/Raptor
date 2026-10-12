/* THE PEOPLE OF A ROW THAT CAME FROM AN INPUT ARE ONE LIST PLACE — A WIRE NO TEST HELD ([ALL-AVAIL-AS-MEMBER], the break
   tests of 12 Oct 26 — docs/superpowers/briefs/2026-10-12-one-rule-break-tests-brief.md, group 2). Written with the
   wire broken on purpose (canonical.ts placeOf: an input's row given a name-box seat and a list under it, as any
   ground row has), red then, green on the code as built.

   The rule (canonical.ts placeOf; the one-rule plan §4.8): the name box and everyone under it are the input's people
   in the order they joined, "so the first one leaving and the next taking the name box is ONE person off and nothing
   more — never 'one off the box, one off the list, one on the box'". With the rule gone 23 test files stayed green: the
   day's count is made from the input's own lists (publish.ts, the people step), which swallows every unit of the row
   whatever shape it has — so the counts' tests cannot see this function. It is asked here of the units themselves, pure
   over two day objects, as pendunits.test.ts asks. */
import { describe, it, expect } from 'vitest'
import { canonicalUnits } from './canonical'

let n = 0
const rid = () => 'w' + (++n)
const gr = (who: string, more: string[], over: any = {}) => ({ rid: rid(), prog: 'RANGE SAFETY BRIEF', str: '14:00', end: '15:00', rmks: '', who, more, ...over })
const day = (over: any = {}) => ({ dow: 'Wed', dt: 'Jul 15', notes: [], allhands: [], waves: [], sims: { amt: [], oft: [] }, dutywaves: [], ground: [], simnotes: '', prognotes: '', dutynotes: '', grndnotes: '', ...over })
const clone = (d: any) => JSON.parse(JSON.stringify(d))
const units = (a: any, b: any) => canonicalUnits(a, b, 0)
/* the first to join leaves; the next takes the name box — what the row's door and the re-make leave behind */
const firstLeaves = (row: any) => { const was = day({ ground: [row] }), now = clone(was); now.ground[0].who = 'pike'; now.ground[0].more = ['split']; return units(was, now) }

describe('a row that came from an input: its name box and the places under it are ONE list place (D755, D756; the plan §4.8)', () => {
  it('the first person leaves and the next takes the name box: ONE unit — one person off, nobody on, nobody "moved"', () => {
    const u = firstLeaves(gr('bane', ['pike', 'split'], { src: 'i-wire', srcv: 'x' }))
    expect(u.map(x => x.kind), 'one unit, on the row\'s people').toEqual(['people'])
    expect(u[0]!.off, 'he is the one who left').toEqual(['bane'])
    expect(u[0]!.on || [], 'nobody arrived').toEqual([])
  })
  it('someone joins at the end: ONE unit — one person on', () => {
    const was = day({ ground: [gr('bane', ['pike'], { src: 'i-wire', srcv: 'x' })] }), now = clone(was)
    now.ground[0].more = ['pike', 'split']
    const u = units(was, now)
    expect(u.map(x => x.kind)).toEqual(['people'])
    expect([u[0]!.off || [], u[0]!.on]).toEqual([[], ['split']])
  })
  it('THE CONTROL — a row nobody filed keeps a name box of its own: the same hands there are more than one unit', () => {
    expect(firstLeaves(gr('bane', ['pike', 'split'])).length).toBeGreaterThan(1)
  })
  it('…and so does a dead `kept` row — the holder\'s own, though it still names its request', () => {
    expect(firstLeaves(gr('bane', ['pike', 'split'], { src: 'i-wire', srcv: 'x', kept: true })).length).toBeGreaterThan(1)
  })
})
