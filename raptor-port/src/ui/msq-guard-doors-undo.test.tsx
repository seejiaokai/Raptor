// @vitest-environment jsdom
/* THE UNDO THAT WOULD CHANGE THE SQUADRON IN VIEW — the guard rail's step K8 (the plan,
   docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §4.1 rows 13 and 21, §4.6's Undo ending and the leads it may
   join, §4.7's B23 and B24, §21.1's K8 row; the brief docs/superpowers/briefs/2026-11-27-msq-s1-k8-brief.md). Beside
   ui/msq-guard-doors.test.tsx (the pick's, K4), -switch (the view switch's, K5) and -bell (the bell's and the page door's,
   K6), in their shape, their world and their kit.

   His rulings: D2654 E7 (the Undo of "+ New squadron" while that squadron is in view is refused in Build 1 while a window
   that counts is open, a row holds a change or a save has failed — and only then), D2590 (the grey "Blocked:" note), D2627
   A13 (the Retry note), D2729 (the section page's group 5: under Undo on a desktop, at the foot on a phone; a lead that would
   add a step to Undo offers only its Cancel half), D2630 (three squadrons in the picker).

   EVERY PRESS IS THE WHOLE SEQUENCE ON THE REAL CONTROLS where a control reaches it: "+ New squadron" filled in and saved,
   the squadron picked from the top bar's list, the window opened by its own door, then the top bar's Undo (#undoBtn) or Redo
   (#redoBtn). Two roads no button reaches are belts, named so: an Undo whose landing would bring his own squadron back
   (row 13 — on a squadron he only views the View-only Sched draws no Undo), driven through the engine the Undo button calls
   (ui/topstate.ts globalUndoEngine); and a Redo whose step would take the squadron in view away (no command's step does),
   asked of the Undo's own hook with a made-up step (state/undo-wire.ts _squadronRefusal). The note's words are read from
   the tables (guardWords, GUARD_LEADS, GUARD_UNDO_LEADS, GUARD_ENDINGS), never typed here. Written FIRST and seen failing on
   the code as it stood (the Undo went through, 151 gone from under him, with the window open), but for the tests marked pins.

   The world: three squadrons (test-support/msq-world.ts withThird — 150's id is third.u150). Saber the master admin makes
   151 here; Ranger 142's member with View of 149. Wed 15 Jul 26. */
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { act, fireEvent } from '@testing-library/react'
import { withThird, PID, third, signInAs, moveMan, pastMidnight } from '../test-support/msq-world'
import { UNIT } from '../engine/unitview'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { VCONF, ruleFmt } from '../engine/rules'
import { CURPAGE, AVAILWIN, CHGWIN, setPage } from '../state/view'
import { LGEDIT } from '../state/auth'
import { units, unitsLoad, homeOn, todayIso } from '../state/units'
import { _timelineEntries, undoState } from '../undo/timeline'
import { _squadronRefusal } from '../state/undo-wire'
import { setGuardSay, setGuardClose, type GuardOpts } from '../state/guard'
import { guardSay, noteAtFor } from './guardnote'
import { globalUndoEngine } from './topstate'
import { commitNewInput } from './inputedit'
import { clearToast } from './toast'
import { setInpEdit, setInsights, INSIGHTS } from './pops'
import { whatIsOpen, guardWords, guardCloseShown, GUARD_LEADS, GUARD_UNDO_LEADS, GUARD_ENDINGS } from './guard'
import {
  $, OPEN, SHOWN, app, doing, press, typeIn, goAdmin, guardTeardown, topPick, note, nothingHeld, saver, openQualsNew, drawnBox, settle,
} from '../test-support/msq-guard-testkit'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()

/* what the seam was handed at each refusal: the door and its opts */
const said: { door: string; opts: GuardOpts }[] = []
beforeEach(() => {
  said.length = 0
  setGuardSay((r, d, t, o) => { said.push({ door: d, opts: o }); guardSay(r, d, t, o) })
})
afterEach(async () => {
  setGuardSay(guardSay)
  await guardTeardown()
  clearToast()
  document.getElementById('toastEl')?.remove()
  document.getElementById('srSay')?.remove()
})

