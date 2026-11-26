// @vitest-environment jsdom
/* THE BELL AND THE PAGE DOOR — the guard rail's step K6 (the plan, docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md
   §4.1 rows 6–13, 15 and 22, §4.2, §4.5, §5.3, §4.7's bell and page-door rows; §21.1's blocks win over any older line; the
   brief docs/superpowers/briefs/2026-11-27-msq-s1-k6-brief.md). Beside ui/msq-guard-doors.test.tsx (the pick's, K4) and
   ui/msq-guard-doors-switch.test.tsx (the view switch's, K5), in their shape, their world and their kit.

   His rulings: D2403 (a bell line that would take him to another squadron follows the pick's rule), D2590 (the grey
   "Blocked:" note; "…then press this line again."), D2596, D2597 (a window that only shows things closes by itself), D2621
   (a squadron's inputs are seen and changed on that squadron), D2627 A8 ("…then press the bell again."), A9 (a save still
   going is waited for), A10 (one reason at a time), A11 (a refused line stays unread, its list open), A13 (the Retry note),
   A18 (a button bringing his own squadron back is refused as a pick is), A19 (a holiday's line brings its squadron into
   view first), D2628 C4 ("Welcome back" only at home), D2729 Q7 (his own SANS reminder brings his own squadron first), D2742
   (no give-up: the door waits on the saver's own answer), D2630 (three squadrons in the picker).

   EVERY PRESS IS THE WHOLE SEQUENCE ON THE REAL CONTROLS (§4.7's paragraph): the bell (#notifyBell), then its line
   ([data-testid="bell-line-…"]) — never a call of openNotice; the lit bell alone; a card of the OIL list; "Check my quals".
   Two belts, named so, drive a door no press reaches: B23 (an Undo's landing, by undo-wire's _snapView) and the Leave War's
   clash note (openInputWindow, driven as its button drives it). The note's words are read from the tables (guardWords),
   never typed here. Written FIRST and seen failing on the code as it stood (a line or a tap entered and opened whatever was
   open), but for the tests marked pins.

   The world: three squadrons (test-support/msq-world.ts withThird — 150's id is third.u150). Hunter is 142's admin with
   Plan of 149 and View of 150; Ranger 142's member with View of 149 and of 150; Saber the master admin. Wed 15 Jul 26. A
   line is made here and put in his bell (the tap is what is tested, not how the line was written — ui/msq-bell-tap.test.ts's
   way); the bell then draws it, and it is pressed. */
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { act, fireEvent } from '@testing-library/react'
import { withThird, third, signInAs, PID } from '../test-support/msq-world'
import { UNIT } from '../engine/unitview'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { CURPAGE, setPage, ADMINOPEN, INPMODE, INPVIEW, CALMONTH, SANSDAYASK, AVAILWIN, setInpView, setInpMode, setCalMonth } from '../state/view'
import { INPEDIT, OILASK, OILLIST, BELLLIST, setInpEdit, setOilList, INSIGHTS, setInsights } from './pops'
import { me, pageUnit, isAdmin } from '../state/perms'
import { homeOn, todayIso } from '../state/units'
import { enterSquadron, switchRoleViewRaw, notify } from '../state/store'
import { holdNow } from '../state/typing-hold'
import { NOTICES, type Notice } from '../state/notices'
import { isUnread } from '../state/noticeseen'
import { requestAccess } from '../state/accounts'
import { bellAccessAlert } from '../state/belltap'
import { setBellSquadron } from '../state/bellsqn'
import { setGuardSay, type GuardOpts } from '../state/guard'
import { guardSay } from './guardnote'
import { openInputWindow, openWarAt, openNewPeriod } from '../leavewar/sync'
import { getState as lwState } from '../leavewar/state/store'
import { takeRingAsk } from '../leavewar/ui/lwnav'
import { peekNewWarAsk, clearNewWarAsk } from '../leavewar/ui/warask'
import { openAdminUsers } from './adminopen'
import { _snapView } from '../state/undo-wire'
import { clearToast } from './toast'
import { watchSaves } from '../storage/savewait'
import { setCxt, setSortAll } from './board'
import { whatIsOpen, guardWords, GUARD_LEADS, GUARD_ENDINGS, type GuardRow } from './guard'
import { LGEDIT } from '../state/auth'
import {
  $, C, OPEN, app, doing, press, settle, tid, typeIn, goTracker, chartEdit, guardTeardown, openUserRow, ownInput,
  topPick, avail, SHOWN, note, nothingHeld, answeringSaver, saver, named, row,
} from '../test-support/msq-guard-testkit'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()

/* what the seam was handed at each refusal: the door and its opts (B6 — the pressed line reaches the note) */
const said: { door: string; opts: GuardOpts }[] = []
beforeEach(() => {
  said.length = 0
  setGuardSay((r, d, t, o) => { said.push({ door: d, opts: o }); guardSay(r, d, t, o) })
})
afterEach(async () => {
  setGuardSay(guardSay)
  /* the board's two questions outlive the page (ui/board.ts's own state — as in the pick's file) */
  setCxt(null); setSortAll(null)
  takeRingAsk(); clearNewWarAsk()
  await guardTeardown()
  clearToast()
  document.getElementById('toastEl')?.remove()
  document.getElementById('srSay')?.remove()
})

/* ---- the lines, and the presses: the bell, then its line ---- */
let seq = 0
function line(to: string, u: string | undefined, part: any, extra: Partial<Notice> = {}): Notice {
  const n: any = { id: 'k6l' + (++seq), to, by: null, at: Date.now(), iid: '', name: '', day: '2026-07-15', what: [part], ...extra }
  if (u !== undefined) n.u = u
  return n as Notice
}
/* an input of a squadron (its first-named man's squadron today) */
const of = (unit: string) => INPUTS.find((r: any) => r.person && (PEOPLE as any)[r.person] && homeOn(String(r.person), todayIso()) === unit) as any
/* a line about an input: "You were added" (a cx works the same — the first part's kind decides nothing here) */
const inputLine = (to: string, u: string, inp: any): Notice => line(to, u, { k: 'in' }, { iid: String(inp.iid), name: 'x' })
/* a weekend Duty of his on Sat 18 Jul with its OIL question unanswered — what a holiday's line counts (a line with nothing
   left is not drawn) and what the OIL list's card lists; his bell's tap leaves it to the holiday's line (topstate bellTap) */
