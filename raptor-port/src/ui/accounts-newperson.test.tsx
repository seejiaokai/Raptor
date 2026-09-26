// @vitest-environment jsdom
/* [ACCOUNTS-NEW-PERSON] (26 Sep 26) — the screens, rendered through the real App: the
   sign-up asking what the admin asks (D214, D222, D225, D226), approving and adding with
   "On the roster" | "New person" (D214, D217, D204), the words (D219, D220), the admins'
   bell (D216, D227) and the one way into Admin → Users from the bell and from Quals'
   "+ Add person" (D217). Register lines NP1, NP4–NP7. The state underneath is
   state/accounts.test.ts and state/roster-add.test.ts. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, notify, resetSession } from '../state/store'
import { storeBackend, HOOKS, store } from '../engine/hooks'
import { PEOPLE, ID_BY_CS } from '../engine/people'
import {
  accountsLoad, signIn, sessionFor, requestAccess, ACCESS_REQS, accountByName, accessAlert, declineRequest, linkablePeople,
  accountOfPid,
} from '../state/accounts'
import { fileReport, REPORTS } from '../state/reports'
import { setPage, CURPAGE, ADMINOPEN, requestAdminUsers } from '../state/view'

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
const flush = async () => act(async () => { await new Promise(r => setTimeout(r, 0)) })
const signInAs = async (name: string, pass = 'x') => act(async () => { resetSession(sessionFor(signIn(name, pass))); notify() })
const ask = (cs: string, o: { ini?: string; seat?: string; cat?: string } = {}) =>
  requestAccess({ cs, ini: o.ini ?? 'JB', seat: o.seat ?? 'FCP', cat: o.cat ?? 'C' })
const csOf = (cs: string) => Object.keys(PEOPLE).find(k => (PEOPLE as any)[k].cs === cs)
const drop = (...css: string[]) => { for (const cs of css) { const id = csOf(cs); if (id) delete (PEOPLE as any)[id]; delete (ID_BY_CS as any)[cs.toLowerCase()] } }
const clearRequests = async () => { await signInAs('ad', 'a'); for (const r of ACCESS_REQS.slice()) declineRequest(r.id) }
const optTexts = (sel: string) => [...(document.querySelector(sel) as HTMLSelectElement).options].map(o => o.textContent)

const mem: Record<string, string> = {}
const toasts: string[] = []
let host: HTMLDivElement
let root: Root
const origToast = HOOKS.toast, origPhone = HOOKS.isPhone
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
  host.remove(); storeBackend.impl = null; HOOKS.toast = origToast; HOOKS.isPhone = origPhone
})
beforeEach(async () => {
  toasts.length = 0
  HOOKS.toast = (m: any) => { toasts.push(String(m)) }
  HOOKS.isPhone = () => false
  drop('Blaze', 'Vyper', 'Viper', 'Gecko', 'Zephyr')
  await clearRequests()
  REPORTS.length = 0
  await act(async () => { resetSession(null); notify() })
})

describe('NP4 — the sign-up card asks what the admin asks (D214, D222, D225, D226, D220)', () => {
  it('four labelled fields, the D222 label, no Name box; Pilot / WSO / Personnel; CAT hidden for personnel', async () => {
    await signInAs('fresh@mail')
    const labels = $$('#accForm label').map(l => l.textContent)
    expect(labels).toEqual(['Displayed callsign/name', 'Initials', 'Pilot, WSO or personnel', 'CAT'])
    expect($('#accFull'), 'the Name box gave way to initials (D219)').toBeFalsy()
    expect(optTexts('#accSeat')).toEqual(['Pick…', 'Pilot', 'WSO', 'Personnel (ground crew)'])
    await type($('#accSeat') as HTMLSelectElement, 'GND')
    expect($('#accCat'), 'personnel hold no CAT').toBeFalsy()
    await type($('#accSeat') as HTMLSelectElement, 'RCP')
    expect(optTexts('#accCat')).not.toContain('IP')
    await type($('#accCat') as HTMLSelectElement, 'IW')
    await type($('#accSeat') as HTMLSelectElement, 'FCP')
    expect(($('#accCat') as HTMLSelectElement).value, 'a CAT the new seat cannot hold goes back to Pick…').toBe('')
  })
  it('D226: past 14 letters the card says so at once, and Request access refuses — nothing cut', async () => {
    await signInAs('fresh@mail')
    await type($('#accCs') as HTMLInputElement, 'Christopher Tan')
    expect(($('#accCs') as HTMLInputElement).value, 'the box keeps every letter').toBe('Christopher Tan')
    expect($('#accCsLong').textContent).toMatch(/at most 14 letters/)
    await type($('#accSeat') as HTMLSelectElement, 'FCP'); await type($('#accCat') as HTMLSelectElement, 'C')
    await act(async () => { $('#accForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })
    expect($('#accErr').textContent).toMatch(/at most 14 letters/)
    expect($('#accessRequest'), 'still on the card').toBeTruthy()
  })
  it('D225: initials may be blank; the waiting screen reads what he gave', async () => {
    await signInAs('fresh@mail')
    await type($('#accCs') as HTMLInputElement, 'Viper')
    await act(async () => { $('#accForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })
    expect($('#accErr').textContent, 'a missing pick is refused with its reason').toBe('Pick pilot, WSO or personnel')
    await type($('#accSeat') as HTMLSelectElement, 'FCP')
    expect($('#accErr').textContent, 'the walk: the refusal goes once he changes a field').toBe('')
    await type($('#accCat') as HTMLSelectElement, 'C')
    await act(async () => { $('#accForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })) })
    expect($('#accAsked').textContent).toBe("You asked for access as Viper (Pilot · CAT C). You'll be able to sign in as soon as an admin approves it.")
  })
})

describe('NP5 — approving: On the roster | New person, filled from what he gave (D214, D204)', () => {
  it('a callsign on no roster opens New person, filled; the admin corrects; one tap makes person and account', async () => {
    await signInAs('viper@mail'); ask('Viper', { ini: 'jkb', seat: 'RCP', cat: 'C' })
    await signInAs('ad', 'a')
    await act(async () => { setPage('admin'); notify() })
    const rq = ACCESS_REQS[0]
    expect($(`[data-req="${rq.id}"] .acc-sub`).textContent).toMatch(/^asked as Viper · JKB · WSO · CAT C · /)
    await click($(`[data-approve="${rq.id}"]`))
    expect($('#apvModeNew').getAttribute('aria-pressed')).toBe('true')
    expect(($('#apvCs') as HTMLInputElement).value).toBe('Viper')
    expect(($('#apvIni') as HTMLInputElement).value).toBe('JKB')
    expect(($('#apvSeat') as HTMLSelectElement).value).toBe('RCP')
    expect($('#apvGo').textContent).toBe('Add person and give access')
    await type($('#apvCs') as HTMLInputElement, 'Vyper')
    await type($('#apvCat') as HTMLSelectElement, 'D')
    await click($('#apvGo'))
    const pid = csOf('Vyper')!
    expect(PEOPLE[pid]).toMatchObject({ seat: 'RCP', q: 'D', initials: 'JKB' })
    expect(accountByName('viper@mail')).toMatchObject({ pid })
    expect(ACCESS_REQS).toHaveLength(0)
    expect(toasts).toContain('Vyper added — viper@mail can sign in now')
  })
  it('a callsign on the roster opens On the roster, NEVER pre-picked, with a note naming him (by callsign, never an id)', async () => {
    /* someone on Quals with NO account yet — the picker offers him (Fable's read #1: the
       first version of this test used Ranger, who already HAS an account, so the note it
       pinned told the admin to pick a man the picker could not offer) */
    const free = linkablePeople().find(id => String((PEOPLE as any)[id].cs).toLowerCase() !== id)!
    const fcs = String((PEOPLE as any)[free].cs)
    await signInAs('r1@mail'); ask(fcs)
    await signInAs('r2@mail'); ask(free)
    await signInAs('ad', 'a')
    await act(async () => { setPage('admin'); notify() })
    const [a, b] = ACCESS_REQS
    await click($(`[data-approve="${a.id}"]`))
    expect($('#apvModeRoster').getAttribute('aria-pressed')).toBe('true')
    expect(($('#apvPid') as HTMLSelectElement).value, 'D204: a typed callsign never claims a puck').toBe('')
    expect(optTexts('#apvPid'), 'the one the note names is there to pick').toContain(fcs)
    expect($('#apvNote').textContent).toBe(`He typed ${fcs} — ${fcs} is on the roster. Pick them if this is them.`)
    await click($('#apvCancel'))
    await click($(`[data-approve="${b.id}"]`))
    expect($('#apvNote').textContent).toBe(`He typed ${free} — that is ${fcs}. Pick them if this is them.`)
  })
  it('a callsign whose person ALREADY has an account: the note says so and never asks him to pick them (Fable read #1)', async () => {
    const bane = accountOfPid('bane')!
    expect(bane, 'the seed: Ranger (bane) holds an account').toBeTruthy()
    await signInAs('r1@mail'); ask('Ranger')
    await signInAs('r2@mail'); ask('bane')
    await signInAs('ad', 'a')
    await act(async () => { setPage('admin'); notify() })
    const [a, b] = ACCESS_REQS
    await click($(`[data-approve="${a.id}"]`))
    expect(optTexts('#apvPid'), 'one account per person: the picker cannot offer him').not.toContain('Ranger')
    expect($('#apvNote').textContent).toBe(`He typed Ranger — Ranger already has an account (${bane.name}), so they can't be picked here. If this is someone else, choose New person and give them another callsign or name.`)
    expect($('#apvNote').textContent).not.toMatch(/Pick them/)
    await click($('#apvCancel'))
    await click($(`[data-approve="${b.id}"]`))
    expect($('#apvNote').textContent).toBe(`He typed bane — that is Ranger, who already has an account (${bane.name}), so they can't be picked here. If this is someone else, choose New person and give them another callsign or name.`)
  })
  it('Cancel discards edits: the next Approve starts again from what he gave; switching halves keeps each', async () => {
    await signInAs('viper3@mail'); ask('Viper')
    await signInAs('ad', 'a')
    await act(async () => { setPage('admin'); notify() })
    const rq = ACCESS_REQS[0]
    await click($(`[data-approve="${rq.id}"]`))
    await type($('#apvCs') as HTMLInputElement, 'Edited')
    await click($('#apvModeRoster'))
    const pick = (document.querySelector('#apvPid') as HTMLSelectElement).options[1].value   // the first linkable person
    await type($('#apvPid') as HTMLSelectElement, pick)
    await click($('#apvModeNew'))
    expect(($('#apvCs') as HTMLInputElement).value, 'the New person half kept its edit').toBe('Edited')
    await click($('#apvModeRoster'))
    expect(($('#apvPid') as HTMLSelectElement).value, 'and the roster half its pick').toBe(pick)
    await click($('#apvCancel'))
    await click($(`[data-approve="${rq.id}"]`))
    expect(($('#apvCs') as HTMLInputElement).value).toBe('Viper')
  })
})

