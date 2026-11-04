// @vitest-environment jsdom
/* D1635 (4 Nov 26): after Retry on a failed page download reloads the app, the app reopens that page — the Leave War or
   the Tracker — by itself once signed in, instead of its first page. Retry leaves a note of the page in this tab only
   (sessionStorage) just before the reload (pageload.test.tsx); the sign-in reads it once and throws it away. Nothing goes
   through the address: a code app's address never changes (the SWiFT kit). After the move, Microsoft signs him in with no
   form, and the same note is read at that start. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Login } from './Login'
import { initStore, resetSession } from '../state/store'
import { CURPAGE } from '../state/view'
import { noteReopen, REOPEN_KEY, takeReopen } from './pagedownload'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
beforeEach(async () => {
  initStore()
  resetSession(null)
  sessionStorage.clear()
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<Login />) })
})
afterEach(async () => {
  await act(async () => { root.unmount() })
  host.remove(); sessionStorage.clear(); resetSession(null)
})
/* type as a person does: React reads a controlled box through its own input event */
function type(sel: string, v: string) {
  const el = host.querySelector(sel) as HTMLInputElement
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, v)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}
async function signInAs(u: string, p: string) {
  await act(async () => { type('#luser', u); type('#lpass', p) })
  await act(async () => { (host.querySelector('#loginForm') as HTMLFormElement).requestSubmit() })
}

describe('the page reopened after Retry reloaded the app (D1635)', () => {
  it('a note of the Leave War: signed in, the Leave War opens, and the note is gone', async () => {
    noteReopen('leavewar')
    await signInAs('ad', 'a')
    expect(CURPAGE).toBe('leavewar')
    expect(sessionStorage.getItem(REOPEN_KEY)).toBeNull()
  })
  it('the same for the Tracker, for a member', async () => {
    noteReopen('tracker')
    await signInAs('us', 'us')
    expect(CURPAGE).toBe('tracker')
  })
  it('no note: the first page, as always', async () => {
    await signInAs('ad', 'a')
    expect(CURPAGE).toBe('viewsched')
  })
  it('a wrong password keeps the note for the right one', async () => {
    noteReopen('leavewar')
    await signInAs('ad', 'x')
    expect(JSON.parse(sessionStorage.getItem(REOPEN_KEY)!).page).toBe('leavewar')
    await signInAs('ad', 'a')
    expect(CURPAGE).toBe('leavewar')
  })
  it('someone with no access yet (asking for it): no page opened, and the note thrown away', async () => {
    noteReopen('leavewar')
    await signInAs('nobody-yet', 'x')
    expect(CURPAGE).not.toBe('leavewar')
    expect(sessionStorage.getItem(REOPEN_KEY)).toBeNull()
  })
})

describe('the note itself', () => {
  it('is read once', () => {
    noteReopen('tracker')
    expect(takeReopen()).toBe('tracker')
    expect(takeReopen()).toBeNull()
  })
  /* the narrow read of 4 Nov 26: a note left by a reload the browser held back must not fire at a much later sign-in */
  it('is used only within a minute of being written; an older one is thrown away', () => {
    sessionStorage.setItem(REOPEN_KEY, JSON.stringify({ page: 'leavewar', at: Date.now() - 61_000 }))
    expect(takeReopen()).toBeNull()
    expect(sessionStorage.getItem(REOPEN_KEY)).toBeNull()
    noteReopen('leavewar')
    expect(takeReopen()).toBe('leavewar')
  })
  it('names only the two pages that download apart; anything else is thrown away', () => {
    noteReopen('admin')
    expect(takeReopen()).toBeNull()
    expect(sessionStorage.getItem(REOPEN_KEY)).toBeNull()
  })
})
