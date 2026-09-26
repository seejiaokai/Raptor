// @vitest-environment jsdom
/* [POST-OUT-OUTCOMES] (27 Sep 26) — Quals' Archived list. D295 (27 Sep 26): "Can we just change the archived name
   directly?" — an archived man is renamed right on the Archived list (admin only), refused with the one callsign rule's
   reason (D226's 14 letters said, never cut — Fable F11; a callsign a man on the roster holds is taken; one only another
   archived man holds is free — D286). D287 / D290 / D299: a DELETED man is on no list — the Archived list included.
   Rendered through the real App. Register lines PO5, PO10. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, notify, resetSession } from '../state/store'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns, nameToId } from '../engine/people'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { setPage } from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const type = async (el: HTMLInputElement, v: string) => {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, v)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
const signInAs = async (name: string, pass = 'x') => act(async () => { resetSession(sessionFor(signIn(name, pass))); notify() })
const openArchived = async () => {
  await act(async () => { setPage('quals'); notify() })
  if (!$('[data-testid="qarchlist"]')) await click($('#qArchToggle'))
}

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
  ;(PEOPLE as any).casper.archived = true
  indexCallsigns()
  await signInAs('ad', 'a')
})

describe('PO10 — Rename on the Archived list (D295)', () => {
  it('an admin renames an archived man right there; the index does not find him (he is archived)', async () => {
    await openArchived()
    await click($('[data-rename="casper"]'))
    await type($('#qRenameCs') as HTMLInputElement, 'Casper Old')
    await click($('#qRenameGo'))
    expect((PEOPLE as any).casper.cs).toBe('Casper Old')
    expect($('[data-testid="qrename-casper"]'), 'the box closes').toBeFalsy()
    expect(nameToId('Casper Old'), 'still archived — a typed callsign never finds him').toBeUndefined()
  })
  it('refused with its reason: a callsign a man on the roster holds; over 14 letters (never cut)', async () => {
    await openArchived()
    await click($('[data-rename="casper"]'))
    await type($('#qRenameCs') as HTMLInputElement, (PEOPLE as any).bane.cs)
    await click($('#qRenameGo'))
    expect($('#qRenameErr').textContent).toMatch(/already taken/)
    await type($('#qRenameCs') as HTMLInputElement, 'Christopher Tan')
    await click($('#qRenameGo'))
    expect($('#qRenameErr').textContent).toMatch(/at most 14 letters/)
    expect((PEOPLE as any).casper.cs).not.toBe('Christopher Tan')
  })
  it('a member sees no Rename', async () => {
    await signInAs('us', 'us')
    await openArchived()
    expect($('[data-rename="casper"]')).toBeFalsy()
  })
})

describe('PO5 — a deleted man is on no list, the Archived one included (D287, D299)', () => {
  it('archived: listed; deleted: gone', async () => {
    await openArchived()
    expect($('[data-testid="qarchrow-casper"]')).toBeTruthy()
    Object.assign((PEOPLE as any).casper, { deleted: true, deletedFrom: '2026-09-27' })
    await act(async () => { notify() })
    expect($('[data-testid="qarchrow-casper"]')).toBeFalsy()
  })
})
