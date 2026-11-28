// @vitest-environment jsdom
/* THE PICK'S DOOR — the guard rail's step K4 (the plan, docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §4.1
   rows 1 and 2, §4.2, §4.3, §4.7's pick halves; §21.1's blocks win over any older line; the brief
   docs/superpowers/briefs/2026-11-26-msq-s1-k4-brief.md).

   His rulings: D2403 (a pick of another squadron is refused while a window is open), D2596, D2597 (a window that only shows
   things closes by itself and the pick goes through), D2627 A9 (a save still going is waited for), A10 (one reason at a
   time), A13 (a failed save: the Retry note), A16 (a pick refused from the ☰ menu closes the menu, the note at the foot),
   A4 (the pick ends Logic's and Quals' edit modes — G1, ui/msq-guard-g.test.tsx), D2742 (no give-up is built: the door
   waits on the saver's own answer), D2630 (three squadrons in the picker).

   EVERY PRESS IS THE WHOLE SEQUENCE ON THE REAL CONTROLS (§4.7's paragraph): the Schedules button, then the row; ☰, the
   list's button, then the row — never a call of pickSquadron. The note's words are read from the tables (guardWords),
   never typed here. Written FIRST and seen failing on the code as it stood (no door asked the guard).

   The world: three squadrons (test-support/msq-world.ts withThird — 150's id is third.u150). Hunter is 142's admin with
   Plan of 149 and View of 150; Ranger 142's member with View of 149 and of 150; Saber the master admin. Wed 15 Jul 26. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { act, fireEvent } from '@testing-library/react'
import { withThird, third, signInAs } from '../test-support/msq-world'
import { UNIT } from '../engine/unitview'
import { INPUTS } from '../engine/inputs'
import { notify } from '../state/store'
import { CURPAGE, setPage, AVAILWIN } from '../state/view'
import { DRAWER, setDrawer, setDocView, DOCVIEW, INPEDIT, setInpEdit } from './pops'
import { lwUnitNow, pageUnit } from '../state/perms'
import { storageUnit } from '../tracker/storage.js'
import { watchSaves } from '../storage/savewait'
import { clearToast } from './toast'
import { setCxt, setSortAll } from './board'
import { whatIsOpen, guardWords, GUARD_ROWS, GUARD_LEADS, GUARD_ENDINGS, rowRefuses, type GuardRow } from './guard'
import { homeOn, todayIso } from '../state/units'
import { holdNow, warBand } from '../state/typing-hold'
import { setReloadSeam } from './logout'
import { SESSION } from '../state/auth'
import {
  $, C, OPEN, app, doing, press, settle, tid, typeIn, goLeaveWar, goTracker, chartEdit,
  guardTeardown, openLeaveFiled, openUserRow, ownInput, drawnBox, row, named, saver, topPick, warAsRanger,
  avail, SHOWN, note, nothingHeld, answeringSaver,
} from '../test-support/msq-guard-testkit'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()

afterEach(async () => {
  /* the board's two questions outlive the page (their state is ui/board.ts's own, which the shared teardown does not clear):
     a refused pick leaves them up on purpose, so they are put down here, or the next test would meet them */
  setCxt(null); setSortAll(null)
  await guardTeardown()
  clearToast()
  document.getElementById('toastEl')?.remove()
  document.getElementById('srSay')?.remove()
})

/* ---- the presses: the whole sequence on the real controls ---- */
/** the ☰ menu's list: ☰ opened (its own setter, as the menu button does), the list's button, then the row */
async function drawerPick(u: string) {
  if (!DRAWER) await doing(() => setDrawer(true))
  await press($('#drawerSqnBtn'), 'the ☰ menu\'s squadron button')
  await press($(`#drawerSqnList .sqm-row[data-unit="${u}"]`), `the ☰ menu's row of ${u}`)
}
const LISTS = { 'the bar\'s list': topPick, 'the ☰ menu\'s list': drawerPick } as const
type ListName = keyof typeof LISTS

