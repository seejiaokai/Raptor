// @vitest-environment jsdom
/* [POST-OUT-OUTCOMES] (27 Sep 26) — THE ADMIN'S MEMBER VIEW. Owner D292 (27 Sep 26), "6. yes": an admin switches himself
   to the member view and back by tapping his name badge — "SABER · ADMIN" ↔ "SABER · MEMBER"; in the member view the app
   behaves exactly as for a member; a tap switches back; every sign-in starts as admin; he stays himself; on a phone the
   switch sits in the drawer's account line. It REPLACES D166 (3)'s "no preview as a member" (the old toggle's tests,
   ui/roletoggle.test.tsx, were deleted with it by [ACCOUNTS]; these bring them back in the new form). Astra's plan read
   A6: the switch is GUARDED — only a session whose ACCOUNT is an admin's may switch, only between admin and member, and a
   hand-made call cannot lift anyone else. Rendered through the real App. Register line PO11. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, notify, resetSession, switchRoleView } from '../state/store'
import { SESSION, canEditSched } from '../state/auth'
import { storeBackend } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { accountsLoad, signIn, sessionFor, updateAccount } from '../state/accounts'
import { isAdmin, me, mayViewAsMember, switchRoleInForce } from '../state/perms'
import { getState as lwState } from '../leavewar/state/store'
import { CURPAGE, setPage } from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const signInAs = async (name: string, pass = 'x') => act(async () => { resetSession(sessionFor(signIn(name, pass))); notify() })

const mem: Record<string, string> = {}
let host: HTMLDivElement
let root: Root
beforeAll(async () => {
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }
  initStore(); accountsLoad()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove(); storeBackend.impl = null
})
beforeEach(async () => { await act(async () => { resetSession(null); notify() }) })

describe('PO11 — the admin taps his badge: the member view and back (D292)', () => {
  it('"Saber · Admin" is a button; a tap makes him exactly a member — the gates, the tabs, the Leave War', async () => {
    await signInAs('ad', 'a')
    const cs = PEOPLE.stiff.cs
    expect($('#roleBadge').tagName).toBe('BUTTON')
    expect($('#roleBadge').textContent).toBe(`${cs} · Admin`)
    await click($('#roleBadge'))
    expect($('#roleBadge').textContent).toBe(`${cs} · Member`)
    expect(isAdmin()).toBe(false)
    expect(canEditSched()).toBe(false)
    expect(me(), 'he stays himself').toBe('stiff')
    expect(($('.nav a[data-page="editsched"]') as HTMLElement).hidden).toBe(true)
    expect(($('.nav a[data-page="admin"]') as HTMLElement).hidden).toBe(true)
    expect(lwState().role).toBe('member')
    /* an admin-only write is refused while he is a member — the gate reads the role in force */
    expect(updateAccount('achex', { on: false })).toBe('Only an admin can change an account')
    await click($('#roleBadge'))
    expect($('#roleBadge').textContent).toBe(`${cs} · Admin`)
    expect(isAdmin()).toBe(true)
    expect(canEditSched()).toBe(true)
    expect(lwState().role).toBe('admin')
  })
  it('switching to the member view on Edit Schedule or Admin falls back to View-only Sched', async () => {
    await signInAs('ad', 'a')
    for (const page of ['editsched', 'admin']) {
      await act(async () => { setPage(page); notify() })
      await click($('#roleBadge'))
      expect(CURPAGE).toBe('viewsched')
      await click($('#roleBadge'))
    }
  })
  it('every sign-in starts as admin', async () => {
    await signInAs('ad', 'a')
    await click($('#roleBadge'))
    expect(isAdmin()).toBe(false)
    await signInAs('ad', 'a')
    expect(isAdmin()).toBe(true)
    expect($('#roleBadge').textContent).toBe(`${PEOPLE.stiff.cs} · Admin`)
  })
  it('on a phone the switch sits in the drawer, under his name; the account line follows', async () => {
    await signInAs('ad', 'a')
    await click($('#burger'))
    expect($('#drawerRole').textContent).toBe('Switch to the member view')
    await click($('#drawerRole'))
    expect(isAdmin()).toBe(false)
    await click($('#burger'))
    expect($('#drawerAcct').textContent).toContain('Member')
    expect($('#drawerRole').textContent).toBe('Back to the admin view')
    await click($('#drawerRole'))
    expect(isAdmin()).toBe(true)
  })
})

describe('PO11 — only a real admin may switch; nobody climbs (Astra A6)', () => {
  it('a member: the badge is a plain chip, no drawer switch, and a hand-made call changes nothing', async () => {
    await signInAs('us', 'us')
    expect($('#roleBadge').tagName).toBe('SPAN')
    expect(mayViewAsMember()).toBe(false)
    switchRoleView()
    expect(switchRoleInForce('admin')).toBe(false)
    expect(isAdmin()).toBe(false)
    expect(SESSION.role).toBe('main')
    await click($('#burger'))
    expect($('#drawerRole')).toBeFalsy()
  })
  it('a pending person, a guest and a suspended account cannot switch into admin', async () => {
    await signInAs('nobody@mail')
    expect(switchRoleInForce('admin')).toBe(false)
    expect(isAdmin()).toBe(false)
    await signInAs('ad', 'a'); expect(updateAccount('achex', { on: false })).toBe(null)
    await signInAs('hex')
    expect(switchRoleInForce('admin')).toBe(false)
    expect(isAdmin()).toBe(false)
    await signInAs('ad', 'a'); updateAccount('achex', { on: true })
  })
  it('the switch moves only between admin and member, never to another role, never another person', async () => {
    await signInAs('ad', 'a')
    expect(switchRoleInForce('guest' as any)).toBe(false)
    expect(switchRoleInForce('off' as any)).toBe(false)
    expect(isAdmin()).toBe(true)
    expect(switchRoleInForce('main')).toBe(true)
    expect(me()).toBe('stiff')
    expect(SESSION.pid).toBe('stiff')
    expect(switchRoleInForce('admin')).toBe(true)
  })
})
