// @vitest-environment jsdom
/* B2, ITS SHARED-STORE HALF (Fable 2a, shape 2) — REWRITTEN TO HIS D2239 (20 Nov 26): the guest view is removed, so on a
   shared store whose only squadron is 149 there is no switch either. The full review's proof
   (docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/b-b02b-guest-switch-shared-store.test.ts.txt) showed 149's
   switch doing nothing there — a person waiting has no home, so his session sat on the boot unit 'u142', a squadron that
   does not exist. Now: the store's first admin has no door to a switch, and the person waiting signs in `waiting`
   whatever an older build stored, under 149's name or the plain one (D56: left where it lies, read by nothing).
   Harness as the proof's (the app's real boot, boot.test.ts). Red on the reshape branch before the removal
   (c0a856d83), green after. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as accounts from './accounts'
import { signIn, sessionFor, requestAccess } from './accounts'
import { resetSession, notify } from './store'
import { setSession } from './auth'
import { units } from './units'
import { MemoryBackend } from '../storage/memory'
import { bootApp } from '../boot'
import type { BootPolicy } from '../bootpolicy'

const POLICY: BootPolicy = { seedDemo: false, bootstrap: { principal: 'boss@unit.example', person: { cs: 'Boss', ini: 'BS', seat: 'FCP', cat: 'A' }, unit: { num: '149' } } as any }
async function boot(be: MemoryBackend) {
  const p = bootApp(be, POLICY)
  const settled = p.then(() => null, (e: unknown) => e)
  await vi.advanceTimersByTimeAsync(be.latency + 1)
  const err = await settled
  if (err) throw err
}
const signInAs = (name: string, pass: string) => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }
const signOut = () => { setSession(null); resetSession(null); notify() }

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { signOut(); vi.useRealTimers() })

describe('B2 (shared store, first squadron 149) — no guest switch exists (D2239)', () => {
  it('the admin has no switch to turn on; the person waiting signs in waiting, whatever an older build stored', async () => {
    const be = new MemoryBackend()
    /* the switch as older builds would have left it, under every name it was stored by: the plain one, the boot unit's
       (where a person waiting's session sat) and 149's */
    be.seed({ settings: { guestview: 'true', 'u142@guestview': 'true', 'u149@guestview': 'true' } })
    await boot(be)
    expect(units().map(u => u.num), '(control) the store\'s only squadron is 149').toEqual(['149'])
    expect(signInAs('new@unit.example', 'p').kind).toBe('new')
    expect(requestAccess({ cs: 'Newbie', ini: 'NB', seat: 'FCP', cat: 'C' })).toBeNull()
    signOut()
    expect(signInAs('boss@unit.example', 'p').kind, '(control) the store\'s first admin signs in').toBe('ok')
    expect((accounts as any).setGuestView, 'no door sets a guest switch').toBeUndefined()
    expect((accounts as any).GUESTVIEW, 'and none is held').toBeUndefined()
    signOut()
    expect(signIn('new@unit.example', 'p').kind, 'whatever was stored').toBe('waiting')
  })
})
