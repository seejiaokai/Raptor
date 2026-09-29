// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId, isPersonal } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, nameToId } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS } from '../engine/hooks'
import { stashClear, stashHas, stashDrop } from '../engine/weekstash'
import { PLANPUCKS, DAYRMK, addPlanPuck } from './plan'
import { initStore, writeInputs, writeText, writeInputsBatchWith, weekstashStore, weekStashSnap, weekDirty, loadWeek, moveSectionTo, resetSession } from './store'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { txtGet } from '../engine/slots'
import { undo } from './history'
import { setSession } from './auth'
import { hydrate, wirePersist, isHydrated, weekId, weekKey } from './persist'
import { persistPeople } from './people-settings-commit'
import { protectedWeek } from '../engine/publish'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import { mkNote, noteText } from '../engine/note'
import { splitWeek } from './weekrows'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const BOOT_WEEK = CURWEEK
const WEEK_B = '20/07/2026'   // the authored second demo week: an input lands on it
const WEEK_C = '12/10/2026'   // a blank far-off week: nothing lands
const ROW = { person: 'dj', date: 'Jul 14', allday: true, type: 'LL', remarks: 'persist test', mod: '2026-07-01' }
const noteTextOf = (d: any) => ((d && d.notes) || []).map(noteText)
/* the stored row id of the request filed with these remarks */
const rowIdOf = (remarks: string) => inpId(INPUTS.find((r: any) => r.remarks === remarks))

function resetWorld() {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
  Object.assign(PEOPLE, JSON.parse(PSNAP))
  for (const k of Object.keys(ID_BY_CS)) delete ID_BY_CS[k]
  for (const id of Object.keys(PEOPLE)) ID_BY_CS[PEOPLE[id].cs.toLowerCase()] = id
  PLANPUCKS.length = 0; for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
  stashClear()
  if (CURWEEK !== BOOT_WEEK) loadWeek(BOOT_WEEK)   // the swap tests leave the loaded week elsewhere
  stashClear()
}

