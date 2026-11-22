// @vitest-environment jsdom
/* A SIGN-IN WAITS FOR THE LAST SAVE (batch 1's second half, plan §8 — step G; his D2205 (M2), D2322; pictures 10, f6a,
   f6b on docs/mock/2026-11-22-msq-b1-screens/). On a shared computer the last person signed out with a change still
   saving; the next person presses Sign in:
   - held: the button "Signing in…", greyed, one line under it — "Waiting for the last change on this page to save."
     (picture 10); a save that failed — "The last change has not saved yet — check the connection. Sign in waits until it
     saves." (f6b) — so the save goes under the first person's name, never the second's;
   - once it lands, the sign-out's owed reload runs first (the next person gets a fresh Tracker — ui/logout.ts), and the
     page after it shows his typed name kept, the password empty, "Saved. Press Sign in again." (f6a) — never the
     password kept;
   - with no reload owed, he is signed in by himself once it lands.
   Red first on the code before the change. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Login } from './Login'
import { initStore, resetSession } from '../state/store'
import * as auth from '../state/auth'
import { watchSaves } from '../storage/savewait'
import { logOut, setReloadSeam } from './logout'
import { KEPT_NAME_KEY, peekKeptName, dropKeptName } from './signinhold'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const WAITING = 'Waiting for the last change on this page to save.'
const NOT_YET = 'The last change has not saved yet — check the connection. Sign in waits until it saves.'
const SAVED = 'Saved. Press Sign in again.'

/* a saver whose last change is on its way ('saving') or refused ('failed'), landing on demand */
function saver(start: 'saving' | 'failed' | 'unsaved') {
  let status: string = start
  const subs = new Set<() => void>()
  const s = {
    get status() { return status },
    flush: async () => { if (status === 'failed') throw new Error('refused') },
    onStatus: (f: () => void) => { subs.add(f); return () => { subs.delete(f) } },
  }
  const set = async (to: string) => { await act(async () => { status = to; [...subs].forEach(f => f()) }) }
  return { s, land: () => set('saved'), fail: () => set('failed') }
}

let host: HTMLDivElement, root: Root
let reloads: string[] = []
let prevSeam: (() => void) | null = null
async function mount() {
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<Login />) })
}
beforeEach(async () => {
  initStore()
  resetSession(null)
  sessionStorage.clear()
  reloads = []
  prevSeam = setReloadSeam(() => { reloads.push(auth.SESSION ? `reload, signed in as ${auth.SESSION.user}` : 'reload, nobody signed in') })
})
afterEach(async () => {
  await act(async () => { root.unmount() })
  host.remove(); sessionStorage.clear(); resetSession(null); watchSaves(null)
  if (prevSeam) setReloadSeam(prevSeam)
})
function type(sel: string, v: string) {
  const el = host.querySelector(sel) as HTMLInputElement
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, v)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}
async function press(u: string, p: string) {
  await act(async () => { type('#luser', u); type('#lpass', p) })
  await act(async () => { (host.querySelector('#loginForm') as HTMLFormElement).requestSubmit() })
}
const button = () => host.querySelector('#loginForm button.go') as HTMLButtonElement
const text = () => (host.querySelector('#loginForm') as HTMLElement).textContent || ''
/* Saber signs out with his change still saving */
async function saberLeaves(sv: ReturnType<typeof saver>) {
  resetSession({ user: 'ad', role: 'admin' })
  watchSaves(sv.s as any)
  expect(await logOut()).toBe(true)
  expect(reloads, 'no reload while it waits').toEqual([])
  expect(auth.SESSION).toBeNull()
}

describe('picture 10 — the sign-in held while the last change saves', () => {
  /* (a change in flight at sign-out is finished by the sign-out's own send — ui/logout.ts flushSaves; what is left waiting
     after it is a change queued and not yet sent, or one refused) */
  it('held: nobody signed in, "Signing in…" greyed, the waiting line; a refused save turns it to the not-saved line', async () => {
    const sv = saver('unsaved')
    await saberLeaves(sv)
    await mount()
    await press('ad9', 'a9')
    expect(auth.SESSION, 'the save still goes under Saber’s name').toBeNull()
    expect(button().textContent).toBe('Signing in…')
    expect(button().disabled).toBe(true)
    expect(text()).toContain(WAITING)
    await sv.fail()
    expect(auth.SESSION).toBeNull()
    expect(text()).toContain(NOT_YET)
    expect(text()).not.toContain(WAITING)
  })
  it('it lands: the owed reload runs with nobody signed in, the typed name kept for the page after it — never the password', async () => {
    const sv = saver('failed')
    await saberLeaves(sv)
    await mount()
    await press('ad9', 'a9')
    await sv.land()
    expect(reloads).toEqual(['reload, nobody signed in'])
    expect(auth.SESSION, 'never signed in on the page about to reload').toBeNull()
    const raw = sessionStorage.getItem(KEPT_NAME_KEY) || ''
    expect(JSON.parse(raw).name).toBe('ad9')
    expect(Object.keys(JSON.parse(raw)).sort(), 'the name and its time only').toEqual(['at', 'name'])
    /* this page's own card, while the reload comes (or if it is held back): the same as the page after it */
    expect(button().disabled).toBe(false)
    expect(text()).toContain(SAVED)
    expect((host.querySelector('#lpass') as HTMLInputElement).value).toBe('')
    /* never for the card of the page that wrote it (its reload never happened) */
    expect(peekKeptName()).toBeNull()
    dropKeptName()
  })
  it('the page after the reload: his name kept, the password empty, "Saved. Press Sign in again."; one press signs him in', async () => {
    sessionStorage.setItem(KEPT_NAME_KEY, JSON.stringify({ name: 'ad9', at: Date.now() }))
    await mount()
    expect((host.querySelector('#luser') as HTMLInputElement).value).toBe('ad9')
    expect((host.querySelector('#lpass') as HTMLInputElement).value).toBe('')
    expect(text()).toContain(SAVED)
    await press('ad9', 'a9')
    expect(auth.SESSION?.user).toBeTruthy()
    expect(sessionStorage.getItem(KEPT_NAME_KEY), 'thrown away at the press').toBeNull()
    expect(text()).not.toContain(SAVED)
  })
  it('a kept name older than ten minutes is not used', async () => {
    sessionStorage.setItem(KEPT_NAME_KEY, JSON.stringify({ name: 'ad9', at: Date.now() - 11 * 60_000 }))
    await mount()
    expect((host.querySelector('#luser') as HTMLInputElement).value).toBe('')
    expect(text()).not.toContain(SAVED)
  })
  it('no reload owed (nobody signed out on this page): held, then signed in by himself once it lands', async () => {
    const sv = saver('unsaved')
    watchSaves(sv.s as any)
    await mount()
    await press('ad9', 'a9')
    expect(auth.SESSION).toBeNull()
    expect(text()).toContain(WAITING)
    await sv.land()
    expect(reloads).toEqual([])
    expect(auth.SESSION?.user).toBeTruthy()
  })
  it('nothing waiting: signed in at once, as always', async () => {
    watchSaves({ status: 'saved' } as any)
    await mount()
    await press('ad9', 'a9')
    expect(auth.SESSION?.user).toBeTruthy()
    expect(text()).not.toContain(WAITING)
  })
  it('a wrong password is said at once, never held', async () => {
    const sv = saver('unsaved')
    await saberLeaves(sv)
    await mount()
    await press('ad9', 'wrong')
    expect(text()).toContain('Incorrect username or password.')
    expect(button().textContent).toBe('Sign in')
    expect(button().disabled).toBe(false)
  })
})
