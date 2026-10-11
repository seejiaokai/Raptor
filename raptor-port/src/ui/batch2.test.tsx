// @vitest-environment jsdom
/* THE SECOND BATCH OF THE INPUTS PAGES (owner D730, D731 — 10 Oct 26: "Yes to all"; `OUTSTANDING.md` `[SEEN-BATCH-2]`).
   Ten small faults that needed no choice of his (list A) and his answers to the small choices (list B, the pictures
   page docs/mock/batch2-choices.html), built as ONE batch. Each piece was a failing test here first.

   What is pinned HERE is what jsdom can see — a sentence, a button that is or is not drawn, a key that is taken. What
   only a real browser can see has its own tests in e2e/inputs-batch2.spec.ts: where the passing note stands on a
   phone (B1), the size of the List's calendar days (B11), the viewer's pinned buttons (B10), Enter not reaching the
   button behind (A2), Tab reaching the row's chips (A4), the question raised in front (A1).

     A1  "Unsaved changes" is asked by the window IN FRONT          A6  Escape closes the List's dates calendar
     A2  Enter in Remarks / Title is taken by the save               A7  a reader's OIL line draws no dead "Change…"
     A3  a reader of another man's medical input sees no yellow box  A8  a group's OIL question is headed "Ranger +1"
     A4  the row's paperclip and OIL chips are buttons               A10 a clash note goes when the record comes back
     A5  an OIL day in another year carries its year
     B2  D731 (2) a day whose inputs a filter hides says so, with "Clear filters"
     B3  D731 (3) the List's dates calendar stays open after its end date; a press outside closes it
     B4  D731 (4) a shared input's OIL line counts its people where their answers differ
     B7  D731 (7) an OIL answer for a day the input no longer covers stays on the record
     B8  D731 (8) the filer, with the members' switch off, is told the switch is off
     B9  D731 (9) Escape while a note is typed leaves the note box only   ·   D732: the day's title box, the same
   B1's and A9's own files: ui/toastplace.test.ts, ui/quals.test.tsx; B5's: state/reqorphan.test.ts. */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { DocViewer } from './DocViewer'
import { setPage as goPage } from '../state/view'
import { InputEditor, askOilIfPending, commitInput, draftOf, oilAnswered, oilDayLabel, oilSummary, removeInput, FILING_OFF } from './inputedit'
import { commitChipMove } from './caldrag'
import { initStore, notify, setSession, undo, writeInputs } from '../state/store'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { setMe } from '../state/auth'
import { INPUTS, idsOf } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS, storeBackend } from '../engine/hooks'
import { PLANPUCKS, DAYRMK, addPlanPuck, setDayRemark } from '../state/plan'
import { setMembersFile } from '../state/memberfile'
import { docAdd } from '../state/docs'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { oilAskPlan } from '../leavewar/sync'
import { setOilPlan } from '../state/inputgate-hook'
import { _resetFloatWins } from './FloatWindow'
import { frontWin } from './floatwin'
import { setInpEdit } from './pops'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(INPUTS)
const said: string[] = []
const realToast = HOOKS.toast
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const tid = (id: string) => $(`#inpEditPop [data-testid="${id}"]`) || $(`[data-testid="${id}"]`)
const cs = (id: any) => PEOPLE[id].cs as string
const crew = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers)
/* who is signed in: the admin Saber (`stiff`) or the member Ranger (`bane`); the others are neither */
const admin = 'stiff', member = 'bane'
const others = () => crew().filter(id => id !== admin && id !== member)
const live = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
const of = (grp: string) => INPUTS.filter((r: any) => r.grp === grp) as any[]
const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
const type = async (sel: string, v: string) => {
  const el = $(sel) as HTMLInputElement
  expect(el, sel).toBeTruthy()
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })) })
}
const choose = async (sel: string, v: string) => {
  const el = $(sel) as HTMLSelectElement
  expect(el, sel).toBeTruthy()
  await act(async () => { el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })) })
}
/* a key pressed on an element (or on the page, where nothing has the keyboard); returns the event, to ask what took it */
const key = async (el: Element | Document, k: string) => {
  const e = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
  await act(async () => { el.dispatchEvent(e) })
  return e
}
let n = 0
const SAT = { type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439 }     // 17 Oct 26 is a Saturday: the OIL question is asked
const shared = async (people: string[], over: any = {}, by: string = admin) => {
  const grp = 'gB' + (++n)
  const rows = people.map((p, i) => ({ iid: `${grp}-${i}`, person: p, type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660,
    remarks: 'brief', mod: '2026-09-01', grp, grpBy: by, by, at: '2026-09-01T08:00:00.000Z', ...over }))
  await act(async () => { writeInputs(() => { INPUTS.push(...rows) }); notify() })
  return { grp, rows: rows.map(r => live(r.iid)) }
}
/* A SHARED INPUT AS IT IS KEPT SINCE THE ONE-RULE BUILD (owner D756, D759 — `[ALL-AVAIL-AS-MEMBER]` step 2): ONE record
   with the list of its people, one filer, one OIL answer for everyone in it (D762). `shared`, above, makes the OLD
   shape — one record a man, tied by a group id — which is read for ever as so many ONE-PERSON inputs (D759 reading 10:
   stored data only, D56); it is kept for the cases that say they are about old data. (The old count line,
   `oilSummaryOf`, went with the dead code — step 6 of that build: its cases are re-expressed in D731 (4)'s block.) */
const sharedRec = async (people: string[], over: any = {}, by: string = admin) => {
  const at = new Date(2026, 8, 1, 8, 0).getTime()
  const rec: any = { iid: 'gR' + (++n), type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'brief', mod: '2026-09-01', by, at, ...over }
  rec.people = people.map(p => ({ p, by: rec.by, at }))
  await act(async () => { writeInputs(() => { INPUTS.push(rec) }); notify() })
  return live(rec.iid)
}
/* the first of some people A to Z by callsign — the name an input of several leads with on every screen (D721, D727) */
const az1 = (ids: string[]) => ids.map(cs).sort((a, b) => a.localeCompare(b))[0]
const single = async (over: any = {}) => {
  const row = { iid: 'bs' + (++n), person: others()[0], type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'solo', mod: '2026-09-01', ...over }
  await act(async () => { writeInputs(() => { INPUTS.push(row) }); notify() })
  return live(row.iid)
}
const openOn = async (r: any) => act(async () => { setInpEdit(live(r.iid)); notify() })
const closeWin = async () => act(async () => { setInpEdit(null); notify() })
const as = async (who: 'admin' | 'member') => act(async () => {
  if (who === 'admin') { setSession({ user: admin, role: 'admin' }); setMe(admin) } else { setSession({ user: member, role: 'main' }); setMe(member) }
  notify()
})
const toList = async () => {
  await act(async () => { setInpView('table'); notify() })
  if (!$('#inRangePop')) await click($('#inRangeBtn'))
  await click($('#inRangeAll'))
}
const openDay = async (iso: string) => act(async () => { $(`[data-icday="${iso}"]`)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })) })
const tr = (r: any) => $(`#inBody tr[data-iid="${r.iid}"]`)

beforeEach(async () => {
  INPUTS.splice(0, INPUTS.length)
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore(); INPUTS.splice(0, INPUTS.length)
  setSession({ user: admin, role: 'admin' }); setMe(admin)
  lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('cal'); setCalMonth({ y: 2026, m: 10 })
  said.length = 0; HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
  await act(async () => { setCalMonth({ y: 2026, m: 10 }); notify() })
})
afterEach(async () => {
  await act(async () => { root.unmount(); setInpEdit(null) })
  HOOKS.toast = realToast
  host.remove(); _resetFloatWins(); INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
})

/* A1 — `[TITLE-CHECK-SEEN]` 4. A window does not block the page (D641), so a card of the opened day can be pressed while
   an input's window holds unsaved work. The press brings the DAY's window to the front; the input's window then asks
   "lose them?" — and asked it from behind. On a phone the day's window is nearly the whole screen: nobody saw the
   question until the day was closed. */
describe('A1 — the "Unsaved changes" question is asked by the window in front', () => {
  it('a card pressed in the opened day, over an input with unsaved remarks: the input’s window comes to the front with its question', async () => {
    const a = await single({ date: 'Oct 20', remarks: 'first' }), b = await single({ person: others()[1], date: 'Oct 20', remarks: 'second' })
    await openDay('2026-10-20')
    await click(tid('idy-row-' + a.iid)!.querySelector('[data-testid="idy-open"]'))
    await type('#inpEditRmk', 'typed, not saved')
    expect(frontWin()).toBe('inputedit')
    /* the press that reaches the other card lands on the day's window first — which takes the front, as any window does */
    await act(async () => { tid('win-inputsday')!.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true })) })
    expect(frontWin(), 'the day’s window is in front after a press on it').toBe('inputsday')
    await click(tid('idy-row-' + b.iid)!.querySelector('[data-testid="idy-open"]'))
    expect(tid('inped-swap'), 'the question is up').toBeTruthy()
    expect(frontWin(), 'and the window that asks it is in front').toBe('inputedit')
    expect(tid('win-inputedit')!.className).toMatch(/\bfront\b/)
    expect(($('#inpEditRmk') as HTMLInputElement).value, 'nothing he typed is lost').toBe('typed, not saved')
  })
  it('THE CONTROL — with nothing unsaved the other input simply opens, and no question is asked', async () => {
    const a = await single({ date: 'Oct 20' }), b = await single({ person: others()[1], date: 'Oct 20', remarks: 'second' })
    await openDay('2026-10-20')
    await click(tid('idy-row-' + a.iid)!.querySelector('[data-testid="idy-open"]'))
    await click(tid('idy-row-' + b.iid)!.querySelector('[data-testid="idy-open"]'))
    expect(tid('inped-swap')).toBeNull()
    expect(($('#inpEditRmk') as HTMLInputElement).value).toBe('second')
  })
})

