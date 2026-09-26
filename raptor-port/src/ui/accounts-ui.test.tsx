// @vitest-environment jsdom
/* [ACCOUNTS] (26 Sep 26) — the screens, rendered through the real App.
   REPLACES roletoggle.test.tsx: the admin's "View as member" toggle it pinned (27 Aug 26) is
   gone — "There isint a need for preview as a member" (D166 (3)) — and so is the "View as"
   picker; these tests pin their ABSENCE, the badge that names the signed-in person, the
   access screens and the walled-off guest view (D204), the Admin tab's waiting badge and the
   Users panel (D166 (1)). Register lines AC10–AC13. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, notify, resetSession } from '../state/store'
import { SESSION } from '../state/auth'
import { storeBackend } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { accountsLoad, signIn, sessionFor, requestAccess, setGuestView, ACCESS_REQS, accountByName } from '../state/accounts'
import { getState as lwState } from '../leavewar/state/store'
import { viewerId } from '../state/perms'
import { setPage } from '../state/view'
import { setDayApproved, setSign, dayApproved } from '../engine/publish'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const type = async (el: HTMLInputElement | HTMLSelectElement, v: string) => {
  await act(async () => {
    const proto = el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, v)
    el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
  })
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

describe('AC10 — no "View as", no role toggle; the badge names the signed-in person (D166 (3))', () => {
  it('an admin: no picker, an inert badge "Saber · Admin", no toggle in the drawer', async () => {
    await signInAs('ad', 'a')
    expect($('#viewAs')).toBeFalsy()
    expect($('#drawerViewAs')).toBeFalsy()
    expect($('#drawerRole')).toBeFalsy()
    expect($('#roleBadge').tagName).toBe('SPAN')
    expect($('#roleBadge').textContent).toBe(`${PEOPLE.stiff.cs} · Admin`)
    expect($('#drawerAcct').textContent).toContain(PEOPLE.stiff.cs)
    expect(lwState().role).toBe('admin')
  })
  it('a member: the badge names him, the admin-only tabs stay hidden', async () => {
    await signInAs('us', 'us')
    expect($('#roleBadge').textContent).toBe(`${PEOPLE.bane.cs} · Member`)
    expect(($('.nav a[data-page="editsched"]') as HTMLElement).hidden).toBe(true)
    expect(($('.nav a[data-page="admin"]') as HTMLElement).hidden).toBe(true)
    expect(lwState().role).toBe('member')
    expect(viewerId()).toBe('bane')          // what the sync mirrors into the war (walked on the app)
  })
})

describe('AC11 — the access screens (D204)', () => {
  it('on no list → Request access; asking → the waiting screen; Sign out → the sign-in', async () => {
    await signInAs('viper@mail')
    expect($('#shell')).toBeFalsy()
    expect($('#accessRequest')).toBeTruthy()
    expect($('#accName').textContent).toBe('viper@mail')
    await type($('#accCs') as HTMLInputElement, 'Viper')
    await type($('#accFull') as HTMLInputElement, 'Jo Bloggs')
    await act(async () => { $('#accForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })
    expect($('#accessWaiting')).toBeTruthy()
    expect($('#accessWaiting').textContent).toContain('Viper')
    await click($('#accOut'))
    await act(async () => { await Promise.resolve() })
    expect(SESSION).toBe(null)
    expect($('#login')).toBeTruthy()
  })
  it('an account switched off → the switched-off screen', async () => {
    await signInAs('ad', 'a')
    await act(async () => { setPage('admin'); notify() })
    const { updateAccount } = await import('../state/accounts')
    expect(updateAccount('achex', { on: false })).toBe(null)
    await signInAs('hex')
    expect($('#accessOff')).toBeTruthy()
    expect($('#shell')).toBeFalsy()
    await signInAs('ad', 'a'); updateAccount('achex', { on: true })
  })
})

describe('AC12 — the guest sees the published week only, walled off (D204; D211 — no medical detail)', () => {
  it('none of the app is mounted; an unpublished day says so; a medical input reads "Unavailable"', async () => {
    /* a published day carrying a medical input */
    const dt = DAYS[0].dt
    INPUTS.unshift({ iid: 'medg', person: 'dj', type: 'OML', date: dt, allday: true, remarks: 'secret diagnosis', mod: '2026-01-01' } as any)
    await signInAs('ad', 'a')
    /* the four sign-offs first, or setDayApproved refuses and every day reads "Not
       published yet" — which made this test pass vacuously until the walk (26 Sep 26) */
    await act(async () => {
      setSign(0, 'cur', 'ignite'); setSign(0, 'sked', 'bane'); setSign(0, 'plan', 'stiff'); setSign(0, 'appr', 'pump')
      setDayApproved(0, true); notify()
    })
    expect(dayApproved(0), 'the fixture day is published').toBe(true)
    await signInAs('guesty@mail'); requestAccess('G', 'Guest Person')
    await signInAs('ad', 'a'); setGuestView(true)
    await signInAs('guesty@mail')
    expect($('#guestApp')).toBeTruthy()
    expect($('#shell')).toBeFalsy()
    for (const sel of ['#topnav', '#viewAs', '#notifyBell', '#insightBtn', '#page-editsched', '#page-inputs', '#page-admin'])
      expect($(sel), `${sel} is not mounted for a guest`).toBeFalsy()
    expect($('#guestApp').textContent).not.toContain('secret diagnosis')
    expect($('#guestApp .day[data-day="0"]')!.textContent, 'the published day is drawn').not.toContain('Not published yet')
    expect($('#guestApp .day[data-day="0"]')!.textContent).toContain('Unavailable')
    expect($('#guestApp').textContent).toContain('Not published yet')
    expect($$('#guestApp select[data-vwork]')).toHaveLength(0)
    /* the walk (26 Sep 26): his tree mounts no day panel and no warning list, so neither
       door is drawn — no ⓘ, no "tap to review", no day name that looks tappable */
    expect($$('#guestApp .day[data-day="0"]')).toHaveLength(1)
    expect($$('#guestApp [data-dayinfo]')).toHaveLength(0)
    expect($$('#guestApp .dinfobtn')).toHaveLength(0)
    expect($$('#guestApp [data-daywarn], #guestApp .dwbox')).toHaveLength(0)
    INPUTS.splice(INPUTS.findIndex((r: any) => r.iid === 'medg'), 1)
    await signInAs('ad', 'a'); setGuestView(false)
  })
})

