// @vitest-environment jsdom
/* WHAT MUST STAY AS TODAY — PINNED BEFORE THE CHANGED HALF (the guard rail's plan,
   docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §7, P1–P19). Written at step 0 (K0) and seen GREEN ON TODAY'S
   CODE; never edited by the build, with the two exceptions §7 names, each replaced by name in the step that builds it:
   P12's Logic and Quals half (replaced by G1, G2 — D2627 A4) and the pin of a question put off (B24).
   The pins §7 gives to EXISTING files are not repeated here; each stays green unchanged:
     P3  — tracker/msq-trk-pick-ask.test.tsx, tracker/msq-trk-ask-keys.test.tsx
     P5  — ui/msq-fix-sched-windows-midnight.test.tsx, state/typing-hold.test.tsx, state/typing-hold-grid.test.tsx,
           state/reshape-r6-reenter.test.tsx, leavewar/ui/msq-fix2-r2-held-figure.test.tsx,
           state/msq-fix2-tracker-moved-master.test.tsx
     P9  — ui/msq-bell-tap.test.ts       P11 — ui/memberview.test.tsx      P13 — ui/msq-board-sqn.test.tsx (and below)
     P15 — ui/msq-pick-windows.test.tsx's controls                         P17 — tracker/tracker.test.tsx, the Tracker smoke
   The world: three squadrons (test-support/msq-world.ts withThird — his D2630): Hunter 142's admin with Plan of 149 and
   View of 150; Ranger 142's member with View of 149 and of 150; Kestrel 149's admin; Osprey 149's member; Mako 150's
   own admin; Saber the master admin, home 142. Wed 15 Jul 26, 09:00. The app is drawn whole (ui/App.tsx) and pressed
   where a pin is about a press. */
import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { render, act, fireEvent, cleanup } from '@testing-library/react'
import { withThird, third, signInAs, PID, ACCT, moveMan, pastMidnight } from '../test-support/msq-world'
import { App } from './App'
import { HOOKS } from '../engine/hooks'
import { UNIT } from '../engine/unitview'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { notify } from '../state/store'
import { SESSION } from '../state/auth'
import { isAdmin, pageUnit } from '../state/perms'
import { saveAccess } from '../state/accounts'
import { homeOn, todayIso } from '../state/units'
import { pickSquadron } from '../state/pick'
import { CURPAGE, setPage, setInpView, AVAILWIN, setAvailWin, CHGWIN, ARM, armSlot, RESTARM, setRestArm, setBoardDay, SBDAY } from '../state/view'
import { DRAWER, setDrawer, BELLLIST, INPEDIT, setInpEdit, DAYPOP, setDayPop, WEEKCAL, setWeekCal, INSIGHTS, setInsights, OILLIST, setOilList } from './pops'
import { openChanges } from './changesopen'
import { openNotice } from './topstate'
import { setStorageKept } from './savestatus-source'
import { logOut, setReloadSeam } from './logout'
import { commitNewInput } from './inputedit'
import { NOTICES, type Notice } from '../state/notices'
import { isUnread } from '../state/noticeseen'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()
let page: ReturnType<typeof render> | null = null
afterEach(() => {
  if (page) { page.unmount(); page = null }
  cleanup()
  setInpEdit(null); setDrawer(false); setDayPop(null); setWeekCal(false); setAvailWin(null); setInsights(false); setOilList(null)
  setStorageKept(true)
})

