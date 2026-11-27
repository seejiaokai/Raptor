// @vitest-environment jsdom
/* THE GUARD RAIL'S STEP KR-2 — THE CLOSING STEP AND ITS CHECKS, NO DOOR CONVERTED YET (chat A211, 28 Nov 26; the brief
   docs/superpowers/briefs/2026-11-28-msq-s1-kr2-brief.md; the plan docs/superpowers/plans/2026-11-27-msq-s1-kr-no-blocks-plan.md
   §5 steps 3b, 4, 6, 7, §7, §11's KR-2 line).

   His D2825 (27 Nov 26): a door refuses nothing for open work — what is open closes, half-typed work dropped, no note;
   "Not saved" still stops it (D2594); the Tracker still asks about unsaved chart edits (D2627 A20). His D2838: a box with
   no Save button is saved into its OWN squadron first, then the door goes through in the same press; if that save fails,
   the door is stopped with "Not saved". KR-2 builds the pieces every door will use — the closing step (closeOpen), the
   Tracker's question as such a door asks it, the wait for a save the closing started, the guard refusing only "Not saved"
   for a door in NO_BLOCK_DOORS (empty as shipped), and the entry checker re-pointed for such a door — with no door calling
   them yet, so nothing a person sees changes. Where a whole door is needed the test presses one made of those pieces in
   the plan's order (test-support/msq-guard-closeopen-kit.ts krDoor, the shape KR-3 gives the pick), with 'pick' put in
   NO_BLOCK_DOORS by the test only.

   The world: three squadrons (test-support/msq-world.ts withThird). Hunter is 142's admin with Plan of 149; Saber the
   master admin. Wed 15 Jul 26. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { act, fireEvent } from '@testing-library/react'
import { withThird } from '../test-support/msq-world'
import { UNIT } from '../engine/unitview'
import { unitSetting } from '../engine/hooks'
import { VCONF, ruleFmt } from '../engine/rules'
import { dayDrafts } from '../engine/drafts'
import { setPage, OILWAIT } from '../state/view'
import { LGEDIT } from '../state/auth'
import { INPEDIT, OILLIST, TPLEDIT, DRAFTSEDIT, setInpEdit, setOilList } from './pops'
import { setCxt, setSortAll } from './board'
import { holdNow } from '../state/typing-hold'
import { enterSquadron } from '../state/store'
import { refuse, refusalAt, closeShown, setWarSheetsProbe, closingForDoor } from '../state/guard'
import { whatIsOpen, NO_BLOCK_DOORS, GUARD_LEADS, GUARD_ENDINGS } from './guard'
import { getState as lwState, worldUnit } from '../leavewar/state/store'
import { trackerAsking, trackerSwitchAskAtDoor } from '../tracker/role.js'
import * as FMT from '../tracker/app/fileFormat.js'
import { INSTALLED, makeEntryChecker } from '../testing/entry-checker'
import { clearToast } from './toast'
import {
  $, C, OPEN, SHOWN, app, doing, press, settle, tid, goAdmin, goLeaveWar, goTracker, chartEdit, guardTeardown, openTrkAsk,
  openQualsNew, ownInput, row, note, saver,
} from '../test-support/msq-guard-testkit'
import { WORDS, windowWithWords, wordsGone, toastCount, toastsSince, noNote } from '../test-support/msq-guard-drops-kit'
import { everyStore, storeChanges } from '../test-support/msq-guard-closers-kit'
import { noBlock, noBlockClear, closeAll, pressDoor, templateTyped, templateTypedAndWatched } from '../test-support/msq-guard-closeopen-kit'
import { watchSaves } from '../storage/savewait'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()
afterEach(async () => {
  noBlockClear()
  setCxt(null); setSortAll(null)
  await guardTeardown()
  saver.status = 'idle'
  clearToast()
  document.getElementById('toastEl')?.remove()
  document.getElementById('srSay')?.remove()
})
/* (jsdom draws no layout: the war grid's press timer asks where the finger is, as test-support's warAsRanger stubs it) */
if (!(document as any).elementFromPoint) (document as any).elementFromPoint = () => null

