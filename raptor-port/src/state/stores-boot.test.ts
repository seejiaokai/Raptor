import { describe, it, expect, beforeEach } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { STORE_CFG, storesReset } from '../engine/stores'
import { initStore } from './store'
import { signIn, ACCESS_REQS, GUESTVIEW } from './accounts'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const mem: Record<string, string> = {}
beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = {
    getItem: (k: string) => (k in mem ? mem[k]! : null),
    setItem: (k: string, v: string) => { mem[k] = v },
  }
  storesReset()
})

describe('boot', () => {
  it('initStore picks up a stored stores list', () => {
    mem['sqn142_stores'] = JSON.stringify([['tpod', 'TPOD'], ['nav', 'NAV']])
    initStore()
    expect(STORE_CFG).toEqual([['tpod', 'TPOD'], ['nav', 'NAV']])
  })
  it('initStore leaves the standard six when nothing is stored', () => {
    initStore()
    expect(STORE_CFG.map(([k]) => k)).toEqual(['tpod', 'tk2', 'nav', 'nc', 'tks3', 'cl'])
  })
})

/* [ACCOUNTS] (26 Sep 26) — found by the walk: the accounts, the access requests and the
   guest switch were saved but never loaded at boot (the loader ran only inside a settings
   rollback), so every account the admin added was gone after a reload. The accounts
   tests called the loader by hand after initStore, which is why none of them saw it.
   Register line AC7. */
describe('boot — the accounts come back after a reload', () => {
  it('initStore alone loads a stored account, a waiting request and the guest switch', () => {
    mem['sqn142_accounts'] = JSON.stringify([
      { id: 'acad', name: 'ad', role: 'admin', pid: 'stiff', on: true },
      { id: 'acw', name: 'wren@mail', role: 'main', pid: 'dj', on: true },
    ])
    mem['sqn142_accessreqs'] = JSON.stringify([{ id: 'rq1', name: 'kite@mail', cs: 'Kite', full: 'K', at: 1 }])
    mem['sqn142_guestview'] = JSON.stringify(true)
    initStore()
    expect(signIn('wren@mail', 'x')).toMatchObject({ kind: 'ok', account: { id: 'acw', pid: 'dj' } })
    expect(ACCESS_REQS.map(r => r.name)).toEqual(['kite@mail'])
    expect(GUESTVIEW).toBe(true)
    expect(signIn('kite@mail', 'x')).toMatchObject({ kind: 'guest' })
  })
  it('every settings loader the rollback runs is also run at boot (the drift that hid it)', () => {
    const psc = readFileSync(join(__dirname, 'people-settings-commit.ts'), 'utf8')
    const list = psc.match(/const SETTINGS_LOADERS[^\n]*= \[([^\]]+)\]/)
    expect(list, 'the rollback loader list').toBeTruthy()
    const loaders = list![1].split(',').map(x => x.trim()).filter(Boolean)
    expect(loaders.length).toBeGreaterThan(8)
    const src = readFileSync(join(__dirname, 'store.ts'), 'utf8')
    const boot = src.slice(src.indexOf('export function initStore'))
    for (const l of loaders) expect(boot, `${l}() at boot`).toMatch(new RegExp('\\b' + l + '\\(\\)'))
  })
})
