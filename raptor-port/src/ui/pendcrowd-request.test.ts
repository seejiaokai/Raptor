/* THE CHANGES LIST NAMES A REQUEST ROW'S CROWD CHANGE BY ITS ROW, AND GOES TO IT (Fable's final read, F3 —
   [DB-READINESS] group A, phase 7).

   On a published day, a change in who stands behind an ALL / ALL AVAIL puck is one line of the "To go out" list: the
   row's name, who left, who joined, and a tap that takes the schedule to it (D99, D44). The line was found by the row's
   own id — and a REQUEST's row is addressed by its request (`i:<request id>`), which that lookup never resolved. So a
   request row's crowd change read "A placeholder · who it stands for": no row named, nothing to tap. Older for a
   Training row; phase 7 makes a Personal row reach it too. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { SCHED, signOf, setDayApproved, dayHasChanges } from '../engine/publish'
import { ensureRowIds } from '../engine/rowids'
import { pendListHTML } from './pendlist'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const TUE = 1, TUE_ISO = '2026-07-14'
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel
let CROWD = ['bane', 'stiff', 'plasma']

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.correcting = {}
  Object.assign(DAYS[TUE] as any, { waves: [], dutywaves: [], sims: {}, ground: [], allhands: [], oild: undefined })
  ensureRowIds(DAYS)
  CROWD = ['bane', 'stiff', 'plasma']
  HOOKS.oilEarningDay = () => false
  HOOKS.oilDayISO = (di: number) => (di === TUE ? TUE_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => CROWD.slice()
})
afterEach(() => { HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel })

const publish = (di: number) => {
  const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
  setDayApproved(di, true)
}
/* a request landed on the Tuesday with ALL AVAIL under its row, then published; then one man is no longer free — for a
   reason that is NOT an input (so the line is the crowd's own, never folded into a leave's) */
const world = (type: string, prog: string) => {
  INPUTS.unshift({ iid: 'rq1', person: 'ignite', type, date: 'Jul 14', yr: 2026, acc: 'g', allday: false, s: 9 * 60, e: 17 * 60, remarks: '', mod: '2026-07-01' })
  ;(DAYS[TUE] as any).ground = [{ prog, str: '0900', end: '1700', who: 'ignite', src: 'rq1', srcType: type, more: ['allavail'] }]
  ensureRowIds(DAYS)
  publish(TUE)
  CROWD = ['bane', 'stiff']
  expect(dayHasChanges(TUE), 'the crowd changed: the day reads pending').toBe(true)
  return pendListHTML(TUE)
}

describe('a request row\'s crowd change is named by its row and can be tapped (Fable F3)', () => {
  it.each([['Personal', 'PERSONAL'], ['Training', 'TRAINING']])('a %s request\'s row', (type, prog) => {
    const html = world(type, prog)
    expect(html).toContain(`${prog} · who it stands for`)
    expect(html, 'never the nameless line').not.toContain('A placeholder')
    expect(html, 'and it is a line you can tap to go there').toMatch(/<button class="pl-item" data-plix="\d+"/)
  })

  it('THE CONTROL: a hand-built row reads as it always did', () => {
    ;(DAYS[TUE] as any).ground = [{ prog: 'OPS BRIEF', str: '0900', end: '1700', who: 'allavail' }]
    ensureRowIds(DAYS)
    publish(TUE)
    CROWD = ['bane', 'stiff']
    const html = pendListHTML(TUE)
    expect(html).toContain('OPS BRIEF · who it stands for')
    expect(html).toMatch(/<button class="pl-item" data-plix="\d+"/)
  })
})
