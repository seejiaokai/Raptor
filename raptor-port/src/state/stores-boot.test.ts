import { describe, it, expect, beforeEach } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { STORE_CFG, storesReset } from '../engine/stores'
import { initStore } from './store'

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
    expect(STORE_CFG.map(([k]) => k)).toEqual(['nav', 'nc', 'tk2', 'tks3', 'tpod', 'cl'])
  })
})
