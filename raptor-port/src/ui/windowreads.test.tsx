// @vitest-environment jsdom
/* WHAT THE TWO BLIND READS OF THE CODE FOUND IN THE INPUT'S WINDOW ([INPUT-LIST-AS-DAY-CARD], 10 Oct 26 — Astra and Sol 6.1,
   each reading the finished code with the check's sheet in hand: docs/superpowers/briefs/2026-10-10-reads/). The list's
   pencil is gone (owner D718), so the window is now THE form that changes an input — its dates too — and the phone's
   only way to an OIL answer. Four things in it were wrong for what it is now asked to do; each case here failed first.

   R1 (both readers, HIGH)  a medical entry moved ACROSS A YEAR: the question "which status holds these days" was worked
                             out in the record's old year while the save wrote in the loaded one — no question, and the
                             other medical entry cut in silence.
   R2 (both readers)        a member moving his war-approved leave to the SAME day of another year kept its approval.
   R3 (both readers)        an OIL answer alone, given in the window, moved the input's late date — an on-time input
                             turned LATE for answering a question (the desktop row's chip never did that).
   R4 (Sol)                 a man in a shared input he did not file could not answer his own unanswered OIL question
                             from its window — only revise one already given.
                             RETIRED BY D762 (11 Oct 26 — "one answer for all, nothing more"), built with the one
                             record (`[ALL-AVAIL-AS-MEMBER]` step 2): no man in an input of several gives an OIL answer
                             of his own, so "Your OIL" and its two buttons are gone. What stands in R4's place is
                             pinned in its block below: the question is the INPUT's, and whoever may change the input
                             answers it from the window, once, for everyone. */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor, draftOf, medAskFor } from './inputedit'
