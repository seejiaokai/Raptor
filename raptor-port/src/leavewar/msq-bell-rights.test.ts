// @vitest-environment jsdom
/* STEP F, D1′ — A SQUADRON'S ADMIN LINES ARE SHOWN ONLY WHILE THE RIGHT THAT BROUGHT THEM HOLDS, WITHOUT A BREAK SINCE THE
   LINE WAS WRITTEN (batch 1's second half, docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md §16 D1′, D1′a,
   D1′b, D1′c; his D2310, D2218).
   - D1′: an admin-kind line (a posting's, its take-back's, a holiday's) stamped with a squadron is live only while its
     reader is in that squadron's one audience by his account's own role, and the right he holds there now began no later
     than the line's moment — so Plan lowered or taken, made a member, the master mark off, an Undo of the give: gone at
     once; given back later: none back; an Undo of the take-away: all back. The worked-out "off the manpower" line by its
     posting's day (a posting of the very day the right is given back shows again — the agent's reading, told to him).
   - D1′a: made a master admin, his Plan squadrons' lines stay, their bell default on (`kept` on his account).
   - D1′b: a master admin's move keeps the lines of the squadrons he is still admin of.
   - D1′c: "Undo post out" removes the posting's lines from the stored rows, shown or hidden, so a right given back by a
     later Undo shows no line for a posting taken back since.
   Red first on 87e382bd0. The world: test-support/msq-world.ts — Wed 15 Jul 26. */
import { beforeEach, describe, expect, it } from 'vitest'
import { postOut, undoPostOut } from './sync'
import { setGrant, removeGrant, todayIso } from '../state/units'
import { GRANT_PFX } from '../state/units-model'
import { NOTICES, noticesFor } from '../state/notices'
import { saveAccess, accountById, ACCOUNT_PFX } from '../state/accounts'
import { setBellSquadron } from '../state/bellsqn'
import { commitSettingsIntent } from '../state/people-settings-commit'
import { store } from '../engine/hooks'
import { globalUndo, globalRedo } from '../undo/timeline'
import { useMsqWorld, signInAs, ACCT, PID, on, moveMan, pastMidnight } from '../test-support/msq-world'

useMsqWorld()
beforeEach(() => { NOTICES.length = 0 })

const plan149 = (who: 'hunter' = 'hunter') => {
  signInAs('saber')
  expect(setGrant(ACCT[who], 'u149', 'admin', PID[who]).ok, 'Saber gives Hunter Plan of 149').toBe(true)
}
/* (Undo steps back through the signed-in person's own steps, and a sign-in clears the list — so where a test presses Undo,
   Kestrel, made a master admin first, gives the Plan, posts Osprey out and presses Undo in one sign-in) */
const kestrelMaster = () => {
  on(15, 8); signInAs('saber')
  expect(saveAccess(ACCT.kestrel, { master: true })).toBeNull()
  on(15, 9); signInAs('kestrel')
  expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter).ok, 'Kestrel gives Hunter Plan of 149').toBe(true)
}
/* Kestrel posts Osprey out from today: it runs at once, every 149 admin told */
const ospreyOut = () => {
  signInAs('kestrel')
  expect(postOut(PID.osprey, todayIso(), 'overseas'), 'Osprey posted out from today').toBe(true)
}
/* the posting lines about `who` on `reader`'s bell as he sees it (an admin is signed in, so the member-view test passes;
   no sign-in is switched, which would clear the signed-in admin's Undo list) */
const seen = (reader: 'hunter' | 'saber' | 'kestrel', who: string): number => {
  return noticesFor(PID[reader]).filter(n => (n.what || []).some((p: any) => p.k === 'po' && p.who === who)).length
}
const stored = (reader: string, who: string) => NOTICES.filter(n => n.to === reader && (n.what || []).some((p: any) => p.k === 'po' && p.who === who))

