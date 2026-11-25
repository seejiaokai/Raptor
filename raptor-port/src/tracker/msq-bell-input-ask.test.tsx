// @vitest-environment jsdom
/* A BELL LINE THAT OPENS AN INPUT WAITS FOR HIS ANSWER (the night of 24 Nov 26, the re-walk's B1 —
   docs/handpass/2026-11-24-msq-night-check.md §15; his D2318, D2637, D2323). Hunter (142's admin, Plan of 149) has unsaved
   chart edits on 149's Tracker and is in the member view, the Tracker held on 149 for them. He presses a bell line about
   an input of his own on 142. The question "Save them before switching to 142?" was asked — but the input's window had
   already opened under it, noted as opened on 149's page:
   - Stay left it over 149's View-only Sched with Save and Delete live;
   - Discard landed him on 142 with that window reading "This is 149's. You picked 142 — close this to go on.", untrue,
     its form locked.
   Nothing opens until he has answered: Stay leaves him where he was with no window; Discard lands him on his own Inputs
   with the ordinary window for that line. The harness is tracker/msq-night-memberview.test.tsx's.
   Red first: the window stood open under the question. */
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useMsqWorld, signInAs, ACCT, PID } from '../test-support/msq-world'
import * as core from './app/core.js'
import * as st from './storage.js'
import { TrackerPage } from './TrackerPage'
import { Whiteboard } from '../storage/whiteboard'
import { trackerTarget } from '../storage/adapters'
import { saveAccess } from '../state/accounts'
import { todayIso } from '../state/units'
import { pageUnit, setTrkUnitProbe } from '../state/perms'
import { notify, switchRoleView } from '../state/store'
import { CURPAGE, setPage } from '../state/view'
import { pickSquadron } from '../state/pick'
import { UNIT } from '../engine/unitview'
import { InputEditor } from '../ui/InputWindow'
import { INPEDIT, setInpEdit } from '../ui/pops'
import { openNotice } from '../ui/topstate'
import { PEOPLE } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import type { Notice } from '../state/notices'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const C: any = core
const S: any = st
const wb = new Whiteboard()
const tick = () => new Promise(r => setTimeout(r, 0))
const until = async (f: () => any) => { for (let i = 0; i < 800; i++) { if (f()) return; await tick() } throw new Error('timed out waiting') }
const settle = async () => { for (let i = 0; i < 4; i++) { await C.whenUnitSettled?.(); await C.whenLoaded(); await tick() } }
const pick = async (u: string) => { await act(async () => { await pickSquadron(u); await settle() }) }
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const dead = (el: Element | null) => !!el && !!el.closest('[inert]')

let host: HTMLElement | null = null, root: Root | null = null
let winHost: HTMLElement | null = null, winRoot: Root | null = null
beforeAll(() => {
  S.setStorageMaker((u: string) => trackerTarget(wb, u), () => pageUnit('own', todayIso()))
  setTrkUnitProbe(() => S.storageUnit())
})
useMsqWorld()
afterAll(() => {
  if (winRoot) act(() => winRoot!.unmount())
  if (root) act(() => root!.unmount())
  winHost?.remove(); host?.remove(); setTrkUnitProbe(null); S.setStorageMaker(null, null); S.setStorageImpl(null)
})
beforeEach(async () => {
  signInAs('saber')
  expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
  signInAs('hunter')
  if (!host) {
    host = document.createElement('div'); host.id = 'page-tracker'; document.body.appendChild(host)
    root = createRoot(host)
    await act(async () => { root!.render(createElement(TrackerPage, { active: false })) })
    for (let i = 0; i < 200 && !C.ready; i++) await act(async () => { await tick() })
    await act(async () => { await settle() })
    winHost = document.createElement('div'); document.body.appendChild(winHost)
    winRoot = createRoot(winHost)
    await act(async () => { winRoot!.render(createElement(InputEditor)) })
  }
  await act(async () => { setInpEdit(null); notify(); await settle() })
  if (C.dlg) await act(async () => { C.dlgClose(false); await settle() })
  if (C.sylDirty) await act(async () => { await C.discardForTests?.(); })
  if (C.arrangeMode) act(() => { C.toggleArrange() })
  if (S.storageUnit() !== 'u142') await pick('u142')
  act(() => { setPage('viewsched'); notify() })
})

