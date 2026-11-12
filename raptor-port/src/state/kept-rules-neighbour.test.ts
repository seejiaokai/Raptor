// @vitest-environment jsdom
/* D1991 ACROSS THE WEEK'S EDGE (the bug check of 12 Nov 26 — the Opus read's finding 3, Astra's 3; the reader's proof
   test, kept). Next week's published Monday is judged by the brief lead it printed when its own week is open, but this
   week's Sunday asked a copy of that Monday built with TODAY's lead (weekctx.ts issuedDayIn → nextMondaySeed → buildDay;
   the copy never met faceattrs' kept-rules map). After a Logic change the two disagreed: Sunday said "Breaks Monday"
   while Monday's own published face carried no breach. Fixed: the copy carries the values its version kept
   (faceattrs.ts keepRulesOn), and a neighbour whose kept values differ forces the official pass (weekctx.ts
   windowDiverges). */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { PEOPLE, ID_BY_CS } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED, setSign, daySnapOf, dayCurVer } from '../engine/publish'
import { validate, officialWarn, withOfficialWarn, traceOf } from '../engine/validate'
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
import { hm24 } from '../engine/time'

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
const crOn = (di: number, id: string) => ((officialWarn().byDay[di] || {}).warns || []).filter((w: any) => w.code === 'CREW_REST' && (w.who || []).includes(id))

beforeEach(() => { vi.useFakeTimers(); resetWorld() })
const CR = VCONF.crewRest
afterEach(() => { (VCONF as any).briefLead = BL; (VCONF as any).crewRest = CR; _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); storeBackend.impl = null })

describe('D1991 — next week\'s published Monday and this week\'s Sunday after a brief-lead change', () => {
  it('Sunday\'s "Breaks Monday" must agree with Monday\'s published face (D1991: judged by the brief it printed)', async () => {
    await boot(new MemoryBackend())
    /* next week: one flying line for bane on Monday, take-off 12:00, B blank, no in-time — then published */
    loadWeek(W2)
    schedWrite(SCHED_TYPES.mutate, () => {
      const d: any = DAYS[MON]
      Object.assign(d, { waves: [{ label: 'WAVE 1', night: false, intimes: [], traffic: [], formations: [{ cs: 'VL', msn: 'BFM', to: '12:00', ld: '13:00', br: '', rl: '', aircraft: [{ p: 'bane', w: '', rmks: '', area: '', opts: {} }] }] }], dutywaves: [], ground: [], allhands: [], sims: { amt: [], oft: [] } })
      view.afterSchedMutate()
    })
    publish(MON)
    const snap: any = daySnapOf(MON, dayCurVer(MON))
    /* (since D2005 the version keeps every Logic setting — the brief lead among them) */
    expect(snap && snap.rv && snap.rv.briefLead, 'Monday went out with the brief lead of 140').toBe(140)
    expect(crOn(MON, 'bane'), 'no crew rest on Monday yet').toEqual([])
    loadWeek(W1)
    /* this week: clear bane's Sunday and give him a duty ending 21:30 — rest clear 09:30 Monday, the printed B 09:40 clears */
    schedWrite(SCHED_TYPES.mutate, () => {
      const d: any = DAYS[SUN]
      Object.assign(d, { waves: [], ground: [], allhands: [], sims: { amt: [], oft: [] }, dutywaves: [{ label: 'DUTY', rows: [{ role: 'Duty', id: 'bane', str: '1300', end: '2130' }] }] })
      view.afterSchedMutate()
    })
    validate()
    expect(withOfficialWarn(() => traceOf(SUN, 'bane')), 'before the change: no Breaks Monday').toBeFalsy()
    /* the admin raises "Brief before take-off" to 200 minutes (B would print 08:40) */
    ;(VCONF as any).briefLead = 200
    validate()
    const sunMark = withOfficialWarn(() => traceOf(SUN, 'bane'))
    loadWeek(W2); validate()
    const monCR = crOn(MON, 'bane')
    expect(!!sunMark, 'Sunday says "Breaks Monday" exactly when Monday\'s published face carries the breach').toBe(monCR.length > 0)
  })
})

/* D2005 (12 Nov 26) across the week's edge: every setting, not only the brief — "Crew rest" raised after next week's
   Monday went out. Monday is judged by the 12 hours it went out under when its own week is open; this week's Sunday asks
   that Monday by the same, on View-only Sched (the official pass) AND on Edit Schedule (the working pass — a published
   neighbour day with nothing waiting, weekctx.ts keepUntouchedRules). */
describe('D2005 — next week\'s published Monday and this week\'s Sunday after "Crew rest" is raised', () => {
  it('Sunday draws no "Breaks Monday" on either pass, and Monday\'s own face stays clean', async () => {
    await boot(new MemoryBackend())
    loadWeek(W2)
    schedWrite(SCHED_TYPES.mutate, () => {
      const d: any = DAYS[MON]
      Object.assign(d, { waves: [{ label: 'WAVE 1', night: false, intimes: [], traffic: [], formations: [{ cs: 'VL', msn: 'BFM', to: '12:00', ld: '13:00', br: '09:40', rl: '', aircraft: [{ p: 'bane', w: '', rmks: '', area: '', opts: {} }] }] }], dutywaves: [], ground: [], allhands: [], sims: { amt: [], oft: [] } })
      view.afterSchedMutate()
    })
    publish(MON)
    expect((daySnapOf(MON, dayCurVer(MON)) as any).rv.crewRest, 'Monday went out under 12 hours').toBe(720)
    loadWeek(W1)
    /* bane's Sunday: a duty ending 21:30 — rest clear 09:30 Monday under 12 hours, before the 09:40 brief */
    schedWrite(SCHED_TYPES.mutate, () => {
      const d: any = DAYS[SUN]
      Object.assign(d, { waves: [], ground: [], allhands: [], sims: { amt: [], oft: [] }, dutywaves: [{ label: 'DUTY', rows: [{ role: 'Duty', id: 'bane', str: '1300', end: '2130' }] }] })
      view.afterSchedMutate()
    })
    validate()
    expect(withOfficialWarn(() => traceOf(SUN, 'bane')), 'the premise: no Breaks Monday').toBeFalsy()
    ;(VCONF as any).crewRest = 780                       // 13 hours: clear 10:30 — after the 09:40 brief
    validate()
    expect(withOfficialWarn(() => traceOf(SUN, 'bane')), 'View-only Sched: Sunday draws no Breaks Monday').toBeFalsy()
    expect(traceOf(SUN, 'bane'), 'Edit Schedule: nor on the working pass').toBeFalsy()
    loadWeek(W2); validate()
    expect(crOn(MON, 'bane'), 'Monday\'s own published face: clean').toEqual([])
  })
})