/* A2 — `[TITLE-CHECK-SEEN]` 5. Enter in Remarks saves and closes the window; the keyboard goes back to the button that
   opened it ("+ Input"), and the SAME key press, still in flight, pressed that button: a blank "New input" opened
   again. The save takes the key (the browser's own half of this is e2e/inputs-batch2.spec.ts). */
describe('A2 — Enter in a new input’s Remarks or Title is the save’s alone', () => {
  for (const box of ['#inpEditRmk', '#inpEditOwnTitle']) {
    it(`${box}: the key press is taken — nothing behind the window receives it`, async () => {
      const before = INPUTS.length
      await act(async () => { setInpEdit({ _new: true, _calendar: true, _ctx: 'i', person: admin, type: 'Meeting', date: 'Oct 13', allday: false, s: 600, e: 660 }); notify() })
      await type('#inpEditRmk', 'weekly')
      const e = await key($(box)!, 'Enter')
      expect(INPUTS.length, 'saved').toBe(before + 1)
      expect(e.defaultPrevented, 'the browser is told the key is used up').toBe(true)
      expect(tid('win-inputedit'), 'and the window is closed').toBeNull()
    })
  }
})

/* Astra's scenario 29 (10 Oct 26): where the save must first ask, Enter reaches the question and no further */
describe('A2 — Enter where the save must first ask a question', () => {
  it('a weekend duty: Enter in Remarks opens the OIL question — unanswered, nothing saved, the key used up', async () => {
    const before = INPUTS.length
    await act(async () => { setInpEdit({ _new: true, _calendar: true, _ctx: 'i', person: admin, type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439 }); notify() })
    const e = await key($('#inpEditRmk')!, 'Enter')
    expect($$('[data-testid="oilconf"]')).toHaveLength(1)
    expect(($('[data-testid="oilconf-save"]') as HTMLButtonElement).disabled, 'no answer was given by the key press').toBe(true)
    expect(INPUTS.length).toBe(before)
    expect(e.defaultPrevented).toBe(true)
  })
  it('no date picked: Enter is refused in words, the window stays, nothing is saved', async () => {
    const before = INPUTS.length
    await act(async () => { setInpEdit({ _new: true, _calendar: true, _ctx: 'i', person: admin, type: 'Meeting', allday: false, s: 600, e: 660 }); notify() })
    said.length = 0
    await key($('#inpEditRmk')!, 'Enter')
    expect(said).toEqual(['Pick a start date on the calendar first'])
    expect(tid('win-inputedit')).toBeTruthy()
    expect(INPUTS.length).toBe(before)
  })
})

/* A3 — `[CARD-CHECK-SEEN]` 4. The people picker says why the people picked cannot be filed and offers one press to put
   it right. In a window its reader cannot change, nothing can be picked: the yellow box told a member "You can file a
   medical entry only for yourself" about another man's entry he was only reading. */
describe('A3 — a reader of another man’s medical input is not told how to file one', () => {
  it('a member opens another man’s ATT C: the form is read only, and the picker’s yellow box is not drawn', async () => {
    const r = await single({ type: 'ATT C', allday: true, remarks: 'flu' })
    await as('member'); await openOn(r)
    expect(tid('inped-ro'), 'read only').toBeTruthy()
    expect(tid('pp-why')).toBeNull()
  })
  it('THE CONTROL — where he CAN pick, the box still says it: a member’s new medical input with another man picked', async () => {
    await as('member')
    await act(async () => { setInpEdit({ _new: true, _calendar: true, _ctx: 'i', person: others()[0], type: 'ATT C', date: 'Oct 13', allday: true }); notify() })
    expect(tid('pp-why')!.textContent).toMatch(/only for yourself/)
  })
})

/* A4 — `[CARD-CHECK-SEEN]` 6. The row's Name became a button with D718; the paperclip and the OIL chips beside it were
   still <span>s — a Tab never reached them, and a screen reader met nothing. */
describe('A4 — the desktop row’s paperclip and OIL chips are buttons', () => {
  it('an answered weekend duty: its OIL chip is a button, and opens the question', async () => {
    const r = await single({ ...SAT, oil: { '2026-10-17': 1 } })
    await toList()
    const chip = tr(r)!.querySelector('[data-oilrev]') as HTMLElement
    expect(chip.tagName).toBe('BUTTON')
    expect(chip.getAttribute('type')).toBe('button')
    expect(chip.getAttribute('aria-label')).toBe('Change the OIL decision')
    await click(chip)
    expect($$('[data-testid="oilconf"]')).toHaveLength(1)
    expect(tid('win-inputedit'), 'the chip does its own work — the row does not open').toBeNull()
  })
  it('an unanswered one: "OIL?" is a button too', async () => {
    const r = await single({ ...SAT })
    await toList()
    const chip = tr(r)!.querySelector('[data-oilask]') as HTMLElement
    expect(chip.tagName).toBe('BUTTON')
    expect(chip.textContent).toBe('OIL?')
  })
  it('a medical input with a document: its paperclip is a button, and opens the viewer and not the row', async () => {
    const { id } = docAdd(new File(['x'], 'cert.png', { type: 'image/png' }))
    const r = await single({ type: 'ATT C', allday: true, docIds: [id] })
    await toList()
    const clip = tr(r)!.querySelector('.rclip') as HTMLElement
    expect(clip.tagName).toBe('BUTTON')
    expect(clip.getAttribute('aria-label')).toBe('View the document')
    await click(clip)
    expect(tid('win-inputedit')).toBeNull()
  })
})

/* A5 — `[CARD-CHECK-SEEN]` 8. Every label of a date outside the year in hand says its year (the List's day headings, an
   input's "till 1 Jan 2027"); the OIL question and its lines said "9 Jan". One label for every place an OIL day is
   named: the question's heading, the window's two "not answered yet" lines, the row's "OIL?" chip. */
describe('A5 — an OIL day in another year carries its year', () => {
  it('the label itself: this year’s day is bare, another year’s says the year', () => {
    expect(oilDayLabel('2026-10-17')).toBe('17 Oct')
    expect(oilDayLabel('2027-01-09')).toBe('9 Jan 2027')
  })
  it('a duty on Saturday 9 Jan 2027, unanswered: the window’s line, the question and the row’s chip all say 2027', async () => {
    const r = await single({ type: 'Duty', date: 'Jan 9', yr: 2027, allday: true, s: 0, e: 1439 })
    await openOn(r)
    expect(tid('oil-unanswered')!.textContent).toMatch(/Not answered yet — 9 Jan 2027/)
    await click(tid('oil-answer'))
    expect($('[data-testid="oilconf"] .upconf-h')!.textContent).toMatch(/9 Jan 2027/)
    await click($('[data-testid="oilconf"] .abtn.ghost'))
    await closeWin(); await toList()
    expect((tr(r)!.querySelector('[data-oilask]') as HTMLElement).title).toMatch(/9 Jan 2027/)
  })
  it('THE CONTROL — a day of this year is named as before', async () => {
    const r = await single({ ...SAT })
    await openOn(r)
    expect(tid('oil-unanswered')!.querySelector('.inped-oilsum')!.textContent).toBe('Not answered yet — 17 Oct')
  })
})

/* A6 and D731 (3) — the List's dates calendar. His answer: it STAYS OPEN after its end date is tapped — "you can see the
   range you chose and still press a quick button" — and a press outside closes it. Escape closes it, as every pop-up
   does (`[CARD-CHECK-SEEN]` 9): it did nothing. */
