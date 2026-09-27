// @vitest-environment jsdom
/* A MEMBER IS NOT OFFERED ANOTHER MAN'S INPUT TO CHANGE (the absence-record re-test, W1-F3, 26 Sep 26 — found by the
   calendar walker, reproduced by the host).

   The write path always held ("You can only edit your own inputs" / "…delete your own inputs"), and the Inputs TABLE
   shows no control on another man's row. The CALENDAR did not agree with it: a member could pick up another man's
   chip (the ghost followed his finger, a day lit up, and only the drop said no), and a tap opened that man's input in
   the edit window with Delete and Save — each refused only when pressed. D166: a member acts on his own row only;
   the house rule: a control is never offered to someone who cannot use it.

   Now another man's chip does not lift for a member (a tap still opens it), and the edit window opened on an input
   its reader may not change shows it read only — no Delete, no Save, and says who can — whichever door opened it. */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { initStore, notify, setSession } from '../state/store'
import { setMe } from '../state/auth'
import { INPUTS, inpId } from '../engine/inputs'
import { initCalDrag } from './caldrag'
import { InputEditor } from './inputedit'
import { setInpEdit } from './pops'

const ISNAP = JSON.stringify(INPUTS)
/* jsdom has no layout: the drag machine asks what is under the finger, and "nothing" is all these tests need */
beforeAll(() => { initStore(); (document as any).elementFromPoint = () => null })
beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  setSession({ user: 'us', role: 'member' } as any)
  setMe('bane')                                      // Ranger
})
afterEach(() => { setInpEdit(null); setSession({ user: 'a', role: 'admin' } as any) })

const plant = (person: string) => {
  const row: any = { person, type: 'LL', date: 'Jul 24', yr: 2026, allday: true, s: 0, e: 1439, remarks: 'W1-F3', mod: '2026-07-01' }
  inpId(row); INPUTS.unshift(row); return row
}

describe('the calendar: another man’s chip does not lift for a member', () => {
  const ptr = (type: string) => new PointerEvent(type, { bubbles: true, cancelable: true, clientX: 10, clientY: 10, pointerId: 1, pointerType: 'touch', isPrimary: true })
  const build = (iid: string) => {
    document.body.innerHTML = `<div id="root"><div class="ic-day" data-icday="2026-07-24"><div class="ic-chip" data-icdrag data-iid="${iid}">chip</div></div></div>`
    return { root: document.getElementById('root')!, chip: document.querySelector('[data-icdrag]') as HTMLElement }
  }
  it('held past the hold time, it is not picked up — and a tap still opens it', () => {
    vi.useFakeTimers()
    try {
      const other = plant('stiff')                     // Saber's leave
      const { root, chip } = build(other.iid)
      let tapped = 0
      const off = initCalDrag(root, { onTap: () => { tapped++ } })
      chip.dispatchEvent(ptr('pointerdown'))
      vi.advanceTimersByTime(400)
      expect(document.querySelector('.ic-ghost'), 'no ghost follows the finger').toBe(null)
      chip.dispatchEvent(ptr('pointerup'))
      expect(tapped).toBe(1)
      off()
    } finally { vi.runOnlyPendingTimers(); vi.useRealTimers(); document.body.innerHTML = '' }
  })
  it('his OWN chip still lifts', () => {
    vi.useFakeTimers()
    try {
      const mine = plant('bane')
      const { root, chip } = build(mine.iid)
      const off = initCalDrag(root, { onTap: () => {} })
      chip.dispatchEvent(ptr('pointerdown'))
      vi.advanceTimersByTime(400)
      expect(document.querySelector('.ic-ghost')).toBeTruthy()
      chip.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: 1, pointerType: 'touch' }))
      off()
    } finally { vi.runOnlyPendingTimers(); vi.useRealTimers(); document.body.innerHTML = '' }
  })
})

describe('the edit window, opened on an input its reader may not change', () => {
  let host: HTMLDivElement, root: Root
  beforeEach(() => { host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host) })
  afterEach(() => { act(() => root.unmount()); host.remove() })
  const open = async (r: any) => { await act(async () => { root.render(<InputEditor />); setInpEdit(r); notify() }) }
  it('shows it read only — no Delete, no Save — and says who can change it', async () => {
    await open(plant('stiff'))
    expect(document.querySelector('#inpEditPop'), 'it opens').toBeTruthy()
    expect(document.querySelector('#inpEditDel')).toBe(null)
    expect(document.querySelector('#inpEditSave')).toBe(null)
    expect(document.querySelector('#inpEditPop')!.textContent).toMatch(/Only Saber or an admin can change this/)
  })
  it('his own input keeps Delete and Save', async () => {
    await open(plant('bane'))
    expect(document.querySelector('#inpEditDel')).toBeTruthy()
    expect(document.querySelector('#inpEditSave')).toBeTruthy()
  })
})
