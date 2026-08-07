// @vitest-environment jsdom
/* There is NO shared UI test helper in this repo — every *.test.tsx defines
   its own $ / $$ / click and boots the app in beforeAll. This preamble is
   src/ui/interact.test.tsx:16-32 verbatim, plus the fake storeBackend the
   engine needs headless. Do not extract a helper module for this. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { storeBackend } from '../engine/hooks'
import { STORE_CFG, storesReset } from '../engine/stores'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

const mem: Record<string, string> = {}
const editTab = () => $$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!
const openPen = async () => {
  await click(editTab())
  await click($('#eWeek .stcfg[data-stcfg]'))
  await click(document.querySelector('.stmenu .st-pen') as HTMLElement)
}

beforeAll(async () => {
  storeBackend.impl = {
    getItem: (k: string) => (k in mem ? mem[k]! : null),
    setItem: (k: string, v: string) => { mem[k] = v },
  }
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
})

/* the list is module state, so each test starts from the standard six —
   and any open popup is dropped, or the next openPen finds two */
beforeEach(async () => {
  Object.keys(mem).forEach(k => delete mem[k])
  document.querySelectorAll('.stmenu').forEach(x => x.remove())
  storesReset()
  await act(async () => notify())
})

describe('the pen edits the LIST, not the schedule', () => {
  it('renaming changes the label and never the key', async () => {
    await openPen()
    const row = document.querySelector('.stmenu .st-erow[data-k="tk2"] .st-lab') as HTMLInputElement
    row.value = '2 TANKS'
    await act(async () => { row.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(STORE_CFG.find(([k]) => k === 'tk2')).toEqual(['tk2', '2 TANKS'])
    expect(STORE_CFG.some(([k]) => k === '2tanks')).toBe(false)
  })

  it('a rename never reaches the amendment list', async () => {
    const { SCHED } = await import('../engine/publish')
    const before = Object.keys(SCHED.pending).length
    await openPen()
    const row = document.querySelector('.stmenu .st-erow[data-k="tk2"] .st-lab') as HTMLInputElement
    row.value = 'RENAMED'
    await act(async () => { row.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(Object.keys(SCHED.pending).length, 'editing the list is not a schedule edit').toBe(before)
  })

  it('removing a store leaves the jets that carry it untouched', async () => {
    const { DAYS } = await import('../engine/data')
    const a = DAYS[0].waves[0].formations[0].aircraft[0]
    a.opts = a.opts || {}; a.opts.tk2 = true
    await openPen()
    await click(document.querySelector('.stmenu .st-erow[data-k="tk2"] .st-del') as HTMLElement)
    expect(STORE_CFG.some(([k]) => k === 'tk2')).toBe(false)
    expect(a.opts.tk2, 'the jet keeps it — add the store back and the chip returns').toBe(true)
  })

  it('adding appends and persists', async () => {
    await openPen()
    const box = document.querySelector('.stmenu .st-new') as HTMLInputElement
    box.value = 'LGB'
    await act(async () => { box.dispatchEvent(new Event('change', { bubbles: true })) })
    await click(document.querySelector('.stmenu .st-add') as HTMLElement)
    expect(STORE_CFG[STORE_CFG.length - 1]).toEqual(['lgb', 'LGB'])
    expect(JSON.parse(mem['sqn142_stores']!).pop()).toEqual(['lgb', 'LGB'])
  })

  it('the up arrow reorders and persists', async () => {
    await openPen()
    await click(document.querySelector('.stmenu .st-erow[data-k="tk2"] .st-up') as HTMLElement)
    expect(STORE_CFG.map(([k]) => k)).toEqual(['nav', 'tk2', 'nc', 'tks3', 'tpod', 'cl'])
    expect(JSON.parse(mem['sqn142_stores']!).map((r: any) => r[0]))
      .toEqual(['nav', 'tk2', 'nc', 'tks3', 'tpod', 'cl'])
  })

  it('a click inside the open pen does not dismiss the box', async () => {
    await openPen()
    const lab = document.querySelector('.stmenu .st-erow[data-k="tk2"] .st-lab') as HTMLElement
    await click(lab)
    expect(document.querySelector('.stmenu'), 'the box survives an in-box click').toBeTruthy()
  })
})
