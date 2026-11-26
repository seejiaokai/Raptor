// @vitest-environment jsdom
/* PART A'S OWN TESTS — ONE ANSWER TO "WHAT IS OPEN" (the guard rail's plan,
   docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §3.5; K1a, the first of three passes, chat 198).

   Each window is opened through the app's own opener — the press, or the function the app's own button calls — and
   drawn by its own component (the whole app, ui/App.tsx), never by writing a module flag by hand. The rows of this pass
   are those whose state is a module's own; a row of K1b or K1c is named in TO_COME below, with the test that owes it.
   No door asks the guard yet: A14 and A15 are pins, green on today's code (nothing calls the seam), named so.

   The world: three squadrons (test-support/msq-world.ts withThird — his D2630). Hunter, 142's admin with Plan of 149
   and View of 150, is the one who opens the windows; Wed 15 Jul 26, 09:00. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, act, fireEvent, cleanup } from '@testing-library/react'
import { withThird, third, signInAs, PID, ACCT, moveMan, pastMidnight } from '../test-support/msq-world'
import { App } from './App'
import { INPUTS, inpId } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { notify, resetSession, writeInputs } from '../state/store'
import { pageUnit, switchRoleInForce } from '../state/perms'
import { saveAccess } from '../state/accounts'
import { homeOn, todayIso } from '../state/units'
import { CURPAGE, setPage, setInpView, setInpMode, setCalMonth, setAvailWin, AVAILWIN, CHGWIN, setChgWin, setBoardDay, setOilWait } from '../state/view'
import { setInpEdit, setDayPop, setWeekCal, setAirKey, setDocView, setDrawer, setTplEdit, setWaveEdit, setDayTplEdit, setDraftsEdit, setDaysWin, setInpSet, setSansSet, setOilList, setInsights, INSIGHTS, setMedMove, setBellList } from './pops'
import { openChanges } from './changesopen'
import { closeScheduler } from './board'
import { commitChipMove } from './caldrag'
import { openDayPanel, dayPanelDate, closeDayPanel } from '../leavewar/ui/daypanelopen'
import { setStorageKept } from './savestatus-source'
import { watchSaves } from '../storage/savewait'
import { _resetFloatWins } from './winorder'
import { UNIT } from '../engine/unitview'
import { GUARD_ROWS, whatIsOpen, closeShown, guardAsk, guardCloseShown, rowRefuses, workOn, type GuardRow } from './guard'
import { setGuardAsk, setGuardClose } from '../state/guard'
import { DAYSWIN, INPSET, SANSSET } from './pops'
import { LGEDIT, setLgEdit } from '../state/auth'
import { switchRoleViewRaw } from '../state/store'
import { requestAccess } from '../state/accounts'
import { archivePerson } from '../leavewar/sync'
import { setDayAward } from '../leavewar/state/store'
import { NEW_PLACE } from './squadrons-model'
import { VCONF, RULE_SPEC, ruleFmt } from '../engine/rules'
import { holidayAdd } from '../leavewar/sync'
import { me } from '../state/perms'
import { HOOKS } from '../engine/hooks'
/* K2b — "Add a person": its date box, and the day the post-in date opens on */
import { boxValue, pickDate } from './datecal-testkit'
import { effectiveToday } from '../state/person-delete'
/* K1c — the Tracker: its engine (the same module the page's lazy chunk loads), its bridge, the guard's view of it */
import * as TRK from '../tracker/app/core.js'
import { endTrackerSession, trackerWindowsOpen, trackerAsking } from '../tracker/role.js'
import { getPeople } from '../tracker/people.js'
import { pageOffered, setTrkUnitProbe } from '../state/perms'
import { trackerCover, holdNow } from '../state/typing-hold'
import { enterSquadron } from '../state/store'
import { rowReachable } from './guard'
import { setStorageMaker, storageUnit } from '../tracker/storage.js'
import { Whiteboard } from '../storage/whiteboard'
import { trackerTarget } from '../storage/adapters'
/* the openers and helpers, shared with ui/msq-guard-note.test.tsx (K3 — moved whole, nothing changed) */
import { openHolidayNoLeave } from '../test-support/msq-guard-testkit'
import { $, C, MM, OPEN,type Opener, SHEET, TRK_OPENERS, TRK_WB, app, asSaber, bootTrkProbe, chartEdit, doing, drawnBox, escape, ev0, goAdmin, goInputsCal, goLeaveWar, goTracker, guardTeardown, linkedStudent, medicalClash, named, openAddForm, openAddPerson, openArchRow, openBoard, openGiveAccess, openHolImport, openLeaveFiled, openOilRevise, openOwnAward, openQualsNew, openTrkAsk, openUserRow, otherMan, ownInput, phoneWidth, press, ptr, readSheet, rosterMan, row, saver, sel, settle, tap, tid, topPick, trkDo, trkOpen, typeIn, warAsRanger, x } from '../test-support/msq-guard-testkit'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()

/* what a later pass owes this file (the brief's TO_COME): each test and row, with the step that owes it — K1c, the last
   pass of part A, took off the Tracker's halves (A7, A8, A11, A13, A14, A15); K2b took off A6's "Add a person" half (the
   form's report, addperson); its last test proves the list empty */
export const TO_COME: { what: string; pass: string }[] = []
afterEach(guardTeardown)

describe('A1 — nothing open', () => {
  it('an admin at home', async () => { await app('hunter'); expect(whatIsOpen()).toBeNull() })
  it('an admin by Plan on 149', async () => { await app('hunter'); await topPick('u149'); expect(UNIT).toBe('u149'); expect(whatIsOpen()).toBeNull() })
  it('a master admin', async () => { await app('saber'); expect(whatIsOpen()).toBeNull() })
  it('a member with View, on 149', async () => { await app('ranger'); await topPick('u149'); expect(UNIT).toBe('u149'); expect(whatIsOpen()).toBeNull() })
})

describe('A2 — every row that counts is seen, and gone when it closes', () => {
  /* (every row that can refuse — a window, a row, a change not saved, and since K1b a window that refuses only once changed) */
  const counting = GUARD_ROWS.filter(rowRefuses)
  it('every counting row has its opener and its ways out here (a row with no entry fails)', () => {
    expect(counting.filter(r => !OPEN[r.id]).map(r => r.id)).toEqual([])
    expect(counting.filter(r => OPEN[r.id] && !Object.keys(OPEN[r.id]!.outs).length).map(r => r.id), 'each row has a way out').toEqual([])
  })
  for (const r of counting) {
    const o = OPEN[r.id]
    if (!o) continue
    for (const [how, out] of Object.entries(o.outs)) {
      it(`${r.id} — opened, it is named; ${how} → nothing open`, async () => {
        await app('hunter')
        await o.open()
        expect(named(), `${r.id} opened`).toBe(r.id)
        await out()
        expect(named(), `${r.id} after ${how}`).toBe(o.under ?? null)
      })
    }
  }
})

