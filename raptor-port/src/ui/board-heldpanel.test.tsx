// @vitest-environment jsdom
/* THE BOARD'S OTHER ROWS KEEP UP WHILE HE TYPES ON IT ([UI-SLEEK-PASS] round 4's leftovers (4) — walker c's lead, walker
   d's reproduction, 24 Nov 26; the same on `main`). With the Scheduler Board open, an accepted input's start changed in
   its in-place box under Personal Inputs (0900, Tab) saved — the input, the week and that row read 09:00 — but the
   Board's own Ground Programme row for it still read 08:00, and after a second change read the first. The cause: the
   whole day of the Board is ONE panel, and while the caret is anywhere in it (Tab puts it in the next box of the same
   row) the panel was not written at all; the paint after the caret left wrote it. The week writes every block that does
   not hold the caret (W15 — ui/dayswap.ts swapDayAround); the Board now does the same at the grain of its sections, so
   only the section the caret is in waits. */
import { beforeAll, beforeEach, afterAll, afterEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, notify, setSession } from '../state/store'
import { histInit } from '../state/history'
import { DAYS } from '../engine/data'
import { INPUTS, inpId } from '../engine/inputs'
import { SCHED } from '../engine/publish'
import { DPREV, setPage, setBoardDay, PIOPEN } from '../state/view'
import { openScheduler, closeScheduler } from './board'
import { editingText } from './textedit'
import { commitNewInput, draftOf, setInpField } from './inputedit'
import type { PanelKids } from './dayswap'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
let root: Root, host: HTMLDivElement, seed: any
const editableDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'isContentEditable')
const tick = () => act(async () => { await new Promise(r => setTimeout(r, 15)) })
const focus = (el: HTMLElement) => act(async () => { el.focus() })
const tab = async (el: HTMLElement) => {
  const e = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
  await act(async () => { el.dispatchEvent(e) })
  return e
}
beforeAll(() => {
  // jsdom does not implement this browser property (as schedule-tab.test.tsx supplies it)
  Object.defineProperty(HTMLElement.prototype, 'isContentEditable', { configurable: true, get() {
    let el: HTMLElement | null = this
    while (el) { if (el.hasAttribute('contenteditable')) return el.getAttribute('contenteditable') !== 'false'; el = el.parentElement }
    return false
  } })
  initStore()
  seed = structuredClone({ d: DAYS, i: INPUTS, s: SCHED })
})
afterAll(() => {
  if (editableDescriptor) Object.defineProperty(HTMLElement.prototype, 'isContentEditable', editableDescriptor)
  else delete (HTMLElement.prototype as any).isContentEditable
})
beforeEach(async () => {
  DAYS.splice(0, DAYS.length, ...structuredClone(seed.d))
  INPUTS.splice(0, INPUTS.length, ...structuredClone(seed.i))
  Object.keys(SCHED).forEach(k => delete (SCHED as any)[k])
  Object.assign(SCHED, structuredClone(seed.s))
  DPREV.clear(); PIOPEN.clear(); setBoardDay(null)
  setSession({ user: 'a', role: 'admin' }); setPage('viewsched'); histInit()
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setPage('editsched'); notify() })
})
afterEach(async () => {
  await act(async () => { (document.activeElement as HTMLElement)?.blur(); await new Promise(r => setTimeout(r, 20)); closeScheduler(); notify(); root.unmount() })
  host.remove(); vi.restoreAllMocks()
})

