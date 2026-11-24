// @vitest-environment jsdom
/* THE SECURITY READ OF 0eaacc411 (chat 156, 24 Nov 26 — D:/raptor-work/c156-read-sec/security-read.md), its cases brought
   onto the branch: who may light a SANS man's reminder again or put it out, and who may take his "You're no longer SANS."
   line away.
   SINCE HIS D2560 (24 Nov 26) the first is no longer a question of who may write `settings/sansplan:<pid>:<iso>` — that
   hidden mark is gone, with its permission checks, and nothing reads a row of it. His reminder lights again only for a
   day not in it when he read it, by his own read record, which only he writes. Every case below is kept and now pins
   that: whatever anyone else writes, his read reminder stays read and a lit one stays lit. Round 3's own cases:
   sans-reads-r3.test.tsx.
   Fixture: test-support/msq-world.ts (Wed 15 Jul 26; Saber master 142, Hunter 142 admin, Ranger 142 member, Kestrel 149
   admin, Osprey 149 member) and sans-words-156's plan/post helpers. `rocky` is Hex, 142's WSO. */
import { describe, expect, it, beforeEach } from 'vitest'
import { store } from '../engine/hooks'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { afterSchedMutate } from '../state/view'
import { NOTICES, noticesFor, type Notice } from '../state/notices'
import { isUnread, markAllNoticesRead } from '../state/noticeseen'
import { commitSettingsIntent } from '../state/people-settings-commit'
import { ownershipViolation } from '../state/perms'
import { deriveActor } from '../command'
import { homeOn, todayIso } from '../state/units'
import { postOut } from './sync'
import { notify as raptorNotify } from '../state/store'
import { useMsqWorld, signInAs, mem } from '../test-support/msq-world'

import { INPUTS, idsOf } from '../engine/inputs'
import { updatePersonField } from '../state/quals-write'
import { commitNewInput } from '../ui/inputedit'

useMsqWorld()
let DAYS0 = ''
beforeEach(() => {
  if (!DAYS0) DAYS0 = JSON.stringify(DAYS)
  DAYS.length = 0; JSON.parse(DAYS0).forEach((d: any) => DAYS.push(d))
  NOTICES.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  stashClear()
})
const SATI = 5, SUNI = 6, SUN = '2026-07-19'
const plan = (di: number, id = 'rocky') => { (DAYS[di] as any).ground.push({ prog: 'BRIEFING', str: '1600', end: '1700', who: id }); afterSchedMutate() }
const due = () => noticesFor('rocky').filter((n: Notice) => String((n.what || [])[0]?.k) === 'sansdue')
const dueUnread = () => due().filter(n => isUnread(n, 'rocky')).length
const hexReads = () => { signInAs('hex'); expect(markAllNoticesRead()).toBe(true) }
/* Hex posted out as SANS from Fri 17 Jul, planned Sat 18, has read his reminder */
const readReminder = () => {
  signInAs('saber'); plan(SATI); expect(postOut('rocky', '2026-07-17', 'sans')).toBe(true); raptorNotify()
  hexReads(); expect(dueUnread()).toBe(0)
}

