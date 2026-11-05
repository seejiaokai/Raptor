/* [POSTOUT-RUN-NOTICE] — A POSTING OUT RUNS ON ITS DATE, AND EVERY ADMIN'S BELL IS TOLD (owner D1546: "So it is not like
   gone silently"; D1547 A: it runs by itself and each admin's bell gets one line; D1690: the man first, in bold, then
   "Posted out" and what the outcome did — "Ranger · Mon 20 Jul / Posted out · archived, account suspended"; D1691: a
   deleted man's line opens nothing, and stays as the record).

   Pinned here: the line for each outcome, its words and who is told (every admin who can sign in, never a member, never a
   man no longer here); written inside the pass's own command (a refused pass tells nobody; a posting made today tells at
   once, and the line stays as the record); a held posting tells nothing new; "off the manpower" — no pass runs — worked out by each admin's bell, for
   fourteen days; an admin's member view hides the line; the gate refuses a forged line; the tap's landing.

   Every set-up goes through the production doors: the Post out sheet's writer (postOut), the pass (runPoOutcomes), Admin →
   Users' account writer (updateAccount), the top bar's Undo (globalUndo), the bell's line tap (openNotice). Runs in the
   Leave War project (a hostile time zone). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor, updateAccount, accountOfPid, ACCOUNTS_LIST, isAdminAccount } from '../state/accounts'
import { installGlobalUndo } from '../state/undo-wire'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { commandStream } from '../command'
import type { CommitEnvelope } from '../command'
import { ownershipViolation } from '../state/perms'
import { NOTICES, noticesFor, noticeWords, noticeLive, allNoticesFor, type Notice } from '../state/notices'
import { unreadFor } from '../state/noticeseen'
import { CURPAGE, ADMINOPEN, clearAdminOpen } from '../state/view'
import { openNotice } from '../ui/topstate'
import { getState, initStore as lwInitStore, lwHistInit, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, runPoOutcomes, undoPostOut, wireLeaveWarSync, installPostingClock } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
const P = (id: string): any => (PEOPLE as any)[id]
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
/* today Wed 15 Jul 26; the postings are dated Mon 20 Jul (his last day in the 19th); the calendar then reaches the 21st */
const PO = '2026-07-20'
const reach = (d = 21) => { vi.setSystemTime(new Date(2026, 6, d, 9, 0, 0)) }
const poLines = (pid: string) => NOTICES.filter(n => n.to === pid && (n.what || [])[0]?.k === 'po')
const words = (n: Notice) => { const w = noticeWords(n); return `${w.name} · ${w.day} / ${w.what}${w.who ? ' · ' + w.who : ''}` }
/* the admins who can sign in, by person — Saber (`ad`) and, made one by Admin → Users below, Hex's man */
const admins = () => ACCOUNTS_LIST.filter(a => isAdminAccount(a) && a.on && a.pid).map(a => String(a.pid)).sort()
/* a man on the war with no sign-in */
const noSignIn = (): string => Object.keys(PEOPLE).find(id => !accountOfPid(id) && !P(id).special && !P(id).pers && !P(id).archived
  && !P(id).san && !P(id).deleted && getState().people.some(p => p.id === id))!
const passEnvs = (from: number) => commandStream().slice(from).filter(e => e.type === 'lw.postoutRun')

beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); PEOPLE0 = JSON.stringify(PEOPLE) })
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v }, keys: () => Object.keys(mem) }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  NOTICES.length = 0
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  HOOKS.toast = () => {}
  signInAs('ad', 'a')
  /* a second admin, so "every admin" is two people (Hex — rocky's sign-in — made an admin on Admin → Users) */
  expect(updateAccount('achex', { role: 'admin' })).toBeNull()
  expect(admins()).toEqual(['rocky', 'stiff'])
  _resetTimeline(); lwHistInit(); installGlobalUndo()
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); resetSession(null); clearAdminOpen() })

