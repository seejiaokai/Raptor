// @vitest-environment jsdom
/* [DB-READINESS] group A, phase 2 (plan §2.3, §2.5; F2-07, F3-07, R2-10) — REQUESTS, THE ROSTER AND THE PLANNING
   CALENDAR, ONE STORED ROW EACH. Each case drives the app's own doors on a real saved store and reads what reached
   storage: one request filed writes that request's row and nothing else; a stale client (booted before someone else's
   delete) never writes the deleted row back; two clients' planning notes on one day are two rows (ids never collide);
   a row that will not read is left as it is; the order of every list survives a reload, ties broken by id; the two
   placeholder pucks (ALL, ALL AVAIL) are code, never rows; a cleared setting removes its key (F3-07). */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId } from '../engine/inputs'
import { PEOPLE, ID_BY_CS } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, store } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED } from '../engine/publish'
import { PLANPUCKS, DAYRMK, addPlanPuck, setDayRemark } from './plan'
import { initStore, writeInputs, weekStashSnap, weekDirty, loadWeek } from './store'
import { setSession } from './auth'
import { hydrate, wirePersist } from './persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import type { Change as WbChange } from '../storage/whiteboard'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { _resetDisclosure } from './disclosure'
import { resyncSchedBaseline } from './sched-commit'
import { resyncPeopleBaseline } from './people-settings-commit'
import { updatePersonField } from './quals-write'
import { commitNewInput, removeInput } from '../ui/inputedit'
import * as view from './view'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026'

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
  return wb
}
const writes = (coll: string) => groups.flat().filter(c => c.collection === coll).map(c => (c.value === null ? '-' : '') + c.id)
const clear = () => { groups = [] }
const file = (remarks: string, start = '2026-07-16', type = 'Meeting') =>
  commitNewInput({ person: 'dj', type, start, allday: false, sTime: '09:00', eTime: '10:00', remarks })
const byRemarks = (r: string) => INPUTS.find((x: any) => x.remarks === r)
const reboot = async (be: MemoryBackend) => { await vi.advanceTimersByTimeAsync(300); resetWorld(); return boot(be) }

beforeEach(() => { vi.useFakeTimers(); resetWorld() })
afterEach(() => { _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); storeBackend.impl = null })

describe('a request is one stored row', () => {
  it('filing one request writes exactly its row — no other request, no whole list', async () => {
    const wb = await boot(new MemoryBackend())
    expect(wb.has('inputs', 'all'), 'no whole-list record').toBe(false)
    clear()
    expect(file('ONE')).toBe(true)
    expect(writes('inputs')).toEqual([inpId(byRemarks('ONE'))])
  })

  it('a new request goes on top of the list and says so in its own row (ord) — the rows around it are untouched', async () => {
    const wb = await boot(new MemoryBackend())
    const firstWas = INPUTS[0]
    expect(file('TOP')).toBe(true)
    const top = byRemarks('TOP')
    expect(INPUTS[0]).toBe(top)
    expect(typeof top.ord).toBe('number')
    expect(top.ord).toBeLessThan(firstWas.ord)
    expect(JSON.parse(wb.get('inputs', inpId(top))!).ord).toBe(top.ord)
  })

  it('a stale client (booted before someone deleted X) filing Y never writes X back', async () => {
    const be = new MemoryBackend()
    const wb = await boot(be)
    expect(file('X')).toBe(true)
    const x = byRemarks('X'), xid = inpId(x)
    const stale = JSON.parse(JSON.stringify(x))
    expect(removeInput(x)).not.toBe(false)
    expect(wb.has('inputs', xid), 'the delete removed its row').toBe(false)
    /* the other client still holds X, as it loaded it — in its world AND its committed baseline */
    INPUTS.unshift(stale); resyncSchedBaseline()
    clear()
    expect(file('Y')).toBe(true)
    expect(writes('inputs')).toEqual([inpId(byRemarks('Y'))])
    expect(wb.has('inputs', xid), 'X stays deleted').toBe(false)
  })

  it('a stored request that will not read is left as it is by an edit elsewhere', async () => {
    const be = new MemoryBackend()
    be.seed({ inputs: { ibad: '{not json' } })
    const wb = await boot(be)
    expect(file('ELSEWHERE')).toBe(true)
    expect(wb.get('inputs', 'ibad')).toBe('{not json')
  })

  it('Undo of a deleted request puts its row back, in its place in the list', async () => {
    const wb = await boot(new MemoryBackend())
    const order = INPUTS.map((r: any) => inpId(r))
    const r = INPUTS[3], id = inpId(r)
    expect(removeInput(r)).not.toBe(false)
    expect(wb.has('inputs', id)).toBe(false)
    const u = globalUndo()
    expect(u.ok, u.reason).toBe(true)
    expect(wb.has('inputs', id)).toBe(true)
    expect(INPUTS.map((x: any) => inpId(x))).toEqual(order)
  })
})

