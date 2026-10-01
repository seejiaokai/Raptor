// @vitest-environment jsdom
/* [DB-READINESS] group A, phase 6 (a) — AN OIL DECISION MADE FOR ONE HOLDING OF A REQUEST IGNORES ITSELF WHEN THE
   REQUEST IS HANDED ON (plan `docs/superpowers/plans/2026-09-30-db-readiness-phase6-plan.md` §3 (a); data-model.md §9
   rule 9, "a request handed to another man").

   A scheduler's refusal names a man AND a request (`<pid>|i:<iid>` in the day's `oild.people`). Until phase 6, handing
   the request to another man cleared the old holder's refusal on every loaded day AND every saved week — a pass that
   wrote days nobody holds (D450: in the database it would be refused). The read side already ignored a refusal whose
   request names somebody else (`oilev.ts pruneHandedOverDecisions`); what it could not see is A → B → A: back with A,
   A's old refusal matched again and took his day. So the decision now records WHICH holding of the request it was made
   under (`oild.pa`, beside `people`), the request counts its holdings (`Input.hand`), and a refusal made under an
   earlier holding reads as nothing — with no week written by any hand-over. Each case drives the app's own doors on a
   real saved store (the Memory backend behind the whiteboard) and reads what reached storage. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId } from '../engine/inputs'
import { PEOPLE, ID_BY_CS } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { HOOKS, storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED } from '../engine/publish'
import { inputItemKey, oilEvidence } from '../engine/oilev'
import { PLANPUCKS, DAYRMK } from './plan'
import { initStore, weekStashSnap, weekDirty, loadWeek, writeInputsBatch } from './store'
import { schedWrite, SCHED_TYPES } from './sched-commit'
import { acceptInput } from '../engine/slots'
import { afterSchedMutate } from './view'
import { setSession } from './auth'
import { hydrate, wirePersist, weekId } from './persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import type { Change as WbChange, Whiteboard } from '../storage/whiteboard'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { _resetDisclosure } from './disclosure'
import * as view from './view'
import { labelToISO } from '../leavewar/absences'
import { toggleOilPerson, oilFigureFor } from '../ui/oilmode'
import { commitInputEdit, draftOf } from '../ui/inputedit'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026', W2 = '20/07/2026'

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

let groups: WbChange[][] = []
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
  groups = []
  wb.subscribe(g => groups.push(g))
  return wb
}
const weekWrites = () => groups.flat().filter(c => c.collection === 'weeks').map(c => (c.value === null ? '-' : '') + c.id)
const clear = () => { groups = [] }
const weekRows = (wb: Whiteboard, wk: string) => { const wid = weekId(wk); const o: Record<string, string | null> = {}; for (const k of wb.keys('weeks')) if (k.startsWith(wid)) o[k] = wb.get('weeks', k); return o }

/* the two facts the Leave War normally supplies — which days earn, and what date a day index is — so the figure is the
   real one (the oilconfirm suite's idiom) */
let hooks: any
beforeEach(() => {
  vi.useFakeTimers(); resetWorld()
  hooks = { day: HOOKS.oilEarningDay, iso: HOOKS.oilDayISO }
  HOOKS.oilEarningDay = (di: number) => di === 5 || di === 6
  HOOKS.oilDayISO = (di: number) => labelToISO((DAYS[di] || {}).dt, 2026) || ''
})
afterEach(() => {
  HOOKS.oilEarningDay = hooks.day; HOOKS.oilDayISO = hooks.iso
  _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); storeBackend.impl = null
})

const plant = (r: any) => { const row: any = { allday: true, remarks: 'oiltest', mod: 'now', yr: 2026, ...r }; inpId(row); writeInputsBatch(() => { INPUTS.unshift(row) }); return INPUTS[0] }
const handTo = (r: any, person: string) => { const d = draftOf(r); d.person = person; expect(commitInputEdit(r, d)).toBe(true) }
const seen = (di: number, k: string) => ((oilEvidence(di).d.people || {}) as any)[k]
const reqOf = (iid: string) => INPUTS.find((x: any) => String(inpId(x)) === iid) as any

