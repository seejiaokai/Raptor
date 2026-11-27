// @vitest-environment jsdom
/* U2 FIX ROUND 1, FIX 7 (opus1 F3, opus2 F3, Astra 4 — the brief docs/superpowers/briefs/2026-11-27-msq-s2-u2fix-brief.md):
   a tap on a Plan line about a man with no row on that squadron's Admin → Users today opens nothing — the line is read
   and stays as the record (D1691, the archived case's road). "Has a row there" is the panel's own listing rule
   (ui/userslist-model.ts hasUsersRow, over usersListOf). Not by a search (Astra's alternative — his proof-4 expects the
   other answer and is kept out). Copied from opus1's and opus2's proof-3, with "made a member" and "he moved" added, and
   the line that still opens his row held. */
import { describe, it, expect, afterEach } from 'vitest'
import { withThird, signInAs, PID, ACCT, third, moveMan } from '../test-support/msq-world'
import { UNIT } from '../engine/unitview'
import { CURPAGE } from '../state/view'
import { BELLLIST } from './pops'
import { NOTICES, type Notice } from '../state/notices'
import { isUnread } from '../state/noticeseen'
import { saveAccess, updateAccount } from '../state/accounts'
import { lineOpens } from './topstate'
import { hasUsersRow } from './userslist-model'
import { todayIso } from '../state/units'
import { $, app, press, tid, guardTeardown, doing, otherMan, typeIn } from '../test-support/msq-guard-testkit'
import { openAdminUsers } from './adminopen'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()
afterEach(async () => { await guardTeardown() })
/* (the testkit's app() names three of the world's sign-ins; Kestrel's is the world's own too — msq-world SIGN) */
const kestrelApp = () => app('kestrel' as Parameters<typeof app>[0])

const lineFor = (who: string, c: string): Notice => {
  const n = NOTICES.find(x => String(x.to) === PID.hunter && (x.what?.[0] as any)?.k === 'sqplan' && (x.what?.[0] as any)?.who === who && (x.what?.[0] as any)?.c === c)
  expect(n, `the premise: the squadron's "${c}" line on Hunter's bell`).toBeTruthy()
  return n!
}
const rowOf = (pid: string) => $(`#page-admin .acc-row[data-person="${pid}"]`)
async function pressLine(n: Notice) {
  if (!BELLLIST) await press($('#notifyBell'), 'the bell')
  await press(tid(`bell-line-${n.id}`), 'the line')
}
/* opens nothing: lineOpens null, no Admin page, the line read */
async function opensNothing(n: Notice, pid: string) {
  await app('hunter')
  await doing(() => {})
  expect(hasUsersRow('u149', todayIso(), pid), 'the premise: no row on 149\'s Admin → Users today').toBe(false)
  const opens = lineOpens(n, 'entered')
  await pressLine(n)
  expect({ opens, page: CURPAGE === 'admin' ? 'admin' : 'not admin', row: !!rowOf(pid), unread: isUnread(n, PID.hunter) })
    .toEqual({ opens: null, page: 'not admin', row: false, unread: false })
}