/* ---- what a refusal leaves (note, nothingHeld and answeringSaver moved whole to test-support/msq-guard-testkit.ts at step K5:
   the view switch's tests read them too) ---- */
/** the note the tables say this state takes, for a pick of `u` — read before the press */
function noteFor(u: string): string {
  const w = whatIsOpen()
  expect(w, 'the premise: something refuses').not.toBeNull()
  const words = guardWords(w!.reason, w!.row, 'pick', u)
  expect(words, 'the premise: the pick has words for it').toBeTruthy()
  return words!
}
/** B1's assertions, after a refused pick of `u` by `list`: nothing changed, the note said, the row still open and drawn */
async function refusedBy(list: ListName, u: string, r: GuardRow) {
  const from = UNIT, war = lwUnitNow(), trk = storageUnit(), page = CURPAGE
  const words = noteFor(u)
  await LISTS[list](u)
  expect({ unit: UNIT, war: lwUnitNow(), trk: storageUnit(), page: CURPAGE }, 'nothing changed').toEqual({ unit: from, war, trk, page })
  expect(note(), 'the note').toBe(words)
  expect(whatIsOpen()?.row.id, 'the row still open').toBe(r.id)
  if (r.counts !== 'unsaved' && r.sel) expect(drawnBox(r.sel), `${r.id} still on the page`).toBe(true)
  if (list === 'the bar\'s list') {
    expect($('#sqnMenu'), 'the list closed').toBeNull()
    expect(document.activeElement?.id, 'the keys on the Schedules button').toBe('sqnMenuBtn')
  } else {
    expect(DRAWER, 'the ☰ menu closed (D2627 A16)').toBe(false)
    expect($('.drawer.open'), 'the ☰ menu gone from the page').toBeNull()
    expect($('#drawerSqnList'), 'its list gone').toBeNull()
  }
  nothingHeld()
}

/* ================= B1, B2, B3 ================= */
describe('B1, B2 — a pick with a window open is refused (D2403), by each list', () => {
  for (const list of Object.keys(LISTS) as ListName[]) {
    it(`${list}: an Input window on Inputs with a word typed — refused, the window still live with its word`, async () => {
      await app('saber')
      await OPEN.inputedit!.open()
      await act(async () => { fireEvent.change($('#inpEditRmk')!, { target: { value: 'a word typed' } }) })
      await refusedBy(list, 'u149', row('inputedit'))
      expect(($('#inpEditRmk') as HTMLTextAreaElement).value, 'the word still there').toBe('a word typed')
      expect(note(), 'the ruled words').toBe(`Blocked: ${GUARD_LEADS.window}, then ${GUARD_ENDINGS.pick('149')}`)
    })
  }
  it('B2 (pin, today\'s too) — a pick from the ☰ menu that goes through leaves the menu open, as today (D2384)', async () => {
    await app('saber')
    await drawerPick('u149')
    expect(UNIT).toBe('u149')
    expect(DRAWER, 'the ☰ menu still open').toBe(true)
    expect(note()).toBe('')
  })
})

describe('B3 — 149 → 142, and on to a third (D2630)', () => {
  it('Hunter with Plan, on 149, a window open: 142 refused "…then pick 142."; 150, which he only views, "…then pick 150."', async () => {
    await app('hunter')
    await topPick('u149')
    expect(UNIT, 'the premise: on 149').toBe('u149')
    await OPEN.oilday!.open()
    await refusedBy('the bar\'s list', 'u142', row('oilday'))
    expect(note().endsWith(GUARD_ENDINGS.pick('142'))).toBe(true)
    await refusedBy('the ☰ menu\'s list', third.u150, row('oilday'))
    expect(note().endsWith(GUARD_ENDINGS.pick('150'))).toBe(true)
  })
})

