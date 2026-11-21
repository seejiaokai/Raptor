// @vitest-environment jsdom
/* C6 THROUGH THE INPUT'S OWN WINDOW (the reshape plan §3.3 C6, §11's C6 row; his D2240, D2241 — the approved drawing
   docs/mock/2026-11-20-multi-sqn-reshape/ 8b). Ranger is 149's from Thu 16 Jul (moved on Wed 15 Jul). The window's Person
   list offers whom the draft with him added lets be saved, on the draft's first day; Add / Save asks before the gate, and
   leave across his move saved by someone who may not change it is refused in his words, the window staying open and
   nothing kept. The picker's and the door's pure halves are ui/reshape-c6-pickers.test.ts. */
import { useMsqWorld, acrossMove, signInAs, PID } from '../test-support/msq-world'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputEditor } from './InputWindow'
import { commitInput } from './inputedit'
import { setInpEdit } from './pops'
import { notify } from '../state/store'
import { setPage, setInpView } from '../state/view'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

useMsqWorld()

const R = PID.ranger
const WORDS = "Not saved: Ranger is 149's from Thu 16 Jul. Only Ranger or an admin of both 142 and 149 can change leave that runs across his move."
let host: HTMLDivElement, root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const said = () => (HOOKS.toast as any).mock.calls.map((c: any[]) => [String(c[0]), c[1]])
const options = () => [...document.querySelectorAll('#inpEditPerson option')].map(o => (o as HTMLOptionElement).value)
const open = async (r: any) => act(async () => { setInpEdit(r); notify() })
const click = async (sel: string) => { const el = $(sel); expect(el, sel).toBeTruthy(); await act(async () => { el!.click() }) }

beforeEach(async () => {
  setPage('inputs'); setInpView('cal')
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<InputEditor />) })
})
afterEach(async () => {
  await act(async () => { root.unmount(); setInpEdit(null) })
  host.remove()
})

describe('C6 — the window, across Ranger\'s move', () => {
  it('Hunter\'s new leave: Ranger is offered for Tue 14 Jul alone, not for 14 to 17 Jul', async () => {
    acrossMove(R, 'u142', 'u149')
    signInAs('hunter')
    await open({ _new: true, _calendar: true, _ctx: 'i', person: 'glass', type: 'LL', date: 'Jul 14', allday: true })
    expect(options(), 'one day, still his 142 day').toContain(R)
    await act(async () => { setInpEdit(null); notify() })
    await open({ _new: true, _calendar: true, _ctx: 'i', person: 'glass', type: 'LL', date: 'Jul 14', endDate: 'Jul 17', allday: true })
    expect(options(), 'across his move').not.toContain(R)
    expect(options(), 'the man picked stays offered').toContain('glass')
  })
  it('Hunter\'s Add of Ranger\'s leave from 14 to 17 Jul is refused at the door in the approved words; the window stays, nothing is kept', async () => {
    acrossMove(R, 'u142', 'u149')
    signInAs('hunter')
    const n = INPUTS.length
    await open({ _new: true, _calendar: true, _ctx: 'i', person: R, type: 'LL', date: 'Jul 14', endDate: 'Jul 17', allday: true })
    await click('#inpEditSave')
    expect(said()).toContainEqual([WORDS, 'blocked'])
    expect($('#inpEditSave'), 'the window stays open').toBeTruthy()
    expect(INPUTS.length, 'nothing kept').toBe(n)
  })
  it('Kestrel saving a change to that leave (Saber filed it) is refused in the same words; Ranger\'s own save goes', async () => {
    acrossMove(R, 'u142', 'u149')
    signInAs('saber')
    expect(commitInput(null, { type: 'LL', start: '2026-07-14', end: '2026-07-17', allday: true, remarks: 'filed' }, [R])).toBe(true)
    const rec = INPUTS.find((x: any) => x.remarks === 'filed')
    signInAs('kestrel')
    await open(rec)
    const box = $('#inpEditRmk') as HTMLInputElement
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(box, 'changed'); box.dispatchEvent(new Event('input', { bubbles: true })) })
    await click('#inpEditSave')
    expect(said()).toContainEqual([WORDS, 'blocked'])
    expect(INPUTS.find((x: any) => x.iid === rec.iid)?.remarks, 'nothing kept').toBe('filed')
  })
})
