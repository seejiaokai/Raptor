// @vitest-environment jsdom
/* THE GUARD RAIL REFUSES NOTHING FOR OPEN WORK — step KR's red-first tests (chat A211, 28 Nov 26; the plan
   docs/superpowers/plans/2026-11-27-msq-s1-kr-no-blocks-plan.md §8.1, D1–D8; the brief
   docs/superpowers/briefs/2026-11-28-msq-s1-kr-redtests-brief.md). Written BEFORE KR, and seen failing on the code as it
   stood, but for the tests the report names as passing today.

   His rulings: D2825 (27 Nov 26) — a pick of another squadron, the switch to or from the member view, a bell line or the
   lit bell bringing another squadron, the page door, the OIL list's card and an Undo that changes the squadron GO
   THROUGH: what is open closes, half-typed work is dropped, no note. Still standing: "Not saved" stops them until Retry
   (D2594, D2627 A13); the Tracker still asks about unsaved chart edits (D2627 A20); show-only windows and the two edit modes
   close as before. His answers of 27 Nov win over any line of the plan that differs: D2836 (a window held since his
   midnight move closes at a pick), D2837 (a holiday waiting for a leave period is dropped at a switch — its new words come
   later; only the drop is tested here), D2838 (a box with no Save button is saved into its OWN squadron first, then the
   switch goes through in the same press; if that save fails the switch is stopped with "Not saved").

   EVERY PRESS IS THE WHOLE SEQUENCE ON THE REAL CONTROLS, as the door files make it (ui/msq-guard-doors.test.tsx and its
   -switch, -bell and -undo twins; their presses shared in test-support/msq-guard-drops-kit.ts). Two belts, named so:
   row 13's landing (an Undo that brings his own squadron back — no button reaches it: on a squadron he only views the
   View-only Sched draws no Undo), driven through the engine the Undo button calls; and the OIL list over a squadron he
   only views, reached by the raw entry. Every test is about what he would see or what is saved: no function KR has yet
   to add is called. Each test marked [U2] presses Admin → Users' rows or forms, which chat S2's U2 changes: re-checked
   once U2 lands.

   The world: three squadrons (test-support/msq-world.ts withThird — 150's id is third.u150). Hunter is 142's admin with
   Plan of 149 and View of 150; Ranger 142's member with View of 149 and of 150; Saber the master admin. Wed 15 Jul 26. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { act, fireEvent } from '@testing-library/react'
import { withThird, third, PID } from '../test-support/msq-world'
import { UNIT } from '../engine/unitview'
import { INPUTS, inpId } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { VCONF, ruleFmt } from '../engine/rules'
import { unitSetting } from '../engine/hooks'
import { dayDrafts } from '../engine/drafts'
import { CURPAGE, INPMODE, setPage, OILWAIT } from '../state/view'
import { INPEDIT, OILLIST, TPLEDIT, DRAFTSEDIT, DAYSWIN, setOilList, setTplEdit } from './pops'
import { isAdmin, pageUnit } from '../state/perms'
import { writeInputs, subscribe } from '../state/store'
import { PLANPUCKS } from '../state/plan'
import { ACCOUNTS_LIST, accountByName } from '../state/accounts'
import { homeOn, todayIso, units, unitsLoad } from '../state/units'
import { holdNow } from '../state/typing-hold'
import { LGEDIT } from '../state/auth'
import { undoState } from '../undo/timeline'
import { globalUndoEngine } from './topstate'
import { rawEnter } from '../test-support/raw-entry'
import { getState as lwState, worldUnit, setCell, recordsAt } from '../leavewar/state/store'
import { reqRowNames } from '../leavewar/sync'
import { trackerAsking } from '../tracker/role.js'
import * as FMT from '../tracker/app/fileFormat.js'
import { clearToast } from './toast'
import { setCxt, setSortAll } from './board'
import { whatIsOpen, GUARD_LEADS, GUARD_ENDINGS } from './guard'
import {
  $, C, OPEN, TRK_OPENERS, TRK_WB, app, doing, press, settle, tid, typeIn, goLeaveWar, goTracker, chartEdit, guardTeardown,
  openUserRow, openHolidayNoLeave, openOilRevise, openQualsNew, ownInput, rosterMan, phoneWidth, topPick, note, named,
  saver, answeringSaver, nothingHeld, asSaber, goAdmin, openTrkAsk,
} from '../test-support/msq-guard-testkit'
import {
  WORDS, storedAnywhere, toastCount, toastsSince, noNote, windowWithWords, wordsGone, fileFor, drawerPick, topPickByKeys,
  keyPress, badge, drawerRole, of, inputLine, sansReminder, tapLine, bellOpen, askAccess, holidayLine, hasUnit, saberOn151,
  rangerFiledThen149, ownNow,
} from '../test-support/msq-guard-drops-kit'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()

afterEach(async () => {
  /* the board's two questions outlive the page (ui/board.ts's own state — as in the door files) */
  setCxt(null); setSortAll(null)
  await guardTeardown()
  saver.status = 'idle'
  clearToast()
  document.getElementById('toastEl')?.remove()
  document.getElementById('srSay')?.remove()
})

