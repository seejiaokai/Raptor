/* THE POSTING PASS'S GATE OVER EVERY SQUADRON (the reshape plan, docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md
   §6.2 A5, steps 6 and 7 — core, phase 1, before helper "war" builds the pass's caller).

   perms.ts postingPassViolation takes another squadron's posting, run through the second store (`lwx.profile/<unit>@<pid>`),
   as a posting record too: it must be that squadron's SAVED posting (its own probe), the man's home before the pass that
   squadron, its done mark the only change; a Delete's war half there removes only his records and ledger entries from his
   cutoff. Every bell line the pass makes goes to one of that posting's squadron's admins on the run's day (accounts.ts
   adminsOf) — the war loaded's postings too: a 149 admin is never told of 142's posting, nor 142's of 149's.

   Judged on hand-built envelopes, as the fix-read files judge the pass (leavewar/multi-sqn-fixread13.test.ts): the pass
   that writes them is helper "war"'s, phase 2. The world: test-support/msq-world.ts — 142's war loaded, Wed 15 Jul 26. */
import { describe, expect, it, afterEach } from 'vitest'
import { useMsqWorld, PID, ACCT, signInAs, signOut } from '../test-support/msq-world'
import { ownershipViolation, setLwxPostingProbe, setStoredRowProbe } from './perms'
import { setGrant, unitsLoad } from './units'

useMsqWorld()
afterEach(() => { setLwxPostingProbe(null); setStoredRowProbe(null) })

const passEnv = (changes: any[]): any => ({ seq: 1, at: '', actor: { id: 'system', role: 'system', session: null }, origin: 'projection', scope: { module: 'people' }, type: 'lw.postoutRun', changes, emit: true })
/* a posting whose last day in was yesterday (Tue 14 Jul): due today, its done mark today's date */
const post = (pid: string, outcome: string) => ({ id: pid, callsign: pid.toUpperCase(), from: '2026-01-01', to: '2026-07-14', poOutcome: outcome })
const done = (p: any) => ({ ...p, poDone: '2026-07-15' })
const fxPost = (unit: string, pid: string, outcome = 'overseas') => ({ op: 'put', collection: 'lwx.profile', id: `${unit}@${pid}`, before: post(pid, outcome), after: done(post(pid, outcome)) })
const lwPost = (pid: string, outcome = 'overseas') => ({ op: 'put', collection: 'lw.postouts', id: pid, before: post(pid, outcome), after: done(post(pid, outcome)) })
const archived = (pid: string) => ({ op: 'put', collection: 'people', id: pid, before: { cs: pid }, after: { cs: pid, archived: true, archivedBy: 'po', archivedOn: '2026-07-15' } })
const deleted = (pid: string) => ({ op: 'put', collection: 'people', id: pid, before: { cs: pid }, after: { cs: pid, deleted: true, deletedFrom: '2026-07-15', archived: true, archivedBy: 'del' } })
let nid = 0
/* (stamped with the posting's squadron, as the pass stamps it — batch 1's second half, §7 item 1; `u` to forge another) */
const homeOf = (pid: string): string => (pid === PID.osprey || pid === PID.kestrel ? 'u149' : 'u142')
const line = (who: string, to: string, o = 'overseas', u: string | null = homeOf(who)) => ({ op: 'put', collection: 'notices', id: `n${++nid}`, before: null, after: { id: `n${nid}`, to, by: null, iid: '', day: '2026-07-15', what: [{ k: 'po', who, o }], ...(u ? { u } : {}) } })

