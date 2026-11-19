// @vitest-environment jsdom
/* Fix read 4, claims 2 and 3, by his D2218 (19 Nov 26): "On the day a person moves squadron the old squadron's bell lines
   leave his bell, read or unread, never later struck 'taken back'; lines about himself stay with him; after a move, who
   is told of a take-back is whoever would be told of it today."
   - Claim 2 (the Opus read's §2): Kestrel (149) opens bidding and Osprey (149) is told; Osprey's move to 142 from 16 Jul
     arrives; on 16 Jul Kestrel's Undo goes through, and so did the Redo — which put 149's "Bidding open" back on Osprey,
     142's by then: a line the action itself would not write that day. The Redo now goes through without it.
   - Claim 3 (Astra's §2): Osprey READ the line before the Undo; the Undo removed it and told him nothing. By D2218 that
     is right: the line left his bell on his move day, so he is owed nothing.
   - The read rule itself (state/notices.ts noticeLeftBell): an old squadron's line leaves his bell from the move day, a
     line about himself stays.
   Harness as leavewar/multi-sqn-fixread3-undo-moved.test.ts. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputsBatch } from '../state/store'
import { accountsLoad, signIn, sessionFor, updateAccount } from '../state/accounts'
import { getState, initStore as lwInitStore, setPeople, worldUnit, openDates, placeApproved, setCell, setBidState } from './state/store'
import { ownershipViolation } from '../state/perms'
import { deriveActor } from '../command/actor'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor } from './sync'
import { homeOn, unitsLoad } from '../state/units'
import { HOME_PFX } from '../state/units-model'
import { INPUTS } from '../engine/inputs'
import { NOTICES, noticesFor, type Notice } from '../state/notices'
import { unreadFor, noticeSeenLoad, hasRead } from '../state/noticeseen'
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
  NOTICES.splice(0)                                       // (each case starts with an empty bell: the store keeps the list in memory)
  accountsLoad()
  noticeSeenLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  setWarWorldDoor((u: string) => ({ backend: worlds[u] ?? (worlds[u] = memoryBackend()) }))
  _resetTimeline(); installGlobalUndo()
  vi.spyOn(HOOKS, 'toast').mockImplementation(() => {})
})
const day = () => getState().period.end
const isOpen = () => getState().period.open.some(o => o.from <= day() && day() <= o.to)
const openLine = (n: Notice) => n.to === 'osp9' && (n.what || [])[0]?.k === 'lwopen'
const backLine = (n: Notice) => n.to === 'osp9' && (n.what || [])[0]?.k === 'lwback'
/* Osprey's move to 142 from 16 Jul, saved on 15 Jul by the master on another device (the row arriving in the shared store) */
const moveOsprey = () => {
  mem['sqn142_' + HOME_PFX + 'hfr4'] = JSON.stringify({ id: 'hfr4', pid: 'osp9', unit: 'u142', from: '2026-07-16' })
  unitsLoad()
}
const nextDay = () => { vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0)); unitsLoad() }
/* Kestrel opens bidding; answers Osprey's "Bidding open" line */
const open = (): Notice => {
  signInAs('ad9', 'a9')
  expect(worldUnit()).toBe('u149')
  expect(openDates(day(), day())).toBe('set')
  const line = NOTICES.find(openLine)
  expect(line, 'Osprey told').toBeDefined()
  return line!
}

