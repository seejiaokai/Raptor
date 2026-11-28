// @vitest-environment jsdom
/* U2 FIX ROUND 2, FIX 2 (Fable 1, Opus F3, security S5 — closes [LW-UNDO-POSTOUT-ADMIN-WORDS]; the brief
   docs/superpowers/briefs/2026-11-28-msq-s2-u2fix2-brief.md): the posting's two take-backs ask the same door. Kestrel
   (149's admin) posts Osprey, made an admin of 149, overseas from today; the posting runs (archived, sign-in suspended).
   Hunter (142's admin, Plan of 149) presses "Undo post out", or moves the date later: the commit gate refuses both (round
   1's fix 4 — bringing an admin back is making one), and now the doors say why, in D2806's sentence, before anything is
   written. Copied from Fable's proof 1 (its two red cases turned into "refused in D2806's sentence, nothing changed", its
   two controls kept), the fresh Opus read's proof 1 and the security reader's proof 2 (whose date-moved case asked
   postOutProblem: the sentence is the new postOutChangeProblem's, since the posting's outcome alone cannot say it). */
import { describe, it, expect } from 'vitest'
import { withThird, signInAs, moveMan, on, pastMidnight, PID, ACCT } from '../test-support/msq-world'
import { saveAccess, accountById, accountsLoad, levelIn } from './accounts'
import { unitsLoad, todayIso, homeOn } from './units'
import { enterSquadron } from './store'
import { postOut, postOutProblem, postOutChangeProblem, undoPostOut, undoPostOutProblem, restoreArchivedPerson } from '../leavewar/sync'
import { PEOPLE } from '../engine/people'

withThird()
const reload = (): void => { unitsLoad(); accountsLoad() }
const MAKE = (n: string) => `Only ${n}'s own admins or a master admin can make an admin of ${n}.`
const state = () => ({ archived: !!(PEOPLE as any)[PID.osprey]?.archived, on: accountById(ACCT.osprey)!.on })
const addDays = (iso: string, n: number): string => {
  const [y, m, d] = iso.split('-').map(Number)
  const t = new Date(y!, m! - 1, d! + n)
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}

/* Kestrel posts Osprey overseas from today (made an admin of 149 first, where `admin`); the posting runs at once */
function ospreyPostedOverseas(admin: boolean): void {
  signInAs('kestrel')
  if (admin) expect(saveAccess(ACCT.osprey, { role: 'admin' }), 'setup: Kestrel makes Osprey an admin of 149').toBeNull()
  reload()
  enterSquadron('u149'); reload()
  on(15, 10)
  expect(postOut(PID.osprey, todayIso(), 'overseas'), 'setup: Kestrel posts Osprey overseas from today, it runs at once').toBe(true)
  reload()
  expect(state(), 'setup: the posting archived him and suspended his sign-in').toEqual({ archived: true, on: false })
}
const asHunter = (): void => { on(15, 11); signInAs('hunter'); enterSquadron('u149'); reload() }

describe('Fable 1 — Undo post out of a 149 admin by a Plan holder of 149', () => {
  it('control: Hunter (Plan of 149) takes back the posting of a 149 member: it goes through', () => {
    ospreyPostedOverseas(false)
    asHunter()
    expect(undoPostOutProblem(PID.osprey)).toBeNull()
    expect(undoPostOut(PID.osprey)).toBe(true)
    reload()
    expect(state()).toEqual({ archived: false, on: true })
  })
  it('control: Kestrel (149\'s own admin) takes back the posting of a 149 admin: it goes through', () => {
    ospreyPostedOverseas(true)
    on(15, 11); signInAs('kestrel'); reload()
    expect(undoPostOutProblem(PID.osprey)).toBeNull()
    expect(undoPostOut(PID.osprey)).toBe(true)
    reload()
    expect(state()).toEqual({ archived: false, on: true })
  })
  it('Hunter presses "Undo post out" on a 149 admin: refused in D2806\'s sentence, nothing changed', () => {
    ospreyPostedOverseas(true)
    asHunter()
    const why = undoPostOutProblem(PID.osprey)
    const done = undoPostOut(PID.osprey)
    reload()
    expect({ why, done, ...state() }).toEqual({ why: MAKE('149'), done: false, archived: true, on: false })
  })
  it('Hunter moves that posting to a later date (which would lift the archive and the suspension): refused in D2806\'s sentence, nothing changed', () => {
    ospreyPostedOverseas(true)
    asHunter()
    const why = postOutProblem(PID.osprey, 'overseas') ?? postOutChangeProblem(PID.osprey, '2026-07-25', 'overseas')
    const done = postOut(PID.osprey, '2026-07-25', 'overseas')
    reload()
    expect({ why, done, ...state() }).toEqual({ why: MAKE('149'), done: false, archived: true, on: false })
  })
})

