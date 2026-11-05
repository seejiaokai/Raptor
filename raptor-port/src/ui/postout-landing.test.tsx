// @vitest-environment jsdom
/* [POSTOUT-RUN-NOTICE] — WHERE A BELL'S POSTING LINE LANDS: Admin → Users at his row (owner D1547; the drawing of record
   docs/mock/2026-11-05-postout-bell/, pictures 3), rendered through the real App.

   The landing's intent is the one "open Admin → Users" door (ui/adminopen.ts openAdminUsers({ person }) → state/view.ts
   ADMINOPEN → ui/AdminPage.tsx, its one consumer → ui/UsersPanel.tsx `ring`). Pinned: the list drawn afresh for the tap (no
   search hides him), the Archived fold open for an archived man, his row wearing the just-added ring — and the ring gone
   after its six seconds (the walk's B4, 5 Nov 26: the ring's end was a timer the Admin page's own effect cancelled the moment
   it ran again, so the ring stayed for good); a second tap, on the page already up, lands on the second man. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, notify, resetSession } from '../state/store'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { setPage } from '../state/view'
import { openAdminUsers } from './adminopen'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const row = (pid: string) => $(`#page-admin .acc-row[data-person="${pid}"]`)
const P = (id: string): any => (PEOPLE as any)[id]
const mem: Record<string, string> = {}
let host: HTMLDivElement
let root: Root
let PEOPLE0 = ''
beforeAll(async () => {
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }
  PEOPLE0 = JSON.stringify(PEOPLE)
  initStore(); accountsLoad()
  HOOKS.toast = () => {}
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove(); storeBackend.impl = null
})
beforeEach(async () => {
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  /* Ranger archived by a posting (the pass's own marks — the posting itself is pinned in leavewar/postout-notice.test.ts) */
  P('bane').archived = true; P('bane').archivedBy = 'po'; P('bane').archivedOn = '2026-07-20'
  await act(async () => { resetSession(sessionFor(signIn('ad', 'a'))); setPage('editsched'); notify() })
})
afterEach(async () => { vi.useRealTimers(); await act(async () => { resetSession(null); notify() }) })

describe('a posting line\'s tap lands on his row (D1547)', () => {
  it('an archived man: Users, the Archived fold opened, his row ringed — and the ring gone after its six seconds', async () => {
    vi.useFakeTimers()
    await act(async () => { openAdminUsers({ person: 'bane' }) })
    expect($('#accArchToggle')?.getAttribute('aria-expanded')).toBe('true')
    expect(row('bane'), 'his row drawn, in the Archived list').toBeTruthy()
    expect(row('bane')!.getAttribute('data-archived')).toBe('1')
    expect(row('bane')!.classList.contains('acc-ring')).toBe(true)
    await act(async () => { vi.advanceTimersByTime(5900) })
    expect(row('bane')!.classList.contains('acc-ring'), 'still ringed just before six seconds').toBe(true)
    await act(async () => { vi.advanceTimersByTime(200) })
    expect(row('bane')!.classList.contains('acc-ring'), 'the ring gone after its six seconds').toBe(false)
  })
  it('a second tap, the page already up: the new man ringed, the first not', async () => {
    vi.useFakeTimers()
    await act(async () => { openAdminUsers({ person: 'bane' }) })
    await act(async () => { vi.advanceTimersByTime(1000) })
    await act(async () => { openAdminUsers({ person: 'rocky' }) })
    expect(row('rocky')!.classList.contains('acc-ring')).toBe(true)
    expect(row('bane')?.classList.contains('acc-ring') ?? false).toBe(false)
    await act(async () => { vi.advanceTimersByTime(6100) })
    expect(row('rocky')!.classList.contains('acc-ring')).toBe(false)
  })
  it('a search typed earlier does not hide him: the list is drawn afresh for the tap', async () => {
    await act(async () => { setPage('admin'); notify() })
    const find = $('#accFind') as HTMLInputElement
    await act(async () => {
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
      set.call(find, 'zzz'); find.dispatchEvent(new Event('input', { bubbles: true }))
    })
    expect(row('rocky')).toBeNull()
    await act(async () => { openAdminUsers({ person: 'rocky' }) })
    expect(($('#accFind') as HTMLInputElement).value).toBe('')
    expect(row('rocky')!.classList.contains('acc-ring')).toBe(true)
  })
})
