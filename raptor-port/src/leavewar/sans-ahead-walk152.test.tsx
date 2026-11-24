/* THE FULL CHECK'S WALK (chat 152, 23 Nov 26) — what walker w8 found on the SANS calendar, each case failing first.
   W8-1: a man posted out as SANS from Fri 17 Jul, on Wed 15, picks a run of days that starts before his date (a drag
   16→18, or the keys' Shift+arrows then Enter, either way round): NOTHING happened — no window, no words — because the
   run's first day is one he cannot be filed for and the calendar's add simply returned. His D2340 lets him file from his
   date; a press that does nothing and says nothing is never right (the design guide §1: a refusal says why). His D2388
   (23 Nov 26) goes further: such a run opens the window and saves from his date, the note saying which days were left
   out (leavewar/sans-words-156.test.tsx holds the saving); only a run with no SANS day in it is still refused, in words.
   W8-2: the SANS calendar's Highlight list offered only men SANS today, so a man posted out as SANS from a date ahead —
   who may have commitments filed from the moment his posting is saved (D2340) — could not be picked to see them.
   The fixture is sans-before.test.tsx's: the demo week of Mon 13 Jul 26, today Wed 15 Jul; `rocky` is Hex ("hex"). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { HOOKS, storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { NOTICES } from '../state/notices'
import { INPEDIT, setInpEdit } from '../ui/pops'
import { openSansAdd } from '../ui/sansadd'
import { sansRoster } from '../ui/sanscal-model'
import { initStore as lwInitStore, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const FRI = '2026-07-17', THU = '2026-07-16', SAT = '2026-07-18', MON20 = '2026-07-20'
const at = (y: number, m: number, d: number) => vi.setSystemTime(new Date(y, m - 1, d, 9, 0, 0))

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
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  signInAs('ad', 'a')
  setInpEdit(null)
})
afterEach(() => { cleanup(); setInpEdit(null); resetSession(null); vi.restoreAllMocks() })

describe('W8-1 — a run of days starting before his SANS date (his D2388: it saves from his date)', () => {
  const WORDS = 'Hex is SANS from Fri 17 Jul: file SANS availability for days from then'
  it('Hex drags Thu 16 → Sat 18: the window opens on his run, nothing refused', () => {
    expect(postOut('rocky', FRI, 'sans')).toBe(true); raptorNotify()
    signInAs('hex')
    const toast = vi.spyOn(HOOKS, 'toast')
    expect(openSansAdd(THU, SAT)).toBe(true)
    expect(INPEDIT?.person).toBe('rocky')
    expect(toast).not.toHaveBeenCalled()
  })
  it('the same run picked the other way round (Sat 18 → Thu 16) opens the same', () => {
    expect(postOut('rocky', FRI, 'sans')).toBe(true); raptorNotify()
    signInAs('hex')
    const toast = vi.spyOn(HOOKS, 'toast')
    expect(openSansAdd(SAT, THU)).toBe(true)
    expect(INPEDIT?.person).toBe('rocky')
    expect(toast).not.toHaveBeenCalled()
  })
  it('left as it is: a run with no SANS day in it is refused, and says why', () => {
    expect(postOut('rocky', SAT, 'sans')).toBe(true); raptorNotify()
    signInAs('hex')
    const toast = vi.spyOn(HOOKS, 'toast')
    expect(openSansAdd(THU, FRI)).toBe(false)
    expect(INPEDIT).toBeNull()
    expect(toast).toHaveBeenCalledWith(WORDS.replace('Fri 17', 'Sat 18'), 'warn')
  })
  it('left as it is: a run from his date opens the window with him in it, saying nothing', () => {
    expect(postOut('rocky', FRI, 'sans')).toBe(true); raptorNotify()
    signInAs('hex')
    const toast = vi.spyOn(HOOKS, 'toast')
    expect(openSansAdd(FRI, MON20)).toBe(true)
    expect(INPEDIT?.person).toBe('rocky')
    expect(toast).not.toHaveBeenCalled()
  })
  it('left as it is: a man with no SANS at all is still refused silently — the calendar offers him no add', () => {
    signInAs('hex')   // a regular: no tick, no posting
    const toast = vi.spyOn(HOOKS, 'toast')
    expect(openSansAdd(THU, SAT)).toBe(false)
    expect(toast).not.toHaveBeenCalled()
  })
})

describe('W8-2 — the Highlight list offers a man posted out as SANS from a date ahead', () => {
  it('before his posting Hex is not in it; once it is saved he is', () => {
    expect(sansRoster()).not.toContain('rocky')
    expect(postOut('rocky', FRI, 'sans')).toBe(true); raptorNotify()
    expect(sansRoster()).toContain('rocky')
  })
  it('left as it is: the men SANS today stay in it, and each is listed once', () => {
    const today = sansRoster()
    expect(postOut('rocky', FRI, 'sans')).toBe(true); raptorNotify()
    const after = sansRoster()
    for (const id of today) expect(after).toContain(id)
    expect(new Set(after).size).toBe(after.length)
  })
})

/* ASTRA #5 (the FULL check's read, chat 152): a man SANS on a past day — his tick since taken off, his SANS days kept
   (D2313, D2327) — is offered on that day by the calendar and the picker (both ask the day), but the save refused him
   "SANS Availability is for SANS aircrew only", asking first whether he is SANS today or posted ahead. With days given the
   save now asks the days (D2340: filing goes by the day filed). */
