// @vitest-environment jsdom
/* A PICK WITH UNSAVED CHART EDITS ASKS FIRST (batch 1's second half, the plan
   docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md §16 D2′; his D2318 — the approved drawing
   docs/mock/2026-11-22-msq-b1-screens/img/f2d-*.png; kept by his D2395, under which the Tracker follows the squadron picked
   — that move itself is tracker/msq-trk-follows-pick.test.tsx, with the real door). A pick that takes the Tracker off the
   squadron it is on would leave his unsaved chart edits behind. The pick asks
   the sign-out's question with its own last line — "You have unsaved chart edits on “2026”. Save them before switching to
   142?" — Save them / Discard them / Stay:
   - Stay keeps everything and makes no pick;
   - Discard drops the edits and picks;
   - Save saves them into the Tracker's own squadron (149's here), then picks.
   The bell's tap that enters another squadron asks the same (state/belltap.ts enterForLine), and goes on once answered.
   The member view and back keeps a draft: the Tracker is held and hidden, never reset (D2′ (b), D2395).
   Hunter (142's admin) holds Plan of 149, picked 149 and opened the Tracker there (its squadron read by the gate's probe,
   as boot.ts installs it). Its own file so the Tracker engine boots fresh.
   Red first: before the change a pick asked nothing — it went straight through and the edits stayed behind. */
import { describe, it, expect, beforeEach, afterAll, afterEach } from 'vitest'
import { render, cleanup, act, fireEvent } from '@testing-library/react'
import { Drawer } from '../ui/Drawer'
import { DRAWER, setDrawer } from '../ui/pops'
import * as core from './app/core.js'
import { useMsqWorld, signInAs, ACCT, PID } from '../test-support/msq-world'
import { saveAccess } from '../state/accounts'
import { setTrkUnitProbe } from '../state/perms'
import { notify, switchRoleView } from '../state/store'
import { pickSquadron } from '../state/pick'
import { trackerCover } from '../state/typing-hold'
import { trackerMayLogOut } from './role.js'
import { setStorageHeld } from './storage.js'
import { UNIT } from '../engine/unitview'
import { CURPAGE, setPage } from '../state/view'
import { openNotice } from '../ui/topstate'
import type { Notice } from '../state/notices'

const C: any = core
const tick = () => new Promise(r => setTimeout(r, 0))
const until = async (f: () => any) => { for (let i = 0; i < 500; i++) { if (f()) return; await tick() } throw new Error('timed out waiting') }
const QUESTION = 'You have unsaved chart edits on “2026”.\n\nSave them before switching to 142?'

useMsqWorld()
let board: HTMLElement | null = null
beforeEach(async () => {
  signInAs('saber')
  expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
  signInAs('hunter')
  if (!board) {
    board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
    await C.init(); await C.whenLoaded()
  }
  if (C.sylDirty) await C.saveChangesClick()
})
afterAll(() => { board?.remove(); setTrkUnitProbe(null) })

/* Hunter on 149 with 149's Tracker (bound = his own pages' squadron: no cover) */
async function onHis149Tracker() {
  await pickSquadron('u149')
  setTrkUnitProbe(() => 'u149'); notify()
  expect(UNIT).toBe('u149')
  expect(trackerCover(), 'his own Tracker, uncovered').toBeNull()
}
/* an unsaved chart edit: a new event in Edit chart layout */
async function dirty(name: string) {
  if (!C.arrangeMode) C.toggleArrange()
  const p = C.addModule('acad'); await until(() => C.dlg); C.dlgClose(name); await p
  C.toggleArrange()
  expect(C.sylDirty, 'the premise: an unsaved chart edit').toBe(true)
}
const stored = async (id: string) => (await C.collectCharts([C.curSylId()])).syllabi[C.curSylId()].some((e: any) => e.id === id)

