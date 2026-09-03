// @vitest-environment jsdom
/* THE EDIT SURFACES WARM ONCE IN IDLE TIME AFTER AN ADMIN LOGIN (owner, 3 Sep
   26 — "faster on a slow computer"; EditWeek.tsx). These pin the shape:
   nothing warms for a member (no Edit tab), nothing warms without
   requestIdleCallback (so jsdom's other suites see the old timing), an admin's
   week and palette stand BEFORE the tab is ever clicked, and the first click
   then KEEPS those nodes — the per-day diff finds nothing to rewrite — which
   is the whole point. Plus the calendar's idle rule: a store tick with the
   calendar closed measures no day box. */
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { DAYS } from '../engine/data'
import { initStore, setSession, notify } from '../state/store'
import { CURPAGE } from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
/* a stand-in for the browser's idle slot: runs the callback on the next macrotask */
const ric = vi.fn((cb: any) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 0) as any)
const idle = () => act(async () => { await new Promise(r => setTimeout(r, 25)) })

beforeAll(async () => {
  window.scrollTo = (() => {}) as any
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
})

const tab = (p: string) => {
  const a = host.querySelector(`a[data-page="${p}"]`) as HTMLElement
  a.dispatchEvent(new MouseEvent('click', { bubbles: true }))
}

describe('the edit week and palette warm once, in idle time, for an admin', () => {
  it('a member login warms nothing (there is no Edit tab to open)', async () => {
    ;(window as any).requestIdleCallback = ric
    await act(async () => { setSession({ user: 'us', role: 'member' }); notify() })
    await idle()
    expect(CURPAGE, 'the view page is up').toBe('viewsched')
    expect(host.querySelector('#eWeek .day'), 'no warm build for a member').toBeNull()
    expect(host.querySelector('#eRoster .rpuck'), 'no palette either').toBeNull()
  })

  it('without requestIdleCallback an admin warms nothing — the old timing holds', async () => {
    delete (window as any).requestIdleCallback
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
    await idle()
    expect(host.querySelector('#eWeek .day'), 'no idle API, no warm').toBeNull()
    /* back to a member so the next test's admin login is the FIRST warmable tick */
    await act(async () => { setSession({ user: 'us', role: 'member' }); notify() })
  })

  it('an admin login builds the week and the palette while the View page is showing', async () => {
    ;(window as any).requestIdleCallback = ric
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
    await idle()
    expect(CURPAGE, 'still on the view page').toBe('viewsched')
    expect(host.querySelectorAll('#eWeek > .day[data-day]').length, 'the whole week stands').toBe(DAYS.length)
    expect(host.querySelector('#eRoster .rpuck[data-person]'), 'the crew palette stands').toBeTruthy()
    expect(host.querySelector('#page-editsched.on'), 'and the edit page is still hidden').toBeNull()
  })

  it('a tick with the calendar closed measures no day box', async () => {
    const spy = vi.spyOn(Element.prototype, 'getBoundingClientRect')
    await act(async () => { notify() })
    await act(async () => { notify() })
    expect(spy, 'the closed calendar no longer re-measures the week per tick').not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('the first Edit click keeps the warmed nodes — nothing is rebuilt', async () => {
    const first = host.querySelector('#eWeek > .day[data-day]')!
    const puck = host.querySelector('#eRoster .rpuck[data-person]')!
    await act(async () => tab('editsched'))
    expect(CURPAGE).toBe('editsched')
    expect(host.querySelector('#page-editsched.on'), 'edit page on').toBeTruthy()
    expect(host.querySelector('#eWeek > .day[data-day]'), 'the same first day node').toBe(first)
    expect(document.contains(puck), 'the same palette node').toBe(true)
    expect(host.querySelectorAll('#eWeek > .day[data-day]').length).toBe(DAYS.length)
  })

  it('the warm never re-arms: later ticks on the view page do not touch the week', async () => {
    await act(async () => tab('viewsched'))
    const first = host.querySelector('#eWeek > .day[data-day]')!
    const calls = ric.mock.calls.length
    await act(async () => { notify() })
    await idle()
    expect(ric.mock.calls.length, 'no new idle request').toBe(calls)
    expect(host.querySelector('#eWeek > .day[data-day]')).toBe(first)
  })
})
