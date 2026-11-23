/* THE FRESH OPUS READ OF THE FULL CHECK (chat 152, 23 Nov 26) — each case red on the build as read.
   Fixture: sans-ahead.test.ts's own — the demo week of Mon 13 Jul 26, today Wed 15 Jul; `rocky` is Hex ("hex"); Saber ("ad"). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { HOOKS, storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns, sansOn } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS, sansAvailOn, idsOf, inputCoversDate } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { NOTICES, noticesFor, noticeWords, type Notice } from '../state/notices'
import { commitNewInput, commitInput, commitInputEdit, draftOf, sansRefusal } from '../ui/inputedit'
import { sansSectionHTML } from '../ui/html'
import { sbSansPanel } from '../ui/board-html'
import { initStore as lwInitStore, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const FRI = 4, SAT = 5, THU_ISO = '2026-07-16', FRI_ISO = '2026-07-17', SAT_ISO = '2026-07-18'
const at = (y: number, m: number, d: number) => vi.setSystemTime(new Date(y, m - 1, d, 9, 0, 0))
const dt = (di: number): string => String((DAYS[di] as any).dt)
const toasts: string[] = []
const fileVia = (person: string, start: string, end?: string): boolean =>
  commitNewInput({ _new: true, person, type: 'SANS Availability', start, ...(end ? { end } : {}), allday: true, s: 360, e: 1080, sans: { f: true } })
const backLines = (pid: string): Notice[] => noticesFor(pid).filter(n => String((n.what || [])[0]?.k) === 'sansback')
/* a man SANS today, in a flying seat, with nothing filed on Thu 16 or Fri 17 — not Hex */
const sansToday = (): string => Object.keys(PEOPLE).find(id => {
  const p: any = (PEOPLE as any)[id]
  return id !== 'rocky' && p && sansOn(id, '2026-07-15') && !p.archived && !p.deleted && !p.special && !p.pers
    && (p.seat === 'FCP' || p.seat === 'RCP') && !sansAvailOn(id, 'Jul 16') && !sansAvailOn(id, 'Jul 17')
})!
const realToast = HOOKS.toast

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

describe('F1 — a shared offer draws only the men SANS that day (D2341), on the week and the board', () => {
  it('one offer for Other and Hex on Fri 17, Hex\'s posting moved to Fri 24: no card for Hex', () => {
    const other = sansToday()
    expect(other, 'premise: a man SANS today').toBeTruthy()
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(fileVia(other, FRI_ISO), toasts.join(' | ')).toBe(true)
    const rec: any = INPUTS.find((r: any) => r.type === 'SANS Availability' && idsOf(r).map(String).includes(other) && inputCoversDate(r, 'Jul 17'))
    expect(commitInput(rec, draftOf(rec), [other, 'rocky']), toasts.join(' | ')).toBe(true)   // D658: one offer for two
    expect(postOut('rocky', '2026-07-24', 'sans')).toBe(true); raptorNotify()
    expect(sansOn('rocky', FRI_ISO), 'premise: Fri 17 is no SANS day of Hex\'s').toBe(false)
    const week = sansSectionHTML(DAYS[FRI], FRI, true)
    expect(week, 'premise: Other\'s card is drawn').toContain(`data-person="${other}"`)
    expect(week, 'Edit Schedule\'s week').not.toContain('data-person="rocky"')
    expect(sbSansPanel(DAYS[FRI], FRI), 'the board').not.toContain('data-person="rocky"')
  })
})

describe('F2 — a man put on an existing offer is refused for a day before his SANS date', () => {
  const setUp = () => {
    const other = sansToday()
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(fileVia(other, THU_ISO), toasts.join(' | ')).toBe(true)
    const rec: any = INPUTS.find((r: any) => r.type === 'SANS Availability' && idsOf(r).map(String).includes(other) && inputCoversDate(r, 'Jul 16'))
    expect(rec, 'premise: Other\'s Thu 16 offer').toBeTruthy()
    expect(sansOn('rocky', THU_ISO), 'premise: Thu 16 is before Hex\'s date').toBe(false)
    return { other, rec }
  }
  it('F2a — the save\'s own question: Other\'s Thu 16 entry does not exempt Hex\'s Thu 16', () => {
    const { rec } = setUp()
    expect(sansRefusal('rocky', { f: true }, THU_ISO, THU_ISO, rec)).toBe('Hex is SANS from Fri 17 Jul: file SANS availability for days from then')
  })
  it('F2b — the window: Hex added to Other\'s Thu 16 offer is refused, the offer left as it was', () => {
    const { other, rec } = setUp()
    expect(commitInput(rec, draftOf(rec), [other, 'rocky'])).toBe(false)
    expect(idsOf(rec).map(String)).not.toContain('rocky')
  })
  it('F2c — the swap (reassign, the request door): Hex put in Other\'s place on Thu 16 is refused', () => {
    const { other, rec } = setUp()
    expect(commitInputEdit(rec, { ...draftOf(rec), person: 'rocky' })).toBe(false)
    expect(idsOf(rec).map(String)).toEqual([other])
  })
  it('left as it is: Hex\'s OWN entry keeps a day it already held when he changes its letters', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(fileVia('rocky', SAT_ISO), toasts.join(' | ')).toBe(true)
    const rec: any = INPUTS.find((r: any) => r.type === 'SANS Availability' && idsOf(r).map(String).includes('rocky') && inputCoversDate(r, 'Jul 18'))
    expect(postOut('rocky', '2026-07-24', 'sans')).toBe(true); raptorNotify()
    expect(sansRefusal('rocky', { o: true }, SAT_ISO, SAT_ISO, rec)).toBe('')
  })
})

describe('F4 — the posting put back: no line still says the day is hidden (a question for him)', () => {
  /* kept FAILING on purpose (`it.fails`) until he answers chat 152's question: as built the "hidden" line stays on his bell
     after the posting is put back. If he says it should go, build it and turn this back into `it`. */
  it.fails('moved to Fri 24 then back to Fri 17: Sat 18 shows again, and the bell no longer says it is hidden', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(fileVia('rocky', SAT_ISO), toasts.join(' | ')).toBe(true)
    expect(postOut('rocky', '2026-07-24', 'sans')).toBe(true); raptorNotify()
    expect(backLines('rocky').some(n => (noticeWords(n).more || '').includes('Sat 18 Jul')), 'premise: told it is hidden').toBe(true)
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(sansAvailOn('rocky', dt(SAT)), 'premise: it shows and counts again').toBeTruthy()
    expect(backLines('rocky').filter(n => (noticeWords(n).more || '').includes('Sat 18 Jul'))).toEqual([])
  })
})

/* F5 reverses sans-ahead.test.ts's pinned `nameStruck: true` — run only once he rules on it */
describe.skip('F5 — no struck words he never saw (a question for him)', () => {
  it('every day filed, so never a live line: the take-back strikes nothing', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(fileVia('rocky', SAT_ISO), toasts.join(' | ')).toBe(true)
    expect(postOut('rocky', '2026-07-24', 'sans')).toBe(true); raptorNotify()
    const w = noticeWords(backLines('rocky')[0]!)
    expect(w.nameStruck).toBeFalsy()
    expect(w.what).not.toBe('taken back')
  })
})
