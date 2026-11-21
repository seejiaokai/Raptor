// @vitest-environment jsdom
/* WHO IS AVAILABLE, AND A HOLIDAY'S NAME AND TAG, ON AN OWN PAGE WHOSE SQUADRON IS NOT THE LOADED LEAVE WAR'S (helper
   "left2" of the multi-squadron reshape build, 21 Nov 26 — the earlier helper "left"'s findings, his probes measured).

   The own pages (the Inputs calendar, the SANS calendar and its opened day, the Calendar window) are their squadron's;
   the Leave War loaded may be another's — Hunter, 142's admin with View of 149, with 149 picked and its war loaded; or a
   man whose own move takes effect at midnight while a Leave War window holds the old war (the hold).
   Fault 1: "who is available" was the LOADED war's whatever squadron was asked, so 149's "still needed" read 142's
   availability (11 / 22 where 149's own war says 35 / 35), and a 142 pilot's leave moved 149's answer. The host's fix:
   not known rather than wrong — another squadron's availability is unknown ("–", no colour), and the SANS day then
   says nothing about leave periods (that sentence would be false).
   Fault 2: the day's KIND was the page's squadron's (D2195 — each squadron owns its own holiday list) but its NAME and
   short TAG were the loaded war's, so 142's "Founders Day" read "PH" with no name while 149's war was loaded.
   Red first on 92cad1c11 (the tip of claude/multi-sqn-b1-107 when helper "left2" began). The world:
   test-support/msq-world.ts. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useMsqWorld, signInAs, acrossMove, pastMidnight, PID, ACCT } from '../test-support/msq-world'
import { switchUnit, notify, setEntryHold } from '../state/store'
import { setGrant } from '../state/units'
import { setFlyDays } from '../state/flyplan'
import { swapWarWorld, warUnit, flyAnswer, dayFacts } from '../leavewar/sync'
import { holidayAdd, setRole, worldUnit } from '../leavewar/state/store'
import { setPage, setInpView, setCalMonth } from '../state/view'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { pageUnit } from '../state/perms'
import { fileAbsence } from '../leavewar/testkit'
import { InputsCal } from './InputsCal'
import { SansCal } from './SansCal'
import { SansDay } from './SansDay'
import { DaysWindow } from './DaysWindow'
import { setInpEdit, setDaysWin } from './pops'
import { _resetFloatWins } from './winorder'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

useMsqWorld()

const DAY = '2026-07-20'       // Mon 20 Jul 26 — Required 40 / 40 typed for both squadrons (fault 1)
const ND = '2026-07-17'        // Fri 17 Jul — 149's own holiday, "National Day" (ND)
const FD = '2026-07-21'        // Tue 21 Jul — 142's own holiday, "Founders Day" (FD)
const NOWHERE = '2031-03-03'   // a Monday no leave period of either squadron covers
let host: HTMLDivElement, root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const tid = (t: string) => $(`[data-testid="${t}"]`)

beforeEach(() => {
  setPage('inputs'); setInpView('cal')
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
})
afterEach(async () => {
  await act(async () => { root.unmount() })
  host.remove(); _resetFloatWins(); setInpEdit(null); setDaysWin(null); setEntryHold(null)
  if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT)
})
const render = async (el: any) => {
  await act(async () => { root.render(el) })
  await act(async () => { setCalMonth({ y: 2026, m: 7 }); notify() })
}
const warOf = (unit: string) => { swapWarWorld(unit); setRole('admin'); expect(worldUnit()).toBe(unit) }
/* Required 40 / 40 on DAY for both squadrons, typed by Saber (a master admin) */
const required = () => {
  signInAs('saber')
  expect(setFlyDays([{ iso: DAY, cls: 'day', p: 40, w: 40 }], 'u149')).toMatchObject({ ok: true })
  expect(setFlyDays([{ iso: DAY, cls: 'day', p: 40, w: 40 }], 'u142')).toMatchObject({ ok: true })
}
/* each squadron its own holiday, on its own day (D2195): Kestrel's 149 National Day, Saber's 142 Founders Day */
const holidays = () => {
  signInAs('kestrel'); warOf('u149')
  expect(holidayAdd({ kind: 'ph', name: 'National Day', short: 'ND', from: ND, to: ND }).ok, "149's holiday saved").toBe(true)
  signInAs('saber'); warOf('u142')
  expect(holidayAdd({ kind: 'ph', name: 'Founders Day', short: 'FD', from: FD, to: FD }).ok, "142's holiday saved").toBe(true)
}
/* Hunter (142's admin) with View of 149 picks 149, and 149's war is loaded: his own pages stay 142's */
const hunterOn149 = () => {
  signInAs('saber')
  expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter)).toMatchObject({ ok: true })
  signInAs('hunter')
  switchUnit('u149')
  swapWarWorld('u149')
  expect([UNIT, warUnit(), pageUnit('own')], 'the pick and the war 149’s, his own pages 142’s').toEqual(['u149', 'u149', 'u142'])
}
/* Ranger's own move 142 → 149 takes effect at midnight while a Leave War window holds 142's war (the hold) */
const rangerAcrossMidnight = () => {
  acrossMove(PID.ranger, 'u142', 'u149')
  signInAs('ranger')
  expect([pageUnit('own'), warUnit()]).toEqual(['u142', 'u142'])
  setEntryHold(() => 'war')
  pastMidnight()
  expect([pageUnit('own'), warUnit()], 'his own pages 149’s, the war still 142’s').toEqual(['u149', 'u142'])
}

