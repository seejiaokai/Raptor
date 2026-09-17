/* [CMDL-FINISH] P2 — the per-record write() seam (§3, F8/GU-007) for the three
   scheduler-side EnlistableStores that are directly importable (scheduler, people,
   settings). Proves: batch apply, put/delete (create->delete / delete->restore),
   foreign-week refusal for EVERY week-scoped collection (R2-011), the issued
   put-once gate (C7), and settings RESET-then-overlay (R3-001 — a restored older
   rules record drops a live override). LW + Tracker write() seams are covered in
   their own suites. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED } from '../engine/publish'
import { CURWEEK } from '../engine/waves'
import { VCONF, RULE_STD, rulesReset } from '../engine/rules'
import { PEOPLE, ID_BY_CS } from '../engine/people'
import { storeBackend, store } from '../engine/hooks'
import { initStore } from './store'
import { setSession } from './auth'
import * as view from './view'
import {
  registerPeopleSettingsCommandLayer, resyncPeopleBaseline, settingsStore, peopleStore,
} from './people-settings-commit'
import { schedStore } from './sched-commit'
import {
  initStore as lwInit, getState as lwGetState, subscribe as lwSubscribe, lwStore,
} from '../leavewar/state/store'
import { memoryBackend as lwMemoryBackend } from '../leavewar/state/storage'
import { commit, definePermission, anyone, isOk } from '../command'
import type { EnlistableStore, RecordEntry, CommitResult } from '../command'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const mem: Record<string, string> = {}
const fake = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }

/* run a store.write() inside a reducer that has enlisted it — the seam's contract
   (called only from an already-enlisting reducer). */
function restore(s: EnlistableStore, entries: RecordEntry[], opts?: { allowIssued?: boolean }): CommitResult {
  return commit({ type: 'test.restore', scope: { module: 'settings' }, apply: (txn) => { txn.enlist(s); s.write!(entries, opts) } })
}

beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}
  setSession({ user: 'ad', role: 'admin' })
  view.selDrop(); view.armDrop()
  initStore()
  registerPeopleSettingsCommandLayer()
  rulesReset()
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, JSON.parse(PSNAP))
  for (const k of Object.keys(ID_BY_CS)) delete (ID_BY_CS as any)[k]
  for (const id of Object.keys(PEOPLE)) { const cs = (PEOPLE as any)[id].cs; if (typeof cs === 'string') (ID_BY_CS as any)[cs.toLowerCase()] = id }
  resyncPeopleBaseline()
  definePermission('test.restore', anyone)
})
afterEach(() => { storeBackend.impl = null })

describe('settings write() — RESET-then-overlay (R3-001)', () => {
  it('restoring an older rules record drops a currently-live override, not just overlays', () => {
    const dflt = RULE_STD.v.crewRest
    // an active override: VCONF holds 999 and the stored record carries it
    VCONF.crewRest = 999
    store.set('rules', { v: { crewRest: 999 } })
    expect(VCONF.crewRest).toBe(999)
    // restore an OLDER, smaller rules record with no crewRest override
    const r = restore(settingsStore, [{ collection: 'settings', id: 'rules', value: { v: {} }, op: 'put' }])
    expect(isOk(r)).toBe(true)
    expect(VCONF.crewRest).toBe(dflt)   // reset to the standard, NOT still 999
  })

  it('deleting the rules record resets every rule to the squadron standard', () => {
    const dflt = RULE_STD.v.crewRest
    VCONF.crewRest = 777; store.set('rules', { v: { crewRest: 777 } })
    restore(settingsStore, [{ collection: 'settings', id: 'rules', op: 'delete' }])
    expect(VCONF.crewRest).toBe(dflt)
    expect(store.get('rules', null)).toBe(null)
  })
})