const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const settle = async () => { await act(async () => { await Promise.resolve(); await Promise.resolve() }) }
/* a press as a finger or a mouse makes it: the pointer goes down (what an outside-press listener hears), then the click */
async function press(el: Element | null, what = 'the control') {
  expect(el, `${what} is drawn`).not.toBeNull()
  await act(async () => { fireEvent.pointerDown(el!); fireEvent.mouseDown(el!); fireEvent.mouseUp(el!); fireEvent.click(el!) })
  await settle()
}
async function app(who: 'hunter' | 'saber' | 'ranger' = 'hunter') {
  signInAs(who)
  page = render(<App />)
  await settle()
}
const toasts = (): string[] => (HOOKS.toast as any).mock.calls.map((c: any[]) => String(c[0]))
/* the top bar's list: its button, then the squadron's row */
async function topPick(u: string) {
  await press($('#sqnMenuBtn'), 'the top bar\'s squadron button')
  await press($(`#sqnMenu .sqm-row[data-unit="${u}"]`), `the row of ${u}`)
}
/* the ☰ menu's list */
async function drawerPick(u: string) {
  if (!DRAWER) await act(async () => { setDrawer(true); notify() })
  await press($('#drawerSqnBtn'), 'the ☰ menu\'s squadron button')
  await press($(`#drawerSqnList .sqm-row[data-unit="${u}"]`), `the ☰ menu's row of ${u}`)
}
/* a line of his bell, made here — the tap is what is pinned, not how the line was written (ui/msq-bell-tap.test.ts's way) */
function line(to: string, u: string, part: any, extra: Partial<Notice> = {}): Notice {
  return { id: 'tl' + Math.random().toString(36).slice(2), to, by: null, at: Date.now(), iid: '', name: '', day: '2026-07-15',
    what: [part], u, ...extra } as Notice
}
/* a filing through the Inputs page's own door, its new row found by its id */
function file(draft: Record<string, unknown>): any {
  const before = new Set(INPUTS.map((r: any) => r.iid))
  expect(commitNewInput({ allday: true, half: '', sTime: '', eTime: '', remarks: '', sans: null, docIds: [], ...draft }), `filed: ${JSON.stringify(draft)}`).toBe(true)
  return INPUTS.find((r: any) => !before.has(r.iid))
}
const of = (unit: string) => INPUTS.find((r: any) => r.person && (PEOPLE as any)[r.person] && homeOn(String(r.person), todayIso()) === unit) as any
/* the Input window open on the Inputs page, words typed in its Remarks */
async function inputOpenTyped(row: any, words = 'typed, not saved') {
  await act(async () => { setPage('inputs'); setInpView('table'); setInpEdit(row); notify() })
  await settle()
  expect($('#inpEditRmk'), 'the window is drawn').not.toBeNull()
  await act(async () => { fireEvent.change($('#inpEditRmk')!, { target: { value: words } }) })
}

describe('P1 (pin) — a pick with nothing open goes through at once, nothing asked, nothing said', () => {
  it('pin: the top bar\'s list — Hunter picks 149: in view at once, no note, the list closed', async () => {
    await app()
    await topPick('u149')
    expect(UNIT).toBe('u149')
    expect(toasts(), 'nothing said').toEqual([])
    expect($('#sqnMenu'), 'the list closed').toBeNull()
  })
  it('pin: the ☰ menu\'s list — Hunter picks 150, which he only views: in view at once, nothing said, the list closed and the menu STAYS open', async () => {
    await app()
    await drawerPick(third.u150)
    expect(UNIT).toBe(third.u150)
    expect(toasts()).toEqual([])
    expect($('#drawerSqnList'), 'the list closed').toBeNull()
    expect(DRAWER, 'the ☰ menu stays open').toBe(true)
  })
})

describe('P2 (pin) — the squadron already in view picked: nothing happens, no note; the list closes', () => {
  it('pin: the top bar\'s list', async () => {
    await app()
    const page0 = CURPAGE
    await topPick('u142')
    expect(UNIT).toBe('u142')
    expect(CURPAGE).toBe(page0)
    expect(toasts()).toEqual([])
    expect($('#sqnMenu')).toBeNull()
  })
  it('pin: the ☰ menu\'s list', async () => {
    await app()
    await drawerPick('u142')
    expect(UNIT).toBe('u142')
    expect(toasts()).toEqual([])
    expect($('#drawerSqnList')).toBeNull()
    expect(DRAWER).toBe(true)
  })
})