/** nothing open after the closing, the war holding nothing, the row shut, nothing stored */
function allClosed(id: string, before: Record<string, string>) {
  expect(row(id).open(), `${id} shut`).toBe(false)
  expect([whatIsOpen()?.row.id ?? null, holdNow()], 'nothing open, nothing held').toEqual([null, 'none'])
  expect(storeChanges(before), 'nothing written').toEqual([])
}

/* ================= 6b — every open row, each by its own close ================= */
describe('closeOpen — every open row closed by its own way out, the rest of the app untouched (D2825; the plan §5 6b)', () => {
  const FAMILIES = [
    'inputedit', 'inputdlg', 'inputsday', 'everywd', 'holiday', 'holimport', 'inputsset', 'sansset', 'oilday',
    'dutytpl', 'wavetpl', 'daytpl', 'drafts', 'cxdlg', 'sortall', 'medmove', 'oilwait', 'oilrevise', 'qualsnew',
    'sqnmove', 'newsqn', 'placeedit', 'lwsheet', 'trk',
  ] as const
  for (const id of FAMILIES) {
    it(`${id}, opened as its door opens it: closed by closeOpen(), nothing open after, nothing written`, async () => {
      await app('hunter')
      await OPEN[id]!.open()
      expect(row(id).open(), `the premise: ${id} is open`).toBe(true)
      const before = everyStore()
      expect(await closeAll(), 'closed').toBe(true)
      allClosed(id, before)
    })
  }
  it('the Input window with words typed: closed, its words dropped (D2825)', async () => {
    await app('hunter')
    await doing(() => setPage('inputs'))
    await windowWithWords(ownInput())
    expect(await closeAll()).toBe(true)
    expect(INPEDIT, 'the window gone').toBeNull()
    wordsGone(WORDS)
  })
  const SHOWN_ROWS = ['avail', 'chg', 'insights', 'sansday', 'lwday', 'days', 'lwshow', 'trkinfo', 'trkpop', 'trkdown', 'trkfail'] as const
  for (const id of SHOWN_ROWS) {
    it(`a window that only shows things (${id}): closed as closeShown() closes it`, async () => {
      await app('hunter')
      await SHOWN[id]!.open()
      expect(row(id).open(), `the premise: ${id} is open`).toBe(true)
      expect(await closeAll()).toBe(true)
      expect(SHOWN[id]!.shut(), `${id} closed`).toBe(true)
      expect(whatIsOpen(), 'nothing open').toBeNull()
    })
  }
  it('several at once — an OIL question over the Input window, the OIL list, ALL AVAIL and the Calendar with a holiday typed: every one closed in one call, nothing open after', async () => {
    await app('hunter')
    await OPEN.holiday!.open()
    await SHOWN.avail!.open()
    await doing(() => { setOilList({ from: '2026-07-18', to: '2026-07-18', name: 'Holiday' }); setInpEdit(ownInput()) })
    await OPEN.oilwait!.open()
    expect(['holiday', 'avail', 'oilday', 'inputdlg', 'oilwait'].every(id => row(id).open()), 'the premise: all five open').toBe(true)
    expect(await closeAll()).toBe(true)
    expect([INPEDIT, OILLIST, OILWAIT, tid('win-holiday'), tid('win-days')], 'all closed').toEqual([null, null, null, null, null])
    expect([whatIsOpen(), holdNow()]).toEqual([null, 'none'])
  })
  it('"+ New squadron" opened and left blank (it counts nothing, so it refuses nothing): closed all the same — an opened row closes at a door (205\'s answer)', async () => {
    await app('saber')
    await goAdmin('Squadrons')
    await press($('#sqNew'), '+ New squadron')
    expect([whatIsOpen()?.row.id ?? null, !!$('[data-new-sqn]')], 'the premise: open, counting nothing').toEqual([null, true])
    expect(await closeAll()).toBe(true)
    expect($('[data-new-sqn]'), 'the form closed').toBeNull()
  })
  it('Quals\' edit mode with words in "Add qualification": the words emptied and the mode ended (D2627 A4)', async () => {
    await app('hunter')
    await openQualsNew('KR2 QUAL')
    expect(row('qedit').open(), 'the premise: Edit quals is on').toBe(true)
    expect(await closeAll()).toBe(true)
    expect([row('qedit').open(), ($('#qNewQual') as HTMLInputElement | null)?.value ?? ''], 'the mode ended, the box empty').toEqual([false, ''])
  })
  it('(the control, passes on the old code too) closeShown() as the doors still call it leaves a changed settings window open — closeOpen() is the new step, closeShown() unchanged', async () => {
    await app('hunter')
    await OPEN.inputsset!.open()
    await act(async () => { closeShown() })
    await settle()
    expect(row('inputsset').open(), 'still open after closeShown()').toBe(true)
  })
  it('closingForDoor() is true while it runs and put back after', async () => {
    await app('hunter')
    let seen: boolean | null = null
    const box = (await templateTyped())
    box.addEventListener('blur', () => { seen = closingForDoor() })
    expect(await closeAll()).toBe(true)
    expect([seen, closingForDoor()], 'true while closing, false after').toEqual([true, false])
  })
})