import { initStore, notify, setSession, undo, writeInputs } from '../state/store'
import { setInpMode, setInpView, setPage } from '../state/view'
import { setMe } from '../state/auth'
import { INPUTS, baseYear, holds, idsOf, isLateInput, nowStamp, peopleOf } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS, storeBackend } from '../engine/hooks'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { _resetFloatWins } from './FloatWindow'
import { setInpEdit } from './pops'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(INPUTS)
const said: string[] = []
const realToast = HOOKS.toast
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const tid = (id: string) => $(`#inpEditPop [data-testid="${id}"]`) || $(`[data-testid="${id}"]`)
const win = () => $('[data-testid="win-inputedit"]')
const cs = (id: any) => PEOPLE[id].cs as string
const admin = 'stiff', member = 'bane'
const others = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers && id !== admin && id !== member)
const live = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
const type = async (sel: string, v: string) => {
  const el = $(sel) as HTMLInputElement
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })) })
}
let n = 0
const single = async (over: any = {}) => {
  const row = { iid: 'wr' + (++n), person: others()[0], type: 'Meeting', date: 'Oct 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'solo', mod: '2026-09-01', ...over }
  await act(async () => { writeInputs(() => { INPUTS.push(row) }); notify() })
  return live(row.iid)
}
/* a shared input as it is kept since the one-rule build: ONE record with the list of its people, one filer, one OIL
   answer for everyone in it (owner D756, D762) — a duty on Saturday 17 Oct 26, filed by the admin */
const shared = async (people: string[], over: any = {}) => {
  const at = new Date(2026, 8, 1, 8, 0).getTime()
  const rec: any = { iid: 'gR' + (++n), type: 'Duty', date: 'Oct 17', yr: 2026, allday: true, s: 0, e: 1439,
    remarks: '', mod: '2026-09-01', by: admin, at, ...over }
  rec.people = people.map(p => ({ p, by: admin, at }))
  await act(async () => { writeInputs(() => { INPUTS.push(rec) }); notify() })
  return live(rec.iid)
}
const openOn = async (r: any) => act(async () => { setInpEdit(live(r.iid)); notify() })
const as = async (who: 'admin' | 'member') => act(async () => {
  if (who === 'admin') { setSession({ user: admin, role: 'admin' }); setMe(admin) } else { setSession({ user: member, role: 'main' }); setMe(member) }
  notify()
})
/* the window's calendar, turned back or on by whole months, then a day tapped */
const turn = async (months: number) => { for (let i = 0; i < Math.abs(months); i++) await click($(`#inpEditPop #inpEdCal .dcal-nav[aria-label="${months < 0 ? 'Previous' : 'Next'} month"]`)) }
const day = (iso: string) => $(`#inpEditPop #inpEdCal [data-iso="${iso}"]`)

beforeEach(async () => {
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore(); setSession({ user: admin, role: 'admin' }); setMe(admin); lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('cal')
  said.length = 0; HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
})
afterEach(async () => {
  await act(async () => { root.unmount(); setInpEdit(null) })
  HOOKS.toast = realToast
  host.remove(); _resetFloatWins()
})

describe('R1 — a medical entry moved across a year is asked about in the year it is moved TO', () => {
  it('the fixture: the loaded year is 2026', () => { expect(baseYear()).toBe(2026) })
  it('a downchit of next year moved onto another medical entry of THIS year: the clash question comes before anything is written', async () => {
    const who = others()[0]
    const attb = await single({ person: who, type: 'ATT B', date: 'Jan 15', endDate: 'Jan 19', yr: 2026, allday: true, s: 0, e: 1439, remarks: 'till 19 Jan' })
    const attc = await single({ person: who, type: 'ATT C', date: 'Jan 10', endDate: 'Jan 12', yr: 2027, allday: true, s: 0, e: 1439, remarks: 'till 12 Jan' })
    await openOn(attc)
    expect(day('2027-01-10'), 'the calendar opens on the record’s own year').toBeTruthy()
    await turn(-12)
    await click(day('2026-01-16')); await click(day('2026-01-17'))
    await click($('#inpEditSave'))
    expect($('[data-testid="medclash"]'), 'the question is asked').toBeTruthy()
    expect($('[data-testid="medclash"]')!.textContent, 'about the days of 2026 (printed day first, as the sheet prints its dates — D1096)').toMatch(/16 Jan/)
    expect([live(attb.iid).date, live(attb.iid).endDate], 'the other medical entry is untouched until he chooses').toEqual(['Jan 15', 'Jan 19'])
    expect([live(attc.iid).date, live(attc.iid).yr], 'and so is the one being moved').toEqual(['Jan 10', 2027])
    expect(INPUTS.filter((r: any) => holds(r, who) && r.type === 'ATT B'), 'nothing was split').toHaveLength(1)
  })
  it('the shared question body (the calendar’s drag and the schedule’s hand-over use it too) reads the same year', async () => {
    const who = others()[0]
    await single({ person: who, type: 'ATT B', date: 'Jan 15', endDate: 'Jan 19', yr: 2026, allday: true, s: 0, e: 1439 })
    const attc = await single({ person: who, type: 'ATT C', date: 'Jan 10', endDate: 'Jan 12', yr: 2027, allday: true, s: 0, e: 1439 })
    const ask = medAskFor(attc, { ...draftOf(attc), start: '2026-01-16', end: '2026-01-17' }) as any
    expect(ask && ask.kind, 'a clash, found in 2026').toBe('clash')
    expect([ask.a, ask.b]).toEqual([20260116, 20260117])
  })
  it('THE CONTROL — moved to days of this year that nothing else holds: no question, and it is saved there', async () => {
    const who = others()[0]
    await single({ person: who, type: 'ATT B', date: 'Jan 15', endDate: 'Jan 19', yr: 2026, allday: true, s: 0, e: 1439 })
    const attc = await single({ person: who, type: 'ATT C', date: 'Jan 10', endDate: 'Jan 12', yr: 2027, allday: true, s: 0, e: 1439 })
    await openOn(attc)
    await turn(-12)
    await click(day('2026-01-26')); await click(day('2026-01-27'))
    await click($('#inpEditSave'))
    expect($('[data-testid="medclash"]')).toBeNull()
    expect([live(attc.iid).date, live(attc.iid).endDate, live(attc.iid).yr], said.join(' | ')).toEqual(['Jan 26', 'Jan 27', 2026])
  })
  it('an upchit of next year moved into this year: its summary is worked out for the day it is moved to', async () => {
    const who = others()[0]
    const down = await single({ person: who, type: 'OML', date: 'Jan 5', endDate: 'Jan 20', yr: 2026, allday: true, s: 0, e: 1439 })
    const up = await single({ person: who, type: 'Upchit', date: 'Jan 8', yr: 2027, allday: true, s: 0, e: 1439 })
    const ask = medAskFor(up, { ...draftOf(up), start: '2026-01-12', end: '' }) as any
    expect(ask && ask.kind).toBe('up')
    expect(JSON.stringify(ask.effects), 'it names the downchit it would end, in 2026').toContain(down.iid)
  })
})

describe('R2 — a member’s war-approved leave moved to the same day of another year is no longer war-approved', () => {
  const approved = (over: any = {}) => single({ person: member, by: member, type: 'LL', date: 'Oct 20', yr: 2027, allday: true, s: 0, e: 1439, remarks: 'on 20 Oct', lw: 'w27', ...over })
  it('the member moves it from 20 Oct 2027 to 20 Oct 2026 in its window: the approval mark is cleared', async () => {
    const r = await approved()
    await as('member')
    await openOn(r)
    await turn(-12)
    await click(day('2026-10-20'))
    await click($('#inpEditSave'))
    expect([live(r.iid).date, live(r.iid).yr], said.join(' | ')).toEqual(['Oct 20', 2026])
    expect('lw' in live(r.iid), 'a date he changed himself is filed on the Inputs page, not approved on the war').toBe(false)
    await act(async () => { undo(); notify() })
    expect([live(r.iid).yr, live(r.iid).lw], 'Undo puts back the year and the approval').toEqual([2027, 'w27'])
  })
  it('THE CONTROLS — his remarks alone keep the approval; an admin’s move keeps it', async () => {
    const r = await approved()
    await as('member')
    await openOn(r)
    await type('#inpEditRmk', 'on 20 Oct, back by six')
    await click($('#inpEditSave'))
    expect(live(r.iid).lw, 'remarks only').toBe('w27')
    await as('admin')
    await openOn(live(r.iid))
    await turn(-12)
    await click(day('2026-10-20'))
    await click($('#inpEditSave'))
    expect([live(r.iid).yr, live(r.iid).lw], 'an admin’s move').toEqual([2026, 'w27'])
  })
})

describe('R3 — an OIL answer given alone in the window does not move the input’s late date', () => {
  it('"Answer…" on an input nothing else of which is changed: the answer is saved, its late date is as it was, and it is not LATE', async () => {
    const r = await single({ type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439 })
    expect(isLateInput(r), 'on time to start with').toBe(false)
    await openOn(r)
    await click(tid('oil-answer'))
    await click(tid('oil-yes')); await click(tid('oilconf-save'))
    expect(live(r.iid).oil).toEqual({ '2026-10-17': 1 })
    expect(live(r.iid).mod, 'the date the late rule reads').toBe('2026-09-01')
    expect(isLateInput(live(r.iid))).toBe(false)
    expect(live(r.iid).modAt, 'the change is stamped all the same (who answered, and when)').toBeTruthy()
    await act(async () => { undo(); notify() })
    expect(live(r.iid).oil, 'one Undo takes the answer back').toBeFalsy()
  })
  it('"Change…" on an answered input, nothing else changed: the same', async () => {
    const r = await single({ type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439, oil: { '2026-10-17': 1 } })
    await openOn(r)
    await click(tid('oil-revise'))
    await click(tid('oil-no')); await click(tid('oilconf-save'))
    expect(live(r.iid).oil).toEqual({ '2026-10-17': 0 })
    expect(live(r.iid).mod).toBe('2026-09-01')
  })
  it('THE CONTROL — an answer given WITH a change of the input (its remarks) is one save of both, and the late date moves as for any change', async () => {
    const r = await single({ type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439 })
    await openOn(r)
    await type('#inpEditRmk', 'gate guard')
    await click(tid('oil-answer'))
    await click(tid('oil-yes')); await click(tid('oilconf-save'))
    expect([live(r.iid).remarks, live(r.iid).oil]).toEqual(['gate guard', { '2026-10-17': 1 }])
    expect(live(r.iid).mod).toBe(nowStamp())
    await act(async () => { undo(); notify() })
    expect([live(r.iid).remarks, live(r.iid).oil || null], 'ONE Undo for the two').toEqual(['solo', null])
  })
})

/* R4, AS IT STANDS SINCE D762 (see the head of this file). The describe keeps its tag; its three cases are re-expressed:
     · "'Your OIL: not answered yet' with 'Answer…' … his answer goes on his record alone" — RETIRED: he has no answer of
       his own. In its place: he reads the input's unanswered line and is offered nothing to press; whoever may change
       the input answers it from the same window, ONCE, for everyone — and nobody's late date moves (R3, still).
     · "once he has answered, the line is 'Your OIL: …' with 'Change…'" — RETIRED: in its place, once the input is
       answered he reads its ONE answer, with no button and no line of his own.
     · THE CONTROL — a reader who is not in it gets neither: unchanged, on the one record. */
describe('R4 — the OIL question of a shared input is the INPUT’s: a man in it who did not file it has none of his own (D762)', () => {
  it('unanswered: he reads "Not answered yet — 17 Oct" with nothing to press — no "Your OIL", no "Answer…" of his own; whoever may change the input answers it from its window, once, for everyone', async () => {
    const [a] = others()
    const rec = await shared([a, member])
    await as('member')
    await openOn(rec)
    expect($('#inpEditSave'), 'the input is not his to change').toBeNull()
    expect(tid('oil-unanswered')!.querySelector('.inped-oilsum')!.textContent, 'he reads that it is unanswered').toBe('Not answered yet — 17 Oct')
    expect(tid('oil-answer-own'), 'no answer of his own to give (D762)').toBeNull()
    expect(tid('oil-answer'), 'and the input’s question is not his to answer').toBeNull()
    expect(win()!.textContent, 'no "Your OIL" line').not.toMatch(/Your OIL/)
    expect(tid('inped-takeout'), 'what is his: to take himself out').toBeTruthy()
    expect(live(rec.iid).oil, 'nothing was written').toBeFalsy()
    await act(async () => { setInpEdit(null); notify() })
    /* …and the one who may change it — here the admin who filed it — answers from the same window */
    await as('admin')
    await openOn(rec)
    await click(tid('oil-answer'))
    expect($$('[data-testid="oilconf"]')).toHaveLength(1)
    await click(tid('oil-yes')); await click(tid('oilconf-save'))
    expect(live(rec.iid).oil, 'ONE answer, on the one record').toEqual({ '2026-10-17': 1 })
    expect(idsOf(live(rec.iid)), 'for both of its people').toEqual([a, member])
    expect([live(rec.iid).mod, ...peopleOf(live(rec.iid)).map((e: any) => e.mod)], 'and nobody’s late date moves').toEqual(['2026-09-01', undefined, undefined])
  })
  it('answered: he reads the input’s ONE answer — no "Change…", no "Answer…", and no line of his own', async () => {
    const [a] = others()
    const rec = await shared([a, member], { oil: { '2026-10-17': 0 } })
    await as('member')
    await openOn(rec)
    expect($$('#inpEditPop .inped-oilsum').map(x => x.textContent)).toEqual(['no OIL on its non-working day'])
    expect(tid('oil-revise'), 'the input’s answer is not his to change').toBeNull()
    expect(tid('oil-revise-own'), 'and he has none of his own (D762)').toBeNull()
    expect(tid('oil-answer-own')).toBeNull()
    expect(tid('oil-answer')).toBeNull()
  })
  it('THE CONTROL — a reader who is not in it gets neither', async () => {
    const [a, b] = others()
    const rec = await shared([a, b])
    await as('member')
    await openOn(rec)
    expect(tid('oil-answer-own')).toBeNull(); expect(tid('oil-revise-own')).toBeNull()
    expect(tid('oil-answer'), 'nor the input’s own button').toBeNull()
    expect(tid('inped-takeout'), 'and he is not in it: nothing to take himself out of').toBeNull()
  })
})
