// @vitest-environment jsdom
/* [ACCOUNTS] (26 Sep 26) — the screens, rendered through the real App.
   REPLACES roletoggle.test.tsx: the admin's "View as member" toggle it pinned (27 Aug 26) is
   gone — "There isint a need for preview as a member" (D166 (3)) — and so is the "View as"
   picker; these tests pin their ABSENCE, the badge that names the signed-in person, the
   access screens (D204), the Admin tab's waiting badge and the Users panel (D166 (1)).
   Register lines AC10–AC13. The walled-off guest view (D204, D221, D215, D213) is removed
   by his D2239 (20 Nov 26): the tests that pinned it now pin its absence. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, notify, resetSession } from '../state/store'
import { SESSION } from '../state/auth'
import { storeBackend } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { accountsLoad, signIn, sessionFor, requestAccess, ACCESS_REQS, accountByName } from '../state/accounts'
import { getState as lwState } from '../leavewar/state/store'
import { viewerId, roleOf } from '../state/perms'
import { setPage, BACKPROMPT } from '../state/view'
import { setDayApproved, setSign, dayApproved } from '../engine/publish'
import { vi } from 'vitest'
import { setSaveStatusSource, setStorageKept } from './savestatus-source'
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
/* THE GUEST SWITCH AS AN OLDER BUILD STORED IT (his D2239, 20 Nov 26 removed it): under every name it was stored by — the
   plain one, and 142's. Read by nothing now (D56); the tests below that once turned the switch on store it instead, to pin
   that it lets nobody in. (Read back after a reload: state/accounts.test.ts and B2's proofs — this file's fake store
   cannot list rows, so a reload here would drop the requests the tests make.) */
const OLD_SWITCH = ['guestview', 'u142@guestview']
const storeOldSwitch = () => { for (const k of OLD_SWITCH) mem['sqn142_' + k] = 'true' }
const clearOldSwitch = () => { for (const k of OLD_SWITCH) delete mem['sqn142_' + k] }

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

/* (rewritten to his D2239: it measured the guest page's bar, the second app tree; the guest view is removed, so a person
   waiting — an old switch stored or not — gets the waiting screen, which has no fixed bar and reserves no room) */