async function plantDuty(person: string = PID.hunter): Promise<any> {
  const x: any = { remarks: '', mod: '2026-07-01', yr: 2026, allday: true, s: 0, e: 1439, person, type: 'Duty', date: 'Jul 18' }
  const { inpId } = await import('../engine/inputs')
  const { writeInputs } = await import('../state/store')
  inpId(x); writeInputs(() => { INPUTS.unshift(x) })
  return x
}
/* A HOLIDAY'S LINE, MADE AS THE APP MAKES IT: a Duty of another 142 man on Fri 17 Jul, then that day made a public holiday on
   142's own list by Hunter (142's admin) — the line goes to 142's schedulers' bells (leavewar/sync.ts tellHoliday) and is
   live while the day is a holiday with an answer left (state/notices.ts noticeLive). The list it opens by itself at the
   save is put away, so the test's own tap is what opens it. Made while 142 is in view. */
async function holidayLine(): Promise<Notice> {
  const { commitNewInput } = await import('./inputedit')
  const { holidayAdd } = await import('../leavewar/state/store')
  /* (an earlier test's holiday lines stay in NOTICES — the world does not clear the bell — and, made in the same minute,
     the one with the higher id would stand for this one and hide it: noticeLive's one-line-a-holiday rule. Cleared first.) */
  for (let i = NOTICES.length - 1; i >= 0; i--) if ((NOTICES[i].what?.[0] as any)?.k === 'oilhol') NOTICES.splice(i, 1)
  const man = Object.keys(PEOPLE).find(id => { const p = (PEOPLE as any)[id]; return !p.special && !p.archived && id !== PID.hunter && id !== PID.ranger && id !== PID.saber && homeOn(id, todayIso()) === 'u142' })!
  await doing(() => {
    expect(commitNewInput({ allday: true, half: '', sTime: '', eTime: '', remarks: '', sans: null, docIds: [], person: man, type: 'Duty', start: '2026-07-17', end: '2026-07-17' } as any), 'the premise: a Duty on the Friday').toBe(true)
    expect(holidayAdd({ kind: 'ph', name: 'National Day', from: '2026-07-17', to: '2026-07-17' } as any).ok, 'the premise: the Friday made a holiday').toBe(true)
  })
  await doing(() => { setOilList(null) })
  const n = NOTICES.find(x => x.to === PID.hunter && (x.what?.[0] as any)?.k === 'oilhol')
  expect(n, 'the premise: the holiday\'s line on his bell').toBeTruthy()
  /* (taken out of NOTICES here: the presses put it back as every other made line, so it is drawn when the bell opens) */
  NOTICES.splice(NOTICES.indexOf(n!), 1)
  return n!
}
/** the bell's list open, by the bell */
async function bellOpen() {
  if (!BELLLIST) await press($('#notifyBell'), 'the bell')
  expect(BELLLIST, 'the premise: the bell\'s list is open').toBe(true)
}
/** the line put in his bell, the bell pressed, then the line */
async function tapLine(n: Notice) {
  NOTICES.push(n)
  await doing(() => {})
  await bellOpen()
  expect(tid(`bell-line-${n.id}`), 'the premise: the line is drawn in his bell').not.toBeNull()
  await press(tid(`bell-line-${n.id}`), 'the line')
}
/** the note the tables say this state takes, for a door (`line` or `bell`) — read before the press */
function noteFor(door: 'line' | 'bell'): string {
  const w = whatIsOpen()
  expect(w, 'the premise: something refuses').not.toBeNull()
  const words = guardWords(w!.reason, w!.row, door, '')
  expect(words, 'the premise: the door has words for it').toBeTruthy()
  return words!
}
const toasts = (): string[] => (HOOKS.toast as any).mock.calls.map((c: any[]) => String(c[0]))
/** B6's assertions: a line pressed under a refusal — nothing changed, the line unread, the list open, the note under it */
async function refusedLine(n: Notice, r: GuardRow | null = null) {
  const unit = UNIT, page = CURPAGE, edit = INPEDIT, pid = String(me())
  NOTICES.push(n)
  await doing(() => {})
  await bellOpen()
  expect(tid(`bell-line-${n.id}`), 'the premise: the line is drawn in his bell').not.toBeNull()
  const words = noteFor('line')
  const open = whatIsOpen()?.row.id
  const toastsBefore = toasts().length
  await press(tid(`bell-line-${n.id}`), 'the line')
  expect({ unit: UNIT, page: CURPAGE }, 'nothing changed').toEqual({ unit, page })
  expect(isUnread(n, pid), 'the line still unread (D2627 A11)').toBe(true)
  expect(BELLLIST, 'the list still open').toBe(true)
  expect(note(), 'the note').toBe(words)
  expect(said.at(-1), 'the note is handed the pressed line').toMatchObject({ door: 'line', opts: { line: n.id } })
  expect(INPEDIT, 'no window opened or closed by it').toBe(edit)
  expect(OILASK, 'no OIL question').toBeNull()
  expect(toasts().slice(toastsBefore).filter(t => !t.startsWith('Blocked:')), 'no toast but the note').toEqual([])
  expect(whatIsOpen()?.row.id, 'what was open still open').toBe(open)
  if (r && r.counts !== 'unsaved' && r.sel) expect(!!$(r.sel), `${r.id} still on the page`).toBe(true)
  nothingHeld()
}
/** a lit bell's tap refused: nothing changed, the request still unseen, the bell still lit, the note under the bell */
async function refusedBell() {
  const unit = UNIT, page = CURPAGE
  const words = noteFor('bell')
  await press($('#notifyBell'), 'the lit bell')
  expect({ unit: UNIT, page: CURPAGE }, 'nothing changed').toEqual({ unit, page })
  expect(ADMINOPEN, 'Admin → Users not opened').toBeNull()
  expect(bellAccessAlert(), 'the request still unseen, the bell still lit').toBe(true)
  expect(note(), 'the note').toBe(words)
  expect(said.at(-1)?.door, 'the bell\'s door').toBe('bell')
  expect(toasts().some(t => /waiting for access/.test(t)), 'no "waiting for access" toast').toBe(false)
  nothingHeld()
}
/** a request for access to `unit`, which lights the bell of its admins */
function askAccess(unit: string) {
  signInAs('newface@mail')
  expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, unit), 'the premise: the request made').toBeNull()
}
/** Hunter on 149 (his Plan), an Input window open on 149's Inputs */
async function hunterOn149WithWindow() {
  await app('hunter')
  await topPick('u149')
  expect(UNIT, 'the premise: on 149').toBe('u149')
  await OPEN.inputedit!.open()
  expect(named(), 'the premise: the window counts').toBe('inputedit')
}
/** Ranger on 149 (his View), a change not saved */
async function rangerOn149Unsaved() {
  await app('ranger')
  await topPick('u149')
  expect([UNIT, CURPAGE], 'the premise: on 149\'s View-only Sched').toEqual(['u149', 'viewsched'])
  await OPEN.unsaved!.open()
  expect(named()).toBe('unsaved')
}
/** the Tracker's question, up */
const askedFor = async (num: string) => {
  await vi.waitFor(() => expect(C.dlg?.msg, 'the Tracker\'s question').toContain(`Save them before switching to ${num}?`), { timeout: 5000, interval: 10 })
}