describe('A3 — what does not count, and what closes', () => {
  /* the "no" rows whose state is a module's own, each opened by what the app calls (the lists, menus and modes held in a
     component's own state, and H13's typing, are "no" rows too — nothing of them can be named) */
  const NO_OPEN: Record<string, () => Promise<void>> = {
    daypop: async () => { await doing(() => { setPage('viewsched'); setDayPop(0) }) },
    weekcal: async () => { await doing(() => { setPage('viewsched'); setWeekCal('view') }) },
    docview: async () => { await doing(() => setDocView({ row: { person: rosterMan(), type: 'OML', date: 'Jul 10' }, up: false })) },
    belllist: async () => { await press($('#notifyBell'), 'the bell') },
    drawer: async () => { await doing(() => setDrawer(true)) },
    board: async () => { await openBoard() },
    lgedit: async () => { await doing(() => setPage('logic')); await press($('#lgEdit'), 'Logic\'s ✎ Edit') },
    qedit: async () => { await doing(() => setPage('quals')); await press($('#qEdit'), 'Quals\' ✎ Edit') },
  }
  for (const [id, open] of Object.entries(NO_OPEN)) {
    it(`"${id}" (a "no" row) opened → nothing open`, async () => {
      expect(row(id).counts).toBe('no')
      await app('hunter')
      await open()
      expect(whatIsOpen()).toBeNull()
    })
  }
  it('every "no" row carries its reason', () => {
    for (const r of GUARD_ROWS.filter(x => x.counts === 'no')) expect(r.why, r.id).toBeTruthy()
  })

  const avail = () => setAvailWin({ di: 0, item: 'x', ver: '', name: 'x', when: '', tab: 'who' } as any)
  /* each "closes" row: opened by its door, its box, and how to read that it is closed */
  const SHOWN: Record<string, { open: () => Promise<void>; box: string; shut: () => boolean }> = {
    avail: { open: async () => { await doing(() => { setPage('editsched'); avail() }) }, box: '.availwin', shut: () => !AVAILWIN },
    chg: { open: async () => { await doing(() => { setPage('editsched'); openChanges('week', 'all') }) }, box: '.chgwin', shut: () => !CHGWIN },
    insights: { open: async () => { await doing(() => setInsights(true)) }, box: '#insightModal', shut: () => !INSIGHTS },
    sansday: { open: async () => { await goInputsCal('sans'); await tap(tid('sc-day-2026-07-15'), 'the 15th on the SANS calendar') }, box: '[data-testid="win-sansday"]', shut: () => !tid('win-sansday') },
    lwday: { open: async () => { await goLeaveWar(); await doing(() => openDayPanel('2026-07-15')) }, box: '[data-testid="win-lwday"]', shut: () => dayPanelDate() === null },
    /* K1b, on his answers: the Calendar and the two settings windows with nothing changed (D2654 E1); the two Leave War
       sheets that only show things, each opened by its own door (D2740) */
    days: { open: async () => { await doing(() => setDaysWin('2026-07-01')) }, box: '[data-testid="win-days"]', shut: () => !DAYSWIN },
    inputsset: { open: async () => { await goInputsCal('member'); await doing(() => setInpSet(true)) }, box: '[data-testid="win-inputsset"]', shut: () => !INPSET },
    sansset: { open: async () => { await goInputsCal('sans'); await doing(() => setSansSet(true)) }, box: '[data-testid="win-sansset"]', shut: () => !SANSSET },
    lwshow: { open: openLeaveFiled, box: '[data-testid="raptor-sheet"]', shut: () => !tid('raptor-sheet') },
    /* K1c, the Tracker's four (D2597; D2654 E2, E4) */
    trkinfo: { open: async () => { await goTracker(); await TRK_OPENERS.bubble!() }, box: '#detailBubble[style*="display: block"]', shut: () => !$('#detailBubble[style*="display: block"]') },
    trkpop: { open: async () => { await goTracker(); await TRK_OPENERS.pop!() }, box: '#pop', shut: () => !C.pop },
    trkdown: { open: async () => { await goTracker(); await TRK_OPENERS.downLog!() }, box: '#downLog', shut: () => !C.downLog },
    trkfail: { open: async () => { await goTracker(); await TRK_OPENERS.failLog!() }, box: '#failLog', shut: () => !C.failLog },
  }
  it('every "closes" row has its opener here', () => {
    expect(GUARD_ROWS.filter(r => r.counts === 'closes' && !SHOWN[r.id]).map(r => r.id)).toEqual([])
  })
  for (const [id, s] of Object.entries(SHOWN)) {
    it(`${id} — opened, it is never named; closeShown() closes it by its own closer, its box gone`, async () => {
      expect(row(id).counts).toBe('closes')
      await app('hunter')
      await s.open()
      expect(drawnBox(s.box), `the premise: ${id} is drawn`).toBe(true)
      expect(row(id).open(), `${id}'s row reads it open`).toBe(true)
      expect(whatIsOpen(), 'a window that only shows things never refuses').toBeNull()
      await act(async () => { closeShown() })
      await settle()
      expect(s.shut(), `${id} closed`).toBe(true)
      expect(drawnBox(s.box), `${id}'s box gone`).toBe(false)
      expect(row(id).open()).toBe(false)
    })
  }
  it('closeShown() closes the show-only windows and leaves an Input window beside them as it was', async () => {
    await app('hunter')
    const inp = ownInput()
    await doing(() => { setPage('editsched'); avail(); openChanges('week', 'all'); setInsights(true); setInpEdit(inp) })
    expect(named(), 'the Input dialog is what counts').toBe('inputdlg')
    await act(async () => { closeShown() })
    await settle()
    expect([!!AVAILWIN, !!CHGWIN, INSIGHTS]).toEqual([false, false, false])
    expect(named(), 'the Input dialog stays').toBe('inputdlg')
    expect(drawnBox('#inpEditPop')).toBe(true)
  })
  it('Changes folded to its bar (the phone\'s "Hide"): closed the same', async () => {
    await app('hunter')
    await doing(() => { setPage('editsched'); openChanges('week', 'all') })
    await doing(() => setChgWin({ ...CHGWIN!, bar: true } as any))
    expect(row('chg').open()).toBe(true)
    await act(async () => { closeShown() })
    expect(CHGWIN).toBeNull()
  })
  it('with nothing open closeShown() does nothing', async () => {
    await app('hunter')
    await act(async () => { closeShown() })
    expect(whatIsOpen()).toBeNull()
  })
})

describe('A3 (K1b) — the Leave War\'s two show-only sheets, and the two edit modes\' end', () => {
  for (const [name, open, box] of [['Leave filed on the Inputs page', openLeaveFiled, 'raptor-sheet'], ['Your OIL award', openOwnAward, 'award-sheet']] as const) {
    it(`"${name}", opened by its own door: never named; closeShown() closes it by its own closer`, async () => {
      await app('hunter')
      await open()
      expect(row('lwshow').open() && !row('lwsheet').open(), 'the premise: the show-only row reads it, the refusing row does not').toBe(true)
      expect(whatIsOpen(), 'a sheet that only shows things never refuses (D2740)').toBeNull()
      await act(async () => { closeShown() })
      await settle()
      expect(tid(box), 'closed').toBeNull()
      expect(row('lwshow').open()).toBe(false)
    })
  }
  it('an unmarked sheet beside a show-only one: the unmarked one is named, and closeShown() leaves it as it was', async () => {
    await app('hunter')
    await openLeaveFiled()
    await press(tid(`person-${PID.ranger}`), 'his own name on the grid')
    expect(tid('person-window') && tid('raptor-sheet'), 'the premise: both up').toBeTruthy()
    expect(named()).toBe('lwsheet')
    await act(async () => { closeShown() })
    await settle()
    expect(tid('raptor-sheet'), 'the show-only sheet closed').toBeNull()
    expect(tid('person-window'), 'his window as it was').not.toBeNull()
    expect(named()).toBe('lwsheet')
  })
  it('closeShown() ends Logic\'s edit mode, a value still waiting its beat written first, to the squadron it was typed for', async () => {
    await app('hunter')
    await doing(() => setPage('logic'))
    await press($('#lgEdit'), 'Logic\'s ✎ Edit')
    const box = $('input[data-lgset]') as HTMLInputElement
    expect(box, 'a setting\'s box').not.toBeNull()
    const k = box.dataset.lgset!
    const spec = RULE_SPEC[k]!, was = VCONF[k]
    const want = was === spec.hi ? spec.lo : spec.hi
    /* typed and left (its change raised), then a door's last step in the same moment — before its beat */
    vi.mocked(HOOKS.toast).mockClear()
    act(() => { box.value = ruleFmt(k, want); fireEvent.change(box); expect(VCONF[k], 'the premise: still waiting').toBe(was); closeShown()
      /* §18.1: at a door the squadron changes straight after closeShown(), so the value must be written NOW — the page's
         own late write (a timer, a beat later) would land on the squadron picked */
      expect(VCONF[k], 'written at once, before any timer').toBe(want) })
    await settle()
    expect(VCONF[k], 'written before the mode ended').toBe(want)
    expect(!!LGEDIT, 'the mode off').toBe(false)
    expect($('#lgEdit')?.hidden, '✎ Edit back').toBe(false)
    expect(HOOKS.toast, 'nothing said: Logic\'s Done says nothing, and a door ending the mode neither').not.toHaveBeenCalled()
  })
  it('closeShown() ends Quals\' edit mode — editing, Edit quals and an armed ✕ — and never says "Quals saved"', async () => {
    await app('hunter')
    await doing(() => setPage('quals'))
    await press($('#qEdit'), 'Quals\' ✎ Edit')
    await press($('#qEditQuals'), 'Edit quals')
    expect(row('qedit').open(), 'the premise: the mode handed over').toBe(true)
    await act(async () => { closeShown() })
    await settle()
    expect($('#qEdit')?.hidden, '✎ Edit back').toBe(false)
    expect($('#qSave')?.hidden, 'no Done').toBe(true)
    expect($('#qQualBar'), 'Edit quals off').toBeNull()
    expect(row('qedit').open()).toBe(false)
    expect(HOOKS.toast).not.toHaveBeenCalledWith('Quals saved')
  })
  it('with neither mode on, closeShown() ends nothing', async () => {
    await app('hunter')
    await doing(() => setPage('logic'))
    await act(async () => { closeShown() })
    expect(!!LGEDIT).toBe(false)
  })
})

