// @vitest-environment jsdom
/* Fix read 8 (19 Nov 26) — the faults the four readers found in fix read 7's code (the builder's brief:
   docs/superpowers/briefs/2026-11-19-multi-sqn-b1-fixread8-fixes-brief.md). Each describe is one fault, red first on the
   code the readers read (71fdfbfd5). Hunter (142's plain admin, `ad2`) files LL for Ranger (142, `us`) on 15 Jul; Saber
   is the master (`ad`); Kestrel and Osprey are 149's (`ad9`, `us9`). Harness as leavewar/multi-sqn-fixread7.test.ts. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS, store } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputsBatch } from '../state/store'
import { accountsLoad, signIn, sessionFor, setMaster, updateAccount, ACCOUNTS_LIST } from '../state/accounts'
import { initStore as lwInitStore, setPeople } from './state/store'
import { ownershipViolation } from '../state/perms'
import { deriveActor } from '../command/actor'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor } from './sync'
import { unitsLoad, setGrant, unitRows } from '../state/units'
import { HOME_PFX, GRANT_PFX } from '../state/units-model'
import { INPUTS } from '../engine/inputs'
import { NOTICES, noticesFor, noticeLeftBell, notePassMade, type Notice } from '../state/notices'
import { onCommit } from '../command'
import { noticeSeenLoad } from '../state/noticeseen'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline, globalRedo } from '../undo/timeline'
import { globalUndo } from '../undo'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
let worlds: Record<string, any> = {}

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  PEOPLE0 = JSON.stringify(PEOPLE)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null; setWarWorldDoor(null) })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v }, keys: () => Object.keys(mem) } as any
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  for (let i = INPUTS.length - 1; i >= 0; i--) if (String((INPUTS as any)[i].iid || '').startsWith('ipd')) INPUTS.splice(i, 1)
  worlds = { u142: memoryBackend(), u149: memoryBackend() }
  setWarWorldDoor(null)
  lwInitStore(worlds.u142)
  raptorInitStore()
  NOTICES.splice(0)
  accountsLoad()
  noticeSeenLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  setWarWorldDoor((u: string) => ({ backend: worlds[u] ?? (worlds[u] = memoryBackend()) }))
  _resetTimeline(); installGlobalUndo()
  vi.spyOn(HOOKS, 'toast').mockImplementation(() => {})
})

const IID = 'ipd-fr8'
const fileFor = (who: string, filer: string, date = 'Jul 25', endDate?: string) => expect(writeInputsBatch(() => { INPUTS.push({ person: who, date, ...(endDate ? { endDate } : {}), yr: 2026, allday: true, type: 'LL', remarks: 'for him', by: filer, at: Date.now(), iid: IID, ord: 99981 } as any) })).toBe(true)
const rmk = (words: string) => expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = words })).toBe(true)
const theInput = () => INPUTS.find((x: any) => x.iid === IID) as any
/* a man's home rows, as state/units.ts setHome saves them: [unit, from] in order (the first covers every day before it) */
const homes = (pid: string, key: string, rows: [string, string][]) => {
  rows.forEach(([unit, from], i) => { mem['sqn142_' + HOME_PFX + key + i] = JSON.stringify({ id: key + i, pid, unit, from }) })
  unitsLoad()
}
const on = (d: number, h = 9, m = 0) => { vi.setSystemTime(new Date(2026, 6, d, h, m, 0)); unitsLoad() }
const lineTo = (pid: string): Notice | undefined => NOTICES.find(n => n.to === pid && n.iid === IID)
const env = (changes: any[], origin = 'user', type = 'inputs.batch'): any => ({ type, origin, actor: deriveActor(), changes })
const readIt = (pid: string, l: Notice) => { mem[`sqn142_noticeseen:${pid}`] = JSON.stringify({ upto: 0, ids: [l.id] }); noticeSeenLoad() }
const shown = (pid: string, id: string) => noticesFor(pid).some(n => n.id === id)
/* (HIS BELL'S SWITCH — batch 1's second half §7 item 3, §16 D5′; D2198: once a master admin's home is 149, 142's lines not
   about him are off on his bell by default. These tests are about the move's rule, so the old squadron is switched on, as
   he would switch it, before the line is looked for) */
