// @vitest-environment jsdom
/* The Leave War tab stays MOUNTED once visited (owner, 1 Sep 26 — the tab
   was slow to open because its ~28k-node year grid was rebuilt on every
   visit). These pins hold the shape of the fix: the grid is built on the
   first visit, HIDDEN — not torn down — on a tab switch, and the very same
   DOM comes back on return, with the page scroll restored and one window
   `resize` dispatched so the Matrix re-measures what display:none zeroed. */
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
/* jsdom's scrollTo is a loud not-implemented stub; the spy both silences it
   and lets the restore assertion read what was asked for. */
const scrollSpy = vi.fn()

beforeAll(async () => {
  window.scrollTo = scrollSpy as any
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
})

const tab = (p: string) => {
  const a = host.querySelector(`a[data-page="${p}"]`) as HTMLElement
  a.dispatchEvent(new MouseEvent('click', { bubbles: true }))
}

describe('the Leave War tab is kept alive between visits', () => {
  it('is not mounted before the first visit', () => {
    expect(host.querySelector('#page-leavewar .mx-wrap')).toBeNull()
  })

  it('the first visit builds the grid and opens at the top', async () => {
    await act(async () => tab('leavewar'))
    expect(host.querySelector('#page-leavewar.on .mx-wrap')).toBeTruthy()
    expect(scrollSpy).toHaveBeenCalledWith(0, 0)
  })

  it('leaving the tab hides the section but keeps the grid in the DOM', async () => {
    const grid = host.querySelector('#page-leavewar .mx-wrap')!
    await act(async () => tab('viewsched'))
    expect(host.querySelector('#page-leavewar.on'), 'section is hidden').toBeNull()
    /* .doze, not the bare .page: scheduler.css hides a dozing page with
       content-visibility (layout kept cached) instead of display:none —
       re-showing from display:none re-lays the whole grid out (~0.4–0.9s
       measured); from doze it is 1–2ms */
    expect(host.querySelector('#page-leavewar.doze'), 'section dozes').toBeTruthy()
    expect(document.contains(grid), 'grid was NOT torn down').toBe(true)
  })

  it('returning shows the SAME grid, restores the scroll and re-measures', async () => {
    const grid = host.querySelector('#page-leavewar .mx-wrap')!
    /* the reader had scrolled to 480 while the tab was up last time — the
       page tracks it live (reading scrollY on the way out would see the
       browser's clamp, the section being display:none by then) */
    Object.defineProperty(window, 'scrollY', { value: 480, configurable: true })
    await act(async () => tab('leavewar'))
    window.dispatchEvent(new Event('scroll'))
    await act(async () => tab('viewsched'))

    scrollSpy.mockClear()
    let resized = 0
    const onResize = () => { resized++ }
    window.addEventListener('resize', onResize)
    await act(async () => tab('leavewar'))
    window.removeEventListener('resize', onResize)

    expect(host.querySelector('#page-leavewar.on .mx-wrap'), 'shown again').toBe(grid)
    expect(scrollSpy, 'came back to the remembered spot').toHaveBeenCalledWith(0, 480)
    expect(resized, 'one resize kick re-measures the hidden-zeroed layout').toBeGreaterThan(0)
  })
})