/* ================= B4 ================= */
describe('B4 — every window that counts refuses, by its whole press (D2403)', () => {
  /* the rows that refuse as a window (Admin's rows and forms are B11's; the failed save B10's) */
  const windows = GUARD_ROWS.filter(r => rowRefuses(r) && r.counts !== 'row' && r.counts !== 'unsaved')
  it('every window row has its opener', () => { expect(windows.filter(r => !OPEN[r.id]).map(r => r.id)).toEqual([]) })
  for (const r of windows) {
    for (const list of Object.keys(LISTS) as ListName[]) {
      it(`${r.id} — by ${list}: refused, still drawn`, async () => {
        await app('hunter')
        await OPEN[r.id]!.open()
        expect(named(), `the premise: ${r.id} counts`).toBe(r.id)
        /* (the Tracker's question is raised by a pick of 149 on 142: the press that meets it picks 150) */
        await refusedBy(list, r.id === 'trkask' ? third.u150 : 'u149', r)
      })
    }
  }
  it('the document viewer over an Input window: the viewer closes at the press, the Input window refuses (D2627 A1)', async () => {
    await app('hunter')
    const inp = ownInput()
    await OPEN.inputedit!.open()
    await doing(() => setDocView({ row: inp, up: false }))
    expect(DOCVIEW, 'the premise: the viewer is up').not.toBeNull()
    const words = noteFor('u149')
    await topPick('u149')
    expect(UNIT).toBe('u142')
    expect(DOCVIEW, 'the viewer closed at the press').toBeNull()
    expect(note()).toBe(words)
    expect(named()).toBe('inputedit')
  })
  it('a Leave War window left behind the Inputs tab: refused, "…close the open window on the Leave War…" (D2627 A7)', async () => {
    await app('hunter')
    await goLeaveWar()
    await press(document.querySelector(`[data-testid^="person-"]:not([data-testid="person-window"])`), 'a name on the grid')
    await doing(() => setPage('inputs'))
    await refusedBy('the bar\'s list', 'u149', row('lwsheet'))
    expect(note()).toBe(`Blocked: ${GUARD_LEADS.windowOnLeaveWar}, then ${GUARD_ENDINGS.pick('149')}`)
    expect(tid('person-window'), 'his window still drawn on the Leave War').not.toBeNull()
  })
  it('a Tracker window left behind a tab: refused, "…on the Tracker…" (D2627 A7)', async () => {
    await app('hunter')
    await OPEN.trk!.open()
    await doing(() => setPage('inputs'))
    await refusedBy('the ☰ menu\'s list', 'u149', row('trk'))
    expect(note()).toBe(`Blocked: ${GUARD_LEADS.windowOnTracker}, then ${GUARD_ENDINGS.pick('149')}`)
    expect(C.showAllOpen, 'Show All still set').toBe(true)
  })
  it('(pin, today\'s too) the Tracker\'s half of "the squadron picked no longer offers it" (A7): Show All left up behind Inputs, 150 entered by a road no press reaches, then a pick of 149 by the bar: through', async () => {
    await app('hunter')
    await OPEN.trk!.open()
    await doing(() => setPage('inputs'))
    /* (the raw entry — reached by no press since D2403: a pick of 150 is refused while Show All counts, so 150 with Show All
       still set is the state a change he did not make leaves; on 150 the Tracker is not offered, so it does not count) */
    const { rawEnter } = await import('../test-support/raw-entry')
    await doing(() => { rawEnter(third.u150) })
    expect({ unit: UNIT, set: C.showAllOpen, open: whatIsOpen() }, 'the premise').toEqual({ unit: third.u150, set: true, open: null })
    await topPick('u149')
    expect(UNIT, 'through').toBe('u149')
    expect(note()).toBe('')
  })
})

/* ================= B4b ================= */
/* (avail and SHOWN — each window that only shows things, by its own door — moved whole to test-support/msq-guard-testkit.ts at
   step K5: the view switch's tests, ui/msq-guard-doors-switch.test.tsx, read the same list) */