describe('P4 (pin) — menus and lists close as today and refuse nothing', () => {
  it('pin: the bell\'s list open — a pick goes through and the list is gone', async () => {
    await app()
    await press($('#notifyBell'), 'the bell')
    expect(BELLLIST, 'the premise: his bell\'s list is open (two lines of his rights, nothing else waiting)').toBe(true)
    await topPick('u149')
    expect(UNIT).toBe('u149')
    expect(BELLLIST, 'the bell\'s list is gone').toBe(false)
  })
  it.todo('P4: the Schedule Insights menu, a board\'s small menu, a date box\'s calendar, the Medical page\'s "as of" calendar and the Leave War\'s Legend, each open at a pick — not written at K0 (each is a component\'s own state; mounting each was left for the step that adds their rows)')
})

describe('P6 (pin) — "Not kept" blocks nothing', () => {
  it('pin: with the "Not kept" band up, the three doors go through — the pick, the view switch, a bell line of another squadron', async () => {
    setStorageKept(false)
    await app()
    expect($('.savestat.nokeep'), 'the premise: the band is up').not.toBeNull()
    await topPick('u149')
    expect(UNIT, 'the pick').toBe('u149')
    await topPick('u142')
    await press($('#roleBadge'), 'his name badge')
    expect(isAdmin(), 'the view switch: the member view').toBe(false)
    await press($('#roleBadge'), 'his name badge')
    expect(isAdmin(), 'and back').toBe(true)
    const inp = of('u149')
    expect(inp, 'the premise: an input of 149').toBeTruthy()
    await act(async () => { openNotice(line(PID.hunter, 'u149', { k: 'cx' }, { iid: String(inp.iid), name: 'x' })) })
    await settle()
    expect(UNIT, 'the bell line entered 149').toBe('u149')
    expect(INPEDIT?.iid, 'and opened its input').toBe(inp.iid)
  })
})

describe('P7 (pin) — sign-out is never refused', () => {
  let reloads = 0
  let undo: (() => void) | null = null
  beforeEach(() => { reloads = 0; const prev = setReloadSeam(() => { reloads++ }); undo = () => setReloadSeam(prev) })
  afterEach(() => { undo?.() })
  it('pin: with an Input window open — the session ends', async () => {
    await app()
    await act(async () => { setPage('inputs'); setInpEdit(of('u142')); notify() })
    await settle()
    let ok: boolean | null = null
    await act(async () => { ok = await logOut() })
    expect(ok).toBe(true)
    expect(SESSION, 'signed out').toBeNull()
    expect(reloads, 'the page reloads, as at every sign-out').toBe(1)
  })
  it('pin: with words typed in it and not saved — the session ends', async () => {
    await app()
    await inputOpenTyped(of('u142'))
    let ok: boolean | null = null
    await act(async () => { ok = await logOut() })
    expect(ok).toBe(true)
    expect(SESSION).toBeNull()
  })
})

describe('P8 (pin) — a bell line of the squadron his pages are on, an Input window open with typing: the window\'s own question', () => {
  it('pin: "This input has unsaved changes. Open Hunter’s input and lose them?" — the squadron unmoved, the window keeping his words', async () => {
    await app()
    const mine = file({ person: PID.hunter, type: 'LL', start: '2026-07-28', end: '2026-07-28' })
    const other = of('u142')
    expect(other && other.iid !== mine.iid).toBe(true)
    await inputOpenTyped(other)
    await act(async () => { openNotice(line(PID.hunter, 'u142', { k: 'cx' }, { iid: String(mine.iid), name: 'LL' })) })
    await settle()
    expect(UNIT).toBe('u142')
    const q = $('[data-testid="inped-swap"]')
    expect(q, 'the question is up').not.toBeNull()
    expect(q!.textContent).toContain('This input has unsaved changes. Open Hunter’s input and lose them?')
    expect(INPEDIT?.iid, 'the window keeps the first input').toBe(other.iid)
    expect(($('#inpEditRmk') as HTMLInputElement).value).toBe('typed, not saved')
  })
})