/* ================= the skip ================= */
describe('the skip — the rows a door leaves out stay open; every other is closed (the plan §5 6b; the OIL list\'s card)', () => {
  it('the OIL list and the OIL question beside it, closeOpen([\'oilday\']): the list stays, the question closed; nothing else open', async () => {
    await app('hunter')
    await doing(() => setOilList({ from: '2026-07-18', to: '2026-07-18', name: 'Holiday' }))
    await OPEN.oilwait!.open()
    expect(await closeAll(['oilday'])).toBe(true)
    expect([!!OILLIST, OILWAIT], 'the list open, the question closed').toEqual([true, null])
    expect(whatIsOpen(['oilday']), 'nothing open but the list left out').toBeNull()
  })
})

/* ================= 6a — the focused box left into its own squadron ================= */
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
describe('6a — the focused box is left while the old squadron is in view, so it saves into its own squadron (D2838)', () => {
  it('Duty templates, "0730" typed in a Start box still focused, the door to 149: through; 142\'s template 07:30, 149\'s untouched, no note', async () => {
    noBlock('pick')
    await templateTyped()
    const was149 = JSON.stringify(unitSetting('u149', 'dutytpl', null))
    const t0 = toastCount()
    await pressDoor('u149')
    expect([UNIT, TPLEDIT], 'through, the window closed').toEqual(['u149', false])
    expect((unitSetting('u142', 'dutytpl', null) as any)?.[0]?.rows?.[0]?.str, '142\'s template: 07:30').toBe('07:30')
    expect(JSON.stringify(unitSetting('u149', 'dutytpl', null)), '149\'s untouched').toBe(was149)
    noNote(t0)
  })
  it('a plan\'s name half typed and focused, the door to 149: through; 142\'s plan renamed, 149 holds no plan of that name', async () => {
    noBlock('pick')
    await planOnMonday()
    const box = $('#draftsModal .tpl-name') as HTMLInputElement
    await act(async () => { box.focus(); fireEvent.change(box, { target: { value: 'Wet weather' } }) })
    await settle()
    await pressDoor('u149')
    expect([UNIT, DRAFTSEDIT], 'through, the window closed').toEqual(['u149', null])
    expect(dayDrafts(0).map((x: any) => x.name), '149: none of that name').not.toContain('Wet weather')
    await pressDoor('u142')
    expect(dayDrafts(0).map((x: any) => x.name), '142: renamed').toContain('Wet weather')
  })
  it('a plan\'s name emptied (a name the box refuses) and focused: dropped silently — no "A plan needs a name", the names as they were', async () => {
    const names = await planOnMonday()
    const box = $('#draftsModal .tpl-name') as HTMLInputElement
    await act(async () => { box.focus(); fireEvent.change(box, { target: { value: '' } }) })
    await settle()
    const t0 = toastCount()
    expect(await closeAll()).toBe(true)
    expect(toastsSince(t0).filter(t => /plan needs a name|already has that name/.test(t)), 'no warning').toEqual([])
    expect([DRAFTSEDIT, dayDrafts(0).map((x: any) => x.name)], 'closed, the names as they were').toEqual([null, names])
  })
  it('Logic\'s Crew rest, "13h" just typed (still waiting its beat), the door to 149: 142 holds 13h, 149 12h, the mode ended', async () => {
    noBlock('pick')
    await app('hunter')
    await doing(() => setPage('logic'))
    await press($('#lgEdit'), 'Logic\'s ✎ Edit')
    const box = $('input[data-lgset="crewRest"]') as HTMLInputElement
    expect([box !== null, VCONF.crewRest], 'the premise: Crew rest\'s box, 12h').toEqual([true, 720])
    act(() => { box.focus(); box.value = ruleFmt('crewRest', 780); fireEvent.change(box) })
    await pressDoor('u149')
    expect([UNIT, !!LGEDIT], 'through, the mode ended').toEqual(['u149', false])
    await act(async () => { await new Promise(r => setTimeout(r, 5)) })
    expect(VCONF.crewRest, '149 reads 12h').toBe(720)
    expect(unitSetting('u142', 'rules', null)?.v?.crewRest, '142\'s stored rules: 13h').toBe(780)
  })
  it('the event presets, a name it refuses typed and focused: dropped silently, the sheet closed, no warning, the preset as it was', async () => {
    await app('hunter')
    await goLeaveWar()
    await press(tid('settings-open'), 'the Leave War\'s gear')
    await press(tid('settings-events'), 'Events…')
    await press(tid('events-presets'), 'Edit presets')
    const was = lwState().eventDefs[0]!.name
    const other = (tid('evtype-name-1') as HTMLInputElement).value
    const box = tid('evtype-name-0') as HTMLInputElement
    await act(async () => { box.focus(); fireEvent.change(box, { target: { value: other } }) })
    await settle()
    expect(await closeAll(), 'closed, the loop never stuck').toBe(true)
    expect([tid('event-types-sheet'), tid('event-problem'), document.querySelectorAll('.bidsheet').length], 'no sheet, no warning').toEqual([null, null, 0])
    expect(lwState().eventDefs[0]!.name, 'the preset as it was').toBe(was)
  })
})