describe("D2218 — a moved man's old squadron's war lines", () => {
  it('control: no move — the Redo puts Osprey’s "Bidding open" back', () => {
    const line = open()
    nextDay()
    expect(globalUndo().ok).toBe(true)
    expect(NOTICES.some(n => n.id === line.id)).toBe(false)
    const r = globalRedo()
    expect(r.ok, JSON.stringify(r)).toBe(true)
    expect(isOpen()).toBe(true)
    expect(NOTICES.some(n => n.id === line.id), 'his line is back').toBe(true)
  })
  it('claim 2: after his move the Redo goes through without putting 149’s line back on Osprey (now 142’s)', () => {
    const line = open()
    moveOsprey()
    nextDay()
    expect(homeOn('osp9')).toBe('u142')
    expect(globalUndo().ok).toBe(true)
    expect(NOTICES.some(n => n.id === line.id)).toBe(false)
    const r = globalRedo()
    expect(r.ok, JSON.stringify(r)).toBe(true)
    expect(isOpen(), 'bidding open again').toBe(true)
    expect(NOTICES.some(openLine), 'no 149 line on a 142 man').toBe(false)
    /* …and the step undoes again cleanly after it */
    const u2 = globalUndo()
    expect(u2.ok, JSON.stringify(u2)).toBe(true)
    expect(isOpen()).toBe(false)
  })
  it('claim 3: Osprey read the line, then moved — off his bell from his move day, and the Undo tells him nothing', () => {
    const line = open()
    /* he reads it on his own phone: his read record arrives on Kestrel's device (Undo is per sign-in, so Kestrel stays
       signed in here — as leavewar/m4bell.test.ts) */
    mem['sqn142_noticeseen:osp9'] = JSON.stringify({ upto: 0, ids: [line.id] }); noticeSeenLoad()
    expect(hasRead('osp9', line)).toBe(true)
    moveOsprey()
    /* still 15 Jul: he is 149's until tomorrow — the line stands */
    expect(noticesFor('osp9').some(n => n.id === line.id), 'still his on the day before the move').toBe(true)
    nextDay()
    expect(noticesFor('osp9').some(n => n.id === line.id), 'gone from his bell on the move day, before any Undo').toBe(false)
    const r = globalUndo()
    expect(r.ok, JSON.stringify(r)).toBe(true)
    expect(NOTICES.some(n => n.id === line.id)).toBe(false)
    expect(NOTICES.some(backLine), 'no "taken back" line for a man no longer 149’s').toBe(false)
    signInAs('us9', 'us9')
    expect(unreadFor('osp9')).toBe(0)
  })
  it('the read rule: a line about himself stays after the move, unread ones leave and stop lighting the bell', () => {
    open()
    const at = Date.now()
    /* a decision on his own leave by 149, and an input line — both about him */
    const own: Notice = { id: 'nf4own', to: 'osp9', by: 'kes9', at, iid: '', name: 'Your leave', day: '2026-07-20', what: [{ k: 'lw', c: 'LL', a: '2026-07-20', b: '2026-07-21', d: 'approved' }] }
    const inp: Notice = { id: 'nf4inp', to: 'osp9', by: 'kes9', at, iid: 'i-f4', name: 'SIM', day: '2026-07-20', what: [{ k: 'in' }] }
    NOTICES.push(own, inp)
    signInAs('us9', 'us9')
    expect(unreadFor('osp9')).toBe(3)
    moveOsprey()
    nextDay()
    const shown = noticesFor('osp9').map(n => n.id)
    expect(shown).toContain('nf4own')
    expect(shown).toContain('nf4inp')
    expect(noticesFor('osp9').some(openLine)).toBe(false)
    expect(unreadFor('osp9'), 'the bidding line no longer lights his bell').toBe(2)
    /* …and does not come back should he return to 149 */
    mem['sqn142_' + HOME_PFX + 'hfr4b'] = JSON.stringify({ id: 'hfr4b', pid: 'osp9', unit: 'u149', from: '2026-07-17' })
    vi.setSystemTime(new Date(2026, 6, 17, 9, 0, 0)); unitsLoad()
    expect(homeOn('osp9')).toBe('u149')
    expect(noticesFor('osp9').some(openLine)).toBe(false)
  })
})

/* Fix read 5 (the Opus read's 1 and 2 = Astra's 2), by his D2222 (19 Nov 26): "A bell line about a moved man's own leave
   follows him: when his old squadron undoes the decision after his move, he is told as anyone is — an unread line goes,
   a read one is struck 'taken back' — and its Redo puts the line back." Kestrel (149) decides Osprey's LL on 15 Jul;
   Osprey's move to 142 from 16 Jul is saved; on 16 Jul Kestrel's Undo, Redo and Undo again. The Redo was refused whole
   (the gate's restore pass was delete-only), and a read line went silently (the reversal writer skipped anyone not at
   home). Refused: a request with no input change beside it, so nothing else in the step can carry it through. */
