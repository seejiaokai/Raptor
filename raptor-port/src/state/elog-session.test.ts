/* THE CHANGE HISTORY OUTLIVES A SIGN-OUT AND A RELOAD, AND A REFUSED COMMAND LEAVES NO LINE
   ([DRAFT-PENDING], 28 Sep 26 — D336 (b): built on yes, on his look card).

   Until today every sign-in and sign-out wiped the log (resetSession → elogClear), and a reload lost it (it lived only
   in memory). The one changes window is the squadron's record of who changed what — members read it too (D169) — so
   it must still be there when the next person signs in, and after a reload. What is NEW is per person (the seen
   record); the history itself is shared. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { ELOG, elogClear, elogFlush, elogLoad, logAction } from '../engine/editlog'
import { initStore, resetSession } from './store'
import { signIn, sessionFor } from './accounts'
import { commit } from '../command'

const fake = new Map<string, string>()
beforeAll(() => {
  storeBackend.impl = { getItem: k => (fake.has(k) ? fake.get(k)! : null), setItem: (k, v) => { fake.set(k, v) } }
  initStore()
})
afterAll(() => { storeBackend.impl = null })
beforeEach(() => { elogClear(); elogFlush() })

describe('the history is kept', () => {
  it('a sign-out and the next sign-in keep every line', () => {
    resetSession(sessionFor(signIn('ad', 'a') as any))
    logAction(0, 'Note added')
    resetSession(null)                                  // sign out
    expect(ELOG.rows.map(r => r.lbl)).toEqual(['Note added'])
    resetSession(sessionFor(signIn('us', 'us') as any)) // the next person signs in
    expect(ELOG.rows.map(r => r.lbl)).toEqual(['Note added'])
  })

  it('a reload brings it back — it is saved, and loaded at start-up', () => {
    resetSession(sessionFor(signIn('ad', 'a') as any))
    logAction(1, 'Wave added')
    elogFlush()
    elogClear()                                         // the page goes away
    elogLoad()                                          // …and comes back
    expect(ELOG.rows.map(r => r.lbl)).toEqual(['Wave added'])
    expect(ELOG.rows[0]!.who).toBe('Saber')
  })
})

describe('a refused command leaves no line', () => {
  it('a line written inside a command that is then refused is not kept', () => {
    resetSession(sessionFor(signIn('ad', 'a') as any))
    const r = commit({ type: 'sched.mutate', scope: { module: 'sched' }, apply: () => {
      logAction(0, 'Line removed')
      throw new Error('refused')
    } } as any)
    expect((r as any).ok).toBe(false)
    expect(ELOG.rows.length).toBe(0)
  })
})
