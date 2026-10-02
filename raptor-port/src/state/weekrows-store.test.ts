// @vitest-environment jsdom
/* [DB-READINESS] group A, phase 1.2–1.3 (plan §2.2, §2.5; R2-04, R2-07, R3-01, F3-01, F3-02, F2-08) — THE WEEK IN STORAGE,
   ONE ROW PER THING, WRITTEN FROM THE COMMAND THAT CHANGED IT. Each case drives the app's own doors on a real saved
   store (the Memory backend behind the whiteboard, as the Browser backend runs it) and reads what reached storage —
   which rows each command wrote, and that a reload reads them back:
   - an edit on one day writes that day's row alone, even beside a published day and a landed request;
   - a publish writes its issuance once; an Unpublish adds a retraction and never touches it; a reissue is ~1;
     Undo of either removes exactly the row it added;
   - a week switch saves nothing of the week left, and nothing of the week arriving — its landing is worked out at every load;
   - a week read back from storage is the week that was saved; a read-only (preserved) week is never rewritten;
   - a request taken off the programme stays off across a reload and a week switch — worked out from its own mark;
   - the other-day writers — the stale-mark sweep and the row-id fixer — touch only the days a command changed. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId } from '../engine/inputs'
import { PEOPLE, ID_BY_CS } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend } from '../engine/hooks'
import { stashClear, isPreservedWeek } from '../engine/weekstash'
import { SCHED, signOf, dayCurVer, dayApproved, protectedWeek } from '../engine/publish'
import { txtGet, txtSet, slotVal, setSlotVal, unacceptInput } from '../engine/slots'
import { PLANPUCKS, DAYRMK } from './plan'
import { initStore, writeText, writeInputs, weekStashSnap, weekDirty, loadWeek } from './store'
import { commitSetDayApproved, commitPublishALDay, commitUnpublish, commitDiscardPending, schedWrite, SCHED_TYPES, resyncSchedBaseline } from './sched-commit'
import { setSession } from './auth'
import { hydrate, wirePersist, weekId } from './persist'
import { splitWeek, weeksConverter } from './weekrows'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import type { Change as WbChange } from '../storage/whiteboard'
import { onCommit, type CommitEnvelope } from '../command'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { _resetDisclosure } from './disclosure'
import * as view from './view'
import { mkNote } from '../engine/note'
import { commitNewInput } from '../ui/inputedit'
import { validReportingFixture } from '../testing/reporting-fixture'
// D502: valid reporting precondition before baseline cloning; actions/assertions unchanged.
validReportingFixture()


const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026', W2 = '20/07/2026', W3 = '27/07/2026'
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const norm = (x: any) => JSON.parse(JSON.stringify(x))

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
let envs: CommitEnvelope[] = []
let unsub: (() => void) | null = null
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
  groups = []
  wb.subscribe(g => groups.push(g))
  unsub?.(); envs = []; unsub = onCommit(e => envs.push(e))
  return wb
}
/* the weeks rows the groups since the last clear wrote, as `id` (a put) or `-id` (a removal) */
const weekWrites = () => groups.flat().filter(c => c.collection === 'weeks').map(c => (c.value === null ? '-' : '') + c.id)
const clear = () => { groups = []; envs = [] }

beforeEach(() => { vi.useFakeTimers(); resetWorld() })
afterEach(() => { unsub?.(); unsub = null; _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); storeBackend.impl = null })

describe('one change, the rows it touched — and no others', () => {
  it('a Monday edit on a saved week beside a published day and a landed request writes Monday\'s row alone', async () => {
    const wb = await boot(new MemoryBackend())
    const wid = weekId(W1)
    expect(INPUTS.some((r: any) => r.acc === 'g'), 'the demo week has a landed request').toBe(true)
    sign(2); commitSetDayApproved(2, true)                      // the first save: the week row, Wednesday, its issuance (H3)
    expect(wb.keys('weeks').filter(k => k.startsWith(wid)).sort()).toEqual([wid, `${wid}#2`, `${wid}:is:${SCHED.orig[2].id}~0`].sort())
    clear()
    writeText('dn:0.0', 'MONDAY')
    expect(weekWrites()).toEqual([`${wid}#0`])
  })

  it('a move from Monday to Tuesday writes exactly the two days', async () => {
    await boot(new MemoryBackend())
    const wid = weekId(W1)
    writeText('dn:6.0', 'FIRST SAVE')
    const key = (di: number) => { const dw = DAYS[di].dutywaves.findIndex((w: any) => (w.rows || []).length); return `d:${di}.${dw}.0` }
    const who = slotVal(key(0)) || 'dj'
    clear()
    schedWrite(SCHED_TYPES.slot, () => { setSlotVal(key(0), ''); setSlotVal(key(1), who) })
    expect(weekWrites().sort()).toEqual([`${wid}#0`, `${wid}#1`])
  })
})