const toasts = (): Array<[string, string]> => (HOOKS.toast as any).mock.calls.map((c: any[]) => [String(c[0]), String(c[1])])
/** the Undo list as it stands: each step, and whether it is undone */
const undoList = () => _timelineEntries().map(e => `${e.seq}:${e.label}:${e.undone ? 'undone' : 'done'}`)
const hasUnit = (id: string) => { unitsLoad(); return units().some(u => u.id === id) }

/* ---- the presses ---- */
/** Saber makes 151 by "+ New squadron" on Admin → Squadrons (its number, its first admin), saved by its own Save; its id */
async function saberMakes151(): Promise<string> {
  await app('saber')
  await goAdmin('Squadrons')
  await press($('#sqNew'), '+ New squadron')
  await typeIn('#sqNewNum', '151')
  const admin = [...document.querySelectorAll<HTMLOptionElement>('#sqNewAdmin option')].find(o => o.value)
  expect(admin, 'the premise: a first admin to pick').toBeTruthy()
  await typeIn('#sqNewAdmin', admin!.value)
  await press($('#sqNewSave'), 'Save')
  unitsLoad()
  const made = units().find(u => u.num === '151')
  expect(made, 'the premise: 151 made').toBeTruthy()
  expect(undoState().undoLabel, 'the premise: the newest step is "+ New squadron"').toBeTruthy()
  return made!.id
}
/** …then picks it from the top bar's list */
async function saberOn151(): Promise<string> {
  const id = await saberMakes151()
  await topPick(id)
  expect(UNIT, 'the premise: 151 in view').toBe(id)
  return id
}
/** the note the tables say an Undo refused now takes — read before the press */
function undoNote(): string {
  const w = whatIsOpen()
  expect(w, 'the premise: something refuses').not.toBeNull()
  const words = guardWords(w!.reason, w!.row, 'undo', '')
  expect(words, 'the premise: the Undo has words for it').toBeTruthy()
  return words!
}
/** the top bar's Undo pressed under a refusal: nothing changed, the note under the Undo button, no second note */
async function refusedUndo(id: string, lead: string) {
  const list = undoList(), label = undoState().undoLabel, page = CURPAGE, open = whatIsOpen()?.row.id
  const words = undoNote()
  expect(words, 'the note joins the lead the Undo ending takes').toBe(`Blocked: ${lead}, then ${GUARD_ENDINGS.undo}`)
  const before = toasts().length
  await press($('#undoBtn'), 'the top bar\'s Undo')
  expect(hasUnit(id), '151 still there').toBe(true)
  expect([UNIT, CURPAGE], '151 still in view, the page as it was').toEqual([id, page])
  expect(undoList(), 'the Undo list as it was').toEqual(list)
  expect(undoState().undoLabel, 'the same step on top').toBe(label)
  expect(note(), 'the note').toBe(words)
  expect(said.at(-1), 'the Undo\'s door, pressed on the bar').toEqual({ door: 'undo', opts: { from: 'bar' } })
  expect(noteAtFor('undo').under()?.id, 'it stands under the top bar\'s Undo').toBe('undoBtn')
  expect(toasts().slice(before).filter(([, k]) => k === 'warn'), 'the Undo\'s engine says nothing more — one note').toEqual([])
  expect(whatIsOpen()?.row.id, 'what was open still open').toBe(open)
  nothingHeld()
}