describe('the order of every list survives a reload — and ties break by id', () => {
  it('the requests, the roster and the planning notes read back in the order they were saved', async () => {
    const be = new MemoryBackend()
    await boot(be)
    expect(file('NEW TOP')).toBe(true)
    addPlanPuckCmd('2026-07-20', 'first'); addPlanPuckCmd('2026-07-20', 'second')
    const inputs = INPUTS.map((r: any) => inpId(r))
    const people = Object.keys(PEOPLE)
    const pucks = PLANPUCKS.map((p: any) => p.id)
    await reboot(be)
    expect(INPUTS.map((r: any) => inpId(r))).toEqual(inputs)
    expect(Object.keys(PEOPLE)).toEqual(people)
    expect(PLANPUCKS.map((p: any) => p.id)).toEqual(pucks)
  })

  it('two rows written at one place by two clients read in the same order every time — by id', async () => {
    const be = new MemoryBackend()
    be.seed({ inputs: {
      izz: JSON.stringify({ iid: 'izz', person: 'dj', type: 'Meeting', date: 'Jul 16', yr: 2026, allday: false, s: 540, e: 600, remarks: 'ZZ', ord: 5000 }),
      iaa: JSON.stringify({ iid: 'iaa', person: 'dj', type: 'Meeting', date: 'Jul 16', yr: 2026, allday: false, s: 540, e: 600, remarks: 'AA', ord: 5000 }),
    }, settings: { schema: JSON.stringify({ stage: 1, dataFormatVersion: SCHEMA_VERSION, initialized: true, appliedAt: '', minClient: SCHEMA_VERSION }) } })
    await boot(be)
    const once = INPUTS.map((r: any) => r.iid)
    expect(once.indexOf('iaa')).toBeLessThan(once.indexOf('izz'))
    await reboot(be)
    expect(INPUTS.map((r: any) => r.iid)).toEqual(once)
  })
})

/* a planning note added as the Inputs page adds one — inside its request command */
function addPlanPuckCmd(iso: string, text: string) { expect(writeInputs(() => { addPlanPuck(iso, text) })).toBe(true) }

