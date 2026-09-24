// [HUMAN-RETEST] the amendment system, walk W4-F1 (24 Sep 26). Register AM47 (owner D2, 21 Sep 26):
// a holiday declared AFTER a day went out waits for a republication — AND THE DAY SAYS SO. The
// saying is the "Became a holiday after publishing — republish for its OIL" advisory, which only the
// schedule's checks (validate) raise; a Leave War write re-ran the OIL pass but never those checks,
// so the day read an unexplained "1 pending" until something else (a reload, an unrelated edit)
// happened to re-check it. Same harness as publishdoor.test.ts: both real stores, the live sync lanes.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, signOf } from '../engine/publish'
import { WARN } from '../engine/validate'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore } from '../state/store'
import { commitSetDayApproved } from '../state/sched-commit'
import { setSession } from '../state/auth'
import { projectPeople } from './state/raptorRoster'
import { initStore as lwInitStore, setDayEvent, setPeople, setRole } from './state/store'
import { memoryBackend } from './state/storage'
import { wireLeaveWarSync } from './sync'

const ISNAP = JSON.stringify(INPUTS)
const DSNAP = JSON.stringify(DAYS)
const TUE = 1, TUE_ISO = '2026-07-14'

beforeEach(() => {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  stashClear()
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
})
afterEach(() => { setSession(null) })

const codesOn = (di: number) => ((WARN.byDay[di] && WARN.byDay[di].warns) || []).map((w: any) => w.code)

describe('a Leave War change that moves what a published day earns re-checks the day at once (W4-F1, AM47)', () => {
  it('declaring a holiday on the war after publishing raises the day\'s advisory without a reload', () => {
    const g = signOf(TUE); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    commitSetDayApproved(TUE, true)                         // published as an ordinary Tuesday
    expect(codesOn(TUE)).not.toContain('OIL_STALE_DAY')
    setRole('admin')
    setDayEvent(TUE_ISO, 0, 'PH')                           // the holiday is declared on the war, afterwards
    expect(codesOn(TUE), 'the day says why it now reads pending').toContain('OIL_STALE_DAY')
    setDayEvent(TUE_ISO, 0, '')                             // and taken away again
    expect(codesOn(TUE), 'the advisory goes with it').not.toContain('OIL_STALE_DAY')
  })
})