/* a Training for one man, 08:00–10:00 on day 0 — on the Ground Programme the moment it is filed — and the Board open */
async function filed() {
  const n = INPUTS.length
  await act(async () => { expect(commitNewInput(draftOf({ person: 'bane', type: 'Training', title: 'Range brief', date: DAYS[0].dt, yr: 2026, allday: false, s: 480, e: 600, remarks: '' }))).toBe(true); notify() })
  expect(INPUTS.length, 'the input was filed').toBe(n + 1)
  const inp: any = INPUTS.find((r: any) => r.title === 'Range brief')
  await act(async () => { PIOPEN.add(0); openScheduler(0); notify() }); await tick()
  const ri = (DAYS[0].ground || []).findIndex((r: any) => r.src === inpId(inp))
  expect(ri, 'the input stands on the Ground Programme').toBeGreaterThanOrEqual(0)
  const ground = (f: string) => host.querySelector(`#sbBoard [data-bfld="gr:0.${ri}.${f}"]`) as HTMLInputElement
  const mine = (f: string) => host.querySelector(`#sbBoard [data-ifld^="${inpId(inp)}"][data-ifld$=".${f}"]`) as HTMLInputElement
  expect(ground('str'), 'the Board draws the Ground Programme row (or this test proves nothing)').toBeTruthy()
  expect(mine('str'), 'and the input’s own row under Personal Inputs').toBeTruthy()
  expect(ground('str').closest('.sb-sec'), 'two different sections of the Board').not.toBe(mine('str').closest('.sb-sec'))
  return { inp, ground, mine }
}
/* what he does: tap the start box, type, Tab — the caret goes on to the End box of the same row */
async function typeStart(box: HTMLInputElement, v: string) {
  await focus(box); box.value = v
  await act(async () => { box.dispatchEvent(new Event('change', { bubbles: true })) })
  await tab(box); await tick()
}

describe('the Board, an input’s start changed in its own box: its Ground Programme row follows at once', () => {
  it('0900 then 0800, each with Tab — the Ground Programme row reads what was saved each time, the caret still in the row', async () => {
    const { inp, ground, mine } = await filed()
    expect(ground('str').value).toBe('08:00')
    await typeStart(mine('str'), '0900')
    expect(inp.s, 'saved').toBe(540)
    expect(editingText(), 'the caret is still in a box of the Board').toBe(true)
    expect(ground('str').value, 'the Ground Programme row of the Board reads the saved time').toBe('09:00')
    await typeStart(mine('str'), '0800')
    expect(inp.s).toBe(480)
    expect(ground('str').value, 'and follows the second change too, not one behind').toBe('08:00')
  })
  it('the row the caret is in is not redrawn under it — the same box, the caret where it was', async () => {
    const { mine } = await filed()
    const end = mine('end')
    await typeStart(mine('str'), '0900')
    expect(document.activeElement, 'Tab took the caret to the End box of the same row').toBe(end)
    expect(end.isConnected && mine('end') === end, 'that box is the same node: the section the caret is in waits').toBe(true)
  })
  /* the held section is remembered as OWED (the D994 batch's lesson, ui/dayswap.ts): the input put back to what that
     section last showed, by another write while the caret is still in the row, still reaches its own row once the caret
     leaves */
  it('the input put back under the caret: the Ground Programme row follows at once, its own row once the caret leaves', async () => {
    const { inp, ground, mine } = await filed()
    await typeStart(mine('str'), '0900')
    expect(ground('str').value).toBe('09:00')
    await act(async () => { expect(setInpField(inp, 'str', '0800')).toBe(true); notify() }); await tick()
    expect(inp.s, 'put back').toBe(480)
    expect(editingText(), 'the caret is still in the row').toBe(true)
    expect(ground('str').value, 'and its Ground Programme row with it, the caret still in the row').toBe('08:00')
    await act(async () => { (document.activeElement as HTMLElement).blur() }); await tick()
    expect(editingText()).toBe(false)
    expect(mine('str').value, 'once the caret has left, its own row shows what is stored').toBe('08:00')
    expect(ground('str').value).toBe('08:00')
  })
})

/* THE SECTIONS ARE MATCHED BY WHICH SECTION THEY ARE, NOT ONLY BY THEIR PLACE (Fable's scenario design, 25 Nov 26 — B1, B2,
   B4): a change that leaves the day with as many sections but in another order or another day — a section dragged (or
   its drag undone), the day arrow pressed with the caret in a box the arrow does not first let go, OIL Earn on a day
   whose sections then number the same — must write nothing while the caret is on the Board, as before this change; a
   write by place alone would draw one section twice and lose another until the caret left. */