const bellOn = (pid: string, u: string) => { const k = `bellsqn:${pid}`; const v: any = store.get(k, null) || {}; store.set(k, { ...v, [u]: true }) }
/* Outlaw (`casper`) as a plain 142 admin — as the gate reads an actor (fix read 7's harness) */
const outlaw = { id: 'acoutlaw', role: 'admin', personId: 'casper', session: null }
const asOutlaw = (changes: any[], type = 'inputs.batch'): any => ({ type, origin: 'user', actor: outlaw, changes })
/* …and made one on his account too, where the gate's unit-row check reads the account list (Fable's harness remark) */
const outlawReal = () => { signInAs('ad2', 'a2'); expect(updateAccount('acoutlaw', { role: 'admin' })).toBeNull() }
/* his remark change of the LL, as a change of the input */
const remarkChange = (words = 'Outlaw words') => { const now = { ...theInput() }; return { collection: 'inputs', id: IID, op: 'put', before: now, after: { ...now, remarks: words } } }
const put = (n: any) => ({ collection: 'notices', id: n.id, op: 'put', before: null, after: n })
/* Hunter files for Ranger; Saber's change on 15 Jul tells him (filer only, marked 142) */
const hunterLine = (): Notice => {
  signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
  signInAs('ad', 'a'); rmk('changed by Saber on the 15th')
  const l = lineTo('prowler')!
  expect(l?.fu, 'Hunter told as its filer').toEqual(['u142'])
  return l
}
const hunterMovesOn16 = () => homes('prowler', 'hc', [['u142', '2026-07-15'], ['u149', '2026-07-16']])

describe('fault R — a filer who has moved is not told again, and his old line leaves (his D2218, D2223, D2225)', () => {
  /* Ranger's LL 23–27 Jul; Ranger's move to 149 saved from 25 Jul */
  const rangerMovesOn25 = () => homes('bane', 'hrq', [['u142', '2026-07-15'], ['u149', '2026-07-25']])
  /* CHANGED BY HIS D2228 (fix read 13, item C, 20 Nov 26): Ranger is 149's on 25–27 Jul, and Hunter, moved to 149, is its
     admin — "that man's admin" again on the input's own days — so he is told, through 149 only (D2223 narrowed). This
     test said "not told" before; the line from before his move still leaves (Q-2, below). */
  it('(Opus Q-1, D2228) Hunter, 149’s admin from 16 Jul, is told on 17 Jul of Saber’s change — through 149, Ranger’s on 25–27 Jul', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler', 'Jul 23', 'Jul 27')
    rangerMovesOn25(); hunterMovesOn16(); on(17)
    signInAs('ad', 'a'); expect(updateAccount('acad2', { role: 'admin' }), 'setup (K3, D2160): he joined as a member — made an admin of his new squadron first').toBeNull(); rmk('Saber words')
    expect(lineTo('prowler')?.fu, 'Hunter, an admin of Ranger’s squadron on 25–27 Jul, told through it alone').toEqual(['u149'])
  })
  it('(Opus Q-2) the line Hunter got on 15 Jul, before his move, leaves his bell on his move', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler', 'Jul 23', 'Jul 27')
    rangerMovesOn25()
    signInAs('ad', 'a'); rmk('Saber words')
    const l = lineTo('prowler')!
    expect(l, 'told on the 15th').toBeDefined()
    hunterMovesOn16(); on(17)
    expect(shown('prowler', l.id), 'his old squadron’s line left on his move (D2218)').toBe(false)
    expect(l.fu, 'marked with the squadron he was told through: his home').toEqual(['u142'])
  })
  it('(control) a master filer is still told after his move, through the mark', () => {
    signInAs('ad', 'a'); fileFor('bane', 'stiff')
    homes('stiff', 'hs8', [['u142', '2026-07-15'], ['u149', '2026-07-16']]); on(16)
    signInAs('ad2', 'a2'); rmk('Hunter words')
    expect(lineTo('stiff')?.fu, 'Saber told as master').toEqual(['u142'])
  })
})