/* ---- the doors (the plan §8.1's list), each with the press that would change the squadron, and what "through" is ---- */
type Door = {
  /** sets the world up so the press would change the squadron in view; what it hands back is the door's own */
  prep: () => Promise<any>
  /** the Input window with words typed, over the page he is on — the family every door is tried with (D1) */
  win: (ctx: any) => Promise<void>
  press: (ctx: any) => Promise<void>
  /** what the press does once it goes through */
  through: (ctx: any) => void
  /** the Retry note's ending at this door (D2627 A13); null where the Retry note has no ending of his yet (Q1 held) */
  ending: string | null
}
const hunterWindow = async () => { await windowWithWords(ownInput()) }
const DOORS: Record<string, Door> = {
  'the pick, by the bar\'s list': {
    prep: async () => { await app('hunter') },
    win: hunterWindow,
    press: () => topPick('u149'),
    through: () => { expect(UNIT, '149 in view').toBe('u149') },
    ending: GUARD_ENDINGS.pick('149'),
  },
  'the pick, by the ☰ menu\'s list': {
    prep: async () => { await app('hunter') },
    win: hunterWindow,
    press: () => drawerPick('u149'),
    through: () => { expect(UNIT, '149 in view').toBe('u149') },
    ending: GUARD_ENDINGS.pick('149'),
  },
  'the switch to the member view, by the name badge': {
    prep: async () => { await app('hunter'); await doing(() => setPage('viewsched')) },
    win: hunterWindow,
    press: () => badge(),
    through: () => { expect(isAdmin(), 'the member view').toBe(false) },
    ending: GUARD_ENDINGS.toMember,
  },
  'the switch to the member view, by the ☰ menu': {
    prep: async () => { await app('hunter'); await doing(() => setPage('viewsched')) },
    win: hunterWindow,
    press: () => drawerRole(),
    through: () => { expect(isAdmin(), 'the member view').toBe(false) },
    ending: GUARD_ENDINGS.toMember,
  },
  'the switch back to the admin view, by the name badge': {
    /* (his own input, filed first: in the member view the window he may type in is his own) */
    prep: async () => { await app('hunter'); const mine = await fileFor(PID.hunter, 'LL', '2026-07-28'); await badge(); expect(isAdmin(), 'the premise: the member view').toBe(false); return mine },
    win: async mine => { await windowWithWords(mine) },
    press: () => badge(),
    through: () => { expect(isAdmin(), 'back to the admin view').toBe(true) },
    ending: GUARD_ENDINGS.toAdmin,
  },
  'a bell line of another squadron': {
    prep: async () => { await app('hunter'); await topPick('u149'); expect(UNIT, 'the premise: on 149').toBe('u149'); const inp = of('u142'); return { inp, n: inputLine(PID.hunter, 'u142', inp) } },
    win: hunterWindow,
    press: ({ n }) => tapLine(n),
    through: ({ inp }) => { expect([UNIT, CURPAGE, INPEDIT?.iid], '142, its input open on 142\'s Inputs').toEqual(['u142', 'inputs', inp.iid]) },
    ending: GUARD_ENDINGS.line,
  },
  'the lit bell (an access request of another squadron)': {
    prep: async () => { askAccess('u142'); await app('hunter'); await topPick('u149'); expect(UNIT, 'the premise: on 149').toBe('u149') },
    win: hunterWindow,
    press: () => press($('#notifyBell'), 'the lit bell'),
    through: () => { expect([UNIT, CURPAGE], '142\'s Admin → Users').toEqual(['u142', 'admin']) },
    ending: GUARD_ENDINGS.bell,
  },
  'the bell\'s OIL tap (his own weekend input of another squadron)': {
    prep: async () => {
      await app('hunter')
      const mine = await fileFor(PID.hunter, 'Training', '2026-07-18')
      await topPick('u149')
      expect(UNIT, 'the premise: on 149').toBe('u149')
      return mine
    },
    win: hunterWindow,
    press: () => press($('#notifyBell'), 'the bell'),
    through: mine => { expect([UNIT, INPEDIT?.iid], '142, his weekend input\'s window').toEqual(['u142', mine.iid]) },
    ending: null,
  },
  'his own SANS reminder': {
    prep: async () => { await app('hunter'); await topPick('u149'); expect(UNIT, 'the premise: on 149').toBe('u149') },
    win: hunterWindow,
    press: () => tapLine(sansReminder(PID.hunter)),
    through: () => { expect([UNIT, CURPAGE, INPMODE], '142\'s Inputs on its SANS tab').toEqual(['u142', 'inputs', 'sans']) },
    ending: GUARD_ENDINGS.line,
  },
  'a holiday\'s line': {
    prep: async () => { await app('hunter'); const n = await holidayLine(); await topPick('u149'); expect(UNIT, 'the premise: on 149').toBe('u149'); return n },
    win: hunterWindow,
    press: n => tapLine(n),
    through: () => { expect(UNIT, '142').toBe('u142'); expect(OILLIST, '142\'s OIL list').toMatchObject({ from: '2026-07-17', unit: 'u142' }) },
    ending: GUARD_ENDINGS.line,
  },
  'the page door (a line of his own squadron, from a squadron he only views)': {
    prep: async () => {
      await app('ranger')
      const a = await fileFor(PID.ranger, 'LL', '2026-07-27')
      const b = await fileFor(PID.ranger, 'LL', '2026-07-28')
      await topPick('u149')
      expect([UNIT, CURPAGE], 'the premise: 149\'s View-only Sched').toEqual(['u149', 'viewsched'])
      return { a, b, n: inputLine(PID.ranger, 'u142', b) }
    },
    win: async ({ a }) => { await windowWithWords(a) },
    press: ({ n }) => tapLine(n),
    through: ({ b }) => { expect([UNIT, CURPAGE, INPEDIT?.iid], '142, his other input open on his Inputs').toEqual(['u142', 'inputs', b.iid]) },
    ending: GUARD_ENDINGS.line,
  },
  'the Undo of "+ New squadron" with 151 picked': {
    prep: async () => saberOn151(),
    /* (151 has no inputs: the family this door reaches is the Calendar with a holiday typed — B24's) */
    win: async () => { await OPEN.holiday!.open(); expect(named(), 'the premise: the holiday counts').toBe('holiday') },
    press: () => press($('#undoBtn'), 'the top bar\'s Undo'),
    through: id => { expect(hasUnit(id), '151 gone').toBe(false); expect(UNIT, '142 in view').toBe('u142') },
    ending: GUARD_ENDINGS.undo,
  },
  'row 13\'s landing (a belt: an Undo that brings his own squadron back, by the engine the Undo button calls)': {
    prep: async () => rangerFiledThen149(true),
    win: async ({ other }) => { await windowWithWords(other) },
    press: () => doing(() => { globalUndoEngine().undo() }),
    through: ({ leave }) => { expect(INPUTS.includes(leave), 'his leave undone').toBe(false); expect([UNIT, CURPAGE], '142 back on his Inputs').toEqual(['u142', 'inputs']) },
    ending: GUARD_ENDINGS.undo,
  },
}
/** what is dropped of the door's family: the Input window's words (or, at the Undo's door, the holiday typed) */
const dropped = (name: string) => {
  if (name.startsWith('the Undo of')) {
    expect($('[data-testid="win-holiday"]'), 'the holiday form gone').toBeNull()
    expect(storedAnywhere('Founders'), 'the holiday typed stored nowhere').toEqual([])
  } else wordsGone()
}

