/* THE SECURITY READ OF THE SANS-AHEAD ROUND (chat 152, 23 Nov 26 — D2340, D2341; D1411's reader looking only for holes).
   Each case is written to FAIL on the code as it stands; the host runs it before believing it.
   S1: the save boundary's "a day the entry being changed already held" (ui/inputedit.tsx sansRefusal `except`) is not tied
       to the man or to SANS availability — an admin puts Hex (posted out as SANS from Fri 17 Jul) into another man's
       offer on Thu 16 Jul, a day before his SANS date (D2340: "for days from its date").
   S2: a shared offer whose second man is not SANS that day is still drawn with his card on the schedule's SANS panels
       (the board, the week) — the hidden man shown (D2341: "hidden on every screen … as if deleted").
   S3: a member's own-row command may write his SANS stretches (sanFrom / sanWas) as he likes — the commit gate holds none
       of them — so the man himself makes a day before his SANS date a SANS day, and files it.
   The fixture is sans-ahead.test.ts's: the demo week of Mon 13 Jul 26, today Wed 15 Jul; `rocky` is Hex, a WSO (sign-in
   "hex", a member); Saber the admin ("ad"). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { HOOKS, storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns, sansOnP } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS, holds, isSansAvail, inputsOn, sansAvailOn, inputCoversDate } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { NOTICES } from '../state/notices'
import { commitNewInput, commitInput, draftOf, fmt, sansRefusal } from '../ui/inputedit'
import { sbSansPanel } from '../ui/board-html'
import { sansSectionHTML } from '../ui/html'
import { commitPeopleEdit } from '../state/people-settings-commit'
import { initStore as lwInitStore, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, wireLeaveWarSync } from './sync'
/* (added by the host, chat 154 — the fixes' own cases: the published copy, Astra's read #1; his own tick still works) */
import { dayInputsFrozen } from '../engine/publish'
import { frozenInputMatch, idsOf } from '../engine/inputs'
import { updatePersonField } from '../state/quals-write'
import { installGlobalUndo } from '../state/undo-wire'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const P = (id: string): any => (PEOPLE as any)[id]
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const THU = 3, SAT = 5
const THU_ISO = '2026-07-16', FRI_ISO = '2026-07-17', SAT_ISO = '2026-07-18'
const at = (y: number, m: number, d: number) => vi.setSystemTime(new Date(y, m - 1, d, 9, 0, 0))
const dt = (di: number): string => String((DAYS[di] as any).dt)
const toasts: string[] = []
const realToast = HOOKS.toast
const fileVia = (person: string, start: string, end?: string): boolean =>
  commitNewInput({ _new: true, person, type: 'SANS Availability', start, ...(end ? { end } : {}), allday: true, s: 360, e: 1080, sans: { f: true } })
/* a man SANS on every day of the week, of the admin's squadron (the W10-1 test's own pick) */
const otherSans = (): string => {
  const id = Object.keys(PEOPLE).find(k => { const p = P(k); return p.san && !p.sanFrom && !p.archived && !p.deleted && !p.special && !p.pers
    && (p.seat === 'FCP' || p.seat === 'RCP') && k !== 'rocky' })!
  expect(id, 'premise: a man SANS all week').toBeTruthy()
  expect(sansOnP(P(id), THU_ISO) && sansOnP(P(id), SAT_ISO), 'premise: SANS on Thu 16 and Sat 18').toBe(true)
  return id
}
const sansRecOf = (pid: string, iso: string): any =>
  INPUTS.find((r: any) => r && isSansAvail(r.type) && holds(r, pid) && inputCoversDate(r, fmt(iso)))

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

const REFUSED = 'Hex is SANS from Fri 17 Jul: file SANS availability for days from then'

