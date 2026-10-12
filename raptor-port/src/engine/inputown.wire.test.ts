// @vitest-environment jsdom
/* THE HOLDING STAMPS OF THE ONE RECORD, WHERE NO TEST HELD THEM ([ALL-AVAIL-AS-MEMBER], the break tests of 12 Oct 26 —
   docs/superpowers/briefs/2026-10-12-one-rule-break-tests-brief.md, group 2). Each case here was written with its wire
   broken on purpose (engine/inputown.ts), went red, and is green on the writers as built.

   · swapPerson moves the holding on (`hand`, the newcomer's `h`). state/p6a-oilstamp.test.ts walks A → B → A with a
     record in the OLD shape through the input's own save (ui/inputedit.tsx — its own `hand` and `leftAt`), which never
     reaches swapPerson; the swap on the ROW (ui/reqdoor.ts — the only person's puck replaced, D755 (2)) writes the
     record forward first and does. So: a scheduler's OIL switch about a man is void once the input has been another
     man's and come back to him BY THE ROW.

   Driven as p6a-oilstamp.test.ts drives it: the app's own doors on a real saved store. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId, idsOf } from './inputs'
import { PEOPLE, ID_BY_CS } from './people'
import { DAYS } from './data'
import { CURWEEK } from './waves'
import { HOOKS, storeBackend } from './hooks'
import { stashClear } from './weekstash'
import { SCHED } from './publish'
import { inputItemKey, oilEvidence } from './oilev'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { initStore, weekStashSnap, weekDirty, loadWeek, writeInputsBatch } from '../state/store'
import { setSession } from '../state/auth'
import { hydrate, wirePersist } from '../state/persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import type { Whiteboard } from '../storage/whiteboard'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetDisclosure } from '../state/disclosure'
import * as view from '../state/view'
import { labelToISO } from '../leavewar/absences'
import { toggleOilPerson, oilFigureFor } from '../ui/oilmode'
import { rowPut } from '../ui/reqdoor'
import { answerOilWait } from '../ui/oilwait'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026'
const toast = HOOKS.toast

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
  view.WARNOFF.clear()
  stashClear()
}
async function boot(be: MemoryBackend): Promise<Whiteboard> {
  if (!be.peek('settings', 'schema')) be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
  const p = bootStorage(be)
  await vi.advanceTimersByTimeAsync(be.latency)
  const { wb } = await p
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  _resetDisclosure()
  _resetTimeline(); installGlobalUndo()
  setSession({ user: 'ad', role: 'admin' })
  return wb
}

/* the two facts the Leave War normally supplies — which days earn, and what date a day index is (the oilconfirm
   suite's idiom, as p6a-oilstamp.test.ts) */
let hooks: any
beforeEach(() => {
  vi.useFakeTimers(); resetWorld()
  hooks = { day: HOOKS.oilEarningDay, iso: HOOKS.oilDayISO }
  HOOKS.oilEarningDay = (di: number) => di === 5 || di === 6
  HOOKS.oilDayISO = (di: number) => labelToISO((DAYS[di] || {}).dt, 2026) || ''
  HOOKS.toast = () => {}
})
afterEach(() => {
  HOOKS.oilEarningDay = hooks.day; HOOKS.oilDayISO = hooks.iso; HOOKS.toast = toast
  _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); storeBackend.impl = null
})

const plant = (r: any) => { const row: any = { allday: true, remarks: 'oiltest', mod: 'now', yr: 2026, ...r }; inpId(row); writeInputsBatch(() => { INPUTS.unshift(row) }); return INPUTS[0] }
const seen = (di: number, k: string) => ((oilEvidence(di).d.people || {}) as any)[k]
const reqOf = (iid: string) => INPUTS.find((x: any) => String(inpId(x)) === iid) as any
const rowOf = (iid: string): any => ((DAYS[5] as any).ground || []).find((g: any) => g && g.src === iid)
const rowKey = (iid: string) => `g:5.${((DAYS[5] as any).ground || []).indexOf(rowOf(iid))}`
const inIt = (iid: string) => idsOf(reqOf(iid)).map(String)

describe('the SWAP on the row moves the holding on — a switch made under an earlier holding reads as nothing (D755 (2), D762; Fable F7)', () => {
  it('A → B → A by the only person\'s puck replaced, twice: the scheduler\'s refusal of A does not come back with him, and he earns on the new Yes', async () => {
    await boot(new MemoryBackend())
    const r = plant({ person: 'bane', type: 'Training', date: 'Jul 18', s: 0, e: 1439, oil: { '2026-07-18': 1 } })
    const iid = String(r.iid), item = inputItemKey(iid)
    expect(rowOf(iid), 'landed on Saturday').toBeTruthy()
    expect(oilFigureFor(5, 'bane', item), 'he earns the Saturday before anyone touches it').toBe('FO')
    expect(toggleOilPerson(5, 'bane', item), 'the scheduler takes him off').toBe(false)
    expect(seen(5, `bane|${item}`)).toBe('deny')
    /* A NAMED RULING CHANGED THIS CASE (owner D783, 12 Oct 26 — "a swap … that raises an OIL question is NOT MADE until
       the question is answered"): until then each drop was made at once, left the input with no answer ("the answer
       was void at each swap"), and the Yes was written afterwards by hand. Now each drop WAITS and is made with its
       answer; what this case is about — a refusal made under an earlier holding reads as nothing — is unchanged. */
    expect(rowPut(rowKey(iid), 'stiff'), 'another man dropped on his puck: it waits on the OIL question').toBe('asked')
    expect(inIt(iid), 'nothing moved').toEqual(['bane'])
    expect(answerOilWait({ '2026-07-18': 0 }), 'answered: the input is that man\'s').toBe(true)
    expect(inIt(iid)).toEqual(['stiff'])
    expect(seen(5, `bane|${item}`), 'with Stiff holding it, Bane\'s refusal is not read').toBeUndefined()
    expect(rowPut(rowKey(iid), 'bane'), 'and Bane dropped back on it — the question again').toBe('asked')
    expect(answerOilWait({ '2026-07-18': 1 }), 'the input\'s answer: Yes again, given with the swap').toBe(true)
    expect(inIt(iid)).toEqual(['bane'])
    expect(reqOf(iid).oil, 'the answer given with the swap — never the first holding\'s own').toEqual({ '2026-07-18': 1 })
    expect(seen(5, `bane|${item}`), 'the refusal was made under his FIRST holding — it reads as nothing now').toBeUndefined()
    expect(oilFigureFor(5, 'bane', item), 'he worked the Saturday and the input says Yes').toBe('FO')
  })
})
