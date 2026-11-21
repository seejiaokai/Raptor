// @vitest-environment jsdom
/* THE FLYING PLAN BY THE PAGE'S OWN SQUADRON ON THE OWN PAGES (the reshape plan
   docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §3.2 A-ii: the Inputs calendar, the SANS calendar and its day
   are own pages — his own squadron's, a master admin's or a Plan holder's following his pick).

   The flying plan's answers (leavewar/sync.ts flyAnswer / flyMonth) default to the squadron whose Leave War is loaded.
   An own page asks for its own squadron's. Here 142's and 149's plans differ on Wed 22 Jul — 142 has no flying (NF),
   149 flies at night — and Hunter, 142's plain admin with View of 149, has 149 picked while 149's war is the one loaded:
   every own page shows 142's answer. The world: test-support/msq-world.ts. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useMsqWorld, signInAs, PID, ACCT } from '../test-support/msq-world'
import { switchUnit, notify } from '../state/store'
import { setGrant } from '../state/units'
import { setFlyDays } from '../state/flyplan'
import { swapWarWorld, warUnit, flyAnswer } from '../leavewar/sync'
import { setPage, setInpView, setCalMonth } from '../state/view'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { pageUnit } from '../state/perms'
import { InputsCal } from './InputsCal'
import { SansCal } from './SansCal'
import { SansDay } from './SansDay'
import { DaysWindow } from './DaysWindow'
import { openSansAdd } from './sansadd'
import { INPEDIT, setInpEdit, setDaysWin } from './pops'
import { _resetFloatWins } from './winorder'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

useMsqWorld()

const NF = '2026-07-22'       // 142: no flying · 149: night flying
const ONLY142 = '2026-07-23'  // set for this date on 142's plan alone
let host: HTMLDivElement, root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null

beforeEach(() => {
  setPage('inputs'); setInpView('cal')
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
})
afterEach(async () => {
  await act(async () => { root.unmount() })
  host.remove(); _resetFloatWins(); setInpEdit(null); setDaysWin(null)
  if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT)
})

/* the two plans, set by Saber (a master admin); then Hunter, with View of 149, picks 149 — and 149's war is loaded */
function setup(): void {
  signInAs('saber')
  expect(setFlyDays([{ iso: NF, cls: 'nf' }, { iso: ONLY142, cls: 'night' }], 'u142')).toMatchObject({ ok: true })
  expect(flyAnswer(ONLY142, 'u142').clsFrom, "142's date set").toBe('date')
  expect(flyAnswer(ONLY142, 'u149').clsFrom, "149's not").not.toBe('date')
  expect(setFlyDays([{ iso: NF, cls: 'night' }], 'u149')).toMatchObject({ ok: true })
  expect(flyAnswer(NF, 'u142').cls).toBe('nf')
  expect(flyAnswer(NF, 'u149').cls).toBe('night')
  expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter)).toMatchObject({ ok: true })
  signInAs('hunter')
  switchUnit('u149')
  swapWarWorld('u149')
  expect([UNIT, warUnit(), pageUnit('own')], 'the pick and the war 149’s, his own pages 142’s').toEqual(['u149', 'u149', 'u142'])
}
const render = async (el: any) => {
  await act(async () => { root.render(el) })
  await act(async () => { setCalMonth({ y: 2026, m: 7 }); notify() })
}

describe("the flying plan on his own pages is his own squadron's — 142's, while 149 is picked and its war loaded", () => {
  it("the Inputs calendar's month: 22 Jul is 142's no-fly day", async () => {
    setup()
    await render(<InputsCal fPerson="all" fType="all" fSearch="" />)
    expect($(`[data-testid="ib-tag-${NF}"]`)?.textContent, "142's NF").toBe('NF')
  })

  it("the SANS calendar's month: 22 Jul is 142's no-fly day", async () => {
    setup()
    await render(<SansCal />)
    expect($(`[data-testid="sanscal"]`), 'the SANS calendar').toBeTruthy()
    await act(async () => { setCalMonth({ y: 2026, m: 7 }); notify() })
    expect($(`[data-testid="sc-tag-${NF}"]`)?.textContent, "142's NF").toBe('NF')
  })

  it("the SANS day: 22 Jul reads 142's “No fly”", async () => {
    setup()
    await render(<SansDay iso={NF} hi={null} onClose={() => {}} />)
    expect(document.body.textContent).toContain('No fly')
    expect(document.body.textContent).not.toContain('Night flying')
  })

  it("SANS “+ Commitment” on 22 Jul opens on 142's no-fly day — no flying offered", () => {
    setup()
    expect(openSansAdd(NF)).toBe(true)
    expect((INPEDIT as any)?.sans, "142's NF: nothing offered").toEqual({})
  })

  it("the control: a master admin's pick of 149 moves his own pages to 149's plan", async () => {
    setup()
    signInAs('saber')
    switchUnit('u149')
    swapWarWorld('u149')
    expect(pageUnit('own')).toBe('u149')
    await render(<InputsCal fPerson="all" fType="all" fSearch="" />)
    expect($(`[data-testid="ib-tag-${NF}"]`), "149 flies at night: no tag").toBeNull()
    expect(openSansAdd(NF)).toBe(true)
    expect((INPEDIT as any)?.sans).toEqual({ f: true })
  })

  it("the Calendar window opened for 142 shows 142's plan", async () => {
    setup()
    await act(async () => { setDaysWin(ONLY142) })
    await render(<DaysWindow unit="u142" />)
    expect($(`[data-testid="days-cell-${ONLY142}"]`), 'the month drawn').toBeTruthy()
    expect($(`[data-testid="days-dot-${ONLY142}"]`), "142's date set").toBeTruthy()
  })
})
