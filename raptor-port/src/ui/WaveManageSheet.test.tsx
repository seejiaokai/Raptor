// @vitest-environment jsdom
/* WaveManageSheet — the + Wave "Manage" sheet (WAVEMANAGE in pops.ts). The
   show/hide/delete that used to live on the Admin page (owner, 29 Aug 26 pt.3).
   The engine guarantees (WAVEHIDE, delWaveTpl) are pinned in engine/wavetpl.test.ts;
   this checks the sheet wires the eye to setWaveHidden and the trash to delWaveTpl,
   and that a built-in can be hidden but not deleted. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { WaveManageSheet } from './WaveManageSheet'
import { initStore, setSession, notify } from '../state/store'
import { WAVETPL_CFG, addWaveTpl, waveTplReset, isWaveHidden } from '../engine/wavetpl'
import { setWaveManage } from './pops'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement | null
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
let tplId = ''

beforeAll(async () => {
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<WaveManageSheet />) })
})

beforeEach(async () => {
  setSession({ user: 'a', role: 'admin' })
  initStore()
  waveTplReset()
  tplId = addWaveTpl('My wave', 'fly')!.id
  await act(async () => { setWaveManage(true); notify() })
})

describe('the wave Manage sheet', () => {
  it('lists every built-in kind and every saved template', () => {
    const names = $$('.wvmng-name').map(n => n.childNodes[0].textContent)
    expect(names).toEqual(['Flying wave', 'SC', 'AVALON', 'BB', 'My wave'])
  })

  it('lets a built-in be hidden but never deleted; a template carries a trash', () => {
    const fly = $('[data-wvrow="fly"]')!
    expect(fly.querySelector('[data-wveye]'), 'built-in has an eye').toBeTruthy()
    expect(fly.querySelector('[data-wvtrash]'), 'built-in has NO trash').toBeNull()
    const tpl = $(`[data-wvrow="${tplId}"]`)!
    expect(tpl.querySelector('[data-wvtrash]'), 'a template can be deleted').toBeTruthy()
  })

  it('the eye toggles the hidden flag', async () => {
    expect(isWaveHidden('sc')).toBe(false)
    await click($('[data-wveye="sc"]'))
    expect(isWaveHidden('sc'), 'tapping the eye hides SC').toBe(true)
    await click($('[data-wveye="sc"]'))
    expect(isWaveHidden('sc'), 'tapping again shows it').toBe(false)
  })

  it('deleting a template asks to confirm, then removes it', async () => {
    expect(WAVETPL_CFG.some(t => t.id === tplId)).toBe(true)
    await click($(`[data-wvtrash="${tplId}"]`))
    /* the row turns into a confirm — the list is not gone yet */
    expect($(`[data-wvrow="${tplId}"]`)!.classList.contains('confirm'), 'confirm shown').toBe(true)
    expect(WAVETPL_CFG.some(t => t.id === tplId), 'not deleted until confirmed').toBe(true)
    await click($(`[data-wvrow="${tplId}"] .wvmng-cacts .danger`))
    expect(WAVETPL_CFG.some(t => t.id === tplId), 'confirming deletes it').toBe(false)
  })
})
