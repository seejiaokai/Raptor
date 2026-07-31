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

  it('the banner reads DRAFT and the pills carry the counts', () => {
    expect(host.querySelector('#vBanner')!.textContent).toContain('DRAFT')
    expect(+(host.querySelector('#nHard')!.textContent || 0)).toBeGreaterThan(0)
  })

  it('the edit tab is admin-only', async () => {
    expect((host.querySelector('a[data-page="editsched"]') as HTMLElement).hidden).toBe(false)
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    expect((host.querySelector('a[data-page="editsched"]') as HTMLElement).hidden).toBe(true)
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })

  it('logout returns to the login page', async () => {
    await act(async () => { setSession(null); notify() })
    expect(host.querySelector('#login')).toBeTruthy()
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })
})