describe('A6, D731 (3) — the List’s dates calendar: Escape and a press outside close it; a second date does not', () => {
  const openPop = async () => { await toList(); await click($('#inRangeBtn')); expect($('#inRangePop')).toBeTruthy() }
  it('D731 (3): a start and an end tapped — the calendar is still up, showing the range', async () => {
    await openPop()
    await click($('#inRangeCal [data-cal="2026-07-13"]')); await click($('#inRangeCal [data-cal="2026-07-19"]'))
    expect($('#inRangePop'), 'still open').toBeTruthy()
    expect($('#inRangePop .rc-read')!.textContent).toBe('13 Jul → 19 Jul')
    expect($('#inRangeBtn')!.textContent).toContain('13 Jul → 19 Jul')
  })
  it('D731 (3): a press outside closes it — a mouse’s and a finger’s alike', async () => {
    for (const ev of ['mousedown', 'pointerdown']) {
      await openPop()
      await act(async () => { $('#inRangeCal')!.dispatchEvent(new MouseEvent(ev, { bubbles: true })) })
      expect($('#inRangePop'), ev + ' inside: it stays').toBeTruthy()
      await act(async () => { $('.inwrap')!.dispatchEvent(new MouseEvent(ev, { bubbles: true })) })
      expect($('#inRangePop'), ev + ' outside: it closes').toBeNull()
    }
  })
  it('A6: Escape closes it, and the key goes no further', async () => {
    await openPop()
    const e = await key(document.body, 'Escape')
    expect($('#inRangePop')).toBeNull()
    expect(e.defaultPrevented).toBe(true)
  })
  it('A6: with an input’s window up as well, Escape closes the calendar ONLY — the window, and what was typed, stay', async () => {
    const r = await single({})
    await openPop(); await openOn(r)
    await type('#inpEditRmk', 'typed')
    await key($('#inpEditRmk')!, 'Escape')
    expect($('#inRangePop'), 'the calendar went').toBeNull()
    expect(tid('win-inputedit'), 'the window stayed').toBeTruthy()
    expect(($('#inpEditRmk') as HTMLInputElement).value).toBe('typed')
    await key($('#inpEditRmk')!, 'Escape')
    expect(tid('win-inputedit'), 'a second Escape is the window’s').toBeNull()
  })
  /* Astra's read of the code (10 Oct 26 — finding 3): the row's chips are buttons now, so the keyboard can open the
     document viewer or the OIL question OVER a calendar no press outside ever closed — and the calendar, taking Escape
     on the way in, kept it from the pop-up in front. A blocking pop-up that is up has the key first. */
  it('A6: a blocking pop-up opened by the keyboard over the open calendar takes Escape first — the OIL question, then the calendar', async () => {
    const r = await single({ ...SAT, oil: { '2026-10-17': 1 } })
    await openPop()
    await click(tr(r)!.querySelector('[data-oilrev]'))          // Enter on the chip: a click with no pointer press
    expect($$('[data-testid="oilconf"]')).toHaveLength(1)
    expect($('#inRangePop'), 'the calendar is still open under it').toBeTruthy()
    await key(document.body, 'Escape')
    expect($$('[data-testid="oilconf"]'), 'the question in front went').toHaveLength(0)
    expect($('#inRangePop'), 'the calendar did not').toBeTruthy()
    await key(document.body, 'Escape')
    expect($('#inRangePop'), 'the next Escape is the calendar’s').toBeNull()
  })
  it('A6: …and the document viewer the same', async () => {
    const { id } = docAdd(new File(['x'], 'cert.png', { type: 'image/png' }))
    const r = await single({ type: 'ATT C', allday: true, docIds: [id] })
    await act(async () => { root.render(<><InputsPage /><InputEditor /><DocViewer /></>) })
    await openPop()
    await click(tr(r)!.querySelector('.rclip'))
    expect(($('#docViewPop') as HTMLElement).hidden).toBe(false)
    await key(document.body, 'Escape')
    expect(($('#docViewPop') as HTMLElement).hidden, 'the viewer in front went').toBe(true)
    expect($('#inRangePop'), 'the calendar did not').toBeTruthy()
  })
  /* Astra's scenario 21 (10 Oct 26): the calendar left open and the List left by the KEYBOARD — no press outside ever
     closed it — stays "open" out of sight. It has no claim on a key while it cannot be seen. */
  it('A6: a calendar left open on a List that is no longer shown takes NO Escape — the opened day closes at the first press', async () => {
    await openPop()
    await click($('#inCalBtn'))                    // by the keyboard: a click with no pointer press before it
    await act(async () => { setCalMonth({ y: 2026, m: 10 }); notify() })
    await openDay('2026-10-21')
    expect(tid('win-inputsday')).toBeTruthy()
    await key(tid('win-inputsday')!, 'Escape')
    expect(tid('win-inputsday'), 'the first Escape is the day’s').toBeNull()
  })
})

/* A7 — `[CAL-CHECK-SEEN]`, the editor. A reader's form is inert, so the OIL line's "Change…" was a button that is seen
   and cannot be pressed — as the "?" beside Type was until D729. The line still says what stands. */
describe('A7 — a reader’s OIL line carries no "Change…"', () => {
  it('a member reads another man’s answered duty: the line says the answer, and offers nothing', async () => {
    const r = await single({ ...SAT, oil: { '2026-10-17': 1 } })
    await as('member'); await openOn(r)
    expect($('#inpEditPop .inped-oilsum')!.textContent).toBe('credited on its non-working day')
    expect(tid('oil-revise')).toBeNull()
  })
  /* RE-EXPRESSED ON THE ONE RECORD, AND ITS SECOND HALF RETIRED (owner D762, 11 Oct 26 — "one answer for all, nothing
     more"; the one-rule plan §4.5). This case ended "…HIS OWN line keeps its 'Change…'": a man in an input of several
     gives no OIL answer of his own any more, so "Your OIL" and its two buttons are gone. What stands in their place:
     he READS the input's one answer, nothing in the window lets him change it, and what is his is "Take me out". */
  it('a man in a shared input he did not file: the input’s line has no button — and there is no "Your OIL" line of his own (D762)', async () => {
    const rec = await sharedRec([member, others()[0]], { ...SAT, oil: { '2026-10-17': 1 } })
    await as('member'); await openOn(rec)
    expect(tid('inped-ro'), 'the input is not his to change').toBeTruthy()
    expect($('#inpEditPop .inped-oilsum')!.textContent, 'the line still says what stands').toBe('credited on its non-working day')
    expect(tid('oil-revise'), 'the input’s line: nothing to press').toBeNull()
    expect(tid('oil-revise-own'), 'no answer of his own to change (D762)').toBeNull()
    expect(tid('oil-answer-own'), 'and none to give').toBeNull()
    expect($('#inpEditPop')!.textContent, 'no "Your OIL" line').not.toMatch(/Your OIL/)
    expect(tid('inped-takeout'), 'what is his: to take himself out').toBeTruthy()
  })
  it('THE CONTROL — whoever may change the input still gets "Change…"', async () => {
    const r = await single({ ...SAT, oil: { '2026-10-17': 1 } })
    await openOn(r)
    expect(tid('oil-revise')).toBeTruthy()
  })
})

/* A8 — `[CAL-CHECK-SEEN]`, the editor. The filer's question at the save is headed "Saber +2" — it is asked once, for
   everyone (D660, D682). The same question reached by "Change…", by "Answer…", and by the one that follows a bar's
   drag onto a weekend was headed with ONE man's name while its answer was written on every record. One body now. */
describe('A8 — a group’s OIL question is headed for the group, by every door', () => {
  const head = () => $('[data-testid="oilconf"] .airpop-head b')!.textContent
  /* the input's first name, A to Z — the name the window's own title leads with (az1, above).
     THE THREE DOORS, ON THE ONE RECORD (D756): the fixture is one record with its people; the rule is the one these
     cases always pinned — the question is the input's, headed for everyone in it. */
  it('"Change…" on a shared duty already answered', async () => {
    const ppl = others().slice(0, 2)
    const rec = await sharedRec(ppl, { ...SAT, oil: { '2026-10-17': 1 } })
    await openOn(rec); await click(tid('oil-revise'))
    expect(head()).toBe(`OIL — ${az1(ppl)} +1, Duty`)
    expect(tid('win-inputedit')!.getAttribute('aria-label'), 'the same words as the window’s title').toContain(`${az1(ppl)} +1`)
  })
  it('"Answer…" on a shared duty nobody answered', async () => {
    const ppl = others().slice(0, 3)
    const rec = await sharedRec(ppl, { ...SAT })
    await openOn(rec); await click(tid('oil-answer'))
    expect(head()).toBe(`OIL — ${az1(ppl)} +2, Duty`)
  })
  it('the question that follows a move onto a weekend (a bar’s drag)', async () => {
    const ppl = others().slice(0, 2)
    const rec = await sharedRec(ppl, { ...SAT })
    await act(async () => { askOilIfPending(live(rec.iid)) })
    expect($$('[data-testid="oilconf"]')).toHaveLength(1)
    expect(head()).toBe(`OIL — ${az1(ppl)} +1, Duty`)
  })
  /* the walk's own find (10 Oct 26): a NEW group's question at the save led with whoever was PICKED first ("Ranger +2"),
     and the same input, once saved, was "Ace +2" at its title and at every other door */
  it('the save of a NEW group, its people picked in any order: the same first name, A to Z, as it will have once saved', async () => {
    const [a, b, c] = others().slice(0, 3)
    const az = [a, b, c].map(cs).sort((x, y) => x.localeCompare(y))
    const last = [a, b, c].find(id => cs(id) === az[2])!, rest = [a, b, c].filter(id => id !== last)
    await act(async () => { setInpEdit({ _new: true, _calendar: true, _ctx: 'i', person: last, type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439 }); notify() })
    await click(tid('pp-several'))
    for (const id of rest) await click($(`#inpEditPop [data-pp="${id}"]`))
    await click($('#inpEditSave'))
    expect(head()).toBe(`OIL — ${az[0]} +2, Duty`)
  })
  /* RETIRED BY D762, AND WHAT STANDS IN ITS PLACE. This was "THE CONTROL — a man's OWN answer inside a shared input is
     headed with his name alone": no man in an input of several gives an answer of his own now. The answer is the
     INPUT's — so the member who FILED it, himself one of its people, is asked for everyone under the same heading as
     at every other door, and what he answers is written once, for everyone in it. */
  it('THE CONTROL (D762) — the filer, himself one of its people: his "Change…" is the input’s question, headed for everyone — never his name alone', async () => {
    const ppl = [member, others()[0]]
    const rec = await sharedRec(ppl, { ...SAT, oil: { '2026-10-17': 1 } }, member)
    await as('member'); await openOn(rec)
    expect(tid('oil-revise-own'), 'no button of his own').toBeNull()
    await click(tid('oil-revise'))
    expect(head()).toBe(`OIL — ${az1(ppl)} +1, Duty`)
    /* a MEMBER's answer passes the check on what his command changed (state/perms.ts — "0 or exactly what the record's
       hours price"), which asks the Leave War which days ask the question. The app installs that at boot
       (leavewar/sync.ts wireLeaveWarSync → setOilPlan(oilAskPlan)); this file's harness wires no war, so the one line
       of it is installed here, for this save, and taken out again. */
    setOilPlan(oilAskPlan)
    try { await click(tid('oil-no')); await click(tid('oilconf-save')) } finally { setOilPlan(null) }
    expect(said.filter(m => /not saved|nothing was saved/i.test(m)), 'his answer is his to give: nothing is refused').toEqual([])
    expect(live(rec.iid).oil, 'one answer, on the one record').toEqual({ '2026-10-17': 0 })
    expect(idsOf(live(rec.iid)), 'for both of its people').toEqual(ppl)
  })
  it('THE CONTROL — an ordinary one-person input is headed with its person', async () => {
    const r = await single({ ...SAT, oil: { '2026-10-17': 1 } })
    await openOn(r); await click(tid('oil-revise'))
    expect(head()).toBe(`OIL — ${cs(r.person)}, Duty`)
  })
})