describe('the issued versions: written once, never touched, withdrawn beside', () => {
  it('publish, amend, Unpublish, reissue — one row each; Undo removes exactly the row it added', async () => {
    const wb = await boot(new MemoryBackend())
    const wid = weekId(W1)
    sign(0); commitSetDayApproved(0, true)
    const o = SCHED.orig[0].id
    expect(wb.has('weeks', `${wid}:is:${o}~0`)).toBe(true)
    clear()
    writeText('dn:0.0', 'AMENDED'); sign(0)
    clear()
    commitPublishALDay(0)
    const al = dayCurVer(0)
    expect(weekWrites().sort()).toEqual([`${wid}#0`, `${wid}:is:${al}~0`].sort())
    const issued = wb.get('weeks', `${wid}:is:${al}~0`)
    clear()
    commitUnpublish(0)
    expect(weekWrites().sort(), 'the Unpublish: the day and its retraction — never the issuance').toEqual([`${wid}#0`, `${wid}:rx:${al}~0`].sort())
    expect(wb.get('weeks', `${wid}:is:${al}~0`)).toBe(issued)
    clear()
    expect(globalUndo().ok, 'undo the Unpublish').toBe(true)
    expect(weekWrites()).toContain(`-${wid}:rx:${al}~0`)
    expect(weekWrites().filter(w => w.includes(':is:'))).toEqual([])
    clear()
    expect(globalUndo().ok, 'undo the AL').toBe(true)
    expect(weekWrites()).toContain(`-${wid}:is:${al}~0`)
    expect(globalUndo().ok).toBe(true)                            // the amending edit
    clear()
    writeText('dn:0.0', 'AGAIN'); sign(0); commitPublishALDay(0); commitUnpublish(0)
    writeText('dn:0.0', 'CORRECTED'); sign(0)
    clear()
    commitPublishALDay(0)
    expect(weekWrites()).toContain(`${wid}:is:${al}~1`)
  })

  it('a reload reads the same book back — Originals, amendments, the withdrawn ones — and the week stays editable', async () => {
    const be = new MemoryBackend()
    await boot(be)
    sign(0); commitSetDayApproved(0, true)
    writeText('dn:0.0', 'AMENDED'); sign(0); commitPublishALDay(0)
    commitUnpublish(0)
    writeText('dn:0.0', 'CORRECTED'); sign(0); commitPublishALDay(0)
    sign(3); commitSetDayApproved(3, true)
    const was = norm({ o: SCHED.orig, a: SCHED.als, rt: SCHED.retired, cur: SCHED.cur, ok: SCHED.dayOK })
    const note = txtGet('dn:0.0')
    await vi.advanceTimersByTimeAsync(300)
    resetWorld()
    await boot(be)
    const now = norm({ o: SCHED.orig, a: SCHED.als, rt: SCHED.retired, cur: SCHED.cur, ok: SCHED.dayOK })
    now.a.sort((x: any, y: any) => x.iso === y.iso ? x.seq - y.seq : (x.iso < y.iso ? -1 : 1))
    was.a.sort((x: any, y: any) => x.iso === y.iso ? x.seq - y.seq : (x.iso < y.iso ? -1 : 1))
    expect(now).toEqual(was)
    expect(txtGet('dn:0.0')).toBe(note)
    expect(protectedWeek()).toBe(false)
  })
})