describe('A6 — a Users row, and Admin\'s other forms (D2595, D2598)', () => {
  it('a man\'s row: opened → nothing; a letter typed in Sign-in → row; put back → nothing', async () => {
    await app('hunter')
    await openUserRow()
    expect(whatIsOpen(), 'opened, nothing changed').toBeNull()
    const box = $('#accEdName, #accGiveName') as HTMLInputElement
    const was = box.value
    await typeIn('#accEdName, #accGiveName', was + 'x')
    expect(whatIsOpen()).toMatchObject({ reason: 'row', row: { id: 'userrow' } })
    await typeIn('#accEdName, #accGiveName', was)
    expect(whatIsOpen(), 'put back as it was').toBeNull()
  })
  it('the Role changed alone → row; put back → nothing', async () => {
    await app('hunter')
    await openUserRow()
    const role = $('#accEdRole, #accGiveRole') as HTMLSelectElement
    const was = role.value
    await typeIn('#accEdRole, #accGiveRole', was === 'admin' ? 'main' : 'admin')
    expect(named()).toBe('userrow')
    await typeIn('#accEdRole, #accGiveRole', was)
    expect(named()).toBeNull()
  })
  it('a squadron\'s line changed alone → row', async () => {
    await app('hunter')
    await openUserRow()
    const line = [...document.querySelectorAll<HTMLButtonElement>('.od-row-on [data-line]')].find(b => !b.disabled && b.getAttribute('aria-pressed') !== 'true')
    expect(line, 'the premise: a line he may change').toBeTruthy()
    await press(line!, 'a squadron\'s line')
    expect(named()).toBe('userrow')
  })
  it('changed, then another Admin section shown: still the row (D2627 A6); then the Inputs tab: nothing (the page unmounts)', async () => {
    await app('hunter')
    await openUserRow()
    await typeIn('#accEdName, #accGiveName', 'someone.else@mail')
    await press([...document.querySelectorAll('.adm-cat')].find(b => b.textContent?.startsWith('Squadrons')) || null, 'Squadrons')
    expect(named(), 'the section hidden, not removed').toBe('userrow')
    await doing(() => setPage('inputs'))
    expect(whatIsOpen()).toBeNull()
  })
  it('an archived man\'s row: opened → nothing; the callsign changed → row; the post-in date moved → row', async () => {
    await app('hunter')
    await openArchRow()
    expect(whatIsOpen()).toBeNull()
    await typeIn('#accArCs', 'Zed')
    expect(named()).toBe('archrow')
    await press($('#accArCancel'), 'Cancel')
    expect(whatIsOpen()).toBeNull()
  })
  it('Give access: opened, nothing changed → nothing; a word typed → row', async () => {
    await app('hunter')
    await openGiveAccess()
    expect(whatIsOpen()).toBeNull()
    await typeIn('#apvRole', 'admin')
    expect(named()).toBe('giveaccess')
  })
  it('"+ New squadron": opened, nothing in it → nothing; a number typed → row', async () => {
    await app('hunter')
    await asSaber()
    await goAdmin('Squadrons')
    await press($('#sqNew'), '+ New squadron')
    expect(whatIsOpen()).toBeNull()
    await typeIn('#sqNewNum', '151')
    expect(named()).toBe('newsqn')
    await typeIn('#sqNewNum', '')
    expect(whatIsOpen(), 'emptied again').toBeNull()
  })
  it('a squadron\'s move and a place being edited (a reading — §3.2 (h)): opened → nothing; a change → row', async () => {
    await app('hunter')
    await asSaber()
    await goAdmin('Squadrons')
    await press($('#sqList [data-unit="u142"] .acc-tap'), '142\'s row')
    expect(whatIsOpen()).toBeNull()
    await typeIn('#sqPlace', NEW_PLACE)
    expect(named()).toBe('sqnmove')
    await press($('#sqMoveCancel'), 'Cancel')
    await press($('#sqPlaces [data-place] .acc-tap'), 'the place\'s row')
    expect(whatIsOpen()).toBeNull()
    await typeIn('#plName', 'Home base two')
    expect(named()).toBe('placeedit')
  })
})

