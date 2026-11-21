// @vitest-environment jsdom
/* THE MIDNIGHT SWAP, SWITCHED ON (the reshape plan docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §3.2 A-iv, §3.4's
   enterSquadron rows, A-v's tests "across the midnight swap"; §10: helper "session" in phase 3, once helper "undo & roles"
   has merged A-v). state/msq-undo-worlds.test.ts made the same move BY HAND (the schedule picked and the war loaded for the
   new squadron) while the trigger was off; here nothing is done by hand: the clock passes his move day's midnight through
   the app's own wake (test-support/msq-world.ts pastMidnight — never notify() itself, Fable F8) and the page enters his new
   squadron by itself. His history is kept, not cleared (D148): his steps in the old squadron wait there, by their stamp. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT, on, moveMan, pastMidnight } from '../test-support/msq-world'
import { homeAtEntry } from './store'
import { setSession, setMe } from './auth'
import { signIn, sessionFor, updateAccount } from './accounts'
import { setGrant, homeOn } from './units'
import { lwUnitNow } from './perms'
import { getState, setShowSans, setCell, setRole } from '../leavewar/state/store'
import { worldUnit } from '../leavewar/state/store'
import { globalUndo, _timelineEntries } from '../undo/timeline'
import { commitNewInput, commitInputEdit, draftOf } from '../ui/inputedit'
import { INPUTS } from '../engine/inputs'
import { rosterToday } from '../engine/roster'
import { UNIT } from '../engine/unitview'

useMsqWorld()

const lastEntry = () => { const es = _timelineEntries(); return es[es.length - 1]! }
const leave = (person: string, start: string, end: string) => commitNewInput({ person, type: 'LL', allday: true, half: '', start, end, sTime: '', eTime: '', remarks: '', sans: null, docIds: [] })
const inputOf = (iid: string): any => INPUTS.find((r: any) => r.iid === iid)
const inputIdOf = (e: { forward: { collection: string; id: string }[] }) => e.forward.find(c => c.collection === 'inputs')!.id

describe('enterSquadron at his own midnight — fired by the clock alone', () => {
  it('nothing switched on by the test: past his move day’s midnight the schedule and the war are 149’s, his home at entry with them', () => {
    signInAs('saber'); moveMan(PID.ranger, 'u149')
    signInAs('ranger')
    expect([UNIT, worldUnit(), homeAtEntry()]).toEqual(['u142', 'u142', 'u142'])
    pastMidnight()
    expect([UNIT, worldUnit(), homeAtEntry()]).toEqual(['u149', 'u149', 'u149'])
  })
  it('the swap’s own passes (the war’s OIL, absence and posting passes on its load) are no step of his Undo list (Opus L2)', () => {
    signInAs('saber'); moveMan(PID.ranger, 'u149')
    signInAs('ranger')
    on(15, 23, 50)
    expect(leave(PID.ranger, '2026-08-20', '2026-08-21')).toBe(true)
    const mine = lastEntry()
    const n = _timelineEntries().length
    pastMidnight()
    expect(worldUnit()).toBe('u149')
    expect(_timelineEntries().length, 'the swap added no step to the timeline').toBe(n)
    expect(lastEntry().seq, 'his last step is still his own filing').toBe(mine.seq)
  })
})

describe('A-v across the midnight swap — his Undo after the clock moved him', () => {
  it('his 142 war step after his move to 149: passed over, blocking nothing in 149', () => {
    moveMan(PID.hunter, 'u149')
    signInAs('hunter')
    on(15, 23, 0)
    const s142 = getState().showSans
    expect(setShowSans(!s142)).toBe(true)                                            // his 142 war step
    pastMidnight()
    expect(homeOn(PID.hunter, rosterToday())).toBe('u149')
    expect(lwUnitNow(), '149’s war loaded by the swap').toBe('u149')
    /* (setup — helper "kinds", K3, his D2160: he joins 149 as a member; the master admin, on another sign-in, makes him an
       admin of 149, which the scenario needs — his Undo list is left as it stands) */
    setSession(sessionFor(signIn('ad', 'a'))); setMe(PID.saber)
    expect(updateAccount(ACCT.hunter, { role: 'admin' })).toBeNull()
    setSession(sessionFor(signIn('ad2', 'a2'))); setMe(PID.hunter); setRole('admin')
    const s149 = getState().showSans
    expect(setShowSans(!s149)).toBe(true)                                            // his 149 war step
    const u1 = globalUndo()
    expect(u1.ok, JSON.stringify(u1.reason)).toBe(true)
    expect(getState().showSans).toBe(s149)
    const u2 = globalUndo()
    expect(u2.ok, '142’s step waits in 142 — never written into 149’s war').toBe(false)
    expect(getState().showSans).toBe(s149)
  })

  it('his own leave filed at 23:50 is undone after midnight (an input is no squadron’s world)', () => {
    moveMan(PID.ranger, 'u149')
    signInAs('ranger')
    on(15, 23, 50)
    expect(leave(PID.ranger, '2026-08-20', '2026-08-21')).toBe(true)
    const iid = inputIdOf(lastEntry())
    pastMidnight()
    expect(worldUnit()).toBe('u149')
    const u = globalUndo()
    expect(u.ok, JSON.stringify(u.reason)).toBe(true)
    expect(inputOf(iid)).toBeUndefined()
  })

  /* Fable 4 of round 3: a war door writes an input and a war record in one step — his edit of a leave that now runs over
     Ranger's bid in 142's war — and the input keeps an unstamped key. His filing (23:30) and that edit (23:50); his move to
     149 counts at midnight. */
  function fable4(): { own: string; iid: string } {
    moveMan(PID.hunter, 'u149')
    signInAs('hunter')
    on(15, 22, 0)
    expect(leave(PID.hunter, '2026-08-03', '2026-08-03')).toBe(true)                // an older step of his own
    const own = inputIdOf(lastEntry())
    on(15, 22, 10)
    expect(setCell(PID.ranger, '2026-08-12', 'LL')).toBe(true)                       // Ranger's bid, in 142's war
    on(15, 23, 30)
    expect(leave(PID.ranger, '2026-08-10', '2026-08-11')).toBe(true)                // the filing
    const iid = inputIdOf(lastEntry())
    on(15, 23, 50)
    const r = inputOf(iid)
    expect(commitInputEdit(r, { ...draftOf(r), end: '2026-08-12' })).toBe(true)    // the edit: over the bid
    expect(lastEntry().stamp).toEqual({ lw: 'u142' })
    return { own, iid }
  }

  it('Fable 4: in 149 the filing’s Undo is blocked for good, said once, and the next press takes the step before it', () => {
    const { own, iid } = fable4()
    pastMidnight()
    expect([UNIT, worldUnit()], 'the clock moved him').toEqual(['u149', 'u149'])
    const u1 = globalUndo()
    expect(u1.ok).toBe(false)
    expect(u1.reason).toMatch(/^A later change touches the same thing and can’t be undone\. Press Undo again for: /)
    expect(inputOf(iid)?.endDate, 'the leave as he left it').toBe('Aug 12')
    const u2 = globalUndo()
    expect(u2.ok, JSON.stringify(u2.reason)).toBe(true)
    expect(inputOf(own), 'the step before it: his own leave undone').toBeUndefined()
    expect(inputOf(iid)?.endDate).toBe('Aug 12')
  })

  it('Fable 4 for an admin with Plan of 142 after his move: "undo that first"', () => {
    const { iid } = fable4()
    pastMidnight()
    /* the master admin gives him Plan of 142 — on another sign-in, which leaves his Undo list as it stands */
    setSession(sessionFor(signIn('ad', 'a'))); setMe(PID.saber)
    /* (setup — helper "kinds", K3, his D2160: he joined 149 as a member, and only an admin holds Plan — made an admin of
       149 first; his session is then his account's as it stands) */
    expect(updateAccount(ACCT.hunter, { role: 'admin' })).toBeNull()
    expect(setGrant(ACCT.hunter, 'u142', 'admin', PID.hunter)).toMatchObject({ ok: true })
    setSession(sessionFor(signIn('ad2', 'a2'))); setMe(PID.hunter); setRole('admin')
    const u = globalUndo()
    expect({ ok: u.ok, reason: u.reason }).toEqual({ ok: false, reason: 'A later change touches the same thing — undo that first.' })
    expect(inputOf(iid)?.endDate).toBe('Aug 12')
  })
})
