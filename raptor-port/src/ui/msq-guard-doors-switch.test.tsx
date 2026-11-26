// @vitest-environment jsdom
/* THE VIEW SWITCH'S DOOR — the guard rail's step K5 (the plan, docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md
   §4.1 rows 3, 4 and 5, §4.2, §4.4, §4.7's switch halves; §21.1's blocks win over any older line; the brief
   docs/superpowers/briefs/2026-11-27-msq-s1-k5-brief.md). Beside ui/msq-guard-doors.test.tsx (the pick's, K4), in its shape,
   its world and its kit: that file would pass about 900 lines with these.

   His rulings: D2403 (the switch to the member view or back is refused while a window is open), D2590 (the grey "Blocked:"
   note, its two endings), D2596, D2597 (a window that only shows things closes by itself and the switch goes through),
   D2627 A9 (a save still going is waited for), A10 (one reason at a time), A13 (a failed save: the Retry note), A16 (a
   refusal from the ☰ menu closes the menu, the note at the foot), A20 (unsaved chart edits are asked about at the switch,
   both ways, on his own squadron too), D2654 E3 (the chart editor open with nothing moved closes at the switch), D2742 (no
   give-up: the door waits on the saver's own answer), D2630 (three squadrons in the picker).

   EVERY PRESS IS THE WHOLE SEQUENCE ON THE REAL CONTROLS (§4.7's paragraph): the name badge (#roleBadge) alone; ☰, then
   "Switch to the member view" / "Back to the admin view" (#drawerRole) — never a call of switchRoleView; the Input window's
   own chip where it is drawn. The note's words are read from the tables (guardWords), never typed here; the Tracker's
   question's words are his (D2627 A20, as drawn) and the "…back to the admin view?" twin read by a fresh Fable (words-read
   N7). Written FIRST and seen failing on the code as it stood (the switch asked nothing), but for the tests marked pins.

   The world: three squadrons (test-support/msq-world.ts withThird — 150's id is third.u150). Hunter is 142's admin with
   Plan of 149 and View of 150; Saber the master admin. Wed 15 Jul 26. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { act, fireEvent } from '@testing-library/react'
import { withThird, signInAs } from '../test-support/msq-world'
import { UNIT } from '../engine/unitview'
import { CURPAGE, setPage, AVAILWIN } from '../state/view'
import { DRAWER, setDrawer, INPEDIT, setInpEdit } from './pops'
import { isAdmin, pageUnit } from '../state/perms'
import { switchRoleViewRaw } from '../state/store'
import { getState as lwState } from '../leavewar/state/store'
import { storageUnit, storageHeld } from '../tracker/storage.js'
import { trackerCover } from '../state/typing-hold'
import { watchSaves } from '../storage/savewait'
import { clearToast } from './toast'
import { setCxt, setSortAll } from './board'
import { whatIsOpen, guardWords, GUARD_LEADS, GUARD_ENDINGS, type GuardRow } from './guard'
import { setReloadSeam } from './logout'
import { SESSION } from '../state/auth'
import {
  $, C, OPEN, TRK_WB, app, doing, press, settle, tid, typeIn, goTracker, chartEdit, trkDo, guardTeardown, openUserRow,
  ownInput, drawnBox, row, named, saver, topPick, avail, SHOWN, note, nothingHeld, answeringSaver,
} from '../test-support/msq-guard-testkit'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()

afterEach(async () => {
  /* the board's two questions outlive the page (ui/board.ts's own state — as in the pick's file) */
  setCxt(null); setSortAll(null)
  await guardTeardown()
  clearToast()
  document.getElementById('toastEl')?.remove()
  document.getElementById('srSay')?.remove()
})

/* ---- the presses: the whole sequence on the real controls ---- */
/** the name badge, alone (Shell's #roleBadge — "SABER · ADMIN" ↔ "SABER · MEMBER") */
async function badge() { await press($('#roleBadge'), 'the name badge') }
/** the ☰ menu (its own setter, as the menu button does), then its "Switch to the member view" / "Back to the admin view" */
async function drawerRole() {
  if (!DRAWER) await doing(() => setDrawer(true))
  await press($('#drawerRole'), 'the ☰ menu\'s switch')
}
const CONTROLS = { 'the name badge': badge, 'the ☰ menu\'s switch': drawerRole } as const
type ControlName = keyof typeof CONTROLS