/* ================= 6c / 6d — the Leave War loop, and nothing left behind ================= */
describe('6c and 6d — the Leave War\'s sheets closed one at a time; a stuck one stops the door; nothing open or held after (D2825)', () => {
  it('a sheet whose close leaves it on the list (planted): closeOpen() answers false, and the door does not enter; what it closed stays closed', async () => {
    noBlock('pick')
    await app('hunter')
    await doing(() => setPage('inputs'))
    await windowWithWords(ownInput())
    const stuck = { showOnly: false, close: () => {}, key: {} }
    const was = setWarSheetsProbe(() => [stuck])
    try {
      await pressDoor('u149')
      expect(UNIT, 'not entered').toBe('u142')
      expect(INPEDIT, 'the Input window closed all the same').toBeNull()
      let ok: boolean | null = null
      await act(async () => { ok = (await import('../state/guard')).closeOpen() })
      expect(ok, 'no progress: false').toBe(false)
    } finally { setWarSheetsProbe(was) }
  })
  it('Hunter (Plan of 149) with a person\'s window open on his Leave War: straight after closeOpen(), in the same turn, nothing is open and the war holds nothing; the door then enters 149\'s war', async () => {
    noBlock('pick')
    await app('hunter')
    await goLeaveWar()
    await press(document.querySelector(`[data-testid^="person-"]:not([data-testid="person-window"])`), 'a name on the grid')
    expect(tid('person-window'), 'the premise: his window is up').not.toBeNull()
    let at: unknown = null
    await act(async () => {
      const g = await import('../state/guard')
      const ok = g.closeOpen()
      at = [ok, whatIsOpen()?.row.id ?? null, holdNow(), document.querySelectorAll('.bidsheet').length]
    })
    expect(at, 'closed, nothing open, nothing held, no sheet on the page — in the same turn').toEqual([true, null, 'none', 0])
    await pressDoor('u149')
    expect([UNIT, worldUnit()], 'through, the war 149\'s').toEqual(['u149', 'u149'])
  })
  it('the Input window and a Tracker window at once, on the Tracker page: in the same turn after closeOpen(), nothing open, nothing held', async () => {
    await app('hunter')
    await goTracker()
    await press($('#showAllTab'), 'Show All')
    await doing(() => setInpEdit(ownInput()))
    expect(['trk', 'inputdlg'].filter(id => row(id).open()).length + (row('inputedit').open() ? 1 : 0), 'the premise: two open').toBeGreaterThanOrEqual(2)
    let at: unknown = null
    await act(async () => {
      const g = await import('../state/guard')
      at = [g.closeOpen(), whatIsOpen()?.row.id ?? null, holdNow()]
    })
    expect(at).toEqual([true, null, 'none'])
  })
})

