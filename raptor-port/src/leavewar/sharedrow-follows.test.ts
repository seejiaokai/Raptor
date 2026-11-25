/* ONE MAN'S ROW OF A SHARED ABSENCE FOLLOWS HIM TO THE INPUT OF HIS OWN (chat 170's night walk, 25 Nov 26 — W3, reproduced
   by the host on main's build with scripts/handpass/r4wf-w2-w3.mjs on claude/r4-walk-faults-170; fixed by chat 177).

   Ranger and Hex share one leave, 08:00–10:00. On the Scheduler Board's Unavailable list, in Ranger's row: start 0900,
   Tab — Ranger rightly got a leave of his own, 09:00–10:00 (D737, D759 reading 4: one man's row is his part alone, the
   one-rule plan §4.6). End 1100, Tab — saved onto HEX's leave: Hex 08:00–11:00, Ranger still 09:00–10:00. The row under
   the caret is held back from repainting, so it still carries the SHARED leave's address with Ranger's name after it
   (`iu:<shared>~bane`); the shared leave no longer holds him, so the one-man branch did not fire, and the change went to
   the shared leave whole — to Hex alone. The week's cells (textedit.ts, `data-inp`) and the Leave War's remark box
   (SelectSheet / ReqWords → setLeaveRemarks, which keep the leave they were handed across saves) carry the same address.

   What is right: every change on his row reaches HIS input — the one cut out for him — and the others' leave is never
   touched by it; where his part cannot be found any more, nothing is saved. Through the real doors over both wired
   stores, as trialread.test.ts does.

   Saber (`stiff`) is the admin; Ranger (`bane`), Hex (`rocky`) and Outlaw (`casper`) are members. The clock starts at
   15 Jan 26; 10 Feb 26 is a Tuesday. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS, idsOf } from '../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { globalUndo, globalRedo } from '../undo'
import { commandStream } from '../command'
import { NOTICES } from '../state/notices'
import { commitInput, draftOf, setInpField, setLeaveRemarks } from '../ui/inputedit'
import { initStore as lwInitStore, lwHistInit, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
let said: string[] = []

const T = (h: number, day = 15): number => { const d = new Date(2026, 0, day, h, 0, 0); vi.setSystemTime(d); return d.getTime() }
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const saber = () => signInAs('ad', 'a')

const TUE = '2026-02-10'
const NAME: Record<string, string> = { bane: 'Ranger', rocky: 'Hex', casper: 'Outlaw' }
const D = (o: Record<string, any> = {}) => ({
  type: 'LL', allday: false, half: '', start: TUE, end: '', sTime: '08:00', eTime: '10:00', remarks: '', sans: null, docIds: [], ...o,
})
const leaves = () => INPUTS.filter((r: any) => r.type === 'LL' && r.date === 'Feb 10') as any[]
/* every leave of that Tuesday, as "<who> <start>-<end> "<remark>"" — sorted, so a split's order never matters */
const said2 = () => leaves().map(r => `${idsOf(r).map(p => NAME[p] || p).join('+')} ${r.s}-${r.e} "${r.remarks || ''}"`).sort()
/* the shared leave as the held row knows it: by its own id, looked up afresh each time, exactly as board.ts and
   textedit.ts look it up from the box's address on every change */
const byId = (iid: string) => INPUTS.find((r: any) => r.iid === iid)

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  PEOPLE0 = JSON.stringify(PEOPLE)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  T(8)
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v }, keys: () => Object.keys(mem) } as any
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  said = []; HOOKS.toast = (m: any) => { said.push(String(m)) }
  saber()
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); resetSession(null) })

const shared = (who = ['bane', 'rocky']) => {
  expect(commitInput(null, D(), who), said.join(' | ')).toBe(true)
  const l = leaves(); expect(l, 'one shared leave').toHaveLength(1)
  return l[0].iid as string
}

