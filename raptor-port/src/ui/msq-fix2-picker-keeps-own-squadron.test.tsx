// @vitest-environment jsdom
/* THE PEOPLE PICKER KEEPS THE PAGE'S OWN SQUADRON (the second re-walk of 22 Nov 26, item 9b — pictures I9s-04, I9s-05).
   Ranger is 149's from Thu 16 Jul (moved on Wed 15). Hunter, 142's admin, opens a new Training on the Inputs page,
   switches on "Several people", dates it Tue 14, picks Ranger and un-picks himself ("1 picked"), then moves it to Fri 17
   alone. The picker emptied of every 142 name: whom it offers was asked of the draft with each man ADDED to those picked,
   and Ranger — picked, and 149's on Fri 17 — refused that draft for everyone. Hunter could neither pick another man nor
   un-pick Ranger (never the last one), and Add said only "Blocked: nothing was kept". A man is offered where adding him
   brings no refusal of his own; the refusals the men already picked bring are theirs, and Ranger stays drawn so he can be
   un-picked once another man is picked. */
import { useMsqWorld, acrossMove, signInAs, PID } from '../test-support/msq-world'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputEditor } from './InputWindow'
import { rosterOptions } from './inputedit'
import { setInpEdit } from './pops'
import { notify } from '../state/store'
import { setPage, setInpView } from '../state/view'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

useMsqWorld()

const R = PID.ranger, H = PID.hunter
let host: HTMLDivElement, root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const said = () => (HOOKS.toast as any).mock.calls.map((c: any[]) => [String(c[0]), c[1]])
const pucks = () => [...document.querySelectorAll('[data-testid="pp"] [data-pp]')].map(b => b.getAttribute('data-pp')!)
const lit = (id: string) => $(`[data-testid="pp"] [data-pp="${id}"]`)?.getAttribute('aria-pressed')
const count = () => $('[data-testid="pp-count"]')?.textContent
const click = async (sel: string) => { const el = $(sel); expect(el, sel).toBeTruthy(); await act(async () => { el!.click() }) }
const day = (iso: string) => `#inpEdCal [data-iso="${iso}"]`
/* 142's own people on a day, as the picker lists them (no placeholder) */
const own142 = (iso: string) => rosterOptions('u142', iso).filter(id => !PEOPLE[id]!.special)

beforeEach(async () => {
  setPage('inputs'); setInpView('table')
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<InputEditor />) })
})
afterEach(async () => {
  await act(async () => { root.unmount(); setInpEdit(null) })
  host.remove()
})

/* Hunter's new Training, "Several people", Tue 14: Ranger picked, Hunter un-picked */
async function rangerAloneOn14() {
  acrossMove(R, 'u142', 'u149')
  signInAs('hunter')
  setPage('inputs'); setInpView('table')
  await act(async () => { setInpEdit({ _new: true, _calendar: true, _ctx: 'i', person: H, type: 'Training', date: 'Jul 14', allday: false, s: 360, e: 1080 }); notify() })
  await click('[data-testid="pp-several"]')
  await click(`[data-pp="${R}"]`)
  await click(`[data-pp="${H}"]`)
  expect(count(), 'Ranger alone').toBe('1 picked')
  expect(lit(R)).toBe('true')
}

describe('9b — the picker on a day the only man picked is another squadron\'s', () => {
  it('control: on Tue 14 every 142 name is offered beside Ranger', async () => {
    await rangerAloneOn14()
    const shown = pucks()
    for (const id of own142('2026-07-14')) expect(shown, `${PEOPLE[id]!.cs} offered on Tue 14`).toContain(id)
  })

  it('moved to Fri 17: 142\'s own people stay offered, Ranger stays drawn, and he is un-picked once another man is picked', async () => {
    await rangerAloneOn14()
    /* the first press on Fri 17 runs the draft 14 → 17; the second makes Fri 17 its one day */
    await click(day('2026-07-17')); await click(day('2026-07-17'))
    expect($('[data-testid="win-inputedit"]')?.textContent, 'dated Fri 17 alone').toContain('New input · Jul 17')
    expect($('[data-testid="win-inputedit"]')?.textContent).not.toContain('Jul 17 →')
    const shown = pucks()
    expect(shown, 'Ranger, still picked, keeps his puck').toContain(R)
    /* Add on Ranger alone, 149's that day: refused at the door, the window open, nothing kept */
    const n0 = INPUTS.length
    await click('#inpEditSave')
    expect(said().some(([, k]: string[]) => k === 'blocked'), 'refused at the door').toBe(true)
    expect($('#inpEditSave'), 'the window stays open').toBeTruthy()
    expect(INPUTS.length, 'nothing kept').toBe(n0)
    const roster17 = own142('2026-07-17')
    expect(roster17, '142\'s roster on Fri 17 is not empty').toContain(H)
    for (const id of roster17) expect(shown, `${PEOPLE[id]!.cs} offered on Fri 17`).toContain(id)
    await click(`[data-pp="${H}"]`)
    expect(count()).toBe('2 picked')
    await click(`[data-pp="${R}"]`)
    expect(count(), 'Ranger let go').toBe('1 picked')
    expect(pucks(), 'let go, he is not on 142\'s Friday and leaves the picker').not.toContain(R)
    const n = INPUTS.length
    await click('#inpEditSave')
    expect(INPUTS.length, `Hunter's own Training on Fri 17 is kept — ${JSON.stringify(said())}`).toBe(n + 1)
  })
})