describe('D1873 — the fixed bar reserves space in the app\'s tree and leaves none at sign-in or on the waiting screen', () => {
  it('a person waiting reserves no bar, there is no guest page; then the main bar, and the height cleared on sign-out', async () => {
    const rect = HTMLElement.prototype.getBoundingClientRect
    const measured = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this.matches('#shell > .topbar')) return { height: 86.375, top: 0, bottom: 86.375 } as DOMRect
      return rect.call(this)
    })
    const height = () => document.documentElement.style.getPropertyValue('--topbar-h')
    try {
      await signInAs('bar1873@mail'); ask('Bar1873')
      storeOldSwitch()
      await signInAs('bar1873@mail')
      expect($('#accessWaiting'), 'the waiting screen').toBeTruthy()
      expect($('#guestApp'), 'never a guest page').toBeFalsy()
      expect(height(), 'no bar, no room reserved').toBe('')
      await signInAs('ad', 'a')
      expect($('#shell')).toBeTruthy()
      expect(height()).toBe('86.375px')
      await click($('#logout'))
      expect($('#login')).toBeTruthy()
      expect(height()).toBe('')
    } finally {
      measured.mockRestore()
      clearOldSwitch()
      await act(async () => { resetSession(null); notify() })
    }
  })
  /* The fresh Opus read of the bar's code, F1 (8 Nov 26): a page change can make the bar a row taller or shorter (Edit
     Schedule's changes clock wraps it where the war's bar fits one row). The bar's own watch writes the room a frame late,
     so the browser had already kept the war's rows where they stood under the old room — back on the war from Edit
     Schedule they sat 47px low (GitHub's run of the browser test). jsdom has no resize watch, so only the Shell's
     before-paint write can pass this. */
  it('a page change that changes the bar\'s height moves the page\'s room before paint', async () => {
    const rect = HTMLElement.prototype.getBoundingClientRect
    const measured = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this.matches('#shell > .topbar')) {
        const h = this.classList.contains('editing') ? 104 : 57
        return { height: h, top: 0, bottom: h } as DOMRect
      }
      return rect.call(this)
    })
    const height = () => document.documentElement.style.getPropertyValue('--topbar-h')
    try {
      await signInAs('ad', 'a')
      await act(async () => { setPage('editsched'); notify() })
      expect(height(), 'Edit Schedule\'s taller bar').toBe('104px')
      await act(async () => { setPage('viewsched'); notify() })
      expect(height(), 'back to a one-row bar').toBe('57px')
      await act(async () => { setPage('editsched'); notify() })
      expect(height()).toBe('104px')
    } finally {
      measured.mockRestore()
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
  /* rewritten to his D2239 (20 Nov 26), which replaces D221: it pinned the waiting screen's "View the schedule" button
     into the guest view; the button and the view are removed, so it pins their absence, an old switch stored or not */
  it('waiting: no "View the schedule" button and no guest view, whatever switch an older build stored (D2239)', async () => {
    await signInAs('wait1@mail')
    await type($('#accCs') as HTMLInputElement, 'W1')
    await type($('#accSeat') as HTMLSelectElement, 'GND')
    await act(async () => { $('#accForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })
    expect($('#accessWaiting')).toBeTruthy()
    expect($('#accessWaiting')!.closest('.login')!.querySelector('.lb-word')!.textContent, 'D1606 — the access screen names the app TALON').toBe('TALON')
    expect($('#accGuest'), 'no button').toBeFalsy()
    storeOldSwitch()
    await signInAs('wait1@mail')
    expect($('#guestApp'), 'a fresh sign-in is the waiting screen, never the guest view').toBeFalsy()
    expect($('#accessWaiting')).toBeTruthy()
    expect($('#accGuest'), 'still no button').toBeFalsy()
    expect($('#accessWaiting').textContent, 'nothing offers the schedule').not.toContain('View the schedule')
    expect(roleOf()).toBe('pending')
    /* what the foot shows without it: the three steps, Sign out, "Signed in as …" — nothing in the button's place */
    const foot = [...document.querySelectorAll('#accessWaiting .pass-foot > *')].map(n => n.tagName.toLowerCase() + (n.className ? '.' + n.className : ''))
    expect(foot).toEqual(['ol.pass-steps', 'button.acc-out', 'p.pass-who'])
    clearOldSwitch()
  })
})

/* rewritten to his D2239 (20 Nov 26), which replaces D215 and D213: it pinned the guest reading the published week and a
   medical input in full; the guest view is removed, so a person waiting reads none of the programme, whatever switch an
   older build stored */
describe('AC12 — a person waiting sees none of the programme: no guest view (D2239)', () => {
  it('none of the app is mounted, no week is drawn, and no medical input or day of the schedule reaches him', async () => {
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
    storeOldSwitch()
    await signInAs('guesty@mail')
    expect($('#guestApp'), 'no guest page').toBeFalsy()
    expect($('#accessWaiting'), 'the waiting screen, and only it').toBeTruthy()
    expect($('#shell')).toBeFalsy()
    for (const sel of ['#topnav', '#viewAs', '#notifyBell', '#insightBtn', '#page-viewsched', '#page-editsched', '#page-inputs', '#page-admin'])
      expect($(sel), `${sel} is not mounted for a person waiting`).toBeFalsy()
    expect($$('.day'), 'no day of the week is drawn').toHaveLength(0)
    expect(document.body.textContent, 'the medical input never reaches him').not.toContain('secret diagnosis')
    expect(document.body.textContent).not.toContain('OML')
    INPUTS.splice(INPUTS.findIndex((r: any) => r.iid === 'medg'), 1)
    clearOldSwitch()
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
   for access (and, until the guest view went with D2239, the guest page too), the page moved down under it so nothing is covered — so a stranger whose request
   was not saved is never told it was sent. Its Retry saves, and the band goes. */
describe('D1657 — the failed-save band on the sign-in and the access screens (the guest page gone, D2239)', () => {
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
  /* rewritten to his D2239: it pinned the band as the guest page's bar's last line; the guest page is removed, so a
     person waiting with an old switch stored is on the waiting screen, and the band is across its top there */
  it('a person waiting, an old guest switch stored: no guest page — the band across his waiting screen, moved down under it', async () => {
    storeOldSwitch()
    await signInAs('band1657@mail')
    expect($('#guestApp'), 'no guest page').toBeFalsy()
    expect($('#accessWaiting')).toBeTruthy()
    await fail()
    const band = $('.saveband.is-screen')
    expect(band, 'the band').toBeTruthy()
    expect(band.textContent).toContain('Not saved — keep this page open')
    expect($('#accessWaiting').classList.contains('band-up'), 'the screen moved down under it').toBe(true)
    await retry(band)
    expect($('.saveband')).toBeFalsy()
    expect($('#accessWaiting').classList.contains('band-up')).toBe(false)
    clearOldSwitch()
  })
  /* D1873 (round 2): the bar is fixed now, so the page moves down under the band only when --topbar-h changes. The bar's
     own resize watch writes it a frame late (to stay out of the browser's resize-watch loop), so the band's coming and
     going must write it before paint by itself, or for one frame the band covers the page's first line. jsdom has no
     resize watch, so only that before-paint write can pass this. */
  it('D1873 — the band moves the page in the same frame: the reserved height follows the bar as the band comes and goes', async () => {
    const rect = HTMLElement.prototype.getBoundingClientRect
    const measured = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this.matches('#shell > .topbar')) {
        const h = this.classList.contains('save-failed') ? 94.375 : 58.375
        return { height: h, top: 0, bottom: h } as DOMRect
      }
      return rect.call(this)
    })
    const height = () => document.documentElement.style.getPropertyValue('--topbar-h')
    /* The fresh Opus read, F2: the Shell tells the page the band came with a resize notice, and the bar's own window-resize
       listener rewrites the room on it — inside the same act, so a check after it passes with or without the before-paint
       write. This listener, added before the Shell mounts, runs before the bar's and records the room as it stood when
       that notice went out, after paint: only the before-paint write has it right by then. */
    const atNotice: string[] = []
    const onResize = (e: Event) => { if ((e as Event & { saveBand?: boolean }).saveBand) atNotice.push(height()) }
    window.addEventListener('resize', onResize)
    try {
      await signInAs('ad', 'a')
      expect(height()).toBe('58.375px')
      await fail()
      expect($('#shell > .topbar').classList.contains('save-failed')).toBe(true)
      expect(height(), 'the page moved down with the band').toBe('94.375px')
      await retry($('#shell > .topbar .savestat.failed'))
      expect(height(), 'and back up when it went').toBe('58.375px')
      expect(atNotice, 'the room was already right before the band was painted, both ways').toEqual(['94.375px', '58.375px'])
      window.removeEventListener('resize', onResize)
      /* (the guest page measured here too until D2239 removed it: a person waiting, an old switch stored, is on the
         waiting screen, which moves down under the band by its own class, never by the bar's reserved room) */
      await signInAs('band1873@mail'); ask('Band1873')
      storeOldSwitch()
      await signInAs('band1873@mail')
      expect($('#guestApp'), 'no guest page').toBeFalsy()
      expect($('#accessWaiting')).toBeTruthy()
      await fail()
      expect($('#accessWaiting').classList.contains('band-up'), 'his screen moved down with the band').toBe(true)
      await retry($('.saveband.is-screen'))
      expect($('#accessWaiting').classList.contains('band-up')).toBe(false)
    } finally {
      window.removeEventListener('resize', onResize)
      measured.mockRestore()
      be.failNext(0)
      clearOldSwitch()
    }
  })
})

/* D1901 (8 Nov 26): a browser that keeps nothing gets the "Not kept" band in the same places, the page moved down under
   it the same way — the room is made for either band. The fresh Opus read of chat 28 found nothing guarding that room:
   any of these screens could go back to making room for a failed save only and every test still passed. And the access
   pass reads "Not sent yet" only for a failed save (D1664), never because the browser keeps nothing. */
describe('D1901 — the "Not kept" band on the sign-in, the access screens and the app (the guest page gone, D2239)', () => {
  const be = new MemoryBackend(), wb = new Whiteboard(), pm = new Postman(be)
  beforeAll(() => { pm.attach(wb); setSaveStatusSource(pm) })
  beforeEach(async () => { setStorageKept(false); await act(async () => { notify() }) })
  afterEach(async () => { setStorageKept(true); await act(async () => { notify() }) })
  it('the sign-in: the band across the top, the page moved down under it, no Retry', async () => {
    await act(async () => { resetSession(null); notify() })
    const band = $('.saveband.is-screen')
    expect(band, 'the band').toBeTruthy()
    expect(band.textContent).toContain('Not kept — this browser loses your work on a reload')
    expect(band.querySelector('button'), 'nothing to retry').toBeNull()
    expect($('#login').classList.contains('band-up'), 'the page moved down under it').toBe(true)
  })
  it('asking for access and the screen after it: the band, the page moved down; the pass in its ordinary words', async () => {
    await signInAs('nokeep1901@mail')
    expect($('#accessRequest').classList.contains('band-up')).toBe(true)
    await type($('#accCs') as HTMLInputElement, 'Keep')
    await type($('#accSeat') as HTMLSelectElement, 'FCP')
    await type($('#accCat') as HTMLSelectElement, 'C')
    await act(async () => { $('#accForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })
    expect($('#accessWaiting')).toBeTruthy()
    expect($('#accessWaiting').classList.contains('band-up')).toBe(true)
    expect($('.saveband.is-screen').textContent).toContain('Not kept')
    expect($('#accessWaiting .pass-state').textContent, 'not "Not sent yet": nothing failed').toBe('Waiting for an admin')
    expect($('#accessWaiting .pass-state').classList.contains('unsent')).toBe(false)
  })
  /* rewritten to his D2239: its first half pinned the band in the guest page's bar; the guest page is removed, so a person
     waiting with an old switch stored gets it across his waiting screen; the app's half is kept as it was */
  it('a person waiting (no guest page) and the app: the band across his screen; in the app the bar\'s last line, the bar making room', async () => {
    storeOldSwitch()
    await signInAs('nokeep1901@mail')
    expect($('#guestApp'), 'no guest page').toBeFalsy()
    expect($('#accessWaiting').classList.contains('band-up'), 'his screen makes room').toBe(true)
    expect($('.saveband.is-screen').textContent, 'the band across it').toContain('Not kept')
    clearOldSwitch()
    await signInAs('ad', 'a')
    const bar = $('#shell > .topbar')
    expect(bar.classList.contains('save-failed'), "the app's bar makes room").toBe(true)
    expect(bar.querySelector('.savestat.nokeep'), "the band in the app's bar").toBeTruthy()
  })
})
