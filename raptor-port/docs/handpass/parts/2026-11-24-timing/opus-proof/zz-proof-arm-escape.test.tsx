// @vitest-environment jsdom
/* PROOF (fresh Opus read): with the ?timing readout open, ONE Escape on Edit Schedule with a seat picked puts the seat
   down AND folds the readout — two things on one press (D2112: one press, one thing). */
import * as React from 'react'
import { afterAll, beforeAll, expect, it } from 'vitest'
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

beforeAll(async () => {
  initStore()
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host)
  await act(async () => { root.render(<App />) })
  const TimingReadout = makeTimingReadout({ React, FloatWin })
  thost = document.createElement('div'); document.body.appendChild(thost); troot = createRoot(thost)
  await act(async () => { troot.render(<TimingReadout read={() => VIEW} subscribe={() => () => {}} version={() => 0} startOpen copy={async () => true} now={() => new Date()} />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await act(async () => { $$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
})
afterAll(async () => { await act(async () => { troot.unmount(); root.unmount() }); host.remove(); thost.remove() })

it('one Escape with a seat picked puts the seat down and leaves the readout open', async () => {
  expect($('.floatwin.timingwin')).toBeTruthy()
  await act(async () => { view.armSlot('d:2.0.0'); notify() })
  expect(view.ARM, 'a seat is picked').toBeTruthy()
  ;(document.activeElement as HTMLElement | null)?.blur?.()
  await act(async () => { document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })
  expect({ seatDown: view.ARM == null, readoutOpen: !!$('.floatwin.timingwin') }).toEqual({ seatDown: true, readoutOpen: true })
})
