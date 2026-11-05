/* [NOTICE-UNDO-RETRACT] step 1 — "UNDO POST OUT" TAKES BACK THE POSTING'S BELL LINES (owner D1693: "If it's undo it should
   retract it"; D1699, his idea: "If the post out was taken back shouldn't it show that it's striked out?").

   Pinned here: an admin who had READ the posting's line gets, in its place, one unread line — the posting's own words
   struck through, then "taken back · Saber"; an admin who had not read it simply loses it; the admin who pressed Undo gets
   nothing; the same for the Overseas Sqn posting's archive (Undo post out on it is the posting undone), and for "off the
   manpower" (a line each bell works out); Restore on Admin → Users is "he's back", not an undo — the line stays; an Undo
   before the date touches no bell; the change rides the posting's own command and the gate refuses a member's forged line;
   the tap opens his row.

   Every set-up goes through the production doors (the Post out sheet's writer, the pass, the posting sheet's Undo, Admin →
   Users' Restore, the bell's "Mark all read" and line tap). Runs in the Leave War project (a hostile time zone). */
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
import { unreadFor, markAllNoticesRead } from '../state/noticeseen'
import { CURPAGE, ADMINOPEN, clearAdminOpen } from '../state/view'
import { openNotice } from '../ui/topstate'
import { getState, initStore as lwInitStore, lwHistInit, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, runPoOutcomes, undoPostOut, restoreArchivedPerson, wireLeaveWarSync } from './sync'

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

const backLines = (pid: string) => NOTICES.filter(n => n.to === pid && (n.what || [])[0]?.k === 'poback')
/* the line as the bell draws it: the struck words in ~~ ~~, as the drawing of record shows them (picture 8) */
const drawn = (n: Notice) => { const w = noticeWords(n); return `${w.name} · ${w.day} / ${w.struck ? `~~${w.struck}~~ · ` : ''}${w.what}${w.who ? ' · ' + w.who : ''}` }
/* Hex reads his bell — "Mark all read", his own command — then Saber is signed in again */
const hexReads = () => { signInAs('hex'); expect(markAllNoticesRead()).toBe(true); signInAs('ad', 'a') }

describe('Undo post out after the posting ran (D1693, D1699)', () => {
  it('SANS: Hex had read his line — it becomes "~~Posted out · now SANS~~ · taken back · Saber", unread; Saber gets nothing', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    reach(); runPoOutcomes()
    expect(P('bane').san).toBe(true)
    hexReads()
    const from = commandStream().length
    expect(undoPostOut('bane')).toBe(true)
    expect(P('bane').san, 'the posting taken back').toBeFalsy()
    expect(poLines('rocky'), 'his posting line went').toEqual([])
    expect(backLines('rocky').map(drawn)).toEqual(['Ranger · Mon 20 Jul / ~~Posted out · now SANS~~ · taken back · Saber'])
    expect(unreadFor('rocky'), 'unread: his bell lights').toBe(1)
    expect(poLines('stiff'), 'Saber pressed it: his own line goes').toEqual([])
    expect(backLines('stiff'), '…and he is told nothing').toEqual([])
    /* one command, the posting's own, carrying the bell's rows — so it saved through the gate (a refused one changes nothing) */
    const envs = commandStream().slice(from) as CommitEnvelope[]
    expect(envs.map(e => e.type)).toEqual(['lw.postout'])
    const notes = envs[0]!.changes.filter(c => c.collection === 'notices')
    expect(notes.filter(c => c.op === 'delete')).toHaveLength(2)
    expect(notes.filter(c => c.op === 'put')).toHaveLength(1)
  })
  it('an admin who had not read his line simply loses it: no "taken back" line', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    reach(); runPoOutcomes()
    expect(undoPostOut('bane')).toBe(true)
    expect(poLines('rocky')).toEqual([])
    expect(backLines('rocky')).toEqual([])
    expect(unreadFor('rocky')).toBe(0)
  })
  it('Overseas Sqn: Undo post out on its archive takes the line back the same way', () => {
    expect(postOut('bane', PO, 'overseas')).toBe(true)
    reach(); runPoOutcomes()
    expect(P('bane').archived).toBe(true)
    hexReads()
    expect(undoPostOut('bane')).toBe(true)
    expect(P('bane').archived).toBeFalsy()
    expect(poLines('rocky')).toEqual([])
    expect(backLines('rocky').map(drawn)).toEqual(['Ranger · Mon 20 Jul / ~~Posted out · archived, account suspended~~ · taken back · Saber'])
  })
  it('off the manpower: the line each bell works out goes with the posting; read, it is taken back', () => {
    const id = noSignIn()
    expect(postOut(id, PO, false)).toBe(true)
    reach()
    expect(allNoticesFor('rocky').filter(n => (n.what || [])[0]?.k === 'po').map(words)).toEqual([`${P(id).cs} · Mon 20 Jul / Posted out · off the manpower`])
    hexReads()
    expect(undoPostOut(id)).toBe(true)
    expect(allNoticesFor('rocky').filter(n => (n.what || [])[0]?.k === 'po'), 'gone with the posting (D1696)').toEqual([])
    expect(backLines('rocky').map(drawn)).toEqual([`${P(id).cs} · Mon 20 Jul / ~~Posted out · off the manpower~~ · taken back · Saber`])
    expect(backLines('stiff')).toEqual([])
  })
  it('Restore on Admin → Users is "back", not the posting undone: the line stays as the record', () => {
    expect(postOut('bane', PO, 'overseas')).toBe(true)
    reach(); runPoOutcomes()
    hexReads()
    expect(restoreArchivedPerson('bane', '2026-07-22')).toBe(true)
    expect(poLines('rocky')).toHaveLength(1)
    expect(backLines('rocky')).toEqual([])
  })
  it('an Undo before the date touches no bell (no line was made)', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    const from = commandStream().length
    expect(undoPostOut('bane')).toBe(true)
    expect(NOTICES.filter(n => ['po', 'poback'].includes(String((n.what || [])[0]?.k)))).toEqual([])
    const envs = commandStream().slice(from) as CommitEnvelope[]
    expect(envs[0]!.changes.some(c => c.collection === 'notices')).toBe(false)
  })
  it('the gate refuses a member notice carrying a "taken back" posting line', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    reach(); runPoOutcomes()
    signInAs('us', 'us')
    const forged = { id: 'x1', to: 'rocky', by: 'bane', at: Date.now(), iid: '', name: 'Ranger', day: PO, what: [{ k: 'poback', who: 'bane', o: 'sans' }] }
    const env = { type: 'inputs.write', origin: 'user', actor: { role: 'member', personId: 'bane', principal: 'us' }, scope: { module: 'inputs' }, changes: [{ collection: 'notices', id: 'x1', op: 'put', before: null, after: forged }] } as unknown as CommitEnvelope
    expect(ownershipViolation(env)).toMatch(/a notice that is not his own change's/)
  })
  it('the tap on the "taken back" line opens his row on Admin → Users, and reads it', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    reach(); runPoOutcomes()
    hexReads()
    expect(undoPostOut('bane')).toBe(true)
    signInAs('hex')
    const line = backLines('rocky')[0]!
    expect(noticesFor('rocky')[0]!.id, 'first in his list').toBe(line.id)
    openNotice(line)
    expect(CURPAGE).toBe('admin')
    expect(ADMINOPEN && ADMINOPEN.person).toBe('bane')
    expect(unreadFor('rocky')).toBe(0)
  })
})