describe('people write() — put/delete + ID_BY_CS rebuild (CMDLF-009)', () => {
  it('puts a new person then deletes it, keeping the callsign index in step', () => {
    const id = 'ptest-1'
    let r = restore(peopleStore, [{ collection: 'people', id, value: { cs: 'ZZ9' }, op: 'put' }])
    expect(isOk(r)).toBe(true)
    expect((PEOPLE as any)[id]).toEqual({ cs: 'ZZ9' })
    expect((ID_BY_CS as any)['zz9']).toBe(id)
    r = restore(peopleStore, [{ collection: 'people', id, op: 'delete' }])
    expect(isOk(r)).toBe(true)
    expect((PEOPLE as any)[id]).toBeUndefined()
    expect((ID_BY_CS as any)['zz9']).toBeUndefined()   // stale callsign dropped on rebuild
  })
})

describe('scheduler write() — foreign-week refusal (R2-011) + issued gate (C7)', () => {
  it('applies a days record to the live world', () => {
    const rec = schedStore.records().get(`days/${CURWEEK}#0`)!
    const modified = JSON.parse(JSON.stringify(rec.value)); modified.__seamTest = 1
    const r = restore(schedStore, [{ collection: 'days', id: `${CURWEEK}#0`, value: modified, op: 'put' }])
    expect(isOk(r)).toBe(true)
    expect((DAYS[0] as any).__seamTest).toBe(1)
  })

  it('refuses a foreign-week write for every week-scoped collection', () => {
    for (const [coll, id] of [['days', 'ZZZZ#0'], ['sched.book', 'ZZZZ'], ['sched.mutes', 'ZZZZ'], ['sched.orig', 'ZZZZ:0'], ['sched.als', 'ZZZZ:0']] as const) {
      const r = restore(schedStore, [{ collection: coll as any, id, value: {}, op: 'put' }], { allowIssued: true })
      expect(isOk(r)).toBe(false)
      expect((r as any).reason).toBe('refused')
    }
  })

  it('refuses an issued record without allowIssued, accepts it with', () => {
    const orig = [{ collection: 'sched.orig' as const, id: `${CURWEEK}:0`, value: { id: 'iso#0', frozen: true }, op: 'put' as const }]
    expect((restore(schedStore, orig) as any).reason).toBe('refused')
    const r = restore(schedStore, orig, { allowIssued: true })
    expect(isOk(r)).toBe(true)
    expect((SCHED.orig as any)['0']).toEqual({ id: 'iso#0', frozen: true })
  })
})

describe('two-store restore (scheduler + LW in one reducer) runs NO reconciler between the writes (Q2)', () => {
  it('both stores apply and LW fires no repaint/reconcile mid-reducer', () => {
    lwInit(lwMemoryBackend())
    const warId = lwGetState().period.id
    const pid = lwGetState().people[0].id
    let inReducer = false
    let firedDuringReducer = 0
    const unsub = lwSubscribe(() => { if (inReducer) firedDuringReducer++ })
    const r = commit({
      type: 'test.restore', scope: { module: 'sched', weekId: CURWEEK },
      apply: (txn) => {
        inReducer = true
        txn.enlist(schedStore)
        const drec = schedStore.records().get(`days/${CURWEEK}#0`)!
        const mod = JSON.parse(JSON.stringify(drec.value)); mod.__twoStore = 1
        schedStore.write!([{ collection: 'days', id: `${CURWEEK}#0`, value: mod, op: 'put' }])
        txn.enlist(lwStore)
        lwStore.write!([{ collection: 'lw.cell', id: `${warId}:${pid}:2026-01-20`, value: 'LL', op: 'put' }])
        inReducer = false
      },
    })
    unsub()
    expect(isOk(r)).toBe(true)
    expect(firedDuringReducer).toBe(0)                            // no LW notify/reconcile BETWEEN the two writes (Q2)
    expect((DAYS[0] as any).__twoStore).toBe(1)                   // scheduler applied
    expect(lwGetState().grid[pid]['2026-01-20']).toBe('LL')      // LW applied
  })
})