describe('Astra #5 — a past day he was SANS can still be filed for', () => {
  it('Hex SANS Mon 13 – Wed 15 by an ended stretch, no tick today: Tue 14 is accepted, Thu 16 refused', async () => {
    const { sansRefusal } = await import('../ui/inputedit')
    const hex = (PEOPLE as any).rocky
    hex.san = false; hex.sanWas = [['2026-07-13', '2026-07-16']]
    expect(sansRefusal('rocky', { f: true }, '2026-07-14', '2026-07-14')).toBe('')
    expect(sansRefusal('rocky', { f: true }, THU, THU)).toBe('SANS Availability is for SANS aircrew only')
  })
  it('left as it is: with no days given, a man neither SANS today nor posted ahead is refused', async () => {
    const { sansRefusal } = await import('../ui/inputedit')
    const hex = (PEOPLE as any).rocky
    hex.san = false; hex.sanWas = [['2026-07-13', '2026-07-16']]
    expect(sansRefusal('rocky', { f: true })).toBe('SANS Availability is for SANS aircrew only')
  })
})

/* W10-1 (walker w10's S12x, both sizes): Saber files ONE offer for two men on Fri 17; one of them is not SANS that day.
   The opened SANS day hides him (D2341) — but the other man's line still said "Saber for 2 people", telling of the hidden
   one. The line now counts only the men the day shows. (The window a tap opens edits the whole record, so it still names
   both — the agent's reading, told to him: hiding a man from it would let a save drop him from the record.) */
describe('W10-1 — a shared offer\'s placed line counts only the men shown that day', () => {
  it('two men on one offer, Hex not SANS on Fri 17: the shown man\'s line says nothing of a second', async () => {
    const { sansDayGroups } = await import('../ui/sanscal-model')
    const { fmt } = await import('../ui/inputedit')
    const other = Object.keys(PEOPLE).find(id => (PEOPLE as any)[id].san && !(PEOPLE as any)[id].archived
      && !(PEOPLE as any)[id].special && ((PEOPLE as any)[id].seat === 'FCP' || (PEOPLE as any)[id].seat === 'RCP'))!
    expect(other, 'premise: a man SANS today').toBeTruthy()
    const at = new Date(2026, 6, 15, 9, 0, 0).getTime()
    const rec = { type: 'SANS Availability', date: fmt(FRI), person: other, by: 'ad', at,
      people: [{ p: other, by: 'ad', at }, { p: 'rocky', by: 'ad', at }],
      allday: true, s: 360, e: 1080, sans: { f: true } }
    const g = sansDayGroups(FRI, [rec])
    const all = [...g.p, ...g.w, ...g.other, ...g.out]
    expect(all.map(e => e.id), 'premise: Hex (not SANS on Fri) is hidden').toEqual([other])
    expect(all[0].placed, 'premise: a placed line is written').toBeTruthy()
    expect(all[0].placed).not.toContain('2 people')
    expect(all[0].placed).toContain(String((PEOPLE as any)[other].cs))
  })
})