/* ================= D1 — work open, the press: the change goes through, the work gone, no note ================= */
describe('D1 — at every door, the Input window with words typed: the change goes through, the window closed, its words dropped, no note (D2825)', () => {
  for (const [name, d] of Object.entries(DOORS)) {
    it(`${name}: goes through, the old window closed and its words stored nowhere, no note (D2825)`, async () => {
      const ctx = await d.prep()
      await d.win(ctx)
      const t0 = toastCount()
      await d.press(ctx)
      d.through(ctx)
      noNote(t0)
      dropped(name)
      nothingHeld()
    })
  }
})

/* each family of open work, by the pick of 149 from the top bar (on a phone, by the ☰ menu) — the plan §8.1 D1's list */
type Family = { who?: 'hunter' | 'saber'; open: () => Promise<any>; gone: (ctx: any) => void | Promise<void>; phone?: boolean }
const FAMILIES: Record<string, Family> = {
  '[U2] a Users row with its sign-in changed': {
    open: () => OPEN.userrow!.open(),
    gone: () => {
      expect($('[data-editing]'), 'the row closed').toBeNull()
      expect(ACCOUNTS_LIST.some(a => a.name === 'someone.else@mail'), 'the typed sign-in on no account').toBe(false)
    },
  },
  '[U2] a Users row opened and left unchanged': {
    open: async () => { await openUserRow(); expect(named(), 'the premise: unchanged, it does not count').toBeNull() },
    gone: () => { expect($('[data-editing]'), 'the row closed').toBeNull() },
  },
  '[U2] Give access with its Role changed': {
    open: () => OPEN.giveaccess!.open(),
    gone: () => {
      expect($('[data-approving]'), 'Give access closed').toBeNull()
      expect(accountByName('newface@mail')?.role ?? null, 'the request not answered as admin').not.toBe('admin')
    },
  },
  '[U2] "Add a person" with a callsign typed': {
    open: () => OPEN.addperson!.open(),
    gone: () => {
      expect(Object.values(PEOPLE).some((p: any) => p.cs === 'Nova'), 'nobody added').toBe(false)
      expect(storedAnywhere('Nova'), 'the callsign stored nowhere').toEqual([])
    },
  },
  '"+ New squadron" opened and left blank': {
    who: 'saber',
    open: async () => { await asSaber(); await goAdmin('Squadrons'); await press($('#sqNew'), '+ New squadron'); expect(named(), 'the premise: blank, it does not count').toBeNull() },
    gone: () => { expect($('[data-new-sqn]'), 'the form closed').toBeNull() },
  },
  '"+ New squadron" with a number typed': {
    who: 'saber',
    open: () => OPEN.newsqn!.open(),
    gone: () => {
      expect($('[data-new-sqn]'), 'the form closed').toBeNull()
      unitsLoad()
      expect(units().some(u => u.num === '151'), 'no squadron 151').toBe(false)
    },
  },
  'the Calendar with a holiday typed': {
    open: () => OPEN.holiday!.open(),
    gone: () => {
      expect([DAYSWIN, $('[data-testid="win-holiday"]')], 'the Calendar and its form closed').toEqual([null, null])
      expect(storedAnywhere('Founders'), 'the holiday stored nowhere').toEqual([])
    },
  },
  'the Calendar with a new holiday kept waiting for a leave period (D2837: dropped)': {
    open: async () => { await openHolidayNoLeave(); expect(named(), 'the premise: refused at Save and kept waiting').toBe('holiday') },
    gone: () => {
      expect([DAYSWIN, $('[data-testid="win-holiday"]')], 'the Calendar and its form closed').toEqual([null, null])
      expect(storedAnywhere('Far day'), 'the waiting holiday stored nowhere').toEqual([])
    },
  },
  'Inputs calendar settings with a setting changed': {
    open: () => OPEN.inputsset!.open(),
    gone: () => { expect($('[data-testid="win-inputsset"]'), 'the settings window closed').toBeNull() },
  },
  'Quals\' "Add qualification" with words typed': {
    open: () => openQualsNew('KR QUAL'),
    gone: () => {
      expect(storedAnywhere('KR QUAL'), 'the words stored nowhere').toEqual([])
      expect(($('#qNewQual') as HTMLInputElement | null)?.value ?? '', 'no box holds them').toBe('')
    },
  },
  'the OIL question from a row of the Inputs list': {
    open: async () => { await openOilRevise(); const x = INPUTS.find((r: any) => r.type === 'Duty' && r.date === 'Jul 18' && r.oil) as any; expect(x, 'the premise: the answered weekend Duty').toBeTruthy(); return { x, oil: JSON.stringify(x.oil) } },
    gone: ({ x, oil }) => {
      expect($('[data-testid="oilconf"]'), 'the question closed').toBeNull()
      expect(JSON.stringify((INPUTS.find((r: any) => r.iid === x.iid) as any)?.oil), 'its OIL as it was').toBe(oil)
    },
  },
  'the OIL list with a pick made': {
    open: async () => {
      const x: any = { remarks: '', mod: '2026-07-01', yr: 2026, allday: true, s: 0, e: 1439, person: rosterMan(), type: 'Duty', date: 'Jul 18' }
      inpId(x); writeInputs(() => { INPUTS.unshift(x) })
      await doing(() => setOilList({ from: '2026-07-18', to: '2026-07-18', name: 'Holiday', unit: 'u142' }))
      await press(tid(`odl-yes-${x.iid}`), 'Yes on its card')
      expect(tid(`odl-yes-${x.iid}`)?.getAttribute('aria-pressed'), 'the premise: picked, not saved').toBe('true')
      return x
    },
    gone: x => {
      expect(OILLIST, 'the list closed').toBeNull()
      expect((INPUTS.find((r: any) => r.iid === x.iid) as any)?.oil ?? null, 'nothing answered').toBeNull()
    },
  },
  'a Leave War sheet held until Save (a Required row\'s Rename, a name typed)': {
    open: async () => {
      await goLeaveWar()
      await press(tid('fly-name-req-p'), 'the Required P row\'s name')
      await typeIn('[data-testid="reqname-name"]', 'KR name')
      expect(named(), 'the premise: the sheet counts').toBe('lwsheet')
    },
    gone: () => {
      expect(tid('req-name-form'), 'the sheet closed').toBeNull()
      expect(reqRowNames().p, 'not renamed').not.toBe('KR name')
      expect(storedAnywhere('KR name'), 'the name stored nowhere').toEqual([])
    },
  },
  'a Tracker window (✎ Edit details, a name typed)': {
    open: async () => {
      await goTracker()
      await TRK_OPENERS.infoId!()
      expect(C.infoId, 'the premise: ✎ Edit details is up').toBeTruthy()
      await typeIn('#ifName', 'KR event')
    },
    gone: () => {
      expect([C.infoId ?? null, $('#infoModal')], 'the window closed').toEqual([null, null])
      expect(storedAnywhere('KR event'), 'the name stored nowhere').toEqual([])
    },
  },
  'a Tracker window behind the phone\'s Flow chart tab (a lull pop-up holding its first day)': {
    phone: true,
    open: async () => {
      phoneWidth()
      await goTracker()
      await press($('#viewtabs [data-view="info"]'), 'the Info tab')
      await TRK_OPENERS.lullPick!()
      await press($('#lullCal .day:not(.out)'), 'a first day of the period')
      expect(C.lullPick?.start, 'the premise: a day picked, not yet saved').toBeTruthy()
      await press($('#viewtabs [data-view="flow"]'), 'the Flow chart tab')
    },
    gone: () => { expect(C.lullPick ?? null, 'the pop-up closed').toBeNull() },
  },
  'the board\'s cancel-reason box, a reason typed': {
    open: async () => { await OPEN.cxdlg!.open(); await typeIn('#cxReason', 'KR reason') },
    gone: () => {
      expect(($('#cxPop') as HTMLElement | null)?.hidden ?? true, 'the box closed').toBe(true)
      expect(storedAnywhere('KR reason'), 'the reason stored nowhere').toEqual([])
    },
  },
}
describe('D1 — each family of open work, by the pick of 149: through, the work gone, nothing of it stored on either squadron, no note (D2825)', () => {
  for (const [name, f] of Object.entries(FAMILIES)) {
    it(`${name} — by ${f.phone ? 'the ☰ menu\'s list (a phone)' : 'the bar\'s list'}: 149 in view, nothing open, nothing of it stored, no note (D2825)`, async () => {
      await app(f.who ?? 'hunter')
      const ctx = await f.open()
      const t0 = toastCount()
      if (f.phone) await drawerPick('u149'); else await topPick('u149')
      expect(UNIT, 'through').toBe('u149')
      expect(whatIsOpen(), 'nothing open').toBeNull()
      noNote(t0)
      await f.gone(ctx)
      nothingHeld()
    })
  }
  it.todo('the Calendar with a SAVED holiday changed and kept waiting for a leave period (holidayChange answers noperiod): through, the saved holiday unchanged (D2825, D2837) — the set-up (a saved holiday whose leave period is then gone) is not reached by a press this file could confirm')
  /* (a pick of another squadron also leaves the day panel and the like as the door files pin; a window held since his move
     at midnight is D2836's — the K10 root's tests own the held window, and KR closes it at the pick: see D1's last test) */
})