describe('a pick with unsaved chart edits (the drawing f2d)', () => {
  it('asks the question; Stay keeps everything and makes no pick', async () => {
    await onHis149Tracker()
    await dirty('PICK-STAY')
    const p = pickSquadron('u142')
    await until(() => C.dlg)
    expect(C.dlg.msg).toBe(QUESTION)
    expect([C.dlg.ok, C.dlg.alt, C.dlg.cancelLabel]).toEqual(['Save them', 'Discard them', 'Stay'])
    expect(CURPAGE, 'never jumping to the Tracker page first').not.toBe('tracker')
    C.dlgClose(false); await p
    expect(UNIT, 'no pick').toBe('u149')
    expect(C.sylDirty, 'the edit is still there').toBe(true)
    expect(C.byid['PICK-STAY']).toBeTruthy()
    expect(await stored('PICK-STAY'), 'and still unsaved').toBe(false)
    expect(trackerCover()).toBeNull()
    await C.saveChangesClick()
  })
  it('Discard them drops the edits, then picks: no band over the Tracker (D2395)', async () => {
    await onHis149Tracker()
    await dirty('PICK-DISCARD')
    const p = pickSquadron('u142')
    await until(() => C.dlg); C.dlgClose('__alt__'); await p
    expect(UNIT).toBe('u142')
    expect(C.sylDirty).toBe(false)
    expect(C.byid['PICK-DISCARD'], 'the ball is gone').toBeFalsy()
    expect(trackerCover()).toBeNull()
    /* the re-walk of 23 Nov 26 (chat 151, N2): the bar still said "● unsaved flow edits — hit “Save changes”" about the
       edits just dropped. Red first. */
    expect(C.saveWords().text, 'the bar no longer speaks of unsaved edits').not.toMatch(/unsaved/)
  })
  it('the sign-out\'s own "Discard them" puts the bar\'s words back too (its twin, N2)', async () => {
    await onHis149Tracker()
    await dirty('LOGOUT-DISCARD')
    const p = trackerMayLogOut()
    await until(() => C.dlg); C.dlgClose('__alt__')
    expect(await p, 'the sign-out goes on').toBe(true)
    expect(C.sylDirty).toBe(false)
    expect(C.saveWords().text, 'the bar no longer speaks of unsaved edits').not.toMatch(/unsaved/)
  })
  it('Save them saves into 149\'s Tracker, then picks', async () => {
    await onHis149Tracker()
    await dirty('PICK-SAVE')
    const p = pickSquadron('u142')
    await until(() => C.dlg); C.dlgClose(true); await p
    expect(C.sylDirty).toBe(false)
    expect(await stored('PICK-SAVE'), 'saved').toBe(true)
    expect(UNIT).toBe('u142')
    expect(trackerCover()).toBeNull()
  })
  it('nothing unsaved: no question, the pick made at once', async () => {
    await onHis149Tracker()
    void pickSquadron('u142')
    expect(C.dlg).toBeNull()
    expect(UNIT).toBe('u142')
  })
})

describe('the bell\'s tap that enters another squadron asks the same', () => {
  it('Hunter on 142 with 142\'s Tracker and an unsaved edit taps a 149 line: asked; after Save the tap goes on', async () => {
    setTrkUnitProbe(() => 'u142'); setPage('viewsched'); notify()
    await dirty('BELL-SAVE')
    const n = { id: 'tl2', to: PID.hunter, by: null, at: Date.now(), iid: '', name: '', day: '2026-07-15',
      what: [{ k: 'po', who: PID.osprey, o: 'none' }], u: 'u149' } as unknown as Notice
    openNotice(n)
    await until(() => C.dlg)
    expect(C.dlg.msg).toBe(QUESTION.replace('142?', '149?'))
    expect(UNIT, 'nothing entered while asked').toBe('u142')
    C.dlgClose(true)
    await until(() => UNIT === 'u149')
    expect(await stored('BELL-SAVE')).toBe(true)
    expect(CURPAGE, 'the tap landed').toBe('admin')
    expect(trackerCover(), 'no band (D2395)').toBeNull()
  })
})

describe('the member view and back keeps a draft (D2′ (b): hidden, never reset)', () => {
  it('Hunter\'s unsaved edit on 149\'s Tracker survives the member view and back', async () => {
    await onHis149Tracker()
    await dirty('MEMBER-DRAFT')
    setStorageHeld(true)      /* the door held for the draft, as the real follow does (msq-trk-follows-pick.test.tsx) */
    switchRoleView(); notify()
    expect(trackerCover()?.kind).toBe('member')
    expect(C.sylDirty).toBe(true)
    expect(C.byid['MEMBER-DRAFT']).toBeTruthy()
    switchRoleView(); notify()
    setStorageHeld(false)
    expect(trackerCover()).toBeNull()
    expect(C.sylDirty, 'the draft is still there').toBe(true)
    expect(C.byid['MEMBER-DRAFT']).toBeTruthy()
    await C.saveChangesClick()
  })
})

