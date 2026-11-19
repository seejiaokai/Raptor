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
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { getState, initStore as lwInitStore, setPeople, worldUnit, openDates } from './state/store'
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