/* Hunter on 149 with an unsaved chart edit, in the member view: the Tracker held on 149 */
async function heldDraft(name: string) {
  await pick('u149')
  await act(async () => {
    if (!C.arrangeMode) C.toggleArrange()
    const p = C.addModule('acad'); await until(() => C.dlg); C.dlgClose(name); await p
    C.toggleArrange()
    await settle()
  })
  expect(C.sylDirty, 'the premise: an unsaved chart edit').toBe(true)
  await act(async () => { switchRoleView(); await settle() })
  expect(S.storageUnit(), 'the premise: the Tracker held on 149').toBe('u149')
  expect(UNIT).toBe('u149')
  expect(CURPAGE).toBe('viewsched')
}
const answer = async (v: unknown) => { await act(async () => { C.dlgClose(v); await tick(); await tick() }) }
async function discardNow() {
  if (C.dlg) await answer(false)
  await act(async () => { const p = pickSquadron('u142'); await until(() => C.dlg); C.dlgClose('__alt__'); await p; await settle() })
}
/* a bell line "You were added" about an input of 142 (the line's squadron stamp `u`) */
const row142 = () => INPUTS.find((x: any) => x.person && PEOPLE[x.person] && x.iid != null && (x.unit == null || x.unit === 'u142'))!
const lineFor = (row: any): Notice => ({ id: 'b1-' + row.iid, to: PID.hunter, by: null, at: Date.now(), iid: row.iid, name: '', day: '2026-07-15',
  what: [{ k: 'in' }], u: 'u142' } as unknown as Notice)

describe('a bell line that opens an input, pressed in the member view over a held draft (B1)', () => {
  it('asks first and opens nothing under the question; Stay leaves him where he was, no window', async () => {
    await heldDraft('B1-STAY')
    const row = row142()
    await act(async () => { openNotice(lineFor(row)); await tick() })
    expect(C.dlg?.msg, 'the question is asked').toContain('Save them before switching to 142?')
    expect(INPEDIT, 'no window opens under the question').toBeNull()
    expect($('#inpEditPop:not([hidden]) #inpEditSave'), 'no input form on screen').toBeNull()
    expect(CURPAGE).toBe('viewsched')
    await answer(false)   /* Stay */
    await act(async () => { await settle() })
    expect(INPEDIT, 'Stay: no window').toBeNull()
    expect([CURPAGE, UNIT, S.storageUnit()], 'Stay: where he was').toEqual(['viewsched', 'u149', 'u149'])
    expect(C.sylDirty, 'the draft kept').toBe(true)
    await discardNow()
  })
  it('Discard them: his own Inputs on 142, the ordinary window for that line — no band, nothing locked by a hold', async () => {
    await heldDraft('B1-DISC')
    const row = row142()
    await act(async () => { openNotice(lineFor(row)); await tick() })
    expect(C.dlg?.msg).toContain('Save them before switching to 142?')
    expect(INPEDIT, 'no window opens under the question').toBeNull()
    await answer('__alt__')   /* Discard them */
    await act(async () => { await settle() })
    expect([CURPAGE, UNIT], 'landed on his own page').toEqual(['inputs', 'u142'])
    expect(INPEDIT?.iid, 'the line\'s input is open').toBe(row.iid)
    expect($('[data-testid="inped-moveband"]'), 'no band: it was opened on his own page').toBeNull()
    expect(document.querySelector('[data-heldro]'), 'nothing greyed by a hold').toBeNull()
    expect($('#inpEditRmk'), 'its form is drawn').not.toBeNull()
    await act(async () => { setInpEdit(null); switchRoleView(); await settle() })
  })
  it('(control) nothing unsaved: the line opens its window on his own Inputs at once, no question', async () => {
    await pick('u149')
    await act(async () => { switchRoleView(); await settle() })
    expect(CURPAGE).toBe('viewsched')
    const row = row142()
    await act(async () => { openNotice(lineFor(row)); await tick() })
    expect(C.dlg ?? null, 'no question').toBeNull()
    expect([CURPAGE, UNIT]).toEqual(['inputs', 'u142'])
    expect(INPEDIT?.iid).toBe(row.iid)
    expect($('[data-testid="inped-moveband"]')).toBeNull()
    expect(dead($('#inpEditRmk')) && !!document.querySelector('[data-heldro]'), 'not held').toBe(false)
    await act(async () => { setInpEdit(null); switchRoleView(); await settle() })
  })
})