describe('NP1 — adding on Admin → Users: New person with an account, or alone (D214, D217)', () => {
  it('a blank sign-in makes a roster-only person: no Role, "Add person"', async () => {
    await signInAs('ad', 'a')
    await act(async () => { setPage('admin'); notify() })
    expect($('#accModeRoster').getAttribute('aria-pressed'), 'On the roster by default').toBe('true')
    expect($('#accAdd').textContent).toBe('Add account')
    await click($('#accModeNew'))
    expect($('#accAddRole'), 'no account, no role').toBeFalsy()
    expect($('#accAdd').textContent).toBe('Add person')
    await type($('#accAddCs') as HTMLInputElement, 'Gecko')
    await type($('#accAddSeat') as HTMLSelectElement, 'FCP'); await type($('#accAddCat') as HTMLSelectElement, 'OCU')
    await click($('#accAdd'))
    expect(csOf('Gecko')).toBeTruthy()
    expect(toasts).toContain('Gecko added to the roster — set flight and quals on the Quals page')
    expect($('#accModeRoster').getAttribute('aria-pressed'), 'the form clears back').toBe('true')
  })
  it('with a sign-in: "Add person and account", Role shown; refused halves leave nothing', async () => {
    await signInAs('ad', 'a')
    await act(async () => { setPage('admin'); notify() })
    await click($('#accModeNew'))
    await type($('#accAddName') as HTMLInputElement, 'hex')
    expect($('#accAdd').textContent).toBe('Add person and account')
    expect($('#accAddRole')).toBeTruthy()
    await type($('#accAddCs') as HTMLInputElement, 'Blaze')
    await type($('#accAddSeat') as HTMLSelectElement, 'RCP'); await type($('#accAddCat') as HTMLSelectElement, 'D')
    await click($('#accAdd'))
    expect(toasts).toContain('hex already has an account')
    expect(csOf('Blaze'), 'no person made for a refused account').toBeUndefined()
    await type($('#accAddName') as HTMLInputElement, 'blaze@mail')
    await click($('#accAdd'))
    expect(accountByName('blaze@mail')).toMatchObject({ pid: csOf('Blaze') })
    expect(toasts).toContain('Blaze added — blaze@mail can sign in now')
  })
  it('a New person add clears the WHOLE form — the roster pick made before it is gone too (Astra read #1)', async () => {
    await signInAs('ad', 'a')
    await act(async () => { setPage('admin'); notify() })
    const pick = linkablePeople()[0]
    await type($('#accAddPid') as HTMLSelectElement, pick)
    await click($('#accModeNew'))
    await type($('#accAddCs') as HTMLInputElement, 'Gecko')
    await type($('#accAddSeat') as HTMLSelectElement, 'FCP'); await type($('#accAddCat') as HTMLSelectElement, 'OCU')
    await click($('#accAdd'))
    expect(csOf('Gecko')).toBeTruthy()
    expect($('#accModeRoster').getAttribute('aria-pressed')).toBe('true')
    expect(($('#accAddPid') as HTMLSelectElement).value, 'the earlier roster pick did not survive the add').toBe('')
    expect(($('#accAddName') as HTMLInputElement).value).toBe('')
    expect(($('#accAddRole') as HTMLSelectElement).value).toBe('main')
  })
  it('an On the roster add clears the WHOLE form — New person reopens blank (Astra read #1)', async () => {
    await signInAs('ad', 'a')
    await act(async () => { setPage('admin'); notify() })
    await click($('#accModeNew'))
    await type($('#accAddCs') as HTMLInputElement, 'Leftover')
    await type($('#accAddIni') as HTMLInputElement, 'LO')
    await type($('#accAddSeat') as HTMLSelectElement, 'RCP'); await type($('#accAddCat') as HTMLSelectElement, 'D')
    await click($('#accModeRoster'))
    await type($('#accAddName') as HTMLInputElement, 'gecko@mail')
    await type($('#accAddPid') as HTMLSelectElement, linkablePeople()[0])
    await type($('#accAddRole') as HTMLSelectElement, 'admin')
    await click($('#accAdd'))
    expect(accountByName('gecko@mail'), 'the account was made').toBeTruthy()
    expect(($('#accAddName') as HTMLInputElement).value).toBe('')
    expect(($('#accAddRole') as HTMLSelectElement).value).toBe('main')
    await click($('#accModeNew'))
    expect(($('#accAddCs') as HTMLInputElement).value, 'no half-typed person comes back').toBe('')
    expect(($('#accAddIni') as HTMLInputElement).value).toBe('')
    expect(($('#accAddSeat') as HTMLSelectElement).value).toBe('')
    expect(($('#accAddCat') as HTMLSelectElement).value).toBe('')
  })
})