describe('each outcome that runs: one line in every admin\'s bell, in his words (D1547, D1690)', () => {
  it('Overseas Sqn, a man with a sign-in: "Ranger · Mon 20 Jul / Posted out · archived, account suspended"', () => {
    expect(postOut('bane', PO, 'overseas')).toBe(true)
    expect(poLines('stiff'), 'nothing before its date').toEqual([])
    reach(); runPoOutcomes()
    expect(P('bane').archived).toBe(true)
    for (const a of ['stiff', 'rocky']) {
      expect(poLines(a), `${a} told once`).toHaveLength(1)
      expect(words(poLines(a)[0]!)).toBe('Ranger · Mon 20 Jul / Posted out · archived, account suspended')
    }
    expect(NOTICES.filter(n => (n.what || [])[0]?.k === 'po').map(n => n.to).sort(), 'the admins only').toEqual(['rocky', 'stiff'])
    expect(poLines('stiff')[0]!.by, 'nobody named as who set it').toBeNull()
  })
  it('Overseas Sqn, a man with no sign-in: "Posted out · archived"', () => {
    const id = noSignIn()
    expect(postOut(id, PO, 'overseas')).toBe(true)
    reach(); runPoOutcomes()
    expect(words(poLines('stiff')[0]!)).toBe(`${P(id).cs} · Mon 20 Jul / Posted out · archived`)
  })
  it('Delete: "Posted out · deleted" — his name still read though he is gone', () => {
    expect(postOut('bane', PO, 'delete')).toBe(true)
    reach(); runPoOutcomes()
    expect(P('bane').deleted).toBe(true)
    expect(words(poLines('stiff')[0]!)).toBe('Ranger · Mon 20 Jul / Posted out · deleted')
    expect(poLines('rocky')).toHaveLength(1)
  })
  it('SANS: "Posted out · now SANS"', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    reach(); runPoOutcomes()
    expect(words(poLines('stiff')[0]!)).toBe('Ranger · Mon 20 Jul / Posted out · now SANS')
  })
  it('the line is unread, lights the bell, and is first in the list', () => {
    expect(postOut('bane', PO, 'overseas')).toBe(true)
    reach(); runPoOutcomes()
    const before = unreadFor('stiff')
    expect(before).toBeGreaterThan(0)
    expect(noticesFor('stiff')[0]!.id).toBe(poLines('stiff')[0]!.id)
  })
  it('several postings in one run: their lines read in the Post out sheet’s order of outcomes — Overseas Sqn, Delete, SANS — as drawn, however they were posted', () => {
    const id = noSignIn()
    expect(postOut('rocky', PO, 'sans')).toBe(true)
    expect(postOut(id, PO, 'delete')).toBe(true)
    expect(postOut('bane', PO, 'overseas')).toBe(true)
    reach(); runPoOutcomes()
    expect(noticesFor('stiff').filter(n => (n.what || [])[0]?.k === 'po').map(n => (n.what[0] as any).who)).toEqual(['bane', id, 'rocky'])
  })
  it('the pass runs again: nobody is told twice', () => {
    expect(postOut('bane', PO, 'overseas')).toBe(true)
    reach(); runPoOutcomes(); runPoOutcomes(); raptorNotify(); runPoOutcomes()
    expect(poLines('stiff')).toHaveLength(1)
  })
  it('the line is written inside the pass\'s own command — its one envelope carries it, and it passes the gate', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    reach()
    const n = commandStream().length
    runPoOutcomes()
    const envs = passEnvs(n)
    expect(envs).toHaveLength(1)
    expect(envs[0]!.changes.filter(c => c.collection === 'notices').length, 'one line an admin').toBe(2)
    expect(ownershipViolation(envs[0]!)).toBeNull()
  })
})

