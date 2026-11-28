// @vitest-environment jsdom
/* THE GUARD RAIL'S STEP KR-1a — EVERY CLOSER, NO DOOR CALLING IT (chat A211, 28 Nov 26; the brief
   docs/superpowers/briefs/2026-11-28-msq-s1-kr1a-brief.md; the plan docs/superpowers/plans/2026-11-27-msq-s1-kr-no-blocks-plan.md
   §3's table, column "Its close", §5 steps 3b, 6a and 6c, §7, §11's KR-1 line).

   His D2825 (27 Nov 26): the guard rail refuses nothing for open work — what is open closes at a door, by its own way out,
   no note; "Not saved" still stops a door (D2594). KR-1 builds every closer with no door calling one yet, so nothing a
   person sees changes in this step: each test here calls a row's own `close` from ui/guard.ts GUARD_ROWS — the very
   function a door's closing step will call (KR-2) — and reads that it alone shuts its row and writes nothing its own way
   out does not write today. One describe a family of rows. Admin → Users' four rows are KR-1b's (another section's file
   first): the roll-call's R10 names them.

   The world: three squadrons (test-support/msq-world.ts withThird). Hunter is 142's admin with Plan of 149; Saber the
   master admin. Wed 15 Jul 26. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { act, fireEvent } from '@testing-library/react'
import { flushSync } from 'react-dom'
import { withThird } from '../test-support/msq-world'
import { INPUTS, inpId } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { dayDrafts } from '../engine/drafts'
import { setPage, setInpView, OILWAIT } from '../state/view'
import { INPEDIT, OILLIST, TPLEDIT, WAVEEDIT, DAYTPLEDIT, DRAFTSEDIT, DAYSWIN, MEDMOVE, setOilList } from './pops'
import { CXT, SORTALL } from './board'
import { writeInputs } from '../state/store'
import { PLANPUCKS } from '../state/plan'
import { units, unitsLoad } from '../state/units'
import { whileClosingForDoor, closingForDoor, closeWarAll } from '../state/guard'
import { reqRowNames, createOilPeriodFor } from '../leavewar/sync'
import { getState as lwState, setCell, recordsAt } from '../leavewar/state/store'
import { trackerAsking, trackerWindowsOpen, trackerCloseOpen } from '../tracker/role.js'
import * as FMT from '../tracker/app/fileFormat.js'
import { whatIsOpen } from './guard'
import {
  $, C, OPEN, TRK_OPENERS, TRK_WB, app, asSaber, doing, goAdmin, goLeaveWar, goTracker, guardTeardown, named, openHolidayNoLeave,
  openOilRevise, openQualsNew, openTrkAsk, ownInput, press, rosterMan, row, settle, tid, typeIn,
} from '../test-support/msq-guard-testkit'
import { WORDS, windowWithWords, wordsGone, storedAnywhere } from '../test-support/msq-guard-drops-kit'
import { closeAlone, isOpen, isShut } from '../test-support/msq-guard-closers-kit'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()
afterEach(guardTeardown)
/* (jsdom draws no layout: the war grid's press timer asks where the finger is, as test-support's warAsRanger stubs it) */
if (!(document as any).elementFromPoint) (document as any).elementFromPoint = () => null