describe("D2222 — a line about a moved man's own leave follows him", () => {
  const D = '2026-07-15'
  const ownLine = (n: Notice) => n.to === 'osp9' && (n.what || [])[0]?.k === 'lw' && !(n.what[0] as any).again
  const againLine = (ref: string) => (n: Notice) => n.to === 'osp9' && (n.what || [])[0]?.k === 'lw' && (n.what[0] as any).again === true && (n.what[0] as any).ref === ref
  const decide = (d: 'approved' | 'refused'): Notice => {
    signInAs('ad9', 'a9')
    expect(worldUnit()).toBe('u149')
    if (d === 'approved') expect(placeApproved([{ personId: 'osp9', date: D }], 'LL').approved).toBe(1)
    else {
      expect(setCell('osp9', D, 'LL')).toBe(true)
      expect(NOTICES.some(ownLine), 'a pending bid tells nothing').toBe(false)
      setBidState('osp9', D, 'refused')
    }
    const l = NOTICES.find(ownLine)
    expect(l, `Osprey told: LL ${d}`).toBeDefined()
    expect((l!.what[0] as any).d).toBe(d === 'approved' ? 'added' : 'refused')   // (placed approved: "LL added and approved")
    return l!
  }
  for (const d of ['approved', 'refused'] as const) {
    it(`control, no move (${d}): Undo → Redo → Undo`, () => {
      const l = decide(d)
      nextDay()
      expect(globalUndo().ok).toBe(true)
      expect(NOTICES.some(n => n.id === l.id)).toBe(false)
      const r = globalRedo(); expect(r.ok, JSON.stringify(r)).toBe(true)
      expect(NOTICES.some(n => n.id === l.id)).toBe(true)
      expect(globalUndo().ok).toBe(true)
    })
    for (const read of [false, true]) {
      it(`${d}, ${read ? 'read' : 'unread'}, then moved: Undo ${read ? 'strikes it "taken back"' : 'takes it'}, Redo puts it back, Undo again`, () => {
        const l = decide(d)
        if (read) { mem['sqn142_noticeseen:osp9'] = JSON.stringify({ upto: 0, ids: [l.id] }); noticeSeenLoad() }
        moveOsprey(); nextDay()
        expect(homeOn('osp9')).toBe('u142')
        expect(noticesFor('osp9').some(n => n.id === l.id), 'about himself: still on his bell').toBe(true)
        const u = globalUndo(); expect(u.ok, JSON.stringify(u)).toBe(true)
        expect(NOTICES.some(n => n.id === l.id)).toBe(false)
        const backs = NOTICES.filter(n => backLine(n) && (n.what[0] as any).ref === l.id)
        expect(backs.length, read ? 'one "taken back" line' : 'an unread line simply goes').toBe(read ? 1 : 0)
        if (read) { expect(backs[0]!.by).toBe('kes9'); expect((backs[0]!.what[0] as any).d).toBe((l.what[0] as any).d) }
        const r = globalRedo(); expect(r.ok, 'Redo: ' + JSON.stringify(r)).toBe(true)
        expect(NOTICES.some(n => n.id === l.id), 'his line is back').toBe(true)
        expect(NOTICES.filter(againLine(l.id)).length, read ? '"again" over the "taken back"' : 'no "again" with no "taken back"').toBe(read ? 1 : 0)
        const u2 = globalUndo(); expect(u2.ok, 'Undo again: ' + JSON.stringify(u2)).toBe(true)
        expect(NOTICES.some(n => n.id === l.id)).toBe(false)
        signInAs('us9', 'us9')
        expect(noticesFor('osp9').some(n => n.id === l.id)).toBe(false)
      })
    }
  }
  it('no wider: Kestrel cannot write a "taken back" line to Osprey (now 142’s) outside the Undo that removed his line', () => {
    const l = decide('approved')
    moveOsprey(); nextDay()
    const env: any = { type: 'lw.notice', origin: 'user', actor: deriveActor(), changes: [{ collection: 'notices', id: 'nforge', op: 'put', before: null,
      after: { id: 'nforge', to: 'osp9', by: 'kes9', at: Date.now(), iid: '', name: 'Your leave', day: D, what: [{ k: 'lwback', c: 'LL', a: D, b: D, d: 'approved', ref: l.id }] } }] }
    expect(ownershipViolation(env)).toMatch(/bell line of another squadron/)
    /* …nor put his own line back, calling itself a restore */
    const env2: any = { type: 'undo.restore', origin: 'restore', actor: deriveActor(), changes: [{ collection: 'notices', id: l.id, op: 'put', before: null, after: { ...l } }] }
    expect(ownershipViolation(env2)).toMatch(/bell line of another squadron/)
    /* …nor a "taken back" line beside a forged delete of his line */
    const env3: any = { ...env2, changes: [{ collection: 'notices', id: l.id, op: 'delete', before: { ...l }, after: null }, env.changes[0]] }
    expect(ownershipViolation(env3)).toMatch(/bell line of another squadron/)
  })
})

/* Fix read 5 (the Opus read's 3), by his D2223 (19 Nov 26): "After a move, a bell line about an input stays with a man only
   where he is named in that input (or it is his own request's line); a moved admin is no longer told about inputs he filed
   for his old squadron's men — the filer is told only while he is still that man's admin or in the input." The agent's
   reading: the master stays an admin everywhere, so a master filer is still told. Hunter (142's admin) files LL for Ranger
   (142) on 15 Jul; Hunter's move to 149 from 16 Jul; 17 Jul Saber changes the leave's remark. */