describe('P10 (pin) — the windows over the page close at a press on the bar, and the press does its own work in the same press', () => {
  const openers: Array<[string, () => void, () => boolean]> = [
    ['Day details', () => setDayPop(0), () => DAYPOP != null],
    ['Jump to a date', () => setWeekCal('view'), () => !!WEEKCAL],
  ]
  for (const [name, open, isOpen] of openers) {
    it(`pin: ${name} open — the squadron button closes it and opens the list; the pick then goes through`, async () => {
      await app()
      await act(async () => { open(); notify() })
      await settle()
      expect(isOpen(), `the premise: ${name} is open`).toBe(true)
      await press($('#sqnMenuBtn'))
      expect(isOpen(), `${name} closed`).toBe(false)
      expect($('#sqnMenu'), 'the list opened in the same press').not.toBeNull()
      await press($('#sqnMenu .sqm-row[data-unit="u149"]'))
      expect(UNIT).toBe('u149')
    })
    it(`pin: ${name} open — the name badge closes it and switches him to the member view`, async () => {
      await app()
      await act(async () => { open(); notify() })
      await settle()
      await press($('#roleBadge'))
      expect(isOpen()).toBe(false)
      expect(isAdmin(), 'switched in the same press').toBe(false)
    })
    it(`pin: ${name} open — the bell closes it and opens the bell's list`, async () => {
      await app()
      await act(async () => { open(); notify() })
      await settle()
      await press($('#notifyBell'))
      expect(isOpen()).toBe(false)
      expect(BELLLIST, 'the list opened in the same press').toBe(true)
    })
  }
  it.todo('P10: the Traffic window and the document viewer, each open at a press of the pick, the badge and the bell — not written at K0 (each needs a traffic line or a stored document to open on; the two above share their machinery, ui/barfree.ts useBarFree)')
})

describe('P12 (pin) — modes are not windows, as each behaves today', () => {
  it('pin: an armed slot — the pick goes through and the arming is dropped', async () => {
    await app()
    await act(async () => { setPage('editsched'); notify() })
    await settle()
    await act(async () => { armSlot('0.0.0.0.p'); notify() })
    expect(ARM, 'the premise: a seat armed').not.toBeNull()
    await topPick('u149')
    expect(UNIT).toBe('u149')
    expect(ARM, 'the arming dropped').toBeNull()
  })
  it('pin (replaced by G1 when built — D2627 A4): Logic\'s edit mode — the pick goes through and the mode is still on, on 149\'s page', async () => {
    await app()
    await act(async () => { setPage('logic'); notify() })
    await settle()
    await press($('#lgEdit'), 'Logic\'s ✎ Edit')
    expect(($('#lgDone') as HTMLButtonElement).hidden, 'the premise: editing').toBe(false)
    await topPick('u149')
    expect(UNIT).toBe('u149')
    expect(CURPAGE, 'still on Logic').toBe('logic')
    expect(($('#lgDone') as HTMLButtonElement).hidden, 'the mode is still on').toBe(false)
  })
  it('pin (replaced by G1 when built — D2627 A4): Edit quals — the pick goes through and the mode is still on, on 149\'s page', async () => {
    await app()
    await act(async () => { setPage('quals'); notify() })
    await settle()
    await press($('#qEdit'), 'Quals\' ✎ Edit')
    expect(($('#qSave') as HTMLButtonElement).hidden, 'the premise: editing ("Done")').toBe(false)
    await topPick('u149')
    expect(UNIT).toBe('u149')
    expect(pageUnit('own'), 'Quals follows a Plan holder\'s pick').toBe('u149')
    expect(CURPAGE).toBe('quals')
    expect(($('#qSave') as HTMLButtonElement).hidden, 'the mode is still on').toBe(false)
  })
  it('pin: an armed "Discard N edits & load" (set by its own setter — the demo has no issued day to press it on): a pick changes no page, and today the pick drops it', async () => {
    await app()
    await act(async () => { setPage('editsched'); setRestArm(0, 'v1'); notify() })
    expect(RESTARM, 'the premise: armed').not.toBeNull()
    await topPick('u149')
    expect(UNIT).toBe('u149')
    expect(CURPAGE, 'no page change').toBe('editsched')
    expect(RESTARM, 'what the pick does to it today, recorded: dropped, though no page changed').toBeNull()
  })
  it.todo('P12: OIL Earn on the board, "no door reachable", and the Logic and Quals half\'s "the change already typed saved in 142\'s record" — not written at K0')
})