/* ================= B6, B6b, B6c — a bell line ================= */
describe('B6 — a bell line to another squadron is refused (D2403, D2590, D2627 A11)', () => {
  it('Hunter on 149, a window open, a 142 line clicked: refused, the line unread, the list open, 149 in view, "…then press this line again." under the pressed line', async () => {
    await hunterOn149WithWindow()
    await refusedLine(inputLine(PID.hunter, 'u142', of('u142')), row('inputedit'))
    expect(note().endsWith(GUARD_ENDINGS.line), 'the line\'s own ending').toBe(true)
  })
  it('(control) with nothing open the same line goes through: 142 in view, its input open on 142\'s Inputs, the line read', async () => {
    await app('hunter')
    await topPick('u149')
    const inp = of('u142')
    const n = inputLine(PID.hunter, 'u142', inp)
    await tapLine(n)
    expect([UNIT, CURPAGE, INPEDIT?.iid], 'through').toEqual(['u142', 'inputs', inp.iid])
    expect(isUnread(n, PID.hunter)).toBe(false)
  })
})
describe('B6b — a line of a squadron his pages may never be, refused at the page door', () => {
  it('Ranger (View of 149 and of 150), 149 picked, a change not saved; a 150 input\'s line naming him: refused — 149, unread, the list open, no window, no OIL question, no toast but the note', async () => {
    await rangerOn149Unsaved()
    await refusedLine(inputLine(PID.ranger, third.u150, of('u142')), row('unsaved'))
    expect(INPEDIT).toBeNull()
  })
})
describe('B6c — a line of the squadron in view, in the member view, refused at the page door', () => {
  it('Hunter (Plan of 149), 149 picked, the member view, a change not saved; a 149 input\'s line: refused, 149 still in view', async () => {
    await app('hunter')
    await topPick('u149')
    await press($('#roleBadge'), 'his name badge')
    expect([isAdmin(), UNIT], 'the premise: the member view on 149').toEqual([false, 'u149'])
    await OPEN.unsaved!.open()
    await refusedLine(inputLine(PID.hunter, 'u149', of('u149')), row('unsaved'))
  })
})

/* ================= B7 — every family of line ================= */
describe('B7 — every family of line is refused as an input\'s is', () => {
  const FAMILIES: Record<string, () => Notice> = {
    'an input\'s': () => inputLine(PID.hunter, 'u142', of('u142')),
    'a Leave War decision': () => line(PID.hunter, 'u142', { k: 'lw', c: 'LL', a: '2026-07-20', b: '2026-07-20', d: 'approved' }, { name: 'Your leave', day: '2026-07-20' }),
    'bidding opened': () => line(PID.hunter, 'u142', { k: 'lwopen', a: '2026-07-20', b: '2026-07-24', open: true }, { name: 'Leave War', day: '2026-07-20' }),
    'a posting': () => line(PID.hunter, 'u142', { k: 'po', who: PID.ranger, o: 'none' }, { name: 'Ranger', day: '2026-07-20' }),
    'a SANS-days line': () => line(PID.hunter, 'u142', { k: 'sansback', days: ['2026-07-17'], how: 'later', to: '2026-07-17' }, { name: 'SANS', day: '2026-07-17' }),
  }
  for (const [name, make] of Object.entries(FAMILIES)) {
    it(`${name} line of 142, Hunter on 149 with a window open: refused, B6's assertions`, async () => {
      await hunterOn149WithWindow()
      const n = make()
      await refusedLine(n, row('inputedit'))
      expect(OILLIST, 'no OIL list').toBeNull()
      expect(ADMINOPEN, 'no Admin → Users').toBeNull()
      expect(takeRingAsk(), 'no ring asked of the Leave War').toBeNull()
    })
  }
  it('a holiday\'s line of 142 (the app\'s own), Hunter on 149 with a window open: refused, B6\'s assertions, no OIL list', async () => {
    await app('hunter')
    const n = await holidayLine()
    await topPick('u149')
    await OPEN.inputedit!.open()
    await refusedLine(n, row('inputedit'))
    expect(OILLIST, 'no OIL list').toBeNull()
  })
})

/* ================= B7b — his own SANS reminder ================= */
describe('B7b — his own SANS reminder brings his own squadron first (§4.1 row 9b, D2729 Q7)', () => {
  /* the reminder his bell works out (leavewar/sansunfiled.ts, k: 'sansdue') carries no squadron; put here as his bell would
     hold it, about his own days */
  const reminder = () => line(PID.hunter, undefined, { k: 'sansdue', days: ['2026-07-17'], from: '2026-07-17' }, { name: 'Your SANS availability', day: '2026-07-17' })
  const marks = () => ({ mode: INPMODE, view: INPVIEW, month: CALMONTH, ask: SANSDAYASK })
  /* (with 150, which he only views, the old code already ended on 142's SANS tab — the landing brought his home back after
     the marks were set — so that case is a pin; with 149 picked by his Plan it stayed on 149: K6's own half) */
  for (const [who, pickTo, pin] of [['149, picked by his Plan', 'u149', ''], ['150, which he only views', '', '(pin, today\'s too) ']] as const) {
    it(`${pin}with ${who}: 142 comes into view, then Inputs on its SANS tab at the reminder's day`, async () => {
      await app('hunter')
      await topPick(pickTo || third.u150)
      await tapLine(reminder())
      expect([UNIT, pageUnit('own'), CURPAGE], '142, his own squadron, on Inputs').toEqual(['u142', 'u142', 'inputs'])
      expect([INPVIEW, INPMODE, CALMONTH], 'the SANS tab at July').toEqual(['cal', 'sans', { y: 2026, m: 7 }])
    })
  }
  it('with a window open: refused — the line unread, the list open, the tab and month as they were, no day asked', async () => {
    await hunterOn149WithWindow()
    await doing(() => { setInpView('table'); setInpMode('member'); setCalMonth({ y: 2026, m: 8 }) })
    const before = marks()
    await refusedLine(reminder(), row('inputedit'))
    expect(marks()).toEqual(before)
    expect(SANSDAYASK).toBeNull()
  })
  it('with a change not saved, 150 picked (he only views it): refused at the page door — the same marks as they were', async () => {
    await app('hunter')
    await topPick(third.u150)
    await OPEN.unsaved!.open()
    const before = marks()
    await refusedLine(reminder(), row('unsaved'))
    expect(marks()).toEqual(before)
  })
  it('with unsaved chart edits on 149\'s Tracker: the Tracker\'s question first; Stay → every mark as it was, the line unread', async () => {
    await app('hunter')
    await topPick('u149')
    await goTracker()
    await chartEdit()
    const before = marks()
    const n = reminder()
    await tapLine(n)
    await askedFor('142')
    await press($('#dlgCancel'), 'Stay')
    expect(UNIT).toBe('u149')
    expect(marks(), 'Stay: every mark as it was').toEqual(before)
    expect(isUnread(n, PID.hunter)).toBe(true)
  })
  it('(pin, today\'s too) on 142 already: as today — Inputs on its SANS tab at the day', async () => {
    await app('hunter')
    await tapLine(reminder())
    expect([UNIT, CURPAGE, INPMODE]).toEqual(['u142', 'inputs', 'sans'])
  })
})