/* ---- what a refusal leaves ---- */
const doorNow = (): 'toMember' | 'toAdmin' => (isAdmin() ? 'toMember' : 'toAdmin')
const endingNow = (): string => GUARD_ENDINGS[doorNow()]
/** the note the tables say this state takes, for the switch the role in force would make — read before the press */
function noteFor(): string {
  const w = whatIsOpen()
  expect(w, 'the premise: something refuses').not.toBeNull()
  const words = guardWords(w!.reason, w!.row, doorNow(), '')
  expect(words, 'the premise: the switch has words for it').toBeTruthy()
  return words!
}
/** B5's assertions, after a refused switch by `control`: nothing changed, the note said, the row still open and drawn */
async function refusedBy(control: ControlName, r: GuardRow) {
  const admin = isAdmin(), page = CURPAGE, lw = lwState().role, unit = UNIT, own = pageUnit('own')
  const words = noteFor()
  await CONTROLS[control]()
  expect({ admin: isAdmin(), page: CURPAGE, lw: lwState().role, unit: UNIT, own: pageUnit('own') }, 'nothing changed').toEqual({ admin, page, lw, unit, own })
  expect(note(), 'the note').toBe(words)
  expect(whatIsOpen()?.row.id, 'the row still open').toBe(r.id)
  if (r.counts !== 'unsaved' && r.sel) expect(drawnBox(r.sel), `${r.id} still on the page`).toBe(true)
  if (control === 'the ☰ menu\'s switch') {
    expect(DRAWER, 'the ☰ menu closed (D2627 A16; the plan §4.1 row 4)').toBe(false)
    expect($('.drawer.open'), 'the ☰ menu gone from the page').toBeNull()
  }
  nothingHeld()
}
/** the Tracker's question, up: its words, as drawn (D2627 A20) — `back` the switch back to the admin view (words-read N7) */
async function asked(back = false) {
  const to = back ? 'back to the admin view' : 'to the member view'
  await vi.waitFor(() => expect(C.dlg?.msg, 'the Tracker\'s question').toBe(`You have unsaved chart edits on “${C.curSylName()}”.\n\nSave them before switching ${to}?`), { timeout: 5000, interval: 10 })
  expect([C.dlg.ok, C.dlg.alt, C.dlg.cancelLabel], 'its three answers').toEqual(['Save them', 'Discard them', 'Stay'])
}
/** the Tracker's move, whatever its doorway is doing, finished */
const trkSettled = async () => { await act(async () => { for (let i = 0; i < 4; i++) { await C.whenUnitSettled?.(); await C.whenLoaded?.(); await Promise.resolve() } }); await settle() }
/** each stored record of one squadron's Tracker holds `needle` */
const storedHas = (unit: string, needle: string) => TRK_WB.keys('tracker' as any)
  .filter((k: string) => k.startsWith(unit + '@') && !k.includes(':lay')).some((k: string) => String(TRK_WB.get('tracker' as any, k)).includes(needle))
/** an unsaved chart edit, and the new event's id */
async function newEvent(): Promise<string> {
  const had = new Set(C.SYL.map((e: any) => e.id))
  await chartEdit()
  const ev = C.SYL.find((e: any) => !had.has(e.id))
  expect(ev, 'the premise: a new event').toBeTruthy()
  return ev.id
}

/* ================= P11 — nothing open: the switch goes through at once (pins) ================= */
describe('(pin, today\'s too — P11) nothing open, no chart edits: the switch goes through at once, both ways, by each control', () => {
  for (const control of Object.keys(CONTROLS) as ControlName[]) {
    it(`${control}: Hunter at home — to the member view and back, at once, no note`, async () => {
      await app('hunter')
      await CONTROLS[control]()
      expect(isAdmin(), 'the member view').toBe(false)
      await CONTROLS[control]()
      expect(isAdmin(), 'back').toBe(true)
      expect(note()).toBe('')
      expect(DRAWER, 'the ☰ menu closed, as every drawer action does').toBe(false)
    })
  }
})