describe('P13 (pin, beside ui/msq-board-sqn.test.tsx) — the Scheduler Board alone: a bell line to another squadron goes through and the board closes', () => {
  it('pin: Hunter on 142\'s board taps a line of a 149 input: 149 in view, the board closed, the input open', async () => {
    await app()
    await act(async () => { setPage('editsched'); setBoardDay(0); notify() })
    await settle()
    expect(SBDAY, 'the premise: the board is open').toBe(0)
    const inp = of('u149')
    await act(async () => { openNotice(line(PID.hunter, 'u149', { k: 'cx' }, { iid: String(inp.iid), name: 'x' })) })
    await settle()
    expect(UNIT).toBe('u149')
    expect(SBDAY, 'the board closed').toBeNull()
    expect(CURPAGE).toBe('inputs')
    expect(INPEDIT?.iid).toBe(inp.iid)
  })
})

describe('P14 (pin) — a save made just before a pick lands in its own squadron\'s record', () => {
  it('pin: Hunter files his own LL on 142, then picks 149: the record stays 142\'s, listed on 142 and not as a 149 input', async () => {
    await app()
    const lv = file({ person: PID.hunter, type: 'LL', start: '2026-07-29', end: '2026-07-29' })
    await topPick('u149')
    expect(UNIT).toBe('u149')
    const row = INPUTS.find((r: any) => r.iid === lv.iid) as any
    expect(row, 'still stored').toBeTruthy()
    expect(row.u ?? null, 'no squadron stamp: an input naming someone follows its people').toBeNull()
    expect(row.people.map((p: any) => p.p), 'its man').toEqual([PID.hunter])
    expect(homeOn(PID.hunter, '2026-07-29'), 'so it is 142\'s, its man\'s squadron on its day').toBe('u142')
  })
})

describe('P16 (pin) — a bell line that changes neither the squadron nor the page is never refused, a window open or a change not saved', () => {
  async function typedOn142() { await app(); await inputOpenTyped(of('u142')) }
  it('pin: an input since deleted — read, "That input is gone"', async () => {
    await typedOn142()
    const n = line(PID.hunter, 'u142', { k: 'cx' }, { iid: 'gone-iid', name: 'x' })
    NOTICES.push(n)
    expect(isUnread(n, PID.hunter), 'the premise: unread').toBe(true)
    await act(async () => { openNotice(n) })
    expect(toasts()).toContain('That input is gone')
    expect(isUnread(n, PID.hunter), 'read').toBe(false)
    expect(UNIT).toBe('u142')
    expect(CURPAGE).toBe('inputs')
  })
  it('pin: a posting of a man with no row left — read, nothing opens', async () => {
    await typedOn142()
    const n = line(PID.hunter, 'u142', { k: 'po', who: 'nobody-left', o: 'del' })
    NOTICES.push(n)
    await act(async () => { openNotice(n) })
    expect(isUnread(n, PID.hunter)).toBe(false)
    expect(CURPAGE).toBe('inputs')
    expect(UNIT).toBe('u142')
  })
  it('pin: his own account\'s line (Plan of 149 given, from the set-up) — read, nothing opens', async () => {
    await typedOn142()
    const n = NOTICES.find(x => x.to === PID.hunter && (x.what?.[0] as any)?.k === 'acct' && (x.what[0] as any).u === 'u149')!
    expect(n, 'the premise: the line of his Plan of 149').toBeTruthy()
    expect(isUnread(n, PID.hunter)).toBe(true)
    await act(async () => { openNotice(n) })
    expect(isUnread(n, PID.hunter)).toBe(false)
    expect(UNIT).toBe('u142')
    expect(CURPAGE).toBe('inputs')
  })
  it('pin: a holiday\'s line pressed on his own squadron — the OIL list opens', async () => {
    await typedOn142()
    const n = line(PID.hunter, 'u142', { k: 'oilhol', a: '2026-07-18', b: '2026-07-18' }, { name: 'Holiday' })
    await act(async () => { openNotice(n) })
    expect(OILLIST, 'the OIL list for its dates').toMatchObject({ from: '2026-07-18', to: '2026-07-18' })
    expect(UNIT).toBe('u142')
  })
})