/* A10 — `[CAL-CHECK-SEEN]`, the editor (walker G, X-08). He types a remark; behind the window the record's remark is
   changed (a bar's drag rewrites its "till" word) — the window rightly lists "remarks — theirs …, yours …". The drag is
   then undone: the record is exactly what his change was typed over, and the note stayed, "theirs" now the value the
   window had opened on. Nothing is in dispute any more: the note goes, and his typing stays. */
describe('A10 — a "changed while this window was open" note goes when the record comes back', () => {
  it('remarks typed; the record’s remark changed behind the window, then put back: the note comes and goes, his words stay', async () => {
    const r = await single({ remarks: 'as filed' })
    await openOn(r)
    await type('#inpEditRmk', 'mine')
    await act(async () => { writeInputs(() => { live(r.iid).remarks = 'theirs' }); notify() })
    expect(tid('inped-clash')!.textContent).toMatch(/remarks — theirs “theirs”, yours “mine”/)
    await act(async () => { writeInputs(() => { live(r.iid).remarks = 'as filed' }); notify() })
    expect(tid('inped-clash'), 'the record is as it was when he began: nothing to choose').toBeNull()
    expect(($('#inpEditRmk') as HTMLInputElement).value).toBe('mine')
    await click($('#inpEditSave'))
    expect(live(r.iid).remarks, 'and his Save writes his change').toBe('mine')
  })
  it('THE CONTROL — changed to something ELSE again, the note stays and names the newest value', async () => {
    const r = await single({ remarks: 'as filed' })
    await openOn(r)
    await type('#inpEditRmk', 'mine')
    await act(async () => { writeInputs(() => { live(r.iid).remarks = 'theirs' }); notify() })
    await act(async () => { writeInputs(() => { live(r.iid).remarks = 'theirs again' }); notify() })
    expect(tid('inped-clash')!.textContent).toMatch(/theirs “theirs again”, yours “mine”/)
  })
  it('THE CONTROL — "Keep mine" settles it; the record coming back afterwards raises nothing new', async () => {
    const r = await single({ remarks: 'as filed' })
    await openOn(r)
    await type('#inpEditRmk', 'mine')
    await act(async () => { writeInputs(() => { live(r.iid).remarks = 'theirs' }); notify() })
    await click(tid('inped-clash-mine-remarks'))
    expect(tid('inped-clash')).toBeNull()
    await act(async () => { writeInputs(() => { live(r.iid).remarks = 'as filed' }); notify() })
    expect(tid('inped-clash'), 'back to what his change was made over: still nothing to choose').toBeNull()
  })
  /* Astra's scenarios 13 and 14 (10 Oct 26): one choice is not consent to every later change */
  it('"Keep mine", then a DIFFERENT change behind him: he is asked again, with the newest value', async () => {
    const r = await single({ remarks: 'as filed' })
    await openOn(r)
    await type('#inpEditRmk', 'mine')
    await act(async () => { writeInputs(() => { live(r.iid).remarks = 'theirs' }); notify() })
    await click(tid('inped-clash-mine-remarks'))
    await act(async () => { writeInputs(() => { live(r.iid).remarks = 'a third value' }); notify() })
    expect(tid('inped-clash')!.textContent).toMatch(/theirs “a third value”, yours “mine”/)
  })
  it('"Take theirs", then the record moves again while he leaves the field alone: it follows silently; a fresh change of his own is compared from there', async () => {
    const r = await single({ remarks: 'as filed' })
    await openOn(r)
    await type('#inpEditRmk', 'mine')
    await act(async () => { writeInputs(() => { live(r.iid).remarks = 'theirs' }); notify() })
    await click(tid('inped-clash-theirs-remarks'))
    expect(($('#inpEditRmk') as HTMLInputElement).value).toBe('theirs')
    await act(async () => { writeInputs(() => { live(r.iid).remarks = 'theirs, later' }); notify() })
    expect(tid('inped-clash'), 'untouched: no question').toBeNull()
    expect(($('#inpEditRmk') as HTMLInputElement).value).toBe('theirs, later')
    await type('#inpEditRmk', 'mine again')
    await act(async () => { writeInputs(() => { live(r.iid).remarks = 'as filed' }); notify() })
    expect(tid('inped-clash')!.textContent, 'the value he first opened on is now a real competing change').toMatch(/theirs “as filed”, yours “mine again”/)
  })
})

/* D731 (2) — a day opened on the calendar whose inputs are ALL hidden by a filter said "No inputs on this day. Tap
   + Input to add one." It says what is true, and offers the way out. */
describe('D731 (2) — a day whose inputs a filter hides says so, with "Clear filters"', () => {
  it('one input on the day, for a man the Person filter leaves out', async () => {
    const [a, b] = others()
    await single({ person: a, date: 'Oct 20' })
    await choose('#inFPerson', b)
    await openDay('2026-10-20')
    expect(tid('idy-empty')!.textContent).toContain('No inputs match on this day.')
    expect(tid('idy-empty')!.textContent).not.toMatch(/Tap \+ Input/)
    const clear = tid('idy-clear') as HTMLElement
    expect(clear.tagName).toBe('BUTTON')
    expect(clear.textContent).toBe('Clear filters')
    await click(clear)
    expect(($('#inFPerson') as HTMLSelectElement).value, 'the page’s own filter is cleared').not.toBe(b)
    expect(tid('idy-empty'), 'and the day lists its input').toBeNull()
    expect($$('[data-testid^="idy-row-"]')).toHaveLength(1)
  })
  it('hidden by the Type filter, and by the search box, alike', async () => {
    await single({ date: 'Oct 20', type: 'Meeting', remarks: 'weekly' })
    await choose('#inFType', 'Duty')
    await openDay('2026-10-20')
    expect(tid('idy-empty')!.textContent).toContain('No inputs match on this day.')
    await click(tid('idy-clear'))
    await type('#inFSearch', 'zzz')
    expect(tid('idy-empty')!.textContent).toContain('No inputs match on this day.')
  })
  it('THE CONTROL — a day with no inputs at all says so, filter or no filter, and offers no "Clear filters"', async () => {
    await openDay('2026-10-21')
    expect(tid('idy-empty')!.textContent).toBe('No inputs on this day. Tap + Input to add one.')
    expect(tid('idy-clear')).toBeNull()
    await choose('#inFPerson', others()[0])
    expect(tid('idy-empty')!.textContent, 'a filter that hides nothing here changes nothing').toBe('No inputs on this day. Tap + Input to add one.')
    expect(tid('idy-clear')).toBeNull()
  })
})

/* D731 (4) — a shared input's OIL line read the FIRST man's answer: "credited on its non-working day" for three people
   of whom one had since said No for himself. Where every man's answers are alike it reads as it always did (his
   reading (b)); where they differ it counts them and names who is not credited. */
/* STEP 6 OF THE ONE-RULE BUILD (12 Oct 26 — the dead code out): the count line itself, `oilSummaryOf` ("credited for 2 of
   3 — Ranger: no"), is GONE — no door reached it once an input had ONE answer for everyone in it (owner D762, whose own
   row says it "changes D731 (4)'s line"). The block keeps D731 (4)'s name because that is where a reader looks for it;
   what it pins now is D762's line: `oilSummary` of the ONE record — the input's answer, never a count of its people
   and never a man's name. Each case that asked the old function says, in its own comment, which of three it is: the
   rule survives on the one record; D762 changed it; or it is an old-data case (records saved under a group id are so
   many one-person inputs, each with its own line — D759 reading 10, D56). */
