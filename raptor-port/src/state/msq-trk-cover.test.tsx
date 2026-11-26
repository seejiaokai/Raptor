// @vitest-environment jsdom
/* THE TRACKER'S COVER AFTER HIS D2395 (23 Nov 26): the Tracker follows the squadron picked, so D2318's two bands — "This is
   142's Tracker. Pick 142 to change it. To open 149's, sign out and in." and "You can't open 149's Tracker any more. Sign
   out and in to open 142's." — are gone (these tests pinned them until then; the move itself: tracker/msq-trk-follows-pick
   .test.tsx). The Tracker's squadron is read here through the gate's probe, state/perms.ts setTrkUnitProbe, as boot.ts
   installs it. What is left is the member view while the door is HELD for his unsaved chart edits: hidden, "This is 149's
   Tracker. Leave the member view to open it." — read from the account, not the role in force. His own move at midnight
   keeps the band drawn for it (state/typing-hold.test.tsx) and no cover. */
import { describe, it, expect, afterEach } from 'vitest'
import { act } from '@testing-library/react'
import { useMsqWorld, signInAs, ACCT, PID } from '../test-support/msq-world'
import { saveAccess, signIn, sessionFor } from './accounts'
import { setSession, SESSION } from './auth'
import { setGrant } from './units'
import { setTrkUnitProbe, pageUnit } from './perms'
import { notify, switchRoleView, switchRoleViewRaw } from './store'
import { pickSquadron } from './pick'
import * as hold from './typing-hold'
import { setStorageHeld } from '../tracker/storage.js'
import { UNIT } from '../engine/unitview'
import { openNotice } from '../ui/topstate'
import { setPage } from './view'
import { trackerUndoEngine } from '../ui/topstate'
import type { Notice } from './notices'

useMsqWorld()
afterEach(() => { setTrkUnitProbe(null); setStorageHeld(false) })

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

describe('(a) the band of a pick is gone (D2395): he is still an admin of the Tracker\'s squadron, and nothing covers it', () => {
  it('Saber, the master admin, opened it on 149 and picked 142 (the drawing f2a)', () => {
    signInAs('saber')
    act(() => { void pickSquadron('u149') })
    trackerOn('u149'); act(() => { notify() })
    expect(cover(), 'on 149 with 149\'s Tracker: nothing').toBeNull()
    act(() => { void pickSquadron('u142') })
    expect(UNIT).toBe('u142')
    expect(words(), 'no band').toBeNull()
    act(() => { void pickSquadron('u149') })
    expect(cover()).toBeNull()
  })
  it('Hunter, 142\'s admin with Plan of 149, the same by his Plan', () => {
    give(ACCT.hunter, 'plan')
    signInAs('hunter')
    act(() => { void pickSquadron('u149') })
    trackerOn('u149'); act(() => { notify() })
    act(() => { void pickSquadron('u142') })
    expect(words(), 'no band').toBeNull()
  })
  /* (step K5: the held edits are faked through the probe, and the switch now asks about real ones first — D2627 A20 — so
     this state is reached by no press; made by the raw switch, switchRoleViewRaw, the switch as it was, named so) */
  it('the Tracker\'s own Undo and Redo in the top bar offer nothing while it is covered (the member view over held edits) — reached by no press since D2627 A20, by the raw switch', () => {
    give(ACCT.hunter, 'plan')
    signInAs('hunter')
    act(() => { void pickSquadron('u149') })
    trackerOn('u149'); setStorageHeld(true)
    act(() => { switchRoleViewRaw(); notify() })
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
    expect(words(), 'no band').toBeNull()
  })
})

describe('(b) no longer an admin of it: no band either (D2395) — the Tracker goes to his own squadron', () => {
  it('Hunter\'s Plan of 149 lowered to View while the Tracker held 149\'s', () => {
    give(ACCT.hunter, 'plan')
    signInAs('hunter')
    act(() => { void pickSquadron('u149') })
    trackerOn('u149'); act(() => { notify() })
    expect(cover()).toBeNull()
    fromAnotherDevice(() => expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter)).toMatchObject({ ok: true }))
    act(() => { notify() })
    expect(pageUnit('own')).toBe('u142')
    expect(words(), 'no band').toBeNull()
  })
})

describe('the member view over held chart edits: hidden, its own line; leaving it gives the Tracker back', () => {
  it('with nothing held there is nothing to cover', () => {
    give(ACCT.hunter, 'plan')
    signInAs('hunter')
    act(() => { void pickSquadron('u149') })
    trackerOn('u149'); act(() => { notify() })
    act(() => { switchRoleView(); notify() })
    expect(cover()).toBeNull()
  })
  /* (step K5: as above — the held edits faked through the probe, a state no press reaches since D2627 A20; the raw switch) */
  it('Hunter with Plan of 149, his Tracker held on 149 for unsaved edits, taps into the member view and back (the drawing f2c) — reached by no press since D2627 A20, by the raw switch', () => {
    give(ACCT.hunter, 'plan')
    signInAs('hunter')
    act(() => { void pickSquadron('u149') })
    trackerOn('u149'); setStorageHeld(true); act(() => { notify() })
    act(() => { switchRoleViewRaw(); notify() })
    expect(words()).toBe("member: This is 149's Tracker. Leave the member view to open it.")
    act(() => { switchRoleViewRaw(); notify() })
    expect(cover()).toBeNull()
  })
})
