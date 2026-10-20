// @vitest-environment jsdom
/* [TRK-REFUSALS-UNTESTED] (21 Oct 26) — the chart editor's refusals, each seen working in the running app on 29 Sep 26
   (the IT flow guide's research, D414) and none of them pinned by a gate until now. Each refusal says why and changes
   nothing: the chart's links, the ✓ Save changes mark and the undo list are as they were. Its own file so the Tracker
   engine boots fresh. (A colon in a course name is refused in tracker.test.tsx's "colon relaxation (§8)".)
   - → Connect: a link that exists, a link that would make a loop;
   - Edit lines, a line's end dragged onto a blue point: the same event at both ends, a link that exists, a loop;
   - the Edit poke-ball box's links: no such event, its own prerequisite, a loop;
   - courses: a name already used (add, rename), and the last course cannot be deleted. */
import { beforeAll, afterAll, describe, expect, it } from 'vitest'
import * as core from './app/core.js'
import { initStore, resetSession } from '../state/store'

const C: any = core
const tick = () => new Promise(r => setTimeout(r, 0))
const until = async (f: () => any) => { for (let i = 0; i < 500; i++) { if (f()) return; await tick() } throw new Error('timed out waiting for a dialog') }
/* the next question's words, answered */
async function said(v: any = true) { await until(() => C.dlg); const m = C.dlg.msg; C.dlgClose(v); await tick(); return m }

let board: HTMLElement
beforeAll(async () => {
  initStore()
  resetSession({ user: 'ad', role: 'admin' })
  board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
  await C.init()
  await C.whenLoaded()
  if (C.sylDirty) await C.saveChangesClick()
})
afterAll(() => { board.remove() })

/* the chart as it stands: every event's links, and the marks a change would leave */
const links = () => JSON.stringify(C.SYL.map((e: any) => [e.id, e.prereqs || []]))
const snap = () => ({ links: links(), dirty: C.sylDirty, undo: C.canUndo() })
const kids = (p: string) => C.SYL.filter((e: any) => (e.prereqs || []).includes(p)).map((e: any) => e.id)
/* an event with a prerequisite of its own and two events that need it: q → p → c, p → c2 */
function chain() {
  for (const e of C.SYL) {
    const ks = kids(e.id)
    if ((e.prereqs || []).length && ks.length >= 2) return { q: e.prereqs[0], p: e.id, c: ks[0], c2: ks[1] }
  }
  throw new Error('the chart has no event with a prerequisite and two events after it')
}
const ball = (id: string) => [...document.querySelectorAll('#flowSvg .ball')].find(x => (x as HTMLElement).dataset.id === id) as SVGGElement
const click = (el: Element) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

describe('[TRK-REFUSALS-UNTESTED] — courses', () => {
  it('the last course cannot be deleted: "Keep at least one course."', async () => {
    expect(C.COURSES.length, 'the demo store boots on one course').toBe(1)
    const p = C.delCourse()
    expect(await said()).toBe('Keep at least one course.')
    await p
    expect(C.COURSES.length).toBe(1)
  })
  it('a name already used is refused, adding or renaming; a different name is taken', async () => {
    const home = C.COURSES[0].name, homeId = C.course
    let p = C.addCourse(); await said('tstb')   /* typed in lower case: a course name is upper case */
    await p; await C.whenLoaded()
    expect(C.COURSES.map((c: any) => c.name).sort()).toEqual([home, 'TSTB'].sort())
    const before = JSON.stringify(C.COURSES)
    p = C.addCourse(); await said(home)
    expect(await said(), 'adding a name already used').toBe('A course named ' + home + ' already exists.')
    await p
    expect(JSON.stringify(C.COURSES)).toBe(before)
    p = C.renCourse(); await said(home.toLowerCase())   /* renaming TSTB, the course now open, to the other one's name */
    expect(await said(), 'renaming to a name already used').toBe('A course named ' + home + ' already exists.')
    await p
    expect(JSON.stringify(C.COURSES), 'nothing renamed').toBe(before)
    /* back to one course, on the home course */
    p = C.delCourse(); await said(true); await p; await C.whenLoaded()
    expect(C.COURSES.length).toBe(1)
    expect(C.course).toBe(homeId)
  })
})