/* ================= B8 ================= */
describe('B8 — a line of his own squadron from a squadron he only views', () => {
  it('Ranger (View of 149), 149 picked, a change not saved, a 142 war line: refused at the page door, 149 still in view, nothing ringed on the Leave War', async () => {
    await rangerOn149Unsaved()
    const warWas = lwState().currentId
    await refusedLine(line(PID.ranger, 'u142', { k: 'lw', c: 'LL', a: '2026-07-20', b: '2026-07-20', d: 'approved' }, { name: 'Your leave', day: '2026-07-20' }), row('unsaved'))
    expect(takeRingAsk(), 'nothing ringed').toBeNull()
    expect(lwState().currentId, 'the war as it was').toBe(warWas)
  })
})

/* ================= B9 — the lit bell ================= */
describe('B9 — the bell itself, an access request (D2627 A8)', () => {
  it('Hunter on 149 with a window open, a 142 request lights his bell: the tap refused — Admin → Users not opened, the request unseen, "…then press the bell again." under the bell', async () => {
    askAccess('u142')
    await hunterOn149WithWindow()
    expect(bellAccessAlert(), 'the premise: the bell lit').toBe(true)
    await refusedBell()
    expect(note().endsWith(GUARD_ENDINGS.bell)).toBe(true)
  })
  it('a request of his own squadron while a squadron he only views is picked, a change not saved: refused at the page door, no "waiting for access" toast', async () => {
    askAccess('u142')
    await app('hunter')
    await topPick(third.u150)
    await OPEN.unsaved!.open()
    await refusedBell()
    expect(UNIT).toBe(third.u150)
  })
  it('(control) nothing open: the tap goes through, 142\'s Admin → Users, "1 waiting for access to 142"', async () => {
    askAccess('u142')
    await app('hunter')
    await topPick(third.u150)
    await press($('#notifyBell'), 'the lit bell')
    expect([UNIT, CURPAGE]).toEqual(['u142', 'admin'])
    expect(toasts()).toContain('1 waiting for access to 142')
  })
})

/* ================= F2b — the bell's OIL tap ================= */
describe('F2b — the bell\'s OIL tap where his pages may never be the input\'s squadron (§5.6)', () => {
  it('Ranger (View of 149 and 150), 149 picked, a change not saved, his own OIL question on an input of 150: refused at the page door — 149, no window, no OIL question, no "Weekend/PH work" toast', async () => {
    await app('ranger')
    /* his own unanswered weekend Training, stamped 150's (the input's squadron his pages may never be) */
    const before = new Set(INPUTS.map((r: any) => r.iid))
    const { commitNewInput } = await import('./inputedit')
    expect(commitNewInput({ allday: true, half: '', sTime: '', eTime: '', remarks: '', sans: null, docIds: [], person: PID.ranger, type: 'Training', start: '2026-07-18', end: '2026-07-18' } as any)).toBe(true)
    const mine = INPUTS.find((r: any) => !before.has(r.iid)) as any
    expect(mine, 'the premise: his weekend input').toBeTruthy()
    mine.u = third.u150
    await topPick('u149')
    await OPEN.unsaved!.open()
    const { oilPendingFor } = await import('../leavewar/sync')
    expect(oilPendingFor(PID.ranger).some((h: any) => h.iid === mine.iid), 'the premise: his OIL question waits').toBe(true)
    const t0 = toasts().length
    await press($('#notifyBell'), 'the bell')
    expect([UNIT, CURPAGE]).toEqual(['u149', 'viewsched'])
    expect(INPEDIT, 'no window').toBeNull()
    expect(OILASK, 'no OIL question').toBeNull()
    expect(toasts().slice(t0).filter(t => /Weekend\/PH work/.test(t)), 'no "Weekend/PH work" toast').toEqual([])
  })
})

