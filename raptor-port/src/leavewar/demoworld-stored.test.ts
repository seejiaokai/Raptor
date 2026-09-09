import { describe, it, expect, beforeEach } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { initStore as raptorInitStore } from '../state/store'
import { initStore as lwInitStore } from './state/store'
import { memoryBackend } from './state/storage'
import { installDemoWorld } from './state/demoworld'

const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  raptorInitStore()
  lwInitStore(memoryBackend())
})

describe('installDemoWorld and stored wars', () => {
  it('a fresh world (no stored wars) files the demo Raptor inputs', () => {
    const before = INPUTS.length
    installDemoWorld(false)
    expect(INPUTS.length).toBeGreaterThan(before)
  })
  it('a stored world (hadStoredWars) files NONE of them — persisted inputs must not be re-seeded', () => {
    const before = INPUTS.length
    installDemoWorld(true)
    expect(INPUTS.length).toBe(before)
  })
})