/* D2637 (23 Nov 26): A PICK OF A SQUADRON HE ONLY VIEWS ASKS TOO. Hunter, on his own 142 with its Tracker holding unsaved
   edits, holds View of 149. The pick leaves his own pages on 142, so D2318's test asked nothing, yet with 149 picked he is
   offered only its View-only Sched and Help (D2381): the edits waited unseen. The same question, buttons and ☰ menu step
   as D2318's. Red first: nothing was asked. The member-view switch is not a pick and asks nothing. */
describe('a pick of a squadron he only views (D2637)', () => {
  const Q149 = QUESTION.replace('142?', '149?')
  async function onHis142WithViewOf149() {
    if (UNIT !== 'u142') await pickSquadron('u142')
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull()
    signInAs('hunter')
    setTrkUnitProbe(() => 'u142'); setPage('viewsched'); notify()
    expect(UNIT).toBe('u142')
  }
  afterEach(() => { cleanup(); setDrawer(false) })
  it('asks first; Stay keeps everything and makes no pick', async () => {
    await onHis142WithViewOf149()
    await dirty('VIEW-STAY')
    const p = pickSquadron('u149')
    await until(() => C.dlg)
    expect(C.dlg.msg).toBe(Q149)
    expect([C.dlg.ok, C.dlg.alt, C.dlg.cancelLabel]).toEqual(['Save them', 'Discard them', 'Stay'])
    C.dlgClose(false); await p
    expect(UNIT, 'no pick').toBe('u142')
    expect(C.sylDirty).toBe(true)
    expect(C.byid['VIEW-STAY']).toBeTruthy()
    await C.saveChangesClick()
  })
  it('Discard them drops the edits, then picks 149', async () => {
    await onHis142WithViewOf149()
    await dirty('VIEW-DISCARD')
    const p = pickSquadron('u149')
    await until(() => C.dlg); C.dlgClose('__alt__'); await p
    expect(UNIT).toBe('u149')
    expect(C.sylDirty).toBe(false)
    expect(C.byid['VIEW-DISCARD']).toBeFalsy()
  })
  it('Save them saves into his own 142 Tracker, then picks 149', async () => {
    await onHis142WithViewOf149()
    await dirty('VIEW-SAVE')
    const p = pickSquadron('u149')
    await until(() => C.dlg); C.dlgClose(true); await p
    expect(C.sylDirty).toBe(false)
    expect(await stored('VIEW-SAVE'), 'saved').toBe(true)
    expect(UNIT).toBe('u149')
  })
  it('from the ☰ menu: the menu closes first, the question in sight', async () => {
    await onHis142WithViewOf149()
    await dirty('VIEW-MENU')
    render(<Drawer />)
    act(() => { setDrawer(true); notify() })
    fireEvent.click(document.querySelector<HTMLElement>('#drawerSqnBtn')!)
    fireEvent.click(document.querySelector<HTMLElement>('#drawerSqnList .sqm-row[data-unit="u149"]')!)
    await until(() => C.dlg)
    expect(C.dlg.msg).toBe(Q149)
    expect(DRAWER, 'the menu closed').toBe(false)
    C.dlgClose(false); await until(() => !C.dlg)
    expect(UNIT).toBe('u142')
    await C.saveChangesClick()
  })
  it('nothing unsaved: no question, the pick made at once, and the ☰ menu stays open (D2384)', async () => {
    await onHis142WithViewOf149()
    render(<Drawer />)
    act(() => { setDrawer(true); notify() })
    fireEvent.click(document.querySelector<HTMLElement>('#drawerSqnBtn')!)
    fireEvent.click(document.querySelector<HTMLElement>('#drawerSqnList .sqm-row[data-unit="u149"]')!)
    expect(C.dlg ?? null).toBeNull()
    expect(UNIT).toBe('u149')
    expect(DRAWER).toBe(true)
  })
  it('the member-view switch is not a pick: it asks nothing and keeps the edits', async () => {
    await onHis149Tracker()
    await dirty('VIEW-MEMBER')
    act(() => { switchRoleView(); notify() })
    expect(C.dlg ?? null, 'nothing asked').toBeNull()
    expect(C.sylDirty).toBe(true)
    act(() => { switchRoleView(); notify() })
    await C.saveChangesClick()
  })
})

/* [TRK-LEAVEFLOW-DISCARD] (23 Nov 26): "Discard them and …?" cleared the unsaved mark and reloaded nothing, so a next
   prompt cancelled left the dropped edits drawn, now marked saved. Red first: the ball stayed on the chart. */