describe('the Board under the caret: a change of order or of day writes nothing until the caret leaves', () => {
  const secs = () => [...host.querySelectorAll('#sbBoard > .sb-sec')].map(s => (s as HTMLElement).dataset.secmove)
  it('a section dragged to another place while the caret is in a box: each section once, in one order', async () => {
    const { mine } = await filed()
    await focus(mine('str'))
    expect(editingText(), 'the caret is in the box').toBe(true)
    const before = secs()
    const { moveSectionTo } = await import('../state/store')
    await act(async () => { expect(moveSectionTo(0, 'inputs', 'ground')).toBe(true) }); await tick()
    const now = secs()
    expect(new Set(now).size, `no section drawn twice: ${now.join(' ')}`).toBe(now.length)
    expect(now.slice().sort(), 'none lost').toEqual(before.slice().sort())
    await act(async () => { (document.activeElement as HTMLElement).blur() }); await tick()
    const after = secs()
    expect(after.indexOf('0.inputs'), 'once the caret has left, the new order').toBeLessThan(after.indexOf('0.ground'))
  })
  it('the day changed under a caret in an In-time line: no section of one day drawn beside another day’s', async () => {
    await filed()
    const line = host.querySelector('#sbBoard [data-itline]') as HTMLElement
    expect(line, 'the day draws an In-time line (or this test proves nothing)').toBeTruthy()
    await focus(line)
    expect(editingText()).toBe(true)
    const { boardTab } = await import('./board')
    await act(async () => { boardTab(1) }); await tick()
    const days = new Set(secs().map(k => String(k).split('.')[0]))
    expect([...days], `the sections are of one day: ${secs().join(' ')}`).toHaveLength(1)
  })
})

/* the swap itself, by the panel's children: what is written, what waits, and the fallbacks that write nothing */
describe('dayswap swapKidsAround — the board panel, section by section', () => {
  const panel = (html: string) => { const el = document.createElement('div'); el.innerHTML = html; document.body.append(el); return el }
  it('writes each changed section but the caret’s, which is owed; an unchanged one keeps its node', async () => {
    const { swapKidsAround, kidsOfHTML } = await import('./dayswap')
    const was = '<div class="a">A1</div><div class="b"><input id="k"></div><div class="c">C1</div>'
    const el = panel(was), keep = el.querySelector('#k')!, b = el.children[1], c = el.children[2]
    const r = swapKidsAround(el, '<div class="a">A2</div><div class="b"><input id="k">B2</div><div class="c">C1</div>', kidsOfHTML(was), keep)
    expect(el.children[0]!.textContent, 'a changed section without the caret is written').toBe('A2')
    expect(el.children[1], 'the caret’s section is left standing').toBe(b)
    expect(el.children[2], 'an unchanged one keeps its node').toBe(c)
    expect(r.held, 'something is still owed').toBe(true)
    expect(r.kids!.html[0]).toBe('<div class="a">A2</div>')
    expect(r.kids!.html[1], 'owed, never what it last showed').not.toBe(kidsOfHTML(was).html[1])
    el.remove()
  })
  it('a section added or removed, a word outside any element, nothing known before, or the same number of sections but not the same ones in each place: nothing is written', async () => {
    const { swapKidsAround, kidsOfHTML } = await import('./dayswap')
    const was = '<div class="sb-sec" data-secmove="0.a">A1</div><div class="sb-sec" data-secmove="0.b"><input id="k"></div>'
    const cases: Array<[string, PanelKids | null]> = [
      [was.replace('A1', 'A2') + '<div class="sb-sec" data-secmove="0.c">new</div>', kidsOfHTML(was)],
      [was.replace('A1', 'A2').replace('</div><div', '</div>loose<div'), kidsOfHTML(was)],
      [was.replace('A1', 'A2'), null],
      /* the two sections swapped places (a section dragged, or its drag undone) */
      ['<div class="sb-sec" data-secmove="0.b"><input id="k"></div><div class="sb-sec" data-secmove="0.a">A2</div>', kidsOfHTML(was)],
      /* another day's sections (the day arrow) */
      [was.replace(/"0\./g, '"1.').replace('A1', 'A2'), kidsOfHTML(was)],
      /* the same section, unwrapped (OIL Earn, a read-only board) */
      ['<div class="sb-panel">A2</div><div class="sb-sec" data-secmove="0.b"><input id="k"></div>', kidsOfHTML(was)],
    ]
    for (const [next, prev] of cases) {
      const el = panel(was), first = el.children[0]
      const r = swapKidsAround(el, next, prev, el.querySelector('#k')!)
      expect(r.held).toBe(true)
      expect(el.children[0], `nothing written for ${next}`).toBe(first)
      el.remove()
    }
  })
})