/* ================= B24 — the Undo of "+ New squadron" while that squadron is in view (row 21, D2654 E7) ================= */
describe('B24 — an Undo that would take the squadron in view away is refused while something is open (D2654 E7)', () => {
  it('Saber makes 151, picks it, opens the Calendar there with a holiday half typed, presses Undo: refused — 151 still there and in view, the Undo list as it was, "…cancel the new holiday, then press Undo again." under Undo', async () => {
    const id = await saberOn151()
    await OPEN.holiday!.open()
    expect(whatIsOpen()?.row.id, 'the premise: the half-typed holiday counts').toBe('holiday')
    await refusedUndo(id, GUARD_UNDO_LEADS.holidayNew)
    expect($('[data-testid="win-holiday"]'), 'the holiday form still open').not.toBeNull()
  })
  it('with an opened row changed (142\'s row on Admin → Squadrons, a place typed): "…cancel the open row, then press Undo again."', async () => {
    const id = await saberOn151()
    await OPEN.sqnmove!.open()
    expect(whatIsOpen()?.row.id, 'the premise: the row counts').toBe('sqnmove')
    await refusedUndo(id, GUARD_UNDO_LEADS.row)
  })
  it('with the OIL list open (drawn over every page): "…close the open window, then press Undo again." — the lead as it is', async () => {
    const id = await saberOn151()
    await OPEN.oilday!.open()
    await refusedUndo(id, GUARD_LEADS.window)
  })
  it('with a failed save: "…press Retry to save your changes, then press Undo again." (a Retry re-sends the change and adds no step); Retry lands, Undo again: through', async () => {
    const id = await saberOn151()
    await OPEN.unsaved!.open()
    await refusedUndo(id, GUARD_LEADS.retry)
    await OPEN.unsaved!.outs['Retry landed']!()
    await press($('#undoBtn'), 'the top bar\'s Undo again')
    expect(hasUnit(id), '151 gone').toBe(false)
    expect(UNIT, 'the bar on 142').toBe('u142')
  })
  it('(control, as today) with nothing open: the Undo goes through — 151 gone, the bar on 142', async () => {
    const id = await saberOn151()
    expect(whatIsOpen(), 'the premise: nothing open').toBeNull()
    await press($('#undoBtn'), 'the top bar\'s Undo')
    expect(hasUnit(id), '151 gone').toBe(false)
    expect(UNIT, 'the bar on 142').toBe('u142')
    expect(said, 'no note').toEqual([])
  })
  it('(control) 151 made but not picked, a holiday half typed on 142: the Undo goes through — nothing in view is taken away', async () => {
    const id = await saberMakes151()
    expect(UNIT, 'the premise: 142 in view').toBe('u142')
    await OPEN.holiday!.open()
    await press($('#undoBtn'), 'the top bar\'s Undo')
    expect(hasUnit(id), '151 gone').toBe(false)
    expect(UNIT).toBe('u142')
    expect(said, 'no note').toEqual([])
  })
  /* REDO'S TWIN. Every Redo of "+ New squadron" puts the squadron back: none takes the squadron in view away, so the real
     road is a pin that the Redo goes through as today; the hook's Redo half is asked of a made-up step (a belt) */
  it('(pin, the Redo\'s real road) Undo with nothing open, then a holiday half typed on 142, then Redo: through — 151 back, 142 still in view, the form still open', async () => {
    const id = await saberOn151()
    await press($('#undoBtn'), 'the top bar\'s Undo')
    expect([hasUnit(id), UNIT], 'the premise: 151 gone, on 142').toEqual([false, 'u142'])
    await OPEN.holiday!.open()
    await press($('#redoBtn'), 'the top bar\'s Redo')
    expect(hasUnit(id), '151 back').toBe(true)
    expect(UNIT, '142 still in view').toBe('u142')
    expect($('[data-testid="win-holiday"]'), 'the form still open').not.toBeNull()
    expect(said, 'no note').toEqual([])
  })
  it('(a belt) the hook asked of a Redo whose step would take the squadron in view away, something open: refused, nothing said (its ending, "…press Redo again.", is not his yet); nothing open: not refused', async () => {
    const id = await saberOn151()
    const step: any = { id: 'k8-redo', label: 'x', scope: { module: 'settings' }, actor: { role: 'admin' }, contexts: [],
      forward: [{ collection: 'settings', id: 'unit:' + id, op: 'delete', before: { id, num: '151', kind: 'sqn' }, after: null }], inverse: [] }
    expect(_squadronRefusal(step, 'redo'), 'nothing open: not refused').toBeNull()
    await OPEN.holiday!.open()
    expect(_squadronRefusal(step, 'redo'), 'something open: refused').toBeTruthy()
    expect(said.at(-1)?.door, 'the Redo\'s own door').toBe('redo')
    expect(note(), 'nothing said').toBe('')
    expect([UNIT, hasUnit(id)], 'nothing changed').toEqual([id, true])
    /* and the Undo half reads the step's inverse, never its forward */
    expect(_squadronRefusal(step, 'undo'), 'the Undo of it would put the row back: not this hook\'s').toBeNull()
  })
})