/* ================= D2 — Not saved still refuses, nothing closed ================= */
describe('D2 — "Not saved" still refuses at every door, nothing closed, even with a window and its words open (D2594, D2627 A13, D2825)', () => {
  for (const [name, d] of Object.entries(DOORS)) {
    if (d.ending === null) continue
    it(`${name}: refused with the Retry note, the window still open, nothing changed; Retry lands, the press again: through (D2594, D2825)`, async () => {
      const ctx = await d.prep()
      await d.win(ctx)
      await OPEN.unsaved!.open()
      const unit = UNIT, admin = isAdmin(), page = CURPAGE, open = named()
      await d.press(ctx)
      expect(note(), 'the Retry note, its words from the table').toBe(`Blocked: ${GUARD_LEADS.retry}, then ${d.ending}`)
      expect({ unit: UNIT, admin: isAdmin(), page: CURPAGE }, 'nothing changed').toEqual({ unit, admin, page })
      expect(named(), 'the window still open').toBe(open)
      saver.status = 'idle'
      await doing(() => {})
      clearToast()
      await bellOpenIfLine(name)
      await d.press(ctx)
      d.through(ctx)
    })
  }
})
/** a line's door presses the line again from the open list (the list stays open at a refusal — D2627 A11) */
async function bellOpenIfLine(name: string) { if (/line|reminder|page door/.test(name)) await bellOpen() }

