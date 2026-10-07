// @vitest-environment jsdom
/* A SAVE THAT WAS REFUSED NEVER SAYS IT WAS SAVED ([INPUT-SAVE-SAYS-OK-WHEN-REFUSED], found 7 Oct 26 while building who
   placed an input; fixed with the group input's writer — the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.13).

   Several input doors wrap one or more per-record saves in ONE outer save (so the whole is one Undo step). The inner
   save answers "yes" before the outer command has been checked; when the outer command was then refused — the check
   on what a member's command really changed, the locked-week backstop, the one-man-once check — everything was rolled
   back, and the screen still said "Input added" / "Input updated" / "OIL decision updated" / "Input deleted" and closed
   its window. No real gesture reached it before the group input; its refusals do ("his Save is refused with the
   sentence, the window stays").

   Each door is driven here with the OUTER command refused by a rule of the test's own — a hard check at the commit
   gate, switched on for the length of a press — so the inner save succeeds and only the outer answer says no. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, writeInputsBatch } from '../state/store'
import { setMe, DEFAULT_ME } from '../state/auth'
import { INPUTS, inpId, dateOrd } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { defineInvariant } from '../command/harness'
import { setInpEdit, INPEDIT } from './pops'
import { setPage } from '../state/view'
import { docAdd } from '../state/docs'
import { commitEditMedChoices, commitEditUpchit, draftOf, removeInput } from './inputedit'

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
let TOASTS: string[] = []
const said = (re: RegExp) => TOASTS.some(m => re.test(m))

/* the outer command refused, for as long as REFUSE is on */
let REFUSE = false
const refusing = async (fn: () => Promise<void> | void) => { REFUSE = true; try { await fn() } finally { REFUSE = false } }

const byId = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
const plant = (r: any) => {
  const row: any = { allday: true, remarks: 'saysok', mod: '2026-07-01', yr: 2026, ...r }
  inpId(row)
  writeInputsBatch(() => { INPUTS.unshift(row) })
  return String(row.iid)
}
const openList = async () => {
  await act(async () => { setPage('inputs'); notify() })
  if ($('#inListBtn')) await click($('#inListBtn'))
  if (!$('#inRangePop')) await click($('#inRangeBtn'))
  await click($('#inRangeAll'))
}

beforeAll(async () => {
  initStore()
  INPUTS.forEach((r: any) => inpId(r))
  ISNAP = JSON.stringify(INPUTS)
  defineInvariant({ id: 'test-outer-refusal', cls: 'hard', check: () => (REFUSE ? 'refused by the test' : null) })
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  HOOKS.toast = (m: any) => { TOASTS.push(String(m)) }
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
  HOOKS.toast = toast
  setSession(null); setMe(DEFAULT_ME)
})
beforeEach(async () => {
  REFUSE = false
  if (INPEDIT) await act(async () => { setInpEdit(null); notify() })
  setSession(null)
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  await act(async () => { setSession({ user: 'stiff', role: 'admin' }); setMe('stiff'); notify() })
  TOASTS = []
})

describe('the editor', () => {
  it('Add: a refused save says so, files nothing and keeps the window — and the next press files it', async () => {
    await act(async () => { setInpEdit({ _new: true, person: 'bane', allday: true, remarks: 'saysok new', yr: 2026, type: 'Meeting', date: 'Jul 14' }); notify() })
    const n = INPUTS.length
    await refusing(async () => { await click($('#inpEditSave')) })
    expect(said(/Input added/), 'never "Input added"').toBe(false)
    expect(said(/not saved/i), 'it says it was not saved').toBe(true)
    expect(INPUTS.length).toBe(n)
    expect(INPEDIT, 'the window stays').toBeTruthy()
    expect(($('#inpEditRmk') as HTMLInputElement).value, 'with what was typed').toBe('saysok new')
    TOASTS = []
    await click($('#inpEditSave'))
    expect(said(/Input added/)).toBe(true)
    expect(INPUTS.length).toBe(n + 1)
    expect(INPEDIT).toBeFalsy()
  })
  it('Save: a refused change says so, changes nothing, and the window stays on the record with what he typed', async () => {
    const id = plant({ person: 'bane', type: 'Meeting', date: 'Jul 14', allday: false, s: 540, e: 600 })
    await act(async () => { setInpEdit(byId(id)); notify() })
    await setV($('#inpEditRmk'), 'typed and not to be lost')
    await refusing(async () => { await click($('#inpEditSave')) })
    expect(said(/Input updated/), 'never "Input updated"').toBe(false)
    expect(said(/not saved/i)).toBe(true)
    expect(byId(id).remarks, 'nothing was kept').toBe('saysok')
    expect(INPEDIT, 'the window stays').toBeTruthy()
    expect(INPEDIT, 'on the record as the list now holds it').toBe(byId(id))
    expect(($('#inpEditRmk') as HTMLInputElement).value, 'what he typed is still there').toBe('typed and not to be lost')
    TOASTS = []
    await click($('#inpEditSave'))
    expect(said(/Input updated/)).toBe(true)
    expect(byId(id).remarks).toBe('typed and not to be lost')
    expect(INPEDIT).toBeFalsy()
  })
  it('Delete: a refused delete says so, keeps the record and the window', async () => {
    const id = plant({ person: 'bane', type: 'Meeting', date: 'Jul 14', allday: false, s: 540, e: 600 })
    await act(async () => { setInpEdit(byId(id)); notify() })
    await refusing(async () => { await click($('#inpEditDel')) })
    expect(said(/Input deleted/), 'never "Input deleted"').toBe(false)
    expect(said(/not saved/i)).toBe(true)
    expect(byId(id), 'the record is still there').toBeTruthy()
    expect(INPEDIT).toBe(byId(id))
    TOASTS = []
    await click($('#inpEditDel'))
    expect(said(/Input deleted/)).toBe(true)
    expect(byId(id)).toBeFalsy()
  })
  it('the medical clash sheet\'s Save: refused, it says so and writes nothing', async () => {
    const c = plant({ person: 'bane', type: 'ATT C', date: 'Jul 10', endDate: 'Jul 15', remarks: '' })
    const doc = docAdd(new Blob(['x'], { type: 'image/png' }) as any).id
    await act(async () => { setInpEdit({ _new: true, _ctx: 'u', person: 'bane', type: 'ATT B', date: 'Jul 13', endDate: 'Jul 18', allday: true, yr: 2026, remarks: '', docId: doc }); notify() })
    await click($('#inpEditSave'))
    await click($('[data-testid="medclash-0"] .seg button'))               // "ATT B replaces"
    await refusing(async () => { await click($('[data-testid="medclash-save"]')) })
    expect(said(/Input added/), 'never "Input added"').toBe(false)
    expect(said(/not saved/i)).toBe(true)
    expect(byId(c).endDate, 'the old entry was not trimmed').toBe('Jul 15')
    expect(INPUTS.some((r: any) => r.person === 'bane' && r.type === 'ATT B' && r.date === 'Jul 13')).toBe(false)
    expect(INPEDIT, 'the window stays').toBeTruthy()
  })
})