describe('A6 (K2b) — "Add a person" (§18.3; D2598: counted once something is in it; D2729 Q10)', () => {
  /* the form as it stands — the role box only while a sign-in is typed (msq-guard-g.test.tsx's reading) */
  const addFields = () => {
    const v = (s: string) => ($(s) as HTMLInputElement | HTMLSelectElement | null)?.value ?? null
    return { cs: v('#accAddCs'), ini: v('#accAddIni'), seat: v('#accAddSeat'), cat: v('#accAddCat'), name: v('#accAddName'), role: v('#accAddRole'), postIn: $('#accAddPostIn') ? boxValue($('#accAddPostIn')!) : null }
  }
  const FRESH = () => ({ cs: '', ini: '', seat: '', cat: '', name: '', role: null, postIn: effectiveToday() })
  const postIn = async (iso: string) => { pickDate($('#accAddPostIn')!, iso); await settle() }
  it('opened by its button, nothing in it → nothing; a callsign typed → the row; put back as it opened → nothing', async () => {
    await app('hunter')
    await openAddForm()
    expect(whatIsOpen(), 'open and untouched').toBeNull()
    await typeIn('#accAddCs', 'Nova')
    expect(whatIsOpen()).toMatchObject({ reason: 'row', row: { id: 'addperson' } })
    await typeIn('#accAddCs', '')
    expect(whatIsOpen(), 'put back as it opened').toBeNull()
  })
  it('each other field changed alone → the row; put back → nothing: the initials, the seat, the sign-in, the post-in date', async () => {
    await app('hunter')
    await openAddForm()
    for (const [box, v] of [['#accAddIni', 'NV'], ['#accAddSeat', 'FCP'], ['#accAddName', 'nova@mail']] as const) {
      await typeIn(box, v)
      expect(named(), `${box} changed alone`).toBe('addperson')
      await typeIn(box, '')
      expect(whatIsOpen(), `${box} put back`).toBeNull()
    }
    await postIn('2026-07-20')
    expect(addFields().postIn, 'the premise: the date moved off today').toBe('2026-07-20')
    expect(named(), 'the post-in date moved off today').toBe('addperson')
    await postIn(effectiveToday())
    expect(whatIsOpen(), 'the post-in date back on today').toBeNull()
  })
  it('the CAT (it needs a seat to be picked): the seat and CAT → the row; the CAT put back with the seat still picked → still the row; the seat put back → nothing', async () => {
    await app('hunter')
    await openAddForm()
    await typeIn('#accAddSeat', 'FCP')
    await typeIn('#accAddCat', 'B')
    expect(named()).toBe('addperson')
    await typeIn('#accAddCat', '')
    expect(named(), 'the seat still differs').toBe('addperson')
    await typeIn('#accAddSeat', '')
    expect(addFields(), 'the premise: as it opened').toEqual(FRESH())
    expect(whatIsOpen()).toBeNull()
  })
  it('the Role off Member → the row, even once the sign-in is cleared and its box hidden; back on Member and cleared → nothing', async () => {
    await app('hunter')
    await openAddForm()
    await typeIn('#accAddName', 'nova@mail')
    await typeIn('#accAddRole', 'admin')
    await typeIn('#accAddName', '')
    expect($('#accAddRole'), 'the premise: the Role box hidden with no sign-in').toBeNull()
    expect(named(), 'the Role still differs from how it opened').toBe('addperson')
    await typeIn('#accAddName', 'nova@mail')
    await typeIn('#accAddRole', 'main')
    await typeIn('#accAddName', '')
    expect(whatIsOpen()).toBeNull()
  })
  for (const [how, out] of [['Cancel', () => press($('#accAddCancel'), 'Cancel')], ['Escape', escape]] as const) {
    it(`every field changed, then ${how} → nothing: the form folded shut, and opened again empty`, async () => {
      await app('hunter')
      await openAddForm()
      for (const [box, v] of [['#accAddCs', 'Nova'], ['#accAddIni', 'NV'], ['#accAddSeat', 'FCP'], ['#accAddCat', 'B'], ['#accAddName', 'nova@mail'], ['#accAddRole', 'admin']] as const) await typeIn(box, v)
      await postIn('2026-07-20')
      expect(named(), 'the premise').toBe('addperson')
      if (how === 'Escape') ($('#accAddCs') as HTMLInputElement).focus()
      await out()
      expect(whatIsOpen()).toBeNull()
      expect($('#accAddBlock'), 'folded shut').toBeNull()
      await press($('#accAddOpen'), '+ Add a person')
      expect(addFields(), 'empty').toEqual(FRESH())
      expect(whatIsOpen()).toBeNull()
    })
  }
  it('opened and untouched, then the day turns (the app\'s own midnight wake, the page drawn again) → nothing; the post-in date then moved by hand → the row', async () => {
    await app('hunter')
    await openAddForm()
    const opened = addFields().postIn
    expect(whatIsOpen(), 'the premise: open and untouched').toBeNull()
    await act(async () => { pastMidnight() }); await settle()
    await doing(() => {})
    expect(effectiveToday(), 'the premise: the day has turned').not.toBe(opened)
    expect(addFields().postIn, 'the form still shows the date it opened on, as today').toBe(opened)
    expect(whatIsOpen(), 'still untouched: nothing').toBeNull()
    await postIn('2026-07-20')
    expect(named(), 'the post-in date moved by hand').toBe('addperson')
  })
  it('an add that succeeds → the form still open, empty, nothing', async () => {
    await app('hunter')
    await openAddPerson()
    await typeIn('#accAddSeat', 'FCP')
    await typeIn('#accAddCat', 'B')
    expect(named(), 'the premise').toBe('addperson')
    await press($('#accAdd'), 'Add person')
    expect(Object.values(PEOPLE).some((p: any) => p.cs === 'Nova'), 'Nova was added').toBe(true)
    expect($('#accAddBlock'), 'still open').not.toBeNull()
    expect(addFields(), 'empty').toEqual(FRESH())
    expect(whatIsOpen()).toBeNull()
  })
  it('opened by Quals\' "+ Add person", nothing typed → nothing; typed → the row', async () => {
    await app('hunter')
    await doing(() => setPage('quals'))
    await press($('#qAddToggle'), 'Quals\' "+ Add person"')
    expect(CURPAGE, 'the premise: on Admin').toBe('admin')
    expect($('#accAddBlock'), 'the premise: the form open').not.toBeNull()
    expect(whatIsOpen()).toBeNull()
    await typeIn('#accAddCs', 'Nova')
    expect(named()).toBe('addperson')
  })
  it('typed, then another Admin section shown: still the row (D2627 A6 — hidden, not removed); then the Inputs tab: nothing (the page unmounts)', async () => {
    await app('hunter')
    await openAddPerson()
    await press([...document.querySelectorAll('.adm-cat')].find(b => b.textContent?.startsWith('Squadrons')) || null, 'Squadrons')
    expect(named(), 'the section hidden, not removed').toBe('addperson')
    await doing(() => setPage('inputs'))
    expect(whatIsOpen()).toBeNull()
  })
})

describe('A7 (the Leave War\'s half) — a window on a page out of sight', () => {
  it('pin — a person\'s window behind the Inputs tab: the war\'s row still answers, its tab offered; his Plan of 149 lowered to View: taken home to 142, the window still refuses', async () => {
    await app('hunter')
    await topPick('u149')
    await goLeaveWar()
    await press(document.querySelector(`[data-testid^="person-"]:not([data-testid="person-window"])`), 'a name on the grid')
    expect(tid('person-window'), 'the premise: his window is up').not.toBeNull()
    await doing(() => setPage('inputs'))
    expect(whatIsOpen()).toMatchObject({ reason: 'window', row: { id: 'lwsheet', where: 'leavewar' } })
    signInAs('saber'); expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull(); signInAs('hunter')
    await doing(() => {})
    /* (today a Plan lowered while he is on that squadron takes him home — K0's finding, pinned at K0 — so the plan's "149 now
       offers View-only Sched and Help alone" cannot be reached here: he is on 142, whose Leave War he may open, and the
       window left up behind the Inputs tab still refuses (D2627: "unless the squadron picked no longer offers it" — it does).
       Pinned as today's behaviour; the difference is named in K1b's report) */
    expect({ unit: UNIT, open: whatIsOpen()?.row.id ?? null, sheet: !!tid('person-window') }).toEqual({ unit: 'u142', open: 'lwsheet', sheet: true })
  })
  it('re-pointed at K4 (D2403) — a person\'s window on his own Leave War, then a squadron he only views picked by the bar: the pick is REFUSED first, the window still up on his own war', async () => {
    /* (Hunter holds View of 150 in withThird(). Until step K4 no door asked the guard, so this pin held today's road: the
       pick went through with the window up, the page staying on the Leave War with the window drawn (the held-window road
       of D2323). Since K4 the pick's door asks first and the window refuses it (D2403) — the expectation is the refusal.
       The state "150 picked with that window up" is now reached only by a change he did not make) */
    await app('hunter')
    await goLeaveWar()
    await press(document.querySelector(`[data-testid^="person-"]:not([data-testid="person-window"])`), 'a name on the grid')
    expect(tid('person-window'), 'the premise: his window is up').not.toBeNull()
    expect(named()).toBe('lwsheet')
    await topPick(third.u150)
    expect({ unit: UNIT, sheetOpen: row('lwsheet').open(), drawn: !!tid('person-window'), page: CURPAGE, open: whatIsOpen()?.row.id ?? null })
      .toEqual({ unit: 'u142', sheetOpen: true, drawn: true, page: 'leavewar', open: 'lwsheet' })
  })
  it('pin — the day panel left open behind the Inputs tab: never counted (D2597)', async () => {
    await app('hunter')
    await goLeaveWar()
    await doing(() => openDayPanel('2026-07-15'))
    await doing(() => setPage('inputs'))
    expect(row('lwday').open(), 'the premise: still open').toBe(true)
    expect(whatIsOpen()).toBeNull()
  })
})

