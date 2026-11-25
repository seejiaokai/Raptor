// @vitest-environment jsdom
/* THE HELD DRAFT IN THE MEMBER VIEW (the night of 24 Nov 26, the fix list's items 2 and 3; his D129, D2318, D2637). Hunter
   (142's admin, Plan of 149) has unsaved chart edits on 149's Tracker and switches to the member view: the Tracker is
   hidden and held on 149 for them. From there
   - a tap that opens one of his own pages, or Logout, used to drop the draft with no question (Opus F1, Fable F1);
   - the question a pick raises opened at no size inside the hidden Tracker and jammed later picks, and "Save them", which
     the gate refuses there, hid its refusal (the walk's F2, Fable F2, Opus F3).
   The question and the refusal are seen and answered over the page he is on, the draft kept until he says otherwise. */
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useMsqWorld, signInAs, ACCT } from '../test-support/msq-world'
import * as core from './app/core.js'
import * as st from './storage.js'
import { TrackerPage } from './TrackerPage'
import { Whiteboard } from '../storage/whiteboard'
import { trackerTarget } from '../storage/adapters'
import { saveAccess } from '../state/accounts'
import { SESSION } from '../state/auth'
import { todayIso } from '../state/units'
import { lwUnitNow, pageUnit, setTrkUnitProbe } from '../state/perms'
import { notify, switchRoleView } from '../state/store'
import { CURPAGE, setPage } from '../state/view'
import { pickSquadron } from '../state/pick'
import { logOut, setReloadSeam } from '../ui/logout'
import { UNIT } from '../engine/unitview'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const C: any = core
const S: any = st
const wb = new Whiteboard()
const tick = () => new Promise(r => setTimeout(r, 0))
const until = async (f: () => any) => { for (let i = 0; i < 800; i++) { if (f()) return; await tick() } throw new Error('timed out waiting') }
const settle = async () => { for (let i = 0; i < 4; i++) { await C.whenUnitSettled?.(); await C.whenLoaded(); await tick() } }
const pick = async (u: string) => { await act(async () => { await pickSquadron(u); await settle() }) }
const storedHas = (unit: string, needle: string) => wb.keys('tracker')
  .filter(k => k.startsWith(unit + '@') && !k.includes(':lay')).some(k => String(wb.get('tracker', k)).includes(needle))

