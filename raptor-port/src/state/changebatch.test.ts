// @vitest-environment jsdom
/* [DB-READINESS] group A, phase 4.1 (plan §2.7, §8 P4-BATCH-ID) — ONE SAVED GROUP, ONE CHANGE-LOG BATCH, on the REAL
   wiring (the boot main.tsx runs). Every command's group carries exactly one `changes/<clientBootId>-<first seq>` row —
   the design's `ChangeBatch`, a pure invalidation log: `{ type, seqs, actorId, at, items: [{ table, key, op }] }`, its
   items the rest of the group, row for row. A user action with its drained follow-ups is still ONE group with ONE batch;
   two quick commands on one row are two batches that both survive the postman's merge, and a reader of both fetches the
   row once. A no-op outermost command names the batch after the first seq that DID land (F3-10), and the batch's type is
   the outermost command's. Old batches are retired in the group that pushes them past the cap (the stand-in's purge —
   the database's is its change-tracking retention, data-model §9). */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SCHEMA_VERSION } from '../storage/reset'
import { INPUTS, inpId } from '../engine/inputs'
import { storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { initStore, weekStashSnap, weekDirty, writeInputs } from './store'
import { hydrate, wirePersist } from './persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { clientBootId } from '../storage/client'
import { tableOf } from '../storage/tables'
import type { Change as WbChange, Whiteboard } from '../storage/whiteboard'
import { commit, commitProjection, definePermission, anyone, onCommit, deferEffect } from '../command'
import { setSession } from './auth'
import { _setBatchCapForTest } from './changebatch'

const ISNAP = JSON.stringify(INPUTS)
const ROW = (remarks: string) => ({ person: 'dj', date: 'Jul 14', allday: true, type: 'LL', remarks, mod: '2026-07-01' })
beforeEach(() => { vi.useFakeTimers(); INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r)); stashClear() })
afterEach(() => { vi.useRealTimers(); setSession(null); storeBackend.impl = null; _setBatchCapForTest(null) })

let groups: WbChange[][] = []
async function boot() {
  const be = new MemoryBackend()
  be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
  const { wb } = await bootStorage(be)
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  await vi.advanceTimersByTimeAsync(600)
  be.journal.length = 0
  groups = []
  wb.subscribe(g => groups.push(g))
  return { be, wb }
}
type Batch = { type: string; seqs: number[]; actorId: string; at: string; items: { table: string; key: string; op: string }[] }
const batchesOf = (g: WbChange[]) => g.filter(c => c.collection === 'changes' && c.value !== null)
const readBatch = (c: WbChange): Batch => JSON.parse(c.value!)
/* what the batch must say: every other entry of its group, row for row */
const itemsFor = (g: WbChange[]) => g.filter(c => c.collection !== 'changes')
  .map(c => ({ table: tableOf(c.collection, c.id), key: `${c.collection}/${c.id}`, op: c.value === null ? 'delete' : 'put' }))
const sameItems = (a: Batch['items'], b: Batch['items']) =>
  expect([...a].sort((x, y) => (x.key < y.key ? -1 : 1))).toEqual([...b].sort((x, y) => (x.key < y.key ? -1 : 1)))

