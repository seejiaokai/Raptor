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
/* the note as the page after Retry's reload finds it: written by the page before, ago ms back */
const left = (page: string, ago = 0) => sessionStorage.setItem(REOPEN_KEY, JSON.stringify({ page, at: Date.now() - ago }))

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
    left('leavewar')
    await signInAs('ad', 'a')
    expect(CURPAGE).toBe('leavewar')
    expect(sessionStorage.getItem(REOPEN_KEY)).toBeNull()
  })
  it('the same for the Tracker, for a member', async () => {
    left('tracker')
    await signInAs('us', 'us')
    expect(CURPAGE).toBe('tracker')
  })
  it('no note: the first page, as always', async () => {
    await signInAs('ad', 'a')
    expect(CURPAGE).toBe('viewsched')
  })
  it('a wrong password keeps the note for the right one', async () => {
    left('leavewar')
    await signInAs('ad', 'x')
    expect(JSON.parse(sessionStorage.getItem(REOPEN_KEY)!).page).toBe('leavewar')
    await signInAs('ad', 'a')
    expect(CURPAGE).toBe('leavewar')
  })
  it('someone with no access yet (asking for it): no page opened, and the note thrown away', async () => {
    left('leavewar')
    await signInAs('nobody-yet', 'x')
    expect(CURPAGE).not.toBe('leavewar')
    expect(sessionStorage.getItem(REOPEN_KEY)).toBeNull()
  })
})

describe('the note itself', () => {
  it('is read once', () => {
    left('tracker')
    expect(takeReopen()).toBe('tracker')
    expect(takeReopen()).toBeNull()
  })
  /* the code reads of 4 Nov 26: a slow reload on a weak signal, then a password typed on a phone, can take minutes — the
     note holds 10; older, or dated in the future (a clock set back), it is thrown away */
  it('is used within ten minutes of being written; an older one, or one dated ahead, is thrown away', () => {
    left('leavewar', 9 * 60_000)
    expect(takeReopen()).toBe('leavewar')
    left('leavewar', 11 * 60_000)
    expect(takeReopen()).toBeNull()
    expect(sessionStorage.getItem(REOPEN_KEY)).toBeNull()
    left('leavewar', -60_000)
    expect(takeReopen()).toBeNull()
  })
  /* the third read: a reload held back ("Leave site?" Stay) leaves its note on a page never replaced — a later sign-out and
     sign-in there must not open the page for whoever signs in */
  it('a note this very page wrote (its reload never happened) is not used, and is thrown away', () => {
    noteReopen('leavewar')
    expect(takeReopen()).toBeNull()
    expect(sessionStorage.getItem(REOPEN_KEY)).toBeNull()
    left('tracker')
    expect(takeReopen()).toBe('tracker')        // once thrown away, a note from a real reload is read again
  })
  it('names only the two pages that download apart; anything else is thrown away', () => {
    left('admin')
    expect(takeReopen()).toBeNull()
    expect(sessionStorage.getItem(REOPEN_KEY)).toBeNull()
  })
})