describe('Opus F3 — the posting sheet brings an archived admin back only past the make-an-admin door', () => {
  it('1a: Hunter (Plan of 149): "Undo post out" on Osprey (149 admin): nothing written', () => {
    ospreyPostedOverseas(true)
    asHunter()
    const ok = undoPostOut(PID.osprey)
    reload()
    expect({ ok, ...state() }).toEqual({ ok: false, archived: true, on: false })
  })
  it('1b: the sheet\'s own refusal (undoPostOutProblem) says D2806\'s sentence, as Restore does', () => {
    ospreyPostedOverseas(true)
    asHunter()
    expect(undoPostOutProblem(PID.osprey)).toBe(MAKE('149'))
  })
  it('1c: Hunter moves the posting\'s date to next week (so it no longer archives him today): nothing written', () => {
    ospreyPostedOverseas(true)
    asHunter()
    expect(postOutChangeProblem(PID.osprey, addDays(todayIso(), 7), 'overseas')).toBe(MAKE('149'))
    const ok = postOut(PID.osprey, addDays(todayIso(), 7), 'overseas')
    reload()
    expect({ ok, ...state() }).toEqual({ ok: false, archived: true, on: false })
  })
  it('1d: the posting door asked with no post-in date (restoreArchivedPerson) refuses before the gate', () => {
    ospreyPostedOverseas(true)
    asHunter()
    expect(restoreArchivedPerson(PID.osprey)).toBe(false)
    reload()
    expect(state()).toEqual({ archived: true, on: false })
  })
  it('control: the same date moved by Kestrel (149\'s own admin) goes through and asks nothing', () => {
    ospreyPostedOverseas(true)
    on(15, 11); signInAs('kestrel'); reload()
    expect(postOutChangeProblem(PID.osprey, addDays(todayIso(), 7), 'overseas')).toBeNull()
    expect(postOut(PID.osprey, addDays(todayIso(), 7), 'overseas')).toBe(true)
    reload()
    expect(state()).toEqual({ archived: false, on: true })
  })
  it('control: a date moved that keeps the posting run today lifts nothing, and asks nothing', () => {
    ospreyPostedOverseas(true)
    asHunter()
    expect(postOutChangeProblem(PID.osprey, addDays(todayIso(), -1), 'overseas')).toBeNull()
  })
})

describe('security S5 — "Undo post out" of an admin is asked at the door', () => {
  it('Hunter (Plan of 149): the sheet\'s Undo post out says who can, and nothing is written', () => {
    ospreyPostedOverseas(true)
    asHunter()
    const problem = undoPostOutProblem(PID.osprey)
    const ok = undoPostOut(PID.osprey)
    reload()
    expect({ problem, ok, ...state() }).toEqual({ problem: MAKE('149'), ok: false, archived: true, on: false })
  })
  it('Hunter (Plan of 149): moving the run posting\'s date ahead would lift the archive: the door says who can, nothing written', () => {
    ospreyPostedOverseas(true)
    asHunter()
    const later = '2026-07-30'
    const problem = postOutChangeProblem(PID.osprey, later, 'overseas')
    const ok = postOut(PID.osprey, later, 'overseas')
    reload()
    expect({ problem, ok, ...state() }).toEqual({ problem: MAKE('149'), ok: false, archived: true, on: false })
  })
  it('(control) Kestrel, 149\'s own admin, undoes it: Osprey back', () => {
    ospreyPostedOverseas(true)
    on(15, 11); signInAs('kestrel'); reload()
    expect(undoPostOutProblem(PID.osprey)).toBeNull()
    expect(undoPostOut(PID.osprey)).toBe(true)
    reload()
    expect(state()).toEqual({ archived: false, on: true })
  })
})

describe('a moved member (fix 1\'s Hunter) posted out of 149 and taken back by Mako (Plan of 149): goes through', () => {
  it('Mako takes back Hunter\'s posting: he is a member of 149, so no admin is made', () => {
    on(15, 9)
    signInAs('saber')
    expect(moveMan(PID.hunter, 'u149'), 'setup: Saber moves Hunter to 149').toMatchObject({ ok: true })
    pastMidnight(); reload()
    expect(homeOn(PID.hunter, todayIso())).toBe('u149')
    expect(levelIn(ACCT.hunter, 'u149', todayIso()), 'premise: a member of 149 (K3)').toBe('member')
    signInAs('kestrel'); enterSquadron('u149')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } }), 'setup: Kestrel gives Mako Plan of 149').toBeNull()
    reload()
    expect(postOut(PID.hunter, todayIso(), 'overseas'), 'setup: Kestrel posts Hunter overseas from today').toBe(true)
    reload()
    expect({ archived: !!(PEOPLE as any)[PID.hunter].archived, on: accountById(ACCT.hunter)!.on }).toEqual({ archived: true, on: false })
    signInAs('mako'); enterSquadron('u149'); reload()
    expect(undoPostOutProblem(PID.hunter)).toBeNull()
    expect(undoPostOut(PID.hunter)).toBe(true)
    reload()
    expect({ archived: !!(PEOPLE as any)[PID.hunter].archived, on: accountById(ACCT.hunter)!.on }).toEqual({ archived: false, on: true })
  })
})
