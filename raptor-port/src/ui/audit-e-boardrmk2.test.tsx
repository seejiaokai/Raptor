// @vitest-environment jsdom
/* AUDIT E — the empty-remarks reveal, beyond what boardrmk.test.tsx pins:
   what happens when revealed text is typed and then deleted again, that the
   single-reveal rule hands the box between rows, and what a ground-row splice
   under the revealed row does to the path RMKOPEN holds (it is a model-index
   path, and unacceptInput renumbers the key space beneath it). */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, writeInputsBatch } from '../state/store'
import { DAYS } from '../engine/data'
import { INPUTS, inpId } from '../engine/inputs'
import { acceptInput, unacceptInput, inpKey } from '../engine/slots'
import { afterSchedMutate } from '../state/view'
import { removeInput } from './inputedit'
import { openScheduler } from './board'
import * as view from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const change = async (el: Element, value: string) => {
  await act(async () => {
    (el as HTMLInputElement).value = value
    el.dispatchEvent(new Event('change', { bubbles: true }))
  })
}
const settle = async () => { await act(async () => { await new Promise(r => setTimeout(r, 5)) }) }

beforeAll(async () => {
  initStore()
  const host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})

beforeEach(async () => {
  DAYS[0].dutywaves[0].rows.forEach((r: any) => { delete r.rmks })
  view.setRmkOpen(null)
  await act(async () => { openScheduler(0); notify() })
})

const dutyRow = (ri: number) => $(`#sbBoard .sb-panel.duty .sb-arow.c6r[data-move="mv:d.0.0.${ri}"]`)
const rmkIn = (ri: number) => dutyRow(ri).querySelector('.rmkin') as HTMLInputElement
const rmkAdd = (ri: number) => dutyRow(ri).querySelector('[data-rmkadd]') as HTMLButtonElement

describe('reveal, type, then delete the text again', () => {
  it('the box neither vanishes under the typist nor sticks hidden', async () => {
    await click(rmkAdd(0))
    await settle()
    expect(rmkIn(0).classList.contains('empty')).toBe(false)
    await change(rmkIn(0), 'passing note')
    expect(DAYS[0].dutywaves[0].rows[0].rmks).toBe('passing note')
    expect(rmkIn(0).classList.contains('empty')).toBe(false)
    /* now the note is deleted again — the row is the one RMKOPEN holds, so
       the box stays revealed rather than snapping shut mid-edit */
    await change(rmkIn(0), '')
    expect(DAYS[0].dutywaves[0].rows[0].rmks || '').toBe('')
    expect(rmkIn(0).classList.contains('empty'), 'still revealed, not stuck hidden').toBe(false)
    /* the reveal is single-holder: asking for another row's box hands it
       over, and the emptied first box folds away again */
    await click(rmkAdd(1))
    await settle()
    expect(rmkIn(1).classList.contains('empty'), 'the new row is revealed').toBe(false)
    expect(rmkIn(0).classList.contains('empty'), 'the emptied first row folds back').toBe(true)
  })

  it('only one row is ever revealed at a time', async () => {
    await click(rmkAdd(0))
    await settle()
    await click(rmkAdd(1))
    await settle()
    const open = [0, 1].filter(ri => !rmkIn(ri).classList.contains('empty'))
    expect(open, 'the second + replaced the first reveal').toEqual([1])
  })
})

/* RMKOPEN holds a MODEL-INDEX path (`gr:di.ri.rmks`); unacceptInput splices
   the ground list and renumbers the g:/gr: key space, but nothing rewrites
   RMKOPEN. This documents what a scheduler sees when the row under a reveal
   shifts: the reveal does not follow the row it was asked for. Reported in
   the audit as a (cosmetic) finding, pinned here as current behaviour so a
   deliberate fix will show up as this test failing. */
describe('a ground splice under a revealed row (fixed 12 Aug 26)', () => {
  it('unaccepting a lower row carries the reveal down with its row', async () => {
    const a: any = { person: 'bane', date: 'Jul 13', allday: true, s: 0, e: 1439, type: 'Meeting', remarks: '', mod: '' }
    const b: any = { person: 'stiff', date: 'Jul 13', allday: true, s: 0, e: 1439, type: 'Meeting', remarks: '', mod: '' }
    await act(async () => {
      writeInputsBatch(() => { inpId(a); inpId(b); INPUTS.unshift(a); INPUTS.unshift(b) })
      expect(acceptInput(0, a, 'g')).toBe(true)
      expect(acceptInput(0, b, 'g')).toBe(true)
      afterSchedMutate(); notify()
    })
    const g = DAYS[0].ground
    const ra = g.findIndex((r: any) => r.src === inpKey(a))
    const rb = g.findIndex((r: any) => r.src === inpKey(b))
    expect(rb, 'b sits above a in the model').toBeGreaterThan(ra)
    /* reveal B's empty remarks box */
    const bRow = () => $(`#sbBoard .sb-panel.grnd [data-rmkadd="gr:0.${g.findIndex((r: any) => r.src === inpKey(b))}.rmks"]`)
    await click(bRow())
    await settle()
    const bIn = () => $(`#sbBoard .sb-panel.grnd [data-bfld="gr:0.${g.findIndex((r: any) => r.src === inpKey(b))}.rmks"]`) as HTMLInputElement
    expect(bIn().classList.contains('empty'), 'revealed').toBe(false)
    /* now A (the lower-indexed row) is unaccepted — B shifts down one */
    await act(async () => { expect(unacceptInput(0, a)).toBe(true); afterSchedMutate(); notify() })
    /* RMKOPEN rides the same shiftKeys renumbering the amendment book and
       the edit log do (HOOKS.remapViewKeys), so the box stays on B */
    expect(bIn().classList.contains('empty'), 'the reveal followed its row down').toBe(false)
    expect(view.RMKOPEN, 'and it names B’s new address').toBe(`gr:0.${g.findIndex((r: any) => r.src === inpKey(b))}.rmks`)
    /* clean up */
    await act(async () => { unacceptInput(0, b); afterSchedMutate(); removeInput(a); removeInput(b); notify() })
  })
})
