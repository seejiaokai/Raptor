// @vitest-environment jsdom
/* TWO UNITS, ONE APP — the unit-qualified identity carried through every layer (multi-squadron batch 1, step 2).
   The scheduler's singletons hold ONE unit in view; switchUnit swaps them by the path a week load uses; the stash, the
   stored rows, the change stream, the settings and Undo all name the unit. Red first, rule by rule:
   - a 149 week and a 142 week of the SAME dates stay apart through save → reload → stash → switching back and forth;
   - an edit in 149 never appears in 142;
   - Undo in 142 does not step back a 149 change (one stream, filtered by the unit in view — D148);
   - a unit's setting is written through its named settings command, under its unit's name;
   - 142's plain admin is refused a write to 149's records at the commit gate;
   - the planning calendar and the settings come back with their unit. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { PEOPLE, ID_BY_CS } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend } from '../engine/hooks'
import { stashClear, stashHas, stashKeys } from '../engine/weekstash'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { STORE_CFG, addStore, storesSave, storesReset } from '../engine/stores'
import { noteText, mkNote } from '../engine/note'
import { schedWrite, SCHED_TYPES } from './sched-commit'
import { afterSchedMutate } from './view'
import { PLANPUCKS, DAYRMK, addPlanPuck } from './plan'
import { initStore, writeInputs, weekStashSnap, weekDirty, loadWeek, resetSession, switchUnit, forgetUnitPlans, notify } from './store'
import { setSession, setEffectiveRole } from './auth'
import { signIn, sessionFor, addAccount } from './accounts'
import { hydrate, wirePersist } from './persist'
import { globalUndo, undoState } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { onCommit, type CommitEnvelope } from '../command'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const BOOT_WEEK = CURWEEK                // 13/07/2026, the demo's week — the same dates in both units
const FAR_WEEK = '12/10/2026'            // a blank far-off week
const notesOf = (di = 0) => ((DAYS[di] && DAYS[di].notes) || []).map(noteText)
/* a note added to Monday, as a schedule command (a blank week has no note to retype) */
const addNote = (text: string) => schedWrite(SCHED_TYPES.mutate, () => { (DAYS[0] as any).notes.push(mkNote(text)); afterSchedMutate() })
const signInAs = (name: string, pass = 'x') => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }

function resetWorld() {
  if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT)
  forgetUnitPlans()
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
  Object.assign(PEOPLE, JSON.parse(PSNAP))
  for (const k of Object.keys(ID_BY_CS)) delete ID_BY_CS[k]
  for (const id of Object.keys(PEOPLE)) ID_BY_CS[PEOPLE[id].cs.toLowerCase()] = id
  PLANPUCKS.length = 0; for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
  stashClear(); loadWeek(FAR_WEEK); stashClear(); loadWeek(BOOT_WEEK); stashClear()
  storesReset()
}

async function boot(be: MemoryBackend) {
  be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
  const p = bootStorage(be)
  await vi.advanceTimersByTimeAsync(be.latency)
  const { wb, postman } = await p
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  return { wb, postman }
}
/* a reload: the memory goes, the store stays */
async function reload(be: MemoryBackend) {
  await vi.advanceTimersByTimeAsync(300)
  setSession(null)
  resetWorld()
  const r = await boot(be)
  signInAs('ad', 'a')
  return r
}

beforeEach(() => { vi.useFakeTimers(); resetWorld(); _resetTimeline(); installGlobalUndo() })
afterEach(() => { vi.useRealTimers(); setSession(null); resetWorld(); _resetTimeline(); storeBackend.impl = null })

describe('the unit in view', () => {
  it('starts at the boot unit and at the signed-in person\'s home; a malformed unit is refused', async () => {
    await boot(new MemoryBackend())
    expect(UNIT).toBe(BOOT_UNIT)
    signInAs('ad', 'a')
    expect(UNIT, 'Saber is at home in 142').toBe('u142')
    expect(() => switchUnit('149')).toThrow()
  })
})

