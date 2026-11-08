/* [RD-LEFT-1108] — the people-and-settings save layer no longer imports the files that save through it.
   React Doctor found 13 import cycles, every one through state/people-settings-commit.ts: it imported accounts,
   changes, noticeseen, apprseen, lwseen and flyplan (for their loaders and their command-type lists) while each of
   them imports its commit helpers. The registration that needs them moved up to state/people-settings-wire.ts, which
   hands the save layer the four loaders it re-runs on a rollback or an undo.

   The first test pins the break itself (red before the move). The rest pin that nothing changed: after registration a
   rollback and an undo still rebuild each module's memory from what is stored, and every command type each module
   declares is still registered. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { storeBackend, store } from '../engine/hooks'
import { hasPermission } from '../command/permissions'
import { registerPeopleSettingsCommandLayer } from './people-settings-wire'
import { settingsStore, commitSettingsIntent } from './people-settings-commit'
import * as accounts from './accounts'
import * as changes from './changes'
import { hasRead, NOTICESEEN_PFX, NOTICE_TYPES } from './noticeseen'
import { APPRSEEN_TYPES } from './apprseen'
import { LWSEEN_TYPES } from './lwseen'
import { getFlyPlan } from './flyplan'
import { FLY_TYPES } from './flyplan-model'

const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { mem[k] = v },
  keys: () => Object.keys(mem),   // the row kinds are found by listing what is stored
}

beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  registerPeopleSettingsCommandLayer()
})
afterEach(() => { storeBackend.impl = null })

/* the two ways the layer rebuilds memory, each as the app runs it — inside a command: an undo's record write
   (settingsStore.write) and a rollback of a command that threw (settingsStore.restore) */
const viaUndoWrite = () => { commitSettingsIntent('notices.seen', { owner: 'pw' }, () => settingsStore.write!([])) }
const viaRollback = () => {
  try { commitSettingsIntent('notices.seen', { owner: 'pw' }, () => { throw new Error('boom') }) } catch { /* refused */ }
}

describe('the save layer imports none of the files that save through it', () => {
  it('people-settings-commit.ts names none of accounts, changes, noticeseen, apprseen, lwseen, flyplan, roster-add', () => {
    const src = readFileSync(fileURLToPath(new URL('./people-settings-commit.ts', import.meta.url)), 'utf8')
    const from = [...src.matchAll(/from\s+'([^']+)'/g)].map(m => m[1])
    for (const mod of ['./accounts', './changes', './noticeseen', './apprseen', './lwseen', './flyplan', './roster-add']) {
      expect(from, mod).not.toContain(mod)
    }
  })
})

describe('a rollback or an undo still rebuilds each module from what is stored', () => {
  it('the accounts list is read again (a fresh list, no account rows stored)', () => {
    const before = accounts.ACCOUNTS_LIST
    viaUndoWrite()
    expect(accounts.ACCOUNTS_LIST).not.toBe(before)
    const mid = accounts.ACCOUNTS_LIST
    viaRollback()
    expect(accounts.ACCOUNTS_LIST).not.toBe(mid)
  })
  it('the change history\'s seen marks are read again', () => {
    const v0 = changes.SEEN_VER
    viaUndoWrite()
    expect(changes.SEEN_VER).toBeGreaterThan(v0)
    const v1 = changes.SEEN_VER
    viaRollback()
    expect(changes.SEEN_VER).toBeGreaterThan(v1)
  })
  it('the bell\'s read marks are read again — a row stored raw is seen only after the rebuild', () => {
    const n = { id: 'n-wire', at: 5 }
    expect(hasRead('pw', n)).toBe(false)
    store.set(NOTICESEEN_PFX + 'pw', { upto: 10, ids: [] })   // a row key: written raw, no load
    expect(hasRead('pw', n)).toBe(false)
    viaUndoWrite()
    expect(hasRead('pw', n)).toBe(true)
    store.set(NOTICESEEN_PFX + 'pw', null)
    viaRollback()
    expect(hasRead('pw', n)).toBe(false)
  })
  it('the flying plan\'s cache is dropped', () => {
    const a = getFlyPlan()
    expect(getFlyPlan()).toBe(a)
    viaUndoWrite()
    const b = getFlyPlan()
    expect(b).not.toBe(a)
    viaRollback()
    expect(getFlyPlan()).not.toBe(b)
  })
})

describe('every command type the modules declare is still registered', () => {
  it('accounts, change history, bell, Leave War seen marks, approvals seen and the flying plan', () => {
    for (const t of [...accounts.ACCOUNT_TYPES, ...changes.CHANGES_TYPES, ...NOTICE_TYPES, ...LWSEEN_TYPES,
      ...APPRSEEN_TYPES, ...FLY_TYPES]) {
      expect(hasPermission(t), t).toBe(true)
    }
  })
})