describe('fault 1 — another squadron’s “still needed” is not known, never the loaded war’s figure', () => {
  it('149 asked for while 142’s war is loaded: not known — not 142’s 11 / 22; 142’s own figure unchanged', () => {
    required()
    expect(warUnit()).toBe('u142')
    expect(flyAnswer(DAY).need, '(control) 142’s own, by its own war').toEqual({ p: 11, w: 22 })
    expect(flyAnswer(DAY, 'u142').need, '(control) the same by name').toEqual({ p: 11, w: 22 })
    expect(flyAnswer(DAY, 'u149').need, '149’s: not known').toEqual({ p: null, w: null })
    expect(flyAnswer(DAY, 'u149').req, 'its Required is still its own').toEqual({ p: 40, w: 40 })
  })
  it('a 142 pilot’s leave does not move 149’s answer', () => {
    required()
    const before = flyAnswer(DAY, 'u149').need
    const b = dayFacts(DAY).availP
    fileAbsence(PID.ranger, 'LL', DAY)
    expect(dayFacts(DAY).availP, 'setup: Ranger’s leave lowers 142’s available').not.toBe(b)
    expect(flyAnswer(DAY, 'u149').need).toEqual(before)
    expect(flyAnswer(DAY).need, '(control) 142’s own moves').toEqual({ p: 12, w: 22 })
  })
  it('Ranger, his move at midnight with a window open: the SANS day shows “–” for Available and Still needed, and no leave-period note', async () => {
    required()
    rangerAcrossMidnight()
    await render(<SansDay iso={DAY} hi={null} onClose={() => {}} />)
    expect(tid('sd-req-p')?.textContent, '149’s Required').toBe('40')
    expect([tid('sd-avail-p')?.textContent, tid('sd-avail-w')?.textContent]).toEqual(['–', '–'])
    expect([tid('sd-need-p')?.textContent, tid('sd-need-w')?.textContent]).toEqual(['–', '–'])
    expect(tid('sd-nocover'), 'no "No leave period covers this date" — that would be false').toBeNull()
  })
  it('…and the SANS calendar’s month shows “–” and no colour on that date', async () => {
    required()
    rangerAcrossMidnight()
    await render(<SansCal />)
    const cell = tid('sc-day-' + DAY)!
    expect(cell, 'the date drawn').toBeTruthy()
    expect(tid('sc-need-' + DAY)?.textContent).toBe('–')
    expect(/\bt-(yellow|amber|red)\b/.test(cell.className), 'no colour').toBe(false)
    expect(cell.getAttribute('aria-label') ?? '', 'not said as a date no leave period covers').not.toContain('No leave period covers')
  })
  it('the other way round — 142 asked for while 149’s war is loaded: not known, not worked from 149’s availability', () => {
    required()
    hunterOn149()
    expect(flyAnswer(DAY, 'u142').need).toEqual({ p: null, w: null })
    expect(flyAnswer(DAY).need, '(control) 149’s own, by its own war').toEqual({ p: 35, w: 35 })
  })
  it('(control) the loaded squadron’s own SANS day: its figures, and a date no period covers still says so', async () => {
    required()
    expect(dayFacts(NOWHERE).covered, 'setup: no period covers it').toBe(false)
    await render(<SansDay iso={DAY} hi={null} onClose={() => {}} />)
    expect([tid('sd-avail-p')?.textContent, tid('sd-need-p')?.textContent, tid('sd-need-w')?.textContent]).toEqual(['29', '11', '22'])
    expect(tid('sd-nocover')).toBeNull()
    await act(async () => { root.render(<SansDay iso={NOWHERE} hi={null} onClose={() => {}} />) })
    expect(tid('sd-nocover')?.textContent).toBe('No leave period covers this date, so who is available is not known.')
  })
})