/* ================= the Input window, and a day opened on the Inputs calendar ================= */
describe('the Input window and the Inputs calendar\'s day — each closed by its own Cancel or ✕ (D2825)', () => {
  it('the Input window on the Inputs page, words typed: closed by its Cancel — no question asked, the words dropped, nothing stored', async () => {
    await app('hunter')
    await doing(() => { setPage('inputs'); setInpView('table') })
    await windowWithWords(ownInput())
    isOpen('inputedit')
    expect(await closeAlone('inputedit'), 'nothing written').toEqual([])
    isShut('inputedit')
    expect([INPEDIT, tid('win-inputedit'), tid('inped-esc-ask')], 'the window gone, no "Close it and lose them?"').toEqual([null, null, null])
    wordsGone()
  })
  it('the Input window over Edit Schedule (the dialog), words typed: closed the same, the words dropped, nothing stored', async () => {
    await app('hunter')
    await doing(() => setPage('editsched'))
    await windowWithWords(ownInput())
    isOpen('inputdlg')
    expect(await closeAlone('inputdlg'), 'nothing written').toEqual([])
    isShut('inputdlg')
    expect(INPEDIT, 'the window gone').toBeNull()
    wordsGone()
  })
  it('a day opened on the Inputs calendar: closed by its ✕\'s own path, nothing written; whatIsOpen() then null', async () => {
    await app('hunter')
    await OPEN.inputsday!.open()
    isOpen('inputsday')
    expect(await closeAlone('inputsday'), 'nothing written').toEqual([])
    isShut('inputsday')
    expect([tid('win-inputsday'), whatIsOpen()], 'the day gone, nothing open').toEqual([null, null])
  })
  it('the day with a new note\'s words handed to its people picker: closed, the note kept once on 142 with no people — as its ✕ keeps it (the plan §3, D2838)', async () => {
    await app('hunter')
    await OPEN.inputsday!.open()
    await press($('#icAddPuck'), '+ Note')
    const box = $('.ic-newnote .ic-poppuck-edit') as HTMLInputElement
    expect(box, 'the premise: the note box').not.toBeNull()
    await act(async () => { fireEvent.change(box, { target: { value: 'KR closer note' } }) })
    await press($('#icNewNotePpl'), '+ people')
    expect($('.ic-pick'), 'the premise: the picker is up, holding the words').not.toBeNull()
    await closeAlone('inputsday')
    expect([$('.ic-pick'), tid('win-inputsday')], 'the picker and the day closed').toEqual([null, null])
    const kept = PLANPUCKS.filter((p: any) => p.text === 'KR closer note')
    expect(kept.length, 'written once').toBe(1)
    expect(kept[0].ids ?? [], 'with no people').toEqual([])
  })
})

/* ================= the Calendar and its forms ================= */
describe('the Calendar\'s forms — each closed by the Calendar\'s ✕, the forms going with it (D2825, D2837)', () => {
  it('"Every Monday" with a choice pressed: the Calendar and the form closed, nothing written', async () => {
    await app('hunter')
    await OPEN.everywd!.open()
    isOpen('everywd')
    expect(await closeAlone('everywd'), 'nothing written').toEqual([])
    isShut('everywd')
    expect([DAYSWIN, tid('win-every'), tid('win-days')], 'all closed').toEqual([null, null, null])
  })
  it('"Add a holiday" with a name typed: closed, the holiday stored nowhere', async () => {
    await app('hunter')
    await OPEN.holiday!.open()
    isOpen('holiday')
    expect(await closeAlone('holiday'), 'nothing written').toEqual([])
    expect([DAYSWIN, tid('win-holiday')], 'the Calendar and its form closed').toEqual([null, null])
    expect(storedAnywhere('Founders'), 'stored nowhere').toEqual([])
  })
  it('a holiday sheet read in, not yet added: closed, none of its days added', async () => {
    await app('hunter')
    await OPEN.holimport!.open()
    isOpen('holimport')
    expect(await closeAlone('holimport'), 'nothing written').toEqual([])
    expect([DAYSWIN, tid('hol-preview')], 'closed').toEqual([null, null])
    expect(storedAnywhere('Sheet day A'), 'none of its days stored').toEqual([])
  })
  it('a new holiday kept waiting for a leave period: dropped by the closer, as the Calendar\'s ✕ drops it — the period then made, nothing saves itself (D2837)', async () => {
    await app('hunter')
    await openHolidayNoLeave()
    expect(named(), 'the premise: refused at Save and kept waiting').toBe('holiday')
    expect(tid('hol-waiting'), 'the premise: "It is kept only while this window stays open…" is said').not.toBeNull()
    expect(await closeAlone('holiday'), 'nothing written').toEqual([])
    expect([DAYSWIN, tid('win-holiday')], 'closed').toEqual([null, null])
    await doing(() => { expect(createOilPeriodFor('2031'), 'the premise: the 2031 leave period made').toBe('created') })
    expect(storedAnywhere('Far day'), 'the waiting holiday saved nowhere, even with its period made').toEqual([])
  })
  it('(the control, passes on the old code too) the same waiting holiday with the Calendar left open: the period made, it saves itself — so the test above can see a save', async () => {
    await app('hunter')
    await openHolidayNoLeave()
    await doing(() => { expect(createOilPeriodFor('2031')).toBe('created') })
    await settle()
    expect(storedAnywhere('Far day').length, 'saved by itself').toBeGreaterThan(0)
  })
})

