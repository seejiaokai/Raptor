// @vitest-environment jsdom
/* The Admin page (owner, 23 Aug 26) — the seventh tab, always last. The nav
   HIDES the tab from a member, but the PAGE is the gate (the 6 Aug doctrine:
   role checks live at the page and the write path, never the nav), so the
   forced-member render is pinned here non-vacuously: the page really mounts,
   and what it mounts is the denial, not the tools. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, setPage } from '../state/store'
import { secDefault, waveDefault } from '../engine'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
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
})

describe('the Admin page', () => {
  it('a member sees the tab in neither nav', async () => {
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    expect(($('#topnav a[data-page="admin"]') as any).hidden).toBe(true)
    await click($('#burger'))
    expect($('#drawerNav a[data-page="admin"]')).toBeFalsy()
    await click($('#drawer'))    // tap the backdrop closed
  })

  it('a member FORCED onto the page gets the denial, not the tools', async () => {
    /* still the member session from above — poke the page state directly,
       the one route a hidden tab cannot close */
    await act(async () => { setPage('admin'); notify() })
    expect($('#page-admin').classList.contains('on'), 'the page really mounted').toBe(true)
    expect($('#admDeny')).toBeTruthy()
    expect($('#userAdd')).toBeFalsy()
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })

  it('the template openers reach the real editors', async () => {
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'admin')!)
    expect($('#page-admin').classList.contains('on')).toBe(true)
    /* the modals are App-level siblings, so they paint over this page like
       any other — the openers just set the same pops.ts flags the picker
       pencils set */
    await click($('#admDutyTpl'))
    expect(($('#tplModal') as any).hidden).toBeFalsy()
    await click($('#tplClose'))
    await click($('#admDayTpl'))
    expect(($('#daytplModal') as any).hidden).toBeFalsy()
    await click($('#daytplClose'))
  })

  it('the Admin tab is the LAST nav entry', () => {
    const tabs = $$('#topnav a[data-page]')
    expect(tabs[tabs.length - 1]!.dataset.page).toBe('admin')
  })

  /* THE DEFAULT ARRANGEMENT panel (owner, 29 Aug 26 pt.2). Both lists render on the
     Squadron-config pane, and a section nudge updates the global default at once. */
  it('the Default arrangement lists render and a nudge re-orders the house default', async () => {
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'admin')!)
    expect($$('#admSecDefault .arrsec-row').length, 'ten panels (six schedule + four crew)').toBe(10)
    expect($$('#admWaveDefault .arrsec-row').length, 'four wave kinds').toBe(4)
    expect(secDefault()[0]).toBe('notes')
    /* nudge Overall notes down one — the house default now leads with Common Programme */
    await click($('#admSecDefault .arrsec-row .tnudge[aria-label="Move Overall notes down"]'))
    expect(secDefault()[0]).toBe('prog')
    /* wave order starts OFF (empty) — the panel shows the canonical kinds as a start */
    expect(waveDefault()).toEqual([])
    await click($('#admWaveDefault .arrsec-row .tnudge[aria-label="Move SC up"]'))
    expect(waveDefault()).toEqual(['sc', 'fly', 'avalon', 'bb'])
  })
})