describe('U2 fix 7 — a tap on a Plan line about a man with no row there opens nothing', () => {
  it('"Plan of 149 ended": Kestrel gives Mako (150) Plan of 149, then ends it', async () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } }), 'setup: given').toBeNull()
    expect(saveAccess(ACCT.mako, { grants: { u149: 'none' } }), 'setup: ended').toBeNull()
    await opensNothing(lineFor(PID.mako, 'ended'), PID.mako)
  })
  it('"Plan of 149 ended: made a member": Saber makes Hunter (142\'s admin, Plan of 149) a member; Kestrel taps the line', async () => {
    signInAs('saber')
    expect(updateAccount(ACCT.hunter, { role: 'main' }), 'setup: Saber makes Hunter a member — his Plan of 149 ends').toBeNull()
    const n = NOTICES.find(x => String(x.to) === PID.kestrel && (x.what?.[0] as any)?.k === 'sqplan' && (x.what?.[0] as any)?.who === PID.hunter && (x.what?.[0] as any)?.c === 'member')
    expect(n, 'the premise: 149\'s "made a member" line on Kestrel\'s bell').toBeTruthy()
    await kestrelApp()
    await doing(() => {})
    expect(hasUsersRow('u149', todayIso(), PID.hunter), 'the premise: Hunter has no row on 149\'s Admin → Users').toBe(false)
    expect(lineOpens(n!, 'here')).toBeNull()
    if (!BELLLIST) await press($('#notifyBell'), 'the bell')
    await press(tid(`bell-line-${n!.id}`), 'the line')
    expect({ page: CURPAGE === 'admin' ? 'admin' : 'not admin', row: !!rowOf(PID.hunter), unread: isUnread(n!, PID.kestrel) })
      .toEqual({ page: 'not admin', row: false, unread: false })
  })
  it('"Plan of 149 ended: he moved to 150": Hunter (Plan of 149) moved to 150, past midnight', async () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150), 'setup: Saber moves Hunter to 150 from tomorrow').toMatchObject({ ok: true })
    const { pastMidnight } = await import('../test-support/msq-world')
    pastMidnight()
    const n = NOTICES.find(x => String(x.to) === PID.kestrel && (x.what?.[0] as any)?.k === 'sqplan' && (x.what?.[0] as any)?.who === PID.hunter && (x.what?.[0] as any)?.c === 'moved')
    expect(n, 'the premise: 149\'s move line on Kestrel\'s bell').toBeTruthy()
    await kestrelApp()
    await doing(() => {})
    expect(hasUsersRow('u149', todayIso(), PID.hunter)).toBe(false)
    expect(lineOpens(n!, 'here')).toBeNull()
    if (!BELLLIST) await press($('#notifyBell'), 'the bell')
    await press(tid(`bell-line-${n!.id}`), 'the line')
    expect({ page: CURPAGE === 'admin' ? 'admin' : 'not admin', row: !!rowOf(PID.hunter), unread: isUnread(n!, PID.kestrel) })
      .toEqual({ page: 'not admin', row: false, unread: false })
  })
  it('asked before 149 is entered (the host\'s addition): Hunter on 142\'s Admin → Users, a row open with typing, taps "Plan of 149 ended" about Mako — he stays on 142, his row and typing stay, the line read', async () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } }), 'setup: given').toBeNull()
    expect(saveAccess(ACCT.mako, { grants: { u149: 'none' } }), 'setup: ended').toBeNull()
    const n = lineFor(PID.mako, 'ended')
    await app('hunter')
    await doing(() => { openAdminUsers({}) })
    expect([UNIT, CURPAGE], 'the premise: Hunter on 142\'s Admin page').toEqual(['u142', 'admin'])
    const man = otherMan()
    expect(man, 'the premise: a 142 man whose row Hunter may open').toBeTruthy()
    await press($(`[data-person="${man}"] .acc-tap`), 'his row')
    expect($('#accEdName'), 'the premise: the row is open').not.toBeNull()
    await typeIn('#accEdName', 'typed@mail')
    await pressLine(n)
    expect({ unit: UNIT, page: CURPAGE, open: !!$('#accEdName'), typed: ($('#accEdName') as HTMLInputElement | null)?.value, unread: isUnread(n, PID.hunter) })
      .toEqual({ unit: 'u142', page: 'admin', open: true, typed: 'typed@mail', unread: false })
  })
  it('held: "Given Plan of 149" still opens 149\'s Admin → Users at his row, ringed — he holds Plan, so he has a row', async () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } })).toBeNull()
    const n = lineFor(PID.mako, 'given')
    await app('hunter')
    expect(hasUsersRow('u149', todayIso(), PID.mako)).toBe(true)
    await pressLine(n)
    expect([UNIT, CURPAGE]).toEqual(['u149', 'admin'])
    expect(!!rowOf(PID.mako)?.classList.contains('acc-ring'), 'Mako\'s row ringed').toBe(true)
  })
})
