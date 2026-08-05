// @vitest-environment jsdom
/* The Quals page — tfin's B24 (Scheduler appointment) and V (AAR invariant)
   page assertions, driven through the React table. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { PEOPLE, isScheduler, isInstr, deriveQuals, ID_BY_CS, QCHIP, QCOLOR, QORDER, LEVELNAME } from '../engine/people'

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

/* CALLSIGN + INITIALS (owner, Aug 26). The callsign is the identity the whole
   app plans by — it is what every puck prints — so it heads the table and is
   the only field Add person requires; first/last name are gone. */
describe('the callsign / initials columns', () => {
  const setV = async (el: HTMLElement, v: string) => act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    setter.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true }))
  })

  it('the table heads with Callsign then Initials, and Name is gone', () => {
    const hs = $$('#qtbl thead th').map(x => x.textContent)
    expect(hs[0]).toBe('Callsign')
    expect(hs[1]).toBe('Initials')
    expect(hs).not.toContain('Name')
    // every row carries the new cell, so the columns stay square
    expect($$('#qtbl tbody tr:not(.grp) td.qinitc').length).toBe($$('#qtbl tbody tr:not(.grp)').length)
  })

  it('Add person takes callsign + initials + pilot/WSO + cat, with no name fields', async () => {
    expect($('#qLast')).toBeFalsy()
    expect($('#qFirst')).toBeFalsy()
    await setV($('#qCS') as HTMLElement, 'Tester')
    await setV($('#qInitials') as HTMLElement, 'tkl')
    await click($('#qAddPerson'))
    const id = Object.keys(PEOPLE).find(k => PEOPLE[k].cs === 'Tester')!
    expect(id, 'the person was added').toBeTruthy()
    expect(PEOPLE[id].initials).toBe('TKL')          // stored upper-case
    expect(PEOPLE[id].seat).toBe('FCP')
    expect(PEOPLE[id].q).toBe('OCU')
    // the callsign is what a puck would resolve — that identity still holds
    expect(ID_BY_CS['tester']).toBe(id)
    const row = $$('#qtbl tbody tr:not(.grp)').find(r => r.querySelector('.qname')!.textContent === 'Tester')!
    expect(row.querySelector('.qinitc')!.textContent).toBe('TKL')
    PEOPLE[id].archived = true; delete ID_BY_CS['tester']
    await act(async () => notify())
  })

  it('edit mode lets an existing person\'s initials be filled in', async () => {
    await click($('#qEdit'))
    const input = $('#qtbl input.qinit[data-init]') as HTMLInputElement
    expect(input, 'edit mode renders an initials input').toBeTruthy()
    const id = input.dataset.init!
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      setter.call(input, 'ab'); input.dispatchEvent(new Event('change', { bubbles: true }))
    })
    expect(PEOPLE[id].initials).toBe('AB')
    PEOPLE[id].initials = ''
    await act(async () => notify())
  })
})

/* the callsign is editable in edit mode and the rename reaches the schedule —
   the pucks print the new name (owner, Aug 26) */
describe('editing a callsign', () => {
  const commit = async (el: HTMLInputElement, v: string) => act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    setter.call(el, v); el.dispatchEvent(new Event('change', { bubbles: true }))
  })

  it('renames the person and every puck follows; duplicates are refused', async () => {
    if (!$('#qtbl input.qcs')) await click($('#qEdit'))
    const box = $('#qtbl input.qcs[data-cs="bane"]') as HTMLInputElement
    expect(box, 'edit mode renders a callsign input').toBeTruthy()

    await commit(box, 'Banzai')
    expect(PEOPLE.bane.cs).toBe('Banzai')
    expect(ID_BY_CS['banzai']).toBe('bane')
    expect(ID_BY_CS['bane']).toBeUndefined()

    // the schedule follows: a puck for that person now prints the new name
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'viewsched')!)
    const puck = $('#vWeek .puck[data-person="bane"] .nm')
    expect(puck, 'bane still holds a seat').toBeTruthy()
    expect(puck.textContent).toBe('Banzai')

    // and a duplicate is refused, leaving the name as it was.
    // NB: leaving the page unmounts QualsPage, so edit mode has to be re-armed
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'quals')!)
    if (!$('#qtbl input.qcs')) await click($('#qEdit'))
    const box2 = $('#qtbl input.qcs[data-cs="bane"]') as HTMLInputElement
    await commit(box2, 'Snap')
    expect(PEOPLE.bane.cs).toBe('Banzai')

    await commit($('#qtbl input.qcs[data-cs="bane"]') as HTMLInputElement, 'Bane')
    expect(PEOPLE.bane.cs).toBe('Bane')
  })
})

/* ---- the CAT column (owner, Aug 5) --------------------------------------
   "Level" is called CAT; CI has left the ladder; and the two tick columns
   that only duplicated the dropdown are gone. */
describe('the CAT column', () => {
  it('the heading says CAT, not Level', () => {
    const heads = $$('#qtbl thead th').map(th => th.textContent!.trim())
    expect(heads).toContain('CAT')
    expect(heads).not.toContain('Level')
  })

  it('CI is off the ladder everywhere', () => {
    for (const map of [QCHIP, QCOLOR, QORDER, LEVELNAME])
      expect(Object.keys(map), 'CI is gone from the qual tables').not.toContain('CI')
    /* the dropdown is built from QCHIP, so it offers what the ladder holds */
    const opts = [...$$('#qtbl select.qlvlsel')[0].querySelectorAll('option')].map(o => o.textContent)
    expect(opts).not.toContain('CI')
    expect(opts).toEqual(['OCU', 'D', 'C', 'B', 'A', 'I', 'IR'])
    /* and nobody is left holding it */
    expect(Object.keys(PEOPLE).filter(id => PEOPLE[id].q === 'CI')).toEqual([])
  })

  /* the six who held CI all carried the IP flag too, so the instructor half
     was never lost — and isInstr never told CI and I apart in the first place */
  it('the ex-CI pilots are I, still instructors, still IP', () => {
    for (const id of ['mamba', 'shaft', 'chaps', 'boosh', 'beams', 'split']) {
      expect(PEOPLE[id].q, id).toBe('I')
      expect(isInstr(PEOPLE[id].q), id + ' still reads as an instructor').toBe(true)
      expect(!!PEOPLE[id].ip, id + ' keeps the IP flag').toBe(true)
    }
  })

  it('CAT A and CAT B are gone; IP stays', () => {
    const heads = $$('#qtbl thead th').map(th => th.textContent!.trim())
    expect(heads).not.toContain('CAT A')
    expect(heads).not.toContain('CAT B')
    expect(heads, 'IP carries what the dropdown cannot').toContain('IP')
    /* and the engine no longer derives the two it no longer shows */
    deriveQuals(PEOPLE.bane)
    expect(PEOPLE.bane.quals.catA).toBeUndefined()
    expect(PEOPLE.bane.quals.catB).toBeUndefined()
    /* a CAT A pilot who instructs is still both — the case IP exists for */
    expect(PEOPLE.bane.q).toBe('A')
    expect(!!PEOPLE.bane.ip).toBe(true)
  })
})
