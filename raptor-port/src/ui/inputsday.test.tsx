// @vitest-environment jsdom
/* A DAY OPENED ON THE INPUTS CALENDAR (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md
   §3.6 — "a day opened lists its inputs with who placed each and when, the late tag where it applies, and '+ Input'";
   §3.5 — "the Inputs calendar's opened day lists and scrolls the same way"; §3.7 — it is one of the windows of D641).

   Owner, D641 (7 Oct 26): "all those pop up windows … should be able to drag around and the background still works
   (clickable editable) when this window is up" — so it is a window on the shell, with no veil, and the month behind it
   answers. D629: "show who placed that input at what time and day? A small one." D646: a LATE tag, pressed, says the
   cut-off it missed. D648: everyone is listed and the list scrolls — never "+ more" inside the day.

   The first calendar's day was a sheet over a dimmed page that a press outside closed (22 Aug 26). Its planning layer —
   the day's title, the notes, the pucks rows — is kept inside the window as it was (ui/inputscal.test.tsx pins it). */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor } from './inputedit'
import { initStore, notify, setSession } from '../state/store'
import { requestPlanReveal, setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { storeBackend } from '../engine/hooks'
import { setFlyDays } from '../state/flyplan'
import { PLANPUCKS, addPlanPuck } from '../state/plan'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { _resetFloatWins } from './FloatWindow'
import { INPEDIT, setInpEdit } from './pops'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(INPUTS)
const $ = (sel: string) => host.querySelector(sel) as HTMLElement | null
const $$ = (sel: string) => Array.from(host.querySelectorAll(sel)) as HTMLElement[]
const tid = (id: string) => $(`[data-testid="${id}"]`)
const win = () => tid('win-inputsday')
const day = (iso: string) => $(`[data-icday="${iso}"]`)!
const crew = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers)
const cs = (id: string) => PEOPLE[id].cs
let n = 0
const file = async (over: any) => {
  const row = { iid: 'day' + (++n), person: crew()[0], type: 'LL', date: 'Oct 7', yr: 2026, allday: true, s: 360, e: 1080, mod: '2026-09-01', ...over }
  await act(async () => { INPUTS.push(row); notify() })
  return row as any
}
const open = async (iso: string) => act(async () => { day(iso).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })) })
const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
const row = (r: any) => tid('idy-row-' + r.iid)!
const T = (d: number, h: number, m: number) => new Date(2026, 9, d, h, m).getTime()

beforeEach(async () => {
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore(); setSession({ user: 'a', role: 'admin' }); lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('cal'); setCalMonth({ y: 2026, m: 10 })
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
  await act(async () => { setCalMonth({ y: 2026, m: 10 }); notify() })
})
afterEach(async () => {
  await act(async () => { root.unmount(); setInpEdit(null) })
  host.remove(); _resetFloatWins(); setSession(null); storeBackend.impl = null
})