/* ================= B10–B13 — the bell and page-door halves ================= */
describe('B10 — a change not saved: the Retry note at a line and at the lit bell (D2627 A13)', () => {
  it('a line to another squadron: refused with the Retry lead and "…then press this line again."; Retry lands → nothing by itself; a fresh press goes through', async () => {
    await app('hunter')
    await topPick('u149')
    await OPEN.unsaved!.open()
    const n = inputLine(PID.hunter, 'u142', of('u142'))
    await refusedLine(n, row('unsaved'))
    expect(note()).toBe(`Blocked: ${GUARD_LEADS.retry}, then ${GUARD_ENDINGS.line}`)
    saver.status = 'idle'
    await doing(() => {})
    await act(async () => { await new Promise(r => setTimeout(r, 30)) })
    expect(UNIT, 'nothing happens by itself when the save lands').toBe('u149')
    await press(tid(`bell-line-${n.id}`), 'the line again')
    expect(UNIT, 'a fresh press goes through').toBe('u142')
  })
  it('the lit bell: refused with the Retry lead and "…then press the bell again."', async () => {
    askAccess('u142')
    await app('hunter')
    await topPick('u149')
    await OPEN.unsaved!.open()
    await refusedBell()
    expect(note()).toBe(`Blocked: ${GUARD_LEADS.retry}, then ${GUARD_ENDINGS.bell}`)
  })
})
describe('B11 — Admin\'s unsaved work refuses a bell line and a lit bell (D2595, D2598)', () => {
  const CASES: Record<string, { open: () => Promise<void>; id: string }> = {
    'a Users row with a letter typed': { id: 'userrow', open: async () => { await openUserRow(); const b = $('#accEdName, #accGiveName') as HTMLInputElement; await typeIn('#accEdName, #accGiveName', b.value + 'x') } },
    'Give access with its Role changed': { id: 'giveaccess', open: OPEN.giveaccess!.open },
    'Add a person with a callsign typed': { id: 'addperson', open: OPEN.addperson!.open },
  }
  for (const [name, c] of Object.entries(CASES)) {
    it(`${name}: a 149 line refused under its own lead, the row or form still open with what was in it`, async () => {
      await app('hunter')
      await c.open()
      expect(named(), 'the premise').toBe(c.id)
      const typed = [...document.querySelectorAll<HTMLInputElement>('.od-row-on input, #accAddBlock input, [data-approve-form] input, #apvRole')].map(b => b.value)
      await refusedLine(inputLine(PID.hunter, 'u149', of('u149')), row(c.id))
      expect([...document.querySelectorAll<HTMLInputElement>('.od-row-on input, #accAddBlock input, [data-approve-form] input, #apvRole')].map(b => b.value), 'what was in it').toEqual(typed)
    })
  }
  it('"+ New squadron" with a number typed (Saber, 149\'s lines switched on in his bell): a 149 line refused under its own lead, the number still typed', async () => {
    await app('saber')
    expect(setBellSquadron('u149', true), 'the premise: 149\'s lines on his bell').toBe(true)
    await OPEN.newsqn!.open()
    expect(named()).toBe('newsqn')
    await refusedLine(inputLine(PID.saber, 'u149', of('u149')), row('newsqn'))
    expect(($('#sqNewNum') as HTMLInputElement).value, 'the number still typed').toBe('151')
  })
  it('chat 205\'s case: Saber, an Admin → Users row open with a letter typed, taps a posting line of 149 that lands on another man: refused under the row\'s own lead — the row still open with his letter, the line unread, the list open', async () => {
    await app('saber')
    expect(setBellSquadron('u149', true), 'the premise: 149\'s lines on his bell').toBe(true)
    await CASES['a Users row with a letter typed']!.open()
    const box = $('#accEdName, #accGiveName') as HTMLInputElement
    const typed = box.value
    const other = Object.keys(PEOPLE).find(id => { const p = (PEOPLE as any)[id]; return !p.special && !p.archived && homeOn(id, todayIso()) === 'u149' })!
    await refusedLine(line(PID.saber, 'u149', { k: 'po', who: other, o: 'none' }, { name: 'x', day: '2026-07-20' }), row('userrow'))
    expect(note().startsWith(`Blocked: ${GUARD_LEADS.row}`), 'the row\'s own lead').toBe(true)
    expect(($('#accEdName, #accGiveName') as HTMLInputElement | null)?.value, 'the row still open with his letter in it').toBe(typed)
  })
  it('(pin, today\'s too) a row opened with nothing changed: the line goes through', async () => {
    await app('hunter')
    await openUserRow()
    expect(named()).toBeNull()
    await tapLine(inputLine(PID.hunter, 'u149', of('u149')))
    expect(UNIT).toBe('u149')
  })
})
describe('B12, B13 — two reasons, one at a time; a refusal before the Tracker\'s question', () => {
  it('B12: a window and a failed save at a line — the window\'s note; the window closed, the line pressed again: the Retry note; never the Tracker\'s question', async () => {
    await hunterOn149WithWindow()
    await OPEN.unsaved!.open()
    const n = inputLine(PID.hunter, 'u142', of('u142'))
    await refusedLine(n, row('inputedit'))
    expect(note()).toBe(`Blocked: ${GUARD_LEADS.window}, then ${GUARD_ENDINGS.line}`)
    await press(tid('win-inputedit-x'), 'the window\'s ✕')
    await bellOpen()
    await press(tid(`bell-line-${n.id}`), 'the line again')
    expect(note()).toBe(`Blocked: ${GUARD_LEADS.retry}, then ${GUARD_ENDINGS.line}`)
    expect(UNIT).toBe('u149')
    expect(C.dlg ?? null).toBeNull()
  })
  it('B13: a window open and unsaved chart edits: the line refused, the Tracker\'s question never raised (core.dlg null)', async () => {
    await app('hunter')
    await topPick('u149')
    await goTracker()
    await chartEdit()
    await OPEN.inputedit!.open()
    await refusedLine(inputLine(PID.hunter, 'u142', of('u142')), row('inputedit'))
    expect(C.dlg ?? null, 'no question').toBeNull()
  })
})

/* ================= B4b — the bell's half: the show-only windows close, and the line goes through ================= */
describe('B4b — a window that only shows things closes at a line to another squadron, and the line goes through (D2596, D2597)', () => {
  /* (lwshow is left out: its opener signs Ranger in — a member's tap opens the sheet, D1548 — and his own pages are his
     home whatever is picked, so no line of his ever enters another squadron: it is the page door's road, which closes
     nothing; 'lwday behind another tab' is the pick's own case of that row) */
  for (const [id, s] of Object.entries(SHOWN)) {
    if (id === 'lwshow' || id === 'lwday behind another tab') continue
    /* (a pin: the old entry closed these too; K6's half of B4b is the refusal below and B30's) */
    it(`(pin, today's too) ${id}: a 149 line — 149 in view, no note, its box gone and its state clear`, async () => {
      await app('hunter')
      await s.open()
      expect(s.shut(), `the premise: ${id} is open`).toBe(false)
      expect(whatIsOpen(), 'the premise: nothing refuses').toBeNull()
      await tapLine(inputLine(PID.hunter, 'u149', of('u149')))
      expect(UNIT).toBe('u149')
      expect(note()).toBe('')
      expect(s.shut(), `${id} closed`).toBe(true)
      nothingHeld()
    })
  }
  it('ALL AVAIL beside an Input window on Edit Schedule: refused, and ALL AVAIL still open', async () => {
    await app('hunter')
    await SHOWN.avail!.open()
    await OPEN.inputdlg!.open()
    expect(!!AVAILWIN, 'the premise: both open').toBe(true)
    await refusedLine(inputLine(PID.hunter, 'u149', of('u149')), row('inputdlg'))
    expect(!!AVAILWIN, 'ALL AVAIL still open').toBe(true)
  })
})

