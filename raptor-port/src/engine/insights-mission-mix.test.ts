/* MIX4 — applicable behavioural watches; see Insights build register. */
/* D512–D532: computation tests, not a substitute for the real setting/answer/editor routes.
   Deliberately pin seat counting, aircraft eligibility and unchanged hours before adding the split. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { HOOKS } from './hooks'
import { computeInsights } from './insights'
import { makeStandalone } from './waves'
import { resetSched } from './publish'

const original = JSON.stringify(DAYS)
const hooks = { ...HOOKS }
const f = (msn: string, aircraft: any[]) => ({ rid: `test-${msn}`, cs: msn, msn, to: '12:00', ld: '13:00', aircraft })
const a = (p = '', w = '', rmks = '') => ({ p, w, rmks, opts: {}, area: '' })
beforeEach(() => {
  resetSched()
  DAYS.splice(0, DAYS.length, ...JSON.parse(original))
  for (const d of DAYS) d.waves = []
  ;(HOOKS as any).missionRoleEnabled = () => true
  HOOKS.missionRoleReader = () => () => null
})
afterEach(() => { DAYS.splice(0, DAYS.length, ...JSON.parse(original)); Object.assign(HOOKS, hooks); resetSched() })

describe('D512 D516 D517 D523 D531 — one same traversal for total and formation role', () => {
  it('a person in both seats counts twice; a crew-empty aircraft still counts as a sortie', () => {
    DAYS[0].waves = [{ label: '1', formations: [f('ACM', [a('ignite', 'ignite'), a()]), f('RED AIR', [a('ignite')])] }] as any
    const got: any = computeInsights()
    expect(got.sorties).toBe(3)
    expect(got.forms).toBe(2)
    expect(got.flyers.find((p: any) => p.id === 'ignite')).toMatchObject({ n: 3, roleMix: { blue: 2, red: 1, unresolved: 0 } })
  })
  it('a conditional role affects the whole formation; cancelled aircraft cue context but never count', () => {
    const cancelled = { ...a('stiff', '', 'DS FOR VL'), cx: true }
    DAYS[0].waves = [{ label: '1', formations: [f('ACM', [a('ignite'), a('bane'), cancelled]), { ...f('RED', [a('stiff')]), cx: true }] }] as any
    const got: any = computeInsights()
    expect(got.sorties).toBe(2)
    for (const id of ['ignite', 'bane']) expect(got.flyers.find((p: any) => p.id === id)).toMatchObject({ n: 1, roleMix: { blue: 0, red: 0, unresolved: 1 } })
    expect(got.flyers.some((p: any) => p.id === 'stiff')).toBe(false)
  })
  it('SC/AVALON/BB remain outside flying load and tracking changes no work-hours total', () => {
    DAYS[0].waves = ['sc', 'avalon', 'bb'].map(k => makeStandalone(k))
    const on: any = computeInsights()
    ;(HOOKS as any).missionRoleEnabled = () => false
    const off: any = computeInsights()
    expect(on.sorties).toBe(0)
    expect(on.flyers).toEqual([])
    expect(on.hours).toEqual(off.hours)
  })
})