describe('week navigation is read-only (R3-01, F3-01)', () => {
  it('A → B writes nothing of A, and a B never saved stays unsaved though requests land on it', async () => {
    const wb = await boot(new MemoryBackend())
    writeText('dn:0.0', 'A-EDIT')
    const a = Object.fromEntries(wb.keys('weeks').map(k => [k, wb.get('weeks', k)]))
    clear()
    loadWeek(W2)                                                  // the second demo week: its requests land
    expect(DAYS.some((d: any) => (d.ground || []).some((g: any) => g.src)), 'a request landed on B').toBe(true)
    expect(weekWrites()).toEqual([])
    expect(envs.every(e => e.changes.every(c => !c.id.startsWith(W1))), 'no record of the week left').toBe(true)
    expect(Object.fromEntries(wb.keys('weeks').map(k => [k, wb.get('weeks', k)]))).toEqual(a)
  })

  /* a week load's landing is NEVER saved (the group-A final read, Fable F2, 30 Sep 26): it is worked out again at every
     load, so saving it only wrote this client's copy of rows another person may have changed since — on a saved day or
     not, the request's own row included. It still runs as its one `sched.load` command (the undo timeline expects it). */
  it('a saved B re-lands its requests on screen at every load and writes nothing — saved days and unsaved alike', async () => {
    const wb = await boot(new MemoryBackend())
    loadWeek(W3); schedWrite(SCHED_TYPES.text, () => { DAYS[0].notes.push(mkNote('B-SAVED')); DAYS[2].notes.push(mkNote('WED-SAVED')) })   // B (a blank week) saved: Monday and Wednesday
    loadWeek(W1)
    clear()
    loadWeek(W3)
    expect(weekWrites(), 'an unchanged saved week writes nothing').toEqual([])
    expect(envs.filter(e => e.type === 'sched.load').length).toBe(0)
    loadWeek(W1)
    expect(commitNewInput({ person: 'dj', type: 'Meeting', start: '2026-07-29', allday: false, sTime: '09:00', eTime: '10:00', remarks: 'LANDS ON WED' })).toBe(true)
    clear()
    loadWeek(W3)
    /* since [DB-READINESS] phase 6 (c) the landing is worked out by the load itself, out of band — no command at all (the
       sched.load command existed only to latch the old landing's repaint) — so nothing of it can reach storage */
    expect(envs.filter(e => e.type === 'sched.load'), 'no command for the landing').toEqual([])
    expect(weekWrites(), 'a landing onto a SAVED day writes nothing').toEqual([])
    expect(groups.flat().filter(c => c.collection === 'inputs'), 'nor the request it landed').toEqual([])
    expect(wb.get('weeks', `${weekId(W3)}#2`)).not.toContain('LANDS ON WED')
    expect(JSON.stringify(DAYS[2]), 'the request shows on its day').toContain('LANDS ON WED')
    /* Thursday has never been saved: the request lands on it on screen, and nothing is written */
    loadWeek(W1)
    expect(commitNewInput({ person: 'dj', type: 'Meeting', start: '2026-07-30', allday: false, sTime: '09:00', eTime: '10:00', remarks: 'LANDS ON THU' })).toBe(true)
    clear()
    loadWeek(W3)
    expect(weekWrites(), 'a landing on a day no one has saved writes nothing').toEqual([])
    expect(wb.has('weeks', `${weekId(W3)}#3`)).toBe(false)
    expect(JSON.stringify(DAYS[3])).toContain('LANDS ON THU')
  })

  it('a read-only (preserved) saved week is never rewritten — visited, edited around, left', async () => {
    const be = new MemoryBackend()
    const legacy = JSON.stringify({ d: JSON.parse(DSNAP), ok: { 0: 1 }, o: { 0: { d: JSON.parse(DSNAP)[0], c: {} } }, cv: { 0: 'orig' }, a: [{ n: 1, keys: [] }] })
    be.seed({ weeks: { [weekId(W3)]: legacy } })
    const wb = await boot(be)
    expect(isPreservedWeek(W3)).toBe(true)
    loadWeek(W3)
    expect(protectedWeek()).toBe(true)
    writeText('dn:0.0', 'REFUSED?')
    loadWeek(W1); writeText('dn:0.0', 'ELSEWHERE')
    expect(wb.keys('weeks').filter(k => k.startsWith(weekId(W3)))).toEqual([weekId(W3)])
    expect(wb.get('weeks', weekId(W3))).toBe(legacy)
  })
})