describe('one saved group carries one batch', () => {
  it('an ordinary user edit: one group, one batch, whose items are the rest of the group', async () => {
    await boot()
    setSession({ user: 'ad', role: 'admin' })
    const seqs: number[] = []
    const off = onCommit(e => { seqs.push(e.seq) })
    expect(writeInputs(() => { INPUTS.push(ROW('ONE')) })).toBe(true)
    off()
    expect(groups).toHaveLength(1)
    const g = groups[0]!
    const bs = batchesOf(g)
    expect(bs).toHaveLength(1)
    const b = readBatch(bs[0]!)
    sameItems(b.items, itemsFor(g))
    expect(b.items.some(i => i.table === 'Input' && i.key === `inputs/${inpId(INPUTS.find((r: any) => r.remarks === 'ONE'))}` && i.op === 'put')).toBe(true)
    expect(b.seqs).toEqual(seqs)
    expect(b.type).toBe('inputs.write')
    expect(b.actorId).toBe('ad')
    expect(bs[0]!.id).toBe(`${clientBootId()}-${seqs[0]}`)
    expect(Number.isNaN(Date.parse(b.at))).toBe(false)
  })

  it('a user action that drains two follow-ups is ONE group with ONE batch and three seqs', async () => {
    await boot()
    definePermission('test.user', anyone)
    const off = onCommit(env => {
      if (env.type !== 'test.user') return
      commitProjection({ type: 'test.p1', scope: { module: 'inputs' } as any, apply: () => { writeInputs(() => { INPUTS.push(ROW('P1')) }) } })
      commitProjection({ type: 'test.p2', scope: { module: 'inputs' } as any, apply: () => { writeInputs(() => { INPUTS.push(ROW('P2')) }) } })
    })
    commit({ type: 'test.user', scope: { module: 'inputs' } as any, apply: () => { writeInputs(() => { INPUTS.push(ROW('U')) }) } })
    off()
    expect(groups).toHaveLength(1)
    const bs = batchesOf(groups[0]!)
    expect(bs).toHaveLength(1)
    const b = readBatch(bs[0]!)
    expect(b.seqs).toHaveLength(3)
    expect(b.type).toBe('test.user')
    sameItems(b.items, itemsFor(groups[0]!))
    expect(b.items.filter(i => i.table === 'Input')).toHaveLength(3)
  })

  it('a no-op outermost command names its batch after the first seq that landed, and keeps its own type (F3-10)', async () => {
    await boot()
    definePermission('test.noop', anyone)
    const landed: number[] = []
    const off = onCommit(e => { landed.push(e.seq) })
    commit({ type: 'test.noop', scope: { module: 'inputs' } as any, apply: () => {
      deferEffect(() => { commitProjection({ type: 'test.later', scope: { module: 'inputs' } as any, apply: () => { writeInputs(() => { INPUTS.push(ROW('LATER')) }) } }) })
    } })
    off()
    expect(groups).toHaveLength(1)
    const bs = batchesOf(groups[0]!)
    expect(bs).toHaveLength(1)
    expect(landed).toHaveLength(1)
    expect(bs[0]!.id).toBe(`${clientBootId()}-${landed[0]}`)
    expect(readBatch(bs[0]!).type).toBe('test.noop')
  })

  it('two quick commands on ONE row: two batches, both survive the postman merging them; a reader fetches the row once', async () => {
    const { be, wb } = await boot()
    setSession({ user: 'ad', role: 'admin' })
    writeInputs(() => { INPUTS.push(ROW('SAME')) })
    await vi.advanceTimersByTimeAsync(300)
    be.journal.length = 0
    const r = () => INPUTS.find((x: any) => x.remarks === 'SAME' || x.remarks === 'SAME 2' || x.remarks === 'SAME 3')
    writeInputs(() => { r().remarks = 'SAME 2' })
    writeInputs(() => { r().remarks = 'SAME 3' })
    await vi.advanceTimersByTimeAsync(300)
    const sent = be.journal.filter(j => j.op === 'put')
    expect(new Set(sent.map(j => j.group)).size).toBe(1)                           // the postman merged them into one send
    const batchKeys = sent.filter(j => j.collection === 'changes').map(j => j.id!)
    expect(batchKeys).toHaveLength(2)
    const snap = await be.loadAll()
    for (const k of batchKeys) expect(snap.changes[k]).toBeDefined()                 // both survive
    /* the stand-in reader's step: every row the new batches name, read ONCE */
    const named = new Set<string>()
    for (const k of batchKeys) for (const it of (JSON.parse(snap.changes[k]!) as Batch).items) named.add(it.key)
    const iid = inpId(r())
    expect([...named].filter(k => k === `inputs/${iid}`)).toHaveLength(1)
    expect(JSON.parse(snap.inputs[iid]!).remarks).toBe('SAME 3')
    expect(wb.get('inputs', iid)).toBe(snap.inputs[iid])
  })

  it('old batches are retired in the group that pushes them past the cap', async () => {
    await boot()
    _setBatchCapForTest(2)
    setSession({ user: 'ad', role: 'admin' })
    writeInputs(() => { INPUTS.push(ROW('A')) })
    writeInputs(() => { INPUTS.push(ROW('B')) })
    const first = batchesOf(groups[0]!)[0]!.id
    writeInputs(() => { INPUTS.push(ROW('C')) })
    const g = groups[2]!
    expect(g.filter(c => c.collection === 'changes' && c.value === null).map(c => c.id)).toEqual([first])
    expect(batchesOf(g)).toHaveLength(1)
    /* the retired batch is not an item of the new one — a batch names data rows only */
    expect(readBatch(batchesOf(g)[0]!).items.some(i => i.key.startsWith('changes/'))).toBe(false)
  })

  it('a refused command sends nothing — no batch either', async () => {
    const { be } = await boot()
    setSession({ user: 'ad', role: 'admin' })
    const ok = writeInputs(() => { INPUTS.push(ROW('NO')); throw new Error('refused') })
    expect(ok).toBe(false)
    await vi.advanceTimersByTimeAsync(600)
    expect(groups).toEqual([])
    expect(be.journal.filter(j => j.op !== 'loadAll')).toEqual([])
  })
})

/* the whiteboard the app boots on seals through ONE sealer (installed with the stream consumer), never twice */
describe('wiring', () => {
  it('re-wiring the same whiteboard installs nothing twice', async () => {
    const { wb } = await boot()
    wirePersist(wb as Whiteboard, { weekSnap: weekStashSnap, weekDirty })
    setSession({ user: 'ad', role: 'admin' })
    writeInputs(() => { INPUTS.push(ROW('TWICE')) })
    expect(batchesOf(groups[0]!)).toHaveLength(1)
    expect(readBatch(batchesOf(groups[0]!)[0]!).seqs).toHaveLength(1)
  })
})
