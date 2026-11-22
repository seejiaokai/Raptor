// @vitest-environment jsdom
/* A2 (Fable F2) — the proof `a-a02-signed-in-across-move` (docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/), copied
   word for word, only its harness changed to the one test world (test-support/msq-world.ts) and its clock driven past
   midnight by the app's own wake (`pastMidnight()`), never by calling notify() itself (Fable F8; the reshape plan §3.4).
   A man still signed in across his move day was left on his old squadron's Leave War (and Tracker). Correct per D2132 /
   D2087: the Leave War and the Tracker stay on HIS OWN (primary) squadron — on 16 Jul that is 149.
   The midnight swap is switched on in phase 3 (state/store.ts — the trigger's default; the plan §3.2 A-iv, §10), so
   nothing here switches it on by hand.
   THE TRACKER'S CASE STAYS OPEN, NAMED (the plan §14 item 3): the Tracker cannot be re-read in place once it has loaded —
   its records sit in module caches of tracker/app/core.js beyond its React tree (phase 2's read of its load path,
   tracker/storage.js rebindStorageUnit) — so it moves at his next sign-in, the war and the schedule moving at midnight.
   Its case is kept word for word as `it.fails`: it runs, and turns red the day the Tracker does move in place, so the
   proof is brought back then. What the Tracker does at midnight instead is pinned in state/typing-hold.test.ts. */
import { describe, expect, it } from 'vitest'
import { getState, worldUnit } from '../leavewar/state/store'
import { setHome } from './units'
import { myUnit } from './perms'
import { todayIso } from './units'
// @ts-ignore — a .js module
import { setStorageMaker, markStorageLoaded, storageUnit, setStorageImpl } from '../tracker/storage.js'
import { useMsqWorld, signInAs, pastMidnight } from '../test-support/msq-world'
import { afterEach } from 'vitest'

useMsqWorld()
afterEach(() => { setStorageMaker(null, null); setStorageImpl(null) })

const saber = () => signInAs('saber')

describe('A2 — the war follows his squadron at midnight of his move', () => {
  it('Ranger signed in on 15 Jul, moved to 149 from 16 Jul; at 00:05 on 16 Jul his war is 149’s and holds his row', () => {
    saber()
    expect(setHome('bane', 'u149').ok).toBe(true)
    signInAs('ranger')
    expect(worldUnit()).toBe('u142')
    pastMidnight()
    expect(myUnit(todayIso()), 'sanity: his squadron today is 149').toBe('u149')
    expect(worldUnit(), 'his own squadron’s Leave War').toBe('u149')
    expect(getState().people.some(p => p.id === 'bane'), 'his own row on the war he is looking at').toBe(true)
  })
  it('(control) signing in again on 16 Jul loads 149’s war', () => {
    saber()
    expect(setHome('bane', 'u149').ok).toBe(true)
    pastMidnight()
    signInAs('ranger')
    expect(worldUnit()).toBe('u149')
  })
  /* OPEN (the plan §14 item 3): the Tracker keeps 142's records until he signs in again — `it.fails` runs the proof's
     assertion as it stands and stays green only while it fails */
  it.fails('the Tracker too: loaded as Ranger on 15 Jul (142), it is 149’s at 00:05 on 16 Jul', () => {
    const mk = () => { const m = new Map(); return { get: (k: string) => m.get(k) ?? null, set: (k: string, v: string) => { m.set(k, v) }, remove: (k: string) => { m.delete(k) }, keys: () => [...m.keys()] } }
    setStorageMaker((_u: string) => mk(), () => myUnit(todayIso()))
    saber()
    expect(setHome('bane', 'u149').ok).toBe(true)
    signInAs('ranger')
    markStorageLoaded()
    expect(storageUnit()).toBe('u142')
    pastMidnight()
    expect(storageUnit(), 'his own squadron’s Tracker').toBe('u149')
  })
})