/* ================= B5 ================= */
/* each person, where the switch is pressed: Hunter, 142's admin, at home; Hunter by his Plan on 149; Saber, the master
   admin, on 149. The window: an Input window over View-only Sched (drawn over every page, so it stands in the member view
   too — the OIL list does not count in the member view); the failed save. */
const WHO: Record<string, { who: 'hunter' | 'saber'; at?: () => string }> = {
  'an admin at home': { who: 'hunter' },
  'an admin by Plan on 149': { who: 'hunter', at: () => 'u149' },
  /* (on 149, whose men have inputs to open — 150's one man, its first admin, has none) */
  'a master admin on 149': { who: 'saber', at: () => 'u149' },
}
const REASONS: Record<string, { id: string; lead: () => string; open: () => Promise<void> }> = {
  'a window open': { id: 'inputdlg', lead: () => GUARD_LEADS.window, open: async () => { await doing(() => { setPage('viewsched'); setInpEdit(ownInput()) }) } },
  'a change not saved': { id: 'unsaved', lead: () => GUARD_LEADS.retry, open: () => OPEN.unsaved!.open() },
}
describe('B5 — the view switch, both ways, both controls, refused (D2403, D2590)', () => {
  for (const [whoName, w] of Object.entries(WHO)) {
    for (const [reasonName, reason] of Object.entries(REASONS)) {
      for (const control of Object.keys(CONTROLS) as ControlName[]) {
        for (const back of [false, true]) {
          it(`${whoName}, ${reasonName}, ${back ? 'back to the admin view' : 'to the member view'} — by ${control}: refused, "…then ${back ? 'switch back to the admin view' : 'switch to the member view'}."`, async () => {
            await app(w.who)
            if (w.at) await topPick(w.at())
            if (back) { await badge(); expect(isAdmin(), 'the premise: in the member view').toBe(false) }
            await reason.open()
            expect(named(), `the premise: ${reason.id} counts`).toBe(reason.id)
            await refusedBy(control, row(reason.id))
            expect(note(), 'the ruled words').toBe(`Blocked: ${reason.lead()}, then ${back ? GUARD_ENDINGS.toAdmin : GUARD_ENDINGS.toMember}`)
          })
        }
      }
    }
  }
})

/* ================= B4b — the switch halves ================= */
describe('B4b — every window that only shows things closes, and the switch goes through (D2596, D2597)', () => {
  /* (the Leave War's show-only sheets open only for a member's tap — Ranger's, who has no switch; "Leave filed on the
     Inputs page" is the pick's half alone) */
  const CASES = Object.entries(SHOWN).filter(([id]) => id !== 'lwshow')
  /* the ones the switch already closed before K5, as the red run on the code as it stood found (P19: ALL AVAIL and Changes;
     the Calendar and its family — an admin's windows, gone from the member view; the marking window, which any press outside
     it closes) — pins */
  const TODAY = new Set(['avail', 'chg', 'days', 'inputsset', 'sansset', 'an untouched "Every Monday", with the Calendar', 'an untouched "Add a holiday", with the Calendar', 'trkpop'])
  for (const [id, s] of CASES) {
    for (const control of Object.keys(CONTROLS) as ControlName[]) {
      it(`${TODAY.has(id) ? '(pin, today\'s too) ' : ''}${id} — by ${control}: the member view, no note, its box gone and its state clear`, async () => {
        await app('hunter')
        await s.open()
        if (s.box) expect(drawnBox(s.box), `the premise: ${id} is drawn`).toBe(true)
        expect(s.shut(), `the premise: ${id} is open`).toBe(false)
        expect(whatIsOpen(), 'the premise: nothing refuses').toBeNull()
        await CONTROLS[control]()
        expect(isAdmin(), 'through').toBe(false)
        expect(note(), 'no note').toBe('')
        expect(s.shut(), `${id} closed`).toBe(true)
        if (s.box) expect(drawnBox(s.box), `${id}'s box gone`).toBe(false)
        nothingHeld()
      })
    }
  }
  for (const id of ['avail', 'chg', 'insights', 'lwday'] as const) {
    it(`${id} with an Input window open beside it: the badge refused, and ${id} still open`, async () => {
      await app('hunter')
      await SHOWN[id]!.open()
      await doing(() => { setInpEdit(ownInput()) })
      expect(named(), 'the premise: the Input window counts').toBe('inputdlg')
      const words = noteFor()
      await badge()
      expect(isAdmin()).toBe(true)
      expect(note()).toBe(words)
      expect(SHOWN[id]!.shut(), `${id} still open`).toBe(false)
    })
  }
  it('back to the admin view: Insights opened in the member view closes, the switch goes through', async () => {
    await app('hunter')
    await badge()
    await SHOWN.insights!.open()
    expect(SHOWN.insights!.shut(), 'the premise').toBe(false)
    await drawerRole()
    expect(isAdmin()).toBe(true)
    expect(SHOWN.insights!.shut()).toBe(true)
    expect(note()).toBe('')
  })
})