describe('the Tracker\'s other Discard really drops the edits', () => {
  const nextQ = async (re: RegExp) => { await until(() => C.dlg && re.test(C.dlg.msg)) }
  async function discardThenCancel(start: () => Promise<unknown>, first: RegExp, then: RegExp, name: string) {
    setTrkUnitProbe(() => 'u142'); setPage('viewsched'); notify()
    await dirty(name)
    const p = start()
    await nextQ(first); C.dlgClose(true)
    await nextQ(then); C.dlgClose(C.dlg.input ? null : false)
    await p
    expect(C.byid[name], 'the dropped ball is off the chart').toBeFalsy()
    expect(C.sylDirty).toBe(false)
    expect(C.saveWords().text, 'the bar no longer speaks of unsaved edits').not.toMatch(/unsaved/)
    expect(await stored(name), 'and it never reached the store').toBe(false)
  }
  it('"…add a course?", the name then cancelled', () => discardThenCancel(() => C.addCourse(), /add a course\?/, /New course name/, 'LF-ADD'))
  it('"…rename the course?", the name then cancelled', () => discardThenCancel(() => C.renCourse(), /rename the course\?/, /^Rename course/, 'LF-REN'))
  it('"…add a new syllabus?", the name then cancelled', () => discardThenCancel(() => C.addSyl(), /add a new syllabus\?/, /Name for the new \(empty\)/, 'LF-SYL'))
  it('answering Cancel to the Discard keeps the edits', async () => {
    setTrkUnitProbe(() => 'u142'); setPage('viewsched'); notify()
    await dirty('LF-KEEP')
    const p = C.addCourse()
    await nextQ(/add a course\?/); C.dlgClose(false); await p
    expect(C.byid['LF-KEEP']).toBeTruthy()
    expect(C.sylDirty).toBe(true)
    await C.saveChangesClick()
  })
})

/* THE ☰ MENU'S PICK WITH UNSAVED CHART EDITS (the walk of 23 Nov 26, F2 — docs/handpass/2026-11-23-msq-view-only-menu.md):
   the question is drawn under the menu's panel, so a pick there that will ask closes the menu first — as its Logout does
   before the sign-out's same question — and the question is seen and answered where he is. Red first: the menu stayed
   open over the question. */
describe('the ☰ menu\'s pick (D2382–D2384) with unsaved chart edits', () => {
  afterEach(() => { cleanup(); setDrawer(false) })
  it('closes the menu so the question is seen; Stay keeps everything', async () => {
    await onHis149Tracker()
    await dirty('MENU-STAY')
    render(<Drawer />)
    act(() => { setDrawer(true); notify() })
    fireEvent.click(document.querySelector<HTMLElement>('#drawerSqnBtn')!)
    fireEvent.click(document.querySelector<HTMLElement>('#drawerSqnList .sqm-row[data-unit="u142"]')!)
    await until(() => C.dlg)
    expect(C.dlg.msg).toBe(QUESTION)
    expect(DRAWER, 'the menu closed, the question in sight').toBe(false)
    C.dlgClose(false); await until(() => !C.dlg)
    expect(UNIT, 'no pick').toBe('u149')
    expect(C.sylDirty).toBe(true)
    await C.saveChangesClick()
  })
  /* Astra's read of 23 Nov 26, finding 1 (…/briefs/2026-11-23-msq-view-only-read-astra.md): with 149's Tracker loaded, the
     member view makes 149 view only; his Leave War opened from the bell then was swallowed by the midnight check's
     re-entry, which landed on View-only Sched before the page's own check saw the page move */
  it('Astra 1: the member view on 149\'s Tracker, then his Leave War opened — 142 comes back, the Leave War open, at the first try', async () => {
    await onHis149Tracker()
    act(() => { switchRoleView(); notify() })
    expect(CURPAGE).toBe('viewsched')
    act(() => { setPage('leavewar'); notify() })
    expect(UNIT).toBe('u142')
    expect(CURPAGE).toBe('leavewar')
    act(() => { switchRoleView(); notify() })
  })
  it('a pick with nothing to ask leaves the menu open (D2384)', async () => {
    await onHis149Tracker()
    expect(C.sylDirty, 'the premise: nothing unsaved').toBe(false)
    expect(C.dlg ?? null, 'the premise: no question up').toBeNull()
    render(<Drawer />)
    act(() => { setDrawer(true); notify() })
    fireEvent.click(document.querySelector<HTMLElement>('#drawerSqnBtn')!)
    fireEvent.click(document.querySelector<HTMLElement>('#drawerSqnList .sqm-row[data-unit="u142"]')!)
    expect(UNIT).toBe('u142')
    expect(DRAWER).toBe(true)
  })
})