describe('A12 — the OIL question from a row of the Inputs list', () => {
  it('the row\'s own OIL chip pressed, no Input window anywhere: the oilrevise row; then Cancel → nothing', async () => {
    await app('hunter')
    await openOilRevise()
    expect(drawnBox('#inpEditPop') || !!tid('win-inputedit'), 'no Input window').toBe(false)
    expect(whatIsOpen()).toMatchObject({ reason: 'window', row: { id: 'oilrevise', where: 'inputs' } })
    await press(tid('oilconf-cancel'), 'Back')
    expect(whatIsOpen()).toBeNull()
  })
  it('behind another page — the question up, then View-only Sched: the page unmounts, nothing', async () => {
    await app('hunter')
    await openOilRevise()
    await doing(() => setPage('viewsched'))
    expect(tid('oilconf')).toBeNull()
    expect(whatIsOpen()).toBeNull()
  })
})

describe('A16 — the Calendar\'s unfinished work, on his E1 answer (D2654)', () => {
  it('the Calendar open, nothing pending: nothing open, and closeShown() closes it', async () => {
    await app('hunter')
    await doing(() => setDaysWin('2026-07-01'))
    expect(whatIsOpen()).toBeNull()
    await act(async () => { closeShown() })
    await settle()
    expect(DAYSWIN).toBeNull()
  })
  it('a holiday sheet read in, its preview waiting for Add: the holimport row; closeShown() leaves the Calendar open; Add → nothing', async () => {
    await app('hunter')
    await openHolImport()
    expect(whatIsOpen()).toMatchObject({ reason: 'window', row: { id: 'holimport' } })
    await act(async () => { closeShown() })
    await settle()
    expect(DAYSWIN, 'the Calendar kept for the sheet').not.toBeNull()
    expect(tid('hol-preview'), 'the preview kept').not.toBeNull()
    if ((tid('hol-pv-add') as HTMLButtonElement).disabled) return   // (no line the war can take: Add is greyed — Cancel is the way out, A2)
    await press(tid('hol-pv-add'), 'Add n holidays')
    expect(whatIsOpen()).toBeNull()
  })
  it('an Add that fails — a holiday added behind the preview: still the row', async () => {
    await app('hunter')
    await openHolImport()
    if ((tid('hol-pv-add') as HTMLButtonElement).disabled) return
    act(() => { holidayAdd({ kind: 'ph', name: 'Sheet day A', from: '2026-05-04', to: '2026-05-04' }) })
    await press(tid('hol-pv-add'), 'Add n holidays')
    expect(tid('hol-pv-err'), 'the premise: refused, read again').not.toBeNull()
    expect(named()).toBe('holimport')
  })
  it('a file whose reading finishes after the Calendar has closed: nothing set, nothing counted', async () => {
    await app('hunter')
    await doing(() => setDaysWin('2026-05-01'))
    const f = new File([SHEET], 'late.csv', { type: 'text/csv' })
    await act(async () => { fireEvent.change(tid('hol-import-file')!, { target: { files: [f] } }); setDaysWin(null); notify() })
    await settle(); await settle()
    expect(DAYSWIN).toBeNull()
    expect(whatIsOpen()).toBeNull()
    expect(workOn('holimport')).toBe(false)
  })
  it('a new holiday: opened → nothing; a name typed → the holiday row; closeShown() leaves the Calendar and the form open', async () => {
    await app('hunter')
    await doing(() => setDaysWin('2026-07-01'))
    await press(tid('hol-add'), 'Add a holiday')
    expect(whatIsOpen(), 'opened, nothing typed').toBeNull()
    await typeIn('[data-testid="hol-name"]', 'Founders')
    expect(whatIsOpen()).toMatchObject({ reason: 'window', row: { id: 'holiday' } })
    await act(async () => { closeShown() })
    await settle()
    expect(tid('win-holiday') && tid('win-days'), 'both kept').toBeTruthy()
  })
  it('an untouched form goes with the Calendar: Every Monday opened and nothing pressed, or "Add a holiday" opened and nothing typed — nothing open, and closeShown() closes the Calendar and the form with it', async () => {
    await app('hunter')
    await doing(() => setDaysWin('2026-07-01'))
    await press(tid('days-wd-0'), 'Every Monday…')
    expect(whatIsOpen(), 'Every Monday, nothing pressed').toBeNull()
    await act(async () => { closeShown() })
    await settle()
    expect({ days: DAYSWIN, win: !!tid('win-days'), every: !!tid('win-every'), open: row('everywd').open() }, 'Every Monday').toEqual({ days: null, win: false, every: false, open: false })
    await doing(() => setDaysWin('2026-07-01'))
    await press(tid('hol-add'), 'Add a holiday')
    expect(whatIsOpen(), 'Add a holiday, nothing typed').toBeNull()
    await act(async () => { closeShown() })
    await settle()
    expect({ days: DAYSWIN, win: !!tid('win-days'), holiday: !!tid('win-holiday'), open: row('holiday').open() }, 'Add a holiday').toEqual({ days: null, win: false, holiday: false, open: false })
  })
  it('a new holiday no leave period covers, refused and kept waiting: still counted', async () => {
    await app('hunter')
    await openHolidayNoLeave()
    expect(tid('hol-err'), 'the premise: refused').not.toBeNull()
    expect(named()).toBe('holiday')
  })
  it('Every Monday opened with one choice lit: nothing; one choice pressed: the everywd row (E9m)', async () => {
    await app('hunter')
    await doing(() => setDaysWin('2026-07-01'))
    await press(tid('days-wd-0'), 'Every Monday…')
    expect(whatIsOpen(), 'as it opens').toBeNull()
    await press(tid('every-cls-day'), 'Day')
    expect(named()).toBe('everywd')
  })
  it('Inputs settings beside the Calendar: nothing changed → nothing, both closed by closeShown(); a setting changed → its row, neither closed', async () => {
    await app('hunter')
    await goInputsCal('member')
    await doing(() => setInpSet(true))
    await press(tid('iset-days'), 'Calendar…')
    expect(whatIsOpen()).toBeNull()
    await act(async () => { closeShown() })
    await settle()
    expect([INPSET, DAYSWIN]).toEqual([false, null])
    await doing(() => setInpSet(true))
    await press(tid('iset-days'), 'Calendar…')
    await press(tid('iset-memberfile'), 'Members may file duties for others')
    expect(named()).toBe('inputsset')
    await act(async () => { closeShown() })
    await settle()
    expect(INPSET, 'changed: kept').toBe(true)
    await press(tid('iset-memberfile'), 'put back')
    expect(whatIsOpen(), 'put back as it opened').toBeNull()
  })
  it('SANS settings: a figure changed → its row; put back → nothing', async () => {
    await app('hunter')
    await goInputsCal('sans')
    await doing(() => setSansSet(true))
    const was = ($('[data-testid="sset-yellow"]') as HTMLInputElement).value
    await typeIn('[data-testid="sset-yellow"]', '2')
    expect(named()).toBe('sansset')
    await typeIn('[data-testid="sset-yellow"]', was)
    expect(whatIsOpen()).toBeNull()
  })
})