/* ================= OIL ================= */
describe('the OIL list and the two OIL questions — each closed by its ✕ or Cancel, nothing answered (D2825)', () => {
  it('the OIL list with a pick made: closed by its ✕ (never "Later", which holds a sign-off), nothing answered', async () => {
    await app('hunter')
    const x: any = { remarks: '', mod: '2026-07-01', yr: 2026, allday: true, s: 0, e: 1439, person: rosterMan(), type: 'Duty', date: 'Jul 18' }
    inpId(x); writeInputs(() => { INPUTS.unshift(x) })
    await doing(() => setOilList({ from: '2026-07-18', to: '2026-07-18', name: 'Holiday', unit: 'u142' }))
    await press(tid(`odl-yes-${x.iid}`), 'Yes on its card')
    isOpen('oilday')
    expect(await closeAlone('oilday'), 'nothing written').toEqual([])
    isShut('oilday')
    expect(OILLIST, 'the list closed').toBeNull()
    expect((INPUTS.find((r: any) => r.iid === x.iid) as any)?.oil ?? null, 'nothing answered').toBeNull()
  })
  it('the OIL question before a change: dropped silently (never the bar of leaveOilWait), the change not made', async () => {
    await app('hunter')
    await OPEN.oilwait!.open()
    isOpen('oilwait')
    expect(await closeAlone('oilwait'), 'nothing written').toEqual([])
    expect([OILWAIT, tid('oilconf'), tid('oilbar')], 'closed, no bar').toEqual([null, null, null])
  })
  it('the OIL question from a row of the Inputs list: closed by its Cancel, the input\'s OIL as it was', async () => {
    await app('hunter')
    await openOilRevise()
    const x = INPUTS.find((r: any) => r.type === 'Duty' && r.date === 'Jul 18' && r.oil) as any
    const oil = JSON.stringify(x.oil)
    isOpen('oilrevise')
    expect(await closeAlone('oilrevise'), 'nothing written').toEqual([])
    isShut('oilrevise')
    expect(tid('oilconf'), 'closed').toBeNull()
    expect(JSON.stringify((INPUTS.find((r: any) => r.iid === x.iid) as any).oil), 'its OIL as it was').toBe(oil)
  })
})

