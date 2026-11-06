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
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, switchRoleView } from '../state/store'
import { accountsLoad, signIn, sessionFor, updateAccount, accountOfPid, ACCOUNTS_LIST, isAdminAccount } from '../state/accounts'
import { installGlobalUndo } from '../state/undo-wire'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { commandStream } from '../command'
import type { CommitEnvelope } from '../command'
import { ownershipViolation } from '../state/perms'
import { NOTICES, noticesFor, noticeWords, noticeLive, allNoticesFor, type Notice } from '../state/notices'
import { unreadFor, markAllNoticesRead, isUnread } from '../state/noticeseen'
import { CURPAGE, ADMINOPEN, clearAdminOpen } from '../state/view'
import { openNotice } from '../ui/topstate'
import { getState, initStore as lwInitStore, lwHistInit, setPeople, setShowSans, setPostIn, postingProblem } from './state/store'
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

describe('the scenario designer’s two suspected faults (5 Nov 26 — his scenarios 12 and 13)', () => {
  it('13: a posting whose date was moved after it ran, then undone — the line about the day it ran is taken back too', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    reach(); runPoOutcomes()
    hexReads()
    expect(postOut('bane', '2026-07-25', 'sans')).toBe(true)      // the sheet's date moved to a day still to come
    expect(undoPostOut('bane')).toBe(true)
    expect(poLines('rocky'), 'no "Posted out" line left standing').toEqual([])
    expect(backLines('rocky').map(drawn)).toEqual(['Ranger · Mon 20 Jul / ~~Posted out · now SANS~~ · taken back · Saber'])
  })
  it('12: off the manpower undone, then set again for the same date — the line comes back UNREAD for the admin told it was taken back', () => {
    const id = noSignIn()
    expect(postOut(id, PO, false)).toBe(true)
    reach()
    hexReads()
    expect(undoPostOut(id)).toBe(true)
    expect(postOut(id, PO, false)).toBe(true)
    signInAs('hex')
    const line = allNoticesFor('rocky').find(n => (n.what || [])[0]?.k === 'po')!
    expect(line, 'the posting’s line is back').toBeTruthy()
    expect(isUnread(line, 'rocky'), 'unread: the new posting lights his bell').toBe(true)
  })
  it('an older posting from an earlier stint keeps its line when the new one is undone', () => {
    expect(postOut('bane', PO, 'overseas')).toBe(true)
    reach(); runPoOutcomes()
    hexReads()
    expect(restoreArchivedPerson('bane', '2026-07-22')).toBe(true)   // back on Admin → Users: a new stint
    reach(23)
    expect(postOut('bane', '2026-07-23', 'sans')).toBe(true)
    runPoOutcomes()
    signInAs('ad', 'a')
    expect(undoPostOut('bane')).toBe(true)
    expect(poLines('rocky').map(words), 'the first posting ran: its record stays').toEqual(['Ranger · Mon 20 Jul / Posted out · archived, account suspended'])
  })
})

/* THE READS' FINDINGS (5 Nov 26 — docs/handpass/parts/tb1105/read-security.md S1, read-code.md 2) */
describe('the reads’ findings', () => {
  it('security S1: an admin who read his line and is a member since gets no "taken back" line — his line still goes', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    reach(); runPoOutcomes()
    hexReads()
    expect(updateAccount('achex', { role: 'main' })).toBeNull()
    expect(undoPostOut('bane')).toBe(true)
    expect(poLines('rocky'), 'his posting line went').toEqual([])
    expect(backLines('rocky'), 'no line to a man who is no longer an admin').toEqual([])
  })
  it('the fixes read 1: an admin whose sign-in is suspended is still an admin — he gets his "taken back" line', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    reach(); runPoOutcomes()
    hexReads()
    expect(updateAccount('achex', { on: false })).toBeNull()
    expect(undoPostOut('bane')).toBe(true)
    expect(poLines('rocky')).toEqual([])
    expect(backLines('rocky').map(drawn)).toEqual(['Ranger · Mon 20 Jul / ~~Posted out · now SANS~~ · taken back · Saber'])
  })
  it('code read 2: the admin who pressed Undo, having read the worked-out line, sees it UNREAD when the posting is set again', () => {
    const id = noSignIn()
    expect(postOut(id, PO, false)).toBe(true)
    reach()
    expect(markAllNoticesRead(), 'Saber reads his own "off the manpower" line').toBe(true)
    expect(undoPostOut(id)).toBe(true)
    expect(backLines('stiff'), 'he pressed it, his line read: still told nothing (D1693)').toEqual([])
    signInAs('hex')
    expect(postOut(id, PO, false)).toBe(true)                    // Hex sets it again, the same date
    signInAs('ad', 'a')
    const line = allNoticesFor('stiff').find(n => (n.what || [])[0]?.k === 'po')!
    expect(line, 'the posting’s line is back in Saber’s bell').toBeTruthy()
    expect(isUnread(line, 'stiff'), 'unread: it lights his bell again').toBe(true)
  })
})