/* a write tried through a command; refused or let through, it must change nothing of his bell */
const tried = (fn: () => unknown): void => { try { fn() } catch { /* refused outright: as good */ } raptorNotify() }
describe('SEC156-1 — another squadron\'s admin cannot light a 142 man\'s reminder, nor put it out', () => {
  it('the world: Hex is 142\'s, Kestrel 149\'s admin', () => {
    expect(homeOn('rocky', todayIso())).toBe('u142')
    expect(homeOn('kes9', todayIso())).toBe('u149')
  })
  it('at the gate: Kestrel\'s command writing Hex\'s read record — the one thing his reminder reads — is refused', () => {
    signInAs('kestrel')
    const env = (changes: any[]): any => ({ seq: 1, at: '', origin: 'user', scope: { module: 'settings' }, type: 'account.update', actor: deriveActor(), changes })
    const put = (id: string, after: any) => ({ op: 'put', collection: 'settings', id, before: null, after })
    expect(ownershipViolation(env([put('noticeseen:rocky', { upto: 0, ids: [] })]))).toMatch(/another squadron's man's read record/)
  })
  it('end to end: Kestrel cannot light Hex\'s read reminder again with no day new to him', () => {
    readReminder()
    signInAs('kestrel')
    tried(() => commitSettingsIntent('account.update', null, () => { store.set('sansplan:rocky:2026-07-18', 9) }))
    const r: any = commitSettingsIntent('notices.seen', { owner: 'kes9' }, () => { store.set('noticeseen:rocky', { upto: 0, ids: [] }) })
    expect(r.ok).toBe(false)
    signInAs('hex')
    expect(dueUnread()).toBe(0)
  })
  it('end to end: Saber puts Hex on Sun 19, a day new to him (lit, D2394 2a as D2560 narrowed it) — Kestrel cannot put it out', () => {
    readReminder()
    signInAs('saber'); plan(SUNI)
    signInAs('hex'); expect(dueUnread()).toBe(1)
    signInAs('kestrel')
    tried(() => commitSettingsIntent('account.update', null, () => { store.set(`sansplan:rocky:${SUN}`, 0) }))
    const seen = mem['sqn142_noticeseen:rocky']
    const r: any = commitSettingsIntent('notices.seen', { owner: 'kes9' }, () => { store.set('noticeseen:rocky', { upto: 0, ids: [`sansdue:rocky~2026-07-18,${SUN}`] }) })
    expect(r.ok).toBe(false)
    expect(mem['sqn142_noticeseen:rocky']).toBe(seen)
    signInAs('hex')
    expect(dueUnread()).toBe(1)
  })
})

describe('SEC156-2 — a bare write outside every command (any role)', () => {
  it('Ranger (a member) from the console: Hex\'s read record is refused, and the old mark\'s row changes nothing', () => {
    readReminder()
    signInAs('saber'); plan(SUNI)
    signInAs('ranger')
    /* the read record has the bare-write guard (chat 147, SEC2-2 (a)) … */
    expect(() => store.set('noticeseen:rocky', { upto: 0, ids: [] })).toThrow(/read record is written only by its own command/)
    expect(() => store.set('noticeseen:rocky', { upto: 0, ids: [`sansdue:rocky~2026-07-18,${SUN}`] })).toThrow(/read record is written only by its own command/)
    /* … and the mark that once lit his reminder is read by nothing */
    tried(() => store.set(`sansplan:rocky:${SUN}`, 0))
    signInAs('hex')
    expect(dueUnread()).toBe(1)
  })
  it('…and inside a command a member writing Hex\'s read record is refused, as he should be', () => {
    readReminder()
    signInAs('ranger')
    const r: any = commitSettingsIntent('notices.seen', { owner: 'bane' }, () => { store.set('noticeseen:rocky', { upto: 0, ids: [] }) })
    expect(r.ok).toBe(false)
    tried(() => commitSettingsIntent('notices.seen', { owner: 'bane' }, () => { store.set('sansplan:rocky:2026-07-18', 9) }))
    signInAs('hex')
    expect(dueUnread()).toBe(0)
  })
})

const draftOf2 = (start: string, end?: string, person = 'rocky') => ({ _new: true, person, type: 'SANS Availability', start, ...(end ? { end } : {}), allday: true, s: 360, e: 1080, sans: { f: true } })
const backs = () => noticesFor('rocky').filter((n: Notice) => String((n.what || [])[0]?.k) === 'sansback')