/* ================= B10, B12, B13 ================= */
describe('B10 — a change not saved: the saver made to fail', () => {
  for (const control of Object.keys(CONTROLS) as ControlName[]) {
    it(`${control}: refused with the Retry lead and "then switch to the member view." (D2627 A13); Retry lands → nothing by itself; a fresh press goes through`, async () => {
      await app('hunter')
      await OPEN.unsaved!.open()
      await refusedBy(control, row('unsaved'))
      expect(note()).toBe(`Blocked: ${GUARD_LEADS.retry}, then ${GUARD_ENDINGS.toMember}`)
      saver.status = 'idle'
      await doing(() => {})
      await act(async () => { await new Promise(r => setTimeout(r, 30)) })
      expect(isAdmin(), 'nothing happens by itself when the save lands').toBe(true)
      await CONTROLS[control]()
      expect(isAdmin(), 'a fresh press goes through').toBe(false)
    })
  }
})

describe('B12, B13 — two reasons, one at a time (D2627 A10); a refusal before the Tracker\'s question', () => {
  it('B12: a window and a failed save — the window\'s note; the window closed, pressed again: the Retry note; never the Tracker\'s question', async () => {
    await app('hunter')
    await OPEN.oilday!.open()
    await OPEN.unsaved!.open()
    await badge()
    expect(note()).toBe(`Blocked: ${GUARD_LEADS.window}, then ${GUARD_ENDINGS.toMember}`)
    await press(tid('win-oilday-x'), 'the OIL list\'s ✕')
    await drawerRole()
    expect(note()).toBe(`Blocked: ${GUARD_LEADS.retry}, then ${GUARD_ENDINGS.toMember}`)
    expect(isAdmin()).toBe(true)
    expect(C.dlg ?? null, 'no question').toBeNull()
  })
  it('B13: a window open and unsaved chart edits: refused, the Tracker\'s question never raised (core.dlg null)', async () => {
    await app('hunter')
    await goTracker()
    await chartEdit()
    await OPEN.inputedit!.open()
    await badge()
    expect(isAdmin()).toBe(true)
    expect(note().startsWith(`Blocked: ${GUARD_LEADS.window}`)).toBe(true)
    expect(C.dlg ?? null, 'no question was raised').toBeNull()
  })
})

/* ================= B11 — the switch half ================= */
describe('B11 — Admin\'s unsaved work refuses the switch to the member view (D2595, D2598)', () => {
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
    for (const control of Object.keys(CONTROLS) as ControlName[]) {
      it(`${name} — by ${control}: refused under its own lead, the row or form still open on Admin`, async () => {
        await app('hunter')
        await c.open()
        expect(named(), 'the premise').toBe(c.id)
        await refusedBy(control, row(c.id))
        expect(CURPAGE, 'still on Admin').toBe('admin')
      })
    }
  }
  it('(pin, today\'s too) a Users row opened with nothing changed: through, off Admin onto View-only Sched', async () => {
    await app('hunter')
    await openUserRow()
    expect(named()).toBeNull()
    await badge()
    expect({ admin: isAdmin(), page: CURPAGE }).toEqual({ admin: false, page: 'viewsched' })
  })
})