describe('no SANS for ground crew (his D1709, 5 Nov 26)', () => {
  it('the posting writer refuses SANS for a ground-crew man; his other outcomes stand', () => {
    const g = Object.keys(PEOPLE).find(id => (P(id).pers || P(id).seat === 'GND') && !P(id).archived && !P(id).special && getState().people.some(p => p.id === id))!
    expect(g, 'a ground-crew man on the war').toBeTruthy()
    expect(postOut(g, PO, 'sans'), 'refused').toBe(false)
    expect(getState().postOuts[g]?.to ?? null, 'nothing written').toBeNull()
    expect(postOut(g, PO, 'overseas'), 'Overseas Sqn still his').toBe(true)
  })
})

describe('the member view (D292) and a taken-back line', () => {
  it('an admin in his member view: the taken-back line is neither listed nor counted; back as admin it is there, unread', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    reach(); runPoOutcomes()
    hexReads()
    expect(undoPostOut('bane')).toBe(true)
    signInAs('hex')
    expect(backLines('rocky')).toHaveLength(1)
    switchRoleView()
    expect(noticesFor('rocky').filter(n => (n.what || [])[0]?.k === 'poback'), 'not listed').toEqual([])
    expect(unreadFor('rocky'), 'not counted').toBe(0)
    switchRoleView()
    expect(noticesFor('rocky').filter(n => (n.what || [])[0]?.k === 'poback')).toHaveLength(1)
    expect(unreadFor('rocky')).toBe(1)
  })
})

/* [PO-CHANGE-RETRACT] — A POSTING THAT RAN, THEN CHANGED ON ITS POST OUT SHEET (his D1710, 5 Nov 26 — "As recommended" to
   the take-back look page's Q4; found by the take-back code read, docs/handpass/parts/tb1105/read-code.md 1). Its date moved
   or another outcome chosen, it no longer stands as it ran: its bell lines are taken back as the sheet's Undo takes them —
   a read line struck through and "taken back · Saber", unread; an unread one simply goes; Saber, who changed it, is told
   nothing — and the changed posting tells again when it runs. */
