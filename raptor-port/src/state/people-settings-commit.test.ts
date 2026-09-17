/* [ARCH-STACK] Step 2 phase 3 — PEOPLE + SETTINGS routed through the command gate
   (design §5.2). Proves the ADDITIVE seam wiring: a durable settings write
   (store.set, via any save function) and a durable people write (persistPeople)
   now emit a record-level envelope (property c) with ZERO call-site changes; a
   rejected write rolls the module state back (atomicity, property a); and the
   stream RECONSTRUCTS the persisted people/settings vs the legacy serializers
   (completeness, §7 / R4-004). */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { storeBackend, store } from '../engine/hooks'
import { PEOPLE, ID_BY_CS } from '../engine/people'
import { STORE_CFG, addStore, storesSave, storesReset, storesAreStandard } from '../engine/stores'
import { CXR_CFG, cxReasonsSave, cxReasonsReset } from '../engine/cxreasons'
import {
  persistPeople, registerPeopleSettingsCommandLayer, SETTINGS_KEYS, resyncPeopleBaseline,
} from './people-settings-commit'
import { onCommit, setConflictChecker } from '../command'
import type { CommitEnvelope } from '../command'

/* an in-memory settings backend — never real localStorage (headless is null) */
const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { mem[k] = v },
}
const PSNAP = JSON.stringify(PEOPLE)

let caught: CommitEnvelope[] = []
let unsub: () => void

beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  registerPeopleSettingsCommandLayer()   // installs the store.set hook + registers types/stores
  storesReset(); cxReasonsReset()              // route through commands (uncaught — before we subscribe)
  // restore the PEOPLE roster + its index + the people baseline to the seed
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, JSON.parse(PSNAP))
  for (const k of Object.keys(ID_BY_CS)) delete (ID_BY_CS as any)[k]
  for (const id of Object.keys(PEOPLE)) {
    const cs = (PEOPLE as any)[id].cs
    if (typeof cs === 'string') (ID_BY_CS as any)[cs.toLowerCase()] = id
  }
  resyncPeopleBaseline()
  caught = []
  unsub = onCommit(e => caught.push(e))
})
afterEach(() => { unsub(); setConflictChecker(null); storeBackend.impl = null })

describe('a settings write emits a settings/<key> envelope (property c), no call-site change', () => {
  it('storesSave (after addStore) -> ONE envelope carrying settings/stores', () => {
    addStore('LGB'); storesSave()
    expect(storesAreStandard()).toBe(false)
    expect(caught.length).toBe(1)
    expect(caught[0].type).toBe('settings.stores')
    expect(caught[0].scope).toEqual({ module: 'settings' })
    expect(caught[0].changes.some(c => c.collection === 'settings' && c.id === 'stores')).toBe(true)
  })

  it('a no-op save (standard list -> null, unchanged) emits nothing', () => {
    storesSave()   // already standard/null after storesReset
    expect(caught.length).toBe(0)
  })

  it('a rejected settings write rolls the module CFG back (atomicity)', () => {
    // reject any settings write that carries a store labelled ROLLBACKTEST
    setConflictChecker((changes) =>
      changes.some(c => c.collection === 'settings' && JSON.stringify(c.after).includes('ROLLBACKTEST'))
        ? 'rejected for the test' : null)
    addStore('ROLLBACKTEST'); storesSave()
    // restoreSettings re-ran storesLoad -> the CFG is rebuilt from the (unchanged) store
    expect(storesAreStandard()).toBe(true)
    expect(STORE_CFG.some(([, l]) => l === 'ROLLBACKTEST')).toBe(false)
    expect(caught.length).toBe(0)
  })
})

describe('a people write emits a people/<personId> envelope (property c)', () => {
  it('persistPeople (after a roster edit) -> ONE envelope carrying that person', () => {
    const id = Object.keys(PEOPLE)[0]
    ;(PEOPLE as any)[id].initials = 'ZZ'
    persistPeople()
    expect(caught.length).toBe(1)
    expect(caught[0].type).toBe('people.edit')
    expect(caught[0].scope).toEqual({ module: 'people' })
    expect(caught[0].changes.some(c => c.collection === 'people' && c.id === id)).toBe(true)
    expect(caught[0].changes.find(c => c.id === id)!.after).toMatchObject({ initials: 'ZZ' })
  })

  it('resyncPeopleBaseline picks up an out-of-band roster so the next edit diffs against it, not the seed (Fable-5)', () => {
    // simulate persist.ts hydrate() replacing PEOPLE AFTER registration captured
    // the seed baseline; initStore() calls resyncPeopleBaseline() to correct it.
    const id = Object.keys(PEOPLE)[0]
    ;(PEOPLE as any)[id].initials = 'HYDRATED'
    resyncPeopleBaseline()
    caught = []
    ;(PEOPLE as any)[id].initials = 'EDIT'
    persistPeople()
    const ch = caught[0].changes.filter(c => c.collection === 'people')
    expect(ch.length).toBe(1)                                   // only the ONE edited person
    expect((ch[0].before as any).initials).toBe('HYDRATED')     // before = hydrated roster, not the seed
  })

  it('a rejected people write rolls the roster back (atomicity)', () => {
    const id = Object.keys(PEOPLE)[0]
    const before = JSON.stringify((PEOPLE as any)[id])
    setConflictChecker((changes) => changes.some(c => c.collection === 'people') ? 'rejected' : null)
    ;(PEOPLE as any)[id].initials = 'ZZ'
    persistPeople()
    expect(JSON.stringify((PEOPLE as any)[id])).toBe(before)   // rebuilt from the baseline snapshot
    expect(caught.length).toBe(0)
  })
})

describe('completeness — the stream reconstructs people + settings (§7 / R4-004)', () => {
  it('a sequence of people + settings writes reconstructs to the live state', () => {
    const basePeople = JSON.parse(JSON.stringify(PEOPLE))
    const baseSettings: Record<string, unknown> = {}
    for (const k of SETTINGS_KEYS) baseSettings[k] = store.get(k, null)

    const id = Object.keys(PEOPLE)[0]
    ;(PEOPLE as any)[id].initials = 'QQ'; persistPeople()
    addStore('LGB'); storesSave()
    CXR_CFG.push('TEST REASON'); cxReasonsSave()

    // fold every emitted change onto the snapshots
    const people: Record<string, any> = { ...basePeople }
    const settings: Record<string, unknown> = { ...baseSettings }
    for (const env of caught) for (const c of env.changes) {
      if (c.collection === 'people') {
        if (c.op === 'delete') delete people[c.id]; else people[c.id] = c.after
      } else if (c.collection === 'settings') {
        settings[c.id] = c.op === 'delete' ? null : c.after
      }
    }
    expect(people).toEqual(PEOPLE)
    const live: Record<string, unknown> = {}
    for (const k of SETTINGS_KEYS) live[k] = store.get(k, null)
    expect(settings).toEqual(live)
  })
})