describe('phase 6 (a) — a refusal belongs to the holding it was made under', () => {
  it('A → B → A with the refusal on a week NOT on screen: it reads as nothing, he earns, and no week is written', async () => {
    const wb = await boot(new MemoryBackend())
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', s: 0, e: 1439, oil: { '2026-07-18': 1 } })
    const iid = String(r.iid), item = inputItemKey(iid)
    expect(oilFigureFor(5, 'bane', item), 'he earns the Saturday before anyone touches it').toBe('FO')
    expect(toggleOilPerson(5, 'bane', item), 'the scheduler takes him off').toBe(false)
    expect(oilFigureFor(5, 'bane', item)).toBe(null)
    loadWeek(W2)
    const before = weekRows(wb, W1)
    clear()
    handTo(r, 'stiff')
    handTo(r, 'bane')
    writeInputsBatch(() => { r.oil = { '2026-07-18': 1 } })   // he answers Yes again
    expect(weekWrites(), 'a hand-over writes no week — its days are read, never rewritten').toEqual([])
    expect(weekRows(wb, W1), "the week off screen is byte for byte as it was").toEqual(before)
    loadWeek(W1)
    expect(seen(5, `bane|${item}`), 'the refusal was made under his FIRST holding — it reads as nothing now').toBeUndefined()
    expect(oilFigureFor(5, 'bane', item), 'he worked the Saturday and said Yes').toBe('FO')
  })

  it('A → B → A on the week on screen: the same, and the day is not written by either hand-over', async () => {
    const wb = await boot(new MemoryBackend())
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', s: 0, e: 1439, oil: { '2026-07-18': 1 } })
    const item = inputItemKey(String(r.iid))
    toggleOilPerson(5, 'bane', item)
    const before = weekRows(wb, W1)
    clear()
    handTo(r, 'stiff')
    expect(seen(5, `bane|${item}`), 'with Stiff holding it, Bane\'s refusal is not read').toBeUndefined()
    handTo(r, 'bane')
    writeInputsBatch(() => { r.oil = { '2026-07-18': 1 } })
    expect(weekWrites().filter(w => !w.startsWith(weekId(W1) + '#')), 'no week row, no issued row').toEqual([])
    expect(weekRows(wb, W1)[`${weekId(W1)}#5`], "Saturday's saved row is untouched by the hand-overs").toBe(before[`${weekId(W1)}#5`])
    expect(seen(5, `bane|${item}`)).toBeUndefined()
    expect(oilFigureFor(5, 'bane', item)).toBe('FO')
  })

  it('the Undo of the hand-over brings his refusal back — one step, the request\'s row only', async () => {
    await boot(new MemoryBackend())
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', s: 0, e: 1439, oil: { '2026-07-18': 1 } })
    const iid = String(r.iid), item = inputItemKey(iid)
    toggleOilPerson(5, 'bane', item)
    loadWeek(W2)
    handTo(r, 'stiff')
    clear()
    expect(globalUndo().ok, 'the Undo button reverses it').toBe(true)
    expect(weekWrites(), 'the Undo writes no week either').toEqual([])
    loadWeek(W1)
    expect(reqOf(iid).person, 'the request is his again').toBe('bane')
    expect(seen(5, `bane|${item}`), 'and so is the refusal').toBe('deny')
    expect(oilFigureFor(5, 'bane', item)).toBe(null)
  })

  it('the holding survives a reload: A → B, reload, B → A — the old refusal still reads as nothing', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', s: 0, e: 1439, oil: { '2026-07-18': 1 } })
    const iid = String(r.iid), item = inputItemKey(iid)
    toggleOilPerson(5, 'bane', item)
    handTo(r, 'stiff')
    await vi.advanceTimersByTimeAsync(1000)
    resetWorld()
    await boot(be)                                            // the reload: everything read back from storage
    const back = reqOf(iid)
    expect(back.person).toBe('stiff')
    handTo(back, 'bane')
    writeInputsBatch(() => { back.oil = { '2026-07-18': 1 } })
    expect(seen(5, `bane|${item}`), 'made under his first holding, before the reload').toBeUndefined()
    expect(oilFigureFor(5, 'bane', item)).toBe('FO')
  })

  it('a refusal made under the CURRENT holding still takes his day (the control)', async () => {
    await boot(new MemoryBackend())
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', s: 0, e: 1439, oil: { '2026-07-18': 1 } })
    const item = inputItemKey(String(r.iid))
    handTo(r, 'stiff')
    handTo(r, 'bane')
    writeInputsBatch(() => { r.oil = { '2026-07-18': 1 } })
    toggleOilPerson(5, 'bane', item)                            // refused NOW, while he holds it
    expect(seen(5, `bane|${item}`)).toBe('deny')
    expect(oilFigureFor(5, 'bane', item)).toBe(null)
  })

  /* FABLE'S RED TEAM OF THE PHASE-6 PLAN, F2 (30 Sep 26): a refusal about a man the scheduler put on the request's ROW as
     an extra (D18) is about him on that row, not about a holding of the request — handed to him, he is kept once, as its
     holder (D271), and the refusal must still stand. Stamped with the holding it was tapped under, it read as stale. */
  it("an EXTRA's refusal stands when the request is then handed to him (Fable F2)", async () => {
    await boot(new MemoryBackend())
    const r = plant({ person: 'bane', type: 'Training', date: 'Jul 18', s: 0, e: 1439, oil: { '2026-07-18': 1 } })
    const iid = String(r.iid), item = inputItemKey(iid)
    schedWrite(SCHED_TYPES.mutate, () => {
      /* on Saturday the moment it was filed — worked out on read ([DB-READINESS] phase 6 (c)); the scheduler adds the extra */
      const row: any = ((DAYS[5] as any).ground || []).find((g: any) => g && g.src === iid)
      expect(row, 'landed on Saturday').toBeTruthy()
      row.more = ['stiff']
      afterSchedMutate()
    })
    expect(oilFigureFor(5, 'stiff', item), 'the extra earns from the row (D18)').toBe('FO')
    toggleOilPerson(5, 'stiff', item)
    expect(oilFigureFor(5, 'stiff', item), 'the scheduler takes the extra off').toBe(null)
    handTo(r, 'stiff')
    writeInputsBatch(() => { r.oil = { '2026-07-18': 1 } })   // his own answer as the holder: Yes
    expect(seen(5, `stiff|${item}`), 'the refusal was about him on this row — it stands').toBe('deny')
    expect(oilFigureFor(5, 'stiff', item), 'so he still earns nothing from it').toBe(null)
  })

  /* the two orders Fable asked to be pinned: the extra's refusal is void once the request LEAVES him (as the old clear
     decided); and it stands while the request passes between other men with him still on the row */
  const landWithExtra = (r: any, extra: string) => schedWrite(SCHED_TYPES.mutate, () => {
    const row: any = ((DAYS[5] as any).ground || []).find((g: any) => g && g.src === String(r.iid))   // landed on read (phase 6 (c))
    expect(row).toBeTruthy()
    row.more = [extra]
    afterSchedMutate()
  })
  it('an extra refused, handed the request, then it leaves him and comes back: the refusal is void (as the old clear decided)', async () => {
    await boot(new MemoryBackend())
    const r = plant({ person: 'bane', type: 'Training', date: 'Jul 18', s: 0, e: 1439, oil: { '2026-07-18': 1 } })
    const item = inputItemKey(String(r.iid))
    landWithExtra(r, 'stiff')
    toggleOilPerson(5, 'stiff', item)
    handTo(r, 'stiff')
    handTo(r, 'bane')
    handTo(r, 'stiff')
    writeInputsBatch(() => { r.oil = { '2026-07-18': 1 } })
    expect(seen(5, `stiff|${item}`), 'it left him in between — the refusal died with that').toBeUndefined()
    expect(oilFigureFor(5, 'stiff', item)).toBe('FO')
  })
  it('an extra refused keeps the refusal while the request passes between OTHER men, and when it finally comes to him', async () => {
    await boot(new MemoryBackend())
    const r = plant({ person: 'bane', type: 'Training', date: 'Jul 18', s: 0, e: 1439, oil: { '2026-07-18': 1 } })
    const item = inputItemKey(String(r.iid))
    landWithExtra(r, 'stiff')
    toggleOilPerson(5, 'stiff', item)
    handTo(r, 'pike')
    expect(seen(5, `stiff|${item}`), 'still on the row as an extra — his refusal stands').toBe('deny')
    handTo(r, 'stiff')
    writeInputsBatch(() => { r.oil = { '2026-07-18': 1 } })
    expect(seen(5, `stiff|${item}`), 'it never left him').toBe('deny')
    expect(oilFigureFor(5, 'stiff', item)).toBe(null)
  })

  it('a decision about a DIFFERENT request is untouched by the hand-over (the other control)', async () => {
    await boot(new MemoryBackend())
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', s: 0, e: 1439, oil: { '2026-07-18': 1 } })
    ;(DAYS[5] as any).oild = { people: { 'bane|i:someoneelse': 'deny', 'bane|r:somerow': 'deny' } }
    handTo(r, 'stiff')
    handTo(r, 'bane')
    expect(seen(5, 'bane|i:someoneelse')).toBe('deny')
    expect(seen(5, 'bane|r:somerow')).toBe('deny')
  })
})
