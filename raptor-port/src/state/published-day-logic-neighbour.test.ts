// @vitest-environment jsdom
/* D2005, THE TWO BLIND READS' FINDINGS, PINNED — F5 (12 Nov 26): the neighbour week's published Monday is judged by the
   same settings on Edit Schedule's Sunday mark as on its own working copy. Written by the fresh Opus reader as a proof
   test, red on the first build. Harness copied from state/kept-rules-neighbour.test.ts. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { PEOPLE, ID_BY_CS } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED, setSign } from '../engine/publish'
import { validate, traceOf, workingWarn } from '../engine/validate'
import { VCONF } from '../engine/rules'
import { ELOG } from '../engine/editlog'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { initStore, weekStashSnap, weekDirty, loadWeek } from '../state/store'
import { commitSetDayApproved, schedWrite, SCHED_TYPES } from '../state/sched-commit'
import { setSession } from '../state/auth'
import { hydrate, wirePersist } from '../state/persist'
import { registerChangeLines } from '../state/changelines'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetDisclosure } from '../state/disclosure'
import * as view from '../state/view'

const ISNAP = JSON.stringify(INPUTS), PSNAP = JSON.stringify(PEOPLE), DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026', W2 = '20/07/2026'
const MON = 0, SUN = 6
const BL = VCONF.briefLead
function resetWorld() {
  if (CURWEEK !== W1) loadWeek(W1)
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
  Object.assign(PEOPLE, JSON.parse(PSNAP))
  for (const k of Object.keys(ID_BY_CS)) delete ID_BY_CS[k]
  for (const id of Object.keys(PEOPLE)) ID_BY_CS[PEOPLE[id].cs.toLowerCase()] = id
  PLANPUCKS.length = 0; for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  view.WARNOFF.clear(); ELOG.rows.length = 0
  stashClear()
}
async function boot(be: MemoryBackend) {
  if (!be.peek('settings', 'schema')) be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
  const p = bootStorage(be)
  await vi.advanceTimersByTimeAsync(be.latency)
  const { wb } = await p
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb); initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  _resetDisclosure(); _resetTimeline(); installGlobalUndo(); registerChangeLines()
  setSession({ user: 'ad', role: 'admin' })
  return wb
}
const sign = (di: number) => { setSign(di, 'cur', 'ignite'); setSign(di, 'sked', 'bane'); setSign(di, 'plan', 'stiff'); setSign(di, 'appr', 'pump') }
const publish = (di: number) => { sign(di); expect((commitSetDayApproved(di, true) as any).ok, 'published').not.toBe(false) }
const crWork = (di: number, id: string) => ((workingWarn().byDay[di] || {}).warns || []).filter((w: any) => w.code === 'CREW_REST' && (w.who || []).includes(id))

beforeEach(() => { vi.useFakeTimers(); resetWorld() })
const CR = VCONF.crewRest
afterEach(() => { (VCONF as any).briefLead = BL; (VCONF as any).crewRest = CR; _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); storeBackend.impl = null })

describe('F5 — the working pass across the edge: a neighbour Monday with a change waiting (its printed brief)', () => {
  it('Edit Schedule: Sunday draws "Breaks Monday" exactly when Monday\'s own working copy carries the breach', async () => {
    await boot(new MemoryBackend())
    loadWeek(W2)
    schedWrite(SCHED_TYPES.mutate, () => {
      const d: any = DAYS[MON]
      Object.assign(d, { waves: [{ label: 'WAVE 1', night: false, intimes: [], traffic: [], formations: [{ cs: 'VL', msn: 'BFM', to: '12:00', ld: '13:00', br: '', rl: '', aircraft: [{ p: 'bane', w: '', rmks: '', area: '', opts: {} }] }] }], dutywaves: [], ground: [], allhands: [], sims: { amt: [], oft: [] } })
      view.afterSchedMutate()
    })
    publish(MON)
    loadWeek(W1)
    schedWrite(SCHED_TYPES.mutate, () => {
      const d: any = DAYS[SUN]
      Object.assign(d, { waves: [], ground: [], allhands: [], sims: { amt: [], oft: [] }, dutywaves: [{ label: 'DUTY', rows: [{ role: 'Duty', id: 'bane', str: '1300', end: '2130' }] }] })
      view.afterSchedMutate()
    })
    validate()
    expect(traceOf(SUN, 'bane'), 'premise: no Breaks Monday').toBeFalsy()
    ;(VCONF as any).crewRest = 780          // 13h: clear 10:30
    ;(VCONF as any).briefLead = 141         // the printed brief moves a minute: Monday reads one change waiting (D186)
    validate()
    const sunMark = !!traceOf(SUN, 'bane')
    loadWeek(W2); validate()
    const monWork = crWork(MON, 'bane').length > 0
    expect({ sunMark, monWork }, 'Sunday\'s mark and Monday\'s working copy agree').toEqual({ sunMark: monWork, monWork })
  })
})