describe('AC13 — Admin → Users (D166 (1), D204)', () => {
  it('the Admin tab counts the requests waiting; approve links a puck the admin picks', async () => {
    await signInAs('newbie@mail'); requestAccess('Newbie', 'New Person')
    await signInAs('ad', 'a')
    expect($('#admWaitBadge').textContent).toBe(String(ACCESS_REQS.length))
    await act(async () => { setPage('admin'); notify() })
    const rq = ACCESS_REQS.find(r => r.name === 'newbie@mail')!
    const waiting = ACCESS_REQS.length
    await click($(`[data-approve="${rq.id}"]`))
    await type($('#apvPid') as HTMLSelectElement, 'pike')
    await click($('#apvGo'))
    expect(accountByName('newbie@mail')).toMatchObject({ pid: 'pike', role: 'main' })
    expect(ACCESS_REQS.length).toBe(waiting - 1)
    expect($('#admWaitBadge')?.textContent ?? '0').toBe(String(waiting - 1 || '0'))
  })
  it('his own account reads "you" and cannot be opened; another opens its editor', async () => {
    await signInAs('ad', 'a')
    await act(async () => { setPage('admin'); notify() })
    const own = $('[data-acct="acad"] .acc-tap') as HTMLButtonElement
    expect(own.disabled).toBe(true)
    expect($('[data-acct="acad"]').textContent).toContain('you')
    await click($('[data-acct="achex"] .acc-tap'))
    expect($('[data-editing="achex"]')).toBeTruthy()
  })
  it('adds an account — sign-in name, callsign, role', async () => {
    await signInAs('ad', 'a')
    await act(async () => { setPage('admin'); notify() })
    await type($('#accAddName') as HTMLInputElement, 'Ace@Mail')
    await type($('#accAddPid') as HTMLSelectElement, 'dj')
    await click($('#accAdd'))
    expect(accountByName('ace@mail')).toMatchObject({ pid: 'dj', role: 'main', on: true })
    expect($('[data-acct]') && $$('[data-acct]').some(r => r.textContent!.includes('ace@mail'))).toBe(true)
  })
})