describe('P18 (pin) — the windows that only show things, at a change he did not make: whatever each does today', () => {
  const avail = () => setAvailWin({ di: 0, item: 'x', ver: '', name: 'x', when: '', tab: 'who' } as any)
  it('pin: ALL AVAIL, Changes and Insights open across his own move at midnight — recorded', async () => {
    signInAs('saber')
    expect(moveMan(PID.hunter, third.u150).ok).toBe(true)
    await app()
    await act(async () => { setPage('editsched'); avail(); openChanges('week', 'all'); setInsights(true); notify() })
    await settle()
    expect([!!AVAILWIN, !!CHGWIN, INSIGHTS], 'the premise: all three open').toEqual([true, true, true])
    await act(async () => { pastMidnight() })
    await settle()
    expect(homeOn(PID.hunter, todayIso())).toBe(third.u150)
    expect({ avail: !!AVAILWIN, chg: !!CHGWIN, insights: INSIGHTS }, 'what each does today').toEqual(RECORDED.move)
  })
  it('pin: ALL AVAIL, Changes and Insights open on 149 when his Plan of 149 is ended — recorded', async () => {
    await app()
    await topPick('u149')
    await act(async () => { setPage('editsched'); avail(); openChanges('week', 'all'); setInsights(true); notify() })
    await settle()
    expect([!!AVAILWIN, !!CHGWIN, INSIGHTS]).toEqual([true, true, true])
    const mine = SESSION
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'none' } })).toBeNull()
    signInAs('hunter')
    void mine
    await act(async () => { notify() })
    await settle()
    expect({ avail: !!AVAILWIN, chg: !!CHGWIN, insights: INSIGHTS, unit: UNIT }, 'what each does today').toEqual(RECORDED.right)
  })
  it.todo('P18: a SANS day, the Leave War\'s day panel and a Tracker event\'s details at the same two changes — not written at K0')
})

describe('P19 (pin) — ALL AVAIL and Changes close at a pick and at the view switch, in the one press, nothing said', () => {
  const avail = () => setAvailWin({ di: 0, item: 'x', ver: '', name: 'x', when: '', tab: 'who' } as any)
  it('pin: at a pick', async () => {
    await app()
    await act(async () => { setPage('editsched'); avail(); openChanges('week', 'all'); notify() })
    await settle()
    expect([!!AVAILWIN, !!CHGWIN]).toEqual([true, true])
    await topPick('u149')
    expect(UNIT).toBe('u149')
    expect([!!AVAILWIN, !!CHGWIN], 'both closed').toEqual([false, false])
    expect(toasts()).toEqual([])
  })
  it('pin: at the view switch', async () => {
    await app()
    await act(async () => { setPage('editsched'); avail(); openChanges('week', 'all'); notify() })
    await settle()
    await press($('#roleBadge'))
    expect(isAdmin()).toBe(false)
    expect([!!AVAILWIN, !!CHGWIN], 'both closed').toEqual([false, false])
    expect(toasts()).toEqual([])
  })
})

/* P18's record of today, filled from the first run on today's code (never a guess) */
const RECORDED = {
  move: { avail: false, chg: false, insights: true },
  right: { avail: false, chg: false, insights: false, unit: 'u142' },
}