describe('NP4 — a CAT never rides through Personnel (26 Aug 26; Astra read #2)', () => {
  it('the sign-up: Pilot + CAT C → Personnel → WSO shows CAT "Pick…"', async () => {
    await signInAs('fresh@mail')
    await type($('#accSeat') as HTMLSelectElement, 'FCP'); await type($('#accCat') as HTMLSelectElement, 'C')
    await type($('#accSeat') as HTMLSelectElement, 'GND')
    expect($('#accCat'), 'personnel hold no CAT').toBeFalsy()
    await type($('#accSeat') as HTMLSelectElement, 'RCP')
    expect(($('#accCat') as HTMLSelectElement).value, 'the pilot\'s C did not survive Personnel').toBe('')
  })
  it('Admin → Users New person: Pilot + CAT C → Personnel → WSO shows CAT "Pick…"', async () => {
    await signInAs('ad', 'a')
    await act(async () => { setPage('admin'); notify() })
    await click($('#accModeNew'))
    await type($('#accAddSeat') as HTMLSelectElement, 'FCP'); await type($('#accAddCat') as HTMLSelectElement, 'C')
    await type($('#accAddSeat') as HTMLSelectElement, 'GND')
    expect(($('#accAddCat') as HTMLSelectElement).disabled, 'personnel: "None — personnel"').toBe(true)
    await type($('#accAddSeat') as HTMLSelectElement, 'RCP')
    expect(($('#accAddCat') as HTMLSelectElement).value, 'the pilot\'s C did not survive Personnel').toBe('')
  })
  it('approving: the same, on the approve form', async () => {
    await signInAs('viper-seat@mail'); expect(ask('Viper', { seat: 'FCP', cat: 'C' })).toBe(null)
    await signInAs('ad', 'a')
    await act(async () => { setPage('admin'); notify() })
    await click($(`[data-approve="${ACCESS_REQS[0].id}"]`))
    await type($('#apvSeat') as HTMLSelectElement, 'GND')
    await type($('#apvSeat') as HTMLSelectElement, 'RCP')
    expect(($('#apvCat') as HTMLSelectElement).value).toBe('')
  })
})