describe('the planning calendar and the roster, one row each', () => {
  it('a planning note and a day title are rows of their own — no whole planning record', async () => {
    const wb = await boot(new MemoryBackend())
    clear()
    addPlanPuckCmd('2026-07-21', 'NOTE')
    const p = PLANPUCKS.find((x: any) => x.text === 'NOTE')
    expect(writes('plan')).toEqual([`pp:${p.id}`])
    clear()
    expect(writeInputs(() => { setDayRemark('2026-07-21', 'TITLE') })).toBe(true)
    expect(writes('plan')).toEqual(['dm:2026-07-21'])
    expect(wb.has('plan', 'all')).toBe(false)
  })

  it('two clients adding a note on one day never mint the same id (F2-07)', async () => {
    const be = new MemoryBackend()
    await boot(be)
    await vi.advanceTimersByTimeAsync(300)
    const before = await be.loadAll()
    addPlanPuckCmd('2026-07-22', 'FROM A')
    const a = PLANPUCKS.find((x: any) => x.text === 'FROM A').id
    /* client B boots from the store as it stood before A's note */
    const beB = new MemoryBackend(); beB.seed(before as any)
    resetWorld(); await boot(beB)
    addPlanPuckCmd('2026-07-22', 'FROM B')
    const b = PLANPUCKS.find((x: any) => x.text === 'FROM B').id
    expect(b).not.toBe(a)
    /* a per-browser counter ('pp1', 'pp2' …) mints the same id on two clients booted from one store — the ids are the
       app's opaque ones (engine/newid.ts), as a request's and a row's are */
    expect(a).not.toMatch(/^pp\d+$/)
    expect(b).not.toMatch(/^pp\d+$/)
  })

  it('a Quals change writes that person\'s row alone; the two placeholder pucks are never stored', async () => {
    const wb = await boot(new MemoryBackend())
    clear()
    expect(updatePersonField('dj', { remarks: 'QUALS NOTE' })).toBeNull()
    expect(writes('people')).toEqual(['dj'])
    expect(JSON.parse(wb.get('people', 'dj')!).remarks).toBe('QUALS NOTE')
    expect(wb.has('people', 'all'), 'ALL is code').toBe(false)
    expect(wb.has('people', 'allavail'), 'ALL AVAIL is code').toBe(false)
  })

  it('a first boot stores every seed request and person as a row, in the boot\'s one group', async () => {
    const wb = await boot(new MemoryBackend())
    for (const r of INPUTS) expect(wb.has('inputs', inpId(r)), inpId(r)).toBe(true)
    for (const id of Object.keys(PEOPLE)) expect(wb.has('people', id), id).toBe(!PEOPLE[id].special)
  })
})

describe('a cleared setting removes its key (F3-07)', () => {
  it('saving null takes the setting out of storage — it reads as never set', async () => {
    const wb = await boot(new MemoryBackend())
    store.set('cxreasons', ['WX'])
    expect(wb.has('settings', 'cxreasons')).toBe(true)
    store.set('cxreasons', null)
    expect(wb.has('settings', 'cxreasons')).toBe(false)
    expect(store.get('cxreasons', null)).toBeNull()
  })
})

void resyncPeopleBaseline

describe('the fold\'s converters for the old whole-list records', () => {
  it('requests: one row each in the old order, the old record removed; one that will not read is left', async () => {
    const { inputsConverter } = await import('./persist')
    const out = inputsConverter.convert({ inputs: { all: JSON.stringify([{ iid: 'i1', person: 'dj' }, { person: 'bane' }, null]) } } as any)
    expect(out.map(e => e.id)).toEqual(['i1', 'ifold1', 'all'])
    expect(out.map(e => (e.value == null ? null : JSON.parse(e.value).ord))).toEqual([1024, 2048, null])
    expect(inputsConverter.convert({ inputs: { all: '{nope' } } as any)).toEqual([])
  })
  it('the roster: one row per person, never a placeholder; the old record (whose key is ALL\'s id) removed', async () => {
    const { peopleConverter } = await import('./persist')
    const out = peopleConverter.convert({ people: { all: JSON.stringify({ dj: { cs: 'DJ' }, bane: { cs: 'Bane' }, all: { cs: 'ALL', special: true }, allavail: { cs: 'ALL AVAIL', special: true } }) } } as any)
    expect(out.map(e => `${e.id}=${e.value == null ? 'removed' : JSON.parse(e.value).ord}`)).toEqual(['all=removed', 'dj=1024', 'bane=2048'])
  })
  it('the planning calendar: a row per note and per day title, the old record removed', async () => {
    const { planConverter } = await import('./persist')
    const out = planConverter.convert({ plan: { all: JSON.stringify({ pp: [{ id: 'pp1', text: 'a' }, { id: 'pp2', text: 'b' }], dm: { '2026-07-14': 'T' } }) } } as any)
    expect(out.map(e => e.id)).toEqual(['pp:pp1', 'pp:pp2', 'dm:2026-07-14', 'all'])
    expect(JSON.parse(out[2].value!)).toBe('T')
  })
})
