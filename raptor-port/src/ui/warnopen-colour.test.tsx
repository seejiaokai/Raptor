// @vitest-environment jsdom
/* AN OPEN ISSUES LIST LIGHTS EACH MAN IN HIS OWN COLOUR (owner's find on his phone, 11 Oct 26).
   A day's list, opened by its bar, lights every man its shown warnings name. It lit them all in ONE colour — the
   day's worst: with one red clash on the day, three men whose only item was a long work day wore the red ring too,
   and the rings read as five men double-booked. Closing the list put each puck back to its own flag, which is how he
   saw that the open list was the part that lied.
   The rule pinned here: with the list open, a man is lit in the colour of the WORST shown item that names HIM — red,
   amber, or the grey of a note (a long work day: grey is the bar of its line in the list and the ring his puck wears
   at rest; it used to light amber, as an advisory does). A tap on one line of the list lights its crew the same way.
   Driven through the real app: the bar is clicked, the pucks are read off the week. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { validate, workingWarn } from '../engine/validate'
import * as view from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const shown = (di: number) => (((workingWarn().byDay[di] || {}).warns || []) as any[]).filter(w => !w.off)
/* the worst shown item that names each man on the day: 'hard' (red) over 'adv' (amber) over 'note' (grey) */
const RANK: any = { hard: 3, adv: 2, note: 1 }
const worst = (di: number) => {
  const m = new Map<string, string>()
  shown(di).forEach(w => (w.who || []).forEach((id: string) => { if (!m.has(id) || RANK[w.sev] > RANK[m.get(id)!]) m.set(id, w.sev) }))
  return m
}
const split = (di: number) => {
  const m = worst(di)
  return { red: new Set([...m].filter(x => x[1] === 'hard').map(x => x[0])), lesser: new Set([...m].filter(x => x[1] !== 'hard').map(x => x[0])) }
}
/* the colour a lit puck is wearing, read off the classes the stylesheet paints from */
const colour = (p: HTMLElement) => p.classList.contains('notef') ? 'grey' : p.classList.contains('advf') ? 'amber' : 'red'
const WANT: any = { hard: 'red', adv: 'amber', note: 'grey' }

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  validate()
})
afterAll(async () => { view.selDrop(); await act(async () => { root.unmount() }); host.remove() })

describe('an open issues list lights each man in the colour of HIS worst item, not the day\'s', () => {
  /* a day that can tell the two apart: a red item on it, and a man only lesser items name */
  const mixedDay = () => [0, 1, 2, 3, 4, 5, 6].find(di => { const s = split(di); return s.red.size > 0 && s.lesser.size > 0 })

  it('the demo week has a day with a red item and a man named only by a lesser one', () => {
    expect(mixedDay(), 'without such a day this file proves nothing').not.toBeUndefined()
  })

  it('the list opened by its bar: a man a red item names is red; a man only lesser items name wears THEIR colour, never red', async () => {
    const di = mixedDay()!, { red, lesser } = split(di)
    await click($(`#vWeek .day[data-day="${di}"] .daywarn[data-daywarn]`))
    expect($(`#vWeek .day[data-day="${di}"] .dwbox.open`), 'the list is open').toBeTruthy()
    const lit = $$(`#vWeek .day[data-day="${di}"] .puck.wfoc`)
    expect(lit.length, 'the open list lights its men').toBeGreaterThan(0)
    const of = (ids: Set<string>) => lit.filter(p => ids.has(p.dataset.person!))
    expect(of(red).length, 'a man with a red item is on the day').toBeGreaterThan(0)
    expect(of(lesser).length, 'and a man with only a lesser one').toBeGreaterThan(0)
    const w = worst(di)
    expect(lit.map(p => p.dataset.person + ':' + colour(p)), 'every lit man wears the colour of his own worst item')
      .toEqual(lit.map(p => p.dataset.person + ':' + WANT[w.get(p.dataset.person!)!]))
    expect(of(lesser).some(p => colour(p) === 'red'), 'nobody a red item does not name is red').toBe(false)
  })

  it('a long work day lights grey — the colour of its line and of the ring at rest — not amber', async () => {
    const di = [0, 1, 2, 3, 4, 5, 6].find(d => [...worst(d).values()].includes('note'))!
    expect(di, 'the demo week has a man whose worst item is a note').not.toBeUndefined()
    view.selDrop(); await act(async () => { notify() })
    await click($(`#vWeek .day[data-day="${di}"] .daywarn[data-daywarn]`))
    const w = worst(di)
    const notes = $$(`#vWeek .day[data-day="${di}"] .puck.wfoc`).filter(p => w.get(p.dataset.person!) === 'note')
    expect(notes.length).toBeGreaterThan(0)
    expect(notes.map(colour)).toEqual(notes.map(() => 'grey'))
  })

  it('a tap on one line still lights its crew in that line\'s colour', async () => {
    const di = mixedDay()!
    for (const sev of ['hard', 'adv', 'note']) {
      const w = shown(di).find(x => x.sev === sev && (x.who || []).length)
      if (!w) continue
      view.selDrop(); view.DWOPEN.add(di)
      view.focusWarn(di, ((workingWarn().byDay[di] || {}).warns || []).indexOf(w)); await act(async () => { notify() })
      const lit = $$(`#vWeek .day[data-day="${di}"] .puck.wfoc`)
      expect(lit.length, sev).toBeGreaterThan(0)
      expect(lit.every(p => (w.who || []).includes(p.dataset.person)), sev + ': only its crew').toBe(true)
      expect(lit.map(colour), sev).toEqual(lit.map(() => WANT[sev]))
    }
  })
})
