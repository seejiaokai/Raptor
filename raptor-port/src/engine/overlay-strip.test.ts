/* A DELETED MAN LEAVES EVERY SEAT HE HOLDS ON A DAY FROM HIS CUTOFF — the name box of a DEAD row of a shared input too
   (Fable's read of the finished code of the one-rule job, finding 2 — 12 Oct 26; owner D297, D299; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.3 "A man deleted").

   `stripPersonFromDay` took a `src` row away whole only where it was HIS (`hisLanded` — the input's only named person),
   and blanked a name box only on a row with NO `src`. A dead `kept` row of an input that holds several is neither: the
   reconcile leaves it as it is (it is not re-made while its request cannot stand there — D363), so his name stayed in
   its name box for good, though the places under it were blanked. Before the one-rule build a shared input was a
   record a man, so the row was his own and went whole.

   These cases call the strip on a hand-built day: they prove the calculation. The route on screen — re-date an input,
   load the older version, delete the man — is the walk's (share L, L2). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from './inputs'
import { stripPersonFromDay, hisLanded } from './overlay'

const SNAP = JSON.stringify(INPUTS)
beforeEach(() => { INPUTS.length = 0 })
afterEach(() => { INPUTS.length = 0; JSON.parse(SNAP).forEach((r: any) => INPUTS.push(r)) })

const input = (iid: string, people: string[], over: any = {}) => {
  const r = { iid, type: 'Meeting', title: 'Range brief', date: 'Jul 16', yr: 2026, allday: false, s: 840, e: 900, remarks: '', acc: 'g', by: 'stiff', people: people.map(p => ({ p })), ...over }
  INPUTS.push(r)
  return r
}
const day = (rows: any[]) => ({ dt: 'Jul 15', ground: rows })

describe('a deleted man on a row that came from an input of several (D297, D299)', () => {
  it('a DEAD kept row: his name leaves its name box; the others on it stay', () => {
    input('m1', ['bane', 'pike', 'split'])
    const d = day([{ prog: 'RANGE BRIEF', src: 'm1', kept: true, who: 'bane', more: ['pike', 'split'] }])
    const changed = stripPersonFromDay(d, 'bane', hisLanded(d, 'bane'))
    expect(changed).toBe(true)
    expect(d.ground).toHaveLength(1)
    expect(d.ground[0].who, 'his name is gone from the dead row').toBe('')
    expect(d.ground[0].more).toEqual(['pike', 'split'])
  })
  it('a dead kept row where he stands UNDER the name box loses him there, as before', () => {
    input('m1', ['bane', 'pike', 'split'])
    const d = day([{ prog: 'RANGE BRIEF', src: 'm1', kept: true, who: 'pike', more: ['bane', 'split'] }])
    stripPersonFromDay(d, 'bane', hisLanded(d, 'bane'))
    expect(d.ground[0].who).toBe('pike')
    expect(d.ground[0].more.filter(Boolean)).toEqual(['split'])
  })
  it('a row whose input no longer holds him (he was taken out, the row not yet re-made): his name leaves it', () => {
    input('m1', ['pike', 'split'])
    const d = day([{ prog: 'RANGE BRIEF', src: 'm1', who: 'bane', more: ['pike', 'split'] }])
    stripPersonFromDay(d, 'bane', hisLanded(d, 'bane'))
    expect(d.ground[0].who).toBe('')
  })
  it('his OWN one-person input\'s row still goes whole; a scheduler\'s own row still loses his name', () => {
    input('m2', ['bane'])
    const d = day([{ prog: 'SOLO', src: 'm2', who: 'bane' }, { prog: 'SQN PT', who: 'bane', more: ['pike'] }])
    stripPersonFromDay(d, 'bane', hisLanded(d, 'bane'))
    expect(d.ground.map((r: any) => r.prog)).toEqual(['SQN PT'])
    expect(d.ground[0].who).toBe('')
    expect(d.ground[0].more).toEqual(['pike'])
  })
})
