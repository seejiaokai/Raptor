// @vitest-environment jsdom
/* THE LEAVE WAR AND THE TRACKER STAY MOUNTED ONCE VISITED (ui/Shell.tsx). The Leave War for speed (owner, 1 Sep 26 — its
   year grid is rebuilt from nothing on every remount), the Tracker because its chart is drawn by a once-only init and a
   remount comes back empty. The "ever visited" latch was a ref written during the render; since the React Doctor clean-up
   (D1534, 31 Oct 26) it is state set while rendering. This pins what a person sees either way: after a visit, leaving the
   page only hides it (`doze`) and keeps what it drew; a page never visited is not mounted at all. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { resetSession, notify } from '../state/store'
import { signIn, sessionFor } from '../state/accounts'
import { MemoryBackend } from '../storage/memory'
import { bootApp } from '../boot'
import type { BootPolicy } from '../bootpolicy'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const POLICY: BootPolicy = { seedDemo: false, bootstrap: { principal: 'boss@unit.example', person: { cs: 'Boss', ini: 'BS', seat: 'FCP', cat: 'A' } } }
const tick = (ms = 0) => new Promise(r => setTimeout(r, ms))
let host: HTMLDivElement, root: Root

beforeAll(async () => {
  const be = new MemoryBackend()
  const { postman } = await bootApp(be, POLICY)
  await postman.flush()
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  const r = signIn('boss@unit.example', 'any')
  await act(async () => { resetSession(sessionFor(r as any)); notify() })
})
afterAll(async () => { await act(async () => { root.unmount() }); host.remove() })

const READY: Record<string, string> = {
  leavewar: '#page-leavewar [data-testid="lw-empty"], #page-leavewar [data-testid="war-picker"]',
  tracker: '#page-tracker [data-testid="trk-nocourse"], #page-tracker #board',
}
async function open(p: string) {
  await act(async () => { (host.querySelector(`a[data-page="${p}"]`) as HTMLElement).click(); await tick() })
  if (READY[p]) for (let i = 0; i < 300 && !host.querySelector(READY[p]); i++) await act(async () => { await tick(10) })
  expect(host.querySelector(`#page-${p}.on`), `${p} is on screen`).toBeTruthy()
}

describe('the Leave War and the Tracker stay mounted once visited', () => {
  it('before a visit the Tracker is not mounted', async () => {
    await open('viewsched')
    expect(host.querySelector('#page-tracker')!.childElementCount, 'never visited: nothing drawn').toBe(0)
    expect(host.querySelector('#page-tracker')!.className).toBe('page')
  })

  it('after a visit each page only dozes when left, keeping what it drew', async () => {
    await open('leavewar')
    const lw = host.querySelector(READY.leavewar)
    await open('tracker')
    const trk = host.querySelector(READY.tracker)
    await open('viewsched')
    expect(host.querySelector('#page-leavewar')!.className).toBe('page doze')
    expect(host.querySelector('#page-tracker')!.className).toBe('page doze')
    /* the very same nodes: hidden, never rebuilt */
    expect(host.querySelector(READY.leavewar), 'the Leave War kept its screen').toBe(lw)
    expect(host.querySelector(READY.tracker), 'the Tracker kept its screen').toBe(trk)
    /* and they stay kept across further page changes */
    await open('inputs')
    await open('editsched')
    expect(host.querySelector(READY.tracker), 'still the Tracker it drew first').toBe(trk)
    expect(host.querySelector(READY.leavewar), 'still the Leave War it drew first').toBe(lw)
  })
})