describe('[TRK-REFUSALS-UNTESTED] — the Edit poke-ball box\'s links', () => {
  const vals = (l: string) => ({ links: l, text: '', type: 'flight', num: '', crew: '', pre: '' })
  it('no such event, its own prerequisite, a loop: each refused with its reason, the chart unchanged', async () => {
    const { p, c } = chain()
    const was = snap()
    C.openEdit(p)
    expect(await C.saveEdit(vals('NO-SUCH-1, ' + c))).toBe('No such event: NO-SUCH-1')
    expect(await C.saveEdit(vals(p))).toBe('An event cannot be its own prerequisite.')
    expect(await C.saveEdit(vals(c)), c + ' already needs ' + p).toBe('Those links would create a loop.')
    expect(C.editId, 'the box stays open on its event').toBe(p)
    C.closeEdit()
    expect(snap()).toEqual(was)
  })
})

describe('[TRK-REFUSALS-UNTESTED] — Edit chart layout: → Connect and Edit lines', () => {
  beforeAll(() => { C.toggleArrange() })
  afterAll(() => { if (C.arrangeMode) C.toggleArrange() })

  it('→ Connect: a link that exists, and one that would make a loop, are refused; the chart unchanged', async () => {
    const { p, c } = chain()
    C.setTool('connect')
    const was = snap()
    click(ball(p)); click(ball(c))   /* p → c is already a link */
    expect(await said()).toBe('That link already exists.')
    click(ball(c)); click(ball(p))   /* c → p: p already comes before c */
    expect(await said()).toBe('That link would create a loop (“' + c + '” already comes after “' + p + '”).')
    expect(snap()).toEqual(was)
  })

  it('Edit lines: a line\'s end dropped on the same event, on a link that exists, or into a loop is refused; the chart unchanged', async () => {
    const { q, p, c, c2 } = chain()
    C.setTool('editlines')
    /* the screen point of an event's blue point, from the canvas's own pan and zoom (jsdom puts the chart at 0,0) */
    const port = (id: string, side = 'N') => {
      const pt = [...document.querySelectorAll('#flowSvg .port')].find(x => (x as HTMLElement).dataset.id === id && (x as HTMLElement).dataset.side === side)!
      const t = document.getElementById('viewport')!.getAttribute('transform')!
      const m = /translate\(([-\d.]+),([-\d.]+)\) scale\(([\d.]+)\)/.exec(t)!
      return { x: +m[1] + +pt.getAttribute('cx')! * +m[3], y: +m[2] + +pt.getAttribute('cy')! * +m[3] }
    }
    const pointer = (type: string, at: { x: number, y: number }) => {
      const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: at.x, clientY: at.y })
      Object.defineProperty(e, 'pointerType', { value: 'mouse' }); Object.defineProperty(e, 'pointerId', { value: 7 })
      return e
    }
    /* select the line p → c, then carry its arrow end ("to") onto another event's point */
    const dropEnd = (onto: string) => {
      const hit = [...document.querySelectorAll('#flowSvg .edgehit')].find(x => (x as HTMLElement).dataset.p === p && (x as HTMLElement).dataset.c === c)!
      click(hit)
      const h = document.querySelector('#flowSvg .endhandle[data-end="to"]')!
      const to = port(onto)
      h.dispatchEvent(pointer('pointerdown', to))
      window.dispatchEvent(pointer('pointerup', to))
      return C.hintFlash
    }
    const was = snap()
    expect(dropEnd(p), 'p → p').toBe('A link can’t start and end on the same event.')
    expect(dropEnd(c2), 'p → c2 is already a link').toBe('That link already exists.')
    expect(dropEnd(q), 'p → q: q already comes before p').toBe('That would create a loop.')
    expect(snap()).toEqual(was)
  })
})
