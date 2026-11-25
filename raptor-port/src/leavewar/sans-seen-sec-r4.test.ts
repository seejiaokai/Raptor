// @vitest-environment jsdom
/* ROUND 4'S SECURITY READ, SEC-R4-1 (chat 169, 24 Nov 26 — D:/raptor-work/c169-r4-sec/security-r4.md; Astra's "older — the
   public projection door can empty another person's read record"), its cases brought onto the branch.
   Since his D2560 the one thing that decides whether a read SANS reminder lights again is the man's own read record,
   `settings/noticeseen:<pid>`. The gate asked nothing of the app's own actor, so the app's projection door (command
   commitProjection — open to any code of the page) wrote anyone's record, and an admin's command of any type wrote his
   man's: a member put another man's reminder out, read days ahead for him, or lit it with nothing planned.
   THE RULE NOW (state/perms.ts ownershipChecks; docs/data-model.md §11 NoticeSeen): a read record is written only by its
   owner — whoever runs the command, whatever its type.
   Fixture: test-support/msq-world.ts (Wed 15 Jul 26). Hex = `rocky` (142's WSO), Ranger = 142's member, Hunter = 142's
   second admin, Kestrel = 149's admin, Saber = the master admin. */
import { describe, expect, it, beforeEach } from 'vitest'
import { store } from '../engine/hooks'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { afterSchedMutate } from '../state/view'
import { NOTICES, noticesFor, type Notice } from '../state/notices'
import { isUnread, markAllNoticesRead, markNoticeRead, noticeSeenLoad } from '../state/noticeseen'
import { commitSettingsIntent, settingsStore } from '../state/people-settings-commit'
import { ownershipViolation } from '../state/perms'
import { commitProjection, deriveActor, systemActor } from '../command'
import { postOut } from './sync'
import { notify as raptorNotify } from '../state/store'
import { useMsqWorld, signInAs, mem } from '../test-support/msq-world'

useMsqWorld()
let DAYS0 = ''
beforeEach(() => {
  if (!DAYS0) DAYS0 = JSON.stringify(DAYS)
  // any: a day of the engine's week is untyped (a verbatim port, src/engine/data.ts)
  DAYS.length = 0; JSON.parse(DAYS0).forEach((d: any) => DAYS.push(d))
  NOTICES.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  stashClear()
})
const SATI = 5, SUNI = 6, SAT = '2026-07-18', SUN = '2026-07-19'
// any: a day of the engine's week is untyped (a verbatim port, src/engine/data.ts)
/* (planned = in a flying seat or a sim, his D2564 of 24 Nov 26: this helper put him on a ground briefing, which the first
   build counted and his rule does not — an OFT's rear seat now; a ground row naming no day: sans-planned-r5.test.ts) */
const plan = (di: number, id = 'rocky') => { const d: any = DAYS[di]; d.sims = d.sims || {}; (d.sims.oft = d.sims.oft || []).push({ label: 'SIM', str: '1600', end: '1700', p: '', w: id }); afterSchedMutate() }
const due = () => noticesFor('rocky').filter((n: Notice) => String((n.what || [])[0]?.k) === 'sansdue')
/* Hex's device, reading his read record as saved (a reload, or his phone beside his PC) */
const hexSees = () => { signInAs('hex'); noticeSeenLoad(); raptorNotify(); return due().filter(n => isUnread(n, 'rocky')).length }
/* Hex posted out as SANS from Fri 17 Jul, planned Sat 18, has read his reminder */
const readReminder = () => {
  signInAs('saber'); plan(SATI); expect(postOut('rocky', '2026-07-17', 'sans')).toBe(true); raptorNotify()
  signInAs('hex'); expect(markAllNoticesRead()).toBe(true); expect(hexSees()).toBe(0)
}
/* the app's own projection door, called by hand by whoever is signed in — its result, or what it threw */
// any: a hand-built command, as a page's own code could build it
const asTheApp = (fn: () => void, type = 'sans.anything'): any => {
  try { return commitProjection({ type, scope: { module: 'settings' } as any, meta: null, apply: (txn: any) => { txn.enlist(settingsStore); fn() } } as any) }
  catch (e) { return { ok: false, threw: String(e) } }
}
/* a change of Hex's read record as the gate is handed it */
const put = (id: string, after: unknown = { upto: 0, ids: [] }) => [{ op: 'put', collection: 'settings', id, before: null, after }]
// any: a hand-built envelope, only the fields the gate reads
const envOf = (origin: string, type: string, actor: unknown, id: string): any => ({ seq: 1, at: '', origin, scope: { module: 'settings' }, type, actor, changes: put(id) })