/* ================= the schedule's windows ================= */
/** a plan on 142's Monday by the plans menu's "+ Alt Plan", then its manage window by "Manage plans" (the drops file's) */
async function planOnMonday(): Promise<string[]> {
  await app('hunter')
  await doing(() => setPage('editsched'))
  await press($('#eWeek .day[data-day="0"] .dhtpl [data-planmenu]'), 'Monday\'s plans menu')
  await press($('.wavemenu [data-plandup]'), '+ Alt Plan')
  await press($('#eWeek .day[data-day="0"] .dhtpl [data-planmenu]'), 'Monday\'s plans menu again')
  await press($('.wavemenu [data-planmanage]'), 'Manage plans')
  expect(DRAFTSEDIT, 'the premise: the manage window is up').not.toBeNull()
  return dayDrafts(0).map((x: any) => x.name)
}
describe('the schedule\'s windows — each closed by its ✕ (D2825)', () => {
  for (const [id, flag] of [['dutytpl', () => TPLEDIT], ['wavetpl', () => WAVEEDIT], ['daytpl', () => DAYTPLEDIT]] as const) {
    it(`${id}: closed, nothing written`, async () => {
      await app('hunter')
      await OPEN[id]!.open()
      isOpen(id)
      expect(await closeAlone(id), 'nothing written').toEqual([])
      isShut(id)
      expect(flag(), 'its flag off').toBe(false)
    })
  }
  it('Plans, a name half typed: closed by its Escape\'s path, the name let go, the plans\' names as they were', async () => {
    const names = await planOnMonday()
    const box = $('#draftsModal .tpl-name') as HTMLInputElement
    await act(async () => { fireEvent.change(box, { target: { value: 'Half typed' } }) })
    isOpen('drafts')
    expect(await closeAlone('drafts'), 'nothing written').toEqual([])
    isShut('drafts')
    expect(DRAFTSEDIT, 'closed').toBeNull()
    expect(dayDrafts(0).map((x: any) => x.name), 'the names as they were').toEqual(names)
  })
  it('the board\'s cancel-reason box, a reason typed: closed, the cancel never made, the reason stored nowhere', async () => {
    await app('hunter')
    await OPEN.cxdlg!.open()
    await typeIn('#cxReason', 'KR closer reason')
    isOpen('cxdlg')
    expect(await closeAlone('cxdlg'), 'nothing written').toEqual([])
    expect([CXT, ($('#cxPop') as HTMLElement | null)?.hidden ?? true], 'closed').toEqual([null, true])
    expect(storedAnywhere('KR closer reason'), 'stored nowhere').toEqual([])
  })
  it('Sort all\'s question: closed by its Cancel, nothing sorted', async () => {
    await app('hunter')
    await OPEN.sortall!.open()
    isOpen('sortall')
    expect(await closeAlone('sortall'), 'nothing written').toEqual([])
    expect(SORTALL, 'closed').toBeNull()
  })
  it('the medical question (a drag onto another medical): closed, the move not made', async () => {
    await app('hunter')
    await OPEN.medmove!.open()
    isOpen('medmove')
    expect(await closeAlone('medmove'), 'nothing written').toEqual([])
    expect([MEDMOVE, tid('medclash')], 'closed').toEqual([null, null])
  })
})

/* ================= Quals and Admin → Squadrons ================= */
describe('Quals\' new qualification and Admin → Squadrons\' three rows — each closed by its own discard or Cancel (D2825)', () => {
  it('"Add qualification" with words: emptied, the box\'s only discard, nothing stored', async () => {
    await app('hunter')
    await openQualsNew('KR CLOSER QUAL')
    isOpen('qualsnew')
    expect(await closeAlone('qualsnew'), 'nothing written').toEqual([])
    isShut('qualsnew')
    expect(($('#qNewQual') as HTMLInputElement | null)?.value ?? '', 'the box empty').toBe('')
    expect(storedAnywhere('KR CLOSER QUAL'), 'stored nowhere').toEqual([])
  })
  it('"+ New squadron" with a number typed: closed by its Cancel, no squadron made', async () => {
    await app('saber')
    await OPEN.newsqn!.open()
    isOpen('newsqn')
    expect(await closeAlone('newsqn'), 'nothing written').toEqual([])
    expect($('[data-new-sqn]'), 'the form closed').toBeNull()
    unitsLoad()
    expect(units().some(u => u.num === '151'), 'no squadron 151').toBe(false)
  })
  it('"+ New squadron" opened and left blank (it counts nothing): its close is held all the same, and closes it (205\'s answer)', async () => {
    await app('saber')
    await asSaber(); await goAdmin('Squadrons'); await press($('#sqNew'), '+ New squadron')
    expect([named(), !!$('[data-new-sqn]')], 'the premise: open, counting nothing').toEqual([null, true])
    expect(await closeAlone('newsqn'), 'nothing written').toEqual([])
    expect($('[data-new-sqn]'), 'the form closed').toBeNull()
  })
  it('a squadron\'s place row with a change: closed by its Cancel, the place as it was', async () => {
    await app('hunter')
    await OPEN.sqnmove!.open()
    isOpen('sqnmove')
    expect(await closeAlone('sqnmove'), 'nothing written').toEqual([])
    expect($('[data-moving]'), 'the row closed').toBeNull()
  })
  it('a place\'s row with its name changed: closed by its Cancel, the name stored nowhere', async () => {
    await app('saber')
    await OPEN.placeedit!.open()
    isOpen('placeedit')
    expect(await closeAlone('placeedit'), 'nothing written').toEqual([])
    expect($('[data-placing]'), 'the row closed').toBeNull()
    expect(storedAnywhere('Home base two'), 'stored nowhere').toEqual([])
  })
})