describe('fault D — a right given ON the move day never brings the retired line back', () => {
  for (const read of [false, true]) {
    it(`(Fable 2, Opus 2) Plan of 142 given on 16 Jul, his move day: the ${read ? 'read' : 'unread'} line stays off`, () => {
      const l = hunterLine(); if (read) readIt('prowler', l)
      hunterMovesOn16(); on(16)
      expect(shown('prowler', l.id), 'retired by his move').toBe(false)
      signInAs('ad', 'a')
      expect(updateAccount('acad2', { role: 'admin' }), 'setup (K3, D2160): he joined as a member — made an admin of his new squadron first').toBeNull(); expect(setGrant('acad2', 'u142', 'admin', 'prowler').ok).toBe(true)
      expect(shown('prowler', l.id), 'still off after Plan given on his move day').toBe(false)
    })
    it(`(Fable 2, Opus 2) master mark set on 16 Jul, his move day: the ${read ? 'read' : 'unread'} line stays off`, () => {
      const l = hunterLine(); if (read) readIt('prowler', l)
      hunterMovesOn16(); on(16)
      expect(shown('prowler', l.id)).toBe(false)
      signInAs('ad', 'a')
      expect(setMaster('acad2', true).ok).toBe(true)
      expect(shown('prowler', l.id), 'still off after the master mark set on his move day').toBe(false)
    })
  }
  /* (§4.5 of the reshape plan, rewrite 4 — the master-mark half kept: a master admin's reach is no right and is not ended
     (D2203's reading); a Plan held before his move day ends with it — his D2203, D2243 (Q4) — so its line is retired) */
  it('(control) the master mark set the day before his move keeps the line; Plan held from then ends with the move', () => {
    bellOn('prowler', 'u142')
    const l = hunterLine()
    signInAs('ad', 'a'); expect(setMaster('acad2', true).ok).toBe(true)
    hunterMovesOn16(); on(17)
    expect(shown('prowler', l.id), 'a master on his move day: still told').toBe(true)
    signInAs('ad', 'a'); on(17); expect(setMaster('acad2', false).ok).toBe(true)
    mem['sqn142_' + GRANT_PFX + 'gfr8d'] = JSON.stringify({ id: 'gfr8d', account: 'acad2', unit: 'u142', level: 'admin', from: '2026-07-15' }); unitsLoad()
    expect(shown('prowler', l.id), 'Plan of 142 from the day before ended with his move: the line retired').toBe(false)
  })
})

