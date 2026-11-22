// @vitest-environment jsdom
/* FABLE OIL READ, 22 Nov 26 — proof test. D81: "A worked weekend that earns nobody any OIL says so — on the day and at
   publish, with the reason." Built for a desk with no times (OIL_NO_TIMES, the publish note's "no usable times"). A
   weekend whose work is an input nobody answered the OIL question for is the same silence: the day publishes, the man
   on it earns nothing, and neither the day's warning list nor the publish note says so — the "OIL?" sign stands only on
   the Inputs pages, and the one list is opened by a holiday, a load and a plan switch, never by a publish. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED, signOf, dayApproved } from '../engine/publish'
import { HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { validate, WARN } from '../engine/validate'
import { initStore, writeInputsBatch } from '../state/store'
import { commitSetDayApproved } from '../state/sched-commit'
import { setSession } from '../state/auth'
import * as view from '../state/view'
import { _resetDisclosure } from '../state/disclosure'
import { projectPeople } from './state/raptorRoster'
import { getState, initStore as lwInitStore, setPeople, setRole } from './state/store'
import { memoryBackend } from './state/storage'
import { runOilPass, oilOpenOn, wireLeaveWarSync } from './sync'
import { OILLIST } from '../ui/pops'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5, SAT_ISO = '2026-07-18'
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const cell = (p: string, iso: string) => getState().wars[0]!.grid[p]?.[iso]
let said: string[] = []
const realToast = HOOKS.toast
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  stashClear()
  setSession({ user: 'ad', role: 'admin' })
  view.selDrop(); view.armDrop(); view.setUnpubArm(null); view.DPREV.clear()
  initStore()
  lwInitStore(memoryBackend()); setPeople(projectPeople()); setRole('admin')
  wireLeaveWarSync()
  _resetDisclosure()
  said = []
  HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
  view.setPage('editsched')
})
afterEach(() => { HOOKS.toast = realToast })

describe('a weekend whose only work is an input with no OIL answer', () => {
  it('publishing it says that nobody earns OIL and why — on the day and at publish (D81)', () => {
    /* the Saturday holds one thing: Bane's Training, 08:00 to 17:00, on the programme, its OIL question never answered */
    const d: any = DAYS[SAT]; d.waves = []; d.sims = {}; d.dutywaves = []; d.ground = []; d.notes = []; d.allhands = []
    const row: any = { iid: 'fx-train', person: 'bane', type: 'Training', date: 'Jul 18', yr: 2026, allday: false, s: 480, e: 1020, remarks: '', mod: 'now' }
    expect(writeInputsBatch(() => { INPUTS.push(row) })).toBe(true)
    view.afterSchedMutate()
    expect(oilOpenOn(SAT_ISO, SAT_ISO).map(o => o.iid), 'setup: the question is open').toContain('fx-train')
    sign(SAT); commitSetDayApproved(SAT, true); runOilPass()
    expect(dayApproved(SAT), 'setup: it published').toBe(true)
    expect(cell('bane', SAT_ISO), 'setup: nine hours on a published Saturday, and no OIL').toBeUndefined()
    validate()
    const onDay = ((WARN.byDay[SAT] || {}).warns || []).map((w: any) => String(w.msg || ''))
    const spoke = [...said, ...onDay].filter(t => /OIL/.test(t))
    expect({ spoke, listOpened: !!OILLIST }, 'the day or the publish says nobody earns OIL and why, or the list of open questions opens')
      .not.toEqual({ spoke: [], listOpened: false })
  })
})
