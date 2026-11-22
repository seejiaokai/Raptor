// @vitest-environment jsdom
/* THE TRACKER AFTER A PICK (batch 1's second half, the plan docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md
   §16 D2′, §9 F2; his D2318 — the approved drawings docs/mock/2026-11-22-msq-b1-screens/img/f2a, f2b, f2c, words as
   drawn). The Tracker keeps the squadron it first loaded (tracker/storage.js — read here through the gate's probe,
   state/perms.ts setTrkUnitProbe, as boot.ts installs it). When his own pages (pageUnit('own')) are another squadron's:
   (a) he is still an admin of the Tracker's squadron by any road (home, Plan, master) — read only, "This is 149's
       Tracker. Pick 149 to change it. To open 142's, sign out and in.";
   (b) he is not — hidden, "You can't open 149's Tracker any more. Sign out and in to open 142's.";
   the member view — hidden, "This is 149's Tracker. Leave the member view to open it.";
   (c) the Tracker's squadron is his pages' — nothing.
   Read from the account, not the role in force (§16 D2′). A bell tap that enters another squadron reaches (a) as the menu
   does. His own move at midnight keeps the band drawn for it (state/typing-hold.test.tsx) and no cover.
   The page's cover itself (the veil, the hidden Tracker) is the browser's: e2e/msq-job2.spec.ts.
   Red first: before the change nothing told the Tracker page any of this (trackerCover did not exist). */
import { describe, it, expect, afterEach } from 'vitest'
import { act } from '@testing-library/react'
import { useMsqWorld, signInAs, ACCT, PID } from '../test-support/msq-world'
import { saveAccess, signIn, sessionFor } from './accounts'
import { setSession, SESSION } from './auth'
import { setGrant } from './units'
import { setTrkUnitProbe, pageUnit } from './perms'
import { notify, switchRoleView } from './store'
import { pickSquadron } from './pick'
import * as hold from './typing-hold'
import { UNIT } from '../engine/unitview'
import { openNotice } from '../ui/topstate'
import { setPage } from './view'
import { trackerUndoEngine } from '../ui/topstate'
import type { Notice } from './notices'

useMsqWorld()
afterEach(() => { setTrkUnitProbe(null) })

/* the Tracker loaded on `u`'s (its doorway's bound squadron, as the gate reads it) */
const trackerOn = (u: string) => setTrkUnitProbe(() => u)
const cover = () => (hold as any).trackerCover?.() ?? null
const words = () => { const c = cover(); return c ? `${c.kind}: ${c.lead} ${c.rest}` : null }
function give(acct: string, level: 'plan' | 'view'): void {
  signInAs('saber')
  expect(saveAccess(acct, { grants: { u149: level } }), `${level} of 149 given`).toBeNull()
}
/* a change made by the master admin on another device: this page's session and squadron untouched */
function fromAnotherDevice(f: () => unknown): void {
  const mine = SESSION
  setSession(sessionFor(signIn('ad', 'a')))
  f()
  setSession(mine)
}

describe('(c) the Tracker is his own pages\' squadron: nothing shown', () => {
  it('Saber on 142 with 142\'s Tracker', () => {
    signInAs('saber'); trackerOn('u142'); notify()
    expect(cover()).toBeNull()
  })
  it('Ranger (a member) with View of 149 picks 149: his own pages stay 142\'s, so 142\'s Tracker shows as ever', () => {
    give(ACCT.ranger, 'view')
    signInAs('ranger'); trackerOn('u142')
    act(() => { void pickSquadron('u149') })
    expect(UNIT).toBe('u149')
    expect(pageUnit('own')).toBe('u142')
    expect(cover()).toBeNull()
  })
})

describe('(a) still an admin of the Tracker\'s squadron: read only, with the road back', () => {
  it('Saber, the master admin, opened it on 149 and picked 142 (the drawing f2a)', () => {
    signInAs('saber')
    act(() => { void pickSquadron('u149') })
    trackerOn('u149'); act(() => { notify() })
    expect(cover(), 'on 149 with 149\'s Tracker: nothing').toBeNull()
    act(() => { void pickSquadron('u142') })
    expect(UNIT).toBe('u142')
    expect(words()).toBe("ro: This is 149's Tracker. Pick 149 to change it. To open 142's, sign out and in.")
    /* the road back: picking 149 again gives it back */
    act(() => { void pickSquadron('u149') })
    expect(cover()).toBeNull()
  })
  it('Hunter, 142\'s admin with Plan of 149, the same by his Plan', () => {
    give(ACCT.hunter, 'plan')
    signInAs('hunter')
    act(() => { void pickSquadron('u149') })
    trackerOn('u149'); act(() => { notify() })
    act(() => { void pickSquadron('u142') })
    expect(words()).toBe("ro: This is 149's Tracker. Pick 149 to change it. To open 142's, sign out and in.")
  })
  it('the Tracker\'s own Undo and Redo in the top bar offer nothing while it is covered', () => {
    signInAs('saber'); trackerOn('u149'); act(() => { notify() })
    expect(cover()).not.toBeNull()
    const e = trackerUndoEngine()
    expect([e.canUndo, e.canRedo]).toEqual([false, false])
  })
  it('a bell tap on a line of 149 reaches it too: Saber on 142 with 142\'s Tracker, 149 entered', () => {
    signInAs('saber'); trackerOn('u142'); setPage('viewsched'); act(() => { notify() })
    const n = { id: 'tl1', to: PID.saber, by: null, at: Date.now(), iid: '', name: '', day: '2026-07-15',
      what: [{ k: 'po', who: PID.osprey, o: 'none' }], u: 'u149' } as unknown as Notice
    act(() => { openNotice(n) })
    expect(UNIT).toBe('u149')
    expect(words()).toBe("ro: This is 142's Tracker. Pick 142 to change it. To open 149's, sign out and in.")
  })
})

describe('(b) no longer an admin of it: hidden', () => {
  it('Hunter\'s Plan of 149 lowered to View while the Tracker held 149\'s (the drawing f2b)', () => {
    give(ACCT.hunter, 'plan')
    signInAs('hunter')
    act(() => { void pickSquadron('u149') })
    trackerOn('u149'); act(() => { notify() })
    expect(cover()).toBeNull()
    fromAnotherDevice(() => expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter)).toMatchObject({ ok: true }))
    act(() => { notify() })
    expect(pageUnit('own')).toBe('u142')
    expect(words()).toBe("gone: You can't open 149's Tracker any more. Sign out and in to open 142's.")
  })
})

describe('the member view: hidden, its own line; leaving it gives the Tracker back', () => {
  it('Hunter with Plan of 149, his Tracker on 149, taps into the member view and back (the drawing f2c)', () => {
    give(ACCT.hunter, 'plan')
    signInAs('hunter')
    act(() => { void pickSquadron('u149') })
    trackerOn('u149'); act(() => { notify() })
    act(() => { switchRoleView(); notify() })
    expect(words()).toBe("member: This is 149's Tracker. Leave the member view to open it.")
    act(() => { switchRoleView(); notify() })
    expect(cover()).toBeNull()
  })
})
