// @vitest-environment jsdom
/* ADMIN → USERS ACROSS SQUADRONS — STEP U2, PASS B: A TAP ON A SQUADRON'S PLAN LINE (the brief
   docs/superpowers/briefs/2026-11-27-msq-s2-u2-brief.md §5 "ui/topstate.ts", §8 "The lines (V10)"; the plan
   docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §21.2 Q4, drawn s2-34).
   Q4, as far as today's page allows, on the posting line's road (agreed with chat 204, ui/topstate.ts's owner): the line's
   squadron entered through the guard, then that squadron's Admin → Users at the man's row, ringed; a man with no row there
   (archived, deleted) opens nothing and the line stays as the record (D1691); `lineOpens` answers 'admin'. With a window
   open the tap is refused as any line is (D2403, D2590, D2627 A11). Q4's folds wait on U3 and U5.
   EVERY PRESS IS THE WHOLE SEQUENCE ON THE REAL CONTROLS: the bell, then its line. The line itself is written by the real
   door (Kestrel's Save on Admin → Users), not by hand.
   The world: three squadrons (withThird — his D2630), Wed 15 Jul 26. Hunter is 142's admin holding Plan of 149, so 149's
   Plan lines reach his bell. */
import { describe, it, expect, afterEach } from 'vitest'
import { withThird, signInAs, PID, ACCT } from '../test-support/msq-world'
import { UNIT } from '../engine/unitview'
import { CURPAGE } from '../state/view'
import { BELLLIST } from './pops'
import { NOTICES, type Notice } from '../state/notices'
import { isUnread } from '../state/noticeseen'
import { saveAccess, updateAccount } from '../state/accounts'
import { archivePerson } from '../leavewar/sync'
import { lineOpens } from './topstate'
import { $, OPEN, app, press, tid, guardTeardown, named, doing } from '../test-support/msq-guard-testkit'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()
afterEach(async () => { await guardTeardown() })

/* the squadron's Plan line about `who` on Hunter's bell, as the door wrote it */
const lineFor = (who: string): Notice => {
  const n = NOTICES.find(x => String(x.to) === PID.hunter && (x.what?.[0] as any)?.k === 'sqplan' && (x.what?.[0] as any)?.who === who)
  expect(n, 'the premise: the squadron\'s line on Hunter\'s bell').toBeTruthy()
  return n!
}
const ringed = (pid: string): boolean => !!$(`#page-admin .acc-row[data-person="${pid}"]`)?.classList.contains('acc-ring')
async function pressLine(n: Notice) {
  if (!BELLLIST) await press($('#notifyBell'), 'the bell')
  expect(BELLLIST, 'the premise: the bell\'s list is open').toBe(true)
  expect(tid(`bell-line-${n.id}`), 'the premise: the line is drawn in his bell').not.toBeNull()
  await press(tid(`bell-line-${n.id}`), 'the line')
}

describe('a tap on a squadron\'s Plan line (Q4, on the posting line\'s road)', () => {
  it('nothing open: 149 entered, its Admin → Users at Mako\'s row, ringed; the line read', async () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } })).toBeNull()
    const n = lineFor(PID.mako)
    await app('hunter')
    expect(UNIT, 'the premise: Hunter on his own 142').toBe('u142')
    await pressLine(n)
    expect([UNIT, CURPAGE], '149\'s Admin page').toEqual(['u149', 'admin'])
    expect(ringed(PID.mako), 'Mako\'s row ringed').toBe(true)
    expect(isUnread(n, PID.hunter), 'the line read').toBe(false)
    expect(BELLLIST, 'the list closed').toBe(false)
  })
  it('a window open: refused as any line is — 142 still in view, the line unread, the list open, no Admin page', async () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } })).toBeNull()
    const n = lineFor(PID.mako)
    await app('hunter')
    await OPEN.inputedit!.open()
    expect(named(), 'the premise: the window counts').toBe('inputedit')
    const page = CURPAGE
    await pressLine(n)
    expect([UNIT, CURPAGE], 'nothing changed').toEqual(['u142', page])
    expect(isUnread(n, PID.hunter), 'the line still unread (D2627 A11)').toBe(true)
    expect(BELLLIST, 'the list still open').toBe(true)
  })
  /* (re-pointed in U2's first fix round, fix 7 — the host's addition, agreed with chat 204: a line that will open nothing
     is asked before its squadron is entered, so 142 stays in view; before, 149 was entered first, then nothing opened) */
  it('a man archived since: opens nothing and enters nothing — 142 still in view, the line read and kept as the record (D1691)', async () => {
    signInAs('saber')
    expect(updateAccount(ACCT.ranger, { role: 'admin' }), 'setup: Ranger made an admin of 142').toBeNull()
    signInAs('kestrel')
    expect(saveAccess(ACCT.ranger, { grants: { u149: 'plan' } }), 'setup: Kestrel raises Ranger\'s View of 149 to Plan').toBeNull()
    const n = lineFor(PID.ranger)
    signInAs('saber')
    expect(archivePerson(PID.ranger).bad, 'setup: Ranger archived').toBeNull()
    await app('hunter')
    await doing(() => {})
    expect(lineOpens(n, 'entered'), 'lineOpens: nothing for an archived man').toBeNull()
    await pressLine(n)
    expect(CURPAGE, 'no Admin page').not.toBe('admin')
    expect(UNIT, '149 not entered for a tap that opens nothing').toBe('u142')
    expect(isUnread(n, PID.hunter), 'the line read').toBe(false)
    expect(NOTICES.some(x => x.id === n.id), 'the line kept').toBe(true)
  })
  it('lineOpens answers \'admin\' for a man with a row; nothing where his pages may never be the line\'s squadron', () => {
    signInAs('kestrel')
    expect(saveAccess(ACCT.mako, { grants: { u149: 'plan' } })).toBeNull()
    const n = lineFor(PID.mako)
    expect(lineOpens(n, 'entered')).toBe('admin')
    expect(lineOpens(n, 'here')).toBe('admin')
    expect(lineOpens(n, 'no')).toBeNull()
  })
})