/* ================= D3 — what keeps, keeps, in its own squadron (D2838) ================= */
describe('D3 — a box with no Save button is saved into its OWN squadron first, then the switch goes through in the same press (D2838, D2825)', () => {
  it('Duty templates, "0730" typed in a Start box still focused, the pick of 149: through; 142\'s template holds 07:30, 149\'s untouched (D2838)', async () => {
    await app('hunter')
    await doing(() => { setPage('editsched'); setTplEdit(true) })
    const box = $('#tplModal .trow input.tm') as HTMLInputElement
    expect(box, 'the premise: a Start box').not.toBeNull()
    const was149 = JSON.stringify(unitSetting('u149', 'dutytpl', null))
    await act(async () => { box.focus(); fireEvent.focus(box); fireEvent.change(box, { target: { value: '0730' } }) })
    await settle()
    const t0 = toastCount()
    await topPick('u149')
    expect(UNIT, 'through').toBe('u149')
    expect(TPLEDIT, 'the window closed').toBe(false)
    noNote(t0)
    expect((unitSetting('u142', 'dutytpl', null) as any)?.[0]?.rows?.[0]?.str, '142\'s template: 07:30 — its blur ran on 142').toBe('07:30')
    expect(JSON.stringify(unitSetting('u149', 'dutytpl', null)), '149\'s untouched').toBe(was149)
  })

  /** a plan on 142's Monday by the plans menu's own "+ Alt Plan", then its manage window by "Manage plans" */
  async function planOnMonday() {
    await app('hunter')
    await doing(() => setPage('editsched'))
    await press($('#eWeek .day[data-day="0"] .dhtpl [data-planmenu]'), 'Monday\'s plans menu')
    await press($('.wavemenu [data-plandup]'), '+ Alt Plan')
    expect(dayDrafts(0).length, 'the premise: Monday has plans').toBeGreaterThan(0)
    await press($('#eWeek .day[data-day="0"] .dhtpl [data-planmenu]'), 'Monday\'s plans menu again')
    await press($('.wavemenu [data-planmanage]'), 'Manage plans')
    expect(DRAFTSEDIT, 'the premise: the manage window is up').not.toBeNull()
    return dayDrafts(0).map((x: any) => x.name)
  }
  it('a plan\'s name half typed ("Wet weather") in the Plans window, the pick of 149: through; back on 142 the plan is renamed, 149 holds no plan of that name (D2838)', async () => {
    await planOnMonday()
    const box = $('#draftsModal .tpl-name') as HTMLInputElement
    await act(async () => { box.focus(); fireEvent.change(box, { target: { value: 'Wet weather' } }) })
    await settle()
    const t0 = toastCount()
    await topPick('u149')
    expect(UNIT, 'through').toBe('u149')
    expect(DRAFTSEDIT, 'the window closed').toBeNull()
    noNote(t0)
    expect(dayDrafts(0).map((x: any) => x.name), '149: no plan of that name').not.toContain('Wet weather')
    await topPick('u142')
    expect(dayDrafts(0).map((x: any) => x.name), '142: renamed').toContain('Wet weather')
  })
  it('a plan\'s name emptied (a name the box refuses) and left focused, the pick of 149: through, dropped silently — no "A plan needs a name", 142\'s names as they were (D2838; the plan §3\'s closingForDoor)', async () => {
    const names = await planOnMonday()
    const box = $('#draftsModal .tpl-name') as HTMLInputElement
    await act(async () => { box.focus(); fireEvent.change(box, { target: { value: '' } }) })
    await settle()
    const t0 = toastCount()
    await topPick('u149')
    expect(UNIT, 'through').toBe('u149')
    expect(toastsSince(t0).filter(t => /plan needs a name|already has that name/.test(t)), 'no warning').toEqual([])
    noNote(t0)
    await topPick('u142')
    expect(dayDrafts(0).map((x: any) => x.name), '142\'s names as they were').toEqual(names)
  })
  it('the Inputs calendar\'s day, a new note\'s words handed to the people picker, the pick of 149: through; on 142 the note is written with no people, 149 holds none (D2838; as its own ✕ keeps it)', async () => {
    await app('hunter')
    await OPEN.inputsday!.open()
    await press($('#icAddPuck'), '+ Note')
    const box = $('.ic-newnote .ic-poppuck-edit') as HTMLInputElement
    expect(box, 'the premise: the note box').not.toBeNull()
    await act(async () => { fireEvent.change(box, { target: { value: 'KR note' } }) })
    await press($('#icNewNotePpl'), '+ people')
    expect($('.ic-pick'), 'the premise: the people picker is up, holding the words').not.toBeNull()
    expect(PLANPUCKS.some((p: any) => p.text === 'KR note'), 'the premise: nothing written yet').toBe(false)
    const t0 = toastCount()
    await topPick('u149')
    expect(UNIT, 'through').toBe('u149')
    expect([$('.ic-pick'), $('[data-testid="win-inputsday"]')], 'the picker and the day closed').toEqual([null, null])
    noNote(t0)
    expect(PLANPUCKS.some((p: any) => p.text === 'KR note'), '149 holds no such note').toBe(false)
    await topPick('u142')
    const kept = PLANPUCKS.filter((p: any) => p.text === 'KR note')
    expect(kept.length, 'on 142, once').toBe(1)
    expect(kept[0].ids ?? [], 'with no people').toEqual([])
  })

  /* THE LEAVE WAR'S WORDS (D1339's "keep the words"), for a Plan holder whose war follows the pick (Hunter, Plan of 149) */
  const D = '2026-07-22'
  async function heldBid(): Promise<string> {
    await app('hunter')
    await goLeaveWar()
    const who = rosterMan()
    await doing(() => { expect(setCell(who, D, 'LL', { remarks: 'Bali' } as any), 'the premise: a pending bid placed').toBe(true) })
    return who
  }
  const reqWords = (who: string, date: string) => recordsAt(who, date).filter((r: any) => r.kind === 'request').map((r: any) => r.remarks ?? '')
  it('a held bid\'s Remarks typed in its window and not left, the pick of 149: through; on 142\'s war the bid holds the words, 149\'s war none (D2838)', async () => {
    const who = await heldBid()
    await press(tid(`cell-${who}-${D}`), 'the bid\'s day on the grid')
    const box = tid('bid-remarks') as HTMLInputElement
    expect(box, 'the premise: the bid window with its Remarks').not.toBeNull()
    await act(async () => { box.focus(); fireEvent.change(box, { target: { value: 'KR bid words' } }) })
    await settle()
    const t0 = toastCount()
    await topPick('u149')
    expect([UNIT, worldUnit()], 'through, the war 149\'s').toEqual(['u149', 'u149'])
    expect(tid('bid-picker'), 'the window closed').toBeNull()
    noNote(t0)
    expect(storedAnywhere('KR bid words').filter(w => w.includes('u149')), 'nothing of it in 149\'s war').toEqual([])
    await topPick('u142')
    expect(reqWords(who, D), '142\'s bid holds the words').toContain('KR bid words')
  })
  it('the day\'s list (a morning and an afternoon bid), one bid\'s Remarks typed and not left, the pick of 149: through; on 142\'s war that bid holds the words, 149\'s none (D2838)', async () => {
    await app('hunter')
    await goLeaveWar()
    const who = rosterMan()
    await doing(() => {
      expect(setCell(who, D, '*LL'), 'the premise: a morning bid').toBe(true)
      expect(setCell(who, D, 'LL*'), 'the premise: an afternoon bid').toBe(true)
    })
    const am = recordsAt(who, D).find((r: any) => r.kind === 'request') as any
    expect(am, 'the premise: a bid').toBeTruthy()
    await press(tid(`cell-${who}-${D}`), 'the day on the grid')
    const box = tid(`dl-${am.id}-remarks`) as HTMLInputElement
    expect(box, 'the premise: the day\'s list, the bid\'s Remarks').not.toBeNull()
    await act(async () => { box.focus(); fireEvent.change(box, { target: { value: 'KR list words' } }) })
    await settle()
    const t0 = toastCount()
    await topPick('u149')
    expect(UNIT, 'through').toBe('u149')
    expect(tid('daylist'), 'the list closed').toBeNull()
    noNote(t0)
    expect(storedAnywhere('KR list words').filter(w => w.includes('u149')), 'nothing of it in 149\'s war').toEqual([])
    await topPick('u142')
    expect(reqWords(who, D), '142\'s bid holds the words').toContain('KR list words')
  })
  it('an approved leave\'s Remarks box (a leave filed on the Inputs page) typed and not left, the pick of 149: through; the leave on 142 holds the words (D2838)', async () => {
    const who = rosterMan()
    const x: any = { remarks: '', mod: '2026-07-01', yr: 2026, allday: true, s: 0, e: 1439, person: who, type: 'LL', date: 'Jul 23' }
    inpId(x); writeInputs(() => { INPUTS.unshift(x) })
    await app('hunter')
    await goLeaveWar()
    await press(tid(`cell-${who}-2026-07-23`), 'the leave\'s day on the grid')
    const box = tid('bid-remarks') as HTMLInputElement
    expect(box, 'the premise: the leave\'s own Remarks box').not.toBeNull()
    await act(async () => { box.focus(); fireEvent.change(box, { target: { value: 'KR leave words' } }) })
    await settle()
    const t0 = toastCount()
    await topPick('u149')
    expect(UNIT, 'through').toBe('u149')
    expect(tid('bid-picker'), 'the window closed').toBeNull()
    noNote(t0)
    expect(INPUTS.some((r: any) => r.person === who && r.remarks === 'KR leave words'), 'the leave holds the words').toBe(true)
    expect(homeOn(who, todayIso()), 'its man 142\'s — the leave 142\'s').toBe('u142')
  })
  it('(may pass today) Logic\'s Crew rest, "13h" just typed (still waiting its beat), a bell line of 149: through; 142 reads 13h, 149 12h (D2838, D2627 A4)', async () => {
    await app('hunter')
    await doing(() => setPage('logic'))
    await press($('#lgEdit'), 'Logic\'s ✎ Edit')
    const box = $('input[data-lgset="crewRest"]') as HTMLInputElement
    expect([box !== null, VCONF.crewRest], 'the premise: Crew rest\'s box, 12h').toEqual([true, 720])
    const n = inputLine(PID.hunter, 'u149', of('u149'))
    const { NOTICES } = await import('../state/notices')
    NOTICES.push(n)
    await doing(() => {})
    await bellOpen()
    const lineEl = tid(`bell-line-${n.id}`)!
    expect(lineEl, 'the premise: the line drawn').not.toBeNull()
    const t0 = toastCount()
    act(() => {
      box.focus(); box.value = ruleFmt('crewRest', 780); fireEvent.change(box)
      fireEvent.pointerDown(lineEl); fireEvent.mouseDown(lineEl); fireEvent.mouseUp(lineEl); fireEvent.click(lineEl)
    })
    await settle()
    expect(UNIT, 'through').toBe('u149')
    expect(!!LGEDIT, 'the mode ended').toBe(false)
    noNote(t0)
    expect(VCONF.crewRest, '149 reads 12h').toBe(720)
    /* (a beat later too: a value still waiting its beat must never land on the squadron now in view — K8c's hard case) */
    await act(async () => { await new Promise(r => setTimeout(r, 5)) })
    expect(VCONF.crewRest, '149 reads 12h a beat later — nothing typed for 142 landed on 149').toBe(720)
    expect(unitSetting('u149', 'rules', null)?.v?.crewRest ?? 720, '149\'s stored rules: 12h').toBe(720)
    expect(unitSetting('u142', 'rules', null)?.v?.crewRest, '142\'s stored rules: 13h').toBe(780)
    /* (the line opened its input's window on 149's Inputs: closed by its own Cancel before the pick back, so the read of
       142 is the same on the code as it stood) */
    await press($('#inpEditCancel'), 'the line\'s window\'s Cancel')
    await topPick('u142')
    expect(VCONF.crewRest, '142 reads 13h').toBe(780)
  })
})

