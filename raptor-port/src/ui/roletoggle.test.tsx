// @vitest-environment jsdom
/* The admin's role toggle (owner, 27 Aug 26): clicking the role badge flips
   a REAL admin between admin and member view; a member account has no
   toggle. LOGINROLE (auth.ts) is the ceiling — captured at login, untouched
   by the flip — so the way back always exists and a member can never climb.
   Rendered through the real App so the badge, the nav gating and the store
   wiring are the ones the user gets. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, notify, resetSession, toggleRole } from '../state/store'
import { SESSION, canEditSched, canToggleRole } from '../state/auth'
import { getState as lwState } from '../leavewar/state/store'
import { CURPAGE, setPage } from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const login = async (user: string, role: string) =>
  act(async () => { resetSession({ user, role }); notify() })

beforeAll(async () => {
  initStore()
  const host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
})

describe('the admin role toggle', () => {
  it('an admin click flips to member view — gates, badge, nav and Leave War all follow', async () => {
    await login('ad', 'admin')
    expect(canEditSched()).toBe(true)
    expect($('#roleBadge').tagName).toBe('BUTTON')
    await click($('#roleBadge'))
    expect(canEditSched()).toBe(false)
    expect(SESSION.role).toBe('main')
    expect($('#roleBadge').textContent).toBe('Member')
    /* the admin-only tabs hide exactly as they do for a real member */
    expect(($('.nav a[data-page="editsched"]') as HTMLElement).hidden).toBe(true)
    expect(($('.nav a[data-page="admin"]') as HTMLElement).hidden).toBe(true)
    /* the Leave War reads the war as a member too */
    expect(lwState().role).toBe('member')
  })
  it('and the way back is the same click — LOGINROLE kept the truth', async () => {
    expect(canToggleRole()).toBe(true)          // still an admin underneath
    expect($('#roleBadge').tagName).toBe('BUTTON') // the way back is still a button
    await click($('#roleBadge'))
    expect(canEditSched()).toBe(true)
    expect(SESSION.role).toBe('admin')
    expect(lwState().role).toBe('admin')
  })
  it('flipping to member off an admin-only page falls back to View-only Sched', async () => {
    await act(async () => { setPage('editsched'); notify() })
    await click($('#roleBadge'))
    expect(CURPAGE).toBe('viewsched')
    await click($('#roleBadge'))               // restore admin for the next test
  })
  it('a member account gets no toggle — the badge is inert and the write path refuses', async () => {
    await login('us', 'main')
    expect(canToggleRole()).toBe(false)
    expect($('#roleBadge').tagName).toBe('SPAN')
    /* even a hand-made call cannot lift a member (the write-path gate,
       not just the missing button) */
    toggleRole()
    expect(canEditSched()).toBe(false)
    expect(SESSION.role).toBe('main')
    expect(lwState().role).toBe('member')
  })
  it('the phone drawer carries the toggle for an admin only', async () => {
    expect($('#drawerRole')).toBeFalsy()       // still the member session
    await login('ad', 'admin')
    expect($('#drawerRole')).toBeTruthy()
    await click($('#drawerRole'))
    expect(canEditSched()).toBe(false)
    expect($('#drawerRole').textContent).toContain('Back to admin')
    await click($('#drawerRole'))
    expect(canEditSched()).toBe(true)
  })
})