/* ================= B20 — a save still going ================= */
describe('B20 — a save still going: a line waits for the saver\'s own answer (D2627 A9, D2742)', () => {
  it('a change made and a 149 line pressed in the same tick: the save sent first, then the line goes on — 149, its input open', async () => {
    await app('hunter')
    const s = answeringSaver()
    s.change()
    const inp = of('u149')
    await tapLine(inputLine(PID.hunter, 'u149', inp))
    expect(s.sent.length, 'the save sent first').toBe(1)
    expect(UNIT, 'the line waits for it').toBe('u142')
    await s.answer(true)
    expect([UNIT, CURPAGE, INPEDIT?.iid], 'landed: the line goes on').toEqual(['u149', 'inputs', inp.iid])
  })
  it('made to fail: refused with the Retry note, 142 still in view', async () => {
    await app('hunter')
    const s = answeringSaver()
    s.change()
    await tapLine(inputLine(PID.hunter, 'u149', of('u149')))
    await s.answer(false)
    expect(UNIT).toBe('u142')
    expect(note()).toBe(`Blocked: ${GUARD_LEADS.retry}, then ${GUARD_ENDINGS.line}`)
    expect(INPEDIT).toBeNull()
  })
  it('a save that never answers (a stand-in, named so): nothing is entered for as long as it has not answered', async () => {
    await app('hunter')
    const s = answeringSaver()
    s.change()
    await tapLine(inputLine(PID.hunter, 'u149', of('u149')))
    await act(async () => { await new Promise(r => setTimeout(r, 400)) })
    await settle()
    expect({ unit: UNIT, edit: INPEDIT, note: note() }).toEqual({ unit: 'u142', edit: null, note: '' })
  })
  it('through the page door — Ranger on 149, a line of his own 142 input inside the wait: the save lands, then 142 and the window; made to fail → refused, no window', async () => {
    await app('ranger')
    await topPick('u149')
    const mine = INPUTS.find((r: any) => r.person === PID.ranger) as any
    expect(mine, 'the premise: an input of his').toBeTruthy()
    let s = answeringSaver()
    s.change()
    await tapLine(inputLine(PID.ranger, 'u142', mine))
    expect([UNIT, INPEDIT], 'waiting').toEqual(['u149', null])
    await s.answer(true)
    expect([UNIT, CURPAGE, INPEDIT?.iid], 'landed: 142, then the window').toEqual(['u142', 'inputs', mine.iid])
    await doing(() => { setInpEdit(null) })
    await topPick('u149')
    s = answeringSaver()
    s.change()
    await tapLine(inputLine(PID.ranger, 'u142', mine))
    await s.answer(false)
    expect([UNIT, INPEDIT], 'refused, no window').toEqual(['u149', null])
    expect(note()).toBe(`Blocked: ${GUARD_LEADS.retry}, then ${GUARD_ENDINGS.line}`)
  })
})

/* ================= B22, B23 ================= */
describe('B22 — "Check my quals" never changes squadron: the card is drawn only on his own squadron (D2628 C4)', () => {
  const back = (id: string) => { (PEOPLE as any)[id].back = true }
  it('Ranger (View of 149 and 150), just restored: with 149 picked and with 150 picked, no card; back on 142 it is, and "Check my quals" opens Quals at his row, the card spent', async () => {
    back(PID.ranger)
    await app('ranger')
    await topPick('u149')
    expect($('#welcomeBack'), '149 picked: no card').toBeNull()
    await topPick(third.u150)
    expect($('#welcomeBack'), '150 picked: no card').toBeNull()
    await topPick('u142')
    expect($('#welcomeBack'), 'on 142: the card').not.toBeNull()
    await press($('#welcomeCheck'), 'Check my quals')
    expect([UNIT, CURPAGE]).toEqual(['u142', 'quals'])
    expect((PEOPLE as any)[PID.ranger].back, 'the card spent').toBeFalsy()
  })
  it('Hunter (Plan of 149), 149 picked: no card; in the member view with 149 picked: no card', async () => {
    back(PID.hunter)
    await app('hunter')
    await topPick('u149')
    expect($('#welcomeBack')).toBeNull()
    await press($('#roleBadge'), 'his name badge')
    expect([isAdmin(), UNIT]).toEqual([false, 'u149'])
    expect($('#welcomeBack')).toBeNull()
    expect((PEOPLE as any)[PID.hunter].back, 'his mark waits').toBe(true)
  })
  it('Saber on 150: no card', async () => {
    back(PID.saber)
    await app('saber')
    await topPick(third.u150)
    expect($('#welcomeBack')).toBeNull()
  })
})
describe('B23 — an Undo\'s landing on his own page (a belt: no button reaches it — §4.1 row 13)', () => {
  it('_snapView with a step that lands on Inputs, 149 picked by a View holder, a change not saved: the page and the squadron unchanged, the landing\'s own `then` not run', async () => {
    await rangerOn149Unsaved()
    /* an input step undone: its landing is Inputs, and its `then` would set the calendar's mode to the input's (member, for
       an LL — undo-wire.ts landingOf) */
    const step: any = { id: 'k6-b23', label: 'x', scope: { module: 'inputs' }, forward: [{ collection: 'inputs', id: 'x', before: { iid: 'x', person: PID.ranger, type: 'LL', date: 'Jul 20' }, after: null }], inverse: [] }
    await doing(() => { setInpMode('sans') })
    await doing(() => { _snapView(step, 'undo') })
    expect([UNIT, CURPAGE], 'nothing moved').toEqual(['u149', 'viewsched'])
    expect(INPMODE, 'its `then` not run').toBe('sans')
  })
  it('(control) the same step with nothing open: the landing goes — 142, Inputs, its `then` run', async () => {
    await app('ranger')
    await topPick('u149')
    const step: any = { id: 'k6-b23c', label: 'x', scope: { module: 'inputs' }, forward: [{ collection: 'inputs', id: 'x', before: { iid: 'x', person: PID.ranger, type: 'LL', date: 'Jul 20' }, after: null }], inverse: [] }
    await doing(() => { setInpMode('sans') })
    await doing(() => { _snapView(step, 'undo') })
    expect([UNIT, CURPAGE, INPMODE]).toEqual(['u142', 'inputs', 'member'])
  })
})

