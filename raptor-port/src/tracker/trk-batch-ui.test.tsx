// @vitest-environment jsdom
/* THE TRACKER BATCH (D495, 17 Oct 26) — what the chart and the side panel DO. Plan:
   docs/superpowers/plans/2026-10-17-tracker-batch-triage.md. jsdom has no layout, so where a claim is about what a person
   SEES (a name inside the card, the ring round a ball, the landing) the browser walk carries it
   (docs/handpass/2026-10-17-tracker-batch.md); these pin the rules underneath:
   - D980: the arrows' choices along the chart, the ring on the event, Enter opening the pop-up with the keyboard in it
     on the event's own grade, and the keyboard back on the chart (the same event) when the pop-up closes;
   - [TRK-WIREBOARD-REPEAT]: two balls moved in Edit chart layout, and one wheel step still zooms once;
   - [TRK-BALL-OFF-CHART-LEFT]: a ball, or a group, dropped before the chart's start stops at it;
   - D982: each Currency & flex bar's ink comes with its colour — dark on green, amber and red, white on grey;
   - [TRK-KEY-NAME-CLIP]: a name on the key gets no more room than its side of the card has. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import * as core from './app/core.js'
import Pop from './components/Pop.jsx'
import SidePanel from './components/SidePanel.jsx'
import { initStore, resetSession } from '../state/store'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const C: any = core
const tick = () => new Promise(r => setTimeout(r, 0))
function Live({ draw }: { draw: () => any }) { useSyncExternalStore(C.subscribe, C.getVersion); return draw() }
async function render(el: any) {
  const host = document.createElement('div'); host.className = 'host'; document.body.appendChild(host)
  const root = createRoot(host)
  await act(async () => { root.render(el) })
  return { host, root }
}
const key = (el: Element, k: string, extra: any = {}) => act(async () => { el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...extra })) })
const ball = (id: string) => [...document.querySelectorAll('#flowSvg .ball')].find(x => (x as HTMLElement).dataset.id === id) as SVGGElement | undefined
const at = (id: string) => { const t = ball(id)!.getAttribute('transform')!; const m = /translate\(([-\d.]+),([-\d.]+)\)/.exec(t)!; return { x: +m[1] + 29, y: +m[2] + 29 } }
const scale = () => { const m = /scale\(([\d.]+)\)/.exec(document.getElementById('viewport')!.getAttribute('transform') || ''); return m ? +m[1] : NaN }
/* a mouse drag on a ball, by pointer events with screen points */
function drag(id: string, to: { x: number, y: number }) {
  const g = ball(id)!
  const ev = (type: string, x: number, y: number) => { const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y }); Object.defineProperty(e, 'pointerType', { value: 'mouse' }); Object.defineProperty(e, 'pointerId', { value: 1 }); return e }
  g.dispatchEvent(ev('pointerdown', 100, 100))
  g.dispatchEvent(ev('pointermove', (100 + to.x) / 2, (100 + to.y) / 2))
  g.dispatchEvent(ev('pointermove', to.x, to.y))
  g.dispatchEvent(ev('pointerup', to.x, to.y))
}

let board: HTMLElement
beforeAll(async () => {
  initStore()
  resetSession({ user: 'ad', role: 'admin' })
  board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
  await C.init()
  await C.whenLoaded()
})
afterAll(() => { board.remove(); document.querySelectorAll('.host').forEach(h => h.remove()) })