describe('a posting that ran, then changed on its Post out sheet (his D1710)', () => {
  const plain = (pid: string) => allNoticesFor(pid).filter(n => (n.what || [])[0]?.k === 'po')
  it('its date moved to a day still to come: the line is taken back, and it tells again on the new date', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    reach(); runPoOutcomes()
    hexReads()
    expect(postOut('bane', '2026-07-25', 'sans')).toBe(true)
    expect(P('bane').san, 'no longer SANS today').toBeFalsy()
    expect(poLines('rocky'), 'no "Posted out" line left standing').toEqual([])
    expect(backLines('rocky').map(drawn)).toEqual(['Ranger · Mon 20 Jul / ~~Posted out · now SANS~~ · taken back · Saber'])
    expect(unreadFor('rocky')).toBe(1)
    expect(poLines('stiff'), 'Saber changed it: his line goes').toEqual([])
    expect(backLines('stiff'), '…and he is told nothing').toEqual([])
    reach(25); runPoOutcomes()
    expect(poLines('rocky').map(words), 'the changed posting tells again when it runs').toEqual(['Ranger · Sat 25 Jul / Posted out · now SANS'])
    expect(isUnread(poLines('rocky')[0]!, 'rocky')).toBe(true)
  })
  it('another outcome on the same date (SANS → none): an unread line simply goes; the "off the manpower" line comes, unread', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    reach(); runPoOutcomes()
    expect(postOut('bane', PO, 'none')).toBe(true)
    expect(poLines('rocky'), 'the "now SANS" line went').toEqual([])
    expect(backLines('rocky'), 'he had not read it: no "taken back" line').toEqual([])
    expect(plain('rocky').map(words)).toEqual(['Ranger · Mon 20 Jul / Posted out · off the manpower'])
    expect(isUnread(plain('rocky')[0]!, 'rocky')).toBe(true)
  })
  it('another outcome on the same date (Overseas Sqn → SANS), read: taken back; the new outcome runs and tells, unread', () => {
    expect(postOut('bane', PO, 'overseas')).toBe(true)
    reach(); runPoOutcomes()
    hexReads()
    expect(postOut('bane', PO, 'sans')).toBe(true)
    runPoOutcomes()
    expect(P('bane').archived, 'the archive lifted').toBeFalsy()
    expect(P('bane').san, 'made SANS on his date').toBe(true)
    expect(backLines('rocky').map(drawn)).toEqual(['Ranger · Mon 20 Jul / ~~Posted out · archived, account suspended~~ · taken back · Saber'])
    expect(poLines('rocky').map(words)).toEqual(['Ranger · Mon 20 Jul / Posted out · now SANS'])
    expect(unreadFor('rocky'), 'both lines unread').toBe(2)
  })
  it('off the manpower, read, its date moved: the worked-out line is taken back', () => {
    const id = noSignIn()
    expect(postOut(id, PO, false)).toBe(true)
    reach(23)
    hexReads()
    expect(postOut(id, '2026-07-27', false)).toBe(true)
    expect(plain('rocky'), 'no line until the new date').toEqual([])
    expect(backLines('rocky').map(drawn)).toEqual([`${P(id).cs} · Mon 20 Jul / ~~Posted out · off the manpower~~ · taken back · Saber`])
  })
  it('saved again unchanged, or a posting that has not run moved: no bell is touched', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    reach(); runPoOutcomes()
    hexReads()
    expect(postOut('bane', PO, 'sans')).toBe(true)
    expect(poLines('rocky')).toHaveLength(1)
    expect(backLines('rocky')).toEqual([])
    const id = noSignIn()                                          // a posting still to come, moved: it made no line
    expect(postOut(id, '2026-07-30', 'overseas')).toBe(true)
    expect(postOut(id, '2026-07-31', 'sans')).toBe(true)
    expect(backLines('rocky')).toEqual([])
    expect(backLines('stiff')).toEqual([])
  })
})

/* THE FIX'S OWN READ (5 Nov 26 — docs/handpass/parts/tb1105/read-pcr.md): a posting's lines are the lines IT wrote when it
   ran — never every line since his stint began, which a Restore on the posting's own date leaves open (the stint reopened,
   no boundary) — and the store's "has run" test reads the saved posting, not how the grid shows him with "+ SANS" on. */