describe('fault G — the gate checks a grant’s day and the master mark’s day', () => {
  /* Hunter's line retired by his move to 149; on the 18th a plain 142 admin gives him Plan of 142 */
  const grantPut = (g: any, before: any = null) => asOutlaw([{ collection: 'settings', id: GRANT_PFX + g.id, op: 'put', before, after: g }], 'grant.set')
  for (const from of [undefined, '2026-01-01']) {
    it(`(Fable 1, SEC8-3, Opus 3) a new grant ${from ? 'back-dated to ' + from : 'with no day'} is refused`, () => {
      const l = hunterLine(); outlawReal()
      hunterMovesOn16(); on(18)
      expect(shown('prowler', l.id)).toBe(false)
      const g: any = { id: 'gfr8g', account: 'acad2', unit: 'u142', level: 'admin', ...(from ? { from } : {}) }
      expect(ownershipViolation(grantPut(g)) ?? 'allowed').toMatch(/not dated today/)
    })
  }
  it('(Fable 1 step 1) a grant of the same level re-dated is refused; its level changed must be dated today', () => {
    outlawReal(); hunterMovesOn16(); on(18)
    const was = { id: 'gfr8h', account: 'acad2', unit: 'u142', level: 'view', from: '2026-07-17' }
    mem['sqn142_' + GRANT_PFX + 'gfr8h'] = JSON.stringify(was); unitsLoad()
    expect(ownershipViolation(grantPut({ ...was, from: '2026-01-01' }, was)) ?? 'allowed').toMatch(/not dated today/)
    /* (RE-POINTED AT U2: raised to Plan, Hunter — moved to 149, a member there in force (K3, D2160) — is now refused first
       as a Plan on a member's account, the gate's receiver check reading the role in force after the command; the "not
       dated today" rule stays pinned by the re-dated View above and the new rows of the two tests before) */
    expect(ownershipViolation(grantPut({ ...was, level: 'admin' }, was)) ?? 'allowed').toMatch(/Plan on an account that is not an admin's/)
    /* (§9.3 of the reshape plan — rewritten to the ruling's outcome: raised to Plan, even dated today, refused — since U2
       first as the same receiver's) */
    expect(ownershipViolation(grantPut({ ...was, level: 'admin', from: '2026-07-18' }, was))).toMatch(/Plan on an account that is not an admin's/)
  })
  it('(Fable 1 step 2) a master’s master mark back-dated is refused', () => {
    hunterMovesOn16(); on(18)
    signInAs('ad', 'a')
    /* the account list stored first, so the one row below is all the command changes */
    expect(setMaster('acad2', true).ok).toBe(true); expect(setMaster('acad2', false).ok).toBe(true)
    const b = { ...ACCOUNTS_LIST.find(a => a.id === 'acad2')! }
    const e = env([{ collection: 'settings', id: 'account:acad2', op: 'put', before: b, after: { ...b, master: true, masterFrom: '2000-01-01' } }], 'user', 'account.master')
    expect(ownershipViolation(e) ?? 'allowed').toMatch(/not dated today/)
    /* …nor a day written with the mark off */
    const e2 = env([{ collection: 'settings', id: 'account:acad2', op: 'put', before: b, after: { ...b, masterFrom: '2026-07-18' } }], 'user', 'account.update')
    expect(ownershipViolation(e2) ?? 'allowed').toMatch(/not dated today/)
  })
  it('(control) the real setGrant and setMaster pass, and the Undo and Redo of each, a day later', () => {
    hunterMovesOn16(); on(18)
    signInAs('ad', 'a')
    expect(updateAccount('acad2', { role: 'admin' }), 'setup (K3, D2160): he joined as a member — made an admin of his new squadron first').toBeNull(); expect(setGrant('acad2', 'u142', 'admin', 'prowler').ok).toBe(true)
    expect(unitRows().grants.find(g => g.account === 'acad2')?.from).toBe('2026-07-18')
    on(19)
    expect(globalUndo().ok, 'Undo of the grant').toBe(true)
    expect(unitRows().grants.some(g => g.account === 'acad2')).toBe(false)
    const r = globalRedo(); expect(r.ok, 'Redo of the grant: ' + JSON.stringify(r)).toBe(true)
    /* fix read 9, fault A: a Redo that turns a right back on dates it the day it is pressed (was: its recorded day) —
       NARROWED by fix read 10, fault E: only where its man has moved since its Undo; Hunter's move (16 Jul) came before
       the grant (18 Jul) and its Undo (19 Jul), so the Redo puts back the day it recorded */
    expect(unitRows().grants.find(g => g.account === 'acad2')?.from, 'given back with no move since its Undo: its own day').toBe('2026-07-18')
    expect(setMaster('acad2', true).ok).toBe(true)
    on(20)
    expect(globalUndo().ok, 'Undo of the mark').toBe(true)
    const r2 = globalRedo(); expect(r2.ok, 'Redo of the mark: ' + JSON.stringify(r2)).toBe(true)
    expect(ACCOUNTS_LIST.find(a => a.id === 'acad2')?.masterFrom, 'given back with no move since its Undo: its own day (fix read 10, fault E)').toBe('2026-07-19')
  })
})

describe('fault N — a line dated past midnight, written in the last minutes before a move, is refused', () => {
  const at = (d: number, h: number, m: number) => new Date(2026, 6, d, h, m, 0).getTime()
  it('(SEC8-1) Outlaw at 23:57 on 15 Jul: a plain line and a marked filer line dated 00:01 on the 16th are refused', () => {
    hunterLine(); hunterMovesOn16(); on(15, 23, 57)
    const plain = { id: 'nfr8-p', to: 'prowler', by: 'casper', iid: '', name: '142 words', day: '2026-07-25', what: [{ k: 'rmk' }] }
    /* (stamped with the input's squadron, as the pass stamps it — batch 1's second half, §7 item 1) */
    const marked = { id: 'nfr8-m', to: 'prowler', by: 'casper', iid: IID, name: 'LL', day: '2026-07-25', what: [{ k: 'rmk' }], fu: ['u142'], u: 'u142' }
    /* (the plain line, naming no input, is refused since fix read 10's fault A whatever its date — no change of the war owes
       it; the marked line still pins the date) */
    expect(ownershipViolation(asOutlaw([put({ ...plain, at: at(16, 0, 1) })])) ?? 'allowed').toMatch(/about nothing the command changed/)
    expect(ownershipViolation(asOutlaw([remarkChange(), put({ ...marked, at: at(16, 0, 1) })])) ?? 'allowed').toMatch(/not dated now/)
    /* (control) the marked line dated 23:57 passes */
    expect(ownershipViolation(asOutlaw([put({ ...plain, at: at(15, 23, 57) })])) ?? 'allowed').toMatch(/about nothing the command changed/)
    expect(ownershipViolation(asOutlaw([remarkChange(), put({ ...marked, at: at(15, 23, 57) })]))).toBeNull()
  })
  it('(SEC8-1, a member) Ranger at 23:57: his lines to Hunter (marked) and to Ace (named) dated 00:01 are refused', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
    hunterMovesOn16(); on(15, 23, 57)
    signInAs('us', 'us')
    const now = { ...theInput() }
    const ch = { collection: 'inputs', id: IID, op: 'put', before: now, after: { ...now, remarks: 'Ranger words' } }
    /* (each stamped with its input's squadron, as the pass stamps it — batch 1's second half, §7 item 1) */
    const toHunter = { id: 'nfr8-mh', to: 'prowler', by: 'bane', iid: IID, name: 'LL', day: '2026-07-25', what: [{ k: 'rmk' }], fu: ['u142'], u: 'u142' }
    expect(ownershipViolation(env([ch, put({ ...toHunter, at: at(16, 0, 1) })])) ?? 'allowed').toMatch(/not dated now/)
    expect(ownershipViolation(env([ch, put({ ...toHunter, at: at(15, 23, 57) })]))).toBeNull()
    /* Ranger's Training for Ace, its remark changed, his line to Ace (named in it: no mark) */
    const tr = { person: 'dj', date: 'Jul 25', yr: 2026, s: '09:00', e: '10:00', type: 'Training', remarks: 'for Ace', by: 'bane', at: Date.now(), iid: 'ipd-fr8t', ord: 99982 }
    const ch2 = { collection: 'inputs', id: 'ipd-fr8t', op: 'put', before: tr, after: { ...tr, remarks: 'new words' } }
    const toAce = { id: 'nfr8-ma', to: 'dj', by: 'bane', iid: 'ipd-fr8t', name: 'Training', day: '2026-07-25', what: [{ k: 'rmk' }], u: 'u142' }
    expect(ownershipViolation(env([ch2, put({ ...toAce, at: at(16, 0, 1) })])) ?? 'allowed').toMatch(/not dated now/)
    expect(ownershipViolation(env([ch2, put({ ...toAce, at: at(15, 23, 57) })]))).toBeNull()
  })
})

describe('fault H — a holiday-shaped line naming an input goes through fault M’s checks', () => {
  it('(SEC8-2) Outlaw’s oilhol line to Hunter naming an input that does not exist is refused; to a 149 man too', () => {
    const n: any = { id: 'nfr8-hol', to: 'prowler', by: 'casper', at: Date.now(), iid: 'ipd-nowhere', name: '142 words', day: '2026-07-25', what: [{ k: 'oilhol', a: '2026-07-25', b: '2026-07-25' }] }
    expect(ownershipViolation(asOutlaw([put(n)])) ?? 'allowed').toMatch(/not as the pass writes it/)
    expect(ownershipViolation(asOutlaw([put({ ...n, id: 'nfr8-hol9', to: 'osp9' })])) ?? 'allowed').toMatch(/another squadron/)
  })
  it('(control) a line in the holiday’s shape crosses only as noticeHoliday mints it in the command (fix read 10, fault B)', () => {
    /* (merely put, it is judged as any line; the app's own, through a real command, is pinned by fix read 9's control and
       fix read 10's fault B control) */
    const n: any = { id: 'nfr8-holok', to: 'osp9', by: 'casper', at: Date.now(), iid: '', name: 'National Day', day: '2026-08-09', what: [{ k: 'oilhol', a: '2026-08-09', b: '2026-08-09' }] }
    expect(ownershipViolation(asOutlaw([put(n)])) ?? 'allowed').toMatch(/another squadron/)
    expect(ownershipViolation(asOutlaw([put({ ...n, id: 'nfr8-holok2', to: 'prowler' })])) ?? 'allowed').toMatch(/a war line no war command wrote/)
  })
})

describe('fault B — a line dated ahead stays on the bell of a man who never moved', () => {
  it('(Opus probe T) Ranger’s own line dated 10 minutes ahead (a clock set back) has not left his bell', () => {
    const n: any = { id: 'nx', to: 'bane', by: 'prowler', at: Date.now() + 10 * 60 * 1000, iid: IID, name: 'LL', day: '2026-07-25', what: [{ k: 'in' }] }
    expect(noticeLeftBell(n)).toBe(false)
    /* …nor his squadron's business, bidding opened, dated ahead */
    const open: any = { id: 'ny', to: 'bane', by: 'prowler', at: Date.now() + 10 * 60 * 1000, iid: '', name: 'JAN – DEC 26', day: '2026-07-25', what: [{ k: 'lwopen', a: '2026-08-01', b: '2026-08-31' }] }
    expect(noticeLeftBell(open)).toBe(false)
  })
  it('(Opus 4) a moved man’s line about his own leave dated ahead is not "left" either; a marked one is', () => {
    hunterMovesOn16(); on(17)
    const own: any = { id: 'nz', to: 'prowler', by: 'stiff', at: Date.now() + 10 * 60 * 1000, iid: 'ipd-x', name: 'LL', day: '2026-07-25', what: [{ k: 'in' }] }
    expect(noticeLeftBell(own)).toBe(false)
    expect(noticeLeftBell({ ...own, what: [{ k: 'rmk' }], fu: ['u142'] })).toBe(true)
  })
})

describe('fault W — a bare input write the resync takes up is told by nobody, and the registry vouches only for a changed input', () => {
  /* Ranger (142 member) files a Training for Ace; Hunter, outside every command, puts Ranger in it in Ace's place; then
     Hunter saves an unrelated leave of his own */
  const aceTraining = () => { signInAs('us', 'us'); expect(writeInputsBatch(() => { INPUTS.push({ person: 'dj', date: 'Jul 25', yr: 2026, s: '09:00', e: '10:00', type: 'Training', remarks: 'for Ace', by: 'bane', at: Date.now(), iid: IID, ord: 99981 } as any) })).toBe(true) }
  const ownLeave = () => expect(writeInputsBatch(() => { INPUTS.push({ person: 'prowler', date: 'Jul 28', yr: 2026, allday: true, type: 'LL', remarks: 'own', by: 'prowler', at: Date.now(), iid: 'ipd-own', ord: 99982 } as any) })).toBe(true)
  it('(SEC8-5) the unrelated save commits no line about Ace’s input', () => {
    aceTraining(); signInAs('ad2', 'a2')
    const seen: any[] = []; const off = onCommit((e: any) => { seen.push(e) })
    try {
      ;(theInput() as any).person = 'bane'                                     // the bare write, outside every command
      ownLeave()
    } finally { off() }
    const all = seen.flatMap(e => e.changes)
    const line = all.find((c: any) => c.collection === 'notices' && c.after?.iid === IID)
    const inputCh = all.some((c: any) => c.collection === 'inputs' && c.id === IID)
    expect(!!line && !inputCh, 'a line about an input change no envelope carries').toBe(false)
    /* (Ace's line from Ranger's own filing stands — it is Hunter's name that must not be on one) */
    expect(NOTICES.some(n => n.iid === IID && n.by === 'prowler' && (n.to === 'bane' || n.to === 'dj')), 'Ranger and Ace told nothing in Hunter’s name').toBe(false)
  })
  it('(SEC8-5, the gate) a line the pass made naming an input the command does not change is refused', () => {
    hunterLine()
    const n = { id: 'nfr8-w', to: 'prowler', by: 'casper', at: Date.now(), iid: 'ipd-nowhere', name: 'LL', day: '2026-07-25', what: [{ k: 'in' }] }
    const e = asOutlaw([put(n)])
    notePassMade(e, new Set([n.id]))
    expect(ownershipViolation(e) ?? 'allowed').toMatch(/not as the pass writes it/)
  })
  it('(control) an honest change tells as before; one changing the input a bare write touched tells of its own change', () => {
    aceTraining(); signInAs('ad2', 'a2')
    ;(theInput() as any).remarks = 'bare words'
    rmk('Hunter words')
    const l = NOTICES.find(n => n.iid === IID && n.to === 'dj' && n.by === 'prowler')
    expect(l, 'Ace told of the remark the command changed').toBeDefined()
    expect(l!.what).toEqual([{ k: 'rmk' }])
  })
})
