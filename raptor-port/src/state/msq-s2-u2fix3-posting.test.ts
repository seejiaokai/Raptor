// @vitest-environment jsdom
/* U2 FIX ROUND 3 — A POSTING'S TAKE-BACK IS NOT REFUSED AS MAKING AN ADMIN (his D2903, 28 Nov 26; the addendum
   docs/superpowers/briefs/2026-11-28-msq-s2-u2fix3-addendum.md, which wins over the round's brief).

   Three readers of round 2 proved its fix 2 asked too much: it refused a Plan holder, in D2806's sentence, a take-back
   that makes no admin —
   (a) Osprey, 149's admin, his sign-in switched off BY HAND, then posted overseas: the take-back lifts the posting's
       archive only ("he's back" enables only the suspension the posting made, `offBy: 'po'` — accounts.ts
       enableAfterPosting), so he comes back suspended. (Opus 1, Astra 3, Fable 3a.)
   (b) the posting changed from Overseas Sqn to Delete, due today: the Delete runs in the same command and the man is
       gone — nobody is brought back. (Fable 3b.)
   The brief's fixes 3 and 4 narrowed that question; his ruling then removed it whole — bringing an admin back is not
   making one — so every one of these take-backs simply goes through, and nothing is asked.

   The readers' proofs, kept as tests (opus/zz-opus-proof-1, astra/zz-astra-proof-3, fable/zz-fable-proof-3). One change
   from their text, forced by the ruling: each read the door they were proving wrong, leavewar/sync.ts
   postOutChangeProblem, which the addendum removes — where a proof read it, this file reads the door the sheet still
   asks before a posting is saved (postOutProblem), and expects the same answer the proof did: nothing. Fable's proof 5
   (a master admin's posting taken back saying the master admin sentence — its finding 4, words only) is NOT built and is
   left out; the door still says nothing there and the sheet shows "That did not save"
   (ui/msq-s2-u2fix2-postsheet.test.tsx). */
import { describe, it, expect } from 'vitest'
import { withThird, signInAs, on, PID, ACCT } from '../test-support/msq-world'
import { saveAccess, updateAccount, accountById, accountOfPid, accountsLoad, adminLineAudience } from './accounts'
import { unitsLoad, todayIso } from './units'
import { enterSquadron } from './store'
import { postOut, postOutProblem, undoPostOut, undoPostOutProblem } from '../leavewar/sync'
import { PEOPLE } from '../engine/people'

withThird()
const reload = (): void => { unitsLoad(); accountsLoad() }
const MAKE = (n: string) => `Only ${n}'s own admins or a master admin can make an admin of ${n}.`
const state = () => ({ archived: !!(PEOPLE as any)[PID.osprey]?.archived, on: accountById(ACCT.osprey)?.on ?? null })
const addDays = (iso: string, n: number): string => {
  const [y, m, d] = iso.split('-').map(Number)
  const t = new Date(y!, m! - 1, d! + n)
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}

/* Kestrel makes Osprey an admin of 149, optionally switches his sign-in off by hand, then posts him overseas from today */
function ospreyPostedOverseas(handOff: boolean): void {
  signInAs('kestrel')
  expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Kestrel makes Osprey an admin of 149').toBeNull()
  if (handOff) expect(updateAccount(ACCT.osprey, { on: false }), 'setup: Kestrel switches Osprey\'s sign-in off by hand').toBeNull()
  reload()
  enterSquadron('u149'); reload()
  on(15, 10)
  expect(postOut(PID.osprey, todayIso(), 'overseas'), 'setup: Kestrel posts Osprey overseas from today, it runs at once').toBe(true)
  reload()
  expect(state(), 'setup: the posting archived him; his sign-in is off').toEqual({ archived: true, on: false })
}
const asHunter = (): void => { on(15, 11); signInAs('hunter'); enterSquadron('u149'); reload() }

