// @vitest-environment jsdom
/* The Quals page — tfin's B24 (Scheduler appointment) and V (AAR invariant)
   page assertions, driven through the React table. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { PEOPLE, isScheduler } from '../engine/people'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'quals')!)
})

describe('the Quals page (tfin)', () => {
  it('quals rows', () => {
    expect($$('#qtbl tbody tr').length).toBeGreaterThan(10)
  })

  it('the Quals table has a Scheduler column, with the appointments', () => {
    const hs = $$('#qtbl thead th').map(x => x.textContent)
    expect(hs).toContain('Scheduler')
    expect($('#qtbl thead th.apt')).toBeTruthy()
  })

  it('appointed people are ticked, and a tick matches isScheduler', () => {
    expect($$('#qtbl td.qcell.apt-on').length).toBeGreaterThan(0)
    expect($$('#qtbl td[data-q$="|sched"]')
      .every(td => td.classList.contains('apt-on') === isScheduler(td.dataset.q!.split('|')[0]))).toBe(true)
  })

  it('every row carries the cell', () => {
    expect($$('#qtbl td[data-q$="|sched"]').length).toBe($$('#qtbl tbody tr:not(.grp)').length)
  })

  it('ticking the cell appoints them, unticking withdraws it', async () => {
    const td = $$('#qtbl td[data-q$="|sched"]').find(x => !x.classList.contains('apt-on'))!
    const id = td.dataset.q!.split('|')[0]
    await click($('#qEdit'))
    await click($(`#qtbl td[data-q="${id}|sched"]`))
    expect(isScheduler(id)).toBe(true)
    await click($(`#qtbl td[data-q="${id}|sched"]`))
    expect(isScheduler(id)).toBe(false)
  })

  it('NAAR cannot be ticked before DAAR, and removing DAAR removes NAAR', async () => {
    const id = Object.keys(PEOPLE).find(i => PEOPLE[i].seat === 'FCP' && !PEOPLE[i].archived && !PEOPLE[i].quals.daar && !PEOPLE[i].special)!
    expect(id).toBeTruthy()
    await click($(`#qtbl td[data-q="${id}|naar"]`))
    expect(PEOPLE[id].quals.naar).toBeFalsy()          // refused — DAAR first
    await click($(`#qtbl td[data-q="${id}|daar"]`))
    await click($(`#qtbl td[data-q="${id}|naar"]`))
    expect(PEOPLE[id].quals.naar).toBe(true)
    await click($(`#qtbl td[data-q="${id}|daar"]`))    // withdraw DAAR
    expect(PEOPLE[id].quals.daar).toBe(false)
    expect(PEOPLE[id].quals.naar).toBe(false)          // NAAR went with it
  })

  it('SC NIGHT needs SC DAY, exactly as NAAR needs DAAR', async () => {
    const id = Object.keys(PEOPLE).find(i => PEOPLE[i].seat === 'FCP' && !PEOPLE[i].archived && !PEOPLE[i].quals.scDay && !PEOPLE[i].special)!
    expect(id).toBeTruthy()
    await click($(`#qtbl td[data-q="${id}|scNight"]`))
    expect(PEOPLE[id].quals.scNight).toBeFalsy()
    await click($(`#qtbl td[data-q="${id}|scDay"]`))
    await click($(`#qtbl td[data-q="${id}|scNight"]`))
    expect(PEOPLE[id].quals.scNight).toBe(true)
    await click($(`#qtbl td[data-q="${id}|scDay"]`))
    expect(PEOPLE[id].quals.scNight).toBe(false)
    await click($('#qSave'))
  })

  it('a WSO\'s AAR cells are struck out, not un-ticked', async () => {
    await click($('#qViewW'))
    expect($$('#qtbl td.qcell.na').length).toBeGreaterThan(0)
    await click($('#qViewP'))
  })

  it('a member sees the table but no editing', async () => {
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    expect($$('#qtbl tbody tr').length).toBeGreaterThan(10)
    expect($('#qEdit')).toBeFalsy()
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })
})
