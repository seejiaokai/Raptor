// @vitest-environment jsdom
/* THE SECURITY READ OF 0eaacc411 (chat 156, 24 Nov 26 — D:/raptor-work/c156-read-sec/security-read.md), its cases brought
   onto the branch: who may write `settings/sansplan:<pid>:<iso>` (the mark that lights a SANS man's reminder again), and
   who may take his "You're no longer SANS." line away.
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

describe('SEC156-1 — another squadron\'s admin writes a 142 man\'s sansplan count', () => {
  it('the world: Hex is 142\'s, Kestrel 149\'s admin', () => {
    expect(homeOn('rocky', todayIso())).toBe('u142')
    expect(homeOn('kes9', todayIso())).toBe('u149')
  })
  it('at the gate: Kestrel\'s command putting sansplan:rocky:… passes, though noticeseen:rocky is refused', () => {
    signInAs('kestrel')
    const env = (changes: any[]): any => ({ seq: 1, at: '', origin: 'user', scope: { module: 'settings' }, type: 'account.update', actor: deriveActor(), changes })
    const put = (id: string, after: any) => ({ op: 'put', collection: 'settings', id, before: null, after })
    expect(ownershipViolation(env([put('noticeseen:rocky', { upto: 0, ids: [] })]))).toMatch(/another squadron's man's read record/)
    expect(ownershipViolation(env([put('sansplan:rocky:2026-07-18', 9)]))).toMatch(/written only by the app/)
  })
  it('end to end: Kestrel lights Hex\'s read reminder again with no day newly planned', () => {
    readReminder()
    signInAs('kestrel')
    const r: any = commitSettingsIntent('account.update', null, () => { store.set('sansplan:rocky:2026-07-18', 9) })
    expect(r.ok).toBe(false)
    signInAs('hex')
    expect(dueUnread()).toBe(0)
  })
  it('end to end: Saber newly plans Hex on Sun 19 (lit, as D2394 2a says) — Kestrel puts it out again', () => {
    readReminder()
    signInAs('saber'); plan(SUNI)
    signInAs('hex'); expect(dueUnread()).toBe(1)
    signInAs('kestrel')
    const r: any = commitSettingsIntent('account.update', null, () => { store.set(`sansplan:rocky:${SUN}`, 0) })
    expect(r.ok).toBe(false)
    signInAs('hex')
    expect(dueUnread()).toBe(1)
  })
})

describe('SEC156-2 — a bare write outside every command is saved unjudged (any role)', () => {
  it('Ranger (a member) writes Hex\'s sansplan count from the console: no refusal, saved', () => {
    readReminder()
    signInAs('saber'); plan(SUNI)
    signInAs('ranger')
    /* the read record has the bare-write guard (chat 147, SEC2-2 (a)) … */
    expect(() => store.set('noticeseen:rocky', { upto: 0, ids: [] })).toThrow(/read record is written only by its own command/)
    /* … the new count does not */
    expect(() => store.set(`sansplan:rocky:${SUN}`, 0)).toThrow()
    signInAs('hex')
    expect(dueUnread()).toBe(1)
  })
  it('…while inside a command a member is refused, as he should be', () => {
    signInAs('ranger')
    const r: any = commitSettingsIntent('notices.seen', { owner: 'bane' }, () => { store.set('sansplan:rocky:2026-07-18', 9) })
    expect(r.ok).toBe(false)
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
   page, so the mark is now owed only by a person's own command that newly puts the man on that day, as it is judged. ==== */
import { commitProjection, onCommit } from '../command'
import { settingsStore as settingsStoreR2 } from '../state/people-settings-commit'
const SAT_R2 = '2026-07-18'
const asTheApp = (fn: () => void): any => {
  try { return commitProjection({ type: 'sans.planned', scope: { module: 'settings' } as any, meta: null, apply: (txn: any) => { txn.enlist(settingsStoreR2); fn() } } as any) }
  catch { return { ok: false } }
}
describe('RR-SEC-1 — the planning mark is owed by a planning, not by its label', () => {
  it('Ranger (142 member) lights Hex\'s read reminder again with nothing newly planned: refused, nothing saved', () => {
    readReminder()
    signInAs('ranger')
    expect(asTheApp(() => { store.set(`sansplan:rocky:${SAT_R2}`, Date.now() + 10 ** 9) }).ok).toBe(false)
    expect(mem[`sqn142_sansplan:rocky:${SAT_R2}`] ?? null).not.toBe(String(Date.now() + 10 ** 9))
    signInAs('hex'); expect(dueUnread()).toBe(0)
  })
  it('Kestrel (149 admin) puts out the reminder a real planning lit: refused', () => {
    readReminder()
    signInAs('saber'); plan(SUNI)
    signInAs('hex'); expect(dueUnread()).toBe(1)
    signInAs('kestrel')
    expect(asTheApp(() => { store.set(`sansplan:rocky:${SUN}`, null); store.set(`sansplan:rocky:${SAT_R2}`, null) }).ok).toBe(false)
    signInAs('hex'); expect(dueUnread()).toBe(1)
  })
  it('a subscriber of an unrelated command (Saber changing Logic) calling the door for Hex: refused', () => {
    readReminder()
    signInAs('saber')
    let r: any = null
    const off = onCommit(env => { if (env.type === 'settings.rules' && !r) r = asTheApp(() => { store.set(`sansplan:rocky:${SAT_R2}`, Date.now() + 10 ** 9) }) })
    try { expect((commitSettingsIntent('settings.rules', null, () => { store.set('rules', { crewRest: 11 }) }) as any).ok).toBe(true) } finally { off() }
    /* (raised while the Logic change is delivered, the door's command is queued: its answer comes when it has run) */
    expect(r).toBeTruthy()
    signInAs('hex'); expect(dueUnread()).toBe(0)
  })
  it('the real planning still marks the day: Saber puts Hex on Sun 19 — lit', () => {
    readReminder()
    signInAs('saber'); plan(SUNI)
    expect(Number(mem[`sqn142_sansplan:rocky:${SUN}`])).toBeGreaterThan(0)
    signInAs('hex'); expect(dueUnread()).toBe(1)
  })
})