describe('who is told', () => {
  it('a posted-out admin is not told about himself; the other admin is', () => {
    /* Hex (rocky) is an admin; Saber posts him out to an Overseas Sqn */
    expect(postOut('rocky', PO, 'overseas')).toBe(true)
    reach(); runPoOutcomes()
    expect(P('rocky').archived).toBe(true)
    expect(poLines('rocky')).toEqual([])
    expect(poLines('stiff')).toHaveLength(1)
  })
  it('a member is never told', () => {
    expect(postOut('rocky', PO, 'sans')).toBe(true)
    reach(); runPoOutcomes()
    expect(poLines('casper'), 'Outlaw, a member').toEqual([])
    expect(poLines('bane'), 'Ranger, a member').toEqual([])
  })
  it('a held posting (the last admin who can sign in) tells nothing new', () => {
    expect(updateAccount('achex', { role: 'main' })).toBeNull()
    /* Saber is the only admin: posting himself to an Overseas Sqn waits (D306) */
    expect(postOut('stiff', PO, 'overseas')).toBe(true)
    reach(); runPoOutcomes()
    expect(P('stiff').archived).toBeFalsy()
    expect(NOTICES.filter(n => (n.what || [])[0]?.k === 'po')).toEqual([])
  })
})

describe('a posting made today runs at once, inside the admin’s Post out — the line is a record, kept', () => {
  it('Post out dated today: the line is there at once', () => {
    expect(postOut('bane', '2026-07-15', 'sans')).toBe(true)
    raptorNotify()
    expect(P('bane').sanBy).toBe('po')
    expect(poLines('stiff')).toHaveLength(1)
    expect(words(poLines('stiff')[0]!)).toBe('Ranger · Wed 15 Jul / Posted out · now SANS')
  })
  /* the top bar's Undo does not take a posting back (D350 — "use … the posting sheet's own Undo"), so the line it wrote
     stays with it; the posting sheet's own Undo is a command of its own, and the line stays as the record that the posting
     ran (the agent's reading, put to him with the build — as a deleted man's line stays, D1691) */
  /* (since his D1693, 5 Nov 26 the posting sheet's Undo takes the line back: unread it simply goes, read it becomes "taken
     back" — postout-takeback.test.ts; the top bar's Undo still never takes a posting back, D350) */
  it('the top bar’s Undo refuses (D350) and the line stands; the posting sheet’s Undo puts him back and takes the unread lines with it (D1693)', () => {
    expect(postOut('bane', '2026-07-15', 'sans')).toBe(true)
    raptorNotify()
    expect(globalUndo().ok).toBe(false)
    expect(poLines('stiff')).toHaveLength(1)
    expect(undoPostOut('bane')).toBe(true)
    raptorNotify()
    expect(P('bane').sanBy).toBeFalsy()
    expect(poLines('stiff'), 'his own: he pressed it').toEqual([])
    expect(poLines('rocky'), 'Hex had not read his: it simply goes').toEqual([])
  })
})

describe('midnight with the app left open and untouched (the walk’s C5 — D1546 "not gone silently")', () => {
  it('the posting runs and the bell is told just after midnight, with no change made in the app', () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] })
    try {
      vi.setSystemTime(new Date(2026, 6, 19, 23, 59, 0))
      const off = installPostingClock()                   // the clock armed for this midnight (the app's boot starts it)
      expect(postOut('bane', PO, 'sans')).toBe(true)
      expect(P('bane').sanBy, 'not before its date').toBeFalsy()
      vi.advanceTimersByTime(30_000)
      expect(poLines('stiff'), 'still before midnight').toEqual([])
      vi.advanceTimersByTime(60_000)                      // past 00:00:01 on Mon 20 Jul
      expect(P('bane').sanBy, 'run by itself').toBe('po')
      expect(poLines('stiff')).toHaveLength(1)
      off()
    } finally { vi.useFakeTimers({ toFake: ['Date'] }) }
  })
})