describe('B4b — every window that only shows things closes, and the pick goes through (D2596, D2597; D2654 E1)', () => {
  it('every "closes" row has its opener here', () => {
    expect(GUARD_ROWS.filter(r => r.counts === 'closes' && !SHOWN[r.id]).map(r => r.id)).toEqual([])
  })
  /* the ones a pick already closed before K4 (P19: ALL AVAIL and Changes; P1 4: the Tracker's that only show things) — pins */
  const TODAY = new Set(['avail', 'chg', 'trkinfo', 'trkpop', 'trkdown', 'trkfail'])
  for (const [id, s] of Object.entries(SHOWN)) {
    for (const list of Object.keys(LISTS) as ListName[]) {
      it(`${TODAY.has(id) ? '(pin, today\'s too) ' : ''}${id} — by ${list}: 149 in view, no note, its box gone and its state clear`, async () => {
        await app(s.who ?? 'hunter')
        await s.open()
        if (s.box) expect(drawnBox(s.box), `the premise: ${id} is drawn`).toBe(true)
        expect(s.shut(), `the premise: ${id} is open`).toBe(false)
        expect(whatIsOpen(), 'the premise: nothing refuses').toBeNull()
        await LISTS[list]('u149')
        expect(UNIT, 'through').toBe('u149')
        expect(note(), 'no note').toBe('')
        expect(s.shut(), `${id} closed`).toBe(true)
        if (s.box) expect(drawnBox(s.box), `${id}'s box gone`).toBe(false)
        nothingHeld()
      })
    }
  }
  /* (the Tracker's marking window is not among these: a press anywhere outside it closes it by its own rule — the bar's
     button too — before the pick is pressed, as today) */
  for (const id of ['avail', 'chg', 'insights', 'lwday'] as const) {
    it(`${id} with an Input window open beside it: refused, and ${id} still open`, async () => {
      await app('hunter')
      await SHOWN[id]!.open()
      await doing(() => { setInpEdit(ownInput()) })
      expect(named(), 'the premise: the Input window counts').toBe('inputdlg')
      const words = noteFor('u149')
      await topPick('u149')
      expect(UNIT).toBe('u142')
      expect(note()).toBe(words)
      expect(SHOWN[id]!.shut(), `${id} still open`).toBe(false)
    })
  }
})

/* THE ONE BEAT AT THE ENTRY (step K4's round 2, item 3): the pick's entry closes the windows that only show things and then
   asks whether the war is held (state/pick.ts enterPicked: closeShown(), then holdNow()) — and holdNow() counts every war
   sheet still mounted, a show-only one included, until it unmounts. So the war might be entered "held" for one beat and
   let go when the sheet goes. Read: after everything settles, the war is 149's, nothing held; and, in the same run as the
   entry, whether a held band was ever put on the page or a war band ever stood. */