describe('D1′ — the right that brought the line still holds', () => {
  it('Plan of 149 at 09:00, a 149 posting at 09:30: Hunter sees it', () => {
    plan149(); on(15, 9, 30); ospreyOut()
    expect(seen('hunter', PID.osprey)).toBe(1)
  })
  it('Plan lowered to View: gone at once (red: it stayed)', () => {
    plan149(); on(15, 9, 30); ospreyOut()
    on(15, 10); signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter).ok).toBe(true)
    expect(seen('hunter', PID.osprey)).toBe(0)
    expect(stored(PID.hunter, PID.osprey).length, 'kept, not deleted').toBe(1)
  })
  it('Plan taken: gone at once; given again at 11:00 — none back (red: it stayed, and came back)', () => {
    plan149(); on(15, 9, 30); ospreyOut()
    on(15, 10); signInAs('saber')
    expect(removeGrant(ACCT.hunter, 'u149').ok).toBe(true)
    expect(seen('hunter', PID.osprey)).toBe(0)
    on(15, 11); plan149()
    expect(seen('hunter', PID.osprey), 'a right given back later brings none of the old lines back (D2218)').toBe(0)
  })
  it('made a member: gone at once', () => {
    plan149(); on(15, 9, 30); ospreyOut()
    on(15, 10); signInAs('saber')
    expect(saveAccess(ACCT.hunter, { role: 'main' })).toBeNull()
    expect(seen('hunter', PID.osprey)).toBe(0)
  })
  it('an Undo of the take-away: all back; its Redo: gone again', () => {
    kestrelMaster()
    on(15, 9, 30)
    expect(postOut(PID.osprey, todayIso(), 'overseas')).toBe(true)
    on(15, 10)
    expect(removeGrant(ACCT.hunter, 'u149').ok).toBe(true)
    expect(seen('hunter', PID.osprey)).toBe(0)
    on(15, 10, 30)
    expect(globalUndo().ok, 'Kestrel undoes the take-away').toBe(true)
    expect(seen('hunter', PID.osprey), 'the right put back brings its own start, and its lines').toBe(1)
    on(15, 10, 45)
    expect(globalRedo().ok, 'and redoes it').toBe(true)
    expect(seen('hunter', PID.osprey)).toBe(0)
  })
  it('an Undo of the give, with a line arrived since: gone at once', () => {
    kestrelMaster()
    on(15, 9, 30)
    expect(postOut(PID.osprey, todayIso(), 'overseas')).toBe(true)
    expect(seen('hunter', PID.osprey)).toBe(1)
    on(15, 10)
    /* (the posting is never an Undo step — D350 — so the Undo takes the give) */
    expect(globalUndo().ok).toBe(true)
    expect(seen('hunter', PID.osprey)).toBe(0)
  })
  it("the master mark off: 149's lines gone, his home's stay", () => {
    /* (a second master admin first, so Saber's mark can come off) */
    signInAs('saber')
    expect(saveAccess(ACCT.kestrel, { master: true })).toBeNull()
    setBellSquadron('u149', true)
    on(15, 9, 30); ospreyOut()
    signInAs('saber')
    expect(postOut(PID.ranger, todayIso(), 'overseas')).toBe(true)
    expect(seen('saber', PID.osprey)).toBe(1)
    expect(seen('saber', PID.ranger)).toBe(1)
    on(15, 10); signInAs('kestrel')
    expect(saveAccess(ACCT.saber, { master: false })).toBeNull()
    expect(seen('saber', PID.osprey), "149's line left with the mark").toBe(0)
    expect(seen('saber', PID.ranger), 'his home squadron’s stays').toBe(1)
  })
})

describe('D1′a — made a master admin, his Plan squadrons’ lines stay', () => {
  it('Hunter, Plan of 149, made a master admin: `kept` holds 149 from the Plan’s start, and his 149 line still shows', () => {
    plan149(); on(15, 9, 30); ospreyOut()
    on(15, 10); signInAs('saber')
    expect(saveAccess(ACCT.hunter, { master: true })).toBeNull()
    const a: any = accountById(ACCT.hunter)
    expect(Object.keys(a.kept ?? {}), 'the Plan dropped, its squadron kept').toEqual(['u149'])
    expect(a.kept.u149).toBeLessThanOrEqual(new Date(2026, 6, 15, 9, 0, 0).getTime())
    expect(seen('hunter', PID.osprey), 'on by default, his right unbroken').toBe(1)
  })
  it('his own choice wins: 149 switched off before, it stays off', () => {
    plan149(); on(15, 9, 30); ospreyOut()
    signInAs('hunter'); expect(setBellSquadron('u149', false)).toBe(true)
    on(15, 10); signInAs('saber')
    expect(saveAccess(ACCT.hunter, { master: true })).toBeNull()
    expect(seen('hunter', PID.osprey)).toBe(0)
  })
})

