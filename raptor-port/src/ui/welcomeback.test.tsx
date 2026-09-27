// @vitest-environment jsdom
/* [ONE-DOOR] (27 Sep 26) — HIS OWN "WELCOME BACK", AND A SESSION THAT LAPSES.
   D305: on his first sign-in after Restore the man himself is told "Welcome back — check your quals and CAT", with a
   button to his own Quals row (D149: he edits it); it changes nothing; only he clears it (his own row — person.backSeen).
   Round 1 (Fable F8 / Astra 4, the agent's call on the look card): a signed-in man whose account is suspended, or
   whose person is archived or deleted, lands on the "Your access is suspended" screen on the next repaint — his writes
   refused from that moment. Rendered through the real App. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, notify, resetSession, switchRoleView } from '../state/store'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { accountsLoad, signIn, sessionFor, markBackSeen, updateAccount } from '../state/accounts'
import { deletePerson } from '../state/person-delete'
import { SESSION } from '../state/auth'
import { persistPeople } from '../state/people-settings-commit'
import { CURPAGE } from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const signInAs = async (name: string, pass = 'x') => act(async () => { resetSession(sessionFor(signIn(name, pass))); notify() })
const P = (id: string): any => (PEOPLE as any)[id]

const mem: Record<string, string> = {}
let host: HTMLDivElement
let root: Root
let PEOPLE0 = ''
beforeAll(async () => {
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }
  PEOPLE0 = JSON.stringify(PEOPLE)
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
beforeEach(async () => {
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0)
  indexCallsigns()
  accountsLoad()
})

describe('D305 — the man\'s own welcome back', () => {
  it('shows on his sign-in while it is set; Later clears it (his own row) and it goes', async () => {
    P('rocky').back = true
    await signInAs('hex')
    expect($('#welcomeBack')?.textContent).toMatch(/Welcome back, Hex — check your quals and CAT/)
    await click($('#welcomeLater'))
    expect(P('rocky').back).toBeFalsy()
    expect($('#welcomeBack')).toBeFalsy()
  })

  it('Check my quals clears it and opens Quals on his own row', async () => {
    P('rocky').back = true
    await signInAs('hex')
    await click($('#welcomeCheck'))
    expect(P('rocky').back).toBeFalsy()
    expect(CURPAGE).toBe('quals')
    const row = document.querySelector('#qtbl td.qname[data-person="rocky"]')?.closest('tr')
    expect(row?.classList.contains('back-hl'), 'his row outlined').toBe(true)
  })

  it('nobody else sees it, and nobody else can clear it', async () => {
    P('rocky').back = true
    await signInAs('us', 'us')
    expect($('#welcomeBack')).toBeFalsy()
    markBackSeen()
    expect(P('rocky').back).toBe(true)
  })

  it('the walk design (Fable R44): an admin switched to the member view (D292) still sees his OWN note, and only his', async () => {
    await signInAs('ad', 'a')
    /* both notes set through the roster's own write path (an admin's edit) — a flag set behind its back reads, to the
       next command, as a change of that command's own, and a member's command may change only his own row */
    P('stiff').back = true; P('rocky').back = true
    persistPeople()
    await act(async () => { switchRoleView(); notify() })
    expect(SESSION.role, 'in the member view').not.toBe('admin')
    expect($('#welcomeBack').textContent).toContain('Welcome back, Saber')
    await click($('#welcomeLater'))
    expect(P('stiff').back).toBeFalsy()
    expect(P('rocky').back, 'another man\'s note untouched').toBe(true)
    await act(async () => { switchRoleView(); notify() })
  })
})

describe('round 1 (Fable F8 / Astra 4) — a session that lapses lands on the suspended screen', () => {
  it('archived while signed in: the next repaint shows "Your access is suspended"; his session is off', async () => {
    await signInAs('hex')
    expect($('#shell')).toBeTruthy()
    await act(async () => { P('rocky').archived = true; notify() })
    await act(async () => { notify() })
    expect(SESSION?.role).toBe('off')
    expect($('#accessOff')?.textContent).toMatch(/suspended/i)
  })

  /* the final code read (Astra 1, 27 Sep 26): an ACCOUNT's session whose account is gone (deleted — by another admin or
     by a Delete posting on its date) still said "fine", and one whose account was demoted kept its admin role. Another
     admin's act is simulated in this one browser: his session is swapped in, then the stale one put back. */
  const actAsOtherAdmin = async (fn: () => void) => {
    const stale = SESSION
    await act(async () => { resetSession(sessionFor(signIn('ad', 'a'))); fn(); resetSession(stale); notify() })
    await act(async () => { notify() })
  }
  it('Astra 1: his account deleted while he is signed in — the next repaint turns his session off', async () => {
    await signInAs('hex')
    await actAsOtherAdmin(() => { expect(deletePerson('rocky')).toBeNull() })
    expect(SESSION?.role).toBe('off')
  })
  it('Astra 1: an admin demoted by another admin while signed in — his session drops to member at the next repaint', async () => {
    await signInAs('ad', 'a')
    expect(updateAccount('acoutlaw', { role: 'admin' })).toBeNull()
    await signInAs('outlaw')
    expect(SESSION?.role).toBe('admin')
    await actAsOtherAdmin(() => { expect(updateAccount('acoutlaw', { role: 'main' })).toBeNull() })
    expect(SESSION?.role).toBe('main')
    expect($('#shell'), 'still signed in, as a member').toBeTruthy()
  })
})
