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
import { viewerId, roleOf } from '../state/perms'
import { setPage, BACKPROMPT } from '../state/view'
import { setDayApproved, setSign, dayApproved } from '../engine/publish'
import { vi } from 'vitest'
import { setSaveStatusSource } from './savestatus-source'
import { Postman } from '../storage/postman'
import { Whiteboard } from '../storage/whiteboard'
import { MemoryBackend } from '../storage/memory'


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
/* a sign-up as the card sends it ([ACCOUNTS-NEW-PERSON] — D214: callsign/name, initials, seat, CAT) */
const ask = (cs: string, o: { ini?: string; seat?: string; cat?: string } = {}) =>
  requestAccess({ cs, ini: o.ini ?? 'JB', seat: o.seat ?? 'FCP', cat: o.cat ?? 'C' })

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

describe('D1873 — the fixed bar reserves space in both app trees and leaves none at sign-in', () => {
  it('measures the guest bar on entry, then the main bar, and clears the height on sign-out', async () => {
    const rect = HTMLElement.prototype.getBoundingClientRect
    const measured = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this.matches('#guestApp > .topbar')) return { height: 52.375, top: 0, bottom: 52.375 } as DOMRect
      if (this.matches('#shell > .topbar')) return { height: 86.375, top: 0, bottom: 86.375 } as DOMRect
      return rect.call(this)
    })
    const height = () => document.documentElement.style.getPropertyValue('--topbar-h')
    try {
      await signInAs('bar1873@mail'); ask('Bar1873')
      await signInAs('ad', 'a'); setGuestView(true)
      await signInAs('bar1873@mail')
      expect($('#guestApp')).toBeTruthy()
      expect(height()).toBe('52.375px')
      await signInAs('ad', 'a')
      expect($('#shell')).toBeTruthy()
      expect(height()).toBe('86.375px')
      await click($('#logout'))
      expect($('#login')).toBeTruthy()
      expect(height()).toBe('')
    } finally {
      measured.mockRestore()
      await signInAs('ad', 'a'); setGuestView(false)
      await act(async () => { resetSession(null); notify() })
    }
  })
})

/* D292 (27 Sep 26) REPLACED D166 (3)'s "no preview as a member": an admin's badge is the switch to the member view and
   back again (its tests: ui/memberview.test.tsx, PO11); "View as" another PERSON stays gone */