describe('S1 — a day before his SANS date, through an edit of someone else\'s offer', () => {
  it('the save boundary: Hex for Thu 16, handed another man\'s Thu 16 offer as "the entry being changed" — refused', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    const other = otherSans()
    /* (the host's correction of the premise: the demo already holds his Thu 16 offer — use it, else file one) */
    if (!sansRecOf(other, THU_ISO)) expect(fileVia(other, THU_ISO), toasts.join(' | ')).toBe(true)
    const rec = sansRecOf(other, THU_ISO)
    expect(rec, 'premise: the other man\'s Thu 16 offer is saved').toBeTruthy()
    expect(holds(rec, 'rocky'), 'premise: Hex is not in it').toBe(false)
    expect(sansRefusal('rocky', { f: true }, THU_ISO, THU_ISO), 'premise: without `except`, refused').toBe(REFUSED)
    /* the bug: any record covering the day exempts it, whoever it held */
    expect(sansRefusal('rocky', { f: true }, THU_ISO, THU_ISO, rec)).toBe(REFUSED)
  })

  it('the window\'s save: the admin adds Hex to the other man\'s Thu 16 offer — refused, and Hex stays out of it', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    const other = otherSans()
    if (!sansRecOf(other, THU_ISO)) expect(fileVia(other, THU_ISO), toasts.join(' | ')).toBe(true)
    const rec = sansRecOf(other, THU_ISO)
    expect(rec).toBeTruthy()
    toasts.length = 0
    const ok = commitInput(rec, { ...draftOf(rec), sans: { f: true } }, [other, 'rocky'])
    expect(ok, 'Hex filed for Thu 16, a day before his SANS date: ' + toasts.join(' | ')).toBe(false)
    expect(holds(sansRecOf(other, THU_ISO), 'rocky')).toBe(false)
  })

  it('the save boundary: a record of another kind is no "entry being changed" for SANS availability', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    const personal = { type: 'Personal', date: fmt(THU_ISO), person: 'rocky', people: [{ p: 'rocky' }], allday: true }
    expect(sansRefusal('rocky', { f: true }, THU_ISO, THU_ISO, personal)).toBe(REFUSED)
  })
})

describe('S2 — a shared offer\'s hidden man is drawn on the schedule\'s SANS panels', () => {
  const sharedThenMoved = (): string => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    const other = otherSans()
    const ok = commitInput(null, { _new: true, person: other, type: 'SANS Availability', start: SAT_ISO, end: '', allday: true,
      sTime: '06:00', eTime: '18:00', remarks: '', sans: { f: true } }, [other, 'rocky'])
    expect(ok, 'premise: one offer for both men on Sat 18 (Hex filed ahead — D2340): ' + toasts.join(' | ')).toBe(true)
    /* his posting moved later: Sat 18 is no longer a SANS day of his (D2341 — his part hidden) */
    expect(postOut('rocky', '2026-07-24', 'sans')).toBe(true); raptorNotify()
    expect(sansOnP(P('rocky'), SAT_ISO), 'premise: Hex is not SANS on Sat 18').toBe(false)
    expect(inputsOn(dt(SAT)).some((r: any) => isSansAvail(r.type) && holds(r, 'rocky') && holds(r, other)), 'premise: the offer shows (the other man is SANS)').toBe(true)
    return other
  }

  it('the board\'s SANS panel on Sat 18 draws the other man and not Hex', () => {
    const other = sharedThenMoved()
    const html = sbSansPanel(DAYS[SAT], SAT)
    expect(html, 'premise: the other man\'s card').toContain(`data-person="${other}"`)
    expect(html).not.toContain('data-person="rocky"')
  })

  it('the week\'s SANS section on Sat 18 draws the other man and not Hex', () => {
    const other = sharedThenMoved()
    const html = sansSectionHTML(DAYS[SAT], SAT, true)
    expect(html, 'premise: the other man\'s card').toContain(`data-person="${other}"`)
    expect(html).not.toContain('data-person="rocky"')
  })

  it('"has Hex SANS availability on Sat 18?" answers no', () => {
    sharedThenMoved()
    expect(sansAvailOn('rocky', dt(SAT))).toBeNull()
  })
})