/* ================= the Leave War: every sheet, in a loop ================= */
describe('the Leave War — every open sheet closed by its own close, one at a time, each unmounted before the next (D2825; the plan §5 6c)', () => {
  it('the ⚙ Settings sheet: closed, the list empty, nothing written', async () => {
    await app('hunter')
    await OPEN.lwsheet!.open()
    isOpen('lwsheet')
    expect(await closeAlone('lwsheet'), 'nothing written').toEqual([])
    isShut('lwsheet')
    expect(document.querySelectorAll('.bidsheet').length, 'no sheet on the page').toBe(0)
  })
  it('a Required row\'s Rename, a name typed (held until its Save): closed, not renamed, stored nowhere', async () => {
    await app('hunter')
    await goLeaveWar()
    await press(tid('fly-name-req-p'), 'the Required P row\'s name')
    await typeIn('[data-testid="reqname-name"]', 'KR closer name')
    isOpen('lwsheet')
    expect(await closeAlone('lwsheet'), 'nothing written').toEqual([])
    expect(tid('req-name-form'), 'closed').toBeNull()
    expect(reqRowNames().p, 'not renamed').not.toBe('KR closer name')
    expect(storedAnywhere('KR closer name'), 'stored nowhere').toEqual([])
  })
  it('two sheets, one over the other (a person\'s window, the ⚙ Settings over it): both closed, the top one first, the list empty', async () => {
    await app('hunter')
    await goLeaveWar()
    await press(document.querySelector(`[data-testid^="person-"]:not([data-testid="person-window"])`), 'a name on the grid')
    expect(tid('person-window'), 'the premise: his window is up').not.toBeNull()
    await press(tid('settings-open'), 'the Leave War\'s gear')
    expect(document.querySelectorAll('.bidsheet').length, 'the premise: more than one sheet up').toBeGreaterThan(1)
    expect(await closeAlone('lwsheet'), 'nothing written').toEqual([])
    expect(document.querySelectorAll('.bidsheet').length, 'no sheet on the page').toBe(0)
    isShut('lwsheet')
  })
  it('a held bid\'s Remarks typed and not left: closed by its own close, which keeps the words — on 142\'s war, as its ✕ keeps them (D1339, the plan §3)', async () => {
    await app('hunter')
    await goLeaveWar()
    const who = rosterMan(), D = '2026-07-22'
    await doing(() => { expect(setCell(who, D, 'LL', { remarks: 'Bali' } as any), 'the premise: a pending bid placed').toBe(true) })
    await press(tid(`cell-${who}-${D}`), 'the bid\'s day on the grid')
    const box = tid('bid-remarks') as HTMLInputElement
    expect(box, 'the premise: the bid window with its Remarks').not.toBeNull()
    await act(async () => { box.focus(); fireEvent.change(box, { target: { value: 'KR closer bid words' } }) })
    await settle()
    await closeAlone('lwsheet')
    expect(tid('bid-picker'), 'the window closed').toBeNull()
    expect(recordsAt(who, D).filter((r: any) => r.kind === 'request').map((r: any) => r.remarks ?? ''), '142\'s bid holds the words').toContain('KR closer bid words')
  })
  it('a sheet whose close holds it open (the presets\' refusal held for reading): the loop stops and says so (false) — never a wait; under closingForDoor() the name is dropped silently and the sheet goes (Astra 6)', async () => {
    await app('hunter')
    await goLeaveWar()
    await press(tid('settings-open'), 'the Leave War\'s gear')
    await press(tid('settings-events'), 'Events…')
    await press(tid('events-presets'), 'Edit presets')
    const was = lwState().eventDefs[0]!.name
    const other = (tid('evtype-name-1') as HTMLInputElement).value
    const box = tid('evtype-name-0') as HTMLInputElement
    await act(async () => { box.focus(); fireEvent.change(box, { target: { value: other } }) })
    let ok: boolean | null = null
    /* (each close committed at once, as the row's own close commits it — React's flushSync) */
    await act(async () => { ok = closeWarAll(flushSync) })
    await settle()
    expect(ok, 'no progress: the loop stops and says so').toBe(false)
    expect(tid('event-types-sheet'), 'the presets held open for the refusal').not.toBeNull()
    /* (the same refused name in the box again, focused) */
    const box2 = tid('evtype-name-0') as HTMLInputElement
    await act(async () => { box2.focus(); fireEvent.change(box2, { target: { value: other } }) })
    await settle()
    await act(async () => { whileClosingForDoor(() => { ok = closeWarAll(flushSync) }) })
    await settle()
    expect(ok, 'closed').toBe(true)
    expect([tid('event-types-sheet'), tid('event-problem')], 'gone, no warning').toEqual([null, null])
    expect(lwState().eventDefs[0]!.name, 'the preset as it was').toBe(was)
    expect(closingForDoor(), 'the flag put back').toBe(false)
  })
})