describe('D1′b — a move keeps the lines of the squadrons he is still admin of', () => {
  it("Saber, master admin, moves to 149: 142's posting line stays (red: it left)", () => {
    signInAs('saber')
    expect(saveAccess(ACCT.kestrel, { master: true })).toBeNull()
    /* (his bell's switch has 142 on — once 149 is his home, a master admin's other squadrons are off by default, D2198) */
    expect(setBellSquadron('u142', true)).toBe(true)
    expect(postOut(PID.ranger, todayIso(), 'overseas')).toBe(true)
    on(15, 10); signInAs('kestrel')
    expect(moveMan(PID.saber, 'u149'), 'Kestrel, master admin too, moves Saber').toMatchObject({ ok: true })
    pastMidnight()
    expect(seen('saber', PID.ranger), 'still an admin of 142, by the master mark').toBe(1)
  })
  it("Hunter, Plan of 149, moves to 149: the Plan ends on the move day, and 149's earlier line with it", () => {
    plan149(); on(15, 9, 30); ospreyOut()
    on(15, 10); signInAs('saber')
    expect(moveMan(PID.hunter, 'u149')).toMatchObject({ ok: true })
    pastMidnight()
    expect(seen('hunter', PID.osprey)).toBe(0)
  })
})

describe('D1′c — Undo post out works over the stored lines, shown or hidden', () => {
  it('Plan taken, Undo post out, then the take-away undone: no line for the posting taken back since (red: it came back)', () => {
    kestrelMaster()
    on(15, 9, 30)
    expect(postOut(PID.osprey, todayIso(), 'overseas')).toBe(true)
    on(15, 10)
    expect(removeGrant(ACCT.hunter, 'u149').ok).toBe(true)
    on(15, 10, 30)
    expect(undoPostOut(PID.osprey), 'Kestrel takes the posting back').toBe(true)
    expect(stored(PID.hunter, PID.osprey).length, 'removed from the stored rows though hidden').toBe(0)
    on(15, 11)
    /* ("Undo post out" is no Undo step — D350 — so the Undo takes the take-away) */
    expect(globalUndo().ok, 'Kestrel undoes the take-away').toBe(true)
    expect(seen('hunter', PID.osprey)).toBe(0)
  })
})

describe('the start moments — written by the doors, held at the gate', () => {
  it('a Plan given carries its moment; a forged older moment is refused', () => {
    plan149()
    const grant: any = (() => { for (const k of (store as any).keys(GRANT_PFX)) { const v: any = store.get(k, null); if (v && v.account === ACCT.hunter && v.unit === 'u149') return v } return null })()
    expect(grant?.fromAt, 'the moment it became Plan').toBe(new Date(2026, 6, 15, 9, 0, 0).getTime())
    signInAs('saber')
    const { fromAt: _m, ...view } = grant
    const r: any = commitSettingsIntent('grant.set', null, () => { store.set(GRANT_PFX + grant.id, { ...view, level: 'view' }) })
    expect(r?.ok, 'lowered — no moment').not.toBe(false)
    const r2: any = commitSettingsIntent('grant.set', null, () => { store.set(GRANT_PFX + grant.id, { ...grant, level: 'admin', fromAt: 0 }) })
    expect(r2?.ok, 'raised again with an older moment').toBe(false)
  })
  it('an account made an admin carries adminAt; a forged older one is refused', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.ranger, { role: 'admin' })).toBeNull()
    const a: any = accountById(ACCT.ranger)
    expect(a.adminAt).toBe(new Date(2026, 6, 15, 9, 0, 0).getTime())
    expect(saveAccess(ACCT.ranger, { role: 'main' })).toBeNull()
    const row: any = store.get(ACCOUNT_PFX + ACCT.ranger, null)
    expect(row.adminAt, 'made a member: the moment goes').toBeUndefined()
    const r: any = commitSettingsIntent('account.update', null, () => { store.set(ACCOUNT_PFX + ACCT.ranger, { ...row, role: 'admin', adminAt: 0 }) })
    expect(r?.ok, 'made an admin with an older moment').toBe(false)
  })
})
