// @vitest-environment jsdom
/* [BLOCK-NO-HISTORY-LINE] (the group-A FULL walk, 30 Sep 26): + Wave and + Line write a line of the change history; a duty
   block placed from + Block wrote none, nor did an SC / AVALON / BB wave added from + Wave. Driven through the board's own
   buttons. (A document taken off a filed request is state/changelines.test.ts.) */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { ELOG } from '../engine/editlog'
import { openScheduler } from './board'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  await act(async () => { openScheduler(0); notify() })
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
})

describe('what the board adds writes a line of the change history', () => {
  it('a duty block from + Block: "Duty block added · <its name>"', async () => {
    const n0 = ELOG.rows.length, nB = (DAYS[0].dutywaves || []).length
    await click($('#sbBoard [data-dwadd="0"]'))
    await click($$('.wavemenu [data-blktpl]')[0])
    expect(DAYS[0].dutywaves.length).toBe(nB + 1)
    expect(ELOG.rows.slice(n0).map(r => r.lbl)).toEqual(['Duty block added · Standard'])
  })
  it('an empty block: "Duty block added · DUTY"', async () => {
    const n0 = ELOG.rows.length
    await click($('#sbBoard [data-dwadd="0"]'))
    await click($('.wavemenu [data-blktpl=""]'))
    expect(ELOG.rows.slice(n0).map(r => r.lbl)).toEqual(['Duty block added · DUTY'])
  })
  for (const [kind, label] of [['sc', 'SC'], ['avalon', 'AVALON'], ['bb', 'BB']]) {
    it(`an ${label} wave from + Wave: "${label} added"`, async () => {
      const n0 = ELOG.rows.length, nW = DAYS[0].waves.length
      await click($('#sbBoard [data-wvadd="0"]'))
      await click($(`.wavemenu [data-wmkind="${kind}"]`))
      expect(DAYS[0].waves.length).toBe(nW + 1)
      expect(ELOG.rows.slice(n0).map(r => r.lbl)).toEqual([`${label} added`])
    })
  }
})
