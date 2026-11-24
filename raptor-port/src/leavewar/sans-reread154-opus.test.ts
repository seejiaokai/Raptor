/* THE FRESH OPUS RE-READ OF THE SANS-AHEAD FIXES (chat 154). Fixture: sans-ahead-security152.test.ts's own — the demo week
   of Mon 13 Jul 26, today Wed 15 Jul; `rocky` is Hex; Saber the admin ("ad").
   R1 is written to FAIL on the code as read: a PUBLISHED face's SANS panel asks today's SANS days of each frozen card
   (engine/inputs.ts sansFaceShown has no frozen-face exception, unlike sansAvailOn), so a man frozen with his offer
   vanishes from the issued board once his posting is moved later (D44: a published day keeps what it showed).
   R2 and R3 are coverage the round lacks — what the gate must still ALLOW; expected to pass. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { HOOKS, storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns, sansOnP } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS, holds, isSansAvail, inputCoversDate, idsOf, sansAvailOn, withFrozenInputs } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, dayInputsFrozen } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { NOTICES } from '../state/notices'
import { commitNewInput, commitInput, draftOf, fmt, removeInput } from '../ui/inputedit'
import { sbSansPanel } from '../ui/board-html'
import { initStore as lwInitStore, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, wireLeaveWarSync } from './sync'
import { installGlobalUndo } from '../state/undo-wire'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const P = (id: string): any => (PEOPLE as any)[id]
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const SAT = 5
const FRI_ISO = '2026-07-17', SAT_ISO = '2026-07-18'
const at = (y: number, m: number, d: number) => vi.setSystemTime(new Date(y, m - 1, d, 9, 0, 0))
const dt = (di: number): string => String((DAYS[di] as any).dt)
const toasts: string[] = []
const realToast = HOOKS.toast
const otherSans = (): string => {
  const id = Object.keys(PEOPLE).find(k => { const p = P(k); return p.san && !p.sanFrom && !p.archived && !p.deleted && !p.special && !p.pers
    && (p.seat === 'FCP' || p.seat === 'RCP') && k !== 'rocky' })!
  expect(id, 'premise: a man SANS all week').toBeTruthy()
  return id
}
const sansRecOf = (pid: string, iso: string): any =>
  INPUTS.find((r: any) => r && isSansAvail(r.type) && holds(r, pid) && inputCoversDate(r, fmt(iso)))
/* one offer for Other and Hex on Sat 18 (Hex SANS from Fri 17 by a posting saved ahead — D2340) */
const sharedSat = (): string => {
  expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
  const other = otherSans()
  const ok = commitInput(null, { _new: true, person: other, type: 'SANS Availability', start: SAT_ISO, end: '', allday: true,
    sTime: '06:00', eTime: '18:00', remarks: '', sans: { f: true } }, [other, 'rocky'])
  expect(ok, toasts.join(' | ')).toBe(true)
  return other
}

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  PEOPLE0 = JSON.stringify(PEOPLE); DAYS0 = JSON.stringify(DAYS); INPUTS0 = JSON.stringify(INPUTS)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  at(2026, 7, 15)
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  DAYS.length = 0; JSON.parse(DAYS0).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(INPUTS0).forEach((i: any) => INPUTS.push(i))
  NOTICES.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  stashClear()
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  signInAs('ad', 'a')
  toasts.length = 0
  HOOKS.toast = (m: any) => { toasts.push(String(m)) }
})
afterEach(() => { HOOKS.toast = realToast; resetSession(null); vi.restoreAllMocks() })

describe('R1 — a published face keeps the SANS cards it went out with (D44)', () => {
  it('Sat 18 frozen with Other and Hex, then Hex\'s posting moved to Fri 24: the issued board still draws Hex', () => {
    const other = sharedSat()
    const fz: any = dayInputsFrozen(SAT)
    expect(Object.values(fz).filter((r: any) => isSansAvail(r.type)).flatMap(idsOf), 'premise: frozen with Hex').toContain('rocky')
    expect(postOut('rocky', '2026-07-24', 'sans')).toBe(true); raptorNotify()
    expect(sansOnP(P('rocky'), SAT_ISO), 'premise: Sat 18 no longer SANS for Hex').toBe(false)
    /* the issued face as ui/html.ts withDaySnap installs it (its frozen inputs) — the board's version look draws the panel
       inside it (ui/SchedBoard.tsx → board.ts boardHTMLBody → sbSansPanel with the frozen list) */
    const face = withFrozenInputs({ [dt(SAT)]: fz }, () => ({
      html: sbSansPanel(DAYS[SAT], SAT, undefined, true),
      lookup: sansAvailOn('rocky', dt(SAT)),
    }))
    expect(face.html, 'premise: Other drawn').toContain(`data-person="${other}"`)
    expect(face.lookup, 'premise: the same face\'s own lookup answers yes for Hex').not.toBeNull()
    expect(face.html, 'the issued board dropped Hex\'s frozen card').toContain('data-person="rocky"')
  })
})

describe('R2 — an admin\'s ordinary edit of a shared offer whose second man was hidden later still saves', () => {
  it('Other and Hex on Sat 18, Hex\'s posting moved to Fri 24, the admin adds O to the letters: saved, both kept', () => {
    const other = sharedSat()
    expect(postOut('rocky', '2026-07-24', 'sans')).toBe(true); raptorNotify()
    const rec = sansRecOf(other, SAT_ISO)
    expect(rec).toBeTruthy()
    const ok = commitInput(rec, { ...draftOf(rec), sans: { f: true, o: true } }, [other, 'rocky'])
    expect(ok, toasts.join(' | ')).toBe(true)
    const now = sansRecOf(other, SAT_ISO)
    expect(now.sans.o).toBe(true)
    expect(holds(now, 'rocky'), 'Hex stays in the record (hidden, not deleted — D2341)').toBe(true)
  })
})

describe('R3 — the Undo of a delete of a hidden offer puts it back (the verified replay)', () => {
  it('Hex\'s own Sat 18 offer, his posting moved to Fri 24, the admin deletes it, then Undo: back', () => {
    _resetTimeline(); installGlobalUndo()
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(commitNewInput({ _new: true, person: 'rocky', type: 'SANS Availability', start: SAT_ISO, allday: true, s: 360, e: 1080, sans: { f: true } }), toasts.join(' | ')).toBe(true)
    expect(postOut('rocky', '2026-07-24', 'sans')).toBe(true); raptorNotify()
    const rec = sansRecOf('rocky', SAT_ISO)
    expect(rec).toBeTruthy()
    expect(removeInput(rec)).toBeTruthy()
    expect(sansRecOf('rocky', SAT_ISO)).toBeFalsy()
    expect(globalUndo().ok, toasts.join(' | ')).toBe(true)
    expect(sansRecOf('rocky', SAT_ISO), 'the offer is back, hidden').toBeTruthy()
  })
})