describe('another squadron\'s posting, run through the second store', () => {
  it('149\'s posting of Osprey, Kestrel told: allowed (red on the old gate — the second store was no posting record)', () => {
    expect(ownershipViolation(passEnv([fxPost('u149', PID.osprey), archived(PID.osprey), line(PID.osprey, PID.kestrel)]))).toBeNull()
  })
  it('a posting there for a man whose home before the pass is not that squadron: refused', () => {
    expect(ownershipViolation(passEnv([fxPost('u149', PID.ranger), archived(PID.ranger)]))).toMatch(/another squadron's man/)
  })
  it('the war loaded written through the second store: refused', () => {
    expect(ownershipViolation(passEnv([fxPost('u142', PID.ranger), archived(PID.ranger)]))).toMatch(/posting pass may change only/)
  })
  it('a second store\'s posting row changed other than as its done mark: refused', () => {
    const p = post(PID.osprey, 'overseas')
    expect(ownershipViolation(passEnv([{ op: 'put', collection: 'lwx.profile', id: `u149@${PID.osprey}`, before: p, after: { ...p, from: '2026-02-01' } }])))
      .toMatch(/posting pass may change only/)
  })
  it('one man posted twice in one pass (the war loaded and the second store): refused', () => {
    expect(ownershipViolation(passEnv([lwPost(PID.osprey), fxPost('u149', PID.osprey), archived(PID.osprey)]))).toMatch(/posting pass may change only/)
  })
  it('on a built site (the saved copy wired): checked against THAT squadron\'s saved row — none installed, or not the saved one, refused', () => {
    setStoredRowProbe(() => null)
    const env = () => passEnv([fxPost('u149', PID.osprey), archived(PID.osprey), line(PID.osprey, PID.kestrel)])
    expect(ownershipViolation(env())).toMatch(/posting pass may change only/)
    const asked: string[] = []
    setLwxPostingProbe((unit, pid) => { asked.push(`${unit}/${pid}`); return false })
    expect(ownershipViolation(env())).toMatch(/posting pass may change only/)
    expect(asked).toEqual([`u149/${PID.osprey}`])
    setLwxPostingProbe(() => true)
    expect(ownershipViolation(env())).toBeNull()
  })
})

describe('a Delete\'s war half on another squadron\'s stored war', () => {
  const rec = (id: string, date: string, op = 'delete') => ({ op, collection: 'lwx.rec', id: `u149@w1:${id}`, before: { id, pid: PID.osprey, date, kind: 'LVE' }, after: op === 'delete' ? null : { id, pid: PID.osprey, date, kind: 'CCL' } })
  const entry = (id: string, date: string) => ({ op: 'delete', collection: 'lwx.ledger', id: `u149@${id}`, before: { id, personId: PID.osprey, counter: 'oil', amount: 1, date }, after: null })
  const delPost = () => fxPost('u149', PID.osprey, 'delete')
  it('his records and ledger entries from his cutoff removed: allowed', () => {
    expect(ownershipViolation(passEnv([delPost(), deleted(PID.osprey), rec('r1', '2026-07-20'), entry('e1', '2026-07-15'), line(PID.osprey, PID.kestrel, 'delete')]))).toBeNull()
  })
  it('a record before his cutoff removed, a record changed, or one of another squadron\'s: refused', () => {
    expect(ownershipViolation(passEnv([delPost(), deleted(PID.osprey), rec('r1', '2026-07-10')]))).toMatch(/posting pass may change only/)
    expect(ownershipViolation(passEnv([delPost(), deleted(PID.osprey), rec('r1', '2026-07-20', 'put')]))).toMatch(/posting pass may change only/)
    const other = { ...rec('r1', '2026-07-20'), id: 'u142@w1:r1' }
    expect(ownershipViolation(passEnv([delPost(), deleted(PID.osprey), other]))).toMatch(/posting pass may change only/)
  })
  it('his records removed by a posting that is not a Delete: refused', () => {
    expect(ownershipViolation(passEnv([fxPost('u149', PID.osprey), archived(PID.osprey), rec('r1', '2026-07-20')]))).toMatch(/posting pass may change only/)
  })
})

describe('the bell lines\' audience — that posting\'s squadron\'s admins, today (step 6)', () => {
  /* REWRITTEN TO §7 ITEM 2 (batch 1's second half — R-O2; D2198): it asserted "the master admin at home in 142, never told"
     of 149's posting. The one audience (accounts.ts adminLineAudience) now holds every master admin who can sign in —
     whether he SEES a 149 line is his bell's switch, off by default (D2198). A 142 plain admin is still never told. */
  it('149\'s posting: a 142 plain admin never told; the master admin at home in 142 told (§7 item 2)', () => {
    expect(ownershipViolation(passEnv([fxPost('u149', PID.osprey), archived(PID.osprey), line(PID.osprey, PID.hunter)]))).toMatch(/posting pass may change only/)
    expect(ownershipViolation(passEnv([fxPost('u149', PID.osprey), archived(PID.osprey), line(PID.osprey, PID.saber)]))).toBeNull()
  })
  it('a posting line stamped with another squadron than the posting\'s, or with none: refused (§7 item 1)', () => {
    expect(ownershipViolation(passEnv([fxPost('u149', PID.osprey), archived(PID.osprey), line(PID.osprey, PID.kestrel, 'overseas', 'u142')]))).toMatch(/posting pass may change only/)
    expect(ownershipViolation(passEnv([fxPost('u149', PID.osprey), archived(PID.osprey), line(PID.osprey, PID.kestrel, 'overseas', null)]))).toMatch(/posting pass may change only/)
  })
  it('149\'s posting: a plain admin holding Plan of 149 is told (D2202)', () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', PID.hunter)).toMatchObject({ ok: true })
    unitsLoad(); signOut()
    expect(ownershipViolation(passEnv([fxPost('u149', PID.osprey), archived(PID.osprey), line(PID.osprey, PID.hunter)]))).toBeNull()
  })
  it('the war loaded\'s posting: its own admin told; another squadron\'s admin never (red on the old gate — any admin who could sign in)', () => {
    expect(ownershipViolation(passEnv([lwPost(PID.ranger), archived(PID.ranger), line(PID.ranger, PID.hunter)]))).toBeNull()
    expect(ownershipViolation(passEnv([lwPost(PID.ranger), archived(PID.ranger), line(PID.ranger, PID.kestrel)]))).toMatch(/posting pass may change only/)
  })
})