describe('D980 — the chart by keyboard', () => {
  it('→ goes to an event that needs this one, ← back to one it needs, ↓ / ↑ to the event below / above; nowhere to go: null', () => {
    const first = C.firstEventId()
    const right = C.kbdNext(first, 'ArrowRight')
    expect(right, '→ from the first event').toBeTruthy()
    expect(C.byid[right].prereqs, 'an event that needs the first one').toContain(first)
    expect(C.kbdNext(right, 'ArrowLeft'), '← back to the one it needs').toBe(first)
    expect(C.kbdNext(first, 'ArrowLeft'), 'the first event needs nothing: ← goes nowhere').toBeNull()
    const down = C.kbdNext(first, 'ArrowDown')
    expect(down).toBeTruthy()
    const y = (id: string) => at(id).y
    expect(y(down), '↓ is below').toBeGreaterThan(y(first))
    const up = C.kbdNext(down, 'ArrowUp')
    expect(up && y(up), '↑ is above').toBeLessThan(y(down))
  })

  it('a key on the chart rings its event; Enter opens the marking pop-up with the keyboard on the event\'s own grade; Escape gives the keyboard back to the chart, the same event', async () => {
    const { host } = await render(<Live draw={() => <Pop />} />)
    board.focus()
    await key(board, 'ArrowRight')
    const id = C.kbdId
    expect(id).toBeTruthy()
    expect(ball(id)!.querySelector('.kbdring'), 'the ring round the event the keyboard is on').toBeTruthy()
    expect(ball(id)!.querySelector('.kbdring')!.getAttribute('stroke'), "the app's plain blue ring (D876)").toBe('#1E86FF')
    expect(document.querySelectorAll('#flowSvg .kbdring'), 'one ring only').toHaveLength(1)
    await key(board, 'Enter'); await act(async () => { await tick() })
    expect(C.pop && C.pop.id, 'the pop-up opens on that event').toBe(id)
    const g = C.gradeOf(C.active, id) || 0
    expect((document.activeElement as HTMLElement).dataset.g, 'the keyboard is on its grade as it is').toBe(g === 0 ? '0' : g)
    /* Tab stays inside the pop-up */
    const pop = document.getElementById('pop')!
    const all = [...pop.querySelectorAll('button')], last = all[all.length - 1]!; last.focus()
    await key(last, 'Tab')
    expect(document.activeElement, 'Tab from the last control goes round to the first').toBe(all[0])
    await key(all[0]!, 'Tab', { shiftKey: true })
    expect(document.activeElement, 'and Shift+Tab from the first to the last').toBe(last)
    await act(async () => { C.handleEscapeKey(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })) })
    expect(C.pop, 'Escape closes it').toBeNull()
    expect(document.activeElement, 'the keyboard is back on the chart').toBe(board)
    expect(C.kbdId).toBe(id)
    expect(ball(id)!.querySelector('.kbdring'), 'on the same event').toBeTruthy()
    host.remove()
  })

  it('a grade pressed from the keyboard closes the pop-up and the keyboard is back on the chart', async () => {
    const { host } = await render(<Live draw={() => <Pop />} />)
    board.focus(); await key(board, 'Enter'); await act(async () => { await tick() })
    const id = C.pop.id
    const btn = document.querySelector('#pop .opts button[data-g="dco"]') as HTMLButtonElement
    btn.focus()
    await act(async () => { btn.click(); await tick() })
    expect(C.pop).toBeNull()
    expect(C.gradeOf(C.active, id)).toBe('dco')
    expect(document.activeElement).toBe(board)
    host.remove()
  })

  it('in Edit chart layout the arrows are not the chart\'s', async () => {
    C.toggleArrange(); await tick()
    const was = C.kbdId
    await key(board, 'ArrowDown')
    expect(C.kbdId).toBe(was)
    expect(document.querySelectorAll('#flowSvg .kbdring')).toHaveLength(0)
    C.toggleArrange(); await tick()
  })
})

describe('[TRK-WIREBOARD-REPEAT] — balls moved in Edit chart layout, and one wheel step still zooms once', () => {
  it('after two moves a wheel step zooms ×1.16, as before any move', async () => {
    C.toggleArrange(); await tick()
    C.setTool('move')
    const wheel = () => { const svg = document.getElementById('flowSvg')!; const k0 = scale(); svg.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true })); return scale() / k0 }
    const r0 = wheel()
    const ids = C.SYL.slice(0, 2).map((e: any) => e.id)
    for (const id of ids) drag(id, { x: 140, y: 120 })
    const r2 = wheel()
    expect(r0).toBeCloseTo(1.162, 2)
    expect(r2, 'one zoom per wheel step after two moves').toBeCloseTo(r0, 2)
    C.toggleArrange(); await tick()
  })
})

