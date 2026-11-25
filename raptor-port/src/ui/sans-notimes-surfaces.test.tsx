// @vitest-environment jsdom
/* HIS D2573 ON EVERY PLACE THAT DRAWS IT (the bug check's break tests, docs/bug-check-order.md §8.4): the engine test
   (engine/sans-notimes-strike.test.ts) pins slotBar's answer; this file pins that each place reading it SHOWS it for a
   flying seat with no times yet — the crew list with that seat armed, the reason under a dragged puck, the green
   "where can he go" rings, and the note after a tap-to-plan and after a drop. Each test builds its own seat with no
   times, asserts that precondition, and has a control (an ordinary free pilot) so it goes red at the assertion that
   matters when the strike is taken out, never at the set-up. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { slotVal, setSlotVal } from '../engine/slots'
import { HOOKS } from '../engine/hooks'
import { afterSchedMutate, armSlot, armedKey, disarmSlot, placeArmed, selectPerson, SELID } from '../state/view'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { slotRules } from '../engine/avail'
import { paintSelRings } from './highlights'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const NONE = 'SANS — no availability filed for today'
const ID = 'ipman'          // a SANS pilot of the seed, nothing filed for Mon 13 Jul
let host: HTMLDivElement
let root: Root
let toasts: string[] = []
const origToast = HOOKS.toast
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const dtWith = (): any => ({ data: {} as any, effectAllowed: '', setData(k: string, v: string) { this.data[k] = v }, getData(k: string) { return this.data[k] || '' }, setDragImage() {} })
const fire = async (el: Element, t: string, dt: any) => {
  const ev: any = new Event(t, { bubbles: true, cancelable: true }); try { ev.dataTransfer = dt } catch (_) {}
  await act(async () => { el.dispatchEvent(ev) })
}
/* an ordinary free pilot: the control that shows the seat itself is open to a man with no SANS rule */
const freePilot = () => Object.keys(PEOPLE).find(id => PEOPLE[id] && PEOPLE[id].seat === 'FCP' && !PEOPLE[id].san
  && !PEOPLE[id].special && !PEOPLE[id].pers && !PEOPLE[id].archived
  && !DAYS[0].waves.some((w: any) => JSON.stringify(w).includes(`"${id}"`)))!

/* a new flying line on Monday, made the way "+ Wave" makes one (a blank line), nothing typed: no times */
let KEY = ''
const addBlankLine = async () => {
  const f: any = { cs: '', msn: '', to: '', ld: '', aircraft: [{ p: '', w: '', area: '', rmks: '', opts: {} }] }
  DAYS[0].waves.push({ label: 'ZB', night: false, intimes: [], traffic: [], formations: [f] })
  KEY = `0.${DAYS[0].waves.length - 1}.0.0.p`
  await act(async () => { afterSchedMutate(); notify() })
  const r = slotRules(KEY)
  expect(r.slotStart, 'precondition: no take-off typed').toBeNull()
  expect(r.slotEnd, 'precondition: no landing typed').toBeNull()
  expect(INPUTS.some((i: any) => i.type === 'SANS Availability' && i.person === ID), 'precondition: nothing filed').toBe(false)
}

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click([...document.querySelectorAll('.nav a[data-page]')].find(a => (a as HTMLElement).dataset.page === 'editsched')!)
  HOOKS.toast = (m: any) => { toasts.push(String(m)) }
  await addBlankLine()
})
afterAll(async () => {
  HOOKS.toast = origToast
  await act(async () => { root.unmount() })
  host.remove()
})
beforeEach(() => { toasts = []; if (armedKey()) disarmSlot(); if (SELID) selectPerson(SELID) })

describe('D2573 — every place that reads the strike, on a flying seat with no times', () => {
  it('the crew list, that seat armed: he is struck and his reason is under his name', async () => {
    await act(async () => { armSlot(KEY); notify() })
    expect(armedKey()).toBe(KEY)
    const puck = $(`#eRoster .rpuck[data-person="${ID}"]`)
    expect(puck, 'his puck is in the crew list').toBeTruthy()
    const row = puck.closest('.rsans-row') || puck.parentElement!
    expect(row.outerHTML, 'the reason under his name').toContain(NONE)
    expect(puck.className, 'struck').toMatch(/\bno\b/)
    const ctl = $(`#eRoster .rpuck[data-person="${freePilot()}"]`)
    expect(ctl && ctl.className, 'the control: an ordinary pilot is free for the seat').not.toMatch(/\bno\b/)
  })

  it('the drag hover: his reason rides under the ghost over that seat', async () => {
    const seat = $(`#eWeek .seat[data-slot="${KEY}"]`)
    expect(seat, 'the seat is drawn on the week').toBeTruthy()
    const src = $(`#eRoster .rpuck[data-person="${ID}"]`)
    const dt = dtWith()
    await fire(src, 'dragstart', dt)
    await fire(seat, 'dragover', dt)
    const ghost = $('.dragimg')
    expect(ghost, 'the ghost is up').toBeTruthy()
    expect(ghost.querySelector('.dwhy')?.textContent, 'the reason under the ghost').toBe(NONE)
    expect(seat.classList.contains('dragover-why')).toBe(true)
    await fire(src, 'dragend', dt)
  })

  it('the green rings: selected, he gets no ring on that seat; an ordinary pilot does', async () => {
    const ctl = freePilot()
    await act(async () => { selectPerson(ctl); notify() })
    await act(async () => { paintSelRings() })
    expect($(`#eWeek .seat[data-slot="${KEY}"]`).className, 'the control: the open seat rings for him').toMatch(/oktake/)
    await act(async () => { selectPerson(ID); notify() })
    await act(async () => { paintSelRings() })
    expect(SELID).toBe(ID)
    expect($(`#eWeek .seat[data-slot="${KEY}"]`).className, 'no ring for the struck SANS man').not.toMatch(/oktake/)
  })

  it('the note after a tap-to-plan names his reason', async () => {
    await act(async () => { armSlot(KEY) })
    let ok = false
    await act(async () => { ok = placeArmed(ID) })
    expect(ok, 'he plants (a struck name still plants)').toBe(true)
    expect(slotVal(KEY)).toBe(ID)
    expect(toasts.at(-1), 'the note').toBe(`${PEOPLE[ID].cs} — ${NONE}`)
    await act(async () => { setSlotVal(KEY, ''); afterSchedMutate(); notify() })
  })

  it('the note after a drop names his reason', async () => {
    const seat = $(`#eWeek .seat[data-slot="${KEY}"]`)
    const src = $(`#eRoster .rpuck[data-person="${ID}"]`)
    const dt = dtWith()
    await act(async () => {
      src.dispatchEvent(Object.assign(new Event('dragstart', { bubbles: true, cancelable: true }), { dataTransfer: dt }))
      seat.dispatchEvent(Object.assign(new Event('dragover', { bubbles: true, cancelable: true }), { dataTransfer: dt }))
      seat.dispatchEvent(Object.assign(new Event('drop', { bubbles: true, cancelable: true }), { dataTransfer: dt }))
      src.dispatchEvent(Object.assign(new Event('dragend', { bubbles: true, cancelable: true }), { dataTransfer: dt }))
    })
    expect(slotVal(KEY), 'he landed').toBe(ID)
    expect(toasts.at(-1), 'the note').toBe(`${PEOPLE[ID].cs} — ${NONE}`)
    await act(async () => { setSlotVal(KEY, ''); afterSchedMutate(); notify() })
  })
})
