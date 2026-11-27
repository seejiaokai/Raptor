// @vitest-environment jsdom
/* A BELL TAP THAT WAITED FOR THE TRACKER'S QUESTION IS JUDGED AGAIN WHEN IT GOES ON (the security read of the night's
   second fix round, F3 — docs/superpowers/briefs/2026-11-24-msq-night-fixread2-security.md; his D2310, D2218, D2223).
   A bell line, or the bell's own OIL question, pressed over unsaved chart edits asks "Save them before switching to …?"
   first and goes on once he answers. What it then opened was decided when he pressed, never looked at again:
   - Hunter holds Plan of 149 and is told, as its filer, of a change to Osprey's 149 input. He presses that line over
     unsaved edits on 142's Tracker; the question comes up. While it is up his Plan of 149 ends — by D2310 the line has
     left his bell. He answers Discard: Osprey's input opened all the same, shown to a man with no right left in 149;
   - the bell's own OIL question, answered by someone else while the Tracker's question is up, still opened the input
     with "Weekend/PH work — confirm your OIL", though nothing was left to ask;
   - and nothing checked that the person answering is the one who pressed (a belt: a sign-out answers the question
     "cancelled" today, so no road reaches it — pressed here by swapping the session under the question).
   Each goes on only where it would still be offered: the line still in his bell, the question still his, the same
   person signed in. Nothing new is said or drawn — it opens nothing.
   The harness is tracker/msq-bell-input-ask.test.tsx's. Red first: each window opened. */
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useMsqWorld, signInAs, ACCT, PID, SIGN } from '../test-support/msq-world'
import * as core from './app/core.js'
import * as st from './storage.js'
import { TrackerPage } from './TrackerPage'
import { Whiteboard } from '../storage/whiteboard'
import { trackerTarget } from '../storage/adapters'
import { saveAccess, signIn, sessionFor } from '../state/accounts'
import { SESSION, ME, setSession, setMe } from '../state/auth'
import { todayIso, removeGrant } from '../state/units'
import { pageUnit, setTrkUnitProbe } from '../state/perms'
import { notify, switchRoleView, switchRoleViewRaw } from '../state/store'
import { CURPAGE, setPage } from '../state/view'
import { pickSquadron } from '../state/pick'
import { UNIT } from '../engine/unitview'
import { HOOKS } from '../engine/hooks'
import { InputEditor } from '../ui/InputWindow'
import { INPEDIT, setInpEdit, OILASK, setOilAsk } from '../ui/pops'
import { openNotice, bellTap } from '../ui/topstate'
import { PEOPLE } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { noticeLive, type Notice } from '../state/notices'
import { oilPendingFor } from '../leavewar/sync'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const C: any = core
const S: any = st
const wb = new Whiteboard()
const tick = () => new Promise(r => setTimeout(r, 0))
const until = async (f: () => any) => { for (let i = 0; i < 800; i++) { if (f()) return; await tick() } throw new Error('timed out waiting') }
const settle = async () => { for (let i = 0; i < 4; i++) { await C.whenUnitSettled?.(); await C.whenLoaded(); await tick() } }
const pick = async (u: string) => { await act(async () => { await pickSquadron(u); await settle() }) }

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
  await act(async () => { setInpEdit(null); setOilAsk(null); notify(); await settle() })
  if (C.dlg) await act(async () => { C.dlgClose(false); await settle() })
  if (C.sylDirty) await act(async () => { await C.discardForTests?.(); })
  if (C.arrangeMode) act(() => { C.toggleArrange() })
  if (S.storageUnit() !== 'u142') await pick('u142')
  act(() => { setPage('viewsched'); notify() })
})

/* an unsaved chart edit on the Tracker as it stands */
async function chartEdit(name: string) {
  await act(async () => {
    if (!C.arrangeMode) C.toggleArrange()
    const p = C.addModule('acad'); await until(() => C.dlg); C.dlgClose(name); await p
    C.toggleArrange()
    await settle()
  })
  expect(C.sylDirty, 'the premise: an unsaved chart edit').toBe(true)
}
/* Hunter on 149 with an unsaved chart edit, in the member view: the Tracker held on 149 (B1's own premise) */
async function heldDraft(name: string) {
  await pick('u149')
  await chartEdit(name)
  /* REACHED BY NO PRESS SINCE D2627 A20 (step K5): the switch now asks about unsaved chart edits first, so the held draft
     is made by the raw switch (state/store.ts switchRoleViewRaw — the switch as it was, asking nothing), named so */
  await act(async () => { switchRoleViewRaw(); await settle() })
  expect([S.storageUnit(), UNIT, CURPAGE], 'the premise: the Tracker held on 149, he on its View-only Sched').toEqual(['u149', 'u149', 'viewsched'])
}
const answer = async (v: unknown) => { await act(async () => { C.dlgClose(v); await tick(); await tick() }) }
const plant = (r: any) => { const row: any = { allday: true, s: 0, e: 1439, remarks: '', mod: 'now', yr: 2026, ...r }; INPUTS.unshift(row); return row }
/* someone else acts while the question is up — the shared store's news, with no sign-out here (a sign-out answers the
   question "cancelled"): the session is put back as it was */
function asOther<T>(who: 'saber' | 'ranger', body: () => T): T {
  const s0 = SESSION, m0 = ME
  const s = sessionFor(signIn(SIGN[who][0], SIGN[who][1]))
  setSession(s); setMe(s.pid)
  try { return body() } finally { setSession(s0); setMe(m0) }
}
/* back to an admin on 142 with nothing unsaved, whatever the test left */
async function tidy() {
  await act(async () => { setInpEdit(null); setOilAsk(null); notify(); await settle() })
  if (C.dlg) await answer(false)
  if (C.sylDirty) await act(async () => { await C.discardForTests?.(); await settle() })
}