/* ================= B14, B15 — the Tracker's question (D2627 A20) ================= */
describe('B14 — the Tracker\'s question at the switch to the member view (D2627 A20)', () => {
  async function hunterOn149WithEdit(): Promise<string> {
    await app('hunter')
    await topPick('u149')
    await goTracker()
    expect(storageUnit(), 'the premise: 149\'s Tracker').toBe('u149')
    return newEvent()
  }
  it('Hunter on 149\'s Tracker, a new test event: the question\'s words; Stay → the admin view still, the edit kept', async () => {
    const id = await hunterOn149WithEdit()
    await badge()
    await asked()
    await press($('#dlgCancel'), 'Stay')
    expect({ admin: isAdmin(), dirty: C.sylDirty, kept: !!C.byid[id], trk: storageUnit() }).toEqual({ admin: true, dirty: true, kept: true, trk: 'u149' })
  })
  it('…Discard them → the member view, the chart as stored, no cover band, the door not held, the Tracker on 142', async () => {
    const id = await hunterOn149WithEdit()
    await badge()
    await asked()
    await press($('#dlgAlt'), 'Discard them')
    await vi.waitFor(() => expect(isAdmin(), 'the member view').toBe(false), { timeout: 5000, interval: 10 })
    await trkSettled()
    expect({ dirty: C.sylDirty, kept: !!C.byid[id] }, 'the chart as stored').toEqual({ dirty: false, kept: false })
    expect(trackerCover(), 'no cover band').toBeNull()
    expect(storageHeld(), 'the door not held').toBe(false)
    expect(storageUnit(), 'the Tracker on his own pages\' squadron').toBe('u142')
    expect(storedHas('u149', id), 'nothing of it in 149\'s record').toBe(false)
  })
  it('…Save them → saved in 149\'s record, then the member view, no cover, the Tracker on 142', async () => {
    const id = await hunterOn149WithEdit()
    await badge()
    await asked()
    await press($('#dlgOk'), 'Save them')
    await vi.waitFor(() => expect(isAdmin(), 'the member view').toBe(false), { timeout: 5000, interval: 10 })
    await trkSettled()
    expect(storedHas('u149', id), 'saved in 149\'s record').toBe(true)
    expect(trackerCover()).toBeNull()
    expect(storageHeld()).toBe(false)
    expect(storageUnit()).toBe('u142')
  })
  it('Saber on his own 142, the same edit: asked all the same; Discard → the member view, the chart back to its last save', async () => {
    await app('saber')
    await goTracker()
    const id = await newEvent()
    await drawerRole()
    await asked()
    expect(DRAWER, 'the ☰ menu closed first, the question in sight').toBe(false)
    await press($('#dlgAlt'), 'Discard them')
    await vi.waitFor(() => expect(isAdmin()).toBe(false), { timeout: 5000, interval: 10 })
    await trkSettled()
    expect({ dirty: C.sylDirty, kept: !!C.byid[id], trk: storageUnit() }).toEqual({ dirty: false, kept: false, trk: 'u142' })
    expect(trackerCover()).toBeNull()
  })
  it('Hunter on 149, Edit chart layout open and nothing moved: no question, the member view, the editor closed (D2654 E3), the Tracker on 142', async () => {
    await app('hunter')
    await topPick('u149')
    await goTracker()
    await trkDo(() => C.toggleArrange())
    expect({ editor: !!C.arrangeMode, dirty: !!C.sylDirty }, 'the premise').toEqual({ editor: true, dirty: false })
    await badge()
    expect(C.dlg ?? null, 'no question').toBeNull()
    expect(isAdmin(), 'the member view, at once').toBe(false)
    await trkSettled()
    expect(C.arrangeMode, 'the editor closed').toBeFalsy()
    expect({ trk: storageUnit(), held: storageHeld(), cover: trackerCover() }).toEqual({ trk: 'u142', held: false, cover: null })
  })
  it('(pin, today\'s too) Saber on his own 142, Edit chart layout open and nothing moved: his pages do not move, so the switch leaves the editor open (the plan §4.4 step 5 closes it only where they move)', async () => {
    await app('saber')
    await goTracker()
    await trkDo(() => C.toggleArrange())
    await badge()
    expect(isAdmin()).toBe(false)
    await trkSettled()
    expect({ editor: !!C.arrangeMode, trk: storageUnit() }).toEqual({ editor: true, trk: 'u142' })
    await trkDo(() => C.toggleArrange())
  })
})