describe('NP7 — the words (D219, D220)', () => {
  it('every picker and label asks for a "callsign or name"; no (FCP) / (RCP) anywhere', async () => {
    await signInAs('ad', 'a')
    await act(async () => { setPage('admin'); notify() })
    expect(optTexts('#accAddPid')[0]).toBe('Pick a callsign or name…')
    expect($('#accAddPid').getAttribute('aria-label')).toBe('The callsign or name this account belongs to')
    expect($('label[for="accAddPid"]').textContent).toBe('Callsign/Name')
    await click($('#accModeNew'))
    expect($('label[for="accAddCs"]').textContent).toBe('Callsign/Name')
    expect(optTexts('#accAddSeat')).toEqual(['Pick…', 'Pilot', 'WSO', 'Personnel (ground crew)'])
    expect(document.body.innerHTML).not.toMatch(/\((FCP|RCP)\)/)
  })
})

describe("NP6 — the admins' bell, each admin's own (D216, D227)", () => {
  it('lights for a request; the tap says so and opens Admin → Users, which puts it out; a member never', async () => {
    await signInAs('kite@mail'); ask('Kite')
    await signInAs('us', 'us')
    expect($('#notifyBell').classList.contains('on'), "a member's bell never lights for it").toBe(false)
    await signInAs('ad', 'a')
    expect($('#notifyBell').classList.contains('on')).toBe(true)
    await click($('#notifyBell')); await flush()
    expect(toasts).toContain('1 waiting for access — opening Admin → Users')
    expect(CURPAGE).toBe('admin')
    expect($('#admUsers').classList.contains('on')).toBe(true)
    expect(accessAlert(), 'the list was on his screen').toBe(false)
    expect($('#notifyBell').classList.contains('on')).toBe(false)
    expect($('#admWaitBadge').textContent, 'the Admin tab still counts it until answered').toBe('1')
  })
  it('first in order: before a bug report', async () => {
    await signInAs('us', 'us'); fileReport('Quals', 'a thing')
    await signInAs('kite@mail'); ask('Kite')
    await signInAs('ad', 'a')
    await click($('#notifyBell')); await flush()
    expect(CURPAGE).toBe('admin')
    await act(async () => { setPage('viewsched'); notify() })
    expect($('#notifyBell').classList.contains('on'), 'the bug report still lights it').toBe(true)
    await click($('#notifyBell')); await flush()
    expect(CURPAGE).toBe('help')
  })
  it('desktop: the Admin TAB alone puts it out — the list is beside the rail (Fable F1)', async () => {
    await signInAs('kite@mail'); ask('Kite')
    await signInAs('ad', 'a')
    await act(async () => { setPage('admin'); notify() }); await flush()
    expect(accessAlert()).toBe(false)
  })
  it('phone: the category list does NOT count; tapping into Users does (Fable F1)', async () => {
    HOOKS.isPhone = () => true
    await signInAs('kite@mail'); ask('Kite')
    await signInAs('ad', 'a')
    await act(async () => { setPage('admin'); notify() }); await flush()
    expect($('.adm-shell').classList.contains('drilled')).toBe(false)
    expect(accessAlert(), 'only the rail, "1 waiting for access" — not the list').toBe(true)
    await click($$('.adm-cat').find(b => b.textContent!.includes('Users'))!); await flush()
    expect(accessAlert()).toBe(false)
  })
  it('the bell opens Users even when the Admin page is already up on another category (Fable F2)', async () => {
    await signInAs('ad', 'a')
    await act(async () => { setPage('admin'); notify() })
    await click($$('.adm-cat').find(b => b.textContent!.includes('Squadron config'))!)
    expect($('#admConfig').classList.contains('on')).toBe(true)
    /* a request arrives while he is there (at the database step, from another device) —
       the Users list is not on his screen, so his bell lights */
    await act(async () => {
      store.set('accessreqs', [{ id: 'rqx', name: 'kite@mail', cs: 'Kite', ini: '', seat: 'FCP', cat: 'C', at: Date.now(), seenBy: [] }])
      accountsLoad(); notify()
    })
    expect($('#notifyBell').classList.contains('on')).toBe(true)
    await click($('#notifyBell')); await flush()
    expect($('#admUsers').classList.contains('on'), 'the page already up switches to Users').toBe(true)
    expect(accessAlert()).toBe(false)
  })
})

