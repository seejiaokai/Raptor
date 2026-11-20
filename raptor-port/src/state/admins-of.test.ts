/* A SQUADRON'S ADMINS ON A DAY — one audience for its admin lines (the reshape plan §6.2 step 6; D2202, D2198): at home
   there, or a non-master admin holding Plan of it; a master admin through his home only; a View holder never; nobody
   who cannot sign in as an admin. The gate reads it over the rows before a command (PC1, §7e). */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, acrossMove, PID, ACCT } from '../test-support/msq-world'
import { adminsOf } from './accounts'
import { setGrant, unitRowsBefore } from './units'

useMsqWorld()

describe('adminsOf', () => {
  it('today: 142\'s are Saber (the master admin, at home) and Hunter; 149\'s is Kestrel', () => {
    expect(adminsOf('u142').sort()).toEqual([PID.saber, PID.hunter].sort())
    expect(adminsOf('u149')).toEqual([PID.kestrel])
  })
  it('a non-master admin holding Plan of 149 is one of 149\'s; a View holder and the master admin are not', () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter)).toMatchObject({ ok: true })
    expect(setGrant(ACCT.ranger, 'u149', 'view', PID.ranger)).toMatchObject({ ok: true })
    expect(adminsOf('u149').sort()).toEqual([PID.kestrel, PID.hunter].sort())
    expect(adminsOf('u149')).not.toContain(PID.saber)
    expect(adminsOf('u149')).not.toContain(PID.ranger)
  })
  it('on a day: an admin moved away is his new squadron\'s from the move day', () => {
    const d = acrossMove(PID.hunter, 'u142', 'u149')
    expect(adminsOf('u142', d.before)).toContain(PID.hunter)
    expect(adminsOf('u142', d.moveDay)).not.toContain(PID.hunter)
    expect(adminsOf('u149', d.moveDay)).toContain(PID.hunter)
  })
  it('over the rows handed in (the gate\'s rows before a command), never the live ones', () => {
    signInAs('saber')
    const before = unitRowsBefore([])
    setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter)
    expect(adminsOf('u149', undefined, before)).toEqual([PID.kestrel])
    expect(adminsOf('u149')).toContain(PID.hunter)
  })
})