describe('A17 — Quals\' "Add qualification" box (D2729 Q2)', () => {
  it('in edit mode, "LOW LEVEL" typed: the qualsnew row; Add → nothing', async () => {
    await app('hunter')
    await openQualsNew()
    expect(whatIsOpen()).toMatchObject({ reason: 'row', row: { id: 'qualsnew', where: 'quals' } })
    await press($('#qAddQualBtn'), 'Add')
    expect(whatIsOpen()).toBeNull()
  })
  it('only spaces typed: nothing', async () => {
    await app('hunter')
    await openQualsNew('   ')
    expect(whatIsOpen()).toBeNull()
  })
  it('pin — Done with words in the box: the box gone, nothing counted; Edit and Edit quals again on the same squadron: the words come back, counted again (as today)', async () => {
    await app('hunter')
    await openQualsNew()
    await press($('#qSave'), 'Done')
    expect($('#qNewQual'), 'the box hidden').toBeNull()
    expect(whatIsOpen()).toBeNull()
    await press($('#qEdit'), '✎ Edit')
    await press($('#qEditQuals'), 'Edit quals')
    expect(($('#qNewQual') as HTMLInputElement).value).toBe('LOW LEVEL')
    expect(named()).toBe('qualsnew')
  })
  it('a closeShown() with words in the box leaves them, never empties the box (end() runs only with it empty — the row refuses first)', async () => {
    await app('hunter')
    await openQualsNew()
    await act(async () => { closeShown() })
    await settle()
    await press($('#qEdit'), '✎ Edit')
    await press($('#qEditQuals'), 'Edit quals')
    expect(($('#qNewQual') as HTMLInputElement).value).toBe('LOW LEVEL')
  })
})

describe('the one behaviour change of K1b — words left hidden in "Add qualification" after Done (§21.1 "K0 — done")', () => {
  it('dropped when the squadron in view changes: typed for 142, hidden by Done, 149 picked — 149\'s box is empty', async () => {
    await app('hunter')
    await openQualsNew()
    await press($('#qSave'), 'Done')
    await topPick('u149')
    expect(UNIT).toBe('u149')
    await press($('#qEdit'), '✎ Edit')
    await press($('#qEditQuals'), 'Edit quals')
    expect(($('#qNewQual') as HTMLInputElement).value, '142\'s words never in 149\'s box').toBe('')
    expect(whatIsOpen()).toBeNull()
  })
  it('…and back on 142 they do not come back either (they went with the change)', async () => {
    await app('hunter')
    await openQualsNew()
    await press($('#qSave'), 'Done')
    await topPick('u149')
    await topPick('u142')
    await press($('#qEdit'), '✎ Edit')
    await press($('#qEditQuals'), 'Edit quals')
    expect(($('#qNewQual') as HTMLInputElement).value).toBe('')
  })
})

describe('B18 (pin, once step 1 exists) — no road to "switch back" with a row open', () => {
  /* (step K5: the switch with a changed row is refused since D2403 — B11, ui/msq-guard-doors-switch.test.tsx — so the member
     view over a changed row is reached by no press; made by the raw switch, switchRoleViewRaw, the switch as it was) */
  it('pin — a row changed on Admin → Users, then the member view: the Admin page is not drawn, and no row of Admin\'s counts — reached by no press since D2403 (step K5: the switch is refused while a row holds a change), so by the raw switch', async () => {
    await app('hunter')
    await openUserRow()
    await typeIn('#accEdName, #accGiveName', 'someone.else@mail')
    expect(named(), 'the premise').toBe('userrow')
    await doing(() => { switchRoleViewRaw() })
    expect($('#admUsers'), 'the Admin page not drawn').toBeNull()
    for (const id of ['userrow', 'archrow', 'giveaccess', 'addperson', 'newsqn', 'sqnmove', 'placeedit'] as const) expect(workOn(id), id).toBe(false)
  })
})

describe('A4 — two open', () => {
  it('an Input window and a failed save: the window\'s row; closed → unsaved; saved → nothing', async () => {
    await app('hunter')
    await OPEN.unsaved!.open()
    await OPEN.inputedit!.open()
    expect(named()).toBe('inputedit')
    expect(whatIsOpen()!.reason).toBe('window')
    await press(tid('win-inputedit-x'), 'the Input window\'s ✕')
    expect(named()).toBe('unsaved')
    expect(whatIsOpen()!.reason).toBe('unsaved')
    await OPEN.unsaved!.outs['Retry landed']!()
    expect(named()).toBeNull()
  })
  it('the OIL list and a second movable window: with the OIL list left out, the second is named', async () => {
    /* (K1b: the Calendar now closes by itself on his E1 answer, D2654 — so the second window is SANS settings with a
       figure changed, which still refuses) */
    await app('hunter')
    await OPEN.sansset!.open()
    await doing(() => { setOilList({ from: '2026-07-18', to: '2026-07-18', name: 'Holiday' }) })
    expect(row('oilday').open() && row('sansset').open(), 'the premise: both up').toBe(true)
    expect(whatIsOpen(['oilday'])?.row.id).toBe('sansset')
    expect(whatIsOpen(['oilday', 'sansset'])).toBeNull()
  })
})

describe('A5 — "Not kept" never counts (D2594)', () => {
  it('setStorageKept(false): nothing open', async () => {
    setStorageKept(false)
    await app('hunter')
    expect($('.savestat.nokeep'), 'the premise: the band is up').not.toBeNull()
    expect(whatIsOpen()).toBeNull()
  })
})

describe('A9 — nothing stale after a sign-out or an unmount', () => {
  it('a sign-out with five windows open: nothing open', async () => {
    await app('hunter')
    await doing(() => { setPage('editsched'); setTplEdit(true); setDaysWin('2026-07-01'); setOilList({ from: '2026-07-18', to: '2026-07-18', name: 'Holiday' }); setInpSet(true); setInsights(true) })
    expect(named(), 'the premise: something open').not.toBeNull()
    await act(async () => { resetSession(null); notify() })
    await settle()
    expect(whatIsOpen()).toBeNull()
  })
  it('a movable window whose page unmounts without its ✕: nothing open', async () => {
    await app('hunter')
    await OPEN.inputsday!.open()
    expect(named()).toBe('inputsday')
    await doing(() => setPage('viewsched'))
    expect(whatIsOpen()).toBeNull()
  })
})

describe('A10 — counted means drawn', () => {
  /* the changes he did not make that the test world can make, each from a fresh open */
  const CHANGES: Record<string, { setup?: () => void; onPick?: string; change: () => Promise<void> }> = {
    'his right in the squadron lowered to View': {
      onPick: 'u149',
      change: async () => {
        signInAs('saber')
        expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull()
        signInAs('hunter')
        await doing(() => {})
      },
    },
    'the role in force changed': { change: async () => { await doing(() => { switchRoleInForce('main') }) } },
    'his move at midnight': {
      setup: () => { signInAs('saber'); expect(moveMan(PID.hunter, third.u150).ok).toBe(true) },
      change: async () => { await act(async () => { pastMidnight() }); await settle() },
    },
    'the page changed by a landing': { change: async () => { await doing(() => setPage(CURPAGE === 'inputs' ? 'viewsched' : 'inputs')) } },
    'the board closed under its dialog': { change: async () => { await doing(() => closeScheduler()) } },
  }
  const counting = GUARD_ROWS.filter(rowRefuses)
  for (const r of counting) {
    for (const [what, c] of Object.entries(CHANGES)) {
      it(`${r.id}, then ${what}: not named, or its box is on the page`, async () => {
        c.setup?.()
        await app('hunter')
        if (c.onPick) await topPick(c.onPick)
        await OPEN[r.id]!.open()
        expect(named(), `the premise: ${r.id} open`).toBe(r.id)
        expect(r.counts === 'unsaved' || drawnBox(r.sel), `the premise: ${r.id}'s box ${r.sel} is drawn`).toBe(true)
        await c.change()
        const still = whatIsOpen()?.row.id === r.id || r.open()
        if (still && r.counts !== 'unsaved') expect(drawnBox(r.sel), `${r.id} still counts after "${what}" — its box ${r.sel} must be on the page`).toBe(true)
      })
    }
  }
  it('the worked case: Duty templates under a lowered Plan — the flag still set, no dialog, nothing open', async () => {
    await app('hunter')
    await topPick('u149')
    await OPEN.dutytpl!.open()
    expect(named()).toBe('dutytpl')
    await CHANGES['his right in the squadron lowered to View']!.change()
    expect(drawnBox('#tplModal'), 'no dialog').toBe(false)
    expect(whatIsOpen()).toBeNull()
  })
})

