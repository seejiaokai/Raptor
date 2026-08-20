// @vitest-environment jsdom
/* App smoke: login gate works, the shell mounts, and the week renders the
   verbatim day sections with the right counts. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
})

describe('the app shell', () => {
  it('starts on the login page', () => {
    expect(host.querySelector('#login')).toBeTruthy()
    expect(host.querySelector('#shell')).toBeFalsy()
  })

  it('admin login opens the shell', async () => {
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
    expect(host.querySelector('#shell')).toBeTruthy()
  })

  it('the week renders one section per day, each with the day markup', () => {
    const secs = host.querySelectorAll('#vWeek section.day')
    expect(secs.length).toBe(DAYS.length)
    expect(host.querySelectorAll('#vWeek .puck').length).toBeGreaterThan(20)
    expect(host.querySelectorAll('#vWeek .allhands').length).toBeGreaterThanOrEqual(4)
  })

  /* The three week-wide count pills left the topbar on 20 Aug 26 (owner: "what
     is the point of having warning, advisory and note at the top. Just remove
     it"). Their absence is pinned, not just untested: every day already leads
     with its own issue count, and a later "the topbar looks empty" pass must
     not put the sum back. */
  it('the banner reads DRAFT, and the topbar carries no warning count pills', () => {
    expect(host.querySelector('#vBanner')!.textContent).toContain('DRAFT')
    for (const id of ['#warnBtn', '#warnBtn2', '#warnBtn3', '#nHard', '#nAdv', '#nNote'])
      expect(host.querySelector(id), `${id} is gone from the topbar`).toBeNull()
  })

  it('the edit tab is admin-only', async () => {
    expect((host.querySelector('a[data-page="editsched"]') as HTMLElement).hidden).toBe(false)
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    expect((host.querySelector('a[data-page="editsched"]') as HTMLElement).hidden).toBe(true)
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })

  /* design critique, 15 Aug 26 (a P0): the five page tabs were hrefless <a>s,
     so a keyboard user could not Tab to them or switch pages. They carry a
     button role, sit in the tab order, and answer Enter and Space now. */
  it('the page tabs are keyboard-reachable and activate on Enter / Space', async () => {
    const tab = (p: string) => host.querySelector(`a[data-page="${p}"]`) as HTMLElement
    const inputs = tab('inputs')
    expect(inputs.getAttribute('role'), 'announced as a button').toBe('button')
    expect(inputs.tabIndex, 'in the tab order').toBe(0)
    await act(async () => { inputs.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })) })
    expect(host.querySelector('#page-inputs.on'), 'Enter switched to Inputs').toBeTruthy()
    await act(async () => { tab('quals').dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })) })
    expect(host.querySelector('#page-quals.on'), 'Space switched to Quals').toBeTruthy()
    await act(async () => { tab('viewsched').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })) })
    expect(host.querySelector('#page-viewsched.on'), 'and back to View-only').toBeTruthy()
  })

  it('logout returns to the login page', async () => {
    await act(async () => { setSession(null); notify() })
    expect(host.querySelector('#login')).toBeTruthy()
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })
})