/* B15 — AND BACK. A state that a press does make: Saber on his own 142 in the member view, where the Tracker is offered to a
   member as to an admin (D121), makes a chart edit there and presses the badge. */
describe('B15 — the Tracker\'s question at the switch back to the admin view (words-read N7) — reached by a press', () => {
  async function editInMemberView(): Promise<string> {
    await app('saber')
    await badge()
    expect(isAdmin(), 'the premise: the member view').toBe(false)
    await goTracker()
    return newEvent()
  }
  it('Saber in the member view on 142, a new test event, the badge: "…Save them before switching back to the admin view?"; Stay → the member view still, the edit kept', async () => {
    const id = await editInMemberView()
    await badge()
    await asked(true)
    await press($('#dlgCancel'), 'Stay')
    expect({ admin: isAdmin(), dirty: C.sylDirty, kept: !!C.byid[id] }).toEqual({ admin: false, dirty: true, kept: true })
  })
  it('…Discard them → the admin view, the chart as stored', async () => {
    const id = await editInMemberView()
    await drawerRole()
    await asked(true)
    await press($('#dlgAlt'), 'Discard them')
    await vi.waitFor(() => expect(isAdmin()).toBe(true), { timeout: 5000, interval: 10 })
    await trkSettled()
    expect({ dirty: C.sylDirty, kept: !!C.byid[id], stored: storedHas('u142', id) }).toEqual({ dirty: false, kept: false, stored: false })
  })
  it('…Save them → saved in 142\'s record, then the admin view', async () => {
    const id = await editInMemberView()
    await badge()
    await asked(true)
    await press($('#dlgOk'), 'Save them')
    await vi.waitFor(() => expect(isAdmin()).toBe(true), { timeout: 5000, interval: 10 })
    await trkSettled()
    expect({ dirty: C.sylDirty, stored: storedHas('u142', id) }).toEqual({ dirty: false, stored: true })
  })
})

/* ================= B16 ================= */
describe('B16 — no press leaves a window held by the member view', () => {
  it('a refused switch with an Input window on his own Inputs, by each control: no held band, no role chip, the window live', async () => {
    await app('hunter')
    await OPEN.inputedit!.open()
    await badge()
    expect(isAdmin(), 'refused by the badge').toBe(true)
    nothingHeld()
    await drawerRole()
    expect(isAdmin(), 'refused by the ☰ menu').toBe(true)
    nothingHeld()
    expect(INPEDIT, 'his window still his').not.toBeNull()
    expect(drawnBox('[data-testid="win-inputedit"]'), 'still drawn').toBe(true)
  })
  /* the road the member view's band came from (his D2389): a Plan holder on 149 with an Input window open there — before K5
     the switch went through and held the window under "Member view.", its chip lifted above the shade */
  it('Hunter by his Plan on 149, an Input window over its View-only Sched: refused by each control, no "Member view." band, no chip', async () => {
    await app('hunter')
    await topPick('u149')
    await doing(() => { setPage('viewsched'); setInpEdit(ownInput()) })
    expect(named(), 'the premise').toBe('inputdlg')
    await badge()
    expect(isAdmin(), 'refused by the badge').toBe(true)
    nothingHeld()
    await drawerRole()
    expect(isAdmin(), 'refused by the ☰ menu').toBe(true)
    nothingHeld()
    expect(INPEDIT, 'the window still open').not.toBeNull()
  })
})

/* ================= row 5 — the Input window's own chip ================= */
/* The chip is drawn only on a window the member view holds — reached by no press since D2403 (B16), so the window is held
   by the raw switch (state/store.ts switchRoleViewRaw), named so; Build 2 removes the chip. Its press leaves the Input
   window's two rows out and still asks every other row (the plan §4.1 row 5). */
