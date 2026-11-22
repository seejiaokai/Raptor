/* SECURITY READ — where a Scheduler tick was given (`schedOf` / `schedFrom`, core line 4) is written unchecked by an admin:
   142's plain admin moves his own man to 149 from tomorrow and records the man's Scheduler tick as "given in 149", so he
   arrives carrying 149's Scheduler tick that no admin of 149 gave (D2160: it ends on the date; the squadron joined ticks him anew).
   The account's admin role has this very guard (perms.ts K3 — adminOf / adminFrom); the tick has none. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, PID, at, moveMan } from '../test-support/msq-world'
import { PEOPLE } from '../engine/people'
import { signPeople } from '../engine/publish'
import { commitPeopleEdit } from './people-settings-commit'
import { updatePersonField } from './quals-write'
import { schedTickIn, homeOn } from './units'

useMsqWorld()

describe('a Scheduler tick planted in the squadron a man is moved to', () => {
  it('control: the honest tick, given in 142 before his move, ends on the move day and is not 149\'s', () => {
    signInAs('hunter')
    expect(updatePersonField(PID.ranger, { tick: 'sched' } as any)).toBeNull()
    if (!(PEOPLE as any)[PID.ranger].quals.sched) expect(updatePersonField(PID.ranger, { tick: 'sched' } as any)).toBeNull()   // (seeded ticked: off, then on)
    expect((PEOPLE as any)[PID.ranger].schedOf).toBe('u142')
    expect(moveMan(PID.ranger, 'u149')).toMatchObject({ ok: true })
    at('2026-07-16')
    expect(homeOn(PID.ranger, '2026-07-16')).toBe('u149')
    expect(schedTickIn(PID.ranger, 'u149', '2026-07-16')).toBe(false)
    expect(schedTickIn(PID.ranger, 'u142', '2026-07-16')).toBe(false)
  })
  it('Hunter forges the record as given in 149 from the move day: refused, or it never counts in 149', () => {
    signInAs('hunter')
    expect(moveMan(PID.ranger, 'u149')).toMatchObject({ ok: true })
    const r: any = commitPeopleEdit(() => {
      const p: any = (PEOPLE as any)[PID.ranger]
      p.quals = { ...p.quals, sched: true }
      p.schedOf = 'u149'; p.schedFrom = '2026-07-16'
    }, { owner: PID.ranger })
    const saved = !!r && r.ok === true && (PEOPLE as any)[PID.ranger].schedOf === 'u149'
    at('2026-07-16')
    signInAs('kestrel')                                           // 149's admin opens Thu 16 Jul's sign-off boxes
    const offered = signPeople(true, undefined, 3).includes(PID.ranger)
    expect({ saved, counts: schedTickIn(PID.ranger, 'u149', '2026-07-16'), offered }, 'a 142 admin gave his man 149\'s Scheduler tick').toEqual({ saved: false, counts: false, offered: false })
  })
})
