// @vitest-environment jsdom
/* opus proof 2 — fix 3's "in force without a break since before the move day began", by the Plan road. Mako (150's
   admin) is given Plan of 149 by Kestrel on the 15th and it is ended the same day; Hunter (Plan of 149) moves to 150 on
   the 16th (saved by Saber elsewhere); on the 17th Kestrel undoes "Plan ended". Mako held no Plan of 149 on the 16th —
   the master-mark twin of this case (the build's own test) writes no line; the Plan road should not either. */
import { beforeEach, describe, expect, it } from 'vitest'
import { withThird, signInAs, moveMan, pastMidnight, on, PID, ACCT, third } from '../test-support/msq-world'
import { saveAccess, accountsLoad, signIn, sessionFor, levelIn } from './accounts'
import { unitsLoad } from './units'
import { NOTICES, type Notice } from './notices'
import { globalUndo } from '../undo/timeline'
import { setSession, setMe, SESSION } from './auth'

withThird()
beforeEach(() => { NOTICES.length = 0 })
const reload = (): void => { unitsLoad(); accountsLoad() }
const isHuntersMove = (n: Notice): boolean => {
  const p: any = n.what?.[0]
  return p?.k === 'sqplan' && p.who === PID.hunter && p.c === 'moved' && n.u === 'u149' && n.day === '2026-07-16'
}
const movesTo = (pid: string): Notice[] => NOTICES.filter(n => isHuntersMove(n) && String(n.to) === pid)
const audience = (): string[] => NOTICES.filter(isHuntersMove).map(n => String(n.to)).sort()
function moveHunterElsewhere(back: string): void {
  const s = SESSION
  setSession(sessionFor(signIn('ad', 'a'))); setMe(PID.saber)
  expect(moveMan(PID.hunter, third.u150), 'setup: Saber moves Hunter (Plan of 149) to 150 from the 16th').toMatchObject({ ok: true })
  setSession(s); setMe(back); reload()
}

describe('opus proof 2 — a Plan ended before the move day and undone after it', () => {
  it('Mako\'s Plan of 149 given and ended on the 15th, the end undone on the 17th: no line of the 16th', () => {
    on(15, 9)
    signInAs('kestrel')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } }), 'setup: Kestrel gives Mako Plan of 149').toBeNull()
    reload()
    on(15, 10)
    expect(saveAccess(ACCT.mako, { grants: { u149: 'none' } }), 'setup: Kestrel ends it').toBeNull()
    reload()
    moveHunterElsewhere(PID.kestrel)
    pastMidnight()
    expect(audience(), 'the move day\'s audience: Mako held no Plan of 149').toEqual([PID.kestrel, PID.saber].sort())
    on(17, 9)
    const u = globalUndo()
    reload()
    expect({ ok: u.ok, level: levelIn(ACCT.mako, 'u149', '2026-07-17') }, `setup: the Undo answered ${u.reason ?? 'ok'}`).toEqual({ ok: true, level: 'admin' })
    pastMidnight()
    expect(movesTo(PID.mako), 'Mako held no Plan of 149 on the move day').toEqual([])
  })
})
