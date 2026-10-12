// @vitest-environment jsdom
/* ONE MAN SPLIT OUT OF A SHARED INPUT IS THAT INPUT'S ONE CHANGE — A WIRE NO TEST HELD ([ALL-AVAIL-AS-MEMBER], the break
   tests of 12 Oct 26 — docs/superpowers/briefs/2026-10-12-one-rule-break-tests-brief.md, group 2). Written with the
   wire broken on purpose (engine/inputs.ts frozenInputMatch, step 3b: the split-out record no longer paired with the
   input it left — `pieces`), red then (the day read TWO changes waiting), green on the code as built. 23 test files
   stayed green with the pairing gone: the counts' own file (state/inputcount.test.ts) takes people out and puts them
   in by the row's door, which makes no second record.

   The rule (the one-rule plan §4.6, §4.8; Fable's read of it, F6 (c); owner D736 — "one man taken off its row … is ONE
   change"; D737 — on the Unavailable list an input of several stays one row a man; D759 reading 4 — "a change to one
   man's part alone gives him an input of his own"): a box typed on ONE man's row of an input that holds several first
   gives him an input of his own (engine/inputown.ts ownInputOf) and changes that. On a day already published that is
   one act and must read ONE change waiting — never the input's change AND a new filing beside it.

   Driven as state/inputcount.test.ts drives the counts: the app's own doors on a real saved store. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, idsOf } from './inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from './people'
import { DAYS } from './data'
import { CURWEEK } from './waves'
import { storeBackend, HOOKS } from './hooks'
import { stashClear } from './weekstash'
import { SCHED, signOf, dayShownPendCount, dayPendingItems, dayDelta, itemCounts } from './publish'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { initStore, weekStashSnap, weekDirty, loadWeek } from '../state/store'
import { commitSetDayApproved } from '../state/sched-commit'
import { setSession, setMe, DEFAULT_ME } from '../state/auth'
import { hydrate, wirePersist } from '../state/persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetDisclosure } from '../state/disclosure'
import { setPage, setBoardDay } from '../state/view'
import * as view from '../state/view'
import { commitInput, draftOf, setInpField } from '../ui/inputedit'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026'
const WED = 2
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const toast = HOOKS.toast

function resetWorld() {
  if (CURWEEK !== W1) loadWeek(W1)
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
  Object.assign(PEOPLE, JSON.parse(PSNAP))
  for (const k of Object.keys(ID_BY_CS)) delete ID_BY_CS[k]
  indexCallsigns()
  PLANPUCKS.length = 0; for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  view.WARNOFF.clear(); view.disarmSlot()
  stashClear()
}
async function boot() {
  const be = new MemoryBackend()
  be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
  const p = bootStorage(be)
  await vi.advanceTimersByTimeAsync(be.latency)
  const { wb } = await p
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  _resetDisclosure()
  _resetTimeline(); installGlobalUndo()
  setSession({ user: 'ad', role: 'admin', name: 'ad' }); setMe('stiff')      // Saber, a scheduler
  setPage('editsched'); setBoardDay(WED)
}
const publish = (di: number) => { sign(di); commitSetDayApproved(di, true) }
/* THE count — and every reader of it agrees (inputcount.test.ts's own helper) */
const waiting = (di = WED): number => {
  const n = dayPendingItems(di).length
  expect(dayShownPendCount(di), 'the day head reads the same list').toBe(n)
  expect(itemCounts(dayPendingItems(di)).total, 'the Amendments box').toBe(n)
  expect(n === 0, 'never zero while something would go out, never something while nothing would').toBe(dayDelta(di).length === 0)
  return n
}
const FOUR = ['bane', 'split', 'rocky', 'ignite']
const ods = () => INPUTS.filter((x: any) => x.type === 'OD' && x.date === 'Jul 15' && /Exercise X/.test(String(x.remarks || ''))) as any[]

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 6, 13, 9, 0, 0)); resetWorld(); HOOKS.toast = () => {} })
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null })

describe('one man split out of a shared input on a published day is ONE change waiting — that input\'s (D736, D737, D759 reading 4; the plan §4.6, §4.8 — Fable F6 (c))', () => {
  it('an overseas duty for four, published; a remark typed on ONE man\'s row under Unavailable: he has an input of his own, the other three keep theirs — ONE waiting, and Undo — none', async () => {
    await boot()
    expect(commitInput(null, draftOf({ person: 'bane', type: 'OD', date: 'Jul 15', yr: 2026, allday: true, remarks: 'Exercise X' }), FOUR)).toBe(true)
    publish(WED)
    expect(ods(), 'ONE record for the four').toHaveLength(1)
    expect(waiting(), 'the control — nothing waiting on the day as it went out').toBe(0)
    expect(setInpField(ods()[0], 'rmks', 'Exercise X — back Thursday', 'rocky'), 'typed on Rocky\'s own row').toBe(true)
    const now = ods()
    expect(now.map(r => idsOf(r).map(String)), 'the input keeps the other three; Rocky has his own').toEqual([['bane', 'split', 'ignite'], ['rocky']])
    expect(now[1].remarks).toBe('Exercise X — back Thursday')
    expect(now[0].remarks, 'and theirs says what it said').toBe('Exercise X')
    expect(waiting(), 'ONE act — never the input\'s change and a new filing beside it').toBe(1)
    expect(globalUndo().ok).toBe(true)
    expect(ods().map(r => idsOf(r).map(String))).toEqual([FOUR])
    expect(waiting(), 'back to what was published (D98)').toBe(0)
  })
})