/* ================= D4 — never held, never swapped under a sheet ================= */
/** watches, from now until `stop()`, whether a held band was ever put on the page, and whether the war's world was ever
 *  another squadron's while a sheet of the war was still on the page */
function watchSwaps(sheet: string) {
  const drawn: string[] = [], under: string[] = []
  const BANDS = '[data-testid="move-band"], [data-testid="inped-moveband"], [data-heldro]'
  const look = () => { if (worldUnit() !== 'u142' && document.querySelector(sheet)) under.push(`${worldUnit()} under ${sheet}`) }
  const mo = new MutationObserver(recs => {
    for (const r of recs) for (const nd of r.addedNodes) {
      const el = nd as Element
      if (el.nodeType === 1 && (el.matches(BANDS) || el.querySelector(BANDS))) drawn.push(el.outerHTML.slice(0, 120))
    }
    look()
  })
  mo.observe(document.body, { childList: true, subtree: true })
  const un = subscribe(look)
  return { stop: () => { mo.disconnect(); un(); return { drawn, under } } }
}
describe('D4 — a Plan holder\'s war is never held, never swapped under a sheet (D2825)', () => {
  it('Hunter (Plan of 149) with a person\'s window open on his Leave War, the pick of 149: through, no sheet mounted, nothing held, no held band at any moment, the war 149\'s (D2825)', async () => {
    await app('hunter')
    await goLeaveWar()
    await press(document.querySelector(`[data-testid^="person-"]:not([data-testid="person-window"])`), 'a name on the grid')
    expect(tid('person-window'), 'the premise: his window is up').not.toBeNull()
    const w = watchSwaps('.bidsheet')
    const t0 = toastCount()
    try { await topPick('u149'); await settle() } finally { var seen = w.stop() }
    expect(UNIT, 'through').toBe('u149')
    expect(document.querySelectorAll('.bidsheet').length, 'no sheet mounted').toBe(0)
    expect(holdNow(), 'nothing held').toBe('none')
    expect(seen.drawn, 'no held band drawn at any moment').toEqual([])
    expect(seen.under, 'the war never swapped under a sheet').toEqual([])
    expect(worldUnit(), 'the war 149\'s').toBe('u149')
    noNote(t0)
  })
  async function presets(): Promise<string> {
    await app('hunter')
    await goLeaveWar()
    await press(tid('settings-open'), 'the Leave War\'s gear')
    await press(tid('settings-events'), 'Events…')
    expect(tid('events-sheet'), 'the premise: the Events list').not.toBeNull()
    return lwState().eventDefs[0]!.name
  }
  it('the Events list open (its sheet), the pick of 149: through, the sheet closed, the war not swapped under it (D2825)', async () => {
    await presets()
    const w = watchSwaps('[data-testid="events-sheet"]')
    try { await topPick('u149'); await settle() } finally { var seen = w.stop() }
    expect(UNIT, 'through').toBe('u149')
    expect(tid('events-sheet'), 'the sheet closed').toBeNull()
    expect(holdNow()).toBe('none')
    expect(seen.under, 'the war never swapped under it').toEqual([])
  })
  it('its presets, a preset\'s name changed to another\'s (a name the box refuses) and left focused, the pick of 149: through, dropped silently — no warning, the sheet closed, never swapped under, 142\'s preset as it was (D2838; closingForDoor)', async () => {
    const was = await presets()
    await press(tid('events-presets'), 'Edit presets')
    const other = (tid('evtype-name-1') as HTMLInputElement).value
    const box = tid('evtype-name-0') as HTMLInputElement
    await act(async () => { box.focus(); fireEvent.change(box, { target: { value: other } }) })
    await settle()
    const w = watchSwaps('[data-testid="event-types-sheet"]')
    const t0 = toastCount()
    try { await topPick('u149'); await settle() } finally { var seen = w.stop() }
    expect(UNIT, 'through').toBe('u149')
    expect([tid('event-types-sheet'), tid('event-problem')], 'closed, no warning').toEqual([null, null])
    expect(seen.under, 'the war never swapped under it').toEqual([])
    noNote(t0)
    await topPick('u142')
    expect(lwState().eventDefs[0]!.name, '142\'s preset as it was').toBe(was)
  })
})

