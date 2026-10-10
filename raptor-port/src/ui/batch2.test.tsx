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
     B9  D731 (9) Escape while a note is typed leaves the note box only
   B1's and A9's own files: ui/toastplace.test.ts, ui/quals.test.tsx; B5's: state/reqorphan.test.ts. */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor, askOilIfPending, commitGroup, draftOf, oilAnswered, oilDayLabel, oilSummaryOf, removeEntry, FILING_OFF } from './inputedit'
import { commitChipMove } from './caldrag'
import { initStore, notify, setSession, writeInputs } from '../state/store'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { setMe } from '../state/auth'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS, storeBackend } from '../engine/hooks'
import { PLANPUCKS, addPlanPuck } from '../state/plan'
import { setMembersFile } from '../state/memberfile'
import { docAdd } from '../state/docs'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
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
  it('a man in a shared input he did not file: the entry’s line has no button; HIS OWN line keeps its "Change…"', async () => {
    const g = await shared([member, others()[0]], { ...SAT, oil: { '2026-10-17': 1 } })
    await as('member'); await openOn(g.rows[0])
    expect(tid('oil-revise'), 'the entry’s line: nothing to press').toBeNull()
    expect(tid('oil-revise-own'), 'his own answer is his to change').toBeTruthy()
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
  /* the entry's first name, A to Z — the name the window's own title leads with */
  const first = (rows: any[]) => rows.map(r => cs(r.person)).sort((a, b) => a.localeCompare(b))[0]
  it('"Change…" on a shared duty already answered', async () => {
    const g = await shared(others().slice(0, 2), { ...SAT, oil: { '2026-10-17': 1 } })
    await openOn(g.rows[0]); await click(tid('oil-revise'))
    expect(head()).toBe(`OIL — ${first(g.rows)} +1, Duty`)
    expect(tid('win-inputedit')!.getAttribute('aria-label'), 'the same words as the window’s title').toContain(`${first(g.rows)} +1`)
  })
  it('"Answer…" on a shared duty nobody answered', async () => {
    const g = await shared(others().slice(0, 3), { ...SAT })
    await openOn(g.rows[0]); await click(tid('oil-answer'))
    expect(head()).toBe(`OIL — ${first(g.rows)} +2, Duty`)
  })
  it('the question that follows a move onto a weekend (a bar’s drag)', async () => {
    const g = await shared(others().slice(0, 2), { ...SAT })
    await act(async () => { askOilIfPending(of(g.grp)[0]) })
    expect($$('[data-testid="oilconf"]')).toHaveLength(1)
    expect(head()).toBe(`OIL — ${first(g.rows)} +1, Duty`)
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
  it('THE CONTROL — a man’s OWN answer inside a shared input is headed with his name alone', async () => {
    const g = await shared([member, others()[0]], { ...SAT, oil: { '2026-10-17': 1 } })
    await as('member'); await openOn(g.rows[0]); await click(tid('oil-revise-own'))
    expect(head()).toBe(`OIL — ${cs(member)}, Duty`)
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
describe('D731 (4) — a shared input’s OIL line counts its people where their answers differ', () => {
  const three = () => others().slice(0, 3)
  it('everyone alike: the line reads as before', async () => {
    const g = await shared(three(), { ...SAT, oil: { '2026-10-17': 1 } })
    expect(oilSummaryOf(of(g.grp))).toBe('credited on its non-working day')
    await act(async () => { writeInputs(() => { for (const r of of(g.grp)) r.oil = { '2026-10-17': 0 } }); notify() })
    expect(oilSummaryOf(of(g.grp))).toBe('no OIL on its non-working day')
  })
  it('one of three has said No for himself: "credited for 2 of 3 — <his name>: no" — in the window', async () => {
    const g = await shared(three(), { ...SAT, oil: { '2026-10-17': 1 } })
    await act(async () => { writeInputs(() => { of(g.grp)[2].oil = { '2026-10-17': 0 } }); notify() })
    await openOn(g.rows[0])
    expect($('#inpEditPop .inped-oilsum')!.textContent).toBe(`credited for 2 of 3 — ${cs(g.rows[2].person)}: no`)
  })
  it('…and it is the same line whichever of its records the window was opened on — the one who said No included', async () => {
    const g = await shared(three(), { ...SAT, oil: { '2026-10-17': 1 } })
    await act(async () => { writeInputs(() => { of(g.grp)[0].oil = { '2026-10-17': 0 } }); notify() })
    for (const r of g.rows) {
      await openOn(r)
      expect($('#inpEditPop .inped-oilsum')!.textContent, 'opened on ' + cs(r.person)).toBe(`credited for 2 of 3 — ${cs(g.rows[0].person)}: no`)
      await closeWin()
    }
  })
  it('two of three said No: both are named', async () => {
    const g = await shared(three(), { ...SAT, oil: { '2026-10-17': 1 } })
    await act(async () => { writeInputs(() => { of(g.grp)[0].oil = { '2026-10-17': 0 }; of(g.grp)[1].oil = { '2026-10-17': 0 } }); notify() })
    expect(oilSummaryOf(of(g.grp))).toBe(`credited for 1 of 3 — ${cs(g.rows[0].person)}: no, ${cs(g.rows[1].person)}: no`)
  })
  it('one answered Yes, one never answered: the line counts, the "not answered yet" line names him, and ONE button opens the question', async () => {
    const g = await shared(others().slice(0, 2), { ...SAT })
    await act(async () => { writeInputs(() => { of(g.grp)[1].oil = { '2026-10-17': 1 } }); notify() })
    await openOn(g.rows[0])
    expect($('#inpEditPop .inped-oilsum')!.textContent).toBe('credited for 1 of 2')
    expect(tid('oil-unanswered')!.textContent).toMatch(new RegExp(`Not answered yet — 17 Oct: ${cs(g.rows[0].person)}`))
    expect($$('#inpEditPop [data-testid="oil-answer"], #inpEditPop [data-testid="oil-revise"]')).toHaveLength(1)
  })
  it('two days, one man credited for one of them only: he is named with his days', async () => {
    const g = await shared(others().slice(0, 2), { type: 'Duty', date: 'Oct 17', endDate: 'Oct 18', allday: true, s: 0, e: 1439, oil: { '2026-10-17': 1, '2026-10-18': 1 } })
    await act(async () => { writeInputs(() => { of(g.grp)[1].oil = { '2026-10-17': 1, '2026-10-18': 0 } }); notify() })
    expect(oilSummaryOf(of(g.grp))).toBe(`credited for 2 of 2 — ${cs(g.rows[1].person)}: 1 of 2 days`)
  })
  it('THE CONTROL — a one-person input’s line is untouched', async () => {
    const r = await single({ ...SAT, oil: { '2026-10-17': 0 } })
    expect(oilSummaryOf([r])).toBe('no OIL on its non-working day')
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
  it('the window’s foot: "Filing for other people is switched off — an admin can change this."', async () => {
    const g = await shared([member, others()[0]], { type: 'Duty' }, member)
    await off(); await openOn(g.rows[0])
    expect(tid('inped-ro')!.textContent).toBe(FILING_OFF)
    expect(FILING_OFF).toBe('Filing for other people is switched off — an admin can change this.')
    expect(tid('inped-takeout'), 'he is in it: he may still take himself out, as the rules already say').toBeTruthy()
    expect($('#inpEditSave'), 'and nothing lets him change it for everyone').toBeNull()
  })
  it('a filer who is NOT one of its people reads the same sentence, and is offered nothing', async () => {
    const g = await shared(others().slice(0, 2), { type: 'Duty' }, member)
    await off(); await openOn(g.rows[0])
    expect(tid('inped-ro')!.textContent).toBe(FILING_OFF)
    expect(tid('inped-takeout')).toBeNull()
  })
  it('the other doors say it too: Delete for everyone, a bar’s drag, a save', async () => {
    const g = await shared([member, others()[0]], { type: 'Duty' }, member)
    await off()
    said.length = 0
    await act(async () => { removeEntry(of(g.grp)) })
    expect(said, 'Delete for everyone').toEqual([FILING_OFF])
    said.length = 0
    await act(async () => { commitChipMove({ kind: 'input', iid: g.rows[0].iid }, '2026-10-13', '2026-10-14') })
    expect(said, 'a bar’s drag').toEqual([FILING_OFF])
    said.length = 0
    await act(async () => { commitGroup({ rows: of(g.grp) }, { ...draftOf(of(g.grp)[0]), remarks: 'changed' }, of(g.grp).map(r => String(r.person))) })
    expect(said, 'a save').toEqual([FILING_OFF])
    expect(of(g.grp).map(r => r.remarks), 'and nothing was written by any of them').toEqual(['brief', 'brief'])
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
  it('THE CONTROL — an ALL AVAIL input an ADMIN filed still names him to a member', async () => {
    const ph = Object.keys(PEOPLE).find(id => PEOPLE[id].special)!
    const r = await single({ person: ph, type: 'Duty', date: 'Oct 20', by: admin, remarks: '' })
    await off(); await openOn(r)
    expect(tid('inped-ro')!.textContent).toBe(`Only ${cs(admin)} — who filed it — or an admin can change this.`)
  })
  /* Astra's scenario 9 (10 Oct 26), an older fault on the same door: the opened day asks "Delete this input for all 2
     people?"; the switch is turned off while the question stands; "Delete" then took HIM out — an answer to a question
     nobody had asked. What was asked is what is done, or it is refused in words. */
  it('the day’s "Delete for all?" question, the switch turned off while it stands: Delete is refused — it never becomes "take me out"', async () => {
    const g = await shared([member, others()[0]], { type: 'Duty', date: 'Oct 20' }, member)
    await as('member')
    await openDay('2026-10-20')
    await key(tid('idy-row-' + tid('idy-list')!.querySelector('[data-testid^="idy-row-"]')!.getAttribute('data-popiid'))!.querySelector('[data-testid="idy-open"]')!, 'Delete')
    expect(tid('idy-ask')!.textContent).toContain('Delete this input for all 2 people?')
    await off()
    said.length = 0
    await click(tid('idy-del-yes'))
    expect(of(g.grp), 'nobody was taken out').toHaveLength(2)
    expect(said).toEqual([FILING_OFF])
  })
  it('THE CONTROL — the switch ON: the filer changes it as before, and is told nothing', async () => {
    const g = await shared([member, others()[0]], { type: 'Duty' }, member)
    await as('member'); await openOn(g.rows[0])
    expect(tid('inped-ro')).toBeNull()
    expect($('#inpEditSave')).toBeTruthy()
  })
  it('THE CONTROL — a man in it who did NOT file it is still told who did', async () => {
    const g = await shared([member, others()[0]], { type: 'Duty' })                 // filed by the admin
    await off(); await openOn(g.rows[0])
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