describe('AC10 — no "View as"; the badge names the signed-in person (D166 (3), D292)', () => {
  it('an admin: no picker; the badge "Saber · Admin" is his member-view switch (D292), and the drawer carries it', async () => {
    await signInAs('ad', 'a')
    expect($('#viewAs')).toBeFalsy()
    expect($('#drawerViewAs')).toBeFalsy()
    expect($('#drawerRole').textContent).toBe('Switch to the member view')
    expect($('#roleBadge').tagName).toBe('BUTTON')
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
    await type($('#accIni') as HTMLInputElement, 'JB')
    await type($('#accSeat') as HTMLSelectElement, 'FCP')
    await type($('#accCat') as HTMLSelectElement, 'C')
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
  it('waiting, with the guest switch on: "View the schedule" goes straight into the guest view (D221); off, no button', async () => {
    await signInAs('wait1@mail')
    await type($('#accCs') as HTMLInputElement, 'W1')
    await type($('#accSeat') as HTMLSelectElement, 'GND')
    await act(async () => { $('#accForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })
    expect($('#accessWaiting')).toBeTruthy()
    expect($('#accessWaiting')!.closest('.login')!.querySelector('.lb-word')!.textContent, 'D1606 — the access screen names the app TALON').toBe('TALON')
    expect($('#accGuest'), 'the switch is off: no button').toBeFalsy()
    await signInAs('ad', 'a'); setGuestView(true)
    await signInAs('wait1@mail')
    expect($('#guestApp'), 'a fresh sign-in with the switch on is already the guest view').toBeTruthy()
    await click($('#guestOut')); await act(async () => { await Promise.resolve() })
    /* the waiting screen itself, while the switch is on: the button */
    await act(async () => { resetSession({ user: 'principal:wait1@mail', role: 'pending', pid: null, name: 'wait1@mail' }); notify() })
    expect($('#accessWaiting')).toBeTruthy()
    await click($('#accGuest'))
    expect($('#guestApp'), 'one tap into the guest view').toBeTruthy()
    expect(roleOf()).toBe('guest')
    await signInAs('ad', 'a'); setGuestView(false)
  })
})

describe('AC12 — the guest sees the published week only, walled off (D204; medical in full, D213)', () => {
  it('none of the app is mounted; an unpublished day shows as members see it (D215); a medical input reads in full (D213)', async () => {
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
    await signInAs('guesty@mail'); ask('G')
    await signInAs('ad', 'a'); setGuestView(true)
    await signInAs('guesty@mail')
    expect($('#guestApp')).toBeTruthy()
    expect($('#guestApp .tx')!.textContent, "D1606 — the guest's bar names the app TALON").toBe('142TALON')
    expect($('#shell')).toBeFalsy()
    for (const sel of ['#topnav', '#viewAs', '#notifyBell', '#insightBtn', '#page-editsched', '#page-inputs', '#page-admin'])
      expect($(sel), `${sel} is not mounted for a guest`).toBeFalsy()
    expect($('#guestApp').textContent, 'D213 — a guest sees medical inputs too').toContain('secret diagnosis')
    expect($('#guestApp .day[data-day="0"]')!.textContent, 'the published day is drawn').not.toContain('Not published yet')
    expect($('#guestApp .day[data-day="0"]')!.textContent).toContain('OML')
    /* D215 — "What members see": a day not yet published shows as it stands, read only */
    expect($('#guestApp').textContent).not.toContain('Not published yet')
    expect($$('#guestApp .day[data-day="1"] .day-body').length, 'an unpublished day is drawn').toBe(1)
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
    await signInAs('newbie@mail'); ask('Newbie')
    await signInAs('ad', 'a')
    expect($('#admWaitBadge').textContent).toBe(String(ACCESS_REQS.length))
    await act(async () => { setPage('admin'); notify() })
    const rq = ACCESS_REQS.find(r => r.name === 'newbie@mail')!
    const waiting = ACCESS_REQS.length
    await click($(`[data-approve="${rq.id}"]`))
    /* [ACCOUNTS-NEW-PERSON]: "Newbie" is on no roster, so Approve opens on New person — link
       someone already on Quals by choosing On the roster */
    await click($('#apvModeRoster'))
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
  /* [ONE-DOOR] (D310, D322): a man already on the roster gets his sign-in on his OWN row — "Give sign-in" (the add
     form's roster picker is gone; the foot's form makes a new person only) */
  it('gives a man on the roster his sign-in, on his own row — sign-in name, role', async () => {
    await signInAs('ad', 'a')
    await act(async () => { setPage('admin'); notify() })
    await click($('[data-person="dj"] .acc-tap'))
    await type($('#accGiveName') as HTMLInputElement, 'Ace@Mail')
    await click($('#accGive'))
    expect(accountByName('ace@mail')).toMatchObject({ pid: 'dj', role: 'main', on: true })
    expect($('[data-acct]') && $$('[data-acct]').some(r => r.textContent!.includes('ace@mail'))).toBe(true)
  })
})

/* [POST-OUT-OUTCOMES] (27 Sep 26) — D285: the account buttons read "Suspend" / "Enable" and the
   state "suspended" (today's "Switch off / on" in his words, D280); D300: the sign-in screen says
   each thing once. Register line PO3. */
describe('PO3 — Suspend / Enable, "suspended", the sign-in (D285, D300)', () => {
  /* [ONE-DOOR] (D309, D322): the state reads on the row's Sign-in DOT — red, its words "Sign-in suspended" — where the
     row once wore a "suspended" tag */
  it('the editor offers Suspend, then Enable; the row Sign-in dot reads "suspended" while it is', async () => {
    await signInAs('ad', 'a')
    await act(async () => { setPage('admin'); notify() })
    await click($('[data-acct="achex"] .acc-tap'))
    expect($('#accEdOnOff').textContent).toBe('Suspend')
    await click($('#accEdOnOff'))
    expect(accountByName('hex')).toMatchObject({ on: false })
    expect(BACKPROMPT, 'a Suspend asks nothing').not.toContain('rocky')
    const row = () => $('[data-acct="achex"]')
    const dot = () => $('[data-testid="dot-signin-rocky"]').getAttribute('aria-label')
    expect(dot()).toBe('Sign-in suspended')
    expect(row().textContent).not.toContain('switched off')
    await click($('[data-acct="achex"] .acc-tap'))
    expect($('#accEdOnOff').textContent).toBe('Enable')
    await click($('#accEdOnOff'))
    expect(accountByName('hex')).toMatchObject({ on: true })
    expect(dot()).toBe('Can sign in')
    /* D284: an Enable is one of the two "he's back" acts — the Quals page then asks to check his quals */
    expect(BACKPROMPT).toContain('rocky')
  })
  it('a suspended account signs in to "Your access is suspended", said once', async () => {
    const { updateAccount } = await import('../state/accounts')
    await signInAs('ad', 'a')
    expect(updateAccount('achex', { on: false })).toBe(null)
    await signInAs('hex')
    expect($('#accessOff .acc-h').textContent).toBe('Your access is suspended')
    expect($('#accessOff .acc-p').textContent).toBe('Ask an admin to enable it when you’re back.')
    expect($('#accessOff').textContent).not.toContain('switched')
    await signInAs('ad', 'a'); updateAccount('achex', { on: true })
  })
  /* [ONE-DOOR] (D310 "Delete — D298", D322 the approved rows): the button reads "Delete" on every row, a man with no
     sign-in included — where it read "Delete account" (D285) */
  it('PO4 — "Delete" asks twice and says what goes; the second tap deletes him — account and person (D287, D298, D310)', async () => {
    await signInAs('ad', 'a')
    await act(async () => { setPage('admin'); notify() })
    await click($('[data-acct="achex"] .acc-tap'))
    expect($('#accEdDel').textContent).toBe('Delete')
    expect($('#accEdDelNote')).toBeFalsy()
    await click($('#accEdDel'))
    expect($('#accEdDel').textContent).toBe(`Tap again to delete ${PEOPLE.rocky.cs}`)
    expect($('#accEdDelNote').textContent).toBe('Goes: his account, his Quals row, every day still to come. Days he flew keep his puck. Can’t be undone.')
    expect(accountByName('hex'), 'one tap deletes nothing').toBeTruthy()
    /* Cancel puts the first tap back */
    await click($('#accEdCancel'))
    await click($('[data-acct="achex"] .acc-tap'))
    expect($('#accEdDel').textContent).toBe('Delete')
    await click($('#accEdDel')); await click($('#accEdDel'))
    expect(accountByName('hex')).toBeUndefined()
    expect((PEOPLE as any).rocky.deleted).toBe(true)
    expect($('[data-acct="achex"]'), 'his row leaves the list').toBeFalsy()
  })
})

/* D1657 (5 Nov 26, "the rest as recommended" — [GUEST-SAVE-WARNING], answering the member / guest check's finding): when a
   save has failed, the "Not saved — keep this page open · Retry" band shows on the sign-in screen, the screen after asking
   for access and the guest page too, the page moved down under it so nothing is covered — so a stranger whose request
   was not saved is never told it was sent. Its Retry saves, and the band goes. */
describe('D1657 — the failed-save band on the sign-in, the access screens and the guest page', () => {
  const be = new MemoryBackend(), wb = new Whiteboard(), pm = new Postman(be)
  beforeAll(() => { pm.attach(wb); setSaveStatusSource(pm) })
  const fail = async () => {
    be.failNext(1000)
    await act(async () => { wb.set('inputs', 'd1657', String(Math.random())) })
    await vi.waitFor(() => expect(pm.status).toBe('failed'), { timeout: 3000 })
    await act(async () => { notify() })
  }
  const retry = async (band: HTMLElement) => {
    be.failNext(0)
    await click(band.querySelector('button'))
    await vi.waitFor(() => expect(pm.status).toBe('saved'), { timeout: 3000 })
    await act(async () => { notify() })
  }
  it('the sign-in: the band across the top of the screen, the page moved down under it; Retry saves and it goes', async () => {
    await act(async () => { resetSession(null); notify() })
    expect($('#login')).toBeTruthy()
    expect($('.saveband'), 'nothing while saves work').toBeFalsy()
    await fail()
    const band = $('.saveband.is-screen')
    expect(band, 'the band').toBeTruthy()
    expect(band.textContent).toContain('Not saved — keep this page open')
    expect($('#login').classList.contains('band-up'), 'the page moved down under it').toBe(true)
    await retry(band)
    expect($('.saveband'), 'gone once saved').toBeFalsy()
    expect($('#login').classList.contains('band-up')).toBe(false)
  })
  it('asking for access, and the screen after it: the band, the page moved down', async () => {
    await signInAs('band1657@mail')
    expect($('#accessRequest')).toBeTruthy()
    await fail()
    expect($('.saveband.is-screen'), 'on Request access').toBeTruthy()
    expect($('#accessRequest').classList.contains('band-up')).toBe(true)
    await type($('#accCs') as HTMLInputElement, 'Band')
    await type($('#accSeat') as HTMLSelectElement, 'FCP')
    await type($('#accCat') as HTMLSelectElement, 'C')
    await act(async () => { $('#accForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })
    expect($('#accessWaiting')).toBeTruthy()
    expect($('.saveband.is-screen'), 'the request was not saved: the waiting screen says so').toBeTruthy()
    expect($('#accessWaiting').classList.contains('band-up')).toBe(true)
    /* D1664 (5 Nov 26, "As recommended"): while it is not saved the pass says so - its mark and its first step read
       "Not sent yet" (the band's amber), the second step not yet his */
    const steps = () => [...document.querySelectorAll('#accessWaiting .pass-steps li')].map(n => `${n.className}:${n.textContent}`)
    expect($('#accessWaiting .pass-state').textContent, 'the mark').toBe('Not sent yet')
    expect($('#accessWaiting .pass-state').classList.contains('unsent')).toBe(true)
    expect(steps(), 'the steps').toEqual(['unsent:!Not sent yet', ':An admin approves', ":You're on the schedule"])
    expect(document.querySelector('#accessWaiting .pass-steps li[aria-current]'), 'no step is where he is yet').toBeNull()
    await retry($('.saveband.is-screen'))
    expect($('.saveband')).toBeFalsy()
    /* saved: the approved look is back by itself */
    expect($('#accessWaiting .pass-state').textContent).toBe('Waiting for an admin')
    expect($('#accessWaiting .pass-state').classList.contains('unsent')).toBe(false)
    expect(steps()).toEqual(['done:Request sent', 'now:An admin approves', ":You're on the schedule"])
  })
  it('the guest page: the band is the guest bar last line, as on every other page', async () => {
    await signInAs('ad', 'a'); setGuestView(true)
    await signInAs('band1657@mail')
    expect($('#guestApp')).toBeTruthy()
    await fail()
    const bar = $('#guestApp .topbar.guestbar')
    expect(bar.classList.contains('save-failed'), 'the bar makes room').toBe(true)
    const band = bar.querySelector('.savestat.failed') as HTMLElement
    expect(band, 'the band in the bar').toBeTruthy()
    expect(band.textContent).toContain('Not saved — keep this page open')
    await retry(band)
    expect(bar.classList.contains('save-failed')).toBe(false)
    expect($('#guestApp .savestat.failed')).toBeFalsy()
    await signInAs('ad', 'a'); setGuestView(false)
  })
})