describe('row 5 — the Input window\'s own "Back to the admin view" chip, on a window held by the raw switch (reached by no press since D2403)', () => {
  async function heldWithChip() {
    await app('hunter')
    await topPick('u149')
    const b = $('#roleBadge')!
    b.getBoundingClientRect = () => ({ left: 1360, top: 14, right: 1520, bottom: 42, width: 160, height: 28, x: 1360, y: 14, toJSON() { return {} } }) as DOMRect
    await doing(() => { setPage('inputs'); setInpEdit(ownInput()) })
    await act(async () => { switchRoleViewRaw() })
    await settle()
    expect(tid('inped-rolechip'), 'the premise: the chip on the held window').not.toBeNull()
  }
  it('(pin, today\'s too) with only the held window open: the chip gives the admin view back', async () => {
    await heldWithChip()
    await press(tid('inped-rolechip'), 'the chip')
    expect(isAdmin()).toBe(true)
    expect(note()).toBe('')
  })
  it('with a change not saved as well: the chip is refused, "Blocked: press Retry…, then switch back to the admin view." — it leaves out only its own window', async () => {
    await heldWithChip()
    await OPEN.unsaved!.open()
    expect(whatIsOpen(['inputedit', 'inputdlg'])?.row.id, 'the premise: the failed save counts').toBe('unsaved')
    await press(tid('inped-rolechip'), 'the chip')
    expect(isAdmin(), 'refused').toBe(false)
    expect(note()).toBe(`Blocked: ${GUARD_LEADS.retry}, then ${GUARD_ENDINGS.toAdmin}`)
    expect(tid('inped-rolechip'), 'the held window and its chip still there').not.toBeNull()
  })
})

/* ================= B19, B20 — the saver ================= */
describe('B19 — a failed save that arrives while the Tracker\'s question stands, at the switch', () => {
  it('the question up for the switch; the saver fails; Discard: refused with the Retry note, still the admin view', async () => {
    await app('hunter')
    await goTracker()
    await chartEdit()
    await badge()
    await asked()
    saver.status = 'failed'; await doing(() => watchSaves(saver as any))
    await press($('#dlgAlt'), 'Discard them')
    await act(async () => { await new Promise(r => setTimeout(r, 30)) })
    await settle()
    expect(isAdmin()).toBe(true)
    expect(note()).toBe(`Blocked: ${GUARD_LEADS.retry}, then ${GUARD_ENDINGS.toMember}`)
  })
})

describe('B20 — a save still going (D2627 A9): the switch waits for the saver\'s own answer, never a timer of its own', () => {
  it('a change made and the badge pressed in the same tick: the save is sent first and lands, then the switch', async () => {
    await app('hunter')
    const s = answeringSaver()
    s.change()
    await badge()
    expect(s.sent.length, 'the save sent first').toBe(1)
    expect(isAdmin(), 'the switch waits for it').toBe(true)
    await s.answer(true)
    expect(isAdmin(), 'landed: the switch goes on').toBe(false)
    expect(note()).toBe('')
  })
  it('made to fail: refused with the Retry note, still the admin view', async () => {
    await app('hunter')
    const s = answeringSaver()
    s.change()
    await drawerRole()
    await s.answer(false)
    expect(isAdmin()).toBe(true)
    expect(note()).toBe(`Blocked: ${GUARD_LEADS.retry}, then ${GUARD_ENDINGS.toMember}`)
  })
  it('a save that never answers (a stand-in, named so — no store the app ships can hang): the switch does not go, for as long as it has not answered', async () => {
    await app('hunter')
    const s = answeringSaver()
    s.change()
    await badge()
    await act(async () => { await new Promise(r => setTimeout(r, 400)) })
    await settle()
    expect({ admin: isAdmin(), status: s.pm.status, note: note() }).toEqual({ admin: true, status: 'saving', note: '' })
  })
  it('the badge pressed again while the first waits: the first is dropped — one switch when the save lands, never two', async () => {
    await app('hunter')
    const s = answeringSaver()
    s.change()
    await badge()
    await badge()
    expect(isAdmin(), 'both wait for the save').toBe(true)
    await s.answer(true)
    expect(isAdmin(), 'one switch, to the member view').toBe(false)
  })
  it('a pick pressed while the switch waits: the switch is dropped — the pick goes on when the save lands, the view as it was', async () => {
    await app('hunter')
    const s = answeringSaver()
    s.change()
    await badge()
    await topPick('u149')
    await s.answer(true)
    expect({ unit: UNIT, admin: isAdmin() }).toEqual({ unit: 'u149', admin: true })
  })
  it('a pointer-down elsewhere on the page while it waits: dropped — nothing happens when the save lands', async () => {
    await app('hunter')
    const s = answeringSaver()
    s.change()
    await badge()
    await act(async () => { fireEvent.pointerDown(document.body) })
    await s.answer(true)
    expect(isAdmin()).toBe(true)
    expect(note()).toBe('')
  })
  it('(pin, today\'s too) with no save going the switch is synchronous, as before: the member view the moment the badge is pressed', async () => {
    await app('hunter')
    watchSaves(null)
    act(() => { fireEvent.click($('#roleBadge')!) })
    expect(isAdmin()).toBe(false)
  })
})

