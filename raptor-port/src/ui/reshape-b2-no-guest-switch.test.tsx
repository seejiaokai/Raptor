// @vitest-environment jsdom
/* B2 (Fable 2, Opus B1) — REWRITTEN TO HIS D2239 (20 Nov 26): the guest view is removed, so no squadron's switch exists.
   The full review's proof (docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/b-b02-guest-switch-149.test.ts.txt)
   showed 149's admin turning on a guest switch that let nobody in, while 142's let a person waiting in. His ruling takes
   the switch away for every squadron instead (the reshape plan §8, B2's change of 20 Nov 26), so the proof now holds:
   - Admin → Users draws no "Guest view" switch — for 149's only admin (Kestrel) and for 142's (Hunter);
   - the accounts module has no door that sets one, and holds none;
   - a person waiting signs in `waiting`, whatever an older build stored under any squadron's name (D56: a stored value
     is left where it lies, read by nothing).
   Only the harness changed from the proof's (test-support/msq-world.ts, the one world). Red on the reshape branch before
   the removal (c0a856d83), green after. */
import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'
import { useMsqWorld, signInAs, signOut, mem } from '../test-support/msq-world'
import * as accounts from '../state/accounts'
import { accountsLoad, requestAccess, signIn } from '../state/accounts'
import { UsersPanel } from './UsersPanel'

useMsqWorld()
afterEach(() => { cleanup() })

function newbieAsks() {
  expect(signInAs('newbie@x', 'p').kind).toBe('new')
  expect(requestAccess({ cs: 'Newbie', ini: 'NB', seat: 'FCP', cat: 'C' })).toBeNull()
  signOut()
}
/* the switch as older builds stored it, under every name it was ever stored by — the plain name (before the squadrons'
   settings were named by squadron), 142's and 149's — then read back as a reload would */
function oldSwitchStored() {
  for (const k of ['guestview', 'u142@guestview', 'u149@guestview']) mem['sqn142_' + k] = 'true'
  accountsLoad()
}
async function adminUsers(): Promise<HTMLElement> {
  const { container } = render(<UsersPanel shown />)
  await act(async () => { await Promise.resolve() })
  return container
}

describe("B2 — no squadron's guest switch exists (D2239)", () => {
  it("Kestrel (149's only admin): no switch on Admin → Users, no door to one, and the person waiting stays waiting", async () => {
    newbieAsks()
    signInAs('kestrel')
    const panel = await adminUsers()
    expect(panel.querySelector('#accAddBlock'), '(control) his Admin → Users is drawn').toBeTruthy()
    expect(panel.querySelector('#admGuestView'), 'no Guest view switch').toBeNull()
    expect(panel.textContent, 'nothing names it').not.toContain('Guest view')
    expect((accounts as any).setGuestView, 'no door sets a guest switch').toBeUndefined()
    expect((accounts as any).GUESTVIEW, 'and none is held').toBeUndefined()
    cleanup(); signOut()
    oldSwitchStored()
    expect(signIn('newbie@x', 'p').kind, 'whatever was stored').toBe('waiting')
  })
  it("Hunter (142's admin): the same — no switch, and the person waiting stays waiting", async () => {
    newbieAsks()
    signInAs('hunter')
    const panel = await adminUsers()
    expect(panel.querySelector('#accAddBlock'), '(control) his Admin → Users is drawn').toBeTruthy()
    expect(panel.querySelector('#admGuestView'), 'no Guest view switch').toBeNull()
    expect(panel.textContent).not.toContain('Guest view')
    cleanup(); signOut()
    oldSwitchStored()
    expect(signIn('newbie@x', 'p').kind).toBe('waiting')
  })
  it('(control) with nothing stored, a person waiting signs in waiting, and one on no list is new', () => {
    newbieAsks()
    expect(signIn('newbie@x', 'p').kind).toBe('waiting')
    expect(signIn('stranger@x', 'p').kind).toBe('new')
  })
})