describe('the entry with a show-only Leave War sheet up: never held, not even for a beat', () => {
  const BAND_NO_SHEET: Record<string, unknown> = {}
  for (const list of Object.keys(LISTS) as ListName[]) {
    it(`(control) Ranger on the Leave War with no sheet up, a pick by ${list}: what the war and its band are after it`, async () => {
      await app('hunter')
      await warAsRanger()
      await LISTS[list]('u149')
      await settle()
      expect(UNIT).toBe('u149')
      expect(holdNow()).toBe('none')
      /* (a View holder's pick leaves his own war on a page 149 does not offer, so the store keeps the pick's band for a
         war window — none is open, so nothing draws it; read here so the case with the sheet is compared against it) */
      BAND_NO_SHEET[list] = warBand()
    })
  }
  for (const list of Object.keys(LISTS) as ListName[]) {
    it(`"Leave filed on the Inputs page" up, a pick by ${list}: through, the war unheld, no held band drawn at any moment, nothing held`, async () => {
      await app('hunter')
      await openLeaveFiled()
      expect(lwUnitNow(), 'the premise: the war is 142\'s').toBe('u142')
      const drawn: string[] = []
      const BANDS = '[data-testid="move-band"], [data-testid="inped-moveband"], [data-heldro]'
      const mo = new MutationObserver(recs => {
        for (const r of recs) for (const n of r.addedNodes) {
          const el = n as Element
          if (el.nodeType === 1 && (el.matches(BANDS) || el.querySelector(BANDS))) drawn.push(el.outerHTML.slice(0, 120))
        }
      })
      mo.observe(document.body, { childList: true, subtree: true })
      /* (read 27 Nov 26, reported, not pinned: the war band itself does stand for that one beat — the store's band reads
         "This is 142's." between the entry and the sheet's unmount — but it is never put on the page: the sheet that would
         carry it unmounts in the same render) */
      try {
        await LISTS[list]('u149')
        await settle()
      } finally { mo.disconnect() }
      /* (the war band the store keeps after the pick is the same as a pick with no sheet up makes — the control below) */
      expect(warBand(), 'the store\'s war band as with no sheet up').toEqual(BAND_NO_SHEET[list])
      expect(UNIT, 'through').toBe('u149')
      /* (Ranger, a member, sees 149 by View only: his own pages, the Leave War among them, stay 142's at the pick — D2197 —
         so the war's world the entry gives, unheld, is his own pages' squadron) */
      expect(lwUnitNow(), 'the war\'s world is what the entry gives it, unheld: his own pages\' squadron').toBe(pageUnit('own', todayIso()))
      expect(tid('raptor-sheet'), 'the sheet gone').toBeNull()
      expect(holdNow(), 'nothing holds').toBe('none')
      expect(drawn, 'no held band drawn between the entry and the release').toEqual([])
      nothingHeld()
    })
  }
})

/* ================= B10, B12, B13 ================= */
describe('B10 — a change not saved: the saver made to fail (the stand-in the repo\'s tests use for "failed")', () => {
  for (const list of Object.keys(LISTS) as ListName[]) {
    it(`${list}: refused with the Retry lead and "then pick 149." (D2627 A13); Retry lands → nothing by itself; a fresh press goes through`, async () => {
      await app('hunter')
      await OPEN.unsaved!.open()
      await refusedBy(list, 'u149', row('unsaved'))
      expect(note()).toBe(`Blocked: ${GUARD_LEADS.retry}, then ${GUARD_ENDINGS.pick('149')}`)
      saver.status = 'idle'
      await doing(() => {})
      await act(async () => { await new Promise(r => setTimeout(r, 30)) })
      expect(UNIT, 'nothing happens by itself when the save lands').toBe('u142')
      await LISTS[list]('u149')
      expect(UNIT, 'a fresh press goes through').toBe('u149')
    })
  }
})

describe('B12, B13 — two reasons, one at a time (D2627 A10); a refusal before the Tracker\'s question', () => {
  it('B12: a window and a failed save — the window\'s note; the window closed, pressed again: the Retry note; never the Tracker\'s question', async () => {
    await app('hunter')
    await OPEN.oilday!.open()
    await OPEN.unsaved!.open()
    await topPick('u149')
    expect(note()).toBe(`Blocked: ${GUARD_LEADS.window}, then ${GUARD_ENDINGS.pick('149')}`)
    await press(tid('win-oilday-x'), 'the OIL list\'s ✕')
    await drawerPick('u149')
    expect(note()).toBe(`Blocked: ${GUARD_LEADS.retry}, then ${GUARD_ENDINGS.pick('149')}`)
    expect(UNIT).toBe('u142')
    expect(C.dlg ?? null, 'no question').toBeNull()
  })
  it('B13: a window open and unsaved chart edits: refused, the Tracker\'s question never raised (core.dlg null)', async () => {
    await app('hunter')
    await goTracker()
    await chartEdit()
    await OPEN.inputedit!.open()
    await topPick('u149')
    expect(UNIT).toBe('u142')
    expect(note().startsWith(`Blocked: ${GUARD_LEADS.window}`)).toBe(true)
    expect(C.dlg ?? null, 'no question was raised').toBeNull()
  })
})

