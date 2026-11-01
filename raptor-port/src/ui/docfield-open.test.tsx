// @vitest-environment jsdom
// A DOCUMENT CHIP A PERSON ADDED OPENS WHAT IT HOLDS (his D1292, 24 Oct 26 — "After I upload the document. I should be able to
// click on the image to preview what I uploaded"; [LW-DOCFIELD-CHIP-OPENS], found 2 Nov 26): the app's one Document button
// (`inputedit.tsx DocField`) draws each file as a chip with its ✕; a tap on the chip's NAME opens the app's document viewer on
// that file — straight after it is added, before anything is saved, as well as later — and the ✕ still only takes it off.
// The same control stands in the Inputs page's input window (D1159 — one Document button everywhere), so it opens there too.
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { DocField } from './inputedit'
import { DocViewer } from './DocViewer'
import { DOCVIEW, INPEDIT, setDocView, setInpEdit } from './pops'
import { initStore, setSession, notify } from '../state/store'
import { docAdd } from '../state/docs'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const file = (name: string) => new File(['x'], name, { type: name.endsWith('.pdf') ? 'application/pdf' : 'image/png' })
const stored = (name: string) => docAdd(file(name) as any).id
/* a file picked in the hidden file box, as the browser hands it over */
const pick = async (input: HTMLInputElement, ...names: string[]) => {
  Object.defineProperty(input, 'files', { configurable: true, value: names.map(file) })
  await act(async () => { input.dispatchEvent(new Event('change', { bubbles: true })) })
}
const VIEW = { person: 'bane', type: 'OML', allday: true, date: 'Jul 23', yr: 2026, remarks: '' }

beforeAll(() => {
  ;(URL as any).createObjectURL = vi.fn(() => 'blob:stub')
  ;(URL as any).revokeObjectURL = vi.fn()
  initStore()
})

describe('the Document control’s own chip', () => {
  let host: HTMLDivElement, root: Root
  function Harness({ start }: { start: string[] }) {
    const [ids, setIds] = useState(start)
    return <><DocField ids={ids} onIds={setIds} viewRow={() => VIEW} /><DocViewer /></>
  }
  const mount = async (start: string[] = []) => {
    host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host)
    await act(async () => { root.render(<Harness start={start} />) })
    up = true
  }
  let up = false
  beforeEach(async () => { await act(async () => { setDocView(null); notify() }) })
  afterEach(async () => { if (up) { await act(async () => { root.unmount() }); host.remove(); up = false } await act(async () => { setDocView(null) }) })
  const unmount = async () => {}

  it('a file just picked opens in the viewer at once — nothing saved yet', async () => {
    await mount()
    await pick($('.docfield input[type=file]') as HTMLInputElement, 'leave-note.png')
    expect($$('.docfield .docchip')).toHaveLength(1)
    await click($('.docfield .docchip .docname'))
    expect(DOCVIEW, 'the viewer opened').toBeTruthy()
    expect(DOCVIEW.readOnly, 'read only: no "Edit input" over the window it was opened from').toBe(true)
    expect(($('#docViewPop') as any).hidden).toBe(false)
    expect($('#docViewTitle').textContent, 'whose and what, from the window').toBe('Ranger · OML · Jul 23')
    await unmount()
  })

  it('opens on the file tapped, of several', async () => {
    const a = stored('first.png'), b = stored('second.pdf')
    await mount([a, b])
    await click($$('.docfield .docchip .docname')[1])
    expect(DOCVIEW.docId).toBe(b)
    expect($('.docview-fname')?.textContent, 'the second file is the one on screen').toContain('second.pdf')
    expect($('#docViewPage')?.textContent ?? $('.docview-nav')?.textContent ?? '').toContain('2')
    await unmount()
  })

  it('its ✕ still takes the file off and opens nothing', async () => {
    const a = stored('only.png')
    await mount([a])
    await click($('.docfield .docchip .docdel'))
    expect($$('.docfield .docchip'), 'the file is off').toHaveLength(0)
    expect(DOCVIEW, 'and the viewer did not open').toBeNull()
    await unmount()
  })
})

describe('the Inputs page’s input window: its Document chip opens the file too (D1159)', () => {
  let host: HTMLDivElement, root: Root
  beforeAll(async () => {
    host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host)
    await act(async () => { root.render(<App />) })
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })
  afterAll(async () => { await act(async () => { root.unmount() }); host.remove() })
  beforeEach(async () => { await act(async () => { setDocView(null); setInpEdit(null); notify() }) })

  it('a file picked in a new input opens over the window; Escape closes only the viewer', async () => {
    await act(async () => { setInpEdit({ _new: true, _ctx: 'u', person: 'bane', type: 'LL', date: 'Jul 23', allday: true, yr: 2026, remarks: '' }); notify() })
    await pick($('#inpEditPop .docfield input[type=file], .docfield input[type=file]') as HTMLInputElement, 'approval.png')
    await click($('.docfield .docchip .docname'))
    expect(DOCVIEW, 'the viewer opened on the file not yet saved').toBeTruthy()
    expect(DOCVIEW.readOnly).toBe(true)
    expect($('#docViewTitle').textContent).toContain('Ranger · LL · Jul 23')
    expect(INPEDIT, 'the input window stays under it').toBeTruthy()
    await act(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })) })
    expect(DOCVIEW, 'Escape closed the viewer').toBeNull()
    expect(INPEDIT, 'and only the viewer').toBeTruthy()
    expect($$('.docfield .docchip'), 'the file is still on the input').toHaveLength(1)
  })
})