/* ================= D5 — a save the closing started ================= */
/** the template time box focused with "0730", and the saver the test answers watching its blur's save: the Duty
 *  templates' store key written from now on counts as a change made to the watched saver (a stand-in, named so: in the
 *  test world the app's writes go to a memory store the saver does not see) */
async function templateTypedAndWatched() {
  await app('hunter')
  await doing(() => { setPage('editsched'); setTplEdit(true) })
  const box = $('#tplModal .trow input.tm') as HTMLInputElement
  await act(async () => { box.focus(); fireEvent.focus(box); fireEvent.change(box, { target: { value: '0730' } }) })
  await settle()
  const s = answeringSaver()
  const { storeBackend } = await import('../engine/hooks')
  const impl: any = storeBackend.impl
  const set = impl.setItem
  impl.setItem = (k: string, v: string) => { set(k, v); if (k.includes('dutytpl')) s.change() }
  return s
}
describe('D5 — a save the closing started (D2838)', () => {
  it('the template box\'s save, started by the closing, fails: refused with the Retry note, 142 still in view, the window closed (D2838, D2594)', async () => {
    const s = await templateTypedAndWatched()
    await topPick('u149')
    expect(s.sent.length + (s.pm.status === 'unsaved' ? 1 : 0), 'the closing started a save').toBeGreaterThan(0)
    await s.answer(false)
    expect(UNIT, '142 still in view').toBe('u142')
    expect(note(), 'the Retry note').toBe(`Blocked: ${GUARD_LEADS.retry}, then ${GUARD_ENDINGS.pick('149')}`)
    expect(TPLEDIT, 'the window closed').toBe(false)
  })
  it('a press during that wait (a pointer-down elsewhere): the pick not made, nothing said; the window stays closed (D2838; the plan §5 step 7)', async () => {
    const s = await templateTypedAndWatched()
    await topPick('u149')
    await act(async () => { fireEvent.pointerDown(document.body) })
    await s.answer(true)
    expect(UNIT, 'the pick not made').toBe('u142')
    expect(note(), 'nothing said').toBe('')
    expect(TPLEDIT, 'the window closed').toBe(false)
  })
})

/* ================= D6 — the Tracker ================= */
/** unsaved chart moves, then "Add event" in Edit chart layout: its name asked (a prompt that is not the switch question) */
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
  expect(trackerAsking(), 'the premise: a prompt, not the switch question').toBe(false)
  return before
}
const askedWith = async (words: string) => {
  await vi.waitFor(() => expect(C.dlg?.msg, 'the Tracker\'s question').toContain(words), { timeout: 5000, interval: 10 })
  expect(trackerAsking(), 'the switch question is the one asked').toBe(true)
}
describe('D6 — the Tracker: a prompt is open work, gone; its own question still asked (D2825, D2627 A20)', () => {
  it('chart moves unsaved and an "Add event" prompt up, the pick of 149 by the keys: the prompt gone, its job ended, the question drawn; Stay → 142, the edits kept, nothing more closed (D2825, A20)', async () => {
    const before = await chartEditThenPrompt()
    await topPickByKeys('u149')
    await askedWith('Save them before switching to 149?')
    await press($('#dlgCancel'), 'Stay')
    expect({ unit: UNIT, dirty: C.sylDirty, dlg: C.dlg ?? null }, 'Stay: nothing more').toEqual({ unit: 'u142', dirty: true, dlg: null })
    expect(C.SYL.length, 'the prompt\'s job ended: no event added by it').toBe(before)
  })
  it('the same, the switch to the member view by the keys (the name badge): the prompt gone, the question drawn; Stay → the admin view still (D2825, A20)', async () => {
    const before = await chartEditThenPrompt()
    await keyPress($('#roleBadge'), 'the name badge')
    await askedWith('Save them before switching to the member view?')
    await press($('#dlgCancel'), 'Stay')
    expect({ admin: isAdmin(), dirty: C.sylDirty }).toEqual({ admin: true, dirty: true })
    expect(C.SYL.length).toBe(before)
  })
  it('an import of three charts stopped at the second\'s question by a pick: the first stays saved, the third is not imported, no further question (D2825; the plan §5 step 3b)', async () => {
    await app('hunter')
    await goTracker()
    const ids: string[] = C.orderedSylIds().slice(0, 3)
    expect(ids.length, 'the premise: three charts').toBe(3)
    const charts = await C.collectCharts(ids)
    /* the first and the third under ids not here (each comes straight in); the second one already here (it asks) */
    const rename = (from: string, to: string, name: string) => {
      charts.order = charts.order.map((x: string) => (x === from ? to : x))
      charts.syllabi[to] = charts.syllabi[from]; delete charts.syllabi[from]
      if (charts.layouts?.[from]) { charts.layouts[to] = charts.layouts[from]; delete charts.layouts[from] }
      if (charts.eventInfoBySyl?.[from]) { charts.eventInfoBySyl[to] = charts.eventInfoBySyl[from]; delete charts.eventInfoBySyl[from] }
      charts.sylcat = charts.sylcat.map((e: any) => (e.id === from ? { ...e, id: to, name } : e))
    }
    rename(ids[0]!, 'sckrfirsta', 'KR FIRST')
    rename(ids[2]!, 'sckrthirdc', 'KR THIRD')
    ;(window as any).__pickOpenForTests = async () => ({ name: 'kr.json', text: JSON.stringify(FMT.buildFile({ savedAt: '2026-07-15T00:00:00Z', charts })) })
    let job: Promise<unknown> | null = null
    try {
      await act(async () => { job = C.importClick() })
      await vi.waitFor(() => expect(C.dlg?.msg, 'the premise: the second chart\'s question').toMatch(/already exists/), { timeout: 5000, interval: 10 })
      expect(C.orderedSylIds(), 'the premise: the first came in').toContain('sckrfirsta')
      await topPick('u149')
      expect(UNIT, 'through').toBe('u149')
      await act(async () => { await Promise.race([job, new Promise(r => setTimeout(r, 300))]) })
      await settle()
      expect(C.dlg ?? null, 'no further question').toBeNull()
    } finally { delete (window as any).__pickOpenForTests }
    await topPick('u142')
    await act(async () => { await C.whenLoaded?.() })
    expect(C.orderedSylIds(), 'the first stays saved, on 142').toContain('sckrfirsta')
    expect(C.orderedSylIds(), 'the third not imported').not.toContain('sckrthirdc')
    expect(TRK_WB.keys('tracker' as any).some((k: string) => String(TRK_WB.get('tracker' as any, k)).includes('KR THIRD')), 'nothing of the third stored').toBe(false)
  })
  it('the Tracker\'s question standing (raised by a pick over Inputs), a second door by the keys (the name badge): the old one answered Stay, the new question drawn over the page (D2825; the plan §5 step 4)', async () => {
    await app('hunter')
    await openTrkAsk()
    expect(trackerAsking(), 'the premise: the pick\'s question stands').toBe(true)
    await keyPress($('#roleBadge'), 'the name badge')
    await askedWith('Save them before switching to the member view?')
    expect(UNIT, 'the pick never made').toBe('u142')
  })
})