describe('fable 3a — Undo post out of an admin whose sign-in was switched off by hand brings no admin back', () => {
  it('premise: taken back by Kestrel, he comes back SUSPENDED — no admin in force of 149 is made', () => {
    ospreyPostedOverseas(true)
    expect(accountById(ACCT.osprey)!.offBy, 'premise: the suspension is a hand one, not the posting\'s').toBeUndefined()
    on(15, 11); signInAs('kestrel'); reload()
    expect(undoPostOut(PID.osprey)).toBe(true)
    reload()
    expect(state()).toEqual({ archived: false, on: false })
    expect(adminLineAudience('u149'), 'he is no admin in force').not.toContain(PID.osprey)
  })
  it('Hunter (Plan of 149) presses "Undo post out": it goes through, with no make-an-admin sentence (no admin is made)', () => {
    ospreyPostedOverseas(true)
    asHunter()
    const why = undoPostOutProblem(PID.osprey)
    const done = undoPostOut(PID.osprey)
    reload()
    expect({ why, done, ...state() }).toEqual({ why: null, done: true, archived: false, on: false })
  })
  it('Hunter moves that posting to a later date: it goes through, with no make-an-admin sentence', () => {
    ospreyPostedOverseas(true)
    asHunter()
    const why = postOutProblem(PID.osprey, 'overseas')
    const done = postOut(PID.osprey, '2026-07-25', 'overseas')
    reload()
    expect({ why, done, ...state() }).toEqual({ why: null, done: true, archived: false, on: false })
  })
  it('the sentence Hunter read named an act that does not happen: the door no longer says it', () => {
    ospreyPostedOverseas(true)
    asHunter()
    expect(undoPostOutProblem(PID.osprey)).not.toBe(MAKE('149'))
  })
})

describe('fable 3b — an Overseas Sqn posting that has run, changed to Delete from today, brings nobody back', () => {
  it('premise: changed by Kestrel, the Delete runs in the same command — Osprey is gone, never an admin in force again', () => {
    ospreyPostedOverseas(false)
    on(15, 11); signInAs('kestrel'); reload()
    expect(postOutProblem(PID.osprey, 'delete')).toBeNull()
    expect(postOut(PID.osprey, todayIso(), 'delete')).toBe(true)
    reload()
    expect({ deleted: !!(PEOPLE as any)[PID.osprey]?.deleted, account: accountOfPid(PID.osprey)?.id ?? null }).toEqual({ deleted: true, account: null })
  })
  it('Hunter (Plan of 149) makes the same change: the door asks no make-an-admin question (nobody is brought back)', () => {
    ospreyPostedOverseas(false)
    asHunter()
    expect(postOutProblem(PID.osprey, 'delete')).toBeNull()
  })
  it('…and it goes through: Osprey is deleted, his sign-in with him', () => {
    ospreyPostedOverseas(false)
    asHunter()
    const done = postOut(PID.osprey, todayIso(), 'delete')
    reload()
    expect({ done, deleted: !!(PEOPLE as any)[PID.osprey]?.deleted, account: accountOfPid(PID.osprey)?.id ?? null }).toEqual({ done: true, deleted: true, account: null })
  })
})

describe('opus 1 — a take-back that brings no admin into force is not refused as making one', () => {
  it('Hunter (Plan of 149) moves the posting a week later: nothing makes an admin, so it goes through', () => {
    ospreyPostedOverseas(true)
    expect(accountById(ACCT.osprey)!.offBy).toBeUndefined()
    asHunter()
    const later = addDays(todayIso(), 7)
    const why = postOutProblem(PID.osprey, 'overseas')
    const done = postOut(PID.osprey, later, 'overseas')
    reload()
    expect({ why, done, ...state() }).toEqual({ why: null, done: true, archived: false, on: false })
  })
})

describe('astra 3 — a posting take-back may lift the posting\'s archive while a hand suspension stays', () => {
  it.each(['Undo post out', 'later date', 'None outcome'] as const)('%s: goes through for Hunter, his sign-in still suspended by hand', route => {
    ospreyPostedOverseas(true)
    expect((PEOPLE as any)[PID.osprey].archivedBy).toBe('po')
    asHunter()
    let why: string | null
    let done: boolean
    if (route === 'Undo post out') {
      why = undoPostOutProblem(PID.osprey)
      done = undoPostOut(PID.osprey)
    } else {
      const date = route === 'later date' ? '2026-07-25' : todayIso()
      const outcome = route === 'later date' ? 'overseas' : 'none'
      why = postOutProblem(PID.osprey, outcome)
      done = postOut(PID.osprey, date, outcome)
    }
    reload()
    expect({ why, done, archived: !!(PEOPLE as any)[PID.osprey].archived, on: accountById(ACCT.osprey)!.on, offBy: accountById(ACCT.osprey)!.offBy })
      .toEqual({ why: null, done: true, archived: false, on: false, offBy: undefined })
  })
})