/* ================= B21 ================= */
describe('B21 — sign-out and the next person', () => {
  it('a refused switch, then Logout: the note gone, nothing open, whatIsOpen() null for the next sign-in', async () => {
    const prev = setReloadSeam(() => {})
    try {
      await app('hunter')
      await OPEN.oilday!.open()
      await badge()
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

/* ================= B30 — the switch's cases ================= */
/* (the pick's fourth case, "the squadron already in view picked", has no twin here: every press of the switch is a change) */
describe('B30 — when the show-only windows close at the switch, and when they do not', () => {
  it('ALL AVAIL open, unsaved chart edits, the badge: the question; Stay → ALL AVAIL still open; Discard → closed, then the member view', async () => {
    await app('hunter')
    await goTracker()
    await chartEdit()
    await doing(() => { setPage('editsched'); avail() })
    await badge()
    await asked()
    await press($('#dlgCancel'), 'Stay')
    expect({ admin: isAdmin(), avail: !!AVAILWIN }, 'Stay').toEqual({ admin: true, avail: true })
    await badge()
    await asked()
    await press($('#dlgAlt'), 'Discard them')
    await vi.waitFor(() => expect(isAdmin()).toBe(false), { timeout: 5000, interval: 10 })
    expect(AVAILWIN, 'closed').toBeNull()
  })
  it('a switch refused for a failed save: ALL AVAIL still open', async () => {
    await app('hunter')
    await doing(() => { setPage('editsched'); avail() })
    await OPEN.unsaved!.open()
    await badge()
    expect({ admin: isAdmin(), avail: !!AVAILWIN }).toEqual({ admin: true, avail: true })
  })
  it('a save waited for, then landed: closed, then the switch — never before it lands', async () => {
    await app('hunter')
    await doing(() => { setPage('editsched'); avail() })
    const s = answeringSaver()
    s.change()
    await badge()
    expect({ admin: isAdmin(), avail: !!AVAILWIN }, 'still waiting').toEqual({ admin: true, avail: true })
    await s.answer(true)
    expect({ admin: isAdmin(), avail: !!AVAILWIN }).toEqual({ admin: false, avail: false })
  })
})

/* ================= a pick's question is byte for byte as before (pin) ================= */
describe('(pin, today\'s too) a pick\'s question is byte for byte as before', () => {
  it('Hunter on 142 with an unsaved chart edit picks 149: "…Save them before switching to 149?"', async () => {
    await app('hunter')
    await goTracker()
    await chartEdit()
    await topPick('u149')
    await vi.waitFor(() => expect(C.dlg?.msg).toBe(`You have unsaved chart edits on “${C.curSylName()}”.\n\nSave them before switching to 149?`), { timeout: 5000, interval: 10 })
    await press($('#dlgCancel'), 'Stay')
    expect(UNIT).toBe('u142')
  })
})
