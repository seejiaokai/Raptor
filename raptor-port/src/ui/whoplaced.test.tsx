// @vitest-environment jsdom
/* WHO PLACED AN INPUT, AND WHEN — his D629 (7 Oct 26). The doors of the build plan's §3.8 table that are SCREENS'
   own: the Inputs List's Add form (its own maker, not the editor's), the List's edit-in-place, and an OIL answer given
   alone — from the List's OIL chip and from the editor's "Change…". Driven on the real page over the real store; the
   other doors (the editor's save, the Leave War, the medical cuts, a posting, Undo and Redo) are in
   `leavewar/whoplaced.test.ts`. ONE clock, fixed at 15 Jul 26 and stepped by the hour. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, writeInputsBatch } from '../state/store'
import { setMe, DEFAULT_ME } from '../state/auth'
import { INPUTS, inpId, nowStamp } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { setInpEdit, INPEDIT } from './pops'
import { setPage } from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const setV = async (el: any, v: string) => act(async () => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
  setter.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true }))
})
/* the list as the app holds it once it is up — taken AFTER the store has given every record its id (a copy without
   ids would be given new ones inside the next save, which to a member's save reads as changing other people's inputs) */
let ISNAP = ''
const toast = HOOKS.toast
const T = (h: number): number => { const d = new Date(2026, 6, 15, h, 0, 0); vi.setSystemTime(d); return d.getTime() }
/* who is signed in: the admin Saber (`stiff`), a second admin Casper, the member Ranger (`bane`) */
const as = async (who: 'stiff' | 'casper' | 'bane') => act(async () => {
  setSession({ user: who, role: who === 'bane' ? 'main' : 'admin' }); setMe(who); notify()
})
const stamps = (r: any) => ({ by: r.by, at: r.at, modBy: r.modBy, modAt: r.modAt })
const placed = (who: string, t: number) => ({ by: who, at: t, modBy: who, modAt: t })
/* a record already there, filed by Ranger at eight o'clock */
const T0 = new Date(2026, 6, 15, 8, 0, 0).getTime()
const plant = (r: any) => {
  const row: any = { allday: true, remarks: 'whoplaced', mod: '2026-07-01', yr: 2026, by: 'bane', at: T0, modBy: 'bane', modAt: T0, ...r }
  inpId(row)
  writeInputsBatch(() => { INPUTS.unshift(row) })
  return INPUTS[0]
}
const openList = async () => {
  await act(async () => { setPage('inputs'); notify() })
  if ($('#inListBtn')) await click($('#inListBtn'))
  if (!$('#inRangePop')) await click($('#inRangeBtn'))
  await click($('#inRangeAll'))
}

beforeAll(async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  T(8)
  initStore()
  INPUTS.forEach((r: any) => inpId(r))
  ISNAP = JSON.stringify(INPUTS)
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  HOOKS.toast = () => {}
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
  HOOKS.toast = toast
  setSession(null); setMe(DEFAULT_ME)
  vi.useRealTimers()
})
beforeEach(async () => {
  if (INPEDIT) await act(async () => { setInpEdit(null); notify() })
  setSession(null)
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  T(8)
})

describe('the Inputs List (§3.8 rows 2, 3 and 4)', () => {
  it('its Add form: placed by whoever pressed Add, now', async () => {
    await as('stiff')
    await openList()
    const t1 = T(9)
    await click($('#inCal [data-cal="2026-07-14"]'))
    await click($('#inCal [data-cal="2026-07-14"]'))
    const n = INPUTS.length
    await click($('#inAdd'))
    expect(INPUTS.length, 'the form filed one input').toBe(n + 1)
    expect(stamps(INPUTS[0])).toEqual(placed('stiff', t1))
    expect(INPUTS[0].mod, 'the late rule\'s date is written as before').toBe(nowStamp())
  })

  it('its edit in place: who placed it is kept, changed by whoever pressed the tick, now', async () => {
    await as('stiff')
    const r = plant({ person: 'bane', type: 'Meeting', date: 'Jul 14', allday: false, s: 540, e: 600 })
    await openList()
    await as('casper')
    const t2 = T(10)
    await click($(`tr[data-iid="${r.iid}"] [data-edit]`))
    await setV($('#inBody tr.ined input[data-ed="remarks"]'), 'room changed')
    await click($('#inBody tr.ined [data-save]'))
    expect(r.remarks).toBe('room changed')
    expect(stamps(r)).toEqual({ by: 'bane', at: T0, modBy: 'casper', modAt: t2 })
    expect(r.mod).toBe(nowStamp())
  })

  it('an OIL answer changed alone, from the row\'s chip: changed by whoever answered — and the late rule\'s date is NOT moved', async () => {
    await as('stiff')
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', endDate: 'Jul 19', s: 0, e: 1439, oil: { '2026-07-18': 1, '2026-07-19': 0 } })
    await openList()
    const t3 = T(11)
    await click(document.querySelector(`tr[data-iid="${r.iid}"] .roil`))
    await click($('[data-testid="oil-all"]'))
    await click($('[data-testid="oilconf-save"]'))
    expect(r.oil).toEqual({ '2026-07-18': 1, '2026-07-19': 1 })
    expect(stamps(r)).toEqual({ by: 'bane', at: T0, modBy: 'stiff', modAt: t3 })
    expect(r.mod, 'an answer alone never made an input late, and still does not').toBe('2026-07-01')
  })
})

describe('the editor\'s OIL sheet (§3.8 row 4)', () => {
  it('"Change…" on a recorded answer: changed by whoever answered, now', async () => {
    await as('stiff')
    const r = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', s: 0, e: 1439, oil: { '2026-07-18': 0 } })
    const t2 = T(10)
    await act(async () => { setInpEdit(r); notify() })
    await click($('[data-testid="oil-revise"]'))
    await click($('[data-testid="oil-yes"]'))
    await click($('[data-testid="oilconf-save"]'))
    expect(r.oil).toEqual({ '2026-07-18': 1 })
    expect(stamps(r)).toEqual({ by: 'bane', at: T0, modBy: 'stiff', modAt: t2 })
  })

  it('a new input answered at its save is ONE filing: placed and "changed" read the same moment', async () => {
    await as('bane')
    const t1 = T(9)
    await act(async () => { setInpEdit({ _new: true, person: 'bane', allday: true, remarks: 'whoplaced new', yr: 2026, type: 'Duty', date: 'Jul 18' }); notify() })
    await click($('#inpEditSave'))
    await click($('[data-testid="oil-yes"]'))
    await click($('[data-testid="oilconf-save"]'))
    const r = INPUTS.find((x: any) => /whoplaced new/.test(x.remarks || ''))
    expect(r, 'the input landed').toBeTruthy()
    expect(r.oil).toEqual({ '2026-07-18': 1 })
    expect(stamps(r)).toEqual(placed('bane', t1))
  })
})