async function boot(be: MemoryBackend) {
  /* these tests exercise HYDRATION of a store already on the current schema, so
     stamp it — otherwise the pre-1A reset (its own coverage in reset.test.ts)
     would clear the very inputs/weeks the test seeded to hydrate. */
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

beforeEach(() => { vi.useFakeTimers(); resetWorld() })
afterEach(() => { vi.useRealTimers(); resetWorld(); setSession(null) })

describe('week ids', () => {
  it('converts the stash key to a record id and back', () => {
    expect(weekId('13/07/2026')).toBe('13-07-2026')
    expect(weekKey('13-07-2026')).toBe('13/07/2026')
  })
})

describe('hydrate', () => {
  it('a fresh backend: not hydrated, seeds run, nothing is lost', async () => {
    const be = new MemoryBackend()
    await boot(be)
    expect(isHydrated()).toBe(false)
    expect(INPUTS.length).toBeGreaterThan(0)
  })

  /* [DB-READINESS] group A, phase 2: a request is one stored row (`inputs/<iid>`), in its list's order (`ord`) */
  it('stored inputs REPLACE the seed and keep their ids; a fresh opaque id cannot collide', async () => {
    const be = new MemoryBackend()
    const stored = [{ ...ROW, iid: 'i57', yr: 2026, ord: 1024 }, { ...ROW, date: 'Jul 15', iid: 'i58', yr: 2026, ord: 2048 }]
    be.seed({ inputs: Object.fromEntries(stored.map(r => [r.iid, JSON.stringify(r)])) })
    await boot(be)
    expect(isHydrated()).toBe(true)
    expect(INPUTS).toHaveLength(2)
    expect(INPUTS.map((r: any) => r.iid)).toEqual(['i57', 'i58'])   // stored ids kept verbatim
    /* iid is opaque now (engine/newid.ts) — no counter to seed past the stored
       ids; a freshly minted id is prefixed 'i' and cannot collide with them */
    const fresh = inpId({} as any)
    expect(fresh).toMatch(/^i/)
    expect(['i57', 'i58']).not.toContain(fresh)
  })

  it('stored people replace the roster', async () => {
    const be = new MemoryBackend()
    const people = JSON.parse(PSNAP); people.dj.quals.tf = true
    be.seed({ people: Object.fromEntries(Object.keys(people).filter(id => !people[id].special).map(id => [id, JSON.stringify(people[id])])) })
    await boot(be)
    expect(PEOPLE.dj.quals.tf).toBe(true)
  })

  it('a stored plan layer restores pucks and titles; a new note\'s id is its own', async () => {
    const be = new MemoryBackend()
    be.seed({ plan: { 'pp:pp4': JSON.stringify({ id: 'pp4', date: '2026-07-14', kind: 'note', text: 'x', ord: 1024 }), 'dm:2026-07-14': JSON.stringify('Title') } })
    await boot(be)
    expect(PLANPUCKS).toHaveLength(1)
    expect(DAYRMK['2026-07-14']).toBe('Title')
    setSession({ user: 'ad', role: 'admin' })
    addPlanPuck('2026-07-15', 'y')
    /* addPlanPuck UNSHIFTS (plan.ts); the fresh note's id is the app's opaque one (engine/newid.ts — F2-07), never the
       stored pp4 nor a counter that two browsers would both mint */
    expect(PLANPUCKS[0].id).not.toBe('pp4')
    expect(PLANPUCKS[0].id).not.toMatch(/^pp\d+$/)
  })

  it('a stored week snapshot is restored into the loaded week at boot', async () => {
    const be1 = new MemoryBackend()
    await boot(be1)
    DAYS[0].notes.push(mkNote('PERSISTED NOTE'))
    const snap = weekStashSnap()
    resetWorld()
    const be2 = new MemoryBackend()
    /* stored as the week's rows ([DB-READINESS] group A, phase 1 — state/weekrows.ts) */
    const rows = splitWeek(JSON.parse(snap), CURWEEK)
    be2.seed({ weeks: Object.fromEntries(Object.keys(rows).map(sfx => [weekId(CURWEEK) + sfx, rows[sfx]])) })
    await boot(be2)
    expect(stashHas(CURWEEK)).toBe(true)
    expect(DAYS[0].notes.map(noteText)).toContain('PERSISTED NOTE')
    expect(protectedWeek(), 'a week read back from its rows is editable').toBe(false)
  })
})

describe('an unsupported (pre-Phase-2) book is preserved byte-for-byte (P2-IMPL-02)', () => {
  it('a legacy book survives load + an unrelated save without being reconstructed', async () => {
    /* build a PRE-Phase-2 blob for WEEK_B: real days, but the OLD amendment
       shape and NO amV/ridV, so it classifies as unsupported. */
    const be0 = new MemoryBackend()
    await boot(be0)
    loadWeek(WEEK_B)
    DAYS[0].notes.push('LEGACY EVIDENCE')
    const base: any = JSON.parse(weekStashSnap())
    delete base.am; delete base.v
    base.ok = { 0: 1 }
    base.o = { 0: { d: JSON.parse(JSON.stringify(DAYS[0])), c: {} } }   // old orig: no id
    base.cv = { 0: 'orig' }                                             // old pointer
    base.a = [{ n: 1, keys: ['dn:0.0'] }]                              // old AL record
    const legacyBlob = JSON.stringify(base)
    resetWorld()

    const be = new MemoryBackend()
    be.seed({ weeks: { [weekId(WEEK_B)]: legacyBlob } })
    const { wb } = await boot(be)
    loadWeek(WEEK_B)
    expect(protectedWeek(), 'classified unsupported → read-only').toBe(true)
    /* an UNRELATED save (any history step) must NOT reconstruct the frozen week */
    HOOKS.histPush()
    expect(wb.get('weeks', weekId(WEEK_B)), 'the original blob is preserved byte-for-byte').toBe(legacyBlob)
    expect(wb.get('weeks', weekId(WEEK_B))).toContain('LEGACY EVIDENCE')   // the recovery evidence still reads
  })
})

describe('a DAMAGED saved week is quarantined, never seeded over (P2-REV2-01)', () => {
  it('an UNREADABLE (unparseable) stored week loads read-only and its bytes survive an unrelated save', async () => {
    /* a truncated / corrupt JSON blob — it will not parse. Before the fix,
       applyWeekModel treated this as "never stashed", loaded the seed, cleared
       preservation, and the next persistAll serialized the SEED over the damaged
       record — destroying it. */
    const damaged = '{"d":[{"dow":"Mon","notes":["DAMAGED EVIDENCE"'
    const be = new MemoryBackend()
    be.seed({ weeks: { [weekId(WEEK_B)]: damaged } })
    const { wb } = await boot(be)
    loadWeek(WEEK_B)
    expect(protectedWeek(), 'a damaged saved week is held read-only').toBe(true)
    /* an unrelated history step must NOT reconstruct or seed over the damaged week */
    HOOKS.histPush()
    expect(wb.get('weeks', weekId(WEEK_B)), 'the original damaged bytes are preserved verbatim').toBe(damaged)
  })

  it('a stored week that parses but has NO days array is treated as damaged, not absent', async () => {
    const noDays = JSON.stringify({ ok: { 0: 1 }, note: 'no d array here' })
    const be = new MemoryBackend()
    be.seed({ weeks: { [weekId(WEEK_B)]: noDays } })
    const { wb } = await boot(be)
    loadWeek(WEEK_B)
    expect(protectedWeek(), 'read-only — not silently seeded over as if missing').toBe(true)
    HOOKS.histPush()
    expect(wb.get('weeks', weekId(WEEK_B)), 'the original bytes are preserved, not a seed re-serialization').toBe(noDays)
  })

  it("a stored week whose JSON is the text 'null' is damaged, not absent — preserved read-only (P2-QREV-06)", async () => {
    const be = new MemoryBackend()
    be.seed({ weeks: { [weekId(WEEK_B)]: 'null' } })      // parses to a falsy value — must not read as missing
    const { wb } = await boot(be)
    loadWeek(WEEK_B)
    expect(protectedWeek(), 'read-only — a falsy-parsing blob is damaged, not absent').toBe(true)
    HOOKS.histPush()
    expect(wb.get('weeks', weekId(WEEK_B)), 'the original bytes are preserved, not overwritten with seed').toBe('null')
  })

  it('a MISSING week (no stash at all) still loads the seed and is EDITABLE — not falsely quarantined', async () => {
    const be = new MemoryBackend()
    await boot(be)
    loadWeek(WEEK_C)                       // never stored → genuinely absent, not damaged
    expect(protectedWeek(), 'an absent week is editable, not read-only').toBe(false)
  })
})

describe('persistAll and the hooks', () => {
  /* the request is one stored row, `inputs/<iid>` ([DB-READINESS] group A, phase 2) */
  it('an undoable edit lands on the whiteboard at once and reaches the backend after the coalesce wait', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    writeInputs(() => { INPUTS.push({ ...ROW }) })
    const id = rowIdOf(ROW.remarks)
    expect(JSON.parse(wb.get('inputs', id)!).remarks).toBe(ROW.remarks)
    await vi.advanceTimersByTimeAsync(300)
    expect(be.peek('inputs', id)).toBe(wb.get('inputs', id))
  })

  /* [DB-READINESS] group A, phase 1 — the week is ROWS (state/weekrows.ts), written from the command that changed it:
     its first save writes the week row and all seven day rows together, so a stored week is never a part of one */
  it('the pristine seed week is NOT persisted; an edited week is — its week row and all seven day rows together', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    const wid = weekId(CURWEEK)
    expect(wb.keys('weeks').filter(k => k.startsWith(wid))).toEqual([])
    writeText('dn:0.0', 'X')
    expect(wb.has('weeks', wid)).toBe(true)
    for (let di = 0; di < 7; di++) expect(wb.has('weeks', `${wid}#${di}`), `day ${di}`).toBe(true)
    expect(noteTextOf(JSON.parse(wb.get('weeks', `${wid}#0`)!).d)).toContain('X')
    expect(JSON.parse(wb.get('weeks', wid)!), 'the week row is the two stamps alone').toEqual({ v: expect.anything(), am: expect.anything() })
  })

  /* the Undo is a command (the global undo), so it writes its own change: the row it added, removed */
  it('UNDO during a slow save: the whiteboard and the backend both end on the pre-edit state, one letter each', async () => {
    const be = new MemoryBackend(); be.latency = 500
    const { wb } = await boot(be)
    await vi.advanceTimersByTimeAsync(2000)             // the first boot's seed rows settle
    _resetTimeline(); installGlobalUndo(); setSession({ user: 'ad', role: 'admin' })
    writeInputs(() => { INPUTS.push({ ...ROW }) })
    const id = rowIdOf(ROW.remarks)
    await vi.advanceTimersByTimeAsync(300)            // letter 1 in flight (500 ms)
    expect(globalUndo().ok).toBe(true)
    expect(wb.has('inputs', id)).toBe(false)          // whiteboard already back
    await vi.advanceTimersByTimeAsync(500 + 300 + 500)
    expect(be.peek('inputs', id)).toBeNull()
    expect(be.journal.filter(j => j.collection === 'inputs' && j.id === id)).toHaveLength(2)
    _resetTimeline()
  })

  it('a failed save keeps the whiteboard, reports failed, then saved after the retry', async () => {
    const be = new MemoryBackend()
    const { wb, postman } = await boot(be)
    be.failNext(1)
    writeInputs(() => { INPUTS.push({ ...ROW }) })
    const id = rowIdOf(ROW.remarks)
    const want = wb.get('inputs', id)
    await vi.advanceTimersByTimeAsync(300)
    expect(postman.status).toBe('failed')
    expect(wb.get('inputs', id)).toBe(want)
    await vi.advanceTimersByTimeAsync(1000)
    expect(postman.status).toBe('saved')
    expect(be.peek('inputs', id)).toBe(want)
  })

  it('a dropped letter is acknowledged but absent — documents that stage 1 trusts the ack', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    /* a first boot stores the seed's rows. Settle those first so the one letter in flight at the drop is the inputs
       edit below — otherwise the single dropped letter is consumed by a boot letter ahead of it. */
    await vi.advanceTimersByTimeAsync(300)
    be.dropOne()
    writeInputs(() => { INPUTS.push({ ...ROW }) })     // only its row changes now
    const id = rowIdOf(ROW.remarks)
    await vi.advanceTimersByTimeAsync(300)
    expect(be.journal.filter(j => j.op === 'put' && j.collection === 'inputs' && j.id === id)).toHaveLength(1)
    expect(be.peek('inputs', id)).toBeNull()
    expect(wb.get('inputs', id)).not.toBeNull()
  })

  it('a roster write saves that person\'s row (persistPeople, the command-routed door)', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    PEOPLE.dj.quals.tf = true
    persistPeople()
    expect(JSON.parse(wb.get('people', 'dj')!).quals.tf).toBe(true)
  })

  /* persistAll is gone ([DB-READINESS] group A, phase 2): nothing rewrites every row — a started store's boot writes none
     of its requests, people or planning rows (only a first boot stores its seed) */
  it('a started store\'s boot rewrites no request, person or planning row', async () => {
    const be = new MemoryBackend()
    await boot(be)
    await vi.advanceTimersByTimeAsync(300)
    const before = be.journal.length
    resetWorld()
    await boot(be)
    await vi.advanceTimersByTimeAsync(300)
    expect(be.journal.slice(before).filter(j => j.collection === 'inputs' || j.collection === 'people' || j.collection === 'plan')).toEqual([])
  })
})