describe('D2223 — input lines after a move', () => {
  const IID = 'ipd-fr5-filer'
  const fileFor = (who: string, filer: string) => expect(writeInputsBatch(() => { INPUTS.push({ person: who, date: 'Jul 25', yr: 2026, allday: true, type: 'LL', remarks: 'for him', by: filer, at: Date.now(), iid: IID, ord: 99901 } as any) })).toBe(true)
  const rmk = (words: string) => expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = words })).toBe(true)
  /* a move as state/units.ts setHome saves one for a man with no row of his own: his squadron of today first (a person's
     first row covers every day before it), then the new one from tomorrow */
  const move = (pid: string, key: string) => {
    mem['sqn142_' + HOME_PFX + key + 'a'] = JSON.stringify({ id: key + 'a', pid, unit: 'u142', from: '2026-07-15' })
    mem['sqn142_' + HOME_PFX + key] = JSON.stringify({ id: key, pid, unit: 'u149', from: '2026-07-16' })
    unitsLoad()
  }
  const moveHunter = () => move('prowler', 'hfr5')
  const toHunter = () => NOTICES.filter(n => n.to === 'prowler' && n.iid === IID)
  it('control, no move: Hunter, its filer, is told of Saber’s change', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
    vi.setSystemTime(new Date(2026, 6, 17, 9, 0, 0)); unitsLoad()
    signInAs('ad', 'a'); rmk('changed by Saber')
    expect(toHunter().length).toBe(1)
  })
  it('the writer: moved to 149, Hunter is no longer told of a change to the leave he filed for Ranger (142)', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
    moveHunter()
    vi.setSystemTime(new Date(2026, 6, 17, 9, 0, 0)); unitsLoad()
    expect(homeOn('prowler')).toBe('u149')
    signInAs('ad', 'a'); rmk('changed by Saber')
    expect(toHunter().length, 'no 142 line about a 142 man to the moved admin').toBe(0)
    expect(NOTICES.filter(n => n.to === 'bane' && n.iid === IID && n.what[0]?.k === 'rmk').length, 'Ranger, named in it, is told as ever').toBe(1)
  })
  it('the gate: a 142 admin’s change may not carry its telling to the filer since moved to 149', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
    moveHunter()
    vi.setSystemTime(new Date(2026, 6, 17, 9, 0, 0)); unitsLoad()
    signInAs('ad', 'a'); expect(updateAccount('acoutlaw', { role: 'admin' })).toBeNull()
    signInAs('outlaw')
    const r = INPUTS.find((x: any) => x.iid === IID) as any
    const env: any = { type: 'inputs.batch', origin: 'user', actor: deriveActor(), changes: [
      { collection: 'inputs', id: IID, op: 'put', before: { ...r }, after: { ...r, remarks: 'by Outlaw' } },
      { collection: 'notices', id: 'nfr5g', op: 'put', before: null, after: { id: 'nfr5g', to: 'prowler', by: 'casper', at: Date.now(), iid: IID, name: 'LL', day: '2026-07-25', what: [{ k: 'rmk' }] } }] }
    expect(ownershipViolation(env) ?? 'allowed').toMatch(/bell line of another squadron/)
    /* …while the same line to Ranger, named in it, rides as ever */
    const env2: any = { ...env, changes: [env.changes[0], { ...env.changes[1], after: { ...env.changes[1].after, to: 'bane' } }] }
    expect(ownershipViolation(env2)).toBeNull()
  })
  it('a master filer is still told: Saber files for Ranger, moves to 149, Hunter changes it', () => {
    signInAs('ad', 'a'); fileFor('bane', 'stiff')
    move('stiff', 'hfr5s')
    vi.setSystemTime(new Date(2026, 6, 17, 9, 0, 0)); unitsLoad()
    expect(homeOn('stiff')).toBe('u149')
    signInAs('ad2', 'a2'); rmk('changed by Hunter')
    expect(NOTICES.filter(n => n.to === 'stiff' && n.iid === IID).length).toBe(1)
  })
  it('the read rule: Hunter’s old line about Ranger’s input leaves his bell on his move day; one on an input naming him stays', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
    signInAs('ad', 'a'); rmk('changed by Saber on the 15th')
    expect(toHunter().length, 'told before the move').toBe(1)
    const own = 'ipd-fr5-own'
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'prowler', date: 'Jul 26', yr: 2026, allday: true, type: 'LL', remarks: 'mine', by: 'prowler', at: Date.now(), iid: own, ord: 99902 } as any) })).toBe(true)
    signInAs('ad', 'a'); expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === own) as any).remarks = 'Saber' })).toBe(true)
    expect(NOTICES.filter(n => n.to === 'prowler' && n.iid === own).length).toBe(1)
    moveHunter()
    signInAs('ad2', 'a2')
    expect(noticesFor('prowler').some(n => n.iid === IID), 'still his on the save day').toBe(true)
    vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0)); unitsLoad()
    expect(noticesFor('prowler').some(n => n.iid === IID), 'off his bell from the move day').toBe(false)
    expect(noticesFor('prowler').some(n => n.iid === own), 'his own leave’s line stays').toBe(true)
  })
})