describe('"off the manpower" — nothing runs, so each admin\'s bell works the line out (D1690)', () => {
  const lineFor = (pid: string) => allNoticesFor(pid).filter(n => (n.what || [])[0]?.k === 'po')
  it('before its date nothing; from its date one line an admin, never stored; fourteen days later, gone', () => {
    expect(postOut('bane', PO, 'none')).toBe(true)
    expect(lineFor('stiff')).toEqual([])
    reach(); runPoOutcomes()
    expect(NOTICES.filter(n => (n.what || [])[0]?.k === 'po'), 'not stored').toEqual([])
    expect(lineFor('stiff')).toHaveLength(1)
    expect(lineFor('rocky')).toHaveLength(1)
    expect(lineFor('casper'), 'a member: none').toEqual([])
    expect(words(lineFor('stiff')[0]!)).toBe('Ranger · Mon 20 Jul / Posted out · off the manpower')
    expect(noticesFor('stiff').some(n => n.id === lineFor('stiff')[0]!.id), 'listed in the bell').toBe(true)
    reach(20 + 14); expect(lineFor('stiff'), 'fourteen days on: still').toHaveLength(1)
    reach(20 + 15); expect(lineFor('stiff'), 'old news: not listed').toEqual([])
  })
})

describe('an admin\'s member view hides the line (D292 — it opens Admin → Users, a scheduler\'s page)', () => {
  it('a member session does not list it as live', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    reach(); runPoOutcomes()
    const line = poLines('stiff')[0]!
    expect(noticeLive(line)).toBe(true)
    signInAs('us', 'us')
    expect(noticeLive(line)).toBe(false)
  })
})

describe('the gate (tightened by the build’s security read, 5 Nov 26)', () => {
  /* the pass's own envelope, with one more line put into it */
  const withLine = (env: CommitEnvelope, after: any): CommitEnvelope => ({
    ...env, changes: [...env.changes, { collection: 'notices', id: String(after.id), op: 'put', before: null, after } as any],
  })
  const runSans = () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    reach()
    const n = commandStream().length
    runPoOutcomes()
    return passEnvs(n)[0]!
  }
  const base = { id: 'nf', by: null, at: 1, iid: '', name: 'X', day: PO }
  it('the pass’s own lines pass', () => { expect(ownershipViolation(runSans())).toBeNull() })
  it('a forged posting line is refused: another man, the wrong outcome, a member, the man himself, the wrong date, a second part, a second line to one admin', () => {
    const env = runSans()
    const bad = (after: any) => expect(ownershipViolation(withLine(env, after)), JSON.stringify(after)).toMatch(/the posting pass may change only the men it posts out/)
    bad({ ...base, to: 'stiff', what: [{ k: 'po', who: 'casper', o: 'sans' }] })            // a man it does not post out
    bad({ ...base, to: 'stiff', what: [{ k: 'po', who: 'bane', o: 'delete' }] })            // not the outcome that ran
    bad({ ...base, to: 'casper', what: [{ k: 'po', who: 'bane', o: 'sans' }] })             // a member
    bad({ ...base, to: 'bane', what: [{ k: 'po', who: 'bane', o: 'sans' }] })               // the man himself
    bad({ ...base, to: 'stiff', day: '2026-07-01', what: [{ k: 'po', who: 'bane', o: 'sans' }] })
    bad({ ...base, to: 'stiff', what: [{ k: 'po', who: 'bane', o: 'sans' }, { k: 'del' }] })
    bad({ ...base, to: 'stiff', what: [{ k: 'po', who: 'bane', o: 'sans', acct: true }] })  // a sign-in suspended, on a SANS posting
    bad({ ...base, to: 'stiff', what: [{ k: 'po', who: 'bane', o: 'sans' }] })              // Saber told twice
  })
  it('a line of any other kind, or with a maker, is refused in a pass that deletes nobody', () => {
    const env = runSans()
    const bad = (after: any) => expect(ownershipViolation(withLine(env, after)), JSON.stringify(after)).toMatch(/the posting pass may change only the men it posts out/)
    bad({ ...base, to: 'casper', iid: 'x', what: [{ k: 'lw', c: 'LL', a: PO, b: PO, d: 'approved' }] })
    bad({ ...base, to: 'casper', iid: String((INPUTS[0] as any).iid), what: [{ k: 'del' }] })
    bad({ ...base, by: 'stiff', to: 'rocky', what: [{ k: 'po', who: 'bane', o: 'sans' }] })
  })
  it('a stray request change sitting in memory outside every command does not ride the pass', () => {
    expect(postOut('bane', PO, 'overseas')).toBe(true)
    reach()
    const r: any = INPUTS.find((x: any) => x && x.iid != null)
    r.remarks = 'changed from a console'                    // no door, no command
    const n = commandStream().length
    runPoOutcomes()
    const env = passEnvs(n)[0]!
    expect(env.changes.filter(c => c.collection === 'inputs'), 'no request change in the pass').toEqual([])
    expect(P('bane').archived, 'the posting still ran').toBe(true)
  })
  it('a member’s command may never write a posting line', () => {
    signInAs('us', 'us')
    const env: any = {
      type: 'inputs.write', origin: 'user', actor: { role: 'member', personId: 'bane', principal: 'us' }, scope: { module: 'inputs' },
      changes: [{ collection: 'notices', id: 'nm', op: 'put', before: null, after: { id: 'nm', to: 'stiff', by: 'bane', at: 1, iid: '', name: 'X', day: PO, what: [{ k: 'po', who: 'casper', o: 'delete' }] } }],
    }
    expect(ownershipViolation(env)).toMatch(/a notice that is not his own change's/)
  })
})