describe('the day opens in a window, and the month behind it still works (D641)', () => {
  it('a window on the shell: its own title, no veil over the page, and it does not take the page away', async () => {
    await open('2026-10-07')
    expect(win()).toBeTruthy()
    expect(win()!.getAttribute('role')).toBe('dialog'); expect(win()!.getAttribute('aria-modal')).toBe('false')
    expect(win()!.querySelector('.win-ttl')!.textContent).toContain('Wed 7 Oct')
    expect($('.ic-popwrap'), 'no veil is drawn over the month').toBeNull()
  })
  it('says what kind of day it is under the title, where it is one', async () => {
    await act(async () => { setFlyDays([{ iso: '2026-10-07', cls: 'nf' }]) })
    await open('2026-10-07')
    expect(win()!.textContent).toContain('No fly')
    await open('2026-10-08')
    expect(win()!.textContent).not.toContain('No fly')
  })
  it('a press on the page outside it does not close it; another date re-points the SAME window', async () => {
    await open('2026-10-07')
    await act(async () => { document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true })); document.body.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(win(), 'still up').toBeTruthy()
    await open('2026-10-09')
    expect($$('[data-testid="win-inputsday"]')).toHaveLength(1)
    expect(win()!.querySelector('.win-ttl')!.textContent).toContain('Fri 9 Oct')
    expect(day('2026-10-09').classList.contains('is-open')).toBe(true); expect(day('2026-10-07').classList.contains('is-open')).toBe(false)
  })
  it('it closes by its own cross, and by Escape', async () => {
    await open('2026-10-07')
    await click(tid('win-inputsday-x'))
    expect(win()).toBeNull()
    await open('2026-10-07')
    await act(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })
    expect(win()).toBeNull()
    expect($('#inpCal'), 'and the calendar stays').toBeTruthy()
  })
  it('an input filed behind the open window shows in it at once', async () => {
    await open('2026-10-07')
    expect(tid('idy-empty')).toBeTruthy()
    const r = await file({ date: 'Oct 7' })
    expect(row(r)).toBeTruthy()
    expect(tid('idy-empty')).toBeNull()
  })
})

describe('it lists the day’s inputs', () => {
  it('one line each: who, the kind, and when — "All day", the hours, or how long it runs on', async () => {
    const [a, b, c] = crew()
    const leave = await file({ person: a, type: 'LL', date: 'Oct 7' })
    const timed = await file({ person: b, type: 'Meeting', date: 'Oct 7', allday: false, s: 840, e: 960 })
    const long = await file({ person: c, type: 'OML', date: 'Oct 6', endDate: 'Oct 9' })
    await open('2026-10-07')
    expect(tid('idy-count')!.textContent).toBe('3 inputs')
    expect(row(leave).textContent).toContain(cs(a)); expect(row(leave).textContent).toContain('LL')
    expect(row(leave).querySelector('[data-testid="idy-when"]')!.textContent).toBe('All day')
    expect(row(timed).querySelector('[data-testid="idy-when"]')!.textContent).toBe('14:00–16:00')
    expect(row(long).querySelector('[data-testid="idy-when"]')!.textContent).toBe('till 9 Oct')
    /* absences first, then commitments */
    expect($$('[data-testid^="idy-row-"]').map(el => el.dataset.popiid).indexOf(timed.iid)).toBe(2)
  })
  it('one input says "1 input"; none says so, and how to add one', async () => {
    await file({ date: 'Oct 7' })
    await open('2026-10-07'); expect(tid('idy-count')!.textContent).toBe('1 input')
    await open('2026-10-08')
    expect(tid('idy-count')).toBeNull(); expect(tid('idy-empty')!.textContent).toMatch(/No inputs/)
  })
  it('everyone is listed, however many — never "+ more" inside the day (D648)', async () => {
    const rows: any[] = []
    for (const p of crew().slice(0, 12)) rows.push(await file({ person: p, date: 'Oct 21' }))
    await open('2026-10-21')
    expect($$('[data-testid^="idy-row-"]')).toHaveLength(12)
    expect(win()!.textContent).not.toMatch(/\+\d+ more/)
  })
  it('SANS availability is not listed here (D620)', async () => {
    const sans = Object.keys(PEOPLE).find(id => PEOPLE[id].san && !PEOPLE[id].archived)!
    await file({ person: sans, type: 'SANS Availability', sans: { f: true } })
    await open('2026-10-07')
    expect($$('[data-testid^="idy-row-"]')).toHaveLength(0)
  })
  it('a remark is said under the line; an Other, which is NAMED by its remark, does not say it twice', async () => {
    const a = await file({ type: 'Meeting', allday: false, s: 600, e: 660, remarks: 'Bring the folder' })
    const b = await file({ person: crew()[1], type: 'Other', allday: false, s: 600, e: 660, remarks: 'Dental' })
    await open('2026-10-07')
    expect(row(a).querySelector('.sd-rmk')!.textContent).toBe('Bring the folder')
    expect(row(b).textContent).toContain('Dental'); expect(row(b).querySelector('.sd-rmk')).toBeNull()
  })
})