describe('D731 (4) — a shared input’s OIL line counts its people where their answers differ', () => {
  const three = () => others().slice(0, 3)
  /* THE RULE SURVIVES, on the one record (was asked of three old-shaped records through `oilSummaryOf`): everyone in an
     input carries its one answer, and the line reads as it always did */
  it('everyone alike: the line reads as before', async () => {
    const rec = await sharedRec(three(), { ...SAT, oil: { '2026-10-17': 1 } })
    expect(oilSummary(live(rec.iid))).toBe('credited on its non-working day')
    await act(async () => { writeInputs(() => { live(rec.iid).oil = { '2026-10-17': 0 } }); notify() })
    expect(oilSummary(live(rec.iid))).toBe('no OIL on its non-working day')
  })
  /* RETIRED BY D762 (11 Oct 26 — "one answer for all, nothing more"; the ruling's own row: it "changes D731 (4)'s
     line"). This was "one of three has said No for himself: 'credited for 2 of 3 — <his name>: no' — in the window".
     No man of an input says No for himself any more, so the people of one input cannot carry different answers: the
     window's line states the input's ONE answer (D762 reading 5 — whom the scheduler switched off on a day shows in
     OIL Earn, where it is set). */
  it('D762 — an input of three: the window’s line is the input’s ONE answer, for all three — never a count of its people', async () => {
    const rec = await sharedRec(three(), { ...SAT, oil: { '2026-10-17': 1 } })
    await openOn(rec)
    expect($$('#inpEditPop .inped-oilsum').map(x => x.textContent)).toEqual(['credited on its non-working day'])
    await closeWin()
    await act(async () => { writeInputs(() => { live(rec.iid).oil = { '2026-10-17': 0 } }); notify() })
    await openOn(rec)
    expect($$('#inpEditPop .inped-oilsum').map(x => x.textContent)).toEqual(['no OIL on its non-working day'])
  })
  /* THE OLD SHAPE, KEPT AS AN OLD-DATA CASE (owner D759 reading 10 — "shared inputs saved before this build are read as
     one-person inputs"; stored data only, D56). This was "…and it is the same line whichever of its records the window
     was opened on": records tied by a group id are not joined any more, so each opens as its OWN input, and the line
     in its window is its own answer. */
  it('OLD DATA (D759 reading 10) — three records saved under one group id, one of them answered No: each opens as its own one-person input, with its own line', async () => {
    const g = await shared(three(), { ...SAT, oil: { '2026-10-17': 1 } })
    await act(async () => { writeInputs(() => { of(g.grp)[0].oil = { '2026-10-17': 0 } }); notify() })
    for (const [i, r] of g.rows.entries()) {
      await openOn(r)
      expect($$('#inpEditPop .inped-oilsum').map(x => x.textContent), 'opened on ' + cs(r.person)).toEqual([i === 0 ? 'no OIL on its non-working day' : 'credited on its non-working day'])
      expect(tid('win-inputedit')!.getAttribute('aria-label'), 'one man’s input: no "+2" in its title').not.toMatch(/\+\d/)
      await closeWin()
    }
  })
  /* D762 CHANGED THE RULE — and what is left is OLD DATA (D759 reading 10). This was "two of three said No: both are
     named" ("credited for 1 of 3 — <a>: no, <b>: no"). No man of an input says No for himself any more, so only
     records saved before the build can differ like this — and those are three one-person inputs: each line is its own
     man's answer, and no line counts or names anybody. */
  it('OLD DATA — three records under one group id, two of them answered No: three one-person inputs, each with its own line; nobody is counted, nobody named', async () => {
    const g = await shared(three(), { ...SAT, oil: { '2026-10-17': 1 } })
    await act(async () => { writeInputs(() => { of(g.grp)[0].oil = { '2026-10-17': 0 }; of(g.grp)[1].oil = { '2026-10-17': 0 } }); notify() })
    expect(of(g.grp).map(idsOf), 'each its own man’s').toEqual(g.rows.map(r => [r.person]))
    const lines = of(g.grp).map(r => oilSummary(r))
    expect(lines).toEqual(['no OIL on its non-working day', 'no OIL on its non-working day', 'credited on its non-working day'])
    for (const l of lines) { expect(l).not.toMatch(/credited for \d/); for (const r of g.rows) expect(l).not.toContain(cs(r.person)) }
  })
  /* RETIRED BY D762: "one answered Yes, one never answered" cannot be — the question has ONE answer, for everyone in the
     input. This case counted the two ("credited for 1 of 2") and named the unanswered man. What stands in its place:
     the input is answered or not as one thing — unanswered, the window says so for the INPUT, naming nobody, with ONE
     button; answered, the one line with ONE button. (The half that never changed: one button opens the question.) */
  it('D762 — a shared duty is answered, or not, as ONE thing: "Not answered yet — 17 Oct" names nobody and has ONE button; answered, the one line and ONE button', async () => {
    const ppl = others().slice(0, 2)
    const rec = await sharedRec(ppl, { ...SAT })
    await openOn(rec)
    expect($$('#inpEditPop .inped-oilsum').map(x => x.textContent), 'no "credited" line, and nobody named').toEqual(['Not answered yet — 17 Oct'])
    expect($$('#inpEditPop [data-testid="oil-answer"], #inpEditPop [data-testid="oil-revise"]')).toHaveLength(1)
    await click(tid('oil-answer')); await click(tid('oil-yes')); await click(tid('oilconf-save'))
    expect(live(rec.iid).oil, 'the one answer, for both').toEqual({ '2026-10-17': 1 })
    await closeWin(); await openOn(rec)
    expect($$('#inpEditPop .inped-oilsum').map(x => x.textContent)).toEqual(['credited on its non-working day'])
    expect(tid('oil-unanswered')).toBeNull()
    expect($$('#inpEditPop [data-testid="oil-answer"], #inpEditPop [data-testid="oil-revise"]')).toHaveLength(1)
  })
  /* D762 CHANGED THE RULE. This was "two days, one man credited for one of them only: he is named with his days"
     ("credited for 2 of 2 — <b>: 1 of 2 days"). One man of an input cannot be credited for fewer days than the others:
     the answer for each day is the INPUT's. The line counts the input's DAYS, as a one-person input's always did, and
     names nobody. */
  it('D762 — two days, the input credited for one of them only: the line counts its DAYS, for both people alike — no man is named with days of his own', async () => {
    const ppl = others().slice(0, 2)
    const rec = await sharedRec(ppl, { type: 'Duty', date: 'Oct 17', endDate: 'Oct 18', allday: true, s: 0, e: 1439, oil: { '2026-10-17': 1, '2026-10-18': 1 } })
    expect(oilSummary(live(rec.iid))).toBe('credited on 2 of 2 non-working days')
    await act(async () => { writeInputs(() => { live(rec.iid).oil = { '2026-10-17': 1, '2026-10-18': 0 } }); notify() })
    expect(oilSummary(live(rec.iid))).toBe('credited on 1 of 2 non-working days')
    for (const p of ppl) expect(oilSummary(live(rec.iid))).not.toContain(cs(p))
    await openOn(rec)
    expect($$('#inpEditPop .inped-oilsum').map(x => x.textContent), 'and the window says that line, once').toEqual(['credited on 1 of 2 non-working days'])
  })
  /* Sol's read of the code (10 Oct 26 — finding 2). A request the scheduler has TAKEN OFF the programme keeps its
     stored answer and earns nothing while it is off — every other reader leaves it out (`oilAnswered`, the bell, the
     credit pass). The new count read the stored Yes: "credited for 1 of 2" for a man credited with nothing. */
  /* SOL'S FINDING, RE-EXPRESSED ON THE ONE RECORD (owner D756; D759 reading 1 — "one man taken off the programme alone
     is out of the input — there is no 'in the input but off the schedule' for one man of several"; D762). This was "a
     man whose request was taken off the programme is not counted as credited — he is named 'taken off'": being taken
     off is the INPUT's state now, one for everyone in it, so no ONE man of it can be "taken off" beside the others and
     the count that named him is retired. What the finding was about still holds, for the input: taken off, it keeps
     its stored answer, earns nothing, and the window does not say "credited"; put back, the answer stands again.
     (The old count's own words — "<name>: taken off" — went with `oilSummaryOf` at step 6; the two cases below, which
     asked it of records of the old shape, are kept as OLD-DATA cases on the live readers.) */
  it('an input of three TAKEN OFF the programme is not said to be credited — its stored answer is kept, and stands again when it is put back (D759 reading 1)', async () => {
    const rec = await sharedRec(three(), { ...SAT, oil: { '2026-10-17': 1 } })
    await act(async () => { writeInputs(() => { live(rec.iid).acc = 'r' }); notify() })
    expect(oilAnswered(live(rec.iid)), 'nothing is credited or shown for it while it is off').toBe(false)
    await openOn(rec)
    expect($$('#inpEditPop .inped-oilsum'), 'the window claims no credit for it').toHaveLength(0)
    expect(live(rec.iid).oil, 'the stored answer is not touched').toEqual({ '2026-10-17': 1 })
    await closeWin()
    await act(async () => { writeInputs(() => { live(rec.iid).acc = 'g' }); notify() })
    await openOn(rec)
    expect($$('#inpEditPop .inped-oilsum').map(x => x.textContent), 'back on the programme: the old words').toEqual(['credited on its non-working day'])
  })
  /* OLD DATA (D759 reading 10; D56). This was "…whichever record he is — the LAST one too; and put back on the programme
     his answer stands again", said of the old count ("credited for 2 of 3 — <c>: taken off"). Three records under one
     group id are three one-person inputs: the LAST one taken off the programme is its own input taken off — nothing is
     credited or shown for IT, its stored answer is kept, and the other two are not touched by it; put back, its answer
     stands again. What Sol's finding was about, kept on the reader every screen and the credit pass ask (`oilAnswered`)
     and in the window. */
  it('OLD DATA — …whichever record he is — the LAST one too: taken off, nothing is credited for it and the other two stand; put back on the programme his answer stands again', async () => {
    const g = await shared(three(), { ...SAT, oil: { '2026-10-17': 1 } })
    await act(async () => { writeInputs(() => { of(g.grp)[2].acc = 'r' }); notify() })
    expect(of(g.grp).map(r => oilAnswered(r)), 'only the one taken off stops counting').toEqual([true, true, false])
    expect(of(g.grp)[2].oil, 'the stored answer is not touched').toEqual({ '2026-10-17': 1 })
    await openOn(g.rows[2])
    expect($$('#inpEditPop .inped-oilsum'), 'its own window claims no credit for it').toHaveLength(0)
    await closeWin()
    await openOn(g.rows[0])
    expect($$('#inpEditPop .inped-oilsum').map(x => x.textContent), 'another man’s is his own: credited, and it names nobody').toEqual(['credited on its non-working day'])
    await closeWin()
    await act(async () => { writeInputs(() => { of(g.grp)[2].acc = 'g' }); notify() })
    expect(of(g.grp).map(r => oilAnswered(r)), 'everyone alike again').toEqual([true, true, true])
    await openOn(g.rows[2])
    expect($$('#inpEditPop .inped-oilsum').map(x => x.textContent), 'the old words').toEqual(['credited on its non-working day'])
  })
  /* OLD DATA (D759 reading 10; D56). This was "everyone still ON the programme answered alike, one man off it: the words
     are not borrowed from the man who is off" ("credited for 0 of 2 — <a>: taken off, <b>: no"). The two records are
     two inputs now, so there is no shared line to borrow into — and that is the thing pinned: the man who is ON reads
     his own No, whatever the one who is off has stored. */
  it('OLD DATA — one record off the programme with a stored Yes, the other on it with a No: the one that is on says its own No — the words are not borrowed from the one that is off', async () => {
    const g = await shared(others().slice(0, 2), { ...SAT, oil: { '2026-10-17': 0 } })
    await act(async () => { writeInputs(() => { of(g.grp)[0].acc = 'r'; of(g.grp)[0].oil = { '2026-10-17': 1 } }); notify() })
    expect(oilSummary(of(g.grp)[1])).toBe('no OIL on its non-working day')
    expect(of(g.grp).map(r => oilAnswered(r)), 'the one that is off counts for nothing, stored Yes or not').toEqual([false, true])
    await openOn(g.rows[1])
    expect($$('#inpEditPop .inped-oilsum').map(x => x.textContent)).toEqual(['no OIL on its non-working day'])
    await closeWin()
    await openOn(g.rows[0])
    expect($$('#inpEditPop .inped-oilsum'), 'and the one that is off claims no credit in its own window').toHaveLength(0)
  })
  /* THE RULE SURVIVES — the line of a one-person input is the same function now (`oilSummary`), not a second one beside it */
  it('THE CONTROL — a one-person input’s line is untouched', async () => {
    const r = await single({ ...SAT, oil: { '2026-10-17': 0 } })
    expect(oilSummary(r)).toBe('no OIL on its non-working day')
    await act(async () => { writeInputs(() => { live(r.iid).oil = { '2026-10-17': 1 } }); notify() })
    expect(oilSummary(live(r.iid))).toBe('credited on its non-working day')
  })
})