let host: HTMLElement | null = null, root: Root | null = null
let restoreReload: (() => void) | null = null
let reloads = 0
beforeAll(() => {
  S.setStorageMaker((u: string) => trackerTarget(wb, u), () => pageUnit('own', todayIso()))
  setTrkUnitProbe(() => S.storageUnit())
  restoreReload = setReloadSeam(() => { reloads++ })
})
useMsqWorld()
afterAll(() => {
  if (root) act(() => root!.unmount())
  host?.remove(); restoreReload?.(); setTrkUnitProbe(null); S.setStorageMaker(null, null); S.setStorageImpl(null)
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
  }
  await act(async () => { await settle() })
  if (C.dlg) await act(async () => { C.dlgClose(false); await settle() })
  if (C.sylDirty) await act(async () => { await C.discardForTests?.(); })
  if (C.arrangeMode) act(() => { C.toggleArrange() })
  if (S.storageUnit() !== 'u142') await pick('u142')
  reloads = 0
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
const hiddenBy = (el: Element | null): string | null => {
  for (let n = el; n; n = n.parentElement) {
    if (n.hasAttribute('inert')) return 'inert'
    if (n.classList.contains('trk-gone')) return 'trk-gone'
  }
  return null
}
const shownQuestion = () => {
  const m = document.getElementById('dlgModal')
  expect(m, 'the question is drawn').toBeTruthy()
  expect(hiddenBy(m), 'nothing hides it').toBeNull()
  expect(document.getElementById('page-tracker')?.classList.contains('trk-askonly'), 'it stands over the page he is on').toBe(true)
}
const answer = async (v: unknown) => { await act(async () => { C.dlgClose(v); await tick(); await tick() }) }
/* put the draft away through the door he has, so the next test starts clean */
async function discardNow() {
  if (C.dlg) await answer(false)
  await act(async () => { const p = pickSquadron('u142'); await until(() => C.dlg); C.dlgClose('__alt__'); await p; await settle() })
}

describe('a tap in the member view that opens one of his own pages, over a held draft', () => {
  it('asks first, over the page he is on; Stay keeps the draft, the door and the page', async () => {
    await heldDraft('F-TAP1')
    await act(async () => { setPage('leavewar'); notify(); await tick() })
    expect(C.sylDirty, 'the draft is not dropped').toBe(true)
    expect(C.byid['F-TAP1'], 'its ball is still there').toBeTruthy()
    expect(S.storageUnit(), 'the door stays on 149').toBe('u149')
    expect(C.dlg?.msg).toContain('Save them before switching to 142?')
    expect(CURPAGE, 'nothing opens under the question').toBe('viewsched')
    shownQuestion()
    await answer(false)   /* Stay */
    await act(async () => { await settle() })
    expect(C.sylDirty).toBe(true)
    expect(C.byid['F-TAP1']).toBeTruthy()
    expect(S.storageUnit()).toBe('u149')
    expect(CURPAGE).toBe('viewsched')
    await discardNow()
  })
  it('Discard them: the page he tapped opens on his own squadron, the Tracker with it', async () => {
    await heldDraft('F-TAP2')
    await act(async () => { setPage('leavewar'); notify(); await tick() })
    expect(C.dlg?.msg).toContain('Save them before switching to 142?')
    await answer('__alt__')
    await act(async () => { await settle() })
    expect(CURPAGE).toBe('leavewar')
    expect(UNIT).toBe('u142')
    expect(S.storageUnit()).toBe('u142')
    expect(storedHas('u149', 'F-TAP2')).toBe(false)
    expect(storedHas('u142', 'F-TAP2')).toBe(false)
    act(() => { setPage('viewsched'); notify() })
  })
})

describe('Logout in the member view, over a held draft', () => {
  it('asks over the page he is on; Stay keeps him signed in with the draft', async () => {
    await heldDraft('F-OUT1')
    let out: any
    await act(async () => { out = logOut(); await until(() => C.dlg) })
    expect(C.dlg.msg).toContain('Save them before logging out?')
    expect(C.sylDirty).toBe(true)
    expect(CURPAGE, 'never the Tracker tab, which the member view does not offer').toBe('viewsched')
    shownQuestion()
    await act(async () => { C.dlgClose(false); expect(await out).toBe(false); await settle() })
    expect(SESSION, 'still signed in').toBeTruthy()
    expect(C.sylDirty).toBe(true)
    expect(C.byid['F-OUT1']).toBeTruthy()
    expect(S.storageUnit()).toBe('u149')
    await discardNow()
  })
  it('Save them is refused there: the refusal is seen, he stays signed in and the draft is kept', async () => {
    await heldDraft('F-OUT2')
    let out: any
    await act(async () => { out = logOut(); await until(() => C.dlg) })
    await act(async () => { C.dlgClose(true); await until(() => C.dlg && C.dlg.msg === C.NOT_SAVED) })
    shownQuestion()
    await act(async () => { C.dlgClose(true); expect(await out, 'no logout over a save that did not take').toBe(false); await settle() })
    expect(reloads).toBe(0)
    expect(SESSION).toBeTruthy()
    expect(C.sylDirty).toBe(true)
    expect(C.byid['F-OUT2']).toBeTruthy()
    expect(storedHas('u149', 'F-OUT2'), 'nothing saved').toBe(false)
    await discardNow()
  })
  it('Discard them signs him out', async () => {
    await heldDraft('F-OUT3')
    let out: any
    await act(async () => { out = logOut(); await until(() => C.dlg) })
    await act(async () => { C.dlgClose('__alt__'); expect(await out).toBe(true); await settle() })
    expect(SESSION).toBeNull()
    expect(storedHas('u149', 'F-OUT3')).toBe(false)
  })
})

describe('back from the member view over a held draft (fix list item 4 — the security read\'s F1)', () => {
  it('the Leave War comes back to the squadron picked, not left on his home under 149\'s number', async () => {
    await heldDraft('F-WAR1')
    expect(lwUnitNow(), 'in the member view the war is his own').toBe('u142')
    await act(async () => { notify(); await settle() })   /* anything that repaints, as moving a week does */
    await act(async () => { switchRoleView(); await settle() })
    expect(UNIT).toBe('u149')
    expect(lwUnitNow(), 'the Leave War loaded is 149\'s').toBe('u149')
    expect(S.storageUnit()).toBe('u149')
    expect(C.byid['F-WAR1'], 'the draft came back with him').toBeTruthy()
    await act(async () => { await C.saveChangesClick(); await settle() })
    expect(storedHas('u149', 'F-WAR1')).toBe(true)
    /* the fix list's third lead: saved, the next switch to the member view takes the door home */
    await act(async () => { switchRoleView(); await settle() })
    expect(lwUnitNow()).toBe('u142')
    expect(S.storageUnit(), 'nothing left to hold: the Tracker goes with his pages').toBe('u142')
    await act(async () => { switchRoleView(); await settle() })
    expect(S.storageUnit()).toBe('u149')
    expect(lwUnitNow()).toBe('u149')
  })
})

describe('the same squadron wanted again before its memory is emptied (Fable\'s lead)', () => {
  it('a draft dropped on the way out is not left drawn as if it were saved', async () => {
    await act(async () => {
      if (!C.arrangeMode) C.toggleArrange()
      const p = C.addModule('acad'); await until(() => C.dlg); C.dlgClose('F-BACK'); await p
      C.toggleArrange()
      await settle()
    })
    expect(C.sylDirty).toBe(true)
    await act(async () => {
      S.rebindStorageUnit('u149', false)   /* a move starts, the draft dropped… */
      for (let i = 0; i < 50 && C.ready; i++) await Promise.resolve()
      expect(C.ready, 'the premise: it has begun leaving').toBe(false)
      S.rebindStorageUnit('u142', false)   /* …and his pages are back on 142 before its memory goes */
      await settle()
    })
    expect(S.storageUnit()).toBe('u142')
    expect(C.sylDirty, 'nothing is marked unsaved').toBe(false)
    expect(C.byid['F-BACK'], 'so nothing unsaved is drawn: the chart is the stored one').toBeFalsy()
    expect(storedHas('u142', 'F-BACK')).toBe(false)
    expect(C.saveWords().text, 'and the corner says the draft was not saved').toContain(C.NOT_SAVED)
  })
})

describe('a pick in the member view, over a held draft', () => {
  it('its question is drawn over the page, and answers', async () => {
    await heldDraft('F-PICK1')
    let done: any
    await act(async () => { done = pickSquadron('u142'); await until(() => C.dlg) })
    expect(C.dlg.msg).toContain('Save them before switching to 142?')
    shownQuestion()
    await act(async () => { C.dlgClose('__alt__'); await done; await settle() })
    expect(UNIT).toBe('u142')
    expect(S.storageUnit()).toBe('u142')
  })
  it('Save them is refused: the refusal is seen, the draft kept, and the next pick asks again', async () => {
    await heldDraft('F-PICK2')
    let done: any
    await act(async () => { done = pickSquadron('u142'); await until(() => C.dlg) })
    await act(async () => { C.dlgClose(true); await until(() => C.dlg && C.dlg.msg === C.NOT_SAVED) })
    expect(C.switchAsking, 'the refusal stays up over his page').toBe(true)
    shownQuestion()
    await act(async () => { C.dlgClose(true); await done; await settle() })
    expect(UNIT, 'the pick did not happen').toBe('u149')
    expect(C.sylDirty).toBe(true)
    expect(C.byid['F-PICK2']).toBeTruthy()
    expect(storedHas('u149', 'F-PICK2')).toBe(false)
    await act(async () => { done = pickSquadron('u142'); await until(() => C.dlg) })
    expect(C.dlg.msg, 'never jammed: the question comes again').toContain('Save them before switching to 142?')
    await act(async () => { C.dlgClose('__alt__'); await done; await settle() })
    expect(UNIT).toBe('u142')
  })
})
