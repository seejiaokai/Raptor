// @vitest-environment jsdom
/* The "+ Wave" picker's template wiring and placement (owner, 25 Aug 26).
   Preamble mirrors stores-edit.test.tsx — App booted once, admin session, fake
   storeBackend headless. waveMenu appends a body-level `.wavemenu` popup, so it
   is queried off document, and addWaveFromTpl is exercised straight off the
   module (its own gate passes with SBDAY null, the same path the probe bridge
   and stores-edit.test.tsx use). */
import { beforeAll, beforeEach, afterEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { storeBackend } from '../engine/hooks'
import { waveMenu, addWaveFromTpl } from './board'
import {
  WAVETPL_CFG, waveTplReset, addWaveTpl, setWaveTplLine, setWaveTplKind, setWaveHidden,
} from '../engine/wavetpl'
import { DAYS } from '../engine/data'
import { validate } from '../engine/validate'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const mem: Record<string, string> = {}
const menu = () => document.querySelector('.wavemenu') as HTMLElement | null
const dropMenu = () => document.querySelectorAll('.wavemenu').forEach(x => x.remove())

beforeAll(async () => {
  storeBackend.impl = {
    getItem: (k: string) => (k in mem ? mem[k]! : null),
    setItem: (k: string, v: string) => { mem[k] = v },
  }
  initStore()
  const host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
})

beforeEach(() => { Object.keys(mem).forEach(k => delete mem[k]); waveTplReset(); dropMenu() })
afterEach(() => dropMenu())

describe('the + Wave picker lists templates and honours show/hide', () => {
  it('a saved template appears as its own button, and the pencil opens the editor', async () => {
    const t = addWaveTpl('BFM Package', 'fly')!
    await act(async () => { waveMenu(document.body, 0) })
    const box = menu()!
    expect(box, 'the picker opened').toBeTruthy()
    const tbtn = box.querySelector(`[data-wmtpl="${t.id}"]`)
    expect(tbtn, 'the template is a button in the picker').toBeTruthy()
    expect(tbtn!.textContent).toContain('BFM Package')
    expect(box.querySelector('[data-wvedit]'), 'the ✎ editor opener is present').toBeTruthy()
  })

  it('a hidden built-in kind and a hidden template drop out of the picker', async () => {
    const t = addWaveTpl('Ghost', 'sc')!
    setWaveHidden('bb', true)
    setWaveHidden(t.id, true)
    await act(async () => { waveMenu(document.body, 0) })
    const box = menu()!
    expect(box.querySelector('[data-wmkind="bb"]'), 'BB is hidden').toBeFalsy()
    expect(box.querySelector('[data-wmkind="sc"]'), 'SC still shows').toBeTruthy()
    expect(box.querySelector('[data-wmkind=""]'), 'Flying still shows').toBeTruthy()
    expect(box.querySelector(`[data-wmtpl="${t.id}"]`), 'the hidden template is gone').toBeFalsy()
  })
})

describe('placing a template mints a real, checkable wave', () => {
  it('addWaveFromTpl pushes a wave with the template kind flags, and validate() survives it', () => {
    const t = addWaveTpl('Night', 'avalon')!
    setWaveTplLine(t.id, 0, 'cs', 'OWL 1'); setWaveTplLine(t.id, 0, 'to', '1900'); setWaveTplLine(t.id, 0, 'ld', '0700')
    setWaveTplLine(t.id, 0, 'spare', true)
    const before = DAYS[0].waves.length
    addWaveFromTpl(0, t.id)
    expect(DAYS[0].waves.length).toBe(before + 1)
    const w = DAYS[0].waves[DAYS[0].waves.length - 1]
    expect(w.standalone).toBe(true)
    expect(w.kind).toBe('avalon')
    expect(w.noconf).toBe(true)
    expect(w.formations[0].aircraft[0]).toMatchObject({ spare: true, role: 'SPARE' })
    expect(w.formations[0].to).toBe('19:00')
    /* the whole point of the kind flags: the day still validates without throwing */
    expect(() => validate()).not.toThrow()
    // cleanup so the shared DAYS model does not carry this into other suites
    DAYS[0].waves.pop()
  })

  it('a flying template mints an ordinary, non-standalone wave', () => {
    const t = addWaveTpl('Go', 'fly')!
    setWaveTplLine(t.id, 0, 'cs', 'HAWK 1')
    const before = DAYS[0].waves.length
    addWaveFromTpl(0, t.id)
    const w = DAYS[0].waves[DAYS[0].waves.length - 1]
    expect(w.standalone).toBe(false)
    expect(w.kind).toBeUndefined()
    expect(w.label).toBe('Go')
    expect(DAYS[0].waves.length).toBe(before + 1)
    DAYS[0].waves.pop()
  })
})