describe('who placed each, and when (D629)', () => {
  it('a small line under the input: the filer, for whom where that is someone else, and its last change', async () => {
    const [a, b] = crew()
    const own = await file({ person: a, by: a, at: T(2, 9, 10), modBy: a, modAt: T(2, 9, 10) })
    const forHim = await file({ person: b, by: a, at: T(3, 17, 20), modBy: b, modAt: T(4, 8, 5) })
    await open('2026-10-07')
    /* SHORT in an opened day (owner D701, 9 Oct 26 — drawing B: "Grit · 12 Jul, 14:42"): the name, the date, the time —
       no "Placed by", no year in the day's own year; the full line is the small print's name for a pointer and a reader */
    expect(row(own).querySelector('[data-testid="idy-placed"]')!.textContent).toBe(`${cs(a)} · 2 Oct, 09:10`)
    expect(row(own).querySelector('[data-testid="idy-placed"]')!.getAttribute('title')).toBe(`Placed by ${cs(a)} · 2 Oct 26, 09:10`)
    expect(row(forHim).querySelector('[data-testid="idy-placed"]')!.textContent).toBe(`${cs(a)} for ${cs(b)} · 3 Oct, 17:20 · changed by ${cs(b)} · 4 Oct, 08:05`)
  })
  it('the remark and the small print share one line of the card — the remark first (D699, D701)', async () => {
    const [a] = crew()
    const r = await file({ person: a, by: a, at: T(2, 9, 10), modBy: a, modAt: T(2, 9, 10), remarks: 'Dental' })
    const bare = await file({ person: a, by: a, at: T(2, 9, 10), modBy: a, modAt: T(2, 9, 10) })
    await open('2026-10-07')
    const foot = row(r).querySelector('.sd-foot')!
    expect([...foot.children].map(c => c.className.split(' ')[0])).toEqual(['sd-rmk', 'sd-placed'])
    /* no remark: the small print alone, in the same line of the card */
    expect([...row(bare).querySelector('.sd-foot')!.children].map(c => c.className.split(' ')[0])).toEqual(['sd-placed'])
  })
  it('a record that never recorded who placed it shows no line (D56)', async () => {
    const r = await file({})
    await open('2026-10-07')
    expect(row(r).querySelector('[data-testid="idy-placed"]')).toBeNull()
  })
})

describe('the LATE tag (D646)', () => {
  it('a late input wears it; pressed, it says the cut-off it missed — and does not open the input', async () => {
    const late = await file({ type: 'Meeting', date: 'Oct 21', allday: false, s: 600, e: 660, mod: '2026-10-20' })
    const onTime = await file({ person: crew()[1], type: 'Meeting', date: 'Oct 21', allday: false, s: 600, e: 660, mod: '2026-09-01' })
    await open('2026-10-21')
    const tag = row(late).querySelector('[data-testid="idy-late"]') as HTMLElement
    expect(tag, 'the late one wears LATE').toBeTruthy()
    expect(row(onTime).querySelector('[data-testid="idy-late"]')).toBeNull()
    expect(row(late).querySelector('[data-testid="idy-latenote"]')).toBeNull()
    await click(tag)
    expect(row(late).querySelector('[data-testid="idy-latenote"]')!.textContent).toMatch(/^after the cut-off, \w{3} \d{1,2} \w{3}$/)
    expect(INPEDIT, 'the tag is its own button').toBeNull()
    await click(tag)
    expect(row(late).querySelector('[data-testid="idy-latenote"]')).toBeNull()
  })
  it('a downchit is never late', async () => {
    const r = await file({ type: 'OML', date: 'Oct 21', mod: '2026-10-20' })
    await open('2026-10-21')
    expect(row(r).querySelector('[data-testid="idy-late"]')).toBeNull()
  })
})