/* ================= 3b and 4 — the Tracker's question as a door that goes through asks it ================= */
/** unsaved chart moves, then "Add event" in Edit chart layout: its name asked (a box that is not the switch question) */
async function chartEditThenPrompt(): Promise<number> {
  await app('hunter')
  await goTracker()
  await chartEdit()
  const before = C.SYL.length
  await act(async () => {
    if (!C.arrangeMode) C.toggleArrange()
    void C.addModule('acad')
    await vi.waitFor(() => expect(C.dlg, 'the premise: the new event\'s name is asked').toBeTruthy(), { timeout: 5000, interval: 5 })
  })
  await settle()
  expect(trackerAsking(), 'the premise: a box, not the switch question').toBe(false)
  return before
}
const askedWith = async (words: string) => {
  await vi.waitFor(() => expect(C.dlg?.msg, 'the Tracker\'s question').toContain(words), { timeout: 5000, interval: 10 })
  expect(trackerAsking(), 'the switch question is the one asked').toBe(true)
}
describe('3b and 4 — a Tracker box ended before the question; a question standing answered Stay and waited for (D2825, D2627 A20)', () => {
  it('3b: chart edits unsaved and "Add event"\'s name asked: the box gone, its job ended (no event added), the question asked; Stay → false, the edits kept', async () => {
    const before = await chartEditThenPrompt()
    let p: Promise<boolean> | null = null
    await act(async () => { p = trackerSwitchAskAtDoor('149') })
    expect(p, 'a question to ask').not.toBeNull()
    await askedWith('Save them before switching to 149?')
    await press($('#dlgCancel'), 'Stay')
    expect(await p, 'Stay').toBe(false)
    expect({ dirty: C.sylDirty, dlg: C.dlg ?? null, events: C.SYL.length }, 'the edits kept, no box, no event added by the ended job').toEqual({ dirty: true, dlg: null, events: before })
  })
  it('(the control, passes on the old code too) the same state asked the old way (trackerSwitchAsk): no question drawn, the press silently stays', async () => {
    await chartEditThenPrompt()
    const { trackerSwitchAsk } = await import('../tracker/role.js')
    let r: unknown = null
    await act(async () => { r = await trackerSwitchAsk('149') })
    expect([r, trackerAsking()], 'false, nothing asked').toEqual([false, false])
  })
  it('3b: an import of three charts at the second\'s question ("Skip this one"), chart edits then unsaved: the job ended, not skipped — the third never comes in; the question asked', async () => {
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
    rename(ids[0]!, 'sckrtwoa', 'KR2 FIRST')
    rename(ids[2]!, 'sckrtwoc', 'KR2 THIRD')
    ;(window as any).__pickOpenForTests = async () => ({ name: 'kr2.json', text: JSON.stringify(FMT.buildFile({ savedAt: '2026-07-15T00:00:00Z', charts })) })
    try {
      let job: Promise<unknown> = Promise.resolve()
      await act(async () => { job = C.importClick() })
      await vi.waitFor(() => expect(C.dlg?.msg, 'the premise: the second chart\'s question').toMatch(/already exists/), { timeout: 5000, interval: 10 })
      expect(C.orderedSylIds(), 'the premise: the first came in').toContain('sckrtwoa')
      /* (an unsaved chart edit made while the box is up, so the door has its question to ask — the Tracker's own test hook) */
      await act(async () => { (window as any).__markDirtyForTests() })
      let p: Promise<boolean> | null = null
      await act(async () => { p = trackerSwitchAskAtDoor('149') })
      await askedWith('Save them before switching to 149?')
      await act(async () => { await Promise.race([job, new Promise(r => setTimeout(r, 300))]) })
      await settle()
      expect(C.orderedSylIds(), 'the third never came in').not.toContain('sckrtwoc')
      await press($('#dlgCancel'), 'Stay')
      expect(await p).toBe(false)
      expect(C.dlg ?? null, 'no further question').toBeNull()
    } finally { delete (window as any).__pickOpenForTests }
  })
  it('4: the question standing (a pick\'s, over Inputs), a second door asks: the old one answered Stay — the pick never made — and the new question drawn, its flag never cleared under it', async () => {
    await app('hunter')
    await openTrkAsk()
    expect(trackerAsking(), 'the premise: the pick\'s question stands').toBe(true)
    let p: Promise<boolean> | null = null
    await act(async () => { p = trackerSwitchAskAtDoor('the member view') })
    await askedWith('Save them before switching to the member view?')
    await settle()
    expect([UNIT, trackerAsking()], 'the pick never made; the new question still up').toEqual(['u142', true])
    await press($('#dlgCancel'), 'Stay')
    expect(await p).toBe(false)
    expect(trackerAsking(), 'gone').toBe(false)
  })
  it('nothing to ask (no unsaved chart edit): null, nothing drawn — as trackerSwitchAsk', async () => {
    await app('hunter')
    await goTracker()
    expect(trackerSwitchAskAtDoor('149'), 'nothing to ask').toBeNull()
  })
})