describe("NP1 — Quals' \"+ Add person\" is a button to Admin → Users, New person chosen (D217)", () => {
  it('opens the add form on New person, every press — and a member has no button', async () => {
    await signInAs('ad', 'a')
    for (let i = 0; i < 2; i++) {
      await act(async () => { setPage('quals'); notify() })
      expect($('#qCS'), 'the old form is gone').toBeFalsy()
      await click($('#qAddToggle')); await flush()
      expect(CURPAGE).toBe('admin')
      expect($('#admUsers').classList.contains('on')).toBe(true)
      expect($('#accModeNew').getAttribute('aria-pressed'), `press ${i + 1}`).toBe('true')
      /* the walk (26 Sep 26): on a desktop the box is ready to type in — the plan's promise */
      await flush()
      expect(document.activeElement && document.activeElement.id, `press ${i + 1}: the Callsign/Name box has the cursor`).toBe('accAddCs')
      await click($('#accModeRoster'))
    }
    await signInAs('us', 'us')
    await act(async () => { setPage('quals'); notify() })
    expect($('#qAddToggle'), "a member's Quals page has no Add person").toBeFalsy()
  })
  it('a pending "open Users" never outlives a sign-in (VIEW_RESET)', async () => {
    requestAdminUsers(true)
    expect(ADMINOPEN).toBeTruthy()
    await signInAs('ad', 'a')
    expect(ADMINOPEN).toBe(null)
    await act(async () => { setPage('admin'); notify() })
    expect($('#accModeRoster').getAttribute('aria-pressed')).toBe('true')
  })
})
