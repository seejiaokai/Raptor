// @vitest-environment jsdom
/* Same preamble as src/ui/stores-edit.test.tsx — there is no shared helper
   module in this repo; each *.test.tsx defines its own. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
})

const openBoard = async () => {
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  await click($('.sb-open'))
}

describe('the board carries the week\'s stores interface', () => {
  it('a flying line has exactly one remarks cell, and the chips live inside it', async () => {
    const { DAYS } = await import('../engine/data')
    const a = DAYS[0].waves[0].formations[0].aircraft[0]
    a.opts = a.opts || {}; a.opts.tk2 = true
    await openBoard(); await act(async () => notify())
    const cell = $('#schedBoard .sb-line .sb-rcell')
    expect(cell, 'the remarks input is wrapped in a cell').toBeTruthy()
    expect(cell.querySelector('.nts'), 'the remarks input is inside it').toBeTruthy()
    expect(cell.querySelector('.stores'), 'so are the stores').toBeTruthy()
    expect(cell.querySelector('.stcfg'), 'and so is C').toBeTruthy()
  })

  it('C on the board opens the same popup the week opens', async () => {
    await openBoard()
    await click($('#schedBoard .sb-line .stcfg[data-stcfg]'))
    expect(document.querySelector('.stmenu'), 'one popup builder, both surfaces').toBeTruthy()
    expect(document.querySelectorAll('.stmenu [data-cfg]').length).toBeGreaterThan(0)
  })

  it('view-only mode shows the chips and no C', async () => {
    const { DAYS } = await import('../engine/data')
    const a = DAYS[0].waves[0].formations[0].aircraft[0]
    a.opts = a.opts || {}; a.opts.tk2 = true
    await click($$('.nav a[data-page]').find(x => x.dataset.page === 'viewsched')!)
    await click($('.sb-open')); await act(async () => notify())
    expect($('#schedBoard .sb-line .stores'), 'a duty crew sees what the jet carries').toBeTruthy()
    expect(document.querySelector('#schedBoard .sb-line .stcfg'), 'but cannot edit it').toBeFalsy()
  })
})
