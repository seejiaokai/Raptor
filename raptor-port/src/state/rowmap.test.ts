// src/state/rowmap.test.ts
/* [DB-READINESS] group A, phase 0 (plan §2.2) — THE STREAM CONSUMER, wired but mapping nothing yet.
   Every command's envelope passes, at phase 9, through ONE pure mapper from a logical record to the
   stored row it lives in; the consumer writes those rows inside the command's own whiteboard
   transaction, so they reach storage in the command's ONE group. A remove happens ONLY for an
   explicit `delete` change — never inferred. Production registers no mapper in phase 0, so nothing
   extra is written; each later phase registers its own collection's. */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { commit, registerGuardedStore, definePermission, anyone, installBaselineInvariants, setTxnWrapper } from '../command'
import { _resetCommandEngine, commitAs } from '../command/commit'
import { systemActor } from '../command/actor'
import { _resetPermissions } from '../command/permissions'
import { _resetInvariants } from '../command/harness'
import { _resetEffectContexts } from '../command/latch'
import { makeStore } from '../command/_fake'
import type { Change as CmdChange, Command } from '../command/types'
import { Whiteboard, type Change } from '../storage/whiteboard'
import { mapChange, mapEnvelope, wireRowConsumer, _setMapperForTest, _clearMappersForTest, mappedCollections } from './rowmap'

let wb: Whiteboard
let groups: Change[][]
let unwire: () => void
beforeEach(() => {
  _resetCommandEngine(); _resetPermissions(); _resetInvariants(); _resetEffectContexts(); _clearMappersForTest()
  installBaselineInvariants()
  definePermission('test.put', anyone)
  wb = new Whiteboard()
  groups = []
  wb.subscribe(g => groups.push(g))
  setTxnWrapper(wb)
  unwire = wireRowConsumer(wb)
})
afterEach(() => { unwire(); _clearMappersForTest() })

const cmd = (apply: Command['apply']): Command => ({ type: 'test.put', scope: { module: 'plan' }, apply })

describe('the mapper', () => {
  it('production maps NO logical collection yet (phase 0)', () => {
    _clearMappersForTest()
    expect(mappedCollections()).toEqual([])
    expect(mapChange({ op: 'put', collection: 'inputs', id: 'i1', after: { a: 1 } })).toEqual([])
  })

  it('a put maps to a row value; a delete maps to a remove', () => {
    _setMapperForTest('plan', c => [{ collection: 'plan', id: `pp:${c.id}`, value: c.op === 'delete' ? null : JSON.stringify(c.after) }])
    expect(mapChange({ op: 'put', collection: 'plan', id: 'x', after: 1 })).toEqual([{ collection: 'plan', id: 'pp:x', value: '1' }])
    expect(mapChange({ op: 'delete', collection: 'plan', id: 'x', before: 1 })).toEqual([{ collection: 'plan', id: 'pp:x', value: null }])
  })

  it('a mapper may never remove a row for a PUT (a delete is never inferred)', () => {
    _setMapperForTest('plan', () => [{ collection: 'plan', id: 'other', value: null }])
    expect(() => mapChange({ op: 'put', collection: 'plan', id: 'x', after: 1 })).toThrow(/delete/)
  })

  it('the same stored row twice in one envelope: a put beats a remove, and the later put wins', () => {
    _setMapperForTest('plan', c => [{ collection: 'plan', id: 'row', value: c.op === 'delete' ? null : String(c.after) }])
    const ch = (op: 'put' | 'delete', after?: number): CmdChange => ({ op, collection: 'plan', id: String(Math.random()), ...(op === 'put' ? { after } : { before: 0 }) })
    expect(mapEnvelope([ch('put', 1), ch('delete')])).toEqual([{ collection: 'plan', id: 'row', value: '1' }])
    expect(mapEnvelope([ch('delete'), ch('put', 2)])).toEqual([{ collection: 'plan', id: 'row', value: '2' }])
    expect(mapEnvelope([ch('put', 1), ch('put', 3)])).toEqual([{ collection: 'plan', id: 'row', value: '3' }])
  })
})

describe('the stream consumer', () => {
  it('with no mapper, a command writes nothing extra', () => {
    const a = makeStore('A', 'plan'); registerGuardedStore(a.store)
    commit(cmd(txn => { txn.enlist(a.store); a.set('x', 1) }))
    expect(groups).toHaveLength(0)
  })

  it('a mapped command\'s rows land in the command\'s ONE group, beside its other writes', () => {
    _setMapperForTest('plan', c => [{ collection: 'plan', id: `pp:${c.id}`, value: c.op === 'delete' ? null : JSON.stringify(c.after) }])
    const a = makeStore('A', 'plan'); registerGuardedStore(a.store)
    commit(cmd(txn => { txn.enlist(a.store); a.set('x', { n: 1 }); wb.set('settings', 'k', 'v') }))
    expect(groups).toHaveLength(1)
    expect(groups[0]).toEqual(expect.arrayContaining([
      { collection: 'plan', id: 'pp:x', value: '{"n":1}' },
      { collection: 'settings', id: 'k', value: 'v' },
    ]))
    commit(cmd(txn => { txn.enlist(a.store); a.del('x') }))
    expect(groups).toHaveLength(2)
    expect(groups[1]).toEqual([{ collection: 'plan', id: 'pp:x', value: null }])
    expect(wb.has('plan', 'pp:x')).toBe(false)
  })

  it('a refused command writes no row', () => {
    _setMapperForTest('plan', c => [{ collection: 'plan', id: `pp:${c.id}`, value: JSON.stringify(c.after) }])
    const a = makeStore('A', 'plan'); registerGuardedStore(a.store)
    commit(cmd(txn => { txn.enlist(a.store); a.set('x', 1); throw new Error('no') }))
    expect(groups).toHaveLength(0)
    expect(wb.has('plan', 'pp:x')).toBe(false)
  })

  it('a remote envelope (emit:false) is never written back — no echo', () => {
    _setMapperForTest('plan', c => [{ collection: 'plan', id: `pp:${c.id}`, value: JSON.stringify(c.after) }])
    const a = makeStore('A', 'plan'); registerGuardedStore(a.store)
    commitAs(cmd(txn => { txn.enlist(a.store); a.set('x', 1) }), { actor: systemActor(), origin: 'remote' })
    expect(wb.has('plan', 'pp:x')).toBe(false)
  })
})