describe('the fix’s own read (his D1710)', () => {
  const restoredOnItsDay = () => {
    expect(postOut('bane', PO, 'overseas')).toBe(true)
    reach(); runPoOutcomes()
    hexReads()
    expect(restoreArchivedPerson('bane', PO), 'restored on the day the posting ran: his stint reopened').toBe(true)
  }
  it('1: a posting not yet run, moved, takes back nothing — an earlier posting’s line stays as its record', () => {
    restoredOnItsDay()
    expect(postOut('bane', '2026-08-03', 'sans')).toBe(true)
    expect(postOut('bane', '2026-08-10', 'sans')).toBe(true)
    expect(backLines('rocky')).toEqual([])
    expect(poLines('rocky').map(words)).toEqual(['Ranger · Mon 20 Jul / Posted out · archived, account suspended'])
  })
  const secondRan = () => {
    restoredOnItsDay()
    reach(23)
    expect(postOut('bane', '2026-07-23', 'sans')).toBe(true)
    runPoOutcomes()
    hexReads()
  }
  it('2: the next posting, run, then moved: only its own line is taken back', () => {
    secondRan()
    expect(postOut('bane', '2026-07-28', 'sans')).toBe(true)
    expect(poLines('rocky').map(words)).toEqual(['Ranger · Mon 20 Jul / Posted out · archived, account suspended'])
    expect(backLines('rocky').map(drawn)).toEqual(['Ranger · Thu 23 Jul / ~~Posted out · now SANS~~ · taken back · Saber'])
  })
  it('2: the next posting, run, then undone: only its own line is taken back', () => {
    secondRan()
    expect(undoPostOut('bane')).toBe(true)
    expect(poLines('rocky').map(words)).toEqual(['Ranger · Mon 20 Jul / Posted out · archived, account suspended'])
    expect(backLines('rocky').map(drawn)).toEqual(['Ranger · Thu 23 Jul / ~~Posted out · now SANS~~ · taken back · Saber'])
  })
  it('3: with "+ SANS" on, a ran SANS posting saved again unchanged runs and tells nothing again', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    reach(); runPoOutcomes()
    hexReads()
    expect(setShowSans(true)).toBe(true)
    expect(postOut('bane', PO, 'sans')).toBe(true)
    runPoOutcomes()
    expect(poLines('rocky')).toHaveLength(1)
    expect(backLines('rocky')).toEqual([])
    expect(unreadFor('rocky')).toBe(0)
  })
  it('a ran posting moved to another day already come: one command — the old line taken back, the new one told, unread', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    reach(23); runPoOutcomes()
    hexReads()
    const from = commandStream().length
    expect(postOut('bane', '2026-07-22', 'sans')).toBe(true)
    runPoOutcomes()
    expect(commandStream().slice(from).map(e => e.type)).toEqual(['lw.postout'])
    expect(backLines('rocky').map(drawn)).toEqual(['Ranger · Mon 20 Jul / ~~Posted out · now SANS~~ · taken back · Saber'])
    expect(poLines('rocky').map(words)).toEqual(['Ranger · Wed 22 Jul / Posted out · now SANS'])
    expect(unreadFor('rocky')).toBe(2)
  })
  it('the admin who changed it, having read its line: the "off the manpower" line it now makes comes to him unread', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    reach(); runPoOutcomes()
    expect(markAllNoticesRead()).toBe(true)
    expect(postOut('bane', PO, 'none')).toBe(true)
    const line = allNoticesFor('stiff').find(n => (n.what || [])[0]?.k === 'po')!
    expect(words(line)).toBe('Ranger · Mon 20 Jul / Posted out · off the manpower')
    expect(isUnread(line, 'stiff')).toBe(true)
  })
})

/* THE FIX ROUND'S NARROW READ (5 Nov 26 — docs/handpass/parts/tb1105/read-pcr-fixes.md 1, 2) */
describe('the fix round’s narrow read', () => {
  it('1: restored on its own day, then posted again for the same date and outcome: Undo takes back only the second run’s lines', () => {
    expect(postOut('bane', PO, 'overseas')).toBe(true)
    reach(); runPoOutcomes()
    hexReads()
    expect(restoreArchivedPerson('bane', PO)).toBe(true)
    vi.setSystemTime(new Date(2026, 6, 21, 9, 5, 0))            // a later moment: the second run is its own
    expect(postOut('bane', PO, 'overseas')).toBe(true)
    runPoOutcomes()
    hexReads()
    expect(poLines('rocky'), 'two runs, two lines').toHaveLength(2)
    expect(undoPostOut('bane')).toBe(true)
    expect(poLines('rocky').map(words), 'the first posting’s line stays as its record').toEqual(['Ranger · Mon 20 Jul / Posted out · archived, account suspended'])
    expect(backLines('rocky')).toHaveLength(1)
  })
  it('2: "+ SANS" on, a post-in on a man whose SANS posting ran keeps the posting; a post-in after it is refused, and the sheet says why', () => {
    expect(postOut('bane', PO, 'sans')).toBe(true)
    reach(); runPoOutcomes()
    expect(setShowSans(true)).toBe(true)
    expect(postingProblem('bane', 'in', '2026-08-01'), 'the sheet’s sentence and the writer agree').toMatch(/post-in has to be before/)
    expect(setPostIn('bane', '2026-08-01'), 'after his posting: refused').toBe(false)
    expect(setPostIn('bane', '2026-01-05')).toBe(true)
    expect(getState().postOuts['bane']?.to, 'the ran posting kept').toBe('2026-07-19')
    expect(getState().postOuts['bane']?.poDone).toBe('2026-07-20')
    expect(getState().postOuts['bane']?.from).toBe('2026-01-05')
    expect(undoPostOut('bane'), 'still undoable').toBe(true)
    expect(P('bane').san, 'and its SANS tick taken back').toBeFalsy()
  })
})