describe('what it opens', () => {
  it('"+ Input" files for that day — and offers no SANS availability', async () => {
    await open('2026-10-07')
    await click($('#icPopAdd'))
    expect(INPEDIT).toMatchObject({ _new: true, date: 'Oct 7' })
    expect(Array.from(host.querySelectorAll('#inpEditType option')).map(o => (o as HTMLOptionElement).value)).not.toContain('SANS Availability')
  })
  it('a press on a line opens that input', async () => {
    const r = await file({})
    await open('2026-10-07')
    await click(row(r).querySelector('[data-testid="idy-open"]'))
    expect(INPEDIT && INPEDIT.iid).toBe(r.iid)
  })
  it('the line’s button says the input whole to a screen reader', async () => {
    const r = await file({ type: 'Meeting', allday: false, s: 840, e: 960 })
    await open('2026-10-07')
    expect(row(r).querySelector('[data-testid="idy-open"]')!.getAttribute('aria-label')).toBe(`${cs(r.person)}, Meeting, 14:00–16:00`)
  })
})

/* HIS LOOK AT THE BUILT DAY ON HIS PHONE (owner D683, 9 Oct 26 — with a picture of Thu 16 Jul: "Can u show the window to
   like a tall size when someone clicks on a day for input. Day title and input can be slightly shorter in height. +note
   and pucks can shift it to to beside the day title in this case on the right of thu 16 jul"). */
describe('the day as he asked for it on his phone (D683)', () => {
  const asPhone = (on: boolean) => { (window as any).matchMedia = (q: string) => ({ matches: on && /max-width:\s*620px/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }) }
  afterEach(() => asPhone(false))
  it('on a phone it OPENS tall; a tap on its bar brings it down to the shorter height, and another takes it back up', async () => {
    asPhone(true)
    await open('2026-10-07')
    expect(win()!.className, 'tall as it opens').toContain('is-tall')
    const bar = win()!.querySelector('.win-ttl')!
    await click(bar)
    expect(win()!.className).not.toContain('is-tall')
    await click(bar)
    expect(win()!.className).toContain('is-tall')
  })
  it('opened again on another date it is tall again — it does not remember having been pulled down', async () => {
    asPhone(true)
    await open('2026-10-07')
    await click(win()!.querySelector('.win-ttl')!)
    await click(tid('win-inputsday-x'))
    await open('2026-10-08')
    expect(win()!.className).toContain('is-tall')
  })
  it('on a desktop nothing is made tall', async () => {
    await open('2026-10-07')
    expect(win()!.className).not.toContain('is-tall')
  })
  it('"+ Note" is in the window’s top bar, after the date — and "+ Pucks" is gone: a note carries its own (D684)', async () => {
    await open('2026-10-07')
    const bar = win()!.querySelector('.win-bar')!
    expect(bar.querySelector('#icAddPuck'), '+ Note in the bar').toBeTruthy()
    expect($('#icAddPucks'), 'no separate "+ Pucks" anywhere').toBeNull()
    const order = Array.from(bar.children).map(c => c.className.split(' ')[0])
    expect(order.indexOf('win-tools'), 'after the date, before the cross').toBeGreaterThan(order.indexOf('win-ttl'))
    expect(order.indexOf('win-tools')).toBeLessThan(order.indexOf('win-x'))
    expect(win()!.querySelector('.win-body #icAddPuck')).toBeNull()
  })
  it('"+ Note" opens the note box, and the "+ people" beside it the people to pick', async () => {
    await open('2026-10-07')
    await click($('#icAddPuck'))
    expect($('.ic-poppuck-edit'), 'the note box').toBeTruthy()
    await click($('#icNewNotePpl'))
    expect($('.ic-pick'), 'the people to pick').toBeTruthy()
    expect($('.ic-newnote'), 'the note box has handed over to the picker').toBeNull()
  })
  it('a press on one of them is not a press on the bar: on a phone the window keeps its height', async () => {
    asPhone(true)
    await open('2026-10-07')
    expect(win()!.className).toContain('is-tall')
    await click($('#icAddPuck'))
    expect(win()!.className, 'still tall').toContain('is-tall')
  })
  it('a member’s bar carries the date alone', async () => {
    await act(async () => { setSession({ user: 'us', role: 'main' }); notify() })
    await open('2026-10-07')
    expect(win()!.querySelector('.win-tools')).toBeNull()
    expect($('#icAddPuck')).toBeNull(); expect($('#icNewNotePpl')).toBeNull()
  })
})