describe('a request taken off stays off — worked out from its own mark (F3-02, P1-UN-BEHAVIOUR)', () => {
  const onGround = (id: string) => DAYS.some((d: any) => (d.ground || []).some((g: any) => g.src === id))
  const filed = (remarks: string) => INPUTS.find((x: any) => x.remarks === remarks)

  it('across a spanning request, a week switch and a reload', async () => {
    const be = new MemoryBackend()
    await boot(be)
    expect(commitNewInput({ person: 'dj', type: 'Training', start: '2026-07-19', end: '2026-07-20', allday: false, sTime: '09:00', eTime: '10:00', remarks: 'SPANS' })).toBe(true)
    const r: any = filed('SPANS'), id = inpId(r)
    expect(onGround(id), 'it lands on Sunday').toBe(true)
    schedWrite(SCHED_TYPES.mutate, () => { unacceptInput(6, r) })
    expect(r.acc).toBe('r'); expect(onGround(id)).toBe(false)
    loadWeek(W2)
    expect(onGround(id), 'not put on Monday of the next week').toBe(false)
    loadWeek(W1)
    expect(onGround(id), 'not put back on Sunday').toBe(false)
    await vi.advanceTimersByTimeAsync(300)
    resetWorld()
    await boot(be)
    expect(onGround(id), 'still off after a reload').toBe(false)
    loadWeek(W2)
    expect(onGround(id)).toBe(false)
  })

  it('across a day published and then reopened', async () => {
    const be = new MemoryBackend()
    await boot(be)
    expect(commitNewInput({ person: 'dj', type: 'Meeting', start: '2026-07-16', allday: false, sTime: '09:00', eTime: '10:00', remarks: 'OFF' })).toBe(true)
    const r: any = filed('OFF'), id = inpId(r)
    expect(onGround(id), 'it lands on Thursday').toBe(true)
    schedWrite(SCHED_TYPES.mutate, () => { unacceptInput(3, r) })
    sign(3); commitSetDayApproved(3, true); commitUnpublish(3)
    expect(dayApproved(3)).toBe(false)
    loadWeek(W2); loadWeek(W1)
    expect(onGround(id)).toBe(false)
    await vi.advanceTimersByTimeAsync(300)
    resetWorld()
    await boot(be)
    expect(onGround(id)).toBe(false)
    expect(filed('OFF').acc).toBe('r')
  })
})

describe('the other-day writers touch only the days a command changed (plan §3 phase 1.3, R2-07)', () => {
  it('the stale-mark sweep: an edit on Monday leaves a published Tuesday\'s mark (and row) alone', async () => {
    await boot(new MemoryBackend())
    const wid = weekId(W1)
    sign(0); commitSetDayApproved(0, true); sign(1); commitSetDayApproved(1, true)
    const issuedTue = txtGet('dn:1.0')
    SCHED.pending['dn:1.0'] = 1                                   // a mark on Tuesday whose value is back at the issued one
    resyncSchedBaseline()
    clear()
    writeText('dn:0.0', 'MONDAY')
    expect(weekWrites()).toEqual([`${wid}#0`])
    expect(SCHED.pending['dn:1.0'], 'Tuesday\'s mark waits for Tuesday\'s own edit').toBe(1)
    writeText('dn:1.0', 'CHANGED')
    clear()
    writeText('dn:1.0', issuedTue)                               // Tuesday's own edit, back to the issued value
    expect(SCHED.pending['dn:1.0']).toBeUndefined()
    expect(weekWrites()).toEqual([`${wid}#1`])
  })

  it('the row-id fixer: a copy on Monday of Thursday\'s row mints Monday\'s — Thursday keeps its id, and its row is not written', async () => {
    await boot(new MemoryBackend())
    const wid = weekId(W1)
    writeText('dn:6.0', 'FIRST SAVE')
    const thu = DAYS[3].notes[0]
    expect(thu && thu.rid).toBeTruthy()
    clear()
    schedWrite(SCHED_TYPES.text, () => { DAYS[0].notes.unshift(JSON.parse(JSON.stringify(thu))) })
    expect(DAYS[3].notes[0].rid, 'Thursday keeps its id').toBe(thu.rid)
    expect(DAYS[0].notes[0].rid).not.toBe(thu.rid)
    expect(weekWrites()).toEqual([`${wid}#0`])
  })

  it('clearing draft marks names every day it cleared, and writes those days only', async () => {
    await boot(new MemoryBackend())
    const wid = weekId(W1)
    writeText('dn:2.0', 'X'); writeText('dn:5.0', 'Y')
    clear()
    commitDiscardPending()
    const env = envs.find(e => e.type === 'sched.discard')!
    expect(env.changes.map(c => `${c.collection}/${c.id}`).sort()).toEqual([`sched.book/${W1}#2`, `sched.book/${W1}#5`])
    expect(weekWrites().sort()).toEqual([`${wid}#2`, `${wid}#5`])
  })
})

describe('the fold\'s converter for an old whole-week record', () => {
  it('turns one old record into the week\'s rows — the week row taking the old key — and leaves one it cannot split', () => {
    const blob = JSON.parse(weekStashSnap())
    const rows = splitWeek(blob, W1)
    const bad = JSON.stringify({ d: blob.d, p: { 'zz:no-day': 1 } })
    const entries = weeksConverter.convert({ weeks: { '13-07-2026': JSON.stringify(blob), '20-07-2026': bad, '27-07-2026': '{nope' } } as any)
    expect(entries.map(e => e.id).sort()).toEqual(Object.keys(rows).map(s => '13-07-2026' + s).sort())
    expect(entries.every(e => e.collection === 'weeks')).toBe(true)
    expect(entries.find(e => e.id === '13-07-2026')!.value).toBe(rows[''])
  })
})