/* ================= B23 extended — an Undo whose landing would bring his own squadron back (row 13; a belt) ============= */
describe('B23 (row 13) — an Undo or Redo whose landing would bring his own squadron back is refused BEFORE its step (a belt: no button reaches it)', () => {
  /** Ranger files a leave of his own on 142 (an Undo step on his own Inputs), then picks 149, which he only views */
  async function rangerFiledThen149(): Promise<any> {
    await app('ranger')
    const had = new Set(INPUTS)
    await doing(() => {
      expect(commitNewInput({ allday: true, half: '', sTime: '', eTime: '', remarks: '', sans: null, docIds: [], person: PID.ranger, type: 'LL', start: '2026-07-27', end: '2026-07-27' } as any), 'the premise: his leave filed').toBe(true)
    })
    const x = INPUTS.find((r: any) => !had.has(r))
    expect(x, 'the premise: his leave in the list').toBeTruthy()
    await topPick('u149')
    expect([UNIT, CURPAGE], 'the premise: 149\'s View-only Sched').toEqual(['u149', 'viewsched'])
    expect(undoState().canUndo, 'the premise: his own page\'s step is his to undo from here').toBe(true)
    return x
  }
  const undo = () => doing(() => { globalUndoEngine().undo() })
  const redo = () => doing(() => { globalUndoEngine().redo() })
  it('a change not saved: refused before the step — his leave still filed, the Undo list as it was, 149 still in view, the Retry note with "…press Undo again."; the page door\'s own refusal never reached', async () => {
    const x = await rangerFiledThen149()
    await OPEN.unsaved!.open()
    const list = undoList(), words = undoNote(), before = toasts().length
    expect(words).toBe(`Blocked: ${GUARD_LEADS.retry}, then ${GUARD_ENDINGS.undo}`)
    await undo()
    expect(INPUTS.includes(x), 'his leave still filed — nothing half applied').toBe(true)
    expect(undoList(), 'the Undo list as it was').toEqual(list)
    expect([UNIT, CURPAGE], 'nothing moved').toEqual(['u149', 'viewsched'])
    expect(note(), 'the note').toBe(words)
    expect(said.map(s => s.door), 'asked once, by the Undo\'s own door — never at the landing\'s page door (K7b\'s stepPage)').toEqual(['undo'])
    expect(toasts().slice(before).filter(([, k]) => k === 'warn'), 'one note').toEqual([])
  })
  it('a window open (his own input\'s window, drawn over every page): "…close the open window, then press Undo again.", nothing applied', async () => {
    const x = await rangerFiledThen149()
    /* (put up by its own setter, as the bell's OIL tap opens it over the page he is on — the belt's road has no button) */
    await doing(() => { setInpEdit(x) })
    expect(whatIsOpen()?.row.id, 'the premise: the window counts on 149').toBe('inputdlg')
    const list = undoList()
    await undo()
    expect([INPUTS.includes(x), undoList(), UNIT], 'nothing applied, nothing moved').toEqual([true, list, 'u149'])
    expect(note()).toBe(`Blocked: ${GUARD_LEADS.window}, then ${GUARD_ENDINGS.undo}`)
    expect(said.map(s => s.door)).toEqual(['undo'])
  })
  it('(control) nothing open: the Undo goes through — his leave gone, 142 back on his Inputs (the landing, after the step\'s writes)', async () => {
    const x = await rangerFiledThen149()
    await undo()
    expect(INPUTS.includes(x), 'his leave undone').toBe(false)
    expect([UNIT, CURPAGE]).toEqual(['u142', 'inputs'])
    expect(said, 'no note').toEqual([])
  })
  it('Redo\'s twin: undone, 149 picked again, a change not saved, Redo: refused before the step — the leave still gone, the list as it was, nothing said (…press Redo again. is not his yet); nothing open: through, 142 back on his Inputs', async () => {
    const x = await rangerFiledThen149()
    await undo()
    expect(INPUTS.includes(x), 'the premise: undone').toBe(false)
    await topPick('u149')
    expect([UNIT, CURPAGE], 'the premise: 149 again').toEqual(['u149', 'viewsched'])
    expect(undoState().canRedo, 'the premise: the Redo is his').toBe(true)
    await OPEN.unsaved!.open()
    const list = undoList(), count = INPUTS.length, before = toasts().length
    /* (the Undo's own "Undid: …" bubble put away, so the note box is read empty before the Redo) */
    clearToast()
    expect(note(), 'the premise: no note up').toBe('')
    await redo()
    expect([INPUTS.length, undoList(), UNIT, CURPAGE], 'nothing applied, nothing moved').toEqual([count, list, 'u149', 'viewsched'])
    expect(said.map(s => s.door), 'the Redo\'s own door, once').toEqual(['redo'])
    expect(note(), 'nothing said').toBe('')
    expect(toasts().slice(before).filter(([, k]) => k === 'warn'), 'no other note either').toEqual([])
    await OPEN.unsaved!.outs['Retry landed']!()
    await redo()
    expect(INPUTS.some((r: any) => r.iid === x.iid), 'his leave back').toBe(true)
    expect([UNIT, CURPAGE]).toEqual(['u142', 'inputs'])
  })
})