describe('the doors other screens call', () => {
  it('removeInput answers false when the delete was refused', async () => {
    const id = plant({ person: 'bane', type: 'Meeting', date: 'Jul 14', allday: false, s: 540, e: 600 })
    let ok: any
    await refusing(async () => { await act(async () => { ok = removeInput(byId(id)) }) })
    expect(ok).toBe(false)
    expect(byId(id)).toBeTruthy()
    await act(async () => { ok = removeInput(byId(id)) })
    expect(ok).toBe(true)
    expect(byId(id)).toBeFalsy()
  })
  it('commitEditUpchit answers false when its save was refused', async () => {
    const id = plant({ person: 'bane', type: 'Meeting', date: 'Jul 14', allday: false, s: 540, e: 600 })
    let ok: any
    await refusing(async () => { await act(async () => { ok = commitEditUpchit(byId(id), { ...draftOf(byId(id)), remarks: 'x' }, []) }) })
    expect(ok).toBe(false)
    expect(byId(id).remarks).toBe('saysok')
    await act(async () => { ok = commitEditUpchit(byId(id), { ...draftOf(byId(id)), remarks: 'x' }, []) })
    expect(ok).toBe(true)
    expect(byId(id).remarks).toBe('x')
  })
  it('commitEditMedChoices answers false when its save was refused', async () => {
    const id = plant({ person: 'bane', type: 'ATT C', date: 'Jul 14', remarks: '' })
    const a = dateOrd('Jul 14', 2026) as number
    const ask = { clashes: [], a, b: a }
    let ok: any
    await refusing(async () => { await act(async () => { ok = commitEditMedChoices(byId(id), { ...draftOf(byId(id)), remarks: 'till 14 Jul' }, ask, [], []) }) })
    expect(ok).toBe(false)
    await act(async () => { ok = commitEditMedChoices(byId(id), { ...draftOf(byId(id)), remarks: 'till 14 Jul' }, ask, [], []) })
    expect(ok).toBe(true)
  })
})

describe('the Inputs List', () => {
  it('an edit in place that asks the OIL question: refused, it says so, changes nothing and stays in edit', async () => {
    const id = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', allday: false, s: 540, e: 600 })
    await openList()
    await click($(`tr[data-iid="${id}"] [data-edit]`))
    await setV($('#inBody tr.ined input[data-ed="remarks"]'), 'typed in the list')
    await click($('#inBody tr.ined [data-save]'))
    await click($('[data-testid="oil-yes"]'))
    await refusing(async () => { await click($('[data-testid="oilconf-save"]')) })
    expect(said(/Input updated/), 'never "Input updated"').toBe(false)
    expect(said(/not saved/i)).toBe(true)
    expect(byId(id).remarks).toBe('saysok')
    expect(byId(id).oil).toBeUndefined()
    expect($('#inBody tr.ined'), 'the row is still being edited').toBeTruthy()
    expect(($('#inBody tr.ined input[data-ed="remarks"]') as HTMLInputElement).value, 'with what he typed').toBe('typed in the list')
  })
  it('the row\'s OIL chip: a refused answer never says "OIL decision updated"', async () => {
    const id = plant({ person: 'bane', type: 'Duty', date: 'Jul 18', endDate: 'Jul 19', s: 0, e: 1439, oil: { '2026-07-18': 1, '2026-07-19': 0 } })
    await openList()
    await click(document.querySelector(`tr[data-iid="${id}"] .roil`))
    await click($('[data-testid="oil-all"]'))
    await refusing(async () => { await click($('[data-testid="oilconf-save"]')) })
    expect(said(/OIL decision updated/)).toBe(false)
    expect(said(/not saved/i)).toBe(true)
    expect(byId(id).oil).toEqual({ '2026-07-18': 1, '2026-07-19': 0 })
  })
  it('its ✕: a refused delete never says "Input deleted"', async () => {
    const id = plant({ person: 'bane', type: 'Meeting', date: 'Jul 14', allday: false, s: 540, e: 600 })
    await openList()
    await refusing(async () => { await click($(`tr[data-iid="${id}"] .rmx`)) })
    expect(said(/Input deleted/)).toBe(false)
    expect(byId(id)).toBeTruthy()
  })
})