/* ================= 7 — a save the closing started ================= */
describe('7 — a save the closing started is waited for with the doors\' one wait (D2838, D2627 A9)', () => {
  it('it lands: the door waits — 142 still in view, the window already closed — then enters 149', async () => {
    noBlock('pick')
    const s = await templateTypedAndWatched()
    await pressDoor('u149')
    expect(s.sent.length + (s.pm.status === 'unsaved' ? 1 : 0), 'the premise: the closing started a save').toBeGreaterThan(0)
    expect([UNIT, TPLEDIT], 'waiting: 142, the window closed').toEqual(['u142', false])
    await s.answer(true)
    expect(UNIT, 'entered once it landed').toBe('u149')
    expect(note(), 'no note').toBe('')
  })
  it('it fails: refused with the Retry note, 142 still in view, what was closed stays closed (D2838, D2594)', async () => {
    noBlock('pick')
    const s = await templateTypedAndWatched()
    await pressDoor('u149')
    await s.answer(false)
    expect(UNIT, '142 still in view').toBe('u142')
    expect(note(), 'the Retry note').toBe(`Blocked: ${GUARD_LEADS.retry}, then ${GUARD_ENDINGS.pick('149')}`)
    expect(TPLEDIT, 'the window stays closed').toBe(false)
  })
  it('a press during that wait (a pointer-down elsewhere): the door dropped — nothing entered, nothing said; the window stays closed', async () => {
    noBlock('pick')
    const s = await templateTypedAndWatched()
    await pressDoor('u149')
    await act(async () => { fireEvent.pointerDown(document.body) })
    await s.answer(true)
    expect([UNIT, note(), TPLEDIT]).toEqual(['u142', '', false])
  })
})