describe('A14 (pin — no door asks the guard yet) — the guard is not asked on a change he did not make', () => {
  /* (re-pointed at K4: the set-up's pick of 149 is his own press, which since K4 asks the guard as it should — so the spy
     is put on after the set-up, and holds what this pin is for: the changes he did not make never ask) */
  it('pin: his own move at midnight, then a right ended, under an Input window and a Leave War window: never asked', async () => {
    const ask = vi.fn(guardAsk)
    signInAs('saber'); expect(moveMan(PID.hunter, third.u150).ok).toBe(true)
    await app('hunter')
    await topPick('u149')
    await OPEN.lwsheet!.open()
    await OPEN.inputedit!.open()
    expect(named(), 'the premise: something counts').not.toBeNull()
    setGuardAsk(ask)
    await act(async () => { pastMidnight() }); await settle()
    signInAs('saber'); expect(saveAccess(ACCT.hunter, { grants: { u149: 'none' } })).toBeNull(); signInAs('hunter')
    await doing(() => {})
    expect(ask).not.toHaveBeenCalled()
  })
})

describe('A15 (pin — nothing closes yet) — nothing closes at a change he did not make', () => {
  it('pin: ALL AVAIL, Insights, a SANS day and the Leave War\'s day panel open, then his move at midnight, then a right ended: closeShown never called; ALL AVAIL closes and Insights stays, as K0 pinned (P18)', async () => {
    const shut = vi.fn(guardCloseShown)
    setGuardClose(shut)
    signInAs('saber'); expect(moveMan(PID.hunter, third.u150).ok).toBe(true)
    await app('hunter')
    await goLeaveWar(); await doing(() => openDayPanel('2026-07-15'))
    await goInputsCal('sans'); await tap(tid('sc-day-2026-07-15'), 'the 15th on the SANS calendar')
    await doing(() => { setPage('editsched'); setAvailWin({ di: 0, item: 'x', ver: '', name: 'x', when: '', tab: 'who' } as any); setInsights(true) })
    expect([!!AVAILWIN, INSIGHTS, dayPanelDate()], 'the premise').toEqual([true, true, '2026-07-15'])
    await act(async () => { pastMidnight() }); await settle()
    expect(homeOn(PID.hunter, todayIso())).toBe(third.u150)
    expect({ avail: !!AVAILWIN, insights: INSIGHTS }, 'as P18 recorded it').toEqual({ avail: false, insights: true })
    signInAs('saber'); expect(saveAccess(ACCT.hunter, { grants: { u149: 'none' } })).toBeNull(); signInAs('hunter')
    await doing(() => {})
    expect(shut).not.toHaveBeenCalled()
  })
})

/* ================= K1c — THE TRACKER (§3.5 A7's Tracker half, A8, A11, A13, A14's and A15's Tracker halves) ================= */

describe('A8 — the Tracker: each window of its own table reported on the bridge', () => {
  const table = (): { id: string; counts: string; panel?: string }[] => C.TRK_WINDOWS
  it('every window state of TRK_WINDOWS has its opener here (a state with none fails)', () => {
    expect(table().filter(w => w.counts !== 'no' && !TRK_OPENERS[w.id]).map(w => w.id)).toEqual([])
  })
  for (const id of Object.keys(TRK_OPENERS)) {
    it(`${id} — opened by its own opener: reported on the bridge with its count; a window that refuses names the trk row, one that only shows things names nothing`, async () => {
      await app('hunter')
      await goTracker()
      expect(trackerWindowsOpen(), 'the premise: nothing open').toEqual([])
      await TRK_OPENERS[id]!()
      const w = table().find(x => x.id === id)!
      expect(trkOpen(id), `${id} is reported`).toMatchObject({ id, counts: w.counts })
      expect(named(), id).toBe(w.counts === 'window' ? 'trk' : null)
    })
  }
  it('the modes — Edit chart layout and Details mode — are never reported, and nothing is named', async () => {
    await app('hunter')
    await goTracker()
    await trkDo(() => C.toggleArrange())
    expect(C.arrangeMode, 'the premise').toBe(true)
    expect(trackerWindowsOpen()).toEqual([])
    await trkDo(() => C.toggleArrange())
    await trkDo(() => C.toggleDetails())
    expect(C.showDetails, 'the premise').toBe(true)
    expect(trackerWindowsOpen()).toEqual([])
    expect(whatIsOpen()).toBeNull()
    await trkDo(() => C.toggleDetails())
  })
  it('the session\'s end (endTrackerSession) with four open: none reported, nothing named', async () => {
    await app('hunter')
    await goTracker()
    for (const id of ['showAllOpen', 'lullCopy', 'failLog', 'pop']) await TRK_OPENERS[id]!()
    expect(trackerWindowsOpen().length, 'the premise').toBe(4)
    await trkDo(() => endTrackerSession())
    expect(trackerWindowsOpen()).toEqual([])
    expect(whatIsOpen()).toBeNull()
  })
  it('the Tracker never loaded: its bridge, on its own, reports nothing, closes nothing and asks nothing', async () => {
    vi.resetModules()
    const fresh: any = await import('../tracker/role.js')
    expect(fresh.trackerWindowsOpen()).toEqual([])
    expect(fresh.trackerAsking()).toBe(false)
    expect(() => fresh.trackerCloseShown()).not.toThrow()
  })
  it('the unsaved-edits question raised by a pick while the Inputs page shows: the trkask row, the trk row leaving it out; answered → nothing', async () => {
    await app('hunter')
    await openTrkAsk()
    expect(CURPAGE).toBe('inputs')
    expect(whatIsOpen()).toMatchObject({ reason: 'window', row: { id: 'trkask', where: 'any' } })
    expect(row('trk').open(), 'the question box is the trkask row\'s, not the trk row\'s').toBe(false)
    expect(trkOpen('dlg'), 'it is the Tracker\'s question box').toBeTruthy()
    await press($('#dlgCancel'), 'Stay')
    expect(whatIsOpen()).toBeNull()
  })
  it('…with the page\'s cover up (the member view, the Tracker held on 149 for the edits): a Tracker window under the cover is not counted; the question asked over it is — reached by no press since D2403 and D2627 A20 (step K5: the switch is refused with Show All open, and asks about the edits first), so by the raw switch', async () => {
    /* (his road to the cover, his D2395: on 149's Tracker by his Plan, an unsaved chart edit, then the member view — his
       pages go home to 142 and the Tracker is held on 149 for the edits, covered. Since K5 that switch is refused (Show All
       counts) and would ask about the edits first, so the cover is made by the raw switch, switchRoleViewRaw) */
    await app('hunter')
    await topPick('u149')
    await goTracker()
    await vi.waitFor(() => expect(storageUnit(), 'the premise: the Tracker followed the pick').toBe('u149'), { timeout: 10000, interval: 20 })
    await chartEdit()
    await press($('#showAllTab'), 'Show All')
    await doing(() => setPage('inputs'))
    await doing(() => { switchRoleViewRaw() })
    await settle()
    expect({ cover: !!trackerCover(), bound: storageUnit() }, 'the premise: the cover is up, the Tracker held on 149').toEqual({ cover: true, bound: 'u149' })
    expect(C.showAllOpen, 'the premise: Show All still set under it').toBe(true)
    expect(row('trk').open(), 'nothing under the cover can be reached').toBe(false)
    expect(whatIsOpen()).toBeNull()
    /* (the member view keeps 149 in view, a squadron he now only views: the pick that asks is his own squadron's, which
       moves the held Tracker off 149 — state/pick.ts movesTrackerAway) */
    expect(UNIT, 'the premise: 149 still in view').toBe('u149')
    await topPick('u142')
    await vi.waitFor(() => expect(trackerAsking(), 'the question').toBe(true), { timeout: 5000, interval: 10 })
    expect(named()).toBe('trkask')
    await press($('#dlgCancel'), 'Stay')
    expect(whatIsOpen()).toBeNull()
  })
})