/* Astra's read of the code (10 Oct 26 — finding 2; older than this batch, on the same lines). The schedule's and the
   board's dialog held ONE man's row of a shared input and saved one, while its "Not answered yet" line named the OTHER
   men of the entry, with no button there that could answer for them. One scope for both lines and the button.
   REWRITTEN TO THE RULING (`[GROUP-INPUT-ONE-ROW]` step 5, 11 Oct 26 — owner D661, D734: on the schedule a shared input
   is ONE row and "the same as doing it in the input's own window"; the plan §4.5 — "the dialog opened from the row
   or the line is the entry's throughout"). The one scope is now the ENTRY, there as on the Inputs page: the dialog
   holds every man of it, its lines count them all, and its button answers for them all. What Astra's finding was
   about still holds — a line never names a man the button beside it cannot answer for. */
describe('the schedule’s dialog on a shared input speaks for the ENTRY — the OIL line, the "not answered yet" line and the button', () => {
  /* RE-EXPRESSED TO D762 (11 Oct 26 — one OIL answer for everyone in an input) ON THE ONE RECORD (D756). These two said
     "one man answered, the other not … the lines count both and name who is unanswered": the people of one input can no
     longer differ, so there is nobody to count and nobody to name. The dialog still speaks for the INPUT, and what
     Astra's finding was about holds in its plainest form — the line names no man, and the ONE button beside it answers
     for everyone in it. */
  it('a shared duty nobody has answered, opened from the schedule: the line is the input’s — it names nobody — and its ONE button answers for everyone (D762)', async () => {
    const ppl = others().slice(0, 2)
    const rec = await sharedRec(ppl, { ...SAT })
    await act(async () => { goPage('editsched'); notify() })
    await openOn(rec)
    expect(tid('win-inputedit'), 'the blocking dialog, not the Inputs page’s window').toBeNull()
    expect($$('#inpEditPop .inped-oilsum').map(x => x.textContent)).toEqual(['Not answered yet — 17 Oct'])
    expect($$('#inpEditPop [data-testid="oil-answer"], #inpEditPop [data-testid="oil-revise"]')).toHaveLength(1)
    await click(tid('oil-answer'))
    expect($('[data-testid="oilconf"] .airpop-head b')!.textContent, 'asked for both').toBe(`OIL — ${az1(ppl)} +1, Duty`)
    await click(tid('oil-yes')); await click(tid('oilconf-save'))
    expect(live(rec.iid).oil, 'one answer, on the one record').toEqual({ '2026-10-17': 1 })
    expect(idsOf(live(rec.iid)), 'for both of its people').toEqual(ppl)
  })
  it('THE CONTROL — on the Inputs page the window says the same line for the input, and names nobody: there is no one man to name (D762)', async () => {
    const ppl = others().slice(0, 2)
    const rec = await sharedRec(ppl, { ...SAT })
    await openOn(rec)
    expect(tid('win-inputedit'), 'the Inputs page’s own window').toBeTruthy()
    expect(tid('oil-unanswered')!.querySelector('.inped-oilsum')!.textContent).toBe('Not answered yet — 17 Oct')
    for (const p of ppl) expect(tid('oil-unanswered')!.textContent, cs(p)).not.toContain(cs(p))
  })
})

/* D731 (7) — "left as it is": an answer for a day the input no longer covers STAYS on the record. Nothing shows it,
   nothing is credited for it, and it stands again if the input moves back. Pinned so that no later tidy-up takes it. */
describe('D731 (7) — an OIL answer for a day the input no longer covers stays on the record', () => {
  it('a Saturday duty answered Yes, moved to a Tuesday and back: the answer is kept, earns nothing while away, and stands again', async () => {
    const r = await single({ ...SAT, oil: { '2026-10-17': 1 } })
    await act(async () => { commitChipMove({ kind: 'input', iid: r.iid }, '2026-10-17', '2026-10-20') })
    expect(live(r.iid).date).toBe('Oct 20')
    expect(live(r.iid).oil, 'the Saturday’s answer is still on the record').toEqual({ '2026-10-17': 1 })
    expect(oilAnswered(live(r.iid)), 'and nothing is credited or shown for it').toBe(false)
    await act(async () => { commitChipMove({ kind: 'input', iid: r.iid }, '2026-10-20', '2026-10-17') })
    expect(oilAnswered(live(r.iid)), 'moved back: it stands again').toBe(true)
    expect($$('[data-testid="oilconf"]'), 'and nobody is asked a second time').toHaveLength(0)
  })
})

/* D731 (8) — with members' filing for other people switched off, the member who FILED a shared input may no longer
   change it for everyone (D655, reading 6) — and was told "Only Ranger — who filed it — or an admin can change this":
   he is Ranger. Every door that says who may change a shared input says, to him, that the switch is off. No right
   changes (his reading (c)): "Take me out" is offered exactly where the rules already offer it. */