/* ================= K8c — an Undo that changes the squadron in view closes what the guard closes ================= */
/* THE FAULT K8 LEFT (question 27's words check, P1; the brief docs/superpowers/briefs/2026-11-27-msq-s1-k8c-brief.md): the
   Undo of "+ New squadron" with 151 in view is let through while only a window that shows things is open, or Logic's or
   Quals' edit mode is on (those close or end — D2596, D2597, D2627 A4) — and 142 then came into view by the store's own
   re-entry (state/store.ts maybeReenter), which closes nothing. The step lands on Admin → Squadrons, and that page change
   already shut every window tied to its page (ALL AVAIL, Changes, a SANS day — state/view.ts setPage) and unmounted Quals
   with its mode: those are pins here. What it did not reach: Insights (drawn over every page) stood over 142, Logic's mode
   (kept by the app, not the page) stayed on, and a value typed on Logic for 151, still waiting its beat, landed on 142's
   rules. Now the Undo's own hook, once the guard has let it through, runs the guard's closing step BEFORE the step's
   writes (state/undo-wire.ts squadronRefusal) — row 21's road only. Written first and seen failing, but for the pins. */
describe('K8c — the Undo of "+ New squadron" that the guard lets through closes the windows that only show things and ends the two edit modes, before its writes', () => {
  /** the top bar's Undo, let through: 151 gone, 142 in view */
  async function undoThrough(id: string) {
    await press($('#undoBtn'), 'the top bar\'s Undo')
    expect(hasUnit(id), '151 gone').toBe(false)
    expect(UNIT, '142 in view').toBe('u142')
    expect(said, 'not refused: no note').toEqual([])
  }
  it('(pin — the landing\'s page change already shuts it) ALL AVAIL open on 151\'s Edit Schedule, Undo: through, and the window is shut once 142 is in view', async () => {
    const id = await saberOn151()
    await SHOWN.avail!.open()
    expect([!!AVAILWIN, whatIsOpen()], 'the premise: ALL AVAIL up, nothing that refuses').toEqual([true, null])
    await undoThrough(id)
    expect(AVAILWIN, 'ALL AVAIL shut').toBeNull()
    expect(drawnBox('.availwin'), 'not drawn').toBe(false)
  })
  it('(pin — the landing\'s page change already shuts it) Changes open, Undo: through, the window shut', async () => {
    const id = await saberOn151()
    await SHOWN.chg!.open()
    expect([!!CHGWIN, whatIsOpen()], 'the premise: Changes up, nothing that refuses').toEqual([true, null])
    await undoThrough(id)
    expect(CHGWIN, 'Changes shut').toBeNull()
    expect(drawnBox('.chgwin'), 'not drawn').toBe(false)
  })
  it('Insights open, Undo: through, the window shut', async () => {
    const id = await saberOn151()
    await SHOWN.insights!.open()
    expect([INSIGHTS, whatIsOpen()], 'the premise: Insights up, nothing that refuses').toEqual([true, null])
    await undoThrough(id)
    expect(INSIGHTS, 'Insights shut').toBe(false)
  })
  it('(pin — the landing\'s page change already shuts it) a SANS day open on 151\'s SANS calendar, Undo: through, the day shut', async () => {
    const id = await saberOn151()
    await SHOWN.sansday!.open()
    expect([!!$('[data-testid="win-sansday"]'), whatIsOpen()], 'the premise: the SANS day up, nothing that refuses').toEqual([true, null])
    await undoThrough(id)
    expect($('[data-testid="win-sansday"]'), 'the SANS day shut').toBeNull()
  })
  it('Logic\'s edit mode on, nothing typed, Undo: through, the mode off', async () => {
    const id = await saberOn151()
    await doing(() => setPage('logic'))
    await press($('#lgEdit'), 'Logic\'s ✎ Edit')
    expect([!!LGEDIT, whatIsOpen()], 'the premise: the mode on, nothing that refuses').toEqual([true, null])
    await undoThrough(id)
    expect(!!LGEDIT, 'the mode off').toBe(false)
    /* (the step lands on Admin → Squadrons; Logic opened again on 142) */
    await doing(() => setPage('logic'))
    expect([$('#lgEdit')?.hidden, $('#lgDone')?.hidden], '142\'s Logic opens with ✎ Edit, not Done').toEqual([false, true])
  })
  /* THE HARD CASE, AS CHOSEN (the K8c report): the mode's end writes the value still waiting its beat as its own step, for
     151, while 151 is still in view — the Undo has already chosen "+ New squadron", so it still takes that back, never
     the value; the value's step stays in the Undo list as 151's, out of reach on 142, and comes back with 151 */
  it('Logic\'s edit mode on with "13h" just typed in Crew rest (still waiting its beat), Undo: the value written for 151 as its own step, the Undo still takes "+ New squadron" back, 142\'s rules untouched — a beat later too; Redo and 151 picked: it reads 13h', async () => {
    const id = await saberOn151()
    await doing(() => setPage('logic'))
    await press($('#lgEdit'), 'Logic\'s ✎ Edit')
    const box = $('input[data-lgset="crewRest"]') as HTMLInputElement
    expect(box, 'Crew rest\'s box').not.toBeNull()
    expect(VCONF.crewRest, 'the premise: 12h on 151').toBe(720)
    const made = _timelineEntries().find(e => !e.undone && e.forward.some(c => String(c.id) === 'unit:' + id))
    expect(made, 'the premise: "+ New squadron" on the Undo list').toBeTruthy()
    /* typed and left for the Undo button in one moment — the box's change raised as the keyboard leaves it, the press then,
       before the value's beat (as the browser does it; a press in a later turn would find the value applied, and its step
       the newest — the Undo would rightly take that back first) */
    const undoBtn = $('#undoBtn')!
    act(() => {
      box.focus(); box.value = ruleFmt('crewRest', 780); fireEvent.change(box)
      expect(VCONF.crewRest, 'the premise: still waiting its beat').toBe(720)
      fireEvent.pointerDown(undoBtn); fireEvent.mouseDown(undoBtn); fireEvent.mouseUp(undoBtn); fireEvent.click(undoBtn)
    })
    await settle()
    expect(hasUnit(id), '151 gone').toBe(false)
    expect(UNIT, '142 in view').toBe('u142')
    expect(said, 'not refused: no note').toEqual([])
    expect(made!.undone, 'the Undo took "+ New squadron" back').toBe(true)
    const rulesStep = _timelineEntries().find(e => e.seq > made!.seq && e.forward.some(c => String(c.id) === `${id}@rules`))
    expect(rulesStep, 'the value written for 151, as its own step').toBeTruthy()
    expect((rulesStep!.forward.find(c => String(c.id) === `${id}@rules`)!.after as any)?.v?.crewRest, '13h, for 151').toBe(780)
    expect(rulesStep!.undone, 'the value\'s step not undone').toBe(false)
    expect([!!LGEDIT, VCONF.crewRest], 'the mode off, 142 reads 12h').toEqual([false, 720])
    await act(async () => { await new Promise(r => setTimeout(r, 5)) })
    expect(VCONF.crewRest, '142 reads 12h a beat later — nothing waiting landed on 142').toBe(720)
    await press($('#redoBtn'), 'the top bar\'s Redo')
    expect(hasUnit(id), '151 back').toBe(true)
    await topPick(id)
    expect(VCONF.crewRest, '151 reads 13h').toBe(780)
  })
  it('(pin — the landing\'s page change unmounts Quals, its mode with it) Quals\' edit mode on, words typed in "Add qualification" and then hidden by "✕ Edit quals" (so they do not refuse), Undo: through, the mode off and the words gone — back on Quals', async () => {
    const id = await saberOn151()
    await openQualsNew('LOW LEVEL')
    await press($('#qEditQuals'), '✕ Edit quals')
    expect(whatIsOpen(), 'the premise: the hidden words do not refuse').toBeNull()
    await undoThrough(id)
    await doing(() => setPage('quals'))
    expect($('#qEdit')?.hidden, '✎ Edit back: the mode off').toBe(false)
    expect($('#qSave')?.hidden, 'no Done').toBe(true)
    await press($('#qEdit'), '✎ Edit')
    await press($('#qEditQuals'), 'Edit quals')
    expect(($('#qNewQual') as HTMLInputElement).value, 'the words gone').toBe('')
  })
  /* ---- the pins: the roads that change nothing today, and must not ---- */
  /* (Insights, not ALL AVAIL: this Undo lands on Admin → Squadrons, and that page change shuts ALL AVAIL by its own rule, as
     it always has — state/view.ts setPage. Insights is drawn over every page, so it shows the closing step is not run) */
  it('(pin) an ordinary Undo, the squadron in view unchanged (151 made but not picked), Insights open on 142: through, Insights still open, the closing step not run', async () => {
    const shut = vi.fn(guardCloseShown)
    setGuardClose(shut)
    const id = await saberMakes151()
    await SHOWN.insights!.open()
    expect(INSIGHTS, 'the premise').toBe(true)
    await press($('#undoBtn'), 'the top bar\'s Undo')
    expect([hasUnit(id), UNIT], '151 gone, 142 in view as before').toEqual([false, 'u142'])
    expect(INSIGHTS, 'Insights still open').toBe(true)
    expect(shut, 'the closing step not run').not.toHaveBeenCalled()
  })
  it('(pin, A14) his own move at midnight with ALL AVAIL and Insights open: the guard\'s closing step never run — Insights stays; ALL AVAIL goes by itself, as P18 pinned', async () => {
    const shut = vi.fn(guardCloseShown)
    setGuardClose(shut)
    signInAs('saber'); expect(moveMan(PID.hunter, third.u150).ok).toBe(true)
    await app('hunter')
    await SHOWN.avail!.open()
    await SHOWN.insights!.open()
    expect([!!AVAILWIN, INSIGHTS], 'the premise').toEqual([true, true])
    await act(async () => { pastMidnight() }); await doing(() => {})
    expect(homeOn(PID.hunter, todayIso()), 'the premise: moved').toBe(third.u150)
    expect({ avail: !!AVAILWIN, insights: INSIGHTS }, 'as today (P18)').toEqual({ avail: false, insights: true })
    expect(shut, 'closeShown never run on a change he did not make').not.toHaveBeenCalled()
  })
  /* ROW 13 (a belt: no button reaches it — on a squadron he only views the View-only Sched draws no Undo), driven as B23
     drives it, through the engine the Undo button calls. Its landing enters his own squadron by the page door's landing,
     which closes the windows itself (state/store.ts landOwn, after the Tracker's question, so a Stay closes nothing) — so
     K8c adds nothing to this road; a pin that it stays so */
  it('(belt, row 13 — pin) Ranger\'s own leave filed on 142, 149 picked, Insights open, the Undo through the engine: through — his leave gone, 142 back on his Inputs, Insights shut by the landing', async () => {
    await app('ranger')
    const had = new Set(INPUTS)
    await doing(() => {
      expect(commitNewInput({ allday: true, half: '', sTime: '', eTime: '', remarks: '', sans: null, docIds: [], person: PID.ranger, type: 'LL', start: '2026-07-27', end: '2026-07-27' } as any), 'the premise: his leave filed').toBe(true)
    })
    const x = INPUTS.find((r: any) => !had.has(r))
    await topPick('u149')
    expect([UNIT, CURPAGE], 'the premise: 149\'s View-only Sched').toEqual(['u149', 'viewsched'])
    await doing(() => { setInsights(true) })
    expect([INSIGHTS, whatIsOpen()], 'the premise: Insights up, nothing that refuses').toEqual([true, null])
    await doing(() => { globalUndoEngine().undo() })
    expect(INPUTS.includes(x), 'his leave undone').toBe(false)
    expect([UNIT, CURPAGE]).toEqual(['u142', 'inputs'])
    expect(INSIGHTS, 'Insights shut').toBe(false)
  })
})

/* ================= the OIL list's card (B25's refused case) ================= */
describe('the OIL list\'s card — its note (B25\'s refused case)', () => {
  /* "…then try again." (§4.6, words3 W4) stands neither on the section page nor in the sections' words review: in their
     "Not read" list. Not built — for a fresh Fable and his look (the K8 report). Its press refuses silently, as K6 left it
     (ui/msq-guard-doors-bell.test.tsx B25). */
  it.todo('refused behind a squadron he only views: "…then try again." at the foot — once the ending is shown to him')
})

/* a saver left 'failed' by a test is put back by the shared teardown (watchSaves(null)); its status too */
afterEach(() => { saver.status = 'idle' })