/* ================= D7 — the skip: the OIL list's card ================= */
describe('D7 — the OIL list\'s card bringing 142: the list it is pressed in stays, re-keyed to 142; a second window beside it closes (D2825)', () => {
  it('(a belt: the list left over 150 by the raw entry) the OIL question waiting beside it: the card goes through — 142, the list open for 142, the question closed, the card\'s input open (D2825)', async () => {
    await app('hunter')
    const x: any = { remarks: '', mod: '2026-07-01', yr: 2026, allday: true, s: 0, e: 1439, person: PID.hunter, type: 'Duty', date: 'Jul 18' }
    inpId(x); writeInputs(() => { INPUTS.unshift(x) })
    await doing(() => setOilList({ from: '2026-07-18', to: '2026-07-18', name: 'Holiday', unit: 'u142' }))
    expect(tid(`odl-row-${x.iid}`), 'the premise: the card is drawn').not.toBeNull()
    await doing(() => { rawEnter(third.u150) })
    await OPEN.oilwait!.open()
    expect([UNIT, !!OILLIST, named()], 'the premise: the list over 150, the OIL question beside it').toEqual([third.u150, true, 'oilwait'])
    const t0 = toastCount()
    await press(tid(`odl-row-${x.iid}`)?.querySelector('.icard-who') ?? tid(`odl-row-${x.iid}`), 'the card')
    expect([UNIT, CURPAGE, INPEDIT?.iid], 'through: 142, its page, the card\'s input').toEqual(['u142', 'inputs', x.iid])
    expect(OILLIST, 'the list stays, for 142').toMatchObject({ unit: 'u142' })
    expect(OILWAIT, 'the question beside it closed').toBeNull()
    noNote(t0)
  })
})

/* ================= D8 — row 13 and a Redo ================= */
/* THE PLAN'S D8 NAMES LOGIC'S VALUE TYPED AT ROW 13'S LANDING — A STATE NO PRESS REACHES (read 28 Nov 26): row 13 is an
   Undo whose landing brings his OWN squadron back, so his own pages must stand on another squadron than the one in view —
   a View holder's (D2197). A View holder is shown View-only Sched and Help alone there (B17), so he can type nothing on
   Logic; and whoever may type on the Logic of the squadron in view — its admin, a Plan holder, a master admin — has his own
   pages follow the pick (D2197), so no landing of his brings his own squadron back. (Tried with Saber, the master admin:
   his 142 leave was undone with 149 still in view — the landing is not row 13's, and that road is Build 3's, the K10
   root's "Undo or Redo across squadrons".) So row 13's half here is the Redo's: the closing at the landing writes nothing
   that would take the Redo away; Logic's value at a landing is K8c's, at row 21's road (ui/msq-guard-doors-undo.test.tsx,
   its hard case, which also presses the Redo). */
describe('D8 — row 13\'s landing and its Redo (D2825)', () => {
  it('(a belt: the engine the Undo button calls) Ranger\'s own leave undone from 149 with an Input window of his open and words typed: through — the leave undone, 142 back on his Inputs, the window closed and its words dropped, and the Redo of that Undo still offered (the closing adds no step)', async () => {
    const { leave, other } = await rangerFiledThen149(true)
    await windowWithWords(other)
    const t0 = toastCount()
    await doing(() => { globalUndoEngine().undo() })
    expect(INPUTS.includes(leave), 'his leave undone').toBe(false)
    expect([UNIT, CURPAGE], '142 back on his Inputs').toEqual(['u142', 'inputs'])
    expect(INPEDIT, 'the window closed').toBeNull()
    noNote(t0)
    wordsGone()
    expect(undoState().canRedo, 'the Redo of that Undo still offered').toBe(true)
    await doing(() => { globalUndoEngine().redo() })
    expect(INPUTS.some((r: any) => r.iid === leave.iid), 'the Redo puts his leave back').toBe(true)
  })
  it.todo('row 13\'s landing with Logic\'s value typed (the plan §8.1 D8): the value on its squadron — no press reaches it (see above); the builder decides whether a belt is wanted')
})

void pageUnit; void ownNow; void homeOn; void drawerRole