describe('D731 (8) — the filer, with the members’ switch off, is told the switch is off', () => {
  const off = async () => { await as('admin'); await act(async () => { setMembersFile(false); notify() }); await as('member') }
  /* THE FIXTURES OF THIS BLOCK ARE THE ONE RECORD NOW (owner D756): a shared input is one record with its people and its
     one filer — two records tied by a group id are two one-person inputs since the build (D759 reading 10), and the
     first of them was simply the member's OWN input, which he may always change. The rule each case pins is unchanged
     (D731 (8); who may: the one-rule plan §4.9). */
  it('the window’s foot: "Filing for other people is switched off — an admin can change this."', async () => {
    const rec = await sharedRec([member, others()[0]], { type: 'Duty' }, member)
    await off(); await openOn(rec)
    expect(tid('inped-ro')!.textContent).toBe(FILING_OFF)
    expect(FILING_OFF).toBe('Filing for other people is switched off — an admin can change this.')
    expect(tid('inped-takeout'), 'he is in it: he may still take himself out, as the rules already say').toBeTruthy()
    expect($('#inpEditSave'), 'and nothing lets him change it for everyone').toBeNull()
  })
  it('a filer who is NOT one of its people reads the same sentence, and is offered nothing', async () => {
    const rec = await sharedRec(others().slice(0, 2), { type: 'Duty' }, member)
    await off(); await openOn(rec)
    expect(tid('inped-ro')!.textContent).toBe(FILING_OFF)
    expect(tid('inped-takeout')).toBeNull()
  })
  it('the other doors say it too: Delete for everyone, a bar’s drag, a save', async () => {
    const ppl = [member, others()[0]]
    const rec = await sharedRec(ppl, { type: 'Duty' }, member)
    await off()
    said.length = 0
    /* Delete for everyone is the input's one delete (removeInput — the old `removeEntry` was folded into it with the
       dead code, step 6 of the one-rule build; the sentence is the same one) */
    let gone: any
    await act(async () => { gone = removeInput(live(rec.iid)) })
    expect(gone, 'refused').toBe(false)
    expect(said, 'Delete for everyone').toEqual([FILING_OFF])
    said.length = 0
    await act(async () => { commitChipMove({ kind: 'input', iid: rec.iid }, '2026-10-13', '2026-10-14') })
    expect(said, 'a bar’s drag').toEqual([FILING_OFF])
    said.length = 0
    /* the save is the input's one writer (commitInput — "the group save" is only its old name) */
    await act(async () => { commitInput(live(rec.iid), { ...draftOf(live(rec.iid)), remarks: 'changed' }, idsOf(live(rec.iid))) })
    expect(said, 'a save').toEqual([FILING_OFF])
    expect([live(rec.iid).remarks, live(rec.iid).date, idsOf(live(rec.iid))], 'and nothing was written by any of them').toEqual(['brief', 'Oct 13', ppl])
  })
  /* the roll-call's own find (10 Oct 26): an input filed for ALL AVAIL / ALL names its FILER the same way — "Only Ranger —
     who filed it — or an admin can change this" — and a member files one only while the switch is on (D702) */
  it('an input he filed for ALL AVAIL: the window’s foot and the Delete key on the day’s line say the switch is off', async () => {
    const ph = Object.keys(PEOPLE).find(id => PEOPLE[id].special)!
    const r = await single({ person: ph, type: 'Duty', date: 'Oct 20', by: member, remarks: '' })
    await off(); await openOn(r)
    expect(tid('inped-ro')!.textContent).toBe(FILING_OFF)
    await closeWin()
    await openDay('2026-10-20')
    said.length = 0
    await key(tid('idy-row-' + r.iid)!.querySelector('[data-testid="idy-open"]')!, 'Delete')
    expect(said).toEqual([FILING_OFF])
    expect(tid('idy-ask'), 'and nothing is asked: there is nothing he may delete').toBeNull()
  })
  /* ITS SENTENCE IS THE ONE EVERY INPUT BEYOND ONE NAMED PERSON SAYS NOW (the one-rule plan §4.9, owner D755 (3) — "Only
     Saber — who filed it — or an admin can change this for everyone"; one body with every other door, ui/inputedit.tsx
     sharedRefusal). It ended "…can change this." before the build. The rule the control pins is unchanged: with the
     switch off, a member is still told WHO filed it — never that the switch is off, which is said to the filer alone. */
  it('THE CONTROL — an ALL AVAIL input an ADMIN filed still names him to a member', async () => {
    const ph = Object.keys(PEOPLE).find(id => PEOPLE[id].special)!
    const r = await single({ person: ph, type: 'Duty', date: 'Oct 20', by: admin, remarks: '' })
    await off(); await openOn(r)
    expect(tid('inped-ro')!.textContent).toBe(`Only ${cs(admin)} — who filed it — or an admin can change this for everyone.`)
  })
  /* Astra's scenario 9 (10 Oct 26), an older fault on the same door: the opened day asks "Delete this input for all 2
     people?"; the switch is turned off while the question stands; "Delete" then took HIM out — an answer to a question
     nobody had asked. What was asked is what is done, or it is refused in words. */
  it('the day’s "Delete for all?" question, the switch turned off while it stands: Delete is refused — it never becomes "take me out"', async () => {
    const ppl = [member, others()[0]]
    const rec = await sharedRec(ppl, { type: 'Duty', date: 'Oct 20' }, member)
    await as('member')
    await openDay('2026-10-20')
    await key(tid('idy-row-' + tid('idy-list')!.querySelector('[data-testid^="idy-row-"]')!.getAttribute('data-popiid'))!.querySelector('[data-testid="idy-open"]')!, 'Delete')
    expect(tid('idy-ask')!.textContent).toContain('Delete this input for all 2 people?')
    await off()
    said.length = 0
    await click(tid('idy-del-yes'))
    expect(idsOf(live(rec.iid)), 'nobody was taken out').toEqual(ppl)
    expect(said).toEqual([FILING_OFF])
  })
  /* …and the REVERSE (Astra's read of the code, 10 Oct 26 — finding 1, the serious one, made by the fix above): asked
     "Take yourself out of this input?" while he could do no more, his right to delete for everyone then comes back
     (the switch on again) — and "Take me out" deleted EVERYONE: the words on screen were kept, the action was chosen
     afresh from what he could now do. The question's intent decides both. */
  it('the day’s "Take yourself out?" question, the switch turned ON while it stands: only HE goes — never everyone; one Undo puts him back', async () => {
    const rec = await sharedRec([member, others()[0]], { type: 'Duty', date: 'Oct 20' }, member)
    await off()
    await openDay('2026-10-20')
    await key(tid('idy-list')!.querySelector('[data-testid^="idy-row-"] [data-testid="idy-open"]')!, 'Delete')
    expect(tid('idy-ask')!.textContent).toContain('Take yourself out of this input?')
    await as('admin'); await act(async () => { setMembersFile(true); notify() }); await as('member')
    expect(tid('idy-ask')!.textContent, 'the question still says what it asked').toContain('Take yourself out of this input?')
    said.length = 0
    await click(tid('idy-del-yes'))
    expect(idsOf(live(rec.iid)), 'the other man is still in it').toEqual([others()[0]])
    expect(said).toEqual(['You are out of this input'])
    await act(async () => { undo(); notify() })
    expect(idsOf(live(rec.iid)).map(String).sort(), 'Undo restores exactly him').toEqual([member, others()[0]].sort())
  })
  it('THE CONTROL — "Delete for all?" asked and still his to do: everyone goes, as asked', async () => {
    const rec = await sharedRec([member, others()[0]], { type: 'Duty', date: 'Oct 20' }, member)
    await as('member')
    await openDay('2026-10-20')
    await key(tid('idy-list')!.querySelector('[data-testid^="idy-row-"] [data-testid="idy-open"]')!, 'Delete')
    expect(tid('idy-ask')!.textContent).toContain('Delete this input for all 2 people?')
    await click(tid('idy-del-yes'))
    expect(live(rec.iid), 'the input is gone — for both').toBeUndefined()
  })
  it('THE CONTROL — the switch ON: the filer changes it as before, and is told nothing', async () => {
    const rec = await sharedRec([member, others()[0]], { type: 'Duty' }, member)
    await as('member'); await openOn(rec)
    expect(tid('inped-ro')).toBeNull()
    expect($('#inpEditSave')).toBeTruthy()
  })
  it('THE CONTROL — a man in it who did NOT file it is still told who did', async () => {
    const rec = await sharedRec([member, others()[0]], { type: 'Duty' })           // filed by the admin
    await off(); await openOn(rec)
    expect(tid('inped-ro')!.textContent).toBe(`Only ${cs(admin)} — who filed it — or an admin can change this for everyone.`)
  })
})

/* D731 (9) — Escape while a planning note is typed closed the whole day (the shell's rule: Escape closes the window in
   front). It leaves the note box only, nothing written; a second Escape closes the day. */