describe('a bell line pressed over unsaved chart edits, the right behind it ended while the question was up (F3)', () => {
  /* he was told as the filer of Osprey's 149 input — a line that stays only while a right in 149 holds (D2223, D2310) */
  /* (its kind 'rmk' — "its remark changed", a kind an input's line is written with: until step K6 this line carried 'chg',
     which no notice is written with, and the tap took any kind it did not know for an input's; it now only reads such a
     line — the guard rail's plan §4.5, Opus F-g — so the line is given a real kind, every assertion as it was) */
  const filerLine = (row: any): Notice => ({ id: 'f3-' + row.iid, to: PID.hunter, by: PID.osprey, at: Date.now(), iid: row.iid, name: '', day: '2026-07-15',
    what: [{ k: 'rmk' }], fu: ['u149'], u: 'u149' } as unknown as Notice)

  it('Plan of 149 taken while "Save them before switching to 149?" is up: Discard opens nothing of 149\'s', async () => {
    await chartEdit('F3-ENDED')
    const row = plant({ iid: 'f3-osprey', person: PID.osprey, type: 'ATT C', date: 'Jul 15', by: PID.hunter })
    const line = filerLine(row)
    expect(noticeLive(line), 'the premise: the line is in his bell').toBe(true)
    await act(async () => { openNotice(line); await tick() })
    expect(C.dlg?.msg, 'the premise: the question is asked').toContain('Save them before switching to 149?')
    expect(asOther('saber', () => removeGrant(ACCT.hunter, 'u149')), 'Saber takes his Plan of 149').toMatchObject({ ok: true })
    expect(noticeLive(line), 'the premise: the line has left his bell (D2310)').toBe(false)
    await answer('__alt__')   /* Discard them */
    await act(async () => { await settle() })
    expect(INPEDIT, 'no window: Osprey\'s input is not shown to him').toBeNull()
    expect(UNIT, 'and he is not moved').toBe('u142')
    expect(CURPAGE, 'nor his page').toBe('viewsched')
    await tidy()
  })

  it('(control) the Plan still his: Discard enters 149 and opens the line\'s input', async () => {
    await chartEdit('F3-KEPT')
    const row = plant({ iid: 'f3-osprey-2', person: PID.osprey, type: 'ATT C', date: 'Jul 15', by: PID.hunter })
    await act(async () => { openNotice(filerLine(row)); await tick() })
    expect(C.dlg?.msg).toContain('Save them before switching to 149?')
    await answer('__alt__')
    await act(async () => { await settle() })
    expect([UNIT, CURPAGE]).toEqual(['u149', 'inputs'])
    expect(INPEDIT?.iid).toBe(row.iid)
    await tidy()
    await pick('u142')
  })
})

describe('the bell\'s own OIL question, pressed in the member view over a held draft (F3, the OIL door) — reached by no press since D2627 A20, by the raw switch', () => {
  const SAT = '2026-07-18'
  async function asked() {
    await heldDraft('F3-OIL')
    const row = plant({ iid: 'f3-oil', person: PID.hunter, type: 'Duty', date: 'Jul 18' })
    expect(oilPendingFor(PID.hunter).map(h => h.iid), 'the premise: his own weekend duty waits for an OIL answer').toContain(row.iid)
    await act(async () => { bellTap(); await tick() })
    expect(C.dlg?.msg, 'the premise: the question is asked').toContain('Save them before switching to 142?')
    expect(INPEDIT, 'nothing opens under the question').toBeNull()
    return row
  }
  const saidOil = () => (HOOKS.toast as any).mock.calls.some((c: any[]) => /confirm your OIL/.test(String(c[0])))

  it('answered by someone else while the question is up: Discard opens no window and says nothing about OIL', async () => {
    const row = await asked()
    row.oil = { [SAT]: 0 }   /* an admin's No, arrived meanwhile — an explicit 0 is an answer */
    expect(oilPendingFor(PID.hunter).map(h => h.iid), 'the premise: nothing left to ask').not.toContain(row.iid)
    await answer('__alt__')
    await act(async () => { await settle() })
    expect(INPEDIT, 'no window for a question that is gone').toBeNull()
    expect(OILASK, 'and no OIL question left armed for the next window').toBeNull()
    expect(saidOil(), '"confirm your OIL" is not said').toBe(false)
    await tidy()
    await act(async () => { if (CURPAGE !== 'viewsched') setPage('viewsched'); notify(); await settle() })
  })

  it('a different person signed in when the answer comes: nothing opens for him', async () => {
    const row = await asked()
    const s0 = SESSION, m0 = ME
    const s = sessionFor(signIn(SIGN.ranger[0], SIGN.ranger[1]))
    setSession(s); setMe(s.pid)
    try {
      await answer('__alt__')
      await act(async () => { await settle() })
      expect(INPEDIT, 'Hunter\'s input is not opened under Ranger').toBeNull()
      expect(OILASK).toBeNull()
    } finally { setSession(s0); setMe(m0) }
    expect(row.oil, 'nothing was answered').toBeUndefined()
    await tidy()
  })

  it('(control) still his to answer: Discard lands on his own Inputs with the input open and its OIL question armed', async () => {
    const row = await asked()
    await answer('__alt__')
    await act(async () => { await settle() })
    expect([CURPAGE, UNIT]).toEqual(['inputs', 'u142'])
    expect(INPEDIT?.iid).toBe(row.iid)
    expect(saidOil()).toBe(true)
    await tidy()
    await act(async () => { switchRoleView(); await settle() })
  })
})
/* (PEOPLE is read only so the planted inputs name real people) */
void PEOPLE
