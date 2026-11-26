// @vitest-environment jsdom
/* [END-TIME-GUARD] step 5 — WHAT THE SCHEDULER SEES (his D2853, D2854, D2734, D2855 E1; the approved try-out
   docs/mock/2026-11-25-endtime-tryout/). Driven through the real App on Edit Schedule and the Scheduler Board:
   - the outline: a thin line inside each empty time box the rule names — grey while drafting, red once a press is
     refused, until the time is typed; only on a box that can be typed in, so never on View-only Sched (D2853);
   - Edit Schedule's sign-off line: "N items missing a time · N to sign" (D2854); the board's the same, with the names of
     the boxes still to sign back only once the last time is typed (D2734). The tap on the line is a later step;
   - a sign-off box that is refused without its list opening (the try-out), and the greyed Publish day that takes a press
     and says the note (D2855 E1).
   Thursday (day 3) and Monday (day 0) have every time typed in the remade demo week; each case empties one. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { txtSet } from '../engine/slots'
import * as view from '../state/view'
import { HOOKS } from '../engine/hooks'
import { openScheduler, closeScheduler } from './board'
import { resetTimeRed } from './timegap-paint'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const THU = 3
let DSNAP = ''
let host: HTMLDivElement
let root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const key = async (el: Element | null, k: string) => {
  expect(el, 'key target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })) })
}
const edit = async (path: string, v: string) => { await act(async () => { expect(txtSet(path, v), `typed ${path}`).toBe(true); view.afterSchedMutate(); notify() }) }
let said: Array<[string, any]> = []
const realToast = HOOKS.toast
const blocked = () => said.filter(([, k]) => k === 'blocked').map(([m]) => m)
const weekBox = (k: string) => $(`#eWeek [data-txt="${k}"]`)
const boardBox = (k: string) => $(`#schedBoard [data-bfld="${k}"]`)
const missIn = (scope: string) => $$(`${scope} .tg-miss`).map(e => e.getAttribute('data-txt') || e.getAttribute('data-bfld'))
const sgnOf = (role: string) => ($(`#eWeek .day[data-day="${THU}"] select[data-sign="${role}"]`) as HTMLElement).closest('.sgn') as HTMLElement
const weekLine = (di: number) => $(`#eWeek .day[data-day="${di}"] .signoff.day-sign .so-state`)

beforeAll(async () => {
  initStore(); DSNAP = JSON.stringify(DAYS)
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove(); HOOKS.toast = realToast
})
beforeEach(async () => {
  await act(async () => { closeScheduler() })
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.drafts = {}; SCHED.curDraft = {}
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}; SCHED.signBind = {}; SCHED.correcting = {}
  view.DPREV.clear(); view.VWORK.clear()
  resetTimeRed()
  said = []
  HOOKS.toast = ((m: any, k: any) => { said.push([String(m), k]) }) as any
  await act(async () => { notify() })
})

describe('the outline on Edit Schedule (D2853)', () => {
  it('the remade demo week shows no outline anywhere', () => {
    expect(missIn('#eWeek')).toEqual([])
  })

  it('an emptied END is outlined grey — that box only', async () => {
    await edit('dr:3.0.0.end', '')
    expect(missIn('#eWeek')).toEqual(['dr:3.0.0.end'])
    expect(weekBox('dr:3.0.0.end').classList.contains('tg-red')).toBe(false)
  })

  it('a refused press turns the outlined boxes red; typing the time takes the outline away', async () => {
    await edit('dr:3.0.0.end', ''); await edit('gr:3.0.str', '')
    await click($(`#eWeek .day[data-day="${THU}"] .sgn.tg-block`))
    expect(blocked()).toEqual(['Blocked: 2 items are missing a time, each outlined in red. Type the missing times, then sign.'])
    expect(weekBox('dr:3.0.0.end').classList.contains('tg-red')).toBe(true)
    expect(weekBox('gr:3.0.str').classList.contains('tg-red')).toBe(true)
    await edit('dr:3.0.0.end', '13:00')
    expect(weekBox('dr:3.0.0.end').className).not.toMatch(/tg-(miss|red)/)
    expect(weekBox('gr:3.0.str').classList.contains('tg-red'), 'the other stays red until its time is typed').toBe(true)
  })

  it('View-only Sched never shows it (D2853)', async () => {
    await edit('dr:3.0.0.end', '')
    await act(async () => { view.setPage('viewsched'); notify() })
    expect($$('#vWeek .tg-miss')).toEqual([])
    await act(async () => { view.setPage('editsched'); notify() })
  })
})

describe('Edit Schedule\'s sign-off line (D2854)', () => {
  it('one item: "1 item missing a time · 4 to sign"', async () => {
    await edit('dr:3.0.0.end', '')
    expect(weekLine(THU).textContent).toBe('1 item missing a time · 4 to sign')
  })
  it('three items: "3 items missing a time · 4 to sign"; back to "4 to sign" once typed', async () => {
    await edit('dr:3.0.0.end', ''); await edit('dr:3.0.1.str', ''); await edit('gr:3.0.end', '')
    expect(weekLine(THU).textContent).toBe('3 items missing a time · 4 to sign')
    await edit('dr:3.0.0.end', '13:00'); await edit('dr:3.0.1.str', '06:00'); await edit('gr:3.0.end', '12:30')
    expect(weekLine(THU).textContent).toBe('4 to sign')
  })
})

describe('the sign-off box refuses without opening its list (the try-out)', () => {
  it('while a time is missing the list cannot open or take the keys; the box itself takes the press', async () => {
    const sgn = () => sgnOf("cur")
    expect(sgn().classList.contains('tg-block')).toBe(false)
    expect((sgn().querySelector('select') as HTMLSelectElement).disabled).toBe(false)
    await edit('dr:3.0.0.end', '')
    const s = sgn().querySelector('select') as HTMLSelectElement
    expect(sgn().classList.contains('tg-block')).toBe(true)
    expect(s.disabled, 'the list cannot open').toBe(true)
    expect(s.tabIndex, 'nor take the keys').toBe(-1)
    expect(sgn().getAttribute('role')).toBe('button')
    expect(sgn().getAttribute('aria-disabled')).toBe('true')
    expect(sgn().tabIndex).toBe(0)
  })
  it('Enter or Space on the box says the note', async () => {
    await edit('dr:3.0.0.end', '')
    await key(sgnOf("sked"), 'Enter')
    await key(sgnOf("plan"), ' ')
    expect(blocked()).toEqual(Array(2).fill('Blocked: 1 item is missing a time, outlined in red. Type the missing time, then sign.'))
  })
})

describe('the greyed Publish day takes a press while a time is missing (D2855 E1)', () => {
  const beak = () => $(`#eWeek .day[data-day="${THU}"] button[data-beak]`) as HTMLButtonElement
  it('unsigned, nothing missing: greyed and disabled as before', () => {
    expect(beak().disabled).toBe(true)
  })
  it('unsigned, a time missing: still greyed, pressable, the press refused with the note and the box red', async () => {
    await edit('dr:3.0.0.end', '')
    expect(beak().disabled).toBe(false)
    expect(beak().getAttribute('aria-disabled')).toBe('true')
    expect(beak().classList.contains('locked')).toBe(true)
    await click(beak())
    expect(blocked()).toEqual(['Blocked: 1 item is missing a time, outlined in red. Thursday was not published.'])
    expect(weekBox('dr:3.0.0.end').classList.contains('tg-red')).toBe(true)
  })
})

describe('the Scheduler Board (D2853, D2734)', () => {
  it('its time boxes carry the outline — a desk, a flying line\'s take-off and landing, a Common Programme row', async () => {
    await edit('dr:0.0.0.end', ''); await edit('ff:0.0.0.ld', ''); await edit('ap:0.1.end', '')
    await act(async () => { openScheduler(0) })
    expect([...new Set(missIn('#schedBoard'))].sort()).toEqual(['ap:0.1.end', 'dr:0.0.0.end', 'ff:0.0.0.ld'])
    expect($$('#schedBoard input[data-bfld="ff:0.0.0.ld"]').every(e => e.classList.contains('tg-miss')), 'every copy of the line\'s landing box, one an aircraft row').toBe(true)
  })
  it('its sign-off line reads only the count and "N to sign" while a time is missing; the names come back after', async () => {
    await edit('dr:3.0.0.end', '')
    await act(async () => { openScheduler(THU) })
    expect($('#sbSignBar .so-state').textContent).toBe('1 item missing a time · 4 to sign')
    await edit('dr:3.0.0.end', '13:00')
    expect($('#sbSignBar .so-state').textContent).toMatch(/^4 to sign · CUR CK/)
  })
})

describe('kept for his answers (the plan §R5)', () => {
  it.todo('a box emptied after a refused press: red or grey — waits on his answer R3 (built: grey until the next refused press)')
  it.todo('the count line tapped goes to each empty box in turn — Edit Schedule a later step (D2854); the board waits on his answer Q19')
  it.todo('the desktop Amendments panel\'s Publish AL greyed but pressable — waits on his answer R6 (today: disabled until signed)')
})