/* ================= B11 ================= */
describe('B11 — Admin\'s unsaved work (D2595, D2598), by each list', () => {
  const CASES: Record<string, { open: () => Promise<void>; id: string }> = {
    'a Users row with a letter typed': { id: 'userrow', open: async () => { await openUserRow(); const b = $('#accEdName, #accGiveName') as HTMLInputElement; await typeIn('#accEdName, #accGiveName', b.value + 'x') } },
    'a Users row with only the Role changed': { id: 'userrow', open: async () => { await openUserRow(); const r = $('#accEdRole, #accGiveRole') as HTMLSelectElement; await typeIn('#accEdRole, #accGiveRole', r.value === 'admin' ? 'main' : 'admin') } },
    'a Users row with only a squadron\'s line changed': { id: 'userrow', open: async () => {
      await openUserRow()
      const line = [...document.querySelectorAll<HTMLButtonElement>('.od-row-on [data-line]')].find(b => !b.disabled && b.getAttribute('aria-pressed') !== 'true')
      expect(line, 'the premise: a line he may change').toBeTruthy()
      await press(line!, 'a squadron\'s line')
    } },
    'Give access with its Role changed': { id: 'giveaccess', open: OPEN.giveaccess!.open },
    '"+ New squadron" with a number typed': { id: 'newsqn', open: OPEN.newsqn!.open },
    'Add a person with a callsign typed': { id: 'addperson', open: OPEN.addperson!.open },
  }
  for (const [name, c] of Object.entries(CASES)) {
    for (const list of Object.keys(LISTS) as ListName[]) {
      it(`${name} — by ${list}: refused under its own lead, the row or form still open`, async () => {
        await app('hunter')
        await c.open()
        expect(named(), 'the premise').toBe(c.id)
        await refusedBy(list, 'u149', row(c.id))
      })
    }
  }
  it('the row left on Users with Squadrons showing: "…the open row on Users…" (D2627 A6)', async () => {
    await app('hunter')
    await CASES['a Users row with a letter typed']!.open()
    await press([...document.querySelectorAll('.adm-cat')].find(b => b.textContent?.startsWith('Squadrons')) || null, 'Squadrons')
    await refusedBy('the bar\'s list', 'u149', row('userrow'))
    expect(note()).toBe(`Blocked: ${GUARD_LEADS.rowOnUsers}, then ${GUARD_ENDINGS.pick('149')}`)
  })
  it('(pin, today\'s too) each opened with nothing changed: through', async () => {
    await app('hunter')
    await openUserRow()
    expect(named()).toBeNull()
    await topPick('u149')
    expect(UNIT).toBe('u149')
  })
  it('the premise settled with the Admin → Users section: a changed whole Users row refuses a pick of a squadron he only VIEWS too — Hunter (View of 150), the row changed on 142\'s Admin → Users, 150 picked: refused', async () => {
    await app('hunter')
    await CASES['a Users row with a letter typed']!.open()
    await refusedBy('the ☰ menu\'s list', third.u150, row('userrow'))
    expect(note().endsWith(GUARD_ENDINGS.pick('150'))).toBe(true)
  })
  it.todo('the short row\'s unsaved change refuses a pick — after the Admin → Users section\'s U1 fix merges (the roll-call\'s TO_COME)')
})