/* A NOTE CARRIES ITS OWN PUCKS (owner D684, 9 Oct 26 — "For the +note, perhaps just have a function to add pucks on the
   text written, instead of a +pucks button"; D688 compact; D689 a person taken off as before; D692 drawing A; D695 a
   note may hold people and no words). The saved record's rules are state/plan.test.ts; here, what the window does. */
describe('a note carries its own pucks (D684, D695)', () => {
  const D = '2026-10-07'
  const notes = () => PLANPUCKS.filter((p: any) => p.date === D)
  const type = async (el: Element | null, v: string) => { expect(el, 'a box to type in').toBeTruthy(); await act(async () => { const i = el as HTMLInputElement; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(i, v); i.dispatchEvent(new Event('input', { bubbles: true })) }) }
  const blur = async (el: Element | null) => act(async () => { (el as HTMLElement).dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
  const pickFirst = async (n: number) => { const ps = $$('.ic-pickp:not(.already)').slice(0, n); for (const b of ps) await click(b); await click($('#icPickOk')); return ps.map(b => b.getAttribute('data-pickp')!) }
  /* cleared straight from the store, whoever the test left signed in (a member's delete is refused, rightly) */
  afterEach(async () => { await act(async () => { for (let i = PLANPUCKS.length - 1; i >= 0; i--) if (PLANPUCKS[i].date === D) PLANPUCKS.splice(i, 1); notify() }) })

  it('a note with words has a small "+" among its buttons: it opens the people to pick, and they land on THAT note, four across, the dashed "+" the last of them', async () => {
    await act(async () => { addPlanPuck(D, 'Brief the new guys, 0800'); notify() })
    await open(D)
    const id = notes()[0].id, box = () => tid('idy-note-' + id)!
    expect(box().querySelector('.ic-poppuck-txt')!.textContent).toBe('Brief the new guys, 0800')
    expect(box().querySelector('.ic-secpk-grid'), 'no people, no row of people').toBeNull()
    await click(box().querySelector('[data-pkadd]'))
    expect($('.ic-pick')).toBeTruthy()
    const picked = await pickFirst(2)
    expect(notes().length, 'no second note').toBe(1)
    expect(notes()[0].ids).toEqual(picked)
    expect(box().className).toContain('has-ppl')
    const cells = Array.from(box().querySelector('.ic-secpk-grid')!.children)
    expect(cells.length, 'two pucks and the "+"').toBe(3)
    expect(cells[2].matches('button.ic-pkadd'), 'the "+" is the last of them').toBe(true)
    expect(box().querySelectorAll('[data-pkadd]').length, 'one "+" — the small one among the buttons has gone').toBe(1)
    /* its "+" again: the men already on it are ticked and locked, and one more is added to the same note */
    await click(cells[2])
    expect($$('.ic-pickp.already').length).toBe(2)
    await pickFirst(1)
    expect(notes()[0].ids.length).toBe(3); expect(notes().length).toBe(1)
  })
  it('a note of people and no words draws no line of words: its people, the "+", then the pencil and the cross — and the pencil adds words later', async () => {
    const [a, b] = crew()
    await act(async () => { addPlanPuck(D, '', [a, b]); notify() })
    await open(D)
    const id = notes()[0].id, box = () => tid('idy-note-' + id)!
    expect(box().className).toContain('no-words')
    expect(box().querySelector('.ic-poppuck-txt')).toBeNull()
    expect(Array.from(box().children).map(c => c.tagName === 'BUTTON' ? 'button' : c.className.split(' ')[0]), 'the people first, the two buttons after').toEqual(['ic-secpucks', 'button', 'button'])
    await click(box().querySelector('[data-ppedit]'))
    const edit = box().querySelector('.ic-poppuck-edit')
    expect(edit, 'a box for its words').toBeTruthy()
    expect(box().querySelector('.ic-secpk-grid'), 'its people stay in sight while the words are typed').toBeTruthy()
    await type(edit, 'Range party'); await blur(edit)
    expect(notes()[0].text).toBe('Range party'); expect(notes()[0].ids).toEqual([a, b])
    expect(box().className).not.toContain('no-words')
  })
  it('a new note written and given people in one go is ONE note, words and people together', async () => {
    await open(D)
    await click($('#icAddPuck'))
    await type($('.ic-newnote .ic-poppuck-edit'), 'Duty swap list')
    await click($('#icNewNotePpl'))
    expect(notes().length, 'nothing is made while the picker is up').toBe(0)
    const picked = await pickFirst(2)
    expect(notes().length).toBe(1)
    expect(notes()[0].text).toBe('Duty swap list'); expect(notes()[0].ids).toEqual(picked)
    expect($('.ic-newnote'), 'the new-note box has closed').toBeNull()
  })
  it('the picker closed with nobody ticked leaves the words as a note; with no words either, nothing', async () => {
    await open(D)
    await click($('#icAddPuck')); await click($('#icNewNotePpl'))
    expect(($('#icPickOk') as HTMLButtonElement).disabled, 'OK waits for someone to be ticked').toBe(true)
    await click($('#icPickCancel'))
    expect($('.ic-pick')).toBeNull(); expect($('.ic-newnote'), 'the new-note box has closed with it').toBeNull()
    expect(notes().length, 'no words, no people: no note').toBe(0)
    await click($('#icAddPuck'))
    await type($('.ic-newnote .ic-poppuck-edit'), 'Just words')
    await click($('#icNewNotePpl'))
    await click($('#icPickCancel'))
    expect(notes().map((p: any) => [p.text, (p.ids || []).length])).toEqual([['Just words', 0]])
  })
  /* ASTRA'S SCENARIOS (the check of 9 Oct 26) — 2.1: made with the KEYBOARD. Tab from the words goes to "+ people"; that
     must not save the words as a note of their own and take the button away before it can be pressed. */
  it('by keyboard: Tab from the words to "+ people" keeps the note in the making, and Enter there opens the people — ONE note', async () => {
    await open(D)
    await click($('#icAddPuck'))
    const box = $('.ic-newnote .ic-poppuck-edit')!, btn = $('#icNewNotePpl')!
    await type(box, 'Brief at 0800')
    await act(async () => { box.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: btn })) })
    expect(notes().length, 'nothing saved by the Tab').toBe(0)
    expect($('#icNewNotePpl'), 'the button is still there to press').toBeTruthy()
    await click($('#icNewNotePpl'))
    const picked = await pickFirst(2)
    expect(notes().map((p: any) => [p.text, p.ids])).toEqual([['Brief at 0800', picked]])
  })
  it('by keyboard: Tab on past "+ people" leaves the words as a note, as leaving the box does', async () => {
    await open(D)
    await click($('#icAddPuck'))
    const box = $('.ic-newnote .ic-poppuck-edit')!, btn = $('#icNewNotePpl')!
    await type(box, 'Words only')
    await act(async () => { box.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: btn })) })
    await act(async () => { btn.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null })) })
    expect(notes().map((p: any) => [p.text, (p.ids || []).length])).toEqual([['Words only', 0]])
    expect($('.ic-newnote')).toBeNull()
  })
  /* 2.2: the picker belongs to the note it was opened for. Its words are taken when "+ people" is pressed, so nothing
     typed or opened elsewhere while it is up can become this note's words; and Escape ends it as Cancel does. */
  it('the picker shows the new note’s words, and Escape ends it as Cancel does: the words alone become the note', async () => {
    await open(D)
    await click($('#icAddPuck'))
    await type($('.ic-newnote .ic-poppuck-edit'), 'Escape me')
    await click($('#icNewNotePpl'))
    expect($('.ic-pick')!.textContent, 'the words it is for are in sight').toContain('Escape me')
    await act(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })
    expect($('.ic-pick')).toBeNull()
    expect(notes().map((p: any) => [p.text, (p.ids || []).length])).toEqual([['Escape me', 0]])
  })
  it('another note opened for its words while the picker is up cannot lend the new note its words', async () => {
    await act(async () => { addPlanPuck(D, 'Note B'); notify() })
    await open(D)
    await click($('#icAddPuck'))
    await type($('.ic-newnote .ic-poppuck-edit'), 'Note C')
    await click($('#icNewNotePpl'))
    const b = notes().find((p: any) => p.text === 'Note B')!
    await click(tid('idy-note-' + b.id)!.querySelector('[data-ppedit]'))          // the keyboard can reach it under the picker
    const picked = await pickFirst(1)
    expect(notes().find((p: any) => (p.ids || []).length)!.text, 'the new note keeps ITS words').toBe('Note C')
    expect(notes().find((p: any) => (p.ids || []).length)!.ids).toEqual(picked)
    expect(notes().find((p: any) => p.id === b.id)!.ids || [], 'and B gets nobody').toEqual([])
  })
  /* SOL'S READ (the day-window check, 9 Oct 26) — S1: the picker belongs to the note it was opened for until it ends.
     Another note's "+" pressed meanwhile (the keyboard could reach it under the picker) took the picker over and the
     new note's words were lost. */
  it('while the picker is up for a new note, another note’s "+" does not take it over: OK still makes the new note, the other is untouched', async () => {
    await act(async () => { addPlanPuck(D, 'Older note'); notify() })
    await open(D)
    const older = notes()[0]
    await click($('#icAddPuck'))
    await type($('.ic-newnote .ic-poppuck-edit'), 'The new one')
    await click($('#icNewNotePpl'))
    await click(tid('idy-note-' + older.id)!.querySelector('[data-pkadd]'))
    const picked = await pickFirst(1)
    expect(notes().find((p: any) => p.id === older.id)!.ids || [], 'the older note gets nobody').toEqual([])
    expect(notes().filter((p: any) => p.text === 'The new one').map((p: any) => p.ids)).toEqual([picked])
  })
  it('…and Cancel after that still leaves the new note its words', async () => {
    await act(async () => { addPlanPuck(D, 'Older note'); notify() })
    await open(D)
    const older = notes()[0]
    await click($('#icAddPuck'))
    await type($('.ic-newnote .ic-poppuck-edit'), 'Kept words')
    await click($('#icNewNotePpl'))
    await click(tid('idy-note-' + older.id)!.querySelector('[data-pkadd]'))
    await click($('#icPickCancel'))
    expect(notes().map((p: any) => p.text).sort()).toEqual(['Kept words', 'Older note'])
  })
  /* S2: the picker ends with its day. Closing the day with the picker up left the picker standing, and its Cancel,
     Escape or OK then wrote a note onto a day that was no longer open. */
  it('closing the day ends its picker: the new note’s words are kept ONCE, the picker is gone, and nothing is written afterwards', async () => {
    await open(D)
    await click($('#icAddPuck'))
    await type($('.ic-newnote .ic-poppuck-edit'), 'Keep these words')
    await click($('#icNewNotePpl'))
    await click($$('.ic-pickp:not(.already)')[0])
    await click(tid('win-inputsday-x'))
    expect(win(), 'the day is closed').toBeNull()
    expect($('.ic-pick'), 'and its picker with it').toBeNull()
    expect(notes().map((p: any) => [p.text, (p.ids || []).length]), 'the words kept once, the unconfirmed tick dropped').toEqual([['Keep these words', 0]])
    await act(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })
    expect(notes().length, 'nothing more is written').toBe(1)
  })
  /* S3 (D672): a note undone or redone while ANOTHER day's window is open — the window is brought to the note's day,
     as it is for an input (the reveal). It stayed on the other day, over the change. */
  it('a note changed by Undo while another day is open: the day window goes to the note’s day', async () => {
    await act(async () => { addPlanPuck(D, 'Undone and back'); notify() })
    await open('2026-10-08')
    expect(win()!.querySelector('.win-ttl')!.textContent).toContain('8 Oct')
    await act(async () => { requestPlanReveal(D); notify() })
    expect(win()!.querySelector('.win-ttl')!.textContent, 'the window shows the note’s day').toContain('7 Oct')
    expect(win()!.querySelector('.ic-poppuck-txt')!.textContent).toBe('Undone and back')
    /* its own day already open, or no day open: nothing is opened or moved */
    await act(async () => { requestPlanReveal(D); notify() })
    expect(win()!.querySelector('.win-ttl')!.textContent).toContain('7 Oct')
    await click(tid('win-inputsday-x'))
    await act(async () => { requestPlanReveal(D); notify() })
    expect(win(), 'with no day open the month is enough — no window is thrown over it').toBeNull()
  })
  it('emptying the words of a note that has people keeps the note; emptying one that has none changes nothing', async () => {
    const [a] = crew()
    await act(async () => { addPlanPuck(D, 'plain'); addPlanPuck(D, 'with a man', [a]); notify() })
    await open(D)
    const withMan = notes().find((p: any) => p.text === 'with a man')!, plain = notes().find((p: any) => p.text === 'plain')!
    for (const p of [withMan, plain]) {
      await click(tid('idy-note-' + p.id)!.querySelector('[data-ppedit]'))
      const edit = tid('idy-note-' + p.id)!.querySelector('.ic-poppuck-edit')
      await type(edit, '   '); await blur(edit)
    }
    expect(withMan.text, 'the words went; the man stays').toBe(''); expect(withMan.ids).toEqual([a])
    expect(plain.text, 'a note of words alone is not emptied — the cross deletes it').toBe('plain')
  })
  it('the cross deletes the whole note, its people with it', async () => {
    const [a, b] = crew()
    await act(async () => { addPlanPuck(D, 'with two', [a, b]); notify() })
    await open(D)
    await click(tid('idy-note-' + notes()[0].id)!.querySelector('[data-ppdel]'))
    expect(notes().length).toBe(0)
  })
  it('a member reads a note’s words and its people, and has none of its buttons', async () => {
    const [a, b] = crew()
    await act(async () => { addPlanPuck(D, 'for all to read', [a, b]); notify() })
    await act(async () => { setSession({ user: 'us', role: 'main' }); notify() })
    await open(D)
    const box = tid('idy-note-' + notes()[0].id)!
    expect(box.querySelector('.ic-poppuck-txt')!.textContent).toBe('for all to read')
    expect(box.querySelectorAll('.ic-secpk .puck').length).toBe(2)
    expect(box.querySelector('button'), 'no "+", no pencil, no cross').toBeNull()
  })
  it('the month’s cell shows a note’s words and its people', async () => {
    const [a, b] = crew()
    await act(async () => { addPlanPuck(D, 'on the month', [a, b]); notify() })
    const head = $(`[data-ichead="${D}"]`)!
    expect(head.querySelector('.ic-chip.plan')!.textContent).toBe('on the month')
    expect(Array.from(head.querySelectorAll('.ic-pks .ic-pk')).map(x => x.textContent)).toEqual([cs(a), cs(b)])
  })
})
