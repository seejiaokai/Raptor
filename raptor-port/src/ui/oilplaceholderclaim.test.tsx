// @vitest-environment jsdom
/* OIL EARN, ON SCREEN, FOR AN INPUT FILED FOR "ALL AVAIL" — each man's switch starts where his credit does, and says why
   (`[INPUT-ALL-AVAIL]`; owner D702, D711 (1), 9 Oct 26: "the filer answers the OIL question once and the scheduler may
   switch any one man").

   The credit half is engine/oilplaceholderclaim.test.ts. THIS file exists because of what both first-round readers of
   the plan found: changing the credit alone would have left every crowd man's switch reading "on by default" over the
   filer's No — so the first tap wrote a REFUSAL of a credit he never had, the second tap removed it, and NEITHER
   granted him anything. The admin could not override (against D28). So here the switches are pressed for real, in the
   window where they live (D38), after a No, after no answer and after a Yes, and the credit is read after each press.

   SINCE THE ONE-RULE BUILD ([ALL-AVAIL-AS-MEMBER] step 2; owner D755, D762 — 11 Oct 26; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.4, §4.7): a row that came from an input IS the input, with ONE
   OIL answer for everyone in it and for the men behind its placeholder. Three cases here stood a NAMED man on the
   placeholder's row, or the placeholder under a named man's, by writing the row directly — and pinned that he, or the
   crowd, earned by default whatever the answer was (D18, D470, D46). That rule is gone, and the row can no longer be
   written that way (the re-make sweeps it, the engine's belt refuses it).

   SINCE STEP 3 OF THAT BUILD (12 Oct 26; owner D750, D753, D755, D757) THE DOORS STAND THEM SIDE BY SIDE: ALL AVAIL / ALL
   is one of an input's own people, so a named man put on the placeholder's row JOINS beside it, and ALL AVAIL put under
   a named man's request joins him (ui/reqdoor.ts rowPut; ui/inputedit.tsx commitInput). In step 2 those three cases
   pinned the refusal — "ALL AVAIL is filed on its own", a sentence that no longer exists. They are re-expressed here
   on the screen, each saying which of the four it is (the rule survives / a named ruling changed it / old data / the
   subject is gone): the named man beside the placeholder is HIS OWN switch, starting where the input's one answer puts
   him — on for a Yes, off for a No or no answer (D762) — and the crowd of an ALL AVAIL under a named man's request
   starts OFF on the input's No, each man his own switch (D753). The last describes are a second pass over what the
   doors can now make: ALL beside a named man, an unanswered input, the answer changed with switches already made, a
   named man's switch across ALL AVAIL coming and going, a published Saturday, and a man who is named AND free.

   jsdom has no layout engine: this proves the markup, the wiring and the words; what it LOOKS like is the walk. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, writeFill } from '../state/store'
import { DAYS } from '../engine/data'
import { INPUTS, inpId, idsOf } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { SCHED, signOf, dayApproved, dayCurVer, daySnapOf, dayPendingItems, dayDelta } from '../engine/publish'
import { ensureRowIds } from '../engine/rowids'
import { fillSlot } from '../engine/slots'
import { inputItemKey } from '../engine/oil'
import { oilEvidence, oilEvidenceOf, oilEarnedWork } from '../engine/oilev'
import { oilPendingFor } from '../leavewar/sync'
import { commitSetDayApproved } from '../state/sched-commit'
import { setMe, DEFAULT_ME } from '../state/auth'
import { openScheduler } from './board'
import { setOilDay } from '../state/view'
import { setOilBlanket } from './oilmode'
import { rowPut, rowTake } from './reqdoor'
import { commitInput, draftOf } from './inputedit'
import * as pops from './pops'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

let host: HTMLDivElement
let root: Root
const DSNAP = JSON.stringify(DAYS)
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel
const SAT = 5, SAT_ISO = '2026-07-18'
const CROWD = ['stiff', 'plasma']
const ITEM = inputItemKey('rq1')
const YES = { [SAT_ISO]: 0.5 }, NO = { [SAT_ISO]: 0 }

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'ad', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
  HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel
})

beforeEach(async () => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []; SCHED.dayOK = {}
  SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  ;(DAYS[SAT] as any).ground = []
  ensureRowIds(DAYS)
  setOilDay(null)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => CROWD.slice()
})
/* (a person put on a row whose input is unanswered opens the OIL question on the spot, in the input's window — put down
   here, so no case leaves a dialog standing for the next) */
afterEach(async () => { await act(async () => { setMe(DEFAULT_ME); setOilDay(null); pops.setOilAsk(null); pops.setInpEdit(null); notify() }) })

const open = async (di: number) => { await act(async () => { openScheduler(di); notify() }) }
const oilBtn = () => $('#sbBoard [data-oilmode]')
const groundRowEl = () => $$('#sbBoard .sb-panel.grnd .sb-arow.c6r')[0]
const inWin = () => ([...$('.availwin').querySelectorAll('.seat.oilpk')] as HTMLElement[])
const seatOf = (id: string) => inWin().find(s => s.dataset.oilp === id)!
/* who earns FROM THIS REQUEST — the seed Saturday carries flying and duty work of its own, so a man may earn elsewhere */
const paid = () => Object.entries(oilEarnedWork(DAYS[SAT], oilEvidence(SAT)))
  .filter(([, spans]) => (spans as any[]).some(w => String(w.item || '') === itemNow())).map(([p]) => p).sort()
const decision = (id: string) => (((DAYS[SAT] as any).oild || {}).people || {})[`${id}|${itemNow()}`]