/* ================= B19, B20 — the saver ================= */
describe('B20 — a save still going (D2627 A9): the pick waits for the saver\'s own answer, never a timer of its own', () => {
  it('a change made and a pick pressed in the same tick: the save is sent first and lands, then the pick', async () => {
    await app('hunter')
    const s = answeringSaver()
    s.change()
    expect(s.pm.status, 'the premise: a change on its way').toBe('unsaved')
    await topPick('u149')
    expect(s.sent.length, 'the save sent first').toBe(1)
    expect(UNIT, 'the pick waits for it').toBe('u142')
    await s.answer(true)
    expect(UNIT, 'landed: the pick goes on').toBe('u149')
    expect(note()).toBe('')
  })
  it('a filing made just before: lands in 142\'s record, then the pick', async () => {
    await app('hunter')
    const s = answeringSaver()
    await OPEN.inputedit!.open()
    await act(async () => { fireEvent.change($('#inpEditRmk')!, { target: { value: 'saved first' } }) })
    await press($('#inpEditSave'), 'Save')
    s.change()
    await topPick('u149')
    const filed = INPUTS.find((r: any) => r.remarks === 'saved first') as any
    expect(filed, 'the premise: his change kept').toBeTruthy()
    expect(UNIT).toBe('u142')
    await s.answer(true)
    expect(UNIT).toBe('u149')
    expect(homeOn(String(filed.person), todayIso()), 'its man 142\'s — the record 142\'s').toBe('u142')
  })
  it('made to fail: refused with the Retry note, 142 still in view', async () => {
    await app('hunter')
    const s = answeringSaver()
    s.change()
    await topPick('u149')
    await s.answer(false)
    expect(UNIT).toBe('u142')
    expect(note()).toBe(`Blocked: ${GUARD_LEADS.retry}, then ${GUARD_ENDINGS.pick('149')}`)
  })
  it('a save that never answers (a stand-in, named so — no store the app ships can hang): the pick does not go through, nothing is entered, for as long as it has not answered', async () => {
    await app('hunter')
    const s = answeringSaver()
    s.change()
    await drawerPick('u149')
    await act(async () => { await new Promise(r => setTimeout(r, 400)) })
    await settle()
    expect({ unit: UNIT, status: s.pm.status, note: note() }).toEqual({ unit: 'u142', status: 'saving', note: '' })
  })
  it('a second pick made while the first waits: the first is dropped, the second goes on when the save lands', async () => {
    await app('hunter')
    const s = answeringSaver()
    s.change()
    await topPick('u149')
    await topPick(third.u150)
    expect(UNIT, 'both wait for the save').toBe('u142')
    await s.answer(true)
    expect(UNIT, 'the later press, never the dropped one').toBe(third.u150)
  })
  it('a pointer-down elsewhere on the page while it waits: dropped — nothing happens when the save lands', async () => {
    await app('hunter')
    const s = answeringSaver()
    s.change()
    await topPick('u149')
    await act(async () => { fireEvent.pointerDown(document.body) })
    await s.answer(true)
    expect(UNIT).toBe('u142')
    expect(note()).toBe('')
  })
  it('(pin, today\'s too) with no save going the pick is synchronous, as today: 149 in view the moment the row is pressed', async () => {
    await app('hunter')
    watchSaves(null)
    await press($('#sqnMenuBtn'), 'the Schedules button')
    act(() => { fireEvent.click($('#sqnMenu .sqm-row[data-unit="u149"]')!) })
    expect(UNIT).toBe('u149')
  })
})

describe('B19 — a failed save that arrives while the Tracker\'s question stands', () => {
  it('the question up for a pick; the saver fails; Discard: refused with the Retry note, 142 still in view', async () => {
    await app('hunter')
    await goTracker()
    await chartEdit()
    await topPick('u149')
    await vi.waitFor(() => expect(C.dlg?.msg, 'the premise: the question').toContain('Save them before switching'), { timeout: 5000, interval: 10 })
    saver.status = 'failed'; await doing(() => watchSaves(saver as any))
    await press($('#dlgAlt'), 'Discard them')
    await act(async () => { await new Promise(r => setTimeout(r, 30)) })
    await settle()
    expect(UNIT).toBe('u142')
    expect(note()).toBe(`Blocked: ${GUARD_LEADS.retry}, then ${GUARD_ENDINGS.pick('149')}`)
  })
})

