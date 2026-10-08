// @vitest-environment jsdom
/* THE LOGIC PAGE'S DOORS TO THE CALENDARS' SETTINGS (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md
   §3.9, §3.13; owner D639, 7 Oct 26: the late cut-off "is set behind each calendar's own settings gear … and the Logic
   page lists both" — one setting, two ways in).

   The Logic page LISTS the two cut-offs and the members' switch, each as it is set, and each row carries a button that
   opens the SAME window its calendar's gear opens. Nothing of a cut-off is typed on the Logic page itself — the Inputs
   row's day box went with this (it was the one place the rule could be set before the calendars had gears). */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, notify, setSession } from '../state/store'
import { cutRuleText } from '../engine/inputs'
import { storeBackend } from '../engine/hooks'
import { VCONF, rulesResetMem } from '../engine/rules'
import { membersFileOn } from '../state/perms'
import { setMembersFile } from '../state/memberfile'
import { _resetFloatWins } from './FloatWindow'
import { setInpSet, setSansSet } from './pops'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const $ = (sel: string) => host.querySelector(sel) as HTMLElement | null
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const tid = (id: string) => document.querySelector(`[data-testid="${id}"]`) as HTMLElement | null
const click = async (el: Element | null) => { expect(el, 'click target exists').toBeTruthy(); await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) }) }
const row = (needle: string) => $$('#lgBody .lgrule').find(r => (r.textContent || '').includes(needle))!
const as = async (role: 'admin' | 'main') => act(async () => { setSession({ user: role === 'admin' ? 'a' : 'user', role } as any); notify() })
const INPUTS_ROW = 'input is due', SANS_ROW = 'SANS availability entry has a deadline', MEMBERS_ROW = 'Members may file duties and commitments for other people'

beforeAll(async () => {
  /* a place for settings to be kept — a switch is only reported flipped once it reads back flipped */
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] } as any
  rulesResetMem(); initStore()
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await as('admin')
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'logic')!)
})
afterAll(async () => {
  await act(async () => { setInpSet(false); setSansSet(false); root.unmount() })
  host.remove(); _resetFloatWins(); rulesResetMem(); storeBackend.impl = null
})

describe('the Logic page lists the two cut-offs and the members’ switch, each as it is set', () => {
  it('the Inputs cut-off and the SANS cut-off are stated from the settings in force', () => {
    expect(row(INPUTS_ROW).textContent).toContain(cutRuleText('inputs'))
    expect(row(SANS_ROW).textContent).toContain(cutRuleText('sans'))
  })
  it('the members’ switch is stated on or off, and follows the setting', async () => {
    expect(membersFileOn()).toBe(true)
    expect(row(MEMBERS_ROW).textContent).toMatch(/other people: on\./)
    await act(async () => { setMembersFile(false); notify() })
    expect(row(MEMBERS_ROW).textContent).toMatch(/other people: off\./)
    await act(async () => { setMembersFile(true); notify() })
  })
})

describe('each row’s button opens the SAME window its calendar’s gear opens (D639)', () => {
  it('nothing of a cut-off is typed on the Logic page — not even in "Edit rules"', async () => {
    await click($('#lgEdit'))
    for (const k of ['inputLead', 'inputCutMode', 'inputCutWd', 'inputCutWeeks', 'sansLead', 'sansCutMode', 'sansCutWd', 'sansCutWeeks'])
      expect($(`[data-lgset="${k}"]`), k + ' has a box on the Logic page').toBeNull()
    await click($('#lgDone'))
  })
  it('the Inputs cut-off row opens the Inputs calendar’s settings, and a change saved there is the row’s new wording', async () => {
    const door = row(INPUTS_ROW).querySelector('[data-lgopen="inputs"]')
    expect(door!.textContent).toBe('Inputs calendar settings…')
    await click(door)
    expect(tid('win-inputsset')).toBeTruthy()
    const lead = tid('iset-lead') as HTMLInputElement
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(lead, '9'); lead.dispatchEvent(new Event('input', { bubbles: true })) })
    await click(tid('iset-save'))
    expect(VCONF.inputLead).toBe(9)
    expect(tid('win-inputsset')).toBeNull()
    expect(row(INPUTS_ROW).textContent).toContain(cutRuleText('inputs'))
    expect(cutRuleText('inputs')).toMatch(/9 days/)
  })
  it('the members’ switch row opens that same window', async () => {
    await click(row(MEMBERS_ROW).querySelector('[data-lgopen="inputs"]'))
    expect(tid('win-inputsset')).toBeTruthy()
    expect(tid('iset-memberfile')).toBeTruthy()
    await click(tid('iset-cancel'))
  })
  it('the SANS cut-off row opens the SANS calendar’s settings', async () => {
    const door = row(SANS_ROW).querySelector('[data-lgopen="sans"]')
    expect(door!.textContent).toBe('SANS calendar settings…')
    await click(door)
    expect(tid('win-sansset')).toBeTruthy(); expect(tid('win-inputsset')).toBeNull()
    await click(tid('sset-cancel'))
  })
  it('a member reads the rules as they are set and has no door', async () => {
    await as('main')
    expect(row(INPUTS_ROW)).toBeTruthy()
    expect($$('#lgBody [data-lgopen]')).toHaveLength(0)
    await as('admin')
    expect($$('#lgBody [data-lgopen]')).toHaveLength(3)
  })
})