describe('[TRK-BALL-OFF-CHART-LEFT] — nothing dropped before the chart\'s start', () => {
  it('a ball dropped far left of and above the chart stops with its centre at its half-width from both edges', async () => {
    C.toggleArrange(); await tick(); C.setTool('move')
    const id = C.firstEventId()
    drag(id, { x: -5000, y: -5000 })
    const p = at(id)
    expect(p.x).toBeGreaterThanOrEqual(29); expect(p.y).toBeGreaterThanOrEqual(29)
    C.toggleArrange(); await tick()
  })
  it('a picked group stops as a whole, keeping its shape', async () => {
    C.toggleArrange(); await tick(); C.setTool('select')
    const [a, b] = C.SYL.slice(2, 4).map((e: any) => e.id)
    const pa = at(a), pb = at(b)
    C.selectAllClick && C.selectAllClick()
    drag(a, { x: -9000, y: -9000 })
    const qa = at(a), qb = at(b)
    for (const e of C.SYL) { const q = at(e.id); expect(q.x).toBeGreaterThanOrEqual(29 - 0.01); expect(q.y).toBeGreaterThanOrEqual(29 - 0.01) }
    expect(Math.round(qb.x - qa.x), 'the group keeps its shape').toBe(Math.round(pb.x - pa.x))
    expect(Math.round(qb.y - qa.y)).toBe(Math.round(pb.y - pa.y))
    C.setTool('move'); C.toggleArrange(); await tick()
  })
})

describe('D982 — the Currency & flex bars\' ink comes with their colour', () => {
  it('dark words on green, amber and red; white on grey — for every bar each function returns', () => {
    const days = [null, 0, 6, 7, 13, 14, 20, 21, 30, 31, 59, 60, 119, 120, 400]
    for (const d of days) for (const f of [C.flexFor, C.landingCurrency]) {
      const b = f(d)
      expect(b.ink, `${b.txt} on ${b.color}`).toBe(b.color === 'var(--grey)' ? '#fff' : 'var(--bg)')
    }
    expect(C.flexFor(10).color, 'the colours are as they were').toBe('var(--orange)')
    expect(C.flexFor(3).txt, 'the words too').toBe('Current — no flex required')
  })
  it('the side panel draws each bar in its own ink', async () => {
    const { host } = await render(<Live draw={() => <SidePanel zoom={1} />} />)
    const bars = [...host.querySelectorAll('.flexbar')] as HTMLElement[]
    expect(bars.length).toBe(2)
    for (const b of bars) expect(b.style.color, b.textContent || '').toBe(b.style.background.includes('--grey') ? 'rgb(255, 255, 255)' : 'var(--bg)')
    host.remove()
  })
})

describe('[TRK-KEY-NAME-CLIP] — every name of the key inside the card', () => {
  it('a name on the left gets no more room than the left of the card has: its type shrinks, then narrows', () => {
    const left = C.keyFont('HIS STUDENT', 'end', 27, 19)
    expect(left.size).toBeLessThan(19)
    expect(11 * 0.68 * left.size, 'its width fits from the ring to the card\'s left edge').toBeLessThanOrEqual(27 + 95)
    expect(C.keyFont('ABC', 'end', 27, 19), 'a short name keeps its size').toEqual({ size: 19, squeeze: 0 })
    const long = C.keyFont('A VERY LONG STUDENT NAME INDEED', 'end', 27, 19)
    expect(long.size).toBe(12); expect(long.squeeze, 'too long even small: narrowed to the room').toBeGreaterThan(0)
    expect(long.squeeze).toBeLessThanOrEqual(27 + 95)
  })
  it('the key drawn with a long third name carries the smaller type on that name', () => {
    const was = C.roster.slice()
    C.roster.push({ id: 'sKEYLONG', name: 'HIS STUDENT' })
    const html = C.renderKeyBall()
    C.roster.length = 0; for (const r of was) C.roster.push(r)
    const m = /font-size="([\d.]+)"[^>]*>HIS STUDENT</.exec(html)
    expect(m, 'the name is drawn').toBeTruthy()
    expect(+m![1]).toBeLessThan(19)
  })
})
