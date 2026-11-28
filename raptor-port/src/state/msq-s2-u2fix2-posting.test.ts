// @vitest-environment jsdom
/* A POSTING TAKEN BACK BRINGS AN ADMIN BACK, AND THAT IS NOT MAKING ONE (his D2903, 28 Nov 26: "switching a suspended,
   archived or posted-out admin back on is not making an admin" — whoever may manage that squadron's people may do it,
   and the man returns with the role he had).

   This file was U2 fix round 2's fix 2 (Fable 1, Opus F3, security S5 — the brief
   docs/superpowers/briefs/2026-11-28-msq-s2-u2fix2-brief.md), which had the posting sheet's two take-backs ask the
   make-an-admin door and refuse a Plan holder in D2806's sentence. That grew on round 1's fix 4, the agent's reading; his
   ruling replaced it (U2 fix round 3's addendum, docs/superpowers/briefs/2026-11-28-msq-s2-u2fix3-addendum.md), and the
   door it asked (leavewar/sync.ts postOutChangeProblem) is gone. So: Kestrel (149's admin) posts Osprey, made an admin of
   149, overseas from today; the posting runs (archived, sign-in suspended). Hunter (142's admin, Plan of 149) presses
   "Undo post out", or moves the date later: both now GO THROUGH, Osprey 149's admin again. Every case that expected a
   refusal expects that; the controls stand as they were. */
import { describe, it, expect } from 'vitest'
import { withThird, signInAs, moveMan, on, pastMidnight, PID, ACCT } from '../test-support/msq-world'
import { saveAccess, accountById, accountsLoad, levelIn, adminsOf } from './accounts'
import { unitsLoad, todayIso, homeOn } from './units'
import { enterSquadron } from './store'
import { postOut, postOutProblem, undoPostOut, undoPostOutProblem, restoreArchivedPerson } from '../leavewar/sync'
import { PEOPLE } from '../engine/people'

withThird()
const reload = (): void => { unitsLoad(); accountsLoad() }
const state = () => ({ archived: !!(PEOPLE as any)[PID.osprey]?.archived, on: accountById(ACCT.osprey)!.on })
const BACK = { archived: false, on: true }
const adminAgain = (): boolean => adminsOf('u149', todayIso()).includes(PID.osprey)
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

describe('Undo post out of a 149 admin by a Plan holder of 149 (D2903)', () => {
  it('control: Hunter (Plan of 149) takes back the posting of a 149 member: it goes through', () => {
    ospreyPostedOverseas(false)
    asHunter()
    expect(undoPostOutProblem(PID.osprey)).toBeNull()
    expect(undoPostOut(PID.osprey)).toBe(true)
    reload()
    expect(state()).toEqual(BACK)
  })
  it('control: Kestrel (149\'s own admin) takes back the posting of a 149 admin: it goes through', () => {
    ospreyPostedOverseas(true)
    on(15, 11); signInAs('kestrel'); reload()
    expect(undoPostOutProblem(PID.osprey)).toBeNull()
    expect(undoPostOut(PID.osprey)).toBe(true)
    reload()
    expect(state()).toEqual(BACK)
  })
  it('Hunter presses "Undo post out" on a 149 admin: it goes through, Osprey 149\'s admin again', () => {
    ospreyPostedOverseas(true)
    asHunter()
    const why = undoPostOutProblem(PID.osprey)
    const done = undoPostOut(PID.osprey)
    reload()
    expect({ why, done, ...state(), admin: adminAgain() }).toEqual({ why: null, done: true, ...BACK, admin: true })
  })
  it('Hunter moves that posting to a later date (which lifts the archive and the suspension): it goes through, Osprey 149\'s admin again', () => {
    ospreyPostedOverseas(true)
    asHunter()
    const why = postOutProblem(PID.osprey, 'overseas')
    const done = postOut(PID.osprey, '2026-07-25', 'overseas')
    reload()
    expect({ why, done, ...state(), admin: adminAgain() }).toEqual({ why: null, done: true, ...BACK, admin: true })
  })
})

describe('the posting sheet\'s doors ask nothing about making an admin (D2903)', () => {
  it('Hunter moves the posting\'s date to next week (so it no longer archives him today): written, he is back', () => {
    ospreyPostedOverseas(true)
    asHunter()
    const ok = postOut(PID.osprey, addDays(todayIso(), 7), 'overseas')
    reload()
    expect({ ok, ...state(), admin: adminAgain() }).toEqual({ ok: true, ...BACK, admin: true })
  })
  it('the posting door asked with no post-in date (restoreArchivedPerson) goes through for Hunter too', () => {
    ospreyPostedOverseas(true)
    asHunter()
    expect(restoreArchivedPerson(PID.osprey)).toBe(true)
    reload()
    expect({ ...state(), admin: adminAgain() }).toEqual({ ...BACK, admin: true })
  })
  it('control: the same date moved by Kestrel (149\'s own admin) goes through', () => {
    ospreyPostedOverseas(true)
    on(15, 11); signInAs('kestrel'); reload()
    expect(postOut(PID.osprey, addDays(todayIso(), 7), 'overseas')).toBe(true)
    reload()
    expect(state()).toEqual(BACK)
  })
  it('control: a date moved that keeps the posting run today lifts nothing: he stays archived and suspended', () => {
    ospreyPostedOverseas(true)
    asHunter()
    expect(postOut(PID.osprey, addDays(todayIso(), -1), 'overseas')).toBe(true)
    reload()
    expect(state()).toEqual({ archived: true, on: false })
  })
})

describe('a moved member (round 2 fix 1\'s Hunter) posted out of 149 and taken back by Mako (Plan of 149): goes through', () => {
  it('Mako takes back Hunter\'s posting: he is a member of 149, as he was', () => {
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
    expect(levelIn(ACCT.hunter, 'u149', todayIso()), 'still a member of 149').toBe('member')
  })
})