describe('D731 (9) — Escape while a note is typed leaves the note box only', () => {
  const D = '2026-10-22'
  const notes = () => PLANPUCKS.filter((p: any) => p.date === D)
  afterEach(async () => { await act(async () => { for (let i = PLANPUCKS.length - 1; i >= 0; i--) if (PLANPUCKS[i].date === D) PLANPUCKS.splice(i, 1); notify() }) })
  it('a NEW note: Escape puts the box away, saves nothing, and the day stays; the next Escape closes the day', async () => {
    await openDay(D)
    await click($('#icAddPuck'))
    const box = $('.ic-newnote .ic-poppuck-edit') as HTMLInputElement
    await type('.ic-newnote .ic-poppuck-edit', 'half a thought')
    const e = await key(box, 'Escape')
    expect($('.ic-newnote'), 'the note box is gone').toBeNull()
    expect(tid('win-inputsday'), 'the day is still open').toBeTruthy()
    expect(notes(), 'and nothing was saved').toHaveLength(0)
    expect(e.defaultPrevented).toBe(true)
    await key(tid('win-inputsday')!, 'Escape')
    expect(tid('win-inputsday'), 'the second Escape closes the day').toBeNull()
  })
  /* Astra's scenario 16 (10 Oct 26): the words and "+ people" beside them are ONE thing being made — a Tab from the
     words to the button is still inside the note box */
  it('a NEW note, the keyboard on its "+ people" button: Escape still leaves the note box only', async () => {
    await openDay(D)
    await click($('#icAddPuck'))
    await type('.ic-newnote .ic-poppuck-edit', 'half a thought')
    await act(async () => { ($('#icNewNotePpl') as HTMLElement).focus() })
    expect($('.ic-newnote'), 'moving between the two saves nothing and keeps the box').toBeTruthy()
    const e = await key($('#icNewNotePpl')!, 'Escape')
    expect($('.ic-newnote')).toBeNull()
    expect(tid('win-inputsday'), 'the day is still open').toBeTruthy()
    expect(notes()).toHaveLength(0)
    expect(e.defaultPrevented).toBe(true)
  })
  it('after an Escape the NEXT edit of that note saves as it always did', async () => {
    await act(async () => { writeInputs(() => addPlanPuck(D, 'brief the new guy')); notify() })
    await openDay(D)
    await click($(`[data-ppedit="${notes()[0].id}"]`))
    await type('.ic-note .ic-poppuck-edit', '')
    await key($('.ic-note .ic-poppuck-edit')!, 'Escape')
    expect(notes()[0].text, 'a cleared box, cancelled: the words are kept').toBe('brief the new guy')
    await click($(`[data-ppedit="${notes()[0].id}"]`))
    await type('.ic-note .ic-poppuck-edit', 'brief him at 0800')
    await act(async () => { ($('.ic-note .ic-poppuck-edit') as HTMLElement).dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
    expect(notes()[0].text).toBe('brief him at 0800')
  })
  /* Sol's read of the code (10 Oct 26 — finding 3; an older fault, Astra's scenario 18): with an input's window up as
     well, Escape in a note's people picker did NOTHING — the picker stood down for the window, the window declined
     (it is not in front), the shell declined (the keyboard is in the picker). The picker has the key first. */
  it('the people picker over a note, with an input’s window up and unsaved: Escape closes the PICKER only — the window, its typing and the day stay', async () => {
    const r = await single({ date: 'Oct 22', remarks: 'as filed' })
    await act(async () => { writeInputs(() => addPlanPuck(D, 'brief the new guy')); notify() })
    await openDay(D)
    await click(tid('idy-row-' + r.iid)!.querySelector('[data-testid="idy-open"]'))
    await type('#inpEditRmk', 'typed, not saved')
    await act(async () => { tid('win-inputsday')!.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true })) })
    await click($(`[data-pkadd="${notes()[0].id}"]`))
    expect($('.ic-pick'), 'the picker is up').toBeTruthy()
    const e = await key($('.ic-pick')!, 'Escape')
    expect($('.ic-pick'), 'the picker went').toBeNull()
    expect(e.defaultPrevented).toBe(true)
    expect(tid('win-inputsday'), 'the day stayed').toBeTruthy()
    expect(tid('win-inputedit'), 'the input’s window stayed').toBeTruthy()
    expect(($('#inpEditRmk') as HTMLInputElement).value).toBe('typed, not saved')
    expect(notes()[0].ids || [], 'and nobody was added to the note').toHaveLength(0)
  })
  it('…and the same with the INPUT’s window in front (the picker opened by the keyboard): the picker, not the window, takes the key', async () => {
    const r = await single({ date: 'Oct 22', remarks: 'as filed' })
    await act(async () => { writeInputs(() => addPlanPuck(D, 'brief the new guy')); notify() })
    await openDay(D)
    await click(tid('idy-row-' + r.iid)!.querySelector('[data-testid="idy-open"]'))
    await type('#inpEditRmk', 'typed, not saved')
    expect(frontWin()).toBe('inputedit')
    await click($(`[data-pkadd="${notes()[0].id}"]`))             // Enter on the "+": no pointer press, the window stays in front
    await key($('.ic-pick')!, 'Escape')
    expect($('.ic-pick')).toBeNull()
    expect(tid('win-inputedit'), 'the window in front was not closed by the picker’s key').toBeTruthy()
    expect(($('#inpEditRmk') as HTMLInputElement).value).toBe('typed, not saved')
  })
  it('an EXISTING note being edited: Escape puts its words back', async () => {
    await act(async () => { writeInputs(() => addPlanPuck(D, 'brief the new guy')); notify() })
    await openDay(D)
    await click($(`[data-ppedit="${notes()[0].id}"]`))
    await type('.ic-note .ic-poppuck-edit', 'changed my mind')
    await key($('.ic-note .ic-poppuck-edit')!, 'Escape')
    expect($('.ic-note .ic-poppuck-edit'), 'the box is gone').toBeNull()
    expect(tid('win-inputsday')).toBeTruthy()
    expect(notes()[0].text).toBe('brief the new guy')
    expect($('.ic-note .ic-poppuck-txt')!.textContent).toBe('brief the new guy')
  })
  it('THE CONTROL — Enter still saves the note, and leaving the box still saves it', async () => {
    await openDay(D)
    await click($('#icAddPuck'))
    await type('.ic-newnote .ic-poppuck-edit', 'kept')
    await act(async () => { ($('.ic-newnote .ic-poppuck-edit') as HTMLElement).dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
    expect(notes().map((p: any) => p.text)).toEqual(['kept'])
  })
})

/* D732 — the "Day title…" box at the head of the same opened day was not a note and was not on his picture: Escape
   there still closed the whole day, and a title half typed was lost (the roll-call's MISSING row of the batch's check,
   §2.6). His answer, 10 Oct 26 — "Yes": the same manners as a note's box. Escape puts the title back as last saved,
   takes the keyboard out of the box, writes nothing, and the day stays; the next Escape is the day's. */
describe('D732 — Escape while the day’s title is typed puts the title back and leaves the day open', () => {
  const D = '2026-10-22'
  const title = () => $('#icRmkEdit') as HTMLInputElement
  const leave = async () => act(async () => { title().dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
  afterEach(async () => { await act(async () => { delete DAYRMK[D]; notify() }) })
  it('a saved title typed over: Escape puts it back, saves nothing, and the day stays; the next Escape closes the day', async () => {
    await act(async () => { writeInputs(() => setDayRemark(D, 'Sports day')); notify() })
    await openDay(D)
    expect(title().value).toBe('Sports day')
    await act(async () => { title().focus() })
    await type('#icRmkEdit', 'Sports da')
    const e = await key(title(), 'Escape')
    expect(tid('win-inputsday'), 'the day is still open').toBeTruthy()
    expect(e.defaultPrevented, 'the box took the key').toBe(true)
    expect(title().value, 'the title as last saved shows again').toBe('Sports day')
    expect(DAYRMK[D], 'and nothing was written').toBe('Sports day')
    expect(document.activeElement, 'the keyboard is out of the box').not.toBe(title())
    await key(tid('win-inputsday')!, 'Escape')
    expect(tid('win-inputsday'), 'the second Escape closes the day').toBeNull()
  })
  it('a day with no title, one half typed: Escape leaves it with none', async () => {
    await openDay(D)
    await act(async () => { title().focus() })
    await type('#icRmkEdit', 'half a tit')
    await key(title(), 'Escape')
    expect(tid('win-inputsday')).toBeTruthy()
    expect(title().value).toBe('')
    expect(Object.prototype.hasOwnProperty.call(DAYRMK, D), 'no title was made').toBe(false)
  })
  it('after an Escape the NEXT edit of the title saves as it always did', async () => {
    await act(async () => { writeInputs(() => setDayRemark(D, 'Sports day')); notify() })
    await openDay(D)
    await type('#icRmkEdit', 'given up')
    await key(title(), 'Escape')                                  // pressed with the keyboard elsewhere: no blur follows it
    await type('#icRmkEdit', 'Sports day, 0800')
    await leave()
    expect(DAYRMK[D]).toBe('Sports day, 0800')
  })
  /* An input's window does not block the page (D641), and its own Escape listens ahead of every box on the page. It
     stands down for a key typed in a box outside it, so the title box still has the key first: the window in front,
     and what was typed in it, stay. */
  it('with an input’s window up and IN FRONT, Escape in the title box puts the title back — the window, its typing and the day stay', async () => {
    const r = await single({ date: 'Oct 22', remarks: 'as filed' })
    await act(async () => { writeInputs(() => setDayRemark(D, 'Sports day')); notify() })
    await openDay(D)
    await click(tid('idy-row-' + r.iid)!.querySelector('[data-testid="idy-open"]'))
    await type('#inpEditRmk', 'typed, not saved')
    expect(frontWin()).toBe('inputedit')
    await act(async () => { title().focus() })                    // by the keyboard: no press, so the input's window stays in front
    await type('#icRmkEdit', 'Sports da')
    const e = await key(title(), 'Escape')
    expect(e.defaultPrevented, 'the box took the key').toBe(true)
    expect(title().value).toBe('Sports day')
    expect(DAYRMK[D]).toBe('Sports day')
    expect(tid('win-inputsday'), 'the day stayed').toBeTruthy()
    expect(tid('win-inputedit'), 'the input’s window stayed').toBeTruthy()
    expect(($('#inpEditRmk') as HTMLInputElement).value).toBe('typed, not saved')
  })
  it('THE CONTROL — Enter still saves the title, and leaving the box still saves it', async () => {
    await openDay(D)
    await act(async () => { title().focus() })
    await type('#icRmkEdit', 'Range day')
    const e = await key(title(), 'Enter')
    expect(DAYRMK[D], 'Enter saves').toBe('Range day')
    expect(e.defaultPrevented, 'Enter is not taken from anything else').toBe(false)
    expect(tid('win-inputsday')).toBeTruthy()
    await type('#icRmkEdit', 'Range day, pm')
    await leave()
    expect(DAYRMK[D], 'leaving the box saves').toBe('Range day, pm')
  })
})
