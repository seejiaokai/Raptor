// @vitest-environment jsdom
/* [MODAL-DRAG-CLOSE] (his report, 3 Oct 26): a pop-up window closed when the text in one of its boxes was selected by
   dragging and the mouse was let go on the dark surround — the press began inside, the release landed outside, and the
   browser reports ONE click on the surround. A window closes on its surround only when the press began there too.
   The roll-call is every window that closes on its surround: one helper, and a scan that no window keeps its own test. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { initStore } from '../state/store'
import { setSession } from '../state/auth'
import { setTplEdit, TPLEDIT, setInsights, INSIGHTS } from './pops'
import { DutyTplModal } from './DutyTplModal'
import { InsightsModal } from './Modals'
import { DocConfirm } from './DocConfirm'
import { UpchitConfirm } from './UpchitConfirm'
import { OilConfirm } from './OilConfirm'
import { MedClashConfirm } from './MedClashConfirm'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
let host: HTMLDivElement, root: Root
const fire = async (el: Element, type: string) => act(async () => { el.dispatchEvent(new MouseEvent(type, { bubbles: true })) })
beforeEach(async () => {
  initStore(); setSession({ user: 'ad', role: 'admin' } as any)
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
})
afterEach(async () => { await act(async () => root.unmount()); host.remove(); setTplEdit(false); setInsights(false) })

describe('a pop-up window closes on its surround only when the press began on the surround', () => {
  it('Duty templates: a drag that starts in a Role box and ends on the surround does NOT close it', async () => {
    setTplEdit(true); await act(async () => root.render(<DutyTplModal />))
    const wrap = document.querySelector('#tplModal')!, box = wrap.querySelector('.trow input')!
    await fire(box, 'mousedown'); await fire(wrap, 'click')
    expect(TPLEDIT, 'still open after the drag').toBe(true)
    /* …and an honest click on the surround still closes it (his 4 Sep 26 rule) */
    await fire(wrap, 'mousedown'); await fire(wrap, 'click')
    expect(TPLEDIT).toBe(false)
  })
  it('Insights: the same, and a bare click with no press recorded still closes (keyboard-less tests, assistive tech)', async () => {
    setInsights(true); await act(async () => root.render(<InsightsModal />))
    const wrap = document.querySelector('#insightModal')!, inside = wrap.querySelector('.modal-head b')!
    await fire(inside, 'mousedown'); await fire(wrap, 'click')
    expect(INSIGHTS, 'still open after the drag').toBe(true)
    await new Promise(r => setTimeout(r, 5))
    await fire(wrap, 'click')
    expect(INSIGHTS).toBe(false)
  })
  it('no window keeps its own surround test — every one goes through the shared helper', () => {
    const dir = dirname(fileURLToPath(import.meta.url))
    const own = readdirSync(dir).filter(f => /\.tsx$/.test(f) && !/\.test\./.test(f))
      .filter(f => /onClick=\{e => \{ if \(\(e\.target as HTMLElement\)\.id === '/.test(readFileSync(join(dir, f), 'utf8')))
    expect(own).toEqual([])
  })
  /* W10 (the Codex stack check, 5 Oct 26): the D538 fix's roll-call was thirteen windows that test their surround by
     its ID. Four confirmation windows test it by CLASS and were left out — the guard above never saw that spelling. */
  it('W10 no window tests its surround by class either — the four confirmation windows go through the helper too', () => {
    const dir = dirname(fileURLToPath(import.meta.url))
    const own = readdirSync(dir).filter(f => /\.tsx$/.test(f) && !/\.test\./.test(f))
      .filter(f => /onClick=\{e => \{ if \(\(e\.target as HTMLElement\)\.classList\.contains\(/.test(readFileSync(join(dir, f), 'utf8')))
    expect(own).toEqual([])
  })
  it('W10 the four confirmation windows: a drag from inside to the surround does NOT close them; an honest surround click does', async () => {
    const calls: string[] = []
    const say = (w: string) => () => { calls.push(w) }
    const windows: Array<[string, any]> = [
      ['doc', <DocConfirm who="Ranger" typeLabel="Downchit" onUpload={say('doc')} onNoDoc={() => {}} />],
      ['upchit', <UpchitConfirm who="Ranger" dateLabel="14 Jul" effects={{ plan: [], leftovers: [] }} onSave={() => {}} onCancel={say('upchit')} />],
      ['oil', <OilConfirm who="Ranger" typeLabel="Duty" plan={[{ iso: '2026-07-18', amt: 1 }]} prev={{}} onSave={() => {}} onCancel={say('oil')} />],
      ['medclash', <MedClashConfirm who="Ranger" newType="Downchit" span="14 Jul" clashes={[]} aOrd={0} bOrd={0} onSave={() => {}} onCancel={say('medclash')} />],
    ]
    for (const [name, el] of windows) {
      calls.length = 0
      await act(async () => root.render(el))
      const wrap = document.querySelector('.upconf-pop')!, inside = wrap.querySelector('.airpop-head b')!
      expect(wrap, name).toBeTruthy()
      await fire(inside, 'mousedown'); await fire(wrap, 'click')
      expect(calls, `${name}: still open after a drag that began inside`).toEqual([])
      await new Promise(r => setTimeout(r, 5))
      await fire(wrap, 'mousedown'); await fire(wrap, 'click')
      expect(calls, `${name}: an honest click on the surround still closes it`).toEqual([name])
      await new Promise(r => setTimeout(r, 5))
      await fire(inside, 'click')
      expect(calls, `${name}: a click inside the box does nothing`).toEqual([name])
      await act(async () => root.render(<i />))
    }
  })
})

/* RF2 (Astra's and Sol's reads of the fix round, 6 Oct 26): a question sheet took the keyboard when it opened and
   then let it go — Shift+Tab from its first button walked back into the editor underneath, where typing changed the
   request behind an unanswered question. Tab and Shift+Tab stay inside the sheet until it is answered or closed. */
describe('RF2 a question sheet keeps the keyboard until it is answered', () => {
  const key = async (el: Element, shiftKey = false) => { const e = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true }); await act(async () => { el.dispatchEvent(e) }); return e }
  it('Tab past the last button and Shift+Tab before the first both stay inside; a box behind is pulled back', async () => {
    const behind = document.createElement('input'); document.body.prepend(behind)
    await act(async () => root.render(<DocConfirm who="Ranger" typeLabel="Downchit" onUpload={() => {}} onNoDoc={() => {}} />))
    const sheet = document.querySelector('.upconf-pop')!, box = sheet.querySelector('.airpop-box') as HTMLElement
    const stops = [...box.querySelectorAll<HTMLElement>('button')]
    expect(stops.length).toBeGreaterThan(1)
    expect(document.activeElement, 'the sheet has the keyboard on opening').toBe(box)
    expect((await key(box, true)).defaultPrevented, 'Shift+Tab from the sheet itself').toBe(true)
    expect(document.activeElement).toBe(stops.at(-1))
    expect((await key(stops.at(-1)!)).defaultPrevented, 'Tab from the last button').toBe(true)
    expect(document.activeElement).toBe(stops[0])
    expect((await key(stops[0]!, true)).defaultPrevented, 'Shift+Tab from the first button').toBe(true)
    expect(document.activeElement).toBe(stops.at(-1))
    await act(async () => { stops[0]!.focus() })
    expect((await key(stops[0]!)).defaultPrevented, 'Tab between two of its own buttons is the browser\u2019s').toBe(false)
    await act(async () => { behind.focus() })
    expect((await key(behind)).defaultPrevented, 'a Tab pressed in a box behind the sheet').toBe(true)
    expect(sheet.contains(document.activeElement), 'comes back into the sheet').toBe(true)
    await act(async () => root.render(<i />))
    expect((await key(behind)).defaultPrevented, 'and once the sheet is gone Tab is free again').toBe(false)
    behind.remove()
  })
})