describe('more than one posting date in one run, and an admin’s own posting', () => {
  it('two dates come due at once: the later date’s lines first, each date’s in the sheet’s order', () => {
    const id = noSignIn()
    /* (the earlier date carries the outcome that sorts first, so only the date can put it last) */
    expect(postOut('bane', '2026-07-18', 'overseas')).toBe(true)
    expect(postOut(id, PO, 'delete')).toBe(true)
    expect(postOut('casper', PO, 'sans')).toBe(true)
    reach(); runPoOutcomes()
    expect(noticesFor('stiff').filter(n => (n.what || [])[0]?.k === 'po').map(n => `${(n.what[0] as any).who}@${n.day}`))
      .toEqual([`${id}@${PO}`, `casper@${PO}`, 'bane@2026-07-18'])
  })
  it('an admin made SANS by his posting is not told of it; the other admin is', () => {
    expect(postOut('rocky', PO, 'sans')).toBe(true)
    reach(); runPoOutcomes()
    expect(P('rocky').sanBy).toBe('po')
    expect(poLines('rocky')).toEqual([])
    expect(poLines('stiff')).toHaveLength(1)
  })
  it('an admin posted off the manpower is not told of it either (the line his bell works out)', () => {
    expect(postOut('rocky', PO, 'none')).toBe(true)
    reach()
    expect(allNoticesFor('rocky').filter(n => (n.what || [])[0]?.k === 'po')).toEqual([])
    expect(allNoticesFor('stiff').filter(n => (n.what || [])[0]?.k === 'po')).toHaveLength(1)
  })
})

describe('the tap (D1547, D1691)', () => {
  it('an archived man: Admin → Users, asked to ring him; the line read', () => {
    expect(postOut('bane', PO, 'overseas')).toBe(true)
    reach(); runPoOutcomes()
    const line = poLines('stiff')[0]!
    const n0 = unreadFor('stiff')
    openNotice(line)
    expect(CURPAGE).toBe('admin')
    expect(ADMINOPEN && ADMINOPEN.person).toBe('bane')
    expect(unreadFor('stiff')).toBe(n0 - 1)
  })
  it('a deleted man: opens nothing — the page stays, the line is read and stays in the bell', () => {
    expect(postOut('bane', PO, 'delete')).toBe(true)
    reach(); runPoOutcomes()
    const line = poLines('stiff')[0]!
    const page = CURPAGE
    const n0 = unreadFor('stiff')
    openNotice(line)
    expect(CURPAGE).toBe(page)
    expect(ADMINOPEN).toBeNull()
    expect(unreadFor('stiff')).toBe(n0 - 1)
    expect(noticesFor('stiff').some(n => n.id === line.id), 'kept as the record').toBe(true)
  })
})
