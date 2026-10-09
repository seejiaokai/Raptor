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
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { storeBackend } from '../engine/hooks'
import { setFlyDays } from '../state/flyplan'
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
    expect(row(own).querySelector('[data-testid="idy-placed"]')!.textContent).toBe(`Placed by ${cs(a)} · 2 Oct 26, 09:10`)
    expect(row(forHim).querySelector('[data-testid="idy-placed"]')!.textContent).toBe(`Placed by ${cs(a)} for ${cs(b)} · 3 Oct 26, 17:20 · changed by ${cs(b)} · 4 Oct 26, 08:05`)
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
  it('"+ Note" and "+ Pucks" are in the window’s top bar, after the date — and no longer in the list under "+ Input"', async () => {
    await open('2026-10-07')
    const bar = win()!.querySelector('.win-bar')!
    expect(bar.querySelector('#icAddPuck'), '+ Note in the bar').toBeTruthy()
    expect(bar.querySelector('#icAddPucks'), '+ Pucks in the bar').toBeTruthy()
    const order = Array.from(bar.children).map(c => c.className.split(' ')[0])
    expect(order.indexOf('win-tools'), 'after the date, before the cross').toBeGreaterThan(order.indexOf('win-ttl'))
    expect(order.indexOf('win-tools')).toBeLessThan(order.indexOf('win-x'))
    expect(win()!.querySelector('.win-body #icAddPuck, .win-body #icAddPucks')).toBeNull()
  })
  it('they still do what they did: "+ Note" opens the note box, "+ Pucks" the people to pick', async () => {
    await open('2026-10-07')
    await click($('#icAddPuck'))
    expect($('.ic-poppuck-edit'), 'the note box').toBeTruthy()
    await click($('#icAddPucks'))
    expect($('.ic-pick'), 'the people to pick').toBeTruthy()
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
    expect($('#icAddPuck')).toBeNull(); expect($('#icAddPucks')).toBeNull()
  })
})
