// @vitest-environment jsdom
/* SIGN-OUT RELOADS THE PAGE (multi-squadron batch 1, step 2 — ui/logout.ts). With two units the memory holds more than
   one squadron's world, so sign-out ends the session, sends every queued save, and only then reloads; while a save is
   still waiting it does not reload (on an iPhone a reload would lose it unasked). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { logOut, setReloadSeam } from './logout'
import { watchSaves } from '../storage/savewait'
import { resetSession } from '../state/store'
import * as auth from '../state/auth'
import { UNIT, BOOT_UNIT } from '../engine/unitview'

let calls: string[] = []
let prev: (() => void) | null = null
beforeEach(() => {
  calls = []
  prev = setReloadSeam(() => { calls.push(`reload (signed in: ${auth.SESSION ? 'yes' : 'no'})`) })
  resetSession({ user: 'ad', role: 'admin' })
})
afterEach(() => { if (prev) setReloadSeam(prev); watchSaves(null); resetSession(null) })

describe('sign-out', () => {
  it('ends the session, sends the queued saves, then reloads the page — in that order', async () => {
    let status: 'saved' | 'unsaved' = 'unsaved'
    watchSaves({ get status() { return status }, flush: async () => { calls.push('flush'); status = 'saved' } } as any)
    expect(await logOut()).toBe(true)
    expect(calls).toEqual(['flush', 'reload (signed in: no)'])
    expect(UNIT, 'the unit in view is back at the boot unit').toBe(BOOT_UNIT)
  })

  it('with no postman (a test, or the dev server) it still reloads', async () => {
    watchSaves(null)
    expect(await logOut()).toBe(true)
    expect(calls).toEqual(['reload (signed in: no)'])
  })

  it('does NOT reload while a save is still waiting — the session is ended and the save band keeps its Retry', async () => {
    watchSaves({ status: 'failed', flush: async () => { calls.push('flush'); throw new Error('refused') } } as any)
    expect(await logOut()).toBe(true)
    expect(calls).toEqual(['flush'])
    expect(auth.SESSION).toBeNull()
  })
})