describe('A13 — a Tracker window behind the Flow chart tab (his D2654 E4)', () => {
  it('Down days opened on the Info tab, the phone layout then showing the Flow chart: the bridge marks it behind the Info tab; nothing open, and closeShown() closes it', async () => {
    phoneWidth()
    await app('hunter')
    await goTracker()
    await press($('#viewtabs [data-view="info"]'), 'the Info tab')
    await TRK_OPENERS.downLog!()
    expect(trkOpen('downLog'), 'on the Info tab: in sight').toMatchObject({ behind: null })
    await press($('#viewtabs [data-view="flow"]'), 'the Flow chart tab')
    expect(trkOpen('downLog')).toMatchObject({ id: 'downLog', counts: 'closes', behind: 'info' })
    expect(whatIsOpen(), 'it only shows things').toBeNull()
    await act(async () => { closeShown() })
    await settle()
    expect(C.downLog, 'closed').toBeNull()
    expect($('#downLog')).toBeNull()
  })
  it('a lull pop-up holding a choice (its first day picked), behind the Flow chart tab: the trk row, the bridge marking it behind the Info tab; closeShown() leaves it', async () => {
    phoneWidth()
    await app('hunter')
    await goTracker()
    await press($('#viewtabs [data-view="info"]'), 'the Info tab')
    await TRK_OPENERS.lullPick!()
    await press($('#lullCal .day:not(.out)'), 'a first day of the period')
    expect(C.lullPick?.start, 'the premise: a day picked, not yet saved').toBeTruthy()
    await press($('#viewtabs [data-view="flow"]'), 'the Flow chart tab')
    expect(trkOpen('lullPick')).toMatchObject({ id: 'lullPick', counts: 'window', behind: 'info' })
    expect(whatIsOpen()).toMatchObject({ reason: 'window', row: { id: 'trk', where: 'tracker' } })
    await act(async () => { closeShown() })
    await settle()
    expect(C.lullPick?.start, 'its choice kept').toBeTruthy()
  })
  it('on a desktop\'s width the Flow chart tab hides nothing: behind is never set', async () => {
    await app('hunter')
    await goTracker()
    await TRK_OPENERS.failLog!()
    expect(trkOpen('failLog')).toMatchObject({ behind: null })
  })
})

describe('A7 (the Tracker\'s half) — a Tracker window on a page out of sight, and on a page no longer offered', () => {
  it('Show All left up behind the Inputs tab: the trk row still answers, its tab offered (D2627 A7)', async () => {
    await app('hunter')
    await OPEN.trk!.open()
    await doing(() => setPage('inputs'))
    expect(whatIsOpen()).toMatchObject({ reason: 'window', row: { id: 'trk', where: 'tracker' } })
    expect(rowReachable(row('trk')), 'its tab leads back to it').toBe(true)
  })
  it('then a squadron he only views in view (150) — reached by no press since D2403, so by the raw entry: the Tracker is not offered for it, the window is still set — and not counted (D2627 A7: "unless the squadron picked no longer offers it")', async () => {
    /* (Hunter holds View of 150 in withThird(). Until step K4 this was today's pick, which went through; since K4 a pick of
       150 is refused while Show All counts (D2403 — ui/msq-guard-doors.test.tsx B4 holds the refusal and the pick from 150
       that then goes through), so 150 in view with the window set is the state only a change he did not make leaves, and
       is made here by the raw entry the pick itself runs (state/store.ts enterSquadron, by pick). The Tracker stays on his
       own squadron's records for a squadron he only views — it follows his own pages, core.js followUnit — so its window is
       left set while nothing on 150 can show it) */
    await app('hunter')
    await OPEN.trk!.open()
    await doing(() => setPage('inputs'))
    await doing(() => { enterSquadron(third.u150, holdNow() === 'war', true) })
    expect({ unit: UNIT, offered: pageOffered('tracker'), set: C.showAllOpen, rowOpen: row('trk').open(), reachable: rowReachable(row('trk')), open: whatIsOpen()?.row.id ?? null })
      .toEqual({ unit: third.u150, offered: false, set: true, rowOpen: true, reachable: false, open: null })
  })
})

describe('A14 and A15 (pins — no door asks or closes yet) — the Tracker\'s halves', () => {
  it('pin: the chart editor open, then his own move at midnight, then a right ended: the guard never asked', async () => {
    const ask = vi.fn(guardAsk)
    setGuardAsk(ask)
    signInAs('saber'); expect(moveMan(PID.hunter, third.u150).ok).toBe(true)
    await app('hunter')
    await goTracker()
    await trkDo(() => C.toggleArrange())
    expect(C.arrangeMode, 'the premise: Edit chart layout').toBe(true)
    await act(async () => { pastMidnight() }); await settle()
    signInAs('saber'); expect(saveAccess(ACCT.hunter, { grants: { u149: 'none' } })).toBeNull(); signInAs('hunter')
    await doing(() => {})
    expect(ask).not.toHaveBeenCalled()
  })
  it('pin: an event\'s details (the ⓘ bubble) up, then his own move at midnight, then a right ended: closeShown never called', async () => {
    const shut = vi.fn(guardCloseShown)
    setGuardClose(shut)
    signInAs('saber'); expect(moveMan(PID.hunter, third.u150).ok).toBe(true)
    await app('hunter')
    await goTracker()
    await TRK_OPENERS.bubble!()
    expect(row('trkinfo').open(), 'the premise').toBe(true)
    await act(async () => { pastMidnight() }); await settle()
    signInAs('saber'); expect(saveAccess(ACCT.hunter, { grants: { u149: 'none' } })).toBeNull(); signInAs('hunter')
    await doing(() => {})
    expect(shut).not.toHaveBeenCalled()
  })
})

describe('TO_COME — what is left is owed by a later step, by name, never by a pass of K1', () => {
  it('nothing is left: K2b took off A6\'s "Add a person" half, the last entry', () => {
    expect(TO_COME).toEqual([])
  })
})

/* (last in the file: it takes the Tracker's engine down to "Loading…" and boots it again) */
describe('A11 — the Tracker not drawn: nothing reported', () => {
  it('a window of it set (Show All), then "Loading…" (not ready): none reported, nothing named; booted again, it is reported again', async () => {
    await app('hunter')
    await goTracker()
    await TRK_OPENERS.showAllOpen!()
    expect(trkOpen('showAllOpen'), 'the premise').toBeTruthy()
    C.resetInitForTests()
    expect(C.showAllOpen, 'still set').toBe(true)
    expect(trackerWindowsOpen(), '"Loading…": nothing of it drawn').toEqual([])
    expect(whatIsOpen()).toBeNull()
    await act(async () => { await C.init(); await C.whenLoaded() })
    await settle()
    expect(C.ready).toBe(true)
    expect(trkOpen('showAllOpen'), 'drawn again, reported again').toBeTruthy()
  })
})
