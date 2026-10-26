// @vitest-environment jsdom
/* THE STRIP OVER THE CREW LIST NAMES THE LINE AS IT IS NOW ([ARM-STRIP-STALE-TITLE], found 21 Oct 26 by the blind read of
   [BOARD-SIDE-WIDTH]). "Planning FCP · VL BFM" took its words once, when the seat was picked, so a callsign or mission
   typed on that line afterwards did not show until the seat was picked again. It is drawn from the line at every paint.
   Driven through the real App on the Scheduler Board: pick an empty front seat, type the line's callsign, read the strip. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, writeSlot } from '../state/store'
import { armedKey, SBDAY } from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
/* a board box commits on its change event, as it does when he leaves it */
const typeIn = async (el: HTMLInputElement, v: string) => {
  await act(async () => {
    el.focus(); el.value = v
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  })
}
const strips = () => $$('.ros-arm').map(s => s.textContent || '')

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
})

describe('the strip over the crew list', () => {
  it('shows a callsign typed on the picked line after the seat was picked', async () => {
    const key = '0.0.0.0.p'
    await act(async () => { writeSlot(key, ''); notify() })
    await click($('#eWeek .day[data-day="0"] .dt.sb-open'))
    expect(SBDAY).toBe(0)
    await click($(`#sbBoard [data-slot="${key}"]`))
    expect(armedKey()).toBe(key)
    expect(strips().length).toBeGreaterThan(0)
    expect(strips().every(t => !t.includes('ZZTOP'))).toBe(true)
    await typeIn($('#sbBoard [data-bfld="ff:0.0.0.cs"]') as HTMLInputElement, 'ZZTOP')
    expect(armedKey()).toBe(key)                       // still picked
    expect(strips().length).toBeGreaterThan(0)
    for (const t of strips()) expect(t).toContain('ZZTOP')
  })
})