/* The 8 Sep 26 bug pass on the seam: every case here was a real loss or
   corruption found by the audit probes, each pinned so it cannot return. */
describe('the week swap and the stored week records (8 Sep 26 bug pass)', () => {
  it('leaving an edited week for a blank one files the edit under ITS OWN id and nothing under the blank one — and a reload agrees', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    const A = CURWEEK
    writeText('dn:0.0', 'WEEK-A-NOTE')
    loadWeek(WEEK_C)
    expect(wb.has('weeks', weekId(WEEK_C))).toBe(false)
    expect(wb.get('weeks', `${weekId(A)}#0`)).toContain('WEEK-A-NOTE')
    loadWeek(A)                                            // and back: A's rows are not overwritten with C's blank days
    expect(wb.keys('weeks').filter(k => k.startsWith(weekId(WEEK_C)))).toEqual([])
    expect(wb.get('weeks', `${weekId(A)}#0`)).toContain('WEEK-A-NOTE')
    expect(DAYS[0].notes.map(noteText)).toContain('WEEK-A-NOTE')
    await vi.advanceTimersByTimeAsync(300)
    resetWorld()                                           // the reload
    await boot(be)
    expect(DAYS[0].notes.map(noteText)).toContain('WEEK-A-NOTE')
    loadWeek(WEEK_C)
    expect(DAYS[0].notes.map(noteText)).not.toContain('WEEK-A-NOTE')
    expect(DAYS[0].waves.length).toBe(0)
  })

  it('reload landing invariant (SID-IR-01/finding 5): auto-landed inputs come back WITH their ground rows', async () => {
    const be = new MemoryBackend()
    await boot(be)                                   // seeds + auto-lands activity inputs (acc='g' + rows)
    expect(INPUTS.some((r: any) => r.acc === 'g' && isPersonal(r.type)), 'the seed auto-lands at least one activity input').toBe(true)
    await vi.advanceTimersByTimeAsync(300)           // the first boot stored the seed's rows (acc='g'); the pristine week is NOT stored
    expect(be.peek('inputs', inpId(INPUTS[0]))).not.toBeNull()
    expect(be.peek('weeks', weekId(BOOT_WEEK)), 'a pristine week is deliberately not stored').toBeNull()
    resetWorld()                                     // a fresh reload: module state cleared, same backend
    await boot(be)
    /* every accepted activity input must have its ground row back — before the fix,
       the no-stash boot skipped a hydrated 'g' and left them accepted with no row */
    const orphaned = INPUTS.filter((r: any) => r.acc === 'g' && isPersonal(r.type))
      .filter((r: any) => !DAYS.some((d: any) => (d.ground || []).some((g: any) => g.src === inpId(r))))
    expect(orphaned.map((r: any) => inpId(r)), 'no input is accepted with no ground row').toEqual([])
  })

  it('a week merely visited is not persisted, even though an input lands on it during the swap', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    loadWeek(WEEK_B)
    expect(wb.has('weeks', weekId(WEEK_B))).toBe(false)
    expect(wb.has('weeks', weekId(BOOT_WEEK))).toBe(false)
  })

  /* the Undo writes the day back as it was (its own command's rows) — the row is never deleted by inference (plan §2.2),
     so the week stays stored, holding what it held before the edit (F2: edit → Undo to pristine → reload → pristine) */
  it('undo back to the load state: the stored day is back as it loaded, and a reload shows no trace of the edit', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    _resetTimeline(); installGlobalUndo()
    setSession({ user: 'ad', role: 'admin' })
    const was = txtGet('dn:0.0')
    writeText('dn:0.0', 'UNDONE')
    expect(wb.get('weeks', `${weekId(CURWEEK)}#0`)).toContain('UNDONE')
    const u = globalUndo()
    expect(u.ok, u.reason).toBe(true)
    expect(wb.get('weeks', `${weekId(CURWEEK)}#0`)).not.toContain('UNDONE')
    await vi.advanceTimersByTimeAsync(300)
    expect(be.peek('weeks', `${weekId(CURWEEK)}#0`)).not.toContain('UNDONE')
    resetWorld()
    await boot(be)
    expect(txtGet('dn:0.0')).toBe(was)
    _resetTimeline()
  })

  /* a saved week leaves storage only by a command that drops it — each of its rows removed by an explicit delete
     (plan §2.2), never by a reconcile that finds it unbacked */
  it('a week dropped from the saved copies by a command leaves storage, every row of it', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    const A = CURWEEK
    writeText('dn:0.0', 'OLD')
    loadWeek(WEEK_C)                                       // A is stashed and stored
    expect(wb.keys('weeks').filter(k => k.startsWith(weekId(A))).length).toBe(8)
    HOOKS.histPush()
    expect(wb.keys('weeks').filter(k => k.startsWith(weekId(A))).length, 'a history step never deletes a week').toBe(8)
    expect(writeInputsBatchWith([weekstashStore], () => { stashDrop(A) })).toBe(true)
    expect(wb.keys('weeks').filter(k => k.startsWith(weekId(A)))).toEqual([])
    await vi.advanceTimersByTimeAsync(300)
    expect(be.peek('weeks', `${weekId(A)}#0`)).toBeNull()
  })

  it('a section reorder on the board is filed like any other edit', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    setSession({ user: 'ad', role: 'admin' })
    expect(wb.has('weeks', weekId(CURWEEK))).toBe(false)
    expect(moveSectionTo(0, 'notes', 'waves')).toBe(true)
    const rec = JSON.parse(wb.get('weeks', `${weekId(CURWEEK)}#0`)!)
    expect(rec.d.secOrder[0]).not.toBe('notes')
  })

  it('a logout keeps the saved planning layer', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    setSession({ user: 'ad', role: 'admin' })
    writeInputs(() => { addPlanPuck('2026-07-15', 'keep me') })
    const id = `pp:${PLANPUCKS.find((p: any) => p.text === 'keep me').id}`
    expect(wb.get('plan', id)).toContain('keep me')
    resetSession(null)
    HOOKS.histPush()
    expect(wb.get('plan', id)).toContain('keep me')
  })
})

describe('hydrate hardening (8 Sep 26 bug pass)', () => {
  it('a null row in a stored record is dropped, not a crash', async () => {
    const be = new MemoryBackend()
    be.seed({
      inputs: { inull: 'null', i57: JSON.stringify({ ...ROW, iid: 'i57', yr: 2026, ord: 1 }) },
      plan: { 'pp:pnull': 'null', 'pp:pp4': JSON.stringify({ id: 'pp4', date: '2026-07-14', kind: 'note', text: 'x', ord: 1 }) },
    })
    await boot(be)
    expect(INPUTS).toHaveLength(1)
    expect(PLANPUCKS).toHaveLength(1)
  })

  it('a stored roster rebuilds the callsign index — a renamed callsign resolves after the reload, the old one no longer', async () => {
    const be = new MemoryBackend()
    const people = JSON.parse(PSNAP)
    const oldCs = people.dj.cs; people.dj.cs = 'Renamed'
    be.seed({ people: Object.fromEntries(Object.keys(people).filter(id => !people[id].special).map(id => [id, JSON.stringify(people[id])])) })
    await boot(be)
    expect(nameToId('renamed')).toBe('dj')
    expect(nameToId(oldCs)).toBeUndefined()
  })
})