/* a weekend Duty filed by Saber for ALL AVAIL, landed on the Saturday 0900–1200 */
const landed = (over: any = {}, row: any = {}) => {
  INPUTS.unshift({ iid: 'rq1', person: 'allavail', by: 'stiff', type: 'Duty', date: 'Jul 18', yr: 2026,
    acc: 'g', allday: false, s: 9 * 60, e: 12 * 60, remarks: '', mod: 'now', oil: YES, ...over })
  ;(DAYS[SAT] as any).ground = [{ prog: 'Duty', str: '0900', end: '1200', who: 'allavail', src: 'rq1', ...row }]
  ensureRowIds(DAYS)
}
const openWindow = async () => {
  await open(SAT)
  await click(oilBtn())
  await click(groundRowEl().querySelector('.oilcount'))
}
/* the request's row is the only one on the Saturday's Ground Programme: its name box, and its "+ add" */
const BOX = `g:${SAT}.0`, ADD = `g:${SAT}.0.+`
const rowOf = () => (DAYS[SAT] as any).ground[0]
/* the one input of a case, who is in it (in the order they joined), and who its row holds */
const rec = () => (INPUTS.find((r: any) => String(inpId(r)) === 'rq1') || INPUTS[0]) as any
/* …and the address its people's switches are kept under: `ITEM` for a fixture put in as 'rq1', its own id where a case
   FILED it through the input's writer */
const itemNow = () => inputItemKey(String(inpId(rec())))
const people = () => idsOf(rec()).map(String)
/* FILED through the input's one writer (ui/inputedit.tsx commitInput) — what its window and the picker save through:
   nothing is written onto the row, it lands from the input (D755). 0900–1200 on the Saturday. */
const filed = async (ppl: string[], type: string, oil?: Record<string, number>) => {
  await act(async () => {
    expect(commitInput(null, draftOf({ person: ppl[0], type, date: 'Jul 18', yr: 2026, allday: false, s: 9 * 60, e: 12 * 60, remarks: '' }), ppl, oil ? { oil } : undefined), 'filed').toBe(true)
    notify()
  })
  expect(INPUTS, 'ONE input').toHaveLength(1)
  expect(idsOf(rec()).map(String)).toEqual(ppl)
}
/* is the OIL question standing open in the input's window (ui/OilConfirm.tsx)? */
const questionOpen = () => !!$('.oilconf-what')
const onRow = () => [rowOf().who, ...(rowOf().more || [])].filter(Boolean).map(String)
/* A HAND ON THE ROW, THROUGH ITS DOOR (ui/reqdoor.ts — step 3 of the one-rule build: a person or a placeholder put on an
   input's row JOINS the input). What the app said is handed back. `via` — the door itself, or the store's own writer
   that goes through it (state/store.ts writeFill), so both ways in are walked. Any OIL question the add raised is left
   standing for the case to read (afterEach puts it down). */
const putOnRow = async (key: string, id: string, via: 'door' | 'store' = 'door'): Promise<string> => {
  const say = HOOKS.toast, said: string[] = []
  HOOKS.toast = (m: any) => { said.push(String(m)) }
  try {
    await act(async () => {
      if (via === 'door') expect(rowPut(key, id), 'the row\'s door').toBe('done')
      else writeFill(key, id)
      notify()
    })
  } finally { HOOKS.toast = say }
  expect(people(), `${id} is in the input`).toContain(id)
  expect(onRow(), 'and the row is a whole copy of the input (D755)').toEqual(people())
  return said.join(' | ')
}
const takeOffRow = async (id: string) => {
  const n = onRow().indexOf(id)
  expect(n, `${id} is on the row`).toBeGreaterThanOrEqual(0)
  await act(async () => { expect(rowTake(n === 0 ? BOX : `${BOX}.x${n - 1}`)).toBe('done'); notify() })
}
/* the OIL question an add raised on the spot is put down unanswered — as closing its sheet does */
const shutQuestion = async () => { await act(async () => { pops.setOilAsk(null); pops.setInpEdit(null); notify() }) }
/* the switches drawn ON THE ROW (the named people's), and one of them */
const rowSeats = () => ([...groundRowEl().querySelectorAll('.seat.oilpk')] as HTMLElement[]).filter(s => s.dataset.oilp)
const rowSeat = (id: string) => rowSeats().find(s => s.dataset.oilp === id)!

