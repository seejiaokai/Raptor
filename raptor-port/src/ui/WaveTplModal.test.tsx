// @vitest-environment jsdom
/* WaveTplModal — the flying-wave-templates editor opened from WAVEEDIT (pops.ts),
   the sibling of DutyTplModal.test.tsx and built the same way: the component
   mounted standalone, a fake storeBackend so waveTplSave()/waveTplReset() never
   touch real localStorage. */
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { WaveTplModal } from './WaveTplModal'
import { storeBackend } from '../engine/hooks'
import { WAVETPL_CFG, waveTplReset } from '../engine/wavetpl'
import { notify } from '../state/store'
import { setWaveEdit } from './pops'
import { setSession, setEffectiveRole } from '../state/auth'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const type = async (el: Element, value: string) => {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    setter.call(el, value)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
const btnByText = (sel: string, text: string) => $$(sel).find(b => b.textContent?.trim() === text) || null

const mem: Record<string, string> = {}
beforeAll(async () => {
  storeBackend.impl = {
    getItem: (k: string) => (k in mem ? mem[k]! : null),
    setItem: (k: string, v: string) => { mem[k] = v },
  }
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<WaveTplModal />) })
})

beforeEach(async () => {
  Object.keys(mem).forEach(k => delete mem[k])
  waveTplReset()
  await act(async () => { setWaveEdit(true); notify() })
})

/* the role tests below sign a session in; every other test in this file relies
   on SESSION being null (a sessionless test context, which the guard treats as
   not-a-member), so always hand it back null afterwards. */
afterEach(() => { setSession(null) })

describe('the wave-templates editor', () => {
  it('opens on the empty state with no templates', () => {
    expect($('#waveTplModal')?.hasAttribute('hidden')).toBeFalsy()
    expect($('.wtpl-empty')).toBeTruthy()
    expect(WAVETPL_CFG.length).toBe(0)
  })

  it('+ New creates a flying template with one blank line and the four rule-sets', async () => {
    await click($('.wtpl-empty .abtn') || $('.tpl-tab.new'))
    expect(WAVETPL_CFG.length).toBe(1)
    expect(WAVETPL_CFG[0]!.kind).toBe('fly')
    expect($('.tpl-name')).toBeTruthy()
    expect($$('.wkind-btn').map(b => b.textContent)).toEqual(['Flying wave', 'SC', 'AVALON', 'BB'])
    expect($$('.wline').length).toBe(1)
    /* flying carries no MAIN/SPARE flip */
    expect($('.wline .wrole')).toBeFalsy()
    expect($('.wline .wrole-off')).toBeTruthy()
  })

  it('switching to a standby kind shows the MAIN/SPARE flip and updates the note', async () => {
    await click($('.tpl-tab.new'))
    const flyNote = $('.wknote')?.textContent || ''
    await click(btnByText('.wkind-btn', 'SC'))
    expect(WAVETPL_CFG[0]!.kind).toBe('sc')
    expect($('.wline .wrole')).toBeTruthy()
    expect($('.wknote')?.textContent).not.toBe(flyNote)
    /* the flip toggles the line between MAIN and SPARE */
    expect($('.wline .wrole')?.textContent?.trim()).toBe('MAIN')
    await click($('.wline .wrole'))
    expect(WAVETPL_CFG[0]!.lines[0]!.spare).toBe(true)
    expect($('.wline .wrole')?.textContent?.trim()).toBe('SPARE')
  })

  it('flipping back to flying clears every SPARE flag', async () => {
    await click($('.tpl-tab.new'))
    await click(btnByText('.wkind-btn', 'AVALON'))
    await click($('.wline .wrole'))
    expect(WAVETPL_CFG[0]!.lines[0]!.spare).toBe(true)
    await click(btnByText('.wkind-btn', 'Flying wave'))
    expect(WAVETPL_CFG[0]!.lines[0]!.spare).toBe(false)
    expect($('.wline .wrole')).toBeFalsy()
  })

  it('names the template and edits a line', async () => {
    await click($('.tpl-tab.new'))
    await type($('.tpl-name'), 'BFM Package')
    expect(WAVETPL_CFG[0]!.title).toBe('BFM Package')
    await type($('.wline .wcs'), 'VIPER 1')
    expect(WAVETPL_CFG[0]!.lines[0]!.cs).toBe('VIPER 1')
    /* the tab relabels to the new name */
    expect($$('.tpl-tab').some(t => t.textContent?.includes('BFM Package'))).toBe(true)
  })

  it('adds and deletes lines', async () => {
    await click($('.tpl-tab.new'))
    await click($('.addrow'))
    expect($$('.wline').length).toBe(2)
    await click($('.wline .del'))
    expect($$('.wline').length).toBe(1)
  })

  it('Delete template returns to the empty state; Clear all wipes the library', async () => {
    await click($('.tpl-tab.new'))
    await click($('.tpl-tab.new'))
    expect(WAVETPL_CFG.length).toBe(2)
    await click(btnByText('.modal-foot .abtn', 'Delete template'))
    expect(WAVETPL_CFG.length).toBe(1)
    await click(btnByText('.modal-foot .abtn', 'Clear all'))
    expect(WAVETPL_CFG.length).toBe(0)
    expect($('.wtpl-empty')).toBeTruthy()
  })

  it('Done closes the modal', async () => {
    await click(btnByText('.modal-foot .abtn', 'Done'))
    expect($('#waveTplModal')?.hasAttribute('hidden')).toBeTruthy()
  })

  /* AUTHORITY (bug hunt, 31 Aug 26 — point-2 sweep): the editor self-hides for a
     member even with WAVEEDIT set, so an admin's "View as member" peek — which
     does NOT clear the flag — cannot leave the template editor live for a member.
     Every store mutator here is ungated, so the render gate IS the write gate. */
  it('an admin sees the editor; a member (or admin peeking as member) sees it closed', async () => {
    await act(async () => { setSession({ user: 'ad', role: 'admin' }); notify() })
    expect($('#waveTplModal')?.hasAttribute('hidden')).toBeFalsy()
    /* the admin flips to member view (toggleRole keeps WAVEEDIT set) */
    await act(async () => { setEffectiveRole('main'); notify() })
    expect($('#waveTplModal')?.hasAttribute('hidden')).toBeTruthy()
    expect($('.tpl-tabs')).toBeFalsy()
    /* back to admin and it returns — the context was preserved, not lost */
    await act(async () => { setEffectiveRole('admin'); notify() })
    expect($('#waveTplModal')?.hasAttribute('hidden')).toBeFalsy()
  })

  it('a real member session never sees the editor', async () => {
    await act(async () => { setSession({ user: 'us', role: 'main' }); notify() })
    expect($('#waveTplModal')?.hasAttribute('hidden')).toBeTruthy()
  })
})
