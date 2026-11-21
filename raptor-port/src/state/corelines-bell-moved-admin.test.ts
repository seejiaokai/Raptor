// @vitest-environment jsdom
/* CORE LINE 5 (helper "corelines", 22 Nov 26) — THE AUDIT of the bell's reading of an admin once K3 holds (his D2160: an
   admin who moves squadron arrives a member). A filer who has moved is told of a change to an input he filed only as an
   admin of the named man's squadron (D2223, D2228) — through his home where he is ITS admin today (state/notices.ts
   filerVia), or through the master mark or Plan (adminThen). Pinned here, through the real doors:
   - Hunter, who filed Ranger's leave and moved to 149 with him, is a MEMBER of 149 — the account's role still reads
     admin — and is told nothing of Kestrel's change; made an admin of 149 by Kestrel, he is told (D2228);
   - Plan of his old squadron cannot be given to him while he is a member (D2250), so the bell's Plan branch, which reads
     the account's bare role, has no right to count for him.
   These held on the code as found (no fault reproduced): filerVia's home branch asks accounts.ts isAdminAccount, which
   reads his level at home today (K3), and a Plan held before a move ends at the start of the move day (D2203). */
import { describe, it, expect, beforeEach } from 'vitest'
import { useMsqWorld, signInAs, on, moveMan, PID, ACCT } from '../test-support/msq-world'
import { writeInputsBatch } from './store'
import { INPUTS } from '../engine/inputs'
import { NOTICES, noticesFor, filerVia } from './notices'
import { updateAccount, levelIn } from './accounts'
import { setGrant } from './units'

/* (the bell's list is the module's own: emptied before the world boots each test, as leavewar/m4sec.test.ts does) */
beforeEach(() => { NOTICES.length = 0 })
useMsqWorld()

const IID = 'ipd-corelines5'
const file = () => expect(writeInputsBatch(() => { INPUTS.push({ person: PID.ranger, date: 'Jul 23', endDate: 'Jul 27', yr: 2026, allday: true, type: 'LL', remarks: 'for him', by: PID.hunter, at: Date.now(), iid: IID, ord: 99981 } as any) })).toBe(true)
const rmk = (words: string) => expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = words })).toBe(true)
const linesTo = (pid: string) => NOTICES.filter(n => n.to === pid && n.iid === IID)

describe('the bell and an admin who moved squadron (K3)', () => {
  it('Hunter filed Ranger\'s leave, both move to 149: a member there, he is told nothing of Kestrel\'s change — made its admin, he is told', () => {
    signInAs('hunter'); file()
    signInAs('saber'); rmk('Saber on the 15th')
    const before = linesTo(PID.hunter)
    expect(before.map(n => n.fu), 'told on the 15th as its filer, through his home 142').toEqual([['u142']])
    expect(moveMan(PID.ranger, 'u149')).toMatchObject({ ok: true })
    expect(moveMan(PID.hunter, 'u149')).toMatchObject({ ok: true })
    on(17)
    expect(levelIn(ACCT.hunter, 'u149', '2026-07-17'), 'he arrived a member').toBe('member')
    expect(noticesFor(PID.hunter).some(n => n.id === before[0]!.id), 'the line from before his move left his bell (D2218)').toBe(false)
    signInAs('kestrel'); rmk('Kestrel on the 17th')
    expect(linesTo(PID.hunter).filter(n => n.id !== before[0]!.id), 'a member of 149: not told (D2223)').toEqual([])
    expect(updateAccount(ACCT.hunter, { role: 'admin' }), 'Kestrel makes him an admin of 149').toBeNull()
    rmk('Kestrel again')
    const now = linesTo(PID.hunter).filter(n => n.id !== before[0]!.id)
    expect(now.map(n => n.fu), 'an admin of Ranger\'s squadron again: told through 149 (D2228)').toEqual([['u149']])
    expect(noticesFor(PID.hunter).some(n => n.id === before[0]!.id), 'nothing from before the move comes back').toBe(false)
  })
  it('Hunter moves to 149 alone: Plan of 142 cannot be given to him while he is a member, and nothing tells him of the leave he filed', () => {
    signInAs('hunter'); file()
    signInAs('saber')
    expect(moveMan(PID.hunter, 'u149')).toMatchObject({ ok: true })
    on(17)
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u142', 'admin', PID.hunter).ok, 'Plan is an admin\'s (D2250)').toBe(false)
    expect(filerVia(PID.hunter, [INPUTS.find((x: any) => x.iid === IID)]), 'no squadron tells him').toBeNull()
    rmk('Saber on the 17th')
    expect(linesTo(PID.hunter), 'a moved filer with no right: not told').toEqual([])
  })
})