describe('the row itself — the placeholder is never a switch', () => {
  it('the ALL AVAIL puck stands in the name box with its count; it is offered no OIL switch of its own', async () => {
    landed()
    await open(SAT)
    await click(oilBtn())
    const el = groundRowEl()
    expect(el.querySelector('.puck.allavail'), 'the placeholder puck').toBeTruthy()
    expect(el.querySelector('.oilcount'), 'its count — the door to the people behind it').toBeTruthy()
    expect([...el.querySelectorAll('.seat.oilpk')].map((s: any) => s.dataset.oilp), 'no man\'s switch is drawn for the placeholder').not.toContain('allavail')
  })

  it('the row\'s name says where the switches are — not "tap a puck on this row", which has none', async () => {
    landed()
    await open(SAT)
    await click(oilBtn())
    const cell = groundRowEl().querySelector('.oilitem') as HTMLElement
    expect(cell.dataset.oilitem, 'a request offers no whole-row switch').toBeUndefined()
    expect(cell.title).toContain('follows the answer of whoever filed it')
    expect(cell.title).toContain('tap the count')
    expect(cell.title).not.toContain('tap a puck on this row')
    expect(cell.title).not.toContain('Nothing on this row can earn')
  })

  /* A NAMED MAN UNDER THE PLACEHOLDER'S ROW — CHOICE 2, A NAMED RULING CHANGED THE RULE (twice). Until 11 Oct 26 this
     read "a man the scheduler typed under the row is ON whatever the filer answered, and is his own switch" (D18, D470:
     the row's own extra, default yes). D755 and D762 ended that: whoever stands on the row is IN the input and follows
     its ONE answer. In step 2 of the build no door could stand him there, and this pinned the refusal ("filed on its
     own"). Since step 3 (D750, D753, D755; the plan §4.4 "OIL at the add", §4.7) the door lets him join, and what the
     rulings say of him is pinned ON SCREEN: he is drawn on the row as HIS OWN switch — never inert, never one of the
     men in the window — starting where the input's one answer puts him: ON for a Yes, OFF for a No or no answer, told
     whose answer it is (never "he answered No": he gave none — D762); and a tap is a decision about him alone. */
  for (const [name, oil, on, words] of [
    ['a No', NO, false, /whoever filed this Duty answered No to OIL; tap to credit him anyway/],
    ['no answer', {}, false, /the OIL question for this Duty has not been answered yet; tap to credit him/],
    ['a Yes', YES, true, /earns half a day/],
  ] as Array<[string, any, boolean, RegExp]>) {
    it(`D753, D755, D762 (was D18 / D470, then refused) — a named man put under the placeholder's row joins it and is his own switch: ${on ? 'ON' : 'OFF'} on ${name}`, async () => {
      landed({ oil })
      /* the engine's belt still refuses a RAW write to the row — the door is the one way in (the plan §4.4) */
      const was = JSON.stringify(INPUTS)
      expect(fillSlot(ADD, 'divot'), 'a raw write to its "+ add"').toBe(false)
      expect(JSON.stringify(INPUTS)).toBe(was)
      const said = await putOnRow(ADD, 'divot')
      expect(people(), 'he joined beside the placeholder — nobody was replaced').toEqual(['allavail', 'divot'])
      if (name === 'a No') expect(said, 'the add\'s own note says he is not counted (D755 (1))').toMatch(/added to .* — not counted for OIL$/)
      else expect(said).not.toMatch(/not counted for OIL/)
      /* an unanswered input asks its question on the spot, for the INPUT, of whoever added him — never otherwise */
      expect(questionOpen(), 'the OIL question, in the input\'s window').toBe(name === 'no answer')
      if (name === 'no answer') expect(String(inpId(pops.INPEDIT)), 'opened on the INPUT').toBe('rq1')
      await shutQuestion()
      await openWindow()
      expect(rowSeats().map(s => s.dataset.oilp), 'his switch is on the ROW, and it is the only man\'s switch there').toEqual(['divot'])
      expect(inWin().map(s => s.dataset.oilp).sort(), 'the window still lists the crowd — he is not one of the people behind the puck').toEqual(['plasma', 'stiff'])
      const seat = () => rowSeat('divot')
      expect(seat().classList.contains('inert'), 'a real switch').toBe(false)
      expect(seat().classList.contains(on ? 'on' : 'off'), 'he starts where the input\'s one answer puts him').toBe(true)
      expect(seat().title).toMatch(words)
      expect(seat().title, 'never his own refusal — he gave no answer of his own (D762)').not.toMatch(/answered No for|has not answered the OIL question/)
      expect(seat().dataset.oilitem, 'kept under the input\'s own address, as the crowd\'s are').toBe(ITEM)
      /* no sentence on the row, in the window or in the add's note is missing a word it was built from */
      for (const el of [...$$('#sbBoard .sb-panel.grnd [title]'), ...$$('.availwin [title]')]) expect(el.title, 'a title').not.toMatch(/undefined|NaN|\[object/)
      expect(($('.availwin').textContent || '') + said).not.toMatch(/undefined|NaN|\[object/)
      expect(paid(), 'the credit agrees with what is drawn').toEqual(on ? ['divot', 'plasma', 'stiff'] : [])
      /* a tap is the scheduler's decision about HIM, the other way from the default; the crowd is untouched */
      await click(seat().querySelector('.puck'))
      expect(decision('divot')).toBe(on ? 'deny' : 'allow')
      expect(seat().classList.contains(on ? 'off' : 'on')).toBe(true)
      expect(paid()).toEqual(on ? ['plasma', 'stiff'] : ['divot'])
      for (const s of inWin()) expect(s.classList.contains(on ? 'on' : 'off'), `${s.dataset.oilp} in the window is untouched`).toBe(true)
      expect(Object.keys(((DAYS[SAT] as any).oild || {}).people), 'nothing was written about anybody else').toEqual([`divot|${ITEM}`])
      /* and a second tap goes back to the input's answer: nothing stored */
      await click(seat().querySelector('.puck'))
      expect(decision('divot')).toBeUndefined()
      expect(paid()).toEqual(on ? ['divot', 'plasma', 'stiff'] : [])
      /* (this was once a case of its own — "a man typed under the row earns beside a No: the hint still speaks of the
         default, never of nobody". Nobody put there earns beside a No by default any more; the hint is the same.) */
      if (!on) expect($('.availwin').textContent || '').toContain('by default nobody behind it earns')
    })
  }

  /* THE SAME MAN PUT ON THROUGH THE STORE'S OWN WRITER — the armed tap's and the probe bridge's way in (state/store.ts
     writeFill → the one door). In step 2 this was the second hand `refusedOnRow` asked; it joins now. */
  it('the store\'s writer goes through the same door: he joins, and is drawn the same', async () => {
    landed({ oil: YES })
    await putOnRow(ADD, 'divot', 'store')
    expect(people()).toEqual(['allavail', 'divot'])
    await openWindow()
    expect(rowSeats().map(s => s.dataset.oilp)).toEqual(['divot'])
    expect(rowSeat('divot').classList.contains('on')).toBe(true)
  })
})

describe('walker B’s finds (9 Oct 26) — the placeholder is never a switch ANYWHERE, and a row off the programme says so', () => {
  it('no puck of the placeholder is an OIL switch on any panel of the board — the Personal Inputs echo included', async () => {
    /* seen in the walk: the request’s own Personal Inputs row drew "ALL AVAIL earns nothing yet — tap to take him off
       this event" — a switch for a puck that is nobody */
    landed()
    await open(SAT)
    await click(oilBtn())
    expect($$('[data-oilp="allavail"]'), 'no switch carries the placeholder’s id').toHaveLength(0)
    const echo = $$('.seat.oilpk').filter(s => s.querySelector('.puck.allavail'))
    for (const s of echo) {
      expect(s.classList.contains('inert'), 'its puck is drawn, never as a control').toBe(true)
      expect(s.title).toContain('the people behind it')
      expect(s.title).not.toContain('tap to take him off')
    }
  })

  /* THE ECHO, WITH A NAMED MAN BESIDE THE PLACEHOLDER — CHOICE 2 FOR THE HAND, CHOICE 1 FOR THE ECHO. Until the one-rule
     build the row's name box could hold a named man while the request stayed the placeholder's (written straight onto
     the row); in step 2 a named man put on the placeholder's own puck was refused. Since step 3 (D755, D757; the plan
     §4.4: "ALL AVAIL / ALL put anywhere on the row JOINS — never replaces anyone", and a named person put on ITS puck
     joins beside it) he joins, and the placeholder keeps its name box. THE ECHO'S RULE SURVIVES: wherever the board
     draws the request — its Ground row and its own line under Personal Inputs — the placeholder is never a switch;
     and the named man is ONE switch drawn in both places, under one address, so the two can never disagree. */
  it('D755, D757 — a named man put on the placeholder’s own puck joins beside it (nobody is replaced); on the row and on the request’s own echo the placeholder is still no switch, and his is one switch drawn twice', async () => {
    landed()
    await putOnRow(BOX, 'divot')
    expect(people(), 'the placeholder was not replaced').toEqual(['allavail', 'divot'])
    expect(rowOf().who, 'it still stands in its name box — the first to join').toBe('allavail')
    await open(SAT)
    await click(oilBtn())
    expect($$('[data-oilp="allavail"]'), 'no switch carries the placeholder’s id, anywhere').toHaveLength(0)
    const phPucks = $$('.seat.oilpk').filter(s => s.querySelector('.puck.allavail'))
    for (const s of phPucks) {
      expect(s.classList.contains('inert'), 'where its puck is drawn as an OIL seat it is never a control').toBe(true)
      expect(s.title).toContain('the people behind it')
    }
    const his = () => $$('#sbBoard [data-oilp="divot"]')
    expect(his().length, 'his switch is drawn on the Ground row AND on the request’s own line under Personal Inputs').toBeGreaterThanOrEqual(2)
    expect(new Set(his().map(s => s.dataset.oilitem)), 'one address for both').toEqual(new Set([ITEM]))
    expect(his().every(s => s.classList.contains('on')), 'both lit on the input’s Yes').toBe(true)
    /* tapped on the ECHO, the Ground row's follows — one decision */
    const echo = his().find(s => !groundRowEl().contains(s))!
    expect(echo, 'the echo’s own copy of his switch').toBeTruthy()
    await click(echo.querySelector('.puck'))
    expect(decision('divot')).toBe('deny')
    expect(his().every(s => s.classList.contains('off')), 'both dark').toBe(true)
    expect(paid(), 'he is off; the crowd is untouched').toEqual(['plasma', 'stiff'])
  })

  it('taken off the programme: its name no longer says "tap the count" — there is no count', async () => {
    INPUTS.unshift({ iid: 'rq1', person: 'allavail', by: 'stiff', type: 'Duty', date: 'Jul 18', yr: 2026, acc: 'r', allday: false, s: 540, e: 720, remarks: '', mod: 'now', oil: YES })
    await open(SAT)
    await click(oilBtn())
    const cells = $$('.oilitem').filter(c => /tap the count/.test(c.title))
    expect(cells, 'nothing on the board points at a count that is not there').toHaveLength(0)
  })
})

describe('after the filer answered NO — a tap GRANTS, a second tap takes the grant away', () => {
  it('every crowd man starts OFF, a real switch, and is told whose No it is', async () => {
    landed({ oil: NO })
    await openWindow()
    expect(inWin().map(s => s.dataset.oilp).sort()).toEqual(['plasma', 'stiff'])
    for (const s of inWin()) {
      expect(s.classList.contains('inert'), `${s.dataset.oilp} is not inert — he can be credited`).toBe(false)
      expect(s.classList.contains('off'), `${s.dataset.oilp} starts off`).toBe(true)
      expect(s.title).toContain('whoever filed this Duty answered No')
      expect(s.title).toContain('tap to credit him anyway')
      expect(s.title, 'never the words for an AVALON line').not.toContain('this kind of event earns nothing')
    }
    expect(paid()).toEqual([])
  })

  it('the first tap writes an ALLOW and he is credited; the second removes it and he is not', async () => {
    landed({ oil: NO })
    await openWindow()
    await click(seatOf('stiff').querySelector('.puck'))
    expect(decision('stiff'), 'a grant, not a refusal').toBe('allow')
    expect(seatOf('stiff').classList.contains('on')).toBe(true)
    expect(paid(), 'the credit follows the tap').toEqual(['stiff'])
    expect(seatOf('plasma').classList.contains('off'), 'the other man is untouched').toBe(true)
    await click(seatOf('stiff').querySelector('.puck'))
    expect(decision('stiff'), 'back to the filer\'s answer: nothing stored').toBeUndefined()
    expect(seatOf('stiff').classList.contains('off')).toBe(true)
    expect(paid()).toEqual([])
  })

  it('the window\'s hint says the question was answered No, and how to credit one man', async () => {
    landed({ oil: NO })
    await openWindow()
    const hint = $('.availwin').textContent || ''
    expect(hint).toContain('answered No')
    expect(hint).toContain('by default nobody behind it earns')
    expect(hint).toContain('Tap an unlit puck to credit a man; tap a lit one to stop his credit')
    expect(hint).not.toContain('Tap a puck to stop a man earning')
  })

  /* SOL'S READ OF THE CODE (9 Oct 26): the hint said "so nobody behind it earns" — true until the scheduler credits a
     man, and then it contradicted the count and the lit puck beside it. The tap's own line hid that until the window
     was closed and opened again. The hint states the DEFAULT, and its instruction is right for a mixed list. */
  for (const ph of ['allavail', 'all']) {
    it(`${ph}: No → one man credited → the window closed and reopened: the hint, the count, the lit puck and the credit agree`, async () => {
      landed({ oil: NO, person: ph }, { who: ph })
      await openWindow()
      await click(seatOf('stiff').querySelector('.puck'))
      expect(paid()).toEqual(['stiff'])
      await click($('.availwin .win-x'))
      expect(!$('.availwin') || ($('.availwin') as HTMLElement).hidden, 'closed').toBe(true)
      await click(groundRowEl().querySelector('.oilcount'))
      const text = $('.availwin').textContent || ''
      expect(seatOf('stiff').classList.contains('on'), 'he is lit').toBe(true)
      expect(text, 'the count').toContain('1 of 2')
      expect(text).toContain('by default nobody behind it earns')
      expect(text, 'never a flat "nobody earns" beside a man who does').not.toMatch(/so nobody behind it earns/)
      expect(text).toContain('tap a lit one to stop his credit')
      /* and the lit man tapped again goes back to the filer's No */
      await click(seatOf('stiff').querySelector('.puck'))
      expect(decision('stiff')).toBeUndefined()
      expect(paid()).toEqual([])
    })
  }

})

describe('with NO ANSWER yet — the same switches, and the true reason', () => {
  it('every crowd man starts off and is told the question has not been answered; a tap credits him', async () => {
    landed({ oil: {} })
    await openWindow()
    for (const s of inWin()) {
      expect(s.classList.contains('off')).toBe(true)
      expect(s.title).toContain('has not been answered yet')
      expect(s.title).toContain('tap to credit him')
    }
    expect($('.availwin').textContent || '').toContain('has not been answered')
    expect($('.availwin').textContent || '').toContain('by default nobody behind it earns')
    await click(seatOf('plasma').querySelector('.puck'))
    expect(decision('plasma')).toBe('allow')
    expect(paid()).toEqual(['plasma'])
  })
})

describe('after the filer answered YES — a tap refuses, a second tap clears it', () => {
  it('every crowd man starts ON; a tap writes a DENY; a second tap removes it', async () => {
    landed({ oil: YES })
    await openWindow()
    for (const s of inWin()) expect(s.classList.contains('on'), `${s.dataset.oilp} starts on`).toBe(true)
    expect(paid()).toEqual(['plasma', 'stiff'])
    /* read before any tap: a tapped man's own line then takes the hint's place */
    expect($('.availwin').textContent || '').toContain('Tap a puck to stop a man earning')
    await click(seatOf('plasma').querySelector('.puck'))
    expect(decision('plasma')).toBe('deny')
    expect(paid()).toEqual(['stiff'])
    await click(seatOf('plasma').querySelector('.puck'))
    expect(decision('plasma')).toBeUndefined()
    expect(paid()).toEqual(['plasma', 'stiff'])
  })

  it('a scheduler\'s switch outlives a fresh answer from the filer', async () => {
    landed({ oil: NO })
    await openWindow()
    await click(seatOf('stiff').querySelector('.puck'))
    expect(decision('stiff')).toBe('allow')
    await act(async () => { INPUTS[0].oil = YES; notify() })
    expect(decision('stiff'), 'the scheduler\'s own word stays on the day').toBe('allow')
    expect(paid()).toEqual(['plasma', 'stiff'])
  })
})

describe('under the day blanket nothing is written', () => {
  it('a tap on a crowd man is refused and stores no decision', async () => {
    landed({ oil: NO })
    await openWindow()
    await act(async () => { setOilBlanket(SAT, true); notify() })
    expect(inWin().length).toBe(2)
    for (const s of inWin()) {
      expect(s.classList.contains('inert'), 'under a mask the puck is not a control').toBe(true)
      await click(s.querySelector('.puck'))
    }
    expect(((DAYS[SAT] as any).oild || {}).people, 'no decision about any man was stored').toBeUndefined()
    expect(paid()).toEqual([])
  })
})

/* A NAMED MAN'S OWN REQUEST, AND ALL AVAIL PUT UNDER IT. Until 11 Oct 26 this pinned D46 — a named man's request with
   ALL AVAIL dropped under it "reads exactly as before": "the crowd starts ON over the holder's own No, with the old
   words". D762 and D753 ended both halves: an input has ONE OIL answer, for everyone in it and for the men behind its
   placeholder, so a crowd never again earns over the input's No by default. In step 2 of the build no door stood ALL
   AVAIL beside a named man, and this pinned the refusal; step 3 opened the door (D750, D755). */
/* Ranger's own Training on the Saturday 0900–1200, as his filing left it */
const ownRequest = (oil: any) => {
  INPUTS.unshift({ iid: 'rq1', person: 'bane', type: 'Training', date: 'Jul 18', yr: 2026, acc: 'g', allday: false,
    s: 9 * 60, e: 12 * 60, remarks: '', mod: 'now', oil })
  ;(DAYS[SAT] as any).ground = [{ prog: 'Training', str: '0900', end: '1200', who: 'bane', src: 'rq1' }]
  ensureRowIds(DAYS)
}
describe('THE CONTROL — a named man\'s own request, with nobody else in it: his answer in his own words, and no counter (D762 reading 1)', () => {
  /* CHOICE 1 — THE RULE SURVIVES (this half of the old control was true before step 3 and is true after it): an input of
     ONE person is his own — its switch is the puck on its row, the words are HIS ("answered No", never "whoever filed
     it"), and with no placeholder in it there is no counter and no window. */
  it('no placeholder in it: no counter, his own puck is the switch, and it says HE answered No', async () => {
    ownRequest(NO)
    await open(SAT)
    await click(oilBtn())
    expect(groundRowEl().querySelector('.oilcount'), 'no placeholder on the row, so no counter and no window').toBeNull()
    expect(groundRowEl().querySelector('.puck.allavail')).toBeNull()
    const cell = groundRowEl().querySelector('.oilitem') as HTMLElement
    expect(cell.title).toContain('tap a puck on this row')
    const own = rowSeat('bane')
    expect(own, 'his own puck is the switch').toBeTruthy()
    expect(own.classList.contains('off'), 'his own No stands').toBe(true)
    expect(own.title).toContain('answered No for this Training')
    expect(own.title, 'never the words for an input of several').not.toContain('whoever filed')
    expect(paid(), 'and nobody earns from it').toEqual([])
  })
})

describe('ALL AVAIL put under a named man\'s request joins it, and its crowd follows the input\'s ONE answer (D753, D755, D762 — was D46, then refused)', () => {
  /* CHOICE 2 — A NAMED RULING CHANGED THE RULE. D46 (22 Sep 26): "the placeholder is allowed on an accepted request row
     and credits by default" — the crowd ON over the man's own No. D755 amended it: "a placeholder on a request's row is
     one of the input's people — it follows the input's OIL answer (D753)". So on the input's No the crowd starts OFF,
     each man his own switch in the window the counter opens, told whose No it is; nobody earns; and a tap credits one
     man and nobody else. */
  it('on the input\'s No: the counter appears, every man behind it starts OFF as a real switch, nobody earns — and the add\'s note says so', async () => {
    ownRequest(NO)
    const said = await putOnRow(ADD, 'allavail')
    expect(people(), 'it joined him — it replaced nobody').toEqual(['bane', 'allavail'])
    expect(said).toMatch(/^ALL AVAIL added to .* — not counted for OIL$/)
    expect(questionOpen(), 'the input is answered: no question is asked').toBe(false)
    await open(SAT)
    await click(oilBtn())
    const el = groundRowEl()
    expect(el.querySelector('.puck.allavail'), 'the placeholder stands on his row').toBeTruthy()
    expect(el.querySelector('.oilcount'), 'with its counter — the door to the people behind it').toBeTruthy()
    expect(rowSeats().map(s => s.dataset.oilp), 'the requester keeps his own puck on the row; the placeholder is no man\'s switch').toEqual(['bane'])
    expect(rowSeat('bane').classList.contains('off'), 'the input\'s No is his too').toBe(true)
    await click(el.querySelector('.oilcount'))
    expect(inWin().map(s => s.dataset.oilp).sort(), 'the men behind it — never the man named in the input').toEqual(['plasma', 'stiff'])
    for (const s of inWin()) {
      expect(s.classList.contains('inert'), `${s.dataset.oilp} is a real switch`).toBe(false)
      expect(s.classList.contains('off'), `${s.dataset.oilp} starts OFF — the crowd no longer earns over the input's No (D753)`).toBe(true)
      expect(s.title).toContain('whoever filed this Training answered No')
      expect(s.title).toContain('tap to credit him anyway')
    }
    expect($('.availwin').textContent || '').toContain('by default nobody behind it earns')
    expect(paid(), 'nobody earns from it').toEqual([])
    /* one man of the crowd credited by the scheduler: he earns, and only he — the requester's No is untouched */
    await click(seatOf('plasma').querySelector('.puck'))
    expect(decision('plasma')).toBe('allow')
    expect(paid()).toEqual(['plasma'])
    expect(rowSeat('bane').classList.contains('off'), 'the requester is untouched by a tap in the window').toBe(true)
    expect(decision('bane')).toBeUndefined()
  })

  it('on the input\'s Yes: the requester and every man behind it are ON; the placeholder taken off again leaves his request as it was', async () => {
    ownRequest(YES)
    const said = await putOnRow(ADD, 'allavail')
    expect(said).not.toMatch(/not counted/)
    await openWindow()
    expect(rowSeat('bane').classList.contains('on')).toBe(true)
    for (const s of inWin()) expect(s.classList.contains('on'), `${s.dataset.oilp} follows the input's Yes`).toBe(true)
    expect(paid()).toEqual(['bane', 'plasma', 'stiff'])
    await takeOffRow('allavail')
    expect(people()).toEqual(['bane'])
    expect(groundRowEl().querySelector('.oilcount'), 'no placeholder, no counter').toBeNull()
    expect(paid(), 'only the man named in it earns now').toEqual(['bane'])
    expect(rowSeat('bane').title, 'and it is his own input again — the words are his').toContain('earns')
  })
})

/* ---- THE SECOND PASS — what the doors can now make, and the builder's own tests do not walk on screen ---------------- */

describe('ALL (not ALL AVAIL) beside a named man reads exactly the same (D753: "ALL AVAIL or ALL")', () => {
  for (const [name, oil, on] of [['Yes', YES, true], ['No', NO, false]] as Array<[string, any, boolean]>) {
    it(`filed for Ranger and ALL in one go, the answer ${name}: his switch on the row, the men behind ALL in the window, all ${on ? 'ON' : 'OFF'}`, async () => {
      await filed(['bane', 'all'], 'Duty', oil)
      await openWindow()
      expect(groundRowEl().querySelector('.puck[data-person="all"]'), 'the ALL puck stands on the row').toBeTruthy()
      expect(groundRowEl().querySelector('.oilcount'), 'with its counter').toBeTruthy()
      expect($$('[data-oilp="all"]'), 'never a switch').toHaveLength(0)
      expect(rowSeats().map(s => s.dataset.oilp)).toEqual(['bane'])
      expect(rowSeat('bane').classList.contains(on ? 'on' : 'off')).toBe(true)
      expect(inWin().map(s => s.dataset.oilp).sort()).toEqual(['plasma', 'stiff'])
      for (const s of inWin()) expect(s.classList.contains(on ? 'on' : 'off'), String(s.dataset.oilp)).toBe(true)
      expect(paid()).toEqual(on ? ['bane', 'plasma', 'stiff'] : [])
      /* …and ALL AVAIL is refused beside it — an input takes one of the two (D753) */
      let took: any
      await act(async () => { took = rowPut(ADD, 'allavail'); notify() })
      expect(took).toBe('refused')
      expect(people()).toEqual(['bane', 'all'])
    })
  }
})

describe('an UNANSWERED input that holds a named man and ALL AVAIL: nobody earns, and the question is its filer\'s alone (D753 reading 1, D762 reading 3, D711 (4))', () => {
  it('nobody is ON; the add asked the question on the spot; shut unanswered it waits on the filer\'s bell — never on the bell of the man who is merely in it', async () => {
    /* Saber filed it for ALL AVAIL, and it is Saber — a scheduler — who drags a named man onto its row */
    setMe('stiff')
    landed({ oil: {}, by: 'stiff' })
    await putOnRow(ADD, 'divot')
    expect(questionOpen(), 'asked at once, for the INPUT, of whoever added him (the plan §4.4)').toBe(true)
    expect(String(inpId(pops.INPEDIT))).toBe('rq1')
    await shutQuestion()
    expect(questionOpen(), 'the sheet is shut').toBe(false)
    expect(rec().oil || {}, 'closing it unanswered leaves the input unanswered').toEqual({})
    await openWindow()
    expect(rowSeat('divot').classList.contains('off')).toBe(true)
    for (const s of inWin()) expect(s.classList.contains('off'), String(s.dataset.oilp)).toBe(true)
    expect(paid()).toEqual([])
    expect($('.availwin').textContent || '').toContain('has not been answered')
    /* each bell is read as its own man signed in */
    expect(oilPendingFor('stiff').map(q => q.iid), 'whoever filed it is asked').toContain('rq1')
    setMe('divot')
    expect(oilPendingFor('divot').map(q => q.iid), 'the man named in it is not — he gives no answer of his own (D762)').not.toContain('rq1')
    setMe('plasma')
    expect(oilPendingFor('plasma').map(q => q.iid), 'nor a man behind the puck (D702)').not.toContain('rq1')
  })
})

describe('the input\'s answer changed with switches already made — the scheduler\'s own word stays on the day (D762: "the scheduler\'s refusal on the day still wins")', () => {
  it('Yes, a named man and a crowd man switched OFF, then the answer becomes No: nobody earns, and the two switches are still the scheduler\'s', async () => {
    landed({ oil: YES })
    await putOnRow(ADD, 'divot')
    await openWindow()
    await click(rowSeat('divot').querySelector('.puck'))
    await click(seatOf('plasma').querySelector('.puck'))
    expect([decision('divot'), decision('plasma')]).toEqual(['deny', 'deny'])
    expect(paid()).toEqual(['stiff'])
    /* the answer changed by the input's own writer — whoever filed it, or an admin (D762) */
    await act(async () => { expect(commitInput(rec(), draftOf(rec()), people(), { oil: NO })).toBe(true); notify() })
    expect(rec().oil).toEqual(NO)
    expect(paid(), 'the No is for everyone').toEqual([])
    expect([decision('divot'), decision('plasma')], 'a refusal is not rewritten by a new answer').toEqual(['deny', 'deny'])
    for (const id of ['divot']) expect(rowSeat(id).classList.contains('off')).toBe(true)
    for (const s of inWin()) expect(s.classList.contains('off'), String(s.dataset.oilp)).toBe(true)
    /* …and back to Yes: the men he refused stay refused; everyone else follows the Yes */
    await act(async () => { expect(commitInput(rec(), draftOf(rec()), people(), { oil: YES })).toBe(true); notify() })
    expect(paid()).toEqual(['stiff'])
    expect(rowSeat('divot').title).toContain('was taken off this event')
  })

  it('No, one named man and one crowd man CREDITED, then the answer becomes Yes: everyone earns — once each', async () => {
    landed({ oil: NO })
    await putOnRow(ADD, 'divot')
    await openWindow()
    await click(rowSeat('divot').querySelector('.puck'))
    await click(seatOf('stiff').querySelector('.puck'))
    expect(paid()).toEqual(['divot', 'stiff'])
    await act(async () => { expect(commitInput(rec(), draftOf(rec()), people(), { oil: YES })).toBe(true); notify() })
    expect(paid()).toEqual(['divot', 'plasma', 'stiff'])
    const work = oilEarnedWork(DAYS[SAT], oilEvidence(SAT))
    for (const p of ['divot', 'plasma', 'stiff']) expect((work[p] || []).filter((w: any) => String(w.item) === ITEM), `${p}: one span from it`).toHaveLength(1)
  })
})

describe('a named man\'s switch is his own — ALL AVAIL coming or going beside him does not move it (the plan §4.7: "nobody\'s switch moves when someone ELSE joins or leaves")', () => {
  /* he is deliberately FREE that day too: were his refusal lost when the placeholder arrived, he would earn as one of
     its crowd */
  beforeEach(() => { HOOKS.oilSentinel = () => ['bane', ...CROWD] })
  it('Ranger switched OFF on his own request; ALL AVAIL dropped under it, then taken off again: he is still off, each time', async () => {
    ownRequest(YES)
    await open(SAT)
    await click(oilBtn())
    await click(rowSeat('bane').querySelector('.puck'))
    expect(decision('bane')).toBe('deny')
    await putOnRow(ADD, 'allavail')
    expect(decision('bane'), 'the stored word is untouched').toBe('deny')
    expect(rowSeat('bane').classList.contains('off'), 'still off beside the placeholder').toBe(true)
    expect(paid(), 'the crowd follows the Yes; he does not earn — as himself or as one of the crowd').toEqual(['plasma', 'stiff'])
    await takeOffRow('allavail')
    expect(rowSeat('bane').classList.contains('off'), 'and still off when it has gone').toBe(true)
    expect(paid()).toEqual([])
  })

  it('…and CREDITED over the input\'s No, the same: the allow stays his through both', async () => {
    ownRequest(NO)
    await open(SAT)
    await click(oilBtn())
    await click(rowSeat('bane').querySelector('.puck'))
    expect(decision('bane')).toBe('allow')
    await putOnRow(ADD, 'allavail')
    expect(rowSeat('bane').classList.contains('on')).toBe(true)
    expect(paid(), 'he alone — the crowd follows the No').toEqual(['bane'])
    await takeOffRow('allavail')
    expect(rowSeat('bane').classList.contains('on')).toBe(true)
    expect(paid()).toEqual(['bane'])
  })
})

describe('a man who is NAMED in the input and is also free that day is credited ONCE, as himself (the plan §4.7, T3)', () => {
  it('a man of the crowd put on the row by name leaves the window and stands on the row: one switch, one credit', async () => {
    landed({ oil: YES })
    await openWindow()
    expect(inWin().map(s => s.dataset.oilp).sort()).toEqual(['plasma', 'stiff'])
    await putOnRow(ADD, 'stiff')
    expect(rowSeats().map(s => s.dataset.oilp), 'he is on the row as himself').toEqual(['stiff'])
    expect(inWin().map(s => s.dataset.oilp), 'and no longer one of the people behind the puck').toEqual(['plasma'])
    expect($$('#sbBoard .sb-panel.grnd [data-oilp="stiff"]'), 'one switch for him on the Ground Programme').toHaveLength(1)
    expect(oilEvidence(SAT).sent[ITEM], 'the crowd written down never holds a named man').toEqual(['plasma'])
    const work = oilEarnedWork(DAYS[SAT], oilEvidence(SAT))
    expect((work.stiff || []).filter((w: any) => String(w.item) === ITEM), 'one span, not two').toHaveLength(1)
    expect(($('.availwin').textContent || ''), 'the window counts the crowd alone').toContain('1 of 1')
    /* switched off on the row he is OFF — not still earning as one of the crowd */
    await click(rowSeat('stiff').querySelector('.puck'))
    expect(paid()).toEqual(['plasma'])
  })
})

describe('a PUBLISHED Saturday keeps the OIL it went out with when ALL AVAIL is added afterwards (D44, D45, D142)', () => {
  const publish = async () => {
    await act(async () => {
      const g = signOf(SAT); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
      commitSetDayApproved(SAT, true); notify()
    })
    expect(dayApproved(SAT), 'the Saturday is published').toBe(true)
  }
  /* who earns from this input on the ISSUED face — what the Leave War credits (leavewar/sync.ts reads the snapshot) */
  const issuedPaid = () => {
    const snap: any = daySnapOf(SAT, dayCurVer(SAT)), d = snap.d
    return Object.entries(oilEarnedWork(d, oilEvidenceOf(SAT, d)))
      .filter(([, spans]) => (spans as any[]).some(w => String(w.item || '') === itemNow())).map(([p]) => p).sort()
  }
  it('Ranger\'s request went out answered Yes; ALL AVAIL dropped on its row since: a change WAITING — the issued face still credits him alone', async () => {
    /* filed through the input's own writer, so the row that goes out is the app's own (a hand-written row would be
       re-made after publishing and read as a change of its own) */
    await filed(['bane'], 'Training', YES)
    await publish()
    expect(dayPendingItems(SAT), 'nothing waiting').toHaveLength(0)
    expect(issuedPaid()).toEqual(['bane'])
    await putOnRow(ADD, 'allavail')
    expect(dayPendingItems(SAT).length, 'it reads as a change waiting to go out').toBeGreaterThan(0)
    expect(dayDelta(SAT).length).toBeGreaterThan(0)
    expect(issuedPaid(), 'the issued day keeps the people it went out with — the crowd earns nothing until it goes out').toEqual(['bane'])
    expect(paid(), 'the working copy shows what WILL go out').toEqual(['bane', 'plasma', 'stiff'])
    const issuedRow = ((daySnapOf(SAT, dayCurVer(SAT)) as any).d.ground || []).find((g: any) => g && String(g.src) === String(inpId(rec())))
    expect([issuedRow.who, issuedRow.more || []], 'and its row, as issued, holds him alone').toEqual(['bane', []])
    /* taken off again, the day is back to what was published: nothing waiting (D98) */
    await takeOffRow('allavail')
    expect(dayPendingItems(SAT)).toHaveLength(0)
  })
})