describe('SEC-R4-1 — the projection door wrote another man\'s read record, the one thing his reminder reads', () => {
  it('CONTROL: Saber puts Hex on Sun 19, a day new to him — his read reminder lights again (D2560)', () => {
    readReminder()
    signInAs('saber'); plan(SUNI)
    expect(hexSees()).toBe(1)
  })
  it('HOLE (a): Ranger, a 142 member, cannot put it out — Hex is still told he was put on Sun 19', () => {
    readReminder()
    signInAs('saber'); plan(SUNI)
    expect(hexSees()).toBe(1)
    signInAs('ranger')
    const before = mem['sqn142_noticeseen:rocky']
    const r = asTheApp(() => { store.set('noticeseen:rocky', { upto: 0, ids: [`sansdue:rocky~${SAT},${SUN}`] }) })
    expect(r.ok, 'the door refuses a write of another man\'s read record').toBe(false)
    expect(mem['sqn142_noticeseen:rocky']).toBe(before)
    expect(hexSees()).toBe(1)
  })
  it('HOLE (b): Kestrel, 149\'s admin, cannot put out a 142 man\'s reminder the same way', () => {
    readReminder()
    signInAs('saber'); plan(SUNI)
    signInAs('kestrel')
    const before = mem['sqn142_noticeseen:rocky']
    asTheApp(() => { store.set('noticeseen:rocky', { upto: 0, ids: [`sansdue:rocky~${SAT},${SUN}`] }) })
    expect(mem['sqn142_noticeseen:rocky']).toBe(before)
    expect(hexSees()).toBe(1)
  })
  it('HOLE (c): Ranger cannot pre-read days Hex never saw — a later planning of Sun 19 still lights him', () => {
    readReminder()
    signInAs('ranger')
    const days = ['2026-07-19', '2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24', '2026-07-25', '2026-07-26']
    asTheApp(() => { store.set('noticeseen:rocky', { upto: 0, ids: [`sansdue:rocky~${SAT},${days.join(',')}`] }) })
    signInAs('saber'); plan(SUNI)
    expect(hexSees()).toBe(1)
  })
  it('HOLE (d) — Astra F1\'s harm by the new route: Ranger cannot light Hex\'s read reminder with nothing planned for him', () => {
    readReminder()
    signInAs('ranger')
    asTheApp(() => { store.set('noticeseen:rocky', { upto: 0, ids: [] }) })
    expect(hexSees()).toBe(0)
  })
  it('Astra\'s case: the door named as the read command itself (`notices.seen`), after a tap — his record stays as he left it', () => {
    signInAs('saber'); expect(postOut('rocky', '2026-07-17', 'sans')).toBe(true); plan(SATI); raptorNotify()
    signInAs('hex'); expect(markNoticeRead(due()[0]!.id)).toBe(true)
    signInAs('ranger')
    const before = store.get('noticeseen:rocky', null)
    expect(before).not.toBeNull()
    const r = asTheApp(() => { store.set('noticeseen:rocky', { upto: 0, ids: [] }) }, 'notices.seen')
    expect(r.ok).toBe(false)
    expect(store.get('noticeseen:rocky', null)).toEqual(before)
    expect(hexSees()).toBe(0)
  })
})

describe('SEC-R4-1 — at the gate: a read record is its owner\'s alone, whoever writes', () => {
  it('the app\'s own actor, by a projection: refused', () => {
    expect(ownershipViolation(envOf('projection', 'sans.anything', systemActor(), 'noticeseen:rocky'))).toMatch(/another person's read record/)
  })
  it('the app\'s own actor, named as the read command: refused', () => {
    expect(ownershipViolation(envOf('projection', 'notices.seen', systemActor(), 'noticeseen:rocky'))).toMatch(/another person's read record/)
  })
  it('an admin of the man\'s own squadron, in a command of any type: refused (it passed as "his own squadron\'s man")', () => {
    signInAs('hunter')
    expect(ownershipViolation(envOf('user', 'notices.seen', deriveActor(), 'noticeseen:rocky'))).toMatch(/another person's read record/)
    signInAs('saber')
    expect(ownershipViolation(envOf('user', 'accounts.save', deriveActor(), 'noticeseen:rocky'))).toMatch(/another person's read record/)
    /* …and through the real door: Saber's own settings command writing Hex's record does not land */
    readReminder()
    signInAs('saber')
    const before = mem['sqn142_noticeseen:rocky']
    let res: unknown
    try { res = commitSettingsIntent('notices.seen', { owner: 'rocky' }, () => { store.set('noticeseen:rocky', { upto: 0, ids: [] }) }) } catch { res = { ok: false } }
    expect((res as { ok?: boolean }).ok).toBe(false)
    expect(mem['sqn142_noticeseen:rocky']).toBe(before)
  })
  it('CONTROL: his own row by his own read command passes — a member\'s, and an admin\'s', () => {
    signInAs('hex')
    expect(ownershipViolation(envOf('user', 'notices.seen', deriveActor(), 'noticeseen:rocky'))).toBeNull()
    signInAs('saber')
    expect(ownershipViolation(envOf('user', 'notices.seen', deriveActor(), 'noticeseen:stiff'))).toBeNull()
  })
  it('CONTROL: another device\'s change and a seed are not asked (they carry what was judged where it was made)', () => {
    expect(ownershipViolation(envOf('remote', 'notices.seen', systemActor(), 'noticeseen:rocky'))).toBeNull()
    expect(ownershipViolation(envOf('seed', 'notices.seen', systemActor(), 'noticeseen:rocky'))).toBeNull()
  })
})
