// @vitest-environment jsdom
/* AFTER THE OIL QUESTION THE KEYS GO BACK TO THE BOX HE WAS TYPING IN ([WINDOWS-KEEP-KEYS]'s leftover — the reader D2's
   second pass, 6 Oct 26: "after the OIL question is answered the caret is on nothing … his place in the run is lost").
   Two causes, both pinned here, both red on the code before this change:
   · the schedule's Tab route blurs the box to save it, and a save that raises the question (the OIL question put before a
     change, OILWAIT — a name typed in an input's row) was not one the route knew as a window: it went on and put the caret
     in the next box, behind the question, and the question gave the keys back there. The route stops now, and names the
     box to the question (schedule-tab.ts → sheetfocus.ts noteOpener), which gives the keys back to it;
   · a sheet gave the keys back to the very control they were on when it opened — and the answer redraws the schedule from
     strings, so that control was a new one by then and the keys went to nothing. The sheet finds it again by its marks
     (sheetfocus.ts useSheetFocus → locate). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act, useRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, notify, setSession } from '../state/store'
import { histInit } from '../state/history'
import { setPage, setOilWait, OILWAIT } from '../state/view'
import { useSheetFocus } from './sheetfocus'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
let root: Root, host: HTMLDivElement
const editableDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'isContentEditable')
const $ = (s: string) => document.querySelector(s) as HTMLElement
const tick = () => act(async () => { await new Promise(r => setTimeout(r, 15)) })

beforeAll(() => {
  // jsdom does not implement this browser property (as schedule-tab.test.tsx supplies it)
  Object.defineProperty(HTMLElement.prototype, 'isContentEditable', { configurable: true, get() {
    let el: HTMLElement | null = this
    while (el) { if (el.hasAttribute('contenteditable')) return el.getAttribute('contenteditable') !== 'false'; el = el.parentElement }
    return false
  } })
  initStore()
})
afterAll(() => {
  if (editableDescriptor) Object.defineProperty(HTMLElement.prototype, 'isContentEditable', editableDescriptor)
  else delete (HTMLElement.prototype as any).isContentEditable
})

describe('the Tab route and the OIL question put before a change', () => {
  beforeEach(async () => {
    setSession({ user: 'a', role: 'admin' }); setPage('viewsched'); histInit()
    host = document.createElement('div'); document.body.append(host); root = createRoot(host)
    await act(async () => { root.render(<App />) })
    await act(async () => { setPage('editsched'); notify() })
  })
  afterEach(async () => {
    await act(async () => { setOilWait(null); (document.activeElement as HTMLElement)?.blur(); notify() })
    await act(async () => { root.unmount() }); host.remove()
  })

  it('a box whose save raises the question: the caret goes nowhere behind it, and the answer gives the keys back to that box', async () => {
    const box = $('#eWeek .day[data-day="0"] [data-txt="ff:0.0.0.cs"]')
    expect(box, 'a callsign box on the week').toBeTruthy()
    await act(async () => { box.focus() })
    /* the save the blur makes raises the question, as a name typed in an input's row does (ui/reqdoor.ts rowPut → OILWAIT) */
    const ask = () => {
      document.removeEventListener('focusout', ask, true)
      setOilWait({ kind: 'add', lead: 'Adding Bane to the duty', places: [], redo: () => 'done', ask: () => 'none',
        gate: { who: 'Bane', typeLabel: 'Duty', plan: [{ iso: '2026-07-18', amt: 1 }], prev: {} } })
    }
    document.addEventListener('focusout', ask, true)
    const e = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    await act(async () => { box.dispatchEvent(e); notify() })
    await tick()
    expect(e.defaultPrevented, 'the route took the Tab').toBe(true)
    const sheet = $('[data-testid="oilconf"]')
    expect(sheet, 'the question is up').toBeTruthy()
    expect(sheet.contains(document.activeElement), 'the question holds the keys, not a box behind it').toBe(true)
    /* answered (set aside, the bar under the top bar takes the keys by design — OilWaitSheet.tsx OilBand) */
    await act(async () => { $('[data-testid="oil-yes"]').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { $('[data-testid="oilconf-save"]').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await tick()
    expect(OILWAIT).toBe(null)
    const a = document.activeElement as HTMLElement
    expect(a.dataset.txt, 'the keys are back in the box he was typing in').toBe('ff:0.0.0.cs')
  })
})

/* the sheet's own way back, with nothing else around it: the control the keys were on is replaced while the sheet is up */
function Harness() {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  useSheetFocus(box, open)
  ;(globalThis as any).__sheet = setOpen
  return <div>
    <div id="redrawn" />
    {open && <div ref={box} tabIndex={-1} id="sheet"><button id="answer">Answer</button></div>}
  </div>
}
describe('a sheet gives the keys back to the control they were on, found again after a redraw', () => {
  it('the control replaced by its twin while the sheet was up: the keys go to the twin', async () => {
    host = document.createElement('div'); document.body.append(host); root = createRoot(host)
    await act(async () => { root.render(<Harness />) })
    const strip = $('#redrawn')
    strip.innerHTML = '<button data-txt="ff:0.0.0.cs">VL</button>'
    ;(strip.firstElementChild as HTMLElement).focus()
    await act(async () => { (globalThis as any).__sheet(true) })
    expect(document.activeElement?.id).toBe('sheet')
    strip.innerHTML = '<button data-txt="ff:0.0.0.cs">VL</button>'   // the string redraw an answer causes
    await act(async () => { (globalThis as any).__sheet(false) })
    expect((document.activeElement as HTMLElement).dataset.txt, 'the keys on the twin').toBe('ff:0.0.0.cs')
    expect(document.activeElement).toBe(strip.firstElementChild)
    await act(async () => { root.unmount() }); host.remove()
  })
})
