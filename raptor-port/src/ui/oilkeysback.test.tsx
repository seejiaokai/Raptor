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
/* the fresh read's F4 (5 Nov 26): a control drawn on several days with the same mark (an input covering Mon–Fri) — its twin
   is looked for on the day it stood in, never the first day that draws one */
function TwoDays() {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  useSheetFocus(box, open)
  ;(globalThis as any).__sheet2 = setOpen
  return <div>
    <div id="eWeek"><section className="day" data-day="0" /><section className="day" data-day="3" /></div>
    {open && <div ref={box} tabIndex={-1}><button>Answer</button></div>}
  </div>
}
describe('the read\'s F4 — the twin is found on the day the control stood in', () => {
  it('the same button drawn on Monday and Thursday, Thursday\'s pressed: the keys come back to Thursday\'s', async () => {
    host = document.createElement('div'); document.body.append(host); root = createRoot(host)
    await act(async () => { root.render(<TwoDays />) })
    const draw = () => document.querySelectorAll('#eWeek .day').forEach(d => { d.innerHTML = '<button data-inpedit="i42">Leave</button>' })
    draw()
    ;($('#eWeek .day[data-day="3"] button') as HTMLElement).focus()
    await act(async () => { (globalThis as any).__sheet2(true) })
    draw()                                                        // the save's redraw
    await act(async () => { (globalThis as any).__sheet2(false) })
    expect((document.activeElement as HTMLElement).closest('.day')?.getAttribute('data-day'), 'Thursday\'s copy').toBe('3')
    await act(async () => { root.unmount() }); host.remove()
  })
})

/* the narrow read of the fixes, G2: the input moved to another day by its own window — its button is no longer drawn on the
   day pressed; the keys go to it on the day it now stands on, in the same week */
describe('the narrow read\'s G2 — a control moved to another day of the week is found there', () => {
  it('Monday\'s button pressed, the redraw draws it on Thursday only: the keys go to Thursday\'s', async () => {
    host = document.createElement('div'); document.body.append(host); root = createRoot(host)
    await act(async () => { root.render(<TwoDays />) })
    const mon = $('#eWeek .day[data-day="0"]'), thu = $('#eWeek .day[data-day="3"]')
    mon.innerHTML = '<button data-inpedit="i43">Leave</button>'; thu.innerHTML = ''
    ;(mon.firstElementChild as HTMLElement).focus()
    await act(async () => { (globalThis as any).__sheet2(true) })
    mon.innerHTML = ''; thu.innerHTML = '<button data-inpedit="i43">Leave</button>'
    await act(async () => { (globalThis as any).__sheet2(false) })
    expect((document.activeElement as HTMLElement).closest('.day')?.getAttribute('data-day'), 'Thursday\'s button').toBe('3')
    await act(async () => { root.unmount() }); host.remove()
  })
})

/* the round-2 read's H1: a button whose first mark names only its KIND (an input's "→ Ground": data-acc="g") is told apart by
   the input it belongs to (data-acck) — never another input's button of the same kind, on that day or another */
describe('the round-2 read\'s H1 — another input\'s button of the same kind is never the twin', () => {
  it('Thursday\'s "→ Ground" pressed, which turns into "Reject": the keys go nowhere, not to Monday\'s "→ Ground" or a neighbour\'s', async () => {
    host = document.createElement('div'); document.body.append(host); root = createRoot(host)
    await act(async () => { root.render(<TwoDays />) })
    const mon = $('#eWeek .day[data-day="0"]'), thu = $('#eWeek .day[data-day="3"]')
    mon.innerHTML = '<button data-acc="g" data-accd="0" data-acck="mon-input">→ Ground</button>'
    thu.innerHTML = '<button data-acc="g" data-accd="3" data-acck="other">→ Ground</button><button data-acc="g" data-accd="3" data-acck="mine">→ Ground</button>'
    ;(thu.querySelector('[data-acck="mine"]') as HTMLElement).focus()
    await act(async () => { (globalThis as any).__sheet2(true) })
    thu.innerHTML = '<button data-acc="g" data-accd="3" data-acck="other">→ Ground</button><button data-acc="x" data-accd="3" data-acck="mine">Reject</button>'
    await act(async () => { (globalThis as any).__sheet2(false) })
    const a = document.activeElement as HTMLElement
    expect(a.dataset.acck === 'mon-input' || a.dataset.acck === 'other', `the keys on another input's button (${a.dataset.acck})`).toBe(false)
    await act(async () => { root.unmount() }); host.remove()
  })
})

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