describe('S3 — the man himself makes a day before his SANS date a SANS day', () => {
  it('a member\'s own-row command writing his SANS stretches back in time — refused; Thu 16 stays unfileable', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    signInAs('hex')
    expect(sansOnP(P('rocky'), THU_ISO), 'premise: Thu 16 is not SANS for him').toBe(false)
    const r: any = commitPeopleEdit(() => { P('rocky').sanWas = [['2026-07-01', FRI_ISO]] }, { owner: 'rocky' })
    expect(!!r && r.ok === false, 'a member wrote his own SANS stretch').toBe(true)
    expect(sansOnP(P('rocky'), THU_ISO)).toBe(false)
    expect(fileVia('rocky', THU_ISO)).toBe(false)
  })
  it('the same with the day his tick counts from (sanFrom) set back', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    signInAs('hex')
    const r: any = commitPeopleEdit(() => { const p = P('rocky'); p.san = true; p.sanFrom = '2026-01-01' }, { owner: 'rocky' })
    /* (a tick by hand counts from the day it is made — D2313; the Quals door writes today, never a date of his choosing) */
    expect(!!r && r.ok === false, 'a member set his own SANS from 1 Jan').toBe(true)
  })
  /* the guard is narrow: his own Quals tick (D149, D2313) still saves — on from today, off today — and his Undo and Redo of
     it put back what it took (the host's cases, chat 154) */
  it('his own SANS tick on Quals still saves, from today; his Undo and Redo of it pass', () => {
    _resetTimeline(); installGlobalUndo()
    signInAs('hex')
    expect(sansOnP(P('rocky'), '2026-07-15'), 'premise: not SANS today').toBe(false)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(sansOnP(P('rocky'), '2026-07-15')).toBe(true)
    expect(sansOnP(P('rocky'), '2026-07-14'), 'never before today').toBe(false)
    expect(globalUndo().ok, 'his Undo of the tick').toBe(true)
    expect(sansOnP(P('rocky'), '2026-07-15')).toBe(false)
    expect(globalRedo().ok, 'his Redo of the tick').toBe(true)
    expect(sansOnP(P('rocky'), '2026-07-15')).toBe(true)
    expect(updatePersonField('rocky', { tick: 'san' }), 'his untick').toBeNull(); raptorNotify()
    expect(sansOnP(P('rocky'), '2026-07-15')).toBe(false)
  })
})

/* ASTRA'S READ #1, its rest (chat 152): a NEW published copy of a day freezes a shared SANS offer as the day shows it — the
   man hidden that day left out — and Hex hidden after issue reads as that offer's change (D2341, D178); a copy frozen
   before keeps what it went out with (D44). */
describe('the published copy of a shared offer with one man hidden', () => {
  const sharedSat = (): string => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    const other = otherSans()
    const ok = commitInput(null, { _new: true, person: other, type: 'SANS Availability', start: SAT_ISO, end: '', allday: true,
      sTime: '06:00', eTime: '18:00', remarks: '', sans: { f: true } }, [other, 'rocky'])
    expect(ok, toasts.join(' | ')).toBe(true)
    return other
  }
  it('a copy frozen while Hex is hidden on Sat 18 holds the other man only', () => {
    const other = sharedSat()
    expect(postOut('rocky', '2026-07-24', 'sans')).toBe(true); raptorNotify()
    const frozen = Object.values(dayInputsFrozen(SAT)).filter((r: any) => isSansAvail(r.type))
    expect(frozen.flatMap(idsOf)).toContain(other)
    expect(frozen.flatMap(idsOf)).not.toContain('rocky')
    /* …and it matches the live day: nothing reads changed */
    const fz: any = dayInputsFrozen(SAT)
    expect(frozenInputMatch(fz, dt(SAT)).diffs).toEqual([])
    /* the stored record keeps both men, so Hex comes back by himself */
    expect(holds(sansRecOf(other, SAT_ISO), 'rocky')).toBe(true)
  })
  it('a copy frozen with both men, then Hex hidden: the offer reads as one change', () => {
    const other = sharedSat()
    const fz: any = dayInputsFrozen(SAT)
    expect(Object.values(fz).filter((r: any) => isSansAvail(r.type)).flatMap(idsOf)).toContain('rocky')
    expect(frozenInputMatch(fz, dt(SAT)).diffs, 'premise: nothing changed yet').toEqual([])
    expect(postOut('rocky', '2026-07-24', 'sans')).toBe(true); raptorNotify()
    const diffs = frozenInputMatch(fz, dt(SAT)).diffs
    expect(diffs.length).toBe(1)
    expect(idsOf(diffs[0].was)).toContain('rocky')
    expect(idsOf(diffs[0].now)).toEqual([other])
    /* the posting put back: no change again */
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(frozenInputMatch(fz, dt(SAT)).diffs).toEqual([])
  })
})
