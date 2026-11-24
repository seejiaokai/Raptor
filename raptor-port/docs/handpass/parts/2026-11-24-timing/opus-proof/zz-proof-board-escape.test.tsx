// @vitest-environment jsdom
/* PROOF (fresh Opus read): with the ?timing readout open (as it starts on a computer), Escape on the open scheduler
   board — the thing opened LAST — should close the board. It folds the readout instead, and the board stays. */
import * as React from 'react'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import * as view from '../state/view'
import { FloatWin } from './FloatWindow'
import { makeTimingReadout } from './TimingReadout'
import type { TimingView } from './timingtext'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const VIEW: TimingView = {
  site: 300, app: 812, first: { screen: 'signin', t: 840 }, signin: 1700, pages: [],
  freezes: { supported: true, n: 0, total: 0, max: 0 },
  files: { supported: true, n: 14, bytes: 831_488, kept: 0, asked: 0 },
  env: { browser: { name: 'Edge', version: '131' }, cores: 4, memGB: 8, screen: '1366×768', window: '1366×657', scale: 1, openFor: 240_000 },
}
let host: HTMLDivElement, root: Root, thost: HTMLDivElement, troot: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => { await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) }) }
const key = async (k: string) => {
  await act(async () => {
    const at = (document.activeElement as HTMLElement) || document.body
    at.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))
  })
}

beforeAll(async () => {
  initStore()
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host)
  await act(async () => { root.render(<App />) })
  /* the readout opens by itself as the app starts, in a root of its own (timingwindow.tsx) */
  const TimingReadout = makeTimingReadout({ React, FloatWin })
  thost = document.createElement('div'); thost.id = 'timingRoot'; document.body.appendChild(thost); troot = createRoot(thost)
  await act(async () => { troot.render(<TimingReadout read={() => VIEW} subscribe={() => () => {}} version={() => 0} startOpen copy={async () => true} now={() => new Date()} />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})
afterAll(async () => { await act(async () => { troot.unmount(); root.unmount() }); host.remove(); thost.remove() })

describe('Escape closes what opened last — with the timing readout up', () => {
  it('the board, opened after the readout, is closed by Escape; the readout stays open', async () => {
    expect($('.floatwin.timingwin'), 'the readout is open').toBeTruthy()
    await click($('#eWeek .day[data-day="2"] .dt.sb-open'))
    expect(view.SBDAY, 'the board is open').toBe(2)
    ;(document.activeElement as HTMLElement | null)?.blur?.()
    await key('Escape')
    const boardOpen = view.SBDAY != null && !($('#schedBoard') as any).hidden
    const readoutOpen = !!$('.floatwin.timingwin')
    expect({ boardOpen, readoutOpen }).toEqual({ boardOpen: false, readoutOpen: true })
  })
})