describe('SEC156-3 — an untick line removed by a nominal posting change', () => {
  it('Saber unticks Hex (his line is written); a hand-made command with any change of his posting record deletes it', () => {
    signInAs('saber')
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(commitNewInput(draftOf2('2026-07-17', '2026-07-18'))).toBe(true)
    expect(INPUTS.some((r: any) => r.type === 'SANS Availability' && idsOf(r).map(String).includes('rocky'))).toBe(true)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    const line = backs()[0]!
    expect((line.what as any)[0].how).toBe('untick')
    const env: any = { seq: 1, at: '', origin: 'user', scope: { module: 'lw' }, type: 'lw.postout', actor: deriveActor(), changes: [
      { op: 'delete', collection: 'notices', id: line.id, before: line },
      { op: 'put', collection: 'lw.postouts', id: 'rocky', after: { gone: true } },
    ] }
    const alone: any = { ...env, changes: [env.changes[0]] }
    expect(String(ownershipViolation(alone))).toMatch(/SANS-days line taken away by no Undo or Redo of its own step/)
    /* the line is no posting's: a touch of his posting record does not let it go */
    expect(String(ownershipViolation(env))).toMatch(/SANS-days line taken away/)
  })
})

/* ==== THE SECURITY RE-READ OF f73602f9f (chat 156, round 2 — D:/raptor-work/c156-reread-sec/security-reread.md):
   RR-SEC-1, the planning mark vouched for by its label alone. The app's own projection door is open to any code of the
   page; with the mark gone (his D2560) nothing it writes there reaches a reminder. ==== */
import { commitProjection, onCommit } from '../command'
import { settingsStore as settingsStoreR2 } from '../state/people-settings-commit'
const SAT_R2 = '2026-07-18'
const asTheApp = (fn: () => void): any => {
  try { return commitProjection({ type: 'sans.planned', scope: { module: 'settings' } as any, meta: null, apply: (txn: any) => { txn.enlist(settingsStoreR2); fn() } } as any) }
  catch { return { ok: false } }
}
describe('RR-SEC-1 — the app\'s projection door reaches no reminder', () => {
  it('Ranger (142 member) cannot light Hex\'s read reminder again with nothing new to him', () => {
    readReminder()
    signInAs('ranger')
    asTheApp(() => { store.set(`sansplan:rocky:${SAT_R2}`, Date.now() + 10 ** 9) }); raptorNotify()
    signInAs('hex'); expect(dueUnread()).toBe(0)
  })
  it('Kestrel (149 admin) cannot put out the reminder a day new to him lit', () => {
    readReminder()
    signInAs('saber'); plan(SUNI)
    signInAs('hex'); expect(dueUnread()).toBe(1)
    signInAs('kestrel')
    asTheApp(() => { store.set(`sansplan:rocky:${SUN}`, null); store.set(`sansplan:rocky:${SAT_R2}`, null) }); raptorNotify()
    signInAs('hex'); expect(dueUnread()).toBe(1)
  })
  it('a subscriber of an unrelated command (Saber changing Logic) calling the door for Hex: nothing lit', () => {
    readReminder()
    signInAs('saber')
    let r: any = null
    const off = onCommit(env => { if (env.type === 'settings.rules' && !r) r = asTheApp(() => { store.set(`sansplan:rocky:${SAT_R2}`, Date.now() + 10 ** 9) }) })
    try { expect((commitSettingsIntent('settings.rules', null, () => { store.set('rules', { crewRest: 11 }) }) as any).ok).toBe(true) } finally { off() }
    /* (raised while the Logic change is delivered, the door's command is queued: its answer comes when it has run) */
    expect(r).toBeTruthy()
    raptorNotify()
    signInAs('hex'); expect(dueUnread()).toBe(0)
  })
  it('a real planning writes no mark, and a day new to him lights his reminder: Saber puts Hex on Sun 19', () => {
    readReminder()
    signInAs('saber'); plan(SUNI)
    expect(Object.keys(mem).filter(k => k.includes('sansplan:'))).toEqual([])
    signInAs('hex'); expect(dueUnread()).toBe(1)
  })
})