describe('fault 2 — a holiday’s name and tag are the page’s own squadron’s, never the loaded war’s', () => {
  it('the Inputs calendar (Ranger’s, 149’s since midnight, 142’s war held): 17 Jul tagged ND and opened as “Public holiday · National Day”', async () => {
    holidays()
    rangerAcrossMidnight()
    await render(<InputsCal fPerson="all" fType="all" fSearch="" />)
    expect(warUnit(), 'the war still 142’s').toBe('u142')
    expect(tid('ib-tag-' + ND)?.textContent).toBe('ND')
    expect(tid('ib-tag-' + FD), '142’s holiday is not 149’s').toBeNull()
    await act(async () => { $(`[data-icday="${ND}"]`)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })) })
    expect(tid('win-inputsday')?.textContent).toContain('Public holiday · National Day')
  })
  it('the SANS calendar and its day (the same): ND, and “Public holiday · National Day”', async () => {
    holidays()
    rangerAcrossMidnight()
    await render(<SansCal />)
    expect(warUnit(), 'the war still 142’s').toBe('u142')
    expect(tid('sc-tag-' + ND)?.textContent).toBe('ND')
    await act(async () => { root.render(<SansDay iso={ND} hi={null} onClose={() => {}} />) })
    expect(tid('win-sansday')?.textContent).toContain('Public holiday · National Day')
  })
  it('the Calendar window opened for 142 with 149’s war loaded: FD, its title naming Founders Day', async () => {
    holidays()
    signInAs('saber')
    switchUnit('u149'); swapWarWorld('u149')
    expect(warUnit()).toBe('u149')
    await act(async () => { setDaysWin(FD) })
    await render(<DaysWindow unit="u142" />)
    expect(tid('days-tag-' + FD)?.textContent).toBe('FD')
    expect(tid('days-tag-' + FD)?.getAttribute('title')).toBe('Founders Day - public holiday')
  })
  it('(control) 142’s own pages with 142’s war loaded: FD, and “Public holiday · Founders Day”', async () => {
    holidays()
    expect(warUnit()).toBe('u142')
    await render(<InputsCal fPerson="all" fType="all" fSearch="" />)
    expect(tid('ib-tag-' + FD)?.textContent).toBe('FD')
    await act(async () => { root.render(<SansDay iso={FD} hi={null} onClose={() => {}} />) })
    expect(tid('win-sansday')?.textContent).toContain('Public holiday · Founders Day')
  })
})