/* ================= guardAsk and NO_BLOCK_DOORS ================= */
describe('guardAsk — a door in NO_BLOCK_DOORS is refused for "Not saved" only (D2825, D2594)', () => {
  it('NO_BLOCK_DOORS is empty as shipped: nothing he sees changes in this step', () => {
    expect(NO_BLOCK_DOORS.size).toBe(0)
  })
  it('the Input window open: the pick (put in the set by this test) is not refused; the switch to the member view (not in it) still is', async () => {
    noBlock('pick')
    await app('hunter')
    await doing(() => setPage('inputs'))
    await windowWithWords(ownInput())
    expect(refusalAt('pick', 'u149'), 'the pick: not refused').toBeNull()
    expect(refusalAt('toMember', ''), 'the switch: refused for the window').toMatchObject({ reason: 'window', id: 'inputedit' })
  })
  it('"Not saved" with the Input window open: the pick in the set is refused for the change not saved, not the window', async () => {
    noBlock('pick')
    await app('hunter')
    await doing(() => setPage('inputs'))
    await windowWithWords(ownInput())
    saver.status = 'failed'; await doing(() => watchSaves(saver as any))
    expect(refusalAt('pick', 'u149'), 'refused for "Not saved"').toEqual({ reason: 'unsaved', id: 'unsaved', where: 'any' })
  })
  it('(the control, passes on the old code too) with the set left empty the pick is refused for the Input window, as before', async () => {
    await app('hunter')
    await doing(() => setPage('inputs'))
    await windowWithWords(ownInput())
    expect(refusalAt('pick', 'u149')).toMatchObject({ reason: 'window', id: 'inputedit' })
  })
})

/* ================= the entry checker re-pointed (§7) ================= */
describe('the entry checker — for a door in NO_BLOCK_DOORS the old work must be closed before the entry (the plan §7)', () => {
  it('its own rule: a converted door\'s entry with a row still open fails, whatever the guard\'s refusal says; with nothing open it passes; another door keeps the old check', () => {
    let open: string | null = 'inputedit'
    const c = makeEntryChecker({ ask: () => null, openRows: () => [], noBlock: d => d === 'pick', open: () => open })
    c.hooks.leave('pick', 'u149', {})
    expect(() => c.hooks.entry('enter', 'u149'), 'a window still open').toThrow(/"inputedit" still open/)
    open = null
    c.hooks.leave('pick', 'u149', {})
    expect(() => c.hooks.entry('enter', 'u149'), 'nothing open').not.toThrow()
    open = 'inputedit'
    c.hooks.leave('toMember', '', {})
    expect(() => c.hooks.entry('switch', 'member'), 'another door: the guard\'s answer (null) decides').not.toThrow()
  })
  it('installed: the pick in the set, the Input window open, an entry made without the closing step — failed by name', async () => {
    noBlock('pick')
    await app('hunter')
    await doing(() => setPage('inputs'))
    await windowWithWords(ownInput())
    let thrown = ''
    await act(async () => {
      expect(refuse('pick', 'u149'), 'the premise: not refused').toBe(false)
      try { enterSquadron('u149', false, true) } catch (e) { thrown = String((e as Error).message) }
    })
    INSTALLED.failures.splice(0)
    expect(thrown).toMatch(/\[entry-checker\].*"inputedit" still open/)
  })
  it('installed: the same press through the whole door (the closing step first) passes the checker', async () => {
    noBlock('pick')
    await app('hunter')
    await doing(() => setPage('inputs'))
    await windowWithWords(ownInput())
    await pressDoor('u149')
    expect([UNIT, INPEDIT], 'through, the window closed').toEqual(['u149', null])
    expect(INSTALLED.failures, 'the checker content').toEqual([])
  })
  it('(the control, passes on the old code too) its second check stays for "Not saved": a window opened in the turn of a refusal fails by name', async () => {
    await app('hunter')
    await doing(() => setPage('editsched'))
    saver.status = 'failed'; await doing(() => watchSaves(saver as any))
    await act(async () => {
      expect(refuse('pick', 'u149'), 'the premise: refused for "Not saved"').toBe(true)
      setInpEdit(ownInput())
    })
    await act(async () => { await Promise.resolve() })
    const got = INSTALLED.failures.splice(0)
    expect(got.join('\n')).toMatch(/opened behind a refusal: .*inputdlg/)
    await doing(() => setInpEdit(null))
  })
})
