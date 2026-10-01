// @vitest-environment jsdom
/* [WARN-HIDE-KEPT] (owner D469, 1 Oct 26) — A HIDDEN WARNING IS KEPT WITH ITS DAY, FOR EVERYONE: "it can be hidden until
   another person unhides it". Each case drives the app's own doors on a real saved store (the Memory backend behind the
   whiteboard, as the Browser backend runs it — weekrows-store.test.ts's harness) and reads what a reload and a sign-in
   give back. Before this build the boot threw the week's saved hides away (initStore never read `wo` back, where
   loadWeek did), the next edit of that day then rewrote its row WITHOUT them, and every sign-in cleared the set. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { PEOPLE, ID_BY_CS } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { HOOKS, storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED } from '../engine/publish'
import { workingWarn } from '../engine/validate'
import { PLANPUCKS, DAYRMK } from './plan'
import { initStore, writeText, weekStashSnap, weekDirty, loadWeek, resetSession } from './store'
import { schedWriteValue, SCHED_TYPES } from './sched-commit'
import { setSession } from './auth'
import { hydrate, wirePersist, weekId } from './persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { _resetDisclosure } from './disclosure'
import * as view from './view'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026', W2 = '20/07/2026'
const TUE = 1

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
async function boot(be: MemoryBackend) {
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
/* the app's reload: what is in storage is all that comes back */
async function reload(be: MemoryBackend) { await vi.advanceTimersByTimeAsync(300); resetWorld(); return boot(be) }
/* Tuesday's "Static has a long work day" — the warning the mock-up hides */
const longDay = () => ((workingWarn().byDay[TUE] || {}).warns || []).find((w: any) => w.code === 'LONGDAY')
/* the ✕ / ↺ on a line, as ui/interactions.ts runs it: one command, then its history step */
function tapHide(w: any) {
  const shown = schedWriteValue(SCHED_TYPES.warnMute, () => view.toggleWarnOff(view.warnMuteKey(w)))
  HOOKS.histPush()
  return shown
}

beforeEach(() => { vi.useFakeTimers(); resetWorld() })
afterEach(() => { _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); storeBackend.impl = null })

describe('WH1 (D469) — a hidden warning is kept with its day, across a reload', () => {
  it('a reload reads the hide back for the week the app opens on', async () => {
    const be = new MemoryBackend()
    await boot(be)
    expect(longDay(), 'the demo Tuesday raises the long-work-day note').toBeTruthy()
    tapHide(longDay())
    expect(view.warnShown(longDay()), 'hidden').toBe(false)
    await reload(be)
    expect(view.warnShown(longDay()), 'still hidden after a reload').toBe(false)
  })

  it('…and the next edit of that day does not erase it from storage', async () => {
    const be = new MemoryBackend()
    const wb = await boot(be)
    tapHide(longDay())
    await reload(be)
    writeText(`dn:${TUE}.0`, 'A NOTE TYPED AFTER THE RELOAD')
    await vi.advanceTimersByTimeAsync(300)
    const row = JSON.parse(String(be.peek('weeks', `${weekId(W1)}#${TUE}`) ?? wb.get('weeks', `${weekId(W1)}#${TUE}`) ?? '{}'))
    expect((row.wo || []).length, 'Tuesday\'s saved row still carries its hide').toBe(1)
    await reload(be)
    expect(view.warnShown(longDay()), 'still hidden after an edit and a second reload').toBe(false)
  })

  it('a week left and come back to, then reloaded, keeps it too', async () => {
    const be = new MemoryBackend()
    await boot(be)
    tapHide(longDay())
    loadWeek(W2); loadWeek(W1)
    expect(view.warnShown(longDay()), 'hidden after leaving and returning').toBe(false)
    await reload(be)
    expect(view.warnShown(longDay()), 'and after a reload').toBe(false)
  })

  it('a flag-again is kept across a reload as well', async () => {
    const be = new MemoryBackend()
    await boot(be)
    tapHide(longDay())
    await reload(be)
    tapHide(longDay())
    expect(view.warnShown(longDay()), 'flagged again').toBe(true)
    await reload(be)
    expect(view.warnShown(longDay()), 'still flagged after a reload').toBe(true)
  })
})

describe('WH2 (D469) — hidden for everyone: a sign-in does not bring it back', () => {
  it('the same scheduler signs out and in', async () => {
    await boot(new MemoryBackend())
    tapHide(longDay())
    resetSession(null)
    resetSession({ user: 'ad', role: 'admin' })
    expect(view.warnShown(longDay()), 'still hidden').toBe(false)
  })

  it('a member signs in after him — and the hide is still SAVED when the scheduler next edits that day', async () => {
    const be = new MemoryBackend()
    await boot(be)
    tapHide(longDay())
    resetSession(null)
    resetSession({ user: 'us', role: 'main' })
    expect(view.warnShown(longDay()), 'hidden for the member').toBe(false)
    resetSession(null)
    resetSession({ user: 'ad', role: 'admin' })
    writeText(`dn:${TUE}.0`, 'EDITED AFTER TWO SIGN-INS')
    await reload(be)
    expect(view.warnShown(longDay()), 'hidden after the edit and a reload').toBe(false)
  })

  it('WH11 — Undo takes the hide back and Redo hides it again — the one Undo, after a reload too', async () => {
    const be = new MemoryBackend()
    await boot(be)
    tapHide(longDay())
    expect(globalUndo().ok, 'Undo ran').toBe(true)
    expect(view.warnShown(longDay()), 'flagged again by Undo').toBe(true)
    expect(globalRedo().ok, 'Redo ran').toBe(true)
    expect(view.warnShown(longDay()), 'hidden again by Redo').toBe(false)
    await reload(be)
    expect(view.warnShown(longDay()), 'the redone hide is what was saved').toBe(false)
  })
})