/* ================= B25 — a card of the OIL list ================= */
describe('B25 — a card of the OIL list: its page first, then the window; refused behind a squadron he only views', () => {
  const cardList = async () => {
    const x = await plantDuty()
    await doing(() => setOilList({ from: '2026-07-18', to: '2026-07-18', name: 'Holiday', unit: 'u142' }))
    expect(tid(`odl-row-${x.iid}`), 'the premise: the card is drawn').not.toBeNull()
    return x
  }
  /* the card's own body (a press on its buttons answers OIL, not this) */
  const card = (x: any) => tid(`odl-row-${x.iid}`)?.querySelector('.icard-who') ?? tid(`odl-row-${x.iid}`)
  it('(pin, today\'s too) 142\'s list open on 142, nothing else: the card opens the input on Inputs, the page first', async () => {
    await app('hunter')
    const x = await cardList()
    const seen: string[] = []
    const un = (await import('../state/store')).subscribe(() => { if (INPEDIT && !seen.length) seen.push(CURPAGE) })
    await press(card(x), 'the card')
    un()
    expect([CURPAGE, INPEDIT?.iid]).toEqual(['inputs', x.iid])
    expect(seen, 'the window set only once the page is Inputs').toEqual(['inputs'])
  })
  it('(pin, today\'s too) with a change not saved, still on 142: the card opens the input all the same — nothing changes squadron there', async () => {
    await app('hunter')
    const x = await cardList()
    await OPEN.unsaved!.open()
    await press(card(x), 'the card')
    expect([UNIT, CURPAGE, INPEDIT?.iid]).toEqual(['u142', 'inputs', x.iid])
  })
  it('the list standing over a squadron he only views (by a raw entry — reached by no press since D2403 and D2627 A19): not refused by the list it sits in — 142 comes into view and the window opens; with a change not saved: refused, 150 in view, no window', async () => {
    await app('hunter')
    const x = await cardList()
    await doing(() => { enterSquadron(third.u150, holdNow() === 'war', true) })
    expect([UNIT, !!OILLIST], 'the premise: the list over 150').toEqual([third.u150, true])
    await press(card(x), 'the card')
    expect([UNIT, CURPAGE, INPEDIT?.iid], 'through: its squadron, its page, then the window').toEqual(['u142', 'inputs', x.iid])
    await doing(() => { setInpEdit(null); setPage('viewsched'); setOilList({ from: '2026-07-18', to: '2026-07-18', name: 'Holiday', unit: 'u142' }) })
    await doing(() => { enterSquadron(third.u150, holdNow() === 'war', true) })
    await OPEN.unsaved!.open()
    await press(card(x), 'the card')
    expect([UNIT, INPEDIT], 'refused').toEqual([third.u150, null])
  })
})

/* ================= B26 — nothing opens behind a refusal at the page door ================= */
describe('B26 — nothing opens behind a refusal at the page door (a squadron he only views picked, a change not saved)', () => {
  const nothingOpened = (unit: string, page: string) => {
    expect({ edit: INPEDIT, ask: OILASK, list: OILLIST, unit: UNIT, page: CURPAGE }).toEqual({ edit: null, ask: null, list: null, unit, page })
  }
  it('a bell line of his own input', async () => {
    await rangerOn149Unsaved()
    const mine = INPUTS.find((r: any) => r.person === PID.ranger) as any
    await refusedLine(inputLine(PID.ranger, 'u142', mine), row('unsaved'))
    nothingOpened('u149', 'viewsched')
  })
  it('a holiday\'s bell line (ownSquadronFirst) — Hunter (View of 150), 150 picked', async () => {
    await app('hunter')
    const n = await holidayLine()
    await topPick(third.u150)
    await OPEN.unsaved!.open()
    await refusedLine(n, row('unsaved'))
    nothingOpened(third.u150, 'viewsched')
  })
  it('the Leave War\'s clash note (openInputWindow, driven as its button drives it — a belt)', async () => {
    await rangerOn149Unsaved()
    const mine = INPUTS.find((r: any) => r.person === PID.ranger) as any
    let took = false
    await doing(() => { took = openInputWindow(String(mine.iid)) })
    expect(took, 'the tap was taken').toBe(true)
    nothingOpened('u149', 'viewsched')
  })
})

/* ================= B27 — the landing's question, then a refusal ================= */
describe('B27 — the landing\'s question, then a refusal (the landing\'s second ask, §4.5 step 3)', () => {
  /* Hunter in the member view on 149, the Tracker held there over an unsaved chart edit — reached by no press since D2627
     A20 (the switch now asks first), so by the raw switch (state/store.ts switchRoleViewRaw), named so */
  async function heldInMemberView() {
    await app('hunter')
    await topPick('u149')
    await goTracker()
    await chartEdit()
    await doing(() => { setPage('viewsched') })
    await doing(() => { switchRoleViewRaw() })
    expect([isAdmin(), UNIT], 'the premise: the member view on 149').toEqual([false, 'u149'])
    expect(C.sylDirty).toBe(true)
  }
  it('a line of his own 142 input: "Save them before switching to 142?"; the saver fails while it stands; Discard — the Retry note, no window, 149, the page as it was', async () => {
    await heldInMemberView()
    const mine = of('u142')
    await tapLine(inputLine(PID.hunter, 'u142', mine))
    await askedFor('142')
    expect(INPEDIT, 'nothing under the question').toBeNull()
    const page = CURPAGE
    saver.status = 'failed'; await doing(() => { watchSaves(saver as any) })
    await press($('#dlgAlt'), 'Discard them')
    await settle()
    expect(note()).toBe(`Blocked: ${GUARD_LEADS.retry}, then ${GUARD_ENDINGS.line}`)
    expect([INPEDIT, UNIT, CURPAGE]).toEqual([null, 'u149', page])
  })
  it('(pin, today\'s too) Stay: nothing', async () => {
    await heldInMemberView()
    await tapLine(inputLine(PID.hunter, 'u142', of('u142')))
    await askedFor('142')
    await press($('#dlgCancel'), 'Stay')
    expect([INPEDIT, UNIT]).toEqual([null, 'u149'])
  })
  it('(pin, today\'s too) Discard with nothing wrong: 142, the Inputs page, then the window', async () => {
    await heldInMemberView()
    const mine = of('u142')
    await tapLine(inputLine(PID.hunter, 'u142', mine))
    await askedFor('142')
    await press($('#dlgAlt'), 'Discard them')
    await vi.waitFor(() => expect(INPEDIT?.iid).toBe(mine.iid), { timeout: 5000, interval: 10 })
    expect([UNIT, CURPAGE]).toEqual(['u142', 'inputs'])
  })
})

/* ================= B28 — a caller that sets something before the page, refused ================= */
describe('B28 — a caller that sets something before the page asks first: refused, it set nothing', () => {
  it('openAdminUsers (Ranger on 149, a change not saved): no Users intent', async () => {
    await rangerOn149Unsaved()
    await doing(() => { openAdminUsers({ person: PID.ranger }) })
    expect([ADMINOPEN, UNIT, CURPAGE]).toEqual([null, 'u149', 'viewsched'])
  })
  it('openWarAt: no ring asked of the Leave War, its war as it was', async () => {
    await rangerOn149Unsaved()
    const warWas = lwState().currentId
    await doing(() => { openWarAt('2026-07-20', PID.ranger) })
    expect(takeRingAsk()).toBeNull()
    expect([lwState().currentId, UNIT, CURPAGE]).toEqual([warWas, 'u149', 'viewsched'])
  })
  it('openNewPeriod: no new-period ask pending', async () => {
    await rangerOn149Unsaved()
    await doing(() => { openNewPeriod('2031-03-01', '2031-03-31') })
    expect([peekNewWarAsk(), UNIT, CURPAGE]).toEqual([null, 'u149', 'viewsched'])
  })
})