/* ================= the Plans name box at a door ================= */
describe('closingForDoor() — a value a box refuses is dropped silently at a door (the plan §3; Astra 5, Opus 1b)', () => {
  it('Plans, its name emptied (a name it refuses) and left while a door closes: no "A plan needs a name", the names as they were; left another time, the warning said as before', async () => {
    const names = await planOnMonday()
    const box = $('#draftsModal .tpl-name') as HTMLInputElement
    await act(async () => { box.focus(); fireEvent.change(box, { target: { value: '' } }) })
    const t0 = (HOOKS.toast as any).mock.calls.length
    await act(async () => { whileClosingForDoor(() => { box.blur() }) })
    await settle()
    const said = (HOOKS.toast as any).mock.calls.slice(t0).map((c: any[]) => String(c[0]))
    expect(said.filter((t: string) => /plan needs a name/.test(t)), 'no warning at a door').toEqual([])
    expect(dayDrafts(0).map((x: any) => x.name), 'the names as they were').toEqual(names)
    expect(closingForDoor(), 'the flag put back').toBe(false)
    /* (and outside a door, exactly as before) */
    const box2 = $('#draftsModal .tpl-name') as HTMLInputElement
    await act(async () => { box2.focus(); fireEvent.change(box2, { target: { value: '' } }) })
    const t1 = (HOOKS.toast as any).mock.calls.length
    await act(async () => { box2.blur() })
    await settle()
    expect((HOOKS.toast as any).mock.calls.slice(t1).map((c: any[]) => String(c[0])), 'the warning, as before').toContain('A plan needs a name')
  })
})