describe('a 149 week and a 142 week of the same dates are kept apart', () => {
  it('through save, reload, stash and switching back and forth many times', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    signInAs('ad', 'a')                                  // Saber: the master, an admin in every unit
    addNote('ONE-FOUR-TWO')
    switchUnit('u149')
    expect(CURWEEK, 'the same week, the other unit').toBe(BOOT_WEEK)
    expect(notesOf(), 'an edit in 142 never appears in 149').not.toContain('ONE-FOUR-TWO')
    addNote('ONE-FOUR-NINE')
    for (let i = 0; i < 6; i++) {
      switchUnit('u142')
      expect(notesOf(), `142, swap ${i}`).toContain('ONE-FOUR-TWO')
      expect(notesOf(), `142, swap ${i}: an edit in 149 never appears in 142`).not.toContain('ONE-FOUR-NINE')
      switchUnit('u149')
      expect(notesOf(), `149, swap ${i}`).toContain('ONE-FOUR-NINE')
      expect(notesOf(), `149, swap ${i}`).not.toContain('ONE-FOUR-TWO')
    }
    /* another week and back, in 149: its own stash entry, never 142's */
    loadWeek(FAR_WEEK); loadWeek(BOOT_WEEK)
    expect(notesOf()).toContain('ONE-FOUR-NINE')
    expect(stashHas(BOOT_WEEK), 'the stash answers for the unit in view').toBe(true)
    await vi.advanceTimersByTimeAsync(300)
    /* stored: one row per unit and day, each unit's own */
    expect(wb.get('weeks', 'u142@13-07-2026#0')).toContain('ONE-FOUR-TWO')
    expect(wb.get('weeks', 'u142@13-07-2026#0')).not.toContain('ONE-FOUR-NINE')
    expect(wb.get('weeks', 'u149@13-07-2026#0')).toContain('ONE-FOUR-NINE')
    expect(wb.get('weeks', 'u149@13-07-2026#0')).not.toContain('ONE-FOUR-TWO')
    expect(wb.keys('weeks').every(k => /^u1\d\d@/.test(k)), 'every stored week row names its unit').toBe(true)

    /* reload: each unit reads its own rows back */
    await reload(be)
    expect(UNIT).toBe('u142')
    expect(notesOf()).toContain('ONE-FOUR-TWO')
    expect(notesOf()).not.toContain('ONE-FOUR-NINE')
    switchUnit('u149')
    expect(notesOf()).toContain('ONE-FOUR-NINE')
    expect(notesOf()).not.toContain('ONE-FOUR-TWO')
    switchUnit('u142')
    expect(notesOf()).toContain('ONE-FOUR-TWO')
  })

  it('the stash keeps each unit\'s weeks apart: the bare key is the unit in view\'s', async () => {
    await boot(new MemoryBackend())
    signInAs('ad', 'a')
    addNote('A'); loadWeek(FAR_WEEK)
    expect(stashKeys()).toContain(BOOT_WEEK)
    switchUnit('u149')
    expect(stashKeys(), '149 has no saved copy of 13/07 yet').not.toContain(BOOT_WEEK)
  })
})

describe('Undo by unit — one stream, filtered by the unit in view (D148)', () => {
  it('Undo in 142 does not step back a 149 change; back in 149 it does', async () => {
    await boot(new MemoryBackend())
    signInAs('ad', 'a')
    addNote('OLDER IN 142')
    switchUnit('u149')
    addNote('NEWER IN 149')
    switchUnit('u142')
    expect(undoState().canUndo).toBe(true)
    expect(globalUndo().ok).toBe(true)
    expect(notesOf(), 'the 142 step was undone').not.toContain('OLDER IN 142')
    switchUnit('u149')
    expect(notesOf(), 'the newer 149 change was NOT stepped back from 142').toContain('NEWER IN 149')
    expect(globalUndo().ok).toBe(true)
    expect(notesOf(), 'in 149 its own Undo takes it').not.toContain('NEWER IN 149')
  })
})