/* ================= B29 — a holiday's line ================= */
describe('B29 — a holiday\'s bell line brings its squadron into view first (D2627 A19)', () => {
  it('Hunter (142\'s admin, View of 150), 150 picked, taps "… is now a public holiday": 142, then 142\'s OIL list — never the list under 150\'s number', async () => {
    await app('hunter')
    const n = await holidayLine()
    await topPick(third.u150)
    const seen: string[] = []
    const un = (await import('../state/store')).subscribe(() => { if (OILLIST && !seen.length) seen.push(UNIT) })
    await tapLine(n)
    un()
    expect(UNIT).toBe('u142')
    expect(OILLIST, '142\'s OIL list').toMatchObject({ from: '2026-07-17', unit: 'u142' })
    expect(seen, 'the list opened only once 142 was in view').toEqual(['u142'])
  })
  it('with a change not saved: refused, the line unread, no OIL list', async () => {
    await app('hunter')
    const n = await holidayLine()
    await topPick(third.u150)
    await OPEN.unsaved!.open()
    await refusedLine(n, row('unsaved'))
    expect(OILLIST).toBeNull()
  })
  /* (its "with a window open" half is B7's holiday family: Hunter on 149 with an Input window — on 150, which he only
     views, no window that counts can be opened by a press: its View-only Sched draws none of them) */
  it('(pin, today\'s too) on 142 already: the list opens at once', async () => {
    await app('hunter')
    const n = await holidayLine()
    await tapLine(n)
    expect([UNIT, !!OILLIST]).toEqual(['u142', true])
  })
})

/* ================= B30 — when the show-only windows close, at a line and at the page door ================= */
describe('B30 — when the show-only windows close at a bell line, and when they do not', () => {
  it('(pin, today\'s too) ALL AVAIL open, unsaved chart edits on 149, a 142 line: the question; Stay → ALL AVAIL still open; Discard → closed, then 142', async () => {
    await app('hunter')
    await topPick('u149')
    await goTracker()
    await chartEdit()
    await doing(() => { setPage('editsched'); avail() })
    const n = inputLine(PID.hunter, 'u142', of('u142'))
    await tapLine(n)
    await askedFor('142')
    await press($('#dlgCancel'), 'Stay')
    expect({ unit: UNIT, avail: !!AVAILWIN }, 'Stay').toEqual({ unit: 'u149', avail: true })
    await bellOpen()
    await press(tid(`bell-line-${n.id}`), 'the line again')
    await askedFor('142')
    await press($('#dlgAlt'), 'Discard them')
    await vi.waitFor(() => expect(UNIT).toBe('u142'), { timeout: 5000, interval: 10 })
    expect(AVAILWIN, 'closed').toBeNull()
  })
  it('a line refused for a failed save: ALL AVAIL still open', async () => {
    await app('hunter')
    await doing(() => { setPage('editsched'); avail() })
    await OPEN.unsaved!.open()
    await refusedLine(inputLine(PID.hunter, 'u149', of('u149')), row('unsaved'))
    expect(!!AVAILWIN).toBe(true)
  })
  it('a save waited for, then landed: closed, then the line — never before it lands', async () => {
    await app('hunter')
    await doing(() => { setPage('editsched'); avail() })
    const s = answeringSaver()
    s.change()
    await tapLine(inputLine(PID.hunter, 'u149', of('u149')))
    expect({ unit: UNIT, avail: !!AVAILWIN }, 'still waiting').toEqual({ unit: 'u142', avail: true })
    await s.answer(true)
    expect({ unit: UNIT, avail: !!AVAILWIN }).toEqual({ unit: 'u149', avail: false })
  })
  it('(pin, today\'s too) a line of the squadron already in view: no change of squadron, ALL AVAIL\'s close is the page change\'s own', async () => {
    await app('hunter')
    await doing(() => { setPage('editsched'); avail() })
    await tapLine(inputLine(PID.hunter, 'u142', of('u142')))
    expect([UNIT, note()]).toEqual(['u142', ''])
  })
  it('the page door, B27\'s state: Insights open — Stay leaves it open; Discard with the saver failing meanwhile leaves it open', async () => {
    await app('hunter')
    await topPick('u149')
    await goTracker()
    await chartEdit()
    await doing(() => { setPage('viewsched') })
    await doing(() => { switchRoleViewRaw() })
    await doing(() => { setInsights(true) })
    const n = inputLine(PID.hunter, 'u142', of('u142'))
    await tapLine(n)
    await askedFor('142')
    await press($('#dlgCancel'), 'Stay')
    expect(INSIGHTS, 'Stay: Insights open').toBe(true)
    await bellOpen()
    await press(tid(`bell-line-${n.id}`), 'the line again')
    await askedFor('142')
    saver.status = 'failed'; await doing(() => { watchSaves(saver as any) })
    await press($('#dlgAlt'), 'Discard them')
    await settle()
    expect([INSIGHTS, UNIT], 'refused at the second ask: Insights still open').toEqual([true, 'u149'])
  })
})

/* ================= B17 (pin) ================= */
describe('B17 — a page tab never changes the squadron (pin)', () => {
  it('(pin, today\'s too) Ranger with 149 picked: the bar and the ☰ menu draw View-only Sched and Help alone', async () => {
    await app('ranger')
    await topPick('u149')
    const tabs = [...document.querySelectorAll<HTMLElement>('nav [data-page]:not([hidden]), .tabs [data-page]:not([hidden])')].map(b => b.dataset.page)
    if (tabs.length) expect(new Set(tabs)).toEqual(new Set(['viewsched', 'help']))
    const { setDrawer } = await import('./pops')
    await doing(() => setDrawer(true))
    const pages = [...document.querySelectorAll<HTMLElement>('.drawer [data-page]')].map(b => b.dataset.page)
    if (pages.length) expect(new Set(pages)).toEqual(new Set(['viewsched', 'help']))
    expect(tabs.length + pages.length, 'the premise: the page names are drawn').toBeGreaterThan(0)
  })
})
void fireEvent; void notify; void LGEDIT; void ownInput