/* ================= the Tracker, on its bridge ================= */
const TRK_REFUSING = ['infoId', 'editId', 'sylModalOpen', 'ordMode', 'copyOpen', 'flexWinOpen', 'showAllOpen', 'lullPick', 'lullCopy', 'dlg'] as const
const refusingUp = () => trackerWindowsOpen().filter((w: any) => w.counts === 'window').map((w: any) => w.id)
describe('the Tracker — each window that refuses closed by its own Close on the bridge; a job\'s question ended first (D2825; the plan §5 3b)', () => {
  for (const id of TRK_REFUSING) {
    it(`${id}: closed by the trk row's close, nothing written${id === 'dlg' ? ' (a course\'s name asked: the job ended, no course added)' : ''}`, async () => {
      await app('hunter')
      await goTracker()
      const courses = C.COURSES.length
      await TRK_OPENERS[id]!()
      expect(refusingUp(), `the premise: ${id} is up`).toContain(id)
      isOpen('trk')
      expect(await closeAlone('trk'), 'nothing written').toEqual([])
      isShut('trk')
      expect(refusingUp(), 'no window of the Tracker up').toEqual([])
      if (id === 'dlg') expect([C.dlg ?? null, C.COURSES.length], 'the question gone, no course added').toEqual([null, courses])
    })
  }
  /** an import of three charts, the first and the third new here, the second already here (it asks) — the drops file's */
  /* (handed back in an object: an async function returning the job itself would wait on it — and the job waits on the
     question) */
  /* (`tag` keeps each test's charts its own: the Tracker's memory outlives a test, so a chart one test brought in is on the
     list of the next, and is never taken as one of the three) */
  const KR = { first: '', third: '' }
  async function importAsking(tag: string): Promise<{ job: Promise<unknown> }> {
    KR.first = `sckrclos${tag}a`; KR.third = `sckrclos${tag}c`
    await app('hunter')
    await goTracker()
    const ids: string[] = C.orderedSylIds().filter((id: string) => !id.startsWith('sckr')).slice(0, 3)
    expect(ids.length, 'the premise: three charts').toBe(3)
    const charts = await C.collectCharts(ids)
    const rename = (from: string, to: string, name: string) => {
      charts.order = charts.order.map((x: string) => (x === from ? to : x))
      charts.syllabi[to] = charts.syllabi[from]; delete charts.syllabi[from]
      if (charts.layouts?.[from]) { charts.layouts[to] = charts.layouts[from]; delete charts.layouts[from] }
      if (charts.eventInfoBySyl?.[from]) { charts.eventInfoBySyl[to] = charts.eventInfoBySyl[from]; delete charts.eventInfoBySyl[from] }
      charts.sylcat = charts.sylcat.map((e: any) => (e.id === from ? { ...e, id: to, name } : e))
    }
    rename(ids[0]!, KR.first, `KR CLOSER FIRST ${tag}`)
    rename(ids[2]!, KR.third, `KR CLOSER THIRD ${tag}`)
    ;(window as any).__pickOpenForTests = async () => ({ name: 'kr.json', text: JSON.stringify(FMT.buildFile({ savedAt: '2026-07-15T00:00:00Z', charts })) })
    let job: Promise<unknown> = Promise.resolve()
    await act(async () => { job = C.importClick() })
    await vi.waitFor(() => expect(C.dlg?.msg, 'the premise: the second chart\'s question').toMatch(/already exists/), { timeout: 5000, interval: 10 })
    expect(C.orderedSylIds(), 'the premise: the first came in').toContain(KR.first)
    return { job }
  }
  it('an import stopped at the second chart\'s question by the closer: ended, not skipped — the first stays, the third never comes in, no further question', async () => {
    try {
      const { job } = await importAsking('x')
      await closeAlone('trk')
      await act(async () => { await Promise.race([job, new Promise(r => setTimeout(r, 300))]) })
      await settle()
      expect(C.dlg ?? null, 'no further question').toBeNull()
      expect(C.orderedSylIds(), 'the first stays').toContain(KR.first)
      expect(C.orderedSylIds(), 'the third not imported').not.toContain(KR.third)
      expect(TRK_WB.keys('tracker' as any).some((k: string) => String(TRK_WB.get('tracker' as any, k)).includes('KR CLOSER THIRD x')), 'nothing of the third stored').toBe(false)
    } finally { delete (window as any).__pickOpenForTests }
  })
  it('(the control, passes on the old code too) the same question answered by its own third button, "Skip this one": the import goes on — the third comes in — so "ended" is not the prompt\'s Cancel', async () => {
    try {
      const { job } = await importAsking('y')
      await press($('#dlgCancel'), 'Skip this one')
      await vi.waitFor(() => expect(C.orderedSylIds(), 'the third comes in').toContain(KR.third), { timeout: 5000, interval: 10 })
      if (C.dlg) await press($('#dlgOk') || $('#dlgCancel'), 'the closing report\'s OK')
      await act(async () => { await Promise.race([job, new Promise(r => setTimeout(r, 300))]) })
    } finally { delete (window as any).__pickOpenForTests }
  })
  it('the unsaved-edits question a door asks (trkask) is never closed by the trk row\'s close, nor by the bridge with no id (D2825 keeps it)', async () => {
    await app('hunter')
    await openTrkAsk()
    expect(trackerAsking(), 'the premise: the question stands').toBe(true)
    await act(async () => { row('trk').close!(); trackerCloseOpen() })
    await settle()
    expect([trackerAsking(), !!C.dlg], 'still asked').toEqual([true, true])
  })
})