describe('a unit\'s setting is written through its named command, under its unit', () => {
  it('149\'s stores list: one settings.stores envelope naming u149@stores; 142\'s stays standard', async () => {
    const { wb } = await boot(new MemoryBackend())
    signInAs('ad', 'a')
    switchUnit('u149')
    const caught: CommitEnvelope[] = []
    const off = onCommit(e => { caught.push(e) })
    expect(addStore('LGB')).toBe(null); storesSave()
    off()
    expect(caught.map(e => e.type)).toEqual(['settings.stores'])
    expect(caught[0].changes.map(c => `${c.collection}/${c.id}`)).toEqual(['settings/u149@stores'])
    await vi.advanceTimersByTimeAsync(300)
    expect(wb.get('settings', 'u149@stores')).toContain('LGB')
    expect(wb.has('settings', 'u142@stores')).toBe(false)
    /* the settings follow the unit in view */
    switchUnit('u142')
    expect(STORE_CFG.map(([k]) => k)).not.toContain('lgb')
    switchUnit('u149')
    expect(STORE_CFG.map(([k]) => k)).toContain('lgb')
  })
})

describe('the planning calendar is the unit\'s', () => {
  it('a note on 149\'s calendar is not on 142\'s, and comes back with 149 — before and after a reload', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    signInAs('ad', 'a')
    switchUnit('u149')
    expect(writeInputs(() => { addPlanPuck('2026-07-21', 'PLAN 149') })).toBe(true)
    switchUnit('u142')
    expect(PLANPUCKS.map((p: any) => p.text)).not.toContain('PLAN 149')
    switchUnit('u149')
    expect(PLANPUCKS.map((p: any) => p.text)).toContain('PLAN 149')
    await vi.advanceTimersByTimeAsync(300)
    expect(wb.keys('plan').filter(k => k.startsWith('u149@pp:')).length).toBe(1)
    expect(wb.keys('plan').filter(k => k.startsWith('u142@pp:')).length).toBe(0)
    await reload(be)
    expect(PLANPUCKS.map((p: any) => p.text), '142 after the reload').not.toContain('PLAN 149')
    switchUnit('u149')
    expect(PLANPUCKS.map((p: any) => p.text), '149 after the reload').toContain('PLAN 149')
  })
})

describe('the commit gate: a change to a unit\'s records needs rights in that unit', () => {
  it('142\'s plain admin is refused a write to 149\'s week; nothing is saved', async () => {
    const { wb } = await boot(new MemoryBackend())
    signInAs('ad', 'a')
    expect(addAccount('pike@mail', 'pike', 'admin')).toBe(null)
    signInAs('pike@mail')
    expect(UNIT, 'pike is at home in 142').toBe('u142')
    addNote('PIKE IN 142')
    expect(notesOf()).toContain('PIKE IN 142')
    switchUnit('u149')                                   // the screen offers no way here (step 5) — the gate is the guard
    addNote('PIKE IN 149')
    expect(notesOf(), 'refused and rolled back').not.toContain('PIKE IN 149')
    await vi.advanceTimersByTimeAsync(300)
    expect(wb.has('weeks', 'u149@13-07-2026#0')).toBe(false)
    expect(wb.get('weeks', 'u142@13-07-2026#0')).toContain('PIKE IN 142')
  })
  /* the role in force decides his own squadron, as every other check reads it — GitHub's browser run on step 2 went red
     where a member is raised to admin in place (the developer bridge's raptorRole): the gate read the stored account's
     role and refused every write the raised session made in its own squadron */
  it('a session raised to admin writes its own squadron\'s week; the same session is still refused 149\'s', async () => {
    const { wb } = await boot(new MemoryBackend())
    signInAs('us', 'us')                                 // Ranger: a member account, at home in 142
    setEffectiveRole('admin')
    addNote('RAISED IN 142')
    expect(notesOf(), 'his own squadron: kept').toContain('RAISED IN 142')
    switchUnit('u149')
    addNote('RAISED IN 149')
    expect(notesOf(), 'another squadron: refused and rolled back').not.toContain('RAISED IN 149')
    await vi.advanceTimersByTimeAsync(300)
    expect(wb.get('weeks', 'u142@13-07-2026#0')).toContain('RAISED IN 142')
    expect(wb.has('weeks', 'u149@13-07-2026#0')).toBe(false)
  })
})
