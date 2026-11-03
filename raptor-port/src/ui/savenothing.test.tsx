// @vitest-environment jsdom
/* A SAVE WITH NOTHING CHANGED CHANGES NOTHING (F1 of the 3 Nov 26 re-check — the Inputs batch [INPUTS-FIXES-1103];
   `docs/handpass/2026-11-03-inputs-seen-recheck.md`). Save pressed on an input as it stands wrote "changed by" and the
   time, an Undo step of its own and the just-changed mark — for nothing. Now the window just closes. And a save that
   changes one thing still saves, as before. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, writeInputsBatch } from '../state/store'
import { setMe, DEFAULT_ME } from '../state/auth'
import { INPUTS, inpId } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { onCommit } from '../command'
import { setInpEdit, INPEDIT } from './pops'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const setV = async (el: any, v: string) => act(async () => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
  setter.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true }))
})
let ISNAP = ''
const toast = HOOKS.toast
const byId = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
const plant = (r: any) => {
  const row: any = { allday: true, remarks: 'as filed', mod: '2026-07-01', yr: 2026, ...r }
  inpId(row)
  writeInputsBatch(() => { INPUTS.unshift(row) })
  return String(row.iid)
}
const stampOf = (r: any) => JSON.stringify([r.mod, r.modBy, r.modAt])

beforeAll(async () => {
  initStore()
  INPUTS.forEach((r: any) => inpId(r))
  ISNAP = JSON.stringify(INPUTS)
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  HOOKS.toast = () => {}
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
  HOOKS.toast = toast
  setSession(null); setMe(DEFAULT_ME)
})
beforeEach(async () => {
  if (INPEDIT) await act(async () => { setInpEdit(null); notify() })
  setSession(null)
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  await act(async () => { setSession({ user: 'stiff', role: 'admin' }); setMe('stiff'); notify() })
})

describe('Save with nothing changed (F1)', () => {
  for (const [name, row] of [
    ['a timed Meeting', { person: 'bane', type: 'Meeting', date: 'Jul 14', allday: false, s: 540, e: 600 }],
    ['an all-day leave of several days', { person: 'bane', type: 'LL', date: 'Jul 14', endDate: 'Jul 16' }],
    ['an Event with its own title', { person: 'bane', type: 'Event', title: 'Sports day', date: 'Jul 15', allday: false, s: 780, e: 960 }],
  ] as const) {
    it(`${name}: no stamp, no command, the window closes`, async () => {
      const id = plant(row)
      const before = stampOf(byId(id)), rec = JSON.stringify(byId(id))
      await act(async () => { setInpEdit(byId(id)); notify() })
      const seen: string[] = []
      const off = onCommit(env => { seen.push(env.type) })
      try { await click($('#inpEditSave')) } finally { off() }
      expect(stampOf(byId(id)), 'the changed-by stamp is left alone').toBe(before)
      expect(JSON.stringify(byId(id)), 'the record is as it was').toBe(rec)
      expect(seen.filter(t => t.startsWith('inputs.')), 'no command — so no Undo step').toEqual([])
      expect(INPEDIT, 'the window closes').toBeFalsy()
    })
  }

  it('one thing changed still saves, stamped', async () => {
    const id = plant({ person: 'bane', type: 'Meeting', date: 'Jul 14', allday: false, s: 540, e: 600 })
    const before = stampOf(byId(id))
    await act(async () => { setInpEdit(byId(id)); notify() })
    await setV($('#inpEditRmk'), 'moved to the big room')
    await click($('#inpEditSave'))
    expect(byId(id).remarks).toBe('moved to the big room')
    expect(stampOf(byId(id)), 'stamped as changed').not.toBe(before)
  })
})

/* the code read of 3 Nov 26 (F-A3): F1 held for one person's input only — an input of several went to its own save, which
   wrote nothing but still said "Input updated" and lit the row as just changed */
describe('Save with nothing changed — an input of several people (F1)', () => {
  it('no stamp, no command, and nothing said or lit', async () => {
    const id = plant({ person: 'bane', people: [{ p: 'bane' }, { p: 'stiff' }], type: 'Meeting', date: 'Jul 14', allday: false, s: 540, e: 600 })
    const before = stampOf(byId(id)), rec = JSON.stringify(byId(id))
    const said: string[] = []
    HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
    await act(async () => { setInpEdit(byId(id)); notify() })
    const seen: string[] = []
    const off = onCommit(env => { seen.push(env.type) })
    try { await click($('#inpEditSave')) } finally { off(); HOOKS.toast = () => {} }
    expect(stampOf(byId(id))).toBe(before)
    expect(JSON.stringify(byId(id))).toBe(rec)
    expect(seen.filter(t => t.startsWith('inputs.'))).toEqual([])
    expect(INPEDIT, 'the window closes').toBeFalsy()
    expect(said, 'nothing was updated, so nothing says it was').not.toContain('Input updated')
  })
  it('one thing changed still saves', async () => {
    const id = plant({ person: 'bane', people: [{ p: 'bane' }, { p: 'stiff' }], type: 'Meeting', date: 'Jul 14', allday: false, s: 540, e: 600 })
    await act(async () => { setInpEdit(byId(id)); notify() })
    await setV($('#inpEditRmk'), 'with the room booked')
    await click($('#inpEditSave'))
    expect(byId(id).remarks).toBe('with the room booked')
  })
})