describe('one man\'s row of a shared leave, typed in three times with the row held (W3)', () => {
  it('start 0900, end 1100, a remark — all on Ranger\'s own leave; Hex keeps 08:00–10:00 and no remark', () => {
    const iid = shared()
    expect(setInpField(byId(iid), 'str', '0900', 'bane'), said.join(' | ')).toBe(true)
    expect(said2(), 'the first change gives Ranger a leave of his own').toEqual(['Hex 480-600 ""', 'Ranger 540-600 ""'])
    expect(setInpField(byId(iid), 'end', '1100', 'bane'), said.join(' | ')).toBe(true)
    expect(said2(), 'the second reaches HIS leave, never Hex\'s').toEqual(['Hex 480-600 ""', 'Ranger 540-660 ""'])
    expect(setInpField(byId(iid), 'rmks', 'own hours', 'bane'), said.join(' | ')).toBe(true)
    expect(said2(), 'the remark too').toEqual(['Hex 480-600 ""', 'Ranger 540-660 "own hours"'])
  })

  it('of three: Ranger\'s row twice — Hex and Outlaw keep the shared leave whole and untouched', () => {
    const iid = shared(['bane', 'rocky', 'casper'])
    expect(setInpField(byId(iid), 'str', '0900', 'bane')).toBe(true)
    expect(setInpField(byId(iid), 'end', '1200', 'bane')).toBe(true)
    expect(said2()).toEqual(['Hex+Outlaw 480-600 ""', 'Ranger 540-720 ""'])
  })

  it('the second change is ONE change of his own leave: one more Undo step, and nobody else is told anything', () => {
    const iid = shared()
    expect(setInpField(byId(iid), 'str', '0900', 'bane')).toBe(true)
    const n = commandStream().length, told = NOTICES.filter((x: any) => x.to === 'rocky').length
    expect(setInpField(byId(iid), 'end', '1100', 'bane')).toBe(true)
    expect(commandStream().length - n, 'one step').toBe(1)
    expect(NOTICES.filter((x: any) => x.to === 'rocky').length - told, 'Hex is told nothing of Ranger\'s own leave').toBe(0)
    globalUndo()
    expect(said2(), 'its Undo takes back only that change').toEqual(['Hex 480-600 ""', 'Ranger 540-600 ""'])
  })

  it('the split undone, the held row types again: Ranger is in the shared leave again, so it gives him his own afresh', () => {
    const iid = shared()
    expect(setInpField(byId(iid), 'str', '0900', 'bane')).toBe(true)
    globalUndo()
    expect(said2(), 'back to one shared leave').toEqual(['Ranger+Hex 480-600 ""'])
    expect(setInpField(byId(iid), 'end', '1100', 'bane'), said.join(' | ')).toBe(true)
    expect(said2()).toEqual(['Hex 480-600 ""', 'Ranger 480-660 ""'])
  })

  it('undone and redone, the held row still reaches his own leave', () => {
    const iid = shared()
    expect(setInpField(byId(iid), 'str', '0900', 'bane')).toBe(true)
    globalUndo(); globalRedo()
    expect(said2()).toEqual(['Hex 480-600 ""', 'Ranger 540-600 ""'])
    expect(setInpField(byId(iid), 'end', '1100', 'bane'), said.join(' | ')).toBe(true)
    expect(said2()).toEqual(['Hex 480-600 ""', 'Ranger 540-660 ""'])
  })

  it('taken out by another door while his row is held: his row saves NOTHING, and Hex\'s leave is untouched', () => {
    const iid = shared()
    const r = byId(iid)
    expect(commitInput(r, draftOf(r), ['rocky']), said.join(' | ')).toBe(true)
    expect(said2()).toEqual(['Hex 480-600 ""'])
    const n = commandStream().length
    expect(setInpField(byId(iid), 'end', '1100', 'bane')).toBe(false)
    expect(said2(), 'Hex is not given Ranger\'s change').toEqual(['Hex 480-600 ""'])
    expect(commandStream().length - n).toBe(0)
  })
})

describe('the Leave War\'s remark on one man\'s cell, saved twice with the window open (the same address)', () => {
  it('Ranger\'s remark, then changed: both on Ranger\'s own leave; Hex\'s leave keeps no remark', () => {
    const iid = shared()
    const held = byId(iid)                       // the window keeps the leave it was opened on
    expect(setLeaveRemarks(held, 'Dental', 'bane'), said.join(' | ')).toBe(true)
    expect(said2()).toEqual(['Hex 480-600 ""', 'Ranger 480-600 "Dental"'])
    expect(setLeaveRemarks(held, 'Dental, then gym', 'bane'), said.join(' | ')).toBe(true)
    expect(said2(), 'the second save reaches HIS leave').toEqual(['Hex 480-600 ""', 'Ranger 480-600 "Dental, then gym"'])
  })
})
