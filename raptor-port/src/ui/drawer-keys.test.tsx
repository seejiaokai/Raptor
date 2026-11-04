// @vitest-environment jsdom
/* The side menu answers the keyboard (D1641–D1643): ☰ now shows on a desktop wherever the page names do not fit beside
   TALON, so Escape closes the menu and the keyboard goes back to ☰ (ui/Drawer.tsx). Whether ☰ is drawn, and the
   keyboard landing on the page you are on when ☰ is opened by keys, are the browser test's (e2e/topbar-names.spec.ts). */
import { afterAll, beforeAll, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, notify, setSession } from '../state/store'
import { setPage } from '../state/view'
import { DRAWER, setDrawer } from './pops'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
let root: Root, host: HTMLDivElement
const $ = (s: string) => host.querySelector(s) as HTMLElement | null
beforeAll(async () => {
  initStore(); accountsLoad()
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession(sessionFor(signIn('ad', 'a'))); setPage('viewsched'); notify() })
})
afterAll(async () => { await act(async () => root.unmount()); host.remove() })

it('Escape closes the side menu and puts the keyboard back on ☰; nothing else hears that Escape', async () => {
  $('#burger')!.focus()
  await act(async () => { $('#burger')!.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
  expect(DRAWER).toBe(true)
  expect($('#drawer')!.className).toContain('open')
  let heard = 0
  const below = () => { heard++ }
  document.addEventListener('keydown', below)
  await act(async () => { document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })
  document.removeEventListener('keydown', below)
  expect(DRAWER).toBe(false)
  expect($('#drawer')!.className).not.toContain('open')
  expect(document.activeElement).toBe($('#burger'))
  expect(heard, 'the menu took the Escape: nothing under it closes too').toBe(0)
})

it('a closed menu leaves Escape alone', async () => {
  await act(async () => { setDrawer(false); notify() })
  let heard = 0
  const below = () => { heard++ }
  document.addEventListener('keydown', below)
  await act(async () => { document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })
  document.removeEventListener('keydown', below)
  expect(heard).toBe(1)
})