/* ================= B21 ================= */
describe('B21 — sign-out and the next person', () => {
  it('a refused pick, then Logout: the note gone, nothing open, whatIsOpen() null for the next sign-in', async () => {
    const prev = setReloadSeam(() => {})
    try {
      await app('hunter')
      await OPEN.oilday!.open()
      await topPick('u149')
      expect(note(), 'the premise: refused').not.toBe('')
      await doing(() => setDrawer(true))
      await press($('#drawerLogout'), 'Logout')
      await vi.waitFor(() => expect(SESSION, 'signed out').toBeNull(), { timeout: 5000, interval: 10 })
      expect(note(), 'the note gone').toBe('')
      expect(document.getElementById('srSay')?.textContent ?? '', 'nothing left for a screen reader').toBe('')
      expect(whatIsOpen()).toBeNull()
      signInAs('ranger'); await doing(() => {})
      expect(whatIsOpen(), 'nothing open for the next sign-in').toBeNull()
    } finally { setReloadSeam(prev) }
  })
})

/* ================= B30 ================= */
describe('B30 — when the show-only windows close at a pick, and when they do not', () => {
  it('(pin, today\'s too) ALL AVAIL open, unsaved chart edits, a pick: the question; Stay → ALL AVAIL still open; Discard → closed, then 149', async () => {
    await app('hunter')
    await goTracker()
    await chartEdit()
    await doing(() => { setPage('editsched'); avail() })
    await topPick('u149')
    await vi.waitFor(() => expect(C.dlg?.msg).toContain('Save them before switching'), { timeout: 5000, interval: 10 })
    await press($('#dlgCancel'), 'Stay')
    expect({ unit: UNIT, avail: !!AVAILWIN }, 'Stay').toEqual({ unit: 'u142', avail: true })
    await topPick('u149')
    await vi.waitFor(() => expect(C.dlg?.msg).toContain('Save them before switching'), { timeout: 5000, interval: 10 })
    await press($('#dlgAlt'), 'Discard them')
    await vi.waitFor(() => expect(UNIT).toBe('u149'), { timeout: 5000, interval: 10 })
    expect(AVAILWIN, 'closed').toBeNull()
  })
  it('a pick refused for a failed save: ALL AVAIL still open', async () => {
    await app('hunter')
    await doing(() => { setPage('editsched'); avail() })
    await OPEN.unsaved!.open()
    await topPick('u149')
    expect({ unit: UNIT, avail: !!AVAILWIN }).toEqual({ unit: 'u142', avail: true })
  })
  it('a save waited for, then landed: closed, then the pick — never before it lands', async () => {
    await app('hunter')
    await doing(() => { setPage('editsched'); avail() })
    const s = answeringSaver()
    s.change()
    await topPick('u149')
    expect({ unit: UNIT, avail: !!AVAILWIN }, 'still waiting').toEqual({ unit: 'u142', avail: true })
    await s.answer(true)
    expect({ unit: UNIT, avail: !!AVAILWIN }).toEqual({ unit: 'u149', avail: false })
  })
  it('(pin, today\'s too) the squadron already in view picked: still open, no note', async () => {
    await app('hunter')
    await doing(() => { setPage('editsched'); avail() })
    await topPick('u142')
    expect({ unit: UNIT, avail: !!AVAILWIN, note: note() }).toEqual({ unit: 'u142', avail: true, note: '' })
  })
})

describe('B16 — no press leaves a held window', () => {
  it('a refused pick of 150 with an Input window on his own Inputs, by both lists: no held band, no role chip, the window live', async () => {
    await app('hunter')
    await OPEN.inputedit!.open()
    await topPick(third.u150)
    await drawerPick(third.u150)
    nothingHeld()
    expect(INPEDIT, 'his window still his').not.toBeNull()
    expect(pageUnit('own')).toBe('u142')
  })
})
